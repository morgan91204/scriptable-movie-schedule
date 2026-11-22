// 資料層：型別、設定檔、網路、四個來源的讀取。畫面在 main.tsx。
import { PARSERS_JS } from "./parsers.gen";
import { platform } from "./platform";
import { GEO } from "./geo";
import { AT_BUILTIN, AT_COVERED, AT_SKIP, AT_REGIONS } from "./at-list";
import type { Movie, Version, TwCinema, TwDay, MultiDay, SpotMovie, LuxFilm, AtTheater, AtDay, TwMovie, TwMovieDay, TwMovieCinema } from "./parsers";
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
/** 設定頁的說明：預留時間為什麼預設 10 分鐘 */
export const ADS_NOTE = "依《電影法施行細則》，戲院每場正片前的廣告與預告合計原則上是 9 分鐘（預告片可以再多放），所以預設預留 10 分鐘。各戲院實際長度不同，可以自己調整。";
export const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

// ───────────────────────── 小工具 ─────────────────────────

export const todayTPE = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
export const nowHM = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(11, 16);
export const addDays = (d: string, n: number) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const weekday = (d: string) => WEEK[new Date(d + "T00:00:00Z").getUTCDay()];
export const isLate = (t: string) => t < "05:00"; // 凌晨場（00:00–04:59）
/** 凌晨場放在哪一天的片單：場次通放在「實際日期」那天（跟開眼比對過：同一場開眼列在前一天片單的最後、場次通列在當天片單的最前面）；
 *  其他來源（開眼、各影城官網）放在前一個營業日，實際日期要加一天 */
export const lateOnOwnDate = (source: string) => source === "tw";
/** 這一場實際開演的日期（YYYY-MM-DD） */
export const showDay = (source: string, date: string, time: string) => (isLate(time) && !lateOnOwnDate(source) ? addDays(date, 1) : date);
/** 片單上的凌晨場算不算「這個營業日晚上的場次」（還沒演）：場次通當天片單上的凌晨場是今天清晨的，已經過了 */
export const lateIsTonight = (source: string, time: string) => isLate(time) && !lateOnOwnDate(source);

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
  const served = (await loadAtData())?.theaters;
  if (served && served.length) {
    found = served; // 伺服器每小時掃一次，App 不用自己讀 18 個地區頁
  } else if (parsed && Date.now() - parsed.at < 7 * 864e5) {
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

// ── 伺服器先抓好的開眼場次 ──
// 開眼每個網頁要 3 秒左右。GitHub Actions 每小時把「只有開眼有的戲院」和「要補頂級影廳的威秀」今明兩天的片單抓好，
// 存成一個檔（data 分支的 at.json）；App 先讀這個檔，沒有、超過 12 小時沒更新或讀不到，才自己去讀開眼。
export const AT_DATA_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/at.json";
export interface AtData {
  updated: number;
  theaters?: AtTheater[]; // 開眼各地區頁掃到的戲院（App 就不用自己掃 18 個地區頁）
  days: Record<string, Record<string, AtDay>>; // 開眼戲院代碼 → 日期 → 片單
}
let atDataMem: { at: number; job: Promise<AtData | null> } | null = null;
function loadAtData(): Promise<AtData | null> {
  if (!metaOn) return Promise.resolve(null);
  if (atDataMem && Date.now() - atDataMem.at < 20 * 60e3) return atDataMem.job;
  const fresh = (d: AtData | null) => (d && d.days && Date.now() - d.updated < 12 * 3600e3 ? d : null); // 排程常隔好幾小時才跑，抓寬一點
  const job = (async (): Promise<AtData | null> => {
    let disk: { at: number; data: AtData } | null = null;
    try {
      disk = JSON.parse(cacheGet("at-data.json") || "null");
    } catch (_) {}
    if (disk && Date.now() - disk.at < 30 * 60e3) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(AT_DATA_URL + "?t=" + Math.floor(Date.now() / (20 * 60e3)), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body) as AtData;
      if (!data || typeof data.days !== "object") return null;
      cacheSet("at-data.json", JSON.stringify({ at: Date.now(), data }));
      return data;
    })().catch(() => null);
    const got = await Promise.race([net, delay(4000).then(() => null)]);
    return fresh(got || (disk ? disk.data : null));
  })();
  atDataMem = { at: Date.now(), job };
  return job;
}

const atDayCache: Record<string, AtDay> = {};
/** 直接讀開眼的戲院頁（不經過伺服器資料；伺服器產生資料時也用這個） */
export async function atDayLive(url: string, date?: string): Promise<AtDay> {
  const full = date ? `${url}${date.replace(/-/g, "")}/` : url;
  if (!atDayCache[full]) atDayCache[full] = await parse<AtDay>("parseAtDay", await getText(full));
  return atDayCache[full];
}
async function atDay(c: Cinema, date?: string): Promise<AtDay> {
  // 先看伺服器抓好的：不帶日期 = 今天
  const data = await loadAtData();
  const hit = data?.days[c.id.replace(/^at-/, "")]?.[date || todayTPE()];
  if (hit && hit.date) return hit;
  return atDayLive(c.url, date);
}

// ── 伺服器先抓好的場次通場次 ──
// 「現在有什麼可以看」查一個縣市要讀幾十間影城、每間一兩頁，手機一頁一頁讀又要各自解析，是它慢的主因。
// GitHub Actions 每小時把場次通所有影城的片單抓好，分成兩個檔：近期（今天、明天）和遠期（後天起 5 天）。
// App 先讀這兩個檔（一兩個請求），沒有、太久沒更新或讀不到，才自己去讀場次通。
export const TW_NEAR_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/tw-near.json";
export const TW_FAR_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/tw-far.json";
interface TwServed { date: string; dates: string[]; address: string; booking: string; movies: Movie[] }
interface TwData { updated: number; days: Record<string, Record<string, TwServed>> } // 影城代碼 → 日期 → 片單
/** 官網來源的影城（誠品、光點、真善美）：伺服器抓好的整份時刻表。光點華山要一部片讀一頁，手機自己讀要幾十個請求 */
export const OFFICIAL_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/official.json";
interface OfficialData { updated: number; cinemas: Record<string, MultiDay> }
// GitHub 的免費排程常常隔好幾個小時才跑一次（寫每小時也一樣），所以過期時間抓寬：
// 今明兩天與官網來源 12 小時、後天起 24 小時。場次公布後很少更動；超過這個時間就改由手機自己讀
const servedMem: Record<string, { at: number; job: Promise<any> }> = {};
function loadServed<T extends { updated: number }>(name: string, url: string, maxHours: number, ok: (d: T) => boolean): Promise<T | null> {
  if (!metaOn) return Promise.resolve(null);
  const hit = servedMem[name];
  if (hit && Date.now() - hit.at < 20 * 60e3) return hit.job;
  const fresh = (d: T | null) => (d && ok(d) && Date.now() - d.updated < maxHours * 3600e3 ? d : null);
  const job = (async (): Promise<T | null> => {
    let disk: { at: number; data: T } | null = null;
    try {
      disk = JSON.parse(cacheGet(name + ".json") || "null");
    } catch (_) {}
    if (disk && Date.now() - disk.at < 30 * 60e3) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(url + "?t=" + Math.floor(Date.now() / (20 * 60e3)), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body) as T;
      if (!data || !ok(data)) return null;
      cacheSet(name + ".json", JSON.stringify({ at: Date.now(), data }));
      return data;
    })().catch(() => null);
    const got = await Promise.race([net, delay(6000).then(() => null)]);
    return fresh(got || (disk ? disk.data : null));
  })();
  servedMem[name] = { at: Date.now(), job };
  return job;
}
const loadTwData = (far: boolean) =>
  loadServed<TwData>(far ? "tw-far" : "tw-near", far ? TW_FAR_URL : TW_NEAR_URL, far ? 24 : 12, (d) => typeof d.days === "object");

const twDayCache: Record<string, TwDay> = {};
/** 直接讀場次通的影城頁（不經過伺服器資料；伺服器產生資料時也用這個） */
export async function twDayLive(c: Cinema, date?: string): Promise<TwDay> {
  const key = c.id + "|" + (date || "");
  if (!twDayCache[key]) {
    const url = date ? `${TW}/cinemas/${c.id}/${date}/` : c.url;
    twDayCache[key] = await parse<TwDay>("parseTwDay", await getText(url));
  }
  return twDayCache[key];
}
async function twDay(c: Cinema, date?: string): Promise<TwDay> {
  const today = todayTPE();
  const day = date || today;
  const key = c.id + "|" + (date || "");
  if (twDayCache[key]) return twDayCache[key];
  // 先看伺服器抓好的：今天、明天在近期檔，後天起在遠期檔
  const off = Math.round((Date.parse(day + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400e3);
  if (off >= 0 && off <= 6) {
    const data = await loadTwData(off >= 2);
    const hit = data?.days[c.id]?.[day];
    if (hit && hit.date === day) return (twDayCache[key] = { cinema: c.name, ...hit });
  }
  return twDayLive(c, date);
}

const multiCache: Record<string, MultiDay> = {};
/** 直接讀影城官網（不經過伺服器資料；伺服器產生資料時也用這個） */
export async function multiDayLive(c: Cinema): Promise<MultiDay> {
  if (c.source === "eslite") return parse<MultiDay>("parseEslite", await getText(c.url));
  if (c.source === "spot-hs") return parse<MultiDay>("parseSpotHs", await getText(c.url));
  if (c.source === "lux") return luxCinema();
  return spotTaipei();
}
async function multiDay(c: Cinema): Promise<MultiDay> {
  if (multiCache[c.id]) return multiCache[c.id];
  // 先看伺服器抓好的：裡面要還有今天以後的場次才算數
  const data = await loadServed<OfficialData>("official", OFFICIAL_URL, 12, (d) => typeof d.cinemas === "object");
  const hit = data?.cinemas[c.id];
  const today = todayTPE();
  const r = hit && hit.schedules && Object.keys(hit.schedules).some((d) => d >= today) ? hit : await multiDayLive(c);
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
    const sup = AT_SUPPLEMENT.find((x) => x[0].test(c.name));
    if (sup) atDay(atCinema(sup[1], sup[2], c.name, "")).catch(() => null); // 先在背景讀開眼（補頂級影廳用）
    const d = await twDay(c);
    const future = d.dates.filter((x) => x >= today);
    return { dates: future.length ? future : d.dates, address: d.address, notice: "", site: d.booking || "" };
  }
  const m = await multiDay(c);
  const dates = Object.keys(m.schedules).filter((x) => x >= today).sort();
  return { dates, address: c.address || "", notice: m.notice, site: c.url };
}

// 場次通沒有收錄部分威秀的頂級影廳（Gold Class、MUCROWN、TITAN），開眼有：這幾間額外讀開眼，把缺的廳別補進來。
// 2026-11 比對全台 66 間場次通影城與開眼後整理；[影城名稱, 開眼戲院代碼, 開眼地區代碼]
export const AT_SUPPLEMENT: [RegExp, string, string][] = [
  [/MUVIE CINEMAS\s*台北松仁/, "t02a11", "a02"],
  [/新竹大遠百威秀/, "t03505", "a35"],
  [/MUVIE CINEMAS\s*台中TIGER CITY/i, "t04402", "a04"],
  [/台南南紡威秀/, "t06610", "a06"],
  [/高雄大遠百威秀/, "t07703", "a07"],
];
const SPECIAL_HALL = /gold\s*class|mucrown|titan/i;
const hallKey = (label: string) => ((label.match(SPECIAL_HALL) || [""])[0] || "").toLowerCase().replace(/\s/g, "");
/** 把開眼有、場次通沒有的頂級影廳場次補進片單（最多等 3 秒；只補白天到午夜的場次，凌晨場兩個來源放的日期不同） */
async function supplementHalls(c: Cinema, date: string, movies: Movie[]): Promise<Movie[]> {
  const s = AT_SUPPLEMENT.find((x) => x[0].test(c.name));
  if (!s) return movies;
  let d: AtDay | null = null;
  try {
    // 開眼回應約要 3 秒，最多等 8 秒（讀過會記住，同一次使用不用再等）。
    // 跟讀開眼戲院一樣：先讀不帶日期的頁（今天），日期不對再讀帶日期的頁。今天的場次只有不帶日期的頁才完整
    const at = atCinema(s[1], s[2], c.name, "");
    d = await Promise.race([
      (async () => {
        let x = await atDay(at);
        if (x.date !== date) x = await atDay(at, date);
        return x;
      })(),
      delay(8000).then(() => null),
    ]);
  } catch (_) {
    return movies;
  }
  if (!d || d.date !== date) return movies;
  const tkey = (t: string) => normTitle(baseTitle(t));
  const out = movies.map((m) => ({ ...m, versions: m.versions.slice() })); // 不改到快取裡的片單
  for (const am of d.movies)
    for (const v of am.versions) {
      const hall = hallKey(v.label);
      const times = v.times.filter((t) => !isLate(t));
      if (!hall || !times.length) continue;
      const target = out.find((m) => tkey(m.title) === tkey(am.title));
      if (target && target.versions.some((x) => hallKey(x.label) === hall)) continue; // 場次通已經有這個廳
      const ver: Version = { label: `${v.label}（取自開眼）`, times };
      if (target) target.versions.push(ver);
      else out.push({ title: am.title, runtime: am.runtime, rating: am.rating, versions: [ver] });
    }
  return out;
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
    return { movies: await fillRuntimes(await supplementHalls(c, date, d.movies)), booking: d.booking, sourceUrl: `${TW}/cinemas/${c.id}/${date}/`, address: d.address };
  }
  const m = await multiDay(c);
  return { movies: await fillRuntimes(m.schedules[date] || []), booking: c.url, sourceUrl: c.url, address: c.address || "" };
}

// ───────────────────────── 補片長（TMDB） ─────────────────────────
// 場次通的重映、修復版、演唱會等有時沒有片長：用 TMDB（themoviedb.org）查片名補上。
// 需要使用者自己的 API Read Access Token（設定裡填），沒填就不補。

// 異體字：兩個來源同一部片用字不同（神祕／神秘、臺／台）
const VARIANTS: Record<string, string> = { 祕: "秘", 臺: "台", 裏: "裡", 艶: "艷", 羣: "群", 峯: "峰", 砲: "炮" };
export const normTitle = (t: string) =>
  String(t || "")
    .toLowerCase()
    .replace(/[\s:：·・\-–—_＿!！?？,，.。'"’‘“”「」『』《》〈〉＜＞<>()（）\[\]【】／/]/g, "")
    .replace(/[祕臺裏艶羣峯砲]/g, (c) => VARIANTS[c] || c);
/** 更寬鬆的比對用：再去掉開頭的「劇場版」「電影版」（場次通寫「劇場版《XXX》」、開眼只寫「XXX」） */
export const looseTitle = (t: string) => normTitle(baseTitle(t)).replace(/^(?:劇場版|電影版|動畫電影)/, "") || normTitle(t);
/** 去掉「4K重映」「全新4K修復版」「(4K修復)」「加碼重映」等字，查原片 */
const REISSUE_WORDS = "全新|加碼|數位|[248]K|修復|重映|重製|再映|經典|紀念|[\\d一二三四五六七八九十百]*週年";
/** 片名是重映、修復版（查原片時用；比對年份時不能拿重映日來比） */
export const isReissue = (t: string) => new RegExp(REISSUE_WORDS, "i").test(String(t || ""));
// 片名前後的裝飾字：(全台聯合首映)哥吉拉-0.0、驀然回首 (真人版)、高年級實習生(2026)、A-Stray Kids…、法文版-XXX、XXX-海報特別場
const DECOR_LEAD = /^\s*(?:[（(\[【][^）)\]】]{1,12}[）)\]】]|[A-Z]\d?-|(?:法文|中文|英文|日文|韓文|台語|國語|粵語)版[-－:：]?)\s*/;
const DECOR_TAIL = /\s*(?:[（(\[【]\s*(?:真人版|\d{4}|[^）)\]】]{0,8}版)\s*[）)\]】]|[-－:：]?\s*(?:海報)?特別場|[-－:：]?\s*(?:粉絲)?特典場|[-－:：]?\s*LIVE VIEWING|應援場|現場直播|安可重播|黑白版|特別版|口白場|中文配音版?|(?:日|英|韓|法|國|台)語版)\s*$/;
export function baseTitle(t: string): string {
  let s = String(t || "").replace(/[《》]/g, "").trim();
  for (let i = 0; i < 4; i++) {
    const before = s;
    s = s.replace(DECOR_LEAD, "").replace(DECOR_TAIL, "");
    // 結尾括號裡是重映字樣：讓子彈飛(4K修復)、XXX【數位修復版】
    s = s.replace(new RegExp(`\\s*[（(\\[【][^）)\\]】]*(?:${REISSUE_WORDS})[^）)\\]】]*[）)\\]】]\\s*$`, "i"), "");
    // 結尾直接接重映字樣：讓子彈飛 全新4K修復版、進擊的鼓手 4K重映
    s = s.replace(new RegExp(`[\\s:：\\-–—_＿]*(?:${REISSUE_WORDS})+(?:版本?)?\\s*$`, "i"), "");
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
  posterKind?: "poster" | "thumb"; // thumb = 找不到海報，用 YouTube 預告的縮圖代替
  trailer: string; // YouTube 預告網址；找不到時是 YouTube 搜尋頁
  trailerName: string; // 找到的影片標題；空字串 = 只是搜尋
  err?: string; // 有金鑰卻查不到預告時的原因
}
const extrasCache: Record<string, Promise<MovieExtras>> = {};

// ── 前景優先：使用者正在等的查詢進行中時，背景預抓先暫停，不搶頻寬
const delay = (ms: number) =>
  new Promise<void>((r) => {
    const g = globalThis as any;
    if (typeof g.setTimeout === "function") g.setTimeout(r, ms);
    else g.Timer.schedule(ms, false, r); // Scriptable 沒有 setTimeout
  });
let foreground = 0;
/** 把「使用者正在等」的查詢包起來：進行中時背景預抓會暫停 */
export function foregroundTask<T>(p: Promise<T>): Promise<T> {
  foreground++;
  const done = () => {
    foreground--;
  };
  p.then(done, done);
  return p;
}
async function waitIdle(): Promise<void> {
  while (foreground > 0) await delay(150);
}
/** 手機上記的海報／預告（extras.json） */
const readExtras = (): Record<string, MovieExtras & { at: number }> => {
  try {
    return JSON.parse(cacheGet("extras.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};

/** 海報：場次通電影頁（不需 Token）→ TMDB；預告：TMDB 的 YouTube 影片 → YouTube 搜尋 */
// ───────────────────────── 伺服器整理好的電影資料 ─────────────────────────
// GitHub Actions 每小時把上映中與票房榜電影的海報、預告、三大評分、片長查好，存成一個靜態檔（data 分支的 meta.json）。
// App 先讀這個檔：有的話一個請求就拿到全部，不用每部片各打十幾個請求；沒有、太舊或讀不到，就照原本的方式自己查。
export const META_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/meta.json";
export interface MetaEntry {
  p?: string; // 海報網址
  t?: string; // 預告網址
  tn?: string; // 預告標題（有才算找到預告）
  xa?: number; // 海報／預告查詢時間
  r?: Ratings; // 三大評分（查過但沒有評分是空物件）
  ra?: number;
  rt?: number; // 片長（分鐘）
  rf?: string; // 片長來源
  rta?: number;
  rd?: string; // 上映日期 YYYY-MM-DD（場次通電影頁）
  rda?: number;
  seen?: number; // 最後一次出現在片單上的時間
}
export interface MetaFile { updated: number; movies: Record<string, MetaEntry> }
let metaOn = true;
/** 伺服器端產生資料時要關掉，不然會讀到自己上一次的結果 */
export function setMetaEnabled(on: boolean): void {
  metaOn = on;
}
let metaMem: { at: number; job: Promise<MetaFile | null> } | null = null;
/** 讀伺服器資料（記憶體 30 分鐘、手機 1 小時；超過 3 天沒更新就不用）。最多等 4 秒，讀不到回傳 null */
function loadMeta(): Promise<MetaFile | null> {
  if (!metaOn) return Promise.resolve(null);
  if (metaMem && Date.now() - metaMem.at < 1800e3) return metaMem.job;
  const fresh = (m: MetaFile | null) => (m && m.movies && Date.now() - m.updated < 3 * 86400e3 ? m : null);
  const job = (async (): Promise<MetaFile | null> => {
    let disk: { at: number; data: MetaFile } | null = null;
    try {
      disk = JSON.parse(cacheGet("meta.json") || "null");
    } catch (_) {}
    if (disk && Date.now() - disk.at < 3600e3) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(META_URL + "?t=" + Math.floor(Date.now() / 1800e3), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body) as MetaFile;
      if (!data || typeof data.movies !== "object") return null;
      cacheSet("meta.json", JSON.stringify({ at: Date.now(), data }));
      return data;
    })().catch(() => null);
    const got = await Promise.race([net, delay(4000).then(() => null)]);
    return fresh(got || (disk ? disk.data : null));
  })();
  metaMem = { at: Date.now(), job };
  return job;
}
/** 這部片在伺服器資料裡的紀錄（沒有回傳 null） */
async function metaOf(title: string): Promise<MetaEntry | null> {
  const m = await loadMeta();
  return (m && (m.movies[normTitle(title)] || m.movies[normTitle(baseTitle(title))])) || null;
}

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
    // 舊版記下的「沒海報」也重查（海報比對規則改了）
    // 預告挑選規則也改過（要對得上片名、台灣版優先）：舊版從 YouTube 搜尋挑的也重查
    const stale = hit && hit.v !== EXTRAS_V && true; // 預告的挑選與檢查規則改過：舊版記下的一律重查一次
    const ttl = stale ? 0 : !hit?.trailerName ? 3600e3 : hit?.poster ? 7 * 86400e3 : 86400e3;
    // 伺服器查好的預告優先，手機自己以前搜到的排後面：這樣每個版本、每支手機看到的都是同一支，
    // 不會因為各自搜尋的結果不同而不一樣
    const me = await metaOf(title);
    if (me && me.tn && me.t) return { poster: normImageUrl(me.p || hit?.poster || ""), trailer: me.t, trailerName: me.tn };
    // 伺服器沒有的：手機自己搜，用同一套嚴格規則（標題要有台灣片名、看得出是預告）。
    // 伺服器在國外，只在台灣看得到的影片（片商鎖地區的官方預告）它搜不到，手機才搜得到；找不到就開搜尋頁
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
const EXTRAS_V = 9;

/** 圖片網址正規化：解掉 HTML 跳脫、\\/、//host 與 http:// 都改成 https://（iOS 的 WebView／Image 不載入 http 圖片） */
export function normImageUrl(u: string): string {
  let s = String(u || "").trim().replace(/&amp;/g, "&").replace(/\\\//g, "/");
  if (s.startsWith("//")) s = "https:" + s;
  s = s.replace(/^http:\/\//i, "https://");
  // 開眼的 photowant.com 圖床已經把所有圖轉到首頁（不是圖片，手機上會一直轉圈），改用 atmovies 主機上同一張海報
  const pw = s.match(/^https?:\/\/(?:www\.)?photowant\.com\/photo\d*\/(f\w+)\//);
  if (pw) s = `${AT}/photo101/${pw[1]}/pl_${pw[1]}.jpg`;
  return s;
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
      ["now", "new", "next", "next2", "now2"].map(async (p) => {
        const url = `${AT}/movie/${p}/`;
        const html = await getText(url).catch(() => getText(url).catch(() => "")); // 開眼偶爾逾時：再試一次，不然這一頁的片整輪都對不到
        for (const [, id, t] of html.matchAll(/<a[^>]*href="\/movie\/(f[a-z0-9]+)\/"[^>]*>\s*([^<]{1,60}?)\s*<\/a>/g)) {
          const n = normTitle(t), b = normTitle(baseTitle(t)), l = looseTitle(t);
          if (n) idx[n] ||= id;
          if (b) idx[b] ||= id;
          if (l) idx[l] ||= id;
        }
      })
    );
    if (Object.keys(idx).length) cacheSet("at-movies.json", JSON.stringify({ at: Date.now(), idx }));
    return idx;
  })());
}
/** 開眼電影頁（預告、片長、海報都從這頁拿，同一次執行只抓一次） */
const atPageMem: Record<string, Promise<string>> = {};
const atPage = (id: string) => (atPageMem[id] ||= getText(`${AT}/movie/${id}/`));
/** 開眼電影編號：先從場次通海報網址取（網址裡就有），沒有再從開眼清單對片名 */
async function atMovieId(title: string, posterUrl: string): Promise<string> {
  const fromPoster = (posterUrl.match(/\/photo\d*\/(f\w+)\//) || [])[1];
  if (fromPoster) return fromPoster;
  const idx = await atMovieIndex();
  return matchIndex(idx, title);
}
/** 用片名查索引：完全相同 → 去掉重映／裝飾字 → 去掉「劇場版」→ 片名被截斷時用開頭比對（至少 8 個字） */
function matchIndex(idx: Record<string, string>, title: string): string {
  const n = normTitle(title), b = normTitle(baseTitle(title)), l = looseTitle(title);
  if (idx[n] || idx[b] || idx[l]) return idx[n] || idx[b] || idx[l];
  for (const k of [b, l]) {
    if (k.length < 8) continue;
    const hit = Object.keys(idx).find((x) => x.length >= 8 && (x.startsWith(k) || k.startsWith(x)));
    if (hit) return idx[hit];
  }
  return "";
}
/** 開眼電影頁的海報（場次通沒有海報時的第二來源；重映、修復版常只有開眼有） */
async function atPoster(title: string): Promise<string> {
  const id = await atMovieId(title, "");
  if (!id) return "";
  const html = await atPage(id);
  const og = (html.match(/property="og:image"\s+content="([^"]+)"/) || [])[1] || "";
  return og ? normImageUrl(og) : "";
}

/** 開眼電影頁上的上映年份（用來確認 IMDb／TMDB 對到的是同一部片；重映、修復版不適用，回傳 0）。最多等 3.5 秒 */
async function atYearHint(title: string, slug?: string, en?: string): Promise<number> {
  if (isReissue(title)) return 0; // 重映片：開眼頁的日期是重映日，不能拿來比
  try {
    const poster = await Promise.race([moviePoster(title, slug, en), delay(1500).then(() => "")]);
    const id = await atMovieId(title, poster || "");
    if (!id) return 0;
    const html = await Promise.race([atPage(id), delay(3500).then(() => "")]);
    const m = html.match(/上映日期[:：]?(?:\s|<[^>]*>|&nbsp;)*(\d{4})/); // 開眼頁是「上映日期：<a …>2026/11/06</a>」
    return m ? Number(m[1]) : 0;
  } catch (_) {
    return 0;
  }
}

/** 片長（分鐘）：來源沒給時，有金鑰先查 TMDB（中文、英文片名），再讀開眼電影頁的「片長：92分」。記在手機（找到 30 天、沒找到 1 天） */
const runtimeMem: Record<string, Promise<{ runtime: number; from: string } | null>> = {};
export function movieRuntime(title: string, slug?: string, en?: string): Promise<{ runtime: number; from: string } | null> {
  const k = normTitle(title);
  return (runtimeMem[k] ||= (async () => {
    const read = (): Record<string, any> => {
      try {
        return JSON.parse(cacheGet("runtimes.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()["at|" + k];
    if (hit && Date.now() - hit.at < (hit.r ? 30 : 1) * 86400e3) return hit.r ? { runtime: hit.r, from: hit.from } : null;
    const me = await metaOf(title);
    if (me && me.rt) return { runtime: me.rt, from: me.rf || "開眼電影網" };
    let out: { runtime: number; from: string } | null = null;
    const token = ((await loadSettings()).tmdbToken || "").trim();
    if (token) {
      for (const q of [title, en].filter(Boolean) as string[]) {
        const r = await tmdbRuntime(q, token).catch(() => 0);
        if (r) {
          out = { runtime: r, from: "TMDB" };
          break;
        }
      }
    }
    if (!out) {
      try {
        const id = await atMovieId(title, await moviePoster(title, slug, en).catch(() => ""));
        const m = id ? (await atPage(id)).match(/片長[:：]\s*(\d{2,3})\s*分/) : null;
        if (m) out = { runtime: Number(m[1]), from: "開眼電影網" };
      } catch (_) {}
    }
    const all = read();
    all["at|" + k] = { r: out?.runtime || 0, from: out?.from || "", at: Date.now() };
    cacheSet("runtimes.json", JSON.stringify(all));
    return out;
  })());
}

/** 海報網址：場次通電影頁 → 同片名的其他場次通頁（重映、修復版）→ 開眼電影網 →（有填金鑰才）TMDB */
async function findPoster(title: string, slug?: string, en?: string): Promise<string> {
  let p = await twPoster(slug || title).catch(() => ""); // 場次通的網址就是片名：先直接試，不用先下載整份電影清單
  if (p) return p;
  const list = await loadMovies();
  const key = normTitle(title), bkey = normTitle(baseTitle(title));
  const lkey = looseTitle(title);
  const cands = list.filter((m) => m.slug !== (slug || title) && (normTitle(m.title) === key || normTitle(baseTitle(m.title)) === bkey || looseTitle(m.title) === lkey || (bkey.length >= 8 && normTitle(baseTitle(m.title)).startsWith(bkey))));
  for (const c of cands) {
    p = await twPoster(c.slug).catch(() => "");
    if (p) return p;
  }
  p = await atPoster(title).catch(() => "");
  if (p) return p;
  p = await imdbPoster(title, slug, en).catch(() => "");
  if (p) return p;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return "";
  const hit = (await tmdbFind(title, token).catch(() => null)) || (en ? await tmdbFind(en, token).catch(() => null) : null);
  return hit?.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "";
}

/** IMDb 的海報（不需要金鑰）：評分查詢已經對到 IMDb 編號，用編號再問一次搜尋建議就有海報圖。
 *  場次通、開眼都沒建檔的片（動畫特別場、演唱會電影）常常只有這裡有 */
async function imdbPoster(title: string, slug?: string, en?: string): Promise<string> {
  const r = await movieRatings(title, en, slug);
  const id = (r.imdb?.url.match(/tt\d+/) || [])[0];
  if (!id) return "";
  const res = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${id}.json`, { "User-Agent": UA });
  const hit = ((JSON.parse(res.body).d || []) as any[]).find((x) => x.id === id);
  const u = String(hit?.i?.imageUrl || "");
  // 原圖動輒幾 MB：亞馬遜圖床可以在網址指定寬度
  return /^https:\/\/m\.media-amazon\.com\//.test(u) ? u.replace(/\._V1_.*?(\.\w+)$/, "._V1_UX500_$1") : "";
}

let posterBusy = 0;
const posterQueue: (() => void)[] = [];
async function posterLane<T>(job: () => Promise<T>): Promise<T> {
  if (posterBusy >= 4) await new Promise<void>((go) => posterQueue.push(go));
  else posterBusy++;
  try {
    return await job();
  } finally {
    const next = posterQueue.shift();
    if (next) next(); // 位置直接交給下一個
    else posterBusy--;
  }
}

/** 只查海報網址（約 0.3 秒），不等預告：電影頁先把海報畫出來。手機上記過的直接用（找到的 7 天、沒找到的 1 天） */
const posterOnly: Record<string, Promise<string>> = {};
const posterDone: Record<string, string> = {};
/** 這次執行已經查好的海報網址（同步拿，沒查過回傳 undefined）：切換頁面回來時直接畫，不用先閃空白 */
export function posterReady(title: string, slug?: string): string | undefined {
  return posterDone[(slug || "") + "|" + title];
}
/** 只看已經有的海報（手機記過的、伺服器查好的），沒有就回傳空字串，不上網找。
 *  年度排行有好幾千部已下檔的舊片，一部一部上網找會打出上千個請求，所以那裡只用這個 */
export async function posterKnown(title: string, slug?: string): Promise<string> {
  const k = (slug || "") + "|" + title;
  if (posterDone[k] !== undefined) return posterDone[k];
  const nk = normTitle(title);
  const all = readExtras();
  const hit = all["t|" + nk] || all["n|" + nk] || all["p|" + nk];
  if (hit?.poster) return (posterDone[k] = normImageUrl(hit.poster));
  const me = await metaOf(title);
  const u = me && me.p ? normImageUrl(me.p) : "";
  if (posterDone[k] === undefined) posterDone[k] = u; // 讓 posterReady 知道「查過了」（之後真的上網找到，會再蓋掉）
  return u;
}
const posterLightMem: Record<string, Promise<string>> = {};
/** 已下檔舊片用的輕量查法：先看已經有的；沒有就只問 IMDb 的搜尋建議一次（一個很小的請求，回應裡就有海報圖），
 *  年份要跟上映年相差 1 年內才採用。不走完整查詢（那要連場次通、開眼、YouTube 好幾個網站，舊片幾乎都查不到）。
 *  結果記在手機上：找到的 30 天、沒找到的 3 天 */
export function posterLight(title: string, release?: string): Promise<string> {
  const k = "|" + title;
  return (posterLightMem[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk] || all["p|" + nk];
    if (hit?.poster && !/ytimg\.com/.test(hit.poster)) return normImageUrl(hit.poster);
    const me = await metaOf(title);
    if (me && me.p) return normImageUrl(me.p);
    const own = all["l|" + nk] as (MovieExtras & { at: number }) | undefined;
    if (own && Date.now() - own.at < (own.poster ? 30 : 3) * 86400e3) return own.poster;
    const year = Number((release || "").slice(0, 4)) || 0;
    const poster = await posterLane(async () => {
      try {
        const q = baseTitle(title).toLowerCase().replace(/[\\/?#%]/g, " ").trim();
        const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(q)}.json`, { "User-Agent": UA });
        const d = (JSON.parse(r.body).d || []) as any[];
        const x = d.find((v) => /^tt/.test(v.id) && (v.qid === "movie" || v.qid === "tvMovie" || v.qid === "video") && v.i?.imageUrl && (!year || !v.y || Math.abs(Number(v.y) - year) <= 1));
        const u = String(x?.i?.imageUrl || "");
        return /^https:\/\/m\.media-amazon\.com\//.test(u) ? u.replace(/\._V1_.*?(\.\w+)$/, "._V1_UX300_$1") : "";
      } catch (_) {
        return "";
      }
    });
    const latest = readExtras();
    latest["l|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now() } as MovieExtras & { at: number };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster;
  })().then((u) => (posterDone[k] = u)));
}
export function moviePoster(title: string, slug?: string, en?: string): Promise<string> {
  const k = (slug || "") + "|" + title;
  return (posterOnly[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk];
    const isThumb = (u: string) => /ytimg\.com/.test(u); // 預告縮圖只是暫代：一天後再找一次真的海報
    if (hit?.poster && !isThumb(hit.poster)) return normImageUrl(hit.poster);
    const own = all["p|" + nk] as (MovieExtras & { at: number; v?: number }) | undefined; // 只查過海報的紀錄
    // 找到的記 7 天；沒找到的記 1 天，但舊版（比對規則改了）記下的「沒找到」一律重查
    if (own && Date.now() - own.at < (own.poster && !isThumb(own.poster) ? 7 : own.v === EXTRAS_V ? 1 : 0) * 86400e3) return own.poster;
    const me = await metaOf(title);
    if (me && me.p) return normImageUrl(me.p); // 伺服器已經查好海報
    // 要上網找的同時最多 4 部：整份清單一起要海報時不會一次打出上百個請求
    const poster = await posterLane(async () => {
      const found = normImageUrl(await findPoster(title, slug, en).catch(() => ""));
      if (found) return found;
      // 哪個來源都沒有海報（演唱會轉播、特別場、還沒建檔的新片）：走完整查詢，會用 YouTube 預告的縮圖代替，預告網址也一併記下
      return normImageUrl((await movieExtras(title, slug).catch(() => null))?.poster || "");
    });
    const latest = readExtras();
    latest["p|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now(), v: EXTRAS_V } as MovieExtras & { at: number };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster;
  })().then((u) => (posterDone[k] = u)));
}

/** 沒有任何圖可用時畫的預設海報：依片名固定挑一種底色（0–5），同一部片每次、每個版本都一樣 */
export function posterTint(title: string): number {
  let h = 0;
  for (const ch of normTitle(title)) h = (h * 31 + (ch.codePointAt(0) || 0)) % 9973;
  return h % 6;
}
/** 預設海報的六種底色（漸層的上、下兩色） */
export const POSTER_TINTS: [string, string][] = [
  ["#3b4a6b", "#1f2a44"],
  ["#6b3b4a", "#3d1f2a"],
  ["#2f5d50", "#16352d"],
  ["#5a4a2f", "#33290f"],
  ["#4a3b6b", "#281f44"],
  ["#3a3d42", "#1f2125"],
];

/** 顯示用的海報來源：手機上有圖片快取就用本機（Scriptable 是 data: 網址、Scripting 是檔案路徑），否則用網址 */
export function posterSrc(url: string): string {
  url = normImageUrl(url); // 手機上記的舊網址也要修正（photowant → atmovies）
  if (!url) return "";
  try {
    return platform().cachedImage(url) || url;
  } catch (_) {
    return url;
  }
}
/** posterSrc 回傳的是本機來源（不是 http 網址） */
export const isLocalSrc = (src: string) => /^(data:|file:|\/)/.test(src);
/** 背景把海報圖抓到手機快取（不等結果） */
export function cachePoster(url: string): void {
  url = normImageUrl(url);
  if (!url) return;
  try {
    platform().cacheImage(url).catch(() => null);
  } catch (_) {}
}
const prefetched = new Set<string>();
/** 列表出現時在背景預抓（一次 2 個，使用者正在等的查詢進行中時暫停）：
 *  整份清單（最多 max 部）的海報網址與海報圖；前 ratings 部連三大評分、前 trailers 部連預告也先查，之後進電影頁就不用等 */
export function prefetchPosters(items: { title: string; slug?: string; en?: string }[], max = 200, trailers = 10, ratings = 12): void {
  const queue: { title: string; slug?: string; en?: string; trailer: boolean; ratings: boolean }[] = [];
  items.slice(0, max).forEach((m, i) => {
    const k = (m.slug || "") + "|" + m.title;
    if (prefetched.has(k)) return;
    prefetched.add(k);
    queue.push({ title: m.title, slug: m.slug, en: m.en, trailer: i < trailers, ratings: i < ratings });
  });
  const run = async () => {
    for (let m = queue.shift(); m; m = queue.shift()) {
      try {
        await waitIdle();
        const u = await moviePoster(m.title, m.slug, m.en);
        if (u) await platform().cacheImage(u);
        if (m.trailer) {
          await waitIdle();
          await movieExtras(m.title, m.slug); // 會抓開眼電影頁，評分比對年份也用同一頁
        }
        if (m.ratings) {
          await waitIdle();
          await movieRatings(m.title, m.en, m.slug);
        }
      } catch (_) {}
    }
  };
  for (let i = 0; i < 2; i++) run();
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
      const html = await atPage(id);
      const key = (html.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/) || [])[1];
      if (!key) {
        atErr.push("開眼電影網沒有這部片的預告");
        return null;
      }
      // 開眼頁上放的不一定是預告（有時是幕後花絮、訪談）：問一下影片標題（很小的請求），不是預告就不用，改去搜尋
      const name = await ytTitle(key);
      if (name && YT_NOT_TRAILER.test(name) && !YT_TRAILER.test(name)) {
        atErr.push("開眼電影網放的是花絮不是預告");
        return null;
      }
      return { key, name: "開眼電影網預告" };
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
    const k = normTitle(title), bk = normTitle(base);
    const en = (moviesCache || []).find((m) => normTitle(m.title) === k || normTitle(baseTitle(m.title)) === bk)?.en; // 英文片名（片單讀過才有）
    const yt = await ytTrailer(title, en);
    if ("key" in yt) pick = yt;
    else atErr.push("YouTube " + yt.err);
  }
  if (pick) {
    out.trailer = `https://www.youtube.com/watch?v=${pick.key}`;
    out.trailerName = String(pick.name || "預告片");
    // 演唱會轉播、特別場等哪裡都沒有海報：用預告影片的縮圖代替，總比灰色預設圖好
    if (!out.poster) {
      out.poster = `https://i.ytimg.com/vi/${pick.key}/hqdefault.jpg`;
      out.posterKind = "thumb";
    }
  }
  if (!pick) out.err = [t?.err, ...atErr].filter(Boolean).join("；") || "找不到預告";
  return out;
}

/** 讀一次 YouTube 搜尋頁，回傳前 20 支影片（影片編號與標題）。
 *  用桌面版 UA，手機版 UA 會被轉到 m.youtube.com；結果頁約 1MB，所以只在開眼／TMDB 都沒有預告時才查 */
async function ytSearch(query: string): Promise<{ list: { key: string; name: string }[]; err?: string }> {
  let r: { status: number; body: string };
  try {
    r = await platform().fetchText(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=zh-TW&gl=TW`, {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Accept-Language": "zh-TW,zh;q=0.9",
    });
  } catch (e) {
    return { list: [], err: "搜尋頁讀不到（" + errText(e) + "）" };
  }
  if (r.status < 200 || r.status >= 300) return { list: [], err: "搜尋頁回應 " + r.status };
  const list: { key: string; name: string }[] = [];
  for (const m of r.body.matchAll(/"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})"([\s\S]{0,4000}?)"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g)) {
    let name = m[3];
    try {
      name = JSON.parse('"' + name + '"');
    } catch (_) {}
    list.push({ key: m[1], name });
    if (list.length >= 20) break;
  }
  if (!list.length) return { list, err: /consent\.youtube|consent\.google/.test(r.body) ? "搜尋頁要求同意 Cookie" : "搜尋沒有結果" };
  return { list };
}

const YT_TRAILER = /預告|trailer|teaser|予告|\bPV\b/i;
const YT_RELEASE = /上映|大銀幕|戲院|獻映|登場/;
const YT_NOT_TRAILER = /影評|解析|解說|劇透|不知道的事|冷知識|認識|盤點|看點|必看|reaction|反應|新聞|心得|懶人包|彩蛋|訪談|專訪|幕後|花絮|主題曲|片尾曲|\bOST\b|\bMV\b|\bAMV\b|直播|重溫|回顧|非官方|貓咪版|惡搞|同人|二創|自製|翻拍|parody|fan.?made|unofficial/i;
const YT_NOT_TW = /香港|澳門|港版|粵語|廣東話|\bHK\b|马来西亚|馬來西亞|新加坡/i;
/** 影片標題對不對得上這部片、像不像預告：分數越高越好，0 = 不是這部片（或不是預告），不採用。
 *  台灣片名整個出現在標題裡的排最前面——香港、中國的版本片名通常不同（哥斯拉／哥吉拉），自然排到後面 */
export function ytScore(name: string, title: string, en?: string): number {
  const base = baseTitle(title);
  const n = normTitle(name);
  // 片名拆成幾段（「加速世界 劇場版 INFINITE BURST」），「劇場版」這類通用字不算，其餘每一段都要出現
  const parts = base.split(/[\s:：·・\-–—_＿／/]+/).map(normTitle).filter((x) => x && !/^(?:劇場版|電影版|動畫電影|themovie|movie)$/.test(x));
  const zh = parts.length > 0 && parts.every((x) => n.includes(x));
  const e = en ? normEn(en) : "";
  const enHit = e.length >= 4 && normEn(name).includes(e);
  if (!zh && !enHit) return 0;
  // 標題寫了年份、卻不是今年前後：是同名的舊片（真人版對到多年前的動畫版）。重映片本來就是舊片，不檢查
  const years = (name.match(/(?:19|20)\d{2}(?!\d)/g) || []).map(Number);
  const thisYear = Number(todayTPE().slice(0, 4));
  if (!isReissue(title) && years.length && !years.some((y) => Math.abs(y - thisYear) <= 1)) return 0;
  const trailer = YT_TRAILER.test(name);
  if (YT_NOT_TRAILER.test(name)) return 0; // 影評、冷知識、惡搞版……就算標題有「預告」兩個字也不是
  if (!trailer && !(zh && YT_RELEASE.test(name))) return zh ? 1 : 0; // 對得上片名但看不出是預告：最後才用
  let sc = zh ? (trailer ? 100 : 70) : 50; // 台灣片名＋寫明預告 > 台灣片名＋上映宣傳 > 只有英文片名對上
  if (YT_NOT_TW.test(name)) sc -= 30;
  if (/台灣|臺灣|全台|在台|台版/.test(name)) sc += 20;
  if (!zh && /[一-鿿]/.test(name)) sc += 5; // 沒有台灣版時，中文字幕的版本（多半是香港）比純外語好懂
  if (/正式|官方|official/i.test(name)) sc += 3;
  return sc;
}
/** YouTube 影片的標題（讀不到回傳空字串） */
async function ytTitle(key: string): Promise<string> {
  try {
    const r = await platform().fetchText(`https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + key)}&format=json`, { accept: "application/json" });
    return r.status === 200 ? String(JSON.parse(r.body).title || "") : "";
  } catch (_) {
    return "";
  }
}
/** 從 YouTube 找這部片的預告：只採用標題有台灣片名、而且看得出是預告或上映宣傳的影片。
 *  寧可找不到（畫面上改開搜尋頁），也不放可能是錯的：搜尋的第一筆常是影評、花絮、別的地區的版本 */
async function ytTrailer(title: string, en?: string): Promise<{ key: string; name: string } | { err: string }> {
  const base = baseTitle(title);
  const plain = base.replace(/[:：·・\-–—_＿／/!！?？「」『』《》〈〉()（）\[\]【】]+/g, " ").replace(/\s+/g, " ").trim(); // 冒號等符號會被當成搜尋語法
  let best: { key: string; name: string; sc: number } | null = null;
  let err = "";
  for (const q of [`${plain} 預告`, `${plain} 電影 中文預告`]) {
    let r = await ytSearch(q);
    if (!r.list.length && r.err === "搜尋沒有結果") r = await ytSearch(q); // 偶爾會回空白頁，再試一次
    if (r.err) err = r.err;
    r.list.forEach((v, i) => {
      const sc = ytScore(v.name, title, en) * 100 - i; // 同分的照搜尋結果的順序
      if (sc >= 70 * 100 - 50 && (!best || sc > best.sc)) best = { ...v, sc }; // 70 分以上 = 標題有台灣片名
    });
    if (best) break;
  }
  const b = best as { key: string; name: string; sc: number } | null;
  return b ? { key: b.key, name: b.name } : { err: err || "搜尋結果裡沒有確定是這部片預告的影片" };
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
          const r = (await tmdbRuntime(m.title, token)) || ((m as any).en ? await tmdbRuntime(String((m as any).en), token) : 0);
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
  if (!moviesCache) {
    const list = await fillRuntimes(await parse<TwMovie[]>("parseTwMovies", await getText(TW + "/movies/")));
    // 場次通的「即將上映」其實是「今天沒有場次、之後幾天才有」：已經上映過的片（只是今天剛好沒排）也在裡面。
    // 用伺服器查好的上映日期分開：上映日已過的歸回上映中（標「今天沒有場次」），其餘才是真的即將上映
    const meta = await loadMeta().catch(() => null);
    const today = todayTPE();
    for (const m of list) {
      const e = meta && (meta.movies[normTitle(m.title)] || meta.movies[normTitle(baseTitle(m.title))]);
      if (e?.rd) m.release = e.rd;
      if (m.comingSoon && m.release && m.release <= today) {
        m.comingSoon = false;
        m.noShowToday = true;
      }
    }
    const soon = list.filter((m) => m.comingSoon).sort((a, b) => (a.release || "9999").localeCompare(b.release || "9999")); // 快上映的排前面
    moviesCache = [...list.filter((m) => !m.comingSoon && !m.noShowToday), ...list.filter((m) => m.noShowToday), ...soon];
  }
  return moviesCache;
}
/** 場次通電影頁上的上映日期（YYYY-MM-DD，沒有回傳空字串）。一部片一個請求，只給伺服器排程用 */
export async function twReleaseDate(slug: string): Promise<string> {
  const r = await get(`${TW}/movies/${encodeURIComponent(slug).replace(/%3A/gi, ":")}/`);
  if (!r.ok) throw new Error("no page");
  return (r.body.match(/"datePublished":"(\d{4}-\d{2}-\d{2})/) || [])[1] || "";
}
/** 上映日期的顯示文字：「2026/08/07 上映」（沒有日期回傳空字串） */
export function releaseLabel(d?: string | null): string {
  return d && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${d.slice(0, 10).replace(/-/g, "/")} 上映` : "";
}
/** 已經讀過的資料裡這部片的上映日期（電影清單、票房排行；都沒有回傳空字串）。不另外上網查 */
export function releaseOf(title: string): string {
  const k = normTitle(title), b = normTitle(baseTitle(title));
  const m = (moviesCache || []).find((x) => normTitle(x.title) === k) || (moviesCache || []).find((x) => normTitle(baseTitle(x.title)) === b);
  if (m?.release) return m.release;
  const ck = communityKey(title);
  return (boxData?.list.find((x) => communityKey(x.name) === ck)?.release || "").slice(0, 10);
}
/** 票房排行每一列的兩行說明：第一行金額，第二行上映日期與戲院數 */
/** past = 看的是過去某一週的排行：金額是「當週」，累計是到那一週為止 */
export function boxOfficeLines(x: BoxOfficeItem, by: BoxSort = "week", past = false): [string, string] {
  const week = x.week !== null && !x.since ? `${past ? "當週" : "本週"} ${money(x.week)}` : "";
  const total = `累計 ${money(x.total)}`;
  return [
    // 排的是哪一種，就把那個數字放前面
    by === "year" ? total : by === "total" ? [total, week].filter(Boolean).join("｜") : x.since ? `上映至${past ? "當時" : "今"} ${money(x.total)}` : [week, total].filter(Boolean).join("｜"),
    // 年度排行混著已經下檔的片：還在上映的標出來
    [by === "year" && x.showing ? "上映中" : "", releaseLabel(x.release), x.theaters ? `${x.theaters} 間戲院` : ""].filter(Boolean).join("｜"),
  ];
}
/** 票房排行的三種排法。week、total 排的都是「上映中」的片（這一週還有賣出票的）：week 依這一週的票房、total 依上映以來的累計；
 *  year = 年度總排行，今年上映的片依累計排，已經下檔的也算 */
export type BoxSort = "week" | "total" | "year";
/** 這份資料可以用的排法與按鈕上的字（還沒有週票房、或舊資料沒有年度排行時，選項會少） */
export function boxSorts(b: BoxOffice): { id: BoxSort; label: string }[] {
  const out: { id: BoxSort; label: string }[] = [{ id: "week", label: b.mode === "week" ? "本週" : "近期" }];
  if (b.mode === "week") out.push({ id: "total", label: "累計" });
  if (boxYears(b).length) out.push({ id: "year", label: "年度" });
  return out;
}
/** 年度排行有哪幾年可以選（新的在前） */
export function boxYears(b: BoxOffice): string[] {
  const ys = Object.keys(b.years || {}).filter((y) => (b.years![y] || []).length);
  if (!ys.length && b.year && b.year.length) ys.push(b.end.slice(0, 4)); // 舊資料只有今年
  return ys.sort().reverse();
}
/** 實際採用的年份：選的裡面有效的；都沒有就用最新的一年 */
export function boxYearsPicked(b: BoxOffice, years?: string[]): string[] {
  const all = boxYears(b);
  const picked = (years || []).filter((y) => all.indexOf(y) >= 0).sort();
  return picked.length ? picked : all.slice(0, 1);
}
const yearText = (ys: string[]) => (ys.length === 1 ? ys[0] : ys.every((y, i) => !i || Number(y) === Number(ys[i - 1]) + 1) ? `${ys[0]}–${ys[ys.length - 1]}` : ys.join("、"));
/** 依排法排好、重新編名次的清單。年度可以複選好幾年：合在一起依累計票房重排 */
export function boxOfficeBy(b: BoxOffice, by: BoxSort, years?: string[], week?: string): BoxOfficeItem[] {
  if (by === "week") {
    const w = boxWeekPicked(b, week);
    return w.past ? (b.weekLists && b.weekLists[w.id]) || [] : b.list; // 過去的週次（要先用 loadBoxOfficeWeeks 讀進來）
  }
  if (by === "year") {
    const ys = boxYearsPicked(b, years);
    const of = (y: string) => (b.years && b.years[y]) || (y === b.end.slice(0, 4) ? b.year || [] : []);
    if (ys.length === 1) return of(ys[0]);
    return ys.flatMap(of).sort((x, y) => y.total - x.total).map((x, i) => ({ ...x, rank: i + 1 }));
  }
  if (by !== "total") return b.list;
  return b.list.slice().sort((x, y) => y.total - x.total).map((x, i) => ({ ...x, rank: i + 1 }));
}
/** 排行的標題：「上映中｜11/9–11/15 週票房」「上映中｜累計票房（截至 11/15）」「2025–2026 年度總排行（截至 11/15）」 */
export function boxOfficeTitle(b: BoxOffice, by: BoxSort, years?: string[], week?: string): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  if (by === "week" && boxWeekPicked(b, week).past) {
    const o = boxWeekOptions(b).find((x) => x.id === week);
    return `${o ? o.label : ""} 週票房（${o ? o.note : "過去"}）`; // 過去的週次不標「上映中」：那時候的片現在可能已經下檔
  }
  if (by === "year") return `${yearText(boxYearsPicked(b, years))} 年度總排行（截至 ${md(b.end)}）`;
  if (by === "total") return `上映中｜累計票房（截至 ${md(b.end)}）`;
  return b.mode === "week" ? `上映中｜${md(b.start)}–${md(b.end)} 週票房` : boxOfficeLabel(b);
}
/** 年度排行一次顯示幾列（一年有六百部左右，全選是好幾千部：分批顯示，底下放「顯示更多」） */
export const BOX_PAGE = 100;
/** 排行下方的說明 */
export function boxOfficeFooter(b: BoxOffice, by: BoxSort, years?: string[], week?: string): string {
  const src = `資料來源：${b.source}。官方每週更新一次。`;
  if (by === "week" && boxWeekPicked(b, week).past)
    return `這是那一週的排行：「當週」是那七天的票房，「累計」算到那一週為止。那時候上映的片，現在可能已經下檔。標「上映至當時」的是官方那一週才第一次列入的新片，數字是上映以來的累計。${src}`;
  if (by === "year") {
    const ys = boxYearsPicked(b, years);
    return `${yearText(ys)} 年上映、有票房紀錄的電影依累計票房排序；已經下檔的也在裡面，標「上映中」的是這一週還有賣出票的。年度依上映日期歸屬，票房是上映以來的累計。一次顯示 100 部，舊片的海報會慢慢補上，找不到的用預設海報。${src}`;
  }
  const scope = `只排上映中的電影：這一週有賣出票的共 ${b.list.length} 部，已經下檔的不在裡面（看「年度」）。`;
  return by === "total" ? `${scope}${src}` : `${scope}${boxOfficeNote(b)}${src}`;
}
/** 電影清單（上映中、即將上映）每一列的兩行說明，各自一行不換行：
 *  第一行：「今天無場次」或上映日期｜分級｜片長｜放映影城數；第二行：英文片名 */
export function movieLines(m: TwMovie): [string, string] {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const head = m.noShowToday ? "今天無場次" : m.comingSoon ? (m.release ? `${md(m.release)} 上映` : "") : "";
  return [[head, m.rating, m.runtime ? `${m.runtime} 分` : "", m.cinemaCount ? `${m.cinemaCount} 間影城` : ""].filter(Boolean).join("｜"), m.en || ""];
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

/** 這間影城這一天、這部片的完整版本與場次（讀影城頁）；找不到這部片回傳 null */
export async function movieCinemaVersions(c: Cinema, date: string, title: string): Promise<Version[] | null> {
  const r = await moviesOf(c, date);
  const k = normTitle(title), bk = normTitle(baseTitle(title));
  const hit = r.movies.find((m) => normTitle(m.title) === k) || r.movies.find((m) => normTitle(baseTitle(m.title)) === bk);
  return hit && hit.versions.some((v) => v.times.length) ? hit.versions : null;
}

/** 補齊電影頁各影城的版本：場次通的電影頁每間影城只列一種版本（例如只有 4DX），其他版本要讀影城頁才有。
 *  ids：要補的影城（不給就全部）；一次 6 間。直接改 day 裡的資料，補過的影城標記 full */
export async function fillMovieDay(day: TwMovieDay, ids?: string[]): Promise<TwMovieDay> {
  const todo = day.cinemas.filter((c) => !c.full && (!ids || ids.indexOf(c.id) >= 0));
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: Math.min(6, queue.length) }, async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
        try {
          const cinema: Cinema = { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address };
          const full = await movieCinemaVersions(cinema, day.date, day.title);
          const count = (vs: Version[]) => vs.reduce((a, v) => a + v.times.length, 0);
          if (full && count(full) >= count(c.versions)) c.versions = full; // 影城頁讀到的比較少就不換（可能是對錯片）
          c.full = true;
        } catch (_) {
          // 這間讀不到：保留電影頁給的那一種版本，下次再試
        }
      }
    })
  );
  return day;
}
/** 這些影城都補齊了嗎 */
export const movieDayFilled = (day: TwMovieDay, ids: string[]) => day.cinemas.every((c) => c.full || ids.indexOf(c.id) < 0);

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

// 所有版本（Scriptable、Scripting、網頁、原生 App）的特殊廳篩選都只用這一份清單和 formatsOf，沒有第二套規則。
// 判斷方式：看來源網頁上每排場次前面的版本標籤裡有沒有這些字（各影城寫法不同，所以一類對應好幾種寫法）
export const FORMATS = ["IMAX", "杜比", "4DX", "MX4D", "ScreenX", "巨幕", "LED", "頂級廳", "3D"] as const;
export type Format = (typeof FORMATS)[number];
const FORMAT_RE: Record<Format, RegExp> = {
  IMAX: /IMAX/i,
  杜比: /DOLBY|杜比|(?<![A-Z])DVA(?![A-Z])|ATMOS/i, // Dolby Cinema、秀泰的 DVA（Dolby Vision＋Atmos）、Atmos 廳
  "4DX": /4DX/i,
  MX4D: /MX4D/i,
  ScreenX: /SCREEN\s*X/i,
  巨幕: /巨幕|寬巨|TITAN|LUXE|ULTRA/i, // 秀泰 巨幕／寬巨／ULTRA、MUVIE TITAN、新光 LUXE
  LED: /(?<![A-Z])LED(?![A-Z])|ONYX/i, // LG LED Cinema 等 LED 螢幕廳
  頂級廳: /gold\s*class|mucrown|金鑽|貴賓|VIP|皇家|丹普|REMMI/i,
  "3D": /(?<![A-Z0-9])3D/i,
};

/** 版本標籤屬於哪些特殊廳，例如「IMAX 雷射 英語」→ ["IMAX"]；一個標籤可以同時屬於好幾類（「IMAX 3D」） */
export function formatsOf(label: string): Format[] {
  return FORMATS.filter((f) => FORMAT_RE[f].test(label));
}

/** 只留下符合特殊廳的版本；format 為空時原樣回傳 */
export function filterVersions(versions: Version[], format: Format | "" | undefined): Version[] {
  return format ? versions.filter((v) => formatsOf(v.label).indexOf(format) >= 0) : versions;
}

/** 複選版：留下屬於「其中任一種」特殊廳的版本；一種都沒選就原樣回傳 */
export function filterVersionsAny(versions: Version[], formats: Format[]): Version[] {
  return formats.length ? versions.filter((v) => formatsOf(v.label).some((f) => formats.indexOf(f) >= 0)) : versions;
}
/** 「依電影找場次」的一列：某一天、某間影城（版本已經照特殊廳篩過） */
export interface MovieRow { day: TwMovieDay; date: string; cinema: TwMovieCinema }
/** 把幾天的資料攤平成一列一列，照條件篩選：縣市、特殊廳都可以複選（空的 = 不限），favIds 有給就只留常去影城。
 *  排序：縣市（北到南）→ 影城 → 日期 */
export function movieRows(days: TwMovieDay[], opt: { cities: string[]; formats: Format[]; favIds?: string[] | null }): MovieRow[] {
  const rows: MovieRow[] = [];
  const order: string[] = []; // 影城第一次出現的順序
  for (const day of days.slice().sort((a, b) => a.date.localeCompare(b.date)))
    for (const c of day.cinemas) {
      if (opt.cities.length && opt.cities.indexOf(c.city) < 0) continue;
      if (opt.favIds && opt.favIds.indexOf(c.id) < 0) continue;
      const versions = filterVersionsAny(c.versions, opt.formats);
      if (!versions.length) continue;
      if (order.indexOf(c.id) < 0) order.push(c.id);
      rows.push({ day, date: day.date, cinema: { ...c, versions } });
    }
  const cityRank = (x: string) => CITY_ORDER.indexOf(x) + 1 || 99;
  return rows.sort((a, b) => cityRank(a.cinema.city) - cityRank(b.cinema.city) || order.indexOf(a.cinema.id) - order.indexOf(b.cinema.id) || a.date.localeCompare(b.date));
}
/** 一次讀這部片好幾天的放映影城（讀不到的那一天略過） */
export async function movieDays(slug: string, dates: string[]): Promise<TwMovieDay[]> {
  const got = await Promise.all(dates.map((d) => movieDay(slug, d).catch(() => null)));
  return got.filter((d): d is TwMovieDay => !!d);
}

// ───────────────────────── 影展 ─────────────────────────
// 影展場次由另外的售票系統販售，影城的一般時刻表不會列。伺服器定期讀影展官網公開的場次表（tools/festival.mjs），
// 整理成 data 分支的 festival.json；裡面有還沒演的場次，App 就多出「影展」分類，影展結束就自動消失。
// 這一類只讀伺服器整理好的檔，手機不會自己去讀影展官網。
export const FESTIVAL_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/festival.json";
export interface FestivalFilm { id: string; title: string; mins: number; rating: string; url: string; poster?: string; trailer?: string; intro?: string; credits?: string }
/** 電影頁的「劇情簡介」：簡介本文，加上導演、演員（各一行）；都沒有就是空的 */
export function movieAbout(d: { intro?: string; director?: string; cast?: string } | null | undefined): { text: string; credits: string } {
  return { text: (d && d.intro) || "", credits: [d && d.director ? `導演：${d.director}` : "", d && d.cast ? `演員：${d.cast}` : ""].filter(Boolean).join("\n") };
}
/** 影展片的預告：官網有放預告就直接開那一支；沒有就開 YouTube 的搜尋結果（寧可搜尋也不要猜錯） */
export function festivalTrailer(film: FestivalFilm): { url: string; label: string } {
  return /^https:\/\//.test(film.trailer || "")
    ? { url: film.trailer as string, label: "觀看預告" }
    : { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(film.title + " 預告")}`, label: "搜尋預告" };
}
export interface FestivalSession { film: string; date: string; time: string; venue: string; room: string; ticket: string }
export interface Festival {
  id: string;
  name: string;
  start: string; // 影展期間 YYYY-MM-DD
  end: string;
  site: string; // 官網場次表
  source: string; // 資料來源的名稱
  ticketing?: string; // 售票系統的名稱
  films: FestivalFilm[];
  sessions: FestivalSession[];
}
let festivalsNow: Festival[] = []; // 這次執行讀到的（同步拿，給分頁列判斷要不要顯示「影展」）
/** 影展現在的狀態：now 進行中、soon 還沒開始、past 已經結束 */
export function festivalState(f: Festival): "now" | "soon" | "past" {
  const today = todayTPE();
  return f.end < today ? "past" : f.start > today ? "soon" : "now";
}
let festivalYearsNow: number[] = []; // 有影展資料的年份（新的在前）
type FestivalFile = { updated: number; years?: number[]; festivals: Festival[] };
const festivalSort = (list: Festival[]): Festival[] => {
  const rank = { now: 0, soon: 1, past: 2 };
  return list
    .filter((f) => f && Array.isArray(f.sessions) && f.sessions.length > 0)
    .sort((a, b) => rank[festivalState(a)] - rank[festivalState(b)] || (festivalState(a) === "soon" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)));
};
/** 某一年的影展：進行中的排最前面，再來是即將開始的，已經結束的排最後、新的在前。讀不到就是空的。
 *  不指定年份 = 今年；今年還沒有任何影展資料時，改給最近一個有資料的年份（回顧用）。
 *  往年的影展每年存成一個檔，選到那一年才讀 */
export async function loadFestivals(year?: number): Promise<Festival[]> {
  const thisYear = Number(todayTPE().slice(0, 4));
  const data = await loadServed<FestivalFile>("festival", FESTIVAL_URL, 24 * 14, (d) => Array.isArray(d.festivals)).catch(() => null);
  festivalsNow = festivalSort(data ? data.festivals : []);
  const years = new Set<number>((data && Array.isArray(data.years) ? data.years : []).filter((y) => y >= 2000 && y <= thisYear && (y !== thisYear || festivalsNow.length > 0)));
  if (festivalsNow.length) years.add(thisYear);
  festivalYearsNow = Array.from(years).sort((a, b) => b - a);
  const want = year && festivalYearsNow.indexOf(year) >= 0 ? year : festivalsNow.length ? thisYear : festivalYearsNow[0] || thisYear;
  if (want === thisYear) return festivalsNow;
  const old = await loadServed<FestivalFile>(`festival-${want}`, FESTIVAL_URL.replace(/\.json$/, `-${want}.json`), 24 * 30, (d) => Array.isArray(d.festivals)).catch(() => null);
  return festivalSort(old ? old.festivals : []);
}
/** 有影展資料的年份，新的在前（要先 loadFestivals 過） */
export const festivalYears = (): number[] => festivalYearsNow;
/** 「影展」分類要不要出現：今年有影展，或有往年的可以回顧 */
export const festivalsAny = (): boolean => festivalsNow.length > 0 || festivalYearsNow.length > 0;
/** 用代碼找影展（代碼最後帶年份，往年的也找得到） */
export async function festivalFind(id: string): Promise<Festival | null> {
  const y = Number((id.match(/-(\d{4})$/) || [])[1]) || 0;
  return (await loadFestivals(y || undefined)).find((f) => f.id === id) || null;
}
/** 影展期間的短寫法：「6/26–7/7」 */
export function festivalPeriod(f: Festival): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  return `${md(f.start)}–${md(f.end)}`;
}
/** 把影展分成兩組給畫面分開列：還沒結束的（進行中、即將開始）和已經結束的；空的那組不出現 */
export function festivalGroups(list: Festival[]): { title: string; past: boolean; items: Festival[] }[] {
  const live = list.filter((f) => festivalState(f) !== "past");
  const past = list.filter((f) => festivalState(f) === "past");
  return [
    { title: "進行中・即將開始", past: false, items: live },
    { title: "已結束（回顧）", past: true, items: past },
  ].filter((g) => g.items.length > 0);
}
/** 選單上一個影展的說明：還沒結束的寫狀態（進行中／幾月幾日開始），已結束的寫期間 */
export const festivalChipNote = (f: Festival): string => (festivalState(f) === "past" ? festivalPeriod(f) : festivalStateLabel(f));
/** 選中的影展那一行狀態：「已結束｜2026/6/26–7/7」「進行中｜2026/11/6–11/22」 */
export const festivalStatusLine = (f: Festival): string => `${festivalStateLabel(f)}｜${f.start.slice(0, 4)}/${festivalPeriod(f)}`;
/** 這次執行已經讀到的影展（沒讀過是空的） */
export const festivalsReady = (): Festival[] => festivalsNow;
/** 影展有場次的日期（整個影展期間；已經結束的影展也列，可以回頭看） */
export function festivalDates(f: Festival): string[] {
  return Array.from(new Set(f.sessions.map((x) => x.date))).sort();
}
/** 一進來先看哪一天：影展期間是今天，還沒開始是第一天，已經結束也是第一天 */
export function festivalDefaultDate(f: Festival): string {
  const dates = festivalDates(f);
  const today = todayTPE();
  return dates.indexOf(today) >= 0 ? today : dates.find((d) => d > today) || dates[0] || "";
}
/** 影展名稱後面的狀態說明：「進行中」「6/26 開始」「已結束」 */
export function festivalStateLabel(f: Festival): string {
  const st = festivalState(f);
  return st === "now" ? "進行中" : st === "past" ? "已結束" : `${Number(f.start.slice(5, 7))}/${Number(f.start.slice(8, 10))} 開始`;
}
/** 場地的顯示名稱：官網只寫「MUVIE」「台北信義威秀」，補成看得懂的；影廳接在後面 */
export function festivalPlace(x: { venue: string; room: string }): string {
  const v = /^MUVIE$/i.test(x.venue) ? "MUVIE CINEMAS" : x.venue;
  const room = /^[A-Za-z0-9 ]+$/.test(x.room) ? `${x.room} 廳` : x.room; // 只有英數的廳名（TITAN）補上「廳」；「3F放映廳」「2F放映室」原樣
  return [v, room].filter(Boolean).join(" ");
}
/** 影展的某一天：每部片一筆，附當天的場次（依第一場的時間排） */
export function festivalDay(f: Festival, date: string): { film: FestivalFilm; sessions: FestivalSession[] }[] {
  const by: Record<string, FestivalSession[]> = {};
  for (const x of f.sessions) if (x.date === date) (by[x.film] ||= []).push(x);
  const film = (id: string) => f.films.find((m) => m.id === id) || { id, title: "（片名未提供）", mins: 0, rating: "", url: f.site };
  return Object.keys(by)
    .map((id) => ({ film: film(id), sessions: by[id].sort((a, b) => a.time.localeCompare(b.time)) }))
    .sort((a, b) => a.sessions[0].time.localeCompare(b.sessions[0].time) || a.film.title.localeCompare(b.film.title));
}
/** 一部片在影展期間的所有場次 */
export function festivalFilmSessions(f: Festival, filmId: string): FestivalSession[] {
  return f.sessions.filter((x) => x.film === filmId).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
/** 清單上每一列的兩行說明：分級｜片長｜這天幾場；時間與影廳 */
export function festivalLines(film: FestivalFilm, sessions: FestivalSession[]): [string, string] {
  return [
    [film.rating, film.mins ? `${film.mins} 分` : "", `這天 ${sessions.length} 場`].filter(Boolean).join("｜"),
    sessions.map((x) => `${x.time} ${festivalPlace(x)}`).join("、"),
  ];
}
/** 在這一年的所有影展裡用片名找片（不分日期）：每部片一筆，附它在那個影展的所有場次 */
export function festivalSearch(list: Festival[], query: string): { f: Festival; film: FestivalFilm; sessions: FestivalSession[] }[] {
  const k = query.trim().toLowerCase().replace(/臺/g, "台");
  if (!k) return [];
  const out: { f: Festival; film: FestivalFilm; sessions: FestivalSession[] }[] = [];
  for (const f of list) for (const film of f.films) if (film.title.toLowerCase().replace(/臺/g, "台").indexOf(k) >= 0) out.push({ f, film, sessions: festivalFilmSessions(f, film.id) });
  return out;
}
/** 搜尋結果每一列的兩行說明：分級｜片長｜共幾場；哪個影展、哪幾天 */
export function festivalSearchLines(f: Festival, film: FestivalFilm, sessions: FestivalSession[]): [string, string] {
  const days = Array.from(new Set(sessions.map((x) => `${Number(x.date.slice(5, 7))}/${Number(x.date.slice(8, 10))}`)));
  return [
    [film.rating, film.mins ? `${film.mins} 分` : "", `共 ${sessions.length} 場`].filter(Boolean).join("｜"),
    [f.name, days.slice(0, 4).join("、") + (days.length > 4 ? " 等" : "")].filter(Boolean).join("｜"),
  ];
}
/** 影展場地對應到 App 裡的影城（地址、導航用）；對不到就給一個只有名字的 */
export function festivalCinema(x: { venue: string; room: string }, cinemas: Cinema[], f: Festival): Cinema {
  const v = x.venue.replace(/影城$/, "");
  const hit = /^MUVIE$/i.test(v)
    ? cinemas.find((c) => /MUVIE/i.test(c.name) && /台北|松仁/.test(c.name + c.district)) || cinemas.find((c) => /MUVIE/i.test(c.name))
    : cinemas.find((c) => c.name.replace(/影城$/, "") === v) || cinemas.find((c) => v.length >= 4 && c.name.indexOf(v) >= 0);
  return hit || { id: "fest-" + x.venue, name: festivalPlace({ venue: x.venue, room: "" }) || f.name, city: "", district: "", source: "tw", url: f.site };
}
/** 分頁列上「影展」那一顆的小字：有進行中的寫「進行中」，否則是最近要開始的日期，都結束了寫「回顧」 */
export function festivalNote(list: Festival[]): string {
  if (list.some((f) => festivalState(f) === "now")) return "進行中";
  const next = list.filter((f) => festivalState(f) === "soon").map((f) => f.start).sort()[0] || "";
  return next ? `${Number(next.slice(5, 7))}/${Number(next.slice(8, 10))} 開始` : list.length || festivalYearsNow.length ? "回顧" : "";
}
/** 影展清單下方的說明 */
export function festivalFooter(f: Festival): string {
  const past = festivalState(f) === "past" ? "這個影展已經結束，場次留著給你回頭看。" : "";
  return `${past}場次來自${f.source}${festivalState(f) === "past" ? "" : `，${f.ticketing ? `購票會開啟${f.ticketing}` : "購票請到官網"}，是否售完請以售票頁為準`}。影展的片名在院線上映時可能不同。`;
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
  day?: string; // 查的是哪一天（複選多天時用來分日期顯示；凌晨場算前一個營業日）
  ctx: { booking: string; sourceUrl: string; address: string };
}

/** 在多間影城裡找出某天、某時段開演的所有場次 */
export async function findShowtimes(
  scope: { cinema: Cinema; km: number | null }[],
  date: string,
  win: TimeWindow,
  format: Format | "" = "",
  onProgress?: (done: number, total: number) => void
): Promise<{ hits: Hit[]; failed: string[]; noData: string[] }> {
  // 要查哪幾個營業日、各自的時段。一般只有一段；
  // 過了午夜查「接下來 3 小時」時，正在演的凌晨場屬於「前一個營業日」的片單，所以要查前一天（跨過清晨 5 點的部分才查今天）
  let plans: { date: string; from: number; to: number }[] = [{ date, from: win.from, to: win.to }];
  if (win.id === "soon") {
    const hm = nowHM();
    const now = showMinute(hm); // 凌晨是 24:00 之後
    if (isLate(hm) && date === todayTPE()) {
      const dayEnd = 29 * 60; // 營業日到清晨 5 點
      plans = [{ date: addDays(date, -1), from: now, to: Math.min(now + 180, dayEnd) }];
      if (now + 180 > dayEnd) plans.push({ date, from: 5 * 60, to: now + 180 - 24 * 60 });
    } else {
      plans = [{ date, from: now, to: now + 180 }];
    }
  }
  const hits: Hit[] = [];
  const failed = new Set<string>();
  const noData = new Set<string>();
  let done = 0;
  const queue = scope.slice();
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const own = lateOnOwnDate(item.cinema.source);
      for (const plan of plans) {
        // 要讀哪幾天的片單：一般就是營業日那天；場次通的凌晨場在隔天的片單上，時段跨過午夜時要多讀一天
        const pages: { page: string; late: boolean | null }[] = own
          ? [{ page: plan.date, late: false }, ...(plan.to > 24 * 60 ? [{ page: addDays(plan.date, 1), late: true }] : [])]
          : [{ page: plan.date, late: null }];
        for (const pg of pages) {
          if (own && !pg.late && plan.from >= 24 * 60) continue; // 只要凌晨的部分，不用讀當天
          try {
            const r = await moviesOf(item.cinema, pg.page);
            for (const m of r.movies)
              for (const v of filterVersions(m.versions, format))
                for (const t of v.times) {
                  if (pg.late !== null && isLate(t) !== pg.late) continue;
                  const min = showMinute(t);
                  if (min >= plan.from && min < plan.to)
                    hits.push({ cinema: item.cinema, movie: m, version: v, time: t, date: pg.page, km: item.km, ctx: { booking: r.booking, sourceUrl: r.sourceUrl, address: r.address } });
                }
          } catch (_) {
            // 分清楚「來源沒有這天的資料」和「真的讀不到」：影城頁讀得到、只是沒列這一天，就不算失敗
            let known: string[] | null = null;
            try {
              known = (await datesOf(item.cinema)).dates;
            } catch (_) {}
            if (known && known.indexOf(pg.page) < 0) {
              if (pg.page === date) noData.add(item.cinema.name); // 前後一天的片單還沒有或已撤掉是常態，不用提示
            } else failed.add(item.cinema.name);
          }
        }
      }
      onProgress && onProgress(++done, scope.length);
    }
  }
  await Promise.all([0, 1, 2, 3, 4, 5].map(worker)); // 同時最多 6 間，避免一次打太多網站
  hits.sort((a, b) => showMinute(a.time) - showMinute(b.time) || (a.km ?? 1e9) - (b.km ?? 1e9));
  return { hits, failed: Array.from(failed), noData: Array.from(noData).filter((n) => !failed.has(n)) };
}

/** 複選版：多個日期 × 多個時段 × 多種特殊廳一起找（影城的片單有快取，同一間同一天只會讀一次）。
 *  時段沒選＝整天；「接下來 3 小時」只對今天有效；特殊廳沒選＝不限，選了幾種就是「其中任一種」 */
export async function findShowtimesMulti(
  scope: { cinema: Cinema; km: number | null }[],
  dates: string[],
  winIds: string[],
  formats: Format[] = []
): Promise<{ hits: Hit[]; failed: string[]; noData: string[] }> {
  const today = todayTPE();
  const days = Array.from(new Set(dates.length ? dates : [today])).sort();
  let wins = WINDOWS.filter((w) => winIds.indexOf(w.id) >= 0);
  if (!wins.length || wins.some((w) => w.id === "all")) wins = WINDOWS.filter((w) => w.id === "all");
  const seen = new Set<string>();
  const hits: Hit[] = [];
  const failed = new Set<string>();
  const noData = new Set<string>();
  for (const day of days) {
    // 「接下來 3 小時」只有今天有意義；其他天如果只選了它，就不查那一天
    const use = wins.filter((w) => !w.todayOnly || day === today);
    for (const w of use) {
      const r = await findShowtimes(scope, day, w, "");
      for (const h of r.hits) {
        if (formats.length && !formatsOf(h.version.label).some((f) => formats.indexOf(f) >= 0)) continue;
        const k = [h.cinema.id, h.date, h.movie.title, h.version.label, h.time].join("|");
        if (seen.has(k)) continue; // 時段重疊（例如同時選了「接下來 3 小時」和「晚上」）
        seen.add(k);
        hits.push({ ...h, day });
      }
      r.failed.forEach((n) => failed.add(n));
      r.noData.forEach((n) => noData.add(n));
    }
  }
  hits.sort((a, b) => (a.day || "").localeCompare(b.day || "") || showMinute(a.time) - showMinute(b.time) || (a.km ?? 1e9) - (b.km ?? 1e9));
  return { hits, failed: Array.from(failed), noData: Array.from(noData).filter((n) => !failed.has(n)) };
}
/** 複選後標題列用的短摘要（只有一行的空間）：「11/22｜晚上 17–21 點」「11/22–11/24｜2 個時段」「3 天｜整天」 */
export function multiLabel(dates: string[], winIds: string[]): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const ds = dates.slice().sort();
  const run = ds.every((d, i) => !i || d === addDays(ds[i - 1], 1)); // 連續的幾天
  const day = ds.length === 1 ? md(ds[0]) : run ? `${md(ds[0])}–${md(ds[ds.length - 1])}` : `${ds.length} 天`;
  const wins = WINDOWS.filter((w) => winIds.indexOf(w.id) >= 0);
  const w = !wins.length || wins.some((x) => x.id === "all") ? "整天" : wins.length === 1 ? wins[0].label : `${wins.length} 個時段`;
  return `${day}｜${w}`;
}
/** 完整的查詢條件（放在內文，可以換行）：「日期：11/22、11/24\n時段：晚上 17–21 點、深夜 21 點後」 */
export function multiDetail(dates: string[], winIds: string[]): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const wins = WINDOWS.filter((w) => winIds.indexOf(w.id) >= 0);
  const w = !wins.length || wins.some((x) => x.id === "all") ? "整天" : wins.map((x) => x.label).join("、");
  return `日期：${dates.slice().sort().map(md).join("、")}\n時段：${w}`;
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
async function identify(title: string, en: string | undefined, errs: string[], yearHint = 0): Promise<Ident | null> {
  const token = ((await loadSettings()).tmdbToken || "").trim();
  // 有開眼的上映年份時，只接受年份相差 1 年內的結果，避免同名的舊片、紀錄片被當成這部（對不到就顯示「-」）
  const okYear = (y: number) => !yearHint || !y || Math.abs(y - yearHint) <= 1;
  // IMDb 搜尋建議：一次請求、很小，手機上最快
  const viaImdb = (async (): Promise<Ident | null> => {
    for (const q of [en, baseTitle(title)].filter(Boolean) as string[]) {
      const key = q.toLowerCase().replace(/[\\/?#%]/g, " ").trim();
      try {
        const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(key)}.json`, { "User-Agent": UA });
        const d = (JSON.parse(r.body).d || []) as any[];
        const hit = d.find((x) => /^tt/.test(x.id) && (x.qid === "movie" || x.qid === "tvMovie" || x.qid === "video") && okYear(Number(x.y) || 0));
        if (hit) return { id: hit.id, name: String(hit.l || en || ""), year: Number(hit.y) || 0 };
      } catch (e) {
        errs.push("IMDb 搜尋暫時讀不到");
      }
    }
    return null;
  })();
  if (!token) return viaImdb;
  // 有金鑰：TMDB 對應的 IMDb 編號比較準，但要 2～3 次請求；跟 IMDb 搜尋同時查，TMDB 2.5 秒內沒回就先用 IMDb 的結果
  const viaTmdb = (async (): Promise<Ident | null> => {
    try {
      const hit = await tmdbFind(title, token);
      if (hit) {
        const [ids, d] = await Promise.all([tmdb(`/movie/${hit.id}/external_ids`, token), tmdb(`/movie/${hit.id}?language=en-US`, token)]);
        const year = Number(String(d?.release_date || "").slice(0, 4)) || 0;
        if (ids?.imdb_id && okYear(year)) return { id: String(ids.imdb_id), name: d?.title || d?.original_title || en || "", year };
      }
    } catch (e) {
      errs.push("TMDB 暫時讀不到");
    }
    return null;
  })();
  const first = await Promise.race([viaTmdb, delay(2500).then(() => "slow" as const)]);
  if (first && first !== "slow") return first;
  return (await viaImdb) || (await viaTmdb);
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

async function findRatings(title: string, en?: string, slug?: string): Promise<Ratings> {
  const out: Ratings = {};
  const errs: string[] = [];
  const who = await identify(title, en, errs, await atYearHint(title, slug, en));
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
export function movieRatings(title: string, en?: string, slug?: string): Promise<Ratings> {
  const k = normTitle(title);
  return (ratingsMem[k] ||= (async () => {
    const read = (): Record<string, Ratings & { at: number }> => {
      try {
        return JSON.parse(cacheGet("ratings.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()[k] as (Ratings & { at: number; v?: number }) | undefined;
    const has = (x: Ratings) => !!(x.imdb || x.tomato || x.popcorn);
    // 有分數記 7 天；查過但沒有任何評分（新片、演唱會）記 1 天，不用每次進電影頁都重查。
    // 舊版（比對規則改了，例如加了年份檢查）記下的一律重查，避免手機上留著對錯片的分數
    if (hit && hit.v === RATINGS_V && Date.now() - hit.at < (has(hit) ? 7 : 1) * 86400e3) return hit;
    const me = await metaOf(title);
    if (me && me.r && me.ra) return me.r; // 伺服器已經查好評分（空物件 = 查過、沒有評分）
    const r = await findRatings(title, en, slug);
    // 有錯（連線失敗）：不寫進手機快取（下次啟動再試），但這次執行內記住結果，重畫時不用再查
    if (!r.err || has(r)) {
      const all = read();
      for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 86400e3) delete all[key];
      const { err: _e, ...keep } = r;
      all[k] = { ...keep, at: Date.now(), v: RATINGS_V } as Ratings & { at: number };
      cacheSet("ratings.json", JSON.stringify(all));
    }
    return r;
  })());
}
/** ratings.json 紀錄的版本：比對規則改了就加 1，讓舊紀錄重查 */
const RATINGS_V = 2;

/** 評分顏色等級：good（綠）／mid（黃）／bad（紅） */
export function ratingTier(kind: "imdb" | "pct", v: number): "good" | "mid" | "bad" {
  const x = kind === "imdb" ? v * 10 : v;
  return x >= 75 ? "good" : x >= 60 ? "mid" : "bad";
}

// ───────────────────────── 觀眾評分（大家一起統計） ─────────────────────────
// 後端是 Cloudflare Worker（worker/ 資料夾）：每部片一個計數器，一台手機一票，可以改票或取消。
// 片名鍵用去掉裝飾字、重映字樣後的片名，所以兩個 App、同一部片的不同場次條目都算在一起。

/** 網頁版的網址（「關於」與隱私權政策也放在這裡） */
export const SITE_URL = "https://app.twmovietime.workers.dev";
export const ABOUT_URL = SITE_URL + "/about/";
export const PRIVACY_URL = SITE_URL + "/privacy/";
export const COMMUNITY_API = "https://movie-ratings.twmovietime.workers.dev";
export interface Community {
  n: number; // 評分人數
  avg: number; // 平均（1～5，一位小數；沒人評分是 0）
  dist: number[]; // 1 星～5 星各幾人
  mine: number; // 這支手機給的分數（0 = 還沒評）
}
/** 這支手機的匿名代號：第一次用時隨機產生，存在本機；只用來做「一台一票、可以改票」 */
function deviceId(): string {
  const ok = (x: string | null): x is string => !!x && /^[A-Za-z0-9_-]{16,64}$/.test(x);
  const saved = cacheGet("device-id.txt");
  if (ok(saved)) return saved;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)];
  cacheSet("device-id.txt", id);
  return id;
}
export const communityKey = (title: string) => normTitle(baseTitle(title)).slice(0, 120);
const communityMem: Record<string, Community & { at: number }> = {};
/** 已經讀過的觀眾評分（畫面重畫時用，不用再等網路） */
export function communityCached(title: string): Community | null {
  return communityMem[communityKey(title)] || null;
}

// 省伺服器請求：所有片的評分統計每 30 分鐘由 GitHub Actions 存成靜態檔（data 分支），App 平常只讀這個檔；
// 自己投的票記在手機上。只有投票、以及每部片第一次（之後每 30 天一次）確認自己的票時才會打到伺服器。
export const COMMUNITY_SUMMARY_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/community.json";
type Summary = Record<string, number[]>;
let summaryMem: { at: number; job: Promise<Summary | null> } | null = null;
/** 靜態總表（記 5 分鐘）；還沒有這個檔或讀不到回傳 null，改用伺服器 */
function loadSummary(): Promise<Summary | null> {
  if (summaryMem && Date.now() - summaryMem.at < 300e3) return summaryMem.job;
  const job = (async () => {
    try {
      const r = await platform().fetchText(COMMUNITY_SUMMARY_URL + "?t=" + Math.floor(Date.now() / 300e3), { accept: "application/json" });
      if (r.status !== 200) return null;
      const m = JSON.parse(r.body)?.movies;
      return m && typeof m === "object" ? (m as Summary) : null;
    } catch (_) {
      return null;
    }
  })();
  summaryMem = { at: Date.now(), job };
  return job;
}
/** 這支手機的投票紀錄：s = 我給的分數，at = 上次跟伺服器確認的時間；dist／dat = 伺服器最近回的統計（剛投完票時比靜態檔新） */
interface MyVote { s: number; at: number; dist?: number[]; dat?: number }
const readMyVotes = (): Record<string, MyVote> => {
  try {
    return JSON.parse(cacheGet("my-votes.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};
function saveMyVote(k: string, c: Community, fresh: boolean) {
  const all = readMyVotes();
  for (const [key, v] of Object.entries(all)) if (!v.s && Date.now() - v.at > 60 * 86400e3) delete all[key]; // 沒投票的舊紀錄清掉
  all[k] = fresh ? { s: c.mine, at: Date.now(), dist: c.dist, dat: Date.now() } : { s: c.mine, at: Date.now() };
  cacheSet("my-votes.json", JSON.stringify(all));
}
const fromDist = (dist: number[], mine: number): Community => {
  const d = [0, 1, 2, 3, 4].map((i) => Number(dist[i]) || 0);
  const n = d.reduce((a, b) => a + b, 0);
  const sum = d.reduce((a, c, i) => a + c * (i + 1), 0);
  return { n, avg: n ? Math.round((sum / n) * 10) / 10 : 0, dist: d, mine };
};
/** 讀觀眾評分（5 秒內讀過或剛投過票就直接用） */
export async function communityStats(title: string): Promise<Community> {
  const k = communityKey(title);
  const hit = communityMem[k];
  if (hit && Date.now() - hit.at < 5000) return { n: hit.n, avg: hit.avg, dist: hit.dist, mine: hit.mine };
  const mine = readMyVotes()[k];
  if (mine && Date.now() - mine.at < 30 * 86400e3) {
    const summary = await loadSummary();
    if (summary) {
      // 剛投完票的 45 分鐘內用伺服器當時回的統計（靜態檔還沒更新）
      const c = fromDist(mine.dist && mine.dat && Date.now() - mine.dat < 45 * 60e3 ? mine.dist : summary[k] || [], mine.s);
      communityMem[k] = { ...c, at: Date.now() };
      return c;
    }
  }
  const r = await platform().fetchText(`${COMMUNITY_API}/v1/stats?m=${encodeURIComponent(k)}&d=${encodeURIComponent(deviceId())}`, { accept: "application/json" });
  if (r.status !== 200) throw new Error("觀眾評分暫時讀不到");
  const c = JSON.parse(r.body) as Community;
  communityMem[k] = { ...c, at: Date.now() };
  saveMyVote(k, c, false);
  return c;
}
/** 投票：score 1～5；0 = 取消。回傳更新後的統計 */
export async function communityVote(title: string, score: number): Promise<Community> {
  const k = communityKey(title);
  const r = await platform().fetchText(
    `${COMMUNITY_API}/v1/vote`,
    { accept: "application/json", "content-type": "application/json" },
    { method: "POST", body: JSON.stringify({ m: k, d: deviceId(), s: score }) }
  );
  if (r.status === 429) throw new Error("投票太頻繁，請稍後再試");
  if (r.status !== 200) throw new Error("評分沒有送出，請稍後再試");
  const c = JSON.parse(r.body) as Community;
  communityMem[k] = { ...c, at: Date.now() };
  saveMyVote(k, c, true);
  return c;
}

// ───────────────────────── 全台票房排行 ─────────────────────────
// 來源：國家電影及視聽文化中心「全國電影票房統計」開放資料（政府資料開放授權條款第 1 版）。
// 官方只給累計票房，所以由 GitHub Actions 每週存快照算出週票房（tools/boxoffice.mjs），App 只讀算好的小檔。

export const BOXOFFICE_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice.json";
export interface BoxOfficeItem {
  rank: number;
  name: string;
  country: string;
  release: string; // 上映日 YYYY-MM-DD
  theaters: number; // 上映戲院數
  week: number | null; // 這週票房（元）；mode 是 total 時沒有
  since?: boolean; // week 不是單週：官方上週還沒列入這部片，數字是上映至今的累計
  showing?: boolean; // 年度排行用：這週還有賣出票（還在上映）
  total: number; // 累計票房（元）
}
export interface BoxOffice {
  mode: "week" | "total"; // week = 週票房排行；total = 還沒有上週資料，先列近 8 週上映片的累計
  start: string;
  end: string;
  source: string;
  sourceUrl: string;
  list: BoxOfficeItem[];
  year?: BoxOfficeItem[]; // 年度總排行：今年上映的片依累計票房排，已經下檔的也在裡面（week 一律是 null）
  years?: Record<string, BoxOfficeItem[]>; // 各年的年度排行：年份 → 排行
  weeks?: { start: string; end: string }[]; // 有哪幾週的週票房可以看（新的在前；第一筆就是這一週）
  weekLists?: Record<string, BoxOfficeItem[]>; // 過去各週的排行：那一週的結束日 → 排行（選了才下載）
}
let boxMem: Promise<BoxOffice> | null = null;
let boxData: BoxOffice | null = null; // 這次執行讀到的排行（releaseOf 同步查用）
/** 讀票房排行（手機上記 6 小時；官方一週才更新一次）。排行改成排到底後換了快取檔名，舊的前 20 名不再用 */
export function loadBoxOffice(): Promise<BoxOffice> {
  return (boxMem ||= (async () => {
    try {
      const c = JSON.parse(cacheGet("boxoffice5.json") || "null");
      if (c && c.data && Date.now() - c.at < 6 * 3600e3) return c.data as BoxOffice;
    } catch (_) {}
    const r = await platform().fetchText(BOXOFFICE_URL + "?t=" + Math.floor(Date.now() / 3600e3), { accept: "application/json" });
    if (r.status !== 200) throw new Error("票房排行暫時讀不到");
    const data = JSON.parse(r.body) as BoxOffice;
    if (!data || !Array.isArray(data.list)) throw new Error("票房排行格式不對");
    cacheSet("boxoffice5.json", JSON.stringify({ at: Date.now(), data }));
    return data;
  })().then((d) => (boxData = d)).catch((e) => {
    boxMem = null;
    throw e;
  }));
}
/** 各年的年度排行（官方資料從 2016 年起），另外一個檔：切到「年度」才下載 */
export const BOXOFFICE_YEARS_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice-years.json";
let boxYearsMem: Promise<BoxOffice> | null = null;
/** 票房排行＋所有年份的年度排行（手機上記 6 小時）。年份檔讀不到時，照樣回傳只有今年的那份 */
export function loadBoxOfficeFull(): Promise<BoxOffice> {
  return (boxYearsMem ||= (async () => {
    const b = await loadBoxOffice();
    let years: Record<string, BoxOfficeItem[]> | null = null;
    try {
      const c = JSON.parse(cacheGet("boxoffice-years.json") || "null");
      if (c && c.years && c.end === b.end && Date.now() - c.at < 6 * 3600e3) years = c.years;
    } catch (_) {}
    if (!years) {
      const r = await platform().fetchText(BOXOFFICE_YEARS_URL + "?t=" + Math.floor(Date.now() / 3600e3), { accept: "application/json" });
      if (r.status !== 200) throw new Error("年度排行暫時讀不到");
      const d = JSON.parse(r.body);
      if (!d || typeof d.years !== "object") throw new Error("年度排行格式不對");
      years = d.years as Record<string, BoxOfficeItem[]>;
      cacheSet("boxoffice-years.json", JSON.stringify({ at: Date.now(), end: d.end, years }));
    }
    // 年份檔為了省空間沒有 week、country 欄位：補上預設值
    const full: Record<string, BoxOfficeItem[]> = {};
    for (const y of Object.keys(years)) full[y] = years[y].map((x) => ({ ...x, week: null, country: x.country || "" }));
    return { ...b, years: { ...(b.years || {}), ...full } };
  })().catch(async (e) => {
    boxYearsMem = null; // 下次再試
    return loadBoxOffice(); // 至少有今年的
  }));
}
/** 過去各週的週票房排行，另外一個檔：選了過去的週次才下載 */
export const BOXOFFICE_WEEKS_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice-weeks.json";
let boxWeeksMem: Promise<BoxOffice> | null = null;
/** 票房排行＋過去各週的排行（手機上記 6 小時）。讀不到時回傳只有這一週的那份 */
export function loadBoxOfficeWeeks(): Promise<BoxOffice> {
  return (boxWeeksMem ||= (async () => {
    const b = await loadBoxOffice();
    let weeks: { start: string; end: string; list: BoxOfficeItem[] }[] | null = null;
    try {
      const c = JSON.parse(cacheGet("boxoffice-weeks.json") || "null");
      if (c && c.weeks && c.end === b.end && Date.now() - c.at < 6 * 3600e3) weeks = c.weeks;
    } catch (_) {}
    if (!weeks) {
      const r = await platform().fetchText(BOXOFFICE_WEEKS_URL + "?t=" + Math.floor(Date.now() / 3600e3), { accept: "application/json" });
      if (r.status !== 200) throw new Error("過去的週票房暫時讀不到");
      const d = JSON.parse(r.body);
      if (!d || !Array.isArray(d.weeks)) throw new Error("過去的週票房格式不對");
      weeks = d.weeks as { start: string; end: string; list: BoxOfficeItem[] }[];
      cacheSet("boxoffice-weeks.json", JSON.stringify({ at: Date.now(), end: b.end, weeks }));
    }
    const weekLists: Record<string, BoxOfficeItem[]> = {};
    for (const w of weeks) weekLists[w.end] = w.list.map((x) => ({ ...x, country: x.country || "" }));
    return { ...b, weekLists };
  })().catch(async () => {
    boxWeeksMem = null; // 下次再試
    return loadBoxOffice();
  }));
}
/** 週票房可以選的週次（新的在前）。label 是日期區間，note 是「最新／上週／3 週前」 */
export function boxWeekOptions(b: BoxOffice): { id: string; label: string; note: string }[] {
  if (b.mode !== "week") return [];
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const all = (b.weeks && b.weeks.length ? b.weeks : [{ start: b.start, end: b.end }]).slice().sort((x, y) => y.end.localeCompare(x.end));
  return all.map((w) => {
    const ago = Math.round((Date.parse(b.end) - Date.parse(w.end)) / (7 * 86400e3));
    return { id: w.end, label: `${md(w.start)}–${md(w.end)}`, note: ago <= 0 ? "最新" : ago === 1 ? "上週" : `${ago} 週前` };
  });
}
/** 實際採用的週次：選的那一週有效就用，否則是最新的一週。past = 不是最新的一週 */
export function boxWeekPicked(b: BoxOffice, week?: string): { id: string; past: boolean } {
  const opts = boxWeekOptions(b);
  const id = week && opts.some((o) => o.id === week) ? week : b.end;
  return { id, past: id !== b.end };
}
/** 金額：1.53 億、1,534 萬 */
export function money(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(2).replace(/\.?0+$/, "") + " 億";
  if (n >= 1e4) return String(Math.round(n / 1e4)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " 萬";
  return String(Math.round(n)) + " 元";
}
/** 票房上的片名對到場次通的電影（對得到就能點進去看場次） */
export function matchBoxOffice<T extends { title: string }>(name: string, movies: T[]): T | undefined {
  const k = communityKey(name);
  return movies.find((m) => communityKey(m.title) === k);
}
/** 排行下方的說明：有「上映至今」的片時多解釋一句 */
export function boxOfficeNote(b: BoxOffice): string {
  return b.list.some((x) => x.since)
    ? "標「上映至今」的是官方這週才第一次列入的新片：沒有上週的數字可以相減，排名用的是上映以來的累計，會比單週多。"
    : "";
}
/** 同上，但先把片單整理成對照表：排行有好幾千列時，不用每一列都把整份片單比一遍 */
export function boxMatcher<T extends { title: string }>(movies: T[]): (name: string) => T | undefined {
  const map: Record<string, T> = {};
  for (const m of movies) map[communityKey(m.title)] ||= m;
  return (name) => map[communityKey(name)];
}
/** 排行的期間說明：「10/26–11/1 週票房」或「截至 11/1 累計」 */
export function boxOfficeLabel(b: BoxOffice): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  return b.mode === "week" ? `${md(b.start)}–${md(b.end)} 全台週票房` : `近期上映電影累計票房（截至 ${md(b.end)}）`;
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
  { re: /國賓|^ambassador/i, name: "國賓看電影", id: "435465064", schemes: ["ambassador", "ambassadorlookmovie", "ambassadortheatres", "ambassadorcinemas", "ambassadorapp", "lookmovie", "langshin", "tw.com.langshin.AmbassadorLookMovie", "tw.com.langshin.ambassadorlookmovie"] },
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
