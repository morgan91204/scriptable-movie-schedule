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

/** 介紹文字：去掉標籤、整理空白，太長的截到 420 字（存檔才不會太大） */
export const blurb = (html) => { const t = clean(String(html || "").replace(/<br\s*\/?>(\s*<br\s*\/?>)*/gi, " ")); return t.length > 420 ? t.slice(0, 419) + "…" : t; };
/** 頁面上第一段夠長的中文內文（影片介紹頁的劇情簡介） */
export const firstParagraph = (html) => {
  const body = String(html).replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  for (const m of body.matchAll(/>([^<]{80,})</g)) { const t = clean(m[1]); if ((t.match(/[\u4e00-\u9fff]/g) || []).length >= 50) return blurb(t); }
  return "";
};
/** 頁面上嵌的 YouTube 影片（官網放的預告）→ 觀看網址；頻道連結不算 */
export const youtubeIn = (html) => { const m = String(html).match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})(?![\w-])/); return m ? `https://www.youtube.com/watch?v=${m[1]}` : ""; };
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
/** 上一次存的劇照與預告（影展代碼 → 影片代碼 → { poster, trailer }）：已經查過的片不用每次重讀官網的影片頁 */
const KNOWN_STILLS = {};
/** 金馬影片介紹頁上的劇照（小張的） */
export const goldenHorseStill = (html) => (String(html).match(/https:\/\/storage\.googleapis\.com\/tghff_outland\/image\/photo\/[^"'\s)]+\.(?:jpe?g|png|webp)/i) || [])[0] || "";
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
  // 劇照在每部片自己的介紹頁：查過的沿用，沒查過的一次最多讀 200 部（慢慢讀）
  const known = KNOWN_STILLS[`${id}-${dates[0].slice(0, 4)}`] || {};
  let asked = 0;
  for (const f of Object.values(films)) {
    const k = known[f.id];
    if (k && k.poster && k.trailer !== undefined && k.intro !== undefined) { f.poster = k.poster; f.trailer = k.trailer; f.intro = k.intro; continue; } // 查過沒有的會存成空字串
    if (asked >= 200) continue;
    asked++;
    await new Promise((r) => setTimeout(r, 400));
    const page = await get(f.url).catch(() => "");
    const img = goldenHorseStill(page) || (k && k.poster) || "";
    if (img) f.poster = img;
    if (page) { f.trailer = youtubeIn(page); f.intro = firstParagraph(page); }
  }
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
    const crew = (Array.isArray(opt.crew) ? opt.crew : []).filter((c) => /^(導演|主演|演員)$/.test(clean(c.title))).map((c) => `${clean(c.title)}：${String(c.subtitle || "").split(/<br\s*\/?>/i).map(clean).filter(Boolean).slice(0, 8).join("、")}`).join("\n");
    films[id] ||= { id, title: clean(x.title), mins: mins(x.starttime, x.offtime), rating: clean(x.level_obj?.text), url: x.film_url || TFF, ...(/^https:\/\//.test(poster) ? { poster } : {}), ...(crew ? { credits: crew } : {}) };
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
          const dirs = ((first && Array.isArray(first.team_row) ? first.team_row : []).filter((t) => clean(t.title) === "導演").map((t) => clean(t.name)).filter(Boolean)).slice(0, 4).join("、");
          films[id] ||= { id, title: clean(b.title), mins: Number(b.time_length) || 0, rating: clean(lvl.txt) + (lvl.year && lvl.year !== "0" ? lvl.year + "+" : ""), url: KFF, ...(img ? { poster: img } : {}), ...(first && /^[\w-]{11}$/.test(first.trailer_id || "") ? { trailer: `https://www.youtube.com/watch?v=${first.trailer_id}` } : {}), ...(first && first.content ? { intro: blurb(first.content) } : {}), ...(dirs && Array.isArray(b.film_row) && b.film_row.length === 1 ? { credits: `導演：${dirs}` } : {}) };
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

const SOUTH = "https://festival.south.org.tw/";

/** 南方影展的場次頁：整份場次表直接寫在頁面的程式裡（schedules=[…]）→ 影片與場次。
 *  一場可能是一部長片，也可能是一個短片單元（films 列出單元裡的片） */
export function parseSouthPage(html, url = SOUTH) {
  const films = {};
  const sessions = [];
  const units = {}; // 短片單元 → 裡面的片名
  const m = String(html).match(/schedules\s*=\s*(\[\s*\{[\s\S]*?\}\s*,?\s*\])\s*;/);
  let rows = [];
  try { rows = JSON.parse(m[1].replace(/,(\s*[\]}])/g, "$1")); } catch (_) {}
  const venue = clean((String(html).match(/([\u4e00-\u9fff]{2,12}(?:影城|戲院|電影館))場次表/) || [])[1] || "");
  const buy = (String(html).match(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*>(?:\s*<[^>]+>)*\s*買票點選這裡/) || [])[1] || "";
  for (const x of Array.isArray(rows) ? rows : []) {
    const title = clean(x && x.title);
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(x.date || "") || !/^\d{1,2}:\d{2}$/.test(x.time || "")) continue;
    films[title] ||= { id: title, title, mins: Number(x.duration) || 0, rating: "", url };
    if (Array.isArray(x.films) && x.films.length) units[title] = x.films.map((t) => clean(t).replace(/\s*\d+\s*min$/i, ""));
    sessions.push({ film: title, date: x.date, time: x.time.padStart(5, "0"), venue, room: clean(x.space), ticket: buy });
  }
  return { films, sessions, units };
}
/** 南方影展各單元的片單頁：每部片一張劇照、片名、介紹頁 → [{ title, img, url }] */
export function parseSouthStills(html) {
  return Array.from(String(html).matchAll(/<a href="(https:\/\/festival\.south\.org\.tw\/film\/[^"]+)"[^>]*>\s*<img[^>]+src="(https:\/\/[^"]+)"[\s\S]{0,600}?<a href="\1"[^>]*>([^<]+)<\/a>/g))
    .map((m) => ({ url: m[1], img: encodeURI(decodeURI(m[2])), title: clean(m[3]), by: clean((String(html).slice(m.index + m[0].length, m.index + m[0].length + 400).match(/class="ue_post_blocks_text">([^<｜|]*)/) || [])[1]) }));
}
/** 場次表上的片名（或短片單元裡的片名）對到片單頁的劇照：片單頁的片名後面常接英文，所以比「開頭相同」 */
export function southStillFor(stills, title, unit = []) {
  const norm = (t) => String(t).replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, "").toLowerCase();
  const find = (t) => { const k = norm(t); return k.length >= 2 ? stills.find((x) => norm(x.title) === k) || stills.find((x) => norm(x.title).startsWith(k)) : null; };
  let hit = find(title);
  for (const t of unit) { if (hit) break; hit = find(t); }
  return hit || null;
}
/** 讀南方影展的場次：從官網首頁找今年的場次頁（網址每年帶年份），沒有或格式變了回傳 null */
async function southFilmFestival() {
  const home = await get(SOUTH);
  const year = todayTPE().slice(0, 4);
  const url = (home.match(new RegExp(`href="(https://festival\\.south\\.org\\.tw/[^"#?]*schedule${year}/?)"`)) || [])[1];
  if (!url) return null;
  const page = await get(url);
  const { films, sessions, units } = parseSouthPage(page, url);
  if (!sessions.length) return null;
  // 劇照在各單元的片單頁（場次頁選單上帶今年年份的那些頁）
  const pages = Array.from(new Set(Array.from(page.matchAll(new RegExp(`href="(https://festival\\.south\\.org\\.tw/anniversary/[^"#?]*${year}[^"#?]*)"`, "g"))).map((m) => m[1].replace(/\/$/, ""))))
    .filter((u) => !/schedule|ticket|nomination/.test(u)).slice(0, 24);
  const stills = [];
  for (const u of pages) {
    await new Promise((r) => setTimeout(r, 500));
    stills.push(...parseSouthStills(await get(u).catch(() => "")));
  }
  for (const f of Object.values(films)) {
    const hit = southStillFor(stills, f.title, units[f.id]);
    if (hit) { f.poster = hit.img; if (!units[f.id]) { f.url = hit.url; if (hit.by) f.credits = `導演：${hit.by}`; } }
  }
  const got = sessions.map((x) => x.date).sort();
  return { id: `stff-${got[0].slice(0, 4)}`, name: "南方影展", start: got[0], end: got[got.length - 1], site: url, source: "南方影展官網", films: Object.values(films), sessions };
}

const TIDF = "https://www.tidf.org.tw/zh-hant/shows/schedule";

/** 台灣國際紀錄片影展的總場次表（整頁一次給完，含時間軸與清單兩種排法，這裡讀時間軸那一份：有起訖時間）→ 影片與場次 */
export function parseTidfPage(html) {
  const films = {};
  const sessions = [];
  const h = String(html);
  const days = Array.from(new Set(Array.from(h.matchAll(/<option value="(\d{4}-\d{2}-\d{2})"/g)).map((m) => m[1]))); // 有場次的日期（帶年份）
  const t24 = (x) => { const m = String(x).match(/(\d{1,2}):(\d{2})\s*([ap])m/i); if (!m) return -1; return ((Number(m[1]) % 12) + (m[3].toLowerCase() === "p" ? 12 : 0)) * 60 + Number(m[2]); };
  for (const block of h.split(/<div class="schedule-container schedule-type-timeline">/).slice(1)) {
    const body = block.split(/<div class="schedule-container schedule-type-table">/)[0];
    const md = body.match(/<h2 class="schedule-day-title">\s*(\d{1,2})<span[^>]*>\/<\/span>(\d{1,2})/);
    if (!md) continue;
    const date = days.find((d) => d.slice(5) === `${md[1].padStart(2, "0")}-${md[2].padStart(2, "0")}`);
    if (!date) continue;
    for (const loc of body.split(/<div class="tl_location">/).slice(1)) {
      const venue = clean((loc.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1]);
      const range = {}; // 節目編號 → 片長（分）
      for (const m of loc.matchAll(/class="tl_event tl_event_film"[^>]*data-event="(\d+)"[\s\S]*?<div class="tl-schedule-time">([^<]+)<\/div>/g)) {
        const [a, b] = m[2].split(/\s+-\s+/).map(t24);
        if (a >= 0 && b >= 0) range[m[1]] = (b - a + 1440) % 1440;
      }
      for (const part of loc.split(/<div class="tl_event_details /).slice(1)) {
        const start = (part.match(/data-start="(\d{1,2}:\d{2})"/) || [])[1];
        const ev = (part.match(/data-event="(\d+)"/) || [])[1] || "";
        const title = clean((part.match(/<h4 class="tl-film-name-ch">([\s\S]*?)<\/h4>/) || [])[1]);
        const more = (part.match(/class="tl-link-more" href="(\/[^"]+)"/) || [])[1] || "";
        const id = (more.match(/node\/(\d+)/) || [])[1] || title;
        if (!start || !title) continue;
        const yt = (part.match(/img\.youtube\.com\/vi\/([\w-]{6,})\//) || [])[1];
        const ticket = (part.match(/class="tl-ticket-link[^"]*" href="(https:\/\/[^"]+)"/) || [])[1] || "";
        films[id] ||= { id, title, mins: range[ev] || 0, rating: clean((part.match(/class="tl-film-level[^"]*"[^>]*>([^<]*)</) || [])[1]), url: more ? "https://www.tidf.org.tw" + more.replace(/&amp;/g, "&").replace(/[?&]schedule_id=\d+/, "") : TIDF, ...(yt ? { poster: `https://img.youtube.com/vi/${yt}/mqdefault.jpg`, trailer: `https://www.youtube.com/watch?v=${yt}` } : {}), intro: blurb((part.match(/<p class="tl-film-description">([\s\S]*?)<\/p>/) || [])[1]) };
        sessions.push({ film: id, date, time: start.padStart(5, "0"), venue, room: "", ticket: ticket.replace(/&amp;/g, "&") });
      }
    }
  }
  return { films, sessions };
}
/** 讀台灣國際紀錄片影展官網目前的總場次表。影展本身兩年一次在 5 月；下半年官網放的是巡迴展，分開算一個 */
async function tidf() {
  const { films, sessions } = parseTidfPage(await get(TIDF));
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  const tour = Number(got[0].slice(5, 7)) >= 7;
  return { id: `${tour ? "tidftour" : "tidf"}-${got[0].slice(0, 4)}`, name: tour ? "TIDF 巡迴展" : "台灣國際紀錄片影展", start: got[0], end: got[got.length - 1], site: TIDF, source: "台灣國際紀錄片影展官網", films: Object.values(films), sessions };
}

const TIQFF = "https://tiqff.org.tw/Festival.aspx?ID=1574"; // 「本屆影展」底下的場次表

/** 臺灣國際酷兒影展場次表的內容（一張表：片名、日期、時間、地點；官網沒有給片長和結束時間）→ 影片與場次 */
export function parseTiqffTable(html) {
  const films = {};
  const sessions = [];
  const used = {}; // 圖片編號出現幾次：很多片共用的那張是預設圖，不算
  for (const m of String(html).matchAll(/ImId=(\d+)/g)) used[m[1]] = (used[m[1]] || 0) + 1;
  for (const row of String(html).split(/<tr[\s>]/).slice(1)) {
    const cell = (cls) => clean((row.match(new RegExp(`<td class="${cls}"[^>]*>([\\s\\S]*?)</td>`)) || [])[1]);
    const title = clean(((row.match(/<td class="itemname"[^>]*>([\s\S]*?)<\/td>/) || [])[1] || "").split(/<!--|<div/)[0]);
    const date = cell("date");
    const time = cell("time");
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}$/.test(time)) continue;
    const img = (row.match(/ImId=(\d+)/) || [])[1] || "";
    const about = blurb(((row.match(/簡述：([\s\S]*?)<\/p>/) || [])[1] || "").split(/<br[^>]*>\s*<br[^>]*>\s*(?:<div>)?\s*[A-Za-z]/)[0]); // 只留中文那一段
    films[title] ||= { id: title, title, mins: 0, rating: "", url: TIQFF, ...(about ? { intro: about } : {}), ...(img && used[img] <= 4 ? { poster: `https://tiqff.org.tw/admin/ImageHandler.ashx?ImId=${img}&t=filelist&c=fileimage` } : {}) };
    sessions.push({ film: title, date, time: time.padStart(5, "0"), venue: cell("place"), room: "", ticket: "" });
  }
  return { films, sessions };
}
/** 讀臺灣國際酷兒影展的場次（官網「本屆影展」目前放的那一屆）。
 *  跟一般訪客的瀏覽器一樣：先開公開的場次頁，再用頁面上附的代碼要表格內容，不需要登入 */
async function queerFilmFestival() {
  const page = await fetch(TIQFF, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" }, signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`${page.status} ${TIQFF}`);
  const html = await page.text();
  const cookie = (page.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  const hid = (name) => (html.match(new RegExp(`id="ContentPlaceHolder1_${name}" value="([^"]*)"`)) || [])[1] || "";
  if (!hid("hfGUID") || !hid("hfEnumAgnKey")) return null;
  await new Promise((r) => setTimeout(r, 800));
  const r = await fetch("https://tiqff.org.tw/Festival.aspx/LoadToyBrick_HTML", {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/json; charset=utf-8", "X-Requested-With": "XMLHttpRequest", Accept: "application/json, text/javascript, */*", Referer: TIQFF, Cookie: cookie },
    body: JSON.stringify({ guid: hid("hfGUID"), strID: hid("hfProgramID"), strSubID: hid("hfID"), strType: hid("hfProgramTitle"), strMediaType: hid("hfMediaType"), strKeyword: hid("hfKeyword"), inputArgs: JSON.stringify([{ FieldType: "QParameter", FieldName: "FestivalID", FieldValue: hid("hfEnumAgnKey"), Comparison: "=" }]), strPageID: hid("hfPage") || "1" }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await r.json();
  const { films, sessions } = parseTiqffTable((data && data.d && Array.isArray(data.d.data) && data.d.data[0]) || "");
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  return { id: `tiqff-${got[0].slice(0, 4)}`, name: "臺灣國際酷兒影展", start: got[0], end: got[got.length - 1], site: TIQFF, source: "臺灣國際酷兒影展官網", films: Object.values(films), sessions };
}

const TYFF = "https://tyff.taoyuancf.org.tw/filmsearch";

/** 桃園電影節「場次日曆」的一頁（每一格是一場：片名、分級、場地、日期時間、片長、劇照、購票連結）→ 影片與場次 */
export function parseTyffPage(html) {
  const films = {};
  const sessions = [];
  for (const box of String(html).split(/<div class="filmbox">/).slice(1)) {
    const pick = (cls) => clean((box.match(new RegExp(`class="filmbox__${cls}[^"]*"[^>]*>([\\s\\S]*?)</(?:div|h2)>`)) || [])[1]);
    const title = pick("title");
    const when = pick("date").match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})/);
    if (!title || !when) continue;
    const links = Array.from(box.matchAll(/<a href="(https:\/\/[^"]+)" class="filmbox__link">([^<]*)</g));
    const url = (links.find((l) => /\/film\//.test(l[1])) || [])[1] || TYFF;
    const ticket = (links.find((l) => /購票/.test(l[2])) || [])[1] || "";
    const id = (url.match(/\/film\/([^/?#]+)/) || [])[1] || title;
    const img = (box.match(/class="filmbox__pic">\s*<img src="(https:\/\/[^"]+)"/) || [])[1] || "";
    const place = pick("location").replace(/\s*[★◆●■▲☆◎][\s\S]*$/, "").trim(); // 後面的「★ 影人出席」「◆ 免費入場」是備註
    const m = place.match(/^(.+?)\s+(\S+)\s*廳$/);
    const spot = m && /^[A-Za-z0-9]+$/.test(m[2]) ? { venue: m[1], room: m[2] } : m ? { venue: m[1], room: m[2] + "廳" } : { venue: place, room: "" };
    films[id] ||= { id, title, mins: Number((pick("length").match(/(\d+)\s*min/i) || [])[1]) || 0, rating: pick("rating"), url, ...(img ? { poster: encodeURI(decodeURI(img)) } : {}) };
    sessions.push({ film: id, date: when[1], time: when[2].padStart(5, "0"), ...spot, ticket });
  }
  return { films, sessions };
}
/** 讀桃園電影節的場次日曆（官網目前放的那一屆；一頁一頁往下翻） */
async function taoyuanFilmFestival() {
  const first = await get(TYFF);
  const pages = Math.min(40, Math.max(1, ...Array.from(first.matchAll(/filmsearch\?page=(\d+)/g)).map((m) => Number(m[1]))));
  const films = {};
  const sessions = [];
  for (let p = 1; p <= pages; p++) {
    let html = first;
    if (p > 1) {
      await new Promise((r) => setTimeout(r, 600));
      try { html = await get(`${TYFF}?page=${p}`); } catch (_) { continue; }
    }
    const day = parseTyffPage(html);
    Object.assign(films, { ...day.films, ...films });
    sessions.push(...day.sessions);
  }
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  return { id: `tyff-${got[0].slice(0, 4)}`, name: "桃園電影節", start: got[0], end: got[got.length - 1], site: TYFF, source: "桃園電影節官網", films: Object.values(films), sessions };
}

const WMW = "https://www.wmw.org.tw/tw/category/9";

/** 台灣國際女性影展「場次資訊」頁：十天的場次都寫在頁面的程式裡（events=[…]），
 *  start 是「早上 8 點起算的分鐘數」（官網自己的月曆程式就是這樣畫的），times 是片長 → 影片與場次。
 *  一場可能是一部片，也可能是幾部短片合成的一個節目（有自訂的節目名稱） */
export function parseWmwPage(html, year) {
  const films = {};
  const sessions = [];
  const h = String(html);
  let rows = [];
  try { rows = JSON.parse((h.match(/var events\s*=\s*(\[[\s\S]*?\]);/) || [])[1]); } catch (_) {}
  // 場地：每一天的表頭依序列出廳名，對到下面依序的 site 代碼
  const names = Array.from(((h.match(/<div class="day-event-title">([\s\S]*?)<\/div>/) || [])[1] || "").matchAll(/<span>([^<]*)<\/span>/g)).map((m) => clean(m[1]));
  const codes = Array.from(new Set(Array.from(((h.match(/<article class="day-calendar-wrap">([\s\S]*?)<\/article>/) || [])[1] || "").matchAll(/day-events (site\d+)/g)).map((m) => m[1])));
  const y = Number(year) || Math.max(0, ...Array.from(h.matchAll(/>\s*(20\d\d)\s*<\/a>/g)).map((m) => Number(m[1]))) + 1; // 「歷屆影展」選單最新的一年 + 1 = 這一屆
  for (const x of Array.isArray(rows) ? rows : []) {
    const md = String(x.date || "").match(/^(\d{1,2})\/(\d{1,2})$/);
    const start = Number(x.start);
    if (!md || !Number.isFinite(start) || x.state === false || y < 2000) continue;
    const list = Array.from(String(x.film || "").matchAll(/<a href="(https:\/\/[^"]+\/film\/(\d+))"[^>]*>([^<]*)<\/a>/g)).map((m) => ({ url: m[1], id: m[2], title: clean(m[3]) }));
    const custom = clean(x.custom_title);
    const title = custom || (list[0] && list[0].title) || "";
    if (!title) continue;
    const id = custom ? "p-" + list.map((f) => f.id).join("-") : list[0].id;
    const t = 8 * 60 + start;
    films[id] ||= { id, title, mins: Number(x.times) || 0, rating: clean(String(x.info || "").split("|")[0]), url: !custom && list[0] ? list[0].url : WMW, ...(list[0] ? { page: list[0].url } : {}) };
    sessions.push({ film: id, date: `${y}-${md[1].padStart(2, "0")}-${md[2].padStart(2, "0")}`, time: `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`, ...splitVenue(names[codes.indexOf(x.site)] || ""), ticket: "" });
  }
  return { films, sessions };
}
/** 女性影展影片介紹頁上的劇照 */
export const wmwStill = (html) => (String(html).match(/https:\/\/www\.wmw\.org\.tw\/public\/files\/stills\/[^"')\s]+\.(?:jpe?g|png|webp)/i) || [])[0] || "";
/** 讀台灣國際女性影展的場次（官網目前放的那一屆） */
async function womenMakeWaves() {
  const { films, sessions } = parseWmwPage(await get(WMW));
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  const id = `wmw-${got[0].slice(0, 4)}`;
  const known = KNOWN_STILLS[id] || {};
  for (const f of Object.values(films)) {
    const page = f.page;
    delete f.page;
    const k = known[f.id];
    if (k && k.poster && k.trailer !== undefined && k.intro !== undefined && (k.credits || f.id.startsWith("p-"))) { f.poster = k.poster; f.trailer = k.trailer; f.intro = k.intro; if (k.credits) f.credits = k.credits; continue; }
    if (!page) continue;
    await new Promise((r) => setTimeout(r, 400));
    const html = await get(page).catch(() => "");
    const img = wmwStill(html) || (k && k.poster) || "";
    if (img) f.poster = img;
    const dir = clean((html.match(/<h2>[^<]*<\/h2>\s*<span class="sep_line">([\s\S]*?)<\/span>/) || [])[1]);
    if (dir && !f.id.startsWith("p-")) f.credits = `導演：${dir}`; // 短片合輯不標（只會是第一部的導演）
    if (html) { f.trailer = youtubeIn(html); f.intro = blurb((html.match(/<div class="film-intro-text">([\s\S]*?)<\/div>/) || [])[1]); }
  }
  return { id, name: "台灣國際女性影展", start: got[0], end: got[got.length - 1], site: WMW, source: "台灣國際女性影展官網", films: Object.values(films), sessions };
}

const TICFF = "https://www.ticff.org.tw";

/** 台灣國際兒童影展的場次表（一格一場：日期、場地、起訖時間、節目名稱、片長與適合年齡）→ 影片與場次 */
export function parseTicffPage(html, year, url = TICFF) {
  const films = {};
  const sessions = [];
  for (const box of String(html).split(/<div class="timebox[^"]*">/).slice(1)) {
    const md = box.match(/<div class="date">\s*(\d{1,2})\/(\d{1,2})/);
    const place = clean((box.match(/<div class="location">([\s\S]*?)<\/div>/) || [])[1]);
    const heads = Array.from(box.split(/<ul[\s>]/)[0].matchAll(/<h6[^>]*>([\s\S]*?)<\/h6>/g)).map((m) => clean(m[1]));
    const time = (heads.find((t) => /^\d{1,2}:\d{2}/.test(t)) || "").match(/^(\d{1,2}:\d{2})\s*[-－–~～]\s*(\d{1,2}:\d{2})?/);
    const name = heads.find((t) => t && !/^\d{1,2}:\d{2}/.test(t)) || "";
    if (!md || !time || !name) continue;
    const title = name.replace(/^(?:觀摩單元|國際競賽|台灣競賽|臺灣競賽|開幕片|閉幕片|特別放映|焦點單元)\s*[-－–]\s*/, "") || name;
    const head = box.split(/<ul[\s>]/)[0];
    const mins = Number((head.match(/(\d+)\s*min/i) || [])[1]) || 0;
    const age = clean((clean(head).match(/Age\s*([^\s｜|]+)/) || [])[1]);
    const first = (box.match(/<a href="([^"#]+)"[^>]*title="[^"]*在本視窗開啟/) || [])[1] || "";
    const m = place.match(/^(.+?)\s*(\d+)\s*廳/);
    films[title] ||= { id: title, title, mins, rating: /^\d/.test(age) ? `${age} 歲` : /[\u4e00-\u9fff]/.test(age) ? age : "", url: first ? new URL(first, TICFF).href : url };
    sessions.push({ film: title, date: `${year}-${md[1].padStart(2, "0")}-${md[2].padStart(2, "0")}`, time: time[1].padStart(5, "0"), venue: m ? m[1] : place, room: m ? m[2] : "", ticket: "" });
  }
  return { films, sessions };
}
/** 兒童影展：台北主場（春天）與高雄場（秋天）各算一個影展；場次頁的網址帶西元年後兩碼 */
const ticffJob = (kind) => async () => {
  const year = todayTPE().slice(0, 4);
  const yy = year.slice(2);
  const url = kind === "ks" ? `${TICFF}/zh_tw/${yy}tiffi_p/tiffischedule${yy}` : `${TICFF}/${yy}schedule`;
  const { films, sessions } = parseTicffPage(await get(url), year, url);
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  return { id: `${kind === "ks" ? "ticffks" : "ticff"}-${year}`, name: kind === "ks" ? "兒童影展 高雄場" : "台灣國際兒童影展", start: got[0], end: got[got.length - 1], site: url, source: "台灣國際兒童影展官網", films: Object.values(films), sessions };
};

/** 臺中國際動畫影展的場次表（依戲院、日期與影廳排的表格）→ 影片與場次 */
export function parseTiafPage(html, year, url) {
  const films = {};
  const sessions = [];
  const seen = new Set();
  for (const block of String(html).split(/<h2 class="theaterName">/).slice(1)) {
    const venue = clean(block.split("</h2>")[0]).replace(/\s+[A-Za-z][\s\S]*$/, ""); // 中文館名後面接的英文名不要
    for (const row of block.split(/<div class="tr">/).slice(1)) {
      const th = row.match(/<div class="date">\s*(\d{1,2})\.(\d{1,2})[^<]*<\/div>\s*([^<]*)</);
      if (!th) continue;
      const room = clean(th[3]).replace(/^(\d+)\s*廳$/, "$1"); // 「2廳」只留數字（畫面會補「廳」），其他廳名原樣
      for (const td of row.split(/<div class="td showTime/).slice(1)) {
        const title = clean((td.match(/<b>([\s\S]*?)<\/b>/) || [])[1]);
        const time = (td.match(/<div class="time">\s*(\d{1,2}:\d{2})/) || [])[1];
        if (!title || !time) continue;
        const date = `${year}-${th[1].padStart(2, "0")}-${th[2].padStart(2, "0")}`;
        const key = [venue, room, date, time, title].join("|");
        if (seen.has(key)) continue; // 同一份表有兩種排法，各列一次
        seen.add(key);
        films[title] ||= { id: title, title, mins: Number((td.match(/class="runtime">\s*(\d+)/) || [])[1]) || 0, rating: "", url };
        sessions.push({ film: title, date, time: time.padStart(5, "0"), venue, room, ticket: "" });
      }
    }
  }
  return { films, sessions };
}
/** 讀臺中國際動畫影展今年的場次表（網址帶年份） */
async function taichungAnimation() {
  const year = todayTPE().slice(0, 4);
  const url = `https://twtiaf.com/${year}/schedule_list.php?cate=0`;
  const { films, sessions } = parseTiafPage(await get(url), year, url);
  if (!sessions.length) return null;
  const got = sessions.map((x) => x.date).sort();
  return { id: `tiaf-${year}`, name: "臺中國際動畫影展", start: got[0], end: got[got.length - 1], site: url, source: "臺中國際動畫影展官網", ticketing: "OPENTIX", films: Object.values(films), sessions };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [outPath = "festival.json", prevPath = ""] = process.argv.slice(2);
  let prev = [];
  let prevYears = [];
  try {
    const old = JSON.parse(fs.readFileSync(prevPath, "utf8"));
    prev = old.festivals || [];
    prevYears = Array.isArray(old.years) ? old.years.filter((y) => Number.isInteger(y)) : [];
  } catch (_) {}
  for (const f of prev) { const m = (KNOWN_STILLS[f.id] = {}); for (const x of f.films || []) if (x.poster) m[x.id] = { poster: x.poster, trailer: x.trailer, intro: x.intro, credits: x.credits }; }
  const got = [];
  for (const [label, job] of [["金馬影展官網", goldenHorse], ["台北電影節官網", taipeiFilmFestival], ["高雄電影節官網", kaohsiungFilmFestival], ["南方影展官網", southFilmFestival], ["紀錄片影展官網", tidf], ["酷兒影展官網", queerFilmFestival], ["桃園電影節官網", taoyuanFilmFestival], ["女性影展官網", womenMakeWaves], ["兒童影展官網", ticffJob("tp")], ["兒童影展高雄場", ticffJob("ks")], ["臺中動畫影展官網", taichungAnimation]]) {
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
  // 每年另外存一份 festival-<年份>.json：今年的每次都重寫；跨年後主檔清掉舊的，這份留著給使用者回顧。
  // 官網還放著往年那一屆的（還沒換屆），補進那一年的存檔：先讀線上現有的存檔，只加新的或變完整的，其他不動
  const archYears = [];
  const base = process.env.FESTIVAL_BASE || "";
  for (const y of Array.from(new Set(got.map((f) => String(f.end).slice(0, 4)))).filter((y) => /^20\d\d$/.test(y) && y < year)) {
    let old = null;
    try {
      if (!base) throw new Error("沒有設定存檔位置");
      const r = await fetch(`${base}/festival-${y}.json?t=${Date.now()}`, { signal: AbortSignal.timeout(30000) });
      if (r.status === 404) old = { festivals: [] };
      else if (r.ok) old = await r.json();
      else throw new Error(String(r.status));
    } catch (e) { console.log(`${y} 年的存檔讀不到（${String(e.message || e)}），這次不動它`); continue; }
    const list = Array.isArray(old.festivals) ? old.festivals : [];
    let changed = false;
    for (const f of got.filter((x) => String(x.end).slice(0, 4) === y)) {
      const i = list.findIndex((x) => x.id === f.id);
      const pics = (x) => (x.films || []).reduce((n, m) => n + (m.poster ? 1 : 0) + (m.intro ? 1 : 0), 0); // 有圖、有介紹的越多越完整
      if (i >= 0 && f.sessions.length <= list[i].sessions.length && !(f.sessions.length === list[i].sessions.length && pics(f) > pics(list[i]))) continue; // 已經有、而且沒有比較完整（場次沒變多、圖也沒變多）
      if (i >= 0) list[i] = f; else list.push(f);
      changed = true;
      console.log(`${f.name} ${y}：補進 ${y} 年的存檔（${f.sessions.length} 場）`);
    }
    if (list.length) archYears.push(Number(y));
    if (changed) fs.writeFileSync(outPath.replace(/\.json$/, `-${y}.json`), JSON.stringify({ updated: Date.now(), festivals: list.sort((a, b) => b.start.localeCompare(a.start)) }) + "\n");
  }
  // years = 有存檔的年份（新的在前），App 用它列出可以選的年份
  const years = Array.from(new Set([...prevYears, ...archYears, ...(festivals.length ? [Number(year)] : [])])).sort((a, b) => b - a);
  fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), years, festivals }) + "\n");
  if (festivals.length) fs.writeFileSync(outPath.replace(/\.json$/, `-${year}.json`), JSON.stringify({ updated: Date.now(), festivals }) + "\n");
  console.log(`已寫出 ${festivals.length} 個影展（${festivals.map((f) => f.name + " " + f.start.slice(0, 4)).join("、") || "無"}）；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
}
