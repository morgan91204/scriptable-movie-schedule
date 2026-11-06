// Scripting 實作：fetch、WebViewController、Storage（皆為 Scripting 全域 API）
import type { Platform } from "./platform"

declare const WebViewController: any
declare const Storage: any
declare const FileManager: any
declare const Path: any

let web: any = null

// ── 設定：同時存三處，任何一處被清掉（例如重新匯入、自動更新換掉腳本資料夾，腳本私有儲存區變成空的）都能救回來
//   1. 腳本私有儲存區（原本的位置）
//   2. Scripting 文件夾裡的檔案：電影行程/設定.json（不跟著腳本走，更新不會被換掉）
//   3. 共用儲存區（以 movie-schedule. 開頭的鍵）
const KEEP_DIR = () => Path.join(FileManager.documentsDirectory, "電影行程")
const keepFile = (name: string) => Path.join(KEEP_DIR(), name)
const SHARED_SETTINGS = "movie-schedule.settings"
/** Storage 可能回傳字串以外的型別：一律轉成字串 */
const asText = (v: any): string | null => (v === null || v === undefined || v === "" ? null : typeof v === "string" ? v : JSON.stringify(v))
const validJSON = (t: string | null): t is string => {
  if (!t) return false
  try {
    const o = JSON.parse(t)
    return !!o && typeof o === "object"
  } catch (_) {
    return false
  }
}
function readKeep(name: string): string | null {
  try {
    const p = keepFile(name)
    return FileManager.existsSync(p) ? FileManager.readAsStringSync(p) : null
  } catch (_) {
    return null
  }
}
function writeKeep(name: string, text: string) {
  try {
    FileManager.createDirectorySync(KEEP_DIR(), true)
  } catch (_) {}
  try {
    FileManager.writeAsStringSync(keepFile(name), text)
  } catch (_) {}
}

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
  async fetchText(url, headers, opts) {
    const r = await fetch(url, { headers, timeout: 20, method: opts?.method || "GET", body: opts?.body } as any)
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
    const candidates = [asText(Storage.get("settings")), readKeep("設定.json"), asText(Storage.get(SHARED_SETTINGS, { shared: true }))]
    const found = candidates.find(validJSON) || null
    // 有一處是空的就補回去，下次被清掉也還有備份
    if (found) {
      if (!validJSON(candidates[0])) Storage.set("settings", found)
      if (!validJSON(candidates[1])) writeKeep("設定.json", found)
      if (!validJSON(candidates[2])) Storage.set(SHARED_SETTINGS, found, { shared: true })
    }
    return found
  },
  saveSettingsJSON(json) {
    Storage.set("settings", json)
    writeKeep("設定.json", json) // 同步寫檔：馬上關掉 App 也不會遺失
    Storage.set(SHARED_SETTINGS, json, { shared: true })
  },
  cacheGet(name) {
    const v = asText(Storage.get("cache:" + name))
    // 觀眾評分的裝置代號也要保住，不然更新後會變成新手機、可以再投一票
    if (!v && name === "device-id.txt") return readKeep("device-id.txt")
    return v
  },
  cacheSet(name, value) {
    Storage.set("cache:" + name, value)
    if (name === "device-id.txt") writeKeep("device-id.txt", value)
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
