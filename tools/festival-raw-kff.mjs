// 開發用：把高雄電影節公開場次頁（不用登入）背後的資料原樣存下來，看資料長什麼樣、當測試樣本。
// 做法跟一般訪客的瀏覽器一樣：先開場次頁，再用頁面上附的表單代碼去要某一天的場次。
// 用法：node tools/festival-raw-kff.mjs <輸出資料夾>
import fs from "node:fs";
const out = process.argv[2] || "raw";
fs.mkdirSync(out, { recursive: true });
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const get = async (url) => { const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" } }); return { r, html: await r.text() }; };
const home = await get("https://www.kff.tw/");
const dates = Array.from(home.html.matchAll(/<option value="(\d{4}-\d{2}-\d{2})"/g)).map((m) => m[1]);
const page = await get("https://www.kff.tw/schedule");
const cookie = (page.r.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
const form = (page.html.match(/<meta name="csrf-token" content="([^"]+)"/) || [])[1];
console.log("首頁日期", dates[0], "~", dates[dates.length - 1], dates.length, "天；場次頁", page.r.status, "表單代碼", form ? "有" : "無");
fs.writeFileSync(`${out}/info.json`, JSON.stringify({ dates, hasForm: !!form }, null, 1));
if (!form || !dates.length) process.exit(0);
let n = 0;
for (const date of [dates[0], dates[1], dates[dates.length - 1]]) {
  await new Promise((r) => setTimeout(r, 1000));
  const r = await fetch("https://www.kff.tw/schedule/ajax", { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": form, Accept: "application/json, text/javascript, */*", Referer: "https://www.kff.tw/schedule", Cookie: cookie }, body: new URLSearchParams({ select_cate: "108", datepicker_date: date }).toString() });
  const text = await r.text();
  console.log(date, r.status, text.length, text.slice(0, 160).replace(/\s+/g, " "));
  fs.writeFileSync(`${out}/${String(++n).padStart(2, "0")}-${date}.txt`, text);
}
