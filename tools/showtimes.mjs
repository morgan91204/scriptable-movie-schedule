// 秀泰影城官網的完整場次：場次通只列最近 6、7 天，而且有時漏掉特別場；
// 秀泰官網開站時讀的那一份公開資料（一個請求）裡有全部 15 間影城、所有已經開賣的日期（含預售、特別場）。
// 每小時讀一次，整理成跟場次通一樣的格式，App 打開秀泰的影城時拿來補「場次通沒有的日期和場次」。
// 用法：node tools/showtimes.mjs <這次的 tw-near.json> <輸出檔> [測試用：已經存好的官網資料檔]
//   影城對照：場次通每間秀泰的訂票網址帶有官網的影城代號（…#corp=91），直接拿來對，不用手動維護名單。
//   只讀公開的場次資料，不碰訂票、會員那些路徑；讀不到或格式變了就不輸出（App 照舊用場次通）。
import fs from "node:fs";

const [nearPath, outPath = "showtimes.json", samplePath = ""] = process.argv.slice(2);
const URL_BOOT = "https://capi.showtimes.com.tw/4/app/bootstrap";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const RATING = { g: "普遍級", p: "保護級", pg12: "輔12級", pg15: "輔15級", r: "限制級" };

const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return null; } };
const bail = (msg) => { console.log(`秀泰官網場次：${msg}，這次不更新`); process.exit(0); };

// 官網的影城代號 → 場次通的影城代碼
const near = read(nearPath);
const idOf = {};
for (const [id, days] of Object.entries(near?.days || {}))
  for (const d of Object.values(days || {})) {
    const m = /showtimes\.com\.tw\/.*[#?&]corp=(\d+)/.exec(String(d?.booking || ""));
    if (m) idOf[m[1]] = id;
  }
if (!Object.keys(idOf).length) bail("場次通的資料裡找不到秀泰的影城對照");

let payload = null;
try {
  if (samplePath) payload = read(samplePath)?.payload;
  else {
    const r = await fetch(URL_BOOT, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(40000) });
    if (r.status !== 200) bail(`官網回應 ${r.status}`);
    payload = (await r.json())?.payload;
  }
} catch (e) { bail(`讀不到（${e.message}）`); }
if (!payload || !Array.isArray(payload.programs) || typeof payload.eventsForCorporations !== "object") bail("格式跟預期的不一樣");

// 片名寫法跟場次通對齊（半形的冒號、括號、驚嘆號、問號），同一部片在不同影城才不會變成兩種寫法
const tidy = (s) => String(s || "").replace(/：/g, ":").replace(/（/g, "(").replace(/）/g, ")").replace(/！/g, "!").replace(/？/g, "?").replace(/\s+/g, " ").trim();
const programs = {};
for (const p of payload.programs) programs[p.id] = p;
const names = payload.programs.map((p) => String(p.name || "")).filter(Boolean).sort((a, b) => b.length - a.length);
/** 特別場的節目名稱是「片名 ＋ 場次名稱」（黑球 跨世遺愛場、XX (國語版)）：片名那一段如果就是另一個節目，就拆成 片名＋場次名稱，
 *  這樣它會排在同一部片底下（跟場次通的做法一樣），評分、海報也才對得到。
 *  官網沒標成特別場的，後面那段要像場次名稱（…場、…版）才拆，免得把「XX 2」這種續集拆錯 */
const split = (p) => {
  const name = String(p.name || "");
  const base = names.find((n) => n !== name && name.startsWith(n + " "));
  if (base) {
    const tag = tidy(name.slice(base.length)).replace(/^\((.+)\)$/, "$1");
    if (tag && (p.meta?.isSpecial || /[場版]$/.test(tag))) return { title: tidy(base), tag };
  }
  return { title: tidy(name), tag: "" };
};
const pad = (n) => String(n).padStart(2, "0");
/** 開演時間（UTC）→ 台灣時間的 日期、時:分 */
const tpe = (iso) => { const d = new Date(Date.parse(iso) + 8 * 3600e3); return { day: d.toISOString().slice(0, 10), time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` }; };

const today = tpe(new Date().toISOString()).day;
const cinemas = {};
let total = 0;
for (const [corp, data] of Object.entries(payload.eventsForCorporations)) {
  const id = idOf[corp];
  if (!id || !Array.isArray(data?.events)) continue;
  const schedules = {};
  for (const e of data.events) {
    const p = programs[e.programId];
    if (!p || e.status !== "active" || !e.startedAt) continue;
    const at = tpe(e.startedAt);
    // 片單日期用實際開演的那一天：官網把凌晨場算在前一天（listedAt），場次通算在當天，這裡跟場次通一樣
    const day = at.day;
    if (day < today) continue;
    const { title, tag } = split(p);
    const label = [tag, tidy(e.meta?.format)].filter(Boolean).join(" ") || "一般場";
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title);
    if (!m) list.push((m = { title, runtime: Math.round((Number(p.duration) || 0) / 60), rating: RATING[p.rating] || "", versions: [] }));
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push((v = { label, times: [] }));
    if (v.times.indexOf(at.time) < 0) { v.times.push(at.time); total++; }
  }
  for (const list of Object.values(schedules)) for (const m of list) for (const v of m.versions) v.times.sort();
  if (Object.keys(schedules).length) cinemas[id] = { schedules };
}
if (!Object.keys(cinemas).length || total < 50) bail(`只整理出 ${total} 場，太少了`);
fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), cinemas }) + "\n");
const days = new Set(Object.values(cinemas).flatMap((c) => Object.keys(c.schedules)));
console.log(`秀泰官網場次：${Object.keys(cinemas).length} 間、${days.size} 個日期（到 ${[...days].sort().pop()}）、${total} 場；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
