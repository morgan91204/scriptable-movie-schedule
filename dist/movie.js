// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: film; share-sheet-inputs: url, plain-text;
// @movie-schedule-app 電影行程 v2026.11.06-0110
// 由 src/main.tsx 編譯產生（esbuild），請改原始碼後重新編譯。

// src/jsx.tsx
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function flat(children) {
  if (!Array.isArray(children)) children = [children];
  let out = "";
  for (const c of children) {
    if (c === null || c === void 0 || c === false || c === true) continue;
    if (Array.isArray(c)) out += flat(c);
    else out += String(c);
  }
  return out;
}
var handlers = {};
var seq = 0;
function resetHandlers() {
  handlers = {};
  seq = 0;
}
function getHandler(id) {
  return handlers[id];
}
function register(fn) {
  if (!fn) return "";
  const id = "a" + ++seq;
  handlers[id] = fn;
  return id;
}
var VOID = /^(br|hr|img|input|meta|link)$/;
function h(type, props, ...children) {
  if (typeof type === "function") return type({ ...props || {}, children });
  let attrs = "";
  for (const k in props || {}) {
    const v = props[k];
    if (v === null || v === void 0 || v === false) continue;
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
function Fragment(props) {
  return flat(props.children || []);
}
function Page(props) {
  return /* @__PURE__ */ h("div", { class: "page" }, /* @__PURE__ */ h("header", { class: "bar" }, props.onBack ? /* @__PURE__ */ h("button", { class: "back", onTap: props.onBack }, "‹ 返回") : /* @__PURE__ */ h("span", { class: "back-spacer" }), /* @__PURE__ */ h("div", { class: "bar-title" }, /* @__PURE__ */ h("div", { class: "t" }, esc(props.title)), props.subtitle ? /* @__PURE__ */ h("div", { class: "s" }, esc(props.subtitle)) : null), props.right ? /* @__PURE__ */ h("span", { class: "bar-right" }, props.right) : /* @__PURE__ */ h("span", { class: "back-spacer" })), /* @__PURE__ */ h("main", { class: "content" }, props.children));
}
function Section(props) {
  return /* @__PURE__ */ h("section", { class: "sec" }, props.title ? /* @__PURE__ */ h("h2", { class: "sec-title" }, esc(props.title)) : null, /* @__PURE__ */ h("div", { class: "group" }, props.children), props.hint ? /* @__PURE__ */ h("p", { class: "hint" }, esc(props.hint)) : null);
}
function Item(props) {
  const cls = ["item", props.onTap ? "tap" : "", props.muted ? "muted" : "", props.accent ? "accent" : "", props.onLongPress ? "long" : ""].join(" ");
  return /* @__PURE__ */ h("div", { class: cls, onTap: props.onTap, onLongPress: props.onLongPress }, props.icon ? /* @__PURE__ */ h("span", { class: "ico" }, props.icon) : null, /* @__PURE__ */ h("div", { class: "body" }, /* @__PURE__ */ h("div", { class: "title" }, esc(props.title)), props.subtitle ? /* @__PURE__ */ h("div", { class: "sub" }, esc(props.subtitle)) : null), props.badge ? /* @__PURE__ */ h("span", { class: "badge" }, esc(props.badge)) : null, props.right ? /* @__PURE__ */ h("span", { class: "right" }, esc(props.right)) : null, props.onTap && props.chevron !== false ? /* @__PURE__ */ h("span", { class: "chev" }, "›") : null);
}
function Chips(props) {
  return /* @__PURE__ */ h("div", { class: "chips" }, props.children);
}
function Chip(props) {
  return /* @__PURE__ */ h("button", { class: ["chip", props.muted ? "muted" : "", props.warn ? "warn" : ""].join(" "), onTap: props.onTap }, /* @__PURE__ */ h("span", { class: "l" }, esc(props.label)), props.sub ? /* @__PURE__ */ h("span", { class: "s" }, esc(props.sub)) : null);
}
function Button(props) {
  return /* @__PURE__ */ h("button", { class: "btn " + (props.kind || "primary"), onTap: props.onTap, "data-enter": props.enter ? "" : void 0 }, esc(props.label));
}
function Badges(props) {
  if (!props.items.length) return "";
  return /* @__PURE__ */ h("div", { class: "ratings" }, props.items.map((b) => /* @__PURE__ */ h("button", { class: "rate " + b.tier, onTap: b.tier === "none" ? void 0 : b.onTap, "aria-label": b.kind === "imdb" ? "IMDb" : b.kind === "tomato" ? "番茄指數" : "爆米花指數" }, b.kind === "imdb" ? /* @__PURE__ */ h("span", { class: "imdb" }, "IMDb") : /* @__PURE__ */ h("span", { class: "emo" }, b.kind === "tomato" ? b.tier === "bad" ? "🤢" : "🍅" : b.tier === "bad" ? "🫗" : "🍿"), /* @__PURE__ */ h("span", { class: "v" }, esc(b.value)), b.note ? /* @__PURE__ */ h("span", { class: "n" }, esc(b.note)) : null)));
}
function Hero(props) {
  const fallback = "if(this.dataset.url&&this.src!==this.dataset.url){this.src=this.dataset.url}else{this.replaceWith(Object.assign(document.createElement('div'),{className:'poster none',textContent:'🎬'}))}";
  return /* @__PURE__ */ h("div", { class: "hero" }, props.poster ? /* @__PURE__ */ h("img", { class: "poster", src: props.poster, "data-url": props.posterUrl && props.posterUrl !== props.poster ? props.posterUrl : void 0, alt: "", onerror: fallback }) : /* @__PURE__ */ h("div", { class: "poster none" + (props.posterPending ? " pending" : "") }, props.posterPending ? "" : "🎬"), /* @__PURE__ */ h("div", { class: "hero-info" }, props.lines.filter(Boolean).map((l) => /* @__PURE__ */ h("div", { class: "hero-line" }, esc(l))), props.badges ? /* @__PURE__ */ h(Badges, { items: props.badges }) : null, props.onTrailer ? /* @__PURE__ */ h("button", { class: "trailer", onTap: props.onTrailer }, "▶︎ ", esc(props.trailerLabel || "觀看預告")) : null));
}
function Note(props) {
  return /* @__PURE__ */ h("p", { class: "note " + (props.kind || "info") }, esc(props.text));
}
function Loading(props) {
  return /* @__PURE__ */ h("div", { class: "loading" }, /* @__PURE__ */ h("div", { class: "spinner" }), /* @__PURE__ */ h("div", null, esc(props.text || "讀取中…")));
}
function Empty(props) {
  return /* @__PURE__ */ h("div", { class: "empty" }, /* @__PURE__ */ h("div", { class: "big" }, props.icon || "🎬"), /* @__PURE__ */ h("div", null, esc(props.text)));
}

// src/platform-scriptable.ts
function settingsFile() {
  let fm;
  try {
    fm = FileManager.iCloud();
    fm.documentsDirectory();
  } catch (_) {
    fm = FileManager.local();
  }
  const dir = fm.joinPath(fm.documentsDirectory(), "電影行程");
  if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
  return { fm, path: fm.joinPath(dir, "設定.json") };
}
var web = null;
var IMG_PREFIX = "movie-img-";
var hash = (s) => {
  let h2 = 5381;
  for (let i = 0; i < s.length; i++) h2 = (h2 * 33 ^ s.charCodeAt(i)) >>> 0;
  return h2.toString(16);
};
var imgPath = (url) => {
  const fm = FileManager.local();
  return fm.joinPath(fm.cacheDirectory(), IMG_PREFIX + hash(url) + ".jpg");
};
var imgJobs = {};
var pruned = false;
function pruneImages() {
  if (pruned) return;
  pruned = true;
  try {
    const fm = FileManager.local();
    const dir = fm.cacheDirectory();
    for (const n of fm.listContents(dir)) {
      if (!n.startsWith(IMG_PREFIX)) continue;
      const p = fm.joinPath(dir, n);
      if (Date.now() - fm.modificationDate(p).getTime() > 14 * 864e5) fm.remove(p);
    }
  } catch (_) {
  }
}
function cachedImage(url) {
  try {
    const p = imgPath(url);
    return FileManager.local().fileExists(p) ? "file://" + p : null;
  } catch (_) {
    return null;
  }
}
function imageCacheBaseUrl() {
  return "file://" + FileManager.local().cacheDirectory() + "/";
}
var scriptablePlatform = {
  async fetchText(url, headers) {
    const r = new Request(url);
    r.headers = headers;
    r.timeoutInterval = 20;
    const body = await r.loadString();
    return { status: r.response && r.response.statusCode || 200, body };
  },
  async runInWebView(body) {
    if (!web) {
      web = new WebView();
      await web.loadHTML("<html><body></body></html>", "https://twshowtimes.com/");
    }
    return await web.evaluateJavaScript(`(function(){${body}
})()`, false);
  },
  async loadSettingsJSON() {
    try {
      const { fm, path } = settingsFile();
      if (!fm.fileExists(path)) return null;
      await fm.downloadFileFromiCloud(path);
      return fm.readString(path);
    } catch (_) {
      return null;
    }
  },
  saveSettingsJSON(json) {
    try {
      const { fm, path } = settingsFile();
      fm.writeString(path, json);
    } catch (_) {
    }
  },
  cacheGet(name) {
    try {
      const fm = FileManager.local();
      const p = fm.joinPath(fm.cacheDirectory(), "movie-" + name);
      return fm.fileExists(p) ? fm.readString(p) : null;
    } catch (_) {
      return null;
    }
  },
  cacheSet(name, value) {
    try {
      const fm = FileManager.local();
      fm.writeString(fm.joinPath(fm.cacheDirectory(), "movie-" + name), value);
    } catch (_) {
    }
  },
  cachedImage,
  cacheImage(url) {
    return imgJobs[url] ||= (async () => {
      pruneImages();
      const hit = cachedImage(url);
      if (hit) return hit;
      const r = new Request(url);
      r.timeoutInterval = 20;
      const d = await r.load();
      const status = r.response && r.response.statusCode || 200;
      if (status !== 200 || !d) return null;
      if (d.toBase64String().length < 100) return null;
      FileManager.local().write(imgPath(url), d);
      return cachedImage(url);
    })().catch(() => null);
  }
};

// src/ui.ts
var CSS = `
:root{color-scheme:light dark;
 --bg:#f2f2f7;--card:#fff;--fg:#1c1c1e;--fg2:#6e6e73;--line:rgba(60,60,67,.12);
 --bar:rgba(242,242,247,.86);--accent:#0a84ff;--green:#30d158;--orange:#ff9f0a;--red:#ff453a;--chip:#e9e9ee;--chip-fg:#1c1c1e}
@media(prefers-color-scheme:dark){:root{--bg:#000;--card:#1c1c1e;--fg:#f2f2f7;--fg2:#98989d;--line:rgba(84,84,88,.5);--chip:#2c2c2e;--chip-fg:#f2f2f7;--bar:rgba(0,0,0,.8)}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.4 -apple-system,"PingFang TC",system-ui,sans-serif;-webkit-text-size-adjust:100%}
button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;text-align:left}
.page{min-height:100vh;display:flex;flex-direction:column}
.bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 8px) 12px 8px;
 background:var(--bar);backdrop-filter:saturate(180%) blur(18px);-webkit-backdrop-filter:saturate(180%) blur(18px);border-bottom:1px solid var(--line)}
.back{color:var(--accent);font-size:17px;padding:6px 8px 6px 0;min-width:64px;white-space:nowrap}
.back-spacer{min-width:64px}
.bar-title{flex:1;text-align:center;min-width:0}
.bar-title .t{font-weight:600;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-title .s{font-size:12px;color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-right{min-width:64px;text-align:right;font-size:13px;color:var(--fg2);white-space:nowrap}
.content{flex:1;padding:8px 16px calc(env(safe-area-inset-bottom) + 32px)}
.sec{margin:14px 0 0}
.sec-title{margin:0 0 6px 12px;font-size:13px;font-weight:600;color:var(--fg2);text-transform:uppercase;letter-spacing:.3px}
.group{background:var(--card);border-radius:14px;overflow:hidden}
.hint{margin:8px 12px 0;font-size:13px;color:var(--fg2)}
.item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--line);min-height:46px}
.group .item:last-child{border-bottom:0}
.item.tap:active{background:var(--line)}
.item .ico{font-size:20px;width:26px;text-align:center;flex:none}
.item .body{flex:1;min-width:0}
.item .title{font-size:16px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.item .sub{font-size:13px;color:var(--fg2);margin-top:2px;white-space:pre-line;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.item .right{font-size:14px;color:var(--fg2);flex:none;max-width:40%;text-align:right}
.item .badge{flex:none;font-size:12px;padding:2px 8px;border-radius:999px;background:var(--chip);color:var(--chip-fg)}
.item .chev{color:var(--fg2);opacity:.55;font-size:22px;line-height:1;flex:none}
.item.muted .title,.item.muted .sub{color:var(--fg2)}
.item.accent .title{color:var(--accent)}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px}
.chip{display:flex;flex-direction:column;align-items:center;min-width:84px;padding:8px 12px;border-radius:12px;background:var(--chip);color:var(--chip-fg)}
.chip:active{opacity:.6}
.chip .l{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.chip .s{font-size:11px;color:var(--fg2);margin-top:2px}
.chip.muted{opacity:.45}
.chip.warn{outline:1.5px solid var(--orange)}
.btn{display:block;width:100%;padding:14px;border-radius:14px;text-align:center;font-size:17px;font-weight:600;margin-top:16px}
.btn.primary{background:var(--accent);color:#fff}
.btn.secondary{background:var(--card);color:var(--accent)}
.btn.danger{background:var(--card);color:var(--red)}
.btn:active{opacity:.7}
.note{margin:10px 12px 0;font-size:13px;color:var(--fg2)}
.note.version{padding:6px 0;-webkit-user-select:none;user-select:none}
.note.version:active{opacity:.5}
.note.warn{color:var(--orange)}
.note.error{color:var(--red)}
.field{display:block;width:100%;padding:12px 14px;border:0;border-radius:12px;background:var(--card);color:var(--fg);font-size:17px;margin-top:8px;outline:none}
.field:focus{box-shadow:0 0 0 2px var(--accent)}
.hero{display:flex;gap:14px;align-items:flex-end;margin:12px 4px 4px}
.hero .poster{width:112px;aspect-ratio:2/3;object-fit:cover;border-radius:12px;background:var(--chip);box-shadow:0 4px 14px rgba(0,0,0,.25);flex:none}
.hero .poster.none{display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:none;opacity:.9;filter:grayscale(1);color:var(--fg2)}
.hero .poster.pending{opacity:.5}
.hero-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hero-line{font-size:14px;color:var(--fg2)}
.ratings{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;overflow:visible}
.rate{display:flex;align-items:center;gap:3px;padding:3px 5px;border-radius:7px;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;line-height:1.2}
.rate.good{background:rgba(48,209,88,.18);color:#1f9d45}
.rate.mid{background:rgba(255,159,10,.2);color:#c77700}
.rate.bad{background:rgba(255,69,58,.18);color:#d63a31}
.rate.none{background:var(--chip);color:var(--fg2);opacity:.8}
.rate.none .emo{filter:grayscale(1);opacity:.7}
.rate.none .imdb{opacity:.55}
@media(prefers-color-scheme:dark){.rate.good{color:#30d158}.rate.mid{color:#ffb340}.rate.bad{color:#ff6961}}
.rate .imdb{background:#f5c518;color:#000;font-size:9px;font-weight:800;padding:1px 3px;border-radius:3px;letter-spacing:-.2px}
.rate .emo{font-size:12px}
.rate .n{font-size:10px;font-weight:600;opacity:.85}
.rate:active{opacity:.6}
.trailer{margin-top:8px;align-self:flex-start;padding:7px 13px;border-radius:999px;background:#ff0033;color:#fff;font-size:14px;font-weight:600;white-space:nowrap}
.trailer:active{opacity:.7}
.item.long{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 28px);transform:translateX(-50%);z-index:20;background:rgba(40,40,44,.92);color:#fff;
 padding:10px 18px;border-radius:999px;font-size:15px;pointer-events:none;animation:toast 1.8s ease forwards}
@keyframes toast{0%{opacity:0;transform:translate(-50%,8px)}12%,75%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.loading,.empty{text-align:center;color:var(--fg2);padding:72px 20px;white-space:pre-line}
.empty .big{font-size:44px;margin-bottom:8px}
.spinner{width:28px;height:28px;margin:0 auto 14px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
`;
var SHELL = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<style>${CSS}</style></head><body><div id="root"></div>
<script>
window.__pending=null;
function send(id){var vals={};
  document.querySelectorAll('input[name],select[name]').forEach(function(i){vals[i.name]=i.value;});
  if(window.__pending){var f=window.__pending;window.__pending=null;f(JSON.stringify({id:id,vals:vals,y:window.scrollY}));}}
// 長按 0.5 秒：觸發 data-long，並取消接下來的點擊
var lp=null,lpFired=false,lx=0,ly=0;
document.addEventListener('touchstart',function(e){var el=e.target.closest('[data-long]');lpFired=false;if(!el)return;
  var t=e.touches[0];lx=t.clientX;ly=t.clientY;
  lp=setTimeout(function(){lp=null;lpFired=true;send(el.getAttribute('data-long'));},500);},{passive:true});
document.addEventListener('touchmove',function(e){if(!lp)return;var t=e.touches[0];if(Math.abs(t.clientX-lx)>8||Math.abs(t.clientY-ly)>8){clearTimeout(lp);lp=null;}},{passive:true});
document.addEventListener('touchend',function(){if(lp){clearTimeout(lp);lp=null;}});
document.addEventListener('contextmenu',function(e){if(e.target.closest('[data-long]'))e.preventDefault();});
window.__toast=function(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},1900);};
document.addEventListener('click',function(e){
  if(lpFired){lpFired=false;e.preventDefault();return;}
  var el=e.target.closest('[data-act]');if(!el)return;
  var id=el.getAttribute('data-act');var vals={};
  document.querySelectorAll('input[name],select[name]').forEach(function(i){vals[i.name]=i.value;});
  if(window.__pending){var f=window.__pending;window.__pending=null;f(JSON.stringify({id:id,vals:vals,y:window.scrollY}));}
});
window.__render=function(html,to){var y=window.scrollY;document.getElementById('root').innerHTML=html;window.scrollTo(0,to<0?y:to);var f=document.querySelector('input[autofocus]');if(f)setTimeout(function(){f.focus()},50);};
document.addEventListener('keydown',function(e){if(e.key==='Enter'){var b=document.querySelector('[data-enter]');if(b)b.click();}});
<\/script></body></html>`;
var UI = class {
  constructor() {
    this.wv = new WebView();
    this.presented = null;
    this.closed = false;
    let base = "";
    try {
      base = imageCacheBaseUrl();
    } catch (_) {
    }
    this.ready = (base ? this.wv.loadHTML(SHELL, base) : this.wv.loadHTML(SHELL)).catch(() => this.wv.loadHTML(SHELL));
  }
  /** 顯示畫面（不等待點擊），用於讀取中。 */
  /** scrollTo：畫完後捲到哪裡。-1 = 停在原位（同一頁重繪，例如切換廣告時間）；0 = 頂端；其他 = 返回時還原的位置 */
  async render(html, scrollTo = 0) {
    await this.ready;
    await this.wv.evaluateJavaScript(`window.__render(${JSON.stringify(html)},${Math.round(scrollTo)});true`, false);
    if (!this.presented) {
      this.presented = this.wv.present(true).then(() => {
        this.closed = true;
      });
    }
  }
  /** 顯示畫面並等待使用者點擊；回傳被點元素註冊的 handler，使用者關閉視窗時回傳 null。 */
  async show(html, scrollTo = 0) {
    await this.render(html, scrollTo);
    const wait = this.wv.evaluateJavaScript(`window.__pending=function(p){completion(p)};true`, true);
    const result = await Promise.race([wait, this.presented.then(() => null)]);
    if (result === null) return null;
    const { id, vals, y } = JSON.parse(String(result));
    const handler = getHandler(String(id));
    return handler ? { handler, vals: vals || {}, y: Number(y) || 0 } : null;
  }
  /** 畫面下方短暫顯示一行提示（例如「已複製地址」） */
  async toast(text) {
    await this.ready;
    await this.wv.evaluateJavaScript(`window.__toast(${JSON.stringify(text)});true`, false);
  }
  /** 每次重繪前清掉舊的 handler。 */
  begin() {
    resetHandlers();
  }
  whenClosed() {
    return this.presented || Promise.resolve();
  }
};

// src/platform.ts
var current = null;
function setPlatform(p) {
  current = p;
}
function platform() {
  if (!current) throw new Error("platform 尚未設定");
  return current;
}

// src/parsers.gen.ts
var PARSERS_JS = `function parseTwIndex(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  const seen = {};
  let city = "";
  for (const el of Array.from(doc.querySelectorAll('h2, a[href^="/cinemas/"]'))) {
    if (el.tagName === "H2") {
      city = clean(el.querySelector("a")?.textContent || el.textContent).replace(/\\(.*$/, "").trim();
      continue;
    }
    const m = (el.getAttribute("href") || "").match(/^\\/cinemas\\/([^/]+)\\/$/);
    if (!m || seen[m[1]]) continue;
    const name = clean(el.querySelector("h3")?.textContent);
    if (!name) continue;
    seen[m[1]] = true;
    out.push({ id: m[1], name, district: clean(el.querySelector("p")?.textContent), city });
  }
  return out;
}
function parseTwDay(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const timeRe = /^(?:[01]\\d|2[0-3]):[0-5]\\d$/;
  const heading = Array.from(doc.querySelectorAll("h2")).map((e) => clean(e.textContent)).find((s) => /\\d{4}-\\d{2}-\\d{2}\\s*片單/.test(s));
  const date = heading ? heading.match(/\\d{4}-\\d{2}-\\d{2}/)[0] : "";
  const dates = [];
  for (const a of Array.from(doc.querySelectorAll('a[href^="/cinemas/"]'))) {
    const m = (a.getAttribute("href") || "").match(/^\\/cinemas\\/[^/]+\\/(\\d{4}-\\d{2}-\\d{2})\\/$/);
    if (m && dates.indexOf(m[1]) < 0) dates.push(m[1]);
  }
  if (date && dates.indexOf(date) < 0) dates.unshift(date);
  dates.sort();
  let address = "";
  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const obj = JSON.parse(el.textContent || "");
      if (obj["@type"] === "MovieTheater") address = clean(obj.address && obj.address.streetAddress);
    } catch (_) {
    }
  }
  const bookingEl = Array.from(doc.querySelectorAll("a[href]")).find(
    (a) => /前往訂票/.test(a.textContent || "") && /^https:\\/\\//.test(a.getAttribute("href") || "")
  );
  const movies = [];
  for (const card of Array.from(doc.querySelectorAll(".card"))) {
    const titleEl = card.querySelector(".card-title");
    if (!titleEl) continue;
    const title = clean(titleEl.textContent);
    const badges = Array.from(card.querySelectorAll(".badge-sm")).map((e) => clean(e.textContent));
    const rt = badges.find((s) => /^\\d+\\s*分$/.test(s));
    const rating = badges.find((s) => /級$/.test(s)) || "";
    const versions = [];
    for (const row of Array.from(card.querySelectorAll(".flex.flex-wrap.items-center.gap-2"))) {
      const times = Array.from(row.querySelectorAll(".font-mono")).map((e) => clean(e.textContent)).filter((s) => timeRe.test(s));
      if (!times.length) continue;
      const labelEl = Array.from(row.children).find((e) => !e.classList.contains("font-mono"));
      const label = clean(labelEl && labelEl.textContent) || "一般場";
      const uniq = times.filter((t, i) => times.indexOf(t) === i).sort();
      const old = versions.find((v) => v.label === label);
      if (old) old.times = old.times.concat(uniq.filter((t) => old.times.indexOf(t) < 0)).sort();
      else versions.push({ label, times: uniq });
    }
    if (title && versions.length)
      movies.push({ title, runtime: rt ? Number(rt.match(/\\d+/)[0]) : 0, rating, versions });
  }
  return {
    cinema: clean(doc.querySelector("h1")?.textContent),
    address,
    date,
    dates,
    booking: bookingEl ? bookingEl.getAttribute("href") || "" : "",
    movies
  };
}
function parseEslite(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const schedules = {};
  const add = (day, title, runtime, label, time) => {
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(day) || !title || !/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(time)) return;
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title && x.runtime === runtime);
    if (!m) list.push(m = { title, runtime, versions: [] });
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push(v = { label, times: [] });
    if (v.times.indexOf(time) < 0) v.times.push(time);
  };
  const updated = (doc.body.textContent || "").match(/最後更新時間[：:]\\s*(\\d{4})-(\\d{2})-(\\d{2})/);
  if (!updated) throw new Error("讀不到誠品官網的更新日期，無法判斷場次年份");
  const anchor = Date.parse(\`\${updated[1]}-\${updated[2]}-\${updated[3]}T12:00:00+08:00\`);
  for (const box of Array.from(doc.querySelectorAll(".box"))) {
    const title = clean(box.querySelector(".intro .left p")?.textContent);
    if (!title) continue;
    const info = clean(box.querySelector(".intro .right")?.textContent);
    const runtime = Number((info.match(/片長[：:]\\s*(\\d+)\\s*分鐘/) || [])[1] || 0);
    const subtitle = (info.match(/字幕[：:]\\s*([^\\s]+)/) || [])[1] || "";
    for (const slide of Array.from(box.querySelectorAll(".time-swiper .swiper-slide"))) {
      const md = clean(slide.querySelector("p")?.textContent).match(/^(\\d{1,2})\\/(\\d{1,2})/);
      if (!md) continue;
      const mm = md[1].padStart(2, "0"), dd = md[2].padStart(2, "0");
      const y = Number(updated[1]);
      const cands = [y - 1, y, y + 1].map((yy) => \`\${yy}-\${mm}-\${dd}\`);
      cands.sort(
        (a, b) => Math.abs(Date.parse(a + "T12:00:00+08:00") - anchor) - Math.abs(Date.parse(b + "T12:00:00+08:00") - anchor)
      );
      for (const li of Array.from(slide.querySelectorAll("li")))
        add(cands[0], title, runtime, subtitle ? \`字幕 \${subtitle}\` : "一般場", clean(li.textContent));
    }
  }
  return { schedules, notice: "" };
}
function parseSpotHs(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const schedules = {};
  let notice = "";
  const add = (day, title, runtime, label, time) => {
    if (!title || !/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(time)) return;
    const list = schedules[day] || (schedules[day] = []);
    let m = list.find((x) => x.title === title && x.runtime === runtime);
    if (!m) list.push(m = { title, runtime, versions: [] });
    let v = m.versions.find((x) => x.label === label);
    if (!v) m.versions.push(v = { label, times: [] });
    if (v.times.indexOf(time) < 0) v.times.push(time);
  };
  const tables = Array.from(doc.querySelectorAll("table[id]")).filter((t) => /^\\d{8}$/.test(t.id));
  const halls = [];
  for (const t of tables) if (t.parentElement && halls.indexOf(t.parentElement) < 0) halls.push(t.parentElement);
  for (const table of tables) {
    const day = table.id.replace(/^(\\d{4})(\\d{2})(\\d{2})$/, "$1-$2-$3");
    const hall = \`第 \${halls.indexOf(table.parentElement) + 1} 廳\`;
    for (const row of Array.from(table.querySelectorAll("tr"))) {
      const cells = Array.from(row.children).filter((el) => /^(TD|TH)$/.test(el.tagName));
      const ti = cells.findIndex((el) => /^\\d{2}:\\d{2}$/.test(clean(el.textContent)));
      if (ti < 0) {
        if (/影展|包場/.test(row.textContent || ""))
          notice = "部分日期有影展／包場，官網沒列出的個別場次不會出現，請另查官方活動頁。";
        continue;
      }
      const titleCell = cells[ti + 1];
      if (!titleCell) continue;
      const holder = titleCell.cloneNode(true);
      for (const br of Array.from(holder.querySelectorAll("br"))) br.replaceWith("\\n");
      const title = (holder.textContent || "").split("\\n").map(clean).find(Boolean) || "";
      const rtText = clean(cells[ti + 2]?.textContent);
      const subtitle = clean(cells[ti + 3]?.textContent);
      add(day, title, /^\\d+$/.test(rtText) ? Number(rtText) : 0, hall + (subtitle ? \`｜字幕 \${subtitle}\` : ""), clean(cells[ti].textContent));
    }
  }
  return { schedules, notice };
}
function parseSpotMovie(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const title = clean(doc.querySelector(".movie_title")?.textContent).replace(/([：:])\\s+/g, "$1");
  if (!title) return null;
  const body = doc.body.textContent || "";
  const runtime = Number((body.match(/(\\d+)\\s*min/i) || [])[1] || 0);
  const k = body.indexOf("放映時刻");
  const entries = [];
  if (k >= 0) {
    const seg = body.slice(k).split(/Add\\s/)[0];
    const marks = Array.from(seg.matchAll(/(\\d{1,2})\\/(\\d{1,2})\\s*\\([一二三四五六日]\\)/g));
    marks.forEach((mk, i) => {
      const part = seg.slice((mk.index || 0) + mk[0].length, i + 1 < marks.length ? marks[i + 1].index : void 0);
      const times = Array.from(part.matchAll(/(\\d{1,2}):(\\d{2})/g)).map((t) => t[1].padStart(2, "0") + ":" + t[2]).filter((t) => /^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(t));
      if (times.length) entries.push({ month: Number(mk[1]), day: Number(mk[2]), times });
    });
  }
  return { title, runtime, entries };
}
function parseLux(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  for (const a of Array.from(doc.querySelectorAll('.movie_all_list a[href*="movie_item.php"]'))) {
    const id = ((a.getAttribute("href") || "").match(/film_id=(\\d+)/) || [])[1];
    const h1 = a.querySelector("h1");
    if (!id || !h1) continue;
    const holder = h1.cloneNode(true);
    for (const sp of Array.from(holder.querySelectorAll("span"))) sp.remove();
    const title = clean(holder.textContent);
    const entries = [];
    let cur = null;
    for (const el of Array.from(a.querySelectorAll("h3, li"))) {
      const txt = clean(el.textContent);
      if (el.tagName === "H3") {
        const md = txt.match(/(\\d{1,2})\\/(\\d{1,2})/);
        cur = md ? { month: Number(md[1]), day: Number(md[2]), times: [] } : null;
        if (cur) entries.push(cur);
      } else if (cur) {
        const m = txt.match(/^(\\d{1,2}):(\\d{2})\\s*(?:\\|\\s*(\\S+))?/);
        if (m) cur.times.push({ t: m[1].padStart(2, "0") + ":" + m[2], hall: m[3] || "" });
      }
    }
    if (title && entries.some((e) => e.times.length)) {
      const old = out.find((x) => x.id === id);
      if (!old) out.push({ id, title, entries });
    }
  }
  return out;
}
function parseLuxFilm(doc) {
  const text = String(doc.body.textContent || "").replace(/\\s+/g, " ");
  return {
    runtime: Number((text.match(/長度\\s*\\|\\s*(\\d+)\\s*min/i) || [])[1] || 0),
    rating: (text.match(/級別\\s*\\|\\s*(\\S+?級)/) || [])[1] || ""
  };
}
function parseAtRegion(doc) {
  const out = [];
  const region = ((doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || "").match(/\\/(a\\d\\d)\\//) || [])[1] || "";
  for (const a of Array.from(doc.querySelectorAll('a[href^="/showtime/t"]'))) {
    const m = (a.getAttribute("href") || "").match(/^\\/showtime\\/(t\\w+)\\/(a\\d\\d)\\/$/);
    const name = String(a.textContent || "").replace(/\\s+/g, " ").trim();
    if (!m || !name || region && m[2] !== region || out.some((x) => x.id === m[1])) continue;
    out.push({ id: m[1], region: m[2], name });
  }
  return out;
}
function parseAtDay(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const RATING = { G: "普遍級", P: "保護級", F2: "輔12級", F5: "輔15級", R: "限制級" };
  const info = Array.from(doc.querySelectorAll("li")).map((li) => clean(li.textContent));
  const address = (info.find((s) => /^地址[:：]/.test(s)) || "").replace(/^地址[:：]\\s*/, "").replace(/\\s*\\(地圖\\)\\s*$/, "");
  const siteEl = Array.from(doc.querySelectorAll("li")).find((li) => /^網站[:：]/.test(clean(li.textContent)));
  const site = siteEl?.querySelector("a")?.getAttribute("href") || "";
  const h3 = Array.from(doc.querySelectorAll("h3")).map((e) => clean(e.textContent)).find((s) => /\\d{4}\\/\\d{2}\\/\\d{2}/.test(s)) || "";
  const date = (h3.match(/\\d{4}\\/\\d{2}\\/\\d{2}/) || [""])[0].replace(/\\//g, "-");
  const movies = [];
  for (const table of Array.from(doc.querySelectorAll("#theaterShowtimeTable, ul[id='theaterShowtimeTable']"))) {
    const title = clean(table.querySelector(".filmTitle a")?.textContent);
    if (!title) continue;
    const text = clean(table.textContent);
    const runtime = Number((text.match(/片長[:：]\\s*(\\d+)\\s*分/) || [])[1] || 0);
    const cer = ((table.querySelector('img[src*="cer_"]')?.getAttribute("src") || "").match(/cer_(\\w+)\\./) || [])[1] || "";
    let label = "一般場";
    const times = [];
    for (const li of Array.from(table.querySelectorAll("li"))) {
      if (li.classList.contains("filmVersion")) label = clean(li.textContent) || label;
      const m = clean(li.textContent).match(/^(\\d{1,2})[:：](\\d{2})$/);
      if (m) times.push(m[1].padStart(2, "0") + ":" + m[2]);
    }
    if (!times.length) continue;
    let mv = movies.find((x) => x.title === title);
    if (!mv) movies.push(mv = { title, runtime, rating: RATING[cer] || "", versions: [] });
    let v = mv.versions.find((x) => x.label === label);
    if (!v) mv.versions.push(v = { label, times: [] });
    for (const t of times) if (v.times.indexOf(t) < 0) v.times.push(t);
  }
  return { name: clean(doc.querySelector("#section_nav")?.textContent).split("﹥").pop() || "", address, site, date, movies };
}
function parseTwMovies(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const out = [];
  for (const sec of Array.from(doc.querySelectorAll("section"))) {
    const h2 = clean(sec.querySelector("h2")?.textContent);
    if (!/上映中|即將上映/.test(h2)) continue;
    for (const a of Array.from(sec.querySelectorAll('a[href^="/movies/"]'))) {
      const m = (a.getAttribute("href") || "").match(/^\\/movies\\/([^/]+)\\/$/);
      const title = clean(a.querySelector(".card-title, h3")?.textContent);
      if (!m || !title || out.some((x) => x.slug === m[1])) continue;
      const badges = Array.from(a.querySelectorAll(".badge")).map((e) => clean(e.textContent));
      out.push({
        slug: decodeURIComponent(m[1]),
        title,
        en: clean(a.querySelector("p")?.textContent),
        rating: badges.find((b) => /級$/.test(b)) || "",
        runtime: Number((badges.find((b) => /分鐘$/.test(b)) || "").replace(/\\D/g, "") || 0),
        cinemaCount: Number((badges.find((b) => /間影城$/.test(b)) || "").replace(/\\D/g, "") || 0),
        comingSoon: /即將上映/.test(h2)
      });
    }
  }
  return out;
}
function parseTwMovieDay(doc) {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  let title = "", en = "", rating = "", runtime = 0, image = "";
  const address = {};
  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try {
      const o = JSON.parse(el.textContent || "");
      if (o["@type"] !== "Movie") continue;
      title = clean(o.name);
      en = clean(o.alternateName);
      rating = clean(o.contentRating);
      runtime = Number((String(o.duration || "").match(/(\\d+)M/) || [])[1] || 0);
      image = clean(typeof o.image === "string" ? o.image : o.image && (o.image.url || o.image[0]));
      for (const ev of o.subjectOf || []) {
        const loc = ev && ev.location;
        if (loc && loc.name && loc.address && loc.address.streetAddress) address[clean(loc.name)] = clean(loc.address.streetAddress);
      }
    } catch (_) {
    }
  }
  if (!title) title = clean(doc.querySelector("h1")?.textContent);
  const heading = Array.from(doc.querySelectorAll("h2")).map((e) => clean(e.textContent)).find((s) => /\\d{4}-\\d{2}-\\d{2}\\s*場次/.test(s)) || "";
  const date = (heading.match(/\\d{4}-\\d{2}-\\d{2}/) || [""])[0];
  const dates = date ? [date] : [];
  for (const a of Array.from(doc.querySelectorAll('a[href^="/movies/"]'))) {
    const m = (a.getAttribute("href") || "").match(/\\/(\\d{4}-\\d{2}-\\d{2})\\/$/);
    if (m && dates.indexOf(m[1]) < 0) dates.push(m[1]);
  }
  dates.sort();
  const cinemas = [];
  for (const sec of Array.from(doc.querySelectorAll("section[data-region]"))) {
    const city = clean(sec.querySelector("h3 a")?.textContent);
    for (const a of Array.from(sec.querySelectorAll('a[href^="/cinemas/"]'))) {
      const id = ((a.getAttribute("href") || "").match(/^\\/cinemas\\/([^/]+)\\/(?:\\d{4}-\\d{2}-\\d{2}\\/)?$/) || [])[1];
      const name = clean(a.querySelector(".card-title")?.textContent);
      if (!id || !name) continue;
      const place = clean(a.querySelector(".card-title + span, .text-sm")?.textContent);
      const versions = [];
      let cur = null;
      for (const sp of Array.from(a.querySelectorAll(".badge"))) {
        const txt = clean(sp.textContent);
        if (sp.classList.contains("font-mono")) {
          if (!/^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(txt)) continue;
          if (!cur) versions.push(cur = { label: "一般場", times: [] });
          if (cur.times.indexOf(txt) < 0) cur.times.push(txt);
        } else if (sp.classList.contains("badge-secondary")) {
          const label = txt || "一般場";
          cur = versions.find((v) => v.label === label) || null;
          if (!cur) versions.push(cur = { label, times: [] });
        }
      }
      if (!versions.some((v) => v.times.length)) continue;
      cinemas.push({
        id,
        name,
        city: city || place.split(" ")[0] || "",
        district: place.split(" ")[1] || "",
        address: address[name] || "",
        versions: versions.filter((v) => v.times.length)
      });
    }
  }
  return { title, en, rating, runtime, image, date, dates, cinemas };
}
{
  parseAtDay,
  parseAtRegion,
  parseEslite,
  parseLux,
  parseLuxFilm,
  parseSpotHs,
  parseSpotMovie,
  parseTwDay,
  parseTwIndex,
  parseTwMovieDay,
  parseTwMovies
};
`;

// src/geo.ts
var GEO = {
  "ambassador-bade": [24.97321, 121.30267],
  "ambassador-danshui": [25.17701, 121.42521],
  "ambassador-kaohsiung-caoya": [22.58866, 120.32235],
  "ambassador-kaohsiung-yida": [22.73066, 120.40039],
  "ambassador-linkou": [25.07366, 121.36897],
  "ambassador-pingtung": [22.66721, 120.49086],
  "ambassador-taipei-center": [25.04373, 121.50175],
  "ambassador-taipei-changchun": [25.05468, 121.53893],
  "ambassador-xinzhuang": [25.06403, 121.459],
  "at-t02a03": [25.04333, 121.54389],
  "at-t02a05": [25.04815, 121.54579],
  "at-t02a06": [25.07076, 121.61086],
  "at-t02c01": [25.01211, 121.53653],
  "at-t02d06": [25.08487, 121.54948],
  "at-t02e03": [25.02324, 121.42467],
  "at-t02e04": [25.06254, 121.4989],
  "at-t02e08": [25.00956, 121.45605],
  "at-t02e22": [25.05648, 121.44681],
  "at-t02f05": [24.98926, 121.53847],
  "at-t03301": [25.05105, 121.28944],
  "at-t03302": [24.99589, 121.23243],
  "at-t03303": [24.96152, 121.22381],
  "at-t03311": [25.00024, 121.30695],
  "at-t03312": [24.93558, 121.23779],
  "at-t03510": [24.81065, 121.02176],
  "at-t03804": [23.9844, 121.6036],
  "at-t03902": [24.70265, 121.74952],
  "at-t03904": [24.67403, 121.76852],
  "at-t03905": [24.75446, 121.75013],
  "at-t04404": [24.14282, 120.6743],
  "at-t04405": [24.16202, 120.69251],
  "at-t04424": [24.14139, 120.67243],
  "at-t04426": [24.27059, 120.57693],
  "at-t04427": [24.14227, 120.6781],
  "at-t04428": [24.14985, 120.67094],
  "at-t04501": [23.70126, 120.52882],
  "at-t04703": [23.95455, 120.57201],
  "at-t04901": [23.90914, 120.6877],
  "at-t04902": [23.97049, 120.97504],
  "at-t05502": [23.47599, 120.4397],
  "at-t06602": [22.99104, 120.2016],
  "at-t06623": [22.99252, 120.20093],
  "at-t06625": [23.18365, 120.25001],
  "at-t07704": [22.63088, 120.32393],
  "at-t07712": [22.60426, 120.30344],
  "at-t07726": [22.6228, 120.28871],
  "century-kaohsiung": [22.60892, 120.30169],
  "century-nangang": [25.05218, 121.60721],
  "century-ximen": [25.04445, 121.50298],
  "century-yonghe": [25.00899, 121.50921],
  "cmpc-ptcinema": [22.67084, 120.4899],
  "cmpc-wonderful": [25.04184, 121.50731],
  "eslite": [25.04507, 121.55914],
  "in89-chiayi": [23.47615, 120.45181],
  "in89-fengyuan": [24.24321, 120.7111],
  "in89-penghu": [23.57123, 119.57621],
  "in89-pier2": [22.62789, 120.28644],
  "in89-talee": [22.62154, 120.29834],
  "in89-taoyuan": [25.02592, 121.29401],
  "lux": [25.04468, 121.50706],
  "miramar-dazhi": [25.08465, 121.5563],
  "showtimes-beigang": [23.56888, 120.29928],
  "showtimes-chiayi": [23.48297, 120.44888],
  "showtimes-dajudan": [25.03653, 121.55762],
  "showtimes-hualien": [23.98914, 121.60594],
  "showtimes-keelung": [25.12854, 121.75125],
  "showtimes-ks-dream": [22.6047, 120.3054],
  "showtimes-ks-gang": [22.77971, 120.30048],
  "showtimes-shulin": [24.99552, 121.42851],
  "showtimes-tainan": [22.94823, 120.21912],
  "showtimes-taitung": [22.76315, 121.13631],
  "showtimes-tc-front": [24.14005, 120.69114],
  "showtimes-tc-libo": [24.31975, 120.69633],
  "showtimes-tc-wenxin": [24.13078, 120.64631],
  "showtimes-tucheng": [24.97942, 121.44701],
  "showtimes-xinxin": [25.05058, 121.52502],
  "skcinemas-lionforest": [25.0385, 121.50634],
  "skcinemas-taichung": [24.16519, 120.64508],
  "skcinemas-tainan": [22.98894, 120.1975],
  "skcinemas-taoyuan": [25.01577, 121.21327],
  "skcinemas-tianmu": [25.11633, 121.5341],
  "spot-hs": [25.04518, 121.52921],
  "spot-taipei": [25.05634, 121.52278],
  "vscinemas-banciao": [25.01771, 121.47011],
  "vscinemas-hsinchu": [24.80342, 120.97109],
  "vscinemas-hsinchu-bigcity": [24.80624, 120.97651],
  "vscinemas-hualien": [23.96234, 121.60478],
  "vscinemas-jingzhan": [25.04837, 121.51967],
  "vscinemas-kaohsiung": [22.6114, 120.30549],
  "vscinemas-linkou": [25.07185, 121.36387],
  "vscinemas-muvie-taichung": [24.1643, 120.63776],
  "vscinemas-muvie-taipei": [25.02972, 121.56827],
  "vscinemas-nangang": [25.05998, 121.6156],
  "vscinemas-taichung": [24.16519, 120.64508],
  "vscinemas-taichung-ifg": [24.13837, 120.68985],
  "vscinemas-tainan": [22.99498, 120.20561],
  "vscinemas-tainan-focus": [22.99577, 120.21016],
  "vscinemas-tainan-nanfang": [22.99111, 120.23304],
  // 南紡購物中心（自動查詢誤抓到新竹，手動修正）
  "vscinemas-taoyuan": [25.02592, 121.29401],
  "vscinemas-taoyuan-tg": [25.02051, 121.30432],
  "vscinemas-toufen": [24.68901, 120.90402],
  "vscinemas-ximen": [25.04184, 121.50731],
  "vscinemas-xindian": [24.98476, 121.54243],
  "vscinemas-xinyi": [25.03594, 121.56173],
  "vscinemas-zhonghe": [25.00572, 121.47778]
};

// src/at-list.ts
var AT_BUILTIN = [
  ["t02a03", "a02", "微風影城", "台北市松山區復興南路一段39號(微風廣場8樓)"],
  ["t02a05", "a02", "總督影城", "台北市松山區長安東路二段219號5樓之1"],
  ["t02a06", "a02", "哈拉影城", "台北市內湖區康寧路三段72號"],
  ["t02c01", "a02", "百老匯影城公館店", "台北市中正區羅斯福路四段200號3~5樓"],
  ["t02d06", "a02", "美麗新大直皇家影城", "台北市中山區北安路780號B2"],
  ["t02e03", "a02", "新莊鴻金寶麻吉影城", "新北市新莊區民安路188巷5號"],
  ["t02e04", "a02", "三重天台戲院", "新北市三重區重新路二段78號4樓"],
  ["t02e08", "a02", "府中15", "新北市板橋區府中路15號B1"],
  ["t02e22", "a02", "國家電影及視聽文化中心", "新北市新莊區文藝路2號"],
  ["t02f05", "a02", "景美佳佳戲院", "台北市文山區羅斯福路六段403號"],
  ["t03301", "a03", "美麗新台茂影城", "桃園市蘆竹區南崁路一段112號7樓"],
  ["t03302", "a03", "星橋國際影城", "桃園市中壢區中園路二段501號5樓"],
  ["t03303", "a03", "威尼斯影城", "桃園市中壢區九和一街48號3樓之2"],
  ["t03311", "a03", "桃園光影文化館", "桃園市桃園區埔新路12號"],
  ["t03312", "a03", "中壢光影電影館", "桃園市中壢區龍清街116巷31號"],
  ["t03510", "a35", "百老匯影城竹北店", "新竹縣竹北市自強南路36號3~5樓"],
  ["t04404", "a04", "日日新影城", "台中市中區中華路一段58號"],
  ["t04405", "a04", "親親戲院", "台中市北區北屯路14號"],
  ["t04424", "a04", "全球影城", "台中市西區中華路一段1-1號"],
  ["t04426", "a04", "時代數位3D影城", "台中市清水區光復街65號3樓"],
  ["t04427", "a04", "中山73影視藝文空間", "台中市中區中山路73號"],
  ["t04428", "a04", "王牌映画影城", "台中市西區臺灣大道二段459號17-18-19樓"],
  ["t04703", "a47", "員林影城", "彰化縣員林市南昌路39號3樓"],
  ["t04501", "a45", "環球中華影城", "雲林縣斗六市雲林路二段19號"],
  ["t04901", "a49", "南投戲院", "南投縣南投市大同街87號"],
  ["t04902", "a49", "埔里山明影城", "南投縣埔里鎮中山路二段289號5樓"],
  ["t05502", "a05", "嘉年華戲院", "嘉義市西區中山路615號"],
  ["t06602", "a06", "南台電影城", "台南市中西區友愛街317號"],
  ["t06623", "a06", "全美戲院", "台南市中西區永福路二段187號"],
  ["t06625", "a06", "麻豆戲院", "台南市麻豆區興中路106號"],
  ["t07704", "a07", "高雄環球影城", "高雄市苓雅區大順三路108號"],
  ["t07712", "a07", "台鋁影城", "高雄市前鎮區忠勤路8號"],
  ["t07726", "a07", "高雄市電影館", "高雄市鹽埕區河西路10號"],
  ["t03902", "a39", "宜蘭日新戲院", "宜蘭縣羅東鎮中山西街17-1號"],
  ["t03904", "a39", "日新戲院-統一廳", "宜蘭縣羅東鎮公園路100號3樓"],
  ["t03905", "a39", "新月豪華影城", "宜蘭縣宜蘭市民權路二段38巷6號"],
  ["t03804", "a38", "花蓮鐵道電影院", "花蓮縣花蓮市中山路71號"]
];
var AT_COVERED = new Set("t02a01 t02a08 t02a09 t02a11 t02a12 t02a13 t02b01 t02b03 t02b05 t02b06 t02b07 t02b08 t02b14 t02b16 t02d02 t02d03 t02d04 t02d05 t02d20 t02e07 t02e10 t02e11 t02e12 t02e13 t02e15 t02e17 t02e18 t02e20 t02e21 t02g04 t03304 t03307 t03308 t03315 t03317 t03505 t03508 t03701 t03801 t03803 t04401 t04402 t04407 t04409 t04410 t04411 t04412 t04413 t04504 t05504 t05505 t06607 t06609 t06610 t06611 t06628 t06902 t07702 t07703 t07705 t07707 t07708 t07728 t07729 t07730 t08701 t08703 t08902".split(" "));
var AT_SKIP = /* @__PURE__ */ new Set(["t07727", "t07731"]);
var AT_REGIONS = {
  a01: "基隆市",
  a02: "台北市",
  a03: "桃園市",
  a35: "新竹市",
  a37: "苗栗縣",
  a04: "台中市",
  a47: "彰化縣",
  a45: "雲林縣",
  a49: "南投縣",
  a05: "嘉義市",
  a06: "台南市",
  a07: "高雄市",
  a39: "宜蘭縣",
  a38: "花蓮縣",
  a89: "台東縣",
  a87: "屏東縣",
  a69: "澎湖縣",
  a68: "金門縣"
};

// src/core.ts
var MAPS_LABEL = { apple: "Apple 地圖", google: "Google 地圖" };
function mapsUrl(name, address, app = "apple") {
  if (app === "google")
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, address].filter(Boolean).join(" "))}`;
  return `https://maps.apple.com/?q=${encodeURIComponent(name)}${address ? "&address=" + encodeURIComponent(address) : ""}`;
}
var TW = "https://twshowtimes.com";
var UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
var EXTRA = [
  {
    id: "eslite",
    name: "誠品電影院",
    city: "台北市",
    district: "信義區",
    source: "eslite",
    url: "https://meet.eslite.com/tw/tc/gallery/movieschedule/201803020001",
    address: "台北市信義區菸廠路80號B1",
    aliases: "誠品 松菸"
  },
  {
    id: "spot-hs",
    name: "光點華山電影館",
    city: "台北市",
    district: "中正區",
    source: "spot-hs",
    url: "https://www.spot-hs.org.tw/movie/schedule.html",
    address: "台北市中正區八德路一段1號",
    aliases: "光點 華山"
  },
  {
    id: "spot-taipei",
    name: "光點台北（台北之家）",
    city: "台北市",
    district: "中山區",
    source: "spot-taipei",
    url: "https://www.spot.org.tw/schedule/schedule_one.html",
    address: "台北市中山區中山北路二段18號",
    aliases: "光點 台北之家 spot"
  },
  {
    id: "lux",
    name: "樂聲影城",
    city: "台北市",
    district: "萬華區",
    source: "lux",
    url: "https://www.luxcinema.com.tw/web/2020.php?type=ShowTimes",
    address: "台北市萬華區武昌街二段",
    aliases: "樂聲 lux 西門 西門町 電影街"
  }
];
var CITY_ORDER = [
  "基隆市",
  "台北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "台中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "台南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣"
];
var AD_STEPS = [0, 10, 15, 20];
var WEEK = ["日", "一", "二", "三", "四", "五", "六"];
var todayTPE = () => new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10);
var nowHM = () => new Date(Date.now() + 8 * 36e5).toISOString().slice(11, 16);
var addDays = (d, n) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
var weekday = (d) => WEEK[(/* @__PURE__ */ new Date(d + "T00:00:00Z")).getUTCDay()];
var isLate = (t) => t < "05:00";
function dateLabel(d) {
  const [, m, dd] = d.split("-").map(Number);
  const t = todayTPE();
  const tag = d === t ? " 今天" : d === addDays(t, 1) ? " 明天" : d === addDays(t, 2) ? " 後天" : "";
  return `${m}/${dd}（${weekday(d)}）${tag}`;
}
function tpeDate(date, time) {
  return /* @__PURE__ */ new Date(`${date}T${time}:00+08:00`);
}
function fmt(dt) {
  const s = new Date(dt.getTime() + 8 * 36e5).toISOString();
  const d = s.slice(0, 10);
  return `${d.replace(/-/g, "/")}（${weekday(d)}）${s.slice(11, 16)}`;
}
async function loadSettings() {
  const def = { favorites: ["vscinemas-xinyi", "eslite", "spot-hs", "spot-taipei"], ads: 10 };
  try {
    const json = await platform().loadSettingsJSON();
    return json ? { ...def, ...JSON.parse(json) } : def;
  } catch (_) {
    return def;
  }
}
function saveSettings(s) {
  platform().saveSettingsJSON(JSON.stringify(s, null, 1));
}
var cacheGet = (name) => platform().cacheGet(name);
var cacheSet = (name, v) => platform().cacheSet(name, v);
async function get(url) {
  const r = await platform().fetchText(url, { "User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9" });
  return { ok: r.status >= 200 && r.status < 300, body: r.body };
}
async function getText(url) {
  const r = await get(url);
  if (!r.ok) throw new Error("網站暫時讀不到：" + url);
  return r.body;
}
async function parseMany(name, htmls) {
  const body = `${PARSERS_JS}
var hs=${JSON.stringify(htmls)};try{return JSON.stringify({ok:true,v:hs.map(function(x){return ${name}(new DOMParser().parseFromString(x,'text/html'));})});}catch(e){return JSON.stringify({ok:false,e:String(e&&e.message||e)});}`;
  const r = JSON.parse(await platform().runInWebView(body));
  if (!r.ok) throw new Error(r.e);
  return r.v;
}
var parse = async (name, html) => (await parseMany(name, [html]))[0];
async function loadCinemas() {
  let list = [];
  try {
    list = await parse("parseTwIndex", await getText(TW + "/cinemas/"));
    if (list.length) cacheSet("cinemas.json", JSON.stringify(list));
  } catch (e) {
    const c = cacheGet("cinemas.json");
    if (!c) throw e;
    list = JSON.parse(c);
  }
  const tw = list.map((c) => ({ ...c, source: "tw", url: `${TW}/cinemas/${c.id}/` }));
  return tw.concat(EXTRA, await loadAtTheaters());
}
var AT = "https://www.atmovies.com.tw";
function splitAddress(addr, region) {
  const a = addr.replace(/臺/g, "台");
  const m = a.match(/^(\S{2}[市縣])(\S{1,3}?[區鎮鄉市])/);
  return m ? { city: m[1], district: m[2] } : { city: AT_REGIONS[region] || "其他", district: "" };
}
function atCinema(id, region, name, address) {
  const { city, district } = splitAddress(address, region);
  return { id: "at-" + id, name, city, district, source: "at", url: `${AT}/showtime/${id}/${region}/`, address, aliases: "開眼" };
}
async function loadAtTheaters() {
  const builtin = AT_BUILTIN.map(([id, region, name, address]) => atCinema(id, region, name, address));
  const known = /* @__PURE__ */ new Set([...AT_COVERED, ...AT_SKIP, ...AT_BUILTIN.map((r) => r[0])]);
  let found = [];
  const cached = cacheGet("at-theaters.json");
  const parsed = cached ? JSON.parse(cached) : null;
  if (parsed && Date.now() - parsed.at < 7 * 864e5) {
    found = parsed.list;
  } else {
    try {
      const regions = Object.keys(AT_REGIONS);
      const pages = await Promise.all(regions.map((r) => getText(`${AT}/showtime/${r}/`).catch(() => "<html><body></body></html>")));
      const lists = await parseMany("parseAtRegion", pages);
      found = [].concat(...lists.map((l, i) => l.filter((t) => t.region === regions[i])));
      if (found.length) cacheSet("at-theaters.json", JSON.stringify({ at: Date.now(), list: found }));
    } catch (_) {
      found = parsed ? parsed.list : [];
    }
  }
  const extra = found.filter((t) => !known.has(t.id)).map((t) => atCinema(t.id, t.region, t.name, ""));
  return builtin.concat(extra);
}
var atDayCache = {};
async function atDay(c, date) {
  const url = date ? `${c.url}${date.replace(/-/g, "")}/` : c.url;
  if (!atDayCache[url]) atDayCache[url] = await parse("parseAtDay", await getText(url));
  return atDayCache[url];
}
var twDayCache = {};
async function twDay(c, date) {
  const key = c.id + "|" + (date || "");
  if (!twDayCache[key]) {
    const url = date ? `${TW}/cinemas/${c.id}/${date}/` : c.url;
    twDayCache[key] = await parse("parseTwDay", await getText(url));
  }
  return twDayCache[key];
}
var multiCache = {};
async function multiDay(c) {
  if (multiCache[c.id]) return multiCache[c.id];
  let r;
  if (c.source === "eslite") r = await parse("parseEslite", await getText(c.url));
  else if (c.source === "spot-hs") r = await parse("parseSpotHs", await getText(c.url));
  else if (c.source === "lux") r = await luxCinema();
  else r = await spotTaipei();
  multiCache[c.id] = r;
  return r;
}
var LUX_HALL = { XL: "XL 巨幕廳（800 席）", L: "L 大廳（218 席）" };
async function luxCinema() {
  const base = "https://www.luxcinema.com.tw/web/";
  const page = await getText(base + "2020.php?type=ShowTimes");
  if (/僅限台灣地區/.test(page)) throw new Error("樂聲官網只接受台灣的連線，請關閉 VPN 後再試");
  const films = await parse("parseLux", page);
  const details = await parseMany(
    "parseLuxFilm",
    await Promise.all(films.map((f) => getText(`${base}2020-movie_item.php?film_id=${f.id}`).catch(() => "<html><body></body></html>")))
  );
  const today = todayTPE();
  const y0 = Number(today.slice(0, 4));
  const schedules = {};
  films.forEach((f, idx) => {
    for (const e of f.entries) {
      const mmdd = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
      const day = [y0 - 1, y0, y0 + 1].map((y) => `${y}-${mmdd}`).sort((a, b) => Math.abs(Date.parse(a) - Date.parse(today)) - Math.abs(Date.parse(b) - Date.parse(today)))[0];
      const list = schedules[day] || (schedules[day] = []);
      let m = list.find((x) => x.title === f.title);
      if (!m) list.push(m = { title: f.title, runtime: details[idx]?.runtime || 0, rating: details[idx]?.rating || "", versions: [] });
      for (const t of e.times) {
        const label = LUX_HALL[t.hall] || (t.hall ? `${t.hall} 廳` : "其他影廳");
        let v = m.versions.find((x) => x.label === label);
        if (!v) m.versions.push(v = { label, times: [] });
        if (v.times.indexOf(t.t) < 0) v.times.push(t.t);
      }
    }
  });
  for (const list of Object.values(schedules))
    for (const m of list) {
      for (const v of m.versions) v.times.sort(byShowtime);
      const rank = (l) => Object.values(LUX_HALL).indexOf(l) + 1 || 99;
      m.versions.sort((a, b) => rank(a.label) - rank(b.label));
    }
  return { schedules, notice: "樂聲官網沒有標影廳的場次會列在「其他影廳」。" };
}
function hallOf(label) {
  const m = String(label || "").match(/^(第 ?\d+ ?廳|[A-Za-z0-9]+ ?(?:巨幕廳|大廳|廳))/);
  return m ? m[1] : "";
}
var byShowtime = (a, b) => ((isLate(a) ? "2" : "1") + a).localeCompare((isLate(b) ? "2" : "1") + b);
async function spotTaipei() {
  const today = todayTPE();
  const urls = [];
  for (let k = -3; k <= 1; k++) {
    const d = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + k, 1));
    const ym = d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, "0");
    for (let m = 1; m <= 15; m++) urls.push(`https://www.spot.org.tw/movies/${ym}/m${m}/movies${ym}_m${m}.html`);
  }
  const pages = await Promise.all(urls.map((u) => get(u).catch(() => ({ ok: false, body: "" }))));
  const htmls = pages.filter((p) => p.ok && /movie_title/.test(p.body)).map((p) => p.body);
  const films = (await parseMany("parseSpotMovie", htmls)).filter(Boolean);
  const schedules = {};
  const y0 = Number(today.slice(0, 4));
  for (const f of films) {
    for (const e of f.entries) {
      const mmdd = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
      const day = [y0 - 1, y0, y0 + 1].map((y) => `${y}-${mmdd}`).sort((a, b) => Math.abs(Date.parse(a) - Date.parse(today)) - Math.abs(Date.parse(b) - Date.parse(today)))[0];
      const list = schedules[day] || (schedules[day] = []);
      let m = list.find((x) => x.title === f.title);
      if (!m) list.push(m = { title: f.title, runtime: f.runtime, versions: [{ label: "官方場次", times: [] }] });
      for (const t of e.times) if (m.versions[0].times.indexOf(t) < 0) m.versions[0].times.push(t);
      m.versions[0].times.sort();
    }
  }
  return { schedules, notice: "" };
}
async function datesOf(c) {
  const today = todayTPE();
  if (c.source === "at") {
    const days = await Promise.all([atDay(c), atDay(c, addDays(today, 1)).catch(() => null)]);
    const dates2 = days.filter((d) => !!d && !!d.date && d.movies.length > 0 && d.date >= today).map((d) => d.date);
    const addr = days[0]?.address || c.address || "";
    return {
      dates: Array.from(new Set(dates2)).sort(),
      address: addr,
      site: days[0]?.site || "",
      notice: "這間的場次來自開眼電影網，通常只公布今天（晚上才會有明天）。其他日期請點下方「影城官網」查詢。"
    };
  }
  if (c.source === "tw") {
    const d = await twDay(c);
    const future = d.dates.filter((x) => x >= today);
    return { dates: future.length ? future : d.dates, address: d.address, notice: "", site: d.booking || "" };
  }
  const m = await multiDay(c);
  const dates = Object.keys(m.schedules).filter((x) => x >= today).sort();
  return { dates, address: c.address || "", notice: m.notice, site: c.url };
}
async function moviesOf(c, date) {
  if (c.source === "at") {
    let d = await atDay(c);
    if (d.date !== date) d = await atDay(c, date);
    return { movies: await fillRuntimes(d.movies), booking: d.site, sourceUrl: `${c.url}${date.replace(/-/g, "")}/`, address: d.address || c.address || "" };
  }
  if (c.source === "tw") {
    let d = await twDay(c);
    if (d.date !== date) d = await twDay(c, date);
    if (d.date && d.date !== date) throw new Error("網站回傳的日期和選擇的不同，請稍後再試");
    return { movies: await fillRuntimes(d.movies), booking: d.booking, sourceUrl: `${TW}/cinemas/${c.id}/${date}/`, address: d.address };
  }
  const m = await multiDay(c);
  return { movies: await fillRuntimes(m.schedules[date] || []), booking: c.url, sourceUrl: c.url, address: c.address || "" };
}
var normTitle = (t) => String(t || "").toLowerCase().replace(/[\s:：·・\-–—!！?？,，.。'"’「」『』《》()（）\[\]【】]/g, "");
var REISSUE_WORDS = "全新|加碼|數位|[248]K|修復|重映|重製|再映|經典|紀念|\\d*週年";
var isReissue = (t) => new RegExp(REISSUE_WORDS, "i").test(String(t || ""));
var DECOR_LEAD = /^\s*(?:[（(\[【][^）)\]】]{1,12}[）)\]】]|[A-Z]-|(?:法文|中文|英文|日文|韓文|台語|國語|粵語)版[-－:：]?)\s*/;
var DECOR_TAIL = /\s*(?:[（(\[【]\s*(?:真人版|\d{4}|[^）)\]】]{0,8}版)\s*[）)\]】]|[-－:：]?\s*(?:海報)?特別場|特別版|口白場|中文配音版?|(?:日|英|韓|法|國|台)語版)\s*$/;
function baseTitle(t) {
  let s = String(t || "").replace(/[《》]/g, "").trim();
  for (let i = 0; i < 4; i++) {
    const before = s;
    s = s.replace(DECOR_LEAD, "").replace(DECOR_TAIL, "");
    s = s.replace(new RegExp(`\\s*[（(\\[【][^）)\\]】]*(?:${REISSUE_WORDS})[^）)\\]】]*[）)\\]】]\\s*$`, "i"), "");
    s = s.replace(new RegExp(`[\\s:：\\-–—]*(?:${REISSUE_WORDS})+(?:版本?)?\\s*$`, "i"), "");
    if (s === before) break;
  }
  return s.trim() || String(t || "").trim();
}
var TMDB = "https://api.themoviedb.org/3";
var isV3Key = (t) => /^[0-9a-f]{32}$/i.test(t);
var TMDB_LINKS = {
  signup: "https://www.themoviedb.org/signup",
  login: "https://www.themoviedb.org/login",
  api: "https://www.themoviedb.org/settings/api",
  request: "https://www.themoviedb.org/settings/api/request"
};
function extractTmdbKey(text) {
  const s = String(text || "");
  return (s.match(/eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/) || s.match(/\b[0-9a-f]{32}\b/i) || [""])[0] || s.trim();
}
async function tmdb(path, token) {
  const url = TMDB + path + (isV3Key(token) ? (path.includes("?") ? "&" : "?") + "api_key=" + token : "");
  const headers = { accept: "application/json" };
  if (!isV3Key(token)) headers.Authorization = "Bearer " + token;
  const r = await platform().fetchText(url, headers);
  if (r.status === 401) throw new Error("TMDB 金鑰無效，請到設定重新貼上");
  if (r.status < 200 || r.status >= 300) throw new Error("TMDB 暫時讀不到");
  return JSON.parse(r.body);
}
async function tmdbFind(title, token) {
  const q = baseTitle(title);
  const key = normTitle(q);
  if (!key || !token) return null;
  const read = () => {
    try {
      return JSON.parse(cacheGet("runtimes.json") || "{}") || {};
    } catch (_) {
      return {};
    }
  };
  const hit = read()[key];
  if (hit && "id" in hit && Date.now() - hit.at < (hit.id ? 30 : 1) * 864e5) return hit.id ? hit : null;
  const found = await tmdb(`/search/movie?language=zh-TW&query=${encodeURIComponent(q)}`, token);
  const results = found?.results || [];
  const pick = results.find((x) => normTitle(x.title) === key || normTitle(x.original_title) === key) || results[0];
  const v = { id: 0, r: 0, p: "", at: Date.now() };
  if (pick?.id) {
    const d = await tmdb(`/movie/${pick.id}?language=zh-TW`, token);
    v.id = pick.id;
    v.r = Number(d?.runtime) || 0;
    v.p = d?.poster_path || pick.poster_path || "";
  }
  const cache = read();
  cache[key] = v;
  cacheSet("runtimes.json", JSON.stringify(cache));
  return v.id ? v : null;
}
async function tmdbRuntime(title, token) {
  return (await tmdbFind(title, token))?.r || 0;
}
var extrasCache = {};
var delay = (ms) => new Promise((r) => {
  const g = globalThis;
  if (typeof g.setTimeout === "function") g.setTimeout(r, ms);
  else g.Timer.schedule(ms, false, r);
});
var foreground = 0;
function foregroundTask(p) {
  foreground++;
  const done = () => {
    foreground--;
  };
  p.then(done, done);
  return p;
}
async function waitIdle() {
  while (foreground > 0) await delay(150);
}
var readExtras = () => {
  try {
    return JSON.parse(cacheGet("extras.json") || "{}") || {};
  } catch (_) {
    return {};
  }
};
async function movieExtras(title, slug) {
  const hasToken = !!((await loadSettings()).tmdbToken || "").trim();
  const k = (hasToken ? "t|" : "n|") + (slug || "") + "|" + title;
  return extrasCache[k] ||= (async () => {
    const ck = (hasToken ? "t|" : "n|") + normTitle(title);
    const read = readExtras;
    const hit = read()[ck];
    const stale = hit && hit.v !== EXTRAS_V && (!hit.trailerName || !hit.poster);
    const ttl = stale ? 0 : !hit?.trailerName ? 36e5 : hit?.poster ? 7 * 864e5 : 864e5;
    if (hit && Date.now() - hit.at < ttl) return { poster: hit.poster, trailer: hit.trailer, trailerName: hit.trailerName };
    const out = await findExtras(title, slug);
    const all = read();
    for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 864e5) delete all[key];
    const { err: _e, ...keep } = out;
    all[ck] = { ...keep, at: Date.now(), v: EXTRAS_V };
    cacheSet("extras.json", JSON.stringify(all));
    return out;
  })();
}
var EXTRAS_V = 3;
function normImageUrl(u) {
  let s = String(u || "").trim().replace(/&amp;/g, "&").replace(/\\\//g, "/");
  if (s.startsWith("//")) s = "https:" + s;
  s = s.replace(/^http:\/\//i, "https://");
  const pw = s.match(/^https?:\/\/(?:www\.)?photowant\.com\/photo\d*\/(f\w+)\//);
  if (pw) s = `${AT}/photo101/${pw[1]}/pl_${pw[1]}.jpg`;
  return s;
}
var posterMem = {};
function twPoster(slug) {
  return posterMem[slug] ||= (async () => {
    const path = encodeURIComponent(slug).replace(/%3A/gi, ":");
    const url = `${TW}/movies/${path}/`;
    if (movieDayCache[url]?.image) return movieDayCache[url].image;
    const r = await get(url);
    if (!r.ok) throw new Error("no page");
    const img = normImageUrl((r.body.match(/property="og:image"\s+content="([^"]+)"/) || r.body.match(/"image":"([^"]+)"/) || [])[1] || "");
    return /og-default/.test(img) ? "" : img;
  })();
}
var atIndexMem = null;
function atMovieIndex() {
  return atIndexMem ||= (async () => {
    try {
      const c = JSON.parse(cacheGet("at-movies.json") || "null");
      if (c && Date.now() - c.at < 864e5 && c.idx) return c.idx;
    } catch (_) {
    }
    const idx = {};
    await Promise.all(
      ["now", "new", "next", "next2", "now2"].map(async (p) => {
        const html = await getText(`${AT}/movie/${p}/`).catch(() => "");
        for (const [, id, t] of html.matchAll(/<a[^>]*href="\/movie\/(f[a-z0-9]+)\/"[^>]*>\s*([^<]{1,60}?)\s*<\/a>/g)) {
          const n = normTitle(t), b = normTitle(baseTitle(t));
          if (n) idx[n] ||= id;
          if (b) idx[b] ||= id;
        }
      })
    );
    if (Object.keys(idx).length) cacheSet("at-movies.json", JSON.stringify({ at: Date.now(), idx }));
    return idx;
  })();
}
var atPageMem = {};
var atPage = (id) => atPageMem[id] ||= getText(`${AT}/movie/${id}/`);
async function atMovieId(title, posterUrl) {
  const fromPoster = (posterUrl.match(/\/photo\d*\/(f\w+)\//) || [])[1];
  if (fromPoster) return fromPoster;
  const idx = await atMovieIndex();
  return idx[normTitle(title)] || idx[normTitle(baseTitle(title))] || "";
}
async function atPoster(title) {
  const id = await atMovieId(title, "");
  if (!id) return "";
  const html = await atPage(id);
  const og = (html.match(/property="og:image"\s+content="([^"]+)"/) || [])[1] || "";
  return og ? normImageUrl(og) : "";
}
async function atYearHint(title, slug, en) {
  if (isReissue(title)) return 0;
  try {
    const poster = await Promise.race([moviePoster(title, slug, en), delay(1500).then(() => "")]);
    const id = await atMovieId(title, poster || "");
    if (!id) return 0;
    const html = await Promise.race([atPage(id), delay(3500).then(() => "")]);
    const m = html.match(/上映日期[:：]?(?:\s|<[^>]*>|&nbsp;)*(\d{4})/);
    return m ? Number(m[1]) : 0;
  } catch (_) {
    return 0;
  }
}
var runtimeMem = {};
function movieRuntime(title, slug, en) {
  const k = normTitle(title);
  return runtimeMem[k] ||= (async () => {
    const read = () => {
      try {
        return JSON.parse(cacheGet("runtimes.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()["at|" + k];
    if (hit && Date.now() - hit.at < (hit.r ? 30 : 1) * 864e5) return hit.r ? { runtime: hit.r, from: hit.from } : null;
    let out = null;
    const token = ((await loadSettings()).tmdbToken || "").trim();
    if (token) {
      for (const q of [title, en].filter(Boolean)) {
        const r = await tmdbRuntime(q, token).catch(() => 0);
        if (r) {
          out = { runtime: r, from: "TMDB" };
          break;
        }
      }
    }
    if (!out) {
      try {
        const id = await atMovieId(title, await moviePoster(title, slug, en).catch(() => ""));
        const m = id ? (await atPage(id)).match(/片長[:：]\s*(\d{2,3})\s*分/) : null;
        if (m) out = { runtime: Number(m[1]), from: "開眼電影網" };
      } catch (_) {
      }
    }
    const all = read();
    all["at|" + k] = { r: out?.runtime || 0, from: out?.from || "", at: Date.now() };
    cacheSet("runtimes.json", JSON.stringify(all));
    return out;
  })();
}
async function findPoster(title, slug, en) {
  let p = await twPoster(slug || title).catch(() => "");
  if (p) return p;
  const list = await loadMovies();
  const key = normTitle(title), bkey = normTitle(baseTitle(title));
  const cands = list.filter((m) => m.slug !== (slug || title) && (normTitle(m.title) === key || normTitle(baseTitle(m.title)) === bkey));
  for (const c of cands) {
    p = await twPoster(c.slug).catch(() => "");
    if (p) return p;
  }
  p = await atPoster(title).catch(() => "");
  if (p) return p;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return "";
  const hit = await tmdbFind(title, token).catch(() => null) || (en ? await tmdbFind(en, token).catch(() => null) : null);
  return hit?.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "";
}
var posterOnly = {};
function moviePoster(title, slug, en) {
  const k = (slug || "") + "|" + title;
  return posterOnly[k] ||= (async () => {
    const nk = normTitle(title);
    const all = readExtras();
    const hit = all["t|" + nk] || all["n|" + nk];
    if (hit?.poster) return hit.poster;
    const own = all["p|" + nk];
    if (own && Date.now() - own.at < (own.poster ? 7 : own.v === EXTRAS_V ? 1 : 0) * 864e5) return own.poster;
    const poster = normImageUrl(await findPoster(title, slug, en).catch(() => ""));
    const latest = readExtras();
    latest["p|" + nk] = { poster, trailer: "", trailerName: "", at: Date.now(), v: EXTRAS_V };
    cacheSet("extras.json", JSON.stringify(latest));
    return poster;
  })();
}
function posterSrc(url) {
  url = normImageUrl(url);
  if (!url) return "";
  try {
    return platform().cachedImage(url) || url;
  } catch (_) {
    return url;
  }
}
function cachePoster(url) {
  url = normImageUrl(url);
  if (!url) return;
  try {
    platform().cacheImage(url).catch(() => null);
  } catch (_) {
  }
}
var prefetched = /* @__PURE__ */ new Set();
function prefetchPosters(items, max = 200, trailers = 10, ratings = 12) {
  const queue = [];
  items.slice(0, max).forEach((m, i) => {
    const k = (m.slug || "") + "|" + m.title;
    if (prefetched.has(k)) return;
    prefetched.add(k);
    queue.push({ title: m.title, slug: m.slug, en: m.en, trailer: i < trailers, ratings: i < ratings });
  });
  const run = async () => {
    for (let m = queue.shift(); m; m = queue.shift()) {
      try {
        await waitIdle();
        const u = await moviePoster(m.title, m.slug, m.en);
        if (u) await platform().cacheImage(u);
        if (m.trailer) {
          await waitIdle();
          await movieExtras(m.title, m.slug);
        }
        if (m.ratings) {
          await waitIdle();
          await movieRatings(m.title, m.en, m.slug);
        }
      } catch (_) {
      }
    }
  };
  for (let i = 0; i < 2; i++) run();
}
async function findExtras(title, slug) {
  const base = baseTitle(title);
  const out = {
    poster: "",
    trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(base + " 預告")}`,
    trailerName: ""
  };
  const posterJob = findPoster(title, slug).catch(() => "");
  const token = ((await loadSettings()).tmdbToken || "").trim();
  const tmdbJob = (async () => {
    if (!token) return null;
    const hit = await tmdbFind(title, token);
    if (!hit) return { err: "TMDB 找不到這部片" };
    const pickVideo = (list) => list.filter((v2) => v2.site === "YouTube" && v2.key).sort((a, b) => rankVideo(a) - rankVideo(b))[0];
    const rankVideo = (v2) => (v2.type === "Trailer" ? 0 : v2.type === "Teaser" ? 1 : 2) + (v2.official ? 0 : 0.5);
    const [zh, all] = await Promise.all([
      tmdb(`/movie/${hit.id}/videos?language=zh-TW`, token).catch(() => null),
      tmdb(`/movie/${hit.id}/videos`, token).catch(() => null)
    ]);
    const vz = pickVideo(zh?.results || []);
    const v = vz ? { ...vz, zh: true } : pickVideo(all?.results || []);
    return { poster: hit.p ? "https://image.tmdb.org/t/p/w500" + hit.p : "", v, err: v ? "" : "TMDB 沒有這部片的預告" };
  })().catch((e) => ({ err: "TMDB " + errText(e) }));
  const atErr = [];
  const atJob = posterJob.then(async (poster2) => {
    const id = (poster2.match(/\/photo\d*\/(f\w+)\//) || [])[1];
    if (!id) {
      atErr.push("開眼電影網沒有這部片的預告");
      return null;
    }
    const html = await atPage(id);
    const key = (html.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/) || [])[1];
    if (!key) atErr.push("開眼電影網沒有這部片的預告");
    return key ? { key, name: "開眼電影網預告" } : null;
  }).catch((e) => {
    atErr.push("開眼 " + errText(e));
    return null;
  });
  const [poster, t, at] = await Promise.all([posterJob, tmdbJob, atJob]);
  out.poster = normImageUrl(poster || (t && "poster" in t ? t.poster : "") || "");
  const tv = t && "v" in t ? t.v : null;
  let pick = tv && tv.zh ? tv : at || tv;
  if (!pick) {
    const yt = await ytFirst(base + " 預告");
    if ("key" in yt) pick = yt;
    else atErr.push("YouTube " + yt.err);
  }
  if (pick) {
    out.trailer = `https://www.youtube.com/watch?v=${pick.key}`;
    out.trailerName = String(pick.name || "預告片");
  }
  if (!pick) out.err = [t?.err, ...atErr].filter(Boolean).join("；") || "找不到預告";
  return out;
}
async function ytFirst(query) {
  let r;
  try {
    r = await platform().fetchText(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=zh-TW&gl=TW`, {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Accept-Language": "zh-TW,zh;q=0.9"
    });
  } catch (e) {
    return { err: "搜尋頁讀不到（" + errText(e) + "）" };
  }
  if (r.status < 200 || r.status >= 300) return { err: "搜尋頁回應 " + r.status };
  const list = [];
  for (const m of r.body.matchAll(/"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})"([\s\S]{0,4000}?)"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g)) {
    let name = m[3];
    try {
      name = JSON.parse('"' + name + '"');
    } catch (_) {
    }
    list.push({ key: m[1], name });
    if (list.length >= 5) break;
  }
  if (!list.length) return { err: /consent\.youtube|consent\.google/.test(r.body) ? "搜尋頁要求同意 Cookie" : "搜尋頁裡找不到影片（" + Math.round(r.body.length / 1024) + "KB）" };
  return list.find((v) => /預告|trailer|teaser/i.test(v.name)) || list[0];
}
async function fillRuntimes(movies) {
  const todo = movies.filter((m) => !m.runtime);
  if (!todo.length) return movies;
  const token = ((await loadSettings()).tmdbToken || "").trim();
  if (!token) return movies;
  const queue = todo.slice();
  await Promise.all(
    Array.from({ length: Math.min(4, queue.length) }, async () => {
      for (let m = queue.shift(); m; m = queue.shift()) {
        try {
          const r = await tmdbRuntime(m.title, token) || (m.en ? await tmdbRuntime(String(m.en), token) : 0);
          if (r) {
            m.runtime = r;
            m.runtimeFrom = "TMDB";
          }
        } catch (_) {
        }
      }
    })
  );
  return movies;
}
async function tmdbTest(token) {
  const d = await tmdb(`/movie/244786?language=zh-TW`, token.trim());
  return `${d.title}：${d.runtime} 分鐘`;
}
var moviesCache = null;
async function loadMovies() {
  if (!moviesCache) moviesCache = await fillRuntimes(await parse("parseTwMovies", await getText(TW + "/movies/")));
  return moviesCache;
}
var movieDayCache = {};
async function movieDay(slug, date) {
  const path = encodeURIComponent(slug).replace(/%3A/gi, ":");
  const url = `${TW}/movies/${path}/${date ? date + "/" : ""}`;
  if (!movieDayCache[url]) {
    const d = await parse("parseTwMovieDay", await getText(url));
    await fillRuntimes([d]);
    movieDayCache[url] = d;
  }
  return movieDayCache[url];
}
var FORMATS = ["IMAX", "4DX", "ScreenX", "MX4D", "杜比"];
var FORMAT_RE = {
  IMAX: /IMAX/i,
  "4DX": /4DX/i,
  ScreenX: /SCREEN\s*X/i,
  MX4D: /MX4D/i,
  杜比: /DOLBY|杜比/i
};
function formatsOf(label) {
  return FORMATS.filter((f) => FORMAT_RE[f].test(label));
}
function filterVersions(versions, format) {
  return format ? versions.filter((v) => formatsOf(v.label).indexOf(format) >= 0) : versions;
}
function distanceKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function cinemaPos(c) {
  const g = GEO[c.id];
  return g ? { lat: g[0], lng: g[1] } : null;
}
function nearest(cinemas, me, limit = 20) {
  return cinemas.map((c) => {
    const p = cinemaPos(c);
    return { cinema: c, km: p ? distanceKm(me, p) : null };
  }).sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9)).slice(0, limit);
}
function kmLabel(km) {
  if (km === null || km === void 0) return "";
  return km < 1 ? `${Math.round(km * 1e3)} 公尺` : `${km < 10 ? km.toFixed(1) : Math.round(km)} 公里`;
}
var WINDOWS = [
  { id: "soon", label: "接下來 3 小時", from: -1, to: -1, todayOnly: true },
  { id: "morning", label: "中午前", from: 0, to: 12 * 60 },
  { id: "afternoon", label: "下午 12–17 點", from: 12 * 60, to: 17 * 60 },
  { id: "evening", label: "晚上 17–21 點", from: 17 * 60, to: 21 * 60 },
  { id: "night", label: "深夜 21 點後", from: 21 * 60, to: 29 * 60 },
  { id: "all", label: "整天", from: 0, to: 29 * 60 }
];
function showMinute(t) {
  const [h2, m] = t.split(":").map(Number);
  return (isLate(t) ? h2 + 24 : h2) * 60 + m;
}
async function findShowtimes(scope, date, win, format = "", onProgress) {
  let from = win.from, to = win.to;
  if (win.id === "soon") {
    const now = showMinute(nowHM());
    from = now;
    to = now + 180;
  }
  const hits = [];
  const failed = [];
  let done = 0;
  const queue = scope.slice();
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        const r = await moviesOf(item.cinema, date);
        for (const m of r.movies)
          for (const v of filterVersions(m.versions, format))
            for (const t of v.times) {
              const min = showMinute(t);
              if (min >= from && min < to)
                hits.push({ cinema: item.cinema, movie: m, version: v, time: t, date, km: item.km, ctx: { booking: r.booking, sourceUrl: r.sourceUrl, address: r.address } });
            }
      } catch (_) {
        failed.push(item.cinema.name);
      }
      onProgress && onProgress(++done, scope.length);
    }
  }
  await Promise.all([0, 1, 2, 3, 4, 5].map(worker));
  hits.sort((a, b) => showMinute(a.time) - showMinute(b.time) || (a.km ?? 1e9) - (b.km ?? 1e9));
  return { hits, failed };
}
function groupByMovie(hits) {
  const map = {};
  for (const h2 of hits) {
    const g = map[h2.movie.title] || (map[h2.movie.title] = { title: h2.movie.title, runtime: h2.movie.runtime, rating: h2.movie.rating, hits: [] });
    if (!g.runtime && h2.movie.runtime) g.runtime = h2.movie.runtime;
    g.hits.push(h2);
  }
  return Object.values(map).sort((a, b) => b.hits.length - a.hits.length || showMinute(a.hits[0].time) - showMinute(b.hits[0].time));
}
var errText = (e) => {
  const m = String(e?.message || e || "");
  if (/JSON|Unexpected|Unrecognized|token|SyntaxError|<|\{/i.test(m)) return "回傳的內容不是預期格式";
  if (/time|network|offline|connect|cancel|host|SSL|TLS|socket/i.test(m)) return "連線失敗";
  return m.replace(/[{}"\[\]]/g, "").trim().slice(0, 40) || "讀取失敗";
};
var IMDB_GQL = "https://api.graphql.imdb.com/";
async function identify(title, en, errs, yearHint = 0) {
  const token = ((await loadSettings()).tmdbToken || "").trim();
  const okYear = (y) => !yearHint || !y || Math.abs(y - yearHint) <= 1;
  const viaImdb = (async () => {
    for (const q of [en, baseTitle(title)].filter(Boolean)) {
      const key = q.toLowerCase().replace(/[\\/?#%]/g, " ").trim();
      try {
        const r = await platform().fetchText(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(key)}.json`, { "User-Agent": UA });
        const d = JSON.parse(r.body).d || [];
        const hit = d.find((x) => /^tt/.test(x.id) && (x.qid === "movie" || x.qid === "tvMovie" || x.qid === "video") && okYear(Number(x.y) || 0));
        if (hit) return { id: hit.id, name: String(hit.l || en || ""), year: Number(hit.y) || 0 };
      } catch (e) {
        errs.push("IMDb 搜尋暫時讀不到");
      }
    }
    return null;
  })();
  if (!token) return viaImdb;
  const viaTmdb = (async () => {
    try {
      const hit = await tmdbFind(title, token);
      if (hit) {
        const [ids, d] = await Promise.all([tmdb(`/movie/${hit.id}/external_ids`, token), tmdb(`/movie/${hit.id}?language=en-US`, token)]);
        const year = Number(String(d?.release_date || "").slice(0, 4)) || 0;
        if (ids?.imdb_id && okYear(year)) return { id: String(ids.imdb_id), name: d?.title || d?.original_title || en || "", year };
      }
    } catch (e) {
      errs.push("TMDB 暫時讀不到");
    }
    return null;
  })();
  const first = await Promise.race([viaTmdb, delay(2500).then(() => "slow")]);
  if (first && first !== "slow") return first;
  return await viaImdb || await viaTmdb;
}
var rtSlug = (name) => name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
async function rtPage(url) {
  const r = await get(url);
  if (!r.ok) return null;
  const page = r.body;
  const j = (page.match(/<script[^>]*id="media-scorecard-json"[^>]*>([\s\S]*?)<\/script>/) || [])[1];
  if (!j) return null;
  const d = JSON.parse(j);
  const pct = (x) => x && /\d/.test(String(x.scorePercent || "")) ? Number(String(x.scorePercent).replace(/\D/g, "")) : -1;
  const ld = (page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  let name = "", year = 0;
  try {
    const o = ld ? JSON.parse(ld) : {};
    const m = String(o.name || "").match(/^(.*?)\s*\((\d{4})\)\s*$/);
    name = m ? m[1] : String(o.name || "");
    year = m ? Number(m[2]) : Number(String(o.dateCreated || "").slice(0, 4)) || 0;
  } catch (_) {
  }
  return { critics: pct(d.criticsScore), certified: !!d.criticsScore?.certified, audience: pct(d.audienceScore), name, year };
}
var normEn = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
async function rtFind(name, year) {
  const okYear = (y) => !year || !y || Math.abs(y - year) <= 1;
  const okName = (n) => !n || normEn(n) === normEn(name) || normEn(n).startsWith(normEn(name));
  const slug = rtSlug(name);
  if (slug) {
    const urls = [`https://www.rottentomatoes.com/m/${slug}`, ...year ? [`https://www.rottentomatoes.com/m/${slug}_${year}`] : []];
    const pages = await Promise.all(urls.map((u) => rtPage(u).catch(() => null)));
    for (const i of pages.length > 1 ? [1, 0] : [0]) {
      const s2 = pages[i];
      if (s2 && okYear(s2.year) && okName(s2.name)) return { url: urls[i], s: s2 };
    }
  }
  const html = await getText(`https://www.rottentomatoes.com/search?search=${encodeURIComponent(name)}`);
  const list = [];
  for (const m of html.matchAll(/<search-page-media-row([\s\S]*?)<\/search-page-media-row>/g)) {
    const b = m[1];
    const url = (b.match(/href="(https:\/\/www\.rottentomatoes\.com\/m\/[^"]+)"[^>]*slot="title"/) || b.match(/href="(https:\/\/www\.rottentomatoes\.com\/m\/[^"]+)"/) || [])[1];
    if (!url) continue;
    const t = (b.match(/slot="title"[^>]*>\s*([^<]+?)\s*</) || [])[1] || "";
    list.push({ year: Number((b.match(/release-year="(\d*)"/) || [])[1] || 0), url, title: t.replace(/&amp;/g, "&").replace(/&#39;/g, "'") });
  }
  const pick = list.find((x) => normEn(x.title) === normEn(name) && okYear(x.year)) || list.find((x) => year && Math.abs(x.year - year) <= 1 && normEn(x.title).includes(normEn(name)));
  if (!pick) return null;
  const s = await rtPage(pick.url);
  return s ? { url: pick.url, s } : null;
}
async function findRatings(title, en, slug) {
  const out = {};
  const errs = [];
  const who = await identify(title, en, errs, await atYearHint(title, slug, en));
  if (!who) {
    out.err = errs.join("；") || "IMDb 上找不到這部片";
    return out;
  }
  const imdbJob = (async () => {
    const url = `https://www.imdb.com/title/${who.id}/`;
    try {
      const r2 = await platform().fetchText(`https://p.media-imdb.com/static-content/documents/v1/title/${who.id}/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json`, { "User-Agent": UA });
      const j = JSON.parse(r2.body.replace(/^[^{]*/, "").replace(/\)\s*$/, ""));
      if (j?.resource) {
        const score2 = Number(j.resource.rating) || 0;
        if (score2) out.imdb = { score: score2, votes: Number(j.resource.ratingCount) || 0, url };
        return;
      }
    } catch (_) {
    }
    const q = `{ title(id:"${who.id}"){ ratingsSummary{aggregateRating voteCount} } }`;
    const r = await platform().fetchText(`${IMDB_GQL}?query=${encodeURIComponent(q)}`, {
      "User-Agent": UA,
      "content-type": "application/json",
      "x-imdb-client-name": "imdb-web-next-localized",
      Referer: "https://www.imdb.com/"
    });
    if (r.status < 200 || r.status >= 300) throw new Error("status " + r.status);
    const t = JSON.parse(r.body)?.data?.title;
    const score = Number(t?.ratingsSummary?.aggregateRating) || 0;
    if (score) out.imdb = { score, votes: Number(t.ratingsSummary.voteCount) || 0, url };
  })().catch(() => errs.push("IMDb 評分暫時讀不到"));
  const rtJob = (async () => {
    if (!who.name) return;
    const f = await rtFind(who.name, who.year);
    if (!f) return;
    if (f.s.critics >= 0) out.tomato = { score: f.s.critics, certified: f.s.certified, url: f.url };
    if (f.s.audience >= 0) out.popcorn = { score: f.s.audience, url: f.url };
  })().catch(() => errs.push("爛番茄暫時讀不到"));
  await Promise.all([imdbJob, rtJob]);
  if (errs.length) out.err = errs.join("；");
  return out;
}
var ratingsMem = {};
function movieRatings(title, en, slug) {
  const k = normTitle(title);
  return ratingsMem[k] ||= (async () => {
    const read = () => {
      try {
        return JSON.parse(cacheGet("ratings.json") || "{}") || {};
      } catch (_) {
        return {};
      }
    };
    const hit = read()[k];
    const has = (x) => !!(x.imdb || x.tomato || x.popcorn);
    if (hit && Date.now() - hit.at < (has(hit) ? 7 : 1) * 864e5) return hit;
    const r = await findRatings(title, en, slug);
    if (!r.err || has(r)) {
      const all = read();
      for (const [key, v] of Object.entries(all)) if (Date.now() - v.at > 7 * 864e5) delete all[key];
      const { err: _e, ...keep } = r;
      all[k] = { ...keep, at: Date.now() };
      cacheSet("ratings.json", JSON.stringify(all));
    }
    return r;
  })();
}
function ratingTier(kind, v) {
  const x = kind === "imdb" ? v * 10 : v;
  return x >= 75 ? "good" : x >= 60 ? "mid" : "bad";
}
var VERSION_URL = "https://raw.githubusercontent.com/morgan91204/scriptable-movie-schedule/main/dist/version.json";
var verNum = (v) => Number(String(v || "").replace(/\D/g, "")) || 0;
async function checkLatest(current2) {
  try {
    const r = await platform().fetchText(VERSION_URL + "?t=" + Date.now(), { accept: "application/json" });
    if (r.status < 200 || r.status >= 300) return null;
    const latest = String(JSON.parse(r.body).version || "");
    if (!latest) return null;
    return { latest, isLatest: verNum(current2) >= verNum(latest) };
  } catch (_) {
    return null;
  }
}
var CINEMA_APPS = [
  { re: /威秀|MUVIE|^vscinemas/i, name: "威秀影城", id: "6761522320", schemes: ["vscinemas", "vieshow", "vieshowcinemas", "com.vieshow.vscinemas"] },
  { re: /秀泰|^showtimes/i, name: "秀泰影城", id: "1152850053", schemes: ["showtimes", "showtimescinema", "maimaishowtimes", "tw.com.maimai.showtimes"] },
  { re: /國賓|^ambassador/i, name: "國賓看電影", id: "435465064", schemes: ["ambassador", "ambassadorlookmovie", "ambassadortheatres", "ambassadorcinemas", "ambassadorapp", "lookmovie", "langshin", "tw.com.langshin.AmbassadorLookMovie", "tw.com.langshin.ambassadorlookmovie"] },
  { re: /新光影城|^skcinemas/i, name: "新光影城", id: "6747376383", schemes: ["skcinemas", "skcinema", "com.bonjays.skcinema.test", "com.bonjays.skcinema"] },
  { re: /美麗新/, name: "美麗新影城", id: "581548701", schemes: ["miramarcinemas", "miramarcinemasbookingonline", "tw.com.miramarcinemas.MiramarCinemasBookingOnline"] },
  { re: /美麗華|^miramar/i, name: "美麗華影城", id: "1446574681", schemes: ["miramar", "mirmar", "miramarcinema", "com.movie.Mirmar"] },
  { re: /喜樂時代|^centuryasia/i, name: "喜樂時代影城", id: "6751645458", schemes: ["centuryasia", "century-asia", "com.century-asia.app"] },
  { re: /樂聲|^lux$/i, name: "樂聲影城", id: "833368283", schemes: ["luxcinema", "lux", "com.studiow.luxcinema"] },
  { re: /百老匯/, name: "龍祥百老匯影城", id: "6446755867", schemes: ["broadwaycinemas", "broadway", "com.broadwaycinemas.app"] }
];
function cinemaApp(c) {
  const a = CINEMA_APPS.find((x) => x.re.test(c.name) || x.re.test(c.id));
  return a ? { name: a.name, id: a.id, url: `itms-apps://apps.apple.com/tw/app/id${a.id}`, schemes: a.schemes } : null;
}
async function bookingUrl(p) {
  if (p.booking) return p.booking;
  try {
    return (await datesOf(p.cinema)).site || p.cinema.url;
  } catch (_) {
    return p.cinema.url;
  }
}
function shareText(p, start, end, seat, app = "apple") {
  const maps = mapsUrl(p.cinema.name, p.address, app);
  return [
    `🎬 ${p.movie.title}`,
    `🕒 ${fmt(start)}${end ? ` – ${fmt(end).slice(-5)}` : ""}`,
    `📍 ${p.cinema.name}（${p.version.label}）`,
    seat ? `💺 ${seat}` : "",
    p.address ? `🏠 ${p.address}` : "",
    `🗺 ${maps}`
  ].filter(Boolean).join("\n");
}

// src/main.tsx
var sleep = (ms) => new Promise((r) => Timer.schedule(ms, false, () => r()));
async function currentCalendar(s) {
  if (s.calendar) {
    try {
      return await Calendar.forEventsByTitle(s.calendar);
    } catch (_) {
    }
  }
  return await Calendar.defaultForEvents();
}
var App = class {
  constructor() {
    this.ui = new UI();
    this.stack = [];
    this.settings = { favorites: [], ads: 10 };
    this.cinemas = [];
    this.calendarName = "";
    // 確認頁可調整的欄位
    this.runtime = 0;
    this.seat = "";
    this.loadingText = "讀取中…";
    // ── 事件迴圈 ──
    // 背景查 GitHub 上的最新版本（首頁顯示是否為最新版）
    this.latest = checkLatest("2026.11.06-0110");
    // ── 搜尋 ──
    this.query = "";
    this.tmdbStatus = "";
    /** 讀好後要在原位補畫的資料（海報、評分、預告），每一項各自觸發一次補畫 */
    this.late = [];
    /** 正在補畫：只用已經讀好的資料，不再等 */
    this.rerendering = false;
    // ── 依電影找 ──
    this.movieQuery = "";
    this.movieCity = "全部";
    this.movieFormat = "";
    // ── 位置 ──
    this.me = null;
    // ── 現在有什麼可以看 ──
    this.nowDate = "";
    this.nowWin = "soon";
    this.nowScope = "fav";
    // fav / near / 縣市名稱
    this.nowFormat = "";
  }
  go(view, loading = "讀取中…") {
    this.loadingText = loading;
    this.stack.push(view);
  }
  back() {
    if (this.stack.length > 1) this.stack.pop();
  }
  home() {
    this.stack = [this.stack[0]];
  }
  async run() {
    this.settings = await loadSettings();
    this.go(() => this.homeView(), "讀取影城清單…");
    const input = String(args.shortcutParameter || args.urls && args.urls[0] || args.plainTexts && args.plainTexts[0] || "");
    let pendingUrl = input;
    let lastView = null;
    let lastDepth = 0;
    const savedY = /* @__PURE__ */ new Map();
    while (!this.ui.closed) {
      const view = this.stack[this.stack.length - 1];
      const depth = this.stack.length;
      const same = view === lastView;
      const back = !same && depth < lastDepth;
      this.ui.begin();
      const job = foregroundTask(Promise.resolve().then(() => view()));
      job.catch(() => {
      });
      const quick = await Promise.race([job.then(() => true, () => true), sleep(200).then(() => false)]);
      if (!quick) await this.ui.render(/* @__PURE__ */ h(Page, { title: "電影行程" }, /* @__PURE__ */ h(Loading, { text: this.loadingText })));
      this.loadingText = "讀取中…";
      let html;
      try {
        html = await job;
        if (pendingUrl) {
          const u = pendingUrl;
          pendingUrl = "";
          if (this.startFrom(u)) continue;
        }
      } catch (e) {
        html = this.errorView(e);
      }
      const scrollTo = same && quick ? -1 : same || back ? savedY.get(view) ?? 0 : 0;
      lastView = view;
      lastDepth = depth;
      const late = this.late;
      this.late = [];
      let clicked = false;
      let painting = null;
      const repaint = async () => {
        if (clicked || this.ui.closed || this.stack[this.stack.length - 1] !== view) return;
        if (painting) return painting.then(repaint);
        painting = (async () => {
          this.rerendering = true;
          const again = await Promise.resolve(view()).catch(() => "");
          this.rerendering = false;
          this.late = [];
          if (again && !clicked && this.stack[this.stack.length - 1] === view) await this.ui.render(again, -1).catch(() => {
          });
        })();
        await painting;
        painting = null;
      };
      for (const p of late) p.then(repaint, repaint);
      const hit = await this.ui.show(html, scrollTo);
      clicked = true;
      if (!hit) break;
      savedY.set(view, hit.y);
      try {
        await hit.handler.call(null, hit.vals);
      } catch (e) {
        this.go(() => this.errorView(e));
      }
    }
    await this.ui.whenClosed();
  }
  errorView(e) {
    const msg = String(e?.message || e);
    return /* @__PURE__ */ h(Page, { title: "出了點問題", onBack: () => this.back() }, /* @__PURE__ */ h(Empty, { icon: "⚠️", text: msg }), /* @__PURE__ */ h(Button, { label: "重試", onTap: () => {
    } }), /* @__PURE__ */ h(Button, { label: "回首頁", kind: "secondary", onTap: () => this.home() }));
  }
  // ── 首頁 ──
  async homeView() {
    if (!this.cinemas.length) this.cinemas = await loadCinemas();
    this.calendarName = (await currentCalendar(this.settings)).title;
    const favs = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean);
    return /* @__PURE__ */ h(Page, { title: "🎬 電影行程", subtitle: `${this.cinemas.length} 間影城｜選影城 → 日期 → 電影 → 場次` }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🕘", title: "現在有什麼可以看", subtitle: "選時段，一次列出常去、附近或某縣市的所有場次", onTap: () => this.go(() => this.nowView()) }), /* @__PURE__ */ h(Item, { icon: "🎞️", title: "依電影找場次", subtitle: "先選電影，再看哪些影城有放映", onTap: () => this.go(() => this.movieListView(), "讀取電影清單…") }), /* @__PURE__ */ h(Item, { icon: "🧭", title: "附近的影城", subtitle: "依目前位置排序", onTap: () => this.go(() => this.nearbyView(), "取得目前位置…") }), /* @__PURE__ */ h(Item, { icon: "🎦", title: "依縣市找影院", subtitle: `全台 ${this.cinemas.length} 間，也可以搜尋影城`, onTap: () => this.go(() => this.citiesView()) })), favs.length ? /* @__PURE__ */ h(Section, { title: "常去影城" }, favs.map((c) => /* @__PURE__ */ h(Item, { icon: "★", title: c.name, subtitle: `${c.city} ${c.district}`, onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`) }))) : null, /* @__PURE__ */ h(Section, { title: "設定" }, /* @__PURE__ */ h(Item, { icon: "📅", title: "寫入的行事曆", subtitle: this.calendarName, onTap: () => this.go(() => this.calendarView()) }), /* @__PURE__ */ h(Item, { icon: "📺", title: "廣告預告", subtitle: `預計散場時間會加上 ${this.settings.ads} 分鐘`, right: "點一下切換", chevron: false, onTap: () => this.cycleAds() }), /* @__PURE__ */ h(Item, { icon: "🗺", title: "導航地圖", subtitle: "點地址、分享、行程備註的導航連結", right: MAPS_LABEL[this.settings.maps || "apple"], chevron: false, onTap: () => {
      this.settings.maps = this.settings.maps === "google" ? "apple" : "google";
      saveSettings(this.settings);
    } }), /* @__PURE__ */ h(Item, { icon: "⏱", title: "補片長（TMDB）", subtitle: this.settings.tmdbToken ? "已設定：沒有片長的電影會自動補上" : "未設定", onTap: () => this.go(() => this.tmdbView()) })), /* @__PURE__ */ h(Note, { text: "場次資料來自場次通 twshowtimes.com、開眼電影網，以及誠品、光點、樂聲官網，實際場次以影城公告為準。" }), /* @__PURE__ */ h(
      "p",
      {
        class: "note version",
        onTap: async () => {
          Pasteboard.copy(`版本 ${"2026.11.06-0110"}`);
          await this.ui.toast("已複製版本號");
        }
      },
      `版本 ${"2026.11.06-0110"}`,
      "（點一下複製）"
    ), await this.versionNote());
  }
  // ── 依縣市找影院 ──
  citiesView() {
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    return /* @__PURE__ */ h(Page, { title: "依縣市找影院", subtitle: `全台 ${this.cinemas.length} 間`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🔍", title: "搜尋影城", subtitle: "影城、分店、行政區或縣市", onTap: () => this.go(() => this.searchView()) })), /* @__PURE__ */ h(Section, { title: "縣市", hint: "影城清單來自場次通與開眼電影網，會自動更新。" }, cities.map((city) => /* @__PURE__ */ h(Item, { title: city, badge: `${this.cinemas.filter((c) => c.city === city).length} 間`, onTap: () => this.go(() => this.cityView(city)) }))));
  }
  searchView() {
    const k = this.query.trim().toLowerCase().replace(/臺/g, "台");
    const hits = k ? this.cinemas.filter((c) => `${c.name} ${c.city} ${c.district} ${c.id} ${c.aliases || ""}`.toLowerCase().replace(/臺/g, "台").includes(k)) : [];
    return /* @__PURE__ */ h(Page, { title: "搜尋影城", onBack: () => this.back() }, /* @__PURE__ */ h("input", { class: "field", name: "q", value: this.query, placeholder: "例如：松仁、西門、in89、台南", autofocus: true }), /* @__PURE__ */ h(Button, { label: "搜尋", enter: true, onTap: (v) => {
      this.query = v.q || "";
    } }), k ? /* @__PURE__ */ h(Section, { title: `結果 ${hits.length} 間` }, hits.length ? null : /* @__PURE__ */ h(Note, { text: "找不到相符的影城，換個關鍵字試試。" }), hits.map((c) => this.cinemaItem(c))) : null);
  }
  cinemaItem(c) {
    return /* @__PURE__ */ h(
      Item,
      {
        icon: this.settings.favorites.indexOf(c.id) >= 0 ? "★" : void 0,
        title: c.name,
        subtitle: `${c.city} ${c.district}`,
        onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)
      }
    );
  }
  cityView(city) {
    const list = this.cinemas.filter((c) => c.city === city);
    return /* @__PURE__ */ h(Page, { title: city, subtitle: `${list.length} 間`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, list.map((c) => this.cinemaItem(c))));
  }
  // ── 設定 ──
  async calendarView() {
    const cals = (await Calendar.forEvents()).filter((c) => c.allowsContentModifications);
    return /* @__PURE__ */ h(Page, { title: "寫入的行事曆", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { hint: "只列出可以新增行程的行事曆。" }, cals.map((c) => /* @__PURE__ */ h(
      Item,
      {
        title: c.title,
        right: c.title === this.calendarName ? "✓ 目前使用" : "",
        chevron: false,
        onTap: () => {
          this.settings.calendar = c.title;
          this.calendarName = c.title;
          saveSettings(this.settings);
          this.back();
        }
      }
    ))));
  }
  async saveTmdb(raw) {
    const t = extractTmdbKey(raw);
    if (!t) {
      this.settings.tmdbToken = "";
      saveSettings(this.settings);
      this.tmdbStatus = "已清除，之後沒有片長的電影不會自動補。";
      return;
    }
    try {
      const r = await tmdbTest(t);
      this.settings.tmdbToken = t;
      saveSettings(this.settings);
      this.tmdbStatus = `✅ 設定完成（測試：${r}）`;
    } catch (e) {
      this.tmdbStatus = `❌ ${String(e?.message || e)}`;
    }
  }
  tmdbView() {
    const open = (url) => async () => {
      await Safari.openInApp(url, false);
    };
    return /* @__PURE__ */ h(Page, { title: "補片長（TMDB）", onBack: () => {
      this.tmdbStatus = "";
      this.back();
    } }, /* @__PURE__ */ h(Note, { text: "場次通的重映、修復版、演唱會有時沒有片長。設定 TMDB 金鑰後，會自動用片名查片長，也會顯示海報和預告片。免費，金鑰只存在你的手機。" }), /* @__PURE__ */ h(Section, { title: "① 註冊並登入 TMDB" }, /* @__PURE__ */ h(Item, { icon: "👤", title: "註冊 TMDB 帳號", subtitle: "填完後到信箱點驗證信", accent: true, chevron: false, onTap: open(TMDB_LINKS.signup) }), /* @__PURE__ */ h(Item, { icon: "🔑", title: "已經有帳號：登入", accent: true, chevron: false, onTap: open(TMDB_LINKS.login) })), /* @__PURE__ */ h(Section, { title: "② 申請 API" }, /* @__PURE__ */ h(Item, { icon: "📝", title: "開啟 API 申請頁", subtitle: "選 Developer → 同意條款 → 用途填 Personal use（個人使用）、網址可填 https://github.com", accent: true, chevron: false, onTap: open(TMDB_LINKS.request) }), /* @__PURE__ */ h(Item, { icon: "📋", title: "開啟 API 金鑰頁", subtitle: "複製「API Read Access Token」（eyJ 開頭）或「API Key」（32 碼）都可以", accent: true, chevron: false, onTap: open(TMDB_LINKS.api) })), /* @__PURE__ */ h(Section, { title: "③ 回到這裡貼上" }, /* @__PURE__ */ h(Item, { icon: "📥", title: "從剪貼簿貼上並測試", subtitle: "複製好金鑰後點這裡", accent: true, chevron: false, onTap: () => this.saveTmdb(Pasteboard.paste() || "") }), /* @__PURE__ */ h("input", { class: "field", name: "v", value: this.settings.tmdbToken || "", placeholder: "或手動貼上金鑰" })), this.tmdbStatus ? /* @__PURE__ */ h(Note, { kind: this.tmdbStatus.startsWith("❌") ? "error" : void 0, text: this.tmdbStatus }) : null, /* @__PURE__ */ h(Button, { kind: "primary", enter: true, label: "儲存並測試", onTap: (v) => this.saveTmdb(String(v.v || "")) }), this.settings.tmdbToken ? /* @__PURE__ */ h(Button, { kind: "danger", label: "清除金鑰", onTap: () => this.saveTmdb("") }) : null);
  }
  cycleAds() {
    const i = AD_STEPS.indexOf(this.settings.ads);
    this.settings.ads = AD_STEPS[(i + 1) % AD_STEPS.length];
    saveSettings(this.settings);
  }
  toggleFav(c) {
    const f = this.settings.favorites;
    const i = f.indexOf(c.id);
    if (i >= 0) f.splice(i, 1);
    else f.push(c.id);
    saveSettings(this.settings);
  }
  // ── 影城：選日期 ──
  async cinemaView(c) {
    const { dates, address, notice, site } = await datesOf(c);
    const fav = this.settings.favorites.indexOf(c.id) >= 0;
    return /* @__PURE__ */ h(Page, { title: c.name, subtitle: `${c.city} ${c.district}`, onBack: () => this.back() }, address ? /* @__PURE__ */ h(Section, null, this.addressItem(c.name, address)) : null, /* @__PURE__ */ h(Section, { title: "選擇日期" }, dates.length ? null : /* @__PURE__ */ h(Empty, { icon: "🗓", text: "目前沒有公布的場次" }), dates.map((d) => /* @__PURE__ */ h(Item, { title: dateLabel(d), onTap: () => this.go(() => this.moviesView(c, d), `讀取 ${dateLabel(d)} 的片單…`) }))), notice ? /* @__PURE__ */ h(Note, { kind: "warn", text: notice }) : null, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: fav ? "★" : "☆", title: fav ? "移出常去影城" : "加入常去影城", chevron: false, onTap: () => this.toggleFav(c) }), site ? /* @__PURE__ */ h(Item, { icon: "🏠", title: "影城官網（訂票）", subtitle: site.replace(/^https?:\/\//, "").replace(/\/.*$/, ""), chevron: false, accent: true, onTap: () => Safari.open(site) }) : null, site !== c.url ? /* @__PURE__ */ h(Item, { icon: "🌐", title: c.source === "at" ? "以瀏覽器開啟開眼時刻表" : "以瀏覽器開啟場次通時刻表", chevron: false, accent: true, onTap: () => Safari.open(c.url) }) : null));
  }
  // ── 電影列表 ──
  async moviesView(c, date) {
    const r = await moviesOf(c, date);
    prefetchPosters(r.movies);
    const isToday = date === todayTPE();
    const now = nowHM();
    return /* @__PURE__ */ h(Page, { title: dateLabel(date), subtitle: `${c.name}｜${r.movies.length} 部電影`, onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, r.movies.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "這天沒有可讀取的場次" }), r.movies.map((m) => {
      const all = [].concat(...m.versions.map((v) => v.times));
      const left = isToday ? all.filter((t) => t > now || isLate(t)).length : all.length;
      const ended = isToday && left === 0;
      const sub = [m.runtime ? `${m.runtime} 分` : "片長未提供", m.rating, m.versions.map((v) => `${v.label} ${v.times.length} 場`).join("、")].filter(Boolean).join("｜");
      return /* @__PURE__ */ h(
        Item,
        {
          title: m.title,
          subtitle: sub,
          badge: ended ? "已結束" : isToday ? `剩 ${left} 場` : void 0,
          muted: ended,
          onTap: () => this.go(() => this.timesView(c, date, m, r))
        }
      );
    })));
  }
  /** 地址列：點一下導航、長按複製 */
  addressItem(name, address, title) {
    return /* @__PURE__ */ h(
      Item,
      {
        icon: "📍",
        title: title || address,
        subtitle: title ? address + "\n點一下導航・長按複製地址" : "點一下導航・長按複製地址",
        chevron: false,
        onTap: () => Safari.open(mapsUrl(name, address, this.settings.maps)),
        onLongPress: async () => {
          Pasteboard.copy(address);
          await this.ui.toast("已複製地址");
        }
      }
    );
  }
  /** 來源沒給片長時，自動查 TMDB／開眼補上（最多等 wait 毫秒，沒好就之後補畫）；回傳查到的片長 */
  async fillRuntime(m, wait = 2500) {
    if (m.runtime) return m.runtime;
    const job = foregroundTask(
      movieRuntime(m.title, m.slug, m.en).then((r) => {
        if (r && !m.runtime) {
          m.runtime = r.runtime;
          m.runtimeFrom = r.from;
        }
      }).catch(() => {
      })
    );
    await Promise.race([job, sleep(this.rerendering ? 0 : wait)]);
    if (!m.runtime) this.late.push(job);
    return m.runtime;
  }
  /** 海報、預告與評分：最多等 0.4 秒就先畫頁面（有快取的會直接出現），其餘讀好後各自補上。海報網址另外快查（不等預告） */
  async extras(title, slug, en) {
    const px = foregroundTask(movieExtras(title, slug).catch(() => null));
    const pr = foregroundTask(movieRatings(title, en, slug).catch(() => null));
    const pp = foregroundTask(moviePoster(title, slug, en).catch(() => ""));
    const wait = this.rerendering ? 0 : 400;
    const quick = (p2) => Promise.race([p2, sleep(wait).then(() => void 0)]);
    const [x, r, p] = await Promise.all([quick(px), quick(pr), quick(pp)]);
    const loading = x === void 0 || r === void 0 || p === void 0;
    if (loading) this.late = [x === void 0 ? px : null, r === void 0 ? pr : null, p === void 0 ? pp : null].filter(Boolean);
    return { x: x ?? null, r: r ?? null, p: p || "", px, loading };
  }
  hero(e, title, lines) {
    const { x, r } = e;
    const posterUrl = x?.poster || e.p || "";
    const poster = posterSrc(posterUrl);
    if (poster && poster === posterUrl) cachePoster(posterUrl);
    const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " 預告")}`;
    const badges = [];
    if (r) {
      badges.push(r.imdb ? { kind: "imdb", value: r.imdb.score.toFixed(1), tier: ratingTier("imdb", r.imdb.score), onTap: () => Safari.open(r.imdb.url) } : { kind: "imdb", value: "-", tier: "none" });
      badges.push(r.tomato ? { kind: "tomato", value: `${r.tomato.score}%`, tier: ratingTier("pct", r.tomato.score), note: r.tomato.certified ? "✓" : void 0, onTap: () => Safari.open(r.tomato.url) } : { kind: "tomato", value: "-", tier: "none" });
      badges.push(r.popcorn ? { kind: "popcorn", value: `${r.popcorn.score}%`, tier: ratingTier("pct", r.popcorn.score), onTap: () => Safari.open(r.popcorn.url) } : { kind: "popcorn", value: "-", tier: "none" });
    }
    if (!r && e.loading) lines = [...lines, "評分讀取中…"];
    else if (!r) lines = [...lines, "評分讀不到"];
    if (r?.err && !(r.imdb || r.tomato || r.popcorn)) lines = [...lines, `評分讀不到：${r.err}`];
    if (x?.err) lines = [...lines, `預告：${x.err}`];
    return /* @__PURE__ */ h(
      Hero,
      {
        poster,
        posterUrl,
        posterPending: !poster && e.loading,
        lines,
        badges,
        trailerLabel: !x || x.trailerName ? "觀看預告" : "搜尋預告",
        onTrailer: async () => Safari.open((x || await e.px)?.trailer || search)
      }
    );
  }
  // ── 場次 ──
  async timesView(c, date, m, r) {
    const isToday = date === todayTPE();
    const now = nowHM();
    const x = await this.extras(m.title);
    return /* @__PURE__ */ h(Page, { title: m.title, subtitle: `${c.name}｜${dateLabel(date)}`, onBack: () => this.back() }, this.hero(x, m.title, [
      m.runtime ? `片長 ${m.runtime} 分鐘` + (m.runtimeFrom ? `（${m.runtimeFrom}）` : "") : "片長未提供，下一步可手動輸入",
      m.rating || ""
    ]), m.versions.map((v) => /* @__PURE__ */ h(Section, { title: v.label }, /* @__PURE__ */ h(Chips, null, [...v.times].sort(byShowtime).map((t) => {
      const past = isToday && t <= now && !isLate(t);
      const end = m.runtime ? fmt(new Date(tpeDate(date, t).getTime() + (m.runtime + this.settings.ads) * 6e4)).slice(-5) : "";
      return /* @__PURE__ */ h(
        Chip,
        {
          label: t,
          sub: past ? "已開演" : isLate(t) ? "凌晨場" : end ? `→ ${end}` : "",
          muted: past,
          warn: isLate(t),
          onTap: () => {
            this.runtime = m.runtime;
            this.seat = hallOf(v.label);
            this.go(
              () => this.confirmView({ cinema: c, address: r.address || c.address || "", booking: r.booking, sourceUrl: r.sourceUrl, date, movie: m, version: v, time: t })
            );
          }
        }
      );
    })))));
  }
  // ── 確認 ──
  start(p) {
    return tpeDate(isLate(p.time) ? addDays(p.date, 1) : p.date, p.time);
  }
  end(p) {
    return new Date(this.start(p).getTime() + ((this.runtime || 120) + this.settings.ads) * 6e4);
  }
  async confirmView(p) {
    if (!this.runtime && !p.movie.runtime) {
      this.late = [];
      await this.fillRuntime(p.movie);
      if (p.movie.runtime) this.runtime = p.movie.runtime;
    }
    return /* @__PURE__ */ h(Page, { title: "確認行程", subtitle: "點選項目可以修改", onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, /* @__PURE__ */ h(Item, { icon: "🎬", title: p.movie.title, subtitle: p.version.label }), p.address ? this.addressItem(p.cinema.name, p.address, p.cinema.name) : /* @__PURE__ */ h(Item, { icon: "📍", title: p.cinema.name }), /* @__PURE__ */ h(Item, { icon: "🕒", title: fmt(this.start(p)), subtitle: `預計 ${fmt(this.end(p)).slice(-5)} 散場` })), isLate(p.time) ? /* @__PURE__ */ h(Note, { kind: "warn", text: "凌晨場：已自動算到隔天日期，請再核對電影票。" }) : null, /* @__PURE__ */ h(Section, { title: "可調整" }, /* @__PURE__ */ h(
      Item,
      {
        icon: "⏱",
        title: "片長",
        subtitle: this.runtime ? `${this.runtime} 分鐘` + (p.movie.runtimeFrom && this.runtime === p.movie.runtime ? `（取自 ${p.movie.runtimeFrom}，請核對）` : "") : "來源沒有提供，請輸入（未填以 120 分鐘計）",
        right: "修改",
        onTap: () => this.go(() => this.runtimeView())
      }
    ), /* @__PURE__ */ h(Item, { icon: "📺", title: "廣告預告", subtitle: `${this.settings.ads} 分鐘`, right: "點一下切換", chevron: false, onTap: () => this.cycleAds() }), /* @__PURE__ */ h(Item, { icon: "💺", title: "影廳／座位", subtitle: this.seat || "未填（選填）", right: "修改", onTap: () => this.go(() => this.seatView()) }), /* @__PURE__ */ h(Item, { icon: "📅", title: "行事曆", subtitle: this.calendarName, right: "更換", onTap: () => this.go(() => this.calendarView()) })), /* @__PURE__ */ h(Button, { label: "✓ 加入行事曆", onTap: () => this.save(p) }), this.bookingButtons(p), /* @__PURE__ */ h(Button, { label: "分享這場給朋友", kind: "secondary", onTap: () => this.share(p) }));
  }
  /** 版本狀態：已是最新版／有新版（捷徑每次執行都會下載最新版，重新執行就會更新） */
  async versionNote() {
    const r = await Promise.race([this.latest, sleep(1500).then(() => void 0)]);
    if (r === void 0) return "";
    if (!r) return /* @__PURE__ */ h(Note, { text: "（無法確認是否為最新版：讀不到 GitHub）" });
    if (r.isLatest) return /* @__PURE__ */ h(Note, { text: "✅ 已是最新版" });
    return /* @__PURE__ */ h(Note, { kind: "warn", text: `🆕 有新版 ${r.latest}：關閉後重新執行捷徑就會更新（GitHub 約有 5 分鐘延遲）。如果是匯入 .scriptable 檔安裝的，請改用捷徑才會自動更新。` });
  }
  /** 以瀏覽器訂票／以 App 訂票 */
  bookingButtons(p) {
    const app = cinemaApp(p.cinema);
    return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Button, { label: "🌐 以瀏覽器訂票", kind: "secondary", onTap: async () => Safari.open(await bookingUrl(p)) }), app ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(Button, { label: `📱 以 App 訂票（${app.name}）`, kind: "secondary", onTap: () => Safari.open(app.url) }), /* @__PURE__ */ h(Note, { text: `會打開 App Store 的「${app.name}」頁面：已安裝的話點「打開」就進 App，沒安裝可以直接下載。` })) : /* @__PURE__ */ h(Note, { text: "這間影城沒有官方 App，請用瀏覽器訂票。" }));
  }
  runtimeView() {
    return /* @__PURE__ */ h(Page, { title: "片長", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { text: "請依官網或電影票輸入正片分鐘數。" }), /* @__PURE__ */ h("input", { class: "field", name: "v", type: "number", inputmode: "numeric", value: this.runtime || "", placeholder: "例如 120", autofocus: true }), /* @__PURE__ */ h(
      Button,
      {
        label: "確定",
        enter: true,
        onTap: (v) => {
          const n = Math.round(Number(v.v));
          if (!(n > 0 && n < 600)) throw new Error("片長請輸入 1～599 的整數");
          this.runtime = n;
          this.back();
        }
      }
    ));
  }
  seatView() {
    return /* @__PURE__ */ h(Page, { title: "影廳／座位", onBack: () => this.back() }, /* @__PURE__ */ h(Note, { text: "選填，會寫進行程備註。例如：7 廳 H12、H13" }), /* @__PURE__ */ h("input", { class: "field", name: "v", value: this.seat, placeholder: "影廳與座位", autofocus: true }), /* @__PURE__ */ h(
      Button,
      {
        label: "確定",
        enter: true,
        onTap: (v) => {
          this.seat = String(v.v || "").trim();
          this.back();
        }
      }
    ));
  }
  async save(p) {
    if (!this.runtime) return this.go(() => this.runtimeView());
    const cal = await currentCalendar(this.settings);
    const start = this.start(p);
    const end = this.end(p);
    const dup = (await CalendarEvent.between(new Date(start.getTime() - 6e4), new Date(start.getTime() + 6e4), [cal])).find((e) => e.title === p.movie.title);
    if (dup) return this.go(() => this.dupView(p, cal));
    this.write(p, cal, start, end);
  }
  dupView(p, cal) {
    return /* @__PURE__ */ h(Page, { title: "已經有這場了", onBack: () => this.back() }, /* @__PURE__ */ h(Empty, { icon: "📅", text: `${p.movie.title}
${fmt(this.start(p))}
已在「${cal.title}」裡` }), /* @__PURE__ */ h(Button, { label: "還是加入", kind: "danger", onTap: () => this.write(p, cal, this.start(p), this.end(p)) }), /* @__PURE__ */ h(Button, { label: "不要重複", kind: "secondary", onTap: () => this.back() }));
  }
  write(p, cal, start, end) {
    const maps = mapsUrl(p.cinema.name, p.address, this.settings.maps);
    const ev = new CalendarEvent();
    ev.title = p.movie.title;
    ev.startDate = start;
    ev.endDate = end;
    ev.location = [p.cinema.name, p.address].filter(Boolean).join(" ");
    ev.calendar = cal;
    ev.notes = [
      `影城：${p.cinema.name}`,
      p.address ? `地址：${p.address}` : "",
      `版本：${p.version.label}`,
      `影廳／座位：${this.seat || "未填"}`,
      `正片：${this.runtime} 分鐘；廣告預告：${this.settings.ads} 分鐘`,
      `預計散場：${fmt(end)}`,
      `導航：${maps}`,
      p.booking ? `訂票／官方：${p.booking}` : "",
      `場次來源：${p.sourceUrl}`
    ].filter(Boolean).join("\n");
    ev.save();
    this.go(() => this.doneView(p, ev, cal));
  }
  doneView(p, ev, cal) {
    return /* @__PURE__ */ h(Page, { title: "已加入行事曆", subtitle: cal.title }, /* @__PURE__ */ h(Empty, { icon: "✅", text: `${p.movie.title}
${fmt(ev.startDate)} → ${fmt(ev.endDate).slice(-5)}
${p.cinema.name}${this.seat ? "｜" + this.seat : ""}` }), /* @__PURE__ */ h(Section, { hint: "Scriptable 無法直接設定提醒，打開行程後可在「提示」加上開演前 30 分鐘。" }, /* @__PURE__ */ h(Item, { icon: "🔔", title: "打開行程，加提醒", accent: true, onTap: async () => {
      await ev.presentEdit();
    } }), /* @__PURE__ */ h(Item, { icon: "📤", title: "分享這場給朋友", accent: true, onTap: () => this.share(p) })), this.bookingButtons(p), /* @__PURE__ */ h(Button, { label: "再新增一部", onTap: () => this.home() }));
  }
  async movieListView() {
    const all = await loadMovies();
    const k = this.movieQuery.trim().toLowerCase();
    const list = all.filter((m) => !k || `${m.title} ${m.en}`.toLowerCase().includes(k));
    prefetchPosters(list);
    const item = (m) => /* @__PURE__ */ h(
      Item,
      {
        title: m.title,
        subtitle: [m.rating, m.runtime ? `${m.runtime} 分` : "", m.en].filter(Boolean).join("｜"),
        badge: m.cinemaCount ? `${m.cinemaCount} 間` : void 0,
        onTap: () => this.go(() => this.movieView(m, ""), `讀取《${m.title}》的放映影城…`)
      }
    );
    const now = list.filter((m) => !m.comingSoon);
    const soon = list.filter((m) => m.comingSoon);
    return /* @__PURE__ */ h(Page, { title: "依電影找場次", subtitle: `${all.length} 部電影`, onBack: () => this.back() }, /* @__PURE__ */ h("input", { class: "field", name: "q", value: this.movieQuery, placeholder: "搜尋片名" }), /* @__PURE__ */ h(Button, { label: "搜尋", kind: "secondary", enter: true, onTap: (v) => {
      this.movieQuery = v.q || "";
    } }), now.length ? /* @__PURE__ */ h(Section, { title: `上映中（${now.length}）`, hint: "依今天放映的影城數排序，資料來自場次通。" }, now.map(item)) : null, soon.length ? /* @__PURE__ */ h(Section, { title: `即將上映（${soon.length}）` }, soon.map(item)) : null, list.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "找不到相符的電影" }));
  }
  async movieView(m, date) {
    const d = await movieDay(m.slug, date || void 0);
    const dates = d.dates.filter((x2) => x2 >= todayTPE());
    let runtime = d.runtime || m.runtime;
    const cities = Array.from(new Set(d.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const city = cities.indexOf(this.movieCity) >= 0 ? this.movieCity : "全部";
    const formats = FORMATS.filter((f) => d.cinemas.some((c) => c.versions.some((v) => formatsOf(v.label).indexOf(f) >= 0)));
    const fmtSel = formats.indexOf(this.movieFormat) >= 0 ? this.movieFormat : "";
    const shown = d.cinemas.map((c) => ({ ...c, versions: filterVersions(c.versions, fmtSel) })).filter((c) => (city === "全部" || c.city === city) && c.versions.length);
    const toCinema = (c) => this.cinemas.find((x2) => x2.id === c.id) || { id: c.id, name: c.name, city: c.city, district: c.district, source: "tw", url: `${TW}/cinemas/${c.id}/`, address: c.address };
    const replace = (nd) => {
      this.stack[this.stack.length - 1] = () => this.movieView(m, nd);
    };
    const x = await this.extras(m.title, m.slug, m.en);
    if (!runtime) runtime = await this.fillRuntime(m, 1500);
    return /* @__PURE__ */ h(Page, { title: m.title, subtitle: [m.rating || d.rating, runtime ? `${runtime} 分鐘` : "", `${d.cinemas.length} 間影城`].filter(Boolean).join("｜"), onBack: () => this.back() }, this.hero(x, m.title, [m.en, [m.rating || d.rating, runtime ? `${runtime} 分鐘` : ""].filter(Boolean).join("｜"), `${d.cinemas.length} 間影城有放映`]), /* @__PURE__ */ h(Section, { title: "日期" }, /* @__PURE__ */ h(Chips, null, (dates.length ? dates : [d.date]).map((x2) => /* @__PURE__ */ h(Chip, { label: dateLabel(x2).replace(/（.）.*$/, ""), sub: x2 === d.date ? "目前" : dateLabel(x2).match(/（(.)）/)?.[1] || "", muted: x2 !== d.date, onTap: () => replace(x2) })))), /* @__PURE__ */ h(Section, { title: "縣市" }, /* @__PURE__ */ h(Chips, null, ["全部", ...cities].map((c) => /* @__PURE__ */ h(Chip, { label: c, muted: c !== city, onTap: () => {
      this.movieCity = c;
    } })))), formats.length ? /* @__PURE__ */ h(Section, { title: "特殊廳" }, /* @__PURE__ */ h(Chips, null, ["", ...formats].map((f) => /* @__PURE__ */ h(Chip, { label: f || "全部", muted: f !== fmtSel, onTap: () => {
      this.movieFormat = f;
    } })))) : null, cities.filter((ct) => shown.some((c) => c.city === ct)).map((ct) => /* @__PURE__ */ h(Section, { title: `${ct}（${shown.filter((c) => c.city === ct).length} 間）` }, shown.filter((c) => c.city === ct).map((c) => {
      const movie = { title: d.title || m.title, runtime, rating: d.rating || m.rating, versions: c.versions, runtimeFrom: d.runtime ? d.runtimeFrom : m.runtimeFrom };
      const summary = c.versions.map((v) => `${v.label} ${[...v.times].sort(byShowtime).join(" ")}`).join("／");
      return /* @__PURE__ */ h(
        Item,
        {
          icon: this.settings.favorites.indexOf(c.id) >= 0 ? "★" : void 0,
          title: c.name,
          subtitle: summary,
          onTap: () => this.go(() => this.timesView(toCinema(c), d.date, movie, { booking: "", sourceUrl: `${TW}/cinemas/${c.id}/${d.date}/`, address: c.address }))
        }
      );
    }))), shown.length ? null : /* @__PURE__ */ h(Empty, { icon: "🎞", text: "這天沒有影城放映" }));
  }
  // ── 分享 ──
  async share(p) {
    await ShareSheet.present([shareText({ ...p, address: p.address }, this.start(p), this.runtime ? this.end(p) : void 0, this.seat, this.settings.maps)]);
  }
  async locate() {
    if (this.me) return this.me;
    try {
      Location.setAccuracyToHundredMeters();
      const l = await Location.current();
      this.me = { lat: l.latitude, lng: l.longitude };
      return this.me;
    } catch (_) {
      throw new Error("拿不到目前位置。請到「設定 → 隱私權與安全性 → 定位服務 → Scriptable」允許使用位置。");
    }
  }
  async nearbyView() {
    const me = await this.locate();
    const list = nearest(this.cinemas, me, 25);
    return /* @__PURE__ */ h(Page, { title: "附近的影城", subtitle: "直線距離", onBack: () => this.back() }, /* @__PURE__ */ h(Section, null, list.map(({ cinema: c, km }) => /* @__PURE__ */ h(
      Item,
      {
        icon: this.settings.favorites.indexOf(c.id) >= 0 ? "★" : void 0,
        title: c.name,
        subtitle: `${c.city} ${c.district}`,
        right: kmLabel(km) || "距離未知",
        onTap: () => this.go(() => this.cinemaView(c), `讀取 ${c.name} 的場次…`)
      }
    ))));
  }
  nowView() {
    const today = todayTPE();
    const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(today, i));
    const date = this.nowDate || today;
    const wins = WINDOWS.filter((w) => !w.todayOnly || date === today);
    const win = wins.find((w) => w.id === this.nowWin) || wins[0];
    const cities = Array.from(new Set(this.cinemas.map((c) => c.city))).sort(
      (a, b) => (CITY_ORDER.indexOf(a) + 1 || 99) - (CITY_ORDER.indexOf(b) + 1 || 99)
    );
    const scopes = [{ id: "fav", label: `常去影城（${this.settings.favorites.length}）` }, { id: "near", label: "附近 10 間" }, ...cities.map((c) => ({ id: c, label: c }))];
    return /* @__PURE__ */ h(Page, { title: "現在有什麼可以看", onBack: () => this.back() }, /* @__PURE__ */ h(Section, { title: "日期" }, /* @__PURE__ */ h(Chips, null, dates.map((d) => /* @__PURE__ */ h(Chip, { label: dateLabel(d).replace(/（.）.*$/, ""), sub: d === today ? "今天" : d === addDays(today, 1) ? "明天" : dateLabel(d).match(/（(.)）/)?.[1] || "", muted: d !== date, onTap: () => {
      this.nowDate = d;
    } })))), /* @__PURE__ */ h(Section, { title: "開演時段" }, /* @__PURE__ */ h(Chips, null, wins.map((w) => /* @__PURE__ */ h(Chip, { label: w.label, muted: w.id !== win.id, onTap: () => {
      this.nowWin = w.id;
    } })))), /* @__PURE__ */ h(Section, { title: "找哪些影城", hint: "縣市的影城較多，會花比較久時間。開眼來源的戲院通常只有今天的場次。" }, /* @__PURE__ */ h(Chips, null, scopes.map((sc) => /* @__PURE__ */ h(Chip, { label: sc.label, muted: sc.id !== this.nowScope, onTap: () => {
      this.nowScope = sc.id;
    } })))), /* @__PURE__ */ h(Section, { title: "特殊廳" }, /* @__PURE__ */ h(Chips, null, ["", ...FORMATS].map((f) => /* @__PURE__ */ h(Chip, { label: f || "不限", muted: f !== this.nowFormat, onTap: () => {
      this.nowFormat = f;
    } })))), /* @__PURE__ */ h(Button, { label: "🔍 找場次", onTap: () => this.go(() => this.nowResultsView(date, win.id), "正在查詢各影城的場次…") }));
  }
  async nowResultsView(date, winId) {
    const win = WINDOWS.find((w) => w.id === winId) || WINDOWS[0];
    let scope;
    if (this.nowScope === "near") scope = nearest(this.cinemas, await this.locate(), 10);
    else if (this.nowScope === "fav") scope = this.settings.favorites.map((id) => this.cinemas.find((c) => c.id === id)).filter(Boolean).map((c) => ({ cinema: c, km: null }));
    else scope = this.cinemas.filter((c) => c.city === this.nowScope).map((c) => ({ cinema: c, km: null }));
    if (!scope.length) throw new Error("沒有可以查的影城。先在影城頁加入常去影城，或改選附近／縣市。");
    const { hits, failed } = await findShowtimes(scope, date, win, this.nowFormat);
    const groups = groupByMovie(hits);
    prefetchPosters(groups);
    const scopeLabel = this.nowScope === "fav" ? "常去影城" : this.nowScope === "near" ? "附近 10 間" : this.nowScope;
    const open = (hit) => {
      this.runtime = hit.movie.runtime;
      this.seat = hallOf(hit.version.label);
      this.go(() => this.confirmView({ cinema: hit.cinema, address: hit.ctx.address || hit.cinema.address || "", booking: hit.ctx.booking, sourceUrl: hit.ctx.sourceUrl, date: hit.date, movie: hit.movie, version: hit.version, time: hit.time }));
    };
    return /* @__PURE__ */ h(Page, { title: `${dateLabel(date).replace(/ .*$/, "")} ${win.label}`, subtitle: `${scopeLabel}｜${hits.length} 場、${groups.length} 部電影`, onBack: () => this.back() }, groups.length ? null : /* @__PURE__ */ h(Empty, { icon: "🍿", text: "這個時段沒有符合的場次，換個時段或範圍試試。" }), groups.map((g) => /* @__PURE__ */ h(Section, { title: `${g.title}（${g.hits.length} 場）`, hint: [g.runtime ? `${g.runtime} 分鐘` : "", g.rating].filter(Boolean).join("｜") || void 0 }, g.hits.map((hit) => /* @__PURE__ */ h(
      Item,
      {
        title: `${hit.time}${isLate(hit.time) ? "（凌晨）" : ""}　${hit.cinema.name}`,
        subtitle: [hit.version.label, kmLabel(hit.km)].filter(Boolean).join("｜"),
        onTap: () => open(hit)
      }
    )))), failed.length ? /* @__PURE__ */ h(Note, { kind: "warn", text: `有 ${failed.length} 間讀取失敗：${failed.join("、")}` }) : null);
  }
  // 從捷徑或 Safari 分享場次通／誠品／光點網址時，直接跳到那間影城
  startFrom(url) {
    const m = url.match(/twshowtimes\.com\/cinemas\/([^/]+)\/(?:(\d{4}-\d{2}-\d{2})\/)?/);
    let c;
    if (m) c = this.cinemas.find((x) => x.id === m[1]);
    else if (/eslite\.com/.test(url)) c = EXTRA.find((x) => x.id === "eslite");
    else if (/spot-hs\.org\.tw/.test(url)) c = EXTRA.find((x) => x.id === "spot-hs");
    else if (/spot\.org\.tw/.test(url)) c = EXTRA.find((x) => x.id === "spot-taipei");
    else if (/luxcinema\.com\.tw/.test(url)) c = EXTRA.find((x) => x.id === "lux");
    else {
      const at = url.match(/atmovies\.com\.tw\/showtime\/(t\w+)\//);
      if (at) c = this.cinemas.find((x) => x.id === "at-" + at[1]);
    }
    if (!c) return false;
    const cinema = c;
    this.go(() => this.cinemaView(cinema), `讀取 ${cinema.name} 的場次…`);
    if (m && m[2]) this.go(() => this.moviesView(cinema, m[2]));
    return true;
  }
};
setPlatform(scriptablePlatform);
await new App().run();
Script.complete();
