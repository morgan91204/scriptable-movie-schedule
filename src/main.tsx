// 🎬 電影行程：選影城 → 日期 → 電影 → 場次 → 加入 iOS 行事曆
// 執行環境：Scriptable（iOS）。原始碼用 TSX 撰寫，編譯後的 .js 放進 Scriptable 執行。
// 畫面：WebView（HTML/CSS），事件迴圈在 run()。資料層在 core.ts，網頁解析在 parsers.ts。

import { h, Fragment, Page, Section, Item, Chips, Chip, Button, Search, Note, Para, Loading, Empty, Hero, Steps } from "./jsx";
import type { RatingBadge } from "./jsx";
import { UI } from "./ui";
import { setPlatform } from "./platform";
import { scriptablePlatform } from "./platform-scriptable";
import {
  Cinema, Settings, Movie, Version, EXTRA, CITY_ORDER, AD_STEPS,
  todayTPE, nowHM, addDays, isLate, dateLabel, tpeDate, fmt, byShowtime,
  loadSettings, saveSettings, loadCinemas, datesOf, moviesOf, loadMovies, movieDay, TW,
  FORMATS, formatsOf, filterVersions, filterVersionsAny, movieRows, movieDays, nearest, kmLabel, WINDOWS, findShowtimes, findShowtimesMulti, multiLabel, multiDetail, groupByMovie, fillMovieDay, movieDayFilled, movieCinemaVersions, showDay, lateIsTonight, shareText,
  hallOf, tmdbTest, movieExtras, moviePoster, movieRuntime, posterSrc, cachePoster, prefetchPosters, movieLines, releaseLabel, releaseOf, boxOfficeLines, boxOfficeNote, boxOfficeBy, boxOfficeTitle, boxOfficeFooter, boxCountries, boxByCountry, boxInfo, boxInfoRows, boxCountryText, BOX_COUNTRY_NOTE, boxCountryTag, boxCountriesPicked, loadMovieBoard, soonGroups, boxSorts, boxYears, boxYearsPicked, boxMatcher, posterLight, BOX_PAGE, foregroundTask, communityStats, communityCached, communityVote, loadBoxOffice, loadBoxOfficeFull, loadBoxOfficeWeeks, boxWeekOptions, boxWeekPicked, money, matchBoxOffice, boxOfficeLabel, mapsUrl, MAPS_LABEL, TMDB_LINKS, extractTmdbKey, cinemaApp, bookingUrl, checkLatest, ABOUT_URL, PRIVACY_URL, ADS_NOTE, loadFestivals, festivalsReady, festivalNote, festivalDates, festivalDay, festivalLines, festivalFilmSessions, festivalPlace, festivalCinema, festivalDefaultDate, festivalStateLabel, festivalState, festivalFooter, linkMovies, nowGroupLine, nowFilter, festivalPick, movieAbout, festivalSearch, festivalSearchLines, festivalTrailer, festivalYears, festivalsAny, festivalGroups, festivalChipNote, festivalStatusLine, movieRatings, ratingTier,
} from "./core";
import type { MovieExtras, Ratings, Community, BoxOfficeItem, BoxSort, MovieEntry, Festival, FestivalFilm, FestivalSession } from "./core";
import { setTabBar, setBackGuard, esc } from "./jsx";
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

/** 電影頁頂端要用的資料：預告／海報（x）、三大評分（r）、海報網址（p）、觀眾評分（c：undefined 讀取中、false 讀不到） */
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
        const r = await (globalThis as any).fetch("/api/version?t=" + Date.now(), { cache: "no-store" });
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
    setTabBar(() => ({ active: this.tab, items: this.TABS, onTap: (id) => this.switchTab(id) }));
    setBackGuard(() => this.stack.length > 1);
    this.go(() => this.homeView(), "讀取影城清單…");
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
      if (!quick) await this.ui.render(<Page title="電影行程"><Loading text={this.loadingText} /></Page>);
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

  // ── 首頁 ──
  async homeView(): Promise<string> {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    this.calendarName = (await currentCalendar(this.settings)).title;
    const favs = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean) as Cinema[];
    return (
      <Page title="🎬 電影行程" subtitle={`${this.cinemas.length} 間影城｜選影城 → 日期 → 電影 → 場次`}>
        <Section>
          <Item icon="🕘" title="現在有什麼可以看" subtitle="依時段找常去、附近或各縣市的場次" onTap={() => this.go(() => this.nowView())} />
          <Item icon="🎞️" title="依電影找場次" subtitle="先選電影，再看哪些影城有放映" onTap={() => this.go(() => this.movieListView(), "讀取電影清單…")} />
          <Item icon="🧭" title="附近的影城" subtitle="依目前位置排序" onTap={() => this.go(() => this.nearbyView(), "取得目前位置…")} />
          <Item icon="🎦" title="依縣市找影院" subtitle={`全台 ${this.cinemas.length} 間，也可以搜尋影城`} onTap={() => this.go(() => this.citiesView())} />
        </Section>
        {favs.length ? (
          <Section hint="影城搜尋在「影城」分頁，行事曆與提醒在「設定」分頁。">
            {/* 預設收合，只留這一列；點一下展開清單 */}
            <Item head icon="★" title={`常去影城（${favs.length} 間）`} subtitle={this.favOpen ? "點一下收合" : "點一下展開"} chevron={false} onTap={() => { this.favOpen = !this.favOpen; }} action={{ label: this.favOpen ? "▾" : "▸", hint: this.favOpen ? "收合常去影城" : "展開常去影城", onTap: () => { this.favOpen = !this.favOpen; } }} />
            {(this.favOpen ? favs : []).map((c) => (
              <Item icon="★" title={c.name} subtitle={`${c.city} ${c.district}`} onTap={() => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)} />
            ))}
          </Section>
        ) : null}
        {this.installEntry()}
        {await this.versionNote()}
      </Page>
    );
  }

  // ── 設定 ──
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
          <Item icon="⏱" title="補片長（TMDB）" subtitle={this.settings.tmdbToken ? "已設定：沒有片長的電影會自動補上" : "未設定"} onTap={() => this.go(() => this.tmdbView())} />
        </Section>
        <Section title="關於" hint="連鎖影城的場次來自場次通（twshowtimes.com），感謝場次通的整理；其他來自開眼電影網，以及誠品、光點、樂聲官網。實際場次以影城公告為準。">
          {IS_WEB && !this.isStandalone() ? <Item icon="📲" title="加到主畫面" subtitle="像 App 一樣從主畫面開啟，看圖示教學" onTap={() => this.go(() => this.installView())} /> : null}
          <Item icon="ℹ️" title="關於與資料來源" accent chevron={false} onTap={() => Safari.open(ABOUT_URL)} />
          <Item icon="🔒" title="隱私權政策" accent chevron={false} onTap={() => Safari.open(PRIVACY_URL)} />
          <Item icon="🙏" title="前往場次通" subtitle="比較各影城場次、看上映場數排行" accent chevron={false} onTap={() => Safari.open("https://twshowtimes.com/")} />
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
  citiesView(): string {
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    return (
      <Page title="依縣市找影院" subtitle={`全台 ${this.cinemas.length} 間`} onBack={() => this.back()}>
        <Section>
          <Item icon="🔍" title="搜尋影城" subtitle="影城、分店、行政區或縣市" onTap={() => this.go(() => this.searchView())} />
        </Section>
        <Section title="縣市" hint="影城清單來自場次通與開眼電影網，會自動更新。">
          {cities.map((city) => (
            <Item title={city} badge={`${this.cinemas.filter((c) => c.city === city).length} 間`} onTap={() => this.go(() => this.cityView(city))} />
          ))}
        </Section>
      </Page>
    );
  }

  // ── 搜尋 ──
  query = "";
  searchView(): string {
    const k = this.query.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k
      ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k))
      : [];
    return (
      <Page title="搜尋影城" onBack={() => this.back()}>
        <Search value={this.query} placeholder="搜尋影城，例如：松仁、西門、in89、台南" autofocus onInput={(t) => { this.query = t; }} />
        {k ? (
          <Section title={`結果 ${hits.length} 間`}>
            {hits.length ? null : <Note text="找不到相符的影城，換個關鍵字試試。" />}
            {hits.map((c) => this.cinemaItem(c))}
          </Section>
        ) : null}
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

  tmdbStatus = "";
  async saveTmdb(raw: string) {
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
      this.tmdbStatus = `❌ ${String((e as Error)?.message || e)}`;
    }
  }

  tmdbView(): string {
    const open = (url: string) => async () => {
      await Safari.openInApp(url, false); // 在 App 內開網頁，關掉就回到這裡
    };
    return (
      <Page title="補片長（TMDB）" onBack={() => { this.tmdbStatus = ""; this.back(); }}>
        <Note text="場次通的重映、修復版、演唱會有時沒有片長。設定 TMDB 金鑰後，會自動用片名查片長，也會顯示海報和預告片。免費，金鑰只存在你的手機。" />
        <Section title="① 註冊並登入 TMDB">
          <Item icon="👤" title="註冊 TMDB 帳號" subtitle="填完後到信箱點驗證信" accent chevron={false} onTap={open(TMDB_LINKS.signup)} />
          <Item icon="🔑" title="已經有帳號：登入" accent chevron={false} onTap={open(TMDB_LINKS.login)} />
        </Section>
        <Section title="② 申請 API">
          <Item icon="📝" title="開啟 API 申請頁" subtitle="選 Developer → 同意條款 → 用途填 Personal use（個人使用）、網址可填 https://github.com" accent chevron={false} onTap={open(TMDB_LINKS.request)} />
          <Item icon="📋" title="開啟 API 金鑰頁" subtitle="複製「API Read Access Token」（eyJ 開頭）或「API Key」（32 碼）都可以" accent chevron={false} onTap={open(TMDB_LINKS.api)} />
        </Section>
        <Section title="③ 回到這裡貼上">
          <Item icon="📥" title="從剪貼簿貼上並測試" subtitle="複製好金鑰後點這裡" accent chevron={false} onTap={() => this.saveTmdb(Pasteboard.paste() || "")} />
          <input class="field" name="v" value={this.settings.tmdbToken || ""} placeholder="或手動貼上金鑰" />
        </Section>
        {this.tmdbStatus ? <Note kind={this.tmdbStatus.startsWith("❌") ? "error" : undefined} text={this.tmdbStatus} /> : null}
        <Button kind="primary" enter label="儲存並測試" onTap={(v: Record<string, string>) => this.saveTmdb(String(v.v || ""))} />
        {this.settings.tmdbToken ? <Button kind="danger" label="清除金鑰" onTap={() => this.saveTmdb("")} /> : null}
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
          <Item icon={fav ? "★" : "☆"} title={fav ? "移出常去影城" : "加入常去影城"} chevron={false} onTap={() => this.toggleFav(c)} />
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
    // 觀眾評分：剛投過票或 5 秒內讀過就直接用；失敗回傳 false（顯示讀不到）
    const pc = communityStats(title).catch(() => false as const);
    const wait = this.rerendering ? 0 : 400;
    const quick = <T,>(p: Promise<T>) => Promise.race([p, sleep(wait).then(() => undefined)]);
    const [x, r, p, c] = await Promise.all([quick(px), quick(pr), quick(pp), quick(pc)]);
    const loading = x === undefined || r === undefined || p === undefined;
    const late = [x === undefined ? px : null, r === undefined ? pr : null, p === undefined ? pp : null, c === undefined ? pc : null].filter(Boolean) as Promise<unknown>[];
    if (late.length) this.late = late;
    return { x: x ?? null, r: r ?? null, p: p || "", px, loading, c: c === undefined ? communityCached(title) || undefined : c };
  }

  /** 觀眾評分卡片：平均、人數、分布，以及「你的評分」五顆星（點已選的那顆可以取消） */
  community(title: string, c: Community | false | undefined): string {
    const n = c ? c.n : 0;
    const avg = c && n ? c.avg : 0;
    const mine = c ? c.mine : 0;
    const status = c === undefined ? "讀取中…" : c === false ? "觀眾評分暫時讀不到" : n ? `${n} 人評分` : "還沒有人評分，來當第一個";
    const max = c ? Math.max(1, ...c.dist) : 1;
    const vote = async (s: number) => {
      try {
        await communityVote(title, s === mine ? 0 : s);
        await this.ui.toast(s === mine ? "已取消你的評分" : `已送出 ${s} 分`);
      } catch (e) {
        await this.ui.toast(String((e as Error)?.message || e));
      }
    };
    return (
      <Section title="觀眾評分" hint="滿分 10 分。匿名評分，一台手機一票，可以隨時更改；再點一次已選的分數可以取消。各版本的評分會一起統計。">
        <div class="cm">
          <div class="cm-top">
            <div class="cm-avg">{n ? avg.toFixed(1) : "-"}<small>／10</small></div>
            <div class="cm-meta">
              <span class="cm-stars" aria-label={n ? `平均 ${avg} 分，滿分 10 分` : "還沒有評分"}>
                <span class="bg">★★★★★</span>
                <span class="fg" style={`width:${(avg / 10) * 100}%`}>★★★★★</span>
              </span>
              <span class="cm-n">{esc(status)}</span>
            </div>
            {c && n ? (
              <div class="cm-dist">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                  <div class="cm-row">
                    <span>{s}</span>
                    <i style={`width:${Math.round(((c.dist[s - 1] || 0) / max) * 100)}%`} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div class="cm-mine">
            <span>{mine ? `你給 ${mine} 分` : "點一個分數評分（滿分 10）"}</span>
          </div>
          <div class="cm-pick">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <button class={"cm-num" + (s === mine ? " on" : s < mine ? " below" : "")} aria-label={`${s} 分`} onTap={() => vote(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  hero(e: Extras, title: string, lines: string[]): string {
    const { x, r } = e;
    const posterUrl = x?.poster || e.p || "";
    const poster = posterSrc(posterUrl);
    if (poster && poster === posterUrl) cachePoster(posterUrl); // 這次用網址顯示，順便抓進快取
    const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`;
    // 評分讀好後三個徽章都顯示：沒有那項評分就是「-」（跟「還沒抓到」分得開）
    const badges: RatingBadge[] = [];
    if (r) {
      badges.push(r.imdb ? { kind: "imdb", value: r.imdb.score.toFixed(1), tier: ratingTier("imdb", r.imdb.score), onTap: () => Safari.open(r.imdb!.url) } : { kind: "imdb", value: "-", tier: "none" });
      badges.push(r.tomato ? { kind: "tomato", value: `${r.tomato.score}%`, tier: ratingTier("pct", r.tomato.score), note: r.tomato.certified ? "✓" : undefined, onTap: () => Safari.open(r.tomato!.url) } : { kind: "tomato", value: "-", tier: "none" });
      badges.push(r.popcorn ? { kind: "popcorn", value: `${r.popcorn.score}%`, tier: ratingTier("pct", r.popcorn.score), onTap: () => Safari.open(r.popcorn!.url) } : { kind: "popcorn", value: "-", tier: "none" });
    }
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
      body = <Note text="✅ 已經加到主畫面了。之後從主畫面的「電影行程」圖示開啟就可以。" />;
    } else if (prompt) {
      body = (
        <>
          <Button label="📲 安裝到主畫面" onTap={install} />
          <Note text="按下後瀏覽器會跳出確認視窗，選「安裝」。裝好後會多一個「電影行程」圖示，開起來沒有網址列，像一般的 App。" />
        </>
      );
    } else if (ios && !iosOther) {
      body = (
        <>
          <Steps items={[
            { icon: "share", title: "點「分享」按鈕", text: "Safari 下方工具列上，方框加向上箭頭的圖示。找不到的話先點「⋯」，再點「分享」。" },
            { icon: "plus", title: "往下滑，點「加入主畫面」", text: "選單裡方框加一個加號的那一項。" },
            { icon: "check", title: "點右上角的「加入」", text: "名稱可以維持「電影行程」。" },
            { icon: "home", title: "從主畫面開啟", text: "主畫面會多一個「電影行程」圖示，開起來沒有網址列，像一般的 App。" },
          ]} />
          <Note text="要用 Safari 才能加到主畫面。常去影城等設定存在瀏覽器裡：從主畫面開啟的版本是另一份，設定要重新設一次。" />
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
          { icon: "plus", title: "在網址列右邊找「安裝」圖示", text: "Chrome、Edge 會在網址列右邊出現一個安裝圖示；沒有的話從瀏覽器選單裡找「安裝電影行程」。" },
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
  /** 電影分頁上方的切換：上映中／票房排行 */
  movieMode: "box" | "soon" | "fest" = "box"; // box = 「電影」清單（上映中與票房排行合成一份）
  movieModeChips(): string {
    return (
      <Chips tabs>
        <Chip label="已上映" muted={this.movieMode !== "box"} onTap={() => { this.movieMode = "box"; }} />
        <Chip label="即將上映" muted={this.movieMode !== "soon"} onTap={() => { this.movieMode = "soon"; }} />
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
    return (
      <Page title="依電影找場次" subtitle={`${f.name}｜${festivalStatusLine(f)}`} onBack={() => this.back()}>
        {this.movieModeChips()}
        <Search value={this.festQuery} placeholder={`搜尋 ${year} 年影展的片名`} onInput={(t) => { this.festQuery = t; }} />
        {years.length > 1 ? (
          <Section title="年份">
            <Chips scroll>
              {years.map((y) => <Chip label={`${y}`} sub={y === Number(todayTPE().slice(0, 4)) ? "今年" : ""} muted={y !== year} onTap={() => { this.festYear = y; this.festTab = ""; this.festId = ""; this.festDate = ""; }} />)}
            </Chips>
          </Section>
        ) : null}
        {/* 進行中和已結束分成兩頁，一次只列一頁的影展 */}
        {pick.tabs.length > 1 ? (
          <Chips tabs>
            {pick.tabs.map((t) => <Chip label={t.label} sub={`${t.count} 個影展`} muted={t.id !== pick.tab} onTap={() => { this.festTab = t.id; this.festId = ""; this.festDate = ""; }} />)}
          </Chips>
        ) : null}
        <Section title={`${pick.tabs.find((t) => t.id === pick.tab)?.label || "影展"}｜${pick.items.length} 個影展`} hint={pick.items.length > 3 ? "可以左右滑動" : ""}>
          <Chips scroll>
            {pick.items.map((x) => <Chip label={x.name} sub={festivalChipNote(x)} muted={x.id !== f.id} onTap={() => { this.festId = x.id; this.festDate = ""; }} />)}
          </Chips>
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
    // 觀眾評分：跟院線片共用同一套（片名相同就是同一部片的分數）
    const rated: Community | false = communityCached(film.title) || (await communityStats(film.title).catch(() => false as const));
    const sessions = festivalFilmSessions(f, film.id);
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
        <Hero title={film.title} poster={film.poster || undefined} lines={[[film.rating, film.mins ? `${film.mins} 分鐘` : ""].filter(Boolean).join("｜"), `${f.name}（${festivalStateLabel(f)}）`, "影展片名，院線上映時可能不同"]} trailerLabel={festivalTrailer(film).label} onTrailer={() => Safari.open(festivalTrailer(film).url)} />
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

  boxAsc = false; // 反過來排（低到高、舊到新、少到多）；換一種排法就回到預設方向
  boxRate = ""; // 依評分排時用哪一種評分（空 = IMDb）
  boxOpen = ""; // 目前展開哪一組篩選（週次／年份／出品國別；空 = 都收合）
  boxSort = ""; // 排法：本週票房／累計票房／上映日期／評分／影城數／年度排行（year，含已下檔）（空 = 第一種）
  boxYears: string[] = []; // 年度排行選了哪幾年（空 = 最新的一年）
  boxWeek = ""; // 週票房看哪一週（空 = 最新）
  boxCountry: string[] = []; // 只看哪幾個出品國別（可以複選；空 = 全部）
  boxLimit = 100; // 年度排行目前顯示幾列
  boxPageKey = "";
  /** 「電影」清單：上映中與票房排行合成一份（範圍、排序、出品國別都在這裡選） */
  async boxOfficeView(): Promise<string> {
    // 票房、片單（依觀眾評分排時再加評分總表）一次讀好；票房讀不到時清單照樣出來，只是少了依票房排的選項
    const k = this.movieQuery.trim().toLowerCase();
    const board = await loadMovieBoard({ sort: this.boxSort, years: this.boxYears, week: this.boxWeek, countries: this.boxCountry, query: k, asc: this.boxAsc, rate: this.boxRate });
    const { years, countries } = board;
    const selYears = board.selYears, country = board.selCountries;
    // 年度排行一年有六百部左右、全選是好幾千部：先畫 100 列，快滑到底時自動接著載入（不用按）。換了排法、年份或搜尋字就從頭開始
    const paged = board.paged;
    const pageKey = `${board.asc}|${board.rate}|${board.scope}|${board.sort}|${selYears.join(",")}|${board.selWeek}|${k}|${country.join(",")}`;
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
    const fold = (id: string, title: string, summary: string) => (
      <Item title={title} right={`${summary} ${this.boxOpen === id ? "▾" : "▸"}`} chevron={false} onTap={() => { this.boxOpen = this.boxOpen === id ? "" : id; }} />
    );
    const item = (e: MovieEntry, i: number) => {
      const m = e.m, x = e.x;
      return (
        <Item
          rank={e.rank === null ? undefined : e.rank}
          thumb={thumb(posters[i] as string | undefined)}
          title={e.name}
          subtitle={e.lines.filter(Boolean).join("\n")}
          onTap={m ? () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`) : x ? () => this.go(() => this.boxMovieView(x), `讀取《${x.name}》…`) : undefined}
        />
      );
    };
    return (
      <Page title="依電影找場次" subtitle={board.title} onBack={() => this.back()}>
        {this.movieModeChips()}
        {/* 搜尋放最上面；範圍和排序併成一排（最後一項是年度排行） */}
        <Search value={this.movieQuery} placeholder="搜尋片名（中文或英文）" onInput={(t) => { this.movieQuery = t; }} />
        {board.orders.length > 1 ? (
          <Chips scroll>
            {/* 再點一次選中的那一顆 = 反過來排；箭頭標方向（↓ 高到低、新到舊、多到少） */}
            {board.orders.map((x) => <Chip label={`${x.id === "year" ? "年度排行（含已下檔）" : x.label}${board.order === x.id ? (board.asc ? " ↑" : " ↓") : ""}`} muted={board.order !== x.id} onTap={() => { if (board.order === x.id) this.boxAsc = !this.boxAsc; else { this.boxSort = x.id; this.boxAsc = false; } }} />)}
          </Chips>
        ) : null}
        {/* 週次、出品國別、年份預設收合成一行，點了才展開 */}
        {board.weeks.length > 1 || countries.length > 1 || board.rates.length > 1 || (board.scope === "year" && years.length > 1) ? (
          <Section hint={this.boxOpen === "country" ? BOX_COUNTRY_NOTE + "可以左右滑動。" : this.boxOpen === "year" ? "可以複選，選了幾年就合在一起排；全選就是 2016 年至今的總排行。" : this.boxOpen === "week" ? "可以回頭看過去幾週的排行。" : this.boxOpen === "rate" ? "番茄指數是影評的分數、爆米花指數是觀眾的分數（都來自爛番茄）；觀眾評分是這個 App 的使用者打的。" : ""}>
            {board.rates.length > 1 ? fold("rate", "評分來源", board.rateSummary) : null}
            {board.rates.length > 1 && this.boxOpen === "rate" ? (
              <Chips scroll>
                {board.rates.map((r) => <Chip label={r.label} muted={board.rate !== r.id} onTap={() => { this.boxRate = r.id; }} />)}
              </Chips>
            ) : null}
            {board.weeks.length > 1 ? fold("week", "週次", board.weekSummary) : null}
            {board.weeks.length > 1 && this.boxOpen === "week" ? (
              <Chips>
                {board.weeks.map((o) => <Chip label={o.label} sub={o.note} muted={board.selWeek !== o.id} onTap={() => { this.boxWeek = o.note === "最新" ? "" : o.id; }} />)}
              </Chips>
            ) : null}
            {board.scope === "year" && years.length > 1 ? fold("year", "年份", board.yearSummary) : null}
            {board.scope === "year" && years.length > 1 && this.boxOpen === "year" ? (
              <Chips>
                {/* 全選：再點一次回到只看最新的一年 */}
                <Chip label="全選" muted={selYears.length !== years.length} onTap={() => { this.boxYears = selYears.length === years.length ? [] : years.slice(); }} />
                {years.map((y) => (
                  <Chip label={y} muted={selYears.indexOf(y) < 0} onTap={() => { this.boxYears = selYears.indexOf(y) < 0 ? [...selYears, y] : selYears.length > 1 ? selYears.filter((z) => z !== y) : selYears; }} />
                ))}
              </Chips>
            ) : null}
            {countries.length > 1 ? fold("country", "出品國別", board.countrySummary) : null}
            {countries.length > 1 && this.boxOpen === "country" ? (
              <Chips scroll>
                <Chip label="全部" sub={`${board.everyone} 部`} muted={country.length > 0} onTap={() => { this.boxCountry = []; }} />
                {countries.map((c) => <Chip label={c.id} sub={`${c.count} 部`} muted={country.indexOf(c.id) < 0} onTap={() => { this.boxCountry = country.indexOf(c.id) < 0 ? [...country, c.id] : country.filter((z) => z !== c.id); }} />)}
              </Chips>
            ) : null}
          </Section>
        ) : null}
        {every.length ? null : <Empty icon="🎞" text="找不到相符的電影" />}
        {rows.length ? <Section title={board.title} hint={board.footer}>{rows.map(item)}</Section> : null}
        {paged && board.entries.length > rows.length ? (
          // 不用按：快滑到底時自動接著載入下一批（一次全部畫出好幾千列會卡住，所以還是分批，只是自動）
          <button class="auto-more" onTap={() => { this.boxLimit += BOX_PAGE * 2; }}>{`載入中…已顯示 ${rows.length}／${board.entries.length} 部`}</button>
        ) : null}
        {board.rest.length ? <Section title={board.restTitle} hint={board.restFooter}>{board.rest.map((e, i) => item(e, rows.length + i))}</Section> : null}
      </Page>
    );
  }

  /** 票房排行上、場次通已經沒有場次的片：海報、評分、預告、觀眾評分與票房 */
  async boxMovieView(x: BoxOfficeItem): Promise<string> {
    const [e, info] = await Promise.all([this.extras(x.name), boxInfo(x).catch(() => null)]);
    const date = x.release.replace(/-/g, "/");
    return (
      <Page title={x.name} subtitle={`票房第 ${x.rank} 名`} onBack={() => this.back()}>
        {this.hero(e, x.name, [boxCountryText(x.country), `${date} 上映`])}
        {/* 個別資訊：跟官方網站列的欄位一樣（國別、發行、出品、上映日期、院數、票數、金額） */}
        <Section title="票房資訊" hint="資料來源：國家電影及視聽文化中心「全國電影票房統計」。">
          {boxInfoRows(x, info).map(([label, value]) => <Item kv title={label} right={value} />)}
        </Section>
        <Note text="場次通目前沒有這部片的場次，可能已經下檔，或只在少數戲院放映。" />
      </Page>
    );
  }

  async movieListView(): Promise<string> {
    if (this.movieMode === "fest") return this.festivalListView();
    if (this.movieMode === "box") return this.boxOfficeView();
    const all = await loadMovies();
    const k = this.movieQuery.trim().toLowerCase();
    const list = all.filter((m) => m.comingSoon && (!k || `${m.title} ${m.en}`.toLowerCase().includes(k)));
    prefetchPosters(list); // 背景先抓海報，進電影頁就不用等
    // 每一列的小海報：手機上記過、伺服器查好的立刻有；要上網找的最多等 0.6 秒，其餘每好一批就在原位補畫
    const jobs = list.map((m) => moviePoster(m.title, m.slug, m.en).catch(() => ""));
    const got = await Promise.all(jobs.map((p) => Promise.race([p, sleep(this.rerendering ? 0 : 600).then(() => undefined)])));
    const pending = jobs.filter((_, i) => got[i] === undefined);
    const late: Promise<unknown>[] = [];
    for (let i = 0; i < pending.length; i += 8) late.push(Promise.all(pending.slice(i, i + 8)));
    if (late.length) this.late = late;
    const thumbOf = new Map<TwMovie, { src: string; url?: string; pending?: boolean }>();
    list.forEach((m, i) => {
      const u = got[i];
      if (u === undefined) return void thumbOf.set(m, { src: "", pending: true });
      const src = posterSrc(u);
      if (src && src === u) cachePoster(u);
      thumbOf.set(m, { src, url: u });
    });
    const item = (m: TwMovie) => (
      <Item
        thumb={thumbOf.get(m)}
        title={m.title}
        subtitle={movieLines(m).filter(Boolean).join("\n")}
        onTap={() => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)}
      />
    );
    const groups = soonGroups(list); // 依上映月份分段
    return (
      <Page title="依電影找場次" subtitle={`即將上映 ${list.length} 部`} onBack={() => this.back()}>
        {this.movieModeChips()}
        <Search value={this.movieQuery} placeholder="搜尋片名（中文或英文）" onInput={(t) => { this.movieQuery = t; }} />
        {groups.map((g, i) => <Section title={g.title} hint={i === groups.length - 1 ? "還沒上映、但已經可以查到場次的片，依上映日期排序。" : ""}>{g.items.map(item)}</Section>)}
        {list.length ? null : <Empty icon="🎞" text="找不到相符的電影" />}
      </Page>
    );
  }

  // 日期、縣市、特殊廳都可以複選（點一下選、再點一下取消）；換一部片時日期重來
  movieFor = "";
  movieDates: string[] = []; // 空 = 來源預設的那一天（通常是今天）
  movieCities: string[] = []; // 空 = 全部
  movieFormats: string[] = []; // 空 = 全部
  movieFavOnly = false; // 只看常去影城
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
    return (
      <Page title={m.title} subtitle={[m.rating || d.rating, runtime ? `${runtime} 分鐘` : "", `${d.cinemas.length} 間影城`].filter(Boolean).join("｜")} onBack={() => this.back()}>
        {this.hero(x, m.title, [m.en, [m.rating || d.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"), releaseLabel(d.release || m.release || releaseOf(m.title)), `${d.cinemas.length} 間影城有放映`])}
        {about.text || about.credits ? (
          <Section title="劇情簡介" hint="簡介來自場次通。">
            <Para text={about.text || about.credits} dim={about.text ? about.credits : ""} />
          </Section>
        ) : null}
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
            <Chip label={`只看常去影城（${this.settings.favorites.length}）`} muted={!this.movieFavOnly} onTap={() => { this.movieFavOnly = true; }} />
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
        {rows.length ? null : <Empty icon="🎞" text={this.movieFavOnly && !this.settings.favorites.length ? "還沒有常去影城，先到影城頁加入。" : "沒有符合條件的影城，換個日期或條件試試。"} />}
      </Page>
    );
  }

  // ── 分享 ──
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
    const scopes = [{ id: "all", label: `不限（全台 ${this.cinemas.length} 間）` }, { id: "fav", label: `常去影城（${this.settings.favorites.length}）` }, { id: "near", label: "附近 10 間" }, ...cities.map((c) => ({ id: c, label: c }))];
    // 點一下加入、再點一下拿掉；min1 = 至少留一個
    const toggle = (list: string[], id: string, min1 = false) => {
      const i = list.indexOf(id);
      if (i < 0) return [...list, id];
      return min1 && list.length === 1 ? list : list.filter((x) => x !== id);
    };
    return (
      <Page title="現在有什麼可以看" subtitle="每一項都可以複選" onBack={() => this.back()}>
        <Section title="日期">
          <Chips>
            {dates.map((d) => (
              <Chip label={dateLabel(d).replace(/（.）.*$/, "")} sub={d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).match(/（(.)）/)?.[1] || ""} muted={selDates.indexOf(d) < 0} onTap={() => { this.nowDates = toggle(selDates, d, true); }} />
            ))}
          </Chips>
        </Section>
        <Section title="開演時段" hint="都不選就是整天。「接下來 3 小時」只找今天。">
          <Chips>
            {wins.map((w) => <Chip label={w.label} muted={selWins.indexOf(w.id) < 0} onTap={() => { this.nowWins = w.id === "all" ? ["all"] : toggle(selWins.filter((x) => x !== "all"), w.id); }} />)}
          </Chips>
        </Section>
        <Section title="找哪些影城" hint="縣市的影城較多、選的天數越多，會花比較久時間；「不限」要讀全台每一間，最久。開眼來源的戲院通常只有今天的場次。">
          <Chips>
            {scopes.map((sc) => <Chip label={sc.label} muted={this.nowScopes.indexOf(sc.id) < 0} onTap={() => { this.nowScopes = sc.id === "all" ? ["all"] : toggle(this.nowScopes.filter((x) => x !== "all"), sc.id, true); }} />)}
          </Chips>
        </Section>
        <Section title="特殊廳" hint="都不選就是不限；選了幾種，就找其中任一種。">
          <Chips>
            <Chip label="不限" muted={this.nowFormats.length > 0} onTap={() => { this.nowFormats = []; }} />
            {FORMATS.map((f) => <Chip label={f} muted={this.nowFormats.indexOf(f) < 0} onTap={() => { this.nowFormats = toggle(this.nowFormats, f); }} />)}
          </Chips>
        </Section>
        <Button label="🔍 找場次" onTap={() => this.go(() => this.nowResultsView(selDates, selWins), "正在查詢各影城的場次…")} />
      </Page>
    );
  }

  favOpen = false; // 首頁的常去影城清單有沒有展開（預設收合）
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
    if (!scope.length) throw new Error("沒有可以查的影城。先在影城頁加入常去影城，或改選附近／縣市。");
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
    const scopeLabel = this.nowScopes.map((sc) => (sc === "all" ? "全台影城" : sc === "fav" ? "常去影城" : sc === "near" ? "附近 10 間" : sc)).join("、");
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
