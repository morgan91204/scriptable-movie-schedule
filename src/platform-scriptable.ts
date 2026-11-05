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
};
