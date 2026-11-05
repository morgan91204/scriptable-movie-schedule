// 電影頁：海報、評分先顯示讀取中，讀好後自動在原位補上；預告按鈕不會變成搜尋
import { tap, dump, log, closeUI } from "./mock.mjs";
const driver = (async () => {
  if (process.env.TMDB_TOKEN) {
    await tap(/補片長（TMDB）/);
    await tap(/儲存並測試/, { v: process.env.TMDB_TOKEN });
    await new Promise((r) => setTimeout(r, 4000));
    await tap(/返回/);
  }
  await tap(/依電影找場次/);
  await tap(/^野獸之心|^快打旋風|^奧德賽/);
  await dump("剛打開");
  await new Promise((r) => setTimeout(r, 9000));
  await dump("9 秒後（應自動補上）");
  await tap(/觀看預告|搜尋預告/);
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs"); await driver;
console.log(log.filter((l) => /Safari/.test(l)).join("\n")); process.exit(0);
