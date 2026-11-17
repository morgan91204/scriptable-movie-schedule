import XCTest
@testable import MovieSchedule

/// 用真實網路跑資料層：確認橋接、解析與解碼整條路是通的
@MainActor
final class BridgeTests: XCTestCase {
    func testMoviesAndDay() async throws {
        let movies: [TwMovie] = try await Bridge.shared.call("loadMovies")
        XCTAssertGreaterThan(movies.count, 20)
        let first = try XCTUnwrap(movies.first)
        let day: TwMovieDay = try await Bridge.shared.call("movieDay", [first.slug, NSNull()])
        XCTAssertFalse(day.dates.isEmpty)
        print("✅ 電影 \(movies.count) 部；《\(day.title)》\(day.date) 有 \(day.cinemas.count) 間影城")
        let poster: String = try await Bridge.shared.call("moviePoster", [first.title, first.slug, js(first.en)])
        XCTAssertTrue(poster.hasPrefix("https://"))
        let extras: MovieExtras = try await Bridge.shared.call("movieExtras", [first.title, first.slug])
        let ratings: Ratings = try await Bridge.shared.call("movieRatings", [first.title, js(first.en), first.slug])
        print("✅ 海報 \(poster)；預告 \(extras.trailerName ?? "無")；IMDb \(ratings.imdb?.score ?? -1)")
        let image = await PosterStore.shared.image(poster, width: 44)
        XCTAssertNotNil(image)
    }

    func testCinemaFlow() async throws {
        let cinemas: [Cinema] = try await Bridge.shared.call("loadCinemas")
        XCTAssertGreaterThan(cinemas.count, 50)
        let cinema = try XCTUnwrap(cinemas.first { $0.source == "tw" })
        let dates: CinemaDates = try await Bridge.shared.call("datesOf", [Bridge.json(cinema)])
        let date = try XCTUnwrap(dates.dates.first)
        let day: CinemaDay = try await Bridge.shared.call("moviesOf", [Bridge.json(cinema), date])
        XCTAssertFalse(day.movies.isEmpty)
        print("✅ 影城 \(cinemas.count) 間；\(cinema.name) \(date) 有 \(day.movies.count) 部片")
    }

    func testBoxOffice() async throws {
        let board: BoxOfficeBoard = try await Bridge.shared.call("boxOffice")
        XCTAssertGreaterThan(board.rows.count, 5)
        print("✅ 票房 \(board.label)：第 1 名 \(board.rows[0].x.name) \(Fmt.money(board.rows[0].x.week ?? board.rows[0].x.total))")
    }

    func testHelpers() {
        XCTAssertEqual(Fmt.money(74_818_512), "7,482 萬")
        XCTAssertEqual(Fmt.money(156_000_000), "1.56 億")
        XCTAssertEqual(Fmt.addDays("2026-12-31", 1), "2027-01-01")
        XCTAssertEqual(Fmt.weekday("2026-11-17"), "二")
        let late = Fmt.showDate(date: "2026-11-17", time: "00:30")
        XCTAssertEqual(late.map { Fmt.full($0) }, "2026/11/18（三）00:30")
    }
}
