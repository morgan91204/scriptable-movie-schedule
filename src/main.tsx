// 🎬 片刻：選影城 → 日期 → 電影 → 場次 → 加入 iOS 行事曆
// 執行環境：Scriptable（iOS）。原始碼用 TSX 撰寫，編譯後的 .js 放進 Scriptable 執行。
// 畫面：WebView（HTML/CSS），事件迴圈在 run()。資料層在 core.ts，網頁解析在 parsers.ts。

import { h, Fragment, Page, Section, Item, Chips, Chip, Button, Search, PickRow, Note, Para, Loading, Empty, Hero, Steps } from "./jsx";
import type { RatingBadge } from "./jsx";
import { UI } from "./ui";
import { setPlatform } from "./platform";
import { scriptablePlatform } from "./platform-scriptable";
import {
  Cinema, Settings, Movie, Version, EXTRA, CITY_ORDER, AD_STEPS,
  todayTPE, nowHM, addDays, isLate, dateLabel, tpeDate, fmt, byShowtime,
  loadSettings, saveSettings, settingsStored, setSettingsSavedHook, syncPick, syncApply, syncMerge, loadCinemas, datesOf, moviesOf, loadMovies, movieDay, communityKey, globalSearch, boxIsRerun, boxHasLaterRun, boxRunRows, loadIntro, rerunDataReady, SITE_URL, TW,
  FORMATS, formatsOf, filterVersions, filterVersionsAny, movieRows, movieDays, nearest, kmLabel, WINDOWS, findShowtimes, findShowtimesMulti, multiLabel, multiDetail, groupByMovie, fillMovieDay, movieDayFilled, movieCinemaVersions, showDay, lateIsTonight, shareText,
  hallOf, tmdbTest, movieExtras, moviePoster, movieRuntime, posterSrc, cachePoster, prefetchPosters, movieLines, releaseLabel, releaseOf, boxOfficeLines, boxOfficeNote, boxOfficeBy, boxOfficeTitle, boxOfficeFooter, boxCountries, boxByCountry, boxInfo, boxInfoRows, boxCountryText, BOX_COUNTRY_NOTE, boxCountryTag, boxCountriesPicked, loadMovieBoard, loadSoonBoard, notifyPrefs, notifyPayload, notifyEndScope, notifyEndPick, notifyQuiet, NOTIFY_PRE_STEPS, NOTIFY_KINDS, boxStatus, STATUS_LABEL, boxInfoBy, isFavMovie, toggleFavMovie, favMovieRows, favMovieBox, soonGroups, boxSorts, boxYears, boxYearsPicked, boxMatcher, posterLight, BOX_PAGE, foregroundTask, communityStats, communityCached, communityVote, loadBoxOffice, loadBoxOfficeFull, loadBoxOfficeWeeks, boxWeekOptions, boxWeekPicked, money, matchBoxOffice, boxOfficeLabel, mapsUrl, MAPS_LABEL, TMDB_LINKS, extractTmdbKey, cinemaApp, bookingUrl, checkLatest, ABOUT_URL, PRIVACY_URL, ADS_NOTE, loadFestivals, festivalsReady, festivalNote, festivalDates, festivalDay, festivalLines, festivalFilmSessions, festivalPlace, festivalCinema, festivalDefaultDate, festivalStateLabel, festivalState, festivalFooter, linkMovies, nowGroupLine, nowFilter, festivalPick, movieAbout, festivalSearch, festivalSearchLines, festivalTrailer, festivalYears, festivalsAny, festivalGroups, festivalChipNote, festivalStatusLine, movieRatings, ratingTier, tomatoTier, popcornTier, popcornCount,
} from "./core";
import type { MovieExtras, Ratings, Community, BoxOfficeItem, BoxSort, MovieEntry, SoonEntry, UpcomingFilm, FavMovie, FavRow, NotifyPrefs, NotifyKind, SyncData, GlobalHits, Festival, FestivalFilm, FestivalSession } from "./core";
import { setTabBar, setBackGuard, esc } from "./jsx";
import { CHANGELOG, CHANGELOG_LATEST } from "./changelog";
import type { TwMovie, TwMovieCinema, Format, LatLng, Hit } from "./core";

interface Pick {
  cinema: Cinema;
  address: string;
  booking: string;
  sourceUrl: string;
  date: string; // 片單日期（營業日）
  movie: Movie;
  version: Version;
  time: string;
}

declare const APP_VERSION: string;
/** 網頁版（web/）編譯時為 true：行事曆改成下載 .ics 檔 */
declare const IS_WEB: boolean;

type View = () => string | Promise<string>;

/** 電影頁頂端要用的資料：預告／海報（x）、三大評分（r）、海報網址（p）、片刻評分（c：undefined 讀取中、false 讀不到） */
type Extras = { x: MovieExtras | null; r: Ratings | null; p: string; px: Promise<MovieExtras | null>; loading: boolean; c: Community | false | undefined };
const sleep = (ms: number) => new Promise<void>((r) => Timer.schedule(ms, false, () => r()));

async function currentCalendar(s: Settings): Promise<Calendar> {
  if (s.calendar) {
    try {
      return await Calendar.forEventsByTitle(s.calendar);
    } catch (_) {}
  }
  return await Calendar.defaultForEvents();
}

class App {
  ui = new UI();
  stack: View[] = [];
  settings: Settings = { favorites: [], ads: 10 };
  cinemas: Cinema[] = [];
  calendarName = "";
  // 確認頁可調整的欄位
  runtime = 0;
  seat = "";
  loadingText = "讀取中…";

  go(view: View, loading = "讀取中…") {
    this.loadingText = loading;
    this.stack.push(view);
  }
  // ── 底部分頁：首頁／電影／影城／設定，各自是一個根畫面；點目前的分頁會回到該分頁的根
  tab = "home";
  readonly TABS = [
    { id: "home", label: "首頁", icon: "house" },
    { id: "movies", label: "電影", icon: "film" },
    { id: "cinemas", label: "影城", icon: "building" },
    { id: "settings", label: "設定", icon: "gear" },
  ];
  switchTab(id: string) {
    this.tab = id;
    const root: Record<string, [View, string]> = {
      home: [() => this.homeView(), "讀取中…"],
      movies: [() => this.movieListView(), "讀取電影清單…"],
      cinemas: [() => this.citiesView(), "讀取中…"],
      settings: [() => this.settingsView(), "讀取中…"],
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

  // ── 事件迴圈 ──
  // 背景查 GitHub 上的最新版本（首頁顯示是否為最新版）
  latest: Promise<{ latest: string; isLatest: boolean } | null> = this.checkVersion();
  latestAt = Date.now();
  /** 最新版本是多少。網頁版問的是自己網站現在上線的版本（重新整理就會拿到的那一版），不是 GitHub 上的 */
  checkVersion(): Promise<{ latest: string; isLatest: boolean } | null> {
    if (!IS_WEB) return checkLatest(APP_VERSION);
    return (async () => {
      try {
        // version.json 是靜態檔（不經過 Worker、不算請求額度）；沒有這個檔時退回 /api/version
        let r = await (globalThis as any).fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
        if (!r.ok) r = await (globalThis as any).fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
        const latest = String((await r.json()).version || "");
        if (!latest) return null;
        const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;
        return { latest, isLatest: num(APP_VERSION) >= num(latest) };
      } catch (_) {
        return null;
      }
    })();
  }

  async run() {
    this.settings = await loadSettings();
    await this.syncStart().catch(() => undefined);
    // 更新內容：第一次使用的人沒有「舊版」可以比，直接當成看過，不亮紅點
    if (!settingsStored && this.settings.seenLog === undefined) this.settings.seenLog = CHANGELOG_LATEST;
    setTabBar(() => ({ active: this.tab, items: this.TABS.map((t) => (t.id === "settings" && this.logUnread() ? { ...t, dot: true } : t)), onTap: (id) => this.switchTab(id) }));
    setBackGuard(() => this.stack.length > 1);
    this.go(() => this.homeView(), "讀取影城清單…");
    // 從通知點進來（?tab=soon／?tab=fest）：直接開電影分頁的那一類
    const startTab = IS_WEB ? (/[?&]tab=(soon|fest)\b/.exec(String((globalThis as any).location?.search || "")) || [])[1] : "";
    if (startTab) { this.movieMode = startTab as "soon" | "fest"; this.switchTab("movies"); }
    await this.openShared().catch(() => undefined);
    if (this.syncNote) { this.switchTab("settings"); this.go(() => this.syncView()); } // 剛從 Google 登入回來：直接到同步那一頁看結果
    loadFestivals().catch(() => []); // 背景先看有沒有影展（有才會在電影分頁多出「影展」）
    const input = String(args.shortcutParameter || (args.urls && args.urls[0]) || (args.plainTexts && args.plainTexts[0]) || "");
    let pendingUrl = input;

    let lastView: View | null = null;
    let lastDepth = 0;
    const savedY = new Map<View, number>(); // 每一頁離開時的捲動位置，返回時還原
    while (!this.ui.closed) {
      const view = this.stack[this.stack.length - 1];
      const depth = this.stack.length;
      const same = view === lastView; // 同一頁重繪（例如切換廣告時間）：不顯示讀取中、不捲回頂端
      const back = !same && depth < lastDepth;
      this.ui.begin();
      const job = foregroundTask(Promise.resolve().then(() => view())); // 使用者在等：背景預抓暫停
      job.catch(() => {});
      // 超過 0.2 秒還沒好才顯示「讀取中」，避免快速操作時畫面閃一下
      const quick = await Promise.race([job.then(() => true, () => true), sleep(200).then(() => false)]);
      if (!quick) await this.ui.render(<Page title="片刻"><Loading text={this.loadingText} /></Page>);
      this.loadingText = "讀取中…";
      let html: string;
      try {
        html = await job;
        if (pendingUrl) {
          const u = pendingUrl;
          pendingUrl = "";
          if (this.startFrom(u)) continue; // 從分享進來：直接跳到那間影城
        }
      } catch (e) {
        html = this.errorView(e);
      }
      // 同一頁、很快就畫好：停在原位；同一頁但重新讀取過、或按返回回到上一頁：還原離開時的位置；其他：頂端
      const scrollTo = same && quick ? -1 : same || back ? savedY.get(view) ?? 0 : 0;
      lastView = view;
      lastDepth = depth;
      // 海報、評分、預告等慢慢讀的資料：每一項讀好就在原位補畫一次（使用者還沒點別的才畫），不用等全部都好
      const late = this.late;
      this.late = [];
      let clicked = false;
      let painting: Promise<void> | null = null;
      const repaint = async (): Promise<void> => {
        if (clicked || this.ui.closed || this.stack[this.stack.length - 1] !== view) return;
        if (painting) return painting.then(repaint); // 一次畫一張，連續兩項讀好就排隊
        painting = (async () => {
          this.rerendering = true;
          const again = await Promise.resolve(view()).catch(() => "");
          this.rerendering = false;
          this.late = [];
          if (again && !clicked && this.stack[this.stack.length - 1] === view) await this.ui.render(again, -1).catch(() => {});
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

  errorView(e: unknown): string {
    const msg = String((e as Error)?.message || e);
    return (
      <Page title="出了點問題" onBack={() => this.back()}>
        <Empty icon="⚠️" text={msg} />
        <Button label="重試" onTap={() => {}} />
        <Button label="回首頁" kind="secondary" onTap={() => this.home()} />
      </Page>
    );
  }

  issuerQuery = ""; // 發行商頁的搜尋字
  /** 開某一家發行商歷年發行的片：歷年電影、全部年份、只看這一家、新的在前 */
  openIssuer(id: string) {
    this.movieMode = "year"; this.boxYears = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => String(2016 + i)); this.boxIssuer = [id]; this.boxCountry = []; this.boxStatus = ""; this.movieQuery = ""; this.sortBy.year = "date"; this.ascBy.year = false;
    this.go(() => this.movieListView(), `讀取${id}發行的片…`);
  }
  /** 發行商頁：管理收藏發行商的地方。上面是已經收藏的，下面是全部的發行商（2016 年至今、依發行的片數排），可以搜尋。
   *  點名稱看那一家歷年發行的片；點右邊的星號收藏或取消 */
  async issuerManageView(): Promise<string> {
    const allYears = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => String(2016 + i));
    const board = await loadMovieBoard({ scope: "year", sort: "total", years: allYears });
    const favs = this.settings.favIssuers || [];
    const isFav = (id: string) => favs.indexOf(id) >= 0;
    const toggle = (id: string) => { this.settings.favIssuers = isFav(id) ? favs.filter((z) => z !== id) : [...favs, id]; saveSettings(this.settings); };
    const count: Record<string, number> = {};
    for (const c of board.issuers) count[c.id] = c.count;
    const k = this.issuerQuery.trim().toLowerCase();
    const list = board.issuers.filter((c) => !k || c.id.toLowerCase().includes(k)).sort((a, b) => b.count - a.count);
    const MAX = 60; // 沒搜尋時先列片數最多的 60 家，其餘用搜尋找（全部有好幾百家）
    const shown = k ? list : list.slice(0, MAX);
    const row = (id: string) => <Item icon="🏢" title={id} subtitle={count[id] ? `2016 年至今發行 ${count[id]} 部` : "目前的資料裡沒有它發行的片"} onTap={() => this.openIssuer(id)} action={{ label: isFav(id) ? "★" : "☆", hint: isFav(id) ? "取消收藏這家發行商" : "收藏這家發行商", onTap: () => toggle(id) }} />;
    return (
      <Page title="收藏發行商" subtitle={favs.length ? `已收藏 ${favs.length} 家` : `共 ${board.issuers.length} 家發行商`} onBack={() => this.back()}>
        <Search value={this.issuerQuery} placeholder={`搜尋發行商（共 ${board.issuers.length} 家）`} onInput={(t) => { this.issuerQuery = t; }} />
        {k ? null : (
          <Section title={`已收藏（${favs.length}）`} hint={favs.length ? "點名稱看它歷年發行的片；點 ★ 取消收藏。" : "還沒有收藏。在下面的清單點 ☆ 就可以收藏，收藏的會出現在首頁。"}>
            {favs.map(row)}
          </Section>
        )}
        <Section title={k ? `符合「${this.issuerQuery.trim()}」的 ${list.length} 家` : `發行最多片的 ${shown.length} 家`} hint={k ? "" : list.length > MAX ? `其餘 ${list.length - MAX} 家可以用上面的搜尋找。發行商來自官方票房資料；聯合發行的片算第一家。` : "發行商來自官方票房資料；聯合發行的片算第一家。"}>
          {shown.map((c) => row(c.id))}
          {shown.length ? null : <Note text="找不到相符的發行商，換個關鍵字試試。" />}
        </Section>
      </Page>
    );
  }
  /** 清單裡的搜尋只找目前這一類：下面放一列，直接帶到首頁的全域搜尋（電影、影城一起找） */
  searchAllLink(q: string): string {
    return (
      <Section>
        <Item icon="🔎" title={`在全部電影和影城裡找「${q}」`} subtitle="現正上映、即將上映、歷年電影、影展、影城一起找" accent onTap={() => { this.homeQuery = q; this.switchTab("home"); }} />
      </Section>
    );
  }
  // ── 首頁 ──
  homeQuery = ""; // 首頁的全域搜尋
  gsJob: { q: string; job: Promise<GlobalHits> } | null = null; // 目前這個搜尋字的結果（重畫時不用再找一次）
  async homeView(): Promise<string> {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    this.calendarName = (await currentCalendar(this.settings)).title;
    const favs = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean) as Cinema[];
    // 收藏電影：收合時只顯示有幾部（不用讀資料）；展開才查每部片現在的狀態
    const favMovies = this.settings.favMovies || [];
    const favIssuers = this.settings.favIssuers || [];
    const favRows = this.favMovOpen && favMovies.length ? await favMovieRows(this.settings).catch(() => [] as FavRow[]) : [];
    const openFav = (r: FavRow) => this.openFavRow(r);
    // 全域搜尋：有打字就把下面的入口和收藏換成分組的結果（影城、現正上映、即將上映、歷年電影、影展），清空就恢復
    const q = this.homeQuery.trim();
    if (q) {
      // 歷年電影和影展片單第一次要下載（一兩秒）：超過 0.15 秒就先畫已經有的（影城），讀好再在原地補上。
      // 不能讓整頁換成「讀取中」，不然搜尋欄會不見、鍵盤會收起來
      if (!this.gsJob || this.gsJob.q !== q) this.gsJob = { q, job: globalSearch(q, this.cinemas) };
      const gs = this.gsJob.job;
      const got = await Promise.race([gs, sleep(this.rerendering ? 0 : 150).then(() => null)]);
      const pendingGs = !got;
      if (pendingGs) this.late = [gs];
      const k0 = q.toLowerCase().replace(/臺/g, "台");
      const hits: GlobalHits = got || { cinemas: this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k0)), now: [], soon: [], year: [], fest: [] };
      const total = hits.cinemas.length + hits.now.length + hits.soon.length + hits.year.length + hits.fest.length;
      const MAX = 5;
      const toMovies = (mode: "box" | "soon" | "year" | "fest") => {
        this.movieMode = mode;
        if (mode === "fest") { this.festQuery = q; this.festYear = hits.fest.length ? Number(hits.fest[0].f.start.slice(0, 4)) : 0; } else this.movieQuery = q;
        if (mode === "year") { this.boxYears = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => String(2016 + i)); this.boxIssuer = []; this.boxCountry = []; this.boxStatus = ""; this.sortBy.year = "date"; this.ascBy.year = false; }
        this.switchTab("movies");
      };
      const more = (n: number, unit: string, onTap: () => void) => (n > MAX ? <Item title={`看全部 ${n} ${unit}`} accent onTap={onTap} /> : null);
      return (
        <Page title="🎬 片刻" subtitle={pendingGs ? `正在找「${q}」…` : `「${q}」找到 ${total} 筆`}>
          <Search value={this.homeQuery} placeholder="搜尋電影、影城" onInput={(t) => { this.homeQuery = t; }} />
          {hits.cinemas.length ? (
            <Section title={`影城（${hits.cinemas.length}）`}>
              {hits.cinemas.slice(0, MAX).map((c) => this.cinemaItem(c))}
              {more(hits.cinemas.length, "間", () => { this.query = q; this.switchTab("cinemas"); })}
            </Section>
          ) : null}
          {hits.now.length ? (
            <Section title={`現正上映（${hits.now.length}）`}>
              {hits.now.slice(0, MAX).map((m) => <Item title={m.title} subtitle={movieLines(m).filter(Boolean).join("\n")} tag={{ text: "上映中", tone: "now" }} onTap={() => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)} />)}
              {more(hits.now.length, "部", () => toMovies("box"))}
            </Section>
          ) : null}
          {hits.soon.length ? (
            <Section title={`即將上映（${hits.soon.length}）`}>
              {hits.soon.slice(0, MAX).map((e) => <Item title={e.title} subtitle={e.lines.filter(Boolean).join("\n")} onTap={e.m ? () => this.go(() => this.movieView(e.m!, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u!), `讀取《${e.title}》…`) : undefined} />)}
              {more(hits.soon.length, "部", () => toMovies("soon"))}
            </Section>
          ) : null}
          {hits.year.length ? (
            <Section title={`歷年電影（${hits.year.length}）`}>
              {hits.year.slice(0, MAX).map((x) => <Item title={x.name} subtitle={[boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜")} tag={{ text: "已下檔", tone: "off" }} onTap={() => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`)} />)}
              {more(hits.year.length, "部", () => toMovies("year"))}
            </Section>
          ) : null}
          {hits.fest.length ? (
            <Section title={`影展（${hits.fest.length}）`}>
              {hits.fest.slice(0, MAX).map(({ f, film }) => <Item title={film.title} subtitle={`${f.start.slice(0, 4)} ${f.name}`} onTap={() => this.go(() => this.festivalFilmView(f, film))} />)}
              {more(hits.fest.length, "部", () => toMovies("fest"))}
            </Section>
          ) : null}
          {pendingGs ? <Note text="正在找電影…" /> : total ? null : <Empty icon="🔎" text="找不到相符的電影或影城，換個關鍵字試試。" />}
        </Page>
      );
    }
    return (
      <Page title="🎬 片刻" subtitle={`全台 ${this.cinemas.length} 間影城場次一次查`}>
        <Search value={this.homeQuery} placeholder="搜尋電影、影城" onInput={(t) => { this.homeQuery = t; }} />
        <Section>
          <Item icon="🕘" title="現在有什麼可以看" subtitle="依時段找收藏、附近或各縣市的場次" onTap={() => this.go(() => this.nowView())} />
          <Item icon="🎞️" title="依電影找場次" subtitle="先選電影，再看哪些影城有放映" onTap={() => this.go(() => this.movieListView(), "讀取電影清單…")} />
          <Item icon="🧭" title="附近的影城" subtitle="依目前位置排序" onTap={() => this.go(() => this.nearbyView(), "取得目前位置…")} />
          <Item icon="🎦" title="依縣市找影院" subtitle={`全台 ${this.cinemas.length} 間，也可以搜尋影城`} onTap={() => this.go(() => this.citiesView())} />
        </Section>
        {/* 三種收藏都固定顯示；還沒有收藏的，展開後是說明和一個直接帶過去的連結 */}
        {(
          <Section hint={this.favOpen && favs.length ? "在影城頁可以收藏或取消收藏影城。" : ""}>
            {/* 預設收合，只留這一列；點一下展開清單 */}
            <Item head icon="★" title={favs.length ? `收藏影城（${favs.length} 間）` : "收藏影城（還沒有）"} subtitle={this.favOpen ? "點一下收合" : "點一下展開"} chevron={false} onTap={() => { this.favOpen = !this.favOpen; }} action={{ label: this.favOpen ? "▾" : "▸", hint: this.favOpen ? "收合收藏影城" : "展開收藏影城", onTap: () => { this.favOpen = !this.favOpen; } }} />
            {(this.favOpen ? favs : []).map((c) => (
              <Item icon="★" title={c.name} subtitle={`${c.city} ${c.district}`} onTap={() => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)} />
            ))}
            {this.favOpen && !favs.length ? <Item icon="👉" title="去找影城來收藏" subtitle="在影城頁點「收藏這間影城」。收藏後可以從這裡直接進那間影城。" accent onTap={() => this.switchTab("cinemas")} /> : null}
          </Section>
        )}
        {(
          <Section hint={this.favIssOpen && favIssuers.length ? "點發行商看它歷年發行的片（新的在前）。要增減收藏：到「歷年電影」的發行商選單點星號。" : ""}>
            <Item head icon="★" title={favIssuers.length ? `收藏發行商（${favIssuers.length} 家）` : "收藏發行商（還沒有）"} subtitle={this.favIssOpen ? "點一下收合" : "點一下展開"} chevron={false} onTap={() => { this.favIssOpen = !this.favIssOpen; }} />
            {this.favIssOpen ? favIssuers.map((id) => (
              <Item icon="🏢" title={id} onTap={() => this.openIssuer(id)} />
            )) : null}
            {this.favIssOpen ? <Item icon={favIssuers.length ? "⚙️" : "👉"} title={favIssuers.length ? "管理收藏發行商" : "去選發行商來收藏"} subtitle={favIssuers.length ? "增加、取消收藏，或搜尋其他發行商" : "搜尋或從清單裡點星號（☆ 變 ★）。收藏後可以從這裡看它歷年發行的片。"} accent onTap={() => { this.issuerQuery = ""; this.go(() => this.issuerManageView(), "讀取發行商…"); }} /> : null}
          </Section>
        )}
        {(
          <Section hint={this.favMovOpen && favMovies.length ? "在電影頁的預告按鈕旁邊點愛心加入，再點一次取消。下檔的片也會留在這裡。" : ""}>
            {/* 預設收合，只留這一列；點一下展開清單 */}
            <Item head icon="♥" title={favMovies.length ? `收藏電影（${favMovies.length} 部）` : "收藏電影（還沒有）"} subtitle={this.favMovOpen ? "點一下收合" : "點一下展開"} chevron={false} onTap={() => { this.favMovOpen = !this.favMovOpen; }} action={{ label: this.favMovOpen ? "▾" : "▸", hint: this.favMovOpen ? "收合收藏電影" : "展開收藏電影", onTap: () => { this.favMovOpen = !this.favMovOpen; } }} />
            {favRows.map((r) => (
              <Item thumb={{ src: r.fav.poster ? posterSrc(r.fav.poster) : "", url: r.fav.poster }} title={r.fav.title} subtitle={r.line} onTap={() => openFav(r)} />
            ))}
            {this.favMovOpen && !favMovies.length ? <Item icon="👉" title="去找電影來收藏" subtitle="在電影頁點預告按鈕旁的愛心（♡ 變 ♥）。收藏後這裡看得到每部片的狀態。" accent onTap={() => { this.movieMode = "box"; this.switchTab("movies"); }} /> : null}
          </Section>
        )}
        {this.installEntry()}
        {await this.versionNote()}
      </Page>
    );
  }

  // ── 設定 ──
  // ── 用 Google 登入同步設定（網頁版）──
  syncNote = ""; // 同步那一組下方的一句話（剛登入、登入失敗…）
  syncMute = false; // 正在套用伺服器的設定：這次存檔不要再傳回去
  syncTimer: any = null;
  sync(): any { return IS_WEB ? (globalThis as any).__sync : null; }
  /** 開啟時：剛從 Google 登入回來就把兩邊的設定合起來；已經登入的話，伺服器上的比較新就套用過來。之後每次存設定都自動上傳 */
  async syncStart(): Promise<void> {
    const sy = this.sync();
    if (!sy) return;
    setSettingsSavedHook(() => {
      if (this.syncMute || !sy.on()) return;
      const G = globalThis as any;
      G.clearTimeout(this.syncTimer);
      this.syncTimer = G.setTimeout(() => { sy.push(syncPick(this.settings)).catch(() => false); }, 1200);
    });
    const applyLocal = (next: Settings) => { this.syncMute = true; this.settings = next; saveSettings(next); this.syncMute = false; };
    const fin: string = await sy.finish();
    if (fin === "fail") { this.syncNote = "登入沒有完成，請再試一次。"; return; }
    if (fin === "ok") {
      const r = await sy.pull();
      if (r && r.data) applyLocal(syncMerge(this.settings, r.data as Partial<SyncData>));
      await sy.push(syncPick(this.settings));
      this.syncNote = r && r.data ? "已登入，這台和帳號裡的收藏已經合在一起。" : "已登入，這台的設定已經存到帳號裡。";
      return;
    }
    if (!sy.on()) return;
    const r = await Promise.race([sy.pull(), sleep(2500).then(() => null)]);
    if (r && r.data && r.at > sy.at()) { applyLocal(syncApply(this.settings, r.data as Partial<SyncData>)); sy.setAt(r.at); }
  }
  /** 設定頁的一列：點進去才是登入、同步、登出這些選項 */
  syncLink(): string {
    const sy = this.sync();
    if (!sy) return "";
    return (
      <Section title="同步">
        <Item icon="🔄" title="用 Google 帳號同步" subtitle={sy.on() ? "收藏和設定有變動會自動同步" : "讓主畫面的 App 和瀏覽器用同一份收藏"} right={sy.on() ? "已登入" : "未登入"} onTap={() => this.go(() => this.syncView())} />
      </Section>
    );
  }
  syncView(): string {
    return (
      <Page title="用 Google 帳號同步" onBack={() => this.back()}>
        {this.syncSection()}
      </Page>
    );
  }
  syncSection(): string {
    const sy = this.sync();
    if (!sy) return "";
    if (!sy.on())
      return (
        <Section hint={this.syncNote || "登入後，收藏影城、收藏電影、收藏發行商和各項設定會存到你的帳號，在別的裝置或瀏覽器登入同一個帳號就會帶過來。我們只存帳號的識別碼（經過雜湊）和設定，不存 email 和姓名。不登入也能照常使用。"}>
          <Item icon="🔄" title="用 Google 登入來同步" subtitle="例如讓主畫面的 App 和 Safari 用同一份收藏" accent onTap={() => sy.login()} />
        </Section>
      );
    return (
      <Section hint={this.syncNote || "已登入 Google，設定有變動會自動同步。通知要在每台裝置各自開啟。"}>
        <Item icon="✅" title="已登入，自動同步中" subtitle="點一下立刻同步一次" chevron={false} onTap={async () => {
          const r = await sy.pull();
          if (r && r.data && r.at > sy.at()) { this.syncMute = true; this.settings = syncApply(this.settings, r.data as Partial<SyncData>); saveSettings(this.settings); this.syncMute = false; sy.setAt(r.at); this.pushSync(); await this.ui.toast("已帶入帳號裡比較新的設定"); }
          else await this.ui.toast((await sy.push(syncPick(this.settings))) ? "已同步" : "同步失敗，請稍後再試");
        }} />
        <Item icon="🚪" title="登出" subtitle="這台的收藏會留著，只是不再同步" chevron={false} onTap={async () => { await sy.logout(); this.syncNote = ""; await this.ui.toast("已登出"); }} />
        <Item icon="🗑" title="刪除帳號裡的資料並登出" subtitle="伺服器上的設定會刪掉，所有裝置都會登出；這台的收藏會留著" chevron={false} onTap={async () => { await sy.wipe(); this.syncNote = ""; await this.ui.toast("已刪除並登出"); }} />
      </Section>
    );
  }
  notifyOpen = false; // 設定頁「算哪些影城」的選項有沒有展開
  /** 網頁版的通知介面（web/shim.ts 的 __push）；Scriptable 版沒有 */
  push(): any { return IS_WEB ? (globalThis as any).__push : null; }
  /** 收藏或通知種類變了：把最新的清單同步給通知伺服器（沒開通知時什麼都不做） */
  pushSync(): void {
    const p = this.push();
    if (p) p.sync(notifyPayload(this.settings)).catch(() => null);
  }
  /** 設定頁的「收藏電影通知」：依裝置的狀況顯示開啟按鈕、各種通知的開關，或說明為什麼不能用 */
  /** 設定頁的一列：點進去才是完整的通知設定 */
  async notifyLink(): Promise<string> {
    const p = this.push();
    if (!p) return "";
    const state: string = await p.refresh().catch(() => "unsupported");
    const prefs = notifyPrefs(this.settings);
    const on = NOTIFY_KINDS.filter((k) => prefs[k.id]).map((k) => k.label.replace(/時$/, ""));
    const note = state === "on" ? (on.length ? (on.length > 3 ? `${on.slice(0, 3).join("、")}等 ${on.length} 種` : on.join("、")) : "每一種通知都關著") : state === "needs-install" ? "要先把「片刻」加到主畫面" : state === "unsupported" ? "這個瀏覽器不支援" : state === "denied" ? "系統設定裡沒有允許通知" : "開放場次、上映、快下檔、影展開始時通知你";
    return (
      <Section title="通知">
        <Item icon={state === "on" ? "🔔" : "🔕"} title="收藏電影通知" subtitle={note} right={state === "on" ? "已開啟" : "未開啟"} onTap={() => this.go(() => this.notifyView())} />
      </Section>
    );
  }
  /** 收藏的一部片：依它現在的狀態開對的頁面（有場次的電影頁、即將上映、影展片、票房資訊） */
  openFavRow(r: FavRow) {
    const t = r.target;
    if (t.kind === "movie") this.go(() => this.movieView(t.m, ""), `讀取《${t.m.title}》的放映影城…`);
    else if (t.kind === "soon") this.go(() => this.soonMovieView(t.u), `讀取《${t.u.title}》…`);
    else if (t.kind === "fest") this.go(() => this.festivalFilmView(t.f, t.film));
    else if (t.kind === "box") this.go(() => this.boxMovieView(t.x), `讀取《${t.x.name}》…`);
    else this.go(() => this.favMovieView(r.fav), `讀取《${r.fav.title}》…`);
  }
  /** 最近的通知：這台裝置收過的（存在裝置上，最多 50 則、30 天），新的在前；點了開那部片 */
  async notifyLogView(): Promise<string> {
    const p = this.push();
    const list: { at: number; title: string; body: string; tag: string; url: string }[] = p && p.log ? await p.log().catch(() => []) : [];
    const favs = this.settings.favMovies || [];
    const today = todayTPE();
    const when = (at: number) => {
      const d = new Date(at + 8 * 3600e3), day = d.toISOString().slice(0, 10), hm = d.toISOString().slice(11, 16);
      return day === today ? `今天 ${hm}` : `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))} ${hm}`;
    };
    const open = async (e: { tag: string }) => {
      const kind = e.tag.split(":")[0], key = e.tag.slice(kind.length + 1);
      if (kind === "week") { this.movieMode = "soon"; return this.switchTab("movies"); }
      if (kind === "flist") { this.movieMode = "fest"; return this.switchTab("movies"); }
      const fav = favs.find((f) => f.key === key);
      if (!fav) return void (await this.ui.toast(kind === "test" ? "這是測試通知" : "這部片已經不在收藏裡了"));
      const row = (await favMovieRows(this.settings).catch(() => [] as FavRow[])).find((r) => r.fav.key === key);
      if (row) this.openFavRow(row); else this.go(() => this.favMovieView(fav), `讀取《${fav.title}》…`);
    };
    return (
      <Page title="最近的通知" subtitle={list.length ? `${list.length} 則` : ""} onBack={() => this.back()}>
        {list.length ? (
          <Section hint="只保留這台裝置最近 30 天收到的通知（最多 50 則），存在裝置上、不會傳到伺服器。">
            {list.map((e) => {
              const fav = favs.find((f) => f.key === e.tag.slice(e.tag.indexOf(":") + 1));
              return <Item thumb={fav ? { src: fav.poster ? posterSrc(fav.poster) : "", url: fav.poster } : undefined} icon={fav ? undefined : e.tag.startsWith("week") ? "🗓" : e.tag.startsWith("flist") ? "🎪" : "🔔"} title={e.title} subtitle={[e.body, when(e.at)].filter(Boolean).join("\n")} onTap={() => open(e)} />;
            })}
            <Item icon="🗑" title="清除紀錄" chevron={false} onTap={async () => { await p.clearLog(); await this.ui.toast("已清除"); }} />
          </Section>
        ) : <Empty icon="🔔" text="還沒有收到通知。之後收到的會列在這裡。" />}
      </Page>
    );
  }
  async notifyView(): Promise<string> {
    const p = this.push();
    const logCount = p && p.log && p.state() === "on" ? (await p.log().catch(() => [])).length : -1;
    return (
      <Page title="收藏電影通知" onBack={() => this.back()}>
        {logCount >= 0 ? (
          <Section>
            <Item icon="🕘" title="最近的通知" right={logCount ? `${logCount} 則` : "還沒有"} onTap={() => this.go(() => this.notifyLogView())} />
          </Section>
        ) : null}
        {await this.notifySection()}
      </Page>
    );
  }
  async notifySection(): Promise<string> {
    const p = this.push();
    if (!p) return "";
    const state: string = await p.refresh().catch(() => "unsupported");
    const prefs = notifyPrefs(this.settings);
    const n = (this.settings.favMovies || []).length;
    if (state === "needs-install")
      return (
        <Section title="收藏電影通知" hint="iPhone 和 iPad 要先把「片刻」加到主畫面，從主畫面的圖示開啟後，才能開啟通知（這是 iOS 的規定）。">
          <Item icon="🔔" title="先加到主畫面" subtitle="收藏電影開放場次、上映、快下檔時通知你" onTap={() => this.go(() => this.installView())} />
        </Section>
      );
    if (state === "unsupported")
      return (
        <Section title="收藏電影通知">
          <Item icon="🔕" title="這個瀏覽器不支援通知" subtitle="可以改用 Safari（iPhone 要加到主畫面）、Chrome 或 Edge" chevron={false} />
        </Section>
      );
    if (state === "denied")
      return (
        <Section title="收藏電影通知" hint="到手機或瀏覽器的設定，把「片刻」的「通知」改成允許，再回來這裡開啟。">
          <Item icon="🔕" title="通知被關掉了" subtitle="系統設定裡沒有允許「片刻」發通知" chevron={false} />
        </Section>
      );
    if (state !== "on")
      return (
        <Section title="收藏電影通知" hint="開啟後，你收藏的片名會存在我們的伺服器上，用來判斷什麼時候通知你；不需要帳號，也不會記錄你是誰。隨時可以關閉，關閉時伺服器上的資料會一起刪掉。">
          <Item icon="🔔" title="收藏電影有動態時通知我" subtitle={n ? `目前收藏了 ${n} 部：開放場次、上映、快下檔、影展開始時通知` : "開放場次、上映、快下檔、影展開始時通知。先開著，之後收藏的片都會算進去"} chevron={false} />
          <button class="btn primary" data-perm="notify" onTap={async () => {
            try {
              const st = await p.enable(notifyPayload(this.settings));
              await this.ui.toast(st === "on" ? "通知已開啟" : st === "denied" ? "沒有取得通知的權限" : "沒有開啟通知");
            } catch (e) { await this.ui.toast(String((e as Error)?.message || "開啟失敗，請稍後再試")); }
          }}>開啟通知</button>
        </Section>
      );
    const set = (patch: Partial<NotifyPrefs>) => { this.settings.notify = { ...prefs, ...patch }; saveSettings(this.settings); this.pushSync(); };
    const toggle = (id: NotifyKind) => {
      // 特殊廳第一次打開：先預設 IMAX，使用者再自己調
      if (id === "fmt" && !prefs.fmt && !(prefs.fmts || []).length) return set({ fmt: true, fmts: ["IMAX"] });
      set({ [id]: !prefs[id] });
    };
    const fmts = prefs.fmts || [], preDays = prefs.preDays || 3, quiet = notifyQuiet(prefs);
    const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
    const hours = Array.from({ length: 24 }, (_, h) => ({ id: String(h), label: hh(h) }));
    const noteOf = (k: { id: NotifyKind; note: string }) =>
      k.id === "end" ? endNote : k.id === "pre" ? `上映前 ${preDays} 天提醒一次` : k.id === "fmt" ? (fmts.length ? `${fmts.join("、")} 開始有場次` : k.note) : k.id === "favc" ? `${k.note}；目前收藏 ${this.settings.favorites.length} 間` : k.note;
    const row = (k: (typeof NOTIFY_KINDS)[number]) => <Item icon={prefs[k.id] ? "✅" : "⬜️"} title={k.label} subtitle={noteOf(k)} chevron={false} onTap={() => toggle(k.id)} />;
    // 快下檔的細項：剩下幾間以下、算哪些影城（全台／指定縣市，可複選／收藏影城）
    const max = prefs.endMax || 3;
    const pick = notifyEndPick(prefs);
    const picked = pick.cities;
    const pickSet = (fav: boolean, cs: string[]) => set({ endFav: fav, endCities: cs, endScope: undefined });
    if (!this.cinemas.length) this.cinemas = await loadCinemas().catch(() => [] as Cinema[]);
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99));
    const endNote = `${pick.fav && !picked.length ? "你收藏的影城裡" : notifyEndScope(prefs) + "合計"}，還在放映的影城從比較多變成剩下 ${max} 間以下`;
    return (
      <>
        <Section title="收藏電影有動態時" hint="點一下開或關。">
          {NOTIFY_KINDS.filter((k) => k.group === "fav").map(row)}
        </Section>
        {prefs.pre ? (
          <Section title="上映前提醒">
            <Item kv title="幾天前提醒" right={`${preDays} 天前 ⇄`} chevron={false} onTap={() => set({ preDays: NOTIFY_PRE_STEPS[(NOTIFY_PRE_STEPS.indexOf(preDays) + 1) % NOTIFY_PRE_STEPS.length] })} />
          </Section>
        ) : null}
        {prefs.fmt ? (
          <Section title="特殊廳" hint="可以選好幾種；可以左右滑動。只看連鎖影城今天和明天的場次。">
            <Chips scroll>
              {FORMATS.map((f) => <Chip label={f} muted={fmts.indexOf(f) < 0} onTap={() => set({ fmts: fmts.indexOf(f) < 0 ? [...fmts, f] : fmts.filter((z) => z !== f) })} />)}
            </Chips>
          </Section>
        ) : null}
        {prefs.end ? (
          <Section title="快下檔的條件" hint={this.notifyOpen ? "收藏影城和縣市可以一起選、縣市可以選好幾個，合起來算；可以左右滑動" : ""}>
            <Item kv title="剩下幾間以下" right={`${max} 間以下 ✎`} chevron={false} onTap={async () => {
              // 通知只有網頁版有：直接用瀏覽器的輸入框填數字
              const ask = (globalThis as any).prompt;
              const raw = typeof ask === "function" ? ask("放映的影城剩下幾間以下時通知？（1 到 30）", String(max)) : null;
              if (raw === null || raw === undefined) return;
              const n = Math.round(Number(String(raw).replace(/[０-９]/g, (c) => String(c.charCodeAt(0) - 0xff10)).trim()));
              if (!(n >= 1 && n <= 30)) return void (await this.ui.toast("請輸入 1 到 30 的數字"));
              set({ endMax: n });
            }} />
            <Item kv title="算哪些影城" right={`${notifyEndScope(prefs)} ${this.notifyOpen ? "▾" : "▸"}`} chevron={false} onTap={() => { this.notifyOpen = !this.notifyOpen; }} />
            {this.notifyOpen ? (
              <Chips scroll>
            <Chip label="全台" muted={pick.fav || picked.length > 0} onTap={() => pickSet(false, [])} />
                <Chip label="收藏影城" sub={`${this.settings.favorites.length} 間`} muted={!pick.fav} onTap={() => pickSet(!pick.fav, picked)} />
                {cities.map((c) => <Chip label={c} muted={picked.indexOf(c) < 0} onTap={() => pickSet(pick.fav, picked.indexOf(c) < 0 ? [...picked, c] : picked.filter((z) => z !== c))} />)}
              </Chips>
            ) : null}
          </Section>
        ) : null}
        <Section title="不用收藏也會通知" hint="預設關閉，想要再打開。">
          {NOTIFY_KINDS.filter((k) => k.group === "all").map(row)}
        </Section>
        <Section title="勿擾時段" hint={quiet.on ? `${hh(quiet.from)} 到${quiet.from > quiet.to ? "隔天" : ""} ${hh(quiet.to)} 不發通知，這段時間的通知留到之後再發。` : "任何時間都可能發通知。"}>
          <Item icon={quiet.on ? "✅" : "⬜️"} title="晚上不要通知我" chevron={false} onTap={() => set({ quietOn: !quiet.on })} />
          {quiet.on ? <PickRow title="開始" name="qfrom" value={String(quiet.from)} options={hours} onPick={(v) => set({ quietFrom: Number(v) })} /> : null}
          {quiet.on ? <PickRow title="結束" name="qto" value={String(quiet.to)} options={hours} onPick={(v) => set({ quietTo: Number(v) })} /> : null}
        </Section>
        <Section hint={`已開啟${n ? `，目前收藏了 ${n} 部` : "；還沒有收藏的電影，到電影頁點愛心收藏"}。你收藏的片名存在我們的伺服器上，只用來判斷什麼時候通知；關閉通知時會一起刪掉。`}>
          <Item icon="📨" title="傳一則測試通知" subtitle="確認這台裝置收得到" chevron={false} onTap={async () => { await this.ui.toast((await p.test()) ? "已送出，幾秒內應該會收到" : "送不出去，請關閉通知後重新開啟"); }} />
          <Item icon="🔕" title="關閉通知" subtitle="停止通知，並刪除伺服器上的資料" chevron={false} onTap={async () => { await p.disable(); await this.ui.toast("通知已關閉"); }} />
        </Section>
      </>
    );
  }
  /** 有沒有還沒看過的更新內容（設定分頁和那一列的小紅點） */
  logUnread(): boolean { return !!CHANGELOG_LATEST && this.settings.seenLog !== CHANGELOG_LATEST; }
  /** 更新內容：依日期分段、新的在上。進來就算看過，紅點消失；不會主動跳出來打擾 */
  changelogView(): string {
    if (this.logUnread()) { this.settings.seenLog = CHANGELOG_LATEST; saveSettings(this.settings); }
    return (
      <Page title="更新內容" subtitle={`目前版本 ${APP_VERSION}`} onBack={() => this.back()}>
        {CHANGELOG.map((e) => (
          <Section title={e.date}>
            {e.items.map((it) => <Item title={it.text} tag={{ text: it.kind === "new" ? "新功能" : "改進", tone: it.kind === "new" ? "now" : "soon" }} chevron={false} />)}
          </Section>
        ))}
        <Note text="只列出比較有感的變動；修小錯、調整文字這類不會寫在這裡。" />
      </Page>
    );
  }
  async aboutView(): Promise<string> {
    return (
      <Page title="關於" onBack={() => this.back()}>
        <Section hint="連鎖影城的場次來自場次通（twshowtimes.com），感謝場次通的整理；其他來自開眼電影網，以及誠品、光點、樂聲、內惟戲院官網。實際場次以影城公告為準。">
          <Item icon="ℹ️" title="關於與資料來源" accent chevron={false} onTap={() => Safari.open(ABOUT_URL)} />
          <Item icon="🔒" title="隱私權政策" accent chevron={false} onTap={() => Safari.open(PRIVACY_URL)} />
          <Item icon="🙏" title="前往場次通" subtitle="比較各影城場次、看上映場數排行" accent chevron={false} onTap={() => Safari.open("https://twshowtimes.com/")} />
        </Section>
      </Page>
    );
  }
  async settingsView(): Promise<string> {
    this.calendarName = (await currentCalendar(this.settings)).title;
    return (
      <Page title="設定">
        <Section title="加入行事曆時" hint={`廣告預告：${ADS_NOTE}`}>
          <Item icon="📅" title="寫入的行事曆" subtitle={this.calendarName} onTap={() => this.go(() => this.calendarView())} />
          <Item icon="📺" title="廣告預告" subtitle={`預計散場時間會加上 ${this.settings.ads} 分鐘`} right="點一下切換" chevron={false} onTap={() => this.cycleAds()} />
          <Item icon="🗺" title="導航地圖" subtitle="點地址、分享、行程備註的導航連結" right={MAPS_LABEL[this.settings.maps || "apple"]} chevron={false} onTap={() => {
            this.settings.maps = this.settings.maps === "google" ? "apple" : "google";
            saveSettings(this.settings);
          }} />
        </Section>
        <Section title="收藏">
          <Item icon="🏢" title="收藏發行商" subtitle="搜尋發行商、增加或取消收藏" right={(this.settings.favIssuers || []).length ? `${(this.settings.favIssuers || []).length} 家` : "還沒有"} onTap={() => { this.issuerQuery = ""; this.go(() => this.issuerManageView(), "讀取發行商…"); }} />
        </Section>
        {await this.notifyLink()}
        {this.syncLink()}
        <Section title="關於">
          {IS_WEB && !this.isStandalone() ? <Item icon="📲" title="加到主畫面" subtitle="像 App 一樣從主畫面開啟，看圖示教學" onTap={() => this.go(() => this.installView())} /> : null}
          <Item icon="ℹ️" title="關於" subtitle="資料來源、隱私權政策、場次通" onTap={() => this.go(() => this.aboutView())} />
          <Item icon="📝" title="更新內容" subtitle={this.logUnread() ? "有新的更新，點進來看看" : "最近改了什麼、多了什麼"} right={this.logUnread() ? "● 新" : ""} onTap={() => this.go(() => this.changelogView())} />
        </Section>
        <p
          class="note version"
          onTap={async () => {
            Pasteboard.copy(`版本 ${APP_VERSION}`);
            await this.ui.toast("已複製版本號");
          }}
        >
          {`版本 ${APP_VERSION}`}（點一下複製）
        </p>
        {await this.versionNote()}
      </Page>
    );
  }

  // ── 依縣市找影院 ──
  // 搜尋欄直接放在這一頁最上面：有打字就即時顯示符合的影城（不另開一頁），清空就回到縣市清單
  query = "";
  citiesView(): string {
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const k = this.query.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k
      ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k))
      : [];
    return (
      <Page title="依縣市找影院" subtitle={k ? `符合「${this.query.trim()}」的 ${hits.length} 間` : `全台 ${this.cinemas.length} 間`} onBack={() => this.back()}>
        <Search value={this.query} placeholder="搜尋影城，例如：松仁、西門、in89、台南" onInput={(t) => { this.query = t; }} />
        {k ? (
          <Section title={`結果 ${hits.length} 間`}>
            {hits.length ? null : <Note text="找不到相符的影城，換個關鍵字試試。" />}
            {hits.map((c) => this.cinemaItem(c))}
          </Section>
        ) : (
          <Section title="縣市" hint="影城清單來自場次通與開眼電影網，會自動更新。">
            {cities.map((city) => (
              <Item title={city} badge={`${this.cinemas.filter((c) => c.city === city).length} 間`} onTap={() => this.go(() => this.cityView(city))} />
            ))}
          </Section>
        )}
      </Page>
    );
  }

  cinemaItem(c: Cinema): string {
    return (
      <Item
        icon={this.settings.favorites.indexOf(c.id) >= 0 ? "★" : undefined}
        title={c.name}
        subtitle={`${c.city} ${c.district}`}
        onTap={() => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)}
      />
    );
  }

  cityView(city: string): string {
    const list = this.cinemas.filter((c) => c.city === city);
    return (
      <Page title={city} subtitle={`${list.length} 間`} onBack={() => this.back()}>
        <Section>{list.map((c) => this.cinemaItem(c))}</Section>
      </Page>
    );
  }

  // ── 設定 ──
  async calendarView(): Promise<string> {
    const cals = (await Calendar.forEvents()).filter((c) => c.allowsContentModifications);
    return (
      <Page title="寫入的行事曆" onBack={() => this.back()}>
        <Section hint="只列出可以新增行程的行事曆。">
          {cals.map((c) => (
            <Item
              title={c.title}
              right={c.title === this.calendarName ? "✓ 目前使用" : ""}
              chevron={false}
              onTap={() => {
                this.settings.calendar = c.title;
                this.calendarName = c.title;
                saveSettings(this.settings);
                this.back();
              }}
            />
          ))}
        </Section>
      </Page>
    );
  }

  cycleAds() {
    const i = AD_STEPS.indexOf(this.settings.ads);
    this.settings.ads = AD_STEPS[(i + 1) % AD_STEPS.length];
    saveSettings(this.settings);
  }

  toggleFav(c: Cinema) {
    const f = this.settings.favorites;
    const i = f.indexOf(c.id);
    if (i >= 0) f.splice(i, 1);
    else f.push(c.id);
    saveSettings(this.settings);
    this.pushSync(); // 「快下檔」的範圍選收藏影城時，名單要跟著更新
  }

  // ── 影城：選日期 ──
  async cinemaView(c: Cinema): Promise<string> {
    const { dates, address, notice, site } = await datesOf(c);
    const fav = this.settings.favorites.indexOf(c.id) >= 0;
    return (
      <Page title={c.name} subtitle={`${c.city} ${c.district}`} onBack={() => this.back()}>
        {address ? <Section>{this.addressItem(c.name, address)}</Section> : null}
        <Section title="選擇日期">
          {dates.length ? null : <Empty icon="🗓" text="目前沒有公布的場次" />}
          {dates.map((d) => (
            <Item title={dateLabel(d)} onTap={() => this.go(() => this.moviesView(c, d), `讀取 ${dateLabel(d)} 的片單…`)} />
          ))}
        </Section>
        {notice ? <Note kind="warn" text={notice} /> : null}
        <Section>
          <Item icon={fav ? "★" : "☆"} title={fav ? "取消收藏影城" : "收藏這間影城"} chevron={false} onTap={() => this.toggleFav(c)} />
          {site ? <Item icon="🏠" title="影城官網（訂票）" subtitle={site.replace(/^https?:\/\//, "").replace(/\/.*$/, "")} chevron={false} accent onTap={() => Safari.open(site)} /> : null}
          {site !== c.url ? <Item icon="🌐" title={c.source === "at" ? "以瀏覽器開啟開眼時刻表" : "以瀏覽器開啟場次通時刻表"} chevron={false} accent onTap={() => Safari.open(c.url)} /> : null}
        </Section>
      </Page>
    );
  }

  // ── 電影列表 ──
  async moviesView(c: Cinema, date: string): Promise<string> {
    const r = await moviesOf(c, date);
    prefetchPosters(r.movies); // 背景先抓海報，進電影頁就不用等
    const isToday = date === todayTPE();
    const now = nowHM();
    return (
      <Page title={dateLabel(date)} subtitle={`${c.name}｜${r.movies.length} 部電影`} onBack={() => this.back()}>
        <Section>
          {r.movies.length ? null : <Empty icon="🎞" text="這天沒有可讀取的場次" />}
          {r.movies.map((m) => {
            const all = ([] as string[]).concat(...m.versions.map((v) => v.times));
            const left = isToday ? all.filter((t) => t > now || lateIsTonight(c.source, t)).length : all.length;
            const ended = isToday && left === 0;
            const sub = [m.runtime ? `${m.runtime} 分` : "片長未提供", m.rating, m.versions.map((v) => `${v.label} ${v.times.length} 場`).join("、")]
              .filter(Boolean)
              .join("｜");
            return (
              <Item
                title={m.title}
                subtitle={sub}
                badge={ended ? "已結束" : isToday ? `剩 ${left} 場` : undefined}
                muted={ended}
                onTap={() => this.go(() => this.timesView(c, date, m, r))}
              />
            );
          })}
        </Section>
      </Page>
    );
  }

  /** 地址列：點一下導航、長按複製 */
  addressItem(name: string, address: string, title?: string): string {
    return (
      <Item
        icon="📍"
        title={title || address}
        subtitle={title ? address + "\n點一下導航・長按複製地址" : "點一下導航・長按複製地址"}
        chevron={false}
        onTap={() => Safari.open(mapsUrl(name, address, this.settings.maps))}
        onLongPress={async () => {
          Pasteboard.copy(address);
          await this.ui.toast("已複製地址");
        }}
      />
    );
  }

  /** 讀好後要在原位補畫的資料（海報、評分、預告），每一項各自觸發一次補畫 */
  late: Promise<unknown>[] = [];
  /** 正在補畫：只用已經讀好的資料，不再等 */
  rerendering = false;

  /** 來源沒給片長時，自動查 TMDB／開眼補上（最多等 wait 毫秒，沒好就之後補畫）；回傳查到的片長 */
  async fillRuntime(m: { title: string; runtime: number; runtimeFrom?: string; slug?: string; en?: string }, wait = 2500): Promise<number> {
    if (m.runtime) return m.runtime;
    const job = foregroundTask(
      movieRuntime(m.title, m.slug, m.en)
        .then((r) => {
          if (r && !m.runtime) {
            m.runtime = r.runtime;
            m.runtimeFrom = r.from;
          }
        })
        .catch(() => {})
    );
    await Promise.race([job, sleep(this.rerendering ? 0 : wait)]);
    if (!m.runtime) this.late.push(job);
    return m.runtime;
  }

  /** 海報、預告與評分：最多等 0.4 秒就先畫頁面（有快取的會直接出現），其餘讀好後各自補上。海報網址另外快查（不等預告） */
  async extras(title: string, slug?: string, en?: string): Promise<Extras> {
    const px = foregroundTask(movieExtras(title, slug).catch(() => null));
    const pr = foregroundTask(movieRatings(title, en, slug).catch(() => null));
    const pp = foregroundTask(moviePoster(title, slug, en).catch(() => ""));
    // 片刻評分：剛投過票或 5 秒內讀過就直接用；失敗回傳 false（顯示讀不到）
    const pc = communityStats(title).catch(() => false as const);
    const wait = this.rerendering ? 0 : 400;
    const quick = <T,>(p: Promise<T>) => Promise.race([p, sleep(wait).then(() => undefined)]);
    const [x, r, p, c] = await Promise.all([quick(px), quick(pr), quick(pp), quick(pc)]);
    const loading = x === undefined || r === undefined || p === undefined;
    const late = [x === undefined ? px : null, r === undefined ? pr : null, p === undefined ? pp : null, c === undefined ? pc : null].filter(Boolean) as Promise<unknown>[];
    if (late.length) this.late = late;
    return { x: x ?? null, r: r ?? null, p: p || "", px, loading, c: c === undefined ? communityCached(title) || undefined : c };
  }

  /** 片刻評分卡片：平均、人數、分布，以及「你的評分」一排 1～10 的格子（點已選的那一格可以取消） */
  community(title: string, c: Community | false | undefined): string {
    const n = c ? c.n : 0;
    const avg = c && n ? c.avg : 0;
    const mine = c ? c.mine : 0;
    const status = c === undefined ? "讀取中…" : c === false ? "片刻評分暫時讀不到" : n ? `${n} 人評分` : "還沒有人評分，來當第一個";
    const max = c ? Math.max(1, ...c.dist) : 1;
    const vote = async (s: number) => {
      try {
        await communityVote(title, s === mine ? 0 : s);
        await this.ui.toast(s === mine ? "已取消你的評分" : `已送出 ${s} 分`);
      } catch (e) {
        await this.ui.toast(String((e as Error)?.message || e));
      }
    };
    // 平均分數的色塊跟 IMDb 同一套（綠／黃／紅）；分布縮成一個小長條圖；自己的評分是一排 1～10 的格子，選幾分就亮到幾分
    const tier = n ? ratingTier("imdb", avg) : "none";
    return (
      <Section title="片刻評分" hint="匿名評分，一台裝置一票，可以隨時更改；再點一次已選的分數可以取消。各版本的評分會一起統計。">
        <div class="cm">
          {n ? (
            <div class="cm-top">
              <div class={"cm-avg " + tier} aria-label={`平均 ${avg.toFixed(1)} 分，滿分 10 分`}>{avg.toFixed(1)}<small>／10</small></div>
              <div class="cm-meta">
                <span class="cm-n">{esc(status)}</span>
                <span class="cm-by">片刻使用者的評分</span>
              </div>
              {c ? (
                <div class="cm-hist" aria-hidden="true">
                  <div class="bars">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => <i class={c.dist[v - 1] ? "" : "zero"} style={`height:${Math.max(8, Math.round(((c.dist[v - 1] || 0) / max) * 100))}%`} />)}</div>
                  <div class="axis"><span>1</span><span>10</span></div>
                </div>
              ) : null}
            </div>
          ) : (
            <div class="cm-empty">{esc(status)}</div>
          )}
          <div class={"cm-mine" + (n ? " line" : "")}>
            <span>你的評分</span>
            {mine ? <b>{mine} 分</b> : <em>點一個分數</em>}
          </div>
          <div class="cm-pick">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
              <button class={"cm-num" + (v <= mine ? " on" : "")} aria-label={`${v} 分`} aria-pressed={v === mine ? "true" : "false"} onTap={() => vote(v)}>
                {v}
              </button>
            ))}
          </div>
          <div class="cm-ends"><span>不推薦</span><span>必看</span></div>
        </div>
      </Section>
    );
  }

  /** 海報旁邊那顆收藏的愛心：電影頁、影展片、即將上映、已下檔的片都用同一顆 */
  favOf(m: { title: string; en?: string; poster?: string; fest?: FavMovie["fest"] }): { on: boolean; onTap: () => void } {
    return { on: isFavMovie(this.settings, m.title), onTap: () => {
      const on = toggleFavMovie(this.settings, m);
      saveSettings(this.settings);
      this.pushSync(); // 有開通知的話，把最新的收藏清單同步過去
      const p = this.push();
      this.ui.toast(!on ? "已取消收藏" : p && p.state() === "on" ? "已收藏，有動態會通知你" : p && (p.state() === "off" || p.state() === "needs-install") ? "已收藏。到「設定」可以開啟通知" : "已收藏，在首頁可以快速打開");
    } };
  }
  /** 收藏的片目前哪裡都沒有場次：票房排行（2016 年至今）找得到就開那一頁；找不到就只顯示海報、評分、預告 */
  async favMovieView(fav: FavMovie): Promise<string> {
    const x = await favMovieBox(fav);
    if (x) return this.boxMovieView(x);
    const e = await this.extras(fav.title, undefined, fav.en);
    return (
      <Page title={fav.title} subtitle="收藏電影" onBack={() => this.back()}>
        {this.hero(e, fav.title, [fav.en || "", fav.fest ? `收藏自${fav.fest.name}` : ""].filter(Boolean), { en: fav.en, poster: fav.poster, fest: fav.fest })}
        <Note text="目前查不到這部片的場次，可能已經下檔，或還沒排片。之後有場次時，從首頁「收藏電影」點進來就會直接到場次頁。" />
      </Page>
    );
  }
  /** 三大評分徽章（IMDb、番茄、爆米花）：電影頁和影展片共用。讀好後三個都顯示，沒有那項評分就是「-」（跟「還沒抓到」分得開） */
  ratingBadges(r: Ratings | null | undefined): RatingBadge[] {
    const badges: RatingBadge[] = [];
    if (r) {
      badges.push(r.imdb ? { kind: "imdb", value: r.imdb.score.toFixed(1), tier: ratingTier("imdb", r.imdb.score), onTap: () => Safari.open(r.imdb!.url) } : { kind: "imdb", value: "-", tier: "none" });
      badges.push(r.tomato ? { kind: "tomato", value: `${r.tomato.score}%`, tier: tomatoTier(r.tomato.score, r.tomato.certified), onTap: () => Safari.open(r.tomato!.url) } : { kind: "tomato", value: "-", tier: "none" });
      badges.push(r.popcorn ? { kind: "popcorn", value: `${r.popcorn.score}%`, tier: popcornTier(r.popcorn.score, r.popcorn.certified), onTap: () => Safari.open(r.popcorn!.url) } : { kind: "popcorn", value: "-", tier: "none" });
    }
    return badges;
  }
  hero(e: Extras, title: string, lines: string[], fav?: { en?: string; poster?: string; fest?: FavMovie["fest"] }): string {
    const { x, r } = e;
    const posterUrl = x?.poster || e.p || "";
    const poster = posterSrc(posterUrl);
    if (poster && poster === posterUrl) cachePoster(posterUrl); // 這次用網址顯示，順便抓進快取
    const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`;
    const badges = this.ratingBadges(r);
    // 爆米花指數的補充，一行放得下：觀眾平均幾分（滿分 5）｜多少人評（人數少的參考性比較低）
    if (r?.popcorn && (r.popcorn.avg || r.popcorn.count)) lines = [...lines, [r.popcorn.avg ? `爆米花 ${r.popcorn.avg}／5` : "爆米花", popcornCount(r.popcorn.count)].filter(Boolean).join("｜")];
    if (!r && e.loading) lines = [...lines, "評分讀取中…"];
    else if (!r) lines = [...lines, "評分讀不到"];
    if (r?.err && !(r.imdb || r.tomato || r.popcorn)) lines = [...lines, `評分讀不到：${r.err}`];
    if (x?.err) lines = [...lines, `預告：${x.err}`];
    return (
      <Hero
        title={title}
        poster={poster}
        posterUrl={posterUrl}
        posterPending={!poster && e.loading}
        lines={lines}
        badges={badges}
        fav={this.favOf({ title, en: fav?.en, poster: fav?.poster || posterUrl, fest: fav?.fest })}
        onShare={() => this.shareMovie(title, fav?.fest)}
        // 還在讀的時候先顯示「觀看預告」，點下去會等讀好再開，不會誤開成搜尋頁
        trailerLabel={!x || x.trailerName ? "觀看預告" : "搜尋預告"}
        onTrailer={async () => Safari.open((x || (await e.px))?.trailer || search)}
      />
    ) + this.community(title, e.c);
  }

  // ── 場次 ──
  async timesView(c: Cinema, date: string, m: Movie, r: { booking: string; sourceUrl: string; address: string }): Promise<string> {
    const isToday = date === todayTPE();
    const now = nowHM();
    const x = await this.extras(m.title);
    // 劇情簡介：跟「依電影找場次」的電影頁同一份（場次通的電影頁）。先找出這部片在場次通的那一頁；讀太久就先畫場次，讀好再補上
    const tw = (await loadMovies().catch(() => [] as TwMovie[])).find((t) => communityKey(t.title) === communityKey(m.title));
    const dayJob = tw ? movieDay(tw.slug, undefined).catch(() => null) : Promise.resolve(null);
    const day = await Promise.race([dayJob, sleep(this.rerendering ? 0 : 1200).then(() => undefined)]);
    if (day === undefined) this.late = [dayJob];
    const about = movieAbout(day || null);
    return (
      <Page title={m.title} subtitle={`${c.name}｜${dateLabel(date)}`} onBack={() => this.back()}>
        {this.hero(x, m.title, [
          m.runtime ? `片長 ${m.runtime} 分鐘` + (m.runtimeFrom ? `（${m.runtimeFrom}）` : "") : "片長未提供，下一步可手動輸入",
          m.rating || "",
        ])}
        {m.versions.map((v) => (
          <Section title={v.label}>
            <Chips>
              {[...v.times].sort(byShowtime).map((t) => {
                const past = isToday && t <= now && !lateIsTonight(c.source, t);
                const end = m.runtime ? fmt(new Date(tpeDate(date, t).getTime() + (m.runtime + this.settings.ads) * 6e4)).slice(-5) : "";
                return (
                  <Chip
                    label={t}
                    sub={past ? "已開演" : isLate(t) ? "凌晨場" : end ? `→ ${end}` : ""}
                    muted={past}
                    warn={isLate(t)}
                    onTap={() => {
                      this.runtime = m.runtime;
                      this.seat = hallOf(v.label); // 來源有標影廳就先帶入，可再修改
                      this.go(() =>
                        this.confirmView({ cinema: c, address: r.address || c.address || "", booking: r.booking, sourceUrl: r.sourceUrl, date, movie: m, version: v, time: t })
                      );
                    }}
                  />
                );
              })}
            </Chips>
          </Section>
        ))}
        {about.text || about.credits ? (
          <Section title="劇情簡介" hint="簡介來自場次通。">
            <Para text={about.text || about.credits} dim={about.text ? about.credits : ""} />
          </Section>
        ) : null}
      </Page>
    );
  }

  // ── 確認 ──
  start(p: Pick): Date {
    // 凌晨場：場次通放在實際日期那天；其他來源放在前一個營業日，實際日期要 +1 天
    return tpeDate(showDay(p.cinema.source, p.date, p.time), p.time);
  }
  end(p: Pick): Date {
    return new Date(this.start(p).getTime() + ((this.runtime || 120) + this.settings.ads) * 6e4);
  }

  async confirmView(p: Pick): Promise<string> {
    // 來源沒給片長：先查 TMDB／開眼（最多等 2.5 秒），查到就直接帶入
    if (!this.runtime && !p.movie.runtime) {
      this.late = [];
      await this.fillRuntime(p.movie as any);
      if (p.movie.runtime) this.runtime = p.movie.runtime;
    }
    return (
      <Page title="確認行程" subtitle="點選項目可以修改" onBack={() => this.back()}>
        <Section>
          <Item icon="🎬" title={p.movie.title} subtitle={p.version.label} />
          {p.address ? this.addressItem(p.cinema.name, p.address, p.cinema.name) : <Item icon="📍" title={p.cinema.name} />}
          <Item icon="🕒" title={fmt(this.start(p))} subtitle={`預計 ${fmt(this.end(p)).slice(-5)} 散場`} />
        </Section>
        {isLate(p.time) ? <Note kind="warn" text={showDay(p.cinema.source, p.date, p.time) !== p.date ? "凌晨場：已自動算到隔天日期，請再核對電影票。" : "凌晨場：請核對日期，這場是在這一天的凌晨開演。"} /> : null}
        <Section title="可調整">
          <Item
            icon="⏱"
            title="片長"
            subtitle={
              this.runtime
                ? `${this.runtime} 分鐘` + (p.movie.runtimeFrom && this.runtime === p.movie.runtime ? `（取自 ${p.movie.runtimeFrom}，請核對）` : "")
                : "來源沒有提供，請輸入（未填以 120 分鐘計）"
            }
            right="修改"
            onTap={() => this.go(() => this.runtimeView())}
          />
          <Item icon="📺" title="廣告預告" subtitle={`${this.settings.ads} 分鐘`} right="點一下切換" chevron={false} onTap={() => this.cycleAds()} />
          <Item icon="💺" title="影廳／座位" subtitle={this.seat || "未填（選填）"} right="修改" onTap={() => this.go(() => this.seatView())} />
          <Item icon="📅" title="行事曆" subtitle={this.calendarName} right="更換" onTap={() => this.go(() => this.calendarView())} />
        </Section>
        <Button label="✓ 加入行事曆" onTap={() => this.save(p)} />
        {this.bookingButtons(p)}
        <Button label="分享這場給朋友" kind="secondary" onTap={() => this.share(p)} />
      </Page>
    );
  }

  // ── 網頁版：加到主畫面 ──
  /** 已經是從主畫面開啟的（獨立視窗，沒有瀏覽器的網址列） */
  isStandalone(): boolean {
    if (!IS_WEB) return false;
    const w = globalThis as any;
    try {
      return !!(w.navigator?.standalone || w.matchMedia?.("(display-mode: standalone)").matches);
    } catch (_) {
      return false;
    }
  }
  /** 首頁最下面的入口：已經從主畫面開啟就不顯示 */
  installEntry(): string {
    if (!IS_WEB || this.isStandalone()) return "";
    return (
      <Section>
        <Item icon="📲" title="加到主畫面" subtitle="像 App 一樣從主畫面開啟，看圖示教學" onTap={() => this.go(() => this.installView())} />
      </Section>
    );
  }
  /** 圖示教學：依瀏覽器給對應的步驟。Android／電腦的 Chrome 有安裝事件時，直接給一顆安裝按鈕 */
  installView(): string {
    const w = globalThis as any;
    const ua = String(w.navigator?.userAgent || "");
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (w.navigator?.maxTouchPoints || 0) > 1); // iPadOS 會自稱 Mac
    const iosOther = ios && /CriOS|FxiOS|EdgiOS|Line\/|FBAN|FBAV|Instagram/.test(ua); // iPhone 上的 Chrome、Firefox、App 內建瀏覽器
    const android = /Android/.test(ua);
    const prompt = w.__installPrompt;
    const done = this.isStandalone() || w.__installed;
    const install = async () => {
      try {
        await prompt.prompt();
        const r = await prompt.userChoice;
        w.__installPrompt = null;
        if (r && r.outcome === "accepted") w.__installed = true;
      } catch (_) {}
    };
    let body: string;
    if (done) {
      body = <Note text="✅ 已經加到主畫面了。之後從主畫面的「片刻」圖示開啟就可以。" />;
    } else if (prompt) {
      body = (
        <>
          <Button label="📲 安裝到主畫面" onTap={install} />
          <Note text="按下後瀏覽器會跳出確認視窗，選「安裝」。裝好後會多一個「片刻」圖示，開起來沒有網址列，像一般的 App。" />
        </>
      );
    } else if (ios && !iosOther) {
      body = (
        <>
          <Steps items={[
            { icon: "share", title: "點「分享」按鈕", text: "Safari 下方工具列上，方框加向上箭頭的圖示。找不到的話先點「⋯」，再點「分享」。" },
            { icon: "plus", title: "往下滑，點「加入主畫面」", text: "選單裡方框加一個加號的那一項。" },
            { icon: "check", title: "點右上角的「加入」", text: "名稱可以維持「片刻」。" },
            { icon: "home", title: "從主畫面開啟", text: "主畫面會多一個「片刻」圖示，開起來沒有網址列，像一般的 App。" },
          ]} />
          <Note text="要用 Safari 才能加到主畫面。收藏影城等設定存在瀏覽器裡：從主畫面開啟的版本是另一份，設定要重新設一次。" />
        </>
      );
    } else if (ios) {
      body = (
        <>
          <Steps items={[
            { icon: "share", title: "點「分享」按鈕", text: "網址列旁邊，方框加向上箭頭的圖示。" },
            { icon: "plus", title: "點「加入主畫面」", text: "選單裡沒有這一項的話，請改用 Safari 開啟這個網址再加。" },
            { icon: "check", title: "點「加入」" },
          ]} />
          <Note text="你現在用的不是 Safari。在 LINE、Facebook 這類 App 裡打開的網頁通常不能加到主畫面，請先點「用瀏覽器開啟」。" />
        </>
      );
    } else if (android) {
      body = (
        <Steps items={[
          { icon: "vdots", title: "點右上角的「⋮」", text: "瀏覽器的選單。" },
          { icon: "plus", title: "點「加到主畫面」或「安裝應用程式」", text: "各家瀏覽器的說法略有不同。" },
          { icon: "check", title: "點「安裝」或「新增」" },
        ]} />
      );
    } else {
      body = (
        <Steps items={[
          { icon: "plus", title: "在網址列右邊找「安裝」圖示", text: "Chrome、Edge 會在網址列右邊出現一個安裝圖示；沒有的話從瀏覽器選單裡找「安裝片刻」。" },
          { icon: "check", title: "點「安裝」", text: "Safari（macOS）則是從「檔案」選單選「加入 Dock」。" },
        ]} />
      );
    }
    return (
      <Page title="加到主畫面" subtitle="像 App 一樣從主畫面開啟" onBack={() => this.back()}>
        {body}
      </Page>
    );
  }

  /** 版本狀態：已是最新版／有新版（捷徑每次執行都會下載最新版，重新執行就會更新） */
  async versionNote(): Promise<string> {
    // 網頁版開著不關很常見：每次畫到這裡，超過一分鐘就重新問一次，顯示的才是現在的狀況
    if (IS_WEB && Date.now() - this.latestAt > 60e3) {
      this.latest = this.checkVersion();
      this.latestAt = Date.now();
    }
    const r = await Promise.race([this.latest, sleep(1500).then(() => undefined)]);
    if (r === undefined) return "";
    if (IS_WEB) {
      if (!r) return <Note text="（無法確認是否為最新版：連不到網站）" />;
      if (r.isLatest) return <Note text="✅ 已是最新版" />;
      return (
        <>
          <Note kind="warn" text={`🆕 有新版 ${r.latest}（你現在開的是 ${APP_VERSION}）`} />
          <Button label="重新整理以更新" kind="secondary" onTap={() => { (globalThis as any).location.reload(); }} />
        </>
      );
    }
    if (!r) return <Note text="（無法確認是否為最新版：讀不到 GitHub）" />;
    if (r.isLatest) return <Note text="✅ 已是最新版" />;
    return <Note kind="warn" text={`🆕 有新版 ${r.latest}：關閉後重新執行捷徑就會更新（GitHub 約有 5 分鐘延遲）。如果是匯入 .scriptable 檔安裝的，請改用捷徑才會自動更新。`} />;
  }

  /** 以瀏覽器訂票／以 App 訂票 */
  bookingButtons(p: Pick): string {
    const app = cinemaApp(p.cinema);
    return (
      <>
        <Button label="🌐 以瀏覽器訂票" kind="secondary" onTap={async () => Safari.open(await bookingUrl(p))} />
        {app ? (
          <>
            <Button label={`📱 以 App 訂票（${app.name}）`} kind="secondary" onTap={() => Safari.open(app.url)} />
            <Note text={`會打開 App Store 的「${app.name}」頁面：已安裝的話點「打開」就進 App，沒安裝可以直接下載。`} />
          </>
        ) : (
          <Note text="這間影城沒有官方 App，請用瀏覽器訂票。" />
        )}
      </>
    );
  }

  runtimeView(): string {
    return (
      <Page title="片長" onBack={() => this.back()}>
        <Note text="請依官網或電影票輸入正片分鐘數。" />
        <input class="field" name="v" type="number" inputmode="numeric" value={this.runtime || ""} placeholder="例如 120" autofocus />
        <Button
          label="確定"
          enter
          onTap={(v) => {
            const n = Math.round(Number(v.v));
            if (!(n > 0 && n < 600)) throw new Error("片長請輸入 1～599 的整數");
            this.runtime = n;
            this.back();
          }}
        />
      </Page>
    );
  }

  seatView(): string {
    return (
      <Page title="影廳／座位" onBack={() => this.back()}>
        <Note text="選填，會寫進行程備註。例如：7 廳 H12、H13" />
        <input class="field" name="v" value={this.seat} placeholder="影廳與座位" autofocus />
        <Button
          label="確定"
          enter
          onTap={(v) => {
            this.seat = String(v.v || "").trim();
            this.back();
          }}
        />
      </Page>
    );
  }

  async save(p: Pick) {
    if (!this.runtime) return this.go(() => this.runtimeView());
    const cal = await currentCalendar(this.settings);
    const start = this.start(p);
    const end = this.end(p);
    const dup = (await CalendarEvent.between(new Date(start.getTime() - 6e4), new Date(start.getTime() + 6e4), [cal])).find((e) => e.title === p.movie.title);
    if (dup) return this.go(() => this.dupView(p, cal));
    this.write(p, cal, start, end);
  }

  dupView(p: Pick, cal: Calendar): string {
    return (
      <Page title="已經有這場了" onBack={() => this.back()}>
        <Empty icon="📅" text={`${p.movie.title}\n${fmt(this.start(p))}\n已在「${cal.title}」裡`} />
        <Button label="還是加入" kind="danger" onTap={() => this.write(p, cal, this.start(p), this.end(p))} />
        <Button label="不要重複" kind="secondary" onTap={() => this.back()} />
      </Page>
    );
  }

  write(p: Pick, cal: Calendar, start: Date, end: Date) {
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
      `場次來源：${p.sourceUrl}`,
    ]
      .filter(Boolean)
      .join("\n");
    ev.save();
    this.go(() => this.doneView(p, ev, cal));
  }

  doneView(p: Pick, ev: CalendarEvent, cal: Calendar): string {
    return (
      <Page title={IS_WEB ? "已產生行事曆檔" : "已加入行事曆"} subtitle={cal.title}>
        <Empty icon="✅" text={`${p.movie.title}\n${fmt(ev.startDate)} → ${fmt(ev.endDate).slice(-5)}\n${p.cinema.name}${this.seat ? "｜" + this.seat : ""}`} />
        <Section hint={IS_WEB ? "打開剛下載的 .ics 檔就能加入手機或電腦的行事曆；行程已附開演前 30 分鐘提醒。" : "Scriptable 無法直接設定提醒，打開行程後可在「提示」加上開演前 30 分鐘。"}>
          <Item icon={IS_WEB ? "📥" : "🔔"} title={IS_WEB ? "再下載一次行事曆檔" : "打開行程，加提醒"} accent onTap={async () => { await ev.presentEdit(); }} />
          <Item icon="📤" title="分享這場給朋友" accent onTap={() => this.share(p)} />
        </Section>
        {this.bookingButtons(p)}
        <Button label="再新增一部" onTap={() => this.home()} />
      </Page>
    );
  }

  // ── 依電影找 ──
  movieQuery = "";
  soonWhen = ""; // 即將上映的篩選：上映時間（"" 全部、"2w" 兩週內、"2026-12" 某個月）
  soonState = ""; // 場次狀態（"" 全部、"open" 可查場次、"wait" 尚未開放）
  soonOpen = ""; // 目前展開哪一組篩選
  soonShut: string[] = []; // 收合起來的月份
  /** 電影分頁上方的切換：上映中／票房排行 */
  movieMode: "box" | "soon" | "year" | "fest" = "box"; // box = 現正上映（含票房排行）；year = 歷年電影（某幾年上映的片，含已下檔）
  movieModeChips(): string {
    return (
      <Chips tabs>
        <Chip label="現正上映" muted={this.movieMode !== "box"} onTap={() => { this.movieMode = "box"; this.boxOpen = ""; }} />
        <Chip label="即將上映" muted={this.movieMode !== "soon"} onTap={() => { this.movieMode = "soon"; }} />
        <Chip label="歷年電影" muted={this.movieMode !== "year"} onTap={() => { this.movieMode = "year"; this.boxOpen = ""; }} />
        {/* 有進行中或即將開始的影展才會出現 */}
        {festivalsAny() ? <Chip label="影展" muted={this.movieMode !== "fest"} onTap={() => { this.movieMode = "fest"; }} /> : null}
      </Chips>
    );
  }

  // ── 影展 ──
  festId = ""; // 看哪一個影展（同時有兩個以上時可以切換）
  festDate = ""; // 看哪一天（空 = 今天或影展第一天）
  festQuery = ""; // 影展裡搜尋片名（搜這一年的所有影展）
  festTab = ""; // 看「進行中・即將開始」(live) 還是「已結束」(past)；空的 = 自動
  festOpen = ""; // 目前展開哪一組篩選（年份／狀態／影展；空 = 都收合）
  festYear = 0; // 看哪一年（0 = 今年；今年還沒有就是最近有資料的那一年）
  async festivalListView(): Promise<string> {
    const list = await loadFestivals(this.festYear || undefined);
    const years = festivalYears();
    if (!list.length) {
      if (this.festYear) { this.festYear = 0; return this.festivalListView(); }
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
    // 收合的篩選：一行「名稱　目前選的 ▸」，點了展開（一次只展開一個）；只有一個選項的不能展開
    const fold = (id: string, title: string, summary: string, can = true) => (
      <Item kv title={title} right={can ? `${summary} ${this.festOpen === id ? "▾" : "▸"}` : summary} chevron={false} onTap={can ? () => { this.festOpen = this.festOpen === id ? "" : id; } : undefined} />
    );
    return (
      <Page title="依電影找場次" subtitle={`${f.name}｜${festivalStatusLine(f)}`} onBack={() => this.back()}>
        {this.movieModeChips()}
        <Search value={this.festQuery} placeholder={`搜尋 ${year} 年影展的片名`} onInput={(t) => { this.festQuery = t; }} />
        {/* 年份、狀態、影展收合成三行（跟年度排行的篩選同一種樣式），點了才展開；選好就自動收起來 */}
        <Section hint={this.festOpen === "fest" && pick.items.length > 3 ? "可以左右滑動" : ""}>
          {years.length > 1 ? fold("year", "年份", `${year}${year === thisYear ? "（今年）" : ""}`) : null}
          {years.length > 1 && this.festOpen === "year" ? (
            <Chips scroll>
              {years.map((y) => <Chip label={`${y}`} sub={y === thisYear ? "今年" : ""} muted={y !== year} onTap={() => { this.festYear = y; this.festTab = ""; this.festId = ""; this.festDate = ""; this.festOpen = ""; }} />)}
            </Chips>
          ) : null}
          {pick.tabs.length > 1 ? fold("tab", "狀態", `${tabNow ? tabNow.label : ""}（${tabNow ? tabNow.count : 0} 個）`) : null}
          {pick.tabs.length > 1 && this.festOpen === "tab" ? (
            <Chips>
              {pick.tabs.map((t) => <Chip label={t.label} sub={`${t.count} 個影展`} muted={t.id !== pick.tab} onTap={() => { this.festTab = t.id; this.festId = ""; this.festDate = ""; this.festOpen = pick.tabs.find((x) => x.id === t.id)!.count > 1 ? "fest" : ""; }} />)}
            </Chips>
          ) : null}
          {fold("fest", "影展", pick.items.length > 1 ? `${f.name}（${festivalChipNote(f)}）` : `${f.name}（${festivalChipNote(f)}）`, pick.items.length > 1)}
          {pick.items.length > 1 && this.festOpen === "fest" ? (
            <Chips scroll>
              {pick.items.map((x) => <Chip label={x.name} sub={festivalChipNote(x)} muted={x.id !== f.id} onTap={() => { this.festId = x.id; this.festDate = ""; this.festOpen = ""; }} />)}
            </Chips>
          ) : null}
        </Section>
        {hits ? (
          <Section title={`「${this.festQuery.trim()}」｜${hits.length} 部`} hint="搜尋這一年所有影展的片名，不分日期。清空搜尋欄就回到每天的片單。">
            {hits.map(({ f: hf, film, sessions }) => (
              <Item
                thumb={{ src: film.poster || "" }}
                title={film.title}
                subtitle={festivalSearchLines(hf, film, sessions).filter(Boolean).join("\n")}
                onTap={() => this.go(() => this.festivalFilmView(hf, film))}
              />
            ))}
          </Section>
        ) : null}
        {hits && !hits.length ? <Empty icon="🎞" text="這一年的影展裡找不到這個片名" /> : null}
        {hits ? null : (
          <>
          <Section title="日期">
            <Chips scroll>
              {dates.map((d) => (
                <Chip label={dateLabel(d).replace(/（.）.*$/, "")} sub={d === todayTPE() ? "今天" : dateLabel(d).match(/（(.)）/)?.[1] || ""} muted={d !== date} onTap={() => { this.festDate = d; }} />
              ))}
            </Chips>
          </Section>
          <Section title={`${f.name}｜${dateLabel(date).replace(/ .*$/, "")}｜${day.length} 部、${day.reduce((n, x) => n + x.sessions.length, 0)} 場`} hint={festivalFooter(f)}>
            {day.map(({ film, sessions }) => (
              <Item
                thumb={{ src: film.poster || "" }}
                title={film.title}
                subtitle={festivalLines(film, sessions).filter(Boolean).join("\n")}
                onTap={() => this.go(() => this.festivalFilmView(f, film))}
              />
            ))}
          </Section>
          {day.length ? null : <Empty icon="🎞" text="這一天沒有場次" />}
          </>
        )}
      </Page>
    );
  }
  /** 影展的一部片：列出還沒演的所有場次，點一場加入行事曆 */
  async festivalFilmView(f: Festival, film: FestivalFilm): Promise<string> {
    // 片刻評分：跟院線片共用同一套（片名相同就是同一部片的分數）
    const rated: Community | false = communityCached(film.title) || (await communityStats(film.title).catch(() => false as const));
    const sessions = festivalFilmSessions(f, film.id);
    // 三大評分：用影展的片名查，跟院線片同一套（最多等 0.4 秒，還沒好就先畫、好了再補上）
    const pr = foregroundTask(movieRatings(film.title).catch(() => null));
    const r = await Promise.race([pr, sleep(this.rerendering ? 0 : 400).then(() => undefined)]);
    if (r === undefined) this.late = [pr];
    const pick = (x: FestivalSession) => {
      const cinema = festivalCinema(x, this.cinemas, f);
      const version: Version = { label: festivalPlace(x), times: [x.time] };
      const movie: Movie = { title: film.title, runtime: film.mins, rating: film.rating, versions: [version] };
      this.runtime = film.mins;
      this.seat = x.room;
      this.go(() => this.confirmView({ cinema, address: cinema.address || "", booking: x.ticket || film.url, sourceUrl: film.url, date: x.date, movie, version, time: x.time }));
    };
    const end = (x: FestivalSession) => (film.mins ? fmt(new Date(tpeDate(x.date, x.time).getTime() + (film.mins + this.settings.ads) * 6e4)).slice(-5) : "");
    return (
      <Page title={film.title} subtitle={f.name} onBack={() => this.back()}>
        <Hero title={film.title} poster={film.poster || undefined} lines={[[film.rating, film.mins ? `${film.mins} 分鐘` : ""].filter(Boolean).join("｜"), `${f.name}（${festivalStateLabel(f)}）`, "影展片名，院線上映時可能不同", ...(r === undefined ? ["評分讀取中…"] : [])]} badges={this.ratingBadges(r)} fav={this.favOf({ title: film.title, poster: film.poster, fest: { id: f.id, film: film.id, name: f.name } })} trailerLabel={festivalTrailer(film).label} onTrailer={() => Safari.open(festivalTrailer(film).url)} />
        {this.community(film.title, rated)}
        {film.intro || film.credits ? (
          <Section title="介紹" hint={`介紹來自${f.source}。`}>
            <Para text={film.intro || film.credits || ""} dim={film.intro ? film.credits : ""} />
          </Section>
        ) : null}
        <Section title="場次" hint={festivalState(f) === "past" ? "這個影展已經結束，場次僅供回顧。" : "點一場加入行事曆。散場時間是依片長和你設定的廣告預告時間估的。"}>
          {sessions.map((x) => (
            <Item
              title={`${dateLabel(x.date).replace(/ .*$/, "")}　${x.time}`}
              subtitle={[festivalPlace(x), end(x) ? `預計 ${end(x)} 散場` : ""].filter(Boolean).join("\n")}
              onTap={() => pick(x)}
            />
          ))}
        </Section>
        {sessions.length ? null : <Empty icon="🎞" text="找不到這部片的場次" />}
        <Button label="🌐 官網的影片介紹" kind="secondary" onTap={() => Safari.open(film.url)} />
      </Page>
    );
  }

  boxRate = ""; // 依評分排時用哪一種評分（空 = IMDb）
  pickQuery = ""; // 「選出品國別／發行商」那一頁的搜尋字
  /** 出品國別／發行商的選擇頁：一列一個、標出部數，可以搜尋、可以複選；選好按返回 */
  async boxPickView(kind: "country" | "issuer" | "year"): Promise<string> {
    const sc = this.movieMode === "year" ? "year" : "now";
    const board = await loadMovieBoard({ scope: sc, sort: this.sortBy[sc], years: this.boxYears, week: this.boxWeek, countries: this.boxCountry, query: this.movieQuery.trim().toLowerCase(), asc: this.ascBy[sc], rate: this.boxRate, fewLast: this.boxFewLast, issuers: this.boxIssuer, status: this.boxStatus });
    if (kind === "year") {
      // 年份：新的在上面；至少要留一年
      const ys = board.years, on = board.selYears;
      const lo = ys.reduce((a, b) => (a < b ? a : b), ys[0]), hi = ys.reduce((a, b) => (a > b ? a : b), ys[0]);
      return (
        <Page title="選年份" subtitle={on.length === ys.length ? `全部（${lo}–${hi}）` : `已選 ${on.length} 年`} onBack={() => this.back()}>
          <Section>
            <Item icon={on.length === ys.length ? "✅" : "⬜️"} title="全部" subtitle={`${lo} 到 ${hi} 年`} chevron={false} onTap={() => { this.boxYears = on.length === ys.length ? [] : ys.slice(); }} />
          </Section>
          <Section title="可以選好幾年" hint="至少要選一年。選好之後按左上角的返回。">
            {ys.map((y) => <Item icon={on.indexOf(y) >= 0 ? "✅" : "⬜️"} title={`${y} 年`} chevron={false} onTap={() => { this.boxYears = on.indexOf(y) < 0 ? [...on, y] : on.length > 1 ? on.filter((z) => z !== y) : on; }} />)}
          </Section>
        </Page>
      );
    }
    const isC = kind === "country";
    const all = isC ? board.countries : board.issuers;
    const sel = isC ? board.selCountries : board.selIssuers;
    const set = (next: string[]) => { if (isC) this.boxCountry = next; else this.boxIssuer = next; };
    const k = this.pickQuery.trim().toLowerCase();
    // 已經選的排最前面，其餘照部數多到少
    const favI = this.settings.favIssuers || [];
    const isFav = (id: string) => !isC && favI.indexOf(id) >= 0;
    const toggleFavI = (id: string) => { this.settings.favIssuers = isFav(id) ? favI.filter((z) => z !== id) : [...favI, id]; saveSettings(this.settings); };
    const list = all.filter((c) => !k || c.id.toLowerCase().includes(k)).sort((a, b) => Number(sel.indexOf(b.id) >= 0) - Number(sel.indexOf(a.id) >= 0) || Number(isFav(b.id)) - Number(isFav(a.id)) || b.count - a.count);
    const favHere = all.filter((c) => isFav(c.id)).map((c) => c.id);
    const name = isC ? "出品國別" : "發行商";
    return (
      <Page title={`選${name}`} subtitle={sel.length ? `已選 ${sel.length} 個｜${board.entries.length + board.rest.length} 部` : `全部（${board.everyone} 部）`} onBack={() => this.back()}>
        <Search value={this.pickQuery} placeholder={`搜尋${name}（共 ${all.length} 個）`} onInput={(t) => { this.pickQuery = t; }} />
        <Section hint={isC ? BOX_COUNTRY_NOTE : "發行商來自官方票房資料；聯合發行的片算第一家。"}>
          <Item icon={sel.length ? "⬜️" : "✅"} title="全部" subtitle={sel.length ? "點這裡清除已選的" : ""} right={`${board.everyone} 部`} chevron={false} onTap={() => set([])} />
          {favHere.length ? <Item icon="★" title="只看收藏發行商" subtitle={favHere.join("、")} right={`${favHere.length} 家`} chevron={false} onTap={() => set(favHere)} /> : null}
        </Section>
        <Section title={`可以選好幾個${k ? `｜符合「${this.pickQuery.trim()}」的 ${list.length} 個` : ""}`} hint={isC ? "選好之後按左上角的返回。" : "點右邊的星號可以收藏發行商（★ 已收藏），收藏的會排在前面，首頁也會多一個「收藏發行商」。選好之後按左上角的返回。"}>
          {list.map((c) => <Item icon={sel.indexOf(c.id) >= 0 ? "✅" : "⬜️"} title={c.id} right={`${c.count} 部`} chevron={false} onTap={() => set(sel.indexOf(c.id) < 0 ? [...sel, c.id] : sel.filter((z) => z !== c.id))} action={isC ? undefined : { label: isFav(c.id) ? "★" : "☆", hint: isFav(c.id) ? "取消收藏這家發行商" : "收藏這家發行商", onTap: () => toggleFavI(c.id) }} />)}
        </Section>
        {list.length ? null : <Empty icon="🔎" text={`找不到相符的${name}`} />}
      </Page>
    );
  }
  boxStatus = ""; // 歷年電影只看上映中（now）／已下檔（off）；空 = 全部
  boxIssuer: string[] = []; // 只看哪幾家發行商（可以複選；空 = 全部）
  boxFewLast = true; // 依 IMDb 排時，評分人數少的片排在後面（關掉就照分數一起排）
  boxOpen = ""; // 目前展開哪一組篩選（週次／年份／出品國別；空 = 都收合）
  // 排法與方向：「現正上映」和「歷年電影」兩個頁籤各記各的（空 = 第一種；asc = 反過來排）
  sortBy: Record<string, string> = { now: "", year: "" };
  ascBy: Record<string, boolean> = { now: false, year: false };
  boxYears: string[] = []; // 年度排行選了哪幾年（空 = 最新的一年）
  boxWeek = ""; // 週票房看哪一週（空 = 最新）
  boxCountry: string[] = []; // 只看哪幾個出品國別（可以複選；空 = 全部）
  boxLimit = 100; // 年度排行目前顯示幾列
  boxPageKey = "";
  /** 「電影」清單：上映中與票房排行合成一份（範圍、排序、出品國別都在這裡選） */
  async boxOfficeView(): Promise<string> {
    // 票房、片單（依片刻評分排時再加評分總表）一次讀好；票房讀不到時清單照樣出來，只是少了依票房排的選項
    const k = this.movieQuery.trim().toLowerCase();
    const sc = this.movieMode === "year" ? "year" : "now"; // 看哪些片由頁籤決定
    const board = await loadMovieBoard({ scope: sc, sort: this.sortBy[sc], years: this.boxYears, week: this.boxWeek, countries: this.boxCountry, query: k, asc: this.ascBy[sc], rate: this.boxRate, fewLast: this.boxFewLast, issuers: this.boxIssuer, status: this.boxStatus });
    const { years, countries } = board;
    const selYears = board.selYears, country = board.selCountries;
    // 年度排行一年有六百部左右、全選是好幾千部：先畫 100 列，快滑到底時自動接著載入（不用按）。換了排法、年份或搜尋字就從頭開始
    const paged = board.paged;
    const pageKey = `${board.statusSel || ""}|${board.selIssuers.join(",")}|${board.asc}|${board.rate}|${board.scope}|${board.sort}|${selYears.join(",")}|${board.selWeek}|${k}|${country.join(",")}`;
    if (this.boxPageKey !== pageKey) {
      this.boxPageKey = pageKey;
      this.boxLimit = BOX_PAGE;
    }
    const rows = paged ? board.entries.slice(0, this.boxLimit) : board.entries;
    const every = [...rows, ...board.rest];
    // 海報：手機上記過的立刻有；沒記過的最多等 0.6 秒，其餘讀好後自動補畫。
    // 已下檔的舊片（年度排行、過去的週次）用輕量查法（一部片一個小請求），而且只查畫面上這一批
    const jobs = every.map((e) => (e.light ? posterLight(e.name, e.x ? e.x.release : "") : moviePoster(e.m ? e.m.title : e.name, e.m?.slug, e.m?.en)).catch(() => ""));
    const wait = this.rerendering ? 0 : paged ? 150 : 600;
    const posters = await Promise.all(jobs.map((p) => Promise.race([p, sleep(wait).then(() => undefined)])));
    const late = jobs.filter((_, i) => posters[i] === undefined);
    // 還沒好的每 8 張補畫一次
    const batches: Promise<unknown>[] = [];
    for (let i = 0; i < late.length; i += 8) batches.push(Promise.all(late.slice(i, i + 8)));
    if (batches.length) this.late = batches;
    if (!paged) prefetchPosters(every.filter((e) => !e.light).map((e) => ({ title: e.m ? e.m.title : e.name, slug: e.m?.slug, en: e.m?.en })), 300, 0, 0);
    const thumb = (u: string | undefined) => {
      if (u === undefined) return { src: "" , pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      return { src, url: u };
    };
    // 收合的篩選：一行「名稱　目前選的 ▸」，點了展開（一次只展開一個）
    const dirNow = (board.asc ? board.dirs[1].label : board.dirs[0].label), dirNext = (board.asc ? board.dirs[0].label : board.dirs[1].label);
    const fold = (id: string, title: string, summary: string) => (
      <Item kv title={title} right={`${summary} ${this.boxOpen === id ? "▾" : "▸"}`} chevron={false} onTap={() => { this.boxOpen = this.boxOpen === id ? "" : id; }} />
    );
    const item = (e: MovieEntry, i: number) => {
      const m = e.m, x = e.x;
      return (
        <Item
          rank={e.rank === null ? undefined : e.rank}
          thumb={thumb(posters[i] as string | undefined)}
          title={e.name}
          subtitle={e.lines.filter(Boolean).join("\n")}
          hi={e.hi}
          tag={e.status ? { text: STATUS_LABEL[e.status], tone: e.status } : undefined}
          chevron={!e.hi}
          onTap={m ? () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) : x ? () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`) : undefined}
        />
      );
    };
    return (
      <Page title="依電影找場次" subtitle={board.title} onBack={() => this.back()}>
        {this.movieModeChips()}
        {/* 搜尋放最上面；下面一排是排序（兩種範圍各自的排法） */}
        <Search value={this.movieQuery} placeholder={board.scope === "year" ? `在 ${selYears.length > 2 ? selYears.length + " 個年份" : selYears.join("、") + " 年"}的電影裡搜尋` : "在現正上映裡搜尋片名"} onInput={(t) => { this.movieQuery = t; }} />
        {/* 排序：前面標「排序」，最右邊一顆按鈕寫出方向（高→低），點一下反過來；再點一次選中的排法也會反向 */}
        {board.orders.length > 1 ? (
          <div class="sortbar">
            {/* 最左邊是方向按鈕（寫著目前的方向：高到低、新到舊…）：點一下切換；兩個箭頭亮的那個是目前的方向（▲ 小到大、▼ 大到小） */}
            <button class={"dir " + (board.asc ? "asc" : "desc")} aria-label={`排序方向：目前${dirNow}，點一下切換`} onTap={async () => { this.ascBy[sc] = !this.ascBy[sc]; await this.ui.toast(`改成${dirNext}`); }}>
              <span>{esc(dirNow)}</span>
              <span class="arrows" aria-hidden="true"><i class="up">▲</i><i class="down">▼</i></span>
            </button>
            <Chips scroll>
              {board.orders.map((x) => <Chip label={x.label} muted={board.order !== x.id} onTap={() => { if (board.order === x.id) this.ascBy[sc] = !this.ascBy[sc]; else { this.sortBy[sc] = x.id; this.ascBy[sc] = false; } }} />)}
            </Chips>
            <span class="more-hint" aria-hidden="true">›</span>
          </div>
        ) : null}
        {/* 評分來源、週次、出品國別預設收合成一行，點了才展開 */}
        {board.weeks.length > 1 || countries.length > 1 || board.rates.length > 1 || board.issuers.length > 1 ? (
          <Section hint={this.boxOpen === "week" ? "可以回頭看過去幾週的排行。" : this.boxOpen === "rate" ? "番茄指數是影評的分數、爆米花指數是觀眾的分數（都來自爛番茄）；片刻評分是這個 App 的使用者打的。" : ""}>
            {/* 年份、出品國別、發行商都是點了進一頁清單（可複選） */}
            {board.scope === "year" && years.length > 1 ? <Item kv title="年份" right={selYears.length === years.length ? `全部（${years[years.length - 1]}–${years[0]}）` : selYears.length > 4 ? `已選 ${selYears.length} 年` : selYears.join("、")} onTap={() => this.go(() => this.boxPickView("year"))} /> : null}
            {board.rates.length > 1 ? fold("rate", "評分來源", board.rateSummary) : null}
            {board.rates.length > 1 && this.boxOpen === "rate" ? (
              <Chips scroll>
                {board.rates.map((r) => <Chip label={r.label} muted={board.rate !== r.id} onTap={() => { this.boxRate = r.id; }} />)}
              </Chips>
            ) : null}
            {/* 評分人數少的片（分數不太準）要不要排在後面：點一下切換，不用展開 */}
            {board.fewOption ? <Item kv title="評分人數少的片" right={board.fewLast ? "排在後面 ⇄" : "照分數一起排 ⇄"} chevron={false} onTap={() => { this.boxFewLast = !this.boxFewLast; }} /> : null}
            {board.weeks.length > 1 ? fold("week", "週次", board.weekSummary) : null}
            {board.weeks.length > 1 && this.boxOpen === "week" ? (
              <Chips>
                {board.weeks.map((o) => <Chip label={o.label} sub={o.note} muted={board.selWeek !== o.id} onTap={() => { this.boxWeek = o.note === "最新" ? "" : o.id; }} />)}
              </Chips>
            ) : null}
            {board.statusPicks ? fold("status", "狀態", board.statusPicks.find((x) => x.id === (board.statusSel || ""))!.label + (board.statusSel ? `（${board.entries.length} 部）` : "")) : null}
            {board.statusPicks && this.boxOpen === "status" ? (
              <Chips scroll>
                {board.statusPicks.map((x) => <Chip label={x.label} sub={`${x.count} 部`} muted={x.id !== (board.statusSel || "")} onTap={() => { this.boxStatus = x.id; this.boxOpen = ""; }} />)}
              </Chips>
            ) : null}
            {/* 出品國別、發行商選項很多：點了進一頁清單（可搜尋、可複選），不用橫向滑 */}
            {countries.length > 1 ? <Item kv title="出品國別" right={board.countrySummary} onTap={() => { this.pickQuery = ""; this.go(() => this.boxPickView("country")); }} /> : null}
            {board.issuers.length > 1 ? <Item kv title="發行商" right={board.issuerSummary} onTap={() => { this.pickQuery = ""; this.go(() => this.boxPickView("issuer")); }} /> : null}
          </Section>
        ) : null}
        {every.length ? null : <Empty icon="🎞" text="找不到相符的電影" />}
        {this.movieQuery.trim() ? this.searchAllLink(this.movieQuery.trim()) : null}
        {rows.length ? <Section title={board.title} hint={board.footer}>{rows.map(item)}</Section> : null}
        {paged && board.entries.length > rows.length ? (
          // 不用按：快滑到底時自動接著載入下一批（一次全部畫出好幾千列會卡住，所以還是分批，只是自動）
          <button class="auto-more" onTap={() => { this.boxLimit += BOX_PAGE * 2; }}>{`載入中…已顯示 ${rows.length}／${board.entries.length} 部`}</button>
        ) : null}
        {board.rest.length ? <Section title={board.restTitle} hint={board.restFooter}>{board.rest.map((e, i) => item(e, rows.length + i))}</Section> : null}
      </Page>
    );
  }

  /** 票房排行上、場次通已經沒有場次的片：海報、評分、預告、片刻評分與票房 */
  /** 歷次上映：這部片在票房資料裡的每一次上映（首映、重映各一列）和合計；只有一次上映就不顯示。點其他那幾列可以過去看那一次的資料 */
  runsSection(x: BoxOfficeItem): string {
    const rows = boxRunRows(x);
    if (!rows.length) return "";
    return (
      <Section title="歷次上映" hint="官方把每一次上映分開算，這裡把同一部片的放在一起。資料從 2016 年開始，更早的上映沒有紀錄。">
        {rows.map((r) => (
          <Item
            title={r.title + (r.current ? "（這一筆）" : "")}
            subtitle={r.note}
            right={r.value}
            head={!r.run}
            chevron={!!r.run && !r.current}
            onTap={r.run && !r.current ? () => this.go(() => this.boxMovieView(r.run!), `讀取《${r.run!.name}》…`) : undefined}
          />
        ))}
      </Section>
    );
  }
  async boxMovieView(x: BoxOfficeItem): Promise<string> {
    const [e, info] = await Promise.all([this.extras(x.name), boxInfo(x).catch(() => null)]);
    // 劇情簡介（伺服器向 TMDB 查的）：讀太久就先畫其他的，讀好再補上
    const introJob = loadIntro(x.name, x.release).catch(() => "");
    const introGot = await Promise.race([introJob, sleep(this.rerendering ? 0 : 800).then(() => undefined)]);
    // 重映的判斷要另外兩份資料（從分享連結、收藏直接進來時還沒讀）：同樣是讀好再補上
    const rr = rerunDataReady();
    const rrDone = rr ? await Promise.race([rr.then(() => true), sleep(this.rerendering ? 0 : 800).then(() => false)]) : true;
    const waiting: Promise<unknown>[] = [];
    if (introGot === undefined) waiting.push(introJob);
    if (rr && !rrDone) waiting.push(rr);
    if (waiting.length) this.late = waiting;
    const intro = introGot || "";
    const date = x.release.replace(/-/g, "/");
    return (
      <Page title={x.name} subtitle={`票房第 ${x.rank} 名`} onBack={() => this.back()}>
        {this.hero(e, x.name, [boxCountryText(x.country), `${date} 上映`])}
        {/* 個別資訊：跟官方網站列的欄位一樣（國別、發行、出品、上映日期、院數、票數、金額） */}
        {intro ? (
          <Section title="劇情簡介" hint="簡介來自 TMDB。">
            <Para text={intro} />
          </Section>
        ) : null}
        <Section title="票房資訊" hint="資料來源：國家電影及視聽文化中心「全國電影票房統計」。">
          <Item kv title="狀態" tag={{ text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }} />
          {boxInfoRows(x, info).map(([label, value]) => <Item kv title={label} right={value} />)}
        </Section>
        {this.runsSection(x)}
        <Note text={boxStatus(x) === "now" ? "官方票房資料顯示這部片最近一週還有賣出票，但場次通目前查不到場次：可能只在少數戲院放映，或這幾天剛下檔。" : "這部片已經下檔，場次通目前沒有它的場次。"} />
      </Page>
    );
  }

  async movieListView(): Promise<string> {
    if (this.movieMode === "fest") return this.festivalListView();
    if (this.movieMode === "box" || this.movieMode === "year") return this.boxOfficeView();
    // 即將上映：場次通已經有場次的片＋還沒有場次的片（伺服器整理的近期上映片單），依上映月份分段
    const board = await loadSoonBoard(this.movieQuery, { when: this.soonWhen, state: this.soonState });
    // 兩個篩選收合成兩行（跟影展、歷年電影同一種樣式），點了才展開；選好就自動收起來
    const fold = (id: string, title: string, summary: string) => (
      <Item kv title={title} right={`${summary} ${this.soonOpen === id ? "▾" : "▸"}`} chevron={false} onTap={() => { this.soonOpen = this.soonOpen === id ? "" : id; }} />
    );
    const list = board.groups.flatMap((g) => g.items);
    prefetchPosters(list.filter((e) => e.m).map((e) => e.m as TwMovie)); // 背景先抓海報，進電影頁就不用等
    // 每一列的小海報：手機上記過、伺服器查好的立刻有；要上網找的最多等 0.6 秒，其餘每好一批就在原位補畫
    const jobs = list.map((e) => (e.m ? moviePoster(e.m.title, e.m.slug, e.m.en) : moviePoster(e.title)).catch(() => ""));
    const got = await Promise.all(jobs.map((p) => Promise.race([p, sleep(this.rerendering ? 0 : 600).then(() => undefined)])));
    const pending = jobs.filter((_, i) => got[i] === undefined);
    const late: Promise<unknown>[] = [];
    for (let i = 0; i < pending.length; i += 8) late.push(Promise.all(pending.slice(i, i + 8)));
    if (late.length) this.late = late;
    const thumbOf = new Map<SoonEntry, { src: string; url?: string; pending?: boolean }>();
    list.forEach((e, i) => {
      const u = got[i];
      if (u === undefined) return void thumbOf.set(e, { src: "", pending: true });
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      thumbOf.set(e, { src, url: u });
    });
    const monthKey = (title: string) => title.replace(/（\d+）$/, "");
    const item = (e: SoonEntry) => {
      const m = e.m, u = e.u;
      return (
        <Item
          thumb={thumbOf.get(e)}
          title={e.title}
          subtitle={e.lines.filter(Boolean).join("\n")}
          onTap={m ? () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) : u ? () => this.go(() => this.soonMovieView(u), `讀取《${u.title}》…`) : undefined}
        />
      );
    };
    return (
      <Page title="依電影找場次" subtitle={`即將上映 ${board.total} 部｜${board.open} 部可查場次`} onBack={() => this.back()}>
        {this.movieModeChips()}
        <Search value={this.movieQuery} placeholder="在即將上映裡搜尋片名" onInput={(t) => { this.movieQuery = t; }} />
        <Section hint={this.soonOpen === "when" && board.whens.length > 4 ? "可以左右滑動" : ""}>
          {fold("when", "上映時間", board.whenLabel)}
          {this.soonOpen === "when" ? (
            <Chips scroll>
              {board.whens.map((w) => <Chip label={w.label} sub={`${w.count} 部`} muted={w.id !== board.when} onTap={() => { this.soonWhen = w.id; this.soonOpen = ""; }} />)}
            </Chips>
          ) : null}
          {fold("state", "場次", board.stateLabel)}
          {this.soonOpen === "state" ? (
            <Chips scroll>
              {board.states.map((s) => <Chip label={s.label} sub={`${s.count} 部`} muted={s.id !== board.state} onTap={() => { this.soonState = s.id; this.soonOpen = ""; }} />)}
            </Chips>
          ) : null}
        </Section>
        {/* 每個月份一段，點月份那一列可以收合 */}
        {board.groups.map((g, i) => {
          const shut = this.soonShut.indexOf(monthKey(g.title)) >= 0;
          return (
            <Section hint={i === board.groups.length - 1 ? board.footer : ""}>
              <Item kv title={g.title} right={shut ? "展開 ▸" : "收合 ▾"} chevron={false} onTap={() => { const k = monthKey(g.title); this.soonShut = shut ? this.soonShut.filter((x) => x !== k) : [...this.soonShut, k]; }} />
              {shut ? null : g.items.map(item)}
            </Section>
          );
        })}
        {list.length ? null : <Empty icon="🎞" text="找不到相符的電影" />}
        {this.movieQuery.trim() ? this.searchAllLink(this.movieQuery.trim()) : null}
      </Page>
    );
  }

  /** 還沒有場次的即將上映片：海報、評分、預告，加上映日期 */
  async soonMovieView(u: UpcomingFilm): Promise<string> {
    const e = await this.extras(u.title, undefined, u.en);
    const date = u.release.replace(/-/g, "/");
    return (
      <Page title={u.title} subtitle={`${date} 上映`} onBack={() => this.back()}>
        {this.hero(e, u.title, [u.en, [`${date} ${u.approx ? "當週" : ""}上映`, u.rating, u.runtime ? `${u.runtime} 分` : ""].filter(Boolean).join("｜")].filter(Boolean), { en: u.en, poster: u.poster })}
        {u.intro ? (
          <Section title="劇情簡介" hint="簡介來自 TMDB。">
            <Para text={u.intro} />
          </Section>
        ) : null}
        <Note text="戲院還沒有排這部片的場次。通常上映前一到兩週會開放，到時候這裡會自動變成可以查場次。上映日期可能再調整。" />
        <Button label="🌐 開眼電影網的介紹" kind="secondary" onTap={() => Safari.open(u.url)} />
      </Page>
    );
  }

  // 日期、縣市、特殊廳都可以複選（點一下選、再點一下取消）；換一部片時日期重來
  infoOpen = false; // 電影頁的票房資訊有沒有展開（預設收合）
  movieFor = "";
  movieDates: string[] = []; // 空 = 來源預設的那一天（通常是今天）
  movieCities: string[] = []; // 空 = 全部
  movieFormats: string[] = []; // 空 = 全部
  movieFavOnly = false; // 只看收藏影城
  async movieView(m: TwMovie, date: string): Promise<string> {
    if (this.movieFor !== m.slug) {
      this.movieFor = m.slug;
      this.movieDates = date ? [date] : [];
    }
    const d = await movieDay(m.slug, undefined); // 預設那一天：片名、可選日期都從這裡來
    const dates = d.dates.filter((x) => x >= todayTPE());
    const allDates = dates.length ? dates : [d.date];
    const picked = this.movieDates.filter((x) => allDates.indexOf(x) >= 0);
    const selDates = picked.length ? picked.slice().sort() : [allDates.indexOf(d.date) >= 0 ? d.date : allDates[0]];
    const days = await movieDays(m.slug, selDates);
    const cities = Array.from(new Set(days.flatMap((x) => x.cinemas.map((c) => c.city)))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const selCities = this.movieCities.filter((c) => cities.indexOf(c) >= 0);
    const favIds = this.movieFavOnly ? this.settings.favorites : null;
    // 電影頁每間影城只列一種版本：把目前要顯示的影城補齊（最多等 1.5 秒，其餘補好後自動重畫）
    for (const day of days) {
      const fillIds = day.cinemas.filter((c) => (!selCities.length || selCities.indexOf(c.city) >= 0) && (!favIds || favIds.indexOf(c.id) >= 0)).map((c) => c.id);
      if (!movieDayFilled(day, fillIds)) {
        const job = foregroundTask(fillMovieDay(day, fillIds).catch(() => day));
        await Promise.race([job, sleep(this.rerendering ? 0 : 1500)]);
        if (!movieDayFilled(day, fillIds)) this.late.push(job);
      }
    }
    let runtime = d.runtime || m.runtime;
    const formats = FORMATS.filter((f) => days.some((x) => x.cinemas.some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0))));
    const selFormats = (this.movieFormats as Format[]).filter((f) => formats.indexOf(f) >= 0);
    const rows = movieRows(days, { cities: selCities, formats: selFormats, favIds });
    const many = selDates.length > 1; // 複選多天：每一列標日期
    const toCinema = (c: TwMovieCinema): Cinema =>
      this.cinemas.find((x) => x.id === c.id) ||
      { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address };
    const toggle = (list: string[], id: string, min1 = false) => {
      const i = list.indexOf(id);
      if (i < 0) return [...list, id];
      return min1 && list.length === 1 ? list : list.filter((x) => x !== id);
    };
    const x = await this.extras(m.title, m.slug, m.en);
    if (!runtime) runtime = await this.fillRuntime(m, 1500); // 來源沒給片長：查 TMDB／開眼補上
    const shownCities = cities.filter((ct) => rows.some((r) => r.cinema.city === ct));
    const about = movieAbout(d);
    // 票房資訊（出品國別、發行、票房、票數…）：跟歷年電影那一頁同一份官方資料；票房資料還沒列入的片只顯示狀態
    const box = await Promise.race([boxInfoBy(m.title).catch(() => null), sleep(this.rerendering ? 0 : 1200).then(() => null)]);
    const status = m.comingSoon ? "soon" : "now";
    return (
      <Page title={m.title} subtitle={[m.rating || d.rating, runtime ? `${runtime} 分鐘` : "", `${d.cinemas.length} 間影城`].filter(Boolean).join("｜")} onBack={() => this.back()}>
        {this.hero(x, m.title, [m.en, [m.rating || d.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"), releaseLabel(d.release || m.release || releaseOf(m.title)), `${d.cinemas.length} 間影城有放映`])}
        {about.text || about.credits ? (
          <Section title="劇情簡介" hint="簡介來自場次通。">
            <Para text={about.text || about.credits} dim={about.text ? about.credits : ""} />
          </Section>
        ) : null}
        {/* 狀態一直看得到；其餘的票房資訊預設收合，點了才展開（這一頁主要是找場次） */}
        <Section hint={box ? (this.infoOpen ? `資料來源：國家電影及視聽文化中心「全國電影票房統計」，官方每週更新一次。` : "點「票房資訊」可以展開，看票數、院數、發行商等更多資訊。") : ""}>
          <Item kv title="狀態" tag={{ text: STATUS_LABEL[status], tone: status }} />
          {box ? <Item kv title="票房資訊" right={`${money(box.x.total)}｜${this.infoOpen ? "收合 ▾" : "展開 ▸"}`} chevron={false} onTap={() => { this.infoOpen = !this.infoOpen; }} /> : <Item kv title="票房資訊" right="官方資料還沒列入" />}
          {box && this.infoOpen ? boxInfoRows(box.x, box.info).map(([label, value]) => <Item kv title={label} right={value} />) : null}
        </Section>
        {box && this.infoOpen ? this.runsSection(box.x) : null}
        <Section title="日期" hint="日期、縣市、特殊廳都可以複選。">
          <Chips>
            {allDates.map((dt) => (
              <Chip label={dateLabel(dt).replace(/（.）.*$/, "")} sub={dt === todayTPE() ? "今天" : dateLabel(dt).match(/（(.)）/)?.[1] || ""} muted={selDates.indexOf(dt) < 0} onTap={() => { this.movieDates = toggle(selDates, dt, true); }} />
            ))}
          </Chips>
        </Section>
        <Section title="縣市">
          <Chips>
            <Chip label="全部" muted={selCities.length > 0} onTap={() => { this.movieCities = []; }} />
            {cities.map((c) => (
              <Chip label={c} muted={selCities.indexOf(c) < 0} onTap={() => { this.movieCities = toggle(selCities, c); }} />
            ))}
          </Chips>
        </Section>
        {formats.length ? (
          <Section title="特殊廳">
            <Chips>
              <Chip label="全部" muted={selFormats.length > 0} onTap={() => { this.movieFormats = []; }} />
              {formats.map((f) => (
                <Chip label={f} muted={selFormats.indexOf(f) < 0} onTap={() => { this.movieFormats = toggle(selFormats, f); }} />
              ))}
            </Chips>
          </Section>
        ) : null}
        <Section title="影城">
          <Chips>
            <Chip label="所有影城" muted={this.movieFavOnly} onTap={() => { this.movieFavOnly = false; }} />
            <Chip label={`只看收藏影城（${this.settings.favorites.length}）`} muted={!this.movieFavOnly} onTap={() => { this.movieFavOnly = true; }} />
          </Chips>
        </Section>
        {shownCities.map((ct) => {
          const list = rows.filter((r) => r.cinema.city === ct);
          return (
            <Section title={`${ct}（${new Set(list.map((r) => r.cinema.id)).size} 間）`}>
              {list.map(({ day, date: dt, cinema: c }) => {
                const movie: Movie = { title: d.title || m.title, runtime, rating: d.rating || m.rating, versions: c.versions, runtimeFrom: d.runtime ? d.runtimeFrom : m.runtimeFrom };
                const summary = c.versions.map((v) => `${v.label} ${[...v.times].sort(byShowtime).join(" ")}`).join("／");
                return (
                  <Item
                    icon={this.settings.favorites.indexOf(c.id) >= 0 ? "★" : undefined}
                    title={many ? `${c.name}　${dateLabel(dt).replace(/ .*$/, "")}` : c.name}
                    subtitle={summary}
                    onTap={async () => {
                      // 還沒補齊的話，進選場次前先補這一間，確保看到所有版本
                      await fillMovieDay(day, [c.id]).catch(() => day);
                      const fresh = day.cinemas.find((y) => y.id === c.id);
                      const mv: Movie = { ...movie, versions: fresh ? filterVersionsAny(fresh.versions, selFormats) : movie.versions };
                      this.go(() => this.timesView(toCinema(c), dt, mv, { booking: "", sourceUrl: `${TW}/cinemas/${c.id}/${dt}/`, address: c.address }));
                    }}
                  />
                );
              })}
            </Section>
          );
        })}
        {rows.length ? null : <Empty icon="🎞" text={this.movieFavOnly && !this.settings.favorites.length ? "還沒有收藏的影城，先到影城頁加入。" : "沒有符合條件的影城，換個日期或條件試試。"} />}
      </Page>
    );
  }

  // ── 分享 ──
  /** 分享這部電影：一段文字加連結，朋友點了會直接開到這部片的頁面（網頁版） */
  async shareMovie(title: string, fest?: FavMovie["fest"]) {
    const url = `${SITE_URL}/?m=${encodeURIComponent(title)}${fest ? `&f=${encodeURIComponent(fest.id)}&ff=${encodeURIComponent(fest.film)}` : ""}`;
    await ShareSheet.present([`《${title}》${fest ? `｜${fest.name}` : ""}\n場次、評分、預告都在「片刻」：\n${url}`]);
  }
  /** 從分享連結進來（?m=片名）：找出這部片現在對應的頁面（有場次的電影頁、即將上映、影展片、票房資訊）直接打開 */
  async openShared(): Promise<void> {
    if (!IS_WEB) return;
    const search = String((globalThis as any).location?.search || "");
    const param = (name: string) => { const m = new RegExp(`[?&]${name}=([^&]*)`).exec(search); try { return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : ""; } catch (_) { return ""; } };
    const title = param("m").trim().slice(0, 120);
    if (!title) return;
    const fid = param("f"), film = param("ff");
    const fav: FavMovie = { key: communityKey(title), title, at: 0, ...(fid ? { fest: { id: fid.slice(0, 40), film: film.slice(0, 80), name: "" } } : {}) };
    if (!fav.key) return;
    const row = (await favMovieRows({ ...this.settings, favMovies: [fav] }).catch(() => [] as FavRow[]))[0];
    this.tab = "movies";
    this.stack = [() => this.movieListView()];
    if (row) this.openFavRow(row); else this.go(() => this.favMovieView(fav), `讀取《${title}》…`);
  }
  async share(p: Pick) {
    await ShareSheet.present([shareText({ ...p, address: p.address }, this.start(p), this.runtime ? this.end(p) : undefined, this.seat, this.settings.maps)]);
  }

  // ── 位置 ──
  me: LatLng | null = null;
  async locate(): Promise<LatLng> {
    if (this.me) return this.me;
    try {
      Location.setAccuracyToHundredMeters();
      const l = await Location.current();
      this.me = { lat: l.latitude, lng: l.longitude };
      return this.me;
    } catch (_) {
      throw new Error(IS_WEB ? "拿不到目前位置。請允許瀏覽器使用位置（iPhone：設定 → 隱私權與安全性 → 定位服務 → Safari 網站）。" : "拿不到目前位置。請到「設定 → 隱私權與安全性 → 定位服務 → Scriptable」允許使用位置。");
    }
  }

  async nearbyView(): Promise<string> {
    const me = await this.locate();
    const list = nearest(this.cinemas, me, 25);
    return (
      <Page title="附近的影城" subtitle="直線距離" onBack={() => this.back()}>
        <Section>
          {list.map(({ cinema: c, km }) => (
            <Item
              icon={this.settings.favorites.indexOf(c.id) >= 0 ? "★" : undefined}
              title={c.name}
              subtitle={`${c.city} ${c.district}`}
              right={kmLabel(km) || "距離未知"}
              onTap={() => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)}
            />
          ))}
        </Section>
      </Page>
    );
  }

  // ── 現在有什麼可以看 ──
  // 四個條件都可以複選（點一下選、再點一下取消）
  nowDates: string[] = []; // 空 = 今天
  nowWins: string[] = ["soon"]; // 空 = 整天
  nowScopes: string[] = ["fav"]; // fav / near / 縣市名稱
  nowFormats: string[] = []; // 空 = 不限
  nowView(): string {
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
    // 點一下加入、再點一下拿掉；min1 = 至少留一個
    const toggle = (list: string[], id: string, min1 = false) => {
      const i = list.indexOf(id);
      if (i < 0) return [...list, id];
      return min1 && list.length === 1 ? list : list.filter((x) => x !== id);
    };
    // 四個條件各收成一列（右邊是目前選的），點了才展開選項；「找場次」按鈕不用往下滑就看得到
    const dayName = (d: string) => (d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).replace(/\s.*$/, ""));
    const few = (list: string[], unit: string) => (list.length > 3 ? `${list.slice(0, 2).join("、")}等 ${list.length} ${unit}` : list.join("、"));
    const dateSum = few(selDates.slice().sort().map(dayName), "天");
    const winSum = selWins.length ? few(selWins.map((id) => wins.find((w) => w.id === id)!.label), "個時段") : "整天";
    const scopeName = (id: string) => (id === "all" ? "全台" : id === "fav" ? "收藏影城" : id === "near" ? "附近 10 間" : id);
    const scopeSum = few(this.nowScopes.map(scopeName), "個範圍");
    const fmtSum = this.nowFormats.length ? few(this.nowFormats, "種") : "不限";
    const fold = (id: string, title: string, summary: string) => (
      <Item kv title={title} right={`${summary} ${this.nowOpen === id ? "▾" : "▸"}`} chevron={false} onTap={() => { this.nowOpen = this.nowOpen === id ? "" : id; }} />
    );
    const hint = this.nowOpen === "date" ? "可以選好幾天；可以左右滑動。" : this.nowOpen === "win" ? "可以選好幾個；都不選就是整天。「接下來 3 小時」只找今天。" : this.nowOpen === "fmt" ? "都不選就是不限；選了幾種，就找其中任一種。可以左右滑動。" : "";
    return (
      <Page title="現在有什麼可以看" subtitle={`${dateSum}｜${winSum}｜${scopeSum}`} onBack={() => this.back()}>
        <Section hint={hint}>
          {fold("date", "日期", dateSum)}
          {this.nowOpen === "date" ? (
            <Chips scroll>
              {dates.map((d) => (
                <Chip label={dateLabel(d).replace(/（.）.*$/, "")} sub={d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).match(/（(.)）/)?.[1] || ""} muted={selDates.indexOf(d) < 0} onTap={() => { this.nowDates = toggle(selDates, d, true); }} />
              ))}
            </Chips>
          ) : null}
          {fold("win", "開演時段", winSum)}
          {this.nowOpen === "win" ? (
            <Chips scroll>
              {wins.map((w) => <Chip label={w.label} muted={selWins.indexOf(w.id) < 0} onTap={() => { this.nowWins = w.id === "all" ? ["all"] : toggle(selWins.filter((x) => x !== "all"), w.id); }} />)}
            </Chips>
          ) : null}
          {/* 影城的選項多（收藏、附近、全台、各縣市）：進一頁清單選 */}
          <Item kv title="影城" right={scopeSum} onTap={() => this.go(() => this.nowScopeView())} />
          {fold("fmt", "特殊廳", fmtSum)}
          {this.nowOpen === "fmt" ? (
            <Chips scroll>
              <Chip label="不限" muted={this.nowFormats.length > 0} onTap={() => { this.nowFormats = []; }} />
              {FORMATS.map((f) => <Chip label={f} muted={this.nowFormats.indexOf(f) < 0} onTap={() => { this.nowFormats = toggle(this.nowFormats, f); }} />)}
            </Chips>
          ) : null}
        </Section>
        <Button label="🔍 找場次" onTap={() => this.go(() => this.nowResultsView(selDates, selWins), "正在查詢各影城的場次…")} />
      </Page>
    );
  }
  nowOpen = ""; // 目前展開哪一列的選項（日期／時段／特殊廳）
  /** 「現在有什麼可以看」要找哪些影城：一列一個、可複選（全台跟其他的不能同時選） */
  nowScopeView(): string {
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99));
    const sel = this.nowScopes;
    const pick = (id: string) => {
      if (id === "all") return void (this.nowScopes = ["all"]);
      const rest = sel.filter((x) => x !== "all");
      const next = rest.indexOf(id) < 0 ? [...rest, id] : rest.filter((x) => x !== id);
      this.nowScopes = next.length ? next : rest; // 至少留一個
    };
    const row = (id: string, title: string, note: string, right: string) => <Item icon={sel.indexOf(id) >= 0 ? "✅" : "⬜️"} title={title} subtitle={note} right={right} chevron={false} onTap={() => pick(id)} />;
    return (
      <Page title="找哪些影城" subtitle={`已選 ${sel.length} 個`} onBack={() => this.back()}>
        <Section hint="可以選好幾個，合在一起找。">
          {row("fav", "收藏影城", "", `${this.settings.favorites.length} 間`)}
          {row("near", "附近 10 間", "依目前位置", "")}
          {row("all", "全台", "要讀每一間影城，最久", `${this.cinemas.length} 間`)}
        </Section>
        <Section title="縣市" hint="縣市的影城較多、選的天數越多，會花比較久時間。開眼來源的戲院通常只有今天的場次。選好之後按左上角的返回。">
          {cities.map((c) => row(c, c, "", `${this.cinemas.filter((x) => x.city === c).length} 間`))}
        </Section>
      </Page>
    );
  }

  favIssOpen = false; // 首頁的收藏發行商清單有沒有展開
  favOpen = false; // 首頁的收藏影城清單有沒有展開（預設收合）
  favMovOpen = IS_WEB && /[?&]fav=1/.test(String((globalThis as any).location?.search || "")); // 首頁的收藏電影清單有沒有展開（預設收合；從通知點進來時直接展開）
  nowFolded: string[] = []; // 「現在有什麼可以看」結果裡收合起來的片（只留片名列）
  nowFoldFor = ""; // 上面那份收合狀態是哪一次查詢的
  nowQuery = ""; // 在結果裡再搜尋的字
  async nowResultsView(dates: string[], winIds: string[]): Promise<string> {
    // 範圍複選：各範圍的影城合在一起，同一間只查一次（有距離的保留距離）
    const byId = new Map<string, { cinema: Cinema; km: number | null }>();
    const add = (list: { cinema: Cinema; km: number | null }[]) => list.forEach((x) => { const old = byId.get(x.cinema.id); if (!old || (old.km === null && x.km !== null)) byId.set(x.cinema.id, x); });
    for (const sc of this.nowScopes) {
      if (sc === "all") add(this.cinemas.map((c) => ({ cinema: c, km: null })));
      else if (sc === "near") add(nearest(this.cinemas, await this.locate(), 10));
      else if (sc === "fav") add(this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean).map((c) => ({ cinema: c as Cinema, km: null })));
      else add(this.cinemas.filter((c) => c.city === sc).map((c) => ({ cinema: c, km: null })));
    }
    const scope = Array.from(byId.values());
    if (!scope.length) throw new Error("沒有可以查的影城。先到影城頁收藏影城，或改選附近／縣市。");
    const { hits, failed, noData } = await findShowtimesMulti(scope, dates, winIds, this.nowFormats as Format[]);
    const groups = await linkMovies(groupByMovie(hits)); // 每部片對到電影清單上的那一部，片名才能連到電影頁
    prefetchPosters(groups); // 背景先抓海報，進電影頁就不用等
    // 每部片標題列的小海報：最多等 0.6 秒，其餘讀好後在原位補畫
    const jobs = groups.map((g) => moviePoster(g.title, g.movie?.slug, g.movie?.en).catch(() => ""));
    const got = await Promise.all(jobs.map((p) => Promise.race([p, sleep(this.rerendering ? 0 : 600).then(() => undefined)])));
    const pending = jobs.filter((_, i) => got[i] === undefined);
    if (pending.length) this.late = [Promise.all(pending)];
    const thumbOf = (title: string) => {
      const u = got[groups.findIndex((g) => g.title === title)];
      if (u === undefined) return { src: "", pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      return { src, url: u };
    };
    const scopeLabel = this.nowScopes.map((sc) => (sc === "all" ? "全台影城" : sc === "fav" ? "收藏影城" : sc === "near" ? "附近 10 間" : sc)).join("、");
    const many = dates.length > 1; // 複選多天：每一場前面標日期
    // 收合：換了查詢條件就全部重新展開
    const foldKey = [dates.join(","), winIds.join(","), this.nowScopes.join(","), this.nowFormats.join(",")].join("|");
    if (this.nowFoldFor !== foldKey) { this.nowFoldFor = foldKey; this.nowFolded = []; this.nowQuery = ""; }
    const shown = nowFilter(groups, this.nowQuery); // 在結果裡再搜尋（片名、影城、廳別）
    const folded = (t: string) => this.nowFolded.indexOf(t) >= 0;
    const allFolded = shown.length > 0 && shown.every((g) => folded(g.title));
    const open = (hit: Hit) => {
      this.runtime = hit.movie.runtime;
      this.seat = hallOf(hit.version.label);
      this.go(() => this.confirmView({ cinema: hit.cinema, address: hit.ctx.address || hit.cinema.address || "", booking: hit.ctx.booking, sourceUrl: hit.ctx.sourceUrl, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time }));
    };
    return (
      <Page title={multiLabel(dates, winIds)} subtitle={`${hits.length} 場｜${groups.length} 部電影`} onBack={() => this.back()}>
        {/* 完整的查詢條件放在內文（標題列只有一行，複選多了會被截掉） */}
        <Note text={`${multiDetail(dates, winIds)}\n影城：${scopeLabel}${this.nowFormats.length ? `\n特殊廳：${this.nowFormats.join("、")}` : ""}`} />
        {groups.length ? null : <Empty icon="🍿" text="沒有符合的場次，換個時段或範圍試試。" />}
        {groups.length > 1 ? <Search value={this.nowQuery} placeholder="在結果裡搜尋片名、影城或廳別" onInput={(t) => { this.nowQuery = t; }} /> : null}
        {this.nowQuery.trim() ? <Note text={shown.length ? `「${this.nowQuery.trim()}」：${shown.reduce((n, g) => n + g.hits.length, 0)} 場｜${shown.length} 部電影。清空搜尋欄就回到全部結果。` : `結果裡找不到「${this.nowQuery.trim()}」。清空搜尋欄就回到全部結果。`} /> : null}
        {shown.length > 1 ? (
          <Button
            label={allFolded ? "▸ 全部展開場次" : "▾ 全部收合，只看片名"}
            kind="secondary"
            onTap={() => { this.nowFolded = allFolded ? [] : shown.map((g) => g.title); }}
          />
        ) : null}
        {shown.map((g) => (
          <Section>
            {/* 片名獨立一列（海報、大字、有底色），點下去是電影頁：簡介、預告、所有影城的場次 */}
            <Item
              head
              thumb={thumbOf(g.title)}
              title={g.title}
              subtitle={nowGroupLine(g) + (g.movie ? "\n點片名看電影介紹與所有場次" : "")}
              onTap={g.movie ? () => this.go(() => this.movieView(g.movie as TwMovie, ""), `讀取《${g.title}》…`) : undefined}
              action={{ label: folded(g.title) ? "▸" : "▾", hint: folded(g.title) ? "展開這部片的場次" : "收合這部片的場次", onTap: () => { this.nowFolded = folded(g.title) ? this.nowFolded.filter((t) => t !== g.title) : [...this.nowFolded, g.title]; } }}
            />
            {(folded(g.title) ? [] : g.hits).map((hit) => (
              <Item
                title={`${many && hit.day ? dateLabel(hit.day).replace(/ .*$/, "") + " " : ""}${hit.time}${isLate(hit.time) ? "（凌晨）" : ""}　${hit.cinema.name}`}
                subtitle={[hit.version.label, kmLabel(hit.km)].filter(Boolean).join("｜")}
                onTap={() => open(hit)}
              />
            ))}
          </Section>
        ))}
        {failed.length ? <Note kind="warn" text={`有 ${failed.length} 間讀取失敗：${failed.join("、")}`} /> : null}
        {noData.length ? <Note text={`這幾間目前沒有所選日期的場次資料（來源還沒更新），請到影城官網查詢：${noData.join("、")}`} /> : null}
      </Page>
    );
  }

  // 從捷徑或 Safari 分享場次通／誠品／光點網址時，直接跳到那間影城
  startFrom(url: string): boolean {
    const m = url.match(/twshowtimes\.com\/cinemas\/([^/]+)\/(?:(\d{4}-\d{2}-\d{2})\/)?/);
    let c: Cinema | undefined;
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
}

// 網頁版由 web/entry.ts 先放好 __webPlatform
setPlatform((globalThis as any).__webPlatform || scriptablePlatform);
await new App().run();
Script.complete();
