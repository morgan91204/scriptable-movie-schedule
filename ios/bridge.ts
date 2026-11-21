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
/** 現在有什麼可以看：在指定的影城裡找某天某時段的場次，依電影分組 */
async function nowShowing(scope: { cinema: core.Cinema; km: number | null }[], date: string, winId: string, format: string) {
  const win = core.WINDOWS.find((w) => w.id === winId) || core.WINDOWS[core.WINDOWS.length - 1];
  const { hits, failed, noData } = await core.findShowtimes(scope, date, win, (format || "") as any);
  return { groups: core.groupByMovie(hits), failed, noData };
}
/** 離我最近的影城 */
async function nearby(lat: number, lng: number, limit: number) {
  return core.nearest(await core.loadCinemas(), { lat, lng }, limit || 20);
}
/** 更新設定裡的部分欄位（常去影城、地圖、TMDB 金鑰），其餘保留 */
async function patchSettings(patch: Record<string, unknown>) {
  core.saveSettings({ ...(await core.loadSettings()), ...patch } as core.Settings);
  return true;
}
/** 補齊電影頁各影城的版本（電影頁每間影城只列一種版本），回傳補好的整份資料 */
async function fillMovie(slug: string, date: string | null, ids: string[]) {
  return core.fillMovieDay(await core.movieDay(slug, date || undefined), ids);
}
const extra: Record<string, (...a: any[]) => any> = { boxOffice, nowShowing, nearby, patchSettings, fillMovie };

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
