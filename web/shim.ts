// 網頁版：用瀏覽器 API 模擬 Scriptable 的全域物件，讓 src/main.tsx 不用改就能在瀏覽器跑。
// 行事曆改成下載 .ics 檔；網路經過同網域的 /api/fetch（web/worker.js）轉發，避開跨網域限制。
import type { Platform } from "../src/platform";

const g = globalThis as any;

// 「加到主畫面」：Android／電腦的 Chrome、Edge 會給一個可以直接跳出安裝視窗的事件，先收起來，等使用者按按鈕再用。
// iPhone 的 Safari 沒有這個事件，只能教使用者從分享選單加（見 main.tsx 的 installView）
g.__installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  g.__installPrompt = e;
});
window.addEventListener("appinstalled", () => {
  g.__installPrompt = null;
  g.__installed = true;
});
const LS = "movie-schedule:";

function store(key: string): string | null {
  try {
    return localStorage.getItem(LS + key);
  } catch (_) {
    return null;
  }
}
function storeSet(key: string, value: string) {
  try {
    localStorage.setItem(LS + key, value);
  } catch (_) {
    // 空間滿了：清掉快取（設定保留）再試一次
    try {
      for (const k of Object.keys(localStorage)) if (k.startsWith(LS + "cache:")) localStorage.removeItem(k);
      localStorage.setItem(LS + key, value);
    } catch (_) {}
  }
}

/** 這些網址本身允許跨網域，直接抓；其他經過自己的 Worker 轉發 */
const DIRECT = /^https:\/\/(raw\.githubusercontent\.com|movie-ratings\.[\w-]+\.workers\.dev)\//; // 評分伺服器（子網域換過，不寫死）

export const webPlatform: Platform = {
  async fetchText(url, headers, opts) {
    const method = opts?.method || "GET";
    if (DIRECT.test(url) || method !== "GET") {
      const r = await fetch(url, { method, body: opts?.body, headers: method === "GET" ? undefined : { "content-type": "application/json" } });
      return { status: r.status, body: await r.text() };
    }
    const r = await fetch("/api/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, headers }),
    });
    if (!r.ok) return { status: r.status, body: "" };
    return await r.json();
  },
  // 本來就在瀏覽器裡，有 DOMParser
  runInWebView: async (body) => new Function(body)(),
  loadSettingsJSON: async () => store("settings"),
  saveSettingsJSON: (json) => storeSet("settings", json),
  cacheGet: (name) => store("cache:" + name),
  cacheSet: (name, value) => storeSet("cache:" + name, value),
  // 圖片交給瀏覽器自己快取
  cachedImage: (url) => url,
  cacheImage: async (url) => url,
};
g.__webPlatform = webPlatform;

// ── Scriptable 全域物件 ──

g.args = { urls: [], plainTexts: [], shortcutParameter: new URLSearchParams(location.search).get("u") || null };
g.Script = { complete() {} };
g.Timer = {
  schedule(ms: number, repeat: boolean, fn: () => void) {
    const id = repeat ? setInterval(fn, ms) : setTimeout(fn, ms);
    return { invalidate: () => (repeat ? clearInterval(id) : clearTimeout(id)) };
  },
};

function openUrl(url: string) {
  // 從非同步流程開新分頁常被擋，被擋就直接換頁
  const w = window.open(url, "_blank", "noopener");
  if (!w) location.href = url;
}
g.Safari = { open: async (url: string) => openUrl(url), openInApp: async (url: string) => openUrl(url) };

g.Pasteboard = {
  copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
  },
  // 瀏覽器不能同步讀剪貼簿，改請使用者貼上
  paste: () => window.prompt("請貼上內容") || "",
};

g.ShareSheet = {
  async present(items: string[]) {
    const text = items.join("\n");
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (_) {}
    }
    await navigator.clipboard?.writeText(text).catch(() => {});
    (window as any).__toast?.("已複製，可以貼給朋友");
  },
};

g.Location = {
  setAccuracyToHundredMeters() {},
  current: () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        reject,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
      ),
    ),
};

// ── 行事曆：下載 .ics ──
const ICS_CAL = { title: "行事曆檔（.ics）", allowsContentModifications: true, identifier: "ics" };
g.Calendar = {
  forEvents: async () => [ICS_CAL],
  forEventsByTitle: async () => ICS_CAL,
  defaultForEvents: async () => ICS_CAL,
};

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m);
/** 每行最多 75 bytes，超過要折行（RFC 5545） */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length;
    if (bytes + b > 73) {
      out.push(cur);
      cur = " ";
      bytes = 1;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n");
}

class CalendarEvent {
  title = "";
  startDate = new Date();
  endDate = new Date();
  location = "";
  notes = "";
  calendar: unknown = ICS_CAL;
  static async between() {
    return [];
  }
  save() {
    this.download();
  }
  async presentEdit() {
    this.download();
  }
  private download() {
    const uid = `${icsDate(this.startDate)}-${Math.random().toString(36).slice(2)}@movie-schedule`;
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//movie-schedule//web//ZH", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:${uid}`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(this.startDate)}`, `DTEND:${icsDate(this.endDate)}`,
      `SUMMARY:${icsText(this.title)}`, `LOCATION:${icsText(this.location)}`, `DESCRIPTION:${icsText(this.notes)}`,
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", `DESCRIPTION:${icsText(this.title)}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${this.title || "電影"}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 60000);
  }
}
g.CalendarEvent = CalendarEvent;

// ── 自動更新：網站上線了新版，就自動重新載入換成新版（不用使用者自己重新整理）。
// 只在「剛開啟」和「從背景切回來」時檢查，不會在操作到一半時突然重載；同一個新版只重載一次，避免出錯時一直重來
declare const APP_VERSION: string;
let lastVersionCheck = 0;
async function autoUpdate() {
  if (Date.now() - lastVersionCheck < 60e3) return;
  lastVersionCheck = Date.now();
  try {
    const r = await fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
    const latest = String((await r.json()).version || "");
    const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;
    if (!latest || num(latest) <= num(APP_VERSION)) return;
    if (sessionStorage.getItem("auto-reloaded") === latest) return;
    sessionStorage.setItem("auto-reloaded", latest);
    location.reload();
  } catch (_) {}
}
autoUpdate();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") autoUpdate(); });
window.addEventListener("pageshow", (e) => { if ((e as PageTransitionEvent).persisted) autoUpdate(); });

// ── 收藏電影通知（Web Push）──
// 狀態：unsupported 這個瀏覽器不支援／needs-install iPhone 要先加到主畫面／denied 使用者在系統設定擋掉了／off 還沒開／on 已開
const pushOK = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const standalone = () => (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || (navigator as any).standalone === true;
const keyBytes = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const post = (path: string, body: unknown) => fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
let pushState = "off";
function logDB(): Promise<IDBDatabase> {
  return new Promise((ok, no) => {
    const q = indexedDB.open("notify-log", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("log", { keyPath: "at" });
    q.onsuccess = () => ok(q.result);
    q.onerror = () => no(q.error);
  });
}
async function currentSub(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  return reg ? reg.pushManager.getSubscription() : null;
}
g.__push = {
  state: () => pushState,
  async refresh(): Promise<string> {
    if (!pushOK()) return (pushState = isIOS() && !standalone() ? "needs-install" : "unsupported");
    if (Notification.permission === "denied") return (pushState = "denied");
    try { pushState = (await currentSub()) ? "on" : "off"; } catch (_) { pushState = "off"; }
    return pushState;
  },
  /** 開啟：要權限（g.__notifyPermission 是按鈕按下的那一刻就先要的，見下面）→ 訂閱 → 把推送位址和要通知的片交給伺服器 */
  async enable(payload: Record<string, unknown>): Promise<string> {
    if (!pushOK()) return this.refresh();
    const perm = await (g.__notifyPermission || Notification.requestPermission());
    g.__notifyPermission = null;
    if (perm !== "granted") return this.refresh();
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const { key } = await fetch("/api/push/key").then((r) => r.json());
    const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
    const r = await post("/api/push/subscribe", { ...payload, subscription: sub.toJSON() });
    if (!r || !r.ok) throw new Error("伺服器沒有收到訂閱，請稍後再試");
    return (pushState = "on");
  },
  /** 收藏或通知種類變了：把最新的清單同步給伺服器（沒開通知就什麼都不做） */
  async sync(payload: Record<string, unknown>): Promise<void> {
    if (!pushOK() || pushState !== "on") return;
    const sub = await currentSub();
    if (sub) await post("/api/push/subscribe", { ...payload, subscription: sub.toJSON() }).catch(() => null);
  },
  async disable(): Promise<string> {
    if (!pushOK()) return pushState;
    const sub = await currentSub();
    if (sub) {
      await post("/api/push/unsubscribe", { endpoint: sub.endpoint }).catch(() => null); // 伺服器上的資料一起刪掉
      await sub.unsubscribe().catch(() => false);
    }
    return (pushState = "off");
  },
  /** 這台裝置收過的通知（背景程式 sw.js 收到時記下來的），新的在前 */
  async log(): Promise<{ at: number; title: string; body: string; tag: string; url: string }[]> {
    try {
      const db = await logDB();
      const list = await new Promise<any[]>((ok) => { const q = db.transaction("log").objectStore("log").getAll(); q.onsuccess = () => ok(q.result || []); q.onerror = () => ok([]); });
      db.close();
      return list.sort((a, b) => b.at - a.at);
    } catch (_) { return []; }
  },
  async clearLog(): Promise<void> {
    try { const db = await logDB(); await new Promise<void>((ok) => { const tx = db.transaction("log", "readwrite"); tx.objectStore("log").clear(); tx.oncomplete = tx.onerror = () => ok(); }); db.close(); } catch (_) {}
  },
  async test(): Promise<boolean> {
    const sub = pushOK() ? await currentSub() : null;
    if (!sub) return false;
    const r = await post("/api/push/test", { endpoint: sub.endpoint }).catch(() => null);
    return !!(r && r.ok);
  },
};
// 要通知權限一定要在「使用者按下去的那一刻」：按鈕帶 data-perm="notify" 的，在點擊事件裡就先要（App 的處理流程晚一步才跑，Safari 會當成不是使用者要求的）
document.addEventListener("click", (e) => {
  const el = (e.target as Element | null)?.closest?.('[data-perm="notify"]');
  if (el && pushOK() && Notification.permission === "default") g.__notifyPermission = Notification.requestPermission();
}, true);
if (pushOK()) g.__push.refresh();

// ── WebView：畫面直接畫在這一頁 ──
class WebView {
  async loadHTML(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    for (const st of Array.from(doc.querySelectorAll("style"))) document.head.appendChild(st.cloneNode(true));
    document.body.innerHTML = '<div id="root"></div>';
    for (const sc of Array.from(doc.querySelectorAll("script"))) (0, eval)(sc.textContent || "");
  }
  evaluateJavaScript(code: string, useCallback = false): Promise<unknown> {
    if (!useCallback) return Promise.resolve((0, eval)(code));
    return new Promise((resolve) => {
      g.completion = (v: unknown) => resolve(v);
      (0, eval)(code);
    });
  }
  // 網頁不會被「關掉」，永遠不 resolve
  present() {
    return new Promise<void>(() => {});
  }
}
g.WebView = WebView;
