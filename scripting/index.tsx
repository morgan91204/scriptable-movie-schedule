// 🎬 電影行程（Scripting 原生介面版）
// 選影城 → 日期 → 電影 → 場次，或選電影 → 日期 → 影城 → 場次，一鍵加入 iOS 行事曆並設定提醒。
// 資料層（core.ts、parsers.ts…）與 Scriptable 版共用，原始碼：
// https://github.com/morgan91204/scriptable-movie-schedule

import {
  Button, ContentUnavailableView, Form, Group, HStack, Image, Label, LabeledContent, List, Navigation, NavigationLink,
  NavigationStack, Picker, ProgressView, Script, Section, Spacer, Tab, TabView, Text, TextField, Toggle, VStack,
  useEffect, useMemo, useObservable, useState,
} from "scripting"
import { setPlatform } from "./platform"
import { scriptingPlatform, posterImageNow, loadPosterImage, posterError } from "./platform-scripting"
import {
  Cinema, Movie, Settings, Version, TwMovie, TwMovieCinema, CITY_ORDER, TW,
  todayTPE, nowHM, addDays, isLate, dateLabel, tpeDate, fmt, byShowtime,
  loadSettings, saveSettings, loadCinemas, datesOf, moviesOf, loadMovies, movieDay, cinemaAddress,
  FORMATS, formatsOf, filterVersions, filterVersionsAny, movieRows, movieDays, nearest, kmLabel, WINDOWS, findShowtimes, findShowtimesMulti, multiLabel, multiDetail, groupByMovie, fillMovieDay, movieDayFilled, movieCinemaVersions, showDay, lateIsTonight, shareText, hallOf, tmdbTest, movieExtras, moviePoster, posterReady, posterTint, POSTER_TINTS, normImageUrl, movieRuntime, posterSrc, isLocalSrc, cachePoster, prefetchPosters, movieLines, releaseLabel, releaseOf, boxOfficeLines, boxOfficeNote, boxOfficeBy, boxOfficeTitle, boxOfficeFooter, boxCountries, boxByCountry, boxInfo, boxInfoRows, boxCountryText, BOX_COUNTRY_NOTE, boxCountryTag, boxCountriesPicked, movieBoard, loadBoxFor, loadCommunitySummary, loadUpcoming, soonBoard, soonGroups, boxSorts, boxYears, boxYearsPicked, boxMatcher, posterLight, BOX_PAGE, foregroundTask, communityStats, communityVote, loadBoxOffice, loadBoxOfficeFull, loadBoxOfficeWeeks, boxWeekOptions, boxWeekPicked, money, matchBoxOffice, boxOfficeLabel, mapsUrl, MAPS_LABEL, TMDB_LINKS, extractTmdbKey, cinemaApp, bookingUrl, checkLatest, SCRIPTING_IMPORT_URL, ABOUT_URL, PRIVACY_URL, ADS_NOTE, loadFestivals, festivalDates, festivalDay, festivalLines, festivalFilmSessions, festivalPlace, festivalCinema, festivalDefaultDate, festivalStateLabel, festivalState, festivalFooter, linkMovies, nowGroupLine, nowFilter, festivalPick, movieAbout, festivalSearch, festivalSearchLines, festivalTrailer, festivalYears, festivalGroups, festivalChipNote, festivalStatusLine, movieRatings, ratingTier,
} from "./core"
import type { Format, LatLng, Hit, Community, BoxOfficeItem, BoxSort, BoxOffice, MovieEntry, SoonEntry, UpcomingFilm, Festival, FestivalFilm, FestivalSession } from "./core"

declare const Safari: any
declare const Dialog: any
declare const Calendar: any
declare const CalendarEvent: any
declare const EventAlarm: any
declare const ShareSheet: any
declare const Location: any
declare const Pasteboard: any
declare const HapticFeedback: any
declare function setTimeout(fn: () => void, ms: number): any
declare function clearTimeout(t: any): void
declare const Storage: any

setPlatform(scriptingPlatform)

/** 版本號來自 script.json（建置時寫入），Scripting 自動更新後會跟著變 */
function appVersion(): string {
  try {
    return (Script as any).metadata?.version || "未知"
  } catch (_) {
    return "未知"
  }
}

// ───────────────────────── 共用狀態 ─────────────────────────

const ADS = [0, 10, 15, 20]
const ALARMS: { label: string; minutes: number }[] = [
  { label: "不提醒", minutes: -1 },
  { label: "開演時", minutes: 0 },
  { label: "15 分鐘前", minutes: 15 },
  { label: "30 分鐘前", minutes: 30 },
  { label: "1 小時前", minutes: 60 },
  { label: "2 小時前", minutes: 120 },
]

type AppSettings = Settings & { alarm?: number }

const store = {
  settings: { favorites: [], ads: 10, alarm: 30 } as AppSettings,
  cinemas: [] as Cinema[],
  listeners: new Set<() => void>(),
}

function useSettings(): [AppSettings, (patch: Partial<AppSettings>) => void] {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((x: number) => x + 1)
    store.listeners.add(l)
    return () => {
      store.listeners.delete(l)
    }
  }, [])
  const update = (patch: Partial<AppSettings>) => {
    store.settings = { ...store.settings, ...patch }
    saveSettings(store.settings)
    store.listeners.forEach((f) => f())
  }
  return [store.settings, update]
}

/** 非同步載入資料；deps 改變時重新載入 */
function useLoad<T>(fn: () => Promise<T>, deps: any[]): { data: T | null; error: string | null; reload: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const run = async () => {
    setError(null)
    try {
      setData(await foregroundTask(fn())) // 使用者在等：背景預抓暫停
    } catch (e) {
      setError(String((e as Error)?.message || e))
    }
  }
  useEffect(() => {
    setData(null)
    run()
  }, deps)
  return { data, error, reload: run }
}

function Loading({ text }: { text?: string }) {
  return <HStack>
    <ProgressView />
    <Text foregroundStyle={"secondaryLabel"}>{text || "讀取中…"}</Text>
  </HStack>
}

function ErrorRow({ error, retry }: { error: string; retry: () => void }) {
  return <Section footer={<Text>{error}</Text>}>
    <Label title={"讀取失敗"} systemImage={"exclamationmark.triangle"} foregroundStyle={"systemOrange"} />
    <Button title={"重試"} systemImage={"arrow.clockwise"} action={retry} />
  </Section>
}

function Row({ title, subtitle, trailing, muted }: { title: string; subtitle?: string; trailing?: string; muted?: boolean }) {
  return <HStack>
    <VStack alignment={"leading"} spacing={2}>
      <Text font={"body"} foregroundStyle={muted ? "secondaryLabel" : "label"}>{title}</Text>
      {subtitle ? <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={2}>{subtitle}</Text> : null}
    </VStack>
    <Spacer />
    {trailing ? <Text font={"subheadline"} foregroundStyle={"secondaryLabel"}>{trailing}</Text> : null}
  </HStack>
}

function sortCities(cities: string[]): string[] {
  return cities.sort((a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99))
}

// ───────────────────────── 根畫面：底部分頁 ─────────────────────────
// iOS 26 的分頁列是 Liquid Glass 浮動膠囊，往下捲會自動縮小（tabBarMinimizeBehavior）；每個分頁各自一個 NavigationStack

type CinemasLoad = ReturnType<typeof useLoad<Cinema[]>>

function RootTabs() {
  const selection = useObservable<string>("home")
  const [, update] = useSettings()
  const cinemas = useLoad(async () => {
    store.cinemas = await loadCinemas()
    return store.cinemas
  }, [])
  useEffect(() => {
    ;(async () => {
      if (!store.settings.calendar) {
        const def = await Calendar.defaultForEvents()
        if (def) update({ calendar: def.title })
      }
    })()
  }, [])
  return <TabView selection={selection} tabBarMinimizeBehavior={"onScrollDown"}>
    <Tab title={"首頁"} systemImage={"house.fill"} value={"home"}>
      <Home cinemas={cinemas} />
    </Tab>
    <Tab title={"電影"} systemImage={"film"} value={"movies"}>
      <NavigationStack><MoviesPage /></NavigationStack>
    </Tab>
    <Tab title={"影城"} systemImage={"building.2.fill"} value={"cinemas"}>
      <NavigationStack><CitiesPage cinemas={cinemas} /></NavigationStack>
    </Tab>
    <Tab title={"設定"} systemImage={"gearshape.fill"} value={"settings"}>
      <NavigationStack><SettingsPage /></NavigationStack>
    </Tab>
  </TabView>
}

// ───────────────────────── 設定 ─────────────────────────

function SettingsPage() {
  const [settings, update] = useSettings()
  const [calendars, setCalendars] = useState<string[]>([])
  useEffect(() => {
    ;(async () => {
      setCalendars((await Calendar.forEvents()).filter((c: any) => c.allowsContentModifications).map((c: any) => c.title))
    })()
  }, [])
  return <List navigationTitle={"設定"}>
    <Section header={<Text>加入行事曆時</Text>} footer={<Text>{`廣告預告：${ADS_NOTE}`}</Text>}>
      <Picker title={"寫入的行事曆"} value={settings.calendar || ""} onChanged={(v: string) => update({ calendar: v })}>
        {calendars.map((t) => <Text key={t} tag={t}>{t}</Text>)}
      </Picker>
      <Picker title={"預留廣告預告"} value={settings.ads} onChanged={(v: number) => update({ ads: v })}>
        {ADS.map((m) => <Text key={m} tag={m}>{m ? `${m} 分鐘` : "不預留"}</Text>)}
      </Picker>
      <Picker title={"提醒"} value={settings.alarm ?? 30} onChanged={(v: number) => update({ alarm: v })}>
        {ALARMS.map((a) => <Text key={a.minutes} tag={a.minutes}>{a.label}</Text>)}
      </Picker>
      <Picker title={"導航地圖"} value={settings.maps || "apple"} onChanged={(v: string) => update({ maps: v as any })}>
        {(["apple", "google"] as const).map((k) => <Text key={k} tag={k}>{MAPS_LABEL[k]}</Text>)}
      </Picker>
    </Section>
    <Section footer={<Text>場次通的重映、修復版、演唱會有時沒有片長或海報，填了金鑰會自動用片名到 TMDB 補。</Text>}>
      <NavigationLink destination={<TmdbPage />}>
        <Row title={"補片長（TMDB）"} trailing={settings.tmdbToken ? "已設定" : "未設定"} />
      </NavigationLink>
    </Section>
    <Section header={<Text>關於</Text>} footer={<Text>連鎖影城的場次來自場次通（twshowtimes.com），感謝場次通的整理；其他來自開眼電影網，以及誠品、光點、樂聲官網。實際場次以影城公告為準。</Text>}>
      <Button title={"關於與資料來源"} systemImage={"info.circle"} action={() => Safari.openURL(ABOUT_URL)} />
      <Button title={"隱私權政策"} systemImage={"hand.raised"} action={() => Safari.openURL(PRIVACY_URL)} />
      <Button title={"前往場次通"} systemImage={"heart"} action={() => Safari.openURL("https://twshowtimes.com/")} />
    </Section>
    <Section>
      <VersionRow />
    </Section>
  </List>
}

// ───────────────────────── 首頁 ─────────────────────────

function Home({ cinemas }: { cinemas: CinemasLoad }) {
  const dismiss = Navigation.useDismiss()
  useUpdatePrompt()
  const [settings] = useSettings()
  const list = cinemas.data || []
  const favs = settings.favorites.map((id) => list.find((c) => c.id === id)).filter(Boolean) as Cinema[]
  const [favOpen, setFavOpen] = useState(false) // 常去影城清單有沒有展開（預設收合）

  return <NavigationStack>
    <List
      navigationTitle={"電影行程"}
      toolbar={{ cancellationAction: <Button title={"關閉"} action={dismiss} /> }}
    >
      {cinemas.error ? <ErrorRow error={cinemas.error} retry={cinemas.reload} /> : null}

      {<>
        <Section>
          <NavigationLink destination={<NowPage />}>
            <Text>{"🕘  現在有什麼可以看"}</Text>
          </NavigationLink>
          <NavigationLink destination={<MoviesPage />}>
            <Text>{"🎞️  依電影找場次"}</Text>
          </NavigationLink>
          <NavigationLink destination={<NearbyPage />}>
            <Text>{"🧭  附近的影城"}</Text>
          </NavigationLink>
          <NavigationLink destination={<CitiesPage />}>
            <Row title={"🎦  依縣市找影院"} trailing={cinemas.data ? `${list.length} 間` : ""} />
          </NavigationLink>
        </Section>

        {!cinemas.data && !cinemas.error ? <Section><Loading text={"讀取影城清單…"} /></Section> : null}

        {favs.length ? <Section footer={<Text>在影城頁可以加入或移除常去影城。影城搜尋在「影城」分頁，行事曆與提醒在「設定」分頁。</Text>}>
          {/* 預設收合，只留這一列；點一下展開清單 */}
          <Button action={() => setFavOpen(!favOpen)}>
            <HStack spacing={8}>
              <Image systemName={"star.fill"} foregroundStyle={"systemYellow"} />
              <Text font={"headline"} foregroundStyle={"label"}>{`常去影城（${favs.length} 間）`}</Text>
              <Spacer />
              <Image systemName={favOpen ? "chevron.down.circle" : "chevron.right.circle"} font={"title3"} foregroundStyle={"secondaryLabel"} />
            </HStack>
          </Button>
          {(favOpen ? favs : []).map((c) => <CinemaLink key={c.id} cinema={c} showCity />)}
        </Section> : null}
      </>}
    </List>
  </NavigationStack>
}

/** 以 App 訂票：先試已知的 App 網址（有裝就直接開），都不行才開 App Store 頁 */
async function openCinemaApp(c: Cinema) {
  const app = cinemaApp(c)
  if (!app) return
  for (const scheme of app.schemes) {
    try {
      if (await Safari.openURL(scheme + "://")) return
    } catch (_) {}
  }
  await Safari.openURL(app.url)
}

/** 地址列：點一下用設定的地圖導航，長按跳出「複製地址」 */
function AddressRow({ name, address, title }: { name: string; address: string; title?: string }) {
  const [settings] = useSettings()
  const copy = async () => {
    await Pasteboard.setString(address)
    try { HapticFeedback.notificationSuccess() } catch (_) {}
  }
  return <Button
    action={() => Safari.openURL(mapsUrl(name, address, settings.maps))}
    contextMenu={{
      menuItems: <Group>
        <Button title={"複製地址"} systemImage={"doc.on.doc"} action={copy} />
        <Button title={`用${MAPS_LABEL[settings.maps || "apple"]}導航`} systemImage={"location.fill"} action={() => Safari.openURL(mapsUrl(name, address, settings.maps))} />
      </Group>,
    }}
  >
    <HStack>
      <Image systemName={"mappin.and.ellipse"} foregroundStyle={"systemBlue"} />
      <VStack alignment={"leading"} spacing={2}>
        {title ? <Text foregroundStyle={"label"}>{title}</Text> : null}
        <Text foregroundStyle={title ? "secondaryLabel" : "label"}>{address}</Text>
      </VStack>
      <Spacer />
      <Image systemName={"arrow.triangle.turn.up.right.circle"} foregroundStyle={"systemBlue"} />
    </HStack>
  </Button>
}

/** 評分徽章：IMDb／番茄指數／爆米花指數，顏色依分數（綠 ≥75、黃 60–74、紅 <60）；none = 沒有這項評分（顯示「-」、灰色、不可點） */
// 注意：Scripting 的顏色只接受 #RRGGBB、#RGB、rgba() 與系統色名稱，8 碼 hex 會讓畫面出錯
const TIER = {
  good: { fg: "systemGreen", bg: "rgba(48, 209, 88, 0.18)" },
  mid: { fg: "systemOrange", bg: "rgba(255, 159, 10, 0.2)" },
  bad: { fg: "systemRed", bg: "rgba(255, 69, 58, 0.18)" },
  none: { fg: "secondaryLabel", bg: "rgba(120, 120, 128, 0.16)" },
}
type Tier = keyof typeof TIER
function RatingBadge({ kind, value, tier, note, url }: { kind: "imdb" | "tomato" | "popcorn"; value: string; tier: Tier; note?: string; url?: string }) {
  const c = TIER[tier]
  const icon = kind === "tomato" ? (tier === "bad" ? "🤢" : "🍅") : kind === "popcorn" ? (tier === "bad" ? "🫗" : "🍿") : ""
  // 徽章內的字都用 fixedSize + lineLimit 1：SwiftUI 不會把「IMDb」壓成兩行或把分數截斷；
  // 字體用 caption2、留白縮到最小，三個徽章在 iPhone mini／SE 的寬度也放得下一排
  return <Button action={() => (url ? Safari.openURL(url) : undefined)} buttonStyle={"plain"} disabled={!url}>
    <HStack spacing={2} padding={{ horizontal: 4, vertical: 2 }} background={c.bg} clipShape={{ type: "rect", cornerRadius: 6 }} fixedSize>
      {kind === "imdb"
        ? <Text font={"caption2"} fontWeight={"heavy"} foregroundStyle={"black"} lineLimit={1} fixedSize padding={{ horizontal: 2, vertical: 0 }} background={tier === "none" ? "#C7C7CC" : "#F5C518"} clipShape={{ type: "rect", cornerRadius: 3 }}>IMDb</Text>
        : <Text font={"caption2"} lineLimit={1} fixedSize>{icon}</Text>}
      <Text font={"caption2"} fontWeight={"bold"} foregroundStyle={c.fg} lineLimit={1} fixedSize>{value + (note ? "✓" : "")}</Text>
    </HStack>
  </Button>
}

/** 觀眾評分（大家一起統計）：平均、人數，以及「你的評分」五顆星；點已選的那顆可以取消 */
function CommunitySection({ title }: { title: string }) {
  const load = useLoad(() => communityStats(title), [title])
  const [voted, setVoted] = useState<Community | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const c = voted || load.data
  const n = c ? c.n : 0
  const avg = c && n ? c.avg : 0
  const mine = c ? c.mine : 0
  const vote = async (s: number) => {
    if (busy) return
    setBusy(true)
    setMsg("")
    try {
      setVoted(await communityVote(title, s === mine ? 0 : s))
      try { HapticFeedback.selection() } catch (_) {}
    } catch (e) {
      setMsg(String((e as Error)?.message || e))
    }
    setBusy(false)
  }
  // 平均是 10 分制，五顆星各代表 2 分
  const starIcon = (i: number) => (avg / 2 >= i - 0.25 ? "star.fill" : avg / 2 >= i - 0.75 ? "star.leadinghalf.filled" : "star")
  const status = c ? (n ? `${n} 人評分` : "還沒有人評分，來當第一個") : load.error ? "觀眾評分暫時讀不到" : "讀取中…"
  return <Section header={<Text>觀眾評分</Text>} footer={<Text>滿分 10 分。匿名評分，一台手機一票，可以隨時更改；再點一次已選的分數可以取消。各版本的評分會一起統計。</Text>}>
    <HStack spacing={14}>
      <HStack alignment={"lastTextBaseline"} spacing={2}>
        <Text font={"largeTitle"} fontWeight={"bold"} monospacedDigit>{n ? avg.toFixed(1) : "-"}</Text>
        <Text font={"footnote"} foregroundStyle={"secondaryLabel"}>／10</Text>
      </HStack>
      <VStack alignment={"leading"} spacing={4}>
        <HStack spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => <Image key={i} systemName={starIcon(i)} foregroundStyle={n ? "systemOrange" : "tertiaryLabel"} font={"subheadline"} />)}
        </HStack>
        <Text font={"caption"} foregroundStyle={"secondaryLabel"}>{status}</Text>
      </VStack>
      <Spacer />
      {load.error && !c ? <Button title={"重試"} action={load.reload} buttonStyle={"plain"} foregroundStyle={"systemBlue"} /> : null}
    </HStack>
    <VStack alignment={"leading"} spacing={8}>
      <Text>{mine ? `你給 ${mine} 分` : "點一個分數評分（滿分 10）"}</Text>
      <HStack spacing={4}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) =>
          <Button key={s} action={() => vote(s)} buttonStyle={"plain"} disabled={busy || !c}>
            <Text font={"subheadline"} fontWeight={"bold"} monospacedDigit frame={{ maxWidth: "infinity", minHeight: 34 }}
              foregroundStyle={s === mine ? "white" : s < mine ? "systemOrange" : "secondaryLabel"}
              background={s === mine ? "systemOrange" : "tertiarySystemFill"} clipShape={{ type: "rect", cornerRadius: 8 }}>{`${s}`}</Text>
          </Button>
        )}
      </HStack>
    </VStack>
    {msg ? <Text font={"caption"} foregroundStyle={"systemRed"}>{msg}</Text> : null}
  </Section>
}

/** 海報圖：快取有的同步拿到（切換頁面回來立刻有圖），沒有的自己下載縮圖。
 *  不用 Image 的 imageUrl：列表重畫時系統會中斷正在下載的圖，被當成失敗後就一直缺圖 */
function usePosterImage(url: string): { img: any; ver: number; failed: boolean; err: string } {
  // 圖跟著網址記：網址中途改了（例如換成另一個來源的海報），不會沿用前一張
  const [st, setSt] = useState<{ url: string; img: any; failed: boolean; ver: number }>(() => ({ url, img: posterImageNow(url), failed: false, ver: 0 }))
  useEffect(() => {
    let alive = true
    const refresh = () => {}
    const now = st.url === url && st.img ? st.img : posterImageNow(url)
    if (now) {
      if (st.url !== url || st.img !== now) setSt((s) => ({ url, img: now, failed: false, ver: s.ver + 1 }))
      refresh()
    } else {
      setSt((s) => ({ url, img: null, failed: false, ver: s.ver + 1 }))
      if (url)
        loadPosterImage(url).then((ui) => {
          if (!alive) return
          setSt((s) => ({ url, img: ui, failed: !ui, ver: s.ver + 1 }))
          if (ui) refresh()
        })
    }
    return () => { alive = false }
  }, [url])
  const mine = st.url === url
  const failed = mine && st.failed
  return { img: mine ? st.img : null, ver: st.ver, failed, err: failed ? posterError(url) : "" }
}

/** 預設海報：哪裡都找不到圖時，用片名畫一張（場記板條紋＋片名，底色依片名固定）。
 *  只用最基本的元件（固定大小的方塊和文字），列表裡才畫得穩 */
function GenPoster({ w, h, r, title }: { w: number; h: number; r: number; title: string }) {
  const big = w > 60
  const n = Array.from(title).length
  const size = big ? (n > 16 ? 12 : n > 7 ? 15 : 19) : (n > 16 ? 7 : n > 7 ? 8 : 9)
  const bar = Math.round(h * 0.15)
  return <VStack spacing={0} frame={{ width: w, height: h }} background={POSTER_TINTS[posterTint(title)][0]} clipShape={{ type: "rect", cornerRadius: r }}>
    <HStack spacing={0} frame={{ width: w, height: bar }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Text key={i} font={4} frame={{ width: w / 8, height: bar }} background={i % 2 ? "#17181C" : "#FFFFFF"}>{" "}</Text>)}
    </HStack>
    <Spacer />
    <Text font={size} fontWeight={"heavy"} foregroundStyle={"#FFFFFF"} multilineTextAlignment={"center"} lineLimit={big ? 4 : 3} minScaleFactor={0.7} padding={{ horizontal: big ? 8 : 3 }}>{title}</Text>
    <Spacer />
  </VStack>
}

/** 海報框：固定大小的灰底框，圖放在裡面。還在讀是轉圈；確定沒有圖就畫預設海報，不會整格消失、文字跳位 */
function PosterBox({ w, h, r, img, ver, pending, title }: { w: number; h: number; r: number; img: any; ver: number; pending: boolean; title: string }) {
  if (!img && !pending) return GenPoster({ w, h, r, title })
  return <VStack frame={{ width: w, height: h }} background={"rgba(120, 120, 128, 0.18)"} clipShape={{ type: "rect", cornerRadius: r }}>
    {img
      ? <Image image={img} resizable scaleToFill frame={{ width: w, height: h }} clipShape={{ type: "rect", cornerRadius: r }} />
      : <ProgressView progressViewStyle={"circular"} />}
  </VStack>
}

/** 列表的小海報統一在這裡查網址、下載（一次 4 張），好了整批重畫一次。
 *  每一格都不帶自己的狀態：列表裡一掛上就更新狀態的元件，Scripting 偶爾會整格漏畫 */
function useThumbs(items: { title: string; slug?: string; en?: string; light?: boolean; release?: string }[], key: string): (m: { title: string; slug?: string }) => { img: any; why: string; pending: boolean } {
  const [, setTick] = useState(0)
  const imgs = useMemo(() => ({} as Record<string, any>), []) // 這次進畫面解碼好的圖
  useEffect(() => {
    if (!items.length) return
    let alive = true
    let timer: any = null
    const bump = () => {
      if (!alive || timer) return
      timer = setTimeout(() => { timer = null; if (alive) setTick((n) => n + 1) }, 250) // 幾張一起好就只重畫一次
    }
    const queue = items.slice()
    const run = async () => {
      for (let m = queue.shift(); m && alive; m = queue.shift()) {
        try {
          // light：已下檔的舊片用輕量查法（一部片一個小請求）
          const u = normImageUrl((await (m.light ? posterLight(m.title, m.release) : moviePoster(m.title, m.slug, m.en))) || "")
          if (u && !posterImageNow(u)) await loadPosterImage(u)
        } catch (_) {}
        bump()
      }
    }
    for (let i = 0; i < 4; i++) run()
    return () => { alive = false; if (timer) clearTimeout(timer) }
  }, [key])
  return (m) => {
    const ready = posterReady(m.title, m.slug)
    const url = normImageUrl(ready || "")
    const img = url ? (imgs[url] ||= posterImageNow(url)) : null
    const why = url && !img ? posterError(url) : ""
    return { img, why, pending: !img && (ready === undefined || (!!url && !why)) }
  }
}

/** 電影頁頂端：海報在左，資訊、評分與紅色預告按鈕在右（跟 Scriptable 版一樣） */
function MovieHero({ title, slug, lines, en }: { title: string; slug?: string; lines: string[]; en?: string }) {
  const x = useLoad(() => movieExtras(title, slug), [title, slug || ""])
  const rt = useLoad(() => movieRatings(title, en, slug), [title, en || ""])
  const p = useLoad(() => moviePoster(title, slug, en), [title, slug || ""]) // 海報網址快查（不等預告）
  const [opening, setOpening] = useState(false)
  const r = rt.data
  const posterUrl = normImageUrl(x.data?.poster || p.data || posterReady(title, slug) || "")
  const pi = usePosterImage(posterUrl) // 快取有的立刻顯示，沒有的自己下載縮圖
  const posterPending = (!posterUrl && !x.data && p.data === null && !p.error) || (!!posterUrl && !pi.img && !pi.failed)
  const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`
  // 點「觀看預告」：還在讀就等讀好再開（movieExtras 會回傳同一個進行中的查詢），不會先開成搜尋頁
  const openTrailer = async () => {
    let d = x.data
    if (!d) {
      setOpening(true)
      d = await movieExtras(title, slug).catch(() => null)
      setOpening(false)
    }
    await Safari.openURL(d?.trailer || search)
  }
  const trailerLabel = opening ? "預告讀取中…" : !x.data || x.data.trailerName ? "觀看預告" : "搜尋預告"
  const loaded = !!(r && (r.imdb || r.tomato || r.popcorn))
  return <>
  <Section>
    <HStack alignment={"bottom"} spacing={12} listRowBackground={"clear"}>
      <PosterBox w={104} h={156} r={12} img={pi.img} ver={pi.ver} pending={posterPending} title={title} />
      <VStack alignment={"leading"} spacing={4}>
        {lines.filter(Boolean).map((l) => <Text key={l} font={"subheadline"} foregroundStyle={"secondaryLabel"}>{l}</Text>)}
        {/* 評分讀好後三個徽章都顯示：沒有那項評分就是「-」（跟「還沒抓到」分得開） */}
        {r ? <HStack spacing={3}>
          {r.imdb ? <RatingBadge kind={"imdb"} value={r.imdb.score.toFixed(1)} tier={ratingTier("imdb", r.imdb.score)} url={r.imdb.url} /> : <RatingBadge kind={"imdb"} value={"-"} tier={"none"} />}
          {r.tomato ? <RatingBadge kind={"tomato"} value={`${r.tomato.score}%`} tier={ratingTier("pct", r.tomato.score)} note={r.tomato.certified ? "認證" : undefined} url={r.tomato.url} /> : <RatingBadge kind={"tomato"} value={"-"} tier={"none"} />}
          {r.popcorn ? <RatingBadge kind={"popcorn"} value={`${r.popcorn.score}%`} tier={ratingTier("pct", r.popcorn.score)} url={r.popcorn.url} /> : <RatingBadge kind={"popcorn"} value={"-"} tier={"none"} />}
        </HStack> : null}
        {!r && !rt.error ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"}>評分讀取中…</Text> : null}
        {(r && !loaded && r.err) || rt.error
          ? <Text font={"caption2"} foregroundStyle={"tertiaryLabel"}>{`評分讀不到：${rt.error || r?.err}`}</Text> : null}
        <Button action={openTrailer} buttonStyle={"borderedProminent"} buttonBorderShape={"capsule"} tint={"systemRed"} padding={{ top: 6 }} disabled={opening}>
          <Label title={trailerLabel} systemImage={"play.fill"} font={"subheadline"} fontWeight={"semibold"} lineLimit={1} />
        </Button>
        {x.data?.err ? <Text font={"caption2"} foregroundStyle={"tertiaryLabel"}>{`預告：${x.data.err}`}</Text> : null}
        {x.error ? <Text font={"caption2"} foregroundStyle={"tertiaryLabel"}>{`預告讀不到：${x.error}`}</Text> : null}
      </VStack>
      <Spacer />
    </HStack>
  </Section>
  <CommunitySection title={title} />
  </>
}

function TmdbPage() {
  const [settings, update] = useSettings()
  const [token, setToken] = useState(settings.tmdbToken || "")
  const [status, setStatus] = useState("")
  const save = async (raw: string) => {
    const t = extractTmdbKey(raw)
    setToken(t)
    if (!t) {
      update({ tmdbToken: "" })
      setStatus("已清除，之後沒有片長的電影不會自動補。")
      return
    }
    setStatus("測試中…")
    try {
      const r = await tmdbTest(t)
      update({ tmdbToken: t })
      setStatus(`✅ 設定完成（測試：${r}）`)
    } catch (e) {
      setStatus(`❌ ${String((e as Error)?.message || e)}`)
    }
  }
  // 在 App 內開網頁（關掉就回到這頁）；不支援時改用 Safari
  const open = async (url: string) => {
    try {
      await Safari.present(url, false)
    } catch (_) {
      await Safari.openURL(url)
    }
  }
  const paste = async () => {
    let text = ""
    try { text = (await Pasteboard.getString()) || "" } catch (_) {}
    if (!text) return setStatus("❌ 剪貼簿是空的，請先到 TMDB 複製金鑰")
    await save(text)
  }
  return <Form navigationTitle={"補片長（TMDB）"} navigationBarTitleDisplayMode={"inline"}>
    <Section footer={<Text>{"場次通的重映、修復版、演唱會有時沒有片長。設定 TMDB 金鑰後，會自動用片名查片長，也會顯示海報和預告片。免費，金鑰只存在你的手機。"}</Text>}>
      <LabeledContent title={"狀態"} value={settings.tmdbToken ? "已設定" : "未設定"} />
    </Section>
    <Section header={<Text>① 註冊並登入 TMDB</Text>} footer={<Text>註冊後到信箱點驗證信。</Text>}>
      <Button title={"註冊 TMDB 帳號"} systemImage={"person.badge.plus"} action={() => open(TMDB_LINKS.signup)} />
      <Button title={"已經有帳號：登入"} systemImage={"person.crop.circle"} action={() => open(TMDB_LINKS.login)} />
    </Section>
    <Section header={<Text>② 申請 API</Text>} footer={<Text>{"申請頁選 Developer → 同意條款 → 用途填 Personal use（個人使用），網址可填 https://github.com。\n金鑰頁複製「API Read Access Token」（eyJ 開頭）或「API Key」（32 碼）都可以。"}</Text>}>
      <Button title={"開啟 API 申請頁"} systemImage={"square.and.pencil"} action={() => open(TMDB_LINKS.request)} />
      <Button title={"開啟 API 金鑰頁"} systemImage={"key"} action={() => open(TMDB_LINKS.api)} />
    </Section>
    <Section header={<Text>③ 回到這裡貼上</Text>}>
      <Button title={"從剪貼簿貼上並測試"} systemImage={"doc.on.clipboard"} action={paste} />
      <TextField title={"金鑰"} value={token} onChanged={setToken} prompt={"或手動貼上金鑰"} />
      <Button title={"儲存並測試"} systemImage={"checkmark.circle"} action={() => save(token)} />
      {settings.tmdbToken ? <Button title={"清除金鑰"} role={"destructive"} action={() => save("")} /> : null}
    </Section>
    {status ? <Section><Text>{status}</Text></Section> : null}
  </Form>
}

/** 版本號：點一下複製「版本 …」，並顯示是否為最新版、可一鍵更新 */
function VersionRow() {
  const [copied, setCopied] = useState(false)
  const latest = useLoad(async () => (await checkLatest(appVersion())) || { latest: "", isLatest: false, failed: true }, [])
  const text = `版本 ${appVersion()}`
  const copy = async () => {
    await Pasteboard.setString(text)
    try { HapticFeedback.notificationSuccess() } catch (_) {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const r = latest.data
  return <>
    <Button action={copy}>
      <HStack>
        <Text foregroundStyle={"secondaryLabel"}>{text}</Text>
        <Spacer />
        <Text foregroundStyle={copied ? "systemGreen" : "tertiaryLabel"} font={"footnote"}>{copied ? "已複製 ✓" : "點一下複製"}</Text>
      </HStack>
    </Button>
    {!r ? <Text foregroundStyle={"secondaryLabel"} font={"footnote"}>檢查是否為最新版…</Text> : null}
    {r && "failed" in r ? <Text foregroundStyle={"secondaryLabel"} font={"footnote"}>無法確認是否為最新版（讀不到 GitHub）</Text> : null}
    {r && !("failed" in r) && r.isLatest ? <Label title={"已是最新版"} systemImage={"checkmark.seal.fill"} foregroundStyle={"systemGreen"} /> : null}
    {r && !("failed" in r) && !r.isLatest ? <Button title={`有新版 ${r.latest}，點此更新`} systemImage={"arrow.down.circle.fill"} action={() => Safari.openURL(SCRIPTING_IMPORT_URL)} /> : null}
  </>
}

const RAW_MAIN = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/"
/** 自己更新：把 GitHub 上最新的腳本檔下載下來，蓋掉這支腳本資料夾裡的檔案（下次開啟就是新版）。
 *  全部下載好、長度都對得上才動手寫，寫的時候 script.json（版本號）最後寫；做不到就回傳 false，改用手動匯入 */
async function selfUpdate(latest: string): Promise<boolean> {
  try {
    const dir = (Script as any).directory
    const FM = (globalThis as any).FileManager, P = (globalThis as any).Path
    if (typeof dir !== "string" || !dir || !FM || !P || !FM.existsSync(P.join(dir, "index.tsx"))) return false
    const get = async (path: string) => {
      const r = await scriptingPlatform.fetchText(RAW_MAIN + path + "?t=" + Date.now(), {})
      if (r.status < 200 || r.status >= 300 || !r.body) throw new Error(path)
      return r.body
    }
    const man = JSON.parse(await get("dist/scripting-files.json")) as { version: string; files: { name: string; chars: number }[] }
    if (man.version !== latest || !Array.isArray(man.files) || man.files.length < 3) return false // 剛好正在發佈新版：下次再試
    const got: Record<string, string> = {}
    for (const f of man.files) {
      if (!/^[\w.-]+\.(ts|tsx|json)$/.test(f.name)) return false
      const text = await get("scripting/" + f.name)
      if (text.length !== f.chars) return false // 下載不完整，或下載到一半 GitHub 上又換版了
      got[f.name] = text
    }
    const names = man.files.map((f) => f.name).filter((n) => n !== "script.json")
    for (const n of names) FM.writeAsStringSync(P.join(dir, n), got[n])
    if (got["script.json"]) FM.writeAsStringSync(P.join(dir, "script.json"), got["script.json"]) // 版本號最後寫：中途失敗的話下次會再更新一次
    return true
  } catch (_) {
    return false
  }
}

/** 開啟時檢查新版：有新版就自動更新（下次開啟生效，同一版只通知一次）；自動更新做不到才問要不要手動匯入 */
function useUpdatePrompt() {
  useEffect(() => {
    ;(async () => {
      const r = await checkLatest(appVersion())
      if (!r || r.isLatest) return
      let done = ""
      try { done = Storage.get("auto-updated") || "" } catch (_) {}
      if (done === r.latest) return // 這一版已經下載好了，只是還沒重新開啟
      if (await selfUpdate(r.latest)) {
        try { Storage.set("auto-updated", r.latest) } catch (_) {}
        await Dialog.alert({ title: "已自動更新", message: `電影行程已經更新到 ${r.latest}。\n關掉再開一次就是新版，設定不會消失。` })
        return
      }
      let asked = ""
      try { asked = Storage.get("asked-update") || "" } catch (_) {}
      if (asked === r.latest) return
      try { Storage.set("asked-update", r.latest) } catch (_) {}
      const ok = await Dialog.confirm({
        title: "電影行程有新版本",
        message: `目前 ${appVersion()}\n最新 ${r.latest}\n\n要現在更新嗎？會打開 Scripting 的匯入畫面，選「取代／更新」即可，設定不會消失。`,
        cancelLabel: "之後再說",
        confirmLabel: "更新",
      })
      if (ok) Safari.openURL(SCRIPTING_IMPORT_URL)
    })()
  }, [])
}

function CitiesPage({ cinemas }: { cinemas?: CinemasLoad }) {
  const [query, setQuery] = useState("")
  const list = cinemas?.data || store.cinemas
  const cities = sortCities(Array.from(new Set(list.map((c) => c.city))))
  const k = query.trim().toLowerCase().replace(/臺/g, "台")
  const hits = k ? list.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : []
  return <List navigationTitle={cinemas ? "影城" : "依縣市找影院"} navigationBarTitleDisplayMode={cinemas ? "large" : "inline"}
    searchable={{ value: query, onChanged: setQuery, prompt: "搜尋影城、分店或縣市" } as any}>
    {cinemas?.error ? <ErrorRow error={cinemas.error} retry={cinemas.reload} /> : null}
    {cinemas && !cinemas.data && !cinemas.error ? <Section><Loading text={"讀取影城清單…"} /></Section> : null}
    {k ? <Section header={<Text>{`搜尋結果 ${hits.length} 間`}</Text>}>
      {hits.map((c) => <CinemaLink key={c.id} cinema={c} showCity />)}
    </Section>
    : <Section header={<Text>{`全台影城（${list.length} 間）`}</Text>} footer={<Text>影城清單來自場次通與開眼電影網，會自動更新。</Text>}>
      {cities.map((city) =>
        <NavigationLink key={city} destination={<CityPage city={city} />}>
          <Row title={city} trailing={`${list.filter((c) => c.city === city).length} 間`} />
        </NavigationLink>
      )}
    </Section>}
  </List>
}

function CinemaLink({ cinema, showCity }: { cinema: Cinema; showCity?: boolean }) {
  const fav = store.settings.favorites.indexOf(cinema.id) >= 0
  return <NavigationLink destination={<CinemaPage cinema={cinema} />}>
    <Row title={(fav ? "★ " : "") + cinema.name} subtitle={showCity ? `${cinema.city} ${cinema.district}` : cinema.district} />
  </NavigationLink>
}

function CityPage({ city }: { city: string }) {
  useSettings()
  const list = store.cinemas.filter((c) => c.city === city)
  return <List navigationTitle={city}>
    {list.map((c) => <CinemaLink key={c.id} cinema={c} />)}
  </List>
}

// ───────────────────────── 影城 → 日期 → 電影 ─────────────────────────

function CinemaPage({ cinema }: { cinema: Cinema }) {
  const [settings, update] = useSettings()
  const info = useLoad(() => datesOf(cinema), [cinema.id])
  const fav = settings.favorites.indexOf(cinema.id) >= 0
  const toggleFav = () => update({
    favorites: fav ? settings.favorites.filter((id) => id !== cinema.id) : [...settings.favorites, cinema.id],
  })
  const address = info.data?.address || cinema.address || ""

  return <List
    navigationTitle={cinema.name}
    navigationBarTitleDisplayMode={"inline"}
    refreshable={info.reload}
    toolbar={{ topBarTrailing: <Button title={fav ? "移出常去" : "加入常去"} systemImage={fav ? "star.fill" : "star"} action={toggleFav} /> }}
  >
    {address ? <Section footer={<Text>點一下導航，長按可複製地址</Text>}><AddressRow name={cinema.name} address={address} /></Section> : null}
    {info.error ? <ErrorRow error={info.error} retry={info.reload} /> : null}
    <Section header={<Text>選擇日期</Text>} footer={info.data?.notice ? <Text>{info.data.notice}</Text> : undefined}>
      {!info.data && !info.error ? <Loading text={`讀取 ${cinema.name} 的場次…`} /> : null}
      {info.data && !info.data.dates.length ? <Text foregroundStyle={"secondaryLabel"}>目前沒有公布的場次</Text> : null}
      {(info.data?.dates || []).map((d) =>
        <NavigationLink key={d} destination={<DayPage cinema={cinema} date={d} />}>
          <Text>{dateLabel(d)}</Text>
        </NavigationLink>
      )}
    </Section>
    <Section>
      {info.data?.site ? <Button title={"影城官網（訂票）"} systemImage={"house"} action={() => Safari.openURL(info.data!.site!)} /> : null}
      {info.data?.site !== cinema.url ? <Button title={cinema.source === "at" ? "以瀏覽器開啟開眼時刻表" : "以瀏覽器開啟場次通時刻表"} systemImage={"globe"} action={() => Safari.openURL(cinema.url)} /> : null}
    </Section>
  </List>
}

function DayPage({ cinema, date }: { cinema: Cinema; date: string }) {
  const day = useLoad(() => moviesOf(cinema, date), [cinema.id, date])
  useEffect(() => { if (day.data) prefetchPosters(day.data.movies) }, [day.data]) // 背景先抓海報，進電影頁就不用等
  const isToday = date === todayTPE()
  const now = nowHM()
  return <List navigationTitle={dateLabel(date)} navigationBarTitleDisplayMode={"inline"} refreshable={day.reload}>
    {day.error ? <ErrorRow error={day.error} retry={day.reload} /> : null}
    <Section header={<Text>{cinema.name}</Text>}>
      {!day.data && !day.error ? <Loading text={"讀取片單…"} /> : null}
      {day.data && !day.data.movies.length ? <Text foregroundStyle={"secondaryLabel"}>這天沒有可讀取的場次</Text> : null}
      {(day.data?.movies || []).map((m) => {
        const all = ([] as string[]).concat(...m.versions.map((v) => v.times))
        const left = isToday ? all.filter((t) => t > now || lateIsTonight(cinema.source, t)).length : all.length
        const sub = [m.runtime ? `${m.runtime} 分` : "片長未提供", m.rating, m.versions.map((v) => v.label).join("、")].filter(Boolean).join("｜")
        return <NavigationLink key={m.title} destination={
          <ShowtimesPage cinema={cinema} date={date} movie={m}
            ctx={{ booking: day.data!.booking, sourceUrl: day.data!.sourceUrl, address: day.data!.address }} />
        }>
          <Row title={m.title} subtitle={sub} muted={isToday && left === 0}
            trailing={isToday ? (left ? `剩 ${left} 場` : "已結束") : `${all.length} 場`} />
        </NavigationLink>
      })}
    </Section>
  </List>
}

// ───────────────────────── 場次 → 確認 ─────────────────────────

type Ctx = { booking: string; sourceUrl: string; address: string }

function ShowtimesPage({ cinema, date, movie: given, ctx, complete }: { cinema: Cinema; date: string; movie: Movie; ctx: Ctx; complete?: boolean }) {
  const [settings] = useSettings()
  // 從電影頁進來時，傳進來的可能只有一種版本：讀影城頁補齊所有版本
  const [versions, setVersions] = useState<Movie["versions"] | null>(null)
  useEffect(() => {
    if (!complete || cinema.source !== "tw") return
    let alive = true
    movieCinemaVersions(cinema, date, given.title).then((v) => {
      const count = (vs: Movie["versions"]) => vs.reduce((a, x) => a + x.times.length, 0)
      if (alive && v && count(v) > count(given.versions)) setVersions(v)
    }).catch(() => {})
    return () => { alive = false }
  }, [cinema.id, date, given.title])
  const movie: Movie = versions ? { ...given, versions } : given
  const isToday = date === todayTPE()
  const now = nowHM()
  return <List navigationTitle={movie.title} navigationBarTitleDisplayMode={"inline"}>
    <MovieHero title={movie.title} lines={[
      movie.runtime ? `片長 ${movie.runtime} 分鐘` + (movie.runtimeFrom ? `（${movie.runtimeFrom}）` : "") : "片長未提供，下一步可手動輸入",
      movie.rating || "",
      releaseLabel(releaseOf(movie.title)),
    ]} />
    <Section>
      <LabeledContent title={"影城"} value={cinema.name} />
      <LabeledContent title={"日期"} value={dateLabel(date)} />
    </Section>
    {movie.versions.map((v) =>
      <Section key={v.label} header={<Text>{v.label}</Text>}>
        {[...v.times].sort(byShowtime).map((t) => {
          const past = isToday && t <= now && !lateIsTonight(cinema.source, t)
          const end = movie.runtime ? fmt(new Date(tpeDate(date, t).getTime() + (movie.runtime + settings.ads) * 6e4)).slice(-5) : ""
          return <NavigationLink key={t} destination={
            <ConfirmPage pick={{ cinema, date, movie, version: v, time: t, ...ctx }} />
          }>
            <Row title={t + (isLate(t) ? "（凌晨場）" : "")} muted={past}
              trailing={past ? "已開演" : end ? `散場約 ${end}` : ""} />
          </NavigationLink>
        })}
      </Section>
    )}
  </List>
}

type Pick = { cinema: Cinema; date: string; movie: Movie; version: Version; time: string } & Ctx

function ConfirmPage({ pick }: { pick: Pick }) {
  const [settings, update] = useSettings()
  const [runtimeText, setRuntimeText] = useState(pick.movie.runtime ? String(pick.movie.runtime) : "")
  const [runtimeFrom, setRuntimeFrom] = useState(pick.movie.runtimeFrom || "")
  useEffect(() => {
    // 來源沒給片長：查 TMDB／開眼補上，查到就直接帶入（使用者已經自己輸入的話不覆蓋）
    if (pick.movie.runtime) return
    movieRuntime(pick.movie.title, (pick.movie as any).slug, (pick.movie as any).en).then((r) => {
      if (!r) return
      pick.movie.runtime = r.runtime
      pick.movie.runtimeFrom = r.from
      setRuntimeText((t) => t || String(r.runtime))
      setRuntimeFrom(r.from)
    }).catch(() => {})
  }, [])
  const [seat, setSeat] = useState(hallOf(pick.version.label)) // 來源有標影廳就先帶入，可再修改
  const [address, setAddress] = useState(pick.address || pick.cinema.address || "")
  const [saved, setSaved] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [calendars, setCalendars] = useState<string[]>([])

  useEffect(() => {
    if (!address) cinemaAddress(pick.cinema).then((a) => a && setAddress(a))
    ;(async () => {
      setCalendars((await Calendar.forEvents()).filter((c: any) => c.allowsContentModifications).map((c: any) => c.title))
    })()
  }, [])

  const runtime = Math.round(Number(runtimeText)) || 0
  // 凌晨場（00:00–04:59）在影城片單上屬於前一個營業日，實際日期要 +1 天
  const start = tpeDate(showDay(pick.cinema.source, pick.date, pick.time), pick.time)
  const end = new Date(start.getTime() + ((runtime || 120) + settings.ads) * 6e4)

  async function save() {
    if (!(runtime > 0 && runtime < 600)) {
      await Dialog.alert({ title: "請先填片長", message: "這部片的資料來源沒有提供片長，請依官網或電影票輸入正片分鐘數。" })
      return
    }
    setBusy(true)
    try {
      const cals = await Calendar.forEvents()
      const cal = cals.find((c: any) => c.title === settings.calendar) || (await Calendar.defaultForEvents())
      const dup = (await CalendarEvent.getAll(new Date(start.getTime() - 6e4), new Date(start.getTime() + 6e4), [cal]))
        .find((e: any) => e.title === pick.movie.title)
      if (dup && !(await Dialog.confirm({ title: "行事曆裡已經有這場", message: `${pick.movie.title}\n${fmt(start)}`, cancelLabel: "取消", confirmLabel: "還是加入" }))) return

      const maps = mapsUrl(pick.cinema.name, address, settings.maps)
      const ev = new CalendarEvent()
      ev.title = pick.movie.title
      ev.calendar = cal
      ev.startDate = start
      ev.endDate = end
      ev.location = [pick.cinema.name, address].filter(Boolean).join(" ")
      ev.url = pick.booking || pick.sourceUrl
      ev.notes = [
        `影城：${pick.cinema.name}`,
        address ? `地址：${address}` : "",
        `版本：${pick.version.label}`,
        `影廳／座位：${seat.trim() || "未填"}`,
        `正片：${runtime} 分鐘；廣告預告：${settings.ads} 分鐘`,
        `預計散場：${fmt(end)}`,
        `導航：${maps}`,
        pick.booking ? `訂票／官方：${pick.booking}` : "",
        `場次來源：${pick.sourceUrl}`,
      ].filter(Boolean).join("\n")
      const alarm = settings.alarm ?? 30
      if (alarm >= 0) ev.addAlarm(EventAlarm.fromRelativeOffset(-alarm * 60))
      await ev.save()
      setSaved(ev)
    } catch (e) {
      await Dialog.alert({ title: "加入失敗", message: String((e as Error)?.message || e) })
    } finally {
      setBusy(false)
    }
  }

  return <Form navigationTitle={"確認行程"} navigationBarTitleDisplayMode={"inline"}>
    <Section>
      <LabeledContent title={"電影"} value={pick.movie.title} />
      <LabeledContent title={"版本"} value={pick.version.label} />
      {address ? <AddressRow name={pick.cinema.name} address={address} title={pick.cinema.name} /> : <LabeledContent title={"影城"} value={pick.cinema.name} />}
      <LabeledContent title={"開演"} value={fmt(start)} />
      <LabeledContent title={"預計散場"} value={fmt(end).slice(-5)} />
    </Section>
    {isLate(pick.time) ? <Section footer={<Text>{showDay(pick.cinema.source, pick.date, pick.time) !== pick.date ? "這是凌晨場：已自動算到隔天日期，請再核對電影票。" : "這是凌晨場：請核對日期，這場是在這一天的凌晨開演。"}</Text>}><Label title={"凌晨場"} systemImage={"moon.stars"} /></Section> : null}

    <Section header={<Text>可調整</Text>} footer={!pick.movie.runtime ? <Text>資料來源沒有提供片長，正在查 TMDB／開眼電影網，查不到請手動輸入。</Text> : runtimeFrom || pick.movie.runtimeFrom ? <Text>{`片長取自 ${runtimeFrom || pick.movie.runtimeFrom}（重映片為原版片長），請再核對。`}</Text> : undefined}>
      <HStack>
        <Text>片長（分鐘）</Text>
        <TextField title={"片長（分鐘）"} value={runtimeText} onChanged={setRuntimeText} prompt={"例如 120"} keyboardType={"numberPad"} multilineTextAlignment={"trailing"} />
      </HStack>
      <Picker title={"預留廣告預告"} value={settings.ads} onChanged={(v: number) => update({ ads: v })}>
        {ADS.map((m) => <Text key={m} tag={m}>{m ? `${m} 分鐘` : "不預留"}</Text>)}
      </Picker>
      <HStack>
        <Text>影廳／座位</Text>
        <TextField title={"影廳／座位"} value={seat} onChanged={setSeat} prompt={"選填，例如 7 廳 H12"} multilineTextAlignment={"trailing"} />
      </HStack>
      <Picker title={"提醒"} value={settings.alarm ?? 30} onChanged={(v: number) => update({ alarm: v })}>
        {ALARMS.map((a) => <Text key={a.minutes} tag={a.minutes}>{a.label}</Text>)}
      </Picker>
      <Picker title={"行事曆"} value={settings.calendar || ""} onChanged={(v: string) => update({ calendar: v })}>
        {calendars.map((t) => <Text key={t} tag={t}>{t}</Text>)}
      </Picker>
    </Section>

    <Section>
      {saved
        ? <>
          <Label title={`已加入「${settings.calendar || "行事曆"}」`} systemImage={"checkmark.circle.fill"} foregroundStyle={"systemGreen"} />
          <Button title={"在行事曆中查看／編輯"} systemImage={"calendar"} action={() => saved.presentEditView()} />
        </>
        : <Button title={busy ? "加入中…" : "加入行事曆"} systemImage={"calendar.badge.plus"} disabled={busy} action={save} />}
    </Section>

    <Section footer={cinemaApp(pick.cinema) ? <Text>{`已安裝「${cinemaApp(pick.cinema)!.name}」App 會直接開啟；開不了時會打開 App Store 頁面（已安裝點「打開」，沒安裝可以直接下載）。`}</Text> : <Text>這間影城沒有官方 App，請用瀏覽器訂票。</Text>}>
      <Button title={"以瀏覽器訂票"} systemImage={"globe"} action={async () => Safari.openURL(await bookingUrl(pick))} />
      {cinemaApp(pick.cinema) ? <Button title={`以 App 訂票（${cinemaApp(pick.cinema)!.name}）`} systemImage={"iphone"} action={() => openCinemaApp(pick.cinema)} /> : null}
    </Section>

    <Section>
      <Button title={"分享這場給朋友"} systemImage={"square.and.arrow.up"}
        action={() => ShareSheet.present([shareText({ ...pick, address }, start, runtime ? end : undefined, seat.trim(), settings.maps)])} />
    </Section>
  </Form>
}

// ───────────────────────── 依電影找 ─────────────────────────

/** 票房排行上、場次通已經沒有場次的片：海報、評分、預告、觀眾評分與票房 */
function BoxOfficeMoviePage({ item: x }: { item: BoxOfficeItem }) {
  const date = x.release.replace(/-/g, "/")
  const info = useLoad(() => boxInfo(x), [x.name, x.release]) // 發行、出品、累計票數（點進來才下載）
  return <List navigationTitle={x.name} navigationBarTitleDisplayMode={"inline"}>
    <MovieHero title={x.name} lines={[boxCountryText(x.country), `${date} 上映`]} />
    {/* 個別資訊：跟官方網站列的欄位一樣（國別、發行、出品、上映日期、院數、票數、金額） */}
    <Section header={<Text>{`票房第 ${x.rank} 名`}</Text>} footer={<Text>資料來源：國家電影及視聽文化中心「全國電影票房統計」。場次通目前沒有這部片的場次，可能已經下檔，或只在少數戲院放映。</Text>}>
      {/* 右邊的內容一行放不下時，字體自動縮小到放得下（最小縮到六成） */}
      {boxInfoRows(x, info.data || null).map(([label, value]) => <HStack key={label} spacing={12}>
        <Text>{label}</Text>
        <Spacer />
        <Text foregroundStyle={"secondaryLabel"} lineLimit={1} minScaleFactor={0.6}>{value}</Text>
      </HStack>)}
    </Section>
  </List>
}

/** 還沒有場次的即將上映片：海報、評分、預告，加上映日期 */
function SoonMoviePage({ film: u }: { film: UpcomingFilm }) {
  const date = u.release.replace(/-/g, "/")
  return <List navigationTitle={u.title} navigationBarTitleDisplayMode={"inline"}>
    <MovieHero title={u.title} en={u.en} lines={[u.en, [`${date} ${u.approx ? "當週" : ""}上映`, u.rating, u.runtime ? `${u.runtime} 分` : ""].filter(Boolean).join("｜")].filter(Boolean)} />
    <Section footer={<Text>戲院還沒有排這部片的場次。通常上映前一到兩週會開放，到時候這裡會自動變成可以查場次。上映日期可能再調整。</Text>}>
      <Button title={"開眼電影網的介紹"} systemImage={"safari"} action={() => Safari.openURL(u.url)} />
    </Section>
  </List>
}

/** 「電影」清單：上映中與票房排行合成一份（範圍、排序、出品國別都在這裡選）。每一部都可以點：有場次的進電影頁，沒有的進精簡頁 */
function BoxOfficeSections({ movies, query }: { movies: TwMovie[]; query: string }) {
  const [pickedSort, setSort] = useState<string>("") // 排法（空 = 第一種：本週票房）；year = 年度排行（含已下檔）
  const pickedScope = pickedSort === "year" ? "year" : "now"
  const [asc, setAsc] = useState(false) // 反過來排（低到高、舊到新、少到多）；換一種排法就回到預設方向
  const [pickedRate, setRate] = useState<string>("") // 依評分排時用哪一種評分（空 = IMDb）
  // 依觀眾評分排時才讀評分總表
  const needCommunity = pickedSort === "rating" && pickedRate === "community"
  const community = useLoad(() => (needCommunity ? loadCommunitySummary() : Promise.resolve(null)), [needCommunity])
  const [pickedWeek, setPickedWeek] = useState<string>("") // 週票房看哪一週（空 = 最新）
  // 年度排行的其他年份、過去的週票房各是另一個檔，用到才下載；票房讀不到時清單照樣出來，只是少了依票房排的選項
  const needWeeks = pickedScope !== "year" && (pickedSort || "week") === "week" && !!pickedWeek
  const box = useLoad(() => loadBoxFor(pickedScope, pickedSort || "week", pickedWeek).then((b) => ({ b: b as BoxOffice | null }), () => ({ b: null as BoxOffice | null })), [pickedScope === "year" ? 1 : needWeeks ? 2 : 0])
  const [pickedYears, setPickedYears] = useState<string[]>([]) // 年度可以複選（空 = 最新的一年）
  const [yearOpen, setYearOpen] = useState(false)
  const [pickedCountry, setPickedCountry] = useState<string[]>([]) // 只看哪幾個出品國別（可以複選；空 = 全部）
  const [countryOpen, setCountryOpen] = useState(false)
  const b = box.data ? box.data.b : null
  const board = useMemo(
    () => movieBoard(b, movies, { scope: pickedScope, sort: pickedSort, years: pickedYears, week: pickedWeek, countries: pickedCountry, query, asc, rate: pickedRate, community: community.data }),
    [b, movies.length, asc, pickedRate, community.data, pickedScope, pickedSort, pickedYears.join(","), pickedWeek, pickedCountry.join(","), query])
  const { years: yearOptions, selYears: years, countries, selCountries: country } = board
  // 年度排行一年有六百部左右、全選是好幾千部：先顯示 100 列，滑到底自動接著載入（不用按）。換了排法、年份或搜尋字就從頭開始
  const paged = board.paged
  const pageKey = `${board.asc}|${board.rate}|${board.scope}|${board.sort}|${years.join(",")}|${board.selWeek}|${query}|${country.join(",")}`
  const [page, setPage] = useState<{ key: string; n: number }>({ key: "", n: BOX_PAGE })
  const limit = page.key === pageKey ? page.n : BOX_PAGE
  const shown = paged ? board.entries.slice(0, limit) : board.entries
  const every = [...shown, ...board.rest]
  // 已下檔的舊片用輕量查法，而且只查畫面上這一批；畫面先出來，海報好了再補上
  const films = every.map((e) => ({ title: e.m ? e.m.title : e.name, slug: e.m?.slug, en: e.m?.en, light: e.light, release: e.x ? e.x.release : "" }))
  const thumbOf = useThumbs(box.data ? films : [], `${b ? b.list.length : 0}|${movies.length}|${pageKey}|${every.length}`)
  if (!box.data) return <Section><Loading text={"讀取電影清單…"} /></Section>
  const thumbs = films.map(thumbOf)
  const bad = shown.filter((_, i) => thumbs[i].why)
  const failNote = bad.length
    ? `\n${bad.slice(0, 8).map((e) => `《${e.name}》`).join("")}${bad.length > 8 ? ` 等 ${bad.length} 部` : ""}的海報讀不到（${Array.from(new Set(thumbs.map((t) => t.why).filter(Boolean))).join("；")}），下次進來會再試。`
    : ""
  const row = (e: MovieEntry, i: number) => {
    const body = <HStack spacing={10}>
      {e.rank === null ? null : <Text font={e.rank >= 1000 ? "caption" : e.rank >= 100 ? "subheadline" : "title3"} fontWeight={"bold"} monospacedDigit foregroundStyle={e.rank <= 3 ? "systemOrange" : "secondaryLabel"} lineLimit={1} minScaleFactor={0.6} frame={{ width: 34 }}>{String(e.rank)}</Text>}
      {PosterBox({ w: 44, h: 66, r: 6, img: thumbs[i].img, ver: 0, pending: thumbs[i].pending, title: e.name })}
      <VStack alignment={"leading"} spacing={2}>
        <Text foregroundStyle={"label"} lineLimit={2} minScaleFactor={0.75}>{e.name}</Text>
        {/* 兩行說明各自一行不換行，窄螢幕也對得齊 */}
        {e.lines[0] ? <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={1} minScaleFactor={0.8}>{e.lines[0]}</Text> : null}
        {e.lines[1] ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"} lineLimit={1} minScaleFactor={0.8}>{e.lines[1]}</Text> : null}
      </VStack>
      <Spacer />
    </HStack>
    if (e.m) return <NavigationLink key={e.key} destination={<MoviePage movie={e.m} />}>{body}</NavigationLink>
    if (e.x) return <NavigationLink key={e.key} destination={<BoxOfficeMoviePage item={e.x} />}>{body}</NavigationLink>
    return body
  }
  return <>
  <Section>
    {/* 範圍和排序併成一個選單：最後一項是年度排行（含已下檔） */}
    {board.orders.length > 1 ? <Picker title={"排序"} value={board.order} onChanged={(v: string) => { setSort(v); setAsc(false) }}>
      {board.orders.map((x) => <Text key={x.id} tag={x.id}>{x.id === "year" ? `${x.label}（含已下檔）` : x.label}</Text>)}
    </Picker> : null}
    {/* 順序：字跟著排法換（高到低／新到舊／多到少） */}
    <Picker title={"順序"} value={board.asc ? "asc" : "desc"} onChanged={(v: string) => setAsc(v === "asc")} pickerStyle={"segmented"}>
      {board.dirs.map((x) => <Text key={x.id} tag={x.id}>{x.label}</Text>)}
    </Picker>
    {board.rates.length > 1 ? <Picker title={"評分來源"} value={board.rate} onChanged={(v: string) => setRate(v)}>
      {board.rates.map((x) => <Text key={x.id} tag={x.id}>{x.label}</Text>)}
    </Picker> : null}
    {board.weeks.length > 1 ? <Picker title={"週次"} value={board.selWeek} onChanged={(v: string) => setPickedWeek(b && v === b.end ? "" : v)}>
      {board.weeks.map((o) => <Text key={o.id} tag={o.id}>{`${o.label}（${o.note}）`}</Text>)}
    </Picker> : null}
  </Section>
  {countries.length > 1 ? multiPick({
    title: "出品國別", open: countryOpen, onOpen: () => setCountryOpen(!countryOpen),
    summary: country.length ? country.join("、") : `全部（${board.everyone} 部）`,
    // 第一個選項是「全部」：點了就清掉所有勾選
    options: [{ id: "", label: `全部（${board.everyone} 部）` }, ...countries.map((c) => ({ id: c.id, label: `${c.id}（${c.count} 部）` }))],
    selected: country.length ? country : [""],
    onToggle: (id) => setPickedCountry(!id ? [] : country.indexOf(id) < 0 ? [...country, id] : country.filter((z) => z !== id)),
    footer: BOX_COUNTRY_NOTE,
  }) : null}
  {board.scope === "year" && yearOptions.length > 1 ? multiPick({
    title: "年份", open: yearOpen, onOpen: () => setYearOpen(!yearOpen),
    summary: years.length === yearOptions.length ? `全部（${yearOptions[yearOptions.length - 1]}–${yearOptions[0]}）` : years.join("、"),
    // 第一個選項是「全選」：再點一次回到只看最新的一年
    options: [{ id: "all", label: "全選" }, ...yearOptions.map((y) => ({ id: y, label: `${y} 年` }))],
    selected: years.length === yearOptions.length ? ["all", ...years] : years,
    onToggle: (y) => setPickedYears(y === "all" ? (years.length === yearOptions.length ? [] : yearOptions.slice()) : years.indexOf(y) < 0 ? [...years, y] : years.length > 1 ? years.filter((z) => z !== y) : years),
    footer: "可以複選，選了幾年就合在一起排。點「全選」一次選完，再點一次回到最新的一年。",
  }) : null}
  <Section header={<Text>{board.title}</Text>} footer={<Text>{`${every.length ? "" : "找不到相符的電影。\n"}${board.footer}${failNote}`}</Text>}>
    {shown.map(row)}
    {paged && board.entries.length > shown.length
      // 不用按：滑到這一列就自動接著載入下一批（也可以點）
      ? <Button action={() => setPage({ key: pageKey, n: limit + BOX_PAGE * 2 })}>
          <Text font={"footnote"} foregroundStyle={"secondaryLabel"} onAppear={() => setPage({ key: pageKey, n: limit + BOX_PAGE * 2 })}>{`載入中…已顯示 ${shown.length}／${board.entries.length} 部`}</Text>
        </Button>
      : null}
  </Section>
  {board.rest.length ? <Section header={<Text>{board.restTitle}</Text>} footer={<Text>{board.restFooter}</Text>}>
    {board.rest.map((e, i) => row(e, shown.length + i))}
  </Section> : null}
  </>
}

/** 直接給圖片網址的小圖（影展官網給的劇照）：統一下載、好了整批重畫一次；沒有網址或讀不到就回傳 null */
function useDirectImages(urls: string[], key: string): (url: string) => any {
  const [, setTick] = useState(0)
  const imgs = useMemo(() => ({} as Record<string, any>), [])
  useEffect(() => {
    let alive = true
    let timer: any = null
    const bump = () => { if (!alive || timer) return; timer = setTimeout(() => { timer = null; if (alive) setTick((n) => n + 1) }, 250) }
    const queue = urls.filter(Boolean)
    const run = async () => {
      for (let u = queue.shift(); u && alive; u = queue.shift()) {
        try { if (!posterImageNow(u)) await loadPosterImage(u) } catch (_) {}
        bump()
      }
    }
    for (let i = 0; i < 4; i++) run()
    return () => { alive = false; if (timer) clearTimeout(timer) }
  }, [key])
  return (url) => (url ? (imgs[url] ||= posterImageNow(url)) : null)
}

/** 影展分類：選影展（同時有兩個以上時）、選日期，列出那一天的片 */
function FestivalSections({ list: first, query }: { list: Festival[]; query: string }) {
  const [festId, setFestId] = useState("")
  const [pickedDate, setPickedDate] = useState("")
  const [pickedYear, setPickedYear] = useState(0) // 0 = 今年（今年還沒有就是最近有資料的那一年）
  const [tab, setTab] = useState("") // 看「進行中・即將開始」(live) 還是「已結束」(past)；空的 = 自動
  const old = useLoad(() => (pickedYear ? loadFestivals(pickedYear) : Promise.resolve(null as Festival[] | null)), [pickedYear])
  const list = pickedYear && old.data && old.data.length ? old.data : first
  const years = festivalYears()
  const pick = festivalPick(list, tab, festId)
  const f = pick.f || list[0]
  if (!f) return <Section><Text foregroundStyle={"secondaryLabel"}>目前沒有影展資料</Text></Section>
  const year = Number(list[0].end.slice(0, 4))
  const dates = festivalDates(f)
  const date = dates.indexOf(pickedDate) >= 0 ? pickedDate : festivalDefaultDate(f)
  const day = festivalDay(f, date)
  const hits = query ? festivalSearch(list, query) : [] // 搜尋：這一年所有影展的片名，不分日期
  const imgOf = useDirectImages(query ? hits.map((x) => x.film.poster || "") : day.map((x) => x.film.poster || ""), f.id + date + "|" + query) // 官網有給圖的片，直接用它的圖
  const past = festivalState(f) === "past"
  const filmRow = (hf: Festival, film: FestivalFilm, lines: string[]) => <NavigationLink key={hf.id + film.id} destination={<FestivalFilmPage festival={hf} film={film} />}>
    <HStack spacing={10}>
      {PosterBox({ w: 44, h: 66, r: 6, img: imgOf(film.poster || ""), ver: 0, pending: false, title: film.title })}
      <VStack alignment={"leading"} spacing={2}>
        <Text foregroundStyle={"label"} lineLimit={2} minScaleFactor={0.75}>{film.title}</Text>
        {lines[0] ? <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={1} minScaleFactor={0.8}>{lines[0]}</Text> : null}
        {lines[1] ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"} lineLimit={2}>{lines[1]}</Text> : null}
      </VStack>
      <Spacer />
    </HStack>
  </NavigationLink>
  if (query) return <Section header={<Text>{`「${query}」｜${hits.length} 部`}</Text>} footer={<Text>搜尋這一年所有影展的片名，不分日期。清空搜尋就回到每天的片單。</Text>}>
    {hits.map((x) => filmRow(x.f, x.film, festivalSearchLines(x.f, x.film, x.sessions)))}
    {hits.length ? null : <Text foregroundStyle={"secondaryLabel"}>這一年的影展裡找不到這個片名</Text>}
  </Section>
  return <>
    {years.length > 1 ? <Section>
      <Picker title={"年份"} value={String(year)} onChanged={(v: string) => { setPickedYear(Number(v)); setTab(""); setFestId(""); setPickedDate("") }}>
        {years.map((y) => <Text key={String(y)} tag={String(y)}>{`${y}`}</Text>)}
      </Picker>
    </Section> : null}
    {/* 還沒結束的和已經結束的分成兩區，各自一個清單，選中的打勾 */}
    {/* 進行中和已結束分成兩頁（上面的切換列），一次只列一頁的影展；影展和日期都用選單，緊接著就是片單 */}
    <Section footer={<Text>{festivalStatusLine(f) + (past ? "｜場次僅供回顧" : "")}</Text>}>
      {pick.tabs.length > 1 ? <Picker title={"狀態"} value={pick.tab} onChanged={(v: string) => { setTab(v); setFestId(""); setPickedDate("") }} pickerStyle={"segmented"}>
        {pick.tabs.map((t) => <Text key={t.id} tag={t.id}>{`${t.label}（${t.count}）`}</Text>)}
      </Picker> : null}
      <Picker title={"影展"} value={f.id} onChanged={(v: string) => { setFestId(v); setPickedDate("") }}>
        {pick.items.map((x) => <Text key={x.id} tag={x.id}>{`${x.name}（${festivalChipNote(x)}）`}</Text>)}
      </Picker>
      <Picker title={"日期"} value={date} onChanged={(v: string) => setPickedDate(v)}>
        {dates.map((d) => <Text key={d} tag={d}>{dateLabel(d)}</Text>)}
      </Picker>
    </Section>
    <Section header={<Text>{`${day.length} 部、${day.reduce((n, x) => n + x.sessions.length, 0)} 場`}</Text>}
      footer={<Text>{festivalFooter(f)}</Text>}>
      {day.map(({ film, sessions }) => {
        const lines = festivalLines(film, sessions)
        return <NavigationLink key={film.id} destination={<FestivalFilmPage festival={f} film={film} />}>
          <HStack spacing={10}>
            {PosterBox({ w: 44, h: 66, r: 6, img: imgOf(film.poster || ""), ver: 0, pending: false, title: film.title })}
            <VStack alignment={"leading"} spacing={2}>
              <Text foregroundStyle={"label"} lineLimit={2} minScaleFactor={0.75}>{film.title}</Text>
              {lines[0] ? <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={1} minScaleFactor={0.8}>{lines[0]}</Text> : null}
              {lines[1] ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"} lineLimit={2}>{lines[1]}</Text> : null}
            </VStack>
            <Spacer />
          </HStack>
        </NavigationLink>
      })}
      {day.length ? null : <Text foregroundStyle={"secondaryLabel"}>這一天沒有場次</Text>}
    </Section>
  </>
}

/** 影展的一部片：列出還沒演的所有場次，點一場進確認頁加入行事曆 */
function FestivalFilmPage({ festival: f, film }: { festival: Festival; film: FestivalFilm }) {
  const [settings] = useSettings()
  const sessions = festivalFilmSessions(f, film.id)
  const imgOf = useDirectImages([film.poster || ""], film.id)
  const end = (x: FestivalSession) => (film.mins ? fmt(new Date(tpeDate(x.date, x.time).getTime() + (film.mins + settings.ads) * 6e4)).slice(-5) : "")
  return <List navigationTitle={film.title} navigationBarTitleDisplayMode={"inline"}>
    <Section>
      <HStack alignment={"bottom"} spacing={12} listRowBackground={"clear"}>
        {PosterBox({ w: 104, h: 156, r: 12, img: imgOf(film.poster || ""), ver: 0, pending: false, title: film.title })}
        <VStack alignment={"leading"} spacing={4}>
          <Text font={"subheadline"} foregroundStyle={"secondaryLabel"}>{[film.rating, film.mins ? `${film.mins} 分鐘` : ""].filter(Boolean).join("｜")}</Text>
          <Text font={"subheadline"} foregroundStyle={"secondaryLabel"}>{`${f.name}（${festivalStateLabel(f)}）`}</Text>
          <Text font={"footnote"} foregroundStyle={"tertiaryLabel"}>影展片名，院線上映時可能不同</Text>
          <Button action={() => { Safari.openURL(festivalTrailer(film).url) }} buttonStyle={"borderedProminent"} buttonBorderShape={"capsule"} tint={"systemRed"} padding={{ top: 6 }}>
            <Label title={festivalTrailer(film).label} systemImage={"play.fill"} font={"subheadline"} fontWeight={"semibold"} lineLimit={1} />
          </Button>
        </VStack>
      </HStack>
    </Section>
    <CommunitySection title={film.title} />
    {film.intro || film.credits ? <Section header={<Text>介紹</Text>} footer={<Text>{`介紹來自${f.source}。`}</Text>}>
      {film.intro ? <Text font={"subheadline"}>{film.intro}</Text> : null}
      {film.credits ? <Text font={"footnote"} foregroundStyle={"secondaryLabel"}>{film.credits}</Text> : null}
    </Section> : null}
    <Section header={<Text>場次</Text>} footer={<Text>{festivalState(f) === "past" ? "這個影展已經結束，場次僅供回顧。" : "點一場加入行事曆。散場時間是依片長和你設定的廣告預告時間估的。"}</Text>}>
      {sessions.map((x) => {
        const cinema = festivalCinema(x, store.cinemas, f)
        const version: Version = { label: festivalPlace(x), times: [x.time] }
        const movie: Movie = { title: film.title, runtime: film.mins, rating: film.rating, versions: [version] }
        return <NavigationLink key={x.date + x.time + x.venue + x.room} destination={
          <ConfirmPage pick={{ cinema, date: x.date, movie, version, time: x.time, booking: x.ticket || film.url, sourceUrl: film.url, address: cinema.address || "" }} />
        }>
          <Row title={`${dateLabel(x.date).replace(/ .*$/, "")}　${x.time}`} subtitle={[festivalPlace(x), end(x) ? `預計 ${end(x)} 散場` : ""].filter(Boolean).join("｜")} />
        </NavigationLink>
      })}
      {sessions.length ? null : <Text foregroundStyle={"secondaryLabel"}>找不到這部片的場次</Text>}
    </Section>
    <Section>
      <Button title={"官網的影片介紹"} systemImage={"safari"} action={() => Safari.openURL(film.url)} />
    </Section>
  </List>
}

function MoviesPage() {
  const movies = useLoad(() => loadMovies(), [])
  const fests = useLoad(() => loadFestivals(), []) // 有進行中或即將開始的影展，才多出「影展」分類
  const festList = fests.data || []
  const [mode, setMode] = useState<string>("box") // box = 「電影」清單（上映中與票房排行合成一份）
  const [query, setQuery] = useState("")
  const k = query.trim().toLowerCase()
  // 即將上映：場次通已經有場次的片＋還沒有場次的片（伺服器整理的近期上映片單），依上映月份分段
  const upcoming = useLoad(() => loadUpcoming(), [])
  const soon = useMemo(() => soonBoard(movies.data || [], upcoming.data || [], k), [movies.data, upcoming.data, k])
  const list = soon.groups.flatMap((g) => g.items)
  useEffect(() => { if (movies.data && mode === "soon") prefetchPosters(list.filter((e) => e.m).map((e) => e.m as TwMovie)) }, [movies.data, k, mode]) // 背景先抓海報，進電影頁就不用等
  const films = list.map((e) => ({ title: e.title, slug: e.m?.slug, en: e.m ? e.m.en : e.u?.en }))
  const thumbOf = useThumbs(mode === "soon" ? films : [], `${(movies.data || []).length}|${(upcoming.data || []).length}|${k}|${mode}`) // 每一列的小海報
  const row = (e: SoonEntry, i: number) => {
    const t = thumbOf(films[i])
    const body = <HStack spacing={10}>
      {PosterBox({ w: 44, h: 66, r: 6, img: t.img, ver: 0, pending: t.pending, title: e.title })}
      <VStack alignment={"leading"} spacing={2}>
        <Text foregroundStyle={"label"} lineLimit={2} minScaleFactor={0.75}>{e.title}</Text>
        {/* 兩行說明各自一行不換行，跟票房排行同一種排版 */}
        {e.lines[0] ? <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={1} minScaleFactor={0.8}>{e.lines[0]}</Text> : null}
        {e.lines[1] ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"} lineLimit={1}>{e.lines[1]}</Text> : null}
      </VStack>
      <Spacer />
    </HStack>
    if (e.m) return <NavigationLink key={e.key} destination={<MoviePage movie={e.m} />}>{body}</NavigationLink>
    if (e.u) return <NavigationLink key={e.key} destination={<SoonMoviePage film={e.u} />}>{body}</NavigationLink>
    return body
  }
  return <List
    navigationTitle={"依電影找場次"}
    searchable={{ value: query, onChanged: setQuery, prompt: "搜尋片名" } as any}
    refreshable={movies.reload}
  >
    <Section>
      <Picker title={"顯示"} value={mode} onChanged={(v: string) => setMode(v)} pickerStyle={"segmented"}>
        <Text tag={"box"}>已上映</Text>
        <Text tag={"soon"}>即將上映</Text>
        {festList.length ? <Text tag={"fest"}>影展</Text> : null}
      </Picker>
    </Section>
    {mode === "fest" ? <FestivalSections list={festList} query={k} /> : mode === "box" ? <BoxOfficeSections movies={movies.data || []} query={k} /> : <>
      {movies.error ? <ErrorRow error={movies.error} retry={movies.reload} /> : null}
      {!movies.data && !movies.error ? <Section><Loading text={"讀取電影清單…"} /></Section> : null}
      {/* 依上映月份分段 */}
      {(() => { let n = 0; return soon.groups.map((g, gi) => <Section key={g.title} header={<Text>{g.title}</Text>} footer={gi === soon.groups.length - 1 ? <Text>{soon.footer}</Text> : undefined}>{g.items.map((e) => row(e, n++))}</Section>) })()}
      {movies.data && !list.length ? <Section><Text foregroundStyle={"secondaryLabel"}>找不到相符的電影。</Text></Section> : null}
    </>}
  </List>
}

function MoviePage({ movie }: { movie: TwMovie }) {
  const [settings] = useSettings()
  // 日期、縣市、特殊廳都可以複選；空的 = 預設（日期是來源預設那天，其餘是全部）
  const [selDatesRaw, setSelDates] = useState<string[]>([])
  const [selCitiesRaw, setSelCities] = useState<string[]>([])
  const [selFormatsRaw, setSelFormats] = useState<string[]>([])
  const [onlyFav, setOnlyFav] = useState(false)
  const [open, setOpen] = useState("") // 目前展開哪一組選項
  const base = useLoad(() => movieDay(movie.slug, undefined), [movie.slug]) // 預設那一天：片名、可選日期從這裡來
  const [, setFilled] = useState(0)

  const data = base.data
  const future = (data?.dates || []).filter((d) => d >= todayTPE())
  const allDates = future.length ? future : data ? [data.date] : []
  const picked = selDatesRaw.filter((d) => allDates.indexOf(d) >= 0)
  const selDates = picked.length ? picked.slice().sort() : data ? [allDates.indexOf(data.date) >= 0 ? data.date : allDates[0]] : []
  const more = useLoad(() => (selDates.length ? movieDays(movie.slug, selDates) : Promise.resolve([])), [movie.slug, selDates.join(",")])
  const days = more.data || []
  const cities = useMemo(() => sortCities(Array.from(new Set(days.flatMap((x) => x.cinemas.map((c) => c.city))))), [more.data])
  const selCities = selCitiesRaw.filter((c) => cities.indexOf(c) >= 0)
  const favIds = onlyFav ? settings.favorites : null
  // 電影頁每間影城只列一種版本：把目前顯示的影城從影城頁補齊，補好後重畫
  useEffect(() => {
    if (!days.length) return
    let alive = true
    for (const day of days) {
      const ids = day.cinemas.filter((c) => (!selCities.length || selCities.indexOf(c.city) >= 0) && (!favIds || favIds.indexOf(c.id) >= 0)).map((c) => c.id)
      if (!movieDayFilled(day, ids)) fillMovieDay(day, ids).then(() => { if (alive) setFilled((n) => n + 1) }).catch(() => {})
    }
    return () => { alive = false }
  }, [more.data, selCities.join(","), onlyFav])
  const formats = FORMATS.filter((f) => days.some((x) => x.cinemas.some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0))))
  const selFormats = (selFormatsRaw as Format[]).filter((f) => formats.indexOf(f) >= 0)
  const rows = movieRows(days, { cities: selCities, formats: selFormats, favIds })
  const byCity = sortCities(Array.from(new Set(rows.map((r) => r.cinema.city))))
  const many = selDates.length > 1 // 複選多天：每一列標日期
  const rt = useLoad(() => (data?.runtime || movie.runtime ? Promise.resolve(null) : movieRuntime(movie.title, movie.slug, movie.en)), [movie.slug, data ? 1 : 0]) // 來源沒給片長：查 TMDB／開眼補上
  const runtime = data?.runtime || movie.runtime || rt.data?.runtime || 0
  if (rt.data && !movie.runtime) { movie.runtime = rt.data.runtime; movie.runtimeFrom = rt.data.from }

  const toCinema = (c: TwMovieCinema): Cinema =>
    store.cinemas.find((x) => x.id === c.id) ||
    { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address }
  const toggle = (list: string[], id: string, min1 = false) => {
    const i = list.indexOf(id)
    if (i < 0) return [...list, id]
    return min1 && list.length === 1 ? list : list.filter((x) => x !== id)
  }
  const md = (d: string) => dateLabel(d).replace(/（.*$/, "")
  const flip = (k: string) => () => setOpen(open === k ? "" : k)
  const reload = () => { base.reload(); more.reload() }
  const error = base.error || more.error
  const about = movieAbout(base.data)

  return <List navigationTitle={movie.title} navigationBarTitleDisplayMode={"inline"} refreshable={reload}>
    <MovieHero title={movie.title} slug={movie.slug} en={movie.en} lines={[
      movie.en,
      [movie.rating || data?.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"),
      releaseLabel(data?.release || movie.release || releaseOf(movie.title)),
      data ? `${data.cinemas.length} 間影城有放映` : "",
    ]} />
    {about.text || about.credits ? <Section header={<Text>劇情簡介</Text>} footer={<Text>簡介來自場次通。</Text>}>
      {about.text ? <Text font={"subheadline"}>{about.text}</Text> : null}
      {about.credits ? <Text font={"footnote"} foregroundStyle={"secondaryLabel"}>{about.credits}</Text> : null}
    </Section> : null}
    {multiPick({
      title: "日期", open: open === "date", onOpen: flip("date"),
      summary: selDates.map(md).join("、"),
      options: allDates.map((d) => ({ id: d, label: dateLabel(d) })), selected: selDates,
      onToggle: (d) => setSelDates(toggle(selDates, d, true)),
    })}
    {multiPick({
      title: "縣市", open: open === "city", onOpen: flip("city"),
      summary: selCities.length ? selCities.join("、") : "全部",
      options: cities.map((c) => ({ id: c, label: c })), selected: selCities,
      onToggle: (c) => setSelCities(toggle(selCities, c)),
      footer: "都不選就是全部縣市。",
    })}
    {formats.length ? multiPick({
      title: "特殊廳", open: open === "format", onOpen: flip("format"),
      summary: selFormats.length ? selFormats.join("、") : "全部",
      options: formats.map((f) => ({ id: f as string, label: f as string })), selected: selFormats,
      onToggle: (f) => setSelFormats(toggle(selFormats, f)),
      footer: "都不選就是全部；選了幾種，就找其中任一種。",
    }) : null}
    <Section footer={<Text>日期、縣市、特殊廳都可以複選：點標題展開，再點選項打勾。</Text>}>
      <Toggle title={`只看常去影城（${settings.favorites.length}）`} value={onlyFav} onChanged={setOnlyFav} />
    </Section>

    {error ? <ErrorRow error={error} retry={reload} /> : null}
    {!more.data && !error ? <Section><Loading text={"讀取放映影城…"} /></Section> : null}
    {more.data && !rows.length ? <Section><Text foregroundStyle={"secondaryLabel"}>{onlyFav && !settings.favorites.length ? "還沒有常去影城，先到影城頁加入。" : "沒有符合條件的影城，換個日期或條件試試。"}</Text></Section> : null}

    {byCity.map((ct) => {
      const list = rows.filter((r) => r.cinema.city === ct)
      return <Section key={ct} header={<Text>{`${ct}（${new Set(list.map((r) => r.cinema.id)).size} 間）`}</Text>}>
        {list.map(({ date: d, cinema: c }) => {
          const m: Movie = { title: data?.title || movie.title, runtime, rating: data?.rating || movie.rating, versions: c.versions, runtimeFrom: data?.runtime ? data.runtimeFrom : movie.runtimeFrom }
          const summary = c.versions.map((v) => `${v.label} ${[...v.times].sort(byShowtime).join(" ")}`).join("／")
          return <NavigationLink key={c.id + "|" + d} destination={
            <ShowtimesPage cinema={toCinema(c)} date={d} movie={m} complete
              ctx={{ booking: "", sourceUrl: `${TW}/cinemas/${c.id}/${d}/`, address: c.address }} />
          }>
            <Row title={(settings.favorites.indexOf(c.id) >= 0 ? "★ " : "") + c.name + (many ? `　${md(d)}` : "")} subtitle={summary} />
          </NavigationLink>
        })}
      </Section>
    })}
  </List>
}

// ───────────────────────── 附近的影城 ─────────────────────────

let myLocation: LatLng | null = null
async function locate(): Promise<LatLng> {
  if (myLocation) return myLocation
  try {
    await Location.setAccuracy("hundredMeters")
  } catch (_) {}
  const l = await Location.requestCurrent()
  if (!l) throw new Error("拿不到目前位置。請到「設定 → 隱私權與安全性 → 定位服務 → Scripting」允許使用位置。")
  myLocation = { lat: l.latitude, lng: l.longitude }
  return myLocation
}

function NearbyPage() {
  useSettings()
  const res = useLoad(async () => {
    if (!store.cinemas.length) store.cinemas = await loadCinemas()
    return nearest(store.cinemas, await locate(), 25)
  }, [])
  return <List navigationTitle={"附近的影城"} navigationBarTitleDisplayMode={"inline"} refreshable={async () => { myLocation = null; await res.reload() }}>
    {res.error ? <ErrorRow error={res.error} retry={res.reload} /> : null}
    {!res.data && !res.error ? <Section><Loading text={"取得目前位置…"} /></Section> : null}
    {res.data ? <Section footer={<Text>直線距離。下拉可重新定位。</Text>}>
      {res.data.map(({ cinema: c, km }) =>
        <NavigationLink key={c.id} destination={<CinemaPage cinema={c} />}>
          <Row title={(store.settings.favorites.indexOf(c.id) >= 0 ? "★ " : "") + c.name} subtitle={`${c.city} ${c.district}`} trailing={kmLabel(km) || "距離未知"} />
        </NavigationLink>
      )}
    </Section> : null}
  </List>
}

// ───────────────────────── 現在有什麼可以看 ─────────────────────────

/** 可以複選的一組選項：標題那一列點一下展開，底下每個選項點一下打勾、再點一下取消。
 *  用最基本的按鈕和文字組成（Scripting 的 Picker 只能單選） */
function multiPick(p: { title: string; summary: string; open: boolean; onOpen: () => void; options: { id: string; label: string }[]; selected: string[]; onToggle: (id: string) => void; footer?: string }) {
  return <Section key={p.title} footer={p.open && p.footer ? <Text>{p.footer}</Text> : undefined}>
    <Button action={p.onOpen}>
      <HStack>
        <Text foregroundStyle={"label"}>{p.title}</Text>
        <Spacer />
        <Text foregroundStyle={"secondaryLabel"} lineLimit={1}>{p.summary}</Text>
        <Image systemName={p.open ? "chevron.up" : "chevron.down"} font={"caption"} foregroundStyle={"tertiaryLabel"} />
      </HStack>
    </Button>
    {p.open ? p.options.map((o) =>
      <Button key={o.id} action={() => p.onToggle(o.id)}>
        <HStack>
          <Text foregroundStyle={"label"}>{o.label}</Text>
          <Spacer />
          {p.selected.indexOf(o.id) >= 0 ? <Image systemName={"checkmark"} foregroundStyle={"systemBlue"} /> : null}
        </HStack>
      </Button>
    ) : null}
  </Section>
}

function NowPage() {
  const [settings] = useSettings()
  const today = todayTPE()
  // 四個條件都可以複選
  const [selDates, setSelDates] = useState<string[]>([today])
  const [selWins, setSelWins] = useState<string[]>(["soon"]) // 空 = 整天
  const [scopes, setScopes] = useState<string[]>(["fav"])
  const [formats, setFormats] = useState<string[]>([]) // 空 = 不限
  const [open, setOpen] = useState("") // 目前展開哪一組
  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(today, i))
  const hasToday = selDates.indexOf(today) >= 0
  const wins = WINDOWS.filter((w) => !w.todayOnly || hasToday)
  const winIds = selWins.filter((id) => wins.some((w) => w.id === id))
  const cities = sortCities(Array.from(new Set(store.cinemas.map((c) => c.city))))
  const scopeOptions = [{ id: "all", label: `不限（全台 ${store.cinemas.length} 間）` }, { id: "fav", label: `常去影城（${settings.favorites.length}）` }, { id: "near", label: "附近 10 間" }, ...cities.map((c) => ({ id: c, label: c }))]
  // 點一下加入、再點一下拿掉；min1 = 至少留一個
  const toggle = (list: string[], id: string, min1 = false) => {
    const i = list.indexOf(id)
    if (i < 0) return [...list, id]
    return min1 && list.length === 1 ? list : list.filter((x) => x !== id)
  }
  const md = (d: string) => dateLabel(d).replace(/（.*$/, "")
  const flip = (k: string) => () => setOpen(open === k ? "" : k)
  return <Form navigationTitle={"現在有什麼可以看"} navigationBarTitleDisplayMode={"inline"}>
    {multiPick({
      title: "日期", open: open === "date", onOpen: flip("date"),
      summary: selDates.slice().sort().map(md).join("、"),
      options: dates.map((d) => ({ id: d, label: dateLabel(d) })), selected: selDates,
      onToggle: (d) => setSelDates(toggle(selDates, d, true)),
    })}
    {multiPick({
      title: "開演時段", open: open === "win", onOpen: flip("win"),
      summary: !winIds.length || winIds.indexOf("all") >= 0 ? "整天" : wins.filter((w) => winIds.indexOf(w.id) >= 0).map((w) => w.label).join("、"),
      options: wins.map((w) => ({ id: w.id, label: w.label })), selected: winIds.length ? winIds : ["all"],
      onToggle: (id) => setSelWins(id === "all" ? ["all"] : toggle(winIds.filter((x) => x !== "all"), id)),
      footer: "都不選就是整天。「接下來 3 小時」只找今天。",
    })}
    {multiPick({
      title: "找哪些影城", open: open === "scope", onOpen: flip("scope"),
      summary: scopes.map((x) => (x === "all" ? "不限" : x === "fav" ? "常去影城" : x === "near" ? "附近 10 間" : x)).join("、"),
      options: scopeOptions, selected: scopes,
      onToggle: (id) => setScopes(id === "all" ? ["all"] : toggle(scopes.filter((x) => x !== "all"), id, true)),
      footer: "縣市的影城較多、選的天數越多，查詢會比較久；「不限」要讀全台每一間，最久。開眼來源的戲院通常只有今天的場次。",
    })}
    {multiPick({
      title: "特殊廳", open: open === "format", onOpen: flip("format"),
      summary: formats.length ? formats.join("、") : "不限",
      options: FORMATS.map((f) => ({ id: f as string, label: f as string })), selected: formats,
      onToggle: (id) => setFormats(toggle(formats, id)),
      footer: "都不選就是不限；選了幾種，就找其中任一種。",
    })}
    <Section footer={<Text>每一項都可以複選：點標題展開，再點選項打勾。</Text>}>
      <NavigationLink destination={<NowResultsPage dates={selDates} winIds={winIds} scopes={scopes} formats={formats as Format[]} />}>
        <Label title={"找場次"} systemImage={"magnifyingglass"} />
      </NavigationLink>
    </Section>
  </Form>
}

function NowResultsPage({ dates, winIds, scopes, formats }: { dates: string[]; winIds: string[]; scopes: string[]; formats: Format[] }) {
  const res = useLoad(async () => {
    if (!store.cinemas.length) store.cinemas = await loadCinemas()
    // 範圍複選：各範圍的影城合在一起，同一間只查一次（有距離的保留距離）
    const byId = new Map<string, { cinema: Cinema; km: number | null }>()
    const add = (list: { cinema: Cinema; km: number | null }[]) => list.forEach((x) => { const old = byId.get(x.cinema.id); if (!old || (old.km === null && x.km !== null)) byId.set(x.cinema.id, x) })
    for (const sc of scopes) {
      if (sc === "all") add(store.cinemas.map((c) => ({ cinema: c, km: null })))
      else if (sc === "near") add(nearest(store.cinemas, await locate(), 10))
      else if (sc === "fav") add(store.settings.favorites.map((id) => store.cinemas.find((c) => c.id === id)).filter(Boolean).map((c) => ({ cinema: c as Cinema, km: null })))
      else add(store.cinemas.filter((c) => c.city === sc).map((c) => ({ cinema: c, km: null })))
    }
    const list = Array.from(byId.values())
    if (!list.length) throw new Error("沒有可以查的影城。先在影城頁加入常去影城，或改選附近／縣市。")
    const r = await findShowtimesMulti(list, dates, winIds, formats)
    return { ...r, groups: await linkMovies(groupByMovie(r.hits)) } // 每部片對到電影清單上的那一部，片名才能連到電影頁
  }, [dates.join(","), winIds.join(","), scopes.join(","), formats.join(",")])
  const groups = res.data ? res.data.groups : []
  const thumbOf = useThumbs(groups.map((g) => ({ title: g.title, slug: g.movie?.slug, en: g.movie?.en })), `now|${groups.length}|${dates.join(",")}|${winIds.join(",")}`)
  useEffect(() => { if (res.data) prefetchPosters(groups) }, [res.data]) // 背景先抓海報，進電影頁就不用等
  const scopeLabel = scopes.map((x) => (x === "all" ? "全台影城" : x === "fav" ? "常去影城" : x === "near" ? "附近 10 間" : x)).join("、")
  const many = dates.length > 1 // 複選多天：每一場前面標日期
  const [folded, setFolded] = useState<string[]>([]) // 收合起來的片（只留片名列）
  const isFolded = (t: string) => folded.indexOf(t) >= 0
  const toggleFold = (t: string) => setFolded(isFolded(t) ? folded.filter((x) => x !== t) : [...folded, t])
  const [query, setQuery] = useState("") // 在結果裡再搜尋（片名、影城、廳別）
  const shown = nowFilter(groups, query)
  const allFolded = shown.length > 0 && shown.every((g) => isFolded(g.title))
  return <List navigationTitle={multiLabel(dates, winIds)} navigationBarTitleDisplayMode={"inline"} refreshable={res.reload}
    searchable={{ value: query, onChanged: setQuery, prompt: "在結果裡搜尋片名、影城或廳別" } as any}>
    {res.error ? <ErrorRow error={res.error} retry={res.reload} /> : null}
    {!res.data && !res.error ? <Section><Loading text={`查詢${scopeLabel}的場次…`} /></Section> : null}
    {/* 完整的查詢條件放在內文（導覽列標題只有一行，複選多了會被截掉） */}
    {res.data ? <Section footer={<Text>{`${multiDetail(dates, winIds)}\n影城：${scopeLabel}${formats.length ? `\n特殊廳：${formats.join("、")}` : ""}`}</Text>}>
      <Text foregroundStyle={"secondaryLabel"}>{`${res.data.hits.length} 場｜${groups.length} 部電影`}</Text>
    </Section> : null}
    {res.data && !groups.length ? <Section><Text foregroundStyle={"secondaryLabel"}>沒有符合的場次，換個時段或範圍試試。</Text></Section> : null}
    {query.trim() && groups.length ? <Section><Text foregroundStyle={"secondaryLabel"}>{shown.length ? `「${query.trim()}」：${shown.reduce((n, g) => n + g.hits.length, 0)} 場｜${shown.length} 部電影` : `結果裡找不到「${query.trim()}」`}</Text></Section> : null}
    {shown.length > 1 ? <Section>
      <Button action={() => setFolded(allFolded ? [] : shown.map((g) => g.title))}>
        <Label title={allFolded ? "全部展開場次" : "全部收合，只看片名"} systemImage={allFolded ? "chevron.down.circle" : "chevron.right.circle"} />
      </Button>
    </Section> : null}
    {shown.map((g) =>
      <Section key={g.title}>
        {/* 片名獨立一列（海報、粗體大字），點下去是電影頁：簡介、預告、所有影城的場次 */}
        {(() => {
          const t = thumbOf({ title: g.title, slug: g.movie?.slug })
          const head = <HStack spacing={10}>
            {PosterBox({ w: 44, h: 66, r: 6, img: t.img, ver: 0, pending: t.pending, title: g.title })}
            <VStack alignment={"leading"} spacing={2}>
              <Text font={"headline"} foregroundStyle={"label"} lineLimit={2}>{g.title}</Text>
              <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={1}>{nowGroupLine(g)}</Text>
            </VStack>
            <Spacer />
            {/* 最右邊的收合鈕：跟整列（點了進電影頁）分開按 */}
            <Button action={() => toggleFold(g.title)} buttonStyle={"borderless"}>
              <Image systemName={isFolded(g.title) ? "chevron.right.circle" : "chevron.down.circle"} font={"title3"} foregroundStyle={"secondaryLabel"} />
            </Button>
          </HStack>
          return g.movie ? <NavigationLink destination={<MoviePage movie={g.movie} />}>{head}</NavigationLink> : head
        })()}
        {(isFolded(g.title) ? [] : g.hits).map((hit: Hit) =>
          <NavigationLink key={`${hit.cinema.id}-${hit.date}-${hit.version.label}-${hit.time}`} destination={
            <ConfirmPage pick={{ cinema: hit.cinema, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time, ...hit.ctx }} />
          }>
            <Row title={`${many && hit.day ? dateLabel(hit.day).replace(/ .*$/, "") + " " : ""}${hit.time}${isLate(hit.time) ? "（凌晨）" : ""}　${hit.cinema.name}`} subtitle={[hit.version.label, kmLabel(hit.km)].filter(Boolean).join("｜")} />
          </NavigationLink>
        )}
      </Section>
    )}
    {res.data?.noData?.length ? <Section footer={<Text>{`這幾間目前沒有所選日期的場次資料（來源還沒更新），請到影城官網查詢：${res.data.noData.join("、")}`}</Text>}><Label title={`${res.data.noData.length} 間影城沒有場次資料`} systemImage={"calendar.badge.exclamationmark"} foregroundStyle={"secondaryLabel"} /></Section> : null}
    {res.data?.failed.length ? <Section footer={<Text>{`讀取失敗：${res.data.failed.join("、")}`}</Text>}><Label title={`${res.data.failed.length} 間影城讀取失敗`} systemImage={"exclamationmark.triangle"} /></Section> : null}
  </List>
}

// ───────────────────────── 啟動 ─────────────────────────

async function run() {
  // 先讀設定再顯示畫面，避免還沒讀到就被預設值蓋掉
  store.settings = { ...store.settings, ...(await loadSettings()) }
  await Navigation.present({ element: <RootTabs /> })
  Script.exit()
}

run()
