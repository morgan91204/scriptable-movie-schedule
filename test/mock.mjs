// 在 Node 裡模擬 Scriptable 環境，用真實網路資料跑一遍完整流程。
import { DOMParser } from "linkedom";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = process.env.SCR_HOME || fs.mkdtempSync(path.join(os.tmpdir(), "scr-"));
fs.mkdirSync(path.join(tmp, "docs"), { recursive: true });
export const log = [];
export const saved = [];
export const alertQueue = []; // { index, text }

globalThis.args = { shortcutParameter: process.env.SC_PARAM || null, urls: [], plainTexts: [] };
globalThis.Script = { complete() {} };
globalThis.Timer = { schedule(ms, rep, cb) { return setTimeout(cb, ms); } };
// 台北 101 附近
globalThis.Location = { setAccuracyToHundredMeters() {}, async current() { return { latitude: 25.0339, longitude: 121.5645 }; } };
globalThis.ShareSheet = { async present(items) { log.push("ShareSheet:\n" + items.join("\n")); return {}; } };
globalThis.Safari = { open(u) { log.push("Safari.open " + u); } };
globalThis.Color = class { constructor(hex) { this.hex = hex; } };
globalThis.Font = { boldSystemFont: (n) => ({ bold: n }), systemFont: (n) => ({ size: n }) };

globalThis.Request = class {
  constructor(url) { this.url = url; this.headers = {}; this.response = null; }
  loadString() {
    // 樂聲官網只接受台灣 IP：測試時改讀從瀏覽器擷取的 fixture
    const lux = this.url.match(/luxcinema\.com\.tw\/web\/(2020\.php\?type=ShowTimes|2020-movie_item\.php\?film_id=(\d+))/);
    if (lux) {
      this.response = { statusCode: 200 };
      const dir = new URL("./fixtures/", import.meta.url);
      if (!lux[2]) return Promise.resolve(fs.readFileSync(new URL("lux.html", dir), "utf8"));
      const [rt, rating] = JSON.parse(fs.readFileSync(new URL("lux-details.json", dir), "utf8"))[lux[2]] || [0, ""];
      return Promise.resolve(`<html><body>長度 | ${rt} min 級別 | ${rating}</body></html>`);
    }
    return new Promise((res, rej) => {
      execFile("curl", ["-sS", "-m", "25", "-A", this.headers["User-Agent"] || "x", ...Object.entries(this.headers).filter(([k]) => k !== "User-Agent").flatMap(([k, v]) => ["-H", `${k}: ${v}`]), "-w", "\n__CODE__%{http_code}", this.url],
        { maxBuffer: 20e6 }, (err, out) => {
          if (err) return rej(err);
          const i = out.lastIndexOf("\n__CODE__");
          this.response = { statusCode: Number(out.slice(i + 9)) };
          res(out.slice(0, i));
        });
    });
  }
};

// WebView：區分「解析用」(evaluateJavaScript 帶 DOMParser 程式) 與「畫面用」(__render / __pending)
let screenHtml = "", pendingResolve = null, dismissUI = null;
globalThis.WebView = class {
  async loadHTML() {}
  present() { return new Promise((r) => (dismissUI = r)); }
  async evaluateJavaScript(js, cb) {
    if (js.startsWith("window.__render(")) { const m = js.match(/^window\.__render\(([\s\S]*),(-?\d+)\);true$/); screenHtml = JSON.parse(m[1]); globalThis.__scrollTo = Number(m[2]); globalThis.__keep = m[2] === "-1"; return true; }
    if (js.startsWith("window.__pending=")) return new Promise((r) => (pendingResolve = r));
    return new Function("DOMParser", "return " + js)(DOMParser);
  }
};
globalThis.Alert = class {
  constructor() { this.fields = []; this.actions = []; }
  addTextField(p, t) { const f = { value: t || "", setNumberPadKeyboard() {} }; this.fields.push(f); return f; }
  addAction(a) { this.actions.push(a); }
  addCancelAction() {}
  async presentAlert() {
    const a = alertQueue.shift() || { index: 0 };
    log.push(`Alert「${this.title}」→ ${a.index < 0 ? "取消" : this.actions[a.index]}${a.text !== undefined ? "（輸入 " + a.text + "）" : ""}`);
    if (a.text !== undefined && this.fields[0]) this.fields[0].value = a.text;
    return a.index;
  }
  textFieldValue(i) { return this.fields[i].value; }
};

globalThis.Calendar = {
  async defaultForEvents() { return { title: "行事曆", allowsContentModifications: true }; },
  async forEventsByTitle(t) { return { title: t, allowsContentModifications: true }; },
  async forEvents() { return [{ title: "行事曆", allowsContentModifications: true }, { title: "電影", allowsContentModifications: true }, { title: "台灣假日", allowsContentModifications: false }]; },
};
globalThis.CalendarEvent = class {
  static async between() { return []; }
  save() { saved.push(this); }
  async presentEdit() { log.push("presentEdit"); return this; }
};

const fm = {
  documentsDirectory: () => path.join(tmp, "docs"),
  cacheDirectory: () => { fs.mkdirSync(path.join(tmp, "cache"), { recursive: true }); return path.join(tmp, "cache"); },
  joinPath: (a, b) => path.join(a, b),
  fileExists: (p) => fs.existsSync(p),
  createDirectory: (p) => fs.mkdirSync(p, { recursive: true }),
  readString: (p) => fs.readFileSync(p, "utf8"),
  writeString: (p, s) => fs.writeFileSync(p, s),
  downloadFileFromiCloud: async () => {},
};
globalThis.FileManager = { iCloud: () => fm, local: () => fm };

// ── 測試用的操作函式 ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function screen() {
  const doc = new DOMParser().parseFromString("<html><body>" + screenHtml + "</body></html>", "text/html");
  const els = [...doc.querySelectorAll("*")].filter((e) => /^(DIV|BUTTON|H2|P|INPUT|SPAN)$/.test(e.tagName));
  return { doc, acts: [...doc.querySelectorAll("[data-act]")].map((e) => ({ id: e.getAttribute("data-act"), text: e.textContent.replace(/\s+/g, " ").trim() })) };
}
let shot = 0;
export async function dump(label) {
  for (let i = 0; i < 600 && (!screenHtml || /spinner/.test(screenHtml)); i++) await sleep(100);
  if (process.env.SHOTS) { fs.mkdirSync(process.env.SHOTS, { recursive: true }); fs.writeFileSync(path.join(process.env.SHOTS, `${String(++shot).padStart(2, "0")}-${label.replace(/[\/:]/g, "_")}.html`), screenHtml); }
  const { doc } = screen();
  console.log(`\n── ${label} ──`);
  const title = doc.querySelector(".bar-title");
  if (title) console.log("  ［" + title.textContent.replace(/\s+/g, " ").trim() + "］");
  for (const e of doc.querySelectorAll(".poster")) console.log("    [海報] " + e.getAttribute("src"));
  for (const e of doc.querySelectorAll(".item, .chip, .btn, .note, .empty, .sec-title, input, .hero-line, .trailer"))
    console.log((e.hasAttribute("data-act") ? "  • " : "    ") + (e.tagName === "INPUT" ? `[輸入框 ${e.getAttribute("name")}=${e.getAttribute("value") || ""}]` : e.textContent.replace(/\s+/g, " ").trim()).slice(0, 110));
}
export async function waitFor(re, ms = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (pendingResolve && !/spinner/.test(screenHtml)) {
      const hit = screen().acts.find((a) => re.test(a.text));
      if (hit) return hit;
    }
    await sleep(100);
  }
  await dump("逾時，目前畫面");
  throw new Error("等不到：" + re);
}
export async function tap(re, vals = {}, y = 0) {
  const hit = await waitFor(re);
  console.log(`\n👉 點「${hit.text.slice(0, 60)}」${Object.keys(vals).length ? " 輸入 " + JSON.stringify(vals) : ""}`);
  const r = pendingResolve; pendingResolve = null;
  r(JSON.stringify({ id: hit.id, vals, y }));
  await sleep(50);
}
export function closeUI() { if (dismissUI) dismissUI(); }
