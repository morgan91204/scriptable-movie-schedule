// 新功能：現在有什麼可以看、附近的影城、特殊廳篩選、分享
import { tap, dump, log, closeUI } from "./mock.mjs";
const scenario = process.argv[2] || "now";
const driver = (async () => {
  await dump("首頁");
  if (scenario === "now") {
    await tap(/現在有什麼可以看/);
    await tap(/^晚上 17–21 點$/);
    await tap(/^台北市$/);
    await dump("條件");
    await tap(/找場次/);
    await new Promise((r) => setTimeout(r, 15000));
    await dump("結果");
    await tap(/^\d\d:\d\d/);
    await dump("確認");
    await tap(/^分享這場給朋友$/);
  } else if (scenario === "near") {
    await tap(/附近的影城/);
    await dump("附近");
  } else if (scenario === "imax") {
    await tap(/依電影找場次/);
    await tap(/^哥吉拉|^泥面人/);
    await dump("電影頁");
    await tap(/^4DX$/);
    await new Promise((r) => setTimeout(r, 1000));
    await dump("只看 4DX");
  }
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs");
await driver;
console.log("\n── 其他動作 ──\n" + log.join("\n"));
process.exit(0);
