// 用法：node test/run.mjs <情境>
import { tap, dump, saved, log, closeUI } from "./mock.mjs";
const scenario = process.argv[2] || "vs";
const driver = (async () => {
  await dump("首頁");
  if (scenario === "vs") {
    await tap(/^台北市/);
    await tap(/台北信義威秀影城/);
    await dump("信義威秀：日期");
    await tap(/今天/);
    await dump("片單");
    await tap(/\d+ 分｜/);
    await dump("場次");
    await tap(/^\d\d:\d\d→/);
    await dump("確認頁");
    await tap(/影廳／座位/);
    await dump("座位輸入");
    await tap(/^確定$/, { v: "7 廳 H12" });
    await tap(/廣告預告/);
    await tap(/📅行事曆/);
    await dump("行事曆選擇");
    await tap(/^電影$/);
    await dump("確認頁（改過）");
    await tap(/加入行事曆/);
    await dump("完成頁");
  } else if (scenario === "search") {
    await tap(/搜尋影城/);
    await tap(/^搜尋$/, { q: "松仁" });
    await dump("搜尋結果");
    await tap(/MUVIE CINEMAS 台北松仁/);
    await tap(/加入常去影城/);
    await dump("加入常去後");
    await tap(/返回/); await tap(/返回/); await tap(/返回/);
    await dump("首頁（常去應有松仁）");
  } else if (["eslite", "spoths", "spot", "lux"].includes(scenario)) {
    const name = { eslite: /誠品電影院/, spoths: /光點華山/, spot: /光點台北/, lux: /樂聲影城/ }[scenario];
    await tap(name);
    await dump("日期");
    await tap(/（.）/);
    await dump("片單");
    await tap(/分｜/);
    await dump("場次");
    await tap(/^\d\d:\d\d/);
    await dump("確認頁");
    await tap(/加入行事曆/);
    await dump("完成頁");
  } else if (scenario === "noruntime") {
    await tap(/^高雄市/);
    await tap(/高雄大遠百威秀影城/);
    await tap(/（.）/);
    await tap(/片長未提供/);
    await tap(/^\d\d:\d\d/);
    await dump("確認頁（片長未提供）");
    await tap(/加入行事曆/);
    await dump("應跳到片長輸入");
    await tap(/^確定$/, { v: "130" });
    await tap(/加入行事曆/);
    await dump("完成頁");
  } else if (scenario === "error") {
    await tap(/搜尋影城/);
    await tap(/^搜尋$/, { q: "zzzz" });
    await dump("無結果");
    await tap(/返回/);
    await tap(/^台北市/);
    await tap(/台北信義威秀影城/);
    await tap(/今天/);
    await tap(/\d+ 分｜/);
    await tap(/^\d\d:\d\d/);
    await tap(/^片長/);
    await tap(/^確定$/, { v: "abc" });
    await dump("錯誤頁");
    await tap(/重試/);
    await dump("重試後（片長輸入頁）");
  }
  closeUI();
})().catch((e) => { console.error("❌", e.message); process.exit(1); });
await import("../dist/app.mjs");
await driver;
console.log("\n── 寫入的行事曆行程 ──");
for (const e of saved) console.log(JSON.stringify({ title: e.title, start: e.startDate, end: e.endDate, location: e.location, calendar: e.calendar.title }), "\n" + e.notes);
console.log("\n── 其他動作 ──\n" + log.join("\n"));
process.exit(0);
