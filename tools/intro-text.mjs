// 劇情簡介的把關（年度排行和即將上映的工具共用）：TMDB 的中文簡介是網友填的，品質不一，這裡只留適合直接顯示的。
// 不收的：太短（不到 20 個字）、沒有中文字、簡體字寫的（台灣使用者看了會覺得怪）、只有一句宣傳語的。
// 太長的在句號的地方截斷，不會停在句子中間。
// 只在簡體裡出現的常用字（繁體不會這樣寫；「里、后、台、松」這種兩邊都有的不算）
const SIMPLIFIED = /[这们时对发说过还没为国开关见现长门问间头东车书电无业乐爱亲该让请谁热难师岁带张强个种样学实际认识进运动场讲话语词记录设备医药从众听观众们后来变战争历传统总经济团结导演员剧场戏]/g;
const AMBIGUOUS = /[后台里松干面只系制余云向]/g; // 兩邊都有的字：不拿來判斷
/** 從 TMDB 的演職員資料取導演（最多 3 位）和主要演員（最多 6 位），用頓號接起來。
 *  名字用 TMDB 給的（多半有中文譯名，沒有的會是原文）；太長或空的不收 */
export function creditsOf(credits) {
  const ok = (n) => { const t = String(n || "").replace(/\s+/g, " ").trim(); return t && t.length <= 40 ? t : ""; };
  const uniq = (list) => Array.from(new Set(list.map(ok).filter(Boolean)));
  const director = uniq((credits && credits.crew ? credits.crew : []).filter((c) => c && c.job === "Director").map((c) => c.name)).slice(0, 3).join("、");
  const cast = uniq((credits && credits.cast ? credits.cast : []).slice().sort((a, b) => (a.order ?? 99) - (b.order ?? 99)).map((c) => c.name)).slice(0, 6).join("、");
  return { director, cast };
}
/** 整理一段簡介；不適合顯示就回傳空字串 */
export function cleanIntro(raw, max = 600) {
  let t = String(raw || "").replace(/\s+/g, " ").trim();
  if (t.length < 20 || !/[一-鿿]/.test(t)) return "";
  // 簡體字佔中文字的 3% 以上就當作簡體寫的
  const han = (t.match(/[一-鿿]/g) || []).length;
  const simp = (t.replace(AMBIGUOUS, "").match(SIMPLIFIED) || []).length;
  if (han && simp / han >= 0.03) return "";
  if (t.length > max) {
    const cut = t.slice(0, max);
    const end = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("！"), cut.lastIndexOf("？"));
    t = end >= max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/[，、；：,\s]+$/, "") + "…";
  }
  return t;
}
