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
  "@media screen and (max-width:600px){.rcp-nut-r{grid-template-columns:repeat(2,1fr)}.rcp-act{flex:1 1 calc(50% - 5px);justify-content:center}}"+
  "@media print{"+
    ".navbar,.nav,.nav-bar,.nbar-wrap,.nbar,nav,footer,.footer,.rcp-acts,.rcp-back,.rcp-note,.w-nav,.w-nav-overlay,.hb-nav,#nbar-menu,.rcp-noprint{display:none!important}"+
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
