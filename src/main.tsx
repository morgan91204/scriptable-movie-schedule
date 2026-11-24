// 🎬 片刻：選影城 → 日期 → 電影 → 場次 → 加入 iOS 行事曆
// 執行環境：Scriptable（iOS）。原始碼用 TSX 撰寫，編譯後的 .js 放進 Scriptable 執行。
// 畫面：WebView（HTML/CSS），事件迴圈在 run()。資料層在 core.ts，網頁解析在 parsers.ts。

import { SOCIALS, socialIcon } from "./brand";
import { readLetterboxd, lbxNote, LBX_NOTE_MAX } from "./lbx";
import type { LbxItem } from "./lbx";
import { loadYearRatings, normTitle as lbxNorm } from "./core";
import { h, Fragment, Page, Section, Item, Chips, Chip, Button, Search, PickRow, Note, Para, Loading, Empty, Hero, Steps } from "./jsx";
import type { RatingBadge } from "./jsx";
import { UI } from "./ui";
import { setPlatform } from "./platform";
import { scriptablePlatform } from "./platform-scriptable";
import {
  Cinema, Settings, Movie, Version, EXTRA, CITY_ORDER, AD_STEPS,
  todayTPE, nowHM, addDays, isLate, dateLabel, tpeDate, fmt, byShowtime,
  loadSettings, saveSettings, settingsStored, setSettingsSavedHook, syncPick, syncApply, syncMerge, loadCinemas, datesOf, moviesOf, loadMovies, movieDay, communityKey, globalSearch, issuerRecent, favSnapGet, favSnapSet, boxIsRerun, boxHasLaterRun, boxRunRows, boxRunsName, loadIntro, rerunDataReady, SITE_URL, TW,
  FORMATS, formatsOf, filterVersions, filterVersionsAny, movieRows, movieDays, nearest, kmLabel, WINDOWS, findShowtimes, findShowtimesMulti, multiLabel, multiDetail, groupByMovie, fillMovieDay, movieDayFilled, movieCinemaVersions, showDay, lateIsTonight, shareText,
  hallOf, tmdbTest, movieExtras, moviePoster, movieRuntime, posterSrc, cachePoster, prefetchPosters, movieLines, releaseLabel, releaseOf, boxOfficeLines, boxOfficeNote, boxOfficeBy, boxOfficeTitle, boxOfficeFooter, boxCountries, boxByCountry, boxInfo, boxInfoRows, boxCountryText, BOX_COUNTRY_NOTE, boxCountryTag, boxCountriesPicked, loadMovieBoard, loadSoonBoard, notifyPrefs, notifyPayload, notifyEndScope, notifyEndPick, notifyQuiet, NOTIFY_PRE_STEPS, NOTIFY_KINDS, boxStatus, STATUS_LABEL, boxInfoBy, isFavMovie, toggleFavMovie, favMovieRows, favMovieBox, soonGroups, boxSorts, boxYears, boxYearsPicked, boxMatcher, posterLight, BOX_PAGE, foregroundTask, communityStats, communityCached, communityVote, communityTags, agoLabel, social, signedIn, profileInk, PROFILE_EMOJI, WATCH_HOW, howLabel, profileSkipped, setProfileSkipped, setAccount, setSiteBase, setNotesViaSite, adoptRatings, forgetMyVotes, noteMax, profileColor, seenLabel, PROFILE_COLORS, sendFeedback, loadMyFeedback, feedbackSent, feedbackUnread, feedbackMarkSeen, feedbackCat, FEEDBACK_CATS, FEEDBACK_STATUS, FEEDBACK_MAX, loadNotes, notesCached, addNote, deleteNote, spoilNote, voteNote, noteHot, NOTE_FOLD_AT, reportNote, noteLooksSpoiler, noteDate, NOTE_MAX, NOTE_PLACEHOLDER, NOTE_RULES, REPORT_REASONS, reviewTagsToggle, REVIEW_TAGS, reviewTagsFull, REVIEW_TAGS_NOTE, reviewTagLabel, topReviewTags, loadBoxOffice, loadBoxOfficeFull, loadBoxOfficeWeeks, boxWeekOptions, boxWeekPicked, money, matchBoxOffice, boxOfficeLabel, mapsUrl, MAPS_LABEL, TMDB_LINKS, extractTmdbKey, cinemaApp, bookingUrl, checkLatest, ABOUT_URL, PRIVACY_URL, ADS_NOTE, loadFestivals, festivalsReady, festivalNote, festivalDates, festivalDay, festivalLines, festivalFilmSessions, festivalPlace, festivalCinema, festivalDefaultDate, festivalStateLabel, festivalState, festivalFooter, linkMovies, nowGroupLine, nowFilter, festivalPick, movieAbout, festivalSearch, festivalSearchLines, festivalTrailer, festivalYears, festivalsAny, festivalGroups, festivalChipNote, festivalStatusLine, movieRatings, ratingTier, tomatoTier, popcornTier, popcornCount,
} from "./core";
import type { Activity, Profile, DiaryEntry, SocialCounts, Feedback, ReviewNote, MovieExtras, Ratings, Community, BoxOfficeItem, BoxSort, MovieEntry, SoonEntry, UpcomingFilm, FavMovie, FavRow, NotifyPrefs, NotifyKind, SyncData, GlobalHits, Festival, FestivalFilm, FestivalSession } from "./core";
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

const PERSON_ADD = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="8" r="3.6"/><path d="M3 20a7 7 0 0 1 14 0"/><path d="M19 7v6M16 10h6"/></svg>';
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
  /** 網頁版多一個「社群」（追蹤對象的動態、通知、找人）；其他版本沒有帳號，不顯示 */
  get TABS(): { id: string; label: string; icon: string }[] {
    return [
      { id: "home", label: "首頁", icon: "house" },
      { id: "movies", label: "電影", icon: "film" },
      { id: "cinemas", label: "影城", icon: "building" },
      ...(this.sync() ? [{ id: "activity", label: "社群", icon: "people" }] : []),
      { id: "settings", label: "設定", icon: "gear" },
    ];
  }
  unread = 0; // 還沒看過的通知有幾筆（頁籤上的紅點）
  lastTabTap = { id: "", at: 0 }; // 上一次點的是哪個頁籤、什麼時候（用來認「連點兩下」）
  /** 點下面的頁籤。連點同一個兩下（0.6 秒內）＝重新整理：整頁重新載入，資料重抓，有新版也會順便換上，並回到同一個頁籤 */
  tapTab(id: string) {
    const now = Date.now();
    const twice = IS_WEB && this.lastTabTap.id === id && now - this.lastTabTap.at < 600;
    this.lastTabTap = { id, at: now };
    if (twice) {
      const G = globalThis as any;
      try { G.sessionStorage.setItem("ms:reload-tab", id); } catch (_) {}
      this.ui.toast("重新整理中…").catch(() => undefined);
      G.setTimeout(() => G.location.reload(), 150);
      return;
    }
    this.switchTab(id);
  }
  switchTab(id: string) {
    this.tab = id;
    if (id === "activity") this.socialTab = ""; // 每次點進社群頁籤：有新通知就先看通知，沒有就看動態
    const root: Record<string, [View, string]> = {
      home: [() => this.homeView(), "讀取中…"],
      movies: [() => this.movieListView(), "讀取電影清單…"],
      cinemas: [() => this.citiesView(), "讀取中…"],
      settings: [() => this.settingsView(), "讀取中…"],
      activity: [() => this.activityView(), "讀取中…"],
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
    setTabBar(() => ({ active: this.tab, items: this.TABS.map((t) => ((t.id === "settings" && this.logUnread()) || (t.id === "activity" && this.unread > 0) ? { ...t, dot: true } : t)), onTap: (id) => this.tapTab(id) }));
    setBackGuard(() => this.stack.length > 1);
    this.go(() => this.homeView(), "讀取影城清單…");
    // 從通知點進來（?tab=soon／?tab=fest）：直接開電影分頁的那一類
    const startTab = IS_WEB ? (/[?&]tab=(soon|fest|activity|admin)\b/.exec(String((globalThis as any).location?.search || "")) || [])[1] : "";
    if (startTab === "activity") { if (this.sync()) { this.switchTab("activity"); this.socialTab = "act"; } }
    else if (startTab === "admin") { this.switchTab("settings"); if (this.sync()) this.go(() => this.adminHomeView(), "讀取中…"); } // 從「有新的檢舉／回饋」的通知點進來
    else if (startTab) { this.movieMode = startTab as "soon" | "fest"; this.switchTab("movies"); }
    // 連點頁籤重新整理之後：回到剛才那個頁籤
    if (IS_WEB) { try { const G = globalThis as any; const t = G.sessionStorage.getItem("ms:reload-tab"); if (t) { G.sessionStorage.removeItem("ms:reload-tab"); if (/^(movies|cinemas|settings|activity)$/.test(t)) this.switchTab(t); } } catch (_) {} }
    // 登入的人：開機時看一下有沒有新通知（頁籤上的紅點），不等它
    this.pushSync(); // 有開通知的話：讓通知伺服器知道這台登入的是誰、勿擾時段等設定是不是最新的
    const peek = () => { if (signedIn()) social<{ unread?: number }>("me").then((d) => this.setUnread(d.unread || 0), () => undefined); else this.setUnread(0); };
    peek();
    // 從背景切回來：再看一次有沒有新通知（頁籤紅點、主畫面圖示上的數字），最多半分鐘一次
    if (IS_WEB) { try { let last = Date.now(); const D = (globalThis as any).document; D.addEventListener("visibilitychange", () => { if (D.visibilityState === "visible" && Date.now() - last > 30e3) { last = Date.now(); peek(); } }); } catch (_) {} }
    await this.openShared().catch(() => undefined);
    if (this.followedAfterLogin) {
      // 為了追蹤某個人才登入的：回到他的個人頁，再帶去取暱稱（設過或按過稍後再說就不問）
      const who = this.followedAfterLogin;
      this.switchTab("settings"); this.go(() => this.profileView(who), "讀取個人頁…");
      this.ui.toast(`已登入，並追蹤了 ${who}`).catch(() => undefined);
      await this.askNickname().catch(() => undefined);
    } else if (this.syncNote) { this.switchTab("settings"); this.go(() => this.syncView()); } // 剛從 Google 登入回來：直接到同步那一頁看結果
    // 網頁版的新手引導（從分享連結、通知點進來的不打擾，只在停在首頁時才出現）
    if (IS_WEB && this.tab === "home" && this.stack.length === 1 && !/[?&](u|tab|fav|c|m)=/.test(String((globalThis as any).location?.search || ""))) {
      if (this.isStandalone()) {
        // 第一次從主畫面的圖示開啟：問要不要開通知（只問這一次；之後寫短評、追蹤別人時還會再問）
        // 問完通知（不管開不開）接著問要不要用 Google 登入；這台已經開了通知或不支援通知的，直接問登入
        if (!this.settings.firstRunAsked) { this.settings.firstRunAsked = true; saveSettings(this.settings); if (!(await this.askNotify(true).catch(() => false))) this.askLogin(); }
      } else if (!this.settings.installSeen) {
        // 第一次用瀏覽器打開：先告訴他可以加到主畫面（可以跳過，之後首頁最上面還有一條提醒）
        this.settings.installSeen = Date.now(); saveSettings(this.settings);
        this.go(() => this.installView(true));
      }
    }
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

  showAll: string[] = []; // 搜尋結果裡，哪幾組已經展開成「全部列出」
  shutGroups: string[] = []; // 搜尋結果裡，哪幾組被收合起來（只留標題那一列）
  showAllFor = ""; // 上面兩份是哪一頁、哪個搜尋字的（換了就重來）
  /** 搜尋結果的每一組：
   *  - head：標題那一列（名稱＋筆數），點一下收合／展開這一組
   *  - lim：這一組先列前幾筆；more：超過的給一列「顯示全部 N 部」，點了在原地全部列出，再點收回去
   *  換了搜尋字就全部恢復原狀 */
  showAllOf(scope: string, max: number): { lim: (id: string) => number; more: (id: string, n: number, unit: string) => string | null; head: (id: string, title: string) => string; shut: (id: string) => boolean } {
    if (this.showAllFor !== scope) { this.showAllFor = scope; this.showAll = []; this.shutGroups = []; }
    const open = (id: string) => this.showAll.indexOf(id) >= 0;
    const shut = (id: string) => this.shutGroups.indexOf(id) >= 0;
    return {
      shut,
      lim: (id) => (shut(id) ? 0 : open(id) ? Infinity : max),
      more: (id, n, unit) => (!shut(id) && n > max ? <Item title={open(id) ? `只顯示前 ${max} ${unit}` : `顯示全部 ${n} ${unit}`} right={open(id) ? "▴" : "▾"} accent chevron={false} onTap={() => { this.showAll = open(id) ? this.showAll.filter((x) => x !== id) : [...this.showAll, id]; }} /> : null),
      head: (id, title) => <Item kv title={title} right={shut(id) ? "展開 ▸" : "收合 ▾"} chevron={false} onTap={() => { this.shutGroups = shut(id) ? this.shutGroups.filter((x) => x !== id) : [...this.shutGroups, id]; }} />,
    };
  }
  /** 「最符合」那一塊：名稱跟搜尋字完全一樣的，不分類別放在最上面；每一列標出它是哪一類。heart = 收藏電影頁用的愛心 */
  bestRows(hits: GlobalHits, heart?: (title: string, extra?: { en?: string; poster?: string; fest?: FavMovie["fest"] }) => { label: string; hint?: string; onTap: () => void }): string[] {
    return hits.best.map((b) => {
      if (b.kind === "cinema") return heart ? "" : <Item icon="🎦" title={b.c.name} subtitle={`影城｜${b.c.city} ${b.c.district}`} onTap={() => this.go(() => this.cinemaView(b.c), `讀取 ${b.c.name} 的場次…`)} />;
      if (b.kind === "now") return <Item title={b.m.title} subtitle={["現正上映", movieLines(b.m)[0]].filter(Boolean).join("｜")} tag={{ text: "上映中", tone: "now" }} onTap={() => this.go(() => this.movieView(b.m, ""), `讀取《${b.m.title}》的放映影城…`)} action={heart ? heart(b.m.title, { en: b.m.en }) : undefined} />;
      if (b.kind === "soon") { const e = b.e; return <Item title={e.title} subtitle={["即將上映", e.lines[0]].filter(Boolean).join("｜")} onTap={e.m ? () => this.go(() => this.movieView(e.m!, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u!), `讀取《${e.title}》…`) : undefined} action={heart ? heart(e.title, { en: e.m ? e.m.en : e.u ? e.u.en : "", poster: e.u ? e.u.poster : undefined }) : undefined} />; }
      if (b.kind === "year") { const x = b.x; return <Item title={x.name} subtitle={[boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜")} tag={{ text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }} onTap={() => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`)} action={heart ? heart(x.name) : undefined} />; }
      return <Item title={b.film.title} subtitle={`影展｜${b.f.start.slice(0, 4)} ${b.f.name}`} onTap={() => this.go(() => this.festivalFilmView(b.f, b.film))} action={heart ? heart(b.film.title, { poster: b.film.poster, fest: { id: b.f.id, film: b.film.id, name: b.f.name } }) : undefined} />;
    }).filter(Boolean);
  }
  /** 搜尋結果最上面的兩塊：「最符合」（可以收合），以及照原本的字找不到時的說明 */
  searchTop(hits: GlobalHits, q: string, tools: { head: (id: string, title: string) => string; shut: (id: string) => boolean }, heart?: Parameters<App["bestRows"]>[1]): string {
    const rows = this.bestRows(hits, heart);
    return (
      <>
        {hits.loose ? <Note text={`找不到完全符合「${q}」的結果，你是不是要找下面這些？`} /> : null}
        {rows.length ? (
          <Section>
            {tools.head("best", `最符合（${rows.length}）`)}
            {tools.shut("best") ? null : rows}
          </Section>
        ) : null}
      </>
    );
  }
  /** 清單的小海報：跟「依電影找場次」的清單同一套做法、同一份海報快取。
   *  手機上記過的立刻有；沒記過的最多等一下（wait 毫秒），其餘讀好後每 8 張在原位補畫一次。
   *  傳進來每一列的鍵和「怎麼找這張海報」，回傳一個用鍵取縮圖的函式 */
  async listThumbs(items: { key: string; job: () => Promise<string> }[], wait = 600): Promise<(key: string) => { src: string; url?: string; pending?: boolean } | undefined> {
    const jobs = items.map((x) => { try { return x.job().catch(() => ""); } catch (_) { return Promise.resolve(""); } });
    const got = await Promise.all(jobs.map((j) => Promise.race([j, sleep(this.rerendering ? 0 : wait).then(() => undefined)])));
    const pending = jobs.filter((_, i) => got[i] === undefined);
    const batches: Promise<unknown>[] = [];
    for (let i = 0; i < pending.length; i += 8) batches.push(Promise.all(pending.slice(i, i + 8)));
    if (batches.length) this.late = [...(this.late || []), ...batches];
    const map = new Map<string, string | undefined>();
    items.forEach((x, i) => map.set(x.key, got[i]));
    return (key: string) => {
      if (!map.has(key)) return undefined;
      const u = map.get(key);
      if (u === undefined) return { src: "", pending: true };
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u); // 這次用網址顯示，順便抓進快取
      return { src, url: u };
    };
  }
  /** 各種片怎麼找海報：有場次的片、即將上映、已下檔（票房資料）、影展片、收藏的片 */
  posterJobOf = {
    movie: (m: TwMovie) => () => moviePoster(m.title, m.slug, m.en),
    soon: (e: SoonEntry) => () => (e.m ? moviePoster(e.m.title, e.m.slug, e.m.en) : e.u && e.u.poster ? Promise.resolve(e.u.poster) : moviePoster(e.title)),
    box: (x: BoxOfficeItem) => () => posterLight(x.name, x.release),
    fest: (film: FestivalFilm) => () => (film.poster ? Promise.resolve(film.poster) : moviePoster(film.title)),
    fav: (r: FavRow) => () => {
      const t = r.target;
      if (t.kind === "movie") return moviePoster(t.m.title, t.m.slug, t.m.en);
      if (t.kind === "soon") return t.u.poster ? Promise.resolve(t.u.poster) : moviePoster(t.u.title);
      if (t.kind === "fest") return t.film.poster || r.fav.poster ? Promise.resolve(t.film.poster || r.fav.poster || "") : moviePoster(r.fav.title);
      if (t.kind === "box") return posterLight(t.x.name, t.x.release).then((u) => u || r.fav.poster || "");
      return r.fav.poster ? Promise.resolve(r.fav.poster) : moviePoster(r.fav.title);
    },
  };
  favRowsMemo: { sig: string; at: number; job: Promise<FavRow[]> } | null = null;
  /** 收藏了哪些片（片名鍵＋影展）：清單有增減，這串字就不一樣 */
  favSig(): string { return (this.settings.favMovies || []).map((f) => f.key + (f.fest ? "@" + f.fest.id : "")).join(","); }
  /** 收藏的每部片現在的狀態：同一份收藏清單 5 分鐘內只查一次（首頁展開、返回、收藏電影頁都共用） */
  favRowsJob(): Promise<FavRow[]> {
    const sig = this.favSig();
    const m = this.favRowsMemo;
    if (m && m.sig === sig && Date.now() - m.at < 5 * 60e3) return m.job;
    const job = favMovieRows(this.settings).catch(() => [] as FavRow[]);
    this.favRowsMemo = { sig, at: Date.now(), job };
    return job;
  }
  favQuery = ""; // 收藏電影頁的搜尋字
  favJob: { q: string; job: Promise<GlobalHits> } | null = null;
  /** 收藏電影頁：管理收藏電影的地方。上面是已經收藏的（含現在的狀態）；
   *  搜尋會把全部的電影一起找：上映中、即將上映、已下檔（2016 年至今）、影展片（含往年）。
   *  點片名進那部片的頁面；點右邊的愛心收藏或取消 */
  async favManageView(): Promise<string> {
    const favs = this.settings.favMovies || [];
    const q = this.favQuery.trim();
    const heart = (title: string, extra?: { en?: string; poster?: string; fest?: FavMovie["fest"] }) => {
      const on = isFavMovie(this.settings, title);
      return { label: on ? "♥" : "♡", hint: on ? "取消收藏" : "收藏這部電影", onTap: () => { toggleFavMovie(this.settings, { title, ...(extra || {}) }); saveSettings(this.settings); this.pushSync(); } };
    };
    const MAX = 20; // 每一組先列 20 部，其餘點「顯示全部」展開
    const tools = this.showAllOf("fav|" + q, MAX);
    const { lim, more, head } = tools;
    let body: string;
    if (q) {
      // 歷年電影和影展片單第一次要下載：先畫已經有的，讀好再補上（不能讓整頁換成「讀取中」，搜尋欄會不見）
      if (!this.favJob || this.favJob.q !== q) this.favJob = { q, job: globalSearch(q, []) };
      const job = this.favJob.job;
      const hits = await Promise.race([job, sleep(this.rerendering ? 0 : 150).then(() => null)]);
      if (!hits) this.late = [job];
      const total = hits ? hits.now.length + hits.soon.length + hits.year.length + hits.fest.length : 0;
      // 畫面上這幾組實際列出來的片，才去找海報
      const thumb = hits ? await this.listThumbs([
        ...hits.now.slice(0, lim("now")).map((m) => ({ key: "now|" + m.slug, job: this.posterJobOf.movie(m) })),
        ...hits.soon.slice(0, lim("soon")).map((e) => ({ key: "soon|" + e.key, job: this.posterJobOf.soon(e) })),
        ...hits.year.slice(0, lim("year")).map((x) => ({ key: "year|" + x.name + "|" + x.release, job: this.posterJobOf.box(x) })),
        ...hits.fest.slice(0, lim("fest")).map(({ f, film }) => ({ key: "fest|" + f.id + "|" + film.id, job: this.posterJobOf.fest(film) })),
      ], 300) : () => undefined;
      body = !hits ? <Note text="正在找電影…" /> : (
        <>
          {this.searchTop(hits, q, tools, heart)}
          {hits.now.length ? (
            <Section>
              {head("now", `現正上映（${hits.now.length}）`)}
              {hits.now.slice(0, lim("now")).map((m) => <Item thumb={thumb("now|" + m.slug)} title={m.title} subtitle={movieLines(m).filter(Boolean).join("\n")} tag={{ text: "上映中", tone: "now" }} onTap={() => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)} action={heart(m.title, { en: m.en })} />)}
              {more("now", hits.now.length, "部")}
            </Section>
          ) : null}
          {hits.soon.length ? (
            <Section>
              {head("soon", `即將上映（${hits.soon.length}）`)}
              {hits.soon.slice(0, lim("soon")).map((e) => <Item thumb={thumb("soon|" + e.key)} title={e.title} subtitle={e.lines.filter(Boolean).join("\n")} onTap={e.m ? () => this.go(() => this.movieView(e.m!, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u!), `讀取《${e.title}》…`) : undefined} action={heart(e.title, { en: e.m ? e.m.en : e.u ? e.u.en : "", poster: e.u ? e.u.poster : undefined })} />)}
              {more("soon", hits.soon.length, "部")}
            </Section>
          ) : null}
          {hits.year.length ? (
            <Section>
              {head("year", `已下檔（${hits.year.length}）`)}
              {hits.year.slice(0, lim("year")).map((x) => <Item thumb={thumb("year|" + x.name + "|" + x.release)} title={x.name} subtitle={[boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜")} tag={{ text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }} onTap={() => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`)} action={heart(x.name)} />)}
              {more("year", hits.year.length, "部")}
            </Section>
          ) : null}
          {hits.fest.length ? (
            <Section>
              {head("fest", `影展（${hits.fest.length}）`)}
              {hits.fest.slice(0, lim("fest")).map(({ f, film }) => <Item thumb={thumb("fest|" + f.id + "|" + film.id)} title={film.title} subtitle={`${f.start.slice(0, 4)} ${f.name}`} onTap={() => this.go(() => this.festivalFilmView(f, film))} action={heart(film.title, { poster: film.poster, fest: { id: f.id, film: film.id, name: f.name } })} />)}
              {more("fest", hits.fest.length, "部")}
            </Section>
          ) : null}
          {total ? null : <Empty icon="🔎" text="找不到相符的電影，換個關鍵字試試。" />}
        </>
      );
    } else {
      // 沒搜尋：已經收藏的（含現在的狀態），加上現正上映的片可以直接點愛心
      const rows = favs.length ? await this.favRowsJob() : []; // 這次執行查過（5 分鐘內）就直接用
      const movies = (await loadMovies().catch(() => [] as TwMovie[])).filter((m) => !m.comingSoon);
      const thumb = await this.listThumbs([
        ...rows.map((r) => ({ key: "fav|" + r.fav.key, job: this.posterJobOf.fav(r) })),
        ...movies.slice(0, 40).map((m) => ({ key: "now|" + m.slug, job: this.posterJobOf.movie(m) })),
      ]);
      body = (
        <>
          <Section title={`已收藏（${favs.length}）`} hint={favs.length ? "點片名進那部片的頁面；點 ♥ 取消收藏。下檔的片也會留在這裡。" : "還沒有收藏。用上面的搜尋找電影，或在下面的清單點 ♡。"}>
            {rows.map((r) => <Item thumb={thumb("fav|" + r.fav.key)} title={r.fav.title} subtitle={r.line} onTap={() => this.openFavRow(r)} action={heart(r.fav.title)} />)}
          </Section>
          <Section title={`現正上映（${movies.length}）`} hint="已下檔的片、即將上映的片、影展片，用上面的搜尋找。">
            {movies.slice(0, 40).map((m) => <Item thumb={thumb("now|" + m.slug)} title={m.title} subtitle={movieLines(m)[0]} onTap={() => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)} action={heart(m.title, { en: m.en })} />)}
          </Section>
        </>
      );
    }
    return (
      <Page title="收藏電影" subtitle={favs.length ? `已收藏 ${favs.length} 部` : "上映中、即將上映、已下檔、影展都找得到"} onBack={() => this.back()}>
        <Search value={this.favQuery} placeholder="搜尋全部的電影（含已下檔、影展片）" onInput={(t) => { this.favQuery = t; }} />
        {body}
      </Page>
    );
  }
  cinemaFavQuery = ""; // 收藏影城頁的搜尋字
  cinemaFavOpen: string[] = []; // 收藏影城頁裡展開的縣市（預設全部收合，點了才展開）
  /** 收藏影城頁：管理收藏影城的地方。上面是已經收藏的；下面是全台的影城，依縣市分組（點縣市展開），可以搜尋。
   *  點名稱進那間影城；點右邊的星號收藏或取消 */
  async cinemaManageView(): Promise<string> {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    const ids = this.settings.favorites;
    const isFav = (c: Cinema) => ids.indexOf(c.id) >= 0;
    const row = (c: Cinema) => <Item icon="🎦" title={c.name} subtitle={`${c.city} ${c.district}`} onTap={() => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)} action={{ label: isFav(c) ? "★" : "☆", hint: isFav(c) ? "取消收藏這間影城" : "收藏這間影城", onTap: () => this.toggleFav(c) }} />;
    const favs = ids.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean) as Cinema[];
    // 收藏裡有、但影城清單上已經沒有的（歇業、改名後代碼換了）：列出來讓人自己決定要不要拿掉，不會默默留著
    const gone = ids.filter((id) => !this.cinemas.some((c) => c.id === id));
    const k = this.cinemaFavQuery.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : [];
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99));
    const open = (city: string) => this.cinemaFavOpen.indexOf(city) >= 0;
    return (
      <Page title="收藏影城" subtitle={ids.length ? `已收藏 ${ids.length} 間` : `全台 ${this.cinemas.length} 間影城`} onBack={() => this.back()}>
        <Search value={this.cinemaFavQuery} placeholder="搜尋影城，例如：松仁、西門、in89、台南" onInput={(t) => { this.cinemaFavQuery = t; }} />
        {k ? (
          <Section title={`符合「${this.cinemaFavQuery.trim()}」的 ${hits.length} 間`}>
            {hits.map(row)}
            {hits.length ? null : <Note text="找不到相符的影城，換個關鍵字試試。" />}
          </Section>
        ) : (
          <>
            <Section title={`已收藏（${ids.length}）`} hint={ids.length ? "點名稱進那間影城；點 ★ 取消收藏。" : "還沒有收藏。用上面的搜尋找影城，或展開下面的縣市點 ☆。"}>
              {favs.map(row)}
              {gone.map((id) => <Item icon="⚠️" title={id} subtitle="這間影城已經不在清單上（可能歇業或改名）" chevron={false} action={{ label: "移除", hint: "從收藏拿掉", onTap: () => { this.settings.favorites = ids.filter((z) => z !== id); saveSettings(this.settings); this.pushSync(); } }} />)}
            </Section>
            <Section title="全台影城" hint="點縣市展開，再點 ☆ 收藏。">
              {cities.map((city) => {
                const list = this.cinemas.filter((c) => c.city === city);
                const n = list.filter(isFav).length;
                return (
                  <>
                    <Item kv title={city} right={`${n ? `已收藏 ${n}｜` : ""}${list.length} 間 ${open(city) ? "▾" : "▸"}`} chevron={false} onTap={() => { this.cinemaFavOpen = open(city) ? this.cinemaFavOpen.filter((x) => x !== city) : [...this.cinemaFavOpen, city]; }} />
                    {open(city) ? list.map(row) : null}
                  </>
                );
              })}
            </Section>
          </>
        )}
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
    const recent = issuerRecent(await loadBoxOfficeFull().catch(() => null), board.issuers.map((c) => c.id));
    const row = (id: string) => <Item icon="🏢" title={id} subtitle={[count[id] ? `2016 年至今發行 ${count[id]} 部` : "目前的資料裡沒有它發行的片", (recent[id] || []).length ? `近 30 天新片 ${recent[id].length} 部` : ""].filter(Boolean).join("｜")} onTap={() => this.openIssuer(id)} action={{ label: isFav(id) ? "★" : "☆", hint: isFav(id) ? "取消收藏這家發行商" : "收藏這家發行商", onTap: () => toggle(id) }} />;
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
    // 展開時：每部片現在的狀態要查好幾份資料。這次執行查過（5 分鐘內）就直接用；
    // 還沒查好就先畫上一次記在手機上的那一份（狀態、說明、海報），查好最新的再在原位換上
    const favJob = this.favMovOpen && favMovies.length ? this.favRowsJob() : null;
    const favGot = favJob ? await Promise.race([favJob, sleep(this.rerendering ? 0 : 150).then(() => null)]) : [];
    const favSnap = favJob && !favGot ? favSnapGet(this.favSig()) : null;
    if (favJob && !favGot) this.late = [...(this.late || []), favJob];
    const favRows: FavRow[] = favGot || [];
    const openFav = (r: FavRow) => this.openFavRow(r);
    // 收藏發行商近 30 天的新片（展開那一組才讀票房資料；讀太久就先不標，讀好再補上）
    const issJob = this.favIssOpen && favIssuers.length ? loadBoxOfficeFull().catch(() => null) : null;
    const issBox = issJob ? await Promise.race([issJob, sleep(this.rerendering ? 0 : 300).then(() => undefined)]) : null;
    if (issJob && issBox === undefined) this.late = [...(this.late || []), issJob];
    const issRecent = issuerRecent(issBox || null, favIssuers);
    const favThumb = await this.listThumbs(favRows.map((r) => ({ key: r.fav.key, job: this.posterJobOf.fav(r) })), 200);
    // 最新的狀態和海報都有了：記成下一次的快照
    if (favGot && favRows.length) favSnapSet(this.favSig(), favRows.map((r) => ({ key: r.fav.key, kind: r.kind, line: r.line, poster: (favThumb(r.fav.key) || {}).url || r.fav.poster || "" })));
    // 用快照畫的列：點了要等最新的查好，才知道該開哪一頁
    const openSnap = async (key: string) => { const row = ((await favJob) || []).find((r) => r.fav.key === key); if (row) this.openFavRow(row); };
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
      const hits: GlobalHits = got || { cinemas: this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k0)), now: [], soon: [], year: [], fest: [], best: [], loose: false };
      const total = hits.cinemas.length + hits.now.length + hits.soon.length + hits.year.length + hits.fest.length;
      const MAX = 5;
      const tools = this.showAllOf("home|" + q, MAX);
      const { lim, more, head } = tools; // 每一組先列 5 筆，點「顯示全部」在原地展開
      return (
        <Page title="🎬 片刻" subtitle={pendingGs ? `正在找「${q}」…` : `「${q}」找到 ${total} 筆`}>
          <Search value={this.homeQuery} placeholder="搜尋電影、影城（可以用空白隔開好幾個字）" onInput={(t) => { this.homeQuery = t; }} />
          {pendingGs ? null : this.searchTop(hits, q, tools)}
          {hits.cinemas.length ? (
            <Section>
              {head("cinemas", `影城（${hits.cinemas.length}）`)}
              {hits.cinemas.slice(0, lim("cinemas")).map((c) => this.cinemaItem(c))}
              {more("cinemas", hits.cinemas.length, "間")}
            </Section>
          ) : null}
          {hits.now.length ? (
            <Section>
              {head("now", `現正上映（${hits.now.length}）`)}
              {hits.now.slice(0, lim("now")).map((m) => <Item title={m.title} subtitle={movieLines(m).filter(Boolean).join("\n")} tag={{ text: "上映中", tone: "now" }} onTap={() => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)} />)}
              {more("now", hits.now.length, "部")}
            </Section>
          ) : null}
          {hits.soon.length ? (
            <Section>
              {head("soon", `即將上映（${hits.soon.length}）`)}
              {hits.soon.slice(0, lim("soon")).map((e) => <Item title={e.title} subtitle={e.lines.filter(Boolean).join("\n")} onTap={e.m ? () => this.go(() => this.movieView(e.m!, ""), `讀取《${e.title}》的放映影城…`) : e.u ? () => this.go(() => this.soonMovieView(e.u!), `讀取《${e.title}》…`) : undefined} />)}
              {more("soon", hits.soon.length, "部")}
            </Section>
          ) : null}
          {hits.year.length ? (
            <Section>
              {head("year", `歷年電影（${hits.year.length}）`)}
              {hits.year.slice(0, lim("year")).map((x) => <Item title={x.name} subtitle={[boxIsRerun(x) ? "重映" : boxHasLaterRun(x) ? "首映" : "", String(x.release || "").slice(0, 10).replace(/-/g, "/") + " 上映", `票房 ${money(x.total)}`].filter(Boolean).join("｜")} tag={{ text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }} onTap={() => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`)} />)}
              {more("year", hits.year.length, "部")}
            </Section>
          ) : null}
          {hits.fest.length ? (
            <Section>
              {head("fest", `影展（${hits.fest.length}）`)}
              {hits.fest.slice(0, lim("fest")).map(({ f, film }) => <Item title={film.title} subtitle={`${f.start.slice(0, 4)} ${f.name}`} onTap={() => this.go(() => this.festivalFilmView(f, film))} />)}
              {more("fest", hits.fest.length, "部")}
            </Section>
          ) : null}
          {pendingGs ? <Note text="正在找電影…" /> : total ? null : <Empty icon="🔎" text="找不到相符的電影或影城，換個關鍵字試試。" />}
        </Page>
      );
    }
    return (
      <Page title="🎬 片刻" subtitle={`全台 ${this.cinemas.length} 間影城場次一次查`}>
        {IS_WEB && !this.isStandalone() && !this.settings.installOff && !(globalThis as any).__installed ? (
          <div class="nb nb-top">
            <span class="nb-i" aria-hidden="true">📲</span>
            <span class="nb-t">把片刻加到主畫面：像 App 一樣開啟，還能收到通知。</span>
            <button class="nb-go" onTap={() => this.go(() => this.installView())}>怎麼加</button>
            <button class="nb-x" aria-label="不再提醒" onTap={() => { this.settings.installOff = true; saveSettings(this.settings); }}>✕</button>
          </div>
        ) : null}
        <Search value={this.homeQuery} placeholder="搜尋電影、影城（可以用空白隔開好幾個字）" onInput={(t) => { this.homeQuery = t; }} />
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
            {this.favOpen ? <Item icon={favs.length ? "⚙️" : "👉"} title={favs.length ? "管理收藏影城" : "去找影城來收藏"} subtitle={favs.length ? "增加、取消收藏，或搜尋其他影城" : "搜尋或從各縣市的清單裡點星號（☆ 變 ★）。收藏後可以從這裡直接進那間影城。"} accent onTap={() => { this.cinemaFavQuery = ""; this.go(() => this.cinemaManageView()); }} /> : null}
          </Section>
        )}
        {(
          <Section hint={this.favIssOpen && favIssuers.length ? "點發行商看它歷年發行的片（新的在前）。要增減收藏：到「歷年電影」的發行商選單點星號。" : ""}>
            <Item head icon="★" title={favIssuers.length ? `收藏發行商（${favIssuers.length} 家）` : "收藏發行商（還沒有）"} subtitle={this.favIssOpen ? "點一下收合" : "點一下展開"} chevron={false} onTap={() => { this.favIssOpen = !this.favIssOpen; }} />
            {this.favIssOpen ? favIssuers.map((id) => (
              <Item icon="🏢" title={id} subtitle={(issRecent[id] || []).length ? `近 30 天上映：${issRecent[id].slice(0, 2).map((x) => x.name).join("、")}${issRecent[id].length > 2 ? `等 ${issRecent[id].length} 部` : ""}` : ""} right={(issRecent[id] || []).length ? `新片 ${issRecent[id].length}` : ""} onTap={() => this.openIssuer(id)} />
            )) : null}
            {this.favIssOpen ? <Item icon={favIssuers.length ? "⚙️" : "👉"} title={favIssuers.length ? "管理收藏發行商" : "去選發行商來收藏"} subtitle={favIssuers.length ? "增加、取消收藏，或搜尋其他發行商" : "搜尋或從清單裡點星號（☆ 變 ★）。收藏後可以從這裡看它歷年發行的片。"} accent onTap={() => { this.issuerQuery = ""; this.go(() => this.issuerManageView(), "讀取發行商…"); }} /> : null}
          </Section>
        )}
        {(
          <Section hint={this.favMovOpen && favMovies.length ? "在電影頁的預告按鈕旁邊點愛心加入，再點一次取消。下檔的片也會留在這裡。" : ""}>
            {/* 預設收合，只留這一列；點一下展開清單 */}
            <Item head icon="♥" title={favMovies.length ? `收藏電影（${favMovies.length} 部）` : "收藏電影（還沒有）"} subtitle={this.favMovOpen ? "點一下收合" : "點一下展開"} chevron={false} onTap={() => { this.favMovOpen = !this.favMovOpen; }} action={{ label: this.favMovOpen ? "▾" : "▸", hint: this.favMovOpen ? "收合收藏電影" : "展開收藏電影", onTap: () => { this.favMovOpen = !this.favMovOpen; } }} />
            {favRows.map((r) => (
              <Item thumb={favThumb(r.fav.key)} title={r.fav.title} subtitle={r.line} onTap={() => openFav(r)} />
            ))}
            {this.favMovOpen && !favGot && favJob ? (favSnap
              ? favMovies.map((f) => { const sn = favSnap.find((x) => x.key === f.key); const u = (sn && sn.poster) || f.poster || ""; return <Item thumb={{ src: u ? posterSrc(u) : "", url: u || undefined }} title={f.title} subtitle={sn ? sn.line : "讀取中…"} onTap={() => openSnap(f.key)} />; })
              : favMovies.map((f) => <Item thumb={{ src: f.poster ? posterSrc(f.poster) : "", url: f.poster, pending: !f.poster }} title={f.title} subtitle="讀取中…" onTap={() => openSnap(f.key)} />)) : null}
            {this.favMovOpen ? <Item icon={favMovies.length ? "⚙️" : "👉"} title={favMovies.length ? "管理收藏電影" : "去找電影來收藏"} subtitle={favMovies.length ? "搜尋其他電影來收藏，或取消收藏" : "上映中、即將上映、已下檔、影展的片都找得到，點愛心（♡ 變 ♥）就收藏。"} accent onTap={() => { this.favQuery = ""; this.go(() => this.favManageView(), "讀取電影…"); }} /> : null}
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
    setSiteBase(String((globalThis as any).location?.origin || ""));
    setAccount(() => sy.token()); // 登入的人：評分、短評改用帳號身分
    setNotesViaSite(true); // 短評經過自己的伺服器讀（才有作者的暱稱）
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
      this.pushSync(); // 有開通知的話，讓伺服器知道這台現在登入的是誰（有人回覆、追蹤時才推得到這台）
      const r = await sy.pull();
      if (r && r.data) applyLocal(syncMerge(this.settings, r.data as Partial<SyncData>));
      await sy.push(syncPick(this.settings));
      const adopted = await adoptRatings().catch(() => 0); // 這台原本匿名評的分、寫的短評併進帳號
      // 登入前按了某個人的「登入後追蹤」：現在追蹤，等一下直接開他的個人頁
    try {
        const G = globalThis as any;
        const who = String(G.sessionStorage.getItem("ms:follow-after-login") || "").slice(0, 16);
        G.sessionStorage.removeItem("ms:follow-after-login");
        if (who) { await social("follow", { name: who, on: true }).catch(() => undefined); this.followedAfterLogin = who; }
      } catch (_) {}
      this.syncNote = (r && r.data ? "已登入，這台和帳號裡的收藏已經合在一起。" : "已登入，這台的設定已經存到帳號裡。") + (adopted ? `這台原本評過的 ${adopted} 部片也併進你的片單了。` : "");
      return;
    }
    if (!sy.on()) return;
    const r = await Promise.race([sy.pull(), sleep(2500).then(() => null)]);
    if (r && r.data && r.at > sy.at()) { applyLocal(syncApply(this.settings, r.data as Partial<SyncData>)); sy.setAt(r.at); }
  }
  /** 設定頁的一列：點進去才是登入、同步、登出這些選項 */
  /** 管理員專區（設定頁「同步與登出」下面那一列點進來）：只有管理員名單裡的 Google 帳號登入後才看得到那一列；
   *  就算有人硬開這一頁，裡面每個動作伺服器都會再驗一次身分 */
  adminTodo: { at: number; notes: number; fb: number; users: number } | null = null; // 管理員待處理的數量（幾分鐘內不重讀）
  /** 管理員待處理的數量：被檢舉或被隱藏的短評、還沒處理的意見回饋、被檢舉的帳號。讀不到的那一項當 0 */
  async loadAdminTodo(force = false): Promise<{ notes: number; fb: number; users: number }> {
    if (!force && this.adminTodo && Date.now() - this.adminTodo.at < 180e3) return this.adminTodo;
    const sy = this.sync();
    const [n, f, u] = await Promise.all([
      sy.admin({ op: "flagged" }).then((r: any) => Object.keys(r.flagged || {}).reduce((a, k) => a + (r.flagged[k] || []).filter((x: any) => !x.keep).length, 0), () => 0), // 按過「沒問題」的不算
      sy.adm("fb", { op: "list" }).then((r: any) => Number(r.open) || 0, () => 0),
      sy.adm("users", { op: "list" }).then((r: any) => (r.list || []).length, () => 0),
    ]);
    this.adminTodo = { at: Date.now(), notes: n, fb: f, users: u };
    return this.adminTodo;
  }
  async adminHomeView(): Promise<string> {
    const t = await this.loadAdminTodo(true).catch(() => ({ notes: 0, fb: 0, users: 0 }));
    const due = (n: number, unit: string) => (n ? `● ${n} ${unit}` : "");
    return (
      <Page title="管理員專區" onBack={() => this.back()}>
        <Section hint="只有管理員名單裡的 Google 帳號登入後才看得到這一區。右邊的紅點數字是還沒處理的。">
            <Item icon="💬" title="意見回饋" subtitle="看使用者的回饋、回覆、標處理狀態" right={due(t.fb, "則待處理")} onTap={() => { this.adminFbTab = "open"; this.go(() => this.adminFeedbackView(), "讀取回饋…"); }} />
            <Item icon="🛡" title="短評管理" subtitle="複查被檢舉的短評，或巡一遍最近的短評" right={due(t.notes, "則待複查")} onTap={() => { this.adminTab = "flagged"; this.go(() => this.adminNotesView(), "讀取短評…"); }} />
            <Item icon="🪪" title="帳號管理" subtitle="被檢舉的帳號：停用個人頁、強制改暱稱" right={due(t.users, "個被檢舉")} onTap={() => { this.adminUserQ = ""; this.go(() => this.adminUsersView(), "讀取帳號…"); }} />
            <Item icon="📈" title="用量" subtitle="每天幾台裝置在用、各類請求幾次、離免費額度多遠" onTap={() => this.go(() => this.adminUsageView(), "讀取用量…")} />
            <Item icon="👥" title="管理員名單" subtitle="新增或移除其他管理員" onTap={() => this.go(() => this.adminListView(), "讀取名單…")} />
        </Section>
      </Page>
    );
  }
  meMem: { at: number; data: { user: Profile | null; counts: SocialCounts; admin?: boolean } } | null = null; // 設定頁最上面的帳號資訊（一分鐘內不重讀）
  /** 設定頁最上面：沒登入 = 用 Google 登入；登入了 = 帳號資訊（暱稱、Gmail、片單和追蹤的數字），以及片單、同步的入口 */
  async accountSection(): Promise<string> {
    const sy = this.sync();
    if (!sy) return "";
    if (!sy.on())
      return (
        <Section title="帳號" hint="登入後：收藏和設定會跟著帳號走；評過的片會記成片單；可以取暱稱、公開個人頁、追蹤別人。不登入也能照常使用。">
          <Item icon="👤" title="用 Google 登入" subtitle="同步收藏、記錄片單、追蹤朋友" accent onTap={() => sy.login()} />
        </Section>
      );
    if (!this.meMem || Date.now() - this.meMem.at > 60e3) {
      // 最多等 0.9 秒，不拖慢設定頁；等不到先顯示「讀取中」，下次重畫就有了
      const job = social<{ user: Profile | null; counts: SocialCounts; admin?: boolean; unread?: number }>("me").then((d) => { this.meMem = { at: Date.now(), data: d }; this.setUnread(d.unread || 0); return d.admin ? this.loadAdminTodo().then(() => undefined, () => undefined) : undefined; }, () => undefined); // 管理員：順便讀還有幾件沒處理
      await Promise.race([job, sleep(900)]);
      this.late.push(job); // 還沒讀完的話，讀好之後補畫一次
    }
    const me = this.meMem ? this.meMem.data : null;
    // 管理員：設定頁外面就看得到還有幾件沒處理（背景讀，讀好補畫上去；三分鐘內不重讀）
    if (me && me.admin && (!this.adminTodo || Date.now() - this.adminTodo.at > 180e3)) this.late.push(this.loadAdminTodo().then(() => undefined, () => undefined));
    const todoN = me && me.admin && this.adminTodo ? this.adminTodo.notes + this.adminTodo.fb + this.adminTodo.users : 0;
    const email = String((sy.email && sy.email()) || "");
    const open = () => { this.diaryTab = "mine"; this.diaryMem = null; this.go(() => this.diaryView(), "讀取片單…"); };
    const u = me && me.user;
    const statusTag = !u ? { text: "還沒取暱稱", tone: "warn" } : u.hidden ? { text: "已被停用", tone: "bad" } : u.pub ? { text: "公開", tone: "good" } : { text: "不公開", tone: "" };
    return (
      <Section title="帳號">
        <div role="button" onTap={open}>
          {this.profileCard({ name: u ? u.name : me ? "還沒取暱稱" : "已登入", color: u ? u.color : "gray", emoji: u ? u.emoji : "", bio: u ? u.bio : "" }, me ? me.counts : null, "", (kind) => this.go(() => this.profileListView("", kind), "讀取中…"), "", me ? statusTag : undefined, email)}
        </div>
        {u && SOCIALS.some((x) => u[x.id]) ? (
          <div class="pf-pills">
            {SOCIALS.filter((x) => u[x.id]).map((x) => <button class="pf-pill" aria-label={`${x.name}：@${u[x.id]}`} onTap={() => Safari.open(x.url(u[x.id]!))}>{socialIcon(x.id)}<span>{esc(u[x.id]!)}</span></button>)}
          </div>
        ) : null}
        {me ? (
          <div class="pf-btns">
            <button class="pf-btn" onTap={() => { this.profileDraft = null; this.go(() => this.profileEditView(u || null)); }}>{u ? "編輯個人檔案" : "設定暱稱"}</button>
            {u && u.pub && !u.hidden ? <button class="pf-btn" onTap={async () => { Pasteboard.copy(`${SITE_URL}/?u=${encodeURIComponent(u.name)}`); await this.ui.toast("已複製個人頁連結"); }}>分享個人檔案</button> : null}
            <button class="pf-btn icon" aria-label="搜尋片友" onTap={() => { this.switchTab("activity"); this.socialTab = "people"; }}>{PERSON_ADD}</button>
          </div>
        ) : null}
        <Item icon="🎞" title="我的片單" subtitle={u ? "看過的片、評分和短評" : "取暱稱、記錄看過的片、追蹤別人"} onTap={open} />
        {u && !u.hidden ? (Date.now() - this.pubAsk < 60e3 ? (
          <div class="nt-form">
            <Note kind="warn" text={u.pub
              ? "確定要改成不公開嗎？改了之後：別人還是看得到你的暱稱、頭像、自我介紹和四個數字，但片單、短評、粉絲和追蹤名單只有你同意追蹤的人看得到；想追蹤你的人要先送出要求、等你同意。你寫的短評在討論區會顯示成匿名。現有的粉絲不會被移除。"
              : "確定要公開個人頁嗎？公開之後：任何人都看得到你的片單（片名、分數、短評、看過的日期）、粉絲和追蹤名單，不用你同意就能追蹤你，你寫的短評旁邊會顯示暱稱。還在等你同意的追蹤要求會全部直接通過。設成只有自己看得到的那幾筆不會公開。"} />
            <Button label={u.pub ? "確定改成不公開" : "確定公開"} kind={u.pub ? "danger" : "primary"} onTap={async () => {
              this.pubAsk = 0;
              try { await social("profile-set", { name: u.name, pub: !u.pub }); this.meMem = null; this.diaryMem = null; await this.ui.toast(u.pub ? "個人頁改成不公開了" : "個人頁公開了"); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
            }} />
            <Button label={u.pub ? "不要改，維持公開" : "不要改，維持不公開"} kind="secondary" onTap={() => { this.pubAsk = 0; }} />
          </div>
        ) : <Item icon={u.pub ? "✅" : "⬜️"} title="公開個人頁" subtitle={u.pub ? "任何人都可以看你的片單、追蹤你；短評旁邊顯示暱稱" : "不公開：片單和短評只有你同意追蹤的人看得到"} chevron={false} onTap={() => { this.pubAsk = Date.now(); }} />) : null}
        <Item icon="🔄" title="同步與登出" subtitle="收藏和設定自動同步中" onTap={() => this.go(() => this.syncView())} />
        {me && me.admin ? <Item icon="🛡" title="管理員專區" subtitle="意見回饋、短評、帳號、管理員名單" right={todoN ? `● ${todoN} 件待處理` : ""} onTap={() => this.go(() => this.adminHomeView(), "讀取中…")} /> : null}
      </Section>
    );
  }
  syncLink(): string {
    const sy = this.sync();
    if (!sy) return "";
    return (
      <Section title="同步">
        <Item icon="🔄" title="用 Google 帳號同步" subtitle={sy.on() ? "收藏和設定有變動會自動同步" : "讓主畫面的 App 和瀏覽器用同一份收藏"} right={sy.on() ? "已登入" : "未登入"} onTap={() => this.go(() => this.syncView())} />
      </Section>
    );
  }
  syncWho: { admin: boolean } | null = null; // 這次登入是不是管理員（這次開啟問過一次就記著）


  // ── 我的片單、個人頁、追蹤（只有網頁版；要用 Google 登入）──
  diaryTab = "mine"; // 片單頁看哪一塊：mine 我的片單／feed 動態／people 找人
  peopleQ = ""; // 找人的搜尋字
  diaryMem: { at: number; list: DiaryEntry[] } | null = null; // 自己的片單（一分鐘內不重讀）
  profileDraft: { name: string; color: string; emoji: string; bio: string; th: string; ig: string; tw: string; pub: boolean } | null = null; // 編輯個人檔案時還沒存的內容
  async myDiary(force = false): Promise<DiaryEntry[]> {
    if (!force && this.diaryMem && Date.now() - this.diaryMem.at < 60e3) return this.diaryMem.list;
    const r = await social<{ list: DiaryEntry[] }>("mine");
    this.diaryMem = { at: Date.now(), list: r.list || [] };
    return this.diaryMem.list;
  }
  /** 用片名開那部片的頁面（上映中、即將上映、已下檔、影展片都找得到） */
  async openTitle(title: string): Promise<void> {
    const fav: FavMovie = { key: communityKey(title), title, at: 0 };
    const row = (await favMovieRows({ ...this.settings, favMovies: [fav] }).catch(() => [] as FavRow[]))[0];
    if (row) this.openFavRow(row); else this.go(() => this.favMovieView(fav), `讀取《${title}》…`);
  }
  /** 頭像：底色＋表情符號；沒選表情符號就用暱稱的第一個字 */
  avatar(u: { name: string; color: string; emoji?: string }, big = false): string {
    return <span class={"av" + (big ? " big" : "") + (u.emoji ? " emo" : "")} style={`background:${profileColor(u.color)};color:${profileInk(u.color)}`} aria-hidden="true">{esc(u.emoji || Array.from(u.name)[0] || "?")}</span>;
  }
  /** 個人頁最上面那一塊：頭像（顏色＋暱稱第一個字）、暱稱、四個數字 */
  /** 個人卡片上的數字點進去：那個人的片單／有寫短評的／粉絲／追蹤中。name 空的 = 看自己的 */
  async profileListView(name: string, kind: "films" | "notes" | "followers" | "following"): Promise<string> {
    type R = { user: Profile | null; self: boolean; entries?: DiaryEntry[]; people?: { name: string; color: string; emoji?: string; films: number; following: boolean; me?: number }[]; total: number; unlisted?: number };
    const TITLE = { films: "片單", notes: "短評", followers: "粉絲", following: "追蹤中" };
    let r: R | null = null, failed = "";
    try { r = await social<R>("list", { ...(name ? { name } : {}), kind }); } catch (e) { failed = String((e as Error)?.message || e); }
    const who = name || (r && r.user ? r.user.name : "我");
    if (!r) return <Page title={TITLE[kind]} subtitle={who} onBack={() => this.back()}><Section><Note kind="warn" text={failed} /></Section></Page>;
    const people = r.people || [], entries = r.entries || [];
    return (
      <Page title={`${TITLE[kind]}（${r.total}）`} subtitle={who} onBack={() => this.back()}>
        {kind === "films" || kind === "notes" ? (
          <Section hint={r.total > entries.length ? `只列最近 ${entries.length} 筆。` : r.self ? "含你設成只有自己看得到的那幾筆。" : ""}>
            {entries.length ? <div class="nt-list">{entries.map((e) => this.entryRow(e, () => (r!.self ? this.go(() => this.entryView(e.title, e)) : this.openTitle(e.title))))}</div> : <Note text={kind === "notes" ? "還沒有寫過短評。" : "片單還是空的。"} />}
          </Section>
        ) : (
          <Section hint={r.unlisted ? `另外有 ${r.unlisted} 位沒有公開個人頁，不會列出來。` : "只會列出有公開個人頁的帳號。"}>
            {people.length ? people.map((u) => (u.me ? <div class="item"><span class="us-main">{this.avatar(u)}<span class="us-name">{esc(u.name)}</span><span class="us-sub">你自己</span></span></div> : this.userItem(u))) : <Note text={r.total ? "他們都沒有公開個人頁。" : kind === "followers" ? "還沒有粉絲。" : "還沒有追蹤任何人。"} />}
          </Section>
        )}
      </Page>
    );
  }
  /** onNum：有給的話，四個數字可以點（點了看清單） */
  /** note = 卡片最下面的一行小字；onNum = 數字可以點；extra = 接在最下面的內容（共同追蹤）；
   *  tag = 暱稱旁邊的小標（公開／不公開…）；sub = 暱稱下面的一行小字（設定頁放登入的 Gmail） */
  profileCard(u: { name: string; color: string; emoji?: string; bio?: string }, c: SocialCounts | null, note = "", onNum?: (kind: "films" | "notes" | "followers" | "following") => void, extra = "", tag?: { text: string; tone: string }, sub = ""): string {
    // 四個數字排成一列：上面大大的數字、下面小字說明；有給 onNum 的話可以點進清單
    const num = (kind: "films" | "notes" | "followers" | "following", n: number, label: string) => (onNum ? <button class="pf-stat" onTap={() => onNum(kind)}><b>{n}</b><span>{label}</span></button> : <span class="pf-stat"><b>{n}</b><span>{label}</span></span>);
    return (
      <div class="pf">
        <div class="pf-top">
          {this.avatar(u, true)}
          <div class="pf-body">
            <div class="pf-name">{esc(u.name)}{tag ? <span class={"pf-tag " + tag.tone}>{esc(tag.text)}</span> : null}</div>
            {sub ? <div class="pf-sub">{esc(sub)}</div> : null}
            {c ? <div class="pf-nums">{num("films", c.films, "部片")}{num("notes", c.notes, "短評")}{num("followers", c.followers, "粉絲")}{num("following", c.following, "追蹤中")}</div> : null}
          </div>
        </div>
        {u.bio ? <div class="pf-bio">{esc(u.bio)}</div> : null}
        {note ? <div class="pf-note">{esc(note)}</div> : null}
        {extra}
      </div>
    );
  }
  /** 片單上的一筆：片名、分數、看過的日期、短評（有雷的摺疊）。by = 動態裡是誰的紀錄 */
  entryRow(e: DiaryEntry, onTap: () => void, onUser?: (name: string) => void): string {
    const open = !e.sp || this.noteShown.indexOf(-e.at) >= 0;
    return (
      <div class="nt">
        {e.by ? <button class="nt-by" onTap={() => onUser && onUser(e.by!.name)}>{this.avatar(e.by)}<span>{esc(e.by.name)}</span></button> : null}
        <div class="nt-head" role="button" onTap={onTap}>
          <span class="en-title">{esc(e.title)}</span>
          {e.s ? <span class={"nt-score " + ratingTier("imdb", e.s)}>{e.s} 分</span> : null}
          {e.priv ? <span class="fb-tag">只有自己看得到</span> : null}
          <span class="nt-rep">›</span>
        </div>
        <div class="nt-meta">{esc([seenLabel(e.seen), howLabel(e.how), `${noteDate(e.at)}記錄`].filter(Boolean).join("｜"))}</div>
        {/* 點短評的內容：直接到那部片的討論區（可以回覆、推噓）；點上面的片名則是開那部片的頁面 */}
        {e.x ? (open ? (
          <button class="nt-text go" aria-label={`到《${e.title}》的討論區`} onTap={() => { this.noteReset(); this.noteFocus = { x: e.x, at: Date.now() }; this.go(() => this.notesView(e.title), "讀取短評…"); }}>
            <span>{esc(e.x)}</span><i aria-hidden="true">💬 ›</i>
          </button>
        ) : <button class="nt-cover" onTap={() => { this.noteShown = [...this.noteShown, -e.at]; }}>這則可能有雷，點一下顯示</button>) : null}
      </div>
    );
  }
  /** 設定 → 我的片單：自己看過、評過的片（追蹤對象的動態、找人在底部的「社群」頁籤） */
  async diaryView(): Promise<string> {
    const sy = this.sync();
    if (!sy || !sy.on())
      return (
        <Page title="我的片單" onBack={() => this.back()}>
          <Section hint="登入後，你評過分、寫過短評的片會集中在這裡，換裝置也在；還可以標記看過的日期。想要的話可以取一個暱稱、公開個人頁，讓別人追蹤你，也去追蹤別人。不登入也能照常匿名評分。">
            <Item icon="🎞" title="用 Google 登入，開始記錄" subtitle="伺服器只存帳號的識別碼（經過雜湊）；email 只留在這台裝置上顯示用" accent onTap={() => sy && sy.login()} />
          </Section>
        </Page>
      );
    let me: { user: Profile | null; counts: SocialCounts } | null = null, failed = "";
    try { me = await social("me"); } catch (e) { failed = String((e as Error)?.message || e); }
    if (!me) return <Page title="我的片單" onBack={() => this.back()}><Note kind="warn" text={failed} /></Page>;
    const user = me.user;
    // 還沒取暱稱：先帶去設定（可以按「稍後再說」跳過，只用不公開的片單）
    this.hasProfile = !!user;
    if (!user && !profileSkipped()) return this.profileEditView(null, true);
    let body = "";
    {
      const list = await this.myDiary().catch(() => null);
      body = !list ? <Note kind="warn" text="片單暫時讀不到" /> : list.length ? (
        <Section hint="在電影頁評分、寫短評，或標記看過，就會出現在這裡。點一筆可以改看過的日期，或設成只有自己看得到。">
          <div class="nt-list">{list.map((e) => this.entryRow(e, () => this.go(() => this.entryView(e.title, e))))}</div>
        </Section>
      ) : <Section><Note text="片單還是空的。到任何一部電影的頁面評分或標記看過，就會記在這裡。" /></Section>;
    }
    return (
      <Page title="我的片單" onBack={() => this.back()}>
        <Section>
          {user ? this.profileCard(user, me.counts, user.hidden ? "個人頁目前被站長停用，別人看不到。" : "", (kind) => this.go(() => this.profileListView("", kind), "讀取中…"), "", user.hidden ? { text: "已被停用", tone: "bad" } : user.pub ? { text: "公開", tone: "good" } : { text: "不公開", tone: "" }) : <Note kind="warn" text="還沒有設定暱稱：別人找不到你、不能追蹤你，短評也是匿名。你還是可以追蹤別人。" />}
        </Section>
        {IS_WEB ? <Section><Item icon="📥" title="從 Letterboxd 匯入" subtitle="把 Letterboxd 上的評分、觀影日期和影評搬過來" onTap={() => { this.lbx = null; this.go(() => this.lbxView()); }} /></Section> : null}
        {body}
      </Page>
    );
  }
  // ── 從 Letterboxd 匯入（只有網頁版）──
  lbx: {
    stage: "match" | "review" | "import" | "done";
    /** on = 這一筆要不要匯；noteOn = 影評要不要匯；sp = 有雷；have／haveX = 片刻裡已經有的分數、短評；keep = 已經有分數時保留片刻的（不改成 Letterboxd 的） */
    rows: { it: LbxItem; title: string; k: string; note: string; cut: boolean; on: boolean; noteOn: boolean; sp: boolean; have: number; haveX: string; keep: boolean; open: boolean; plain: boolean }[];
    edit: string; // 正在修改哪一筆的影評（片名鍵）
    miss: LbxItem[];
    done: number; total: number; ticks: Promise<void>[]; bump: () => void;
    result: { ok: number; have: number; noNote: number; fail: number; why: string[] };
    err: string; all: boolean;
  } | null = null;
  /** 選好檔案：讀檔 → 一批一批問伺服器台灣片名（畫面上顯示進度）→ 列出清單讓使用者勾選 */
  async lbxStart(): Promise<void> {
    const G = globalThis as any;
    const files: { name: string; data: ArrayBuffer }[] = G.__files || [];
    G.__files = null;
    const items = await readLetterboxd(files);
    if (!items.length) throw new Error("檔案裡沒有任何紀錄。");
    const BATCH = 12, steps = Math.ceil(items.length / BATCH) + 1;
    // 每做完一批就讓畫面重畫一次：先準備好「每一批一個」的通知，畫面第一次畫的時候全部掛上去
    const fire: (() => void)[] = [];
    const ticks = Array.from({ length: steps }, () => new Promise<void>((ok) => fire.push(ok)));
    let at = 0;
    const st = (this.lbx = { stage: "match" as const, rows: [], miss: [], done: 0, total: items.length, ticks, bump: () => { const f = fire[at++]; if (f) f(); }, result: { ok: 0, have: 0, noNote: 0, fail: 0, why: [] }, err: "", all: false, edit: "" }) as NonNullable<App["lbx"]>;
    void (async () => {
      try {
        const [years, mine] = await Promise.all([loadYearRatings().catch(() => null), this.myDiary().catch(() => [] as DiaryEntry[])]);
        // IMDb 編號 → 片刻用的片名（同一部片有好幾種版本的話取最短的那個，就是本片）
        const byImdb: Record<string, string> = {};
        for (const key of Object.keys((years && years.ratings) || {})) { const id = years!.ratings[key].id, name = key.split("|")[0]; if (id && (!byImdb[id] || name.length < byImdb[id].length)) byImdb[id] = name; }
        const max = LBX_NOTE_MAX;
        for (let i = 0; i < items.length; i += BATCH) {
          if (this.lbx !== st) return; // 使用者重來或離開了
          const part = items.slice(i, i + BATCH);
          const r = await social<{ list: ({ zh: string; imdb: string; y: number } | null)[] }>("lbx-match", { items: part.map((p) => ({ n: p.name, y: p.year })) });
          part.forEach((it, j) => {
            const m = r.list[j];
            if (!m || !m.zh) { st.miss.push(it); return; }
            // 這部片在片刻已經有固定的片名（年度總表裡有）就用那個，評分才會算在同一部片上
            const known = m.imdb ? byImdb[m.imdb] : "";
            const title = known && known !== lbxNorm(m.zh) ? known : m.zh;
            const k = communityKey(title);
            if (st.rows.some((x) => x.k === k)) return; // 兩筆對到同一部片：留第一筆
            const old = mine.find((e) => e.k === k);
            const have = (old && old.s) || 0, haveX = (old && old.x) || "";
            const n = it.x ? lbxNote(it.x, max) : { x: "", cut: false };
            // 片刻已經有的那幾筆：預設不匯，由使用者一筆一筆決定；影評跟片刻的一模一樣就不用再匯
            st.rows.push({ it, title, k, note: n.x, cut: n.cut, on: !have, noteOn: !!n.x && !n.cut && n.x !== haveX && (it.s > 0 || have > 0), sp: false, have, haveX, keep: true, open: false, plain: !/[\u3400-\u9fff]/.test(title) });
          });
          st.done = Math.min(items.length, i + BATCH);
          st.bump();
        }
        st.stage = "review";
      } catch (e) { st.err = String((e as Error)?.message || e); st.stage = "review"; }
      st.bump();
    })();
  }
  /** 按下匯入：把勾選的那幾筆一批一批送出 */
  lbxSend(): void {
    const st = this.lbx;
    if (!st) return;
    const todo = st.rows.filter((r) => r.on);
    const BATCH = 15, fire: (() => void)[] = [];
    st.ticks = Array.from({ length: Math.ceil(todo.length / BATCH) + 1 }, () => new Promise<void>((ok) => fire.push(ok)));
    let at = 0;
    st.bump = () => { const f = fire[at++]; if (f) f(); };
    st.stage = "import"; st.done = 0; st.total = todo.length; st.err = "";
    const WHY: Record<string, string> = { "no links": "有連結或聯絡方式", "too long": "太長", "too many notes": "這部片你已經寫滿 5 則", duplicate: "跟已經有的重複", "vote first": "沒有評分" };
    void (async () => {
      try {
        for (let i = 0; i < todo.length; i += BATCH) {
          if (this.lbx !== st) return;
          const part = todo.slice(i, i + BATCH);
          const r = await social<{ list: string[] }>("lbx-import", { items: part.map((p) => ({ m: p.k, title: p.title, s: p.have && p.keep ? 0 : p.it.s, seen: p.it.seen, ...(p.have ? { over: 1 } : {}), ...(p.noteOn && p.note ? { x: p.note, sp: p.sp ? 1 : 0 } : {}) })) });
          part.forEach((p, j) => {
            const code = r.list[j] || "fail";
            if (code === "ok") st.result.ok++;
            else if (code === "have") st.result.have++;
            else if (code.indexOf("note:") === 0) { st.result.ok++; st.result.noNote++; st.result.why.push(`《${p.title}》：${WHY[code.slice(5)] || "沒有通過檢查"}`); }
            else st.result.fail++;
          });
          st.done = Math.min(todo.length, i + BATCH);
          st.bump();
        }
      } catch (e) { st.err = String((e as Error)?.message || e); }
      st.stage = "done";
      this.diaryMem = null; this.meMem = null;
      st.bump();
    })();
  }
  lbxView(): string {
    const st = this.lbx;
    const back = () => { this.lbx = null; this.back(); };
    if (!st) {
      return (
        <Page title="從 Letterboxd 匯入" onBack={back}>
          <Section title="先到 Letterboxd 下載你的資料">
            <ol class="lb-steps">
              <li>用瀏覽器打開 letterboxd.com 並登入（App 裡沒有這個功能）。</li>
              <li>進 Settings → Data，按 Export Your Data。</li>
              <li>會下載一個 zip 檔，存在「檔案」App 的下載項目。</li>
            </ol>
            <div class="nt-form"><Button label="打開 Letterboxd 的匯出頁" kind="secondary" onTap={() => Safari.open("https://letterboxd.com/settings/data/")} /></div>
          </Section>
          <Section title="再選那個 zip 檔" hint="檔案只在你的手機上讀取，不會上傳。接下來會先列出清單讓你一筆一筆確認，按下匯入之前不會寫入任何東西。">
            <div class="nt-form">
              <label class="btn primary lb-pick">選擇 Letterboxd 匯出的 zip 檔<input type="file" accept=".zip,.csv,application/zip,text/csv" multiple onFile={() => this.lbxStart()} /></label>
            </div>
          </Section>
          <p class="hint">會匯入：評分（半顆星換成 1 分，五顆星 = 10 分，會算進片刻的平均）、觀影日期、影評（變成短評，最多留 {LBX_NOTE_MAX} 字，可以逐筆決定要不要匯、有沒有雷）。片刻裡已經評過分的片不會被蓋掉。</p>
        </Page>
      );
    }
    if (st.stage === "match" || st.stage === "import") {
      for (const t of st.ticks) this.late.push(t);
      return (
        <Page title="從 Letterboxd 匯入" onBack={back}>
          <Section><div class="lb-prog"><b>{st.done}／{st.total}</b>{st.stage === "match" ? "正在對照台灣片名…" : "正在匯入…"}<br />請停在這一頁，不要關掉。</div></Section>
        </Page>
      );
    }
    if (st.stage === "done") {
      const r = st.result;
      return (
        <Page title="匯入完成" onBack={back}>
          {st.err ? <Section><Note kind="warn" text={`中途停下來了：${st.err}。已經匯入的不受影響，可以再匯一次，匯過的會自動略過。`} /></Section> : null}
          <Section>
            <Item kv title="匯入" right={`${r.ok} 部`} chevron={false} />
            {r.have ? <Item kv title="片刻已經評過，略過" right={`${r.have} 部`} chevron={false} /> : null}
            {r.fail ? <Item kv title="沒有成功" right={`${r.fail} 部`} chevron={false} /> : null}
            {r.noNote ? <Item kv title="評分有匯入，但影評沒有" right={`${r.noNote} 則`} chevron={false} /> : null}
          </Section>
          {r.why.length ? <Section title="沒匯入的影評"><div class="lb-list">{r.why.slice(0, 30).map((w) => <div class="lb-sub" style="padding:6px 0">{esc(w)}</div>)}</div></Section> : null}
          <Section><div class="nt-form"><Button label="看我的片單" onTap={() => { this.lbx = null; this.back(); }} /></div></Section>
        </Page>
      );
    }
    // 確認清單：分成「新的」和「片刻已經有的」兩段；每一筆各自決定，沒有一次全部套用的選項
    const picked = st.rows.filter((r) => r.on), notes = picked.filter((r) => r.noteOn && r.note).length;
    const fresh = st.rows.filter((r) => !r.have), dup = st.rows.filter((r) => r.have);
    const LIMIT = 120;
    const keepEdit = (v?: Record<string, string>) => { const r = st.rows.find((x) => x.k === st.edit); if (r && v && typeof v.lbx === "string") { const n = lbxNote(v.lbx, LBX_NOTE_MAX); r.note = n.x; r.cut = false; if (!n.x) r.noteOn = false; } };
    const tap = (fn: () => void) => (v: Record<string, string>) => { keepEdit(v); fn(); };
    const row = (r: (typeof st.rows)[number]) => {
      const editing = st.edit === r.k;
      const canNote = !!r.note && (r.it.s > 0 || r.have > 0);
      const sameNote = !!r.note && r.note === r.haveX;
      const long = Array.from(r.note).length > 90;
      return (
        <div class={"lb" + (r.on ? "" : " off")}>
          <button class={"lb-ck" + (r.on ? " on" : "")} aria-pressed={r.on ? "true" : "false"} aria-label={`匯入《${r.title}》`} onTap={tap(() => { r.on = !r.on; })}>{r.on ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ""}</button>
          <div class="lb-body">
            <div class="lb-top"><b>{esc(r.title)}</b>{r.it.s ? <span class={"nt-score " + ratingTier("imdb", r.it.s)}>{r.it.s} 分</span> : <span class="fb-tag">只標看過</span>}</div>
            <div class="lb-sub">{esc([`${r.it.name}${r.it.year ? `（${r.it.year}）` : ""}`, /^\d{4}-/.test(r.it.seen) ? r.it.seen.replace(/-/g, "/") + " 看的" : "", r.plain ? "沒有台灣片名" : ""].filter(Boolean).join("｜"))}</div>
            {r.have ? (
              <div class="lb-have">
                <div class="lb-haveline"><span>片刻現在</span><b class={"nt-score " + ratingTier("imdb", r.have)}>{r.have} 分</b></div>
                {r.haveX ? <div class="lb-havex">{esc(r.haveX)}</div> : null}
                {r.on && r.it.s && r.it.s !== r.have ? (
                  <div class="lb-seg" role="group" aria-label="分數用哪一個">
                    <button class={r.keep ? "on" : ""} aria-pressed={r.keep ? "true" : "false"} onTap={tap(() => { r.keep = true; })}>分數維持 {r.have} 分</button>
                    <button class={r.keep ? "" : "on"} aria-pressed={r.keep ? "false" : "true"} onTap={tap(() => { r.keep = false; })}>改成 {r.it.s} 分</button>
                  </div>
                ) : r.on && r.it.s === r.have ? <div class="lb-sub">分數一樣，不會變。</div> : null}
              </div>
            ) : null}
            {canNote && editing ? (
              <div class="lb-edit">
                <textarea class="fb-area note" name="lbx" maxlength={String(LBX_NOTE_MAX)} aria-label="修改影評">{esc(r.note)}</textarea>
                <div class="lb-opts">
                  <button class="cm-tag on" onTap={(v: Record<string, string>) => { keepEdit(v); st.edit = ""; }}>改好了</button>
                  <span class="lb-sub" style="align-self:center">最多 {LBX_NOTE_MAX} 字，換行會變成空白</span>
                </div>
              </div>
            ) : canNote ? (
              <>
                {r.have ? <div class="lb-sub" style="margin-top:8px">Letterboxd 的影評{sameNote ? "（跟片刻的一樣，不用再匯）" : r.haveX ? "（會多一則，原本那則留著）" : ""}</div> : null}
                <button class={"lb-x" + (r.open || !long ? "" : " clamp") + (r.noteOn && r.on ? "" : " dim")} aria-label={long ? "展開或收合影評" : undefined} onTap={tap(() => { r.open = !r.open; })}><span>{esc(r.note)}</span>{long ? <i>{r.open ? "收合" : "展開"}</i> : null}</button>
                {r.on && !sameNote ? (
                  <div class="lb-opts">
                    <button class={"cm-tag" + (r.noteOn ? " on" : "")} aria-pressed={r.noteOn ? "true" : "false"} onTap={tap(() => { r.noteOn = !r.noteOn; })}>{r.noteOn ? "匯入影評 ✓" : "匯入影評"}</button>
                    {r.noteOn ? <button class={"cm-tag" + (r.sp ? " on" : "")} aria-pressed={r.sp ? "true" : "false"} onTap={tap(() => { r.sp = !r.sp; })}>{r.sp ? "有雷 ✓" : "有雷？"}</button> : null}
                    {r.noteOn ? <button class="cm-tag" onTap={tap(() => { st.edit = r.k; })}>✎ 修改</button> : null}
                  </div>
                ) : null}
                {r.cut && r.on ? <div class="lb-sub" style="margin-top:6px">原文超過 {LBX_NOTE_MAX} 字，後面截掉了；可以按「修改」自己調整。</div> : null}
              </>
            ) : null}
          </div>
        </div>
      );
    };
    const list = (rows: typeof st.rows) => { const shown = st.all ? rows : rows.slice(0, LIMIT); return <><div class="lb-list">{shown.map(row)}</div>{rows.length > shown.length ? <Item title={`顯示全部 ${rows.length} 部`} accent chevron={false} onTap={tap(() => { st.all = true; })} /> : null}</>; };
    const go = (v: Record<string, string>) => { keepEdit(v); st.edit = ""; if (picked.length) this.lbxSend(); };
    return (
      <Page title="確認要匯入的" subtitle={`已選 ${picked.length} 部、影評 ${notes} 則`} onBack={back} right={picked.length ? <button class="bar-save" onTap={go}>匯入</button> : undefined}>
        {st.err ? <Section><Note kind="warn" text={st.err === "no tmdb" || /503/.test(st.err) ? "片名對照的服務還沒設定好，暫時不能匯入。" : `對照片名時停下來了：${st.err}。下面是已經對到的。`} /></Section> : null}
        {fresh.length ? (
          <Section title={`新的（${fresh.length} 部）`} hint="勾掉不想匯入的。影評會變成公開的短評：有提到劇情的請點「有雷？」，別人要點開才看得到；想改寫可以按「修改」。">
            <div class="lb-bar"><button class="cm-tag" onTap={tap(() => { const on = fresh.some((r) => !r.on); for (const r of fresh) r.on = on; })}>{fresh.some((r) => !r.on) ? "全部勾選" : "全部取消"}</button></div>
            {list(fresh)}
          </Section>
        ) : null}
        {dup.length ? (
          <Section title={`片刻已經有的（${dup.length} 部）`} hint="這幾部你在片刻已經評過分。預設不動；想處理哪一部就勾哪一部，再各自決定分數要不要改、影評要不要加進去。">
            {list(dup)}
          </Section>
        ) : null}
        {!st.rows.length && !st.err ? <Section><Note text="沒有對到任何一部片。" /></Section> : null}
        {st.rows.length ? <Section><div class="nt-form"><Button label={picked.length ? `匯入這 ${picked.length} 部` : "先勾選要匯入的"} onTap={go} /></div></Section> : null}
        {st.miss.length ? <Section title={`對不到台灣片名（${st.miss.length} 部，不會匯入）`}><div class="lb-list">{st.miss.slice(0, 60).map((m) => <div class="lb-sub" style="padding:5px 0">{esc(m.name)}{m.year ? `（${m.year}）` : ""}</div>)}</div></Section> : null}
      </Page>
    );
  }
  /** 清單裡的一個帳號：點名字看個人頁，右邊追蹤／取消追蹤 */
  userItem(u: { name: string; color: string; emoji?: string; films?: number; following?: boolean; priv?: number; requested?: number }): string {
    // 不公開帳號：按的是「要求追蹤」，對方同意前顯示「已要求」（再按一下收回）
    const state = u.following ? "on" : u.requested ? "asked" : "";
    return (
      <div class="item">
        <button class="us-main" onTap={() => this.go(() => this.profileView(u.name), "讀取個人頁…")}>
          {this.avatar(u)}
          <span class="us-name">{esc(u.name)}{u.priv ? <i class="us-lock" aria-label="不公開帳號">🔒</i> : null}</span>
          {u.films !== undefined ? <span class="us-sub">{u.films} 部片</span> : null}
        </button>
        {signedIn() ? <button class={"us-follow" + (state ? " on" : "")} onTap={async () => {
          const on = !state;
          try { const r = await social<{ requested: boolean }>("follow", { name: u.name, on }); this.meMem = null; await this.ui.toast(!on ? (state === "asked" ? "已收回追蹤要求" : "已取消追蹤") : r.requested ? "已送出追蹤要求，等對方同意" : `已追蹤 ${u.name}`); if (on) await this.askNickname(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
        }}>{state === "on" ? "追蹤中" : state === "asked" ? "已要求" : u.priv ? "要求追蹤" : "追蹤"}</button> : null}
      </div>
    );
  }
  /** 編輯個人檔案：暱稱（唯一）、顏色、要不要公開；最下面可以把片單和個人檔案整個刪掉 */
  followedAfterLogin = ""; // 登入前按了誰的「登入後追蹤」（登入完成時填上）
  hasProfile: boolean | null = null; // 登入的帳號取過暱稱了嗎（null = 還沒問過伺服器）
  /** 登入的人評分、寫短評之後：還沒取暱稱就帶去設定一次。設過、或按過「稍後再說」就不再問（之後到 設定 → 我的片單 改） */
  async askNickname(): Promise<void> {
    if (!signedIn() || profileSkipped() || this.hasProfile) return;
    if (this.hasProfile === null) {
      const me = await social<{ user: Profile | null }>("me").catch(() => null);
      if (!me) return;
      this.hasProfile = !!me.user;
    }
    if (!this.hasProfile) { this.profileDraft = null; this.go(() => this.profileEditView(null, true, true)); return; }
    await this.askNotify();
  }
  pushSt = ""; // 這台裝置的通知狀態（on／off／needs-install／denied／unsupported），社群頁籤上的提醒用
  /** 開通知的按鈕（data-perm：按下去的那一刻就跟系統要權限，iPhone 規定要這樣） */
  notifyButton(label: string, cls: string, after?: () => void): string {
    return <button class={cls} data-perm="notify" onTap={async () => {
      const p = this.push();
      try {
        const st: string = p ? await p.enable(notifyPayload(this.settings)) : "unsupported";
        this.pushSt = st;
        await this.ui.toast(st === "on" ? "通知已開啟" : st === "denied" ? "沒有取得通知的權限，可以到 iPhone 的「設定 → 通知 → 片刻」打開" : "沒有開啟通知");
      } catch (e) { await this.ui.toast(String((e as Error)?.message || "開啟失敗，請稍後再試")); }
      if (after) after();
    }}>{esc(label)}</button>;
  }
  /** 寫了短評、回覆或追蹤別人之後：還沒開通知的話問一次要不要開（只問一次；之後社群頁籤上還是有一條提醒） */
  /** 第一次從主畫面開啟：問完通知之後，邀請用 Google 登入（只問這一次；已經登入的不問） */
  askLogin(): void {
    const sy = this.sync();
    if (!sy || sy.on()) return;
    this.go(() => (
      <Page title="歡迎使用片刻" onBack={() => this.back()}>
        <Section>
          <div class="nb-ask">
            <div class="nb-ico" aria-hidden="true">👤</div>
            <b>用 Google 帳號登入</b>
            <p>不登入也能查場次。登入之後多這些：</p>
          </div>
          <Item icon="💾" title="紀錄不會不見" subtitle="收藏、評分、看過的片存在帳號裡，換手機或重裝都還在" chevron={false} />
          <Item icon="🎞" title="自己的片單" subtitle="評過分、寫過短評的片集中在一起，還能記觀影日期" chevron={false} />
          <Item icon="👥" title="跟大家互動" subtitle="取暱稱、追蹤朋友、看他們最近看了什麼；有人回覆你會通知" chevron={false} />
          <div class="nt-form">
            <Button label="用 Google 登入" onTap={() => sy.login()} />
            <Button label="先不用" kind="secondary" onTap={() => this.back()} />
          </div>
        </Section>
        <p class="hint">伺服器只存帳號的識別碼（經過雜湊），email 只留在這台裝置上顯示用。之後也可以在「設定」最上面登入。</p>
      </Page>
    ));
  }
  /** 回傳有沒有真的跳出詢問頁 */
  async askNotify(first = false): Promise<boolean> {
    const p = this.push();
    // 問過之後兩個禮拜內不再問（選了「稍後再說」的人，之後追蹤別人、寫短評時還會再問一次）
    const last = Number(this.settings.notifyAsked) || 0;
    if (!p || (!first && !signedIn()) || Date.now() - last < 14 * 864e5) return false;
    const st: string = await p.refresh().catch(() => "");
    this.pushSt = st;
    if (st !== "off" && st !== "needs-install") return false;
    this.settings.notifyAsked = Date.now(); saveSettings(this.settings);
    // 第一次開啟時：按了開啟或稍後再說，接著問要不要登入
    const next = () => { this.back(); if (first) this.askLogin(); };
    this.go(() => (
      <Page title={first ? "歡迎使用片刻" : "要開通知嗎？"} onBack={() => this.back()}>
        <Section>
          <div class="nb-ask">
            <div class="nb-ico" aria-hidden="true">🔔</div>
            <b>{first ? "要開啟通知嗎？" : "有人回覆你的時候，馬上知道"}</b>
            <p>{first
              ? "開了通知，你收藏的電影開放場次、上映、快下檔時會通知你；登入之後，有人回覆、提到或追蹤你也會通知。每一種都可以各別關掉。"
              : "開了通知，有人回覆或提到你、追蹤你，手機會跳通知，主畫面的片刻圖示也會顯示數字。推和噓不會吵你，只會列在「社群」裡。"}</p>
            {this.pushSt === "needs-install" ? <p class="nb-warn">iPhone 要先把片刻「加入主畫面」，從主畫面打開才能開通知。</p> : null}
          </div>
          <div class="nt-form">
            {this.pushSt === "needs-install"
              ? <Button label="看怎麼加入主畫面" onTap={() => { this.back(); this.go(() => this.notifyView(), "讀取中…"); }} />
              : this.notifyButton("開啟通知", "btn primary", next)}
            <Button label="稍後再說" kind="secondary" onTap={next} />
          </div>
        </Section>
        <p class="hint">之後可以在 設定 → 通知 隨時開關，也可以只關掉其中幾種。</p>
      </Page>
    ));
    return true;
  }
  /** 社群頁籤最上面的提醒：這台還沒開通知（可以按掉，按掉後只在「通知」那一格裡留著） */
  pushNudge(): string {
    const st = this.pushSt;
    if (!this.push() || !st || st === "on" || st === "unsupported") return "";
    if (this.settings.notifyNudgeOff && this.socialTab !== "act") return "";
    const text = st === "denied" ? "通知被關掉了。到 iPhone 的「設定 → 通知 → 片刻」打開，才收得到回覆和追蹤的通知。"
      : st === "needs-install" ? "把片刻加入主畫面，才能在有人回覆、追蹤你時收到通知。"
      : "還沒開通知：有人回覆、提到或追蹤你時，你不會馬上知道。";
    return (
      <div class="nb">
        <span class="nb-i" aria-hidden="true">🔔</span>
        <span class="nb-t">{text}</span>
        {st === "off" ? this.notifyButton("開啟", "nb-go") : st === "needs-install" ? <button class="nb-go" onTap={() => this.go(() => this.notifyView(), "讀取中…")}>怎麼做</button> : null}
        {this.socialTab !== "act" ? <button class="nb-x" aria-label="不再提醒" onTap={() => { this.settings.notifyNudgeOff = true; saveSettings(this.settings); }}>✕</button> : null}
      </div>
    );
  }
  /** first = 第一次設定（有歡迎說明和「稍後再說」）；pushed = 是另外開的一頁（存好、跳過都要退回原本那一頁） */
  profileEditView(user: Profile | null, first = false, pushed = false): string {
    // 第一次設定：預設勾公開（要交朋友得公開；不想公開可以自己取消）
    // 第一次取暱稱：先填上 Google 帳號的名稱（去掉空白和符號、最多 16 個字），使用者可以改
    const sy0 = this.sync();
    const suggest = !user && sy0 && sy0.gname ? Array.from(String(sy0.gname() || "").normalize("NFC").replace(/[^\p{L}\p{N}_]/gu, "")).slice(0, 16).join("") : "";
    const d = this.profileDraft || { name: user ? user.name : suggest.length >= 2 ? suggest : "", color: user ? user.color : "blue", emoji: (user && user.emoji) || "", bio: (user && user.bio) || "", th: (user && user.th) || "", ig: (user && user.ig) || "", tw: (user && user.tw) || "", pub: user ? !!user.pub : first };
    /** 每個按鈕都帶著輸入框目前的內容：暱稱、自己打的表情符號、色盤選的顏色（跟目前的不一樣才算有改） */
    const keep = (v?: Record<string, string>) => {
      const picked = v && /^#[0-9a-f]{6}$/i.test(v.c || "") && v.c.toLowerCase() !== profileColor(d.color).toLowerCase() ? v.c.toLowerCase() : d.color;
      this.profileDraft = { ...d, name: v && typeof v.n === "string" ? v.n : d.name, emoji: v && typeof v.e === "string" ? v.e.trim() : d.emoji, bio: v && typeof v.b === "string" ? v.b : d.bio, th: v && typeof v.th === "string" ? v.th : d.th, ig: v && typeof v.ig === "string" ? v.ig : d.ig, tw: v && typeof v.tw === "string" ? v.tw : d.tw, color: picked };
    };
    const custom = /^#/.test(d.color);
    // 自己加的表情符號（存在這台裝置的設定裡）；目前用的那個如果不在清單上也列出來
    const saved = (this.settings.myEmoji || []).filter((e) => PROFILE_EMOJI.indexOf(e) < 0);
    const mine = [...saved];
    for (const e of [user && user.emoji, d.emoji]) if (e && PROFILE_EMOJI.indexOf(e) < 0 && mine.indexOf(e) < 0) mine.push(e); // 原本用的、現在選的也留在格子裡
    const save = async (v: Record<string, string>) => {
              keep(v);
              const p = this.profileDraft!;
              try { await social("profile-set", { name: p.name.trim(), color: p.color, emoji: p.emoji, bio: p.bio, th: p.th.trim(), ig: p.ig.trim(), tw: p.tw.trim(), pub: p.pub }); this.profileDraft = null; this.hasProfile = true; this.meMem = null; setProfileSkipped(false); await this.ui.toast(first ? "暱稱設定好了" : "已儲存"); if (!first || pushed) this.back(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
    };
    return (
      <Page title={user ? "編輯個人檔案" : first ? "先取一個暱稱" : "設定暱稱"} onBack={() => this.back()} right={<button class="bar-save" onTap={save}>儲存</button>}>
        {first ? <Note text={(pushed ? "剛才的動作已經完成了。接下來，" : "歡迎使用「我的片單」。") + "取一個暱稱、公開個人頁，別人才找得到你、能追蹤你，你寫的短評旁邊也會顯示暱稱。只會問這一次，之後在「設定 → 我的片單」可以改。\n不想公開也沒關係：取消下面的「公開我的個人頁」，或按最下面的「稍後再說」，片單就只有你自己看得到（還是可以追蹤別人）。"} /> : null}
        <Section title="暱稱" hint={(!user && suggest.length >= 2 ? "已經先幫你填上 Google 帳號的名稱，可以直接改成你想要的；如果那是本名，建議換一個。" : "") + "2～16 個字，只能用中英文、數字和底線；不能跟別人重複。14 天內只能改一次。請不要冒用他人名義。"}>
          <div class="nt-form">
            <input class="field" name="n" maxlength="16" autocomplete="off" autocapitalize="off" value={d.name} placeholder="例如：愛看片的小明" />
          </div>
        </Section>
        <Section title="自我介紹" hint="選填，最多 80 個字，會顯示在個人頁的暱稱下面。不能放連結或聯絡方式。">
          <div class="nt-form">
            <input class="field" name="b" maxlength="80" autocomplete="off" value={d.bio} placeholder="例如：恐怖片愛好者｜每週進戲院" />
            <span class="cm-taghead" style="margin-top:14px">社群帳號（可不填；公開個人頁時別人點得到）</span>
            {SOCIALS.map((x) => <label class="pf-handle" aria-label={x.name}>{socialIcon(x.id)}<span>@</span><input name={x.id} maxlength="60" autocomplete="off" autocapitalize="off" spellcheck="false" value={d[x.id]} placeholder={`${x.name} 帳號名稱`} /></label>)}
          </div>
        </Section>
        <Section title="頭像" hint="底色加上一個表情符號；選「字」就用暱稱的第一個字。按 ＋ 可以加自己喜歡的表情符號（不能上傳照片）。">
          <div class="nt-form">
            <div class="pf-prev">{this.avatar({ name: d.name || "?", color: d.color, emoji: d.emoji }, true)}</div>
            <div class="em-grid">
              <button class={"em" + (!d.emoji ? " on" : "")} aria-label="不用表情符號，用暱稱的第一個字" onTap={(v: Record<string, string>) => { keep(v); this.profileDraft = { ...this.profileDraft!, emoji: "" }; }}>字</button>
              {[...PROFILE_EMOJI, ...mine].map((e) => <button class={"em" + (e === d.emoji ? " on" : "")} aria-pressed={e === d.emoji ? "true" : "false"} onTap={(v: Record<string, string>) => { keep(v); this.profileDraft = { ...this.profileDraft!, emoji: e }; }}>{e}</button>)}
              <button class="em add" aria-label="加一個自己的表情符號" onTap={async (v: Record<string, string>) => {
                keep(v);
                const ask = (globalThis as any).prompt;
                const raw = typeof ask === "function" ? ask("輸入一個表情符號（用鍵盤的表情符號鍵）", "") : null;
                const e = String(raw || "").trim();
                if (!e) return;
                if (e.length > 32 || !/^(?:[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200D\uFE0F\u{1F3FB}-\u{1F3FF}]*)$/u.test(e)) { await this.ui.toast("只能放一個表情符號"); return; }
                if (PROFILE_EMOJI.indexOf(e) < 0 && saved.indexOf(e) < 0) { this.settings.myEmoji = [...saved, e].slice(-14); saveSettings(this.settings); }
                this.profileDraft = { ...this.profileDraft!, emoji: e };
              }}>＋</button>
            </div>
            {d.emoji && saved.indexOf(d.emoji) >= 0 ? <button class="em-del" onTap={(v: Record<string, string>) => { keep(v); this.settings.myEmoji = saved.filter((x) => x !== d.emoji); saveSettings(this.settings); this.profileDraft = { ...this.profileDraft!, emoji: "" }; }}>從清單移除 {d.emoji}</button> : null}
            <div class="sw-row">
              {PROFILE_COLORS.map((c) => <button class={"sw" + (c.id === d.color ? " on" : "")} style={`background:${c.hex}`} aria-label={c.id} aria-pressed={c.id === d.color ? "true" : "false"} onTap={(v: Record<string, string>) => { keep(v); this.profileDraft = { ...this.profileDraft!, color: c.id }; }} />)}
              <label class={"sw pick" + (custom ? " on" : "")} style={custom ? `background:${d.color}` : ""} aria-label="自訂顏色">
                <input type="color" name="c" value={profileColor(d.color)} onInput={(v: Record<string, string>) => { keep(v); }} />
              </label>
            </div>
            {custom ? <div class="sw-note">自訂色號 {d.color.toUpperCase()}</div> : null}
          </div>
        </Section>
        {first ? (
          <Section title="公開" hint="公開：任何人都看得到你的片單、評分、短評，可以直接追蹤你，你寫的短評旁邊會顯示暱稱。不公開：別人看得到你的暱稱、頭像和自我介紹，但片單和短評要你同意追蹤後才看得到，討論區的短評顯示成匿名。之後在設定的帳號那一區可以隨時切換。">
            <div class="nt-form">
              <button class={"nt-check" + (d.pub ? " on" : "")} aria-pressed={d.pub ? "true" : "false"} onTap={(v: Record<string, string>) => { keep(v); this.profileDraft = { ...this.profileDraft!, pub: !d.pub }; }}>
                <i>{d.pub ? "✓" : ""}</i><span>公開我的個人頁</span>
              </button>
              <Button label="儲存" onTap={save} />
              <Button label="稍後再說" kind="secondary" onTap={() => { setProfileSkipped(true); this.profileDraft = null; if (pushed) this.back(); }} />
            </div>
          </Section>
        ) : <p class="hint">改好按右上角的「儲存」。{user ? "要不要公開個人頁，在設定的帳號那一區切換。" : ""}</p>}
      </Page>
    );
  }
  wipeConfirmView(): string {
    return (
      <Page title="確定要刪除？" onBack={() => this.back()}>
        <Note kind="warn" text="片單、暱稱、追蹤關係，還有你用這個帳號評的分和寫的短評都會刪掉，救不回來。" />
        <Button label="確定刪除" kind="danger" onTap={async () => {
          try { await this.wipeSocial(); await this.ui.toast("已刪除"); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
          this.back(); this.back();
        }} />
        <Button label="取消" kind="secondary" onTap={() => this.back()} />
      </Page>
    );
  }
  /** 把帳號的片單和社交資料刪乾淨（伺服器一次處理 20 筆，送到沒有為止） */
  async wipeSocial(): Promise<void> {
    for (let i = 0; i < 200; i++) { const r = await social<{ left: number }>("wipe"); if (!r.left) break; }
    forgetMyVotes();
    this.diaryMem = null;
    this.hasProfile = false;
  }
  /** 某個人的公開個人頁 */
  async profileView(name: string): Promise<string> {
    type P = { user: Profile; self?: boolean; private?: boolean; locked?: boolean; requested?: boolean; counts?: SocialCounts; dist?: number[]; list?: DiaryEntry[]; following?: boolean; since?: number; mutual?: { list: { name: string; color: string; emoji?: string }[]; more: number } };
    let p: P | null = null, failed = "";
    try { p = await social<P>("profile", { name }); } catch (e) { failed = String((e as Error)?.message || e); }
    if (!p) return <Page title="個人頁" onBack={() => this.back()}><Note kind="warn" text={failed === "找不到這個帳號" ? "找不到這個帳號（可能改了暱稱，或已經刪除）。" : failed} /></Page>;
    const u = p.user;
    if (p.locked) {
      // 不公開帳號：看得到暱稱、頭像、自我介紹和四個數字，其他要對方同意追蹤才看得到
      const ask = async (on: boolean) => {
        try { const r = await social<{ following: boolean; requested: boolean }>("follow", { name: u.name, on }); this.meMem = null; await this.ui.toast(!on ? "已收回追蹤要求" : r.requested ? "已送出追蹤要求，等對方同意" : `已追蹤 ${u.name}`); if (on) await this.askNickname(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
      };
      return (
        <Page title={u.name} subtitle="個人頁" onBack={() => this.back()}>
          <Section>
            {this.profileCard(u, p.counts || null, "", undefined, "", { text: "不公開", tone: "" })}
            <div class="pf-btns">
              {!signedIn() ? (
                <button class="pf-btn go" onTap={() => { try { (globalThis as any).sessionStorage.setItem("ms:follow-after-login", u.name); } catch (_) {} const sy = this.sync(); if (sy) sy.login(); }}>登入後要求追蹤</button>
              ) : p.requested ? (
                <button class="pf-btn" onTap={() => ask(false)}>已送出要求（點一下收回）</button>
              ) : (
                <button class="pf-btn go" onTap={() => ask(true)}>要求追蹤</button>
              )}
              <button class="pf-btn icon" aria-label="檢舉這個帳號" onTap={() => this.go(() => this.reportUserView(u.name))}>⚑</button>
            </div>
          </Section>
          <Section>
            <div class="pf-lock"><div aria-hidden="true">🔒</div><b>這是不公開帳號</b><p>對方同意你的追蹤要求之後，才看得到片單、短評、粉絲和追蹤名單。</p></div>
          </Section>
        </Page>
      );
    }
    const dist = p.dist || [], max = Math.max(1, ...dist), rated = dist.reduce((a, b) => a + b, 0);
    // 共同追蹤：「A、B 和另外 N 人都在追蹤」
    const mu = p.mutual;
    const mutualLine = mu && mu.list.length ? (
      <button class="pf-mutual" onTap={() => this.go(() => this.profileListView(u.name, "followers"), "讀取中…")}>
        <span class="pf-faces">{mu.list.map((x) => this.avatar(x))}</span>
        <span>{esc(mu.list.map((x) => x.name).join("、"))}{mu.more ? ` 和另外 ${mu.more} 人` : ""}{mu.list.length + mu.more > 1 ? "都" : "也"}在追蹤</span>
      </button>
    ) : "";
    const list = p.list || [];
    return (
      <Page title={u.name} subtitle="個人頁" onBack={() => this.back()}>
        <Section>
          {this.profileCard(u, p.counts || null, p.self ? "這是你的個人頁（別人看到的不含你設成只有自己看得到的那幾筆）" : "", (kind) => this.go(() => this.profileListView(u.name, kind), "讀取中…"), mutualLine)}
          {SOCIALS.some((x) => u[x.id]) ? (
            <div class="pf-pills">
              {SOCIALS.filter((x) => u[x.id]).map((x) => <button class="pf-pill" aria-label={`${x.name}：@${u[x.id]}`} onTap={() => Safari.open(x.url(u[x.id]!))}>{socialIcon(x.id)}<span>{esc(u[x.id]!)}</span></button>)}
            </div>
          ) : null}
          <div class="pf-btns">
            {p.self ? (
              <button class="pf-btn" onTap={() => { this.profileDraft = null; this.go(() => this.profileEditView(u)); }}>編輯個人檔案</button>
            ) : signedIn() ? (
              <button class={"pf-btn" + (p.following ? "" : " go")} onTap={async () => {
                try { await social("follow", { name: u.name, on: !p!.following }); this.meMem = null; await this.ui.toast(p!.following ? "已取消追蹤" : `已追蹤 ${u.name}`); if (!p!.following) await this.askNickname(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
              }}>{p.following ? "追蹤中 ✓" : "追蹤"}</button>
            ) : (
              <button class="pf-btn go" onTap={() => {
                // 記下「登入後要追蹤誰」，從 Google 回來就自動追蹤、回到這一頁，再帶去取暱稱
                try { (globalThis as any).sessionStorage.setItem("ms:follow-after-login", u.name); } catch (_) {}
                const sy = this.sync(); if (sy) sy.login();
              }}>登入後追蹤</button>
            )}
            <button class="pf-btn" onTap={async () => { Pasteboard.copy(`${SITE_URL}/?u=${encodeURIComponent(u.name)}`); await this.ui.toast("已複製個人頁連結"); }}>分享</button>
            {p.self ? null : <button class="pf-btn icon" aria-label="檢舉這個帳號" onTap={() => this.go(() => this.reportUserView(u.name))}>⚑</button>}
          </div>
        </Section>
        {rated ? (
          <Section title={`評分分布（${rated} 部）`}>
            <div class="cm"><div class="cm-hist wide" aria-hidden="true">
              <div class="bars">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => <i class={dist[v - 1] ? "" : "zero"} style={`height:${Math.max(8, Math.round(((dist[v - 1] || 0) / max) * 100))}%`} />)}</div>
              <div class="axis"><span>1 分</span><span>10 分</span></div>
            </div></div>
          </Section>
        ) : null}
        <Section title={`片單（${p.counts ? p.counts.films : list.length}）`} hint={list.length >= 50 ? "只列最近 50 筆。" : ""}>
          {list.length ? <div class="nt-list">{list.map((e) => this.entryRow(e, () => this.openTitle(e.title)))}</div> : <Note text="還沒有公開的紀錄。" />}
        </Section>
      </Page>
    );
  }
  reportUserView(name: string): string {
    const WHY = [{ id: "name", label: "暱稱不雅或不當" }, { id: "fake", label: "冒用他人名義" }, { id: "abuse", label: "騷擾或其他不當行為" }];
    return (
      <Page title="檢舉帳號" onBack={() => this.back()}>
        <Section title={`檢舉「${name}」的原因`} hint="檢舉是匿名的，站長會複查。個別短評有問題的話，請到那則短評按「檢舉」。">
          {WHY.map((w) => <Item title={w.label} onTap={async () => {
            try { await social("report-user", { name, why: w.id }); await this.ui.toast("已送出檢舉，謝謝"); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
            this.back();
          }} />)}
        </Section>
      </Page>
    );
  }
  /** 片單上的一筆：看過的日期、要不要只給自己看。分數和短評在電影頁改 */
  async entryView(title: string, known?: DiaryEntry): Promise<string> {
    const k = communityKey(title);
    const list = await this.myDiary().catch(() => [] as DiaryEntry[]);
    const e = list.find((x) => x.k === k) || (this.diaryMem ? null : known) || null;
    return (
      <Page title="我的紀錄" subtitle={`《${title}》`} onBack={() => this.back()}>
        <Section>
          {e && (e.s || e.x) ? <div class="nt-list">{this.entryRow(e, () => this.openTitle(title))}</div> : <Note text="還沒有評分。可以先記下什麼時候看的，之後再到電影頁評分、寫短評。" />}
          <div class="pf-btns en-btns"><button class="pf-btn" onTap={() => this.openTitle(title)}>🎬 電影頁（改評分、短評）</button></div>
        </Section>
        <Section title="觀影紀錄">
          <div class="cm-tags en-watch">{this.watchFields(title, e)}</div>
        </Section>
        {e ? (
          <Section hint="這一筆不會出現在你的個人頁和別人的動態裡，你在這部片的短評也會顯示成匿名。分數照樣算進這部片的平均。">
            <Item icon={e.priv ? "✅" : "⬜️"} title="只有自己看得到" chevron={false} onTap={() => this.saveWatch(title, { priv: !e.priv }, e.priv ? "這一筆恢復公開" : "這一筆只有你看得到了")} />
          </Section>
        ) : null}
      </Page>
    );
  }
  /** 管理員：帳號管理。被檢舉的、被停用的帳號；可以停用個人頁、清掉檢舉、強制改暱稱 */
  adminUserQ = "";
  async adminUsersView(): Promise<string> {
    const sy = this.sync();
    type U = { name: string; color: string; pub: boolean; hidden: boolean; films: number; reports: Record<string, number> };
    const WHY: Record<string, string> = { name: "暱稱不當", fake: "冒名", abuse: "不當行為" };
    let list: U[] = [], users = 0, failed = "";
    const q = this.adminUserQ.trim();
    try { const r = await sy.adm("users", q ? { op: "find", q } : { op: "list" }); list = r.list || []; users = r.users || 0; } catch (e) { failed = String((e as Error)?.message || e); }
    const act = (body: Record<string, unknown>, done: string) => async () => { try { await sy.adm("users", body); await this.ui.toast(done); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); } };
    return (
      <Page title="帳號管理" subtitle="管理員專區" onBack={() => this.back()}>
        <Search value={this.adminUserQ} placeholder="用暱稱找帳號" onInput={(t) => { this.adminUserQ = t; }} />
        {failed ? <Note kind="warn" text={failed} /> : (
          <Section title={q ? `符合「${q}」的帳號` : `被檢舉或被停用的帳號（${list.length}）`} hint={q ? "" : `目前共有 ${users} 個帳號設了暱稱。停用：個人頁別人看不到、短評變成匿名，對方的片單不會被刪。`}>
            {list.length ? <div class="nt-list">{list.map((u) => {
              const why = Object.keys(u.reports || {}).map((w) => `${WHY[w] || w} ${u.reports[w]}`).join("、");
              return (
                <div class="nt">
                  <div class="nt-head">{this.avatar(u)}<span class="en-title">{esc(u.name)}</span><span class={"nt-score" + (u.hidden ? " bad" : "")}>{u.hidden ? "已停用" : u.pub ? "公開" : "不公開"}</span></div>
                  <div class="nt-meta">{u.films} 部片{why ? `｜檢舉：${why}` : ""}</div>
                  <div class="nt-acts">
                    <button onTap={() => this.go(() => this.profileView(u.name), "讀取個人頁…")}>看個人頁</button>
                    <button onTap={act({ op: "hide", name: u.name, on: !u.hidden }, u.hidden ? "已恢復" : "已停用")}>{u.hidden ? "恢復" : "停用"}</button>
                    {why ? <button onTap={act({ op: "clear", name: u.name }, "已清掉檢舉")}>沒問題</button> : null}
                    <button class="danger" onTap={() => this.go(() => this.adminRenameView(u.name))}>改暱稱</button>
                  </div>
                </div>
              );
            })}</div> : <Note text={q ? "找不到。" : "目前沒有被檢舉或被停用的帳號。"} />}
          </Section>
        )}
      </Page>
    );
  }
  adminRenameView(name: string): string {
    const sy = this.sync();
    return (
      <Page title="強制改暱稱" onBack={() => this.back()}>
        <Section title={`把「${name}」改成`} hint="暱稱不雅或冒名時用。對方之後 14 天內不能自己改回來。">
          <div class="nt-form">
            <input class="field" name="n" maxlength="16" autocomplete="off" placeholder="新的暱稱，例如：使用者1234" />
            <Button label="改掉" kind="danger" onTap={async (v) => {
              try { await sy.adm("users", { op: "rename", name, to: String(v.n || "").trim() }); await this.ui.toast("已改暱稱"); this.back(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
            }} />
          </div>
        </Section>
      </Page>
    );
  }

  // ── 通知頁（網頁版最下面的頁籤）：有人推、噓、回覆你的短評，或追蹤你 ──
  /** 還沒看的通知數：頁籤上的紅點，加到主畫面的「片刻」圖示上也會有數字（裝置支援才有；看過就清掉） */
  setUnread(n: number): void {
    this.unread = n;
    if (!IS_WEB) return;
    try { const nav = (globalThis as any).navigator; if (n > 0 && nav.setAppBadge) nav.setAppBadge(n).catch(() => undefined); else if (!n && nav.clearAppBadge) nav.clearAppBadge().catch(() => undefined); } catch (_) {}
  }
  socialTab = ""; // 社群頁籤看哪一塊：feed 動態／act 通知／people 找人（空的 = 進來時再決定）
  /** 社群頁籤上面那一排：動態｜通知｜找人 */
  socialTabs(): string {
    const seg = this.socialTab;
    return (
      <>
      <Chips tabs>
        <Chip label="動態" muted={seg !== "feed"} onTap={() => { this.socialTab = "feed"; }} />
        <Chip label={this.unread > 0 ? `通知 ${this.unread > 99 ? "99+" : this.unread}` : "通知"} muted={seg !== "act"} onTap={() => { this.socialTab = "act"; }} />
        <Chip label="搜尋片友" muted={seg !== "people"} onTap={() => { this.socialTab = "people"; }} />
      </Chips>
      {this.pushNudge()}
      </>
    );
  }
  /** 動態裡的一則：頭像＋「誰 給《片名》幾分／看了《片名》」＋時間，下面是他的短評（點了到討論區） */
  feedRow(e: DiaryEntry): string {
    const by = e.by!;
    const toUser = () => this.go(() => this.profileView(by.name), "讀取個人頁…");
    const shown = !e.sp || this.noteShown.indexOf(-e.at) >= 0;
    const meta = [seenLabel(e.seen), howLabel(e.how)].filter(Boolean).join("｜");
    return (
      <div class="fd">
        <button class="fd-av" aria-label={`${by.name} 的個人頁`} onTap={toUser}>{this.avatar(by)}</button>
        <div class="fd-body">
          <div class="fd-line">
            <button class="fd-name" onTap={toUser}>{esc(by.name)}</button>
            <span>{e.s ? " 給" : e.x ? " 評了" : " 看了"}</span>
            <button class="fd-film" onTap={() => this.openTitle(e.title)}>《{esc(e.title)}》</button>
            {e.s ? <span class={"nt-score " + ratingTier("imdb", e.s)}>{e.s} 分</span> : null}
            <em>・{esc(agoLabel(e.at))}</em>
          </div>
          {meta ? <div class="fd-meta">{esc(meta)}</div> : null}
          {e.x ? (shown ? (
            <button class="fd-note" aria-label={`到《${e.title}》的討論區`} onTap={() => { this.noteReset(); this.noteFocus = { x: e.x, at: Date.now() }; this.go(() => this.notesView(e.title), "讀取短評…"); }}>
              <span>{esc(e.x)}</span><i aria-hidden="true">💬</i>
            </button>
          ) : <button class="nt-cover" onTap={() => { this.noteShown = [...this.noteShown, -e.at]; }}>這則可能有雷，點一下顯示</button>) : null}
        </div>
      </div>
    );
  }
  /** 社群頁籤：動態（追蹤對象最近看了什麼）、通知（誰推、回覆、提到、追蹤我）、找人 */
  async activityView(): Promise<string> {
    const sy = this.sync();
    if (!sy || !sy.on())
      return (
        <Page title="社群">
          <Section hint="登入後可以追蹤別人、看他們最近看了什麼；有人推或回覆你的短評、追蹤你，也會列在這裡。">
            <Item icon="👤" title="用 Google 登入" subtitle="登入後才有動態和通知" accent onTap={() => sy && sy.login()} />
          </Section>
        </Page>
      );
    if (!this.socialTab) this.socialTab = this.unread > 0 ? "act" : "feed";
    { const p = this.push(); this.pushSt = p ? await p.refresh().catch(() => "") : ""; }
    if (this.socialTab === "feed") {
      const r = await social<{ list: DiaryEntry[]; following: number }>("feed").catch(() => null);
      return (
        <Page title="社群">
          {this.socialTabs()}
          {!r ? <Section><Note kind="warn" text="動態暫時讀不到" /></Section> : r.list.length ? (
            <Section><div class="fd-list">{r.list.filter((e) => e.by).map((e) => this.feedRow(e))}</div></Section>
          ) : (
            <Section>
              <Note text={r.following ? "你追蹤的人最近還沒有新的紀錄。" : "還沒有追蹤任何人。追蹤之後，他們評分、寫短評、記錄看過的片會出現在這裡。"} />
              <Item icon="🔍" title="搜尋片友" subtitle="看看誰公開了片單" onTap={() => { this.socialTab = "people"; }} />
            </Section>
          )}
          {r && r.list.length ? <p class="hint">只會出現對方公開的紀錄。</p> : null}
        </Page>
      );
    }
    if (this.socialTab === "people") {
      const r = await social<{ list: { name: string; color: string; films: number; following: boolean }[] }>("people", { q: this.peopleQ.trim() }).catch(() => null);
      return (
        <Page title="社群">
          {this.socialTabs()}
          <Search value={this.peopleQ} placeholder="用暱稱搜尋片友" onInput={(t) => { this.peopleQ = t; }} />
          <Section title={this.peopleQ.trim() ? "符合的帳號" : "最近有新紀錄的人"} hint="只會列出公開個人頁的帳號。">
            {!r ? <Note kind="warn" text="暫時讀不到" /> : r.list.length ? r.list.map((u) => this.userItem(u)) : <Note text={this.peopleQ.trim() ? "找不到這個暱稱（對方可能沒有公開個人頁）。" : "目前還沒有人公開片單。"} />}
          </Section>
        </Page>
      );
    }
    let list: Activity[] = [], failed = "";
    try { list = (await social<{ list: Activity[] }>("activity")).list || []; this.setUnread(0); if (this.meMem) this.meMem.data = { ...this.meMem.data, unread: 0 } as any; } catch (e) { failed = String((e as Error)?.message || e); }
    const row = (a: Activity) => {
      const names = a.who.map((w) => w.name);
      const rest = a.n - names.length;
      // 「A、B 和另外 2 人」；都沒有公開個人頁就是「有人」「3 個人」
      const whoText = names.length ? names.join("、") + (rest > 0 ? ` 和另外 ${rest} 人` : "") : a.n > 1 ? `${a.n} 個人` : "有人";
      const quote = (t?: string) => (t ? `「${t}${Array.from(t).length >= 40 ? "…" : ""}」` : "");
      const what = a.kind === "up" ? `推了你在《${a.title}》的短評${quote(a.px)}`
        : a.kind === "down" ? `噓了你在《${a.title}》的短評${quote(a.px)}`
        : a.kind === "reply" ? `在《${a.title}》回覆你：${a.x || ""}`
        : a.kind === "mention" ? `在《${a.title}》提到你：${a.x || ""}`
        : a.kind === "request" ? "想追蹤你"
        : a.kind === "accepted" ? "接受了你的追蹤要求。"
        : a.returned ? "也回追你了" : "開始追蹤你";
      const answer = (ok: boolean) => async () => {
        try { await social("follow-answer", { name: names[0], ok }); this.meMem = null; await this.ui.toast(ok ? `已同意，${names[0]} 開始追蹤你了` : "已拒絕"); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
      };
      const open = a.kind === "follow" || a.kind === "request" || a.kind === "accepted"
        ? (names.length ? () => this.go(() => this.profileView(names[0]), "讀取個人頁…") : undefined)
        : () => { this.noteReset(); if (a.px) this.noteFocus = { x: a.px, at: Date.now(), head: true }; this.go(() => this.notesView(a.title || ""), "讀取短評…"); };
      const first = a.who[0];
      const mark = a.kind === "up" ? "▲" : a.kind === "down" ? "▼" : a.kind === "reply" ? "↩" : a.kind === "mention" ? "@" : a.kind === "accepted" ? "✓" : a.kind === "request" ? "?" : "＋";
      return (
        <div class={"ac" + (a.fresh ? " fresh" : "") + (a.kind === "request" ? " req" : "")}>
          <button class="ac-main" onTap={open}>
            <span class="ac-av">
              {first ? this.avatar(first) : <span class="av anon" aria-hidden="true">{a.kind === "down" ? "？" : "匿"}</span>}
              {a.who[1] ? <span class="ac-av2">{this.avatar(a.who[1])}</span> : null}
              <i class={"ac-mark " + a.kind} aria-hidden="true">{mark}</i>
            </span>
            <span class="ac-text">{a.kind === "down" ? <b>{a.n > 1 ? `${a.n} 個人` : "有人"}</b> : <b>{esc(whoText)}</b>} {a.kind === "request" || a.kind === "accepted" || a.kind === "follow" ? <span class="ac-nb">{esc(what)}</span> : esc(what)}<em>・{esc(agoLabel(a.at))}</em></span>
          </button>
          {a.kind === "follow" && names.length === 1 && !a.back ? <button class="ac-btn go" onTap={async () => {
            try { const r = await social<{ requested: boolean }>("follow", { name: names[0], on: true }); this.meMem = null; await this.ui.toast(r.requested ? "對方是不公開帳號，已送出追蹤要求" : `已追蹤 ${names[0]}`); await this.askNickname(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
          }}>回追</button> : a.kind === "follow" && a.back ? <span class="ac-btn">互相追蹤</span> : null}
          {a.kind === "request" && names.length === 1 ? <div class="ac-acts"><button class="ac-btn go" onTap={answer(true)}>接受</button><button class="ac-btn" aria-label={`拒絕 ${names[0]} 的追蹤要求`} onTap={answer(false)}>拒絕</button></div> : null}
        </div>
      );
    };
    const week = Date.now() - 7 * 86400e3;
    const fresh = list.filter((a) => a.fresh), recent = list.filter((a) => !a.fresh && a.at >= week), older = list.filter((a) => !a.fresh && a.at < week);
    return (
      <Page title="社群">
        {this.socialTabs()}
        {failed ? <Section><Note kind="warn" text={failed} /></Section> : !list.length ? (
          <Section hint="噓只會顯示人數，不會顯示是誰。"><Note text="還沒有通知。有人推、噓或回覆你的短評，或是追蹤你，會出現在這裡。" /></Section>
        ) : (
          <>
            {fresh.length ? <Section title="新的"><div class="ac-list">{fresh.map(row)}</div></Section> : null}
            {recent.length ? <Section title="過去 7 天"><div class="ac-list">{recent.map(row)}</div></Section> : null}
            {older.length ? <Section title="更早"><div class="ac-list">{older.map(row)}</div></Section> : null}
            <p class="hint">噓只會顯示人數，不會顯示是誰。不公開的帳號推或回覆你的短評時，會顯示成「有人」。</p>
          </>
        )}
      </Page>
    );
  }

  // ── 意見回饋（使用者）──
  fbCat = ""; // 回饋頁選的分類
  fbDraft = ""; // 回饋頁打到一半的內容
  fbForce = false; // 剛進回饋頁：跟伺服器要最新的（之後在這一頁裡點來點去不用每次重讀）
  /** 意見回饋頁：上面選分類、寫內容送出；下面是自己送過的，每一則有處理狀態和站長的回覆 */
  async feedbackView(): Promise<string> {
    let list: Feedback[] = [], failed = "";
    try { list = feedbackSent() ? await loadMyFeedback(this.fbForce) : []; this.fbForce = false; } catch (e) { failed = String((e as Error)?.message || e); }
    if (list.some((f) => f.reply)) feedbackMarkSeen(); // 看過了：設定頁的「新回覆」記號拿掉
    const cat = FEEDBACK_CATS.find((c) => c.id === this.fbCat) || null;
    const keep = (v?: Record<string, string>) => { if (v && typeof v.t === "string") this.fbDraft = v.t; };
    const submit = async (v?: Record<string, string>) => {
      keep(v);
      const text = this.fbDraft.trim();
      if (!cat) { await this.ui.toast("先選一個分類"); return; }
      if (Array.from(text).length < 5) { await this.ui.toast("內容再多寫一點（至少 5 個字）"); return; }
    try {
        await sendFeedback(cat.id, text, IS_WEB ? (this.isStandalone() ? "web-app" : "web") : "scriptable", APP_VERSION);
        this.fbDraft = ""; this.fbCat = "";
        await this.ui.toast("已送出，謝謝你的回饋");
      } catch (e) {
        await this.ui.toast(String((e as Error)?.message || e));
      }
    };
    return (
      <Page title="意見回饋" onBack={() => this.back()}>
        <Section title="寫給站長" hint="不用留聯絡方式：站長的回覆和處理狀態會顯示在這一頁下面（這台裝置才看得到）。請不要寫個人資料。">
          <div class="nt-form">
            <div class="fb-cats">
              {FEEDBACK_CATS.map((c) => <button class={"cm-tag" + (c.id === this.fbCat ? " on" : "")} aria-pressed={c.id === this.fbCat ? "true" : "false"} onTap={(v: Record<string, string>) => { keep(v); this.fbCat = c.id; }}>{esc(c.label)}</button>)}
            </div>
            <textarea class="fb-area" name="t" maxlength={String(FEEDBACK_MAX)} placeholder={cat ? cat.hint : "先選上面的分類，再寫內容"}>{esc(this.fbDraft)}</textarea>
            <Button label="送出" onTap={submit} />
          </div>
        </Section>
        <Section title={`我的回饋（${list.length}）`}>
          {failed ? <Note kind="warn" text={failed} /> : null}
          {list.length ? <div class="nt-list">{list.map((f) => this.feedbackRow(f))}</div> : failed ? null : <Note text="還沒有送過回饋。" />}
        </Section>
      </Page>
    );
  }
  /** 一則回饋：分類、處理狀態、日期、內容、站長的回覆。使用者那一頁和管理員那一頁共用 */
  feedbackRow(f: Feedback, onTap?: () => void): string {
    const body = (
      <>
        <div class="nt-head">
          <span class="fb-tag">{esc(feedbackCat(f.cat))}</span>
          <span class={"fb-tag " + f.status}>{esc(FEEDBACK_STATUS[f.status] || f.status)}</span>
          <span class="nt-date">{esc(noteDate(f.at))}{f.plat ? `｜${f.plat} ${f.ver || ""}` : ""}</span>
          {onTap ? <span class="nt-rep">處理 ›</span> : null}
        </div>
        <div class="fb-text">{esc(f.text)}</div>
        {f.reply ? <div class="fb-reply"><b>站長的回覆｜{esc(noteDate(f.rat))}</b>{esc(f.reply)}</div> : null}
      </>
    );
    return onTap ? <div class="nt" role="button" onTap={onTap}>{body}</div> : <div class="nt">{body}</div>;
  }

  // ── 管理員專區：意見回饋、管理員名單 ──
  adminFbTab = "open"; // open 還沒處理完的／all 全部
  adminFbStatus = ""; // 處理某一則時選的狀態
  adminFbReply: string | null = null; // 處理某一則時打到一半的回覆
  async adminFeedbackView(): Promise<string> {
    const sy = this.sync();
    let list: Feedback[] = [], open = 0, failed = "";
    try { const r = await sy.adm("fb", { op: "list" }); list = r.list || []; open = r.open || 0; } catch (e) { failed = String((e as Error)?.message || e); }
    const shown = this.adminFbTab === "open" ? list.filter((f) => f.status === "new" || f.status === "doing") : list;
    return (
      <Page title="意見回饋" subtitle="管理員專區" onBack={() => this.back()}>
        <Chips tabs>
          <Chip label={`待處理（${open}）`} muted={this.adminFbTab !== "open"} onTap={() => { this.adminFbTab = "open"; }} />
          <Chip label={`全部（${list.length}）`} muted={this.adminFbTab !== "all"} onTap={() => { this.adminFbTab = "all"; }} />
        </Chips>
        {failed ? <Note kind="warn" text={failed} /> : (
          <Section hint="點一則進去回覆、改處理狀態。使用者會在他的「設定 → 意見回饋」看到狀態和回覆。">
            {shown.length ? <div class="nt-list">{shown.map((f) => this.feedbackRow(f, () => { this.adminFbStatus = f.status; this.adminFbReply = null; this.go(() => this.adminFeedbackItemView(f)); }))}</div> : <Note text={this.adminFbTab === "open" ? "目前沒有待處理的回饋。" : "還沒有人送回饋。"} />}
          </Section>
        )}
      </Page>
    );
  }
  adminFeedbackItemView(f: Feedback): string {
    const sy = this.sync();
    const reply = this.adminFbReply === null ? f.reply : this.adminFbReply;
    const keep = (v?: Record<string, string>) => { if (v && typeof v.r === "string") this.adminFbReply = v.r; };
    return (
      <Page title="處理回饋" onBack={() => this.back()}>
        <Section title="使用者寫的">
          <div class="nt-list">{this.feedbackRow({ ...f, reply: "" })}</div>
        </Section>
        <Section title="處理狀態">
          <div class="nt-form"><div class="fb-cats">
            {Object.keys(FEEDBACK_STATUS).map((s) => <button class={"cm-tag" + (s === this.adminFbStatus ? " on" : "")} aria-pressed={s === this.adminFbStatus ? "true" : "false"} onTap={(v: Record<string, string>) => { keep(v); this.adminFbStatus = s; }}>{esc(FEEDBACK_STATUS[s])}</button>)}
          </div></div>
        </Section>
        <Section title="回覆" hint="可以留空（只改狀態）。回覆只有送這則回饋的那台裝置看得到；清空再儲存 = 收回回覆。">
          <div class="nt-form">
            <textarea class="fb-area" name="r" maxlength={String(FEEDBACK_MAX)} placeholder="寫給這位使用者的回覆">{esc(reply)}</textarea>
            <Button label="儲存" onTap={async (v) => {
              keep(v);
              try { await sy.adm("fb", { op: "update", id: f.id, status: this.adminFbStatus, reply: String(this.adminFbReply === null ? f.reply : this.adminFbReply) }); await this.ui.toast("已儲存"); this.back(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
            }} />
            <Button label="刪除這則回饋" kind="danger" onTap={async () => {
              try { await sy.adm("fb", { op: "delete", id: f.id }); await this.ui.toast("已刪除"); this.back(); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
            }} />
          </div>
        </Section>
      </Page>
    );
  }
  /** 管理員名單：站長本人（根管理員）存在伺服器的加密設定裡，這裡改不到；其他管理員可以在這裡新增、移除 */
  /** 管理員：用量。最近 14 天每天幾台裝置、各類請求幾次（伺服器自己數的約略值；日期是 UTC，跟 Cloudflare 每日額度同一個算法） */
  async adminUsageView(): Promise<string> {
    const sy = this.sync();
    type Day = { day: string; devices: number; n: Record<string, number> };
    let days: Day[] = [], today = "", failed = "";
    try { const r = await sy.adm("usage", {}); days = r.days || []; today = r.today || ""; } catch (e) { failed = String((e as Error)?.message || e); }
    const LIMIT = 100000;
    const NAMES: [string, string][] = [["fetch", "查場次"], ["social", "社群／短評"], ["sync", "同步／登入"], ["push", "通知"], ["version", "檢查更新"], ["page", "頁面"], ["feedback", "回饋"], ["api", "其他"]];
    const num = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+$)/g, ",");
    const row = (d: Day) => {
      const total = NAMES.reduce((a, [k]) => a + (d.n[k] || 0), 0);
      const hit = d.n["fetch-hit"] || 0, f = d.n.fetch || 0;
      const parts = NAMES.filter(([k]) => d.n[k]).map(([k, label]) => `${label} ${num(d.n[k])}`).join("、");
      const pct = Math.round((total / LIMIT) * 1000) / 10;
      return (
        <div class="us-day">
          <div class="us-top"><b>{esc(d.day.slice(5).replace("-", "/"))}{d.day === today ? "（今天）" : ""}</b><span>{num(total)} 個請求｜{pct}%</span></div>
          <div class="us-bar"><i style={`width:${Math.min(100, Math.max(1, pct))}%`} class={pct >= 80 ? "bad" : pct >= 50 ? "warn" : ""} /></div>
          <div class="us-sub2">{d.devices ? `約 ${num(d.devices)} 台裝置，平均每台 ${num(total / d.devices)} 個` : "裝置數還沒有資料"}</div>
          <div class="us-sub2">{esc(parts)}{f ? `｜查場次有 ${Math.round((hit / f) * 100)}% 直接用暫存` : ""}</div>
        </div>
      );
    };
    return (
      <Page title="用量" subtitle="最近 14 天" onBack={() => this.back()}>
        {failed ? <Section><Note kind="warn" text={failed} /></Section> : !days.length ? <Section><Note text="還沒有資料。這個統計從上線那一刻開始數，過幾分鐘再來看。" /></Section> : (
          <Section hint="百分比是跟 Cloudflare 免費方案的每日 100,000 個請求比（只算網頁版這一支，評分伺服器另外算，量很小）。日期用世界標準時間：每天台灣時間早上 8 點換日，額度也是那時候重算。數字是約略值，會比 Cloudflare 後台略少。裝置數靠每天隨機更換的匿名代號估算，不含還沒更新到新版的人。">
            <div class="us-days">{days.map(row)}</div>
          </Section>
        )}
      </Page>
    );
  }
  async adminListView(): Promise<string> {
    const sy = this.sync();
    let root: string[] = [], extra: string[] = [], failed = "";
    try { const r = await sy.adm("admins", { op: "list" }); root = r.root || []; extra = r.extra || []; } catch (e) { failed = String((e as Error)?.message || e); }
    const change = (op: string, email: string, done: string) => async () => {
      try { await sy.adm("admins", { op, email }); await this.ui.toast(done); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
    };
    return (
      <Page title="管理員名單" onBack={() => this.back()}>
        {failed ? <Note kind="warn" text={failed} /> : (
          <>
            <Section title="站長" hint="存在伺服器的加密設定裡，任何人都讀不出來、這裡也改不到（避免被誤刪而進不來）。要換的話到 Cloudflare 後台改。">
              {root.map((e) => <Item icon="👑" title={e} chevron={false} />)}
            </Section>
            <Section title={`其他管理員（${extra.length}）`} hint="新增後，對方要登出再用那個 Google 帳號重新登入一次才會生效。移除後立刻失效。">
              {extra.map((e) => <Item icon="👤" title={e} chevron={false} action={{ label: "移除", hint: "移除這位管理員", onTap: change("remove", e, "已移除") }} />)}
              <div class="nt-form">
                <input class="field" name="e" type="email" autocomplete="off" autocapitalize="off" placeholder="要新增的 Google 帳號（email）" />
                <Button label="新增管理員" onTap={async (v) => { const e = String(v.e || "").trim(); if (!e) { await this.ui.toast("先填 email"); return; } await change("add", e, "已新增")(); }} />
              </div>
            </Section>
          </>
        )}
      </Page>
    );
  }
  async syncView(): Promise<string> {
    const sy = this.sync();
    if (sy && !sy.on()) this.syncWho = null;
    const who = this.syncWho;
    return (
      <Page title="用 Google 帳號同步" onBack={() => this.back()}>
        {this.syncSection()}
      </Page>
    );
  }
  adminTab = "flagged"; // 短評管理看哪一份：flagged 被檢舉的／recent 最近的
  /** 管理員專區：短評的人工審核。「待複查」是被檢舉過或被自動隱藏的；「最近的短評」是全部看得到的（新的在前），可以主動巡。
   *  每則可以隱藏、還原（之後不再被自動隱藏）、刪除。只有管理員名單裡的 Google 帳號進得來，伺服器每個動作都會再驗一次 */
  async adminNotesView(): Promise<string> {
    const sy = this.sync();
    const WHY: Record<string, string> = { spoiler: "劇透", abuse: "不當內容", spam: "廣告" };
    type Row = { m: string; id: number; x: string; sp?: number; s?: number; at: number; hidden?: number; keep?: number; why?: Record<string, number> };
    let rows: Row[] = [], total = 0, failed = "";
    try {
      if (this.adminTab === "recent") { const r = await sy.admin({ op: "recent" }); rows = r.recent || []; total = r.total || rows.length; }
      else {
        const r = await sy.admin({ op: "flagged" });
        for (const k of Object.keys(r.flagged || {})) for (const n of r.flagged[k]) rows.push({ m: k, ...n });
        rows.sort((a, b) => (a.keep ? 1 : 0) - (b.keep ? 1 : 0) || b.at - a.at); // 還沒處理的在前
        total = rows.length;
      }
    } catch (e) { failed = String((e as Error)?.message || e); }
    const act = (op: string, n: Row, done: string) => async () => {
      try { await sy.admin({ op, m: n.m, id: n.id }); await this.ui.toast(done); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
    };
    const row = (n: Row) => {
      const why = Object.keys(n.why || {}).map((w) => `${WHY[w] || w} ${n.why![w]}`).join("、");
      const state = n.hidden ? "已隱藏" : n.keep ? "已還原" : "顯示中";
      return (
        <div class="nt">
          <div class="nt-head">
            <span class={"nt-score" + (n.hidden ? " bad" : n.keep ? " good" : "")}>{state}</span>
            {n.sp ? <span class="nt-sp">可能有雷</span> : null}
            <span class="nt-date">{esc(noteDate(n.at))}{n.s ? `｜${n.s} 分` : ""}</span>
          </div>
          <div class="nt-text">{esc(n.x)}</div>
          <div class="nt-meta">{esc(n.m)}{why ? `｜檢舉：${why}` : ""}</div>
          <div class="nt-acts">
            {n.hidden ? <button onTap={act("restore", n, "已還原，之後不會再被自動隱藏")}>還原</button> : <button onTap={act("hide", n, "已隱藏")}>隱藏</button>}
            {!n.hidden && !n.keep && why ? <button onTap={act("restore", n, "已標成沒問題，之後不會再被自動隱藏")}>沒問題</button> : null}
            <button class="danger" onTap={act("delete", n, "已刪除")}>刪除</button>
          </div>
        </div>
      );
    };
    return (
      <Page title="短評管理" onBack={() => this.back()}>
        <Chips tabs>
          <Chip label="待複查" muted={this.adminTab !== "flagged"} onTap={() => { this.adminTab = "flagged"; }} />
          <Chip label="最近的短評" muted={this.adminTab !== "recent"} onTap={() => { this.adminTab = "recent"; }} />
        </Chips>
        {failed ? <Note kind="warn" text={failed} /> : (
          <Section title={this.adminTab === "recent" ? `最近的短評（${total}）` : `被檢舉或被隱藏的（${total}）`} hint={this.adminTab === "recent" ? "所有看得到的短評，新的在前（最多列 200 則）。" : "隱藏：別人看不到，作者自己看得到提示。還原／沒問題：恢復顯示，之後不再被自動隱藏。刪除：直接拿掉，救不回來。"}>
            {rows.length ? <div class="nt-list">{rows.map(row)}</div> : <Note text={this.adminTab === "recent" ? "還沒有人寫短評。" : "目前沒有要複查的短評。"} />}
          </Section>
        )}
      </Page>
    );
  }
  syncSection(): string {
    const sy = this.sync();
    if (!sy) return "";
    if (!sy.on())
      return (
        <Section hint={this.syncNote || "登入後，收藏影城、收藏電影、收藏發行商和各項設定會存到你的帳號，在別的裝置或瀏覽器登入同一個帳號就會帶過來。伺服器只存帳號的識別碼（經過雜湊）和設定；你的 email 只留在這台裝置上顯示用，伺服器不存。不登入也能照常使用。"}>
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
        <Item icon="🚪" title="登出" subtitle="這台的收藏會留著，只是不再同步" chevron={false} onTap={async () => { await sy.logout(); forgetMyVotes(); this.syncWho = null; this.diaryMem = null; this.meMem = null; this.hasProfile = null; this.syncNote = ""; this.setUnread(0); this.pushSync(); await this.ui.toast("已登出"); }} />
        {this.hasProfile !== false ? <Item icon="🧹" title="只刪除我的片單和個人檔案" subtitle="片單、暱稱、追蹤關係、用帳號評的分和短評會刪掉，救不回來；不會登出，收藏和設定的同步不受影響" chevron={false} onTap={() => this.go(() => this.wipeConfirmView())} /> : null}
        <Item icon="🗑" title="刪除帳號裡的資料並登出" subtitle="伺服器上的設定、片單、暱稱和你用帳號評的分都會刪掉，所有裝置都會登出；這台的收藏會留著" chevron={false} onTap={async () => { await this.wipeSocial().catch(() => undefined); await sy.wipe(); this.syncWho = null; this.syncNote = ""; this.pushSync(); await this.ui.toast("已刪除並登出"); }} />
      </Section>
    );
  }
  pubAsk = 0; // 按了「公開個人頁」的時間：一分鐘內顯示確認（同 notifyOffAsk）
  notifyOffAsk = 0; // 按了「關閉通知」的時間：一分鐘內顯示「確定要關嗎」（過了就當沒按，免得下次進來還停在確認）
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
    const on = NOTIFY_KINDS.filter((k) => prefs[k.id] && (k.group !== "admin" || !!(this.meMem && this.meMem.data.admin))).map((k) => k.label.replace(/時$/, ""));
    const note = state === "on" ? (on.length ? (on.length > 3 ? `${on.slice(0, 3).join("、")}等 ${on.length} 種` : on.join("、")) : "每一種通知都關著") : state === "needs-install" ? "要先把「片刻」加到主畫面" : state === "unsupported" ? "這個瀏覽器不支援" : state === "denied" ? "系統設定裡沒有允許通知" : "開放場次、上映、快下檔、影展開始時通知你";
    return (
      <Section title="通知">
        <Item icon={state === "on" ? "🔔" : "🔕"} title="通知設定" subtitle={note} right={state === "on" ? "已開啟" : "未開啟"} onTap={() => this.go(() => this.notifyView())} />
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
      <Page title="通知" onBack={() => this.back()}>
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
        <Section title="通知" hint="iPhone 和 iPad 要先把「片刻」加到主畫面，從主畫面的圖示開啟後，才能開啟通知（這是 iOS 的規定）。">
          <Item icon="🔔" title="先加到主畫面" subtitle="收藏電影開放場次、上映、快下檔時通知你" onTap={() => this.go(() => this.installView())} />
        </Section>
      );
    if (state === "unsupported")
      return (
        <Section title="通知">
          <Item icon="🔕" title="這個瀏覽器不支援通知" subtitle="可以改用 Safari（iPhone 要加到主畫面）、Chrome 或 Edge" chevron={false} />
        </Section>
      );
    if (state === "denied")
      return (
        <Section title="通知" hint="到手機或瀏覽器的設定，把「片刻」的「通知」改成允許，再回來這裡開啟。">
          <Item icon="🔕" title="通知被關掉了" subtitle="系統設定裡沒有允許「片刻」發通知" chevron={false} />
        </Section>
      );
    if (state !== "on")
      return (
        <Section title="通知" hint="開啟後，你收藏的片名會存在我們的伺服器上，用來判斷什麼時候通知你；有登入的話，也會記下這台裝置登入的帳號，有人回覆、追蹤你時才通知得到。隨時可以關閉，關閉時伺服器上的資料會一起刪掉。">
          <Item icon="🔔" title="開啟通知" subtitle={signedIn() ? "有人回覆、提到或追蹤你時；收藏的電影開放場次、上映、快下檔時" : n ? `目前收藏了 ${n} 部：開放場次、上映、快下檔、影展開始時通知` : "開放場次、上映、快下檔、影展開始時通知。先開著，之後收藏的片都會算進去"} chevron={false} />
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
        <Section title="社群" hint={signedIn() ? "事情發生的當下就通知；有開勿擾時段的話，那段時間的會留到之後再發。" : "要先用 Google 帳號登入，這兩種才會發。"}>
          {NOTIFY_KINDS.filter((k) => k.group === "social").map(row)}
        </Section>
        {this.meMem && this.meMem.data.admin ? (
          <Section title="管理員">
            {NOTIFY_KINDS.filter((k) => k.group === "admin").map(row)}
          </Section>
        ) : null}
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
        <Section title="每週摘要與公告" hint="不用收藏電影也會發；預設關閉，想要再打開。「收藏影城每週新片」要先有收藏影城。">
          {NOTIFY_KINDS.filter((k) => k.group === "all").map(row)}
        </Section>
        <Section title="勿擾時段" hint={quiet.on ? `${hh(quiet.from)} 到${quiet.from > quiet.to ? "隔天" : ""} ${hh(quiet.to)} 所有通知都不發（包含社群的回覆、追蹤），這段時間的留到之後再發。` : "任何時間都可能發通知。"}>
          <Item icon={quiet.on ? "✅" : "⬜️"} title="晚上不要通知我" chevron={false} onTap={() => set({ quietOn: !quiet.on })} />
          {quiet.on ? <PickRow title="開始" name="qfrom" value={String(quiet.from)} options={hours} onPick={(v) => set({ quietFrom: Number(v) })} /> : null}
          {quiet.on ? <PickRow title="結束" name="qto" value={String(quiet.to)} options={hours} onPick={(v) => set({ quietTo: Number(v) })} /> : null}
        </Section>
        <Section hint={`已開啟${n ? `，目前收藏了 ${n} 部` : "；還沒有收藏的電影，到電影頁點愛心收藏"}。你收藏的片名存在我們的伺服器上，只用來判斷什麼時候通知；關閉通知時會一起刪掉。`}>
          <Item icon="📨" title="傳一則測試通知" subtitle="確認這台裝置收得到" chevron={false} onTap={async () => { await this.ui.toast((await p.test()) ? "已送出，幾秒內應該會收到" : "送不出去，請關閉通知後重新開啟"); }} />
          {Date.now() - this.notifyOffAsk < 60e3 ? (
            <div class="nt-form">
              <Note kind="warn" text="確定要關閉通知嗎？關閉後不會再收到任何通知（包含有人回覆、追蹤你），伺服器上跟通知有關的資料也會刪掉。之後想要可以再開，各種通知的開關要重新確認一次。" />
              <Button label="確定關閉" kind="danger" onTap={async () => { this.notifyOffAsk = 0; await p.disable(); this.pushSt = "off"; await this.ui.toast("通知已關閉"); }} />
              <Button label="不要關，保留通知" kind="secondary" onTap={() => { this.notifyOffAsk = 0; }} />
            </div>
          ) : <Item icon="🔕" title="關閉通知" subtitle="停止通知，並刪除伺服器上的資料" chevron={false} onTap={() => { this.notifyOffAsk = Date.now(); }} />}
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
    // 送過回饋的人：看看有沒有還沒看過的回覆（最多等 0.6 秒，不拖慢設定頁；沒送過的不問伺服器）
    const fbList = feedbackSent() ? await Promise.race([loadMyFeedback().catch(() => null), sleep(600).then(() => null)]) : null;
    const fbNew = fbList ? feedbackUnread(fbList) : 0;
    this.calendarName = (await currentCalendar(this.settings)).title;
    return (
      <Page title="設定">
        {await this.accountSection()}
        <Section title="加入行事曆時" hint={`廣告預告：${ADS_NOTE}`}>
          <Item icon="📅" title="寫入的行事曆" subtitle={this.calendarName} onTap={() => this.go(() => this.calendarView())} />
          <Item icon="📺" title="廣告預告" subtitle={`預計散場時間會加上 ${this.settings.ads} 分鐘`} right="點一下切換" chevron={false} onTap={() => this.cycleAds()} />
          <Item icon="🗺" title="導航地圖" subtitle="點地址、分享、行程備註的導航連結" right={MAPS_LABEL[this.settings.maps || "apple"]} chevron={false} onTap={() => {
            this.settings.maps = this.settings.maps === "google" ? "apple" : "google";
            saveSettings(this.settings);
          }} />
        </Section>
        <Section title="收藏">
          <Item icon="★" title="收藏影城" subtitle="搜尋影城、增加或取消收藏" right={this.settings.favorites.length ? `${this.settings.favorites.length} 間` : "還沒有"} onTap={() => { this.cinemaFavQuery = ""; this.go(() => this.cinemaManageView()); }} />
          <Item icon="♥" title="收藏電影" subtitle="搜尋全部的電影、增加或取消收藏" right={(this.settings.favMovies || []).length ? `${(this.settings.favMovies || []).length} 部` : "還沒有"} onTap={() => { this.favQuery = ""; this.go(() => this.favManageView(), "讀取電影…"); }} />
          <Item icon="🏢" title="收藏發行商" subtitle="搜尋發行商、增加或取消收藏" right={(this.settings.favIssuers || []).length ? `${(this.settings.favIssuers || []).length} 家` : "還沒有"} onTap={() => { this.issuerQuery = ""; this.go(() => this.issuerManageView(), "讀取發行商…"); }} />
        </Section>
        {await this.notifyLink()}
        <Section title="關於">
          {IS_WEB && !this.isStandalone() ? <Item icon="📲" title="加到主畫面" subtitle="像 App 一樣從主畫面開啟，看圖示教學" onTap={() => this.go(() => this.installView())} /> : null}
          <Item icon="ℹ️" title="關於" subtitle="資料來源、隱私權政策、場次通" onTap={() => this.go(() => this.aboutView())} />
          <Item icon="💬" title="意見回饋" subtitle={fbNew ? "站長回覆你了，點進來看" : "回報問題、資料有誤，或建議新功能"} right={fbNew ? "● 新回覆" : ""} onTap={() => { this.fbCat = ""; this.fbDraft = ""; this.fbForce = true; this.go(() => this.feedbackView(), "讀取中…"); }} />
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
  async citiesView(): Promise<string> {
    if (!this.cinemas.length) this.cinemas = await loadCinemas(); // 重新整理後直接回到這個頁籤時，影城清單還沒讀過
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

  noteDraft: string | null = null; // 短評頁輸入框裡還沒送出的字（null = 用已經送出的那一則）
  noteSpoil: boolean | null = null; // 「可能有雷」有沒有勾（null = 跟已經送出的那一則一樣）
  noteAsk = ""; // 偵測到可能有雷、正在問要不要標記的那句話
  noteShown: number[] = []; // 已經點開的「可能有雷」短評
  noteEdit = false; // 短評頁上面寫短評的那一塊有沒有展開（預設收起來）
  noteFilter = "all"; // 短評清單的篩選：all 全部／follow 追蹤中／clean 不看有雷的
  noteSort = "hot"; // 排序：hot 熱門／new 最新／top 最多推／high 評分高到低／low 評分低到高
  /** 短評內文：@暱稱 變成可以點的連結（點了開那個人的個人頁） */
  noteBody(x: string): string {
    return String(x || "").split(/(@[\p{L}\p{N}_]{2,16})/u).map((part, i) => (i % 2 ? <button class="at" onTap={() => this.go(() => this.profileView(part.slice(1)), "讀取個人頁…")}>{esc(part)}</button> : esc(part))).join("");
  }
  noteReset() { this.noteDraft = null; this.noteSpoil = null; this.noteAsk = ""; this.noteShown = []; this.noteEdit = false; this.noteReplyTo = 0; this.noteReplyDraft = ""; this.noteMenu = 0; this.noteFocus = null; }
  /** 短評頁：上面寫（或改）自己的一句話，下面是大家的。另開一頁，不擠在電影頁。
   *  防雷：輸入框提醒不提劇情、可以自己標「可能有雷」、偵測到劇透字眼送出前問一次；有雷的預設摺疊，點了才顯示。
   *  每則可以檢舉（劇透／不當內容／廣告），被多人檢舉的由伺服器自動摺疊或隱藏 */
  noteFocus: { x: string; at: number; head?: boolean } | null = null; // 從片單、個人頁點某一則短評進來：到討論區後捲到那一則並標亮（用內容對）
  noteReplyTo = 0; // 正在回覆哪一則（0 = 沒有）
  noteReplyDraft = ""; // 回覆打到一半的字
  noteMenu = 0; // 哪一則的「⋯」選單是開的
  async notesView(title: string): Promise<string> {
    let list = notesCached(title);
    let failed = "";
    try { list = await loadNotes(title); } catch (e) { if (!list) failed = String((e as Error)?.message || e); }
    const c = communityCached(title) || (await communityStats(title).catch(() => null));
    const voted = c ? c.mine : 0;
    const notes = list ? list.notes : [];
    const tops = notes.filter((n) => !n.r);
    const mineCount = tops.filter((n) => n.mine).length;
    const maxMine = (list && list.max) || 5;
    const draft = this.noteDraft === null ? "" : this.noteDraft;
    const spoil = !!this.noteSpoil;
    /** 每個按鈕都會帶著輸入框目前的字：先記下來，畫面重畫才不會把打到一半的字清掉 */
    const keep = (v?: Record<string, string>) => { if (v && typeof v.x === "string") this.noteDraft = v.x; if (v && typeof v.rx === "string") this.noteReplyDraft = v.rx; };
    const say = async (job: Promise<unknown>, done: string) => {
      try { await job; if (done) await this.ui.toast(done); return true; } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); return false; }
    };
    const send = async (text: string, sp: boolean) => {
      if (await say(addNote(title, text, sp), "短評已送出")) { this.noteReset(); await this.askNickname(); }
    };
    const submit = async (v?: Record<string, string>) => {
      keep(v);
      const text = String(this.noteDraft === null ? "" : this.noteDraft).replace(/\s+/g, " ").trim();
      if (!text) { await this.ui.toast("先寫一句再送出"); return; }
      if (Array.from(text).length > noteMax()) { await this.ui.toast(`短評最多 ${noteMax()} 個字`); return; }
      if (!spoil && noteLooksSpoiler(text) && this.noteAsk !== text) { this.noteAsk = text; return; } // 先問一次要不要標記
      await send(text, spoil);
    };
    const sendReply = async (to: number, v?: Record<string, string>) => {
      keep(v);
      const text = this.noteReplyDraft.replace(/\s+/g, " ").trim();
      if (!text) { await this.ui.toast("先寫一句再送出"); return; }
      if (Array.from(text).length > noteMax()) { await this.ui.toast(`回覆最多 ${noteMax()} 個字`); return; }
      if (await say(addNote(title, text, noteLooksSpoiler(text), to), "已回覆")) { this.noteReplyTo = 0; this.noteReplyDraft = ""; await this.askNickname(); }
    };
    // 登入的人：這部片我追蹤的人怎麼評（沒追蹤任何人就是空的）。有寫短評的在下面的清單裡；只評分沒寫的另外列一行
    const friends = signedIn() ? ((await social<{ list: DiaryEntry[] }>("friends", { m: communityKey(title) }).catch(() => null)) || { list: [] }).list : [];
    const quiet = friends.filter((e) => e.by && e.s && !e.x);
    // 討論串：短評在第一層，回覆縮排接在底下。篩選、排序只管第一層；回覆照時間由舊到新
    const hasFollow = tops.some((n) => n.by && n.by.f);
    const hasSpoiler = tops.some((n) => n.sp);
    if (this.noteFilter === "follow" && !hasFollow) this.noteFilter = "all";
    if (this.noteFilter === "clean" && !hasSpoiler) this.noteFilter = "all";
    const byNew = (x: ReviewNote, y: ReviewNote) => y.at - x.at || y.id - x.id;
    const shown = tops
      .filter((n) => (this.noteFilter === "follow" ? !!(n.by && n.by.f) || !!n.mine : this.noteFilter === "clean" ? !n.sp : true))
      .sort((x, y) => (this.noteSort === "new" ? byNew(x, y) : this.noteSort === "top" ? (y.p || 0) - (x.p || 0) || byNew(x, y) : this.noteSort === "high" ? y.s - x.s || byNew(x, y) : this.noteSort === "low" ? x.s - y.s || byNew(x, y) : noteHot(y) - noteHot(x) || byNew(x, y)));
    const kidsOf: Record<number, ReviewNote[]> = {};
    for (const n of notes) if (n.r) (kidsOf[n.r] ||= []).push(n);
    for (const k of Object.keys(kidsOf)) kidsOf[Number(k)].sort((x, y) => x.at - y.at || x.id - y.id);
    const SORTS = [{ id: "hot", label: "熱門" }, { id: "new", label: "最新" }, { id: "top", label: "最多推" }, { id: "high", label: "評分高到低" }, { id: "low", label: "評分低到高" }];
    const editing = this.noteEdit || !!this.noteAsk;
    const unsent = !!draft.trim(); // 打到一半、還沒送出的字
    // 要標亮的那一則（第一層裡內容一樣的；有雷、被噓到摺疊的也直接打開）。排序、篩選把它藏起來的話，改回「全部」
    // head = 只知道開頭（從通知進來的）：找內容是這樣開頭的那一則，回覆也算
    const nf = this.noteFocus;
    const focus = nf ? (nf.head ? notes.find((n) => !n.del && n.x.indexOf(nf.x) === 0) : tops.find((n) => n.x === nf.x)) || null : null;
    if (focus && !focus.r && shown.indexOf(focus) < 0) { this.noteFilter = "all"; shown.push(focus); }
    if (focus && this.noteShown.indexOf(focus.id) < 0) this.noteShown = [...this.noteShown, focus.id];
    const total = notes.filter((n) => !n.del && !(n.hidden && !n.mine)).length;
    // 圖示（自己畫的簡單線條）：回覆、向上、向下、更多
    const ICO = {
      reply: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h9a7 7 0 0 1 7 7v3"/></svg>',
      up: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 4.5 12.5H9V20h6v-7.5h4.5z"/></svg>',
      down: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20 4.5 11.5H9V4h6v7.5h4.5z"/></svg>',
      more: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    };
    /** 一則（短評或回覆）：上面一行頭像＋名字＋時間，中間內容，右下一排圖示（更多、回覆、推 分數 噓），底下縮排接著它的回覆 */
    const row = (n: ReviewNote, depth: number): string => {
      const kids = kidsOf[n.id] || [];
      const below = kids.length ? <div class="th-kids">{kids.map((k) => row(k, depth + 1))}</div> : null;
      // 已刪除、或被隱藏（不是自己的）：只剩一個空殼撐住底下的回覆
      if (n.del || (n.hidden && !n.mine)) return <div class="th"><div class="th-gone">{n.del ? "這則已經刪除" : "這則已被隱藏"}</div>{below}</div>;
      const p = n.p || 0;
      const sunk = p <= NOTE_FOLD_AT && !n.mine; // 被噓到很低的先摺起來
      const open = (!n.sp && !sunk) || this.noteShown.indexOf(n.id) >= 0;
      const reported = !!list && list.reported.indexOf(n.id) >= 0;
      const who = n.by ? n.by.name : n.mine ? "我" : "匿名";
      const toProfile = n.by ? (v: Record<string, string>) => { keep(v); this.go(() => this.profileView(n.by!.name), "讀取個人頁…"); } : undefined;
      const vote = (dir: number) => async (v: Record<string, string>) => { keep(v); await say(voteNote(title, n.id, n.my === dir ? 0 : dir), ""); };
      const menu = this.noteMenu === n.id;
      const replying = this.noteReplyTo === n.id;
      return (
        <div class={"th" + (n.mine ? " mine" : "") + (focus && focus.id === n.id ? " focus" : "")} data-jump={focus && focus.id === n.id ? `${n.id}-${this.noteFocus!.at}` : undefined}>
          <div class="th-head">
            {n.by ? <button class="th-av" aria-label={`${n.by.name} 的個人頁`} onTap={toProfile}>{this.avatar(n.by)}</button> : <span class="th-av"><span class="av anon" aria-hidden="true">{n.mine ? "我" : "匿"}</span></span>}
            {toProfile ? <button class="th-name" onTap={toProfile}>{esc(who)}</button> : <span class="th-name dim">{esc(who)}</span>}
            <span class="th-time">・{esc(noteDate(n.at))}</span>
            {n.by && n.by.f ? <span class="th-f">追蹤中</span> : null}
            {n.s && !n.r ? <span class={"nt-score " + ratingTier("imdb", n.s)}>{n.s} 分</span> : null}
            {n.sp ? <span class="nt-sp">有雷</span> : null}
          </div>
          {open ? <div class="th-text">{this.noteBody(n.x)}</div> : <button class="nt-cover" onTap={(v: Record<string, string>) => { keep(v); this.noteShown = [...this.noteShown, n.id]; }}>{sunk && !n.sp ? "被噓到摺疊了，點一下顯示" : "可能有雷，點一下顯示"}</button>}
          {n.mine && n.hidden ? <div class="th-warn">這則被多人檢舉，目前別人看不到。</div> : null}
          <div class="th-acts">
            <button class={"ib" + (menu ? " on" : "")} aria-label="更多" aria-expanded={menu ? "true" : "false"} onTap={(v: Record<string, string>) => { keep(v); this.noteMenu = menu ? 0 : n.id; }}>{ICO.more}</button>
            <button class={"ib" + (replying ? " on" : "")} aria-label="回覆" onTap={(v: Record<string, string>) => { keep(v); this.noteReplyDraft = ""; this.noteReplyTo = replying ? 0 : n.id; this.noteMenu = 0; }}>{ICO.reply}</button>
            <span class="th-vote">
              {n.mine ? <span class="ib off">{ICO.up}</span> : <button class={"ib" + (n.my === 1 ? " up" : "")} aria-label="推" aria-pressed={n.my === 1 ? "true" : "false"} onTap={vote(1)}>{ICO.up}</button>}
              <b class={p > 0 ? "pos" : p < 0 ? "neg" : ""} aria-label={`推減噓：${p}`}>{p}</b>
              {n.mine ? <span class="ib off">{ICO.down}</span> : <button class={"ib" + (n.my === -1 ? " down" : "")} aria-label="噓" aria-pressed={n.my === -1 ? "true" : "false"} onTap={vote(-1)}>{ICO.down}</button>}
            </span>
          </div>
          {menu ? (
            <div class="th-menu">
              {n.mine ? <button onTap={async (v: Record<string, string>) => { keep(v); this.noteMenu = 0; await say(spoilNote(title, n.id, !n.sp), n.sp ? "已取消有雷" : "已標成有雷，別人要點開才看得到"); }}>{n.sp ? "取消「有雷」" : "標成有雷"}</button> : null}
              {n.mine ? <button class="danger" onTap={async (v: Record<string, string>) => { keep(v); this.noteMenu = 0; await say(deleteNote(title, n.id), "已刪除"); }}>刪除這則</button>
                : reported ? <span>已經檢舉過了</span>
                : <button onTap={(v: Record<string, string>) => { keep(v); this.noteMenu = 0; this.go(() => this.reportView(title, n)); }}>檢舉這則</button>}
            </div>
          ) : null}
          {replying ? (
            <div class="th-reply">
              <textarea class="fb-area note" name="rx" maxlength={String(noteMax())} placeholder={`回覆 ${who}（最多 ${noteMax()} 字）`} autofocus>{esc(this.noteReplyDraft)}</textarea>
              <div class="cmt-row">
                <span class="sp" />
                <button onTap={() => { this.noteReplyTo = 0; this.noteReplyDraft = ""; }}>取消</button>
                <button class="go" onTap={(v: Record<string, string>) => sendReply(n.id, v)}>送出</button>
              </div>
            </div>
          ) : null}
          {below}
        </div>
      );
    };
    return (
      <Page title="短評" subtitle={`《${title}》`} onBack={() => this.back()}>
        <Section>
          {!voted ? <Note text="先替這部片評分，就可以寫短評。回覆、推和噓不用先評分。" /> : mineCount >= maxMine ? <Note text={`這部片你已經發了 ${maxMine} 則短評，先刪掉一則才能再發（回覆不受這個限制）。`} /> : !editing ? (
            // 收起來的樣子：像留言區最上面那一格「寫點什麼…」，點了才展開
            <button class="cmt-new" onTap={() => { this.noteEdit = true; this.noteReplyTo = 0; }}>
              <span class={"cmt-new-box" + (unsent ? " draft" : "")}>{unsent ? esc(draft) : `${NOTE_PLACEHOLDER}…`}</span>
              <i>{unsent ? "還沒送出，繼續寫" : "寫短評"}</i>
            </button>
          ) : (
            <div class="nt-form">
              {/* 往下滑看別人的短評時自動收起來（沒在打字的時候）；打到一半的字會留著 */}
              <button class="hid" data-fold="" aria-hidden="true" tabindex="-1" onTap={(v: Record<string, string>) => { keep(v); if (!this.noteAsk) this.noteEdit = false; }} />
              <textarea class="fb-area note" name="x" maxlength={String(noteMax())} placeholder={`${NOTE_PLACEHOLDER}（最多 ${noteMax()} 字）`}>{esc(draft)}</textarea>
              {this.noteAsk ? (
                <>
                  <Note kind="warn" text="這句看起來可能有雷。要標記「可能有雷」再送出嗎？" />
                  <div class="cmt-row">
                    <button onTap={() => { this.noteAsk = ""; }}>再改一下</button>
                    <span class="sp" />
                    <button onTap={async (v: Record<string, string>) => { keep(v); await send(this.noteAsk, false); }}>沒有雷，直接送出</button>
                    <button class="go" onTap={async (v: Record<string, string>) => { keep(v); await send(this.noteAsk, true); }}>標記後送出</button>
                  </div>
                </>
              ) : (
                // 一排搞定：左邊勾「可能有雷」，右邊取消、送出。發出去之後不能改（改了別人的推噓就不準了），只能刪掉重發
                <div class="cmt-row">
                  <button class={"cmt-spoil" + (spoil ? " on" : "")} aria-pressed={spoil ? "true" : "false"} aria-label="可能有雷：勾了以後預設摺疊，點了才會顯示" onTap={(v: Record<string, string>) => { keep(v); this.noteSpoil = !spoil; }}><i>{spoil ? "✓" : ""}</i>可能有雷</button>
                  <span class="sp" />
                  <button onTap={() => { this.noteEdit = false; this.noteDraft = null; this.noteSpoil = null; this.noteAsk = ""; }}>取消</button>
                  <button class="go" onTap={submit}>送出</button>
                </div>
              )}
              {mineCount ? <div class="cm-tagnote">這部片你已經發了 {mineCount}／{maxMine} 則。發出去之後不能修改，只能刪掉重發。</div> : null}
            </div>
          )}
        </Section>
        <Section title={`短評（${total}）`} hint={`${NOTE_RULES}被噓到 ${NOTE_FOLD_AT} 以下的會自動摺疊。違規的可以從「⋯」檢舉。`}>
          {tops.length > 1 || hasFollow ? (
            <div class="cmt-bar">
              <div class="cmt-filters">
                <button class={"cm-tag" + (this.noteFilter === "all" ? " on" : "")} onTap={(v: Record<string, string>) => { keep(v); this.noteFilter = "all"; }}>全部</button>
                {hasFollow ? <button class={"cm-tag" + (this.noteFilter === "follow" ? " on" : "")} onTap={(v: Record<string, string>) => { keep(v); this.noteFilter = "follow"; }}>追蹤中</button> : null}
                {hasSpoiler ? <button class={"cm-tag" + (this.noteFilter === "clean" ? " on" : "")} onTap={(v: Record<string, string>) => { keep(v); this.noteFilter = "clean"; }}>不看有雷的</button> : null}
              </div>
              <select class="sel" name="ns" aria-label="排序" onInput={(v: Record<string, string>) => { keep(v); this.noteSort = v.ns || "hot"; }}>
                {SORTS.map((o) => <option value={o.id} selected={o.id === this.noteSort}>{esc(o.label)}</option>)}
              </select>
            </div>
          ) : null}
          {quiet.length ? <div class="cmt-quiet">你追蹤的人也評了分：{quiet.map((e) => <button onTap={(v: Record<string, string>) => { keep(v); this.go(() => this.profileView(e.by!.name), "讀取個人頁…"); }}>{this.avatar(e.by!)}<span>{esc(e.by!.name)}</span><b>{e.s} 分</b></button>)}</div> : null}
          {failed ? <Note kind="warn" text={failed} /> : null}
          {shown.length ? <div class="th-list">{shown.map((n) => row(n, 0))}</div> : failed ? null : <Note text={tops.length ? "這個篩選下沒有短評。" : "還沒有人寫短評。"} />}
        </Section>
      </Page>
    );
  }
  /** 檢舉一則短評：選原因就送出 */
  reportView(title: string, n: ReviewNote): string {
    return (
      <Page title="檢舉短評" onBack={() => this.back()}>
        <Section title="要檢舉的短評">
          <div class="nt-list"><div class="nt"><div class="nt-text">{esc(n.x)}</div></div></div>
        </Section>
        <Section title="原因" hint="同一則被 2 個人檢舉劇透會自動摺疊，被 3 個人檢舉會自動隱藏。檢舉是匿名的。">
          {REPORT_REASONS.map((r) => (
            <Item title={r.label} subtitle={r.note} onTap={async () => {
              try { await reportNote(title, n.id, r.id); await this.ui.toast("已送出檢舉，謝謝"); } catch (e) { await this.ui.toast(String((e as Error)?.message || e)); }
              this.back();
            }} />
          ))}
        </Section>
      </Page>
    );
  }
  rateOpenFor = ""; // 哪一部片的「你的評分」是展開的（預設收起來，省空間）
  /** 存觀影紀錄（日期、方式、要不要只給自己看）。以伺服器回的那一筆為準更新畫面；觀影方式沒有真的存進去就明講 */
  async saveWatch(title: string, body: Record<string, unknown>, done: string): Promise<void> {
    const k = communityKey(title);
    try {
      // 以伺服器回的那一筆為準更新畫面（不是「送出去了就當成功」）；觀影方式沒有真的存進去就明講
      const r = await social<{ entry: DiaryEntry | null }>("entry", { m: k, title, ...body });
      const list = (this.diaryMem ? this.diaryMem.list : []).filter((x) => x.k !== k);
      this.diaryMem = { at: Date.now(), list: r.entry ? [r.entry, ...list] : list };
      const want = Array.isArray(body.how) ? (body.how as string[]).slice().sort().join(",") : null;
      const got = ((r.entry && r.entry.how) || []).slice().sort().join(",");
      if (want !== null && want !== got) { await this.ui.toast("觀影方式沒有存進去，請過一分鐘再試一次"); return; }
      await this.ui.toast(done);
    } catch (err) { await this.ui.toast(String((err as Error)?.message || err)); }
  }
  /** 觀影時間、觀影方式兩列（電影頁的評分卡和片單裡的那一筆共用） */
  watchFields(title: string, e: DiaryEntry | null): string {
    const seen = e ? e.seen : "", how = (e && e.how) || [];
    const save = (body: Record<string, unknown>, done: string) => this.saveWatch(title, body, done);
    return (
      <>
            <div class="cm-tagrow">
              <span class="cm-taghead">觀影時間{seen === "?" ? "（已標記看過，沒記日期）" : ""}</span>
              {/* 一顆看得懂的按鈕：上面寫「選擇日期」或已經選的日期；真正的日期選單疊在上面（透明），點下去直接開系統的日曆，選了就存，不用再按儲存 */}
              <label class={"wt-pick" + (/^\d{4}-/.test(seen) ? " on" : "")}>
                <span class="wt-ico">📅</span>
                <span class="wt-text">{/^\d{4}-/.test(seen) ? seen.replace(/-/g, "/") : "選擇日期"}</span>
                <span class="wt-hint">{/^\d{4}-/.test(seen) ? "點一下修改" : "點一下開日曆"}</span>
                <input name="wd" type="date" max={todayTPE()} value={/^\d{4}-/.test(seen) ? seen : ""} aria-label="觀影日期" onInput={(v: Record<string, string>) => { const d = String(v.wd || ""); if (d && d !== seen) return save({ seen: d }, `已記下：${d.replace(/-/g, "/")} 看的`); }} />
              </label>
              <div class="cm-tagset wt-quick">
                <button class={"cm-tag" + (seen === todayTPE() ? " on" : "")} onTap={() => save({ seen: todayTPE() }, "已記下：今天看的")}>今天</button>
                <button class={"cm-tag" + (seen === "?" ? " on" : "")} onTap={() => save({ seen: "?" }, "已標記看過")}>不記得日期</button>
                {seen ? <button class="cm-tag" onTap={() => save({ seen: "", how: [] }, "已清除觀影紀錄")}>清除</button> : null}
              </div>
            </div>
            <div class="cm-tagrow">
              <span class="cm-taghead">觀影方式（可複選）{how.length ? `：已選 ${howLabel(how)}` : ""}</span>
              <div class="cm-tagset">
                {WATCH_HOW.map((w) => { const on = how.indexOf(w.id) >= 0; return <button class={"cm-tag" + (on ? " on" : "")} aria-pressed={on ? "true" : "false"} onTap={() => save({ how: on ? how.filter((x) => x !== w.id) : [...how, w.id] }, on ? `已取消「${w.label}」` : `已記下：${w.label}`)}>{esc(w.label)}</button>; })}
              </div>
            </div>
      </>
    );
  }
  watchOpenFor = ""; // 哪一部片的「觀影紀錄」是展開的
  /** 評分卡裡的「觀影紀錄」（登入的人才有）：觀影時間、觀影方式，跟心得標籤一樣在同一頁展開，不用跳頁。
   *  沒評分也可以填（填了就算看過，會記進我的片單） */
  watchInline(title: string): string {
    const k = communityKey(title);
    const open = this.watchOpenFor === k;
    const e = (this.diaryMem ? this.diaryMem.list : []).find((x) => x.k === k) || null;
    const seen = e ? e.seen : "", how = (e && e.how) || [];
    const summary = [/^\d{4}-/.test(seen) ? seen.replace(/-/g, "/") : seen === "?" ? "看過" : "", howLabel(how)].filter(Boolean).join("｜");
    const save = (body: Record<string, unknown>, done: string) => this.saveWatch(title, body, done);
    return (
      <>
        <button class="cm-tagbar" aria-expanded={open ? "true" : "false"} onTap={async () => {
          if (open) { this.watchOpenFor = ""; return; }
          await this.myDiary().catch(() => []); // 先讀自己的片單，才知道這部片填過什麼
          this.watchOpenFor = k;
        }}>
          <span>觀影紀錄</span>
          <em>{this.diaryMem && summary ? summary : open ? "還沒填" : "什麼時候看的、在哪裡看的"}</em>
          <i>{open ? "收合 ▾" : summary && this.diaryMem ? "修改 ▸" : "填寫 ▸"}</i>
        </button>
        {open ? (
          <div class="cm-tags">
            {this.watchFields(title, e)}
            <div class="cm-tagnote">會記進「設定 → 我的片單」。個人頁公開的話別人也看得到；要單獨隱藏這一筆，到我的片單裡設定。</div>
          </div>
        ) : null}
      </>
    );
  }
  tagsOpenFor = ""; // 哪一部片的心得標籤選單是展開的
  /** 片刻評分卡片：平均、人數、分布，以及「你的評分」一排 1～10 的格子（點已選的那一格可以取消）。
   *  評過分以後多一列「心得標籤」：點開是固定的選項（不能打字，所以不會暴雷），最多選 5 個；大家選最多的幾個列在平均分數下面 */
  community(title: string, c: Community | false | undefined): string {
    const top = topReviewTags(c);
    const myTags = c && c.myTags ? c.myTags.filter((id) => reviewTagLabel(id)) : [];
    const tagsOpen = this.tagsOpenFor === communityKey(title);
    const rateOpen = this.rateOpenFor === communityKey(title);
    const pickTag = async (id: string) => {
      const next = reviewTagsToggle(myTags, id);
      if (!next) { await this.ui.toast(reviewTagsFull(id)); return; }
    try {
        await communityTags(title, next);
      } catch (e) {
        await this.ui.toast(String((e as Error)?.message || e));
      }
    };
    const n = c ? c.n : 0;
    const avg = c && n ? c.avg : 0;
    const mine = c ? c.mine : 0;
    const status = c === undefined ? "讀取中…" : c === false ? "片刻評分暫時讀不到" : n ? `${n} 人評分` : "還沒有人評分，來當第一個";
    const max = c ? Math.max(1, ...c.dist) : 1;
    const vote = async (s: number) => {
    try {
        await communityVote(title, s === mine ? 0 : s);
        await this.ui.toast(s === mine ? "已取消你的評分" : `已送出 ${s} 分`);
        if (s !== mine) await this.askNickname();
      } catch (e) {
        await this.ui.toast(String((e as Error)?.message || e));
      }
    };
    // 平均分數的色塊跟 IMDb 同一套（綠／黃／紅）；分布縮成一個小長條圖；自己的評分是一排 1～10 的格子，選幾分就亮到幾分
    const tier = n ? ratingTier("imdb", avg) : "none";
    return (
      <Section title="片刻評分" hint="匿名評分，一台裝置一票，可以隨時更改；再點一次已選的分數可以取消。評分後可以再選心得標籤。各版本的評分會一起統計。">
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
          {top.length ? <div class="cm-toptags" aria-label="大家選最多的心得標籤">{top.map((t) => <span>{esc(t.label)} <b>{t.pct}%</b></span>)}</div> : null}
          {/* 你的評分：預設收起來只留一列（分數、選了幾個標籤），點了才展開評分格、心得標籤、觀影紀錄 */}
          <button class={"cm-mine fold" + (n ? " line" : "")} aria-expanded={rateOpen ? "true" : "false"} onTap={() => { this.rateOpenFor = rateOpen ? "" : communityKey(title); }}>
            <span>你的評分</span>
            {mine ? <b>{mine} 分</b> : <em>{rateOpen ? "點一個分數" : "還沒評分"}</em>}
            {!rateOpen && myTags.length ? <em class="cm-sum">{esc(myTags.map(reviewTagLabel).join("、"))}</em> : <em class="cm-sum" />}
            <i>{rateOpen ? "收合 ▾" : mine ? "修改 ▸" : "評分 ▸"}</i>
          </button>
          {rateOpen ? (
          <>
          <div class="cm-pick">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
              <button class={"cm-num" + (v <= mine ? " on" : "")} aria-label={`${v} 分`} aria-pressed={v === mine ? "true" : "false"} onTap={() => vote(v)}>
                {v}
              </button>
            ))}
          </div>
          <div class="cm-ends"><span>不推薦</span><span>必看</span></div>
          {mine ? (
            <>
              <button class="cm-tagbar" aria-expanded={tagsOpen ? "true" : "false"} onTap={() => { this.tagsOpenFor = tagsOpen ? "" : communityKey(title); }}>
                <span>心得標籤</span>
                <em>{myTags.length ? esc(myTags.map(reviewTagLabel).join("、")) : "點選幾個看完的感覺（不用打字）"}</em>
                <i>{tagsOpen ? "收合 ▾" : myTags.length ? "修改 ▸" : "選擇 ▸"}</i>
              </button>
              {tagsOpen ? (
                <div class="cm-tags">
                  {REVIEW_TAGS.map((g) => (
                    <div class="cm-tagrow">
                      <span class="cm-taghead">{esc(g.group)}{g.single ? "（選一個）" : g.max ? `（最多 ${g.max} 個）` : ""}</span>
                      <div class="cm-tagset">
                        {g.tags.map((t) => <button class={"cm-tag" + (myTags.indexOf(t.id) >= 0 ? " on" : "")} aria-pressed={myTags.indexOf(t.id) >= 0 ? "true" : "false"} onTap={() => pickTag(t.id)}>{esc(t.label)}</button>)}
                      </div>
                    </div>
                  ))}
                  <div class="cm-tagnote">{REVIEW_TAGS_NOTE}</div>
                  <button class="cm-tagask" onTap={() => { this.fbCat = "idea"; if (!this.fbDraft) this.fbDraft = "想要的心得標籤："; this.fbForce = true; this.go(() => this.feedbackView(), "讀取中…"); }}>想要的標籤沒有？告訴我們 ›</button>
                </div>
              ) : null}
            </>
          ) : null}
          {c && signedIn() ? this.watchInline(title) : null}
          </>
          ) : null}
          {c && (mine || c.notes) ? (
            <button class="cm-tagbar" onTap={() => { this.noteReset(); this.go(() => this.notesView(title), "讀取短評…"); }}>
              <span>短評</span>
              <em>{c.notes ? `${c.notes} 則` : "還沒有人寫"}</em>
              <i>{mine ? (c.notes ? "看全部／寫一句 ▸" : "寫一句 ▸") : "看全部 ▸"}</i>
            </button>
          ) : null}
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
    // 沒找到確定的預告片：不列原因（太多字），只說按鈕會開 YouTube 的搜尋結果
    if (x?.err) lines = [...lines, "預告會開 YouTube 搜尋結果"];
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
  installView(welcome = false): string {
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
      <Page title={welcome && !done ? "歡迎使用片刻" : "加到主畫面"} subtitle={welcome && !done ? "先花十秒加到主畫面" : "像 App 一樣從主畫面開啟"} onBack={() => this.back()}>
        {welcome && !done ? (
          <Section>
            <div class="nb-ask">
              <div class="nb-ico" aria-hidden="true">📲</div>
              <b>建議先把片刻加到主畫面</b>
              <p>加了之後，從主畫面的圖示開啟就像一般的 App：沒有網址列、開得比較快，而且才能開啟通知（收藏的電影開賣、有人回覆你）。{ios ? "iPhone 規定要這樣才能收通知。" : ""}</p>
            </div>
          </Section>
        ) : null}
        {body}
        {welcome && !done ? <Section><div class="nt-form"><Button label="先不用，直接開始用" kind="secondary" onTap={() => this.back()} /></div></Section> : null}
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
  boxStatus = ""; // 歷年電影只看上映中（now）／少數戲院（few）／已下檔（off）；空 = 全部
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
      <Section title={`《${boxRunsName(x)}》歷次上映`} hint="官方把每一次上映分開算，這裡把同一部片的放在一起。資料從 2016 年開始，更早的上映沒有紀錄。">
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
    const introJob = loadIntro(x.name, x.release).catch(() => ({ intro: "", director: "", cast: "" }));
    const introGot = await Promise.race([introJob, sleep(this.rerendering ? 0 : 800).then(() => undefined)]);
    // 重映的判斷要另外兩份資料（從分享連結、收藏直接進來時還沒讀）：同樣是讀好再補上
    const rr = rerunDataReady();
    const rrDone = rr ? await Promise.race([rr.then(() => true), sleep(this.rerendering ? 0 : 800).then(() => false)]) : true;
    const waiting: Promise<unknown>[] = [];
    if (introGot === undefined) waiting.push(introJob);
    if (rr && !rrDone) waiting.push(rr);
    if (waiting.length) this.late = waiting;
    const about = movieAbout(introGot || null); // 簡介本文，加上導演、演員各一行（跟有場次的電影頁同一種排法）
    const date = x.release.replace(/-/g, "/");
    return (
      <Page title={x.name} subtitle={`票房第 ${x.rank} 名`} onBack={() => this.back()}>
        {this.hero(e, x.name, [boxCountryText(x.country), `${date} 上映`])}
        {/* 個別資訊：跟官方網站列的欄位一樣（國別、發行、出品、上映日期、院數、票數、金額） */}
        {about.text || about.credits ? (
          <Section title={about.text ? "劇情簡介" : "導演與演員"} hint="資料來自 TMDB。">
            <Para text={about.text || about.credits} dim={about.text ? about.credits : ""} />
          </Section>
        ) : null}
        <Section title="票房資訊" hint="資料來源：國家電影及視聽文化中心「全國電影票房統計」。">
          <Item kv title="狀態" tag={{ text: STATUS_LABEL[boxStatus(x)], tone: boxStatus(x) }} />
          {boxInfoRows(x, info).map(([label, value]) => <Item kv title={label} right={value} />)}
        </Section>
        {this.runsSection(x)}
        <Note text={boxStatus(x) === "few" ? "官方票房資料顯示這部片最近一週還有賣出票，但場次通目前查不到場次：可能只剩少數戲院（二輪、獨立戲院）在放，或這幾天剛下檔。" : "這部片已經下檔，場次通目前沒有它的場次。"} />
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
    const soonAbout = movieAbout(u);
    return (
      <Page title={u.title} subtitle={`${date} 上映`} onBack={() => this.back()}>
        {this.hero(e, u.title, [u.en, [`${date} ${u.approx ? "當週" : ""}上映`, u.rating, u.runtime ? `${u.runtime} 分` : ""].filter(Boolean).join("｜")].filter(Boolean), { en: u.en, poster: u.poster })}
        {soonAbout.text || soonAbout.credits ? (
          <Section title={soonAbout.text ? "劇情簡介" : "導演與演員"} hint="資料來自 TMDB。">
            <Para text={soonAbout.text || soonAbout.credits} dim={soonAbout.text ? soonAbout.credits : ""} />
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
    const boxJob = boxInfoBy(m.title).catch(() => null);
    const boxGot = await Promise.race([boxJob, sleep(this.rerendering ? 0 : 400).then(() => undefined)]);
    if (boxGot === undefined) this.late = [...(this.late || []), boxJob]; // 還沒好：先畫場次，讀好再補上（不讓整頁等它）
    const box = boxGot || null;
    // 「上映類型」「歷次上映」要另外兩份比較大的資料：票房資訊展開了才去讀，讀好再補上
    if (box && this.infoOpen) { const rr = rerunDataReady(); if (rr) this.late = [...(this.late || []), rr]; }
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
    const who = param("u").trim().slice(0, 16);
    if (who) { this.switchTab("settings"); this.go(() => this.profileView(who), "讀取個人頁…"); return; }
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
