/* HB Install Hint v3 — STATIC in-content "Add to Home Screen" card (not a floating banner).
   Mobile-only, dismissible. Inserted as a sibling immediately AFTER #hb-tracker-root, so it
   sits in normal page flow (no position:fixed, no overlay) and survives tracker re-renders.
   This replaces the v2 fixed bottom banner that read like a popup ad. */
(function () {
  try {
    if (location.pathname.toLowerCase().replace(/\/$/, '') !== '/hormone-quiz') return;

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
      ? 'Tap the Share icon, then \u201CAdd to Home Screen.\u201D'
      : 'Tap the menu (\u22EE), then \u201CAdd to Home screen.\u201D';

    function injectCSS() {
      if (document.getElementById('hb-a2hs-css')) return;
      var css =
        '#hb-a2hs{position:relative;display:flex;align-items:flex-start;gap:12px;' +
        'margin:18px 0 6px;padding:16px 40px 16px 18px;box-sizing:border-box;' +
        'background:#FCF8F0;border:1px solid #EADFC8;border-left:4px solid #C97B5C;' +
        'border-radius:12px;font-family:inherit}' +
        '#hb-a2hs .hb-a2hs-ic{font-size:24px;line-height:1;flex:0 0 auto}' +
        '#hb-a2hs .hb-a2hs-tx{flex:1;min-width:0}' +
        '#hb-a2hs b{display:block;color:#1A2A4A;font:600 15px/1.3 Newsreader,Georgia,serif;margin-bottom:3px}' +
        '#hb-a2hs p{margin:0;font-size:13px;line-height:1.5;color:#5A5048}' +
        '#hb-a2hs .hb-a2hs-x{position:absolute;top:10px;right:10px;border:0;background:0;' +
        'color:#B8A98F;font-size:20px;line-height:1;cursor:pointer;padding:2px 6px}' +
        '@media(min-width:1025px){#hb-a2hs{display:none!important}}';
      var st = document.createElement('style');
      st.id = 'hb-a2hs-css';
      st.textContent = css;
      document.head.appendChild(st);
    }

    function build() {
      if (document.getElementById('hb-a2hs')) return true;
      var root = document.getElementById('hb-tracker-root');
      if (!root || !root.parentNode) return false;
      injectCSS();
      var card = document.createElement('div');
      card.id = 'hb-a2hs';
      card.innerHTML =
        '<span class="hb-a2hs-ic">\uD83D\uDCF1</span>' +
        '<span class="hb-a2hs-tx"><b>Keep your tracker one tap away</b>' +
        '<p>' + steps + ' It saves to your home screen and remembers your daily logs.</p></span>' +
        '<button class="hb-a2hs-x" type="button" aria-label="Dismiss">\u00D7</button>';
      root.parentNode.insertBefore(card, root.nextSibling);
      card.querySelector('.hb-a2hs-x').addEventListener('click', function () {
        try { localStorage.setItem('hb_a2hs_x', '1'); } catch (e) {}
        if (card.parentNode) card.parentNode.removeChild(card);
      });
      return true;
    }

    if (build()) return;
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (build() || tries > 40) clearInterval(iv);
    }, 500);
  } catch (e) {}
})();
