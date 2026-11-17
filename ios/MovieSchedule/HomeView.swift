import SwiftUI

/// 「首頁」分頁：現在有什麼可以看、常去影城、附近的影城
struct HomeView: View {
    @ObservedObject private var settings = SettingsStore.shared
    @State private var cinemas: Loadable<[Cinema]> = .loading

    var body: some View {
        NavigationStack {
            List {
                Section {
                    NavigationLink {
                        NowView(cinemas: cinemas.value ?? [])
                    } label: {
                        Label("現在有什麼可以看", systemImage: "clock")
                    }
                    .accessibilityIdentifier("now-link")
                    NavigationLink {
                        NearbyView()
                    } label: {
                        Label("附近的影城", systemImage: "location")
                    }
                }
                Section {
                    switch cinemas {
                    case .loading:
                        LoadingRow(text: "讀取影城清單…")
                    case .failed(let message):
                        ErrorRow(message: message) { Task { await load() } }
                    case .loaded(let all):
                        let favs = settings.favorites.compactMap { id in all.first { $0.id == id } }
                        if favs.isEmpty {
                            Text("還沒有常去影城。到「影城」分頁打開一間影城，點右上角的星星加入。").font(.subheadline).foregroundStyle(.secondary)
                        }
                        ForEach(favs) { c in
                            NavigationLink {
                                CinemaView(cinema: c)
                            } label: {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(c.name)
                                    Text("\(c.city) \(c.district ?? "")").font(.subheadline).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                } header: {
                    Text("常去影城")
                }
            }
            .navigationTitle("電影行程")
            .task { if cinemas.value == nil { await load() } }
        }
    }

    private func load() async {
        do {
            cinemas = .loaded(try await Bridge.shared.call("loadCinemas"))
        } catch {
            cinemas = .failed(errorText(error))
        }
    }
}

/// 現在有什麼可以看：選日期、時段、範圍，一次列出所有場次
struct NowView: View {
    let cinemas: [Cinema]
    @ObservedObject private var settings = SettingsStore.shared
    @State private var date = Fmt.today()
    @State private var window = "soon"
    @State private var scope = "fav"
    @State private var format = ""
    @State private var result: Loadable<NowResult> = .loading

    private static let windows: [(String, String)] = [
        ("soon", "接下來 3 小時"), ("morning", "中午前"), ("afternoon", "下午 12–17 點"),
        ("evening", "晚上 17–21 點"), ("night", "深夜 21 點後"), ("all", "整天"),
    ]
    private static let formats = ["IMAX", "4DX", "ScreenX", "MX4D", "杜比"]

    var body: some View {
        List {
            Section {
                Picker("日期", selection: $date) {
                    ForEach(0..<7, id: \.self) { i in
                        let d = Fmt.addDays(Fmt.today(), i)
                        Text(Fmt.dateLabel(d)).tag(d)
                    }
                }
                Picker("時段", selection: $window) {
                    ForEach(Self.windows.filter { $0.0 != "soon" || date == Fmt.today() }, id: \.0) { w in
                        Text(w.1).tag(w.0)
                    }
                }
                Picker("範圍", selection: $scope) {
                    Text("常去影城").tag("fav")
                    Text("附近 10 間").tag("near")
                    ForEach(Fmt.sortCities(Array(Set(cinemas.map { $0.city }))), id: \.self) { Text($0).tag($0) }
                }
                Picker("特殊廳", selection: $format) {
                    Text("全部").tag("")
                    ForEach(Self.formats, id: \.self) { Text($0).tag($0) }
                }
            }
            switch result {
            case .loading:
                Section { LoadingRow(text: "查詢場次中…影城多的話要等一下") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let r):
                if r.groups.isEmpty {
                    Section { Text("這個時段沒有場次").foregroundStyle(.secondary) }
                }
                ForEach(r.groups) { g in
                    Section {
                        ForEach(g.hits, id: \.self) { h in
                            NavigationLink {
                                ConfirmView(pick: ShowPick(title: h.movie.title, versionLabel: h.version.label, cinemaName: h.cinema.name, address: h.ctx?.address ?? h.cinema.address ?? "", date: h.date, time: h.time, runtime: h.movie.runtime ?? g.runtime ?? 0, bookingUrl: h.ctx?.booking ?? "", cinema: h.cinema))
                            } label: {
                                HStack(spacing: 10) {
                                    Text(h.time).font(.body.monospacedDigit().weight(.semibold))
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(h.cinema.name).lineLimit(1)
                                        Text([h.version.label, kmLabel(h.km)].filter { !$0.isEmpty }.joined(separator: "｜")).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                                    }
                                }
                            }
                        }
                    } header: {
                        Text(g.title)
                    } footer: {
                        let info = [(g.runtime ?? 0) > 0 ? "\(g.runtime ?? 0) 分鐘" : "", g.rating ?? ""].filter { !$0.isEmpty }.joined(separator: "｜")
                        if !info.isEmpty { Text(info) }
                    }
                }
                if let failed = r.failed, !failed.isEmpty {
                    Section { Text("讀不到：\(failed.joined(separator: "、"))").font(.footnote).foregroundStyle(.secondary) }
                }
            }
        }
        .navigationTitle("現在有什麼可以看")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await load() }
        .task(id: "\(date)|\(window)|\(scope)|\(format)") { await load() }
    }

    private func load() async {
        result = .loading
        do {
            var list: [ScopedCinema]
            if scope == "near" {
                let loc = try await LocationFetcher().current()
                list = try await Bridge.shared.call("nearby", [loc.coordinate.latitude, loc.coordinate.longitude, 10])
            } else if scope == "fav" {
                list = settings.favorites.compactMap { id in cinemas.first { $0.id == id } }.map { ScopedCinema(cinema: $0, km: nil) }
            } else {
                list = cinemas.filter { $0.city == scope }.map { ScopedCinema(cinema: $0, km: nil) }
            }
            if list.isEmpty { throw BridgeError(message: "沒有可以查的影城。先加入常去影城，或改選附近／縣市。") }
            let win = (window == "soon" && date != Fmt.today()) ? "all" : window
            result = .loaded(try await Bridge.shared.call("nowShowing", [Bridge.json(list), date, win, format]))
        } catch is CancellationError {
            // 條件改了，新的查詢會接手
        } catch {
            result = .failed(errorText(error))
        }
    }
}

/// 附近的影城（依直線距離）
struct NearbyView: View {
    @State private var list: Loadable<[ScopedCinema]> = .loading

    var body: some View {
        List {
            switch list {
            case .loading:
                Section { LoadingRow(text: "定位中…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let rows):
                Section {
                    ForEach(rows) { r in
                        NavigationLink {
                            CinemaView(cinema: r.cinema)
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(r.cinema.name)
                                    Text("\(r.cinema.city) \(r.cinema.district ?? "")").font(.subheadline).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(kmLabel(r.km)).font(.subheadline).foregroundStyle(.secondary)
                            }
                        }
                    }
                } footer: {
                    Text("依直線距離排序。")
                }
            }
        }
        .navigationTitle("附近的影城")
        .navigationBarTitleDisplayMode(.inline)
        .task { if list.value == nil { await load() } }
    }

    private func load() async {
        list = .loading
        do {
            let loc = try await LocationFetcher().current()
            list = .loaded(try await Bridge.shared.call("nearby", [loc.coordinate.latitude, loc.coordinate.longitude, 20]))
        } catch {
            list = .failed(errorText(error))
        }
    }
}

/// 觀眾評分：大家一起統計，一支手機一票，可以改票或取消
struct CommunitySection: View {
    let title: String
    @State private var stats: Community?
    @State private var busy = false
    @State private var message: String?

    var body: some View {
        Section {
            HStack(spacing: 6) {
                ForEach(1...5, id: \.self) { s in
                    Button {
                        Task { await vote(s) }
                    } label: {
                        Image(systemName: s <= (stats?.mine ?? 0) ? "star.fill" : "star")
                            .font(.title2).foregroundStyle(.yellow)
                    }
                    .buttonStyle(.plain)
                    .disabled(busy)
                    .accessibilityLabel("\(s) 星")
                }
                Spacer()
                if let c = stats {
                    Text(c.n > 0 ? String(format: "%.1f 分・%d 人", c.avg, c.n) : "還沒有人評分").font(.subheadline).foregroundStyle(.secondary)
                } else {
                    ProgressView()
                }
            }
            if let message { Text(message).font(.footnote).foregroundStyle(.red) }
        } header: {
            Text("觀眾評分")
        } footer: {
            Text((stats?.mine ?? 0) > 0 ? "你給了 \(stats?.mine ?? 0) 星，再點一次同一顆星可以取消。" : "點星星給分，一支手機一票。")
        }
        .task(id: title) { stats = try? await Bridge.shared.call("communityStats", [title]) }
    }

    private func vote(_ s: Int) async {
        busy = true
        defer { busy = false }
        do {
            stats = try await Bridge.shared.call("communityVote", [title, s == (stats?.mine ?? 0) ? 0 : s])
            message = nil
        } catch {
            message = errorText(error)
        }
    }
}
