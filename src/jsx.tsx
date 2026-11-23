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
  items: { id: string; label: string; icon: string }[];
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
  /** 最右邊另外一顆小按鈕（例如收合這一組），跟整列的點擊分開 */
  action?: { label: string; hint?: string; onTap: Handler };
}): string {
  const cls = ["item", props.head ? "head" : "", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : "", props.onLongPress ? "long" : ""].join(" ");
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
        <div class="title">{esc(props.title)}</div>
        {/* 多行說明（用換行分開）：每行各自一行、太長就截斷，第二行起淡一階 */}
        {props.subtitle ? (props.subtitle.includes("\n") ? props.subtitle.split("\n").map((l, i) => <div class={"sub one" + (i ? " dim" : "")}>{esc(l)}</div>) : <div class="sub">{esc(props.subtitle)}</div>) : null}
      </div>
      {props.badge ? <span class="badge">{esc(props.badge)}</span> : null}
      {props.right ? <span class="right">{esc(props.right)}</span> : null}
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
/** 評分徽章列：tier 為 none 表示沒有這項評分（顯示「-」，灰色、不可點） */
export function Badges(props: { items: RatingBadge[] }): string {
  if (!props.items.length) return "";
  return (
    <div class="ratings">
      {props.items.map((b) => (
        <button class={"rate " + b.tier} onTap={b.tier === "none" ? undefined : b.onTap} aria-label={b.kind === "imdb" ? "IMDb" : b.kind === "tomato" ? "番茄指數" : "爆米花指數"}>
          {b.kind === "imdb" ? <span class="imdb">IMDb</span> : <span class="emo">{b.kind === "tomato" ? (b.tier === "bad" ? "🤢" : "🍅") : b.tier === "bad" ? "🫗" : "🍿"}</span>}
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

export function Hero(props: { title?: string; poster?: string; posterUrl?: string; posterPending?: boolean; lines: string[]; trailerLabel?: string; onTrailer?: Handler; badges?: RatingBadge[] }): string {
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
        {props.onTrailer ? (
          <button class="trailer" onTap={props.onTrailer}>
            ▶︎ {esc(props.trailerLabel || "觀看預告")}
          </button>
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
