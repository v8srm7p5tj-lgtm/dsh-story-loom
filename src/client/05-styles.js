/* 织世 · 纸张、朱砂与墨 */

var CSS = `
.sl-app{
  --sl-paper:#f7f1e5;
  --sl-paper-2:#f1e8d8;
  --sl-paper-3:#eadfcd;
  --sl-panel:rgba(255,252,245,.88);
  --sl-panel-solid:#fbf7ee;
  --sl-ink:#26221d;
  --sl-ink-2:#4d463c;
  --sl-muted:#847966;
  --sl-faint:#a29681;
  --sl-line:#ded1bb;
  --sl-line-soft:rgba(126,110,88,.16);
  --sl-accent:#a63d2f;
  --sl-accent-soft:rgba(166,61,47,.09);
  --sl-accent-line:rgba(166,61,47,.28);
  --sl-jade:#3f6b5c;
  --sl-jade-soft:rgba(63,107,92,.10);
  --sl-gold:#a97b3f;
  --sl-gold-soft:rgba(169,123,63,.12);
  --sl-blue:#516a80;
  --sl-blue-soft:rgba(81,106,128,.10);
  --sl-danger:#a63d2f;
  --sl-shadow:0 18px 50px rgba(64,48,30,.13), 0 3px 10px rgba(64,48,30,.05);
  --sl-radius:14px;
  --sl-serif:"Songti SC","STSong","Noto Serif SC","Source Han Serif SC",serif;
  --sl-sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  position:relative;
  display:flex;
  flex-direction:column;
  height:100%;
  min-height:0;
  overflow:hidden;
  container-type:inline-size;
  color:var(--sl-ink);
  font-family:var(--sl-sans);
  font-size:13px;
  line-height:1.55;
  background:
    radial-gradient(1200px 600px at 18% -10%,rgba(255,255,255,.72),transparent 60%),
    radial-gradient(900px 500px at 95% 110%,rgba(166,61,47,.055),transparent 60%),
    repeating-linear-gradient(0deg,rgba(90,72,48,.018) 0 1px,transparent 1px 4px),
    var(--sl-paper);
  -webkit-font-smoothing:antialiased;
}
body[data-ds-dark-theme] .sl-app,
html[data-ds-theme="dark"] .sl-app,
body[data-theme="dark"] .sl-app{
  --sl-paper:#181917;
  --sl-paper-2:#1e201d;
  --sl-paper-3:#252722;
  --sl-panel:rgba(31,33,29,.9);
  --sl-panel-solid:#20221e;
  --sl-ink:#eee7d9;
  --sl-ink-2:#cfc6b6;
  --sl-muted:#a99e8b;
  --sl-faint:#7f7565;
  --sl-line:#3a3a32;
  --sl-line-soft:rgba(220,205,180,.12);
  --sl-accent:#d87563;
  --sl-accent-soft:rgba(216,117,99,.12);
  --sl-accent-line:rgba(216,117,99,.32);
  --sl-jade:#83b6a2;
  --sl-jade-soft:rgba(131,182,162,.12);
  --sl-gold:#c9a46a;
  --sl-gold-soft:rgba(201,164,106,.12);
  --sl-blue:#8aa8bf;
  --sl-blue-soft:rgba(138,168,191,.12);
  --sl-shadow:0 22px 60px rgba(0,0,0,.36), 0 3px 12px rgba(0,0,0,.28);
  background:
    radial-gradient(900px 500px at 20% -10%,rgba(255,240,210,.035),transparent 60%),
    radial-gradient(800px 500px at 100% 110%,rgba(216,117,99,.04),transparent 60%),
    repeating-linear-gradient(0deg,rgba(255,240,210,.008) 0 1px,transparent 1px 4px),
    var(--sl-paper);
}
.sl-app *{box-sizing:border-box}
.sl-app button,.sl-app input,.sl-app textarea,.sl-app select{font:inherit;color:inherit}
.sl-app button{cursor:pointer}
.sl-app ::selection{background:rgba(166,61,47,.18)}
.sl-app ::-webkit-scrollbar{width:9px;height:9px}
.sl-app ::-webkit-scrollbar-thumb{background:rgba(126,110,88,.26);border-radius:20px;border:3px solid transparent;background-clip:padding-box}
.sl-app ::-webkit-scrollbar-track{background:transparent}
.sl-icon{display:block;flex:none}
.sl-muted{color:var(--sl-muted)}
.sl-faint{color:var(--sl-faint)}
.sl-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none;display:inline-block}
.sl-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:19px;height:19px;padding:0 5px;border:1px solid var(--sl-line);border-radius:5px;font-size:10px;line-height:1;color:var(--sl-faint);background:rgba(255,255,255,.28)}
.sl-seal{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:linear-gradient(145deg,#b64a3a,#8f2f25);color:#f9efdd;box-shadow:0 4px 10px rgba(143,47,37,.24),inset 0 0 0 1px rgba(255,255,255,.18);transform:rotate(-2deg);flex:none}
.sl-seal-inner{font-family:var(--sl-serif);font-size:19px;font-weight:600;line-height:1;letter-spacing:0}
.sl-pill{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;font-size:10.5px;line-height:1.7;white-space:nowrap;border:1px solid transparent}
.sl-tone-jade{color:var(--sl-jade);background:var(--sl-jade-soft);border-color:rgba(63,107,92,.18)}
.sl-tone-red{color:var(--sl-accent);background:var(--sl-accent-soft);border-color:var(--sl-accent-line)}
.sl-tone-gold{color:var(--sl-gold);background:var(--sl-gold-soft);border-color:rgba(169,123,63,.2)}
.sl-tone-blue{color:var(--sl-blue);background:var(--sl-blue-soft);border-color:rgba(81,106,128,.2)}
.sl-tone-gray{color:var(--sl-muted);background:rgba(126,110,88,.08);border-color:var(--sl-line-soft)}
.sl-tag{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:5px;font-size:10.5px;color:var(--sl-muted);background:rgba(126,110,88,.075);border:1px solid var(--sl-line-soft);white-space:nowrap}
.sl-tag-removable{padding-right:2px}
.sl-tag-x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--sl-faint)}
.sl-tag-x:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--sl-line);background:rgba(255,252,245,.55);color:var(--sl-ink-2);font-size:12px;line-height:1;white-space:nowrap;transition:background .15s,border-color .15s,color .15s,transform .15s}
.sl-btn:hover{border-color:var(--sl-accent-line);color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-btn:active{transform:translateY(1px)}
.sl-btn.primary{background:linear-gradient(145deg,#b44737,#953326);border-color:transparent;color:#fff8ea;box-shadow:0 4px 12px rgba(149,51,38,.18)}
.sl-btn.primary:hover{color:#fff;filter:brightness(1.04)}
.sl-btn.ghost{border-color:transparent;background:transparent;color:var(--sl-muted)}
.sl-btn.ghost:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-btn.danger{color:var(--sl-accent);border-color:var(--sl-accent-line)}
.sl-btn.danger:hover{background:var(--sl-accent);color:#fff}
.sl-btn.small{height:26px;padding:0 9px;font-size:11px;border-radius:7px}
.sl-btn.icon{width:30px;padding:0}
.sl-btn:disabled{opacity:.45;pointer-events:none}
.sl-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--sl-muted);flex:none}
.sl-icon-btn:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-icon-btn.active{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-icon-btn:disabled{opacity:.35;pointer-events:none}

/* 顶栏 */
.sl-top{height:54px;flex:none;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid var(--sl-line);background:linear-gradient(180deg,rgba(255,252,245,.45),rgba(255,252,245,.12));position:relative;z-index:20}
body[data-ds-dark-theme] .sl-top,html[data-ds-theme="dark"] .sl-top{background:linear-gradient(180deg,rgba(255,240,210,.025),transparent)}
.sl-top-left{display:flex;align-items:center;gap:10px;min-width:0}
.sl-brand{display:flex;align-items:center;gap:9px;min-width:0}
.sl-brand-text{display:flex;flex-direction:column;min-width:0;line-height:1.05}
.sl-brand-name{font-family:var(--sl-serif);font-size:17px;font-weight:600;letter-spacing:.12em;color:var(--sl-ink)}
.sl-brand-sub{font-size:8px;letter-spacing:.22em;color:var(--sl-faint);margin-top:3px;text-transform:uppercase}
.sl-top-divider{width:1px;height:24px;background:var(--sl-line);flex:none;margin:0 2px}
.sl-project-btn{display:flex;align-items:center;gap:6px;min-width:0;max-width:250px;padding:4px 7px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--sl-ink-2)}
.sl-project-btn:hover{background:var(--sl-accent-soft);border-color:var(--sl-accent-line)}
.sl-project-title{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-project-genre{font-size:10px;color:var(--sl-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
.sl-search-trigger{flex:1;max-width:420px;display:flex;align-items:center;gap:8px;height:30px;margin:0 auto;padding:0 10px;border:1px solid var(--sl-line);border-radius:8px;background:rgba(255,252,245,.42);color:var(--sl-faint);font-size:12px}
.sl-search-trigger:hover{border-color:var(--sl-accent-line);color:var(--sl-muted)}
.sl-search-trigger .sl-kbd{margin-left:auto}
.sl-top-actions{display:flex;align-items:center;gap:2px;flex:none}
.sl-save-state{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--sl-faint);white-space:nowrap;margin-right:4px}
.sl-save-state .sl-dot{background:var(--sl-jade)}
.sl-save-state.dirty .sl-dot{background:var(--sl-gold)}
.sl-save-state.error{color:var(--sl-accent)}
.sl-save-state.error .sl-dot{background:var(--sl-accent)}
.sl-lint-btn{position:relative;display:flex;align-items:center;gap:6px;height:28px;padding:0 9px;border:1px solid var(--sl-line);border-radius:7px;background:transparent;color:var(--sl-muted);font-size:11px}
.sl-lint-btn:hover{border-color:var(--sl-accent-line);color:var(--sl-accent)}
.sl-lint-btn .sl-lint-count{display:inline-flex;align-items:center;justify-content:center;min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:var(--sl-accent);color:#fff;font-size:9.5px;font-weight:600}
.sl-lint-btn.clean .sl-lint-count{background:var(--sl-jade)}

/* 身体与导航 */
.sl-body{flex:1;min-height:0;display:flex;position:relative}
.sl-nav{width:206px;flex:none;display:flex;flex-direction:column;border-right:1px solid var(--sl-line);background:linear-gradient(180deg,rgba(255,252,245,.28),rgba(255,252,245,.06));min-height:0;z-index:12}
body[data-ds-dark-theme] .sl-nav,html[data-ds-theme="dark"] .sl-nav{background:linear-gradient(180deg,rgba(255,240,210,.02),transparent)}
.sl-nav-head{padding:12px 12px 7px;display:flex;align-items:center;justify-content:space-between}
.sl-nav-label{font-size:9px;letter-spacing:.18em;color:var(--sl-faint);text-transform:uppercase}
.sl-nav-scroll{flex:1;min-height:0;overflow:auto;padding:0 8px 12px}
.sl-nav-dash{display:flex;align-items:center;gap:9px;width:100%;height:34px;padding:0 9px;margin-bottom:6px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--sl-ink-2);text-align:left;font-size:12.5px}
.sl-nav-dash:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-nav-dash.active{background:var(--sl-accent-soft);border-color:var(--sl-accent-line);color:var(--sl-accent);font-weight:600}
.sl-nav-group{margin-top:10px}
.sl-nav-group-head{display:flex;align-items:center;justify-content:space-between;height:22px;padding:0 8px 0 9px;color:var(--sl-faint);font-size:12px;letter-spacing:.05em}
.sl-nav-group-head span{font-family:var(--sl-serif);font-size:12px;letter-spacing:.14em}
.sl-nav-add{width:18px;height:18px;border:0;border-radius:4px;background:transparent;color:var(--sl-faint);display:inline-flex;align-items:center;justify-content:center;padding:0;opacity:0}
.sl-nav-group:hover .sl-nav-add{opacity:1}
.sl-nav-add:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-nav-item{position:relative;display:flex;align-items:center;gap:8px;width:100%;height:31px;padding:0 8px 0 9px;margin:1px 0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--sl-ink-2);text-align:left;font-size:12px}
.sl-nav-item:hover{background:rgba(126,110,88,.07)}
.sl-nav-item.active{background:rgba(255,252,245,.66);border-color:var(--sl-line);color:var(--sl-ink);box-shadow:0 1px 2px rgba(64,48,30,.04)}
.sl-nav-item.active:before{content:"";position:absolute;left:-1px;top:6px;bottom:6px;width:2px;border-radius:2px;background:var(--sl-accent)}
.sl-nav-icon{width:16px;color:var(--sl-muted);display:flex;align-items:center;justify-content:center;flex:none}
.sl-nav-item.active .sl-nav-icon{color:var(--sl-accent)}
.sl-nav-text{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-nav-count{font-size:9.5px;color:var(--sl-faint);font-variant-numeric:tabular-nums}
.sl-nav-badge{width:5px;height:5px;border-radius:50%;background:var(--sl-accent);flex:none}
.sl-nav-footer{flex:none;padding:9px 10px 12px;border-top:1px solid var(--sl-line-soft);display:flex;flex-direction:column;gap:3px}
.sl-nav-foot-btn{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--sl-muted);font-size:11.5px;text-align:left}
.sl-nav-foot-btn:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-nav-score{margin-left:auto;font-family:var(--sl-serif);font-size:12px;color:var(--sl-jade)}
.sl-nav-score.warn{color:var(--sl-gold)}
.sl-nav-score.bad{color:var(--sl-accent)}
.sl-nav-scrim{display:none}

/* 主区 */
.sl-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;position:relative}
.sl-board-head{flex:none;padding:15px 20px 12px;border-bottom:1px solid var(--sl-line-soft);display:flex;align-items:flex-start;gap:14px}
.sl-board-heading{min-width:0;flex:1}
.sl-breadcrumb{display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:.08em;color:var(--sl-faint);margin-bottom:3px}
.sl-board-title-row{display:flex;align-items:center;gap:8px;min-width:0}
.sl-board-title{font-family:var(--sl-serif);font-size:22px;font-weight:600;letter-spacing:.04em;margin:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-board-desc{color:var(--sl-muted);font-size:11px;margin-top:4px;max-width:720px;line-height:1.5}
.sl-board-head-actions{display:flex;align-items:center;gap:7px;flex:none;padding-top:3px}
.sl-toolbar{flex:none;display:flex;align-items:center;gap:8px;padding:8px 20px;border-bottom:1px solid var(--sl-line-soft);min-height:42px}
.sl-toolbar-left{display:flex;align-items:center;gap:6px;min-width:0;flex:1;overflow:hidden}
.sl-toolbar-right{display:flex;align-items:center;gap:4px;flex:none}
.sl-filter-input{height:27px;width:150px;padding:0 9px;border:1px solid var(--sl-line);border-radius:7px;background:rgba(255,252,245,.4);font-size:11.5px;outline:none}
.sl-filter-input:focus{border-color:var(--sl-accent-line);box-shadow:0 0 0 2px var(--sl-accent-soft)}
.sl-count-note{font-size:10.5px;color:var(--sl-faint);white-space:nowrap}
.sl-content{flex:1;min-height:0;overflow:auto;padding:16px 20px 40px;scroll-behavior:smooth}
.sl-content.no-pad{padding:0}
.sl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:280px;padding:40px 24px;border:1px dashed var(--sl-line);border-radius:var(--sl-radius);background:rgba(255,252,245,.24);color:var(--sl-muted)}
body[data-ds-dark-theme] .sl-empty,html[data-ds-theme="dark"] .sl-empty{background:rgba(255,240,210,.02)}
.sl-empty-art{width:54px;height:54px;border-radius:50%;border:1px solid var(--sl-line);display:flex;align-items:center;justify-content:center;color:var(--sl-accent);margin-bottom:14px;background:var(--sl-accent-soft)}
.sl-empty h3{font-family:var(--sl-serif);font-size:17px;font-weight:600;margin:0 0 5px;color:var(--sl-ink)}
.sl-empty p{margin:0 0 14px;font-size:11.5px;max-width:360px;line-height:1.7}
.sl-empty-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.sl-spinner{width:20px;height:20px;border-radius:50%;border:2px solid var(--sl-line);border-top-color:var(--sl-accent);animation:sl-spin .8s linear infinite}
@keyframes sl-spin{to{transform:rotate(360deg)}}
.sl-loading{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--sl-muted);font-size:12px;letter-spacing:.08em}
.sl-error-panel{max-width:480px;margin:60px auto;padding:24px;border:1px solid var(--sl-line);border-radius:var(--sl-radius);background:var(--sl-panel);box-shadow:var(--sl-shadow)}
.sl-error-panel h3{font-family:var(--sl-serif);margin:0 0 8px;font-size:18px}
.sl-error-panel code{display:block;margin:10px 0;padding:8px;border-radius:6px;background:var(--sl-paper-2);font-size:11px;word-break:break-all;color:var(--sl-muted)}

/* 仪表盘 */
.sl-dash{display:flex;flex-direction:column;gap:16px;max-width:1180px;margin:0 auto}
.sl-hero{position:relative;overflow:hidden;border:1px solid var(--sl-line);border-radius:18px;padding:26px 28px 22px;background:linear-gradient(135deg,rgba(255,252,245,.9),rgba(247,239,224,.62));box-shadow:0 12px 36px rgba(64,48,30,.06)}
body[data-ds-dark-theme] .sl-hero,html[data-ds-theme="dark"] .sl-hero{background:linear-gradient(135deg,rgba(255,240,210,.035),rgba(255,240,210,.01))}
.sl-hero:after{content:"织";position:absolute;right:20px;top:-18px;font-family:var(--sl-serif);font-size:150px;line-height:1;color:var(--sl-accent);opacity:.055;pointer-events:none}
.sl-hero-eyebrow{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--sl-accent);margin-bottom:10px}
.sl-hero-eyebrow:before{content:"";width:24px;height:1px;background:var(--sl-accent)}
.sl-hero-title{font-family:var(--sl-serif);font-size:34px;line-height:1.18;letter-spacing:.03em;margin:0 0 8px;font-weight:600;max-width:760px}
.sl-hero-sub{font-size:12px;color:var(--sl-muted);margin:0 0 6px;letter-spacing:.02em}
.sl-hero-logline{font-family:var(--sl-serif);font-size:15px;line-height:1.85;color:var(--sl-ink-2);max-width:760px;margin:10px 0 0}
.sl-hero-logline.empty{color:var(--sl-faint);font-style:italic}
.sl-hero-actions{display:flex;align-items:center;gap:8px;margin-top:18px;flex-wrap:wrap}
.sl-hero-meta{margin-left:auto;display:flex;gap:18px;align-items:flex-end;color:var(--sl-faint);font-size:10px;text-align:right}
.sl-hero-meta b{display:block;font-family:var(--sl-serif);font-size:19px;color:var(--sl-ink-2);font-weight:600;line-height:1.2}
.sl-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.sl-stat{border:1px solid var(--sl-line);border-radius:12px;padding:12px 14px;background:rgba(255,252,245,.44);position:relative;overflow:hidden}
body[data-ds-dark-theme] .sl-stat,html[data-ds-theme="dark"] .sl-stat{background:rgba(255,240,210,.025)}
.sl-stat:before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;border-radius:2px;background:var(--sl-accent);opacity:.62}
.sl-stat:nth-child(2):before{background:var(--sl-jade)}
.sl-stat:nth-child(3):before{background:var(--sl-gold)}
.sl-stat:nth-child(4):before{background:var(--sl-blue)}
.sl-stat-value{font-family:var(--sl-serif);font-size:25px;line-height:1.1;letter-spacing:.02em;color:var(--sl-ink)}
.sl-stat-label{font-size:10px;color:var(--sl-faint);letter-spacing:.08em;margin-top:4px}
.sl-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:12px}
.sl-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.sl-card{border:1px solid var(--sl-line);border-radius:14px;background:rgba(255,252,245,.42);min-width:0;overflow:hidden}
body[data-ds-dark-theme] .sl-card,html[data-ds-theme="dark"] .sl-card{background:rgba(255,240,210,.022)}
.sl-card-head{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid var(--sl-line-soft)}
.sl-card-title{font-family:var(--sl-serif);font-size:13px;font-weight:600;letter-spacing:.06em;flex:1;min-width:0}
.sl-card-body{padding:10px 14px 14px}
.sl-card-link{font-size:10px;color:var(--sl-faint);background:none;border:0;padding:2px 4px;border-radius:4px}
.sl-card-link:hover{color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-progress-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px dashed var(--sl-line-soft);min-width:0}
.sl-progress-row:last-child{border-bottom:0}
.sl-progress-index{width:30px;flex:none;font-size:9.5px;color:var(--sl-faint);font-variant-numeric:tabular-nums}
.sl-progress-main{flex:1;min-width:0}
.sl-progress-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-progress-sub{font-size:9.5px;color:var(--sl-faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-thread-mini{display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px dashed var(--sl-line-soft);min-width:0}
.sl-thread-mini:last-child{border-bottom:0}
.sl-thread-mini .sl-pill{flex:none;margin-top:1px}
.sl-thread-mini-main{flex:1;min-width:0}
.sl-thread-mini-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-thread-mini-sub{font-size:9.5px;color:var(--sl-faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-dash-characters{display:flex;flex-wrap:wrap;gap:8px}
.sl-dash-char{display:flex;align-items:center;gap:7px;padding:5px 8px 5px 5px;border:1px solid var(--sl-line-soft);border-radius:999px;background:rgba(255,252,245,.4);max-width:100%}
.sl-dash-char span{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-avatar{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;flex:none;font-family:var(--sl-serif);font-size:13px;color:#fbf4e5;background:linear-gradient(145deg,#6a7f73,#3f5b50);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.sl-avatar.big{width:38px;height:38px;font-size:17px}
.sl-avatar.red{background:linear-gradient(145deg,#b05a4c,#8d3429)}
.sl-avatar.gold{background:linear-gradient(145deg,#b08a51,#866536)}
.sl-avatar.blue{background:linear-gradient(145deg,#6e8499,#4b6074)}
.sl-avatar.gray{background:linear-gradient(145deg,#8b8272,#655e52)}
.sl-quick-list{display:flex;flex-direction:column;gap:2px}
.sl-quick-item{display:flex;align-items:center;gap:8px;padding:7px 4px;border:0;border-bottom:1px dashed var(--sl-line-soft);background:transparent;text-align:left;font-size:11.5px;color:var(--sl-ink-2);border-radius:5px}
.sl-quick-item:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-quick-item:last-child{border-bottom:0}
.sl-quick-item .sl-icon{color:var(--sl-faint)}
.sl-quick-item.done{color:var(--sl-faint);text-decoration:line-through}
.sl-quick-check{width:15px;height:15px;border:1px solid var(--sl-line);border-radius:4px;display:flex;align-items:center;justify-content:center;flex:none;color:var(--sl-jade)}

/* 卡片视图 */
.sl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.sl-entry-card{position:relative;display:flex;flex-direction:column;min-height:148px;padding:13px 14px 12px;border:1px solid var(--sl-line);border-radius:12px;background:rgba(255,252,245,.44);text-align:left;overflow:hidden;transition:transform .16s,box-shadow .16s,border-color .16s}
body[data-ds-dark-theme] .sl-entry-card,html[data-ds-theme="dark"] .sl-entry-card{background:rgba(255,240,210,.022)}
.sl-entry-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(64,48,30,.08);border-color:var(--sl-accent-line)}
.sl-entry-card.selected{border-color:var(--sl-accent);box-shadow:0 0 0 2px var(--sl-accent-soft)}
.sl-entry-card:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,var(--sl-accent),transparent 70%);opacity:.55}
.sl-entry-card-top{display:flex;align-items:flex-start;gap:9px;min-width:0}
.sl-entry-card-title{flex:1;min-width:0}
.sl-entry-name{font-family:var(--sl-serif);font-size:16px;font-weight:600;line-height:1.3;letter-spacing:.02em;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-entry-sub{font-size:10px;color:var(--sl-faint);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-entry-summary{font-size:11px;color:var(--sl-muted);line-height:1.6;margin-top:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:52px}
.sl-entry-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:8px}
.sl-entry-meta .sl-tag{font-size:9.5px}
.sl-entry-warning{position:absolute;right:9px;top:9px;color:var(--sl-accent);display:flex;align-items:center;gap:3px;font-size:9px}

/* 清单视图 */
.sl-table{border:1px solid var(--sl-line);border-radius:12px;overflow:hidden;background:rgba(255,252,245,.32)}
.sl-table-head,.sl-table-row{display:grid;grid-template-columns:minmax(150px,1.6fr) minmax(100px,1fr) minmax(90px,.85fr) minmax(80px,.7fr) minmax(70px,.6fr);gap:10px;align-items:center;padding:0 13px}
.sl-table-head{height:32px;background:rgba(126,110,88,.055);border-bottom:1px solid var(--sl-line);font-size:9px;letter-spacing:.12em;color:var(--sl-faint);text-transform:uppercase}
.sl-table-row{min-height:44px;border-bottom:1px solid var(--sl-line-soft);background:transparent;border-left:0;border-right:0;border-top:0;text-align:left;width:100%;color:var(--sl-ink-2)}
.sl-table-row:last-child{border-bottom:0}
.sl-table-row:hover{background:var(--sl-accent-soft)}
.sl-table-row.selected{background:var(--sl-accent-soft);box-shadow:inset 2px 0 0 var(--sl-accent)}
.sl-table-main{min-width:0;display:flex;align-items:center;gap:9px}
.sl-table-name{font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-table-sub{font-size:9.5px;color:var(--sl-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.sl-table-cell{min-width:0;font-size:10.5px;color:var(--sl-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-table-actions{display:flex;justify-content:flex-end;gap:2px}

/* 时间线 */
.sl-timeline{position:relative;max-width:920px;margin:0 auto;padding:6px 0 20px}
.sl-timeline:before{content:"";position:absolute;left:92px;top:0;bottom:0;width:1px;background:var(--sl-line)}
.sl-tl-era{position:relative;margin:12px 0 6px 92px;padding-left:18px;font-family:var(--sl-serif);font-size:12px;letter-spacing:.14em;color:var(--sl-accent)}
.sl-tl-row{position:relative;display:grid;grid-template-columns:78px 1fr;gap:28px;padding:5px 0 5px 0;min-width:0}
.sl-tl-date{text-align:right;font-size:10px;color:var(--sl-faint);padding-top:12px;line-height:1.45;font-variant-numeric:tabular-nums}
.sl-tl-axis{position:absolute;left:88px;top:17px;width:9px;height:9px;border-radius:50%;background:var(--sl-paper);border:2px solid var(--sl-accent);z-index:1}
.sl-tl-card{position:relative;text-align:left;border:1px solid var(--sl-line);border-radius:10px;background:rgba(255,252,245,.48);padding:10px 12px;color:var(--sl-ink-2);min-width:0}
body[data-ds-dark-theme] .sl-tl-card,html[data-ds-theme="dark"] .sl-tl-card{background:rgba(255,240,210,.025)}
.sl-tl-card:hover{border-color:var(--sl-accent-line);box-shadow:0 6px 18px rgba(64,48,30,.06)}
.sl-tl-top{display:flex;align-items:center;gap:7px;min-width:0}
.sl-tl-title{font-family:var(--sl-serif);font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-tl-body{font-size:10.5px;color:var(--sl-muted);margin-top:4px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sl-tl-meta{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap}
.sl-tl-meta .sl-tag{font-size:9px}

/* 力量阶梯 */
.sl-ladder-wrap{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(230px,.55fr);gap:14px;max-width:1100px;margin:0 auto;align-items:start}
.sl-ladder{display:flex;flex-direction:column;gap:0;border:1px solid var(--sl-line);border-radius:14px;overflow:hidden;background:rgba(255,252,245,.32)}
.sl-rung{display:grid;grid-template-columns:52px 1fr;gap:12px;padding:13px 15px;border-bottom:1px solid var(--sl-line-soft);background:transparent;text-align:left;color:var(--sl-ink-2);position:relative}
.sl-rung:last-child{border-bottom:0}
.sl-rung:hover{background:var(--sl-accent-soft)}
.sl-rung-rank{display:flex;align-items:center;justify-content:center;align-self:start;width:36px;height:36px;border-radius:50%;border:1px solid var(--sl-accent-line);color:var(--sl-accent);font-family:var(--sl-serif);font-size:16px;background:var(--sl-accent-soft)}
.sl-rung-body{min-width:0}
.sl-rung-name{display:flex;align-items:center;gap:7px;font-family:var(--sl-serif);font-size:16px;font-weight:600;line-height:1.25}
.sl-rung-alias{font-size:10px;color:var(--sl-faint);font-family:var(--sl-sans);font-weight:400}
.sl-rung-desc{font-size:10.5px;color:var(--sl-muted);margin-top:4px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sl-rung-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:7px}
.sl-power-side{display:flex;flex-direction:column;gap:10px;position:sticky;top:0}
.sl-warning-card{border:1px solid var(--sl-accent-line);border-radius:12px;background:var(--sl-accent-soft);padding:11px 12px}
.sl-warning-card h4{margin:0 0 6px;font-size:10px;letter-spacing:.12em;color:var(--sl-accent);text-transform:uppercase}
.sl-warning-card p{margin:0;font-size:10.5px;line-height:1.6;color:var(--sl-ink-2)}
.sl-warning-card ul{margin:0;padding-left:15px;font-size:10.5px;line-height:1.6;color:var(--sl-ink-2)}

/* 大纲树 */
.sl-outline{max-width:1040px;margin:0 auto;border:1px solid var(--sl-line);border-radius:12px;overflow:hidden;background:rgba(255,252,245,.3)}
.sl-outline-row{display:flex;align-items:center;gap:7px;min-height:40px;padding:5px 12px;border-bottom:1px solid var(--sl-line-soft);background:transparent;width:100%;text-align:left;color:var(--sl-ink-2);border-left:0;border-right:0;border-top:0}
.sl-outline-row:last-child{border-bottom:0}
.sl-outline-row:hover{background:var(--sl-accent-soft)}
.sl-outline-row.is-volume{background:rgba(126,110,88,.045);min-height:44px}
.sl-outline-row.is-volume:hover{background:var(--sl-accent-soft)}
.sl-outline-caret{width:18px;height:18px;border:0;background:transparent;color:var(--sl-faint);display:inline-flex;align-items:center;justify-content:center;padding:0;flex:none;border-radius:4px}
.sl-outline-caret:hover{background:var(--sl-line-soft);color:var(--sl-accent)}
.sl-level-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;border-radius:5px;border:1px solid var(--sl-line);font-size:9px;color:var(--sl-muted);flex:none;background:rgba(255,252,245,.35)}
.sl-outline-title{font-family:var(--sl-serif);font-size:13.5px;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-outline-row.is-volume .sl-outline-title{font-size:15px}
.sl-outline-sub{font-size:9.5px;color:var(--sl-faint);max-width:38%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
.sl-outline-meta{display:flex;align-items:center;gap:5px;flex:none}
.sl-outline-num{font-size:9.5px;color:var(--sl-faint);font-variant-numeric:tabular-nums;min-width:30px;text-align:right}
.sl-outline-children{position:relative}
.sl-outline-children:before{content:"";position:absolute;left:24px;top:0;bottom:0;width:1px;background:var(--sl-line-soft)}
.sl-outline-children .sl-outline-row{padding-left:calc(12px + var(--depth,0) * 18px)}
.sl-outline-hint{font-size:10px;color:var(--sl-faint);padding:8px 12px;border-top:1px dashed var(--sl-line-soft)}

/* 伏笔看板 */
.sl-kanban{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:9px;align-items:start;min-width:780px;padding-bottom:10px}
.sl-kanban-col{border:1px solid var(--sl-line);border-radius:11px;background:rgba(126,110,88,.035);min-height:150px;overflow:hidden}
.sl-kanban-head{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--sl-line-soft);font-size:10px;letter-spacing:.08em;color:var(--sl-muted);background:rgba(255,252,245,.3)}
.sl-kanban-head b{font-family:var(--sl-serif);font-size:12px;font-weight:600;color:var(--sl-ink-2);flex:1}
.sl-kanban-count{font-size:9px;color:var(--sl-faint);background:rgba(126,110,88,.08);padding:1px 6px;border-radius:99px}
.sl-kanban-body{display:flex;flex-direction:column;gap:6px;padding:7px;min-height:100px}
.sl-kanban-body.drag-over{background:var(--sl-accent-soft);outline:1px dashed var(--sl-accent-line);outline-offset:-4px}
.sl-thread-card{display:flex;flex-direction:column;gap:5px;padding:8px 9px;border:1px solid var(--sl-line);border-radius:8px;background:rgba(255,252,245,.55);text-align:left;color:var(--sl-ink-2);cursor:pointer;position:relative}
body[data-ds-dark-theme] .sl-thread-card,html[data-ds-theme="dark"] .sl-thread-card{background:rgba(255,240,210,.025)}
.sl-thread-card:hover{border-color:var(--sl-accent-line);box-shadow:0 4px 12px rgba(64,48,30,.06)}
.sl-thread-card.overdue{border-left:3px solid var(--sl-accent)}
.sl-thread-name{font-size:11.5px;font-weight:500;line-height:1.4}
.sl-thread-sub{font-size:9px;color:var(--sl-faint);line-height:1.5}
.sl-thread-foot{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.sl-thread-foot .sl-pill{font-size:8.5px;padding:1px 5px}
.sl-thread-drag{font-size:8px;color:var(--sl-faint);text-align:right}

/* 地图 */
.sl-map-wrap{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:10px;min-height:0}
.sl-map-toolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:8px 10px;border:1px solid var(--sl-line);border-radius:10px;background:rgba(255,252,245,.38)}
.sl-map-stage-wrap{border:1px solid var(--sl-line);border-radius:12px;overflow:auto;background:#d8d1c2;max-height:calc(100vh - 240px);min-height:300px;position:relative}
.sl-map-stage{position:relative;transform-origin:top left;min-width:100%;min-height:360px}
.sl-map-img{display:block;width:100%;height:auto;user-select:none;pointer-events:none}
.sl-map-pin{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:2px;border:0;background:transparent;padding:0;color:var(--sl-ink);z-index:3}
.sl-map-pin .sl-pin-dot{width:12px;height:12px;border-radius:50% 50% 50% 0;background:var(--sl-accent);border:2px solid #fbf4e5;box-shadow:0 2px 5px rgba(0,0,0,.25);transform:rotate(-45deg)}
.sl-map-pin .sl-pin-label{font-size:9.5px;padding:1px 5px;border-radius:4px;background:rgba(251,244,229,.9);border:1px solid rgba(90,72,48,.25);white-space:nowrap;color:#3b3024}
.sl-map-pin:hover .sl-pin-dot{background:#7b241c;transform:rotate(-45deg) scale(1.18)}
.sl-map-pin.selected .sl-pin-dot{box-shadow:0 0 0 4px rgba(166,61,47,.25)}
.sl-map-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:420px;color:var(--sl-muted);gap:10px;text-align:center;background:repeating-linear-gradient(45deg,rgba(126,110,88,.045) 0 8px,transparent 8px 16px)}
.sl-map-empty h3{font-family:var(--sl-serif);font-size:18px;margin:0;color:var(--sl-ink)}
.sl-map-legend{display:flex;gap:10px;flex-wrap:wrap;font-size:9.5px;color:var(--sl-faint)}

/* 便签与图鉴 */
.sl-notes{columns:3 240px;column-gap:10px;max-width:1100px;margin:0 auto}
.sl-note-card{display:inline-flex;flex-direction:column;width:100%;break-inside:avoid;margin:0 0 10px;padding:11px 12px;border:1px solid var(--sl-line);border-radius:10px;background:rgba(255,252,245,.5);text-align:left;color:var(--sl-ink-2);box-shadow:0 2px 0 rgba(64,48,30,.025)}
.sl-note-card:hover{border-color:var(--sl-accent-line);transform:translateY(-1px)}
.sl-note-card.important{border-top:2px solid var(--sl-accent)}
.sl-note-top{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.sl-note-name{font-family:var(--sl-serif);font-size:14px;font-weight:600;line-height:1.35;flex:1}
.sl-note-body{font-size:10.5px;line-height:1.65;color:var(--sl-muted);display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
.sl-note-foot{display:flex;align-items:center;gap:5px;margin-top:8px;flex-wrap:wrap}
.sl-codex-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;max-width:1100px;margin:0 auto}
.sl-codex-card{display:flex;flex-direction:column;border:1px solid var(--sl-line);border-radius:12px;background:rgba(255,252,245,.42);padding:14px;text-align:left;color:var(--sl-ink-2);position:relative;overflow:hidden}
.sl-codex-card:hover{border-color:var(--sl-accent-line);box-shadow:0 8px 20px rgba(64,48,30,.07)}
.sl-codex-card:after{content:"";position:absolute;right:-18px;bottom:-24px;width:90px;height:90px;border:1px solid var(--sl-accent-line);border-radius:50%;opacity:.35}
.sl-codex-top{display:flex;align-items:flex-start;gap:10px}
.sl-codex-emblem{width:38px;height:38px;border-radius:9px;border:1px solid var(--sl-accent-line);background:var(--sl-accent-soft);display:flex;align-items:center;justify-content:center;color:var(--sl-accent);font-family:var(--sl-serif);font-size:19px;flex:none}
.sl-codex-title{flex:1;min-width:0}
.sl-codex-name{font-family:var(--sl-serif);font-size:16px;font-weight:600;line-height:1.3}
.sl-codex-cat{font-size:9.5px;color:var(--sl-faint);margin-top:2px}
.sl-codex-desc{font-size:10.5px;color:var(--sl-muted);line-height:1.65;margin-top:9px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sl-codex-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:auto;padding-top:9px}

/* 详情编辑 */
.sl-detail{width:376px;flex:none;min-height:0;display:flex;flex-direction:column;border-left:1px solid var(--sl-line);background:var(--sl-panel);backdrop-filter:blur(10px);z-index:14;box-shadow:-8px 0 24px rgba(64,48,30,.035)}
.sl-detail-head{flex:none;padding:11px 14px 9px;border-bottom:1px solid var(--sl-line-soft)}
.sl-detail-top{display:flex;align-items:center;gap:7px;min-width:0}
.sl-detail-board{display:flex;align-items:center;gap:5px;font-size:9.5px;color:var(--sl-faint);letter-spacing:.07em;min-width:0;flex:1}
.sl-detail-board span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-detail-actions{display:flex;align-items:center;gap:1px;flex:none}
.sl-entry-title-input{width:100%;border:0;border-bottom:1px solid transparent;background:transparent;font-family:var(--sl-serif);font-size:23px;font-weight:600;line-height:1.35;padding:7px 0 3px;outline:none;color:var(--sl-ink)}
.sl-entry-title-input:focus{border-bottom-color:var(--sl-accent-line)}
.sl-entry-sub-input{width:100%;border:0;background:transparent;font-size:11px;color:var(--sl-muted);padding:0 0 4px;outline:none}
.sl-detail-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px}
.sl-detail-tabs{display:flex;align-items:center;gap:1px;margin-top:7px}
.sl-detail-tab{height:25px;padding:0 9px;border:0;border-radius:5px;background:transparent;color:var(--sl-muted);font-size:10.5px}
.sl-detail-tab:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-detail-tab.active{background:var(--sl-accent-soft);color:var(--sl-accent);font-weight:500}
.sl-detail-body{flex:1;min-height:0;overflow:auto;padding:12px 14px 20px}
.sl-detail-foot{flex:none;display:flex;align-items:center;gap:7px;padding:8px 14px;border-top:1px solid var(--sl-line-soft);font-size:9.5px;color:var(--sl-faint)}
.sl-detail-foot .sl-btn{margin-left:auto}
.sl-lock-note{display:flex;align-items:center;gap:6px;margin:0 0 9px;padding:6px 8px;border:1px solid var(--sl-gold);border-radius:6px;background:var(--sl-gold-soft);color:var(--sl-gold);font-size:10px;line-height:1.5}
.sl-fields{display:grid;grid-template-columns:1fr;gap:8px}
.sl-field{min-width:0}
.sl-field.full{grid-column:1/-1}
.sl-field-label{display:flex;align-items:center;gap:5px;font-size:9.5px;letter-spacing:.09em;color:var(--sl-faint);margin-bottom:4px;text-transform:uppercase}
.sl-field-label b{font-weight:500;color:var(--sl-muted);letter-spacing:0;text-transform:none;font-size:10px}
.sl-field-help{font-size:9px;color:var(--sl-faint);margin-top:3px;line-height:1.5}
.sl-input,.sl-select,.sl-textarea{width:100%;border:1px solid var(--sl-line);border-radius:7px;background:rgba(255,252,245,.5);padding:6px 8px;font-size:11.5px;line-height:1.5;outline:none;color:var(--sl-ink);transition:border-color .15s,box-shadow .15s}
body[data-ds-dark-theme] .sl-input,body[data-ds-dark-theme] .sl-select,body[data-ds-dark-theme] .sl-textarea,html[data-ds-theme="dark"] .sl-input,html[data-ds-theme="dark"] .sl-select,html[data-ds-theme="dark"] .sl-textarea{background:rgba(255,240,210,.035)}
.sl-input:focus,.sl-select:focus,.sl-textarea:focus{border-color:var(--sl-accent-line);box-shadow:0 0 0 2px var(--sl-accent-soft)}
.sl-input::placeholder,.sl-textarea::placeholder{color:var(--sl-faint);opacity:.8}
.sl-textarea{resize:vertical;min-height:62px}
.sl-select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--sl-faint) 50%),linear-gradient(135deg,var(--sl-faint) 50%,transparent 50%);background-position:calc(100% - 13px) 50%,calc(100% - 9px) 50%;background-size:4px 4px,4px 4px;background-repeat:no-repeat;padding-right:24px}
.sl-refs{display:flex;flex-wrap:wrap;gap:4px;align-items:center;min-height:29px;padding:3px 4px;border:1px solid var(--sl-line);border-radius:7px;background:rgba(255,252,245,.4);position:relative}
.sl-ref-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 5px;border-radius:4px;background:var(--sl-accent-soft);color:var(--sl-accent);font-size:10px;max-width:100%}
.sl-ref-chip span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
.sl-ref-chip button{border:0;background:none;padding:0;color:inherit;display:inline-flex;align-items:center}
.sl-ref-add{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 5px;border:1px dashed var(--sl-line);border-radius:4px;background:transparent;color:var(--sl-faint);font-size:9.5px}
.sl-ref-add:hover{border-color:var(--sl-accent);color:var(--sl-accent)}
.sl-ref-picker{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:30;border:1px solid var(--sl-line);border-radius:8px;background:var(--sl-panel-solid);box-shadow:var(--sl-shadow);padding:6px;max-height:220px;overflow:auto}
.sl-ref-picker input{width:100%;height:25px;border:1px solid var(--sl-line);border-radius:5px;background:transparent;padding:0 7px;font-size:10.5px;outline:none;margin-bottom:4px}
.sl-ref-option{display:flex;align-items:center;gap:6px;width:100%;padding:4px 5px;border:0;border-radius:4px;background:transparent;text-align:left;font-size:10.5px;color:var(--sl-ink-2)}
.sl-ref-option:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-ref-option small{color:var(--sl-faint);font-size:9px}
.sl-ref-option.selected{color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-relations{display:flex;flex-direction:column;gap:5px}
.sl-rel-row{display:flex;flex-direction:column;gap:3px;padding:6px;border:1px solid var(--sl-line-soft);border-radius:6px;background:rgba(126,110,88,.03)}
.sl-rel-line{display:flex;align-items:center;gap:4px}
.sl-rel-line .sl-select{height:25px;padding:2px 20px 2px 6px;font-size:10px}
.sl-rel-line .sl-input{height:25px;font-size:10px}
.sl-rel-note{font-size:10px !important;min-height:24px}
.sl-rel-del{width:22px;height:22px;border:0;border-radius:4px;background:transparent;color:var(--sl-faint);display:inline-flex;align-items:center;justify-content:center;flex:none}
.sl-rel-del:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-body-editor{margin-top:10px;border:1px solid var(--sl-line);border-radius:9px;overflow:hidden;background:rgba(255,252,245,.35)}
.sl-md-toolbar{display:flex;align-items:center;gap:2px;padding:4px 6px;border-bottom:1px solid var(--sl-line-soft);background:rgba(126,110,88,.035)}
.sl-md-tab{height:22px;padding:0 7px;border:0;border-radius:4px;background:transparent;color:var(--sl-faint);font-size:9.5px}
.sl-md-tab:hover{color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-md-tab.active{color:var(--sl-accent);background:var(--sl-accent-soft);font-weight:500}
.sl-md-hint{margin-left:auto;font-size:8.5px;color:var(--sl-faint)}
.sl-md-textarea{display:block;width:100%;min-height:240px;max-height:52vh;border:0;background:transparent;padding:10px 11px;font-family:var(--sl-serif);font-size:13px;line-height:1.9;resize:vertical;outline:none;color:var(--sl-ink)}
.sl-md{padding:10px 12px;font-family:var(--sl-serif);font-size:13px;line-height:1.9;color:var(--sl-ink-2);min-height:160px;max-height:52vh;overflow:auto}
.sl-md h1,.sl-md h2,.sl-md h3,.sl-md h4{margin:14px 0 5px;line-height:1.35;color:var(--sl-ink);font-weight:600}
.sl-md h1{font-size:20px}
.sl-md h2{font-size:17px}
.sl-md h3{font-size:15px}
.sl-md p{margin:0 0 9px}
.sl-md ul,.sl-md ol{margin:4px 0 10px;padding-left:20px}
.sl-md li{margin:2px 0}
.sl-md blockquote{margin:8px 0;padding:4px 10px;border-left:2px solid var(--sl-accent-line);color:var(--sl-muted);background:rgba(126,110,88,.035)}
.sl-md code{padding:1px 4px;border-radius:3px;background:rgba(126,110,88,.1);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.sl-md pre{padding:10px;border-radius:6px;background:rgba(126,110,88,.08);overflow:auto;font-size:11px}
.sl-md pre code{padding:0;background:none}
.sl-md hr{border:0;border-top:1px solid var(--sl-line);margin:14px 0}
.sl-md a{color:var(--sl-accent);text-decoration:none;border-bottom:1px solid var(--sl-accent-line)}
.sl-md .sl-wikilink{color:var(--sl-jade);border-bottom:1px dashed var(--sl-jade);cursor:pointer;padding:0 1px}
.sl-md .sl-wikilink:hover{background:var(--sl-jade-soft)}
.sl-md-empty{color:var(--sl-faint);font-style:italic}
.sl-meta-list{display:flex;flex-direction:column;gap:5px;font-size:10.5px;color:var(--sl-muted)}
.sl-meta-row{display:flex;gap:8px}
.sl-meta-row b{width:64px;flex:none;font-weight:400;color:var(--sl-faint)}
.sl-history-row{display:flex;gap:7px;padding:6px 0;border-bottom:1px dashed var(--sl-line-soft);font-size:10px;color:var(--sl-muted);line-height:1.5}
.sl-history-row .sl-history-date{flex:none;width:76px;color:var(--sl-faint);font-variant-numeric:tabular-nums}
.sl-detail-placeholder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;color:var(--sl-faint);gap:9px}
.sl-detail-placeholder .sl-seal{opacity:.45;transform:rotate(-6deg) scale(.9)}
.sl-detail-placeholder p{margin:0;font-size:10.5px;line-height:1.7;max-width:210px}

/* 弹层通用 */
.sl-modal-layer{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(28,22,15,.38);backdrop-filter:blur(5px);animation:sl-fade .16s ease}
.sl-modal{width:min(760px,calc(100vw - 32px));max-height:min(82vh,780px);display:flex;flex-direction:column;border:1px solid var(--sl-line);border-radius:16px;background:var(--sl-panel-solid);box-shadow:0 30px 90px rgba(20,14,8,.32);overflow:hidden;animation:sl-rise .18s ease}
.sl-modal.wide{width:min(1000px,calc(100vw - 32px))}
.sl-modal.narrow{width:min(480px,calc(100vw - 32px))}
.sl-modal-head{flex:none;display:flex;align-items:flex-start;gap:10px;padding:15px 18px 11px;border-bottom:1px solid var(--sl-line-soft)}
.sl-modal-heading{flex:1;min-width:0}
.sl-modal-title{font-family:var(--sl-serif);font-size:19px;font-weight:600;margin:0;letter-spacing:.03em;line-height:1.3}
.sl-modal-sub{font-size:10.5px;color:var(--sl-muted);margin-top:3px;line-height:1.5}
.sl-modal-body{flex:1;min-height:0;overflow:auto;padding:15px 18px 20px}
.sl-modal-foot{flex:none;display:flex;align-items:center;gap:7px;padding:10px 18px;border-top:1px solid var(--sl-line-soft);background:rgba(126,110,88,.025)}
.sl-modal-foot .sl-spacer{flex:1}
@keyframes sl-fade{from{opacity:0}to{opacity:1}}
@keyframes sl-rise{from{transform:translateY(8px) scale(.99);opacity:.6}to{transform:none;opacity:1}}
.sl-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sl-field-grid .full{grid-column:1/-1}
.sl-modal textarea.sl-textarea{min-height:80px}
.sl-check-row{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--sl-muted);padding:5px 0}
.sl-check-row input{accent-color:var(--sl-accent)}

/* 项目菜单/下拉 */
.sl-pop-layer{position:fixed;inset:0;z-index:2147481900}
.sl-popover{position:absolute;z-index:2147481950;min-width:220px;padding:5px;border:1px solid var(--sl-line);border-radius:10px;background:var(--sl-panel-solid);box-shadow:var(--sl-shadow);animation:sl-fade .12s ease}
.sl-menu-item{display:flex;align-items:center;gap:8px;width:100%;padding:7px 8px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:11.5px;color:var(--sl-ink-2)}
.sl-menu-item:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-menu-item .sl-icon{color:var(--sl-faint)}
.sl-menu-item:hover .sl-icon{color:var(--sl-accent)}
.sl-menu-item.active{color:var(--sl-accent);font-weight:500}
.sl-menu-sep{height:1px;background:var(--sl-line-soft);margin:4px 6px}
.sl-menu-label{padding:5px 8px 3px;font-size:8.5px;letter-spacing:.14em;color:var(--sl-faint);text-transform:uppercase}
.sl-menu-hint{margin-left:auto;font-size:9px;color:var(--sl-faint)}

/* 搜索 */
.sl-search-modal{width:min(680px,calc(100vw - 28px));max-height:min(78vh,700px);border:1px solid var(--sl-line);border-radius:16px;background:var(--sl-panel-solid);box-shadow:0 30px 90px rgba(20,14,8,.35);overflow:hidden;display:flex;flex-direction:column;animation:sl-rise .16s ease}
.sl-search-top{display:flex;align-items:center;gap:9px;padding:13px 16px;border-bottom:1px solid var(--sl-line-soft)}
.sl-search-top .sl-icon{color:var(--sl-accent)}
.sl-search-input{flex:1;border:0;background:transparent;font-size:15px;outline:none;color:var(--sl-ink);font-family:var(--sl-serif)}
.sl-search-input::placeholder{color:var(--sl-faint)}
.sl-search-results{overflow:auto;padding:6px 8px 10px;min-height:120px}
.sl-search-section{font-size:8.5px;letter-spacing:.16em;color:var(--sl-faint);padding:9px 9px 4px;text-transform:uppercase}
.sl-search-row{display:flex;align-items:flex-start;gap:9px;width:100%;padding:8px 9px;border:0;border-radius:7px;background:transparent;text-align:left;color:var(--sl-ink-2)}
.sl-search-row:hover,.sl-search-row.active{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-search-row .sl-avatar{width:24px;height:24px;font-size:11px}
.sl-search-main{flex:1;min-width:0}
.sl-search-name{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-search-sub{font-size:9.5px;color:var(--sl-faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-search-board{font-size:9px;color:var(--sl-faint);flex:none;padding-top:2px}
.sl-search-empty{padding:30px 20px;text-align:center;color:var(--sl-faint);font-size:11px}
.sl-search-foot{display:flex;align-items:center;gap:10px;padding:8px 14px;border-top:1px solid var(--sl-line-soft);font-size:9px;color:var(--sl-faint)}
.sl-search-foot .sl-kbd{height:17px;min-width:17px}

/* 设置 */
.sl-settings{display:grid;grid-template-columns:142px 1fr;gap:0;min-height:380px}
.sl-settings-nav{border-right:1px solid var(--sl-line-soft);padding:4px 8px 8px 0;display:flex;flex-direction:column;gap:1px}
.sl-settings-tab{display:flex;align-items:center;gap:6px;height:30px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--sl-muted);font-size:11px;text-align:left}
.sl-settings-tab:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-settings-tab.active{background:var(--sl-accent-soft);color:var(--sl-accent);font-weight:500}
.sl-settings-pane{padding:4px 0 4px 16px;min-width:0}
.sl-settings-section{margin-bottom:18px}
.sl-settings-section h4{margin:0 0 8px;font-family:var(--sl-serif);font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--sl-ink)}
.sl-settings-section p{margin:0 0 8px;font-size:10.5px;color:var(--sl-muted);line-height:1.65}
.sl-settings-note{padding:8px 10px;border:1px solid var(--sl-line-soft);border-radius:7px;background:rgba(126,110,88,.035);font-size:10px;color:var(--sl-muted);line-height:1.65}
.sl-path-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;background:rgba(126,110,88,.08);border:1px solid var(--sl-line-soft);border-radius:5px;padding:5px 7px;word-break:break-all;color:var(--sl-muted)}
.sl-cmd-list{display:flex;flex-direction:column;gap:6px}
.sl-cmd-row{display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid var(--sl-line-soft);border-radius:6px;background:rgba(126,110,88,.03)}
.sl-cmd-row code{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;color:var(--sl-ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sl-backup-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed var(--sl-line-soft);font-size:10.5px;color:var(--sl-muted)}
.sl-backup-row:last-child{border-bottom:0}
.sl-backup-row .sl-spacer{flex:1}

/* 板块管理 */
.sl-board-manager{display:grid;grid-template-columns:182px 1fr;min-height:440px;max-height:64vh}
.sl-board-list{border-right:1px solid var(--sl-line-soft);padding-right:9px;overflow:auto}
.sl-board-list-item{display:flex;align-items:center;gap:6px;width:100%;padding:6px 7px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:10.5px;color:var(--sl-ink-2);margin-bottom:1px}
.sl-board-list-item:hover{background:var(--sl-accent-soft)}
.sl-board-list-item.active{background:var(--sl-accent-soft);color:var(--sl-accent);font-weight:500}
.sl-board-list-item small{margin-left:auto;color:var(--sl-faint);font-size:8.5px}
.sl-board-form{overflow:auto;padding-left:16px;min-width:0}
.sl-field-editor{border:1px solid var(--sl-line-soft);border-radius:8px;padding:8px;margin-bottom:7px;background:rgba(126,110,88,.025)}
.sl-field-editor-top{display:flex;align-items:center;gap:5px;margin-bottom:5px}
.sl-field-editor-top .sl-input{height:26px;font-size:10.5px}
.sl-field-editor-top .sl-select{height:26px;font-size:10px;width:104px;flex:none}
.sl-field-editor-actions{display:flex;gap:1px;margin-left:auto}
.sl-options-input{width:100%;height:25px;border:1px solid var(--sl-line);border-radius:5px;background:transparent;padding:0 7px;font-size:10px;outline:none;margin-top:4px}
.sl-board-add-row{display:flex;gap:6px;margin-top:10px}
.sl-board-add-row .sl-input{flex:1}
.sl-danger-zone{margin-top:16px;padding-top:10px;border-top:1px dashed var(--sl-line);display:flex;align-items:center;gap:8px;font-size:10px;color:var(--sl-faint)}
.sl-danger-zone .sl-btn{margin-left:auto}

/* 连续性抽屉/弹层 */
.sl-lint-summary{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--sl-line);border-radius:10px;background:rgba(126,110,88,.03);margin-bottom:12px}
.sl-score-ring{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--sl-serif);font-size:18px;font-weight:600;flex:none;border:2px solid var(--sl-jade);color:var(--sl-jade);background:var(--sl-jade-soft)}
.sl-score-ring.warn{border-color:var(--sl-gold);color:var(--sl-gold);background:var(--sl-gold-soft)}
.sl-score-ring.bad{border-color:var(--sl-accent);color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-lint-summary-main{flex:1;min-width:0}
.sl-lint-summary-main b{display:block;font-size:12px;font-weight:500}
.sl-lint-summary-main span{font-size:9.5px;color:var(--sl-faint)}
.sl-lint-filters{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}
.sl-lint-issue{display:flex;align-items:flex-start;gap:8px;width:100%;padding:8px 9px;border:1px solid var(--sl-line-soft);border-radius:7px;background:transparent;text-align:left;margin-bottom:5px;color:var(--sl-ink-2)}
.sl-lint-issue:hover{border-color:var(--sl-accent-line);background:var(--sl-accent-soft)}
.sl-lint-issue .sl-icon{margin-top:1px}
.sl-lint-issue.sev-error .sl-icon{color:var(--sl-accent)}
.sl-lint-issue.sev-warn .sl-icon{color:var(--sl-gold)}
.sl-lint-issue.sev-info .sl-icon{color:var(--sl-blue)}
.sl-lint-issue-main{flex:1;min-width:0}
.sl-lint-issue-title{font-size:11px;font-weight:500;line-height:1.4}
.sl-lint-issue-detail{font-size:9.5px;color:var(--sl-muted);line-height:1.55;margin-top:2px}
.sl-lint-issue-board{font-size:8.5px;color:var(--sl-faint);flex:none;padding-top:1px}
.sl-lint-clean{text-align:center;padding:28px 20px;color:var(--sl-muted)}
.sl-lint-clean .sl-seal{margin:0 auto 10px;opacity:.65}
.sl-lint-clean h4{font-family:var(--sl-serif);font-size:16px;margin:0 0 4px;color:var(--sl-ink)}
.sl-lint-clean p{margin:0;font-size:10.5px;line-height:1.6}

/* toast / confirm */
.sl-toast-wrap{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none}
.sl-toast{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--sl-line);border-radius:9px;background:var(--sl-panel-solid);box-shadow:0 10px 30px rgba(20,14,8,.2);font-size:11px;color:var(--sl-ink-2);animation:sl-rise .16s ease;max-width:min(480px,calc(100vw - 30px))}
.sl-toast .sl-icon{color:var(--sl-accent)}
.sl-toast.ok .sl-icon{color:var(--sl-jade)}
.sl-toast button{border:0;background:var(--sl-accent-soft);color:var(--sl-accent);font-size:10px;padding:3px 7px;border-radius:5px;margin-left:4px}
.sl-confirm-body{font-size:12px;line-height:1.7;color:var(--sl-ink-2)}
.sl-confirm-body b{font-weight:600}
.sl-confirm-body p{margin:0 0 8px}

/* 帮助 */
.sl-help-steps{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 14px}
.sl-help-step{border:1px solid var(--sl-line-soft);border-radius:8px;padding:9px 10px;background:rgba(126,110,88,.025)}
.sl-help-step b{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--sl-accent);margin-bottom:3px}
.sl-help-step p{margin:0;font-size:10px;color:var(--sl-muted);line-height:1.6}
.sl-shortcuts{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}
.sl-shortcut{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px dashed var(--sl-line-soft);font-size:10px;color:var(--sl-muted)}
.sl-shortcut span:last-child{display:flex;gap:3px}

/* 拖拽/加载 */
.sl-drop-hint{position:absolute;inset:8px;border:2px dashed var(--sl-accent-line);border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(247,241,229,.82);color:var(--sl-accent);font-size:11px;pointer-events:none;z-index:5}

/* 响应式 */
@container (max-width:1080px){
  .sl-grid{grid-template-columns:1fr}
  .sl-grid.three{grid-template-columns:1fr 1fr}
  .sl-stats{grid-template-columns:1fr 1fr}
  .sl-ladder-wrap{grid-template-columns:1fr}
  .sl-power-side{position:static}
  .sl-detail{width:342px}
}
@container (max-width:860px){
  .sl-nav{position:absolute;left:0;top:0;bottom:0;transform:translateX(-102%);transition:transform .2s ease;box-shadow:18px 0 50px rgba(20,14,8,.14);background:var(--sl-panel-solid)}
  .sl-app[data-nav-open="true"] .sl-nav{transform:none}
  .sl-nav-scrim{display:block;position:absolute;inset:0;background:rgba(28,22,15,.28);z-index:11;opacity:0;pointer-events:none;transition:opacity .2s}
  .sl-app[data-nav-open="true"] .sl-nav-scrim{opacity:1;pointer-events:auto}
  .sl-detail{position:absolute;right:0;top:0;bottom:0;width:min(390px,92%);box-shadow:-20px 0 60px rgba(20,14,8,.18);animation:sl-slide-in .2s ease}
  .sl-detail-scrim{display:block;position:absolute;inset:0;background:rgba(28,22,15,.2);z-index:13}
  .sl-search-trigger{max-width:220px}
  .sl-hero-meta{display:none}
  .sl-kanban{grid-template-columns:repeat(5,170px);overflow-x:auto}
  .sl-table-head,.sl-table-row{grid-template-columns:minmax(130px,1.5fr) minmax(90px,1fr) minmax(70px,.7fr)}
  .sl-table-head > :nth-child(4),.sl-table-row > :nth-child(4){display:none}
}
@container (max-width:620px){
  .sl-top{padding:0 9px;gap:6px;height:50px}
  .sl-brand-sub{display:none}
  .sl-brand-name{font-size:15px}
  .sl-seal{width:28px;height:28px}
  .sl-brand .sl-seal{width:28px;height:28px}
  .sl-top-divider{display:none}
  .sl-project-btn{max-width:150px}
  .sl-project-genre{display:none}
  .sl-search-trigger{width:30px;flex:none;padding:0;justify-content:center;border-color:transparent;background:transparent;margin-left:auto}
  .sl-search-trigger span,.sl-search-trigger .sl-kbd{display:none}
  .sl-save-state{display:none}
  .sl-top-actions .sl-hide-sm{display:none}
  .sl-board-head{padding:12px 13px 9px}
  .sl-board-title{font-size:19px}
  .sl-board-desc{font-size:10.5px}
  .sl-toolbar{padding:7px 13px}
  .sl-content{padding:12px 13px 30px}
  .sl-hero{padding:20px 18px 17px;border-radius:14px}
  .sl-hero-title{font-size:26px}
  .sl-hero-logline{font-size:13.5px}
  .sl-stats{grid-template-columns:1fr 1fr;gap:7px}
  .sl-stat{padding:10px 11px}
  .sl-stat-value{font-size:21px}
  .sl-grid.three{grid-template-columns:1fr}
  .sl-detail{width:100%;border-left:0}
  .sl-settings{grid-template-columns:1fr}
  .sl-settings-nav{flex-direction:row;overflow:auto;border-right:0;border-bottom:1px solid var(--sl-line-soft);padding:0 0 7px;gap:3px}
  .sl-settings-tab{white-space:nowrap;height:27px}
  .sl-settings-pane{padding:12px 0 0}
  .sl-board-manager{grid-template-columns:1fr;max-height:70vh}
  .sl-board-list{display:flex;gap:3px;overflow:auto;border-right:0;border-bottom:1px solid var(--sl-line-soft);padding:0 0 8px;margin-bottom:10px}
  .sl-board-list-item{white-space:nowrap;margin:0}
  .sl-board-form{padding-left:0}
  .sl-field-grid{grid-template-columns:1fr}
  .sl-help-steps{grid-template-columns:1fr}
  .sl-shortcuts{grid-template-columns:1fr}
  .sl-notes{columns:1}
  .sl-cards{grid-template-columns:1fr}
  .sl-codex-grid{grid-template-columns:1fr}
  .sl-timeline:before{left:20px}
  .sl-tl-era{margin-left:20px;padding-left:24px}
  .sl-tl-row{grid-template-columns:1fr;gap:0;padding-left:38px}
  .sl-tl-date{text-align:left;padding:0 0 3px 0;font-size:9px}
  .sl-tl-axis{left:16px;top:13px}
  .sl-table{border-radius:9px}
  .sl-table-head{display:none}
  .sl-table-row{grid-template-columns:1fr;gap:2px;padding:9px 11px}
  .sl-table-row > :nth-child(2),.sl-table-row > :nth-child(3){display:none}
  .sl-outline-sub{display:none}
  .sl-outline-meta .sl-tag{display:none}
  .sl-modal-layer{padding:10px}
  .sl-modal{max-height:88vh;border-radius:13px}
  .sl-modal-head{padding:13px 14px 9px}
  .sl-modal-body{padding:12px 14px 16px}
  .sl-modal-foot{padding:9px 14px}
}
@container (max-width:420px){
  .sl-top-actions .sl-icon-btn.sl-optional{display:none}
  .sl-hero-title{font-size:23px}
  .sl-stats{grid-template-columns:1fr 1fr}
}
@keyframes sl-slide-in{from{transform:translateX(16px);opacity:.5}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){
  .sl-app *{scroll-behavior:auto !important;animation-duration:.001ms !important;transition-duration:.001ms !important}
}
.sl-dropdown{position:relative}
.sl-hide-lg{display:none}
.sl-detail-scrim{display:none}
.sl-context-pre{white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.75;color:var(--sl-ink-2);background:rgba(126,110,88,.045);border:1px solid var(--sl-line-soft);border-radius:8px;padding:12px;max-height:52vh;overflow:auto;margin:0}
.sl-note{border:1px solid var(--sl-line-soft);border-radius:8px;background:rgba(126,110,88,.035);padding:9px 10px;margin:0 0 8px}
.sl-note p{margin:0 0 5px;font-size:10.5px;line-height:1.7;color:var(--sl-muted)}
.sl-note p:last-child{margin-bottom:0}
.sl-segmented{display:inline-flex;padding:2px;border:1px solid var(--sl-line);border-radius:7px;background:rgba(126,110,88,.035)}
.sl-segmented-item{height:22px;padding:0 8px;border:0;border-radius:5px;background:transparent;color:var(--sl-faint);font-size:10px}
.sl-segmented-item.active{background:var(--sl-panel-solid);color:var(--sl-accent);box-shadow:0 1px 2px rgba(64,48,30,.08)}
@container (max-width:860px){
  .sl-hide-lg{display:inline-flex}
  .sl-detail.empty{display:none}
  .sl-detail-scrim{display:block;position:absolute;inset:0;background:rgba(28,22,15,.2);z-index:13}
}
@container (max-width:620px){
  .sl-table-row > :nth-child(5){display:none}
  .sl-top-actions .sl-lint-btn span:not(.sl-lint-count){display:none}
}

.sl-conflict-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid var(--sl-accent-line);background:var(--sl-accent-soft);color:var(--sl-accent);font-size:10.5px;flex:none;flex-wrap:wrap}
.sl-conflict-bar .sl-btn{height:24px;font-size:10px;background:var(--sl-panel-solid)}

.sl-sync-state{display:inline-flex;align-items:center;gap:5px;font-size:10px;color:var(--sl-faint);white-space:nowrap;margin-right:3px}
.sl-sync-state .sl-dot{background:var(--sl-jade)}
.sl-reader-app{height:100%}
.sl-reader-title{font-family:var(--sl-serif);font-size:24px;font-weight:600;line-height:1.35;letter-spacing:.03em;margin:8px 0 2px;color:var(--sl-ink);word-break:break-word}
.sl-reader-subtitle{font-size:11px;color:var(--sl-muted);margin-bottom:5px;line-height:1.6}
.sl-reader-sync{font-size:9px;color:var(--sl-faint);margin-left:auto}
.sl-reader-fields{display:flex;flex-direction:column;gap:0}
.sl-reader-field{display:grid;grid-template-columns:76px 1fr;gap:8px;padding:6px 0;border-bottom:1px dashed var(--sl-line-soft);min-width:0}
.sl-reader-field:last-child{border-bottom:0}
.sl-reader-label{font-size:9.5px;letter-spacing:.06em;color:var(--sl-faint);padding-top:2px}
.sl-reader-value{font-size:11.5px;line-height:1.65;color:var(--sl-ink-2);min-width:0;word-break:break-word}
.sl-reader-text{white-space:pre-wrap}
.sl-reader-number{font-variant-numeric:tabular-nums;font-size:12px}
.sl-reader-muted{color:var(--sl-faint);font-size:10.5px}
.sl-reader-refs,.sl-reader-tags{display:flex;flex-wrap:wrap;gap:4px}
.sl-reader-ref{display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border:1px solid var(--sl-jade);border-radius:5px;background:var(--sl-jade-soft);color:var(--sl-jade);font-size:10px;line-height:1.7;max-width:100%;text-align:left}
.sl-reader-ref:hover{background:var(--sl-jade);color:#fff}
.sl-reader-ref .sl-icon{opacity:.7}
.sl-reader-relations{display:flex;flex-direction:column;gap:5px}
.sl-reader-relation{display:flex;align-items:flex-start;gap:5px;flex-wrap:wrap;font-size:10px;color:var(--sl-muted);line-height:1.6;padding:4px 0;border-bottom:1px dashed var(--sl-line-soft)}
.sl-reader-relation:last-child{border-bottom:0}
.sl-reader-relation b{font-weight:500;color:var(--sl-accent);font-size:9.5px;padding:1px 5px;border-radius:4px;background:var(--sl-accent-soft)}
.sl-reader-relation span{flex:1;min-width:100px}
.sl-reader-section{margin-top:13px}
.sl-reader-section-title{font-size:9px;letter-spacing:.14em;color:var(--sl-faint);text-transform:uppercase;margin-bottom:5px}
.sl-reader-body{background:rgba(126,110,88,.025);border:1px solid var(--sl-line-soft);border-radius:8px;padding:10px 11px}
.sl-reader-help p{font-size:11.5px;line-height:1.85;color:var(--sl-muted);margin:0 0 10px}
.sl-reader-help p:last-child{margin-bottom:0}
.sl-reader-help p.sl-faint{font-size:10.5px;border-top:1px dashed var(--sl-line-soft);padding-top:9px}
@media (max-width:900px){
  .sl-reader-detail{width:388px}
}

.sl-sync-card{display:flex;align-items:flex-start;gap:10px;padding:11px 12px;border:1px solid var(--sl-line);border-radius:9px;background:rgba(126,110,88,.03);margin-bottom:8px}
.sl-sync-icon{width:34px;height:34px;border-radius:9px;border:1px solid var(--sl-accent-line);background:var(--sl-accent-soft);color:var(--sl-accent);display:flex;align-items:center;justify-content:center;flex:none}
.sl-sync-card b{display:block;font-size:11.5px;font-weight:600;margin-bottom:2px}
.sl-sync-card p{margin:0;font-size:10px;color:var(--sl-muted);line-height:1.6;max-width:330px}
.sl-sync-card .sl-btn{flex:none;margin-left:auto;align-self:center}
.sl-sync-pending{display:flex;align-items:center;gap:6px;margin-top:8px;padding:7px 9px;border:1px dashed var(--sl-accent-line);border-radius:7px;background:var(--sl-accent-soft);font-size:10px;color:var(--sl-muted);flex-wrap:wrap}
.sl-sync-pending .sl-btn{margin-left:auto}

.sl-sync-folder{border:1px solid var(--sl-line);border-radius:10px;padding:10px 11px;background:rgba(126,110,88,.025);margin-bottom:10px}
.sl-sync-folder .sl-settings-section{margin-bottom:0}
.sl-sync-folder .sl-path-code{margin-top:5px}
.sl-sync-divider{display:flex;align-items:center;gap:8px;margin:8px 0;color:var(--sl-faint);font-size:9px;letter-spacing:.08em}
.sl-sync-divider:before,.sl-sync-divider:after{content:"";height:1px;flex:1;background:var(--sl-line-soft)}

`
