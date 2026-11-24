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
  sql.exec("CREATE INDEX IF NOT EXISTS entries_at ON entries (at)");
  sql.exec("CREATE INDEX IF NOT EXISTS entries_k ON entries (k)");
  sql.exec("CREATE TABLE IF NOT EXISTS follows (a TEXT NOT NULL, b TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (a, b))");
  sql.exec("CREATE INDEX IF NOT EXISTS follows_b ON follows (b)");
  sql.exec("CREATE TABLE IF NOT EXISTS user_reports (uid TEXT NOT NULL, by TEXT NOT NULL, why TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (uid, by))");
  sql.exec("CREATE TABLE IF NOT EXISTS write_quota (uid TEXT PRIMARY KEY, start INTEGER NOT NULL, n INTEGER NOT NULL)");
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
const okEmoji = (e) => e === "" || (typeof e === "string" && e.length <= 32 && EMOJI_RE.test(e));

/** 這個帳號的數字：片單幾部、短評幾則、追蹤幾人、被幾人追蹤 */
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
  // 登入的人是誰（沒帶憑證就是 null；憑證不對回 401）
  let uid = "";
  if (b.token) {
    if (!/^[0-9a-f]{64}$/.test(String(b.token))) return json({ error: "not signed in" }, 401);
    const sess = await hub.state.storage.get("t:" + (await sha256hex(String(b.token))));
    if (!sess) return json({ error: "not signed in" }, 401);
    uid = sess.uid;
  }
  const me = uid ? one(sql, "SELECT * FROM users WHERE uid = ?", uid) : null;
  const need = () => (uid ? null : json({ error: "not signed in" }, 401));
  const m = b.m;
  const fail = (r) => (r && r.error ? json({ error: r.error }, r.error === "vote first" ? 409 : r.error === "too long" || r.error === "no links" ? 422 : 400) : null);

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
    return fail(r) || json(withAuthors(sql, r, uid, m));
  }
  if (op === "profile") {
    const u = one(sql, "SELECT * FROM users WHERE name = ?", String(b.name || ""));
    if (!u || (u.hidden && u.uid !== uid)) return json({ error: "not found" }, 404);
    const self = u.uid === uid;
    if (!u.pub && !self) return json({ ok: true, user: userOut(u), private: true });
    const where = self ? "" : " AND priv = 0";
    const offset = Math.max(0, Number(b.offset) || 0);
    const list = all(sql, "SELECT * FROM entries WHERE uid = ?" + where + " ORDER BY at DESC LIMIT 50 OFFSET ?", u.uid, offset).map(entryOut);
    const dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const r of all(sql, "SELECT s, COUNT(*) AS c FROM entries WHERE uid = ? AND s > 0" + where + " GROUP BY s", u.uid)) if (r.s >= 1 && r.s <= 10) dist[r.s - 1] = r.c;
    return json({ ok: true, user: userOut(u), self, since: u.at, counts: counts(sql, u.uid, !self), dist, list, following: !!(uid && one(sql, "SELECT 1 AS x FROM follows WHERE a = ? AND b = ?", uid, u.uid)) });
  }
  if (op === "people") {
    const q = String(b.q || "").trim().slice(0, 16);
    const rows = q
      ? all(sql, "SELECT u.*, (SELECT COUNT(*) FROM entries e WHERE e.uid = u.uid AND e.priv = 0) AS films FROM users u WHERE u.pub = 1 AND u.hidden = 0 AND u.name LIKE ? ESCAPE '\\' ORDER BY films DESC LIMIT 30", q.replace(/[\\%_]/g, "\\$&") + "%")
      : all(sql, "SELECT u.*, COUNT(e.k) AS films, MAX(e.at) AS last FROM users u JOIN entries e ON e.uid = u.uid AND e.priv = 0 WHERE u.pub = 1 AND u.hidden = 0 GROUP BY u.uid ORDER BY last DESC LIMIT 30");
    const mine = uid ? new Set(all(sql, "SELECT b FROM follows WHERE a = ?", uid).map((r) => r.b)) : new Set();
    return json({ ok: true, list: rows.filter((u) => u.uid !== uid).map((u) => ({ ...userOut(u), films: u.films, following: mine.has(u.uid) })) });
  }
  if (op === "report-user") {
    const by = uid || (okDev(b.d) ? "d:" + b.d : "");
    const u = one(sql, "SELECT uid FROM users WHERE name = ?", String(b.name || ""));
    if (!by || !u || ["name", "fake", "abuse"].indexOf(b.why) < 0) return json({ error: "bad request" }, 400);
    if (u.uid !== uid) sql.exec("INSERT OR IGNORE INTO user_reports (uid, by, why, at) VALUES (?, ?, ?, ?)", u.uid, by, b.why, Date.now());
    return json({ ok: true });
  }

  // ── 以下都要登入 ──
  const no = need();
  if (no) return no;
  if (op === "me") return json({ ok: true, user: me ? { ...userOut(me), pub: !!me.pub, hidden: !!me.hidden, canRename: Date.now() - me.named > RENAME_EVERY } : null, counts: counts(sql, uid, false) });
  if (op === "mine") {
    const offset = Math.max(0, Number(b.offset) || 0);
    return json({ ok: true, list: all(sql, "SELECT * FROM entries WHERE uid = ? ORDER BY at DESC LIMIT 100 OFFSET ?", uid, offset).map(entryOut), total: counts(sql, uid, false).films });
  }
  if (op === "feed") {
    const rows = all(sql, "SELECT e.*, u.name, u.color, u.emoji FROM follows f JOIN users u ON u.uid = f.b AND u.pub = 1 AND u.hidden = 0 JOIN entries e ON e.uid = f.b AND e.priv = 0 WHERE f.a = ? ORDER BY e.at DESC LIMIT 60", uid);
    return json({ ok: true, list: rows.map((r) => ({ ...entryOut(r), by: userOut(r) })), following: counts(sql, uid, false).following });
  }
  if (op === "friends") {
    if (!okKey(m)) return json({ error: "bad request" }, 400);
    const rows = all(sql, "SELECT e.*, u.name, u.color, u.emoji FROM follows f JOIN users u ON u.uid = f.b AND u.pub = 1 AND u.hidden = 0 JOIN entries e ON e.uid = f.b AND e.priv = 0 AND e.k = ? WHERE f.a = ? ORDER BY e.at DESC LIMIT 30", m, uid);
    return json({ ok: true, list: rows.map((r) => ({ ...entryOut(r), by: userOut(r) })) });
  }
  if (op === "stats") {
    if (!okKey(m) || !rate) return json({ error: "bad request" }, 400);
    const r = await rate.stats(m, udev(uid));
    return fail(r) || json(r);
  }

  // 會寫入的動作：先看有沒有超過次數
  if (!quotaOk(sql, uid)) return json({ error: "too many" }, 429);
  if (op === "profile-set") {
    const name = String(b.name || "").trim().normalize("NFC");
    const color = okColor(b.color) ? String(b.color).toLowerCase() : me ? me.color : "blue";
    const emoji = b.emoji === undefined ? (me ? me.emoji || "" : "") : String(b.emoji || "").trim();
    if (!okEmoji(emoji)) return json({ error: "bad emoji" }, 400);
    const pub = b.pub ? 1 : 0;
    if (!NAME_RE.test(name) || RESERVED.test(name)) return json({ error: "bad name" }, 400);
    const taken = one(sql, "SELECT uid FROM users WHERE name = ?", name);
    if (taken && taken.uid !== uid) return json({ error: "name taken" }, 409);
    if (me && me.name !== name && Date.now() - me.named <= RENAME_EVERY) return json({ error: "rename later" }, 429);
    if (me) sql.exec("UPDATE users SET name = ?, color = ?, emoji = ?, pub = ?, named = ? WHERE uid = ?", name, color, emoji, pub, me.name !== name ? Date.now() : me.named, uid);
    else sql.exec("INSERT INTO users (uid, name, color, emoji, pub, at, named) VALUES (?, ?, ?, ?, ?, ?, 0)", uid, name, color, emoji, pub, Date.now());
    return json({ ok: true, user: { name, color, pub: !!pub, ...(emoji ? { emoji } : {}) } });
  }
  if (op === "follow") {
    const u = one(sql, "SELECT uid, pub, hidden FROM users WHERE name = ?", String(b.name || ""));
    if (!u || u.uid === uid) return json({ error: "not found" }, 404);
    if (b.on) {
      if (!u.pub || u.hidden) return json({ error: "private" }, 403);
      if (one(sql, "SELECT COUNT(*) AS c FROM follows WHERE a = ?", uid).c >= 500) return json({ error: "too many follows" }, 400);
      sql.exec("INSERT OR IGNORE INTO follows (a, b, at) VALUES (?, ?, ?)", uid, u.uid, Date.now());
    } else sql.exec("DELETE FROM follows WHERE a = ? AND b = ?", uid, u.uid);
    return json({ ok: true, following: !!b.on, followers: counts(sql, u.uid, true).followers });
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
