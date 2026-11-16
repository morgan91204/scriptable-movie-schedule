// Scripting 實作：fetch、WebViewController、Storage（皆為 Scripting 全域 API）
import type { Platform } from "./platform"

declare const WebViewController: any
declare const Storage: any
declare const FileManager: any
declare const Path: any
declare const UIImage: any
declare const Data: any
declare function setTimeout(fn: () => void, ms: number): any

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

// ── 海報快取：存在 Documents/movie-cache2/<網址雜湊>.jpg（300 像素寬的縮圖）。
// 這次執行內，縮圖資料也記在記憶體（memData），畫面每次都從記憶體解碼一張新的 UIImage，不靠檔案系統；
// 檔案只給下次打開 App 用。下載一次最多 4 張、失敗自動重試 2 次，不會因為同時太多張而逾時缺圖。
const hash = (s: string) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h.toString(16)
}
const imgDir = () => Path.join(FileManager.documentsDirectory, "movie-cache2")
const OLD_DIR = () => Path.join(FileManager.documentsDirectory, "movie-cache") // 舊版存的原圖，一律清掉
const THUMB_W = 300
const imgPath = (url: string) => Path.join(imgDir(), hash(url) + ".jpg")
const sleepMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// 存檔時間自己記（檔案系統回傳的時間單位不一定，拿來判斷過期會誤刪剛存好的圖）
const INDEX = "cache:img-index.json"
const readIndex = (): Record<string, number> => {
  try {
    return JSON.parse(asText(Storage.get(INDEX)) || "{}") || {}
  } catch (_) {
    return {}
  }
}
let pruned = false
/** 清掉 14 天以上沒更新的圖（每次執行只做一次；只看自己記的存檔時間） */
async function pruneImages() {
  if (pruned) return
  pruned = true
  try {
    if (FileManager.existsSync(OLD_DIR())) await FileManager.remove(OLD_DIR())
  } catch (_) {}
  try {
    const idx = readIndex()
    let changed = false
    for (const [h, at] of Object.entries(idx)) {
      if (Date.now() - at < 14 * 86400e3) continue
      try {
        const p = Path.join(imgDir(), h + ".jpg")
        if (FileManager.existsSync(p)) await FileManager.remove(p)
      } catch (_) {}
      delete idx[h]
      changed = true
    }
    if (changed) Storage.set(INDEX, JSON.stringify(idx))
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

const memData: Record<string, any> = {} // 這次執行內的縮圖資料（Data）
const posterErr: Record<string, string> = {} // 最後一次讀不到的原因（給畫面診斷用）
/** 海報讀不到的原因（沒失敗回傳空字串） */
export function posterError(url: string): string {
  return posterErr[url] || ""
}
/** 縮圖資料 → 新的 UIImage（解不開回傳 null） */
function decode(d: any): any {
  try {
    const ui = d ? UIImage.fromData(d) : null
    return ui && ui.width > 0 ? ui : null
  } catch (_) {
    return null
  }
}

/** 海報圖（同步）：記憶體或手機快取有就解碼一張新的 UIImage 給畫面用；沒有回傳 null */
export function posterImageNow(url: string): any {
  if (!url) return null
  if (memData[url]) {
    const ui = decode(memData[url])
    if (ui) return ui
    delete memData[url]
  }
  const p = cachedImage(url)
  if (!p) return null
  let d: any = null
  try {
    d = Data.fromFile(p)
  } catch (_) {}
  const ui = decode(d)
  if (ui) {
    memData[url] = d
    return ui
  }
  try {
    FileManager.removeSync(p) // 壞檔：刪掉，下次重抓
  } catch (_) {}
  return null
}

// 同時最多下載 4 張
let active = 0
const waiting: (() => void)[] = []
async function slot<T>(fn: () => Promise<T>): Promise<T> {
  while (active >= 4) await new Promise<void>((r) => waiting.push(r))
  active++
  try {
    return await fn()
  } finally {
    active--
    const next = waiting.shift()
    if (next) next()
  }
}

/** 下載海報、確認是圖片、縮成縮圖（失敗重試 2 次）；回傳縮圖資料 */
async function fetchPosterData(url: string): Promise<any> {
  let last = "讀取失敗"
  for (let i = 0; i < 3; i++) {
    if (i) await sleepMs(800 * i)
    try {
      const r = await fetch(url, { timeout: 25 } as any)
      if (r.status !== 200) {
        last = "HTTP " + r.status
        if (r.status === 404) break
        continue
      }
      const d = await r.data()
      const img = UIImage.fromData(d)
      if (!img || !(img.width > 0)) {
        last = "下載到的不是圖片"
        break
      }
      const thumb = img.width > THUMB_W ? img.preparingThumbnail({ width: THUMB_W, height: Math.round((img.height * THUMB_W) / img.width) }) : null
      return (thumb && thumb.toJPEGData(0.85)) || d
    } catch (e) {
      last = String((e as Error)?.message || e).slice(0, 40) || "連線失敗"
    }
  }
  throw new Error(last)
}

/** 存進手機快取（盡量；失敗也不影響這次顯示） */
async function saveData(url: string, d: any) {
  try {
    await FileManager.createDirectory(imgDir(), true)
    pruneImages()
    const p = imgPath(url)
    const tmp = p + ".tmp"
    await FileManager.writeAsData(tmp, d)
    try {
      if (FileManager.existsSync(p)) await FileManager.remove(p)
      await FileManager.rename(tmp, p)
    } catch (_) {
      await FileManager.writeAsData(p, d) // 不支援改名：直接寫
    }
    const idx = readIndex()
    idx[hash(url)] = Date.now()
    Storage.set(INDEX, JSON.stringify(idx))
  } catch (_) {}
}

/** 確保這張海報的縮圖資料在記憶體（畫面與背景預抓共用同一個下載，不會重複抓）；成功回傳 true */
const dlJobs: Record<string, Promise<boolean>> = {}
function ensurePoster(url: string): Promise<boolean> {
  if (!url) return Promise.resolve(false)
  if (memData[url] || posterImageNow(url)) return Promise.resolve(true)
  return (dlJobs[url] ||= slot(() => fetchPosterData(url))
    .then(async (d) => {
      memData[url] = d
      delete posterErr[url]
      await saveData(url, d)
      return true
    })
    .catch((e) => {
      posterErr[url] = String((e as Error)?.message || e)
      return false
    })
    .then((ok) => {
      delete dlJobs[url] // 不記住結果：失敗的下次再試
      return ok
    }))
}

/** 海報圖（非同步）：記憶體／快取 → 下載縮圖。不用 Image 的 imageUrl（列表重畫時系統會中斷下載，當成失敗） */
export async function loadPosterImage(url: string): Promise<any> {
  return (await ensurePoster(url)) ? posterImageNow(url) : null
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
    return ensurePoster(url).then((ok) => (ok ? cachedImage(url) || url : null))
  },
}
