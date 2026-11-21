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
  FORMATS, formatsOf, filterVersions, nearest, kmLabel, WINDOWS, findShowtimes, groupByMovie, fillMovieDay, movieDayFilled, movieCinemaVersions, showDay, lateIsTonight, shareText, hallOf, tmdbTest, movieExtras, moviePoster, posterReady, posterTint, POSTER_TINTS, normImageUrl, movieRuntime, posterSrc, isLocalSrc, cachePoster, prefetchPosters, movieSubtitle, releaseLabel, releaseOf, boxOfficeLines, boxOfficeNote, foregroundTask, communityStats, communityVote, loadBoxOffice, money, matchBoxOffice, boxOfficeLabel, mapsUrl, MAPS_LABEL, TMDB_LINKS, extractTmdbKey, cinemaApp, bookingUrl, checkLatest, SCRIPTING_IMPORT_URL, movieRatings, ratingTier,
} from "./core"
import type { Format, LatLng, Hit, Community, BoxOfficeItem } from "./core"

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
    <Section header={<Text>加入行事曆時</Text>}>
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
    <Section footer={<Text>場次資料來自場次通、開眼電影網，以及誠品、光點、樂聲官網，實際場次以影城公告為準。</Text>}>
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

        {favs.length ? <Section header={<Text>常去影城</Text>} footer={<Text>在影城頁可以加入或移除常去影城。影城搜尋在「影城」分頁，行事曆與提醒在「設定」分頁。</Text>}>
          {favs.map((c) => <CinemaLink key={c.id} cinema={c} showCity />)}
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
  const starIcon = (i: number) => (avg >= i - 0.25 ? "star.fill" : avg >= i - 0.75 ? "star.leadinghalf.filled" : "star")
  const status = c ? (n ? `${n} 人評分` : "還沒有人評分，來當第一個") : load.error ? "觀眾評分暫時讀不到" : "讀取中…"
  return <Section header={<Text>觀眾評分</Text>} footer={<Text>匿名評分，一台手機一票，可以隨時更改；點已選的星星可以取消。兩個版本的評分會一起統計。</Text>}>
    <HStack spacing={14}>
      <Text font={"largeTitle"} fontWeight={"bold"} monospacedDigit>{n ? avg.toFixed(1) : "-"}</Text>
      <VStack alignment={"leading"} spacing={4}>
        <HStack spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => <Image key={i} systemName={starIcon(i)} foregroundStyle={n ? "systemOrange" : "tertiaryLabel"} font={"subheadline"} />)}
        </HStack>
        <Text font={"caption"} foregroundStyle={"secondaryLabel"}>{status}</Text>
      </VStack>
      <Spacer />
      {load.error && !c ? <Button title={"重試"} action={load.reload} buttonStyle={"plain"} foregroundStyle={"systemBlue"} /> : null}
    </HStack>
    <HStack>
      <Text>{mine ? `你給 ${mine} 星` : "點星星評分"}</Text>
      <Spacer />
      {[1, 2, 3, 4, 5].map((s) =>
        <Button key={s} action={() => vote(s)} buttonStyle={"plain"} disabled={busy || !c}>
          <Image systemName={s <= mine ? "star.fill" : "star"} foregroundStyle={s <= mine ? "systemOrange" : "tertiaryLabel"} font={"title2"} />
        </Button>
      )}
    </HStack>
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
function useThumbs(items: { title: string; slug?: string; en?: string }[], key: string): (m: { title: string; slug?: string }) => { img: any; why: string; pending: boolean } {
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
          const u = normImageUrl((await moviePoster(m.title, m.slug, m.en)) || "")
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

/** 開啟時檢查新版：有新版就問要不要更新（同一個新版只問一次） */
function useUpdatePrompt() {
  useEffect(() => {
    ;(async () => {
      const r = await checkLatest(appVersion())
      if (!r || r.isLatest) return
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
  return <List navigationTitle={x.name} navigationBarTitleDisplayMode={"inline"}>
    <MovieHero title={x.name} lines={[x.country, `${date} 上映`]} />
    <Section header={<Text>{`票房第 ${x.rank} 名`}</Text>} footer={<Text>資料來源：國家電影及視聽文化中心「全國電影票房統計」。場次通目前沒有這部片的場次，可能已經下檔，或只在少數戲院放映。</Text>}>
      {x.week !== null && !x.since ? <LabeledContent title={"本週票房"} value={money(x.week)} /> : null}
      <LabeledContent title={"累計票房"} value={money(x.total)} />
      {x.theaters ? <LabeledContent title={"上映戲院"} value={`${x.theaters} 間`} /> : null}
      <LabeledContent title={"上映日期"} value={date} />
    </Section>
  </List>
}

/** 票房排行（官方開放資料，每週更新）；每一部都可以點：有場次的進電影頁，沒有的進精簡頁 */
function BoxOfficeSections({ movies, query }: { movies: TwMovie[]; query: string }) {
  const box = useLoad(() => loadBoxOffice(), [])
  const b = box.data
  // 搜尋片名：中文片名或對得到的英文片名
  const shown = (b?.list || []).filter((x) => !query || `${x.name} ${matchBoxOffice(x.name, movies)?.en || ""}`.toLowerCase().includes(query))
  const films = shown.map((x) => { const m = matchBoxOffice(x.name, movies); return { title: m ? m.title : x.name, slug: m?.slug, en: m?.en } })
  const thumbOf = useThumbs(films, `${b ? b.list.length : 0}|${movies.length}|${query}`)
  if (box.error) return <ErrorRow error={box.error} retry={box.reload} />
  if (!b) return <Section><Loading text={"讀取票房排行…"} /></Section>
  const thumbs = films.map(thumbOf)
  const bad = shown.filter((_, i) => thumbs[i].why)
  const failNote = bad.length
    ? `\n第 ${bad.map((x) => x.rank).join("、")} 名的海報讀不到（${Array.from(new Set(thumbs.map((t) => t.why).filter(Boolean))).join("；")}），下次進來會再試。`
    : ""
  return <Section header={<Text>{boxOfficeLabel(b)}</Text>} footer={<Text>{`${shown.length ? "" : "排行上找不到相符的電影。\n"}這週有賣出票的電影共 ${b.list.length} 部。${boxOfficeNote(b)}資料來源：${b.source}。官方每週更新一次。${failNote}`}</Text>}>
    {shown.map((x, i) => {
      const m = matchBoxOffice(x.name, movies)
      const lines = boxOfficeLines(x)
      const body = <HStack spacing={10}>
        <Text font={x.rank >= 100 ? "subheadline" : "title3"} fontWeight={"bold"} monospacedDigit foregroundStyle={x.rank <= 3 ? "systemOrange" : "secondaryLabel"} lineLimit={1} minScaleFactor={0.6} frame={{ width: 34 }}>{String(x.rank)}</Text>
        {PosterBox({ w: 44, h: 66, r: 6, img: thumbs[i].img, ver: 0, pending: thumbs[i].pending, title: x.name })}
        <VStack alignment={"leading"} spacing={2}>
          <Text foregroundStyle={"label"} lineLimit={2}>{x.name}</Text>
          {/* 第一行金額、第二行上映日期與戲院數：各自一行不換行，窄螢幕也對得齊 */}
          <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={1} minScaleFactor={0.8}>{lines[0]}</Text>
          {lines[1] ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"} lineLimit={1} minScaleFactor={0.8}>{lines[1]}</Text> : null}
        </VStack>
        <Spacer />
      </HStack>
      return <NavigationLink key={x.rank} destination={m ? <MoviePage movie={m} /> : <BoxOfficeMoviePage item={x} />}>{body}</NavigationLink>
    })}
  </Section>
}

function MoviesPage() {
  const movies = useLoad(() => loadMovies(), [])
  const [mode, setMode] = useState<string>("now")
  const [query, setQuery] = useState("")
  const k = query.trim().toLowerCase()
  const list = (movies.data || []).filter((m) => (mode === "box" || !!m.comingSoon === (mode === "soon")) && (!k || `${m.title} ${m.en}`.toLowerCase().includes(k)))
  useEffect(() => { if (movies.data) prefetchPosters(list) }, [movies.data, k, mode]) // 背景先抓海報，進電影頁就不用等
  const now = list.filter((m) => !m.comingSoon)
  const soon = list.filter((m) => m.comingSoon)
  const thumbOf = useThumbs(mode === "box" ? [] : list, `${(movies.data || []).length}|${k}|${mode}`) // 每一列的小海報
  const row = (m: TwMovie) => {
    const t = thumbOf(m)
    return <NavigationLink key={m.slug} destination={<MoviePage movie={m} />}>
      <HStack spacing={10}>
        {PosterBox({ w: 44, h: 66, r: 6, img: t.img, ver: 0, pending: t.pending, title: m.title })}
        <VStack alignment={"leading"} spacing={2}>
          <Text foregroundStyle={"label"} lineLimit={2}>{m.title}</Text>
          <Text font={"subheadline"} foregroundStyle={"secondaryLabel"} lineLimit={2}>{movieSubtitle(m)}</Text>
        </VStack>
        <Spacer />
        {m.cinemaCount ? <Text font={"caption"} foregroundStyle={"tertiaryLabel"}>{`${m.cinemaCount} 間`}</Text> : null}
      </HStack>
    </NavigationLink>
  }
  return <List
    navigationTitle={"依電影找場次"}
    searchable={{ value: query, onChanged: setQuery, prompt: "搜尋片名" } as any}
    refreshable={movies.reload}
  >
    <Section>
      <Picker title={"顯示"} value={mode} onChanged={(v: string) => setMode(v)} pickerStyle={"segmented"}>
        <Text tag={"now"}>上映中</Text>
        <Text tag={"box"}>票房排行</Text>
        <Text tag={"soon"}>即將上映</Text>
      </Picker>
    </Section>
    {mode === "box" ? <BoxOfficeSections movies={movies.data || []} query={k} /> : <>
      {movies.error ? <ErrorRow error={movies.error} retry={movies.reload} /> : null}
      {!movies.data && !movies.error ? <Section><Loading text={"讀取電影清單…"} /></Section> : null}
      {now.length ? <Section header={<Text>{`上映中（${now.length}）`}</Text>} footer={<Text>依今天放映的影城數排序；今天沒有場次、過幾天才有的排在最後。資料來自場次通。</Text>}>{now.map(row)}</Section> : null}
      {soon.length ? <Section header={<Text>{`即將上映（${soon.length}）`}</Text>} footer={<Text>還沒上映、但已經可以查到場次的片，依上映日期排序。</Text>}>{soon.map(row)}</Section> : null}
    </>}
  </List>
}

function MoviePage({ movie }: { movie: TwMovie }) {
  const [settings] = useSettings()
  const [date, setDate] = useState("")
  const [city, setCity] = useState("全部")
  const [onlyFav, setOnlyFav] = useState(false)
  const [format, setFormat] = useState<string>("")
  const day = useLoad(() => movieDay(movie.slug, date || undefined), [movie.slug, date])
  const [, setFilled] = useState(0)

  const data = day.data
  // 電影頁每間影城只列一種版本：把目前顯示的影城從影城頁補齊，補好後重畫
  useEffect(() => {
    if (!data) return
    let alive = true
    const ids = data.cinemas.filter((c) => city === "全部" || c.city === city).map((c) => c.id)
    if (!movieDayFilled(data, ids)) fillMovieDay(data, ids).then(() => { if (alive) setFilled((n) => n + 1) }).catch(() => {})
    return () => { alive = false }
  }, [data, city])
  const dates = (data?.dates || []).filter((d) => d >= todayTPE())
  const cities = useMemo(() => sortCities(Array.from(new Set((data?.cinemas || []).map((c) => c.city)))), [data])
  const formats = FORMATS.filter((f) => (data?.cinemas || []).some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0)))
  const fmtSel = (formats as string[]).indexOf(format) >= 0 ? (format as Format) : ""
  const shown = (data?.cinemas || [])
    .map((c) => ({ ...c, versions: filterVersions(c.versions, fmtSel) }))
    .filter((c) => c.versions.length && (city === "全部" || c.city === city) && (!onlyFav || settings.favorites.indexOf(c.id) >= 0))
  const byCity = sortCities(Array.from(new Set(shown.map((c) => c.city))))
  const rt = useLoad(() => (data?.runtime || movie.runtime ? Promise.resolve(null) : movieRuntime(movie.title, movie.slug, movie.en)), [movie.slug, data ? 1 : 0]) // 來源沒給片長：查 TMDB／開眼補上
  const runtime = data?.runtime || movie.runtime || rt.data?.runtime || 0
  if (rt.data && !movie.runtime) { movie.runtime = rt.data.runtime; movie.runtimeFrom = rt.data.from }

  const toCinema = (c: TwMovieCinema): Cinema =>
    store.cinemas.find((x) => x.id === c.id) ||
    { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address }

  return <List navigationTitle={movie.title} navigationBarTitleDisplayMode={"inline"} refreshable={day.reload}>
    <MovieHero title={movie.title} slug={movie.slug} en={movie.en} lines={[
      movie.en,
      [movie.rating || data?.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"),
      releaseLabel(data?.release || movie.release || releaseOf(movie.title)),
      data ? `${data.cinemas.length} 間影城有放映` : "",
    ]} />
    <Section>
      <Picker title={"日期"} value={date || data?.date || ""} onChanged={setDate}>
        {(dates.length ? dates : [data?.date || todayTPE()]).map((d) => <Text key={d} tag={d}>{dateLabel(d)}</Text>)}
      </Picker>
      <Picker title={"縣市"} value={city} onChanged={setCity}>
        {["全部", ...cities].map((c) => <Text key={c} tag={c}>{c}</Text>)}
      </Picker>
      {formats.length ? <Picker title={"特殊廳"} value={fmtSel} onChanged={setFormat}>
        {["", ...formats].map((f) => <Text key={f || "all"} tag={f}>{f || "全部"}</Text>)}
      </Picker> : null}
      <Toggle title={"只看常去影城"} value={onlyFav} onChanged={setOnlyFav} />
    </Section>

    {day.error ? <ErrorRow error={day.error} retry={day.reload} /> : null}
    {!data && !day.error ? <Section><Loading text={"讀取放映影城…"} /></Section> : null}
    {data && !shown.length ? <Section><Text foregroundStyle={"secondaryLabel"}>這天沒有符合條件的影城</Text></Section> : null}

    {byCity.map((ct) =>
      <Section key={ct} header={<Text>{`${ct}（${shown.filter((c) => c.city === ct).length} 間）`}</Text>}>
        {shown.filter((c) => c.city === ct).map((c) => {
          const m: Movie = { title: data!.title || movie.title, runtime, rating: data!.rating || movie.rating, versions: c.versions, runtimeFrom: data?.runtime ? data.runtimeFrom : movie.runtimeFrom }
          const d = data!.date
          const summary = c.versions.map((v) => `${v.label} ${[...v.times].sort(byShowtime).join(" ")}`).join("／")
          return <NavigationLink key={c.id} destination={
            <ShowtimesPage cinema={toCinema(c)} date={d} movie={m} complete
              ctx={{ booking: "", sourceUrl: `${TW}/cinemas/${c.id}/${d}/`, address: c.address }} />
          }>
            <Row title={(settings.favorites.indexOf(c.id) >= 0 ? "★ " : "") + c.name} subtitle={summary} />
          </NavigationLink>
        })}
      </Section>
    )}
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

function NowPage() {
  const [settings] = useSettings()
  const today = todayTPE()
  const [date, setDate] = useState(today)
  const [winId, setWinId] = useState("soon")
  const [scope, setScope] = useState("fav")
  const [format, setFormat] = useState("")
  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(today, i))
  const wins = WINDOWS.filter((w) => !w.todayOnly || date === today)
  const win = wins.find((w) => w.id === winId) || wins[0]
  const cities = sortCities(Array.from(new Set(store.cinemas.map((c) => c.city))))
  return <Form navigationTitle={"現在有什麼可以看"} navigationBarTitleDisplayMode={"inline"}>
    <Section footer={<Text>縣市的影城較多，查詢會比較久。開眼來源的戲院通常只有今天的場次。</Text>}>
      <Picker title={"日期"} value={date} onChanged={setDate}>
        {dates.map((d) => <Text key={d} tag={d}>{dateLabel(d)}</Text>)}
      </Picker>
      <Picker title={"開演時段"} value={win.id} onChanged={setWinId}>
        {wins.map((w) => <Text key={w.id} tag={w.id}>{w.label}</Text>)}
      </Picker>
      <Picker title={"找哪些影城"} value={scope} onChanged={setScope}>
        <Text tag={"fav"}>{`常去影城（${settings.favorites.length}）`}</Text>
        <Text tag={"near"}>附近 10 間</Text>
        {cities.map((c) => <Text key={c} tag={c}>{c}</Text>)}
      </Picker>
      <Picker title={"特殊廳"} value={format} onChanged={setFormat}>
        {["", ...FORMATS].map((f) => <Text key={f || "all"} tag={f}>{f || "不限"}</Text>)}
      </Picker>
    </Section>
    <Section>
      <NavigationLink destination={<NowResultsPage date={date} winId={win.id} scope={scope} format={format as Format | ""} />}>
        <Label title={"找場次"} systemImage={"magnifyingglass"} />
      </NavigationLink>
    </Section>
  </Form>
}

function NowResultsPage({ date, winId, scope, format }: { date: string; winId: string; scope: string; format: Format | "" }) {
  const [progress, setProgress] = useState("")
  const win = WINDOWS.find((w) => w.id === winId) || WINDOWS[0]
  const res = useLoad(async () => {
    if (!store.cinemas.length) store.cinemas = await loadCinemas()
    let list: { cinema: Cinema; km: number | null }[]
    if (scope === "near") list = nearest(store.cinemas, await locate(), 10)
    else if (scope === "fav") list = store.settings.favorites.map((id) => store.cinemas.find((c) => c.id === id)).filter(Boolean).map((c) => ({ cinema: c as Cinema, km: null }))
    else list = store.cinemas.filter((c) => c.city === scope).map((c) => ({ cinema: c, km: null }))
    if (!list.length) throw new Error("沒有可以查的影城。先在影城頁加入常去影城，或改選附近／縣市。")
    return await findShowtimes(list, date, win, format, (d, t) => setProgress(`已查 ${d} / ${t} 間`))
  }, [date, winId, scope, format])
  const groups = res.data ? groupByMovie(res.data.hits) : []
  useEffect(() => { if (res.data) prefetchPosters(groups) }, [res.data]) // 背景先抓海報，進電影頁就不用等
  const scopeLabel = scope === "fav" ? "常去影城" : scope === "near" ? "附近 10 間" : scope
  return <List navigationTitle={`${dateLabel(date).replace(/ .*$/, "")} ${win.label}`} navigationBarTitleDisplayMode={"inline"} refreshable={res.reload}>
    {res.error ? <ErrorRow error={res.error} retry={res.reload} /> : null}
    {!res.data && !res.error ? <Section><Loading text={`查詢${scopeLabel}的場次… ${progress}`} /></Section> : null}
    {res.data && !groups.length ? <Section><Text foregroundStyle={"secondaryLabel"}>這個時段沒有符合的場次，換個時段或範圍試試。</Text></Section> : null}
    {groups.map((g) =>
      <Section key={g.title}
        header={<Text>{`${g.title}（${g.hits.length} 場）`}</Text>}
        footer={g.runtime || g.rating ? <Text>{[g.runtime ? `${g.runtime} 分鐘` : "", g.rating].filter(Boolean).join("｜")}</Text> : undefined}>
        {g.hits.map((hit: Hit) =>
          <NavigationLink key={`${hit.cinema.id}-${hit.version.label}-${hit.time}`} destination={
            <ConfirmPage pick={{ cinema: hit.cinema, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time, ...hit.ctx }} />
          }>
            <Row title={`${hit.time}${isLate(hit.time) ? "（凌晨）" : ""}　${hit.cinema.name}`} subtitle={[hit.version.label, kmLabel(hit.km)].filter(Boolean).join("｜")} />
          </NavigationLink>
        )}
      </Section>
    )}
    {res.data?.noData?.length ? <Section footer={<Text>{`這幾間目前沒有這天的場次資料（來源還沒更新），請到影城官網查詢：${res.data.noData.join("、")}`}</Text>}><Label title={`${res.data.noData.length} 間影城今天沒有場次資料`} systemImage={"calendar.badge.exclamationmark"} foregroundStyle={"secondaryLabel"} /></Section> : null}
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
