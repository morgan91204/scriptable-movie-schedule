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

// 換了新版（程式更新過）：手機上存的資料快取整批丟掉，重新跟伺服器拿。
// 新版常常會多欄位、換格式，舊的快取留著會變成「新畫面配舊資料」。使用者自己的東西（設定、評分用的裝置代號、投過的票）不動。
declare const APP_VERSION: string;
try {
  const verKey = LS + "cache-version";
  if (localStorage.getItem(verKey) !== APP_VERSION) {
    // 不丟的：使用者自己的（評分的裝置代號、投過的票），以及「一部片一部片查出來」的結果（預告、海報、評分、片長）：
    // 這些要重新查很花時間（每部片好幾個請求），而且各自有自己的有效期限和版本檢查，不需要跟著整批清
    const keep = /cache:(device-id\.txt|feedback-|profile-|my-votes|extras\.json|ratings\.json|posters\.json|runtimes\.json|fav-rows\.json)/;
    for (const k of Object.keys(localStorage)) if (k.startsWith(LS + "cache:") && !keep.test(k)) localStorage.removeItem(k);
    localStorage.setItem(verKey, APP_VERSION);
  }
} catch (_) {}

/** 這些網址本身允許跨網域，直接抓；其他經過自己的 Worker 轉發 */
const DIRECT = /^https:\/\/(raw\.githubusercontent\.com|movie-ratings\.[\w-]+\.workers\.dev)\//; // 評分伺服器（子網域換過，不寫死）

// 用量統計用的匿名代號：每天隨機產生一組、隔天就換，只跟著打給自己伺服器（/api/…）的請求送出，讓站長知道「今天大概幾台裝置在用」。
// 跟帳號、評分用的裝置代號都沒有關係，伺服器過了當天只留人數。
const dayTag = (): string => {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const cur = String(localStorage.getItem("ms:day") || "");
    if (cur.slice(0, 10) === day && cur.length > 20) return cur.slice(11);
    const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");
    localStorage.setItem("ms:day", day + ":" + id);
    return id;
  } catch (_) { return ""; }
};
{
  const raw = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const u = typeof input === "string" ? input : "";
    if (u.indexOf("/api/") === 0 || u.indexOf(location.origin + "/api/") === 0) {
      const tag = dayTag();
      if (tag) { const h = new Headers((init && init.headers) || undefined); h.set("x-day", tag); init = { ...(init || {}), headers: h }; }
    }
    return raw(input as any, init);
  }) as typeof fetch;
}

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
        // 最後一項是網址的話另外交給系統（分享到訊息、社群時會變成可以點的連結，有預覽圖）
        const last = items[items.length - 1] || "";
        if (items.length > 1 && /^https?:\/\/\S+$/.test(last)) await navigator.share({ text: items.slice(0, -1).join("\n"), url: last });
        else await navigator.share({ text });
        return;
      } catch (e) {
        if ((e as any)?.name === "AbortError") return; // 使用者自己關掉分享選單：不用再複製
      }
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
let lastVersionCheck = 0;
async function autoUpdate() {
  if (Date.now() - lastVersionCheck < 60e3) return;
  lastVersionCheck = Date.now();
  try {
    // version.json 是靜態檔（不經過 Worker、不算請求額度）；舊的部署沒有這個檔時退回 /api/version
    let r = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) r = await fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
    const latest = String((await r.json()).version || "");
    const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;
    if (!latest || num(latest) <= num(APP_VERSION)) return;
    if (sessionStorage.getItem("auto-reloaded") === latest) return;
    sessionStorage.setItem("auto-reloaded", latest);
    location.reload();
  } catch (_) {}
}
// 剛載入時不用查：首頁每次都是跟伺服器重新拿的，載入的一定是最新版（少一次請求）
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") autoUpdate(); });
window.addEventListener("pageshow", (e) => { if ((e as PageTransitionEvent).persisted) autoUpdate(); });

// ── 用 Google 登入同步設定 ──
// 登入：整頁跳到 Google，回來時身分憑證在網址的 # 後面（不經過伺服器的網址紀錄）；拿它跟我們的伺服器換一張登入憑證存在這台。
const GOOGLE_CLIENT_ID = "591652673833-vluv8bc246871jpv40ijqalpus3tm2ge.apps.googleusercontent.com";
const SY = { token: "ms:sync-token", at: "ms:sync-at", nonce: "ms:sync-nonce", email: "ms:sync-email", name: "ms:sync-name" };
/** 從 Google 的身分憑證裡讀出 email（只留在這台裝置上，給設定頁顯示「現在登入的是哪個帳號」；伺服器不存） */
const claimsOf = (idToken: string): any => {
  try {
    const part = idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(Array.from(atob(part), (ch) => "%" + ch.charCodeAt(0).toString(16).padStart(2, "0")).join(""))) || {};
  } catch (_) { return {}; }
};
const emailOf = (idToken: string): string => { const c = claimsOf(idToken); return c.email && (c.email_verified === true || c.email_verified === "true") ? String(c.email).slice(0, 120) : ""; };
/** Google 帳號的顯示名稱：同樣只留在這台裝置上，第一次取暱稱時預先填進欄位（使用者可以改，按了儲存才算數） */
const nameOf = (idToken: string): string => String(claimsOf(idToken).name || "").slice(0, 60);
const lsGet = (k: string) => { try { return localStorage.getItem(k) || ""; } catch (_) { return ""; } };
const lsSet = (k: string, v: string) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (_) {} };
const syncPost = async (path: string, body: Record<string, unknown>): Promise<any> => {
  const r = await fetch("/api/sync/" + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (r.status === 401 && path !== "login") lsSet(SY.token, ""); // 登入憑證失效（在別台按了「刪除並登出」）
  return r.json();
};
g.__sync = {
  on: () => !!lsGet(SY.token),
  token: () => lsGet(SY.token) || "",
  email: () => (lsGet(SY.token) ? lsGet(SY.email) || "" : ""),
  gname: () => (lsGet(SY.token) ? lsGet(SY.name) || "" : ""),
  at: () => Number(lsGet(SY.at)) || 0,
  setAt: (at: number) => lsSet(SY.at, String(at || "")),
  login(admin?: boolean) {
    const raw = new Uint8Array(16); crypto.getRandomValues(raw);
    const nonce = Array.from(raw).map((x) => x.toString(16).padStart(2, "0")).join("");
    lsSet(SY.nonce, nonce);
    location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: location.origin + "/api/auth/google", response_type: "id_token", scope: "openid email profile", nonce, prompt: "select_account" }).toString();
  },
  /** 剛從 Google 回來的話，把登入完成：回傳 "ok"／"fail"；不是剛回來回傳 "" */
  async finish(): Promise<string> {
    const h = new URLSearchParams(location.hash.replace(/^#/, ""));
    const idToken = h.get("id_token"), err = h.get("error");
    if (!idToken && !err) return "";
    history.replaceState(null, "", location.pathname + location.search); // 憑證不留在網址上
    const nonce = lsGet(SY.nonce);
    lsSet(SY.nonce, "");
    if (!idToken || !nonce) return "fail";
    try {
      const r = await syncPost("login", { id_token: idToken, nonce });
      if (!r || !r.token) return "fail";
      lsSet(SY.token, r.token);
      lsSet(SY.email, emailOf(idToken));
      lsSet(SY.name, nameOf(idToken));
      lsSet(SY.at, "");
      return "ok";
    } catch (_) { return "fail"; }
  },
  async pull(): Promise<{ data: unknown; at: number } | null> {
    if (!lsGet(SY.token)) return null;
    const r = await syncPost("get", { token: lsGet(SY.token) }).catch(() => null);
    return r && r.ok ? { data: r.data, at: r.at || 0 } : null;
  },
  async push(data: unknown): Promise<boolean> {
    if (!lsGet(SY.token)) return false;
    const r = await syncPost("put", { token: lsGet(SY.token), data }).catch(() => null);
    if (r && r.ok) lsSet(SY.at, String(r.at));
    return !!(r && r.ok);
  },
  /** 這張登入憑證是不是管理員的 */
  async who(): Promise<{ admin: boolean } | null> {
    if (!lsGet(SY.token)) return null;
    const r = await syncPost("who", { token: lsGet(SY.token) }).catch(() => null);
    return r && r.ok ? { admin: !!r.admin } : null;
  },
  /** 管理員專區的其他動作：path = "fb"（意見回饋）／"admins"（管理員名單） */
  async adm(path: string, body: Record<string, unknown>): Promise<any> {
    const r = await syncPost(path, { token: lsGet(SY.token), body }).catch(() => null);
    if (!r || !r.ok) throw new Error(r && r.error === "forbidden" ? "這個帳號不是管理員" : (r && r.error) || "管理功能暫時連不上");
    return r;
  },
  /** 管理員專區的動作（不是管理員會被伺服器拒絕） */
  async admin(body: Record<string, unknown>): Promise<any> {
    const r = await syncPost("admin", { token: lsGet(SY.token), body }).catch(() => null);
    if (!r || !r.ok) throw new Error(r && r.error === "forbidden" ? "這個帳號不是管理員" : "管理功能暫時連不上");
    if (r.result && r.result.error) throw new Error("動作沒有完成（" + r.result.error + "）");
    return r.result;
  },
  async logout(): Promise<void> { const t = lsGet(SY.token); lsSet(SY.token, ""); lsSet(SY.email, ""); lsSet(SY.name, ""); lsSet(SY.at, ""); if (t) await syncPost("logout", { token: t }).catch(() => null); },
  async wipe(): Promise<void> { const t = lsGet(SY.token); lsSet(SY.token, ""); lsSet(SY.email, ""); lsSet(SY.name, ""); lsSet(SY.at, ""); if (t) await syncPost("wipe", { token: t }).catch(() => null); },
};

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
    const r = await post("/api/push/subscribe", { ...payload, token: lsGet(SY.token) || "", subscription: sub.toJSON() });
    if (!r || !r.ok) throw new Error("伺服器沒有收到訂閱，請稍後再試");
    return (pushState = "on");
  },
  /** 收藏或通知種類變了：把最新的清單同步給伺服器（沒開通知就什麼都不做） */
  async sync(payload: Record<string, unknown>): Promise<void> {
    if (!pushOK()) return;
    // 剛開機時還不知道這台有沒有開通知（pushState 還是預設的 off）：先查一次，免得開機那次同步被跳過
    if (pushState !== "on") await this.refresh().catch(() => "off");
    if (pushState !== "on") return;
    const sub = await currentSub();
    if (sub) await post("/api/push/subscribe", { ...payload, token: lsGet(SY.token) || "", subscription: sub.toJSON() }).catch(() => null);
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
