// 國賓影城官網的預售場次：場次通只列最近幾天，國賓官網另外有已經開賣的預售日期（大片上映前一兩週就開賣）。
// 只補「場次通沒有列的日期」——近幾天兩邊一樣，不重複讀。官網是一間影城、一天一頁，所以：
//   6 小時才重讀一次（中間沿用上一份）、每頁間隔 1 秒、只讀公開的場次頁（不碰訂票、會員）。
// 結果併進 showtimes.json（跟秀泰同一個檔、同一個格式：影城代碼 → 日期 → 片單），App 用同一套方式補進去。
// 用法：node tools/ambassador.mjs <這次的 tw-near.json> <這次的 showtimes.json（會直接改寫；沒有就從上一份開始）> [上一次發佈的 showtimes.json]
//   AMB_SAMPLE=<資料夾>：測試用，改讀存好的網頁（theaters.html、<影城代號>_<日期>.html）
import fs from "node:fs";

const [nearPath, outPath, prevPath = ""] = process.argv.slice(2);
const BASE = "https://www.ambassador.com.tw";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const EVERY = 6 * 3600e3;
const MAX_PAGES = 160; // 一次最多讀幾頁（保險：官網突然多出很多日期也不會讀個不停）
// 官網的影城名稱 → 場次通的影城代碼
const MAP = [[/大戲院/, "ambassador-taipei-center"], [/長春/, "ambassador-taipei-changchun"], [/林口/, "ambassador-linkou"], [/新莊/, "ambassador-xinzhuang"], [/淡水/, "ambassador-danshui"], [/八德/, "ambassador-bade"], [/義大/, "ambassador-kaohsiung-yida"], [/草衙/, "ambassador-kaohsiung-caoya"], [/屏東/, "ambassador-pingtung"]];

const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const near = read(nearPath), prev = read(prevPath);
const out = read(outPath) || (prev ? { ...prev } : null);
if (!out || typeof out.cinemas !== "object") { console.log("國賓預售場次：沒有可以併入的檔，這次略過"); process.exit(0); }
const isAmb = (id) => id.indexOf("ambassador-") === 0;
const keepPrev = () => { for (const [id, c] of Object.entries(prev?.cinemas || {})) if (isAmb(id) && !out.cinemas[id]) out.cinemas[id] = c; if (prev?.ambAt) out.ambAt = prev.ambAt; };
const save = () => fs.writeFileSync(outPath, JSON.stringify(out) + "\n");

if (!process.env.AMB_SAMPLE && process.env.FORCE !== "1" && prev?.ambAt && Date.now() - prev.ambAt < EVERY) {
  keepPrev(); save();
  console.log(`國賓預售場次：上一份還新（${Math.round((Date.now() - prev.ambAt) / 60000)} 分鐘前），沿用`);
  process.exit(0);
}

let pages = 0;
async function page(path, sample) {
  if (process.env.AMB_SAMPLE) { try { return fs.readFileSync(`${process.env.AMB_SAMPLE}/${sample}`, "utf8"); } catch (_) { return ""; } }
  if (pages++ >= MAX_PAGES) return "";
  if (pages > 1) await sleep(1000);
  try {
    const r = await fetch(BASE + path, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" }, signal: AbortSignal.timeout(30000) });
    return r.status === 200 ? await r.text() : "";
  } catch (_) { return ""; }
}
const text = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
// 片名寫法跟場次通對齊（半形的冒號、括號、驚嘆號、問號）
const tidy = (s) => String(s || "").replace(/：/g, ":").replace(/（/g, "(").replace(/）/g, ")").replace(/！/g, "!").replace(/？/g, "?").replace(/\s+/g, " ").trim();
const addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 86400e3).toISOString().slice(0, 10);
const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);

/** 一頁（一間影城的一天）→ [{ day, title, runtime, rating, label, time }]。凌晨場算在實際開演的那一天（跟場次通一樣） */
function parseDay(html, day) {
  const rows = [];
  for (const item of html.split(/<div class='showtime-item'>/).slice(1)) {
    const h3 = (item.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || "";
    let title = tidy(text((h3.match(/<a [^>]*>([\s\S]*?)(?:<span class='eng'>|<\/a>)/) || [])[1]));
    // 片名前面括號裡的是放映規格（(INFINITY VISION)復仇者聯盟）：移到版本那邊，片名才跟其他影城對得起來
    const pre = title.match(/^\(([^)]+)\)\s*(.+)$/);
    if (pre) title = pre[2];
    if (!title) continue;
    const info = text((h3.match(/<p class='info'>([\s\S]*?)<\/p>/) || [])[1]);
    const rating = (info.match(/(普遍級|保護級|輔12級|輔15級|限制級)/) || [])[1] || "";
    const rt = info.match(/(?:(\d+)\s*時)?\s*(\d+)\s*分/);
    const runtime = rt ? (Number(rt[1]) || 0) * 60 + Number(rt[2]) : 0;
    const parts = item.split(/<p class='tag-seat'>/).slice(1);
    for (const part of parts) {
      const tag = text(part.split("</p>")[0]);
      const label = [pre ? pre[1] : "", tidy((tag.match(/^\(([^)]*)\)/) || [])[1] || "")].filter(Boolean).join(" ") || "一般場";
      for (const m of part.matchAll(/<h6>\s*(\d{1,2}):(\d\d)\s*<\/h6>/g)) {
        let h = Number(m[1]), d = day;
        if (h >= 24) { h -= 24; d = addDays(day, 1); } else if (h < 5) d = addDays(day, 1);
        rows.push({ day: d, title, runtime, rating, label, time: String(h).padStart(2, "0") + ":" + m[2] });
      }
    }
  }
  return rows;
}

const list = await page("/home/TheaterList", "theaters.html");
const ids = Array.from(new Set(Array.from(list.matchAll(/Showtime\?ID=([0-9a-f-]{36})/g)).map((m) => m[1])));
if (!ids.length) { keepPrev(); save(); console.log("國賓預售場次：讀不到影城清單，沿用上一份"); process.exit(0); }
let got = 0, shows = 0;
const lastDay = [];
for (const tid of ids) {
  const first = await page(`/home/Showtime?ID=${tid}&DT=${today.replace(/-/g, "/")}`, `${tid}_${today}.html`);
  const name = text((first.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).split(" - ").pop() || "";
  const id = (MAP.find((x) => x[0].test(name)) || [])[1];
  if (!id || !first) continue;
  const dates = Array.from(new Set(Array.from(first.matchAll(/DT=(\d{4})\/(\d\d)\/(\d\d)/g)).map((m) => `${m[1]}-${m[2]}-${m[3]}`))).sort();
  // 場次通已經有的日期不讀；它最後一天的隔天也算有（凌晨場會落在那一天，免得只補到幾場凌晨的）
  const twDates = Object.values(near?.days?.[id] || {}).flatMap((d) => d?.dates || []);
  const twLast = twDates.sort().pop() || today;
  const extra = dates.filter((d) => d > twLast);
  const rows = [];
  let ok = true;
  for (const d of extra) {
    const html = await page(`/home/Showtime?ID=${tid}&DT=${d.replace(/-/g, "/")}`, `${tid}_${d}.html`);
    if (!html) { if (process.env.AMB_SAMPLE) continue; ok = false; break; }
    rows.push(...parseDay(html, d));
  }
  if (!ok) continue; // 這間沒讀完整：留上一份的
  const schedules = {};
  for (const r of rows) {
    if (r.day <= twLast) continue;
    const day = schedules[r.day] || (schedules[r.day] = []);
    let m = day.find((x) => x.title === r.title);
    if (!m) day.push((m = { title: r.title, runtime: r.runtime, rating: r.rating, versions: [] }));
    let v = m.versions.find((x) => x.label === r.label);
    if (!v) m.versions.push((v = { label: r.label, times: [] }));
    if (v.times.indexOf(r.time) < 0) { v.times.push(r.time); shows++; }
  }
  for (const day of Object.values(schedules)) for (const m of day) for (const v of m.versions) v.times.sort();
  if (Object.keys(schedules).length) { out.cinemas[id] = { schedules }; lastDay.push(Object.keys(schedules).sort().pop()); }
  else delete out.cinemas[id]; // 官網沒有比場次通更遠的日期：不用補
  got++;
}
keepPrev();
if (got) out.ambAt = Date.now();
save();
console.log(`國賓預售場次：${ids.length} 間影城讀到 ${got} 間，補了 ${shows} 場（最遠到 ${lastDay.sort().pop() || "—"}），共讀 ${pages} 頁`);
