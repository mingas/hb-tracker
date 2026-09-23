(function(){
"use strict";
if(window.__rcpEnh) return;
window.__rcpEnh = true;

/* ---------------------------------------------------------------
   Recipe values come from a hidden, CMS-bound block on the page
   (#rcp-data, built 20 Sept). Nothing is hardcoded here any more:
   adding a recipe is a CMS-only job.
--------------------------------------------------------------- */
var DIET_SCHEMA = {
  "vegetarian":"VegetarianDiet",
  "vegan":"VeganDiet",
  "gluten-free":"GlutenFreeDiet",
  "gluten free":"GlutenFreeDiet",
  "low-lactose":"LowLactoseDiet",
  "low lactose":"LowLactoseDiet",
  "low-fat":"LowFatDiet",
  "low-calorie":"LowCalorieDiet",
  "diabetic":"DiabeticDiet",
  "diabetic-friendly":"DiabeticDiet"
};

var DIET_LABEL = {
  VegetarianDiet:"Vegetarian",
  VeganDiet:"Vegan",
  GlutenFreeDiet:"Gluten-free",
  LowLactoseDiet:"Low-lactose",
  LowFatDiet:"Low-fat",
  LowCalorieDiet:"Low-calorie",
  DiabeticDiet:"Diabetic-friendly"
};

function txt(el){ return el ? (el.textContent||"").replace(/\s+/g," ").trim() : ""; }

/* Reads the hidden CMS block. Returns null when it is absent or empty,
   and every consumer below already copes with null — so a recipe whose
   numbers have not been filled in simply shows no nutrition box rather
   than a box full of zeroes. */
function recipeData(){
  var box = document.getElementById("rcp-data");
  if(!box) return null;
  function val(k){
    var el = box.querySelector('[data-r="' + k + '"]');
    return el ? (el.textContent || "").trim() : "";
  }
  function num(k){
    var n = parseInt(val(k).replace(/[^0-9-]/g,""), 10);
    return isNaN(n) ? 0 : n;
  }
  var kcal = num("kcal");
  if(!kcal) return null;              // no calories filled in, no box

  var diet = val("diet").split(",")
    .map(function(x){ return x.trim().toLowerCase(); })
    .filter(Boolean)
    .map(function(x){ return DIET_SCHEMA[x] || null; })
    .filter(Boolean);

  return { p:num("prep"), c:num("cook"), k:kcal,
           pr:num("protein"), cb:num("carbs"), f:num("fat"),
           cu:val("cuisine"), d:diet, kw:val("kw") };
}

/* ------------------------------ CSS ------------------------------ */
function css(){
  if(document.getElementById("rcp-enh-css")) return;
  var s = document.createElement("style");
  s.id = "rcp-enh-css";
  s.textContent =
  ".rcp-acts{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 4px}"+
  ".rcp-act{display:inline-flex;align-items:center;gap:8px;border:1px solid #E7E1D4;background:#fff;color:#12294A;font:inherit;font-size:14.5px;font-weight:600;padding:10px 16px;border-radius:12px;cursor:pointer;text-decoration:none;line-height:1.2;transition:border-color .15s,background .15s}"+
  ".rcp-act:hover{border-color:#C09A4E}"+
  ".rcp-act:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  '.rcp-act[aria-pressed="true"]{background:#12294A;border-color:#12294A;color:#fff}'+
  ".rcp-act svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"+
  ".rcp-nut{border:1px solid #E7E1D4;border-radius:14px;background:#FCFAF6;padding:18px 20px 16px;margin:30px 0}"+
  ".rcp-nut-h{font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:600;color:#12294A;margin:0 0 3px}"+
  ".rcp-nut-s{font-size:13.5px;color:#6B7280;margin:0 0 14px}"+
  ".rcp-nut-r{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}"+
  ".rcp-nut-i{text-align:center;background:#fff;border:1px solid #EFE9DC;border-radius:10px;padding:11px 6px}"+
  ".rcp-nut-v{display:block;font-family:Fraunces,Georgia,serif;font-size:21px;font-weight:600;color:#12294A;line-height:1.1}"+
  ".rcp-nut-l{display:block;font-size:12px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:#8A8270;margin-top:4px}"+
  ".rcp-nut-d{font-size:12.5px;line-height:1.5;color:#8A8270;margin:13px 0 0}"+
  ".rcp-tagrow{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 0}"+
  ".rcp-dtag{font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;background:#F2E7CE;color:#7A6430}"+
  "#rcp-ing-anchor{scroll-margin-top:118px}"+
  "body.rcp-cooking .rcp-body{font-size:18.5px;line-height:1.75}"+
  "body.rcp-cooking .rcp-body li{padding:4px 0}"+
  "body.rcp-cooking .rcp-body li.rcp-done{opacity:.45;text-decoration:line-through}"+
  ".rcp-body li{cursor:default}"+
  "body.rcp-cooking .rcp-body li{cursor:pointer}"+
  ".rcp-note{font-size:13.5px;color:#6B7280;margin:10px 0 0}"+
  /* related recipes */
  ".rcp-rel{margin:34px 0 0;padding:26px 0 0;border-top:1px solid #E7E1D4}"+
  ".rcp-rel-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin:16px 0 0}"+
  ".rcp-rel-c{display:flex;flex-direction:column;background:#fff;border:1px solid #E7E1D4;"+
    "border-radius:14px;overflow:hidden;text-decoration:none;color:inherit;transition:border-color .15s}"+
  ".rcp-rel-c:hover{border-color:#C09A4E}"+
  ".rcp-rel-c:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  ".rcp-rel-i{width:100%;height:132px;object-fit:cover;display:block;background:#F2E7CE}"+
  ".rcp-rel-b{padding:13px 14px 15px;flex:1;display:flex;flex-direction:column}"+
  ".rcp-rel-t{font-family:Fraunces,Georgia,serif;font-size:16.5px;line-height:1.3;font-weight:600;"+
    "color:#12294A;margin:0 0 6px}"+
  ".rcp-rel-m{font-size:12.5px;font-weight:600;color:#8A8270;margin:0}"+
  ".rcp-rel-s{font-size:12.5px;line-height:1.45;color:#6B7280;margin:7px 0 0}"+
  "@media screen and (max-width:760px){.rcp-rel-g{grid-template-columns:1fr}"+
    ".rcp-rel-c{flex-direction:row;align-items:stretch}"+
    ".rcp-rel-i{width:108px;height:auto;min-height:100%;flex:none}"+
    ".rcp-rel-b{padding:12px 13px}}"+
  "@media screen and (max-width:600px){.rcp-nut-r{grid-template-columns:repeat(2,1fr)}.rcp-act{flex:1 1 calc(50% - 5px);justify-content:center}}"+
  "@media print{"+
    ".navbar,.nav,.nav-bar,.nbar-wrap,.nbar,nav,footer,.footer,.rcp-acts,.rcp-back,.rcp-note,.w-nav,.w-nav-overlay,.hb-nav,#nbar-menu,.rcp-rel,.rcp-noprint{display:none!important}"+
    "body{background:#fff!important;padding-top:0!important}"+
    ".rcp-wrap{padding-top:0!important;max-width:100%!important}"+
    ".rcp-hero{max-height:250px;object-fit:cover}"+
    ".rcp-nut{break-inside:avoid;background:#fff}"+
    "a[href]:after{content:''}"+
    ".rcp-body li{break-inside:avoid}"+
  "}";
  document.head.appendChild(s);
}

/* ------------------------------ icons ------------------------------ */
function icon(d){
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox","0 0 24 24");
  svg.setAttribute("aria-hidden","true");
  d.forEach(function(p){
    var el = document.createElementNS(ns, p[0]);
    for(var k in p[1]) el.setAttribute(k, p[1][k]);
    svg.appendChild(el);
  });
  return svg;
}
var IC_DOWN  = [["path",{d:"M12 5v14"}],["path",{d:"m19 12-7 7-7-7"}]];
var IC_BULB  = [["path",{d:"M9 18h6"}],["path",{d:"M10 22h4"}],["path",{d:"M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"}]];
var IC_PRINT = [["path",{d:"M6 9V2h12v7"}],["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"}],["path",{d:"M6 14h12v8H6z"}]];

function btn(label, icons){
  var b = document.createElement("button");
  b.type = "button";
  b.className = "rcp-act";
  b.appendChild(icon(icons));
  b.appendChild(document.createTextNode(label));
  return b;
}


/* ---------------- fixed-header helpers ----------------
   The site navbar has been renamed before, so nothing here hardcodes a class.
   navOffset() asks the browser what is actually covering the top of the
   viewport; markFixed() tags those elements so the print stylesheet can hide
   them whatever they are called. */
function navOffset(){
  var best = 0;
  try{
    var els = document.elementsFromPoint(Math.floor(window.innerWidth/2), 5) || [];
    for(var i=0;i<els.length;i++){
      var e = els[i];
      if(e === document.body || e === document.documentElement) continue;
      var cs = window.getComputedStyle(e);
      if(cs.position === "fixed" || cs.position === "sticky"){
        var b = e.getBoundingClientRect().bottom;
        if(b > best && b < 250) best = b;
      }
    }
  }catch(err){}
  return best;
}

function markFixed(){
  try{
    var all = document.querySelectorAll("body > *, body > * > *");
    for(var i=0;i<all.length;i++){
      if(window.getComputedStyle(all[i]).position === "fixed"){
        all[i].classList.add("rcp-noprint");
      }
    }
  }catch(err){}
}

function scrollToAnchor(){
  var t = document.getElementById("rcp-ing-anchor");
  if(!t) return;
  var y = t.getBoundingClientRect().top + (window.pageYOffset || 0) - (navOffset() + 16);
  if(y < 0) y = 0;
  try{ window.scrollTo({ top: y, behavior: "smooth" }); }
  catch(err){ window.scrollTo(0, y); }
}

/* ------------------------------ cook mode ------------------------------ */
var lock = null;

function releaseLock(){
  if(lock && lock.release){ try{ lock.release(); }catch(e){} }
  lock = null;
}

function requestLock(){
  if(!navigator.wakeLock || !navigator.wakeLock.request) return;
  try{
    var p = navigator.wakeLock.request("screen");
    if(p && p.then){
      p.then(function(l){
        lock = l;
        if(l && l.addEventListener) l.addEventListener("release", function(){ lock = null; });
      })["catch"](function(){ lock = null; });
    }
  }catch(e){ lock = null; }
}

function setCook(on, b, note){
  document.body.classList.toggle("rcp-cooking", !!on);
  b.setAttribute("aria-pressed", on ? "true" : "false");
  if(note) note.style.display = on ? "" : "none";
  if(on){ requestLock(); } else { releaseLock(); }
}

/* ------------------------- related recipes -------------------------
   Every recipe page linked out to the food pages and nothing linked back,
   so each one had a single inbound internal link — the hub grid. This reads
   the same hidden CMS block pattern the hub uses and offers three neighbours.

   It does nothing at all when the block is absent, which is what keeps the
   live pages unchanged until the template ships. */

function readList(){
  var out = [], seen = {};
  var blocks = document.querySelectorAll("[data-rcp-list], #rcp-list");
  Array.prototype.forEach.call(blocks, function(block){
    Array.prototype.forEach.call(block.querySelectorAll('[data-f="slug"]'), function(slugEl){
      var rec = slugEl.parentNode;
      if(!rec) return;
      function v(k){
        var el = rec.querySelector('[data-f="' + k + '"]');
        return el ? (el.textContent || "").trim() : "";
      }
      var slug = v("slug");
      if(!slug || seen[slug]) return;
      seen[slug] = true;
      var img = rec.querySelector('[data-f="photo"]');
      var goals = [];
      Array.prototype.forEach.call(rec.querySelectorAll("[data-g]"), function(g){
        var n = g.getAttribute("data-g"); if(n) goals.push(n);
      });
      out.push({ s:slug, n:v("name"), m:v("meal"), t:v("time"), g:goals,
        p: img ? (img.getAttribute("src") || "") : "",
        a: img ? (img.getAttribute("alt") || v("name")) : v("name"),
        ing: v("tags").split(",").map(function(x){ return x.trim().toLowerCase(); }).filter(Boolean) });
    });
  });
  return out;
}

function related(wrap){
  if(document.getElementById("rcp-rel")) return;
  var all = readList();
  if(all.length < 4) return;                 // too few to suggest anything

  var here = (location.pathname.split("/").filter(Boolean).pop() || "").toLowerCase();
  var me = null, rest = [];
  all.forEach(function(r){ if(r.s.toLowerCase() === here) me = r; else rest.push(r); });
  if(!me || !rest.length) return;            // unknown slug, say nothing

  /* An ingredient in a quarter of the collection says nothing about
     relatedness. Olive oil and garlic are in everything. */
  var freq = {};
  all.forEach(function(r){
    var once = {};
    r.ing.forEach(function(t){ if(!once[t]){ once[t] = 1; freq[t] = (freq[t]||0) + 1; } });
  });
  /* A quarter of the collection is the right threshold once there are enough
     recipes, but it must not fall below three: in a small collection a quarter
     is two, which throws away exactly the pairs worth surfacing. At 24 recipes
     the quarter rule wins, so this floor changes nothing live. */
  var cap = Math.max(3, all.length / 4);

  function pair(a, b){
    var mine = {};
    a.ing.forEach(function(t){ mine[t] = 1; });
    var goals = {};
    a.g.forEach(function(x){ goals[x] = 1; });
    var shared = b.ing.filter(function(t){ return mine[t] && freq[t] < cap; });
    var g = b.g.filter(function(x){ return goals[x]; }).length;
    return { r:b, shared:shared,
             score: shared.length * 3 + g + (a.m === b.m ? 2 : 0) };
  }

  function rank(a){
    return all.filter(function(b){ return b.s !== a.s; })
      .map(function(b){ return pair(a, b); })
      .filter(function(o){ return o.score > 0; })
      .sort(function(x, y){
        if(y.score !== x.score) return y.score - x.score;
        return x.r.s < y.r.s ? -1 : 1;       // stable, so the order never jitters
      });
  }

  var picks = {};
  all.forEach(function(r){ picks[r.s] = rank(r).slice(0, 3); });

  /* The point of this block is that no recipe is left with only the hub
     linking to it, and the plain rule does leave a few unusual ones out —
     nothing shares chicken livers. Every page holds the whole list, so each
     one runs this identical assignment and reaches the same answer: an
     unlinked recipe is added to whichever page is its closest match. */
  var inbound = {};
  all.forEach(function(r){ inbound[r.s] = 0; });
  Object.keys(picks).forEach(function(k){
    picks[k].forEach(function(o){ inbound[o.r.s] = (inbound[o.r.s] || 0) + 1; });
  });

  /* Hosts are tried from closest match down, and a host that already shows
     four cards is skipped rather than trimmed. The first version trimmed with
     pop(), and when two unlinked recipes shared a best host the second pushed
     the first straight back out — it reported the recipe as placed while the
     page no longer showed it. Nothing is ever removed here now. */
  all.forEach(function(r){
    if(inbound[r.s] > 0) return;
    var hosts = all.filter(function(h){ return h.s !== r.s; })
      .map(function(h){ return { host:h, o:pair(h, r) }; })
      .sort(function(x, y){
        if(y.o.score !== x.o.score) return y.o.score - x.o.score;
        return x.host.s < y.host.s ? -1 : 1;
      });
    for(var i = 0; i < hosts.length; i++){
      var into = picks[hosts[i].host.s];
      if(into.length < 4){ into.push(hosts[i].o); inbound[r.s] = 1; return; }
    }
  });

  var scored = picks[me.s] || [];
  if(scored.length < 2) return;              // one lonely card is not worth a section

  var sec = document.createElement("div");
  sec.className = "rcp-sec rcp-rel";
  sec.id = "rcp-rel";

  var h = document.createElement("h2");
  h.className = "rcp-h2";
  h.textContent = "You might also cook";
  sec.appendChild(h);

  var grid = document.createElement("div");
  grid.className = "rcp-rel-g";

  scored.forEach(function(o){
    var r = o.r;
    var a = document.createElement("a");
    a.className = "rcp-rel-c";
    a.href = "/recipes/" + r.s;

    if(r.p){
      var im = document.createElement("img");
      im.className = "rcp-rel-i";
      im.src = r.p; im.alt = r.a;
      im.setAttribute("loading","lazy");
      a.appendChild(im);
    }

    var bd = document.createElement("div");
    bd.className = "rcp-rel-b";

    var t = document.createElement("p");
    t.className = "rcp-rel-t";
    t.textContent = r.n;
    bd.appendChild(t);

    var meta = [];
    if(r.m) meta.push(r.m);
    if(r.t) meta.push(/^\d+$/.test(r.t) ? r.t + " min" : r.t);
    if(meta.length){
      var mp = document.createElement("p");
      mp.className = "rcp-rel-m";
      mp.textContent = meta.join(" · ");
      bd.appendChild(mp);
    }

    if(o.shared.length){
      var sp = document.createElement("p");
      sp.className = "rcp-rel-s";
      sp.textContent = "Also uses " + o.shared.slice(0,3).join(", ");
      bd.appendChild(sp);
    }

    a.appendChild(bd);
    grid.appendChild(a);
  });

  sec.appendChild(grid);
  wrap.appendChild(sec);
}

/* ------------------------------ build ------------------------------ */
function build(){
  var wrap = document.querySelector(".rcp-wrap");
  if(!wrap) return;
  if(wrap.getAttribute("data-rcp-enh") === "1") return;
  wrap.setAttribute("data-rcp-enh","1");

  var name = txt(wrap.querySelector(".rcp-h1"));
  if(!name) return;

  css();

  var d = recipeData();

  var intro  = txt(wrap.querySelector(".rcp-intro"));
  var img    = wrap.querySelector(".rcp-hero");
  var imgSrc = img ? (img.currentSrc || img.src || "") : "";

  var pillEls = wrap.querySelectorAll(".rcp-pill");
  /* Time Minutes is a CMS Number field, so the middle pill renders as a bare
     "15". Binding cannot be changed through the API, so add the unit here. */
  if(pillEls[1] && /^\d+$/.test(txt(pillEls[1]))){
    pillEls[1].textContent = txt(pillEls[1]) + " min";
  }
  var pills = Array.prototype.map.call(pillEls, txt);
  var meal  = pills[0] || "";
  var mins  = 0;
  if(pills[1]){ var m = pills[1].match(/(\d+)/); if(m) mins = parseInt(m[1],10); }
  var serves = pills[2] || "";

  var bodies = wrap.querySelectorAll(".rcp-body");
  var ingEl  = bodies[0] || null;
  var metEl  = bodies[1] || null;

  var ingredients = [];
  if(ingEl){
    Array.prototype.forEach.call(ingEl.querySelectorAll("li"), function(li){
      var t = txt(li); if(t) ingredients.push(t);
    });
  }

  var steps = [];
  if(metEl){
    Array.prototype.forEach.call(metEl.querySelectorAll("ol > li"), function(li,i){
      var t = txt(li);
      if(t) steps.push({ "@type":"HowToStep", "position": i+1, "text": t });
    });
  }

  /* ---- action bar, inserted after the meta block ---- */
  var row = wrap.querySelector(".rcp-meta") || wrap.querySelector(".rcp-pillrow");
  if(row && row.parentNode && ingEl){
    var acts = document.createElement("div");
    acts.className = "rcp-acts";

    var jump = document.createElement("a");
    jump.className = "rcp-act";
    jump.href = "#rcp-ing-anchor";
    jump.appendChild(icon(IC_DOWN));
    jump.appendChild(document.createTextNode("Jump to recipe"));
    /* Webflow intercepts in-page anchor clicks and animates the scroll itself,
       which ignores scroll-margin-top and leaves the heading under the navbar.
       Scroll it manually instead. */
    jump.addEventListener("click", function(e){ e.preventDefault(); scrollToAnchor(); });
    acts.appendChild(jump);

    var cook = btn("Cook mode", IC_BULB);
    cook.setAttribute("aria-pressed","false");
    acts.appendChild(cook);

    var prn = btn("Print", IC_PRINT);
    acts.appendChild(prn);

    var note = document.createElement("p");
    note.className = "rcp-note";
    note.style.display = "none";
    note.textContent = "Cook mode is on: larger text, and your screen stays awake while the tab is open. Tap a line to tick it off.";

    row.parentNode.insertBefore(acts, row.nextSibling);
    acts.parentNode.insertBefore(note, acts.nextSibling);

    /* anchor above the ingredients section */
    var anchor = document.createElement("div");
    anchor.id = "rcp-ing-anchor";
    var target = (ingEl.closest && ingEl.closest(".rcp-sec")) ||
                 (ingEl.previousElementSibling &&
                  /^H[23]$/.test(ingEl.previousElementSibling.tagName)
                  ? ingEl.previousElementSibling : ingEl);
    target.parentNode.insertBefore(anchor, target);

    cook.addEventListener("click", function(){
      setCook(cook.getAttribute("aria-pressed") !== "true", cook, note);
    });
    prn.addEventListener("click", function(){ markFixed(); window.print(); });

    window.addEventListener("beforeprint", markFixed);

    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "visible" &&
         document.body.classList.contains("rcp-cooking")) requestLock();
    });

    /* tick lines off, cook mode only */
    wrap.addEventListener("click", function(e){
      if(!document.body.classList.contains("rcp-cooking")) return;
      var li = e.target.closest ? e.target.closest(".rcp-body li") : null;
      if(!li) return;
      li.classList.toggle("rcp-done");
    });
  }

  /* ---- nutrition box, after the method section ---- */
  var metSec = metEl ? ((metEl.closest && metEl.closest(".rcp-sec")) || metEl) : null;
  if(d && metSec && metSec.parentNode){
    var box = document.createElement("div");
    box.className = "rcp-nut";

    var h = document.createElement("h2");
    h.className = "rcp-nut-h";
    h.textContent = "Nutrition per serving";
    box.appendChild(h);

    var sub = document.createElement("p");
    sub.className = "rcp-nut-s";
    var bits = [];
    if(d.p) bits.push(d.p + " min prep");
    if(d.c) bits.push(d.c + " min cooking");
    /* keep the CMS wording, so "Makes 12" does not become "serves 12" */
    if(serves) bits.push(serves.charAt(0).toLowerCase() + serves.slice(1));
    sub.textContent = bits.join(" · ");
    if(bits.length) box.appendChild(sub);

    var r = document.createElement("div");
    r.className = "rcp-nut-r";
    [[d.k,"kcal"],[d.pr+"g","Protein"],[d.cb+"g","Carbs"],[d.f+"g","Fat"]].forEach(function(o){
      var i = document.createElement("div"); i.className = "rcp-nut-i";
      var v = document.createElement("span"); v.className = "rcp-nut-v"; v.textContent = o[0];
      var l = document.createElement("span"); l.className = "rcp-nut-l"; l.textContent = o[1];
      i.appendChild(v); i.appendChild(l); r.appendChild(i);
    });
    box.appendChild(r);

    if(d.d && d.d.length){
      var tr = document.createElement("div");
      tr.className = "rcp-tagrow";
      d.d.forEach(function(t){
        var sp = document.createElement("span");
        sp.className = "rcp-dtag";
        sp.textContent = DIET_LABEL[t] || t;
        tr.appendChild(sp);
      });
      box.appendChild(tr);
    }

    var dis = document.createElement("p");
    dis.className = "rcp-nut-d";
    dis.textContent = "Estimated, and provided as a courtesy. Figures vary with brands, portion sizes and how you cook.";
    box.appendChild(dis);

    metSec.parentNode.insertBefore(box, metSec.nextSibling);
  }

  /* ---- related recipes ---- */
  /* Deliberately before the schema section, which returns early on a recipe
     with no ingredient or method list. Wrapped because nothing here is worth
     breaking the rest of the page for. */
  try { related(wrap); } catch(e){}

  /* ---- schema ---- */
  if(!ingredients.length || !steps.length) return;
  if(document.getElementById("rcp-schema")) return;

  var data = {
    "@context":"https://schema.org",
    "@type":"Recipe",
    "name": name,
    "url": location.origin + location.pathname,
    "inLanguage":"en-GB",
    "recipeIngredient": ingredients,
    "recipeInstructions": steps,
    "author": { "@type":"Person", "name":"M. Videika" },
    "publisher": {
      "@type":"Organization",
      "name":"The Hormone Blueprint",
      "url":"https://testosteroneblueprintguide.com"
    }
  };

  if(intro) data.description = intro;
  if(imgSrc) data.image = [imgSrc];
  if(serves) data.recipeYield = serves;
  if(mins > 0) data.totalTime = "PT" + mins + "M";
  if(meal){
    var map = { Breakfast:"breakfast", Lunch:"lunch", Dinner:"dinner", Snack:"snack" };
    data.recipeCategory = map[meal] || meal.toLowerCase();
  }

  if(d){
    /* Google's guidance is that prepTime and cookTime are used together.
       A no-cook recipe gets PT0M rather than an absent key. */
    if(d.p > 0){
      data.prepTime = "PT" + d.p + "M";
      data.cookTime = "PT" + d.c + "M";
    }
    if(d.cu) data.recipeCuisine = d.cu;
    if(d.kw) data.keywords = d.kw;
    if(d.d && d.d.length){
      data.suitableForDiet = d.d.map(function(x){ return "https://schema.org/" + x; });
    }
    if(d.k){
      data.nutrition = {
        "@type":"NutritionInformation",
        "servingSize":"1 serving",
        "calories": d.k + " kcal",
        "proteinContent": d.pr + " g",
        "carbohydrateContent": d.cb + " g",
        "fatContent": d.f + " g"
      };
    }
  }

  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "rcp-schema";
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", build);
} else {
  build();
}
})();
