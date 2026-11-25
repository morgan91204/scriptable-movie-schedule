// WebView 外殼：載入一次 HTML（含 CSS），之後每次只換 <body> 內容，
// 並用 evaluateJavaScript(..., true) 等待使用者點擊，回傳被點的 data-act。
import { getHandler, resetHandlers, Handler } from "./jsx";

export const CSS = `
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
.bar-save{padding:6px 2px 6px 12px;font-size:17px;font-weight:600;color:var(--accent)}
.bar-right{min-width:64px;text-align:right;font-size:13px;color:var(--fg2);white-space:nowrap}
.content{flex:1;padding:8px 16px calc(env(safe-area-inset-bottom) + 32px)}
.page.with-tabs .content{padding-bottom:calc(max(env(safe-area-inset-bottom) - 12px,12px) + 104px)}
.tabbar{position:fixed;left:50%;transform:translateX(-50%);bottom:max(calc(env(safe-area-inset-bottom) - 12px),12px);z-index:10;width:min(92vw,420px);
 display:flex;align-items:center;padding:5px;border-radius:999px;
 background:rgba(255,255,255,.9);-webkit-backdrop-filter:blur(28px) saturate(190%);backdrop-filter:blur(28px) saturate(190%);
 border:1px solid rgba(255,255,255,.55);box-shadow:0 10px 36px rgba(0,0,0,.16),0 1px 2px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.7)}
@media(prefers-color-scheme:dark){.tabbar{background:rgba(40,40,44,.9);border-color:rgba(255,255,255,.1);box-shadow:0 10px 36px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 4px 6px;border-radius:999px;color:var(--fg2);font-size:10.5px;font-weight:600;line-height:1;transition:background .2s,color .2s}
.tab svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.tab.on{color:var(--accent);background:rgba(10,132,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
@media(prefers-color-scheme:dark){.tab.on{background:rgba(10,132,255,.22)}}
.tab:active{opacity:.6}
.tab{position:relative}
.tab-dot{position:absolute;top:5px;left:calc(50% + 7px);width:8px;height:8px;border-radius:4px;background:#ff3b30;box-shadow:0 0 0 1.5px var(--bg)}
.newdot{display:inline-block;width:8px;height:8px;border-radius:4px;background:#ff3b30;margin-right:6px;vertical-align:1px}
.sec{margin:14px 0 0}
.sec-title{margin:0 0 6px 12px;font-size:13px;font-weight:600;color:var(--fg2);text-transform:uppercase;letter-spacing:.3px}
.group{background:var(--card);border-radius:14px;overflow:hidden}
.hint{margin:8px 12px 0;font-size:13px;color:var(--fg2)}
.item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--line);min-height:46px}
.group .item:last-child{border-bottom:0}
.item.tap:active{background:var(--line)}
.item .ico{font-size:20px;width:26px;text-align:center;flex:none}
.item .rank{flex:none;width:34px;text-align:center;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--fg2);white-space:nowrap;overflow:hidden}
.item .rank.d3{font-size:15px}
.item .rank.d4{font-size:12px;letter-spacing:-.2px}
.item .rank.top{color:#ff9f0a}
.item .thumb{flex:none;width:44px;height:66px;border-radius:6px;object-fit:cover;background:var(--chip)}
.item .thumb.none{display:block}
.gen{position:relative;overflow:hidden;display:flex!important;flex-direction:column;color:#fff;text-align:center}
.gen>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.gen .clap{flex:none;height:17%;background:repeating-linear-gradient(115deg,#fff 0 14%,#17181c 14% 28%);border-bottom:1px solid rgba(0,0,0,.35)}
.gen .gt{flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:0 7%;font-weight:800;line-height:1.2;font-size:9px;text-shadow:0 1px 2px rgba(0,0,0,.25)}
.gen .gt>span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;word-break:break-word}
.gen .gt.m{font-size:8px}.gen .gt.l{font-size:7px}
.gen .perf{flex:none;height:9%;opacity:.5;background:repeating-linear-gradient(90deg,transparent 0 6%,#fff 6% 15%,transparent 15% 20%);background-size:70% 50%;background-position:center;background-repeat:no-repeat}
.poster.gen .gt{font-size:19px;padding:0 9%}.poster.gen .gt.m{font-size:15px}.poster.gen .gt.l{font-size:12px}
.poster.gen .gt>span{-webkit-line-clamp:4}
.poster.gen .clap{border-bottom-width:3px}
.g0{background:linear-gradient(160deg,#3b4a6b,#1f2a44)!important}.g1{background:linear-gradient(160deg,#6b3b4a,#3d1f2a)!important}.g2{background:linear-gradient(160deg,#2f5d50,#16352d)!important}.g3{background:linear-gradient(160deg,#5a4a2f,#33290f)!important}.g4{background:linear-gradient(160deg,#4a3b6b,#281f44)!important}.g5{background:linear-gradient(160deg,#3a3d42,#1f2125)!important}
.item .body{flex:1;min-width:0}
.item .title{font-size:16px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.item .sub{font-size:13px;color:var(--fg2);margin-top:2px;white-space:pre-line;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.item .sub.one{display:block;white-space:nowrap}
.item .sub.full{display:block;overflow:visible;-webkit-line-clamp:unset}
.item.danger .title{color:var(--red)}
.tg{flex:none;position:relative;width:46px;height:28px;margin-left:10px;border-radius:999px;background:var(--chip);transition:background .2s}
.tg i{position:absolute;left:2px;top:2px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.tg.on{background:var(--green)}
.tg.on i{transform:translateX(18px)}
.steps{flex:none;display:flex;gap:3px;margin-left:10px;padding:3px;border-radius:10px;background:var(--chip)}
.steps i{min-width:26px;padding:4px 5px;border-radius:7px;font-style:normal;font-size:13px;text-align:center;color:var(--fg2)}
.steps i.on{background:var(--card);color:var(--fg);font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,.15)}
.newbar{display:flex;align-items:stretch;margin:8px 0 4px;border-radius:12px;background:rgba(10,132,255,.14);overflow:hidden}
.newbar-main{flex:1;min-width:0;padding:9px 4px 9px 12px;text-align:left}
.newbar-main b{display:block;font-size:14px;color:var(--accent)}
.newbar-main b:after{content:" ›"}
.newbar-main span{display:block;margin-top:1px;font-size:12.5px;color:var(--fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.newbar-x{flex:none;width:44px;color:var(--fg2);font-size:14px}
.sec-title .cl-sum{margin-left:8px;font-weight:400;opacity:.8}
.cl{padding:4px 16px 6px}
.cl-g{padding:10px 0 6px}
.cl-g+.cl-g{border-top:1px solid var(--line)}
.cl-h{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:700}
.cl-h.new{background:rgba(48,209,88,.18);color:#1a8f3c}
.cl-h.better{background:rgba(10,132,255,.15);color:var(--accent)}
@media(prefers-color-scheme:dark){.cl-h.new{color:var(--green)}}
.cl-list{margin:6px 0 0;padding:0;list-style:none}
.cl-list li{position:relative;padding:6px 0 6px 14px;font-size:15px;line-height:1.5;color:var(--fg)}
.cl-list li:before{content:"";position:absolute;left:2px;top:15px;width:5px;height:5px;border-radius:50%;background:var(--fg2);opacity:.6}
.cl-list li.fresh:before{background:var(--accent);opacity:1}
.cl-new{margin-right:6px;padding:1px 6px;border-radius:6px;background:var(--accent);color:#fff;font-style:normal;font-size:11px;font-weight:700;vertical-align:1px}
.cl-more{display:block;width:100%;padding:11px 0;border-top:1px solid var(--line);color:var(--accent);font-size:14.5px;font-weight:600;text-align:center}
.cl-more:first-child{border-top:0}
.warnbar{display:flex;align-items:center;gap:10px;margin:8px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(255,159,10,.16);font-size:13.5px;line-height:1.4}
.warnbar span{flex:1;min-width:0}
.warnbar-go{flex:none;padding:6px 14px;border-radius:999px;background:var(--accent);color:#fff;font-size:13.5px;font-weight:600}
.item .sub.dim{font-size:12px;opacity:.75;margin-top:1px}
.item .right{font-size:14px;color:var(--fg2);flex:none;max-width:40%;text-align:right}
.item .hi{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:1px;max-width:38%;text-align:right;color:var(--fg)}
.item .hi .hv{display:flex;align-items:center;gap:4px;white-space:nowrap}
.item .hi b{font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.15}
.item .hi small{font-size:10.5px;font-weight:600;color:var(--fg2);white-space:nowrap}
.item .hi i{font-style:normal}
.item .hi .imdb{background:#f5c518;color:#000;font-size:9px;font-weight:800;padding:1px 3px;border-radius:3px;letter-spacing:-.2px}
.item .hi .emo{font-size:14px}
.item .hi .star{color:var(--accent)}
.item .hi.good b{color:#1f9d45}.item .hi.mid b{color:#c77700}.item .hi.bad b{color:#d63a31}
.item .hi.none b{color:var(--fg2);font-weight:600}
.item .hi.none .emo{filter:grayscale(1);opacity:.6}.item .hi.none .imdb{opacity:.5}
.item .hi.money b,.item .hi.cinemas b,.item .hi.date b{color:var(--fg)}
@media(prefers-color-scheme:dark){.item .hi.good b{color:#30d158}.item .hi.mid b{color:#ffb340}.item .hi.bad b{color:#ff6961}}
.pill{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.5;vertical-align:middle;white-space:nowrap}
.pill.now{background:rgba(48,209,88,.2);color:#1f9d45}
.pill.off{background:rgba(255,69,58,.18);color:#d63a31}
.pill.few{background:rgba(255,204,0,.28);color:#8a6d00}
@media(prefers-color-scheme:dark){.pill.few{color:#ffd60a}}
.pill.soon{background:rgba(255,159,10,.2);color:#c77700}
@media(prefers-color-scheme:dark){.pill.now{color:#30d158}.pill.off{color:#ff6961}.pill.soon{color:#ffb340}}
.item .title .pill{position:relative;top:-2px}
.item.kv .right .pill{margin-left:0;font-size:12px;padding:2px 9px}
.item.kv .body{flex:0 0 auto}
.item.kv .right{flex:1 1 auto;max-width:none;min-width:0;white-space:nowrap;overflow:hidden}
.item .badge{flex:none;font-size:12px;padding:2px 8px;border-radius:999px;background:var(--chip);color:var(--chip-fg)}
.item .chev{color:var(--fg2);opacity:.55;font-size:22px;line-height:1;flex:none}
.item .title.tagged{display:block;overflow:visible;-webkit-line-clamp:unset;text-overflow:clip}
.item .sel{flex:none;font:inherit;font-size:16px;color:var(--accent);background:var(--bg);border:0;border-radius:10px;padding:7px 10px;-webkit-appearance:menulist-button;appearance:auto}
.item.muted .title,.item.muted .sub{color:var(--fg2)}
.item.accent .title{color:var(--accent)}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px}
.chip{display:flex;flex-direction:column;align-items:center;min-width:84px;padding:8px 12px;border-radius:12px;background:var(--chip);color:var(--chip-fg)}
.chip:active{opacity:.6}
.chip .l{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.chip .s{font-size:11px;color:var(--fg2);margin-top:2px}
.chip.muted{opacity:.45}
.chip.warn{outline:1.5px solid var(--orange)}
.chips.scroll{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.chips.scroll::-webkit-scrollbar{display:none}
.chips.scroll .chip{flex:0 0 auto;min-width:72px}
.chips.scroll .chip .l{white-space:nowrap}
.sortbar{display:flex;align-items:center;gap:6px;padding:0;margin-top:6px}
.sortbar .lbl{flex:none;font-size:13px;font-weight:600;color:var(--fg2)}
.sortbar .chips{flex:1;min-width:0;padding:6px 0}
.sortbar .chips.scroll .chip{min-width:0;padding:7px 12px}
.sortbar .dir{flex:none;display:flex;align-items:center;gap:4px;padding:5px 7px 5px 9px;border-radius:10px;background:var(--card);color:var(--accent);font-size:12.5px;font-weight:600;white-space:nowrap;box-shadow:0 0 0 1px rgba(128,128,128,.25)}
.sortbar .dir .arrows{display:flex;flex-direction:column;line-height:1;font-size:7.5px;gap:1px}
.sortbar .dir .arrows i{font-style:normal;color:var(--fg2);opacity:.35}
.sortbar .dir.asc .up,.sortbar .dir.desc .down{color:var(--accent);opacity:1}
.sortbar .dir:active{opacity:.6}
.sortbar.more .chips{-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 30px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 30px),transparent)}
.sortbar .more-hint{display:none;flex:none;margin-left:-4px;font-size:17px;font-weight:700;line-height:1;color:var(--fg2)}
.sortbar.more .more-hint{display:block}
.chips.tabs{flex-wrap:nowrap;gap:6px}
.chips.tabs .chip{flex:1 1 0;min-width:0;padding:9px 2px}
.chips.tabs .chip .l{font-size:15px;white-space:nowrap}
.btn{display:block;width:100%;padding:14px;border-radius:14px;text-align:center;font-size:17px;font-weight:600;margin-top:16px}
.btn.primary{background:var(--accent);color:#fff}
.btn.secondary{background:var(--card);color:var(--accent)}
.btn.danger{background:var(--card);color:var(--red)}
.btn:active{opacity:.7}
.note{margin:10px 12px 0;font-size:13px;color:var(--fg2);white-space:pre-line}
.steps{background:var(--card);border-radius:14px;margin:8px 0;overflow:hidden}
.step{display:flex;align-items:center;gap:12px;padding:14px 14px;border-bottom:1px solid var(--line)}
.step:last-child{border-bottom:0}
.step-n{flex:none;width:24px;height:24px;border-radius:12px;background:var(--accent);color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
.step-ico{flex:none;width:44px;height:44px;border-radius:11px;background:var(--chip);display:flex;align-items:center;justify-content:center;color:var(--accent)}
.step-ico svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.step-ico svg circle{fill:currentColor;stroke:none}
.step-body{flex:1;min-width:0}
.step-t{font-size:16px;font-weight:600}
.step-s{font-size:13px;color:var(--fg2);margin-top:2px}
.group>.note{margin:0;padding:13px 16px;font-size:14px;line-height:1.45}
.group>.note+.note{padding-top:0}
.nt-form>.note{margin:0 0 10px}
.nt-form>.note:first-child{margin-top:8px}
.note.version{padding:6px 0;-webkit-user-select:none;user-select:none}
.note.version:active{opacity:.5}
.item .act{flex:none;width:40px;height:40px;margin:-4px -6px -4px 0;border-radius:20px;font-size:17px;color:var(--fg2);background:transparent}
.item .act:active{background:var(--line)}
.item.head{background:var(--chip)}
.item.head .title{font-size:18px;font-weight:700}
.auto-more{display:block;width:100%;padding:18px 14px 26px;text-align:center;font-size:13px;color:var(--fg2);background:transparent}
.para{padding:12px 14px;font-size:15px;line-height:1.6;white-space:pre-line}
.para .dim{margin-top:8px;font-size:13px;color:var(--fg2)}
.note.warn{color:var(--orange)}
.note.error{color:var(--red)}
.field{display:block;width:100%;padding:12px 14px;border:0;border-radius:12px;background:var(--card);color:var(--fg);font-size:17px;margin-top:8px;outline:none;-webkit-appearance:none;appearance:none}
.field:focus{box-shadow:0 0 0 2px var(--accent)}
.hero{display:flex;gap:14px;align-items:flex-end;margin:12px 4px 4px}
.hero .poster{width:112px;aspect-ratio:2/3;object-fit:cover;border-radius:12px;background:var(--chip);box-shadow:0 4px 14px rgba(0,0,0,.25);flex:none}
.hero .poster.none{box-shadow:none}
.hero .poster.pending{opacity:.5}
.hero-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.hero-line{font-size:14px;color:var(--fg2)}
.ratings{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;overflow:visible}
.rate{display:flex;align-items:center;gap:3px;padding:4px 6px;border-radius:8px;font-size:13.5px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;line-height:1.2}
.rate.good{background:rgba(48,209,88,.18);color:#1f9d45}
.rate.mid{background:rgba(255,159,10,.2);color:#c77700}
.rate.bad{background:rgba(255,69,58,.18);color:#d63a31}
.rate.none{background:var(--chip);color:var(--fg2);opacity:.8}
.rate.none .emo{filter:grayscale(1);opacity:.7}
.rate.none .imdb{opacity:.55}
@media(prefers-color-scheme:dark){.rate.good{color:#30d158}.rate.mid{color:#ffb340}.rate.bad{color:#ff6961}}
.rate .imdb{background:#f5c518;color:#000;font-size:10px;font-weight:800;padding:1.5px 3.5px;border-radius:3.5px;letter-spacing:-.2px}
.rate .emo{font-size:13.5px}
.emo{display:inline-flex;align-items:center}
.emo .ri{width:1.3em;height:1.3em;display:block;flex:none;position:relative;top:-1.5px}
.rate .n{font-size:10px;font-weight:600;opacity:.85}
.rate:active{opacity:.6}
.hero-acts{display:flex;align-items:center;gap:8px;margin-top:8px}
.fav{flex:none;width:34px;height:34px;border-radius:17px;background:var(--chip);color:var(--fg2);font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center}
.fav.on{color:#ff2d55;background:rgba(255,45,85,.14)}
.fav:active{opacity:.6}
.trailer{padding:7px 13px;border-radius:999px;background:#ff0033;color:#fff;font-size:14px;font-weight:600;white-space:nowrap}
.trailer:active{opacity:.7}
.cm{padding:14px 16px}
.cm-top{display:flex;align-items:center;gap:12px}
.cm-avg{flex:none;font-size:28px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap;padding:6px 11px;border-radius:12px;background:var(--chip);color:var(--fg)}
.cm-avg small{font-size:12px;font-weight:600;opacity:.8;margin-left:2px}
.cm-avg.good{background:rgba(48,209,88,.18);color:#1f9d45}
.cm-avg.mid{background:rgba(255,159,10,.2);color:#c77700}
.cm-avg.bad{background:rgba(255,69,58,.18);color:#d63a31}
@media(prefers-color-scheme:dark){.cm-avg.good{color:#30d158}.cm-avg.mid{color:#ffb340}.cm-avg.bad{color:#ff6961}}
.cm-meta{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.cm-n{font-size:15px;font-weight:600}
.cm-by{font-size:12px;color:var(--fg2)}
.cm-hist{flex:none;width:96px}
.cm-hist .bars{display:flex;align-items:flex-end;gap:3px;height:32px}
.cm-hist .bars i{flex:1;display:block;border-radius:2px;background:var(--accent);opacity:.85}
.cm-hist .bars i.zero{opacity:.18}
.cm-hist .axis{display:flex;justify-content:space-between;font-size:10px;color:var(--fg2);margin-top:2px}
.cm-empty{font-size:15px;font-weight:600}
.cm-mine{display:flex;align-items:baseline;gap:10px;margin-top:10px;font-size:15px;font-weight:600}
.cm-mine.line{margin-top:13px;padding-top:11px;border-top:1px solid var(--line)}
.cm-mine.fold{width:100%;text-align:left;color:var(--fg)}
.cm-mine.fold .cm-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-mine.fold i{flex:none;font-style:normal;font-weight:400;font-size:13px;color:var(--accent)}
.cm-mine b{color:var(--accent);font-weight:700}
.cm-mine em{font-style:normal;font-weight:400;font-size:13px;color:var(--fg2)}
.cm-pick{display:flex;gap:4px;margin-top:8px}
.cm-num{flex:1 1 0;min-width:0;height:38px;padding:0;text-align:center;border-radius:9px;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--chip);color:var(--fg2)}
.cm-num.on{background:var(--accent);color:#fff}
.cm-num:active{transform:scale(.92)}
.cm-ends{display:flex;justify-content:space-between;margin-top:5px;font-size:11.5px;color:var(--fg2)}
.cm-toptags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.cm-toptags span{font-size:12.5px;padding:3px 9px;border-radius:999px;background:var(--chip);color:var(--fg)}
.cm-toptags b{font-weight:700;color:var(--fg2);font-variant-numeric:tabular-nums}
.cm-tagbar{display:flex;align-items:baseline;gap:10px;width:100%;margin-top:12px;padding:11px 0 0;border-top:1px solid var(--line);text-align:left;font-size:15px;font-weight:600;color:var(--fg)}
.cm-tagbar em{flex:1;min-width:0;font-style:normal;font-weight:400;font-size:13px;color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-tagbar i{flex:none;font-style:normal;font-weight:400;font-size:13px;color:var(--accent)}
.cm-tags{margin-top:8px}
.en-watch{margin:0;padding:12px 16px 14px}
.en-watch .cm-tagrow+.cm-tagrow{margin-top:16px}
.en-btns{padding-top:10px}
.cm-tagrow{margin-top:8px}
.cm-taghead{display:block;font-size:11.5px;color:var(--fg2);margin-bottom:5px}
.cm-tagset{display:flex;flex-wrap:wrap;gap:6px}
.cm-tag{font-size:14px;padding:6px 11px;border-radius:999px;background:var(--chip);color:var(--fg)}
.cm-tag.on{background:var(--accent);color:#fff;font-weight:600}
.cm-tag:active{transform:scale(.94)}
.cm-tagnote{margin-top:9px;font-size:11.5px;color:var(--fg2)}
.cm-tagask{display:block;margin-top:8px;padding:0;font-size:13px;color:var(--accent)}
.nt-form{padding:4px 16px 14px}
.nt-form .field{background:var(--chip)}
.nt-form .btn{margin-top:10px}
.nt-check{display:flex;align-items:center;gap:9px;width:100%;margin-top:10px;padding:4px 0;text-align:left;font-size:15px;color:var(--fg)}
.nt-check i{flex:none;width:22px;height:22px;border-radius:6px;border:1.5px solid var(--fg2);display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;font-style:normal;font-size:13px;font-weight:800;line-height:1;color:#fff}
.nt-check.on i{background:var(--accent);border-color:var(--accent)}
.nt-check em{flex:1;min-width:0;font-style:normal;font-size:12px;color:var(--fg2)}
.nt-list{padding:0 16px}
.nt{padding:12px 0;border-top:1px solid var(--line)}
.nt:first-child{border-top:0}
.nt-head{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--fg2)}
.nt-score{font-weight:700;font-variant-numeric:tabular-nums;padding:1px 7px;border-radius:6px;background:var(--chip);color:var(--fg)}
.nt-score.good{background:rgba(48,209,88,.18);color:#1f9d45}
.nt-score.mid{background:rgba(255,159,10,.2);color:#c77700}
.nt-score.bad{background:rgba(255,69,58,.18);color:#d63a31}
@media(prefers-color-scheme:dark){.nt-score.good{color:#30d158}.nt-score.mid{color:#ffb340}.nt-score.bad{color:#ff6961}}
.nt-sp{padding:1px 7px;border-radius:6px;background:rgba(255,159,10,.2);color:#c77700;font-weight:600}
@media(prefers-color-scheme:dark){.nt-sp{color:#ffb340}}
.nt-date{flex:1}
.nt-rep{flex:none;font-size:12px;color:var(--fg2);padding:4px 0 4px 10px}
.nt-rep.done{opacity:.6}
.nt-text{margin-top:6px;font-size:15.5px;line-height:1.5;overflow-wrap:anywhere}
.nt-meta{margin-top:5px;font-size:12px;color:var(--fg2);overflow-wrap:anywhere}
.nt-acts{display:flex;gap:8px;margin-top:9px}
.nt-acts button{padding:7px 14px;border-radius:9px;background:var(--chip);color:var(--accent);font-size:14px;font-weight:600}
.nt-acts button.danger{color:#ff3b30;margin-left:auto}
.fb-area{display:block;width:100%;min-height:120px;padding:12px 14px;border:0;border-radius:12px;background:var(--chip);color:var(--fg);font:inherit;font-size:16px;line-height:1.5;margin-top:10px;outline:none;resize:vertical;-webkit-appearance:none;appearance:none}
.wt-pick{position:relative;display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;background:var(--chip);color:var(--fg);overflow:hidden}
.wt-pick.on{box-shadow:0 0 0 1.5px var(--accent) inset}
.wt-ico{flex:none;font-size:18px;line-height:1}
.wt-text{flex:1;min-width:0;font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}
.wt-pick:not(.on) .wt-text{color:var(--accent)}
.wt-hint{flex:none;font-size:12px;color:var(--fg2)}
.wt-pick input{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;font-size:16px;-webkit-appearance:none;appearance:none}
.wt-quick{margin-top:8px}
.fb-area.note{min-height:96px;margin-top:8px}
.fb-cats{display:flex;flex-wrap:wrap;gap:6px}
.fb-tag{font-size:12px;font-weight:600;padding:1px 7px;border-radius:6px;background:var(--chip);color:var(--fg)}
.fb-tag.new{background:rgba(10,132,255,.16);color:var(--accent)}
.fb-tag.doing{background:rgba(255,159,10,.2);color:#c77700}
.fb-tag.done{background:rgba(48,209,88,.18);color:#1f9d45}
@media(prefers-color-scheme:dark){.fb-tag.doing{color:#ffb340}.fb-tag.done{color:#30d158}}
.fb-text{margin-top:6px;font-size:15.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.fb-reply{margin-top:9px;padding:10px 12px;border-radius:10px;background:var(--chip);font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.fb-reply b{display:block;font-size:12px;color:var(--accent);margin-bottom:3px}
.av{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;color:#fff;font-size:13px;font-weight:700;line-height:1}
.av.emo{font-size:14px;font-weight:400}
.nt-by.inline .av.emo{font-size:11px}
.pf-prev{display:flex;justify-content:center;margin:6px 0 16px}
.pf-prev .av.big{width:92px;height:92px;font-size:40px}
.pf-prev .av.big.emo{font-size:50px}
.em-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
.em-grid .em{width:100%;height:auto;aspect-ratio:1}
.em.add{font-size:22px;color:var(--accent);background:none;box-shadow:0 0 0 1.5px var(--line) inset}
.em-del{display:block;margin-top:10px;padding:0;font-size:13px;color:var(--fg2);text-decoration:underline}
.sw-row{display:flex;justify-content:space-between;align-items:center;gap:4px;margin-top:18px}
.sw.pick{position:relative;flex:none;overflow:hidden;background:conic-gradient(#ff3b30,#ff9500,#ffcc00,#34c759,#00c7be,#007aff,#af52de,#ff2d55,#ff3b30)}
.sw.pick input{position:absolute;inset:-6px;width:200%;height:200%;opacity:0;padding:0;border:0}
.sw-note{margin-top:8px;font-size:12.5px;color:var(--fg2);text-align:right}
.em{display:inline-flex;align-items:center;justify-content:center;padding:0;width:40px;height:40px;border-radius:10px;background:var(--chip);font-size:21px;line-height:1;color:var(--fg2)}
.em.on{box-shadow:0 0 0 2px var(--accent) inset}
.sw-custom{display:flex;align-items:center;gap:10px;margin-top:10px;font-size:14px;color:var(--fg2)}
.sw-custom.on{color:var(--fg);font-weight:600}
.sw-custom input{width:44px;height:34px;padding:0;border:0;border-radius:8px;background:none}
.pf{padding:16px 16px 12px}
.pf-top{display:flex;align-items:center;gap:16px}
.av.big{width:76px;height:76px;font-size:34px}
.av.big.emo{font-size:42px}
.pf-body{min-width:0;flex:1}
.pf-name{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;font-size:19px;font-weight:700;line-height:1.25;overflow-wrap:anywhere}
.pf-nums{display:flex;gap:4px;margin-top:8px}
.pf-stat{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-start;padding:0;text-align:left;color:var(--fg)}
.pf-stat b{font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.15;color:var(--fg)}
.pf-stat span{font-size:12.5px;color:var(--fg2);white-space:nowrap}
.pf-bio{margin-top:12px;font-size:15px;line-height:1.45;overflow-wrap:anywhere}
.pf-note{margin-top:8px;font-size:12px;color:var(--fg2);overflow-wrap:anywhere}
.pf-mutual{display:flex;align-items:center;gap:9px;width:100%;margin-top:12px;padding:0;text-align:left;font-size:13px;color:var(--fg2);line-height:1.35}
.pf-faces{flex:none;display:inline-flex}
.pf-faces .av{width:26px;height:26px;font-size:13px;margin-left:-8px;box-shadow:0 0 0 2px var(--card)}
.pf-faces .av:first-child{margin-left:0}
.pf-faces .av.emo{font-size:15px}
.pf-btns{display:flex;gap:8px;padding:0 16px 16px}
.pf-btn{text-align:center;flex:1 1 0;min-width:0;height:36px;padding:0 10px;border-radius:10px;background:var(--chip);color:var(--fg);font-size:14.5px;font-weight:600;white-space:nowrap}
.pf-btn.go{background:var(--accent);color:#fff}
.pf-btn.icon{flex:none;width:40px;font-size:16px;font-weight:400}
.pf-btn.so-btn{flex:none;width:40px;padding:0;display:inline-flex;align-items:center;justify-content:center}
.pf-btn.so-btn .so{width:21px;height:21px}
.so{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;vertical-align:middle;color:var(--fg)}
.so svg{width:100%;height:100%;fill:currentColor}
.pf-handle{display:flex;align-items:center;gap:8px;margin-top:8px;padding:0 12px;height:44px;border-radius:10px;background:var(--chip)}
.pf-handle>span:not(.so){flex:none;font-size:14px;color:var(--fg2);white-space:nowrap}
.pf-handle input{flex:1;min-width:0;height:100%;border:0;background:none;color:var(--fg);font-size:16px;outline:none}
.at{display:inline;padding:0;font:inherit;color:var(--accent);font-weight:600}
.ac-mark.mention{background:#8e5cf7}
.ac-mark.request{background:#ff9f0a}
.ac-mark.accepted{background:#30b158}
.ac-nb{white-space:nowrap}
.ac.req{flex-wrap:wrap;row-gap:10px}
.ac-acts{flex:0 0 100%;display:flex;gap:8px;box-sizing:border-box;padding-left:56px}
.ac-acts .ac-btn{flex:1 1 0;max-width:150px;text-align:center}
.us-lock{margin-left:5px;font-style:normal;font-size:11px}
.pf-lock{padding:26px 22px;text-align:center}
.pf-lock div{font-size:34px;line-height:1}
.pf-lock b{display:block;margin-top:10px;font-size:17px}
.pf-lock p{margin:8px 0 0;font-size:14px;line-height:1.5;color:var(--fg2)}
.pf-btn:active{opacity:.7}
.us-main{display:flex;align-items:center;gap:10px;flex:1;min-width:0;text-align:left;color:var(--fg);padding:4px 0}
.us-name{font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.us-sub{flex:none;font-size:13px;color:var(--fg2)}
.us-follow{flex:none;margin-left:10px;padding:6px 14px;border-radius:999px;background:var(--accent);color:#fff;font-size:14px;font-weight:600}
.us-follow.on{background:var(--chip);color:var(--fg2)}
.sw{flex:none;width:32px;height:32px;padding:0;border-radius:50%;border:3px solid transparent}
.sw.on{border-color:var(--fg);box-shadow:0 0 0 2px var(--card) inset}
.nt-by{display:flex;align-items:center;gap:7px;margin-bottom:6px;font-size:14px;font-weight:600;color:var(--fg)}
.nt-by.inline{display:inline-flex;margin:0;font-size:12px;gap:5px;min-width:0}
.nt-by.inline .av{width:18px;height:18px;font-size:10px}
.nt-by.inline span:not(.av){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:9em}
.nt-by em{font-style:normal;font-weight:400;color:var(--accent)}
.en-title{flex:1;min-width:0;font-size:16px;font-weight:600;color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.en-list{padding:2px 16px}
.en{display:flex;align-items:flex-start;gap:13px;padding:13px 0}
.en+.en{border-top:1px solid var(--line)}
.en-poster{flex:none;padding:0;width:52px;height:78px;border-radius:7px;overflow:hidden;background:var(--chip)}
.en-poster .thumb{display:block;width:52px;height:78px;border-radius:7px;object-fit:cover}
.en-poster .thumb.none{background:var(--chip)}
.en-body{flex:1;min-width:0}
.en-top{display:flex;align-items:center;gap:8px;min-height:26px}
.en-top .nt-score{flex:none}
.en-top .nt-rep{flex:none}
.en-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-top:3px;font-size:12.5px;color:var(--fg2)}
.en-note{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;width:100%;margin-top:7px;padding:0;text-align:left;font-size:14.5px;line-height:1.45;color:var(--fg);overflow-wrap:anywhere}
.en-note .nt-sp{margin-right:6px;font-style:normal;font-size:11.5px}
.en-note:active{opacity:.6}
.en-cover{display:inline-block;margin-top:7px;padding:4px 10px;border-radius:8px;background:var(--chip);color:var(--fg2);font-size:12.5px}
.cm-hist.wide{width:100%}
.cm-hist.wide .bars{height:56px}
.cmt-new{display:flex;align-items:center;gap:10px;width:100%;padding:12px 16px;text-align:left}
.cmt-new-box{flex:1;min-width:0;padding:10px 14px;border-radius:18px;background:var(--chip);color:var(--fg2);font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmt-new i{flex:none;font-style:normal;font-size:14px;font-weight:600;color:var(--accent)}
.hid{display:none}
.cmt-new-box.draft{color:var(--fg)}
.nt-form .fb-area.note{min-height:64px;margin-top:8px}
.cmt-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin-top:8px}
.cmt-row .sp{flex:1}
.cmt-row button{padding:7px 0;font-size:14px;color:var(--fg2)}
.cmt-row button.danger{color:#ff3b30}
.cmt-row button.go{padding:7px 18px;border-radius:999px;background:var(--accent);color:#fff;font-weight:600}
.cmt-spoil{display:inline-flex;align-items:center;gap:7px}
.cmt-spoil i{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--fg2);font-style:normal;font-size:13px;font-weight:800;line-height:17px;text-align:center;color:#fff}
.cmt-spoil.on{color:var(--fg)}
.cmt-spoil.on i{background:var(--accent);border-color:var(--accent)}
.cmt-bar{display:flex;align-items:center;gap:8px;padding:12px 16px 4px}
.cmt-filters{display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0}
.cmt-filters .cm-tag{font-size:13px;padding:5px 11px}
.cmt-bar .sel{flex:none;max-width:9.5em;font-size:13px}
.cmt-quiet{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:10px 16px 2px;font-size:12.5px;color:var(--fg2)}
.cmt-quiet button{display:inline-flex;align-items:center;gap:5px;color:var(--fg);font-size:13px}
.cmt-quiet .av{width:18px;height:18px;font-size:10px}
.cmt-quiet b{font-weight:600;color:var(--fg2)}
.cmt-list{padding:10px 16px 14px}
.cmt{display:flex;align-items:flex-start;gap:9px;margin-top:12px}
.cmt:first-child{margin-top:0}
.cmt-foot{align-items:center}
.cmt-vote{margin-left:auto;display:inline-flex;align-items:center;gap:2px}
.cmt-foot .cmt-vote .vb{width:34px;height:28px;padding:0;font-size:15px;line-height:28px;text-align:center;color:var(--fg2);opacity:.75;font-weight:400}
.cmt-foot .cmt-vote .vb.off{opacity:.2}
.cmt-foot .cmt-vote .vb.up{color:#ff6a00;opacity:1}
.cmt-foot .cmt-vote .vb.down{color:#5e7bff;opacity:1}
.cmt-vote b{min-width:1.6em;text-align:center;font-size:13.5px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--fg2)}
.cmt-vote b.pos{color:#ff6a00}
.cmt-vote b.neg{color:#5e7bff}
.cmt-av{flex:none;padding:0;line-height:0}
.cmt-av .av{width:34px;height:34px;font-size:16px}
.cmt-av .av.emo{font-size:20px}
.av.anon{background:var(--chip);color:var(--fg2);font-weight:600}
.cmt-main{flex:1;min-width:0}
.cmt-bub{display:inline-block;max-width:100%;padding:9px 13px;border-radius:16px;background:var(--chip)}
.cmt.mine .cmt-bub{box-shadow:0 0 0 1.5px var(--accent) inset}
.cmt-head{display:flex;flex-wrap:wrap;align-items:center;gap:4px 7px;font-size:12px}
.cmt-name{font-size:14px;font-weight:700;color:var(--fg);padding:0;max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmt-name.dim{color:var(--fg2);font-weight:600}
.cmt-text{margin-top:3px;font-size:15.5px;line-height:1.45;overflow-wrap:anywhere}
.cmt-bub .nt-cover{background:var(--card);margin-top:5px}
.cmt-foot{display:flex;flex-wrap:wrap;gap:4px 12px;margin:4px 0 0 13px;font-size:12px;color:var(--fg2)}
.cmt-foot button{padding:0;font-size:12px;font-weight:600;color:var(--fg2)}
.cmt-foot .f{color:var(--accent)}
.cmt-foot .warn{color:var(--orange)}
.pf-tag{flex:none;padding:2px 8px;line-height:1.3;border-radius:999px;font-size:11.5px;font-weight:600;background:var(--chip);color:var(--fg2)}
.pf-tag.good{background:rgba(48,209,88,.18);color:#1f9d45}
.pf-tag.warn{background:rgba(255,159,10,.2);color:#c77700}
.pf-tag.bad{background:rgba(255,69,58,.18);color:#d63a31}
@media(prefers-color-scheme:dark){.pf-tag.good{color:#30d158}.pf-tag.warn{color:#ffb340}.pf-tag.bad{color:#ff6961}}
.pf-sub{margin-top:2px;font-size:13px;color:var(--fg2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th.focus{margin:8px -8px 0;padding:10px 8px 6px;border-radius:12px;background:rgba(10,132,255,.12);box-shadow:0 0 0 1.5px var(--accent) inset}
.us-days{padding:4px 16px 10px}
.us-day{padding:12px 0}
.us-day+.us-day{border-top:1px solid var(--line)}
.us-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:15px}
.us-top span{color:var(--fg2);font-size:13.5px;font-variant-numeric:tabular-nums}
.us-bar{height:6px;margin:8px 0 6px;border-radius:3px;background:var(--chip);overflow:hidden}
.us-bar i{display:block;height:100%;border-radius:3px;background:var(--accent)}
.us-bar i.warn{background:#ff9f0a}
.us-bar i.bad{background:#ff453a}
.us-sub2{font-size:12.5px;line-height:1.5;color:var(--fg2);overflow-wrap:anywhere}
.us-hours{display:flex;align-items:flex-end;gap:2px;height:54px;margin-top:10px}
.us-hours i{flex:1 1 0;min-width:0;border-radius:2px 2px 0 0;background:var(--accent);opacity:.55}
.us-hours i.peak{opacity:1}
.us-hax{display:flex;justify-content:space-between;margin:3px 0 4px;font-size:10.5px;color:var(--fg2)}
.lb-pick{display:block;position:relative;overflow:hidden;text-align:center;text-decoration:none;box-sizing:border-box}
.lb-pick input{position:absolute;inset:0;width:100%;height:100%;opacity:0}
.lb-steps{margin:0;padding:14px 16px 0 34px;font-size:14.5px;line-height:1.6;color:var(--fg)}
.lb-steps li{margin:4px 0}
.lb-prog{padding:22px 16px;text-align:center;font-size:15px;color:var(--fg2)}
.lb-prog b{display:block;margin-bottom:10px;font-size:22px;color:var(--fg);font-variant-numeric:tabular-nums}
.lb-list{padding:0 16px 6px}
.lb{display:flex;gap:11px;padding:12px 0}
.lb+.lb{border-top:1px solid var(--line)}
.lb.off .lb-top,.lb.off .lb-sub,.lb.off .lb-x{opacity:.45}
.lb-ck{flex:none;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:26px;height:26px;margin-top:1px;padding:0;border-radius:8px;border:1.5px solid var(--line);color:#fff;line-height:0}
.lb-ck svg{display:block}
.lb-ck.on{background:var(--accent);border-color:var(--accent)}
.lb-body{flex:1;min-width:0}
.lb-top{display:flex;align-items:baseline;gap:8px}
.lb-top b{flex:1;min-width:0;font-size:16px;overflow-wrap:anywhere}
.lb-sub{margin-top:2px;font-size:12.5px;color:var(--fg2);overflow-wrap:anywhere}
.lb-x{display:block;width:100%;margin-top:7px;padding:9px 11px;border-radius:10px;background:var(--chip);color:var(--fg);font-size:14.5px;line-height:1.5;text-align:left;overflow-wrap:anywhere}
.lb-x.clamp span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.lb-x i{display:block;margin-top:4px;font-style:normal;font-size:12.5px;color:var(--accent)}
.lb-x.dim{opacity:.5}
.lb-have{margin-top:9px;padding:9px 11px;border-radius:10px;border:1px solid var(--line)}
.lb-haveline{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--fg2)}
.lb-havex{margin-top:5px;font-size:13.5px;line-height:1.45;color:var(--fg2);overflow-wrap:anywhere}
.lb-seg{display:flex;margin-top:9px;padding:2px;border-radius:9px;background:var(--chip)}
.lb-seg button{flex:1 1 0;min-width:0;padding:6px 4px;border-radius:7px;font-size:13px;color:var(--fg2);white-space:nowrap}
.lb-seg button.on{background:var(--card);color:var(--fg);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.25)}
.lb-edit{margin-top:8px}
.lb-edit textarea{display:block;width:100%;box-sizing:border-box;min-height:120px;margin:0}
.lb-opts{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.lb-opts .cm-tag{padding:4px 10px;font-size:12.5px}
.lb-bar{display:flex;flex-wrap:wrap;gap:6px;padding:12px 16px 2px}
.nb{display:flex;align-items:center;gap:10px;margin:0 16px 14px;padding:11px 12px;border-radius:14px;background:rgba(10,132,255,.14)}
.nb-top{margin-top:12px}
.nb-i{flex:none;font-size:18px;line-height:1}
.nb-t{flex:1;min-width:0;font-size:13.5px;line-height:1.4;color:var(--fg)}
.nb-go{flex:none;padding:6px 13px;border-radius:999px;background:var(--accent);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap}
.nb-x{flex:none;padding:4px 2px 4px 4px;font-size:13px;color:var(--fg2)}
.nb-ask{padding:22px 20px 6px;text-align:center}
.nb-ico{font-size:44px;line-height:1}
.nb-ask b{display:block;margin-top:12px;font-size:19px}
.nb-ask p{margin:10px 0 0;font-size:14.5px;line-height:1.55;color:var(--fg2)}
.nb-ask .nb-warn{color:#ff9f0a}
.sc{display:flex;align-items:center;gap:13px;box-sizing:border-box;width:100%;margin:18px 0 0;padding:14px 14px 14px 16px;border-radius:16px;text-align:left;color:var(--fg);background:linear-gradient(135deg,rgba(10,132,255,.22),rgba(94,92,230,.18));box-shadow:0 0 0 1px rgba(10,132,255,.28) inset}
.sc:active{opacity:.7}
.sc-ico{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);font-size:22px;line-height:1}
.sc-body{flex:1;min-width:0;display:block}
.sc-body b{display:block;font-size:16.5px;font-weight:700}
.sc-body span{display:block;margin-top:2px;font-size:13px;line-height:1.4;color:var(--fg2)}
.sc-go{flex:none;padding:8px 17px;border-radius:999px;background:var(--accent);color:#fff;font-size:15px;font-weight:700;white-space:nowrap}
@media(prefers-color-scheme:light){.sc{background:linear-gradient(135deg,rgba(10,132,255,.12),rgba(94,92,230,.1))}.sc-ico{background:rgba(10,132,255,.14)}}
.sp-list{padding:6px 16px 2px}
.sp{display:flex;align-items:flex-start;gap:12px;width:100%;padding:13px 0;text-align:left;color:var(--fg)}
.sp+.sp{border-top:1px solid var(--line)}
.sp>i{flex:none;box-sizing:border-box;width:22px;height:22px;margin-top:2px;border-radius:50%;border:1.5px solid var(--fg2)}
.sp.on>i{border:6.5px solid var(--accent)}
.sp-body{flex:1;min-width:0;display:block}
.sp-head{display:flex;align-items:center;gap:8px}
.sp-head b{font-size:16px;font-weight:700}
.sp-head em{font-style:normal;font-size:11.5px;font-weight:600;padding:1px 7px;border-radius:999px;background:var(--chip);color:var(--fg2)}
.sp-head small{margin-left:auto;font-size:12px;color:var(--fg2);font-variant-numeric:tabular-nums}
.sp-text{display:block;margin-top:5px;font-size:14.5px;line-height:1.5;color:var(--fg2);overflow-wrap:anywhere}
.sp.on .sp-text{color:var(--fg)}
.fd-list{padding:4px 16px 6px}
.fd{display:flex;align-items:flex-start;gap:12px;padding:12px 0}
.fd+.fd{border-top:1px solid var(--line)}
.fd-av>.av{width:44px;height:44px;font-size:20px}
.fd-av>.av.emo{font-size:25px}
.fd-av{flex:none;padding:0;width:44px;height:44px}
.fd-body{flex:1;min-width:0}
.fd-line{font-size:15px;line-height:1.5;overflow-wrap:anywhere;color:var(--fg2)}
.fd-line button{display:inline;padding:0;font:inherit;font-weight:700;color:var(--fg)}
.fd-line .nt-score{display:inline-block;margin-left:2px;vertical-align:1px;white-space:nowrap}
.pf-pills{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px}
.pf-pill{display:inline-flex;align-items:center;gap:5px;max-width:100%;min-width:0;padding:3px 10px 3px 8px;border-radius:999px;border:1px solid var(--line);color:var(--fg2);font-size:12.5px;line-height:1.5}
.pf-pill>span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-pill .so{width:13px;height:13px;color:var(--fg2)}
.fd-line em{font-style:normal;white-space:nowrap}
.fd-meta{margin-top:2px;font-size:12.5px;color:var(--fg2)}
.fd-note{display:flex;align-items:flex-end;gap:8px;width:100%;margin-top:8px;padding:9px 12px;border-radius:12px;background:var(--chip);color:var(--fg);font-size:15px;line-height:1.45;text-align:left;overflow-wrap:anywhere}
.fd-note span{flex:1;min-width:0}
.fd-note i{flex:none;font-style:normal;font-size:13px}
.fd-note:active{opacity:.6}
.ac-list{padding:4px 16px 8px}
.ac{display:flex;align-items:center;gap:10px;padding:10px 0}
.ac.fresh{margin:0 -8px;padding:10px 8px;border-radius:12px;background:rgba(10,132,255,.1)}
.ac-main{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:0;text-align:left;color:var(--fg)}
.ac-av{position:relative;flex:none;width:44px;height:44px}
.ac-av>.av{width:44px;height:44px;font-size:20px}
.ac-av>.av.emo{font-size:25px}
.ac-av2{position:absolute;right:-6px;bottom:-4px}
.ac-av2 .av{width:26px;height:26px;font-size:12px;box-shadow:0 0 0 2px var(--card)}
.ac-mark{position:absolute;right:-4px;bottom:-3px;width:19px;height:19px;border-radius:50%;font-style:normal;font-size:10px;line-height:19px;text-align:center;color:#fff;background:var(--fg2);box-shadow:0 0 0 2px var(--card)}
.ac-av2+.ac-mark{right:auto;left:-4px}
.ac-mark.up{background:#ff6a00}
.ac-mark.down{background:#5e7bff}
.ac-mark.reply{background:var(--accent)}
.ac-mark.follow{background:#30b158}
.ac-text{flex:1;min-width:0;font-size:14.5px;line-height:1.4;overflow-wrap:anywhere}
.ac-text b{font-weight:700}
.ac-text em{font-style:normal;color:var(--fg2);white-space:nowrap}
.ac-btn{flex:none;height:32px;padding:0 14px;border-radius:9px;background:var(--chip);color:var(--fg2);font-size:13.5px;font-weight:600;line-height:32px;white-space:nowrap}
.ac-btn.go{background:var(--accent);color:#fff}
.th-list{padding:6px 16px 12px}
.th{padding-top:14px}
.th-head{display:flex;flex-wrap:wrap;align-items:center;gap:4px 7px;font-size:12.5px;color:var(--fg2)}
.th-av{flex:none;padding:0;line-height:0}
.th-av .av{width:28px;height:28px;font-size:14px}
.th-av .av.emo{font-size:17px}
.th-name{padding:0;font-size:14px;font-weight:700;color:var(--fg);max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-name.dim{color:var(--fg2);font-weight:600}
.th-f{color:var(--accent)}
.th-text{margin-top:6px;font-size:16px;line-height:1.5;overflow-wrap:anywhere}
.th.mine>.th-text{border-left:3px solid var(--accent);padding-left:9px}
.th-warn{margin-top:4px;font-size:12px;color:var(--orange)}
.th-gone{padding:4px 0;font-size:13.5px;color:var(--fg2);font-style:italic}
.th-acts{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:4px;color:var(--fg2)}
.ib{display:inline-flex;align-items:center;justify-content:center;width:34px;height:32px;padding:0;border-radius:8px;color:var(--fg2)}
.ib:active{background:var(--chip)}
.ib.on{color:var(--accent)}
.ib.off{opacity:.25}
.ib.up{color:#ff6a00}
.ib.up svg,.ib.down svg{fill:currentColor}
.ib.down{color:#5e7bff}
.th-vote{display:inline-flex;align-items:center}
.th-vote b{min-width:1.5em;text-align:center;font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--fg2)}
.th-vote b.pos{color:#ff6a00}
.th-vote b.neg{color:#5e7bff}
.th-menu{display:flex;justify-content:flex-end;margin-top:2px;font-size:14px;color:var(--fg2)}
.th-menu button{padding:6px 12px;border-radius:9px;background:var(--chip);font-size:14px;color:var(--fg)}
.th-menu button.danger{color:#ff3b30}
.th-reply{margin-top:4px}
.th-reply .fb-area.note{min-height:56px;margin-top:4px}
.th-kids{margin:2px 0 0 13px;padding-left:13px;border-left:2px solid var(--line)}
.th-kids .th{padding-top:12px}
.nt-text.go{display:flex;align-items:flex-end;gap:8px;width:100%;padding:0;text-align:left;color:var(--fg)}
.nt-text.go span{flex:1;min-width:0}
.nt-text.go i{flex:none;font-style:normal;font-size:13px;color:var(--accent);white-space:nowrap}
.nt-text.go:active{opacity:.6}
.nt-cover{display:block;width:100%;margin-top:6px;padding:9px 12px;border-radius:10px;background:var(--chip);color:var(--fg2);font-size:14px;text-align:left}
.cm-star{font-size:28px;line-height:1;padding:2px 3px;color:var(--line)}
@media(prefers-color-scheme:dark){.cm-star{color:#48484a}}
.cm-star.on{color:#ff9f0a}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.cm-star:active{transform:scale(.9)}
.item.long{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 28px);transform:translateX(-50%);z-index:20;background:rgba(40,40,44,.92);color:#fff;
 padding:10px 18px;border-radius:999px;font-size:15px;pointer-events:none;animation:toast 1.8s ease forwards}
@keyframes toast{0%{opacity:0;transform:translate(-50%,8px)}12%,75%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.loading,.empty{text-align:center;color:var(--fg2);padding:72px 20px;white-space:pre-line}
.empty .big{font-size:44px;margin-bottom:8px}
.spinner{width:28px;height:28px;margin:0 auto 14px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
`;

const SHELL = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<style>${CSS}</style></head><body><div id="root"></div>
<script>
window.__pending=null;
function send(id){var vals={};
  document.querySelectorAll('input[name],select[name],textarea[name]').forEach(function(i){vals[i.name]=i.value;});
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
  document.querySelectorAll('input[name],select[name],textarea[name]').forEach(function(i){vals[i.name]=i.value;});
  if(window.__pending){var f=window.__pending;window.__pending=null;f(JSON.stringify({id:id,vals:vals,y:window.scrollY}));}
});
// 捲到指定位置：畫完馬上捲一次，下一個畫面更新時再確認一次（手勢剛結束、或瀏覽器自己想還原位置時，第一次可能被蓋掉）
function scrollKeep(to){window.scrollTo(0,to);if(to>0){var again=function(){if(Math.abs(window.scrollY-to)>2)window.scrollTo(0,to);};
  (window.requestAnimationFrame||setTimeout)(again);setTimeout(again,120);}}
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(_){} // 位置由我們自己還原，瀏覽器不要插手
function stripSync(){var a=document.querySelectorAll('.chips.scroll');for(var i=0;i<a.length;i++){var on=a[i].querySelector('.chip:not(.muted)');if(on)a[i].scrollLeft=Math.max(0,on.offsetLeft-a[i].offsetLeft-(a[i].clientWidth-on.offsetWidth)/2);}}
// 清單底下的「自動載入更多」：快滑到它（還差 900px）就自動觸發一次，不用使用者按
var moreSeen=null;function autoMore(){var el=document.querySelector('.auto-more');if(!el||!window.IntersectionObserver)return;if(moreSeen)moreSeen.disconnect();
  moreSeen=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting&&!es[i].target.dataset.fired){es[i].target.dataset.fired='1';es[i].target.click();}},{rootMargin:'900px 0px'});moreSeen.observe(el);}
// 資料列右邊的內容（發行公司、票房）一行放不下時：字體一點一點縮小到放得下為止（最小 10px；再放不下才換行）
// 清單的片名最多兩行：放不下時字體一點一點縮小到放得下（最小 12px）；還是放不下就放寬到三行
function fitTitles(){var a=document.querySelectorAll('.item:not(.kv) .title');for(var i=0;i<a.length;i++){var el=a[i],size=16;el.style.fontSize='';el.style.webkitLineClamp='';
  if(el.scrollHeight<=el.clientHeight+1)continue;
  while(el.scrollHeight>el.clientHeight+1&&size>12){size-=0.5;el.style.fontSize=size+'px';}
  if(el.scrollHeight>el.clientHeight+1)el.style.webkitLineClamp='3';}}
// 橫向可以滑的那一排（年份、排序）：右邊還有選項時，右緣淡出並顯示一個小小的「›」
function barHints(){var a=document.querySelectorAll('.sortbar .chips');for(var i=0;i<a.length;i++){var el=a[i],p=el.parentNode;
  var more=el.scrollWidth-el.clientWidth-el.scrollLeft>6;if(p&&p.classList)p.classList.toggle('more',more);}}
document.addEventListener('scroll',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('chips'))barHints();},true);
function fitText(){fitTitles();barHints();var a=document.querySelectorAll('.item.kv .right');for(var i=0;i<a.length;i++){var el=a[i],size=14;el.style.fontSize='';el.style.whiteSpace='';
  while(el.scrollWidth>el.clientWidth+1&&size>10){size-=0.5;el.style.fontSize=size+'px';}
  if(el.scrollWidth>el.clientWidth+1){el.style.whiteSpace='normal';el.style.overflow='visible';}}}
setTimeout(autoMore,300);setTimeout(fitText,50);window.addEventListener('resize',fitText);
// 搜尋欄（data-live）：打字停 0.3 秒就送出，結果跟著變，不用按搜尋。輸入法還在選字（注音、拼音）時不送
var liveT=null,composing=false,held=null;
function liveGo(el){clearTimeout(liveT);var go=function(){if(composing||!document.contains(el))return;var id=el.getAttribute('data-live');if(!id)return;
  if(!window.__pending){liveT=setTimeout(go,150);return;} // 上一次的結果還在畫：等一下再送
  send(id);};liveT=setTimeout(go,300);}
function isLive(el){return !!(el&&el.getAttribute&&el.getAttribute('data-live'));}
document.addEventListener('compositionstart',function(){composing=true;});
document.addEventListener('compositionend',function(e){composing=false;if(held){var x=held;held=null;window.__render(x[0],x[1]);}if(isLive(e.target))liveGo(e.target);});
document.addEventListener('input',function(e){if(isLive(e.target)&&!composing)liveGo(e.target);});
// 選檔案（data-file）：把選的檔案讀進記憶體放在 window.__files，再通知 App（檔案只留在這一頁裡，不會上傳）
document.addEventListener('change',function(e){var el=e.target;if(!el||el.type!=='file'||!el.getAttribute||!el.getAttribute('data-file'))return;
  var id=el.getAttribute('data-file'),fs=[].slice.call(el.files||[],0,8);if(!fs.length)return;
  Promise.all(fs.map(function(f){return f.arrayBuffer().then(function(b){return{name:f.name,data:b};});})).then(function(list){window.__files=list;
    var n=0,t=setInterval(function(){if(window.__pending){clearInterval(t);send(id);}else if(++n>60)clearInterval(t);},100);});});
function copyAttrs(from,to){var i,a=to.attributes;for(i=a.length-1;i>=0;i--)to.removeAttribute(a[i].name);a=from.attributes;for(i=0;i<a.length;i++)to.setAttribute(a[i].name,a[i].value);}
// 正在搜尋欄裡打字時重畫：搜尋欄和它外面那幾層留在原地（整個換掉的話游標和鍵盤會不見），只換掉周圍的內容
function renderAround(root,cur,html){var box=document.createElement('div');box.innerHTML=html;
  var neu=box.querySelector('input[data-live][name="'+cur.name+'"]');if(!neu)return false;
  var o=cur,m=neu;while(o!==root&&m!==box){if(o.tagName!==m.tagName)return false;o=o.parentNode;m=m.parentNode;}
  if(o!==root||m!==box)return false; // 新舊畫面的層數不一樣：照一般方式整個重畫
  o=cur;m=neu;copyAttrs(m,o);
  while(o!==root){var po=o.parentNode,pm=m.parentNode;
    while(o.previousSibling)po.removeChild(o.previousSibling);while(o.nextSibling)po.removeChild(o.nextSibling);
    while(pm.firstChild!==m)po.insertBefore(pm.firstChild,o);while(m.nextSibling)po.appendChild(m.nextSibling);
    if(po!==root)copyAttrs(pm,po);o=po;m=pm;}
  return true;}
// 畫面上有 data-jump 的元素＝「捲到這裡」：同一個目標只捲一次（之後重畫不會又被拉回去）
var jumped=null;
function jumpTo(){var t=document.querySelector('[data-jump]');if(!t){jumped=null;return;}var k=t.getAttribute('data-jump');if(jumped===k)return;jumped=k;
  setTimeout(function(){var e=document.querySelector('[data-jump="'+k+'"]');if(e)e.scrollIntoView({block:'center',behavior:'smooth'});},120);}
window.__render=function(html,to){var y=window.scrollY,root=document.getElementById('root'),cur=document.activeElement,typing=isLive(cur)&&root.contains(cur);
  if(typing&&composing){held=[html,to];return;} // 還在選字：選完再畫
  var kept=typing&&renderAround(root,cur,html);if(!kept)root.innerHTML=html;
  stripSync();autoMore();fitText();scrollKeep(to<0?y:to);jumpTo();var f=kept?null:document.querySelector('input[autofocus]');if(f)setTimeout(function(){f.focus()},50);syncHist();};
// iPhone 的毛病：鍵盤收起來（或從別的 App 切回來）之後，畫面有時沒有歸位，整個版面比看得到的範圍高出一截，
// 結果上面的標題列跑到螢幕外、底部的頁籤列浮在畫面中間。發現有這個落差、又沒有在打字時，輕輕捲一下逼它重新對齊
(function(){var vv=window.visualViewport;if(!vv)return;
  function fix(){var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
    if(vv.offsetTop>1||Math.abs(vv.height-window.innerHeight)>1&&vv.scale===1){var y=window.scrollY;window.scrollTo(0,y+1);window.scrollTo(0,y);}}
  function soon(){setTimeout(fix,60);setTimeout(fix,400);setTimeout(fix,1000);}
  vv.addEventListener('resize',soon);
  document.addEventListener('focusout',soon);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)soon();});
  window.addEventListener('pageshow',soon);
})();
// 從螢幕左緣往右滑：回上一頁（等於點左上角的「返回」）。內容會跟著手指稍微移動，放開時滑得夠遠才算
var sw=null;
function swReset(now){sw=null;var c=document.querySelector('.content');if(c){c.style.transition=now?'none':'transform .15s';c.style.transform='';}}
document.addEventListener('touchstart',function(e){var t=e.touches[0];
  var strip=e.target.closest&&e.target.closest('.chips.scroll'); // 在可左右滑的選項列上、而且還能往回捲：那是捲選項，不是返回
  sw=(e.touches.length===1&&t.clientX<32&&document.querySelector('.back')&&!(strip&&strip.scrollLeft>0))?{x:t.clientX,y:t.clientY,t:Date.now()}:null;},{passive:true});
document.addEventListener('touchmove',function(e){if(!sw)return;var t=e.touches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y;
  if(Math.abs(dy)>60&&Math.abs(dy)>dx){swReset();return;}
  var c=document.querySelector('.content');if(c&&dx>8){c.style.transition='none';c.style.transform='translateX('+Math.min(dx*0.4,70)+'px)';}},{passive:true});
document.addEventListener('touchend',function(e){if(!sw)return;var t=e.changedTouches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y,quick=Date.now()-sw.t<900;
  var go=dx>70&&Math.abs(dy)<70&&quick;swReset(go); // 要返回就立刻歸位（不留動畫），跟直接按「返回」完全一樣
  if(go){var b=document.querySelector('.back');if(b)b.click();}});
document.addEventListener('touchcancel',function(){swReset();});
// 網頁版：讓瀏覽器自己的「上一頁」（Safari 的邊緣右滑、Android 的返回鍵）也是回到 App 裡的上一頁，而不是離開網站。
// 做法：畫面上有「返回」時，在瀏覽紀錄裡墊一筆；瀏覽器往回走到這一筆之前，就替使用者按一次「返回」
var histOn=/^https?:/.test(location.protocol),histGuard=false,histSkip=false;
function syncHist(){if(!histOn||document.querySelector('.loading'))return; // 「讀取中」只是過場，不動瀏覽紀錄
  var has=!!document.querySelector('.back');
  try{if(has&&!histGuard){history.pushState({ms:1},'');histGuard=true;}
      else if(!has&&histGuard){histGuard=false;histSkip=true;history.back();}}catch(_){histOn=false;}}
window.addEventListener('popstate',function(){if(histSkip){histSkip=false;return;}
  if(!histGuard)return;histGuard=false;var b=document.querySelector('.back');if(b)b.click();});
// 有 data-fold 的隱藏按鈕＝「滑動就收合」：畫面上出現之後，使用者滑超過 160px、而且沒有正在打字，就替他點一下（由那一頁決定要收什麼）
var foldY=null;
window.addEventListener('scroll',function(){var b=document.querySelector('[data-fold]');if(!b){foldY=null;return;}if(foldY===null){foldY=window.scrollY;return;}
  var a=document.activeElement;if(a&&/^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName))return;
  if(Math.abs(window.scrollY-foldY)>160){foldY=null;b.click();}},{passive:true});
document.addEventListener('keydown',function(e){if(e.key==='Enter'){if(isLive(e.target)){e.target.blur();return;}var b=document.querySelector('[data-enter]');if(b)b.click();}}); // 搜尋欄按 Enter：收起鍵盤（結果早就出來了）
</script></body></html>`;

export class UI {
  private wv = new WebView();
  private ready: Promise<void>;
  private presented: Promise<void> | null = null;
  closed = false;

  constructor() {
    // 海報快取用 data: 網址內嵌，不需要 file:// 讀本機檔，所以照一般方式載入
    this.ready = this.wv.loadHTML(SHELL);
  }

  /** 顯示畫面（不等待點擊），用於讀取中。 */
  /** scrollTo：畫完後捲到哪裡。-1 = 停在原位（同一頁重繪，例如切換廣告時間）；0 = 頂端；其他 = 返回時還原的位置 */
  async render(html: string, scrollTo = 0): Promise<void> {
    await this.ready;
    // 結尾回傳 true：Scriptable 只接受字串／數字／布林等回傳值，不能回傳 undefined 或函式
    await this.wv.evaluateJavaScript(`window.__render(${JSON.stringify(html)},${Math.round(scrollTo)});true`, false);
    if (!this.presented) {
      this.presented = this.wv.present(true).then(() => {
        this.closed = true;
      });
    }
  }

  /** 顯示畫面並等待使用者點擊；回傳被點元素註冊的 handler，使用者關閉視窗時回傳 null。 */
  async show(html: string, scrollTo = 0): Promise<{ handler: Handler; vals: Record<string, string>; y: number } | null> {
    await this.render(html, scrollTo);
    const wait = this.wv.evaluateJavaScript(`window.__pending=function(p){completion(p)};true`, true) as Promise<string>;
    const result = await Promise.race([wait, this.presented!.then(() => null)]);
    if (result === null) return null;
    const { id, vals, y } = JSON.parse(String(result));
    const handler = getHandler(String(id));
    return handler ? { handler, vals: vals || {}, y: Number(y) || 0 } : null;
  }

  /** 畫面下方短暫顯示一行提示（例如「已複製地址」） */
  async toast(text: string): Promise<void> {
    await this.ready;
    await this.wv.evaluateJavaScript(`window.__toast(${JSON.stringify(text)});true`, false);
  }

  /** 每次重繪前清掉舊的 handler。 */
  begin() {
    resetHandlers();
  }

  whenClosed(): Promise<void> {
    return this.presented || Promise.resolve();
  }
}
