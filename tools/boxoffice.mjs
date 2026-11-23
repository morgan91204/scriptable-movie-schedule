// 全台票房排行：讀國家電影及視聽文化中心「全國電影票房統計」開放資料（政府資料開放授權條款第 1 版），
// 產生 dist/boxoffice.json 給兩個 App 用。官方只提供 2016 年以來的累計票房，
// 所以每週存一份快照（data/boxoffice-snapshot.json），用「這週累計 − 上週累計」算出週票房。
// 用法：node tools/boxoffice.mjs（GitHub Actions 每小時跑一次，資料有更新才會改檔）
// 每一週的起訖是官方資料自己的截止日（End）決定的，跟我們幾點去讀無關：晚幾個小時讀，數字和週次都一樣。
// 只有連續七天以上都沒讀到（漏掉一整週）時，相減出來的才會是兩週合計；那時 start 會是上一份快照的隔天，畫面照實顯示那段期間
import fs from "node:fs";

const SRC = "https://boxofficetw.tfai.org.tw/OpenData/statistic/since2016";
const SNAP = "data/boxoffice-snapshot.json";
const OUT = "dist/boxoffice.json";
const YEARS_OUT = "dist/boxoffice-years.json";
const WEEKS_OUT = "dist/boxoffice-weeks.json"; // 每一週的週票房排行都留著（官方只給累計，過去的週票房之後算不回來）
const TOP = 300; // 排到底：這週有賣出票的片全部列出（通常 100 多部）

const day = (s) => String(s || "").slice(0, 10);
const addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 86400e3).toISOString().slice(0, 10);

const res = await fetch(SRC, { headers: { "User-Agent": "movie-schedule-boxoffice/1.0 (+https://github.com/morgan91204/scriptable-movie-schedule)" } });
if (!res.ok) throw new Error("開放資料讀不到：" + res.status);
const src = await res.json();
const end = day(src.End);
if (!end || !Array.isArray(src.List) || src.List.length < 100) throw new Error("開放資料格式不對");

let prev = null;
try {
  prev = JSON.parse(fs.readFileSync(SNAP, "utf8"));
} catch (_) {}
let out = null;
try {
  out = JSON.parse(fs.readFileSync(OUT, "utf8"));
} catch (_) {}
if (out && out.end === end && process.env.FORCE !== "1") {
  console.log("官方資料還沒更新（截至 " + end + "），不用改");
  process.exit(0);
}
// 上一份快照必須是更早的一週；如果是同一週（重跑）就沿用它的上一份
const base = prev && prev.end < end ? prev : prev && prev.prev && prev.prev.end < end ? prev.prev : null;

// 只留近兩年上映的片當快照（夠算週票房，檔案也小）
const cutoff = addDays(end, -730);
const films = src.List.filter((x) => day(x.ReleaseDate) >= cutoff && x.Name).map((x) => ({
  name: String(x.Name).trim(),
  country: x.Country || "",
  release: day(x.ReleaseDate),
  theaters: Number(x.TheaterCount) || 0,
  total: Math.round(Number(x.TotalAmounts) || 0),
  tickets: Math.round(Number(x.TotalTickets) || 0),
}));
const key = (f) => f.name + "|" + f.release;

let list, mode, start;
if (base) {
  // 週票房 = 這週累計 − 上週累計（上週還沒有的片：整個累計都算這週）
  const before = new Map(base.films.map((f) => [key(f), f]));
  start = addDays(base.end, 1);
  list = films
    .map((f) => {
      const b = before.get(key(f));
      // 上週的資料裡還沒有這部片，卻在這週開始前就上映了（官方常晚一週才列入新片）：
      // 相減出來的是「上映至今」，不是單週，標記起來讓 App 照實顯示
      return { ...f, week: f.total - (b ? b.total : 0), weekTickets: f.tickets - (b ? b.tickets : 0), since: !b && f.release < start };
    })
    .filter((f) => f.week > 0)
    .sort((a, b) => b.week - a.week);
  mode = "week";
} else {
  // 第一次跑、還沒有上週快照：先列近 8 週上映的片的累計票房
  const since = addDays(end, -56);
  list = films.filter((f) => f.release >= since && f.total > 0).sort((a, b) => b.total - a.total);
  mode = "total";
  start = since;
}

// 年度總排行：各年上映的片依累計票房排（已經下檔的也算），有票房的全部列出；這週還有賣出票的標記「上映中」
const year = end.slice(0, 4);
const showing = new Set(mode === "week" ? list.map(key) : []);
const everything = src.List.filter((x) => x.Name && day(x.ReleaseDate)).map((x) => ({
  name: String(x.Name).trim(),
  country: x.Country || "",
  release: day(x.ReleaseDate),
  theaters: Number(x.TheaterCount) || 0,
  total: Math.round(Number(x.TotalAmounts) || 0),
}));
const yearOf = (y) =>
  everything
    .filter((f) => f.release.slice(0, 4) === y && f.total > 0)
    .sort((a, b) => b.total - a.total)
    // 全部列出（一年大約六百部）；欄位只留畫面用得到的，檔案才不會太大
    .map((f, i) => ({ rank: i + 1, name: f.name, release: f.release, theaters: f.theaters, total: f.total, ...(showing.has(key(f)) ? { showing: true } : {}) }));
// 官方開放資料從 2016 年起：每一年都列。這些另外存成一個檔（dist/boxoffice-years.json），App 切到「年度」才下載，
// 平常看本週／累計不用多下載這一包
const years = {};
for (let y = Number(year); y >= 2016; y--) {
  const l = yearOf(String(y));
  if (l.length) years[String(y)] = l;
}
const yearList = years[year] || [];

// 歷史週票房：把這一週的排行存進去（同一週重跑就蓋掉），新的在前，最多留 52 週
const weekItem = (f, i) => ({ rank: i + 1, name: f.name, release: f.release, theaters: f.theaters, week: f.week, ...(f.since ? { since: true } : {}), total: f.total });
let weeksHistory = [];
try {
  weeksHistory = JSON.parse(fs.readFileSync(WEEKS_OUT, "utf8")).weeks || [];
} catch (_) {}
if (mode === "week") {
  weeksHistory = weeksHistory.filter((w) => w.end !== end);
  weeksHistory.push({ start, end, list: list.slice(0, TOP).map(weekItem) });
}
weeksHistory.sort((a, b) => b.end.localeCompare(a.end));
weeksHistory = weeksHistory.slice(0, 52);

const result = {
  updated: new Date().toISOString(),
  mode, // week = 週票房排行；total = 近期上映片的累計票房（還沒有上週資料時）
  start,
  end,
  source: "國家電影及視聽文化中心「全國電影票房統計」（政府資料開放授權條款第 1 版）",
  sourceUrl: "https://boxofficetw.tfai.org.tw/",
  list: list.slice(0, TOP).map((f, i) => ({
    rank: i + 1,
    name: f.name,
    country: f.country,
    release: f.release,
    theaters: f.theaters,
    week: mode === "week" ? f.week : null,
    ...(f.since ? { since: true } : {}), // week 其實是上映至今的累計（見上）
    weekTickets: mode === "week" ? f.weekTickets : null,
    total: f.total,
    tickets: f.tickets,
  })),
  year: yearList.slice(0, 200), // 今年的年度排行前 200 名（主檔保持小；完整的和其他年份在 boxoffice-years.json）
  years: { [year]: yearList.slice(0, 200) },
  weeks: weeksHistory.map((w) => ({ start: w.start, end: w.end })), // 有哪幾週可以看（排行本身在 boxoffice-weeks.json，選了才下載）
};

fs.mkdirSync("data", { recursive: true });
// 快照：這週的累計，順便記住上一份（同一週重跑時用）
fs.writeFileSync(SNAP, JSON.stringify({ end, films, prev: base ? { end: base.end, films: base.films } : null }) + "\n");
fs.writeFileSync(OUT, JSON.stringify(result, null, 1) + "\n");
fs.writeFileSync(YEARS_OUT, JSON.stringify({ updated: result.updated, end, years }) + "\n");
fs.writeFileSync(WEEKS_OUT, JSON.stringify({ updated: result.updated, weeks: weeksHistory }) + "\n");
console.log(`已更新：${mode === "week" ? `週票房 ${start}～${end}` : `累計（近 8 週上映，截至 ${end}）`}，前 ${result.list.length} 名；年度排行 ${Object.entries(years).map(([y, l]) => `${y}:${l.length}`).join(" ")}`);
for (const f of result.list.slice(0, 10)) console.log(f.rank, f.name, f.week ?? "", f.total);
