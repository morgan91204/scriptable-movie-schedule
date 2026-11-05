// 評分：IMDb、番茄指數、爆米花指數（不需要 TMDB 金鑰）
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
  execFile("curl", ["-sS", "-m", "25", "-A", init.headers["User-Agent"] || "x", ...Object.entries(init.headers).filter(([k]) => k !== "User-Agent").flatMap(([k, v]) => ["-H", `${k}: ${v}`]), "-w", "\n__CODE__%{http_code}", url], { maxBuffer: 20e6 }, (e, out) => {
    if (e) return rej(e);
    const i = out.lastIndexOf("\n__CODE__");
    res({ status: Number(out.slice(i + 9)), text: async () => out.slice(0, i) });
  }));
const out = buildSync({ stdin: { contents: 'export * from "./core"; export { setPlatform } from "./platform"; export { scriptingPlatform } from "./platform-scripting";', resolveDir: "scripting", loader: "ts" }, bundle: true, format: "esm", write: false, platform: "neutral" });
const m = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
m.setPlatform(m.scriptingPlatform);
for (const [t, en] of [["進擊的鼓手 4K重映", ""], ["讓子彈飛(4K修復)", ""], ["奧德賽", "The Odyssey"], ["野獸之心", "HEART OF THE BEAST"], ["快打旋風", ""], ["劇場版 吉伊卡哇 人魚島的秘密", ""]]) {
  const t0 = Date.now();
  const r = await m.movieRatings(t, en);
  console.log(`${t}（${Date.now() - t0}ms）`, r.imdb ? `IMDb ${r.imdb.score}（${r.imdb.votes}）` : "IMDb —", r.tomato ? `🍅 ${r.tomato.score}%${r.tomato.certified ? " 新鮮認證" : ""}` : "🍅 —", r.popcorn ? `🍿 ${r.popcorn.score}%` : "🍿 —", r.tomato?.url || "");
}
console.log("— 海報／預告 —");
for (const [t, slug] of [["泥面人", "泥面人"], ["野獸之心", ""], ["快打旋風", "快打旋風"]]) {
  const t0 = Date.now(); const x = await m.movieExtras(t, slug || undefined);
  console.log(`${t}（${Date.now() - t0}ms）`, x.poster ? "海報 ✓" : "海報 —", x.trailerName || "搜尋預告");
}
