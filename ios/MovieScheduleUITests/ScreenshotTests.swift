import XCTest

/// 自動操作 App 並截圖（GitHub Actions 用）：不用 Mac 也能看到實際畫面。
/// 截圖存到環境變數 SHOT_DIR 指定的資料夾；每一步找不到元件也照樣截圖，方便看卡在哪裡。
final class ScreenshotTests: XCTestCase {
    private var app: XCUIApplication!
    private var step = 0

    override func setUp() {
        continueAfterFailure = true
        app = XCUIApplication()
        app.launch()
    }

    private func shot(_ name: String, wait: TimeInterval = 5) {
        Thread.sleep(forTimeInterval: wait) // 等海報、評分讀好
        step += 1
        let png = XCUIScreen.main.screenshot().pngRepresentation
        let file = String(format: "%02d-%@.png", step, name)
        if let dir = ProcessInfo.processInfo.environment["SHOT_DIR"] {
            try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
            try? png.write(to: URL(fileURLWithPath: dir).appendingPathComponent(file))
        }
        let a = XCTAttachment(data: png, uniformTypeIdentifier: "public.png")
        a.name = file
        a.lifetime = .keepAlways
        add(a)
    }

    @discardableResult private func tap(_ element: XCUIElement, _ what: String, timeout: TimeInterval = 25) -> Bool {
        guard element.waitForExistence(timeout: timeout) else {
            XCTFail("找不到：\(what)")
            return false
        }
        element.tap()
        return true
    }

    func testScreens() {
        // 1. 電影清單
        _ = app.cells.element(boundBy: 2).waitForExistence(timeout: 40)
        shot("movies", wait: 8)

        // 2. 票房排行
        tap(app.segmentedControls.buttons["票房排行"], "票房排行")
        shot("boxoffice", wait: 8)
        app.swipeUp()
        shot("boxoffice-scrolled", wait: 3)

        // 3. 電影頁
        tap(app.segmentedControls.buttons["上映中"], "上映中")
        app.swipeDown()
        tap(app.cells.element(boundBy: 1), "第一部電影")
        shot("movie", wait: 10)
        app.swipeUp()
        shot("movie-cinemas", wait: 2)

        // 4. 選場次
        let cinema = app.cells.containing(NSPredicate(format: "label CONTAINS '威秀' OR label CONTAINS '秀泰' OR label CONTAINS '國賓'")).firstMatch
        if tap(cinema, "影城列") {
            shot("times", wait: 3)
            // 5. 確認頁
            let time = app.buttons.matching(NSPredicate(format: "label MATCHES '[0-9][0-9]:[0-9][0-9]'")).firstMatch
            if tap(time, "場次時間") {
                shot("confirm", wait: 3)
                app.swipeUp()
                shot("confirm-bottom", wait: 2)
            }
        }

        // 6. 影城分頁
        tap(app.tabBars.buttons["影城"], "影城分頁")
        shot("cinemas", wait: 6)
        if tap(app.cells.element(boundBy: 0), "第一間影城") {
            shot("cinema", wait: 6)
            let day = app.cells.containing(NSPredicate(format: "label CONTAINS '（'")).firstMatch
            if tap(day, "日期") { shot("cinema-day", wait: 8) }
        }

        // 7. 設定
        tap(app.tabBars.buttons["設定"], "設定分頁")
        shot("settings", wait: 2)
    }
}
