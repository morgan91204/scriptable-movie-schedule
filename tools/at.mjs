// 開眼場次總表：把「只有開眼有的戲院」和「要補頂級影廳的威秀」今明幾天的片單抓好，存成 at.json。
// 開眼每個網頁約要 3 秒，App 先讀這個檔就不用等。直接重用 App 的資料層（src/core.ts）。
// 用法：node tools/at.mjs <上一次的 at.json（可以不存在）> <輸出檔>      USE_CURL=1：改用 curl 連線
import fs from "node:fs";
import { execFile } from "node:child_process";
import { buildSync } from "esbuild";
import { DOMParser } from "linkedom";

const [prevPath, outPath = "at.json"] = process.argv.slice(2);
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
core.setMetaEnabled(false); // 不讀自己上一次的結果，全部直接讀開眼

let prev = { days: {} };
try {
  prev = JSON.parse(fs.readFileSync(prevPath, "utf8"));
} catch (_) {}
const today = core.todayTPE();

// 要抓的戲院：開眼來源的戲院（今天、明天），加上要補頂級影廳的威秀（今天起 3 天）
const cinemas = (await core.loadCinemas()).filter((c) => c.source === "at");
const targets = cinemas.map((c) => ({ id: c.id.replace(/^at-/, ""), url: c.url, name: c.name, days: 2 }));
for (const [, id, region] of core.AT_SUPPLEMENT) targets.push({ id, url: `https://www.atmovies.com.tw/showtime/${id}/${region}/`, name: "補頂級影廳 " + id, days: 3 });
let theaters = [];
try {
  theaters = JSON.parse(mem["at-theaters.json"] || "{}").list || [];
} catch (_) {}

const days = {};
let ok = 0, fail = 0, pages = 0;
const queue = targets.slice();
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let t = queue.shift(); t; t = queue.shift()) {
    const mine = {};
    let good = false;
    for (let i = 0; i < t.days; i++) {
      try {
        // 第一頁不帶日期（開眼的「今天」，場次最完整），之後帶日期
        const d = await core.atDayLive(t.url, i === 0 ? undefined : core.addDays(today, i));
        pages++;
        good = true;
        if (d && d.date && d.date >= today && d.movies.length) mine[d.date] = d;
      } catch (_) {}
    }
    if (good) ok++; else fail++;
    // 這次沒讀到的日期，沿用上一次還沒過期的資料
    for (const [date, d] of Object.entries(prev.days?.[t.id] || {})) if (date >= today && !mine[date] && !good) mine[date] = d;
    if (Object.keys(mine).length) days[t.id] = mine;
  }
}));

console.log(`戲院 ${targets.length} 間：讀到 ${ok}、失敗 ${fail}；共 ${pages} 頁`);
if (ok < targets.length * 0.6) {
  console.log("讀到的太少，可能是開眼暫時有問題：這次不更新（App 會自己讀開眼）");
  process.exit(0);
}
fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), theaters, days }) + "\n");
const n = Object.values(days).reduce((a, d) => a + Object.keys(d).length, 0);
console.log(`已寫出 ${Object.keys(days).length} 間、${n} 天的片單；地區頁掃到 ${theaters.length} 間戲院；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
process.exit(0);
