// Scripting 實作：fetch、WebViewController、Storage（皆為 Scripting 全域 API）
import type { Platform } from "./platform"

declare const WebViewController: any
declare const Storage: any

let web: any = null

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
}
