import SwiftUI

/// 「電影」分頁：電影（上映中與票房排行合成一份）／即將上映／影展
struct MoviesView: View {
    @State private var movies: Loadable<[TwMovie]> = .loading
    @State private var mode = "box" // box = 「電影」清單
    @State private var hasFestival = false // 有進行中或即將開始的影展
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("顯示", selection: $mode) {
                        Text("已上映").tag("box")
                        Text("即將上映").tag("soon")
                        if hasFestival { Text("影展").tag("fest") } // 有進行中或即將開始的影展才出現
                    }
                    .pickerStyle(.segmented)
                }
                if mode == "fest" {
                    FestivalSection(query: query)
                } else if mode == "box" {
                    BoxOfficeSection(query: query)
                } else {
                    nowSections
                }
            }
            .navigationTitle("依電影找場次")
            .searchable(text: $query, prompt: "搜尋片名")
            .refreshable { await load() }
            .task { if movies.value == nil { await load() } }
            .task {
                if let b = try? await Bridge.shared.call("festivalBoard", ["", ""], as: FestivalBoard.self) { hasFestival = !b.festivals.isEmpty }
            }
        }
    }

    @ViewBuilder private var nowSections: some View {
        switch movies {
        case .loading:
            Section { LoadingRow(text: "讀取電影清單…") }
        case .failed(let message):
            Section { ErrorRow(message: message) { Task { await load() } } }
        case .loaded(let all):
            let k = query.trimmingCharacters(in: .whitespaces).lowercased()
            let list = all.filter { k.isEmpty || "\($0.title) \($0.en ?? "")".lowercased().contains(k) }
            let soon = list.filter { $0.comingSoon ?? false }
            let groups = soonGroups(soon)
            ForEach(Array(groups.enumerated()), id: \.offset) { i, g in
                Section {
                    ForEach(g.items) { row($0) }
                } header: {
                    Text(g.title)
                } footer: {
                    if i == groups.count - 1 { Text("還沒上映、但已經可以查到場次的片，依上映日期排序。") }
                }
            }
        }
    }

    /// 「即將上映」依上映月份分段：「11 月（3）」…，不知道上映日期的放最後一段（清單本來就依上映日期排好）
    private func soonGroups(_ list: [TwMovie]) -> [(title: String, items: [TwMovie])] {
        var out: [(key: String, items: [TwMovie])] = []
        for m in list {
            let d = m.release ?? ""
            let key = d.count >= 7 ? String(d.prefix(7)) : ""
            if let i = out.firstIndex(where: { $0.key == key }) { out[i].items.append(m) } else { out.append((key, [m])) }
        }
        out.sort { ($0.key.isEmpty ? "9999" : $0.key) < ($1.key.isEmpty ? "9999" : $1.key) }
        let thisYear = String(Calendar.current.component(.year, from: Date()))
        return out.map { g in
            guard !g.key.isEmpty else { return ("日期未定（\(g.items.count)）", g.items) }
            let y = String(g.key.prefix(4)), mo = Int(g.key.suffix(2)) ?? 0
            return ("\(y == thisYear ? "" : y + " 年 ")\(mo) 月（\(g.items.count)）", g.items)
        }
    }

    /// 說明文字開頭：已上映但今天沒排片的標「今天沒有場次」，還沒上映的標上映日期
    private func head(_ m: TwMovie) -> String {
        if m.noShowToday ?? false { return "今天無場次" }
        guard m.comingSoon ?? false, let d = m.release, d.count >= 10 else { return "" }
        let p = d.split(separator: "-").compactMap { Int($0) }
        return p.count == 3 ? "\(p[1])/\(p[2]) 上映" : ""
    }

    private func row(_ m: TwMovie) -> some View {
        NavigationLink {
            MovieDetailView(movie: m)
        } label: {
            HStack(spacing: 10) {
                PosterView(title: m.title, slug: m.slug, en: m.en)
                VStack(alignment: .leading, spacing: 2) {
                    Text(m.title).lineLimit(2)
                    // 兩行說明各自一行不換行，跟票房排行同一種排版
                    let first = [head(m), m.rating ?? "", (m.runtime ?? 0) > 0 ? "\(m.runtime ?? 0) 分" : "", (m.cinemaCount ?? 0) > 0 ? "\(m.cinemaCount ?? 0) 間影城" : ""].filter { !$0.isEmpty }.joined(separator: "｜")
                    if !first.isEmpty {
                        Text(first).font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                    }
                    if let en = m.en, !en.isEmpty {
                        Text(en).font(.caption).foregroundStyle(.tertiary).lineLimit(1)
                    }
                }
                Spacer(minLength: 4)
            }
        }
        .accessibilityIdentifier("soon-row")
    }

    private func load() async {
        do {
            movies = .loaded(try await Bridge.shared.call("loadMovies"))
        } catch {
            if movies.value == nil { movies = .failed(errorText(error)) }
        }
    }
}

/// 「電影」清單：上映中與票房排行合成一份（範圍、排序、出品國別都在這裡選）
struct BoxOfficeSection: View {
    var query: String = ""
    @State private var board: Loadable<FilmList> = .loading
    @State private var sort = "" // 排法（空 = 第一種：本週票房）；year = 年度排行（含已下檔）
    @State private var asc = false // 反過來排（低到高、舊到新、少到多）；換一種排法就回到預設方向
    @State private var rate = "" // 依評分排時用哪一種評分（空 = IMDb）
    @State private var years: Set<String> = [] // 年度排行選了哪幾年（空 = 最新的一年）
    @State private var limit = 100 // 年度排行目前顯示幾列（一年六百部左右，分批顯示）
    @State private var week = "" // 週票房看哪一週（空 = 最新）
    @State private var countries: Set<String> = [] // 只看哪幾個出品國別（可以複選；空 = 全部）

    var body: some View {
        Group {
            pickers
            countryPicker
            yearPicker
            results
        }
        .task(id: loadKey) { await load() }
        .onChange(of: sort) { _, _ in limit = 100; asc = false }
        .onChange(of: asc) { _, _ in limit = 100 }
        .onChange(of: years) { _, _ in limit = 100 }
        .onChange(of: query) { _, _ in limit = 100 }
        .onChange(of: countries) { _, _ in limit = 100 }
    }

    private var loadKey: String {
        [sort, asc ? "asc" : "desc", rate, years.sorted().joined(separator: ","), query, String(limit), week, countries.sorted().joined(separator: ",")].joined(separator: "|")
    }

    @ViewBuilder private var pickers: some View {
        if let b = board.value {
            Section {
                // 範圍和排序併成一個選單：最後一項是年度排行（含已下檔）
                if b.orders.count > 1 {
                    Picker("排序", selection: Binding(get: { b.order }, set: { sort = $0 })) {
                        ForEach(b.orders) { Text($0.id == "year" ? "\($0.label)（含已下檔）" : $0.label).tag($0.id) }
                    }
                    .accessibilityIdentifier("order-picker")
                }
                // 順序：字跟著排法換（高到低／新到舊／多到少）
                if let dirs = b.dirs, dirs.count > 1 {
                    Picker("順序", selection: Binding(get: { (b.asc ?? false) ? "asc" : "desc" }, set: { asc = $0 == "asc" })) {
                        ForEach(dirs) { Text($0.label).tag($0.id) }
                    }
                    .pickerStyle(.segmented)
                }
                if let rates = b.rates, rates.count > 1 {
                    Picker("評分來源", selection: Binding(get: { b.rate ?? "imdb" }, set: { rate = $0 })) {
                        ForEach(rates) { Text($0.label).tag($0.id) }
                    }
                }
                if b.weeks.count > 1 {
                    Picker("週次", selection: Binding(
                        get: { week.isEmpty ? (b.weeks.first?.id ?? "") : week },
                        set: { week = ($0 == b.weeks.first?.id) ? "" : $0 }
                    )) {
                        ForEach(b.weeks) { Text("\($0.label)（\($0.note)）").tag($0.id) }
                    }
                }
            }
        }
    }

    @ViewBuilder private var countryPicker: some View {
        if let b = board.value, b.countries.count > 1 {
            let picked = b.selCountries
            Section {
                // 出品國別可以複選：選單點了不會關，可以連續勾
                Menu {
                    Button {
                        countries = []
                    } label: {
                        if picked.isEmpty { Label("全部（\(b.everyone) 部）", systemImage: "checkmark") } else { Text("全部（\(b.everyone) 部）") }
                    }
                    ForEach(b.countries) { c in
                        Button {
                            var next = Set(picked)
                            if next.contains(c.id) { next.remove(c.id) } else { next.insert(c.id) }
                            countries = next
                        } label: {
                            if picked.contains(c.id) { Label(c.label, systemImage: "checkmark") } else { Text(c.label) }
                        }
                    }
                } label: {
                    HStack {
                        Text("出品國別").foregroundStyle(Color.primary)
                        Spacer()
                        Text(picked.isEmpty ? "全部" : picked.joined(separator: "、")).foregroundStyle(.secondary).lineLimit(1)
                        Image(systemName: "chevron.up.chevron.down").font(.caption).foregroundStyle(.tertiary)
                    }
                }
                .menuActionDismissBehavior(.disabled)
            } footer: {
                Text(b.countryNote ?? "全台灣票房，只篩選出品國，可複選。")
            }
        }
    }

    @ViewBuilder private var yearPicker: some View {
        if let b = board.value, b.scope == "year", b.years.count > 1 {
            let options = b.years
            let picked = b.selYears
            Section {
                // 年份可以複選：選單點了不會關，可以連續勾
                Menu {
                    // 全選：再點一次回到只看最新的一年
                    Button {
                        years = picked.count == options.count ? [] : Set(options)
                    } label: {
                        if picked.count == options.count { Label("全選", systemImage: "checkmark") } else { Text("全選") }
                    }
                    ForEach(options, id: \.self) { y in
                        Button {
                            var next = Set(picked)
                            if next.contains(y) { if next.count > 1 { next.remove(y) } } else { next.insert(y) }
                            years = next
                        } label: {
                            if picked.contains(y) { Label("\(y) 年", systemImage: "checkmark") } else { Text("\(y) 年") }
                        }
                    }
                } label: {
                    HStack {
                        Text("年份").foregroundStyle(Color.primary)
                        Spacer()
                        Text(picked.count == options.count ? "全部（\(options.last ?? "")–\(options.first ?? "")）" : picked.joined(separator: "、")).foregroundStyle(.secondary).lineLimit(1)
                        Image(systemName: "chevron.up.chevron.down").font(.caption).foregroundStyle(.tertiary)
                    }
                }
                .menuActionDismissBehavior(.disabled)
            } footer: {
                Text("可以複選，選了幾年就合在一起排。點「全選」一次選完，再點一次回到最新的一年。")
            }
        }
    }

    @ViewBuilder private var results: some View {
        switch board {
        case .loading:
            Section { LoadingRow(text: "讀取電影清單…") }
        case .failed(let message):
            Section { ErrorRow(message: message) { Task { await load() } } }
        case .loaded(let b):
            let rows = b.entries // 搜尋與分批都由共用資料層處理
            Section {
                ForEach(rows) { entry($0) }
                if b.total > rows.count {
                    // 不用按：滑到這一列就自動接著載入下一批
                    HStack {
                        ProgressView()
                        Text("載入中…已顯示 \(rows.count)／\(b.total) 部").font(.footnote).foregroundStyle(.secondary)
                    }
                    .onAppear { limit = rows.count + 200 }
                }
            } header: {
                Text(b.title)
            } footer: {
                Text("\(rows.isEmpty && b.rest.isEmpty ? "找不到相符的電影。\n" : "")\(b.footer)")
            }
            if !b.rest.isEmpty {
                Section {
                    ForEach(b.rest) { entry($0) }
                } header: {
                    Text(b.restTitle)
                } footer: {
                    Text(b.restFooter)
                }
            }
        }
    }

    @ViewBuilder private func entry(_ r: FilmEntry) -> some View {
        if let m = r.m {
            NavigationLink { MovieDetailView(movie: m) } label: { rowLabel(r) }.accessibilityIdentifier("movie-row")
        } else {
            rowLabel(r)
        }
    }

    private func rowLabel(_ r: FilmEntry) -> some View {
        HStack(spacing: 10) {
            if let rank = r.rank {
                Text("\(rank)")
                    .font(rank >= 1000 ? .caption.bold() : rank >= 100 ? .subheadline.bold() : .title3.bold()).monospacedDigit()
                    .foregroundStyle(rank <= 3 ? Color.orange : Color.secondary)
                    .lineLimit(1).minimumScaleFactor(0.6)
                    .frame(width: 36)
            }
            PosterView(title: r.m?.title ?? r.name, slug: r.m?.slug, en: r.m?.en, lightRelease: (r.light ?? false) ? (r.x?.release ?? "") : nil)
            VStack(alignment: .leading, spacing: 2) {
                Text(r.name).lineLimit(2)
                // 兩行說明各自一行不換行（文字由共用資料層依排法算好）
                let first = r.lines.first ?? ""
                let second = r.lines.count > 1 ? r.lines[1] : ""
                if !first.isEmpty {
                    Text(first).font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                }
                if !second.isEmpty {
                    Text(second).font(.caption).foregroundStyle(.tertiary).lineLimit(1).minimumScaleFactor(0.8)
                }
            }
            Spacer(minLength: 4)
        }
    }

    private func load() async {
        do {
            board = .loaded(try await Bridge.shared.call("filmList", ["", sort, years.sorted(), query.trimmingCharacters(in: .whitespaces), limit, week, countries.sorted(), asc, rate]))
        } catch {
            board = .failed(errorText(error))
        }
    }
}
