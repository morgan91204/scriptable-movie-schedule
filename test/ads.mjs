import { tap, dump, closeUI } from "./mock.mjs";
const driver = (async () => {
  await dump("首頁");
  for (const n of [1, 2, 3, 4]) {
    await tap(/廣告預告/);
    await dump(`首頁切換第 ${n} 次`);
    console.log("   keep scroll =", globalThis.__keep);
  }
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs");
await driver;
process.exit(0);
