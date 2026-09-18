(function(){
"use strict";
var CDN="https://cdn.prod.website-files.com/6a00da67501efe2b2f05c3fc/";
var R=[
{s:"shakshuka-with-spinach",n:"Shakshuka with Spinach",i:"The North African breakfast that solves the protein problem. Four eggs, a tin of tomatoes, one pan.",m:"Breakfast",t:25,g:["testosterone","menopause","insulin"],p:CDN+"6aad542e4f6a8d4f8367c2ef_6aad534fc1a8edf4b4f8b596_Shakshuka%2520with%2520Spinach.jpeg"},
{s:"overnight-oats-flaxseed",n:"Overnight Oats with Ground Flaxseed",i:"Assembled in four minutes the night before. The flaxseed must be ground, and almost nobody grinds it.",m:"Breakfast",t:5,g:["menopause","insulin","sleep"],p:CDN+"6aad542e4f6a8d4f8367c2f3_6aad5367e3e648b39b041229_Overnight%2520Oats%2520with%2520Ground%2520Flaxseed.jpeg"},
{s:"lentil-soup-turmeric-lemon",n:"Lentil Soup with Turmeric and Lemon",i:"The cheapest 18 grams of protein here, and it freezes. The lemon at the end is not optional.",m:"Lunch",t:45,g:["testosterone","menopause","insulin"],p:CDN+"6aad542e4f6a8d4f8367c300_6aad537f56dca1c4c4e22d55_Lentil%2520Soup%2520with%2520Turmeric%2520and%2520Lemon.jpeg"},
{s:"mackerel-avocado-bowl",n:"Mackerel and Avocado Bowl",i:"Ten minutes, no cooking, roughly 30 grams of protein. For days you cannot face cooking.",m:"Lunch",t:10,g:["testosterone","insulin"],p:CDN+"6aad542e4f6a8d4f8367c2f8_6aad5395c1a8edf4b4f8f346_Mackerel%2520and%2520Avocado%2520Bowl.jpeg"},
{s:"salmon-broccoli-sprouts",n:"Roast Salmon with Broccoli and Raw Sprouts",i:"Twenty-two minutes, one tray, and the step everyone gets wrong: the sprouts go on raw.",m:"Dinner",t:22,g:["testosterone","menopause","insulin"],p:CDN+"6aad542e4f6a8d4f8367c307_6aad53aa5e00665e284026cf_Roast%2520Salmon%2520with%2520Broccoli%2520and%2520Raw%2520Sprouts.jpeg"},
{s:"buckwheat-beetroot-bowl",n:"Buckwheat Bowl with Roast Beetroot",i:"Buckwheat is neither wheat nor a grain, and it carries more magnesium than almost anything in the cupboard.",m:"Dinner",t:40,g:["testosterone","menopause","insulin"],p:CDN+"6aad542e4f6a8d4f8367c304_6aad53c3e7dcbe3611219d71_Buckwheat%2520Bowl%2520with%2520Roast%2520Beetroot.jpeg"},
{s:"yogurt-cherries-walnuts",n:"Greek Yogurt with Cherries and Walnuts",i:"Four minutes, eaten before bed. Slow protein overnight, magnesium, and a little melatonin.",m:"Snack",t:4,g:["menopause","insulin","sleep"],p:CDN+"6aad542e4f6a8d4f8367c2fc_6aad53debe550889fba897ca_Greek%2520Yogurt%2520with%2520Cherries%2520and%2520Walnuts.jpeg"},
{s:"chicken-liver-pate",n:"Chicken Liver Pate with Shallots",i:"The most nutrient-dense food on the site, in the only form most people will actually eat it.",m:"Snack",t:25,g:["testosterone","menopause"],p:CDN+"6aad542e4f6a8d4f8367c30e_6aad53fdd41f166282a34705_Chicken%2520Liver%2520Pate%2520with%2520Shallots.jpeg"}
];
var GOALS=[["all","All"],["testosterone","Testosterone"],["menopause","Menopause"],["insulin","Blood sugar"],["sleep","Sleep"]];
var MEALS=[["all","All"],["Breakfast","Breakfast"],["Lunch","Lunch"],["Dinner","Dinner"],["Snack","Snack"]];
var TIMES=[["all","Any"],["15","Under 15 min"],["30","Under 30 min"]];
var state={goal:"all",meal:"all",time:"all"};

function css(){
  if(document.getElementById("rh-css"))return;
  var s=document.createElement("style");s.id="rh-css";
  s.textContent=".rh-chip{border:1px solid #E7E1D4;background:#fff;color:#2b3440;font:inherit;font-size:14px;font-weight:600;padding:8px 15px;border-radius:999px;cursor:pointer;transition:background .15s,border-color .15s,color .15s}"+
  ".rh-chip:hover{border-color:#C09A4E}"+
  '.rh-chip[aria-pressed="true"]{background:#12294A;border-color:#12294A;color:#fff}'+
  ".rh-chip:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  ".rh-card{background:#fff;border:1px solid #E7E1D4;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit}"+
  ".rh-card:hover{border-color:#C09A4E}"+
  ".rh-card:focus-visible{outline:2px solid #C09A4E;outline-offset:2px}"+
  ".rh-img{width:100%;height:190px;object-fit:cover;display:block;background:#F2E7CE}"+
  ".rh-body{padding:15px 16px 17px;flex:1;display:flex;flex-direction:column}"+
  ".rh-meta{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 9px}"+
  ".rh-tag{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#F2E7CE;color:#7A6430}"+
  ".rh-tag.tm{background:#EDF1F5;color:#41556E}"+
  ".rh-t{font-family:Fraunces,Georgia,serif;font-size:19px;line-height:1.25;font-weight:600;color:#12294A;margin:0 0 7px}"+
  ".rh-i{font-size:14.5px;line-height:1.55;color:#6B7280;margin:0}";
  document.head.appendChild(s);
}

function chips(group,opts){
  var d=document.createElement("div");d.className="rh-grp";
  var l=document.createElement("div");l.className="rh-lab";
  l.textContent=group==="goal"?"What are you working on?":group==="meal"?"Which meal?":"How long have you got?";
  d.appendChild(l);
  var c=document.createElement("div");c.className="rh-chips";c.setAttribute("data-g",group);
  opts.forEach(function(o){
    var b=document.createElement("button");
    b.type="button";b.className="rh-chip";b.setAttribute("data-v",o[0]);
    b.setAttribute("aria-pressed",state[group]===o[0]?"true":"false");
    b.textContent=o[1];
    c.appendChild(b);
  });
  d.appendChild(c);
  return d;
}

function render(){
  var grid=document.getElementById("rh-grid");
  var count=document.getElementById("rh-count");
  var empty=document.getElementById("rh-empty");
  if(!grid)return;
  var out=R.filter(function(r){
    return (state.goal==="all"||r.g.indexOf(state.goal)>-1)&&
           (state.meal==="all"||r.m===state.meal)&&
           (state.time==="all"||r.t<=Number(state.time));
  });
  grid.innerHTML="";
  out.forEach(function(r){
    var a=document.createElement("a");
    a.className="rh-card";a.href="/recipes/"+r.s;
    var im=document.createElement("img");
    im.className="rh-img";im.src=r.p;im.alt=r.n;im.loading="lazy";
    a.appendChild(im);
    var b=document.createElement("div");b.className="rh-body";
    var mt=document.createElement("div");mt.className="rh-meta";
    var t1=document.createElement("span");t1.className="rh-tag";t1.textContent=r.m;
    var t2=document.createElement("span");t2.className="rh-tag tm";t2.textContent=r.t+" min";
    mt.appendChild(t1);mt.appendChild(t2);
    var h=document.createElement("h2");h.className="rh-t";h.textContent=r.n;
    var p=document.createElement("p");p.className="rh-i";p.textContent=r.i;
    b.appendChild(mt);b.appendChild(h);b.appendChild(p);
    a.appendChild(b);
    grid.appendChild(a);
  });
  var all=state.goal==="all"&&state.meal==="all"&&state.time==="all";
  if(count)count.textContent=all?("Showing all "+out.length+" recipes"):("Showing "+out.length+" of "+R.length+" recipes");
  if(empty)empty.style.display=out.length?"none":"";
}

function init(){
  var f=document.getElementById("rh-filters");
  if(!f)return;
  css();
  f.innerHTML="";
  f.appendChild(chips("goal",GOALS));
  f.appendChild(chips("meal",MEALS));
  f.appendChild(chips("time",TIMES));
  f.addEventListener("click",function(e){
    var b=e.target.closest(".rh-chip");if(!b)return;
    var wrap=b.parentNode;var g=wrap.getAttribute("data-g");
    Array.prototype.forEach.call(wrap.querySelectorAll(".rh-chip"),function(c){c.setAttribute("aria-pressed","false");});
    b.setAttribute("aria-pressed","true");
    state[g]=b.getAttribute("data-v");
    render();
  });
  render();
}

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}
})();
