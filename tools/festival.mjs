// 影展場次總表：讀影展官網公開的場次表，整理成 festival.json（data 分支），App 看到裡面有還沒演的場次就顯示「影展」分類。
// 目前支援金馬影展官網（台北金馬影展、金馬奇幻影展等共用同一套系統）：只讀公開網頁，購票連結原樣帶出、不讀售票網站。
// 也支援台北電影節、高雄電影節官網（不用登入的公開場次頁，資料是網頁自己用的 JSON）。
// 今年已經結束的影展也留著（可以回頭看）：官網還看得到就重讀，換屆看不到了就沿用上一次存的。
// 用法：node tools/festival.mjs <輸出檔> [上一次的 festival.json]
//       也可以 import { parseGoldenHorseDay, goldenHorseDates } 單獨測解析
import fs from "node:fs";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const unescape = (s) => String(s || "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
const clean = (s) => unescape(String(s || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const pad = (d) => d.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/, (_, y, m, x) => `${y}-${m.padStart(2, "0")}-${x.padStart(2, "0")}`);

const GH = "https://www.goldenhorse.org.tw/film/programme/schedule/";
/** 場次頁上日期選單可選的日期（= 這一屆影展的每一天），YYYY-MM-DD */
export function goldenHorseDates(html) {
  const m = html.match(/var availableDates\s*=\s*\[([^\]]*)\]/);
  return m ? Array.from(m[1].matchAll(/"(\d{4}-\d{1,2}-\d{1,2})"/g)).map((x) => pad(x[1])).sort() : [];
}
/** 這一頁實際顯示的是哪一天 */
export const goldenHorsePageDate = (html) => pad((html.match(/id='search_date' value='(\d{4}-\d{1,2}-\d{1,2})'/) || [])[1] || "");
/** 一天的場次表 → [{ venue, room, time, filmId, title, mins, rating, ticket, url, notes }] */
export function parseGoldenHorseDay(html) {
  const out = [];
  const seen = new Set();
  const start = html.indexOf("show-list");
  if (start < 0) return out;
  let venue = "", room = "";
  for (const m of html.slice(start).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const row = m[1];
    const th = row.match(/<th[^>]*>([\s\S]*?)<\/th>/);
    if (th) { venue = clean(th[1]); continue; }
    const rm = row.match(/class='room'[^>]*>\s*<span>([\s\S]*?)(?:<br|<img|<\/span>)/);
    if (rm) room = clean(rm[1]);
    const time = (row.match(/class='time'[^>]*>\s*(\d{1,2}:\d{2})/) || [])[1];
    const film = row.match(/href="(https:\/\/www\.goldenhorse\.org\.tw\/film\/programme\/films\/detail\/(\d+)[^"]*)"[^>]*>([^<]+)<\/a>/);
    if (!time || !film) continue;
    const mins = Number((row.match(/(\d+)\s*分/) || [])[1] || 0);
    const rating = clean((row.match(/class='txt_rating_\w+'>([^<]*)</) || [])[1]);
    const ticket = (row.match(/href='(https:\/\/[^']*tixcraft\.com\/[^']+)'/) || [])[1] || "";
    const key = [venue, room, time, film[2]].join("|");
    if (seen.has(key)) continue; // 列表檢視和時間軸檢視各列一次
    seen.add(key);
    out.push({ venue, room, time: time.padStart(5, "0"), filmId: film[2], title: clean(film[3]), mins, rating, ticket, url: unescape(film[1]) });
  }
  return out;
}
/** 影展名稱：官網是「金馬影展」這個大網站，各影展（金馬影展、奇幻影展、經典影展）輪流用同一個場次頁。
 *  影片連結上的分類代碼最可靠；沒有就看月份 */
export function goldenHorseName(html, firstDate) {
  const code = (html.match(/search_category=([A-Z]+)/) || [])[1] || "";
  const month = Number((firstDate || "").slice(5, 7));
  if (/FFF|FANT/i.test(code) || (month >= 3 && month <= 5)) return { id: "ghfff", name: "金馬奇幻影展" };
  if (code === "FF" || (month >= 10 && month <= 12)) return { id: "ghff", name: "台北金馬影展" };
  return { id: "gh", name: "金馬影展" };
}

async function get(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}
const todayTPE = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);

/** 讀整個金馬影展的場次（官網目前顯示的那一屆，演過的也讀）；沒有場次表回傳 null */
async function goldenHorse() {
  const first = await get(GH);
  const dates = goldenHorseDates(first);
  if (!dates.length) return null;
  const { id, name } = goldenHorseName(first, dates[0]);
  const films = {};
  const sessions = [];
  const shown = goldenHorsePageDate(first);
  for (const date of dates) {
    let html = date === shown ? first : "";
    if (!html) {
      await new Promise((r) => setTimeout(r, 800)); // 一天一頁，慢慢讀
      html = await get(`${GH}?search_date=${date}`).catch(() => "");
    }
    if (!html || goldenHorsePageDate(html) !== date) continue; // 讀不到，或被導回別的日期
    for (const s of parseGoldenHorseDay(html)) {
      films[s.filmId] ||= { id: s.filmId, title: s.title, mins: s.mins, rating: s.rating, url: s.url };
      sessions.push({ film: s.filmId, date, time: s.time, venue: s.venue, room: s.room, ticket: s.ticket });
    }
  }
  if (!sessions.length) return null;
  return { id: `${id}-${dates[0].slice(0, 4)}`, name, start: dates[0], end: dates[dates.length - 1], site: GH, source: "金馬影展官網", ticketing: "拓元售票", films: Object.values(films), sessions };
}

// ── 台北電影節 ──
const TFF = "https://www.taipeiff.taipei/tw/movies/schedule";
/** 場地文字拆成場地與影廳：「誠品電影院A廳」→ 誠品電影院、A廳；「臺北市中山堂」→ 整個是場地 */
export function splitVenue(text) {
  const t = clean(text);
  const m = t.match(/^(.+?)([A-Za-z0-9一二三四五六七八九十]+廳)$/);
  return m ? { venue: m[1].trim(), room: m[2] } : { venue: t, room: "" };
}
/** 場次頁回傳的某一天資料（網頁自己用的 JSON）→ 影片與場次 */
export function parseTffDay(json) {
  const films = {};
  const sessions = [];
  const rows = (json && json.status === "success" && Array.isArray(json.msg) ? json.msg : []);
  const mins = (a, b) => { const t = (x) => Number(x.slice(0, 2)) * 60 + Number(x.slice(3, 5)); if (!/^\d\d:\d\d/.test(a || "") || !/^\d\d:\d\d/.test(b || "")) return 0; let d = t(b) - t(a); if (d < 0) d += 1440; return d; };
  for (const x of rows) {
    const id = String(x.group || x.film?.gid || "");
    if (!id || !x.startdate || !/^\d{1,2}:\d{2}/.test(x.starttime || "")) continue;
    const opt = x.film && typeof x.film.options === "object" ? x.film.options : {};
    const poster = x.film?.filename?.url || "";
    films[id] ||= { id, title: clean(x.title), mins: mins(x.starttime, x.offtime), rating: clean(x.level_obj?.text), url: x.film_url || TFF, ...(/^https:\/\//.test(poster) ? { poster } : {}) };
    const { venue, room } = splitVenue(x.areaTxt);
    sessions.push({ film: id, date: x.startdate, time: x.starttime.slice(0, 5).padStart(5, "0"), venue, room, ticket: /^https:\/\//.test(opt.link || "") ? opt.link : "" });
  }
  return { films, sessions };
}
/** 讀整個台北電影節的場次（官網目前顯示的那一屆）；沒有場次表回傳 null。
 *  跟一般訪客的瀏覽器一樣：先開公開的場次頁，再用頁面上附的表單代碼逐日要資料，不需要登入 */
async function taipeiFilmFestival() {
  const page = await fetch(TFF, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" }, signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`${page.status} ${TFF}`);
  const html = await page.text();
  const cookie = (page.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  const form = html.match(/'jobType': 'getMyFilm_1',\s*'date': dateStr,\s*"([0-9a-f]{32})": "([0-9a-f]+)"/);
  const start = (html.match(/const fd = '(\d{4}-\d{2}-\d{2})'/) || [])[1];
  const end = (html.match(/maxDate: new Date\('(\d{4}-\d{2}-\d{2})'\)/) || [])[1];
  if (!form || !start || !end || end < start) return null;
  const films = {};
  const sessions = [];
  for (let d = start, n = 0; d <= end && n < 40; d = new Date(Date.parse(d + "T00:00:00Z") + 86400e3).toISOString().slice(0, 10), n++) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const r = await fetch("https://www.taipeiff.taipei/movies/schedule", {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", Accept: "application/json, text/plain, */*", Referer: TFF, Cookie: cookie },
        body: JSON.stringify({ jobType: "getMyFilm_1", date: d, [form[1]]: form[2] }),
        signal: AbortSignal.timeout(30000),
      });
      const day = parseTffDay(await r.json());
      Object.assign(films, { ...day.films, ...films });
      sessions.push(...day.sessions.filter((x) => x.date === d));
    } catch (_) {} // 這一天讀不到就略過
  }
  if (!sessions.length) return null;
  const dates = sessions.map((x) => x.date).sort();
  return { id: `tff-${dates[0].slice(0, 4)}`, name: "台北電影節", start: dates[0], end: dates[dates.length - 1], site: TFF, source: "台北電影節官網", ticketing: "OPENTIX", films: Object.values(films), sessions };
}

// ── 高雄電影節 ──
const KFF = "https://www.kff.tw/schedule";
/** 場次頁回傳的某一天資料（網頁自己用的 JSON）→ 影片與場次。節目（program）是放映的單位：可能是一部長片，也可能是幾部短片的組合 */
export function parseKffDay(json) {
  const films = {};
  const sessions = [];
  const days = json && typeof json === "object" ? Object.values(json).flat() : [];
  for (const day of days) {
    for (const c of (day && day.cinemas) || []) {
      for (const a of c.auditoriums || []) {
        for (const p of a.programs || []) {
          const b = p.belong_program || {};
          const id = String(b.id || p.belong || "");
          if (!id || !p.date || !/^\d{1,2}:\d{2}/.test(p.start_time || "")) continue;
          const first = Array.isArray(b.film_row) ? b.film_row[0] : null;
          const img = first && typeof first.share_image === "string" && first.share_image.startsWith("/") ? "https://www.kff.tw" + encodeURI(first.share_image) : "";
          const lvl = b.rating_level || {};
          films[id] ||= { id, title: clean(b.title), mins: Number(b.time_length) || 0, rating: clean(lvl.txt) + (lvl.year && lvl.year !== "0" ? lvl.year + "+" : ""), url: KFF, ...(img ? { poster: img } : {}) };
          sessions.push({ film: id, date: p.date, time: p.start_time.slice(0, 5).padStart(5, "0"), venue: clean(c.title), room: clean(a.title), ticket: /^https:\/\//.test(b.link || "") ? b.link : "" });
        }
      }
    }
  }
  return { films, sessions };
}
/** 讀整個高雄電影節的場次（官網目前顯示的那一屆）；沒有場次表回傳 null。
 *  跟一般訪客的瀏覽器一樣：先開公開的場次頁，再用頁面上附的表單代碼逐日要資料，不需要登入 */
async function kaohsiungFilmFestival() {
  const home = await get("https://www.kff.tw/");
  const dates = Array.from(new Set(Array.from(home.matchAll(/<option value="(\d{4}-\d{2}-\d{2})"/g)).map((m) => m[1]))).sort();
  if (!dates.length) return null;
  const page = await fetch(KFF, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" }, signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`${page.status} ${KFF}`);
  const html = await page.text();
  const cookie = (page.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  const form = (html.match(/<meta name="csrf-token" content="([^"]+)"/) || [])[1];
  if (!form) return null;
  const films = {};
  const sessions = [];
  for (const d of dates.slice(0, 40)) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const r = await fetch("https://www.kff.tw/schedule/ajax", {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": form, Accept: "application/json, text/javascript, */*", Referer: KFF, Cookie: cookie },
        body: new URLSearchParams({ select_cate: "108", datepicker_date: d }).toString(), // 108 = 長短片（另一類是 XR 體驗，不是放映場次）
        signal: AbortSignal.timeout(30000),
      });
      const day = parseKffDay(await r.json());
      Object.assign(films, { ...day.films, ...films });
      sessions.push(...day.sessions.filter((x) => x.date === d));
    } catch (_) {} // 這一天讀不到就略過
  }
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  return { id: `kff-${got[0].slice(0, 4)}`, name: "高雄電影節", start: got[0], end: got[got.length - 1], site: KFF, source: "高雄電影節官網", ticketing: "OPENTIX", films: Object.values(films), sessions };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [outPath = "festival.json", prevPath = ""] = process.argv.slice(2);
  let prev = [];
  try {
    prev = JSON.parse(fs.readFileSync(prevPath, "utf8")).festivals || [];
  } catch (_) {}
  const got = [];
  for (const [label, job] of [["金馬影展官網", goldenHorse], ["台北電影節官網", taipeiFilmFestival], ["高雄電影節官網", kaohsiungFilmFestival]]) {
    try {
      const f = await job();
      if (f) { got.push(f); console.log(`${label}：${f.name} ${f.start}～${f.end}，${f.films.length} 部、${f.sessions.length} 場`); }
      else console.log(`${label}：官網目前沒有場次表`);
    } catch (e) {
      console.log(`${label}：讀取失敗（${String(e.message || e)}），這次略過`);
    }
  }
  // 這次讀到的蓋掉舊的；沒讀到的（官網換屆了、或暫時讀不到）沿用上一次存的。
  // 只留「今年」的影展（結束日在今年），跨年後舊的自動清掉
  const year = todayTPE().slice(0, 4);
  const byId = new Map();
  for (const f of prev) if (f && /-\d{4}$/.test(f.id || "") && Array.isArray(f.sessions)) byId.set(f.id, f); // 代碼要帶年份（舊格式的不留）
  for (const f of got) {
    const old = byId.get(f.id);
    // 這次讀到的場次比上次少很多（官網正在改、只讀到一部分）：不要蓋掉比較完整的舊資料
    if (old && f.sessions.length < old.sessions.length * 0.6) { console.log(`${f.name}：這次只讀到 ${f.sessions.length} 場，比上次的 ${old.sessions.length} 場少很多，沿用上次的`); continue; }
    byId.set(f.id, f);
  }
  const festivals = Array.from(byId.values()).filter((f) => String(f.end || "").slice(0, 4) === year).sort((a, b) => b.start.localeCompare(a.start));
  fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), festivals }) + "\n");
  console.log(`已寫出 ${festivals.length} 個影展（${festivals.map((f) => f.name + " " + f.start.slice(0, 4)).join("、") || "無"}）；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
}
