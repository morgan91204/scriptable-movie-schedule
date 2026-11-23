import SwiftUI

/// 「影城」分頁：依縣市列出影城，可搜尋
struct CinemasView: View {
    @State private var cinemas: Loadable<[Cinema]> = .loading
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                switch cinemas {
                case .loading:
                    Section { LoadingRow(text: "讀取影城清單…") }
                case .failed(let message):
                    Section { ErrorRow(message: message) { Task { await load() } } }
                case .loaded(let all):
                    let k = query.trimmingCharacters(in: .whitespaces).lowercased().replacingOccurrences(of: "臺", with: "台")
                    let list = all.filter { k.isEmpty || "\($0.name) \($0.city) \($0.district ?? "") \($0.aliases ?? "")".lowercased().contains(k) }
                    ForEach(Fmt.sortCities(Array(Set(list.map { $0.city }))), id: \.self) { city in
                        let rows = list.filter { $0.city == city }
                        Section("\(city)（\(rows.count) 間）") {
                            ForEach(rows) { c in
                                NavigationLink {
                                    CinemaView(cinema: c)
                                } label: {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(c.name)
                                        Text("\(c.city) \(c.district ?? "")").font(.subheadline).foregroundStyle(.secondary)
                                    }
                                }
                                .accessibilityIdentifier("cinema-row")
                            }
                        }
                    }
                }
            }
            .navigationTitle("影城")
            .searchable(text: $query, prompt: "搜尋影城")
            .refreshable { await load() }
            .task { if cinemas.value == nil { await load() } }
        }
    }

    private func load() async {
        do {
            cinemas = .loaded(try await Bridge.shared.call("loadCinemas"))
        } catch {
            if cinemas.value == nil { cinemas = .failed(errorText(error)) }
        }
    }
}

/// 一間影城：有場次的日期
struct CinemaView: View {
    let cinema: Cinema
    @Environment(\.openURL) private var openURL
    @ObservedObject private var settings = SettingsStore.shared
    @State private var info: Loadable<CinemaDates> = .loading

    var body: some View {
        List {
            switch info {
            case .loading:
                Section { LoadingRow(text: "讀取場次日期…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let d):
                if let address = d.address ?? cinema.address, !address.isEmpty {
                    Section {
                        Button {
                            if let u = settings.mapsURL(name: cinema.name, address: address) { openURL(u) }
                        } label: {
                            Label(address, systemImage: "mappin.and.ellipse")
                        }
                    }
                }
                if let notice = d.notice, !notice.isEmpty {
                    Section { Text(notice).font(.footnote).foregroundStyle(.secondary) }
                }
                Section("日期") {
                    if d.dates.isEmpty { Text("目前沒有可以讀取的場次").foregroundStyle(.secondary) }
                    ForEach(d.dates, id: \.self) { date in
                        NavigationLink(Fmt.dateLabel(date)) {
                            CinemaDayView(cinema: cinema, date: date, fallbackAddress: d.address ?? cinema.address ?? "")
                        }
                        .accessibilityIdentifier("date-row")
                    }
                }
                if let site = d.site, let u = URL(string: site) {
                    Section { Button { openURL(u) } label: { Label("影城官網（訂票）", systemImage: "house") } }
                }
            }
        }
        .navigationTitle(cinema.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    settings.toggleFavorite(cinema.id)
                } label: {
                    Image(systemName: settings.isFavorite(cinema.id) ? "star.fill" : "star")
                }
                .accessibilityLabel(settings.isFavorite(cinema.id) ? "取消收藏影城" : "收藏這間影城")
            }
        }
        .task { if info.value == nil { await load() } }
    }

    private func load() async {
        do {
            info = .loaded(try await Bridge.shared.call("datesOf", [Bridge.json(cinema)]))
        } catch {
            info = .failed(errorText(error))
        }
    }
}

/// 影城某一天的片單
struct CinemaDayView: View {
    let cinema: Cinema
    let date: String
    let fallbackAddress: String
    @State private var day: Loadable<CinemaDay> = .loading

    var body: some View {
        List {
            switch day {
            case .loading:
                Section { LoadingRow(text: "讀取片單…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let d):
                if d.movies.isEmpty {
                    Section { Text("這天沒有可讀取的場次").foregroundStyle(.secondary) }
                }
                Section {
                    ForEach(d.movies, id: \.self) { m in
                        NavigationLink {
                            TimesView(title: m.title, runtime: m.runtime ?? 0, cinemaName: cinema.name, address: (d.address ?? "").isEmpty ? fallbackAddress : (d.address ?? ""), date: date, versions: m.versions, bookingUrl: (d.booking ?? "").isEmpty ? (d.sourceUrl ?? cinema.url) : (d.booking ?? ""), cinema: cinema)
                        } label: {
                            HStack(spacing: 10) {
                                PosterView(title: m.title)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(m.title).lineLimit(2)
                                    Text([(m.runtime ?? 0) > 0 ? "\(m.runtime ?? 0) 分" : "片長未提供", m.rating ?? "", m.versions.map { $0.label }.joined(separator: "、")].filter { !$0.isEmpty }.joined(separator: "｜"))
                                        .font(.subheadline).foregroundStyle(.secondary).lineLimit(2)
                                }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle(Fmt.dateLabel(date))
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await load() }
        .task { if day.value == nil { await load() } }
    }

    private func load() async {
        do {
            day = .loaded(try await Bridge.shared.call("moviesOf", [Bridge.json(cinema), date]))
        } catch {
            if day.value == nil { day = .failed(errorText(error)) }
        }
    }
}
