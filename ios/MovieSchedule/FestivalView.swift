import SwiftUI

/// 「電影」分頁的影展分類：選影展（同時有兩個以上時）、選日期，列出那一天的片
struct FestivalSection: View {
    var query: String = "" // 搜尋片名（這一年所有影展，不分日期）
    @State private var board: Loadable<FestivalBoard> = .loading
    @State private var festId = ""
    @State private var date = ""
    @State private var showPast = false // 已結束的影展清單有沒有展開
    @State private var year = 0 // 0 = 今年（今年還沒有就是最近有資料的那一年）

    /// 選的東西有變就重讀（用陣列接起來：一長串字串相加編譯器會算不出型別）
    private var loadKey: String { [festId, date, String(year), query].joined(separator: "|") }

    var body: some View {
        Group {
            switch board {
            case .loading:
                Section { LoadingRow(text: "讀取影展場次…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let b):
                loaded(b)
            }
        }
        .task(id: loadKey) { await load() }
    }

    // 畫面拆成幾段各自一個函式：全部寫在 body 裡編譯器會算不出型別
    @ViewBuilder private func loaded(_ b: FestivalBoard) -> some View {
        let k = query.trimmingCharacters(in: .whitespaces)
        if !k.isEmpty {
            searchSection(b, k)
        } else if b.festivals.isEmpty {
            Section { Text("目前沒有影展資料").foregroundStyle(.secondary) }
        } else {
            yearSection(b)
            groupSections(b)
            dateSection(b)
            daySection(b)
        }
    }

    @ViewBuilder private func searchSection(_ b: FestivalBoard, _ k: String) -> some View {
        let hits = b.hits ?? []
        Section {
            ForEach(hits) { row in
                FestivalFilmRow(festId: row.festId, film: row.film, lines: row.lines)
            }
            if hits.isEmpty { Text("這一年的影展裡找不到這個片名").foregroundStyle(.secondary) }
        } header: {
            Text("「\(k)」｜\(hits.count) 部")
        } footer: {
            Text("搜尋這一年所有影展的片名，不分日期。清空搜尋就回到每天的片單。")
        }
    }

    @ViewBuilder private func yearSection(_ b: FestivalBoard) -> some View {
        if let years = b.years, years.count > 1 {
            Section {
                Picker("年份", selection: Binding(get: { b.year ?? 0 }, set: { year = $0; festId = ""; date = "" })) {
                    ForEach(years, id: \.self) { Text(String($0)).tag($0) }
                }
            }
        }
    }

    // 還沒結束的和已經結束的分成兩區，各自一個清單，選中的打勾
    @ViewBuilder private func groupSections(_ b: FestivalBoard) -> some View {
        ForEach(b.groups ?? []) { g in
            let fold = g.past && g.items.count > 3 // 已結束的很多個：預設收起來，只留展開鈕和目前選中的那一個
            Section {
                if fold {
                    Button {
                        showPast.toggle()
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: showPast ? "chevron.down" : "chevron.right").foregroundStyle(Color.secondary)
                            Text(showPast ? "收合已結束的影展" : "顯示全部 \(g.items.count) 個已結束的影展").foregroundStyle(Color.primary)
                            Spacer(minLength: 4)
                        }
                    }
                }
                ForEach(g.items.filter { !fold || showPast || $0.id == b.id }) { x in
                    groupRow(x, past: g.past, picked: x.id == b.id)
                }
            } header: {
                Text("\(g.title)｜\(g.items.count) 個影展")
            }
        }
    }

    private func groupRow(_ x: FestivalBoard.Item, past: Bool, picked: Bool) -> some View {
        Button {
            festId = x.id; date = ""
        } label: {
            HStack(spacing: 8) {
                Image(systemName: past ? "checkmark.seal" : "film").foregroundStyle(past ? Color.secondary : Color.orange)
                Text(x.name).foregroundStyle(past ? Color.secondary : Color.primary)
                Spacer(minLength: 4)
                if picked { Image(systemName: "checkmark").foregroundStyle(Color.accentColor) }
            }
        }
    }

    @ViewBuilder private func dateSection(_ b: FestivalBoard) -> some View {
        Section {
            Picker("日期", selection: Binding(get: { b.date }, set: { date = $0 })) {
                ForEach(b.dates, id: \.self) { Text(Fmt.dateLabel($0)).tag($0) }
            }
        } header: {
            Text(b.name)
        } footer: {
            Text(b.range + ((b.past ?? false) ? "｜場次僅供回顧" : ""))
        }
    }

    @ViewBuilder private func daySection(_ b: FestivalBoard) -> some View {
        let total = b.day.reduce(0) { $0 + $1.count }
        Section {
            ForEach(b.day) { row in
                FestivalFilmRow(festId: b.id, film: row.film, lines: row.lines)
            }
            if b.day.isEmpty { Text("這一天沒有場次").foregroundStyle(.secondary) }
        } header: {
            Text("\(b.day.count) 部、\(total) 場")
        } footer: {
            Text(b.footer)
        }
    }

    private func load() async {
        do {
            board = .loaded(try await Bridge.shared.call("festivalBoard", [festId, date, year, query]))
        } catch {
            if board.value == nil { board = .failed(errorText(error)) }
        }
    }
}

/// 影展片單的一列：劇照、片名、兩行說明，點進去是那部片的場次
struct FestivalFilmRow: View {
    let festId: String
    let film: FestivalFilm
    let lines: [String]

    var body: some View {
        NavigationLink {
            FestivalFilmView(festId: festId, filmId: film.id, title: film.title)
        } label: {
            HStack(spacing: 10) {
                FestivalPoster(film: film, width: 44)
                VStack(alignment: .leading, spacing: 2) {
                    Text(film.title).lineLimit(2)
                    if let first = lines.first, !first.isEmpty {
                        Text(first).font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                    }
                    if lines.count > 1, !lines[1].isEmpty {
                        Text(lines[1]).font(.caption).foregroundStyle(.tertiary).lineLimit(2)
                    }
                }
                Spacer(minLength: 4)
            }
        }
    }
}

/// 影展的一部片：列出還沒演的所有場次，點一場進確認頁加入行事曆
struct FestivalFilmView: View {
    let festId: String
    let filmId: String
    let title: String

    @Environment(\.openURL) private var openURL
    @State private var detail: Loadable<FestivalFilmDetail> = .loading

    var body: some View {
        List {
            switch detail {
            case .loading:
                Section { LoadingRow(text: "讀取場次…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let d):
                let mins = d.film.mins ?? 0
                Section {
                    HStack(alignment: .bottom, spacing: 12) {
                        FestivalPoster(film: d.film, width: 104)
                        VStack(alignment: .leading, spacing: 4) {
                            Text([d.film.rating ?? "", mins > 0 ? "\(mins) 分鐘" : ""].filter { !$0.isEmpty }.joined(separator: "｜"))
                                .font(.subheadline).foregroundStyle(.secondary)
                            Text(d.name).font(.subheadline).foregroundStyle(.secondary)
                            Text("影展片名，院線上映時可能不同").font(.footnote).foregroundStyle(.tertiary)
                            if let t = d.trailerUrl, let turl = URL(string: t) {
                                Button { openURL(turl) } label: {
                                    Label(d.trailerLabel ?? "觀看預告", systemImage: "play.fill")
                                        .font(.subheadline.weight(.semibold)).lineLimit(1)
                                        .foregroundStyle(.white) // 列表裡的圖示預設會染成藍色
                                }
                                .buttonStyle(.borderedProminent).buttonBorderShape(.capsule).tint(.red).padding(.top, 4)
                            }
                        }
                    }
                    .listRowBackground(Color.clear)
                }
                let intro = d.film.intro ?? ""
                let credits = d.film.credits ?? ""
                if !(intro.isEmpty && credits.isEmpty) {
                    Section {
                        if !intro.isEmpty { Text(intro).font(.subheadline) }
                        if !credits.isEmpty { Text(credits).font(.footnote).foregroundStyle(.secondary) }
                    } header: {
                        Text("介紹")
                    } footer: {
                        Text("介紹來自\(d.source ?? "影展官網")。")
                    }
                }
                Section {
                    ForEach(d.sessions) { s in
                        NavigationLink {
                            ConfirmView(pick: ShowPick(title: d.film.title, versionLabel: s.place, cinemaName: s.cinema.name, address: s.cinema.address ?? "", date: s.date, time: s.time, runtime: mins, bookingUrl: s.ticket ?? "", cinema: s.cinema))
                        } label: {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("\(Fmt.dateLabel(s.date))　\(s.time)").font(.body.monospacedDigit())
                                Text(s.place).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                            }
                        }
                    }
                    if d.sessions.isEmpty { Text("找不到這部片的場次").foregroundStyle(.secondary) }
                } header: {
                    Text("場次")
                } footer: {
                    Text((d.past ?? false) ? "這個影展已經結束，場次僅供回顧。" : "點一場加入行事曆。")
                }
                if let u = d.film.url, let url = URL(string: u) {
                    Section {
                        Button { openURL(url) } label: { Label("官網的影片介紹", systemImage: "safari") }
                    }
                }
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .task { if detail.value == nil { await load() } }
    }

    private func load() async {
        do {
            if let d: FestivalFilmDetail = try await Bridge.shared.callOptional("festivalFilm", [festId, filmId]) {
                detail = .loaded(d)
            } else {
                detail = .failed("找不到這部片的場次，影展可能已經結束。")
            }
        } catch {
            detail = .failed(errorText(error))
        }
    }
}

/// 影展的小海報：官網有給劇照就用，沒有就用片名畫的預設海報（不上網查，影展片名多半對不到院線資料）
struct FestivalPoster: View {
    let film: FestivalFilm
    var width: CGFloat = 44

    var body: some View {
        if let u = film.poster, !u.isEmpty {
            PosterView(title: film.title, width: width, directURL: u)
        } else {
            GeneratedPoster(title: film.title, width: width).clipShape(RoundedRectangle(cornerRadius: width > 60 ? 12 : 6))
        }
    }
}
