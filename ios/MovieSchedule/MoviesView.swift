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
                    }
                    .pickerStyle(.segmented)
                }
                if mode == "box" {
                    BoxOfficeSection()
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
            let now = list.filter { !($0.comingSoon ?? false) }
            let soon = list.filter { $0.comingSoon ?? false }
            if !now.isEmpty {
                Section {
                    ForEach(now) { row($0) }
                } header: {
                    Text("上映中（\(now.count)）")
                } footer: {
                    Text("依今天放映的影城數排序，資料來自場次通。")
                }
            }
            if !soon.isEmpty {
                Section("即將上映（\(soon.count)）") {
                    ForEach(soon) { row($0) }
                }
            }
        }
    }

    private func row(_ m: TwMovie) -> some View {
        NavigationLink {
            MovieDetailView(movie: m)
        } label: {
            HStack(spacing: 10) {
                PosterView(title: m.title, slug: m.slug, en: m.en)
                VStack(alignment: .leading, spacing: 2) {
                    Text(m.title).lineLimit(2)
                    Text([m.rating ?? "", (m.runtime ?? 0) > 0 ? "\(m.runtime ?? 0) 分" : "", m.en ?? ""].filter { !$0.isEmpty }.joined(separator: "｜"))
                        .font(.subheadline).foregroundStyle(.secondary).lineLimit(2)
                }
                Spacer(minLength: 4)
                if let n = m.cinemaCount, n > 0 {
                    Text("\(n) 間").font(.caption).foregroundStyle(.tertiary)
                }
            }
        }
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
    @State private var board: Loadable<BoxOfficeBoard> = .loading

    var body: some View {
        Group {
            switch board {
            case .loading:
                Section { LoadingRow(text: "讀取票房排行…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let b):
                Section {
                    ForEach(b.rows) { r in
                        if let m = r.m {
                            NavigationLink { MovieDetailView(movie: m) } label: { rowLabel(r) }
                        } else {
                            rowLabel(r)
                        }
                    }
                } header: {
                    Text(b.label)
                } footer: {
                    Text("資料來源：\(b.source)。官方每週更新一次。")
                }
            }
        }
        .task { if board.value == nil { await load() } }
    }

    private func rowLabel(_ r: BoxOfficeRow) -> some View {
        HStack(spacing: 10) {
            Text("\(r.x.rank)")
                .font(.title3.bold()).monospacedDigit()
                .foregroundStyle(r.x.rank <= 3 ? Color.orange : Color.secondary)
                .frame(width: 28)
            PosterView(title: r.m?.title ?? r.x.name, slug: r.m?.slug, en: r.m?.en)
            VStack(alignment: .leading, spacing: 2) {
                Text(r.x.name).lineLimit(2)
                Text([r.x.week.map { "本週 \(Fmt.money($0))" } ?? "", "累計 \(Fmt.money(r.x.total))"].filter { !$0.isEmpty }.joined(separator: "｜"))
                    .font(.subheadline).foregroundStyle(.secondary)
            }
            Spacer(minLength: 4)
            if let t = r.x.theaters, t > 0 {
                Text("\(t) 間").font(.caption).foregroundStyle(.tertiary)
            }
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
