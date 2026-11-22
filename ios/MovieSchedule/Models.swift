import Foundation

// 資料層（core.js）回傳的資料型別。欄位名稱與 src/core.ts、src/parsers.ts 一致。

struct Cinema: Codable, Hashable, Identifiable {
    var id: String
    var name: String
    var city: String
    var district: String?
    var source: String
    var url: String
    var address: String?
    var aliases: String?
}

struct ShowVersion: Codable, Hashable {
    var label: String
    var times: [String]
}

/// 影城片單上的一部片
struct Movie: Codable, Hashable {
    var title: String
    var runtime: Int?
    var rating: String?
    var versions: [ShowVersion]
    var runtimeFrom: String?
}

/// 場次通電影清單上的一部片
struct TwMovie: Codable, Hashable, Identifiable {
    var slug: String
    var title: String
    var en: String?
    var rating: String?
    var runtime: Int?
    var runtimeFrom: String?
    var cinemaCount: Int?
    var comingSoon: Bool?
    var release: String?
    var noShowToday: Bool?
    var id: String { slug }
}

struct TwMovieCinema: Codable, Hashable, Identifiable {
    var id: String
    var name: String
    var city: String
    var district: String?
    var address: String?
    var versions: [ShowVersion]
    var full: Bool? // 已經從影城頁補齊所有版本（電影頁每間影城只列一種）
}

/// 「依電影找場次」的一列：某一天、某間影城
struct MovieBoardRow: Codable, Hashable, Identifiable {
    var date: String
    var cinema: TwMovieCinema
    var id: String { cinema.id + "|" + date }
}
/// 「依電影找場次」整頁的資料（條件複選後由共用資料層算好）
struct MovieBoard: Codable {
    var title: String
    var rating: String?
    var runtime: Int?
    var release: String?
    var total: Int
    var dates: [String]     // 可以選的日期
    var selDates: [String]  // 實際採用的日期
    var cities: [String]    // 這幾天有放映的縣市
    var formats: [String]   // 這幾天有的特殊廳
    var rows: [MovieBoardRow]
}

struct TwMovieDay: Codable {
    var title: String
    var en: String?
    var rating: String?
    var runtime: Int?
    var runtimeFrom: String?
    var release: String?
    var date: String
    var dates: [String]
    var cinemas: [TwMovieCinema]
}

struct CinemaDates: Codable {
    var dates: [String]
    var address: String?
    var notice: String?
    var site: String?
}

struct CinemaDay: Codable {
    var movies: [Movie]
    var booking: String?
    var sourceUrl: String?
    var address: String?
}

struct MovieExtras: Codable {
    var poster: String?
    var trailer: String?
    var trailerName: String?
    var err: String?
}

struct Ratings: Codable {
    struct Imdb: Codable { var score: Double; var votes: Double?; var url: String }
    struct Tomato: Codable { var score: Double; var certified: Bool?; var url: String }
    struct Popcorn: Codable { var score: Double; var url: String }
    var imdb: Imdb?
    var tomato: Tomato?
    var popcorn: Popcorn?
    var err: String?
}

struct RuntimeInfo: Codable {
    var runtime: Int
    var from: String?
}

struct BoxOfficeItem: Codable, Hashable {
    var rank: Int
    var name: String
    var country: String?
    var release: String?
    var theaters: Int?
    var week: Double?
    var since: Bool?
    var showing: Bool?
    var total: Double
}

struct BoxOfficeRow: Codable, Identifiable {
    var x: BoxOfficeItem
    var m: TwMovie?
    var lines: [String]? // 兩行說明（共用資料層依排法算好：金額一行、上映日期與戲院數一行）
    var light: Bool?     // 已下檔的舊片：海報用輕量查法（一部片一個小請求）
    var id: Int { x.rank }
}

struct BoxOfficeBoard: Codable {
    var label: String
    var source: String
    var footer: String?   // 排行下方的說明
    struct Sort: Codable, Hashable, Identifiable { var id: String; var label: String }
    var sorts: [Sort]?    // 可以切換的排法：本週、累計（都只排上映中的片）、年度（含已下檔）
    var sort: String?        // 實際採用的排法
    var years: [String]?     // 年度排行可以選的年份（新的在前）
    var selYears: [String]?  // 實際採用的年份
    var total: Int?          // 符合條件的總數（比 rows 多的話還有下一批）
    struct Week: Codable, Hashable, Identifiable { var id: String; var label: String; var note: String }
    var weeks: [Week]?       // 週票房可以選的週次（新的在前）
    var selWeek: String?     // 實際採用的那一週
    var rows: [BoxOfficeRow]
}

/// 選好的一場，交給確認頁
struct ShowPick: Hashable {
    var title: String
    var versionLabel: String
    var cinemaName: String
    var address: String
    var date: String // 片單日期（影城營業日）
    var time: String // HH:mm
    var runtime: Int
    var bookingUrl: String // 已知的訂票網址；空的話到確認頁再查影城官網
    var cinema: Cinema? = nil // 用來補地址、查訂票網址與官方 App
}

struct ScopedCinema: Codable, Hashable, Identifiable {
    var cinema: Cinema
    var km: Double?
    var id: String { cinema.id }
}

/// 「現在有什麼可以看」的一場
struct Hit: Codable, Hashable {
    struct Context: Codable, Hashable {
        var booking: String?
        var sourceUrl: String?
        var address: String?
    }
    var cinema: Cinema
    var movie: Movie
    var version: ShowVersion
    var time: String
    var date: String
    var km: Double?
    var day: String? // 查的是哪一天（複選多天時分日期顯示）
    var ctx: Context?
}

struct NowGroup: Codable, Identifiable {
    var title: String
    var runtime: Int?
    var rating: String?
    var hits: [Hit]
    var id: String { title }
}

struct NowResult: Codable {
    var groups: [NowGroup]
    var failed: [String]?
    var noData: [String]? // 來源沒有這天資料的影城（不是讀取失敗）
}

/// 觀眾評分
struct Community: Codable {
    var n: Int
    var avg: Double
    var dist: [Int]?
    var mine: Int?
}

struct CinemaAppInfo: Codable {
    var name: String
    var id: String
    var url: String
    var schemes: [String]
}
