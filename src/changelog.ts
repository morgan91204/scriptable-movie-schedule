// 更新內容：只寫使用者感覺得到的變動，用看得懂的話寫；同一天的合併成一段，新的放最上面，留最近十段左右。
// id 用日期（同一天再補內容時加 b、c…），App 用它判斷「有沒有還沒看過的」。
export interface ChangeItem { kind: "new" | "better"; text: string }
export interface ChangeEntry { id: string; date: string; items: ChangeItem[] }
export const CHANGELOG: ChangeEntry[] = [
  {
    id: "2026-11-24",
    date: "2026/11/24",
    items: [
      { kind: "new", text: "首頁可以直接搜尋：影城、現正上映、即將上映、歷年電影、影展片一起找" },
      { kind: "new", text: "電影頁多了分享按鈕，朋友點連結會直接開到那部片" },
      { kind: "new", text: "可以用 Google 帳號同步收藏和設定（設定 → 同步）" },
      { kind: "new", text: "收藏發行商：在發行商清單點星號，首頁就能直接看那一家的片" },
      { kind: "new", text: "通知多了幾種：特殊廳有場次、上映前提醒、收藏影城開始放映、評分出爐、每週新片、影展片單公布，也可以自訂勿擾時段" },
      { kind: "better", text: "番茄和爆米花指數改成三級顯示（認證／及格／不及格），圖示也換新" },
      { kind: "better", text: "「觀眾評分」改名「片刻評分」，評分方式改成一排 1 到 10 分" },
      { kind: "better", text: "重映的片會標「重映」，票房資訊會寫明是這次重映的數字" },
      { kind: "better", text: "「現在有什麼可以看」的選項重新整理，一頁就看得完" },
      { kind: "better", text: "歷年電影可以篩選上映中或已下檔；年份、國別、發行商改成清單選擇" },
    ],
  },
];
/** 最新一段的代號（沒有內容時是空字串） */
export const CHANGELOG_LATEST = CHANGELOG.length ? CHANGELOG[0].id : "";
