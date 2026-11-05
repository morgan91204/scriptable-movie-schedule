// Scripting 實作：fetch、WebViewController、Storage（皆為 Scripting 全域 API）
import type { Platform } from "./platform"

declare const WebViewController: any
declare const Storage: any
declare const FileManager: any
declare const Path: any

let web: any = null

// ── 圖片快取：存在 Documents/movie-cache/<網址雜湊>.jpg，畫面用 Image 的 filePath 顯示
const hash = (s: string) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h.toString(16)
}
const imgDir = () => Path.join(FileManager.documentsDirectory, "movie-cache")
const imgPath = (url: string) => Path.join(imgDir(), hash(url) + ".jpg")
const imgJobs: Record<string, Promise<string | null>> = {}
let pruned = false
/** 清掉 14 天以上沒更新的圖（每次執行只做一次） */
async function pruneImages() {
  if (pruned) return
  pruned = true
  try {
    const dir = imgDir()
    for (const n of (await FileManager.readDirectory(dir)) as string[]) {
      const p = String(n).startsWith("/") ? String(n) : Path.join(dir, n)
      const st = await FileManager.stat(p)
      const t = Number(st?.modificationDate) || 0
      const ms = t > 1e12 ? t : t * 1000 // 秒或毫秒都接受
      if (ms && Date.now() - ms > 14 * 86400e3) await FileManager.remove(p)
    }
  } catch (_) {}
}
function cachedImage(url: string): string | null {
  try {
    const p = imgPath(url)
    return FileManager.existsSync(p) ? p : null
  } catch (_) {
    return null
  }
}

export const scriptingPlatform: Platform = {
  async fetchText(url, headers) {
    const r = await fetch(url, { headers, timeout: 20 } as any)
    return { status: r.status, body: await r.text() }
  },
  async runInWebView(body) {
    if (!web) {
      web = new WebViewController()
      await web.loadHTML("<html><body></body></html>", "https://twshowtimes.com/")
    }
    // Scripting 的 evaluateJavaScript 需要用 return 回傳值，body 本身就有 return
    return await web.evaluateJavaScript(body)
  },
  async loadSettingsJSON() {
    return Storage.get("settings") ?? null
  },
  saveSettingsJSON(json) {
    Storage.set("settings", json)
  },
  cacheGet(name) {
    return Storage.get("cache:" + name) ?? null
  },
  cacheSet(name, value) {
    Storage.set("cache:" + name, value)
  },
  cachedImage,
  cacheImage(url) {
    return (imgJobs[url] ||= (async () => {
      const hit = cachedImage(url)
      if (hit) return hit
      await FileManager.createDirectory(imgDir(), true)
      pruneImages()
      const r = await fetch(url, { timeout: 20 } as any)
      if (r.status !== 200) return null
      const d = await r.data()
      await FileManager.writeAsData(imgPath(url), d)
      return cachedImage(url)
    })().catch(() => null))
  },
}
