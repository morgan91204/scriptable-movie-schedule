// Scripting 實作：fetch、WebViewController、Storage（皆為 Scripting 全域 API）
import type { Platform } from "./platform"

declare const WebViewController: any
declare const Storage: any
declare const FileManager: any
declare const Path: any
declare const UIImage: any

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

// ── 圖片快取：存在 Documents/movie-cache2/<網址雜湊>.jpg。
// 存之前先解碼確認真的是圖片、縮成 300 像素寬，再一次寫好（先寫暫存檔再改名），不會留下半張圖。
// 畫面用 localImage() 先解碼成 UIImage 再顯示；解不開就刪檔並改用網址，不會留空白。
const hash = (s: string) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h.toString(16)
}
const imgDir = () => Path.join(FileManager.documentsDirectory, "movie-cache2")
const OLD_DIR = () => Path.join(FileManager.documentsDirectory, "movie-cache") // 舊版存的原圖，一律清掉
const THUMB_W = 300
const imgPath = (url: string) => Path.join(imgDir(), hash(url) + ".jpg")
const imgJobs: Record<string, Promise<string | null>> = {}
let pruned = false
/** 清掉 14 天以上沒更新的圖（每次執行只做一次） */
async function pruneImages() {
  if (pruned) return
  pruned = true
  try {
    if (FileManager.existsSync(OLD_DIR())) await FileManager.remove(OLD_DIR())
  } catch (_) {}
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

/** 本機快取圖解碼成 UIImage（記在記憶體）；解不開就刪掉壞檔、回傳 null，畫面改用網址 */
const uiMem: Record<string, any> = {}
export function localImage(path: string): any {
  if (uiMem[path]) return uiMem[path]
  try {
    const img = UIImage.fromFile(path)
    if (img && img.width > 0) return (uiMem[path] = img)
  } catch (_) {}
  try {
    FileManager.removeSync(path)
  } catch (_) {}
  return null
}

/** 下載海報並縮成縮圖：回傳畫面可以直接顯示的 UIImage，順便（盡量）存進手機快取 */
const memImg: Record<string, any> = {} // 存檔失敗時的備援：這次執行內記在記憶體
async function downloadPoster(url: string): Promise<any> {
  const r = await fetch(url, { timeout: 20 } as any)
  if (r.status !== 200) return null
  const d = await r.data()
  const img = UIImage.fromData(d)
  if (!img || !(img.width > 0)) return null // 不是圖片（例如被轉到首頁的 HTML）：不存
  const thumb = img.width > THUMB_W ? img.preparingThumbnail({ width: THUMB_W, height: Math.round((img.height * THUMB_W) / img.width) }) : null
  const out = (thumb && thumb.toJPEGData(0.85)) || d
  try {
    await FileManager.createDirectory(imgDir(), true)
    pruneImages()
    const p = imgPath(url)
    const tmp = p + ".tmp"
    await FileManager.writeAsData(tmp, out)
    try {
      if (FileManager.existsSync(p)) await FileManager.remove(p)
      await FileManager.rename(tmp, p)
    } catch (_) {
      await FileManager.writeAsData(p, out) // 不支援改名：直接寫
    }
  } catch (_) {}
  return thumb || img
}

/** 海報圖（同步）：手機快取有就每次重新解碼一張新的 UIImage 給畫面用；沒有回傳 null */
export function posterImageNow(url: string): any {
  if (!url) return null
  const p = cachedImage(url)
  if (p) {
    const ui = localImage(p)
    if (ui) {
      delete uiMem[p] // 不共用同一個物件：每次進畫面都給新的，避免切換頁面後舊的不能再顯示
      return ui
    }
  }
  return memImg[url] || null
}
/** 海報圖（非同步）：快取 → 下載縮圖。全部自己處理，不用 Image 的 imageUrl（列表重畫時系統會中斷下載，當成失敗） */
const posterImgJobs: Record<string, Promise<any>> = {}
export function loadPosterImage(url: string): Promise<any> {
  const now = posterImageNow(url)
  if (now) return Promise.resolve(now)
  return (posterImgJobs[url] ||= (async () => {
    const img = await downloadPoster(url).catch(() => null)
    delete posterImgJobs[url] // 失敗的話下次再試
    if (!img) return null
    return posterImageNow(url) || (memImg[url] = img)
  })())
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
      const img = await downloadPoster(url)
      delete imgJobs[url] // 這次的結果不記住：失敗的下次再試
      return img ? cachedImage(url) : null
    })().catch(() => {
      delete imgJobs[url]
      return null
    }))
  },
}
