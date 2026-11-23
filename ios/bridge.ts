// 原生 iOS App 用的資料層入口：把共用資料層（src/core.ts）包成一支 JS，在 App 內隱藏的 WKWebView 執行。
// 畫面全部是原生 SwiftUI；這裡只負責抓資料與解析，所以三個版本與伺服器排程共用同一套規則。
// 由 build.sh 編成 ios/MovieSchedule/Resources/core.js。
import * as core from "../src/core";
import { setPlatform } from "../src/platform";

declare const webkit: any;
const native = (name: string, payload: Record<string, unknown> = {}): Promise<any> => webkit.messageHandlers.native.postMessage({ name, ...payload });
let cache: Record<string, string> = {};

/** 票房排行：連同對得到的場次通電影一起回傳 */
async function boxOffice(by?: string, years?: string[], query?: string, limit?: number, week?: string) {
  // 年度排行的其他年份、過去的週票房各是另一個檔，用到才下載
  const load = by === "year" ? core.loadBoxOfficeFull() : (by || "week") === "week" && week ? core.loadBoxOfficeWeeks() : core.loadBoxOffice();
  const [b, all] = await Promise.all([load, core.loadMovies().catch(() => [])]);
  const sorts = core.boxSorts(b);
  const sort: core.BoxSort = sorts.some((x) => x.id === by) ? (by as core.BoxSort) : "week";
  const picked = core.boxYearsPicked(b, years || []);
  const wk = core.boxWeekPicked(b, week || "");
  const pastWeek = sort === "week" && wk.past;
  const match = core.boxMatcher(all);
  const k = (query || "").trim().toLowerCase();
  const found = core.boxOfficeBy(b, sort, picked, wk.id).map((x) => ({ x, m: match(x.name) || null })).filter(({ x, m }) => !k || `${x.name} ${m?.en || ""}`.toLowerCase().includes(k));
  // 年度排行有好幾千列：一次只回傳 limit 列（畫面上按「顯示更多」再要），並標記哪些列是已下檔的舊片（海報用輕量查法）
  const paged = sort === "year";
  const rows = (paged ? found.slice(0, limit || core.BOX_PAGE) : found).map(({ x, m }) => ({ x, m, lines: core.boxOfficeLines(x, sort, pastWeek), light: (paged || pastWeek) && !m }));
  return {
    label: core.boxOfficeTitle(b, sort, picked, wk.id), source: b.source, footer: core.boxOfficeFooter(b, sort, picked, wk.id), sorts,
    sort, years: core.boxYears(b), selYears: picked, // 年度排行可以選的年份、實際採用的年份
    weeks: core.boxWeekOptions(b), selWeek: wk.id, // 週票房可以選的週次、實際採用的那一週
    total: found.length, // 符合條件的總數（比 rows 多的話還有下一批）
    rows,
  };
}
/** 現在有什麼可以看：在指定的影城裡找某天某時段的場次，依電影分組 */
async function nowShowing(scope: { cinema: core.Cinema; km: number | null }[], date: string, winId: string, format: string) {
  const win = core.WINDOWS.find((w) => w.id === winId) || core.WINDOWS[core.WINDOWS.length - 1];
  const { hits, failed, noData } = await core.findShowtimes(scope, date, win, (format || "") as any);
  return { groups: core.groupByMovie(hits), failed, noData };
}
/** 複選版：多個日期、時段、特殊廳一起找 */
async function nowShowingMulti(scope: { cinema: core.Cinema; km: number | null }[], dates: string[], winIds: string[], formats: string[]) {
  const { hits, failed, noData } = await core.findShowtimesMulti(scope, dates, winIds, formats as core.Format[]);
  return { groups: await core.linkMovies(core.groupByMovie(hits)), failed, noData, label: core.multiLabel(dates, winIds) };
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
  return { title: base.title, rating: base.rating, runtime: base.runtime, release: base.release || "", intro: core.movieAbout(base).text, credits: core.movieAbout(base).credits, total: base.cinemas.length, dates: allDates, selDates, cities: allCities, formats: available, rows };
}
/** 影展分類要的資料：有哪些影展、選中的那一個、可選的日期、那一天的片單 */
async function festivalBoard(festId: string, date: string, year = 0, query = "", tab = "") {
  const list = await core.loadFestivals(year || undefined);
  const years = core.festivalYears();
  const pick = core.festivalPick(list, tab, festId);
  const f = pick.f || list[0];
  if (!f) return { festivals: [], groups: [], tabs: [], tab: "", items: [], years, year: 0, note: "", id: "", name: "", range: "", footer: "", dates: [], date: "", day: [] };
  const dates = core.festivalDates(f);
  const d = dates.indexOf(date) >= 0 ? date : core.festivalDefaultDate(f);
  const item = (x: core.Festival) => ({ id: x.id, name: `${x.name}（${core.festivalChipNote(x)}）` });
  return {
    festivals: list.map(item), groups: core.festivalGroups(list).map((g) => ({ title: g.title, past: g.past, items: g.items.map(item) })),
    tabs: pick.tabs.map((t) => ({ id: t.id, label: `${t.label}（${t.count}）` })), tab: pick.tab, items: pick.items.map(item),
    years, year: Number(list[0].end.slice(0, 4)), note: core.festivalNote(list),
    id: f.id, name: f.name, range: core.festivalStatusLine(f), past: core.festivalState(f) === "past",
    footer: core.festivalFooter(f),
    dates, date: d,
    hits: query.trim() ? core.festivalSearch(list, query).map((x) => ({ festId: x.f.id, film: x.film, lines: core.festivalSearchLines(x.f, x.film, x.sessions) })) : [],
    day: core.festivalDay(f, d).map(({ film, sessions }) => ({ film, count: sessions.length, lines: core.festivalLines(film, sessions) })),
  };
}
/** 影展的一部片：還沒演的所有場次（附對應的影城，確認頁和導航用） */
async function festivalFilm(festId: string, filmId: string) {
  const [f, cinemas] = await Promise.all([core.festivalFind(festId), core.loadCinemas().catch(() => [])]);
  if (!f) return null;
  const film = f.films.find((x) => x.id === filmId);
  if (!film) return null;
  return {
    name: `${f.name}（${core.festivalStateLabel(f)}）`, film, past: core.festivalState(f) === "past", trailerUrl: core.festivalTrailer(film).url, trailerLabel: core.festivalTrailer(film).label, source: f.source,
    sessions: core.festivalFilmSessions(f, filmId).map((x) => ({ date: x.date, time: x.time, place: core.festivalPlace(x), room: x.room, ticket: x.ticket || film.url, cinema: core.festivalCinema(x, cinemas, f) })),
  };
}
/** 特殊廳清單（跟其他版本同一份） */
const formatList = () => core.FORMATS;
const extra: Record<string, (...a: any[]) => any> = { boxOffice, nowShowing, nowShowingMulti, movieBoard, festivalBoard, festivalFilm, nearby, patchSettings, fillMovie, formatList };

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
