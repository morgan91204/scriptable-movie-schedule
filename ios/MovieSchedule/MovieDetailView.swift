import SwiftUI

/// 電影頁頂端：海報在左，資訊、三大評分與預告按鈕在右
struct MovieHero: View {
    let title: String
    var slug: String? = nil
    var en: String? = nil
    let lines: [String]

    @Environment(\.openURL) private var openURL
    @State private var extras: MovieExtras?
    @State private var ratings: Ratings?
    @State private var ratingsDone = false
    @State private var opening = false
    private let showScores = ExternalScores.enabled

    /// 到外部網站查這部片的評分（用英文片名搜尋，沒有就用中文）
    private func linkChip(_ name: String, _ base: String) -> some View {
        let q = ((en ?? "").isEmpty ? title : (en ?? "")).addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? ""
        return Button {
            if let u = URL(string: base + q) { openURL(u) }
        } label: {
            HStack(spacing: 3) {
                Text(name).font(.caption.weight(.semibold))
                Image(systemName: "arrow.up.right").font(.system(size: 9, weight: .bold))
            }
            .fixedSize()
            .padding(.horizontal, 7).padding(.vertical, 4)
            .background(Color(.tertiarySystemFill), in: RoundedRectangle(cornerRadius: 6))
        }
        .buttonStyle(.plain)
        .foregroundStyle(.secondary)
    }

    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            PosterView(title: title, slug: slug, en: en, width: 104)
            VStack(alignment: .leading, spacing: 5) {
                ForEach(lines.filter { !$0.isEmpty }, id: \.self) { line in
                    Text(line).font(.subheadline).foregroundStyle(.secondary)
                }
                if !showScores {
                    // 不顯示外部分數：只放前往查看的連結（用片名搜尋，不讀對方網站）
                    HStack(spacing: 6) {
                        linkChip("IMDb", "https://www.imdb.com/find/?q=")
                        linkChip("爛番茄", "https://www.rottentomatoes.com/search?search=")
                    }
                } else if ratingsDone {
                    HStack(spacing: 4) {
                        badge(tag: "IMDb", text: ratings?.imdb.map { String(format: "%.1f", $0.score) }, percent: ratings?.imdb.map { $0.score * 10 }, url: ratings?.imdb?.url)
                        badge(tag: "🍅", text: ratings?.tomato.map { "\(Int($0.score))%" }, percent: ratings?.tomato?.score, url: ratings?.tomato?.url)
                        badge(tag: "🍿", text: ratings?.popcorn.map { "\(Int($0.score))%" }, percent: ratings?.popcorn?.score, url: ratings?.popcorn?.url)
                    }
                } else {
                    Text("評分讀取中…").font(.caption).foregroundStyle(.tertiary)
                }
                Button {
                    Task { await openTrailer() }
                } label: {
                    Label(opening ? "預告讀取中…" : "觀看預告", systemImage: "play.fill")
                        .font(.subheadline.weight(.semibold)).lineLimit(1)
                        .foregroundStyle(.white) // 列表裡的圖示預設會染成藍色
                }
                .buttonStyle(.borderedProminent).buttonBorderShape(.capsule).tint(.red)
                .disabled(opening)
                .padding(.top, 4)
            }
            Spacer(minLength: 0)
        }
        .listRowBackground(Color.clear)
        .task(id: title) { await load() }
    }

    /// 評分徽章：沒有那項評分顯示「-」（灰色、不能點）
    private func badge(tag: String, text: String?, percent: Double?, url: String?) -> some View {
        let color = percent.map { Tier.color($0) } ?? Color.secondary
        return Button {
            if let url, let u = URL(string: url) { openURL(u) }
        } label: {
            HStack(spacing: 3) {
                if tag == "IMDb" {
                    Text(tag).font(.system(size: 10, weight: .heavy)).foregroundStyle(.black)
                        .padding(.horizontal, 3).padding(.vertical, 1)
                        .background(text == nil ? Color(.systemGray3) : Color(red: 0.96, green: 0.77, blue: 0.09), in: RoundedRectangle(cornerRadius: 3))
                } else {
                    Text(tag).font(.caption2).grayscale(text == nil ? 1 : 0)
                }
                Text(text ?? "-").font(.caption.bold()).monospacedDigit().foregroundStyle(color)
            }
            .fixedSize()
            .padding(.horizontal, 5).padding(.vertical, 3)
            .background(color.opacity(0.16), in: RoundedRectangle(cornerRadius: 6))
        }
        .buttonStyle(.plain)
        .disabled(url == nil)
    }

    private func load() async {
        async let x = try? Bridge.shared.call("movieExtras", [title, js(slug)], as: MovieExtras.self)
        if showScores {
            async let r = try? Bridge.shared.call("movieRatings", [title, js(en), js(slug)], as: Ratings.self)
            ratings = await r
            ratingsDone = true
        }
        extras = await x
    }

    private func openTrailer() async {
        var x = extras
        if x == nil {
            opening = true
            x = try? await Bridge.shared.call("movieExtras", [title, js(slug)], as: MovieExtras.self)
            extras = x
            opening = false
        }
        let search = "https://www.youtube.com/results?search_query=" + ((title + " 預告").addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")
        if let u = URL(string: x?.trailer ?? search) { openURL(u) }
    }
}

/// 一部電影：選日期、縣市，看哪些影城有放
struct MovieDetailView: View {
    let movie: TwMovie

    @State private var day: Loadable<TwMovieDay> = .loading
    @State private var date = ""
    @State private var city = "全部"
    @State private var filledRuntime: RuntimeInfo?

    var body: some View {
        List {
            let data = day.value
            let runtime = (data?.runtime ?? 0) > 0 ? (data?.runtime ?? 0) : (movie.runtime ?? 0) > 0 ? (movie.runtime ?? 0) : (filledRuntime?.runtime ?? 0)
            Section {
                MovieHero(title: movie.title, slug: movie.slug, en: movie.en, lines: [
                    movie.en ?? "",
                    [movie.rating ?? data?.rating ?? "", runtime > 0 ? "\(runtime) 分鐘" : ""].filter { !$0.isEmpty }.joined(separator: "｜"),
                    Fmt.release(data?.release ?? movie.release),
                    data.map { "\($0.cinemas.count) 間影城有放映" } ?? "",
                ])
            }
            CommunitySection(title: movie.title)
            switch day {
            case .loading:
                Section { LoadingRow(text: "讀取放映影城…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let d):
                let dates = d.dates.filter { $0 >= Fmt.today() }
                let cities = Fmt.sortCities(Array(Set(d.cinemas.map { $0.city })))
                Section {
                    Picker("日期", selection: $date) {
                        // 目前顯示的那天一定要在選項裡（剛過午夜時，來源的「今天」可能還是前一天）
                        ForEach(dates.contains(d.date) ? dates : [d.date] + dates, id: \.self) { Text(Fmt.dateLabel($0)).tag($0) }
                    }
                    Picker("縣市", selection: $city) {
                        Text("全部").tag("全部")
                        ForEach(cities, id: \.self) { Text($0).tag($0) }
                    }
                }
                let shown = d.cinemas.filter { city == "全部" || $0.city == city }
                if shown.isEmpty {
                    Section { Text("這天沒有場次").foregroundStyle(.secondary) }
                }
                ForEach(Fmt.sortCities(Array(Set(shown.map { $0.city }))), id: \.self) { c in
                    let rows = shown.filter { $0.city == c }
                    Section("\(c)（\(rows.count) 間）") {
                        ForEach(rows) { cinema in
                            NavigationLink {
                                TimesView(title: d.title, runtime: runtime, cinemaName: cinema.name, address: cinema.address ?? "", date: d.date, versions: cinema.versions, bookingUrl: "",
                                          cinema: Cinema(id: cinema.id, name: cinema.name, city: cinema.city, district: cinema.district, source: "tw", url: "https://twshowtimes.com/cinemas/\(cinema.id)/", address: (cinema.address ?? "").isEmpty ? nil : cinema.address, aliases: nil),
                                          complete: true)
                            } label: {
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(cinema.name)
                                    ForEach(cinema.versions, id: \.self) { v in
                                        Text("\(v.label) \(v.times.joined(separator: " "))").font(.subheadline).foregroundStyle(.secondary).lineLimit(2)
                                    }
                                }
                            }
                            .accessibilityIdentifier("movie-cinema-row")
                        }
                    }
                }
            }
        }
        .navigationTitle(movie.title)
        .navigationBarTitleDisplayMode(.inline)
        .task { if day.value == nil { await load() } }
        .onChange(of: date) { _, new in
            if let d = day.value, new != d.date, !new.isEmpty { Task { await load(new) } }
        }
        .task(id: "\(day.value?.date ?? "")|\(city)") { await fill() }
    }

    /// 電影頁每間影城只列一種版本：把目前顯示的影城從影城頁補齊（一次 12 間，補好一批就更新畫面）
    private func fill() async {
        guard let d = day.value else { return }
        let ids = d.cinemas.filter { (city == "全部" || $0.city == city) && !($0.full ?? false) }.map { $0.id }
        var start = 0
        while start < ids.count {
            if Task.isCancelled { return }
            let chunk = Array(ids[start..<min(start + 12, ids.count)])
            start += 12
            guard let updated: TwMovieDay = try? await Bridge.shared.call("fillMovie", [movie.slug, d.date, chunk]) else { continue }
            if Task.isCancelled { return }
            if day.value?.date == updated.date { day = .loaded(updated) }
        }
    }

    private func load(_ target: String? = nil) async {
        do {
            let d: TwMovieDay = try await Bridge.shared.call("movieDay", [movie.slug, js(target)])
            day = .loaded(d)
            date = d.date
            if (d.runtime ?? 0) == 0 && (movie.runtime ?? 0) == 0 && filledRuntime == nil {
                filledRuntime = try? await Bridge.shared.callOptional("movieRuntime", [movie.title, movie.slug, js(movie.en)])
            }
        } catch {
            if day.value == nil { day = .failed(errorText(error)) }
        }
    }
}

/// 選場次：各版本的時間按鈕
struct TimesView: View {
    let title: String
    let runtime: Int
    let cinemaName: String
    let address: String
    let date: String
    let versions: [ShowVersion]
    let bookingUrl: String
    var cinema: Cinema? = nil
    /// 從電影頁進來時，傳進來的可能只有一種版本：進來後再讀影城頁補齊
    var complete = false
    @State private var fullVersions: [ShowVersion]?

    var body: some View {
        // 用 ScrollView 而不是 List：一列裡有很多個時間按鈕，List 會把整列當成一個可點的項目
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.title3.bold())
                    Text("\(cinemaName)｜\(Fmt.dateLabel(date))").font(.subheadline).foregroundStyle(.secondary)
                }
                ForEach(fullVersions ?? versions, id: \.self) { v in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(v.label).font(.headline)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 76), spacing: 8)], spacing: 8) {
                            ForEach(v.times, id: \.self) { t in
                                NavigationLink {
                                    ConfirmView(pick: ShowPick(title: title, versionLabel: v.label, cinemaName: cinemaName, address: address, date: date, time: t, runtime: runtime, bookingUrl: bookingUrl, cinema: cinema))
                                } label: {
                                    Text(t).font(.body.monospacedDigit().weight(.semibold))
                                        .frame(maxWidth: .infinity).padding(.vertical, 10)
                                        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 10))
                                }
                                .buttonStyle(.plain)
                                .accessibilityIdentifier("time-button")
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .task {
            guard complete, let cinema, cinema.source == "tw" else { return }
            let count: ([ShowVersion]) -> Int = { $0.reduce(0) { $0 + $1.times.count } }
            if let v: [ShowVersion] = try? await Bridge.shared.callOptional("movieCinemaVersions", [Bridge.json(cinema), date, title]), count(v) > count(versions) {
                fullVersions = v
            }
        }
        .navigationTitle("選場次")
        .navigationBarTitleDisplayMode(.inline)
    }
}
