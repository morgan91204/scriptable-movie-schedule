import SwiftUI
import EventKit

/// 確認行程：調整片長、廣告時間、影廳座位，加入行事曆
struct ConfirmView: View {
    let pick: ShowPick

    @Environment(\.openURL) private var openURL
    @ObservedObject private var settings = SettingsStore.shared
    @State private var address: String
    @State private var appInfo: CinemaAppInfo?
    @AppStorage("ads") private var ads = 15
    @AppStorage("alarm") private var alarm = 60
    @State private var runtimeText: String
    @State private var seat = ""
    @State private var busy = false
    @State private var saved = false
    @State private var message: String?

    init(pick: ShowPick) {
        self.pick = pick
        _runtimeText = State(initialValue: pick.runtime > 0 ? String(pick.runtime) : "")
        _address = State(initialValue: pick.address)
    }

    /// 分享給朋友的文字
    private var shareText: String {
        guard let start else { return pick.title }
        let maps = settings.mapsURL(name: pick.cinemaName, address: address)?.absoluteString ?? ""
        return [
            "🎬 \(pick.title)",
            "🕒 \(Fmt.full(start))" + (runtime > 0 ? " – \(end.map { Fmt.hm($0) } ?? "")" : ""),
            "📍 \(pick.cinemaName)（\(pick.versionLabel)）",
            seat.trimmingCharacters(in: .whitespaces).isEmpty ? "" : "💺 \(seat)",
            address.isEmpty ? "" : "🏠 \(address)",
            maps.isEmpty ? "" : "🗺 \(maps)",
        ].filter { !$0.isEmpty }.joined(separator: "\n")
    }

    /// 訂票網址：已知的官方連結 → 影城官網 → 時刻表
    private func openBooking() async {
        var target = pick.bookingUrl
        if target.isEmpty, let cinema = pick.cinema {
            target = (try? await Bridge.shared.call("bookingUrl", [["cinema": Bridge.json(cinema), "booking": ""] as [String: Any]], as: String.self)) ?? cinema.url
        }
        if let u = URL(string: target) { openURL(u) }
    }

    private var runtime: Int { Int(runtimeText.trimmingCharacters(in: .whitespaces)) ?? 0 }
    private var start: Date? { Fmt.showDate(date: pick.date, time: pick.time) }
    private var end: Date? { start?.addingTimeInterval(Double((runtime > 0 ? runtime : 120) + ads) * 60) }

    var body: some View {
        Form {
            Section {
                LabeledContent("電影", value: pick.title)
                LabeledContent("版本", value: pick.versionLabel)
                LabeledContent("影城", value: pick.cinemaName)
                if !address.isEmpty {
                    Button {
                        if let u = settings.mapsURL(name: pick.cinemaName, address: address) { openURL(u) }
                    } label: {
                        LabeledContent("地址") { Text(address).multilineTextAlignment(.trailing) }
                    }
                }
                if let start, let end {
                    LabeledContent("時間", value: Fmt.full(start))
                    LabeledContent("預計散場", value: Fmt.hm(end))
                }
            } footer: {
                if Fmt.isLate(pick.time) { Text("凌晨場：已自動算到隔天日期，請再核對電影票。") }
            }

            Section {
                HStack {
                    Text("片長（分鐘）")
                    TextField("例如 120", text: $runtimeText).keyboardType(.numberPad).multilineTextAlignment(.trailing)
                }
                Picker("預留廣告預告", selection: $ads) {
                    ForEach([0, 10, 15, 20], id: \.self) { Text("\($0) 分鐘").tag($0) }
                }
                Picker("提醒", selection: $alarm) {
                    Text("不提醒").tag(0)
                    ForEach([15, 30, 60, 120], id: \.self) { Text("開演前 \($0 >= 60 ? "\($0 / 60) 小時" : "\($0) 分鐘")").tag($0) }
                }
                HStack {
                    Text("影廳／座位")
                    TextField("選填", text: $seat).multilineTextAlignment(.trailing)
                }
            } header: {
                Text("可調整")
            } footer: {
                if pick.runtime == 0 { Text("資料來源沒有提供片長，請手動輸入。") }
            }

            Section {
                if saved {
                    Label("已加入行事曆", systemImage: "checkmark.circle.fill").foregroundStyle(.green)
                } else {
                    Button {
                        Task { await save() }
                    } label: {
                        Label(busy ? "加入中…" : "加入行事曆", systemImage: "calendar.badge.plus")
                    }
                    .disabled(busy)
                }
                if let message { Text(message).font(.footnote).foregroundStyle(.red) }
            }

            Section {
                Button { Task { await openBooking() } } label: { Label("以瀏覽器訂票", systemImage: "globe") }
                if let appInfo {
                    Button { Task { await openCinemaApp(appInfo) } } label: { Label("以 App 訂票（\(appInfo.name)）", systemImage: "iphone") }
                }
            } footer: {
                if let appInfo { Text("已安裝「\(appInfo.name)」App 會直接開啟；開不了時會打開 App Store 頁面。") }
            }

            Section {
                ShareLink(item: shareText) { Label("分享這場給朋友", systemImage: "square.and.arrow.up") }
            }
        }
        .navigationTitle("確認行程")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            guard let cinema = pick.cinema else { return }
            let c = Bridge.json(cinema)
            if address.isEmpty, let a = try? await Bridge.shared.call("cinemaAddress", [c], as: String.self) { address = a }
            appInfo = try? await Bridge.shared.callOptional("cinemaApp", [c])
        }
    }

    private func save() async {
        guard runtime > 0 else {
            message = "請先輸入片長（分鐘）。"
            return
        }
        guard let start, let end else {
            message = "場次時間格式不對。"
            return
        }
        busy = true
        defer { busy = false }
        let store = EKEventStore()
        do {
            // 只要求「新增行程」的權限，不會讀到你的行事曆內容
            guard try await store.requestWriteOnlyAccessToEvents() else {
                message = "沒有行事曆權限。請到「設定 → 電影行程」開啟行事曆。"
                return
            }
            let event = EKEvent(eventStore: store)
            event.title = pick.title
            event.startDate = start
            event.endDate = end
            event.location = address.isEmpty ? pick.cinemaName : "\(pick.cinemaName)\n\(address)"
            event.notes = [
                "\(pick.cinemaName)（\(pick.versionLabel)）",
                seat.trimmingCharacters(in: .whitespaces).isEmpty ? "" : "影廳／座位：\(seat)",
                "正片：\(runtime) 分鐘；廣告預告：\(ads) 分鐘",
                pick.bookingUrl.isEmpty ? "" : "訂票／官方：\(pick.bookingUrl)",
            ].filter { !$0.isEmpty }.joined(separator: "\n")
            event.url = URL(string: pick.bookingUrl)
            event.calendar = store.defaultCalendarForNewEvents
            if alarm > 0 { event.addAlarm(EKAlarm(relativeOffset: TimeInterval(-alarm * 60))) }
            try store.save(event, span: .thisEvent)
            saved = true
            message = nil
        } catch {
            message = "加入失敗：\(error.localizedDescription)"
        }
    }
}
