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

    private func boot() async throws {
        guard let url = Bundle.main.url(forResource: "core", withExtension: "js"),
              let js = try? String(contentsOf: url, encoding: .utf8) else {
            throw BridgeError(message: "找不到資料層（core.js）")
        }
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
