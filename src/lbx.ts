// 從 Letterboxd 匯入：讀使用者自己從 Letterboxd 下載的匯出檔（Settings → Data → Export Your Data 的那個 .zip，或裡面的幾個 .csv）。
// 檔案只在使用者的瀏覽器裡解開、讀取，不上傳；之後只把「片名、年份」拿去對照台灣片名，使用者確認後才把要匯入的那幾筆送出。
// 匯出檔的格式（2026/11 實際看過的）：
//   ratings.csv  Date,Name,Year,Letterboxd URI,Rating                              （Rating 是 0.5～5 顆星）
//   diary.csv    Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
//   reviews.csv  Date,Name,Year,Letterboxd URI,Rating,Rewatch,Review,Tags,Watched Date
//   watched.csv  Date,Name,Year,Letterboxd URI
// 同一部片在不同檔案裡的網址不一樣（一個是片、一個是那一筆日記），所以用「片名＋年份」併在一起。
// 壓縮檔裡還有 likes/、deleted/、orphaned/ 這些資料夾，裡面有同名的檔案（按過愛心的、刪掉的），那些不讀。

export interface LbxItem {
  name: string; // Letterboxd 上的片名（多半是英文）
  year: string; // 首映年
  s: number; // 換算成 1～10 分（半顆星 = 1 分）；0 = 沒評分
  seen: string; // 觀影日期 YYYY-MM-DD；"?" = 標記看過但沒記日期
  x: string; // 影評（原文，可能很長、有換行）
}

/** 讀 CSV：欄位可以用雙引號包起來，裡面可以有逗號、換行，"" 代表一個引號 */
export function parseCsv(text: string): string[][] {
  const s = String(text || "").replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

/** 解開 .zip 裡指定的幾個檔案（只支援沒壓縮和 deflate 兩種，Letterboxd 的匯出檔就是這兩種）。回傳 路徑 → 內容 */
export async function unzip(buf: ArrayBuffer, want: (path: string) => boolean): Promise<Record<string, Uint8Array>> {
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  // 檔案目錄在最後面：從尾巴往回找「目錄結束」的記號
  let end = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { end = i; break; }
  if (end < 0) throw new Error("這不是 zip 檔");
  const count = dv.getUint16(end + 10, true);
  let p = dv.getUint32(end + 16, true);
  const dec = new (globalThis as any).TextDecoder();
  const out: Record<string, Uint8Array> = {};
  for (let n = 0; n < count && p + 46 <= u8.length; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), commentLen = dv.getUint16(p + 32, true), local = dv.getUint32(p + 42, true);
    const path = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (!want(path) || usize > 30e6 || local + 30 > u8.length) continue;
    const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    const raw = u8.subarray(start, start + csize);
    if (method === 0) out[path] = raw;
    else if (method === 8) {
      const DS = (globalThis as any).DecompressionStream;
      if (!DS) throw new Error("這個瀏覽器解不開壓縮檔，請先自己解壓縮，再選裡面的 csv 檔");
      const stream = new (globalThis as any).Blob([raw]).stream().pipeThrough(new DS("deflate-raw"));
      out[path] = new Uint8Array(await new (globalThis as any).Response(stream).arrayBuffer());
    }
  }
  return out;
}

const WANT = ["ratings.csv", "diary.csv", "reviews.csv", "watched.csv"];
/** 這個路徑是不是要讀的那四個檔案之一（在 likes/、deleted/、orphaned/、lists/ 或 Mac 壓縮時多出來的 __MACOSX 裡的不算） */
const wanted = (path: string): string => {
  const parts = path.split("/"), file = parts[parts.length - 1].toLowerCase();
  if (WANT.indexOf(file) < 0 || /^\._/.test(file)) return "";
  if (parts.slice(0, -1).some((d) => /^(likes|deleted|orphaned|lists|__MACOSX)$/i.test(d))) return "";
  return file;
};

/** 0.5～5 顆星 → 1～10 分 */
const toScore = (stars: string): number => { const n = Math.round(Number(stars) * 2); return n >= 1 && n <= 10 ? n : 0; };
const okDate = (d: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "");

/** 把使用者選的檔案（一個 .zip，或幾個 .csv）整理成一部片一筆。同一部片有好幾筆日記的話：分數用 ratings.csv 的（那是目前的評分），
 *  觀影日期和影評用最新的那一筆 */
export async function readLetterboxd(files: { name: string; data: ArrayBuffer }[]): Promise<LbxItem[]> {
  const texts: Record<string, string> = {};
  const dec = new (globalThis as any).TextDecoder();
  for (const f of files) {
    if (/\.zip$/i.test(f.name)) {
      const got = await unzip(f.data, (p) => !!wanted(p));
      // 同名的取路徑最短的那個（最外層的）
      for (const path of Object.keys(got).sort((a, b) => a.length - b.length)) { const k = wanted(path); if (k && !(k in texts)) texts[k] = dec.decode(got[path]); }
    } else { const k = wanted(f.name); if (k) texts[k] = dec.decode(new Uint8Array(f.data)); }
  }
  if (!Object.keys(texts).length) throw new Error("裡面找不到 Letterboxd 的資料（ratings.csv、diary.csv、reviews.csv、watched.csv）。請選 Letterboxd 匯出的那個 zip 檔。");
  const table = (file: string): Record<string, string>[] => {
    const rows = parseCsv(texts[file] || "");
    if (rows.length < 2) return [];
    const head = rows[0].map((h) => h.trim().toLowerCase());
    return rows.slice(1).map((r) => { const o: Record<string, string> = {}; head.forEach((h, i) => { o[h] = (r[i] || "").trim(); }); return o; }).filter((o) => o.name);
  };
  const items = new Map<string, LbxItem & { at: string }>();
  const get = (r: Record<string, string>) => {
    const key = r.name.toLowerCase() + "|" + (r.year || "");
    let it = items.get(key);
    if (!it) items.set(key, (it = { name: r.name, year: /^\d{4}$/.test(r.year || "") ? r.year : "", s: 0, seen: "", x: "", at: "" }));
    return it;
  };
  for (const r of table("watched.csv")) { const it = get(r); if (!it.seen) it.seen = "?"; }
  // 日記、影評：照記錄的時間從舊到新讀，後面的蓋掉前面的
  const byDate = (a: Record<string, string>, b: Record<string, string>) => (a["watched date"] || a.date || "").localeCompare(b["watched date"] || b.date || "");
  for (const r of table("diary.csv").sort(byDate)) { const it = get(r); const d = okDate(r["watched date"]); if (d) it.seen = d; else if (!it.seen) it.seen = "?"; if (toScore(r.rating)) it.s = toScore(r.rating); }
  for (const r of table("reviews.csv").sort(byDate)) { const it = get(r); const d = okDate(r["watched date"]); if (d) it.seen = d; else if (!it.seen) it.seen = "?"; if (toScore(r.rating)) it.s = toScore(r.rating); if (r.review) it.x = r.review; }
  for (const r of table("ratings.csv")) { const it = get(r); if (toScore(r.rating)) it.s = toScore(r.rating); if (!it.seen) it.seen = "?"; it.at = r.date || ""; }
  return Array.from(items.values())
    .sort((a, b) => (b.seen === "?" ? "" : b.seen).localeCompare(a.seen === "?" ? "" : a.seen) || a.name.localeCompare(b.name))
    .map(({ at: _at, ...it }) => it);
}

/** 匯入的影評最多留幾個字（比一般短評的 140 字寬，伺服器也是這個數字） */
export const LBX_NOTE_MAX = 500;
/** 影評放進片刻的短評：換行併成空白；超過上限就截掉、結尾加「…」。回傳 { x, cut } （cut = 有沒有被截） */
export function lbxNote(review: string, max: number): { x: string; cut: boolean } {
  const flat = String(review || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(); // Letterboxd 的影評可以有 <i>、<b> 這類標記：拿掉
  const chars = Array.from(flat);
  return chars.length <= max ? { x: flat, cut: false } : { x: chars.slice(0, max - 1).join("") + "…", cut: true };
}
