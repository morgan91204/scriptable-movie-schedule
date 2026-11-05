// 用 Scripting 的平台實作（fetch／WebViewController／Storage 模擬）跑共用資料層，確認電影模式與影城模式都正常
import { DOMParser } from "linkedom";
import { execFile } from "node:child_process";
import { buildSync } from "esbuild";
const store = {};
globalThis.Storage = { get: (k) => (k in store ? store[k] : null), set: (k, v) => ((store[k] = v), true) };
globalThis.WebViewController = class {
  async loadHTML() { return true; }
  async evaluateJavaScript(body) { return new Function("DOMParser", body)(DOMParser); }
};
globalThis.fetch = (url, init) => new Promise((res, rej) =>
  execFile("curl", ["-sS", "-m", "25", "-A", init.headers["User-Agent"], "-w", "\n__CODE__%{http_code}", url], { maxBuffer: 20e6 }, (e, out) => {
    if (e) return rej(e);
    const i = out.lastIndexOf("\n__CODE__");
    res({ status: Number(out.slice(i + 9)), text: async () => out.slice(0, i) });
  }));
const out = buildSync({ stdin: { contents: 'export * from "./core"; export { setPlatform } from "./platform"; export { scriptingPlatform } from "./platform-scripting";', resolveDir: "scripting", loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral" });
const m = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
m.setPlatform(m.scriptingPlatform);
const cinemas = await m.loadCinemas();
console.log("影城", cinemas.length, "cache", Object.keys(store));
const movies = await m.loadMovies();
console.log("電影", movies.length, movies.slice(0, 3).map((x) => `${x.title}(${x.cinemaCount})`).join("、"));
const pick = movies.find((x) => x.slug.includes(":")) || movies[0];
const d = await m.movieDay(pick.slug);
console.log(`《${d.title}》${d.date} ${d.cinemas.length} 間，日期 ${d.dates.join(" ")}`);
const d2 = await m.movieDay(movies[0].slug, d.dates[1]);
console.log(`《${d2.title}》${d2.date} ${d2.cinemas.length} 間；第一間 ${d2.cinemas[0].name} ${JSON.stringify(d2.cinemas[0].versions)}`);
const c = cinemas.find((x) => x.id === d2.cinemas[3].id);
console.log("補地址：", c.name, await m.cinemaAddress(c));
const lux = cinemas.find((x) => x.id === "at-t03303");
const ds = await m.datesOf(lux);
console.log("開眼威秀尼斯日期", ds.dates, ds.site);
m.saveSettings({ favorites: ["a"], ads: 15, calendar: "電影", alarm: 60 });
console.log("設定", JSON.stringify(await m.loadSettings()));
