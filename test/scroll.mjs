// 返回上一頁時要還原捲動位置
import { tap, dump, closeUI } from "./mock.mjs";
const show = (label) => console.log(`${label}：scrollTo = ${globalThis.__scrollTo}`);
const driver = (async () => {
  await dump("首頁"); show("首頁");
  await tap(/^高雄市/, {}, 820);          // 在首頁捲到 820 後點高雄市
  await dump("高雄"); show("進入高雄（應為 0）");
  await tap(/高雄大遠百威秀影城/, {}, 300);  // 在高雄清單捲到 300 後點影城
  await dump("影城"); show("進入影城（應為 0）");
  await tap(/返回/);
  await dump("回高雄"); show("返回高雄（應為 300）");
  await tap(/返回/);
  await dump("回首頁"); show("返回首頁（應為 820）");
  await tap(/廣告預告/, {}, 900);
  await dump("切換廣告"); show("切換廣告（應為 -1 停在原位）");
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs");
await driver;
process.exit(0);
