/* nbar_menu_v4 — Site-wide navbar restructure for testosteroneblueprintguide.com
   Desktop: groups flat .nbar-ghost links into Resources / Men's Health / Women's Health dropdowns.
   Mobile (<=1024px): hamburger -> full-screen accordion overlay with the same groups.
   Replaces mobile_nav_v3. Operates on the rendered DOM, so it works even though the
   navbar is a shared Webflow component. Idempotent. Keys links by pathname (class-agnostic). */
(function () {
  'use strict';
  if (window.__nbarMenuV4) return;
  window.__nbarMenuV4 = true;

  // --- Menu model (label, [ [href, text], ... ]) -------------------------------
  var RES = [
    ['/free-tools', 'Free Tools'],
    ['/home-hormone-audit', 'Home Hormone Audit'],
    ['/resources', 'For Men'],
    ['/womens-hormone-health', 'For Women']
  ];
  var MEN = [
    ['/testosterone-test', 'Testosterone Quiz'],
    ['/andropause-calculator', 'Find Your Real Age'],
    ['/testosterone-levels-by-age', 'Testosterone by Age'],
    ['/libido', 'Libido & Sex Drive'],
    ['/testosterone-blood-test', 'Online Blood Test'],
    ['/trt', 'All about TRT'],
    ['/free-guide', '7-Day Free Guide'],
    ['/testosterone-tracker', 'Optimisation Tracker'],
    ['/workout-generator', 'Workout Generator'],
    ['/ask', 'Ask the Question'],
    ['/#book', 'Book']
  ];
  var WOMEN = [
    ['/menopause-stage-quiz', 'Menopause Stage Check'],
    ['/hormone-quiz', 'Hormone Quiz'],
    ['/womens-libido', 'Libido & Sex Drive'],
    ['/perimenopause-blood-test', 'Online Blood Test'],
    ['/hrt', 'All about HRT'],
    ['/workout-generator', 'Workout Generator'],
    ['/ask', 'Ask the Question'],
    ['/hormone-tracker', 'Hormone Tracker'],
    ['/hormone-blueprint', 'Book']
  ];
  var NUTRITION = [
    ['/supplements-guide', 'Supplements'],
    ['/foods', 'Foods']
  ];
  // Paths that must NOT be folded into a dropdown (kept as top-level link).
  var KEEP = ['/contact'];

  // --- CSS ---------------------------------------------------------------------
  var CSS = [
    /* desktop dropdown row */
    '.nbm-top{display:inline-flex;align-items:center;gap:6px}',
    '.nbm-dd{position:relative;display:inline-block}',
    '.nbm-dd-btn{cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none}',
    '.nbm-caret{font-size:.7em;transition:transform .18s ease;opacity:.9}',
    '.nbm-dd.open .nbm-caret,.nbm-dd:hover .nbm-caret{transform:rotate(180deg)}',
    '.nbm-dd-menu{position:absolute;top:100%;left:0;min-width:230px;background:#16243d;border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,.35);padding:8px;opacity:0;visibility:hidden;transform:translateY(6px);transition:opacity .16s ease,transform .16s ease;z-index:10000}',
    '.nbm-dd:hover .nbm-dd-menu,.nbm-dd.open .nbm-dd-menu{opacity:1;visibility:visible;transform:translateY(0)}',
    '.nbm-dd-menu::before{content:"";position:absolute;left:0;right:0;top:-14px;height:14px}',
    '.nbm-dd-link{display:block;color:#F4ECDD;text-decoration:none;font:inherit;padding:10px 14px;border-radius:8px;white-space:nowrap}',
    '.nbm-dd-link:hover{background:rgba(255,255,255,.08)}',
    /* hamburger button (hidden on desktop) */
    '.nbm-btn{display:none;background:0;border:0;padding:8px;cursor:pointer;color:#fff;align-items:center;justify-content:center;width:42px;height:42px;border-radius:8px;margin-left:auto}',
    /* mobile overlay */
    '.nbm-ov{position:fixed;inset:0;background:#0F1A2E;z-index:99999;display:none;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:4px;padding:72px 22px 32px;overflow-y:auto}',
    '.nbm-ov.open{display:flex}',
    '.nbm-cx{position:absolute;top:18px;right:18px;background:0;border:0;color:#fff;font-size:34px;line-height:1;cursor:pointer;padding:6px 12px}',
    '.nbm-ov-link{color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:600;text-decoration:none;padding:14px 6px;border-bottom:1px solid rgba(255,255,255,.08)}',
    '.nbm-grp{border-bottom:1px solid rgba(255,255,255,.08)}',
    '.nbm-grp-h{width:100%;background:0;border:0;color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:600;text-align:left;padding:14px 6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between}',
    '.nbm-grp-h .nbm-caret{font-size:.6em}',
    '.nbm-grp.open .nbm-grp-h .nbm-caret{transform:rotate(180deg)}',
    '.nbm-sub{max-height:0;overflow:hidden;transition:max-height .25s ease;display:flex;flex-direction:column}',
    '.nbm-grp.open .nbm-sub{max-height:620px}',
    '.nbm-sub a{color:#cfe;opacity:.92;color:#F4ECDD;text-decoration:none;font-family:Georgia,serif;font-size:17px;padding:11px 6px 11px 20px}',
    '.nbm-sub a:hover{opacity:1}',
    '.nbm-ov-cta{background:#C9302C;color:#fff;text-align:center;padding:16px 28px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:18px;text-transform:uppercase;letter-spacing:1px;font-size:14px}',
    /* responsive switch (match mobile_nav_v3 breakpoint) */
    '@media(max-width:1024px){.nbm-top{display:none!important}.nbar-row .nbar-ghost{display:none!important}.nbar-row .nbar-red{display:none!important}.nbm-btn{display:inline-flex!important}}',
    '.nbm-hide{display:none!important}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('nbm-css')) return;
    var s = document.createElement('style');
    s.id = 'nbm-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // --- helpers -----------------------------------------------------------------
  function pathOf(a) {
    var h = a.getAttribute('href') || '';
    h = h.replace(/^https?:\/\/[^/]+/i, ''); // strip origin if absolute
    return h;
  }
  function matchPath(a, target) {
    var p = pathOf(a).replace(/\/$/, '');
    var t = target.replace(/\/$/, '');
    return p === t;
  }
  function elc(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function mkLink(href, txt, cls) {
    var a = elc('a', cls, txt);
    a.setAttribute('href', href);
    return a;
  }
  function caret() {
    var s = document.createElement('span');
    s.className = 'nbm-caret';
    s.textContent = '\u25BE'; // ▾
    return s;
  }

  // --- desktop -----------------------------------------------------------------
  function buildDropdown(label, items) {
    var dd = elc('div', 'nbm-dd');
    var btn = elc('a', 'nbar-ghost nbm-dd-btn');
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.appendChild(document.createTextNode(label + ' '));
    btn.appendChild(caret());
    var menu = elc('div', 'nbm-dd-menu');
    items.forEach(function (it) { menu.appendChild(mkLink(it[0], it[1], 'nbm-dd-link')); });
    dd.appendChild(btn);
    dd.appendChild(menu);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var wasOpen = dd.classList.contains('open');
      closeAllDD();
      if (!wasOpen) dd.classList.add('open');
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
    return dd;
  }
  function closeAllDD() {
    var o = document.querySelectorAll('.nbm-dd.open');
    for (var i = 0; i < o.length; i++) o[i].classList.remove('open');
  }

  function initDesktop(row) {
    if (row.querySelector('.nbm-top')) return false;
    var ghosts = row.querySelectorAll('.nbar-ghost');
    if (!ghosts.length) return false;
    var firstGhost = ghosts[0];
    // hide every ghost that is folded into a dropdown (keep KEEP paths top-level)
    for (var i = 0; i < ghosts.length; i++) {
      var keep = KEEP.some(function (k) { return matchPath(ghosts[i], k); });
      if (!keep) ghosts[i].classList.add('nbm-hide');
    }
    var top = elc('div', 'nbm-top');
    top.appendChild(mkLink('/start-here', 'Start Here', 'nbar-ghost nbm-start'));
    top.appendChild(buildDropdown('Resources', RES));
    top.appendChild(buildDropdown('Nutrition', NUTRITION));
    top.appendChild(buildDropdown("Men's Health", MEN));
    top.appendChild(buildDropdown("Women's Health", WOMEN));
    // Ghosts may be nested inside a wrapper (e.g. .nbar-mid), not direct children of .nbar-row.
    // Insert into the ghosts' ACTUAL parent, before the first ghost. Fallback: append to row.
    var host = firstGhost.parentNode || row;
    try { host.insertBefore(top, firstGhost); }
    catch (e) { row.appendChild(top); }
    return true;
  }

  // --- mobile ------------------------------------------------------------------
  function buildGroup(label, items) {
    var g = elc('div', 'nbm-grp');
    var h = elc('button', 'nbm-grp-h');
    h.type = 'button';
    h.appendChild(document.createTextNode(label));
    h.appendChild(caret());
    var sub = elc('div', 'nbm-sub');
    items.forEach(function (it) { sub.appendChild(mkLink(it[0], it[1])); });
    g.appendChild(h);
    g.appendChild(sub);
    h.addEventListener('click', function () { g.classList.toggle('open'); });
    return g;
  }

  function initMobile(row) {
    if (document.querySelector('.nbm-ov')) return false;
    var brand = document.querySelector('.nbar-brand');
    var cta = row.querySelector('.nbar-red');
    var contact = null;
    var ghosts = row.querySelectorAll('.nbar-ghost');
    for (var i = 0; i < ghosts.length; i++) {
      if (KEEP.some(function (k) { return matchPath(ghosts[i], k); })) { contact = ghosts[i]; break; }
    }

    var btn = elc('button', 'nbm-btn');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<svg width="24" height="16" viewBox="0 0 24 16" aria-hidden="true"><line x1="0" y1="1" x2="24" y2="1" stroke="currentColor" stroke-width="2"/><line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" stroke-width="2"/><line x1="0" y1="15" x2="24" y2="15" stroke="currentColor" stroke-width="2"/></svg>';
    row.appendChild(btn);

    var ov = elc('div', 'nbm-ov');
    var cx = elc('button', 'nbm-cx', '\u00D7'); // ×
    cx.type = 'button';
    cx.setAttribute('aria-label', 'Close menu');
    ov.appendChild(cx);
    ov.appendChild(mkLink(brand ? (pathOf(brand) || '/') : '/', 'Home', 'nbm-ov-link'));
    ov.appendChild(mkLink('/start-here', 'Start Here', 'nbm-ov-link'));
    ov.appendChild(buildGroup('Resources', RES));
    ov.appendChild(buildGroup('Nutrition', NUTRITION));
    ov.appendChild(buildGroup("Men's Health", MEN));
    ov.appendChild(buildGroup("Women's Health", WOMEN));
    if (contact) ov.appendChild(mkLink(pathOf(contact) || '/contact', (contact.textContent || 'Contact').trim(), 'nbm-ov-link'));
    else ov.appendChild(mkLink('/contact', 'Contact', 'nbm-ov-link'));
    ov.appendChild(mkLink(cta ? (pathOf(cta) || '/#book') : '/#book', cta ? (cta.textContent || 'Get the book').trim() : 'Get the book \u2192', 'nbm-ov-cta'));
    document.body.appendChild(ov);

    function open() { ov.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { ov.classList.remove('open'); document.body.style.overflow = ''; }
    btn.addEventListener('click', open);
    cx.addEventListener('click', close);
    var links = ov.querySelectorAll('a');
    for (var j = 0; j < links.length; j++) links[j].addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1025) close(); });
    return true;
  }

  // --- boot --------------------------------------------------------------------
  // --- brand rename (Testosterone Blueprint -> Hormone Blueprint) ---------------
  function renameBrand() {
    var n = document.querySelector('.nbar-name');
    if (n) {
      if (n.textContent.indexOf('Hormone Blueprint') === -1) n.textContent = 'The Hormone Blueprint';
      return;
    }
    // fallback: rewrite the brand link's text node(s) if .nbar-name is absent
    var b = document.querySelector('.nbar-brand');
    if (b && b.textContent && b.textContent.indexOf('Testosterone Blueprint') !== -1) {
      var w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT, null, false);
      var node;
      while ((node = w.nextNode())) {
        if (node.nodeValue.indexOf('Testosterone Blueprint') !== -1) {
          node.nodeValue = node.nodeValue
            .replace('The Testosterone Blueprint', 'The Hormone Blueprint')
            .replace('Testosterone Blueprint', 'Hormone Blueprint');
        }
      }
    }
  }

  function init() {
    var row = document.querySelector('.nbar-row');
    if (!row) return false;
    injectCSS();
    renameBrand();
    initDesktop(row);
    initMobile(row);
    return true;
  }

  // close desktop dropdowns on outside click
  document.addEventListener('click', function (e) {
    var t = e.target;
    var inside = t && t.closest && t.closest('.nbm-dd');
    if (!inside) closeAllDD();
  });

  function boot() {
    if (init()) return;
    // navbar may mount late (component / async) — retry briefly
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (init() || tries > 40) clearInterval(iv);
    }, 150);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
