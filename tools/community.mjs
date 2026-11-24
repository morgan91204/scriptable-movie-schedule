// 片刻評分總表：把 Worker 的 /v1/all 存成靜態檔，App 平常讀這個檔，不用每開一部片就打一次伺服器。
// 用法：node tools/community.mjs <輸出檔>（GitHub Actions 每 30 分鐘跑一次，內容有變才提交到 data 分支）
import fs from "node:fs";
// 兩份都匯出：10 分制（/v2/all，新版 App 讀）和 5 星制（/v1/all，還沒更新的舊版 App 讀）
const VER = process.argv[3] === "v2" ? "v2" : "v1";
const API = `https://movie-ratings.twmovietime.workers.dev/${VER}/all`;
const out = process.argv[2] || "community.json";
const res = await fetch(API, { headers: { accept: "application/json" } });
if (res.status === 404) {
  console.log("Worker 還沒有 /v1/all（尚未部署新版），這次略過");
  process.exit(0);
}
if (!res.ok) throw new Error("讀不到評分總表：" + res.status);
const data = await res.json();
const movies = data.movies;
if (!movies || typeof movies !== "object") throw new Error("評分總表格式不對");
// 不放時間戳：內容沒變就不會產生新的提交
const sorted = Object.fromEntries(Object.keys(movies).sort().map((k) => [k, movies[k]]));
// 心得標籤（只有 10 分制那份有）：片名鍵 → { 標籤代號: 人數 }
const tags = VER === "v2" && data.tags && typeof data.tags === "object" ? Object.fromEntries(Object.keys(data.tags).sort().map((k) => [k, data.tags[k]])) : null;
const notes = VER === "v2" && data.notes && typeof data.notes === "object" ? Object.fromEntries(Object.keys(data.notes).sort().map((k) => [k, data.notes[k]])) : null; // 每部片的短評則數
// at = 這份是什麼時候匯出的（只有 10 分制那份有）。App 用它判斷：我投票的時間比這份新，就代表這份還沒算到我那一票，
// 改用投票當下伺服器回的統計——排程晚了好幾個小時（GitHub 的免費排程常這樣）也不會出現「我投 8 分，分布圖上卻沒有 8 分」
fs.writeFileSync(out, JSON.stringify(tags ? { at: Date.now(), movies: sorted, tags, ...(notes ? { notes } : {}) } : { movies: sorted }) + "\n");
// 短評全文（第三個參數給了輸出檔才匯出）：App 不讀這個檔，是留底用的——data 分支每週、每月會打標籤備份，
// 萬一評分伺服器的資料出事，可以用「短評管理」的 import 從這份匯回。只有看得到的短評，沒有裝置代號。
if (VER === "v2" && data.pending > 0) console.log(`::warning::有 ${data.pending} 則短評被檢舉或被自動隱藏，還沒複查。到 Actions 執行「短評管理」（動作選 flagged）可以看內容並處理。`);
const notesOut = process.argv[4];
if (VER === "v2" && notesOut) {
  const r = await fetch(API.replace(/\/all$/, "/notes-all"), { headers: { accept: "application/json" } });
  const all = r.ok ? (await r.json()).movies : null;
  if (all && typeof all === "object") {
    fs.writeFileSync(notesOut, JSON.stringify({ movies: Object.fromEntries(Object.keys(all).sort().map((k) => [k, all[k]])) }) + "\n");
    console.log("已匯出", Object.values(all).reduce((a, l) => a + l.length, 0), "則短評");
  } else console.log("短評這次沒有匯出（" + r.status + "）");
}
console.log("已匯出", Object.keys(sorted).length, "部片的評分");
