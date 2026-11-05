// 平台介面：資料層（core.ts）只透過這裡碰網路、解析器執行環境與儲存，
// 讓同一份資料層可以同時給 Scriptable 版（src/main.tsx）和 Scripting 版（scripting/）使用。

export interface Platform {
  /** 下載網頁文字 */
  fetchText(url: string, headers: Record<string, string>): Promise<{ status: number; body: string }>;
  /** 在隱藏的 WebView 執行一段 JavaScript 函式本體（內含 return），回傳字串 */
  runInWebView(body: string): Promise<string>;
  /** 使用者設定（會跟著 iCloud／App 同步） */
  loadSettingsJSON(): Promise<string | null>;
  saveSettingsJSON(json: string): void;
  /** 本機快取 */
  cacheGet(name: string): string | null;
  cacheSet(name: string, value: string): void;
  /** 圖片快取：已抓到手機上的圖，回傳畫面可以直接用的來源（Scriptable 是 data: 網址、Scripting 是檔案路徑），沒有就回傳 null */
  cachedImage(url: string): string | null;
  /** 把圖片抓到手機快取（已有就直接回傳），失敗回傳 null */
  cacheImage(url: string): Promise<string | null>;
}

let current: Platform | null = null;

export function setPlatform(p: Platform): void {
  current = p;
}

export function platform(): Platform {
  if (!current) throw new Error("platform 尚未設定");
  return current;
}
