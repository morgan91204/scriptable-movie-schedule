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

    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            PosterView(title: title, slug: slug, en: en, width: 104)
            VStack(alignment: .leading, spacing: 5) {
                ForEach(lines.filter { !$0.isEmpty }, id: \.self) { line in
                    Text(line).font(.subheadline).foregroundStyle(.secondary)
                }
                if ratingsDone {
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
        async let r = try? Bridge.shared.call("movieRatings", [title, js(en), js(slug)], as: Ratings.self)
        ratings = await r
        ratingsDone = true
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
                    data.map { "\($0.cinemas.count) 間影城有放映" } ?? "",
                ])
            }
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
                        ForEach(dates.isEmpty ? [d.date] : dates, id: \.self) { Text(Fmt.dateLabel($0)).tag($0) }
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
                                TimesView(title: d.title, runtime: runtime, cinemaName: cinema.name, address: cinema.address ?? "", date: d.date, versions: cinema.versions, bookingUrl: "https://twshowtimes.com/cinemas/\(cinema.id)/\(d.date)/")
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

    var body: some View {
        // 用 ScrollView 而不是 List：一列裡有很多個時間按鈕，List 會把整列當成一個可點的項目
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.title3.bold())
                    Text("\(cinemaName)｜\(Fmt.dateLabel(date))").font(.subheadline).foregroundStyle(.secondary)
                }
                ForEach(versions, id: \.self) { v in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(v.label).font(.headline)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 76), spacing: 8)], spacing: 8) {
                            ForEach(v.times, id: \.self) { t in
                                NavigationLink {
                                    ConfirmView(pick: ShowPick(title: title, versionLabel: v.label, cinemaName: cinemaName, address: address, date: date, time: t, runtime: runtime, bookingUrl: bookingUrl))
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
        .navigationTitle("選場次")
        .navigationBarTitleDisplayMode(.inline)
    }
}
