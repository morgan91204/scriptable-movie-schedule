// 🎬 電影行程：選影城 → 日期 → 電影 → 場次 → 加入 iOS 行事曆
// 執行環境：Scriptable（iOS）。原始碼用 TSX 撰寫，編譯後的 .js 放進 Scriptable 執行。
// 畫面：WebView（HTML/CSS），事件迴圈在 run()。資料層在 core.ts，網頁解析在 parsers.ts。

import { h, Fragment, Page, Section, Item, Chips, Chip, Button, Note, Loading, Empty, Hero } from "./jsx";
import type { RatingBadge } from "./jsx";
import { UI } from "./ui";
import { setPlatform } from "./platform";
import { scriptablePlatform } from "./platform-scriptable";
import {
  Cinema, Settings, Movie, Version, EXTRA, CITY_ORDER, AD_STEPS,
  todayTPE, nowHM, addDays, isLate, dateLabel, tpeDate, fmt, byShowtime,
  loadSettings, saveSettings, loadCinemas, datesOf, moviesOf, loadMovies, movieDay, TW,
  FORMATS, formatsOf, filterVersions, nearest, kmLabel, WINDOWS, findShowtimes, groupByMovie, shareText,
  hallOf, tmdbTest, movieExtras, moviePoster, posterSrc, cachePoster, prefetchPosters, mapsUrl, MAPS_LABEL, TMDB_LINKS, extractTmdbKey, cinemaApp, bookingUrl, checkLatest, movieRatings, ratingTier,
} from "./core";
import type { MovieExtras, Ratings } from "./core";
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

type View = () => string | Promise<string>;

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
  back() {
    if (this.stack.length > 1) this.stack.pop();
  }
  home() {
    this.stack = [this.stack[0]];
  }

  // ── 事件迴圈 ──
  // 背景查 GitHub 上的最新版本（首頁顯示是否為最新版）
  latest: Promise<{ latest: string; isLatest: boolean } | null> = checkLatest(APP_VERSION);

  async run() {
    this.settings = await loadSettings();
    this.go(() => this.homeView(), "讀取影城清單…");
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
      const job = Promise.resolve().then(() => view());
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
      // 海報、評分等慢慢讀的資料：讀好後在原位重畫一次（使用者還沒點別的才畫）
      const late = this.late;
      this.late = null;
      let clicked = false;
      if (late)
        late.then(async () => {
          if (clicked || this.ui.closed || this.stack[this.stack.length - 1] !== view) return;
          this.late = null;
          const again = await Promise.resolve(view()).catch(() => "");
          this.late = null;
          if (again && !clicked && this.stack[this.stack.length - 1] === view) await this.ui.render(again, -1);
        });
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
          <Item icon="🕘" title="現在有什麼可以看" subtitle="選時段，一次列出常去、附近或某縣市的所有場次" onTap={() => this.go(() => this.nowView())} />
          <Item icon="🎞️" title="依電影找場次" subtitle="先選電影，再看哪些影城有放映" onTap={() => this.go(() => this.movieListView(), "讀取電影清單…")} />
          <Item icon="🧭" title="附近的影城" subtitle="依目前位置排序" onTap={() => this.go(() => this.nearbyView(), "取得目前位置…")} />
          <Item icon="🎦" title="依縣市找影院" subtitle={`全台 ${this.cinemas.length} 間，也可以搜尋影城`} onTap={() => this.go(() => this.citiesView())} />
        </Section>
        {favs.length ? (
          <Section title="常去影城">
            {favs.map((c) => (
              <Item icon="★" title={c.name} subtitle={`${c.city} ${c.district}`} onTap={() => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)} />
            ))}
          </Section>
        ) : null}
        <Section title="設定">
          <Item icon="📅" title="寫入的行事曆" subtitle={this.calendarName} onTap={() => this.go(() => this.calendarView())} />
          <Item icon="📺" title="廣告預告" subtitle={`預計散場時間會加上 ${this.settings.ads} 分鐘`} right="點一下切換" chevron={false} onTap={() => this.cycleAds()} />
          <Item icon="🗺" title="導航地圖" subtitle="點地址、分享、行程備註的導航連結" right={MAPS_LABEL[this.settings.maps || "apple"]} chevron={false} onTap={() => {
            this.settings.maps = this.settings.maps === "google" ? "apple" : "google";
            saveSettings(this.settings);
          }} />
          <Item icon="⏱" title="補片長（TMDB）" subtitle={this.settings.tmdbToken ? "已設定：沒有片長的電影會自動補上" : "未設定"} onTap={() => this.go(() => this.tmdbView())} />
        </Section>
        <Note text="場次資料來自場次通 twshowtimes.com、開眼電影網，以及誠品、光點、樂聲官網，實際場次以影城公告為準。" />
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
        <input class="field" name="q" value={this.query} placeholder="例如：松仁、西門、in89、台南" autofocus />
        <Button label="搜尋" enter onTap={(v) => { this.query = v.q || ""; }} />
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
            const left = isToday ? all.filter((t) => t > now || isLate(t)).length : all.length;
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

  /** 讀好後要在原位重畫的資料（海報、評分） */
  late: Promise<unknown> | null = null;

  /** 海報、預告與評分：先等 1.5 秒，還沒好就先畫頁面，讀好後自動補上。海報網址另外快查（不等預告），有圖片快取就立刻顯示 */
  async extras(title: string, slug?: string, en?: string): Promise<{ x: MovieExtras | null; r: Ratings | null; p: string; px: Promise<MovieExtras | null>; loading: boolean }> {
    const px = movieExtras(title, slug).catch(() => null);
    const pr = movieRatings(title, en).catch(() => null);
    const pp = moviePoster(title, slug).catch(() => "");
    const quick = <T,>(p: Promise<T>) => Promise.race([p, sleep(1500).then(() => undefined)]);
    const [x, r, p] = await Promise.all([quick(px), quick(pr), quick(pp)]);
    const loading = x === undefined || r === undefined || p === undefined;
    if (loading) this.late = Promise.all([px, pr, pp]);
    return { x: x ?? null, r: r ?? null, p: p || "", px, loading };
  }

  hero(e: { x: MovieExtras | null; r: Ratings | null; p: string; px: Promise<MovieExtras | null>; loading: boolean }, title: string, lines: string[]): string {
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
        poster={poster}
        posterPending={!poster && e.loading}
        lines={lines}
        badges={badges}
        // 還在讀的時候先顯示「觀看預告」，點下去會等讀好再開，不會誤開成搜尋頁
        trailerLabel={!x || x.trailerName ? "觀看預告" : "搜尋預告"}
        onTrailer={async () => Safari.open((x || (await e.px))?.trailer || search)}
      />
    );
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
                const past = isToday && t <= now && !isLate(t);
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
    // 凌晨場（00:00–04:59）在影城片單上屬於前一個營業日，實際日期要 +1 天
    return tpeDate(isLate(p.time) ? addDays(p.date, 1) : p.date, p.time);
  }
  end(p: Pick): Date {
    return new Date(this.start(p).getTime() + ((this.runtime || 120) + this.settings.ads) * 6e4);
  }

  confirmView(p: Pick): string {
    return (
      <Page title="確認行程" subtitle="點選項目可以修改" onBack={() => this.back()}>
        <Section>
          <Item icon="🎬" title={p.movie.title} subtitle={p.version.label} />
          {p.address ? this.addressItem(p.cinema.name, p.address, p.cinema.name) : <Item icon="📍" title={p.cinema.name} />}
          <Item icon="🕒" title={fmt(this.start(p))} subtitle={`預計 ${fmt(this.end(p)).slice(-5)} 散場`} />
        </Section>
        {isLate(p.time) ? <Note kind="warn" text="凌晨場：已自動算到隔天日期，請再核對電影票。" /> : null}
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

  /** 版本狀態：已是最新版／有新版（捷徑每次執行都會下載最新版，重新執行就會更新） */
  async versionNote(): Promise<string> {
    const r = await Promise.race([this.latest, sleep(1500).then(() => undefined)]);
    if (r === undefined) return "";
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
      <Page title="已加入行事曆" subtitle={cal.title}>
        <Empty icon="✅" text={`${p.movie.title}\n${fmt(ev.startDate)} → ${fmt(ev.endDate).slice(-5)}\n${p.cinema.name}${this.seat ? "｜" + this.seat : ""}`} />
        <Section hint="Scriptable 無法直接設定提醒，打開行程後可在「提示」加上開演前 30 分鐘。">
          <Item icon="🔔" title="打開行程，加提醒" accent onTap={async () => { await ev.presentEdit(); }} />
          <Item icon="📤" title="分享這場給朋友" accent onTap={() => this.share(p)} />
        </Section>
        {this.bookingButtons(p)}
        <Button label="再新增一部" onTap={() => this.home()} />
      </Page>
    );
  }

  // ── 依電影找 ──
  movieQuery = "";
  async movieListView(): Promise<string> {
    const all = await loadMovies();
    const k = this.movieQuery.trim().toLowerCase();
    const list = all.filter((m) => !k || `${m.title} ${m.en}`.toLowerCase().includes(k));
    prefetchPosters(list); // 背景先抓海報，進電影頁就不用等
    const item = (m: TwMovie) => (
      <Item
        title={m.title}
        subtitle={[m.rating, m.runtime ? `${m.runtime} 分` : "", m.en].filter(Boolean).join("｜")}
        badge={m.cinemaCount ? `${m.cinemaCount} 間` : undefined}
        onTap={() => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)}
      />
    );
    const now = list.filter((m) => !m.comingSoon);
    const soon = list.filter((m) => m.comingSoon);
    return (
      <Page title="依電影找場次" subtitle={`${all.length} 部電影`} onBack={() => this.back()}>
        <input class="field" name="q" value={this.movieQuery} placeholder="搜尋片名" />
        <Button label="搜尋" kind="secondary" enter onTap={(v) => { this.movieQuery = v.q || ""; }} />
        {now.length ? <Section title={`上映中（${now.length}）`} hint="依今天放映的影城數排序，資料來自場次通。">{now.map(item)}</Section> : null}
        {soon.length ? <Section title={`即將上映（${soon.length}）`}>{soon.map(item)}</Section> : null}
        {list.length ? null : <Empty icon="🎞" text="找不到相符的電影" />}
      </Page>
    );
  }

  movieCity = "全部";
  movieFormat = "";
  async movieView(m: TwMovie, date: string): Promise<string> {
    const d = await movieDay(m.slug, date || undefined);
    const dates = d.dates.filter((x) => x >= todayTPE());
    const runtime = d.runtime || m.runtime;
    const cities = Array.from(new Set(d.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const city = cities.indexOf(this.movieCity) >= 0 ? this.movieCity : "全部";
    const formats = FORMATS.filter((f) => d.cinemas.some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0)));
    const fmtSel: Format | "" = formats.indexOf(this.movieFormat as Format) >= 0 ? (this.movieFormat as Format) : "";
    const shown = d.cinemas
      .map((c) => ({ ...c, versions: filterVersions(c.versions, fmtSel) }))
      .filter((c) => (city === "全部" || c.city === city) && c.versions.length);
    const toCinema = (c: TwMovieCinema): Cinema =>
      this.cinemas.find((x) => x.id === c.id) ||
      { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address };
    const replace = (nd: string) => {
      this.stack[this.stack.length - 1] = () => this.movieView(m, nd);
    };
    const x = await this.extras(m.title, m.slug, m.en);
    return (
      <Page title={m.title} subtitle={[m.rating || d.rating, runtime ? `${runtime} 分鐘` : "", `${d.cinemas.length} 間影城`].filter(Boolean).join("｜")} onBack={() => this.back()}>
        {this.hero(x, m.title, [m.en, [m.rating || d.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"), `${d.cinemas.length} 間影城有放映`])}
        <Section title="日期">
          <Chips>
            {(dates.length ? dates : [d.date]).map((x) => (
              <Chip label={dateLabel(x).replace(/（.）.*$/, "")} sub={x === d.date ? "目前" : dateLabel(x).match(/（(.)）/)?.[1] || ""} muted={x !== d.date} onTap={() => replace(x)} />
            ))}
          </Chips>
        </Section>
        <Section title="縣市">
          <Chips>
            {["全部", ...cities].map((c) => (
              <Chip label={c} muted={c !== city} onTap={() => { this.movieCity = c; }} />
            ))}
          </Chips>
        </Section>
        {formats.length ? (
          <Section title="特殊廳">
            <Chips>
              {["", ...formats].map((f) => (
                <Chip label={f || "全部"} muted={f !== fmtSel} onTap={() => { this.movieFormat = f; }} />
              ))}
            </Chips>
          </Section>
        ) : null}
        {cities.filter((ct) => shown.some((c) => c.city === ct)).map((ct) => (
          <Section title={`${ct}（${shown.filter((c) => c.city === ct).length} 間）`}>
            {shown.filter((c) => c.city === ct).map((c) => {
              const movie: Movie = { title: d.title || m.title, runtime, rating: d.rating || m.rating, versions: c.versions, runtimeFrom: d.runtime ? d.runtimeFrom : m.runtimeFrom };
              const summary = c.versions.map((v) => `${v.label} ${[...v.times].sort(byShowtime).join(" ")}`).join("／");
              return (
                <Item
                  icon={this.settings.favorites.indexOf(c.id) >= 0 ? "★" : undefined}
                  title={c.name}
                  subtitle={summary}
                  onTap={() => this.go(() => this.timesView(toCinema(c), d.date, movie, { booking: "", sourceUrl: `${TW}/cinemas/${c.id}/${d.date}/`, address: c.address }))}
                />
              );
            })}
          </Section>
        ))}
        {shown.length ? null : <Empty icon="🎞" text="這天沒有影城放映" />}
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
      throw new Error("拿不到目前位置。請到「設定 → 隱私權與安全性 → 定位服務 → Scriptable」允許使用位置。");
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
  nowDate = "";
  nowWin = "soon";
  nowScope = "fav"; // fav / near / 縣市名稱
  nowFormat = "";
  nowView(): string {
    const today = todayTPE();
    const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(today, i));
    const date = this.nowDate || today;
    const wins = WINDOWS.filter((w) => !w.todayOnly || date === today);
    const win = wins.find((w) => w.id === this.nowWin) || wins[0];
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const scopes = [{ id: "fav", label: `常去影城（${this.settings.favorites.length}）` }, { id: "near", label: "附近 10 間" }, ...cities.map((c) => ({ id: c, label: c }))];
    return (
      <Page title="現在有什麼可以看" onBack={() => this.back()}>
        <Section title="日期">
          <Chips>
            {dates.map((d) => (
              <Chip label={dateLabel(d).replace(/（.）.*$/, "")} sub={d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).match(/（(.)）/)?.[1] || ""} muted={d !== date} onTap={() => { this.nowDate = d; }} />
            ))}
          </Chips>
        </Section>
        <Section title="開演時段">
          <Chips>
            {wins.map((w) => <Chip label={w.label} muted={w.id !== win.id} onTap={() => { this.nowWin = w.id; }} />)}
          </Chips>
        </Section>
        <Section title="找哪些影城" hint="縣市的影城較多，會花比較久時間。開眼來源的戲院通常只有今天的場次。">
          <Chips>
            {scopes.map((sc) => <Chip label={sc.label} muted={sc.id !== this.nowScope} onTap={() => { this.nowScope = sc.id; }} />)}
          </Chips>
        </Section>
        <Section title="特殊廳">
          <Chips>
            {["", ...FORMATS].map((f) => <Chip label={f || "不限"} muted={f !== this.nowFormat} onTap={() => { this.nowFormat = f; }} />)}
          </Chips>
        </Section>
        <Button label="🔍 找場次" onTap={() => this.go(() => this.nowResultsView(date, win.id), "正在查詢各影城的場次…")} />
      </Page>
    );
  }

  async nowResultsView(date: string, winId: string): Promise<string> {
    const win = WINDOWS.find((w) => w.id === winId) || WINDOWS[0];
    let scope: { cinema: Cinema; km: number | null }[];
    if (this.nowScope === "near") scope = nearest(this.cinemas, await this.locate(), 10);
    else if (this.nowScope === "fav") scope = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean).map((c) => ({ cinema: c as Cinema, km: null }));
    else scope = this.cinemas.filter((c) => c.city === this.nowScope).map((c) => ({ cinema: c, km: null }));
    if (!scope.length) throw new Error("沒有可以查的影城。先在影城頁加入常去影城，或改選附近／縣市。");
    const { hits, failed } = await findShowtimes(scope, date, win, this.nowFormat as Format | "");
    const groups = groupByMovie(hits);
    prefetchPosters(groups); // 背景先抓海報，進電影頁就不用等
    const scopeLabel = this.nowScope === "fav" ? "常去影城" : this.nowScope === "near" ? "附近 10 間" : this.nowScope;
    const open = (hit: Hit) => {
      this.runtime = hit.movie.runtime;
      this.seat = hallOf(hit.version.label);
      this.go(() => this.confirmView({ cinema: hit.cinema, address: hit.ctx.address || hit.cinema.address || "", booking: hit.ctx.booking, sourceUrl: hit.ctx.sourceUrl, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time }));
    };
    return (
      <Page title={`${dateLabel(date).replace(/ .*$/, "")} ${win.label}`} subtitle={`${scopeLabel}｜${hits.length} 場、${groups.length} 部電影`} onBack={() => this.back()}>
        {groups.length ? null : <Empty icon="🍿" text="這個時段沒有符合的場次，換個時段或範圍試試。" />}
        {groups.map((g) => (
          <Section title={`${g.title}（${g.hits.length} 場）`} hint={[g.runtime ? `${g.runtime} 分鐘` : "", g.rating].filter(Boolean).join("｜") || undefined}>
            {g.hits.map((hit) => (
              <Item
                title={`${hit.time}${isLate(hit.time) ? "（凌晨）" : ""}　${hit.cinema.name}`}
                subtitle={[hit.version.label, kmLabel(hit.km)].filter(Boolean).join("｜")}
                onTap={() => open(hit)}
              />
            ))}
          </Section>
        ))}
        {failed.length ? <Note kind="warn" text={`有 ${failed.length} 間讀取失敗：${failed.join("、")}`} /> : null}
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

setPlatform(scriptablePlatform);
await new App().run();
Script.complete();
