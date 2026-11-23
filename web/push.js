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
const KINDS = ["open", "rel", "end", "fest", "favc", "fmt", "pre", "rate", "week", "flist"];
// 跟著收藏的片走的通知（依序判斷）；week、flist 是不用收藏也會發的
const FAV_KINDS = ["open", "rel", "favc", "fmt", "pre", "rate", "end", "fest"];
const FORMATS = ["IMAX", "杜比", "4DX", "MX4D", "ScreenX", "巨幕", "LED", "頂級廳", "3D"];

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
/** 其他細項：特殊廳要哪幾種（fmts）、上映前幾天提醒（preDays）、勿擾時段（quiet）、收藏影城（cinemas，給「收藏影城開始放映」用） */
function optConfig(raw) {
  raw = raw || {};
  const q = raw.quiet || {};
  const hour = (v, d) => (Number.isInteger(v) && v >= 0 && v <= 23 ? v : d);
  return {
    fmts: (Array.isArray(raw.fmts) ? raw.fmts : []).filter((f) => FORMATS.indexOf(f) >= 0),
    preDays: Math.min(14, Math.max(1, Math.round(Number(raw.preDays) || 3))),
    quiet: { on: q.on !== false, from: hour(q.from, 22), to: hour(q.to, 9) },
    cinemas: (Array.isArray(raw.cinemas) ? raw.cinemas : []).slice(0, 80).map((c) => String(c).slice(0, 60)).filter(Boolean),
  };
}
const inQuiet = (q, h) => q.on && q.from !== q.to && (q.from > q.to ? h >= q.from || h < q.to : h >= q.from && h < q.to);
const addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
/** 這部片今天在「使用者選的範圍」裡有幾間影城放映；資料不夠判斷（片單上沒有、或沒有各影城的明細）回傳 null */
function countIn(m, cfg, data) {
  if (!m || m.s !== 1) return null;
  if (cfg.scope === "all") return m.c;
  if (!Array.isArray(m.i) || !Array.isArray(data.cs)) return null;
  return m.i.filter((x) => cfg.cities.indexOf((data.cc || [])[x]) >= 0 || cfg.cinemas.indexOf(data.cs[x]) >= 0).length; // 縣市和收藏影城合起來算（同一間不重複）
}
/** 現在這部片的各種條件成不成立（data = notify.json；mark = 這部片的紀錄，hi 是看過最多的影城數）。
 *  快下檔：在選的範圍裡，放映的影城曾經比門檻多、現在降到門檻以下（一開始就很少的片不會通知） */
function conditions(fav, data, cfg, mark, opt) {
  const m = data.movies ? data.movies[fav.key] : null;
  const f = fav.fest && data.fests ? data.fests[fav.fest.id] : null;
  const n = countIn(m, cfg, data);
  opt = opt || optConfig(null);
  const today = todayTPE();
  const up = data.up ? data.up[fav.key] : null;
  const r = (m && m.r) || (up && up.r) || "";
  // 收藏影城裡，這幾天有這部片場次的
  const favAt = m && Array.isArray(m.j) && Array.isArray(data.cs) ? m.j.map((x) => data.cs[x]).filter((id) => opt.cinemas.indexOf(id) >= 0) : [];
  // 這幾天有場次的特殊廳裡，使用者要的那幾種
  const fmtNow = m && Array.isArray(m.f) ? opt.fmts.filter((x) => m.f.indexOf(x) >= 0) : [];
  const fmtNew = fmtNow.filter((x) => !(mark && Array.isArray(mark.fmt) && mark.fmt.indexOf(x) >= 0));
  return {
    favc: favAt.length > 0, favAt,
    fmt: fmtNew.length > 0, fmtNow, fmtNew,
    pre: !!r && today < r && today >= addDays(r, -opt.preDays), r,
    rate: !!(m && m.g && (m.g.i || typeof m.g.t === "number")),
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
  if (kind === "favc") return { title: `${t}在你收藏的影城有場次了`, body: `你收藏的影城有 ${c.favAt.length} 間排了這部片，點這裡找場次。` };
  if (kind === "fmt") return { title: `${t}有 ${c.fmtNew.join("、")} 場次了`, body: "點這裡看哪些影城有放。" };
  if (kind === "pre") { const d = Math.round((Date.parse(c.r) - Date.parse(todayTPE())) / 864e5); return { title: `${t}${d <= 1 ? "明天" : `再 ${d} 天`}上映`, body: `${Number(c.r.slice(5, 7))}/${Number(c.r.slice(8, 10))} 上映${c.m ? "，已經可以查場次。" : "，戲院還沒排場次。"}` }; }
  if (kind === "rate") { const g = c.m.g; return { title: `${t}有評分了`, body: [g.i ? `IMDb ${g.i}` : "", typeof g.t === "number" ? `番茄 ${g.t}%` : "", typeof g.p === "number" ? `爆米花 ${g.p}%` : ""].filter(Boolean).join("｜") }; }
  return { title: `${(c.f && c.f.name) || (fav.fest && fav.fest.name) || "影展"}開始了`, body: `你收藏的${t}在這個影展放映，點這裡看場次。` };
}

const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
/** 這一週的代號（那一週星期一的日期，台灣時間） */
function weekId() {
  const t = todayTPE(), wd = (new Date(t + "T00:00:00Z").getUTCDay() + 6) % 7;
  return addDays(t, -wd);
}
/** 這一週（週一到週日）上映的片名：已經有場次的排前面 */
function weekFilms(data, today) {
  const from = weekId(), to = addDays(from, 6);
  const a = Object.values(data.movies || {}).filter((m) => m.r && m.r >= from && m.r <= to).sort((x, y) => (y.p || 0) - (x.p || 0)).map((m) => m.t);
  const b = Object.values(data.up || {}).filter((m) => m.r >= from && m.r <= to && !m.a).map((m) => m.t);
  return Array.from(new Set([...a, ...b]));
}
// ── 用 Google 登入同步設定 ──
// 伺服器只存：Google 帳號識別碼的雜湊（u:…）→ 設定；登入憑證的雜湊（t:…）→ 是哪一個帳號。不存 email、姓名、大頭貼。
export const GOOGLE_CLIENT_ID = "591652673833-vluv8bc246871jpv40ijqalpus3tm2ge.apps.googleusercontent.com";
const b64uBytes = (s) => Uint8Array.from(atob(String(s).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const sha256hex = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, "0")).join("");
let googleKeys = null, googleKeysAt = 0;
/** 驗證 Google 給的身分憑證（ID token）：簽章、發給誰（aud）、誰發的（iss）、有沒有過期、nonce；通過就回傳帳號識別碼（sub） */
export async function verifyGoogle(idToken, nonce, fetchKeys) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) throw new Error("bad token");
  const dec = (x) => JSON.parse(new TextDecoder().decode(b64uBytes(x)));
  const head = dec(parts[0]), body = dec(parts[1]);
  if (head.alg !== "RS256") throw new Error("bad alg");
  if (!googleKeys || Date.now() - googleKeysAt > 3600e3) { googleKeys = await (fetchKeys ? fetchKeys() : fetch("https://www.googleapis.com/oauth2/v3/certs").then((r) => r.json())); googleKeysAt = Date.now(); }
  const jwk = ((googleKeys && googleKeys.keys) || []).find((k) => k.kid === head.kid);
  if (!jwk) { googleKeys = null; throw new Error("unknown key"); }
  const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64uBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok) throw new Error("bad signature");
  if (body.aud !== GOOGLE_CLIENT_ID) throw new Error("bad audience");
  if (body.iss !== "https://accounts.google.com" && body.iss !== "accounts.google.com") throw new Error("bad issuer");
  if (!(Number(body.exp) * 1000 > Date.now())) throw new Error("expired");
  if (!nonce || body.nonce !== nonce) throw new Error("bad nonce");
  if (!body.sub) throw new Error("no subject");
  return String(body.sub);
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
    if (path.startsWith("/sync/")) return this.sync(path, b || {});
    const endpoint = String((b.subscription && b.subscription.endpoint) || b.endpoint || "");
    if (!okEndpoint(endpoint) || endpoint.length > 1000) return json({ error: "bad endpoint" }, 400);
    const id = "s:" + (await idOf(endpoint));
    if (path === "/unsubscribe") { await this.state.storage.delete(id); return json({ ok: true }); }
    if (path === "/test") {
      const sub = await this.state.storage.get(id);
      if (!sub) return json({ error: "not subscribed" }, 404);
      const status = await send(sub, { title: "「片刻」的通知設定好了", body: "收藏電影有新動態時，會像這樣通知你。", tag: "test", url: "/" }, this.env).catch(() => 0);
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
    const opt = optConfig(b.opt), oldOpt = optConfig(old.opt);
    const sent = {};
    for (const f of favs) {
      const c = conditions(f, data, endCfg, null, opt);
      const base = { open: c.open, rel: c.rel, end: false, fest: c.fest, hi: c.n || 0, favc: c.favc, fmt: c.fmtNow, pre: c.pre, rate: c.rate };
      const prevMark = old.sent && old.sent[f.key];
      if (!prevMark) { sent[f.key] = base; continue; }
      const mk = { ...prevMark };
      if (cfgChanged) { mk.end = false; mk.hi = c.n || 0; }
      // 新增的通知種類（舊紀錄沒有），或相關設定改了：以現在的狀況為準重新算起，不補發已經成立的
      if (mk.favc === undefined || JSON.stringify(oldOpt.cinemas) !== JSON.stringify(opt.cinemas)) mk.favc = c.favc;
      if (!Array.isArray(mk.fmt) || JSON.stringify(oldOpt.fmts) !== JSON.stringify(opt.fmts)) mk.fmt = c.fmtNow;
      if (mk.pre === undefined || oldOpt.preDays !== opt.preDays) mk.pre = c.pre;
      if (mk.rate === undefined) mk.rate = c.rate;
      sent[f.key] = mk;
    }
    // 不用收藏的通知：現在已經公布片單的影展、這一週的新片摘要都算處理過
    const bc = old.bc || { week: weekId(), fl: Object.fromEntries(Object.keys((data && data.fests) || {}).filter((k) => data.fests[k].n > 0).map((k) => [k, 1])) };
    await this.state.storage.put(id, { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, prefs, endCfg, opt, favs, sent, bc, at: Date.now() });
    return json({ ok: true, count: favs.length });
  }
  /** 同步設定：login 用 Google 的身分憑證換一張登入憑證；get／put 讀寫設定；logout 登出這台；wipe 刪掉伺服器上的設定並登出所有裝置 */
  async sync(path, b) {
    if (path === "/sync/login") {
      let sub;
      try { sub = await verifyGoogle(b.id_token, String(b.nonce || ""), this.env.GOOGLE_KEYS_TEST ? () => JSON.parse(this.env.GOOGLE_KEYS_TEST) : null); } catch (e) { return json({ error: "登入沒有通過驗證" }, 401); }
      const uid = await sha256hex("片刻|" + sub);
      const raw = new Uint8Array(32); crypto.getRandomValues(raw);
      const token = Array.from(raw).map((x) => x.toString(16).padStart(2, "0")).join("");
      await this.state.storage.put("t:" + (await sha256hex(token)), { uid, at: Date.now() });
      return json({ ok: true, token });
    }
    const token = String(b.token || "");
    if (!/^[0-9a-f]{64}$/.test(token)) return json({ error: "not signed in" }, 401);
    const tkey = "t:" + (await sha256hex(token));
    const sess = await this.state.storage.get(tkey);
    if (!sess) return json({ error: "not signed in" }, 401);
    const ukey = "u:" + sess.uid;
    if (path === "/sync/get") { const u = await this.state.storage.get(ukey); return json({ ok: true, data: u ? u.data : null, at: u ? u.at : 0 }); }
    if (path === "/sync/put") {
      const text = JSON.stringify(b.data || {});
      if (text.length > 100000) return json({ error: "too large" }, 413);
      const at = Date.now();
      await this.state.storage.put(ukey, { data: JSON.parse(text), at });
      return json({ ok: true, at });
    }
    if (path === "/sync/logout") { await this.state.storage.delete(tkey); return json({ ok: true }); }
    if (path === "/sync/wipe") {
      await this.state.storage.delete(ukey);
      const all = await this.state.storage.list({ prefix: "t:" });
      for (const [k, v] of all) if (v && v.uid === sess.uid) await this.state.storage.delete(k);
      return json({ ok: true });
    }
    return json({ error: "not found" }, 404);
  }
  /** 每小時跑一次：條件新成立、使用者有開那一種通知、還沒發過 → 推送。晚上十點到早上九點不吵人（留到早上再發） */
  async run() {
    const h = hourTPE(), today = todayTPE();
    const data = await this.notifyData();
    if (!data || !data.movies || Date.now() - (data.updated || 0) > 6 * 3600e3) return { skipped: "stale data" }; // 資料太舊（排程停了）就不判斷，免得誤報
    const subs = await this.state.storage.list({ prefix: "s:" });
    let sentCount = 0, gone = 0;
    for (const [id, sub] of subs) {
      let changed = false, budget = 4; // 一個人一次最多四則
      const cfg = endConfig(sub.endCfg), opt = optConfig(sub.opt);
      if (!this.env.PUSH_ANY_HOUR && inQuiet(opt.quiet, h)) continue; // 這個人的勿擾時段：留到之後再發（PUSH_ANY_HOUR 只有測試時設）
      for (const fav of sub.favs || []) {
        const mark = (sub.sent[fav.key] ||= { open: false, rel: false, end: false, fest: false, hi: 0 });
        const c = conditions(fav, data, cfg, mark, opt);
        // 舊的紀錄沒有新種類的欄位：以現在的狀況為準，不補發
        if (mark.favc === undefined) { mark.favc = c.favc; changed = true; }
        if (!Array.isArray(mark.fmt)) { mark.fmt = c.fmtNow; c.fmt = false; changed = true; }
        if (mark.pre === undefined) { mark.pre = c.pre; changed = true; }
        if (mark.rate === undefined) { mark.rate = c.rate; changed = true; }
        if (c.n !== null && c.n > (mark.hi || 0)) { mark.hi = c.n; changed = true; } // 記下看過最多的影城數
        // 一出現就已經在上映的片：只發「上映了」，不重複發「開放場次了」
        const order = FAV_KINDS.filter((k) => k !== (c.rel && !mark.rel ? "open" : "rel"));
        if (c.rel && !mark.rel && !mark.open) { mark.open = true; changed = true; }
        for (const kind of order) {
          const done = (v) => { if (kind === "fmt") mark.fmt = Array.from(new Set([...(mark.fmt || []), ...c.fmtNew])); else mark[kind] = v; changed = true; };
          // 上映前提醒：上映日改了（延期）就重新算
          if (kind === "pre" && mark.pre && !c.pre && c.r && today < addDays(c.r, -opt.preDays)) { mark.pre = false; changed = true; }
          if (!c[kind] || (kind !== "fmt" && mark[kind])) continue;
          if (!sub.prefs[kind]) { done(true); continue; } // 沒開這一種：記成處理過，之後才開也不會補發舊的
          if (budget <= 0) continue;
          const msg = message(kind, fav, c, cfg);
          const status = await send(sub, { ...msg, tag: `${kind}:${fav.key}`, url: "/?fav=1" }, this.env).catch(() => 0);
          if (status === 404 || status === 410) { await this.state.storage.delete(id); gone++; budget = -1; changed = false; break; }
          if (status >= 200 && status < 300) { done(true); budget--; sentCount++; }
        }
        if (budget < 0) break;
      }
      // ── 不用收藏的通知 ──
      if (budget >= 0) {
        const bc = (sub.bc ||= { week: weekId(), fl: Object.fromEntries(Object.keys(data.fests || {}).filter((k) => data.fests[k].n > 0).map((k) => [k, 1])) });
        bc.fl ||= {};
        // 影展片單公布：這個影展第一次有片單（還沒結束的）
        for (const [fid, f] of Object.entries(data.fests || {})) {
          if (!(f.n > 0) || bc.fl[fid] || f.end < today) continue;
          if (!sub.prefs.flist || budget <= 0) { if (!sub.prefs.flist) { bc.fl[fid] = 1; changed = true; } continue; }
          const status = await send(sub, { title: `${f.name}的片單公布了`, body: `共 ${f.n} 部，${md(f.start)}–${md(f.end)}。點這裡看片單。`, tag: `flist:${fid}`, url: "/?tab=fest" }, this.env).catch(() => 0);
          if (status === 404 || status === 410) { await this.state.storage.delete(id); gone++; budget = -1; changed = false; break; }
          if (status >= 200 && status < 300) { bc.fl[fid] = 1; changed = true; budget--; sentCount++; }
        }
        for (const k of Object.keys(bc.fl)) if (!(data.fests || {})[k]) { delete bc.fl[k]; changed = true; }
        // 每週新片：星期四發一次，列出這一週（週一到週日）上映的片
        const wk = weekId();
        if (budget >= 0 && bc.week !== wk && new Date(Date.now() + 8 * 3600e3).getUTCDay() === 4) {
          const list = weekFilms(data, today);
          if (!sub.prefs.week || !list.length) { bc.week = wk; changed = true; }
          else if (budget > 0) {
            const status = await send(sub, { title: `本週上映 ${list.length} 部新片`, body: list.slice(0, 5).join("、") + (list.length > 5 ? "…" : ""), tag: `week:${wk}`, url: "/?tab=soon" }, this.env).catch(() => 0);
            if (status === 404 || status === 410) { await this.state.storage.delete(id); gone++; changed = false; }
            else if (status >= 200 && status < 300) { bc.week = wk; changed = true; sentCount++; }
          }
        }
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
/** worker.js 把 /api/sync/* 交給這裡（跟通知用同一個儲存空間） */
export async function handleSync(req, env, path) {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (Number(req.headers.get("content-length") || 0) > 150000) return json({ error: "too large" }, 413);
  const hub = env.PUSH.get(env.PUSH.idFromName("hub"));
  return hub.fetch(new Request("https://hub" + path.replace("/api/sync", "/sync"), { method: "POST", body: await req.text(), headers: { "content-type": "application/json" } }));
}
export async function runPush(env) {
  const hub = env.PUSH.get(env.PUSH.idFromName("hub"));
  return (await hub.fetch(new Request("https://hub/run", { method: "POST", body: "{}" }))).json();
}
