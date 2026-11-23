import Foundation
import WebKit

struct BridgeError: Error {
    let message: String
}

/// 資料層橋接：共用資料層（core.js）在一個看不到的 WKWebView 裡執行，
/// 網路、快取、設定由原生端提供。畫面只呼叫 `Bridge.shared.call(...)`。
@MainActor
final class Bridge: NSObject, WKScriptMessageHandlerWithReply, WKNavigationDelegate {
    static let shared = Bridge()

    private var webView: WKWebView?
    private var bootTask: Task<Void, Error>?
    private var pageLoaded: CheckedContinuation<Void, Error>?
    private let session: URLSession
    private let cacheDir: URL

    private override init() {
        let cfg = URLSessionConfiguration.default
        cfg.timeoutIntervalForRequest = 20
        cfg.httpMaximumConnectionsPerHost = 6
        session = URLSession(configuration: cfg)
        let base = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        cacheDir = base.appendingPathComponent("kv", isDirectory: true)
        try? FileManager.default.createDirectory(at: cacheDir, withIntermediateDirectories: true)
        super.init()
    }

    // MARK: 啟動

    private func start() async throws {
        if let bootTask {
            try await bootTask.value
            return
        }
        let task = Task { try await self.boot() }
        bootTask = task
        do {
            try await task.value
        } catch {
            bootTask = nil // 下次再試
            throw error
        }
    }

    // MARK: 資料層自動更新
    // 場次怎麼讀、資料怎麼整理都寫在資料層（core.js）。App 啟動後會在背景看 GitHub 上有沒有新版，
    // 有就下載存起來，下次啟動改用新的，不用等 App 更新。畫面（Swift）不會變，所以只換用「相容等級」相同的。

    /// 橋接層的相容等級，要跟 ios/bridge.ts 的 BRIDGE_LEVEL 一樣
    static let level = 1
    /// 現在實際在用的資料層版本（設定頁顯示用）
    private(set) var coreVersion = ""
    private static let remoteBase = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/"
    private var remoteJS: URL { cacheDir.deletingLastPathComponent().appendingPathComponent("core-remote.js") }
    private var remoteInfo: URL { cacheDir.deletingLastPathComponent().appendingPathComponent("core-remote.json") }
    private struct CoreInfo: Codable { var version: String; var level: Int; var chars: Int? }

    private static func versionNumber(_ v: String) -> Int { Int(v.filter { $0.isNumber }) ?? 0 }
    /// 程式碼裡寫的版本號（建置時填進去的 2026.11.23-1436 這種格式）
    private static func embeddedVersion(_ js: String) -> String {
        guard let r = js.range(of: #"\d{4}\.\d{2}\.\d{2}-\d{4}"#, options: .regularExpression) else { return "" }
        return String(js[r])
    }

    /// 這次啟動要用哪一份資料層：下載過、等級相同、而且比 App 內建的新，就用下載的；否則用內建的
    private func pickCore(bundled: String) -> (js: String, version: String, remote: Bool) {
        let builtIn = Self.embeddedVersion(bundled)
        guard let data = try? Data(contentsOf: remoteInfo),
              let info = try? JSONDecoder().decode(CoreInfo.self, from: data),
              info.level == Self.level,
              Self.versionNumber(info.version) > Self.versionNumber(builtIn),
              let js = try? String(contentsOf: remoteJS, encoding: .utf8),
              js.contains("MS.init") || js.contains("init(saved)") || js.count > 100_000 else {
            return (bundled, builtIn, false)
        }
        return (js, info.version, true)
    }

    /// 背景檢查新版資料層：有、而且等級相同，就下載存起來（下次啟動生效）
    private func refreshCore() async {
        do {
            let stamp = Int(Date().timeIntervalSince1970)
            guard let infoURL = URL(string: Self.remoteBase + "dist/ios-core.json?t=\(stamp)"),
                  let jsURL = URL(string: Self.remoteBase + "ios/MovieSchedule/Resources/core.js?t=\(stamp)") else { return }
            let (infoData, infoResp) = try await session.data(from: infoURL)
            guard (infoResp as? HTTPURLResponse)?.statusCode == 200 else { return }
            let info = try JSONDecoder().decode(CoreInfo.self, from: infoData)
            guard info.level == Self.level, Self.versionNumber(info.version) > Self.versionNumber(coreVersion) else { return }
            if let old = try? Data(contentsOf: remoteInfo), let had = try? JSONDecoder().decode(CoreInfo.self, from: old), had.version == info.version { return } // 已經下載過這一版
            let (jsData, jsResp) = try await session.data(from: jsURL)
            guard (jsResp as? HTTPURLResponse)?.statusCode == 200, let js = String(data: jsData, encoding: .utf8) else { return }
            // 確認下載到的就是清單上那一版、而且完整（版本號對得上、長度一樣）
            guard Self.embeddedVersion(js) == info.version, info.chars == nil || info.chars == js.utf16.count else { return }
            try jsData.write(to: remoteJS, options: .atomic)
            try infoData.write(to: remoteInfo, options: .atomic)
        } catch {}
    }

    private func boot() async throws {
        guard let url = Bundle.main.url(forResource: "core", withExtension: "js"),
              let bundled = try? String(contentsOf: url, encoding: .utf8) else {
            throw BridgeError(message: "找不到資料層（core.js）")
        }
        let picked = pickCore(bundled: bundled)
        do {
            try await boot(js: picked.js)
            coreVersion = picked.version
        } catch {
            guard picked.remote else { throw error }
            // 下載的那一份跑不起來：刪掉，改用 App 內建的
            try? FileManager.default.removeItem(at: remoteJS)
            try? FileManager.default.removeItem(at: remoteInfo)
            webView = nil
            try await boot(js: bundled)
            coreVersion = Self.embeddedVersion(bundled)
        }
        Task { await self.refreshCore() }
    }

    private func boot(js: String) async throws {
        let config = WKWebViewConfiguration()
        config.userContentController.addScriptMessageHandler(self, contentWorld: .page, name: "native")
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        webView = web
        try await withCheckedThrowingContinuation { (c: CheckedContinuation<Void, Error>) in
            pageLoaded = c
            web.loadHTMLString("<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>", baseURL: URL(string: "https://twshowtimes.com/"))
        }
        _ = try await web.callAsyncJavaScript(js + "\n;MS.init(saved);", arguments: ["saved": loadCache()], in: nil, contentWorld: .page)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        pageLoaded?.resume()
        pageLoaded = nil
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        pageLoaded?.resume(throwing: error)
        pageLoaded = nil
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        pageLoaded?.resume(throwing: error)
        pageLoaded = nil
    }

    // MARK: 呼叫資料層

    private struct Envelope<T: Decodable>: Decodable {
        let ok: T?
        let err: String?
    }

    private func raw(_ fn: String, _ args: [Any]) async throws -> Data {
        try await start()
        guard let web = webView else { throw BridgeError(message: "資料層還沒準備好") }
        let result = try await web.callAsyncJavaScript("return await MS.call(fn, args)", arguments: ["fn": fn, "args": args], in: nil, contentWorld: .page)
        guard let text = result as? String, let data = text.data(using: .utf8) else {
            throw BridgeError(message: "資料層沒有回應")
        }
        return data
    }

    /// 呼叫資料層函式並解碼結果
    func call<T: Decodable>(_ fn: String, _ args: [Any] = [], as type: T.Type = T.self) async throws -> T {
        let env = try JSONDecoder().decode(Envelope<T>.self, from: try await raw(fn, args))
        if let err = env.err { throw BridgeError(message: err) }
        guard let value = env.ok else { throw BridgeError(message: "沒有資料") }
        return value
    }

    /// 同上，但結果可以是空的（例如查不到片長）
    func callOptional<T: Decodable>(_ fn: String, _ args: [Any] = [], as type: T.Type = T.self) async throws -> T? {
        let env = try JSONDecoder().decode(Envelope<T>.self, from: try await raw(fn, args))
        if let err = env.err { throw BridgeError(message: err) }
        return env.ok
    }

    /// 把 Swift 的資料轉成可以傳進 JS 的物件
    static func json<T: Encodable>(_ value: T) -> Any {
        guard let data = try? JSONEncoder().encode(value), let obj = try? JSONSerialization.jsonObject(with: data) else { return NSNull() }
        return obj
    }

    // MARK: 原生端提供給資料層的功能

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage, replyHandler: @escaping (Any?, String?) -> Void) {
        guard let body = message.body as? [String: Any], let name = body["name"] as? String else {
            replyHandler(nil, "bad message")
            return
        }
        switch name {
        case "fetch":
            guard let urlText = body["url"] as? String, let url = URL(string: urlText) else {
                replyHandler(["status": 0, "body": ""], nil)
                return
            }
            var req = URLRequest(url: url)
            req.httpMethod = (body["method"] as? String) ?? "GET"
            for (k, v) in (body["headers"] as? [String: String]) ?? [:] { req.setValue(v, forHTTPHeaderField: k) }
            if let text = body["body"] as? String, !text.isEmpty { req.httpBody = text.data(using: .utf8) }
            let session = self.session
            Task {
                do {
                    let (data, resp) = try await session.data(for: req)
                    let status = (resp as? HTTPURLResponse)?.statusCode ?? 0
                    replyHandler(["status": status, "body": String(decoding: data, as: UTF8.self)], nil)
                } catch {
                    replyHandler(nil, error.localizedDescription)
                }
            }
        case "cacheSet":
            if let key = body["key"] as? String, let value = body["value"] as? String {
                try? value.write(to: cacheFile(key), atomically: true, encoding: .utf8)
            }
            replyHandler(true, nil)
        case "settingsGet":
            replyHandler(UserDefaults.standard.string(forKey: "settings.json") ?? "", nil)
        case "settingsSet":
            UserDefaults.standard.set(body["value"] as? String, forKey: "settings.json")
            replyHandler(true, nil)
        default:
            replyHandler(nil, "unknown: \(name)")
        }
    }

    private func cacheFile(_ key: String) -> URL {
        let safe = key.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? "x"
        return cacheDir.appendingPathComponent(safe)
    }

    /// 啟動時把手機上的快取一次交給資料層（資料層讀快取是同步的）
    private func loadCache() -> [String: String] {
        var out: [String: String] = [:]
        let files = (try? FileManager.default.contentsOfDirectory(at: cacheDir, includingPropertiesForKeys: nil)) ?? []
        for f in files {
            guard let key = f.lastPathComponent.removingPercentEncoding, let text = try? String(contentsOf: f, encoding: .utf8) else { continue }
            out[key] = text
        }
        return out
    }
}
