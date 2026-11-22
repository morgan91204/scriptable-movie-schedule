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

    private func row(_ id: String) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: id).firstMatch
    }

    private func back() {
        let b = app.navigationBars.buttons.element(boundBy: 0)
        if b.exists { b.tap() }
        Thread.sleep(forTimeInterval: 1)
    }

    func testScreens() {
        // 0. 首頁 → 現在有什麼可以看
        _ = row("now-link").waitForExistence(timeout: 40)
        shot("home", wait: 5)
        if tap(row("now-link"), "現在有什麼可以看") {
            // 改成「整天」，半夜跑也有結果可以看版面
            if tap(app.buttons.matching(NSPredicate(format: "label BEGINSWITH '時段'")).firstMatch, "時段選單", timeout: 10) {
                tap(app.buttons["整天"], "整天", timeout: 5)
                // 選單可以複選，點了不會自己關：點一下畫面下方把它收起來
                app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.92)).tap()
            }
            shot("now", wait: 20)
            back()
        }

        // 1. 電影清單
        tap(app.tabBars.buttons["電影"], "電影分頁")
        _ = row("movie-row").waitForExistence(timeout: 40)
        shot("movies", wait: 8)

        // 2. 電影頁 → 選場次 → 確認頁
        if tap(row("movie-row"), "第一部電影") {
            shot("movie", wait: 10)
            app.swipeUp()
            shot("movie-cinemas", wait: 2)
            app.swipeDown() // 捲回去，第一間影城才點得到
            Thread.sleep(forTimeInterval: 1)
            if tap(row("movie-cinema-row"), "放映影城", timeout: 10) {
                shot("times", wait: 3)
                if tap(row("time-button"), "場次時間", timeout: 10) {
                    shot("confirm", wait: 3)
                    app.swipeUp()
                    shot("confirm-bottom", wait: 2)
                    back()
                }
                back()
            }
            back()
        }

        // 3. 票房排行
        app.swipeDown()
        tap(app.segmentedControls.buttons["票房排行"], "票房排行", timeout: 10)
        shot("boxoffice", wait: 8)

        // 4. 影城分頁 → 影城 → 某一天的片單
        tap(app.tabBars.buttons["影城"], "影城分頁")
        shot("cinemas", wait: 6)
        if tap(row("cinema-row"), "第一間影城") {
            shot("cinema", wait: 6)
            if tap(row("date-row"), "日期", timeout: 10) { shot("cinema-day", wait: 8) }
        }

        // 5. 設定
        tap(app.tabBars.buttons["設定"], "設定分頁")
        shot("settings", wait: 2)
        app.swipeUp()
        if tap(row("about-link"), "資料來源與授權", timeout: 8) { shot("about", wait: 2) }

    }
}
