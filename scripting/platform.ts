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
}

let current: Platform | null = null;

export function setPlatform(p: Platform): void {
  current = p;
}

export function platform(): Platform {
  if (!current) throw new Error("platform 尚未設定");
  return current;
}
