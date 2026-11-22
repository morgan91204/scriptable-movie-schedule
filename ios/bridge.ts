// 原生 iOS App 用的資料層入口：把共用資料層（src/core.ts）包成一支 JS，在 App 內隱藏的 WKWebView 執行。
// 畫面全部是原生 SwiftUI；這裡只負責抓資料與解析，所以三個版本與伺服器排程共用同一套規則。
// 由 build.sh 編成 ios/MovieSchedule/Resources/core.js。
import * as core from "../src/core";
import { setPlatform } from "../src/platform";

declare const webkit: any;
const native = (name: string, payload: Record<string, unknown> = {}): Promise<any> => webkit.messageHandlers.native.postMessage({ name, ...payload });
let cache: Record<string, string> = {};

/** 票房排行：連同對得到的場次通電影一起回傳 */
async function boxOffice(by?: string, years?: string[]) {
  // 年度排行的其他年份是另一個檔，切到「年度」才下載
  const [b, all] = await Promise.all([by === "year" ? core.loadBoxOfficeFull() : core.loadBoxOffice(), core.loadMovies().catch(() => [])]);
  const sorts = core.boxSorts(b);
  const sort: core.BoxSort = sorts.some((x) => x.id === by) ? (by as core.BoxSort) : "week";
  const picked = core.boxYearsPicked(b, years || []);
  return {
    label: core.boxOfficeTitle(b, sort, picked), source: b.source, footer: core.boxOfficeFooter(b, sort, picked), sorts,
    sort, years: core.boxYears(b), selYears: picked, // 年度排行可以選的年份、實際採用的年份
    rows: core.boxOfficeBy(b, sort, picked).map((x) => ({ x, m: core.matchBoxOffice(x.name, all) || null, lines: core.boxOfficeLines(x, sort) })),
  };
}
/** 複選版：多個日期、時段、特殊廳一起找 */
async function nowShowingMulti(scope: { cinema: core.Cinema; km: number | null }[], dates: string[], winIds: string[], formats: string[]) {
  const { hits, failed, noData } = await core.findShowtimesMulti(scope, dates, winIds, formats as core.Format[]);
  return { groups: core.groupByMovie(hits), failed, noData, label: core.multiLabel(dates, winIds) };
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
/** 「依電影找場次」整頁要的資料：日期、縣市、特殊廳都可以複選（空的 = 預設／全部），favIds 有給就只留常去影城。
 *  fill = 把目前要顯示的影城補齊所有版本（電影頁每間影城只列一種），比較慢，畫面先用沒補的畫一次再補 */
async function movieBoard(slug: string, dates: string[], cities: string[], formats: string[], favIds: string[] | null, fill: boolean) {
  const base = await core.movieDay(slug, undefined);
  const today = core.todayTPE();
  const future = base.dates.filter((d) => d >= today);
  const allDates = future.length ? future : [base.date];
  const picked = dates.filter((d) => allDates.indexOf(d) >= 0);
  const selDates = picked.length ? picked.slice().sort() : [allDates.indexOf(base.date) >= 0 ? base.date : allDates[0]];
  const days = await core.movieDays(slug, selDates);
  const rank = (c: string) => core.CITY_ORDER.indexOf(c) + 1 || 99;
  const allCities = Array.from(new Set(days.flatMap((x) => x.cinemas.map((c) => c.city)))).sort((a, b) => rank(a) - rank(b));
  const selCities = cities.filter((c) => allCities.indexOf(c) >= 0);
  if (fill)
    for (const day of days) {
      const ids = day.cinemas.filter((c) => (!selCities.length || selCities.indexOf(c.city) >= 0) && (!favIds || favIds.indexOf(c.id) >= 0)).map((c) => c.id);
      if (!core.movieDayFilled(day, ids)) await core.fillMovieDay(day, ids).catch(() => day);
    }
  const available = core.FORMATS.filter((f) => days.some((x) => x.cinemas.some((c) => c.versions.some((v) => core.formatsOf(v.label).indexOf(f) >= 0))));
  const selFormats = (formats as core.Format[]).filter((f) => available.indexOf(f) >= 0);
  const rows = core.movieRows(days, { cities: selCities, formats: selFormats, favIds }).map((r) => ({ date: r.date, cinema: r.cinema }));
  return { title: base.title, rating: base.rating, runtime: base.runtime, release: base.release || "", total: base.cinemas.length, dates: allDates, selDates, cities: allCities, formats: available, rows };
}
/** 特殊廳清單（跟其他版本同一份） */
const formatList = () => core.FORMATS;
const extra: Record<string, (...a: any[]) => any> = { boxOffice, nowShowing, nowShowingMulti, movieBoard, nearby, patchSettings, fillMovie, formatList };

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
