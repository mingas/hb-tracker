/* HB Install Hint v2 — fixed bottom "Add to Home Screen" banner.
   Mobile-only, dismissible. Robust: position:fixed, appended to <body>, with NO dependency
   on page layout/containers (fixes the in-content placement that stopped rendering). */
(function () {
  try {
    if (location.pathname.toLowerCase().replace(/\/$/, '') !== '/hormone-quiz') return;

    function go() {
      try {
        if (document.getElementById('hb-a2hs')) return; // idempotent

        var standalone =
          (window.matchMedia && matchMedia('(display-mode:standalone)').matches) ||
          navigator.standalone === true;
        if (standalone) return;

        try { if (localStorage.getItem('hb_a2hs_x') === '1') return; } catch (e) {}

        var ua = navigator.userAgent || '';
        var ios = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
        var android = /android/i.test(ua);
        if (!ios && !android) return;

        var steps = ios
          ? 'Tap Share, then \u201CAdd to Home Screen\u201D'
          : 'Tap menu (\u22EE), then \u201CAdd to Home screen\u201D';

        if (!document.getElementById('hb-a2hs-css')) {
          var css =
            '#hb-a2hs{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;' +
            'background:#0F1A2E;color:#F4ECDD;box-shadow:0 -6px 24px rgba(0,0,0,.28);' +
            'border-top:3px solid #C97B5C;box-sizing:border-box;' +
            'padding:12px 46px calc(12px + env(safe-area-inset-bottom)) 16px;' +
            'font:13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
            'display:flex;align-items:center;gap:10px;' +
            'transform:translateY(120%);transition:transform .35s ease}' +
            '#hb-a2hs.in{transform:translateY(0)}' +
            '#hb-a2hs .hb-a2hs-ic{font-size:22px;line-height:1;flex:0 0 auto}' +
            '#hb-a2hs b{display:block;color:#fff;font:600 14px/1.3 Georgia,serif;margin-bottom:1px}' +
            '#hb-a2hs .hb-a2hs-x{position:absolute;top:8px;right:10px;border:0;background:0;' +
            'color:#cdbfa9;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px}' +
            '@media(min-width:1025px){#hb-a2hs{display:none!important}}';
          var st = document.createElement('style');
          st.id = 'hb-a2hs-css';
          st.textContent = css;
          document.head.appendChild(st);
        }

        var bar = document.createElement('div');
        bar.id = 'hb-a2hs';
        bar.innerHTML =
          '<span class="hb-a2hs-ic">\uD83D\uDCF1</span>' +
          '<span><b>Use it like an app</b>' + steps + '</span>' +
          '<button class="hb-a2hs-x" type="button" aria-label="Dismiss">\u00D7</button>';
        document.body.appendChild(bar);

        // slide up after paint
        setTimeout(function () { bar.classList.add('in'); }, 80);

        bar.querySelector('.hb-a2hs-x').addEventListener('click', function () {
          try { localStorage.setItem('hb_a2hs_x', '1'); } catch (e) {}
          bar.classList.remove('in');
          setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 350);
        });
      } catch (e) {}
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  } catch (e) {}
})();
