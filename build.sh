#!/bin/sh
# 型別檢查 → esbuild 編譯 → dist/movie.js（Scriptable 可直接執行）與 dist/電影行程.scriptable（匯入檔）
set -e
cd "$(dirname "$0")"
VERSION=$(TZ=Asia/Taipei date +%Y.%m.%d-%H%M)
node gen-parsers.mjs
npx tsc -p tsconfig.json
npx tsc -p tsconfig.parsers.json
npx esbuild src/main.tsx --bundle --format=esm --target=es2022 --jsx-factory=h --jsx-fragment=Fragment --charset=utf8 --legal-comments=none --log-level=warning \
  --define:APP_VERSION="\"$VERSION\"" --define:IS_WEB=false \
  --banner:js="// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: film; share-sheet-inputs: url, plain-text;
// @movie-schedule-app 電影行程 v$VERSION
// 由 src/main.tsx 編譯產生（esbuild），請改原始碼後重新編譯。" --outfile=dist/movie.js
node -e '
const fs=require("fs");const js=fs.readFileSync("dist/movie.js","utf8");
fs.writeFileSync("dist/電影行程.scriptable",JSON.stringify({always_run_in_app:false,icon:{color:"deep-purple",glyph:"film"},name:"電影行程",script:js,share_sheet_inputs:["url","plain-text"]},null,1));'
cp dist/movie.js dist/app.mjs  # 測試用（test/*.mjs 會 import）
printf '{"version":"%s"}\n' "$VERSION" > dist/version.json  # 兩版 App 用來判斷是否為最新版
echo "built v$VERSION"

# ── Scripting 版：把共用資料層與 scripting-src/ 組成 scripting/（GitHub 匯入、自動更新用的腳本資料夾）
SHARED="src/core.ts src/platform.ts src/parsers.ts src/parsers.gen.ts src/at-list.ts src/geo.ts src/changelog.ts"
rm -rf build/scripting-check && mkdir -p build/scripting-check
cp $SHARED scripting-src/index.tsx scripting-src/platform-scripting.ts scripting-src/scripting-shim.d.ts src/dom-shim.d.ts build/scripting-check/
npx tsc -p tsconfig.scripting.json
npx tsc -p tsconfig.ios.json   # 原生 App 的資料層入口（ios/bridge.ts）：少了函式、打錯名字在這裡就會擋下來
rm -rf scripting && mkdir scripting
cp $SHARED scripting-src/index.tsx scripting-src/platform-scripting.ts scripting/
node -e '
const fs=require("fs");const m=JSON.parse(fs.readFileSync("scripting-src/script.json","utf8"));
m.version=process.argv[1];fs.writeFileSync("scripting/script.json",JSON.stringify(m,null,2)+"\n");' "$(echo $VERSION | tr - .)"
# Scripting 版自己更新時用的清單：有哪些檔、各多長（下載完對長度，確認沒有缺）
node -e '
const fs=require("fs");const files=fs.readdirSync("scripting").filter(n=>/\.(ts|tsx|json)$/.test(n)).sort().map(n=>({name:n,chars:fs.readFileSync("scripting/"+n,"utf8").length}));
fs.writeFileSync("dist/scripting-files.json",JSON.stringify({version:process.argv[1],files})+"\n");' "$VERSION"
echo "scripting/ ready"

# ── 原生 iOS App：共用資料層包成一支 JS（ios/MovieSchedule/Resources/core.js），在 App 內的 WKWebView 執行
npx esbuild ios/bridge.ts --bundle --format=iife --target=safari16 --charset=utf8 --legal-comments=none --log-level=warning \
  --define:APP_VERSION="\"$VERSION\"" --outfile=ios/MovieSchedule/Resources/core.js
# 原生 App 自動換用新版資料層時看的清單：版本、相容等級（ios/bridge.ts 的 BRIDGE_LEVEL）、長度
node -e '
const fs=require("fs");const js=fs.readFileSync("ios/MovieSchedule/Resources/core.js","utf8");
const level=Number((fs.readFileSync("ios/bridge.ts","utf8").match(/const BRIDGE_LEVEL = (\d+)/)||[])[1])||0;
if(!level)throw new Error("ios/bridge.ts 找不到 BRIDGE_LEVEL");
fs.writeFileSync("dist/ios-core.json",JSON.stringify({version:process.argv[1],level,chars:js.length})+"\n");' "$VERSION"
echo "ios core.js ready"

# ── 網頁版：同一份 App（src/main.tsx）加上瀏覽器版的 Scriptable 全域物件（web/shim.ts）→ web/public/app.js
npx esbuild web/entry.ts --bundle --format=esm --target=safari16 --jsx-factory=h --jsx-fragment=Fragment --charset=utf8 --legal-comments=none --log-level=warning \
  --define:APP_VERSION="\"$VERSION\"" --define:IS_WEB=true --minify --outfile=web/public/app.js
cp web/public/app.js web/public/app.js.txt  # Worker 把這份當文字打包進去（見 web/worker.js）
# 靜態檔另外整理一份到 web/site/：部署時當成 Cloudflare 的靜態資源上傳，由 Cloudflare 直接送出，
# 不經過 Worker、不算每天的請求額度（使用者再多，首頁、程式本體、圖示都不會吃到額度）。這個資料夾每次重建，不進版本庫
rm -rf web/site && mkdir -p web/site/about web/site/privacy
cp web/public/index.html web/public/app.js web/public/manifest.webmanifest web/public/icon-180.png web/public/icon-192.png web/public/icon-512.png web/site/
cp web/public/sw.js.txt web/site/sw.js
cp web/pages/about.html.txt web/site/about/index.html
cp web/pages/privacy.html.txt web/site/privacy/index.html
printf '{"version":"%s"}\n' "$VERSION" > web/site/version.json  # 網頁版用來判斷「現在上線的是哪一版」
echo "web/public/app.js ready"
