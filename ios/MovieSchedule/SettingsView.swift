import SwiftUI

struct SettingsView: View {
    @AppStorage("ads") private var ads = 15
    @AppStorage("alarm") private var alarm = 60
    @ObservedObject private var settings = SettingsStore.shared
    @State private var tokenDraft = ""
    @State private var tmdbStatus = ""
    @State private var testing = false

    var body: some View {
        NavigationStack {
            Form {
                Section("行程") {
                    Picker("預留廣告預告", selection: $ads) {
                        ForEach([0, 10, 15, 20], id: \.self) { Text("\($0) 分鐘").tag($0) }
                    }
                    Picker("提醒", selection: $alarm) {
                        Text("不提醒").tag(0)
                        ForEach([15, 30, 60, 120], id: \.self) { Text("開演前 \($0 >= 60 ? "\($0 / 60) 小時" : "\($0) 分鐘")").tag($0) }
                    }
                }
                Section("導航") {
                    Picker("地圖", selection: $settings.maps) {
                        Text("Apple 地圖").tag("apple")
                        Text("Google 地圖").tag("google")
                    }
                }
                Section {
                    TextField("貼上 TMDB 金鑰（選填）", text: $tokenDraft)
                        .textInputAutocapitalization(.never).autocorrectionDisabled()
                    Button(testing ? "測試中…" : "儲存並測試") { Task { await saveToken() } }.disabled(testing)
                    if !tmdbStatus.isEmpty { Text(tmdbStatus).font(.footnote).foregroundStyle(.secondary) }
                } header: {
                    Text("補片長（TMDB）")
                } footer: {
                    Text("場次來源沒有片長時，會用片名到 TMDB 查。免費申請，金鑰只存在你的手機。清空後儲存就是停用。")
                }
                Section {
                    LabeledContent("常去影城", value: "\(settings.favorites.count) 間")
                } footer: {
                    Text("到「影城」分頁打開一間影城，點右上角的星星加入或移除。")
                }
                Section {
                    LabeledContent("版本", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")
                } header: {
                    Text("關於")
                } footer: {
                    Text("場次來自場次通、開眼電影網與各影城官網；票房來自國家電影及視聽文化中心「全國電影票房統計」。實際場次以影城公告為準。")
                }
            }
            .navigationTitle("設定")
            .onAppear { tokenDraft = settings.tmdbToken }
        }
    }

    private func saveToken() async {
        let token = tokenDraft.trimmingCharacters(in: .whitespacesAndNewlines)
        settings.tmdbToken = token
        guard !token.isEmpty else {
            tmdbStatus = "已停用。"
            return
        }
        testing = true
        defer { testing = false }
        do {
            let sample: String = try await Bridge.shared.call("tmdbTest", [token])
            tmdbStatus = "✅ 金鑰可以用（測試：\(sample)）"
        } catch {
            tmdbStatus = "❌ \(errorText(error))"
        }
    }
}
