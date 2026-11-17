import SwiftUI
import UIKit
import ImageIO

/// 海報圖載入：記憶體快取＋系統的磁碟快取，下載後縮成顯示大小再解碼（省記憶體、捲動順）
enum PosterMemory {
    /// NSCache 本身可以跨執行緒使用
    static let cache: NSCache<NSString, UIImage> = {
        let c = NSCache<NSString, UIImage>()
        c.countLimit = 300
        return c
    }()
}

actor PosterStore {
    static let shared = PosterStore()

    private var jobs: [String: Task<UIImage?, Never>] = [:]
    private let session: URLSession

    init() {
        let cfg = URLSessionConfiguration.default
        cfg.urlCache = URLCache(memoryCapacity: 8 << 20, diskCapacity: 200 << 20)
        cfg.requestCachePolicy = .returnCacheDataElseLoad // 海報網址內容不會變
        cfg.timeoutIntervalForRequest = 25
        cfg.httpMaximumConnectionsPerHost = 4
        session = URLSession(configuration: cfg)
    }

    nonisolated func cached(_ url: String, width: CGFloat) -> UIImage? {
        PosterMemory.cache.object(forKey: "\(url)|\(Int(width))" as NSString)
    }

    func image(_ url: String, width: CGFloat) async -> UIImage? {
        let key = "\(url)|\(Int(width))"
        if let hit = PosterMemory.cache.object(forKey: key as NSString) { return hit }
        if let job = jobs[key] { return await job.value }
        let session = self.session
        let job = Task<UIImage?, Never> {
            guard let u = URL(string: url) else { return nil }
            for attempt in 0..<3 {
                if attempt > 0 { try? await Task.sleep(nanoseconds: UInt64(attempt) * 800_000_000) }
                guard let (data, resp) = try? await session.data(from: u) else { continue }
                guard (resp as? HTTPURLResponse)?.statusCode == 200 else { return nil }
                return PosterStore.downsample(data, width: width)
            }
            return nil
        }
        jobs[key] = job
        let img = await job.value
        jobs[key] = nil
        if let img { PosterMemory.cache.setObject(img, forKey: key as NSString) }
        return img
    }

    private static func downsample(_ data: Data, width: CGFloat) -> UIImage? {
        let opts = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let src = CGImageSourceCreateWithData(data as CFData, opts) else { return nil }
        let pixels = max(width, 44) * 3 * 1.5 // 3 倍螢幕、高是寬的 1.5 倍
        let thumbOpts = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: pixels,
        ] as CFDictionary
        guard let cg = CGImageSourceCreateThumbnailAtIndex(src, 0, thumbOpts) else { return nil }
        return UIImage(cgImage: cg)
    }
}

/// 海報：固定大小的圓角框；先查海報網址（資料層）、再載圖。沒有海報顯示灰底電影圖示
struct PosterView: View {
    let title: String
    var slug: String? = nil
    var en: String? = nil
    var width: CGFloat = 44

    @State private var image: UIImage?
    @State private var done = false

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: width > 60 ? 12 : 6).fill(Color(.tertiarySystemFill))
            if let image {
                Image(uiImage: image).resizable().scaledToFill()
            } else if done {
                Image(systemName: "film").font(width > 60 ? .largeTitle : .body).foregroundStyle(.tertiary)
            } else {
                ProgressView()
            }
        }
        .frame(width: width, height: width * 1.5)
        .clipShape(RoundedRectangle(cornerRadius: width > 60 ? 12 : 6))
        .task(id: title + "|" + (slug ?? "")) { await load() }
    }

    private func load() async {
        guard let url = try? await Bridge.shared.call("moviePoster", [title, js(slug), js(en)], as: String.self), !url.isEmpty else {
            done = true
            return
        }
        if let hit = PosterStore.shared.cached(url, width: width) {
            image = hit
        } else {
            image = await PosterStore.shared.image(url, width: width)
        }
        done = true
    }
}
