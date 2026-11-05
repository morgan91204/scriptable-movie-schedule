// 網頁解析器。每個函式都必須「自給自足」（不引用外部變數），
// 因為在 Scriptable 會用 fn.toString() 丟進 WebView 裡，用瀏覽器的 DOMParser 執行。

export interface Version {
  label: string;
  times: string[];
}
export interface Movie {
  title: string;
  runtime: number; // 0 = 來源沒提供
  rating?: string;
  versions: Version[];
  runtimeFrom?: string; // 片長不是場次來源給的時，註明從哪裡補來
}
export interface TwCinema {
  id: string;
  name: string;
  district: string;
  city: string;
}
export interface TwDay {
  cinema: string;
  address: string;
  date: string; // 頁面標題上的片單日期
  dates: string[]; // 頁面上可切換的日期
  booking: string;
  movies: Movie[];
}
export interface MultiDay {
  schedules: Record<string, Movie[]>;
  notice: string;
}
export interface SpotMovie {
  title: string;
  runtime: number;
  entries: { month: number; day: number; times: string[] }[];
}

/** 場次通「全台影城」列表：依縣市分組 */
export function parseTwIndex(doc: Document): TwCinema[] {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const out: TwCinema[] = [];
  const seen: Record<string, boolean> = {};
  let city = "";
  for (const el of Array.from(doc.querySelectorAll('h2, a[href^="/cinemas/"]'))) {
    if (el.tagName === "H2") {
      city = clean(el.querySelector("a")?.textContent || el.textContent).replace(/\(.*$/, "").trim();
      continue;
    }
    const m = (el.getAttribute("href") || "").match(/^\/cinemas\/([^/]+)\/$/);
    if (!m || seen[m[1]]) continue;
    const name = clean(el.querySelector("h3")?.textContent);
    if (!name) continue;
    seen[m[1]] = true;
    out.push({ id: m[1], name, district: clean(el.querySelector("p")?.textContent), city });
  }
  return out;
}

/** 場次通單一影城某天的片單 */
export function parseTwDay(doc: Document): TwDay {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const timeRe = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const heading = Array.from(doc.querySelectorAll("h2"))
    .map((e) => clean(e.textContent))
    .find((s) => /\d{4}-\d{2}-\d{2}\s*片單/.test(s));
  const date = heading ? (heading.match(/\d{4}-\d{2}-\d{2}/) as RegExpMatchArray)[0] : "";
  const dates: string[] = [];
  for (const a of Array.from(doc.querySelectorAll('a[href^="/cinemas/"]'))) {
    const m = (a.getAttribute("href") || "").match(/^\/cinemas\/[^/]+\/(\d{4}-\d{2}-\d{2})\/$/);
    if (m && dates.indexOf(m[1]) < 0) dates.push(m[1]);
  }
  if (date && dates.indexOf(date) < 0) dates.unshift(date);
  dates.sort();
  let address = "";
  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const obj = JSON.parse(el.textContent || "");
      if (obj["@type"] === "MovieTheater") address = clean(obj.address && obj.address.streetAddress);
    } catch (_) {}
  }
  const bookingEl = Array.from(doc.querySelectorAll("a[href]")).find(
    (a) => /前往訂票/.test(a.textContent || "") && /^https:\/\//.test(a.getAttribute("href") || "")
  );
  const movies: Movie[] = [];
  for (const card of Array.from(doc.querySelectorAll(".card"))) {
    const titleEl = card.querySelector(".card-title");
    if (!titleEl) continue;
    const title = clean(titleEl.textContent);
    const badges = Array.from(card.querySelectorAll(".badge-sm")).map((e) => clean(e.textContent));
    const rt = badges.find((s) => /^\d+\s*分$/.test(s));
    const rating = badges.find((s) => /級$/.test(s)) || "";
    const versions: Version[] = [];
    for (const row of Array.from(card.querySelectorAll(".flex.flex-wrap.items-center.gap-2"))) {
      const times = Array.from(row.querySelectorAll(".font-mono"))
        .map((e) => clean(e.textContent))
        .filter((s) => timeRe.test(s));
      if (!times.length) continue;
      const labelEl = Array.from(row.children).find((e) => !e.classList.contains("font-mono"));
      const label = clean(labelEl && labelEl.textContent) || "一般場";
      const uniq = times.filter((t, i) => times.indexOf(t) === i).sort();
      const old = versions.find((v) => v.label === label);
      if (old) old.times = old.times.concat(uniq.filter((t) => old.times.indexOf(t) < 0)).sort();
      else versions.push({ label, times: uniq });
    }
    if (title && versions.length)
      movies.push({ title, runtime: rt ? Number((rt.match(/\d+/) as RegExpMatchArray)[0]) : 0, rating, versions });
  }
  return {
    cinema: clean(doc.querySelector("h1")?.textContent),
    address,
    date,
    dates,
    booking: bookingEl ? bookingEl.getAttribute("href") || "" : "",
    movies,
  };
}

/** 誠品電影院「電影時刻表」頁（多天） */
export function parseEslite(doc: Document): MultiDay {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const schedules: Record<string, Movie[]> = {};
  const add = (day: string, title: string, runtime: number, label: string, time: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !title || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title && x.runtime === runtime);
    if (!m) list.push((m = { title, runtime, versions: [] }));
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push((v = { label, times: [] }));
    if (v.times.indexOf(time) < 0) v.times.push(time);
  };
  const updated = (doc.body.textContent || "").match(/最後更新時間[：:]\s*(\d{4})-(\d{2})-(\d{2})/);
  if (!updated) throw new Error("讀不到誠品官網的更新日期，無法判斷場次年份");
  const anchor = Date.parse(`${updated[1]}-${updated[2]}-${updated[3]}T12:00:00+08:00`);
  for (const box of Array.from(doc.querySelectorAll(".box"))) {
    const title = clean(box.querySelector(".intro .left p")?.textContent);
    if (!title) continue;
    const info = clean(box.querySelector(".intro .right")?.textContent);
    const runtime = Number((info.match(/片長[：:]\s*(\d+)\s*分鐘/) || [])[1] || 0);
    const subtitle = (info.match(/字幕[：:]\s*([^\s]+)/) || [])[1] || "";
    for (const slide of Array.from(box.querySelectorAll(".time-swiper .swiper-slide"))) {
      const md = clean(slide.querySelector("p")?.textContent).match(/^(\d{1,2})\/(\d{1,2})/);
      if (!md) continue;
      const mm = md[1].padStart(2, "0"),
        dd = md[2].padStart(2, "0");
      // 官網只寫月/日：取最接近官方更新日期的年份（處理跨年）
      const y = Number(updated[1]);
      const cands = [y - 1, y, y + 1].map((yy) => `${yy}-${mm}-${dd}`);
      cands.sort(
        (a, b) =>
          Math.abs(Date.parse(a + "T12:00:00+08:00") - anchor) - Math.abs(Date.parse(b + "T12:00:00+08:00") - anchor)
      );
      for (const li of Array.from(slide.querySelectorAll("li")))
        add(cands[0], title, runtime, subtitle ? `字幕 ${subtitle}` : "一般場", clean(li.textContent));
    }
  }
  return { schedules, notice: "" };
}

/** 光點華山「放映場次」頁（多天、多廳） */
export function parseSpotHs(doc: Document): MultiDay {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const schedules: Record<string, Movie[]> = {};
  let notice = "";
  const add = (day: string, title: string, runtime: number, label: string, time: string) => {
    if (!title || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title && x.runtime === runtime);
    if (!m) list.push((m = { title, runtime, versions: [] }));
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push((v = { label, times: [] }));
    if (v.times.indexOf(time) < 0) v.times.push(time);
  };
  const tables = Array.from(doc.querySelectorAll("table[id]")).filter((t) => /^\d{8}$/.test(t.id));
  const halls: Element[] = [];
  for (const t of tables) if (t.parentElement && halls.indexOf(t.parentElement) < 0) halls.push(t.parentElement);
  for (const table of tables) {
    const day = table.id.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
    const hall = `第 ${halls.indexOf(table.parentElement as Element) + 1} 廳`;
    for (const row of Array.from(table.querySelectorAll("tr"))) {
      const cells = Array.from(row.children).filter((el) => /^(TD|TH)$/.test(el.tagName));
      const ti = cells.findIndex((el) => /^\d{2}:\d{2}$/.test(clean(el.textContent)));
      if (ti < 0) {
        if (/影展|包場/.test(row.textContent || ""))
          notice = "部分日期有影展／包場，官網沒列出的個別場次不會出現，請另查官方活動頁。";
        continue;
      }
      const titleCell = cells[ti + 1];
      if (!titleCell) continue;
      const holder = titleCell.cloneNode(true) as Element;
      for (const br of Array.from(holder.querySelectorAll("br"))) br.replaceWith("\n");
      const title = (holder.textContent || "").split("\n").map(clean).find(Boolean) || "";
      const rtText = clean(cells[ti + 2]?.textContent);
      const subtitle = clean(cells[ti + 3]?.textContent);
      add(day, title, /^\d+$/.test(rtText) ? Number(rtText) : 0, hall + (subtitle ? `｜字幕 ${subtitle}` : ""), clean(cells[ti].textContent));
    }
  }
  return { schedules, notice };
}

/** 光點台北單部電影介紹頁：片名、片長、本片放映時刻（只有月/日） */
export function parseSpotMovie(doc: Document): SpotMovie | null {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const title = clean(doc.querySelector(".movie_title")?.textContent).replace(/([：:])\s+/g, "$1");
  if (!title) return null;
  const body = doc.body.textContent || "";
  const runtime = Number((body.match(/(\d+)\s*min/i) || [])[1] || 0);
  const k = body.indexOf("放映時刻");
  const entries: SpotMovie["entries"] = [];
  if (k >= 0) {
    const seg = body.slice(k).split(/Add\s/)[0];
    const marks = Array.from(seg.matchAll(/(\d{1,2})\/(\d{1,2})\s*\([一二三四五六日]\)/g));
    marks.forEach((mk, i) => {
      const part = seg.slice((mk.index || 0) + mk[0].length, i + 1 < marks.length ? marks[i + 1].index : undefined);
      const times = Array.from(part.matchAll(/(\d{1,2}):(\d{2})/g))
        .map((t) => t[1].padStart(2, "0") + ":" + t[2])
        .filter((t) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t));
      if (times.length) entries.push({ month: Number(mk[1]), day: Number(mk[2]), times });
    });
  }
  return { title, runtime, entries };
}

export interface LuxFilm {
  id: string;
  title: string;
  entries: { month: number; day: number; times: { t: string; hall: string }[] }[];
}

/** 樂聲影城「場次查詢」頁：每部片列出多天場次，時間後面可能接「| XL」「| L」表示影廳 */
export function parseLux(doc: Document): LuxFilm[] {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const out: LuxFilm[] = [];
  for (const a of Array.from(doc.querySelectorAll('.movie_all_list a[href*="movie_item.php"]'))) {
    const id = ((a.getAttribute("href") || "").match(/film_id=(\d+)/) || [])[1];
    const h1 = a.querySelector("h1");
    if (!id || !h1) continue;
    const holder = h1.cloneNode(true) as Element;
    for (const sp of Array.from(holder.querySelectorAll("span"))) sp.remove(); // 拿掉「立即訂票」
    const title = clean(holder.textContent);
    const entries: LuxFilm["entries"] = [];
    let cur: LuxFilm["entries"][number] | null = null;
    for (const el of Array.from(a.querySelectorAll("h3, li"))) {
      const txt = clean(el.textContent);
      if (el.tagName === "H3") {
        const md = txt.match(/(\d{1,2})\/(\d{1,2})/);
        cur = md ? { month: Number(md[1]), day: Number(md[2]), times: [] } : null;
        if (cur) entries.push(cur);
      } else if (cur) {
        const m = txt.match(/^(\d{1,2}):(\d{2})\s*(?:\|\s*(\S+))?/);
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

/** 樂聲影城單片介紹頁：「長度 | 98 min」「級別 | 輔12級」 */
export function parseLuxFilm(doc: Document): { runtime: number; rating: string } {
  const text = String(doc.body.textContent || "").replace(/\s+/g, " ");
  return {
    runtime: Number((text.match(/長度\s*\|\s*(\d+)\s*min/i) || [])[1] || 0),
    rating: ((text.match(/級別\s*\|\s*(\S+?級)/) || [])[1] || ""),
  };
}

export interface AtTheater {
  id: string; // 開眼戲院代碼，例如 t02a03
  region: string; // 開眼地區代碼，例如 a02
  name: string;
}
export interface AtDay {
  name: string;
  address: string;
  site: string;
  date: string; // YYYY-MM-DD
  movies: Movie[];
}

/** 開眼電影網地區頁：列出該地區所有戲院 */
export function parseAtRegion(doc: Document): AtTheater[] {
  const out: AtTheater[] = [];
  const region = ((doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || "").match(/\/(a\d\d)\//) || [])[1] || "";
  for (const a of Array.from(doc.querySelectorAll('a[href^="/showtime/t"]'))) {
    const m = (a.getAttribute("href") || "").match(/^\/showtime\/(t\w+)\/(a\d\d)\/$/);
    const name = String(a.textContent || "").replace(/\s+/g, " ").trim();
    if (!m || !name || (region && m[2] !== region) || out.some((x) => x.id === m[1])) continue;
    out.push({ id: m[1], region: m[2], name });
  }
  return out;
}

/** 開眼電影網單一戲院某天的時刻表 */
export function parseAtDay(doc: Document): AtDay {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const RATING: Record<string, string> = { G: "普遍級", P: "保護級", F2: "輔12級", F5: "輔15級", R: "限制級" };
  const info = Array.from(doc.querySelectorAll("li")).map((li) => clean(li.textContent));
  const address = (info.find((s) => /^地址[:：]/.test(s)) || "").replace(/^地址[:：]\s*/, "").replace(/\s*\(地圖\)\s*$/, "");
  const siteEl = Array.from(doc.querySelectorAll("li")).find((li) => /^網站[:：]/.test(clean(li.textContent)));
  const site = siteEl?.querySelector("a")?.getAttribute("href") || "";
  const h3 = Array.from(doc.querySelectorAll("h3")).map((e) => clean(e.textContent)).find((s) => /\d{4}\/\d{2}\/\d{2}/.test(s)) || "";
  const date = (h3.match(/\d{4}\/\d{2}\/\d{2}/) || [""])[0].replace(/\//g, "-");
  const movies: Movie[] = [];
  for (const table of Array.from(doc.querySelectorAll("#theaterShowtimeTable, ul[id='theaterShowtimeTable']"))) {
    const title = clean(table.querySelector(".filmTitle a")?.textContent);
    if (!title) continue;
    const text = clean(table.textContent);
    const runtime = Number((text.match(/片長[:：]\s*(\d+)\s*分/) || [])[1] || 0);
    const cer = ((table.querySelector('img[src*="cer_"]')?.getAttribute("src") || "").match(/cer_(\w+)\./) || [])[1] || "";
    let label = "一般場";
    const times: string[] = [];
    for (const li of Array.from(table.querySelectorAll("li"))) {
      if (li.classList.contains("filmVersion")) label = clean(li.textContent) || label;
      const m = clean(li.textContent).match(/^(\d{1,2})[:：](\d{2})$/);
      if (m) times.push(m[1].padStart(2, "0") + ":" + m[2]);
    }
    if (!times.length) continue;
    let mv = movies.find((x) => x.title === title);
    if (!mv) movies.push((mv = { title, runtime, rating: RATING[cer] || "", versions: [] }));
    let v = mv.versions.find((x) => x.label === label);
    if (!v) mv.versions.push((v = { label, times: [] }));
    for (const t of times) if (v.times.indexOf(t) < 0) v.times.push(t);
  }
  return { name: clean(doc.querySelector("#section_nav")?.textContent).split("﹥").pop() || "", address, site, date, movies };
}

export interface TwMovie {
  slug: string; // 場次通電影頁路徑名稱（中文片名，可能含特殊字元）
  title: string;
  en: string;
  rating: string;
  runtime: number;
  runtimeFrom?: string;
  cinemaCount: number;
  comingSoon: boolean;
}
export interface TwMovieCinema {
  id: string; // 場次通影城代碼
  name: string;
  city: string;
  district: string;
  address: string;
  versions: Version[];
}
export interface TwMovieDay {
  title: string;
  en: string;
  rating: string;
  runtime: number;
  runtimeFrom?: string;
  date: string;
  dates: string[];
  cinemas: TwMovieCinema[];
}

/** 場次通「全部電影」頁：上映中＋即將上映 */
export function parseTwMovies(doc: Document): TwMovie[] {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  const out: TwMovie[] = [];
  for (const sec of Array.from(doc.querySelectorAll("section"))) {
    const h2 = clean(sec.querySelector("h2")?.textContent);
    if (!/上映中|即將上映/.test(h2)) continue;
    for (const a of Array.from(sec.querySelectorAll('a[href^="/movies/"]'))) {
      const m = (a.getAttribute("href") || "").match(/^\/movies\/([^/]+)\/$/);
      const title = clean(a.querySelector(".card-title, h3")?.textContent);
      if (!m || !title || out.some((x) => x.slug === m[1])) continue;
      const badges = Array.from(a.querySelectorAll(".badge")).map((e) => clean(e.textContent));
      out.push({
        slug: decodeURIComponent(m[1]),
        title,
        en: clean(a.querySelector("p")?.textContent),
        rating: badges.find((b) => /級$/.test(b)) || "",
        runtime: Number((badges.find((b) => /分鐘$/.test(b)) || "").replace(/\D/g, "") || 0),
        cinemaCount: Number((badges.find((b) => /間影城$/.test(b)) || "").replace(/\D/g, "") || 0),
        comingSoon: /即將上映/.test(h2),
      });
    }
  }
  return out;
}

/** 場次通單一電影某天的頁面：哪些影城有放、各版本場次 */
export function parseTwMovieDay(doc: Document): TwMovieDay {
  const clean = (s: unknown) => String(s || "").replace(/\s+/g, " ").trim();
  let title = "", en = "", rating = "", runtime = 0;
  const address: Record<string, string> = {};
  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const o = JSON.parse(el.textContent || "");
      if (o["@type"] !== "Movie") continue;
      title = clean(o.name);
      en = clean(o.alternateName);
      rating = clean(o.contentRating);
      runtime = Number((String(o.duration || "").match(/(\d+)M/) || [])[1] || 0);
      for (const ev of o.subjectOf || []) {
        const loc = ev && ev.location;
        if (loc && loc.name && loc.address && loc.address.streetAddress) address[clean(loc.name)] = clean(loc.address.streetAddress);
      }
    } catch (_) {}
  }
  if (!title) title = clean(doc.querySelector("h1")?.textContent);
  const heading = Array.from(doc.querySelectorAll("h2")).map((e) => clean(e.textContent)).find((s) => /\d{4}-\d{2}-\d{2}\s*場次/.test(s)) || "";
  const date = (heading.match(/\d{4}-\d{2}-\d{2}/) || [""])[0];
  const dates: string[] = date ? [date] : [];
  for (const a of Array.from(doc.querySelectorAll('a[href^="/movies/"]'))) {
    const m = (a.getAttribute("href") || "").match(/\/(\d{4}-\d{2}-\d{2})\/$/);
    if (m && dates.indexOf(m[1]) < 0) dates.push(m[1]);
  }
  dates.sort();
  const cinemas: TwMovieCinema[] = [];
  for (const sec of Array.from(doc.querySelectorAll("section[data-region]"))) {
    const city = clean(sec.querySelector("h3 a")?.textContent);
    for (const a of Array.from(sec.querySelectorAll('a[href^="/cinemas/"]'))) {
      const id = ((a.getAttribute("href") || "").match(/^\/cinemas\/([^/]+)\/(?:\d{4}-\d{2}-\d{2}\/)?$/) || [])[1];
      const name = clean(a.querySelector(".card-title")?.textContent);
      if (!id || !name) continue;
      const place = clean(a.querySelector(".card-title + span, .text-sm")?.textContent);
      const versions: Version[] = [];
      let cur: Version | null = null;
      for (const sp of Array.from(a.querySelectorAll(".badge"))) {
        const txt = clean(sp.textContent);
        if (sp.classList.contains("font-mono")) {
          if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(txt)) continue;
          if (!cur) versions.push((cur = { label: "一般場", times: [] }));
          if (cur.times.indexOf(txt) < 0) cur.times.push(txt);
        } else if (sp.classList.contains("badge-secondary")) {
          const label = txt || "一般場";
          cur = versions.find((v) => v.label === label) || null;
          if (!cur) versions.push((cur = { label, times: [] }));
        }
      }
      if (!versions.some((v) => v.times.length)) continue;
      cinemas.push({
        id,
        name,
        city: city || place.split(" ")[0] || "",
        district: place.split(" ")[1] || "",
        address: address[name] || "",
        versions: versions.filter((v) => v.times.length),
      });
    }
  }
  return { title, en, rating, runtime, date, dates, cinemas };
}

