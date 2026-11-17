import SwiftUI

@main
struct MovieScheduleApp: App {
    var body: some Scene {
        WindowGroup {
            TabView {
                HomeView()
                    .tabItem { Label("首頁", systemImage: "house") }
                MoviesView()
                    .tabItem { Label("電影", systemImage: "film") }
                CinemasView()
                    .tabItem { Label("影城", systemImage: "building.2") }
                SettingsView()
                    .tabItem { Label("設定", systemImage: "gearshape") }
            }
            .task { SettingsStore.shared.sync() } // 啟動時把常去影城、TMDB 金鑰交給資料層
        }
    }
}

/// 列表裡共用的讀取中／錯誤列
struct LoadingRow: View {
    var text = "讀取中…"
    var body: some View {
        HStack(spacing: 10) {
            ProgressView()
            Text(text).foregroundStyle(.secondary)
        }
    }
}

struct ErrorRow: View {
    let message: String
    let retry: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(message, systemImage: "exclamationmark.triangle").foregroundStyle(.red)
            Button("重試", action: retry)
        }
    }
}
