# 🎬 電影行程（Scriptable）

選影城 → 日期 → 電影 → 場次，一鍵加入 iPhone 行事曆。片長自動帶入、算好散場時間，地址、導航、版本、座位都寫在行程備註。

- **全台 105 間影城**：威秀、國賓、秀泰、美麗華、新光、喜樂時代、in89、誠品、光點華山、光點台北、樂聲、微風、哈拉、百老匯、王牌映画、威尼斯、新月……
- **場次即時抓取**，不用手動維護；影城清單也會自動更新
- 搜尋影城、自訂常去影城、深色模式
- 不用登入、不用付費，只讀公開的時刻表網頁

<p>
<img src="docs/preview-light.png" width="100%" alt="畫面預覽（淺色）">
</p>

## 安裝

### 方法一：捷徑（推薦，會自動更新）

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

## 資料來源

| 來源 | 涵蓋 | 備註 |
|---|---|---|
| [場次通](https://twshowtimes.com) | 64 間連鎖影城 | 一週場次、片長、分級、版本 |
| [開眼電影網](https://www.atmovies.com.tw) | 37 間其他戲院 | 通常只有今天的場次 |
| 誠品電影院、光點華山、光點台北、樂聲影城官網 | 4 間 | 樂聲官網只接受台灣 IP |

實際場次以影城公告為準。

## 已知限制

- Scriptable 無法設定行程提醒；加入後可點「打開行程，加提醒」手動加上。
- 凌晨場（00:00–04:59）在影城片單上屬於前一天，會自動算到隔天日期，請再核對電影票。

## 開發

```sh
npm install
./build.sh                  # 型別檢查 → 編譯 dist/movie.js 與 dist/電影行程.scriptable
node test/run.mjs vs        # 在 Node 模擬 Scriptable，用真實網路資料跑完整流程
node test/run.mjs eslite | spoths | spot | search | noruntime
node test/lux.mjs           # 樂聲（限台灣 IP，測試改讀 test/fixtures/）
node test/at.mjs            # 開眼來源
node test/loader.mjs online # 載入器：online / offline / 404
```

| 檔案 | 內容 |
|---|---|
| `src/main.tsx` | 畫面流程、行事曆寫入（TSX） |
| `src/jsx.tsx` | 迷你 JSX runtime，把 TSX 轉成 HTML 字串；Page／Section／Item／Chip 等元件 |
| `src/ui.ts` | WebView 外殼：CSS、點擊事件橋接 |
| `src/core.ts` | 資料層：設定檔、網路、各來源讀取與快取 |
| `src/parsers.ts` | 各網站解析器（在 WebView 裡用 DOMParser 執行，函式必須自給自足） |
| `src/at-list.ts` | 開眼內建戲院清單與去重代碼 |
| `loader/loader.js` | 捷徑用的自動更新載入器 |
| `test/mock.mjs` | Node 版 Scriptable API 模擬 |

**發布新版**：改完 `src/` → `./build.sh` → commit 並 push `dist/movie.js`。所有用捷徑的人下次打開就是新版（GitHub raw 有約 5 分鐘快取）。
