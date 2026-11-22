// 電影行程網頁版：靜態網頁（public/）＋ 抓時刻表用的轉發
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

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/api/fetch" && req.method === "POST") return proxy(req, ctx);
    if (url.pathname === "/app.js") {
      return new Response(APP_JS, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-cache" } });
    }
    const page = PAGES[url.pathname.replace(/\/+$/, "")];
    if (page && req.method === "GET") return new Response(page, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600" } });
    return env.ASSETS.fetch(req);
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
