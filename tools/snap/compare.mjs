// 用法：node compare.mjs <舊檔> <新檔>  比對兩份場次通快照，數新增與消失的場次（只看舊快照當時還沒開演的）
import fs from "node:fs";
const [pa, pb] = process.argv.slice(2); const a = JSON.parse(fs.readFileSync(pa)), b = JSON.parse(fs.readFileSync(pb));
const tpe = (t) => new Date(t + 8 * 3600e3).toISOString().slice(5, 16).replace("T", " ");
console.log("舊快照", tpe(a.updated), "→ 新快照", tpe(b.updated), "（台灣時間），相隔", ((b.updated - a.updated) / 3600e3).toFixed(1), "小時");
const set = (d) => { const s = new Set(); for (const m of d.movies) for (const v of m.versions) for (const t of v.times) s.add(m.title + "｜" + v.label + "｜" + t); return s; };
const stat = {}; const ex = [];
for (const id in a.days) for (const date in a.days[id]) {
  const n = b.days[id] && b.days[id][date]; if (!n) continue;
  const A = set(a.days[id][date]), B = set(n);
  const add = [...B].filter((x) => !A.has(x)), del = [...A].filter((x) => !B.has(x));
  const st = (stat[date] ||= { pages: 0, changed: 0, shows: 0, add: 0, del: 0 });
  st.pages++; st.shows += A.size; st.add += add.length; st.del += del.length;
  if (add.length || del.length) { st.changed++; ex.push(`${date} ${id}：+${add.length} −${del.length}　${add.slice(0, 2).map((x) => "加 " + x).concat(del.slice(0, 2).map((x) => "減 " + x)).join("；")}`); }
}
for (const d of Object.keys(stat).sort()) { const s = stat[d]; console.log(`${d}：比對 ${s.pages} 間、${s.shows} 場；有變動的 ${s.changed} 間；新增 ${s.add} 場（${(s.add / s.shows * 100).toFixed(2)}%）、消失 ${s.del} 場（${(s.del / s.shows * 100).toFixed(2)}%）`); }
console.log(ex.slice(0, 20).join("\n"));
