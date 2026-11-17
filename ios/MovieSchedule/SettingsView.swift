import SwiftUI

struct SettingsView: View {
    @AppStorage("ads") private var ads = 15
    @AppStorage("alarm") private var alarm = 60

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
                Section {
                    LabeledContent("版本", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")
                } header: {
                    Text("關於")
                } footer: {
                    Text("場次來自場次通、開眼電影網與各影城官網；票房來自國家電影及視聽文化中心「全國電影票房統計」。實際場次以影城公告為準。")
                }
            }
            .navigationTitle("設定")
        }
    }
}
