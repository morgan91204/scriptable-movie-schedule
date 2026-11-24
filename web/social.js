// 片刻：帳號的片單、公開個人頁、追蹤（跟通知、同步用同一個 Durable Object 的 SQLite）
// 身分：用 Google 登入後拿到的登入憑證（見 push.js 的 sync）。伺服器只認「帳號識別碼的雜湊」（uid），不存 email、姓名、大頭貼。
// 評分、標籤、短評的正本還是在評分伺服器（一部片一份，跟匿名的人一起統計）；這裡另外記一份「這個帳號評過哪些片」，
// 個人頁、動態才列得出來。兩邊透過服務綁定（env.RATE → 評分伺服器的 AccountRpc）同步，外面的網路碰不到那個入口。
//
// API：POST /api/social/<動作>，內容是 JSON；要登入的動作帶 token（登入憑證）。
//   me            自己的個人檔案和數字
//   profile-set   設定暱稱、顏色、公開與否           name 唯一（不分大小寫），14 天內只能改一次
//   adopt         登入後把這台裝置原本匿名的評分併進帳號（一次最多 20 部，App 分批送）
//   stats／vote／tags／note／report／notes   跟評分伺服器同名的動作，改用帳號身分
//   entry         片單上的一筆：看過的日期、只有自己看得到、或是只標「看過」不評分
//   mine          自己的片單（全部，含不公開的）
//   profile       某個人的公開個人頁（看別人的不用登入）
//   follow        追蹤／取消追蹤
//   feed          我追蹤的人最近的紀錄
//   people        找人（暱稱開頭），或最近有動靜的公開帳號
//   friends       這部片我追蹤的人怎麼評
//   report-user   檢舉帳號（暱稱不雅、冒名）
//   wipe          刪掉帳號的片單和社交資料（一次處理 20 筆，回傳還剩幾筆，App 送到 0 為止）
const sha256hex = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).map((x) => x.toString(16).padStart(2, "0")).join("");

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const COLORS = ["blue", "green", "orange", "red", "purple", "pink", "teal", "gray"];
const RESERVED = /^(admin|administrator|root|system|official|moderator|片刻|站長|管理員|官方|客服|匿名)$/i;
const NAME_RE = /^[\p{L}\p{N}_]{2,16}$/u;
const RENAME_EVERY = 14 * 86400e3;
const WRITES_MAX = 150, WRITES_WINDOW = 600e3; // 一個帳號 10 分鐘最多 150 次寫入（擋程式灌資料，一般人碰不到）
const okKey = (m) => typeof m === "string" && m.length >= 1 && m.length <= 120;
const okDate = (d) => d === "" || (typeof d === "string" && /^\d{4}-\d\d-\d\d$/.test(d) && !isNaN(Date.parse(d)) && Date.parse(d) < Date.now() + 86400e3 && d >= "1900-01-01");
const okDev = (d) => typeof d === "string" && /^[A-Za-z0-9-]{16,64}$/.test(d);
const cleanTitle = (t) => String(t || "").replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
const udev = (uid) => "u_" + uid.slice(0, 40);

export function socialInit(sql) {
  // users.pub：1 = 個人頁公開；hidden：站長把這個帳號的個人頁藏起來。entries.priv：1 = 這一筆只有自己看得到
  sql.exec("CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE, color TEXT NOT NULL DEFAULT 'blue', pub INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, at INTEGER NOT NULL, named INTEGER NOT NULL DEFAULT 0)");
  sql.exec("CREATE TABLE IF NOT EXISTS entries (uid TEXT NOT NULL, k TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', s INTEGER NOT NULL DEFAULT 0, x TEXT NOT NULL DEFAULT '', sp INTEGER NOT NULL DEFAULT 0, seen TEXT NOT NULL DEFAULT '', priv INTEGER NOT NULL DEFAULT 0, at INTEGER NOT NULL, PRIMARY KEY (uid, k))");
  // how = 觀影方式（後來才加的欄位）：cinema 電影院／second 二輪電影院／stream 串流，可以複選，用逗號接
  if (!sql.exec("SELECT 1 FROM pragma_table_info('entries') WHERE name = 'how'").toArray().length) sql.exec("ALTER TABLE entries ADD COLUMN how TEXT NOT NULL DEFAULT ''");
  // users.emoji = 頭像用的表情符號（後來才加的欄位）；沒有就用暱稱的第一個字
  if (!sql.exec("SELECT 1 FROM pragma_table_info('users') WHERE name = 'emoji'").toArray().length) sql.exec("ALTER TABLE users ADD COLUMN emoji TEXT NOT NULL DEFAULT ''");
  // 從 Letterboxd 匯入時查過的片名對照（英文片名｜年份 → 台灣片名、IMDb 編號），查過的不再問 TMDB
  sql.exec("CREATE TABLE IF NOT EXISTS lbx_map (k TEXT PRIMARY KEY, zh TEXT NOT NULL DEFAULT '', imdb TEXT NOT NULL DEFAULT '', y INTEGER NOT NULL DEFAULT 0, at INTEGER NOT NULL DEFAULT 0)");
  // users.th、users.ig = 個人頁上的 Threads、Instagram 帳號（只存帳號名稱，不存網址）
  for (const c of ["th", "ig", "tw"]) if (!sql.exec("SELECT 1 FROM pragma_table_info('users') WHERE name = ?", c).toArray().length) sql.exec(`ALTER TABLE users ADD COLUMN ${c} TEXT NOT NULL DEFAULT ''`);
  // users.bio = 個人頁上的一行自我介紹（後來才加的欄位）
  if (!sql.exec("SELECT 1 FROM pragma_table_info('users') WHERE name = 'bio'").toArray().length) sql.exec("ALTER TABLE users ADD COLUMN bio TEXT NOT NULL DEFAULT ''");
  sql.exec("CREATE INDEX IF NOT EXISTS entries_at ON entries (at)");
  sql.exec("CREATE INDEX IF NOT EXISTS entries_k ON entries (k)");
  sql.exec("CREATE TABLE IF NOT EXISTS follows (a TEXT NOT NULL, b TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (a, b))");
  // 追蹤要求：a 想追蹤 b（b 是不公開帳號，要 b 同意才會變成 follows 裡的一筆）
  sql.exec("CREATE TABLE IF NOT EXISTS follow_reqs (a TEXT NOT NULL, b TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (a, b))");
  sql.exec("CREATE INDEX IF NOT EXISTS follows_b ON follows (b)");
  sql.exec("CREATE TABLE IF NOT EXISTS user_reports (uid TEXT NOT NULL, by TEXT NOT NULL, why TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (uid, by))");
  // 通知頁的紀錄：to = 收通知的帳號（識別碼的前 40 個字，跟評分伺服器用的代號一樣）；kind = up 推／down 噓／reply 回覆／follow 追蹤；
  // actor = 做這件事的人（帳號識別碼，或 d:裝置代號；畫面上不會顯示代號）；k、title = 哪部片；note = 哪一則；x = 回覆的內容；px = 被推噓或被回覆的那一則的開頭
  sql.exec("CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, \"to\" TEXT NOT NULL, kind TEXT NOT NULL, actor TEXT NOT NULL, k TEXT NOT NULL DEFAULT '', title TEXT NOT NULL DEFAULT '', note INTEGER NOT NULL DEFAULT 0, x TEXT NOT NULL DEFAULT '', px TEXT NOT NULL DEFAULT '', at INTEGER NOT NULL)");
  sql.exec("CREATE INDEX IF NOT EXISTS activity_to ON activity (\"to\", at)");
  sql.exec("CREATE TABLE IF NOT EXISTS activity_seen (\"to\" TEXT PRIMARY KEY, at INTEGER NOT NULL)");
  sql.exec("CREATE TABLE IF NOT EXISTS write_quota (uid TEXT PRIMARY KEY, start INTEGER NOT NULL, n INTEGER NOT NULL)");
}

/** 主動推一則（只有回覆、追蹤會推；推噓只記在通知頁）。對方沒開通知、沒登入裝置就什麼都不會發；推不出去不影響原本的操作。
 *  名字只有公開個人頁的人才帶，其他一律「有人」 */
async function pushTo(hub, sql, to, kind, actor, make, named = false) {
  try {
    const a = actor ? sql.exec("SELECT name, pub, hidden FROM users WHERE uid = ?", actor).toArray()[0] : null;
    // named = 追蹤、追蹤要求這類：不公開的帳號也帶名字（暱稱和個人頁本來就看得到）；短評相關的只有公開的人才帶
    const who = a && (a.pub || named) && !a.hidden && a.name ? a.name + " " : "有人";
    // badge = 對方還沒看的通知數（顯示在主畫面圖示上）
    const seen = (sql.exec('SELECT at FROM activity_seen WHERE "to" = ?', to).toArray()[0] || { at: 0 }).at;
    const badge = sql.exec('SELECT COUNT(*) AS c FROM activity WHERE "to" = ? AND at > ?', to, seen).toArray()[0].c;
    await hub.socialPush(to, kind, { url: "/?tab=activity", badge, ...make(who) });
  } catch (_) {}
}
/** 問 TMDB：一部片的台灣片名和 IMDb 編號。先找同一年的，找不到再放寬到前後一年。查過的記在 lbx_map，一個月內不重查 */
async function lbxMatch(env, sql, token, name, year) {
  if (!name) return null;
  const k = name.toLowerCase() + "|" + year;
  const hit = sql.exec("SELECT zh, imdb, y, at FROM lbx_map WHERE k = ?", k).toArray()[0];
  if (hit && Date.now() - hit.at < 30 * 864e5) return hit.zh ? { zh: hit.zh, imdb: hit.imdb, y: hit.y } : null;
  const base = env.TMDB_BASE || "https://api.themoviedb.org/3";
  const v3 = /^[0-9a-f]{32}$/i.test(token);
  const get = async (path) => {
    const r = await fetch(base + path + (v3 ? (path.indexOf("?") >= 0 ? "&" : "?") + "api_key=" + token : ""), { headers: { accept: "application/json", ...(v3 ? {} : { authorization: "Bearer " + token }) } });
    if (!r.ok) throw new Error("tmdb " + r.status);
    return r.json();
  };
  const q = "/search/movie?language=zh-TW&include_adult=false&query=" + encodeURIComponent(name);
  const y = /^\d{4}$/.test(year) ? Number(year) : 0;
  const yearOf = (m) => Number(String(m.release_date || "").slice(0, 4)) || 0;
  let found = y ? ((await get(q + "&primary_release_year=" + y)).results || []) : [];
  if (!found.length) found = ((await get(q)).results || []).filter((m) => !y || Math.abs(yearOf(m) - y) <= 1);
  const same = (t) => String(t || "").toLowerCase() === name.toLowerCase();
  const pick = found.find((m) => same(m.original_title) || same(m.title)) || found[0];
  let out = null;
  if (pick) {
    const d = await get("/movie/" + pick.id + "?language=zh-TW");
    out = { zh: String(d.title || pick.title || "").slice(0, 120), imdb: /^tt\d+$/.test(String(d.imdb_id || "")) ? d.imdb_id : "", y: yearOf(d) || yearOf(pick) || y };
  }
  sql.exec("INSERT INTO lbx_map (k, zh, imdb, y, at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(k) DO UPDATE SET zh = excluded.zh, imdb = excluded.imdb, y = excluded.y, at = excluded.at", k, out ? out.zh : "", out ? out.imdb : "", out ? out.y : 0, Date.now());
  return out && out.zh ? out : null;
}
/** 處理一筆追蹤要求（from 想追蹤 me）：ok = 同意。同意的話 me 的通知裡會變成「from 開始追蹤你」，from 會收到「me 接受了你的追蹤要求」 */
function acceptReq(sql, from, me, ok) {
  sql.exec("DELETE FROM follow_reqs WHERE a = ? AND b = ?", from, me);
  sql.exec('DELETE FROM activity WHERE "to" = ? AND actor = ? AND kind = \'request\'', me.slice(0, 40), from);
  if (!ok) return;
  sql.exec("INSERT OR IGNORE INTO follows (a, b, at) VALUES (?, ?, ?)", from, me, Date.now());
  notify(sql, me.slice(0, 40), "follow", from);
  notify(sql, from.slice(0, 40), "accepted", me);
}
const ACT_KEEP = 300; // 一個人最多留幾筆通知
/** 記一筆通知。自己對自己的不記；同一個人對同一則的推噓只留最新的一筆（改來改去不會洗版） */
function notify(sql, to, kind, actor, more = {}) {
  if (!to || !actor || actor.slice(0, 40) === to) return;
  if (kind === "up" || kind === "down" || kind === "unvote") sql.exec('DELETE FROM activity WHERE "to" = ? AND actor = ? AND note = ? AND kind IN (\'up\', \'down\')', to, actor, more.note || 0);
  if (kind === "follow" || kind === "unfollow") sql.exec('DELETE FROM activity WHERE "to" = ? AND actor = ? AND kind IN (\'follow\', \'request\')', to, actor);
  if (kind === "request" || kind === "accepted") sql.exec('DELETE FROM activity WHERE "to" = ? AND actor = ? AND kind = ?', to, actor, kind);
  if (kind === "unvote" || kind === "unfollow") return;
  sql.exec('INSERT INTO activity ("to", kind, actor, k, title, note, x, px, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', to, kind, actor, more.k || "", cleanTitle(more.title) || more.k || "", more.note || 0, String(more.x || "").slice(0, 200), String(more.px || "").slice(0, 80), Date.now());
  // 太多了就把最舊的清掉
  const n = sql.exec('SELECT COUNT(*) AS c FROM activity WHERE "to" = ?', to).toArray()[0].c;
  if (n > ACT_KEEP + 50) sql.exec('DELETE FROM activity WHERE "to" = ? AND id NOT IN (SELECT id FROM activity WHERE "to" = ? ORDER BY at DESC LIMIT ?)', to, to, ACT_KEEP);
}
const one = (sql, q, ...a) => sql.exec(q, ...a).toArray()[0] || null;
const all = (sql, q, ...a) => sql.exec(q, ...a).toArray();
const HOW = ["cinema", "second", "stream"];
const entryOut = (r) => ({ k: r.k, title: r.title, s: r.s, x: r.x, sp: r.sp ? 1 : 0, seen: r.seen, at: r.at, ...(r.priv ? { priv: 1 } : {}), ...(r.how ? { how: String(r.how).split(",").filter(Boolean) } : {}) });
const userOut = (u) => ({ name: u.name, color: u.color, ...(u.emoji ? { emoji: u.emoji } : {}) });
/** 頭像顏色：內建的幾種，或自訂的色號（#rrggbb） */
const okColor = (c) => typeof c === "string" && (COLORS.indexOf(c) >= 0 || /^#[0-9a-f]{6}$/i.test(c));
/** 頭像的表情符號：只收「一個」表情符號（含膚色、組合的家人／職業、國旗），不收文字 */
const EMOJI_RE = /^(?:[\u{1F1E6}-\u{1F1FF}]{2}|(?:\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])?)(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}])?){0,6})$/u;
const BIO_MAX = 80;
/** 自我介紹：去掉控制字元、換行併成空白；不收連結和聯絡方式（跟短評同一套規則） */
const cleanBio = (x) => String(x == null ? "" : x).normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, " ").replace(/\s+/g, " ").trim();
const bioHasContact = (x) => /https?:|www\.|[a-z0-9-]+\.(com|net|org|tw|cc|io|me|ly|gg|xyz|shop|top)\b|\d{8,}|(?:line|telegram|tg|賴)\s*(?:id)?\s*[:：@]/i.test(x);
/** 社群帳號：只收帳號名稱（貼整個網址或前面有 @ 會自動去掉）；格式不對回 null */
const cleanHandle = (x) => {
  const v = String(x == null ? "" : x).trim().replace(/^https?:\/\/(www\.|mobile\.)?(threads\.(net|com)|instagram\.com|x\.com|twitter\.com)\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "");
  return v === "" ? "" : /^[A-Za-z0-9._]{1,30}$/.test(v) ? v : null;
};
const linksOut = (u) => ({ ...(u.th ? { th: u.th } : {}), ...(u.ig ? { ig: u.ig } : {}), ...(u.tw ? { tw: u.tw } : {}) });
/** 短評或回覆裡的 @暱稱：通知被提到的人（最多 3 個；只有公開個人頁的人收得到，自己和 skip 裡的人不算）。回傳被通知的帳號 */
function mentioned(sql, text, uid, skip = []) {
  const out = [];
  for (const m of String(text || "").matchAll(/@([\p{L}\p{N}_]{2,16})/gu)) {
    if (out.length >= 3) break;
    const u = sql.exec("SELECT uid FROM users WHERE name = ? AND pub = 1 AND hidden = 0", m[1].normalize("NFC")).toArray()[0];
    const to = u ? u.uid.slice(0, 40) : "";
    if (!to || u.uid === uid || skip.indexOf(to) >= 0 || out.indexOf(to) >= 0) continue;
    out.push(to);
  }
  return out;
}
async function notifyMentions(hub, sql, text, uid, more, skip) {
  if (!uid) return; // 沒登入的人不能 @（免得被拿來洗別人的通知）
  const x = cleanTitle(text);
  for (const to of mentioned(sql, x, uid, skip)) {
    notify(sql, to, "mention", uid, { ...more, x: x.slice(0, 140), px: Array.from(x).slice(0, 40).join("") });
    await pushTo(hub, sql, to, "reply", uid, (who) => ({ title: `${who}在《${cleanTitle(more.title) || more.k}》的短評提到你`, body: more.sp ? "（有雷，點進去看）" : x.slice(0, 100), tag: "mention:" + more.k }));
  }
}
const okEmoji = (e) => e === "" || (typeof e === "string" && e.length <= 32 && EMOJI_RE.test(e));

/** 這個帳號的數字：片單幾部、短評幾則、追蹤幾人、被幾人追蹤 */
/** viewer 看得到 u 的片單、短評、粉絲和追蹤名單嗎：公開帳號誰都可以；不公開的只有本人和他同意追蹤的人 */
const canSee = (sql, viewer, u) => !!u.pub || u.uid === viewer || !!(viewer && one(sql, "SELECT 1 AS x FROM follows WHERE a = ? AND b = ?", viewer, u.uid));
function counts(sql, uid, onlyPublic) {
  const w = onlyPublic ? " AND priv = 0" : "";
  return {
    films: one(sql, "SELECT COUNT(*) AS c FROM entries WHERE uid = ?" + w, uid).c,
    notes: one(sql, "SELECT COUNT(*) AS c FROM entries WHERE uid = ? AND x != ''" + w, uid).c,
    following: one(sql, "SELECT COUNT(*) AS c FROM follows WHERE a = ?", uid).c,
    followers: one(sql, "SELECT COUNT(*) AS c FROM follows WHERE b = ?", uid).c,
  };
}
/** 評分伺服器回的那一筆（分數、短評）寫進片單；沒有分數、沒有短評、也沒標看過，就不留 */
function upsertEntry(sql, uid, k, title, patch) {
  const old = one(sql, "SELECT * FROM entries WHERE uid = ? AND k = ?", uid, k);
  const e = { title: cleanTitle(title) || (old ? old.title : k), s: old ? old.s : 0, x: old ? old.x : "", sp: old ? old.sp : 0, seen: old ? old.seen : "", priv: old ? old.priv : 0, how: old ? old.how || "" : "", at: old ? old.at : Date.now(), ...patch };
  if (e.how && !e.seen) e.seen = "?"; // 填了觀影方式就算看過（沒記日期）
  if (!e.s && !e.x && !e.seen) { sql.exec("DELETE FROM entries WHERE uid = ? AND k = ?", uid, k); return null; }
  if (patch.at) e.at = patch.at;
  else if (!old || patch.touch) e.at = Date.now();
  sql.exec("INSERT INTO entries (uid, k, title, s, x, sp, seen, priv, how, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(uid, k) DO UPDATE SET title = excluded.title, s = excluded.s, x = excluded.x, sp = excluded.sp, seen = excluded.seen, priv = excluded.priv, how = excluded.how, at = excluded.at", uid, k, e.title, e.s, e.x, e.sp ? 1 : 0, e.seen, e.priv ? 1 : 0, e.how || "", e.at);
  return e;
}
function quotaOk(sql, uid) {
  const now = Date.now();
  const q = one(sql, "SELECT start, n FROM write_quota WHERE uid = ?", uid);
  if (!q || now - q.start > WRITES_WINDOW) { sql.exec("INSERT INTO write_quota (uid, start, n) VALUES (?, ?, 1) ON CONFLICT(uid) DO UPDATE SET start = excluded.start, n = 1", uid, now); return true; }
  if (q.n >= WRITES_MAX) return false;
  sql.exec("UPDATE write_quota SET n = n + 1 WHERE uid = ?", uid);
  return true;
}

/** hub = PushHub（要用它的儲存空間和 env）。path 例如 /social/vote */
export async function social(hub, path, b) {
  const sql = hub.state.storage.sql;
  const rate = hub.env.RATE;
  const op = path.replace("/social/", "");
  // 用量統計：各種動作今天各幾次（只有次數）
  { const c = { vote: "act-vote", note: "act-note", "note-add": "act-note", "note-reply": "act-note", "note-vote": "act-updown", report: "act-report", "report-user": "act-report", "lbx-match": "act-import", "lbx-import": "act-import" }[op] || (op === "follow" && b.on ? "act-follow" : ""); if (c) hub.bump(c); }
  // 登入的人是誰（沒帶憑證就是 null；憑證不對回 401）
  let uid = "", isAdmin = false;
  if (b.token) {
    if (!/^[0-9a-f]{64}$/.test(String(b.token))) return json({ error: "not signed in" }, 401);
    const sess = await hub.state.storage.get("t:" + (await sha256hex(String(b.token))));
    if (!sess) return json({ error: "not signed in" }, 401);
    uid = sess.uid;
    isAdmin = !!sess.adm && (await hub.isAdmin(sess.adm)); // 設定頁要不要多出「管理員專區」那一列
    if (isAdmin && op === "me") await hub.adminSeen(uid, sess.adm); // 之後有新的檢舉、回饋才通知得到他
    if (op === "me") hub.usageAccount(uid); // 用量統計：今天有幾個登入的帳號打開過（過了當天只留人數）
  }
  const me = uid ? one(sql, "SELECT * FROM users WHERE uid = ?", uid) : null;
  const need = () => (uid ? null : json({ error: "not signed in" }, 401));
  const m = b.m;
  const fail = (r) => (r && r.error ? json({ error: r.error }, r.error === "vote first" ? 409 : ["too long", "no links", "too many notes", "too many replies", "parent gone", "duplicate"].indexOf(r.error) >= 0 ? 422 : 400) : null);

  // ── 不用登入也能做的 ──
  if (op === "notes") {
    if (!okKey(m) || !rate) return json({ error: "bad request" }, 400);
    const viewer = uid ? udev(uid) : okDev(b.d) ? b.d : "";
    const r = await rate.notes(m, viewer);
    if (r.error) return json(r, 400);
    return json(withAuthors(sql, r, uid, m));
  }
  if (op === "report") {
    const by = uid ? udev(uid) : okDev(b.d) ? b.d : "";
    if (!okKey(m) || !by || !rate) return json({ error: "bad request" }, 400);
    if (uid && !quotaOk(sql, uid)) return json({ error: "too many" }, 429);
    const r = await rate.report(m, by, Number(b.id), String(b.why || ""));
    if (!(r && r.error)) await hub.adminPush({ title: `有短評被檢舉：《${cleanTitle(b.title) || m}》`, body: "到 管理員專區 → 短評管理 複查。", tag: "admin:note:" + m.slice(0, 40) }).catch(() => 0);
    return fail(r) || json(withAuthors(sql, r, uid, m));
  }
  if (op === "note-vote") {
    const by = uid ? udev(uid) : okDev(b.d) ? b.d : "";
    if (!okKey(m) || !by || !rate) return json({ error: "bad request" }, 400);
    if (uid && !quotaOk(sql, uid)) return json({ error: "too many" }, 429);
    const r = await rate.noteVote(m, by, Number(b.id), Number(b.v));
    if (r && r.t) {
      const v = Number(b.v);
      if (r.t.a) notify(sql, r.t.a, v === 1 ? "up" : v === -1 ? "down" : "unvote", uid || "d:" + by, { k: m, title: b.title, note: r.t.id, px: r.t.x });
      delete r.t;
    }
    return fail(r) || json(withAuthors(sql, r, uid, m));
  }
  if (op === "note-reply") {
    const by = uid ? udev(uid) : okDev(b.d) ? b.d : "";
    if (!okKey(m) || !by || !rate) return json({ error: "bad request" }, 400);
    if (uid && !quotaOk(sql, uid)) return json({ error: "too many" }, 429);
    const r = await rate.noteReply(m, by, b.x, b.sp, Number(b.r) || 0);
    const bad = fail(r);
    if (bad) return bad;
    if (r.t) {
      if (r.t.a && r.t.a !== (uid || "").slice(0, 40)) {
        notify(sql, r.t.a, "reply", uid || "d:" + by, { k: m, title: b.title, note: r.t.id, x: cleanTitle(b.x).slice(0, 140), px: r.t.x });
        const film = cleanTitle(b.title);
        await pushTo(hub, sql, r.t.a, "reply", uid, (who) => ({ title: `${who}回覆了你${film ? `在《${film}》` : ""}的短評`, body: b.sp ? "（有雷，點進去看）" : cleanTitle(b.x).slice(0, 100), tag: "reply:" + m }));
      }
      await notifyMentions(hub, sql, b.x, uid, { k: m, title: b.title, sp: b.sp }, r.t.a ? [r.t.a] : []);
      delete r.t;
    }
    return json(withAuthors(sql, r, uid, m));
  }
  if (op === "profile") {
    const u = one(sql, "SELECT * FROM users WHERE name = ?", String(b.name || ""));
    if (!u || (u.hidden && u.uid !== uid)) return json({ error: "not found" }, 404);
    const self = u.uid === uid;
    // 不公開帳號：個人頁看得到（暱稱、頭像、自我介紹、四個數字），但片單、短評、粉絲和追蹤名單要他同意追蹤後才看得到
    if (!canSee(sql, uid, u)) return json({ ok: true, user: { ...userOut(u), bio: u.bio || "" }, private: true, locked: true, since: u.at, counts: counts(sql, u.uid, true), following: false, requested: !!(uid && one(sql, "SELECT 1 AS x FROM follow_reqs WHERE a = ? AND b = ?", uid, u.uid)) });
    const where = self ? "" : " AND priv = 0";
    const offset = Math.max(0, Number(b.offset) || 0);
    const list = all(sql, "SELECT * FROM entries WHERE uid = ?" + where + " ORDER BY at DESC LIMIT 50 OFFSET ?", u.uid, offset).map(entryOut);
    const dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const r of all(sql, "SELECT s, COUNT(*) AS c FROM entries WHERE uid = ? AND s > 0" + where + " GROUP BY s", u.uid)) if (r.s >= 1 && r.s <= 10) dist[r.s - 1] = r.c;
    // 共同追蹤：我追蹤的人裡面，有誰也在追蹤他（列前三個，其餘只算人數；只算有公開個人頁的）
    let mutual = null;
    if (uid && !self) {
      const rows = all(sql, "SELECT x.name, x.color, x.emoji FROM follows mine JOIN follows theirs ON theirs.a = mine.b AND theirs.b = ? JOIN users x ON x.uid = mine.b AND x.pub = 1 AND x.hidden = 0 WHERE mine.a = ? ORDER BY theirs.at DESC LIMIT 50", u.uid, uid);
      if (rows.length) mutual = { list: rows.slice(0, 3).map(userOut), more: Math.max(0, rows.length - 3) };
    }
    return json({ ok: true, user: { ...userOut(u), bio: u.bio || "", ...linksOut(u) }, self, since: u.at, counts: counts(sql, u.uid, !self), dist, list, following: !!(uid && one(sql, "SELECT 1 AS x FROM follows WHERE a = ? AND b = ?", uid, u.uid)), ...(u.pub ? {} : { private: true }), ...(mutual ? { mutual } : {}) });
  }
  if (op === "list") {
    // 個人卡片上四個數字點進去的清單：films 片單／notes 有寫短評的／followers 粉絲／following 追蹤中。
    // 不給暱稱 = 看自己的（要登入）。別人的要對方公開個人頁才看得到；粉絲、追蹤中只列出「有公開個人頁」的帳號，其餘只算人數
    const u = b.name ? one(sql, "SELECT * FROM users WHERE name = ?", String(b.name)) : null;
    const target = u ? u.uid : b.name ? "" : uid;
    if (!target || (u && u.hidden && u.uid !== uid)) return json({ error: "not found" }, 404);
    const self = target === uid;
    if (!self && !(u && canSee(sql, uid, u))) return json({ error: "private" }, 403);
    const kind = String(b.kind || "");
    if (kind === "films" || kind === "notes") {
      const where = (self ? "" : " AND priv = 0") + (kind === "notes" ? " AND x != ''" : "");
      return json({ ok: true, kind, user: u ? userOut(u) : null, self, entries: all(sql, "SELECT * FROM entries WHERE uid = ?" + where + " ORDER BY at DESC LIMIT 200", target).map(entryOut), total: one(sql, "SELECT COUNT(*) AS c FROM entries WHERE uid = ?" + where, target).c });
    }
    if (kind === "followers" || kind === "following") {
      const [mine, other] = kind === "followers" ? ["b", "a"] : ["a", "b"];
      const rows = all(sql, `SELECT u.*, (SELECT COUNT(*) FROM entries e WHERE e.uid = u.uid AND e.priv = 0) AS films FROM follows f JOIN users u ON u.uid = f.${other} AND u.pub = 1 AND u.hidden = 0 WHERE f.${mine} = ? ORDER BY f.at DESC LIMIT 200`, target);
      const total = one(sql, `SELECT COUNT(*) AS c FROM follows WHERE ${mine} = ?`, target).c;
      const follows = uid ? new Set(all(sql, "SELECT b FROM follows WHERE a = ?", uid).map((r) => r.b)) : new Set();
      return json({ ok: true, kind, user: u ? userOut(u) : null, self, people: rows.map((r) => ({ ...userOut(r), films: r.films, following: follows.has(r.uid), ...(r.uid === uid ? { me: 1 } : {}) })), total, unlisted: Math.max(0, total - rows.length) });
    }
    return json({ error: "bad request" }, 400);
  }
  if (op === "people") {
    const q = String(b.q || "").trim().slice(0, 16);
    const rows = q
      ? all(sql, "SELECT u.*, (SELECT COUNT(*) FROM entries e WHERE e.uid = u.uid AND e.priv = 0) AS films FROM users u WHERE u.hidden = 0 AND u.name LIKE ? ESCAPE '\\' ORDER BY films DESC LIMIT 30", q.replace(/[\\%_]/g, "\\$&") + "%")
      : all(sql, "SELECT u.*, COUNT(e.k) AS films, MAX(e.at) AS last FROM users u JOIN entries e ON e.uid = u.uid AND e.priv = 0 WHERE u.pub = 1 AND u.hidden = 0 GROUP BY u.uid ORDER BY last DESC LIMIT 30");
    const mine = uid ? new Set(all(sql, "SELECT b FROM follows WHERE a = ?", uid).map((r) => r.b)) : new Set();
    const asked = uid ? new Set(all(sql, "SELECT b FROM follow_reqs WHERE a = ?", uid).map((r) => r.b)) : new Set();
    return json({ ok: true, list: rows.filter((u) => u.uid !== uid).map((u) => ({ ...userOut(u), ...(u.pub || mine.has(u.uid) ? { films: u.films } : {}), following: mine.has(u.uid), ...(u.pub ? {} : { priv: 1 }), ...(asked.has(u.uid) ? { requested: 1 } : {}) })) });
  }
  if (op === "report-user") {
    const by = uid || (okDev(b.d) ? "d:" + b.d : "");
    const u = one(sql, "SELECT uid FROM users WHERE name = ?", String(b.name || ""));
    if (!by || !u || ["name", "fake", "abuse"].indexOf(b.why) < 0) return json({ error: "bad request" }, 400);
    if (u.uid !== uid) {
      sql.exec("INSERT OR IGNORE INTO user_reports (uid, by, why, at) VALUES (?, ?, ?, ?)", u.uid, by, b.why, Date.now());
      await hub.adminPush({ title: `有帳號被檢舉：${String(b.name).slice(0, 16)}`, body: ({ name: "暱稱不當", fake: "冒名", abuse: "不當行為" }[b.why] || "") + "。到 管理員專區 → 帳號管理 處理。", tag: "admin:user" }).catch(() => 0);
    }
    return json({ ok: true });
  }

  // ── 以下都要登入 ──
  const no = need();
  if (no) return no;
  if (op === "me") return json({ ok: true, unread: one(sql, 'SELECT COUNT(*) AS c FROM activity WHERE "to" = ? AND at > ?', uid.slice(0, 40), (one(sql, 'SELECT at FROM activity_seen WHERE "to" = ?', uid.slice(0, 40)) || { at: 0 }).at).c, ...(isAdmin ? { admin: true } : {}), user: me ? { ...userOut(me), bio: me.bio || "", ...linksOut(me), pub: !!me.pub, hidden: !!me.hidden, canRename: Date.now() - me.named > RENAME_EVERY } : null, counts: counts(sql, uid, false) });
  if (op === "activity") {
    // 通知頁：最近的 150 筆，整理成一列一列（同一則的推合成一列、噓只算人數）。打開就算看過
    const to = uid.slice(0, 40);
    const seen = (one(sql, 'SELECT at FROM activity_seen WHERE "to" = ?', to) || { at: 0 }).at;
    const rows = all(sql, 'SELECT * FROM activity WHERE "to" = ? ORDER BY at DESC LIMIT 150', to);
    const who = {};
    const actorOf = (a) => {
      if (a.indexOf("d:") === 0) return null; // 沒登入的人
      if (!(a in who)) { const u = one(sql, "SELECT name, color, emoji, pub, hidden FROM users WHERE uid = ?", a); who[a] = u && !u.hidden ? { ...userOut(u), pub: u.pub } : null; }
      return who[a] && who[a].pub ? userOut(who[a]) : null;
    };
    // 追蹤、追蹤要求：不公開的帳號也顯示名字（個人頁本來就看得到）
    const personOf = (a) => { actorOf(a); return who[a] ? userOut(who[a]) : null; };
    const iFollow = new Set(all(sql, "SELECT b FROM follows WHERE a = ?", uid).map((r) => r.b));
    const items = [], votes = {};
    for (const r of rows) {
      if (r.kind === "up" || r.kind === "down") {
        const key = r.kind + ":" + r.k + ":" + r.note;
        let it = votes[key];
        if (!it) { it = votes[key] = { kind: r.kind, k: r.k, title: r.title, px: r.px, at: r.at, n: 0, who: [], ...(r.at > seen ? { fresh: 1 } : {}) }; items.push(it); }
        it.n++;
        // 推：列出前兩個有公開個人頁的人；噓：只算人數，不說是誰
        if (r.kind === "up") { const a = actorOf(r.actor); if (a && it.who.length < 2 && !it.who.some((x) => x.name === a.name)) it.who.push(a); }
      } else if (r.kind === "reply") {
        items.push({ kind: "reply", k: r.k, title: r.title, x: r.x, px: r.px, at: r.at, who: [actorOf(r.actor)].filter(Boolean), n: 1, ...(r.at > seen ? { fresh: 1 } : {}) });
      } else if (r.kind === "mention") {
        items.push({ kind: "mention", k: r.k, title: r.title, x: r.x, px: r.px, at: r.at, who: [actorOf(r.actor)].filter(Boolean), n: 1, ...(r.at > seen ? { fresh: 1 } : {}) });
      } else if (r.kind === "request" || r.kind === "accepted") {
        items.push({ kind: r.kind, at: r.at, who: [personOf(r.actor)].filter(Boolean), n: 1, ...(r.at > seen ? { fresh: 1 } : {}) });
      } else if (r.kind === "follow") {
        const a = personOf(r.actor);
        // back = 我也有追蹤他；先追蹤他、他才追蹤我的話就是「回追」
        const mine = one(sql, "SELECT at FROM follows WHERE a = ? AND b = ?", uid, r.actor);
        items.push({ kind: "follow", at: r.at, who: [a].filter(Boolean), n: 1, ...(iFollow.has(r.actor) ? { back: 1 } : {}), ...(mine && mine.at < r.at ? { returned: 1 } : {}), ...(r.at > seen ? { fresh: 1 } : {}) });
      }
    }
    sql.exec('INSERT INTO activity_seen ("to", at) VALUES (?, ?) ON CONFLICT("to") DO UPDATE SET at = excluded.at', to, Date.now());
    return json({ ok: true, list: items.slice(0, 80) });
  }
  if (op === "mine") {
    const offset = Math.max(0, Number(b.offset) || 0);
    return json({ ok: true, list: all(sql, "SELECT * FROM entries WHERE uid = ? ORDER BY at DESC LIMIT 100 OFFSET ?", uid, offset).map(entryOut), total: counts(sql, uid, false).films });
  }
  if (op === "feed") {
    const rows = all(sql, "SELECT e.*, u.name, u.color, u.emoji FROM follows f JOIN users u ON u.uid = f.b AND u.hidden = 0 JOIN entries e ON e.uid = f.b AND e.priv = 0 WHERE f.a = ? ORDER BY e.at DESC LIMIT 60", uid);
    return json({ ok: true, list: rows.map((r) => ({ ...entryOut(r), by: userOut(r) })), following: counts(sql, uid, false).following });
  }
  if (op === "friends") {
    if (!okKey(m)) return json({ error: "bad request" }, 400);
    const rows = all(sql, "SELECT e.*, u.name, u.color, u.emoji FROM follows f JOIN users u ON u.uid = f.b AND u.hidden = 0 JOIN entries e ON e.uid = f.b AND e.priv = 0 AND e.k = ? WHERE f.a = ? ORDER BY e.at DESC LIMIT 30", m, uid);
    return json({ ok: true, list: rows.map((r) => ({ ...entryOut(r), by: userOut(r) })) });
  }
  if (op === "stats") {
    if (!okKey(m) || !rate) return json({ error: "bad request" }, 400);
    const r = await rate.stats(m, udev(uid));
    return fail(r) || json(r);
  }

  // 從 Letterboxd 匯入：一次要打很多趟（每趟十幾筆），不算進下面「10 分鐘 150 次」的限制，另外靠每趟的筆數上限和每個來源每分鐘的請求上限擋
  if (op === "lbx-match") {
    // 從 Letterboxd 匯入的第一步：把「英文片名＋年份」對成台灣片名（問 TMDB；金鑰是伺服器的加密設定，不會給 App）
    const token = String(hub.env.TMDB_TOKEN || "").trim();
    if (!token) return json({ error: "no tmdb" }, 503);
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 12);
    const list = await Promise.all(items.map((it) => lbxMatch(hub.env, sql, token, String((it && it.n) || "").slice(0, 200), String((it && it.y) || "").slice(0, 4)).catch(() => null)));
    return json({ ok: true, list });
  }
  if (op === "lbx-import") {
    // 第二步：使用者確認過的那幾筆，記進片單、算進評分、影評變成短評。一次最多 15 筆；已經評過分的片不動（除非 over）
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 15);
    if (!rate) return json({ error: "bad request" }, 400);
    const out = [];
    for (const it of items) {
      const k = String((it && it.m) || ""), title = cleanTitle(it && it.title), s = Math.round(Number(it && it.s)) || 0;
      if (!okKey(k) || !title || s < 0 || s > 10) { out.push("bad"); continue; }
      const old = one(sql, "SELECT s, x, seen FROM entries WHERE uid = ? AND k = ?", uid, k);
      // 片刻已經評過的：要那一筆自己帶 over 才動（一筆一筆決定）。over 而 s = 0 → 分數維持原本的，只加影評
      if (old && old.s && !it.over) { out.push("have"); continue; }
      const seen = /^\d{4}-\d{2}-\d{2}$/.test(String(it.seen || "")) && String(it.seen) <= new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10) ? String(it.seen) : "?";
      const voted = s || (old && old.s) || 0;
      let x = "", sp = 0, note = "";
      try {
        if (s && !(old && old.s === s)) { const r = await rate.vote(k, udev(uid), s); if (r && r.error) { out.push("fail"); continue; } }
        const text = voted ? String(it.x || "").replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200) : "";
        if (text && !(old && old.x === text)) {
          const r = await rate.noteAdd(k, udev(uid), text, it.sp ? 1 : 0, 0, true); // true = 匯入的影評，字數上限比較寬
          if (r && r.error) note = r.error; else { x = text; sp = it.sp ? 1 : 0; }
        }
      } catch (_) { out.push("fail"); continue; }
      // 新的一筆：記錄時間用觀影日期（沒有日期的排到三個月前），免得一次匯入幾百筆把追蹤者的動態洗掉。原本就有的那一筆：時間、看過的日期不動
      const at = seen !== "?" ? Math.min(Date.now(), Date.parse(seen + "T12:00:00+08:00")) : Date.now() - 90 * 864e5;
      upsertEntry(sql, uid, k, title, { ...(s ? { s } : {}), ...(x ? { x, sp } : {}), ...(old && old.seen && old.seen !== "?" ? {} : { seen }), ...(old ? {} : { at }) });
      out.push(note ? "note:" + note : "ok");
    }
    return json({ ok: true, list: out });
  }
  // 會寫入的動作：先看有沒有超過次數
  if (!quotaOk(sql, uid)) return json({ error: "too many" }, 429);
  if (op === "profile-set") {
    const name = String(b.name || "").trim().normalize("NFC");
    const color = okColor(b.color) ? String(b.color).toLowerCase() : me ? me.color : "blue";
    const emoji = b.emoji === undefined ? (me ? me.emoji || "" : "") : String(b.emoji || "").trim();
    if (!okEmoji(emoji)) return json({ error: "bad emoji" }, 400);
    const bio = b.bio === undefined ? (me ? me.bio || "" : "") : cleanBio(b.bio);
    if (Array.from(bio).length > BIO_MAX || bioHasContact(bio)) return json({ error: "bad bio" }, 400);
    const th = b.th === undefined ? (me ? me.th || "" : "") : cleanHandle(b.th), ig = b.ig === undefined ? (me ? me.ig || "" : "") : cleanHandle(b.ig);
    const tw = b.tw === undefined ? (me ? me.tw || "" : "") : cleanHandle(b.tw);
    if (tw === null || (tw && !/^[A-Za-z0-9_]{1,15}$/.test(tw))) return json({ error: "bad handle" }, 400);
    if (th === null || ig === null) return json({ error: "bad handle" }, 400);
    const pub = b.pub ? 1 : 0;
    if (!NAME_RE.test(name) || RESERVED.test(name)) return json({ error: "bad name" }, 400);
    const taken = one(sql, "SELECT uid FROM users WHERE name = ?", name);
    if (taken && taken.uid !== uid) return json({ error: "name taken" }, 409);
    if (me && me.name !== name && Date.now() - me.named <= RENAME_EVERY) return json({ error: "rename later" }, 429);
    if (me && !me.pub && pub) for (const r of all(sql, "SELECT a FROM follow_reqs WHERE b = ?", uid)) acceptReq(sql, r.a, uid, true); // 從不公開改成公開：還在等的追蹤要求直接算同意
    if (me) sql.exec("UPDATE users SET name = ?, color = ?, emoji = ?, bio = ?, th = ?, ig = ?, tw = ?, pub = ?, named = ? WHERE uid = ?", name, color, emoji, bio, th, ig, tw, pub, me.name !== name ? Date.now() : me.named, uid);
    else sql.exec("INSERT INTO users (uid, name, color, emoji, bio, th, ig, tw, pub, at, named) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)", uid, name, color, emoji, bio, th, ig, tw, pub, Date.now());
    return json({ ok: true, user: { name, color, pub: !!pub, ...(emoji ? { emoji } : {}) } });
  }
  if (op === "follow") {
    const u = one(sql, "SELECT uid, pub, hidden FROM users WHERE name = ?", String(b.name || ""));
    if (!u || u.uid === uid) return json({ error: "not found" }, 404);
    const to = u.uid.slice(0, 40);
    let requested = false;
    if (b.on) {
      if (u.hidden) return json({ error: "private" }, 403);
      const has = !!one(sql, "SELECT 1 AS x FROM follows WHERE a = ? AND b = ?", uid, u.uid);
      if (!has && one(sql, "SELECT (SELECT COUNT(*) FROM follows WHERE a = ?) + (SELECT COUNT(*) FROM follow_reqs WHERE a = ?) AS c", uid, uid).c >= 500) return json({ error: "too many follows" }, 400);
      if (!has && !u.pub) {
        // 不公開帳號：先送出追蹤要求，等對方同意
        const fresh = !one(sql, "SELECT 1 AS x FROM follow_reqs WHERE a = ? AND b = ?", uid, u.uid);
        sql.exec("INSERT OR IGNORE INTO follow_reqs (a, b, at) VALUES (?, ?, ?)", uid, u.uid, Date.now());
        requested = true;
        if (fresh) {
          notify(sql, to, "request", uid);
          await pushTo(hub, sql, to, "follow", uid, (who) => ({ title: `${who}想追蹤你`, body: "點這裡決定要不要同意。", tag: "request:" + uid.slice(0, 12) }), true);
        }
      } else if (!has) {
        sql.exec("INSERT OR IGNORE INTO follows (a, b, at) VALUES (?, ?, ?)", uid, u.uid, Date.now());
        notify(sql, to, "follow", uid);
        const back = !!one(sql, "SELECT 1 AS x FROM follows WHERE a = ? AND b = ?", u.uid, uid);
        await pushTo(hub, sql, to, "follow", uid, (who) => ({ title: back ? `${who}也回追你了` : `${who}開始追蹤你`, body: back ? "你們現在互相追蹤。" : "點這裡看看對方的片單。", tag: "follow:" + uid.slice(0, 12) }), true);
      }
    } else {
      // 取消追蹤，或收回還沒被同意的追蹤要求
      sql.exec("DELETE FROM follows WHERE a = ? AND b = ?", uid, u.uid);
      sql.exec("DELETE FROM follow_reqs WHERE a = ? AND b = ?", uid, u.uid);
      notify(sql, to, "unfollow", uid);
    }
    return json({ ok: true, following: !!b.on && !requested, requested, followers: counts(sql, u.uid, true).followers });
  }
  if (op === "follow-answer") {
    // 同意或拒絕別人的追蹤要求。同意：對方開始追蹤我，並通知他「接受了你的追蹤要求」；拒絕：要求刪掉，不通知對方
    const u = one(sql, "SELECT uid FROM users WHERE name = ?", String(b.name || ""));
    if (!u || !one(sql, "SELECT 1 AS x FROM follow_reqs WHERE a = ? AND b = ?", u.uid, uid)) return json({ error: "not found" }, 404);
    acceptReq(sql, u.uid, uid, !!b.ok);
    if (b.ok) await pushTo(hub, sql, u.uid.slice(0, 40), "follow", uid, (who) => ({ title: `${who}接受了你的追蹤要求`, body: "現在可以看對方的片單和短評了。", tag: "accepted:" + uid.slice(0, 12) }), true);
    return json({ ok: true, followers: counts(sql, uid, false).followers });
  }
  if (op === "wipe") {
    // 一次處理 20 部：評分伺服器那邊的票和短評拿掉，這邊的片單刪掉；全部清完才刪個人檔案和追蹤關係
    const rows = all(sql, "SELECT k, s FROM entries WHERE uid = ? LIMIT 20", uid);
    for (const r of rows) {
      if (r.s && rate) { const out = await rate.vote(r.k, udev(uid), 0); if (out && out.error) continue; }
      sql.exec("DELETE FROM entries WHERE uid = ? AND k = ?", uid, r.k);
    }
    const left = one(sql, "SELECT COUNT(*) AS c FROM entries WHERE uid = ?", uid).c;
    if (!left) {
      sql.exec("DELETE FROM follows WHERE a = ? OR b = ?", uid, uid);
      sql.exec("DELETE FROM follow_reqs WHERE a = ? OR b = ?", uid, uid);
      sql.exec('DELETE FROM activity WHERE "to" = ? OR actor = ?', uid.slice(0, 40), uid);
      sql.exec('DELETE FROM activity_seen WHERE "to" = ?', uid.slice(0, 40));
      sql.exec("DELETE FROM user_reports WHERE uid = ? OR by = ?", uid, uid);
      sql.exec("DELETE FROM users WHERE uid = ?", uid);
      sql.exec("DELETE FROM write_quota WHERE uid = ?", uid);
    }
    return json({ ok: true, left });
  }
  if (op === "adopt") {
    if (!rate) return json({ error: "評分伺服器沒有連上" }, 502);
    // 登入後：把這台裝置匿名評過的片併進帳號。keys = [{ k, title }]，一次最多 20 部
    if (!okDev(b.d) || !Array.isArray(b.keys)) return json({ error: "bad request" }, 400);
    let n = 0;
    for (const it of b.keys.slice(0, 20)) {
      if (!it || !okKey(it.k)) continue;
      const r = await rate.adopt(it.k, b.d, udev(uid));
      if (!r || r.error) continue;
      if (r.s) { upsertEntry(sql, uid, it.k, it.title, { s: r.s, x: r.x, sp: r.sp, ...(r.at ? { at: r.at } : {}) }); n++; }
    }
    return json({ ok: true, adopted: n });
  }
  if (!okKey(m)) return json({ error: "bad request" }, 400);
  if (op === "entry") {
    // 片單上的一筆：看過的日期、要不要只給自己看；也可以只標「看過」不評分（seen 給日期或 "?" = 看過但不記日期）
    const patch = {};
    if (b.seen !== undefined) { const seen = b.seen === "?" ? "?" : String(b.seen || ""); if (seen !== "?" && !okDate(seen)) return json({ error: "bad date" }, 400); patch.seen = seen; patch.touch = !one(sql, "SELECT 1 AS x FROM entries WHERE uid = ? AND k = ?", uid, m); }
    if (b.priv !== undefined) patch.priv = b.priv ? 1 : 0;
    if (b.how !== undefined) {
      if (!Array.isArray(b.how) || b.how.some((x) => HOW.indexOf(x) < 0)) return json({ error: "bad request" }, 400);
      patch.how = HOW.filter((x) => b.how.indexOf(x) >= 0).join(",");
      if (!patch.how && b.seen === undefined) { const old = one(sql, "SELECT seen FROM entries WHERE uid = ? AND k = ?", uid, m); if (old && old.seen === "?" ) patch.seen = "?"; }
    }
    const e = upsertEntry(sql, uid, m, b.title, patch);
    return json({ ok: true, entry: e ? entryOut({ ...e, k: m }) : null });
  }
  if (!rate) return json({ error: "評分伺服器沒有連上" }, 502);
  if (op === "vote") {
    const s = Number(b.s);
    const r = await rate.vote(m, udev(uid), s);
    const bad = fail(r);
    if (bad) return bad;
    // 取消評分：短評跟著沒了；有標「看過」的那一筆留著
    upsertEntry(sql, uid, m, b.title, s ? { s, touch: true } : { s: 0, x: "", sp: 0 });
    return json(r);
  }
  if (op === "tags") {
    const r = await rate.tags(m, udev(uid), b.t);
    return fail(r) || json(r);
  }
  if (op === "note-add" || op === "note-del" || op === "note-spoil") {
    // 新增一則／刪掉自己的某一則。片單上那一筆記的是「最新的一則」
    const r = op === "note-add" ? await rate.noteAdd(m, udev(uid), b.x, b.sp, Number(b.r) || 0) : op === "note-spoil" ? await rate.noteSpoil(m, udev(uid), Number(b.id), b.sp ? 1 : 0) : await rate.noteDel(m, udev(uid), Number(b.id));
    const bad = fail(r);
    if (bad) return bad;
    // 片單上記的是自己最新的一則「短評」（回覆別人的不算）
    if (r.t) delete r.t; // 發通知用的資料不傳給 App
    if (op === "note-add") await notifyMentions(hub, sql, b.x, uid, { k: m, title: b.title, sp: b.sp }, []);
    const mine = (r.notes || []).filter((n) => n.mine && !n.r).sort((x, y) => y.at - x.at)[0];
    upsertEntry(sql, uid, m, b.title, { x: mine ? mine.x : "", sp: mine ? mine.sp : 0, ...(mine ? { s: mine.s } : {}), touch: op === "note-add" && !b.r });
    return json(withAuthors(sql, r, uid, m));
  }
  if (op === "note") {
    const r = await rate.note(m, udev(uid), b.x, b.sp);
    const bad = fail(r);
    if (bad) return bad;
    const mine = (r.notes || []).find((n) => n.mine);
    upsertEntry(sql, uid, m, b.title, { x: mine ? mine.x : "", sp: mine ? mine.sp : 0, ...(mine ? { s: mine.s } : {}), touch: !!mine });
    return json(withAuthors(sql, r, uid, m));
  }
  return json({ error: "not found" }, 404);
}

/** 短評清單：把作者的帳號代號換成暱稱（個人頁公開、那一筆沒設成只給自己看才顯示；其他一律匿名），並標出我追蹤的人。回給 App 的不含任何代號 */
function withAuthors(sql, r, uid, m) {
  const ids = Array.from(new Set((r.notes || []).map((n) => n.a).filter(Boolean)));
  const by = {};
  if (ids.length) {
    // 帳號代號是識別碼的前 40 個字：用前綴找回是哪個帳號
    for (const a of ids.slice(0, 100)) {
      const u = one(sql, "SELECT u.uid, u.name, u.color, u.emoji, u.pub, u.hidden, e.priv FROM users u LEFT JOIN entries e ON e.uid = u.uid AND e.k = ? WHERE u.uid >= ? AND u.uid < ? LIMIT 1", m, a, a + "g");
      if (u && u.pub && !u.hidden && !u.priv) by[a] = { ...userOut(u), ...(uid && one(sql, "SELECT 1 AS x FROM follows WHERE a = ? AND b = ?", uid, u.uid) ? { f: 1 } : {}) };
    }
  }
  return { ...r, notes: (r.notes || []).map((n) => { const { a, ...rest } = n; return a && by[a] ? { ...rest, by: by[a] } : rest; }) };
}

/** 管理員：帳號管理。list 被檢舉的和被藏起來的／find 用暱稱找／hide 把個人頁藏起來或恢復／rename 強制改暱稱（暱稱不雅、冒名時用） */
export function socialAdmin(hub, b) {
  const sql = hub.state.storage.sql;
  const row = (u) => ({ ...userOut(u), pub: !!u.pub, hidden: !!u.hidden, films: one(sql, "SELECT COUNT(*) AS c FROM entries WHERE uid = ?", u.uid).c, reports: all(sql, "SELECT why, COUNT(*) AS c FROM user_reports WHERE uid = ? GROUP BY why", u.uid).reduce((o, r) => ({ ...o, [r.why]: r.c }), {}) });
  const u = b.name ? one(sql, "SELECT * FROM users WHERE name = ?", String(b.name)) : null;
  if (b.op === "hide" || b.op === "rename" || b.op === "clear") {
    if (!u) return json({ error: "找不到這個帳號" }, 404);
    if (b.op === "hide") sql.exec("UPDATE users SET hidden = ? WHERE uid = ?", b.on ? 1 : 0, u.uid);
    if (b.op === "clear") sql.exec("DELETE FROM user_reports WHERE uid = ?", u.uid);
    if (b.op === "rename") {
      const name = String(b.to || "").trim().normalize("NFC");
      if (!NAME_RE.test(name)) return json({ error: "新暱稱格式不對" }, 400);
      if (one(sql, "SELECT 1 AS x FROM users WHERE name = ? AND uid != ?", name, u.uid)) return json({ error: "這個暱稱有人用了" }, 409);
      sql.exec("UPDATE users SET name = ?, named = ? WHERE uid = ?", name, Date.now(), u.uid);
    }
  }
  if (b.op === "find") return json({ ok: true, list: all(sql, "SELECT * FROM users WHERE name LIKE ? ESCAPE '\\' ORDER BY name LIMIT 30", String(b.q || "").replace(/[\\%_]/g, "\\$&") + "%").map(row) });
  const list = all(sql, "SELECT u.* FROM users u WHERE u.hidden = 1 OR EXISTS (SELECT 1 FROM user_reports r WHERE r.uid = u.uid) ORDER BY u.name LIMIT 100").map(row);
  return json({ ok: true, list, users: one(sql, "SELECT COUNT(*) AS c FROM users").c });
}
