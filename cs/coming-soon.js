/* coming_soon_v1 — self-contained placeholder for testosteroneblueprintguide.com
   Renders the SAME site navbar (base .nbar-row markup, transformed by nbar_menu_v4)
   plus a clean coming-soon hero, on 3 noindex placeholder pages keyed by pathname.
   Adds <meta name="robots" content="noindex,follow">. No deps. Idempotent. */
(function () {
  if (window.__csV1) return;
  var P = location.pathname.replace(/\/+$/, '');
  var DATA = {
    '/womens-hormone-health': {
      e: 'The Hormone Blueprint',
      h: 'For Women — Coming Soon',
      p: "We're building a dedicated women's hormone health hub — a hormone-type quiz, a daily tracker, and clear, evidence-based guidance made for women. It's on the way."
    },
    '/testosterone-tracker': {
      e: 'The Testosterone Blueprint',
      h: 'Optimisation Tracker — Coming Soon',
      p: "A simple daily tracker to log your habits, see what actually moves your testosterone, and stay consistent. We're putting the finishing touches on it."
    },
    '/hormone-blueprint': {
      e: 'The Hormone Blueprint',
      h: 'The Hormone Blueprint — Coming Soon',
      p: "Our complete women's hormone health book is in the works — the same evidence-first approach, written for women. Check back soon for the full guide."
    }
  };
  var d = DATA[P];
  if (!d) return;
  window.__csV1 = true;

  // noindex (placeholder pages must not be indexed)
  var meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex,follow';
  (document.head || document.documentElement).appendChild(meta);

  var css = '' +
    'html,body{margin:0!important;background:#0F1A2E!important}' +
    /* navbar layout to match the rest of the site: brand left, menu+CTA grouped right */
    '.nbar-row{display:flex!important;align-items:center;width:100%;max-width:100%;margin:0!important;padding:22px 40px!important;box-sizing:border-box}' +
    '.nbar-row .nbar-brand{color:#F4ECDD!important;margin-right:auto;font:600 20px/1.1 Arial,Helvetica,sans-serif;text-decoration:none;letter-spacing:.2px}' +
    '.nbar-row .nbar-mid{display:inline-flex;align-items:center;gap:8px}' +
    '.nbar-row .nbar-red{margin-left:12px}' +
    '#cs-root{min-height:calc(100vh - 72px);display:flex;flex-direction:column;' +
    'align-items:center;justify-content:center;text-align:center;background:#0F1A2E;color:#F4ECDD;' +
    'padding:64px 24px;box-sizing:border-box}' +
    '#cs-root .cs-e{font:600 13px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#C97B5C;margin:0 0 20px}' +
    '#cs-root .cs-h{font:700 clamp(30px,6vw,52px)/1.12 Georgia,"Times New Roman",serif;margin:0 0 18px;max-width:16ch}' +
    '#cs-root .cs-p{font:400 18px/1.6 Arial,Helvetica,sans-serif;max-width:54ch;margin:0 0 32px;opacity:.88}' +
    '#cs-root .cs-b{display:inline-block;background:#C97B5C;color:#0F1A2E;font:700 15px/1 Arial,Helvetica,sans-serif;' +
    'text-decoration:none;padding:16px 30px;border-radius:10px;transition:opacity .15s ease}' +
    '#cs-root .cs-b:hover{opacity:.9}' +
    '#cs-root .cs-l{margin-top:28px;font:400 15px/2 Arial,Helvetica,sans-serif;opacity:.82}' +
    '#cs-root .cs-l a{color:#F4ECDD;text-decoration:underline;margin:0 10px;white-space:nowrap}';
  var st = document.createElement('style');
  st.id = 'cs-css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  // Base navbar markup — same classes the rest of the site uses (styled by the
  // global Webflow stylesheet) and the same flat structure nbar_menu_v4 expects.
  // nbar_menu_v4 (also applied to these pages) folds the ghost links into the
  // Resources / Men's Health / Women's Health dropdowns + mobile overlay.
  var NAV = '' +
    '<a class="nbar-brand" href="/">The Testosterone Blueprint</a>' +
    '<div class="nbar-mid">' +
      '<a class="nbar-ghost" href="/resources">For Men</a>' +
      '<a class="nbar-ghost" href="/womens-hormone-health">For Women</a>' +
      '<a class="nbar-ghost" href="/testosterone-test">Testosterone Quiz</a>' +
      '<a class="nbar-ghost" href="/andropause-calculator">Find Your Real Age</a>' +
      '<a class="nbar-ghost" href="/free-guide">7-Day Free Guide</a>' +
      '<a class="nbar-ghost" href="/testosterone-tracker">Optimisation Tracker</a>' +
      '<a class="nbar-ghost" href="/hormone-quiz">Hormone Quiz</a>' +
      '<a class="nbar-ghost" href="/hormone-blueprint">Book</a>' +
      '<a class="nbar-ghost" href="/contact">Contact</a>' +
    '</div>' +
    '<a class="nbar-red" href="/#book">Get the book \u2192</a>';

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function lnk(href, txt, cls) {
    var a = el('a', cls, txt);
    a.setAttribute('href', href);
    return a;
  }

  function mount() {
    if (document.getElementById('cs-root')) return;

    // 1) Navbar (prepended so it sits at the very top)
    if (!document.querySelector('.nbar-row')) {
      var nav = el('div', 'nbar-row', null);
      nav.innerHTML = NAV;
      document.body.insertBefore(nav, document.body.firstChild);
    }

    // 2) Coming-soon hero
    var root = el('section', null, null);
    root.id = 'cs-root';
    root.appendChild(el('div', 'cs-e', d.e));
    root.appendChild(el('h1', 'cs-h', d.h));
    root.appendChild(el('p', 'cs-p', d.p));
    root.appendChild(lnk('/', '\u2190 Back to home', 'cs-b'));
    var links = el('div', 'cs-l', 'Meanwhile, explore: ');
    links.appendChild(lnk('/testosterone-test', 'Testosterone Test'));
    links.appendChild(lnk('/hormone-quiz', 'Hormone Quiz'));
    links.appendChild(lnk('/free-guide', 'Free 7-Day Guide'));
    root.appendChild(links);
    document.body.appendChild(root);
    document.title = d.h + ' | testosteroneblueprintguide.com';
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
