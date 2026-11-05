// 產生 src/geo.ts：每間影城的經緯度（附近影城排序用）。
// 地址：場次通影城頁 JSON-LD、開眼內建清單、專屬來源的固定地址；座標：OpenStreetMap Nominatim（每秒 1 次，遵守使用規範）。
// 用法：node tools/geocode.mjs   （已有座標的影城會沿用，只查新的）
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const UA = "movie-schedule-geocoder (github.com/morgan91204/scriptable-movie-schedule)";
const get = (url) => execFileSync("curl", ["-sS", "-m", "30", "-A", UA, url], { maxBuffer: 20e6 }).toString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const old = fs.existsSync("src/geo.ts") ? JSON.parse(fs.readFileSync("src/geo.ts", "utf8").match(/GEO[^=]*=\s*(\{[\s\S]*\});/)[1].replace(/,\s*\}$/, "}")) : {};
const list = [];
// 場次通
const idx = get("https://twshowtimes.com/cinemas/");
const ids = [...new Set([...idx.matchAll(/href="\/cinemas\/([a-z0-9-]+)\/"/g)].map((m) => m[1]))];
for (const id of ids) {
  if (old[id]) { list.push({ id }); continue; }
  const h = get(`https://twshowtimes.com/cinemas/${id}/`);
  const ld = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => { try { return JSON.parse(m[1]); } catch { return {}; } }).find((o) => o["@type"] === "MovieTheater") || {};
  list.push({ id, name: ld.name, address: ld.address?.streetAddress });
}
// 開眼內建清單、專屬來源
const at = fs.readFileSync("src/at-list.ts", "utf8");
for (const m of at.matchAll(/\["(t\w+)", "a\d\d", "([^"]+)", "([^"]+)"\]/g)) list.push({ id: "at-" + m[1], name: m[2], address: m[3] });
const core = fs.readFileSync("src/core.ts", "utf8");
for (const m of core.matchAll(/id: "([a-z-]+)",\s*name: "([^"]+)",[\s\S]*?address: "([^"]+)"/g)) list.push({ id: m[1], name: m[2], address: m[3] });

const inTW = (lat, lon) => lat > 21.8 && lat < 26.5 && lon > 118 && lon < 122.2;
async function geocode(q) {
  await sleep(1100);
  try {
    const r = JSON.parse(get(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tw&q=${encodeURIComponent(q)}`));
    if (r[0] && inTW(+r[0].lat, +r[0].lon)) return [+(+r[0].lat).toFixed(5), +(+r[0].lon).toFixed(5)];
  } catch {}
  return null;
}
const out = { ...old };
for (const c of list) {
  if (out[c.id] || !c.address && !c.name) continue;
  const addr = (c.address || "").replace(/臺/g, "台").replace(/\(.*?\)|（.*?）/g, "").replace(/(\d+號).*$/, "$1");
  const tries = [addr, addr.replace(/(\d+)巷\d+號$/, "$1巷").replace(/\d+號$/, ""), c.name, c.name && c.name.replace(/影城|戲院|電影院|影院/, "")].filter(Boolean);
  let pos = null;
  for (const q of tries) if ((pos = await geocode(q))) break;
  if (pos) out[c.id] = pos;
  console.log(pos ? "✓" : "✗", c.id, c.name || "", addr, pos || "");
}
const keys = Object.keys(out).sort();
fs.writeFileSync("src/geo.ts",
  "// 自動產生：node tools/geocode.mjs（資料 © OpenStreetMap contributors）\n// 影城經緯度 [lat, lng]，附近影城排序用；沒有座標的影城會排在最後\n" +
  "export const GEO: Record<string, [number, number]> = " + JSON.stringify(Object.fromEntries(keys.map((k) => [k, out[k]])), null, 0).replace(/\],"/g, '],\n  "').replace(/^\{/, "{\n  ").replace(/\}$/, ",\n}") + ";\n");
console.log("done", keys.length, "/", list.length);
