// 檢查每間影城的座標是否落在所屬縣市附近（避免地理編碼抓錯，例如南紡威秀被定位到新竹）
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
const { GEO } = await import("data:text/javascript;base64," + Buffer.from(buildSync({ entryPoints: ["src/geo.ts"], bundle: true, format: "esm", write: false }).outputFiles[0].text).toString("base64"));
const C = {"台北市":[25.04,121.55],"新北市":[25.01,121.47],"基隆市":[25.13,121.74],"桃園市":[24.99,121.25],"新竹市":[24.80,120.97],"新竹縣":[24.83,121.01],"苗栗縣":[24.56,120.82],"台中市":[24.15,120.67],"彰化縣":[24.07,120.54],"南投縣":[23.91,120.68],"雲林縣":[23.71,120.43],"嘉義市":[23.48,120.45],"嘉義縣":[23.45,120.30],"台南市":[23.0,120.2],"高雄市":[22.63,120.30],"屏東縣":[22.67,120.49],"宜蘭縣":[24.70,121.74],"花蓮縣":[23.98,121.60],"台東縣":[22.76,121.14],"澎湖縣":[23.57,119.58],"金門縣":[24.43,118.32],"連江縣":[26.16,119.95]};
let bad = 0;
for (const c of await m.loadCinemas()) {
  const g = GEO[c.id], cc = C[c.city];
  if (!g || !cc) { console.log("⚠️ 沒有座標或縣市：", c.id, c.name, c.city); continue; }
  const d = m.distanceKm({ lat: g[0], lng: g[1] }, { lat: cc[0], lng: cc[1] });
  if (d > 35) { bad++; console.log(`❌ ${c.name}（${c.city}）座標離縣市中心 ${Math.round(d)} 公里：`, g); }
}
console.log(bad ? `❌ ${bad} 間座標可疑` : "✅ 所有影城座標都在所屬縣市附近");
