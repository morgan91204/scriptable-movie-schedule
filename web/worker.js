// 片刻網頁版：靜態網頁（public/、pages/，全部打包在這支 Worker 裡）＋ 抓時刻表用的轉發
// 瀏覽器不能直接讀其他網站（跨網域限制），所以由這裡代抓，只允許電影相關網站、只允許 GET。
const ALLOW = [
  "twshowtimes.com", "atmovies.com.tw", "eslite.com", "spot.org.tw", "spot-hs.org.tw", "luxcinema.com.tw",
  "themoviedb.org", "imdb.com", "media-imdb.com", "rottentomatoes.com", "youtube.com", "github.io",
];
// 影城官網多半是 .tw 網域
const allowed = (host) => host.endsWith(".tw") || ALLOW.some((d) => host === d || host.endsWith("." + d));
const PASS_HEADERS = ["accept", "accept-language", "authorization", "content-type", "x-requested-with", "referer"];
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8" } });

// App 本體（public/app.js）打包在 Worker 裡，不走靜態檔上傳：每次發佈只要上傳這支 Worker 就會更新
import APP_JS from "./public/app.js.txt";
// 「關於」與「隱私權政策」兩個靜態頁也一樣打包進來（原始檔在 pages/）
import ABOUT_HTML from "./pages/about.html.txt";
import PRIVACY_HTML from "./pages/privacy.html.txt";
const PAGES = { "/about": ABOUT_HTML, "/privacy": PRIVACY_HTML };
// 首頁、圖示、manifest 也打包進來，整個網站就是這一支 Worker
import INDEX_HTML from "./public/index.html";
import MANIFEST from "./public/manifest.webmanifest";
import ICON_180 from "./public/icon-180.png";
import ICON_192 from "./public/icon-192.png";
import ICON_512 from "./public/icon-512.png";
// 收藏電影通知：背景接收程式（sw.js）與推送（push.js）
import SW_JS from "./public/sw.js.txt";
import { handlePush, runPush, PushHub, handleSync } from "./push.js";
export { PushHub };
const FILES = {
  "/": [INDEX_HTML, "text/html; charset=utf-8", "no-cache"],
  "/index.html": [INDEX_HTML, "text/html; charset=utf-8", "no-cache"],
  "/manifest.webmanifest": [MANIFEST, "application/manifest+json; charset=utf-8", "public, max-age=3600"],
  "/icon-180.png": [ICON_180, "image/png", "public, max-age=86400"],
  "/icon-192.png": [ICON_192, "image/png", "public, max-age=86400"],
  "/icon-512.png": [ICON_512, "image/png", "public, max-age=86400"],
};

// 目前上線的版本號（從打包進來的 App 本體裡取）：網頁版用它判斷「重新整理後會不會拿到更新的版本」
const DEPLOYED = (APP_JS.match(/"(\d{4}\.\d{2}\.\d{2}-\d{4})"/) || [])[1] || "";

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/api/version") return new Response(JSON.stringify({ version: DEPLOYED }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    if (url.pathname === "/api/fetch" && req.method === "POST") return proxy(req, ctx);
    if (url.pathname.startsWith("/api/push/")) return handlePush(req, env, url.pathname);
    if (url.pathname.startsWith("/api/sync/")) return handleSync(req, env, url.pathname);
    // Google 登入完會回到這裡，身分憑證放在網址的 # 後面（不會送到伺服器）：原封不動帶回首頁，由網頁自己處理
    if (url.pathname === "/api/auth/google") return new Response('<!doctype html><meta charset="utf-8"><title>片刻</title><script>location.replace("/"+location.hash)</script>', { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    if (url.pathname === "/sw.js") return new Response(SW_JS, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-cache", "service-worker-allowed": "/" } });
    if (url.pathname === "/app.js") {
      return new Response(APP_JS, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-cache" } });
    }
    const page = PAGES[url.pathname.replace(/\/+$/, "")];
    if (page && req.method === "GET") return new Response(page, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600" } });
    const f = FILES[url.pathname];
    if (f) return new Response(f[0], { headers: { "content-type": f[1], "cache-control": f[2] } });
    return new Response("找不到這個頁面", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
  // 每小時一次：檢查收藏電影有沒有新動態，有就推通知（見 push.js）
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runPush(env).catch(() => null));
  },
};

async function proxy(req, ctx) {
  let b;
  try {
    b = await req.json();
  } catch (_) {
    return json({ error: "bad json" }, 400);
  }
  let target;
  try {
    target = new URL(b.url);
  } catch (_) {
    return json({ error: "bad url" }, 400);
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") return json({ error: "bad url" }, 400);
  if (!allowed(target.hostname)) return json({ error: "host not allowed" }, 403);

  const headers = new Headers({ "user-agent": UA });
  for (const [k, v] of Object.entries(b.headers || {})) {
    if (PASS_HEADERS.includes(k.toLowerCase()) && typeof v === "string") headers.set(k, v);
  }
  // 沒帶金鑰的請求在邊緣快取 5 分鐘，同一份時刻表不用每個人都重抓
  const cacheable = !headers.has("authorization");
  const cache = caches.default;
  const key = new Request("https://cache.local/" + encodeURIComponent(target.href));
  if (cacheable) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  let status = 502, body = "";
  try {
    const r = await fetch(target.href, { headers, redirect: "follow", cf: { cacheTtl: 0 } });
    status = r.status;
    body = await r.text();
  } catch (_) {}
  const res = new Response(JSON.stringify({ status, body }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
  });
  if (cacheable && status === 200) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
