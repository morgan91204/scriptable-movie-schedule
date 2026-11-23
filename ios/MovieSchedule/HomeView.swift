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
    // 四個條件都可以複選
    @State private var dates: Set<String> = [Fmt.today()]
    @State private var windows: Set<String> = ["soon"] // 空 = 整天
    @State private var scopes: Set<String> = ["fav"]
    @State private var picked: Set<String> = [] // 特殊廳；空 = 不限
    @State private var result: Loadable<NowResult> = .loading

    private static let allWindows: [(String, String)] = [
        ("soon", "接下來 3 小時"), ("morning", "中午前"), ("afternoon", "下午 12–17 點"),
        ("evening", "晚上 17–21 點"), ("night", "深夜 21 點後"), ("all", "整天"),
    ]
    /// 特殊廳清單由共用資料層提供（跟其他版本同一份），讀到之前先用這份
    @State private var formats = ["IMAX", "杜比", "4DX", "MX4D", "ScreenX", "巨幕", "LED", "頂級廳", "3D"]

    private var dayOptions: [String] { (0..<7).map { Fmt.addDays(Fmt.today(), $0) } }
    private var windowOptions: [(String, String)] { Self.allWindows.filter { $0.0 != "soon" || dates.contains(Fmt.today()) } }
    private var cityOptions: [String] { Fmt.sortCities(Array(Set(cinemas.map { $0.city }))) }
    private var activeWindows: [String] { windowOptions.map { $0.0 }.filter { windows.contains($0) } }

    private func scopeName(_ id: String) -> String { id == "all" ? "不限" : id == "fav" ? "常去影城" : id == "near" ? "附近 10 間" : id }
    /// 範圍的選項順序：不限（全台）、常去、附近、各縣市
    private var scopeOptions: [String] { ["all", "fav", "near"] + cityOptions }
    private func short(_ d: String) -> String {
        let p = d.split(separator: "-").compactMap { Int($0) }
        return p.count == 3 ? "\(p[1])/\(p[2])" : d
    }

    /// 一組可以複選的選項：點開選單，每個選項點一下打勾、再點一下取消（選單不會關掉）
    /// 搜尋結果裡一部片的標題列：海報、粗體片名、幾場｜片長｜分級
    private func groupHead(_ g: NowGroup) -> some View {
        let rt = g.runtime ?? 0
        let info = ["\(g.hits.count) 場", rt > 0 ? "\(rt) 分鐘" : "", g.rating ?? ""].filter { !$0.isEmpty }.joined(separator: "｜")
        return HStack(spacing: 10) {
            PosterView(title: g.title, slug: g.movie?.slug, en: g.movie?.en)
            VStack(alignment: .leading, spacing: 2) {
                Text(g.title).font(.headline).lineLimit(2)
                Text(info).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
            }
            Spacer(minLength: 4)
        }
    }

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
    private func flip(_ set: inout Set<String>, _ id: String, keepOne: Bool = false) {
        if set.contains(id) {
            if !(keepOne && set.count == 1) { set.remove(id) }
        } else {
            set.insert(id)
        }
    }

    var body: some View {
        List {
            Section {
                multiMenu("日期", summary: dates.sorted().map(short).joined(separator: "、")) {
                    ForEach(dayOptions, id: \.self) { d in
                        option(Fmt.dateLabel(d), on: dates.contains(d)) { flip(&dates, d, keepOne: true) }
                    }
                }
                multiMenu("時段", summary: activeWindows.isEmpty || activeWindows.contains("all") ? "整天" : windowOptions.filter { activeWindows.contains($0.0) }.map { $0.1 }.joined(separator: "、")) {
                    ForEach(windowOptions, id: \.0) { w in
                        option(w.1, on: activeWindows.contains(w.0) || (w.0 == "all" && activeWindows.isEmpty)) {
                            if w.0 == "all" { windows = ["all"] } else { windows.remove("all"); flip(&windows, w.0) }
                        }
                    }
                }
                multiMenu("範圍", summary: scopeOptions.filter { scopes.contains($0) }.map(scopeName).joined(separator: "、")) {
                    ForEach(scopeOptions, id: \.self) { id in
                        option(id == "all" ? "不限（全台 \(cinemas.count) 間）" : scopeName(id), on: scopes.contains(id)) {
                            if id == "all" { scopes = ["all"] } else { scopes.remove("all"); flip(&scopes, id, keepOne: scopes.count == 1 && scopes.contains(id)) }
                            if scopes.isEmpty { scopes = [id] }
                        }
                    }
                }
                multiMenu("特殊廳", summary: picked.isEmpty ? "不限" : formats.filter { picked.contains($0) }.joined(separator: "、")) {
                    option("不限", on: picked.isEmpty) { picked = [] }
                    ForEach(formats, id: \.self) { f in
                        option(f, on: picked.contains(f)) { flip(&picked, f) }
                    }
                }
            } footer: {
                Text("每一項都可以複選。時段都不選就是整天；特殊廳選了幾種，就找其中任一種。範圍選「不限」要讀全台每一間影城，會比較久。")
            }
            switch result {
            case .loading:
                Section { LoadingRow(text: "查詢場次中…影城多的話要等一下") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let r):
                if r.groups.isEmpty {
                    Section { Text("沒有符合的場次，換個時段或範圍試試。").foregroundStyle(.secondary) }
                }
                ForEach(r.groups) { g in
                    Section {
                        // 片名獨立一列（海報、粗體大字），點下去是電影頁：簡介、預告、所有影城的場次
                        if let m = g.movie {
                            NavigationLink { MovieDetailView(movie: m) } label: { groupHead(g) }
                        } else {
                            groupHead(g)
                        }
                        ForEach(g.hits, id: \.self) { h in
                            NavigationLink {
                                ConfirmView(pick: ShowPick(title: h.movie.title, versionLabel: h.version.label, cinemaName: h.cinema.name, address: h.ctx?.address ?? h.cinema.address ?? "", date: h.date, time: h.time, runtime: h.movie.runtime ?? g.runtime ?? 0, bookingUrl: h.ctx?.booking ?? "", cinema: h.cinema))
                            } label: {
                                HStack(spacing: 10) {
                                    VStack(alignment: .leading, spacing: 0) {
                                        // 複選多天：時間上面標日期
                                        if dates.count > 1, let d = h.day { Text(short(d)).font(.caption2).foregroundStyle(.secondary) }
                                        Text(h.time + (Fmt.isLate(h.time) ? "（凌晨）" : "")).font(.body.monospacedDigit().weight(.semibold))
                                    }
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(h.cinema.name).lineLimit(1)
                                        Text([h.version.label, kmLabel(h.km)].filter { !$0.isEmpty }.joined(separator: "｜")).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                                    }
                                }
                            }
                        }
                    }
                }
                if let none = r.noData, !none.isEmpty {
                    Section { Text("這幾間目前沒有所選日期的場次資料（來源還沒更新），請到影城官網查詢：\(none.joined(separator: "、"))").font(.footnote).foregroundStyle(.secondary) }
                }
                if let failed = r.failed, !failed.isEmpty {
                    Section { Text("讀不到：\(failed.joined(separator: "、"))").font(.footnote).foregroundStyle(.secondary) }
                }
            }
        }
        .navigationTitle("現在有什麼可以看")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await load() }
        .task(id: [dates.sorted(), windows.sorted(), scopes.sorted(), picked.sorted()].map { $0.joined(separator: ",") }.joined(separator: "|")) {
            try? await Task.sleep(nanoseconds: 600_000_000) // 連續勾選時等一下再查，不用每點一下就重查
            if Task.isCancelled { return }
            await load()
        }
        .task { if let list = try? await Bridge.shared.call("formatList", [], as: [String].self), !list.isEmpty { formats = list } }
    }

    private static func merge(_ rows: [ScopedCinema], into byId: inout [String: ScopedCinema], order: inout [String]) {
        for r in rows {
            if let old = byId[r.cinema.id] {
                if old.km == nil, r.km != nil { byId[r.cinema.id] = r }
            } else {
                byId[r.cinema.id] = r
                order.append(r.cinema.id)
            }
        }
    }

    private func load() async {
        result = .loading
        do {
            // 範圍複選：各範圍的影城合在一起，同一間只查一次（有距離的保留距離）
            var byId: [String: ScopedCinema] = [:]
            var order: [String] = []
            for sc in scopeOptions where scopes.contains(sc) {
                if sc == "all" {
                    Self.merge(cinemas.map { ScopedCinema(cinema: $0, km: nil) }, into: &byId, order: &order)
                } else if sc == "near" {
                    let loc = try await LocationFetcher().current()
                    let near: [ScopedCinema] = try await Bridge.shared.call("nearby", [loc.coordinate.latitude, loc.coordinate.longitude, 10])
                    Self.merge(near, into: &byId, order: &order)
                } else if sc == "fav" {
                    Self.merge(settings.favorites.compactMap { id in cinemas.first { $0.id == id } }.map { ScopedCinema(cinema: $0, km: nil) }, into: &byId, order: &order)
                } else {
                    Self.merge(cinemas.filter { $0.city == sc }.map { ScopedCinema(cinema: $0, km: nil) }, into: &byId, order: &order)
                }
            }
            let list = order.compactMap { byId[$0] }
            if list.isEmpty { throw BridgeError(message: "沒有可以查的影城。先加入常去影城，或改選附近／縣市。") }
            result = .loaded(try await Bridge.shared.call("nowShowingMulti", [Bridge.json(list), dates.sorted(), activeWindows, formats.filter { picked.contains($0) }]))
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
