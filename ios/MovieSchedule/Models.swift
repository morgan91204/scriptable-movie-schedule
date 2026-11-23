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
    var score: Double?
    var scoreFew: Bool?
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
    var intro: String?      // 劇情簡介（場次通電影頁附的）
    var credits: String?    // 導演、演員（各一行）
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
    struct Country: Codable, Hashable, Identifiable { var id: String; var label: String }
    var countries: [Country]? // 這份排行裡有哪些國別（多的在前）
    var selCountries: [String]? // 實際採用的出品國別（可以複選；空 = 全部）
    var everyone: Int?        // 不分國別的總數
    var countryNote: String?  // 「出品國別」底下的說明（排行是台灣的票房，國別只是篩選出品國）
    var rows: [BoxOfficeRow]
}

/// 「電影」清單的一列：x = 票房資料（沒進榜沒有），m = 場次通的電影（已下檔沒有）
struct FilmEntry: Codable, Identifiable {
    var key: String
    var rank: Int?
    var name: String
    var x: BoxOfficeItem?
    var m: TwMovie?
    var lines: [String]   // 兩行說明（共用資料層依排法算好）
    var light: Bool?      // 已下檔的舊片：海報用輕量查法
    var id: String { key }
}
/// 「電影」清單整頁：上映中與票房排行合成一份
struct FilmList: Codable {
    struct Option: Codable, Hashable, Identifiable { var id: String; var label: String; var sub: String? }
    var scope: String          // 範圍：now 上映中／year 年度（含已下檔）
    var scopes: [Option]
    var sort: String           // 上映中的排法
    var sorts: [Option]        // 範圍是年度時是空的
    var order: String          // 畫面上範圍和排序併成一個選單：實際採用的那一項
    var orders: [Option]       // 上映中的幾種排法，最後一項是年度排行（含已下檔）
    var years: [String]
    var selYears: [String]
    var weeks: [BoxOfficeBoard.Week]
    var selWeek: String
    var countries: [BoxOfficeBoard.Country]
    var selCountries: [String]
    var everyone: Int
    var countryNote: String?
    var entries: [FilmEntry]
    var rest: [FilmEntry]      // 上映中但沒進榜的
    var title: String
    var footer: String
    var restTitle: String
    var restFooter: String
    var total: Int             // 符合條件的總數（比 entries 多的話還有下一批）
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
    var movie: TwMovie? // 電影清單上對應的那部片（對得到才有），片名列連到電影頁
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

// MARK: 影展

struct FestivalFilm: Codable, Hashable, Identifiable {
    var id: String
    var title: String
    var mins: Int?
    var rating: String?
    var url: String?
    var poster: String? // 官網給的劇照（有的才有）
    var trailer: String?
    var intro: String?  // 官網的影片介紹（有的才有）
    var credits: String? // 導演、主演（官網有給的才有）
}
/// 影展分類的一列：一部片在那一天的場次摘要
struct FestivalDayRow: Codable, Hashable, Identifiable {
    var film: FestivalFilm
    var count: Int
    var lines: [String]
    var id: String { film.id }
}
/// 影展分類整頁的資料（由共用資料層算好）
struct FestivalBoard: Codable {
    struct Item: Codable, Hashable, Identifiable { var id: String; var name: String }
    struct Group: Codable, Hashable, Identifiable { var title: String; var past: Bool; var items: [Item]; var id: String { title } }
    var festivals: [Item]   // 這一年的影展（空的 = 不顯示影展分類）
    var groups: [Group]?    // 分成「進行中・即將開始」和「已結束」兩組
    var years: [Int]?       // 有影展資料的年份，新的在前
    var year: Int?          // 現在看的是哪一年
    var past: Bool?         // 選中的影展已經結束
    struct Hit: Codable, Hashable, Identifiable { var festId: String; var film: FestivalFilm; var lines: [String]; var id: String { festId + "|" + film.id } }
    struct Tab: Codable, Hashable, Identifiable { var id: String; var label: String }
    var tabs: [Tab]?        // 「進行中・即將開始」「已結束」兩頁（只有一頁有影展時就只有一個）
    var tab: String?        // 現在看的是哪一頁
    var items: [Item]?      // 這一頁的影展
    var hits: [Hit]?        // 搜尋片名的結果（這一年所有影展，不分日期）
    var note: String        // 「進行中」或「幾月幾日開始」
    var id: String
    var name: String
    var range: String
    var footer: String
    var dates: [String]
    var date: String
    var day: [FestivalDayRow]
}
struct FestivalSessionRow: Codable, Hashable, Identifiable {
    var date: String
    var time: String
    var place: String
    var room: String?
    var ticket: String?
    var cinema: Cinema
    var id: String { date + time + place }
}
struct FestivalFilmDetail: Codable {
    var name: String
    var film: FestivalFilm
    var past: Bool? // 影展已經結束（場次僅供回顧）
    var trailerUrl: String?   // 官網放的預告，沒有就是 YouTube 搜尋結果
    var trailerLabel: String? // 「觀看預告」或「搜尋預告」
    var source: String?       // 資料來源的名稱（介紹的出處）
    var sessions: [FestivalSessionRow]
}
