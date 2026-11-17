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
    var id: String { slug }
}

struct TwMovieCinema: Codable, Hashable, Identifiable {
    var id: String
    var name: String
    var city: String
    var district: String?
    var address: String?
    var versions: [ShowVersion]
}

struct TwMovieDay: Codable {
    var title: String
    var en: String?
    var rating: String?
    var runtime: Int?
    var runtimeFrom: String?
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
    var total: Double
}

struct BoxOfficeRow: Codable, Identifiable {
    var x: BoxOfficeItem
    var m: TwMovie?
    var id: Int { x.rank }
}

struct BoxOfficeBoard: Codable {
    var label: String
    var source: String
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
    var bookingUrl: String
}
