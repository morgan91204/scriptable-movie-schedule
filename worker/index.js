// 片刻：觀眾即時評分（Cloudflare Worker + Durable Objects）
// 每部片一個 Durable Object（內建 SQLite），一台裝置一票、可以改票或取消，同時投票也不會算錯。
// 分數是 10 分制（1～10）。2026-11 以前是 5 星制：舊的評分在每部片第一次被讀到時一次換算成 ×2（1 星 → 2 分…5 星 → 10 分）。
// API（v2，10 分制）：
//   GET  /v2/stats?m=<片名鍵>&d=<裝置代號>   → { n, avg, dist:[1分..10分人數], mine }
//   POST /v2/vote  { m, d, s }               → 同上（s = 1～10；0 = 取消評分）
//   GET  /v2/all                             → { movies: { <片名鍵>: [1分..10分人數] }, tags: { <片名鍵>: { <標籤>: 人數 } }, notes: { <片名鍵>: 短評則數 } }（所有有人評分的片）
//   POST /v2/tags  { m, d, t:[標籤代號] }    → 同 stats（心得標籤：要先評過分才能選，最多 5 個；取消評分時標籤一起拿掉）
//   stats／vote／tags 的回應另外帶 tags（各標籤幾人選）、myTags（這台裝置選的）、notes（看得到的短評有幾則）
// 短評（一句話心得，最多 60 字；要先評過分，一台裝置一部片一則）：
//   GET  /v2/notes?m=&d=                     → { notes: [{ id, x, sp, s, at, mine, hidden }], reported: [id] }（新的在前，最多 100 則；被隱藏的只有作者自己看得到）
//   POST /v2/note   { m, d, x, sp }          → 同上（x 空字串 = 刪掉自己的短評；sp = 作者自己標「可能有雷」）
//   POST /v2/report { m, d, id, why }        → 同上（why：spoiler 劇透／abuse 不當內容／spam 廣告）
//     檢舉規則：同一則被 2 台不同裝置檢舉劇透 → 自動標成「可能有雷」（摺疊）；被 3 台不同裝置檢舉 → 自動隱藏。站長可以還原（還原後不再被自動隱藏）
//   GET  /v2/notes-all                       → { movies: { <片名鍵>: [{ id, x, sp, s, at }] } }（所有看得到的短評；每 30 分鐘匯出成靜態檔，也是備份）
//   POST /admin { op, m, id, notes }         → 站長管理（要帶 x-admin-key；金鑰只由 GitHub Actions 的「短評管理」臨時產生、用完就換掉）
//     op：flagged 列出被檢舉的／hide 隱藏／restore 還原／delete 刪除／import 從備份匯回
// 伺服器不會把裝置代號傳給任何人：短評對外只有流水號。
// 舊版 App 用的 v1（5 星制）照常能用：投 n 星存成 2n 分；讀的時候把 10 分制兩兩併成 5 星（1–2 分 = 1 星…9–10 分 = 5 星）
// 省請求數：GitHub Actions 每 30 分鐘把 /v1/all 存成靜態檔，App 平常讀靜態檔，只有投票（和每部片第一次查自己的票）才會打到這裡。
import { DurableObject } from "cloudflare:workers";

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: HEADERS });
const okMovie = (m) => typeof m === "string" && m.length >= 1 && m.length <= 120;
const okDevice = (d) => typeof d === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(d);
// 心得標籤：只收代號（小寫英文），有哪些標籤、叫什麼名字由 App 決定；不收任何自由輸入的文字
const TAGS_MAX = 5;
// 短評
const NOTE_MAX = 60; // 最多幾個字
const REPORT_WHY = ["spoiler", "abuse", "spam"];
const REPORT_SPOILER = 2; // 幾台裝置檢舉劇透就自動標成可能有雷
const REPORT_HIDE = 3; // 幾台裝置檢舉就自動隱藏
/** 整理短評文字：去掉控制字元、看不見的字元，換行和連續空白併成一個空白 */
const cleanNote = (x) => String(x == null ? "" : x).normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, " ").replace(/\s+/g, " ").trim();
/** 不收連結和聯絡方式（擋廣告）：網址、常見網域、8 位以上的連續數字、LINE／IG 帳號 */
const noteHasContact = (x) => /https?:|www\.|[a-z0-9-]+\.(com|net|org|tw|cc|io|me|ly|gg|xyz|shop|top)\b|\d{8,}|(?:line|ig|telegram|tg|賴)\s*(?:id)?\s*[:：@]/i.test(x);
const okTags = (t) => Array.isArray(t) && t.length <= TAGS_MAX && t.every((x) => typeof x === "string" && /^[a-z]{2,10}$/.test(x)) && new Set(t).size === t.length;
/** 10 分制的各分人數 → 5 星制（給舊版 App）：1–2 分算 1 星…9–10 分算 5 星 */
const dist5 = (d10) => [0, 1, 2, 3, 4].map((i) => (Number(d10[i * 2]) || 0) + (Number(d10[i * 2 + 1]) || 0));
/** 還沒換算的舊資料（只有 5 格）→ 10 分制：n 星放在 2n 分 */
const dist10 = (d) => (d.length > 5 ? Array.from({ length: 10 }, (_, i) => Number(d[i]) || 0) : Array.from({ length: 10 }, (_, i) => (i % 2 ? Number(d[(i - 1) / 2]) || 0 : 0)));
/** 10 分制的統計 → 5 星制的統計（給舊版 App） */
const stats5 = (o) => {
  const dist = dist5(o.dist);
  const sum = dist.reduce((a, c, i) => a + c * (i + 1), 0);
  return { n: o.n, avg: o.n ? Math.round((sum / o.n) * 10) / 10 : 0, dist, mine: Math.ceil((o.mine || 0) / 2) };
};

/** 比對兩段文字是不是一樣（先各自雜湊再比，花的時間不會洩漏對了幾個字） */
async function sameText(a, b) {
  const h = async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

// 2026-11-23 改成 10 分制時，站長決定把在那之前的評分全部清掉、重新開始（不讓舊的 5 星換算結果影響新制）。
// 這個時間點以前投的票：每部片第一次被讀到時刪掉，總表也清空一次。之後投的不受影響
const RESET_BEFORE = 1795418236644;

// 同一個 IP 10 分鐘內最多投 60 次（擋灌票，一般人不會碰到）
const LIMIT_MAX = 60;
const LIMIT_WINDOW = 600e3;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
    try {
      if (url.pathname === "/") return json({ ok: true, service: "movie-ratings" });

      const v = (url.pathname.match(/^\/v([12])\//) || [])[1]; // 1 = 舊版 App（5 星制），2 = 10 分制
      const path = url.pathname.replace(/^\/v[12]\//, "/");
      const shape = (o) => (v === "1" ? stats5(o) : o);

      if (v && path === "/stats" && req.method === "GET") {
        const m = url.searchParams.get("m") || "";
        const d = url.searchParams.get("d") || "";
        if (!okMovie(m)) return json({ error: "bad movie" }, 400);
        return json(shape(await env.MOVIE.get(env.MOVIE.idFromName(m)).stats(okDevice(d) ? d : "", m)));
      }

      if (v && path === "/all" && req.method === "GET") {
        const all = await env.INDEX.get(env.INDEX.idFromName("all")).all();
        for (const k of Object.keys(all)) all[k] = v === "1" ? dist5(dist10(all[k])) : dist10(all[k]);
        if (v === "1") return json({ movies: all });
        const index = env.INDEX.get(env.INDEX.idFromName("all"));
        const notes = {}; // 每部片看得到的短評有幾則
        for (const [k, list] of Object.entries(await index.allNotes())) notes[k] = list.length;
        // pending = 被檢舉過、還沒有人處理的短評有幾則（只有數字，讓匯出的排程提醒站長去看）
        return json({ movies: all, tags: await index.allTags(), notes, pending: await index.pending() });
      }

      if (v && path === "/vote" && req.method === "POST") {
        let b;
        try {
          b = await req.json();
        } catch (_) {
          return json({ error: "bad json" }, 400);
        }
        const m = b && b.m, d = b && b.d, s = Number(b && b.s);
        if (!okMovie(m) || !okDevice(d) || !Number.isInteger(s) || s < 0 || s > (v === "1" ? 5 : 10)) return json({ error: "bad request" }, 400);
        const ip = req.headers.get("cf-connecting-ip") || "unknown";
        if (!(await env.LIMIT.get(env.LIMIT.idFromName(ip)).hit(LIMIT_MAX, LIMIT_WINDOW))) return json({ error: "too many votes, try later" }, 429);
        return json(shape(await env.MOVIE.get(env.MOVIE.idFromName(m)).vote(d, v === "1" ? s * 2 : s, m)));
      }

      if (v === "2" && path === "/tags" && req.method === "POST") {
        let b;
        try {
          b = await req.json();
        } catch (_) {
          return json({ error: "bad json" }, 400);
        }
        const m = b && b.m, d = b && b.d, t = b && b.t;
        if (!okMovie(m) || !okDevice(d) || !okTags(t)) return json({ error: "bad request" }, 400);
        const ip = req.headers.get("cf-connecting-ip") || "unknown";
        if (!(await env.LIMIT.get(env.LIMIT.idFromName(ip)).hit(LIMIT_MAX, LIMIT_WINDOW))) return json({ error: "too many votes, try later" }, 429);
        const out = await env.MOVIE.get(env.MOVIE.idFromName(m)).setTags(d, t, m);
        return out ? json(out) : json({ error: "vote first" }, 409);
      }

      if (v === "2" && path === "/notes" && req.method === "GET") {
        const m = url.searchParams.get("m") || "";
        const d = url.searchParams.get("d") || "";
        if (!okMovie(m)) return json({ error: "bad movie" }, 400);
        return json(await env.MOVIE.get(env.MOVIE.idFromName(m)).listNotes(okDevice(d) ? d : ""));
      }

      if (v === "2" && path === "/notes-all" && req.method === "GET") return json({ movies: await env.INDEX.get(env.INDEX.idFromName("all")).allNotes() });

      if (v === "2" && (path === "/note" || path === "/report") && req.method === "POST") {
        let b;
        try {
          b = await req.json();
        } catch (_) {
          return json({ error: "bad json" }, 400);
        }
        const m = b && b.m, d = b && b.d;
        if (!okMovie(m) || !okDevice(d)) return json({ error: "bad request" }, 400);
        const ip = req.headers.get("cf-connecting-ip") || "unknown";
        if (!(await env.LIMIT.get(env.LIMIT.idFromName(ip)).hit(LIMIT_MAX, LIMIT_WINDOW))) return json({ error: "too many requests, try later" }, 429);
        const movie = env.MOVIE.get(env.MOVIE.idFromName(m));
        if (path === "/report") {
          const id = Number(b.id), why = String(b.why || "");
          if (!Number.isInteger(id) || id < 1 || REPORT_WHY.indexOf(why) < 0) return json({ error: "bad request" }, 400);
          return json(await movie.report(d, id, why, m));
        }
        if (typeof b.x !== "string" || b.x.length > 600) return json({ error: "bad request" }, 400);
        const x = cleanNote(b.x);
        if (Array.from(x).length > NOTE_MAX) return json({ error: "too long" }, 422);
        if (x && noteHasContact(x)) return json({ error: "no links" }, 422);
        const out = await movie.setNote(d, x, b.sp ? 1 : 0, m);
        return out ? json(out) : json({ error: "vote first" }, 409);
      }

      if (url.pathname === "/admin" && req.method === "POST") {
        // 金鑰沒設、太短、或對不上都當成沒有這個網址
        const key = req.headers.get("x-admin-key") || "";
        const want = String(env.ADMIN_KEY || "");
        if (want.length < 32 || !(await sameText(key, want))) return json({ error: "not found" }, 404);
        let b;
        try {
          b = await req.json();
        } catch (_) {
          return json({ error: "bad json" }, 400);
        }
        const op = String((b && b.op) || "");
        if (op === "flagged") return json({ flagged: await env.INDEX.get(env.INDEX.idFromName("all")).flagged() });
        if (!okMovie(b.m)) return json({ error: "bad movie" }, 400);
        const movie = env.MOVIE.get(env.MOVIE.idFromName(b.m));
        if (op === "hide" || op === "restore" || op === "delete") {
          if (!Number.isInteger(Number(b.id))) return json({ error: "bad id" }, 400);
          return json(await movie.moderate(op, Number(b.id), b.m));
        }
        if (op === "import" && Array.isArray(b.notes)) return json(await movie.importNotes(b.notes.slice(0, 500), b.m));
        return json({ error: "bad op" }, 400);
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: "server error" }, 500);
    }
  },
};

/** 一部電影的所有評分 */
export class Movie extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS votes (dev TEXT PRIMARY KEY, score INTEGER NOT NULL, at INTEGER NOT NULL)");
    // 5 星制 → 10 分制：舊的分數一次換算成 ×2。換算和「已經換算過」的記號寫在同一筆交易裡，不會只做一半、也不會做兩次
    this.sql.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
    if (!this.sql.exec("SELECT v FROM meta WHERE k = 'scale'").toArray().length) {
      ctx.storage.transactionSync(() => {
        this.sql.exec("UPDATE votes SET score = score * 2");
        this.sql.exec("INSERT INTO meta (k, v) VALUES ('scale', '10')");
      });
    }
    // 清掉改制以前的舊評分（一次性；刪除和「已經清過」的記號寫在同一筆交易裡）
    if (!this.sql.exec("SELECT v FROM meta WHERE k = 'reset'").toArray().length) {
      ctx.storage.transactionSync(() => {
        this.sql.exec("DELETE FROM votes WHERE at < ?", RESET_BEFORE);
        this.sql.exec("INSERT INTO meta (k, v) VALUES ('reset', ?)", String(RESET_BEFORE));
      });
    }
    this.ensureTags();
    // 短評：一台裝置一則。keep = 站長還原過（不再被自動隱藏）；rs = 從備份匯回時記的分數（平常分數直接對評分表）
    this.sql.exec("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, dev TEXT UNIQUE NOT NULL, x TEXT NOT NULL, sp INTEGER NOT NULL DEFAULT 0, at INTEGER NOT NULL, hidden INTEGER NOT NULL DEFAULT 0, keep INTEGER NOT NULL DEFAULT 0, rs INTEGER)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS note_reports (id INTEGER NOT NULL, dev TEXT NOT NULL, why TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (id, dev))");
  }
  /** 心得標籤的欄位（後來才加的）：第一次用到時補上 */
  ensureTags() {
    if (this.sql.exec("SELECT v FROM meta WHERE k = 'tags'").toArray().length) return;
    this.ctx.storage.transactionSync(() => {
      this.sql.exec("ALTER TABLE votes ADD COLUMN tags TEXT NOT NULL DEFAULT ''");
      this.sql.exec("INSERT INTO meta (k, v) VALUES ('tags', '1')");
    });
  }
  /** 把這部片的統計同步到總表（有變才送）；失敗不影響投票 */
  async sync(key, dist, tags = {}) {
    if (!key) return;
    const names = Object.keys(tags).sort();
    // 前面的 10 = 十分制（跟換算前存的記號不同，換算後會重新同步一次）；沒有標籤時記號跟以前一樣，不會全部重送
    const sig = "10:" + dist.join(",") + (names.length ? "|" + names.map((k) => k + tags[k]).join(",") : "");
    if ((await this.ctx.storage.get("indexed")) === sig) return;
    try {
      await this.env.INDEX.get(this.env.INDEX.idFromName("all")).put(key, dist, tags);
      await this.ctx.storage.put("indexed", sig);
    } catch (_) {}
  }
  async stats(dev, key) {
    const out = this.count(dev);
    await this.sync(key, out.dist, out.tags); // 跟總表對一次（有變才送）：有評分的補進去，清空了的從總表拿掉
    return out;
  }
  /** 心得標籤：要先評過分；回傳 null = 還沒評分 */
  async setTags(dev, tags, key) {
    if (!this.sql.exec("SELECT 1 FROM votes WHERE dev = ?", dev).toArray().length) return null;
    this.sql.exec("UPDATE votes SET tags = ? WHERE dev = ?", tags.join(","), dev);
    const out = this.count(dev);
    await this.sync(key, out.dist, out.tags);
    return out;
  }
  async vote(dev, score, key) {
    if (score === 0) {
      this.sql.exec("DELETE FROM votes WHERE dev = ?", dev);
      this.dropNote(dev); // 取消評分：短評一起刪
    }
    else this.sql.exec("INSERT INTO votes (dev, score, at) VALUES (?, ?, ?) ON CONFLICT(dev) DO UPDATE SET score = excluded.score, at = excluded.at", dev, score, Date.now());
    const out = this.count(dev);
    await this.sync(key, out.dist, out.tags);
    if (score === 0) await this.syncNotes(key);
    return out;
  }

  // ── 短評 ──
  dropNote(dev) {
    const row = this.sql.exec("SELECT id FROM notes WHERE dev = ?", dev).toArray()[0];
    if (!row) return;
    this.sql.exec("DELETE FROM note_reports WHERE id = ?", row.id);
    this.sql.exec("DELETE FROM notes WHERE id = ?", row.id);
  }
  /** 這部片的短評（新的在前）。被隱藏的只有作者自己看得到（會標 hidden，讓他知道別人看不到了） */
  listNotes(dev) {
    const notes = [];
    for (const r of this.sql.exec("SELECT n.id, n.x, n.sp, n.at, n.hidden, n.dev, COALESCE(v.score, n.rs, 0) AS s FROM notes n LEFT JOIN votes v ON v.dev = n.dev WHERE n.hidden = 0 OR n.dev = ? ORDER BY n.at DESC, n.id DESC LIMIT 100", dev || "")) {
      const mine = !!dev && r.dev === dev;
      notes.push({ id: r.id, x: r.x, sp: r.sp ? 1 : 0, s: r.s, at: r.at, ...(mine ? { mine: 1 } : {}), ...(r.hidden ? { hidden: 1 } : {}) });
    }
    const reported = dev ? this.sql.exec("SELECT id FROM note_reports WHERE dev = ?", dev).toArray().map((r) => r.id) : [];
    return { notes, reported };
  }
  /** 寫／改／刪自己的短評。要先評過分；回傳 null = 還沒評分。改內容等於換一則新的（流水號換新、之前的檢舉不算） */
  async setNote(dev, x, sp, key) {
    if (!this.sql.exec("SELECT 1 FROM votes WHERE dev = ?", dev).toArray().length) return null;
    const old = this.sql.exec("SELECT id, x FROM notes WHERE dev = ?", dev).toArray()[0];
    if (old && x && old.x === x) this.sql.exec("UPDATE notes SET sp = MAX(sp, ?) WHERE id = ?", sp, old.id); // 只改「可能有雷」：可以自己加上，不能把被檢舉標上的拿掉
    else {
      this.dropNote(dev);
      if (x) this.sql.exec("INSERT INTO notes (dev, x, sp, at) VALUES (?, ?, ?, ?)", dev, x, sp, Date.now());
    }
    await this.syncNotes(key);
    return this.listNotes(dev);
  }
  /** 檢舉：一台裝置對一則只算一次，不能檢舉自己的 */
  async report(dev, id, why, key) {
    const note = this.sql.exec("SELECT dev, keep FROM notes WHERE id = ?", id).toArray()[0];
    if (note && note.dev !== dev) {
      this.sql.exec("INSERT OR IGNORE INTO note_reports (id, dev, why, at) VALUES (?, ?, ?, ?)", id, dev, why, Date.now());
      if (!note.keep) {
        const all = this.sql.exec("SELECT COUNT(*) AS c FROM note_reports WHERE id = ?", id).toArray()[0].c;
        const spoil = this.sql.exec("SELECT COUNT(*) AS c FROM note_reports WHERE id = ? AND why = 'spoiler'", id).toArray()[0].c;
        if (spoil >= REPORT_SPOILER) this.sql.exec("UPDATE notes SET sp = 1 WHERE id = ?", id);
        if (all >= REPORT_HIDE) this.sql.exec("UPDATE notes SET hidden = 1 WHERE id = ?", id);
      }
      await this.syncNotes(key);
    }
    return this.listNotes(dev);
  }
  /** 站長管理：隱藏、還原（還原後不再被自動隱藏）、刪除 */
  async moderate(op, id, key) {
    if (op === "hide") this.sql.exec("UPDATE notes SET hidden = 1, keep = 0 WHERE id = ?", id);
    if (op === "restore") this.sql.exec("UPDATE notes SET hidden = 0, keep = 1 WHERE id = ?", id);
    if (op === "delete") {
      this.sql.exec("DELETE FROM note_reports WHERE id = ?", id);
      this.sql.exec("DELETE FROM notes WHERE id = ?", id);
    }
    await this.syncNotes(key, true);
    return { ok: true, left: this.sql.exec("SELECT COUNT(*) AS c FROM notes").toArray()[0].c };
  }
  /** 從備份匯回：內容一樣的不重複加。匯回的短評沒有作者（原作者不能再改），分數用備份裡記的 */
  async importNotes(list, key) {
    let added = 0;
    for (const n of list) {
      const x = cleanNote(n && n.x);
      if (!x || Array.from(x).length > NOTE_MAX || this.sql.exec("SELECT 1 FROM notes WHERE x = ?", x).toArray().length) continue;
      const s = Number(n.s);
      this.sql.exec("INSERT INTO notes (dev, x, sp, at, rs) VALUES (?, ?, ?, ?, ?)", "restored:" + crypto.randomUUID(), x, n.sp ? 1 : 0, Number(n.at) || Date.now(), Number.isInteger(s) && s >= 1 && s <= 10 ? s : 0);
      added++;
    }
    await this.syncNotes(key, true);
    return { ok: true, added };
  }
  /** 把這部片的短評同步到總表：看得到的（給匯出、備份）和被檢舉過的（給站長看）。失敗不影響使用者的操作 */
  async syncNotes(key, must = false) {
    if (!key) return;
    const visible = [], flagged = [];
    for (const r of this.sql.exec("SELECT n.id, n.x, n.sp, n.at, n.hidden, n.keep, COALESCE(v.score, n.rs, 0) AS s FROM notes n LEFT JOIN votes v ON v.dev = n.dev ORDER BY n.at DESC, n.id DESC LIMIT 500")) {
      if (!r.hidden) visible.push({ id: r.id, x: r.x, sp: r.sp ? 1 : 0, s: r.s, at: r.at });
      const why = {};
      for (const w of this.sql.exec("SELECT why, COUNT(*) AS c FROM note_reports WHERE id = ? GROUP BY why", r.id)) why[w.why] = w.c;
      if (r.hidden || Object.keys(why).length) flagged.push({ id: r.id, x: r.x, sp: r.sp ? 1 : 0, hidden: r.hidden ? 1 : 0, keep: r.keep ? 1 : 0, why, at: r.at });
    }
    try {
      await this.env.INDEX.get(this.env.INDEX.idFromName("all")).putNotes(key, visible, flagged);
    } catch (e) {
      if (must) throw e;
    }
  }
  count(dev) {
    const dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const r of this.sql.exec("SELECT score, COUNT(*) AS c FROM votes GROUP BY score")) if (r.score >= 1 && r.score <= 10) dist[r.score - 1] = r.c;
    const n = dist.reduce((a, b) => a + b, 0);
    const sum = dist.reduce((a, c, i) => a + c * (i + 1), 0);
    const tags = {};
    for (const r of this.sql.exec("SELECT tags FROM votes WHERE tags != ''")) for (const t of String(r.tags).split(",")) if (t) tags[t] = (tags[t] || 0) + 1;
    let mine = 0, myTags = [];
    if (dev) {
      const row = this.sql.exec("SELECT score, tags FROM votes WHERE dev = ?", dev).toArray()[0];
      mine = row ? row.score : 0;
      myTags = row && row.tags ? String(row.tags).split(",").filter(Boolean) : [];
    }
    const notes = this.sql.exec("SELECT COUNT(*) AS c FROM notes WHERE hidden = 0").toArray()[0].c;
    return { n, avg: n ? Math.round((sum / n) * 10) / 10 : 0, dist, mine, tags, myTags, notes };
  }
}

/** 總表：所有有人評分的片，各分數人數（給 /v2/all 一次讀完）。換算成 10 分制以前存的是 5 格，讀出來時由上面的 dist10 補成 10 格 */
export class Index extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS summary (k TEXT PRIMARY KEY, d TEXT NOT NULL)");
    // 改制時把總表清空一次（舊評分全部不算）；之後有人投票，那部片會再同步進來
    this.sql.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
    if (!this.sql.exec("SELECT v FROM meta WHERE k = 'reset'").toArray().length) {
      ctx.storage.transactionSync(() => {
        this.sql.exec("DELETE FROM summary");
        this.sql.exec("INSERT INTO meta (k, v) VALUES ('reset', ?)", String(RESET_BEFORE));
      });
    }
    this.sql.exec("CREATE TABLE IF NOT EXISTS notes (k TEXT PRIMARY KEY, v TEXT NOT NULL, f TEXT NOT NULL)");
    // 心得標籤的欄位（後來才加的）
    if (!this.sql.exec("SELECT v FROM meta WHERE k = 'tags'").toArray().length) {
      ctx.storage.transactionSync(() => {
        this.sql.exec("ALTER TABLE summary ADD COLUMN t TEXT NOT NULL DEFAULT ''");
        this.sql.exec("INSERT INTO meta (k, v) VALUES ('tags', '1')");
      });
    }
  }
  put(key, dist, tags = {}) {
    if (dist.every((x) => !x)) this.sql.exec("DELETE FROM summary WHERE k = ?", key);
    else this.sql.exec("INSERT INTO summary (k, d, t) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET d = excluded.d, t = excluded.t", key, dist.join(","), Object.keys(tags).length ? JSON.stringify(tags) : "");
  }
  /** 一部片的短評：v = 看得到的（匯出、備份用），f = 被檢舉過或被隱藏的（站長管理用） */
  putNotes(key, visible, flagged) {
    if (!visible.length && !flagged.length) this.sql.exec("DELETE FROM notes WHERE k = ?", key);
    else this.sql.exec("INSERT INTO notes (k, v, f) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, f = excluded.f", key, JSON.stringify(visible), JSON.stringify(flagged));
  }
  allNotes() {
    const out = {};
    for (const r of this.sql.exec("SELECT k, v FROM notes WHERE v != '[]' ORDER BY k")) { try { out[r.k] = JSON.parse(r.v); } catch (_) {} }
    return out;
  }
  pending() {
    let n = 0;
    for (const r of this.sql.exec("SELECT f FROM notes WHERE f != '[]'")) { try { n += JSON.parse(r.f).filter((x) => !x.keep).length; } catch (_) {} }
    return n;
  }
  flagged() {
    const out = {};
    for (const r of this.sql.exec("SELECT k, f FROM notes WHERE f != '[]' ORDER BY k")) { try { out[r.k] = JSON.parse(r.f); } catch (_) {} }
    return out;
  }
  /** 每部片的心得標籤（各標籤幾人選）；沒有人選標籤的片不列 */
  allTags() {
    const out = {};
    for (const r of this.sql.exec("SELECT k, t FROM summary WHERE t != '' ORDER BY k")) { try { out[r.k] = JSON.parse(r.t); } catch (_) {} }
    return out;
  }
  all() {
    const out = {};
    for (const r of this.sql.exec("SELECT k, d FROM summary ORDER BY k")) out[r.k] = String(r.d).split(",").map(Number);
    return out;
  }
}

/** 每個 IP 一個計數器：時間窗內超過上限就拒絕，時間到自動清掉 */
export class Limit extends DurableObject {
  async hit(max, windowMs) {
    const now = Date.now();
    let w = (await this.ctx.storage.get("w")) || null;
    if (!w || now - w.start > windowMs) {
      w = { start: now, n: 0 };
      await this.ctx.storage.setAlarm(now + windowMs + 1000);
    }
    w.n++;
    await this.ctx.storage.put("w", w);
    return w.n <= max;
  }
  async alarm() {
    await this.ctx.storage.deleteAll();
  }
}
