#!/bin/sh
# 把檔案發佈到 data 分支。用法：tools/publish-data.sh <來源檔> <分支上的檔名> <提交訊息>
# data 分支永遠只留一個提交（每次重建後強制推送），所以每小時更新也不會讓 repo 越長越大；分支上其他檔案會保留。
set -e
SRC="$1"; NAME="$2"; MSG="$3"
if [ ! -f "$SRC" ]; then echo "沒有要發佈的檔案"; exit 0; fi
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
if git fetch -q origin data 2>/dev/null; then
  git checkout -q -f --detach FETCH_HEAD
else
  git branch -D data-new >/dev/null 2>&1 || true
  git checkout -q --orphan data-new
  git rm -rfq . || true
fi
cp "$SRC" "$NAME"
git add "$NAME"
if git diff --cached --quiet; then echo "內容沒有變化"; exit 0; fi
git branch -D data-fresh >/dev/null 2>&1 || true  # 同一輪發佈第二個檔案時，上一次留下的暫用分支要先刪掉
git checkout -q --orphan data-fresh
git commit -q -m "$MSG"
git push -q -f origin HEAD:data
echo "已發佈 $NAME"
