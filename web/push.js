// 收藏電影通知（Web Push）：使用者在設定開啟後，瀏覽器會給一組「推送位址」，連同他開啟通知的那幾部片存在這裡；
// 每小時檢查一次（見 worker.js 的 scheduled），條件成立就推一則通知：
//   open  開放場次了：片單上出現這部片（之前沒有）
//   rel   上映了：這部片開始有「今天」的場次
//   end   快下檔了：曾經有十間以上的影城在放，現在剩三間以下
//   fest  影展開始了：收藏的影展片所屬的影展到了開始日
// 判斷用的資料是伺服器排程整理好的 notify.json（data 分支，見 tools/notify.mjs），這裡不自己讀影城網站。
// 存的東西只有：推送位址與金鑰（瀏覽器產生的，對應不到個人）、要通知的片名、通知種類、哪些通知已經發過。
// 推送本身照 Web Push 標準：內容用對方瀏覽器的公鑰加密（RFC 8291 aes128gcm），用我們的 VAPID 金鑰簽名（RFC 8292）。

export const VAPID_PUBLIC = "BDfhQ0EgMXZddvvO-aD_W2j2HfsITHXglfhaXNOJH0Xw8BYnKnhUSHwM5NUj1M1lISXr-d6V6WPFNKDfMVVddNk";
const SUBJECT = "https://app.twmovietime.workers.dev/about/"; // 推送服務出問題時可以找到我們的地方
const NOTIFY_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/notify.json";
// 只接受各家瀏覽器的推送服務，其他網址一律不送（不讓這個端點被拿去打別的網站）
const PUSH_HOSTS = [/\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/, /^android\.googleapis\.com$/];
const KINDS = ["open", "rel", "end", "fest"];

const enc = new TextEncoder();
const b64u = (buf) => { let s = ""; for (const b of new Uint8Array(buf)) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64u = (s) => Uint8Array.from(atob(String(s).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const cat = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}

/** 把通知內容加密成推送服務要的格式（RFC 8291，aes128gcm）。p256dh、auth 是對方瀏覽器給的公鑰與驗證碼 */
export async function encryptPayload(text, p256dh, auth) {
  const ua = unb64u(p256dh), authSecret = unb64u(auth);
  const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, pair.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, cat(enc.encode("WebPush: info\0"), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const body = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, cat(enc.encode(text), new Uint8Array([2])))); // 結尾的 2 = 最後一段
  const head = new Uint8Array(21);
  head.set(salt, 0);
  new DataView(head.buffer).setUint32(16, 4096);
  head[20] = asPub.length;
  return cat(head, asPub, body);
}
/** VAPID 簽名（RFC 8292）：告訴推送服務「這則是我們這個網站送的」。私鑰只存在 Worker 的密鑰 VAPID_JWK 裡 */
async function vapidHeader(endpoint, env) {
  const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_JWK), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const part = (o) => b64u(enc.encode(JSON.stringify(o)));
  const unsigned = part({ typ: "JWT", alg: "ES256" }) + "." + part({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUBJECT });
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(unsigned));
  return `vapid t=${unsigned}.${b64u(sig)}, k=${VAPID_PUBLIC}`;
}
/** 送一則通知；回傳推送服務的狀態碼（404、410 = 這個位址已經失效，要刪掉） */
async function send(sub, note, env) {
  const body = await encryptPayload(JSON.stringify(note), sub.keys.p256dh, sub.keys.auth);
  const r = await fetch(sub.endpoint, {
    method: "POST",
    headers: { "content-encoding": "aes128gcm", "content-type": "application/octet-stream", ttl: "86400", urgency: "normal", authorization: await vapidHeader(sub.endpoint, env) },
    body,
  });
  return r.status;
}

const okEndpoint = (u) => { try { const x = new URL(u); return x.protocol === "https:" && PUSH_HOSTS.some((re) => re.test(x.hostname)); } catch (_) { return false; } };
const idOf = async (endpoint) => b64u(await crypto.subtle.digest("SHA-256", enc.encode(endpoint))).slice(0, 32);
const todayTPE = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const hourTPE = () => new Date(Date.now() + 8 * 3600e3).getUTCHours();

/** 「快下檔」的設定：剩下幾間以下（max）、算哪些影城（scope：all 全台／city 指定的縣市，可以好幾個／fav 收藏影城／mix 縣市加上收藏影城，兩邊合起來算） */
function endConfig(raw) {
  const max = Math.min(30, Math.max(1, Math.round(Number(raw && raw.max) || 3)));
  const scope = raw && (raw.scope === "city" || raw.scope === "fav" || raw.scope === "mix") ? raw.scope : "all";
  const cities = scope === "city" || scope === "mix" ? (Array.isArray(raw.cities) ? raw.cities : []).slice(0, 25).map((c) => String(c).slice(0, 12)).filter(Boolean) : [];
  const cinemas = scope === "fav" || scope === "mix" ? (Array.isArray(raw.cinemas) ? raw.cinemas : []).slice(0, 80).map((c) => String(c).slice(0, 60)).filter(Boolean) : [];
  return { max, scope, cities, cinemas };
}
/** 這部片今天在「使用者選的範圍」裡有幾間影城放映；資料不夠判斷（片單上沒有、或沒有各影城的明細）回傳 null */
function countIn(m, cfg, data) {
  if (!m || m.s !== 1) return null;
  if (cfg.scope === "all") return m.c;
  if (!Array.isArray(m.i) || !Array.isArray(data.cs)) return null;
  return m.i.filter((x) => cfg.cities.indexOf((data.cc || [])[x]) >= 0 || cfg.cinemas.indexOf(data.cs[x]) >= 0).length; // 縣市和收藏影城合起來算（同一間不重複）
}
/** 現在這部片的各種條件成不成立（data = notify.json；mark = 這部片的紀錄，hi 是看過最多的影城數）。
 *  快下檔：在選的範圍裡，放映的影城曾經比門檻多、現在降到門檻以下（一開始就很少的片不會通知） */
function conditions(fav, data, cfg, mark) {
  const m = data.movies ? data.movies[fav.key] : null;
  const f = fav.fest && data.fests ? data.fests[fav.fest.id] : null;
  const n = countIn(m, cfg, data);
  return {
    open: !!m,
    rel: !!m && m.s === 1,
    end: n !== null && !!mark && (mark.hi || 0) > cfg.max && n <= cfg.max,
    fest: !!f && f.start <= todayTPE(),
    m, f, n,
  };
}
function message(kind, fav, c, cfg) {
  const t = `《${fav.title}》`;
  if (kind === "open") return { title: `${t}開放場次了`, body: "已經可以查場次，點這裡看哪些影城有放。" };
  if (kind === "rel") return { title: `${t}上映了`, body: c.m && c.m.c ? `今天有 ${c.m.c} 間影城放映，點這裡找場次。` : "點這裡找場次。" };
  if (kind === "end") {
    const cityText = cfg.cities.length > 2 ? `${cfg.cities.slice(0, 2).join("、")}等 ${cfg.cities.length} 個縣市` : cfg.cities.join("、");
    const where = cfg.scope === "city" ? cityText : cfg.scope === "fav" ? "你收藏的影城" : cfg.scope === "mix" ? `${cityText}和你收藏的影城` : "全台";
    return { title: `${t}快下檔了`, body: c.n > 0 ? `${where}只剩 ${c.n} 間影城還有場次，想看要把握。` : `${where}今天已經沒有場次了。` };
  }
  return { title: `${(c.f && c.f.name) || (fav.fest && fav.fest.name) || "影展"}開始了`, body: `你收藏的${t}在這個影展放映，點這裡看場次。` };
}

/** 所有訂閱都存在這一個 Durable Object 裡（人數不多；每筆一個鍵） */
export class PushHub {
  constructor(state, env) { this.state = state; this.env = env; this.data = null; this.dataAt = 0; }
  async notifyData() {
    if (this.data && Date.now() - this.dataAt < 10 * 60e3) return this.data;
    const r = await fetch(NOTIFY_URL + "?t=" + Math.floor(Date.now() / 600e3));
    if (!r.ok) throw new Error("notify.json " + r.status);
    this.data = await r.json();
    this.dataAt = Date.now();
    return this.data;
  }
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (path === "/run") return json(await this.run());
    let b;
    try { b = await req.json(); } catch (_) { return json({ error: "bad json" }, 400); }
    const endpoint = String((b.subscription && b.subscription.endpoint) || b.endpoint || "");
    if (!okEndpoint(endpoint) || endpoint.length > 1000) return json({ error: "bad endpoint" }, 400);
    const id = "s:" + (await idOf(endpoint));
    if (path === "/unsubscribe") { await this.state.storage.delete(id); return json({ ok: true }); }
    if (path === "/test") {
      const sub = await this.state.storage.get(id);
      if (!sub) return json({ error: "not subscribed" }, 404);
      const status = await send(sub, { title: "電影行程的通知設定好了", body: "收藏電影有新動態時，會像這樣通知你。", tag: "test", url: "/" }, this.env).catch(() => 0);
      if (status === 404 || status === 410) await this.state.storage.delete(id);
      return json({ ok: status >= 200 && status < 300, status });
    }
    if (path !== "/subscribe") return json({ error: "not found" }, 404);
    const keys = (b.subscription && b.subscription.keys) || {};
    if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string" || keys.p256dh.length > 200 || keys.auth.length > 100) return json({ error: "bad keys" }, 400);
    const prefs = {};
    for (const k of KINDS) prefs[k] = !!(b.prefs && b.prefs[k]);
    const favs = (Array.isArray(b.favs) ? b.favs : []).slice(0, 200).map((f) => ({
      key: String((f && f.key) || "").slice(0, 120),
      title: String((f && f.title) || "").slice(0, 120),
      ...(f && f.fest && f.fest.id ? { fest: { id: String(f.fest.id).slice(0, 40), name: String(f.fest.name || "").slice(0, 60) } } : {}),
    })).filter((f) => f.key && f.title);
    // 已經成立的條件先記成「發過了」：只有之後才發生的變化才通知（剛收藏一部已經上映的片，不會馬上跳「上映了」）
    const old = (await this.state.storage.get(id)) || {};
    const data = await this.notifyData().catch(() => ({}));
    const endCfg = endConfig(b.endCfg);
    const cfgChanged = JSON.stringify(old.endCfg || null) !== JSON.stringify(endCfg); // 門檻或範圍改了：「快下檔」重新算起
    const sent = {};
    for (const f of favs) {
      const c = conditions(f, data, endCfg, null);
      const prevMark = old.sent && old.sent[f.key];
      sent[f.key] = prevMark ? (cfgChanged ? { ...prevMark, end: false, hi: c.n || 0 } : prevMark) : { open: c.open, rel: c.rel, end: false, fest: c.fest, hi: c.n || 0 };
    }
    await this.state.storage.put(id, { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, prefs, endCfg, favs, sent, at: Date.now() });
    return json({ ok: true, count: favs.length });
  }
  /** 每小時跑一次：條件新成立、使用者有開那一種通知、還沒發過 → 推送。晚上十點到早上九點不吵人（留到早上再發） */
  async run() {
    const h = hourTPE();
    if (!this.env.PUSH_ANY_HOUR && (h < 9 || h >= 22)) return { skipped: "quiet hours" }; // PUSH_ANY_HOUR 只有測試時設
    const data = await this.notifyData();
    if (!data || !data.movies || Date.now() - (data.updated || 0) > 6 * 3600e3) return { skipped: "stale data" }; // 資料太舊（排程停了）就不判斷，免得誤報
    const subs = await this.state.storage.list({ prefix: "s:" });
    let sentCount = 0, gone = 0;
    for (const [id, sub] of subs) {
      let changed = false, budget = 4; // 一個人一次最多四則
      const cfg = endConfig(sub.endCfg);
      for (const fav of sub.favs || []) {
        const mark = (sub.sent[fav.key] ||= { open: false, rel: false, end: false, fest: false, hi: 0 });
        const c = conditions(fav, data, cfg, mark);
        if (c.n !== null && c.n > (mark.hi || 0)) { mark.hi = c.n; changed = true; } // 記下看過最多的影城數
        // 一出現就已經在上映的片：只發「上映了」，不重複發「開放場次了」
        const order = c.rel && !mark.rel ? ["rel", "end", "fest"] : ["open", "end", "fest"];
        if (c.rel && !mark.rel && !mark.open) { mark.open = true; changed = true; }
        for (const kind of order) {
          if (!c[kind] || mark[kind]) continue;
          if (!sub.prefs[kind]) { mark[kind] = true; changed = true; continue; } // 沒開這一種：記成處理過，之後才開也不會補發舊的
          if (budget <= 0) continue;
          const msg = message(kind, fav, c, cfg);
          const status = await send(sub, { ...msg, tag: `${kind}:${fav.key}`, url: "/?fav=1" }, this.env).catch(() => 0);
          if (status === 404 || status === 410) { await this.state.storage.delete(id); gone++; budget = -1; changed = false; break; }
          if (status >= 200 && status < 300) { mark[kind] = true; changed = true; budget--; sentCount++; }
        }
        if (budget < 0) break;
      }
      if (changed) await this.state.storage.put(id, sub);
    }
    return { subs: subs.size, sent: sentCount, gone };
  }
}

/** worker.js 把 /api/push/* 交給這裡 */
export async function handlePush(req, env, path) {
  if (path === "/api/push/key") return json({ key: VAPID_PUBLIC });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (Number(req.headers.get("content-length") || 0) > 60000) return json({ error: "too large" }, 413);
  const hub = env.PUSH.get(env.PUSH.idFromName("hub"));
  return hub.fetch(new Request("https://hub" + path.replace("/api/push", ""), { method: "POST", body: await req.text(), headers: { "content-type": "application/json" } }));
}
export async function runPush(env) {
  const hub = env.PUSH.get(env.PUSH.idFromName("hub"));
  return (await hub.fetch(new Request("https://hub/run", { method: "POST", body: "{}" }))).json();
}
