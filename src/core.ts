// 資料層：型別、設定檔、網路、四個來源的讀取。畫面在 main.tsx。
import { parseTwIndex, parseTwDay, parseEslite, parseSpotHs, parseSpotMovie, parseLux, parseLuxFilm, parseAtRegion, parseAtDay } from "./parsers";
import { AT_BUILTIN, AT_COVERED, AT_SKIP, AT_REGIONS } from "./at-list";
import type { Movie, Version, TwCinema, TwDay, MultiDay, SpotMovie, LuxFilm, AtTheater, AtDay } from "./parsers";
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

// ───────────────────────── 設定（iCloud） ─────────────────────────

function storage(): { fm: FileManager; dir: string } {
  let fm: FileManager;
  try {
    fm = FileManager.iCloud();
    fm.documentsDirectory();
  } catch (_) {
    fm = FileManager.local();
  }
  const dir = fm.joinPath(fm.documentsDirectory(), "電影行程");
  if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
  return { fm, dir };
}

export async function loadSettings(): Promise<Settings> {
  const def: Settings = { favorites: ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"], ads: 10 };
  try {
    const { fm, dir } = storage();
    const p = fm.joinPath(dir, "設定.json");
    if (!fm.fileExists(p)) return def;
    await fm.downloadFileFromiCloud(p);
    return { ...def, ...JSON.parse(fm.readString(p)) };
  } catch (_) {
    return def;
  }
}

export function saveSettings(s: Settings): void {
  try {
    const { fm, dir } = storage();
    fm.writeString(fm.joinPath(dir, "設定.json"), JSON.stringify(s, null, 1));
  } catch (_) {}
}

function cacheGet(name: string): string | null {
  try {
    const fm = FileManager.local();
    const p = fm.joinPath(fm.cacheDirectory(), "movie-" + name);
    return fm.fileExists(p) ? fm.readString(p) : null;
  } catch (_) {
    return null;
  }
}
function cacheSet(name: string, v: string): void {
  try {
    const fm = FileManager.local();
    fm.writeString(fm.joinPath(fm.cacheDirectory(), "movie-" + name), v);
  } catch (_) {}
}

// ───────────────────────── 網路與解析 ─────────────────────────

async function get(url: string): Promise<{ ok: boolean; body: string }> {
  const r = new Request(url);
  r.headers = { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" };
  r.timeoutInterval = 20;
  const body = await r.loadString();
  const code = (r.response && (r.response as any).statusCode) || 200;
  return { ok: code >= 200 && code < 300, body };
}

async function getText(url: string): Promise<string> {
  const r = await get(url);
  if (!r.ok) throw new Error("網站暫時讀不到：" + url);
  return r.body;
}

// 解析器在隱藏的 WebView 裡用瀏覽器原生 DOMParser 跑，比正規表達式穩定。
let web: WebView | null = null;
async function parseMany<T>(fn: Function, htmls: string[]): Promise<T[]> {
  if (!web) {
    web = new WebView();
    await web.loadHTML("<html><body></body></html>", TW + "/");
  }
  const js =
    `(function(){var f=(${fn.toString()});var hs=${JSON.stringify(htmls)};` +
    `try{return JSON.stringify({ok:true,v:hs.map(function(x){return f(new DOMParser().parseFromString(x,'text/html'));})});}` +
    `catch(e){return JSON.stringify({ok:false,e:String(e&&e.message||e)});}})()`;
  const r = JSON.parse(await web.evaluateJavaScript(js, false));
  if (!r.ok) throw new Error(r.e);
  return r.v as T[];
}
const parse = async <T,>(fn: Function, html: string) => (await parseMany<T>(fn, [html]))[0];

// ───────────────────────── 資料來源 ─────────────────────────

export async function loadCinemas(): Promise<Cinema[]> {
  let list: TwCinema[] = [];
  try {
    list = await parse<TwCinema[]>(parseTwIndex, await getText(TW + "/cinemas/"));
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
      const lists = await parseMany<AtTheater[]>(parseAtRegion, pages);
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
  if (!atDayCache[url]) atDayCache[url] = await parse<AtDay>(parseAtDay, await getText(url));
  return atDayCache[url];
}

const twDayCache: Record<string, TwDay> = {};
async function twDay(c: Cinema, date?: string): Promise<TwDay> {
  const key = c.id + "|" + (date || "");
  if (!twDayCache[key]) {
    const url = date ? `${TW}/cinemas/${c.id}/${date}/` : c.url;
    twDayCache[key] = await parse<TwDay>(parseTwDay, await getText(url));
  }
  return twDayCache[key];
}

const multiCache: Record<string, MultiDay> = {};
async function multiDay(c: Cinema): Promise<MultiDay> {
  if (multiCache[c.id]) return multiCache[c.id];
  let r: MultiDay;
  if (c.source === "eslite") r = await parse<MultiDay>(parseEslite, await getText(c.url));
  else if (c.source === "spot-hs") r = await parse<MultiDay>(parseSpotHs, await getText(c.url));
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
  const films = await parse<LuxFilm[]>(parseLux, page);
  const details = await parseMany<{ runtime: number; rating: string }>(
    parseLuxFilm,
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
  const films = (await parseMany<SpotMovie | null>(parseSpotMovie, htmls)).filter(Boolean) as SpotMovie[];
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
    return { dates: future.length ? future : d.dates, address: d.address, notice: "" };
  }
  const m = await multiDay(c);
  const dates = Object.keys(m.schedules).filter((x) => x >= today).sort();
  return { dates, address: c.address || "", notice: m.notice };
}

export async function moviesOf(c: Cinema, date: string): Promise<{ movies: Movie[]; booking: string; sourceUrl: string; address: string }> {
  if (c.source === "at") {
    let d = await atDay(c);
    if (d.date !== date) d = await atDay(c, date);
    return { movies: d.movies, booking: d.site, sourceUrl: `${c.url}${date.replace(/-/g, "")}/`, address: d.address || c.address || "" };
  }
  if (c.source === "tw") {
    let d = await twDay(c);
    if (d.date !== date) d = await twDay(c, date);
    if (d.date && d.date !== date) throw new Error("網站回傳的日期和選擇的不同，請稍後再試");
    return { movies: d.movies, booking: d.booking, sourceUrl: `${TW}/cinemas/${c.id}/${date}/`, address: d.address };
  }
  const m = await multiDay(c);
  return { movies: m.schedules[date] || [], booking: c.url, sourceUrl: c.url, address: c.address || "" };
}

// ───────────────────────── 互動元件 ─────────────────────────
