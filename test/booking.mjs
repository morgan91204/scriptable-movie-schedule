// 確認頁：以瀏覽器訂票（影城官方訂票頁）、以 App 訂票（App Store 的官方 App）
import { tap, dump, log, closeUI, waitFor } from "./mock.mjs";
const driver = (async () => {
  for (const [city, name] of [["台北市", "大巨蛋秀泰影城"], ["台北市", "誠品電影院"], ["台北市", "美麗華大直影城"]]) {
    await tap(/依縣市找影院/); await tap(new RegExp("^" + city)); await tap(new RegExp(name));
    await tap(/明天/); await tap(/分｜|片長未提供/); await tap(/^\d\d:\d\d/);
    await waitFor(/以瀏覽器訂票/); await dump(name + "：確認頁");
    await tap(/以瀏覽器訂票/);
    try { await waitFor(/以 App 訂票/, 1500); await tap(/以 App 訂票/); } catch (_) {}
    for (let i = 0; i < 6; i++) await tap(/返回/);
  }
  // 依電影找：場次頁沒有訂票連結，要從影城頁補
  await tap(/依電影找場次/); await tap(/^惡靈古堡/); await tap(/台北信義威秀影城|MUVIE/); await tap(/^\d\d:\d\d/);
  await tap(/以瀏覽器訂票/); await tap(/以 App 訂票/);
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs"); await driver;
console.log("\n" + log.filter((l) => /Safari/.test(l)).join("\n")); process.exit(0);
