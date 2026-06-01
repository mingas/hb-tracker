/* HB Install Hint v1.0.0 — "Add to Home Screen" prompt, mobile-only, dismissible.
   SAFE layout: only inserts into vertical/block containers (hero column + tracker section),
   never into the flex-row .hb-quiz-container. Hosted via jsDelivr. */
(function () {
  try {
    if (location.pathname.toLowerCase().replace(/\/$/, '') !== '/hormone-quiz') return;

    function go() {
      try {
        var standalone =
          (window.matchMedia && matchMedia('(display-mode:standalone)').matches) ||
          navigator.standalone === true;
        if (standalone) return;
        try { if (localStorage.getItem('hb_ih_x') === '1') return; } catch (e) {}

        var ua = navigator.userAgent || '';
        var ios = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
        var android = /android/i.test(ua);
        if (!ios && !android) return;

        var steps = ios
          ? 'Tap the Share button, then “Add to Home Screen”.'
          : 'Open the browser menu (⋮), then “Add to Home screen”.';

        var iv = null;

        if (!document.getElementById('hb-ih-css')) {
          var st = document.createElement('style');
          st.id = 'hb-ih-css';
          st.textContent =
            '.hb-ih{position:relative;max-width:460px;margin:16px auto;padding:12px 36px 12px 14px;' +
            'background:#fff;border:1px solid #e4d9c6;border-left:4px solid #C97B5C;border-radius:12px;' +
            'box-sizing:border-box;font:13px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#4A4038}' +
            '.hb-ih b{display:block;margin-bottom:2px;color:#1A2A4A;font:600 15px/1.3 Georgia,serif}' +
            '.hb-ih .hb-ih-x{position:absolute;top:4px;right:8px;border:0;background:0;font-size:20px;' +
            'color:#9a8f80;cursor:pointer;line-height:1;padding:2px 6px}';
          document.head.appendChild(st);
        }

        function chip() {
          var d = document.createElement('div');
          d.className = 'hb-ih';
          d.innerHTML =
            '<b>📱 Use it like an app</b>' + steps +
            '<button class="hb-ih-x" aria-label="Dismiss">×</button>';
          d.querySelector('.hb-ih-x').onclick = function () {
            try { localStorage.setItem('hb_ih_x', '1'); } catch (e) {}
            if (iv) clearInterval(iv);
            var all = document.querySelectorAll('.hb-ih');
            for (var i = 0; i < all.length; i++) all[i].remove();
          };
          return d;
        }

        // (1) First screen: append inside the hero column (vertical flow — safe)
        var hero = document.querySelector('.hb-quiz-hero');
        if (hero && !hero.querySelector('.hb-ih')) hero.appendChild(chip());

        // (2) Daily logs: insert inside the tracker <section> (block flow), before #hb-tracker-root.
        function placeTracker() {
          var root = document.getElementById('hb-tracker-root');
          if (root && root.parentNode && root.parentNode.tagName === 'SECTION') {
            if (!root.parentNode.querySelector('.hb-ih')) root.parentNode.insertBefore(chip(), root);
            return true;
          }
          return false;
        }
        if (!placeTracker()) {
          var n = 0;
          iv = setInterval(function () { n++; if (placeTracker() || n > 20) clearInterval(iv); }, 400);
        }
      } catch (e) {}
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  } catch (e) {}
})();
