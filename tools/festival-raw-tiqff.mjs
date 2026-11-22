// 開發用：把臺灣國際酷兒影展公開場次頁（不用登入）進頁後載入的內容原樣存下來，看資料長什麼樣、當測試樣本。
// 做法跟一般訪客的瀏覽器一樣：先開場次頁，再用頁面上附的代碼要頁面內容（頁面自己一載入就會做的那三個請求）。
// 用法：node tools/festival-raw-tiqff.mjs <輸出資料夾> [場次頁網址]
import fs from "node:fs";
const out = process.argv[2] || "raw";
const PAGE = process.argv[3] || "https://tiqff.org.tw/Festival.aspx?ID=1574&ek=26&pg=1&d=";
fs.mkdirSync(out, { recursive: true });
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const page = await fetch(PAGE, { headers: { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" } });
const html = await page.text();
const cookie = (page.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
const hid = (name) => (html.match(new RegExp(`id="ContentPlaceHolder1_${name}" value="([^"]*)"`)) || [])[1] || "";
const v = { guid: hid("hfGUID"), prog: hid("hfProgramID"), id: hid("hfID"), pg: hid("hfPage") || "1", title: hid("hfProgramTitle"), ek: hid("hfEnumAgnKey"), media: hid("hfMediaType"), kw: hid("hfKeyword") };
console.log("場次頁", page.status, html.length, "頁面代碼", v.guid ? "有" : "無", v.prog, v.id, v.ek);
if (!v.guid) process.exit(0);
const args = JSON.stringify([{ FieldType: "QParameter", FieldName: "FestivalID", FieldValue: v.ek, Comparison: "=" }]);
const calls = [
  ["LoadSubTitle", { guid: v.guid, strID: v.prog, strSubID: v.id }],
  ["LoadPageAttr_HTML", { guid: v.guid, strID: v.prog, strSubID: v.id, strType: v.title, strMediaType: v.media }],
  ["LoadToyBrick_HTML", { guid: v.guid, strID: v.prog, strSubID: v.id, strType: v.title, strMediaType: v.media, strKeyword: v.kw, inputArgs: args, strPageID: v.pg }],
];
let n = 0;
for (const [name, body] of calls) {
  await new Promise((r) => setTimeout(r, 1000));
  const r = await fetch(`https://tiqff.org.tw/Festival.aspx/${name}`, { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/json; charset=utf-8", "X-Requested-With": "XMLHttpRequest", Accept: "application/json, text/javascript, */*", Referer: PAGE, Cookie: cookie }, body: JSON.stringify(body) });
  const text = await r.text();
  console.log(name, r.status, text.length, text.slice(0, 160).replace(/\s+/g, " "));
  fs.writeFileSync(`${out}/${String(++n).padStart(2, "0")}-${name}.txt`, text);
}
