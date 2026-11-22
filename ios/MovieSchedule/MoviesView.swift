import SwiftUI

/// 「電影」分頁：上映中／票房排行
struct MoviesView: View {
    @State private var movies: Loadable<[TwMovie]> = .loading
    @State private var mode = "now"
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("顯示", selection: $mode) {
                        Text("上映中").tag("now")
                        Text("票房排行").tag("box")
                        Text("即將上映").tag("soon")
                    }
                    .pickerStyle(.segmented)
                }
                if mode == "box" {
                    BoxOfficeSection(query: query)
                } else {
                    nowSections
                }
            }
            .navigationTitle("依電影找場次")
            .searchable(text: $query, prompt: "搜尋片名")
            .refreshable { await load() }
            .task { if movies.value == nil { await load() } }
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
            let now = mode == "soon" ? [] : list.filter { !($0.comingSoon ?? false) }
            let soon = mode == "soon" ? list.filter { $0.comingSoon ?? false } : []
            if !now.isEmpty {
                Section {
                    ForEach(now) { row($0) }
                } header: {
                    Text("上映中（\(now.count)）")
                } footer: {
                    Text("依今天放映的影城數排序；今天沒有場次、過幾天才有的排在最後。資料來自場次通。")
                }
            }
            if !soon.isEmpty {
                Section {
                    ForEach(soon) { row($0) }
                } header: {
                    Text("即將上映（\(soon.count)）")
                } footer: {
                    Text("還沒上映、但已經可以查到場次的片，依上映日期排序。")
                }
            }
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
        .accessibilityIdentifier("movie-row")
    }

    private func load() async {
        do {
            movies = .loaded(try await Bridge.shared.call("loadMovies"))
        } catch {
            if movies.value == nil { movies = .failed(errorText(error)) }
        }
    }
}

/// 票房排行（官方開放資料，每週更新）
struct BoxOfficeSection: View {
    var query: String = ""
    @State private var board: Loadable<BoxOfficeBoard> = .loading
    @State private var sort = "week" // 排法：本週／累計／年度
    @State private var years: Set<String> = [] // 年度排行選了哪幾年（空 = 最新的一年）
    @State private var limit = 100 // 年度排行目前顯示幾列（一年六百部左右，分批顯示）

    var body: some View {
        Group {
            if let sorts = board.value?.sorts, sorts.count > 1 {
                Section {
                    Picker("排行", selection: $sort) {
                        ForEach(sorts) { Text($0.label).tag($0.id) }
                    }
                    .pickerStyle(.segmented)
                } footer: {
                    Text("本週、累計只排上映中的電影；年度包含已經下檔的。")
                }
            }
            if sort == "year", let options = board.value?.years, options.count > 1 {
                let picked = board.value?.selYears ?? []
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
            switch board {
            case .loading:
                Section { LoadingRow(text: "讀取票房排行…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let b):
                let rows = b.rows // 搜尋與分批都由共用資料層處理
                Section {
                    ForEach(rows) { r in
                        if let m = r.m {
                            NavigationLink { MovieDetailView(movie: m) } label: { rowLabel(r) }.accessibilityIdentifier("box-row")
                        } else {
                            rowLabel(r)
                        }
                    }
                    if let total = b.total, total > rows.count {
                        // 滑到這一列就自動載入下一批（也可以直接點）
                        Button {
                            limit += 100
                        } label: {
                            Label("顯示更多（還有 \(total - rows.count) 部）", systemImage: "chevron.down")
                        }
                        .onAppear { limit = rows.count + 100 }
                    }
                } header: {
                    Text(b.label)
                } footer: {
                    Text("\(rows.isEmpty ? "排行上找不到相符的電影。\n" : "")\(b.footer ?? "資料來源：\(b.source)。官方每週更新一次。")")
                }
            }
        }
        .task(id: [sort, years.sorted().joined(separator: ","), query, String(limit)].joined(separator: "|")) { await load() }
        .onChange(of: sort) { _, _ in limit = 100 }
        .onChange(of: years) { _, _ in limit = 100 }
        .onChange(of: query) { _, _ in limit = 100 }
    }

    private func rowLabel(_ r: BoxOfficeRow) -> some View {
        HStack(spacing: 10) {
            Text("\(r.x.rank)")
                .font(r.x.rank >= 1000 ? .caption.bold() : r.x.rank >= 100 ? .subheadline.bold() : .title3.bold()).monospacedDigit()
                .foregroundStyle(r.x.rank <= 3 ? Color.orange : Color.secondary)
                .lineLimit(1).minimumScaleFactor(0.6)
                .frame(width: 36)
            PosterView(title: r.m?.title ?? r.x.name, slug: r.m?.slug, en: r.m?.en, lightRelease: (r.light ?? false) ? (r.x.release ?? "") : nil)
            VStack(alignment: .leading, spacing: 2) {
                Text(r.x.name).lineLimit(2)
                // 第一行金額、第二行上映日期與戲院數：各自一行不換行（文字由共用資料層依排法算好）
                let first = r.lines?.first ?? "累計 \(Fmt.money(r.x.total))"
                let second = (r.lines?.count ?? 0) > 1 ? (r.lines?[1] ?? "") : ""
                Text(first).font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                if !second.isEmpty {
                    Text(second).font(.caption).foregroundStyle(.tertiary).lineLimit(1).minimumScaleFactor(0.8)
                }
            }
            Spacer(minLength: 4)
        }
    }

    private func load() async {
        do {
            board = .loaded(try await Bridge.shared.call("boxOffice", [sort, years.sorted(), query.trimmingCharacters(in: .whitespaces), limit]))
        } catch {
            board = .failed(errorText(error))
        }
    }
}
