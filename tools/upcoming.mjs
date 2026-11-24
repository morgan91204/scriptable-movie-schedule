// 即將上映的片單：場次通只有「已經排了場次」的片（通常上映前一兩週才有），更遠的要另外找。
// 官方（文化部影視局）的分級資料一年才公布一次，沒辦法用；所以用開眼電影網的「近期上映」：
//   /movie/next/0/ ＝ 未來八週每一週要上映的片（完整）；/movie/next/ ＝ 更遠的重點片（有分級、片長）。
// 海報不直接連開眼的圖：開眼的電影代碼後面就是 IMDb 編號，用它到 TMDB 查海報（查過的記著，不再查）。
// 一天只抓四次（六小時內抓過就沿用上一份）。
// 用法：TMDB_TOKEN=… node tools/upcoming.mjs <上一份 upcoming.json> <輸出 upcoming.json>
import fs from "node:fs";
import { cleanIntro, creditsOf } from "./intro-text.mjs";

const [prevPath, outPath = "upcoming.json"] = process.argv.slice(2);
const TOKEN = (process.env.TMDB_TOKEN || "").trim();
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const AT = "https://www.atmovies.com.tw";
const HOUR = 3600e3, DAY = 24 * HOUR, now = Date.now();
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (_) { return null; } };
const prev = read(prevPath) || { at: 0, films: [], tmdb: {} };
const today = new Date(now + 8 * HOUR).toISOString().slice(0, 10); // 台灣的今天

const text = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const iso = (d) => d.replace(/\//g, "-");
/** 原文片名：全是漢字的（華語片，常常只是簡體寫法）不顯示 */
const enOf = (t) => (t && t.en && /[A-Za-zぁ-ヿ가-힣\u0600-\u06FF\u0400-\u04FF\u0E00-\u0E7F]/.test(t.en) ? t.en : "");
const CERT = { G: "普遍級", P: "保護級", F2: "輔12級", F5: "輔15級", R: "限制級" };

/** 「未來八週」那一頁：每個日期一個標題，底下是那一天上映的片 */
export function parseWeeks(html) {
  const out = [];
  const parts = html.split(/<h2 class="major"><span>(\d{4}\/\d{2}\/\d{2})<\/span><\/h2>/);
  for (let i = 1; i < parts.length; i += 2) {
    const release = iso(parts[i]);
    const block = parts[i + 1].split(/<h2 /)[0];
    // 這一頁的日期是「那一週」的日期，不是每部片確切的上映日：先標成大約（approx），之後到電影頁查確切的
    for (const m of block.matchAll(/<a href="\/movie\/(f\w+)\/"><img[^>]*alt="([^"]*)"/g)) out.push({ id: m[1], title: text(m[2]), release, approx: true });
  }
  return out;
}
/** 「近期上映推薦」那一頁：比較遠的重點片，有上映日期、分級、片長 */
export function parseFeatured(html) {
  const out = [];
  for (const li of html.matchAll(/<li><a href="\/movie\/(f\w+)\/"><img[^>]*alt="([^"]*)"[\s\S]*?<\/li>/g)) {
    const d = li[0].match(/上映日期：(?:<a[^>]*>)?\s*(\d{4}\/\d{2}\/\d{2})/);
    if (!d) continue;
    const cert = (li[0].match(/cer_(\w+)\.gif/) || [])[1];
    const mins = Number((li[0].match(/片長：\s*(\d+)\s*分/) || [])[1]) || 0;
    out.push({ id: li[1], title: text(li[2]), release: iso(d[1]), rating: CERT[cert] || "", runtime: mins, approx: false });
  }
  return out;
}

async function page(path) {
  const r = await fetch(AT + path, { headers: { "User-Agent": UA, accept: "text/html" }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`開眼 ${path} ${r.status}`);
  return await r.text();
}

if (process.argv[1] && process.argv[1].endsWith("upcoming.mjs")) {
  if (now - (prev.at || 0) < 6 * HOUR && (prev.films || []).length && prev.dates) { // 沒有 dates 的是舊格式：重抓
    // 六小時內抓過：沿用，只把已經過了上映日的拿掉
    const films = prev.films.filter((f) => f.release > today);
    fs.writeFileSync(outPath, JSON.stringify({ ...prev, films }) + "\n");
    console.log(`六小時內抓過，沿用上一份（${films.length} 部）`);
    process.exit(0);
  }
  let weeks, featured;
  try {
    weeks = parseWeeks(await page("/movie/next/0/"));
    await new Promise((r) => setTimeout(r, 1500));
    featured = parseFeatured(await page("/movie/next/"));
  } catch (e) {
    console.log("開眼讀不到，沿用上一份：" + (e.message || e));
    if (prevPath && fs.existsSync(prevPath)) fs.copyFileSync(prevPath, outPath);
    process.exit(0);
  }
  if (!weeks.length && !featured.length) {
    console.log("開眼的頁面解析不出任何片（版面可能改了），沿用上一份");
    if (prevPath && fs.existsSync(prevPath)) fs.copyFileSync(prevPath, outPath);
    process.exit(0);
  }
  // 兩頁合在一起：同一部片以「推薦」那一頁的為主（多了分級、片長）
  const byId = new Map();
  for (const f of weeks) byId.set(f.id, f);
  for (const f of featured) byId.set(f.id, { ...(byId.get(f.id) || {}), ...f });
  const all = Array.from(byId.values()).filter((f) => f.title);
  // 只知道「哪一週」的片：到它的電影頁查確切的上映日期（一部片只查一次，記在 dates；一次最多查 60 部，每部隔 1.2 秒）
  const dates = prev.dates || {};
  let looked = 0;
  for (const f of all) {
    if (!f.approx) continue;
    const old = dates[f.id];
    if (!old && looked < 60) {
      looked++;
      await new Promise((r) => setTimeout(r, 1200));
      try {
        const h = await page(`/movie/${f.id}/`);
        const d = h.match(/上映日期[：:]\s*(?:<[^>]*>\s*)*(\d{4})\/(\d{1,2})\/(\d{1,2})/);
        const mins = Number((h.match(/片長[：:]\s*(\d+)\s*分/) || [])[1]) || 0;
        dates[f.id] = { d: d ? `${d[1]}-${d[2].padStart(2, "0")}-${d[3].padStart(2, "0")}` : "", mins, at: now };
      } catch (_) { /* 這次讀不到：下次再查 */ }
    }
    const got = dates[f.id];
    // 電影頁的日期要跟「那一週」差不多（前後十天內）才採用，免得抓到別的日期（例如重映片的舊上映日）
    if (got && got.d && Math.abs(Date.parse(got.d) - Date.parse(f.release)) <= 10 * DAY) { f.release = got.d; f.approx = false; }
    if (got && got.mins && !f.runtime) f.runtime = got.mins;
  }
  for (const k of Object.keys(dates)) if (!byId.has(k) && now - dates[k].at > 30 * DAY) delete dates[k];
  const list = all.filter((f) => f.release > today);

  // 海報：開眼代碼「f＋一個字母＋兩碼國別＋IMDb 編號」→ 到 TMDB 用 IMDb 編號查。查過的記在 tmdb（找不到的 7 天後再試）
  const tmdb = prev.tmdb || {};
  let asked = 0;
  if (TOKEN) {
    for (const f of list) {
      const num = (f.id.match(/^f[a-z]{3}(\d{7,8})$/) || [])[1];
      const old = tmdb[f.id];
      // 簡介（o）是後來才加的：舊的紀錄沒有這一欄，重查一次
      // 導演、演員（d、c）也是後來才加的：沒有 d 這一欄的重查一次
      if (!num || (old && old.o !== undefined && old.d !== undefined && (old.p || now - old.at < 7 * DAY))) continue;
      try {
        asked++;
        const r = await fetch(`https://api.themoviedb.org/3/find/tt${num}?external_source=imdb_id&language=zh-TW`, { headers: { accept: "application/json", Authorization: "Bearer " + TOKEN }, signal: AbortSignal.timeout(20000) });
        if (!r.ok) throw new Error("TMDB " + r.status);
        const hit = ((await r.json()).movie_results || [])[0];
        const p = hit && /^\/[\w.-]+$/.test(hit.poster_path || "") ? hit.poster_path : "";
        let cr = { director: "", cast: "" };
        if (hit && hit.id) {
          const c = await fetch(`https://api.themoviedb.org/3/movie/${hit.id}/credits?language=zh-TW`, { headers: { accept: "application/json", Authorization: "Bearer " + TOKEN }, signal: AbortSignal.timeout(20000) });
          if (c.ok) cr = creditsOf(await c.json());
        }
        tmdb[f.id] = { p, en: hit ? String(hit.original_title || "").slice(0, 120) : "", o: cleanIntro(hit ? hit.overview : ""), d: cr.director, c: cr.cast, at: now };
      } catch (_) { /* 連線出錯：下次再查 */ }
      await new Promise((r) => setTimeout(r, 60));
    }
  }
  for (const k of Object.keys(tmdb)) if (!byId.has(k) && now - tmdb[k].at > 30 * DAY) delete tmdb[k];
  const films = list
    .map((f) => ({ title: f.title, release: f.release, rating: f.rating || "", runtime: f.runtime || 0, approx: !!f.approx, en: enOf(tmdb[f.id]), poster: tmdb[f.id] && tmdb[f.id].p ? "https://image.tmdb.org/t/p/w342" + tmdb[f.id].p : "", ...(tmdb[f.id] && tmdb[f.id].o ? { intro: tmdb[f.id].o } : {}), ...(tmdb[f.id] && tmdb[f.id].d ? { director: tmdb[f.id].d } : {}), ...(tmdb[f.id] && tmdb[f.id].c ? { cast: tmdb[f.id].c } : {}), url: `${AT}/movie/${f.id}/` }))
    .sort((a, b) => a.release.localeCompare(b.release) || a.title.localeCompare(b.title, "zh-Hant"));
  fs.writeFileSync(outPath, JSON.stringify({ at: now, source: "開眼電影網", films, tmdb, dates }) + "\n");
  console.log(`即將上映 ${films.length} 部（未來八週 ${weeks.length}、重點片 ${featured.length}），到 ${films.length ? films[films.length - 1].release : "-"}；有海報 ${films.filter((f) => f.poster).length}；這次問了 TMDB ${asked} 次、查了 ${looked} 部的電影頁；只知道哪一週的還有 ${films.filter((f) => f.approx).length} 部`);
}
