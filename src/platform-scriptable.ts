// Scriptable 實作：Request、WebView、FileManager
import type { Platform } from "./platform";

function settingsFile(): { fm: FileManager; path: string } {
  let fm: FileManager;
  try {
    fm = FileManager.iCloud();
    fm.documentsDirectory();
  } catch (_) {
    fm = FileManager.local();
  }
  const dir = fm.joinPath(fm.documentsDirectory(), "電影行程");
  if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
  return { fm, path: fm.joinPath(dir, "設定.json") };
}

let web: WebView | null = null;

// ── 圖片快取：存在 Scriptable 的 cache 資料夾（movie-thumb2-<網址雜湊>.jpg）。
// 存之前先確認真的是圖片、縮成 300 像素寬的縮圖，再一次寫好（先寫暫存檔再改名），不會留下半張圖。
// 畫面用 data: 網址顯示：WebView 用 HTML 字串載入時，iOS 常常不准讀 file:// 本機檔，切換頁面後海報會變空白。
const IMG_PREFIX = "movie-thumb2-";
const OLD_PREFIX = "movie-img-"; // 舊版存的原圖（file:// 顯示用），一律清掉
const THUMB_W = 300;
const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
};
const imgPath = (url: string) => {
  const fm = FileManager.local();
  return fm.joinPath(fm.cacheDirectory(), IMG_PREFIX + hash(url) + ".jpg");
};
const imgJobs: Record<string, Promise<string | null>> = {};
let pruned = false;
/** 清掉 14 天以上沒更新的圖（每次執行只做一次） */
function pruneImages() {
  if (pruned) return;
  pruned = true;
  try {
    const fm = FileManager.local();
    const dir = fm.cacheDirectory();
    for (const n of fm.listContents(dir)) {
      const p = fm.joinPath(dir, n);
      if (n.startsWith(OLD_PREFIX)) fm.remove(p);
      else if (n.startsWith(IMG_PREFIX) && Date.now() - fm.modificationDate(p).getTime() > 14 * 86400e3) fm.remove(p);
    }
  } catch (_) {}
}
/** base64 開頭判斷是不是圖片（JPEG／PNG／GIF／WebP） */
const isImageB64 = (b64: string) => /^(\/9j\/|iVBOR|R0lGOD|UklGR)/.test(b64);
/** 讀過的縮圖 data: 網址記在記憶體，重畫時不用再讀檔 */
const dataUrlMem: Record<string, string> = {};
function cachedImage(url: string): string | null {
  if (dataUrlMem[url]) return dataUrlMem[url];
  try {
    const fm = FileManager.local();
    const p = imgPath(url);
    if (!fm.fileExists(p)) return null;
    const b64 = fm.read(p).toBase64String();
    if (!b64 || b64.length < 200 || !isImageB64(b64)) {
      fm.remove(p); // 壞檔：刪掉，下次重抓
      return null;
    }
    return (dataUrlMem[url] = (b64.startsWith("iVBOR") ? "data:image/png;base64," : "data:image/jpeg;base64,") + b64);
  } catch (_) {
    return null;
  }
}
/** 縮成 THUMB_W 寬的 JPEG（縮圖失敗就用原圖） */
function toThumb(d: Data): Data {
  try {
    const img = Image.fromData(d);
    if (!img || !img.size.width) return d;
    if (img.size.width <= THUMB_W) return d;
    const w = THUMB_W;
    const h = Math.round((img.size.height * w) / img.size.width);
    const ctx = new DrawContext();
    ctx.size = new Size(w, h);
    ctx.respectScreenScale = false;
    ctx.opaque = true;
    ctx.drawImageInRect(img, new Rect(0, 0, w, h));
    return Data.fromJPEG(ctx.getImage()) || d;
  } catch (_) {
    return d;
  }
}

export const scriptablePlatform: Platform = {
  async fetchText(url, headers, opts) {
    const r = new Request(url);
    r.headers = headers;
    r.timeoutInterval = 20;
    if (opts?.method) r.method = opts.method;
    if (opts?.body !== undefined) r.body = opts.body;
    const body = await r.loadString();
    return { status: (r.response && (r.response as any).statusCode) || 200, body };
  },
  async runInWebView(body) {
    if (!web) {
      web = new WebView();
      await web.loadHTML("<html><body></body></html>", "https://twshowtimes.com/");
    }
    // Scriptable 的 evaluateJavaScript 回傳最後一個運算式的值，所以包成 IIFE
    return await web.evaluateJavaScript(`(function(){${body}\n})()`, false);
  },
  async loadSettingsJSON() {
    try {
      const { fm, path } = settingsFile();
      if (!fm.fileExists(path)) return null;
      await fm.downloadFileFromiCloud(path);
      return fm.readString(path);
    } catch (_) {
      return null;
    }
  },
  saveSettingsJSON(json) {
    try {
      const { fm, path } = settingsFile();
      fm.writeString(path, json);
    } catch (_) {}
  },
  cacheGet(name) {
    try {
      const fm = FileManager.local();
      const p = fm.joinPath(fm.cacheDirectory(), "movie-" + name);
      return fm.fileExists(p) ? fm.readString(p) : null;
    } catch (_) {
      return null;
    }
  },
  cacheSet(name, value) {
    try {
      const fm = FileManager.local();
      fm.writeString(fm.joinPath(fm.cacheDirectory(), "movie-" + name), value);
    } catch (_) {}
  },
  cachedImage,
  cacheImage(url) {
    return (imgJobs[url] ||= (async () => {
      pruneImages();
      const hit = cachedImage(url);
      if (hit) return hit;
      const r = new Request(url);
      r.timeoutInterval = 20;
      const d = await r.load();
      const status = (r.response && (r.response as any).statusCode) || 200;
      if (status !== 200 || !d) return null;
      const b64 = d.toBase64String();
      if (b64.length < 200 || !isImageB64(b64)) return null; // 不是圖片（例如被轉到首頁的 HTML）：不存
      const fm = FileManager.local();
      const p = imgPath(url);
      const tmp = p + ".tmp";
      fm.write(tmp, toThumb(d));
      if (fm.fileExists(p)) fm.remove(p);
      fm.move(tmp, p);
      return cachedImage(url);
    })().catch(() => null));
  },
};
