// 🎬 電影行程（Scripting 原生介面版）
// 選影城 → 日期 → 電影 → 場次，或選電影 → 日期 → 影城 → 場次，一鍵加入 iOS 行事曆並設定提醒。
// 資料層（core.ts、parsers.ts…）與 Scriptable 版共用，原始碼：
// https://github.com/morgan91204/scriptable-movie-schedule

import {
  Button, ContentUnavailableView, Form, HStack, Image, Label, LabeledContent, List, Navigation, NavigationLink,
  NavigationStack, Picker, ProgressView, Script, Section, Spacer, Text, TextField, Toggle, VStack,
  useEffect, useMemo, useState,
} from "scripting"
import { setPlatform } from "./platform"
import { scriptingPlatform } from "./platform-scripting"
import {
  Cinema, Movie, Settings, Version, TwMovie, TwMovieCinema, CITY_ORDER, TW,
  todayTPE, nowHM, addDays, isLate, dateLabel, tpeDate, fmt, byShowtime,
  loadSettings, saveSettings, loadCinemas, datesOf, moviesOf, loadMovies, movieDay, cinemaAddress,
  FORMATS, formatsOf, filterVersions, nearest, kmLabel, WINDOWS, findShowtimes, groupByMovie, shareText, hallOf, tmdbTest, movieExtras,
} from "./core"
import type { Format, LatLng, Hit } from "./core"

declare const Safari: any
declare const Dialog: any
declare const Calendar: any
declare const CalendarEvent: any
declare const EventAlarm: any
declare const ShareSheet: any
declare const Location: any

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
      setData(await fn())
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

// ───────────────────────── 首頁 ─────────────────────────

function Home() {
  const dismiss = Navigation.useDismiss()
  const [settings, update] = useSettings()
  const [query, setQuery] = useState("")
  const [calendars, setCalendars] = useState<string[]>([])
  const cinemas = useLoad(async () => {
    store.cinemas = await loadCinemas()
    return store.cinemas
  }, [])

  useEffect(() => {
    ;(async () => {
      const list = (await Calendar.forEvents()).filter((c: any) => c.allowsContentModifications).map((c: any) => c.title)
      setCalendars(list)
      if (!store.settings.calendar) {
        const def = await Calendar.defaultForEvents()
        if (def) update({ calendar: def.title })
      }
    })()
  }, [])

  const list = cinemas.data || []
  const favs = settings.favorites.map((id) => list.find((c) => c.id === id)).filter(Boolean) as Cinema[]
  const cities = useMemo(() => sortCities(Array.from(new Set(list.map((c) => c.city)))), [list])
  const k = query.trim().toLowerCase().replace(/臺/g, "台")
  const hits = k ? list.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : []

  return <NavigationStack>
    <List
      navigationTitle={"電影行程"}
      searchable={{ value: query, onChanged: setQuery, prompt: "搜尋影城、分店或縣市" } as any}
      toolbar={{ cancellationAction: <Button title={"關閉"} action={dismiss} /> }}
    >
      {cinemas.error ? <ErrorRow error={cinemas.error} retry={cinemas.reload} /> : null}

      {k ? <Section header={<Text>{`搜尋結果 ${hits.length} 間`}</Text>}>
        {hits.map((c) => <CinemaLink key={c.id} cinema={c} />)}
      </Section> : <>
        <Section>
          <NavigationLink destination={<NowPage />}>
            <Label title={"現在有什麼可以看"} systemImage={"clock"} />
          </NavigationLink>
          <NavigationLink destination={<MoviesPage />}>
            <Label title={"依電影找場次"} systemImage={"film"} />
          </NavigationLink>
          <NavigationLink destination={<NearbyPage />}>
            <Label title={"附近的影城"} systemImage={"location"} />
          </NavigationLink>
        </Section>

        {!cinemas.data && !cinemas.error ? <Section><Loading text={"讀取影城清單…"} /></Section> : null}

        {favs.length ? <Section header={<Text>常去影城</Text>}>
          {favs.map((c) => <CinemaLink key={c.id} cinema={c} showCity />)}
        </Section> : null}

        {cinemas.data ? <Section header={<Text>{`全台影城（${list.length} 間）`}</Text>}>
          {cities.map((city) =>
            <NavigationLink key={city} destination={<CityPage city={city} />}>
              <Row title={city} trailing={`${list.filter((c) => c.city === city).length} 間`} />
            </NavigationLink>
          )}
        </Section> : null}

        <Section header={<Text>加入行事曆時</Text>} footer={<Text>{`場次資料來自場次通、開眼電影網，以及誠品、光點、樂聲官網，實際場次以影城公告為準。\n\n版本 ${appVersion()}`}</Text>}>
          <Picker title={"寫入的行事曆"} value={settings.calendar || ""} onChanged={(v: string) => update({ calendar: v })}>
            {calendars.map((t) => <Text key={t} tag={t}>{t}</Text>)}
          </Picker>
          <Picker title={"預留廣告預告"} value={settings.ads} onChanged={(v: number) => update({ ads: v })}>
            {ADS.map((m) => <Text key={m} tag={m}>{m ? `${m} 分鐘` : "不預留"}</Text>)}
          </Picker>
          <Picker title={"提醒"} value={settings.alarm ?? 30} onChanged={(v: number) => update({ alarm: v })}>
            {ALARMS.map((a) => <Text key={a.minutes} tag={a.minutes}>{a.label}</Text>)}
          </Picker>
          <NavigationLink destination={<TmdbPage />}>
            <Row title={"補片長（TMDB）"} trailing={settings.tmdbToken ? "已設定" : "未設定"} />
          </NavigationLink>
        </Section>
      </>}
    </List>
  </NavigationStack>
}

/** 電影海報＋YouTube 預告按鈕 */
function MovieHero({ title, slug }: { title: string; slug?: string }) {
  const x = useLoad(() => movieExtras(title, slug), [title, slug || ""])
  const url = x.data?.trailer || `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`
  return <Section>
    {x.data?.poster ? <HStack>
      <Spacer />
      <Image imageUrl={x.data.poster} resizable scaleToFit frame={{ width: 160, height: 240 }} placeholder={<ProgressView progressViewStyle={"circular"} />} />
      <Spacer />
    </HStack> : null}
    <Button title={x.data?.trailerName ? "觀看預告" : "搜尋 YouTube 預告"} systemImage={"play.rectangle.fill"} action={() => Safari.openURL(url)} />
  </Section>
}

function TmdbPage() {
  const [settings, update] = useSettings()
  const [token, setToken] = useState(settings.tmdbToken || "")
  const [status, setStatus] = useState("")
  const save = async () => {
    const t = token.trim()
    if (!t) {
      update({ tmdbToken: "" })
      setStatus("已清除，之後沒有片長的電影不會自動補。")
      return
    }
    setStatus("測試中…")
    try {
      const r = await tmdbTest(t)
      update({ tmdbToken: t })
      setStatus(`✅ 可以使用（測試：${r}）`)
    } catch (e) {
      setStatus(`❌ ${String((e as Error)?.message || e)}`)
    }
  }
  return <Form navigationTitle={"補片長（TMDB）"} navigationBarTitleDisplayMode={"inline"}>
    <Section footer={<Text>{"場次通的重映、修復版、演唱會有時沒有片長。填入你自己的 TMDB「API Read Access Token」後，會用片名到 TMDB 查片長自動補上（確認頁會註明「取自 TMDB」）。\n\n申請：themoviedb.org 免費註冊 → 設定 → API → 複製「API Read Access Token」（很長、eyJ 開頭的那串）。Token 只存在你的手機。"}</Text>}>
      <TextField title={"Token"} value={token} onChanged={setToken} prompt={"貼上 API Read Access Token"} />
      <Button title={"儲存並測試"} action={save} />
      {settings.tmdbToken ? <Button title={"清除 Token"} role={"destructive"} action={() => { setToken(""); update({ tmdbToken: "" }); setStatus("已清除。") }} /> : null}
    </Section>
    {status ? <Section><Text>{status}</Text></Section> : null}
  </Form>
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
    {address ? <Section><Label title={address} systemImage={"mappin.and.ellipse"} /></Section> : null}
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
      {info.data?.site ? <Button title={"影城官網"} systemImage={"house"} action={() => Safari.openURL(info.data!.site)} /> : null}
      <Button title={"在 Safari 開啟時刻表"} systemImage={"safari"} action={() => Safari.openURL(cinema.url)} />
    </Section>
  </List>
}

function DayPage({ cinema, date }: { cinema: Cinema; date: string }) {
  const day = useLoad(() => moviesOf(cinema, date), [cinema.id, date])
  const isToday = date === todayTPE()
  const now = nowHM()
  return <List navigationTitle={dateLabel(date)} navigationBarTitleDisplayMode={"inline"} refreshable={day.reload}>
    {day.error ? <ErrorRow error={day.error} retry={day.reload} /> : null}
    <Section header={<Text>{cinema.name}</Text>}>
      {!day.data && !day.error ? <Loading text={"讀取片單…"} /> : null}
      {day.data && !day.data.movies.length ? <Text foregroundStyle={"secondaryLabel"}>這天沒有可讀取的場次</Text> : null}
      {(day.data?.movies || []).map((m) => {
        const all = ([] as string[]).concat(...m.versions.map((v) => v.times))
        const left = isToday ? all.filter((t) => t > now || isLate(t)).length : all.length
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

function ShowtimesPage({ cinema, date, movie, ctx }: { cinema: Cinema; date: string; movie: Movie; ctx: Ctx }) {
  const [settings] = useSettings()
  const isToday = date === todayTPE()
  const now = nowHM()
  return <List navigationTitle={movie.title} navigationBarTitleDisplayMode={"inline"}>
    <MovieHero title={movie.title} />
    <Section>
      <LabeledContent title={"影城"} value={cinema.name} />
      <LabeledContent title={"日期"} value={dateLabel(date)} />
      <LabeledContent title={"片長"} value={movie.runtime ? `${movie.runtime} 分鐘` + (movie.runtimeFrom ? `（${movie.runtimeFrom}）` : "") : "未提供"} />
      {movie.rating ? <LabeledContent title={"分級"} value={movie.rating} /> : null}
    </Section>
    {movie.versions.map((v) =>
      <Section key={v.label} header={<Text>{v.label}</Text>}>
        {[...v.times].sort(byShowtime).map((t) => {
          const past = isToday && t <= now && !isLate(t)
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
  const start = tpeDate(isLate(pick.time) ? addDays(pick.date, 1) : pick.date, pick.time)
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

      const maps = `https://maps.apple.com/?q=${encodeURIComponent(pick.cinema.name)}${address ? "&address=" + encodeURIComponent(address) : ""}`
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
      <LabeledContent title={"影城"} value={pick.cinema.name} />
      {address ? <LabeledContent title={"地址"} value={address} /> : null}
      <LabeledContent title={"開演"} value={fmt(start)} />
      <LabeledContent title={"預計散場"} value={fmt(end).slice(-5)} />
    </Section>
    {isLate(pick.time) ? <Section footer={<Text>這是凌晨場：已自動算到隔天日期，請再核對電影票。</Text>}><Label title={"凌晨場"} systemImage={"moon.stars"} /></Section> : null}

    <Section header={<Text>可調整</Text>} footer={!pick.movie.runtime ? <Text>資料來源沒有提供片長，請手動輸入。</Text> : pick.movie.runtimeFrom ? <Text>{`片長取自 ${pick.movie.runtimeFrom}（重映片為原版片長），請再核對。`}</Text> : undefined}>
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
      <Button title={"分享這場給朋友"} systemImage={"square.and.arrow.up"}
        action={() => ShareSheet.present([shareText({ ...pick, address }, start, runtime ? end : undefined, seat.trim())])} />
    </Section>
  </Form>
}

// ───────────────────────── 依電影找 ─────────────────────────

function MoviesPage() {
  const movies = useLoad(() => loadMovies(), [])
  const [query, setQuery] = useState("")
  const k = query.trim().toLowerCase()
  const list = (movies.data || []).filter((m) => !k || `${m.title} ${m.en}`.toLowerCase().includes(k))
  const now = list.filter((m) => !m.comingSoon)
  const soon = list.filter((m) => m.comingSoon)
  const row = (m: TwMovie) =>
    <NavigationLink key={m.slug} destination={<MoviePage movie={m} />}>
      <Row title={m.title}
        subtitle={[m.rating, m.runtime ? `${m.runtime} 分` : "", m.en].filter(Boolean).join("｜")}
        trailing={m.cinemaCount ? `${m.cinemaCount} 間` : ""} />
    </NavigationLink>
  return <List
    navigationTitle={"依電影找場次"}
    searchable={{ value: query, onChanged: setQuery, prompt: "搜尋片名" } as any}
    refreshable={movies.reload}
  >
    {movies.error ? <ErrorRow error={movies.error} retry={movies.reload} /> : null}
    {!movies.data && !movies.error ? <Section><Loading text={"讀取電影清單…"} /></Section> : null}
    {now.length ? <Section header={<Text>{`上映中（${now.length}）`}</Text>} footer={<Text>依今天放映的影城數排序，資料來自場次通。</Text>}>{now.map(row)}</Section> : null}
    {soon.length ? <Section header={<Text>{`即將上映（${soon.length}）`}</Text>}>{soon.map(row)}</Section> : null}
  </List>
}

function MoviePage({ movie }: { movie: TwMovie }) {
  const [settings] = useSettings()
  const [date, setDate] = useState("")
  const [city, setCity] = useState("全部")
  const [onlyFav, setOnlyFav] = useState(false)
  const [format, setFormat] = useState<string>("")
  const day = useLoad(() => movieDay(movie.slug, date || undefined), [movie.slug, date])

  const data = day.data
  const dates = (data?.dates || []).filter((d) => d >= todayTPE())
  const cities = useMemo(() => sortCities(Array.from(new Set((data?.cinemas || []).map((c) => c.city)))), [data])
  const formats = FORMATS.filter((f) => (data?.cinemas || []).some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0)))
  const fmtSel = (formats as string[]).indexOf(format) >= 0 ? (format as Format) : ""
  const shown = (data?.cinemas || [])
    .map((c) => ({ ...c, versions: filterVersions(c.versions, fmtSel) }))
    .filter((c) => c.versions.length && (city === "全部" || c.city === city) && (!onlyFav || settings.favorites.indexOf(c.id) >= 0))
  const byCity = sortCities(Array.from(new Set(shown.map((c) => c.city))))
  const runtime = data?.runtime || movie.runtime

  const toCinema = (c: TwMovieCinema): Cinema =>
    store.cinemas.find((x) => x.id === c.id) ||
    { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address }

  return <List navigationTitle={movie.title} navigationBarTitleDisplayMode={"inline"} refreshable={day.reload}>
    <MovieHero title={movie.title} slug={movie.slug} />
    <Section footer={<Text>{[movie.en, movie.rating || data?.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜")}</Text>}>
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
            <ShowtimesPage cinema={toCinema(c)} date={d} movie={m}
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
    {res.data?.failed.length ? <Section footer={<Text>{`讀取失敗：${res.data.failed.join("、")}`}</Text>}><Label title={`${res.data.failed.length} 間影城讀取失敗`} systemImage={"exclamationmark.triangle"} /></Section> : null}
  </List>
}

// ───────────────────────── 啟動 ─────────────────────────

async function run() {
  // 先讀設定再顯示畫面，避免還沒讀到就被預設值蓋掉
  store.settings = { ...store.settings, ...(await loadSettings()) }
  await Navigation.present({ element: <Home /> })
  Script.exit()
}

run()
