// 全台票房排行：讀國家電影及視聽文化中心「全國電影票房統計」開放資料（政府資料開放授權條款第 1 版），
// 產生 dist/boxoffice.json 給兩個 App 用。官方只提供 2016 年以來的累計票房，
// 所以每週存一份快照（data/boxoffice-snapshot.json），用「這週累計 − 上週累計」算出週票房。
// 用法：node tools/boxoffice.mjs（GitHub Actions 每天跑一次，資料有更新才會改檔）
import fs from "node:fs";

const SRC = "https://boxofficetw.tfai.org.tw/OpenData/statistic/since2016";
const SNAP = "data/boxoffice-snapshot.json";
const OUT = "dist/boxoffice.json";
const TOP = 20;

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
      return { ...f, week: f.total - (b ? b.total : 0), weekTickets: f.tickets - (b ? b.tickets : 0) };
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
    weekTickets: mode === "week" ? f.weekTickets : null,
    total: f.total,
    tickets: f.tickets,
  })),
};

fs.mkdirSync("data", { recursive: true });
// 快照：這週的累計，順便記住上一份（同一週重跑時用）
fs.writeFileSync(SNAP, JSON.stringify({ end, films, prev: base ? { end: base.end, films: base.films } : null }) + "\n");
fs.writeFileSync(OUT, JSON.stringify(result, null, 1) + "\n");
console.log(`已更新：${mode === "week" ? `週票房 ${start}～${end}` : `累計（近 8 週上映，截至 ${end}）`}，前 ${result.list.length} 名`);
for (const f of result.list.slice(0, 10)) console.log(f.rank, f.name, f.week ?? "", f.total);
