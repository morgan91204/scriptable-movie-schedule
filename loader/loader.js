// 電影行程｜捷徑載入器（貼進捷徑的 Run Inline Script）
// 每次執行先到 GitHub 下載最新版；下載失敗（沒網路等）就用手機上的備份。
// 原始碼：https://github.com/morgan91204/scriptable-movie-schedule
const SOURCE = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/movie.js";
const MARK = "@movie-schedule-app"; // 確認下載到的是這支 App，不是錯誤頁

const fm = FileManager.local();
const cachePath = fm.joinPath(fm.documentsDirectory(), "movie-schedule-cache.js");
let code = null;

try {
  const req = new Request(SOURCE + "?t=" + Date.now());
  req.timeoutInterval = 10;
  const text = await req.loadString();
  if (req.response.statusCode === 200 && text.includes(MARK)) {
    code = text;
    fm.writeString(cachePath, text);
  }
} catch (e) {}

if (!code && fm.fileExists(cachePath)) code = fm.readString(cachePath);

if (code) {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  await new AsyncFunction("args", code)(args);
} else {
  const a = new Alert();
  a.title = "無法下載電影行程";
  a.message = "第一次使用需要網路連線，請確認後再試一次。";
  a.addAction("好");
  await a.presentAlert();
  Script.complete();
}
