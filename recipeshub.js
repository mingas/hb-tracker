(function(){
"use strict";
if(window.__rxHub) return;
window.__rxHub = true;

/* ---------------------------------------------------------------
   Recipes are read from the hidden CMS-bound block(s) on the page,
   not from a hardcoded list. Adding a recipe is a CMS-only job.

   Webflow caps a Collection List at 100 items, so this reads EVERY
   [data-rx-list] block on the page. When the catalogue passes 100,
   a second list with offset 100 is added in Webflow and this script
   needs no change at all.
--------------------------------------------------------------- */
function readRecipes(){
  var out = [], seen = {};
  var blocks = document.querySelectorAll("[data-rx-list], #rx-data");
  Array.prototype.forEach.call(blocks, function(block){
    Array.prototype.forEach.call(block.querySelectorAll("[data-f='slug']"), function(slugEl){
      var rec = slugEl.parentNode;
      if(!rec) return;
      function v(k){
        var el = rec.querySelector("[data-f='" + k + "']");
        return el ? (el.textContent || "").trim() : "";
      }
      var slug = v("slug");
      if(!slug || seen[slug]) return;          // a recipe can only appear once
      seen[slug] = true;

      var img = rec.querySelector("[data-f='photo']");
      var goals = [];
      Array.prototype.forEach.call(rec.querySelectorAll("[data-g]"), function(g){
        var name = g.getAttribute("data-g");
        if(name) goals.push(name);
      });

      var mins = parseInt((v("time") || "").replace(/[^0-9]/g, ""), 10);

      out.push({
        s: slug,
        n: v("name"),
        i: v("intro"),
        m: v("meal"),
        t: isNaN(mins) ? 0 : mins,
        g: goals,
        p: img ? (img.getAttribute("src") || "") : "",
        a: img ? (img.getAttribute("alt") || v("name")) : v("name"),
        ing: v("tags").split(",").map(function(x){ return x.trim().toLowerCase(); }).filter(Boolean)
      });
    });
  });
  /* Webflow renders oldest first; the reader should meet the newest first. */
  return out.reverse();
}

var R = readRecipes();

var GOALS = [["all","All"],["testosterone","Testosterone"],["menopause","Menopause"],
             ["insulin","Blood sugar"],["sleep","Sleep"]];
var MEALS = [["all","All meals"],["Breakfast","Breakfast"],["Lunch","Lunch"],
             ["Dinner","Dinner"],["Snack","Snack"]];
var TIMES = [["all","Any time"],["15","Under 15 min"],["30","Under 30 min"]];

var state = { goal:"all", meal:"all", time:"all" };
var have = [], VOCAB = {}, TAGS = [], COMMON = [];
var acIdx = -1, acList = [];

R.forEach(function(r){ r.ing.forEach(function(t){ VOCAB[t] = (VOCAB[t]||0)+1; }); });
TAGS = Object.keys(VOCAB).sort();
COMMON = TAGS.slice().sort(function(a,b){
  return VOCAB[b]-VOCAB[a] || a.localeCompare(b); }).slice(0,5);

function esc(s){
  return String(s).replace(/[&<>"]/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; });
}

/* ------------------------------ CSS ------------------------------ */
function css(){
  if(document.getElementById("rh-css")) return;
  var s = document.createElement("style"); s.id = "rh-css";
  s.textContent =
  /* hero becomes two columns; heading keeps column one, finder takes column two */
  /* The hero was a narrow centred column. Adding a second column to it without
     releasing that width squeezed the heading to a ribbon, so the width cap and
     the centring are both overridden here — but only where two columns exist. */
  "@media screen and (min-width:961px){"+
    ".rh-head{max-width:none!important;width:100%;display:grid;"+
      "grid-template-columns:minmax(0,1fr) 420px;grid-template-rows:auto 1fr;"+
      "gap:10px 48px;align-items:start;text-align:left}"+
    ".rh-head>.rh-h1{grid-column:1;grid-row:1;margin:0;max-width:none;text-align:left}"+
    ".rh-head>.rh-sub{grid-column:1;grid-row:2;margin:0;max-width:58ch;text-align:left}"+
    ".rh-head>#rx-finder{grid-column:2;grid-row:1/span 2;align-self:center}"+
  "}"+
  /* .rh-head is text-align:center on this site, so the panel must reclaim the
     left edge for itself — otherwise the title, the note and the text typed
     into the input all sit centred on phones. */
  "#rx-finder,.rx{text-align:left}"+
  ".rx{position:relative;background:linear-gradient(160deg,#16304F 0%,#12294A 62%,#0E2039 100%);"+
    "border:1px solid #1E3A5C;border-radius:16px;padding:17px 17px 15px;"+
    "box-shadow:0 10px 28px rgba(18,41,74,.18);animation:rxIn .5s ease both}"+
  "@keyframes rxIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}"+
  ".rx::after{content:'';position:absolute;inset:-3px;border-radius:19px;pointer-events:none;"+
    "box-shadow:0 0 0 0 rgba(192,154,78,.55);animation:rxRing 2.2s ease-out .45s 2}"+
  "@keyframes rxRing{0%{box-shadow:0 0 0 0 rgba(192,154,78,.5)}"+
    "70%{box-shadow:0 0 0 12px rgba(192,154,78,0)}100%{box-shadow:0 0 0 0 rgba(192,154,78,0)}}"+
  "@media (prefers-reduced-motion:reduce){.rx,.rx::after{animation:none}}"+
  ".rx-h{display:flex;align-items:center;gap:9px;margin:0 0 11px}"+
  ".rx-t{font-family:Fraunces,Georgia,serif;font-size:19px;font-weight:600;color:#fff;margin:0;flex:1}"+
  ".rx-new{font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;"+
    "background:#C09A4E;color:#12294A;padding:3px 8px;border-radius:999px}"+
  ".rx-x{border:none;background:transparent;font:inherit;font-size:13px;font-weight:600;"+
    "color:#A9BBD1;cursor:pointer;padding:2px 4px;text-decoration:underline}"+
  ".rx-x:hover{color:#fff}"+
  ".rx-field{position:relative}"+
  ".rx-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;border:1px solid transparent;"+
    "border-radius:11px;padding:7px 9px;background:#fff;min-height:46px}"+
  ".rx-chips:focus-within{box-shadow:0 0 0 3px rgba(192,154,78,.45)}"+
  ".rx-chip{display:inline-flex;align-items:center;gap:5px;background:#12294A;color:#fff;"+
    "font-size:13px;font-weight:600;padding:5px 7px 5px 11px;border-radius:999px}"+
  ".rx-chip button{border:none;background:transparent;color:#fff;cursor:pointer;font-size:14px;"+
    "line-height:1;padding:1px 3px;border-radius:50%;opacity:.7}"+
  ".rx-chip button:hover{opacity:1;background:rgba(255,255,255,.2)}"+
  "#rx-q{flex:1;min-width:130px;border:none;background:transparent;font:inherit;font-size:15px;"+
    "padding:7px 3px;outline:none;color:#2b3440}"+
  "#rx-q::placeholder{color:#a3aab2}"+
  ".rx-ac{position:absolute;left:0;right:0;top:calc(100% + 5px);background:#fff;"+
    "border:1px solid #E7E1D4;border-radius:11px;box-shadow:0 12px 32px rgba(18,41,74,.15);"+
    "max-height:260px;overflow-y:auto;z-index:50;padding:4px}"+
  ".rx-ac[hidden]{display:none}"+
  ".rx-ac-i{display:flex;justify-content:space-between;align-items:center;gap:10px;"+
    "padding:9px 11px;border-radius:8px;cursor:pointer;font-size:14.5px;color:#2b3440}"+
  '.rx-ac-i[aria-selected="true"]{background:#F4EDE1}'+
  ".rx-ac-i b{font-weight:700;color:#12294A}"+
  ".rx-ac-n{font-size:12px;color:#8A8270;font-weight:600;white-space:nowrap}"+
  ".rx-ac-none{padding:11px;font-size:14px;color:#8A8270}"+
  ".rx-sugs{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0;align-items:center}"+
  ".rx-sugs b{font-size:12.5px;color:#A9BBD1;font-weight:600}"+
  ".rx-sug{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);color:#E6EDF5;"+
    "font:inherit;font-size:13px;font-weight:600;padding:5px 11px;border-radius:999px;cursor:pointer;transition:.15s}"+
  ".rx-sug:hover{background:#C09A4E;border-color:#C09A4E;color:#12294A}"+
  ".rx-note{font-size:12.5px;line-height:1.5;color:#93A8C2;margin:11px 0 0}"+
  ".rx-open{display:none;width:100%;border:1px solid #1E3A5C;"+
    "background:linear-gradient(160deg,#16304F 0%,#12294A 70%,#0E2039 100%);color:#fff;"+
    "font:inherit;padding:14px 46px 14px 15px;border-radius:12px;cursor:pointer;position:relative;"+
    "text-align:left;box-shadow:0 6px 18px rgba(18,41,74,.16)}"+
  ".rx-open-t{display:block;font-size:15.5px;font-weight:600;line-height:1.3}"+
  ".rx-open-s{display:block;font-size:13px;font-weight:500;color:#A9BBD1;margin:3px 0 0;line-height:1.4}"+
  ".rx-open-c{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:26px;height:26px;"+
    "border-radius:50%;background:#C09A4E;color:#12294A;font-size:18px;font-weight:700;line-height:26px;"+
    "text-align:center}"+
  /* the existing filter row, unchanged */
  ".rh-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px}"+
  ".rh-seg{display:inline-flex;background:#F4EDE1;border-radius:12px;padding:4px;gap:2px}"+
  ".rh-chip{border:none;background:transparent;color:#6B6455;font:inherit;font-size:14.5px;"+
    "font-weight:600;padding:9px 16px;border-radius:9px;cursor:pointer;"+
    "transition:background .15s,color .15s,box-shadow .15s;white-space:nowrap}"+
  ".rh-chip:hover{color:#12294A}"+
  '.rh-chip[aria-pressed="true"]{background:#fff;color:#12294A;box-shadow:0 1px 3px rgba(18,41,74,.10)}'+
  ".rh-chip:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  ".rh-sel{border:1px solid #E7E1D4;background:#fff;color:#2b3440;font:inherit;font-size:14.5px;"+
    "font-weight:600;padding:11px 14px;border-radius:12px;cursor:pointer}"+
  ".rh-sel:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  ".rh-card{background:#fff;border:1px solid #E7E1D4;border-radius:14px;overflow:hidden;"+
    "display:flex;flex-direction:column;text-decoration:none;color:inherit}"+
  ".rh-card:hover{border-color:#C09A4E}"+
  ".rh-card:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  ".rh-card.rx-ready{border-color:#3F7D58;box-shadow:0 0 0 1px #3F7D58}"+
  ".rh-img{width:100%;height:190px;object-fit:cover;display:block;background:#F2E7CE}"+
  ".rh-body{padding:15px 16px 17px;flex:1;display:flex;flex-direction:column}"+
  ".rh-meta{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 9px}"+
  ".rh-tag{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#F2E7CE;color:#7A6430}"+
  ".rh-tag.tm{background:#EDF1F5;color:#41556E}"+
  ".rh-tag.ok{background:#E5F0E8;color:#2E6642}"+
  ".rh-t{font-family:Fraunces,Georgia,serif;font-size:19px;line-height:1.25;font-weight:600;"+
    "color:#12294A;margin:0 0 7px}"+
  ".rh-i{font-size:14.5px;line-height:1.55;color:#6B7280;margin:0}"+
  ".rx-bar{height:6px;border-radius:999px;background:#EFE9DC;overflow:hidden;margin:2px 0 9px}"+
  ".rx-bar i{display:block;height:100%;background:#C09A4E;border-radius:999px;transition:width .2s}"+
  ".rh-card.rx-ready .rx-bar i{background:#3F7D58}"+
  ".rx-have{font-size:13.5px;font-weight:600;color:#41556E;margin:0 0 7px}"+
  ".rh-card.rx-ready .rx-have{color:#2E6642}"+
  ".rx-miss{font-size:13.5px;line-height:1.55;color:#6B7280;margin:0}"+
  ".rx-miss b{color:#41556E;font-weight:600}"+
  "#rh-count .rx-ok{color:#2E6642}"+
  "#rh-count .rx-out{color:#8A8270;font-weight:400}"+
  "@media screen and (max-width:960px){"+
    ".rx{display:none;padding:14px;margin:14px 0 0}.rx.rx-show{display:block}"+
    ".rx-open{display:block;margin:14px 0 0}.rx-open.rx-hide{display:none}"+
    /* iOS zooms the whole page in when a focused input is under 16px */
    "#rx-q{font-size:16px}"+
    ".rx-ac{max-height:min(50vh,300px)}"+
  "}"+
  "@media screen and (max-width:767px){"+
    ".rh-bar{gap:8px}.rh-seg{width:100%;overflow-x:auto}"+
    ".rh-chip{flex:1;padding:9px 11px;font-size:13.5px}"+
    ".rh-sel{flex:1;min-width:0;font-size:14px;padding:10px 11px}"+
  "}";
  document.head.appendChild(s);
}

/* --------------------------- the finder --------------------------- */
var q, ac, chips, finder;

function buildFinder(){
  var mount = document.getElementById("rx-finder");
  if(!mount || !TAGS.length) return;

  var open = document.createElement("button");
  open.type = "button"; open.className = "rx-open"; open.id = "rx-open";
  /* two stacked lines, not one wrapping sentence — at 390px the old single
     line broke after the emoji and read as two half-sentences */
  open.innerHTML = '<span class="rx-open-t">🍳 What\'s in your kitchen?</span>' +
    '<span class="rx-open-s">Find recipes you can almost make</span>' +
    '<span class="rx-open-c" aria-hidden="true">+</span>';

  finder = document.createElement("div");
  finder.className = "rx";
  finder.innerHTML =
    '<div class="rx-h"><p class="rx-t">What\'s in your kitchen?</p>' +
    '<span class="rx-new">New</span>' +
    '<button class="rx-x" id="rx-clear" type="button" hidden>Clear</button></div>' +
    '<div class="rx-field"><div class="rx-chips" id="rx-chips">' +
    '<input id="rx-q" type="text" autocomplete="off" spellcheck="false" ' +
    'placeholder="eggs, avocado, oats…" role="combobox" aria-expanded="false" ' +
    'aria-controls="rx-ac" aria-autocomplete="list" aria-label="Ingredients you have">' +
    '</div><div class="rx-ac" id="rx-ac" role="listbox" hidden></div></div>' +
    '<div class="rx-sugs" id="rx-sugs"></div>' +
    '<p class="rx-note">Nothing gets hidden. Recipes reorder by how close you are, ' +
    'and each card shows what you still need.</p>';

  mount.appendChild(open);
  mount.appendChild(finder);

  q = document.getElementById("rx-q");
  ac = document.getElementById("rx-ac");
  chips = document.getElementById("rx-chips");

  open.addEventListener("click", function(){
    finder.classList.add("rx-show"); open.classList.add("rx-hide"); q.focus();
  });
  document.getElementById("rx-clear").addEventListener("click", function(){
    have = []; render(); q.focus();
  });
  q.addEventListener("input", openAc);
  q.addEventListener("focus", openAc);
  q.addEventListener("keydown", onKey);
  ac.addEventListener("mousedown", function(e){
    var it = e.target.closest(".rx-ac-i");
    if(it){ e.preventDefault(); add(it.getAttribute("data-t")); }
  });
  chips.addEventListener("click", function(e){
    var b = e.target.closest(".rx-chip button");
    if(b) del(b.getAttribute("data-t"));
    else if(e.target === chips) q.focus();
  });
  document.getElementById("rx-sugs").addEventListener("click", function(e){
    var b = e.target.closest(".rx-sug");
    if(b) add(b.getAttribute("data-t"));
  });
  document.addEventListener("click", function(e){
    if(finder && !finder.contains(e.target)) closeAc();
  });
  typePlaceholder();
}

function openAc(){
  if(!ac) return;
  var v = q.value.trim().toLowerCase();
  acList = TAGS.filter(function(t){
    return have.indexOf(t) === -1 && (!v || t.indexOf(v) > -1); });
  /* prefix matches first: typing "on" should surface onion before spring onions */
  if(v) acList.sort(function(a,b){
    var pa = a.indexOf(v) === 0, pb = b.indexOf(v) === 0;
    return pa === pb ? VOCAB[b]-VOCAB[a] : (pa ? -1 : 1); });
  acList = acList.slice(0,40);
  if(!acList.length){
    ac.innerHTML = '<div class="rx-ac-none">Nothing in our recipes matches that yet.</div>';
    ac.hidden = false; q.setAttribute("aria-expanded","true"); acIdx = -1; return;
  }
  acIdx = 0;
  ac.innerHTML = acList.map(function(t,i){
    var lbl = esc(t);
    if(v){ var p = t.indexOf(v);
      lbl = esc(t.slice(0,p)) + "<b>" + esc(t.slice(p,p+v.length)) + "</b>" + esc(t.slice(p+v.length)); }
    return '<div class="rx-ac-i" role="option" data-t="' + esc(t) + '" aria-selected="' + (i===0) + '">' +
      "<span>" + lbl + '</span><span class="rx-ac-n">' + VOCAB[t] + "</span></div>";
  }).join("");
  ac.hidden = false; q.setAttribute("aria-expanded","true");
}
function closeAc(){ if(ac){ ac.hidden = true; q.setAttribute("aria-expanded","false"); acIdx = -1; } }
function markAc(){
  Array.prototype.forEach.call(ac.children, function(el,i){
    el.setAttribute("aria-selected", i === acIdx);
    if(i === acIdx && el.scrollIntoView) el.scrollIntoView({block:"nearest"});
  });
}
function onKey(e){
  if(e.key === "ArrowDown"){ e.preventDefault();
    if(ac.hidden) openAc(); else { acIdx = Math.min(acIdx+1, acList.length-1); markAc(); } }
  else if(e.key === "ArrowUp"){ e.preventDefault(); acIdx = Math.max(acIdx-1, 0); markAc(); }
  else if(e.key === "Enter"){ e.preventDefault(); if(!ac.hidden && acList[acIdx]) add(acList[acIdx]); }
  else if(e.key === "Escape"){ closeAc(); }
  else if(e.key === "Backspace" && !q.value && have.length){ del(have[have.length-1]); }
}
function add(t){ if(!t || have.indexOf(t) > -1) return; have.push(t); q.value = ""; closeAc(); render(); }
function del(t){ have = have.filter(function(x){ return x !== t; }); render(); }

function typePlaceholder(){
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var words = ["eggs…","avocado…","greek yogurt…","oats…","tomatoes…"];
  var w = 0, c = 0, del2 = false;
  function tick(){
    if(have.length || document.activeElement === q) return;
    var word = words[w];
    c += del2 ? -1 : 1;
    q.placeholder = word.slice(0,c);
    if(!del2 && c === word.length){ del2 = true; setTimeout(tick,1100); return; }
    if(del2 && c === 0){ del2 = false; w = (w+1) % words.length; }
    setTimeout(tick, del2 ? 38 : 95);
  }
  q.addEventListener("focus", function(){ q.placeholder = "eggs, avocado, oats…"; });
  setTimeout(tick, 900);
}

/* ------------------------ the existing filter ------------------------ */
function seg(){
  var c = document.createElement("div");
  c.className = "rh-seg"; c.setAttribute("data-g","goal");
  GOALS.forEach(function(o){
    var b = document.createElement("button");
    b.type = "button"; b.className = "rh-chip"; b.setAttribute("data-v", o[0]);
    b.setAttribute("aria-pressed", state.goal === o[0] ? "true" : "false");
    b.textContent = o[1];
    c.appendChild(b);
  });
  return c;
}
function sel(group, opts, label){
  var s = document.createElement("select");
  s.className = "rh-sel"; s.setAttribute("data-g", group); s.setAttribute("aria-label", label);
  opts.forEach(function(o){
    var op = document.createElement("option");
    op.value = o[0]; op.textContent = o[1];
    if(state[group] === o[0]) op.selected = true;
    s.appendChild(op);
  });
  return s;
}

/* --------------------------- ItemList schema --------------------------- */
function schema(){
  if(document.getElementById("rh-itemlist") || !R.length) return;
  var origin = location.origin;
  var data = { "@context":"https://schema.org", "@type":"ItemList",
    "name":"Hormone-health recipes", "numberOfItems": R.length,
    "itemListElement": R.map(function(r,i){
      return { "@type":"ListItem", "position": i+1,
               "url": origin + "/recipes/" + r.s, "name": r.n }; }) };
  var el = document.createElement("script");
  el.type = "application/ld+json"; el.id = "rh-itemlist";
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

/* ------------------------------ render ------------------------------ */
function card(r, m){
  var a = document.createElement("a");
  a.className = "rh-card" + (m && !m.missing.length ? " rx-ready" : "");
  a.href = "/recipes/" + r.s;
  var im = document.createElement("img");
  im.className = "rh-img"; im.src = r.p; im.alt = r.a;
  a.appendChild(im);

  var b = document.createElement("div"); b.className = "rh-body";
  var mt = document.createElement("div"); mt.className = "rh-meta";
  var t1 = document.createElement("span"); t1.className = "rh-tag"; t1.textContent = r.m;
  var t2 = document.createElement("span"); t2.className = "rh-tag tm"; t2.textContent = r.t + " min";
  mt.appendChild(t1); mt.appendChild(t2);
  if(m && !m.missing.length){
    var t3 = document.createElement("span"); t3.className = "rh-tag ok";
    t3.textContent = "Ready to cook"; mt.appendChild(t3);
  }
  var h = document.createElement("h2"); h.className = "rh-t"; h.textContent = r.n;
  b.appendChild(mt); b.appendChild(h);

  if(m){
    var pc = m.total ? Math.round(m.have / m.total * 100) : 0;
    var bar = document.createElement("div"); bar.className = "rx-bar";
    var fill = document.createElement("i"); fill.style.width = pc + "%";
    bar.appendChild(fill);
    var hv = document.createElement("p"); hv.className = "rx-have";
    hv.textContent = "You have " + m.have + " of " + m.total + " ingredients";
    var ms = document.createElement("p"); ms.className = "rx-miss";
    ms.innerHTML = m.missing.length
      ? "You still need <b>" + m.missing.slice(0,3).map(esc).join(", ") + "</b>" +
        (m.missing.length > 3 ? " and " + (m.missing.length-3) + " more" : "")
      : "Everything is in your kitchen.";
    b.appendChild(bar); b.appendChild(hv); b.appendChild(ms);
  } else {
    var p = document.createElement("p"); p.className = "rh-i"; p.textContent = r.i;
    b.appendChild(p);
  }
  a.appendChild(b);
  return a;
}

function render(){
  var grid  = document.getElementById("rh-grid");
  var count = document.getElementById("rh-count");
  var empty = document.getElementById("rh-empty");
  if(!grid) return;

  /* finder chrome */
  if(chips){
    Array.prototype.slice.call(chips.querySelectorAll(".rx-chip")).forEach(function(c){ c.remove(); });
    have.forEach(function(t){
      var c = document.createElement("span"); c.className = "rx-chip";
      c.innerHTML = esc(t) + '<button type="button" data-t="' + esc(t) +
        '" aria-label="Remove ' + esc(t) + '">&times;</button>';
      chips.insertBefore(c, q);
    });
    q.placeholder = have.length ? "Add another…" : q.placeholder;
    document.getElementById("rx-clear").hidden = !have.length;
    document.getElementById("rx-sugs").innerHTML = have.length ? "" :
      "<b>Try:</b>" + COMMON.filter(function(t){ return have.indexOf(t) === -1; })
        .map(function(t){ return '<button class="rx-sug" type="button" data-t="' +
          esc(t) + '">' + esc(t) + "</button>"; }).join("");
  }

  /* the existing filter REMOVES */
  var out = R.filter(function(r){
    return (state.goal === "all" || r.g.indexOf(state.goal) > -1) &&
           (state.meal === "all" || r.m === state.meal) &&
           (state.time === "all" || (r.t && r.t <= Number(state.time)));
  });

  grid.innerHTML = "";

  if(!out.length){
    count.textContent = "Nothing matches those filters.";
    if(empty) empty.style.display = "";
    return;
  }
  if(empty) empty.style.display = "none";

  /* the finder RANKS what survived; it never removes anything */
  if(!have.length){
    var all = state.goal === "all" && state.meal === "all" && state.time === "all";
    count.innerHTML = all
      ? "Showing all <b>" + out.length + "</b> recipes" +
        (TAGS.length ? ' <span class="rx-out">\u00b7 add what you have, above, to sort by what you can cook</span>' : "")
      : "Showing <b>" + out.length + "</b> of " + R.length + " recipes";
    out.forEach(function(r, i){
      var a = card(r, null);
      var im = a.querySelector("img");
      im.setAttribute("loading", i < 3 ? "eager" : "lazy");
      if(i === 0) im.setAttribute("fetchpriority","high");
      grid.appendChild(a);
    });
    return;
  }

  var sc = out.map(function(r){
    var n = 0;
    for(var i = 0; i < have.length; i++) if(r.ing.indexOf(have[i]) > -1) n++;   // exact, never substring
    return { r:r, have:n, total:r.ing.length,
             missing: r.ing.filter(function(t){ return have.indexOf(t) === -1; }) };
  }).sort(function(a,b){
    /* anything matching nothing drops to the bottom whatever its length */
    var ma = a.have > 0 ? 0 : 1, mb = b.have > 0 ? 0 : 1;
    if(ma !== mb) return ma - mb;
    /* then fewest things left to buy — the barrier is the shopping */
    if(a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
    return (b.have/(b.total||1)) - (a.have/(a.total||1));
  });

  var ready = sc.filter(function(o){ return !o.missing.length; }).length;
  var near  = sc.filter(function(o){ return o.have > 0; }).length;

  /* A recipe you could cook right now may sit outside the filters, and you
     would never learn it existed. Say so rather than hiding it silently. */
  var hiddenReady = R.filter(function(r){
    if(out.indexOf(r) > -1 || !r.ing.length) return false;
    return r.ing.every(function(t){ return have.indexOf(t) > -1; });
  }).length;

  var lead = [];
  if(state.goal !== "all") lead.push(GOALS.filter(function(g){ return g[0] === state.goal; })[0][1]);
  if(state.meal !== "all") lead.push(state.meal);
  if(state.time !== "all") lead.push("under " + state.time + " min");

  count.innerHTML =
    (lead.length ? "<b>" + lead.join(" · ") + "</b> — " : "") +
    (ready ? '<b class="rx-ok">' + ready + "</b> ready to cook, " : "") +
    near + " using what you have, sorted by how close you are" +
    (hiddenReady ? ' <span class="rx-out">' + hiddenReady +
      " more you could cook right now sits outside these filters</span>" : "");

  sc.forEach(function(o, i){
    var a = card(o.r, o);
    var im = a.querySelector("img");
    im.setAttribute("loading", i < 3 ? "eager" : "lazy");
    if(i === 0) im.setAttribute("fetchpriority","high");
    grid.appendChild(a);
  });
}

/* ------------------------------ init ------------------------------ */
function init(){
  var f = document.getElementById("rh-filters");
  if(!f || !R.length) return;
  css();
  schema();

  f.innerHTML = "";
  var bar = document.createElement("div"); bar.className = "rh-bar";
  bar.appendChild(seg());
  bar.appendChild(sel("meal", MEALS, "Filter by meal"));
  bar.appendChild(sel("time", TIMES, "Filter by time"));
  f.appendChild(bar);

  f.addEventListener("click", function(e){
    var b = e.target.closest(".rh-chip"); if(!b) return;
    Array.prototype.forEach.call(b.parentNode.querySelectorAll(".rh-chip"), function(c){
      c.setAttribute("aria-pressed","false"); });
    b.setAttribute("aria-pressed","true");
    state.goal = b.getAttribute("data-v");
    render();
  });
  f.addEventListener("change", function(e){
    var s = e.target.closest(".rh-sel"); if(!s) return;
    state[s.getAttribute("data-g")] = s.value;
    render();
  });

  buildFinder();

  /* ?have=eggs,avocado — makes a result shareable, and lets the same script
     serve an embed later without further work */
  try{
    var qp = new URLSearchParams(location.search).get("have");
    if(qp) qp.split(",").forEach(function(t){
      t = t.trim().toLowerCase();
      if(t && TAGS.indexOf(t) > -1 && have.indexOf(t) === -1) have.push(t);
    });
    if(have.length && finder){ finder.classList.add("rx-show");
      var o = document.getElementById("rx-open"); if(o) o.classList.add("rx-hide"); }
  }catch(e){}

  render();
}

if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", init); }
else { init(); }
})();
