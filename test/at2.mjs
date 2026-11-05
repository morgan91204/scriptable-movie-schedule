import { tap, dump, closeUI } from "./mock.mjs";
const driver = (async () => {
  await tap(/^南投縣/);
  await tap(/埔里山明影城/);
  await new Promise((r) => setTimeout(r, 3000));
  await dump("埔里：日期");
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs");
await driver;
process.exit(0);
