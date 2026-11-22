// 開發用：把台北電影節公開場次頁（不用登入）背後的資料原樣存下來，看資料長什麼樣、當測試樣本。
// 做法跟一般訪客的瀏覽器一樣：先開場次頁，再用頁面上附的表單代碼去要某一天的場次。
// 用法：node tools/festival-raw.mjs <輸出資料夾>
import fs from "node:fs";
const out = process.argv[2] || "raw";
fs.mkdirSync(out, { recursive: true });
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const PAGE = "https://www.taipeiff.taipei/tw/movies/schedule";
const page = await fetch(PAGE, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" } });
const html = await page.text();
const cookie = (page.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
const form = html.match(/'jobType': 'getMyFilm_1',\s*'date': dateStr,\s*"([0-9a-f]{32})": "([0-9a-f]+)"/);
const fd = (html.match(/const fd = '(\d{4}-\d{2}-\d{2})'/) || [])[1];
const max = (html.match(/maxDate: new Date\('(\d{4}-\d{2}-\d{2})'\)/) || [])[1];
console.log("場次頁", page.status, html.length, "預設日", fd, "最後一天", max, "表單代碼", form ? "有" : "無");
fs.writeFileSync(`${out}/info.json`, JSON.stringify({ status: page.status, fd, max, hasForm: !!form }, null, 1));
if (!form || !fd) process.exit(0);
const addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 86400e3).toISOString().slice(0, 10);
let n = 0;
for (const date of [fd, addDays(fd, 1), max]) {
  for (const [kind, body, type] of [
    ["json", JSON.stringify({ jobType: "getMyFilm_1", date, [form[1]]: form[2] }), "application/json"],
    ["form", new URLSearchParams({ jobType: "getMyFilm_1", date, [form[1]]: form[2] }).toString(), "application/x-www-form-urlencoded"],
  ]) {
    await new Promise((r) => setTimeout(r, 1000));
    const r = await fetch("https://www.taipeiff.taipei/movies/schedule", { method: "POST", headers: { "User-Agent": UA, "Content-Type": type, "X-Requested-With": "XMLHttpRequest", Accept: "application/json, text/plain, */*", Referer: PAGE, Cookie: cookie }, body });
    const text = await r.text();
    console.log(date, kind, r.status, text.length, text.slice(0, 140).replace(/\s+/g, " "));
    fs.writeFileSync(`${out}/${String(++n).padStart(2, "0")}-${date}-${kind}.txt`, text);
    if (r.status === 200 && /"status"\s*:\s*"success"/.test(text)) break;
  }
}
