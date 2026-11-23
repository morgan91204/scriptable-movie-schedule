import Foundation
import SwiftUI
import CoreLocation
import UIKit

/// 使用者設定：收藏的影城、地圖、TMDB 金鑰。存在手機上，並同步給資料層（補片長、查預告會用到金鑰）
@MainActor
final class SettingsStore: ObservableObject {
    static let shared = SettingsStore()
    private let defaults = UserDefaults.standard

    @Published var favorites: [String] { didSet { defaults.set(favorites, forKey: "favorites"); sync() } }
    @Published var maps: String { didSet { defaults.set(maps, forKey: "maps"); sync() } }
    @Published var tmdbToken: String { didSet { defaults.set(tmdbToken, forKey: "tmdbToken"); sync() } }

    private init() {
        favorites = defaults.stringArray(forKey: "favorites") ?? ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"]
        maps = defaults.string(forKey: "maps") ?? "apple"
        tmdbToken = defaults.string(forKey: "tmdbToken") ?? ""
    }

    func isFavorite(_ id: String) -> Bool { favorites.contains(id) }

    func toggleFavorite(_ id: String) {
        if let i = favorites.firstIndex(of: id) { favorites.remove(at: i) } else { favorites.append(id) }
    }

    /// 把設定交給資料層
    func sync() {
        let patch: [String: Any] = ["favorites": favorites, "maps": maps, "tmdbToken": tmdbToken]
        Task { _ = try? await Bridge.shared.call("patchSettings", [patch], as: Bool.self) }
    }

    /// 導航連結：Apple 地圖或 Google 地圖
    func mapsURL(name: String, address: String) -> URL? {
        let enc: (String) -> String = { $0.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? "" }
        if maps == "google" {
            return URL(string: "https://www.google.com/maps/search/?api=1&query=" + enc([name, address].filter { !$0.isEmpty }.joined(separator: " ")))
        }
        return URL(string: "https://maps.apple.com/?q=" + enc(name) + (address.isEmpty ? "" : "&address=" + enc(address)))
    }
}

/// 取一次目前位置
@MainActor
final class LocationFetcher: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var waiting: CheckedContinuation<CLLocation, Error>?

    func current() async throws -> CLLocation {
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        if manager.authorizationStatus == .denied || manager.authorizationStatus == .restricted {
            throw BridgeError(message: "沒有定位權限。請到「設定 → 電影行程」開啟位置。")
        }
        return try await withCheckedThrowingContinuation { c in
            waiting = c
            if manager.authorizationStatus == .notDetermined {
                manager.requestWhenInUseAuthorization() // 同意後會在下面的回呼裡開始定位
            } else {
                manager.requestLocation()
            }
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            guard self.waiting != nil else { return }
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways: manager.requestLocation()
            case .denied, .restricted: self.finish(.failure(BridgeError(message: "沒有定位權限。請到「設定 → 電影行程」開啟位置。")))
            default: break
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        Task { @MainActor in self.finish(.success(loc)) }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in self.finish(.failure(BridgeError(message: "定位失敗，請稍後再試。"))) }
    }

    private func finish(_ result: Result<CLLocation, Error>) {
        waiting?.resume(with: result)
        waiting = nil
    }
}

func kmLabel(_ km: Double?) -> String {
    guard let km else { return "" }
    if km < 1 { return "\(Int((km * 1000).rounded())) 公尺" }
    return km < 10 ? String(format: "%.1f 公里", km) : "\(Int(km.rounded())) 公里"
}

/// 以 App 訂票：先試已知的 App 網址（有裝就直接開），都不行才開 App Store 頁
@MainActor
func openCinemaApp(_ info: CinemaAppInfo) async {
    for scheme in info.schemes {
        if let u = URL(string: scheme + "://"), await UIApplication.shared.open(u) { return }
    }
    if let u = URL(string: info.url) { _ = await UIApplication.shared.open(u) }
}
