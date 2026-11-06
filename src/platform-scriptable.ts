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
/** 快取圖的 file:// 網址：畫面的 WebView 以 cache 資料夾為 baseURL 載入，所以可以直接顯示本機檔 */
function cachedImage(url: string): string | null {
  try {
    const p = imgPath(url);
    return FileManager.local().fileExists(p) ? "file://" + p : null;
  } catch (_) {
    return null;
  }
}
/** 圖片快取資料夾的 file:// 網址（給 WebView 當 baseURL） */
export function imageCacheBaseUrl(): string {
  return "file://" + FileManager.local().cacheDirectory() + "/";
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
      if (d.toBase64String().length < 100) return null; // 空檔不算
      FileManager.local().write(imgPath(url), d);
      return cachedImage(url);
    })().catch(() => null));
  },
};
