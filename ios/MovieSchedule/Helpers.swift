import Foundation
import SwiftUI

/// 日期、金額等小工具（與 src/core.ts 的同名函式行為一致）
enum Fmt {
    static let tpe = TimeZone(identifier: "Asia/Taipei")!
    static let week = ["日", "一", "二", "三", "四", "五", "六"]
    static let cityOrder = [
        "基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "台中市", "彰化縣", "南投縣", "雲林縣",
        "嘉義市", "嘉義縣", "台南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣",
    ]

    static var calendar: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = tpe
        return c
    }

    private static func dayFormatter() -> DateFormatter {
        let f = DateFormatter()
        f.calendar = calendar
        f.timeZone = tpe
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }

    static func today() -> String { dayFormatter().string(from: Date()) }

    static func addDays(_ d: String, _ n: Int) -> String {
        let f = dayFormatter()
        guard let date = f.date(from: d), let next = calendar.date(byAdding: .day, value: n, to: date) else { return d }
        return f.string(from: next)
    }

    static func weekday(_ d: String) -> String {
        guard let date = dayFormatter().date(from: d) else { return "" }
        return week[calendar.component(.weekday, from: date) - 1]
    }

    /// 「11/5（四） 今天」
    static func dateLabel(_ d: String) -> String {
        let parts = d.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return d }
        let t = today()
        let tag = d == t ? " 今天" : d == addDays(t, 1) ? " 明天" : d == addDays(t, 2) ? " 後天" : ""
        return "\(parts[1])/\(parts[2])（\(weekday(d))）\(tag)"
    }

    /// 凌晨場（00:00–04:59）在影城片單上屬於前一個營業日
    static func isLate(_ time: String) -> Bool { time < "05:00" }

    /// 片單日期＋時間 → 實際開演時間（凌晨場算隔天）
    static func showDate(date: String, time: String) -> Date? {
        let day = isLate(time) ? addDays(date, 1) : date
        let f = DateFormatter()
        f.calendar = calendar
        f.timeZone = tpe
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd HH:mm"
        return f.date(from: "\(day) \(time)")
    }

    /// 「2026/11/06（五）10:00」
    static func full(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = calendar
        f.timeZone = tpe
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy/MM/dd"
        let day = dayFormatter().string(from: date)
        return "\(f.string(from: date))（\(weekday(day))）\(hm(date))"
    }

    static func hm(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = calendar
        f.timeZone = tpe
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "HH:mm"
        return f.string(from: date)
    }

    static func money(_ n: Double) -> String {
        if n >= 1e8 {
            var s = String(format: "%.2f", n / 1e8)
            while s.hasSuffix("0") { s.removeLast() }
            if s.hasSuffix(".") { s.removeLast() }
            return s + " 億"
        }
        if n >= 1e4 {
            let f = NumberFormatter()
            f.numberStyle = .decimal
            f.groupingSeparator = ","
            return (f.string(from: NSNumber(value: (n / 1e4).rounded())) ?? "") + " 萬"
        }
        return "\(Int(n.rounded())) 元"
    }

    static func sortCities(_ cities: [String]) -> [String] {
        func rank(_ c: String) -> Int { (cityOrder.firstIndex(of: c) ?? 98) }
        return cities.sorted { rank($0) < rank($1) }
    }
}

/// 評分顏色：綠 ≥75、黃 60–74、紅 <60（IMDb 乘 10 後比較）
enum Tier {
    static func color(_ percent: Double) -> Color {
        percent >= 75 ? .green : percent >= 60 ? .orange : .red
    }
}

/// 讀取狀態
enum Loadable<T> {
    case loading
    case loaded(T)
    case failed(String)

    var value: T? {
        if case .loaded(let v) = self { return v }
        return nil
    }
}

func errorText(_ error: Error) -> String {
    if let e = error as? BridgeError { return e.message }
    return error.localizedDescription
}

/// 可能沒有值的字串 → 傳進 JS 的參數（沒有就是 null）
func js(_ s: String?) -> Any {
    if let s { return s }
    return NSNull()
}
