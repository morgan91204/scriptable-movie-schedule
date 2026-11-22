// 場次通場次總表：把 60 多間連鎖影城的片單抓好，App 一兩個請求就拿到全部，不用一間一間、一天一天各讀一頁
// （「現在有什麼可以看」查一個縣市要讀幾十頁，是它慢的主因）。直接重用 App 的資料層（src/core.ts）。
// 用法：node tools/tw.mjs <上一次的近期檔> <上一次的遠期檔> <近期輸出檔> <遠期輸出檔>      USE_CURL=1：改用 curl 連線
//   近期檔 tw-near.json：今天、明天，每次都重抓。
//   遠期檔 tw-far.json：後天起 5 天，6 小時重抓一次（還新就不輸出，沿用線上的）。
import fs from "node:fs";
import { execFile } from "node:child_process";
import { buildSync } from "esbuild";
import { DOMParser } from "linkedom";

const [prevNearPath, prevFarPath, nearOut = "tw-near.json", farOut = "tw-far.json"] = process.argv.slice(2);
const viaCurl = (url, headers) =>
  new Promise((res, rej) =>
    execFile("curl", ["-sS", "-m", "30", "--retry", "1", ...Object.entries(headers || {}).flatMap(([k, v]) => ["-H", `${k}: ${v}`]), "-w", "\n__CODE__%{http_code}", url], { maxBuffer: 30e6 }, (e, out) => {
      if (e) return rej(e);
      const i = out.lastIndexOf("\n__CODE__");
      res({ status: Number(out.slice(i + 9)), body: out.slice(0, i) });
    }));
const viaFetch = async (url, headers) => {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
  return { status: r.status, body: await r.text() };
};
const mem = {};
const built = buildSync({ stdin: { contents: 'export * from "./core"; export { setPlatform } from "./platform";', resolveDir: new URL("../src", import.meta.url).pathname, loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral", define: { APP_VERSION: '"server"' } });
const core = await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));
core.setPlatform({
  fetchText: process.env.USE_CURL ? viaCurl : viaFetch,
  runInWebView: async (body) => new Function("DOMParser", body)(DOMParser),
  loadSettingsJSON: async () => null,
  saveSettingsJSON() {},
  cacheGet: (k) => mem[k] ?? null,
  cacheSet: (k, v) => { mem[k] = v; },
  cachedImage: () => null,
  cacheImage: async () => null,
});
core.setMetaEnabled(false); // 不讀自己上一次的結果，全部直接讀場次通

const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return null; } };
const prevNear = read(prevNearPath), prevFar = read(prevFarPath);
const today = core.todayTPE();
const cinemas = (await core.loadCinemas()).filter((c) => c.source === "tw");
if (cinemas.length < 30) throw new Error("場次通影城清單太短（" + cinemas.length + "），這次不更新");

/** 抓一批：offsets 是「今天起第幾天」。回傳 影城代碼 → 日期 → 片單 */
async function grab(offsets, prev) {
  const days = {};
  let ok = 0, fail = 0, pages = 0;
  const queue = cinemas.slice();
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      const mine = {};
      let good = false;
      for (const i of offsets) {
        const date = core.addDays(today, i);
        try {
          const d = await core.twDayLive(c, date);
          pages++;
          good = true;
          if (d && d.date === date) mine[date] = { date: d.date, dates: d.dates, address: d.address, booking: d.booking, movies: d.movies };
        } catch (_) {} // 這一天還沒有片單（或已撤掉）很常見
      }
      if (good) ok++; else fail++;
      // 整間都讀不到：沿用上一次還沒過期的
      if (!good) for (const [date, d] of Object.entries(prev?.days?.[c.id] || {})) if (date >= today) mine[date] = d;
      if (Object.keys(mine).length) days[c.id] = mine;
    }
  }));
  return { days, ok, fail, pages };
}
const write = (path, r, label) => {
  if (r.ok < cinemas.length * 0.6) return console.log(`${label}：讀到的太少（${r.ok}/${cinemas.length}），可能是場次通暫時有問題，這次不更新（App 會自己讀）`);
  fs.writeFileSync(path, JSON.stringify({ updated: Date.now(), days: r.days }) + "\n");
  const n = Object.values(r.days).reduce((a, d) => a + Object.keys(d).length, 0);
  console.log(`${label}：影城 ${cinemas.length} 間，讀到 ${r.ok}、失敗 ${r.fail}，共 ${r.pages} 頁；寫出 ${n} 天的片單，檔案 ${Math.round(fs.statSync(path).size / 1024)}KB`);
};

write(nearOut, await grab([0, 1], prevNear), "近期（今天、明天）");
// 遠期的場次變動少：6 小時抓一次；換日後（上一份的第一天已經變成「明天」）也重抓
const farFresh = prevFar && Date.now() - prevFar.updated < 6 * 3600e3 && prevFar.from === core.addDays(today, 2);
if (farFresh && process.env.FORCE !== "1") console.log("遠期（後天起 5 天）：上一份還新，這次不重抓");
else {
  const r = await grab([2, 3, 4, 5, 6], prevFar);
  if (r.ok >= cinemas.length * 0.6) {
    fs.writeFileSync(farOut, JSON.stringify({ updated: Date.now(), from: core.addDays(today, 2), days: r.days }) + "\n");
    const n = Object.values(r.days).reduce((a, d) => a + Object.keys(d).length, 0);
    console.log(`遠期（後天起 5 天）：讀到 ${r.ok}、失敗 ${r.fail}，共 ${r.pages} 頁；寫出 ${n} 天的片單，檔案 ${Math.round(fs.statSync(farOut).size / 1024)}KB`);
  } else console.log("遠期：讀到的太少，這次不更新");
}
process.exit(0);
