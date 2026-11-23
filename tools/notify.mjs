// 通知用的精簡資料：收藏電影的通知（web/push.js）每小時要判斷「開放場次了、上映了、快下檔了、影展開始了」，
// 這裡把判斷需要的東西整理成一個小檔（data 分支的 notify.json），Worker 不用自己去讀影城網站。
//   movies：片名鍵 → { s: 1 = 今天有場次（已上映）／0 = 還沒上映但已經排了場次, c: 今天放映的影城數, p: 看過最多的影城數, t: 片名 }
//   fests：影展代碼 → { name, start, end }
//   cs／cc：影城代碼與所在縣市；每部片的 i 是「今天有場次的影城」在 cs 裡的編號（給「只算某些縣市／收藏的影城」用）
// 用法：node tools/notify.mjs <上一份 notify.json> <這次的 festival.json> <輸出檔> [這次的 tw-near.json] [這次的 official.json]
import fs from "node:fs";
import { buildSync } from "esbuild";
import { DOMParser } from "linkedom";

const [prevPath, festPath, outPath = "notify.json", nearPath = "", officialPath = ""] = process.argv.slice(2);
const mem = {};
const built = buildSync({ stdin: { contents: 'export * from "./core"; export { setPlatform } from "./platform";', resolveDir: new URL("../src", import.meta.url).pathname, loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral", define: { APP_VERSION: '"server"' } });
const core = await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));
core.setPlatform({
  fetchText: async (url, headers) => { const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) }); return { status: r.status, body: await r.text() }; },
  runInWebView: async (body) => new Function("DOMParser", body)(DOMParser),
  loadSettingsJSON: async () => null,
  saveSettingsJSON() {},
  cacheGet: (k) => mem[k] ?? null,
  cacheSet: (k, v) => { mem[k] = v; },
  cachedImage: () => null,
  cacheImage: async () => null,
});
// 上映日期要用伺服器查好的那一份（meta.json），「還沒上映／已上映」才分得對，所以這裡不關掉它

const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return null; } };
const prev = read(prevPath) || { movies: {} };
const list = await core.loadMovies();
if (list.length < 20) { console.log(`片單太短（${list.length}），這次不更新通知資料`); process.exit(0); }
const movies = {};
for (const m of list) {
  const k = core.communityKey(m.title);
  if (!k) continue;
  const old = (prev.movies || {})[k];
  const c = m.comingSoon || m.noShowToday ? 0 : m.cinemaCount || 0;
  const cur = movies[k];
  // 同一把鍵有兩筆（片名帶不同裝飾字）：合在一起看
  movies[k] = { t: (cur && cur.t) || m.title, s: (cur && cur.s) || (m.comingSoon ? 0 : 1), c: Math.max(cur ? cur.c : 0, c), p: Math.max(cur ? cur.p : 0, old ? old.p || 0 : 0, c) };
}
// 今天沒場次但還在上映的片（noShowToday）c 會是 0：不能因此判成「快下檔」，所以 c 是 0 的沿用上一次的數字
for (const k of Object.keys(movies)) if (movies[k].s === 1 && movies[k].c === 0) movies[k].c = Math.max(((prev.movies || {})[k] || {}).c || 0, 4);
// 各影城今天的片單（場次通的 66 間連鎖，加上讀官網的幾間）→ 每部片今天在哪些影城放映
const cs = [], cc = [];
try {
  const today = core.todayTPE();
  const cityOf = {};
  for (const c of await core.loadCinemas()) cityOf[c.id] = c.city;
  const add = (cinemaId, titles) => {
    let idx = -1;
    for (const title of titles) {
      const m = movies[core.communityKey(title)];
      if (!m || m.s !== 1) continue;
      if (idx < 0) { idx = cs.indexOf(cinemaId); if (idx < 0) { idx = cs.push(cinemaId) - 1; cc.push(cityOf[cinemaId] || ""); } }
      (m.i ||= []);
      if (m.i.indexOf(idx) < 0) m.i.push(idx);
    }
  };
  const near = read(nearPath);
  for (const [id, days] of Object.entries((near && near.days) || {})) add(id, ((days[today] || {}).movies || []).map((x) => x.title));
  const off = read(officialPath);
  for (const [id, d] of Object.entries((off && off.cinemas) || {})) add(id, (((d.schedules || {})[today]) || []).map((x) => x.title));
} catch (e) { console.log("各影城的明細這次沒有（只能算全台）：" + String(e.message || e)); }
const fests = {};
for (const f of ((read(festPath) || {}).festivals) || []) fests[f.id] = { name: f.name, start: f.start, end: f.end };
fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), cs, cc, movies, fests }) + "\n");
console.log(`通知資料：${Object.keys(movies).length} 部片（已上映 ${Object.values(movies).filter((m) => m.s).length}）、${Object.keys(fests).length} 個影展、${cs.length} 間影城有明細；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
