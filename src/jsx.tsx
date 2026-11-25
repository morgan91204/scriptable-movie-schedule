// 迷你 JSX runtime：把 TSX 轉成 HTML 字串，交給 Scriptable 的 WebView 顯示。
// 點擊事件用 data-act 標記，由 ui.tsx 的事件迴圈接收後呼叫對應的 handler。

import { posterTint } from "./core";

export type Handler = (vals: Record<string, string>) => void | Promise<void>;

declare global {
  namespace JSX {
    type Element = string;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [tag: string]: any;
    }
  }
}

type Child = string | number | boolean | null | undefined | Child[];
type Children = Child | Child[];

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

function flat(children: Children): string {
  if (!Array.isArray(children)) children = [children];
  let out = "";
  for (const c of children) {
    if (c === null || c === undefined || c === false || c === true) continue;
    if (Array.isArray(c)) out += flat(c);
    else out += String(c); // 子元素已經是 HTML；純文字請用 {esc(...)} 或 <Text>
  }
  return out;
}

// 事件註冊：每次畫面重繪前清空
let handlers: Record<string, Handler> = {};
let seq = 0;
export function resetHandlers() {
  handlers = {};
  seq = 0;
}
export function getHandler(id: string): Handler | undefined {
  return handlers[id];
}
function register(fn?: Handler): string {
  if (!fn) return "";
  const id = "a" + ++seq;
  handlers[id] = fn;
  return id;
}

const VOID = /^(br|hr|img|input|meta|link)$/;

export function h(type: string | ((props: any) => string), props: any, ...children: Child[]): string {
  if (typeof type === "function") return type({ ...(props || {}), children });
  let attrs = "";
  for (const k in props || {}) {
    const v = props[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === "onTap") {
      attrs += ` data-act="${register(v)}"`;
      continue;
    }
    if (k === "onFile") { // 選檔案：選好之後觸發，檔案內容放在 window.__files（見 ui.ts 的 data-file）
      attrs += ` data-file="${register(v)}"`;
      continue;
    }
    if (k === "onInput") { // 搜尋欄：打字停一下就觸發（見 ui.ts 的 data-live）
      attrs += ` data-live="${register(v)}"`;
      continue;
    }
    if (k === "onLongPress") {
      attrs += ` data-long="${register(v)}"`;
      continue;
    }
    attrs += ` ${k === "className" ? "class" : k}="${esc(v === true ? "" : v)}"`;
  }
  if (VOID.test(type)) return `<${type}${attrs}>`;
  return `<${type}${attrs}>${flat(children)}</${type}>`;
}

export function Fragment(props: { children?: Children }): string {
  return flat(props.children || []);
}

// ───────── 常用元件 ─────────

/** 底部分頁列：由 App 註冊（目前哪一頁、點了怎麼切換）；沒註冊就不畫 */
export interface TabBar {
  active: string;
  items: { id: string; label: string; icon: string; dot?: boolean }[]; // dot = 圖示右上角的小紅點（有還沒看過的更新內容）
  onTap: (id: string) => void;
}
let tabBarProvider: (() => TabBar | null) | null = null;
export function setTabBar(fn: () => TabBar | null): void {
  tabBarProvider = fn;
}
/** 返回鍵要不要顯示：由 App 註冊（堆疊只剩根畫面時隱藏，改用分頁列切換） */
let canGoBack: () => boolean = () => true;
export function setBackGuard(fn: () => boolean): void {
  canGoBack = fn;
}
// SF Symbols 風格的線條圖示（house、film、building.2、gearshape）
export const TAB_ICONS: Record<string, string> = {
  house: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.4"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><path d="M15.6 5.4a3.3 3.3 0 0 1 0 6.2"/><path d="M17.6 14.3a6 6 0 0 1 3.6 5.2"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.6 2H4.4z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
  film: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
  building: '<svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l5-3v17"/><path d="M10 21V11l9-3v13"/><path d="M14 13h2M14 17h2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};
// 「加到主畫面」教學用的圖示：分享（方框＋向上箭頭）、加入主畫面（方框＋加號）、更多（三個點）、完成（勾）
export const GUIDE_ICONS: Record<string, string> = {
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  vdots: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  home: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
};
/** 一步一步的圖示教學：每一步是「編號＋圖示＋標題＋說明」 */
export function Steps(props: { items: { icon: string; title: string; text?: string }[] }): string {
  return (
    <div class="steps">
      {props.items.map((it, i) => (
        <div class="step">
          <span class="step-n">{i + 1}</span>
          <span class="step-ico">{GUIDE_ICONS[it.icon] || ""}</span>
          <div class="step-body">
            <div class="step-t">{esc(it.title)}</div>
            {it.text ? <div class="step-s">{esc(it.text)}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabBarView(): string {
  const t = tabBarProvider ? tabBarProvider() : null;
  if (!t) return "";
  return (
    <nav class="tabbar" aria-label="分頁">
      {t.items.map((it) => (
        <button class={"tab" + (it.id === t.active ? " on" : "")} onTap={() => t.onTap(it.id)} aria-label={it.label}>
          {TAB_ICONS[it.icon] || ""}
          {it.dot ? <i class="tab-dot" aria-label="有新內容" /> : null}
          <span>{esc(it.label)}</span>
        </button>
      ))}
    </nav>
  );
}

export function Page(props: {
  title: string;
  subtitle?: string;
  onBack?: Handler;
  right?: string;
  noTabs?: boolean; // 輸入頁等不顯示分頁列
  children?: Children;
}): string {
  const back = props.onBack && canGoBack() ? props.onBack : undefined;
  return (
    <div class={"page" + (tabBarProvider && !props.noTabs ? " with-tabs" : "")}>
      <header class="bar">
        {back ? (
          <button class="back" onTap={back}>
            ‹ 返回
          </button>
        ) : (
          <span class="back-spacer" />
        )}
        <div class="bar-title">
          <div class="t">{esc(props.title)}</div>
          {props.subtitle ? <div class="s">{esc(props.subtitle)}</div> : null}
        </div>
        {props.right ? <span class="bar-right">{props.right}</span> : <span class="back-spacer" />}
      </header>
      <main class="content">{props.children}</main>
      {props.noTabs ? null : <TabBarView />}
    </div>
  );
}

export function Section(props: { title?: string; hint?: string; children?: Children }): string {
  return (
    <section class="sec">
      {props.title ? <h2 class="sec-title">{esc(props.title)}</h2> : null}
      <div class="group">{props.children}</div>
      {props.hint ? <p class="hint">{esc(props.hint)}</p> : null}
    </section>
  );
}

export function Item(props: {
  title: string;
  subtitle?: string;
  icon?: string;
  right?: string;
  badge?: string;
  onTap?: Handler;
  onLongPress?: Handler; // 長按（例如複製地址）
  muted?: boolean;
  accent?: boolean;
  chevron?: boolean;
  /** 小海報：src 是顯示來源（本機或網址），url 是載入失敗時改用的網址；空字串 = 沒有海報（灰色預設圖） */
  thumb?: { src: string; url?: string; pending?: boolean };
  rank?: number; // 排行名次（前三名橘色）
  head?: boolean; // 一組資料最上面的標題列（片名）：字大、有底色，跟底下的列分得開
  kv?: boolean; // 「標題：內容」的資料列：左邊標題只佔自己的寬度，右邊內容用掉剩下的整行（不受 40% 寬度限制，放得下就不換行）
  /** 最右邊另外一顆小按鈕（例如收合這一組），跟整列的點擊分開 */
  action?: { label: string; hint?: string; onTap: Handler };
  /** 狀態標籤：上映中（綠底）／已下檔（紅底）。一般的列放在片名後面；kv 的資料列放在右邊 */
  tag?: { text: string; tone: string };
  /** 右邊的重點欄：目前排序依據的那個數字（評分、日期、影城數、票房），大字顯示；評分依高低變色，樣式跟電影頁的評分徽章同一套 */
  hi?: { kind: string; text: string; tier: string; note?: string };
  /** 右邊畫一顆開關（true 開、false 關）：整列點了就切換 */
  sw?: boolean;
  /** 右邊列出幾個可選的值，亮的是目前的；整列點了換下一個 */
  steps?: { list: string[]; now: string };
  danger?: boolean; // 救不回來的動作：標題紅字
  full?: boolean; // 說明不截斷，完整換行（刪除這類一定要看完後果的列）
}): string {
  const cls = ["item", props.danger ? "danger" : "", props.head ? "head" : "", props.kv ? "kv" : "", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : "", props.onLongPress ? "long" : ""].join(" ");
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.remove()}";
  return (
    <div class={cls} onTap={props.onTap} onLongPress={props.onLongPress}>
      {/* 名次：位數越多字越小，欄寬固定，四位數也不會壓到海報 */}
      {props.rank ? <span class={"rank" + (props.rank <= 3 ? " top" : "") + (props.rank >= 1000 ? " d4" : props.rank >= 100 ? " d3" : "")}>{props.rank}</span> : null}
      {props.thumb ? (
        props.thumb.pending && !props.thumb.src ? (
          <span class="thumb none" />
        ) : (
          <GenPoster cls="thumb" title={props.title}>
            {props.thumb.src ? <img src={props.thumb.src} data-url={props.thumb.url && props.thumb.url !== props.thumb.src ? props.thumb.url : undefined} alt="" loading="lazy" onerror={fallback} /> : null}
          </GenPoster>
        )
      ) : null}
      {props.icon ? <span class="ico">{props.icon}</span> : null}
      <div class="body">
        <div class={props.tag && !props.kv ? "title tagged" : "title"}>{esc(props.title)}{props.tag && !props.kv ? <span class={"pill " + props.tag.tone}>{esc(props.tag.text)}</span> : null}</div>
        {/* 多行說明（用換行分開）：每行各自一行、太長就截斷，第二行起淡一階 */}
        {props.subtitle ? (props.subtitle.includes("\n") ? props.subtitle.split("\n").map((l, i) => <div class={"sub one" + (i ? " dim" : "")}>{esc(l)}</div>) : <div class={props.full ? "sub full" : "sub"}>{esc(props.subtitle)}</div>) : null}
      </div>
      {props.badge ? <span class="badge">{esc(props.badge)}</span> : null}
      {props.right ? <span class="right">{esc(props.right)}</span> : null}
      {props.steps ? <span class="steps" aria-label={"目前 " + props.steps.now + "，點一下換下一個"}>{props.steps.list.map((v) => <i class={v === props.steps!.now ? "on" : ""}>{esc(v)}</i>)}</span> : null}
      {props.sw !== undefined ? <span class={"tg" + (props.sw ? " on" : "")} role="switch" aria-checked={props.sw ? "true" : "false"}><i /></span> : null}
      {props.tag && props.kv ? <span class="right"><span class={"pill " + props.tag.tone}>{esc(props.tag.text)}</span></span> : null}
      {props.hi ? (
        <span class={`hi ${props.hi.kind} ${props.hi.tier}`}>
          <span class="hv">
            {props.hi.kind === "imdb" ? <i class="imdb">IMDb</i> : props.hi.kind === "tomato" || props.hi.kind === "popcorn" ? <i class="emo">{rateIcon(props.hi.kind, props.hi.tier)}</i> : props.hi.kind === "community" ? <i class="emo star">★</i> : null}
            <b>{esc(props.hi.text)}</b>
          </span>
          {props.hi.note ? <small>{esc(props.hi.note)}</small> : null}
        </span>
      ) : null}
      {props.onTap && props.chevron !== false && !props.action ? <span class="chev">›</span> : null}
      {props.action ? <button class="act" aria-label={props.action.hint || props.action.label} onTap={props.action.onTap}>{esc(props.action.label)}</button> : null}
    </div>
  );
}

export function Chips(props: { children?: Children; tabs?: boolean; scroll?: boolean }): string {
  // scroll：選項很多時排成一行、可左右滑（選中的那一顆會自動捲到中間），不往下疊好幾行
  return <div class={props.tabs ? "chips tabs" : props.scroll ? "chips scroll" : "chips"}>{props.children}</div>; // tabs：分類列，平分寬度排成一行不換行
}

export function Chip(props: { label: string; sub?: string; onTap?: Handler; muted?: boolean; warn?: boolean }): string {
  return (
    <button class={["chip", props.muted ? "muted" : "", props.warn ? "warn" : ""].join(" ")} onTap={props.onTap}>
      <span class="l">{esc(props.label)}</span>
      {props.sub ? <span class="s">{esc(props.sub)}</span> : null}
    </button>
  );
}

/** 搜尋欄：沒有「搜尋」按鈕，打字停一下結果就跟著變（輸入法還在選字時不會動）。清空就回到全部 */
export function Search(props: { value: string; placeholder: string; onInput: (text: string) => void; autofocus?: boolean }): string {
  return <input class="field" name="q" type="search" enterkeyhint="search" autocomplete="off" value={props.value} placeholder={props.placeholder} autofocus={props.autofocus} onInput={(v: Record<string, string>) => props.onInput(v.q || "")} />;
}

/** 一列「標題＋下拉選單」：用系統的選單選（例如時間）；name 在同一頁不能重複 */
export function PickRow(props: { title: string; name: string; value: string; options: { id: string; label: string }[]; onPick: (id: string) => void }): string {
  return (
    <div class="item kv">
      <div class="body"><div class="title">{esc(props.title)}</div></div>
      <select class="sel" name={props.name} onInput={(v: Record<string, string>) => props.onPick(v[props.name] || "")}>
        {props.options.map((o) => <option value={o.id} selected={o.id === props.value}>{esc(o.label)}</option>)}
      </select>
    </div>
  );
}

export function Button(props: { label: string; onTap?: Handler; kind?: "primary" | "secondary" | "danger"; enter?: boolean }): string {
  return (
    <button class={"btn " + (props.kind || "primary")} onTap={props.onTap} data-enter={props.enter ? "" : undefined}>
      {esc(props.label)}
    </button>
  );
}

/** 電影頁頂端：海報＋資訊＋預告按鈕 */
/** 評分徽章：IMDb／番茄指數／爆米花指數，背景顏色依分數高低（綠／黃／紅） */
export interface RatingBadge {
  kind: "imdb" | "tomato" | "popcorn";
  value: string; // 顯示的分數，例如 8.5、94%
  tier: "good" | "mid" | "bad" | "none"; // none = 沒有這項評分
  note?: string; // 例如「新鮮認證」
  onTap?: Handler;
}
// 評分圖示（自己畫的，不是爛番茄的商標圖）：番茄＝認證新鮮／新鮮／腐爛，爆米花＝認證熱門／熱門／冷掉。大小跟著字
const RATE_ICON: Record<string, string> = {
  "tomato:good": "<ellipse cx=\"12\" cy=\"13.6\" rx=\"9.2\" ry=\"8.2\" fill=\"#e8372c\"/><ellipse cx=\"8.4\" cy=\"10.6\" rx=\"2.6\" ry=\"1.5\" fill=\"#ff8a7d\" opacity=\".75\" transform=\"rotate(-28 8.4 10.6)\"/><path d=\"M12 7.4c-1.6-2.4-4.3-2.9-6-2.1 1.5.5 2.4 1.5 2.9 2.7-1.2-.1-2.4.4-3.2 1.3 2.2-.5 4.2-.3 6.3.6 2.1-.9 4.1-1.1 6.3-.6-.8-.9-2-1.4-3.2-1.3.5-1.2 1.4-2.2 2.9-2.7-1.7-.8-4.4-.3-6 2.1z\" fill=\"#2f9e44\"/><path d=\"M12 7.6V4.2\" stroke=\"#2b8a3e\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><g transform=\"translate(13.2 13.2)\"><circle cx=\"5.4\" cy=\"5.4\" r=\"5.4\" fill=\"#f5b301\" stroke=\"#fff\" stroke-width=\"1.2\"/><path d=\"M2.9 5.5l1.8 1.8 3.3-3.6\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>",
  "tomato:mid": "<ellipse cx=\"12\" cy=\"13.6\" rx=\"9.2\" ry=\"8.2\" fill=\"#e8372c\"/><ellipse cx=\"8.4\" cy=\"10.6\" rx=\"2.6\" ry=\"1.5\" fill=\"#ff8a7d\" opacity=\".75\" transform=\"rotate(-28 8.4 10.6)\"/><path d=\"M12 7.4c-1.6-2.4-4.3-2.9-6-2.1 1.5.5 2.4 1.5 2.9 2.7-1.2-.1-2.4.4-3.2 1.3 2.2-.5 4.2-.3 6.3.6 2.1-.9 4.1-1.1 6.3-.6-.8-.9-2-1.4-3.2-1.3.5-1.2 1.4-2.2 2.9-2.7-1.7-.8-4.4-.3-6 2.1z\" fill=\"#2f9e44\"/><path d=\"M12 7.6V4.2\" stroke=\"#2b8a3e\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>",
  "tomato:bad": "<g fill=\"#3fb950\"><circle cx=\"12\" cy=\"12.4\" r=\"6.3\"/><g stroke=\"#3fb950\" stroke-linecap=\"round\"><path d=\"M12 12L5.2 6.6\" stroke-width=\"5\"/><path d=\"M12 12l6.6-6\" stroke-width=\"4.2\"/><path d=\"M12 12l8 3.4\" stroke-width=\"5\"/><path d=\"M12 12l1.4 8.2\" stroke-width=\"4.4\"/><path d=\"M12 12L5.4 18\" stroke-width=\"4\"/></g><circle cx=\"4.8\" cy=\"6.2\" r=\"3\"/><circle cx=\"19\" cy=\"5.6\" r=\"2.5\"/><circle cx=\"20.4\" cy=\"15.6\" r=\"2.9\"/><circle cx=\"13.5\" cy=\"20.6\" r=\"2.5\"/><circle cx=\"5\" cy=\"18.4\" r=\"2.3\"/><circle cx=\"2.2\" cy=\"12.2\" r=\"1.1\"/><circle cx=\"21.6\" cy=\"21.4\" r=\"1\"/><circle cx=\"11.6\" cy=\"2.2\" r=\"1\"/></g><ellipse cx=\"9.6\" cy=\"9.6\" rx=\"2\" ry=\"1.1\" fill=\"#8ee69b\" opacity=\".8\" transform=\"rotate(-30 9.6 9.6)\"/>",
  "popcorn:good": "<circle cx=\"7.4\" cy=\"7.6\" r=\"2.5\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"12\" cy=\"5.4\" r=\"3\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"16.6\" cy=\"7.6\" r=\"2.5\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"9.8\" cy=\"8.6\" r=\"2.2\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"14.3\" cy=\"8.6\" r=\"2.2\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><path d=\"M5.6 10h12.8l-1.6 11.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8z\" fill=\"#e8372c\"/><path d=\"M8.6 10h2.2l.5 12H9.4zM13.2 10h2.2l-.8 12h-1.9z\" fill=\"#fff\"/><path d=\"M5.2 9.2h13.6v1.6H5.2z\" fill=\"#c92a20\"/><g transform=\"translate(13.2 13.2)\"><circle cx=\"5.4\" cy=\"5.4\" r=\"5.4\" fill=\"#f5b301\" stroke=\"#fff\" stroke-width=\"1.2\"/><path d=\"M2.9 5.5l1.8 1.8 3.3-3.6\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>",
  "popcorn:mid": "<circle cx=\"7.4\" cy=\"7.6\" r=\"2.5\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"12\" cy=\"5.4\" r=\"3\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"16.6\" cy=\"7.6\" r=\"2.5\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"9.8\" cy=\"8.6\" r=\"2.2\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"14.3\" cy=\"8.6\" r=\"2.2\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><path d=\"M5.6 10h12.8l-1.6 11.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8z\" fill=\"#e8372c\"/><path d=\"M8.6 10h2.2l.5 12H9.4zM13.2 10h2.2l-.8 12h-1.9z\" fill=\"#fff\"/><path d=\"M5.2 9.2h13.6v1.6H5.2z\" fill=\"#c92a20\"/>",
  "popcorn:bad": "<g transform=\"rotate(-9 8 14)\"><path d=\"M2 10.4L13.4 7.6v12.8L2 17.6a1 1 0 0 1-.8-1v-5.2a1 1 0 0 1 .8-1z\" fill=\"#e8372c\"/><path d=\"M1.2 12.6l12.2-1.5v2.4L1.2 14.4zM1.6 16.2l11.8 1.6v2.2L2 17.6z\" fill=\"#fff\"/><path d=\"M1.6 10.6l11.8-2.6v1.9L1.2 11.6z\" fill=\"#fff\" opacity=\"0\"/><ellipse cx=\"13.6\" cy=\"14\" rx=\"1.5\" ry=\"6.6\" fill=\"#8f1f18\"/></g><circle cx=\"15.2\" cy=\"10.6\" r=\"1.9\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"17.2\" cy=\"17.2\" r=\"2.6\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"20.8\" cy=\"19.4\" r=\"2.1\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"17.6\" cy=\"13\" r=\"1.9\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"21.2\" cy=\"15.6\" r=\"1.7\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/><circle cx=\"13.6\" cy=\"20.4\" r=\"1.8\" fill=\"#fff3c4\" stroke=\"#e6b94a\" stroke-width=\".7\"/>",
};
/** 一個評分圖示：tier 是 good（認證）／mid（及格）／bad（不及格）；none（沒有評分）用及格的那個圖，外面會轉成灰色 */
export function rateIcon(kind: "tomato" | "popcorn", tier: string): string {
  const inner = RATE_ICON[`${kind}:${tier === "none" ? "mid" : tier}`] || RATE_ICON[`${kind}:mid`];
  return `<svg class="ri" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}
/** 評分徽章列：tier 為 none 表示沒有這項評分（顯示「-」，灰色、不可點） */
export function Badges(props: { items: RatingBadge[] }): string {
  if (!props.items.length) return "";
  return (
    <div class="ratings">
      {props.items.map((b) => (
        <button class={"rate " + b.tier} onTap={b.tier === "none" ? undefined : b.onTap} aria-label={b.kind === "imdb" ? "IMDb" : b.kind === "tomato" ? "番茄指數" : "爆米花指數"}>
          {b.kind === "imdb" ? <span class="imdb">IMDb</span> : <span class="emo">{rateIcon(b.kind, b.tier)}</span>}
          <span class="v">{esc(b.value)}</span>
          {b.note ? <span class="n">{esc(b.note)}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** 電影頁頂端：海報在左（沒海報時是灰色預設圖，還在查時先留空的灰框），資訊、評分、預告按鈕在右 */
/** 預設海報：場記板斜紋＋片名＋膠卷孔，底色依片名固定。真的海報圖疊在上面，圖讀不到（或根本沒有）就看到它 */
export function GenPoster(props: { cls: string; title: string; children?: Children }): string {
  const n = Array.from(props.title).length;
  return (
    <span class={`${props.cls} gen g${posterTint(props.title)}`}>
      <i class="clap" />
      <span class={"gt" + (n > 16 ? " l" : n > 7 ? " m" : "")}>
        <span>{esc(props.title)}</span>
      </span>
      <i class="perf" />
      {props.children}
    </span>
  );
}

export function Hero(props: { title?: string; poster?: string; posterUrl?: string; posterPending?: boolean; lines: string[]; trailerLabel?: string; onTrailer?: Handler; badges?: RatingBadge[]; fav?: { on: boolean; onTap: Handler }; onShare?: Handler }): string {
  // 海報：本機快取（file://）讀不到就改用網址，網址也讀不到就拿掉，露出底下的預設海報
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.remove()}";
  return (
    <div class="hero">
      {props.posterPending && !props.poster ? (
        <div class="poster none pending" />
      ) : (
        <GenPoster cls="poster" title={props.title || ""}>
          {props.poster ? <img src={props.poster} data-url={props.posterUrl && props.posterUrl !== props.poster ? props.posterUrl : undefined} alt="" onerror={fallback} /> : null}
        </GenPoster>
      )}
      <div class="hero-info">
        {props.lines.filter(Boolean).map((l) => <div class="hero-line">{esc(l)}</div>)}
        {props.badges ? <Badges items={props.badges} /> : null}
        {/* 預告按鈕旁邊放收藏的愛心（不另外佔一行） */}
        {props.onTrailer || props.fav || props.onShare ? (
          <div class="hero-acts">
            {props.onTrailer ? (
              <button class="trailer" onTap={props.onTrailer}>
                ▶︎ {esc(props.trailerLabel || "觀看預告")}
              </button>
            ) : null}
            {props.fav ? (
              <button class={"fav" + (props.fav.on ? " on" : "")} aria-label={props.fav.on ? "取消收藏" : "收藏這部電影"} aria-pressed={props.fav.on ? "true" : "false"} onTap={props.fav.onTap}>
                {props.fav.on ? "♥" : "♡"}
              </button>
            ) : null}
            {props.onShare ? (
              <button class="fav share" aria-label="分享這部電影" onTap={props.onShare}>
                {'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 一段內文（劇情簡介）；dim 是底下顏色較淡的補充（導演、演員） */
export function Para(props: { text: string; dim?: string }): string {
  return (
    <div class="para">
      {esc(props.text)}
      {props.dim ? <div class="dim">{esc(props.dim)}</div> : null}
    </div>
  );
}

export function Note(props: { text: string; kind?: "info" | "warn" | "error" }): string {
  return <p class={"note " + (props.kind || "info")}>{esc(props.text)}</p>;
}

export function Loading(props: { text?: string }): string {
  return (
    <div class="loading">
      <div class="spinner" />
      <div>{esc(props.text || "讀取中…")}</div>
    </div>
  );
}

export function Empty(props: { icon?: string; text: string }): string {
  return (
    <div class="empty">
      <div class="big">{props.icon || "🎬"}</div>
      <div>{esc(props.text)}</div>
    </div>
  );
}
