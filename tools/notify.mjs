// 通知用的精簡資料：收藏電影通知（web/push.js）每小時要判斷「開放場次了、上映了、快下檔了、影展開始了」，
// 這裡把判斷需要的東西整理成一個小檔（data 分支的 notify.json），Worker 不用自己去讀影城網站。
//   movies：片名鍵 → { s: 1 = 今天有場次（已上映）／0 = 還沒上映但已經排了場次, c: 今天放映的影城數, p: 看過最多的影城數, t: 片名 }
//   fests：影展代碼 → { name, start, end }
//     另外：r 上映日期、g 評分（i IMDb、t 番茄、p 爆米花）、f 這幾天有場次的特殊廳（IMAX、杜比…）、j 這幾天（今天和明天）有場次的影城編號
//   up：還沒有場次、只知道上映日期的片（片名鍵 → { t, r }），給「上映前提醒」和「每週新片」用
//   fests 的 n：這個影展目前有幾部片（片單公布了沒）
//   cs／cc：影城代碼與所在縣市；每部片的 i 是「今天有場次的影城」在 cs 裡的編號（給「只算某些縣市／收藏影城」用）
// 用法：node tools/notify.mjs <上一份 notify.json> <這次的 festival.json> <輸出檔> [這次的 tw-near.json] [這次的 official.json] [這次的 upcoming.json]
import fs from "node:fs";
import { buildSync } from "esbuild";
import { DOMParser } from "linkedom";

const [prevPath, festPath, outPath = "notify.json", nearPath = "", officialPath = "", upcomingPath = ""] = process.argv.slice(2);
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
  const r = (cur && cur.r) || (/^\d{4}-\d{2}-\d{2}/.test(m.release || "") ? m.release.slice(0, 10) : "");
  if (r) movies[k].r = r;
  const g = { ...((cur && cur.g) || {}) };
  if (m.score && !m.scoreFew) g.i = m.score;
  if (typeof m.tomato === "number") g.t = m.tomato;
  if (typeof m.popcorn === "number") g.p = m.popcorn;
  if (Object.keys(g).length) movies[k].g = g;
}
// 今天沒場次但還在上映的片（noShowToday）c 會是 0：不能因此判成「快下檔」，所以 c 是 0 的沿用上一次的數字
for (const k of Object.keys(movies)) if (movies[k].s === 1 && movies[k].c === 0) movies[k].c = Math.max(((prev.movies || {})[k] || {}).c || 0, 4);
// 各影城今天的片單（場次通的 66 間連鎖，加上讀官網的幾間）→ 每部片今天在哪些影城放映
const cs = [], cc = [], cn = []; // cn = 影城名稱（「收藏影城每週新片」的通知文字要用）
try {
  const today = core.todayTPE();
  const cityOf = {}, nameOf = {};
  for (const c of await core.loadCinemas()) { cityOf[c.id] = c.city; nameOf[c.id] = c.name; }
  const idxOf = (cinemaId) => { let idx = cs.indexOf(cinemaId); if (idx < 0) { idx = cs.push(cinemaId) - 1; cc.push(cityOf[cinemaId] || ""); cn.push(nameOf[cinemaId] || ""); } return idx; };
  /** 一間影城某一天的片單：isToday 的記進 i（今天有場次，只算已上映的片）；每一天都記進 j（這幾天有場次）和 f（特殊廳） */
  const add = (cinemaId, list, isToday, withFormats) => {
    for (const x of list) {
      const m = movies[core.communityKey(x.title)];
      if (!m) continue;
      const idx = idxOf(cinemaId);
      if (isToday && m.s === 1) { (m.i ||= []); if (m.i.indexOf(idx) < 0) m.i.push(idx); }
      (m.j ||= []);
      if (m.j.indexOf(idx) < 0) m.j.push(idx);
      if (withFormats) for (const v of x.versions || []) for (const f of core.formatsOf(String(v.label || ""))) { (m.f ||= []); if (m.f.indexOf(f) < 0) m.f.push(f); }
    }
  };
  const near = read(nearPath);
  for (const [id, days] of Object.entries((near && near.days) || {})) for (const [date, day] of Object.entries(days)) if (date >= today) add(id, (day && day.movies) || [], date === today, true);
  const off = read(officialPath);
  // 讀官網的幾間（誠品、光點…）：廳名不是特殊廳的名稱，不算特殊廳
  for (const [id, d] of Object.entries((off && off.cinemas) || {})) for (const [date, list] of Object.entries(d.schedules || {})) if (date >= today && date <= core.addDays(today, 1)) add(id, list || [], date === today, false);
} catch (e) { console.log("各影城的明細這次沒有（只能算全台）：" + String(e.message || e)); }
const fests = {};
for (const f of ((read(festPath) || {}).festivals) || []) fests[f.id] = { name: f.name, start: f.start, end: f.end, n: Array.isArray(f.films) ? f.films.length : 0 };
// 還沒有場次的片（開眼的近期上映片單）：只留片名和上映日期
const up = {};
const todayISO = core.todayTPE();
for (const f of ((read(upcomingPath) || {}).films) || []) {
  const k = core.communityKey(f.title || "");
  if (!k || movies[k] || up[k] || !/^\d{4}-\d{2}-\d{2}$/.test(f.release || "") || f.release <= todayISO) continue;
  up[k] = { t: f.title, r: f.release, ...(f.approx ? { a: 1 } : {}) };
}
fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), cs, cc, cn, movies, up, fests }) + "\n");
console.log(`通知資料：${Object.keys(movies).length} 部片（已上映 ${Object.values(movies).filter((m) => m.s).length}）、${Object.keys(fests).length} 個影展、${cs.length} 間影城有明細；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
