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

export const normTitle = (t: string) =>
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
// TMDB 有兩種金鑰都可以用：API Key（32 碼英數）或 API Read Access Token（很長、eyJ 開頭）
const isV3Key = (t: string) => /^[0-9a-f]{32}$/i.test(t);
export const TMDB_LINKS = {
  signup: "https://www.themoviedb.org/signup",
  login: "https://www.themoviedb.org/login",
  api: "https://www.themoviedb.org/settings/api",
  request: "https://www.themoviedb.org/settings/api/request",
};
/** 從剪貼簿或輸入的文字裡找出 TMDB 金鑰（貼上整段也沒關係） */
export function extractTmdbKey(text: string): string {
  const s = String(text || "");
  return (s.match(/eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/) || s.match(/\b[0-9a-f]{32}\b/i) || [""])[0] || s.trim();
}

async function tmdb(path: string, token: string): Promise<any> {
  const url = TMDB + path + (isV3Key(token) ? (path.includes("?") ? "&" : "?") + "api_key=" + token : "");
  const headers: Record<string, string> = { accept: "application/json" };
  if (!isV3Key(token)) headers.Authorization = "Bearer " + token;
  const r = await platform().fetchText(url, headers);
  if (r.status === 401) throw new Error("TMDB 金鑰無效，請到設定重新貼上");
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
  err?: string; // 有金鑰卻查不到預告時的原因
}
const extrasCache: Record<string, Promise<MovieExtras>> = {};
/** 手機上記的海報／預告（extras.json） */
const readExtras = (): Record<string, MovieExtras & { at: number }> => {
  try {
    return JSON.parse(cacheGet("extras.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};

/** 海報：場次通電影頁（不需 Token）→ TMDB；預告：TMDB 的 YouTube 影片 → YouTube 搜尋 */
export async function movieExtras(title: string, slug?: string): Promise<MovieExtras> {
  // 找過的海報／預告網址記在手機上（找到的 7 天、沒找到的 1 天），之後不用再查；填了金鑰要重新查
  const hasToken = !!((await loadSettings()).tmdbToken || "").trim();
  const k = (hasToken ? "t|" : "n|") + (slug || "") + "|" + title;
  return (extrasCache[k] ||= (async () => {
    const ck = (hasToken ? "t|" : "n|") + normTitle(title);
    const read = readExtras;
    const hit = read()[ck] as (MovieExtras & { at: number; v?: number }) | undefined;
    // 有找到預告：記 7 天（沒海報 1 天）。沒找到預告：只記 1 小時就重查（可能只是當時連線失敗）；
    // 舊版（v 不是 2）記下的「沒預告」一律重查，因為舊版還不會取 YouTube 搜尋的第一支影片
    const ttl = !hit?.trailerName ? (hit?.v === EXTRAS_V ? 3600e3 : 0) : hit?.poster ? 7 * 86400e3 : 86400e3;
    if (hit && Date.now() - hit.at < ttl) return { poster: hit.poster, trailer: hit.trailer, trailerName: hit.trailerName };
    const out = await findExtras(title, slug);
    // 查不到預告也保留這次執行的結果（不寫進手機快取的 err 會讓下次啟動重查）；
    // 不能刪掉 memo，否則 Scriptable 讀好後重畫會再查一次，畫面上的海報會先消失
    const all = read();
    for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 86400e3) delete all[key]; // 清掉過期的
    const { err: _e, ...keep } = out;
    all[ck] = { ...keep, at: Date.now(), v: EXTRAS_V } as MovieExtras & { at: number };
    cacheSet("extras.json", JSON.stringify(all));
    return out;
  })());
}
/** extras.json 紀錄的版本：預告查法改了就加 1，讓舊的「沒預告」紀錄重查 */
const EXTRAS_V = 2;

/** 圖片網址正規化：解掉 HTML 跳脫、\\/、//host 與 http:// 都改成 https://（iOS 的 WebView／Image 不載入 http 圖片） */
export function normImageUrl(u: string): string {
  let s = String(u || "").trim().replace(/&amp;/g, "&").replace(/\\\//g, "/");
  if (s.startsWith("//")) s = "https:" + s;
  return s.replace(/^http:\/\//i, "https://");
}

/** 場次通電影頁的海報網址：有快取就直接用，沒有就只抓 og:image（不經過 WebView 解析，比較快） */
const posterMem: Record<string, Promise<string>> = {};
function twPoster(slug: string): Promise<string> {
  return (posterMem[slug] ||= (async () => {
    const path = encodeURIComponent(slug).replace(/%3A/gi, ":");
    const url = `${TW}/movies/${path}/`;
    if (movieDayCache[url]?.image) return movieDayCache[url].image!;
    const r = await get(url);
    if (!r.ok) throw new Error("no page");
    const img = normImageUrl((r.body.match(/property="og:image"\s+content="([^"]+)"/) || r.body.match(/"image":"([^"]+)"/) || [])[1] || "");
    return /og-default/.test(img) ? "" : img; // 場次通沒有海報時會放預設圖，不算
  })());
}

/** 開眼電影網的電影清單（本期首輪、近期上映、二輪）：片名 → 開眼電影編號。記在手機 1 天 */
let atIndexMem: Promise<Record<string, string>> | null = null;
function atMovieIndex(): Promise<Record<string, string>> {
  return (atIndexMem ||= (async () => {
    try {
      const c = JSON.parse(cacheGet("at-movies.json") || "null");
      if (c && Date.now() - c.at < 86400e3 && c.idx) return c.idx as Record<string, string>;
    } catch (_) {}
    const idx: Record<string, string> = {};
    await Promise.all(
      ["now", "next", "now2"].map(async (p) => {
        const html = await getText(`${AT}/movie/${p}/`).catch(() => "");
        for (const [, id, t] of html.matchAll(/<a[^>]*href="\/movie\/(f[a-z0-9]+)\/"[^>]*>\s*([^<]{1,60}?)\s*<\/a>/g)) {
          const n = normTitle(t), b = normTitle(baseTitle(t));
          if (n) idx[n] ||= id;
          if (b) idx[b] ||= id;
        }
      })
    );
    if (Object.keys(idx).length) cacheSet("at-movies.json", JSON.stringify({ at: Date.now(), idx }));
    return idx;
  })());
}
/** 開眼電影頁的海報（場次通沒有海報時的第二來源；重映、修復版常只有開眼有） */
async function atPoster(title: string): Promise<string> {
  const idx = await atMovieIndex();
  const id = idx[normTitle(title)] || idx[normTitle(baseTitle(title))];
  if (!id) return "";
  const html = await getText(`${AT}/movie/${id}/`);
  return (html.match(/property="og:image"\s+content="([^"]+)"/) || [])[1] || "";
}

/** 海報網址：場次通電影頁 → 同片名的其他場次通頁（重映、修復版）→ 開眼電影網 →（有填金鑰才）TMDB */
async function findPoster(title: string, slug?: string): Promise<string> {
  let p = await twPoster(slug || title).catch(() => ""); // 場次通的網址就是片名：先直接試，不用先下載整份電影清單
  if (p) return p;
  const list = await loadMovies();
  const key = normTitle(title), bkey = normTitle(baseTitle(title));
  const cands = list.filter((m) => m.slug !== (slug || title) && (normTitle(m.title) === key || normTitle(baseTitle(m.title)) === bkey));
  for (const c of cands) {
    p = await twPoster(c.slug).catch(() => "");
    if (p) return p;
  }
  p = await atPoster(title).catch(() => "");
  if (p) return p;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return "";
  const hit = await tmdbFind(title, token).catch(() => null);
  return hit?.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "";
}

/** 只查海報網址（約 0.3 秒），不等預告：電影頁先把海報畫出來。手機上記過的直接用（找到的 7 天、沒找到的 1 天） */
const posterOnly: Record<string, Promise<string>> = {};
export function moviePoster(title: string, slug?: string): Promise<string> {
  const k = (slug || "") + "|" + title;
  return (posterOnly[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk];
    if (hit?.poster) return hit.poster;
    const own = all["p|" + nk]; // 只查過海報的紀錄
    if (own && Date.now() - own.at < (own.poster ? 7 : 1) * 86400e3) return own.poster;
    const poster = normImageUrl(await findPoster(title, slug).catch(() => ""));
    const latest = readExtras();
    latest["p|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now() };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster;
  })());
}

/** 顯示用的海報來源：手機上有圖片快取就用本機（Scriptable 是 data: 網址、Scripting 是檔案路徑），否則用網址 */
export function posterSrc(url: string): string {
  if (!url) return "";
  try {
    return platform().cachedImage(url) || url;
  } catch (_) {
    return url;
  }
}
/** posterSrc 回傳的是本機來源（不是 http 網址） */
export const isLocalSrc = (src: string) => /^(data:|\/)/.test(src);
/** 背景把海報圖抓到手機快取（不等結果） */
export function cachePoster(url: string): void {
  if (!url) return;
  try {
    platform().cacheImage(url).catch(() => null);
  } catch (_) {}
}
const prefetched = new Set<string>();
/** 列表出現時在背景預抓：整份清單（最多 max 部）的海報網址與海報圖，一次 3 個；前 trailers 部連預告也先查，之後進電影頁就不用等 */
export function prefetchPosters(items: { title: string; slug?: string }[], max = 200, trailers = 30): void {
  const queue: { title: string; slug?: string; trailer: boolean }[] = [];
  items.slice(0, max).forEach((m, i) => {
    const k = (m.slug || "") + "|" + m.title;
    if (prefetched.has(k)) return;
    prefetched.add(k);
    queue.push({ title: m.title, slug: m.slug, trailer: i < trailers });
  });
  const run = async () => {
    for (let m = queue.shift(); m; m = queue.shift()) {
      try {
        const u = await moviePoster(m.title, m.slug);
        if (u) await platform().cacheImage(u);
        if (m.trailer) await movieExtras(m.title, m.slug);
      } catch (_) {}
    }
  };
  for (let i = 0; i < 3; i++) run();
}

async function findExtras(title: string, slug?: string): Promise<MovieExtras> {
  const base = baseTitle(title);
  const out: MovieExtras = {
    poster: "",
    trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(base + " 預告")}`,
    trailerName: "",
  };
  // 海報（場次通）與預告（TMDB）同時查
  const posterJob = findPoster(title, slug).catch(() => "");
  const token = ((await loadSettings()).tmdbToken || "").trim();
  const tmdbJob = (async () => {
    if (!token) return null;
    const hit = await tmdbFind(title, token);
    if (!hit) return { err: "TMDB 找不到這部片" };
    const pickVideo = (list: any[]) => list.filter((v) => v.site === "YouTube" && v.key).sort((a, b) => rankVideo(a) - rankVideo(b))[0];
    const rankVideo = (v: any) => (v.type === "Trailer" ? 0 : v.type === "Teaser" ? 1 : 2) + (v.official ? 0 : 0.5);
    const [zh, all] = await Promise.all([
      tmdb(`/movie/${hit.id}/videos?language=zh-TW`, token).catch(() => null),
      tmdb(`/movie/${hit.id}/videos`, token).catch(() => null),
    ]);
    const vz = pickVideo(zh?.results || []);
    const v = vz ? { ...vz, zh: true } : pickVideo(all?.results || []);
    return { poster: hit.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "", v, err: v ? "" : "TMDB 沒有這部片的預告" };
  })().catch((e) => ({ err: "TMDB " + errText(e) }));
  // 開眼電影網的電影頁有 YouTube 預告（不需要金鑰）：海報網址裡就有開眼的電影編號
  const atErr: string[] = [];
  const atJob = posterJob
    .then(async (poster) => {
      const id = (poster.match(/\/photo\d*\/(f\w+)\//) || [])[1];
      if (!id) {
        atErr.push("開眼電影網沒有這部片的預告");
        return null;
      }
      const html = await getText(`https://www.atmovies.com.tw/movie/${id}/`);
      const key = (html.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/) || [])[1];
      if (!key) atErr.push("開眼電影網沒有這部片的預告");
      return key ? { key, name: "開眼電影網預告" } : null;
    })
    .catch((e) => {
      atErr.push("開眼 " + errText(e));
      return null;
    });
  const [poster, t, at] = await Promise.all([posterJob, tmdbJob, atJob]);
  out.poster = normImageUrl(poster || (t && "poster" in t ? t.poster : "") || "");
  // 預告來源順序：TMDB 中文預告 → 開眼 → TMDB 其他語言 → YouTube 搜尋的第一個結果 → YouTube 搜尋頁
  const tv = t && "v" in t ? t.v : null;
  let pick = tv && tv.zh ? tv : at || tv;
  if (!pick) {
    const yt = await ytFirst(base + " 預告");
    if ("key" in yt) pick = yt;
    else atErr.push("YouTube " + yt.err);
  }
  if (pick) {
    out.trailer = `https://www.youtube.com/watch?v=${pick.key}`;
    out.trailerName = String(pick.name || "預告片");
  }
  if (!pick) out.err = [t?.err, ...atErr].filter(Boolean).join("；") || "找不到預告";
  return out;
}

/** YouTube 搜尋結果裡的第一支影片（優先挑標題有「預告」或 trailer 的），點了直接看、不用再從搜尋頁挑。
 *  用桌面版 UA，手機版 UA 會被轉到 m.youtube.com；結果頁約 1MB，所以只在開眼／TMDB 都沒有預告時才查 */
async function ytFirst(query: string): Promise<{ key: string; name: string } | { err: string }> {
  let r: { status: number; body: string };
  try {
    r = await platform().fetchText(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=zh-TW&gl=TW`, {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Accept-Language": "zh-TW,zh;q=0.9",
    });
  } catch (e) {
    return { err: "搜尋頁讀不到（" + errText(e) + "）" };
  }
  if (r.status < 200 || r.status >= 300) return { err: "搜尋頁回應 " + r.status };
  const list: { key: string; name: string }[] = [];
  for (const m of r.body.matchAll(/"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})"([\s\S]{0,4000}?)"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g)) {
    let name = m[3];
    try {
      name = JSON.parse('"' + name + '"');
    } catch (_) {}
    list.push({ key: m[1], name });
    if (list.length >= 5) break;
  }
  if (!list.length) return { err: /consent\.youtube|consent\.google/.test(r.body) ? "搜尋頁要求同意 Cookie" : "搜尋頁裡找不到影片（" + Math.round(r.body.length / 1024) + "KB）" };
  return list.find((v) => /預告|trailer|teaser/i.test(v.name)) || list[0];
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

// ───────────────────────── 評分：IMDb、爛番茄、爆米花 ─────────────────────────
// 不需要 TMDB 金鑰：IMDb 的搜尋建議可以直接用中文片名找到 tt 編號；有金鑰時改用 TMDB 對應的 IMDb 編號，比較準。

export interface Ratings {
  imdb?: { score: number; votes: number; url: string };
  tomato?: { score: number; certified: boolean; url: string }; // 番茄指數（影評）
  popcorn?: { score: number; url: string }; // 爆米花指數（觀眾）
  err?: string; // 查詢失敗的原因（不會存進快取，方便回報問題）
}
/** 把例外變成一句看得懂的話（不把 JSON、HTML 內容印到畫面上） */
const errText = (e: unknown): string => {
  const m = String((e as Error)?.message || e || "");
  if (/JSON|Unexpected|Unrecognized|token|SyntaxError|<|\{/i.test(m)) return "回傳的內容不是預期格式";
  if (/time|network|offline|connect|cancel|host|SSL|TLS|socket/i.test(m)) return "連線失敗";
  return m.replace(/[{}"\[\]]/g, "").trim().slice(0, 40) || "讀取失敗";
};

const IMDB_GQL = "https://api.graphql.imdb.com/";
interface Ident { id: string; name: string; year: number }

/** 找 IMDb 編號（同時拿到英文片名與年份，給爛番茄用）：有金鑰走 TMDB，否則用 IMDb 搜尋建議 */
async function identify(title: string, en: string | undefined, errs: string[]): Promise<Ident | null> {
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (token) {
    try {
      const hit = await tmdbFind(title, token);
      if (hit) {
        const [ids, d] = await Promise.all([tmdb(`/movie/${hit.id}/external_ids`, token), tmdb(`/movie/${hit.id}?language=en-US`, token)]);
        if (ids?.imdb_id) return { id: String(ids.imdb_id), name: d?.title || d?.original_title || en || "", year: Number(String(d?.release_date || "").slice(0, 4)) || 0 };
      }
    } catch (e) {
      errs.push("TMDB 暫時讀不到");
    }
  }
  for (const q of [en, baseTitle(title)].filter(Boolean) as string[]) {
    const key = q.toLowerCase().replace(/[\\/?#%]/g, " ").trim();
    try {
      const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(key)}.json`, { "User-Agent": UA });
      const d = (JSON.parse(r.body).d || []) as any[];
      const hit = d.find((x) => /^tt/.test(x.id) && (x.qid === "movie" || x.qid === "tvMovie" || x.qid === "video"));
      if (hit) return { id: hit.id, name: String(hit.l || en || ""), year: Number(hit.y) || 0 };
    } catch (e) {
      errs.push("IMDb 搜尋暫時讀不到");
    }
  }
  return null;
}

/** 爛番茄網址猜測：英文片名 → /m/the_odyssey、/m/the_odyssey_2026 */
const rtSlug = (name: string) => name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** 讀爛番茄電影頁：回傳分數與頁面上的片名／年份（用來確認猜對頁） */
async function rtPage(url: string): Promise<{ critics: number; certified: boolean; audience: number; name: string; year: number } | null> {
  const r = await get(url);
  if (!r.ok) return null;
  const page = r.body;
  const j = (page.match(/<script[^>]*id="media-scorecard-json"[^>]*>([\s\S]*?)<\/script>/) || [])[1];
  if (!j) return null;
  const d = JSON.parse(j);
  const pct = (x: any) => (x && /\d/.test(String(x.scorePercent || "")) ? Number(String(x.scorePercent).replace(/\D/g, "")) : -1);
  const ld = (page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  let name = "", year = 0;
  try {
    const o = ld ? JSON.parse(ld) : {};
    const m = String(o.name || "").match(/^(.*?)\s*\((\d{4})\)\s*$/);
    name = m ? m[1] : String(o.name || "");
    year = m ? Number(m[2]) : Number(String(o.dateCreated || "").slice(0, 4)) || 0;
  } catch (_) {}
  return { critics: pct(d.criticsScore), certified: !!d.criticsScore?.certified, audience: pct(d.audienceScore), name, year };
}

const normEn = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** 爛番茄：先直接猜網址（快），猜不到再用搜尋頁 */
async function rtFind(name: string, year: number): Promise<{ url: string; s: NonNullable<Awaited<ReturnType<typeof rtPage>>> } | null> {
  const okYear = (y: number) => !year || !y || Math.abs(y - year) <= 1;
  const okName = (n: string) => !n || normEn(n) === normEn(name) || normEn(n).startsWith(normEn(name));
  const slug = rtSlug(name);
  if (slug) {
    const urls = [`https://www.rottentomatoes.com/m/${slug}`, ...(year ? [`https://www.rottentomatoes.com/m/${slug}_${year}`] : [])];
    const pages = await Promise.all(urls.map((u) => rtPage(u).catch(() => null)));
    // 有年份的網址比較明確，先看它
    for (const i of pages.length > 1 ? [1, 0] : [0]) {
      const s = pages[i];
      if (s && okYear(s.year) && okName(s.name)) return { url: urls[i], s };
    }
  }
  const html = await getText(`https://www.rottentomatoes.com/search?search=${encodeURIComponent(name)}`);
  const list: { year: number; url: string; title: string }[] = [];
  for (const m of html.matchAll(/<search-page-media-row([\s\S]*?)<\/search-page-media-row>/g)) {
    const b = m[1];
    const url = (b.match(/href="(https:\/\/www\.rottentomatoes\.com\/m\/[^"]+)"[^>]*slot="title"/) || b.match(/href="(https:\/\/www\.rottentomatoes\.com\/m\/[^"]+)"/) || [])[1];
    if (!url) continue;
    const t = (b.match(/slot="title"[^>]*>\s*([^<]+?)\s*</) || [])[1] || "";
    list.push({ year: Number((b.match(/release-year="(\d*)"/) || [])[1] || 0), url, title: t.replace(/&amp;/g, "&").replace(/&#39;/g, "'") });
  }
  const pick =
    list.find((x) => normEn(x.title) === normEn(name) && okYear(x.year)) ||
    list.find((x) => year && Math.abs(x.year - year) <= 1 && normEn(x.title).includes(normEn(name)));
  if (!pick) return null;
  const s = await rtPage(pick.url);
  return s ? { url: pick.url, s } : null;
}

async function findRatings(title: string, en?: string): Promise<Ratings> {
  const out: Ratings = {};
  const errs: string[] = [];
  const who = await identify(title, en, errs);
  if (!who) {
    out.err = errs.join("；") || "IMDb 上找不到這部片";
    return out;
  }
  // IMDb 評分與爛番茄同時查
  const imdbJob = (async () => {
    const url = `https://www.imdb.com/title/${who.id}/`;
    // 找到片但 IMDb 還沒有評分（新片、兒童片常見）：不算錯誤，畫面上就顯示「-」
    // 1) IMDb 的公開評分檔（不需要特殊標頭，手機上最穩）
    try {
      const r = await platform().fetchText(`https://p.media-imdb.com/static-content/documents/v1/title/${who.id}/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json`, { "User-Agent": UA });
      const j = JSON.parse(r.body.replace(/^[^{]*/, "").replace(/\)\s*$/, ""));
      if (j?.resource) {
        const score = Number(j.resource.rating) || 0;
        if (score) out.imdb = { score, votes: Number(j.resource.ratingCount) || 0, url };
        return; // 有回資料：有分就有分，沒分就是還沒有評分
      }
    } catch (_) {
      // 評分檔讀不到或不是 JSON（例如回 HTML 錯誤頁）：改用備用來源
    }
    // 2) 備用：IMDb GraphQL（需要特定標頭）
    const q = `{ title(id:"${who.id}"){ ratingsSummary{aggregateRating voteCount} } }`;
    const r = await platform().fetchText(`${IMDB_GQL}?query=${encodeURIComponent(q)}`, {
      "User-Agent": UA,
      "content-type": "application/json",
      "x-imdb-client-name": "imdb-web-next-localized",
      Referer: "https://www.imdb.com/",
    });
    if (r.status < 200 || r.status >= 300) throw new Error("status " + r.status);
    const t = JSON.parse(r.body)?.data?.title;
    const score = Number(t?.ratingsSummary?.aggregateRating) || 0;
    if (score) out.imdb = { score, votes: Number(t.ratingsSummary.voteCount) || 0, url };
    // 沒分數：IMDb 上還沒有評分，不算錯誤
  })().catch(() => errs.push("IMDb 評分暫時讀不到"));
  const rtJob = (async () => {
    if (!who.name) return;
    const f = await rtFind(who.name, who.year);
    if (!f) return;
    if (f.s.critics >= 0) out.tomato = { score: f.s.critics, certified: f.s.certified, url: f.url };
    if (f.s.audience >= 0) out.popcorn = { score: f.s.audience, url: f.url };
  })().catch(() => errs.push("爛番茄暫時讀不到"));
  await Promise.all([imdbJob, rtJob]);
  if (errs.length) out.err = errs.join("；");
  return out;
}

const ratingsMem: Record<string, Promise<Ratings>> = {};
/** 評分（記在手機 3 天；查不到的下次打開再試） */
export function movieRatings(title: string, en?: string): Promise<Ratings> {
  const k = normTitle(title);
  return (ratingsMem[k] ||= (async () => {
    const read = (): Record<string, Ratings & { at: number }> => {
      try {
        return JSON.parse(cacheGet("ratings.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()[k];
    if (hit && Date.now() - hit.at < 3 * 86400e3 && (hit.imdb || hit.tomato || hit.popcorn)) return hit;
    const r = await findRatings(title, en);
    // 沒查到或有錯：不寫進手機快取（下次啟動再試），但這次執行內記住結果，重畫時不用再查
    if (r.imdb || r.tomato || r.popcorn) {
      const all = read();
      for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 3 * 86400e3) delete all[key];
      const { err: _e, ...keep } = r;
      all[k] = { ...keep, at: Date.now() };
      cacheSet("ratings.json", JSON.stringify(all));
    }
    return r;
  })());
}

/** 評分顏色等級：good（綠）／mid（黃）／bad（紅） */
export function ratingTier(kind: "imdb" | "pct", v: number): "good" | "mid" | "bad" {
  const x = kind === "imdb" ? v * 10 : v;
  return x >= 75 ? "good" : x >= 60 ? "mid" : "bad";
}

// ───────────────────────── 版本檢查 ─────────────────────────

const VERSION_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/version.json";
/** Scripting 一鍵重新匯入（會覆蓋成 GitHub 上的最新版，設定不受影響） */
export const SCRIPTING_IMPORT_URL =
  "https://www.scripting.fun/import_scripts?urls=%5B%22https%3A%2F%2Fgithub.com%2Fmorgan91204%2Fscriptable-movie-schedule%2Ftree%2Fmain%2Fscripting%22%5D";
const verNum = (v: string) => Number(String(v || "").replace(/\D/g, "")) || 0; // 2026.11.05-2139 與 2026.11.05.2139 都變成 202611052139

/** 查 GitHub 上的最新版本；查不到回傳 null */
export async function checkLatest(current: string): Promise<{ latest: string; isLatest: boolean } | null> {
  try {
    const r = await platform().fetchText(VERSION_URL + "?t=" + Date.now(), { accept: "application/json" });
    if (r.status < 200 || r.status >= 300) return null;
    const latest = String(JSON.parse(r.body).version || "");
    if (!latest) return null;
    return { latest, isLatest: verNum(current) >= verNum(latest) };
  } catch (_) {
    return null;
  }
}

// ───────────────────────── 訂票 ─────────────────────────

/** 各連鎖的官方 App（App Store 台灣區 ID）。順序有意義：美麗新要在美麗華前面 */
// schemes：可能的 App 網址開頭（官方沒有公開；從 App Store 的 bundle id 推測，bundle id 本身也常被拿來當 scheme）；Scripting 版會逐一試開，有裝就直接進 App
// bundle id（2026-11 由 itunes.apple.com/lookup 查得）：威秀 com.vieshow.vscinemas、秀泰 tw.com.maimai.showtimes、國賓 tw.com.langshin.AmbassadorLookMovie、
// 新光 com.bonjays.skcinema.test、美麗新 tw.com.miramarcinemas.MiramarCinemasBookingOnline、美麗華 com.movie.Mirmar、喜樂時代 com.century-asia.app、樂聲 com.studiow.luxcinema、百老匯 com.broadwaycinemas.app
export const CINEMA_APPS: { re: RegExp; name: string; id: string; schemes: string[] }[] = [
  { re: /威秀|MUVIE|^vscinemas/i, name: "威秀影城", id: "6761522320", schemes: ["vscinemas", "vieshow", "vieshowcinemas", "com.vieshow.vscinemas"] },
  { re: /秀泰|^showtimes/i, name: "秀泰影城", id: "1152850053", schemes: ["showtimes", "showtimescinema", "maimaishowtimes", "tw.com.maimai.showtimes"] },
  { re: /國賓|^ambassador/i, name: "國賓看電影", id: "435465064", schemes: ["ambassador", "ambassadorlookmovie", "ambassadortheatres", "tw.com.langshin.AmbassadorLookMovie"] },
  { re: /新光影城|^skcinemas/i, name: "新光影城", id: "6747376383", schemes: ["skcinemas", "skcinema", "com.bonjays.skcinema.test", "com.bonjays.skcinema"] },
  { re: /美麗新/, name: "美麗新影城", id: "581548701", schemes: ["miramarcinemas", "miramarcinemasbookingonline", "tw.com.miramarcinemas.MiramarCinemasBookingOnline"] },
  { re: /美麗華|^miramar/i, name: "美麗華影城", id: "1446574681", schemes: ["miramar", "mirmar", "miramarcinema", "com.movie.Mirmar"] },
  { re: /喜樂時代|^centuryasia/i, name: "喜樂時代影城", id: "6751645458", schemes: ["centuryasia", "century-asia", "com.century-asia.app"] },
  { re: /樂聲|^lux$/i, name: "樂聲影城", id: "833368283", schemes: ["luxcinema", "lux", "com.studiow.luxcinema"] },
  { re: /百老匯/, name: "龍祥百老匯影城", id: "6446755867", schemes: ["broadwaycinemas", "broadway", "com.broadwaycinemas.app"] },
];

/** 這間影城的官方 App（沒有就回傳 null） */
export function cinemaApp(c: Cinema): { name: string; id: string; url: string; schemes: string[] } | null {
  const a = CINEMA_APPS.find((x) => x.re.test(c.name) || x.re.test(c.id));
  // itms-apps:// 直接打開 App Store 的 App 頁：已安裝會顯示「打開」，沒安裝可以直接下載
  return a ? { name: a.name, id: a.id, url: `itms-apps://apps.apple.com/tw/app/id${a.id}`, schemes: a.schemes } : null;
}

/** 訂票網頁：場次頁給的官方訂票連結 → 影城官網 → 時刻表 */
export async function bookingUrl(p: { cinema: Cinema; booking?: string }): Promise<string> {
  if (p.booking) return p.booking;
  try {
    return (await datesOf(p.cinema)).site || p.cinema.url;
  } catch (_) {
    return p.cinema.url;
  }
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
