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

// ── 圖片快取：存在 Scriptable 的 cache 資料夾（movie-img-<網址雜湊>.jpg），畫面用 data: 網址顯示
const IMG_PREFIX = "movie-img-";
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
      if (!n.startsWith(IMG_PREFIX)) continue;
      const p = fm.joinPath(dir, n);
      if (Date.now() - fm.modificationDate(p).getTime() > 14 * 86400e3) fm.remove(p);
    }
  } catch (_) {}
}
function cachedImage(url: string): string | null {
  try {
    const fm = FileManager.local();
    const p = imgPath(url);
    if (!fm.fileExists(p)) return null;
    const b64 = fm.read(p).toBase64String();
    if (!b64) return null;
    return (b64.startsWith("iVBOR") ? "data:image/png;base64," : "data:image/jpeg;base64,") + b64;
  } catch (_) {
    return null;
  }
}

export const scriptablePlatform: Platform = {
  async fetchText(url, headers) {
    const r = new Request(url);
    r.headers = headers;
    r.timeoutInterval = 20;
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
      FileManager.local().write(imgPath(url), d);
      return cachedImage(url);
    })().catch(() => null));
  },
};
