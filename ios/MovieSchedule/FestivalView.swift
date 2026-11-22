import SwiftUI

/// 「電影」分頁的影展分類：選影展（同時有兩個以上時）、選日期，列出那一天的片
struct FestivalSection: View {
    @State private var board: Loadable<FestivalBoard> = .loading
    @State private var festId = ""
    @State private var date = ""
    @State private var year = 0 // 0 = 今年（今年還沒有就是最近有資料的那一年）

    var body: some View {
        Group {
            switch board {
            case .loading:
                Section { LoadingRow(text: "讀取影展場次…") }
            case .failed(let message):
                Section { ErrorRow(message: message) { Task { await load() } } }
            case .loaded(let b):
                if b.festivals.isEmpty {
                    Section { Text("目前沒有影展資料").foregroundStyle(.secondary) }
                } else {
                    if let years = b.years, years.count > 1 {
                        Section {
                            Picker("年份", selection: Binding(get: { b.year ?? 0 }, set: { year = $0; festId = ""; date = "" })) {
                                ForEach(years, id: \.self) { Text(String($0)).tag($0) }
                            }
                        }
                    }
                    // 還沒結束的和已經結束的分成兩區，各自一個清單，選中的打勾
                    ForEach(b.groups ?? []) { g in
                        Section {
                            ForEach(g.items) { x in
                                Button {
                                    festId = x.id; date = ""
                                } label: {
                                    HStack(spacing: 8) {
                                        Image(systemName: g.past ? "checkmark.seal" : "film").foregroundStyle(g.past ? Color.secondary : Color.orange)
                                        Text(x.name).foregroundStyle(g.past ? Color.secondary : Color.primary)
                                        Spacer(minLength: 4)
                                        if x.id == b.id { Image(systemName: "checkmark").foregroundStyle(Color.accentColor) }
                                    }
                                }
                            }
                        } header: {
                            Text("\(g.title)｜\(g.items.count) 個影展")
                        }
                    }
                    Section {
                        Picker("日期", selection: Binding(get: { b.date }, set: { date = $0 })) {
                            ForEach(b.dates, id: \.self) { Text(Fmt.dateLabel($0)).tag($0) }
                        }
                    } header: {
                        Text(b.name)
                    } footer: {
                        Text(b.range + ((b.past ?? false) ? "｜場次僅供回顧" : ""))
                    }
                    Section {
                        ForEach(b.day) { row in
                            NavigationLink {
                                FestivalFilmView(festId: b.id, filmId: row.film.id, title: row.film.title)
                            } label: {
                                HStack(spacing: 10) {
                                    FestivalPoster(film: row.film, width: 44)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(row.film.title).lineLimit(2)
                                        if let first = row.lines.first, !first.isEmpty {
                                            Text(first).font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                                        }
                                        if row.lines.count > 1, !row.lines[1].isEmpty {
                                            Text(row.lines[1]).font(.caption).foregroundStyle(.tertiary).lineLimit(2)
                                        }
                                    }
                                    Spacer(minLength: 4)
                                }
                            }
                        }
                        if b.day.isEmpty { Text("這一天沒有場次").foregroundStyle(.secondary) }
                    } header: {
                        Text("\(b.day.count) 部、\(b.day.reduce(0) { $0 + $1.count }) 場")
                    } footer: {
                        Text(b.footer)
                    }
                }
            }
        }
        .task(id: festId + "|" + date + "|" + String(year)) { await load() }
    }

    private func load() async {
        do {
            board = .loaded(try await Bridge.shared.call("festivalBoard", [festId, date, year]))
        } catch {
            if board.value == nil { board = .failed(errorText(error)) }
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
                        }
                    }
                    .listRowBackground(Color.clear)
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
