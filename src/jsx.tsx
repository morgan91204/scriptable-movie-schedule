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
  muted?: boolean;
  accent?: boolean;
  chevron?: boolean;
}): string {
  const cls = ["item", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : ""].join(" ");
  return (
    <div class={cls} onTap={props.onTap}>
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
