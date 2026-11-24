// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: film; share-sheet-inputs: url, plain-text;
// @movie-schedule-app 電影行程 v2026.11.24-2342
// 由 src/main.tsx 編譯產生（esbuild），請改原始碼後重新編譯。

// src/brand.ts
var SOCIALS = [
  { id: "th", name: "Threads", url: (h2) => `https://www.threads.net/@${encodeURIComponent(h2)}` },
  { id: "ig", name: "Instagram", url: (h2) => `https://www.instagram.com/${encodeURIComponent(h2)}/` },
  { id: "tw", name: "Twitter", url: (h2) => `https://x.com/${encodeURIComponent(h2)}` }
];
var PATHS = {
  th: "M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z",
  ig: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  tw: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
};
var socialIcon = (k) => `<span class="so so-${k}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${PATHS[k]}"/></svg></span>`;

// src/parsers.gen.ts
var PARSERS_JS = `function parseTwIndex(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  const seen = {};
  let city = "";
  for (const el of Array.from(doc.querySelectorAll('h2, a[href^="/cinemas/"]'))) {
    if (el.tagName === "H2") {
      city = clean(el.querySelector("a")?.textContent || el.textContent).replace(/\\(.*$/, "").trim();
      continue;
    }
    const m = (el.getAttribute("href") || "").match(/^\\/cinemas\\/([^/]+)\\/$/);
    if (!m || seen[m[1]]) continue;
    const name = clean(el.querySelector("h3")?.textContent);
    if (!name) continue;
    seen[m[1]] = true;
    out.push({ id: m[1], name, district: clean(el.querySelector("p")?.textContent), city });
  }
  return out;
}
function parseTwDay(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const timeRe = /^(?:[01]\\d|2[0-3]):[0-5]\\d$/;
  const heading = Array.from(doc.querySelectorAll("h2")).map((e) => clean(e.textContent)).find((s) => /\\d{4}-\\d{2}-\\d{2}\\s*片單/.test(s));
  const date = heading ? heading.match(/\\d{4}-\\d{2}-\\d{2}/)[0] : "";
  const dates = [];
  for (const a of Array.from(doc.querySelectorAll('a[href^="/cinemas/"]'))) {
    const m = (a.getAttribute("href") || "").match(/^\\/cinemas\\/[^/]+\\/(\\d{4}-\\d{2}-\\d{2})\\/$/);
    if (m && dates.indexOf(m[1]) < 0) dates.push(m[1]);
  }
  if (date && dates.indexOf(date) < 0) dates.unshift(date);
  dates.sort();
  let address = "";
  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const obj = JSON.parse(el.textContent || "");
      if (obj["@type"] === "MovieTheater") address = clean(obj.address && obj.address.streetAddress);
    } catch (_) {
    }
  }
  const bookingEl = Array.from(doc.querySelectorAll("a[href]")).find(
    (a) => /前往訂票/.test(a.textContent || "") && /^https:\\/\\//.test(a.getAttribute("href") || "")
  );
  const movies = [];
  for (const card of Array.from(doc.querySelectorAll(".card"))) {
    const titleEl = card.querySelector(".card-title");
    if (!titleEl) continue;
    const title = clean(titleEl.textContent);
    const badges = Array.from(card.querySelectorAll(".badge-sm")).map((e) => clean(e.textContent));
    const rt = badges.find((s) => /^\\d+\\s*分$/.test(s));
    const rating = badges.find((s) => /級$/.test(s)) || "";
    const versions = [];
    for (const row of Array.from(card.querySelectorAll(".flex.flex-wrap.items-center.gap-2"))) {
      const times = Array.from(row.querySelectorAll(".font-mono")).map((e) => clean(e.textContent)).filter((s) => timeRe.test(s));
      if (!times.length) continue;
      const labelEl = Array.from(row.children).find((e) => !e.classList.contains("font-mono"));
      const label = clean(labelEl && labelEl.textContent) || "一般場";
      const uniq = times.filter((t, i) => times.indexOf(t) === i).sort();
      const old = versions.find((v) => v.label === label);
      if (old) old.times = old.times.concat(uniq.filter((t) => old.times.indexOf(t) < 0)).sort();
      else versions.push({ label, times: uniq });
    }
    if (title && versions.length)
      movies.push({ title, runtime: rt ? Number(rt.match(/\\d+/)[0]) : 0, rating, versions });
  }
  return {
    cinema: clean(doc.querySelector("h1")?.textContent),
    address,
    date,
    dates,
    booking: bookingEl ? bookingEl.getAttribute("href") || "" : "",
    movies
  };
}
function parseEslite(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const schedules = {};
  const add = (day, title, runtime, label, time) => {
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(day) || !title || !/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(time)) return;
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title && x.runtime === runtime);
    if (!m) list.push(m = { title, runtime, versions: [] });
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push(v = { label, times: [] });
    if (v.times.indexOf(time) < 0) v.times.push(time);
  };
  const updated = (doc.body.textContent || "").match(/最後更新時間[：:]\\s*(\\d{4})-(\\d{2})-(\\d{2})/);
  if (!updated) throw new Error("讀不到誠品官網的更新日期，無法判斷場次年份");
  const anchor = Date.parse(\`\${updated[1]}-\${updated[2]}-\${updated[3]}T12:00:00+08:00\`);
  for (const box of Array.from(doc.querySelectorAll(".box"))) {
    const title = clean(box.querySelector(".intro .left p")?.textContent);
    if (!title) continue;
    const info = clean(box.querySelector(".intro .right")?.textContent);
    const runtime = Number((info.match(/片長[：:]\\s*(\\d+)\\s*分鐘/) || [])[1] || 0);
    const subtitle = (info.match(/字幕[：:]\\s*([^\\s]+)/) || [])[1] || "";
    for (const slide of Array.from(box.querySelectorAll(".time-swiper .swiper-slide"))) {
      const md = clean(slide.querySelector("p")?.textContent).match(/^(\\d{1,2})\\/(\\d{1,2})/);
      if (!md) continue;
      const mm = md[1].padStart(2, "0"), dd = md[2].padStart(2, "0");
      const y = Number(updated[1]);
      const cands = [y - 1, y, y + 1].map((yy) => \`\${yy}-\${mm}-\${dd}\`);
      cands.sort(
        (a, b) => Math.abs(Date.parse(a + "T12:00:00+08:00") - anchor) - Math.abs(Date.parse(b + "T12:00:00+08:00") - anchor)
      );
      for (const li of Array.from(slide.querySelectorAll("li")))
        add(cands[0], title, runtime, subtitle ? \`字幕 \${subtitle}\` : "一般場", clean(li.textContent));
    }
  }
  return { schedules, notice: "" };
}
function parseSpotHs(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const schedules = {};
  let notice = "";
  const add = (day, title, runtime, label, time) => {
    if (!title || !/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(time)) return;
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title && x.runtime === runtime);
    if (!m) list.push(m = { title, runtime, versions: [] });
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push(v = { label, times: [] });
    if (v.times.indexOf(time) < 0) v.times.push(time);
  };
  const tables = Array.from(doc.querySelectorAll("table[id]")).filter((t) => /^\\d{8}$/.test(t.id));
  const halls = [];
  for (const t of tables) if (t.parentElement && halls.indexOf(t.parentElement) < 0) halls.push(t.parentElement);
  for (const table of tables) {
    const day = table.id.replace(/^(\\d{4})(\\d{2})(\\d{2})$/, "$1-$2-$3");
    const hall = \`第 \${halls.indexOf(table.parentElement) + 1} 廳\`;
    for (const row of Array.from(table.querySelectorAll("tr"))) {
      const cells = Array.from(row.children).filter((el) => /^(TD|TH)$/.test(el.tagName));
      const ti = cells.findIndex((el) => /^\\d{2}:\\d{2}$/.test(clean(el.textContent)));
      if (ti < 0) {
        if (/影展|包場/.test(row.textContent || ""))
          notice = "部分日期有影展／包場，官網沒列出的個別場次不會出現，請另查官方活動頁。";
        continue;
      }
      const titleCell = cells[ti + 1];
      if (!titleCell) continue;
      const holder = titleCell.cloneNode(true);
      for (const br of Array.from(holder.querySelectorAll("br"))) br.replaceWith("\\n");
      const title = (holder.textContent || "").split("\\n").map(clean).find(Boolean) || "";
      const rtText = clean(cells[ti + 2]?.textContent);
      const subtitle = clean(cells[ti + 3]?.textContent);
      add(day, title, /^\\d+$/.test(rtText) ? Number(rtText) : 0, hall + (subtitle ? \`｜字幕 \${subtitle}\` : ""), clean(cells[ti].textContent));
    }
  }
  return { schedules, notice };
}
function parseSpotMovie(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const title = clean(doc.querySelector(".movie_title")?.textContent).replace(/([：:])\\s+/g, "$1");
  if (!title) return null;
  const body = doc.body.textContent || "";
  const runtime = Number((body.match(/(\\d+)\\s*min/i) || [])[1] || 0);
  const k = body.indexOf("放映時刻");
  const entries = [];
  if (k >= 0) {
    const seg = body.slice(k).split(/Add\\s/)[0];
    const marks = Array.from(seg.matchAll(/(\\d{1,2})\\/(\\d{1,2})\\s*\\([一二三四五六日]\\)/g));
    marks.forEach((mk, i) => {
      const part = seg.slice((mk.index || 0) + mk[0].length, i + 1 < marks.length ? marks[i + 1].index : void 0);
      const times = Array.from(part.matchAll(/(\\d{1,2}):(\\d{2})/g)).map((t) => t[1].padStart(2, "0") + ":" + t[2]).filter((t) => /^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(t));
      if (times.length) entries.push({ month: Number(mk[1]), day: Number(mk[2]), times });
    });
  }
  return { title, runtime, entries };
}
function parseLux(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  for (const a of Array.from(doc.querySelectorAll('.movie_all_list a[href*="movie_item.php"]'))) {
    const id = ((a.getAttribute("href") || "").match(/film_id=(\\d+)/) || [])[1];
    const h1 = a.querySelector("h1");
    if (!id || !h1) continue;
    const holder = h1.cloneNode(true);
    for (const sp of Array.from(holder.querySelectorAll("span"))) sp.remove();
    const title = clean(holder.textContent);
    const entries = [];
    let cur = null;
    for (const el of Array.from(a.querySelectorAll("h3, li"))) {
      const txt = clean(el.textContent);
      if (el.tagName === "H3") {
        const md = txt.match(/(\\d{1,2})\\/(\\d{1,2})/);
        cur = md ? { month: Number(md[1]), day: Number(md[2]), times: [] } : null;
        if (cur) entries.push(cur);
      } else if (cur) {
        const m = txt.match(/^(\\d{1,2}):(\\d{2})\\s*(?:\\|\\s*(\\S+))?/);
        if (m) cur.times.push({ t: m[1].padStart(2, "0") + ":" + m[2], hall: m[3] || "" });
      }
    }
    if (title && entries.some((e) => e.times.length)) {
      const old = out.find((x) => x.id === id);
      if (!old) out.push({ id, title, entries });
    }
  }
  return out;
}
function parseNwac(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  const seen = {};
  for (const slide of Array.from(doc.querySelectorAll(".swiper-slide[data-year][data-month]"))) {
    const y = Number(slide.getAttribute("data-year")), mo = Number(slide.getAttribute("data-month"));
    if (!y || !mo) continue;
    for (const item of Array.from(slide.querySelectorAll(".calendar__item"))) {
      if (/not-current-month/.test(item.getAttribute("class") || "")) continue;
      const d = Number(clean(item.querySelector(".calendar__head span")?.textContent));
      if (!d) continue;
      const date = \`\${y}-\${String(mo).padStart(2, "0")}-\${String(d).padStart(2, "0")}\`;
      for (const ev of Array.from(item.querySelectorAll(".event"))) {
        const raw = clean(ev.querySelector(".event-title")?.textContent);
        const cut = raw.match(/^(.*[\\u3000-\\u9fff\\uff00-\\uffef])\\s*[A-Za-z][\\x20-\\x7e’‘“”éèêàçôûïüöäñ]*$/);
        const title = clean(cut ? cut[1] : raw);
        const spans = Array.from(ev.querySelectorAll(".event-intro span")).map((s) => clean(s.textContent));
        const time = (spans.find((s) => /^\\d{1,2}:\\d{2}$/.test(s)) || "").padStart(5, "0");
        const hall = spans.find((s) => s && !/^\\d{1,2}:\\d{2}$/.test(s)) || "";
        const id = ((ev.querySelector('a[href*="movies-content/"]')?.getAttribute("href") || "").match(/movies-content\\/([0-9A-Za-z]+)/) || [])[1] || "";
        const key = [date, time, hall, title].join("|");
        if (!title || !/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(time) || seen[key]) continue;
        seen[key] = true;
        out.push({ date, title, id, hall, time });
      }
    }
  }
  return out;
}
function parseNwacFilm(doc) {
  const text = String(doc.querySelector(".specification")?.textContent || doc.body.textContent || "").replace(/\\s+/g, " ");
  const rt = text.match(/片長[：:]\\s*(\\d{1,3})\\s*(?:min|分)/i);
  const g = text.match(/級別[：:]\\s*(普遍級|保護級|輔導?級?\\s*(?:12|15|十二|十五)\\s*歲?級?|輔\\d{2}級?|限制級)/);
  let rating = g ? g[1].replace(/\\s+/g, "") : "";
  if (/^輔/.test(rating)) rating = /15|十五/.test(rating) ? "輔15級" : "輔12級";
  return { runtime: rt ? Number(rt[1]) : 0, rating };
}
function parseLuxFilm(doc) {
  const text = String(doc.body.textContent || "").replace(/\\s+/g, " ");
  return {
    runtime: Number((text.match(/長度\\s*\\|\\s*(\\d+)\\s*min/i) || [])[1] || 0),
    rating: (text.match(/級別\\s*\\|\\s*(\\S+?級)/) || [])[1] || ""
  };
}
function parseAtRegion(doc) {
  const out = [];
  const region = ((doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || "").match(/\\/(a\\d\\d)\\//) || [])[1] || "";
  for (const a of Array.from(doc.querySelectorAll('a[href^="/showtime/t"]'))) {
    const m = (a.getAttribute("href") || "").match(/^\\/showtime\\/(t\\w+)\\/(a\\d\\d)\\/$/);
    const name = String(a.textContent || "").replace(/\\s+/g, " ").trim();
    if (!m || !name || region && m[2] !== region || out.some((x) => x.id === m[1])) continue;
    out.push({ id: m[1], region: m[2], name });
  }
  return out;
}
function parseAtDay(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const RATING = { G: "普遍級", P: "保護級", F2: "輔12級", F5: "輔15級", R: "限制級" };
  const info = Array.from(doc.querySelectorAll("li")).map((li) => clean(li.textContent));
  const address = (info.find((s) => /^地址[:：]/.test(s)) || "").replace(/^地址[:：]\\s*/, "").replace(/\\s*\\(地圖\\)\\s*$/, "");
  const siteEl = Array.from(doc.querySelectorAll("li")).find((li) => /^網站[:：]/.test(clean(li.textContent)));
  const site = siteEl?.querySelector("a")?.getAttribute("href") || "";
  const h3 = Array.from(doc.querySelectorAll("h3")).map((e) => clean(e.textContent)).find((s) => /\\d{4}\\/\\d{2}\\/\\d{2}/.test(s)) || "";
  const date = (h3.match(/\\d{4}\\/\\d{2}\\/\\d{2}/) || [""])[0].replace(/\\//g, "-");
  const movies = [];
  for (const table of Array.from(doc.querySelectorAll("#theaterShowtimeTable, ul[id='theaterShowtimeTable']"))) {
    const title = clean(table.querySelector(".filmTitle a")?.textContent);
    if (!title) continue;
    const text = clean(table.textContent);
    const runtime = Number((text.match(/片長[:：]\\s*(\\d+)\\s*分/) || [])[1] || 0);
    const cer = ((table.querySelector('img[src*="cer_"]')?.getAttribute("src") || "").match(/cer_(\\w+)\\./) || [])[1] || "";
    let label = "一般場";
    const times = [];
    for (const li of Array.from(table.querySelectorAll("li"))) {
      if (li.classList.contains("filmVersion")) label = clean(li.textContent) || label;
      const m = clean(li.textContent).match(/^(\\d{1,2})[:：](\\d{2})$/);
      if (m) times.push(m[1].padStart(2, "0") + ":" + m[2]);
    }
    if (!times.length) continue;
    let mv = movies.find((x) => x.title === title);
    if (!mv) movies.push(mv = { title, runtime, rating: RATING[cer] || "", versions: [] });
    let v = mv.versions.find((x) => x.label === label);
    if (!v) mv.versions.push(v = { label, times: [] });
    for (const t of times) if (v.times.indexOf(t) < 0) v.times.push(t);
  }
  return { name: clean(doc.querySelector("#section_nav")?.textContent).split("﹥").pop() || "", address, site, date, movies };
}
function parseTwMovies(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  for (const sec of Array.from(doc.querySelectorAll("section"))) {
    const h2 = clean(sec.querySelector("h2")?.textContent);
    if (!/上映中|即將上映/.test(h2)) continue;
    for (const a of Array.from(sec.querySelectorAll('a[href^="/movies/"]'))) {
      const m = (a.getAttribute("href") || "").match(/^\\/movies\\/([^/]+)\\/$/);
      const title = clean(a.querySelector(".card-title, h3")?.textContent);
      if (!m || !title || out.some((x) => x.slug === m[1])) continue;
      const badges = Array.from(a.querySelectorAll(".badge")).map((e) => clean(e.textContent));
      out.push({
        slug: decodeURIComponent(m[1]),
        title,
        en: clean(a.querySelector("p")?.textContent),
        rating: badges.find((b) => /級$/.test(b)) || "",
        runtime: Number((badges.find((b) => /分鐘$/.test(b)) || "").replace(/\\D/g, "") || 0),
        cinemaCount: Number((badges.find((b) => /間影城$/.test(b)) || "").replace(/\\D/g, "") || 0),
        comingSoon: /即將上映/.test(h2)
      });
    }
  }
  return out;
}
function parseTwMovieDay(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  let title = "", en = "", rating = "", runtime = 0, image = "", release = "", intro = "", director = "", cast = "";
  const names = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((p) => clean(p && typeof p === "object" ? p.name : p)).filter(Boolean).slice(0, 8).join("、");
  const address = {};
  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const o = JSON.parse(el.textContent || "");
      if (o["@type"] !== "Movie") continue;
      title = clean(o.name);
      en = clean(o.alternateName);
      rating = clean(o.contentRating);
      runtime = Number((String(o.duration || "").match(/(\\d+)M/) || [])[1] || 0);
      release = (String(o.datePublished || "").match(/^\\d{4}-\\d{2}-\\d{2}/) || [""])[0];
      image = clean(typeof o.image === "string" ? o.image : o.image && (o.image.url || o.image[0]));
      intro = clean(o.description);
      director = names(o.director);
      cast = names(o.actor);
      for (const ev of o.subjectOf || []) {
        const loc = ev && ev.location;
        if (loc && loc.name && loc.address && loc.address.streetAddress) address[clean(loc.name)] = clean(loc.address.streetAddress);
      }
    } catch (_) {
    }
  }
  if (!title) title = clean(doc.querySelector("h1")?.textContent);
  const heading = Array.from(doc.querySelectorAll("h2")).map((e) => clean(e.textContent)).find((s) => /\\d{4}-\\d{2}-\\d{2}\\s*場次/.test(s)) || "";
  const date = (heading.match(/\\d{4}-\\d{2}-\\d{2}/) || [""])[0];
  const dates = date ? [date] : [];
  for (const a of Array.from(doc.querySelectorAll('a[href^="/movies/"]'))) {
    const m = (a.getAttribute("href") || "").match(/\\/(\\d{4}-\\d{2}-\\d{2})\\/$/);
    if (m && dates.indexOf(m[1]) < 0) dates.push(m[1]);
  }
  dates.sort();
  const cinemas = [];
  for (const sec of Array.from(doc.querySelectorAll("section[data-region]"))) {
    const city = clean(sec.querySelector("h3 a")?.textContent);
    for (const a of Array.from(sec.querySelectorAll('a[href^="/cinemas/"]'))) {
      const id = ((a.getAttribute("href") || "").match(/^\\/cinemas\\/([^/]+)\\/(?:\\d{4}-\\d{2}-\\d{2}\\/)?$/) || [])[1];
      const name = clean(a.querySelector(".card-title")?.textContent);
      if (!id || !name) continue;
      const place = clean(a.querySelector(".card-title + span, .text-sm")?.textContent);
      const versions = [];
      let cur = null;
      for (const sp of Array.from(a.querySelectorAll(".badge"))) {
        const txt = clean(sp.textContent);
        if (sp.classList.contains("font-mono")) {
          if (!/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(txt)) continue;
          if (!cur) versions.push(cur = { label: "一般場", times: [] });
          if (cur.times.indexOf(txt) < 0) cur.times.push(txt);
        } else if (sp.classList.contains("badge-secondary")) {
          const label = txt || "一般場";
          cur = versions.find((v) => v.label === label) || null;
          if (!cur) versions.push(cur = { label, times: [] });
        }
      }
      if (!versions.some((v) => v.times.length)) continue;
      cinemas.push({
        id,
        name,
        city: city || place.split(" ")[0] || "",
        district: place.split(" ")[1] || "",
        address: address[name] || "",
        versions: versions.filter((v) => v.times.length)
      });
    }
  }
  return { title, en, rating, runtime, image, release, intro, director, cast, date, dates, cinemas };
}
{
  parseAtDay,
  parseAtRegion,
  parseEslite,
  parseLux,
  parseLuxFilm,
  parseNwac,
  parseNwacFilm,
  parseSpotHs,
  parseSpotMovie,
  parseTwDay,
  parseTwIndex,
  parseTwMovieDay,
  parseTwMovies
};
`;

// src/platform.ts
var current = null;
function setPlatform(p) {
  current = p;
}
function platform() {
  if (!current) throw new Error("platform 尚未設定");
  return current;
}

// src/geo.ts
var GEO = {
  "ambassador-bade": [24.97321, 121.30267],
  "ambassador-danshui": [25.17701, 121.42521],
  "ambassador-kaohsiung-caoya": [22.58866, 120.32235],
  "ambassador-kaohsiung-yida": [22.73066, 120.40039],
  "ambassador-linkou": [25.07366, 121.36897],
  "ambassador-pingtung": [22.66721, 120.49086],
  "ambassador-taipei-center": [25.04373, 121.50175],
  "ambassador-taipei-changchun": [25.05468, 121.53893],
  "ambassador-xinzhuang": [25.06403, 121.459],
  "at-t02a03": [25.04333, 121.54389],
  "at-t02a05": [25.04815, 121.54579],
  "at-t02a06": [25.07076, 121.61086],
  "at-t02c01": [25.01211, 121.53653],
  "at-t02d06": [25.08487, 121.54948],
  "at-t02e03": [25.02324, 121.42467],
  "at-t02e04": [25.06254, 121.4989],
  "at-t02e08": [25.00956, 121.45605],
  "at-t02e22": [25.05648, 121.44681],
  "at-t02f05": [24.98926, 121.53847],
  "at-t03301": [25.05105, 121.28944],
  "at-t03302": [24.99589, 121.23243],
  "at-t03303": [24.96152, 121.22381],
  "at-t03311": [25.00024, 121.30695],
  "at-t03312": [24.93558, 121.23779],
  "at-t03510": [24.81065, 121.02176],
  "at-t03804": [23.9844, 121.6036],
  "at-t03902": [24.70265, 121.74952],
  "at-t03904": [24.67403, 121.76852],
  "at-t03905": [24.75446, 121.75013],
  "at-t04404": [24.14282, 120.6743],
  "at-t04405": [24.16202, 120.69251],
  "at-t04424": [24.14139, 120.67243],
  "at-t04426": [24.27059, 120.57693],
  "at-t04427": [24.14227, 120.6781],
  "at-t04428": [24.14985, 120.67094],
  "at-t04501": [23.70126, 120.52882],
  "at-t04703": [23.95455, 120.57201],
  "at-t04901": [23.90914, 120.6877],
  "at-t04902": [23.97049, 120.97504],
  "at-t05502": [23.47599, 120.4397],
  "at-t06602": [22.99104, 120.2016],
  "at-t06623": [22.99252, 120.20093],
  "at-t06625": [23.18365, 120.25001],
  "at-t07704": [22.63088, 120.32393],
  "at-t07712": [22.60426, 120.30344],
  "at-t07726": [22.6228, 120.28871],
  "century-kaohsiung": [22.60892, 120.30169],
  "century-nangang": [25.05218, 121.60721],
  "century-ximen": [25.04445, 121.50298],
  "century-yonghe": [25.00899, 121.50921],
  "cmpc-ptcinema": [22.67084, 120.4899],
  "cmpc-wonderful": [25.04184, 121.50731],
  "eslite": [25.04507, 121.55914],
  "in89-chiayi": [23.47615, 120.45181],
  "in89-fengyuan": [24.24321, 120.7111],
  "in89-penghu": [23.57123, 119.57621],
  "in89-pier2": [22.62789, 120.28644],
  "in89-talee": [22.62154, 120.29834],
  "in89-taoyuan": [25.02592, 121.29401],
  "lux": [25.04468, 121.50706],
  "nwac": [22.6611, 120.2816],
  // 內惟藝術中心（馬卡道路，美術館園區西北側；大約位置）
  "miramar-dazhi": [25.08465, 121.5563],
  "showtimes-beigang": [23.56888, 120.29928],
  "showtimes-chiayi": [23.48297, 120.44888],
  "showtimes-dajudan": [25.03653, 121.55762],
  "showtimes-hualien": [23.98914, 121.60594],
  "showtimes-keelung": [25.12854, 121.75125],
  "showtimes-ks-dream": [22.6047, 120.3054],
  "showtimes-ks-gang": [22.77971, 120.30048],
  "showtimes-shulin": [24.99552, 121.42851],
  "showtimes-tainan": [22.94823, 120.21912],
  "showtimes-taitung": [22.76315, 121.13631],
  "showtimes-tc-front": [24.14005, 120.69114],
  "showtimes-tc-libo": [24.31975, 120.69633],
  "showtimes-tc-wenxin": [24.13078, 120.64631],
  "showtimes-tucheng": [24.97942, 121.44701],
  "showtimes-xinxin": [25.05058, 121.52502],
  "skcinemas-lionforest": [25.0385, 121.50634],
  "skcinemas-taichung": [24.16519, 120.64508],
  "skcinemas-tainan": [22.98894, 120.1975],
  "skcinemas-taoyuan": [25.01577, 121.21327],
  "skcinemas-tianmu": [25.11633, 121.5341],
  "spot-hs": [25.04518, 121.52921],
  "spot-taipei": [25.05634, 121.52278],
  "vscinemas-banciao": [25.01771, 121.47011],
  "vscinemas-hsinchu": [24.80342, 120.97109],
  "vscinemas-hsinchu-bigcity": [24.80624, 120.97651],
  "vscinemas-hualien": [23.96234, 121.60478],
  "vscinemas-jingzhan": [25.04837, 121.51967],
  "vscinemas-kaohsiung": [22.6114, 120.30549],
  "vscinemas-linkou": [25.07185, 121.36387],
  "vscinemas-muvie-taichung": [24.1643, 120.63776],
  "vscinemas-muvie-taipei": [25.02972, 121.56827],
  "vscinemas-nangang": [25.05998, 121.6156],
  "vscinemas-taichung": [24.16519, 120.64508],
  "vscinemas-taichung-ifg": [24.13837, 120.68985],
  "vscinemas-tainan": [22.99498, 120.20561],
  "vscinemas-tainan-focus": [22.99577, 120.21016],
  "vscinemas-tainan-nanfang": [22.99111, 120.23304],
  // 南紡購物中心（自動查詢誤抓到新竹，手動修正）
  "vscinemas-taoyuan": [25.02592, 121.29401],
  "vscinemas-taoyuan-tg": [25.02051, 121.30432],
  "vscinemas-toufen": [24.68901, 120.90402],
  "vscinemas-ximen": [25.04184, 121.50731],
  "vscinemas-xindian": [24.98476, 121.54243],
  "vscinemas-xinyi": [25.03594, 121.56173],
  "vscinemas-zhonghe": [25.00572, 121.47778]
};

// src/at-list.ts
var AT_BUILTIN = [
  ["t02a03", "a02", "微風影城", "台北市松山區復興南路一段39號(微風廣場8樓)"],
  ["t02a05", "a02", "總督影城", "台北市松山區長安東路二段219號5樓之1"],
  ["t02a06", "a02", "哈拉影城", "台北市內湖區康寧路三段72號"],
  ["t02d06", "a02", "美麗新大直皇家影城", "台北市中山區北安路780號B2"],
  ["t02e03", "a02", "新莊鴻金寶麻吉影城", "新北市新莊區民安路188巷5號"],
  ["t02e04", "a02", "三重天台戲院", "新北市三重區重新路二段78號4樓"],
  ["t02e08", "a02", "府中15", "新北市板橋區府中路15號B1"],
  ["t02e22", "a02", "國家電影及視聽文化中心", "新北市新莊區文藝路2號"],
  ["t02f05", "a02", "景美佳佳戲院", "台北市文山區羅斯福路六段403號"],
  ["t03301", "a03", "美麗新台茂影城", "桃園市蘆竹區南崁路一段112號7樓"],
  ["t03302", "a03", "星橋國際影城", "桃園市中壢區中園路二段501號5樓"],
  ["t03303", "a03", "威尼斯影城", "桃園市中壢區九和一街48號3樓之2"],
  ["t03311", "a03", "桃園光影文化館", "桃園市桃園區埔新路12號"],
  ["t03312", "a03", "中壢光影電影館", "桃園市中壢區龍清街116巷31號"],
  ["t04404", "a04", "日日新影城", "台中市中區中華路一段58號"],
  ["t04405", "a04", "親親戲院", "台中市北區北屯路14號"],
  ["t04424", "a04", "全球影城", "台中市西區中華路一段1-1號"],
  ["t04426", "a04", "時代數位3D影城", "台中市清水區光復街65號3樓"],
  ["t04427", "a04", "中山73影視藝文空間", "台中市中區中山路73號"],
  ["t04428", "a04", "王牌映画影城", "台中市西區臺灣大道二段459號17-18-19樓"],
  ["t04703", "a47", "員林影城", "彰化縣員林市南昌路39號3樓"],
  ["t04501", "a45", "環球中華影城", "雲林縣斗六市雲林路二段19號"],
  ["t04901", "a49", "南投戲院", "南投縣南投市大同街87號"],
  ["t04902", "a49", "埔里山明影城", "南投縣埔里鎮中山路二段289號5樓"],
  ["t05502", "a05", "嘉年華戲院", "嘉義市西區中山路615號"],
  ["t06602", "a06", "南台電影城", "台南市中西區友愛街317號"],
  ["t06623", "a06", "全美戲院", "台南市中西區永福路二段187號"],
  ["t06625", "a06", "麻豆戲院", "台南市麻豆區興中路106號"],
  ["t07704", "a07", "高雄環球影城", "高雄市苓雅區大順三路108號"],
  ["t07712", "a07", "台鋁影城", "高雄市前鎮區忠勤路8號"],
  ["t07726", "a07", "高雄市電影館", "高雄市鹽埕區河西路10號"],
  ["t03902", "a39", "宜蘭日新戲院", "宜蘭縣羅東鎮中山西街17-1號"],
  ["t03904", "a39", "日新戲院-統一廳", "宜蘭縣羅東鎮公園路100號3樓"],
  ["t03905", "a39", "新月豪華影城", "宜蘭縣宜蘭市民權路二段38巷6號"],
  ["t03804", "a38", "花蓮鐵道電影院", "花蓮縣花蓮市中山路71號"]
];
var AT_COVERED = new Set("t02c01 t03510 t02a01 t02a08 t02a09 t02a11 t02a12 t02a13 t02b01 t02b03 t02b05 t02b06 t02b07 t02b08 t02b14 t02b16 t02d02 t02d03 t02d04 t02d05 t02d20 t02e07 t02e10 t02e11 t02e12 t02e13 t02e15 t02e17 t02e18 t02e20 t02e21 t02g04 t03304 t03307 t03308 t03315 t03317 t03505 t03508 t03701 t03801 t03803 t04401 t04402 t04407 t04409 t04410 t04411 t04412 t04413 t04504 t05504 t05505 t06607 t06609 t06610 t06611 t06628 t06902 t07702 t07703 t07705 t07707 t07708 t07728 t07729 t07730 t08701 t08703 t08902".split(" "));
var AT_SKIP = /* @__PURE__ */ new Set(["t07727", "t07731"]);
var AT_REGIONS = {
  a01: "基隆市",
  a02: "台北市",
  a03: "桃園市",
  a35: "新竹市",
  a37: "苗栗縣",
  a04: "台中市",
  a47: "彰化縣",
  a45: "雲林縣",
  a49: "南投縣",
  a05: "嘉義市",
  a06: "台南市",
  a07: "高雄市",
  a39: "宜蘭縣",
  a38: "花蓮縣",
  a89: "台東縣",
  a87: "屏東縣",
  a69: "澎湖縣",
  a68: "金門縣"
};

// src/core.ts
function notifyEndPick(p) {
  const fav = p.endFav !== void 0 ? !!p.endFav : p.endScope === "fav";
  return { fav, cities: p.endFav === void 0 && p.endScope === "fav" ? [] : p.endCities || [] };
}
function notifyEndScope(p) {
  const { fav, cities: cs } = notifyEndPick(p);
  const ct = cs.length > 3 ? `${cs.slice(0, 2).join("、")}等 ${cs.length} 個縣市` : cs.join("、");
  return [fav ? "收藏影城" : "", ct].filter(Boolean).join("＋") || "全台";
}
function notifyPayload(s) {
  const p = notifyPrefs(s);
  const pick = notifyEndPick(p);
  const scope = pick.fav && pick.cities.length ? "mix" : pick.fav ? "fav" : pick.cities.length ? "city" : "all";
  return {
    prefs: Object.fromEntries(NOTIFY_KINDS.map((k) => [k.id, !!p[k.id]])),
    // 收藏影城只有開了「收藏影城開始放映時」或「收藏影城每週新片」才傳
    opt: { fmts: (p.fmts || []).filter((f) => FORMATS.indexOf(f) >= 0), preDays: p.preDays || 3, quiet: notifyQuiet(p), cinemas: p.favc || p.cweek ? s.favorites.slice(0, 80) : [] },
    endCfg: { max: Math.min(30, Math.max(1, p.endMax || 3)), scope, cities: pick.cities, cinemas: pick.fav ? s.favorites.slice(0, 80) : [] },
    favs: notifyFavs(s)
  };
}
var NOTIFY_KINDS = [
  { id: "open", label: "開放場次時", note: "還沒排片的片，戲院開始排場次、可以訂票了", group: "fav" },
  { id: "pre", label: "上映前提醒", note: "上映前幾天提醒一次", group: "fav" },
  { id: "rel", label: "上映時", note: "收藏的片正式上映的那一天", group: "fav" },
  { id: "favc", label: "收藏影城開始放映時", note: "你收藏的影城排了這部片（今天或明天有場次）", group: "fav" },
  { id: "fmt", label: "特殊廳有場次時", note: "IMAX、杜比、4DX 等你選的廳別開始有場次", group: "fav" },
  { id: "rate", label: "評分出爐時", note: "有了 IMDb 或番茄指數", group: "fav" },
  { id: "end", label: "快下檔時", note: "放映的影城變少到你設定的間數以下", group: "fav" },
  { id: "fest", label: "影展開始時", note: "收藏的影展片所屬的影展開始了", group: "fav" },
  { id: "cweek", label: "收藏影城每週新片", note: "每週四早上一則：你收藏的影城這一週新上哪些片", group: "all" },
  { id: "week", label: "每週新片", note: "每週四早上一則：這一週上映哪些片", group: "all" },
  { id: "flist", label: "影展片單公布時", note: "有影展公布了片單", group: "all" },
  { id: "reply", label: "有人回覆或提到我時", note: "回覆你的短評，或在短評裡 @你；推和噓不會跳通知，只列在「通知」頁籤裡", group: "social" },
  { id: "follow", label: "有人追蹤我時", note: "包含對方回追你", group: "social" }
];
var NOTIFY_PRE_STEPS = [1, 3, 7];
var notifyPrefs = (s) => ({ open: true, rel: true, end: true, fest: true, favc: true, fmt: false, pre: true, rate: false, week: false, flist: false, cweek: false, reply: true, follow: true, ...s.notify || {} });
var notifyQuiet = (p) => ({ on: p.quietOn !== false, from: p.quietFrom ?? 22, to: p.quietTo ?? 9 });
var notifyFavs = (s) => (s.favMovies || []).map((f) => ({ key: f.key, title: f.title, ...f.fest ? { fest: { id: f.fest.id, name: f.fest.name } } : {} }));
var MAPS_LABEL = { apple: "Apple 地圖", google: "Google 地圖" };
function mapsUrl(name, address, app = "apple") {
  if (app === "google")
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, address].filter(Boolean).join(" "))}`;
  return `https://maps.apple.com/?q=${encodeURIComponent(name)}${address ? "&address=" + encodeURIComponent(address) : ""}`;
}
var TW = "https://twshowtimes.com";
var UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
var EXTRA = [
  {
    id: "eslite",
    name: "誠品電影院",
    city: "台北市",
    district: "信義區",
    source: "eslite",
    url: "https://meet.eslite.com/tw/tc/gallery/movieschedule/201803020001",
    address: "台北市信義區菸廠路80號B1",
    aliases: "誠品 松菸"
  },
  {
    id: "spot-hs",
    name: "光點華山電影館",
    city: "台北市",
    district: "中正區",
    source: "spot-hs",
    url: "https://www.spot-hs.org.tw/movie/schedule.html",
    address: "台北市中正區八德路一段1號",
    aliases: "光點 華山"
  },
  {
    id: "spot-taipei",
    name: "光點台北（台北之家）",
    city: "台北市",
    district: "中山區",
    source: "spot-taipei",
    url: "https://www.spot.org.tw/schedule/schedule_one.html",
    address: "台北市中山區中山北路二段18號",
    aliases: "光點 台北之家 spot"
  },
  {
    id: "lux",
    name: "樂聲影城",
    city: "台北市",
    district: "萬華區",
    source: "lux",
    url: "https://www.luxcinema.com.tw/web/2020.php?type=ShowTimes",
    address: "台北市萬華區武昌街二段",
    aliases: "樂聲 lux 西門 西門町 電影街"
  },
  {
    id: "nwac",
    name: "內惟戲院（內惟藝術中心）",
    city: "高雄市",
    district: "鼓山區",
    source: "nwac",
    url: "https://www.nwac.org.tw/tw/movie-showings",
    address: "高雄市鼓山區馬卡道路329號",
    aliases: "內惟 內惟藝術中心 藝術中心 高美館 美術館 nwac"
  }
];
var CITY_ORDER = [
  "基隆市",
  "台北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "台中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "台南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣"
];
var AD_STEPS = [0, 10, 15, 20];
var ADS_NOTE = "依《電影法施行細則》，戲院每場正片前的廣告與預告合計原則上是 9 分鐘（預告片可以再多放），所以預設預留 10 分鐘。各戲院實際長度不同，可以自己調整。";
var WEEK = ["日", "一", "二", "三", "四", "五", "六"];
var todayTPE = () => new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10);
var nowHM = () => new Date(Date.now() + 8 * 36e5).toISOString().slice(11, 16);
var addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
var weekday = (d) => WEEK[(/* @__PURE__ */ new Date(d + "T00:00:00Z")).getUTCDay()];
var isLate = (t) => t < "05:00";
var lateOnOwnDate = (source) => source === "tw";
var showDay = (source, date, time) => isLate(time) && !lateOnOwnDate(source) ? addDays(date, 1) : date;
var lateIsTonight = (source, time) => isLate(time) && !lateOnOwnDate(source);
function dateLabel(d) {
  const [, m, dd] = d.split("-").map(Number);
  const t = todayTPE();
  const tag = d === t ? " 今天" : d === addDays(t, 1) ? " 明天" : d === addDays(t, 2) ? " 後天" : "";
  return `${m}/${dd}（${weekday(d)}）${tag}`;
}
function tpeDate(date, time) {
  return /* @__PURE__ */ new Date(`${date}T${time}:00+08:00`);
}
function fmt(dt) {
  const s = new Date(dt.getTime() + 8 * 36e5).toISOString();
  const d = s.slice(0, 10);
  return `${d.replace(/-/g, "/")}（${weekday(d)}）${s.slice(11, 16)}`;
}
var settingsStored = false;
async function loadSettings() {
  const def = { favorites: ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"], ads: 10 };
  try {
    const json = await platform().loadSettingsJSON();
    settingsStored = !!json;
    const s = json ? { ...def, ...JSON.parse(json) } : def;
    let alias = cinemaAlias;
    if (!alias) {
      try {
        alias = JSON.parse(platform().cacheGet("cinema-alias.json") || "{}") || {};
      } catch (_) {
        alias = {};
      }
    }
    if (alias && s.favorites.some((id) => alias[id])) s.favorites = s.favorites.map((id) => alias[id] || id).filter((id, i, all) => all.indexOf(id) === i);
    return s;
  } catch (_) {
    return def;
  }
}
var settingsSavedHook = null;
function setSettingsSavedHook(fn) {
  settingsSavedHook = fn;
}
function saveSettings(s) {
  platform().saveSettingsJSON(JSON.stringify(s, null, 1));
  if (settingsSavedHook) {
    try {
      settingsSavedHook(s);
    } catch (_) {
    }
  }
}
var DEFAULT_FAVORITES = ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"];
function syncPick(s) {
  return { favorites: s.favorites, favMovies: s.favMovies || [], favIssuers: s.favIssuers || [], ads: s.ads, ...s.maps ? { maps: s.maps } : {}, ...s.notify ? { notify: s.notify } : {} };
}
function syncApply(s, r) {
  const out = { ...s };
  if (Array.isArray(r.favorites)) out.favorites = r.favorites.filter((x) => typeof x === "string");
  if (Array.isArray(r.favMovies)) out.favMovies = r.favMovies.filter((f) => f && typeof f.key === "string" && typeof f.title === "string");
  if (Array.isArray(r.favIssuers)) out.favIssuers = r.favIssuers.filter((x) => typeof x === "string");
  if (typeof r.ads === "number") out.ads = r.ads;
  if (r.maps === "apple" || r.maps === "google") out.maps = r.maps;
  if (r.notify && typeof r.notify === "object") out.notify = r.notify;
  return out;
}
function syncMerge(local, r) {
  const uniq = (list, key) => list.filter((x, i) => list.findIndex((y) => key(y) === key(x)) === i);
  const untouched = local.favorites.length === DEFAULT_FAVORITES.length && local.favorites.every((x, i) => x === DEFAULT_FAVORITES[i]);
  const remote = syncApply(local, r);
  return {
    ...remote,
    favorites: Array.isArray(r.favorites) ? uniq([...remote.favorites, ...untouched ? [] : local.favorites], (x) => x) : local.favorites,
    favMovies: uniq([...remote.favMovies || [], ...local.favMovies || []], (x) => x.key),
    favIssuers: uniq([...remote.favIssuers || [], ...local.favIssuers || []], (x) => x)
  };
}
var cacheGet = (name) => platform().cacheGet(name);
var cacheSet = (name, v) => platform().cacheSet(name, v);
async function get(url) {
  const r = await platform().fetchText(url, { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" });
  return { ok: r.status >= 200 && r.status < 300, body: r.body };
}
async function getText(url) {
  const r = await get(url);
  if (!r.ok) throw new Error("網站暫時讀不到：" + url);
  return r.body;
}
async function parseMany(name, htmls) {
  const body = `${PARSERS_JS}
var hs=${JSON.stringify(htmls)};try{return JSON.stringify({ok:true,v:hs.map(function(x){return ${name}(new DOMParser().parseFromString(x,'text/html'));})});}catch(e){return JSON.stringify({ok:false,e:String(e&&e.message||e)});}`;
  const r = JSON.parse(await platform().runInWebView(body));
  if (!r.ok) throw new Error(r.e);
  return r.v;
}
var parse = async (name, html) => (await parseMany(name, [html]))[0];
async function loadCinemas() {
  let list = [];
  try {
    list = await parse("parseTwIndex", await getText(TW + "/cinemas/"));
    if (list.length) cacheSet("cinemas.json", JSON.stringify(list));
  } catch (e) {
    const c = cacheGet("cinemas.json");
    if (!c) throw e;
    list = JSON.parse(c);
  }
  const tw = list.map((c) => ({ ...c, source: "tw", url: `${TW}/cinemas/${c.id}/` }));
  const main = tw.concat(EXTRA);
  const alias = {};
  const others = (await loadAtTheaters()).filter((c) => {
    const twin = sameCinema(c, main);
    if (twin) alias[c.id] = twin.id;
    return !twin;
  });
  cinemaAlias = alias;
  cacheSet("cinema-alias.json", JSON.stringify(alias));
  return main.concat(others);
}
var cinemaAlias = null;
var cinemaNameKey = (name) => String(name || "").replace(/臺/g, "台").replace(/影城|電影院|大戲院|戲院|影院|數位|[\s_（）()・·\-－—,，.]/g, "").replace(/[店館]$/, "").toLowerCase();
function sameCinema(c, list) {
  const k = cinemaNameKey(c.name);
  if (!k) return null;
  const grams = (s) => {
    const g = {};
    for (let i = 0; i < s.length - 1; i++) g[s.slice(i, i + 2)] = true;
    return g;
  };
  const a = grams(k), na = Object.keys(a).length;
  for (const x of list) {
    const xk = cinemaNameKey(x.name);
    if (xk === k) return x;
    if (x.city !== c.city || na < 3) continue;
    const b = grams(xk), nb = Object.keys(b).length;
    const both = Object.keys(a).filter((g) => b[g]).length;
    if (both / Math.max(1, na + nb - both) >= 0.75) return x;
  }
  return null;
}
var AT = "https://www.atmovies.com.tw";
function splitAddress(addr, region) {
  const a = addr.replace(/臺/g, "台");
  const m = a.match(/^(\S{2}[市縣])(\S{1,3}?[區鎮鄉市])/);
  return m ? { city: m[1], district: m[2] } : { city: AT_REGIONS[region] || "其他", district: "" };
}
function atCinema(id, region, name, address) {
  const { city, district } = splitAddress(address, region);
  return { id: "at-" + id, name, city, district, source: "at", url: `${AT}/showtime/${id}/${region}/`, address, aliases: "開眼" };
}
async function loadAtTheaters() {
  const builtin = AT_BUILTIN.map(([id, region, name, address]) => atCinema(id, region, name, address));
  const known = /* @__PURE__ */ new Set([...AT_COVERED, ...AT_SKIP, ...AT_BUILTIN.map((r) => r[0])]);
  let found = [];
  const cached = cacheGet("at-theaters.json");
  const parsed = cached ? JSON.parse(cached) : null;
  const served = (await loadAtData())?.theaters;
  if (served && served.length) {
    found = served;
  } else if (parsed && Date.now() - parsed.at < 7 * 864e5) {
    found = parsed.list;
  } else {
    try {
      const regions = Object.keys(AT_REGIONS);
      const pages = await Promise.all(regions.map((r) => getText(`${AT}/showtime/${r}/`).catch(() => "<html><body></body></html>")));
      const lists = await parseMany("parseAtRegion", pages);
      found = [].concat(...lists.map((l, i) => l.filter((t) => t.region === regions[i])));
      if (found.length) cacheSet("at-theaters.json", JSON.stringify({ at: Date.now(), list: found }));
    } catch (_) {
      found = parsed ? parsed.list : [];
    }
  }
  const extra = found.filter((t) => !known.has(t.id)).map((t) => atCinema(t.id, t.region, t.name, ""));
  return builtin.concat(extra);
}
var AT_DATA_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/at.json";
var atDataMem = null;
function loadAtData() {
  if (!metaOn) return Promise.resolve(null);
  if (atDataMem && Date.now() - atDataMem.at < 20 * 6e4) return atDataMem.job;
  const fresh = (d) => d && d.days && Date.now() - d.updated < 12 * 36e5 ? d : null;
  const job = (async () => {
    let disk = null;
    try {
      disk = JSON.parse(cacheGet("at-data.json") || "null");
    } catch (_) {
    }
    if (disk && Date.now() - disk.at < 30 * 6e4) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(AT_DATA_URL + "?t=" + Math.floor(Date.now() / (20 * 6e4)), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body);
      if (!data || typeof data.days !== "object") return null;
      cacheSet("at-data.json", JSON.stringify({ at: Date.now(), data }));
      return data;
    })().catch(() => null);
    const got = await Promise.race([net, delay(4e3).then(() => null)]);
    return fresh(got || (disk ? disk.data : null));
  })();
  atDataMem = { at: Date.now(), job };
  return job;
}
var atDayCache = {};
async function atDayLive(url, date) {
  const full = date ? `${url}${date.replace(/-/g, "")}/` : url;
  if (!atDayCache[full]) atDayCache[full] = await parse("parseAtDay", await getText(full));
  return atDayCache[full];
}
async function atDay(c, date) {
  const data = await loadAtData();
  const hit = data?.days[c.id.replace(/^at-/, "")]?.[date || todayTPE()];
  if (hit && hit.date) return hit;
  return atDayLive(c.url, date);
}
var TW_NEAR_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/tw-near.json";
var TW_FAR_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/tw-far.json";
var OFFICIAL_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/official.json";
var SHOWTIMES_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/showtimes.json";
var servedMem = {};
function loadServed(name, url, maxHours, ok) {
  if (!metaOn) return Promise.resolve(null);
  const hit = servedMem[name];
  if (hit && Date.now() - hit.at < 20 * 6e4) return hit.job;
  const fresh = (d) => d && ok(d) && Date.now() - d.updated < maxHours * 36e5 ? d : null;
  const job = (async () => {
    let disk = null;
    try {
      disk = JSON.parse(cacheGet(name + ".json") || "null");
    } catch (_) {
    }
    if (disk && Date.now() - disk.at < 30 * 6e4) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(url + "?t=" + Math.floor(Date.now() / (20 * 6e4)), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body);
      if (!data || !ok(data)) return null;
      cacheSet(name + ".json", JSON.stringify({ at: Date.now(), data }));
      return data;
    })().catch(() => null);
    const got = await Promise.race([net, delay(6e3).then(() => null)]);
    return fresh(got || (disk ? disk.data : null));
  })();
  servedMem[name] = { at: Date.now(), job };
  return job;
}
var loadTwData = (far) => loadServed(far ? "tw-far" : "tw-near", far ? TW_FAR_URL : TW_NEAR_URL, far ? 24 : 12, (d) => typeof d.days === "object");
var twDayCache = {};
async function twDayLive(c, date) {
  const key = c.id + "|" + (date || "");
  if (!twDayCache[key]) {
    const url = date ? `${TW}/cinemas/${c.id}/${date}/` : c.url;
    twDayCache[key] = await parse("parseTwDay", await getText(url));
  }
  return twDayCache[key];
}
async function twDay(c, date) {
  const today = todayTPE();
  const day = date || today;
  const key = c.id + "|" + (date || "");
  if (twDayCache[key]) return twDayCache[key];
  const off = Math.round((Date.parse(day + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 864e5);
  if (off >= 0 && off <= 6) {
    const data = await loadTwData(off >= 2);
    const hit = data?.days[c.id]?.[day];
    if (hit && hit.date === day) return twDayCache[key] = { cinema: c.name, ...hit };
  }
  return twDayLive(c, date);
}
async function chainDays(c) {
  if (!/^(showtimes|ambassador)-/.test(c.id)) return null;
  return (await chainAll())?.[c.id]?.schedules || null;
}
var CHAIN_SLUG = "st:";
var isChainSlug = (slug) => String(slug || "").indexOf(CHAIN_SLUG) === 0;
function chainOnlyMovies(chain, known, today) {
  const found = {};
  for (const id of Object.keys(chain)) {
    const sch = chain[id].schedules || {};
    for (const d of Object.keys(sch)) {
      if (d < today) continue;
      for (const m of sch[d]) {
        if (known[normTitle(m.title)] || known[looseTitle(m.title)]) continue;
        const k = normTitle(m.title);
        const f = found[k] ||= { m, first: d, cinemas: {} };
        if (d < f.first) f.first = d;
        f.cinemas[id] = true;
      }
    }
  }
  return Object.keys(found).map((k) => {
    const f = found[k];
    return { slug: CHAIN_SLUG + f.m.title, title: f.m.title, en: "", rating: f.m.rating || "", runtime: f.m.runtime || 0, cinemaCount: Object.keys(f.cinemas).length, comingSoon: f.first > today };
  });
}
async function chainAll() {
  const data = await loadServed("showtimes", SHOWTIMES_URL, 12, (d) => typeof d.cinemas === "object").catch(() => null);
  return data?.cinemas || null;
}
function mergeChain(movies, extra) {
  const out = movies.map((m) => ({ ...m, versions: m.versions.map((v) => ({ ...v, times: v.times.slice() })) }));
  for (const em of extra) {
    let m = out.find((x) => normTitle(x.title) === normTitle(em.title));
    if (!m) {
      out.push({ ...em, versions: em.versions.map((v) => ({ ...v, times: v.times.slice() })) });
      continue;
    }
    if (!m.runtime && em.runtime) m.runtime = em.runtime;
    if (!m.rating && em.rating) m.rating = em.rating;
    for (const ev of em.versions) {
      const v = m.versions.find((x) => x.label === ev.label);
      if (!v) {
        m.versions.push({ ...ev, times: ev.times.slice() });
        continue;
      }
      for (const t of ev.times) if (v.times.indexOf(t) < 0) v.times.push(t);
      v.times.sort();
    }
  }
  return out;
}
var multiCache = {};
async function multiDayLive(c) {
  if (c.source === "eslite") return parse("parseEslite", await getText(c.url));
  if (c.source === "spot-hs") return parse("parseSpotHs", await getText(c.url));
  if (c.source === "lux") return luxCinema();
  if (c.source === "nwac") return nwacCinema();
  return spotTaipei();
}
async function multiDay(c) {
  if (multiCache[c.id]) return multiCache[c.id];
  const data = await loadServed("official", OFFICIAL_URL, 12, (d) => typeof d.cinemas === "object");
  const hit = data?.cinemas[c.id];
  const today = todayTPE();
  const r = hit && hit.schedules && Object.keys(hit.schedules).some((d) => d >= today) ? hit : await multiDayLive(c);
  multiCache[c.id] = r;
  return r;
}
async function nwacCinema() {
  const base = "https://www.nwac.org.tw/tw/";
  const today = todayTPE();
  const events = (await parse("parseNwac", await getText(base + "movie-showings"))).filter((e) => e.date >= today);
  const ids = Array.from(new Set(events.map((e) => e.id).filter(Boolean))).slice(0, 60);
  const details = await parseMany(
    "parseNwacFilm",
    await Promise.all(ids.map((id) => getText(`${base}movies-content/${id}`).catch(() => "<html><body></body></html>")))
  );
  const schedules = {};
  for (const e of events) {
    const d = details[ids.indexOf(e.id)] || { runtime: 0, rating: "" };
    const list = schedules[e.date] || (schedules[e.date] = []);
    let m = list.find((x) => x.title === e.title);
    if (!m) list.push(m = { title: e.title, runtime: d.runtime, rating: d.rating, versions: [] });
    const label = e.hall || "一般場";
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push(v = { label, times: [] });
    if (v.times.indexOf(e.time) < 0) v.times.push(e.time);
  }
  for (const list of Object.values(schedules)) for (const m of list) for (const v of m.versions) v.times.sort();
  return { schedules, notice: "週一休館。影展、特別放映的售票方式請看官網。" };
}
var LUX_HALL = { XL: "XL 巨幕廳（800 席）", L: "L 大廳（218 席）" };
async function luxCinema() {
  const base = "https://www.luxcinema.com.tw/web/";
  const page = await getText(base + "2020.php?type=ShowTimes");
  if (/僅限台灣地區/.test(page)) throw new Error("樂聲官網只接受台灣的連線，請關閉 VPN 後再試");
  const films = await parse("parseLux", page);
  const details = await parseMany(
    "parseLuxFilm",
    await Promise.all(films.map((f) => getText(`${base}2020-movie_item.php?film_id=${f.id}`).catch(() => "<html><body></body></html>")))
  );
  const today = todayTPE();
  const y0 = Number(today.slice(0, 4));
  const schedules = {};
  films.forEach((f, idx) => {
    for (const e of f.entries) {
      const mmdd = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
      const day = [y0 - 1, y0, y0 + 1].map((y) => `${y}-${mmdd}`).sort((a, b) => Math.abs(Date.parse(a) - Date.parse(today)) - Math.abs(Date.parse(b) - Date.parse(today)))[0];
      const list = schedules[day] || (schedules[day] = []);
      let m = list.find((x) => x.title === f.title);
      if (!m) list.push(m = { title: f.title, runtime: details[idx]?.runtime || 0, rating: details[idx]?.rating || "", versions: [] });
      for (const t of e.times) {
        const label = LUX_HALL[t.hall] || (t.hall ? `${t.hall} 廳` : "其他影廳");
        let v = m.versions.find((x) => x.label === label);
        if (!v) m.versions.push(v = { label, times: [] });
        if (v.times.indexOf(t.t) < 0) v.times.push(t.t);
      }
    }
  });
  for (const list of Object.values(schedules))
    for (const m of list) {
      for (const v of m.versions) v.times.sort(byShowtime);
      const rank = (l) => Object.values(LUX_HALL).indexOf(l) + 1 || 99;
      m.versions.sort((a, b) => rank(a.label) - rank(b.label));
    }
  return { schedules, notice: "樂聲官網沒有標影廳的場次會列在「其他影廳」。" };
}
function hallOf(label) {
  const m = String(label || "").match(/^(第 ?\d+ ?廳|[A-Za-z0-9]+ ?(?:巨幕廳|大廳|廳))/);
  return m ? m[1] : "";
}
var byShowtime = (a, b) => ((isLate(a) ? "2" : "1") + a).localeCompare((isLate(b) ? "2" : "1") + b);
async function spotTaipei() {
  const today = todayTPE();
  const urls = [];
  for (let k = -3; k <= 1; k++) {
    const d = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + k, 1));
    const ym = d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, "0");
    for (let m = 1; m <= 15; m++) urls.push(`https://www.spot.org.tw/movies/${ym}/m${m}/movies${ym}_m${m}.html`);
  }
  const pages = await Promise.all(urls.map((u) => get(u).catch(() => ({ ok: false, body: "" }))));
  const htmls = pages.filter((p) => p.ok && /movie_title/.test(p.body)).map((p) => p.body);
  const films = (await parseMany("parseSpotMovie", htmls)).filter(Boolean);
  const schedules = {};
  const y0 = Number(today.slice(0, 4));
  for (const f of films) {
    for (const e of f.entries) {
      const mmdd = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
      const day = [y0 - 1, y0, y0 + 1].map((y) => `${y}-${mmdd}`).sort((a, b) => Math.abs(Date.parse(a) - Date.parse(today)) - Math.abs(Date.parse(b) - Date.parse(today)))[0];
      const list = schedules[day] || (schedules[day] = []);
      let m = list.find((x) => x.title === f.title);
      if (!m) list.push(m = { title: f.title, runtime: f.runtime, versions: [{ label: "官方場次", times: [] }] });
      for (const t of e.times) if (m.versions[0].times.indexOf(t) < 0) m.versions[0].times.push(t);
      m.versions[0].times.sort();
    }
  }
  return { schedules, notice: "" };
}
async function datesOf(c) {
  const today = todayTPE();
  if (c.source === "at") {
    const days = await Promise.all([atDay(c), atDay(c, addDays(today, 1)).catch(() => null)]);
    const dates2 = days.filter((d) => !!d && !!d.date && d.movies.length > 0 && d.date >= today).map((d) => d.date);
    const addr = days[0]?.address || c.address || "";
    return {
      dates: Array.from(new Set(dates2)).sort(),
      address: addr,
      site: days[0]?.site || "",
      notice: "這間的場次來自開眼電影網，通常只公布今天（晚上才會有明天）。其他日期請點下方「影城官網」查詢。"
    };
  }
  if (c.source === "tw") {
    const sup = AT_SUPPLEMENT.find((x) => x[0].test(c.name));
    if (sup) atDay(atCinema(sup[1], sup[2], c.name, "")).catch(() => null);
    const [d, chain] = await Promise.all([twDay(c), chainDays(c)]);
    const future = d.dates.filter((x) => x >= today);
    const more = Object.keys(chain || {}).filter((x) => x >= today && future.indexOf(x) < 0);
    return { dates: future.length || more.length ? future.concat(more).sort() : d.dates, address: d.address, notice: "", site: d.booking || "" };
  }
  const m = await multiDay(c);
  const dates = Object.keys(m.schedules).filter((x) => x >= today).sort();
  return { dates, address: c.address || "", notice: m.notice, site: c.url };
}
var AT_SUPPLEMENT = [
  [/MUVIE CINEMAS\s*台北松仁/, "t02a11", "a02"],
  [/新竹大遠百威秀/, "t03505", "a35"],
  [/MUVIE CINEMAS\s*台中TIGER CITY/i, "t04402", "a04"],
  [/台南南紡威秀/, "t06610", "a06"],
  [/高雄大遠百威秀/, "t07703", "a07"]
];
var SPECIAL_HALL = /gold\s*class|mucrown|titan/i;
var hallKey = (label) => ((label.match(SPECIAL_HALL) || [""])[0] || "").toLowerCase().replace(/\s/g, "");
async function supplementHalls(c, date, movies) {
  const s = AT_SUPPLEMENT.find((x) => x[0].test(c.name));
  if (!s) return movies;
  let d = null;
  try {
    const at = atCinema(s[1], s[2], c.name, "");
    d = await Promise.race([
      (async () => {
        let x = await atDay(at);
        if (x.date !== date) x = await atDay(at, date);
        return x;
      })(),
      delay(8e3).then(() => null)
    ]);
  } catch (_) {
    return movies;
  }
  if (!d || d.date !== date) return movies;
  const tkey = (t) => normTitle(baseTitle(t));
  const out = movies.map((m) => ({ ...m, versions: m.versions.slice() }));
  for (const am of d.movies)
    for (const v of am.versions) {
      const hall = hallKey(v.label);
      const times = v.times.filter((t) => !isLate(t));
      if (!hall || !times.length) continue;
      const target = out.find((m) => tkey(m.title) === tkey(am.title));
      if (target && target.versions.some((x) => hallKey(x.label) === hall)) continue;
      const ver = { label: `${v.label}（取自開眼）`, times };
      if (target) target.versions.push(ver);
      else out.push({ title: am.title, runtime: am.runtime, rating: am.rating, versions: [ver] });
    }
  return out;
}
async function moviesOf(c, date) {
  if (c.source === "at") {
    let d = await atDay(c);
    if (d.date !== date) d = await atDay(c, date);
    return { movies: await fillRuntimes(d.movies), booking: d.site, sourceUrl: `${c.url}${date.replace(/-/g, "")}/`, address: d.address || c.address || "" };
  }
  if (c.source === "tw") {
    let d = await twDay(c);
    const extra = (await chainDays(c) || {})[date];
    if (extra && d.date !== date && d.dates.indexOf(date) < 0) return { movies: await fillRuntimes(extra), booking: d.booking, sourceUrl: d.booking || c.url, address: d.address };
    if (d.date !== date) d = await twDay(c, date);
    if (d.date && d.date !== date) throw new Error("網站回傳的日期和選擇的不同，請稍後再試");
    const movies = extra ? mergeChain(d.movies, extra) : d.movies;
    return { movies: await fillRuntimes(await supplementHalls(c, date, movies)), booking: d.booking, sourceUrl: `${TW}/cinemas/${c.id}/${date}/`, address: d.address };
  }
  const m = await multiDay(c);
  return { movies: await fillRuntimes(m.schedules[date] || []), booking: c.url, sourceUrl: c.url, address: c.address || "" };
}
var VARIANTS = { 祕: "秘", 臺: "台", 裏: "裡", 艶: "艷", 羣: "群", 峯: "峰", 砲: "炮" };
var normTitle = (t) => String(t || "").toLowerCase().replace(/[\s:：·・\-–—_＿!！?？,，.。'"’‘“”「」『』《》〈〉＜＞<>()（）\[\]【】／/]/g, "").replace(/[祕臺裏艶羣峯砲]/g, (c) => VARIANTS[c] || c);
var looseTitle = (t) => normTitle(baseTitle(t)).replace(/^(?:劇場版|電影版|動畫電影)/, "") || normTitle(t);
function searchTitles(title) {
  const out = [];
  const add = (x) => {
    const t = x.replace(/\s+/g, " ").trim();
    if (t && out.indexOf(t) < 0) out.push(t);
  };
  const plain = (x) => x.replace(/[『』「」〈〉《》【】\[\]（）()＜＞<>]/g, " ");
  add(baseTitle(title));
  const first = baseTitle(String(title || "").split(/\s*[+＋]\s*/)[0]);
  add(plain(first));
  add(plain(first).replace(/劇場版/g, " "));
  return out;
}
var REISSUE_WORDS = "全新|加碼|數位|[248]K|修復|重映|重製|再映|經典|紀念|[\\d一二三四五六七八九十百]*週年";
var isReissue = (t) => new RegExp(REISSUE_WORDS, "i").test(String(t || ""));
var DECOR_LEAD = /^\s*(?:[（(\[【][^）)\]】]{1,12}[）)\]】]|[A-Z]\d?-|(?:法文|中文|英文|日文|韓文|台語|國語|粵語)版[-－:：]?)\s*/;
var DECOR_TAIL = /\s*(?:[（(\[【]\s*(?:真人版|\d{4}|[^）)\]】]{0,8}版)\s*[）)\]】]|[-－:：]?\s*(?:海報)?特別場|[-－:：]?\s*(?:粉絲)?特典場|[-－:：]?\s*LIVE VIEWING|應援場|現場直播|安可重播|黑白版|特別版|口白場|中文配音版?|(?:日|英|韓|法|國|台)語版)\s*$/;
function baseTitle(t) {
  let s = String(t || "").replace(/[《》]/g, "").trim();
  for (let i = 0; i < 4; i++) {
    const before = s;
    s = s.replace(DECOR_LEAD, "").replace(DECOR_TAIL, "");
    s = s.replace(new RegExp(`\\s*[（(\\[【][^）)\\]】]*(?:${REISSUE_WORDS})[^）)\\]】]*[）)\\]】]\\s*$`, "i"), "");
    s = s.replace(new RegExp(`[\\s:：\\-–—_＿]*(?:${REISSUE_WORDS})+(?:版本?)?\\s*$`, "i"), "");
    if (s === before) break;
  }
  return s.trim() || String(t || "").trim();
}
var TMDB = "https://api.themoviedb.org/3";
var isV3Key = (t) => /^[0-9a-f]{32}$/i.test(t);
async function tmdb(path, token) {
  const url = TMDB + path + (isV3Key(token) ? (path.includes("?") ? "&" : "?") + "api_key=" + token : "");
  const headers = { accept: "application/json" };
  if (!isV3Key(token)) headers.Authorization = "Bearer " + token;
  const r = await platform().fetchText(url, headers);
  if (r.status === 401) throw new Error("TMDB 金鑰無效，請到設定重新貼上");
  if (r.status < 200 || r.status >= 300) throw new Error("TMDB 暫時讀不到");
  return JSON.parse(r.body);
}
async function tmdbFind(title, token) {
  const q = baseTitle(title);
  const key = normTitle(q);
  if (!key || !token) return null;
  const read = () => {
    try {
      return JSON.parse(cacheGet("runtimes.json") || "{}") || {};
    } catch (_) {
      return {};
    }
  };
  const hit = read()[key];
  if (hit && "id" in hit && Date.now() - hit.at < (hit.id ? 30 : 1) * 864e5) return hit.id ? hit : null;
  const found = await tmdb(`/search/movie?language=zh-TW&query=${encodeURIComponent(q)}`, token);
  const results = found?.results || [];
  const pick = results.find((x) => normTitle(x.title) === key || normTitle(x.original_title) === key) || results[0];
  const v = { id: 0, r: 0, p: "", at: Date.now() };
  if (pick?.id) {
    const d = await tmdb(`/movie/${pick.id}?language=zh-TW`, token);
    v.id = pick.id;
    v.r = Number(d?.runtime) || 0;
    v.p = d?.poster_path || pick.poster_path || "";
  }
  const cache = read();
  cache[key] = v;
  cacheSet("runtimes.json", JSON.stringify(cache));
  return v.id ? v : null;
}
async function tmdbRuntime(title, token) {
  return (await tmdbFind(title, token))?.r || 0;
}
var extrasCache = {};
var delay = (ms) => new Promise((r) => {
  const g = globalThis;
  if (typeof g.setTimeout === "function") g.setTimeout(r, ms);
  else g.Timer.schedule(ms, false, r);
});
var foreground = 0;
function foregroundTask(p) {
  foreground++;
  const done = () => {
    foreground--;
  };
  p.then(done, done);
  return p;
}
async function waitIdle() {
  while (foreground > 0) await delay(150);
}
var readExtras = () => {
  try {
    return JSON.parse(cacheGet("extras.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};
var META_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/meta.json";
var metaOn = true;
var metaMem = null;
function loadMeta() {
  if (!metaOn) return Promise.resolve(null);
  if (metaMem && Date.now() - metaMem.at < 18e5) return metaMem.job;
  const fresh = (m) => m && m.movies && Date.now() - m.updated < 3 * 864e5 ? m : null;
  const job = (async () => {
    let disk = null;
    try {
      disk = JSON.parse(cacheGet("meta2.json") || "null");
    } catch (_) {
    }
    if (disk && Date.now() - disk.at < 36e5) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(META_URL + "?t=" + Math.floor(Date.now() / 18e5), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body);
      if (!data || typeof data.movies !== "object") return null;
      cacheSet("meta2.json", JSON.stringify({ at: Date.now(), data }));
      return data;
    })().catch(() => null);
    const got = await Promise.race([net, delay(4e3).then(() => null)]);
    return fresh(got || (disk ? disk.data : null));
  })();
  metaMem = { at: Date.now(), job };
  return job;
}
async function metaOf(title) {
  const m = await loadMeta();
  return m && (m.movies[normTitle(title)] || m.movies[normTitle(baseTitle(title))]) || null;
}
async function movieExtras(title, slug) {
  const hasToken = !!((await loadSettings()).tmdbToken || "").trim();
  const k = (hasToken ? "t|" : "n|") + (slug || "") + "|" + title;
  return (extrasCache[k] ||= (async () => {
    const ck = (hasToken ? "t|" : "n|") + normTitle(title);
    const read = readExtras;
    const hit = read()[ck];
    const stale = hit && hit.v !== EXTRAS_V && true;
    const ttl = stale ? 0 : hit?.poster && hit?.trailerName ? 7 * 864e5 : 864e5;
    const me = await metaOf(title);
    if (me && me.tn && me.t) return { poster: normImageUrl(me.p || (hit && !(me.xa && me.xa > hit.at) ? hit.poster : "") || ""), trailer: me.t, trailerName: me.tn };
    if (hit && Date.now() - hit.at < ttl) return { poster: hit.poster, trailer: hit.trailer, trailerName: hit.trailerName };
    const out = await findExtras(title, slug);
    const all = read();
    for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 864e5) delete all[key];
    const { err: _e, ...keep } = out;
    const flaky = !out.trailerName && /讀不到|連線|回應 \d|逾時|失敗/.test(out.err || "");
    all[ck] = { ...keep, at: Date.now() - (flaky ? 23 * 36e5 : 0), v: EXTRAS_V };
    cacheSet("extras.json", JSON.stringify(all));
    return out;
  })()).then((r) => {
    const sure = yearPosterSeen[normTitle(title)];
    return sure ? { ...r, poster: sure, posterKind: "poster" } : r;
  });
}
var EXTRAS_V = 9;
function normImageUrl(u) {
  let s = String(u || "").trim().replace(/&amp;/g, "&").replace(/\\\//g, "/");
  if (s.startsWith("//")) s = "https:" + s;
  s = s.replace(/^http:\/\//i, "https://");
  const pw = s.match(/^https?:\/\/(?:www\.)?photowant\.com\/photo\d*\/(f\w+)\//);
  if (pw) s = `${AT}/photo101/${pw[1]}/pl_${pw[1]}.jpg`;
  return s;
}
var posterMem = {};
function twPoster(slug) {
  return posterMem[slug] ||= (async () => {
    if (isChainSlug(slug)) throw new Error("no page");
    const path = encodeURIComponent(slug).replace(/%3A/gi, ":");
    const url = `${TW}/movies/${path}/`;
    if (movieDayCache[url]?.image) return movieDayCache[url].image;
    const r = await get(url);
    if (!r.ok) throw new Error("no page");
    const img = normImageUrl((r.body.match(/property="og:image"\s+content="([^"]+)"/) || r.body.match(/"image":"([^"]+)"/) || [])[1] || "");
    return /og-default/.test(img) ? "" : img;
  })();
}
var atIndexMem = null;
function atMovieIndex() {
  return atIndexMem ||= (async () => {
    try {
      const c = JSON.parse(cacheGet("at-movies.json") || "null");
      if (c && Date.now() - c.at < 864e5 && c.idx) return c.idx;
    } catch (_) {
    }
    const idx = {};
    await Promise.all(
      ["now", "new", "next", "next2", "now2"].map(async (p) => {
        const url = `${AT}/movie/${p}/`;
        const html = await getText(url).catch(() => getText(url).catch(() => ""));
        for (const [, id, t] of html.matchAll(/<a[^>]*href="\/movie\/(f[a-z0-9]+)\/"[^>]*>\s*([^<]{1,60}?)\s*<\/a>/g)) {
          const n = normTitle(t), b = normTitle(baseTitle(t)), l = looseTitle(t);
          if (n) idx[n] ||= id;
          if (b) idx[b] ||= id;
          if (l) idx[l] ||= id;
        }
      })
    );
    if (Object.keys(idx).length) cacheSet("at-movies.json", JSON.stringify({ at: Date.now(), idx }));
    return idx;
  })();
}
var atPageMem = {};
var atPage = (id) => atPageMem[id] ||= getText(`${AT}/movie/${id}/`);
async function atMovieId(title, posterUrl) {
  const fromPoster = (posterUrl.match(/\/photo\d*\/(f\w+)\//) || [])[1];
  if (fromPoster) return fromPoster;
  const idx = await atMovieIndex();
  return matchIndex(idx, title);
}
function matchIndex(idx, title) {
  const n = normTitle(title), b = normTitle(baseTitle(title)), l = looseTitle(title);
  if (idx[n] || idx[b] || idx[l]) return idx[n] || idx[b] || idx[l];
  for (const k of [b, l]) {
    if (k.length < 8) continue;
    const hit = Object.keys(idx).find((x) => x.length >= 8 && (x.startsWith(k) || k.startsWith(x)));
    if (hit) return idx[hit];
  }
  return "";
}
async function atPoster(title) {
  const id = await atMovieId(title, "");
  if (!id) return "";
  const html = await atPage(id);
  const og = (html.match(/property="og:image"\s+content="([^"]+)"/) || [])[1] || "";
  return og ? normImageUrl(og) : "";
}
async function atYearHint(title, slug, en) {
  if (isReissue(title)) return 0;
  const known = () => 0;
  try {
    const poster = await Promise.race([moviePoster(title, slug, en), delay(1500).then(() => "")]);
    const id = await atMovieId(title, poster || "");
    if (!id) return known();
    const html = await Promise.race([atPage(id), delay(3500).then(() => "")]);
    const m = html.match(/上映日期[:：]?(?:\s|<[^>]*>|&nbsp;)*(\d{4})/);
    return m ? Number(m[1]) : known();
  } catch (_) {
    return known();
  }
}
var runtimeMem = {};
function movieRuntime(title, slug, en) {
  const k = normTitle(title);
  return runtimeMem[k] ||= (async () => {
    const read = () => {
      try {
        return JSON.parse(cacheGet("runtimes.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()["at|" + k];
    if (hit && Date.now() - hit.at < (hit.r ? 30 : 1) * 864e5) return hit.r ? { runtime: hit.r, from: hit.from } : null;
    const me = await metaOf(title);
    if (me && me.rt) return { runtime: me.rt, from: me.rf || "開眼電影網" };
    let out = null;
    const token = ((await loadSettings()).tmdbToken || "").trim();
    if (token) {
      for (const q of [title, en].filter(Boolean)) {
        const r = await tmdbRuntime(q, token).catch(() => 0);
        if (r) {
          out = { runtime: r, from: "TMDB" };
          break;
        }
      }
    }
    if (!out) {
      try {
        const id = await atMovieId(title, await moviePoster(title, slug, en).catch(() => ""));
        const m = id ? (await atPage(id)).match(/片長[:：]\s*(\d{2,3})\s*分/) : null;
        if (m) out = { runtime: Number(m[1]), from: "開眼電影網" };
      } catch (_) {
      }
    }
    const all = read();
    all["at|" + k] = { r: out?.runtime || 0, from: out?.from || "", at: Date.now() };
    cacheSet("runtimes.json", JSON.stringify(all));
    return out;
  })();
}
async function findPoster(title, slug, en) {
  let p = await twPoster(slug || title).catch(() => "");
  if (p) return p;
  const list = await loadMovies();
  const key = normTitle(title), bkey = normTitle(baseTitle(title));
  const lkey = looseTitle(title);
  const cands = list.filter((m) => m.slug !== (slug || title) && (normTitle(m.title) === key || normTitle(baseTitle(m.title)) === bkey || looseTitle(m.title) === lkey || bkey.length >= 8 && normTitle(baseTitle(m.title)).startsWith(bkey)));
  for (const c of cands) {
    p = await twPoster(c.slug).catch(() => "");
    if (p) return p;
  }
  p = await atPoster(title).catch(() => "");
  if (p) return p;
  p = await imdbPoster(title, slug, en).catch(() => "");
  if (p) return p;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return "";
  const hit = await tmdbFind(title, token).catch(() => null) || (en ? await tmdbFind(en, token).catch(() => null) : null);
  return hit?.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "";
}
async function imdbPoster(title, slug, en) {
  const r = await movieRatings(title, en, slug);
  const id = (r.imdb?.url.match(/tt\d+/) || [])[0];
  if (!id) return "";
  const res = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${id}.json`, { "User-Agent": UA });
  const hit = (JSON.parse(res.body).d || []).find((x) => x.id === id);
  const u = String(hit?.i?.imageUrl || "");
  return /^https:\/\/m\.media-amazon\.com\//.test(u) ? u.replace(/\._V1_.*?(\.\w+)$/, "._V1_UX500_$1") : "";
}
var posterBusy = 0;
var posterQueue = [];
async function posterLane(job) {
  if (posterBusy >= 4) await new Promise((go) => posterQueue.push(go));
  else posterBusy++;
  try {
    return await job();
  } finally {
    const next = posterQueue.shift();
    if (next) next();
    else posterBusy--;
  }
}
var posterOnly = {};
var posterDone = {};
var posterLightMem = {};
var POSTERS_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/posters.json";
var yearPostersMem = null;
function yearPosters() {
  return yearPostersMem ||= (async () => {
    let disk = null;
    try {
      disk = JSON.parse(cacheGet("posters.json") || "null");
    } catch (_) {
    }
    if (disk && disk.posters && Date.now() - disk.at < 24 * 36e5) return disk.posters;
    try {
      const r = await platform().fetchText(POSTERS_URL + "?t=" + Math.floor(Date.now() / 36e5), { accept: "application/json" });
      const d = r.status === 200 ? JSON.parse(r.body) : null;
      if (d && d.posters && typeof d.posters === "object") {
        cacheSet("posters.json", JSON.stringify({ at: Date.now(), posters: d.posters }));
        return d.posters;
      }
    } catch (_) {
    }
    return disk && disk.posters ? disk.posters : {};
  })();
}
var yearPosterSeen = {};
function posterLight(title, release) {
  const k = "|" + title;
  return posterLightMem[k] ||= (async () => {
    const nk = normTitle(title);
    const sure = (await yearPosters())[nk + "|" + (release || "").slice(0, 4)];
    if (sure && /^\/[\w.-]+$/.test(sure)) return yearPosterSeen[nk] = "https://image.tmdb.org/t/p/w342" + sure;
    const all = readExtras();
    const hits = [all["t|" + nk], all["n|" + nk], all["p|" + nk]].filter((x) => x && x.poster);
    const hit = hits.find((x) => !/ytimg\.com/.test(x.poster));
    if (hit) return normImageUrl(hit.poster);
    const thumb = hits.length ? normImageUrl(hits[0].poster) : "";
    const me = await metaOf(title);
    if (me && me.p) return normImageUrl(me.p);
    const own = all["l|" + nk];
    if (own && Date.now() - own.at < (own.poster ? 30 : own.v === 3 ? 3 : 0) * 864e5) return own.poster || thumb;
    const rerun = /修復|重映|重製|再映|經典|紀念|週年|[48]K/i.test(title);
    const year = rerun ? 0 : Number((release || "").slice(0, 4)) || 0;
    const quick = await posterLane(async () => {
      for (const t of searchTitles(title)) {
        try {
          const q = t.toLowerCase().replace(/[\\/?#%]/g, " ").trim();
          const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(q)}.json`, { "User-Agent": UA });
          const d = JSON.parse(r.body).d || [];
          const x = d.find((v) => /^tt/.test(v.id) && (v.qid === "movie" || v.qid === "tvMovie" || v.qid === "video") && v.i?.imageUrl && (!year || !v.y || Math.abs(Number(v.y) - year) <= 1));
          const u = String(x?.i?.imageUrl || "");
          if (/^https:\/\/m\.media-amazon\.com\//.test(u)) return u.replace(/\._V1_.*?(\.\w+)$/, "._V1_UX300_$1");
        } catch (_) {
          return "";
        }
      }
      return "";
    });
    const poster = quick || await moviePoster(title).catch(() => "");
    const latest = readExtras();
    latest["l|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now(), v: 3 };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster || thumb;
  })().then((u) => {
    if (!u) delete posterLightMem[k];
    return posterDone[k] = u;
  });
}
function moviePoster(title, slug, en) {
  const sure = yearPosterSeen[normTitle(title)];
  if (sure && !slug) return Promise.resolve(sure);
  const k = (slug || "") + "|" + title;
  return posterOnly[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk];
    const isThumb = (u) => /ytimg\.com/.test(u);
    const me = await metaOf(title);
    if (me && me.p && !isThumb(me.p)) return normImageUrl(me.p);
    const stale = (at) => !!(me && me.xa && me.xa > at);
    if (hit?.poster && !isThumb(hit.poster) && !stale(hit.at || 0)) return normImageUrl(hit.poster);
    const own = all["p|" + nk];
    if (own && !stale(own.at) && Date.now() - own.at < (own.poster && !isThumb(own.poster) ? 7 : own.v === EXTRAS_V ? 1 : 0) * 864e5) return own.poster;
    if (me && me.p) return normImageUrl(me.p);
    const poster = await posterLane(async () => {
      const found = normImageUrl(await findPoster(title, slug, en).catch(() => ""));
      if (found) return found;
      return normImageUrl((await movieExtras(title, slug).catch(() => null))?.poster || "");
    });
    const latest = readExtras();
    latest["p|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now(), v: EXTRAS_V };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster;
  })().then((u) => posterDone[k] = u);
}
function posterTint(title) {
  let h2 = 0;
  for (const ch of normTitle(title)) h2 = (h2 * 31 + (ch.codePointAt(0) || 0)) % 9973;
  return h2 % 6;
}
function posterSrc(url) {
  url = normImageUrl(url);
  if (!url) return "";
  try {
    return platform().cachedImage(url) || url;
  } catch (_) {
    return url;
  }
}
function cachePoster(url) {
  url = normImageUrl(url);
  if (!url) return;
  try {
    platform().cacheImage(url).catch(() => null);
  } catch (_) {
  }
}
var prefetched = /* @__PURE__ */ new Set();
function prefetchPosters(items, max = 200, trailers = 10, ratings = 12) {
  const queue = [];
  items.slice(0, max).forEach((m, i) => {
    const k = (m.slug || "") + "|" + m.title;
    if (prefetched.has(k)) return;
    prefetched.add(k);
    queue.push({ title: m.title, slug: m.slug, en: m.en, trailer: i < trailers, ratings: i < ratings });
  });
  const run = async () => {
    for (let m = queue.shift(); m; m = queue.shift()) {
      try {
        await waitIdle();
        const u = await moviePoster(m.title, m.slug, m.en);
        if (u) await platform().cacheImage(u);
        if (m.trailer) {
          await waitIdle();
          await movieExtras(m.title, m.slug);
        }
        if (m.ratings) {
          await waitIdle();
          await movieRatings(m.title, m.en, m.slug);
        }
      } catch (_) {
      }
    }
  };
  for (let i = 0; i < 2; i++) run();
}
async function findExtras(title, slug) {
  const base = baseTitle(title);
  const out = {
    poster: "",
    trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(base + " 預告")}`,
    trailerName: ""
  };
  const posterJob = findPoster(title, slug).catch(() => "");
  const token = ((await loadSettings()).tmdbToken || "").trim();
  const tmdbJob = (async () => {
    if (!token) return null;
    const hit = await tmdbFind(title, token);
    if (!hit) return { err: "TMDB 找不到這部片" };
    const pickVideo = (list) => list.filter((v2) => v2.site === "YouTube" && v2.key).sort((a, b) => rankVideo(a) - rankVideo(b))[0];
    const rankVideo = (v2) => (v2.type === "Trailer" ? 0 : v2.type === "Teaser" ? 1 : 2) + (v2.official ? 0 : 0.5);
    const [zh, all] = await Promise.all([
      tmdb(`/movie/${hit.id}/videos?language=zh-TW`, token).catch(() => null),
      tmdb(`/movie/${hit.id}/videos`, token).catch(() => null)
    ]);
    const vz = pickVideo(zh?.results || []);
    const v = vz ? { ...vz, zh: true } : pickVideo(all?.results || []);
    return { poster: hit.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "", v, err: v ? "" : "TMDB 沒有這部片的預告" };
  })().catch((e) => ({ err: "TMDB " + errText(e) }));
  const atErr = [];
  const atJob = posterJob.then(async (poster2) => {
    const id = (poster2.match(/\/photo\d*\/(f\w+)\//) || [])[1];
    if (!id) {
      atErr.push("開眼電影網沒有這部片的預告");
      return null;
    }
    const html = await atPage(id);
    const key = (html.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/) || [])[1];
    if (!key) {
      atErr.push("開眼電影網沒有這部片的預告");
      return null;
    }
    const name = await ytTitle(key);
    if (name && YT_NOT_TRAILER.test(name) && !YT_TRAILER.test(name)) {
      atErr.push("開眼電影網放的是花絮不是預告");
      return null;
    }
    return { key, name: "開眼電影網預告" };
  }).catch((e) => {
    atErr.push("開眼 " + errText(e));
    return null;
  });
  const [poster, t, at] = await Promise.all([posterJob, tmdbJob, atJob]);
  out.poster = normImageUrl(poster || (t && "poster" in t ? t.poster : "") || "");
  const tv = t && "v" in t ? t.v : null;
  let pick = tv && tv.zh ? tv : at || tv;
  if (!pick) {
    const k = normTitle(title), bk = normTitle(base);
    const en = (moviesCache || []).find((m) => normTitle(m.title) === k || normTitle(baseTitle(m.title)) === bk)?.en;
    const yt = await ytTrailer(title, en);
    if ("key" in yt) pick = yt;
    else atErr.push("YouTube " + yt.err);
  }
  if (pick) {
    out.trailer = `https://www.youtube.com/watch?v=${pick.key}`;
    out.trailerName = String(pick.name || "預告片");
    if (!out.poster) {
      out.poster = `https://i.ytimg.com/vi/${pick.key}/hqdefault.jpg`;
      out.posterKind = "thumb";
    }
  }
  if (!pick) out.err = [t?.err, ...atErr].filter(Boolean).join("；") || "找不到預告";
  return out;
}
async function ytSearch(query) {
  let r;
  try {
    r = await platform().fetchText(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=zh-TW&gl=TW`, {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Accept-Language": "zh-TW,zh;q=0.9"
    });
  } catch (e) {
    return { list: [], err: "搜尋頁讀不到（" + errText(e) + "）" };
  }
  if (r.status < 200 || r.status >= 300) return { list: [], err: "搜尋頁回應 " + r.status };
  const list = [];
  for (const m of r.body.matchAll(/"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})"([\s\S]{0,4000}?)"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g)) {
    let name = m[3];
    try {
      name = JSON.parse('"' + name + '"');
    } catch (_) {
    }
    list.push({ key: m[1], name });
    if (list.length >= 20) break;
  }
  if (!list.length) return { list, err: /consent\.youtube|consent\.google/.test(r.body) ? "搜尋頁要求同意 Cookie" : "搜尋沒有結果" };
  return { list };
}
var YT_TRAILER = /預告|trailer|teaser|予告|\bPV\b/i;
var YT_RELEASE = /上映|大銀幕|戲院|獻映|登場/;
var YT_NOT_TRAILER = /影評|解析|解說|劇透|不知道的事|冷知識|認識|盤點|看點|必看|reaction|反應|新聞|心得|懶人包|彩蛋|訪談|專訪|幕後|花絮|主題曲|片尾曲|\bOST\b|\bMV\b|\bAMV\b|直播|重溫|回顧|非官方|貓咪版|惡搞|同人|二創|自製|翻拍|parody|fan.?made|unofficial/i;
var YT_NOT_TW = /香港|澳門|港版|粵語|廣東話|\bHK\b|马来西亚|馬來西亞|新加坡/i;
function ytScore(name, title, en) {
  const base = baseTitle(title);
  const n = normTitle(name);
  const parts = base.split(/[\s:：·・\-–—_＿／/]+/).map(normTitle).filter((x) => x && !/^(?:劇場版|電影版|動畫電影|themovie|movie)$/.test(x));
  const zh = parts.length > 0 && parts.every((x) => n.includes(x));
  const e = en ? normEn(en) : "";
  const enHit = e.length >= 4 && normEn(name).includes(e);
  if (!zh && !enHit) return 0;
  const years = (name.match(/(?:19|20)\d{2}(?!\d)/g) || []).map(Number);
  const thisYear = Number(todayTPE().slice(0, 4));
  if (!isReissue(title) && years.length && !years.some((y) => Math.abs(y - thisYear) <= 1)) return 0;
  const trailer = YT_TRAILER.test(name);
  if (YT_NOT_TRAILER.test(name)) return 0;
  if (!trailer && !(zh && YT_RELEASE.test(name))) return zh ? 1 : 0;
  let sc = zh ? trailer ? 100 : 70 : 50;
  if (YT_NOT_TW.test(name)) sc -= 30;
  if (/台灣|臺灣|全台|在台|台版/.test(name)) sc += 20;
  if (!zh && /[一-鿿]/.test(name)) sc += 5;
  if (/正式|官方|official/i.test(name)) sc += 3;
  return sc;
}
async function ytTitle(key) {
  try {
    const r = await platform().fetchText(`https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + key)}&format=json`, { accept: "application/json" });
    return r.status === 200 ? String(JSON.parse(r.body).title || "") : "";
  } catch (_) {
    return "";
  }
}
async function ytTrailer(title, en) {
  const base = baseTitle(title);
  const plain = base.replace(/[:：·・\-–—_＿／/!！?？「」『』《》〈〉()（）\[\]【】]+/g, " ").replace(/\s+/g, " ").trim();
  let best = null;
  let err = "";
  for (const q of [`${plain} 預告`, `${plain} 電影 中文預告`]) {
    let r = await ytSearch(q);
    if (!r.list.length && r.err === "搜尋沒有結果") r = await ytSearch(q);
    if (r.err) err = r.err;
    r.list.forEach((v, i) => {
      const sc = ytScore(v.name, title, en) * 100 - i;
      if (sc >= 70 * 100 - 50 && (!best || sc > best.sc)) best = { ...v, sc };
    });
    if (best) break;
  }
  const b = best;
  return b ? { key: b.key, name: b.name } : { err: err || "搜尋結果裡沒有確定是這部片預告的影片" };
}
async function fillRuntimes(movies) {
  if (!movies.some((m) => !m.runtime)) return movies;
  const meta = await loadMeta().catch(() => null);
  if (meta) for (const m of movies) {
    if (m.runtime) continue;
    const e = meta.movies[normTitle(m.title)] || meta.movies[normTitle(baseTitle(m.title))];
    if (e && e.rt) {
      m.runtime = e.rt;
      m.runtimeFrom = e.rf || "開眼電影網";
    }
  }
  const todo = movies.filter((m) => !m.runtime);
  if (!todo.length) return movies;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return movies;
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: Math.min(4, queue.length) }, async () => {
      for (let m = queue.shift(); m; m = queue.shift()) {
        try {
          const r = await tmdbRuntime(m.title, token) || (m.en ? await tmdbRuntime(String(m.en), token) : 0);
          if (r) {
            m.runtime = r;
            m.runtimeFrom = "TMDB";
          }
        } catch (_) {
        }
      }
    })
  );
  return movies;
}
var moviesCache = null;
var altSlugs = {};
var sameMovieKey = (title) => normTitle(baseTitle(title)).replace(/祕/g, "秘").replace(/臺/g, "台");
function mergeSameMovies(list) {
  const groups = [];
  const byKey = {};
  for (const m of list) {
    const k = sameMovieKey(m.title);
    const g = (byKey[k] ||= []).find((x) => x.every((o) => !o.runtime || !m.runtime || Math.abs(o.runtime - m.runtime) <= 5));
    if (g) g.push(m);
    else {
      const fresh = [m];
      byKey[k].push(fresh);
      groups.push(fresh);
    }
  }
  return groups.map((g) => {
    if (g.length === 1) return g[0];
    const plain = (m) => normTitle(m.title) === normTitle(baseTitle(m.title)) ? 0 : 1;
    const main = g.slice().sort((a, b) => plain(a) - plain(b) || b.cinemaCount - a.cinemaCount)[0];
    const others = g.filter((m) => m !== main);
    const pick = (key) => main[key] || (others.find((o) => o[key]) || main)[key];
    const now = g.filter((m) => !m.comingSoon);
    altSlugs[main.slug] = others.map((m) => m.slug);
    return {
      ...main,
      en: pick("en"),
      rating: pick("rating"),
      runtime: pick("runtime"),
      release: g.map((m) => m.release || "").filter(Boolean).sort()[0] || void 0,
      score: pick("score"),
      tomato: main.tomato ?? others.find((o) => o.tomato !== void 0)?.tomato,
      popcorn: main.popcorn ?? others.find((o) => o.popcorn !== void 0)?.popcorn,
      cinemaCount: g.reduce((n, m) => n + (m.cinemaCount || 0), 0),
      comingSoon: !now.length,
      noShowToday: now.length ? now.every((m) => !!m.noShowToday) : false,
      alts: others.map((m) => m.slug)
    };
  });
}
async function loadMovies() {
  if (!moviesCache) {
    const list = await fillRuntimes(await parse("parseTwMovies", await getText(TW + "/movies/")));
    const meta = await loadMeta().catch(() => null);
    const today = todayTPE();
    for (const m of list) {
      const e = meta && (meta.movies[normTitle(m.title)] || meta.movies[normTitle(baseTitle(m.title))]);
      if (e?.rd) m.release = e.rd;
      if (e?.r?.imdb?.score) {
        m.score = e.r.imdb.score;
        m.scoreFew = (e.r.imdb.votes || 0) < 500;
      }
      if (e?.r?.tomato && typeof e.r.tomato.score === "number") {
        m.tomato = e.r.tomato.score;
        m.tomatoCert = !!e.r.tomato.certified;
      }
      if (e?.r?.popcorn && typeof e.r.popcorn.score === "number") {
        m.popcorn = e.r.popcorn.score;
        m.popcornCert = !!e.r.popcorn.certified;
      }
      if (m.comingSoon && m.release && m.release <= today) {
        m.comingSoon = false;
        m.noShowToday = true;
      }
    }
    const merged = mergeSameMovies(list);
    const chain = await Promise.race([chainAll(), delay(1500).then(() => null)]).catch(() => null);
    if (chain) {
      const known = {};
      for (const m of merged) for (const t of [m.title, m.slug, ...m.alts || []]) {
        known[normTitle(t)] = true;
        known[looseTitle(t)] = true;
      }
      for (const m of chainOnlyMovies(chain, known, today)) {
        const e = meta && (meta.movies[normTitle(m.title)] || meta.movies[normTitle(baseTitle(m.title))]);
        if (e?.rd) m.release = e.rd;
        merged.push(m);
      }
    }
    const soon = merged.filter((m) => m.comingSoon).sort((a, b) => (a.release || "9999").localeCompare(b.release || "9999"));
    moviesCache = [...merged.filter((m) => !m.comingSoon && !m.noShowToday), ...merged.filter((m) => m.noShowToday), ...soon];
  }
  return moviesCache;
}
function releaseLabel(d) {
  return d && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${d.slice(0, 10).replace(/-/g, "/")} 上映` : "";
}
function releaseOf(title) {
  const k = normTitle(title), b = normTitle(baseTitle(title));
  const m = (moviesCache || []).find((x) => normTitle(x.title) === k) || (moviesCache || []).find((x) => normTitle(baseTitle(x.title)) === b);
  if (m?.release) return m.release;
  const ck = communityKey(title);
  return (boxData?.list.find((x) => communityKey(x.name) === ck)?.release || "").slice(0, 10);
}
function boxOfficeLines(x, by = "week", past = false) {
  const week = x.week !== null && !x.since ? `${past ? "當週" : "本週"} ${money(x.week)}` : "";
  const total = `累計 ${money(x.total)}`;
  return [
    // 排的是哪一種，就把那個數字放前面
    by === "year" ? total : by === "total" ? [total, week].filter(Boolean).join("｜") : x.since ? `上映至${past ? "當時" : "今"} ${money(x.total)}` : [week, total].filter(Boolean).join("｜"),
    // 年度排行混著已經下檔的片：還在上映的標出來
    [by === "year" && x.showing ? "上映中" : "", boxMainCountry(x.country), releaseLabel(x.release), x.theaters ? `${x.theaters} 間戲院` : ""].filter(Boolean).join("｜")
  ];
}
function boxYears(b) {
  const ys = Object.keys(b.years || {}).filter((y) => (b.years[y] || []).length);
  if (!ys.length && b.year && b.year.length) ys.push(b.end.slice(0, 4));
  return ys.sort().reverse();
}
function boxYearsPicked(b, years) {
  const all = boxYears(b);
  const picked = (years || []).filter((y) => all.indexOf(y) >= 0).sort();
  return picked.length ? picked : all.slice(0, 1);
}
var yearText = (ys) => ys.length === 1 ? ys[0] : ys.every((y, i) => !i || Number(y) === Number(ys[i - 1]) + 1) ? `${ys[0]}–${ys[ys.length - 1]}` : ys.join("、");
function boxOfficeBy(b, by, years, week) {
  if (by === "week") {
    const w = boxWeekPicked(b, week);
    return w.past ? b.weekLists && b.weekLists[w.id] || [] : b.list;
  }
  if (by === "year") {
    const ys = boxYearsPicked(b, years);
    const of = (y) => b.years && b.years[y] || (y === b.end.slice(0, 4) ? b.year || [] : []);
    if (ys.length === 1) return of(ys[0]);
    return ys.flatMap(of).sort((x, y) => y.total - x.total).map((x, i) => ({ ...x, rank: i + 1 }));
  }
  if (by !== "total") return b.list;
  return b.list.slice().sort((x, y) => y.total - x.total).map((x, i) => ({ ...x, rank: i + 1 }));
}
var COUNTRY_ALIAS = { 中國大陸: "中國", 大陸: "中國", 中華民國: "台灣", 臺灣: "台灣", 南韓: "韓國", 澳大利亞: "澳洲", Australia: "澳洲", France: "法國", 美: "美國", 法: "法國", 日: "日本", 德: "德國", 北馬其頓: "馬其頓" };
function boxMainCountry(country) {
  const first = String(country || "").split(/##|[\/、,，;；]/)[0].trim();
  return COUNTRY_ALIAS[first] || first;
}
function boxCountryText(country) {
  const parts = String(country || "").split(/##|[\/、,，;；]/).map((c) => c.trim()).filter(Boolean).map((c) => COUNTRY_ALIAS[c] || c);
  return parts.filter((c, i) => parts.indexOf(c) === i).join("、");
}
var BOX_COUNTRY_NOTE = "全台灣票房，只篩選出品國，可複選。";
var issuerTag = (picked) => !picked.length ? "" : `｜${picked.length > 2 ? `${picked[0]} 等 ${picked.length} 家` : picked.join("、")}發行`;
var boxCountryTag = (picked) => !picked.length ? "" : `｜${picked.length > 3 ? `${picked.slice(0, 2).join("、")} 等 ${picked.length} 國` : picked.join("、")}出品`;
var boxCountriesPicked = (options, picked) => options.map((c) => c.id).filter((id) => picked.indexOf(id) >= 0);
function boxCountries(list) {
  const n = {};
  for (const x of list) {
    const c = boxMainCountry(x.country);
    if (c) n[c] = (n[c] || 0) + 1;
  }
  return Object.keys(n).map((id) => ({ id, count: n[id] })).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
function boxByCountry(list, picked) {
  if (!picked.length) return list;
  return list.filter((x) => picked.indexOf(boxMainCountry(x.country)) >= 0).map((x, i) => ({ ...x, rank: i + 1 }));
}
function boxMainIssuer(issue) {
  const first = String(issue || "").split(/[、,，\/]/)[0].trim();
  return first.replace(/(?:美商|香港商|英屬[^商]*商|新加坡商|日商)/g, "").replace(/(?:股份)?有限公司.*$/, "").replace(/台灣分公司$/, "").trim() || first;
}
function boxIssuers(list) {
  const n = {};
  for (const x of list) {
    const c = boxMainIssuer(x.issue);
    if (c) n[c] = (n[c] || 0) + 1;
  }
  return Object.keys(n).map((id) => ({ id, count: n[id] })).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
function issuerRecent(b, ids, days = 30) {
  const out = {};
  for (const id of ids) out[id] = [];
  if (!b || !b.years || !ids.length) return out;
  const since = addDays(todayTPE(), -days);
  for (const y of Object.keys(b.years).sort().reverse().slice(0, 2)) {
    for (const x of b.years[y]) {
      if (!x.release || x.release < since) continue;
      const id = boxMainIssuer(x.issue);
      if (out[id]) out[id].push(x);
    }
  }
  for (const id of ids) out[id].sort((a, c) => c.release.localeCompare(a.release));
  return out;
}
function boxByIssuer(list, picked) {
  if (!picked.length) return list;
  return list.filter((x) => picked.indexOf(boxMainIssuer(x.issue)) >= 0).map((x, i) => ({ ...x, rank: i + 1 }));
}
function ticketsText(n) {
  if (n >= 1e8) return `${(n / 1e8).toFixed(2).replace(/\.?0+$/, "")} 億`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, "")} 萬`;
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
var boxStatus = (x, m) => m && !m.comingSoon ? "now" : x.showing || x.week !== null ? "few" : "off";
var STATUS_LABEL = { now: "上映中", few: "少數戲院", off: "已下檔", soon: "即將上映" };
var BOXOFFICE_INFO_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice-info-";
var boxInfoMem = {};
async function boxInfo(x) {
  const y = (x.release || "").slice(0, 4);
  if (!/^20\d\d$/.test(y)) return null;
  const all = await (boxInfoMem[y] ||= (async () => {
    const r = await platform().fetchText(`${BOXOFFICE_INFO_URL}${y}.json?t=${Math.floor(Date.now() / 36e5)}`, { accept: "application/json" });
    const d = r.status === 200 ? JSON.parse(r.body) : null;
    return d && d.info || {};
  })().catch(() => {
    delete boxInfoMem[y];
    return {};
  }));
  const v = all[x.name + "|" + x.release];
  return v ? { issue: v[0] || "", produce: v[1] || "", tickets: Number(v[2]) || 0 } : null;
}
async function boxInfoBy(title) {
  const b = await loadBoxOffice().catch(() => null);
  const k = communityKey(title);
  const x = b ? b.list.find((i) => communityKey(i.name) === k) : null;
  if (!x) return null;
  return { x, info: await boxInfo(x).catch(() => null) };
}
var boxFullLatest = null;
var yearRatingsLatest = null;
var rerunIndex = /* @__PURE__ */ new WeakMap();
var rerunByName = (name) => /重映|修復|週年|周年|[紀記]念版|數位經典|經典劇場|特別版/.test(name || "");
var plainName = (s) => String(s || "").toLowerCase().replace(/[\s:：．.。・·,，、!！?？'"「」《》\-—_]/g, "");
function sameFilmRuns(a, c) {
  if (!a.release || !c.release || Math.abs(Date.parse(a.release) - Date.parse(c.release)) <= 300 * 864e5) return false;
  if (a.country && c.country && boxMainCountry(a.country) !== boxMainCountry(c.country)) return false;
  if (plainName(a.name) === plainName(c.name)) return true;
  const plainOf = (x) => !/[（(［\[]/.test(x.name) && !rerunByName(x.name);
  return rerunByName(a.name) && plainOf(c) || rerunByName(c.name) && plainOf(a);
}
function boxRuns(x, b = boxFullLatest) {
  if (!b || !b.years || !x || !x.release) return [x];
  let idx = rerunIndex.get(b);
  if (!idx) {
    idx = {};
    for (const y of Object.keys(b.years)) for (const i of b.years[y]) {
      const k = communityKey(i.name);
      if (k && i.release) (idx[k] ||= []).push(i);
    }
    for (const k of Object.keys(idx)) idx[k].sort((p, q) => p.release.localeCompare(q.release));
    rerunIndex.set(b, idx);
  }
  const same = (p, q) => p.name === q.name && p.release === q.release;
  const group = idx[communityKey(x.name)] || [];
  const runs = [group.find((i) => same(i, x)) || x];
  for (let grew = true; grew; ) {
    grew = false;
    for (const i of group) if (!runs.some((r) => same(r, i)) && runs.some((r) => sameFilmRuns(r, i))) {
      runs.push(i);
      grew = true;
    }
  }
  return runs.sort((p, q) => p.release.localeCompare(q.release));
}
function boxFirstRun(x, b = boxFullLatest) {
  const first = boxRuns(x, b)[0];
  return first && first.release < x.release && !(first.name === x.name && first.release === x.release) ? first : null;
}
var boxHasLaterRun = (x, b = boxFullLatest) => boxRuns(x, b).some((r) => r.release > x.release);
function boxRunsName(x) {
  return boxRuns(x).map((r) => r.name).sort((a, c) => plainName(a).length - plainName(c).length)[0] || x.name;
}
function boxRunRows(x) {
  const runs = boxRuns(x);
  if (runs.length < 2) return [];
  const base = plainName(boxRunsName(x));
  const rows = runs.map((r, i) => ({
    run: r,
    title: `${r.release.replace(/-/g, "/")}　${i > 0 || boxIsRerun(r) ? "重映" : "首映"}`,
    // 別次上映的片名跟這部片本來的名字不一樣（特別版、數位修復版…）才另外寫出來；其餘只寫戲院數
    note: [plainName(r.name) !== base && !(r.name === x.name && r.release === x.release) ? r.name : "", r.theaters ? `${r.theaters} 間戲院` : ""].filter(Boolean).join("｜"),
    value: money(r.total),
    current: r.name === x.name && r.release === x.release
  }));
  rows.push({ run: null, title: "合計", note: `${runs.length} 次上映`, value: money(runs.reduce((n, r) => n + (r.total || 0), 0)), current: false });
  return rows;
}
function boxOrigYear(x) {
  const r = yearRatingsLatest && x && x.release ? yearRatingsLatest.ratings[yearRatingKey(x.name, x.release)] : null;
  const y = r && r.y ? r.y : 0, shown = Number(String(x.release || "").slice(0, 4)) || 0;
  return y && shown && shown - y >= 5 ? y : 0;
}
var boxIsRerun = (x, b = boxFullLatest) => !!boxFirstRun(x, b) || rerunByName(x.name) || !!boxOrigYear(x);
function rerunDataReady() {
  if (boxFullLatest && yearRatingsLatest) return null;
  return Promise.all([loadBoxOfficeFull().catch(() => null), loadYearRatings().catch(() => null)]);
}
function boxInfoRows(x, info) {
  const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const rows = [];
  if (x.country) rows.push(["出品國別", boxCountryText(x.country)]);
  if (info && info.issue || x.issue) rows.push(["發行", info && info.issue || x.issue || ""]);
  if (info && info.produce) rows.push(["出品", info.produce]);
  rows.push(["上映日期", x.release.replace(/-/g, "/")]);
  {
    const first0 = boxFirstRun(x), orig0 = boxOrigYear(x), rec = yearRatingsLatest ? yearRatingsLatest.ratings[yearRatingKey(x.name, x.release)] : null;
    if (first0) rows.push(["上映類型", `重映（${first0.release.slice(0, 4)} 年上映過）`]);
    else if (orig0) rows.push(["上映類型", `重映（${orig0} 年的片）`]);
    else if (rerunByName(x.name)) rows.push(["上映類型", "重映"]);
    else if (rec && rec.y) rows.push(["上映類型", "首映"]);
  }
  if (x.theaters) rows.push(["上映戲院", `${x.theaters} 間`]);
  if (x.week !== null && !x.since) rows.push(["本週票房", money(x.week)]);
  const first = boxFirstRun(x), orig = boxOrigYear(x), rerun = !!first || rerunByName(x.name) || !!orig;
  rows.push([rerun ? "這次重映累計" : "累計票房", `${money(x.total)}（${num(x.total)} 元）`]);
  if (first) {
  } else if (rerun) rows.push(["先前上映票房", `${orig ? `${orig} 年的片；` : ""}官方資料從 2016 年開始，沒有更早的紀錄`]);
  const tickets = info && info.tickets || x.tickets || 0;
  if (tickets) {
    rows.push(["累計票數", `${num(tickets)} 張`]);
    rows.push(["平均票價", `${num(x.total / tickets)} 元`]);
  }
  return rows;
}
function boxOfficeTitle(b, by, years, week) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  if (by === "week" && boxWeekPicked(b, week).past) {
    const o = boxWeekOptions(b).find((x) => x.id === week);
    return `${o ? o.label : ""} 週票房（${o ? o.note : "過去"}）`;
  }
  if (by === "year") return `${yearText(boxYearsPicked(b, years))} 年度總排行（截至 ${md(b.end)}）`;
  if (by === "total") return `上映中｜累計票房（截至 ${md(b.end)}）`;
  return b.mode === "week" ? `上映中｜${md(b.start)}–${md(b.end)} 週票房` : boxOfficeLabel(b);
}
var BOX_PAGE = 100;
function boxOfficeFooter(b, by, years, week) {
  const src = `這是全台灣戲院的票房。資料來源：${b.source}。官方每週更新一次。`;
  if (by === "week" && boxWeekPicked(b, week).past)
    return `這是那一週的排行：「當週」是那七天的票房，「累計」算到那一週為止。那時候上映的片，現在可能已經下檔。標「上映至當時」的是官方那一週才第一次列入的新片，數字是上映以來的累計。${src}`;
  if (by === "year") {
    const ys = boxYearsPicked(b, years);
    return `${yearText(ys)} 年上映、有票房紀錄的電影依累計票房排序；已經下檔的也在裡面，標「上映中」的是這一週還有賣出票的。年度依上映日期歸屬，票房是上映以來的累計。一次顯示 100 部，舊片的海報會慢慢補上，找不到的用預設海報。${src}`;
  }
  const scope = `只排上映中的電影：這一週有賣出票的共 ${b.list.length} 部，已經下檔的不在裡面（看「年度」）。`;
  return by === "total" ? `${scope}${src}` : `${scope}${boxOfficeNote(b)}${src}`;
}
var RATE_SOURCES = [{ id: "imdb", label: "IMDb" }, { id: "tomato", label: "番茄指數（影評）" }, { id: "popcorn", label: "爆米花指數（觀眾）" }, { id: "community", label: "片刻評分（本 App）" }];
var COMMUNITY_MIN = 5;
function loadBoxFor(scope, sort, week) {
  return scope === "year" ? loadBoxOfficeFull() : sort === "week" && week ? loadBoxOfficeWeeks() : loadBoxOffice();
}
var mdOf = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
function movieBoard(b, movies, opt = {}) {
  const yearOptions = b ? boxYears(b) : [];
  const scopes = [{ id: "now", label: "上映中", sub: "有場次的" }];
  if (yearOptions.length) scopes.push({ id: "year", label: "年度", sub: "含已下檔" });
  const scope = (opt.scope === "year" || opt.sort === "year") && yearOptions.length ? "year" : "now";
  const yearSorts = [{ id: "total", label: "票房" }, { id: "date", label: "上映日期" }, { id: "rating", label: "評分" }, { id: "cinemas", label: "累計院數" }, { id: "tickets", label: "累計票數" }, { id: "price", label: "平均票價" }];
  const sortsAll = [];
  if (b) sortsAll.push({ id: "week", label: b.mode === "week" ? "本週票房" : "近期票房" });
  if (b && b.mode === "week") sortsAll.push({ id: "total", label: "累計票房" });
  sortsAll.push({ id: "date", label: "上映日期" }, { id: "rating", label: "評分" }, { id: "cinemas", label: "影城數" });
  if (b) sortsAll.push({ id: "tickets", label: "累計票數" }, { id: "price", label: "平均票價" });
  const sort = scope === "year" ? yearSorts.some((x) => x.id === opt.sort) ? opt.sort : "total" : sortsAll.some((x) => x.id === opt.sort) ? opt.sort : sortsAll[0].id;
  const k = (opt.query || "").trim().toLowerCase();
  const hit = (name, en) => !k || `${name} ${en || ""}`.toLowerCase().includes(k);
  const match = boxMatcher(movies);
  const selYears = b ? boxYearsPicked(b, opt.years) : [];
  const wk = b ? boxWeekPicked(b, opt.week) : { id: "", past: false };
  const orders = (scope === "year" ? yearSorts : sortsAll).map((x) => ({ id: x.id, label: x.label }));
  const yearSummary = selYears.length > 1 && selYears.length === yearOptions.length ? `全部（${yearOptions[yearOptions.length - 1]}–${yearOptions[0]}）` : selYears.join("、");
  const asc = !!opt.asc;
  const order = sort;
  const dirs = order === "date" ? [{ id: "desc", label: "新到舊" }, { id: "asc", label: "舊到新" }] : order === "cinemas" || order === "tickets" ? [{ id: "desc", label: "多到少" }, { id: "asc", label: "少到多" }] : [{ id: "desc", label: "高到低" }, { id: "asc", label: "低到高" }];
  const dirTag = asc ? `｜${dirs[1].label}` : "";
  const rates = RATE_SOURCES;
  const rate = rates.some((r) => r.id === opt.rate) ? opt.rate : "imdb";
  const fewLast = opt.fewLast !== false;
  const rangeSummary = scope === "year" ? `${yearSummary} 年上映` : "上映中";
  const base = { rangeSummary, fewLast, fewOption: order === "rating" && rate === "imdb", asc, dirs, rate, rates: order === "rating" ? rates : [], rateSummary: rates.find((r) => r.id === rate).label, scope, scopes, sort, order, orders, years: yearOptions, selYears, weeks: [], selWeek: wk.id, restTitle: "", restFooter: "", weekSummary: "", yearSummary };
  const landText = (land2, total) => land2.length ? land2.join("、") : `全部（${total} 部）`;
  const priceOf = (x) => x.tickets ? x.total / x.tickets : 0;
  const moneyKey = (x) => sort === "tickets" ? x.tickets ? { tier: 1, v: x.tickets, hi: { kind: "tickets", text: ticketsText(x.tickets), tier: "none", note: "張票" } } : { tier: 0, v: 0, hi: { kind: "tickets", text: "–", tier: "none" } } : x.tickets ? { tier: 1, v: priceOf(x), hi: { kind: "price", text: `${Math.round(priceOf(x))} 元`, tier: "none", note: "平均票價" } } : { tier: 0, v: 0, hi: { kind: "price", text: "–", tier: "none" } };
  const boxEntry = (x, by, past, old) => {
    const m = match(x.name) || null;
    const [moneyLine, info] = boxOfficeLines(x, by, past);
    const weekly = x.week !== null && !x.since;
    const hi = by === "week" ? weekly ? { kind: "money", text: money(x.week), tier: "none", note: past ? "當週" : "本週" } : { kind: "money", text: money(x.total), tier: "none", note: past ? "上映至當時" : "上映至今" } : { kind: "money", text: money(x.total), tier: "none", note: "累計" };
    const other = by === "week" ? weekly ? `累計 ${money(x.total)}` : "" : by === "total" && weekly ? `本週 ${money(x.week)}` : "";
    void moneyLine;
    return { key: `${x.name}|${x.release}`, rank: x.rank, name: x.name, x, m, lines: other ? [other, info] : [info, ""], light: old && !m, hi };
  };
  if (b && scope === "year") {
    const everyone = boxOfficeBy(b, "year", selYears, wk.id);
    const countries2 = boxCountries(everyone);
    const land2 = boxCountriesPicked(countries2, opt.countries || []);
    const issuers2 = boxIssuers(everyone);
    const firm2 = boxCountriesPicked(issuers2, opt.issuers || []);
    const pool2 = boxByIssuer(boxByCountry(everyone, land2), firm2);
    const yr = opt.yearRatings ? opt.yearRatings.ratings : {};
    const noneHi = (kind, note) => ({ kind, text: "–", tier: "none", ...note ? { note } : {} });
    const theatersOf = (x, m) => Math.max(x.theaters || 0, m && !m.comingSoon ? m.cinemaCount || 0 : 0);
    const dateOf = (x, m) => {
      const off = (x.release || "").slice(0, 10), tw = m && !m.comingSoon ? (m.release || "").slice(0, 10) : "";
      return off && tw && tw > off && Date.parse(tw) - Date.parse(off) <= 60 * 864e5 ? tw : off;
    };
    const keyOf2 = (x, m) => {
      if (sort === "date") {
        const d = dateOf(x, m);
        return d ? { tier: 1, v: Number(d.replace(/-/g, "")) || 0, hi: { kind: "date", text: mdOf(d), tier: "none", note: d.slice(0, 4) } } : { tier: 0, v: 0, hi: noneHi("date", "日期不明") };
      }
      if (sort === "cinemas") {
        const th = theatersOf(x, m);
        return th ? { tier: 1, v: th, hi: { kind: "cinemas", text: String(th), tier: "none", note: "累計院數" } } : { tier: 0, v: 0, hi: noneHi("cinemas") };
      }
      if (sort === "rating") {
        if (rate === "community") {
          const c = opt.community && opt.community[communityKey(x.name)] ? fromDist(opt.community[communityKey(x.name)], 0) : null;
          return c && c.n >= COMMUNITY_MIN ? { tier: 2, v: c.avg, hi: { kind: "community", text: c.avg.toFixed(1), tier: ratingTier("imdb", c.avg), note: `${c.n} 人` } } : { tier: 0, v: 0, hi: noneHi("community", c && c.n ? `${c.n} 人，未滿 ${COMMUNITY_MIN} 人` : "") };
        }
        const r = yr[yearRatingKey(x.name, x.release)];
        const i = r && r.i ? { s: r.i, few: (r.v || 0) < 500 } : m && m.score ? { s: m.score, few: !!m.scoreFew } : null;
        const t = r && r.t !== void 0 ? r.t : m ? m.tomato : void 0;
        const p = r && r.p !== void 0 ? r.p : m ? m.popcorn : void 0;
        if (rate === "tomato") return t !== void 0 ? { tier: 2, v: t, hi: { kind: "tomato", text: `${t}%`, tier: tomatoTier(t, r && r.t !== void 0 ? !!r.c : !!(m && m.tomatoCert)), note: tomatoLabel(t, r && r.t !== void 0 ? !!r.c : !!(m && m.tomatoCert)) } } : { tier: 0, v: 0, hi: noneHi("tomato") };
        if (rate === "popcorn") return p !== void 0 ? { tier: 2, v: p, hi: { kind: "popcorn", text: `${p}%`, tier: popcornTier(p, r && r.p !== void 0 ? !!r.h : !!(m && m.popcornCert)), note: popcornLabel(p, r && r.p !== void 0 ? !!r.h : !!(m && m.popcornCert)) } } : { tier: 0, v: 0, hi: noneHi("popcorn") };
        return i ? { tier: i.few && fewLast ? 1 : 2, v: i.s, hi: { kind: "imdb", text: i.s.toFixed(1), tier: ratingTier("imdb", i.s), ...i.few ? { note: "評分人數少" } : {} } } : { tier: 0, v: 0, hi: noneHi("imdb") };
      }
      if (sort === "tickets" || sort === "price") return moneyKey(x);
      return { tier: 1, v: x.total, hi: { kind: "money", text: money(x.total), tier: "none" } };
    };
    const keyedAll = pool2.map((x) => {
      const m = match(x.name) || null;
      return { x, m, k: keyOf2(x, m), rank: sort === "total" ? x.rank : null };
    }).filter((e) => hit(e.x.name, e.m?.en));
    const st = opt.status === "now" || opt.status === "few" || opt.status === "off" ? opt.status : "";
    const stOf = (s) => keyedAll.filter((e) => boxStatus(e.x, e.m) === s);
    const stCount = { now: stOf("now").length, few: stOf("few").length, off: stOf("off").length };
    const keyed2 = st ? stOf(st) : keyedAll;
    if (sort === "rating" || sort === "cinemas" || sort === "tickets" || sort === "price") keyed2.slice().sort((a, c) => c.k.tier - a.k.tier || c.k.v - a.k.v).forEach((e, i) => {
      if (e.k.tier > 0) e.rank = i + 1;
    });
    keyed2.sort((a, c) => c.k.tier - a.k.tier || (asc ? a.k.v - c.k.v : c.k.v - a.k.v));
    const entries2 = keyed2.map(({ x, m, k: kk, rank }) => {
      const info = [boxIsRerun(x, b) ? "重映" : boxHasLaterRun(x, b) ? "首映" : "", boxMainCountry(x.country), sort === "date" ? "" : releaseLabel(dateOf(x, m)), theatersOf(x, m) && sort !== "cinemas" ? `${theatersOf(x, m)} 間戲院` : ""].filter(Boolean).join("｜");
      return { key: `${x.name}|${x.release}`, rank, name: x.name, x, m, lines: sort === "total" ? [info, ""] : [`票房 ${money(x.total)}`, info], light: !m, hi: kk.hi, status: boxStatus(x, m) };
    });
    const rateName2 = rates.find((r) => r.id === rate).label;
    const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
    const yt = yearText(selYears);
    const src = `這是全台灣戲院的票房。資料來源：${b.source}。官方每週更新一次。`;
    const cov = opt.yearRatings && opt.yearRatings.total ? `評分由伺服器慢慢建立中：全部 ${opt.yearRatings.total} 部已查 ${Object.keys(yr).length + opt.yearRatings.missed} 部，還沒查到的顯示「–」。` : "評分資料還在建立中，還沒查到的顯示「–」。";
    return {
      ...base,
      sorts: yearSorts,
      weeks: [],
      weekSummary: "",
      countries: countries2,
      selCountries: land2,
      everyone: everyone.length,
      countrySummary: landText(land2, everyone.length),
      entries: entries2,
      rest: [],
      issuers: issuers2,
      selIssuers: firm2,
      issuerSummary: landText(firm2, everyone.length),
      statusSel: st,
      statusPicks: [{ id: "", label: "全部", count: keyedAll.length }, { id: "now", label: "上映中", count: stCount.now }, { id: "few", label: "少數戲院", count: stCount.few }, { id: "off", label: "已下檔", count: stCount.off }],
      title: (st ? STATUS_LABEL[st] + "｜" : "") + (sort === "total" ? `${yt} 年票房排行（截至 ${md(b.end)}）${dirTag}` : `${yt} 年上映 ${entries2.length} 部｜${sort === "date" ? asc ? "最早上映在前" : "最新上映在前" : sort === "rating" ? `${rateName2}${asc ? "低到高" : "高到低"}` : sort === "tickets" ? `累計票數${asc ? "少到多" : "多到少"}` : sort === "price" ? `平均票價${asc ? "低到高" : "高到低"}` : `累計院數${asc ? "少到多" : "多到少"}`}`) + boxCountryTag(land2) + issuerTag(firm2),
      footer: sort === "total" ? boxOfficeFooter(b, "year", selYears, wk.id) : `${yt} 年上映、有票房紀錄的電影（已經下檔的也在裡面）${sort === "date" ? "依上映日期排序" : sort === "tickets" ? "依累計票數排序（上映以來賣出的票數）" : sort === "price" ? "依平均票價排序（累計票房 ÷ 累計票數；特殊廳、演唱會轉播的票價較高）" : sort === "rating" ? `依${rateName2}排序。${rate === "community" ? `評分不到 ${COMMUNITY_MIN} 人的不列入。` : cov}` : `依累計院數排序：上映以來放映過的戲院數（官方票房資料，算到 ${md(b.end)}）。還在上映的片，今天有場次的影城如果比官方的數字多，就用今天的數字，所以上映中和已下檔的片算法相同`}。${src}`.replace("。。", "。"),
      restTitle: "",
      restFooter: "",
      paged: true
    };
  }
  if (b && (sort === "week" || sort === "total" || sort === "tickets" || sort === "price")) {
    const extra = sort === "tickets" || sort === "price";
    const by = extra ? "total" : sort;
    const past = by === "week" && wk.past;
    const everyone = extra ? b.list.map((x) => ({ x, k: moneyKey(x) })).sort((a, c) => c.k.tier - a.k.tier || c.k.v - a.k.v).map(({ x }, i) => ({ ...x, rank: i + 1 })) : boxOfficeBy(b, by, selYears, wk.id);
    const countries2 = boxCountries(everyone);
    const land2 = boxCountriesPicked(countries2, opt.countries || []);
    const issuers2 = boxIssuers(everyone);
    const firm2 = boxCountriesPicked(issuers2, opt.issuers || []);
    const entries2 = boxByIssuer(boxByCountry(everyone, land2), firm2).map((x) => {
      const e = boxEntry(x, by, past, by === "year" || past);
      if (!extra) return e;
      const kk = moneyKey(x);
      return { ...e, rank: kk.tier ? e.rank : null, hi: kk.hi, lines: [`累計 ${money(x.total)}`, e.lines[e.lines[1] ? 1 : 0]] };
    }).filter((e) => hit(e.name, e.m?.en));
    if (asc) entries2.reverse();
    let rest = [];
    if (by !== "year" && !past && !land2.length && !firm2.length) {
      const ranked = {};
      for (const x of b.list) ranked[communityKey(x.name)] = true;
      rest = movies.filter((m) => !m.comingSoon && !ranked[communityKey(m.title)] && hit(m.title, m.en)).map((m) => ({ key: m.slug, rank: null, name: m.title, x: null, m, lines: movieLines(m), light: false }));
    }
    return {
      ...base,
      sorts: scope === "year" ? [] : sortsAll,
      weeks: by === "week" ? boxWeekOptions(b) : [],
      weekSummary: by === "week" ? ((o) => o ? `${o.label}（${o.note}）` : "")(boxWeekOptions(b).find((o) => o.id === wk.id)) : "",
      countries: countries2,
      selCountries: land2,
      everyone: everyone.length,
      countrySummary: landText(land2, everyone.length),
      entries: entries2,
      rest,
      issuers: issuers2,
      selIssuers: firm2,
      issuerSummary: landText(firm2, everyone.length),
      title: (extra ? `上映中｜${sort === "tickets" ? "累計票數" : "平均票價"}（截至 ${mdOf(b.end)}）` : boxOfficeTitle(b, by, selYears, wk.id)) + dirTag + boxCountryTag(land2) + issuerTag(firm2),
      footer: extra ? `只排上映中的電影：這一週有賣出票的共 ${b.list.length} 部。${sort === "tickets" ? "累計票數是上映以來賣出的票數。" : "平均票價是累計票房 ÷ 累計票數；特殊廳、演唱會轉播的票價較高。"}這是全台灣戲院的票房。資料來源：${b.source}。官方每週更新一次。` : boxOfficeFooter(b, by, selYears, wk.id),
      restTitle: rest.length ? `其他上映中｜未進榜（${rest.length}）` : "",
      restFooter: "有場次、但這一週的票房資料裡還沒有的片：剛上映還沒統計到，或只在少數戲院放映。依今天放映的影城數排序。",
      paged: by === "year"
    };
  }
  const boxOf = {};
  for (const x of b ? b.list : []) boxOf[communityKey(x.name)] ||= x;
  const pool = movies.filter((m) => !m.comingSoon).map((m) => ({ m, x: boxOf[communityKey(m.title)] || null, d: m.release || "" }));
  for (const p of pool) if (!p.d && p.x) p.d = p.x.release.slice(0, 10);
  const countries = boxCountries(pool.filter((p) => p.x).map((p) => p.x));
  const land = boxCountriesPicked(countries, opt.countries || []);
  const issuers = boxIssuers(pool.filter((p) => p.x).map((p) => p.x));
  const firm = boxCountriesPicked(issuers, opt.issuers || []);
  const list = pool.filter((p) => (!land.length || !!p.x && land.indexOf(boxMainCountry(p.x.country)) >= 0) && (!firm.length || !!p.x && firm.indexOf(boxMainIssuer(p.x.issue)) >= 0) && hit(p.m.title, p.m.en));
  const none = (kind, note) => ({ kind, text: "–", tier: "none", ...note ? { note } : {} });
  const rated = (m) => {
    if (rate === "tomato") return m.tomato !== void 0 ? { tier: 2, v: m.tomato, hi: { kind: "tomato", text: `${m.tomato}%`, tier: tomatoTier(m.tomato, m.tomatoCert), note: tomatoLabel(m.tomato, m.tomatoCert) } } : { tier: 0, v: 0, hi: none("tomato") };
    if (rate === "popcorn") return m.popcorn !== void 0 ? { tier: 2, v: m.popcorn, hi: { kind: "popcorn", text: `${m.popcorn}%`, tier: popcornTier(m.popcorn, m.popcornCert), note: popcornLabel(m.popcorn, m.popcornCert) } } : { tier: 0, v: 0, hi: none("popcorn") };
    if (rate === "community") {
      const c = opt.community && opt.community[communityKey(m.title)] ? fromDist(opt.community[communityKey(m.title)], 0) : null;
      return c && c.n >= COMMUNITY_MIN ? { tier: 2, v: c.avg, hi: { kind: "community", text: c.avg.toFixed(1), tier: ratingTier("imdb", c.avg), note: `${c.n} 人` } } : { tier: 0, v: 0, hi: none("community", c && c.n ? `${c.n} 人，未滿 ${COMMUNITY_MIN} 人` : "") };
    }
    return m.score ? { tier: m.scoreFew && fewLast ? 1 : 2, v: m.score, hi: { kind: "imdb", text: m.score.toFixed(1), tier: ratingTier("imdb", m.score), ...m.scoreFew ? { note: "評分人數少" } : {} } } : { tier: 0, v: 0, hi: none("imdb") };
  };
  const thisYear = todayTPE().slice(0, 4);
  const weekAgo = new Date(Date.parse(todayTPE()) - 7 * 864e5).toISOString().slice(0, 10);
  const keyOf = (p) => sort === "date" ? { tier: p.d ? 1 : 0, v: Number(p.d.replace(/-/g, "")) || 0, hi: p.d ? { kind: "date", text: mdOf(p.d), tier: "none", ...p.d.slice(0, 4) !== thisYear ? { note: p.d.slice(0, 4) } : p.d >= weekAgo ? { note: "新片" } : {} } : none("date", "日期不明") } : sort === "rating" ? rated(p.m) : { tier: p.m.noShowToday ? 0 : 1, v: p.m.cinemaCount || 0, hi: p.m.cinemaCount ? { kind: "cinemas", text: String(p.m.cinemaCount), tier: "none", note: "間影城" } : none("cinemas", p.m.noShowToday ? "今天無場次" : "") };
  const keyed = list.map((p) => ({ p, k: keyOf(p), rank: null }));
  if (sort !== "date") keyed.slice().sort((a, c) => c.k.tier - a.k.tier || c.k.v - a.k.v).forEach((e, i) => {
    if (e.k.tier > 0) e.rank = i + 1;
  });
  keyed.sort((a, c) => c.k.tier - a.k.tier || (asc ? a.k.v - c.k.v : c.k.v - a.k.v));
  const entries = keyed.map(({ p: { m, x, d }, k: k2, rank }) => {
    const first = [m.noShowToday && sort !== "cinemas" ? "今天無場次" : "", d && sort !== "date" ? `${d.slice(0, 4) !== thisYear ? d.slice(0, 4) + "/" : ""}${mdOf(d)} 上映` : "", m.rating, m.runtime ? `${m.runtime} 分` : "", m.cinemaCount && sort !== "cinemas" ? `${m.cinemaCount} 間影城` : ""].filter(Boolean).join("｜");
    return { key: m.slug, rank, name: m.title, x, m, lines: [first, x ? boxOfficeLines(x, "week")[0] : m.en || ""], light: false, hi: k2.hi };
  });
  const rateName = rates.find((r) => r.id === rate).label;
  const how = sort === "date" ? `依上映日期排序，${asc ? "最早上映的在前" : "新上映的在前"}；不知道日期的在最後` : sort === "rating" ? `依${rateName}排序，${asc ? "低到高" : "高到低"}；${rate === "imdb" ? fewLast ? "評分人數不到 500 人的分數不太準，排在後面，" : "評分人數不到 500 人的也照分數一起排（會標「評分人數少」），" : rate === "community" ? `評分不到 ${COMMUNITY_MIN} 人的不列入，` : ""}沒有這項評分的在最後` : `依今天放映的影城數排序，${asc ? "少到多" : "多到少"}；今天沒有場次、過幾天才有的在最後`;
  return {
    ...base,
    sorts: sortsAll,
    countries,
    selCountries: land,
    everyone: pool.length,
    countrySummary: landText(land, pool.length),
    entries,
    rest: [],
    issuers,
    selIssuers: firm,
    issuerSummary: landText(firm, pool.length),
    title: `上映中 ${entries.length} 部｜${sort === "date" ? asc ? "最早上映在前" : "最新上映在前" : sort === "rating" ? `${rateName}${asc ? "低到高" : "高到低"}` : `放映影城${asc ? "少到多" : "多到少"}`}` + boxCountryTag(land) + issuerTag(firm),
    footer: `${how}。場次資料來自場次通${b ? `；票房是全台灣戲院的票房，資料來源：${b.source}` : ""}。${land.length || firm.length ? "篩選出品國別、發行商時，只列得出票房資料裡有的片。" : ""}`,
    paged: false
  };
}
async function loadMovieBoard(opt) {
  const year = opt.scope === "year" || opt.sort === "year";
  const needCommunity = opt.sort === "rating" && opt.rate === "community";
  const needYearRatings = year && opt.sort === "rating" && opt.rate !== "community";
  const [b, all, community, yearRatings] = await Promise.all([
    loadBoxFor(year ? "year" : "now", opt.sort || "week", opt.week || "").catch(() => null),
    loadMovies().catch(() => []),
    needCommunity ? loadCommunitySummary() : Promise.resolve(null),
    needYearRatings || opt.scope === "year" ? loadYearRatings() : Promise.resolve(null)
  ]);
  if (!b && !all.length) throw new Error("讀不到電影清單，請稍後再試");
  return movieBoard(b, all, { ...opt, community, yearRatings });
}
var UPCOMING_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/upcoming.json";
var upcomingMem = null;
function loadUpcoming() {
  if (upcomingMem && Date.now() - upcomingMem.at < 18e5) return upcomingMem.job;
  const job = (async () => {
    let disk = null;
    try {
      disk = JSON.parse(cacheGet("upcoming.json") || "null");
    } catch (_) {
    }
    let films = disk && Array.isArray(disk.films) ? disk.films : [];
    if (!disk || Date.now() - disk.at > 6 * 36e5) {
      try {
        const r = await platform().fetchText(UPCOMING_URL + "?t=" + Math.floor(Date.now() / 36e5), { accept: "application/json" });
        const d = r.status === 200 ? JSON.parse(r.body) : null;
        if (d && Array.isArray(d.films)) {
          films = d.films.filter((f) => f && typeof f.title === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f.release || ""));
          cacheSet("upcoming.json", JSON.stringify({ at: Date.now(), films }));
        }
      } catch (_) {
      }
    }
    for (const f of films) if (/^https:\/\/image\.tmdb\.org\//.test(f.poster || "")) yearPosterSeen[normTitle(f.title)] ||= f.poster;
    return films;
  })();
  upcomingMem = { at: Date.now(), job };
  return job;
}
function soonBoard(movies, upcoming, query, opt = {}) {
  const k = (query || "").trim().toLowerCase();
  const hit = (name, en) => !k || `${name} ${en || ""}`.toLowerCase().includes(k);
  const today = todayTPE();
  const upOf = {};
  for (const u of upcoming) upOf[communityKey(u.title)] ||= u;
  const known = {};
  for (const m of movies) known[communityKey(m.title)] = true;
  let rows = [];
  for (const m of movies) {
    if (!m.comingSoon || !hit(m.title, m.en)) continue;
    const u = upOf[communityKey(m.title)];
    const release = m.release || (u ? u.release : "");
    const mm = release && !m.release ? { ...m, release } : m;
    const [a, b] = movieLines(mm);
    rows.push({ key: m.slug, title: m.title, m, u: null, lines: [[a, "可查場次"].filter(Boolean).join("｜"), b], release });
  }
  for (const u of upcoming) {
    if (known[communityKey(u.title)] || u.release <= today || !hit(u.title, u.en)) continue;
    rows.push({ key: "u|" + u.title + "|" + u.release, title: u.title, m: null, u, lines: [[`${mdOf(u.release)} ${u.approx ? "當週" : ""}上映`, u.rating, u.runtime ? `${u.runtime} 分` : "", "尚未開放場次"].filter(Boolean).join("｜"), u.en || ""], release: u.release });
  }
  rows.sort((a, b) => (a.release || "9999").localeCompare(b.release || "9999"));
  const in2w = addDays(today, 14), thisYear = today.slice(0, 4);
  const whenOK = (r, w) => !w || (w === "2w" ? !!r.release && r.release <= in2w : w === "none" ? !r.release : (r.release || "").slice(0, 7) === w);
  const stateOK = (r, s) => !s || (s === "open" ? !!r.m : !r.m);
  const months = Array.from(new Set(rows.map((r) => (r.release || "").slice(0, 7)).filter(Boolean))).sort();
  const whenIds = ["", "2w", ...months, ...rows.some((r) => !r.release) ? ["none"] : []];
  const whenName = (w) => !w ? "全部" : w === "2w" ? "兩週內" : w === "none" ? "日期未定" : `${w.slice(0, 4) === thisYear ? "" : w.slice(0, 4) + " 年 "}${Number(w.slice(5, 7))} 月`;
  const when = whenIds.indexOf(opt.when || "") >= 0 ? opt.when || "" : "";
  const state = opt.state === "open" || opt.state === "wait" ? opt.state : "";
  const stateName = (s) => !s ? "全部" : s === "open" ? "可查場次" : "尚未開放場次";
  const whens = whenIds.map((w) => ({ id: w, label: whenName(w), count: rows.filter((r) => whenOK(r, w) && stateOK(r, state)).length }));
  const states = ["", "open", "wait"].map((s) => ({ id: s, label: stateName(s), count: rows.filter((r) => whenOK(r, when) && stateOK(r, s)).length }));
  rows = rows.filter((r) => whenOK(r, when) && stateOK(r, state));
  const open = rows.filter((r) => r.m).length;
  return {
    whens,
    when,
    whenLabel: whenName(when),
    states,
    state,
    stateLabel: stateName(state),
    total: rows.length,
    open,
    groups: soonGroups(rows).map((g) => ({ title: g.title, items: g.items.map(({ release: _r, ...e }) => e) })),
    footer: `標「可查場次」的已經可以找場次（資料來自場次通）；標「尚未開放場次」的是之後要上映、戲院還沒排場次的片${upcoming.length ? "（片單與上映日期來自開眼電影網，日期可能再調整）" : ""}。`
  };
}
var CN_NUM = { "〇": "0", 零: "0", 一: "1", 二: "2", 三: "3", 四: "4", 五: "5", 六: "6", 七: "7", 八: "8", 九: "9" };
var searchKey = (s) => {
  let t = String(s || "");
  try {
    t = t.normalize("NFKC");
  } catch (_) {
  }
  return t.toLowerCase().replace(/臺/g, "台").replace(/[〇零一二三四五六七八九]/g, (c) => CN_NUM[c]).replace(/[\s:：．.。・·,，、!！?？'"「」《》()（）\-—_]/g, "");
};
async function globalSearch(query, cinemas) {
  const terms = String(query || "").split(/\s+/).map(searchKey).filter(Boolean);
  const whole = terms.join("");
  const out = { cinemas: [], now: [], soon: [], year: [], fest: [], best: [], loose: false };
  if (!terms.length) return out;
  const [movies, upcoming, box, fests] = await Promise.all([
    loadMovies().catch(() => []),
    loadUpcoming().catch(() => []),
    loadBoxOfficeFull().catch(() => null),
    loadFestivals().catch(() => []),
    loadYearRatings().catch(() => null)
    // 裡面有每部片的首映年：結果要標「重映」
  ]);
  const allFests = [...fests];
  const thisYear = Number(todayTPE().slice(0, 4));
  const older = await Promise.all(festivalYears().filter((y) => !fests.some((f) => Number(f.start.slice(0, 4)) === y) && y !== thisYear).map((y) => loadFestivals(y).catch(() => [])));
  for (const list of older) for (const f of list) if (!allFests.some((x) => x.id === f.id)) allFests.push(f);
  allFests.sort((a, b) => b.start.localeCompare(a.start));
  const cand = (v, name, ...more) => ({ v, name: searchKey(name), hay: searchKey([name, ...more].filter(Boolean).join(" ")) });
  const shown = {};
  for (const m of movies) shown[communityKey(m.title)] = true;
  const seen = {};
  const years = box && box.years || {};
  const yearCands = [];
  for (const y of Object.keys(years).sort().reverse()) {
    for (const x of years[y]) {
      const key = communityKey(x.name), id = `${key}|${String(x.release || "").slice(0, 4)}`;
      if (shown[key] || seen[id]) continue;
      seen[id] = true;
      yearCands.push(cand(x, x.name, String(x.release || "").slice(0, 4), boxMainCountry(x.country)));
    }
  }
  yearCands.sort((a, c) => String(c.v.release || "").localeCompare(String(a.v.release || "")));
  const pools = {
    cinemas: cinemas.map((c) => cand(c, c.name, c.city, c.district, c.id, c.aliases)),
    now: movies.filter((m) => !m.comingSoon).map((m) => cand(m, m.title, m.en, (m.release || "").slice(0, 4))),
    soon: soonBoard(movies, upcoming, "").groups.flatMap((g) => g.items).map((e) => cand(e, e.title, e.m ? e.m.en : e.u ? e.u.en : "", ((e.m ? e.m.release : e.u ? e.u.release : "") || "").slice(0, 4))),
    year: yearCands,
    fest: allFests.flatMap((f) => (f.films || []).map((film) => cand({ f, film }, film.title, f.name, f.start.slice(0, 4))))
  };
  const score = (c) => {
    if (!terms.every((t) => c.hay.includes(t))) return 0;
    return c.name === whole ? 3 : c.name.startsWith(whole) || c.name.startsWith(terms[0]) ? 2 : 1;
  };
  const chars = Array.from(new Set(Array.from(whole)));
  const looseScore = (c) => {
    if (chars.length < 2) return 0;
    const n = chars.filter((ch) => c.name.includes(ch)).length;
    return n >= Math.ceil(chars.length * 0.8) ? n : 0;
  };
  const pick = (pool, fn, max = Infinity) => pool.map((c, i) => ({ v: c.v, s: fn(c), i })).filter((r) => r.s > 0).sort((p, q) => q.s - p.s || p.i - q.i).slice(0, max);
  let got = { cinemas: pick(pools.cinemas, score), now: pick(pools.now, score), soon: pick(pools.soon, score), year: pick(pools.year, score), fest: pick(pools.fest, score) };
  if (!(got.cinemas.length + got.now.length + got.soon.length + got.year.length + got.fest.length)) {
    out.loose = true;
    got = { cinemas: pick(pools.cinemas, looseScore, 5), now: pick(pools.now, looseScore, 8), soon: pick(pools.soon, looseScore, 8), year: pick(pools.year, looseScore, 12), fest: pick(pools.fest, looseScore, 8) };
  }
  out.cinemas = got.cinemas.map((r) => r.v);
  out.now = got.now.map((r) => r.v);
  out.soon = got.soon.map((r) => r.v);
  out.year = got.year.map((r) => r.v);
  out.fest = got.fest.map((r) => r.v);
  if (!out.loose) {
    const best = [
      ...got.now.filter((r) => r.s === 3).map((r) => ({ kind: "now", m: r.v })),
      ...got.soon.filter((r) => r.s === 3).map((r) => ({ kind: "soon", e: r.v })),
      ...got.cinemas.filter((r) => r.s === 3).map((r) => ({ kind: "cinema", c: r.v })),
      ...got.year.filter((r) => r.s === 3).map((r) => ({ kind: "year", x: r.v })),
      ...got.fest.filter((r) => r.s === 3).map((r) => ({ kind: "fest", f: r.v.f, film: r.v.film }))
    ];
    out.best = best.slice(0, 3);
  }
  return out;
}
async function loadSoonBoard(query, opt = {}) {
  const [movies, upcoming] = await Promise.all([loadMovies(), loadUpcoming().catch(() => [])]);
  return soonBoard(movies, upcoming, query, opt);
}
var YEAR_RATINGS_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/ratings-years.json";
var yearRatingKey = (name, release) => `${normTitle(name)}|${String(release || "").slice(0, 4)}`;
var yearRatingsMem = null;
function loadYearRatings() {
  if (yearRatingsMem && Date.now() - yearRatingsMem.at < 18e5) return yearRatingsMem.job;
  const job = (async () => {
    let disk = null;
    try {
      disk = JSON.parse(cacheGet("ratings-years3.json") || "null");
    } catch (_) {
    }
    if (disk && disk.data && Date.now() - disk.at < 6 * 36e5) return disk.data;
    try {
      const r = await platform().fetchText(YEAR_RATINGS_URL + "?t=" + Math.floor(Date.now() / 18e5), { accept: "application/json" });
      const d = r.status === 200 ? JSON.parse(r.body) : null;
      if (d && d.ratings && typeof d.ratings === "object") {
        const data = { total: Number(d.total) || 0, missed: Object.keys(d.miss || {}).length, ratings: d.ratings };
        try {
          cacheSet("ratings-years3.json", JSON.stringify({ at: Date.now(), data }));
        } catch (_) {
        }
        return data;
      }
    } catch (_) {
    }
    return disk && disk.data ? disk.data : null;
  })().then((d) => {
    if (d) yearRatingsLatest = d;
    return d;
  });
  yearRatingsMem = { at: Date.now(), job };
  return job;
}
var introMem = {};
function loadIntro(name, release) {
  const none = { intro: "", director: "", cast: "" };
  const year = String(release || "").slice(0, 4);
  if (!/^20\d{2}$/.test(year)) return Promise.resolve(none);
  const job = introMem[year] ||= (async () => {
    const file = `intro-${year}.json`;
    try {
      const c = JSON.parse(cacheGet(file) || "null");
      if (c && c.data && Date.now() - c.at < 24 * 36e5) return c.data;
    } catch (_) {
    }
    const r = await platform().fetchText(`https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/${file}?t=${Math.floor(Date.now() / 36e5)}`, { accept: "application/json" });
    const d = r.status === 200 ? JSON.parse(r.body) : null;
    if (!d || typeof d !== "object") {
      delete introMem[year];
      return {};
    }
    try {
      cacheSet(file, JSON.stringify({ at: Date.now(), data: d }));
    } catch (_) {
    }
    return d;
  })().catch(() => {
    delete introMem[year];
    return {};
  });
  return job.then((m) => {
    const v = m[yearRatingKey(name, release)];
    if (!v) return none;
    return typeof v === "string" ? { ...none, intro: v } : { intro: String(v.t || ""), director: String(v.d || ""), cast: String(v.c || "") };
  });
}
var isFavMovie = (s, title) => (s.favMovies || []).some((f) => f.key === communityKey(title));
function toggleFavMovie(s, m) {
  const key = communityKey(m.title);
  const list = s.favMovies || [];
  if (list.some((f) => f.key === key)) {
    s.favMovies = list.filter((f) => f.key !== key);
    return false;
  }
  s.favMovies = [{ key, title: m.title, ...m.en ? { en: m.en } : {}, ...m.poster && /^https:/.test(m.poster) ? { poster: m.poster } : {}, ...m.fest ? { fest: m.fest } : {}, at: Date.now() }, ...list].slice(0, 200);
  return true;
}
async function favMovieRows(s) {
  const favs = s.favMovies || [];
  if (!favs.length) return [];
  const festIds = Array.from(new Set(favs.map((f) => f.fest ? f.fest.id : "").filter(Boolean)));
  const [movies, upcoming, box, ...fests] = await Promise.all([
    loadMovies().catch(() => []),
    loadUpcoming().catch(() => []),
    loadBoxOffice().catch(() => null),
    ...festIds.map((id) => festivalFind(id).catch(() => null))
  ]);
  const today = todayTPE();
  const rows = favs.map((fav) => {
    const m = movies.find((x2) => communityKey(x2.title) === fav.key);
    if (m) return { fav, kind: "movie", target: { kind: "movie", m }, line: m.comingSoon ? [m.release ? `${mdOf(m.release)} 上映` : "即將上映", "可查場次"].join("｜") : [m.noShowToday ? "上映中｜今天無場次" : "上映中", m.cinemaCount ? `${m.cinemaCount} 間影城` : ""].filter(Boolean).join("｜") };
    const f = fav.fest ? fests[festIds.indexOf(fav.fest.id)] : null;
    const film = f ? f.films.find((x2) => x2.id === fav.fest.film) || f.films.find((x2) => communityKey(x2.title) === fav.key) : null;
    if (f && film) return { fav, kind: "fest", target: { kind: "fest", f, film }, line: `${f.name}（${festivalStateLabel(f)}）` };
    const u = upcoming.find((x2) => communityKey(x2.title) === fav.key && x2.release > today);
    if (u) return { fav, kind: "soon", target: { kind: "soon", u }, line: `${u.release.slice(0, 4) === today.slice(0, 4) ? "" : u.release.slice(0, 4) + "/"}${mdOf(u.release)} ${u.approx ? "當週" : ""}上映｜尚未開放場次` };
    const x = box ? box.list.find((b) => communityKey(b.name) === fav.key) : null;
    if (x) return { fav, kind: "box", target: { kind: "box", x }, line: `目前沒有場次｜累計票房 ${money(x.total)}` };
    return { fav, kind: "none", target: { kind: "none" }, line: fav.fest ? `${fav.fest.name}｜目前沒有場次` : "目前沒有場次（可能已下檔）" };
  });
  const order = { movie: 0, soon: 1, fest: 2, box: 3, none: 4 };
  return rows.sort((a, b) => order[a.kind] - order[b.kind] || b.fav.at - a.fav.at);
}
function favSnapGet(sig) {
  try {
    const c = JSON.parse(cacheGet("fav-rows.json") || "null");
    return c && c.sig === sig && Array.isArray(c.rows) && Date.now() - c.at < 7 * 864e5 ? c.rows : null;
  } catch (_) {
    return null;
  }
}
function favSnapSet(sig, rows) {
  try {
    cacheSet("fav-rows.json", JSON.stringify({ sig, at: Date.now(), rows }));
  } catch (_) {
  }
}
async function favMovieBox(fav) {
  const b = await loadBoxOfficeFull().catch(() => null);
  if (!b || !b.years) return null;
  for (const y of Object.keys(b.years).sort().reverse()) {
    const x = b.years[y].find((i) => communityKey(i.name) === fav.key);
    if (x) return x;
  }
  return null;
}
function soonGroups(list) {
  const out = [];
  for (const m of list) {
    const key = m.release && /^\d{4}-\d{2}/.test(m.release) ? m.release.slice(0, 7) : "";
    const g = out.find((x) => x.key === key);
    if (g) g.items.push(m);
    else out.push({ key, items: [m] });
  }
  out.sort((a, b) => (a.key || "9999").localeCompare(b.key || "9999"));
  const thisYear = todayTPE().slice(0, 4);
  return out.map((g) => ({ title: `${g.key ? `${g.key.slice(0, 4) === thisYear ? "" : g.key.slice(0, 4) + " 年 "}${Number(g.key.slice(5, 7))} 月` : "日期未定"}（${g.items.length}）`, items: g.items }));
}
function movieLines(m) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const head = m.noShowToday ? "今天無場次" : m.comingSoon ? m.release ? `${md(m.release)} 上映` : "" : "";
  return [[head, m.rating, m.runtime ? `${m.runtime} 分` : "", m.cinemaCount ? `${m.cinemaCount} 間影城` : ""].filter(Boolean).join("｜"), m.en || ""];
}
var movieDayCache = {};
var mergedDayCache = {};
var chainDayCache = {};
async function movieDay(slug, date) {
  const ck = slug + "|" + (date || "");
  if (chainDayCache[ck]) return chainDayCache[ck];
  const out = await movieDayChain(slug, date);
  if (out.chained) chainDayCache[ck] = out.day;
  return out.day;
}
async function movieDayChain(slug, date) {
  const today = todayTPE();
  const chainJob = Promise.race([chainAll(), delay(1500).then(() => null)]);
  let base = isChainSlug(slug) ? null : await movieDayTw(slug, date).catch(() => null);
  const chain = await (isChainSlug(slug) ? chainAll() : chainJob);
  if (!chain && isChainSlug(slug)) throw new Error("秀泰的場次暫時讀不到，請稍後再試");
  if (!chain) return { day: base || await movieDayTw(slug, date), chained: false };
  let pure = false;
  if (isChainSlug(slug)) {
    const title = slug.slice(CHAIN_SLUG.length), key = normTitle(title);
    let info = null;
    const days = {};
    for (const id of Object.keys(chain)) for (const d of Object.keys(chain[id].schedules || {})) {
      if (d < today) continue;
      const m = chain[id].schedules[d].find((x) => normTitle(x.title) === key);
      if (m) {
        days[d] = true;
        info = info || m;
      }
    }
    const all2 = Object.keys(days).sort();
    if (!all2.length || !info) throw new Error("這部片目前沒有場次");
    base = { title, en: "", rating: info.rating || "", runtime: info.runtime || 0, date: date && days[date] ? date : all2[0], dates: [], cinemas: [] };
    pure = true;
  } else if (date && (!base || base.date !== date)) {
    const head = await movieDayTw(slug, void 0).catch(() => null);
    if (!head) {
      if (base) return { day: base, chained: false };
      throw new Error("讀不到這部片的場次");
    }
    base = { ...head, date, cinemas: [] };
    pure = true;
  }
  if (!base) return { day: await movieDayTw(slug, date), chained: false };
  const names = [base.title, slug, ...altSlugs[slug] || []].map((t) => normTitle(t)).filter(Boolean);
  const hitOf = (list) => (list || []).filter((m) => names.indexOf(normTitle(m.title)) >= 0);
  const want = base.date;
  const more = {};
  const add = [];
  for (const id of Object.keys(chain)) {
    const sch = chain[id].schedules || {};
    for (const d of Object.keys(sch)) if (d >= today && hitOf(sch[d]).length) more[d] = true;
    const vs = hitOf(sch[want]).flatMap((m) => m.versions);
    if (vs.length) add.push({ id, versions: vs });
  }
  const dates = Array.from(/* @__PURE__ */ new Set([...base.dates.length ? base.dates : pure ? [] : [base.date], ...Object.keys(more)])).sort();
  if (!add.length && dates.length === base.dates.length) return { day: base, chained: true };
  const all = add.length ? await loadCinemas().catch(() => []) : [];
  const cinemas = base.cinemas.map((c) => ({ ...c, versions: c.versions.map((v) => ({ ...v, times: v.times.slice() })) }));
  for (const a of add) {
    let c = cinemas.find((x) => x.id === a.id);
    if (!c) {
      const info = all.find((x) => x.id === a.id);
      if (!info) continue;
      cinemas.push(c = { id: a.id, name: info.name, city: info.city, district: info.district, address: info.address || "", versions: [], full: true });
    }
    for (const v of a.versions) {
      const ov = c.versions.find((x) => x.label === v.label);
      if (ov) ov.times = Array.from(/* @__PURE__ */ new Set([...ov.times, ...v.times])).sort();
      else c.versions.push({ label: v.label, times: v.times.slice() });
    }
  }
  return { day: { ...base, dates, cinemas }, chained: true };
}
async function movieDayTw(slug, date) {
  if (!moviesCache) await loadMovies().catch(() => null);
  const alts = altSlugs[slug] || [];
  if (!alts.length) return movieDayOne(slug, date);
  const ck = slug + "|" + (date || "");
  if (mergedDayCache[ck]) return mergedDayCache[ck];
  const firsts = (await Promise.all([slug, ...alts].map((s) => movieDayOne(s, void 0).then((d) => ({ s, d }), () => null)))).filter((x) => !!x);
  if (!firsts.length) return movieDayOne(slug, date);
  const dates = Array.from(new Set(firsts.flatMap((x) => x.d.dates.length ? x.d.dates : [x.d.date]))).sort();
  const want = date || firsts.map((x) => x.d.date).sort()[0];
  const days = (await Promise.all(firsts.map((x) => x.d.date === want ? Promise.resolve(x.d) : x.d.dates.indexOf(want) >= 0 ? movieDayOne(x.s, want).catch(() => null) : Promise.resolve(null)))).filter((d) => !!d);
  const head = firsts[0].s === slug ? firsts[0].d : firsts[0].d;
  const all = firsts.map((x) => x.d);
  const first = (key) => head[key] || (all.find((d) => d[key]) || head)[key];
  const cinemas = [];
  for (const d of days) for (const c of d.cinemas) {
    const old = cinemas.find((x) => x.id === c.id);
    if (!old) {
      cinemas.push({ ...c, versions: c.versions.map((v) => ({ ...v, times: v.times.slice() })) });
      continue;
    }
    for (const v of c.versions) {
      const ov = old.versions.find((x) => x.label === v.label);
      if (ov) ov.times = Array.from(/* @__PURE__ */ new Set([...ov.times, ...v.times])).sort();
      else old.versions.push({ ...v, times: v.times.slice() });
    }
  }
  const out = { ...head, en: first("en"), rating: first("rating"), runtime: first("runtime"), image: first("image"), release: all.map((d) => d.release || "").filter(Boolean).sort()[0] || head.release, intro: first("intro"), director: first("director"), cast: first("cast"), date: want, dates, cinemas };
  return mergedDayCache[ck] = out;
}
async function movieDayOne(slug, date) {
  const path = encodeURIComponent(slug).replace(/%3A/gi, ":");
  const url = `${TW}/movies/${path}/${date ? date + "/" : ""}`;
  if (!movieDayCache[url]) {
    const d = await parse("parseTwMovieDay", await getText(url));
    await fillRuntimes([d]);
    movieDayCache[url] = d;
  }
  return movieDayCache[url];
}
async function movieCinemaVersions(c, date, title) {
  const r = await moviesOf(c, date);
  const k = normTitle(title), bk = normTitle(baseTitle(title));
  const hit = r.movies.find((m) => normTitle(m.title) === k) || r.movies.find((m) => normTitle(baseTitle(m.title)) === bk);
  return hit && hit.versions.some((v) => v.times.length) ? hit.versions : null;
}
async function fillMovieDay(day, ids) {
  const todo = day.cinemas.filter((c) => !c.full && (!ids || ids.indexOf(c.id) >= 0));
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: Math.min(6, queue.length) }, async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
        try {
          const cinema = { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address };
          const full = await movieCinemaVersions(cinema, day.date, day.title);
          const count = (vs) => vs.reduce((a, v) => a + v.times.length, 0);
          if (full && count(full) >= count(c.versions)) c.versions = full;
          c.full = true;
        } catch (_) {
        }
      }
    })
  );
  return day;
}
var movieDayFilled = (day, ids) => day.cinemas.every((c) => c.full || ids.indexOf(c.id) < 0);
var FORMATS = ["IMAX", "杜比", "4DX", "MX4D", "ScreenX", "巨幕", "LED", "頂級廳", "3D"];
var FORMAT_RE = {
  IMAX: /IMAX/i,
  杜比: /DOLBY|杜比|(?<![A-Z])DVA(?![A-Z])|ATMOS/i,
  // Dolby Cinema、秀泰的 DVA（Dolby Vision＋Atmos）、Atmos 廳
  "4DX": /4DX/i,
  MX4D: /MX4D/i,
  ScreenX: /SCREEN\s*X/i,
  巨幕: /巨幕|寬巨|TITAN|LUXE|ULTRA/i,
  // 秀泰 巨幕／寬巨／ULTRA、MUVIE TITAN、新光 LUXE
  LED: /(?<![A-Z])LED(?![A-Z])|ONYX/i,
  // LG LED Cinema 等 LED 螢幕廳
  頂級廳: /gold\s*class|mucrown|金鑽|貴賓|VIP|皇家|丹普|REMMI/i,
  "3D": /(?<![A-Z0-9])3D/i
};
function formatsOf(label) {
  return FORMATS.filter((f) => FORMAT_RE[f].test(label));
}
function filterVersions(versions, format) {
  return format ? versions.filter((v) => formatsOf(v.label).indexOf(format) >= 0) : versions;
}
function filterVersionsAny(versions, formats) {
  return formats.length ? versions.filter((v) => formatsOf(v.label).some((f) => formats.indexOf(f) >= 0)) : versions;
}
function movieRows(days, opt) {
  const rows = [];
  const order = [];
  for (const day of days.slice().sort((a, b) => a.date.localeCompare(b.date)))
    for (const c of day.cinemas) {
      if (opt.cities.length && opt.cities.indexOf(c.city) < 0) continue;
      if (opt.favIds && opt.favIds.indexOf(c.id) < 0) continue;
      const versions = filterVersionsAny(c.versions, opt.formats);
      if (!versions.length) continue;
      if (order.indexOf(c.id) < 0) order.push(c.id);
      rows.push({ day, date: day.date, cinema: { ...c, versions } });
    }
  const cityRank = (x) => CITY_ORDER.indexOf(x) + 1 || 99;
  return rows.sort((a, b) => cityRank(a.cinema.city) - cityRank(b.cinema.city) || order.indexOf(a.cinema.id) - order.indexOf(b.cinema.id) || a.date.localeCompare(b.date));
}
async function movieDays(slug, dates) {
  const got = await Promise.all(dates.map((d) => movieDay(slug, d).catch(() => null)));
  return got.filter((d) => !!d);
}
var FESTIVAL_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/festival.json";
function movieAbout(d) {
  return { text: d && d.intro || "", credits: [d && d.director ? `導演：${d.director}` : "", d && d.cast ? `演員：${d.cast}` : ""].filter(Boolean).join("\n") };
}
function festivalTrailer(film) {
  return /^https:\/\//.test(film.trailer || "") ? { url: film.trailer, label: "觀看預告" } : { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(film.title + " 預告")}`, label: "搜尋預告" };
}
var festivalsNow = [];
function festivalState(f) {
  const today = todayTPE();
  return f.end < today ? "past" : f.start > today ? "soon" : "now";
}
var festivalYearsNow = [];
var festivalSort = (list) => {
  const rank = { now: 0, soon: 1, past: 2 };
  return list.filter((f) => f && Array.isArray(f.sessions) && f.sessions.length > 0).sort((a, b) => rank[festivalState(a)] - rank[festivalState(b)] || (festivalState(a) === "soon" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)));
};
async function loadFestivals(year) {
  const thisYear = Number(todayTPE().slice(0, 4));
  const data = await loadServed("festival", FESTIVAL_URL, 24 * 14, (d) => Array.isArray(d.festivals)).catch(() => null);
  festivalsNow = festivalSort(data ? data.festivals : []);
  const years = new Set((data && Array.isArray(data.years) ? data.years : []).filter((y) => y >= 2e3 && y <= thisYear && (y !== thisYear || festivalsNow.length > 0)));
  if (festivalsNow.length) years.add(thisYear);
  festivalYearsNow = Array.from(years).sort((a, b) => b - a);
  const want = year && festivalYearsNow.indexOf(year) >= 0 ? year : festivalsNow.length ? thisYear : festivalYearsNow[0] || thisYear;
  if (want === thisYear) return festivalsNow;
  const old = await loadServed(`festival-${want}`, FESTIVAL_URL.replace(/\.json$/, `-${want}.json`), 24 * 30, (d) => Array.isArray(d.festivals)).catch(() => null);
  return festivalSort(old ? old.festivals : []);
}
var festivalYears = () => festivalYearsNow;
var festivalsAny = () => festivalsNow.length > 0 || festivalYearsNow.length > 0;
async function festivalFind(id) {
  const y = Number((id.match(/-(\d{4})$/) || [])[1]) || 0;
  return (await loadFestivals(y || void 0)).find((f) => f.id === id) || null;
}
function festivalPeriod(f) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  return `${md(f.start)}–${md(f.end)}`;
}
function festivalPick(list, tab, festId) {
  const live = list.filter((f) => festivalState(f) !== "past");
  const past = list.filter((f) => festivalState(f) === "past");
  const tabs = [
    { id: "live", label: "進行中・即將開始", count: live.length },
    { id: "past", label: "已結束", count: past.length }
  ].filter((t) => t.count > 0);
  const picked = list.find((f) => f.id === festId) || null;
  const where = (f) => festivalState(f) === "past" ? "past" : "live";
  const at = tabs.some((t) => t.id === tab) ? tab : picked ? where(picked) : live.length ? "live" : "past";
  const items = at === "past" ? past : live;
  return { tabs, tab: at, items, f: (picked && items.indexOf(picked) >= 0 ? picked : items[0]) || null };
}
var festivalChipNote = (f) => festivalState(f) === "past" ? festivalPeriod(f) : festivalStateLabel(f);
var festivalStatusLine = (f) => `${festivalStateLabel(f)}｜${f.start.slice(0, 4)}/${festivalPeriod(f)}`;
function festivalDates(f) {
  return Array.from(new Set(f.sessions.map((x) => x.date))).sort();
}
function festivalDefaultDate(f) {
  const dates = festivalDates(f);
  const today = todayTPE();
  return dates.indexOf(today) >= 0 ? today : dates.find((d) => d > today) || dates[0] || "";
}
function festivalStateLabel(f) {
  const st = festivalState(f);
  return st === "now" ? "進行中" : st === "past" ? "已結束" : `${Number(f.start.slice(5, 7))}/${Number(f.start.slice(8, 10))} 開始`;
}
function festivalPlace(x) {
  const v = /^MUVIE$/i.test(x.venue) ? "MUVIE CINEMAS" : x.venue;
  const room = /^[A-Za-z0-9 ]+$/.test(x.room) ? `${x.room} 廳` : x.room;
  return [v, room].filter(Boolean).join(" ");
}
function festivalDay(f, date) {
  const by = {};
  for (const x of f.sessions) if (x.date === date) (by[x.film] ||= []).push(x);
  const film = (id) => f.films.find((m) => m.id === id) || { id, title: "（片名未提供）", mins: 0, rating: "", url: f.site };
  return Object.keys(by).map((id) => ({ film: film(id), sessions: by[id].sort((a, b) => a.time.localeCompare(b.time)) })).sort((a, b) => a.sessions[0].time.localeCompare(b.sessions[0].time) || a.film.title.localeCompare(b.film.title));
}
function festivalFilmSessions(f, filmId) {
  return f.sessions.filter((x) => x.film === filmId).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
function festivalLines(film, sessions) {
  return [
    [film.rating, film.mins ? `${film.mins} 分` : "", `這天 ${sessions.length} 場`].filter(Boolean).join("｜"),
    sessions.map((x) => `${x.time} ${festivalPlace(x)}`).join("、")
  ];
}
function festivalSearch(list, query) {
  const k = query.trim().toLowerCase().replace(/臺/g, "台");
  if (!k) return [];
  const out = [];
  for (const f of list) for (const film of f.films) if (film.title.toLowerCase().replace(/臺/g, "台").indexOf(k) >= 0) out.push({ f, film, sessions: festivalFilmSessions(f, film.id) });
  return out;
}
function festivalSearchLines(f, film, sessions) {
  const days = Array.from(new Set(sessions.map((x) => `${Number(x.date.slice(5, 7))}/${Number(x.date.slice(8, 10))}`)));
  return [
    [film.rating, film.mins ? `${film.mins} 分` : "", `共 ${sessions.length} 場`].filter(Boolean).join("｜"),
    [f.name, days.slice(0, 4).join("、") + (days.length > 4 ? " 等" : "")].filter(Boolean).join("｜")
  ];
}
function festivalCinema(x, cinemas, f) {
  const v = x.venue.replace(/影城$/, "");
  const hit = /^MUVIE$/i.test(v) ? cinemas.find((c) => /MUVIE/i.test(c.name) && /台北|松仁/.test(c.name + c.district)) || cinemas.find((c) => /MUVIE/i.test(c.name)) : cinemas.find((c) => c.name.replace(/影城$/, "") === v) || cinemas.find((c) => v.length >= 4 && c.name.indexOf(v) >= 0);
  return hit || { id: "fest-" + x.venue, name: festivalPlace({ venue: x.venue, room: "" }) || f.name, city: "", district: "", source: "tw", url: f.site };
}
function festivalFooter(f) {
  const past = festivalState(f) === "past" ? "這個影展已經結束，場次留著給你回頭看。" : "";
  return `${past}場次來自${f.source}${festivalState(f) === "past" ? "" : `，${f.ticketing ? `購票會開啟${f.ticketing}` : "購票請到官網"}，是否售完請以售票頁為準`}。影展的片名在院線上映時可能不同。`;
}
function distanceKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function cinemaPos(c) {
  const g = GEO[c.id];
  return g ? { lat: g[0], lng: g[1] } : null;
}
function nearest(cinemas, me, limit = 20) {
  return cinemas.map((c) => {
    const p = cinemaPos(c);
    return { cinema: c, km: p ? distanceKm(me, p) : null };
  }).sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9)).slice(0, limit);
}
function kmLabel(km) {
  if (km === null || km === void 0) return "";
  return km < 1 ? `${Math.round(km * 1e3)} 公尺` : `${km < 10 ? km.toFixed(1) : Math.round(km)} 公里`;
}
var WINDOWS = [
  { id: "soon", label: "接下來 3 小時", from: -1, to: -1, todayOnly: true },
  { id: "morning", label: "中午前", from: 0, to: 12 * 60 },
  { id: "afternoon", label: "下午 12–17 點", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "晚上 17–21 點", from: 17 * 60, to: 21 * 60 },
  { id: "night", label: "深夜 21 點後", from: 21 * 60, to: 29 * 60 },
  { id: "all", label: "整天", from: 0, to: 29 * 60 }
];
function showMinute(t) {
  const [h2, m] = t.split(":").map(Number);
  return (isLate(t) ? h2 + 24 : h2) * 60 + m;
}
async function findShowtimes(scope, date, win, format = "", onProgress) {
  let plans = [{ date, from: win.from, to: win.to }];
  if (win.id === "soon") {
    const hm = nowHM();
    const now = showMinute(hm);
    if (isLate(hm) && date === todayTPE()) {
      const dayEnd = 29 * 60;
      plans = [{ date: addDays(date, -1), from: now, to: Math.min(now + 180, dayEnd) }];
      if (now + 180 > dayEnd) plans.push({ date, from: 5 * 60, to: now + 180 - 24 * 60 });
    } else {
      plans = [{ date, from: now, to: now + 180 }];
    }
  }
  const hits = [];
  const failed = /* @__PURE__ */ new Set();
  const noData = /* @__PURE__ */ new Set();
  let done = 0;
  const queue = scope.slice();
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const own = lateOnOwnDate(item.cinema.source);
      for (const plan of plans) {
        const pages = own ? [{ page: plan.date, late: false }, ...plan.to > 24 * 60 ? [{ page: addDays(plan.date, 1), late: true }] : []] : [{ page: plan.date, late: null }];
        for (const pg of pages) {
          if (own && !pg.late && plan.from >= 24 * 60) continue;
          try {
            const r = await moviesOf(item.cinema, pg.page);
            for (const m of r.movies)
              for (const v of filterVersions(m.versions, format))
                for (const t of v.times) {
                  if (pg.late !== null && isLate(t) !== pg.late) continue;
                  const min = showMinute(t);
                  if (min >= plan.from && min < plan.to)
                    hits.push({ cinema: item.cinema, movie: m, version: v, time: t, date: pg.page, km: item.km, ctx: { booking: r.booking, sourceUrl: r.sourceUrl, address: r.address } });
                }
          } catch (_) {
            let known = null;
            try {
              known = (await datesOf(item.cinema)).dates;
            } catch (_2) {
            }
            if (known && known.indexOf(pg.page) < 0) {
              if (pg.page === date) noData.add(item.cinema.name);
            } else failed.add(item.cinema.name);
          }
        }
      }
      onProgress && onProgress(++done, scope.length);
    }
  }
  await Promise.all([0, 1, 2, 3, 4, 5].map(worker));
  hits.sort((a, b) => showMinute(a.time) - showMinute(b.time) || (a.km ?? 1e9) - (b.km ?? 1e9));
  return { hits, failed: Array.from(failed), noData: Array.from(noData).filter((n) => !failed.has(n)) };
}
async function findShowtimesMulti(scope, dates, winIds, formats = []) {
  const today = todayTPE();
  const days = Array.from(new Set(dates.length ? dates : [today])).sort();
  let wins = WINDOWS.filter((w) => winIds.indexOf(w.id) >= 0);
  if (!wins.length || wins.some((w) => w.id === "all")) wins = WINDOWS.filter((w) => w.id === "all");
  const seen = /* @__PURE__ */ new Set();
  const hits = [];
  const failed = /* @__PURE__ */ new Set();
  const noData = /* @__PURE__ */ new Set();
  for (const day of days) {
    const use = wins.filter((w) => !w.todayOnly || day === today);
    for (const w of use) {
      const r = await findShowtimes(scope, day, w, "");
      for (const h2 of r.hits) {
        if (formats.length && !formatsOf(h2.version.label).some((f) => formats.indexOf(f) >= 0)) continue;
        const k = [h2.cinema.id, h2.date, h2.movie.title, h2.version.label, h2.time].join("|");
        if (seen.has(k)) continue;
        seen.add(k);
        hits.push({ ...h2, day });
      }
      r.failed.forEach((n) => failed.add(n));
      r.noData.forEach((n) => noData.add(n));
    }
  }
  hits.sort((a, b) => (a.day || "").localeCompare(b.day || "") || showMinute(a.time) - showMinute(b.time) || (a.km ?? 1e9) - (b.km ?? 1e9));
  return { hits, failed: Array.from(failed), noData: Array.from(noData).filter((n) => !failed.has(n)) };
}
function multiLabel(dates, winIds) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const ds = dates.slice().sort();
  const run = ds.every((d, i) => !i || d === addDays(ds[i - 1], 1));
  const day = ds.length === 1 ? md(ds[0]) : run ? `${md(ds[0])}–${md(ds[ds.length - 1])}` : `${ds.length} 天`;
  const wins = WINDOWS.filter((w2) => winIds.indexOf(w2.id) >= 0);
  const w = !wins.length || wins.some((x) => x.id === "all") ? "整天" : wins.length === 1 ? wins[0].label : `${wins.length} 個時段`;
  return `${day}｜${w}`;
}
function multiDetail(dates, winIds) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const wins = WINDOWS.filter((w2) => winIds.indexOf(w2.id) >= 0);
  const w = !wins.length || wins.some((x) => x.id === "all") ? "整天" : wins.map((x) => x.label).join("、");
  return `日期：${dates.slice().sort().map(md).join("、")}
時段：${w}`;
}
function groupByMovie(hits) {
  const map = {};
  for (const h2 of hits) {
    const key = normTitle(h2.movie.title) || h2.movie.title;
    const g = map[key] || (map[key] = { title: h2.movie.title, runtime: h2.movie.runtime, rating: h2.movie.rating, hits: [] });
    if (!g.runtime && h2.movie.runtime) g.runtime = h2.movie.runtime;
    if (!g.rating && h2.movie.rating) g.rating = h2.movie.rating;
    g.hits.push(h2);
  }
  return Object.values(map).sort((a, b) => b.hits.length - a.hits.length || showMinute(a.hits[0].time) - showMinute(b.hits[0].time));
}
async function linkMovies(groups) {
  const list = await loadMovies().catch(() => []);
  const linked = groups.map((g) => {
    const k = normTitle(g.title), b = normTitle(baseTitle(g.title));
    let movie = list.find((m) => normTitle(m.title) === k) || list.find((m) => normTitle(baseTitle(m.title)) === b);
    if (!movie) {
      const cut = g.title.match(/^(.*[\u4e00-\u9fff][^A-Za-z]*?)\s+([A-Za-z][\x20-\x7e’‘“”：，！？·]*)$/);
      const zh = cut ? normTitle(baseTitle(cut[1])) : "";
      if (cut && zh) {
        const en = normTitle(cut[2]);
        const rt = Number(g.runtime) || 0;
        movie = list.find((m) => {
          if (normTitle(m.title) !== zh && normTitle(baseTitle(m.title)) !== zh) return false;
          const men = normTitle(m.en || "");
          return !!men && (men === en || men.indexOf(en) >= 0 || en.indexOf(men) >= 0) || rt > 0 && m.runtime > 0 && Math.abs(rt - m.runtime) <= 3;
        });
      }
    }
    return movie ? { ...g, movie } : g;
  });
  const out = [];
  const bySlug = {};
  for (const g of linked) {
    const m = g.movie;
    if (!m) {
      out.push(g);
      continue;
    }
    const first = bySlug[m.slug];
    if (first) {
      if (first.hits && g.hits) first.hits = first.hits.concat(g.hits).sort((a, b) => (a.day || a.date).localeCompare(b.day || b.date) || showMinute(a.time) - showMinute(b.time));
      if (!first.runtime && g.runtime) first.runtime = g.runtime;
      if (!first.rating && g.rating) first.rating = g.rating;
      continue;
    }
    const one = { ...g, title: m.title, ...m.runtime ? { runtime: m.runtime } : {}, ...m.rating ? { rating: m.rating } : {} };
    bySlug[m.slug] = one;
    out.push(one);
  }
  if (out.every((g) => g.hits)) out.sort((a, b) => b.hits.length - a.hits.length || showMinute(a.hits[0].time) - showMinute(b.hits[0].time));
  return out;
}
function nowFilter(groups, query) {
  const k = query.trim().toLowerCase().replace(/臺/g, "台");
  if (!k) return groups;
  const has = (s) => String(s || "").toLowerCase().replace(/臺/g, "台").indexOf(k) >= 0;
  const out = [];
  for (const g of groups) {
    if (has(g.title) || has(g.movie?.en || "")) {
      out.push(g);
      continue;
    }
    const hits = g.hits.filter((h2) => has(h2.cinema.name) || has(h2.version.label) || has(h2.cinema.city || ""));
    if (hits.length) out.push({ ...g, hits });
  }
  return out;
}
var nowGroupLine = (g) => [`${g.hits.length} 場`, g.runtime ? `${g.runtime} 分鐘` : "", g.rating || ""].filter(Boolean).join("｜");
var errText = (e) => {
  const m = String(e?.message || e || "");
  if (/JSON|Unexpected|Unrecognized|token|SyntaxError|<|\{/i.test(m)) return "回傳的內容不是預期格式";
  if (/time|network|offline|connect|cancel|host|SSL|TLS|socket/i.test(m)) return "連線失敗";
  return m.replace(/[{}"\[\]]/g, "").trim().slice(0, 40) || "讀取失敗";
};
var IMDB_GQL = "https://api.graphql.imdb.com/";
async function identify(title, en, errs, yearHint = 0) {
  const token = ((await loadSettings()).tmdbToken || "").trim();
  const okYear = (y) => !yearHint || !y || Math.abs(y - yearHint) <= 1;
  const viaImdb = (async () => {
    for (const q of [en, ...searchTitles(title)].filter(Boolean)) {
      const key = q.toLowerCase().replace(/[\\/?#%]/g, " ").trim();
      try {
        const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(key)}.json`, { "User-Agent": UA });
        const d = JSON.parse(r.body).d || [];
        const sameName = (x) => !!en && q === en && normEn(String(x.l || "")) === normEn(en);
        const hit = d.find((x) => /^tt/.test(x.id) && (x.qid === "movie" || x.qid === "tvMovie" || x.qid === "video") && (okYear(Number(x.y) || 0) || sameName(x)));
        if (hit) return { id: hit.id, name: String(hit.l || en || ""), year: Number(hit.y) || 0 };
      } catch (e) {
        errs.push("IMDb 搜尋暫時讀不到");
      }
    }
    return null;
  })();
  if (!token) return viaImdb;
  const viaTmdb = (async () => {
    try {
      const hit = await tmdbFind(title, token);
      if (hit) {
        const [ids, d] = await Promise.all([tmdb(`/movie/${hit.id}/external_ids`, token), tmdb(`/movie/${hit.id}?language=en-US`, token)]);
        const year = Number(String(d?.release_date || "").slice(0, 4)) || 0;
        if (ids?.imdb_id && okYear(year)) return { id: String(ids.imdb_id), name: d?.title || d?.original_title || en || "", year };
      }
    } catch (e) {
      errs.push("TMDB 暫時讀不到");
    }
    return null;
  })();
  const first = await Promise.race([viaTmdb, delay(2500).then(() => "slow")]);
  if (first && first !== "slow") return first;
  return await viaImdb || await viaTmdb;
}
var rtSlug = (name) => name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
async function rtPage(url) {
  const r = await get(url);
  if (!r.ok) return null;
  const page = r.body;
  const j = (page.match(/<script[^>]*id="media-scorecard-json"[^>]*>([\s\S]*?)<\/script>/) || [])[1];
  if (!j) return null;
  const d = JSON.parse(j);
  const pct = (x) => x && /\d/.test(String(x.scorePercent || "")) ? Number(String(x.scorePercent).replace(/\D/g, "")) : -1;
  const ld = (page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  let name = "", year = 0;
  try {
    const o = ld ? JSON.parse(ld) : {};
    const m = String(o.name || "").match(/^(.*?)\s*\((\d{4})\)\s*$/);
    name = m ? m[1] : String(o.name || "");
    year = m ? Number(m[2]) : Number(String(o.dateCreated || "").slice(0, 4)) || 0;
  } catch (_) {
  }
  return { critics: pct(d.criticsScore), certified: !!d.criticsScore?.certified, audience: pct(d.audienceScore), hot: !!d.audienceScore?.certified, avg: Number(d.audienceScore?.averageRating) || 0, count: String(d.audienceScore?.bandedRatingCount || "").slice(0, 60), name, year };
}
var normEn = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
async function rtFind(name, year) {
  const okYear = (y) => !year || !y || Math.abs(y - year) <= 1;
  const okName = (n) => !n || normEn(n) === normEn(name) || normEn(n).startsWith(normEn(name));
  const slug = rtSlug(name);
  if (slug) {
    const urls = [`https://www.rottentomatoes.com/m/${slug}`, ...year ? [`https://www.rottentomatoes.com/m/${slug}_${year}`] : []];
    const pages = await Promise.all(urls.map((u) => rtPage(u).catch(() => null)));
    for (const i of pages.length > 1 ? [1, 0] : [0]) {
      const s2 = pages[i];
      if (s2 && okYear(s2.year) && okName(s2.name)) return { url: urls[i], s: s2 };
    }
  }
  const html = await getText(`https://www.rottentomatoes.com/search?search=${encodeURIComponent(name)}`);
  const list = [];
  for (const m of html.matchAll(/<search-page-media-row([\s\S]*?)<\/search-page-media-row>/g)) {
    const b = m[1];
    const url = (b.match(/href="(https:\/\/www\.rottentomatoes\.com\/m\/[^"]+)"[^>]*slot="title"/) || b.match(/href="(https:\/\/www\.rottentomatoes\.com\/m\/[^"]+)"/) || [])[1];
    if (!url) continue;
    const t = (b.match(/slot="title"[^>]*>\s*([^<]+?)\s*</) || [])[1] || "";
    list.push({ year: Number((b.match(/release-year="(\d*)"/) || [])[1] || 0), url, title: t.replace(/&amp;/g, "&").replace(/&#39;/g, "'") });
  }
  const pick = list.find((x) => normEn(x.title) === normEn(name) && okYear(x.year)) || list.find((x) => year && Math.abs(x.year - year) <= 1 && normEn(x.title).includes(normEn(name)));
  if (!pick) return null;
  const s = await rtPage(pick.url);
  return s ? { url: pick.url, s } : null;
}
async function findRatings(title, en, slug, known) {
  const out = {};
  const errs = [];
  const who = known || await identify(title, en, errs, await atYearHint(title, slug, en));
  if (!who) {
    out.err = errs.join("；") || "IMDb 上找不到這部片";
    return out;
  }
  const imdbJob = (async () => {
    const url = `https://www.imdb.com/title/${who.id}/`;
    try {
      const r2 = await platform().fetchText(`https://p.media-imdb.com/static-content/documents/v1/title/${who.id}/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json`, { "User-Agent": UA });
      const j = JSON.parse(r2.body.replace(/^[^{]*/, "").replace(/\)\s*$/, ""));
      if (j?.resource) {
        const score2 = Number(j.resource.rating) || 0;
        if (score2) out.imdb = { score: score2, votes: Number(j.resource.ratingCount) || 0, url };
        return;
      }
    } catch (_) {
    }
    const q = `{ title(id:"${who.id}"){ ratingsSummary{aggregateRating voteCount} } }`;
    const r = await platform().fetchText(`${IMDB_GQL}?query=${encodeURIComponent(q)}`, {
      "User-Agent": UA,
      "content-type": "application/json",
      "x-imdb-client-name": "imdb-web-next-localized",
      Referer: "https://www.imdb.com/"
    });
    if (r.status < 200 || r.status >= 300) throw new Error("status " + r.status);
    const t = JSON.parse(r.body)?.data?.title;
    const score = Number(t?.ratingsSummary?.aggregateRating) || 0;
    if (score) out.imdb = { score, votes: Number(t.ratingsSummary.voteCount) || 0, url };
  })().catch(() => errs.push("IMDb 評分暫時讀不到"));
  const rtJob = (async () => {
    if (!who.name) return;
    const f = await rtFind(who.name, who.year);
    if (!f) return;
    if (f.s.critics >= 0) out.tomato = { score: f.s.critics, certified: f.s.certified, url: f.url };
    if (f.s.audience >= 0) out.popcorn = { score: f.s.audience, url: f.url, ...f.s.hot ? { certified: true } : {}, ...f.s.avg ? { avg: f.s.avg } : {}, ...f.s.count ? { count: f.s.count } : {} };
  })().catch(() => errs.push("爛番茄暫時讀不到"));
  await Promise.all([imdbJob, rtJob]);
  if (errs.length) out.err = errs.join("；");
  return out;
}
var ratingsMem = {};
function yearRatingByTitle(yr, normed) {
  let best = null, bestN = -1, bestYear = "";
  for (const key of Object.keys(yr.ratings)) {
    if (!key.startsWith(normed + "|") || key.length !== normed.length + 5) continue;
    const r = yr.ratings[key], y = key.slice(-4);
    const n = (r.i ? 1 : 0) + (r.t !== void 0 ? 1 : 0) + (r.p !== void 0 ? 1 : 0);
    if (n > bestN || n === bestN && y > bestYear) {
      best = r;
      bestN = n;
      bestYear = y;
    }
  }
  return best;
}
function ratingsFromYear(r) {
  const out = {};
  const rt = r.u ? `https://www.rottentomatoes.com/m/${r.u}` : "";
  if (r.i && r.id) out.imdb = { score: r.i, votes: r.v || 0, url: `https://www.imdb.com/title/${r.id}/` };
  if (r.t !== void 0 && rt) out.tomato = { score: r.t, certified: !!r.c, url: rt };
  if (r.p !== void 0 && rt) out.popcorn = { score: r.p, url: rt, ...r.h ? { certified: true } : {} };
  return out;
}
function movieRatings(title, en, slug) {
  const k = normTitle(title);
  return ratingsMem[k] ||= (async () => {
    const read = () => {
      try {
        return JSON.parse(cacheGet("ratings.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()[k];
    const has = (x) => !!(x.imdb || x.tomato || x.popcorn);
    const me = await metaOf(title);
    if (hit && hit.v === RATINGS_V && Date.now() - hit.at < (has(hit) ? 7 : 1) * 864e5 && !(me && me.r && me.ra && me.ra > hit.at)) return hit;
    if (me && me.r && me.ra) return me.r;
    if (!me) {
      const yr = yearRatingsLatest || await Promise.race([loadYearRatings().catch(() => null), delay(1500).then(() => null)]);
      const rec = yr ? yearRatingByTitle(yr, k) : null;
      if (rec) return ratingsFromYear(rec);
    }
    const r = await findRatings(title, en, slug);
    if (!r.err || has(r)) {
      const all = read();
      for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 864e5) delete all[key];
      const { err: _e, ...keep } = r;
      all[k] = { ...keep, at: Date.now(), v: RATINGS_V };
      cacheSet("ratings.json", JSON.stringify(all));
    }
    return r;
  })();
}
var RATINGS_V = 3;
function tomatoTier(score, certified) {
  return score < 60 ? "bad" : certified ? "good" : "mid";
}
var popcornTier = (score, certified) => score < 60 ? "bad" : certified ? "good" : "mid";
var popcornLabel = (score, certified) => score < 60 ? "冷掉" : certified ? "認證熱門" : "熱門";
var popcornCount = (s) => String(s || "").replace(/\s*(Verified\s+)?Ratings?/i, " 人評").replace(/Fewer than\s*/i, "不到 ").trim();
var tomatoLabel = (score, certified) => score < 60 ? "腐爛" : certified ? "認證新鮮" : "新鮮";
function ratingTier(kind, v) {
  const x = kind === "imdb" ? v * 10 : v;
  return x >= 75 ? "good" : x >= 60 ? "mid" : "bad";
}
var SITE_URL = "https://app.twmovietime.workers.dev";
var ABOUT_URL = SITE_URL + "/about/";
var PRIVACY_URL = SITE_URL + "/privacy/";
var COMMUNITY_API = "https://movie-ratings.twmovietime.workers.dev";
var REVIEW_TAGS = [
  { group: "推薦程度", single: true, tags: [{ id: "stream", label: "等串流就好" }, { id: "cinema", label: "值得進戲院" }, { id: "again", label: "想二刷" }] },
  { group: "亮點", tags: [{ id: "story", label: "劇情" }, { id: "cast", label: "演員" }, { id: "visual", label: "畫面" }, { id: "music", label: "配樂" }, { id: "pace", label: "節奏" }, { id: "ending", label: "結局有力" }] },
  { group: "氛圍", tags: [{ id: "funny", label: "好笑" }, { id: "tears", label: "催淚" }, { id: "brainy", label: "燒腦" }, { id: "tense", label: "緊張" }, { id: "healing", label: "療癒" }, { id: "heavy", label: "沉重" }] },
  { group: "觀影提醒", tags: [{ id: "credits", label: "有片尾彩蛋" }, { id: "prequel", label: "建議先看前作" }, { id: "bigscreen", label: "適合大銀幕" }, { id: "nokids", label: "不適合小孩" }, { id: "long", label: "片長有感" }] }
];
var REVIEW_TAGS_MAX = 5;
var TAG_LABEL = {};
for (const g of REVIEW_TAGS) for (const t of g.tags) TAG_LABEL[t.id] = t.label;
var reviewTagLabel = (id) => TAG_LABEL[id] || "";
function reviewTagsToggle(mine, id) {
  if (mine.indexOf(id) >= 0) return mine.filter((x) => x !== id);
  const g = REVIEW_TAGS.find((x) => x.tags.some((t) => t.id === id));
  const rest = g && g.single ? mine.filter((x) => !g.tags.some((t) => t.id === x)) : mine;
  return rest.length >= REVIEW_TAGS_MAX ? null : [...rest, id];
}
function topReviewTags(c, max = 4) {
  if (!c || c.n < COMMUNITY_MIN || !c.tags) return [];
  return Object.keys(c.tags).map((id) => ({ id, label: reviewTagLabel(id), n: Number(c.tags[id]) || 0, pct: Math.round((Number(c.tags[id]) || 0) / c.n * 100) })).filter((t) => t.label && t.n >= 2).sort((a, b) => b.n - a.n || a.id.localeCompare(b.id)).slice(0, max);
}
function deviceId() {
  const ok = (x) => !!x && /^[A-Za-z0-9_-]{16,64}$/.test(x);
  const saved = cacheGet("device-id.txt");
  if (ok(saved)) return saved;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)];
  cacheSet("device-id.txt", id);
  return id;
}
var communityKey = (title) => normTitle(baseTitle(title)).slice(0, 120);
var siteBase = "";
function setSiteBase(origin) {
  siteBase = /^https?:\/\//.test(origin) ? origin : "";
}
var siteApi = () => siteBase || SITE_URL;
var accountToken = null;
function setAccount(fn) {
  accountToken = fn;
}
var signedIn = () => !!(accountToken && accountToken());
async function socialCall(op, body = {}) {
  const token = accountToken ? accountToken() : "";
  const r = await platform().fetchText(`${siteApi()}/api/social/${op}`, { accept: "application/json", "content-type": "application/json" }, { method: "POST", body: JSON.stringify(token ? { token, ...body } : { d: deviceId(), ...body }) });
  let data = null;
  try {
    data = JSON.parse(r.body);
  } catch (_) {
  }
  return { status: r.status, data };
}
var SOCIAL_ERR = {
  "not signed in": "登入已經失效，請重新登入",
  "too many": "操作太頻繁，請稍後再試",
  "bad handle": "社群帳號只要填帳號名稱（英文、數字、底線、句點）",
  "bad name": "暱稱要 2～16 個字，只能用中英文、數字和底線",
  "name taken": "這個暱稱有人用了，換一個",
  "rename later": "暱稱 14 天內只能改一次",
  "private": "對方沒有公開個人頁",
  "not found": "找不到這個帳號",
  "too many follows": "追蹤的人數到上限了",
  "bad date": "日期不對（不能是未來的日期）",
  "bad emoji": "頭像只能放一個表情符號",
  "bad bio": "自我介紹最多 80 個字，不能放連結或聯絡方式"
};
async function social(op, body = {}) {
  const r = await socialCall(op, body);
  if (r.status !== 200 || !r.data) throw new Error(SOCIAL_ERR[r.data && r.data.error || ""] || "暫時連不上，請稍後再試");
  return r.data;
}
var profileSkipped = () => cacheGet("profile-skip.txt") === "1";
var setProfileSkipped = (on) => cacheSet("profile-skip.txt", on ? "1" : "");
var WATCH_HOW = [{ id: "cinema", label: "電影院" }, { id: "second", label: "二輪電影院" }, { id: "stream", label: "串流" }];
var howLabel = (how) => WATCH_HOW.filter((h2) => (how || []).indexOf(h2.id) >= 0).map((h2) => h2.label).join("、");
function agoLabel(at) {
  const m = Math.floor((Date.now() - at) / 6e4);
  if (m < 1) return "剛剛";
  if (m < 60) return `${m} 分鐘`;
  if (m < 60 * 24) return `${Math.floor(m / 60)} 小時`;
  if (m < 60 * 24 * 30) return `${Math.floor(m / 1440)} 天`;
  return noteDate(at);
}
var PROFILE_COLORS = [
  { id: "blue", hex: "#0a84ff" },
  { id: "green", hex: "#30b158" },
  { id: "orange", hex: "#ff9f0a" },
  { id: "red", hex: "#ff453a" },
  { id: "purple", hex: "#bf5af2" },
  { id: "pink", hex: "#ff375f" },
  { id: "teal", hex: "#40c8e0" },
  { id: "gray", hex: "#8e8e93" }
];
var profileColor = (id) => /^#[0-9a-f]{6}$/i.test(String(id || "")) ? String(id) : (PROFILE_COLORS.find((c) => c.id === id) || PROFILE_COLORS[0]).hex;
function profileInk(id) {
  const h2 = profileColor(id);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h2.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1e3 > 170 ? "#1c1c1e" : "#fff";
}
var PROFILE_EMOJI = ["🎬", "🍿", "🎞️", "🎥", "⭐", "🌙", "👻", "🐱", "🐶", "🦊", "🐼", "🐧", "😎", "🤓", "🥹", "🫠"];
var seenLabel = (seen) => !seen ? "" : seen === "?" ? "看過" : `${seen.replace(/-/g, "/")} 看過`;
async function adoptRatings() {
  const all = readMyVotes();
  const keys = Object.keys(all).filter((k) => all[k] && all[k].s > 0).map((k) => ({ k, title: all[k].title || k }));
  let n = 0;
  for (let i = 0; i < keys.length; i += 20) {
    const r = await socialCall("adopt", { d: deviceId(), keys: keys.slice(i, i + 20) });
    if (r.status !== 200) break;
    n += r.data && r.data.adopted || 0;
  }
  return n;
}
function forgetMyVotes() {
  cacheSet("my-votes10b.json", "{}");
  for (const k of Object.keys(communityMem)) delete communityMem[k];
  for (const k of Object.keys(notesMem)) delete notesMem[k];
}
var communityMem = {};
function communityCached(title) {
  return communityMem[communityKey(title)] || null;
}
var COMMUNITY_SUMMARY_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/community10.json";
var summaryMem = null;
var summaryAt = 0;
var summaryNotes = {};
var summaryTags = {};
function loadSummary() {
  if (summaryMem && Date.now() - summaryMem.at < 3e5) return summaryMem.job;
  const job = (async () => {
    try {
      const r = await platform().fetchText(COMMUNITY_SUMMARY_URL + "?t=" + Math.floor(Date.now() / 3e5), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body);
      const m = data?.movies;
      if (m && typeof m === "object") summaryAt = Number(data.at) || 0;
      if (m && typeof m === "object" && data.tags && typeof data.tags === "object") summaryTags = data.tags;
      if (m && typeof m === "object" && data.notes && typeof data.notes === "object") summaryNotes = data.notes;
      return m && typeof m === "object" ? m : null;
    } catch (_) {
      return null;
    }
  })();
  summaryMem = { at: Date.now(), job };
  return job;
}
var loadCommunitySummary = () => loadSummary();
var readMyVotes = () => {
  try {
    return JSON.parse(cacheGet("my-votes10b.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};
function saveMyVote(k, c, fresh, title = "") {
  const all = readMyVotes();
  const keepTitle = title || all[k] && all[k].title || "";
  for (const [key, v] of Object.entries(all)) if (!v.s && Date.now() - v.at > 60 * 864e5) delete all[key];
  const t = c.myTags && c.myTags.length ? c.myTags : void 0;
  all[k] = fresh ? { s: c.mine, at: Date.now(), dist: c.dist, dat: Date.now(), t, tags: c.tags, nn: c.notes, nat: Date.now() } : { s: c.mine, at: Date.now(), t };
  if (keepTitle) all[k].title = keepTitle;
  cacheSet("my-votes10b.json", JSON.stringify(all));
}
var fromDist = (dist, mine) => {
  const d = Array.from({ length: 10 }, (_, i) => Number(dist[i]) || 0);
  const n = d.reduce((a, b) => a + b, 0);
  const sum = d.reduce((a, c, i) => a + c * (i + 1), 0);
  return { n, avg: n ? Math.round(sum / n * 10) / 10 : 0, dist: d, mine };
};
async function communityStats(title) {
  const k = communityKey(title);
  const hit = communityMem[k];
  if (hit && Date.now() - hit.at < 5e3) return { n: hit.n, avg: hit.avg, dist: hit.dist, mine: hit.mine, tags: hit.tags, myTags: hit.myTags, notes: hit.notes };
  const mine = readMyVotes()[k];
  if (mine && Date.now() - mine.at < 30 * 864e5) {
    const summary = await loadSummary();
    if (summary) {
      const newer = (t) => !!t && (summaryAt ? t > summaryAt : Date.now() - t < 45 * 6e4);
      const recent = !!(mine.dist && newer(mine.dat));
      const c2 = { ...fromDist(recent ? mine.dist : summary[k] || [], mine.s), tags: recent && mine.tags || summaryTags[k] || {}, myTags: mine.t || [], notes: typeof mine.nn === "number" && newer(mine.nat) ? mine.nn : summaryNotes[k] || 0 };
      communityMem[k] = { ...c2, at: Date.now() };
      return c2;
    }
  }
  const r = signedIn() ? await socialCall("stats", { m: k }).then((x) => ({ status: x.status, body: JSON.stringify(x.data) })) : await platform().fetchText(`${COMMUNITY_API}/v2/stats?m=${encodeURIComponent(k)}&d=${encodeURIComponent(deviceId())}`, { accept: "application/json" });
  if (r.status !== 200) throw new Error("片刻評分暫時讀不到");
  const c = JSON.parse(r.body);
  communityMem[k] = { ...c, at: Date.now() };
  saveMyVote(k, c, false);
  return c;
}
async function communityVote(title, score) {
  const k = communityKey(title);
  const r = signedIn() ? await socialCall("vote", { m: k, title: baseTitle(title), s: score }).then((x) => ({ status: x.status, body: JSON.stringify(x.data) })) : await platform().fetchText(
    `${COMMUNITY_API}/v2/vote`,
    { accept: "application/json", "content-type": "application/json" },
    { method: "POST", body: JSON.stringify({ m: k, d: deviceId(), s: score }) }
  );
  if (r.status === 429) throw new Error("投票太頻繁，請稍後再試");
  if (r.status !== 200) throw new Error("評分沒有送出，請稍後再試");
  const c = JSON.parse(r.body);
  communityMem[k] = { ...c, at: Date.now() };
  if (!score) delete notesMem[k];
  saveMyVote(k, c, true, baseTitle(title));
  return c;
}
async function communityTags(title, tags) {
  const k = communityKey(title);
  const r = signedIn() ? await socialCall("tags", { m: k, t: tags.slice(0, REVIEW_TAGS_MAX) }).then((x) => ({ status: x.status, body: JSON.stringify(x.data) })) : await platform().fetchText(
    `${COMMUNITY_API}/v2/tags`,
    { accept: "application/json", "content-type": "application/json" },
    { method: "POST", body: JSON.stringify({ m: k, d: deviceId(), t: tags.slice(0, REVIEW_TAGS_MAX) }) }
  );
  if (r.status === 429) throw new Error("操作太頻繁，請稍後再試");
  if (r.status === 409) throw new Error("要先評分才能選心得標籤");
  if (r.status !== 200) throw new Error("心得標籤沒有送出，請稍後再試");
  const c = JSON.parse(r.body);
  communityMem[k] = { ...c, at: Date.now() };
  saveMyVote(k, c, true);
  return c;
}
var noteMax = () => signedIn() ? 140 : NOTE_MAX;
var notesViaSite = false;
function setNotesViaSite(on) {
  notesViaSite = on;
}
var NOTE_FOLD_AT = -5;
var noteHot = (n) => {
  const p = n.p || 0;
  return Math.sign(p) * Math.log10(Math.max(Math.abs(p), 1)) + n.at / 1e3 / 45e3;
};
var NOTE_MAX = 60;
var NOTE_PLACEHOLDER = "不提劇情，說說看完的感覺";
var NOTE_RULES = "請不要劇透、人身攻擊或貼廣告、連結。被多人檢舉的短評會自動摺疊或隱藏。";
var REPORT_REASONS = [
  { id: "spoiler", label: "有劇透", note: "講到結局、反轉、誰死了這類看了會破哏的內容" },
  { id: "abuse", label: "不當內容", note: "人身攻擊、歧視、色情或其他讓人不舒服的內容" },
  { id: "spam", label: "廣告或無關內容", note: "廣告、洗版，或跟這部片無關" }
];
var SPOILER_RE = /結局|兇手|凶手|真相|死了|死掉|沒死|復活|反轉|爆雷|劇透|幕後黑手|最後.{0,8}(死|活|在一起|分手|贏|輸|是|變成|發現)|原來.{0,8}(是|就是)|其實.{0,8}(是|就是)|彩蛋.{0,6}(是|出現|登場)/;
var noteLooksSpoiler = (text) => SPOILER_RE.test(String(text || ""));
function noteDate(at) {
  const day = (t) => new Date(t + 8 * 36e5).toISOString().slice(0, 10);
  const d = day(at), today = todayTPE();
  const diff = Math.round((Date.parse(today) - Date.parse(d)) / 864e5);
  if (diff <= 0) return "今天";
  if (diff === 1) return "昨天";
  if (diff < 7) return `${diff} 天前`;
  return d.slice(0, 4) === today.slice(0, 4) ? `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` : d.replace(/-/g, "/");
}
var notesMem = {};
function keepNotes(k, data) {
  notesMem[k] = { at: Date.now(), data };
  const n = data.notes.filter((x) => !x.hidden && !x.del).length;
  if (communityMem[k]) communityMem[k] = { ...communityMem[k], notes: n };
  const all = readMyVotes();
  if (all[k]) {
    all[k].nn = n;
    all[k].nat = Date.now();
    cacheSet("my-votes10b.json", JSON.stringify(all));
  }
  return data;
}
var notesCached = (title) => notesMem[communityKey(title)]?.data || null;
async function loadNotes(title) {
  const k = communityKey(title);
  const hit = notesMem[k];
  if (hit && Date.now() - hit.at < 6e4) return hit.data;
  const r = notesViaSite || signedIn() ? await socialCall("notes", { m: k }).then((x) => ({ status: x.status, body: JSON.stringify(x.data) })) : await platform().fetchText(`${COMMUNITY_API}/v2/notes?m=${encodeURIComponent(k)}&d=${encodeURIComponent(deviceId())}`, { accept: "application/json" });
  if (r.status !== 200) throw new Error("短評暫時讀不到");
  return keepNotes(k, JSON.parse(r.body));
}
async function notePost(path, title, body, fail) {
  const k = communityKey(title);
  const viaSite = signedIn() || notesViaSite && (path === "report" || path === "note-vote" || path === "note-reply");
  const r = viaSite ? await socialCall(path, { m: k, title: baseTitle(title), ...body }).then((x) => ({ status: x.status, body: JSON.stringify(x.data) })) : await platform().fetchText(`${COMMUNITY_API}/v2/${path}`, { accept: "application/json", "content-type": "application/json" }, { method: "POST", body: JSON.stringify({ m: k, d: deviceId(), ...body }) });
  if (r.status === 429) throw new Error("操作太頻繁，請稍後再試");
  if (r.status === 409) throw new Error("要先評分才能寫短評");
  if (r.status === 422) throw new Error(/too long/.test(r.body) ? `短評最多 ${noteMax()} 個字` : /too many notes/.test(r.body) ? "同一部片最多發 5 則短評，先刪掉一則再發" : /too many replies/.test(r.body) ? "這部片你回覆得太多了，先刪掉幾則再回" : /parent gone/.test(r.body) ? "你要回覆的那一則已經不在了" : /duplicate/.test(r.body) ? "這句你已經發過了" : "短評不能放連結或聯絡方式");
  if (r.status !== 200) throw new Error(fail);
  return keepNotes(k, JSON.parse(r.body));
}
var addNote = (title, text, spoiler, replyTo = 0) => notePost(replyTo && (notesViaSite || signedIn()) ? "note-reply" : "note-add", title, { x: String(text || "").trim(), sp: spoiler ? 1 : 0, ...replyTo ? { r: replyTo } : {} }, "沒有送出，請稍後再試");
var deleteNote = (title, id) => notePost("note-del", title, { id }, "沒有刪掉，請稍後再試");
var voteNote = (title, id, v) => notePost("note-vote", title, { id, v }, "沒有送出，請稍後再試");
var reportNote = (title, id, why) => notePost("report", title, { id, why }, "檢舉沒有送出，請稍後再試");
var FEEDBACK_CATS = [
  { id: "bug", label: "問題回報", hint: "哪一頁、做了什麼、看到什麼（例如：某間影城的場次打不開）" },
  { id: "data", label: "資料有誤", hint: "哪部片或哪間影城、哪裡不對（例如：場次時間、片名、片長、評分）" },
  { id: "idea", label: "功能建議", hint: "希望多什麼功能，或哪裡可以更好用" },
  { id: "other", label: "其他", hint: "想說的都可以寫" }
];
var FEEDBACK_STATUS = { new: "已收到", doing: "處理中", done: "已處理", wont: "暫不處理" };
var FEEDBACK_MAX = 500;
var feedbackCat = (id) => FEEDBACK_CATS.find((c) => c.id === id)?.label || "其他";
var feedbackMem = null;
async function feedbackPost(path, body) {
  const r = await platform().fetchText(`${siteApi()}/api/feedback/${path}`, { accept: "application/json", "content-type": "application/json" }, { method: "POST", body: JSON.stringify({ d: deviceId(), ...body }) });
  if (r.status === 429) throw new Error("今天送出的回饋已經到上限，明天再試");
  if (r.status !== 200) throw new Error(path === "send" ? "回饋沒有送出，請稍後再試" : "回饋暫時讀不到");
  const list = JSON.parse(r.body).list || [];
  feedbackMem = { at: Date.now(), list };
  if (list.length) cacheSet("feedback-mine.txt", "1");
  return list;
}
var sendFeedback = (cat, text, plat, ver) => feedbackPost("send", { cat, text, plat, ver });
async function loadMyFeedback(force = false) {
  if (!force && feedbackMem && Date.now() - feedbackMem.at < 6e5) return feedbackMem.list;
  return feedbackPost("mine", {});
}
var feedbackSent = () => cacheGet("feedback-mine.txt") === "1";
function feedbackUnread(list) {
  const seen = Number(cacheGet("feedback-seen.txt")) || 0;
  return list.filter((f) => f.reply && f.rat > seen).length;
}
var feedbackMarkSeen = () => cacheSet("feedback-seen.txt", String(Date.now()));
var BOXOFFICE_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice.json";
var boxMem = null;
var boxData = null;
function loadBoxOffice() {
  return boxMem ||= (async () => {
    try {
      const c = JSON.parse(cacheGet("boxoffice5.json") || "null");
      if (c && c.data && Date.now() - c.at < 6 * 36e5) return c.data;
    } catch (_) {
    }
    const r = await platform().fetchText(BOXOFFICE_URL + "?t=" + Math.floor(Date.now() / 36e5), { accept: "application/json" });
    if (r.status !== 200) throw new Error("票房排行暫時讀不到");
    const data = JSON.parse(r.body);
    if (!data || !Array.isArray(data.list)) throw new Error("票房排行格式不對");
    cacheSet("boxoffice5.json", JSON.stringify({ at: Date.now(), data }));
    return data;
  })().then((d) => boxData = d).catch((e) => {
    boxMem = null;
    throw e;
  });
}
var BOXOFFICE_YEARS_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice-years.json";
var boxYearsMem = null;
function loadBoxOfficeFull() {
  return boxYearsMem ||= (async () => {
    const b = await loadBoxOffice();
    let years = null;
    let countries = [];
    let issuers = [];
    try {
      const c = JSON.parse(cacheGet("boxoffice-years3.json") || "null");
      if (c && c.years && c.end === b.end && Date.now() - c.at < 6 * 36e5) {
        years = c.years;
        countries = c.countries || [];
        issuers = c.issuers || [];
      }
    } catch (_) {
    }
    if (!years) {
      const r = await platform().fetchText(BOXOFFICE_YEARS_URL + "?t=" + Math.floor(Date.now() / 36e5), { accept: "application/json" });
      if (r.status !== 200) throw new Error("年度排行暫時讀不到");
      const d = JSON.parse(r.body);
      if (!d || typeof d.years !== "object") throw new Error("年度排行格式不對");
      years = d.years;
      countries = Array.isArray(d.countries) ? d.countries : [];
      issuers = Array.isArray(d.issuers) ? d.issuers : [];
      try {
        cacheSet("boxoffice-years3.json", JSON.stringify({ at: Date.now(), end: d.end, years, countries, issuers }));
      } catch (_) {
      }
    }
    const full = {};
    for (const y of Object.keys(years)) full[y] = years[y].map((x) => {
      const r = x;
      return { ...x, week: null, country: x.country || countries[r.c ?? -1] || "", issue: x.issue || issuers[r.d ?? -1] || "", tickets: x.tickets || r.k || 0 };
    });
    return boxFullLatest = { ...b, years: { ...b.years || {}, ...full } };
  })().catch(async (e) => {
    boxYearsMem = null;
    return loadBoxOffice();
  });
}
var BOXOFFICE_WEEKS_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/boxoffice-weeks.json";
var boxWeeksMem = null;
function loadBoxOfficeWeeks() {
  return boxWeeksMem ||= (async () => {
    const b = await loadBoxOffice();
    let weeks = null;
    try {
      const c = JSON.parse(cacheGet("boxoffice-weeks.json") || "null");
      if (c && c.weeks && c.end === b.end && Date.now() - c.at < 6 * 36e5) weeks = c.weeks;
    } catch (_) {
    }
    if (!weeks) {
      const r = await platform().fetchText(BOXOFFICE_WEEKS_URL + "?t=" + Math.floor(Date.now() / 36e5), { accept: "application/json" });
      if (r.status !== 200) throw new Error("過去的週票房暫時讀不到");
      const d = JSON.parse(r.body);
      if (!d || !Array.isArray(d.weeks)) throw new Error("過去的週票房格式不對");
      weeks = d.weeks;
      cacheSet("boxoffice-weeks.json", JSON.stringify({ at: Date.now(), end: b.end, weeks }));
    }
    const weekLists = {};
    for (const w of weeks) weekLists[w.end] = w.list.map((x) => ({ ...x, country: x.country || "" }));
    return { ...b, weekLists };
  })().catch(async () => {
    boxWeeksMem = null;
    return loadBoxOffice();
  });
}
function boxWeekOptions(b) {
  if (b.mode !== "week") return [];
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const all = (b.weeks && b.weeks.length ? b.weeks : [{ start: b.start, end: b.end }]).slice().sort((x, y) => y.end.localeCompare(x.end));
  return all.map((w) => {
    const ago = Math.round((Date.parse(b.end) - Date.parse(w.end)) / (7 * 864e5));
    return { id: w.end, label: `${md(w.start)}–${md(w.end)}`, note: ago <= 0 ? "最新" : ago === 1 ? "上週" : `${ago} 週前` };
  });
}
function boxWeekPicked(b, week) {
  const opts = boxWeekOptions(b);
  const id = week && opts.some((o) => o.id === week) ? week : b.end;
  return { id, past: id !== b.end };
}
function money(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(2).replace(/\.?0+$/, "") + " 億";
  if (n >= 1e4) return String(Math.round(n / 1e4)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " 萬";
  return String(Math.round(n)) + " 元";
}
function boxOfficeNote(b) {
  return b.list.some((x) => x.since) ? "標「上映至今」的是官方這週才第一次列入的新片：沒有上週的數字可以相減，排名用的是上映以來的累計，會比單週多。" : "";
}
function boxMatcher(movies) {
  const map = {};
  for (const m of movies) map[communityKey(m.title)] ||= m;
  return (name) => map[communityKey(name)];
}
function boxOfficeLabel(b) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  return b.mode === "week" ? `${md(b.start)}–${md(b.end)} 全台週票房` : `近期上映電影累計票房（截至 ${md(b.end)}）`;
}
var VERSION_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/version.json";
var verNum = (v) => Number(String(v || "").replace(/\D/g, "")) || 0;
async function checkLatest(current2) {
  try {
    const r = await platform().fetchText(VERSION_URL + "?t=" + Date.now(), { accept: "application/json" });
    if (r.status < 200 || r.status >= 300) return null;
    const latest = String(JSON.parse(r.body).version || "");
    if (!latest) return null;
    return { latest, isLatest: verNum(current2) >= verNum(latest) };
  } catch (_) {
    return null;
  }
}
var CINEMA_APPS = [
  { re: /威秀|MUVIE|^vscinemas/i, name: "威秀影城", id: "6761522320", schemes: ["vscinemas", "vieshow", "vieshowcinemas", "com.vieshow.vscinemas"] },
  { re: /秀泰|^showtimes/i, name: "秀泰影城", id: "1152850053", schemes: ["showtimes", "showtimescinema", "maimaishowtimes", "tw.com.maimai.showtimes"] },
  { re: /國賓|^ambassador/i, name: "國賓看電影", id: "435465064", schemes: ["ambassador", "ambassadorlookmovie", "ambassadortheatres", "ambassadorcinemas", "ambassadorapp", "lookmovie", "langshin", "tw.com.langshin.AmbassadorLookMovie", "tw.com.langshin.ambassadorlookmovie"] },
  { re: /新光影城|^skcinemas/i, name: "新光影城", id: "6747376383", schemes: ["skcinemas", "skcinema", "com.bonjays.skcinema.test", "com.bonjays.skcinema"] },
  { re: /美麗新/, name: "美麗新影城", id: "581548701", schemes: ["miramarcinemas", "miramarcinemasbookingonline", "tw.com.miramarcinemas.MiramarCinemasBookingOnline"] },
  { re: /美麗華|^miramar/i, name: "美麗華影城", id: "1446574681", schemes: ["miramar", "mirmar", "miramarcinema", "com.movie.Mirmar"] },
  { re: /喜樂時代|^centuryasia/i, name: "喜樂時代影城", id: "6751645458", schemes: ["centuryasia", "century-asia", "com.century-asia.app"] },
  { re: /樂聲|^lux$/i, name: "樂聲影城", id: "833368283", schemes: ["luxcinema", "lux", "com.studiow.luxcinema"] },
  { re: /百老匯/, name: "龍祥百老匯影城", id: "6446755867", schemes: ["broadwaycinemas", "broadway", "com.broadwaycinemas.app"] }
];
function cinemaApp(c) {
  const a = CINEMA_APPS.find((x) => x.re.test(c.name) || x.re.test(c.id));
  return a ? { name: a.name, id: a.id, url: `itms-apps://apps.apple.com/tw/app/id${a.id}`, schemes: a.schemes } : null;
}
async function bookingUrl(p) {
  if (p.booking) return p.booking;
  try {
    return (await datesOf(p.cinema)).site || p.cinema.url;
  } catch (_) {
    return p.cinema.url;
  }
}
function shareText(p, start, end, seat, app = "apple") {
  const maps = mapsUrl(p.cinema.name, p.address, app);
  return [
    `🎬 ${p.movie.title}`,
    `🕒 ${fmt(start)}${end ? ` – ${fmt(end).slice(-5)}` : ""}`,
    `📍 ${p.cinema.name}（${p.version.label}）`,
    seat ? `💺 ${seat}` : "",
    p.address ? `🏠 ${p.address}` : "",
    `🗺 ${maps}`
  ].filter(Boolean).join("\n");
}

// src/jsx.tsx
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function flat(children) {
  if (!Array.isArray(children)) children = [children];
  let out = "";
  for (const c of children) {
    if (c === null || c === void 0 || c === false || c === true) continue;
    if (Array.isArray(c)) out += flat(c);
    else out += String(c);
  }
  return out;
}
var handlers = {};
var seq = 0;
function resetHandlers() {
  handlers = {};
  seq = 0;
}
function getHandler(id) {
  return handlers[id];
}
function register(fn) {
  if (!fn) return "";
  const id = "a" + ++seq;
  handlers[id] = fn;
  return id;
}
var VOID = /^(br|hr|img|input|meta|link)$/;
function h(type, props, ...children) {
  if (typeof type === "function") return type({ ...props || {}, children });
  let attrs = "";
  for (const k in props || {}) {
    const v = props[k];
    if (v === null || v === void 0 || v === false) continue;
    if (k === "onTap") {
      attrs += ` data-act="${register(v)}"`;
      continue;
    }
    if (k === "onInput") {
      attrs += ` data-live="${register(v)}"`;
      continue;
    }
    if (k === "onLongPress") {
      attrs += ` data-long="${register(v)}"`;
      continue;
    }
    attrs += ` ${k === "className" ? "class" : k}="${esc(v === true ? "" : v)}"`;
  }
  if (VOID.test(type)) return `<${type}${attrs}>`;
  return `<${type}${attrs}>${flat(children)}</${type}>`;
}
function Fragment(props) {
  return flat(props.children || []);
}
var tabBarProvider = null;
function setTabBar(fn) {
  tabBarProvider = fn;
}
var canGoBack = () => true;
function setBackGuard(fn) {
  canGoBack = fn;
}
var TAB_ICONS = {
  house: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.4"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><path d="M15.6 5.4a3.3 3.3 0 0 1 0 6.2"/><path d="M17.6 14.3a6 6 0 0 1 3.6 5.2"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.6 2H4.4z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
  film: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
  building: '<svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l5-3v17"/><path d="M10 21V11l9-3v13"/><path d="M14 13h2M14 17h2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};
var GUIDE_ICONS = {
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  vdots: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  home: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>'
};
function Steps(props) {
  return /* @__PURE__ */ h("div", { class: "steps" }, props.items.map((it, i) => /* @__PURE__ */ h("div", { class: "step" }, /* @__PURE__ */ h("span", { class: "step-n" }, i + 1), /* @__PURE__ */ h("span", { class: "step-ico" }, GUIDE_ICONS[it.icon] || ""), /* @__PURE__ */ h("div", { class: "step-body" }, /* @__PURE__ */ h("div", { class: "step-t" }, esc(it.title)), it.text ? /* @__PURE__ */ h("div", { class: "step-s" }, esc(it.text)) : null))));
}
function TabBarView() {
  const t = tabBarProvider ? tabBarProvider() : null;
  if (!t) return "";
  return /* @__PURE__ */ h("nav", { class: "tabbar", "aria-label": "分頁" }, t.items.map((it) => /* @__PURE__ */ h("button", { class: "tab" + (it.id === t.active ? " on" : ""), onTap: () => t.onTap(it.id), "aria-label": it.label }, TAB_ICONS[it.icon] || "", it.dot ? /* @__PURE__ */ h("i", { class: "tab-dot", "aria-label": "有新內容" }) : null, /* @__PURE__ */ h("span", null, esc(it.label)))));
}
function Page(props) {
  const back = props.onBack && canGoBack() ? props.onBack : void 0;
  return /* @__PURE__ */ h("div", { class: "page" + (tabBarProvider && !props.noTabs ? " with-tabs" : "") }, /* @__PURE__ */ h("header", { class: "bar" }, back ? /* @__PURE__ */ h("button", { class: "back", onTap: back }, "‹ 返回") : /* @__PURE__ */ h("span", { class: "back-spacer" }), /* @__PURE__ */ h("div", { class: "bar-title" }, /* @__PURE__ */ h("div", { class: "t" }, esc(props.title)), props.subtitle ? /* @__PURE__ */ h("div", { class: "s" }, esc(props.subtitle)) : null), props.right ? /* @__PURE__ */ h("span", { class: "bar-right" }, props.right) : /* @__PURE__ */ h("span", { class: "back-spacer" })), /* @__PURE__ */ h("main", { class: "content" }, props.children), props.noTabs ? null : /* @__PURE__ */ h(TabBarView, null));
}
function Section(props) {
  return /* @__PURE__ */ h("section", { class: "sec" }, props.title ? /* @__PURE__ */ h("h2", { class: "sec-title" }, esc(props.title)) : null, /* @__PURE__ */ h("div", { class: "group" }, props.children), props.hint ? /* @__PURE__ */ h("p", { class: "hint" }, esc(props.hint)) : null);
}
function Item(props) {
  const cls = ["item", props.head ? "head" : "", props.kv ? "kv" : "", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : "", props.onLongPress ? "long" : ""].join(" ");
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.remove()}";
  return /* @__PURE__ */ h("div", { class: cls, onTap: props.onTap, onLongPress: props.onLongPress }, props.rank ? /* @__PURE__ */ h("span", { class: "rank" + (props.rank <= 3 ? " top" : "") + (props.rank >= 1e3 ? " d4" : props.rank >= 100 ? " d3" : "") }, props.rank) : null, props.thumb ? props.thumb.pending && !props.thumb.src ? /* @__PURE__ */ h("span", { class: "thumb none" }) : /* @__PURE__ */ h(GenPoster, { cls: "thumb", title: props.title }, props.thumb.src ? /* @__PURE__ */ h("img", { src: props.thumb.src, "data-url": props.thumb.url && props.thumb.url !== props.thumb.src ? props.thumb.url : void 0, alt: "", loading: "lazy", onerror: fallback }) : null) : null, props.icon ? /* @__PURE__ */ h("span", { class: "ico" }, props.icon) : null, /* @__PURE__ */ h("div", { class: "body" }, /* @__PURE__ */ h("div", { class: props.tag && !props.kv ? "title tagged" : "title" }, esc(props.title), props.tag && !props.kv ? /* @__PURE__ */ h("span", { class: "pill " + props.tag.tone }, esc(props.tag.text)) : null), props.subtitle ? props.subtitle.includes("\n") ? props.subtitle.split("\n").map((l, i) => /* @__PURE__ */ h("div", { class: "sub one" + (i ? " dim" : "") }, esc(l))) : /* @__PURE__ */ h("div", { class: "sub" }, esc(props.subtitle)) : null), props.badge ? /* @__PURE__ */ h("span", { class: "badge" }, esc(props.badge)) : null, props.right ? /* @__PURE__ */ h("span", { class: "right" }, esc(props.right)) : null, props.tag && props.kv ? /* @__PURE__ */ h("span", { class: "right" }, /* @__PURE__ */ h("span", { class: "pill " + props.tag.tone }, esc(props.tag.text))) : null, props.hi ? /* @__PURE__ */ h("span", { class: `hi ${props.hi.kind} ${props.hi.tier}` }, /* @__PURE__ */ h("span", { class: "hv" }, props.hi.kind === "imdb" ? /* @__PURE__ */ h("i", { class: "imdb" }, "IMDb") : props.hi.kind === "tomato" || props.hi.kind === "popcorn" ? /* @__PURE__ */ h("i", { class: "emo" }, rateIcon(props.hi.kind, props.hi.tier)) : props.hi.kind === "community" ? /* @__PURE__ */ h("i", { class: "emo star" }, "★") : null, /* @__PURE__ */ h("b", null, esc(props.hi.text))), props.hi.note ? /* @__PURE__ */ h("small", null, esc(props.hi.note)) : null) : null, props.onTap && props.chevron !== false && !props.action ? /* @__PURE__ */ h("span", { class: "chev" }, "›") : null, props.action ? /* @__PURE__ */ h("button", { class: "act", "aria-label": props.action.hint || props.action.label, onTap: props.action.onTap }, esc(props.action.label)) : null);
}
function Chips(props) {
  return /* @__PURE__ */ h("div", { class: props.tabs ? "chips tabs" : props.scroll ? "chips scroll" : "chips" }, props.children);
}
function Chip(props) {
  return /* @__PURE__ */ h("button", { class: ["chip", props.muted ? "muted" : "", props.warn ? "warn" : ""].join(" "), onTap: props.onTap }, /* @__PURE__ */ h("span", { class: "l" }, esc(props.label)), props.sub ? /* @__PURE__ */ h("span", { class: "s" }, esc(props.sub)) : null);
}
function Search(props) {
  return /* @__PURE__ */ h("input", { class: "field", name: "q", type: "search", enterkeyhint: "search", autocomplete: "off", value: props.value, placeholder: props.placeholder, autofocus: props.autofocus, onInput: (v) => props.onInput(v.q || "") });
}
function PickRow(props) {
  return /* @__PURE__ */ h("div", { class: "item kv" }, /* @__PURE__ */ h("div", { class: "body" }, /* @__PURE__ */ h("div", { class: "title" }, esc(props.title))), /* @__PURE__ */ h("select", { class: "sel", name: props.name, onInput: (v) => props.onPick(v[props.name] || "") }, props.options.map((o) => /* @__PURE__ */ h("option", { value: o.id, selected: o.id === props.value }, esc(o.label)))));
}
function Button(props) {
  return /* @__PURE__ */ h("button", { class: "btn " + (props.kind || "primary"), onTap: props.onTap, "data-enter": props.enter ? "" : void 0 }, esc(props.label));
}
var RATE_ICON = {
  "tomato:good": '<ellipse cx="12" cy="13.6" rx="9.2" ry="8.2" fill="#e8372c"/><ellipse cx="8.4" cy="10.6" rx="2.6" ry="1.5" fill="#ff8a7d" opacity=".75" transform="rotate(-28 8.4 10.6)"/><path d="M12 7.4c-1.6-2.4-4.3-2.9-6-2.1 1.5.5 2.4 1.5 2.9 2.7-1.2-.1-2.4.4-3.2 1.3 2.2-.5 4.2-.3 6.3.6 2.1-.9 4.1-1.1 6.3-.6-.8-.9-2-1.4-3.2-1.3.5-1.2 1.4-2.2 2.9-2.7-1.7-.8-4.4-.3-6 2.1z" fill="#2f9e44"/><path d="M12 7.6V4.2" stroke="#2b8a3e" stroke-width="1.5" stroke-linecap="round"/><g transform="translate(13.2 13.2)"><circle cx="5.4" cy="5.4" r="5.4" fill="#f5b301" stroke="#fff" stroke-width="1.2"/><path d="M2.9 5.5l1.8 1.8 3.3-3.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>',
  "tomato:mid": '<ellipse cx="12" cy="13.6" rx="9.2" ry="8.2" fill="#e8372c"/><ellipse cx="8.4" cy="10.6" rx="2.6" ry="1.5" fill="#ff8a7d" opacity=".75" transform="rotate(-28 8.4 10.6)"/><path d="M12 7.4c-1.6-2.4-4.3-2.9-6-2.1 1.5.5 2.4 1.5 2.9 2.7-1.2-.1-2.4.4-3.2 1.3 2.2-.5 4.2-.3 6.3.6 2.1-.9 4.1-1.1 6.3-.6-.8-.9-2-1.4-3.2-1.3.5-1.2 1.4-2.2 2.9-2.7-1.7-.8-4.4-.3-6 2.1z" fill="#2f9e44"/><path d="M12 7.6V4.2" stroke="#2b8a3e" stroke-width="1.5" stroke-linecap="round"/>',
  "tomato:bad": '<g fill="#3fb950"><circle cx="12" cy="12.4" r="6.3"/><g stroke="#3fb950" stroke-linecap="round"><path d="M12 12L5.2 6.6" stroke-width="5"/><path d="M12 12l6.6-6" stroke-width="4.2"/><path d="M12 12l8 3.4" stroke-width="5"/><path d="M12 12l1.4 8.2" stroke-width="4.4"/><path d="M12 12L5.4 18" stroke-width="4"/></g><circle cx="4.8" cy="6.2" r="3"/><circle cx="19" cy="5.6" r="2.5"/><circle cx="20.4" cy="15.6" r="2.9"/><circle cx="13.5" cy="20.6" r="2.5"/><circle cx="5" cy="18.4" r="2.3"/><circle cx="2.2" cy="12.2" r="1.1"/><circle cx="21.6" cy="21.4" r="1"/><circle cx="11.6" cy="2.2" r="1"/></g><ellipse cx="9.6" cy="9.6" rx="2" ry="1.1" fill="#8ee69b" opacity=".8" transform="rotate(-30 9.6 9.6)"/>',
  "popcorn:good": '<circle cx="7.4" cy="7.6" r="2.5" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="12" cy="5.4" r="3" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="16.6" cy="7.6" r="2.5" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="9.8" cy="8.6" r="2.2" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="14.3" cy="8.6" r="2.2" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><path d="M5.6 10h12.8l-1.6 11.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8z" fill="#e8372c"/><path d="M8.6 10h2.2l.5 12H9.4zM13.2 10h2.2l-.8 12h-1.9z" fill="#fff"/><path d="M5.2 9.2h13.6v1.6H5.2z" fill="#c92a20"/><g transform="translate(13.2 13.2)"><circle cx="5.4" cy="5.4" r="5.4" fill="#f5b301" stroke="#fff" stroke-width="1.2"/><path d="M2.9 5.5l1.8 1.8 3.3-3.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>',
  "popcorn:mid": '<circle cx="7.4" cy="7.6" r="2.5" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="12" cy="5.4" r="3" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="16.6" cy="7.6" r="2.5" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="9.8" cy="8.6" r="2.2" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="14.3" cy="8.6" r="2.2" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><path d="M5.6 10h12.8l-1.6 11.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8z" fill="#e8372c"/><path d="M8.6 10h2.2l.5 12H9.4zM13.2 10h2.2l-.8 12h-1.9z" fill="#fff"/><path d="M5.2 9.2h13.6v1.6H5.2z" fill="#c92a20"/>',
  "popcorn:bad": '<g transform="rotate(-9 8 14)"><path d="M2 10.4L13.4 7.6v12.8L2 17.6a1 1 0 0 1-.8-1v-5.2a1 1 0 0 1 .8-1z" fill="#e8372c"/><path d="M1.2 12.6l12.2-1.5v2.4L1.2 14.4zM1.6 16.2l11.8 1.6v2.2L2 17.6z" fill="#fff"/><path d="M1.6 10.6l11.8-2.6v1.9L1.2 11.6z" fill="#fff" opacity="0"/><ellipse cx="13.6" cy="14" rx="1.5" ry="6.6" fill="#8f1f18"/></g><circle cx="15.2" cy="10.6" r="1.9" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="17.2" cy="17.2" r="2.6" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="20.8" cy="19.4" r="2.1" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="17.6" cy="13" r="1.9" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="21.2" cy="15.6" r="1.7" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/><circle cx="13.6" cy="20.4" r="1.8" fill="#fff3c4" stroke="#e6b94a" stroke-width=".7"/>'
};
function rateIcon(kind, tier) {
  const inner = RATE_ICON[`${kind}:${tier === "none" ? "mid" : tier}`] || RATE_ICON[`${kind}:mid`];
  return `<svg class="ri" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}
function Badges(props) {
  if (!props.items.length) return "";
  return /* @__PURE__ */ h("div", { class: "ratings" }, props.items.map((b) => /* @__PURE__ */ h("button", { class: "rate " + b.tier, onTap: b.tier === "none" ? void 0 : b.onTap, "aria-label": b.kind === "imdb" ? "IMDb" : b.kind === "tomato" ? "番茄指數" : "爆米花指數" }, b.kind === "imdb" ? /* @__PURE__ */ h("span", { class: "imdb" }, "IMDb") : /* @__PURE__ */ h("span", { class: "emo" }, rateIcon(b.kind, b.tier)), /* @__PURE__ */ h("span", { class: "v" }, esc(b.value)), b.note ? /* @__PURE__ */ h("span", { class: "n" }, esc(b.note)) : null)));
}
function GenPoster(props) {
  const n = Array.from(props.title).length;
  return /* @__PURE__ */ h("span", { class: `${props.cls} gen g${posterTint(props.title)}` }, /* @__PURE__ */ h("i", { class: "clap" }), /* @__PURE__ */ h("span", { class: "gt" + (n > 16 ? " l" : n > 7 ? " m" : "") }, /* @__PURE__ */ h("span", null, esc(props.title))), /* @__PURE__ */ h("i", { class: "perf" }), props.children);
}
function Hero(props) {
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.remove()}";
  return /* @__PURE__ */ h("div", { class: "hero" }, props.posterPending && !props.poster ? /* @__PURE__ */ h("div", { class: "poster none pending" }) : /* @__PURE__ */ h(GenPoster, { cls: "poster", title: props.title || "" }, props.poster ? /* @__PURE__ */ h("img", { src: props.poster, "data-url": props.posterUrl && props.posterUrl !== props.poster ? props.posterUrl : void 0, alt: "", onerror: fallback }) : null), /* @__PURE__ */ h("div", { class: "hero-info" }, props.lines.filter(Boolean).map((l) => /* @__PURE__ */ h("div", { class: "hero-line" }, esc(l))), props.badges ? /* @__PURE__ */ h(Badges, { items: props.badges }) : null, props.onTrailer || props.fav || props.onShare ? /* @__PURE__ */ h("div", { class: "hero-acts" }, props.onTrailer ? /* @__PURE__ */ h("button", { class: "trailer", onTap: props.onTrailer }, "▶︎ ", esc(props.trailerLabel || "觀看預告")) : null, props.fav ? /* @__PURE__ */ h("button", { class: "fav" + (props.fav.on ? " on" : ""), "aria-label": props.fav.on ? "取消收藏" : "收藏這部電影", "aria-pressed": props.fav.on ? "true" : "false", onTap: props.fav.onTap }, props.fav.on ? "♥" : "♡") : null, props.onShare ? /* @__PURE__ */ h("button", { class: "fav share", "aria-label": "分享這部電影", onTap: props.onShare }, '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>') : null) : null));
}
function Para(props) {
  return /* @__PURE__ */ h("div", { class: "para" }, esc(props.text), props.dim ? /* @__PURE__ */ h("div", { class: "dim" }, esc(props.dim)) : null);
}
function Note(props) {
  return /* @__PURE__ */ h("p", { class: "note " + (props.kind || "info") }, esc(props.text));
}
function Loading(props) {
  return /* @__PURE__ */ h("div", { class: "loading" }, /* @__PURE__ */ h("div", { class: "spinner" }), /* @__PURE__ */ h("div", null, esc(props.text || "讀取中…")));
}
function Empty(props) {
  return /* @__PURE__ */ h("div", { class: "empty" }, /* @__PURE__ */ h("div", { class: "big" }, props.icon || "🎬"), /* @__PURE__ */ h("div", null, esc(props.text)));
}

// src/ui.ts
var CSS = `
:root{color-scheme:light dark;
 --bg:#f2f2f7;--card:#fff;--fg:#1c1c1e;--fg2:#6e6e73;--line:rgba(60,60,67,.12);
 --bar:rgba(242,242,247,.86);--accent:#0a84ff;--green:#30d158;--orange:#ff9f0a;--red:#ff453a;--chip:#e9e9ee;--chip-fg:#1c1c1e}
@media(prefers-color-scheme:dark){:root{--bg:#000;--card:#1c1c1e;--fg:#f2f2f7;--fg2:#98989d;--line:rgba(84,84,88,.5);--chip:#2c2c2e;--chip-fg:#f2f2f7;--bar:rgba(0,0,0,.8)}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.4 -apple-system,"PingFang TC",system-ui,sans-serif;-webkit-text-size-adjust:100%}
button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;text-align:left}
.page{min-height:100vh;display:flex;flex-direction:column}
.bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 8px) 12px 8px;
 background:var(--bar);backdrop-filter:saturate(180%) blur(18px);-webkit-backdrop-filter:saturate(180%) blur(18px);border-bottom:1px solid var(--line)}
.back{color:var(--accent);font-size:17px;padding:6px 8px 6px 0;min-width:64px;white-space:nowrap}
.back-spacer{min-width:64px}
.bar-title{flex:1;text-align:center;min-width:0}
.bar-title .t{font-weight:600;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-title .s{font-size:12px;color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-save{padding:6px 2px 6px 12px;font-size:17px;font-weight:600;color:var(--accent)}
.bar-right{min-width:64px;text-align:right;font-size:13px;color:var(--fg2);white-space:nowrap}
.content{flex:1;padding:8px 16px calc(env(safe-area-inset-bottom) + 32px)}
.page.with-tabs .content{padding-bottom:calc(max(env(safe-area-inset-bottom) - 12px,12px) + 104px)}
.tabbar{position:fixed;left:50%;transform:translateX(-50%);bottom:max(calc(env(safe-area-inset-bottom) - 12px),12px);z-index:10;width:min(92vw,420px);
 display:flex;align-items:center;padding:5px;border-radius:999px;
 background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(28px) saturate(190%);backdrop-filter:blur(28px) saturate(190%);
 border:1px solid rgba(255,255,255,.55);box-shadow:0 10px 36px rgba(0,0,0,.16),0 1px 2px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.7)}
@media(prefers-color-scheme:dark){.tabbar{background:rgba(40,40,44,.55);border-color:rgba(255,255,255,.1);box-shadow:0 10px 36px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 4px 6px;border-radius:999px;color:var(--fg2);font-size:10.5px;font-weight:600;line-height:1;transition:background .2s,color .2s}
.tab svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.tab.on{color:var(--accent);background:rgba(10,132,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
@media(prefers-color-scheme:dark){.tab.on{background:rgba(10,132,255,.22)}}
.tab:active{opacity:.6}
.tab{position:relative}
.tab-dot{position:absolute;top:5px;left:calc(50% + 7px);width:8px;height:8px;border-radius:4px;background:#ff3b30;box-shadow:0 0 0 1.5px var(--bg)}
.newdot{display:inline-block;width:8px;height:8px;border-radius:4px;background:#ff3b30;margin-right:6px;vertical-align:1px}
.sec{margin:14px 0 0}
.sec-title{margin:0 0 6px 12px;font-size:13px;font-weight:600;color:var(--fg2);text-transform:uppercase;letter-spacing:.3px}
.group{background:var(--card);border-radius:14px;overflow:hidden}
.hint{margin:8px 12px 0;font-size:13px;color:var(--fg2)}
.item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--line);min-height:46px}
.group .item:last-child{border-bottom:0}
.item.tap:active{background:var(--line)}
.item .ico{font-size:20px;width:26px;text-align:center;flex:none}
.item .rank{flex:none;width:34px;text-align:center;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--fg2);white-space:nowrap;overflow:hidden}
.item .rank.d3{font-size:15px}
.item .rank.d4{font-size:12px;letter-spacing:-.2px}
.item .rank.top{color:#ff9f0a}
.item .thumb{flex:none;width:44px;height:66px;border-radius:6px;object-fit:cover;background:var(--chip)}
.item .thumb.none{display:block}
.gen{position:relative;overflow:hidden;display:flex!important;flex-direction:column;color:#fff;text-align:center}
.gen>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.gen .clap{flex:none;height:17%;background:repeating-linear-gradient(115deg,#fff 0 14%,#17181c 14% 28%);border-bottom:1px solid rgba(0,0,0,.35)}
.gen .gt{flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:0 7%;font-weight:800;line-height:1.2;font-size:9px;text-shadow:0 1px 2px rgba(0,0,0,.25)}
.gen .gt>span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;word-break:break-word}
.gen .gt.m{font-size:8px}.gen .gt.l{font-size:7px}
.gen .perf{flex:none;height:9%;opacity:.5;background:repeating-linear-gradient(90deg,transparent 0 6%,#fff 6% 15%,transparent 15% 20%);background-size:70% 50%;background-position:center;background-repeat:no-repeat}
.poster.gen .gt{font-size:19px;padding:0 9%}.poster.gen .gt.m{font-size:15px}.poster.gen .gt.l{font-size:12px}
.poster.gen .gt>span{-webkit-line-clamp:4}
.poster.gen .clap{border-bottom-width:3px}
.g0{background:linear-gradient(160deg,#3b4a6b,#1f2a44)!important}.g1{background:linear-gradient(160deg,#6b3b4a,#3d1f2a)!important}.g2{background:linear-gradient(160deg,#2f5d50,#16352d)!important}.g3{background:linear-gradient(160deg,#5a4a2f,#33290f)!important}.g4{background:linear-gradient(160deg,#4a3b6b,#281f44)!important}.g5{background:linear-gradient(160deg,#3a3d42,#1f2125)!important}
.item .body{flex:1;min-width:0}
.item .title{font-size:16px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.item .sub{font-size:13px;color:var(--fg2);margin-top:2px;white-space:pre-line;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.item .sub.one{display:block;white-space:nowrap}
.item .sub.dim{font-size:12px;opacity:.75;margin-top:1px}
.item .right{font-size:14px;color:var(--fg2);flex:none;max-width:40%;text-align:right}
.item .hi{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:1px;max-width:38%;text-align:right;color:var(--fg)}
.item .hi .hv{display:flex;align-items:center;gap:4px;white-space:nowrap}
.item .hi b{font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.15}
.item .hi small{font-size:10.5px;font-weight:600;color:var(--fg2);white-space:nowrap}
.item .hi i{font-style:normal}
.item .hi .imdb{background:#f5c518;color:#000;font-size:9px;font-weight:800;padding:1px 3px;border-radius:3px;letter-spacing:-.2px}
.item .hi .emo{font-size:14px}
.item .hi .star{color:var(--accent)}
.item .hi.good b{color:#1f9d45}.item .hi.mid b{color:#c77700}.item .hi.bad b{color:#d63a31}
.item .hi.none b{color:var(--fg2);font-weight:600}
.item .hi.none .emo{filter:grayscale(1);opacity:.6}.item .hi.none .imdb{opacity:.5}
.item .hi.money b,.item .hi.cinemas b,.item .hi.date b{color:var(--fg)}
@media(prefers-color-scheme:dark){.item .hi.good b{color:#30d158}.item .hi.mid b{color:#ffb340}.item .hi.bad b{color:#ff6961}}
.pill{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.5;vertical-align:middle;white-space:nowrap}
.pill.now{background:rgba(48,209,88,.2);color:#1f9d45}
.pill.off{background:rgba(255,69,58,.18);color:#d63a31}
.pill.few{background:rgba(255,204,0,.28);color:#8a6d00}
@media(prefers-color-scheme:dark){.pill.few{color:#ffd60a}}
.pill.soon{background:rgba(255,159,10,.2);color:#c77700}
@media(prefers-color-scheme:dark){.pill.now{color:#30d158}.pill.off{color:#ff6961}.pill.soon{color:#ffb340}}
.item .title .pill{position:relative;top:-2px}
.item.kv .right .pill{margin-left:0;font-size:12px;padding:2px 9px}
.item.kv .body{flex:0 0 auto}
.item.kv .right{flex:1 1 auto;max-width:none;min-width:0;white-space:nowrap;overflow:hidden}
.item .badge{flex:none;font-size:12px;padding:2px 8px;border-radius:999px;background:var(--chip);color:var(--chip-fg)}
.item .chev{color:var(--fg2);opacity:.55;font-size:22px;line-height:1;flex:none}
.item .title.tagged{display:block;overflow:visible;-webkit-line-clamp:unset;text-overflow:clip}
.item .sel{flex:none;font:inherit;font-size:16px;color:var(--accent);background:var(--bg);border:0;border-radius:10px;padding:7px 10px;-webkit-appearance:menulist-button;appearance:auto}
.item.muted .title,.item.muted .sub{color:var(--fg2)}
.item.accent .title{color:var(--accent)}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px}
.chip{display:flex;flex-direction:column;align-items:center;min-width:84px;padding:8px 12px;border-radius:12px;background:var(--chip);color:var(--chip-fg)}
.chip:active{opacity:.6}
.chip .l{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.chip .s{font-size:11px;color:var(--fg2);margin-top:2px}
.chip.muted{opacity:.45}
.chip.warn{outline:1.5px solid var(--orange)}
.chips.scroll{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.chips.scroll::-webkit-scrollbar{display:none}
.chips.scroll .chip{flex:0 0 auto;min-width:72px}
.chips.scroll .chip .l{white-space:nowrap}
.sortbar{display:flex;align-items:center;gap:6px;padding:0 14px 0 16px;margin-top:6px}
.sortbar .lbl{flex:none;font-size:13px;font-weight:600;color:var(--fg2)}
.sortbar .chips{flex:1;min-width:0;padding:6px 0}
.sortbar .chips.scroll .chip{min-width:0;padding:7px 12px}
.sortbar .dir{flex:none;display:flex;align-items:center;gap:5px;padding:7px 9px 7px 11px;border-radius:12px;background:var(--card);color:var(--accent);font-size:14px;font-weight:600;white-space:nowrap;box-shadow:0 0 0 1px rgba(128,128,128,.25)}
.sortbar .dir .arrows{display:flex;flex-direction:column;line-height:1;font-size:9px;gap:1px}
.sortbar .dir .arrows i{font-style:normal;color:var(--fg2);opacity:.35}
.sortbar .dir.asc .up,.sortbar .dir.desc .down{color:var(--accent);opacity:1}
.sortbar .dir:active{opacity:.6}
.sortbar.more .chips{-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 30px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 30px),transparent)}
.sortbar .more-hint{display:none;flex:none;margin-left:-4px;font-size:17px;font-weight:700;line-height:1;color:var(--fg2)}
.sortbar.more .more-hint{display:block}
.chips.tabs{flex-wrap:nowrap;gap:6px}
.chips.tabs .chip{flex:1 1 0;min-width:0;padding:9px 2px}
.chips.tabs .chip .l{font-size:15px;white-space:nowrap}
.btn{display:block;width:100%;padding:14px;border-radius:14px;text-align:center;font-size:17px;font-weight:600;margin-top:16px}
.btn.primary{background:var(--accent);color:#fff}
.btn.secondary{background:var(--card);color:var(--accent)}
.btn.danger{background:var(--card);color:var(--red)}
.btn:active{opacity:.7}
.note{margin:10px 12px 0;font-size:13px;color:var(--fg2);white-space:pre-line}
.steps{background:var(--card);border-radius:14px;margin:8px 0;overflow:hidden}
.step{display:flex;align-items:center;gap:12px;padding:14px 14px;border-bottom:1px solid var(--line)}
.step:last-child{border-bottom:0}
.step-n{flex:none;width:24px;height:24px;border-radius:12px;background:var(--accent);color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
.step-ico{flex:none;width:44px;height:44px;border-radius:11px;background:var(--chip);display:flex;align-items:center;justify-content:center;color:var(--accent)}
.step-ico svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.step-ico svg circle{fill:currentColor;stroke:none}
.step-body{flex:1;min-width:0}
.step-t{font-size:16px;font-weight:600}
.step-s{font-size:13px;color:var(--fg2);margin-top:2px}
.group>.note{margin:0;padding:13px 16px;font-size:14px;line-height:1.45}
.group>.note+.note{padding-top:0}
.nt-form>.note{margin:0 0 10px}
.nt-form>.note:first-child{margin-top:8px}
.note.version{padding:6px 0;-webkit-user-select:none;user-select:none}
.note.version:active{opacity:.5}
.item .act{flex:none;width:40px;height:40px;margin:-4px -6px -4px 0;border-radius:20px;font-size:17px;color:var(--fg2);background:transparent}
.item .act:active{background:var(--line)}
.item.head{background:var(--chip)}
.item.head .title{font-size:18px;font-weight:700}
.auto-more{display:block;width:100%;padding:18px 14px 26px;text-align:center;font-size:13px;color:var(--fg2);background:transparent}
.para{padding:12px 14px;font-size:15px;line-height:1.6;white-space:pre-line}
.para .dim{margin-top:8px;font-size:13px;color:var(--fg2)}
.note.warn{color:var(--orange)}
.note.error{color:var(--red)}
.field{display:block;width:100%;padding:12px 14px;border:0;border-radius:12px;background:var(--card);color:var(--fg);font-size:17px;margin-top:8px;outline:none;-webkit-appearance:none;appearance:none}
.field:focus{box-shadow:0 0 0 2px var(--accent)}
.hero{display:flex;gap:14px;align-items:flex-end;margin:12px 4px 4px}
.hero .poster{width:112px;aspect-ratio:2/3;object-fit:cover;border-radius:12px;background:var(--chip);box-shadow:0 4px 14px rgba(0,0,0,.25);flex:none}
.hero .poster.none{box-shadow:none}
.hero .poster.pending{opacity:.5}
.hero-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hero-line{font-size:14px;color:var(--fg2)}
.ratings{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;overflow:visible}
.rate{display:flex;align-items:center;gap:3px;padding:4px 6px;border-radius:8px;font-size:13.5px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;line-height:1.2}
.rate.good{background:rgba(48,209,88,.18);color:#1f9d45}
.rate.mid{background:rgba(255,159,10,.2);color:#c77700}
.rate.bad{background:rgba(255,69,58,.18);color:#d63a31}
.rate.none{background:var(--chip);color:var(--fg2);opacity:.8}
.rate.none .emo{filter:grayscale(1);opacity:.7}
.rate.none .imdb{opacity:.55}
@media(prefers-color-scheme:dark){.rate.good{color:#30d158}.rate.mid{color:#ffb340}.rate.bad{color:#ff6961}}
.rate .imdb{background:#f5c518;color:#000;font-size:10px;font-weight:800;padding:1.5px 3.5px;border-radius:3.5px;letter-spacing:-.2px}
.rate .emo{font-size:13.5px}
.emo{display:inline-flex;align-items:center}
.emo .ri{width:1.3em;height:1.3em;display:block;flex:none;position:relative;top:-1.5px}
.rate .n{font-size:10px;font-weight:600;opacity:.85}
.rate:active{opacity:.6}
.hero-acts{display:flex;align-items:center;gap:8px;margin-top:8px}
.fav{flex:none;width:34px;height:34px;border-radius:17px;background:var(--chip);color:var(--fg2);font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center}
.fav.on{color:#ff2d55;background:rgba(255,45,85,.14)}
.fav:active{opacity:.6}
.trailer{padding:7px 13px;border-radius:999px;background:#ff0033;color:#fff;font-size:14px;font-weight:600;white-space:nowrap}
.trailer:active{opacity:.7}
.cm{padding:14px 16px}
.cm-top{display:flex;align-items:center;gap:12px}
.cm-avg{flex:none;font-size:28px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap;padding:6px 11px;border-radius:12px;background:var(--chip);color:var(--fg)}
.cm-avg small{font-size:12px;font-weight:600;opacity:.8;margin-left:2px}
.cm-avg.good{background:rgba(48,209,88,.18);color:#1f9d45}
.cm-avg.mid{background:rgba(255,159,10,.2);color:#c77700}
.cm-avg.bad{background:rgba(255,69,58,.18);color:#d63a31}
@media(prefers-color-scheme:dark){.cm-avg.good{color:#30d158}.cm-avg.mid{color:#ffb340}.cm-avg.bad{color:#ff6961}}
.cm-meta{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.cm-n{font-size:15px;font-weight:600}
.cm-by{font-size:12px;color:var(--fg2)}
.cm-hist{flex:none;width:96px}
.cm-hist .bars{display:flex;align-items:flex-end;gap:3px;height:32px}
.cm-hist .bars i{flex:1;display:block;border-radius:2px;background:var(--accent);opacity:.85}
.cm-hist .bars i.zero{opacity:.18}
.cm-hist .axis{display:flex;justify-content:space-between;font-size:10px;color:var(--fg2);margin-top:2px}
.cm-empty{font-size:15px;font-weight:600}
.cm-mine{display:flex;align-items:baseline;gap:10px;margin-top:10px;font-size:15px;font-weight:600}
.cm-mine.line{margin-top:13px;padding-top:11px;border-top:1px solid var(--line)}
.cm-mine.fold{width:100%;text-align:left;color:var(--fg)}
.cm-mine.fold .cm-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-mine.fold i{flex:none;font-style:normal;font-weight:400;font-size:13px;color:var(--accent)}
.cm-mine b{color:var(--accent);font-weight:700}
.cm-mine em{font-style:normal;font-weight:400;font-size:13px;color:var(--fg2)}
.cm-pick{display:flex;gap:4px;margin-top:8px}
.cm-num{flex:1 1 0;min-width:0;height:38px;padding:0;text-align:center;border-radius:9px;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--chip);color:var(--fg2)}
.cm-num.on{background:var(--accent);color:#fff}
.cm-num:active{transform:scale(.92)}
.cm-ends{display:flex;justify-content:space-between;margin-top:5px;font-size:11.5px;color:var(--fg2)}
.cm-toptags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.cm-toptags span{font-size:12.5px;padding:3px 9px;border-radius:999px;background:var(--chip);color:var(--fg)}
.cm-toptags b{font-weight:700;color:var(--fg2);font-variant-numeric:tabular-nums}
.cm-tagbar{display:flex;align-items:baseline;gap:10px;width:100%;margin-top:12px;padding:11px 0 0;border-top:1px solid var(--line);text-align:left;font-size:15px;font-weight:600;color:var(--fg)}
.cm-tagbar em{flex:1;min-width:0;font-style:normal;font-weight:400;font-size:13px;color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-tagbar i{flex:none;font-style:normal;font-weight:400;font-size:13px;color:var(--accent)}
.cm-tags{margin-top:8px}
.en-watch{margin:0;padding:12px 16px 14px}
.en-watch .cm-tagrow+.cm-tagrow{margin-top:16px}
.en-btns{padding-top:10px}
.cm-tagrow{margin-top:8px}
.cm-taghead{display:block;font-size:11.5px;color:var(--fg2);margin-bottom:5px}
.cm-tagset{display:flex;flex-wrap:wrap;gap:6px}
.cm-tag{font-size:14px;padding:6px 11px;border-radius:999px;background:var(--chip);color:var(--fg)}
.cm-tag.on{background:var(--accent);color:#fff;font-weight:600}
.cm-tag:active{transform:scale(.94)}
.cm-tagnote{margin-top:9px;font-size:11.5px;color:var(--fg2)}
.nt-form{padding:4px 16px 14px}
.nt-form .field{background:var(--chip)}
.nt-form .btn{margin-top:10px}
.nt-check{display:flex;align-items:center;gap:9px;width:100%;margin-top:10px;padding:4px 0;text-align:left;font-size:15px;color:var(--fg)}
.nt-check i{flex:none;width:22px;height:22px;border-radius:6px;border:1.5px solid var(--fg2);font-style:normal;font-size:14px;font-weight:800;line-height:19px;text-align:center;color:#fff}
.nt-check.on i{background:var(--accent);border-color:var(--accent)}
.nt-check em{flex:1;min-width:0;font-style:normal;font-size:12px;color:var(--fg2)}
.nt-list{padding:0 16px}
.nt{padding:12px 0;border-top:1px solid var(--line)}
.nt:first-child{border-top:0}
.nt-head{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--fg2)}
.nt-score{font-weight:700;font-variant-numeric:tabular-nums;padding:1px 7px;border-radius:6px;background:var(--chip);color:var(--fg)}
.nt-score.good{background:rgba(48,209,88,.18);color:#1f9d45}
.nt-score.mid{background:rgba(255,159,10,.2);color:#c77700}
.nt-score.bad{background:rgba(255,69,58,.18);color:#d63a31}
@media(prefers-color-scheme:dark){.nt-score.good{color:#30d158}.nt-score.mid{color:#ffb340}.nt-score.bad{color:#ff6961}}
.nt-sp{padding:1px 7px;border-radius:6px;background:rgba(255,159,10,.2);color:#c77700;font-weight:600}
@media(prefers-color-scheme:dark){.nt-sp{color:#ffb340}}
.nt-date{flex:1}
.nt-rep{flex:none;font-size:12px;color:var(--fg2);padding:4px 0 4px 10px}
.nt-rep.done{opacity:.6}
.nt-text{margin-top:6px;font-size:15.5px;line-height:1.5;overflow-wrap:anywhere}
.nt-meta{margin-top:5px;font-size:12px;color:var(--fg2);overflow-wrap:anywhere}
.nt-acts{display:flex;gap:8px;margin-top:9px}
.nt-acts button{padding:7px 14px;border-radius:9px;background:var(--chip);color:var(--accent);font-size:14px;font-weight:600}
.nt-acts button.danger{color:#ff3b30;margin-left:auto}
.fb-area{display:block;width:100%;min-height:120px;padding:12px 14px;border:0;border-radius:12px;background:var(--chip);color:var(--fg);font:inherit;font-size:16px;line-height:1.5;margin-top:10px;outline:none;resize:vertical;-webkit-appearance:none;appearance:none}
.wt-pick{position:relative;display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;background:var(--chip);color:var(--fg);overflow:hidden}
.wt-pick.on{box-shadow:0 0 0 1.5px var(--accent) inset}
.wt-ico{flex:none;font-size:18px;line-height:1}
.wt-text{flex:1;min-width:0;font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}
.wt-pick:not(.on) .wt-text{color:var(--accent)}
.wt-hint{flex:none;font-size:12px;color:var(--fg2)}
.wt-pick input{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;font-size:16px;-webkit-appearance:none;appearance:none}
.wt-quick{margin-top:8px}
.fb-area.note{min-height:96px;margin-top:8px}
.fb-cats{display:flex;flex-wrap:wrap;gap:6px}
.fb-tag{font-size:12px;font-weight:600;padding:1px 7px;border-radius:6px;background:var(--chip);color:var(--fg)}
.fb-tag.new{background:rgba(10,132,255,.16);color:var(--accent)}
.fb-tag.doing{background:rgba(255,159,10,.2);color:#c77700}
.fb-tag.done{background:rgba(48,209,88,.18);color:#1f9d45}
@media(prefers-color-scheme:dark){.fb-tag.doing{color:#ffb340}.fb-tag.done{color:#30d158}}
.fb-text{margin-top:6px;font-size:15.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.fb-reply{margin-top:9px;padding:10px 12px;border-radius:10px;background:var(--chip);font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.fb-reply b{display:block;font-size:12px;color:var(--accent);margin-bottom:3px}
.av{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;color:#fff;font-size:13px;font-weight:700;line-height:1}
.av.emo{font-size:14px;font-weight:400}
.nt-by.inline .av.emo{font-size:11px}
.pf-prev{display:flex;justify-content:center;margin:6px 0 16px}
.pf-prev .av.big{width:92px;height:92px;font-size:40px}
.pf-prev .av.big.emo{font-size:50px}
.em-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
.em-grid .em{width:100%;height:auto;aspect-ratio:1}
.em.add{font-size:22px;color:var(--accent);background:none;box-shadow:0 0 0 1.5px var(--line) inset}
.em-del{display:block;margin-top:10px;padding:0;font-size:13px;color:var(--fg2);text-decoration:underline}
.sw-row{display:flex;justify-content:space-between;align-items:center;gap:4px;margin-top:18px}
.sw.pick{position:relative;flex:none;overflow:hidden;background:conic-gradient(#ff3b30,#ff9500,#ffcc00,#34c759,#00c7be,#007aff,#af52de,#ff2d55,#ff3b30)}
.sw.pick input{position:absolute;inset:-6px;width:200%;height:200%;opacity:0;padding:0;border:0}
.sw-note{margin-top:8px;font-size:12.5px;color:var(--fg2);text-align:right}
.em{display:inline-flex;align-items:center;justify-content:center;padding:0;width:40px;height:40px;border-radius:10px;background:var(--chip);font-size:21px;line-height:1;color:var(--fg2)}
.em.on{box-shadow:0 0 0 2px var(--accent) inset}
.sw-custom{display:flex;align-items:center;gap:10px;margin-top:10px;font-size:14px;color:var(--fg2)}
.sw-custom.on{color:var(--fg);font-weight:600}
.sw-custom input{width:44px;height:34px;padding:0;border:0;border-radius:8px;background:none}
.pf{padding:16px 16px 12px}
.pf-top{display:flex;align-items:center;gap:16px}
.av.big{width:76px;height:76px;font-size:34px}
.av.big.emo{font-size:42px}
.pf-body{min-width:0;flex:1}
.pf-name{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;font-size:19px;font-weight:700;line-height:1.25;overflow-wrap:anywhere}
.pf-nums{display:flex;gap:4px;margin-top:8px}
.pf-stat{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-start;padding:0;text-align:left;color:var(--fg)}
.pf-stat b{font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.15;color:var(--fg)}
.pf-stat span{font-size:12.5px;color:var(--fg2);white-space:nowrap}
.pf-bio{margin-top:12px;font-size:15px;line-height:1.45;overflow-wrap:anywhere}
.pf-note{margin-top:8px;font-size:12px;color:var(--fg2);overflow-wrap:anywhere}
.pf-mutual{display:flex;align-items:center;gap:9px;width:100%;margin-top:12px;padding:0;text-align:left;font-size:13px;color:var(--fg2);line-height:1.35}
.pf-faces{flex:none;display:inline-flex}
.pf-faces .av{width:26px;height:26px;font-size:13px;margin-left:-8px;box-shadow:0 0 0 2px var(--card)}
.pf-faces .av:first-child{margin-left:0}
.pf-faces .av.emo{font-size:15px}
.pf-btns{display:flex;gap:8px;padding:0 16px 16px}
.pf-btn{text-align:center;flex:1 1 0;min-width:0;height:36px;padding:0 10px;border-radius:10px;background:var(--chip);color:var(--fg);font-size:14.5px;font-weight:600;white-space:nowrap}
.pf-btn.go{background:var(--accent);color:#fff}
.pf-btn.icon{flex:none;width:40px;font-size:16px;font-weight:400}
.pf-btn.so-btn{flex:none;width:40px;padding:0;display:inline-flex;align-items:center;justify-content:center}
.pf-btn.so-btn .so{width:21px;height:21px}
.so{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;vertical-align:middle;color:var(--fg)}
.so svg{width:100%;height:100%;fill:currentColor}
.pf-handle{display:flex;align-items:center;gap:8px;margin-top:8px;padding:0 12px;height:44px;border-radius:10px;background:var(--chip)}
.pf-handle>span:not(.so){flex:none;font-size:14px;color:var(--fg2);white-space:nowrap}
.pf-handle input{flex:1;min-width:0;height:100%;border:0;background:none;color:var(--fg);font-size:16px;outline:none}
.at{display:inline;padding:0;font:inherit;color:var(--accent);font-weight:600}
.ac-mark.mention{background:#8e5cf7}
.pf-btn:active{opacity:.7}
.us-main{display:flex;align-items:center;gap:10px;flex:1;min-width:0;text-align:left;color:var(--fg);padding:4px 0}
.us-name{font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.us-sub{flex:none;font-size:13px;color:var(--fg2)}
.us-follow{flex:none;margin-left:10px;padding:6px 14px;border-radius:999px;background:var(--accent);color:#fff;font-size:14px;font-weight:600}
.us-follow.on{background:var(--chip);color:var(--fg2)}
.sw{flex:none;width:32px;height:32px;padding:0;border-radius:50%;border:3px solid transparent}
.sw.on{border-color:var(--fg);box-shadow:0 0 0 2px var(--card) inset}
.nt-by{display:flex;align-items:center;gap:7px;margin-bottom:6px;font-size:14px;font-weight:600;color:var(--fg)}
.nt-by.inline{display:inline-flex;margin:0;font-size:12px;gap:5px;min-width:0}
.nt-by.inline .av{width:18px;height:18px;font-size:10px}
.nt-by.inline span:not(.av){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:9em}
.nt-by em{font-style:normal;font-weight:400;color:var(--accent)}
.en-title{flex:1;min-width:0;font-size:16px;font-weight:600;color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-hist.wide{width:100%}
.cm-hist.wide .bars{height:56px}
.cmt-new{display:flex;align-items:center;gap:10px;width:100%;padding:12px 16px;text-align:left}
.cmt-new-box{flex:1;min-width:0;padding:10px 14px;border-radius:18px;background:var(--chip);color:var(--fg2);font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmt-new i{flex:none;font-style:normal;font-size:14px;font-weight:600;color:var(--accent)}
.hid{display:none}
.cmt-new-box.draft{color:var(--fg)}
.nt-form .fb-area.note{min-height:64px;margin-top:8px}
.cmt-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin-top:8px}
.cmt-row .sp{flex:1}
.cmt-row button{padding:7px 0;font-size:14px;color:var(--fg2)}
.cmt-row button.danger{color:#ff3b30}
.cmt-row button.go{padding:7px 18px;border-radius:999px;background:var(--accent);color:#fff;font-weight:600}
.cmt-spoil{display:inline-flex;align-items:center;gap:7px}
.cmt-spoil i{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--fg2);font-style:normal;font-size:13px;font-weight:800;line-height:17px;text-align:center;color:#fff}
.cmt-spoil.on{color:var(--fg)}
.cmt-spoil.on i{background:var(--accent);border-color:var(--accent)}
.cmt-bar{display:flex;align-items:center;gap:8px;padding:12px 16px 4px}
.cmt-filters{display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0}
.cmt-filters .cm-tag{font-size:13px;padding:5px 11px}
.cmt-bar .sel{flex:none;max-width:9.5em;font-size:13px}
.cmt-quiet{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:10px 16px 2px;font-size:12.5px;color:var(--fg2)}
.cmt-quiet button{display:inline-flex;align-items:center;gap:5px;color:var(--fg);font-size:13px}
.cmt-quiet .av{width:18px;height:18px;font-size:10px}
.cmt-quiet b{font-weight:600;color:var(--fg2)}
.cmt-list{padding:10px 16px 14px}
.cmt{display:flex;align-items:flex-start;gap:9px;margin-top:12px}
.cmt:first-child{margin-top:0}
.cmt-foot{align-items:center}
.cmt-vote{margin-left:auto;display:inline-flex;align-items:center;gap:2px}
.cmt-foot .cmt-vote .vb{width:34px;height:28px;padding:0;font-size:15px;line-height:28px;text-align:center;color:var(--fg2);opacity:.75;font-weight:400}
.cmt-foot .cmt-vote .vb.off{opacity:.2}
.cmt-foot .cmt-vote .vb.up{color:#ff6a00;opacity:1}
.cmt-foot .cmt-vote .vb.down{color:#5e7bff;opacity:1}
.cmt-vote b{min-width:1.6em;text-align:center;font-size:13.5px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--fg2)}
.cmt-vote b.pos{color:#ff6a00}
.cmt-vote b.neg{color:#5e7bff}
.cmt-av{flex:none;padding:0;line-height:0}
.cmt-av .av{width:34px;height:34px;font-size:16px}
.cmt-av .av.emo{font-size:20px}
.av.anon{background:var(--chip);color:var(--fg2);font-weight:600}
.cmt-main{flex:1;min-width:0}
.cmt-bub{display:inline-block;max-width:100%;padding:9px 13px;border-radius:16px;background:var(--chip)}
.cmt.mine .cmt-bub{box-shadow:0 0 0 1.5px var(--accent) inset}
.cmt-head{display:flex;flex-wrap:wrap;align-items:center;gap:4px 7px;font-size:12px}
.cmt-name{font-size:14px;font-weight:700;color:var(--fg);padding:0;max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmt-name.dim{color:var(--fg2);font-weight:600}
.cmt-text{margin-top:3px;font-size:15.5px;line-height:1.45;overflow-wrap:anywhere}
.cmt-bub .nt-cover{background:var(--card);margin-top:5px}
.cmt-foot{display:flex;flex-wrap:wrap;gap:4px 12px;margin:4px 0 0 13px;font-size:12px;color:var(--fg2)}
.cmt-foot button{padding:0;font-size:12px;font-weight:600;color:var(--fg2)}
.cmt-foot .f{color:var(--accent)}
.cmt-foot .warn{color:var(--orange)}
.pf-tag{flex:none;padding:2px 8px;line-height:1.3;border-radius:999px;font-size:11.5px;font-weight:600;background:var(--chip);color:var(--fg2)}
.pf-tag.good{background:rgba(48,209,88,.18);color:#1f9d45}
.pf-tag.warn{background:rgba(255,159,10,.2);color:#c77700}
.pf-tag.bad{background:rgba(255,69,58,.18);color:#d63a31}
@media(prefers-color-scheme:dark){.pf-tag.good{color:#30d158}.pf-tag.warn{color:#ffb340}.pf-tag.bad{color:#ff6961}}
.pf-sub{margin-top:2px;font-size:13px;color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th.focus{margin:8px -8px 0;padding:10px 8px 6px;border-radius:12px;background:rgba(10,132,255,.12);box-shadow:0 0 0 1.5px var(--accent) inset}
.us-days{padding:4px 16px 10px}
.us-day{padding:12px 0}
.us-day+.us-day{border-top:1px solid var(--line)}
.us-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:15px}
.us-top span{color:var(--fg2);font-size:13.5px;font-variant-numeric:tabular-nums}
.us-bar{height:6px;margin:8px 0 6px;border-radius:3px;background:var(--chip);overflow:hidden}
.us-bar i{display:block;height:100%;border-radius:3px;background:var(--accent)}
.us-bar i.warn{background:#ff9f0a}
.us-bar i.bad{background:#ff453a}
.us-sub2{font-size:12.5px;line-height:1.5;color:var(--fg2);overflow-wrap:anywhere}
.fd-list{padding:4px 16px 6px}
.fd{display:flex;align-items:flex-start;gap:12px;padding:12px 0}
.fd+.fd{border-top:1px solid var(--line)}
.fd-av>.av{width:44px;height:44px;font-size:20px}
.fd-av>.av.emo{font-size:25px}
.fd-av{flex:none;padding:0;width:44px;height:44px}
.fd-body{flex:1;min-width:0}
.fd-line{font-size:15px;line-height:1.5;overflow-wrap:anywhere;color:var(--fg2)}
.fd-line button{display:inline;padding:0;font:inherit;font-weight:700;color:var(--fg)}
.fd-line .nt-score{display:inline-block;margin-left:2px;vertical-align:1px;white-space:nowrap}
.pf-pills{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px}
.pf-pill{display:inline-flex;align-items:center;gap:5px;max-width:100%;min-width:0;padding:3px 10px 3px 8px;border-radius:999px;border:1px solid var(--line);color:var(--fg2);font-size:12.5px;line-height:1.5}
.pf-pill>span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-pill .so{width:13px;height:13px;color:var(--fg2)}
.fd-line em{font-style:normal;white-space:nowrap}
.fd-meta{margin-top:2px;font-size:12.5px;color:var(--fg2)}
.fd-note{display:flex;align-items:flex-end;gap:8px;width:100%;margin-top:8px;padding:9px 12px;border-radius:12px;background:var(--chip);color:var(--fg);font-size:15px;line-height:1.45;text-align:left;overflow-wrap:anywhere}
.fd-note span{flex:1;min-width:0}
.fd-note i{flex:none;font-style:normal;font-size:13px}
.fd-note:active{opacity:.6}
.ac-list{padding:4px 16px 8px}
.ac{display:flex;align-items:center;gap:10px;padding:10px 0}
.ac.fresh{margin:0 -8px;padding:10px 8px;border-radius:12px;background:rgba(10,132,255,.1)}
.ac-main{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:0;text-align:left;color:var(--fg)}
.ac-av{position:relative;flex:none;width:44px;height:44px}
.ac-av>.av{width:44px;height:44px;font-size:20px}
.ac-av>.av.emo{font-size:25px}
.ac-av2{position:absolute;right:-6px;bottom:-4px}
.ac-av2 .av{width:26px;height:26px;font-size:12px;box-shadow:0 0 0 2px var(--card)}
.ac-mark{position:absolute;right:-4px;bottom:-3px;width:19px;height:19px;border-radius:50%;font-style:normal;font-size:10px;line-height:19px;text-align:center;color:#fff;background:var(--fg2);box-shadow:0 0 0 2px var(--card)}
.ac-av2+.ac-mark{right:auto;left:-4px}
.ac-mark.up{background:#ff6a00}
.ac-mark.down{background:#5e7bff}
.ac-mark.reply{background:var(--accent)}
.ac-mark.follow{background:#30b158}
.ac-text{flex:1;min-width:0;font-size:14.5px;line-height:1.4;overflow-wrap:anywhere}
.ac-text b{font-weight:700}
.ac-text em{font-style:normal;color:var(--fg2);white-space:nowrap}
.ac-btn{flex:none;height:32px;padding:0 14px;border-radius:9px;background:var(--chip);color:var(--fg2);font-size:13.5px;font-weight:600;line-height:32px;white-space:nowrap}
.ac-btn.go{background:var(--accent);color:#fff}
.th-list{padding:6px 16px 12px}
.th{padding-top:14px}
.th-head{display:flex;flex-wrap:wrap;align-items:center;gap:4px 7px;font-size:12.5px;color:var(--fg2)}
.th-av{flex:none;padding:0;line-height:0}
.th-av .av{width:28px;height:28px;font-size:14px}
.th-av .av.emo{font-size:17px}
.th-name{padding:0;font-size:14px;font-weight:700;color:var(--fg);max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-name.dim{color:var(--fg2);font-weight:600}
.th-f{color:var(--accent)}
.th-text{margin-top:6px;font-size:16px;line-height:1.5;overflow-wrap:anywhere}
.th.mine>.th-text{border-left:3px solid var(--accent);padding-left:9px}
.th-warn{margin-top:4px;font-size:12px;color:var(--orange)}
.th-gone{padding:4px 0;font-size:13.5px;color:var(--fg2);font-style:italic}
.th-acts{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:4px;color:var(--fg2)}
.ib{display:inline-flex;align-items:center;justify-content:center;width:34px;height:32px;padding:0;border-radius:8px;color:var(--fg2)}
.ib:active{background:var(--chip)}
.ib.on{color:var(--accent)}
.ib.off{opacity:.25}
.ib.up{color:#ff6a00}
.ib.up svg,.ib.down svg{fill:currentColor}
.ib.down{color:#5e7bff}
.th-vote{display:inline-flex;align-items:center}
.th-vote b{min-width:1.5em;text-align:center;font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--fg2)}
.th-vote b.pos{color:#ff6a00}
.th-vote b.neg{color:#5e7bff}
.th-menu{display:flex;justify-content:flex-end;margin-top:2px;font-size:14px;color:var(--fg2)}
.th-menu button{padding:6px 12px;border-radius:9px;background:var(--chip);font-size:14px;color:var(--fg)}
.th-menu button.danger{color:#ff3b30}
.th-reply{margin-top:4px}
.th-reply .fb-area.note{min-height:56px;margin-top:4px}
.th-kids{margin:2px 0 0 13px;padding-left:13px;border-left:2px solid var(--line)}
.th-kids .th{padding-top:12px}
.nt-text.go{display:flex;align-items:flex-end;gap:8px;width:100%;padding:0;text-align:left;color:var(--fg)}
.nt-text.go span{flex:1;min-width:0}
.nt-text.go i{flex:none;font-style:normal;font-size:13px;color:var(--accent);white-space:nowrap}
.nt-text.go:active{opacity:.6}
.nt-cover{display:block;width:100%;margin-top:6px;padding:9px 12px;border-radius:10px;background:var(--chip);color:var(--fg2);font-size:14px;text-align:left}
.cm-star{font-size:28px;line-height:1;padding:2px 3px;color:var(--line)}
@media(prefers-color-scheme:dark){.cm-star{color:#48484a}}
.cm-star.on{color:#ff9f0a}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.cm-star:active{transform:scale(.9)}
.item.long{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 28px);transform:translateX(-50%);z-index:20;background:rgba(40,40,44,.92);color:#fff;
 padding:10px 18px;border-radius:999px;font-size:15px;pointer-events:none;animation:toast 1.8s ease forwards}
@keyframes toast{0%{opacity:0;transform:translate(-50%,8px)}12%,75%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.loading,.empty{text-align:center;color:var(--fg2);padding:72px 20px;white-space:pre-line}
.empty .big{font-size:44px;margin-bottom:8px}
.spinner{width:28px;height:28px;margin:0 auto 14px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
`;
var SHELL = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<style>${CSS}</style></head><body><div id="root"></div>
<script>
window.__pending=null;
function send(id){var vals={};
  document.querySelectorAll('input[name],select[name],textarea[name]').forEach(function(i){vals[i.name]=i.value;});
  if(window.__pending){var f=window.__pending;window.__pending=null;f(JSON.stringify({id:id,vals:vals,y:window.scrollY}));}}
// 長按 0.5 秒：觸發 data-long，並取消接下來的點擊
var lp=null,lpFired=false,lx=0,ly=0;
document.addEventListener('touchstart',function(e){var el=e.target.closest('[data-long]');lpFired=false;if(!el)return;
  var t=e.touches[0];lx=t.clientX;ly=t.clientY;
  lp=setTimeout(function(){lp=null;lpFired=true;send(el.getAttribute('data-long'));},500);},{passive:true});
document.addEventListener('touchmove',function(e){if(!lp)return;var t=e.touches[0];if(Math.abs(t.clientX-lx)>8||Math.abs(t.clientY-ly)>8){clearTimeout(lp);lp=null;}},{passive:true});
document.addEventListener('touchend',function(){if(lp){clearTimeout(lp);lp=null;}});
document.addEventListener('contextmenu',function(e){if(e.target.closest('[data-long]'))e.preventDefault();});
window.__toast=function(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},1900);};
document.addEventListener('click',function(e){
  if(lpFired){lpFired=false;e.preventDefault();return;}
  var el=e.target.closest('[data-act]');if(!el)return;
  var id=el.getAttribute('data-act');var vals={};
  document.querySelectorAll('input[name],select[name],textarea[name]').forEach(function(i){vals[i.name]=i.value;});
  if(window.__pending){var f=window.__pending;window.__pending=null;f(JSON.stringify({id:id,vals:vals,y:window.scrollY}));}
});
// 捲到指定位置：畫完馬上捲一次，下一個畫面更新時再確認一次（手勢剛結束、或瀏覽器自己想還原位置時，第一次可能被蓋掉）
function scrollKeep(to){window.scrollTo(0,to);if(to>0){var again=function(){if(Math.abs(window.scrollY-to)>2)window.scrollTo(0,to);};
  (window.requestAnimationFrame||setTimeout)(again);setTimeout(again,120);}}
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(_){} // 位置由我們自己還原，瀏覽器不要插手
function stripSync(){var a=document.querySelectorAll('.chips.scroll');for(var i=0;i<a.length;i++){var on=a[i].querySelector('.chip:not(.muted)');if(on)a[i].scrollLeft=Math.max(0,on.offsetLeft-a[i].offsetLeft-(a[i].clientWidth-on.offsetWidth)/2);}}
// 清單底下的「自動載入更多」：快滑到它（還差 900px）就自動觸發一次，不用使用者按
var moreSeen=null;function autoMore(){var el=document.querySelector('.auto-more');if(!el||!window.IntersectionObserver)return;if(moreSeen)moreSeen.disconnect();
  moreSeen=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting&&!es[i].target.dataset.fired){es[i].target.dataset.fired='1';es[i].target.click();}},{rootMargin:'900px 0px'});moreSeen.observe(el);}
// 資料列右邊的內容（發行公司、票房）一行放不下時：字體一點一點縮小到放得下為止（最小 10px；再放不下才換行）
// 清單的片名最多兩行：放不下時字體一點一點縮小到放得下（最小 12px）；還是放不下就放寬到三行
function fitTitles(){var a=document.querySelectorAll('.item:not(.kv) .title');for(var i=0;i<a.length;i++){var el=a[i],size=16;el.style.fontSize='';el.style.webkitLineClamp='';
  if(el.scrollHeight<=el.clientHeight+1)continue;
  while(el.scrollHeight>el.clientHeight+1&&size>12){size-=0.5;el.style.fontSize=size+'px';}
  if(el.scrollHeight>el.clientHeight+1)el.style.webkitLineClamp='3';}}
// 橫向可以滑的那一排（年份、排序）：右邊還有選項時，右緣淡出並顯示一個小小的「›」
function barHints(){var a=document.querySelectorAll('.sortbar .chips');for(var i=0;i<a.length;i++){var el=a[i],p=el.parentNode;
  var more=el.scrollWidth-el.clientWidth-el.scrollLeft>6;if(p&&p.classList)p.classList.toggle('more',more);}}
document.addEventListener('scroll',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('chips'))barHints();},true);
function fitText(){fitTitles();barHints();var a=document.querySelectorAll('.item.kv .right');for(var i=0;i<a.length;i++){var el=a[i],size=14;el.style.fontSize='';el.style.whiteSpace='';
  while(el.scrollWidth>el.clientWidth+1&&size>10){size-=0.5;el.style.fontSize=size+'px';}
  if(el.scrollWidth>el.clientWidth+1){el.style.whiteSpace='normal';el.style.overflow='visible';}}}
setTimeout(autoMore,300);setTimeout(fitText,50);window.addEventListener('resize',fitText);
// 搜尋欄（data-live）：打字停 0.3 秒就送出，結果跟著變，不用按搜尋。輸入法還在選字（注音、拼音）時不送
var liveT=null,composing=false,held=null;
function liveGo(el){clearTimeout(liveT);var go=function(){if(composing||!document.contains(el))return;var id=el.getAttribute('data-live');if(!id)return;
  if(!window.__pending){liveT=setTimeout(go,150);return;} // 上一次的結果還在畫：等一下再送
  send(id);};liveT=setTimeout(go,300);}
function isLive(el){return !!(el&&el.getAttribute&&el.getAttribute('data-live'));}
document.addEventListener('compositionstart',function(){composing=true;});
document.addEventListener('compositionend',function(e){composing=false;if(held){var x=held;held=null;window.__render(x[0],x[1]);}if(isLive(e.target))liveGo(e.target);});
document.addEventListener('input',function(e){if(isLive(e.target)&&!composing)liveGo(e.target);});
function copyAttrs(from,to){var i,a=to.attributes;for(i=a.length-1;i>=0;i--)to.removeAttribute(a[i].name);a=from.attributes;for(i=0;i<a.length;i++)to.setAttribute(a[i].name,a[i].value);}
// 正在搜尋欄裡打字時重畫：搜尋欄和它外面那幾層留在原地（整個換掉的話游標和鍵盤會不見），只換掉周圍的內容
function renderAround(root,cur,html){var box=document.createElement('div');box.innerHTML=html;
  var neu=box.querySelector('input[data-live][name="'+cur.name+'"]');if(!neu)return false;
  var o=cur,m=neu;while(o!==root&&m!==box){if(o.tagName!==m.tagName)return false;o=o.parentNode;m=m.parentNode;}
  if(o!==root||m!==box)return false; // 新舊畫面的層數不一樣：照一般方式整個重畫
  o=cur;m=neu;copyAttrs(m,o);
  while(o!==root){var po=o.parentNode,pm=m.parentNode;
    while(o.previousSibling)po.removeChild(o.previousSibling);while(o.nextSibling)po.removeChild(o.nextSibling);
    while(pm.firstChild!==m)po.insertBefore(pm.firstChild,o);while(m.nextSibling)po.appendChild(m.nextSibling);
    if(po!==root)copyAttrs(pm,po);o=po;m=pm;}
  return true;}
// 畫面上有 data-jump 的元素＝「捲到這裡」：同一個目標只捲一次（之後重畫不會又被拉回去）
var jumped=null;
function jumpTo(){var t=document.querySelector('[data-jump]');if(!t){jumped=null;return;}var k=t.getAttribute('data-jump');if(jumped===k)return;jumped=k;
  setTimeout(function(){var e=document.querySelector('[data-jump="'+k+'"]');if(e)e.scrollIntoView({block:'center',behavior:'smooth'});},120);}
window.__render=function(html,to){var y=window.scrollY,root=document.getElementById('root'),cur=document.activeElement,typing=isLive(cur)&&root.contains(cur);
  if(typing&&composing){held=[html,to];return;} // 還在選字：選完再畫
  var kept=typing&&renderAround(root,cur,html);if(!kept)root.innerHTML=html;
  stripSync();autoMore();fitText();scrollKeep(to<0?y:to);jumpTo();var f=kept?null:document.querySelector('input[autofocus]');if(f)setTimeout(function(){f.focus()},50);syncHist();};
// 從螢幕左緣往右滑：回上一頁（等於點左上角的「返回」）。內容會跟著手指稍微移動，放開時滑得夠遠才算
var sw=null;
function swReset(now){sw=null;var c=document.querySelector('.content');if(c){c.style.transition=now?'none':'transform .15s';c.style.transform='';}}
document.addEventListener('touchstart',function(e){var t=e.touches[0];
  var strip=e.target.closest&&e.target.closest('.chips.scroll'); // 在可左右滑的選項列上、而且還能往回捲：那是捲選項，不是返回
  sw=(e.touches.length===1&&t.clientX<32&&document.querySelector('.back')&&!(strip&&strip.scrollLeft>0))?{x:t.clientX,y:t.clientY,t:Date.now()}:null;},{passive:true});
document.addEventListener('touchmove',function(e){if(!sw)return;var t=e.touches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y;
  if(Math.abs(dy)>60&&Math.abs(dy)>dx){swReset();return;}
  var c=document.querySelector('.content');if(c&&dx>8){c.style.transition='none';c.style.transform='translateX('+Math.min(dx*0.4,70)+'px)';}},{passive:true});
document.addEventListener('touchend',function(e){if(!sw)return;var t=e.changedTouches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y,quick=Date.now()-sw.t<900;
  var go=dx>70&&Math.abs(dy)<70&&quick;swReset(go); // 要返回就立刻歸位（不留動畫），跟直接按「返回」完全一樣
  if(go){var b=document.querySelector('.back');if(b)b.click();}});
document.addEventListener('touchcancel',function(){swReset();});
// 網頁版：讓瀏覽器自己的「上一頁」（Safari 的邊緣右滑、Android 的返回鍵）也是回到 App 裡的上一頁，而不是離開網站。
// 做法：畫面上有「返回」時，在瀏覽紀錄裡墊一筆；瀏覽器往回走到這一筆之前，就替使用者按一次「返回」
var histOn=/^https?:/.test(location.protocol),histGuard=false,histSkip=false;
function syncHist(){if(!histOn||document.querySelector('.loading'))return; // 「讀取中」只是過場，不動瀏覽紀錄
  var has=!!document.querySelector('.back');
  try{if(has&&!histGuard){history.pushState({ms:1},'');histGuard=true;}
      else if(!has&&histGuard){histGuard=false;histSkip=true;history.back();}}catch(_){histOn=false;}}
window.addEventListener('popstate',function(){if(histSkip){histSkip=false;return;}
  if(!histGuard)return;histGuard=false;var b=document.querySelector('.back');if(b)b.click();});
// 有 data-fold 的隱藏按鈕＝「滑動就收合」：畫面上出現之後，使用者滑超過 160px、而且沒有正在打字，就替他點一下（由那一頁決定要收什麼）
var foldY=null;
window.addEventListener('scroll',function(){var b=document.querySelector('[data-fold]');if(!b){foldY=null;return;}if(foldY===null){foldY=window.scrollY;return;}
  var a=document.activeElement;if(a&&/^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName))return;
  if(Math.abs(window.scrollY-foldY)>160){foldY=null;b.click();}},{passive:true});
document.addEventListener('keydown',function(e){if(e.key==='Enter'){if(isLive(e.target)){e.target.blur();return;}var b=document.querySelector('[data-enter]');if(b)b.click();}}); // 搜尋欄按 Enter：收起鍵盤（結果早就出來了）
<\/script></body></html>`;
var UI = class {
  constructor() {
    this.wv = new WebView();
    this.presented = null;
    this.closed = false;
    this.ready = this.wv.loadHTML(SHELL);
  }
  /** 顯示畫面（不等待點擊），用於讀取中。 */
  /** scrollTo：畫完後捲到哪裡。-1 = 停在原位（同一頁重繪，例如切換廣告時間）；0 = 頂端；其他 = 返回時還原的位置 */
  async render(html, scrollTo = 0) {
    await this.ready;
    await this.wv.evaluateJavaScript(`window.__render(${JSON.stringify(html)},${Math.round(scrollTo)});true`, false);
    if (!this.presented) {
      this.presented = this.wv.present(true).then(() => {
        this.closed = true;
      });
    }
  }
  /** 顯示畫面並等待使用者點擊；回傳被點元素註冊的 handler，使用者關閉視窗時回傳 null。 */
  async show(html, scrollTo = 0) {
    await this.render(html, scrollTo);
    const wait = this.wv.evaluateJavaScript(`window.__pending=function(p){completion(p)};true`, true);
    const result = await Promise.race([wait, this.presented.then(() => null)]);
    if (result === null) return null;
    const { id, vals, y } = JSON.parse(String(result));
    const handler = getHandler(String(id));
    return handler ? { handler, vals: vals || {}, y: Number(y) || 0 } : null;
  }
  /** 畫面下方短暫顯示一行提示（例如「已複製地址」） */
  async toast(text) {
    await this.ready;
    await this.wv.evaluateJavaScript(`window.__toast(${JSON.stringify(text)});true`, false);
  }
  /** 每次重繪前清掉舊的 handler。 */
  begin() {
    resetHandlers();
  }
  whenClosed() {
    return this.presented || Promise.resolve();
  }
};

// src/platform-scriptable.ts
function settingsFile() {
  let fm;
  try {
    fm = FileManager.iCloud();
    fm.documentsDirectory();
  } catch (_) {
    fm = FileManager.local();
  }
  const dir = fm.joinPath(fm.documentsDirectory(), "電影行程");
  if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
  return { fm, path: fm.joinPath(dir, "設定.json") };
}
var web = null;
var IMG_PREFIX = "movie-thumb2-";
var OLD_PREFIX = "movie-img-";
var THUMB_W = 300;
var hash = (s) => {
  let h2 = 5381;
  for (let i = 0; i < s.length; i++) h2 = (h2 * 33 ^ s.charCodeAt(i)) >>> 0;
  return h2.toString(16);
};
var imgPath = (url) => {
  const fm = FileManager.local();
  return fm.joinPath(fm.cacheDirectory(), IMG_PREFIX + hash(url) + ".jpg");
};
var imgJobs = {};
var pruned = false;
function pruneImages() {
  if (pruned) return;
  pruned = true;
  try {
    const fm = FileManager.local();
    const dir = fm.cacheDirectory();
    for (const n of fm.listContents(dir)) {
      const p = fm.joinPath(dir, n);
      if (n.startsWith(OLD_PREFIX)) fm.remove(p);
      else if (n.startsWith(IMG_PREFIX) && Date.now() - fm.modificationDate(p).getTime() > 14 * 864e5) fm.remove(p);
    }
  } catch (_) {
  }
}
var isImageB64 = (b64) => /^(\/9j\/|iVBOR|R0lGOD|UklGR)/.test(b64);
var dataUrlMem = {};
function cachedImage(url) {
  if (dataUrlMem[url]) return dataUrlMem[url];
  try {
    const fm = FileManager.local();
    const p = imgPath(url);
    if (!fm.fileExists(p)) return null;
    const b64 = fm.read(p).toBase64String();
    if (!b64 || b64.length < 200 || !isImageB64(b64)) {
      fm.remove(p);
      return null;
    }
    return dataUrlMem[url] = (b64.startsWith("iVBOR") ? "data:image/png;base64," : "data:image/jpeg;base64,") + b64;
  } catch (_) {
    return null;
  }
}
function toThumb(d) {
  try {
    const img = Image.fromData(d);
    if (!img || !img.size.width) return d;
    if (img.size.width <= THUMB_W) return d;
    const w = THUMB_W;
    const h2 = Math.round(img.size.height * w / img.size.width);
    const ctx = new DrawContext();
    ctx.size = new Size(w, h2);
    ctx.respectScreenScale = false;
    ctx.opaque = true;
    ctx.drawImageInRect(img, new Rect(0, 0, w, h2));
    return Data.fromJPEG(ctx.getImage()) || d;
  } catch (_) {
    return d;
  }
}
var scriptablePlatform = {
  async fetchText(url, headers, opts) {
    const r = new Request(url);
    r.headers = headers;
    r.timeoutInterval = 20;
    if (opts?.method) r.method = opts.method;
    if (opts?.body !== void 0) r.body = opts.body;
    const body = await r.loadString();
    return { status: r.response && r.response.statusCode || 200, body };
  },
  async runInWebView(body) {
    if (!web) {
      web = new WebView();
      await web.loadHTML("<html><body></body></html>", "https://twshowtimes.com/");
    }
    return await web.evaluateJavaScript(`(function(){${body}
})()`, false);
  },
  async loadSettingsJSON() {
    try {
      const { fm, path } = settingsFile();
      if (!fm.fileExists(path)) return null;
      await fm.downloadFileFromiCloud(path);
      return fm.readString(path);
    } catch (_) {
      return null;
    }
  },
  saveSettingsJSON(json) {
    try {
      const { fm, path } = settingsFile();
      fm.writeString(path, json);
    } catch (_) {
    }
  },
  cacheGet(name) {
    try {
      const fm = FileManager.local();
      const p = fm.joinPath(fm.cacheDirectory(), "movie-" + name);
      return fm.fileExists(p) ? fm.readString(p) : null;
    } catch (_) {
      return null;
    }
  },
  cacheSet(name, value) {
    try {
      const fm = FileManager.local();
      fm.writeString(fm.joinPath(fm.cacheDirectory(), "movie-" + name), value);
    } catch (_) {
    }
  },
  cachedImage,
  cacheImage(url) {
    return imgJobs[url] ||= (async () => {
      pruneImages();
      const hit = cachedImage(url);
      if (hit) return hit;
      const r = new Request(url);
      r.timeoutInterval = 20;
      const d = await r.load();
      const status = r.response && r.response.statusCode || 200;
      if (status !== 200 || !d) return null;
      const b64 = d.toBase64String();
      if (b64.length < 200 || !isImageB64(b64)) return null;
      const fm = FileManager.local();
      const p = imgPath(url);
      const tmp = p + ".tmp";
      fm.write(tmp, toThumb(d));
      if (fm.fileExists(p)) fm.remove(p);
      fm.move(tmp, p);
      return cachedImage(url);
    })().catch(() => null);
  }
};

// src/changelog.ts
var CHANGELOG = [
  {
    id: "2026-11-24d",
    date: "2026/11/24",
    items: [
      { kind: "new", text: "底部的「通知」變成「社群」：追蹤對象的動態、通知、找人都在這裡（動態和找人從我的片單搬過來）" },
      { kind: "new", text: "有新通知時，主畫面的「片刻」圖示上會顯示數字（要先把片刻加到主畫面並開啟通知）；從背景切回來也會更新紅點" },
      { kind: "better", text: "設定的帳號卡下面可以直接編輯、分享個人檔案" },
      { kind: "new", text: "短評和回覆裡可以 @暱稱 提到別人，對方會收到通知；內文裡的 @暱稱 點了會開那個人的個人頁" },
      { kind: "new", text: "個人檔案可以填 Threads、Instagram、Twitter 帳號，公開個人頁上會多出對應的圖示按鈕" },
      { kind: "new", text: "多了「通知」頁籤（登入後出現）：有人推、回覆你的短評，或追蹤你、回追你，都會列在這裡；可以直接回追" },
      { kind: "new", text: "有開通知的話，有人回覆你的短評或追蹤你時會即時通知（可以在通知設定的「社群」各別關掉；推和噓不會跳通知）" },
      { kind: "new", text: "短評變成討論區：同一部片可以發好幾則，可以回覆別人、推或噓，預設依熱門排序" },
      { kind: "better", text: "個人檔案的頭像可以選表情符號，底色可以自訂任何顏色" },
      { kind: "new", text: "我的片單（設定 → 我的片單，網頁版）：用 Google 登入後，評過分、寫過短評、標記看過的片會集中在一起，換裝置也在" },
      { kind: "new", text: "可以取暱稱、公開個人頁，追蹤別人、看追蹤對象的動態；登入後短評可以寫到 140 字，公開的話旁邊會顯示暱稱" },
      { kind: "new", text: "國賓影城的預售場次也查得到了；只在秀泰或國賓預售、還沒正式上片的電影也會出現在即將上映" },
      { kind: "new", text: "設定裡多了「意見回饋」：選分類、寫內容就能回報問題或建議功能，站長的回覆和處理狀態會顯示在同一頁" },
      { kind: "new", text: "評完分可以寫一句短評（最多 60 字），也能看大家寫的；有雷的會摺疊起來，看到劇透或不當內容可以檢舉" },
      { kind: "new", text: "片刻評分多了心得標籤：評完分可以點選看完的感覺（催淚、配樂、有片尾彩蛋…），不用打字、不會暴雷" },
      { kind: "new", text: "秀泰影城的預售日期和特別場也查得到了（直接讀秀泰官網的完整場次，補上場次通還沒列出的）" },
      { kind: "new", text: "首頁可以直接搜尋：影城、現正上映、即將上映、歷年電影、影展片一起找；可以用空白隔開好幾個字（例如「威秀 台中」），最符合的排最前面" },
      { kind: "new", text: "電影頁多了分享按鈕，朋友點連結會直接開到那部片" },
      { kind: "new", text: "可以用 Google 帳號同步收藏和設定（設定 → 同步）" },
      { kind: "new", text: "通知多一種「收藏影城每週新片」：每週四告訴你收藏的影城這週新上哪些片（預設關閉）" },
      { kind: "better", text: "收藏發行商會標出近 30 天上映的新片" },
      { kind: "new", text: "收藏影城有專門的頁面（設定 → 收藏影城）：可以搜尋，或依縣市展開來收藏" },
      { kind: "new", text: "收藏電影有專門的頁面（設定 → 收藏電影）：上映中、已下檔、影展的片都可以搜尋來收藏" },
      { kind: "new", text: "收藏發行商：有專門的頁面可以搜尋、收藏（設定 → 收藏發行商），首頁就能直接看那一家的片" },
      { kind: "new", text: "通知多了幾種：特殊廳有場次、上映前提醒、收藏影城開始放映、評分出爐、每週新片、影展片單公布，也可以自訂勿擾時段" },
      { kind: "better", text: "番茄和爆米花指數改成三級顯示（認證／及格／不及格），圖示也換新" },
      { kind: "better", text: "「觀眾評分」改名「片刻評分」，評分方式改成一排 1 到 10 分" },
      { kind: "new", text: "已下檔的片、即將上映的片也有劇情簡介和導演、演員了" },
      { kind: "better", text: "重映的片會標「重映」；票房資訊多了「歷次上映」，首映和每次重映的票房分開列、也有合計" },
      { kind: "better", text: "「現在有什麼可以看」的選項重新整理，一頁就看得完" },
      { kind: "better", text: "狀態分成三種：上映中（查得到場次）、少數戲院（查不到場次但還有票房）、已下檔" },
      { kind: "better", text: "歷年電影可以篩選狀態；年份、國別、發行商改成清單選擇" }
    ]
  }
];
var CHANGELOG_LATEST = CHANGELOG.length ? CHANGELOG[0].id : "";

// src/main.tsx
var sleep = (ms) => new Promise((r) => Timer.schedule(ms, false, () => r()));
async function currentCalendar(s) {
  if (s.calendar) {
    try {
      return await Calendar.forEventsByTitle(s.calendar);
    } catch (_) {
    }
  }
  return await Calendar.defaultForEvents();
}
var PERSON_ADD = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="8" r="3.6"/><path d="M3 20a7 7 0 0 1 14 0"/><path d="M19 7v6M16 10h6"/></svg>';
var App = class {
  constructor() {
    this.ui = new UI();
    this.stack = [];
    this.settings = { favorites: [], ads: 10 };
    this.cinemas = [];
    this.calendarName = "";
    // 確認頁可調整的欄位
    this.runtime = 0;
    this.seat = "";
    this.loadingText = "讀取中…";
    // ── 底部分頁：首頁／電影／影城／設定，各自是一個根畫面；點目前的分頁會回到該分頁的根
    this.tab = "home";
    this.unread = 0;
    // 還沒看過的通知有幾筆（頁籤上的紅點）
    this.lastTabTap = { id: "", at: 0 };
    // ── 事件迴圈 ──
    // 背景查 GitHub 上的最新版本（首頁顯示是否為最新版）
    this.latest = this.checkVersion();
    this.latestAt = Date.now();
    this.showAll = [];
    // 搜尋結果裡，哪幾組已經展開成「全部列出」
    this.shutGroups = [];
    // 搜尋結果裡，哪幾組被收合起來（只留標題那一列）
    this.showAllFor = "";
    /** 各種片怎麼找海報：有場次的片、即將上映、已下檔（票房資料）、影展片、收藏的片 */
    this.posterJobOf = {
      movie: (m) => () => moviePoster(m.title, m.slug, m.en),
      soon: (e) => () => e.m ? moviePoster(e.m.title, e.m.slug, e.m.en) : e.u && e.u.poster ? Promise.resolve(e.u.poster) : moviePoster(e.title),
      box: (x) => () => posterLight(x.name, x.release),
      fest: (film) => () => film.poster ? Promise.resolve(film.poster) : moviePoster(film.title),
      fav: (r) => () => {
        const t = r.target;
        if (t.kind === "movie") return moviePoster(t.m.title, t.m.slug, t.m.en);
        if (t.kind === "soon") return t.u.poster ? Promise.resolve(t.u.poster) : moviePoster(t.u.title);
        if (t.kind === "fest") return t.film.poster || r.fav.poster ? Promise.resolve(t.film.poster || r.fav.poster || "") : moviePoster(r.fav.title);
        if (t.kind === "box") return posterLight(t.x.name, t.x.release).then((u) => u || r.fav.poster || "");
        return r.fav.poster ? Promise.resolve(r.fav.poster) : moviePoster(r.fav.title);
      }
    };
    this.favRowsMemo = null;
    this.favQuery = "";
    // 收藏電影頁的搜尋字
    this.favJob = null;
    this.cinemaFavQuery = "";
    // 收藏影城頁的搜尋字
    this.cinemaFavOpen = [];
    this.issuerQuery = "";
    // ── 首頁 ──
    this.homeQuery = "";
    // 首頁的全域搜尋
    this.gsJob = null;
    // ── 設定 ──
    // ── 用 Google 登入同步設定（網頁版）──
    this.syncNote = "";
    // 同步那一組下方的一句話（剛登入、登入失敗…）
    this.syncMute = false;
    // 正在套用伺服器的設定：這次存檔不要再傳回去
    this.syncTimer = null;
    this.meMem = null;
    this.syncWho = null;
    // 這次登入是不是管理員（這次開啟問過一次就記著）
    // ── 我的片單、個人頁、追蹤（只有網頁版；要用 Google 登入）──
    this.diaryTab = "mine";
    // 片單頁看哪一塊：mine 我的片單／feed 動態／people 找人
    this.peopleQ = "";
    // 找人的搜尋字
    this.diaryMem = null;
    // 自己的片單（一分鐘內不重讀）
    this.profileDraft = null;
    /** 編輯個人檔案：暱稱（唯一）、顏色、要不要公開；最下面可以把片單和個人檔案整個刪掉 */
    this.followedAfterLogin = "";
    // 登入前按了誰的「登入後追蹤」（登入完成時填上）
    this.hasProfile = null;
    /** 管理員：帳號管理。被檢舉的、被停用的帳號；可以停用個人頁、清掉檢舉、強制改暱稱 */
    this.adminUserQ = "";
    this.socialTab = "";
    // ── 意見回饋（使用者）──
    this.fbCat = "";
    // 回饋頁選的分類
    this.fbDraft = "";
    // 回饋頁打到一半的內容
    this.fbForce = false;
    // ── 管理員專區：意見回饋、管理員名單 ──
    this.adminFbTab = "open";
    // open 還沒處理完的／all 全部
    this.adminFbStatus = "";
    // 處理某一則時選的狀態
    this.adminFbReply = null;
    this.adminTab = "flagged";
    this.notifyOpen = false;
    // ── 依縣市找影院 ──
    // 搜尋欄直接放在這一頁最上面：有打字就即時顯示符合的影城（不另開一頁），清空就回到縣市清單
    this.query = "";
    /** 讀好後要在原位補畫的資料（海報、評分、預告），每一項各自觸發一次補畫 */
    this.late = [];
    /** 正在補畫：只用已經讀好的資料，不再等 */
    this.rerendering = false;
    this.noteDraft = null;
    // 短評頁輸入框裡還沒送出的字（null = 用已經送出的那一則）
    this.noteSpoil = null;
    // 「可能有雷」有沒有勾（null = 跟已經送出的那一則一樣）
    this.noteAsk = "";
    // 偵測到可能有雷、正在問要不要標記的那句話
    this.noteShown = [];
    // 已經點開的「可能有雷」短評
    this.noteEdit = false;
    // 短評頁上面寫短評的那一塊有沒有展開（預設收起來）
    this.noteFilter = "all";
    // 短評清單的篩選：all 全部／follow 追蹤中／clean 不看有雷的
    this.noteSort = "hot";
    /** 短評頁：上面寫（或改）自己的一句話，下面是大家的。另開一頁，不擠在電影頁。
     *  防雷：輸入框提醒不提劇情、可以自己標「可能有雷」、偵測到劇透字眼送出前問一次；有雷的預設摺疊，點了才顯示。
     *  每則可以檢舉（劇透／不當內容／廣告），被多人檢舉的由伺服器自動摺疊或隱藏 */
    this.noteFocus = null;
    // 從片單、個人頁點某一則短評進來：到討論區後捲到那一則並標亮（用內容對）
    this.noteReplyTo = 0;
    // 正在回覆哪一則（0 = 沒有）
    this.noteReplyDraft = "";
    // 回覆打到一半的字
    this.noteMenu = 0;
    this.rateOpenFor = "";
    this.watchOpenFor = "";
    this.tagsOpenFor = "";
    // ── 依電影找 ──
    this.movieQuery = "";
    this.soonWhen = "";
    // 即將上映的篩選：上映時間（"" 全部、"2w" 兩週內、"2026-12" 某個月）
    this.soonState = "";
    // 場次狀態（"" 全部、"open" 可查場次、"wait" 尚未開放）
    this.soonOpen = "";
    // 目前展開哪一組篩選
    this.soonShut = [];
    // 收合起來的月份
    /** 電影分頁上方的切換：上映中／票房排行 */
    this.movieMode = "box";
    // ── 影展 ──
    this.festId = "";
    // 看哪一個影展（同時有兩個以上時可以切換）
    this.festDate = "";
    // 看哪一天（空 = 今天或影展第一天）
    this.festQuery = "";
    // 影展裡搜尋片名（搜這一年的所有影展）
    this.festTab = "";
    // 看「進行中・即將開始」(live) 還是「已結束」(past)；空的 = 自動
    this.festOpen = "";
    // 目前展開哪一組篩選（年份／狀態／影展；空 = 都收合）
    this.festYear = 0;
    this.boxRate = "";
    // 依評分排時用哪一種評分（空 = IMDb）
    this.pickQuery = "";
    this.boxStatus = "";
    // 歷年電影只看上映中（now）／少數戲院（few）／已下檔（off）；空 = 全部
    this.boxIssuer = [];
    // 只看哪幾家發行商（可以複選；空 = 全部）
    this.boxFewLast = true;
    // 依 IMDb 排時，評分人數少的片排在後面（關掉就照分數一起排）
    this.boxOpen = "";
    // 目前展開哪一組篩選（週次／年份／出品國別；空 = 都收合）
    // 排法與方向：「現正上映」和「歷年電影」兩個頁籤各記各的（空 = 第一種；asc = 反過來排）
    this.sortBy = { now: "", year: "" };
    this.ascBy = { now: false, year: false };
    this.boxYears = [];
    // 年度排行選了哪幾年（空 = 最新的一年）
    this.boxWeek = "";
    // 週票房看哪一週（空 = 最新）
    this.boxCountry = [];
    // 只看哪幾個出品國別（可以複選；空 = 全部）
    this.boxLimit = 100;
    // 年度排行目前顯示幾列
    this.boxPageKey = "";
    // 日期、縣市、特殊廳都可以複選（點一下選、再點一下取消）；換一部片時日期重來
    this.infoOpen = false;
    // 電影頁的票房資訊有沒有展開（預設收合）
    this.movieFor = "";
    this.movieDates = [];
    // 空 = 來源預設的那一天（通常是今天）
    this.movieCities = [];
    // 空 = 全部
    this.movieFormats = [];
    // 空 = 全部
    this.movieFavOnly = false;
    // ── 位置 ──
    this.me = null;
    // ── 現在有什麼可以看 ──
    // 四個條件都可以複選（點一下選、再點一下取消）
    this.nowDates = [];
    // 空 = 今天
    this.nowWins = ["soon"];
    // 空 = 整天
    this.nowScopes = ["fav"];
    // fav / near / 縣市名稱
    this.nowFormats = [];
    this.nowOpen = "";
    this.favIssOpen = false;
    // 首頁的收藏發行商清單有沒有展開
    this.favOpen = false;
    // 首頁的收藏影城清單有沒有展開（預設收合）
    this.favMovOpen = false;
    // 首頁的收藏電影清單有沒有展開（預設收合；從通知點進來時直接展開）
    this.nowFolded = [];
    // 「現在有什麼可以看」結果裡收合起來的片（只留片名列）
    this.nowFoldFor = "";
    // 上面那份收合狀態是哪一次查詢的
    this.nowQuery = "";
  }
  go(view, loading = "讀取中…") {
    this.loadingText = loading;
    this.stack.push(view);
  }
  /** 網頁版多一個「社群」（追蹤對象的動態、通知、找人）；其他版本沒有帳號，不顯示 */
  get TABS() {
    return [
      { id: "home", label: "首頁", icon: "house" },
      { id: "movies", label: "電影", icon: "film" },
      { id: "cinemas", label: "影城", icon: "building" },
      ...this.sync() ? [{ id: "activity", label: "社群", icon: "people" }] : [],
      { id: "settings", label: "設定", icon: "gear" }
    ];
  }
  // 上一次點的是哪個頁籤、什麼時候（用來認「連點兩下」）
  /** 點下面的頁籤。連點同一個兩下（0.6 秒內）＝重新整理：整頁重新載入，資料重抓，有新版也會順便換上，並回到同一個頁籤 */
  tapTab(id) {
    const now = Date.now();
    const twice = false;
    this.lastTabTap = { id, at: now };
    if (twice) {
      const G = globalThis;
      try {
        G.sessionStorage.setItem("ms:reload-tab", id);
      } catch (_) {
      }
      this.ui.toast("重新整理中…").catch(() => void 0);
      G.setTimeout(() => G.location.reload(), 150);
      return;
    }
    this.switchTab(id);
  }
  switchTab(id) {
    this.tab = id;
    if (id === "activity") this.socialTab = "";
    const root = {
      home: [() => this.homeView(), "讀取中…"],
      movies: [() => this.movieListView(), "讀取電影清單…"],
      cinemas: [() => this.citiesView(), "讀取中…"],
      settings: [() => this.settingsView(), "讀取中…"],
      activity: [() => this.activityView(), "讀取中…"]
    };
    const [view, loading] = root[id] || root.home;
    this.loadingText = loading;
    this.stack = [view];
  }
  back() {
    if (this.stack.length > 1) this.stack.pop();
  }
  home() {
    this.stack = [this.stack[0]];
  }
  /** 最新版本是多少。網頁版問的是自己網站現在上線的版本（重新整理就會拿到的那一版），不是 GitHub 上的 */
  checkVersion() {
    if (true) return checkLatest("2026.11.24-2342");
    return (async () => {
      try {
        let r = await globalThis.fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
        if (!r.ok) r = await globalThis.fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
        const latest = String((await r.json()).version || "");
        if (!latest) return null;
        const num = (v) => Number(v.replace(/\D/g, "")) || 0;
        return { latest, isLatest: num("2026.11.24-2342") >= num(latest) };
      } catch (_) {
        return null;
      }
    })();
  }
  async run() {
    this.settings = await loadSettings();
    await this.syncStart().catch(() => void 0);
    if (!settingsStored && this.settings.seenLog === void 0) this.settings.seenLog = CHANGELOG_LATEST;
    setTabBar(() => ({ active: this.tab, items: this.TABS.map((t) => t.id === "settings" && this.logUnread() || t.id === "activity" && this.unread > 0 ? { ...t, dot: true } : t), onTap: (id) => this.tapTab(id) }));
    setBackGuard(() => this.stack.length > 1);
    this.go(() => this.homeView(), "讀取影城清單…");
    const startTab = false ? (/[?&]tab=(soon|fest|activity)\b/.exec(String(globalThis.location?.search || "")) || [])[1] : "";
    if (startTab === "activity") {
      if (this.sync()) {
        this.switchTab("activity");
        this.socialTab = "act";
      }
    } else if (startTab) {
      this.movieMode = startTab;
      this.switchTab("movies");
    }
    if (false) {
      try {
        const G = globalThis;
        const t = G.sessionStorage.getItem("ms:reload-tab");
        if (t) {
          G.sessionStorage.removeItem("ms:reload-tab");
          if (/^(movies|cinemas|settings|activity)$/.test(t)) this.switchTab(t);
        }
      } catch (_) {
      }
    }
    if (signedIn()) this.pushSync();
    const peek = () => {
      if (signedIn()) social("me").then((d) => this.setUnread(d.unread || 0), () => void 0);
      else this.setUnread(0);
    };
    peek();
    if (false) {
      try {
        let last = Date.now();
        const D = globalThis.document;
        D.addEventListener("visibilitychange", () => {
          if (D.visibilityState === "visible" && Date.now() - last > 3e4) {
            last = Date.now();
            peek();
          }
        });
      } catch (_) {
      }
    }
    await this.openShared().catch(() => void 0);
    if (this.followedAfterLogin) {
      const who = this.followedAfterLogin;
      this.switchTab("settings");
      this.go(() => this.profileView(who), "讀取個人頁…");
      this.ui.toast(`已登入，並追蹤了 ${who}`).catch(() => void 0);
      await this.askNickname().catch(() => void 0);
    } else if (this.syncNote) {
      this.switchTab("settings");
      this.go(() => this.syncView());
    }
    loadFestivals().catch(() => []);
    const input = String(args.shortcutParameter || args.urls && args.urls[0] || args.plainTexts && args.plainTexts[0] || "");
    let pendingUrl = input;
    let lastView = null;
    let lastDepth = 0;
    const savedY = /* @__PURE__ */ new Map();
    while (!this.ui.closed) {
      const view = this.stack[this.stack.length - 1];
      const depth = this.stack.length;
      const same = view === lastView;
      const back = !same && depth < lastDepth;
      this.ui.begin();
      const job = foregroundTask(Promise.resolve().then(() => view()));
      job.catch(() => {
      });
      const quick = await Promise.race([job.then(() => true, () => true), sleep(200).then(() => false)]);
      if (!quick) await this.ui.render(/* @__PURE__ */ h(Page, { title: "片刻" }, /* @__PURE__ */ h(Loading, { text: this.loadingText })));
      this.loadingText = "讀取中…";
      let html;
      try {
        html = await job;
        if (pendingUrl) {
          const u = pendingUrl;
          pendingUrl = "";
          if (this.startFrom(u)) continue;
        }
      } catch (e) {
        html = this.errorView(e);
      }
      const scrollTo = same && quick ? -1 : same || back ? savedY.get(view) ?? 0 : 0;
      lastView = view;
      lastDepth = depth;
      const late = this.late;
      this.late = [];
      let clicked = false;
      let painting = null;
      const repaint = async () => {
        if (clicked || this.ui.closed || this.stack[this.stack.length - 1] !== view) return;
        if (painting) return painting.then(repaint);
        painting = (async () => {
          this.rerendering = true;
          const again = await Promise.resolve(view()).catch(() => "");
          this.rerendering = false;
          this.late = [];
          if (again && !clicked && this.stack[this.stack.length - 1] === view) await this.ui.render(again, -1).catch(() => {
          });
        })();
        await painting;
        painting = null;
      };
      for (const p of late) p.then(repaint, repaint);
      const hit = await this.ui.show(html, scrollTo);
      clicked = true;
      if (!hit) break;
      savedY.set(view, hit.y);
      try {
        await hit.handler.call(null, hit.vals);
      } catch (e) {
        this.go(() => this.errorView(e));
      }
    }
    await this.ui.whenClosed();
  }
  errorView(e) {
    const msg = String(e?.message || e);
    return /* @__PURE__ */ h(Page, { title: "出了點問題", onBack: () => this.back() }, /* @__PURE__ */ h(Empty, { icon: "⚠️", text: msg }), /* @__PURE__ */ h(Button, { label: "重試", onTap: () => {
    } }), /* @__PURE__ */ h(Button, { label: "回首頁", kind: "secondary", onTap: () => this.home() }));
  }
  // 上面兩份是哪一頁、哪個搜尋字的（換了就重來）
  /** 搜尋結果的每一組：
   *  - head：標題那一列（名稱＋筆數），點一下收合／展開這一組
   *  - lim：這一組先列前幾筆；more：超過的給一列「顯示全部 N 部」，點了在原地全部列出，再點收回去
   *  換了搜尋字就全部恢復原狀 */
  showAllOf(scope, max) {
    if (this.showAllFor !== scope) {
      this.showAllFor = scope;
      this.showAll = [];
      this.shutGroups = [];
    }
    const open = (id) => this.showAll.indexOf(id) >= 0;
    const shut = (id) => this.shutGroups.indexOf(id) >= 0;
    return {
      shut,
      lim: (id) => shut(id) ? 0 : open(id) ? Infinity : max,
      more: (id, n, unit) => !shut(id) && n > max ? /* @__PURE__ */ h(Item, { title: open(id) ? `只顯示前 ${max} ${unit}` : `顯示全部 ${n} ${unit}`, right: open(id) ? "▴" : "▾", accent: true, chevron: false, onTap: () => {
        this.showAll = open(id) ? this.showAll.filter((x) => x !== id) : [...this.showAll, id];
      } }) : null,
      head: (id, title) => /* @__PURE__ */ h(Item, { kv: true, title, right: shut(id) ? "展開 ▸" : "收合 ▾", chevron: false, onTap: () => {
        this.shutGroups = shut(id) ? this.shutGroups.filter((x) => x !== id) : [...this.shutGroups, id];
      } })
    };
  }
  /** 「最符合」那一塊：名稱跟搜尋字完全一樣的，不分類別放在最上面；每一列標出它是哪一類。heart = 收藏電影頁用的愛心 */
  bestRows(hits, heart) {
    return hits.best.map((b) => {
      if (b.kind === "cinema") return heart ? "" : /* @__PURE__ */ h(Item, { icon: "🎦", title: b.c.name, subtitle: `影城｜${b.c.city} ${b.c.district}`, onTap: () => this.go(() => this.cinemaView(b.c), `讀取 ${b.c.name} 的場次…`) });
      if (b.kind === "now") return /* @__PURE__ */ h(Item, { title: b.m.title, subtitle: ["現正上映", movieLines(b.m)[0]].filter(Boolean).join("｜"), tag: { text: "上映中", tone: "now" }, onTap: () => this.go(() => this.movieView(b.m, ""), `讀取《${b.m.title}》的放映影城…`), action: heart ? heart(b.m.title, { en: b.m.en }) : void 0 });
      if (b.kind === "soon") {
        const e = b.e;
        return /* @__PURE__ */ h(Item, { title: e.title, subtitle: ["即將上映", e.lines[0]].filter(Boolean).join("｜"), onTap: e.m ? () => this.go(() => this.movieView(e.m, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u), `讀取《${e.title}》…`) : void 0, action: heart ? heart(e.title, { en: e.m ? e.m.en : e.u ? e.u.en : "", poster: e.u ? e.u.poster : void 0 }) : void 0 });
      }
      if (b.kind === "year") {
        const x = b.x;
        return /* @__PURE__ */ h(Item, { title: x.name, subtitle: [boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜"), tag: { text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }, onTap: () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`), action: heart ? heart(x.name) : void 0 });
      }
      return /* @__PURE__ */ h(Item, { title: b.film.title, subtitle: `影展｜${b.f.start.slice(0, 4)} ${b.f.name}`, onTap: () => this.go(() => this.festivalFilmView(b.f, b.film)), action: heart ? heart(b.film.title, { poster: b.film.poster, fest: { id: b.f.id, film: b.film.id, name: b.f.name } }) : void 0 });
    }).filter(Boolean);
  }
  /** 搜尋結果最上面的兩塊：「最符合」（可以收合），以及照原本的字找不到時的說明 */
  searchTop(hits, q, tools, heart) {
    const rows = this.bestRows(hits, heart);
    return /* @__PURE__ */ h(Fragment, null, hits.loose ? /* @__PURE__ */ h(Note, { text: `找不到完全符合「${q}」的結果，你是不是要找下面這些？` }) : null, rows.length ? /* @__PURE__ */ h(Section, null, tools.head("best", `最符合（${rows.length}）`), tools.shut("best") ? null : rows) : null);
  }
  /** 清單的小海報：跟「依電影找場次」的清單同一套做法、同一份海報快取。
   *  手機上記過的立刻有；沒記過的最多等一下（wait 毫秒），其餘讀好後每 8 張在原位補畫一次。
   *  傳進來每一列的鍵和「怎麼找這張海報」，回傳一個用鍵取縮圖的函式 */
  async listThumbs(items, wait = 600) {
    const jobs = items.map((x) => {
      try {
        return x.job().catch(() => "");
      } catch (_) {
        return Promise.resolve("");
      }
    });
    const got = await Promise.all(jobs.map((j) => Promise.race([j, sleep(this.rerendering ? 0 : wait).then(() => void 0)])));
    const pending = jobs.filter((_, i) => got[i] === void 0);
    const batches = [];
    for (let i = 0; i < pending.length; i += 8) batches.push(Promise.all(pending.slice(i, i + 8)));
    if (batches.length) this.late = [...this.late || [], ...batches];
    const map = /* @__PURE__ */ new Map();
    items.forEach((x, i) => map.set(x.key, got[i]));
    return (key) => {
      if (!map.has(key)) return void 0;
      const u = map.get(key);
      if (u === void 0) return { src: "", pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      return { src, url: u };
    };
  }
  /** 收藏了哪些片（片名鍵＋影展）：清單有增減，這串字就不一樣 */
  favSig() {
    return (this.settings.favMovies || []).map((f) => f.key + (f.fest ? "@" + f.fest.id : "")).join(",");
  }
  /** 收藏的每部片現在的狀態：同一份收藏清單 5 分鐘內只查一次（首頁展開、返回、收藏電影頁都共用） */
  favRowsJob() {
    const sig = this.favSig();
    const m = this.favRowsMemo;
    if (m && m.sig === sig && Date.now() - m.at < 5 * 6e4) return m.job;
    const job = favMovieRows(this.settings).catch(() => []);
    this.favRowsMemo = { sig, at: Date.now(), job };
    return job;
  }
  /** 收藏電影頁：管理收藏電影的地方。上面是已經收藏的（含現在的狀態）；
   *  搜尋會把全部的電影一起找：上映中、即將上映、已下檔（2016 年至今）、影展片（含往年）。
   *  點片名進那部片的頁面；點右邊的愛心收藏或取消 */
  async favManageView() {
    const favs = this.settings.favMovies || [];
    const q = this.favQuery.trim();
    const heart = (title, extra) => {
      const on = isFavMovie(this.settings, title);
      return { label: on ? "♥" : "♡", hint: on ? "取消收藏" : "收藏這部電影", onTap: () => {
        toggleFavMovie(this.settings, { title, ...extra || {} });
        saveSettings(this.settings);
        this.pushSync();
      } };
    };
    const MAX = 20;
    const tools = this.showAllOf("fav|" + q, MAX);
    const { lim, more, head } = tools;
    let body;
    if (q) {
      if (!this.favJob || this.favJob.q !== q) this.favJob = { q, job: globalSearch(q, []) };
      const job = this.favJob.job;
      const hits = await Promise.race([job, sleep(this.rerendering ? 0 : 150).then(() => null)]);
      if (!hits) this.late = [job];
      const total = hits ? hits.now.length + hits.soon.length + hits.year.length + hits.fest.length : 0;
      const thumb = hits ? await this.listThumbs([
        ...hits.now.slice(0, lim("now")).map((m) => ({ key: "now|" + m.slug, job: this.posterJobOf.movie(m) })),
        ...hits.soon.slice(0, lim("soon")).map((e) => ({ key: "soon|" + e.key, job: this.posterJobOf.soon(e) })),
        ...hits.year.slice(0, lim("year")).map((x) => ({ key: "year|" + x.name + "|" + x.release, job: this.posterJobOf.box(x) })),
        ...hits.fest.slice(0, lim("fest")).map(({ f, film }) => ({ key: "fest|" + f.id + "|" + film.id, job: this.posterJobOf.fest(film) }))
      ], 300) : () => void 0;
      body = !hits ? /* @__PURE__ */ h(Note, { text: "正在找電影…" }) : /* @__PURE__ */ h(Fragment, null, this.searchTop(hits, q, tools, heart), hits.now.length ? /* @__PURE__ */ h(Section, null, head("now", `現正上映（${hits.now.length}）`), hits.now.slice(0, lim("now")).map((m) => /* @__PURE__ */ h(Item, { thumb: thumb("now|" + m.slug), title: m.title, subtitle: movieLines(m).filter(Boolean).join("\n"), tag: { text: "上映中", tone: "now" }, onTap: () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`), action: heart(m.title, { en: m.en }) })), more("now", hits.now.length, "部")) : null, hits.soon.length ? /* @__PURE__ */ h(Section, null, head("soon", `即將上映（${hits.soon.length}）`), hits.soon.slice(0, lim("soon")).map((e) => /* @__PURE__ */ h(Item, { thumb: thumb("soon|" + e.key), title: e.title, subtitle: e.lines.filter(Boolean).join("\n"), onTap: e.m ? () => this.go(() => this.movieView(e.m, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u), `讀取《${e.title}》…`) : void 0, action: heart(e.title, { en: e.m ? e.m.en : e.u ? e.u.en : "", poster: e.u ? e.u.poster : void 0 }) })), more("soon", hits.soon.length, "部")) : null, hits.year.length ? /* @__PURE__ */ h(Section, null, head("year", `已下檔（${hits.year.length}）`), hits.year.slice(0, lim("year")).map((x) => /* @__PURE__ */ h(Item, { thumb: thumb("year|" + x.name + "|" + x.release), title: x.name, subtitle: [boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜"), tag: { text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }, onTap: () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`), action: heart(x.name) })), more("year", hits.year.length, "部")) : null, hits.fest.length ? /* @__PURE__ */ h(Section, null, head("fest", `影展（${hits.fest.length}）`), hits.fest.slice(0, lim("fest")).map(({ f, film }) => /* @__PURE__ */ h(Item, { thumb: thumb("fest|" + f.id + "|" + film.id), title: film.title, subtitle: `${f.start.slice(0, 4)} ${f.name}`, onTap: () => this.go(() => this.festivalFilmView(f, film)), action: heart(film.title, { poster: film.poster, fest: { id: f.id, film: film.id, name: f.name } }) })), more("fest", hits.fest.length, "部")) : null, total ? null : /* @__PURE__ */ h(Empty, { icon: "🔎", text: "找不到相符的電影，換個關鍵字試試。" }));
    } else {
      const rows = favs.length ? await this.favRowsJob() : [];
      const movies = (await loadMovies().catch(() => [])).filter((m) => !m.comingSoon);
      const thumb = await this.listThumbs([
        ...rows.map((r) => ({ key: "fav|" + r.fav.key, job: this.posterJobOf.fav(r) })),
        ...movies.slice(0, 40).map((m) => ({ key: "now|" + m.slug, job: this.posterJobOf.movie(m) }))
      ]);
      body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Section, { title: `已收藏（${favs.length}）`, hint: favs.length ? "點片名進那部片的頁面；點 ♥ 取消收藏。下檔的片也會留在這裡。" : "還沒有收藏。用上面的搜尋找電影，或在下面的清單點 ♡。" }, rows.map((r) => /* @__PURE__ */ h(Item, { thumb: thumb("fav|" + r.fav.key), title: r.fav.title, subtitle: r.line, onTap: () => this.openFavRow(r), action: heart(r.fav.title) }))), /* @__PURE__ */ h(Section, { title: `現正上映（${movies.length}）`, hint: "已下檔的片、即將上映的片、影展片，用上面的搜尋找。" }, movies.slice(0, 40).map((m) => /* @__PURE__ */ h(Item, { thumb: thumb("now|" + m.slug), title: m.title, subtitle: movieLines(m)[0], onTap: () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`), action: heart(m.title, { en: m.en }) }))));
    }
    return /* @__PURE__ */ h(Page, { title: "收藏電影", subtitle: favs.length ? `已收藏 ${favs.length} 部` : "上映中、即將上映、已下檔、影展都找得到", onBack: () => this.back() }, /* @__PURE__ */ h(Search, { value: this.favQuery, placeholder: "搜尋全部的電影（含已下檔、影展片）", onInput: (t) => {
      this.favQuery = t;
    } }), body);
  }
  // 收藏影城頁裡展開的縣市（預設全部收合，點了才展開）
  /** 收藏影城頁：管理收藏影城的地方。上面是已經收藏的；下面是全台的影城，依縣市分組（點縣市展開），可以搜尋。
   *  點名稱進那間影城；點右邊的星號收藏或取消 */
  async cinemaManageView() {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    const ids = this.settings.favorites;
    const isFav = (c) => ids.indexOf(c.id) >= 0;
    const row = (c) => /* @__PURE__ */ h(Item, { icon: "🎦", title: c.name, subtitle: `${c.city} ${c.district}`, onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`), action: { label: isFav(c) ? "★" : "☆", hint: isFav(c) ? "取消收藏這間影城" : "收藏這間影城", onTap: () => this.toggleFav(c) } });
    const favs = ids.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean);
    const gone = ids.filter((id) => !this.cinemas.some((c) => c.id === id));
    const k = this.cinemaFavQuery.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : [];
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99));
    const open = (city) => this.cinemaFavOpen.indexOf(city) >= 0;
    return /* @__PURE__ */ h(Page, { title: "收藏影城", subtitle: ids.length ? `已收藏 ${ids.length} 間` : `全台 ${this.cinemas.length} 間影城`, onBack: () => this.back() }, /* @__PURE__ */ h(Search, { value: this.cinemaFavQuery, placeholder: "搜尋影城，例如：松仁、西門、in89、台南", onInput: (t) => {
      this.cinemaFavQuery = t;
    } }), k ? /* @__PURE__ */ h(Section, { title: `符合「${this.cinemaFavQuery.trim()}」的 ${hits.length} 間` }, hits.map(row), hits.length ? null : /* @__PURE__ */ h(Note, { text: "找不到相符的影城，換個關鍵字試試。" })) : /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Section, { title: `已收藏（${ids.length}）`, hint: ids.length ? "點名稱進那間影城；點 ★ 取消收藏。" : "還沒有收藏。用上面的搜尋找影城，或展開下面的縣市點 ☆。" }, favs.map(row), gone.map((id) => /* @__PURE__ */ h(Item, { icon: "⚠️", title: id, subtitle: "這間影城已經不在清單上（可能歇業或改名）", chevron: false, action: { label: "移除", hint: "從收藏拿掉", onTap: () => {
      this.settings.favorites = ids.filter((z) => z !== id);
      saveSettings(this.settings);
      this.pushSync();
    } } }))), /* @__PURE__ */ h(Section, { title: "全台影城", hint: "點縣市展開，再點 ☆ 收藏。" }, cities.map((city) => {
      const list = this.cinemas.filter((c) => c.city === city);
      const n = list.filter(isFav).length;
      return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Item, { kv: true, title: city, right: `${n ? `已收藏 ${n}｜` : ""}${list.length} 間 ${open(city) ? "▾" : "▸"}`, chevron: false, onTap: () => {
        this.cinemaFavOpen = open(city) ? this.cinemaFavOpen.filter((x) => x !== city) : [...this.cinemaFavOpen, city];
      } }), open(city) ? list.map(row) : null);
    }))));
  }
  // 發行商頁的搜尋字
  /** 開某一家發行商歷年發行的片：歷年電影、全部年份、只看這一家、新的在前 */
  openIssuer(id) {
    this.movieMode = "year";
    this.boxYears = Array.from({ length: (/* @__PURE__ */ new Date()).getFullYear() - 2014 }, (_, i) => String(2016 + i));
    this.boxIssuer = [id];
    this.boxCountry = [];
    this.boxStatus = "";
    this.movieQuery = "";
    this.sortBy.year = "date";
    this.ascBy.year = false;
    this.go(() => this.movieListView(), `讀取${id}發行的片…`);
  }
  /** 發行商頁：管理收藏發行商的地方。上面是已經收藏的，下面是全部的發行商（2016 年至今、依發行的片數排），可以搜尋。
   *  點名稱看那一家歷年發行的片；點右邊的星號收藏或取消 */
  async issuerManageView() {
    const allYears = Array.from({ length: (/* @__PURE__ */ new Date()).getFullYear() - 2014 }, (_, i) => String(2016 + i));
    const board = await loadMovieBoard({ scope: "year", sort: "total", years: allYears });
    const favs = this.settings.favIssuers || [];
    const isFav = (id) => favs.indexOf(id) >= 0;
    const toggle = (id) => {
      this.settings.favIssuers = isFav(id) ? favs.filter((z) => z !== id) : [...favs, id];
      saveSettings(this.settings);
    };
    const count = {};
    for (const c of board.issuers) count[c.id] = c.count;
    const k = this.issuerQuery.trim().toLowerCase();
    const list = board.issuers.filter((c) => !k || c.id.toLowerCase().includes(k)).sort((a, b) => b.count - a.count);
    const MAX = 60;
    const shown = k ? list : list.slice(0, MAX);
    const recent = issuerRecent(await loadBoxOfficeFull().catch(() => null), board.issuers.map((c) => c.id));
    const row = (id) => /* @__PURE__ */ h(Item, { icon: "🏢", title: id, subtitle: [count[id] ? `2016 年至今發行 ${count[id]} 部` : "目前的資料裡沒有它發行的片", (recent[id] || []).length ? `近 30 天新片 ${recent[id].length} 部` : ""].filter(Boolean).join("｜"), onTap: () => this.openIssuer(id), action: { label: isFav(id) ? "★" : "☆", hint: isFav(id) ? "取消收藏這家發行商" : "收藏這家發行商", onTap: () => toggle(id) } });
    return /* @__PURE__ */ h(Page, { title: "收藏發行商", subtitle: favs.length ? `已收藏 ${favs.length} 家` : `共 ${board.issuers.length} 家發行商`, onBack: () => this.back() }, /* @__PURE__ */ h(Search, { value: this.issuerQuery, placeholder: `搜尋發行商（共 ${board.issuers.length} 家）`, onInput: (t) => {
      this.issuerQuery = t;
    } }), k ? null : /* @__PURE__ */ h(Section, { title: `已收藏（${favs.length}）`, hint: favs.length ? "點名稱看它歷年發行的片；點 ★ 取消收藏。" : "還沒有收藏。在下面的清單點 ☆ 就可以收藏，收藏的會出現在首頁。" }, favs.map(row)), /* @__PURE__ */ h(Section, { title: k ? `符合「${this.issuerQuery.trim()}」的 ${list.length} 家` : `發行最多片的 ${shown.length} 家`, hint: k ? "" : list.length > MAX ? `其餘 ${list.length - MAX} 家可以用上面的搜尋找。發行商來自官方票房資料；聯合發行的片算第一家。` : "發行商來自官方票房資料；聯合發行的片算第一家。" }, shown.map((c) => row(c.id)), shown.length ? null : /* @__PURE__ */ h(Note, { text: "找不到相符的發行商，換個關鍵字試試。" })));
  }
  /** 清單裡的搜尋只找目前這一類：下面放一列，直接帶到首頁的全域搜尋（電影、影城一起找） */
  searchAllLink(q) {
    return /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🔎", title: `在全部電影和影城裡找「${q}」`, subtitle: "現正上映、即將上映、歷年電影、影展、影城一起找", accent: true, onTap: () => {
      this.homeQuery = q;
      this.switchTab("home");
    } }));
  }
  // 目前這個搜尋字的結果（重畫時不用再找一次）
  async homeView() {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    this.calendarName = (await currentCalendar(this.settings)).title;
    const favs = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean);
    const favMovies = this.settings.favMovies || [];
    const favIssuers = this.settings.favIssuers || [];
    const favJob = this.favMovOpen && favMovies.length ? this.favRowsJob() : null;
    const favGot = favJob ? await Promise.race([favJob, sleep(this.rerendering ? 0 : 150).then(() => null)]) : [];
    const favSnap = favJob && !favGot ? favSnapGet(this.favSig()) : null;
    if (favJob && !favGot) this.late = [...this.late || [], favJob];
    const favRows = favGot || [];
    const openFav = (r) => this.openFavRow(r);
    const issJob = this.favIssOpen && favIssuers.length ? loadBoxOfficeFull().catch(() => null) : null;
    const issBox = issJob ? await Promise.race([issJob, sleep(this.rerendering ? 0 : 300).then(() => void 0)]) : null;
    if (issJob && issBox === void 0) this.late = [...this.late || [], issJob];
    const issRecent = issuerRecent(issBox || null, favIssuers);
    const favThumb = await this.listThumbs(favRows.map((r) => ({ key: r.fav.key, job: this.posterJobOf.fav(r) })), 200);
    if (favGot && favRows.length) favSnapSet(this.favSig(), favRows.map((r) => ({ key: r.fav.key, kind: r.kind, line: r.line, poster: (favThumb(r.fav.key) || {}).url || r.fav.poster || "" })));
    const openSnap = async (key) => {
      const row = (await favJob || []).find((r) => r.fav.key === key);
      if (row) this.openFavRow(row);
    };
    const q = this.homeQuery.trim();
    if (q) {
      if (!this.gsJob || this.gsJob.q !== q) this.gsJob = { q, job: globalSearch(q, this.cinemas) };
      const gs = this.gsJob.job;
      const got = await Promise.race([gs, sleep(this.rerendering ? 0 : 150).then(() => null)]);
      const pendingGs = !got;
      if (pendingGs) this.late = [gs];
      const k0 = q.toLowerCase().replace(/臺/g, "台");
      const hits = got || { cinemas: this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k0)), now: [], soon: [], year: [], fest: [], best: [], loose: false };
      const total = hits.cinemas.length + hits.now.length + hits.soon.length + hits.year.length + hits.fest.length;
      const MAX = 5;
      const tools = this.showAllOf("home|" + q, MAX);
      const { lim, more, head } = tools;
      return /* @__PURE__ */ h(Page, { title: "🎬 片刻", subtitle: pendingGs ? `正在找「${q}」…` : `「${q}」找到 ${total} 筆` }, /* @__PURE__ */ h(Search, { value: this.homeQuery, placeholder: "搜尋電影、影城（可以用空白隔開好幾個字）", onInput: (t) => {
        this.homeQuery = t;
      } }), pendingGs ? null : this.searchTop(hits, q, tools), hits.cinemas.length ? /* @__PURE__ */ h(Section, null, head("cinemas", `影城（${hits.cinemas.length}）`), hits.cinemas.slice(0, lim("cinemas")).map((c) => this.cinemaItem(c)), more("cinemas", hits.cinemas.length, "間")) : null, hits.now.length ? /* @__PURE__ */ h(Section, null, head("now", `現正上映（${hits.now.length}）`), hits.now.slice(0, lim("now")).map((m) => /* @__PURE__ */ h(Item, { title: m.title, subtitle: movieLines(m).filter(Boolean).join("\n"), tag: { text: "上映中", tone: "now" }, onTap: () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) })), more("now", hits.now.length, "部")) : null, hits.soon.length ? /* @__PURE__ */ h(Section, null, head("soon", `即將上映（${hits.soon.length}）`), hits.soon.slice(0, lim("soon")).map((e) => /* @__PURE__ */ h(Item, { title: e.title, subtitle: e.lines.filter(Boolean).join("\n"), onTap: e.m ? () => this.go(() => this.movieView(e.m, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u), `讀取《${e.title}》…`) : void 0 })), more("soon", hits.soon.length, "部")) : null, hits.year.length ? /* @__PURE__ */ h(Section, null, head("year", `歷年電影（${hits.year.length}）`), hits.year.slice(0, lim("year")).map((x) => /* @__PURE__ */ h(Item, { title: x.name, subtitle: [boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜"), tag: { text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }, onTap: () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`) })), more("year", hits.year.length, "部")) : null, hits.fest.length ? /* @__PURE__ */ h(Section, null, head("fest", `影展（${hits.fest.length}）`), hits.fest.slice(0, lim("fest")).map(({ f, film }) => /* @__PURE__ */ h(Item, { title: film.title, subtitle: `${f.start.slice(0, 4)} ${f.name}`, onTap: () => this.go(() => this.festivalFilmView(f, film)) })), more("fest", hits.fest.length, "部")) : null, pendingGs ? /* @__PURE__ */ h(Note, { text: "正在找電影…" }) : total ? null : /* @__PURE__ */ h(Empty, { icon: "🔎", text: "找不到相符的電影或影城，換個關鍵字試試。" }));
    }
    return /* @__PURE__ */ h(Page, { title: "🎬 片刻", subtitle: `全台 ${this.cinemas.length} 間影城場次一次查` }, /* @__PURE__ */ h(Search, { value: this.homeQuery, placeholder: "搜尋電影、影城（可以用空白隔開好幾個字）", onInput: (t) => {
      this.homeQuery = t;
    } }), /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🕘", title: "現在有什麼可以看", subtitle: "依時段找收藏、附近或各縣市的場次", onTap: () => this.go(() => this.nowView()) }), /* @__PURE__ */ h(Item, { icon: "🎞️", title: "依電影找場次", subtitle: "先選電影，再看哪些影城有放映", onTap: () => this.go(() => this.movieListView(), "讀取電影清單…") }), /* @__PURE__ */ h(Item, { icon: "🧭", title: "附近的影城", subtitle: "依目前位置排序", onTap: () => this.go(() => this.nearbyView(), "取得目前位置…") }), /* @__PURE__ */ h(Item, { icon: "🎦", title: "依縣市找影院", subtitle: `全台 ${this.cinemas.length} 間，也可以搜尋影城`, onTap: () => this.go(() => this.citiesView()) })), /* @__PURE__ */ h(Section, { hint: this.favOpen && favs.length ? "在影城頁可以收藏或取消收藏影城。" : "" }, /* @__PURE__ */ h(Item, { head: true, icon: "★", title: favs.length ? `收藏影城（${favs.length} 間）` : "收藏影城（還沒有）", subtitle: this.favOpen ? "點一下收合" : "點一下展開", chevron: false, onTap: () => {
      this.favOpen = !this.favOpen;
    }, action: { label: this.favOpen ? "▾" : "▸", hint: this.favOpen ? "收合收藏影城" : "展開收藏影城", onTap: () => {
      this.favOpen = !this.favOpen;
    } } }), (this.favOpen ? favs : []).map((c) => /* @__PURE__ */ h(Item, { icon: "★", title: c.name, subtitle: `${c.city} ${c.district}`, onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`) })), this.favOpen ? /* @__PURE__ */ h(Item, { icon: favs.length ? "⚙️" : "👉", title: favs.length ? "管理收藏影城" : "去找影城來收藏", subtitle: favs.length ? "增加、取消收藏，或搜尋其他影城" : "搜尋或從各縣市的清單裡點星號（☆ 變 ★）。收藏後可以從這裡直接進那間影城。", accent: true, onTap: () => {
      this.cinemaFavQuery = "";
      this.go(() => this.cinemaManageView());
    } }) : null), /* @__PURE__ */ h(Section, { hint: this.favIssOpen && favIssuers.length ? "點發行商看它歷年發行的片（新的在前）。要增減收藏：到「歷年電影」的發行商選單點星號。" : "" }, /* @__PURE__ */ h(Item, { head: true, icon: "★", title: favIssuers.length ? `收藏發行商（${favIssuers.length} 家）` : "收藏發行商（還沒有）", subtitle: this.favIssOpen ? "點一下收合" : "點一下展開", chevron: false, onTap: () => {
      this.favIssOpen = !this.favIssOpen;
    } }), this.favIssOpen ? favIssuers.map((id) => /* @__PURE__ */ h(Item, { icon: "🏢", title: id, subtitle: (issRecent[id] || []).length ? `近 30 天上映：${issRecent[id].slice(0, 2).map((x) => x.name).join("、")}${issRecent[id].length > 2 ? `等 ${issRecent[id].length} 部` : ""}` : "", right: (issRecent[id] || []).length ? `新片 ${issRecent[id].length}` : "", onTap: () => this.openIssuer(id) })) : null, this.favIssOpen ? /* @__PURE__ */ h(Item, { icon: favIssuers.length ? "⚙️" : "👉", title: favIssuers.length ? "管理收藏發行商" : "去選發行商來收藏", subtitle: favIssuers.length ? "增加、取消收藏，或搜尋其他發行商" : "搜尋或從清單裡點星號（☆ 變 ★）。收藏後可以從這裡看它歷年發行的片。", accent: true, onTap: () => {
      this.issuerQuery = "";
      this.go(() => this.issuerManageView(), "讀取發行商…");
    } }) : null), /* @__PURE__ */ h(Section, { hint: this.favMovOpen && favMovies.length ? "在電影頁的預告按鈕旁邊點愛心加入，再點一次取消。下檔的片也會留在這裡。" : "" }, /* @__PURE__ */ h(Item, { head: true, icon: "♥", title: favMovies.length ? `收藏電影（${favMovies.length} 部）` : "收藏電影（還沒有）", subtitle: this.favMovOpen ? "點一下收合" : "點一下展開", chevron: false, onTap: () => {
      this.favMovOpen = !this.favMovOpen;
    }, action: { label: this.favMovOpen ? "▾" : "▸", hint: this.favMovOpen ? "收合收藏電影" : "展開收藏電影", onTap: () => {
      this.favMovOpen = !this.favMovOpen;
    } } }), favRows.map((r) => /* @__PURE__ */ h(Item, { thumb: favThumb(r.fav.key), title: r.fav.title, subtitle: r.line, onTap: () => openFav(r) })), this.favMovOpen && !favGot && favJob ? favSnap ? favMovies.map((f) => {
      const sn = favSnap.find((x) => x.key === f.key);
      const u = sn && sn.poster || f.poster || "";
      return /* @__PURE__ */ h(Item, { thumb: { src: u ? posterSrc(u) : "", url: u || void 0 }, title: f.title, subtitle: sn ? sn.line : "讀取中…", onTap: () => openSnap(f.key) });
    }) : favMovies.map((f) => /* @__PURE__ */ h(Item, { thumb: { src: f.poster ? posterSrc(f.poster) : "", url: f.poster, pending: !f.poster }, title: f.title, subtitle: "讀取中…", onTap: () => openSnap(f.key) })) : null, this.favMovOpen ? /* @__PURE__ */ h(Item, { icon: favMovies.length ? "⚙️" : "👉", title: favMovies.length ? "管理收藏電影" : "去找電影來收藏", subtitle: favMovies.length ? "搜尋其他電影來收藏，或取消收藏" : "上映中、即將上映、已下檔、影展的片都找得到，點愛心（♡ 變 ♥）就收藏。", accent: true, onTap: () => {
      this.favQuery = "";
      this.go(() => this.favManageView(), "讀取電影…");
    } }) : null), this.installEntry(), await this.versionNote());
  }
  sync() {
    return false ? globalThis.__sync : null;
  }
  /** 開啟時：剛從 Google 登入回來就把兩邊的設定合起來；已經登入的話，伺服器上的比較新就套用過來。之後每次存設定都自動上傳 */
  async syncStart() {
    const sy = this.sync();
    if (!sy) return;
    setSiteBase(String(globalThis.location?.origin || ""));
    setAccount(() => sy.token());
    setNotesViaSite(true);
    setSettingsSavedHook(() => {
      if (this.syncMute || !sy.on()) return;
      const G = globalThis;
      G.clearTimeout(this.syncTimer);
      this.syncTimer = G.setTimeout(() => {
        sy.push(syncPick(this.settings)).catch(() => false);
      }, 1200);
    });
    const applyLocal = (next) => {
      this.syncMute = true;
      this.settings = next;
      saveSettings(next);
      this.syncMute = false;
    };
    const fin = await sy.finish();
    if (fin === "fail") {
      this.syncNote = "登入沒有完成，請再試一次。";
      return;
    }
    if (fin === "ok") {
      this.pushSync();
      const r2 = await sy.pull();
      if (r2 && r2.data) applyLocal(syncMerge(this.settings, r2.data));
      await sy.push(syncPick(this.settings));
      const adopted = await adoptRatings().catch(() => 0);
      try {
        const G = globalThis;
        const who = String(G.sessionStorage.getItem("ms:follow-after-login") || "").slice(0, 16);
        G.sessionStorage.removeItem("ms:follow-after-login");
        if (who) {
          await social("follow", { name: who, on: true }).catch(() => void 0);
          this.followedAfterLogin = who;
        }
      } catch (_) {
      }
      this.syncNote = (r2 && r2.data ? "已登入，這台和帳號裡的收藏已經合在一起。" : "已登入，這台的設定已經存到帳號裡。") + (adopted ? `這台原本評過的 ${adopted} 部片也併進你的片單了。` : "");
      return;
    }
    if (!sy.on()) return;
    const r = await Promise.race([sy.pull(), sleep(2500).then(() => null)]);
    if (r && r.data && r.at > sy.at()) {
      applyLocal(syncApply(this.settings, r.data));
      sy.setAt(r.at);
    }
  }
  /** 設定頁的一列：點進去才是登入、同步、登出這些選項 */
  /** 管理員專區（設定頁「同步與登出」下面那一列點進來）：只有管理員名單裡的 Google 帳號登入後才看得到那一列；
   *  就算有人硬開這一頁，裡面每個動作伺服器都會再驗一次身分 */
  adminHomeView() {
    return /* @__PURE__ */ h(Page, { title: "管理員專區", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint: "只有管理員名單裡的 Google 帳號登入後才看得到這一區。" }, /* @__PURE__ */ h(Item, { icon: "💬", title: "意見回饋", subtitle: "看使用者的回饋、回覆、標處理狀態", onTap: () => {
      this.adminFbTab = "open";
      this.go(() => this.adminFeedbackView(), "讀取回饋…");
    } }), /* @__PURE__ */ h(Item, { icon: "🛡", title: "短評管理", subtitle: "複查被檢舉的短評，或巡一遍最近的短評", onTap: () => {
      this.adminTab = "flagged";
      this.go(() => this.adminNotesView(), "讀取短評…");
    } }), /* @__PURE__ */ h(Item, { icon: "🪪", title: "帳號管理", subtitle: "被檢舉的帳號：停用個人頁、強制改暱稱", onTap: () => {
      this.adminUserQ = "";
      this.go(() => this.adminUsersView(), "讀取帳號…");
    } }), /* @__PURE__ */ h(Item, { icon: "📈", title: "用量", subtitle: "每天幾台裝置在用、各類請求幾次、離免費額度多遠", onTap: () => this.go(() => this.adminUsageView(), "讀取用量…") }), /* @__PURE__ */ h(Item, { icon: "👥", title: "管理員名單", subtitle: "新增或移除其他管理員", onTap: () => this.go(() => this.adminListView(), "讀取名單…") })));
  }
  // 設定頁最上面的帳號資訊（一分鐘內不重讀）
  /** 設定頁最上面：沒登入 = 用 Google 登入；登入了 = 帳號資訊（暱稱、Gmail、片單和追蹤的數字），以及片單、同步的入口 */
  async accountSection() {
    const sy = this.sync();
    if (!sy) return "";
    if (!sy.on())
      return /* @__PURE__ */ h(Section, { title: "帳號", hint: "登入後：收藏和設定會跟著帳號走；評過的片會記成片單；可以取暱稱、公開個人頁、追蹤別人。不登入也能照常使用。" }, /* @__PURE__ */ h(Item, { icon: "👤", title: "用 Google 登入", subtitle: "同步收藏、記錄片單、追蹤朋友", accent: true, onTap: () => sy.login() }));
    if (!this.meMem || Date.now() - this.meMem.at > 6e4) {
      const job = social("me").then((d) => {
        this.meMem = { at: Date.now(), data: d };
        this.setUnread(d.unread || 0);
      }, () => void 0);
      await Promise.race([job, sleep(900)]);
    }
    const me = this.meMem ? this.meMem.data : null;
    const email = String(sy.email && sy.email() || "");
    const open = () => {
      this.diaryTab = "mine";
      this.diaryMem = null;
      this.go(() => this.diaryView(), "讀取片單…");
    };
    const u = me && me.user;
    const statusTag = !u ? { text: "還沒取暱稱", tone: "warn" } : u.hidden ? { text: "已被停用", tone: "bad" } : u.pub ? { text: "公開", tone: "good" } : { text: "不公開", tone: "" };
    return /* @__PURE__ */ h(Section, { title: "帳號" }, /* @__PURE__ */ h("div", { role: "button", onTap: open }, this.profileCard({ name: u ? u.name : me ? "還沒取暱稱" : "已登入", color: u ? u.color : "gray", emoji: u ? u.emoji : "", bio: u ? u.bio : "" }, me ? me.counts : null, "", (kind) => this.go(() => this.profileListView("", kind), "讀取中…"), "", me ? statusTag : void 0, email)), u && SOCIALS.some((x) => u[x.id]) ? /* @__PURE__ */ h("div", { class: "pf-pills" }, SOCIALS.filter((x) => u[x.id]).map((x) => /* @__PURE__ */ h("button", { class: "pf-pill", "aria-label": `${x.name}：@${u[x.id]}`, onTap: () => Safari.open(x.url(u[x.id])) }, socialIcon(x.id), /* @__PURE__ */ h("span", null, esc(u[x.id]))))) : null, me ? /* @__PURE__ */ h("div", { class: "pf-btns" }, /* @__PURE__ */ h("button", { class: "pf-btn", onTap: () => {
      this.profileDraft = null;
      this.go(() => this.profileEditView(u || null));
    } }, u ? "編輯個人檔案" : "設定暱稱"), u && u.pub && !u.hidden ? /* @__PURE__ */ h("button", { class: "pf-btn", onTap: async () => {
      Pasteboard.copy(`${SITE_URL}/?u=${encodeURIComponent(u.name)}`);
      await this.ui.toast("已複製個人頁連結");
    } }, "分享個人檔案") : null, /* @__PURE__ */ h("button", { class: "pf-btn icon", "aria-label": "找人追蹤", onTap: () => {
      this.switchTab("activity");
      this.socialTab = "people";
    } }, PERSON_ADD)) : null, /* @__PURE__ */ h(Item, { icon: "🎞", title: "我的片單", subtitle: u ? "看過的片、評分和短評" : "取暱稱、記錄看過的片、追蹤別人", onTap: open }), u && !u.hidden ? /* @__PURE__ */ h(Item, { icon: u.pub ? "✅" : "⬜️", title: "公開個人頁", subtitle: u.pub ? "別人可以看你的片單、追蹤你；短評旁邊顯示暱稱" : "目前只有你看得到片單，短評匿名", chevron: false, onTap: async () => {
      try {
        await social("profile-set", { name: u.name, pub: !u.pub });
        this.meMem = null;
        this.diaryMem = null;
        await this.ui.toast(u.pub ? "個人頁改成不公開了" : "個人頁公開了");
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    } }) : null, /* @__PURE__ */ h(Item, { icon: "🔄", title: "同步與登出", subtitle: "收藏和設定自動同步中", onTap: () => this.go(() => this.syncView()) }), me && me.admin ? /* @__PURE__ */ h(Item, { icon: "🛡", title: "管理員專區", subtitle: "意見回饋、短評、帳號、管理員名單", onTap: () => this.go(() => this.adminHomeView()) }) : null);
  }
  syncLink() {
    const sy = this.sync();
    if (!sy) return "";
    return /* @__PURE__ */ h(Section, { title: "同步" }, /* @__PURE__ */ h(Item, { icon: "🔄", title: "用 Google 帳號同步", subtitle: sy.on() ? "收藏和設定有變動會自動同步" : "讓主畫面的 App 和瀏覽器用同一份收藏", right: sy.on() ? "已登入" : "未登入", onTap: () => this.go(() => this.syncView()) }));
  }
  // 編輯個人檔案時還沒存的內容
  async myDiary(force = false) {
    if (!force && this.diaryMem && Date.now() - this.diaryMem.at < 6e4) return this.diaryMem.list;
    const r = await social("mine");
    this.diaryMem = { at: Date.now(), list: r.list || [] };
    return this.diaryMem.list;
  }
  /** 用片名開那部片的頁面（上映中、即將上映、已下檔、影展片都找得到） */
  async openTitle(title) {
    const fav = { key: communityKey(title), title, at: 0 };
    const row = (await favMovieRows({ ...this.settings, favMovies: [fav] }).catch(() => []))[0];
    if (row) this.openFavRow(row);
    else this.go(() => this.favMovieView(fav), `讀取《${title}》…`);
  }
  /** 頭像：底色＋表情符號；沒選表情符號就用暱稱的第一個字 */
  avatar(u, big = false) {
    return /* @__PURE__ */ h("span", { class: "av" + (big ? " big" : "") + (u.emoji ? " emo" : ""), style: `background:${profileColor(u.color)};color:${profileInk(u.color)}`, "aria-hidden": "true" }, esc(u.emoji || Array.from(u.name)[0] || "?"));
  }
  /** 個人頁最上面那一塊：頭像（顏色＋暱稱第一個字）、暱稱、四個數字 */
  /** 個人卡片上的數字點進去：那個人的片單／有寫短評的／粉絲／追蹤中。name 空的 = 看自己的 */
  async profileListView(name, kind) {
    const TITLE = { films: "片單", notes: "短評", followers: "粉絲", following: "追蹤中" };
    let r = null, failed = "";
    try {
      r = await social("list", { ...name ? { name } : {}, kind });
    } catch (e) {
      failed = String(e?.message || e);
    }
    const who = name || (r && r.user ? r.user.name : "我");
    if (!r) return /* @__PURE__ */ h(Page, { title: TITLE[kind], subtitle: who, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { kind: "warn", text: failed })));
    const people = r.people || [], entries = r.entries || [];
    return /* @__PURE__ */ h(Page, { title: `${TITLE[kind]}（${r.total}）`, subtitle: who, onBack: () => this.back() }, kind === "films" || kind === "notes" ? /* @__PURE__ */ h(Section, { hint: r.total > entries.length ? `只列最近 ${entries.length} 筆。` : r.self ? "含你設成只有自己看得到的那幾筆。" : "" }, entries.length ? /* @__PURE__ */ h("div", { class: "nt-list" }, entries.map((e) => this.entryRow(e, () => r.self ? this.go(() => this.entryView(e.title, e)) : this.openTitle(e.title)))) : /* @__PURE__ */ h(Note, { text: kind === "notes" ? "還沒有寫過短評。" : "片單還是空的。" })) : /* @__PURE__ */ h(Section, { hint: r.unlisted ? `另外有 ${r.unlisted} 位沒有公開個人頁，不會列出來。` : "只會列出有公開個人頁的帳號。" }, people.length ? people.map((u) => u.me ? /* @__PURE__ */ h("div", { class: "item" }, /* @__PURE__ */ h("span", { class: "us-main" }, this.avatar(u), /* @__PURE__ */ h("span", { class: "us-name" }, esc(u.name)), /* @__PURE__ */ h("span", { class: "us-sub" }, "你自己"))) : this.userItem(u)) : /* @__PURE__ */ h(Note, { text: r.total ? "他們都沒有公開個人頁。" : kind === "followers" ? "還沒有粉絲。" : "還沒有追蹤任何人。" })));
  }
  /** onNum：有給的話，四個數字可以點（點了看清單） */
  /** note = 卡片最下面的一行小字；onNum = 數字可以點；extra = 接在最下面的內容（共同追蹤）；
   *  tag = 暱稱旁邊的小標（公開／不公開…）；sub = 暱稱下面的一行小字（設定頁放登入的 Gmail） */
  profileCard(u, c, note = "", onNum, extra = "", tag, sub = "") {
    const num = (kind, n, label) => onNum ? /* @__PURE__ */ h("button", { class: "pf-stat", onTap: () => onNum(kind) }, /* @__PURE__ */ h("b", null, n), /* @__PURE__ */ h("span", null, label)) : /* @__PURE__ */ h("span", { class: "pf-stat" }, /* @__PURE__ */ h("b", null, n), /* @__PURE__ */ h("span", null, label));
    return /* @__PURE__ */ h("div", { class: "pf" }, /* @__PURE__ */ h("div", { class: "pf-top" }, this.avatar(u, true), /* @__PURE__ */ h("div", { class: "pf-body" }, /* @__PURE__ */ h("div", { class: "pf-name" }, esc(u.name), tag ? /* @__PURE__ */ h("span", { class: "pf-tag " + tag.tone }, esc(tag.text)) : null), sub ? /* @__PURE__ */ h("div", { class: "pf-sub" }, esc(sub)) : null, c ? /* @__PURE__ */ h("div", { class: "pf-nums" }, num("films", c.films, "部片"), num("notes", c.notes, "短評"), num("followers", c.followers, "粉絲"), num("following", c.following, "追蹤中")) : null)), u.bio ? /* @__PURE__ */ h("div", { class: "pf-bio" }, esc(u.bio)) : null, note ? /* @__PURE__ */ h("div", { class: "pf-note" }, esc(note)) : null, extra);
  }
  /** 片單上的一筆：片名、分數、看過的日期、短評（有雷的摺疊）。by = 動態裡是誰的紀錄 */
  entryRow(e, onTap, onUser) {
    const open = !e.sp || this.noteShown.indexOf(-e.at) >= 0;
    return /* @__PURE__ */ h("div", { class: "nt" }, e.by ? /* @__PURE__ */ h("button", { class: "nt-by", onTap: () => onUser && onUser(e.by.name) }, this.avatar(e.by), /* @__PURE__ */ h("span", null, esc(e.by.name))) : null, /* @__PURE__ */ h("div", { class: "nt-head", role: "button", onTap }, /* @__PURE__ */ h("span", { class: "en-title" }, esc(e.title)), e.s ? /* @__PURE__ */ h("span", { class: "nt-score " + ratingTier("imdb", e.s) }, e.s, " 分") : null, e.priv ? /* @__PURE__ */ h("span", { class: "fb-tag" }, "只有自己看得到") : null, /* @__PURE__ */ h("span", { class: "nt-rep" }, "›")), /* @__PURE__ */ h("div", { class: "nt-meta" }, esc([seenLabel(e.seen), howLabel(e.how), `${noteDate(e.at)}記錄`].filter(Boolean).join("｜"))), e.x ? open ? /* @__PURE__ */ h("button", { class: "nt-text go", "aria-label": `到《${e.title}》的討論區`, onTap: () => {
      this.noteReset();
      this.noteFocus = { x: e.x, at: Date.now() };
      this.go(() => this.notesView(e.title), "讀取短評…");
    } }, /* @__PURE__ */ h("span", null, esc(e.x)), /* @__PURE__ */ h("i", { "aria-hidden": "true" }, "💬 ›")) : /* @__PURE__ */ h("button", { class: "nt-cover", onTap: () => {
      this.noteShown = [...this.noteShown, -e.at];
    } }, "這則可能有雷，點一下顯示") : null);
  }
  /** 設定 → 我的片單：自己看過、評過的片（追蹤對象的動態、找人在底部的「社群」頁籤） */
  async diaryView() {
    const sy = this.sync();
    if (!sy || !sy.on())
      return /* @__PURE__ */ h(Page, { title: "我的片單", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint: "登入後，你評過分、寫過短評的片會集中在這裡，換裝置也在；還可以標記看過的日期。想要的話可以取一個暱稱、公開個人頁，讓別人追蹤你，也去追蹤別人。不登入也能照常匿名評分。" }, /* @__PURE__ */ h(Item, { icon: "🎞", title: "用 Google 登入，開始記錄", subtitle: "伺服器只存帳號的識別碼（經過雜湊）；email 只留在這台裝置上顯示用", accent: true, onTap: () => sy && sy.login() })));
    let me = null, failed = "";
    try {
      me = await social("me");
    } catch (e) {
      failed = String(e?.message || e);
    }
    if (!me) return /* @__PURE__ */ h(Page, { title: "我的片單", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { kind: "warn", text: failed }));
    const user = me.user;
    this.hasProfile = !!user;
    if (!user && !profileSkipped()) return this.profileEditView(null, true);
    let body = "";
    {
      const list = await this.myDiary().catch(() => null);
      body = !list ? /* @__PURE__ */ h(Note, { kind: "warn", text: "片單暫時讀不到" }) : list.length ? /* @__PURE__ */ h(Section, { hint: "在電影頁評分、寫短評，或標記看過，就會出現在這裡。點一筆可以改看過的日期，或設成只有自己看得到。" }, /* @__PURE__ */ h("div", { class: "nt-list" }, list.map((e) => this.entryRow(e, () => this.go(() => this.entryView(e.title, e)))))) : /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { text: "片單還是空的。到任何一部電影的頁面評分或標記看過，就會記在這裡。" }));
    }
    return /* @__PURE__ */ h(Page, { title: "我的片單", onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, user ? this.profileCard(user, me.counts, user.hidden ? "個人頁目前被站長停用，別人看不到。" : "", (kind) => this.go(() => this.profileListView("", kind), "讀取中…"), "", user.hidden ? { text: "已被停用", tone: "bad" } : user.pub ? { text: "公開", tone: "good" } : { text: "不公開", tone: "" }) : /* @__PURE__ */ h(Note, { kind: "warn", text: "還沒有設定暱稱：別人找不到你、不能追蹤你，短評也是匿名。你還是可以追蹤別人。" })), body);
  }
  /** 清單裡的一個帳號：點名字看個人頁，右邊追蹤／取消追蹤 */
  userItem(u) {
    return /* @__PURE__ */ h("div", { class: "item" }, /* @__PURE__ */ h("button", { class: "us-main", onTap: () => this.go(() => this.profileView(u.name), "讀取個人頁…") }, this.avatar(u), /* @__PURE__ */ h("span", { class: "us-name" }, esc(u.name)), u.films !== void 0 ? /* @__PURE__ */ h("span", { class: "us-sub" }, u.films, " 部片") : null), signedIn() ? /* @__PURE__ */ h("button", { class: "us-follow" + (u.following ? " on" : ""), onTap: async () => {
      try {
        await social("follow", { name: u.name, on: !u.following });
        this.meMem = null;
        await this.ui.toast(u.following ? "已取消追蹤" : `已追蹤 ${u.name}`);
        if (!u.following) await this.askNickname();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    } }, u.following ? "追蹤中" : "追蹤") : null);
  }
  // 登入的帳號取過暱稱了嗎（null = 還沒問過伺服器）
  /** 登入的人評分、寫短評之後：還沒取暱稱就帶去設定一次。設過、或按過「稍後再說」就不再問（之後到 設定 → 我的片單 改） */
  async askNickname() {
    if (!signedIn() || profileSkipped() || this.hasProfile) return;
    if (this.hasProfile === null) {
      const me = await social("me").catch(() => null);
      if (!me) return;
      this.hasProfile = !!me.user;
    }
    if (!this.hasProfile) {
      this.profileDraft = null;
      this.go(() => this.profileEditView(null, true, true));
    }
  }
  /** first = 第一次設定（有歡迎說明和「稍後再說」）；pushed = 是另外開的一頁（存好、跳過都要退回原本那一頁） */
  profileEditView(user, first = false, pushed = false) {
    const sy0 = this.sync();
    const suggest = !user && sy0 && sy0.gname ? Array.from(String(sy0.gname() || "").normalize("NFC").replace(/[^\p{L}\p{N}_]/gu, "")).slice(0, 16).join("") : "";
    const d = this.profileDraft || { name: user ? user.name : suggest.length >= 2 ? suggest : "", color: user ? user.color : "blue", emoji: user && user.emoji || "", bio: user && user.bio || "", th: user && user.th || "", ig: user && user.ig || "", tw: user && user.tw || "", pub: user ? !!user.pub : first };
    const keep = (v) => {
      const picked = v && /^#[0-9a-f]{6}$/i.test(v.c || "") && v.c.toLowerCase() !== profileColor(d.color).toLowerCase() ? v.c.toLowerCase() : d.color;
      this.profileDraft = { ...d, name: v && typeof v.n === "string" ? v.n : d.name, emoji: v && typeof v.e === "string" ? v.e.trim() : d.emoji, bio: v && typeof v.b === "string" ? v.b : d.bio, th: v && typeof v.th === "string" ? v.th : d.th, ig: v && typeof v.ig === "string" ? v.ig : d.ig, tw: v && typeof v.tw === "string" ? v.tw : d.tw, color: picked };
    };
    const custom = /^#/.test(d.color);
    const saved = (this.settings.myEmoji || []).filter((e) => PROFILE_EMOJI.indexOf(e) < 0);
    const mine = [...saved];
    for (const e of [user && user.emoji, d.emoji]) if (e && PROFILE_EMOJI.indexOf(e) < 0 && mine.indexOf(e) < 0) mine.push(e);
    const save = async (v) => {
      keep(v);
      const p = this.profileDraft;
      try {
        await social("profile-set", { name: p.name.trim(), color: p.color, emoji: p.emoji, bio: p.bio, th: p.th.trim(), ig: p.ig.trim(), tw: p.tw.trim(), pub: p.pub });
        this.profileDraft = null;
        this.hasProfile = true;
        this.meMem = null;
        setProfileSkipped(false);
        await this.ui.toast(first ? "暱稱設定好了" : "已儲存");
        if (!first || pushed) this.back();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    return /* @__PURE__ */ h(Page, { title: user ? "編輯個人檔案" : first ? "先取一個暱稱" : "設定暱稱", onBack: () => this.back(), right: /* @__PURE__ */ h("button", { class: "bar-save", onTap: save }, "儲存") }, first ? /* @__PURE__ */ h(Note, { text: (pushed ? "剛才的動作已經完成了。接下來，" : "歡迎使用「我的片單」。") + "取一個暱稱、公開個人頁，別人才找得到你、能追蹤你，你寫的短評旁邊也會顯示暱稱。只會問這一次，之後在「設定 → 我的片單」可以改。\n不想公開也沒關係：取消下面的「公開我的個人頁」，或按最下面的「稍後再說」，片單就只有你自己看得到（還是可以追蹤別人）。" }) : null, /* @__PURE__ */ h(Section, { title: "暱稱", hint: (!user && suggest.length >= 2 ? "已經先幫你填上 Google 帳號的名稱，可以直接改成你想要的；如果那是本名，建議換一個。" : "") + "2～16 個字，只能用中英文、數字和底線；不能跟別人重複。14 天內只能改一次。請不要冒用他人名義。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("input", { class: "field", name: "n", maxlength: "16", autocomplete: "off", autocapitalize: "off", value: d.name, placeholder: "例如：愛看片的小明" }))), /* @__PURE__ */ h(Section, { title: "自我介紹", hint: "選填，最多 80 個字，會顯示在個人頁的暱稱下面。不能放連結或聯絡方式。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("input", { class: "field", name: "b", maxlength: "80", autocomplete: "off", value: d.bio, placeholder: "例如：恐怖片愛好者｜每週進戲院" }), /* @__PURE__ */ h("span", { class: "cm-taghead", style: "margin-top:14px" }, "社群帳號（可不填；公開個人頁時別人點得到）"), SOCIALS.map((x) => /* @__PURE__ */ h("label", { class: "pf-handle", "aria-label": x.name }, socialIcon(x.id), /* @__PURE__ */ h("span", null, "@"), /* @__PURE__ */ h("input", { name: x.id, maxlength: "60", autocomplete: "off", autocapitalize: "off", spellcheck: "false", value: d[x.id], placeholder: `${x.name} 帳號名稱` }))))), /* @__PURE__ */ h(Section, { title: "頭像", hint: "底色加上一個表情符號；選「字」就用暱稱的第一個字。按 ＋ 可以加自己喜歡的表情符號（不能上傳照片）。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("div", { class: "pf-prev" }, this.avatar({ name: d.name || "?", color: d.color, emoji: d.emoji }, true)), /* @__PURE__ */ h("div", { class: "em-grid" }, /* @__PURE__ */ h("button", { class: "em" + (!d.emoji ? " on" : ""), "aria-label": "不用表情符號，用暱稱的第一個字", onTap: (v) => {
      keep(v);
      this.profileDraft = { ...this.profileDraft, emoji: "" };
    } }, "字"), [...PROFILE_EMOJI, ...mine].map((e) => /* @__PURE__ */ h("button", { class: "em" + (e === d.emoji ? " on" : ""), "aria-pressed": e === d.emoji ? "true" : "false", onTap: (v) => {
      keep(v);
      this.profileDraft = { ...this.profileDraft, emoji: e };
    } }, e)), /* @__PURE__ */ h("button", { class: "em add", "aria-label": "加一個自己的表情符號", onTap: async (v) => {
      keep(v);
      const ask = globalThis.prompt;
      const raw = typeof ask === "function" ? ask("輸入一個表情符號（用鍵盤的表情符號鍵）", "") : null;
      const e = String(raw || "").trim();
      if (!e) return;
      if (e.length > 32 || !/^(?:[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200D\uFE0F\u{1F3FB}-\u{1F3FF}]*)$/u.test(e)) {
        await this.ui.toast("只能放一個表情符號");
        return;
      }
      if (PROFILE_EMOJI.indexOf(e) < 0 && saved.indexOf(e) < 0) {
        this.settings.myEmoji = [...saved, e].slice(-14);
        saveSettings(this.settings);
      }
      this.profileDraft = { ...this.profileDraft, emoji: e };
    } }, "＋")), d.emoji && saved.indexOf(d.emoji) >= 0 ? /* @__PURE__ */ h("button", { class: "em-del", onTap: (v) => {
      keep(v);
      this.settings.myEmoji = saved.filter((x) => x !== d.emoji);
      saveSettings(this.settings);
      this.profileDraft = { ...this.profileDraft, emoji: "" };
    } }, "從清單移除 ", d.emoji) : null, /* @__PURE__ */ h("div", { class: "sw-row" }, PROFILE_COLORS.map((c) => /* @__PURE__ */ h("button", { class: "sw" + (c.id === d.color ? " on" : ""), style: `background:${c.hex}`, "aria-label": c.id, "aria-pressed": c.id === d.color ? "true" : "false", onTap: (v) => {
      keep(v);
      this.profileDraft = { ...this.profileDraft, color: c.id };
    } })), /* @__PURE__ */ h("label", { class: "sw pick" + (custom ? " on" : ""), style: custom ? `background:${d.color}` : "", "aria-label": "自訂顏色" }, /* @__PURE__ */ h("input", { type: "color", name: "c", value: profileColor(d.color), onInput: (v) => {
      keep(v);
    } }))), custom ? /* @__PURE__ */ h("div", { class: "sw-note" }, "自訂色號 ", d.color.toUpperCase()) : null)), first ? /* @__PURE__ */ h(Section, { title: "公開", hint: "公開後：別人可以看到你的個人頁（片單、評分、短評）、可以追蹤你，你寫的短評旁邊會顯示暱稱。不公開：片單只有你看得到，短評照樣匿名。之後在設定的帳號那一區可以隨時切換。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("button", { class: "nt-check" + (d.pub ? " on" : ""), "aria-pressed": d.pub ? "true" : "false", onTap: (v) => {
      keep(v);
      this.profileDraft = { ...this.profileDraft, pub: !d.pub };
    } }, /* @__PURE__ */ h("i", null, d.pub ? "✓" : ""), /* @__PURE__ */ h("span", null, "公開我的個人頁")), /* @__PURE__ */ h(Button, { label: "儲存", onTap: save }), /* @__PURE__ */ h(Button, { label: "稍後再說", kind: "secondary", onTap: () => {
      setProfileSkipped(true);
      this.profileDraft = null;
      if (pushed) this.back();
    } }))) : /* @__PURE__ */ h("p", { class: "hint" }, "改好按右上角的「儲存」。", user ? "要不要公開個人頁，在設定的帳號那一區切換。" : ""));
  }
  wipeConfirmView() {
    return /* @__PURE__ */ h(Page, { title: "確定要刪除？", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { kind: "warn", text: "片單、暱稱、追蹤關係，還有你用這個帳號評的分和寫的短評都會刪掉，救不回來。" }), /* @__PURE__ */ h(Button, { label: "確定刪除", kind: "danger", onTap: async () => {
      try {
        await this.wipeSocial();
        await this.ui.toast("已刪除");
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
      this.back();
      this.back();
    } }), /* @__PURE__ */ h(Button, { label: "取消", kind: "secondary", onTap: () => this.back() }));
  }
  /** 把帳號的片單和社交資料刪乾淨（伺服器一次處理 20 筆，送到沒有為止） */
  async wipeSocial() {
    for (let i = 0; i < 200; i++) {
      const r = await social("wipe");
      if (!r.left) break;
    }
    forgetMyVotes();
    this.diaryMem = null;
    this.hasProfile = false;
  }
  /** 某個人的公開個人頁 */
  async profileView(name) {
    let p = null, failed = "";
    try {
      p = await social("profile", { name });
    } catch (e) {
      failed = String(e?.message || e);
    }
    if (!p) return /* @__PURE__ */ h(Page, { title: "個人頁", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { kind: "warn", text: failed === "找不到這個帳號" ? "找不到這個帳號（可能改了暱稱，或已經刪除）。" : failed }));
    const u = p.user;
    if (p.private) return /* @__PURE__ */ h(Page, { title: u.name, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, this.profileCard(u, null), /* @__PURE__ */ h(Note, { text: "這個帳號沒有公開個人頁。" })));
    const dist = p.dist || [], max = Math.max(1, ...dist), rated = dist.reduce((a, b) => a + b, 0);
    const mu = p.mutual;
    const mutualLine = mu && mu.list.length ? /* @__PURE__ */ h("button", { class: "pf-mutual", onTap: () => this.go(() => this.profileListView(u.name, "followers"), "讀取中…") }, /* @__PURE__ */ h("span", { class: "pf-faces" }, mu.list.map((x) => this.avatar(x))), /* @__PURE__ */ h("span", null, esc(mu.list.map((x) => x.name).join("、")), mu.more ? ` 和另外 ${mu.more} 人` : "", mu.list.length + mu.more > 1 ? "都" : "也", "在追蹤")) : "";
    const list = p.list || [];
    return /* @__PURE__ */ h(Page, { title: u.name, subtitle: "個人頁", onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, this.profileCard(u, p.counts || null, p.self ? "這是你的個人頁（別人看到的不含你設成只有自己看得到的那幾筆）" : "", (kind) => this.go(() => this.profileListView(u.name, kind), "讀取中…"), mutualLine), SOCIALS.some((x) => u[x.id]) ? /* @__PURE__ */ h("div", { class: "pf-pills" }, SOCIALS.filter((x) => u[x.id]).map((x) => /* @__PURE__ */ h("button", { class: "pf-pill", "aria-label": `${x.name}：@${u[x.id]}`, onTap: () => Safari.open(x.url(u[x.id])) }, socialIcon(x.id), /* @__PURE__ */ h("span", null, esc(u[x.id]))))) : null, /* @__PURE__ */ h("div", { class: "pf-btns" }, p.self ? /* @__PURE__ */ h("button", { class: "pf-btn", onTap: () => {
      this.profileDraft = null;
      this.go(() => this.profileEditView(u));
    } }, "編輯個人檔案") : signedIn() ? /* @__PURE__ */ h("button", { class: "pf-btn" + (p.following ? "" : " go"), onTap: async () => {
      try {
        await social("follow", { name: u.name, on: !p.following });
        this.meMem = null;
        await this.ui.toast(p.following ? "已取消追蹤" : `已追蹤 ${u.name}`);
        if (!p.following) await this.askNickname();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    } }, p.following ? "追蹤中 ✓" : "追蹤") : /* @__PURE__ */ h("button", { class: "pf-btn go", onTap: () => {
      try {
        globalThis.sessionStorage.setItem("ms:follow-after-login", u.name);
      } catch (_) {
      }
      const sy = this.sync();
      if (sy) sy.login();
    } }, "登入後追蹤"), /* @__PURE__ */ h("button", { class: "pf-btn", onTap: async () => {
      Pasteboard.copy(`${SITE_URL}/?u=${encodeURIComponent(u.name)}`);
      await this.ui.toast("已複製個人頁連結");
    } }, "分享"), p.self ? null : /* @__PURE__ */ h("button", { class: "pf-btn icon", "aria-label": "檢舉這個帳號", onTap: () => this.go(() => this.reportUserView(u.name)) }, "⚑"))), rated ? /* @__PURE__ */ h(Section, { title: `評分分布（${rated} 部）` }, /* @__PURE__ */ h("div", { class: "cm" }, /* @__PURE__ */ h("div", { class: "cm-hist wide", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { class: "bars" }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => /* @__PURE__ */ h("i", { class: dist[v - 1] ? "" : "zero", style: `height:${Math.max(8, Math.round((dist[v - 1] || 0) / max * 100))}%` }))), /* @__PURE__ */ h("div", { class: "axis" }, /* @__PURE__ */ h("span", null, "1 分"), /* @__PURE__ */ h("span", null, "10 分"))))) : null, /* @__PURE__ */ h(Section, { title: `片單（${p.counts ? p.counts.films : list.length}）`, hint: list.length >= 50 ? "只列最近 50 筆。" : "" }, list.length ? /* @__PURE__ */ h("div", { class: "nt-list" }, list.map((e) => this.entryRow(e, () => this.openTitle(e.title)))) : /* @__PURE__ */ h(Note, { text: "還沒有公開的紀錄。" })));
  }
  reportUserView(name) {
    const WHY = [{ id: "name", label: "暱稱不雅或不當" }, { id: "fake", label: "冒用他人名義" }, { id: "abuse", label: "騷擾或其他不當行為" }];
    return /* @__PURE__ */ h(Page, { title: "檢舉帳號", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: `檢舉「${name}」的原因`, hint: "檢舉是匿名的，站長會複查。個別短評有問題的話，請到那則短評按「檢舉」。" }, WHY.map((w) => /* @__PURE__ */ h(Item, { title: w.label, onTap: async () => {
      try {
        await social("report-user", { name, why: w.id });
        await this.ui.toast("已送出檢舉，謝謝");
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
      this.back();
    } }))));
  }
  /** 片單上的一筆：看過的日期、要不要只給自己看。分數和短評在電影頁改 */
  async entryView(title, known) {
    const k = communityKey(title);
    const list = await this.myDiary().catch(() => []);
    const e = list.find((x) => x.k === k) || (this.diaryMem ? null : known) || null;
    return /* @__PURE__ */ h(Page, { title: "我的紀錄", subtitle: `《${title}》`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, e && (e.s || e.x) ? /* @__PURE__ */ h("div", { class: "nt-list" }, this.entryRow(e, () => this.openTitle(title))) : /* @__PURE__ */ h(Note, { text: "還沒有評分。可以先記下什麼時候看的，之後再到電影頁評分、寫短評。" }), /* @__PURE__ */ h("div", { class: "pf-btns en-btns" }, /* @__PURE__ */ h("button", { class: "pf-btn", onTap: () => this.openTitle(title) }, "🎬 電影頁（改評分、短評）"))), /* @__PURE__ */ h(Section, { title: "觀影紀錄" }, /* @__PURE__ */ h("div", { class: "cm-tags en-watch" }, this.watchFields(title, e))), e ? /* @__PURE__ */ h(Section, { hint: "這一筆不會出現在你的個人頁和別人的動態裡，你在這部片的短評也會顯示成匿名。分數照樣算進這部片的平均。" }, /* @__PURE__ */ h(Item, { icon: e.priv ? "✅" : "⬜️", title: "只有自己看得到", chevron: false, onTap: () => this.saveWatch(title, { priv: !e.priv }, e.priv ? "這一筆恢復公開" : "這一筆只有你看得到了") })) : null);
  }
  async adminUsersView() {
    const sy = this.sync();
    const WHY = { name: "暱稱不當", fake: "冒名", abuse: "不當行為" };
    let list = [], users = 0, failed = "";
    const q = this.adminUserQ.trim();
    try {
      const r = await sy.adm("users", q ? { op: "find", q } : { op: "list" });
      list = r.list || [];
      users = r.users || 0;
    } catch (e) {
      failed = String(e?.message || e);
    }
    const act = (body, done) => async () => {
      try {
        await sy.adm("users", body);
        await this.ui.toast(done);
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    return /* @__PURE__ */ h(Page, { title: "帳號管理", subtitle: "管理員專區", onBack: () => this.back() }, /* @__PURE__ */ h(Search, { value: this.adminUserQ, placeholder: "用暱稱找帳號", onInput: (t) => {
      this.adminUserQ = t;
    } }), failed ? /* @__PURE__ */ h(Note, { kind: "warn", text: failed }) : /* @__PURE__ */ h(Section, { title: q ? `符合「${q}」的帳號` : `被檢舉或被停用的帳號（${list.length}）`, hint: q ? "" : `目前共有 ${users} 個帳號設了暱稱。停用：個人頁別人看不到、短評變成匿名，對方的片單不會被刪。` }, list.length ? /* @__PURE__ */ h("div", { class: "nt-list" }, list.map((u) => {
      const why = Object.keys(u.reports || {}).map((w) => `${WHY[w] || w} ${u.reports[w]}`).join("、");
      return /* @__PURE__ */ h("div", { class: "nt" }, /* @__PURE__ */ h("div", { class: "nt-head" }, this.avatar(u), /* @__PURE__ */ h("span", { class: "en-title" }, esc(u.name)), /* @__PURE__ */ h("span", { class: "nt-score" + (u.hidden ? " bad" : "") }, u.hidden ? "已停用" : u.pub ? "公開" : "不公開")), /* @__PURE__ */ h("div", { class: "nt-meta" }, u.films, " 部片", why ? `｜檢舉：${why}` : ""), /* @__PURE__ */ h("div", { class: "nt-acts" }, /* @__PURE__ */ h("button", { onTap: () => this.go(() => this.profileView(u.name), "讀取個人頁…") }, "看個人頁"), /* @__PURE__ */ h("button", { onTap: act({ op: "hide", name: u.name, on: !u.hidden }, u.hidden ? "已恢復" : "已停用") }, u.hidden ? "恢復" : "停用"), why ? /* @__PURE__ */ h("button", { onTap: act({ op: "clear", name: u.name }, "已清掉檢舉") }, "沒問題") : null, /* @__PURE__ */ h("button", { class: "danger", onTap: () => this.go(() => this.adminRenameView(u.name)) }, "改暱稱")));
    })) : /* @__PURE__ */ h(Note, { text: q ? "找不到。" : "目前沒有被檢舉或被停用的帳號。" })));
  }
  adminRenameView(name) {
    const sy = this.sync();
    return /* @__PURE__ */ h(Page, { title: "強制改暱稱", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: `把「${name}」改成`, hint: "暱稱不雅或冒名時用。對方之後 14 天內不能自己改回來。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("input", { class: "field", name: "n", maxlength: "16", autocomplete: "off", placeholder: "新的暱稱，例如：使用者1234" }), /* @__PURE__ */ h(Button, { label: "改掉", kind: "danger", onTap: async (v) => {
      try {
        await sy.adm("users", { op: "rename", name, to: String(v.n || "").trim() });
        await this.ui.toast("已改暱稱");
        this.back();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    } }))));
  }
  // ── 通知頁（網頁版最下面的頁籤）：有人推、噓、回覆你的短評，或追蹤你 ──
  /** 還沒看的通知數：頁籤上的紅點，加到主畫面的「片刻」圖示上也會有數字（裝置支援才有；看過就清掉） */
  setUnread(n) {
    this.unread = n;
    if (true) return;
    try {
      const nav = globalThis.navigator;
      if (n > 0 && nav.setAppBadge) nav.setAppBadge(n).catch(() => void 0);
      else if (!n && nav.clearAppBadge) nav.clearAppBadge().catch(() => void 0);
    } catch (_) {
    }
  }
  // 社群頁籤看哪一塊：feed 動態／act 通知／people 找人（空的 = 進來時再決定）
  /** 社群頁籤上面那一排：動態｜通知｜找人 */
  socialTabs() {
    const seg = this.socialTab;
    return /* @__PURE__ */ h(Chips, { tabs: true }, /* @__PURE__ */ h(Chip, { label: "動態", muted: seg !== "feed", onTap: () => {
      this.socialTab = "feed";
    } }), /* @__PURE__ */ h(Chip, { label: this.unread > 0 ? `通知 ${this.unread > 99 ? "99+" : this.unread}` : "通知", muted: seg !== "act", onTap: () => {
      this.socialTab = "act";
    } }), /* @__PURE__ */ h(Chip, { label: "找人", muted: seg !== "people", onTap: () => {
      this.socialTab = "people";
    } }));
  }
  /** 動態裡的一則：頭像＋「誰 給《片名》幾分／看了《片名》」＋時間，下面是他的短評（點了到討論區） */
  feedRow(e) {
    const by = e.by;
    const toUser = () => this.go(() => this.profileView(by.name), "讀取個人頁…");
    const shown = !e.sp || this.noteShown.indexOf(-e.at) >= 0;
    const meta = [seenLabel(e.seen), howLabel(e.how)].filter(Boolean).join("｜");
    return /* @__PURE__ */ h("div", { class: "fd" }, /* @__PURE__ */ h("button", { class: "fd-av", "aria-label": `${by.name} 的個人頁`, onTap: toUser }, this.avatar(by)), /* @__PURE__ */ h("div", { class: "fd-body" }, /* @__PURE__ */ h("div", { class: "fd-line" }, /* @__PURE__ */ h("button", { class: "fd-name", onTap: toUser }, esc(by.name)), /* @__PURE__ */ h("span", null, e.s ? " 給" : e.x ? " 評了" : " 看了"), /* @__PURE__ */ h("button", { class: "fd-film", onTap: () => this.openTitle(e.title) }, "《", esc(e.title), "》"), e.s ? /* @__PURE__ */ h("span", { class: "nt-score " + ratingTier("imdb", e.s) }, e.s, " 分") : null, /* @__PURE__ */ h("em", null, "・", esc(agoLabel(e.at)))), meta ? /* @__PURE__ */ h("div", { class: "fd-meta" }, esc(meta)) : null, e.x ? shown ? /* @__PURE__ */ h("button", { class: "fd-note", "aria-label": `到《${e.title}》的討論區`, onTap: () => {
      this.noteReset();
      this.noteFocus = { x: e.x, at: Date.now() };
      this.go(() => this.notesView(e.title), "讀取短評…");
    } }, /* @__PURE__ */ h("span", null, esc(e.x)), /* @__PURE__ */ h("i", { "aria-hidden": "true" }, "💬")) : /* @__PURE__ */ h("button", { class: "nt-cover", onTap: () => {
      this.noteShown = [...this.noteShown, -e.at];
    } }, "這則可能有雷，點一下顯示") : null));
  }
  /** 社群頁籤：動態（追蹤對象最近看了什麼）、通知（誰推、回覆、提到、追蹤我）、找人 */
  async activityView() {
    const sy = this.sync();
    if (!sy || !sy.on())
      return /* @__PURE__ */ h(Page, { title: "社群" }, /* @__PURE__ */ h(Section, { hint: "登入後可以追蹤別人、看他們最近看了什麼；有人推或回覆你的短評、追蹤你，也會列在這裡。" }, /* @__PURE__ */ h(Item, { icon: "👤", title: "用 Google 登入", subtitle: "登入後才有動態和通知", accent: true, onTap: () => sy && sy.login() })));
    if (!this.socialTab) this.socialTab = this.unread > 0 ? "act" : "feed";
    if (this.socialTab === "feed") {
      const r = await social("feed").catch(() => null);
      return /* @__PURE__ */ h(Page, { title: "社群" }, this.socialTabs(), !r ? /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { kind: "warn", text: "動態暫時讀不到" })) : r.list.length ? /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h("div", { class: "fd-list" }, r.list.filter((e) => e.by).map((e) => this.feedRow(e)))) : /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { text: r.following ? "你追蹤的人最近還沒有新的紀錄。" : "還沒有追蹤任何人。追蹤之後，他們評分、寫短評、記錄看過的片會出現在這裡。" }), /* @__PURE__ */ h(Item, { icon: "🔍", title: "找人追蹤", subtitle: "看看誰公開了片單", onTap: () => {
        this.socialTab = "people";
      } })), r && r.list.length ? /* @__PURE__ */ h("p", { class: "hint" }, "只會出現對方公開的紀錄。") : null);
    }
    if (this.socialTab === "people") {
      const r = await social("people", { q: this.peopleQ.trim() }).catch(() => null);
      return /* @__PURE__ */ h(Page, { title: "社群" }, this.socialTabs(), /* @__PURE__ */ h(Search, { value: this.peopleQ, placeholder: "用暱稱找人", onInput: (t) => {
        this.peopleQ = t;
      } }), /* @__PURE__ */ h(Section, { title: this.peopleQ.trim() ? "符合的帳號" : "最近有新紀錄的人", hint: "只會列出公開個人頁的帳號。" }, !r ? /* @__PURE__ */ h(Note, { kind: "warn", text: "暫時讀不到" }) : r.list.length ? r.list.map((u) => this.userItem(u)) : /* @__PURE__ */ h(Note, { text: this.peopleQ.trim() ? "找不到這個暱稱（對方可能沒有公開個人頁）。" : "目前還沒有人公開片單。" })));
    }
    let list = [], failed = "";
    try {
      list = (await social("activity")).list || [];
      this.setUnread(0);
      if (this.meMem) this.meMem.data = { ...this.meMem.data, unread: 0 };
    } catch (e) {
      failed = String(e?.message || e);
    }
    const row = (a) => {
      const names = a.who.map((w) => w.name);
      const rest = a.n - names.length;
      const whoText = names.length ? names.join("、") + (rest > 0 ? ` 和另外 ${rest} 人` : "") : a.n > 1 ? `${a.n} 個人` : "有人";
      const quote = (t) => t ? `「${t}${Array.from(t).length >= 40 ? "…" : ""}」` : "";
      const what = a.kind === "up" ? `推了你在《${a.title}》的短評${quote(a.px)}` : a.kind === "down" ? `噓了你在《${a.title}》的短評${quote(a.px)}` : a.kind === "reply" ? `在《${a.title}》回覆你：${a.x || ""}` : a.kind === "mention" ? `在《${a.title}》提到你：${a.x || ""}` : a.returned ? "也回追你了" : "開始追蹤你";
      const open = a.kind === "follow" ? names.length ? () => this.go(() => this.profileView(names[0]), "讀取個人頁…") : void 0 : () => {
        this.noteReset();
        if (a.px) this.noteFocus = { x: a.px, at: Date.now(), head: true };
        this.go(() => this.notesView(a.title || ""), "讀取短評…");
      };
      const first = a.who[0];
      const mark = a.kind === "up" ? "▲" : a.kind === "down" ? "▼" : a.kind === "reply" ? "↩" : a.kind === "mention" ? "@" : "＋";
      return /* @__PURE__ */ h("div", { class: "ac" + (a.fresh ? " fresh" : "") }, /* @__PURE__ */ h("button", { class: "ac-main", onTap: open }, /* @__PURE__ */ h("span", { class: "ac-av" }, first ? this.avatar(first) : /* @__PURE__ */ h("span", { class: "av anon", "aria-hidden": "true" }, a.kind === "down" ? "？" : "匿"), a.who[1] ? /* @__PURE__ */ h("span", { class: "ac-av2" }, this.avatar(a.who[1])) : null, /* @__PURE__ */ h("i", { class: "ac-mark " + a.kind, "aria-hidden": "true" }, mark)), /* @__PURE__ */ h("span", { class: "ac-text" }, a.kind === "down" ? /* @__PURE__ */ h("b", null, a.n > 1 ? `${a.n} 個人` : "有人") : /* @__PURE__ */ h("b", null, esc(whoText)), " ", esc(what), /* @__PURE__ */ h("em", null, "・", esc(agoLabel(a.at))))), a.kind === "follow" && names.length === 1 && !a.back ? /* @__PURE__ */ h("button", { class: "ac-btn go", onTap: async () => {
        try {
          await social("follow", { name: names[0], on: true });
          this.meMem = null;
          await this.ui.toast(`已追蹤 ${names[0]}`);
        } catch (e) {
          await this.ui.toast(String(e?.message || e));
        }
      } }, "回追") : a.kind === "follow" && a.back ? /* @__PURE__ */ h("span", { class: "ac-btn" }, "互相追蹤") : null);
    };
    const week = Date.now() - 7 * 864e5;
    const fresh = list.filter((a) => a.fresh), recent = list.filter((a) => !a.fresh && a.at >= week), older = list.filter((a) => !a.fresh && a.at < week);
    return /* @__PURE__ */ h(Page, { title: "社群" }, this.socialTabs(), failed ? /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { kind: "warn", text: failed })) : !list.length ? /* @__PURE__ */ h(Section, { hint: "噓只會顯示人數，不會顯示是誰。" }, /* @__PURE__ */ h(Note, { text: "還沒有通知。有人推、噓或回覆你的短評，或是追蹤你，會出現在這裡。" })) : /* @__PURE__ */ h(Fragment, null, fresh.length ? /* @__PURE__ */ h(Section, { title: "新的" }, /* @__PURE__ */ h("div", { class: "ac-list" }, fresh.map(row))) : null, recent.length ? /* @__PURE__ */ h(Section, { title: "過去 7 天" }, /* @__PURE__ */ h("div", { class: "ac-list" }, recent.map(row))) : null, older.length ? /* @__PURE__ */ h(Section, { title: "更早" }, /* @__PURE__ */ h("div", { class: "ac-list" }, older.map(row))) : null, /* @__PURE__ */ h("p", { class: "hint" }, "噓只會顯示人數，不會顯示是誰。沒有公開個人頁的人會顯示成「有人」。")));
  }
  // 剛進回饋頁：跟伺服器要最新的（之後在這一頁裡點來點去不用每次重讀）
  /** 意見回饋頁：上面選分類、寫內容送出；下面是自己送過的，每一則有處理狀態和站長的回覆 */
  async feedbackView() {
    let list = [], failed = "";
    try {
      list = feedbackSent() ? await loadMyFeedback(this.fbForce) : [];
      this.fbForce = false;
    } catch (e) {
      failed = String(e?.message || e);
    }
    if (list.some((f) => f.reply)) feedbackMarkSeen();
    const cat = FEEDBACK_CATS.find((c) => c.id === this.fbCat) || null;
    const keep = (v) => {
      if (v && typeof v.t === "string") this.fbDraft = v.t;
    };
    const submit = async (v) => {
      keep(v);
      const text = this.fbDraft.trim();
      if (!cat) {
        await this.ui.toast("先選一個分類");
        return;
      }
      if (Array.from(text).length < 5) {
        await this.ui.toast("內容再多寫一點（至少 5 個字）");
        return;
      }
      try {
        await sendFeedback(cat.id, text, false ? this.isStandalone() ? "web-app" : "web" : "scriptable", "2026.11.24-2342");
        this.fbDraft = "";
        this.fbCat = "";
        await this.ui.toast("已送出，謝謝你的回饋");
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    return /* @__PURE__ */ h(Page, { title: "意見回饋", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: "寫給站長", hint: "不用留聯絡方式：站長的回覆和處理狀態會顯示在這一頁下面（這台裝置才看得到）。請不要寫個人資料。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("div", { class: "fb-cats" }, FEEDBACK_CATS.map((c) => /* @__PURE__ */ h("button", { class: "cm-tag" + (c.id === this.fbCat ? " on" : ""), "aria-pressed": c.id === this.fbCat ? "true" : "false", onTap: (v) => {
      keep(v);
      this.fbCat = c.id;
    } }, esc(c.label)))), /* @__PURE__ */ h("textarea", { class: "fb-area", name: "t", maxlength: String(FEEDBACK_MAX), placeholder: cat ? cat.hint : "先選上面的分類，再寫內容" }, esc(this.fbDraft)), /* @__PURE__ */ h(Button, { label: "送出", onTap: submit }))), /* @__PURE__ */ h(Section, { title: `我的回饋（${list.length}）` }, failed ? /* @__PURE__ */ h(Note, { kind: "warn", text: failed }) : null, list.length ? /* @__PURE__ */ h("div", { class: "nt-list" }, list.map((f) => this.feedbackRow(f))) : failed ? null : /* @__PURE__ */ h(Note, { text: "還沒有送過回饋。" })));
  }
  /** 一則回饋：分類、處理狀態、日期、內容、站長的回覆。使用者那一頁和管理員那一頁共用 */
  feedbackRow(f, onTap) {
    const body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("div", { class: "nt-head" }, /* @__PURE__ */ h("span", { class: "fb-tag" }, esc(feedbackCat(f.cat))), /* @__PURE__ */ h("span", { class: "fb-tag " + f.status }, esc(FEEDBACK_STATUS[f.status] || f.status)), /* @__PURE__ */ h("span", { class: "nt-date" }, esc(noteDate(f.at)), f.plat ? `｜${f.plat} ${f.ver || ""}` : ""), onTap ? /* @__PURE__ */ h("span", { class: "nt-rep" }, "處理 ›") : null), /* @__PURE__ */ h("div", { class: "fb-text" }, esc(f.text)), f.reply ? /* @__PURE__ */ h("div", { class: "fb-reply" }, /* @__PURE__ */ h("b", null, "站長的回覆｜", esc(noteDate(f.rat))), esc(f.reply)) : null);
    return onTap ? /* @__PURE__ */ h("div", { class: "nt", role: "button", onTap }, body) : /* @__PURE__ */ h("div", { class: "nt" }, body);
  }
  // 處理某一則時打到一半的回覆
  async adminFeedbackView() {
    const sy = this.sync();
    let list = [], open = 0, failed = "";
    try {
      const r = await sy.adm("fb", { op: "list" });
      list = r.list || [];
      open = r.open || 0;
    } catch (e) {
      failed = String(e?.message || e);
    }
    const shown = this.adminFbTab === "open" ? list.filter((f) => f.status === "new" || f.status === "doing") : list;
    return /* @__PURE__ */ h(Page, { title: "意見回饋", subtitle: "管理員專區", onBack: () => this.back() }, /* @__PURE__ */ h(Chips, { tabs: true }, /* @__PURE__ */ h(Chip, { label: `待處理（${open}）`, muted: this.adminFbTab !== "open", onTap: () => {
      this.adminFbTab = "open";
    } }), /* @__PURE__ */ h(Chip, { label: `全部（${list.length}）`, muted: this.adminFbTab !== "all", onTap: () => {
      this.adminFbTab = "all";
    } })), failed ? /* @__PURE__ */ h(Note, { kind: "warn", text: failed }) : /* @__PURE__ */ h(Section, { hint: "點一則進去回覆、改處理狀態。使用者會在他的「設定 → 意見回饋」看到狀態和回覆。" }, shown.length ? /* @__PURE__ */ h("div", { class: "nt-list" }, shown.map((f) => this.feedbackRow(f, () => {
      this.adminFbStatus = f.status;
      this.adminFbReply = null;
      this.go(() => this.adminFeedbackItemView(f));
    }))) : /* @__PURE__ */ h(Note, { text: this.adminFbTab === "open" ? "目前沒有待處理的回饋。" : "還沒有人送回饋。" })));
  }
  adminFeedbackItemView(f) {
    const sy = this.sync();
    const reply = this.adminFbReply === null ? f.reply : this.adminFbReply;
    const keep = (v) => {
      if (v && typeof v.r === "string") this.adminFbReply = v.r;
    };
    return /* @__PURE__ */ h(Page, { title: "處理回饋", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: "使用者寫的" }, /* @__PURE__ */ h("div", { class: "nt-list" }, this.feedbackRow({ ...f, reply: "" }))), /* @__PURE__ */ h(Section, { title: "處理狀態" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("div", { class: "fb-cats" }, Object.keys(FEEDBACK_STATUS).map((s) => /* @__PURE__ */ h("button", { class: "cm-tag" + (s === this.adminFbStatus ? " on" : ""), "aria-pressed": s === this.adminFbStatus ? "true" : "false", onTap: (v) => {
      keep(v);
      this.adminFbStatus = s;
    } }, esc(FEEDBACK_STATUS[s])))))), /* @__PURE__ */ h(Section, { title: "回覆", hint: "可以留空（只改狀態）。回覆只有送這則回饋的那台裝置看得到；清空再儲存 = 收回回覆。" }, /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("textarea", { class: "fb-area", name: "r", maxlength: String(FEEDBACK_MAX), placeholder: "寫給這位使用者的回覆" }, esc(reply)), /* @__PURE__ */ h(Button, { label: "儲存", onTap: async (v) => {
      keep(v);
      try {
        await sy.adm("fb", { op: "update", id: f.id, status: this.adminFbStatus, reply: String(this.adminFbReply === null ? f.reply : this.adminFbReply) });
        await this.ui.toast("已儲存");
        this.back();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    } }), /* @__PURE__ */ h(Button, { label: "刪除這則回饋", kind: "danger", onTap: async () => {
      try {
        await sy.adm("fb", { op: "delete", id: f.id });
        await this.ui.toast("已刪除");
        this.back();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    } }))));
  }
  /** 管理員名單：站長本人（根管理員）存在伺服器的加密設定裡，這裡改不到；其他管理員可以在這裡新增、移除 */
  /** 管理員：用量。最近 14 天每天幾台裝置、各類請求幾次（伺服器自己數的約略值；日期是 UTC，跟 Cloudflare 每日額度同一個算法） */
  async adminUsageView() {
    const sy = this.sync();
    let days = [], today = "", failed = "";
    try {
      const r = await sy.adm("usage", {});
      days = r.days || [];
      today = r.today || "";
    } catch (e) {
      failed = String(e?.message || e);
    }
    const LIMIT = 1e5;
    const NAMES = [["fetch", "查場次"], ["social", "社群／短評"], ["sync", "同步／登入"], ["push", "通知"], ["version", "檢查更新"], ["page", "頁面"], ["feedback", "回饋"], ["api", "其他"]];
    const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+$)/g, ",");
    const row = (d) => {
      const total = NAMES.reduce((a, [k]) => a + (d.n[k] || 0), 0);
      const hit = d.n["fetch-hit"] || 0, f = d.n.fetch || 0;
      const parts = NAMES.filter(([k]) => d.n[k]).map(([k, label]) => `${label} ${num(d.n[k])}`).join("、");
      const pct = Math.round(total / LIMIT * 1e3) / 10;
      return /* @__PURE__ */ h("div", { class: "us-day" }, /* @__PURE__ */ h("div", { class: "us-top" }, /* @__PURE__ */ h("b", null, esc(d.day.slice(5).replace("-", "/")), d.day === today ? "（今天）" : ""), /* @__PURE__ */ h("span", null, num(total), " 個請求｜", pct, "%")), /* @__PURE__ */ h("div", { class: "us-bar" }, /* @__PURE__ */ h("i", { style: `width:${Math.min(100, Math.max(1, pct))}%`, class: pct >= 80 ? "bad" : pct >= 50 ? "warn" : "" })), /* @__PURE__ */ h("div", { class: "us-sub2" }, d.devices ? `約 ${num(d.devices)} 台裝置，平均每台 ${num(total / d.devices)} 個` : "裝置數還沒有資料"), /* @__PURE__ */ h("div", { class: "us-sub2" }, esc(parts), f ? `｜查場次有 ${Math.round(hit / f * 100)}% 直接用暫存` : ""));
    };
    return /* @__PURE__ */ h(Page, { title: "用量", subtitle: "最近 14 天", onBack: () => this.back() }, failed ? /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { kind: "warn", text: failed })) : !days.length ? /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Note, { text: "還沒有資料。這個統計從上線那一刻開始數，過幾分鐘再來看。" })) : /* @__PURE__ */ h(Section, { hint: "百分比是跟 Cloudflare 免費方案的每日 100,000 個請求比（只算網頁版這一支，評分伺服器另外算，量很小）。日期用世界標準時間：每天台灣時間早上 8 點換日，額度也是那時候重算。數字是約略值，會比 Cloudflare 後台略少。裝置數靠每天隨機更換的匿名代號估算，不含還沒更新到新版的人。" }, /* @__PURE__ */ h("div", { class: "us-days" }, days.map(row))));
  }
  async adminListView() {
    const sy = this.sync();
    let root = [], extra = [], failed = "";
    try {
      const r = await sy.adm("admins", { op: "list" });
      root = r.root || [];
      extra = r.extra || [];
    } catch (e) {
      failed = String(e?.message || e);
    }
    const change = (op, email, done) => async () => {
      try {
        await sy.adm("admins", { op, email });
        await this.ui.toast(done);
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    return /* @__PURE__ */ h(Page, { title: "管理員名單", onBack: () => this.back() }, failed ? /* @__PURE__ */ h(Note, { kind: "warn", text: failed }) : /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Section, { title: "站長", hint: "存在伺服器的加密設定裡，任何人都讀不出來、這裡也改不到（避免被誤刪而進不來）。要換的話到 Cloudflare 後台改。" }, root.map((e) => /* @__PURE__ */ h(Item, { icon: "👑", title: e, chevron: false }))), /* @__PURE__ */ h(Section, { title: `其他管理員（${extra.length}）`, hint: "新增後，對方要登出再用那個 Google 帳號重新登入一次才會生效。移除後立刻失效。" }, extra.map((e) => /* @__PURE__ */ h(Item, { icon: "👤", title: e, chevron: false, action: { label: "移除", hint: "移除這位管理員", onTap: change("remove", e, "已移除") } })), /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("input", { class: "field", name: "e", type: "email", autocomplete: "off", autocapitalize: "off", placeholder: "要新增的 Google 帳號（email）" }), /* @__PURE__ */ h(Button, { label: "新增管理員", onTap: async (v) => {
      const e = String(v.e || "").trim();
      if (!e) {
        await this.ui.toast("先填 email");
        return;
      }
      await change("add", e, "已新增")();
    } })))));
  }
  async syncView() {
    const sy = this.sync();
    if (sy && !sy.on()) this.syncWho = null;
    const who = this.syncWho;
    return /* @__PURE__ */ h(Page, { title: "用 Google 帳號同步", onBack: () => this.back() }, this.syncSection());
  }
  // 短評管理看哪一份：flagged 被檢舉的／recent 最近的
  /** 管理員專區：短評的人工審核。「待複查」是被檢舉過或被自動隱藏的；「最近的短評」是全部看得到的（新的在前），可以主動巡。
   *  每則可以隱藏、還原（之後不再被自動隱藏）、刪除。只有管理員名單裡的 Google 帳號進得來，伺服器每個動作都會再驗一次 */
  async adminNotesView() {
    const sy = this.sync();
    const WHY = { spoiler: "劇透", abuse: "不當內容", spam: "廣告" };
    let rows = [], total = 0, failed = "";
    try {
      if (this.adminTab === "recent") {
        const r = await sy.admin({ op: "recent" });
        rows = r.recent || [];
        total = r.total || rows.length;
      } else {
        const r = await sy.admin({ op: "flagged" });
        for (const k of Object.keys(r.flagged || {})) for (const n of r.flagged[k]) rows.push({ m: k, ...n });
        rows.sort((a, b) => (a.keep ? 1 : 0) - (b.keep ? 1 : 0) || b.at - a.at);
        total = rows.length;
      }
    } catch (e) {
      failed = String(e?.message || e);
    }
    const act = (op, n, done) => async () => {
      try {
        await sy.admin({ op, m: n.m, id: n.id });
        await this.ui.toast(done);
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    const row = (n) => {
      const why = Object.keys(n.why || {}).map((w) => `${WHY[w] || w} ${n.why[w]}`).join("、");
      const state = n.hidden ? "已隱藏" : n.keep ? "已還原" : "顯示中";
      return /* @__PURE__ */ h("div", { class: "nt" }, /* @__PURE__ */ h("div", { class: "nt-head" }, /* @__PURE__ */ h("span", { class: "nt-score" + (n.hidden ? " bad" : n.keep ? " good" : "") }, state), n.sp ? /* @__PURE__ */ h("span", { class: "nt-sp" }, "可能有雷") : null, /* @__PURE__ */ h("span", { class: "nt-date" }, esc(noteDate(n.at)), n.s ? `｜${n.s} 分` : "")), /* @__PURE__ */ h("div", { class: "nt-text" }, esc(n.x)), /* @__PURE__ */ h("div", { class: "nt-meta" }, esc(n.m), why ? `｜檢舉：${why}` : ""), /* @__PURE__ */ h("div", { class: "nt-acts" }, n.hidden ? /* @__PURE__ */ h("button", { onTap: act("restore", n, "已還原，之後不會再被自動隱藏") }, "還原") : /* @__PURE__ */ h("button", { onTap: act("hide", n, "已隱藏") }, "隱藏"), !n.hidden && !n.keep && why ? /* @__PURE__ */ h("button", { onTap: act("restore", n, "已標成沒問題，之後不會再被自動隱藏") }, "沒問題") : null, /* @__PURE__ */ h("button", { class: "danger", onTap: act("delete", n, "已刪除") }, "刪除")));
    };
    return /* @__PURE__ */ h(Page, { title: "短評管理", onBack: () => this.back() }, /* @__PURE__ */ h(Chips, { tabs: true }, /* @__PURE__ */ h(Chip, { label: "待複查", muted: this.adminTab !== "flagged", onTap: () => {
      this.adminTab = "flagged";
    } }), /* @__PURE__ */ h(Chip, { label: "最近的短評", muted: this.adminTab !== "recent", onTap: () => {
      this.adminTab = "recent";
    } })), failed ? /* @__PURE__ */ h(Note, { kind: "warn", text: failed }) : /* @__PURE__ */ h(Section, { title: this.adminTab === "recent" ? `最近的短評（${total}）` : `被檢舉或被隱藏的（${total}）`, hint: this.adminTab === "recent" ? "所有看得到的短評，新的在前（最多列 200 則）。" : "隱藏：別人看不到，作者自己看得到提示。還原／沒問題：恢復顯示，之後不再被自動隱藏。刪除：直接拿掉，救不回來。" }, rows.length ? /* @__PURE__ */ h("div", { class: "nt-list" }, rows.map(row)) : /* @__PURE__ */ h(Note, { text: this.adminTab === "recent" ? "還沒有人寫短評。" : "目前沒有要複查的短評。" })));
  }
  syncSection() {
    const sy = this.sync();
    if (!sy) return "";
    if (!sy.on())
      return /* @__PURE__ */ h(Section, { hint: this.syncNote || "登入後，收藏影城、收藏電影、收藏發行商和各項設定會存到你的帳號，在別的裝置或瀏覽器登入同一個帳號就會帶過來。伺服器只存帳號的識別碼（經過雜湊）和設定；你的 email 只留在這台裝置上顯示用，伺服器不存。不登入也能照常使用。" }, /* @__PURE__ */ h(Item, { icon: "🔄", title: "用 Google 登入來同步", subtitle: "例如讓主畫面的 App 和 Safari 用同一份收藏", accent: true, onTap: () => sy.login() }));
    return /* @__PURE__ */ h(Section, { hint: this.syncNote || "已登入 Google，設定有變動會自動同步。通知要在每台裝置各自開啟。" }, /* @__PURE__ */ h(Item, { icon: "✅", title: "已登入，自動同步中", subtitle: "點一下立刻同步一次", chevron: false, onTap: async () => {
      const r = await sy.pull();
      if (r && r.data && r.at > sy.at()) {
        this.syncMute = true;
        this.settings = syncApply(this.settings, r.data);
        saveSettings(this.settings);
        this.syncMute = false;
        sy.setAt(r.at);
        this.pushSync();
        await this.ui.toast("已帶入帳號裡比較新的設定");
      } else await this.ui.toast(await sy.push(syncPick(this.settings)) ? "已同步" : "同步失敗，請稍後再試");
    } }), /* @__PURE__ */ h(Item, { icon: "🚪", title: "登出", subtitle: "這台的收藏會留著，只是不再同步", chevron: false, onTap: async () => {
      await sy.logout();
      forgetMyVotes();
      this.syncWho = null;
      this.diaryMem = null;
      this.meMem = null;
      this.hasProfile = null;
      this.syncNote = "";
      this.setUnread(0);
      this.pushSync();
      await this.ui.toast("已登出");
    } }), this.hasProfile !== false ? /* @__PURE__ */ h(Item, { icon: "🧹", title: "只刪除我的片單和個人檔案", subtitle: "片單、暱稱、追蹤關係、用帳號評的分和短評會刪掉，救不回來；不會登出，收藏和設定的同步不受影響", chevron: false, onTap: () => this.go(() => this.wipeConfirmView()) }) : null, /* @__PURE__ */ h(Item, { icon: "🗑", title: "刪除帳號裡的資料並登出", subtitle: "伺服器上的設定、片單、暱稱和你用帳號評的分都會刪掉，所有裝置都會登出；這台的收藏會留著", chevron: false, onTap: async () => {
      await this.wipeSocial().catch(() => void 0);
      await sy.wipe();
      this.syncWho = null;
      this.syncNote = "";
      this.pushSync();
      await this.ui.toast("已刪除並登出");
    } }));
  }
  // 設定頁「算哪些影城」的選項有沒有展開
  /** 網頁版的通知介面（web/shim.ts 的 __push）；Scriptable 版沒有 */
  push() {
    return false ? globalThis.__push : null;
  }
  /** 收藏或通知種類變了：把最新的清單同步給通知伺服器（沒開通知時什麼都不做） */
  pushSync() {
    const p = this.push();
    if (p) p.sync(notifyPayload(this.settings)).catch(() => null);
  }
  /** 設定頁的「收藏電影通知」：依裝置的狀況顯示開啟按鈕、各種通知的開關，或說明為什麼不能用 */
  /** 設定頁的一列：點進去才是完整的通知設定 */
  async notifyLink() {
    const p = this.push();
    if (!p) return "";
    const state = await p.refresh().catch(() => "unsupported");
    const prefs = notifyPrefs(this.settings);
    const on = NOTIFY_KINDS.filter((k) => prefs[k.id]).map((k) => k.label.replace(/時$/, ""));
    const note = state === "on" ? on.length ? on.length > 3 ? `${on.slice(0, 3).join("、")}等 ${on.length} 種` : on.join("、") : "每一種通知都關著" : state === "needs-install" ? "要先把「片刻」加到主畫面" : state === "unsupported" ? "這個瀏覽器不支援" : state === "denied" ? "系統設定裡沒有允許通知" : "開放場次、上映、快下檔、影展開始時通知你";
    return /* @__PURE__ */ h(Section, { title: "通知" }, /* @__PURE__ */ h(Item, { icon: state === "on" ? "🔔" : "🔕", title: "收藏電影通知", subtitle: note, right: state === "on" ? "已開啟" : "未開啟", onTap: () => this.go(() => this.notifyView()) }));
  }
  /** 收藏的一部片：依它現在的狀態開對的頁面（有場次的電影頁、即將上映、影展片、票房資訊） */
  openFavRow(r) {
    const t = r.target;
    if (t.kind === "movie") this.go(() => this.movieView(t.m, ""), `讀取《${t.m.title}》的放映影城…`);
    else if (t.kind === "soon") this.go(() => this.soonMovieView(t.u), `讀取《${t.u.title}》…`);
    else if (t.kind === "fest") this.go(() => this.festivalFilmView(t.f, t.film));
    else if (t.kind === "box") this.go(() => this.boxMovieView(t.x), `讀取《${t.x.name}》…`);
    else this.go(() => this.favMovieView(r.fav), `讀取《${r.fav.title}》…`);
  }
  /** 最近的通知：這台裝置收過的（存在裝置上，最多 50 則、30 天），新的在前；點了開那部片 */
  async notifyLogView() {
    const p = this.push();
    const list = p && p.log ? await p.log().catch(() => []) : [];
    const favs = this.settings.favMovies || [];
    const today = todayTPE();
    const when = (at) => {
      const d = new Date(at + 8 * 36e5), day = d.toISOString().slice(0, 10), hm = d.toISOString().slice(11, 16);
      return day === today ? `今天 ${hm}` : `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))} ${hm}`;
    };
    const open = async (e) => {
      const kind = e.tag.split(":")[0], key = e.tag.slice(kind.length + 1);
      if (kind === "week") {
        this.movieMode = "soon";
        return this.switchTab("movies");
      }
      if (kind === "flist") {
        this.movieMode = "fest";
        return this.switchTab("movies");
      }
      const fav = favs.find((f) => f.key === key);
      if (!fav) return void await this.ui.toast(kind === "test" ? "這是測試通知" : "這部片已經不在收藏裡了");
      const row = (await favMovieRows(this.settings).catch(() => [])).find((r) => r.fav.key === key);
      if (row) this.openFavRow(row);
      else this.go(() => this.favMovieView(fav), `讀取《${fav.title}》…`);
    };
    return /* @__PURE__ */ h(Page, { title: "最近的通知", subtitle: list.length ? `${list.length} 則` : "", onBack: () => this.back() }, list.length ? /* @__PURE__ */ h(Section, { hint: "只保留這台裝置最近 30 天收到的通知（最多 50 則），存在裝置上、不會傳到伺服器。" }, list.map((e) => {
      const fav = favs.find((f) => f.key === e.tag.slice(e.tag.indexOf(":") + 1));
      return /* @__PURE__ */ h(Item, { thumb: fav ? { src: fav.poster ? posterSrc(fav.poster) : "", url: fav.poster } : void 0, icon: fav ? void 0 : e.tag.startsWith("week") ? "🗓" : e.tag.startsWith("flist") ? "🎪" : "🔔", title: e.title, subtitle: [e.body, when(e.at)].filter(Boolean).join("\n"), onTap: () => open(e) });
    }), /* @__PURE__ */ h(Item, { icon: "🗑", title: "清除紀錄", chevron: false, onTap: async () => {
      await p.clearLog();
      await this.ui.toast("已清除");
    } })) : /* @__PURE__ */ h(Empty, { icon: "🔔", text: "還沒有收到通知。之後收到的會列在這裡。" }));
  }
  async notifyView() {
    const p = this.push();
    const logCount = p && p.log && p.state() === "on" ? (await p.log().catch(() => [])).length : -1;
    return /* @__PURE__ */ h(Page, { title: "收藏電影通知", onBack: () => this.back() }, logCount >= 0 ? /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🕘", title: "最近的通知", right: logCount ? `${logCount} 則` : "還沒有", onTap: () => this.go(() => this.notifyLogView()) })) : null, await this.notifySection());
  }
  async notifySection() {
    const p = this.push();
    if (!p) return "";
    const state = await p.refresh().catch(() => "unsupported");
    const prefs = notifyPrefs(this.settings);
    const n = (this.settings.favMovies || []).length;
    if (state === "needs-install")
      return /* @__PURE__ */ h(Section, { title: "收藏電影通知", hint: "iPhone 和 iPad 要先把「片刻」加到主畫面，從主畫面的圖示開啟後，才能開啟通知（這是 iOS 的規定）。" }, /* @__PURE__ */ h(Item, { icon: "🔔", title: "先加到主畫面", subtitle: "收藏電影開放場次、上映、快下檔時通知你", onTap: () => this.go(() => this.installView()) }));
    if (state === "unsupported")
      return /* @__PURE__ */ h(Section, { title: "收藏電影通知" }, /* @__PURE__ */ h(Item, { icon: "🔕", title: "這個瀏覽器不支援通知", subtitle: "可以改用 Safari（iPhone 要加到主畫面）、Chrome 或 Edge", chevron: false }));
    if (state === "denied")
      return /* @__PURE__ */ h(Section, { title: "收藏電影通知", hint: "到手機或瀏覽器的設定，把「片刻」的「通知」改成允許，再回來這裡開啟。" }, /* @__PURE__ */ h(Item, { icon: "🔕", title: "通知被關掉了", subtitle: "系統設定裡沒有允許「片刻」發通知", chevron: false }));
    if (state !== "on")
      return /* @__PURE__ */ h(Section, { title: "收藏電影通知", hint: "開啟後，你收藏的片名會存在我們的伺服器上，用來判斷什麼時候通知你；不需要帳號，也不會記錄你是誰。隨時可以關閉，關閉時伺服器上的資料會一起刪掉。" }, /* @__PURE__ */ h(Item, { icon: "🔔", title: "收藏電影有動態時通知我", subtitle: n ? `目前收藏了 ${n} 部：開放場次、上映、快下檔、影展開始時通知` : "開放場次、上映、快下檔、影展開始時通知。先開著，之後收藏的片都會算進去", chevron: false }), /* @__PURE__ */ h("button", { class: "btn primary", "data-perm": "notify", onTap: async () => {
        try {
          const st = await p.enable(notifyPayload(this.settings));
          await this.ui.toast(st === "on" ? "通知已開啟" : st === "denied" ? "沒有取得通知的權限" : "沒有開啟通知");
        } catch (e) {
          await this.ui.toast(String(e?.message || "開啟失敗，請稍後再試"));
        }
      } }, "開啟通知"));
    const set = (patch) => {
      this.settings.notify = { ...prefs, ...patch };
      saveSettings(this.settings);
      this.pushSync();
    };
    const toggle = (id) => {
      if (id === "fmt" && !prefs.fmt && !(prefs.fmts || []).length) return set({ fmt: true, fmts: ["IMAX"] });
      set({ [id]: !prefs[id] });
    };
    const fmts = prefs.fmts || [], preDays = prefs.preDays || 3, quiet = notifyQuiet(prefs);
    const hh = (h2) => `${String(h2).padStart(2, "0")}:00`;
    const hours = Array.from({ length: 24 }, (_, h2) => ({ id: String(h2), label: hh(h2) }));
    const noteOf = (k) => k.id === "end" ? endNote : k.id === "pre" ? `上映前 ${preDays} 天提醒一次` : k.id === "fmt" ? fmts.length ? `${fmts.join("、")} 開始有場次` : k.note : k.id === "favc" ? `${k.note}；目前收藏 ${this.settings.favorites.length} 間` : k.note;
    const row = (k) => /* @__PURE__ */ h(Item, { icon: prefs[k.id] ? "✅" : "⬜️", title: k.label, subtitle: noteOf(k), chevron: false, onTap: () => toggle(k.id) });
    const max = prefs.endMax || 3;
    const pick = notifyEndPick(prefs);
    const picked = pick.cities;
    const pickSet = (fav, cs) => set({ endFav: fav, endCities: cs, endScope: void 0 });
    if (!this.cinemas.length) this.cinemas = await loadCinemas().catch(() => []);
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99));
    const endNote = `${pick.fav && !picked.length ? "你收藏的影城裡" : notifyEndScope(prefs) + "合計"}，還在放映的影城從比較多變成剩下 ${max} 間以下`;
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Section, { title: "收藏電影有動態時", hint: "點一下開或關。" }, NOTIFY_KINDS.filter((k) => k.group === "fav").map(row)), prefs.pre ? /* @__PURE__ */ h(Section, { title: "上映前提醒" }, /* @__PURE__ */ h(Item, { kv: true, title: "幾天前提醒", right: `${preDays} 天前 ⇄`, chevron: false, onTap: () => set({ preDays: NOTIFY_PRE_STEPS[(NOTIFY_PRE_STEPS.indexOf(preDays) + 1) % NOTIFY_PRE_STEPS.length] }) })) : null, prefs.fmt ? /* @__PURE__ */ h(Section, { title: "特殊廳", hint: "可以選好幾種；可以左右滑動。只看連鎖影城今天和明天的場次。" }, /* @__PURE__ */ h(Chips, { scroll: true }, FORMATS.map((f) => /* @__PURE__ */ h(Chip, { label: f, muted: fmts.indexOf(f) < 0, onTap: () => set({ fmts: fmts.indexOf(f) < 0 ? [...fmts, f] : fmts.filter((z) => z !== f) }) })))) : null, prefs.end ? /* @__PURE__ */ h(Section, { title: "快下檔的條件", hint: this.notifyOpen ? "收藏影城和縣市可以一起選、縣市可以選好幾個，合起來算；可以左右滑動" : "" }, /* @__PURE__ */ h(Item, { kv: true, title: "剩下幾間以下", right: `${max} 間以下 ✎`, chevron: false, onTap: async () => {
      const ask = globalThis.prompt;
      const raw = typeof ask === "function" ? ask("放映的影城剩下幾間以下時通知？（1 到 30）", String(max)) : null;
      if (raw === null || raw === void 0) return;
      const n2 = Math.round(Number(String(raw).replace(/[０-９]/g, (c) => String(c.charCodeAt(0) - 65296)).trim()));
      if (!(n2 >= 1 && n2 <= 30)) return void await this.ui.toast("請輸入 1 到 30 的數字");
      set({ endMax: n2 });
    } }), /* @__PURE__ */ h(Item, { kv: true, title: "算哪些影城", right: `${notifyEndScope(prefs)} ${this.notifyOpen ? "▾" : "▸"}`, chevron: false, onTap: () => {
      this.notifyOpen = !this.notifyOpen;
    } }), this.notifyOpen ? /* @__PURE__ */ h(Chips, { scroll: true }, /* @__PURE__ */ h(Chip, { label: "全台", muted: pick.fav || picked.length > 0, onTap: () => pickSet(false, []) }), /* @__PURE__ */ h(Chip, { label: "收藏影城", sub: `${this.settings.favorites.length} 間`, muted: !pick.fav, onTap: () => pickSet(!pick.fav, picked) }), cities.map((c) => /* @__PURE__ */ h(Chip, { label: c, muted: picked.indexOf(c) < 0, onTap: () => pickSet(pick.fav, picked.indexOf(c) < 0 ? [...picked, c] : picked.filter((z) => z !== c)) }))) : null) : null, /* @__PURE__ */ h(Section, { title: "每週摘要與公告", hint: "不用收藏電影也會發；預設關閉，想要再打開。「收藏影城每週新片」要先有收藏影城。" }, NOTIFY_KINDS.filter((k) => k.group === "all").map(row)), /* @__PURE__ */ h(Section, { title: "社群", hint: signedIn() ? "事情發生的當下就通知（勿擾時段裡的留到之後）。" : "要先用 Google 帳號登入，這兩種才會發。" }, NOTIFY_KINDS.filter((k) => k.group === "social").map(row)), /* @__PURE__ */ h(Section, { title: "勿擾時段", hint: quiet.on ? `${hh(quiet.from)} 到${quiet.from > quiet.to ? "隔天" : ""} ${hh(quiet.to)} 不發通知，這段時間的通知留到之後再發。` : "任何時間都可能發通知。" }, /* @__PURE__ */ h(Item, { icon: quiet.on ? "✅" : "⬜️", title: "晚上不要通知我", chevron: false, onTap: () => set({ quietOn: !quiet.on }) }), quiet.on ? /* @__PURE__ */ h(PickRow, { title: "開始", name: "qfrom", value: String(quiet.from), options: hours, onPick: (v) => set({ quietFrom: Number(v) }) }) : null, quiet.on ? /* @__PURE__ */ h(PickRow, { title: "結束", name: "qto", value: String(quiet.to), options: hours, onPick: (v) => set({ quietTo: Number(v) }) }) : null), /* @__PURE__ */ h(Section, { hint: `已開啟${n ? `，目前收藏了 ${n} 部` : "；還沒有收藏的電影，到電影頁點愛心收藏"}。你收藏的片名存在我們的伺服器上，只用來判斷什麼時候通知；關閉通知時會一起刪掉。` }, /* @__PURE__ */ h(Item, { icon: "📨", title: "傳一則測試通知", subtitle: "確認這台裝置收得到", chevron: false, onTap: async () => {
      await this.ui.toast(await p.test() ? "已送出，幾秒內應該會收到" : "送不出去，請關閉通知後重新開啟");
    } }), /* @__PURE__ */ h(Item, { icon: "🔕", title: "關閉通知", subtitle: "停止通知，並刪除伺服器上的資料", chevron: false, onTap: async () => {
      await p.disable();
      await this.ui.toast("通知已關閉");
    } })));
  }
  /** 有沒有還沒看過的更新內容（設定分頁和那一列的小紅點） */
  logUnread() {
    return !!CHANGELOG_LATEST && this.settings.seenLog !== CHANGELOG_LATEST;
  }
  /** 更新內容：依日期分段、新的在上。進來就算看過，紅點消失；不會主動跳出來打擾 */
  changelogView() {
    if (this.logUnread()) {
      this.settings.seenLog = CHANGELOG_LATEST;
      saveSettings(this.settings);
    }
    return /* @__PURE__ */ h(Page, { title: "更新內容", subtitle: `目前版本 ${"2026.11.24-2342"}`, onBack: () => this.back() }, CHANGELOG.map((e) => /* @__PURE__ */ h(Section, { title: e.date }, e.items.map((it) => /* @__PURE__ */ h(Item, { title: it.text, tag: { text: it.kind === "new" ? "新功能" : "改進", tone: it.kind === "new" ? "now" : "soon" }, chevron: false })))), /* @__PURE__ */ h(Note, { text: "只列出比較有感的變動；修小錯、調整文字這類不會寫在這裡。" }));
  }
  async aboutView() {
    return /* @__PURE__ */ h(Page, { title: "關於", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint: "連鎖影城的場次來自場次通（twshowtimes.com），感謝場次通的整理；其他來自開眼電影網，以及誠品、光點、樂聲、內惟戲院官網。實際場次以影城公告為準。" }, /* @__PURE__ */ h(Item, { icon: "ℹ️", title: "關於與資料來源", accent: true, chevron: false, onTap: () => Safari.open(ABOUT_URL) }), /* @__PURE__ */ h(Item, { icon: "🔒", title: "隱私權政策", accent: true, chevron: false, onTap: () => Safari.open(PRIVACY_URL) }), /* @__PURE__ */ h(Item, { icon: "🙏", title: "前往場次通", subtitle: "比較各影城場次、看上映場數排行", accent: true, chevron: false, onTap: () => Safari.open("https://twshowtimes.com/") })));
  }
  async settingsView() {
    const fbList = feedbackSent() ? await Promise.race([loadMyFeedback().catch(() => null), sleep(600).then(() => null)]) : null;
    const fbNew = fbList ? feedbackUnread(fbList) : 0;
    this.calendarName = (await currentCalendar(this.settings)).title;
    return /* @__PURE__ */ h(Page, { title: "設定" }, await this.accountSection(), /* @__PURE__ */ h(Section, { title: "加入行事曆時", hint: `廣告預告：${ADS_NOTE}` }, /* @__PURE__ */ h(Item, { icon: "📅", title: "寫入的行事曆", subtitle: this.calendarName, onTap: () => this.go(() => this.calendarView()) }), /* @__PURE__ */ h(Item, { icon: "📺", title: "廣告預告", subtitle: `預計散場時間會加上 ${this.settings.ads} 分鐘`, right: "點一下切換", chevron: false, onTap: () => this.cycleAds() }), /* @__PURE__ */ h(Item, { icon: "🗺", title: "導航地圖", subtitle: "點地址、分享、行程備註的導航連結", right: MAPS_LABEL[this.settings.maps || "apple"], chevron: false, onTap: () => {
      this.settings.maps = this.settings.maps === "google" ? "apple" : "google";
      saveSettings(this.settings);
    } })), /* @__PURE__ */ h(Section, { title: "收藏" }, /* @__PURE__ */ h(Item, { icon: "★", title: "收藏影城", subtitle: "搜尋影城、增加或取消收藏", right: this.settings.favorites.length ? `${this.settings.favorites.length} 間` : "還沒有", onTap: () => {
      this.cinemaFavQuery = "";
      this.go(() => this.cinemaManageView());
    } }), /* @__PURE__ */ h(Item, { icon: "♥", title: "收藏電影", subtitle: "搜尋全部的電影、增加或取消收藏", right: (this.settings.favMovies || []).length ? `${(this.settings.favMovies || []).length} 部` : "還沒有", onTap: () => {
      this.favQuery = "";
      this.go(() => this.favManageView(), "讀取電影…");
    } }), /* @__PURE__ */ h(Item, { icon: "🏢", title: "收藏發行商", subtitle: "搜尋發行商、增加或取消收藏", right: (this.settings.favIssuers || []).length ? `${(this.settings.favIssuers || []).length} 家` : "還沒有", onTap: () => {
      this.issuerQuery = "";
      this.go(() => this.issuerManageView(), "讀取發行商…");
    } })), await this.notifyLink(), /* @__PURE__ */ h(Section, { title: "關於" }, false ? /* @__PURE__ */ h(Item, { icon: "📲", title: "加到主畫面", subtitle: "像 App 一樣從主畫面開啟，看圖示教學", onTap: () => this.go(() => this.installView()) }) : null, /* @__PURE__ */ h(Item, { icon: "ℹ️", title: "關於", subtitle: "資料來源、隱私權政策、場次通", onTap: () => this.go(() => this.aboutView()) }), /* @__PURE__ */ h(Item, { icon: "💬", title: "意見回饋", subtitle: fbNew ? "站長回覆你了，點進來看" : "回報問題、資料有誤，或建議新功能", right: fbNew ? "● 新回覆" : "", onTap: () => {
      this.fbCat = "";
      this.fbDraft = "";
      this.fbForce = true;
      this.go(() => this.feedbackView(), "讀取中…");
    } }), /* @__PURE__ */ h(Item, { icon: "📝", title: "更新內容", subtitle: this.logUnread() ? "有新的更新，點進來看看" : "最近改了什麼、多了什麼", right: this.logUnread() ? "● 新" : "", onTap: () => this.go(() => this.changelogView()) })), /* @__PURE__ */ h(
      "p",
      {
        class: "note version",
        onTap: async () => {
          Pasteboard.copy(`版本 ${"2026.11.24-2342"}`);
          await this.ui.toast("已複製版本號");
        }
      },
      `版本 ${"2026.11.24-2342"}`,
      "（點一下複製）"
    ), await this.versionNote());
  }
  async citiesView() {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const k = this.query.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : [];
    return /* @__PURE__ */ h(Page, { title: "依縣市找影院", subtitle: k ? `符合「${this.query.trim()}」的 ${hits.length} 間` : `全台 ${this.cinemas.length} 間`, onBack: () => this.back() }, /* @__PURE__ */ h(Search, { value: this.query, placeholder: "搜尋影城，例如：松仁、西門、in89、台南", onInput: (t) => {
      this.query = t;
    } }), k ? /* @__PURE__ */ h(Section, { title: `結果 ${hits.length} 間` }, hits.length ? null : /* @__PURE__ */ h(Note, { text: "找不到相符的影城，換個關鍵字試試。" }), hits.map((c) => this.cinemaItem(c))) : /* @__PURE__ */ h(Section, { title: "縣市", hint: "影城清單來自場次通與開眼電影網，會自動更新。" }, cities.map((city) => /* @__PURE__ */ h(Item, { title: city, badge: `${this.cinemas.filter((c) => c.city === city).length} 間`, onTap: () => this.go(() => this.cityView(city)) }))));
  }
  cinemaItem(c) {
    return /* @__PURE__ */ h(
      Item,
      {
        icon: this.settings.favorites.indexOf(c.id) >= 0 ? "★" : void 0,
        title: c.name,
        subtitle: `${c.city} ${c.district}`,
        onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)
      }
    );
  }
  cityView(city) {
    const list = this.cinemas.filter((c) => c.city === city);
    return /* @__PURE__ */ h(Page, { title: city, subtitle: `${list.length} 間`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, list.map((c) => this.cinemaItem(c))));
  }
  // ── 設定 ──
  async calendarView() {
    const cals = (await Calendar.forEvents()).filter((c) => c.allowsContentModifications);
    return /* @__PURE__ */ h(Page, { title: "寫入的行事曆", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint: "只列出可以新增行程的行事曆。" }, cals.map((c) => /* @__PURE__ */ h(
      Item,
      {
        title: c.title,
        right: c.title === this.calendarName ? "✓ 目前使用" : "",
        chevron: false,
        onTap: () => {
          this.settings.calendar = c.title;
          this.calendarName = c.title;
          saveSettings(this.settings);
          this.back();
        }
      }
    ))));
  }
  cycleAds() {
    const i = AD_STEPS.indexOf(this.settings.ads);
    this.settings.ads = AD_STEPS[(i + 1) % AD_STEPS.length];
    saveSettings(this.settings);
  }
  toggleFav(c) {
    const f = this.settings.favorites;
    const i = f.indexOf(c.id);
    if (i >= 0) f.splice(i, 1);
    else f.push(c.id);
    saveSettings(this.settings);
    this.pushSync();
  }
  // ── 影城：選日期 ──
  async cinemaView(c) {
    const { dates, address, notice, site } = await datesOf(c);
    const fav = this.settings.favorites.indexOf(c.id) >= 0;
    return /* @__PURE__ */ h(Page, { title: c.name, subtitle: `${c.city} ${c.district}`, onBack: () => this.back() }, address ? /* @__PURE__ */ h(Section, null, this.addressItem(c.name, address)) : null, /* @__PURE__ */ h(Section, { title: "選擇日期" }, dates.length ? null : /* @__PURE__ */ h(Empty, { icon: "🗓", text: "目前沒有公布的場次" }), dates.map((d) => /* @__PURE__ */ h(Item, { title: dateLabel(d), onTap: () => this.go(() => this.moviesView(c, d), `讀取 ${dateLabel(d)} 的片單…`) }))), notice ? /* @__PURE__ */ h(Note, { kind: "warn", text: notice }) : null, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: fav ? "★" : "☆", title: fav ? "取消收藏影城" : "收藏這間影城", chevron: false, onTap: () => this.toggleFav(c) }), site ? /* @__PURE__ */ h(Item, { icon: "🏠", title: "影城官網（訂票）", subtitle: site.replace(/^https?:\/\//, "").replace(/\/.*$/, ""), chevron: false, accent: true, onTap: () => Safari.open(site) }) : null, site !== c.url ? /* @__PURE__ */ h(Item, { icon: "🌐", title: c.source === "at" ? "以瀏覽器開啟開眼時刻表" : "以瀏覽器開啟場次通時刻表", chevron: false, accent: true, onTap: () => Safari.open(c.url) }) : null));
  }
  // ── 電影列表 ──
  async moviesView(c, date) {
    const r = await moviesOf(c, date);
    prefetchPosters(r.movies);
    const isToday = date === todayTPE();
    const now = nowHM();
    return /* @__PURE__ */ h(Page, { title: dateLabel(date), subtitle: `${c.name}｜${r.movies.length} 部電影`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, r.movies.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "這天沒有可讀取的場次" }), r.movies.map((m) => {
      const all = [].concat(...m.versions.map((v) => v.times));
      const left = isToday ? all.filter((t) => t > now || lateIsTonight(c.source, t)).length : all.length;
      const ended = isToday && left === 0;
      const sub = [m.runtime ? `${m.runtime} 分` : "片長未提供", m.rating, m.versions.map((v) => `${v.label} ${v.times.length} 場`).join("、")].filter(Boolean).join("｜");
      return /* @__PURE__ */ h(
        Item,
        {
          title: m.title,
          subtitle: sub,
          badge: ended ? "已結束" : isToday ? `剩 ${left} 場` : void 0,
          muted: ended,
          onTap: () => this.go(() => this.timesView(c, date, m, r))
        }
      );
    })));
  }
  /** 地址列：點一下導航、長按複製 */
  addressItem(name, address, title) {
    return /* @__PURE__ */ h(
      Item,
      {
        icon: "📍",
        title: title || address,
        subtitle: title ? address + "\n點一下導航・長按複製地址" : "點一下導航・長按複製地址",
        chevron: false,
        onTap: () => Safari.open(mapsUrl(name, address, this.settings.maps)),
        onLongPress: async () => {
          Pasteboard.copy(address);
          await this.ui.toast("已複製地址");
        }
      }
    );
  }
  /** 來源沒給片長時，自動查 TMDB／開眼補上（最多等 wait 毫秒，沒好就之後補畫）；回傳查到的片長 */
  async fillRuntime(m, wait = 2500) {
    if (m.runtime) return m.runtime;
    const job = foregroundTask(
      movieRuntime(m.title, m.slug, m.en).then((r) => {
        if (r && !m.runtime) {
          m.runtime = r.runtime;
          m.runtimeFrom = r.from;
        }
      }).catch(() => {
      })
    );
    await Promise.race([job, sleep(this.rerendering ? 0 : wait)]);
    if (!m.runtime) this.late.push(job);
    return m.runtime;
  }
  /** 海報、預告與評分：最多等 0.4 秒就先畫頁面（有快取的會直接出現），其餘讀好後各自補上。海報網址另外快查（不等預告） */
  async extras(title, slug, en) {
    const px = foregroundTask(movieExtras(title, slug).catch(() => null));
    const pr = foregroundTask(movieRatings(title, en, slug).catch(() => null));
    const pp = foregroundTask(moviePoster(title, slug, en).catch(() => ""));
    const pc = communityStats(title).catch(() => false);
    const wait = this.rerendering ? 0 : 400;
    const quick = (p2) => Promise.race([p2, sleep(wait).then(() => void 0)]);
    const [x, r, p, c] = await Promise.all([quick(px), quick(pr), quick(pp), quick(pc)]);
    const loading = x === void 0 || r === void 0 || p === void 0;
    const late = [x === void 0 ? px : null, r === void 0 ? pr : null, p === void 0 ? pp : null, c === void 0 ? pc : null].filter(Boolean);
    if (late.length) this.late = late;
    return { x: x ?? null, r: r ?? null, p: p || "", px, loading, c: c === void 0 ? communityCached(title) || void 0 : c };
  }
  // 排序：hot 熱門／new 最新／top 最多推／high 評分高到低／low 評分低到高
  /** 短評內文：@暱稱 變成可以點的連結（點了開那個人的個人頁） */
  noteBody(x) {
    return String(x || "").split(/(@[\p{L}\p{N}_]{2,16})/u).map((part, i) => i % 2 ? /* @__PURE__ */ h("button", { class: "at", onTap: () => this.go(() => this.profileView(part.slice(1)), "讀取個人頁…") }, esc(part)) : esc(part)).join("");
  }
  noteReset() {
    this.noteDraft = null;
    this.noteSpoil = null;
    this.noteAsk = "";
    this.noteShown = [];
    this.noteEdit = false;
    this.noteReplyTo = 0;
    this.noteReplyDraft = "";
    this.noteMenu = 0;
    this.noteFocus = null;
  }
  // 哪一則的「⋯」選單是開的
  async notesView(title) {
    let list = notesCached(title);
    let failed = "";
    try {
      list = await loadNotes(title);
    } catch (e) {
      if (!list) failed = String(e?.message || e);
    }
    const c = communityCached(title) || await communityStats(title).catch(() => null);
    const voted = c ? c.mine : 0;
    const notes = list ? list.notes : [];
    const tops = notes.filter((n) => !n.r);
    const mineCount = tops.filter((n) => n.mine).length;
    const maxMine = list && list.max || 5;
    const draft = this.noteDraft === null ? "" : this.noteDraft;
    const spoil = !!this.noteSpoil;
    const keep = (v) => {
      if (v && typeof v.x === "string") this.noteDraft = v.x;
      if (v && typeof v.rx === "string") this.noteReplyDraft = v.rx;
    };
    const say = async (job, done) => {
      try {
        await job;
        if (done) await this.ui.toast(done);
        return true;
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
        return false;
      }
    };
    const send = async (text, sp) => {
      if (await say(addNote(title, text, sp), "短評已送出")) {
        this.noteReset();
        await this.askNickname();
      }
    };
    const submit = async (v) => {
      keep(v);
      const text = String(this.noteDraft === null ? "" : this.noteDraft).replace(/\s+/g, " ").trim();
      if (!text) {
        await this.ui.toast("先寫一句再送出");
        return;
      }
      if (Array.from(text).length > noteMax()) {
        await this.ui.toast(`短評最多 ${noteMax()} 個字`);
        return;
      }
      if (!spoil && noteLooksSpoiler(text) && this.noteAsk !== text) {
        this.noteAsk = text;
        return;
      }
      await send(text, spoil);
    };
    const sendReply = async (to, v) => {
      keep(v);
      const text = this.noteReplyDraft.replace(/\s+/g, " ").trim();
      if (!text) {
        await this.ui.toast("先寫一句再送出");
        return;
      }
      if (Array.from(text).length > noteMax()) {
        await this.ui.toast(`回覆最多 ${noteMax()} 個字`);
        return;
      }
      if (await say(addNote(title, text, noteLooksSpoiler(text), to), "已回覆")) {
        this.noteReplyTo = 0;
        this.noteReplyDraft = "";
        await this.askNickname();
      }
    };
    const friends = signedIn() ? (await social("friends", { m: communityKey(title) }).catch(() => null) || { list: [] }).list : [];
    const quiet = friends.filter((e) => e.by && e.s && !e.x);
    const hasFollow = tops.some((n) => n.by && n.by.f);
    const hasSpoiler = tops.some((n) => n.sp);
    if (this.noteFilter === "follow" && !hasFollow) this.noteFilter = "all";
    if (this.noteFilter === "clean" && !hasSpoiler) this.noteFilter = "all";
    const byNew = (x, y) => y.at - x.at || y.id - x.id;
    const shown = tops.filter((n) => this.noteFilter === "follow" ? !!(n.by && n.by.f) || !!n.mine : this.noteFilter === "clean" ? !n.sp : true).sort((x, y) => this.noteSort === "new" ? byNew(x, y) : this.noteSort === "top" ? (y.p || 0) - (x.p || 0) || byNew(x, y) : this.noteSort === "high" ? y.s - x.s || byNew(x, y) : this.noteSort === "low" ? x.s - y.s || byNew(x, y) : noteHot(y) - noteHot(x) || byNew(x, y));
    const kidsOf = {};
    for (const n of notes) if (n.r) (kidsOf[n.r] ||= []).push(n);
    for (const k of Object.keys(kidsOf)) kidsOf[Number(k)].sort((x, y) => x.at - y.at || x.id - y.id);
    const SORTS = [{ id: "hot", label: "熱門" }, { id: "new", label: "最新" }, { id: "top", label: "最多推" }, { id: "high", label: "評分高到低" }, { id: "low", label: "評分低到高" }];
    const editing = this.noteEdit || !!this.noteAsk;
    const unsent = !!draft.trim();
    const nf = this.noteFocus;
    const focus = nf ? (nf.head ? notes.find((n) => !n.del && n.x.indexOf(nf.x) === 0) : tops.find((n) => n.x === nf.x)) || null : null;
    if (focus && !focus.r && shown.indexOf(focus) < 0) {
      this.noteFilter = "all";
      shown.push(focus);
    }
    if (focus && this.noteShown.indexOf(focus.id) < 0) this.noteShown = [...this.noteShown, focus.id];
    const total = notes.filter((n) => !n.del && !(n.hidden && !n.mine)).length;
    const ICO = {
      reply: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h9a7 7 0 0 1 7 7v3"/></svg>',
      up: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 4.5 12.5H9V20h6v-7.5h4.5z"/></svg>',
      down: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20 4.5 11.5H9V4h6v7.5h4.5z"/></svg>',
      more: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>'
    };
    const row = (n, depth) => {
      const kids = kidsOf[n.id] || [];
      const below = kids.length ? /* @__PURE__ */ h("div", { class: "th-kids" }, kids.map((k) => row(k, depth + 1))) : null;
      if (n.del || n.hidden && !n.mine) return /* @__PURE__ */ h("div", { class: "th" }, /* @__PURE__ */ h("div", { class: "th-gone" }, n.del ? "這則已經刪除" : "這則已被隱藏"), below);
      const p = n.p || 0;
      const sunk = p <= NOTE_FOLD_AT && !n.mine;
      const open = !n.sp && !sunk || this.noteShown.indexOf(n.id) >= 0;
      const reported = !!list && list.reported.indexOf(n.id) >= 0;
      const who = n.by ? n.by.name : n.mine ? "我" : "匿名";
      const toProfile = n.by ? (v) => {
        keep(v);
        this.go(() => this.profileView(n.by.name), "讀取個人頁…");
      } : void 0;
      const vote = (dir) => async (v) => {
        keep(v);
        await say(voteNote(title, n.id, n.my === dir ? 0 : dir), "");
      };
      const menu = this.noteMenu === n.id;
      const replying = this.noteReplyTo === n.id;
      return /* @__PURE__ */ h("div", { class: "th" + (n.mine ? " mine" : "") + (focus && focus.id === n.id ? " focus" : ""), "data-jump": focus && focus.id === n.id ? `${n.id}-${this.noteFocus.at}` : void 0 }, /* @__PURE__ */ h("div", { class: "th-head" }, n.by ? /* @__PURE__ */ h("button", { class: "th-av", "aria-label": `${n.by.name} 的個人頁`, onTap: toProfile }, this.avatar(n.by)) : /* @__PURE__ */ h("span", { class: "th-av" }, /* @__PURE__ */ h("span", { class: "av anon", "aria-hidden": "true" }, n.mine ? "我" : "匿")), toProfile ? /* @__PURE__ */ h("button", { class: "th-name", onTap: toProfile }, esc(who)) : /* @__PURE__ */ h("span", { class: "th-name dim" }, esc(who)), /* @__PURE__ */ h("span", { class: "th-time" }, "・", esc(noteDate(n.at))), n.by && n.by.f ? /* @__PURE__ */ h("span", { class: "th-f" }, "追蹤中") : null, n.s && !n.r ? /* @__PURE__ */ h("span", { class: "nt-score " + ratingTier("imdb", n.s) }, n.s, " 分") : null, n.sp ? /* @__PURE__ */ h("span", { class: "nt-sp" }, "有雷") : null), open ? /* @__PURE__ */ h("div", { class: "th-text" }, this.noteBody(n.x)) : /* @__PURE__ */ h("button", { class: "nt-cover", onTap: (v) => {
        keep(v);
        this.noteShown = [...this.noteShown, n.id];
      } }, sunk && !n.sp ? "被噓到摺疊了，點一下顯示" : "可能有雷，點一下顯示"), n.mine && n.hidden ? /* @__PURE__ */ h("div", { class: "th-warn" }, "這則被多人檢舉，目前別人看不到。") : null, /* @__PURE__ */ h("div", { class: "th-acts" }, /* @__PURE__ */ h("button", { class: "ib" + (menu ? " on" : ""), "aria-label": "更多", "aria-expanded": menu ? "true" : "false", onTap: (v) => {
        keep(v);
        this.noteMenu = menu ? 0 : n.id;
      } }, ICO.more), /* @__PURE__ */ h("button", { class: "ib" + (replying ? " on" : ""), "aria-label": "回覆", onTap: (v) => {
        keep(v);
        this.noteReplyDraft = "";
        this.noteReplyTo = replying ? 0 : n.id;
        this.noteMenu = 0;
      } }, ICO.reply), /* @__PURE__ */ h("span", { class: "th-vote" }, n.mine ? /* @__PURE__ */ h("span", { class: "ib off" }, ICO.up) : /* @__PURE__ */ h("button", { class: "ib" + (n.my === 1 ? " up" : ""), "aria-label": "推", "aria-pressed": n.my === 1 ? "true" : "false", onTap: vote(1) }, ICO.up), /* @__PURE__ */ h("b", { class: p > 0 ? "pos" : p < 0 ? "neg" : "", "aria-label": `推減噓：${p}` }, p), n.mine ? /* @__PURE__ */ h("span", { class: "ib off" }, ICO.down) : /* @__PURE__ */ h("button", { class: "ib" + (n.my === -1 ? " down" : ""), "aria-label": "噓", "aria-pressed": n.my === -1 ? "true" : "false", onTap: vote(-1) }, ICO.down))), menu ? /* @__PURE__ */ h("div", { class: "th-menu" }, n.mine ? /* @__PURE__ */ h("button", { class: "danger", onTap: async (v) => {
        keep(v);
        this.noteMenu = 0;
        await say(deleteNote(title, n.id), "已刪除");
      } }, "刪除這則") : reported ? /* @__PURE__ */ h("span", null, "已經檢舉過了") : /* @__PURE__ */ h("button", { onTap: (v) => {
        keep(v);
        this.noteMenu = 0;
        this.go(() => this.reportView(title, n));
      } }, "檢舉這則")) : null, replying ? /* @__PURE__ */ h("div", { class: "th-reply" }, /* @__PURE__ */ h("textarea", { class: "fb-area note", name: "rx", maxlength: String(noteMax()), placeholder: `回覆 ${who}（最多 ${noteMax()} 字）`, autofocus: true }, esc(this.noteReplyDraft)), /* @__PURE__ */ h("div", { class: "cmt-row" }, /* @__PURE__ */ h("span", { class: "sp" }), /* @__PURE__ */ h("button", { onTap: () => {
        this.noteReplyTo = 0;
        this.noteReplyDraft = "";
      } }, "取消"), /* @__PURE__ */ h("button", { class: "go", onTap: (v) => sendReply(n.id, v) }, "送出"))) : null, below);
    };
    return /* @__PURE__ */ h(Page, { title: "短評", subtitle: `《${title}》`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, !voted ? /* @__PURE__ */ h(Note, { text: "先替這部片評分，就可以寫短評。回覆、推和噓不用先評分。" }) : mineCount >= maxMine ? /* @__PURE__ */ h(Note, { text: `這部片你已經發了 ${maxMine} 則短評，先刪掉一則才能再發（回覆不受這個限制）。` }) : !editing ? (
      // 收起來的樣子：像留言區最上面那一格「寫點什麼…」，點了才展開
      /* @__PURE__ */ h("button", { class: "cmt-new", onTap: () => {
        this.noteEdit = true;
        this.noteReplyTo = 0;
      } }, /* @__PURE__ */ h("span", { class: "cmt-new-box" + (unsent ? " draft" : "") }, unsent ? esc(draft) : `${NOTE_PLACEHOLDER}…`), /* @__PURE__ */ h("i", null, unsent ? "還沒送出，繼續寫" : "寫短評"))
    ) : /* @__PURE__ */ h("div", { class: "nt-form" }, /* @__PURE__ */ h("button", { class: "hid", "data-fold": "", "aria-hidden": "true", tabindex: "-1", onTap: (v) => {
      keep(v);
      if (!this.noteAsk) this.noteEdit = false;
    } }), /* @__PURE__ */ h("textarea", { class: "fb-area note", name: "x", maxlength: String(noteMax()), placeholder: `${NOTE_PLACEHOLDER}（最多 ${noteMax()} 字）` }, esc(draft)), this.noteAsk ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Note, { kind: "warn", text: "這句看起來可能有雷。要標記「可能有雷」再送出嗎？" }), /* @__PURE__ */ h("div", { class: "cmt-row" }, /* @__PURE__ */ h("button", { onTap: () => {
      this.noteAsk = "";
    } }, "再改一下"), /* @__PURE__ */ h("span", { class: "sp" }), /* @__PURE__ */ h("button", { onTap: async (v) => {
      keep(v);
      await send(this.noteAsk, false);
    } }, "沒有雷，直接送出"), /* @__PURE__ */ h("button", { class: "go", onTap: async (v) => {
      keep(v);
      await send(this.noteAsk, true);
    } }, "標記後送出"))) : (
      // 一排搞定：左邊勾「可能有雷」，右邊取消、送出。發出去之後不能改（改了別人的推噓就不準了），只能刪掉重發
      /* @__PURE__ */ h("div", { class: "cmt-row" }, /* @__PURE__ */ h("button", { class: "cmt-spoil" + (spoil ? " on" : ""), "aria-pressed": spoil ? "true" : "false", "aria-label": "可能有雷：勾了以後預設摺疊，點了才會顯示", onTap: (v) => {
        keep(v);
        this.noteSpoil = !spoil;
      } }, /* @__PURE__ */ h("i", null, spoil ? "✓" : ""), "可能有雷"), /* @__PURE__ */ h("span", { class: "sp" }), /* @__PURE__ */ h("button", { onTap: () => {
        this.noteEdit = false;
        this.noteDraft = null;
        this.noteSpoil = null;
        this.noteAsk = "";
      } }, "取消"), /* @__PURE__ */ h("button", { class: "go", onTap: submit }, "送出"))
    ), mineCount ? /* @__PURE__ */ h("div", { class: "cm-tagnote" }, "這部片你已經發了 ", mineCount, "／", maxMine, " 則。發出去之後不能修改，只能刪掉重發。") : null)), /* @__PURE__ */ h(Section, { title: `短評（${total}）`, hint: `${NOTE_RULES}被噓到 ${NOTE_FOLD_AT} 以下的會自動摺疊。違規的可以從「⋯」檢舉。` }, tops.length > 1 || hasFollow ? /* @__PURE__ */ h("div", { class: "cmt-bar" }, /* @__PURE__ */ h("div", { class: "cmt-filters" }, /* @__PURE__ */ h("button", { class: "cm-tag" + (this.noteFilter === "all" ? " on" : ""), onTap: (v) => {
      keep(v);
      this.noteFilter = "all";
    } }, "全部"), hasFollow ? /* @__PURE__ */ h("button", { class: "cm-tag" + (this.noteFilter === "follow" ? " on" : ""), onTap: (v) => {
      keep(v);
      this.noteFilter = "follow";
    } }, "追蹤中") : null, hasSpoiler ? /* @__PURE__ */ h("button", { class: "cm-tag" + (this.noteFilter === "clean" ? " on" : ""), onTap: (v) => {
      keep(v);
      this.noteFilter = "clean";
    } }, "不看有雷的") : null), /* @__PURE__ */ h("select", { class: "sel", name: "ns", "aria-label": "排序", onInput: (v) => {
      keep(v);
      this.noteSort = v.ns || "hot";
    } }, SORTS.map((o) => /* @__PURE__ */ h("option", { value: o.id, selected: o.id === this.noteSort }, esc(o.label))))) : null, quiet.length ? /* @__PURE__ */ h("div", { class: "cmt-quiet" }, "你追蹤的人也評了分：", quiet.map((e) => /* @__PURE__ */ h("button", { onTap: (v) => {
      keep(v);
      this.go(() => this.profileView(e.by.name), "讀取個人頁…");
    } }, this.avatar(e.by), /* @__PURE__ */ h("span", null, esc(e.by.name)), /* @__PURE__ */ h("b", null, e.s, " 分")))) : null, failed ? /* @__PURE__ */ h(Note, { kind: "warn", text: failed }) : null, shown.length ? /* @__PURE__ */ h("div", { class: "th-list" }, shown.map((n) => row(n, 0))) : failed ? null : /* @__PURE__ */ h(Note, { text: tops.length ? "這個篩選下沒有短評。" : "還沒有人寫短評。" })));
  }
  /** 檢舉一則短評：選原因就送出 */
  reportView(title, n) {
    return /* @__PURE__ */ h(Page, { title: "檢舉短評", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: "要檢舉的短評" }, /* @__PURE__ */ h("div", { class: "nt-list" }, /* @__PURE__ */ h("div", { class: "nt" }, /* @__PURE__ */ h("div", { class: "nt-text" }, esc(n.x))))), /* @__PURE__ */ h(Section, { title: "原因", hint: "同一則被 2 個人檢舉劇透會自動摺疊，被 3 個人檢舉會自動隱藏。檢舉是匿名的。" }, REPORT_REASONS.map((r) => /* @__PURE__ */ h(Item, { title: r.label, subtitle: r.note, onTap: async () => {
      try {
        await reportNote(title, n.id, r.id);
        await this.ui.toast("已送出檢舉，謝謝");
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
      this.back();
    } }))));
  }
  // 哪一部片的「你的評分」是展開的（預設收起來，省空間）
  /** 存觀影紀錄（日期、方式、要不要只給自己看）。以伺服器回的那一筆為準更新畫面；觀影方式沒有真的存進去就明講 */
  async saveWatch(title, body, done) {
    const k = communityKey(title);
    try {
      const r = await social("entry", { m: k, title, ...body });
      const list = (this.diaryMem ? this.diaryMem.list : []).filter((x) => x.k !== k);
      this.diaryMem = { at: Date.now(), list: r.entry ? [r.entry, ...list] : list };
      const want = Array.isArray(body.how) ? body.how.slice().sort().join(",") : null;
      const got = (r.entry && r.entry.how || []).slice().sort().join(",");
      if (want !== null && want !== got) {
        await this.ui.toast("觀影方式沒有存進去，請過一分鐘再試一次");
        return;
      }
      await this.ui.toast(done);
    } catch (err) {
      await this.ui.toast(String(err?.message || err));
    }
  }
  /** 觀影時間、觀影方式兩列（電影頁的評分卡和片單裡的那一筆共用） */
  watchFields(title, e) {
    const seen = e ? e.seen : "", how = e && e.how || [];
    const save = (body, done) => this.saveWatch(title, body, done);
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("div", { class: "cm-tagrow" }, /* @__PURE__ */ h("span", { class: "cm-taghead" }, "觀影時間", seen === "?" ? "（已標記看過，沒記日期）" : ""), /* @__PURE__ */ h("label", { class: "wt-pick" + (/^\d{4}-/.test(seen) ? " on" : "") }, /* @__PURE__ */ h("span", { class: "wt-ico" }, "📅"), /* @__PURE__ */ h("span", { class: "wt-text" }, /^\d{4}-/.test(seen) ? seen.replace(/-/g, "/") : "選擇日期"), /* @__PURE__ */ h("span", { class: "wt-hint" }, /^\d{4}-/.test(seen) ? "點一下修改" : "點一下開日曆"), /* @__PURE__ */ h("input", { name: "wd", type: "date", max: todayTPE(), value: /^\d{4}-/.test(seen) ? seen : "", "aria-label": "觀影日期", onInput: (v) => {
      const d = String(v.wd || "");
      if (d && d !== seen) return save({ seen: d }, `已記下：${d.replace(/-/g, "/")} 看的`);
    } })), /* @__PURE__ */ h("div", { class: "cm-tagset wt-quick" }, /* @__PURE__ */ h("button", { class: "cm-tag" + (seen === todayTPE() ? " on" : ""), onTap: () => save({ seen: todayTPE() }, "已記下：今天看的") }, "今天"), /* @__PURE__ */ h("button", { class: "cm-tag" + (seen === "?" ? " on" : ""), onTap: () => save({ seen: "?" }, "已標記看過") }, "不記得日期"), seen ? /* @__PURE__ */ h("button", { class: "cm-tag", onTap: () => save({ seen: "", how: [] }, "已清除觀影紀錄") }, "清除") : null)), /* @__PURE__ */ h("div", { class: "cm-tagrow" }, /* @__PURE__ */ h("span", { class: "cm-taghead" }, "觀影方式（可複選）", how.length ? `：已選 ${howLabel(how)}` : ""), /* @__PURE__ */ h("div", { class: "cm-tagset" }, WATCH_HOW.map((w) => {
      const on = how.indexOf(w.id) >= 0;
      return /* @__PURE__ */ h("button", { class: "cm-tag" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false", onTap: () => save({ how: on ? how.filter((x) => x !== w.id) : [...how, w.id] }, on ? `已取消「${w.label}」` : `已記下：${w.label}`) }, esc(w.label));
    }))));
  }
  // 哪一部片的「觀影紀錄」是展開的
  /** 評分卡裡的「觀影紀錄」（登入的人才有）：觀影時間、觀影方式，跟心得標籤一樣在同一頁展開，不用跳頁。
   *  沒評分也可以填（填了就算看過，會記進我的片單） */
  watchInline(title) {
    const k = communityKey(title);
    const open = this.watchOpenFor === k;
    const e = (this.diaryMem ? this.diaryMem.list : []).find((x) => x.k === k) || null;
    const seen = e ? e.seen : "", how = e && e.how || [];
    const summary = [/^\d{4}-/.test(seen) ? seen.replace(/-/g, "/") : seen === "?" ? "看過" : "", howLabel(how)].filter(Boolean).join("｜");
    const save = (body, done) => this.saveWatch(title, body, done);
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { class: "cm-tagbar", "aria-expanded": open ? "true" : "false", onTap: async () => {
      if (open) {
        this.watchOpenFor = "";
        return;
      }
      await this.myDiary().catch(() => []);
      this.watchOpenFor = k;
    } }, /* @__PURE__ */ h("span", null, "觀影紀錄"), /* @__PURE__ */ h("em", null, this.diaryMem && summary ? summary : open ? "還沒填" : "什麼時候看的、在哪裡看的"), /* @__PURE__ */ h("i", null, open ? "收合 ▾" : summary && this.diaryMem ? "修改 ▸" : "填寫 ▸")), open ? /* @__PURE__ */ h("div", { class: "cm-tags" }, this.watchFields(title, e), /* @__PURE__ */ h("div", { class: "cm-tagnote" }, "會記進「設定 → 我的片單」。個人頁公開的話別人也看得到；要單獨隱藏這一筆，到我的片單裡設定。")) : null);
  }
  // 哪一部片的心得標籤選單是展開的
  /** 片刻評分卡片：平均、人數、分布，以及「你的評分」一排 1～10 的格子（點已選的那一格可以取消）。
   *  評過分以後多一列「心得標籤」：點開是固定的選項（不能打字，所以不會暴雷），最多選 5 個；大家選最多的幾個列在平均分數下面 */
  community(title, c) {
    const top = topReviewTags(c);
    const myTags = c && c.myTags ? c.myTags.filter((id) => reviewTagLabel(id)) : [];
    const tagsOpen = this.tagsOpenFor === communityKey(title);
    const rateOpen = this.rateOpenFor === communityKey(title);
    const pickTag = async (id) => {
      const next = reviewTagsToggle(myTags, id);
      if (!next) {
        await this.ui.toast(`最多選 ${REVIEW_TAGS_MAX} 個，先取消一個再選`);
        return;
      }
      try {
        await communityTags(title, next);
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    const n = c ? c.n : 0;
    const avg = c && n ? c.avg : 0;
    const mine = c ? c.mine : 0;
    const status = c === void 0 ? "讀取中…" : c === false ? "片刻評分暫時讀不到" : n ? `${n} 人評分` : "還沒有人評分，來當第一個";
    const max = c ? Math.max(1, ...c.dist) : 1;
    const vote = async (s) => {
      try {
        await communityVote(title, s === mine ? 0 : s);
        await this.ui.toast(s === mine ? "已取消你的評分" : `已送出 ${s} 分`);
        if (s !== mine) await this.askNickname();
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    const tier = n ? ratingTier("imdb", avg) : "none";
    return /* @__PURE__ */ h(Section, { title: "片刻評分", hint: "匿名評分，一台裝置一票，可以隨時更改；再點一次已選的分數可以取消。評分後可以再選心得標籤。各版本的評分會一起統計。" }, /* @__PURE__ */ h("div", { class: "cm" }, n ? /* @__PURE__ */ h("div", { class: "cm-top" }, /* @__PURE__ */ h("div", { class: "cm-avg " + tier, "aria-label": `平均 ${avg.toFixed(1)} 分，滿分 10 分` }, avg.toFixed(1), /* @__PURE__ */ h("small", null, "／10")), /* @__PURE__ */ h("div", { class: "cm-meta" }, /* @__PURE__ */ h("span", { class: "cm-n" }, esc(status)), /* @__PURE__ */ h("span", { class: "cm-by" }, "片刻使用者的評分")), c ? /* @__PURE__ */ h("div", { class: "cm-hist", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { class: "bars" }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => /* @__PURE__ */ h("i", { class: c.dist[v - 1] ? "" : "zero", style: `height:${Math.max(8, Math.round((c.dist[v - 1] || 0) / max * 100))}%` }))), /* @__PURE__ */ h("div", { class: "axis" }, /* @__PURE__ */ h("span", null, "1"), /* @__PURE__ */ h("span", null, "10"))) : null) : /* @__PURE__ */ h("div", { class: "cm-empty" }, esc(status)), top.length ? /* @__PURE__ */ h("div", { class: "cm-toptags", "aria-label": "大家選最多的心得標籤" }, top.map((t) => /* @__PURE__ */ h("span", null, esc(t.label), " ", /* @__PURE__ */ h("b", null, t.pct, "%")))) : null, /* @__PURE__ */ h("button", { class: "cm-mine fold" + (n ? " line" : ""), "aria-expanded": rateOpen ? "true" : "false", onTap: () => {
      this.rateOpenFor = rateOpen ? "" : communityKey(title);
    } }, /* @__PURE__ */ h("span", null, "你的評分"), mine ? /* @__PURE__ */ h("b", null, mine, " 分") : /* @__PURE__ */ h("em", null, rateOpen ? "點一個分數" : "還沒評分"), !rateOpen && myTags.length ? /* @__PURE__ */ h("em", { class: "cm-sum" }, esc(myTags.map(reviewTagLabel).join("、"))) : /* @__PURE__ */ h("em", { class: "cm-sum" }), /* @__PURE__ */ h("i", null, rateOpen ? "收合 ▾" : mine ? "修改 ▸" : "評分 ▸")), rateOpen ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("div", { class: "cm-pick" }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => /* @__PURE__ */ h("button", { class: "cm-num" + (v <= mine ? " on" : ""), "aria-label": `${v} 分`, "aria-pressed": v === mine ? "true" : "false", onTap: () => vote(v) }, v))), /* @__PURE__ */ h("div", { class: "cm-ends" }, /* @__PURE__ */ h("span", null, "不推薦"), /* @__PURE__ */ h("span", null, "必看")), mine ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { class: "cm-tagbar", "aria-expanded": tagsOpen ? "true" : "false", onTap: () => {
      this.tagsOpenFor = tagsOpen ? "" : communityKey(title);
    } }, /* @__PURE__ */ h("span", null, "心得標籤"), /* @__PURE__ */ h("em", null, myTags.length ? esc(myTags.map(reviewTagLabel).join("、")) : "點選幾個看完的感覺（不用打字）"), /* @__PURE__ */ h("i", null, tagsOpen ? "收合 ▾" : myTags.length ? "修改 ▸" : "選擇 ▸")), tagsOpen ? /* @__PURE__ */ h("div", { class: "cm-tags" }, REVIEW_TAGS.map((g) => /* @__PURE__ */ h("div", { class: "cm-tagrow" }, /* @__PURE__ */ h("span", { class: "cm-taghead" }, esc(g.group), g.single ? "（選一個）" : ""), /* @__PURE__ */ h("div", { class: "cm-tagset" }, g.tags.map((t) => /* @__PURE__ */ h("button", { class: "cm-tag" + (myTags.indexOf(t.id) >= 0 ? " on" : ""), "aria-pressed": myTags.indexOf(t.id) >= 0 ? "true" : "false", onTap: () => pickTag(t.id) }, esc(t.label)))))), /* @__PURE__ */ h("div", { class: "cm-tagnote" }, "已選 ", myTags.length, "／", REVIEW_TAGS_MAX, "。只有這些選項，不會有劇透。")) : null) : null, c && signedIn() ? this.watchInline(title) : null) : null, c && (mine || c.notes) ? /* @__PURE__ */ h("button", { class: "cm-tagbar", onTap: () => {
      this.noteReset();
      this.go(() => this.notesView(title), "讀取短評…");
    } }, /* @__PURE__ */ h("span", null, "短評"), /* @__PURE__ */ h("em", null, c.notes ? `${c.notes} 則` : "還沒有人寫"), /* @__PURE__ */ h("i", null, mine ? c.notes ? "看全部／寫一句 ▸" : "寫一句 ▸" : "看全部 ▸")) : null));
  }
  /** 海報旁邊那顆收藏的愛心：電影頁、影展片、即將上映、已下檔的片都用同一顆 */
  favOf(m) {
    return { on: isFavMovie(this.settings, m.title), onTap: () => {
      const on = toggleFavMovie(this.settings, m);
      saveSettings(this.settings);
      this.pushSync();
      const p = this.push();
      this.ui.toast(!on ? "已取消收藏" : p && p.state() === "on" ? "已收藏，有動態會通知你" : p && (p.state() === "off" || p.state() === "needs-install") ? "已收藏。到「設定」可以開啟通知" : "已收藏，在首頁可以快速打開");
    } };
  }
  /** 收藏的片目前哪裡都沒有場次：票房排行（2016 年至今）找得到就開那一頁；找不到就只顯示海報、評分、預告 */
  async favMovieView(fav) {
    const x = await favMovieBox(fav);
    if (x) return this.boxMovieView(x);
    const e = await this.extras(fav.title, void 0, fav.en);
    return /* @__PURE__ */ h(Page, { title: fav.title, subtitle: "收藏電影", onBack: () => this.back() }, this.hero(e, fav.title, [fav.en || "", fav.fest ? `收藏自${fav.fest.name}` : ""].filter(Boolean), { en: fav.en, poster: fav.poster, fest: fav.fest }), /* @__PURE__ */ h(Note, { text: "目前查不到這部片的場次，可能已經下檔，或還沒排片。之後有場次時，從首頁「收藏電影」點進來就會直接到場次頁。" }));
  }
  /** 三大評分徽章（IMDb、番茄、爆米花）：電影頁和影展片共用。讀好後三個都顯示，沒有那項評分就是「-」（跟「還沒抓到」分得開） */
  ratingBadges(r) {
    const badges = [];
    if (r) {
      badges.push(r.imdb ? { kind: "imdb", value: r.imdb.score.toFixed(1), tier: ratingTier("imdb", r.imdb.score), onTap: () => Safari.open(r.imdb.url) } : { kind: "imdb", value: "-", tier: "none" });
      badges.push(r.tomato ? { kind: "tomato", value: `${r.tomato.score}%`, tier: tomatoTier(r.tomato.score, r.tomato.certified), onTap: () => Safari.open(r.tomato.url) } : { kind: "tomato", value: "-", tier: "none" });
      badges.push(r.popcorn ? { kind: "popcorn", value: `${r.popcorn.score}%`, tier: popcornTier(r.popcorn.score, r.popcorn.certified), onTap: () => Safari.open(r.popcorn.url) } : { kind: "popcorn", value: "-", tier: "none" });
    }
    return badges;
  }
  hero(e, title, lines, fav) {
    const { x, r } = e;
    const posterUrl = x?.poster || e.p || "";
    const poster = posterSrc(posterUrl);
    if (poster && poster === posterUrl) cachePoster(posterUrl);
    const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`;
    const badges = this.ratingBadges(r);
    if (r?.popcorn && (r.popcorn.avg || r.popcorn.count)) lines = [...lines, [r.popcorn.avg ? `爆米花 ${r.popcorn.avg}／5` : "爆米花", popcornCount(r.popcorn.count)].filter(Boolean).join("｜")];
    if (!r && e.loading) lines = [...lines, "評分讀取中…"];
    else if (!r) lines = [...lines, "評分讀不到"];
    if (r?.err && !(r.imdb || r.tomato || r.popcorn)) lines = [...lines, `評分讀不到：${r.err}`];
    if (x?.err) lines = [...lines, "預告會開 YouTube 搜尋結果"];
    return /* @__PURE__ */ h(
      Hero,
      {
        title,
        poster,
        posterUrl,
        posterPending: !poster && e.loading,
        lines,
        badges,
        fav: this.favOf({ title, en: fav?.en, poster: fav?.poster || posterUrl, fest: fav?.fest }),
        onShare: () => this.shareMovie(title, fav?.fest),
        trailerLabel: !x || x.trailerName ? "觀看預告" : "搜尋預告",
        onTrailer: async () => Safari.open((x || await e.px)?.trailer || search)
      }
    ) + this.community(title, e.c);
  }
  // ── 場次 ──
  async timesView(c, date, m, r) {
    const isToday = date === todayTPE();
    const now = nowHM();
    const x = await this.extras(m.title);
    const tw = (await loadMovies().catch(() => [])).find((t) => communityKey(t.title) === communityKey(m.title));
    const dayJob = tw ? movieDay(tw.slug, void 0).catch(() => null) : Promise.resolve(null);
    const day = await Promise.race([dayJob, sleep(this.rerendering ? 0 : 1200).then(() => void 0)]);
    if (day === void 0) this.late = [dayJob];
    const about = movieAbout(day || null);
    return /* @__PURE__ */ h(Page, { title: m.title, subtitle: `${c.name}｜${dateLabel(date)}`, onBack: () => this.back() }, this.hero(x, m.title, [
      m.runtime ? `片長 ${m.runtime} 分鐘` + (m.runtimeFrom ? `（${m.runtimeFrom}）` : "") : "片長未提供，下一步可手動輸入",
      m.rating || ""
    ]), m.versions.map((v) => /* @__PURE__ */ h(Section, { title: v.label }, /* @__PURE__ */ h(Chips, null, [...v.times].sort(byShowtime).map((t) => {
      const past = isToday && t <= now && !lateIsTonight(c.source, t);
      const end = m.runtime ? fmt(new Date(tpeDate(date, t).getTime() + (m.runtime + this.settings.ads) * 6e4)).slice(-5) : "";
      return /* @__PURE__ */ h(
        Chip,
        {
          label: t,
          sub: past ? "已開演" : isLate(t) ? "凌晨場" : end ? `→ ${end}` : "",
          muted: past,
          warn: isLate(t),
          onTap: () => {
            this.runtime = m.runtime;
            this.seat = hallOf(v.label);
            this.go(
              () => this.confirmView({ cinema: c, address: r.address || c.address || "", booking: r.booking, sourceUrl: r.sourceUrl, date, movie: m, version: v, time: t })
            );
          }
        }
      );
    })))), about.text || about.credits ? /* @__PURE__ */ h(Section, { title: "劇情簡介", hint: "簡介來自場次通。" }, /* @__PURE__ */ h(Para, { text: about.text || about.credits, dim: about.text ? about.credits : "" })) : null);
  }
  // ── 確認 ──
  start(p) {
    return tpeDate(showDay(p.cinema.source, p.date, p.time), p.time);
  }
  end(p) {
    return new Date(this.start(p).getTime() + ((this.runtime || 120) + this.settings.ads) * 6e4);
  }
  async confirmView(p) {
    if (!this.runtime && !p.movie.runtime) {
      this.late = [];
      await this.fillRuntime(p.movie);
      if (p.movie.runtime) this.runtime = p.movie.runtime;
    }
    return /* @__PURE__ */ h(Page, { title: "確認行程", subtitle: "點選項目可以修改", onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🎬", title: p.movie.title, subtitle: p.version.label }), p.address ? this.addressItem(p.cinema.name, p.address, p.cinema.name) : /* @__PURE__ */ h(Item, { icon: "📍", title: p.cinema.name }), /* @__PURE__ */ h(Item, { icon: "🕒", title: fmt(this.start(p)), subtitle: `預計 ${fmt(this.end(p)).slice(-5)} 散場` })), isLate(p.time) ? /* @__PURE__ */ h(Note, { kind: "warn", text: showDay(p.cinema.source, p.date, p.time) !== p.date ? "凌晨場：已自動算到隔天日期，請再核對電影票。" : "凌晨場：請核對日期，這場是在這一天的凌晨開演。" }) : null, /* @__PURE__ */ h(Section, { title: "可調整" }, /* @__PURE__ */ h(
      Item,
      {
        icon: "⏱",
        title: "片長",
        subtitle: this.runtime ? `${this.runtime} 分鐘` + (p.movie.runtimeFrom && this.runtime === p.movie.runtime ? `（取自 ${p.movie.runtimeFrom}，請核對）` : "") : "來源沒有提供，請輸入（未填以 120 分鐘計）",
        right: "修改",
        onTap: () => this.go(() => this.runtimeView())
      }
    ), /* @__PURE__ */ h(Item, { icon: "📺", title: "廣告預告", subtitle: `${this.settings.ads} 分鐘`, right: "點一下切換", chevron: false, onTap: () => this.cycleAds() }), /* @__PURE__ */ h(Item, { icon: "💺", title: "影廳／座位", subtitle: this.seat || "未填（選填）", right: "修改", onTap: () => this.go(() => this.seatView()) }), /* @__PURE__ */ h(Item, { icon: "📅", title: "行事曆", subtitle: this.calendarName, right: "更換", onTap: () => this.go(() => this.calendarView()) })), /* @__PURE__ */ h(Button, { label: "✓ 加入行事曆", onTap: () => this.save(p) }), this.bookingButtons(p), /* @__PURE__ */ h(Button, { label: "分享這場給朋友", kind: "secondary", onTap: () => this.share(p) }));
  }
  // ── 網頁版：加到主畫面 ──
  /** 已經是從主畫面開啟的（獨立視窗，沒有瀏覽器的網址列） */
  isStandalone() {
    if (true) return false;
    const w = globalThis;
    try {
      return !!(w.navigator?.standalone || w.matchMedia?.("(display-mode: standalone)").matches);
    } catch (_) {
      return false;
    }
  }
  /** 首頁最下面的入口：已經從主畫面開啟就不顯示 */
  installEntry() {
    if (true) return "";
    return /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "📲", title: "加到主畫面", subtitle: "像 App 一樣從主畫面開啟，看圖示教學", onTap: () => this.go(() => this.installView()) }));
  }
  /** 圖示教學：依瀏覽器給對應的步驟。Android／電腦的 Chrome 有安裝事件時，直接給一顆安裝按鈕 */
  installView() {
    const w = globalThis;
    const ua = String(w.navigator?.userAgent || "");
    const ios = /iPhone|iPad|iPod/.test(ua) || /Macintosh/.test(ua) && (w.navigator?.maxTouchPoints || 0) > 1;
    const iosOther = ios && /CriOS|FxiOS|EdgiOS|Line\/|FBAN|FBAV|Instagram/.test(ua);
    const android = /Android/.test(ua);
    const prompt = w.__installPrompt;
    const done = this.isStandalone() || w.__installed;
    const install = async () => {
      try {
        await prompt.prompt();
        const r = await prompt.userChoice;
        w.__installPrompt = null;
        if (r && r.outcome === "accepted") w.__installed = true;
      } catch (_) {
      }
    };
    let body;
    if (done) {
      body = /* @__PURE__ */ h(Note, { text: "✅ 已經加到主畫面了。之後從主畫面的「片刻」圖示開啟就可以。" });
    } else if (prompt) {
      body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Button, { label: "📲 安裝到主畫面", onTap: install }), /* @__PURE__ */ h(Note, { text: "按下後瀏覽器會跳出確認視窗，選「安裝」。裝好後會多一個「片刻」圖示，開起來沒有網址列，像一般的 App。" }));
    } else if (ios && !iosOther) {
      body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Steps, { items: [
        { icon: "share", title: "點「分享」按鈕", text: "Safari 下方工具列上，方框加向上箭頭的圖示。找不到的話先點「⋯」，再點「分享」。" },
        { icon: "plus", title: "往下滑，點「加入主畫面」", text: "選單裡方框加一個加號的那一項。" },
        { icon: "check", title: "點右上角的「加入」", text: "名稱可以維持「片刻」。" },
        { icon: "home", title: "從主畫面開啟", text: "主畫面會多一個「片刻」圖示，開起來沒有網址列，像一般的 App。" }
      ] }), /* @__PURE__ */ h(Note, { text: "要用 Safari 才能加到主畫面。收藏影城等設定存在瀏覽器裡：從主畫面開啟的版本是另一份，設定要重新設一次。" }));
    } else if (ios) {
      body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Steps, { items: [
        { icon: "share", title: "點「分享」按鈕", text: "網址列旁邊，方框加向上箭頭的圖示。" },
        { icon: "plus", title: "點「加入主畫面」", text: "選單裡沒有這一項的話，請改用 Safari 開啟這個網址再加。" },
        { icon: "check", title: "點「加入」" }
      ] }), /* @__PURE__ */ h(Note, { text: "你現在用的不是 Safari。在 LINE、Facebook 這類 App 裡打開的網頁通常不能加到主畫面，請先點「用瀏覽器開啟」。" }));
    } else if (android) {
      body = /* @__PURE__ */ h(Steps, { items: [
        { icon: "vdots", title: "點右上角的「⋮」", text: "瀏覽器的選單。" },
        { icon: "plus", title: "點「加到主畫面」或「安裝應用程式」", text: "各家瀏覽器的說法略有不同。" },
        { icon: "check", title: "點「安裝」或「新增」" }
      ] });
    } else {
      body = /* @__PURE__ */ h(Steps, { items: [
        { icon: "plus", title: "在網址列右邊找「安裝」圖示", text: "Chrome、Edge 會在網址列右邊出現一個安裝圖示；沒有的話從瀏覽器選單裡找「安裝片刻」。" },
        { icon: "check", title: "點「安裝」", text: "Safari（macOS）則是從「檔案」選單選「加入 Dock」。" }
      ] });
    }
    return /* @__PURE__ */ h(Page, { title: "加到主畫面", subtitle: "像 App 一樣從主畫面開啟", onBack: () => this.back() }, body);
  }
  /** 版本狀態：已是最新版／有新版（捷徑每次執行都會下載最新版，重新執行就會更新） */
  async versionNote() {
    if (false) {
      this.latest = this.checkVersion();
      this.latestAt = Date.now();
    }
    const r = await Promise.race([this.latest, sleep(1500).then(() => void 0)]);
    if (r === void 0) return "";
    if (false) {
      if (!r) return /* @__PURE__ */ h(Note, { text: "（無法確認是否為最新版：連不到網站）" });
      if (r.isLatest) return /* @__PURE__ */ h(Note, { text: "✅ 已是最新版" });
      return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Note, { kind: "warn", text: `🆕 有新版 ${r.latest}（你現在開的是 ${"2026.11.24-2342"}）` }), /* @__PURE__ */ h(Button, { label: "重新整理以更新", kind: "secondary", onTap: () => {
        globalThis.location.reload();
      } }));
    }
    if (!r) return /* @__PURE__ */ h(Note, { text: "（無法確認是否為最新版：讀不到 GitHub）" });
    if (r.isLatest) return /* @__PURE__ */ h(Note, { text: "✅ 已是最新版" });
    return /* @__PURE__ */ h(Note, { kind: "warn", text: `🆕 有新版 ${r.latest}：關閉後重新執行捷徑就會更新（GitHub 約有 5 分鐘延遲）。如果是匯入 .scriptable 檔安裝的，請改用捷徑才會自動更新。` });
  }
  /** 以瀏覽器訂票／以 App 訂票 */
  bookingButtons(p) {
    const app = cinemaApp(p.cinema);
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Button, { label: "🌐 以瀏覽器訂票", kind: "secondary", onTap: async () => Safari.open(await bookingUrl(p)) }), app ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Button, { label: `📱 以 App 訂票（${app.name}）`, kind: "secondary", onTap: () => Safari.open(app.url) }), /* @__PURE__ */ h(Note, { text: `會打開 App Store 的「${app.name}」頁面：已安裝的話點「打開」就進 App，沒安裝可以直接下載。` })) : /* @__PURE__ */ h(Note, { text: "這間影城沒有官方 App，請用瀏覽器訂票。" }));
  }
  runtimeView() {
    return /* @__PURE__ */ h(Page, { title: "片長", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { text: "請依官網或電影票輸入正片分鐘數。" }), /* @__PURE__ */ h("input", { class: "field", name: "v", type: "number", inputmode: "numeric", value: this.runtime || "", placeholder: "例如 120", autofocus: true }), /* @__PURE__ */ h(
      Button,
      {
        label: "確定",
        enter: true,
        onTap: (v) => {
          const n = Math.round(Number(v.v));
          if (!(n > 0 && n < 600)) throw new Error("片長請輸入 1～599 的整數");
          this.runtime = n;
          this.back();
        }
      }
    ));
  }
  seatView() {
    return /* @__PURE__ */ h(Page, { title: "影廳／座位", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { text: "選填，會寫進行程備註。例如：7 廳 H12、H13" }), /* @__PURE__ */ h("input", { class: "field", name: "v", value: this.seat, placeholder: "影廳與座位", autofocus: true }), /* @__PURE__ */ h(
      Button,
      {
        label: "確定",
        enter: true,
        onTap: (v) => {
          this.seat = String(v.v || "").trim();
          this.back();
        }
      }
    ));
  }
  async save(p) {
    if (!this.runtime) return this.go(() => this.runtimeView());
    const cal = await currentCalendar(this.settings);
    const start = this.start(p);
    const end = this.end(p);
    const dup = (await CalendarEvent.between(new Date(start.getTime() - 6e4), new Date(start.getTime() + 6e4), [cal])).find((e) => e.title === p.movie.title);
    if (dup) return this.go(() => this.dupView(p, cal));
    this.write(p, cal, start, end);
  }
  dupView(p, cal) {
    return /* @__PURE__ */ h(Page, { title: "已經有這場了", onBack: () => this.back() }, /* @__PURE__ */ h(Empty, { icon: "📅", text: `${p.movie.title}
${fmt(this.start(p))}
已在「${cal.title}」裡` }), /* @__PURE__ */ h(Button, { label: "還是加入", kind: "danger", onTap: () => this.write(p, cal, this.start(p), this.end(p)) }), /* @__PURE__ */ h(Button, { label: "不要重複", kind: "secondary", onTap: () => this.back() }));
  }
  write(p, cal, start, end) {
    const maps = mapsUrl(p.cinema.name, p.address, this.settings.maps);
    const ev = new CalendarEvent();
    ev.title = p.movie.title;
    ev.startDate = start;
    ev.endDate = end;
    ev.location = [p.cinema.name, p.address].filter(Boolean).join(" ");
    ev.calendar = cal;
    ev.notes = [
      `影城：${p.cinema.name}`,
      p.address ? `地址：${p.address}` : "",
      `版本：${p.version.label}`,
      `影廳／座位：${this.seat || "未填"}`,
      `正片：${this.runtime} 分鐘；廣告預告：${this.settings.ads} 分鐘`,
      `預計散場：${fmt(end)}`,
      `導航：${maps}`,
      p.booking ? `訂票／官方：${p.booking}` : "",
      `場次來源：${p.sourceUrl}`
    ].filter(Boolean).join("\n");
    ev.save();
    this.go(() => this.doneView(p, ev, cal));
  }
  doneView(p, ev, cal) {
    return /* @__PURE__ */ h(Page, { title: false ? "已產生行事曆檔" : "已加入行事曆", subtitle: cal.title }, /* @__PURE__ */ h(Empty, { icon: "✅", text: `${p.movie.title}
${fmt(ev.startDate)} → ${fmt(ev.endDate).slice(-5)}
${p.cinema.name}${this.seat ? "｜" + this.seat : ""}` }), /* @__PURE__ */ h(Section, { hint: false ? "打開剛下載的 .ics 檔就能加入手機或電腦的行事曆；行程已附開演前 30 分鐘提醒。" : "Scriptable 無法直接設定提醒，打開行程後可在「提示」加上開演前 30 分鐘。" }, /* @__PURE__ */ h(Item, { icon: false ? "📥" : "🔔", title: false ? "再下載一次行事曆檔" : "打開行程，加提醒", accent: true, onTap: async () => {
      await ev.presentEdit();
    } }), /* @__PURE__ */ h(Item, { icon: "📤", title: "分享這場給朋友", accent: true, onTap: () => this.share(p) })), this.bookingButtons(p), /* @__PURE__ */ h(Button, { label: "再新增一部", onTap: () => this.home() }));
  }
  // box = 現正上映（含票房排行）；year = 歷年電影（某幾年上映的片，含已下檔）
  movieModeChips() {
    return /* @__PURE__ */ h(Chips, { tabs: true }, /* @__PURE__ */ h(Chip, { label: "現正上映", muted: this.movieMode !== "box", onTap: () => {
      this.movieMode = "box";
      this.boxOpen = "";
    } }), /* @__PURE__ */ h(Chip, { label: "即將上映", muted: this.movieMode !== "soon", onTap: () => {
      this.movieMode = "soon";
    } }), /* @__PURE__ */ h(Chip, { label: "歷年電影", muted: this.movieMode !== "year", onTap: () => {
      this.movieMode = "year";
      this.boxOpen = "";
    } }), festivalsAny() ? /* @__PURE__ */ h(Chip, { label: "影展", muted: this.movieMode !== "fest", onTap: () => {
      this.movieMode = "fest";
    } }) : null);
  }
  // 看哪一年（0 = 今年；今年還沒有就是最近有資料的那一年）
  async festivalListView() {
    const list = await loadFestivals(this.festYear || void 0);
    const years = festivalYears();
    if (!list.length) {
      if (this.festYear) {
        this.festYear = 0;
        return this.festivalListView();
      }
      this.movieMode = "box";
      return this.movieListView();
    }
    const year = Number(list[0].end.slice(0, 4));
    const pick = festivalPick(list, this.festTab, this.festId);
    const f = pick.f || list[0];
    const dates = festivalDates(f);
    const date = dates.indexOf(this.festDate) >= 0 ? this.festDate : festivalDefaultDate(f);
    const day = festivalDay(f, date);
    const hits = this.festQuery.trim() ? festivalSearch(list, this.festQuery) : null;
    const thisYear = Number(todayTPE().slice(0, 4));
    const tabNow = pick.tabs.find((t) => t.id === pick.tab);
    const fold = (id, title, summary, can = true) => /* @__PURE__ */ h(Item, { kv: true, title, right: can ? `${summary} ${this.festOpen === id ? "▾" : "▸"}` : summary, chevron: false, onTap: can ? () => {
      this.festOpen = this.festOpen === id ? "" : id;
    } : void 0 });
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: `${f.name}｜${festivalStatusLine(f)}`, onBack: () => this.back() }, this.movieModeChips(), /* @__PURE__ */ h(Search, { value: this.festQuery, placeholder: `搜尋 ${year} 年影展的片名`, onInput: (t) => {
      this.festQuery = t;
    } }), /* @__PURE__ */ h(Section, { hint: this.festOpen === "fest" && pick.items.length > 3 ? "可以左右滑動" : "" }, years.length > 1 ? fold("year", "年份", `${year}${year === thisYear ? "（今年）" : ""}`) : null, years.length > 1 && this.festOpen === "year" ? /* @__PURE__ */ h(Chips, { scroll: true }, years.map((y) => /* @__PURE__ */ h(Chip, { label: `${y}`, sub: y === thisYear ? "今年" : "", muted: y !== year, onTap: () => {
      this.festYear = y;
      this.festTab = "";
      this.festId = "";
      this.festDate = "";
      this.festOpen = "";
    } }))) : null, pick.tabs.length > 1 ? fold("tab", "狀態", `${tabNow ? tabNow.label : ""}（${tabNow ? tabNow.count : 0} 個）`) : null, pick.tabs.length > 1 && this.festOpen === "tab" ? /* @__PURE__ */ h(Chips, null, pick.tabs.map((t) => /* @__PURE__ */ h(Chip, { label: t.label, sub: `${t.count} 個影展`, muted: t.id !== pick.tab, onTap: () => {
      this.festTab = t.id;
      this.festId = "";
      this.festDate = "";
      this.festOpen = pick.tabs.find((x) => x.id === t.id).count > 1 ? "fest" : "";
    } }))) : null, fold("fest", "影展", pick.items.length > 1 ? `${f.name}（${festivalChipNote(f)}）` : `${f.name}（${festivalChipNote(f)}）`, pick.items.length > 1), pick.items.length > 1 && this.festOpen === "fest" ? /* @__PURE__ */ h(Chips, { scroll: true }, pick.items.map((x) => /* @__PURE__ */ h(Chip, { label: x.name, sub: festivalChipNote(x), muted: x.id !== f.id, onTap: () => {
      this.festId = x.id;
      this.festDate = "";
      this.festOpen = "";
    } }))) : null), hits ? /* @__PURE__ */ h(Section, { title: `「${this.festQuery.trim()}」｜${hits.length} 部`, hint: "搜尋這一年所有影展的片名，不分日期。清空搜尋欄就回到每天的片單。" }, hits.map(({ f: hf, film, sessions }) => /* @__PURE__ */ h(
      Item,
      {
        thumb: { src: film.poster || "" },
        title: film.title,
        subtitle: festivalSearchLines(hf, film, sessions).filter(Boolean).join("\n"),
        onTap: () => this.go(() => this.festivalFilmView(hf, film))
      }
    ))) : null, hits && !hits.length ? /* @__PURE__ */ h(Empty, { icon: "🎞", text: "這一年的影展裡找不到這個片名" }) : null, hits ? null : /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Section, { title: "日期" }, /* @__PURE__ */ h(Chips, { scroll: true }, dates.map((d) => /* @__PURE__ */ h(Chip, { label: dateLabel(d).replace(/（.）.*$/, ""), sub: d === todayTPE() ? "今天" : dateLabel(d).match(/（(.)）/)?.[1] || "", muted: d !== date, onTap: () => {
      this.festDate = d;
    } })))), /* @__PURE__ */ h(Section, { title: `${f.name}｜${dateLabel(date).replace(/ .*$/, "")}｜${day.length} 部、${day.reduce((n, x) => n + x.sessions.length, 0)} 場`, hint: festivalFooter(f) }, day.map(({ film, sessions }) => /* @__PURE__ */ h(
      Item,
      {
        thumb: { src: film.poster || "" },
        title: film.title,
        subtitle: festivalLines(film, sessions).filter(Boolean).join("\n"),
        onTap: () => this.go(() => this.festivalFilmView(f, film))
      }
    ))), day.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "這一天沒有場次" })));
  }
  /** 影展的一部片：列出還沒演的所有場次，點一場加入行事曆 */
  async festivalFilmView(f, film) {
    const rated = communityCached(film.title) || await communityStats(film.title).catch(() => false);
    const sessions = festivalFilmSessions(f, film.id);
    const pr = foregroundTask(movieRatings(film.title).catch(() => null));
    const r = await Promise.race([pr, sleep(this.rerendering ? 0 : 400).then(() => void 0)]);
    if (r === void 0) this.late = [pr];
    const pick = (x) => {
      const cinema = festivalCinema(x, this.cinemas, f);
      const version = { label: festivalPlace(x), times: [x.time] };
      const movie = { title: film.title, runtime: film.mins, rating: film.rating, versions: [version] };
      this.runtime = film.mins;
      this.seat = x.room;
      this.go(() => this.confirmView({ cinema, address: cinema.address || "", booking: x.ticket || film.url, sourceUrl: film.url, date: x.date, movie, version, time: x.time }));
    };
    const end = (x) => film.mins ? fmt(new Date(tpeDate(x.date, x.time).getTime() + (film.mins + this.settings.ads) * 6e4)).slice(-5) : "";
    return /* @__PURE__ */ h(Page, { title: film.title, subtitle: f.name, onBack: () => this.back() }, /* @__PURE__ */ h(Hero, { title: film.title, poster: film.poster || void 0, lines: [[film.rating, film.mins ? `${film.mins} 分鐘` : ""].filter(Boolean).join("｜"), `${f.name}（${festivalStateLabel(f)}）`, "影展片名，院線上映時可能不同", ...r === void 0 ? ["評分讀取中…"] : []], badges: this.ratingBadges(r), fav: this.favOf({ title: film.title, poster: film.poster, fest: { id: f.id, film: film.id, name: f.name } }), trailerLabel: festivalTrailer(film).label, onTrailer: () => Safari.open(festivalTrailer(film).url) }), this.community(film.title, rated), film.intro || film.credits ? /* @__PURE__ */ h(Section, { title: "介紹", hint: `介紹來自${f.source}。` }, /* @__PURE__ */ h(Para, { text: film.intro || film.credits || "", dim: film.intro ? film.credits : "" })) : null, /* @__PURE__ */ h(Section, { title: "場次", hint: festivalState(f) === "past" ? "這個影展已經結束，場次僅供回顧。" : "點一場加入行事曆。散場時間是依片長和你設定的廣告預告時間估的。" }, sessions.map((x) => /* @__PURE__ */ h(
      Item,
      {
        title: `${dateLabel(x.date).replace(/ .*$/, "")}　${x.time}`,
        subtitle: [festivalPlace(x), end(x) ? `預計 ${end(x)} 散場` : ""].filter(Boolean).join("\n"),
        onTap: () => pick(x)
      }
    ))), sessions.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "找不到這部片的場次" }), /* @__PURE__ */ h(Button, { label: "🌐 官網的影片介紹", kind: "secondary", onTap: () => Safari.open(film.url) }));
  }
  // 「選出品國別／發行商」那一頁的搜尋字
  /** 出品國別／發行商的選擇頁：一列一個、標出部數，可以搜尋、可以複選；選好按返回 */
  async boxPickView(kind) {
    const sc = this.movieMode === "year" ? "year" : "now";
    const board = await loadMovieBoard({ scope: sc, sort: this.sortBy[sc], years: this.boxYears, week: this.boxWeek, countries: this.boxCountry, query: this.movieQuery.trim().toLowerCase(), asc: this.ascBy[sc], rate: this.boxRate, fewLast: this.boxFewLast, issuers: this.boxIssuer, status: this.boxStatus });
    if (kind === "year") {
      const ys = board.years, on = board.selYears;
      const lo = ys.reduce((a, b) => a < b ? a : b, ys[0]), hi = ys.reduce((a, b) => a > b ? a : b, ys[0]);
      return /* @__PURE__ */ h(Page, { title: "選年份", subtitle: on.length === ys.length ? `全部（${lo}–${hi}）` : `已選 ${on.length} 年`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: on.length === ys.length ? "✅" : "⬜️", title: "全部", subtitle: `${lo} 到 ${hi} 年`, chevron: false, onTap: () => {
        this.boxYears = on.length === ys.length ? [] : ys.slice();
      } })), /* @__PURE__ */ h(Section, { title: "可以選好幾年", hint: "至少要選一年。選好之後按左上角的返回。" }, ys.map((y) => /* @__PURE__ */ h(Item, { icon: on.indexOf(y) >= 0 ? "✅" : "⬜️", title: `${y} 年`, chevron: false, onTap: () => {
        this.boxYears = on.indexOf(y) < 0 ? [...on, y] : on.length > 1 ? on.filter((z) => z !== y) : on;
      } }))));
    }
    const isC = kind === "country";
    const all = isC ? board.countries : board.issuers;
    const sel = isC ? board.selCountries : board.selIssuers;
    const set = (next) => {
      if (isC) this.boxCountry = next;
      else this.boxIssuer = next;
    };
    const k = this.pickQuery.trim().toLowerCase();
    const favI = this.settings.favIssuers || [];
    const isFav = (id) => !isC && favI.indexOf(id) >= 0;
    const toggleFavI = (id) => {
      this.settings.favIssuers = isFav(id) ? favI.filter((z) => z !== id) : [...favI, id];
      saveSettings(this.settings);
    };
    const list = all.filter((c) => !k || c.id.toLowerCase().includes(k)).sort((a, b) => Number(sel.indexOf(b.id) >= 0) - Number(sel.indexOf(a.id) >= 0) || Number(isFav(b.id)) - Number(isFav(a.id)) || b.count - a.count);
    const favHere = all.filter((c) => isFav(c.id)).map((c) => c.id);
    const name = isC ? "出品國別" : "發行商";
    return /* @__PURE__ */ h(Page, { title: `選${name}`, subtitle: sel.length ? `已選 ${sel.length} 個｜${board.entries.length + board.rest.length} 部` : `全部（${board.everyone} 部）`, onBack: () => this.back() }, /* @__PURE__ */ h(Search, { value: this.pickQuery, placeholder: `搜尋${name}（共 ${all.length} 個）`, onInput: (t) => {
      this.pickQuery = t;
    } }), /* @__PURE__ */ h(Section, { hint: isC ? BOX_COUNTRY_NOTE : "發行商來自官方票房資料；聯合發行的片算第一家。" }, /* @__PURE__ */ h(Item, { icon: sel.length ? "⬜️" : "✅", title: "全部", subtitle: sel.length ? "點這裡清除已選的" : "", right: `${board.everyone} 部`, chevron: false, onTap: () => set([]) }), favHere.length ? /* @__PURE__ */ h(Item, { icon: "★", title: "只看收藏發行商", subtitle: favHere.join("、"), right: `${favHere.length} 家`, chevron: false, onTap: () => set(favHere) }) : null), /* @__PURE__ */ h(Section, { title: `可以選好幾個${k ? `｜符合「${this.pickQuery.trim()}」的 ${list.length} 個` : ""}`, hint: isC ? "選好之後按左上角的返回。" : "點右邊的星號可以收藏發行商（★ 已收藏），收藏的會排在前面，首頁也會多一個「收藏發行商」。選好之後按左上角的返回。" }, list.map((c) => /* @__PURE__ */ h(Item, { icon: sel.indexOf(c.id) >= 0 ? "✅" : "⬜️", title: c.id, right: `${c.count} 部`, chevron: false, onTap: () => set(sel.indexOf(c.id) < 0 ? [...sel, c.id] : sel.filter((z) => z !== c.id)), action: isC ? void 0 : { label: isFav(c.id) ? "★" : "☆", hint: isFav(c.id) ? "取消收藏這家發行商" : "收藏這家發行商", onTap: () => toggleFavI(c.id) } }))), list.length ? null : /* @__PURE__ */ h(Empty, { icon: "🔎", text: `找不到相符的${name}` }));
  }
  /** 「電影」清單：上映中與票房排行合成一份（範圍、排序、出品國別都在這裡選） */
  async boxOfficeView() {
    const k = this.movieQuery.trim().toLowerCase();
    const sc = this.movieMode === "year" ? "year" : "now";
    const board = await loadMovieBoard({ scope: sc, sort: this.sortBy[sc], years: this.boxYears, week: this.boxWeek, countries: this.boxCountry, query: k, asc: this.ascBy[sc], rate: this.boxRate, fewLast: this.boxFewLast, issuers: this.boxIssuer, status: this.boxStatus });
    const { years, countries } = board;
    const selYears = board.selYears, country = board.selCountries;
    const paged = board.paged;
    const pageKey = `${board.statusSel || ""}|${board.selIssuers.join(",")}|${board.asc}|${board.rate}|${board.scope}|${board.sort}|${selYears.join(",")}|${board.selWeek}|${k}|${country.join(",")}`;
    if (this.boxPageKey !== pageKey) {
      this.boxPageKey = pageKey;
      this.boxLimit = BOX_PAGE;
    }
    const rows = paged ? board.entries.slice(0, this.boxLimit) : board.entries;
    const every = [...rows, ...board.rest];
    const jobs = every.map((e) => (e.light ? posterLight(e.name, e.x ? e.x.release : "") : moviePoster(e.m ? e.m.title : e.name, e.m?.slug, e.m?.en)).catch(() => ""));
    const wait = this.rerendering ? 0 : paged ? 150 : 600;
    const posters = await Promise.all(jobs.map((p) => Promise.race([p, sleep(wait).then(() => void 0)])));
    const late = jobs.filter((_, i) => posters[i] === void 0);
    const batches = [];
    for (let i = 0; i < late.length; i += 8) batches.push(Promise.all(late.slice(i, i + 8)));
    if (batches.length) this.late = batches;
    if (!paged) prefetchPosters(every.filter((e) => !e.light).map((e) => ({ title: e.m ? e.m.title : e.name, slug: e.m?.slug, en: e.m?.en })), 300, 0, 0);
    const thumb = (u) => {
      if (u === void 0) return { src: "", pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      return { src, url: u };
    };
    const dirNow = board.asc ? board.dirs[1].label : board.dirs[0].label, dirNext = board.asc ? board.dirs[0].label : board.dirs[1].label;
    const fold = (id, title, summary) => /* @__PURE__ */ h(Item, { kv: true, title, right: `${summary} ${this.boxOpen === id ? "▾" : "▸"}`, chevron: false, onTap: () => {
      this.boxOpen = this.boxOpen === id ? "" : id;
    } });
    const item = (e, i) => {
      const m = e.m, x = e.x;
      return /* @__PURE__ */ h(
        Item,
        {
          rank: e.rank === null ? void 0 : e.rank,
          thumb: thumb(posters[i]),
          title: e.name,
          subtitle: e.lines.filter(Boolean).join("\n"),
          hi: e.hi,
          tag: e.status ? { text: STATUS_LABEL[e.status], tone: e.status } : void 0,
          chevron: !e.hi,
          onTap: m ? () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) : x ? () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`) : void 0
        }
      );
    };
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: board.title, onBack: () => this.back() }, this.movieModeChips(), /* @__PURE__ */ h(Search, { value: this.movieQuery, placeholder: board.scope === "year" ? `在 ${selYears.length > 2 ? selYears.length + " 個年份" : selYears.join("、") + " 年"}的電影裡搜尋` : "在現正上映裡搜尋片名", onInput: (t) => {
      this.movieQuery = t;
    } }), board.orders.length > 1 ? /* @__PURE__ */ h("div", { class: "sortbar" }, /* @__PURE__ */ h("button", { class: "dir " + (board.asc ? "asc" : "desc"), "aria-label": `排序方向：目前${dirNow}，點一下切換`, onTap: async () => {
      this.ascBy[sc] = !this.ascBy[sc];
      await this.ui.toast(`改成${dirNext}`);
    } }, /* @__PURE__ */ h("span", null, esc(dirNow)), /* @__PURE__ */ h("span", { class: "arrows", "aria-hidden": "true" }, /* @__PURE__ */ h("i", { class: "up" }, "▲"), /* @__PURE__ */ h("i", { class: "down" }, "▼"))), /* @__PURE__ */ h(Chips, { scroll: true }, board.orders.map((x) => /* @__PURE__ */ h(Chip, { label: x.label, muted: board.order !== x.id, onTap: () => {
      if (board.order === x.id) this.ascBy[sc] = !this.ascBy[sc];
      else {
        this.sortBy[sc] = x.id;
        this.ascBy[sc] = false;
      }
    } }))), /* @__PURE__ */ h("span", { class: "more-hint", "aria-hidden": "true" }, "›")) : null, board.weeks.length > 1 || countries.length > 1 || board.rates.length > 1 || board.issuers.length > 1 ? /* @__PURE__ */ h(Section, { hint: this.boxOpen === "week" ? "可以回頭看過去幾週的排行。" : this.boxOpen === "rate" ? "番茄指數是影評的分數、爆米花指數是觀眾的分數（都來自爛番茄）；片刻評分是這個 App 的使用者打的。" : "" }, board.scope === "year" && years.length > 1 ? /* @__PURE__ */ h(Item, { kv: true, title: "年份", right: selYears.length === years.length ? `全部（${years[years.length - 1]}–${years[0]}）` : selYears.length > 4 ? `已選 ${selYears.length} 年` : selYears.join("、"), onTap: () => this.go(() => this.boxPickView("year")) }) : null, board.rates.length > 1 ? fold("rate", "評分來源", board.rateSummary) : null, board.rates.length > 1 && this.boxOpen === "rate" ? /* @__PURE__ */ h(Chips, { scroll: true }, board.rates.map((r) => /* @__PURE__ */ h(Chip, { label: r.label, muted: board.rate !== r.id, onTap: () => {
      this.boxRate = r.id;
    } }))) : null, board.fewOption ? /* @__PURE__ */ h(Item, { kv: true, title: "評分人數少的片", right: board.fewLast ? "排在後面 ⇄" : "照分數一起排 ⇄", chevron: false, onTap: () => {
      this.boxFewLast = !this.boxFewLast;
    } }) : null, board.weeks.length > 1 ? fold("week", "週次", board.weekSummary) : null, board.weeks.length > 1 && this.boxOpen === "week" ? /* @__PURE__ */ h(Chips, null, board.weeks.map((o) => /* @__PURE__ */ h(Chip, { label: o.label, sub: o.note, muted: board.selWeek !== o.id, onTap: () => {
      this.boxWeek = o.note === "最新" ? "" : o.id;
    } }))) : null, board.statusPicks ? fold("status", "狀態", board.statusPicks.find((x) => x.id === (board.statusSel || "")).label + (board.statusSel ? `（${board.entries.length} 部）` : "")) : null, board.statusPicks && this.boxOpen === "status" ? /* @__PURE__ */ h(Chips, { scroll: true }, board.statusPicks.map((x) => /* @__PURE__ */ h(Chip, { label: x.label, sub: `${x.count} 部`, muted: x.id !== (board.statusSel || ""), onTap: () => {
      this.boxStatus = x.id;
      this.boxOpen = "";
    } }))) : null, countries.length > 1 ? /* @__PURE__ */ h(Item, { kv: true, title: "出品國別", right: board.countrySummary, onTap: () => {
      this.pickQuery = "";
      this.go(() => this.boxPickView("country"));
    } }) : null, board.issuers.length > 1 ? /* @__PURE__ */ h(Item, { kv: true, title: "發行商", right: board.issuerSummary, onTap: () => {
      this.pickQuery = "";
      this.go(() => this.boxPickView("issuer"));
    } }) : null) : null, every.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "找不到相符的電影" }), this.movieQuery.trim() ? this.searchAllLink(this.movieQuery.trim()) : null, rows.length ? /* @__PURE__ */ h(Section, { title: board.title, hint: board.footer }, rows.map(item)) : null, paged && board.entries.length > rows.length ? (
      // 不用按：快滑到底時自動接著載入下一批（一次全部畫出好幾千列會卡住，所以還是分批，只是自動）
      /* @__PURE__ */ h("button", { class: "auto-more", onTap: () => {
        this.boxLimit += BOX_PAGE * 2;
      } }, `載入中…已顯示 ${rows.length}／${board.entries.length} 部`)
    ) : null, board.rest.length ? /* @__PURE__ */ h(Section, { title: board.restTitle, hint: board.restFooter }, board.rest.map((e, i) => item(e, rows.length + i))) : null);
  }
  /** 票房排行上、場次通已經沒有場次的片：海報、評分、預告、片刻評分與票房 */
  /** 歷次上映：這部片在票房資料裡的每一次上映（首映、重映各一列）和合計；只有一次上映就不顯示。點其他那幾列可以過去看那一次的資料 */
  runsSection(x) {
    const rows = boxRunRows(x);
    if (!rows.length) return "";
    return /* @__PURE__ */ h(Section, { title: `《${boxRunsName(x)}》歷次上映`, hint: "官方把每一次上映分開算，這裡把同一部片的放在一起。資料從 2016 年開始，更早的上映沒有紀錄。" }, rows.map((r) => /* @__PURE__ */ h(
      Item,
      {
        title: r.title + (r.current ? "（這一筆）" : ""),
        subtitle: r.note,
        right: r.value,
        head: !r.run,
        chevron: !!r.run && !r.current,
        onTap: r.run && !r.current ? () => this.go(() => this.boxMovieView(r.run), `讀取《${r.run.name}》…`) : void 0
      }
    )));
  }
  async boxMovieView(x) {
    const [e, info] = await Promise.all([this.extras(x.name), boxInfo(x).catch(() => null)]);
    const introJob = loadIntro(x.name, x.release).catch(() => ({ intro: "", director: "", cast: "" }));
    const introGot = await Promise.race([introJob, sleep(this.rerendering ? 0 : 800).then(() => void 0)]);
    const rr = rerunDataReady();
    const rrDone = rr ? await Promise.race([rr.then(() => true), sleep(this.rerendering ? 0 : 800).then(() => false)]) : true;
    const waiting = [];
    if (introGot === void 0) waiting.push(introJob);
    if (rr && !rrDone) waiting.push(rr);
    if (waiting.length) this.late = waiting;
    const about = movieAbout(introGot || null);
    const date = x.release.replace(/-/g, "/");
    return /* @__PURE__ */ h(Page, { title: x.name, subtitle: `票房第 ${x.rank} 名`, onBack: () => this.back() }, this.hero(e, x.name, [boxCountryText(x.country), `${date} 上映`]), about.text || about.credits ? /* @__PURE__ */ h(Section, { title: about.text ? "劇情簡介" : "導演與演員", hint: "資料來自 TMDB。" }, /* @__PURE__ */ h(Para, { text: about.text || about.credits, dim: about.text ? about.credits : "" })) : null, /* @__PURE__ */ h(Section, { title: "票房資訊", hint: "資料來源：國家電影及視聽文化中心「全國電影票房統計」。" }, /* @__PURE__ */ h(Item, { kv: true, title: "狀態", tag: { text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) } }), boxInfoRows(x, info).map(([label, value]) => /* @__PURE__ */ h(Item, { kv: true, title: label, right: value }))), this.runsSection(x), /* @__PURE__ */ h(Note, { text: boxStatus(x) === "few" ? "官方票房資料顯示這部片最近一週還有賣出票，但場次通目前查不到場次：可能只剩少數戲院（二輪、獨立戲院）在放，或這幾天剛下檔。" : "這部片已經下檔，場次通目前沒有它的場次。" }));
  }
  async movieListView() {
    if (this.movieMode === "fest") return this.festivalListView();
    if (this.movieMode === "box" || this.movieMode === "year") return this.boxOfficeView();
    const board = await loadSoonBoard(this.movieQuery, { when: this.soonWhen, state: this.soonState });
    const fold = (id, title, summary) => /* @__PURE__ */ h(Item, { kv: true, title, right: `${summary} ${this.soonOpen === id ? "▾" : "▸"}`, chevron: false, onTap: () => {
      this.soonOpen = this.soonOpen === id ? "" : id;
    } });
    const list = board.groups.flatMap((g) => g.items);
    prefetchPosters(list.filter((e) => e.m).map((e) => e.m));
    const jobs = list.map((e) => (e.m ? moviePoster(e.m.title, e.m.slug, e.m.en) : moviePoster(e.title)).catch(() => ""));
    const got = await Promise.all(jobs.map((p) => Promise.race([p, sleep(this.rerendering ? 0 : 600).then(() => void 0)])));
    const pending = jobs.filter((_, i) => got[i] === void 0);
    const late = [];
    for (let i = 0; i < pending.length; i += 8) late.push(Promise.all(pending.slice(i, i + 8)));
    if (late.length) this.late = late;
    const thumbOf = /* @__PURE__ */ new Map();
    list.forEach((e, i) => {
      const u = got[i];
      if (u === void 0) return void thumbOf.set(e, { src: "", pending: true });
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      thumbOf.set(e, { src, url: u });
    });
    const monthKey = (title) => title.replace(/（\d+）$/, "");
    const item = (e) => {
      const m = e.m, u = e.u;
      return /* @__PURE__ */ h(
        Item,
        {
          thumb: thumbOf.get(e),
          title: e.title,
          subtitle: e.lines.filter(Boolean).join("\n"),
          onTap: m ? () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) : u ? () => this.go(() => this.soonMovieView(u), `讀取《${u.title}》…`) : void 0
        }
      );
    };
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: `即將上映 ${board.total} 部｜${board.open} 部可查場次`, onBack: () => this.back() }, this.movieModeChips(), /* @__PURE__ */ h(Search, { value: this.movieQuery, placeholder: "在即將上映裡搜尋片名", onInput: (t) => {
      this.movieQuery = t;
    } }), /* @__PURE__ */ h(Section, { hint: this.soonOpen === "when" && board.whens.length > 4 ? "可以左右滑動" : "" }, fold("when", "上映時間", board.whenLabel), this.soonOpen === "when" ? /* @__PURE__ */ h(Chips, { scroll: true }, board.whens.map((w) => /* @__PURE__ */ h(Chip, { label: w.label, sub: `${w.count} 部`, muted: w.id !== board.when, onTap: () => {
      this.soonWhen = w.id;
      this.soonOpen = "";
    } }))) : null, fold("state", "場次", board.stateLabel), this.soonOpen === "state" ? /* @__PURE__ */ h(Chips, { scroll: true }, board.states.map((s) => /* @__PURE__ */ h(Chip, { label: s.label, sub: `${s.count} 部`, muted: s.id !== board.state, onTap: () => {
      this.soonState = s.id;
      this.soonOpen = "";
    } }))) : null), board.groups.map((g, i) => {
      const shut = this.soonShut.indexOf(monthKey(g.title)) >= 0;
      return /* @__PURE__ */ h(Section, { hint: i === board.groups.length - 1 ? board.footer : "" }, /* @__PURE__ */ h(Item, { kv: true, title: g.title, right: shut ? "展開 ▸" : "收合 ▾", chevron: false, onTap: () => {
        const k = monthKey(g.title);
        this.soonShut = shut ? this.soonShut.filter((x) => x !== k) : [...this.soonShut, k];
      } }), shut ? null : g.items.map(item));
    }), list.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "找不到相符的電影" }), this.movieQuery.trim() ? this.searchAllLink(this.movieQuery.trim()) : null);
  }
  /** 還沒有場次的即將上映片：海報、評分、預告，加上映日期 */
  async soonMovieView(u) {
    const e = await this.extras(u.title, void 0, u.en);
    const date = u.release.replace(/-/g, "/");
    const soonAbout = movieAbout(u);
    return /* @__PURE__ */ h(Page, { title: u.title, subtitle: `${date} 上映`, onBack: () => this.back() }, this.hero(e, u.title, [u.en, [`${date} ${u.approx ? "當週" : ""}上映`, u.rating, u.runtime ? `${u.runtime} 分` : ""].filter(Boolean).join("｜")].filter(Boolean), { en: u.en, poster: u.poster }), soonAbout.text || soonAbout.credits ? /* @__PURE__ */ h(Section, { title: soonAbout.text ? "劇情簡介" : "導演與演員", hint: "資料來自 TMDB。" }, /* @__PURE__ */ h(Para, { text: soonAbout.text || soonAbout.credits, dim: soonAbout.text ? soonAbout.credits : "" })) : null, /* @__PURE__ */ h(Note, { text: "戲院還沒有排這部片的場次。通常上映前一到兩週會開放，到時候這裡會自動變成可以查場次。上映日期可能再調整。" }), /* @__PURE__ */ h(Button, { label: "🌐 開眼電影網的介紹", kind: "secondary", onTap: () => Safari.open(u.url) }));
  }
  // 只看收藏影城
  async movieView(m, date) {
    if (this.movieFor !== m.slug) {
      this.movieFor = m.slug;
      this.movieDates = date ? [date] : [];
    }
    const d = await movieDay(m.slug, void 0);
    const dates = d.dates.filter((x2) => x2 >= todayTPE());
    const allDates = dates.length ? dates : [d.date];
    const picked = this.movieDates.filter((x2) => allDates.indexOf(x2) >= 0);
    const selDates = picked.length ? picked.slice().sort() : [allDates.indexOf(d.date) >= 0 ? d.date : allDates[0]];
    const days = await movieDays(m.slug, selDates);
    const cities = Array.from(new Set(days.flatMap((x2) => x2.cinemas.map((c) => c.city)))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const selCities = this.movieCities.filter((c) => cities.indexOf(c) >= 0);
    const favIds = this.movieFavOnly ? this.settings.favorites : null;
    for (const day of days) {
      const fillIds = day.cinemas.filter((c) => (!selCities.length || selCities.indexOf(c.city) >= 0) && (!favIds || favIds.indexOf(c.id) >= 0)).map((c) => c.id);
      if (!movieDayFilled(day, fillIds)) {
        const job = foregroundTask(fillMovieDay(day, fillIds).catch(() => day));
        await Promise.race([job, sleep(this.rerendering ? 0 : 1500)]);
        if (!movieDayFilled(day, fillIds)) this.late.push(job);
      }
    }
    let runtime = d.runtime || m.runtime;
    const formats = FORMATS.filter((f) => days.some((x2) => x2.cinemas.some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0))));
    const selFormats = this.movieFormats.filter((f) => formats.indexOf(f) >= 0);
    const rows = movieRows(days, { cities: selCities, formats: selFormats, favIds });
    const many = selDates.length > 1;
    const toCinema = (c) => this.cinemas.find((x2) => x2.id === c.id) || { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address };
    const toggle = (list, id, min1 = false) => {
      const i = list.indexOf(id);
      if (i < 0) return [...list, id];
      return min1 && list.length === 1 ? list : list.filter((x2) => x2 !== id);
    };
    const x = await this.extras(m.title, m.slug, m.en);
    if (!runtime) runtime = await this.fillRuntime(m, 1500);
    const shownCities = cities.filter((ct) => rows.some((r) => r.cinema.city === ct));
    const about = movieAbout(d);
    const boxJob = boxInfoBy(m.title).catch(() => null);
    const boxGot = await Promise.race([boxJob, sleep(this.rerendering ? 0 : 400).then(() => void 0)]);
    if (boxGot === void 0) this.late = [...this.late || [], boxJob];
    const box = boxGot || null;
    if (box && this.infoOpen) {
      const rr = rerunDataReady();
      if (rr) this.late = [...this.late || [], rr];
    }
    const status = m.comingSoon ? "soon" : "now";
    return /* @__PURE__ */ h(Page, { title: m.title, subtitle: [m.rating || d.rating, runtime ? `${runtime} 分鐘` : "", `${d.cinemas.length} 間影城`].filter(Boolean).join("｜"), onBack: () => this.back() }, this.hero(x, m.title, [m.en, [m.rating || d.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"), releaseLabel(d.release || m.release || releaseOf(m.title)), `${d.cinemas.length} 間影城有放映`]), about.text || about.credits ? /* @__PURE__ */ h(Section, { title: "劇情簡介", hint: "簡介來自場次通。" }, /* @__PURE__ */ h(Para, { text: about.text || about.credits, dim: about.text ? about.credits : "" })) : null, /* @__PURE__ */ h(Section, { hint: box ? this.infoOpen ? `資料來源：國家電影及視聽文化中心「全國電影票房統計」，官方每週更新一次。` : "點「票房資訊」可以展開，看票數、院數、發行商等更多資訊。" : "" }, /* @__PURE__ */ h(Item, { kv: true, title: "狀態", tag: { text: STATUS_LABEL[status], tone: status } }), box ? /* @__PURE__ */ h(Item, { kv: true, title: "票房資訊", right: `${money(box.x.total)}｜${this.infoOpen ? "收合 ▾" : "展開 ▸"}`, chevron: false, onTap: () => {
      this.infoOpen = !this.infoOpen;
    } }) : /* @__PURE__ */ h(Item, { kv: true, title: "票房資訊", right: "官方資料還沒列入" }), box && this.infoOpen ? boxInfoRows(box.x, box.info).map(([label, value]) => /* @__PURE__ */ h(Item, { kv: true, title: label, right: value })) : null), box && this.infoOpen ? this.runsSection(box.x) : null, /* @__PURE__ */ h(Section, { title: "日期", hint: "日期、縣市、特殊廳都可以複選。" }, /* @__PURE__ */ h(Chips, null, allDates.map((dt) => /* @__PURE__ */ h(Chip, { label: dateLabel(dt).replace(/（.）.*$/, ""), sub: dt === todayTPE() ? "今天" : dateLabel(dt).match(/（(.)）/)?.[1] || "", muted: selDates.indexOf(dt) < 0, onTap: () => {
      this.movieDates = toggle(selDates, dt, true);
    } })))), /* @__PURE__ */ h(Section, { title: "縣市" }, /* @__PURE__ */ h(Chips, null, /* @__PURE__ */ h(Chip, { label: "全部", muted: selCities.length > 0, onTap: () => {
      this.movieCities = [];
    } }), cities.map((c) => /* @__PURE__ */ h(Chip, { label: c, muted: selCities.indexOf(c) < 0, onTap: () => {
      this.movieCities = toggle(selCities, c);
    } })))), formats.length ? /* @__PURE__ */ h(Section, { title: "特殊廳" }, /* @__PURE__ */ h(Chips, null, /* @__PURE__ */ h(Chip, { label: "全部", muted: selFormats.length > 0, onTap: () => {
      this.movieFormats = [];
    } }), formats.map((f) => /* @__PURE__ */ h(Chip, { label: f, muted: selFormats.indexOf(f) < 0, onTap: () => {
      this.movieFormats = toggle(selFormats, f);
    } })))) : null, /* @__PURE__ */ h(Section, { title: "影城" }, /* @__PURE__ */ h(Chips, null, /* @__PURE__ */ h(Chip, { label: "所有影城", muted: this.movieFavOnly, onTap: () => {
      this.movieFavOnly = false;
    } }), /* @__PURE__ */ h(Chip, { label: `只看收藏影城（${this.settings.favorites.length}）`, muted: !this.movieFavOnly, onTap: () => {
      this.movieFavOnly = true;
    } }))), shownCities.map((ct) => {
      const list = rows.filter((r) => r.cinema.city === ct);
      return /* @__PURE__ */ h(Section, { title: `${ct}（${new Set(list.map((r) => r.cinema.id)).size} 間）` }, list.map(({ day, date: dt, cinema: c }) => {
        const movie = { title: d.title || m.title, runtime, rating: d.rating || m.rating, versions: c.versions, runtimeFrom: d.runtime ? d.runtimeFrom : m.runtimeFrom };
        const summary = c.versions.map((v) => `${v.label} ${[...v.times].sort(byShowtime).join(" ")}`).join("／");
        return /* @__PURE__ */ h(
          Item,
          {
            icon: this.settings.favorites.indexOf(c.id) >= 0 ? "★" : void 0,
            title: many ? `${c.name}　${dateLabel(dt).replace(/ .*$/, "")}` : c.name,
            subtitle: summary,
            onTap: async () => {
              await fillMovieDay(day, [c.id]).catch(() => day);
              const fresh = day.cinemas.find((y) => y.id === c.id);
              const mv = { ...movie, versions: fresh ? filterVersionsAny(fresh.versions, selFormats) : movie.versions };
              this.go(() => this.timesView(toCinema(c), dt, mv, { booking: "", sourceUrl: `${TW}/cinemas/${c.id}/${dt}/`, address: c.address }));
            }
          }
        );
      }));
    }), rows.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: this.movieFavOnly && !this.settings.favorites.length ? "還沒有收藏的影城，先到影城頁加入。" : "沒有符合條件的影城，換個日期或條件試試。" }));
  }
  // ── 分享 ──
  /** 分享這部電影：一段文字加連結，朋友點了會直接開到這部片的頁面（網頁版） */
  async shareMovie(title, fest) {
    const url = `${SITE_URL}/?m=${encodeURIComponent(title)}${fest ? `&f=${encodeURIComponent(fest.id)}&ff=${encodeURIComponent(fest.film)}` : ""}`;
    await ShareSheet.present([`《${title}》${fest ? `｜${fest.name}` : ""}
場次、評分、預告都在「片刻」：
${url}`]);
  }
  /** 從分享連結進來（?m=片名）：找出這部片現在對應的頁面（有場次的電影頁、即將上映、影展片、票房資訊）直接打開 */
  async openShared() {
    if (true) return;
    const search = String(globalThis.location?.search || "");
    const param = (name) => {
      const m = new RegExp(`[?&]${name}=([^&]*)`).exec(search);
      try {
        return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
      } catch (_) {
        return "";
      }
    };
    const who = param("u").trim().slice(0, 16);
    if (who) {
      this.switchTab("settings");
      this.go(() => this.profileView(who), "讀取個人頁…");
      return;
    }
    const title = param("m").trim().slice(0, 120);
    if (!title) return;
    const fid = param("f"), film = param("ff");
    const fav = { key: communityKey(title), title, at: 0, ...fid ? { fest: { id: fid.slice(0, 40), film: film.slice(0, 80), name: "" } } : {} };
    if (!fav.key) return;
    const row = (await favMovieRows({ ...this.settings, favMovies: [fav] }).catch(() => []))[0];
    this.tab = "movies";
    this.stack = [() => this.movieListView()];
    if (row) this.openFavRow(row);
    else this.go(() => this.favMovieView(fav), `讀取《${title}》…`);
  }
  async share(p) {
    await ShareSheet.present([shareText({ ...p, address: p.address }, this.start(p), this.runtime ? this.end(p) : void 0, this.seat, this.settings.maps)]);
  }
  async locate() {
    if (this.me) return this.me;
    try {
      Location.setAccuracyToHundredMeters();
      const l = await Location.current();
      this.me = { lat: l.latitude, lng: l.longitude };
      return this.me;
    } catch (_) {
      throw new Error(false ? "拿不到目前位置。請允許瀏覽器使用位置（iPhone：設定 → 隱私權與安全性 → 定位服務 → Safari 網站）。" : "拿不到目前位置。請到「設定 → 隱私權與安全性 → 定位服務 → Scriptable」允許使用位置。");
    }
  }
  async nearbyView() {
    const me = await this.locate();
    const list = nearest(this.cinemas, me, 25);
    return /* @__PURE__ */ h(Page, { title: "附近的影城", subtitle: "直線距離", onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, list.map(({ cinema: c, km }) => /* @__PURE__ */ h(
      Item,
      {
        icon: this.settings.favorites.indexOf(c.id) >= 0 ? "★" : void 0,
        title: c.name,
        subtitle: `${c.city} ${c.district}`,
        right: kmLabel(km) || "距離未知",
        onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)
      }
    ))));
  }
  // 空 = 不限
  nowView() {
    const today = todayTPE();
    const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(today, i));
    const picked = this.nowDates.filter((d) => dates.indexOf(d) >= 0);
    const selDates = picked.length ? picked : [today];
    const hasToday = selDates.indexOf(today) >= 0;
    const wins = WINDOWS.filter((w) => !w.todayOnly || hasToday);
    const selWins = this.nowWins.filter((id) => wins.some((w) => w.id === id));
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const toggle = (list, id, min1 = false) => {
      const i = list.indexOf(id);
      if (i < 0) return [...list, id];
      return min1 && list.length === 1 ? list : list.filter((x) => x !== id);
    };
    const dayName = (d) => d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).replace(/\s.*$/, "");
    const few = (list, unit) => list.length > 3 ? `${list.slice(0, 2).join("、")}等 ${list.length} ${unit}` : list.join("、");
    const dateSum = few(selDates.slice().sort().map(dayName), "天");
    const winSum = selWins.length ? few(selWins.map((id) => wins.find((w) => w.id === id).label), "個時段") : "整天";
    const scopeName = (id) => id === "all" ? "全台" : id === "fav" ? "收藏影城" : id === "near" ? "附近 10 間" : id;
    const scopeSum = few(this.nowScopes.map(scopeName), "個範圍");
    const fmtSum = this.nowFormats.length ? few(this.nowFormats, "種") : "不限";
    const fold = (id, title, summary) => /* @__PURE__ */ h(Item, { kv: true, title, right: `${summary} ${this.nowOpen === id ? "▾" : "▸"}`, chevron: false, onTap: () => {
      this.nowOpen = this.nowOpen === id ? "" : id;
    } });
    const hint = this.nowOpen === "date" ? "可以選好幾天；可以左右滑動。" : this.nowOpen === "win" ? "可以選好幾個；都不選就是整天。「接下來 3 小時」只找今天。" : this.nowOpen === "fmt" ? "都不選就是不限；選了幾種，就找其中任一種。可以左右滑動。" : "";
    return /* @__PURE__ */ h(Page, { title: "現在有什麼可以看", subtitle: `${dateSum}｜${winSum}｜${scopeSum}`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint }, fold("date", "日期", dateSum), this.nowOpen === "date" ? /* @__PURE__ */ h(Chips, { scroll: true }, dates.map((d) => /* @__PURE__ */ h(Chip, { label: dateLabel(d).replace(/（.）.*$/, ""), sub: d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).match(/（(.)）/)?.[1] || "", muted: selDates.indexOf(d) < 0, onTap: () => {
      this.nowDates = toggle(selDates, d, true);
    } }))) : null, fold("win", "開演時段", winSum), this.nowOpen === "win" ? /* @__PURE__ */ h(Chips, { scroll: true }, wins.map((w) => /* @__PURE__ */ h(Chip, { label: w.label, muted: selWins.indexOf(w.id) < 0, onTap: () => {
      this.nowWins = w.id === "all" ? ["all"] : toggle(selWins.filter((x) => x !== "all"), w.id);
    } }))) : null, /* @__PURE__ */ h(Item, { kv: true, title: "影城", right: scopeSum, onTap: () => this.go(() => this.nowScopeView()) }), fold("fmt", "特殊廳", fmtSum), this.nowOpen === "fmt" ? /* @__PURE__ */ h(Chips, { scroll: true }, /* @__PURE__ */ h(Chip, { label: "不限", muted: this.nowFormats.length > 0, onTap: () => {
      this.nowFormats = [];
    } }), FORMATS.map((f) => /* @__PURE__ */ h(Chip, { label: f, muted: this.nowFormats.indexOf(f) < 0, onTap: () => {
      this.nowFormats = toggle(this.nowFormats, f);
    } }))) : null), /* @__PURE__ */ h(Button, { label: "🔍 找場次", onTap: () => this.go(() => this.nowResultsView(selDates, selWins), "正在查詢各影城的場次…") }));
  }
  // 目前展開哪一列的選項（日期／時段／特殊廳）
  /** 「現在有什麼可以看」要找哪些影城：一列一個、可複選（全台跟其他的不能同時選） */
  nowScopeView() {
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99));
    const sel = this.nowScopes;
    const pick = (id) => {
      if (id === "all") return void (this.nowScopes = ["all"]);
      const rest = sel.filter((x) => x !== "all");
      const next = rest.indexOf(id) < 0 ? [...rest, id] : rest.filter((x) => x !== id);
      this.nowScopes = next.length ? next : rest;
    };
    const row = (id, title, note, right) => /* @__PURE__ */ h(Item, { icon: sel.indexOf(id) >= 0 ? "✅" : "⬜️", title, subtitle: note, right, chevron: false, onTap: () => pick(id) });
    return /* @__PURE__ */ h(Page, { title: "找哪些影城", subtitle: `已選 ${sel.length} 個`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint: "可以選好幾個，合在一起找。" }, row("fav", "收藏影城", "", `${this.settings.favorites.length} 間`), row("near", "附近 10 間", "依目前位置", ""), row("all", "全台", "要讀每一間影城，最久", `${this.cinemas.length} 間`)), /* @__PURE__ */ h(Section, { title: "縣市", hint: "縣市的影城較多、選的天數越多，會花比較久時間。開眼來源的戲院通常只有今天的場次。選好之後按左上角的返回。" }, cities.map((c) => row(c, c, "", `${this.cinemas.filter((x) => x.city === c).length} 間`))));
  }
  // 在結果裡再搜尋的字
  async nowResultsView(dates, winIds) {
    const byId = /* @__PURE__ */ new Map();
    const add = (list) => list.forEach((x) => {
      const old = byId.get(x.cinema.id);
      if (!old || old.km === null && x.km !== null) byId.set(x.cinema.id, x);
    });
    for (const sc of this.nowScopes) {
      if (sc === "all") add(this.cinemas.map((c) => ({ cinema: c, km: null })));
      else if (sc === "near") add(nearest(this.cinemas, await this.locate(), 10));
      else if (sc === "fav") add(this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean).map((c) => ({ cinema: c, km: null })));
      else add(this.cinemas.filter((c) => c.city === sc).map((c) => ({ cinema: c, km: null })));
    }
    const scope = Array.from(byId.values());
    if (!scope.length) throw new Error("沒有可以查的影城。先到影城頁收藏影城，或改選附近／縣市。");
    const { hits, failed, noData } = await findShowtimesMulti(scope, dates, winIds, this.nowFormats);
    const groups = await linkMovies(groupByMovie(hits));
    prefetchPosters(groups);
    const jobs = groups.map((g) => moviePoster(g.title, g.movie?.slug, g.movie?.en).catch(() => ""));
    const got = await Promise.all(jobs.map((p) => Promise.race([p, sleep(this.rerendering ? 0 : 600).then(() => void 0)])));
    const pending = jobs.filter((_, i) => got[i] === void 0);
    if (pending.length) this.late = [Promise.all(pending)];
    const thumbOf = (title) => {
      const u = got[groups.findIndex((g) => g.title === title)];
      if (u === void 0) return { src: "", pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      return { src, url: u };
    };
    const scopeLabel = this.nowScopes.map((sc) => sc === "all" ? "全台影城" : sc === "fav" ? "收藏影城" : sc === "near" ? "附近 10 間" : sc).join("、");
    const many = dates.length > 1;
    const foldKey = [dates.join(","), winIds.join(","), this.nowScopes.join(","), this.nowFormats.join(",")].join("|");
    if (this.nowFoldFor !== foldKey) {
      this.nowFoldFor = foldKey;
      this.nowFolded = [];
      this.nowQuery = "";
    }
    const shown = nowFilter(groups, this.nowQuery);
    const folded = (t) => this.nowFolded.indexOf(t) >= 0;
    const allFolded = shown.length > 0 && shown.every((g) => folded(g.title));
    const open = (hit) => {
      this.runtime = hit.movie.runtime;
      this.seat = hallOf(hit.version.label);
      this.go(() => this.confirmView({ cinema: hit.cinema, address: hit.ctx.address || hit.cinema.address || "", booking: hit.ctx.booking, sourceUrl: hit.ctx.sourceUrl, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time }));
    };
    return /* @__PURE__ */ h(Page, { title: multiLabel(dates, winIds), subtitle: `${hits.length} 場｜${groups.length} 部電影`, onBack: () => this.back() }, /* @__PURE__ */ h(Note, { text: `${multiDetail(dates, winIds)}
影城：${scopeLabel}${this.nowFormats.length ? `
特殊廳：${this.nowFormats.join("、")}` : ""}` }), groups.length ? null : /* @__PURE__ */ h(Empty, { icon: "🍿", text: "沒有符合的場次，換個時段或範圍試試。" }), groups.length > 1 ? /* @__PURE__ */ h(Search, { value: this.nowQuery, placeholder: "在結果裡搜尋片名、影城或廳別", onInput: (t) => {
      this.nowQuery = t;
    } }) : null, this.nowQuery.trim() ? /* @__PURE__ */ h(Note, { text: shown.length ? `「${this.nowQuery.trim()}」：${shown.reduce((n, g) => n + g.hits.length, 0)} 場｜${shown.length} 部電影。清空搜尋欄就回到全部結果。` : `結果裡找不到「${this.nowQuery.trim()}」。清空搜尋欄就回到全部結果。` }) : null, shown.length > 1 ? /* @__PURE__ */ h(
      Button,
      {
        label: allFolded ? "▸ 全部展開場次" : "▾ 全部收合，只看片名",
        kind: "secondary",
        onTap: () => {
          this.nowFolded = allFolded ? [] : shown.map((g) => g.title);
        }
      }
    ) : null, shown.map((g) => /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(
      Item,
      {
        head: true,
        thumb: thumbOf(g.title),
        title: g.title,
        subtitle: nowGroupLine(g) + (g.movie ? "\n點片名看電影介紹與所有場次" : ""),
        onTap: g.movie ? () => this.go(() => this.movieView(g.movie, ""), `讀取《${g.title}》…`) : void 0,
        action: { label: folded(g.title) ? "▸" : "▾", hint: folded(g.title) ? "展開這部片的場次" : "收合這部片的場次", onTap: () => {
          this.nowFolded = folded(g.title) ? this.nowFolded.filter((t) => t !== g.title) : [...this.nowFolded, g.title];
        } }
      }
    ), (folded(g.title) ? [] : g.hits).map((hit) => /* @__PURE__ */ h(
      Item,
      {
        title: `${many && hit.day ? dateLabel(hit.day).replace(/ .*$/, "") + " " : ""}${hit.time}${isLate(hit.time) ? "（凌晨）" : ""}　${hit.cinema.name}`,
        subtitle: [hit.version.label, kmLabel(hit.km)].filter(Boolean).join("｜"),
        onTap: () => open(hit)
      }
    )))), failed.length ? /* @__PURE__ */ h(Note, { kind: "warn", text: `有 ${failed.length} 間讀取失敗：${failed.join("、")}` }) : null, noData.length ? /* @__PURE__ */ h(Note, { text: `這幾間目前沒有所選日期的場次資料（來源還沒更新），請到影城官網查詢：${noData.join("、")}` }) : null);
  }
  // 從捷徑或 Safari 分享場次通／誠品／光點網址時，直接跳到那間影城
  startFrom(url) {
    const m = url.match(/twshowtimes\.com\/cinemas\/([^/]+)\/(?:(\d{4}-\d{2}-\d{2})\/)?/);
    let c;
    if (m) c = this.cinemas.find((x) => x.id === m[1]);
    else if (/eslite\.com/.test(url)) c = EXTRA.find((x) => x.id === "eslite");
    else if (/spot-hs\.org\.tw/.test(url)) c = EXTRA.find((x) => x.id === "spot-hs");
    else if (/spot\.org\.tw/.test(url)) c = EXTRA.find((x) => x.id === "spot-taipei");
    else if (/luxcinema\.com\.tw/.test(url)) c = EXTRA.find((x) => x.id === "lux");
    else if (/nwac\.org\.tw/.test(url)) c = EXTRA.find((x) => x.id === "nwac");
    else {
      const at = url.match(/atmovies\.com\.tw\/showtime\/(t\w+)\//);
      if (at) c = this.cinemas.find((x) => x.id === "at-" + at[1]);
    }
    if (!c) return false;
    const cinema = c;
    this.go(() => this.cinemaView(cinema), `讀取 ${cinema.name} 的場次…`);
    if (m && m[2]) this.go(() => this.moviesView(cinema, m[2]));
    return true;
  }
};
setPlatform(globalThis.__webPlatform || scriptablePlatform);
await new App().run();
Script.complete();
