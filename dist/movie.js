// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: film; share-sheet-inputs: url, plain-text;
// @movie-schedule-app 電影行程 v2026.11.22-2235
// 由 src/main.tsx 編譯產生（esbuild），請改原始碼後重新編譯。

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
  let title = "", en = "", rating = "", runtime = 0, image = "", release = "";
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
  return { title, en, rating, runtime, image, release, date, dates, cinemas };
}
{
  parseAtDay,
  parseAtRegion,
  parseEslite,
  parseLux,
  parseLuxFilm,
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
  ["t02c01", "a02", "百老匯影城公館店", "台北市中正區羅斯福路四段200號3~5樓"],
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
  ["t03510", "a35", "百老匯影城竹北店", "新竹縣竹北市自強南路36號3~5樓"],
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
var AT_COVERED = new Set("t02a01 t02a08 t02a09 t02a11 t02a12 t02a13 t02b01 t02b03 t02b05 t02b06 t02b07 t02b08 t02b14 t02b16 t02d02 t02d03 t02d04 t02d05 t02d20 t02e07 t02e10 t02e11 t02e12 t02e13 t02e15 t02e17 t02e18 t02e20 t02e21 t02g04 t03304 t03307 t03308 t03315 t03317 t03505 t03508 t03701 t03801 t03803 t04401 t04402 t04407 t04409 t04410 t04411 t04412 t04413 t04504 t05504 t05505 t06607 t06609 t06610 t06611 t06628 t06902 t07702 t07703 t07705 t07707 t07708 t07728 t07729 t07730 t08701 t08703 t08902".split(" "));
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
async function loadSettings() {
  const def = { favorites: ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"], ads: 10 };
  try {
    const json = await platform().loadSettingsJSON();
    return json ? { ...def, ...JSON.parse(json) } : def;
  } catch (_) {
    return def;
  }
}
function saveSettings(s) {
  platform().saveSettingsJSON(JSON.stringify(s, null, 1));
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
  return tw.concat(EXTRA, await loadAtTheaters());
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
var multiCache = {};
async function multiDayLive(c) {
  if (c.source === "eslite") return parse("parseEslite", await getText(c.url));
  if (c.source === "spot-hs") return parse("parseSpotHs", await getText(c.url));
  if (c.source === "lux") return luxCinema();
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
    const d = await twDay(c);
    const future = d.dates.filter((x) => x >= today);
    return { dates: future.length ? future : d.dates, address: d.address, notice: "", site: d.booking || "" };
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
    if (d.date !== date) d = await twDay(c, date);
    if (d.date && d.date !== date) throw new Error("網站回傳的日期和選擇的不同，請稍後再試");
    return { movies: await fillRuntimes(await supplementHalls(c, date, d.movies)), booking: d.booking, sourceUrl: `${TW}/cinemas/${c.id}/${date}/`, address: d.address };
  }
  const m = await multiDay(c);
  return { movies: await fillRuntimes(m.schedules[date] || []), booking: c.url, sourceUrl: c.url, address: c.address || "" };
}
var VARIANTS = { 祕: "秘", 臺: "台", 裏: "裡", 艶: "艷", 羣: "群", 峯: "峰", 砲: "炮" };
var normTitle = (t) => String(t || "").toLowerCase().replace(/[\s:：·・\-–—_＿!！?？,，.。'"’‘“”「」『』《》〈〉＜＞<>()（）\[\]【】／/]/g, "").replace(/[祕臺裏艶羣峯砲]/g, (c) => VARIANTS[c] || c);
var looseTitle = (t) => normTitle(baseTitle(t)).replace(/^(?:劇場版|電影版|動畫電影)/, "") || normTitle(t);
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
var TMDB_LINKS = {
  signup: "https://www.themoviedb.org/signup",
  login: "https://www.themoviedb.org/login",
  api: "https://www.themoviedb.org/settings/api",
  request: "https://www.themoviedb.org/settings/api/request"
};
function extractTmdbKey(text) {
  const s = String(text || "");
  return (s.match(/eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/) || s.match(/\b[0-9a-f]{32}\b/i) || [""])[0] || s.trim();
}
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
      disk = JSON.parse(cacheGet("meta.json") || "null");
    } catch (_) {
    }
    if (disk && Date.now() - disk.at < 36e5) return fresh(disk.data);
    const net = (async () => {
      const r = await platform().fetchText(META_URL + "?t=" + Math.floor(Date.now() / 18e5), { accept: "application/json" });
      if (r.status !== 200) return null;
      const data = JSON.parse(r.body);
      if (!data || typeof data.movies !== "object") return null;
      cacheSet("meta.json", JSON.stringify({ at: Date.now(), data }));
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
  return extrasCache[k] ||= (async () => {
    const ck = (hasToken ? "t|" : "n|") + normTitle(title);
    const read = readExtras;
    const hit = read()[ck];
    const stale = hit && hit.v !== EXTRAS_V && true;
    const ttl = stale ? 0 : !hit?.trailerName ? 36e5 : hit?.poster ? 7 * 864e5 : 864e5;
    const me = await metaOf(title);
    if (me && me.tn && me.t) return { poster: normImageUrl(me.p || hit?.poster || ""), trailer: me.t, trailerName: me.tn };
    if (hit && Date.now() - hit.at < ttl) return { poster: hit.poster, trailer: hit.trailer, trailerName: hit.trailerName };
    const out = await findExtras(title, slug);
    const all = read();
    for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 864e5) delete all[key];
    const { err: _e, ...keep } = out;
    all[ck] = { ...keep, at: Date.now(), v: EXTRAS_V };
    cacheSet("extras.json", JSON.stringify(all));
    return out;
  })();
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
  try {
    const poster = await Promise.race([moviePoster(title, slug, en), delay(1500).then(() => "")]);
    const id = await atMovieId(title, poster || "");
    if (!id) return 0;
    const html = await Promise.race([atPage(id), delay(3500).then(() => "")]);
    const m = html.match(/上映日期[:：]?(?:\s|<[^>]*>|&nbsp;)*(\d{4})/);
    return m ? Number(m[1]) : 0;
  } catch (_) {
    return 0;
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
function posterLight(title, release) {
  const k = "|" + title;
  return posterLightMem[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk] || all["p|" + nk];
    if (hit?.poster && !/ytimg\.com/.test(hit.poster)) return normImageUrl(hit.poster);
    const me = await metaOf(title);
    if (me && me.p) return normImageUrl(me.p);
    const own = all["l|" + nk];
    if (own && Date.now() - own.at < (own.poster ? 30 : 3) * 864e5) return own.poster;
    const year = Number((release || "").slice(0, 4)) || 0;
    const poster = await posterLane(async () => {
      try {
        const q = baseTitle(title).toLowerCase().replace(/[\\/?#%]/g, " ").trim();
        const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(q)}.json`, { "User-Agent": UA });
        const d = JSON.parse(r.body).d || [];
        const x = d.find((v) => /^tt/.test(v.id) && (v.qid === "movie" || v.qid === "tvMovie" || v.qid === "video") && v.i?.imageUrl && (!year || !v.y || Math.abs(Number(v.y) - year) <= 1));
        const u = String(x?.i?.imageUrl || "");
        return /^https:\/\/m\.media-amazon\.com\//.test(u) ? u.replace(/\._V1_.*?(\.\w+)$/, "._V1_UX300_$1") : "";
      } catch (_) {
        return "";
      }
    });
    const latest = readExtras();
    latest["l|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now() };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster;
  })().then((u) => posterDone[k] = u);
}
function moviePoster(title, slug, en) {
  const k = (slug || "") + "|" + title;
  return posterOnly[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk];
    const isThumb = (u) => /ytimg\.com/.test(u);
    if (hit?.poster && !isThumb(hit.poster)) return normImageUrl(hit.poster);
    const own = all["p|" + nk];
    if (own && Date.now() - own.at < (own.poster && !isThumb(own.poster) ? 7 : own.v === EXTRAS_V ? 1 : 0) * 864e5) return own.poster;
    const me = await metaOf(title);
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
async function tmdbTest(token) {
  const d = await tmdb(`/movie/244786?language=zh-TW`, token.trim());
  return `${d.title}：${d.runtime} 分鐘`;
}
var moviesCache = null;
async function loadMovies() {
  if (!moviesCache) {
    const list = await fillRuntimes(await parse("parseTwMovies", await getText(TW + "/movies/")));
    const meta = await loadMeta().catch(() => null);
    const today = todayTPE();
    for (const m of list) {
      const e = meta && (meta.movies[normTitle(m.title)] || meta.movies[normTitle(baseTitle(m.title))]);
      if (e?.rd) m.release = e.rd;
      if (m.comingSoon && m.release && m.release <= today) {
        m.comingSoon = false;
        m.noShowToday = true;
      }
    }
    const soon = list.filter((m) => m.comingSoon).sort((a, b) => (a.release || "9999").localeCompare(b.release || "9999"));
    moviesCache = [...list.filter((m) => !m.comingSoon && !m.noShowToday), ...list.filter((m) => m.noShowToday), ...soon];
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
    [by === "year" && x.showing ? "上映中" : "", releaseLabel(x.release), x.theaters ? `${x.theaters} 間戲院` : ""].filter(Boolean).join("｜")
  ];
}
function boxSorts(b) {
  const out = [{ id: "week", label: b.mode === "week" ? "本週" : "近期" }];
  if (b.mode === "week") out.push({ id: "total", label: "累計" });
  if (boxYears(b).length) out.push({ id: "year", label: "年度" });
  return out;
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
  const src = `資料來源：${b.source}。官方每週更新一次。`;
  if (by === "week" && boxWeekPicked(b, week).past)
    return `這是那一週的排行：「當週」是那七天的票房，「累計」算到那一週為止。那時候上映的片，現在可能已經下檔。標「上映至當時」的是官方那一週才第一次列入的新片，數字是上映以來的累計。${src}`;
  if (by === "year") {
    const ys = boxYearsPicked(b, years);
    return `${yearText(ys)} 年上映、有票房紀錄的電影依累計票房排序；已經下檔的也在裡面，標「上映中」的是這一週還有賣出票的。年度依上映日期歸屬，票房是上映以來的累計。一次顯示 100 部，舊片的海報會慢慢補上，找不到的用預設海報。${src}`;
  }
  const scope = `只排上映中的電影：這一週有賣出票的共 ${b.list.length} 部，已經下檔的不在裡面（看「年度」）。`;
  return by === "total" ? `${scope}${src}` : `${scope}${boxOfficeNote(b)}${src}`;
}
function movieLines(m) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  const head = m.noShowToday ? "今天無場次" : m.comingSoon ? m.release ? `${md(m.release)} 上映` : "" : "";
  return [[head, m.rating, m.runtime ? `${m.runtime} 分` : "", m.cinemaCount ? `${m.cinemaCount} 間影城` : ""].filter(Boolean).join("｜"), m.en || ""];
}
var movieDayCache = {};
async function movieDay(slug, date) {
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
function festivalPeriod(f) {
  const md = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  return `${md(f.start)}–${md(f.end)}`;
}
function festivalGroups(list) {
  const live = list.filter((f) => festivalState(f) !== "past");
  const past = list.filter((f) => festivalState(f) === "past");
  return [
    { title: "進行中・即將開始", past: false, items: live },
    { title: "已結束（回顧）", past: true, items: past }
  ].filter((g) => g.items.length > 0);
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
    const g = map[h2.movie.title] || (map[h2.movie.title] = { title: h2.movie.title, runtime: h2.movie.runtime, rating: h2.movie.rating, hits: [] });
    if (!g.runtime && h2.movie.runtime) g.runtime = h2.movie.runtime;
    g.hits.push(h2);
  }
  return Object.values(map).sort((a, b) => b.hits.length - a.hits.length || showMinute(a.hits[0].time) - showMinute(b.hits[0].time));
}
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
    for (const q of [en, baseTitle(title)].filter(Boolean)) {
      const key = q.toLowerCase().replace(/[\\/?#%]/g, " ").trim();
      try {
        const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(key)}.json`, { "User-Agent": UA });
        const d = JSON.parse(r.body).d || [];
        const hit = d.find((x) => /^tt/.test(x.id) && (x.qid === "movie" || x.qid === "tvMovie" || x.qid === "video") && okYear(Number(x.y) || 0));
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
  return { critics: pct(d.criticsScore), certified: !!d.criticsScore?.certified, audience: pct(d.audienceScore), name, year };
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
async function findRatings(title, en, slug) {
  const out = {};
  const errs = [];
  const who = await identify(title, en, errs, await atYearHint(title, slug, en));
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
    if (f.s.audience >= 0) out.popcorn = { score: f.s.audience, url: f.url };
  })().catch(() => errs.push("爛番茄暫時讀不到"));
  await Promise.all([imdbJob, rtJob]);
  if (errs.length) out.err = errs.join("；");
  return out;
}
var ratingsMem = {};
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
    if (hit && hit.v === RATINGS_V && Date.now() - hit.at < (has(hit) ? 7 : 1) * 864e5) return hit;
    const me = await metaOf(title);
    if (me && me.r && me.ra) return me.r;
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
var RATINGS_V = 2;
function ratingTier(kind, v) {
  const x = kind === "imdb" ? v * 10 : v;
  return x >= 75 ? "good" : x >= 60 ? "mid" : "bad";
}
var SITE_URL = "https://app.twmovietime.workers.dev";
var ABOUT_URL = SITE_URL + "/about/";
var PRIVACY_URL = SITE_URL + "/privacy/";
var COMMUNITY_API = "https://movie-ratings.twmovietime.workers.dev";
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
var communityMem = {};
function communityCached(title) {
  return communityMem[communityKey(title)] || null;
}
var COMMUNITY_SUMMARY_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/data/community.json";
var summaryMem = null;
function loadSummary() {
  if (summaryMem && Date.now() - summaryMem.at < 3e5) return summaryMem.job;
  const job = (async () => {
    try {
      const r = await platform().fetchText(COMMUNITY_SUMMARY_URL + "?t=" + Math.floor(Date.now() / 3e5), { accept: "application/json" });
      if (r.status !== 200) return null;
      const m = JSON.parse(r.body)?.movies;
      return m && typeof m === "object" ? m : null;
    } catch (_) {
      return null;
    }
  })();
  summaryMem = { at: Date.now(), job };
  return job;
}
var readMyVotes = () => {
  try {
    return JSON.parse(cacheGet("my-votes.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};
function saveMyVote(k, c, fresh) {
  const all = readMyVotes();
  for (const [key, v] of Object.entries(all)) if (!v.s && Date.now() - v.at > 60 * 864e5) delete all[key];
  all[k] = fresh ? { s: c.mine, at: Date.now(), dist: c.dist, dat: Date.now() } : { s: c.mine, at: Date.now() };
  cacheSet("my-votes.json", JSON.stringify(all));
}
var fromDist = (dist, mine) => {
  const d = [0, 1, 2, 3, 4].map((i) => Number(dist[i]) || 0);
  const n = d.reduce((a, b) => a + b, 0);
  const sum = d.reduce((a, c, i) => a + c * (i + 1), 0);
  return { n, avg: n ? Math.round(sum / n * 10) / 10 : 0, dist: d, mine };
};
async function communityStats(title) {
  const k = communityKey(title);
  const hit = communityMem[k];
  if (hit && Date.now() - hit.at < 5e3) return { n: hit.n, avg: hit.avg, dist: hit.dist, mine: hit.mine };
  const mine = readMyVotes()[k];
  if (mine && Date.now() - mine.at < 30 * 864e5) {
    const summary = await loadSummary();
    if (summary) {
      const c2 = fromDist(mine.dist && mine.dat && Date.now() - mine.dat < 45 * 6e4 ? mine.dist : summary[k] || [], mine.s);
      communityMem[k] = { ...c2, at: Date.now() };
      return c2;
    }
  }
  const r = await platform().fetchText(`${COMMUNITY_API}/v1/stats?m=${encodeURIComponent(k)}&d=${encodeURIComponent(deviceId())}`, { accept: "application/json" });
  if (r.status !== 200) throw new Error("觀眾評分暫時讀不到");
  const c = JSON.parse(r.body);
  communityMem[k] = { ...c, at: Date.now() };
  saveMyVote(k, c, false);
  return c;
}
async function communityVote(title, score) {
  const k = communityKey(title);
  const r = await platform().fetchText(
    `${COMMUNITY_API}/v1/vote`,
    { accept: "application/json", "content-type": "application/json" },
    { method: "POST", body: JSON.stringify({ m: k, d: deviceId(), s: score }) }
  );
  if (r.status === 429) throw new Error("投票太頻繁，請稍後再試");
  if (r.status !== 200) throw new Error("評分沒有送出，請稍後再試");
  const c = JSON.parse(r.body);
  communityMem[k] = { ...c, at: Date.now() };
  saveMyVote(k, c, true);
  return c;
}
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
    try {
      const c = JSON.parse(cacheGet("boxoffice-years.json") || "null");
      if (c && c.years && c.end === b.end && Date.now() - c.at < 6 * 36e5) years = c.years;
    } catch (_) {
    }
    if (!years) {
      const r = await platform().fetchText(BOXOFFICE_YEARS_URL + "?t=" + Math.floor(Date.now() / 36e5), { accept: "application/json" });
      if (r.status !== 200) throw new Error("年度排行暫時讀不到");
      const d = JSON.parse(r.body);
      if (!d || typeof d.years !== "object") throw new Error("年度排行格式不對");
      years = d.years;
      cacheSet("boxoffice-years.json", JSON.stringify({ at: Date.now(), end: d.end, years }));
    }
    const full = {};
    for (const y of Object.keys(years)) full[y] = years[y].map((x) => ({ ...x, week: null, country: x.country || "" }));
    return { ...b, years: { ...b.years || {}, ...full } };
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
  return /* @__PURE__ */ h("nav", { class: "tabbar", "aria-label": "分頁" }, t.items.map((it) => /* @__PURE__ */ h("button", { class: "tab" + (it.id === t.active ? " on" : ""), onTap: () => t.onTap(it.id), "aria-label": it.label }, TAB_ICONS[it.icon] || "", /* @__PURE__ */ h("span", null, esc(it.label)))));
}
function Page(props) {
  const back = props.onBack && canGoBack() ? props.onBack : void 0;
  return /* @__PURE__ */ h("div", { class: "page" + (tabBarProvider && !props.noTabs ? " with-tabs" : "") }, /* @__PURE__ */ h("header", { class: "bar" }, back ? /* @__PURE__ */ h("button", { class: "back", onTap: back }, "‹ 返回") : /* @__PURE__ */ h("span", { class: "back-spacer" }), /* @__PURE__ */ h("div", { class: "bar-title" }, /* @__PURE__ */ h("div", { class: "t" }, esc(props.title)), props.subtitle ? /* @__PURE__ */ h("div", { class: "s" }, esc(props.subtitle)) : null), props.right ? /* @__PURE__ */ h("span", { class: "bar-right" }, props.right) : /* @__PURE__ */ h("span", { class: "back-spacer" })), /* @__PURE__ */ h("main", { class: "content" }, props.children), props.noTabs ? null : /* @__PURE__ */ h(TabBarView, null));
}
function Section(props) {
  return /* @__PURE__ */ h("section", { class: "sec" }, props.title ? /* @__PURE__ */ h("h2", { class: "sec-title" }, esc(props.title)) : null, /* @__PURE__ */ h("div", { class: "group" }, props.children), props.hint ? /* @__PURE__ */ h("p", { class: "hint" }, esc(props.hint)) : null);
}
function Item(props) {
  const cls = ["item", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : "", props.onLongPress ? "long" : ""].join(" ");
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.remove()}";
  return /* @__PURE__ */ h("div", { class: cls, onTap: props.onTap, onLongPress: props.onLongPress }, props.rank ? /* @__PURE__ */ h("span", { class: "rank" + (props.rank <= 3 ? " top" : "") + (props.rank >= 1e3 ? " d4" : props.rank >= 100 ? " d3" : "") }, props.rank) : null, props.thumb ? props.thumb.pending && !props.thumb.src ? /* @__PURE__ */ h("span", { class: "thumb none" }) : /* @__PURE__ */ h(GenPoster, { cls: "thumb", title: props.title }, props.thumb.src ? /* @__PURE__ */ h("img", { src: props.thumb.src, "data-url": props.thumb.url && props.thumb.url !== props.thumb.src ? props.thumb.url : void 0, alt: "", loading: "lazy", onerror: fallback }) : null) : null, props.icon ? /* @__PURE__ */ h("span", { class: "ico" }, props.icon) : null, /* @__PURE__ */ h("div", { class: "body" }, /* @__PURE__ */ h("div", { class: "title" }, esc(props.title)), props.subtitle ? props.subtitle.includes("\n") ? props.subtitle.split("\n").map((l, i) => /* @__PURE__ */ h("div", { class: "sub one" + (i ? " dim" : "") }, esc(l))) : /* @__PURE__ */ h("div", { class: "sub" }, esc(props.subtitle)) : null), props.badge ? /* @__PURE__ */ h("span", { class: "badge" }, esc(props.badge)) : null, props.right ? /* @__PURE__ */ h("span", { class: "right" }, esc(props.right)) : null, props.onTap && props.chevron !== false ? /* @__PURE__ */ h("span", { class: "chev" }, "›") : null);
}
function Chips(props) {
  return /* @__PURE__ */ h("div", { class: props.tabs ? "chips tabs" : "chips" }, props.children);
}
function Chip(props) {
  return /* @__PURE__ */ h("button", { class: ["chip", props.muted ? "muted" : "", props.warn ? "warn" : ""].join(" "), onTap: props.onTap }, /* @__PURE__ */ h("span", { class: "l" }, esc(props.label)), props.sub ? /* @__PURE__ */ h("span", { class: "s" }, esc(props.sub)) : null);
}
function Button(props) {
  return /* @__PURE__ */ h("button", { class: "btn " + (props.kind || "primary"), onTap: props.onTap, "data-enter": props.enter ? "" : void 0 }, esc(props.label));
}
function Badges(props) {
  if (!props.items.length) return "";
  return /* @__PURE__ */ h("div", { class: "ratings" }, props.items.map((b) => /* @__PURE__ */ h("button", { class: "rate " + b.tier, onTap: b.tier === "none" ? void 0 : b.onTap, "aria-label": b.kind === "imdb" ? "IMDb" : b.kind === "tomato" ? "番茄指數" : "爆米花指數" }, b.kind === "imdb" ? /* @__PURE__ */ h("span", { class: "imdb" }, "IMDb") : /* @__PURE__ */ h("span", { class: "emo" }, b.kind === "tomato" ? b.tier === "bad" ? "🤢" : "🍅" : b.tier === "bad" ? "🫗" : "🍿"), /* @__PURE__ */ h("span", { class: "v" }, esc(b.value)), b.note ? /* @__PURE__ */ h("span", { class: "n" }, esc(b.note)) : null)));
}
function GenPoster(props) {
  const n = Array.from(props.title).length;
  return /* @__PURE__ */ h("span", { class: `${props.cls} gen g${posterTint(props.title)}` }, /* @__PURE__ */ h("i", { class: "clap" }), /* @__PURE__ */ h("span", { class: "gt" + (n > 16 ? " l" : n > 7 ? " m" : "") }, /* @__PURE__ */ h("span", null, esc(props.title))), /* @__PURE__ */ h("i", { class: "perf" }), props.children);
}
function Hero(props) {
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.remove()}";
  return /* @__PURE__ */ h("div", { class: "hero" }, props.posterPending && !props.poster ? /* @__PURE__ */ h("div", { class: "poster none pending" }) : /* @__PURE__ */ h(GenPoster, { cls: "poster", title: props.title || "" }, props.poster ? /* @__PURE__ */ h("img", { src: props.poster, "data-url": props.posterUrl && props.posterUrl !== props.poster ? props.posterUrl : void 0, alt: "", onerror: fallback }) : null), /* @__PURE__ */ h("div", { class: "hero-info" }, props.lines.filter(Boolean).map((l) => /* @__PURE__ */ h("div", { class: "hero-line" }, esc(l))), props.badges ? /* @__PURE__ */ h(Badges, { items: props.badges }) : null, props.onTrailer ? /* @__PURE__ */ h("button", { class: "trailer", onTap: props.onTrailer }, "▶︎ ", esc(props.trailerLabel || "觀看預告")) : null));
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
.bar-right{min-width:64px;text-align:right;font-size:13px;color:var(--fg2);white-space:nowrap}
.content{flex:1;padding:8px 16px calc(env(safe-area-inset-bottom) + 32px)}
.page.with-tabs .content{padding-bottom:calc(env(safe-area-inset-bottom) + 104px)}
.tabbar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 12px);z-index:10;width:min(92vw,420px);
 display:flex;align-items:center;padding:5px;border-radius:999px;
 background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(28px) saturate(190%);backdrop-filter:blur(28px) saturate(190%);
 border:1px solid rgba(255,255,255,.55);box-shadow:0 10px 36px rgba(0,0,0,.16),0 1px 2px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.7)}
@media(prefers-color-scheme:dark){.tabbar{background:rgba(40,40,44,.55);border-color:rgba(255,255,255,.1);box-shadow:0 10px 36px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 4px 6px;border-radius:999px;color:var(--fg2);font-size:10.5px;font-weight:600;line-height:1;transition:background .2s,color .2s}
.tab svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.tab.on{color:var(--accent);background:rgba(10,132,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
@media(prefers-color-scheme:dark){.tab.on{background:rgba(10,132,255,.22)}}
.tab:active{opacity:.6}
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
.item .badge{flex:none;font-size:12px;padding:2px 8px;border-radius:999px;background:var(--chip);color:var(--chip-fg)}
.item .chev{color:var(--fg2);opacity:.55;font-size:22px;line-height:1;flex:none}
.item.muted .title,.item.muted .sub{color:var(--fg2)}
.item.accent .title{color:var(--accent)}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px}
.chip{display:flex;flex-direction:column;align-items:center;min-width:84px;padding:8px 12px;border-radius:12px;background:var(--chip);color:var(--chip-fg)}
.chip:active{opacity:.6}
.chip .l{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.chip .s{font-size:11px;color:var(--fg2);margin-top:2px}
.chip.muted{opacity:.45}
.chip.warn{outline:1.5px solid var(--orange)}
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
.note.version{padding:6px 0;-webkit-user-select:none;user-select:none}
.note.version:active{opacity:.5}
.note.warn{color:var(--orange)}
.note.error{color:var(--red)}
.field{display:block;width:100%;padding:12px 14px;border:0;border-radius:12px;background:var(--card);color:var(--fg);font-size:17px;margin-top:8px;outline:none}
.field:focus{box-shadow:0 0 0 2px var(--accent)}
.hero{display:flex;gap:14px;align-items:flex-end;margin:12px 4px 4px}
.hero .poster{width:112px;aspect-ratio:2/3;object-fit:cover;border-radius:12px;background:var(--chip);box-shadow:0 4px 14px rgba(0,0,0,.25);flex:none}
.hero .poster.none{box-shadow:none}
.hero .poster.pending{opacity:.5}
.hero-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hero-line{font-size:14px;color:var(--fg2)}
.ratings{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;overflow:visible}
.rate{display:flex;align-items:center;gap:3px;padding:3px 5px;border-radius:7px;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;line-height:1.2}
.rate.good{background:rgba(48,209,88,.18);color:#1f9d45}
.rate.mid{background:rgba(255,159,10,.2);color:#c77700}
.rate.bad{background:rgba(255,69,58,.18);color:#d63a31}
.rate.none{background:var(--chip);color:var(--fg2);opacity:.8}
.rate.none .emo{filter:grayscale(1);opacity:.7}
.rate.none .imdb{opacity:.55}
@media(prefers-color-scheme:dark){.rate.good{color:#30d158}.rate.mid{color:#ffb340}.rate.bad{color:#ff6961}}
.rate .imdb{background:#f5c518;color:#000;font-size:9px;font-weight:800;padding:1px 3px;border-radius:3px;letter-spacing:-.2px}
.rate .emo{font-size:12px}
.rate .n{font-size:10px;font-weight:600;opacity:.85}
.rate:active{opacity:.6}
.trailer{margin-top:8px;align-self:flex-start;padding:7px 13px;border-radius:999px;background:#ff0033;color:#fff;font-size:14px;font-weight:600;white-space:nowrap}
.trailer:active{opacity:.7}
.cm{padding:14px 16px}
.cm-top{display:flex;align-items:center;gap:12px}
.cm-avg{font-size:40px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;min-width:58px;text-align:center}
.cm-meta{display:flex;flex-direction:column;gap:4px;min-width:0}
.cm-stars{position:relative;display:inline-block;font-size:17px;letter-spacing:1px;line-height:1}
.cm-stars .bg{color:var(--line)}
@media(prefers-color-scheme:dark){.cm-stars .bg{color:#3a3a3c}}
.cm-stars .fg{position:absolute;left:0;top:0;overflow:hidden;white-space:nowrap;color:#ff9f0a}
.cm-n{font-size:13px;color:var(--fg2)}
.cm-dist{flex:1;display:flex;flex-direction:column;gap:2px;min-width:70px;max-width:130px;margin-left:auto}
.cm-row{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--fg2);line-height:1}
.cm-row span{width:7px;text-align:right;flex:none}
.cm-row i{display:block;height:4px;border-radius:2px;background:var(--fg2);opacity:.55;min-width:2px}
.cm-mine{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--line);font-size:15px}
.cm-pick{display:flex;gap:2px}
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
  document.querySelectorAll('input[name],select[name]').forEach(function(i){vals[i.name]=i.value;});
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
  document.querySelectorAll('input[name],select[name]').forEach(function(i){vals[i.name]=i.value;});
  if(window.__pending){var f=window.__pending;window.__pending=null;f(JSON.stringify({id:id,vals:vals,y:window.scrollY}));}
});
// 捲到指定位置：畫完馬上捲一次，下一個畫面更新時再確認一次（手勢剛結束、或瀏覽器自己想還原位置時，第一次可能被蓋掉）
function scrollKeep(to){window.scrollTo(0,to);if(to>0){var again=function(){if(Math.abs(window.scrollY-to)>2)window.scrollTo(0,to);};
  (window.requestAnimationFrame||setTimeout)(again);setTimeout(again,120);}}
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(_){} // 位置由我們自己還原，瀏覽器不要插手
window.__render=function(html,to){var y=window.scrollY;document.getElementById('root').innerHTML=html;scrollKeep(to<0?y:to);var f=document.querySelector('input[autofocus]');if(f)setTimeout(function(){f.focus()},50);syncHist();};
// 從螢幕左緣往右滑：回上一頁（等於點左上角的「返回」）。內容會跟著手指稍微移動，放開時滑得夠遠才算
var sw=null;
function swReset(now){sw=null;var c=document.querySelector('.content');if(c){c.style.transition=now?'none':'transform .15s';c.style.transform='';}}
document.addEventListener('touchstart',function(e){var t=e.touches[0];
  sw=(e.touches.length===1&&t.clientX<32&&document.querySelector('.back'))?{x:t.clientX,y:t.clientY,t:Date.now()}:null;},{passive:true});
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
document.addEventListener('keydown',function(e){if(e.key==='Enter'){var b=document.querySelector('[data-enter]');if(b)b.click();}});
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
    this.TABS = [
      { id: "home", label: "首頁", icon: "house" },
      { id: "movies", label: "電影", icon: "film" },
      { id: "cinemas", label: "影城", icon: "building" },
      { id: "settings", label: "設定", icon: "gear" }
    ];
    // ── 事件迴圈 ──
    // 背景查 GitHub 上的最新版本（首頁顯示是否為最新版）
    this.latest = this.checkVersion();
    this.latestAt = Date.now();
    // ── 搜尋 ──
    this.query = "";
    this.tmdbStatus = "";
    /** 讀好後要在原位補畫的資料（海報、評分、預告），每一項各自觸發一次補畫 */
    this.late = [];
    /** 正在補畫：只用已經讀好的資料，不再等 */
    this.rerendering = false;
    // ── 依電影找 ──
    this.movieQuery = "";
    /** 電影分頁上方的切換：上映中／票房排行 */
    this.movieMode = "now";
    // ── 影展 ──
    this.festId = "";
    // 看哪一個影展（同時有兩個以上時可以切換）
    this.festDate = "";
    // 看哪一天（空 = 今天或影展第一天）
    this.festQuery = "";
    // 影展裡搜尋片名（搜這一年的所有影展）
    this.festYear = 0;
    this.boxSort = "week";
    // 票房排行的排法：本週／累計／年度
    this.boxYears = [];
    // 年度排行選了哪幾年（空 = 最新的一年）
    this.boxWeek = "";
    // 週票房看哪一週（空 = 最新）
    this.boxLimit = 100;
    // 年度排行目前顯示幾列
    this.boxPageKey = "";
    // 日期、縣市、特殊廳都可以複選（點一下選、再點一下取消）；換一部片時日期重來
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
  }
  go(view, loading = "讀取中…") {
    this.loadingText = loading;
    this.stack.push(view);
  }
  switchTab(id) {
    this.tab = id;
    const root = {
      home: [() => this.homeView(), "讀取中…"],
      movies: [() => this.movieListView(), "讀取電影清單…"],
      cinemas: [() => this.citiesView(), "讀取中…"],
      settings: [() => this.settingsView(), "讀取中…"]
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
    if (true) return checkLatest("2026.11.22-2235");
    return (async () => {
      try {
        const r = await globalThis.fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
        const latest = String((await r.json()).version || "");
        if (!latest) return null;
        const num = (v) => Number(v.replace(/\D/g, "")) || 0;
        return { latest, isLatest: num("2026.11.22-2235") >= num(latest) };
      } catch (_) {
        return null;
      }
    })();
  }
  async run() {
    this.settings = await loadSettings();
    setTabBar(() => ({ active: this.tab, items: this.TABS, onTap: (id) => this.switchTab(id) }));
    setBackGuard(() => this.stack.length > 1);
    this.go(() => this.homeView(), "讀取影城清單…");
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
      if (!quick) await this.ui.render(/* @__PURE__ */ h(Page, { title: "電影行程" }, /* @__PURE__ */ h(Loading, { text: this.loadingText })));
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
  // ── 首頁 ──
  async homeView() {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    this.calendarName = (await currentCalendar(this.settings)).title;
    const favs = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean);
    return /* @__PURE__ */ h(Page, { title: "🎬 電影行程", subtitle: `${this.cinemas.length} 間影城｜選影城 → 日期 → 電影 → 場次` }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🕘", title: "現在有什麼可以看", subtitle: "依時段找常去、附近或各縣市的場次", onTap: () => this.go(() => this.nowView()) }), /* @__PURE__ */ h(Item, { icon: "🎞️", title: "依電影找場次", subtitle: "先選電影，再看哪些影城有放映", onTap: () => this.go(() => this.movieListView(), "讀取電影清單…") }), /* @__PURE__ */ h(Item, { icon: "🧭", title: "附近的影城", subtitle: "依目前位置排序", onTap: () => this.go(() => this.nearbyView(), "取得目前位置…") }), /* @__PURE__ */ h(Item, { icon: "🎦", title: "依縣市找影院", subtitle: `全台 ${this.cinemas.length} 間，也可以搜尋影城`, onTap: () => this.go(() => this.citiesView()) })), favs.length ? /* @__PURE__ */ h(Section, { title: "常去影城", hint: "影城搜尋在「影城」分頁，行事曆與提醒在「設定」分頁。" }, favs.map((c) => /* @__PURE__ */ h(Item, { icon: "★", title: c.name, subtitle: `${c.city} ${c.district}`, onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`) }))) : null, this.installEntry(), await this.versionNote());
  }
  // ── 設定 ──
  async settingsView() {
    this.calendarName = (await currentCalendar(this.settings)).title;
    return /* @__PURE__ */ h(Page, { title: "設定" }, /* @__PURE__ */ h(Section, { title: "加入行事曆時", hint: `廣告預告：${ADS_NOTE}` }, /* @__PURE__ */ h(Item, { icon: "📅", title: "寫入的行事曆", subtitle: this.calendarName, onTap: () => this.go(() => this.calendarView()) }), /* @__PURE__ */ h(Item, { icon: "📺", title: "廣告預告", subtitle: `預計散場時間會加上 ${this.settings.ads} 分鐘`, right: "點一下切換", chevron: false, onTap: () => this.cycleAds() }), /* @__PURE__ */ h(Item, { icon: "🗺", title: "導航地圖", subtitle: "點地址、分享、行程備註的導航連結", right: MAPS_LABEL[this.settings.maps || "apple"], chevron: false, onTap: () => {
      this.settings.maps = this.settings.maps === "google" ? "apple" : "google";
      saveSettings(this.settings);
    } }), /* @__PURE__ */ h(Item, { icon: "⏱", title: "補片長（TMDB）", subtitle: this.settings.tmdbToken ? "已設定：沒有片長的電影會自動補上" : "未設定", onTap: () => this.go(() => this.tmdbView()) })), /* @__PURE__ */ h(Section, { title: "關於", hint: "連鎖影城的場次來自場次通（twshowtimes.com），感謝場次通的整理；其他來自開眼電影網，以及誠品、光點、樂聲官網。實際場次以影城公告為準。" }, false ? /* @__PURE__ */ h(Item, { icon: "📲", title: "加到主畫面", subtitle: "像 App 一樣從主畫面開啟，看圖示教學", onTap: () => this.go(() => this.installView()) }) : null, /* @__PURE__ */ h(Item, { icon: "ℹ️", title: "關於與資料來源", accent: true, chevron: false, onTap: () => Safari.open(ABOUT_URL) }), /* @__PURE__ */ h(Item, { icon: "🔒", title: "隱私權政策", accent: true, chevron: false, onTap: () => Safari.open(PRIVACY_URL) }), /* @__PURE__ */ h(Item, { icon: "🙏", title: "前往場次通", subtitle: "比較各影城場次、看上映場數排行", accent: true, chevron: false, onTap: () => Safari.open("https://twshowtimes.com/") })), /* @__PURE__ */ h(
      "p",
      {
        class: "note version",
        onTap: async () => {
          Pasteboard.copy(`版本 ${"2026.11.22-2235"}`);
          await this.ui.toast("已複製版本號");
        }
      },
      `版本 ${"2026.11.22-2235"}`,
      "（點一下複製）"
    ), await this.versionNote());
  }
  // ── 依縣市找影院 ──
  citiesView() {
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    return /* @__PURE__ */ h(Page, { title: "依縣市找影院", subtitle: `全台 ${this.cinemas.length} 間`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🔍", title: "搜尋影城", subtitle: "影城、分店、行政區或縣市", onTap: () => this.go(() => this.searchView()) })), /* @__PURE__ */ h(Section, { title: "縣市", hint: "影城清單來自場次通與開眼電影網，會自動更新。" }, cities.map((city) => /* @__PURE__ */ h(Item, { title: city, badge: `${this.cinemas.filter((c) => c.city === city).length} 間`, onTap: () => this.go(() => this.cityView(city)) }))));
  }
  searchView() {
    const k = this.query.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : [];
    return /* @__PURE__ */ h(Page, { title: "搜尋影城", onBack: () => this.back() }, /* @__PURE__ */ h("input", { class: "field", name: "q", value: this.query, placeholder: "例如：松仁、西門、in89、台南", autofocus: true }), /* @__PURE__ */ h(Button, { label: "搜尋", enter: true, onTap: (v) => {
      this.query = v.q || "";
    } }), k ? /* @__PURE__ */ h(Section, { title: `結果 ${hits.length} 間` }, hits.length ? null : /* @__PURE__ */ h(Note, { text: "找不到相符的影城，換個關鍵字試試。" }), hits.map((c) => this.cinemaItem(c))) : null);
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
  async saveTmdb(raw) {
    const t = extractTmdbKey(raw);
    if (!t) {
      this.settings.tmdbToken = "";
      saveSettings(this.settings);
      this.tmdbStatus = "已清除，之後沒有片長的電影不會自動補。";
      return;
    }
    try {
      const r = await tmdbTest(t);
      this.settings.tmdbToken = t;
      saveSettings(this.settings);
      this.tmdbStatus = `✅ 設定完成（測試：${r}）`;
    } catch (e) {
      this.tmdbStatus = `❌ ${String(e?.message || e)}`;
    }
  }
  tmdbView() {
    const open = (url) => async () => {
      await Safari.openInApp(url, false);
    };
    return /* @__PURE__ */ h(Page, { title: "補片長（TMDB）", onBack: () => {
      this.tmdbStatus = "";
      this.back();
    } }, /* @__PURE__ */ h(Note, { text: "場次通的重映、修復版、演唱會有時沒有片長。設定 TMDB 金鑰後，會自動用片名查片長，也會顯示海報和預告片。免費，金鑰只存在你的手機。" }), /* @__PURE__ */ h(Section, { title: "① 註冊並登入 TMDB" }, /* @__PURE__ */ h(Item, { icon: "👤", title: "註冊 TMDB 帳號", subtitle: "填完後到信箱點驗證信", accent: true, chevron: false, onTap: open(TMDB_LINKS.signup) }), /* @__PURE__ */ h(Item, { icon: "🔑", title: "已經有帳號：登入", accent: true, chevron: false, onTap: open(TMDB_LINKS.login) })), /* @__PURE__ */ h(Section, { title: "② 申請 API" }, /* @__PURE__ */ h(Item, { icon: "📝", title: "開啟 API 申請頁", subtitle: "選 Developer → 同意條款 → 用途填 Personal use（個人使用）、網址可填 https://github.com", accent: true, chevron: false, onTap: open(TMDB_LINKS.request) }), /* @__PURE__ */ h(Item, { icon: "📋", title: "開啟 API 金鑰頁", subtitle: "複製「API Read Access Token」（eyJ 開頭）或「API Key」（32 碼）都可以", accent: true, chevron: false, onTap: open(TMDB_LINKS.api) })), /* @__PURE__ */ h(Section, { title: "③ 回到這裡貼上" }, /* @__PURE__ */ h(Item, { icon: "📥", title: "從剪貼簿貼上並測試", subtitle: "複製好金鑰後點這裡", accent: true, chevron: false, onTap: () => this.saveTmdb(Pasteboard.paste() || "") }), /* @__PURE__ */ h("input", { class: "field", name: "v", value: this.settings.tmdbToken || "", placeholder: "或手動貼上金鑰" })), this.tmdbStatus ? /* @__PURE__ */ h(Note, { kind: this.tmdbStatus.startsWith("❌") ? "error" : void 0, text: this.tmdbStatus }) : null, /* @__PURE__ */ h(Button, { kind: "primary", enter: true, label: "儲存並測試", onTap: (v) => this.saveTmdb(String(v.v || "")) }), this.settings.tmdbToken ? /* @__PURE__ */ h(Button, { kind: "danger", label: "清除金鑰", onTap: () => this.saveTmdb("") }) : null);
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
  }
  // ── 影城：選日期 ──
  async cinemaView(c) {
    const { dates, address, notice, site } = await datesOf(c);
    const fav = this.settings.favorites.indexOf(c.id) >= 0;
    return /* @__PURE__ */ h(Page, { title: c.name, subtitle: `${c.city} ${c.district}`, onBack: () => this.back() }, address ? /* @__PURE__ */ h(Section, null, this.addressItem(c.name, address)) : null, /* @__PURE__ */ h(Section, { title: "選擇日期" }, dates.length ? null : /* @__PURE__ */ h(Empty, { icon: "🗓", text: "目前沒有公布的場次" }), dates.map((d) => /* @__PURE__ */ h(Item, { title: dateLabel(d), onTap: () => this.go(() => this.moviesView(c, d), `讀取 ${dateLabel(d)} 的片單…`) }))), notice ? /* @__PURE__ */ h(Note, { kind: "warn", text: notice }) : null, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: fav ? "★" : "☆", title: fav ? "移出常去影城" : "加入常去影城", chevron: false, onTap: () => this.toggleFav(c) }), site ? /* @__PURE__ */ h(Item, { icon: "🏠", title: "影城官網（訂票）", subtitle: site.replace(/^https?:\/\//, "").replace(/\/.*$/, ""), chevron: false, accent: true, onTap: () => Safari.open(site) }) : null, site !== c.url ? /* @__PURE__ */ h(Item, { icon: "🌐", title: c.source === "at" ? "以瀏覽器開啟開眼時刻表" : "以瀏覽器開啟場次通時刻表", chevron: false, accent: true, onTap: () => Safari.open(c.url) }) : null));
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
  /** 觀眾評分卡片：平均、人數、分布，以及「你的評分」五顆星（點已選的那顆可以取消） */
  community(title, c) {
    const n = c ? c.n : 0;
    const avg = c && n ? c.avg : 0;
    const mine = c ? c.mine : 0;
    const status = c === void 0 ? "讀取中…" : c === false ? "觀眾評分暫時讀不到" : n ? `${n} 人評分` : "還沒有人評分，來當第一個";
    const max = c ? Math.max(1, ...c.dist) : 1;
    const vote = async (s) => {
      try {
        await communityVote(title, s === mine ? 0 : s);
        await this.ui.toast(s === mine ? "已取消你的評分" : `已送出 ${s} 星`);
      } catch (e) {
        await this.ui.toast(String(e?.message || e));
      }
    };
    return /* @__PURE__ */ h(Section, { title: "觀眾評分", hint: "匿名評分，一台手機一票，可以隨時更改；點已選的星星可以取消。兩個版本的評分會一起統計。" }, /* @__PURE__ */ h("div", { class: "cm" }, /* @__PURE__ */ h("div", { class: "cm-top" }, /* @__PURE__ */ h("div", { class: "cm-avg" }, n ? avg.toFixed(1) : "-"), /* @__PURE__ */ h("div", { class: "cm-meta" }, /* @__PURE__ */ h("span", { class: "cm-stars", "aria-label": n ? `平均 ${avg} 星` : "還沒有評分" }, /* @__PURE__ */ h("span", { class: "bg" }, "★★★★★"), /* @__PURE__ */ h("span", { class: "fg", style: `width:${avg / 5 * 100}%` }, "★★★★★")), /* @__PURE__ */ h("span", { class: "cm-n" }, esc(status))), c && n ? /* @__PURE__ */ h("div", { class: "cm-dist" }, [5, 4, 3, 2, 1].map((s) => /* @__PURE__ */ h("div", { class: "cm-row" }, /* @__PURE__ */ h("span", null, s), /* @__PURE__ */ h("i", { style: `width:${Math.round(c.dist[s - 1] / max * 100)}%` })))) : null), /* @__PURE__ */ h("div", { class: "cm-mine" }, /* @__PURE__ */ h("span", null, mine ? `你給 ${mine} 星` : "點星星評分"), /* @__PURE__ */ h("span", { class: "cm-pick" }, [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ h("button", { class: "cm-star" + (s <= mine ? " on" : ""), "aria-label": `${s} 星`, onTap: () => vote(s) }, "★", /* @__PURE__ */ h("span", { class: "sr" }, s)))))));
  }
  hero(e, title, lines) {
    const { x, r } = e;
    const posterUrl = x?.poster || e.p || "";
    const poster = posterSrc(posterUrl);
    if (poster && poster === posterUrl) cachePoster(posterUrl);
    const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`;
    const badges = [];
    if (r) {
      badges.push(r.imdb ? { kind: "imdb", value: r.imdb.score.toFixed(1), tier: ratingTier("imdb", r.imdb.score), onTap: () => Safari.open(r.imdb.url) } : { kind: "imdb", value: "-", tier: "none" });
      badges.push(r.tomato ? { kind: "tomato", value: `${r.tomato.score}%`, tier: ratingTier("pct", r.tomato.score), note: r.tomato.certified ? "✓" : void 0, onTap: () => Safari.open(r.tomato.url) } : { kind: "tomato", value: "-", tier: "none" });
      badges.push(r.popcorn ? { kind: "popcorn", value: `${r.popcorn.score}%`, tier: ratingTier("pct", r.popcorn.score), onTap: () => Safari.open(r.popcorn.url) } : { kind: "popcorn", value: "-", tier: "none" });
    }
    if (!r && e.loading) lines = [...lines, "評分讀取中…"];
    else if (!r) lines = [...lines, "評分讀不到"];
    if (r?.err && !(r.imdb || r.tomato || r.popcorn)) lines = [...lines, `評分讀不到：${r.err}`];
    if (x?.err) lines = [...lines, `預告：${x.err}`];
    return /* @__PURE__ */ h(
      Hero,
      {
        title,
        poster,
        posterUrl,
        posterPending: !poster && e.loading,
        lines,
        badges,
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
    })))));
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
      body = /* @__PURE__ */ h(Note, { text: "✅ 已經加到主畫面了。之後從主畫面的「電影行程」圖示開啟就可以。" });
    } else if (prompt) {
      body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Button, { label: "📲 安裝到主畫面", onTap: install }), /* @__PURE__ */ h(Note, { text: "按下後瀏覽器會跳出確認視窗，選「安裝」。裝好後會多一個「電影行程」圖示，開起來沒有網址列，像一般的 App。" }));
    } else if (ios && !iosOther) {
      body = /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Steps, { items: [
        { icon: "share", title: "點「分享」按鈕", text: "Safari 下方工具列上，方框加向上箭頭的圖示。找不到的話先點「⋯」，再點「分享」。" },
        { icon: "plus", title: "往下滑，點「加入主畫面」", text: "選單裡方框加一個加號的那一項。" },
        { icon: "check", title: "點右上角的「加入」", text: "名稱可以維持「電影行程」。" },
        { icon: "home", title: "從主畫面開啟", text: "主畫面會多一個「電影行程」圖示，開起來沒有網址列，像一般的 App。" }
      ] }), /* @__PURE__ */ h(Note, { text: "要用 Safari 才能加到主畫面。常去影城等設定存在瀏覽器裡：從主畫面開啟的版本是另一份，設定要重新設一次。" }));
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
        { icon: "plus", title: "在網址列右邊找「安裝」圖示", text: "Chrome、Edge 會在網址列右邊出現一個安裝圖示；沒有的話從瀏覽器選單裡找「安裝電影行程」。" },
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
      return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Note, { kind: "warn", text: `🆕 有新版 ${r.latest}（你現在開的是 ${"2026.11.22-2235"}）` }), /* @__PURE__ */ h(Button, { label: "重新整理以更新", kind: "secondary", onTap: () => {
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
  movieModeChips() {
    return /* @__PURE__ */ h(Chips, { tabs: true }, /* @__PURE__ */ h(Chip, { label: "上映中", muted: this.movieMode !== "now", onTap: () => {
      this.movieMode = "now";
    } }), /* @__PURE__ */ h(Chip, { label: "票房排行", muted: this.movieMode !== "box", onTap: () => {
      this.movieMode = "box";
    } }), /* @__PURE__ */ h(Chip, { label: "即將上映", muted: this.movieMode !== "soon", onTap: () => {
      this.movieMode = "soon";
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
      this.movieMode = "now";
      return this.movieListView();
    }
    const year = Number(list[0].end.slice(0, 4));
    const f = list.find((x) => x.id === this.festId) || list[0];
    const dates = festivalDates(f);
    const date = dates.indexOf(this.festDate) >= 0 ? this.festDate : festivalDefaultDate(f);
    const day = festivalDay(f, date);
    const hits = this.festQuery.trim() ? festivalSearch(list, this.festQuery) : null;
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: `${f.name}｜${festivalStatusLine(f)}`, onBack: () => this.back() }, this.movieModeChips(), /* @__PURE__ */ h("input", { class: "field", name: "q", value: this.festQuery, placeholder: `搜尋 ${year} 年影展的片名` }), /* @__PURE__ */ h(Button, { label: "搜尋", kind: "secondary", enter: true, onTap: (v) => {
      this.festQuery = v.q || "";
    } }), years.length > 1 ? /* @__PURE__ */ h(Section, { title: "年份" }, /* @__PURE__ */ h(Chips, null, years.map((y) => /* @__PURE__ */ h(Chip, { label: `${y}`, sub: y === Number(todayTPE().slice(0, 4)) ? "今年" : "", muted: y !== year, onTap: () => {
      this.festYear = y;
      this.festId = "";
      this.festDate = "";
    } })))) : null, festivalGroups(list).map((g) => /* @__PURE__ */ h(Section, { title: `${g.title}｜${g.items.length} 個影展` }, /* @__PURE__ */ h(Chips, null, g.items.map((x) => /* @__PURE__ */ h(Chip, { label: x.name, sub: festivalChipNote(x), muted: x.id !== f.id, onTap: () => {
      this.festId = x.id;
      this.festDate = "";
    } }))))), hits ? /* @__PURE__ */ h(Section, { title: `「${this.festQuery.trim()}」｜${hits.length} 部`, hint: "搜尋這一年所有影展的片名，不分日期。清空搜尋欄再按搜尋，就回到每天的片單。" }, hits.map(({ f: hf, film, sessions }) => /* @__PURE__ */ h(
      Item,
      {
        thumb: { src: film.poster || "" },
        title: film.title,
        subtitle: festivalSearchLines(hf, film, sessions).filter(Boolean).join("\n"),
        onTap: () => this.go(() => this.festivalFilmView(hf, film))
      }
    ))) : null, hits && !hits.length ? /* @__PURE__ */ h(Empty, { icon: "🎞", text: "這一年的影展裡找不到這個片名" }) : null, hits ? null : /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Section, { title: "日期" }, /* @__PURE__ */ h(Chips, null, dates.map((d) => /* @__PURE__ */ h(Chip, { label: dateLabel(d).replace(/（.）.*$/, ""), sub: d === todayTPE() ? "今天" : dateLabel(d).match(/（(.)）/)?.[1] || "", muted: d !== date, onTap: () => {
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
  festivalFilmView(f, film) {
    const sessions = festivalFilmSessions(f, film.id);
    const pick = (x) => {
      const cinema = festivalCinema(x, this.cinemas, f);
      const version = { label: festivalPlace(x), times: [x.time] };
      const movie = { title: film.title, runtime: film.mins, rating: film.rating, versions: [version] };
      this.runtime = film.mins;
      this.seat = x.room;
      this.go(() => this.confirmView({ cinema, address: cinema.address || "", booking: x.ticket || film.url, sourceUrl: film.url, date: x.date, movie, version, time: x.time }));
    };
    const end = (x) => film.mins ? fmt(new Date(tpeDate(x.date, x.time).getTime() + (film.mins + this.settings.ads) * 6e4)).slice(-5) : "";
    return /* @__PURE__ */ h(Page, { title: film.title, subtitle: f.name, onBack: () => this.back() }, /* @__PURE__ */ h(Hero, { title: film.title, poster: film.poster || void 0, lines: [[film.rating, film.mins ? `${film.mins} 分鐘` : ""].filter(Boolean).join("｜"), `${f.name}（${festivalStateLabel(f)}）`, "影展片名，院線上映時可能不同"], trailerLabel: festivalTrailer(film).label, onTrailer: () => Safari.open(festivalTrailer(film).url) }), /* @__PURE__ */ h(Section, { title: "場次", hint: festivalState(f) === "past" ? "這個影展已經結束，場次僅供回顧。" : "點一場加入行事曆。散場時間是依片長和你設定的廣告預告時間估的。" }, sessions.map((x) => /* @__PURE__ */ h(
      Item,
      {
        title: `${dateLabel(x.date).replace(/ .*$/, "")}　${x.time}`,
        subtitle: [festivalPlace(x), end(x) ? `預計 ${end(x)} 散場` : ""].filter(Boolean).join("\n"),
        onTap: () => pick(x)
      }
    ))), sessions.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "找不到這部片的場次" }), /* @__PURE__ */ h(Button, { label: "🌐 官網的影片介紹", kind: "secondary", onTap: () => Safari.open(film.url) }));
  }
  async boxOfficeView() {
    const [b, all] = await Promise.all([this.boxSort === "year" ? loadBoxOfficeFull() : this.boxSort === "week" && this.boxWeek ? loadBoxOfficeWeeks() : loadBoxOffice(), loadMovies().catch(() => [])]);
    const k = this.movieQuery.trim().toLowerCase();
    const sorts = boxSorts(b);
    const by = sorts.some((x) => x.id === this.boxSort) ? this.boxSort : "week";
    const yearOptions = boxYears(b);
    const years = boxYearsPicked(b, this.boxYears);
    const weekOptions = boxWeekOptions(b);
    const week = boxWeekPicked(b, this.boxWeek);
    const match = boxMatcher(all);
    const found = boxOfficeBy(b, by, years, week.id).map((x) => ({ x, m: match(x.name) })).filter(({ x, m }) => !k || `${x.name} ${m?.en || ""}`.toLowerCase().includes(k));
    const paged = by === "year";
    const pageKey = `${by}|${years.join(",")}|${week.id}|${k}`;
    if (this.boxPageKey !== pageKey) {
      this.boxPageKey = pageKey;
      this.boxLimit = BOX_PAGE;
    }
    const rows = paged ? found.slice(0, this.boxLimit) : found;
    const old = paged || by === "week" && week.past;
    const jobs = rows.map(({ x, m }) => (old && !m ? posterLight(x.name, x.release) : moviePoster(m ? m.title : x.name, m?.slug, m?.en)).catch(() => ""));
    const wait = this.rerendering ? 0 : paged ? 150 : 600;
    const posters = await Promise.all(jobs.map((p) => Promise.race([p, sleep(wait).then(() => void 0)])));
    const late = jobs.filter((_, i) => posters[i] === void 0);
    const batches = [];
    for (let i = 0; i < late.length; i += 8) batches.push(Promise.all(late.slice(i, i + 8)));
    if (batches.length) this.late = batches;
    if (!old) prefetchPosters(rows.map(({ x, m }) => ({ title: m ? m.title : x.name, slug: m?.slug, en: m?.en })), 300, 0, 0);
    const thumb = (u) => {
      if (u === void 0) return { src: "", pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      return { src, url: u };
    };
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: boxOfficeTitle(b, by, years, week.id), onBack: () => this.back() }, this.movieModeChips(), sorts.length > 1 ? /* @__PURE__ */ h(Chips, null, sorts.map((x) => /* @__PURE__ */ h(Chip, { label: x.label, sub: x.id === "year" ? "含已下檔" : "上映中", muted: by !== x.id, onTap: () => {
      this.boxSort = x.id;
    } }))) : null, by === "week" && weekOptions.length > 1 ? /* @__PURE__ */ h(Section, { title: "週次", hint: "可以回頭看過去幾週的排行。" }, /* @__PURE__ */ h(Chips, null, weekOptions.map((o) => /* @__PURE__ */ h(Chip, { label: o.label, sub: o.note, muted: week.id !== o.id, onTap: () => {
      this.boxWeek = o.note === "最新" ? "" : o.id;
    } })))) : null, by === "year" && yearOptions.length > 1 ? /* @__PURE__ */ h(Section, { title: "年份", hint: "可以複選，選了幾年就合在一起排。" }, /* @__PURE__ */ h(Chips, null, /* @__PURE__ */ h(Chip, { label: "全選", muted: years.length !== yearOptions.length, onTap: () => {
      this.boxYears = years.length === yearOptions.length ? [] : yearOptions.slice();
    } }), yearOptions.map((y) => /* @__PURE__ */ h(Chip, { label: y, muted: years.indexOf(y) < 0, onTap: () => {
      this.boxYears = years.indexOf(y) < 0 ? [...years, y] : years.length > 1 ? years.filter((z) => z !== y) : years;
    } })))) : null, /* @__PURE__ */ h("input", { class: "field", name: "q", value: this.movieQuery, placeholder: "搜尋片名" }), /* @__PURE__ */ h(Button, { label: "搜尋", kind: "secondary", enter: true, onTap: (v) => {
      this.movieQuery = v.q || "";
    } }), rows.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "排行上找不到相符的電影" }), /* @__PURE__ */ h(Section, { title: boxOfficeTitle(b, by, years, week.id), hint: boxOfficeFooter(b, by, years, week.id) }, rows.map(({ x, m }, i) => {
      const t = thumb(posters[i]);
      return /* @__PURE__ */ h(
        Item,
        {
          rank: x.rank,
          thumb: t,
          title: x.name,
          subtitle: boxOfficeLines(x, by, by === "week" && week.past).filter(Boolean).join("\n"),
          onTap: m ? () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) : () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`)
        }
      );
    })), paged && found.length > rows.length ? /* @__PURE__ */ h(Button, { label: `顯示更多（還有 ${found.length - rows.length} 部）`, kind: "secondary", onTap: () => {
      this.boxLimit += BOX_PAGE;
    } }) : null);
  }
  /** 票房排行上、場次通已經沒有場次的片：海報、評分、預告、觀眾評分與票房 */
  async boxMovieView(x) {
    const e = await this.extras(x.name);
    const date = x.release.replace(/-/g, "/");
    return /* @__PURE__ */ h(Page, { title: x.name, subtitle: `票房第 ${x.rank} 名`, onBack: () => this.back() }, this.hero(e, x.name, [x.country, `${date} 上映`]), /* @__PURE__ */ h(Section, { title: "票房", hint: "資料來源：國家電影及視聽文化中心「全國電影票房統計」。" }, x.week !== null && !x.since ? /* @__PURE__ */ h(Item, { title: "本週票房", right: money(x.week) }) : null, /* @__PURE__ */ h(Item, { title: "累計票房", right: money(x.total) }), x.theaters ? /* @__PURE__ */ h(Item, { title: "上映戲院", right: `${x.theaters} 間` }) : null, /* @__PURE__ */ h(Item, { title: "上映日期", right: date })), /* @__PURE__ */ h(Note, { text: "場次通目前沒有這部片的場次，可能已經下檔，或只在少數戲院放映。" }));
  }
  async movieListView() {
    if (this.movieMode === "fest") return this.festivalListView();
    if (this.movieMode === "box") return this.boxOfficeView();
    const all = await loadMovies();
    const k = this.movieQuery.trim().toLowerCase();
    const soonMode = this.movieMode === "soon";
    const list = all.filter((m) => !!m.comingSoon === soonMode && (!k || `${m.title} ${m.en}`.toLowerCase().includes(k)));
    prefetchPosters(list);
    const jobs = list.map((m) => moviePoster(m.title, m.slug, m.en).catch(() => ""));
    const got = await Promise.all(jobs.map((p) => Promise.race([p, sleep(this.rerendering ? 0 : 600).then(() => void 0)])));
    const pending = jobs.filter((_, i) => got[i] === void 0);
    const late = [];
    for (let i = 0; i < pending.length; i += 8) late.push(Promise.all(pending.slice(i, i + 8)));
    if (late.length) this.late = late;
    const thumbOf = /* @__PURE__ */ new Map();
    list.forEach((m, i) => {
      const u = got[i];
      if (u === void 0) return void thumbOf.set(m, { src: "", pending: true });
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      thumbOf.set(m, { src, url: u });
    });
    const item = (m) => /* @__PURE__ */ h(
      Item,
      {
        thumb: thumbOf.get(m),
        title: m.title,
        subtitle: movieLines(m).filter(Boolean).join("\n"),
        onTap: () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)
      }
    );
    const now = list.filter((m) => !m.comingSoon);
    const soon = list.filter((m) => m.comingSoon);
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: `${all.length} 部電影`, onBack: () => this.back() }, this.movieModeChips(), /* @__PURE__ */ h("input", { class: "field", name: "q", value: this.movieQuery, placeholder: "搜尋片名" }), /* @__PURE__ */ h(Button, { label: "搜尋", kind: "secondary", enter: true, onTap: (v) => {
      this.movieQuery = v.q || "";
    } }), now.length ? /* @__PURE__ */ h(Section, { title: `上映中（${now.length}）`, hint: "依今天放映的影城數排序；今天沒有場次、過幾天才有的排在最後。資料來自場次通。" }, now.map(item)) : null, soon.length ? /* @__PURE__ */ h(Section, { title: `即將上映（${soon.length}）`, hint: "還沒上映、但已經可以查到場次的片，依上映日期排序。" }, soon.map(item)) : null, list.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "找不到相符的電影" }));
  }
  // 只看常去影城
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
    return /* @__PURE__ */ h(Page, { title: m.title, subtitle: [m.rating || d.rating, runtime ? `${runtime} 分鐘` : "", `${d.cinemas.length} 間影城`].filter(Boolean).join("｜"), onBack: () => this.back() }, this.hero(x, m.title, [m.en, [m.rating || d.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"), releaseLabel(d.release || m.release || releaseOf(m.title)), `${d.cinemas.length} 間影城有放映`]), /* @__PURE__ */ h(Section, { title: "日期", hint: "日期、縣市、特殊廳都可以複選。" }, /* @__PURE__ */ h(Chips, null, allDates.map((dt) => /* @__PURE__ */ h(Chip, { label: dateLabel(dt).replace(/（.）.*$/, ""), sub: dt === todayTPE() ? "今天" : dateLabel(dt).match(/（(.)）/)?.[1] || "", muted: selDates.indexOf(dt) < 0, onTap: () => {
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
    } }), /* @__PURE__ */ h(Chip, { label: `只看常去影城（${this.settings.favorites.length}）`, muted: !this.movieFavOnly, onTap: () => {
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
    }), rows.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: this.movieFavOnly && !this.settings.favorites.length ? "還沒有常去影城，先到影城頁加入。" : "沒有符合條件的影城，換個日期或條件試試。" }));
  }
  // ── 分享 ──
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
    const scopes = [{ id: "all", label: `不限（全台 ${this.cinemas.length} 間）` }, { id: "fav", label: `常去影城（${this.settings.favorites.length}）` }, { id: "near", label: "附近 10 間" }, ...cities.map((c) => ({ id: c, label: c }))];
    const toggle = (list, id, min1 = false) => {
      const i = list.indexOf(id);
      if (i < 0) return [...list, id];
      return min1 && list.length === 1 ? list : list.filter((x) => x !== id);
    };
    return /* @__PURE__ */ h(Page, { title: "現在有什麼可以看", subtitle: "每一項都可以複選", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: "日期" }, /* @__PURE__ */ h(Chips, null, dates.map((d) => /* @__PURE__ */ h(Chip, { label: dateLabel(d).replace(/（.）.*$/, ""), sub: d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).match(/（(.)）/)?.[1] || "", muted: selDates.indexOf(d) < 0, onTap: () => {
      this.nowDates = toggle(selDates, d, true);
    } })))), /* @__PURE__ */ h(Section, { title: "開演時段", hint: "都不選就是整天。「接下來 3 小時」只找今天。" }, /* @__PURE__ */ h(Chips, null, wins.map((w) => /* @__PURE__ */ h(Chip, { label: w.label, muted: selWins.indexOf(w.id) < 0, onTap: () => {
      this.nowWins = w.id === "all" ? ["all"] : toggle(selWins.filter((x) => x !== "all"), w.id);
    } })))), /* @__PURE__ */ h(Section, { title: "找哪些影城", hint: "縣市的影城較多、選的天數越多，會花比較久時間；「不限」要讀全台每一間，最久。開眼來源的戲院通常只有今天的場次。" }, /* @__PURE__ */ h(Chips, null, scopes.map((sc) => /* @__PURE__ */ h(Chip, { label: sc.label, muted: this.nowScopes.indexOf(sc.id) < 0, onTap: () => {
      this.nowScopes = sc.id === "all" ? ["all"] : toggle(this.nowScopes.filter((x) => x !== "all"), sc.id, true);
    } })))), /* @__PURE__ */ h(Section, { title: "特殊廳", hint: "都不選就是不限；選了幾種，就找其中任一種。" }, /* @__PURE__ */ h(Chips, null, /* @__PURE__ */ h(Chip, { label: "不限", muted: this.nowFormats.length > 0, onTap: () => {
      this.nowFormats = [];
    } }), FORMATS.map((f) => /* @__PURE__ */ h(Chip, { label: f, muted: this.nowFormats.indexOf(f) < 0, onTap: () => {
      this.nowFormats = toggle(this.nowFormats, f);
    } })))), /* @__PURE__ */ h(Button, { label: "🔍 找場次", onTap: () => this.go(() => this.nowResultsView(selDates, selWins), "正在查詢各影城的場次…") }));
  }
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
    if (!scope.length) throw new Error("沒有可以查的影城。先在影城頁加入常去影城，或改選附近／縣市。");
    const { hits, failed, noData } = await findShowtimesMulti(scope, dates, winIds, this.nowFormats);
    const groups = groupByMovie(hits);
    prefetchPosters(groups);
    const scopeLabel = this.nowScopes.map((sc) => sc === "all" ? "全台影城" : sc === "fav" ? "常去影城" : sc === "near" ? "附近 10 間" : sc).join("、");
    const many = dates.length > 1;
    const open = (hit) => {
      this.runtime = hit.movie.runtime;
      this.seat = hallOf(hit.version.label);
      this.go(() => this.confirmView({ cinema: hit.cinema, address: hit.ctx.address || hit.cinema.address || "", booking: hit.ctx.booking, sourceUrl: hit.ctx.sourceUrl, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time }));
    };
    return /* @__PURE__ */ h(Page, { title: multiLabel(dates, winIds), subtitle: `${hits.length} 場｜${groups.length} 部電影`, onBack: () => this.back() }, /* @__PURE__ */ h(Note, { text: `${multiDetail(dates, winIds)}
影城：${scopeLabel}${this.nowFormats.length ? `
特殊廳：${this.nowFormats.join("、")}` : ""}` }), groups.length ? null : /* @__PURE__ */ h(Empty, { icon: "🍿", text: "沒有符合的場次，換個時段或範圍試試。" }), groups.map((g) => /* @__PURE__ */ h(Section, { title: `${g.title}（${g.hits.length} 場）`, hint: [g.runtime ? `${g.runtime} 分鐘` : "", g.rating].filter(Boolean).join("｜") || void 0 }, g.hits.map((hit) => /* @__PURE__ */ h(
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
