// 資料層：型別、設定檔、網路、四個來源的讀取。畫面在 main.tsx。
import { PARSERS_JS } from "./parsers.gen";
import { platform } from "./platform";
import { GEO } from "./geo";
import { AT_BUILTIN, AT_COVERED, AT_SKIP, AT_REGIONS } from "./at-list";
import type { Movie, Version, TwCinema, TwDay, MultiDay, SpotMovie, LuxFilm, AtTheater, AtDay, TwMovie, TwMovieDay } from "./parsers";
export type { TwMovie, TwMovieDay, TwMovieCinema } from "./parsers";
export type { Movie, Version } from "./parsers";

// ───────────────────────── 資料模型 ─────────────────────────

export type Source = "tw" | "eslite" | "spot-hs" | "spot-taipei" | "lux" | "at";

export interface Cinema {
  id: string;
  name: string;
  city: string;
  district: string;
  source: Source;
  url: string; // 官方或場次通時刻表
  address?: string;
  aliases?: string;
}

export interface Pick {
  cinema: Cinema;
  address: string;
  booking: string;
  sourceUrl: string;
  date: string; // 片單日期（營業日）
  movie: Movie;
  version: Version;
  time: string;
}

export interface Settings {
  favorites: string[];
  calendar?: string;
  ads: number;
  tmdbToken?: string; // TMDB API Read Access Token：有填才會幫沒有片長的電影補片長
  maps?: MapsApp; // 導航用哪個地圖（預設 Apple 地圖）
}

export type MapsApp = "apple" | "google";
export const MAPS_LABEL: Record<MapsApp, string> = { apple: "Apple 地圖", google: "Google 地圖" };
/** 導航連結：Apple 地圖或 Google 地圖（分享、行程備註、點地址都用這個） */
export function mapsUrl(name: string, address?: string, app: MapsApp = "apple"): string {
  if (app === "google")
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, address].filter(Boolean).join(" "))}`;
  return `https://maps.apple.com/?q=${encodeURIComponent(name)}${address ? "&address=" + encodeURIComponent(address) : ""}`;
}

export const TW = "https://twshowtimes.com";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

export const EXTRA: Cinema[] = [
  {
    id: "eslite",
    name: "誠品電影院",
    city: "台北市",
    district: "信義區",
    source: "eslite",
    url: "https://meet.eslite.com/tw/tc/gallery/movieschedule/201803020001",
    address: "台北市信義區菸廠路80號B1",
    aliases: "誠品 松菸",
  },
  {
    id: "spot-hs",
    name: "光點華山電影館",
    city: "台北市",
    district: "中正區",
    source: "spot-hs",
    url: "https://www.spot-hs.org.tw/movie/schedule.html",
    address: "台北市中正區八德路一段1號",
    aliases: "光點 華山",
  },
  {
    id: "spot-taipei",
    name: "光點台北（台北之家）",
    city: "台北市",
    district: "中山區",
    source: "spot-taipei",
    url: "https://www.spot.org.tw/schedule/schedule_one.html",
    address: "台北市中山區中山北路二段18號",
    aliases: "光點 台北之家 spot",
  },
  {
    id: "lux",
    name: "樂聲影城",
    city: "台北市",
    district: "萬華區",
    source: "lux",
    url: "https://www.luxcinema.com.tw/web/2020.php?type=ShowTimes",
    address: "台北市萬華區武昌街二段",
    aliases: "樂聲 lux 西門 西門町 電影街",
  },
];

export const CITY_ORDER = [
  "基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "台中市", "彰化縣", "南投縣", "雲林縣",
  "嘉義市", "嘉義縣", "台南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣",
];
export const AD_STEPS = [0, 10, 15, 20];
export const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

// ───────────────────────── 小工具 ─────────────────────────

export const todayTPE = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
export const nowHM = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(11, 16);
export const addDays = (d: string, n: number) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const weekday = (d: string) => WEEK[new Date(d + "T00:00:00Z").getUTCDay()];
export const isLate = (t: string) => t < "05:00"; // 凌晨場：影城營業日的隔天

export function dateLabel(d: string): string {
  const [, m, dd] = d.split("-").map(Number);
  const t = todayTPE();
  const tag = d === t ? " 今天" : d === addDays(t, 1) ? " 明天" : d === addDays(t, 2) ? " 後天" : "";
  return `${m}/${dd}（${weekday(d)}）${tag}`;
}

export function tpeDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+08:00`);
}

export function fmt(dt: Date): string {
  const s = new Date(dt.getTime() + 8 * 3600e3).toISOString();
  const d = s.slice(0, 10);
  return `${d.replace(/-/g, "/")}（${weekday(d)}）${s.slice(11, 16)}`;
}

// ───────────────────────── 設定 ─────────────────────────

export async function loadSettings(): Promise<Settings> {
  const def: Settings = { favorites: ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"], ads: 10 };
  try {
    const json = await platform().loadSettingsJSON();
    return json ? { ...def, ...JSON.parse(json) } : def;
  } catch (_) {
    return def;
  }
}

export function saveSettings(s: Settings): void {
  platform().saveSettingsJSON(JSON.stringify(s, null, 1));
}

const cacheGet = (name: string) => platform().cacheGet(name);
const cacheSet = (name: string, v: string) => platform().cacheSet(name, v);

// ───────────────────────── 網路與解析 ─────────────────────────

async function get(url: string): Promise<{ ok: boolean; body: string }> {
  const r = await platform().fetchText(url, { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" });
  return { ok: r.status >= 200 && r.status < 300, body: r.body };
}

async function getText(url: string): Promise<string> {
  const r = await get(url);
  if (!r.ok) throw new Error("網站暫時讀不到：" + url);
  return r.body;
}

// 解析器在隱藏的 WebView 裡用瀏覽器原生 DOMParser 跑，比正規表達式穩定。
// 解析器原始碼（parsers.ts）在建置時編成 JS 字串 PARSERS_JS，兩個 App 共用。
type ParserName = keyof typeof import("./parsers");
async function parseMany<T>(name: ParserName, htmls: string[]): Promise<T[]> {
  const body =
    `${PARSERS_JS}\nvar hs=${JSON.stringify(htmls)};` +
    `try{return JSON.stringify({ok:true,v:hs.map(function(x){return ${name}(new DOMParser().parseFromString(x,'text/html'));})});}` +
    `catch(e){return JSON.stringify({ok:false,e:String(e&&e.message||e)});}`;
  const r = JSON.parse(await platform().runInWebView(body));
  if (!r.ok) throw new Error(r.e);
  return r.v as T[];
}
const parse = async <T,>(name: ParserName, html: string) => (await parseMany<T>(name, [html]))[0];

// ───────────────────────── 資料來源 ─────────────────────────

export async function loadCinemas(): Promise<Cinema[]> {
  let list: TwCinema[] = [];
  try {
    list = await parse<TwCinema[]>("parseTwIndex", await getText(TW + "/cinemas/"));
    if (list.length) cacheSet("cinemas.json", JSON.stringify(list));
  } catch (e) {
    const c = cacheGet("cinemas.json");
    if (!c) throw e;
    list = JSON.parse(c);
  }
  const tw: Cinema[] = list.map((c) => ({ ...c, source: "tw" as Source, url: `${TW}/cinemas/${c.id}/` }));
  return tw.concat(EXTRA, await loadAtTheaters());
}

// ───────── 開眼電影網：場次通沒收的戲院 ─────────
const AT = "https://www.atmovies.com.tw";

function splitAddress(addr: string, region: string): { city: string; district: string } {
  const a = addr.replace(/臺/g, "台");
  const m = a.match(/^(\S{2}[市縣])(\S{1,3}?[區鎮鄉市])/);
  return m ? { city: m[1], district: m[2] } : { city: AT_REGIONS[region] || "其他", district: "" };
}

function atCinema(id: string, region: string, name: string, address: string): Cinema {
  const { city, district } = splitAddress(address, region);
  return { id: "at-" + id, name, city, district, source: "at", url: `${AT}/showtime/${id}/${region}/`, address, aliases: "開眼" };
}

/** 內建清單＋每 7 天到開眼各地區頁掃一次，自動加入新出現的戲院 */
async function loadAtTheaters(): Promise<Cinema[]> {
  const builtin = AT_BUILTIN.map(([id, region, name, address]) => atCinema(id, region, name, address));
  const known = new Set<string>([...AT_COVERED, ...AT_SKIP, ...AT_BUILTIN.map((r) => r[0])]);
  let found: AtTheater[] = [];
  const cached = cacheGet("at-theaters.json");
  const parsed = cached ? (JSON.parse(cached) as { at: number; list: AtTheater[] }) : null;
  if (parsed && Date.now() - parsed.at < 7 * 864e5) {
    found = parsed.list;
  } else {
    try {
      const regions = Object.keys(AT_REGIONS);
      const pages = await Promise.all(regions.map((r) => getText(`${AT}/showtime/${r}/`).catch(() => "<html><body></body></html>")));
      const lists = await parseMany<AtTheater[]>("parseAtRegion", pages);
      found = ([] as AtTheater[]).concat(...lists.map((l, i) => l.filter((t) => t.region === regions[i])));
      if (found.length) cacheSet("at-theaters.json", JSON.stringify({ at: Date.now(), list: found }));
    } catch (_) {
      found = parsed ? parsed.list : [];
    }
  }
  const extra = found.filter((t) => !known.has(t.id)).map((t) => atCinema(t.id, t.region, t.name, ""));
  return builtin.concat(extra);
}

const atDayCache: Record<string, AtDay> = {};
async function atDay(c: Cinema, date?: string): Promise<AtDay> {
  const url = date ? `${c.url}${date.replace(/-/g, "")}/` : c.url;
  if (!atDayCache[url]) atDayCache[url] = await parse<AtDay>("parseAtDay", await getText(url));
  return atDayCache[url];
}

const twDayCache: Record<string, TwDay> = {};
async function twDay(c: Cinema, date?: string): Promise<TwDay> {
  const key = c.id + "|" + (date || "");
  if (!twDayCache[key]) {
    const url = date ? `${TW}/cinemas/${c.id}/${date}/` : c.url;
    twDayCache[key] = await parse<TwDay>("parseTwDay", await getText(url));
  }
  return twDayCache[key];
}

const multiCache: Record<string, MultiDay> = {};
async function multiDay(c: Cinema): Promise<MultiDay> {
  if (multiCache[c.id]) return multiCache[c.id];
  let r: MultiDay;
  if (c.source === "eslite") r = await parse<MultiDay>("parseEslite", await getText(c.url));
  else if (c.source === "spot-hs") r = await parse<MultiDay>("parseSpotHs", await getText(c.url));
  else if (c.source === "lux") r = await luxCinema();
  else r = await spotTaipei();
  multiCache[c.id] = r;
  return r;
}

// 光點台北：首頁時刻表是圖片，改讀最近幾個月每部片的介紹頁（網址有規則，不用手動更新）
// 樂聲影城：場次頁列出多天場次（只有月/日），片長與分級要另外讀每部片的介紹頁
// 官網限台灣 IP 連線，海外或開 VPN 會讀不到。
const LUX_HALL: Record<string, string> = { XL: "XL 巨幕廳（800 席）", L: "L 大廳（218 席）" };
async function luxCinema(): Promise<MultiDay> {
  const base = "https://www.luxcinema.com.tw/web/";
  const page = await getText(base + "2020.php?type=ShowTimes");
  if (/僅限台灣地區/.test(page)) throw new Error("樂聲官網只接受台灣的連線，請關閉 VPN 後再試");
  const films = await parse<LuxFilm[]>("parseLux", page);
  const details = await parseMany<{ runtime: number; rating: string }>("parseLuxFilm",
    await Promise.all(films.map((f) => getText(`${base}2020-movie_item.php?film_id=${f.id}`).catch(() => "<html><body></body></html>")))
  );
  const today = todayTPE();
  const y0 = Number(today.slice(0, 4));
  const schedules: Record<string, Movie[]> = {};
  films.forEach((f, idx) => {
    for (const e of f.entries) {
      const mmdd = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
      const day = [y0 - 1, y0, y0 + 1]
        .map((y) => `${y}-${mmdd}`)
        .sort((a, b) => Math.abs(Date.parse(a) - Date.parse(today)) - Math.abs(Date.parse(b) - Date.parse(today)))[0];
      const list = schedules[day] || (schedules[day] = []);
      let m = list.find((x) => x.title === f.title);
      if (!m) list.push((m = { title: f.title, runtime: details[idx]?.runtime || 0, rating: details[idx]?.rating || "", versions: [] }));
      for (const t of e.times) {
        const label = LUX_HALL[t.hall] || (t.hall ? `${t.hall} 廳` : "其他影廳");
        let v = m.versions.find((x) => x.label === label);
        if (!v) m.versions.push((v = { label, times: [] }));
        if (v.times.indexOf(t.t) < 0) v.times.push(t.t);
      }
    }
  });
  for (const list of Object.values(schedules))
    for (const m of list) {
      for (const v of m.versions) v.times.sort(byShowtime);
      const rank = (l: string) => (Object.values(LUX_HALL).indexOf(l) + 1 || 99); // 巨幕廳、大廳在前，其他影廳最後
      m.versions.sort((a, b) => rank(a.label) - rank(b.label));
    }
  return { schedules, notice: "樂聲官網沒有標影廳的場次會列在「其他影廳」。" };
}

/** 從版本名稱取出影廳（光點華山「第 2 廳｜字幕…」、樂聲「XL 巨幕廳（800 席）」），沒有就回傳空字串 */
export function hallOf(label: string): string {
  const m = String(label || "").match(/^(第 ?\d+ ?廳|[A-Za-z0-9]+ ?(?:巨幕廳|大廳|廳))/);
  return m ? m[1] : "";
}

/** 場次排序：凌晨場（00:00–04:59）排在當天最後 */
export const byShowtime = (a: string, b: string) => ((isLate(a) ? "2" : "1") + a).localeCompare((isLate(b) ? "2" : "1") + b);

async function spotTaipei(): Promise<MultiDay> {
  const today = todayTPE();
  const urls: string[] = [];
  for (let k = -3; k <= 1; k++) {
    const d = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + k, 1));
    const ym = d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, "0");
    for (let m = 1; m <= 15; m++) urls.push(`https://www.spot.org.tw/movies/${ym}/m${m}/movies${ym}_m${m}.html`);
  }
  const pages = await Promise.all(urls.map((u) => get(u).catch(() => ({ ok: false, body: "" }))));
  const htmls = pages.filter((p) => p.ok && /movie_title/.test(p.body)).map((p) => p.body);
  const films = (await parseMany<SpotMovie | null>("parseSpotMovie", htmls)).filter(Boolean) as SpotMovie[];
  const schedules: Record<string, Movie[]> = {};
  const y0 = Number(today.slice(0, 4));
  for (const f of films) {
    for (const e of f.entries) {
      const mmdd = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
      // 官網沒寫年份：取最接近今天的年份
      const day = [y0 - 1, y0, y0 + 1]
        .map((y) => `${y}-${mmdd}`)
        .sort((a, b) => Math.abs(Date.parse(a) - Date.parse(today)) - Math.abs(Date.parse(b) - Date.parse(today)))[0];
      const list = schedules[day] || (schedules[day] = []);
      let m = list.find((x) => x.title === f.title);
      if (!m) list.push((m = { title: f.title, runtime: f.runtime, versions: [{ label: "官方場次", times: [] }] }));
      for (const t of e.times) if (m.versions[0].times.indexOf(t) < 0) m.versions[0].times.push(t);
      m.versions[0].times.sort();
    }
  }
  return { schedules, notice: "" };
}

export async function datesOf(c: Cinema): Promise<{ dates: string[]; address: string; notice: string; site?: string }> {
  const today = todayTPE();
  if (c.source === "at") {
    // 開眼通常只有今天的場次，晚一點才會有明天；兩天都試
    const days = await Promise.all([atDay(c), atDay(c, addDays(today, 1)).catch(() => null)]);
    const dates = days.filter((d): d is AtDay => !!d && !!d.date && d.movies.length > 0 && d.date >= today).map((d) => d.date);
    const addr = days[0]?.address || c.address || "";
    return {
      dates: Array.from(new Set(dates)).sort(),
      address: addr,
      site: days[0]?.site || "",
      notice: "這間的場次來自開眼電影網，通常只公布今天（晚上才會有明天）。其他日期請點下方「影城官網」查詢。",
    };
  }
  if (c.source === "tw") {
    const d = await twDay(c);
    const future = d.dates.filter((x) => x >= today);
    return { dates: future.length ? future : d.dates, address: d.address, notice: "", site: d.booking || "" };
  }
  const m = await multiDay(c);
  const dates = Object.keys(m.schedules).filter((x) => x >= today).sort();
  return { dates, address: c.address || "", notice: m.notice, site: c.url };
}

export async function moviesOf(c: Cinema, date: string): Promise<{ movies: Movie[]; booking: string; sourceUrl: string; address: string }> {
  if (c.source === "at") {
    let d = await atDay(c);
    if (d.date !== date) d = await atDay(c, date);
    return { movies: await fillRuntimes(d.movies), booking: d.site, sourceUrl: `${c.url}${date.replace(/-/g, "")}/`, address: d.address || c.address || "" };
  }
  if (c.source === "tw") {
    let d = await twDay(c);
    if (d.date !== date) d = await twDay(c, date);
    if (d.date && d.date !== date) throw new Error("網站回傳的日期和選擇的不同，請稍後再試");
    return { movies: await fillRuntimes(d.movies), booking: d.booking, sourceUrl: `${TW}/cinemas/${c.id}/${date}/`, address: d.address };
  }
  const m = await multiDay(c);
  return { movies: await fillRuntimes(m.schedules[date] || []), booking: c.url, sourceUrl: c.url, address: c.address || "" };
}

// ───────────────────────── 補片長（TMDB） ─────────────────────────
// 場次通的重映、修復版、演唱會等有時沒有片長：用 TMDB（themoviedb.org）查片名補上。
// 需要使用者自己的 API Read Access Token（設定裡填），沒填就不補。

const normTitle = (t: string) =>
  String(t || "").toLowerCase().replace(/[\s:：·・\-–—!！?？,，.。'"’「」『』《》()（）\[\]【】]/g, "");
/** 去掉「4K重映」「全新4K修復版」「(4K修復)」「加碼重映」等字，查原片 */
const REISSUE_WORDS = "全新|加碼|數位|[248]K|修復|重映|重製|再映|經典|紀念|\\d*週年";
export function baseTitle(t: string): string {
  let s = String(t || "").replace(/[《》]/g, "").trim();
  for (let i = 0; i < 3; i++) {
    const before = s;
    // 結尾括號裡是重映字樣：讓子彈飛(4K修復)、XXX【數位修復版】
    s = s.replace(new RegExp(`\\s*[（(\\[【][^）)\\]】]*(?:${REISSUE_WORDS})[^）)\\]】]*[）)\\]】]\\s*$`, "i"), "");
    // 結尾直接接重映字樣：讓子彈飛 全新4K修復版、進擊的鼓手 4K重映
    s = s.replace(new RegExp(`[\\s:：\\-–—]*(?:${REISSUE_WORDS})+(?:版本?)?\\s*$`, "i"), "");
    if (s === before) break;
  }
  return s.trim() || String(t || "").trim();
}

const TMDB = "https://api.themoviedb.org/3";
async function tmdb(path: string, token: string): Promise<any> {
  const r = await platform().fetchText(TMDB + path, { Authorization: "Bearer " + token, accept: "application/json" });
  if (r.status === 401) throw new Error("TMDB Token 無效，請到設定重新填寫");
  if (r.status < 200 || r.status >= 300) throw new Error("TMDB 暫時讀不到");
  return JSON.parse(r.body);
}

interface TmdbHit { id: number; r: number; p: string; at: number }
/** 用 TMDB 依片名找電影（id、片長、海報）。結果記在快取：找到的 30 天、找不到的 1 天 */
async function tmdbFind(title: string, token: string): Promise<TmdbHit | null> {
  const q = baseTitle(title);
  const key = normTitle(q);
  if (!key || !token) return null;
  const read = (): Record<string, TmdbHit> => {
    try {
      return JSON.parse(cacheGet("runtimes.json") || "{}") || {};
    } catch (_) {
      return {};
    }
  };
  const hit = read()[key];
  if (hit && "id" in hit && Date.now() - hit.at < (hit.id ? 30 : 1) * 86400e3) return hit.id ? hit : null;
  const found = await tmdb(`/search/movie?language=zh-TW&query=${encodeURIComponent(q)}`, token);
  const results: any[] = found?.results || [];
  const pick = results.find((x) => normTitle(x.title) === key || normTitle(x.original_title) === key) || results[0];
  const v: TmdbHit = { id: 0, r: 0, p: "", at: Date.now() };
  if (pick?.id) {
    const d = await tmdb(`/movie/${pick.id}?language=zh-TW`, token);
    v.id = pick.id;
    v.r = Number(d?.runtime) || 0;
    v.p = d?.poster_path || pick.poster_path || "";
  }
  const cache = read();
  cache[key] = v;
  cacheSet("runtimes.json", JSON.stringify(cache));
  return v.id ? v : null;
}

/** 用 TMDB 查片長（0 = 查不到） */
export async function tmdbRuntime(title: string, token: string): Promise<number> {
  return (await tmdbFind(title, token))?.r || 0;
}

// ───────────────────────── 海報、預告片 ─────────────────────────

export interface MovieExtras {
  poster: string; // 海報網址（可能是空字串）
  trailer: string; // YouTube 預告網址；找不到時是 YouTube 搜尋頁
  trailerName: string; // 找到的影片標題；空字串 = 只是搜尋
}
const extrasCache: Record<string, Promise<MovieExtras>> = {};

/** 海報：場次通電影頁（不需 Token）→ TMDB；預告：TMDB 的 YouTube 影片 → YouTube 搜尋 */
export function movieExtras(title: string, slug?: string): Promise<MovieExtras> {
  const k = (slug || "") + "|" + title;
  return (extrasCache[k] ||= (async () => {
    const base = baseTitle(title);
    const out: MovieExtras = {
      poster: "",
      trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(base + " 預告")}`,
      trailerName: "",
    };
    // 場次通的海報：有 slug 直接讀；沒有就從電影清單比對片名
    try {
      let s = slug;
      if (!s) {
        const list = await loadMovies();
        const key = normTitle(title), bkey = normTitle(base);
        s = (list.find((m) => normTitle(m.title) === key) || list.find((m) => normTitle(baseTitle(m.title)) === bkey))?.slug;
      }
      if (s) out.poster = (await movieDay(s)).image || "";
    } catch (_) {}
    const token = ((await loadSettings()).tmdbToken || "").trim();
    if (token) {
      try {
        const hit = await tmdbFind(title, token);
        if (hit) {
          if (!out.poster && hit.p) out.poster = "https://image.tmdb.org/t/p/w500" + hit.p;
          const pickVideo = (list: any[]) =>
            list.filter((v) => v.site === "YouTube" && v.key).sort((a, b) => rankVideo(a) - rankVideo(b))[0];
          const rankVideo = (v: any) => (v.type === "Trailer" ? 0 : v.type === "Teaser" ? 1 : 2) + (v.official ? 0 : 0.5);
          let v = pickVideo((await tmdb(`/movie/${hit.id}/videos?language=zh-TW`, token))?.results || []);
          if (!v) v = pickVideo((await tmdb(`/movie/${hit.id}/videos`, token))?.results || []);
          if (v) {
            out.trailer = `https://www.youtube.com/watch?v=${v.key}`;
            out.trailerName = String(v.name || "預告片");
          }
        }
      } catch (_) {}
    }
    return out;
  })());
}

/** 沒有片長的電影，從 TMDB 補上（會標記 runtimeFrom）；沒設定 Token 或查詢失敗就原樣回傳 */
export async function fillRuntimes<T extends { title: string; runtime: number; runtimeFrom?: string }>(movies: T[]): Promise<T[]> {
  const todo = movies.filter((m) => !m.runtime);
  if (!todo.length) return movies;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return movies;
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: Math.min(4, queue.length) }, async () => {
      for (let m = queue.shift(); m; m = queue.shift()) {
        try {
          const r = await tmdbRuntime(m.title, token);
          if (r) {
            m.runtime = r;
            m.runtimeFrom = "TMDB";
          }
        } catch (_) {}
      }
    })
  );
  return movies;
}

/** 設定頁「測試」用：回傳查到的片名與片長，Token 錯誤會丟出錯誤 */
export async function tmdbTest(token: string): Promise<string> {
  const d = await tmdb(`/movie/244786?language=zh-TW`, token.trim());
  return `${d.title}：${d.runtime} 分鐘`;
}

// ───────────────────────── 互動元件 ─────────────────────────

// ───────────────────────── 依電影找影城（場次通） ─────────────────────────

let moviesCache: TwMovie[] | null = null;
/** 場次通的電影清單（上映中＋即將上映） */
export async function loadMovies(): Promise<TwMovie[]> {
  if (!moviesCache) moviesCache = await fillRuntimes(await parse<TwMovie[]>("parseTwMovies", await getText(TW + "/movies/")));
  return moviesCache;
}

const movieDayCache: Record<string, TwMovieDay> = {};
/** 某部電影某天在哪些影城放映（不給日期 = 今天） */
export async function movieDay(slug: string, date?: string): Promise<TwMovieDay> {
  const path = encodeURIComponent(slug).replace(/%3A/gi, ":");
  const url = `${TW}/movies/${path}/${date ? date + "/" : ""}`;
  if (!movieDayCache[url]) {
    const d = await parse<TwMovieDay>("parseTwMovieDay", await getText(url));
    await fillRuntimes([d]);
    movieDayCache[url] = d;
  }
  return movieDayCache[url];
}

/** 影城地址：清單或電影頁沒有時，讀一次影城頁補上 */
export async function cinemaAddress(c: Cinema): Promise<string> {
  if (c.address) return c.address;
  try {
    return (await datesOf(c)).address || "";
  } catch (_) {
    return "";
  }
}

// ───────────────────────── 特殊廳 ─────────────────────────

export const FORMATS = ["IMAX", "4DX", "ScreenX", "MX4D", "杜比"] as const;
export type Format = (typeof FORMATS)[number];
const FORMAT_RE: Record<Format, RegExp> = {
  IMAX: /IMAX/i,
  "4DX": /4DX/i,
  ScreenX: /SCREEN\s*X/i,
  MX4D: /MX4D/i,
  杜比: /DOLBY|杜比/i,
};

/** 版本標籤屬於哪些特殊廳，例如「IMAX 雷射 英語」→ ["IMAX"] */
export function formatsOf(label: string): Format[] {
  return FORMATS.filter((f) => FORMAT_RE[f].test(label));
}

/** 只留下符合特殊廳的版本；format 為空時原樣回傳 */
export function filterVersions(versions: Version[], format: Format | "" | undefined): Version[] {
  return format ? versions.filter((v) => formatsOf(v.label).indexOf(format) >= 0) : versions;
}

// ───────────────────────── 距離 ─────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

/** 兩點直線距離（公里） */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function cinemaPos(c: Cinema): LatLng | null {
  const g = GEO[c.id];
  return g ? { lat: g[0], lng: g[1] } : null;
}

/** 依距離排序；沒有座標的影城排最後 */
export function nearest(cinemas: Cinema[], me: LatLng, limit = 20): { cinema: Cinema; km: number | null }[] {
  return cinemas
    .map((c) => {
      const p = cinemaPos(c);
      return { cinema: c, km: p ? distanceKm(me, p) : null };
    })
    .sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9))
    .slice(0, limit);
}

export function kmLabel(km: number | null | undefined): string {
  if (km === null || km === undefined) return "";
  return km < 1 ? `${Math.round(km * 1000)} 公尺` : `${km < 10 ? km.toFixed(1) : Math.round(km)} 公里`;
}

// ───────────────────────── 現在有什麼可以看 ─────────────────────────

export interface TimeWindow {
  id: string;
  label: string;
  /** 分鐘，從 00:00 起算；凌晨場用 24:00 之後表示 */
  from: number;
  to: number;
  todayOnly?: boolean;
}

export const WINDOWS: TimeWindow[] = [
  { id: "soon", label: "接下來 3 小時", from: -1, to: -1, todayOnly: true },
  { id: "morning", label: "中午前", from: 0, to: 12 * 60 },
  { id: "afternoon", label: "下午 12–17 點", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "晚上 17–21 點", from: 17 * 60, to: 21 * 60 },
  { id: "night", label: "深夜 21 點後", from: 21 * 60, to: 29 * 60 },
  { id: "all", label: "整天", from: 0, to: 29 * 60 },
];

/** 場次在片單日的第幾分鐘；凌晨場（00:00–04:59）算到 24 點之後 */
export function showMinute(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (isLate(t) ? h + 24 : h) * 60 + m;
}

export interface Hit {
  cinema: Cinema;
  movie: Movie;
  version: Version;
  time: string;
  date: string;
  km: number | null;
  ctx: { booking: string; sourceUrl: string; address: string };
}

/** 在多間影城裡找出某天、某時段開演的所有場次 */
export async function findShowtimes(
  scope: { cinema: Cinema; km: number | null }[],
  date: string,
  win: TimeWindow,
  format: Format | "" = "",
  onProgress?: (done: number, total: number) => void
): Promise<{ hits: Hit[]; failed: string[] }> {
  let from = win.from, to = win.to;
  if (win.id === "soon") {
    const now = showMinute(nowHM());
    from = now;
    to = now + 180;
  }
  const hits: Hit[] = [];
  const failed: string[] = [];
  let done = 0;
  const queue = scope.slice();
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        const r = await moviesOf(item.cinema, date);
        for (const m of r.movies)
          for (const v of filterVersions(m.versions, format))
            for (const t of v.times) {
              const min = showMinute(t);
              if (min >= from && min < to)
                hits.push({ cinema: item.cinema, movie: m, version: v, time: t, date, km: item.km, ctx: { booking: r.booking, sourceUrl: r.sourceUrl, address: r.address } });
            }
      } catch (_) {
        failed.push(item.cinema.name);
      }
      onProgress && onProgress(++done, scope.length);
    }
  }
  await Promise.all([0, 1, 2, 3, 4, 5].map(worker)); // 同時最多 6 間，避免一次打太多網站
  hits.sort((a, b) => showMinute(a.time) - showMinute(b.time) || (a.km ?? 1e9) - (b.km ?? 1e9));
  return { hits, failed };
}

/** 把結果依電影分組，場次多的排前面 */
export function groupByMovie(hits: Hit[]): { title: string; runtime: number; rating?: string; hits: Hit[] }[] {
  const map: Record<string, { title: string; runtime: number; rating?: string; hits: Hit[] }> = {};
  for (const h of hits) {
    const g = map[h.movie.title] || (map[h.movie.title] = { title: h.movie.title, runtime: h.movie.runtime, rating: h.movie.rating, hits: [] });
    if (!g.runtime && h.movie.runtime) g.runtime = h.movie.runtime;
    g.hits.push(h);
  }
  return Object.values(map).sort((a, b) => b.hits.length - a.hits.length || showMinute(a.hits[0].time) - showMinute(b.hits[0].time));
}

// ───────────────────────── 分享 ─────────────────────────

export function shareText(p: { movie: { title: string }; version: { label: string }; cinema: Cinema; address?: string }, start: Date, end?: Date, seat?: string, app: MapsApp = "apple"): string {
  const maps = mapsUrl(p.cinema.name, p.address, app);
  return [
    `🎬 ${p.movie.title}`,
    `🕒 ${fmt(start)}${end ? ` – ${fmt(end).slice(-5)}` : ""}`,
    `📍 ${p.cinema.name}（${p.version.label}）`,
    seat ? `💺 ${seat}` : "",
    p.address ? `🏠 ${p.address}` : "",
    `🗺 ${maps}`,
  ].filter(Boolean).join("\n");
}
