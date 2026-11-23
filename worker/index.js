// 電影行程：觀眾即時評分（Cloudflare Worker + Durable Objects）
// 每部片一個 Durable Object（內建 SQLite），一台裝置一票、可以改票或取消，同時投票也不會算錯。
// 分數是 10 分制（1～10）。2026-11 以前是 5 星制：舊的評分在每部片第一次被讀到時一次換算成 ×2（1 星 → 2 分…5 星 → 10 分）。
// API（v2，10 分制）：
//   GET  /v2/stats?m=<片名鍵>&d=<裝置代號>   → { n, avg, dist:[1分..10分人數], mine }
//   POST /v2/vote  { m, d, s }               → 同上（s = 1～10；0 = 取消評分）
//   GET  /v2/all                             → { movies: { <片名鍵>: [1分..10分人數] } }（所有有人評分的片）
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
        return json({ movies: all });
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
  }
  /** 把這部片的統計同步到總表（有變才送）；失敗不影響投票 */
  async sync(key, dist) {
    if (!key) return;
    const sig = "10:" + dist.join(","); // 前面的 10 = 十分制（跟換算前存的記號不同，換算後會重新同步一次）
    if ((await this.ctx.storage.get("indexed")) === sig) return;
    try {
      await this.env.INDEX.get(this.env.INDEX.idFromName("all")).put(key, dist);
      await this.ctx.storage.put("indexed", sig);
    } catch (_) {}
  }
  async stats(dev, key) {
    const out = this.count(dev);
    await this.sync(key, out.dist); // 跟總表對一次（有變才送）：有評分的補進去，清空了的從總表拿掉
    return out;
  }
  async vote(dev, score, key) {
    if (score === 0) this.sql.exec("DELETE FROM votes WHERE dev = ?", dev);
    else this.sql.exec("INSERT INTO votes (dev, score, at) VALUES (?, ?, ?) ON CONFLICT(dev) DO UPDATE SET score = excluded.score, at = excluded.at", dev, score, Date.now());
    const out = this.count(dev);
    await this.sync(key, out.dist);
    return out;
  }
  count(dev) {
    const dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const r of this.sql.exec("SELECT score, COUNT(*) AS c FROM votes GROUP BY score")) if (r.score >= 1 && r.score <= 10) dist[r.score - 1] = r.c;
    const n = dist.reduce((a, b) => a + b, 0);
    const sum = dist.reduce((a, c, i) => a + c * (i + 1), 0);
    let mine = 0;
    if (dev) {
      const row = this.sql.exec("SELECT score FROM votes WHERE dev = ?", dev).toArray()[0];
      mine = row ? row.score : 0;
    }
    return { n, avg: n ? Math.round((sum / n) * 10) / 10 : 0, dist, mine };
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
  }
  put(key, dist) {
    if (dist.every((x) => !x)) this.sql.exec("DELETE FROM summary WHERE k = ?", key);
    else this.sql.exec("INSERT INTO summary (k, d) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET d = excluded.d", key, dist.join(","));
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
