(function(){
"use strict";
if(window.__rcpSchema) return;
window.__rcpSchema = true;

function txt(el){ return el ? (el.textContent||"").replace(/\s+/g," ").trim() : ""; }

function build(){
  var wrap = document.querySelector(".rcp-wrap");
  if(!wrap) return;
  if(document.getElementById("rcp-schema")) return;

  var name = txt(wrap.querySelector(".rcp-h1"));
  if(!name) return;

  var intro = txt(wrap.querySelector(".rcp-intro"));
  var img = wrap.querySelector(".rcp-hero");
  var imgSrc = img ? (img.currentSrc || img.src || "") : "";

  // pills: meal, time, serves — read in DOM order
  var pills = Array.prototype.map.call(wrap.querySelectorAll(".rcp-pill"), txt);
  var meal = pills[0] || "";
  var mins = 0;
  if(pills[1]){
    var m = pills[1].match(/(\d+)/);
    if(m) mins = parseInt(m[1],10);
  }
  var serves = pills[2] || "";

  // sections: first .rcp-body is ingredients, second is method, third is why
  var bodies = wrap.querySelectorAll(".rcp-body");
  var ingEl = bodies[0] || null;
  var metEl = bodies[1] || null;

  var ingredients = [];
  if(ingEl){
    Array.prototype.forEach.call(ingEl.querySelectorAll("li"), function(li){
      var t = txt(li);
      if(t) ingredients.push(t);
    });
  }

  var steps = [];
  if(metEl){
    Array.prototype.forEach.call(metEl.querySelectorAll("ol > li"), function(li,i){
      var t = txt(li);
      if(t) steps.push({ "@type":"HowToStep", "position": i+1, "text": t });
    });
  }

  if(!ingredients.length || !steps.length) return;

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
