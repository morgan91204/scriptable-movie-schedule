# 🎬 電影行程

選影城 → 日期 → 電影 → 場次，或**選電影 → 看哪些影城有放**，一鍵加入 iPhone 行事曆。片長自動帶入、算好散場時間，地址、導航、版本、座位都寫在行程備註。

有兩個版本，資料與功能相同：

| | **Scripting 版**（推薦） | **Scriptable 版** |
|---|---|---|
| 介面 | iOS 原生（SwiftUI） | 網頁仿 iOS 風格 |
| 行程提醒 | ✅ 可設定（開演前 15 分～2 小時） | ❌ 需手動加 |
| 安裝 | Scripting 從 GitHub 匯入 | 捷徑＋載入器 |
| 自動更新 | ✅ Scripting 內建 | ✅ 載入器每次下載最新版 |

- **全台 105 間影城**：威秀、國賓、秀泰、美麗華、新光、喜樂時代、in89、誠品、光點華山、光點台北、樂聲、微風、哈拉、百老匯、王牌映画、威尼斯、新月……
- **場次即時抓取**，不用手動維護；影城清單也會自動更新
- **現在有什麼可以看**：選日期與時段（接下來 3 小時、晚上、深夜…），一次列出常去影城、附近 10 間或整個縣市的所有場次
- **依電影找場次**：選一部片，看今天起 7 天哪些影城有放、各版本場次，可依縣市篩選
- **特殊廳篩選**：IMAX、4DX、ScreenX、MX4D、杜比
- **附近的影城**：依目前位置排序（直線距離）
- **分享場次**：一鍵產生片名、時間、影城、導航連結，丟給朋友
- 搜尋影城、自訂常去影城、深色模式
- 不用登入、不用付費，只讀公開的時刻表網頁

<p>
<img src="docs/preview-light.png" width="100%" alt="畫面預覽（淺色）">
</p>

## 安裝

### Scripting 版（原生介面，推薦）

1. App Store 安裝 **[Scripting](https://apps.apple.com/app/id6479691128)**。
2. 在 iPhone 上點 **[一鍵匯入](https://www.scripting.fun/import_scripts?urls=%5B%22https%3A%2F%2Fgithub.com%2Fmorgan91204%2Fscriptable-movie-schedule%2Ftree%2Fmain%2Fscripting%22%5D)**，網頁會自動打開 Scripting 並詢問是否匯入（沒跳轉就按頁面上的 Try Again）。
3. 腳本已預設每 6 小時檢查更新；請確認 Scripting 設定裡的全域「自動更新」有開，新版才會自動套用。
4. 執行「電影行程」，第一次會詢問行事曆與網路權限，都選允許。

### Scriptable 版：捷徑（會自動更新）

1. App Store 安裝免費的 **[Scriptable](https://apps.apple.com/app/scriptable/id1405459188)**，打開一次。
2. 點作者分享的捷徑連結，加入「電影行程」捷徑。
3. 執行捷徑，第一次會詢問行事曆與網路權限，都選允許。

捷徑裡只有一段「載入器」，每次執行都會下載這個 repo 的最新版，所以**之後的更新會自動套用**。沒有網路時會使用手機上的備份照常執行。

### 方法二：直接匯入 Scriptable

下載 [`dist/電影行程.scriptable`](dist/電影行程.scriptable)，在 iPhone 上點開 → 選 Scriptable → Add。這種方式**不會自動更新**。

## 自己建立捷徑

1. 捷徑 App → 新增捷徑 → 加入 **Scriptable › Run Inline Script**
2. Script 欄位貼上 [`loader/loader.js`](loader/loader.js) 的全部內容
3. 展開動作：**Run In App** 開、**Show When Run** 開
4. （選用）捷徑設定 → 在分享工作表中顯示，接收 URL／Safari 網頁；Run Inline Script 的 **Parameter** 接「捷徑輸入」。之後從 Safari 分享場次通、開眼、誠品、光點、樂聲的時刻表頁面，會直接跳到那間影城。

## 兩個版本的功能對照

| 功能 | Scripting | Scriptable |
|---|---|---|
| 影城 → 日期 → 電影 → 場次 | ✅ | ✅ |
| 依電影找場次 | ✅ | ✅ |
| 現在有什麼可以看 | ✅ | ✅ |
| 特殊廳篩選 | ✅ | ✅ |
| 附近的影城 | ✅ | ✅ |
| 分享場次 | ✅ | ✅ |
| 行程提醒 | ✅ | ❌ Scriptable 沒有提醒 API |
| 只看常去影城（電影頁） | ✅ | ❌ |
| 從 Safari 分享網頁直接跳到影城 | ❌ 尚未支援 | ✅ |

## 資料來源

| 來源 | 涵蓋 | 備註 |
|---|---|---|
| [場次通](https://twshowtimes.com) | 64 間連鎖影城 | 一週場次、片長、分級、版本 |
| [開眼電影網](https://www.atmovies.com.tw) | 37 間其他戲院 | 通常只有今天的場次 |
| 誠品電影院、光點華山、光點台北、樂聲影城官網 | 4 間 | 樂聲官網只接受台灣 IP |

實際場次以影城公告為準。

**補片長（選用）**：場次通的重映、修復版、演唱會有時沒有片長。到 [TMDB](https://www.themoviedb.org/settings/api) 免費申請「API Read Access Token」，貼到 App 首頁「設定 → 補片長（TMDB）」，之後沒有片長的電影會自動用片名到 TMDB 查（確認頁會註明「取自 TMDB」）。Token 只存在自己的手機。

## 已知限制

- Scriptable 版無法設定行程提醒；加入後可點「打開行程，加提醒」手動加上。Scripting 版可以直接設定。
- 「依電影找場次」的資料來自場次通，涵蓋 64 間連鎖影城；開眼、誠品、光點、樂聲的戲院請從「影城」進入。
- 凌晨場（00:00–04:59）在影城片單上屬於前一天，會自動算到隔天日期，請再核對電影票。

## 開發

```sh
npm install
./build.sh                  # 型別檢查 → 編譯 dist/movie.js 與 dist/電影行程.scriptable
node test/run.mjs vs        # 在 Node 模擬 Scriptable，用真實網路資料跑完整流程
node test/run.mjs eslite | spoths | spot | search | noruntime
TMDB_TOKEN=eyJ… node test/run.mjs filled   # 補片長（需要自己的 TMDB Token）
node test/lux.mjs           # 樂聲（限台灣 IP，測試改讀 test/fixtures/）
node test/at.mjs            # 開眼來源
node test/loader.mjs online # 載入器：online / offline / 404
node test/movie.mjs         # 依電影找場次（Scriptable 版）
node test/scripting-core.mjs # 用 Scripting 平台實作跑共用資料層
node test/features.mjs now | near | imax  # 時段搜尋、附近影城、特殊廳篩選
node tools/geocode.mjs      # 新增影城後補座標
```

| 檔案 | 內容 |
|---|---|
| `scripting-src/index.tsx` | **Scripting 版**原生介面（SwiftUI 元件） |
| `scripting-src/platform-scripting.ts` | Scripting 的 fetch／WebViewController／Storage 實作 |
| `scripting/` | 建置產物：Scripting 匯入用的腳本資料夾（共用資料層＋上面兩個檔案＋script.json） |
| `src/main.tsx` | **Scriptable 版**畫面流程、行事曆寫入（TSX） |
| `src/platform.ts` | 平台介面：資料層只透過它碰網路、WebView、儲存，兩個版本共用同一份 core.ts |
| `src/platform-scriptable.ts` | Scriptable 的 Request／WebView／FileManager 實作 |
| `src/jsx.tsx` | 迷你 JSX runtime，把 TSX 轉成 HTML 字串；Page／Section／Item／Chip 等元件 |
| `src/ui.ts` | WebView 外殼：CSS、點擊事件橋接 |
| `src/core.ts` | 資料層：設定檔、網路、各來源讀取與快取 |
| `src/parsers.ts` | 各網站解析器；建置時編成 `src/parsers.gen.ts` 的 JS 字串，在兩個 App 的 WebView 裡用 DOMParser 執行 |
| `src/at-list.ts` | 開眼內建戲院清單與去重代碼 |
| `src/geo.ts` | 影城座標（`node tools/geocode.mjs` 產生，資料 © OpenStreetMap contributors） |
| `loader/loader.js` | 捷徑用的自動更新載入器 |
| `test/mock.mjs` | Node 版 Scriptable API 模擬 |

**發布新版**：改完 `src/` 或 `scripting-src/` → `./build.sh`（會同時產生 `dist/` 與 `scripting/`）→ commit 並 push。Scriptable 捷徑使用者下次打開就是新版（GitHub raw 約 5 分鐘快取）；Scripting 使用者依自動更新設定套用。
