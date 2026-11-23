import SwiftUI

/// 三大評分徽章（IMDb、番茄、爆米花）：電影頁和影展片共用同一個樣式。沒有那項評分顯示「-」
struct RatingBadges: View {
    let title: String
    var slug: String? = nil
    var en: String? = nil

    @Environment(\.openURL) private var openURL
    @State private var ratings: Ratings?
    @State private var ratingsDone = false
    private let showScores = ExternalScores.enabled

    var body: some View {
        Group {
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
        }
        .task(id: title) {
            guard showScores else { return }
            ratings = try? await Bridge.shared.call("movieRatings", [title, js(en), js(slug)], as: Ratings.self)
            ratingsDone = true
        }
    }

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
}

/// 電影頁頂端：海報在左，資訊、三大評分與預告按鈕在右
struct MovieHero: View {
    let title: String
    var slug: String? = nil
    var en: String? = nil
    let lines: [String]

    @Environment(\.openURL) private var openURL
    @State private var extras: MovieExtras?
    @State private var opening = false

    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            PosterView(title: title, slug: slug, en: en, width: 104)
            VStack(alignment: .leading, spacing: 5) {
                ForEach(lines.filter { !$0.isEmpty }, id: \.self) { line in
                    Text(line).font(.subheadline).foregroundStyle(.secondary)
                }
                RatingBadges(title: title, slug: slug, en: en)
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

    private func load() async {
        extras = try? await Bridge.shared.call("movieExtras", [title, js(slug)], as: MovieExtras.self)
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

/// 一部電影：選日期、縣市、特殊廳（都可以複選），看哪些影城有放
struct MovieDetailView: View {
    let movie: TwMovie

    @ObservedObject private var settings = SettingsStore.shared
    @State private var board: Loadable<MovieBoard> = .loading
    @State private var dates: Set<String> = []     // 空 = 來源預設的那一天
    @State private var cities: Set<String> = []    // 空 = 全部
    @State private var formats: Set<String> = []   // 空 = 全部
    @State private var onlyFav = false
    @State private var filledRuntime: RuntimeInfo?

    private func short(_ d: String) -> String {
        let p = d.split(separator: "-").compactMap { Int($0) }
        return p.count == 3 ? "\(p[1])/\(p[2])" : d
    }
    /// 一組可以複選的選項：點開選單，每個選項點一下打勾、再點一下取消（選單不會關掉）
    private func multiMenu(_ title: String, summary: String, @ViewBuilder content: () -> some View) -> some View {
        Menu {
            content()
        } label: {
            HStack {
                Text(title).foregroundStyle(Color.primary)
                Spacer()
                Text(summary).foregroundStyle(.secondary).lineLimit(1)
                Image(systemName: "chevron.up.chevron.down").font(.caption).foregroundStyle(.tertiary)
            }
        }
        .menuActionDismissBehavior(.disabled)
    }
    private func option(_ label: String, on: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            if on { Label(label, systemImage: "checkmark") } else { Text(label) }
        }
    }

    var body: some View {
        List {
            let data = board.value
            let runtime = (data?.runtime ?? 0) > 0 ? (data?.runtime ?? 0) : (movie.runtime ?? 0) > 0 ? (movie.runtime ?? 0) : (filledRuntime?.runtime ?? 0)
            Section {
                MovieHero(title: movie.title, slug: movie.slug, en: movie.en, lines: [
                    movie.en ?? "",
                    [movie.rating ?? data?.rating ?? "", runtime > 0 ? "\(runtime) 分鐘" : ""].filter { !$0.isEmpty }.joined(separator: "｜"),
                    Fmt.release((data?.release ?? "").isEmpty ? movie.release : data?.release),
                    data.map { "\($0.total) 間影城有放映" } ?? "",
                ])
            }
            if let intro = data?.intro, let credits = data?.credits, !(intro.isEmpty && credits.isEmpty) {
                Section {
                    if !intro.isEmpty { Text(intro).font(.subheadline) }
                    if !credits.isEmpty { Text(credits).font(.footnote).foregroundStyle(.secondary) }
                } header: {
                    Text("劇情簡介")
                } footer: {
                    Text("簡介來自場次通。")
                }
            }
            CommunitySection(title: movie.title)
            switch board {
            case .loading:
                Section { LoadingRow(text: "讀取放映影城…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load(fill: false) } } }
            case .loaded(let b):
                let selCities = b.cities.filter { cities.contains($0) }
                let selFormats = b.formats.filter { formats.contains($0) }
                Section {
                    multiMenu("日期", summary: b.selDates.map(short).joined(separator: "、")) {
                        ForEach(b.dates, id: \.self) { d in
                            option(Fmt.dateLabel(d), on: b.selDates.contains(d)) {
                                var next = Set(b.selDates)
                                if next.contains(d) { if next.count > 1 { next.remove(d) } } else { next.insert(d) }
                                dates = next
                            }
                        }
                    }
                    multiMenu("縣市", summary: selCities.isEmpty ? "全部" : selCities.joined(separator: "、")) {
                        option("全部", on: selCities.isEmpty) { cities = [] }
                        ForEach(b.cities, id: \.self) { c in
                            option(c, on: cities.contains(c)) { if cities.contains(c) { cities.remove(c) } else { cities.insert(c) } }
                        }
                    }
                    if !b.formats.isEmpty {
                        multiMenu("特殊廳", summary: selFormats.isEmpty ? "全部" : selFormats.joined(separator: "、")) {
                            option("全部", on: selFormats.isEmpty) { formats = [] }
                            ForEach(b.formats, id: \.self) { f in
                                option(f, on: formats.contains(f)) { if formats.contains(f) { formats.remove(f) } else { formats.insert(f) } }
                            }
                        }
                    }
                    Toggle("只看常去影城（\(settings.favorites.count)）", isOn: $onlyFav)
                } footer: {
                    Text("日期、縣市、特殊廳都可以複選。")
                }
                if b.rows.isEmpty {
                    Section { Text(onlyFav && settings.favorites.isEmpty ? "還沒有常去影城，先到影城頁加入。" : "沒有符合條件的影城，換個日期或條件試試。").foregroundStyle(.secondary) }
                }
                let many = b.selDates.count > 1 // 複選多天：每一列標日期
                ForEach(b.cities.filter { c in b.rows.contains { $0.cinema.city == c } }, id: \.self) { c in
                    let rows = b.rows.filter { $0.cinema.city == c }
                    Section("\(c)（\(Set(rows.map { $0.cinema.id }).count) 間）") {
                        ForEach(rows) { r in
                            let cinema = r.cinema
                            NavigationLink {
                                TimesView(title: b.title, runtime: runtime, cinemaName: cinema.name, address: cinema.address ?? "", date: r.date, versions: cinema.versions, bookingUrl: "",
                                          cinema: Cinema(id: cinema.id, name: cinema.name, city: cinema.city, district: cinema.district, source: "tw", url: "https://twshowtimes.com/cinemas/\(cinema.id)/", address: (cinema.address ?? "").isEmpty ? nil : cinema.address, aliases: nil),
                                          complete: true)
                            } label: {
                                VStack(alignment: .leading, spacing: 3) {
                                    HStack(spacing: 6) {
                                        if settings.isFavorite(cinema.id) { Image(systemName: "star.fill").font(.caption).foregroundStyle(.orange) }
                                        Text(cinema.name)
                                        if many { Text(short(r.date)).font(.subheadline).foregroundStyle(.secondary) }
                                    }
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
        .task(id: [dates.sorted().joined(separator: ","), cities.sorted().joined(separator: ","), formats.sorted().joined(separator: ","), onlyFav ? "fav" : "all"].joined(separator: "|")) {
            if board.value != nil {
                try? await Task.sleep(nanoseconds: 500_000_000) // 連續勾選時等一下再查
                if Task.isCancelled { return }
            }
            await load(fill: false) // 先用電影頁的資料畫出來
            if Task.isCancelled { return }
            await load(fill: true)  // 再把每間影城的版本補齊（電影頁每間只列一種）
        }
    }

    private func load(fill: Bool) async {
        do {
            let fav: Any = onlyFav ? (settings.favorites as Any) : (NSNull() as Any)
            let b: MovieBoard = try await Bridge.shared.call("movieBoard", [movie.slug, dates.sorted(), cities.sorted(), formats.sorted(), fav, fill])
            if Task.isCancelled { return }
            board = .loaded(b)
            if (b.runtime ?? 0) == 0 && (movie.runtime ?? 0) == 0 && filledRuntime == nil {
                filledRuntime = try? await Bridge.shared.callOptional("movieRuntime", [movie.title, movie.slug, js(movie.en)])
            }
        } catch {
            if board.value == nil { board = .failed(errorText(error)) }
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
