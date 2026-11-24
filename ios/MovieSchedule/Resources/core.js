"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/core.ts
  var core_exports = {};
  __export(core_exports, {
    ABOUT_URL: () => ABOUT_URL,
    ADS_NOTE: () => ADS_NOTE,
    AD_STEPS: () => AD_STEPS,
    AT_DATA_URL: () => AT_DATA_URL,
    AT_SUPPLEMENT: () => AT_SUPPLEMENT,
    BOXOFFICE_INFO_URL: () => BOXOFFICE_INFO_URL,
    BOXOFFICE_URL: () => BOXOFFICE_URL,
    BOXOFFICE_WEEKS_URL: () => BOXOFFICE_WEEKS_URL,
    BOXOFFICE_YEARS_URL: () => BOXOFFICE_YEARS_URL,
    BOX_COUNTRY_NOTE: () => BOX_COUNTRY_NOTE,
    BOX_PAGE: () => BOX_PAGE,
    CINEMA_APPS: () => CINEMA_APPS,
    CITY_ORDER: () => CITY_ORDER,
    COMMUNITY_API: () => COMMUNITY_API,
    COMMUNITY_MIN: () => COMMUNITY_MIN,
    COMMUNITY_SUMMARY_URL: () => COMMUNITY_SUMMARY_URL,
    EXTRA: () => EXTRA,
    FEEDBACK_CATS: () => FEEDBACK_CATS,
    FEEDBACK_MAX: () => FEEDBACK_MAX,
    FEEDBACK_STATUS: () => FEEDBACK_STATUS,
    FESTIVAL_URL: () => FESTIVAL_URL,
    FORMATS: () => FORMATS,
    MAPS_LABEL: () => MAPS_LABEL,
    META_URL: () => META_URL,
    NOTE_MAX: () => NOTE_MAX,
    NOTE_PLACEHOLDER: () => NOTE_PLACEHOLDER,
    NOTE_RULES: () => NOTE_RULES,
    NOTIFY_KINDS: () => NOTIFY_KINDS,
    NOTIFY_PRE_STEPS: () => NOTIFY_PRE_STEPS,
    OFFICIAL_URL: () => OFFICIAL_URL,
    POSTERS_URL: () => POSTERS_URL,
    POSTER_TINTS: () => POSTER_TINTS,
    PRIVACY_URL: () => PRIVACY_URL,
    PROFILE_COLORS: () => PROFILE_COLORS,
    PROFILE_EMOJI: () => PROFILE_EMOJI,
    RATE_SOURCES: () => RATE_SOURCES,
    REPORT_REASONS: () => REPORT_REASONS,
    REVIEW_TAGS: () => REVIEW_TAGS,
    REVIEW_TAGS_MAX: () => REVIEW_TAGS_MAX,
    SCRIPTING_IMPORT_URL: () => SCRIPTING_IMPORT_URL,
    SHOWTIMES_URL: () => SHOWTIMES_URL,
    SITE_URL: () => SITE_URL,
    STATUS_LABEL: () => STATUS_LABEL,
    TMDB_LINKS: () => TMDB_LINKS,
    TW: () => TW,
    TW_FAR_URL: () => TW_FAR_URL,
    TW_NEAR_URL: () => TW_NEAR_URL,
    UPCOMING_URL: () => UPCOMING_URL,
    WATCH_HOW: () => WATCH_HOW,
    WEEK: () => WEEK,
    WINDOWS: () => WINDOWS,
    YEAR_RATINGS_URL: () => YEAR_RATINGS_URL,
    addDays: () => addDays,
    adoptRatings: () => adoptRatings,
    atDayLive: () => atDayLive,
    baseTitle: () => baseTitle,
    bookingUrl: () => bookingUrl,
    boxByCountry: () => boxByCountry,
    boxByIssuer: () => boxByIssuer,
    boxCountries: () => boxCountries,
    boxCountriesPicked: () => boxCountriesPicked,
    boxCountryTag: () => boxCountryTag,
    boxCountryText: () => boxCountryText,
    boxFirstRun: () => boxFirstRun,
    boxHasLaterRun: () => boxHasLaterRun,
    boxInfo: () => boxInfo,
    boxInfoBy: () => boxInfoBy,
    boxInfoRows: () => boxInfoRows,
    boxIsRerun: () => boxIsRerun,
    boxIssuers: () => boxIssuers,
    boxMainCountry: () => boxMainCountry,
    boxMainIssuer: () => boxMainIssuer,
    boxMatcher: () => boxMatcher,
    boxOfficeBy: () => boxOfficeBy,
    boxOfficeFooter: () => boxOfficeFooter,
    boxOfficeLabel: () => boxOfficeLabel,
    boxOfficeLines: () => boxOfficeLines,
    boxOfficeNote: () => boxOfficeNote,
    boxOfficeTitle: () => boxOfficeTitle,
    boxOrigYear: () => boxOrigYear,
    boxRunRows: () => boxRunRows,
    boxRuns: () => boxRuns,
    boxRunsName: () => boxRunsName,
    boxSorts: () => boxSorts,
    boxStatus: () => boxStatus,
    boxWeekOptions: () => boxWeekOptions,
    boxWeekPicked: () => boxWeekPicked,
    boxYears: () => boxYears,
    boxYearsPicked: () => boxYearsPicked,
    byShowtime: () => byShowtime,
    cachePoster: () => cachePoster,
    checkLatest: () => checkLatest,
    cinemaAddress: () => cinemaAddress,
    cinemaApp: () => cinemaApp,
    cinemaPos: () => cinemaPos,
    communityCached: () => communityCached,
    communityKey: () => communityKey,
    communityStats: () => communityStats,
    communityTags: () => communityTags,
    communityVote: () => communityVote,
    dateLabel: () => dateLabel,
    datesOf: () => datesOf,
    distanceKm: () => distanceKm,
    dropStaleCaches: () => dropStaleCaches,
    extractTmdbKey: () => extractTmdbKey,
    favMovieBox: () => favMovieBox,
    favMovieRows: () => favMovieRows,
    favSnapGet: () => favSnapGet,
    favSnapSet: () => favSnapSet,
    feedbackCat: () => feedbackCat,
    feedbackMarkSeen: () => feedbackMarkSeen,
    feedbackSent: () => feedbackSent,
    feedbackUnread: () => feedbackUnread,
    festivalChipNote: () => festivalChipNote,
    festivalCinema: () => festivalCinema,
    festivalDates: () => festivalDates,
    festivalDay: () => festivalDay,
    festivalDefaultDate: () => festivalDefaultDate,
    festivalFilmSessions: () => festivalFilmSessions,
    festivalFind: () => festivalFind,
    festivalFooter: () => festivalFooter,
    festivalGroups: () => festivalGroups,
    festivalLines: () => festivalLines,
    festivalNote: () => festivalNote,
    festivalPeriod: () => festivalPeriod,
    festivalPick: () => festivalPick,
    festivalPlace: () => festivalPlace,
    festivalSearch: () => festivalSearch,
    festivalSearchLines: () => festivalSearchLines,
    festivalState: () => festivalState,
    festivalStateLabel: () => festivalStateLabel,
    festivalStatusLine: () => festivalStatusLine,
    festivalTrailer: () => festivalTrailer,
    festivalYears: () => festivalYears,
    festivalsAny: () => festivalsAny,
    festivalsReady: () => festivalsReady,
    fillMovieDay: () => fillMovieDay,
    fillRuntimes: () => fillRuntimes,
    filterVersions: () => filterVersions,
    filterVersionsAny: () => filterVersionsAny,
    findShowtimes: () => findShowtimes,
    findShowtimesMulti: () => findShowtimesMulti,
    fmt: () => fmt,
    foregroundTask: () => foregroundTask,
    forgetMyVotes: () => forgetMyVotes,
    formatsOf: () => formatsOf,
    globalSearch: () => globalSearch,
    groupByMovie: () => groupByMovie,
    hallOf: () => hallOf,
    howLabel: () => howLabel,
    isChainSlug: () => isChainSlug,
    isFavMovie: () => isFavMovie,
    isLate: () => isLate,
    isLocalSrc: () => isLocalSrc,
    isReissue: () => isReissue,
    issuerRecent: () => issuerRecent,
    issuerTag: () => issuerTag,
    kmLabel: () => kmLabel,
    lateIsTonight: () => lateIsTonight,
    lateOnOwnDate: () => lateOnOwnDate,
    linkMovies: () => linkMovies,
    loadBoxFor: () => loadBoxFor,
    loadBoxOffice: () => loadBoxOffice,
    loadBoxOfficeFull: () => loadBoxOfficeFull,
    loadBoxOfficeWeeks: () => loadBoxOfficeWeeks,
    loadCinemas: () => loadCinemas,
    loadCommunitySummary: () => loadCommunitySummary,
    loadFestivals: () => loadFestivals,
    loadIntro: () => loadIntro,
    loadMovieBoard: () => loadMovieBoard,
    loadMovies: () => loadMovies,
    loadMyFeedback: () => loadMyFeedback,
    loadNotes: () => loadNotes,
    loadSettings: () => loadSettings,
    loadSoonBoard: () => loadSoonBoard,
    loadUpcoming: () => loadUpcoming,
    loadYearRatings: () => loadYearRatings,
    looseTitle: () => looseTitle,
    mapsUrl: () => mapsUrl,
    matchBoxOffice: () => matchBoxOffice,
    money: () => money,
    movieAbout: () => movieAbout,
    movieBoard: () => movieBoard,
    movieCinemaVersions: () => movieCinemaVersions,
    movieDay: () => movieDay,
    movieDayFilled: () => movieDayFilled,
    movieDays: () => movieDays,
    movieExtras: () => movieExtras,
    movieLines: () => movieLines,
    moviePoster: () => moviePoster,
    movieRatings: () => movieRatings,
    movieRows: () => movieRows,
    movieRuntime: () => movieRuntime,
    moviesOf: () => moviesOf,
    multiDayLive: () => multiDayLive,
    multiDetail: () => multiDetail,
    multiLabel: () => multiLabel,
    nearest: () => nearest,
    normImageUrl: () => normImageUrl,
    normTitle: () => normTitle,
    noteDate: () => noteDate,
    noteLooksSpoiler: () => noteLooksSpoiler,
    noteMax: () => noteMax,
    notesCached: () => notesCached,
    notifyEndPick: () => notifyEndPick,
    notifyEndScope: () => notifyEndScope,
    notifyFavs: () => notifyFavs,
    notifyPayload: () => notifyPayload,
    notifyPrefs: () => notifyPrefs,
    notifyQuiet: () => notifyQuiet,
    nowFilter: () => nowFilter,
    nowGroupLine: () => nowGroupLine,
    nowHM: () => nowHM,
    popcornCount: () => popcornCount,
    popcornLabel: () => popcornLabel,
    popcornTier: () => popcornTier,
    posterKnown: () => posterKnown,
    posterLight: () => posterLight,
    posterReady: () => posterReady,
    posterSrc: () => posterSrc,
    posterTint: () => posterTint,
    prefetchPosters: () => prefetchPosters,
    profileColor: () => profileColor,
    profileInk: () => profileInk,
    profileSkipped: () => profileSkipped,
    ratingTier: () => ratingTier,
    ratingsOfIdent: () => ratingsOfIdent,
    releaseLabel: () => releaseLabel,
    releaseOf: () => releaseOf,
    reportNote: () => reportNote,
    rerunByName: () => rerunByName,
    rerunDataReady: () => rerunDataReady,
    reviewTagLabel: () => reviewTagLabel,
    reviewTagsToggle: () => reviewTagsToggle,
    saveNote: () => saveNote,
    saveSettings: () => saveSettings,
    searchTitles: () => searchTitles,
    seenLabel: () => seenLabel,
    sendFeedback: () => sendFeedback,
    setAccount: () => setAccount,
    setMetaEnabled: () => setMetaEnabled,
    setNotesViaSite: () => setNotesViaSite,
    setProfileSkipped: () => setProfileSkipped,
    setSettingsSavedHook: () => setSettingsSavedHook,
    setSiteBase: () => setSiteBase,
    settingsStored: () => settingsStored,
    shareText: () => shareText,
    showDay: () => showDay,
    showMinute: () => showMinute,
    signedIn: () => signedIn,
    social: () => social,
    soonBoard: () => soonBoard,
    soonGroups: () => soonGroups,
    syncApply: () => syncApply,
    syncMerge: () => syncMerge,
    syncPick: () => syncPick,
    ticketsText: () => ticketsText,
    tmdbRuntime: () => tmdbRuntime,
    tmdbTest: () => tmdbTest,
    todayTPE: () => todayTPE,
    toggleFavMovie: () => toggleFavMovie,
    tomatoLabel: () => tomatoLabel,
    tomatoTier: () => tomatoTier,
    topReviewTags: () => topReviewTags,
    tpeDate: () => tpeDate,
    twDayLive: () => twDayLive,
    twReleaseDate: () => twReleaseDate,
    weekday: () => weekday,
    yearRatingKey: () => yearRatingKey,
    ytScore: () => ytScore
  });

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
    { id: "flist", label: "影展片單公布時", note: "有影展公布了片單", group: "all" }
  ];
  var NOTIFY_PRE_STEPS = [1, 3, 7];
  var notifyPrefs = (s) => ({ open: true, rel: true, end: true, fest: true, favc: true, fmt: false, pre: true, rate: false, week: false, flist: false, cweek: false, ...s.notify || {} });
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
  function dropStaleCaches(version) {
    try {
      if (!version || cacheGet("cache-version.txt") === version) return;
      const thisYear = Number(todayTPE().slice(0, 4));
      const names = ["meta2.json", "ratings-years3.json", "boxoffice-years3.json", "boxoffice5.json", "boxoffice-weeks.json", "upcoming.json", "festival.json", "official.json", "showtimes.json", "tw-near.json", "tw-far.json"];
      for (let y = 2016; y <= thisYear; y++) names.push(`intro-${y}.json`, `festival-${y}.json`);
      for (const n of names) if (cacheGet(n)) cacheSet(n, "");
      cacheSet("cache-version.txt", version);
    } catch (_) {
    }
  }
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
    const extra2 = found.filter((t) => !known.has(t.id)).map((t) => atCinema(t.id, t.region, t.name, ""));
    return builtin.concat(extra2);
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
  function mergeChain(movies, extra2) {
    const out = movies.map((m) => ({ ...m, versions: m.versions.map((v) => ({ ...v, times: v.times.slice() })) }));
    for (const em of extra2) {
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
      const extra2 = (await chainDays(c) || {})[date];
      if (extra2 && d.date !== date && d.dates.indexOf(date) < 0) return { movies: await fillRuntimes(extra2), booking: d.booking, sourceUrl: d.booking || c.url, address: d.address };
      if (d.date !== date) d = await twDay(c, date);
      if (d.date && d.date !== date) throw new Error("網站回傳的日期和選擇的不同，請稍後再試");
      const movies = extra2 ? mergeChain(d.movies, extra2) : d.movies;
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
    const cache2 = read();
    cache2[key] = v;
    cacheSet("runtimes.json", JSON.stringify(cache2));
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
  function setMetaEnabled(on) {
    metaOn = on;
  }
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
  function posterReady(title, slug) {
    return posterDone[(slug || "") + "|" + title];
  }
  async function posterKnown(title, slug) {
    const k = (slug || "") + "|" + title;
    if (posterDone[k] !== void 0) return posterDone[k];
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk] || all["p|" + nk];
    if (hit?.poster) return posterDone[k] = normImageUrl(hit.poster);
    const me = await metaOf(title);
    const u = me && me.p ? normImageUrl(me.p) : "";
    if (posterDone[k] === void 0) posterDone[k] = u;
    return u;
  }
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
    let h = 0;
    for (const ch of normTitle(title)) h = (h * 31 + (ch.codePointAt(0) || 0)) % 9973;
    return h % 6;
  }
  var POSTER_TINTS = [
    ["#3b4a6b", "#1f2a44"],
    ["#6b3b4a", "#3d1f2a"],
    ["#2f5d50", "#16352d"],
    ["#5a4a2f", "#33290f"],
    ["#4a3b6b", "#281f44"],
    ["#3a3d42", "#1f2125"]
  ];
  function posterSrc(url) {
    url = normImageUrl(url);
    if (!url) return "";
    try {
      return platform().cachedImage(url) || url;
    } catch (_) {
      return url;
    }
  }
  var isLocalSrc = (src) => /^(data:|file:|\/)/.test(src);
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
  async function tmdbTest(token) {
    const d = await tmdb(`/movie/244786?language=zh-TW`, token.trim());
    return `${d.title}：${d.runtime} 分鐘`;
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
  async function twReleaseDate(slug) {
    const r = await get(`${TW}/movies/${encodeURIComponent(slug).replace(/%3A/gi, ":")}/`);
    if (!r.ok) throw new Error("no page");
    return (r.body.match(/"datePublished":"(\d{4}-\d{2}-\d{2})/) || [])[1] || "";
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
      const extra2 = sort === "tickets" || sort === "price";
      const by = extra2 ? "total" : sort;
      const past = by === "week" && wk.past;
      const everyone = extra2 ? b.list.map((x) => ({ x, k: moneyKey(x) })).sort((a, c) => c.k.tier - a.k.tier || c.k.v - a.k.v).map(({ x }, i) => ({ ...x, rank: i + 1 })) : boxOfficeBy(b, by, selYears, wk.id);
      const countries2 = boxCountries(everyone);
      const land2 = boxCountriesPicked(countries2, opt.countries || []);
      const issuers2 = boxIssuers(everyone);
      const firm2 = boxCountriesPicked(issuers2, opt.issuers || []);
      const entries2 = boxByIssuer(boxByCountry(everyone, land2), firm2).map((x) => {
        const e = boxEntry(x, by, past, by === "year" || past);
        if (!extra2) return e;
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
        title: (extra2 ? `上映中｜${sort === "tickets" ? "累計票數" : "平均票價"}（截至 ${mdOf(b.end)}）` : boxOfficeTitle(b, by, selYears, wk.id)) + dirTag + boxCountryTag(land2) + issuerTag(firm2),
        footer: extra2 ? `只排上映中的電影：這一週有賣出票的共 ${b.list.length} 部。${sort === "tickets" ? "累計票數是上映以來賣出的票數。" : "平均票價是累計票房 ÷ 累計票數；特殊廳、演唱會轉播的票價較高。"}這是全台灣戲院的票房。資料來源：${b.source}。官方每週更新一次。` : boxOfficeFooter(b, by, selYears, wk.id),
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
  async function cinemaAddress(c) {
    if (c.address) return c.address;
    try {
      return (await datesOf(c)).address || "";
    } catch (_) {
      return "";
    }
  }
  var FORMATS = ["IMAX", "杜比", "4DX", "MX4D", "ScreenX", "巨幕", "LED", "頂級廳", "3D"];
  var FORMAT_RE = {
    IMAX: /IMAX/i,
    杜比: new RegExp("DOLBY|杜比|(?<![A-Z])DVA(?![A-Z])|ATMOS", "i"),
    // Dolby Cinema、秀泰的 DVA（Dolby Vision＋Atmos）、Atmos 廳
    "4DX": /4DX/i,
    MX4D: /MX4D/i,
    ScreenX: /SCREEN\s*X/i,
    巨幕: /巨幕|寬巨|TITAN|LUXE|ULTRA/i,
    // 秀泰 巨幕／寬巨／ULTRA、MUVIE TITAN、新光 LUXE
    LED: new RegExp("(?<![A-Z])LED(?![A-Z])|ONYX", "i"),
    // LG LED Cinema 等 LED 螢幕廳
    頂級廳: /gold\s*class|mucrown|金鑽|貴賓|VIP|皇家|丹普|REMMI/i,
    "3D": new RegExp("(?<![A-Z0-9])3D", "i")
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
  function festivalGroups(list) {
    const live = list.filter((f) => festivalState(f) !== "past");
    const past = list.filter((f) => festivalState(f) === "past");
    return [
      { title: "進行中・即將開始", past: false, items: live },
      { title: "已結束（回顧）", past: true, items: past }
    ].filter((g) => g.items.length > 0);
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
  var festivalsReady = () => festivalsNow;
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
  function festivalNote(list) {
    if (list.some((f) => festivalState(f) === "now")) return "進行中";
    const next = list.filter((f) => festivalState(f) === "soon").map((f) => f.start).sort()[0] || "";
    return next ? `${Number(next.slice(5, 7))}/${Number(next.slice(8, 10))} 開始` : list.length || festivalYearsNow.length ? "回顧" : "";
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
    const [h, m] = t.split(":").map(Number);
    return (isLate(t) ? h + 24 : h) * 60 + m;
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
        for (const h of r.hits) {
          if (formats.length && !formatsOf(h.version.label).some((f) => formats.indexOf(f) >= 0)) continue;
          const k = [h.cinema.id, h.date, h.movie.title, h.version.label, h.time].join("|");
          if (seen.has(k)) continue;
          seen.add(k);
          hits.push({ ...h, day });
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
    for (const h of hits) {
      const key = normTitle(h.movie.title) || h.movie.title;
      const g = map[key] || (map[key] = { title: h.movie.title, runtime: h.movie.runtime, rating: h.movie.rating, hits: [] });
      if (!g.runtime && h.movie.runtime) g.runtime = h.movie.runtime;
      if (!g.rating && h.movie.rating) g.rating = h.movie.rating;
      g.hits.push(h);
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
      const hits = g.hits.filter((h) => has(h.cinema.name) || has(h.version.label) || has(h.cinema.city || ""));
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
  var ratingsOfIdent = (who) => findRatings("", void 0, void 0, who);
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
    { group: "推薦程度", single: true, tags: [{ id: "cinema", label: "值得進戲院" }, { id: "stream", label: "等串流就好" }, { id: "again", label: "想二刷" }] },
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
    "bad name": "暱稱要 2～16 個字，只能用中英文、數字和底線",
    "name taken": "這個暱稱有人用了，換一個",
    "rename later": "暱稱 14 天內只能改一次",
    "private": "對方沒有公開個人頁",
    "not found": "找不到這個帳號",
    "too many follows": "追蹤的人數到上限了",
    "bad date": "日期不對（不能是未來的日期）",
    "bad emoji": "頭像只能放一個表情符號"
  };
  async function social(op, body = {}) {
    const r = await socialCall(op, body);
    if (r.status !== 200 || !r.data) throw new Error(SOCIAL_ERR[r.data && r.data.error || ""] || "暫時連不上，請稍後再試");
    return r.data;
  }
  var profileSkipped = () => cacheGet("profile-skip.txt") === "1";
  var setProfileSkipped = (on) => cacheSet("profile-skip.txt", on ? "1" : "");
  var WATCH_HOW = [{ id: "cinema", label: "電影院" }, { id: "second", label: "二輪電影院" }, { id: "stream", label: "串流" }];
  var howLabel = (how) => WATCH_HOW.filter((h) => (how || []).indexOf(h.id) >= 0).map((h) => h.label).join("、");
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
    const h = profileColor(id);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
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
        const recent = !!(mine.dist && mine.dat && Date.now() - mine.dat < 45 * 6e4);
        const c2 = { ...fromDist(recent ? mine.dist : summary[k] || [], mine.s), tags: recent && mine.tags || summaryTags[k] || {}, myTags: mine.t || [], notes: typeof mine.nn === "number" && mine.nat && Date.now() - mine.nat < 45 * 6e4 ? mine.nn : summaryNotes[k] || 0 };
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
    const n = data.notes.filter((x) => !x.hidden).length;
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
    const viaSite = signedIn() || notesViaSite && path === "report";
    const r = viaSite ? await socialCall(path, { m: k, title: baseTitle(title), ...body }).then((x) => ({ status: x.status, body: JSON.stringify(x.data) })) : await platform().fetchText(`${COMMUNITY_API}/v2/${path}`, { accept: "application/json", "content-type": "application/json" }, { method: "POST", body: JSON.stringify({ m: k, d: deviceId(), ...body }) });
    if (r.status === 429) throw new Error("操作太頻繁，請稍後再試");
    if (r.status === 409) throw new Error("要先評分才能寫短評");
    if (r.status === 422) throw new Error(/too long/.test(r.body) ? `短評最多 ${noteMax()} 個字` : "短評不能放連結或聯絡方式");
    if (r.status !== 200) throw new Error(fail);
    return keepNotes(k, JSON.parse(r.body));
  }
  var saveNote = (title, text, spoiler) => notePost("note", title, { x: String(text || "").trim(), sp: spoiler ? 1 : 0 }, "短評沒有送出，請稍後再試");
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
  function matchBoxOffice(name, movies) {
    const k = communityKey(name);
    return movies.find((m) => communityKey(m.title) === k);
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
  var SCRIPTING_IMPORT_URL = "https://www.scripting.fun/import_scripts?urls=%5B%22https%3A%2F%2Fgithub.com%2Fmorgan91204%2Fscriptable-movie-schedule%2Ftree%2Fmain%2Fscripting%22%5D";
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

  // ios/bridge.ts
  var native = (name, payload = {}) => webkit.messageHandlers.native.postMessage({ name, ...payload });
  var cache = {};
  async function boxOffice(by, years, query, limit, week, country) {
    const load = by === "year" ? loadBoxOfficeFull() : (by || "week") === "week" && week ? loadBoxOfficeWeeks() : loadBoxOffice();
    const [b, all] = await Promise.all([load, loadMovies().catch(() => [])]);
    const sorts = boxSorts(b);
    const sort = sorts.some((x) => x.id === by) ? by : "week";
    const picked = boxYearsPicked(b, years || []);
    const wk = boxWeekPicked(b, week || "");
    const pastWeek = sort === "week" && wk.past;
    const match = boxMatcher(all);
    const k = (query || "").trim().toLowerCase();
    const everyone = boxOfficeBy(b, sort, picked, wk.id);
    const countries = boxCountries(everyone);
    const land = boxCountriesPicked(countries, Array.isArray(country) ? country : []);
    const found = boxByCountry(everyone, land).map((x) => ({ x, m: match(x.name) || null })).filter(({ x, m }) => !k || `${x.name} ${m?.en || ""}`.toLowerCase().includes(k));
    const paged = sort === "year";
    const rows = (paged ? found.slice(0, limit || BOX_PAGE) : found).map(({ x, m }) => ({ x, m, lines: boxOfficeLines(x, sort, pastWeek), light: (paged || pastWeek) && !m }));
    return {
      label: boxOfficeTitle(b, sort, picked, wk.id) + boxCountryTag(land),
      countryNote: BOX_COUNTRY_NOTE,
      source: b.source,
      footer: boxOfficeFooter(b, sort, picked, wk.id),
      sorts,
      sort,
      years: boxYears(b),
      selYears: picked,
      // 年度排行可以選的年份、實際採用的年份
      weeks: boxWeekOptions(b),
      selWeek: wk.id,
      // 週票房可以選的週次、實際採用的那一週
      countries: countries.map((c) => ({ id: c.id, label: `${c.id}（${c.count} 部）` })),
      selCountries: land,
      everyone: everyone.length,
      // 國別篩選
      total: found.length,
      // 符合條件的總數（比 rows 多的話還有下一批）
      rows
    };
  }
  async function filmList(scope, sort, years, query, limit, week, country, asc, rate) {
    const board = await loadMovieBoard({ sort: scope === "year" ? "year" : sort, years: years || [], week: week || "", countries: Array.isArray(country) ? country : [], query, asc: !!asc, rate });
    return {
      ...board,
      countries: board.countries.map((c) => ({ id: c.id, label: `${c.id}（${c.count} 部）` })),
      countryNote: BOX_COUNTRY_NOTE,
      total: board.entries.length,
      // 符合條件的總數（比 entries 多的話還有下一批）
      entries: board.paged ? board.entries.slice(0, limit || BOX_PAGE) : board.entries
      // 年度有好幾千列：一次只回傳 limit 列
    };
  }
  async function soonList(query) {
    return loadSoonBoard(query || "");
  }
  async function nowShowing(scope, date, winId, format) {
    const win = WINDOWS.find((w) => w.id === winId) || WINDOWS[WINDOWS.length - 1];
    const { hits, failed, noData } = await findShowtimes(scope, date, win, format || "");
    return { groups: groupByMovie(hits), failed, noData };
  }
  async function nowShowingMulti(scope, dates, winIds, formats) {
    const { hits, failed, noData } = await findShowtimesMulti(scope, dates, winIds, formats);
    return { groups: await linkMovies(groupByMovie(hits)), failed, noData, label: multiLabel(dates, winIds) };
  }
  async function nearby(lat, lng, limit) {
    return nearest(await loadCinemas(), { lat, lng }, limit || 20);
  }
  async function patchSettings(patch) {
    saveSettings({ ...await loadSettings(), ...patch });
    return true;
  }
  async function fillMovie(slug, date, ids) {
    return fillMovieDay(await movieDay(slug, date || void 0), ids);
  }
  async function movieBoard2(slug, dates, cities, formats, favIds, fill) {
    const base = await movieDay(slug, void 0);
    const today = todayTPE();
    const future = base.dates.filter((d) => d >= today);
    const allDates = future.length ? future : [base.date];
    const picked = dates.filter((d) => allDates.indexOf(d) >= 0);
    const selDates = picked.length ? picked.slice().sort() : [allDates.indexOf(base.date) >= 0 ? base.date : allDates[0]];
    const days = await movieDays(slug, selDates);
    const rank = (c) => CITY_ORDER.indexOf(c) + 1 || 99;
    const allCities = Array.from(new Set(days.flatMap((x) => x.cinemas.map((c) => c.city)))).sort((a, b) => rank(a) - rank(b));
    const selCities = cities.filter((c) => allCities.indexOf(c) >= 0);
    if (fill)
      for (const day of days) {
        const ids = day.cinemas.filter((c) => (!selCities.length || selCities.indexOf(c.city) >= 0) && (!favIds || favIds.indexOf(c.id) >= 0)).map((c) => c.id);
        if (!movieDayFilled(day, ids)) await fillMovieDay(day, ids).catch(() => day);
      }
    const available = FORMATS.filter((f) => days.some((x) => x.cinemas.some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0))));
    const selFormats = formats.filter((f) => available.indexOf(f) >= 0);
    const rows = movieRows(days, { cities: selCities, formats: selFormats, favIds }).map((r) => ({ date: r.date, cinema: r.cinema }));
    return { title: base.title, rating: base.rating, runtime: base.runtime, release: base.release || "", intro: movieAbout(base).text, credits: movieAbout(base).credits, total: base.cinemas.length, dates: allDates, selDates, cities: allCities, formats: available, rows };
  }
  async function festivalBoard(festId, date, year = 0, query = "", tab = "") {
    const list = await loadFestivals(year || void 0);
    const years = festivalYears();
    const pick = festivalPick(list, tab, festId);
    const f = pick.f || list[0];
    if (!f) return { festivals: [], groups: [], tabs: [], tab: "", items: [], years, year: 0, note: "", id: "", name: "", range: "", footer: "", dates: [], date: "", day: [] };
    const dates = festivalDates(f);
    const d = dates.indexOf(date) >= 0 ? date : festivalDefaultDate(f);
    const item = (x) => ({ id: x.id, name: `${x.name}（${festivalChipNote(x)}）` });
    return {
      festivals: list.map(item),
      groups: festivalGroups(list).map((g) => ({ title: g.title, past: g.past, items: g.items.map(item) })),
      tabs: pick.tabs.map((t) => ({ id: t.id, label: `${t.label}（${t.count}）` })),
      tab: pick.tab,
      items: pick.items.map(item),
      years,
      year: Number(list[0].end.slice(0, 4)),
      note: festivalNote(list),
      id: f.id,
      name: f.name,
      range: festivalStatusLine(f),
      past: festivalState(f) === "past",
      footer: festivalFooter(f),
      dates,
      date: d,
      hits: query.trim() ? festivalSearch(list, query).map((x) => ({ festId: x.f.id, film: x.film, lines: festivalSearchLines(x.f, x.film, x.sessions) })) : [],
      day: festivalDay(f, d).map(({ film, sessions }) => ({ film, count: sessions.length, lines: festivalLines(film, sessions) }))
    };
  }
  async function festivalFilm(festId, filmId) {
    const [f, cinemas] = await Promise.all([festivalFind(festId), loadCinemas().catch(() => [])]);
    if (!f) return null;
    const film = f.films.find((x) => x.id === filmId);
    if (!film) return null;
    return {
      name: `${f.name}（${festivalStateLabel(f)}）`,
      film,
      past: festivalState(f) === "past",
      trailerUrl: festivalTrailer(film).url,
      trailerLabel: festivalTrailer(film).label,
      source: f.source,
      sessions: festivalFilmSessions(f, filmId).map((x) => ({ date: x.date, time: x.time, place: festivalPlace(x), room: x.room, ticket: x.ticket || film.url, cinema: festivalCinema(x, cinemas, f) }))
    };
  }
  var formatList = () => FORMATS;
  var extra = { boxOffice, filmList, soonList, nowShowing, nowShowingMulti, movieBoard: movieBoard2, festivalBoard, festivalFilm, nearby, patchSettings, fillMovie, formatList };
  var BRIDGE_LEVEL = 2;
  globalThis.MS = {
    version: "2026.11.24-1918",
    level: BRIDGE_LEVEL,
    init(saved) {
      cache = saved || {};
      setPlatform({
        fetchText: (url, headers, opts) => native("fetch", { url, headers, method: opts?.method || "GET", body: opts?.body || "" }),
        runInWebView: async (body) => new Function(body)(),
        // 這裡本來就在 WebView 裡，有 DOMParser
        loadSettingsJSON: async () => await native("settingsGet") || null,
        saveSettingsJSON: (json) => {
          native("settingsSet", { value: json });
        },
        cacheGet: (name) => cache[name] ?? null,
        cacheSet: (name, value) => {
          cache[name] = value;
          native("cacheSet", { key: name, value });
        },
        cachedImage: () => null,
        // 圖片由原生端自己快取
        cacheImage: async () => null
      });
    },
    /** 呼叫資料層函式；回傳 JSON：{ ok: 結果 } 或 { err: 原因 } */
    async call(fn, args) {
      try {
        const f = extra[fn] || core_exports[fn];
        if (typeof f !== "function") throw new Error("沒有這個函式：" + fn);
        const r = await f(...args || []);
        return JSON.stringify({ ok: r === void 0 ? null : r });
      } catch (e) {
        return JSON.stringify({ err: String(e?.message || e) });
      }
    }
  };
})();
