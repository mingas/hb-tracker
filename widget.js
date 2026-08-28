/* ============================================================
   Today at The Hormone Blueprint — daily widget logic
   Reads pools from window.HB_WIDGET_DATA (men/women/insight)
   and foods from window.HB_FOODS (shared with foods hub).
   - Daily deterministic pick by London day-number
   - Manual per-card shuffle (food, insight) sequential through pool
   - For Men/Women: 5 batches of 6, "Show me another" swaps all 6
   - Skeleton, image fallback, aria-live, GA4 events, defensive hide
   ============================================================ */
(function(){
  var D=document;
  var PER=6, BATCHES=5;

  // ---- London-time day number (handles BST/GMT) ----
  function londonDayNum(){
    try{
      var now=new Date();
      // Get London date parts via Intl
      var f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'});
      var p=f.formatToParts(now), o={};
      p.forEach(function(x){o[x.type]=x.value;});
      var utcMid=Date.UTC(+o.year,(+o.month)-1,+o.day);
      return Math.floor(utcMid/86400000);
    }catch(e){
      return Math.floor(Date.now()/86400000);
    }
  }
  var DAY=londonDayNum();
  function di(len,salt){ if(!len)return 0; return ((DAY+salt)%len+len)%len; }

  // ---- seeded shuffle: deterministic per day, random-feeling order, no repeats ----
  function seededOrder(n,seed){
    var arr=[],i; for(i=0;i<n;i++)arr.push(i);
    var s=(seed>>>0)||1;
    function rnd(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }
    for(i=n-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=arr[i];arr[i]=arr[j];arr[j]=t; }
    return arr;
  }

  // ---- GA4 (defensive) ----
  function track(action,label){
    try{ if(typeof window.gtag==='function'){ window.gtag('event',action,{event_category:'daily_widget',event_label:label||''}); } }catch(e){}
  }

  // ---- London date label for footer ----
  function londonDateLabel(){
    try{
      return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long'}).format(new Date());
    }catch(e){ return ''; }
  }

  var ICONHTML=function(name){ return '<svg><use href="#ic-'+name+'"></use></svg>'; };

  function preload(url,cb){ if(!url){cb(false);return;} var i=new Image(); i.onload=function(){cb(true);}; i.onerror=function(){cb(false);}; i.src=url; }

  function wire(root){
    if(!root) return;
    var DATA=window.HB_WIDGET_DATA||{};
    var FOODS=DATA.foods||[];
    var men=DATA.men||[], women=DATA.women||[], insight=DATA.insight||[];

    // DEFENSIVE: if core pools are empty, hide the whole block rather than show broken UI
    if(!FOODS.length && !insight.length && !men.length && !women.length){
      root.style.display='none'; return;
    }

    // Seeded-random order per pool (reshuffles each day), pointers start at 0
    var ordFood=seededOrder(FOODS.length, DAY+11);
    var ordIns=seededOrder(insight.length, DAY+23);
    var ordMen=seededOrder(men.length, DAY+37);
    var ordWomen=seededOrder(women.length, DAY+53);
    // insight visual design rotates A/B/C by day (guarantees all three appear)
    var DESIGNS=['a','b','c'];
    var designOfDay=DESIGNS[((DAY%3)+3)%3];

    var st={
      food:0,      // pointer into ordFood
      ins:0,       // pointer into ordIns
      menB:0,      // batch pointer (0..BATCHES-1)
      womenB:0,
      aud:'men'
    };

    var foodCard=root.querySelector('[data-kind=food]');
    var insCard=root.querySelector('[data-kind=insight]');
    var live=root.querySelector('[data-live]');
    function say(t){ if(live) live.textContent='Now showing: '+t; }

    // ---- FOOD ----
    // Content shows immediately; the photo loads in the background and swaps in
    // when ready, or shows a fallback on error. Never blocks the card on the image.
    function paintFood(first,soft){
      if(!FOODS.length){ if(foodCard) foodCard.style.display='none'; return; }
      var f=FOODS[ordFood[st.food%FOODS.length]];
      if(!first){ foodCard.classList.add('swapping'); if(soft) foodCard.classList.add('soft'); }
      function apply(){
        var url=f.p||f.img;
        var bg=foodCard.querySelector('.bg'), fb=foodCard.querySelector('.fallback');
        if(fb) fb.style.display='none';
        if(bg){ bg.style.display=''; bg.style.backgroundImage=''; }
        preload(url,function(ok){
          if(ok){ if(bg){ bg.style.backgroundImage="url('"+url+"')"; bg.style.display=''; } if(fb) fb.style.display='none'; }
          else { if(bg) bg.style.display='none'; if(fb) fb.style.display='flex'; }
        });
        var chip=foodCard.querySelector('.hb-t-chip');
        var tier=(f.e==='Supports'?'g':f.e==='Moderation'?'a':'r');
        chip.innerHTML='<span class="hb-t-dot '+tier+'"></span>'+(f.e||'Supports');
        foodCard.querySelector('.hb-t-name').textContent=f.n;
        foodCard.querySelector('.hb-t-text').textContent='';
        var tags=[]; if(f.g)tags.push(f.g);
        foodCard.querySelector('.hb-t-meta').innerHTML=tags.map(function(t){return '<span class="hb-t-tag">'+t+'</span>';}).join('');
        var cta=foodCard.querySelector('.hb-t-cta'); if(cta) cta.setAttribute('href','/foods/'+f.s);
        var ovl=foodCard.querySelector('.hb-t-cardlink'); if(ovl) ovl.setAttribute('href','/foods/'+f.s);
        foodCard.classList.remove('skeleton','swapping');
        if(soft) setTimeout(function(){ foodCard.classList.remove('soft'); },600);
        say(f.n);
      }
      setTimeout(apply, first?0:(soft?560:160));
    }

    // ---- INSIGHT (design rotates by day: a=editorial, b=colour-coded, c=botanical) ----
    function insTypeClass(label){
      var l=(label||'').toLowerCase();
      if(l.indexOf('disruptor')>=0) return 't-disr';
      if(l.indexOf('supplement')>=0) return 't-supp';
      return 't-q';
    }
    function insIcon(label){
      var l=(label||'').toLowerCase();
      if(l.indexOf('disruptor')>=0) return 'flame';
      if(l.indexOf('supplement')>=0) return 'pill';
      return 'bulb';
    }
    function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function buildInsMedia(q){
      var media=insCard.querySelector('.hb-t-media');
      var label=q.label||'Insight', t=esc(q.t);
      var typeCls=insTypeClass(label);
      var design=(window.HB_FORCE_DESIGN||designOfDay);
      if(design==='a'){
        media.className='hb-t-media des-a';
        media.innerHTML='<div class="da-mark">\u201C</div><div class="da-q"><span>'+t+'</span></div><div class="da-cat">'+esc(label)+'</div>';
      } else if(design==='b'){
        media.className='hb-t-media des-b '+typeCls;
        media.innerHTML='<div class="db-cat">'+esc(label)+'</div><div class="db-ico">'+ICONHTML(insIcon(label))+'</div><div class="db-q"><span>'+t+'</span></div>';
      } else {
        media.className='hb-t-media des-c';
        media.innerHTML='<div class="dc-cat">'+esc(label)+'</div><div class="dc-panel"><span>'+t+'</span></div>';
      }
    }
    function paintIns(first,soft){
      if(!insight.length){ if(insCard) insCard.style.display='none'; return; }
      var q=insight[ordIns[st.ins%insight.length]];
      if(!first){ insCard.classList.add('swapping'); if(soft) insCard.classList.add('soft'); }
      setTimeout(function(){
        buildInsMedia(q);
        insCard.querySelector('.hb-t-label').textContent=q.label||'Insight';
        insCard.querySelector('.hb-t-text').textContent=q.x||'';
        var cta=insCard.querySelector('.hb-t-cta'); if(cta&&q.u) cta.setAttribute('href',q.u);
        var ovl=insCard.querySelector('.hb-t-cardlink'); if(ovl&&q.u) ovl.setAttribute('href',q.u);
        insCard.classList.remove('skeleton','swapping');
        if(soft) setTimeout(function(){ insCard.classList.remove('soft'); },600);
        say(q.t);
      }, first?0:(soft?560:160));
    }

    // ---- AUDIENCE LIST ----
    function batch(which){
      var pool=which==='men'?men:women;
      if(!pool.length) return [];
      var ord=which==='men'?ordMen:ordWomen;
      var b=which==='men'?st.menB:st.womenB;
      var start=b*PER, out=[];
      for(var k=0;k<PER;k++){ out.push(pool[ord[(start+k)%pool.length]]); }
      return out;
    }
    function paintList(which,first){
      var ul=root.querySelector('[data-list='+which+']');
      if(!ul) return;
      var items=batch(which);
      if(!items.length){ ul.innerHTML=''; return; }
      function render(){
        ul.innerHTML=items.map(function(x){
          return '<li><a href="'+x.u+'" data-wlink="'+which+'"><span class="lico">'+ICONHTML(x.i||'spark')+'</span><span class="ltext">'+esc(x.t)+'</span><span class="larr">'+ICONHTML('arrow')+'</span></a></li>';
        }).join('');
        ul.classList.remove('swapping-list');
        // attach click tracking
        [].forEach.call(ul.querySelectorAll('[data-wlink]'),function(a){
          a.addEventListener('click',function(){ track('link_click',which+':'+a.getAttribute('href')); });
        });
      }
      if(first){ render(); } else { ul.classList.add('swapping-list'); setTimeout(render,160); say('New '+which+' topics'); }
    }
    function paintDots(){
      var which=st.aud, b=which==='men'?st.menB:st.womenB;
      var wrap=root.querySelector('[data-dots=active]');
      if(!wrap) return;
      wrap.className='hb-t-dots '+(which==='men'?'men-panel':'women-panel');
      var dots=''; for(var k=0;k<BATCHES;k++){ dots+='<i class="'+(k===b?'on':'')+'"></i>'; }
      wrap.innerHTML=dots;
    }

    // footer date
    var note=root.querySelector('[data-daynote]');
    if(note){ var lbl=londonDateLabel(); if(lbl) note.textContent='Picked automatically for '+lbl+' · updates every day'; }

    // initial paint
    paintFood(true); paintIns(true); paintList('men',true); paintList('women',true); paintDots();

    // ---- gentle autoplay: cycles slowly, pauses on hover, stops for good on manual use ----
    var AUTO_MS=10000, AUTO_DELAY=5000;
    var reduced=false;
    try{ reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
    var autoTimer=null, autoPaused=false, autoStopped=reduced;
    function autoTick(){
      if(autoPaused||autoStopped||D.hidden) return;
      if(FOODS.length){ st.food=(st.food+1)%FOODS.length; paintFood(false,true); }
      if(insight.length){ st.ins=(st.ins+1)%insight.length; paintIns(false,true); }
    }
    function autoStart(){ if(autoStopped||autoTimer) return; autoTimer=setInterval(autoTick,AUTO_MS); }
    function autoStop(){ if(autoTimer){ clearInterval(autoTimer); autoTimer=null; } }
    function autoKill(){ autoStopped=true; autoStop(); }
    if(!autoStopped){
      setTimeout(autoStart,AUTO_DELAY);
      var grid=root.querySelector('.hb-t-grid');
      if(grid){
        ['mouseenter','focusin'].forEach(function(ev){
          grid.addEventListener(ev,function(){ autoPaused=true; },true);
        });
        ['mouseleave','focusout'].forEach(function(ev){
          grid.addEventListener(ev,function(){ autoPaused=false; },true);
        });
        grid.addEventListener('touchstart',function(){ autoPaused=true; },{passive:true});
      }
      try{ D.addEventListener('visibilitychange',function(){ if(D.hidden) autoStop(); else autoStart(); }); }catch(e){}
    }

    // ---- interactions ----
    [].forEach.call(root.querySelectorAll('[data-shuffle]'),function(btn){
      btn.addEventListener('click',function(){
        autoKill();
        var k=btn.dataset.shuffle;
        if(k==='food'&&FOODS.length){ st.food=(st.food+1)%FOODS.length; paintFood(false); track('shuffle','food'); }
        if(k==='insight'&&insight.length){ st.ins=(st.ins+1)%insight.length; paintIns(false); track('shuffle','insight'); }
      });
    });
    var another=root.querySelector('[data-another=active]');
    if(another) another.addEventListener('click',function(){
      if(st.aud==='men'){ st.menB=(st.menB+1)%BATCHES; paintList('men',false); }
      else { st.womenB=(st.womenB+1)%BATCHES; paintList('women',false); }
      paintDots(); track('show_another',st.aud);
    });
    [].forEach.call(root.querySelectorAll('[data-aud]'),function(btn){
      btn.addEventListener('click',function(){
        st.aud=btn.dataset.aud;
        [].forEach.call(root.querySelectorAll('.hb-t-tab'),function(b){
          var on=b.dataset.aud===st.aud; b.classList.toggle('active',on); b.setAttribute('aria-selected',on?'true':'false');
        });
        [].forEach.call(root.querySelectorAll('.hb-t-panel'),function(p){ p.classList.toggle('active',p.dataset.panel===st.aud); });
        paintDots(); track('tab_switch',st.aud);
      });
    });
  }

  function _bootOld(){
    var roots=D.querySelectorAll('[data-hb-today]');
    [].forEach.call(roots,function(r){ try{ wire(r); }catch(e){ /* defensive */ } });
  }
  

  // ---- self-contained boot: inject CSS + sprite, build structure + SEO, then wire ----
  var HB_CSS=".hb-t-wrap{--cream:#f6f1e7;--panel:#fffdf8;--inset:#faf6ec;--ink:#1e3a2e;--ink-soft:#3e5449;--body:#4c584f;--muted:#8a9086;--gold:#7d6317;--gold-2:#a98a2e;--line:#e8e1d1;--line-2:#efe9db;--g:#3f9d6a;--a:#d6a635;--r:#c0553f;--men:#2b5566;--men-2:#e6edf0;--women:#8a4a6d;--women-2:#f4ecf1;--sh-sm:0 1px 3px rgba(30,58,46,.06);--sh:0 14px 40px rgba(30,58,46,.10),0 3px 10px rgba(30,58,46,.05);--sh-hover:0 18px 46px rgba(30,58,46,.14),0 4px 12px rgba(30,58,46,.07)}\n.hb-t-section{background:var(--cream);padding:36px 20px 8px}\n.hb-t-wrap{max-width:1060px;margin:0 auto;background:var(--panel);border:1px solid var(--line);border-radius:26px;box-shadow:var(--sh);padding:26px;position:relative;overflow:hidden;font-family:'Mulish',system-ui,sans-serif;color:var(--body);line-height:1.5}\n.hb-t-wrap *{box-sizing:border-box}\n.hb-t-wrap::before{content:\"\";position:absolute;inset:0 0 auto 0;height:4px;background:linear-gradient(90deg,var(--g),var(--gold-2) 55%,var(--women));opacity:.85}\n.hb-t-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px}\n.hb-t-kick{font-family:'IBM Plex Mono',monospace;letter-spacing:.2em;text-transform:uppercase;font-size:11.5px;color:var(--gold);margin-bottom:9px;display:flex;align-items:center;gap:8px}\n.hb-t-live{width:7px;height:7px;border-radius:50%;background:var(--g);box-shadow:0 0 0 3px rgba(63,157,106,.18)}\n.hb-t-title{font-family:'Fraunces',serif;font-weight:600;font-size:30px;line-height:1.08;color:var(--ink);letter-spacing:-.015em;margin:0}\n.hb-t-date{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.06em;color:var(--muted);white-space:nowrap;padding-bottom:4px}\n.hb-t-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n.hb-t-card{background:var(--inset);border:1px solid var(--line-2);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;position:relative}\n.hb-t-top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0}\n.hb-t-ckick{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:8px}\n.hb-t-ckick svg{width:14px;height:14px;stroke:var(--gold);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}\n.hb-t-shuf{appearance:none;border:1px solid var(--line);background:var(--panel);width:32px;height:32px;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);transition:.16s;flex-shrink:0}\n.hb-t-shuf:hover{background:var(--ink);color:#fff;border-color:var(--ink);transform:rotate(90deg)}\n.hb-t-shuf:focus-visible{outline:2px solid var(--gold);outline-offset:2px}\n.hb-t-shuf svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}\n.hb-t-media{margin:12px 16px 0;height:210px;border-radius:12px;position:relative;overflow:hidden;background:linear-gradient(135deg,#e3dcc9,#d8cfb8)}\n.hb-t-media .bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .28s}\n.hb-t-media .fallback{position:absolute;inset:0;display:none;align-items:center;justify-content:center;color:rgba(30,58,46,.25)}\n.hb-t-media .fallback svg{width:46px;height:46px;stroke:currentColor;fill:none;stroke-width:1.4}\n.hb-t-chip{position:absolute;left:10px;top:10px;z-index:2;background:rgba(255,253,248,.95);border-radius:999px;padding:5px 11px 5px 8px;font-size:11.5px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px;box-shadow:var(--sh-sm)}\n.hb-t-dot{width:8px;height:8px;border-radius:50%}\n.hb-t-dot.g{background:var(--g)}.hb-t-dot.a{background:var(--a)}.hb-t-dot.r{background:var(--r)}\n.hb-t-quote{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;padding:16px 20px}\n.hb-t-quote span{font-family:'Fraunces',serif;font-style:italic;font-weight:500;color:#fff;font-size:20px;line-height:1.26;text-align:center;text-shadow:0 1px 12px rgba(0,0,0,.28);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}\n.hb-t-scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.22))}\n.hb-t-body{padding:14px 18px 18px;display:flex;flex-direction:column;flex:1}\n.hb-t-name{font-family:'Fraunces',serif;font-weight:600;font-size:23px;color:var(--ink);line-height:1.12;margin-bottom:7px;letter-spacing:-.01em}\n.hb-t-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}\n.hb-t-text{color:var(--body);font-size:14px;line-height:1.5;margin-bottom:14px;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n.hb-t-meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:15px;min-height:26px}\n.hb-t-tag{font-size:11.5px;font-weight:600;color:var(--ink-soft);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:4px 10px}\n.hb-t-cta{align-self:flex-start;font-weight:700;font-size:14px;color:var(--gold);text-decoration:none;display:inline-flex;align-items:center;gap:6px;border-bottom:2px solid transparent;padding-bottom:1px;transition:gap .15s,border-color .15s}\n.hb-t-cta svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}\n.hb-t-cta:hover{gap:10px;border-color:var(--gold-2)}\n.hb-t-cardlink{position:absolute;inset:0;z-index:3;display:block;font-size:0;line-height:0;color:transparent}\n.hb-t-shuf{position:relative;z-index:5}\n.hb-t-cta{position:relative;z-index:4}\n.hb-t-card.swapping .bg,.hb-t-card.swapping .hb-t-name,.hb-t-card.swapping .hb-t-text,.hb-t-card.swapping .hb-t-meta,.hb-t-card.swapping .hb-t-quote,.hb-t-card.swapping .hb-t-chip,.hb-t-card.swapping .hb-t-label{opacity:0;transition:opacity .16s}\n.hb-t-card.swapping.soft .bg,.hb-t-card.swapping.soft .hb-t-name,.hb-t-card.swapping.soft .hb-t-text,.hb-t-card.swapping.soft .hb-t-meta,.hb-t-card.swapping.soft .hb-t-quote,.hb-t-card.swapping.soft .hb-t-chip,.hb-t-card.swapping.soft .hb-t-label{transition:opacity .55s cubic-bezier(.4,0,.2,1)}\n.hb-t-card.soft .bg,.hb-t-card.soft .hb-t-name,.hb-t-card.soft .hb-t-text,.hb-t-card.soft .hb-t-meta,.hb-t-card.soft .hb-t-quote,.hb-t-card.soft .hb-t-chip,.hb-t-card.soft .hb-t-label{transition:opacity .55s cubic-bezier(.4,0,.2,1)}\n@media (prefers-reduced-motion:reduce){.hb-t-card.swapping .bg,.hb-t-card.swapping .hb-t-name,.hb-t-card.swapping .hb-t-text,.hb-t-card.swapping .hb-t-meta,.hb-t-card.swapping .hb-t-quote,.hb-t-card.swapping .hb-t-chip,.hb-t-card.swapping .hb-t-label{transition:none}}\n.hb-t-card.skeleton .hb-t-media .bg,.hb-t-card.skeleton .hb-t-media .fallback{display:none}\n.hb-t-card.skeleton .hb-t-media{background:linear-gradient(100deg,#ece5d3 30%,#f4eee0 50%,#ece5d3 70%);background-size:200% 100%;animation:hbtsh 1.2s infinite}\n.hb-t-card.skeleton .hb-t-name,.hb-t-card.skeleton .hb-t-text,.hb-t-card.skeleton .hb-t-label{color:transparent;background:linear-gradient(100deg,#ece5d3 30%,#f4eee0 50%,#ece5d3 70%);background-size:200% 100%;animation:hbtsh 1.2s infinite;border-radius:6px}\n@keyframes hbtsh{0%{background-position:200% 0}100%{background-position:-200% 0}}\n.hb-t-div{height:1px;background:var(--line);margin:24px 2px 20px;position:relative}\n.hb-t-div span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--panel);padding:0 14px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}\n.hb-t-audhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}\n.hb-t-tabs{display:inline-flex;background:var(--inset);border:1px solid var(--line-2);border-radius:13px;padding:4px;gap:4px}\n.hb-t-tab{appearance:none;border:none;background:transparent;cursor:pointer;font-family:'Mulish',sans-serif;font-weight:700;font-size:14.5px;color:var(--ink-soft);padding:9px 18px;border-radius:10px;display:flex;align-items:center;gap:8px;transition:.16s}\n.hb-t-tab svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\n.hb-t-tab:focus-visible{outline:2px solid var(--gold);outline-offset:2px}\n.hb-t-tab.men.active{background:var(--men);color:#fff}\n.hb-t-tab.women.active{background:var(--women);color:#fff}\n.hb-t-tab:not(.active):hover{color:var(--ink)}\n.hb-t-refresh{display:flex;align-items:center;gap:12px}\n.hb-t-dots{display:inline-flex;gap:5px}\n.hb-t-dots i{width:7px;height:7px;border-radius:50%;background:var(--line);transition:.2s}\n.hb-t-dots.men-panel i.on{background:var(--men)}\n.hb-t-dots.women-panel i.on{background:var(--women)}\n.hb-t-another{appearance:none;border:1px solid var(--line);background:var(--panel);cursor:pointer;font-family:'Mulish',sans-serif;font-weight:700;font-size:12.5px;color:var(--ink-soft);padding:8px 14px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;transition:.16s;white-space:nowrap}\n.hb-t-another:hover{background:var(--ink);color:#fff;border-color:var(--ink)}\n.hb-t-another:hover svg{transform:rotate(180deg)}\n.hb-t-another:focus-visible{outline:2px solid var(--gold);outline-offset:2px}\n.hb-t-another svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:.3s}\n.hb-t-panel{display:none}\n.hb-t-panel.active{display:block}\n.hb-t-links{list-style:none;display:grid;gap:6px;margin:0;padding:0}\n.hb-t-links a{display:flex;align-items:center;gap:13px;padding:0 14px;height:56px;border-radius:12px;text-decoration:none;color:var(--ink);font-weight:600;font-size:14.5px;border:1px solid var(--line-2);background:var(--inset);transition:.14s}\n.hb-t-links a:hover{background:var(--panel);border-color:var(--line);box-shadow:var(--sh-sm);transform:translateY(-1px)}\n.hb-t-links a:focus-visible{outline:2px solid var(--gold);outline-offset:1px}\n.hb-t-links a .lico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--men-2);color:var(--men)}\n.hb-t-links a .lico svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}\n.women-panel .hb-t-links a .lico{background:var(--women-2);color:var(--women)}\n.hb-t-links a .ltext{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.hb-t-links a .larr{color:var(--gold-2);flex-shrink:0;opacity:0;transform:translateX(-4px);transition:.14s}\n.hb-t-links a .larr svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}\n.hb-t-links a:hover .larr{opacity:1;transform:none}\n.hb-t-links.swapping-list a{opacity:0;transform:translateY(6px);transition:opacity .16s,transform .16s}\n.hb-t-foot{margin-top:20px;padding-top:16px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}\n.hb-t-note{font-size:12.5px;color:var(--muted)}\n.hb-t-seo{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n@media screen and (max-width:991px){.hb-t-grid{grid-template-columns:1fr}.hb-t-title{font-size:26px}.hb-t-audhead{flex-direction:column;align-items:stretch}.hb-t-tabs{width:100%}.hb-t-tab{flex:1;justify-content:center}.hb-t-refresh{justify-content:space-between}}\n@media screen and (max-width:767px){.hb-t-links a{height:auto;min-height:56px;padding-top:11px;padding-bottom:11px;align-items:flex-start}.hb-t-links a .lico{margin-top:1px}.hb-t-links a .ltext{white-space:normal;overflow:visible;text-overflow:clip;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.hb-t-links a .larr{align-self:center}}\n@media screen and (max-width:479px){.hb-t-wrap{padding:20px}.hb-t-title{font-size:23px}.hb-t-section{padding:24px 14px 4px}}\n/* ===== INSIGHT CARD \u2014 3 rotating designs ===== */\n/* Design A: editorial pull-quote */\n.hb-t-media.des-a{background:linear-gradient(160deg,#fdfaf3 0%,#f5edda 100%)}\n.hb-t-media.des-a .da-mark{position:absolute;top:-26px;left:14px;font-family:'Fraunces',serif;font-size:150px;line-height:1;color:var(--gold-2);opacity:.16;font-weight:600}\n.hb-t-media.des-a .da-q{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:26px 26px 20px;text-align:center;z-index:2}\n.hb-t-media.des-a .da-q span{font-family:'Fraunces',serif;font-style:italic;font-weight:500;color:var(--ink);font-size:21px;line-height:1.28;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}\n.hb-t-media.des-a .da-cat{position:absolute;left:20px;bottom:14px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);z-index:2}\n/* Design B: colour-coded tint by type */\n.hb-t-media.des-b{background:linear-gradient(150deg,#edf4ee,#dfeee3)}\n.hb-t-media.des-b.t-disr{background:linear-gradient(150deg,#f8f0dd,#f0e2c4)}\n.hb-t-media.des-b.t-supp{background:linear-gradient(150deg,#eaf1f2,#dbe9ea)}\n.hb-t-media.des-b .db-ico{position:absolute;right:-18px;bottom:-18px;width:150px;height:150px;opacity:.13}\n.hb-t-media.des-b .db-ico svg{width:100%;height:100%;stroke:var(--g);fill:none;stroke-width:1.3}\n.hb-t-media.des-b.t-disr .db-ico svg{stroke:var(--gold-2)}\n.hb-t-media.des-b.t-supp .db-ico svg{stroke:#3a7a8a}\n.hb-t-media.des-b .db-q{position:absolute;inset:0;display:flex;align-items:flex-end;padding:22px;z-index:2}\n.hb-t-media.des-b .db-q span{font-family:'Fraunces',serif;font-weight:600;color:var(--ink);font-size:21px;line-height:1.22;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n.hb-t-media.des-b .db-cat{position:absolute;left:22px;top:20px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--g);z-index:2;font-weight:600}\n.hb-t-media.des-b.t-disr .db-cat{color:var(--gold-2)}\n.hb-t-media.des-b.t-supp .db-cat{color:#3a7a8a}\n/* Design C: botanical texture */\n.hb-t-media.des-c{background-color:#f3ede0;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Cg fill='none' stroke='%23a98a2e' stroke-width='1' opacity='0.18'%3E%3Cpath d='M20 70 Q30 40 20 15 M20 40 Q35 42 45 30 M20 50 Q8 52 2 40'/%3E%3Cpath d='M70 80 Q80 50 70 25 M70 50 Q85 52 90 40 M70 60 Q58 62 52 50'/%3E%3C/g%3E%3C/svg%3E\")}\n.hb-t-media.des-c .dc-panel{position:absolute;inset:16px;background:rgba(255,253,248,.86);border:1px solid var(--line-2);border-radius:10px;display:flex;align-items:center;justify-content:center;padding:22px;text-align:center;z-index:2}\n.hb-t-media.des-c .dc-panel span{font-family:'Fraunces',serif;font-style:italic;font-weight:500;color:var(--ink);font-size:20px;line-height:1.28;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}\n.hb-t-media.des-c .dc-cat{position:absolute;left:26px;top:26px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);z-index:3}\n";
  var HB_SPRITE="<svg style=\"display:none\" aria-hidden=\"true\"><defs>\n<symbol id=\"ic-plate\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></symbol>\n<symbol id=\"ic-bulb\" viewBox=\"0 0 24 24\"><path d=\"M9 18h6\"/><path d=\"M10 21h4\"/><path d=\"M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2.5h6c0-1.3.5-2 1-2.5A6 6 0 0 0 12 3Z\"/></symbol>\n<symbol id=\"ic-shuffle\" viewBox=\"0 0 24 24\"><path d=\"M16 3h5v5\"/><path d=\"M4 20 21 3\"/><path d=\"M21 16v5h-5\"/><path d=\"m15 15 6 6\"/><path d=\"M4 4l5 5\"/></symbol>\n<symbol id=\"ic-arrow\" viewBox=\"0 0 24 24\"><path d=\"M5 12h14\"/><path d=\"m13 6 6 6-6 6\"/></symbol>\n<symbol id=\"ic-male\" viewBox=\"0 0 24 24\"><circle cx=\"10\" cy=\"14\" r=\"6\"/><path d=\"M15 9l5-5\"/><path d=\"M16 4h4v4\"/></symbol>\n<symbol id=\"ic-female\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"M12 15v7\"/><path d=\"M9 19h6\"/></symbol>\n<symbol id=\"ic-image\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/><path d=\"m21 16-5-5L5 20\"/></symbol>\n<symbol id=\"ic-droplet\" viewBox=\"0 0 24 24\"><path d=\"M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z\"/></symbol>\n<symbol id=\"ic-moon\" viewBox=\"0 0 24 24\"><path d=\"M21 12.8A8 8 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z\"/></symbol>\n<symbol id=\"ic-leaf\" viewBox=\"0 0 24 24\"><path d=\"M4 20s2-9 8-13c5-3 8-2 8-2s1 3-2 8c-4 6-13 8-13 8Z\"/><path d=\"M8 16c2-4 6-6 6-6\"/></symbol>\n<symbol id=\"ic-heart\" viewBox=\"0 0 24 24\"><path d=\"M12 20s-7-4.4-9-8.5C1.5 8 3.5 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3c3 0 5 3 3.5 6.5C19 15.6 12 20 12 20Z\"/></symbol>\n<symbol id=\"ic-pill\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"8\" width=\"18\" height=\"8\" rx=\"4\"/><path d=\"M12 8v8\"/></symbol>\n<symbol id=\"ic-flame\" viewBox=\"0 0 24 24\"><path d=\"M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5.5-2.5S9 11 9 9c0-2 3-6 3-6Z\"/></symbol>\n<symbol id=\"ic-pulse\" viewBox=\"0 0 24 24\"><path d=\"M3 12h4l2-6 4 12 2-6h6\"/></symbol>\n<symbol id=\"ic-scale\" viewBox=\"0 0 24 24\"><path d=\"M12 4v16\"/><path d=\"M6 8h12\"/><path d=\"M6 8 3 15h6L6 8Z\"/><path d=\"M18 8l-3 7h6l-3-7Z\"/></symbol>\n<symbol id=\"ic-spark\" viewBox=\"0 0 24 24\"><path d=\"M12 3v4\"/><path d=\"M12 17v4\"/><path d=\"M3 12h4\"/><path d=\"M17 12h4\"/><path d=\"m6 6 2.5 2.5\"/><path d=\"m15.5 15.5 2.5 2.5\"/><path d=\"m18 6-2.5 2.5\"/><path d=\"m8.5 15.5-2.5 2.5\"/></symbol>\n</defs></svg>";
  var HB_STRUCT="<div class=\"hb-t-section\" data-hb-today>\n  <div class=\"hb-t-wrap\">\n    <div class=\"hb-t-head\">\n      <div>\n        <div class=\"hb-t-kick\"><span class=\"hb-t-live\"></span> Fresh every day</div>\n        <div class=\"hb-t-title\">Today at The&nbsp;Hormone&nbsp;Blueprint</div>\n      </div>\n      <div class=\"hb-t-date\" data-datechip></div>\n    </div>\n    <div class=\"hb-t-grid\">\n      <div class=\"hb-t-card skeleton\" data-kind=\"food\">\n        <div class=\"hb-t-top\"><span class=\"hb-t-ckick\"><svg><use href=\"#ic-plate\"></use></svg> Today's food</span><button class=\"hb-t-shuf\" aria-label=\"Show another food\" data-shuffle=\"food\"><svg><use href=\"#ic-shuffle\"></use></svg></button></div>\n        <div class=\"hb-t-media\"><div class=\"bg\"></div><div class=\"fallback\"><svg><use href=\"#ic-image\"></use></svg></div><div class=\"hb-t-chip\"></div></div>\n        <div class=\"hb-t-body\"><div class=\"hb-t-name\">Loading</div><div class=\"hb-t-text\">Loading today's food\u2026</div><div class=\"hb-t-meta\"></div><a class=\"hb-t-cta\" href=\"/foods\">Read the full profile <svg><use href=\"#ic-arrow\"></use></svg></a></div>\n        <a class=\"hb-t-cardlink\" href=\"/foods\" tabindex=\"-1\" aria-hidden=\"true\"></a>\n      </div>\n      <div class=\"hb-t-card skeleton\" data-kind=\"insight\">\n        <div class=\"hb-t-top\"><span class=\"hb-t-ckick\"><svg><use href=\"#ic-bulb\"></use></svg> Today's insight</span><button class=\"hb-t-shuf\" aria-label=\"Show another insight\" data-shuffle=\"insight\"><svg><use href=\"#ic-shuffle\"></use></svg></button></div>\n        <div class=\"hb-t-media des-a\"></div>\n        <div class=\"hb-t-body\"><div class=\"hb-t-label\">Loading</div><div class=\"hb-t-text\">Loading today's insight\u2026</div><a class=\"hb-t-cta\" href=\"/ask\">Read more <svg><use href=\"#ic-arrow\"></use></svg></a></div>\n        <a class=\"hb-t-cardlink\" href=\"/ask\" tabindex=\"-1\" aria-hidden=\"true\"></a>\n      </div>\n    </div>\n    <div class=\"hb-t-div\"><span>For you</span></div>\n    <div class=\"hb-t-audhead\">\n      <div class=\"hb-t-tabs\" role=\"tablist\">\n        <button class=\"hb-t-tab men active\" role=\"tab\" aria-selected=\"true\" data-aud=\"men\"><svg><use href=\"#ic-male\"></use></svg> For Men</button>\n        <button class=\"hb-t-tab women\" role=\"tab\" aria-selected=\"false\" data-aud=\"women\"><svg><use href=\"#ic-female\"></use></svg> For Women</button>\n      </div>\n      <div class=\"hb-t-refresh\">\n        <span class=\"hb-t-dots men-panel\" data-dots=\"active\"></span>\n        <button class=\"hb-t-another\" data-another=\"active\"><svg><use href=\"#ic-shuffle\"></use></svg> Show me another</button>\n      </div>\n    </div>\n    <div class=\"hb-t-panel men-panel active\" data-panel=\"men\"><ul class=\"hb-t-links\" data-list=\"men\"></ul></div>\n    <div class=\"hb-t-panel women-panel\" data-panel=\"women\"><ul class=\"hb-t-links\" data-list=\"women\"></ul></div>\n    <div class=\"hb-t-foot\"><span class=\"hb-t-note\" data-daynote>Updated daily</span></div>\n    <div class=\"hb-t-seo\" aria-live=\"polite\" data-live></div>\n  </div>\n</div>\n";
  function buildSEO(){
    var DATA=window.HB_WIDGET_DATA||{};
    function e(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    var all=[].concat(DATA.men||[],DATA.women||[],DATA.insight||[]);
    var seen={},parts=[],i;
    for(i=0;i<all.length;i++){ var u=all[i].u; if(!u||seen[u])continue; seen[u]=1; parts.push('<a href="'+e(u)+'">'+e(all[i].t)+'</a>'); }
    var foods=DATA.foods||[];
    for(i=0;i<foods.length;i++){ var fu='/foods/'+foods[i].s; if(seen[fu])continue; seen[fu]=1; parts.push('<a href="'+e(fu)+'">'+e(foods[i].n)+'</a>'); }
    return '<nav class="hb-t-seo" aria-hidden="true">'+parts.join('')+'</nav>';
  }
  function boot(){
    var mounts=D.querySelectorAll('[data-hb-today-mount]');
    if(!mounts.length) return;
    if(!D.getElementById('hb-today-css')){ var s=D.createElement('style'); s.id='hb-today-css'; s.textContent=HB_CSS; (D.head||D.documentElement).appendChild(s); }
    if(!D.getElementById('hb-today-sprite')){ var wrap=D.createElement('div'); wrap.id='hb-today-sprite'; wrap.style.cssText='position:absolute;width:0;height:0;overflow:hidden'; wrap.setAttribute('aria-hidden','true'); wrap.innerHTML=HB_SPRITE; (D.body||D.documentElement).appendChild(wrap); }
    [].forEach.call(mounts,function(m){
      if(m.getAttribute('data-hb-built')==='1') return;
      m.setAttribute('data-hb-built','1');
      m.innerHTML=HB_STRUCT+buildSEO();
      var root=m.querySelector('[data-hb-today]');
      try{ wire(root); }catch(e){ if(root) root.style.display='none'; }
    });
  }
  if(D.readyState!=='loading') boot(); else D.addEventListener('DOMContentLoaded',boot);
})();