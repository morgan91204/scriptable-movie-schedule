// 年度票房排行的海報：排行上有七千多部片（2016 年至今），大多已經下檔，場次通、開眼都查不到。
// 手機自己一部一部上網猜又慢又容易配錯（同名的別部片），所以由伺服器用 TMDB 先查好：
// 中文片名要「完全相同」才算，同名多部時用年份和評分人數挑。查到的海報存成一份對照表（data 分支的 posters.json），
// App 開年度排行時讀這一份，清單直接有海報。
// 查過的不再查：找到的永久記著；找不到的記在 posters-miss.json，30 天後才再試一次。
// 用法：TMDB_TOKEN=… node tools/posters.mjs <上一份 posters.json> <上一份 posters-miss.json> <輸出 posters.json> <輸出 posters-miss.json>
import fs from "node:fs";
import { buildSync } from "esbuild";

const [prevPath, prevMissPath, outPath = "posters.json", outMissPath = "posters-miss.json"] = process.argv.slice(2);
const TOKEN = (process.env.TMDB_TOKEN || "").trim();
if (!TOKEN) { console.log("沒有 TMDB 金鑰，略過年度排行海報"); process.exit(0); }
const MAX = Number(process.env.POSTERS_MAX) || 3000; // 一次最多查幾部（第一次要分幾輪跑完）
const DAY = 86400e3, now = Date.now();

// 片名比對、簡化用跟 App 同一套（src/core.ts）
const built = buildSync({ stdin: { contents: 'export { normTitle, baseTitle, searchTitles } from "./core";', resolveDir: new URL("../src", import.meta.url).pathname, loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral", define: { APP_VERSION: '"server"' } });
const core = await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));

const read = (p, d) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return d; } };
const posters = (read(prevPath, {}).posters) || {}; // 片名鍵|上映年 → TMDB 海報路徑（/xxxx.jpg）
const miss = (read(prevMissPath, {}).miss) || {}; // 片名鍵|上映年 → 上次查不到的時間
const years = JSON.parse(fs.readFileSync(new URL("../dist/boxoffice-years.json", import.meta.url), "utf8")).years;

/** 對照表的鍵：去掉標點空白的片名｜上映年（同名不同年的片分開記） */
export const posterKey = (name, release) => `${core.normTitle(name)}|${String(release || "").slice(0, 4)}`;

const todo = [];
const seen = new Set();
for (const y of Object.keys(years).sort().reverse()) { // 新的年份先查
  for (const x of years[y]) {
    const k = posterKey(x.name, x.release);
    if (seen.has(k)) continue;
    seen.add(k);
    if (posters[k] || (miss[k] && now - miss[k] < 30 * DAY)) continue;
    todo.push({ k, name: x.name, year: Number(String(x.release || "").slice(0, 4)) || 0 });
  }
}
console.log(`年度排行共 ${seen.size} 部（不重複）；已有海報 ${Object.keys(posters).length}、查過沒有 ${Object.keys(miss).length}；這次要查 ${Math.min(todo.length, MAX)}／${todo.length}`);

const same = (s) => core.normTitle(String(s || "")).replace(/臺/g, "台").replace(/祕/g, "秘").replace(/爲/g, "為");
const yearOf = (x) => Number(String(x.release_date || "").slice(0, 4)) || 0;
const votes = (x) => Number(x.vote_count) || 0;
const byVotes = (list) => list.slice().sort((a, b) => votes(b) - votes(a))[0];
let asked = 0, limited = 0;
async function search(q) {
  for (let attempt = 0; attempt < 3; attempt++) {
    asked++;
    const r = await fetch(`https://api.themoviedb.org/3/search/movie?language=zh-TW&query=${encodeURIComponent(q)}`, { headers: { accept: "application/json", Authorization: "Bearer " + TOKEN }, signal: AbortSignal.timeout(25000) });
    if (r.status === 429) { limited++; await new Promise((res) => setTimeout(res, 2000 * (attempt + 1))); continue; } // 太快了：等一下再試
    if (!r.ok) throw new Error("TMDB " + r.status);
    return (await r.json()).results || [];
  }
  throw new Error("TMDB 429");
}
/** 找這部片的海報路徑；找不到回傳空字串；連線出錯丟例外（不算「查過沒有」） */
async function find(name, year) {
  const tries = core.searchTitles(name);
  const want = Array.from(new Set([same(name), ...tries.map(same)].filter(Boolean)));
  for (const q of tries) {
    const hits = (await search(q)).filter((x) => x.poster_path && (want.indexOf(same(x.title)) >= 0 || want.indexOf(same(x.original_title)) >= 0));
    if (!hits.length) continue;
    // 同名多部（跟 tools/meta.mjs 同一套挑法）：年份只差一年以內的是那一年的新片；
    // 但它沒人評分、另一部同名的很有名 → 多半是舊片重映；沒有年份接近的 → 舊片重映，挑最多人評分的
    const near = year ? hits.filter((x) => yearOf(x) && Math.abs(yearOf(x) - year) <= 1) : [];
    const famousOther = hits.some((x) => near.indexOf(x) < 0 && votes(x) >= 100);
    const hit = near.length && (votes(byVotes(near)) >= 1 || !famousOther) ? byVotes(near) : byVotes(hits);
    return /^\/[\w.-]+$/.test(hit.poster_path) ? hit.poster_path : "";
  }
  return "";
}

const queue = todo.slice(0, MAX);
let found = 0, none = 0, failed = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let m = queue.shift(); m; m = queue.shift()) {
    try {
      const p = await find(m.name, m.year);
      if (p) { posters[m.k] = p; delete miss[m.k]; found++; }
      else { miss[m.k] = now; none++; }
    } catch (_) { failed++; }
  }
}));
for (const k of Object.keys(miss)) if (!seen.has(k)) delete miss[k]; // 已經不在排行上的清掉
const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
// 不放時間戳：內容沒變就不會產生新的提交
fs.writeFileSync(outPath, JSON.stringify({ posters: sorted(posters) }) + "\n");
fs.writeFileSync(outMissPath, JSON.stringify({ miss: sorted(miss) }) + "\n");
console.log(`這次問了 TMDB ${asked} 次（被要求放慢 ${limited} 次）：找到 ${found}、沒有 ${none}、連線失敗 ${failed}；對照表共 ${Object.keys(posters).length} 部，檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
