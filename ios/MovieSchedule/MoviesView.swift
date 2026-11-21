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

    var body: some View {
        Group {
            switch board {
            case .loading:
                Section { LoadingRow(text: "讀取票房排行…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let b):
                let k = query.trimmingCharacters(in: .whitespaces).lowercased()
                let rows = b.rows.filter { k.isEmpty || "\($0.x.name) \($0.m?.en ?? "")".lowercased().contains(k) }
                Section {
                    ForEach(rows) { r in
                        if let m = r.m {
                            NavigationLink { MovieDetailView(movie: m) } label: { rowLabel(r) }.accessibilityIdentifier("box-row")
                        } else {
                            rowLabel(r)
                        }
                    }
                } header: {
                    Text(b.label)
                } footer: {
                    Text("\(rows.isEmpty ? "排行上找不到相符的電影。\n" : "")這週有賣出票的電影共 \(b.rows.count) 部。\(b.rows.contains { $0.x.since ?? false } ? "標「上映至今」的是官方這週才第一次列入的新片：沒有上週的數字可以相減，排名用的是上映以來的累計，會比單週多。" : "")資料來源：\(b.source)。官方每週更新一次。")
                }
            }
        }
        .task { if board.value == nil { await load() } }
    }

    private func rowLabel(_ r: BoxOfficeRow) -> some View {
        HStack(spacing: 10) {
            Text("\(r.x.rank)")
                .font(r.x.rank >= 100 ? .subheadline.bold() : .title3.bold()).monospacedDigit()
                .foregroundStyle(r.x.rank <= 3 ? Color.orange : Color.secondary)
                .lineLimit(1).minimumScaleFactor(0.6)
                .frame(width: 36)
            PosterView(title: r.m?.title ?? r.x.name, slug: r.m?.slug, en: r.m?.en)
            VStack(alignment: .leading, spacing: 2) {
                Text(r.x.name).lineLimit(2)
                // 第一行金額、第二行上映日期與戲院數：各自一行不換行
                // since：官方這週才第一次列入的新片，沒有單週數字，只顯示上映至今
                Text((r.x.since ?? false) ? "上映至今 \(Fmt.money(r.x.total))" : [r.x.week.map { "本週 \(Fmt.money($0))" } ?? "", "累計 \(Fmt.money(r.x.total))"].filter { !$0.isEmpty }.joined(separator: "｜"))
                    .font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                let second = [Fmt.release(r.x.release), (r.x.theaters ?? 0) > 0 ? "\(r.x.theaters ?? 0) 間戲院" : ""].filter { !$0.isEmpty }.joined(separator: "｜")
                if !second.isEmpty {
                    Text(second).font(.caption).foregroundStyle(.tertiary).lineLimit(1).minimumScaleFactor(0.8)
                }
            }
            Spacer(minLength: 4)
        }
    }

    private func load() async {
        do {
            board = .loaded(try await Bridge.shared.call("boxOffice"))
        } catch {
            board = .failed(errorText(error))
        }
    }
}
