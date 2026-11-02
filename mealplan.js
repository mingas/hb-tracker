/* Meal plan generator for testosteroneblueprintguide.com/meal-plan-generator
   Reads recipes from the hidden CMS lists on the page ([data-mpg-list]), so new recipes join automatically.
   Each list item needs: [data-f=slug|name|meal|time|tags|kcal|protein|carbs|fat|diet|serves], img[data-f=photo], [data-g] goal markers. */
(function () {
  'use strict';
  var VERSION = '1.1.3';
  var css = "#mpg{--navy:#12294A;--navy2:#1d3a63;--gold:#C09A4E;--gold2:#e9d8b1;--cream:#F4EDE1;--line:#E7E1D4;--ink:#1f2733;--muted:#5f6876;--green:#3F7D58;--soft:#eef4f0;font-family:system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif;color:var(--ink);max-width:1140px;margin:0 auto;line-height:1.5}\n#mpg *{box-sizing:border-box}\n#mpg button,#mpg input,#mpg select{font:inherit}\n#mpg h1,#mpg h2,#mpg h3{font-family:Fraunces,Georgia,serif;color:var(--navy);letter-spacing:-.01em}\n.mpg-kicker{font-size:12.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7d5f25;margin:0 0 8px}\n.mpg-cta{background:var(--navy);color:#fff;border:0;border-radius:999px;padding:15px 28px;font-weight:700;font-size:16.5px;cursor:pointer;box-shadow:0 6px 18px rgba(18,41,74,.22);transition:transform .15s,box-shadow .15s}\n.mpg-cta:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(18,41,74,.28)}\n.mpg-cta:focus-visible,.mpg-back:focus-visible,.mpg-tools button:focus-visible{outline:3px solid var(--gold);outline-offset:3px}\n\n/* Hero */\n.mpg-hero{display:grid;grid-template-columns:1.05fr 1fr;gap:36px;align-items:center;background:linear-gradient(135deg,#fbf8f2 0%,var(--cream) 100%);border:1px solid var(--line);border-radius:28px;padding:44px;position:relative;overflow:hidden}\n.mpg-hero:before{content:\"\";position:absolute;right:-120px;top:-120px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(192,154,78,.18),transparent 70%)}\n.mpg-hero h1{font-size:44px;line-height:1.1;margin:0 0 14px}\n.mpg-lead{font-size:18px;color:var(--muted);margin:0 0 20px;max-width:520px}\n.mpg-badges{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px}\n.mpg-badges span{background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 14px;font-size:14px}\n.mpg-badges b{color:var(--navy)}\n.mpg-fine{font-size:13px;color:var(--muted);margin:12px 0 0}\n.mpg-mosaic{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:88px;grid-auto-flow:dense;gap:10px;transform:rotate(-2deg)}\n.mpg-tile{border-radius:16px;overflow:hidden;box-shadow:0 8px 20px rgba(18,41,74,.15);background:#e8e2d6}\n.mpg-tile img{width:100%;height:100%;object-fit:cover;display:block}\n.mpg-tile.t0{grid-area:1/1/3/3}.mpg-tile.t1{grid-area:1/3/2/4}.mpg-tile.t2{grid-area:1/4/2/5}.mpg-tile.t3{grid-area:2/3/4/4}.mpg-tile.t4{grid-area:3/1/4/3}.mpg-tile.t5{grid-area:2/4/5/5}.mpg-tile.t6{grid-area:4/1/5/2}.mpg-tile.t7{grid-area:4/2/5/4}\n.mpg-how{margin:34px 0 8px;text-align:center}\n.mpg-how h2{font-size:30px;margin:0 0 20px}\n.mpg-how-g{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;text-align:left}\n.mpg-how-g>div{background:#fff;border:1px solid var(--line);border-radius:20px;padding:24px}\n.mpg-how-g h3{font-size:19px;margin:12px 0 6px}\n.mpg-how-g p{margin:0;color:var(--muted);font-size:15px}\n.mpg-ic{width:48px;height:48px;border-radius:14px;background:var(--cream);color:var(--gold);display:inline-flex;align-items:center;justify-content:center}\n.mpg-ic svg{width:26px;height:26px}\n\n/* Wizard */\n.mpg-wiz{background:#fff;border:1px solid var(--line);border-radius:28px;padding:34px;max-width:860px;margin:0 auto;box-shadow:0 10px 30px rgba(18,41,74,.06)}\n.mpg-prog-t{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);font-weight:600;margin-bottom:8px}\n.mpg-prog-b{height:8px;background:var(--cream);border-radius:99px;overflow:hidden}\n.mpg-prog-b span{display:block;height:100%;background:linear-gradient(90deg,var(--gold),#d7b56b);border-radius:99px;transition:width .3s}\n.mpg-wiz h2{font-size:30px;margin:24px 0 18px}\n.mpg-q{font-weight:700;margin:18px 0 10px}\n.mpg-row2,.mpg-row3,.mpg-row4{display:grid;gap:10px;margin-bottom:12px}\n.mpg-row2{grid-template-columns:1fr 1fr}.mpg-row3{grid-template-columns:repeat(3,1fr)}.mpg-row4{grid-template-columns:repeat(4,1fr)}\n.mpg-opt,.mpg-popt,.mpg-chip{position:relative;cursor:pointer}\n.mpg-opt input,.mpg-popt input,.mpg-chip input{position:absolute;opacity:0;pointer-events:none}\n.mpg-opt span{display:block;border:1.5px solid var(--line);border-radius:14px;padding:14px 16px;height:100%;transition:.15s;background:#fff}\n.mpg-opt small,.mpg-popt small{display:block;color:var(--muted);font-size:13px;font-weight:400;margin-top:2px}\n.mpg-opt:hover span,.mpg-popt:hover span{border-color:#cdbf9f}\n.mpg-opt input:checked+span{border-color:var(--navy);background:#f3f6fb;box-shadow:0 0 0 1px var(--navy)}\n.mpg-prow{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}\n.mpg-prow4{grid-template-columns:repeat(4,1fr);margin-bottom:6px}\n.mpg-popt span{display:block;border:1.5px solid var(--line);border-radius:18px;overflow:hidden;height:100%;background:#fff;transition:.15s;padding-bottom:12px}\n.mpg-popt i{display:block;height:0;padding-top:72%;background-size:cover;background-position:center;margin-bottom:10px;background-color:#eee}\n.mpg-popt b,.mpg-popt small{padding:0 12px}\n.mpg-popt input:checked+span{border-color:var(--navy);box-shadow:0 0 0 2px var(--navy);transform:translateY(-2px)}\n.mpg-popt input:checked+span:after{content:\"\u2713\";position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}\n.mpg-opt input:focus-visible+span,.mpg-popt input:focus-visible+span,.mpg-chip input:focus-visible+span{outline:3px solid var(--gold);outline-offset:2px}\n.mpg-grid3,.mpg-grid2{display:grid;gap:12px;grid-template-columns:repeat(3,1fr);margin-top:6px}\n.mpg-grid2{grid-template-columns:1fr 1fr;margin-top:18px}\n.mpg-field{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:14px}\n.mpg-field em{font-style:normal;color:var(--muted);font-weight:400}\n.mpg-field input,.mpg-field select{border:1.5px solid var(--line);border-radius:12px;padding:13px 14px;background:#fff;font-weight:400;width:100%;font-size:16px}\n.mpg-field input:focus,.mpg-field select:focus{outline:none;border-color:var(--navy)}\n.mpg-link{background:none;border:0;color:var(--navy);text-decoration:underline;cursor:pointer;padding:0;margin-top:10px;font-size:14px}\n.mpg-chips{display:flex;flex-wrap:wrap;gap:8px}\n.mpg-chip span{display:inline-block;border:1.5px solid var(--line);border-radius:999px;padding:8px 15px;font-size:14.5px;background:#fff}\n.mpg-chip input:checked+span{background:#8a2f2f;border-color:#8a2f2f;color:#fff}\n.mpg-chip input:checked+span:before{content:\"\u2715 \"}\n.mpg-toggle{display:flex;gap:12px;align-items:flex-start;margin-top:18px;cursor:pointer;background:var(--cream);border-radius:14px;padding:14px 16px}\n.mpg-toggle input{width:20px;height:20px;margin-top:2px;accent-color:var(--navy);flex:none}\n.mpg-toggle small{display:block;color:var(--muted);font-size:13.5px}\n.mpg-review{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px}\n.mpg-review div{background:var(--cream);border-radius:14px;padding:12px 14px}\n.mpg-review span{display:block;font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}\n.mpg-err{color:#a12c2c;font-weight:600;margin:14px 0 0;min-height:1px}\n.mpg-nav{display:flex;justify-content:space-between;align-items:center;margin-top:20px}\n.mpg-back{background:none;border:1.5px solid var(--line);border-radius:999px;padding:12px 22px;cursor:pointer;font-weight:600}\n\n/* Plan */\n.mpg-sum{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;background:linear-gradient(135deg,var(--navy) 0%,var(--navy2) 100%);color:#fff;border-radius:24px;padding:28px 30px;flex-wrap:wrap}\n.mpg-sum .mpg-kicker{color:var(--gold2)}\n.mpg-sum h2{color:#fff !important;font-size:30px;margin:0}\n.mpg-sum-g{display:flex;gap:26px}\n.mpg-sum-g span{display:block;font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.06em}\n.mpg-sum-g b{font-size:18px}\n.mpg-note{background:#fbf3e2;border-left:4px solid var(--gold);padding:11px 15px;border-radius:10px;font-size:14.5px;margin:14px 0 0}\n.mpg-views{display:inline-flex;background:var(--cream);border-radius:999px;padding:5px;margin:22px 0 4px;gap:4px;flex-wrap:wrap}\n.mpg-views button{border:0;background:none;border-radius:999px;padding:10px 18px;cursor:pointer;font-weight:600;color:var(--muted)}\n.mpg-views button.on{background:#fff;color:var(--navy);box-shadow:0 2px 8px rgba(18,41,74,.12)}\n.mpg-tabs{display:flex;gap:6px;overflow-x:auto;margin:16px 0 12px;padding-bottom:4px}\n.mpg-tabs button{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:8px 17px;cursor:pointer;white-space:nowrap;font-weight:600}\n.mpg-tabs button.on{background:var(--navy);color:#fff;border-color:var(--navy)}\n.mpg-daytot{display:flex;gap:20px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px 22px;margin-bottom:16px}\n.mpg-dt-nums{flex:1;display:grid;grid-template-columns:2fr 2fr 1fr 1fr;gap:16px}\n.mpg-dt-nums span{display:block;font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}\n.mpg-dt-nums b{font-size:20px;color:var(--navy)}\n.mpg-dt-nums small{font-size:14px;color:var(--muted);font-weight:500}\n.mpg-bar{display:block;height:7px;background:var(--cream);border-radius:4px;margin-top:8px;overflow:hidden}\n.mpg-bar i{display:block;height:100%;background:var(--green);border-radius:4px}\n.mpg-dt-chart{display:flex;align-items:center;gap:12px}\n.mpg-donut{width:78px;height:78px;transform:none}\n.mpg-legend{list-style:none;margin:0;padding:0;font-size:13px}\n.mpg-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}\n.mpg-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}\n.mpg-card{background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .15s,transform .15s}\n.mpg-card:hover{box-shadow:0 12px 28px rgba(18,41,74,.10);transform:translateY(-2px)}\n.mpg-img{position:relative;display:block;height:0;padding-top:66.67%;overflow:hidden;background:#ece6da}\n.mpg-img img{color:transparent;font-size:0;position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}\n.mpg-mealtag{position:absolute;left:12px;bottom:12px;background:rgba(18,41,74,.88);color:#fff;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 11px;border-radius:999px}\n.mpg-badge{position:absolute;top:12px;left:12px;background:var(--gold);color:#1f2733;font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px}\n.mpg-body{padding:15px 17px 17px;display:flex;flex-direction:column;flex:1}\n.mpg-card h4{margin:0 0 8px;font-family:Fraunces,Georgia,serif;font-size:18px;line-height:1.28;color:var(--navy)}\n.mpg-card h4 a{color:inherit;text-decoration:none}\n.mpg-card h4 a:hover{text-decoration:underline}\n.mpg-meta{margin:0;font-size:13.5px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 12px}\n.mpg-meta b{color:var(--ink)}\n.mpg-why{margin:10px 0 0;font-size:13.5px;color:#2f5f45;background:var(--soft);padding:8px 11px;border-radius:10px}\n.mpg-actions{display:flex;gap:8px;margin-top:auto;padding-top:14px}\n.mpg-actions button,.mpg-actions a{flex:1;text-align:center;border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:9px;font-size:14px;cursor:pointer;color:var(--navy);text-decoration:none;font-weight:600}\n.mpg-actions button:hover,.mpg-actions a:hover{border-color:var(--navy)}\n.mpg-empty{padding:18px}\n.mpg-week{overflow-x:auto;margin-top:16px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:14px}\n.mpg-wk-g{display:grid;gap:8px;min-width:860px}\n.mpg-wk-h{border:0;background:var(--cream);border-radius:12px;padding:8px;font-weight:700;color:var(--navy);cursor:pointer}\n.mpg-wk-h small{display:block;font-weight:500;color:var(--muted);font-size:12px}\n.mpg-wk-m{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);align-self:center}\n.mpg-wk-c{display:block;text-decoration:none;color:var(--ink)}\n.mpg-wk-i{display:block;position:relative;height:0;padding-top:70%;border-radius:12px;overflow:hidden;background:#ece6da}\n.mpg-wk-i img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}\n.mpg-wk-i em{position:absolute;left:6px;top:6px;background:var(--gold);font-style:normal;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:99px}\n.mpg-wk-n{display:block;font-size:12.5px;line-height:1.3;margin-top:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.mpg-shop-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:16px}\n.mpg-aisle{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px}\n.mpg-aisle h4{margin:0 0 10px;font-family:Fraunces,Georgia,serif;color:var(--navy);font-size:17px;display:flex;justify-content:space-between}\n.mpg-aisle h4 small{font-family:system-ui;font-size:12px;background:var(--cream);border-radius:99px;padding:2px 9px;color:var(--muted)}\n.mpg-aisle ul{list-style:none;margin:0;padding:0}\n.mpg-aisle li label{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #f1ece2;cursor:pointer;align-items:flex-start}\n.mpg-aisle li input{width:18px;height:18px;accent-color:var(--green);margin-top:2px;flex:none}\n.mpg-aisle small{display:block;color:var(--muted);font-size:12px}\n.mpg-aisle label.on span{text-decoration:line-through;color:var(--muted)}\n.mpg-tools{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0 10px;align-items:center}\n.mpg-tools button:not(.mpg-cta){border:1.5px solid var(--navy);background:#fff;color:var(--navy);border-radius:999px;padding:12px 18px;cursor:pointer;font-weight:600}\n.mpg-small{font-size:12.5px;color:var(--muted)}\n.mpg-print{display:none}\n.mpg-fs{border:0;margin:0;padding:0;min-width:0}\n.mpg-fs legend{padding:0}\n.mpg-lbl{margin:6px 0 0;font-size:12.5px;color:#7a4b12;background:#fff7ec;border-radius:8px;padding:6px 9px}\n.mpg-flash{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--navy,#12294A);color:#fff;padding:10px 18px;border-radius:999px;z-index:9999;font-family:system-ui}\n\n\n.mpg-units{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0 12px;font-size:14px;color:var(--muted)}\n.mpg-units button{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;cursor:pointer;font-size:13.5px}\n.mpg-units button[aria-pressed=true]{background:var(--navy);color:#fff;border-color:var(--navy)}\n.mpg-body3{display:grid;grid-template-columns:1fr 1.4fr 1.4fr;gap:12px;align-items:end}\n.mpg-pair{display:grid;grid-template-columns:1fr 1fr;gap:6px;position:relative;padding-top:22px}\n.mpg-pl{position:absolute;top:0;left:0;font-weight:600;font-size:14px}\n.mpg-pair .mpg-field span{display:none}\n.mpg-pair .mpg-field{position:relative}\n.mpg-pair .mpg-field:after{content:attr(data-u)}\n.mpg-field input[aria-invalid=true],.mpg-safe input[aria-invalid=true]{border-color:#a12c2c;box-shadow:0 0 0 2px rgba(161,44,44,.2)}\n.mpg-field input:focus-visible,.mpg-field select:focus-visible{outline:3px solid var(--gold);outline-offset:1px}\n#mpg h2[tabindex=\"-1\"]:focus{outline:none}\n.mpg-link{background:none;border:0;padding:0;color:var(--navy);font-weight:700;text-decoration:underline;cursor:pointer}\n.mpg-warn{border-left:4px solid #c27b2c;background:#fff7ec}\n.mpg-safe-tip{margin:14px 0 0;padding:10px 14px;background:#fff;border:1px solid var(--line);border-radius:12px}\n#mpg .mpg-aisle input[type=checkbox]{width:22px;height:22px}\n.mpg-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}\n.mpg-badge2{top:auto;bottom:12px;left:auto;right:12px;background:#fff}\n.mpg-dayact{margin-top:14px;text-align:center}\n.mpg-ghost{background:#fff;border:1.5px dashed var(--navy);color:var(--navy);border-radius:999px;padding:10px 18px;font-weight:600;cursor:pointer}\n.mpg-bar.low i{background:#c27b2c}\n.mpg-stick{position:sticky;left:0;background:#fff;z-index:1}\n.mpg-sample{display:grid;grid-template-columns:1fr 1.6fr;gap:28px;align-items:center;margin:34px 0;background:#fff;border:1px solid var(--line);border-radius:24px;padding:30px}\n.mpg-sample h2{font-size:28px;margin:0 0 10px}\n.mpg-smp-g{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.mpg-smp{display:flex;gap:12px;align-items:center;text-decoration:none;color:var(--ink);background:var(--cream);border-radius:16px;padding:10px}\n.mpg-smp-i{width:74px;height:74px;flex:none;border-radius:12px;overflow:hidden;background:#e5ddcc}\n.mpg-smp-i img{width:100%;height:100%;object-fit:cover;display:block;color:transparent}\n.mpg-smp small{display:block;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7d5f25}\n.mpg-smp b{display:block;font-family:Fraunces,Georgia,serif;color:var(--navy);font-size:15px;line-height:1.25}\n.mpg-smp em{font-style:normal;font-size:12.5px;color:var(--muted)}\n.mpg-faq{max-width:820px;margin:20px auto}\n.mpg-faq h2{font-size:28px;text-align:center}\n.mpg-faq details{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:10px}\n.mpg-faq summary{cursor:pointer;font-weight:700;color:var(--navy)}\n.mpg-faq p{margin:10px 0 0;color:var(--muted)}\n.mpg-by{text-align:center;font-size:13.5px;color:var(--muted);margin:22px 0 0}\n.mpg-relax{display:flex;flex-direction:column;gap:10px;align-items:flex-start}\n.mpg-relax .mpg-cta{font-size:15px;padding:12px 20px}\n\n/* v6 landing */\n#mpg h1,#mpg h2{text-wrap:balance}\n.mpg-hero{grid-template-columns:1fr 1fr}\n.mpg-badges{list-style:none;padding:0;display:flex;flex-wrap:nowrap;gap:8px;margin:0 0 24px}\n.mpg-badges li{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #cfc6b3;border-radius:999px;padding:7px 13px;font-size:14px;white-space:nowrap;color:var(--ink)}\n.mpg-badges svg{width:14px;height:14px;color:var(--green)}\n.mpg-mock{position:relative;padding:0 30px 170px 0}\n.mpg-mock-app{background:#fff;border-radius:22px;box-shadow:0 18px 40px rgba(18,41,74,.16);overflow:hidden;border:1px solid var(--line)}\n.mpg-mock-bar{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;padding:16px 18px}\n.mpg-mock-bar small{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold2)}\n.mpg-mock-bar b{display:block;font-family:Fraunces,Georgia,serif;font-size:22px;margin:2px 0 10px}\n.mpg-mock-days{display:flex;gap:5px}\n.mpg-mock-days i{font-style:normal;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.14);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}\n.mpg-mock-days i.on{background:#fff;color:var(--navy)}\n.mpg-mock-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px}\n.mpg-mock-card b{display:block;font-family:Fraunces,Georgia,serif;font-size:14px;line-height:1.25;color:var(--navy);margin-top:8px}\n.mpg-mock-card small{color:var(--muted);font-size:12px}\n.mpg-mock-img,.mpg-fc-i,.mpg-smp-i,.mpg-pick-img{display:block;position:relative;padding-top:66.67%;border-radius:12px;overflow:hidden;background:#e5ddcc}\n.mpg-mock-img img,.mpg-fc-i img,.mpg-smp-i img,.mpg-pick-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;color:transparent}\n.mpg-mock-img em,.mpg-smp-i em{position:absolute;left:8px;top:8px;font-style:normal;background:rgba(18,41,74,.88);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:3px 9px}\n.mpg-mock-shop{position:absolute;right:0;bottom:0;width:200px;background:#fff;border-radius:16px;box-shadow:0 14px 30px rgba(18,41,74,.2);padding:14px 16px;border:1px solid var(--line)}\n.mpg-mock-shop b{font-family:Fraunces,Georgia,serif;color:var(--navy);font-size:15px}\n.mpg-mock-shop ul{list-style:none;margin:8px 0 0;padding:0;font-size:13px}\n.mpg-mock-shop li{display:flex;align-items:center;gap:7px;padding:3px 0;color:var(--ink)}\n.mpg-mock-shop li svg{width:14px;height:14px;border:1.5px solid #8E8676;border-radius:4px;color:transparent;padding:1px}\n.mpg-mock-shop li.on{color:var(--muted);text-decoration:line-through}\n.mpg-mock-shop li.on svg{background:var(--green);border-color:var(--green);color:#fff}\n.mpg-sec{margin:64px 0 0}\n.mpg-sec>h2{font-size:32px;text-align:center;margin:0 0 10px}\n.mpg-sub{text-align:center;color:var(--muted);max-width:640px;margin:0 auto 24px;font-size:16.5px}\n.mpg-fc-g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}\n.mpg-fc{display:flex;flex-direction:column;align-items:flex-start;text-align:left;background:#fff;border:1.5px solid #cfc6b3;border-radius:20px;padding:12px 12px 16px;cursor:pointer;font:inherit;color:var(--ink);transition:.15s}\n.mpg-fc:hover{border-color:var(--navy);transform:translateY(-2px);box-shadow:0 10px 24px rgba(18,41,74,.1)}\n.mpg-fc:focus-visible{outline:3px solid var(--gold);outline-offset:3px}\n.mpg-fc .mpg-fc-i{width:100%;margin-bottom:12px}\n.mpg-fc b{font-family:Fraunces,Georgia,serif;font-size:19px;color:var(--navy);padding:0 4px}\n.mpg-fc small{color:var(--muted);font-size:14px;margin:4px 0 12px;padding:0 4px;flex:1}\n.mpg-fc-go{font-weight:700;font-size:14px;color:var(--navy);padding:0 4px}\n.mpg-get-g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:22px}\n.mpg-get-g>div{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px}\n.mpg-get-g h3,.mpg-how-g h3{font-size:18px;margin:12px 0 6px}\n.mpg-get-g p,.mpg-how-g p{margin:0;color:var(--muted);font-size:15px}\n#mpg .mpg-ic{background:var(--cream);color:var(--navy)}\n.mpg-how{background:var(--cream);border-radius:28px;padding:44px 32px;text-align:center}\n.mpg-how-g{list-style:none;padding:0;margin:22px 0 26px}\n.mpg-how-g li{background:#fff;border-radius:20px;padding:24px;text-align:left}\n.mpg-num{width:40px;height:40px;border-radius:50%;background:var(--navy);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:18px}\n#mpg .mpg-sample{display:block;background:#fff;text-align:center;padding:40px 32px}\n#mpg .mpg-sample .mpg-smp-g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:22px 0 14px;text-align:left}\n#mpg .mpg-smp{display:block;background:none;padding:0;border-radius:0}\n#mpg .mpg-smp-i{width:auto;height:auto;flex:none}\n#mpg .mpg-sample{margin:64px 0 0;border:1px solid var(--line);border-radius:28px}\n#mpg .mpg-smp b{display:block;font-family:Fraunces,Georgia,serif;color:var(--navy);font-size:16px;line-height:1.25;margin:10px 0 2px}\n#mpg .mpg-smp small{color:var(--muted);font-size:13px;text-transform:none;letter-spacing:0;font-weight:400}\n.mpg-smp-tot{color:var(--muted);margin:0 0 20px}\n.mpg-author{display:grid;grid-template-columns:1fr 1fr;gap:32px;background:var(--navy);color:#e8edf5;border-radius:28px;padding:40px}\n#mpg .mpg-author h2{color:#fff;font-size:28px;margin:0 0 10px}\n#mpg .mpg-author h3{color:#fff;font-size:19px;margin:0 0 10px}\n.mpg-author .mpg-kicker{color:var(--gold2)}\n.mpg-author ul{margin:0;padding-left:18px}\n.mpg-author li{margin-bottom:8px}\n.mpg-author b{color:#fff}\n#mpg .mpg-faq summary{list-style:none;display:flex;justify-content:space-between;gap:12px;align-items:center}\n#mpg .mpg-faq summary::-webkit-details-marker{display:none}\n#mpg .mpg-faq summary:after{content:\"+\";font-size:22px;line-height:1;color:var(--navy);flex:none}\n#mpg .mpg-faq details[open] summary:after{content:\"\u2212\"}\n.mpg-center{text-align:center;margin-top:20px}\n#mpg .mpg-faq{margin:64px auto 0;max-width:820px}\n.mpg-sticky{display:none}\n/* v6 form and plan */\n#mpg .mpg-opt span,#mpg .mpg-popt span,#mpg .mpg-chip span,#mpg .mpg-field input,#mpg .mpg-field select,#mpg .mpg-units button,#mpg .mpg-back,#mpg .mpg-tabs button{border-color:#958c7b}\n.mpg-row2 .mpg-opt span{padding-left:46px;position:relative}\n.mpg-row2 .mpg-opt span:before{content:\"\";position:absolute;left:16px;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:50%;border:2px solid #958c7b;background:#fff}\n.mpg-row2 .mpg-opt input:checked+span:before{border-color:var(--navy);box-shadow:inset 0 0 0 4px #fff;background:var(--navy)}\n.mpg-editbar{background:var(--cream);border-radius:12px;padding:10px 14px;margin:0 0 16px;font-size:14px;color:var(--muted)}\n.mpg-count{font-size:14px;color:var(--muted);margin:14px 0 0;padding:10px 14px;background:var(--soft);border-radius:12px}\n.mpg-count.mpg-warn{color:#7a4b12}\n.mpg-nav .mpg-back{margin-right:auto}\n.mpg-tools{display:flex;flex-wrap:wrap;gap:14px 20px;align-items:center}\n.mpg-tlinks{display:flex;flex-wrap:wrap;gap:6px 18px}\n#mpg .mpg-tlinks button{background:none;border:0;padding:6px 0;color:var(--navy);font-weight:600;text-decoration:underline;text-underline-offset:3px;cursor:pointer;font-size:15px}\n#mpg .mpg-tlinks button:focus-visible{outline:3px solid var(--gold);outline-offset:2px}\n.mpg-printopt{margin:6px 0 18px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px;max-width:560px}\n.mpg-po-t{margin:0 0 10px;font-weight:700;color:var(--navy)}\n.mpg-po{display:block;width:100%;text-align:left;background:var(--cream);border:1.5px solid transparent;border-radius:14px;padding:12px 14px;margin-bottom:8px;cursor:pointer;font:inherit;color:var(--ink)}\n.mpg-po:hover,.mpg-po:focus-visible{border-color:var(--navy);outline:none;box-shadow:0 0 0 2px var(--gold)}\n.mpg-po b{display:block;color:var(--navy)}\n.mpg-po small{color:var(--muted);font-size:13px}\n.mpg-po:disabled{opacity:.6;cursor:wait}\n.mpg-po-s{font-size:14px;color:var(--muted);margin:4px 0 8px;min-height:1em}\n.mpg-pick{margin-top:12px;border-top:1px solid var(--line);padding-top:12px}\n.mpg-pick-t{margin:0 0 8px;font-weight:700;font-size:14px;color:var(--navy)}\n.mpg-pick-i{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:6px;margin-bottom:6px;cursor:pointer;font:inherit;color:var(--ink)}\n.mpg-pick-i:hover,.mpg-pick-i:focus-visible{border-color:var(--navy);outline:none;box-shadow:0 0 0 2px var(--gold)}\n.mpg-pick-i .mpg-pick-img{width:72px;flex:none;padding-top:48px;border-radius:8px}\n.mpg-pick-i b{display:block;font-size:13.5px;line-height:1.25;color:var(--navy)}\n.mpg-pick-i small{color:var(--muted);font-size:12px}\n.mpg-pick-act{display:flex;gap:16px;margin-top:4px}\n.mpg-pick-act .mpg-link,.mpg-printopt .mpg-link{min-height:44px;padding:0 4px;display:inline-flex;align-items:center}\n/* v6.2 hero */\n#mpg .mpg-hero{grid-template-columns:1.1fr 1fr;gap:48px;padding:56px 56px 56px 60px;background:radial-gradient(120% 90% at 100% 0%,#f3e7cf 0%,rgba(243,231,207,0) 55%),linear-gradient(180deg,#fbf8f2,#f6f0e4);border:0;border-radius:32px;overflow:hidden}\n#mpg .mpg-hero:before{display:none}\n#mpg .mpg-hero h1{font-size:clamp(34px,3.6vw,50px);line-height:1.06;letter-spacing:-.01em;margin:0 0 18px;max-width:12.5em}\n#mpg .mpg-hero .mpg-lead{font-size:18px;max-width:30em}\n.mpg-hv{position:relative;padding:0 0 34px 34px;width:100%;box-sizing:border-box}\n.mpg-hv-photo{position:relative;border-radius:26px;overflow:hidden;aspect-ratio:4/5;max-height:520px;width:100%;background:#e5ddcc;box-shadow:0 24px 50px rgba(18,41,74,.18)}\n.mpg-hv-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;color:transparent}\n.mpg-hv-card{position:absolute;left:0;bottom:0;width:250px;background:#fff;border-radius:18px;box-shadow:0 16px 36px rgba(18,41,74,.2);overflow:hidden}\n.mpg-hv-top{display:flex;justify-content:space-between;align-items:baseline;background:var(--navy);color:#fff;padding:11px 16px}\n.mpg-hv-top span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold2);font-weight:700}\n.mpg-hv-top b{font-family:Fraunces,Georgia,serif;font-size:18px}\n.mpg-hv-card ul{list-style:none;margin:0;padding:6px 16px 10px}\n.mpg-hv-card li{padding:7px 0;border-bottom:1px solid var(--line)}\n.mpg-hv-card li:last-child{border-bottom:0}\n.mpg-hv-card small{display:block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#7d5f25;font-weight:700}\n.mpg-hv-card li span{font-family:Fraunces,Georgia,serif;color:var(--navy);font-size:14px;line-height:1.25}\n.mpg-hv-chip{position:absolute;right:16px;top:16px;display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.95);border-radius:999px;padding:8px 14px;font-size:13.5px;font-weight:700;color:var(--navy);box-shadow:0 6px 16px rgba(18,41,74,.15)}\n.mpg-hv-chip svg{width:15px;height:15px;color:#fff;background:var(--green);border-radius:50%;padding:2px}\n.mpg-hv-r{padding:0 34px 34px 0}\n.mpg-hv-r .mpg-hv-card{left:auto;right:0}\n.mpg-hv-r .mpg-hv-chip{right:auto;left:16px}\n@media (max-width:900px){#mpg .mpg-hero{grid-template-columns:1fr;padding:34px 26px}.mpg-hv{max-width:460px;margin:0 auto}.mpg-hv-photo{aspect-ratio:4/3}}\n@media (max-width:640px){#mpg .mpg-hero{padding:28px 20px;border-radius:24px}.mpg-hv{padding:0}.mpg-hv-card{width:auto;left:12px;bottom:12px}.mpg-hv-card ul{display:none}.mpg-hv-top{gap:14px}.mpg-hv-photo{aspect-ratio:1/1}.mpg-hv-r{padding:0 0 26px 0}.mpg-hv-r .mpg-hv-card{left:auto;right:12px;bottom:12px}.mpg-hv-chip{display:none}}\n@media (max-width:900px){.mpg-fc-g,.mpg-get-g{grid-template-columns:repeat(2,1fr)}#mpg .mpg-sample .mpg-smp-g{grid-template-columns:repeat(2,1fr)}.mpg-author{grid-template-columns:1fr}.mpg-badges{flex-wrap:wrap}.mpg-hero{grid-template-columns:1fr;padding:30px}.mpg-hero h1{font-size:34px}.mpg-mosaic{transform:none;grid-auto-rows:70px}.mpg-prow{grid-template-columns:repeat(3,1fr)}.mpg-row4{grid-template-columns:1fr 1fr}.mpg-daytot{flex-direction:column;align-items:stretch}.mpg-dt-chart{justify-content:center}}\n@media (max-width:640px){#mpg.mpg-padsticky{padding-bottom:84px}.mpg-mock{display:none}.mpg-sec{margin-top:44px}.mpg-sec>h2{font-size:26px}.mpg-how,#mpg .mpg-sample,.mpg-author{padding:26px 18px}.mpg-fc-g{grid-template-columns:1fr 1fr;gap:10px}.mpg-fc b{font-size:16px}.mpg-get-g{grid-template-columns:1fr}.mpg-sticky{display:block;position:fixed;left:0;right:0;bottom:0;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);box-shadow:0 -6px 18px rgba(18,41,74,.12);transform:translateY(110%);transition:transform .2s;z-index:50}.mpg-sticky.on{transform:none}.mpg-sticky .mpg-cta{width:100%}.mpg-nav .mpg-cta{flex:1}.mpg-xl{display:none}.mpg-tabs{display:grid;grid-template-columns:repeat(7,1fr);overflow:visible}.mpg-tabs button{padding:8px 0}.mpg-dl{display:none}.mpg-views{display:flex;flex-wrap:nowrap}.mpg-views button{flex:1;line-height:1.2}.mpg-views button{font-size:13.5px;padding-left:6px;padding-right:6px;white-space:nowrap}.mpg-body3{grid-template-columns:1fr}.mpg-sample{grid-template-columns:1fr;padding:22px}.mpg-smp-g{grid-template-columns:1fr}.mpg-hero{padding:24px 20px;border-radius:22px}.mpg-hero h1{font-size:29px}.mpg-lead{font-size:16px}.mpg-how-g{grid-template-columns:1fr}.mpg-wiz{padding:22px 18px;border-radius:22px}.mpg-wiz h2{font-size:24px}.mpg-row3{grid-template-columns:1fr}.mpg-grid3{grid-template-columns:1fr 1fr}.mpg-grid3 label:first-child{grid-column:1/-1}.mpg-grid2{grid-template-columns:1fr}.mpg-prow,.mpg-prow4{grid-template-columns:1fr 1fr}.mpg-review{grid-template-columns:1fr}.mpg-sum{padding:22px}.mpg-sum h2{font-size:24px}.mpg-sum-g{gap:16px}.mpg-dt-nums{grid-template-columns:1fr 1fr}.mpg-cta{width:100%}.mpg-nav .mpg-cta{width:auto}.mpg-views{display:flex}.mpg-views button{flex:1;padding:9px 8px;font-size:14px}}\n\n@media print{\n  @page{margin:14mm}\n  body.mpg-printing > *:not(#mpg-print-root){display:none !important}\n  body:not(.mpg-printing) .mpg-tools,body:not(.mpg-printing) .mpg-views{display:none}\n  #mpg-print-root .mpg-print{display:block;width:100%;font-family:Georgia,serif;color:#1f2733}\n  #mpg-print-root img{max-width:100%}\n  .mpg-print a{color:#12294A;text-decoration:none}\n  .mpg-print h1{font-size:28pt;margin:0 0 12px;color:#12294A}\n  .mpg-print h2{font-size:15pt;margin:0 0 10px;color:#12294A;border-bottom:2px solid #C09A4E;padding-bottom:4px}\n  .mpg-print h2 small{font-size:9.5pt;color:#5f6876;font-family:system-ui}\n  .mpg-print h3{font-size:11pt;margin:8px 0 4px;color:#12294A}\n  .pp-brand{font:600 9pt system-ui;letter-spacing:.1em;text-transform:uppercase;color:#C09A4E;margin:0 0 6px}\n  .pp-cover{break-after:page}\n  .pp-sum{display:flex;gap:10px;margin-bottom:16px}\n  .pp-notes{margin-top:14px;font-family:system-ui;font-size:9pt;color:#2b3340;break-inside:avoid}.pp-notes h3{font-size:10pt;margin:0 0 6px}.pp-note{margin:0 0 6px;padding:6px 10px;border-left:3px solid #C9A227;background:#FAF6EE}\n  .pp-sum div{flex:1;background:#F4EDE1;border-radius:8px;padding:8px 10px;font-family:system-ui}\n  .pp-sum span{display:block;font-size:8pt;color:#5f6876;text-transform:uppercase}\n  .pp-sum b{font-size:12pt;color:#12294A}\n  .pp-week{width:100%;border-collapse:collapse;font:8.5pt system-ui;table-layout:fixed}\n  .pp-week th,.pp-week td{border:1px solid #E7E1D4;padding:5px;vertical-align:top;text-align:left}\n  .pp-week td img{display:block;width:100%;height:42px;object-fit:cover;border-radius:4px;margin-bottom:3px}\n  .pp-week thead th{background:#12294A;color:#fff}\n  .pp-week tbody th{background:#F4EDE1;width:62px}\n  .pp-week em{color:#8a6a2a}\n  .pp-tot td{background:#fbf7ee;font-weight:600}\n  .pp-day{break-inside:avoid;margin-bottom:16px}\n  .pp-it{display:flex;gap:12px;align-items:center;margin-bottom:8px;break-inside:avoid}\n  .pp-it img{width:96px;height:64px;min-width:96px;object-fit:cover;border-radius:6px}\n  .pp-it p{margin:0}\n  .pp-m{font:700 8pt system-ui;text-transform:uppercase;letter-spacing:.06em;color:#C09A4E}\n  .pp-n{font-size:12pt;font-weight:700}\n  .pp-x{font:9pt system-ui;color:#5f6876}\n  .pp-u{font:8pt system-ui}\n  .pp-shop{break-before:page;break-after:page}\n  .pp-days .pp-day:last-child,.pp-tips{break-after:auto}\n  .pp-day{break-inside:avoid}\n  .pp-link a{word-break:break-all}\n  .pp-tips{break-before:avoid}\n  .pp-shop-g{columns:3;column-gap:18px;font:9pt system-ui}\n  .pp-shop-g>div{break-inside:avoid;margin-bottom:8px}\n  .pp-shop-g ul{list-style:none;margin:0;padding:0}\n  .pp-shop-g li{padding:2px 0;display:flex;gap:6px;align-items:center}\n  .pp-box{display:inline-block;width:9px;height:9px;border:1px solid #5f6876;border-radius:2px;flex:none}\n  .pp-tips{margin-top:16px;font:10pt system-ui;break-inside:avoid}\n  .pp-recipes{break-before:page}\n  .pp-rcp{break-inside:avoid;border-top:2px solid #E7E1D4;padding-top:10px;margin-bottom:14px}\n  .pp-rcp-h{display:flex;gap:12px;align-items:center;margin-bottom:6px}\n  .pp-rcp-h img{width:88px;height:58px;min-width:88px;object-fit:cover;border-radius:6px}\n  .pp-rcp-h p,.pp-rcp-h h3{margin:0}\n  .pp-rcp h3{font-size:12.5pt}\n  .pp-rcp-b{display:grid;grid-template-columns:1fr 1.5fr;gap:16px;font:8.8pt/1.4 system-ui}\n  .pp-rcp-b h4{font:700 8pt system-ui;text-transform:uppercase;letter-spacing:.06em;color:#C09A4E;margin:0 0 4px}\n  .pp-rcp-b ul,.pp-rcp-b ol{margin:0;padding-left:16px}\n  .pp-rcp-b li{margin-bottom:2px}\n  .pp-rcp-b p{margin:0 0 4px}\n  .pp-tips li{margin-bottom:4px}\n}\n";
  var st = document.createElement('style'); st.id = 'mpg-css'; st.textContent = css; document.head.appendChild(st);
  var MEAL = { breakfast: 'B', lunch: 'L', dinner: 'D', snack: 'S' };
  var GOAL = { testosterone: 't', menopause: 'm', insulin: 'b', 'blood-sugar': 'b', sleep: 's' };
  function num(t) { var n = parseFloat(String(t || '').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; }
  var out = [], seen = {}, bad = [];
  document.querySelectorAll('[data-mpg-list]').forEach(function (block) {
    block.querySelectorAll("[data-f='slug']").forEach(function (slugEl) {
      var rec = slugEl.parentNode; if (!rec) return;
      function v(k) { var el = rec.querySelector("[data-f='" + k + "']"); return el ? (el.textContent || '').trim() : ''; }
      var s = v('slug'); if (!s || seen[s]) return; seen[s] = 1;
      var img = rec.querySelector("[data-f='photo']"), fl = '';
      rec.querySelectorAll('[data-g]').forEach(function (g) { if (g.classList.contains('w-condition-invisible') || g.closest('.w-condition-invisible')) return; var k = GOAL[g.getAttribute('data-g')]; if (k && fl.indexOf(k) < 0) fl += k; });
      var r = { s: s, n: v('name'), img: img ? (img.getAttribute('src') || '') : '', m: MEAL[v('meal').toLowerCase()] || '', k: num(v('kcal')), p: num(v('protein')), c: num(v('carbs')), f: num(v('fat')), t: num(v('time')), d: v('diet').toLowerCase(), g: v('tags').toLowerCase().split(',').map(function (x) { return x.trim(); }).filter(Boolean).join(', '), sv: v('serves'), fl: fl };
      if (!r.n || !r.m || !r.k || !r.g) { bad.push(s); return; }
      out.push(r);
    });
  });
  if (bad.length) console.error('[mpg ' + VERSION + '] recipes skipped (missing name, meal, kcal or tags):', bad);
  var root = document.getElementById('mpg') || document.querySelector('[data-mpg-mount]');
  if (!root) { console.error('[mpg] mount not found'); window.MPG_FAILED = true; return; }
  root.id = 'mpg';
  if (out.length < 40) {
    console.error('[mpg ' + VERSION + '] only ' + out.length + ' recipes found in [data-mpg-list]');
    root.innerHTML = '<p style="padding:24px;text-align:center">Sorry, the meal plan generator could not load its recipes. Please refresh the page.</p>';
    window.MPG_FAILED = true; return;
  }
  window.MPG_DATA = out;
  window.MPG_SITE = location.origin;
  window.MPG_HERO = 'https://cdn.prod.website-files.com/69ff750b2b104a42071c24b4/6ae70847dc607490fcf02f54_Healthy%20Meal%20Prep%20with%20Fresh%20Ingredients.jpg';
  window.MPG_HERO_SIDE = 'right';
  window.MPG_VERSION = VERSION;
})();

// Meal plan generator engine v6 (pure functions; no DOM). Works in browser and Node.
(function (root) {
  'use strict';

  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; };
  }

  var ACT = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  var FLOOR = { female: 1200, male: 1500 };
  var MIN_POOL = 4;           // fewer suitable recipes than this for a meal = no plan
  var LEFTOVER_DAYS = [1, 3, 5]; // Day 2, 4 and 6 lunches reuse the previous dinner

  var EXCL = {
    fish: ['salmon', 'tuna', 'mackerel', 'cod', 'trout', 'sardine', 'sea bass', 'fish', 'anchov', 'hake', 'haddock', 'kipper'],
    shellfish: ['prawn', 'shrimp', 'mussel', 'oyster', 'crab', 'scallop', 'squid', 'lobster', 'clam'],
    nuts: ['almond', 'walnut', 'cashew', 'pistachio', 'brazil', 'hazelnut', 'pecan', 'pine nut', 'macadamia'],
    peanuts: ['peanut'],
    eggs: ['egg'],
    dairy: ['milk', 'yogurt', 'yoghurt', 'cheese', 'feta', 'ricotta', 'halloumi', 'butter', 'cream', 'kefir', 'parmesan', 'cottage', 'mozzarella', 'crème', 'creme fraiche', 'paneer', 'labneh', 'ghee', 'emmental', 'cheddar'],
    sesame: ['sesame', 'tahini'],
    soya: ['tofu', 'soy', 'soya', 'tamari', 'edamame', 'miso', 'tempeh'],
    mushrooms: ['mushroom'],
    pork: ['pork', 'bacon', ' ham ', 'chorizo', 'pancetta', 'prosciutto', 'sausage', 'salami', 'lardons', 'gammon'],
    red_meat: ['beef', 'lamb', 'steak', 'pork', 'venison', 'sirloin', 'veal', 'mutton', 'bacon', ' ham ', 'chorizo', 'pancetta', 'prosciutto', 'sausage', 'salami', 'lardons', 'gammon', 'goat meat']
  };
  var NOT_DAIRY = ['soya milk', 'soy milk', 'oat milk', 'almond milk', 'coconut milk', 'oat cream', 'oat cooking cream', 'coconut cream', 'peanut butter', 'almond butter', 'cashew butter', 'nut butter', 'butter beans', 'soya yogurt', 'soy yogurt', 'coconut yogurt', 'butternut'];
  var NOT_MEAT = ['tuna steak', 'salmon steak', 'cauliflower steak'];
  // Ingredients that carry allergens which their names do not show.
  var HIDDEN = [
    ['hummus', ['sesame']], ['houmous', ['sesame']], ['tahini', ['sesame']], ['halva', ['sesame']], ['za\'atar', ['sesame']], ['dukkah', ['sesame', 'nuts']],
    ['hoisin', ['soya', 'gluten']], ['teriyaki', ['soya', 'gluten']], ['soy sauce', ['soya', 'gluten']], ['tamari', ['soya']], ['miso', ['soya']], ['gochujang', ['soya']], ['edamame', ['soya']], ['tempeh', ['soya']],
    ['kimchi', ['fish', 'shellfish']], ['fish sauce', ['fish']], ['worcestershire', ['fish']], ['anchov', ['fish']], ['caesar', ['fish', 'eggs', 'dairy']],
    ['curry paste', ['fish', 'shellfish']], ['massaman', ['fish', 'shellfish', 'peanuts']], ['shrimp paste', ['shellfish']], ['oyster sauce', ['shellfish']], ['xo sauce', ['shellfish']],
    ['pesto', ['nuts', 'dairy']], ['marzipan', ['nuts']], ['praline', ['nuts']], ['nut butter', ['nuts']], ['satay', ['peanuts']],
    ['mayonnaise', ['eggs']], ['mayo', ['eggs']], ['aioli', ['eggs']], ['egg noodles', ['eggs', 'gluten']], ['tagliatelle', ['eggs']], ['fresh pasta', ['eggs']], ['brioche', ['eggs', 'dairy']], ['meringue', ['eggs']],
    ['tzatziki', ['dairy']], ['raita', ['dairy']], ['naan', ['dairy', 'gluten']], ['milk chocolate', ['dairy']], ['whey', ['dairy']]
  ];
  function hiddenHit(g, e) { for (var i = 0; i < HIDDEN.length; i++) if (HIDDEN[i][1].indexOf(e) >= 0 && g.indexOf(HIDDEN[i][0]) >= 0) return true; return false; }

  // Safety net on top of the gluten-free tag: these always contain gluten unless labelled otherwise.
  var GLUTEN = /\b(sourdough|bread|rye|wholewheat|wholemeal|wheat|spelt|pasta|spaghetti|tagliatelle|linguine|penne|macaroni|bulgur|couscous|barley|pitta|pita|noodles?|soy sauce|seitan|breadcrumbs?|panko|crackers?|croissant|bagel|cannelloni|lasagne)\b/;
  var ALLERGENS = ['gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'nuts', 'peanuts', 'sesame', 'soya'];
  var BAD_LEFTOVER = ['oyster', 'mussel', 'toast', 'fried egg', 'poached egg', 'sardine', 'poke', 'seared', 'tuna steak', 'steak', 'sashimi', 'raw salmon', 'smoked salmon', 'carpaccio', 'tartare'];

  function has(g, keys) { for (var j = 0; j < keys.length; j++) if (g.indexOf(keys[j]) >= 0) return true; return false; }
  function strip(g, words) { words.forEach(function (w) { g = g.split(w).join(' '); }); return g; }

  function excluded(r, ex) {
    var g = ' ' + r.g.replace(/,/g, ' , ') + ' ';
    for (var i = 0; i < ex.length; i++) {
      var e = ex[i];
      if (e !== 'gluten' && hiddenHit(g, e) && !(e === 'dairy' && /vegan/.test(r.d))) return true;
      if (e === 'gluten') { var gg = r.g.replace(/gluten-free [a-z]+/g, ''); if (!/gluten-free/.test(r.d) || GLUTEN.test(gg) || /hoisin|teriyaki|egg noodles|naan/.test(gg)) return true; continue; }
      if (e === 'dairy') { if (/vegan/.test(r.d)) continue; if (has(strip(g, NOT_DAIRY), EXCL.dairy) || /protein powder|whey/.test(g)) return true; continue; }
      if (e === 'eggs') { if (/\beggs?\b|egg whites?|egg yolks?/.test(g)) return true; continue; }
      if (e === 'soya') { if (has(strip(g, ['soy yogurt']), EXCL.soya) || /soy yogurt|soya yogurt/.test(g)) return true; continue; }
      if (e === 'red_meat' || e === 'pork') { if (has(strip(g, NOT_MEAT), EXCL[e])) return true; continue; }
      if (EXCL[e] && has(g, EXCL[e])) return true;
    }
    return false;
  }

  function dietOk(r, diet) {
    if (!diet || diet === 'any') return true;
    if (diet === 'vegetarian') return /vegetarian/.test(r.d);
    if (diet === 'vegan') return /vegan/.test(r.d);
    if (diet === 'pescatarian') return /vegetarian/.test(r.d) || (!excluded(r, ['red_meat', 'pork']) && !/chicken|turkey|duck|liver/.test(r.g));
    return true;
  }

  function bmi(o) { var h = o.height / 100; return o.weight / (h * h); }

  function targets(o) {
    var w = +o.weight, h = +o.height, a = +o.age;
    var bmr = 10 * w + 6.25 * h - 5 * a + (o.sex === 'male' ? 5 : -161);
    var tdee = bmr * (ACT[o.activity] || 1.375);
    var kcal = tdee;
    if (o.goal === 'lose') kcal = tdee - Math.min(500, tdee * 0.2);
    var b = w / ((h / 100) * (h / 100)), noSurplus = false, noDeficit = false;
    if (o.goal === 'gain') { if (b >= 30) noSurplus = true; else kcal = tdee + 300; }
    var floor = FLOOR[o.sex] || 1200, floored = false;
    if (kcal < floor) { kcal = floor; floored = true; }
    if (o.goal === 'lose' && floor >= tdee - 100) { noDeficit = true; floored = false; kcal = Math.max(tdee, floor); }
    // Protein is based on a healthy weight (BMI 25 at the user's height) when the user is above it,
    // so targets stay realistic for larger bodies.
    var refW = Math.min(w, 25 * (h / 100) * (h / 100));
    var pPerKg = (o.goal === 'gain' ? 1.6 : o.goal === 'lose' ? 1.4 : 1.2) + (o.activity === 'moderate' || o.activity === 'active' ? 0.2 : 0);
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal: Math.round(kcal / 10) * 10, protein: Math.round(refW * pPerKg / 5) * 5, floored: floored, noDeficit: noDeficit, noSurplus: noSurplus, lowBmi: b < 17 };
  }

  // Returns a list of problems that make a safe plan impossible, or [] if fine.
  function check(o) {
    var out = [];
    if (!(o.age >= 18 && o.age <= 100)) out.push('age');
    if (!(o.height >= 130 && o.height <= 220)) out.push('height');
    if (!(o.weight >= 35 && o.weight <= 250)) out.push('weight');
    if (out.length) return out;
    if (o.goal === 'lose' && bmi(o) < 18.5) out.push('underweight');
    return out;
  }

  function split(meals) { return meals === 4 ? { B: 0.25, L: 0.30, D: 0.35, S: 0.10 } : { B: 0.28, L: 0.32, D: 0.40 }; }

  // Portion limits: snacks can be halved for small targets; single-serve dishes are not doubled;
  // very large targets may take 2.5 servings at lunch and dinner; blood sugar plans keep carbs in check.
  var CTX = { big: false, bs: false };
  function maxMult(r, meal) {
    var hi = (CTX.big && (meal === 'L' || meal === 'D')) ? 2.5 : 2;
    if (/^Serves 1\b/.test(r.sv || '')) hi = Math.min(hi, 1.5);
    if (CTX.bs) { var cap = meal === 'S' ? 25 : 60; hi = Math.min(hi, Math.max(1, Math.floor(cap / Math.max(1, r.c) * 2) / 2)); }
    return hi;
  }
  function minMult(r, meal) { return meal === 'S' ? 0.5 : 1; }
  function servingsFor(r, slotKcal, meal) {
    var m = Math.round(slotKcal / r.k * 2) / 2;
    return Math.max(minMult(r, meal), Math.min(maxMult(r, meal), m));
  }

  function poolFor(data, o, meal) {
    var ex = o.exclude || [];
    var base = data.filter(function (r) { return r.m === meal && dietOk(r, o.diet) && !excluded(r, ex); });
    var notes = [];
    // Blood sugar focus comes first: tagged recipes, else any recipe with moderate carbs. Never recipes above the carb cap;
    // if too few remain, the plan is blocked and the user is offered general health instead.
    if (o.focus === 'b') {
      var capS = meal === 'S' ? 25 : 55, capM = meal === 'S' ? 25 : 60;
      var bs = base.filter(function (r) { return r.fl.indexOf('b') >= 0 && r.c <= capS; });
      if (bs.length >= MIN_POOL) base = bs;
      else { notes.push('bs-short'); base = base.filter(function (r) { return r.c <= capM; }); }
    }
    var list = base;
    if (o.maxTime && base.length >= MIN_POOL) {
      var quick = base.filter(function (r) { return r.t <= o.maxTime; });
      if (quick.length >= MIN_POOL) list = quick;
      else {
        // Too few recipes within the limit: stretch it in 15-minute steps only as far as needed, never further.
        var lim = o.maxTime;
        while (quick.length < MIN_POOL) { lim += 15; quick = base.filter(function (r) { return r.t <= lim; }); }
        list = quick; notes.unshift('time-relaxed=' + lim);
      }
    }
    return { list: list, note: notes.length ? notes.join('+') : null };
  }

  // How many recipes each meal would have if one constraint were relaxed: used to suggest fixes.
  function relaxOptions(data, o) {
    var tries = [];
    if (o.maxTime) tries.push({ key: 'maxTime', label: 'Remove the cooking-time limit', o: Object.assign({}, o, { maxTime: 0 }) });
    if (o.focus === 'b') tries.push({ key: 'focus', label: 'Use general health instead of blood sugar', o: Object.assign({}, o, { focus: 'g' }) });
    if (+o.meals === 4) tries.push({ key: 'meals', label: 'Skip the snack', o: Object.assign({}, o, { meals: 3 }) });
    var singles = tries.slice();
    for (var i = 0; i < singles.length; i++) for (var j = i + 1; j < singles.length; j++) {
      var A = singles[i], B = singles[j], oo = Object.assign({}, A.o);
      ['maxTime', 'focus', 'meals'].forEach(function (k) { if (B.o[k] !== o[k]) oo[k] = B.o[k]; });
      oo.exclude = (A.o.exclude || []).filter(function (x) { return (B.o.exclude || []).indexOf(x) >= 0; });
      tries.push({ key: A.key + '|' + B.key, label: A.label + ', and ' + B.label.charAt(0).toLowerCase() + B.label.slice(1), o: oo });
    }
    return tries.map(function (t) {
      var sp = split(+t.o.meals || 3), min = 1e9;
      Object.keys(sp).forEach(function (m) { min = Math.min(min, poolFor(data, t.o, m).list.length); });
      return { key: t.key, label: t.label, min: min, o: t.o };
    }).filter(function (t) { return t.min >= MIN_POOL; }).sort(function (a, b) { return (a.key.split('|').length - b.key.split('|').length) || (b.min - a.min); }).slice(0, 3);
  }

  var MAIN = ['chickpea', 'tofu', 'chicken', 'salmon', 'egg', 'beef', 'lentil', 'prawn', 'tuna', 'mackerel', 'turkey', 'cottage cheese', 'black bean', 'cod', 'lamb', 'oats', 'greek yogurt', 'quinoa'];
  function keysOf(r) { var g = ' ' + r.g + ' '; return MAIN.filter(function (k) { return k === 'egg' ? /\beggs?\b/.test(g) : g.indexOf(k) >= 0; }); }
  function overlap(r, dayKeys) { if (!dayKeys) return 0; return keysOf(r).filter(function (k) { return dayKeys.indexOf(k) >= 0; }).length; }

  function score(r, slotKcal, o, used, meal, rand, need, dayKeys) {
    var m = servingsFor(r, slotKcal, meal);
    var s = Math.abs(r.k * m - slotKcal) / slotKcal * 3;
    s += (used[r.s] || 0) * 2.5;
    var pShare = r.p * 4 / Math.max(1, r.k);               // share of calories from protein
    s -= pShare * (need === 'over' ? -3.5 : need ? 2.2 : 1.0); // favour protein when short, ease off when well over target
    if (o.focus && o.focus !== 'g' && r.fl.indexOf(o.focus) >= 0) s -= 0.5;
    if (o.focus === 's' && (meal === 'D' || meal === 'S') && r.fl.indexOf('s') >= 0) s -= 0.6;
    if (o.focus === 'b') { var cap = meal === 'S' ? 20 : 50; if (r.c * m > cap) s += (r.c * m - cap) / 25; }
    if (r.f * 9 / Math.max(1, r.k) > 0.45) s += 0.35;
    if (meal === 'B' && !o.maxTime && r.t > 20) s += 0.6;   // weekday breakfasts should be quick
    if (o.maxTime && r.t > o.maxTime) s += 0.8 + (r.t - o.maxTime) / 30;
    if (r.k * 2 < slotKcal * 0.85) s += 1.2;                // even a double portion is too small for this slot
    s += overlap(r, dayKeys) * 0.7;                       // avoid the same main ingredient twice in a day
    return s + rand() * 0.9;
  }

  function pick(list, slotKcal, o, used, meal, rand, avoid, need, dayKeys) {
    var best = null, bs = 1e9;
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (avoid && avoid[r.s]) continue;
      var s = score(r, slotKcal, o, used, meal, rand, need, dayKeys);
      if (s < bs) { bs = s; best = r; }
    }
    return best;
  }

  function goodLeftover(r) { return r && !/^Serves 1\b/.test(r.sv) && !BAD_LEFTOVER.some(function (w) { return (r.g + ' ' + r.n.toLowerCase()).indexOf(w) >= 0; }); }

  function generate(data, o) {
    var t = targets(o);
    setCtx(o, t);
    var sp = split(+o.meals || 3), meals = Object.keys(sp), rand = rng(+o.seed || 1);
    var pools = {}, notes = [], blocked = [];
    meals.forEach(function (m) {
      var p = poolFor(data, o, m); pools[m] = p.list;
      if (p.note) notes.push(p.note + ':' + m);
      if (p.list.length < MIN_POOL) blocked.push(m);
    });
    var plan = { targets: t, days: [], notes: notes, pools: pools, split: sp, blocked: blocked, o: o };
    if (blocked.length) { plan.relax = relaxOptions(data, o); return plan; }
    var used = {}, nDays = +o.days || 7;
    for (var d = 0; d < nDays; d++) {
      var day = { items: [] }, pSoFar = 0;
      meals.forEach(function (m, mi) {
        var slot = t.kcal * sp[m], r = null, leftover = false;
        if (o.leftovers && m === 'L' && LEFTOVER_DAYS.indexOf(d) >= 0) {
          var prev = plan.days[d - 1].items.filter(function (x) { return x.meal === 'D'; })[0];
          if (prev && goodLeftover(prev.r)) { r = prev.r; leftover = true; }
        }
        var share = 0; for (var k = 0; k <= mi; k++) share += sp[meals[k]];
        var pDue = t.protein * (share - sp[m]), need = pSoFar < pDue * 0.95;
        if (o.diet === 'vegetarian' || o.diet === 'vegan') need = true;
        if (mi > 0 && pSoFar > pDue * 1.2) need = 'over';
        if (!r) r = pick(pools[m], slot, o, used, m, rand, null, need, dayKeysOf(day));
        if (!leftover) used[r.s] = (used[r.s] || 0) + 1;
        var it = { meal: m, r: r, mult: servingsFor(r, slot, m), slot: slot, leftover: leftover };
        pSoFar += r.p * it.mult;
        day.items.push(it);
      });
      plan.days.push(balance(totals(day), t, meals));
    }
    linkLeftovers(plan);
    return plan;
  }

  // Dinners that feed tomorrow's lunch: record how much to cook in total.
  function linkLeftovers(plan) {
    plan.days.forEach(function (day, d) {
      day.items.forEach(function (it) { if (it.meal === 'D') it.cookFor = null; });
      var next = plan.days[d + 1];
      if (!next) return;
      var lunch = next.items.filter(function (x) { return x.meal === 'L'; })[0];
      var dinner = day.items.filter(function (x) { return x.meal === 'D'; })[0];
      if (lunch && lunch.leftover && dinner) {
        if (!goodLeftover(dinner.r)) {
          // This dinner does not keep: give tomorrow a fresh lunch instead.
          var avoid = {}; avoid[dinner.r.s] = 1;
          var nr = plan.pools.L ? pick(plan.pools.L, lunch.slot, plan.o || {}, usedMap(plan), 'L', rng(d * 131 + 17), avoid, false, null) : null;
          lunch.leftover = false; if (nr) { lunch.r = nr; lunch.mult = servingsFor(nr, lunch.slot, 'L'); }
          totals(next); return;
        }
        if (lunch.r.s !== dinner.r.s) { lunch.r = dinner.r; lunch.mult = servingsFor(dinner.r, lunch.slot, 'L'); totals(next); }
        dinner.cookFor = dinner.mult + lunch.mult;
        dinner.makes = serves(dinner.r);
      }
    });
  }

  // Nudge portions by half servings until the day is within about 8% of target.
  function balance(day, t, meals) {
    for (var guard = 0; guard < 6; guard++) {
      var diff = day.kcal - t.kcal;
      if (Math.abs(diff) <= t.kcal * 0.08) break;
      var best = null, gain = 0;
      day.items.forEach(function (it) {
        if (it.leftover) return;
        var hi = maxMult(it.r, it.meal), step = diff < 0 ? 0.5 : -0.5, nm = it.mult + step;
        if (nm < minMult(it.r, it.meal) || nm > hi) return;
        var after = Math.abs(diff + it.r.k * step);
        if (Math.abs(diff) - after > gain) { gain = Math.abs(diff) - after; best = it; }
      });
      if (!best) break;
      best.mult += diff < 0 ? 0.5 : -0.5; totals(day);
    }
    return day;
  }

  function totals(day) {
    var k = 0, p = 0, c = 0, f = 0;
    day.items.forEach(function (x) { if (x.r) { k += x.r.k * x.mult; p += x.r.p * x.mult; c += x.r.c * x.mult; f += x.r.f * x.mult; } });
    day.kcal = Math.round(k); day.p = Math.round(p); day.c = Math.round(c); day.f = Math.round(f);
    return day;
  }

  // Large portions are allowed when the biggest meal slot is over 1,000 kcal (3 meals from about 2,500 kcal, 4 meals from about 2,850).
  function setCtx(o, t) { CTX.big = t.kcal * (+o.meals === 4 ? 0.35 : 0.40) > 1000; CTX.bs = o.focus === 'b'; }
  function serves(r) { var m = /(\d+)/.exec(r.sv || ''); return m ? +m[1] : 0; }
  function dayKeysOf(day) { var k = []; day.items.forEach(function (x) { if (x.r) k = k.concat(keysOf(x.r)); }); return k; }

  function usedMap(plan) { var u = {}; plan.days.forEach(function (dd) { dd.items.forEach(function (x) { if (x.r && !x.leftover) u[x.r.s] = (u[x.r.s] || 0) + 1; }); }); return u; }

  // Replace one meal. Swapping a leftover lunch turns it into a fresh lunch; swapping a dinner updates tomorrow's leftovers.
  function swap(plan, o, d, idx, seed, forceSlug, forceMult) {
    setCtx(o, plan.targets);
    var day = plan.days[d], it = day.items[idx], rand = rng(seed || 7), r;
    if (forceSlug) r = plan.pools[it.meal].filter(function (x) { return x.s === forceSlug; })[0] || (it.r && it.r.s === forceSlug ? it.r : null);
    // Remember what this meal slot has already shown, so repeated swaps keep offering something new.
    plan.seen = plan.seen || {};
    var key = d + ',' + idx, seen = plan.seen[key] = plan.seen[key] || [];
    if (it.r && seen.indexOf(it.r.s) < 0) seen.push(it.r.s);
    if (!r) {
      var avoid = {}; seen.forEach(function (x) { avoid[x] = 1; });
      var others = dayKeysOf({ items: day.items.filter(function (x, j) { return j !== idx; }) });
      r = pick(plan.pools[it.meal], it.slot, o, usedMap(plan), it.meal, rand, avoid, false, others);
      if (!r) { seen.length = 0; if (it.r) seen.push(it.r.s); avoid = {}; if (it.r) avoid[it.r.s] = 1; r = pick(plan.pools[it.meal], it.slot, o, usedMap(plan), it.meal, rand, avoid, false, others); }
    }
    if (!r) return false;
    if (seen.indexOf(r.s) < 0) seen.push(r.s);
    var next = plan.days[d + 1], nl = next && next.items.filter(function (x) { return x.meal === 'L'; })[0], before = nl ? nl.r.s : null, wasLo = !!(nl && nl.leftover);
    day.items[idx] = { meal: it.meal, r: r, mult: forceMult || servingsFor(r, it.slot, it.meal), slot: it.slot, leftover: false };
    totals(day);
    if (!forceMult) balance(day, plan.targets, Object.keys(plan.split));
    linkLeftovers(plan);
    // 'match': tomorrow's leftover lunch now follows this dinner; 'fresh': this dinner does not keep, so tomorrow gets a fresh lunch.
    var lc = nl && (nl.r.s !== before || (wasLo && !nl.leftover)) ? (nl.leftover ? 'match' : 'fresh') : null;
    return { ok: true, lunchChanged: lc };
  }

  // The best few replacements for one meal, for the user to choose from.
  function alternatives(plan, o, d, idx, n) {
    setCtx(o, plan.targets);
    var day = plan.days[d], it = day.items[idx], used = usedMap(plan), others = dayKeysOf({ items: day.items.filter(function (x, j) { return j !== idx; }) });
    var inDay = {}; day.items.forEach(function (x) { if (x.r) inDay[x.r.s] = 1; });
    var fixed = function () { return 0.45; };
    var seen = (plan.seen && plan.seen[d + ',' + idx]) || [];
    var pool = plan.pools[it.meal].filter(function (r) { return !inDay[r.s]; });
    plan.offered = plan.offered || {};
    var key = d + ',' + idx, offered = plan.offered[key] || [];
    var fresh = pool.filter(function (r) { return seen.indexOf(r.s) < 0; });
    if (fresh.length >= (n || 4)) pool = fresh;
    // Each time the picker opens again, show ideas it has not shown yet, while there are enough.
    var unseen = pool.filter(function (r) { return offered.indexOf(r.s) < 0; });
    if (unseen.length >= (n || 4)) pool = unseen; else offered = [];
    var out = pool
      .map(function (r) { return { r: r, s: score(r, it.slot, o, used, it.meal, fixed, false, others), mult: servingsFor(r, it.slot, it.meal) }; })
      .sort(function (a, b) { return a.s - b.s; }).slice(0, n || 4);
    // Show the portion the swap will really use: the same balancing pass the swap runs afterwards.
    out.forEach(function (a) {
      var items = day.items.map(function (x, j) { return j === idx ? { meal: it.meal, r: a.r, mult: a.mult, slot: it.slot, leftover: false } : Object.assign({}, x); });
      balance(totals({ items: items }), plan.targets, Object.keys(plan.split)); a.mult = items[idx].mult;
    });
    plan.offered[key] = offered.concat(out.map(function (x) { return x.r.s; }));
    return out;
  }

  // How many recipes fit each meal with the current choices (used to warn before a plan is blocked).
  function poolSizes(data, o) {
    var t = targets(o), meals = +o.meals === 4 ? ['B', 'L', 'D', 'S'] : ['B', 'L', 'D'], out = {};
    meals.forEach(function (m) { out[m] = poolFor(data, o, m).list.length; });
    return out;
  }

  // New ideas for every non-leftover meal of one day.
  function reroll(plan, o, d, seed) {
    var changed = false;
    plan.days[d].items.forEach(function (it, i) { if (!it.leftover) { var res = swap(plan, o, d, i, seed + i * 977); if (res && res.lunchChanged) changed = res.lunchChanged; } });
    return { ok: true, lunchChanged: changed };
  }

  function why(it, o) {
    var r = it.r, m = it.mult, out = [];
    if (it.leftover) out.push("Leftovers from last night's dinner, so no cooking");
    if (it.cookFor) out.push('Cook ' + fmtServ(it.cookFor) + ' tonight: the rest is tomorrow\'s lunch' + (it.makes && it.cookFor > it.makes ? ' (the recipe makes ' + it.makes + ', so scale it up)' : ''));
    var P = Math.round(r.p * m);
    if (o.focus === 'b' && r.fl.indexOf('b') >= 0 && r.c * m <= 50) out.push('lower in carbohydrate');
    if (o.focus === 's' && r.fl.indexOf('s') >= 0) out.push('a sleep-friendly evening choice');
    if (r.t <= 15 && !it.leftover) out.push('ready in ' + r.t + ' minutes');
    return out.slice(0, 3);
  }

  // Compact plan code for links: slug and servings (x2) per meal, '_' marks a leftover lunch.
  function encode(plan) {
    return plan.days.map(function (d) { return d.items.map(function (x) { return x.leftover ? '_' : x.r.s + '*' + Math.round(x.mult * 2); }).join(','); }).join('~');
  }
  // Rebuild a plan from a code. Recipes that no longer exist or no longer fit are replaced.
  function decode(data, o, code) {
    var plan = generate(data, o);
    if (plan.blocked.length || !code) return plan;
    var by = {}; data.forEach(function (r) { by[r.s] = r; });
    var days = String(code).split('~');
    if (days.length !== plan.days.length) { plan.restoreFailed = true; return plan; }
    var changed = 0;
    days.forEach(function (dc, d) {
      var items = dc.split(','), day = plan.days[d];
      if (items.length !== day.items.length) { plan.restoreFailed = true; return; }
      items.forEach(function (ic, i) {
        var it = day.items[i];
        if (ic === '_') { if (d > 0 && it.meal === 'L') it.leftover = true; return; }
        var p = ic.split('*'), r = by[p[0]], m = r ? Math.max(minMult(r, it.meal), Math.min(maxMult(r, it.meal), Math.round(+p[1] || 2) / 2)) : 1;
        var ok = r && plan.pools[it.meal].indexOf(r) >= 0;
        if (ok) { day.items[i] = { meal: it.meal, r: r, mult: m, slot: it.slot, leftover: false }; } else changed++;
      });
      totals(day);
    });
    linkLeftovers(plan);
    plan.days.forEach(totals);
    plan.restored = true; plan.replaced = changed;
    return plan;
  }

  function fmtServ(n) { if (n === 0.5) return 'Half a serving'; var w = Math.floor(n), h = n - w >= 0.5; return (w ? w : '') + (h ? '½' : '') + (n === 1 ? ' serving' : n === 0.5 ? ' serving' : ' servings'); }

  var API = { poolFor: poolFor, alternatives: alternatives, poolSizes: poolSizes, HIDDEN: HIDDEN, maxMult: maxMult, encode: encode, decode: decode, ALLERGENS: ALLERGENS, generate: generate, swap: swap, reroll: reroll, targets: targets, check: check, why: why, servingsFor: servingsFor, excluded: excluded, dietOk: dietOk, fmtServ: fmtServ, bmi: bmi, EXCL: EXCL, MIN_POOL: MIN_POOL };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.MPG = API;
})(window);

(function () {
  'use strict';
  if (window.MPG_FAILED || !window.MPG_DATA) return;
  var E = window.MPG, DATA = window.MPG_DATA, SITE = window.MPG_SITE || '';
  var root = document.getElementById('mpg');
  var MEALS = { B: 'Breakfast', L: 'Lunch', D: 'Dinner', S: 'Snack' };
  var FOCUS = { g: 'General health', t: 'Testosterone', m: 'Menopause', b: 'Blood sugar', s: 'Better sleep' };
  var DIETS = { any: 'Everything', pescatarian: 'Pescatarian', vegetarian: 'Vegetarian', vegan: 'Vegan' };
  var GOALS = { lose: 'Lose weight', maintain: 'Stay the same', gain: 'Build muscle' };
  var ACTS = { sedentary: 1, light: 1, moderate: 1, active: 1 };
  var EXOK = { gluten: 1, dairy: 1, eggs: 1, fish: 1, shellfish: 1, nuts: 1, peanuts: 1, mushrooms: 1, pork: 1, red_meat: 1, sesame: 1, soya: 1 };
  var BY = {}; DATA.forEach(function (r) { BY[r.s] = r; });
  var state = { o: null, plan: null, day: 0, view: 'day', step: 0, units: 'metric', got: {}, code: null, undo: [], picker: null, editing: null };

  // ---------------- History and session ----------------
  var SS = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem('mpg-' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('mpg-' + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem('mpg-' + k); } catch (e) {} }
  };
  var depth = 0;
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function urlFor(screen) { return screen === 'plan' && state.o ? location.pathname + '#' + planParams() : location.pathname + (state.include ? '?include=' + encodeURIComponent(state.include) : ''); }
  function push(screen) { depth++; try { history.pushState({ mpg: screen, step: state.step, depth: depth }, '', urlFor(screen)); } catch (e) {} }
  function replace(screen) { try { history.replaceState({ mpg: screen, step: state.step, depth: depth }, '', urlFor(screen)); } catch (e) {} }
  window.addEventListener('popstate', function (e) {
    var h = e.state;
    if (state.cleared && (!h || h.mpg !== 'landing')) { landing(); replace('landing'); return; }
    if (!h || !h.mpg) { boot(true); return; }
    depth = h.depth || 0;
    if (h.mpg === 'form' && state.form) { state.step = h.step || 0; state.focusOnDraw = true; drawStep(); }
    else if (h.mpg === 'plan' && state.plan) {
      // Whatever plan is on screen is the one the URL must describe.
      state.picker = null; state.editing = null; SS.del('form');
      render(); writeURL(state.o); focusPlan();
    }
    else if (h.mpg === 'plan') boot(true);
    else { landing(); try { window.scrollTo(0, state.landingY || 0); } catch (e) {} }
  });
  function focusPlan() { var h = q('.mpg-sum h2') || q('h2'); if (h) h.focus({ preventScroll: true }); }
  function startAgain() {
    state.form = null; state.plan = null; state.o = null; state.editing = null; state.undo = []; state.picker = null; state.fromLink = false;
    SS.del('form'); SS.del('own');
    state.cleared = true; SS.set('cleared', 1); landing(); replace('landing'); try { root.scrollIntoView({ block: 'start' }); } catch (e) {}
  }
  function snap() { state.undo.push({ o: Object.assign({}, state.o), code: E.encode(state.plan), day: state.day }); if (state.undo.length > 10) state.undo.shift(); }
  function undo() {
    var u = state.undo.pop(); if (!u) return;
    var seen = state.plan && state.plan.seen; state.o = u.o; state.plan = E.decode(DATA, u.o, u.code); state.plan.seen = seen; state.day = u.day; state.picker = null;
    writeURL(state.o); render(state.undo.length ? '[data-act=undo]' : null); if (!state.undo.length) focusPlan();
    flash('Change undone');
  }

  function img(slug) { return BY[slug] ? BY[slug].img : ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function q(sel, el) { return (el || root).querySelector(sel); }
  function qa(sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); }
  function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }
  function brand(o) { return (o.sex === 'female' || o.focus === 'm') ? 'The Hormone Blueprint' : 'The Testosterone Blueprint'; }

  var ICON = {
    form: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6M8 3h8a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a1 1 0 0 1 1-1zm0 8h7m-7 4h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plate: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  // ---------------- Landing ----------------
  var MOCK = ['teriyaki-salmon-charred-spring-onions-rice', 'chicken-spinach-courgette-salad-feta-olives'];
  var SAMPLE = [['B', 'tofu-spinach-breakfast-muffins'], ['L', 'chicken-spinach-courgette-salad-feta-olives'], ['D', 'teriyaki-salmon-charred-spring-onions-rice'], ['S', 'tart-cherry-greek-yogurt-smoothie']];
  var FOCUS_CARDS = [
    ['t', 'Testosterone', 'Protein-rich meals built around whole foods', 'beef-broccoli-stir-fry-rice'],
    ['m', 'Menopause', 'Protein, calcium-rich foods and plenty of plants', 'spinach-ricotta-cannelloni-tomato-sauce'],
    ['b', 'Steady blood sugar', 'Lower-carb meals with fibre and protein', 'chicken-spinach-courgette-salad-feta-olives'],
    ['s', 'Better sleep', 'Lighter evening meals and sleep-friendly snacks', 'tart-cherry-greek-yogurt-smoothie']
  ];
  var FAQ = [
    ['Is the meal plan generator free?', 'Yes. You can create, change and print as many plans as you like without signing up.'],
    ['How are my calories worked out?', 'We use the Mifflin-St Jeor equation, which estimates the energy you burn at rest from your age, sex, height and weight, then multiply it by your activity level. For weight loss we take off up to 500 kcal a day, and for building muscle we add 300 kcal unless your BMI is 30 or more. We never go below 1,200 kcal for women or 1,500 kcal for men.'],
    ['Is there a meal plan for menopause?', 'Yes. Choose the menopause focus and your plan favours recipes tagged for menopause on our site: meals with good protein, calcium-rich foods such as yogurt, tofu and leafy greens, and plenty of plants and fibre. Each recipe page explains why it was chosen.'],
    ['Can I lose weight and build muscle at the same time?', 'Many people can, especially if they are new to strength training: eat a modest calorie deficit, get enough protein and lift weights two or three times a week. Choose "Lose weight" as your goal; your protein target is set higher to help you keep muscle.'],
    ['Where do the recipes come from?', 'Every meal is one of our own recipes, written to UK food safety guidance, with nutrition calculated per serving from USDA data. Each recipe page explains why it suits testosterone, menopause, blood sugar or sleep.'],
    ['Can I use it if I am vegetarian, vegan or avoid gluten?', 'Yes. Choose your diet and leave out gluten, dairy, eggs, fish, shellfish, tree nuts, peanuts, sesame, soya, mushrooms, pork or red meat. We never suggest dropping an allergy. Always check labels yourself: ingredients such as stock, curry paste and sauces vary by brand.'],
    ['Is this medical advice?', 'No. It is general guidance for healthy adults. If you are pregnant, breastfeeding, under 18, have an eating disorder, or take medicine for diabetes, talk to your GP or a registered dietitian first.']
  ];
  var GET = [
    ['plan', '7-day plan sized to you', 'Breakfast, lunch, dinner and an optional snack, with portions matched to your calories and protein.'],
    ['cart', 'Shopping list by aisle', 'Every ingredient for the week, grouped the way a supermarket is laid out. Tick off what you already have.'],
    ['swap', 'Swap any meal', 'Not keen on a meal? Pick from the best alternatives, or get new ideas for a whole day.'],
    ['print', 'Print it or save a PDF', 'Your plan, shopping list and recipe links in one tidy document for the fridge or your phone.']
  ];
  var ICON2 = {
    plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M9 3v4M15 3v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    tick: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  function cta(label) { return '<button class="mpg-cta" type="button" data-act="start">' + (label || 'Create my free plan') + '</button>'; }

  function landing(msg) {
    state.screen = 'landing'; var incR = state.include && BY[state.include]; root.classList.remove('mpg-padsticky');
    var heroImg = window.MPG_HERO || img('teriyaki-salmon-charred-spring-onions-rice');
    var dayRows = [['Breakfast', 'tofu-spinach-breakfast-muffins'], ['Lunch', 'chicken-spinach-courgette-salad-feta-olives'], ['Dinner', 'teriyaki-salmon-charred-spring-onions-rice']].filter(function (x) { return BY[x[1]]; });
    var mock = '<div class="mpg-hv' + (window.MPG_HERO_SIDE === 'right' ? ' mpg-hv-r' : '') + '" aria-hidden="true"><div class="mpg-hv-photo"><img src="' + esc(heroImg) + '" alt="" loading="eager" fetchpriority="high"></div>' +
      '<div class="mpg-hv-card"><div class="mpg-hv-top"><span>Day 1</span><b>1,850 kcal</b></div><ul>' + dayRows.map(function (x) { var r = BY[x[1]]; return '<li><small>' + x[0] + '</small><span>' + esc(r.n.split(' with ')[0]) + '</span></li>'; }).join('') + '</ul></div>' +
      '<div class="mpg-hv-chip">' + ICON2.tick + 'Shopping list ready</div></div>';
    var focusCards = FOCUS_CARDS.filter(function (f) { return BY[f[3]]; }).map(function (f) { return '<button type="button" class="mpg-fc" data-focus="' + f[0] + '"><span class="mpg-fc-i"><img src="' + esc(img(f[3])) + '" alt="" loading="lazy"></span><b>' + f[1] + '</b><small>' + f[2] + '</small><span class="mpg-fc-go">Start with this focus <span aria-hidden="true">→</span></span></button>'; }).join('');
    var sample = SAMPLE.filter(function (x) { return BY[x[1]]; }).map(function (x) { var r = BY[x[1]]; return '<a class="mpg-smp" href="' + SITE + '/recipes/' + r.s + '" target="_blank" rel="noopener"><span class="mpg-smp-i"><img src="' + esc(r.img) + '" alt="" loading="lazy"><em>' + MEALS[x[0]] + '</em></span><b>' + esc(r.n) + '</b><small>' + r.k + ' kcal · ' + r.p + 'g protein</small></a>'; }).join('');
    var smpK = 0, smpP = 0; SAMPLE.forEach(function (x) { if (BY[x[1]]) { smpK += BY[x[1]].k; smpP += BY[x[1]].p; } });
    root.innerHTML = (msg ? '<p class="mpg-note mpg-warn" role="alert">' + esc(msg) + '</p>' : '') + (incR ? '<p class="mpg-note mpg-inc">Your plan will start with <b>' + esc(incR.n) + '</b> on Day 1. <button type="button" class="mpg-link" data-act="drop-include">Plan without it</button></p>' : '') +
      '<section class="mpg-hero">' +
      '<div class="mpg-hero-txt"><p class="mpg-kicker">From the author of <i>The Testosterone Blueprint</i></p>' +
      '<h1>Free meal plan generator for hormone health</h1>' +
      '<p class="mpg-lead">A 7-day plan built around your body and your goal: testosterone, menopause, steady blood sugar or better sleep. Sized to your calories, with a shopping list.</p>' +
      '<ul class="mpg-badges"><li>' + ICON2.tick + DATA.length + ' recipes</li><li>' + ICON2.tick + 'Free, no sign-up</li><li>' + ICON2.tick + 'Veggie, vegan, gluten-free</li></ul>' +
      cta() + '<p class="mpg-fine">Takes about a minute.</p></div>' + mock + '</section>' +
      '<section class="mpg-sec mpg-focus"><h2>Choose your focus</h2><p class="mpg-sub">Every plan uses the same recipes and the same careful method. Your focus decides which ones come first.</p><div class="mpg-fc-g">' + focusCards + '</div></section>' +
      '<section class="mpg-sec mpg-get"><h2>What you get</h2><div class="mpg-get-g">' + GET.map(function (g) { return '<div><span class="mpg-ic">' + (ICON2[g[0]] || ICON[g[0]]) + '</span><h3>' + g[1] + '</h3><p>' + g[2] + '</p></div>'; }).join('') + '</div></section>' +
      '<section class="mpg-sec mpg-how"><h2>How it works</h2><ol class="mpg-how-g">' +
      '<li><span class="mpg-num">1</span><h3>Answer a few questions</h3><p>Age, height, weight, activity, goal and how you like to eat. Leave out anything you avoid.</p></li>' +
      '<li><span class="mpg-num">2</span><h3>Get your 7-day plan</h3><p>We match recipes to your calories, protein, diet and focus, and size every portion for you.</p></li>' +
      '<li><span class="mpg-num">3</span><h3>Shop and cook</h3><p>Swap anything you do not fancy, then print your plan and shopping list or save them as a PDF.</p></li>' +
      '</ol>' + cta() + '</section>' +
      '<section class="mpg-sec mpg-sample"><p class="mpg-kicker">Example day</p><h2>What a day can look like</h2><div class="mpg-smp-g">' + sample + '</div><p class="mpg-smp-tot">One serving of each: about ' + fmt(Math.round(smpK / 10) * 10) + ' kcal and ' + smpP + 'g protein. In your plan, portions are sized to your own target.</p>' + cta('Create my own plan') + '</section>' +
      '<section class="mpg-sec mpg-author"><div><p class="mpg-kicker">Who made this</p><h2>Created by M. Videika</h2><p>Author of <i>The Testosterone Blueprint</i>. Every recipe on this site is written for real kitchens, checked against UK food safety guidance and calculated per serving from USDA nutrition data.</p></div>' +
      '<div><h3>How we calculate your plan</h3><ul><li><b>Calories:</b> the Mifflin-St Jeor equation and your activity level, never below safe minimums.</li><li><b>Protein:</b> set from a healthy weight for your height, higher if you are losing weight or training.</li><li><b>Recipes:</b> filtered by your diet, allergies and focus, then balanced across the week.</li></ul></div></section>' +
      '<section class="mpg-sec mpg-faq"><h2>Questions people ask</h2>' + FAQ.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('') + '<div class="mpg-center">' + cta() + '</div></section>' +
      '<p class="mpg-by">General guidance for healthy adults, not medical advice. Recipes follow UK food safety guidance; nutrition per serving is calculated from USDA data.</p>' +
      '<div class="mpg-sticky" aria-hidden="true"><button type="button" class="mpg-cta" data-act="start" tabindex="-1">Create my free plan</button></div>';
    if (q('[data-act=drop-include]')) q('[data-act=drop-include]').addEventListener('click', function () { state.include = null; try { history.replaceState(history.state, '', location.pathname); } catch (e) {} landing(); });
    qa('[data-act=start]').forEach(function (b) { b.addEventListener('click', function () { startForm({}); }); });
    qa('[data-focus]').forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.focus; startForm(k === 'm' ? { focus: k, sex: 'female' } : k === 't' ? { focus: k, sex: 'male' } : { focus: k }); }); });
    var sticky = q('.mpg-sticky'), heroCta = q('.mpg-hero .mpg-cta');
    if (sticky && heroCta && 'IntersectionObserver' in window) {
      var vis = {}, past = false, ctas = qa('.mpg-cta[data-act=start]').filter(function (b) { return !b.closest('.mpg-sticky'); });
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { vis[ctas.indexOf(x.target)] = x.isIntersecting; if (x.target === heroCta) past = !x.isIntersecting && x.boundingClientRect.top < 0 ? true : (x.isIntersecting ? false : past); });
        var any = Object.keys(vis).some(function (k) { return vis[k]; });
        var on = past && !any; sticky.classList.toggle('on', on); root.classList.toggle('mpg-padsticky', on);
      });
      ctas.forEach(function (b) { io.observe(b); });
    }
  }
  function startForm(pre) { var keepInc = state.include; state.cleared = false; SS.del('cleared'); state.landingY = window.scrollY || 0; state.formFromLanding = depth + 1; state.form = null; state.editing = null; state.step = 0; state.focusOnDraw = true; state.include = keepInc; form(pre); push('form'); }

  // ---------------- Stepper form ----------------
  var STEPS = ['About you', 'Activity and goal', 'Your focus', 'How you eat'];
  var TITLES = ['Tell us about you', 'How active are you, and what is your goal?', 'What matters most to you?', 'How do you like to eat?'];
  var FOCUS_IMG = { g: 'mediterranean-vegetable-frittata-spinach-feta', t: 'teriyaki-salmon-charred-spring-onions-rice', m: 'spinach-ricotta-cannelloni-tomato-sauce', b: 'chicken-spinach-courgette-salad-feta-olives', s: 'tart-cherry-greek-yogurt-smoothie' };
  var DIET_IMG = { any: 'beef-broccoli-stir-fry-rice', pescatarian: 'sesame-seared-tuna-salad-egg', vegetarian: 'spanish-tortilla-peppers-spring-onions', vegan: 'thai-tofu-larb-bean-sprouts' };
  var FOCUS_SUB = { g: 'A balanced, varied week', t: 'Protein-rich meals', m: 'Protein, calcium and plants', b: 'Lower-carb meals', s: 'Lighter evening meals' };

  function form(pre) {
    state.form = Object.assign({ sex: '', age: '', height: '', weight: '', activity: 'light', goal: 'maintain', focus: 'g', diet: 'any', meals: 3, maxTime: 0, exclude: [], leftovers: true, safe: false }, state.form || {}, pre);
    drawStep();
  }

  function radio(name, val, label, sub) {
    var o = state.form;
    return '<label class="mpg-opt"><input type="radio" name="' + name + '" value="' + val + '"' + (String(o[name]) === String(val) ? ' checked' : '') + '><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></label>';
  }
  function photoOpt(name, val, label, sub, slug) {
    var o = state.form;
    return '<label class="mpg-popt"><input type="radio" name="' + name + '" value="' + val + '"' + (String(o[name]) === String(val) ? ' checked' : '') + '><span><i style="background-image:url(\'' + esc(img(slug)) + '\')"></i><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></label>';
  }
  function num(name, label, val, ph, unit) {
    return '<label class="mpg-field"><span>' + label + (unit ? ' <em>' + unit + '</em>' : '') + '</span><input name="' + name + '" type="number" inputmode="decimal" placeholder="' + ph + '" value="' + (val === '' || val == null ? '' : esc(val)) + '"></label>';
  }

  function bodyFields() {
    var o = state.form, u = state.units, h = '', w = '';
    if (u === 'metric') {
      h = num('h_cm', 'Height', o.height, 'e.g. 170', 'cm');
      w = num('w_kg', 'Weight', o.weight, 'e.g. 75', 'kg');
    } else {
      var inch = o.height ? Math.round(o.height / 2.54) : '', ft = inch ? Math.floor(inch / 12) : '', ins = inch ? inch % 12 : '';
      h = '<div class="mpg-pair"><span class="mpg-pl">Height</span>' + num('h_ft', '', ft, '5', 'ft') + num('h_in', '', ins, '7', 'in') + '</div>';
      var lb = o.weight ? Math.round(o.weight / 0.45359) : '';
      if (u === 'uk') w = '<div class="mpg-pair"><span class="mpg-pl">Weight</span>' + num('w_st', '', lb ? Math.floor(lb / 14) : '', '11', 'st') + num('w_lb', '', lb ? lb % 14 : '', '6', 'lb') + '</div>';
      else w = num('w_lbs', 'Weight', lb, 'e.g. 165', 'lb');
    }
    return h + w;
  }

  function drawStep() {
    var o = state.form, s = state.step, body = '';
    root.classList.remove('mpg-padsticky');
    SS.set('form', { form: o, step: s, units: state.units });
    if (s === 0) {
      body = '<fieldset class="mpg-fs"><legend class="mpg-sr">Sex</legend><div class="mpg-row2">' + radio('sex', 'female', 'Woman') + radio('sex', 'male', 'Man') + '</div></fieldset>' +
        '<div class="mpg-units" role="group" aria-label="Units"><span>Units:</span>' + ['metric', 'uk', 'us'].map(function (u) { return '<button type="button" data-units="' + u + '" aria-pressed="' + (state.units === u) + '">' + { metric: 'cm and kg', uk: 'ft and stone', us: 'ft and lb' }[u] + '</button>'; }).join('') + '</div>' +
        '<div class="mpg-body3">' + num('age', 'Age', o.age, 'e.g. 48', 'years') + bodyFields() + '</div>';
    } else if (s === 1) {
      body = '<fieldset class="mpg-fs"><legend class="mpg-q">Activity</legend><div class="mpg-row4">' + radio('activity', 'sedentary', 'Mostly sitting', 'Desk job, little exercise') + radio('activity', 'light', 'Lightly active', 'Walking, 1 to 3 workouts') + radio('activity', 'moderate', 'Active', '3 to 5 workouts a week') + radio('activity', 'active', 'Very active', 'Hard training most days') + '</div></fieldset>' +
        '<fieldset class="mpg-fs"><legend class="mpg-q">Goal</legend><div class="mpg-row3">' + radio('goal', 'lose', 'Lose weight', 'A gentle calorie deficit') + radio('goal', 'maintain', 'Stay the same', 'Eat well at your weight') + radio('goal', 'gain', 'Build muscle', 'A little extra, more protein') + '</div></fieldset>';
    } else if (s === 2) {
      if ((o.sex === 'male' && o.focus === 'm') || (o.sex === 'female' && o.focus === 't')) o.focus = 'g';
      body = '<fieldset class="mpg-fs"><legend class="mpg-sr">Focus</legend><div class="mpg-prow">' + ['g', 't', 'm', 'b', 's'].filter(function (k) { return !(k === 'm' && o.sex === 'male') && !(k === 't' && o.sex === 'female'); }).map(function (k) { return photoOpt('focus', k, FOCUS[k], FOCUS_SUB[k], FOCUS_IMG[k]); }).join('') + '</div></fieldset>';
    } else {
      var chk = function (val, label) { return '<label class="mpg-chip"><input type="checkbox" name="exclude" value="' + val + '"' + (o.exclude.indexOf(val) >= 0 ? ' checked' : '') + '><span>' + label + '</span></label>'; };
      body = '<fieldset class="mpg-fs"><legend class="mpg-sr">Diet</legend><div class="mpg-prow mpg-prow4">' + ['any', 'pescatarian', 'vegetarian', 'vegan'].map(function (k) { return photoOpt('diet', k, DIETS[k], '', DIET_IMG[k]); }).join('') + '</div></fieldset>' +
        '<fieldset class="mpg-fs"><legend class="mpg-q">Leave out</legend><div class="mpg-chips">' + chk('gluten', 'Gluten') + chk('dairy', 'Dairy') + chk('eggs', 'Eggs') + chk('fish', 'Fish') + chk('shellfish', 'Shellfish') + chk('nuts', 'Tree nuts') + chk('peanuts', 'Peanuts') + chk('sesame', 'Sesame') + chk('soya', 'Soya') + chk('mushrooms', 'Mushrooms') + chk('pork', 'Pork') + chk('red_meat', 'Red meat') + '</div></fieldset>' +
        '<div class="mpg-grid2"><label class="mpg-field"><span>Meals a day</span><select name="meals"><option value="3"' + (o.meals == 3 ? ' selected' : '') + '>3 meals</option><option value="4"' + (o.meals == 4 ? ' selected' : '') + '>3 meals and a snack</option></select></label>' +
        '<label class="mpg-field"><span>Preferred cooking time</span><select name="maxTime"><option value="0">No limit</option><option value="20"' + (o.maxTime == 20 ? ' selected' : '') + '>20 minutes or less</option><option value="30"' + (o.maxTime == 30 ? ' selected' : '') + '>30 minutes or less</option><option value="45"' + (o.maxTime == 45 ? ' selected' : '') + '>45 minutes or less</option></select></label></div>' +
        '<p class="mpg-count" aria-live="polite"></p>' +
        '<label class="mpg-toggle"><input type="checkbox" name="leftovers"' + (o.leftovers ? ' checked' : '') + '><span><b>Cook once, eat twice</b><small>On three days, cook a little extra dinner and have it for lunch the next day.</small></span></label>' +
        '<label class="mpg-toggle mpg-safe"><input type="checkbox" name="safe"' + (o.safe ? ' checked' : '') + '><span>I am 18 or over, not pregnant or breastfeeding, and I understand this plan is general guidance, not medical advice.</span></label>';
    }
    var pct = Math.round((s + 1) / STEPS.length * 100);
    root.innerHTML = '<section class="mpg-wiz"><div class="mpg-prog"><div class="mpg-prog-t"><span>Step ' + (s + 1) + ' of ' + STEPS.length + '</span><span>' + STEPS[s] + '</span></div><div class="mpg-prog-b" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div></div>' +
      (state.editing ? '<p class="mpg-editbar"><button type="button" class="mpg-link" data-act="cancel-edit">← Back to my plan</button> Your plan stays as it is unless you change an answer.</p>' : '') + '<form novalidate><h2 tabindex="-1">' + TITLES[s] + '</h2>' + body +
      '<p class="mpg-err" id="mpg-err" role="alert" aria-live="assertive"></p><div class="mpg-nav">' + '<button type="button" class="mpg-back" data-act="back">' + (s === 0 && state.editing ? 'Back to my plan' : 'Back') + '</button>' +
      '<button type="submit" class="mpg-cta">' + (s === STEPS.length - 1 ? 'Create my meal plan' : 'Next') + '</button></div></form></section>';
    var f = q('form');
    qa('[data-units]').forEach(function (b) { b.addEventListener('click', function () { save(f); state.units = b.dataset.units; drawStep(); }); });
    if (q('[data-act=back]')) q('[data-act=back]').addEventListener('click', function () {
      save(f);
      if (state.step === 0) { if (state.editing) cancelEdit(); else if (state.formFromLanding === depth && history.state && history.state.mpg === 'form') history.back(); else { landing(); push('landing'); } return; }
      if (depth > 0 && history.state && history.state.mpg === 'form' && history.state.step === state.step) { history.back(); return; }
      state.step--; state.focusOnDraw = true; drawStep(); replace('form');
    });
    if (q('[data-act=cancel-edit]')) q('[data-act=cancel-edit]').addEventListener('click', cancelEdit);
    if (state.step === 3) { updCount(f); f.addEventListener('change', function () { updCount(f); }); }
    f.addEventListener('input', function () { q('.mpg-err').textContent = ''; qa('[aria-invalid]', f).forEach(function (x) { x.removeAttribute('aria-invalid'); x.removeAttribute('aria-describedby'); }); });
    f.addEventListener('change', function () { q('.mpg-err').textContent = ''; });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); save(f);
      var v = validate(state.step);
      q('.mpg-err').textContent = v.msg;
      if (v.msg) { var first = null; (v.field || []).forEach(function (n) { var el = f.querySelector('[name=' + n + ']'); if (el) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'mpg-err'); first = first || el; } }); (first || q('.mpg-err')).focus && (first ? first.focus() : (q('.mpg-err').setAttribute('tabindex', '-1'), q('.mpg-err').focus())); return; }
      if (state.step < STEPS.length - 1) { state.step++; state.focusOnDraw = true; drawStep(); push('form'); return; }
      var o2 = Object.assign({}, state.form); delete o2.safe;
      if (state.editing && planKey(o2) === planKey(state.editing.o)) { cancelEdit(); return; }
      o2.seed = Math.floor(Math.random() * 1e6) + 1;
      state.editing = null; state.code = null; state.fromLink = false; state.undo = []; run(o2);
    });
    var h2 = q('h2'); if (h2 && state.focusOnDraw) h2.focus({ preventScroll: false });
    state.focusOnDraw = true;
  }

  function planKey(o) { return JSON.stringify(['sex', 'age', 'height', 'weight', 'activity', 'goal', 'focus', 'diet', 'meals', 'maxTime', 'leftovers'].map(function (k) { return String(o[k]); }).concat([(o.exclude || []).slice().sort().join(',')])); }
  function editAnswers() { state.editing = { o: state.o, plan: state.plan, day: state.day, view: state.view }; state.form = Object.assign({}, state.o, { safe: true }); state.step = 0; state.focusOnDraw = true; state.picker = null; drawStep(); push('form'); }
  function cancelEdit() { var ed = state.editing; state.editing = null; SS.del('form'); if (!ed) return; state.o = ed.o; state.plan = ed.plan; state.day = ed.day; state.view = ed.view; render(); push('plan'); focusPlan(); }
  var MEAL_PL = { B: 'breakfasts', L: 'lunches', D: 'dinners', S: 'snacks' }, MEAL_1 = { B: 'breakfast', L: 'lunch', D: 'dinner', S: 'snack' };
  function updCount(f) {
    var el = q('.mpg-count'); if (!el) return;
    save(f);
    var sz = E.poolSizes(DATA, state.form), ms = Object.keys(sz), low = ms.filter(function (m) { return sz[m] < E.MIN_POOL; });
    var F = state.form, auto = '';
    if (+F.meals !== 4 && F.sex && +F.age && +F.height && +F.weight) { var tk = E.targets(F).kcal; if (tk * 0.40 > 1000) auto = ' Your target is about ' + fmt(tk) + ' kcal a day, so with 3 meals the portions will be large. Choosing 3 meals and a snack spreads it out.'; }
    el.className = 'mpg-count' + (low.length ? ' mpg-warn' : '');
    el.textContent = low.length
      ? 'Only ' + andList(low.map(function (m) { return sz[m] + ' ' + (sz[m] === 1 ? MEAL_1[m] : MEAL_PL[m]); })) + ' match these choices, too few for a varied week. ' + (F.focus === 'b' ? 'Few of our recipes fit both your diet and a blood sugar focus yet; choosing a different focus, leaving out fewer foods or a broader diet will help.' : 'Leaving out fewer foods or choosing a broader diet will help.') + auto
      : 'Recipes that match your choices: ' + andList(ms.map(function (m) { return sz[m] + ' ' + MEAL_PL[m]; })) + '.' + auto;
  }

  function val(f, n) { var el = f.querySelector('[name=' + n + ']'); return el && el.value !== '' ? +el.value : null; }

  function save(f) {
    var o = state.form, g = function (n) { return f.querySelector('[name=' + n + ']:checked') || f.querySelector('[name=' + n + ']'); };
    if (state.step === 0) {
      var sx = f.querySelector('[name=sex]:checked'); if (sx) o.sex = sx.value;
      o.age = val(f, 'age') || '';
      if (state.units === 'metric') { o.height = val(f, 'h_cm') || ''; o.weight = val(f, 'w_kg') || ''; }
      else {
        var ft = val(f, 'h_ft'), inch = val(f, 'h_in') || 0; o._in = inch; o._lb = state.units === 'uk' ? (val(f, 'w_lb') || 0) : 0;
        o.height = ft ? Math.round((ft * 12 + inch) * 2.54) : '';
        var lb = state.units === 'uk' ? (val(f, 'w_st') ? val(f, 'w_st') * 14 + (val(f, 'w_lb') || 0) : null) : val(f, 'w_lbs');
        o.weight = lb ? Math.round(lb * 0.45359 * 10) / 10 : '';
      }
    } else if (state.step === 1) { o.activity = g('activity').value; o.goal = g('goal').value; }
    else if (state.step === 2) { o.focus = g('focus').value; }
    else {
      o.diet = g('diet').value; o.meals = +f.meals.value; o.maxTime = +f.maxTime.value; o.leftovers = f.leftovers.checked;
      o.exclude = qa('[name=exclude]:checked', f).map(function (x) { return x.value; });
      o.safe = f.safe.checked;
    }
    SS.set('form', { form: o, step: state.step, units: state.units });
  }

  function validate(s) {
    var o = state.form, hf = state.units === 'metric' ? ['h_cm'] : ['h_ft', 'h_in'], wf = state.units === 'metric' ? ['w_kg'] : state.units === 'uk' ? ['w_st', 'w_lb'] : ['w_lbs'];
    if (s === 0) {
      if (!o.sex) return { msg: 'Please choose woman or man; it changes your calorie needs.' };
      if (!(o.age >= 18 && o.age <= 100)) return { msg: 'This planner is for adults aged 18 and over.', field: ['age'] };
      if (state.units !== 'metric' && !(o._in >= 0 && o._in < 12)) return { msg: 'Inches should be between 0 and 11.', field: ['h_in'] };
      if (state.units === 'uk' && !(o._lb >= 0 && o._lb < 14)) return { msg: 'Pounds should be between 0 and 13; 14 lb make a stone.', field: ['w_lb'] };
      if (!(o.height >= 130 && o.height <= 220)) return { msg: 'Please check your height.', field: hf };
      if (!(o.weight >= 35 && o.weight <= 250)) return { msg: 'Please check your weight.', field: wf };
    }
    if (s === 1 && E.check(o).indexOf('underweight') >= 0) return { msg: 'Your BMI is below 18.5, so we will not create a weight-loss plan. Please choose "Stay the same" or "Build muscle", and if you are worried about your weight or eating, talk to your GP.' };
    if (s === 3 && !o.safe) return { msg: 'Please tick the box above. If you are pregnant, breastfeeding or under 18, please ask your GP, midwife or a dietitian for advice instead.', field: ['safe'] };
    return { msg: '' };
  }

  // ---------------- URL ----------------
  var KEYS = ['sex', 'age', 'height', 'weight', 'activity', 'goal', 'focus', 'diet', 'meals', 'maxTime', 'seed'];
  function readURL() {
    var p = new URLSearchParams((location.hash || '').replace(/^#/, '') || location.search), o = {};
    KEYS.forEach(function (k) { if (p.get(k)) o[k] = p.get(k); });
    o.exclude = (p.get('exclude') || '').split(',').filter(function (x) { return EXOK[x]; });
    if (p.get('leftovers')) o.leftovers = p.get('leftovers') === '1';
    var inc = p.get('include') || new URLSearchParams(location.search).get('include') || ''; if (/^[a-z0-9-]{1,120}$/.test(inc) && BY[inc]) o.include = inc;
    var c = p.get('p') || ''; o.code = /^[a-z0-9*,~_-]{1,4000}$/.test(c) ? c : '';
    return o;
  }
  function clean(o) {
    ['age', 'height', 'weight', 'meals', 'maxTime', 'seed'].forEach(function (k) { o[k] = +o[k] || 0; });
    if (o.sex !== 'male' && o.sex !== 'female') return null;
    if (!GOALS[o.goal]) o.goal = 'maintain';
    if (!FOCUS[o.focus] || (o.focus === 'm' && o.sex === 'male') || (o.focus === 't' && o.sex === 'female')) o.focus = 'g';
    if (!DIETS[o.diet]) o.diet = 'any';
    if (!ACTS[o.activity]) o.activity = 'light';
    if (o.meals !== 4) o.meals = 3;
    if ([0, 20, 30, 45].indexOf(o.maxTime) < 0) o.maxTime = 0;
    if (o.leftovers === undefined) o.leftovers = true;
    if (E.check(o).length) return null;
    return o;
  }
  function writeURL(o) { replace('plan'); if (!state.fromLink && state.plan && !(state.plan.blocked && state.plan.blocked.length)) SS.set('own', E.encode(state.plan)); }
  function planParams() {
    var o = state.o, p = new URLSearchParams();
    KEYS.forEach(function (k) { if (o[k] !== undefined && o[k] !== '' && o[k] !== 0) p.set(k, o[k]); });
    if (o.exclude && o.exclude.length) p.set('exclude', o.exclude.join(','));
    p.set('leftovers', o.leftovers ? '1' : '0');
    if (state.plan && !(state.plan.blocked && state.plan.blocked.length)) p.set('p', E.encode(state.plan));
    return p.toString();
  }

  // ---------------- Shopping list ----------------
  var AISLE = [
    ['frozen', 'frozen'], ['edamame', 'frozen'], ['tamarind', 'tin'], ['rapeseed oil', 'cup'],
    ['bean sprout', 'veg'], ['beansprout', 'veg'], ['green bean', 'veg'], ['broad bean', 'veg'], ['sugar snap', 'veg'], ['butternut', 'veg'], ['goat', 'dairy'], ['emmental', 'dairy'], ['ghee', 'dairy'], ['creme fraiche', 'dairy'], ['chicken stock', 'tin'], ['stock', 'tin'], ['pine nut', 'nut'],
    ['pork', 'meat'], ['sirloin', 'meat'], ['protein powder', 'cup'], ['dark chocolate', 'cup'], ['raisin', 'cup'], ['dates', 'cup'], ['coffee', 'cup'], ['garlic powder', 'cup'], ['cayenne', 'cup'], ['herbes', 'cup'], ['pul biber', 'cup'], ['saffron', 'cup'], ['brandy', 'cup'], ['seaweed', 'cup'],
    ['mirin', 'tin'], ['gochujang', 'tin'], ['sriracha', 'tin'], ['caper', 'tin'], ['cornichon', 'tin'], ['hummus', 'tin'], ['kimchi', 'tin'], ['bamboo shoot', 'tin'],
    ['black pepper', 'cup'], ['chilli flakes', 'cup'], ['chilli powder', 'cup'], ['peanut butter', 'tin'], ['almond butter', 'tin'], ['nut butter', 'tin'], ['butter beans', 'tin'], ['coconut milk', 'tin'], ['coconut cream', 'tin'],
    ['soya milk', 'dairy'], ['soy milk', 'dairy'], ['oat milk', 'dairy'], ['oat cream', 'dairy'], ['almond milk', 'dairy'], ['soya yogurt', 'dairy'], ['coconut yogurt', 'dairy'],
    ['rice vinegar', 'tin'], ['wine vinegar', 'tin'], ['cider vinegar', 'tin'], ['vinegar', 'tin'], ['sweet potato', 'veg'], ['cornflour', 'grain'], ['tomato puree', 'tin'], ['tomato purée', 'tin'], ['passata', 'tin'], ['chopped tomatoes', 'tin'], ['tinned', 'tin'], ['sun-dried', 'tin'], ['water chestnut', 'tin'], ['sweetcorn', 'tin'],
    ['egg noodle', 'grain'], ['noodle', 'grain'], ['rice', 'grain'], ['oat', 'grain'], ['quinoa', 'grain'], ['flour', 'grain'], ['pasta', 'grain'], ['tagliatelle', 'grain'], ['cannelloni', 'grain'], ['spaghetti', 'grain'], ['couscous', 'grain'], ['bulgur', 'grain'], ['barley', 'grain'], ['buckwheat', 'grain'], ['bread', 'grain'], ['sourdough', 'grain'], ['rye', 'grain'], ['tortilla', 'grain'], ['pitta', 'grain'], ['wrap', 'grain'], ['panko', 'grain'], ['breadcrumb', 'grain'], ['granola', 'grain'],
    ['chicken', 'meat'], ['turkey', 'meat'], ['beef', 'meat'], ['steak', 'meat'], ['lamb', 'meat'], ['liver', 'meat'], ['salmon', 'meat'], ['tuna', 'meat'], ['mackerel', 'meat'], ['cod', 'meat'], ['trout', 'meat'], ['sea bass', 'meat'], ['sardine', 'meat'], ['prawn', 'meat'], ['shrimp', 'meat'], ['mussel', 'meat'], ['oyster sauce', 'tin'], ['oyster', 'meat'], ['fish sauce', 'tin'], ['anchov', 'meat'], ['fish', 'meat'],
    ['egg', 'dairy'], ['milk', 'dairy'], ['yogurt', 'dairy'], ['yoghurt', 'dairy'], ['kefir', 'dairy'], ['cheese', 'dairy'], ['cheddar', 'dairy'], ['feta', 'dairy'], ['ricotta', 'dairy'], ['halloumi', 'dairy'], ['mozzarella', 'dairy'], ['parmesan', 'dairy'], ['cottage', 'dairy'], ['butter', 'dairy'], ['cream', 'dairy'], ['crème', 'dairy'], ['tofu', 'dairy'], ['tempeh', 'dairy'],
    ['bean', 'tin'], ['lentil', 'tin'], ['chickpea', 'tin'], ['olive oil', 'cup'], ['oil', 'cup'], ['olive', 'tin'], ['stock', 'tin'], ['soy sauce', 'tin'], ['tamari', 'tin'], ['hoisin', 'tin'], ['miso', 'tin'], ['mustard', 'tin'], ['honey', 'tin'], ['maple', 'tin'], ['tahini', 'tin'], ['pesto', 'tin'], ['concentrate', 'tin'], ['curry paste', 'tin'], ['harissa', 'tin'],
    ['almond', 'nut'], ['walnut', 'nut'], ['cashew', 'nut'], ['pistachio', 'nut'], ['peanut', 'nut'], ['brazil', 'nut'], ['hazelnut', 'nut'], ['seed', 'nut'], ['chia', 'nut'], ['flax', 'nut'],
    ['salt', 'cup'], ['cumin', 'cup'], ['paprika', 'cup'], ['cinnamon', 'cup'], ['turmeric', 'cup'], ['curry', 'cup'], ['oregano', 'cup'], ['nutmeg', 'cup'], ['baking', 'cup'], ['bicarbonate', 'cup'], ['vanilla', 'cup'], ['nutritional yeast', 'cup'], ['cocoa', 'cup'], ['cacao', 'cup'], ['garam', 'cup'], ['coriander seed', 'cup'], ['sugar', 'cup'], ['spice', 'cup']
  ];
  var AISLE_NAME = { frozen: 'Frozen', veg: 'Fruit, vegetables and herbs', meat: 'Meat and fish', dairy: 'Dairy, eggs and tofu', grain: 'Bread, grains and pasta', tin: 'Tins, jars and sauces', nut: 'Nuts and seeds', cup: 'Store cupboard and spices' };
  var AISLE_ORDER = ['veg', 'meat', 'dairy', 'grain', 'tin', 'nut', 'cup', 'frozen'];
  var SYN = { 'lemon juice': 'lemon', 'lemon zest': 'lemon', 'lime juice': 'lime', 'lime zest': 'lime', 'green chilli': 'chilli', 'red chilli': 'chilli', 'chillies': 'chilli', 'red pepper': 'peppers', 'red peppers': 'peppers', 'yellow pepper': 'peppers', 'green pepper': 'peppers', 'pepper': 'peppers', 'bell pepper': 'peppers', 'romaine lettuce': 'lettuce', 'salad leaves': 'lettuce', 'spring onion': 'spring onions', 'avocados': 'avocado', 'aubergines': 'aubergine', 'courgettes': 'courgette', 'bananas': 'banana', 'shallot': 'shallots', 'potato': 'potatoes', 'waxy potatoes': 'potatoes', 'beansprouts': 'bean sprouts', 'soy milk': 'soya milk', 'soy yogurt': 'soya yogurt', 'tuna steaks': 'tuna', 'chicken breast': 'chicken', 'rolled oats': 'oats', 'oatmeal': 'oats', 'vegetable stock': 'stock', 'tofu': 'firm tofu', 'extra-firm tofu': 'firm tofu', 'gram flour': 'chickpea flour', 'brown basmati rice': 'brown rice', 'egg whites': 'eggs', 'wholegrain mustard': 'mustard', 'dijon mustard': 'mustard', 'semi-skimmed milk': 'milk', 'whole milk': 'milk', 'black olives': 'olives', 'kalamata olives': 'olives', 'green olives': 'olives', 'chestnut mushrooms': 'mushrooms', 'button mushrooms': 'mushrooms', 'tinned tomatoes': 'chopped tomatoes' };
  var GF_LABEL = { oats: 'oats (labelled gluten-free)', miso: 'miso (labelled gluten-free)', gochujang: 'gochujang (labelled gluten-free)', tamari: 'tamari (labelled gluten-free)', stock: 'stock (gluten-free)', 'chicken stock': 'chicken stock (gluten-free)', 'oatcakes': 'oatcakes (labelled gluten-free)', 'corn tortillas': 'corn tortillas (labelled gluten-free)' };
  function andList(a, w) { w = w || 'and'; return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' ' + w + ' ' + a[a.length - 1]; }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function aisleOf(name) { for (var i = 0; i < AISLE.length; i++) if (name.indexOf(AISLE[i][0]) >= 0) return AISLE[i][1]; return 'veg'; }
  // Lentil tags say only "lentils": name the kind each recipe needs, so the list never shows two vague lentil lines.
  var LENTILS = { 'beef-lentil-bolognese': 'red lentils', 'moroccan-chickpea-lentil-stew': 'red lentils', 'red-lentil-dal-spinach': 'red lentils', 'lentil-soup-turmeric-lemon': 'red lentils', 'lentil-shepherds-pie-sweet-potato': 'dried green or brown lentils', 'lentil-mushroom-burgers': 'tinned green or brown lentils', 'halloumi-lentil-roasted-vegetable-salad': 'cooked Puy or green lentils' };
  function shopping() {
    var items = {};
    state.plan.days.forEach(function (d) {
      d.items.forEach(function (it) {
        if (!it.r || it.leftover) return;
        it.r.g.split(',').forEach(function (raw) {
          var n = raw.trim().toLowerCase().replace(/\s+/g, ' '); if (!n) return;
          n = SYN[n] || n;
          if (/^(green )?lentils$/.test(n)) n = LENTILS[it.r.s] || n;
          if (!items[n]) items[n] = { n: n, recipes: {} };
          items[n].recipes[it.r.n] = 1;
        });
      });
    });
    Object.keys(items).forEach(function (k) {
      [k.slice(0, -1), k.replace(/es$/, '')].forEach(function (b) { if (b !== k && items[b] && items[k]) { Object.keys(items[k].recipes).forEach(function (r) { items[b].recipes[r] = 1; }); delete items[k]; } });
    });
    if (items['oil'] && items['olive oil']) { Object.keys(items['oil'].recipes).forEach(function (r) { items['olive oil'].recipes[r] = 1; }); delete items['oil']; }
    if ((state.o.exclude || []).indexOf('gluten') >= 0) Object.keys(items).forEach(function (k) { if (GF_LABEL[k]) items[k].label = GF_LABEL[k]; });
    var groups = {};
    Object.keys(items).sort().forEach(function (k) { var a = aisleOf(k); (groups[a] = groups[a] || []).push(items[k]); });
    return groups;
  }

  // ---------------- Plan ----------------
  function build(o, code) {
    if (code) return E.decode(DATA, o, code);
    var plan = E.generate(DATA, o), inc = state.include && BY[state.include];
    if (inc && !(plan.blocked && plan.blocked.length)) {
      var idx = -1; plan.days[0].items.forEach(function (it, i) { if (it.meal === inc.m) idx = i; });
      if (idx < 0) plan.includeFail = 'snack';
      else if (plan.pools[inc.m].indexOf(inc) < 0) plan.includeFail = (!E.dietOk(inc, o.diet) || E.excluded(inc, o.exclude || [])) ? 'fit' : (o.focus === 'b' && E.poolFor(DATA, Object.assign({}, o, { focus: 'g' }), inc.m).list.indexOf(inc) >= 0) ? 'carbs' : 'time';
      else { E.swap(plan, o, 0, idx, 1, inc.s); plan.included = inc.s; }
      plan.includeName = inc.n;
    }
    if (!(plan.blocked && plan.blocked.length)) state.include = null;   // keep it for the relaxed plan
    return plan;
  }

  function run(o, noPush) {
    state.o = o; state.plan = build(o, state.code); state.code = null; state.picker = null; SS.del('form');
    state.day = 0; state.view = 'day'; state.got = {};
    render();
    if (noPush) replace('plan'); else push('plan');
    if (!state.fromLink && !(state.plan.blocked && state.plan.blocked.length)) SS.set('own', E.encode(state.plan));
    try { root.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    focusPlan();
  }

  function blockedView() {
    var p = state.plan, o = state.o;
    var opts = (p.relax || []).map(function (r, i) { return '<button type="button" class="mpg-cta" data-relax="' + i + '">' + esc(r.label) + '</button>'; }).join('');
    var EXN = { gluten: 'gluten', dairy: 'dairy', eggs: 'eggs', fish: 'fish', shellfish: 'shellfish', nuts: 'tree nuts', peanuts: 'peanuts', sesame: 'sesame', soya: 'soya', mushrooms: 'mushrooms', pork: 'pork', red_meat: 'red meat' };
    var mine = [o.diet !== 'any' ? DIETS[o.diet].toLowerCase() : ''].concat((o.exclude || []).map(function (e) { return 'no ' + EXN[e]; })).concat([o.maxTime ? o.maxTime + ' minutes or less' : '', o.focus !== 'g' ? FOCUS[o.focus].toLowerCase() + ' focus' : '']).filter(Boolean);
    root.innerHTML = '<section class="mpg-wiz mpg-blocked"><h2 tabindex="-1">We need a little more room to build a good plan</h2>' +
      '<p class="mpg-lead">There are fewer than ' + E.MIN_POOL + ' recipes for ' + andList(p.blocked.map(function (m) { return MEALS[m].toLowerCase(); })) + (mine.length ? ' that fit your choices (' + esc(mine.join(', ')) + ')' : ' that fit your choices') + '. A week built from so few would repeat the same meals and fall short of your calories, so we would rather not give you one.</p>' +
      (opts ? '<p class="mpg-q">Try one of these:</p><div class="mpg-relax">' + opts + '</div>' : '') +
      '<p class="mpg-small">We never suggest dropping an allergy, a food you avoid or your diet. We add new recipes every week, so this combination should work soon' + '.</p>' +
      '<div class="mpg-nav"><button type="button" class="mpg-back" data-act="restart">Start again</button><button type="button" class="mpg-cta" data-act="edit">Change my answers</button></div></section>';
    qa('[data-relax]').forEach(function (b) { b.addEventListener('click', function () { var r = p.relax[+b.dataset.relax]; state.form = Object.assign({}, state.form, r.o); state.code = null; run(Object.assign({}, o, r.o), true); }); });
    q('[data-act=edit]').addEventListener('click', function () { state.editing = null; state.form = Object.assign({}, state.o, { safe: true }); state.step = 3; state.focusOnDraw = true; drawStep(); push('form'); });
    q('[data-act=restart]').addEventListener('click', startAgain);
    q('h2').focus();
  }

  function donut(day) {
    var p = day.p * 4, c = day.c * 4, f = day.f * 9, t = p + c + f || 1, R = 15.9155, a = 0;
    function seg(v, col) { var len = v / t * 100, s = '<circle r="' + R + '" cx="20" cy="20" fill="none" stroke="' + col + '" stroke-width="6" stroke-dasharray="' + len + ' ' + (100 - len) + '" stroke-dashoffset="' + (25 - a) + '"/>'; a += len; return s; }
    return '<svg class="mpg-donut" viewBox="0 0 40 40" role="img" aria-label="Calories from protein ' + Math.round(p / t * 100) + '%, carbohydrate ' + Math.round(c / t * 100) + '%, fat ' + Math.round(f / t * 100) + '%">' + seg(p, '#3F7D58') + seg(c, '#C09A4E') + seg(f, '#12294A') + '</svg>' +
      '<ul class="mpg-legend"><li><i style="background:#3F7D58"></i>Protein ' + Math.round(p / t * 100) + '%</li><li><i style="background:#C09A4E"></i>Carbs ' + Math.round(c / t * 100) + '%</li><li><i style="background:#12294A"></i>Fat ' + Math.round(f / t * 100) + '%</li></ul>';
  }

  // Ingredients that are only safe for the user's exclusions when the label says so.
  var LABEL_CHECK = { gluten: [['oats', 'oats'], ['oatcake', 'oatcakes'], ['gochujang', 'gochujang'], ['miso', 'miso'], ['tamari', 'tamari'], ['stock', 'stock'], ['corn tortilla', 'corn tortillas'], ['curry paste', 'curry paste'], ['spice', 'spice blends']],
    dairy: [['dark chocolate', 'dark chocolate']], nuts: [['dark chocolate', 'dark chocolate'], ['granola', 'granola']], peanuts: [['dark chocolate', 'dark chocolate']], soya: [['dark chocolate', 'dark chocolate'], ['stock', 'stock']], fish: [['curry paste', 'curry paste']], shellfish: [['curry paste', 'curry paste']] };
  var LABEL_WORD = { gluten: 'gluten-free', dairy: 'dairy-free', nuts: 'nut-free', peanuts: 'peanut-free', soya: 'soya-free', fish: 'fish-free', shellfish: 'shellfish-free' };
  function labelWarn(r) {
    var out = [];
    (state.o.exclude || []).forEach(function (e) { (LABEL_CHECK[e] || []).forEach(function (x) { if (r.g.indexOf(x[0]) >= 0) out.push(x[1] + ' labelled ' + LABEL_WORD[e]); }); });
    out = out.filter(function (x, i) { return out.indexOf(x) === i; });
    return out.length ? '<p class="mpg-lbl">Check the label: use ' + esc(andList(out)) + '.</p>' : '';
  }
  function card(it, d, i) {
    var r = it.r, m = it.mult, w = E.why(it, state.o), url = SITE + '/recipes/' + r.s;
    return '<article class="mpg-card">' +
      '<a class="mpg-img" href="' + url + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img src="' + esc(r.img) + '" alt="" loading="lazy"><span class="mpg-mealtag">' + MEALS[it.meal] + '</span>' + (it.leftover ? '<span class="mpg-badge">Leftovers</span>' : '') + (it.cookFor ? '<span class="mpg-badge mpg-badge2">Makes tomorrow\'s lunch</span>' : '') + '</a>' +
      '<div class="mpg-body"><p class="mpg-sr">' + MEALS[it.meal] + '</p><h4><a href="' + url + '" target="_blank" rel="noopener">' + esc(r.n) + '</a></h4>' +
      '<p class="mpg-meta"><span><b>' + E.fmtServ(m) + '</b></span><span>' + fmt(r.k * m) + ' kcal</span><span>' + Math.round(r.p * m) + 'g protein</span>' + (it.leftover ? '' : '<span>' + r.t + ' min</span>') + '</p>' +
      (w.length ? '<p class="mpg-why">' + esc(w.join(' · ')) + '</p>' : '') + labelWarn(r) +
      '<div class="mpg-actions"><button type="button" data-swap="' + d + ',' + i + '" aria-expanded="' + (state.picker === d + ',' + i) + '" aria-controls="mpg-pick-' + d + '-' + i + '" aria-label="Swap ' + MEALS[it.meal].toLowerCase() + ': ' + esc(r.n) + '">↻ Swap</button><a href="' + url + '" target="_blank" rel="noopener">Recipe</a></div>' +
      (state.picker === d + ',' + i ? picker(d, i) : '') +
      '</div></article>';
  }
  function picker(d, i) {
    var alts = E.alternatives(state.plan, state.o, d, i, 4);
    return '<div class="mpg-pick" id="mpg-pick-' + d + '-' + i + '" role="group" aria-label="Choose a replacement"><p class="mpg-pick-t">Choose a replacement</p>' + alts.map(function (a) {
      return '<button type="button" class="mpg-pick-i" data-pick="' + esc(a.r.s) + '"><span class="mpg-pick-img"><img src="' + esc(a.r.img) + '" alt="" loading="lazy"></span><span><b>' + esc(a.r.n) + '</b><small>' + fmt(a.r.k * a.mult) + ' kcal · ' + Math.round(a.r.p * a.mult) + 'g protein · ' + a.r.t + ' min</small></span></button>';
    }).join('') + '<div class="mpg-pick-act"><button type="button" class="mpg-link" data-act="surprise">Surprise me</button><button type="button" class="mpg-link" data-act="pick-close">Cancel</button></div></div>';
  }

  function weekView() {
    var p = state.plan, meals = Object.keys(p.split);
    return '<div class="mpg-week"><div class="mpg-wk-g" style="grid-template-columns:84px repeat(' + p.days.length + ',minmax(112px,1fr))"><div class="mpg-wk-m mpg-stick"></div>' +
      p.days.map(function (d, i) { return '<button type="button" class="mpg-wk-h" data-goday="' + i + '">Day ' + (i + 1) + '<small>' + fmt(d.kcal) + ' kcal</small></button>'; }).join('') +
      meals.map(function (m, mi) {
        return '<div class="mpg-wk-m mpg-stick">' + MEALS[m] + '</div>' + p.days.map(function (d) {
          var it = d.items[mi];
          return '<a class="mpg-wk-c" href="' + SITE + '/recipes/' + it.r.s + '" target="_blank" rel="noopener"><span class="mpg-wk-i"><img src="' + esc(it.r.img) + '" alt="" loading="lazy">' + (it.leftover ? '<em>Leftovers</em>' : '') + '</span><span class="mpg-wk-n">' + esc(it.r.n) + '</span></a>';
        }).join('');
      }).join('') + '</div></div>';
  }

  function shopView() {
    var g = shopping(), total = 0;
    var html = AISLE_ORDER.filter(function (a) { return g[a]; }).map(function (a) {
      total += g[a].length;
      return '<div class="mpg-aisle"><h4>' + AISLE_NAME[a] + ' <small>' + g[a].length + '</small></h4><ul>' + g[a].map(function (it) {
        var id = it.n, on = state.got[id], rs = Object.keys(it.recipes);
        return '<li><label' + (on ? ' class="on"' : '') + '><input type="checkbox" data-got="' + esc(id) + '"' + (on ? ' checked' : '') + '><span>' + esc(cap(it.label || it.n)) + ' <small>' + esc(rs.length > 1 ? 'for ' + rs.length + ' recipes' : rs[0]) + '</small></span></label></li>';
      }).join('') + '</ul></div>';
    }).join('');
    return '<div class="mpg-shop"><p class="mpg-note"><b>' + total + ' items for the week.</b> Tick off what you already have. Quantities are in each recipe: multiply them by the servings shown in your plan. Most store-cupboard items will already be in your kitchen.</p><div class="mpg-shop-g">' + html + '</div></div>';
  }

  function render(focusSel) {
    root.classList.remove('mpg-padsticky');
    var p = state.plan, o = state.o;
    if (p.blocked && p.blocked.length) return blockedView();
    var t = p.targets, d = state.day, day = p.days[d];
    var avgP = p.days.reduce(function (a, x) { return a + x.p; }, 0) / p.days.length;
    var notes = state.fromLink ? '<p class="mpg-note">This shared plan is for healthy adults aged 18 and over who are not pregnant or breastfeeding. <button type="button" class="mpg-link" data-act="edit2">Make your own plan</button></p>' : '';
    if (t.floored) notes += '<p class="mpg-note">Your calculated target was below ' + (o.sex === 'male' ? '1,500' : '1,200') + ' kcal, so we have raised it to that minimum. Eating less than this should only be done with medical supervision.</p>';
    if (t.noDeficit) notes += '<p class="mpg-note mpg-warn">At your height, weight and activity, your body uses about ' + fmt(t.tdee) + ' kcal a day, which is at or below the lowest intake we plan for (' + fmt(t.kcal) + ' kcal). So this plan does not cut calories. If you want to lose weight, more daily activity is the safest lever; please talk to your GP or a dietitian before eating less.</p>';
    if (t.noSurplus) notes += '<p class="mpg-note mpg-warn">Because your BMI is 30 or more, this plan does not add extra calories. It keeps calories at your maintenance level with plenty of protein, which supports muscle when you do strength training.</p>';
    if (t.lowBmi) notes += '<p class="mpg-note mpg-warn">Your BMI is below 17. Please talk to your GP before changing how you eat; they can check what is right for you.</p>';
    if (p.restoreFailed) notes += '<p class="mpg-note">We could not restore every meal from this link, so part of this plan has been freshly chosen.</p>';
    var avgK = p.days.reduce(function (a, x) { return a + x.kcal; }, 0) / p.days.length;
    if (o.focus === 'b' && avgK < t.kcal * 0.93) notes += '<p class="mpg-note">To keep carbohydrate moderate, this plan averages ' + fmt(avgK) + ' kcal a day, below your target. Top up with protein or healthy fats rather than starch: a boiled egg, a handful of nuts, a pot of ' + (o.diet === 'vegan' ? 'soya yogurt' : 'Greek yogurt') + ', or olive oil on your vegetables.</p>';
    if (p.includeFail) notes += '<p class="mpg-note">We could not add <b>' + esc(p.includeName) + '</b> to your plan because ' + (p.includeFail === 'snack' ? 'it is a snack and your plan has no snack. Choose "3 meals and a snack" to include it.' : p.includeFail === 'carbs' ? 'it is higher in carbohydrate than the recipes we use for a blood sugar plan.' : p.includeFail === 'time' ? 'it takes longer than your cooking-time limit.' : 'it does not fit your diet or the foods you leave out.') + '</p>';
    if (p.included) notes += '<p class="mpg-note">Your plan starts with <b>' + esc(p.includeName) + '</b> on Day 1.</p>';
    if (p.restored && p.replaced) notes += '<p class="mpg-note">' + p.replaced + ' meal' + (p.replaced > 1 ? 's' : '') + ' in this saved plan ' + (p.replaced > 1 ? 'are' : 'is') + ' no longer available, so we have chosen ' + (p.replaced > 1 ? 'replacements' : 'a replacement') + '.</p>';
    if (o.focus === 'b') notes += '<p class="mpg-note">If you take medicine for diabetes, such as insulin or a sulphonylurea, talk to your GP or diabetes team before cutting carbohydrate, as it can cause low blood sugar.</p>';
    if (avgP < t.protein * 0.85) notes += '<p class="mpg-note">This plan averages ' + Math.round(avgP) + 'g of protein a day, below your ' + t.protein + 'g target. ' + (o.diet === 'vegetarian' || o.diet === 'vegan' ? 'Plant-based plans often fall a little short. ' : '') + 'Easy top-ups: a pot of ' + (o.diet === 'vegan' ? 'soya yogurt' : 'Greek yogurt') + ', a handful of edamame, or an extra portion of beans or lentils.</p>';
    var tr = p.notes.map(function (n) { var m = /time-relaxed=(\d+).*:([BLDS])$/.exec(n); return m ? { lim: +m[1], meal: m[2] } : null; }).filter(Boolean);
    if (tr.length) notes += '<p class="mpg-note">With your choices, too few ' + andList(tr.map(function (x) { return MEAL_PL[x.meal]; })) + ' take ' + o.maxTime + ' minutes or less, so some take longer: ' + andList(tr.map(function (x) { return MEAL_PL[x.meal] + ' up to ' + x.lim + ' minutes'; })) + '. Every other meal keeps to your limit.</p>';
    if (o.focus !== 'b' && avgK < t.kcal * 0.93) notes += '<p class="mpg-note">This plan averages ' + fmt(avgK) + ' kcal a day, below your ' + fmt(t.kcal) + ' kcal target, because ' + (+o.meals !== 4 ? 'reaching it in 3 meals would make the portions too large. ' : 'we keep each portion to a sensible size. ') + (+o.meals !== 4 && E.poolSizes(DATA, Object.assign({}, o, { meals: 4 })).S >= E.MIN_POOL ? '<button type="button" class="mpg-link" data-act="add-snack">Add a daily snack</button>' : 'A handful of nuts or an extra slice of wholegrain bread closes the gap.') + '</p>';
    if (p.notes.some(function (n) { return /bs-short/.test(n); })) notes += '<p class="mpg-note">With your other choices, there are few blood-sugar-tagged recipes for some meals, so we have included others and kept their portions moderate.</p>';
    state.notesHtml = notes;
    var main = '';
    if (state.view === 'day') {
      main = '<div class="mpg-tabs" role="group" aria-label="Choose a day">' + p.days.map(function (x, i) { return '<button type="button" aria-pressed="' + (i === d) + '" class="' + (i === d ? 'on' : '') + '" data-day="' + i + '" aria-label="Day ' + (i + 1) + '"><span class="mpg-dl">Day </span>' + (i + 1) + '</button>'; }).join('') + '</div>' +
        '<div class="mpg-daytot" aria-live="polite"><div class="mpg-dt-nums"><div><span>Calories</span><b>' + fmt(day.kcal) + ' <small>/ ' + fmt(t.kcal) + '</small></b><i class="mpg-bar"><i style="width:' + Math.min(100, day.kcal / t.kcal * 100) + '%"></i></i></div><div><span>Protein</span><b>' + day.p + 'g <small>/ at least ' + t.protein + 'g</small></b><i class="mpg-bar' + (day.p < t.protein * 0.85 ? ' low' : '') + '"><i style="width:' + Math.min(100, day.p / t.protein * 100) + '%"></i></i></div><div><span>Carbs</span><b>' + day.c + 'g</b></div><div><span>Fat</span><b>' + day.f + 'g</b></div></div><div class="mpg-dt-chart">' + donut(day) + '</div></div>' +
        '<div class="mpg-cards">' + day.items.map(function (it, i) { return card(it, d, i); }).join('') + '</div>' +
        (day.items.some(function (x) { return x.leftover || x.cookFor; }) ? '<p class="mpg-small mpg-safe-tip"><b>Leftovers safely:</b> cool cooked food within an hour, keep it covered in the fridge and eat it within 2 days; cooked rice within 24 hours. Dishes served hot should be reheated once only, until steaming hot all the way through. Dishes served cold can be eaten straight from the fridge.</p>' : '') +
        '<div class="mpg-dayact"><button type="button" class="mpg-ghost" data-act="reroll">↻ New ideas for Day ' + (d + 1) + '</button></div>';
    } else if (state.view === 'week') main = weekView();
    else main = shopView();
    root.innerHTML =
      '<section class="mpg-plan" id="plan">' +
      '<div class="mpg-sum"><div class="mpg-sum-t"><p class="mpg-kicker">Your 7-day plan</p><h2 tabindex="-1">' + fmt(t.kcal) + ' kcal a day, ' + FOCUS[o.focus].toLowerCase() + ' focus</h2></div>' +
      '<div class="mpg-sum-g"><div><span>Protein</span><b>' + t.protein + 'g+</b></div><div><span>Diet</span><b>' + DIETS[o.diet] + '</b></div><div><span>Meals</span><b>' + (p.split.S ? '3 + snack' : '3 a day') + '</b></div></div></div>' +
      notes +
      '<div class="mpg-views" role="group" aria-label="Plan view">' + [['day', 'Day<span class="mpg-xl"> by day</span>'], ['week', 'Week<span class="mpg-xl"> at a glance</span>'], ['shop', 'Shopping<span class="mpg-xl"> list</span>']].map(function (v) { return '<button type="button" data-view="' + v[0] + '" aria-pressed="' + (state.view === v[0]) + '" class="' + (state.view === v[0] ? 'on' : '') + '">' + v[1] + '</button>'; }).join('') + '</div>' +
      main +
      '<div class="mpg-tools"><button type="button" class="mpg-cta" data-act="print" aria-expanded="false" aria-controls="mpg-printopt">Print or save as PDF</button><div class="mpg-tlinks">' + (state.undo.length ? '<button type="button" data-act="undo">↶ Undo last change</button>' : '') + '<button type="button" data-act="new">New plan, same answers</button><button type="button" data-act="edit">Change my answers</button><button type="button" data-act="share">Copy link</button><button type="button" data-act="restart">Start again</button></div></div>' +
      '<div class="mpg-printopt" id="mpg-printopt" role="group" aria-label="Choose what to print" hidden></div>' +
      '<p class="mpg-small">Calories use the Mifflin-St Jeor equation and your activity level, adjusted for your goal; protein is based on a healthy weight for your height. Portions are in half servings, so daily totals vary a little. Recipe nutrition is calculated per serving from USDA data. General guidance for healthy adults, not medical advice.</p>' +
      '<div class="mpg-print-slot"></div></section>';
    qa('[data-day]').forEach(function (b) { b.addEventListener('click', function () { state.picker = null; state.day = +b.dataset.day; render('[data-day="' + b.dataset.day + '"]'); }); });
    qa('[data-goday]').forEach(function (b) { b.addEventListener('click', function () { state.picker = null; state.day = +b.dataset.goday; state.view = 'day'; render('[data-day="' + b.dataset.goday + '"]'); }); });
    qa('[data-view]').forEach(function (b) { b.addEventListener('click', function () { state.picker = null; state.view = b.dataset.view; render('[data-view="' + b.dataset.view + '"]'); }); });
    qa('[data-swap]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.swap; state.picker = state.picker === k ? null : k;
        render(state.picker ? '.mpg-pick-i' : '[data-swap="' + k + '"]');
      });
    });
    function lunchMsg(dd, kind) { return kind === 'fresh' ? 'This dinner does not keep well, so Day ' + (dd + 2) + ' lunch is now a fresh recipe instead of leftovers' : 'Day ' + (dd + 2) + ' lunch updated to match this dinner'; }
    function doSwap(slug) {
      var a = state.picker.split(',').map(Number); snap();
      var res = E.swap(state.plan, state.o, a[0], a[1], Math.floor(Math.random() * 1e9), slug);
      state.picker = null; writeURL(state.o); render('[data-swap="' + a[0] + ',' + a[1] + '"]');
      if (res && res.lunchChanged) flash(lunchMsg(a[0], res.lunchChanged));
    }
    qa('[data-pick]').forEach(function (b) { b.addEventListener('click', function () { doSwap(b.dataset.pick); }); });
    if (q('[data-act=surprise]')) q('[data-act=surprise]').addEventListener('click', function () { doSwap(null); });
    function closePick() { var k = state.picker; state.picker = null; render('[data-swap="' + k + '"]'); }
    if (q('[data-act=pick-close]')) q('[data-act=pick-close]').addEventListener('click', closePick);
    if (q('.mpg-pick')) q('.mpg-pick').addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closePick(); } });
    if (q('[data-act=reroll]')) q('[data-act=reroll]').addEventListener('click', function () { snap(); var res = E.reroll(state.plan, state.o, d, Math.floor(Math.random() * 1e9)); state.picker = null; writeURL(state.o); render('[data-act=reroll]'); flash('New ideas for Day ' + (d + 1) + (res && res.lunchChanged ? '. ' + lunchMsg(d, res.lunchChanged) : '')); });
    if (q('[data-act=undo]')) q('[data-act=undo]').addEventListener('click', undo);
    q('[data-act=restart]').addEventListener('click', startAgain);
    qa('[data-got]').forEach(function (c) { c.addEventListener('change', function () { state.got[c.dataset.got] = c.checked; c.parentNode.classList.toggle('on', c.checked); }); });
    q('[data-act=new]').addEventListener('click', function () { snap(); state.o = Object.assign({}, state.o, { seed: Math.floor(Math.random() * 1e6) + 1 }); state.code = null; state.plan = build(state.o, null); state.picker = null; state.day = 0; writeURL(state.o); render('[data-act=new]'); flash('New plan created. Use Undo to go back.'); });
    q('[data-act=edit]').addEventListener('click', editAnswers);
    if (q('[data-act=add-snack]')) q('[data-act=add-snack]').addEventListener('click', function () { snap(); state.o = Object.assign({}, state.o, { meals: 4 }); state.form = Object.assign({}, state.form || state.o, { meals: 4 }); state.code = null; state.plan = build(state.o, null); state.picker = null; state.day = 0; writeURL(state.o); render('[data-act=undo]'); flash('Daily snack added. Use Undo to go back.'); });
    if (q('[data-act=edit2]')) q('[data-act=edit2]').addEventListener('click', function () { state.fromLink = false; startForm({}); });
    q('[data-act=print]').addEventListener('click', togglePrintOpt);
    q('[data-act=share]').addEventListener('click', function () {
      var u = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { flash('Link copied'); }, function () { prompt('Copy this link:', u); });
    });
    if (focusSel && q(focusSel)) q(focusSel).focus();
  }

  // ---------------- Print / PDF ----------------
  // The same notes as on screen, without buttons, so the PDF says what the plan changed or could not do.
  function printNotes() {
    var h = (state.notesHtml || '').replace(/<button[^>]*data-act="add-snack"[^>]*>[\s\S]*?<\/button>/g, 'Choosing 3 meals and a snack would close the gap.').replace(/<button[\s\S]*?<\/button>/g, '').replace(/class="mpg-note[^"]*"/g, 'class="pp-note"');
    return h ? '<div class="pp-notes"><h3>About your plan</h3>' + h + '</div>' : '';
  }
  function buildPrint(recipes) {
    var p = state.plan, o = state.o, t = p.targets, meals = Object.keys(p.split), host = SITE.replace(/^https?:\/\//, '');
    var g = shopping();
    var cover = '<section class="pp-cover"><p class="pp-brand">' + brand(o) + ' · ' + esc(host) + '</p><h1>Your 7-day meal plan</h1>' +
      '<div class="pp-sum"><div><span>Daily target</span><b>' + fmt(t.kcal) + ' kcal</b></div><div><span>Protein, at least</span><b>' + t.protein + 'g</b></div><div><span>Focus</span><b>' + FOCUS[o.focus] + '</b></div><div><span>Diet</span><b>' + DIETS[o.diet] + '</b></div></div>' +
      '<table class="pp-week"><thead><tr><th></th>' + p.days.map(function (d, i) { return '<th>Day ' + (i + 1) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      meals.map(function (m, mi) { return '<tr><th>' + MEALS[m] + '</th>' + p.days.map(function (d) { var it = d.items[mi]; return '<td><img src="' + esc(it.r.img) + '" alt="">' + esc(it.r.n) + (it.leftover ? ' <em>(leftovers)</em>' : '') + '</td>'; }).join('') + '</tr>'; }).join('') +
      '<tr class="pp-tot"><th>Total</th>' + p.days.map(function (d) { return '<td>' + fmt(d.kcal) + ' kcal<br>' + d.p + 'g protein</td>'; }).join('') + '</tr></tbody></table>' + printNotes() + '</section>';
    var shop = '<section class="pp-shop"><h2>Shopping list</h2><p class="pp-x">Everything you still need for the recipes in your plan; items you ticked as already in your kitchen are left out. Quantities are in each recipe: multiply them by the servings shown on the day pages.</p><div class="pp-shop-g">' +
      AISLE_ORDER.map(function (a) { return [a, (g[a] || []).filter(function (it) { return !state.got[it.n]; })]; }).filter(function (x) { return x[1].length; }).map(function (x) { return '<div><h3>' + AISLE_NAME[x[0]] + '</h3><ul>' + x[1].map(function (it) { return '<li><span class="pp-box"></span>' + esc(it.label || it.n) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div></section>';
    var days = '<section class="pp-days">' + p.days.map(function (d, di) {
      return '<div class="pp-day"><h2>Day ' + (di + 1) + ' <small>' + fmt(d.kcal) + ' kcal · ' + d.p + 'g protein · ' + d.c + 'g carbs · ' + d.f + 'g fat</small></h2>' + d.items.map(function (it) {
        var url = SITE + '/recipes/' + it.r.s;
        return '<div class="pp-it"><img src="' + esc(it.r.img) + '" alt=""><div><p class="pp-m">' + MEALS[it.meal] + (it.leftover ? ' · leftovers from last night' : '') + (it.cookFor ? ' · cook ' + E.fmtServ(it.cookFor) + ', the rest is tomorrow\'s lunch' + (it.makes && it.cookFor > it.makes ? ' (recipe makes ' + it.makes + ': scale it up)' : '') : '') + '</p><p class="pp-n"><a href="' + url + '">' + esc(it.r.n) + '</a></p><p class="pp-x">' + E.fmtServ(it.mult) + ' · ' + fmt(it.r.k * it.mult) + ' kcal · ' + Math.round(it.r.p * it.mult) + 'g protein' + (it.leftover ? '' : ' · ' + it.r.t + ' min') + '</p></div></div>';
      }).join('') + '</div>';
    }).join('') + '</section>';
    var tips = '<section class="pp-tips"><h2>Tips for the week</h2><ul>' +
      (o.leftovers ? '<li><b>Cook once, eat twice.</b> On the days marked, cook the extra servings at dinner. Cool leftovers within an hour, keep them in the fridge and eat within 2 days. Cooked rice: eat within 24 hours and reheat only once, until steaming hot.</li>' : '') +
      '<li><b>Shop once.</b> Tick off what you already have before you go.</li><li><b>Prep ahead.</b> Wash and chop vegetables for two or three days at a time.</li><li><b>Change anything.</b> Open your plan online and press Swap on any meal; your link keeps your plan and your changes.</li></ul>' +
      '<p class="pp-x pp-link"><a href="' + esc(location.href) + '">Open your plan online</a> to swap meals or print it again.</p><p class="pp-x">General guidance for healthy adults, not medical advice. Recipes, food guides and free tools at ' + esc(host) + '.</p></section>';
    var slot = document.getElementById('mpg-print-root');
    if (!slot) { slot = document.createElement('div'); slot.id = 'mpg-print-root'; document.body.appendChild(slot); }
    slot.innerHTML = '<div class="mpg-print">' + cover + shop + days + (recipes ? recipesSection(recipes) : '') + tips + '</div>';
    document.body.classList.add('mpg-printing');
    return slot;
  }
  // Recipes in the plan, in order of first use, with how the plan uses each one.
  function planRecipes() {
    var list = [], by = {};
    state.plan.days.forEach(function (d, di) {
      d.items.forEach(function (it) {
        if (!it.r) return;
        if (!by[it.r.s]) { by[it.r.s] = { r: it.r, uses: [] }; list.push(by[it.r.s]); }
        by[it.r.s].uses.push({ d: di, meal: it.meal, mult: it.mult, cookFor: it.cookFor, leftover: it.leftover });
      });
    });
    return list;
  }
  function togglePrintOpt() {
    var box = q('.mpg-printopt'), btn = q('[data-act=print]');
    if (!box.hidden) { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); return; }
    var n = planRecipes().length, pages = 5 + Math.ceil(n / 2);
    box.innerHTML = '<p class="mpg-po-t">What would you like to print or save?</p>' +
      '<button type="button" class="mpg-po" data-print="plan"><b>Plan and shopping list</b><small>About 5 pages, with links to every recipe</small></button>' +
      '<button type="button" class="mpg-po" data-print="full"><b>Plan, shopping list and full recipes</b><small>About ' + pages + ' pages: ingredients and method for all ' + n + ' recipes</small></button>' +
      '<p class="mpg-po-s" aria-live="polite"></p><button type="button" class="mpg-link" data-act="print-cancel">Cancel</button>';
    box.hidden = false; btn.setAttribute('aria-expanded', 'true');
    q('[data-print="plan"]', box).addEventListener('click', function () { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); printPlan(null); });
    q('[data-print="full"]', box).addEventListener('click', function () { printFull(box); });
    q('[data-act=print-cancel]', box).addEventListener('click', function () { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); });
    q('[data-print="plan"]', box).focus();
  }

  // Full recipes are read from each recipe page when needed, so the generator page stays light
  // and the printed method always matches the recipe page.
  var RCP_CACHE = {};
  function cleanRich(el) {
    var OK = { UL: 'ul', OL: 'ol', LI: 'li', P: 'p', STRONG: 'b', B: 'b', EM: 'i', I: 'i', BR: 'br', H3: 'p', H4: 'p' };
    function walk(n) {
      if (n.nodeType === 3) return esc(n.nodeValue);
      if (n.nodeType !== 1 || /^(SCRIPT|STYLE|IFRAME|IMG|FIGURE|svg)$/i.test(n.nodeName)) return '';
      var inner = Array.prototype.map.call(n.childNodes, walk).join(''), t = OK[n.nodeName.toUpperCase()];
      if (t === 'br') return '<br>';
      return t ? '<' + t + '>' + inner + '</' + t + '>' : inner;
    }
    return walk(el);
  }
  function fetchRecipe(slug) {
    if (RCP_CACHE[slug]) return Promise.resolve(RCP_CACHE[slug]);
    var timeout = new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 12000); });
    var get = fetch(SITE + '/recipes/' + encodeURIComponent(slug), { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html'), rts = doc.querySelectorAll('.w-richtext');
        var ing = doc.querySelector('[data-rcp="ingredients"]') || rts[0], met = doc.querySelector('[data-rcp="method"]') || rts[1];
        if (!ing || !met) throw new Error('no recipe content');
        var out = { ing: cleanRich(ing), method: cleanRich(met) };
        if (out.ing.length < 20 || out.method.length < 20) throw new Error('empty recipe content');
        RCP_CACHE[slug] = out; return out;
      });
    return Promise.race([get, timeout]);
  }
  function printFull(box) {
    var list = planRecipes(), status = q('.mpg-po-s', box), done = 0;
    qa('button', box).forEach(function (b) { b.disabled = true; });
    status.textContent = 'Getting ' + list.length + ' recipes...';
    Promise.all(list.map(function (x) {
      return fetchRecipe(x.r.s).then(function (v) { done++; status.textContent = 'Getting recipes: ' + done + ' of ' + list.length; return v; }, function (e) { console.warn('[mpg] recipe not loaded', x.r.s, e && e.message); return null; });
    })).then(function (res) {
      var map = {}; list.forEach(function (x, i) { map[x.r.s] = res[i]; });
      var missing = res.filter(function (v) { return !v; }).length;
      status.textContent = missing ? missing + ' recipe' + (missing > 1 ? 's' : '') + ' could not be loaded; ' + (missing > 1 ? 'they are' : 'it is') + ' linked instead.' : '';
      qa('button', box).forEach(function (b) { b.disabled = false; });
      box.hidden = true; q('[data-act=print]').setAttribute('aria-expanded', 'false');
      printPlan(map);
    });
  }
  function usesText(x) {
    return x.uses.filter(function (u) { return !u.leftover; }).map(function (u) {
      var t = 'Day ' + (u.d + 1) + ' ' + MEALS[u.meal].toLowerCase() + ', ' + E.fmtServ(u.mult).replace('Half a serving', 'half a serving');
      if (u.cookFor) t += ' (cook ' + E.fmtServ(u.cookFor) + ': the rest is Day ' + (u.d + 2) + ' lunch)';
      return t;
    }).join('; ');
  }
  function recipesSection(map) {
    return '<section class="pp-recipes"><h2>Recipes</h2><p class="pp-x">Quantities below are for the whole recipe. Scale them to the servings your plan uses, shown under each title.</p>' + planRecipes().map(function (x) {
      var r = x.r, v = map[r.s], url = SITE + '/recipes/' + r.s, sv = /(\d+)/.exec(r.sv || '');
      return '<article class="pp-rcp"><div class="pp-rcp-h"><img src="' + esc(r.img) + '" alt=""><div><p class="pp-m">' + MEALS[r.m] + ' · ' + r.t + ' min · ' + r.k + ' kcal and ' + r.p + 'g protein per serving</p><h3><a href="' + url + '">' + esc(r.n) + '</a></h3>' +
        '<p class="pp-x">' + (sv ? 'This recipe makes ' + (/^Makes/i.test(r.sv) ? r.sv.replace(/^Makes\s*/i, '') : sv[1] + (sv[1] === '1' ? ' serving' : ' servings')) + '. ' : '') + 'In your plan: ' + esc(usesText(x)) + '.</p></div></div>' +
        (v ? '<div class="pp-rcp-b"><div><h4>Ingredients</h4>' + v.ing + '</div><div><h4>Method</h4>' + v.method + '</div></div>' : '<p class="pp-x">Full recipe: <a href="' + url + '">' + esc(url.replace(/^https?:\/\//, '')) + '</a></p>') +
        '</article>';
    }).join('') + '</section>';
  }

  function printPlan(recipes) {
    var slot = buildPrint(recipes);
    var imgs = qa('img', slot), left = imgs.length, done = false;
    function go() { if (done) return; done = true; window.print(); }
    if (!left) go();
    imgs.forEach(function (i) { if (i.complete) { if (--left <= 0) go(); } else i.onload = i.onerror = function () { if (--left <= 0) go(); }; });
    setTimeout(go, 4000);
  }

  window.addEventListener('beforeprint', function () { if (state.plan && !(state.plan.blocked && state.plan.blocked.length) && q('.mpg-plan') && !document.querySelector('#mpg-print-root .mpg-print')) buildPrint(null); });
  window.addEventListener('afterprint', function () { document.body.classList.remove('mpg-printing'); var pr = document.getElementById('mpg-print-root'); if (pr) pr.innerHTML = ''; });

  function flash(t) { var el = document.createElement('div'); el.className = 'mpg-flash'; el.setAttribute('role', 'status'); el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 3500); }

  // ---------------- Boot ----------------
  function boot(fromHistory) {
    // After "Start again", Back and Forward must not bring the old plan back, even across a page reload.
    var nav = ''; try { nav = (performance.getEntriesByType('navigation')[0] || {}).type || ''; } catch (e) {}
    if (SS.get('cleared') && (fromHistory || nav === 'back_forward')) { state.cleared = true; landing(); replace('landing'); return; }
    SS.del('cleared');
    var pre = readURL(), code = pre.code; delete pre.code;
    var ok = pre.sex ? clean(pre) : null;
    if (ok) { var own = SS.get('own'); state.code = code; state.fromLink = !(own && own === code); state.form = Object.assign({}, ok); state.undo = []; run(ok, true); return; }
    if (pre.include) state.include = pre.include;
    var saved = !pre.sex && SS.get('form');
    if (saved && saved.form && saved.form.sex !== undefined && typeof saved.step === 'number') { state.form = saved.form; state.step = Math.max(0, Math.min(3, saved.step)); state.units = saved.units || 'metric'; drawStep(); replace('form'); return; }
    landing(pre.sex ? 'We cannot show this plan link. It may be incomplete, or the details in it are outside what this planner supports. You can make a new plan below.' : ''); replace('landing');
  }
  boot();
})();
