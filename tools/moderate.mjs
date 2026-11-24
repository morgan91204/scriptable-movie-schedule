// 短評管理（站長用）：列出被檢舉的短評、隱藏、還原、刪除，或從備份匯回。
// 只由 GitHub Actions 的「短評管理」執行：它每次臨時產生一把金鑰、設到評分伺服器上、做完就換掉，金鑰不存在任何地方。
// 用法：ADMIN_KEY=… node tools/moderate.mjs <flagged|hide|restore|delete|import> [片名鍵] [短評編號] [備份的 notes.json]
import fs from "node:fs";
const API = "https://movie-ratings.twmovietime.workers.dev/admin";
const [op = "flagged", movie = "", id = "", file = ""] = process.argv.slice(2);
const key = process.env.ADMIN_KEY || "";
if (key.length < 32) throw new Error("沒有管理金鑰");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** 金鑰剛設上去要幾秒才生效：對不上（404）就等一下再試 */
async function call(body) {
  for (let i = 0; i < 12; i++) {
    const r = await fetch(API, { method: "POST", headers: { "content-type": "application/json", "x-admin-key": key }, body: JSON.stringify(body) });
    if (r.status === 404) { await sleep(5000); continue; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`伺服器回應 ${r.status}：${j.error || ""}`);
    return j;
  }
  throw new Error("金鑰一直沒有生效，請再跑一次");
}
const out = [];
const say = (s) => { console.log(s); out.push(s); };
const WHY = { spoiler: "劇透", abuse: "不當內容", spam: "廣告" };
async function listFlagged() {
  const { flagged } = await call({ op: "flagged" });
  const keys = Object.keys(flagged || {});
  if (!keys.length) return say("目前沒有被檢舉或被隱藏的短評。");
  say("| 片名鍵 | 編號 | 狀態 | 檢舉 | 內容 |\n|---|---|---|---|---|");
  for (const k of keys)
    for (const n of flagged[k]) {
      const state = n.hidden ? "已隱藏" : n.keep ? "已還原（不再自動隱藏）" : n.sp ? "顯示中（已摺疊）" : "顯示中";
      const why = Object.entries(n.why || {}).map(([w, c]) => `${WHY[w] || w}×${c}`).join("、") || "—";
      say(`| ${k} | ${n.id} | ${state} | ${why} | ${String(n.x).replace(/\|/g, "｜")} |`);
    }
  say("\n處理方式：再跑一次「短評管理」，動作選 hide（隱藏）／restore（還原）／delete（刪除），填上面的片名鍵和編號。");
}
if (op === "flagged") await listFlagged();
else if (op === "hide" || op === "restore" || op === "delete") {
  if (!movie || !/^\d+$/.test(id)) throw new Error("要填片名鍵和短評編號（先用 flagged 列出來看）");
  const r = await call({ op, m: movie, id: Number(id) });
  say(`已${{ hide: "隱藏", restore: "還原", delete: "刪除" }[op]}「${movie}」的第 ${id} 則（這部片還有 ${r.left} 則短評）。\n`);
  await listFlagged();
} else if (op === "import") {
  const data = JSON.parse(fs.readFileSync(file, "utf8")).movies || {};
  let total = 0;
  for (const [k, notes] of Object.entries(data)) {
    if (movie && k !== movie) continue;
    const r = await call({ op: "import", m: k, notes });
    if (r.added) say(`「${k}」匯回 ${r.added} 則`);
    total += r.added || 0;
  }
  say(`共匯回 ${total} 則短評（已經有的不會重複加）。`);
} else throw new Error("不認得的動作：" + op);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.join("\n") + "\n");
