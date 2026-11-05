#!/bin/sh
# 型別檢查 → esbuild 編譯 → dist/movie.js（Scriptable 可直接執行）與 dist/電影行程.scriptable（匯入檔）
set -e
cd "$(dirname "$0")"
VERSION=$(TZ=Asia/Taipei date +%Y.%m.%d-%H%M)
node gen-parsers.mjs
npx tsc -p tsconfig.json
npx tsc -p tsconfig.parsers.json
npx esbuild src/main.tsx --bundle --format=esm --target=es2022 --jsx-factory=h --jsx-fragment=Fragment --charset=utf8 --legal-comments=none --log-level=warning \
  --define:APP_VERSION="\"$VERSION\"" \
  --banner:js="// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: film; share-sheet-inputs: url, plain-text;
// @movie-schedule-app 電影行程 v$VERSION
// 由 src/main.tsx 編譯產生（esbuild），請改原始碼後重新編譯。" --outfile=dist/movie.js
node -e '
const fs=require("fs");const js=fs.readFileSync("dist/movie.js","utf8");
fs.writeFileSync("dist/電影行程.scriptable",JSON.stringify({always_run_in_app:false,icon:{color:"deep-purple",glyph:"film"},name:"電影行程",script:js,share_sheet_inputs:["url","plain-text"]},null,1));'
cp dist/movie.js dist/app.mjs  # 測試用（test/*.mjs 會 import）
echo "built v$VERSION"

# ── Scripting 版：把共用資料層與 scripting-src/ 組成 scripting/（GitHub 匯入、自動更新用的腳本資料夾）
SHARED="src/core.ts src/platform.ts src/parsers.ts src/parsers.gen.ts src/at-list.ts src/geo.ts"
rm -rf build/scripting-check && mkdir -p build/scripting-check
cp $SHARED scripting-src/index.tsx scripting-src/platform-scripting.ts scripting-src/scripting-shim.d.ts src/dom-shim.d.ts build/scripting-check/
npx tsc -p tsconfig.scripting.json
rm -rf scripting && mkdir scripting
cp $SHARED scripting-src/index.tsx scripting-src/platform-scripting.ts scripting/
node -e '
const fs=require("fs");const m=JSON.parse(fs.readFileSync("scripting-src/script.json","utf8"));
m.version=process.argv[1];fs.writeFileSync("scripting/script.json",JSON.stringify(m,null,2)+"\n");' "$(echo $VERSION | tr - .)"
echo "scripting/ ready"
