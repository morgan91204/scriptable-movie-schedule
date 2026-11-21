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

/// 海報：固定大小的圓角框；先查海報網址（資料層）、再載圖。哪裡都沒有圖就用片名畫一張預設海報
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
                GeneratedPoster(title: title, width: width)
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

/// 預設海報：場記板斜紋＋片名＋膠卷孔，底色依片名固定（跟其他版本同一套配色）
struct GeneratedPoster: View {
    let title: String
    var width: CGFloat = 44

    private static let tints: [(UInt32, UInt32)] = [
        (0x3B4A6B, 0x1F2A44), (0x6B3B4A, 0x3D1F2A), (0x2F5D50, 0x16352D),
        (0x5A4A2F, 0x33290F), (0x4A3B6B, 0x281F44), (0x3A3D42, 0x1F2125),
    ]
    private static func color(_ hex: UInt32) -> Color {
        Color(red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
    }
    /// 依片名挑底色：同一部片每次都一樣
    private var tint: (UInt32, UInt32) {
        var h = 0
        for u in title.unicodeScalars where !u.properties.isWhitespace { h = (h * 31 + Int(u.value)) % 9973 }
        return Self.tints[h % Self.tints.count]
    }

    var body: some View {
        let big = width > 60
        let height = width * 1.5
        let n = title.count
        let size: CGFloat = big ? (n > 16 ? 12 : n > 7 ? 15 : 18) : (n > 16 ? 7 : n > 7 ? 8 : 9)
        VStack(spacing: 0) {
            ClapStripes()
                .frame(height: height * 0.16)
                .overlay(alignment: .bottom) { Rectangle().fill(.black.opacity(0.35)).frame(height: big ? 2.5 : 1) }
            Text(title)
                .font(.system(size: size, weight: .heavy))
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
                .lineLimit(big ? 4 : 3)
                .minimumScaleFactor(0.7)
                .padding(.horizontal, big ? 8 : 3)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            HStack(spacing: width * 0.04) {
                ForEach(0..<5, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: 1).fill(.white.opacity(0.5)).frame(width: width * 0.08, height: width * 0.06)
                }
            }
            .frame(height: height * 0.09)
        }
        .frame(width: width, height: height)
        .background(LinearGradient(colors: [Self.color(tint.0), Self.color(tint.1)], startPoint: .topLeading, endPoint: .bottomTrailing))
        .accessibilityLabel(title)
    }
}

/// 場記板的黑白斜紋
private struct ClapStripes: View {
    var body: some View {
        Canvas { ctx, size in
            ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(.white))
            let step = size.width / 4
            let lean = size.height * 0.5
            var x = -step
            while x < size.width + step {
                var p = Path()
                p.move(to: CGPoint(x: x + lean, y: 0))
                p.addLine(to: CGPoint(x: x + lean + step / 2, y: 0))
                p.addLine(to: CGPoint(x: x + step / 2, y: size.height))
                p.addLine(to: CGPoint(x: x, y: size.height))
                p.closeSubpath()
                ctx.fill(p, with: .color(Color(red: 0.09, green: 0.094, blue: 0.11)))
                x += step
            }
        }
    }
}
