// 影展場次總表：讀影展官網公開的場次表，整理成 festival.json（data 分支），App 看到裡面有還沒演的場次就顯示「影展」分類。
// 目前支援金馬影展官網（台北金馬影展、金馬奇幻影展等共用同一套系統）：只讀公開網頁，購票連結原樣帶出、不讀售票網站。
// 用法：node tools/festival.mjs <輸出檔>      KEEP_PAST=1：影展結束了也照樣輸出（開發、測試用）
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

/** 讀整個金馬影展的場次；沒有場次表（或已經結束）回傳 null */
async function goldenHorse(keepPast) {
  const first = await get(GH);
  const dates = goldenHorseDates(first);
  if (!dates.length) return null;
  const today = todayTPE();
  if (!keepPast && dates[dates.length - 1] < today) return null; // 已經結束
  const { id, name } = goldenHorseName(first, dates[0]);
  const films = {};
  const sessions = [];
  const shown = goldenHorsePageDate(first);
  for (const date of dates) {
    if (!keepPast && date < today) continue; // 演過的不用留
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
  return { id, name, start: dates[0], end: dates[dates.length - 1], site: "https://www.goldenhorse.org.tw/film/programme/schedule/", source: "金馬影展官網", ticketing: "拓元售票", films: Object.values(films), sessions };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outPath = process.argv[2] || "festival.json";
  const keepPast = process.env.KEEP_PAST === "1";
  const festivals = [];
  for (const [label, job] of [["金馬影展官網", goldenHorse]]) {
    try {
      const f = await job(keepPast);
      if (f) { festivals.push(f); console.log(`${label}：${f.name} ${f.start}～${f.end}，${f.films.length} 部、${f.sessions.length} 場`); }
      else console.log(`${label}：目前沒有進行中或即將開始的影展`);
    } catch (e) {
      console.log(`${label}：讀取失敗（${String(e.message || e)}），這次略過`);
    }
  }
  fs.writeFileSync(outPath, JSON.stringify({ updated: Date.now(), festivals }) + "\n");
  console.log(`已寫出 ${festivals.length} 個影展；檔案 ${Math.round(fs.statSync(outPath).size / 1024)}KB`);
}
