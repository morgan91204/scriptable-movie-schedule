// 測試載入器：第一次從「GitHub」下載並快取 → 執行到首頁；第二次網路失敗 → 用快取執行；錯誤頁 → 不執行
import { dump, closeUI } from "./mock.mjs";
import fs from "node:fs";
const mode = process.argv[2] || "online";
const realReq = globalThis.Request;
globalThis.Request = class extends realReq {
  loadString() {
    if (this.url.startsWith("https://raw.githubusercontent.com/")) {
      if (mode === "offline") return Promise.reject(new Error("offline"));
      this.response = { statusCode: mode === "404" ? 404 : 200 };
      return Promise.resolve(mode === "404" ? "404: Not Found" : fs.readFileSync(new URL("../dist/movie.js", import.meta.url), "utf8"));
    }
    return super.loadString();
  }
};
globalThis.Alert = class { addAction() {} async presentAlert() { console.log("Alert:", this.title); return 0; } };
const loader = fs.readFileSync(new URL("../loader/loader.js", import.meta.url), "utf8").replace(/morgan91204\/scriptable-movie-schedule/g, "o/r");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const run = new AsyncFunction(loader);
const driver = (async () => {
  if (mode === "404" && !process.env.KEEP_CACHE) { console.log("（無快取＋404）"); return; }
  await dump(`首頁（${mode}）`);
  closeUI();
})();
await Promise.all([run(), driver]);
const cache = globalThis.FileManager.local();
console.log("快取存在：", cache.fileExists(cache.joinPath(cache.documentsDirectory(), "movie-schedule-cache.js")));
process.exit(0);
