#!/bin/sh
# 把影展劇照的備份（縮小過的圖）發佈到 img 分支。用法：tools/publish-images.sh <圖片資料夾>
# 資料夾裡的檔案照原本的路徑加進分支（已經有的不動）。跟 data 分支一樣只留一個提交，分支上原有的圖都保留。
set -e
SRC="$1"
if [ ! -d "$SRC" ] || [ -z "$(find "$SRC" -type f | head -1)" ]; then echo "這次沒有新的劇照要備份"; exit 0; fi
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
if git fetch -q origin img 2>/dev/null; then
  git checkout -q -f --detach FETCH_HEAD
else
  git branch -D img-new >/dev/null 2>&1 || true
  git checkout -q --orphan img-new
  git rm -rfq . || true
fi
cp -R "$SRC"/. .
git add fest
if git diff --cached --quiet; then echo "劇照沒有變化"; exit 0; fi
git branch -D img-fresh >/dev/null 2>&1 || true
git checkout -q --orphan img-fresh
git commit -q -m "影展劇照備份"
git push -q -f origin HEAD:img
echo "已發佈劇照備份（$(find "$SRC" -type f | wc -l) 張）"
