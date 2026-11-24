// 年度票房排行的三大評分（IMDb、番茄指數、爆米花指數）：排行上有七千多部片（2016 年至今），大多已經下檔。
// 一次全部查會對 IMDb、爛番茄造成負擔，也容易被擋，所以「慢慢查」：每小時只查幾十部，一部一部隔開，幾天查完。
// 查過的就固定存下來（data 分支的 ratings-years.json），之後只查新出現的片；近半年上映的片分數還會變，每兩週重查一次。
// 做法：先用 TMDB 確認「這是哪一部片」（中文片名要完全相同，跟 tools/meta.mjs 同一套規則），拿到 IMDb 編號、英文片名、年份，
//       再用 App 自己的查法（src/core.ts 的 ratingsOfIdent）查 IMDb 的公開評分檔和爛番茄的影片頁。
// 連續讀不到（對方擋了或網路有問題）就提早結束這一輪，不硬試。
// 用法：TMDB_TOKEN=… node tools/ratings-years.mjs <上一份 ratings-years.json> <輸出檔>      RATINGS_MAX=一輪查幾部（預設 60）
import fs from "node:fs";
import { buildSync } from "esbuild";
import { DOMParser } from "linkedom";
import { cleanIntro } from "./intro-text.mjs";

const [prevPath, outPath = "ratings-years.json"] = process.argv.slice(2);
const TOKEN = (process.env.TMDB_TOKEN || "").trim();
if (!TOKEN) { console.log("沒有 TMDB 金鑰，略過年度排行的評分"); process.exit(0); }
const MAX = Number(process.env.RATINGS_MAX) || 60;
const DAY = 86400e3, now = Date.now(), today = Math.floor(now / DAY);

const mem = {};
const built = buildSync({ stdin: { contents: 'export * from "./core"; export { setPlatform } from "./platform";', resolveDir: new URL("../src", import.meta.url).pathname, loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral", define: { APP_VERSION: '"server"' } });
const core = await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));
core.setPlatform({
  fetchText: async (url, headers, opts) => {
    const r = await fetch(url, { headers, method: opts?.method || "GET", body: opts?.body, signal: AbortSignal.timeout(25000) });
    return { status: r.status, body: await r.text() };
  },
  runInWebView: async (body) => new Function("DOMParser", body)(DOMParser),
  loadSettingsJSON: async () => null,
  saveSettingsJSON() {},
  cacheGet: (k) => mem[k] ?? null,
  cacheSet: (k, v) => { mem[k] = v; },
  cachedImage: () => null,
  cacheImage: async () => null,
});
core.setMetaEnabled(false);

const read = (p, d) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return d; } };
const prev = read(prevPath, {});
/** 片名鍵|上映年 → { id: IMDb 編號, i: IMDb 分數, v: 評分人數, t: 番茄指數, c: 1 = 新鮮認證, p: 爆米花指數, u: 爛番茄網址的片名代稱, a: 查詢日（從 1970 起算的天數） }
 *  查過但沒有任何評分的只有 id 和 a */
const ratings = prev.ratings || {};
/** TMDB 上找不到是哪一部片的：片名鍵|上映年 → 查詢日（60 天後再試） */
const miss = prev.miss || {};
const years = JSON.parse(fs.readFileSync(new URL("../dist/boxoffice-years.json", import.meta.url), "utf8")).years;
export const ratingKey = (name, release) => `${core.normTitle(name)}|${String(release || "").slice(0, 4)}`;

const todo = [];
const seen = new Set();
for (const y of Object.keys(years).sort().reverse()) { // 新的年份先查
  for (const x of years[y]) {
    const k = ratingKey(x.name, x.release);
    if (seen.has(k)) continue;
    seen.add(k);
    const old = ratings[k];
    const fresh = Date.parse(x.release || "") > now - 180 * DAY; // 近半年上映的片分數還在變
    // 爆米花 90% 以上的才可能是「認證熱門」：這個標記是後來才開始記的（x = 1 表示查過），沒查過的補查一次
    const needHot = old && old.p >= 90 && !old.x;
    if (old && !needHot && !(fresh && today - (old.a || 0) >= 14)) continue;
    if (!old && miss[k] && today - miss[k] < 60) continue;
    todo.push({ k, name: x.name, year: Number(String(x.release || "").slice(0, 4)) || 0, redo: !!old });
  }
}
// 沒查過的優先，重查的排後面
todo.sort((a, b) => Number(a.redo) - Number(b.redo));
console.log(`年度排行共 ${seen.size} 部（不重複）；已有評分紀錄 ${Object.keys(ratings).length}、找不到是哪部片 ${Object.keys(miss).length}；還要查 ${todo.length}，這一輪查 ${Math.min(todo.length, MAX)}`);

const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
const same = (s) => core.normTitle(String(s || "")).replace(/臺/g, "台").replace(/祕/g, "秘").replace(/爲/g, "為");
const tmdb = async (path) => {
  const r = await fetch("https://api.themoviedb.org/3" + path, { headers: { accept: "application/json", Authorization: "Bearer " + TOKEN }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error("TMDB " + r.status);
  return r.json();
};
/** 用 TMDB 確認是哪一部片（跟 tools/meta.mjs 的 tmdbIdentify 同一套挑法）；找不到回傳 null */
async function identify(title, releaseYear) {
  const tries = core.searchTitles(title);
  const want = Array.from(new Set([same(title), ...tries.map(same)].filter(Boolean)));
  const yearOf = (x) => Number(String(x.release_date || "").slice(0, 4)) || 0;
  const votes = (x) => Number(x.vote_count) || 0;
  const byVotes = (list) => list.slice().sort((x, y) => votes(y) - votes(x))[0];
  for (const q of Array.from(new Set([...tries, title].filter(Boolean)))) {
    const hits = ((await tmdb(`/search/movie?language=zh-TW&query=${encodeURIComponent(q)}`)).results || []).filter((x) => want.indexOf(same(x.title)) >= 0 || want.indexOf(same(x.original_title)) >= 0);
    if (!hits.length) continue;
    const near = releaseYear ? hits.filter((x) => yearOf(x) && Math.abs(yearOf(x) - releaseYear) <= 1) : [];
    const famousOther = hits.some((x) => near.indexOf(x) < 0 && votes(x) >= 100);
    const hit = near.length && (votes(byVotes(near)) >= 1 || !famousOther) ? byVotes(near) : byVotes(hits);
    const d = await tmdb(`/movie/${hit.id}?language=en-US&append_to_response=external_ids`);
    const id = /^tt\d+$/.test((d.external_ids || {}).imdb_id || "") ? d.external_ids.imdb_id : "";
    return id ? { id, name: String(d.title || d.original_title || ""), year: yearOf(d) || yearOf(hit) } : null;
  }
  return null;
}

// 幾條線同時查（RATINGS_LANES，預設 1）：每條線自己一部一部隔開；連續讀不到太多次就全部停下來
const LANES = Math.max(1, Math.min(4, Number(process.env.RATINGS_LANES) || 1));
const GAP = Number(process.env.RATINGS_GAP_MS) || 2500;
const STOP_AT = now + (Number(process.env.RATINGS_MINUTES) || 15) * 60e3; // 這一輪最多跑多久（留時間發佈）
let done = 0, found = 0, none = 0, unknown = 0, failed = 0, streak = 0, stopped = "";
const queue = todo.slice(0, MAX);
await Promise.all(Array.from({ length: LANES }, async (_, lane) => {
  await new Promise((r) => setTimeout(r, lane * (GAP / LANES))); // 各條線錯開
  for (let m = queue.shift(); m; m = queue.shift()) {
    if (streak >= 8) { stopped = "連續 8 部讀不到（可能被擋或網路有問題）"; return; }
    if (Date.now() > STOP_AT) { stopped = "時間到"; return; }
    await new Promise((r) => setTimeout(r, GAP)); // 一部一部隔開，不要一下子打太多
    try {
      const who = await identify(m.name, m.year);
      if (!who) { miss[m.k] = today; delete ratings[m.k]; unknown++; done++; continue; }
      const r = await core.ratingsOfIdent(who);
      if (r.err && !(r.imdb || r.tomato || r.popcorn)) { failed++; streak++; continue; } // 連線問題：不記，下次再查
      streak = 0;
      const rec = { id: who.id, a: today, x: 1, ...(who.year ? { y: who.year } : {}) }; // y = 這部片原本是哪一年的（重映片看得出來）
      if (r.imdb) { rec.i = r.imdb.score; rec.v = r.imdb.votes; }
      if (r.tomato) { rec.t = r.tomato.score; if (r.tomato.certified) rec.c = 1; }
      if (r.popcorn) { rec.p = r.popcorn.score; if (r.popcorn.certified) rec.h = 1; }
      const u = ((r.tomato || r.popcorn || {}).url || "").match(/rottentomatoes\.com\/m\/([\w-]+)/);
      if (u) rec.u = u[1];
      ratings[m.k] = rec;
      delete miss[m.k];
      if (r.imdb || r.tomato || r.popcorn) found++; else none++;
      done++;
    } catch (_) { failed++; streak++; }
  }
}));
if (stopped) console.log(`這一輪提早結束：${stopped}；剩下的下一輪再查`);
// 補「原本是哪一年的片」（y）和中文簡介：這兩樣是後來才加的。已經知道 IMDb 編號的片只要問 TMDB 一次（不用再查 IMDb、爛番茄），一輪最多補 8 分鐘。
// 簡介不放進評分總表（會讓它變得很大）：每個上映年一個檔（INTRO_DIR 底下的 intro-<年>.json，片名鍵 → 簡介），App 進到那部片的頁面才下載那一年的。
// 紀錄裡的 o = 1 表示簡介問過了（有沒有都算）；yq = 1 表示年份問過、TMDB 沒有
const INTRO_DIR = process.env.INTRO_DIR || "";
const intros = {}; // 年 → { 片名鍵|年 : 簡介 }
const introOf = (year) => (intros[year] ||= (INTRO_DIR ? read(`${INTRO_DIR}/intro-${year}.json`, {}) : {}));
{
  const need = Object.keys(ratings).filter((k) => ratings[k].id && ((!ratings[k].y && !ratings[k].yq) || (INTRO_DIR && !ratings[k].o)));
  const until = Date.now() + 8 * 60e3;
  let years = 0, texts = 0, asked = 0;
  for (const k of need) {
    if (Date.now() > until) break;
    const rec = ratings[k];
    try {
      asked++;
      const d = await tmdb(`/find/${rec.id}?external_source=imdb_id&language=zh-TW`);
      const hit = (d.movie_results || [])[0] || (d.tv_results || [])[0];
      if (!rec.y) {
        const y = hit ? Number(String(hit.release_date || hit.first_air_date || "").slice(0, 4)) || 0 : 0;
        if (y) { rec.y = y; years++; } else rec.yq = 1;
      }
      if (INTRO_DIR) {
        const text = cleanIntro(hit ? hit.overview : ""); // 太短、不是中文、簡體字寫的都不收（見 tools/intro-text.mjs）
        if (text) { introOf(k.split("|").pop())[k] = text; texts++; }
        rec.o = 1;
      }
    } catch (_) { /* 連線出錯：下一輪再補 */ }
    await new Promise((r) => setTimeout(r, 40));
  }
  if (need.length) console.log(`補首映年與簡介：還缺 ${need.length} 部，這一輪問了 ${asked} 部；補上年份 ${years}、簡介 ${texts}`);
  if (INTRO_DIR) {
    fs.mkdirSync(INTRO_DIR, { recursive: true });
    for (const year of Object.keys(intros)) {
      // 已經存著的也重新把關一次（規則改嚴之後，舊的不合格的要拿掉）
      for (const k of Object.keys(intros[year])) { const t = seen.has(k) ? cleanIntro(intros[year][k]) : ""; if (t) intros[year][k] = t; else delete intros[year][k]; }
      fs.writeFileSync(`${INTRO_DIR}/intro-${year}.json`, JSON.stringify(sorted(intros[year])) + "\n");
    }
  }
}
for (const k of Object.keys(miss)) if (!seen.has(k)) delete miss[k];
for (const k of Object.keys(ratings)) if (!seen.has(k)) delete ratings[k];
const all = Object.values(ratings);
fs.writeFileSync(outPath, JSON.stringify({ total: seen.size, ratings: sorted(ratings), miss: sorted(miss) }) + "\n");
console.log(`這一輪：有評分 ${found}、查到片但沒有評分 ${none}、找不到是哪部片 ${unknown}、讀取失敗 ${failed}`);
console.log(`累計：已查 ${all.length + Object.keys(miss).length}／${seen.size} 部；有 IMDb ${all.filter((x) => x.i).length}、有番茄 ${all.filter((x) => x.t !== undefined).length}、有爆米花 ${all.filter((x) => x.p !== undefined).length}；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
