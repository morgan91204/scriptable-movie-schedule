// 迷你 JSX runtime：把 TSX 轉成 HTML 字串，交給 Scriptable 的 WebView 顯示。
// 點擊事件用 data-act 標記，由 ui.tsx 的事件迴圈接收後呼叫對應的 handler。

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

export function Page(props: {
  title: string;
  subtitle?: string;
  onBack?: Handler;
  right?: string;
  children?: Children;
}): string {
  return (
    <div class="page">
      <header class="bar">
        {props.onBack ? (
          <button class="back" onTap={props.onBack}>
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
}): string {
  const cls = ["item", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : "", props.onLongPress ? "long" : ""].join(" ");
  return (
    <div class={cls} onTap={props.onTap} onLongPress={props.onLongPress}>
      {props.icon ? <span class="ico">{props.icon}</span> : null}
      <div class="body">
        <div class="title">{esc(props.title)}</div>
        {props.subtitle ? <div class="sub">{esc(props.subtitle)}</div> : null}
      </div>
      {props.badge ? <span class="badge">{esc(props.badge)}</span> : null}
      {props.right ? <span class="right">{esc(props.right)}</span> : null}
      {props.onTap && props.chevron !== false ? <span class="chev">›</span> : null}
    </div>
  );
}

export function Chips(props: { children?: Children }): string {
  return <div class="chips">{props.children}</div>;
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
export function Hero(props: { poster?: string; posterUrl?: string; posterPending?: boolean; lines: string[]; trailerLabel?: string; onTrailer?: Handler; badges?: RatingBadge[] }): string {
  // 海報：本機快取（file://）讀不到就改用網址，網址也讀不到才換成灰色預設圖
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.replaceWith(Object.assign(document.createElement('div'),{className:'poster none',textContent:'🎬'}))}";
  return (
    <div class="hero">
      {props.poster ? (
        <img class="poster" src={props.poster} data-url={props.posterUrl && props.posterUrl !== props.poster ? props.posterUrl : undefined} alt="" onerror={fallback} />
      ) : (
        <div class={"poster none" + (props.posterPending ? " pending" : "")}>{props.posterPending ? "" : "🎬"}</div>
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
