// 開發用：看國家電影及視聽文化中心「全國電影票房統計」的開放資料有哪些（週、週末、月、季、年），各有哪些欄位。
// 只讀開放資料的網址（/OpenData/…），用跟 tools/boxoffice.mjs 一樣的自我介紹；網站的一般頁面有瀏覽器驗證，不碰。
// 用法：node tools/boxoffice-probe.mjs <輸出資料夾>
import fs from "node:fs";
const out = process.argv[2] || "raw";
fs.mkdirSync(out, { recursive: true });
const UA = "movie-schedule-boxoffice/1.0 (+https://github.com/morgan91204/scriptable-movie-schedule)";
const BASE = "https://boxofficetw.tfai.org.tw/OpenData";
const paths = [
  "/statistic/since2016",
  "/statistic/Week", "/statistic/week", "/statistic/Week/2026-11-09", "/statistic/Week/2026-11-09/2026-11-15",
  "/statistic/Weekend", "/statistic/Weekend/2026-11-13",
  "/statistic/Month", "/statistic/Month/2026-10-01",
  "/statistic/Season", "/statistic/Season/2026-07-01",
  "/statistic/Year", "/statistic/Year/2026-01-01", "/statistic/Year/2025",
  "", "/index", "/statistic",
];
let n = 0;
for (const p of paths) {
  await new Promise((r) => setTimeout(r, 1200));
  let line = "";
  try {
    const r = await fetch(BASE + p, { headers: { "User-Agent": UA, accept: "application/json, text/html;q=0.8" }, signal: AbortSignal.timeout(30000) });
    const text = await r.text();
    line = `${r.status} ${r.headers.get("content-type") || ""} ${text.length}`;
    let info = "";
    try {
      const j = JSON.parse(text);
      const list = Array.isArray(j) ? j : j.List || j.list || j.DataItems || [];
      info = ` keys=${Object.keys(Array.isArray(j) ? {} : j).join(",")} n=${list.length} item=${JSON.stringify(list[0] || {}).slice(0, 600)}`;
      fs.writeFileSync(`${out}/${String(++n).padStart(2, "0")}${p.replace(/[^\w-]/g, "_") || "_root"}.json`, JSON.stringify(Array.isArray(j) ? j.slice(0, 5) : { ...j, List: list.slice(0, 5) }, null, 1));
    } catch (_) {
      info = " " + text.replace(/\s+/g, " ").slice(0, 160);
      if (r.status === 200) fs.writeFileSync(`${out}/${String(++n).padStart(2, "0")}${p.replace(/[^\w-]/g, "_") || "_root"}.html`, text.slice(0, 200000));
    }
    line += info;
  } catch (e) { line = "ERR " + String(e.message || e); }
  console.log(`${p || "/"} → ${line}`);
}
