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
fs.writeFileSync(out, JSON.stringify(tags ? { movies: sorted, tags } : { movies: sorted }) + "\n");
console.log("已匯出", Object.keys(sorted).length, "部片的評分");
