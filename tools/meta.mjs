// 電影資料總表：把上映中與票房榜電影的海報、預告、三大評分、片長查好，存成 meta.json，
// App 一個請求就拿到全部，不用每部片各打十幾個請求。直接重用 App 的資料層（src/core.ts）。
// 用法：node tools/meta.mjs <上一次的 meta.json（可以不存在）> <輸出檔>
//   GitHub Actions 每小時跑一次；每筆資料有自己的查詢時間，還新的不重查，所以平常每次只查少數幾部。
//   USE_CURL=1：改用 curl 連線（本機測試、需要走代理時用）
import fs from "node:fs";
import { execFile } from "node:child_process";
import { buildSync } from "esbuild";
import { DOMParser } from "linkedom";

const [prevPath, outPath = "meta.json"] = process.argv.slice(2);
const HOUR = 3600e3, DAY = 86400e3;

const viaCurl = (url, headers, opts) =>
  new Promise((res, rej) =>
    execFile("curl", ["-sS", "-m", "25", "-X", opts?.method || "GET", ...Object.entries(headers || {}).flatMap(([k, v]) => ["-H", `${k}: ${v}`]), ...(opts?.body ? ["--data-binary", opts.body] : []), "-w", "\n__CODE__%{http_code}", url],
      { maxBuffer: 30e6 }, (e, out) => {
        if (e) return rej(e);
        const i = out.lastIndexOf("\n__CODE__");
        res({ status: Number(out.slice(i + 9)), body: out.slice(0, i) });
      }));
const viaFetch = async (url, headers, opts) => {
  try {
    const r = await fetch(url, { headers, method: opts?.method || "GET", body: opts?.body, signal: AbortSignal.timeout(25000) });
    return { status: r.status, body: await r.text() };
  } catch (e) {
    // Node 內建的 fetch 遇到回應標頭太大的網站（YouTube）會直接失敗：這類改用 curl 再試一次
    if (/youtube\.com/.test(url)) return viaCurl(url, headers, opts);
    throw e;
  }
};
const mem = {};
const platform = {
  fetchText: process.env.USE_CURL ? viaCurl : viaFetch,
  runInWebView: async (body) => new Function("DOMParser", body)(DOMParser),
  loadSettingsJSON: async () => null,
  saveSettingsJSON() {},
  cacheGet: (k) => mem[k] ?? null,
  cacheSet: (k, v) => { mem[k] = v; },
  cachedImage: () => null,
  cacheImage: async () => null,
};

const built = buildSync({ stdin: { contents: 'export * from "./core"; export { setPlatform } from "./platform";', resolveDir: new URL("../src", import.meta.url).pathname, loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral", define: { APP_VERSION: '"server"' } });
const core = await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));
core.setPlatform(platform);
core.setMetaEnabled(false);

let prev = { movies: {} };
try {
  prev = JSON.parse(fs.readFileSync(prevPath, "utf8"));
} catch (_) {}
const movies = prev.movies && typeof prev.movies === "object" ? prev.movies : {};
const now = Date.now();

// 片單：場次通上映中＋即將上映，加上票房榜上場次通沒有的片
const list = await core.loadMovies();
const todo = list.map((m) => ({ title: m.title, slug: m.slug, en: m.en, runtime: m.runtime, soon: m.comingSoon }));
try {
  for (const x of (await core.loadBoxOffice()).list) if (!core.matchBoxOffice(x.name, list)) todo.push({ title: x.name, runtime: 0 });
} catch (e) {
  console.log("票房榜讀不到，這次略過：", String(e.message || e));
}
if (todo.length < 20) throw new Error("片單太短（" + todo.length + "），可能是來源暫時有問題，這次不更新");

// TMDB 金鑰（GitHub Actions 的密鑰 TMDB_TOKEN）：只用來查片長，只放在送給 TMDB 的請求標頭裡，不印出來、不寫進任何檔案
const TMDB_TOKEN = (process.env.TMDB_TOKEN || "").trim();
/** 用片名到 TMDB 查片長。比手機版嚴格：片名要完全相符才採用（不拿「搜尋結果第一筆」），寧可沒有也不要配錯 */
async function tmdbRuntimeStrict(title, en) {
  const same = (s) => core.normTitle(String(s || "")).replace(/臺/g, "台").replace(/祕/g, "秘").replace(/爲/g, "為");
  const call = async (path) => {
    const r = await fetch("https://api.themoviedb.org/3" + path, { headers: { accept: "application/json", Authorization: "Bearer " + TMDB_TOKEN }, signal: AbortSignal.timeout(25000) });
    if (!r.ok) throw new Error("TMDB " + r.status);
    return r.json();
  };
  for (const q of Array.from(new Set([core.baseTitle(title), title, en].filter(Boolean)))) {
    const found = await call(`/search/movie?language=zh-TW&query=${encodeURIComponent(q)}`);
    const want = [same(title), same(core.baseTitle(title)), same(en)].filter(Boolean);
    const hit = (found.results || []).find((x) => want.indexOf(same(x.title)) >= 0 || want.indexOf(same(x.original_title)) >= 0);
    if (!hit) continue;
    const rt = Number((await call(`/movie/${hit.id}?language=zh-TW`)).runtime) || 0;
    if (rt >= 20 && rt <= 400) return rt;
  }
  return 0;
}

const noTrailer = [];
const stat = { extras: 0, ratings: 0, runtime: 0, release: 0, fail: 0 };
const has = (r) => !!(r && (r.imdb || r.tomato || r.popcorn));
async function refresh(m) {
  const k = core.normTitle(m.title);
  if (!k) return;
  const e = (movies[k] ||= {});
  e.seen = now;
  // 海報／預告：都有的 3 天查一次，缺的 6 小時再試
  // RECHECK=1：缺海報或預告的立刻重查（改了比對規則、加了新來源時手動跑一次）
  // RECHECK=1：全部重查（預告的挑選、檢查規則改過時手動跑一次）
  const recheck = process.env.RECHECK === "1";
  if (!e.xa || recheck || now - e.xa > (e.p && e.tn ? 3 * DAY : 6 * HOUR)) {
    try {
      const x = await core.movieExtras(m.title, m.slug);
      if (x.poster) e.p = x.poster;
      if (x.trailerName) { e.t = x.trailer; e.tn = x.trailerName; }
      else if (recheck && e.tn && !/讀不到|回應 \d|連線失敗/.test(x.err || "")) { delete e.t; delete e.tn; } // 舊規則挑的對不上片名：拿掉，不留錯的
      else if (x.err && noTrailer.length < 8) noTrailer.push(`${m.title}：${x.err}`); // 找不到預告的原因，印幾筆方便查
      e.xa = now;
      stat.extras++;
    } catch (_) { stat.fail++; }
  }
  // 評分：有分數的 1 天查一次，沒有的 12 小時再試；連線出錯就保留舊資料
  if (!e.ra || now - e.ra > (has(e.r) ? DAY : 12 * HOUR)) {
    try {
      const r = await core.movieRatings(m.title, m.en, m.slug);
      // 「暫時讀不到」是連線問題，下次再試；其他（例如 IMDb 上沒有這部片）是確定的結果，記下來
      if (!r.err || has(r) || !/暫時讀不到/.test(r.err)) {
        const { err: _e, ...keep } = r;
        if (has(keep) || !has(e.r)) e.r = keep; // 這次查不到分數時，不蓋掉以前查到的
        e.ra = now;
        stat.ratings++;
      } else stat.fail++;
    } catch (_) { stat.fail++; }
  }
  // 上映日期：電影頁要顯示；場次通的「即將上映」混著已經上映、只是今天沒場次的片，App 也靠這個分開
  if (m.slug && (!e.rda || now - e.rda > (e.rd ? 7 * DAY : DAY))) {
    try {
      const d = await core.twReleaseDate(m.slug);
      if (d) e.rd = d;
      e.rda = now;
      stat.release++;
    } catch (_) { stat.fail++; }
  }
  // 片長：只查來源沒給的
  if (!m.runtime && (!e.rta || now - e.rta > (e.rt ? 7 * DAY : DAY))) {
    try {
      const r = await core.movieRuntime(m.title, m.slug, m.en);
      if (r) { e.rt = r.runtime; e.rf = r.from; }
      e.rta = now;
      stat.runtime++;
    } catch (_) { stat.fail++; }
  }
  // 開眼也沒有片長的（演唱會、動畫劇場版、重映片）：再用 TMDB 查。盡量少問：查到的不再查；
  // 查不到的 7 天再試一次，試過 3 次還是沒有就 30 天才看一次（tmn = 試過幾次）
  if (TMDB_TOKEN && !m.runtime && !e.rt && (!e.tma || now - e.tma > ((e.tmn || 0) >= 3 ? 30 : 7) * DAY)) {
    try {
      const r = await tmdbRuntimeStrict(m.title, m.en);
      if (r) { e.rt = r; e.rf = "TMDB"; stat.tmdb = (stat.tmdb || 0) + 1; }
      e.tma = now;
      e.tmn = (e.tmn || 0) + 1;
      stat.tmdbAsked = (stat.tmdbAsked || 0) + 1;
    } catch (_) { stat.fail++; }
  }
}
const queue = todo.slice();
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let m = queue.shift(); m; m = queue.shift()) await refresh(m).catch(() => { stat.fail++; });
}));

// 手動指定的預告（data/trailers.json：片名 → YouTube 網址）：自動挑錯或挑不到時用，優先於其他來源
try {
  const pins = JSON.parse(fs.readFileSync(new URL("../data/trailers.json", import.meta.url), "utf8"));
  for (const [title, url] of Object.entries(pins)) {
    const id = (String(url).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || [])[1];
    const e = movies[core.normTitle(title)];
    if (!id || !e) continue; // 網址不對，或這部片不在片單上
    e.t = `https://www.youtube.com/watch?v=${id}`;
    e.tn = "預告片";
    stat.pins = (stat.pins || 0) + 1;
  }
} catch (e) {
  console.log("手動指定的預告讀不到，略過：", String(e.message || e));
}

// 下檔超過 14 天的清掉
for (const [k, e] of Object.entries(movies)) if (!e.seen || now - e.seen > 14 * DAY) delete movies[k];
const sorted = Object.fromEntries(Object.keys(movies).sort().map((k) => [k, movies[k]]));
fs.writeFileSync(outPath, JSON.stringify({ updated: now, movies: sorted }) + "\n");
const all = Object.values(sorted);
console.log(`片單 ${todo.length} 部；這次查了 海報／預告 ${stat.extras}、評分 ${stat.ratings}、片長 ${stat.runtime}（TMDB 問了 ${stat.tmdbAsked || 0} 部、補到 ${stat.tmdb || 0}${TMDB_TOKEN ? "" : "，沒有金鑰"}）、上映日期 ${stat.release}、手動指定預告 ${stat.pins || 0}，失敗 ${stat.fail}`);
console.log(`總表 ${all.length} 部：有海報 ${all.filter((e) => e.p).length}、有預告 ${all.filter((e) => e.tn).length}、有評分 ${all.filter((e) => has(e.r)).length}；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
if (noTrailer.length) console.log("找不到預告的例子：\n" + noTrailer.join("\n"));
process.exit(0);
