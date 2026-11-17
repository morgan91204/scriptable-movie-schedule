// 原生 iOS App 用的資料層入口：把共用資料層（src/core.ts）包成一支 JS，在 App 內隱藏的 WKWebView 執行。
// 畫面全部是原生 SwiftUI；這裡只負責抓資料與解析，所以三個版本與伺服器排程共用同一套規則。
// 由 build.sh 編成 ios/MovieSchedule/Resources/core.js。
import * as core from "../src/core";
import { setPlatform } from "../src/platform";

declare const webkit: any;
const native = (name: string, payload: Record<string, unknown> = {}): Promise<any> => webkit.messageHandlers.native.postMessage({ name, ...payload });
let cache: Record<string, string> = {};

/** 票房排行：連同對得到的場次通電影一起回傳 */
async function boxOffice() {
  const [b, all] = await Promise.all([core.loadBoxOffice(), core.loadMovies().catch(() => [])]);
  return { label: core.boxOfficeLabel(b), source: b.source, rows: b.list.map((x) => ({ x, m: core.matchBoxOffice(x.name, all) || null })) };
}
const extra: Record<string, (...a: any[]) => any> = { boxOffice };

(globalThis as any).MS = {
  init(saved: Record<string, string>) {
    cache = saved || {};
    setPlatform({
      fetchText: (url, headers, opts) => native("fetch", { url, headers, method: opts?.method || "GET", body: opts?.body || "" }),
      runInWebView: async (body) => new Function(body)(), // 這裡本來就在 WebView 裡，有 DOMParser
      loadSettingsJSON: async () => (await native("settingsGet")) || null,
      saveSettingsJSON: (json) => { native("settingsSet", { value: json }); },
      cacheGet: (name) => cache[name] ?? null,
      cacheSet: (name, value) => { cache[name] = value; native("cacheSet", { key: name, value }); },
      cachedImage: () => null, // 圖片由原生端自己快取
      cacheImage: async () => null,
    });
  },
  /** 呼叫資料層函式；回傳 JSON：{ ok: 結果 } 或 { err: 原因 } */
  async call(fn: string, args: unknown[]): Promise<string> {
    try {
      const f = extra[fn] || (core as any)[fn];
      if (typeof f !== "function") throw new Error("沒有這個函式：" + fn);
      const r = await f(...(args || []));
      return JSON.stringify({ ok: r === undefined ? null : r });
    } catch (e) {
      return JSON.stringify({ err: String((e as Error)?.message || e) });
    }
  },
};
