// 觀眾評分總表：把 Worker 的 /v1/all 存成靜態檔，App 平常讀這個檔，不用每開一部片就打一次伺服器。
// 用法：node tools/community.mjs <輸出檔>（GitHub Actions 每 30 分鐘跑一次，內容有變才提交到 data 分支）
import fs from "node:fs";
const API = "https://movie-ratings.twmovietime.workers.dev/v1/all";
const out = process.argv[2] || "community.json";
const res = await fetch(API, { headers: { accept: "application/json" } });
if (res.status === 404) {
  console.log("Worker 還沒有 /v1/all（尚未部署新版），這次略過");
  process.exit(0);
}
if (!res.ok) throw new Error("讀不到評分總表：" + res.status);
const movies = (await res.json()).movies;
if (!movies || typeof movies !== "object") throw new Error("評分總表格式不對");
// 不放時間戳：內容沒變就不會產生新的提交
const sorted = Object.fromEntries(Object.keys(movies).sort().map((k) => [k, movies[k]]));
fs.writeFileSync(out, JSON.stringify({ movies: sorted }) + "\n");
console.log("已匯出", Object.keys(sorted).length, "部片的評分");
