// 電影行程：觀眾即時評分（Cloudflare Worker + Durable Objects）
// 每部片一個 Durable Object（內建 SQLite），一台裝置一票、可以改票或取消，同時投票也不會算錯。
// API：
//   GET  /v1/stats?m=<片名鍵>&d=<裝置代號>   → { n, avg, dist:[1星..5星人數], mine }
//   POST /v1/vote  { m, d, s }               → 同上（s = 1～5；0 = 取消評分）
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

// 同一個 IP 10 分鐘內最多投 60 次（擋灌票，一般人不會碰到）
const LIMIT_MAX = 60;
const LIMIT_WINDOW = 600e3;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
    try {
      if (url.pathname === "/") return json({ ok: true, service: "movie-ratings" });

      if (url.pathname === "/v1/stats" && req.method === "GET") {
        const m = url.searchParams.get("m") || "";
        const d = url.searchParams.get("d") || "";
        if (!okMovie(m)) return json({ error: "bad movie" }, 400);
        return json(await env.MOVIE.get(env.MOVIE.idFromName(m)).stats(okDevice(d) ? d : ""));
      }

      if (url.pathname === "/v1/vote" && req.method === "POST") {
        let b;
        try {
          b = await req.json();
        } catch (_) {
          return json({ error: "bad json" }, 400);
        }
        const m = b && b.m, d = b && b.d, s = Number(b && b.s);
        if (!okMovie(m) || !okDevice(d) || !Number.isInteger(s) || s < 0 || s > 5) return json({ error: "bad request" }, 400);
        const ip = req.headers.get("cf-connecting-ip") || "unknown";
        if (!(await env.LIMIT.get(env.LIMIT.idFromName(ip)).hit(LIMIT_MAX, LIMIT_WINDOW))) return json({ error: "too many votes, try later" }, 429);
        return json(await env.MOVIE.get(env.MOVIE.idFromName(m)).vote(d, s));
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
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS votes (dev TEXT PRIMARY KEY, score INTEGER NOT NULL, at INTEGER NOT NULL)");
  }
  stats(dev) {
    const dist = [0, 0, 0, 0, 0];
    for (const r of this.sql.exec("SELECT score, COUNT(*) AS c FROM votes GROUP BY score")) dist[r.score - 1] = r.c;
    const n = dist.reduce((a, b) => a + b, 0);
    const sum = dist.reduce((a, c, i) => a + c * (i + 1), 0);
    let mine = 0;
    if (dev) {
      const row = this.sql.exec("SELECT score FROM votes WHERE dev = ?", dev).toArray()[0];
      mine = row ? row.score : 0;
    }
    return { n, avg: n ? Math.round((sum / n) * 10) / 10 : 0, dist, mine };
  }
  vote(dev, score) {
    if (score === 0) this.sql.exec("DELETE FROM votes WHERE dev = ?", dev);
    else this.sql.exec("INSERT INTO votes (dev, score, at) VALUES (?, ?, ?) ON CONFLICT(dev) DO UPDATE SET score = excluded.score, at = excluded.at", dev, score, Date.now());
    return this.stats(dev);
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
