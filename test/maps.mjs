// 地址：點一下導航（依設定的地圖）、長按複製；設定切換 Google 地圖後分享連結也跟著變
import { tap, longPress, dump, log, closeUI, waitFor } from "./mock.mjs";
const driver = (async () => {
  await tap(/^台北市/); await tap(/大巨蛋秀泰影城/);
  await waitFor(/點一下導航/); await dump("影城頁");
  await tap(/點一下導航/);
  await longPress(/點一下導航/);
  await tap(/返回/); await tap(/返回/);
  await tap(/導航地圖/);
  await dump("首頁（切到 Google）");
  await tap(/^台北市/); await tap(/大巨蛋秀泰影城/);
  await tap(/點一下導航/);
  await tap(/（.）/); await tap(/分$|分｜/); await tap(/^\d\d:\d\d/);
  await waitFor(/加入行事曆/); await dump("確認頁");
  await tap(/分享/);
  await tap(/返回/); await tap(/返回/); await tap(/返回/); await tap(/返回/); await tap(/返回/);
  await tap(/導航地圖/); // 改回 Apple
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs"); await driver;
console.log("\n" + log.filter((l) => /Safari|Pasteboard|toast|Share/.test(l)).join("\n"));
process.exit(0);
