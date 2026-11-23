import SwiftUI

/// 要不要在 App 裡顯示 IMDb／爛番茄的分數。
/// 這兩家沒有開放分數給第三方 App 顯示：上架版（編譯時加 STORE_BUILD）一律只放「前往查看」的連結，也不會去讀它們的網站；
/// 內部測試版可以在設定裡自己開關。
enum ExternalScores {
    static let key = "showExternalScores"

    static var storeBuild: Bool {
        #if STORE_BUILD
        return true
        #else
        return false
        #endif
    }

    static var enabled: Bool {
        if storeBuild { return false }
        return UserDefaults.standard.object(forKey: key) as? Bool ?? true
    }
}

/// 網頁版的網址：「關於」與隱私權政策放在這裡（跟共用資料層的 SITE_URL 一致）
let siteURL = "https://app.twmovietime.workers.dev"
let privacyURL = URL(string: siteURL + "/privacy/")!
let aboutURL = URL(string: siteURL + "/about/")!

/// 資料來源與授權
struct AboutView: View {
    private struct Source: Identifiable {
        let name: String
        let detail: String
        let url: String
        var id: String { name }
    }

    private let showtimes = [
        Source(name: "場次通", detail: "連鎖影城的場次、片長、分級", url: "https://twshowtimes.com"),
        Source(name: "開眼電影網", detail: "其他戲院的場次、海報、預告、片長", url: "https://www.atmovies.com.tw"),
        Source(name: "誠品電影院", detail: "官網時刻表", url: "https://meet.eslite.com/tw/tc/gallery/movieschedule/201803020001"),
        Source(name: "光點華山電影館", detail: "官網時刻表", url: "https://www.spot-hs.org.tw"),
        Source(name: "光點台北", detail: "官網時刻表", url: "https://www.spot.org.tw"),
        Source(name: "樂聲影城", detail: "官網時刻表", url: "https://www.luxcinema.com.tw"),
    ]
    private let others = [
        Source(name: "全國電影票房統計", detail: "國家電影及視聽文化中心開放資料，依政府資料開放授權條款第 1 版使用", url: "https://boxofficetw.tfai.org.tw/"),
        Source(name: "The Movie Database（TMDB）", detail: "部分海報、片長，以及官網沒有劇照的影展片", url: "https://www.themoviedb.org"),
        Source(name: "YouTube", detail: "預告片連結", url: "https://www.youtube.com"),
        Source(name: "IMDb", detail: "電影評分頁連結", url: "https://www.imdb.com"),
        Source(name: "Rotten Tomatoes", detail: "電影評分頁連結", url: "https://www.rottentomatoes.com"),
    ]

    var body: some View {
        List {
            Section {
                Link(destination: URL(string: "https://twshowtimes.com/")!) { Label("前往場次通", systemImage: "heart") }
            } header: {
                Text("感謝場次通")
            } footer: {
                Text("全台 66 間連鎖影城的場次來自場次通（twshowtimes.com），由橫隔膜 Halami 獨立製作與維護。沒有場次通的整理，這個 App 做不出來。本 App 讀取的是場次通公開的網頁，雙方沒有合作或隸屬關係。")
            }
            Section {
                ForEach(showtimes) { row($0) }
            } header: {
                Text("場次")
            } footer: {
                Text("實際場次、票價與座位以各影城公告為準。")
            }
            Section {
                ForEach(others) { row($0) }
            } header: {
                Text("其他資料")
            } footer: {
                Text("This product uses the TMDB API but is not endorsed or certified by TMDB.\n\n各網站的名稱與標誌屬於其所有人。本 App 與上述網站、影城沒有合作或隸屬關係。")
            }
            Section {
                Link(destination: aboutURL) { Label("關於與資料來源（網頁）", systemImage: "info.circle") }
                Link(destination: privacyURL) { Label("隱私權政策", systemImage: "hand.raised") }
            } header: {
                Text("隱私")
            } footer: {
                Text("不用註冊、沒有廣告、不追蹤。位置只在手機上用來算距離；行事曆只新增、不讀取。")
            }
        }
        .navigationTitle("資料來源與授權")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func row(_ s: Source) -> some View {
        Link(destination: URL(string: s.url) ?? privacyURL) {
            VStack(alignment: .leading, spacing: 2) {
                Text(s.name)
                Text(s.detail).font(.footnote).foregroundStyle(Color(.secondaryLabel)) // 連結裡的 .secondary 會被染成藍色，改用固定的灰色
            }
        }
    }
}
