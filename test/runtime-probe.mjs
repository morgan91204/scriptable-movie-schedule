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
const bySrc = {};
for (const s of ["tw","eslite","spot-hs","spot-taipei","at"]) bySrc[s] = cinemas.filter(c => c.source === s);
const sample = [...bySrc.tw.slice(0, 12), ...bySrc.eslite, ...bySrc["spot-hs"], ...bySrc["spot-taipei"], ...bySrc.at];
const missing = {}, total = {};
await Promise.all(Array.from({ length: 6 }, async () => {
  while (sample.length) {
    const c = sample.shift();
    try {
      const { dates } = await m.datesOf(c);
      const r = await m.moviesOf(c, dates[0]);
      for (const mv of r.movies) { total[c.source] = (total[c.source]||0)+1; if (!mv.runtime) (missing[c.source] ||= new Set()).add(mv.title + " @" + c.name); }
    } catch (e) { }
  }
}));
for (const s in total) console.log(s, "電影", total[s], "沒片長", missing[s]?.size || 0, [...(missing[s]||[])].slice(0, 8).join("；"));
const idx = {}; // matcher sanity
for (const [k,v] of [["進擊的鼓手",107],["復仇者聯盟：終局之戰",181],["奧德賽",172],["X",90]]) idx[k.toLowerCase().replace(/[\s:：]/g,"")]=v;
for (const t of ["進擊的鼓手 4K重映","復仇者聯盟:終局之戰加碼重映","奧德賽2","X 導演剪輯版"]) console.log(t,"→",m.matchRuntime(idx,t));
