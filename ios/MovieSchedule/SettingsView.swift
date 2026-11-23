import SwiftUI

struct SettingsView: View {
    @AppStorage("ads") private var ads = 10
    @AppStorage("alarm") private var alarm = 60
    @AppStorage(ExternalScores.key) private var showScores = true
    @ObservedObject private var settings = SettingsStore.shared

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("預留廣告預告", selection: $ads) {
                        ForEach([0, 10, 15, 20], id: \.self) { Text("\($0) 分鐘").tag($0) }
                    }
                    Picker("提醒", selection: $alarm) {
                        Text("不提醒").tag(0)
                        ForEach([15, 30, 60, 120], id: \.self) { Text("開演前 \($0 >= 60 ? "\($0 / 60) 小時" : "\($0) 分鐘")").tag($0) }
                    }
                } header: {
                    Text("行程")
                } footer: {
                    Text("廣告預告：依《電影法施行細則》，戲院每場正片前的廣告與預告合計原則上是 9 分鐘（預告片可以再多放），所以預設預留 10 分鐘。各戲院實際長度不同，可以自己調整。")
                }
                Section("導航") {
                    Picker("地圖", selection: $settings.maps) {
                        Text("Apple 地圖").tag("apple")
                        Text("Google 地圖").tag("google")
                    }
                }
                Section {
                    LabeledContent("收藏影城", value: "\(settings.favorites.count) 間")
                } footer: {
                    Text("到「影城」分頁打開一間影城，點右上角的星星加入或移除。")
                }
                if !ExternalScores.storeBuild {
                    Section {
                        Toggle("顯示 IMDb／爛番茄分數", isOn: $showScores)
                    } header: {
                        Text("評分")
                    } footer: {
                        Text("關閉後，電影頁只放「到 IMDb／爛番茄查看」的連結，App 不會去讀這兩個網站。")
                    }
                }
                Section {
                    NavigationLink { AboutView() } label: { Label("資料來源與授權", systemImage: "doc.text") }
                        .accessibilityIdentifier("about-link")
                    Link(destination: privacyURL) { Label("隱私權政策", systemImage: "hand.raised") }
                }
                Section {
                    LabeledContent("版本", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")
                    // 場次的讀法與整理（資料層）會自己在背景更新，下次開啟生效；這一行是現在用的那一版
                    LabeledContent("資料版本", value: Bridge.shared.coreVersion.isEmpty ? "讀取中" : Bridge.shared.coreVersion)
                } header: {
                    Text("關於")
                } footer: {
                    Text("實際場次以影城公告為準。")
                }
            }
            .navigationTitle("設定")
        }
    }
}
