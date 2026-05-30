/**
 * hb-tracker / v2 / tracker.js
 *
 * Daily Tracker — v1.6.2
 *   v1.6.2 — Fix About/FAQ collapse for Webflow's nested container structure.
 *            Use compareDocumentPosition to find paragraphs/Q&A across container divs
 *            instead of nextElementSibling which stops at container boundaries.
 *   v1.6.1 — Webflow-specific selectors.
 *   v1.6.0 — Returning user UX (compact bar + About/FAQ collapse + form-first)
 *   v1.5.2 — Past Month mode.
 *   v1.5.1 — True calendar month grid.
 *   v1.5.0 — Month navigator.
 *   v1.4.1 — Fix midnight transition + cycle history.
 *   v1.4.0 — Two-mode UX.
 *   v1.3.0 — Click-to-view past entries.
 *   v1.2.0 — 5-week heatmap calendar.
 *
 * @version 1.6.1
 * @license MIT
 */

(function() {
  'use strict';

  var STORAGE_KEY_ENTRIES = 'hb_tracker_entries';
  var STORAGE_KEY_STREAK  = 'hb_tracker_streak';
  var QUIZ_STORAGE_KEY    = 'hb_quiz_state';
  var ROOT_ID             = 'hb-tracker-root';
  var DATE_CHECK_INTERVAL_MS = 60000;
  var MAX_BACKWARD_OFFSET = -12;

  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS_LONG    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var HORMONE_TYPE_DISPLAY = {
    'cycle_surfer':              'Cycle Surfer',
    'estrogen_dominant':         'Estrogen Dominant',
    'progesterone_deficient':    'Progesterone Deficient',
    'perimenopause_transitioner':'Perimenopause Transitioner',
    'postmenopause_renewer':     'Postmenopause Renewer'
  };

  var state = {
    today: '',
    entries: {},
    streak: { current: 0, best: 0, last_log_date: null },
    hormoneType: null,
    currentEntry: null,
    saveJustSucceeded: false,
    selectedDayKey: null,
    viewMonthOffset: 0
  };

  var rootEl = null;
  var typeConfig = null;
  var dateCheckTimer = null;

  /* DATE HELPERS */

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function dateKeyForOffsetDays(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function dateKeyFromDate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function getTodayKey()     { return dateKeyForOffsetDays(0); }
  function getYesterdayKey() { return dateKeyForOffsetDays(-1); }

  function getFormattedDate() {
    var d = new Date();
    return DAYS_LONG[d.getDay()] + ', ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getDate();
  }

  function formatDateFromKey(dateKey) {
    var parts = dateKey.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return DAYS_LONG[d.getDay()] + ', ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getDate();
  }

  /* VIEW MONTH HELPERS */

  function getViewMonthYear() {
    var today = new Date();
    var d = new Date(today.getFullYear(), today.getMonth() + state.viewMonthOffset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }

  function getCalendarGrid(viewYM) {
    var firstDay = new Date(viewYM.year, viewYM.month, 1);
    var firstDayOfWeek = firstDay.getDay();
    var daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    var lastDay = new Date(viewYM.year, viewYM.month + 1, 0);
    var lastDayOfWeek = lastDay.getDay();
    var daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;

    var startDate = new Date(viewYM.year, viewYM.month, 1 - daysToSubtract);
    var endDate = new Date(viewYM.year, viewYM.month + 1, daysToAdd);

    var cells = [];
    var current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    var endTime = endDate.getTime();

    while (current.getTime() <= endTime) {
      cells.push({
        date: new Date(current.getFullYear(), current.getMonth(), current.getDate()),
        key: dateKeyFromDate(current),
        isInViewMonth: current.getMonth() === viewYM.month
      });
      current.setDate(current.getDate() + 1);
    }

    return cells;
  }

  function isViewingCurrentMonth() { return state.viewMonthOffset === 0; }
  function canNavigateBackward()   { return state.viewMonthOffset > MAX_BACKWARD_OFFSET; }
  function canNavigateForward()    { return state.viewMonthOffset < 0; }

  function navigateBackward() {
    if (!canNavigateBackward()) return;
    state.viewMonthOffset -= 1;
    state.selectedDayKey = null;
    renderTracker();
  }

  function navigateForward() {
    if (!canNavigateForward()) return;
    state.viewMonthOffset += 1;
    state.selectedDayKey = null;
    renderTracker();
  }

  function navigateToday() {
    state.viewMonthOffset = 0;
    state.selectedDayKey = null;
    renderTracker();
  }

  /* MIDNIGHT DETECTION */

  function buildCurrentEntryForToday() {
    var existingEntry = state.entries[state.today];
    if (existingEntry) {
      state.currentEntry = {
        energy: existingEntry.energy,
        sleep: existingEntry.sleep,
        cycle_day: existingEntry.cycle_day,
        symptoms: (existingEntry.symptoms || []).slice(),
        notes: existingEntry.notes || ''
      };
    } else {
      state.currentEntry = {
        energy: null, sleep: null, cycle_day: null, symptoms: [], notes: ''
      };
    }
  }

  function checkDateChange() {
    var newToday = getTodayKey();
    if (newToday !== state.today) {
      state.today = newToday;
      state.selectedDayKey = null;
      state.saveJustSucceeded = false;
      state.viewMonthOffset = 0;
      buildCurrentEntryForToday();
      renderTracker();
    }
  }

  /* STORAGE */

  function loadEntries() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (stored) state.entries = JSON.parse(stored) || {};
    } catch (e) { console.warn('HB Tracker: could not load entries', e); }
  }

  function saveEntries() {
    try { localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(state.entries)); }
    catch (e) { console.warn('HB Tracker: could not save entries', e); }
  }

  function loadStreak() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY_STREAK);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          state.streak.current = parsed.current || 0;
          state.streak.best = parsed.best || 0;
          state.streak.last_log_date = parsed.last_log_date || null;
        }
      }
    } catch (e) { console.warn('HB Tracker: could not load streak', e); }
  }

  function saveStreak() {
    try { localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(state.streak)); }
    catch (e) { console.warn('HB Tracker: could not save streak', e); }
  }

  function loadQuizHormoneType() {
    try {
      var stored = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && parsed.result && parsed.result.hormoneType) {
          state.hormoneType = parsed.result.hormoneType;
        }
      }
    } catch (e) { console.warn('HB Tracker: could not load quiz state', e); }
  }

  /* GA4 TRACKING */

  function trackEvent(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    } catch (e) {}
  }

  /* STREAK LOGIC */

  function maybeUpdateStreakOnNewLog() {
    var today = state.today;
    var yesterday = getYesterdayKey();

    if (state.streak.last_log_date === today) return null;

    if (state.streak.last_log_date === yesterday) {
      state.streak.current = (state.streak.current || 0) + 1;
    } else {
      state.streak.current = 1;
    }

    if (state.streak.current > (state.streak.best || 0)) {
      state.streak.best = state.streak.current;
    }
    state.streak.last_log_date = today;
    saveStreak();

    var milestones = [1, 3, 7, 14, 30, 60, 90];
    if (milestones.indexOf(state.streak.current) !== -1) {
      return state.streak.current;
    }
    return null;
  }

  /* ========================================
     PHASE 1: RETURNING USER MODE (v1.6.1 — CSS-only hiding, no DOM moving)
     ======================================== */

  function injectReturningUserStyles() {
    if (document.getElementById('hb-returning-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-returning-styles';
    style.textContent = ''
      // Hide Webflow hero + quiz root + placeholders for returning users
      + 'body.hb-returning .hb-eyebrow,'
      + 'body.hb-returning .hb-quiz-title,'
      + 'body.hb-returning .hb-quiz-subtitle,'
      + 'body.hb-returning #hb-quiz-root,'
      + 'body.hb-returning .hb-quiz-placeholder-title,'
      + 'body.hb-returning .hb-quiz-placeholder-text{display:none !important}'
      // Compact bar (rendered inside tracker, at top)
      + '.hb-compact-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#F4ECDD;border:1px solid #EBE0CC;border-radius:12px;margin:0 0 20px 0;font-family:inherit;gap:14px;box-sizing:border-box}'
      + '.hb-compact-bar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0;overflow:hidden}'
      + '.hb-compact-bar-label{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#5F5E5A;font-weight:600;flex-shrink:0}'
      + '.hb-compact-bar-type{font-size:14px;color:#1A2A4A;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:-0.01em}'
      + '.hb-compact-bar-retake{background:transparent;border:1px solid #C9C2AE;color:#1A2A4A;font-size:12px;font-weight:500;cursor:pointer;padding:7px 14px;border-radius:100px;font-family:inherit;transition:all 150ms;white-space:nowrap;flex-shrink:0}'
      + '.hb-compact-bar-retake:hover{background:#FFFFFF;border-color:#1A2A4A}'
      + '@media (max-width:479px){.hb-compact-bar{padding:11px 14px;gap:10px}.hb-compact-bar-label{display:none}.hb-compact-bar-type{font-size:13px}.hb-compact-bar-retake{font-size:11px;padding:6px 11px}}';
    document.head.appendChild(style);
  }

  // Smart fallback: turns any string into Title Case if not in display map
  function getHormoneTypeDisplay(raw) {
    if (!raw) return 'Quiz result';
    if (HORMONE_TYPE_DISPLAY[raw]) return HORMONE_TYPE_DISPLAY[raw];
    return String(raw)
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
      .join(' ');
  }

  function applyReturningUserMode(retries) {
    retries = retries || 0;
    if (!document.body || !document.body.classList) {
      if (retries < 20) setTimeout(function() { applyReturningUserMode(retries + 1); }, 50);
      return;
    }
    document.body.classList.add('hb-returning');
  }

  function renderCompactBar() {
    var typeName = getHormoneTypeDisplay(state.hormoneType);
    var labelSpan = el('span', { class: 'hb-compact-bar-label' }, 'Hormone Type');
    var typeSpan = el('span', { class: 'hb-compact-bar-type' }, typeName);
    var leftDiv = el('div', { class: 'hb-compact-bar-left' }, [labelSpan, typeSpan]);
    var retakeBtn = el('button', {
      class: 'hb-compact-bar-retake',
      type: 'button',
      'aria-label': 'Retake the quiz, current result will be replaced',
      onclick: function() {
        var ok = typeof window.confirm === 'function'
          ? window.confirm('Retake the quiz? Your hormone type result will be replaced. Your tracker entries are NOT affected.')
          : true;
        if (!ok) return;
        try { localStorage.removeItem(QUIZ_STORAGE_KEY); } catch (e) {}
        trackEvent('compact_bar_retake', { hormone_type: state.hormoneType });
        location.reload();
      }
    }, 'Retake →');
    return el('div', { class: 'hb-compact-bar' }, [leftDiv, retakeBtn]);
  }

  /* ========================================
     PHASE 2: ABOUT / FAQ COLLAPSE (v1.6.1 — Webflow-specific selectors)
     ======================================== */

  function injectCollapseStyles() {
    if (document.getElementById('hb-collapse-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-collapse-styles';
    style.textContent = ''
      + '.hb-collapsed{display:none !important}'
      + '.hb-collapse-toggle{display:inline-block;margin:14px 0 4px 0;background:transparent;border:1px solid #C9C2AE;color:#1A2A4A;font-size:12px;font-weight:500;padding:7px 16px;border-radius:100px;cursor:pointer;font-family:inherit;transition:all 150ms;letter-spacing:0.2px}'
      + '.hb-collapse-toggle:hover{background:#F4ECDD;border-color:#1A2A4A}'
      + '.hb-collapse-toggle:focus-visible{outline:2px solid #C97B5C;outline-offset:2px}';
    document.head.appendChild(style);
  }

  function addCollapseToggle(anchorEl, hiddenElements, sectionName) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hb-collapse-toggle';
    btn.textContent = 'Show more ↓';
    btn.setAttribute('aria-expanded', 'false');
    var isOpen = false;
    btn.addEventListener('click', function() {
      isOpen = !isOpen;
      hiddenElements.forEach(function(el) {
        if (isOpen) el.classList.remove('hb-collapsed');
        else el.classList.add('hb-collapsed');
      });
      btn.textContent = isOpen ? 'Show less ↑' : 'Show more ↓';
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      trackEvent('content_collapse_toggle', { section: sectionName, opened: isOpen });
    });
    if (anchorEl.parentNode) {
      anchorEl.parentNode.insertBefore(btn, anchorEl.nextSibling);
    }
  }

  // Helper: check if element B comes AFTER element A in DOM order
  function isAfter(a, b) {
    if (!a || !b || !a.compareDocumentPosition) return false;
    return !!(a.compareDocumentPosition(b) & 4); // DOCUMENT_POSITION_FOLLOWING
  }

  // Helper: check if element B comes BEFORE element A in DOM order
  function isBefore(a, b) {
    if (!a || !b || !a.compareDocumentPosition) return false;
    return !!(a.compareDocumentPosition(b) & 2); // DOCUMENT_POSITION_PRECEDING
  }

  // Helper: skip elements inside tracker or quiz roots
  function isInsideAppRoots(el) {
    if (rootEl && rootEl.contains(el)) return true;
    var quizRoot = document.getElementById('hb-quiz-root');
    if (quizRoot && quizRoot.contains(el)) return true;
    return false;
  }

  // Collapse About section: keep heading + first <p> visible, hide rest
  // Uses DOM position comparison to find <p> elements across container divs
  function collapseAboutSection(heading, faqHeading) {
    if (heading.dataset && heading.dataset.hbCollapsed === '1') return false;

    // Find all <p> elements AFTER heading (and BEFORE faq heading if exists)
    var allParas = document.querySelectorAll('p');
    var paragraphs = [];
    for (var i = 0; i < allParas.length; i++) {
      var p = allParas[i];
      if (!isAfter(heading, p)) continue;
      if (faqHeading && !isBefore(faqHeading, p)) continue;
      // Skip eyebrows, FAQ answers, tracker/quiz internals
      if (p.classList.contains('hb-seo-eyebrow')) continue;
      if (p.classList.contains('hb-faq-eyebrow')) continue;
      if (p.classList.contains('hb-faq-answer')) continue;
      if (p.classList.contains('hb-footer-brand')) continue;
      if (p.classList.contains('hb-footer-tagline')) continue;
      if (isInsideAppRoots(p)) continue;
      paragraphs.push(p);
    }

    if (paragraphs.length <= 1) return false;

    var hidden = paragraphs.slice(1);
    hidden.forEach(function(p) { p.classList.add('hb-collapsed'); });
    if (heading.dataset) heading.dataset.hbCollapsed = '1';
    addCollapseToggle(paragraphs[0], hidden, 'About');
    return true;
  }

  // Collapse FAQ section: keep heading + first Q+A pair visible, hide rest
  function collapseFAQSection(heading) {
    if (heading.dataset && heading.dataset.hbCollapsed === '1') return false;

    // Find all Q+A items AFTER heading in DOM order
    var allItems = document.querySelectorAll('.hb-faq-question, .hb-faq-answer');
    var items = [];
    for (var i = 0; i < allItems.length; i++) {
      var el = allItems[i];
      if (!isAfter(heading, el)) continue;
      if (isInsideAppRoots(el)) continue;
      items.push(el);
    }

    if (items.length <= 2) return false;

    var hidden = items.slice(2);
    hidden.forEach(function(el) { el.classList.add('hb-collapsed'); });
    if (heading.dataset) heading.dataset.hbCollapsed = '1';
    addCollapseToggle(items[1], hidden, 'FAQ');
    return true;
  }

  // Generic fallback: match h1-h6 by text content (for non-Webflow pages)
  function matchesCollapseHeading(text) {
    var t = (text || '').trim().toLowerCase();
    if (!t) return false;
    if (t === 'about' || t === 'about the assessment' || t === 'about this assessment') return true;
    if (t === 'faq' || t === 'faqs' || t === 'frequently asked questions') return true;
    return false;
  }

  function applyAboutFAQCollapse(retries) {
    retries = retries || 0;
    var aboutHeading = document.querySelector('.hb-seo-title');
    var faqHeading = document.querySelector('.hb-faq-title');

    // Retry if headings not yet in DOM
    if (!aboutHeading && !faqHeading && retries < 10) {
      setTimeout(function() { applyAboutFAQCollapse(retries + 1); }, 200);
      return 0;
    }

    var collapsed = 0;
    if (aboutHeading) {
      if (collapseAboutSection(aboutHeading, faqHeading)) collapsed++;
    }
    if (faqHeading) {
      if (collapseFAQSection(faqHeading)) collapsed++;
    }

    // Generic fallback: if Webflow classes not found, try h1-h6 text match
    if (collapsed === 0) {
      var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (rootEl && rootEl.contains(h)) continue;
        var quizRoot = document.getElementById('hb-quiz-root');
        if (quizRoot && quizRoot.contains(h)) continue;
        if (matchesCollapseHeading(h.textContent)) {
          if (collapseAboutSection(h)) collapsed++;
        }
      }
    }

    return collapsed;
  }

  /* INJECT STYLES */

  function injectExtraStyles() {
    if (document.getElementById('hb-tracker-extra-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-tracker-extra-styles';
    style.textContent = ''
      + '.hb-tracker-heatmap-wrap{background:#FFFFFF;border:1px solid #E8E2D3;border-radius:12px;padding:18px 20px}'
      + '.hb-tracker-cal-nav{display:flex;align-items:center;gap:10px;margin-bottom:14px}'
      + '.hb-tracker-cal-nav-btn{width:32px;height:32px;border-radius:50%;background:#FFFFFF;border:1px solid #E8E2D3;color:#1A2A4A;font-size:18px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;line-height:1;transition:all 150ms;flex-shrink:0;padding:0}'
      + '.hb-tracker-cal-nav-btn:hover:not(:disabled){background:#F1EFE8;border-color:#C9C2AE}'
      + '.hb-tracker-cal-nav-btn:disabled{opacity:0.3;cursor:not-allowed}'
      + '.hb-tracker-cal-nav-title{font-family:Newsreader,Georgia,serif;font-size:18px;color:#1A2A4A;font-weight:500;flex:1;text-align:center;letter-spacing:-0.01em}'
      + '.hb-tracker-cal-nav-today{padding:7px 14px;background:#1A2A4A;color:#FFFFFF;border:none;border-radius:100px;font-size:11px;font-weight:500;cursor:pointer;font-family:inherit;transition:background 150ms;flex-shrink:0;letter-spacing:0.3px}'
      + '.hb-tracker-cal-nav-today:hover{background:#0A1A3A}'
      + '.hb-tracker-heatmap-labels{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px}'
      + '.hb-tracker-heatmap-labels span{font-size:10px;color:#8B928E;text-align:center;font-weight:600;letter-spacing:0.5px}'
      + '.hb-tracker-heatmap-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}'
      + '.hb-tracker-heatmap-cell{aspect-ratio:1;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#8B928E;background:#F1EFE8;cursor:default;transition:transform 100ms,opacity 100ms;border:none;padding:0;font-family:inherit}'
      + '.hb-tracker-heatmap-cell.is-clickable{cursor:pointer}'
      + '.hb-tracker-heatmap-cell.is-clickable:hover{transform:scale(1.08)}'
      + '.hb-tracker-heatmap-cell.is-spillover{opacity:0.35}'
      + '.hb-tracker-heatmap-cell.is-spillover.is-clickable:hover{opacity:0.7}'
      + '.hb-tracker-heatmap-cell.is-empty{background:#F1EFE8;color:#A8A39A}'
      + '.hb-tracker-heatmap-cell.is-future{background:#FAF6EE;color:#D9D2C2}'
      + '.hb-tracker-heatmap-cell.is-logged-e1{background:#F2C2A8;color:#5A3A1E;font-weight:500}'
      + '.hb-tracker-heatmap-cell.is-logged-e2{background:#EDA98C;color:#FFFFFF;font-weight:500}'
      + '.hb-tracker-heatmap-cell.is-logged-e3{background:#DC9A75;color:#FFFFFF;font-weight:500}'
      + '.hb-tracker-heatmap-cell.is-logged-e4{background:#C97B5C;color:#FFFFFF;font-weight:500}'
      + '.hb-tracker-heatmap-cell.is-logged-e5{background:#B86E51;color:#FFFFFF;font-weight:600}'
      + '.hb-tracker-heatmap-cell.is-today{outline:2.5px solid #1A2A4A;outline-offset:1px;font-weight:600;opacity:1}'
      + '.hb-tracker-heatmap-cell.is-selected{outline:2.5px dashed #C97B5C;outline-offset:1px;font-weight:600;opacity:1}'
      + '.hb-tracker-heatmap-legend{display:flex;align-items:center;gap:10px;margin-top:14px;padding-top:14px;border-top:0.5px solid #EBE0CC;flex-wrap:wrap}'
      + '.hb-tracker-heatmap-legend-label{font-size:11px;color:#8B928E;font-weight:500}'
      + '.hb-tracker-heatmap-legend-swatches{display:flex;gap:3px;align-items:center}'
      + '.hb-tracker-heatmap-legend-swatch{width:11px;height:11px;border-radius:2px}'
      + '.hb-tracker-heatmap-legend-text{font-size:10px;color:#8B928E;margin:0 6px 0 4px}'
      + '.hb-tracker-pastview-hint{font-size:12px;color:#5F5E5A;text-align:center;margin:0 0 -4px 0;padding:8px 14px;background:#FDFBF6;border:1px dashed #C97B5C;border-radius:8px;line-height:1.5}'
      + '.hb-tracker-pastview-hint strong{color:#C97B5C}'
      + '.hb-tracker-selected-day{background:#FDFBF6;border:1px solid #E8E2D3;border-radius:12px;padding:20px 22px}'
      + '.hb-tracker-selected-day-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px}'
      + '.hb-tracker-selected-day-eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;color:#C97B5C;margin:0 0 4px 0}'
      + '.hb-tracker-selected-day-date{font-family:Newsreader,Georgia,serif;font-size:20px;color:#1A2A4A;font-weight:500;margin:0;line-height:1.3}'
      + '.hb-tracker-selected-day-close{flex-shrink:0;background:#FFFFFF;border:1px solid #E8E2D3;color:#5F5E5A;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;line-height:1;transition:all 150ms}'
      + '.hb-tracker-selected-day-close:hover{background:#F1EFE8;color:#1A2A4A;border-color:#C9C2AE}'
      + '.hb-tracker-selected-day-empty{font-size:14px;color:#8B928E;margin:14px 0;text-align:center;padding:24px 0;font-style:italic;background:#FFFFFF;border-radius:8px;border:1px dashed #E8E2D3}'
      + '.hb-tracker-selected-day-row{display:flex;justify-content:space-between;align-items:baseline;padding:10px 0;border-bottom:0.5px solid #EBE0CC;gap:12px}'
      + '.hb-tracker-selected-day-row:last-of-type{border-bottom:none}'
      + '.hb-tracker-selected-day-row.is-vertical{flex-direction:column;align-items:flex-start;gap:6px}'
      + '.hb-tracker-selected-day-label{font-size:12px;color:#5F5E5A;font-weight:500;flex-shrink:0}'
      + '.hb-tracker-selected-day-value{font-size:14px;color:#1A2A4A;text-align:right;font-weight:500}'
      + '.hb-tracker-selected-day-value.is-mono{font-variant-numeric:tabular-nums}'
      + '.hb-tracker-selected-day-chips{display:flex;flex-wrap:wrap;gap:5px;justify-content:flex-end}'
      + '.hb-tracker-selected-day-chip{display:inline-block;font-size:11px;color:#1A2A4A;background:#F4ECDD;border:1px solid #EBE0CC;border-radius:100px;padding:3px 10px;font-weight:500}'
      + '.hb-tracker-selected-day-notes{font-size:13px;color:#3A4555;line-height:1.55;font-style:italic;padding:8px 12px;background:#FFFFFF;border-left:2px solid #C97B5C;border-radius:0 4px 4px 0;margin:0}'
      + '.hb-tracker-selected-day-return{margin-top:18px;padding:12px 18px;background:#1A2A4A;color:#FFFFFF;border:none;border-radius:100px;font-size:13px;font-weight:500;cursor:pointer;width:100%;font-family:inherit;transition:background 150ms}'
      + '.hb-tracker-selected-day-return:hover{background:#0A1A3A}'
      + '.hb-tracker-journey{background:#F4ECDD;border-radius:12px;padding:20px 22px;border:1px solid #EBE0CC}'
      + '.hb-tracker-journey-eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;color:#C97B5C;margin:0 0 6px 0}'
      + '.hb-tracker-journey-title{font-family:Newsreader,Georgia,serif;font-size:20px;color:#1A2A4A;margin:0 0 10px 0;font-weight:500;letter-spacing:-0.01em;line-height:1.3}'
      + '.hb-tracker-journey-explainer{font-size:13px;color:#5F5E5A;margin:0 0 18px 0;line-height:1.55}'
      + '.hb-tracker-journey-list{display:flex;flex-direction:column;gap:10px;position:relative;padding-left:2px}'
      + '.hb-tracker-journey-list::before{content:"";position:absolute;left:11px;top:14px;bottom:14px;width:1.5px;background:#D9CFB5;z-index:0}'
      + '.hb-tracker-journey-item{display:flex;align-items:flex-start;gap:12px;position:relative;z-index:1}'
      + '.hb-tracker-journey-dot{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#FFFFFF;border:1.5px solid #C9C2AE;display:flex;align-items:center;justify-content:center;font-size:11px;color:#8B928E;font-weight:600;margin-top:0}'
      + '.hb-tracker-journey-item.is-unlocked .hb-tracker-journey-dot{background:#085041;border-color:#085041;color:#FFFFFF}'
      + '.hb-tracker-journey-item.is-active .hb-tracker-journey-dot{background:#C97B5C;border-color:#C97B5C;color:#FFFFFF}'
      + '.hb-tracker-journey-text{flex:1;padding-top:1px}'
      + '.hb-tracker-journey-label{font-size:13px;font-weight:500;color:#1A2A4A;margin:0 0 2px 0}'
      + '.hb-tracker-journey-item.is-unlocked .hb-tracker-journey-label{color:#085041}'
      + '.hb-tracker-journey-item.is-active .hb-tracker-journey-label{color:#C97B5C}'
      + '.hb-tracker-journey-desc{font-size:12px;color:#5F5E5A;margin:0;line-height:1.45}'
      + '.hb-tracker-divider{height:0.5px;background:#EBE0CC;margin:28px 0 20px 0;border:none}'
      + '.hb-tracker-section-eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;color:#8B928E;margin:0 0 14px 0;text-align:center}'
      + '@media(max-width:479px){.hb-tracker-cal-nav-title{font-size:16px}.hb-tracker-cal-nav-today{padding:6px 11px;font-size:10px}.hb-tracker-selected-day-row{flex-direction:column;align-items:flex-start;gap:4px}.hb-tracker-selected-day-value{text-align:left}.hb-tracker-selected-day-chips{justify-content:flex-start}.hb-tracker-divider{margin:24px 0 16px 0}}';
    document.head.appendChild(style);
  }

  /* DOM HELPER */

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function(k) {
        var v = props[k];
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'style') node.setAttribute('style', v);
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        }
        else if (k === 'disabled' || k === 'value' || k === 'type' || k === 'id' || k === 'min' || k === 'max' || k === 'step' || k === 'placeholder' || k === 'maxLength' || k === 'href') {
          node[k] = v;
        }
        else node.setAttribute(k, v);
      });
    }
    if (children) {
      var arr = Array.isArray(children) ? children : [children];
      arr.forEach(function(c) {
        if (c == null) return;
        if (typeof c === 'string' || typeof c === 'number') {
          node.appendChild(document.createTextNode(String(c)));
        } else {
          node.appendChild(c);
        }
      });
    }
    return node;
  }

  function clearRoot() {
    while (rootEl.firstChild) rootEl.removeChild(rootEl.firstChild);
  }

  /* NO-QUIZ PROMPT */

  function renderNoQuizPrompt() {
    clearRoot();
    var prompt = el('div', { class: 'hb-tracker-quiz-prompt' }, [
      el('div', { class: 'hb-tracker-quiz-prompt-icon' }, '🧭'),
      el('h2', { class: 'hb-tracker-quiz-prompt-title' }, "First, let's find your hormone type"),
      el('p', { class: 'hb-tracker-quiz-prompt-desc' }, 'The Daily Tracker personalizes itself based on your hormone type. Take the free 3-minute quiz first.'),
      el('a', { class: 'hb-tracker-quiz-prompt-cta', href: '/hormone-quiz' }, 'Take the quiz →')
    ]);
    rootEl.appendChild(el('div', { class: 'hb-tracker' }, [prompt]));
  }

  var CHECK_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  /* HEADER */

  function renderHeader() {
    var current = state.streak.current || 0;
    var best = state.streak.best || 0;

    var streakBadge = el('div', {
      class: 'hb-tracker-streak-badge' + (current === 0 ? ' is-zero' : '')
    }, [
      el('span', { class: 'hb-tracker-streak-icon' }, current > 0 ? '🔥' : '○'),
      el('span', null, current === 0 ? 'No streak yet' : (current + '-day streak'))
    ]);

    var streakRowChildren = [streakBadge];
    if (best > current && best > 0) {
      streakRowChildren.push(el('span', { class: 'hb-tracker-streak-best' }, 'Best: ' + best));
    }

    return el('div', { class: 'hb-tracker-header' }, [
      el('p', { class: 'hb-tracker-date' }, getFormattedDate()),
      el('h1', { class: 'hb-tracker-welcome' }, typeConfig.welcomeMessage),
      el('div', { class: 'hb-tracker-streak-row' }, streakRowChildren)
    ]);
  }

  /* LOGGED TODAY BANNER */

  function renderLoggedTodayBanner() {
    var title = state.saveJustSucceeded ? 'Logged for today ✓' : "You've already logged today";
    var desc = state.saveJustSucceeded
      ? 'Your entry is saved. Come back tomorrow to keep building your data.'
      : 'You can update your entry any time today.';
    return el('div', { class: 'hb-tracker-logged-today' }, [
      el('div', { class: 'hb-tracker-logged-icon', html: CHECK_ICON_SVG }),
      el('div', { class: 'hb-tracker-logged-text' }, [
        el('p', { class: 'hb-tracker-logged-title' }, title),
        el('p', { class: 'hb-tracker-logged-desc' }, desc)
      ])
    ]);
  }

  /* PAST-DAY HINT */

  function renderPastDayHint() {
    return el('p', { class: 'hb-tracker-pastview-hint' }, [
      'Viewing a past day. Tap ',
      el('strong', null, '×'),
      ' to close, or ',
      el('strong', null, 'Return'),
      ' to go to today.'
    ]);
  }

  /* PAST-MONTH HINT */

  function renderPastMonthHint() {
    var viewYM = getViewMonthYear();
    var monthYear = MONTHS_LONG[viewYM.month] + ' ' + viewYM.year;
    return el('p', { class: 'hb-tracker-pastview-hint' }, [
      'Viewing ',
      el('strong', null, monthYear),
      '. Click a day for details, or ',
      el('strong', null, 'Today'),
      ' to return.'
    ]);
  }

  /* DIVIDER (NEW v1.6.0) */

  function renderDivider() {
    return el('hr', { class: 'hb-tracker-divider' });
  }

  function renderHistorySectionEyebrow() {
    return el('p', { class: 'hb-tracker-section-eyebrow' }, 'Your history');
  }

  /* CALENDAR NAVIGATION */

  function renderCalendarNavigation() {
    var viewYM = getViewMonthYear();
    var titleText = MONTHS_LONG[viewYM.month] + ' ' + viewYM.year;

    var backDisabled = !canNavigateBackward();
    var fwdDisabled = !canNavigateForward();

    var backBtn = el('button', {
      class: 'hb-tracker-cal-nav-btn',
      type: 'button',
      'aria-label': 'View previous month',
      title: backDisabled ? '12 months back limit' : 'Previous month',
      disabled: backDisabled,
      onclick: navigateBackward
    }, '‹');

    var fwdBtn = el('button', {
      class: 'hb-tracker-cal-nav-btn',
      type: 'button',
      'aria-label': 'View next month',
      title: fwdDisabled ? 'Already at current month' : 'Next month',
      disabled: fwdDisabled,
      onclick: navigateForward
    }, '›');

    var titleEl = el('span', { class: 'hb-tracker-cal-nav-title' }, titleText);

    var children = [backBtn, titleEl, fwdBtn];

    if (!isViewingCurrentMonth()) {
      var todayBtn = el('button', {
        class: 'hb-tracker-cal-nav-today',
        type: 'button',
        'aria-label': 'Return to current month',
        onclick: navigateToday
      }, 'Today');
      children.push(todayBtn);
    }

    return el('div', { class: 'hb-tracker-cal-nav' }, children);
  }

  /* HEATMAP CALENDAR */

  function renderHeatmapCalendar() {
    var viewYM = getViewMonthYear();
    var gridCells = getCalendarGrid(viewYM);

    var todayKey = state.today;
    var today = new Date();
    var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    var grid = el('div', { class: 'hb-tracker-heatmap-grid' });

    gridCells.forEach(function(cell) {
      var cellDate = cell.date;
      var cellKey = cell.key;
      var isInMonth = cell.isInViewMonth;
      var dayNum = cellDate.getDate();
      var isToday = cellKey === todayKey;
      var isFuture = cellDate.getTime() > todayMidnight;
      var entry = state.entries[cellKey];
      var isSelected = state.selectedDayKey === cellKey;
      var isClickable = !isFuture;

      var classes = 'hb-tracker-heatmap-cell';
      if (isClickable) classes += ' is-clickable';
      if (!isInMonth) classes += ' is-spillover';
      if (isToday) classes += ' is-today';
      if (isSelected) classes += ' is-selected';
      if (isFuture) {
        classes += ' is-future';
      } else if (entry && entry.energy) {
        classes += ' is-logged-e' + entry.energy;
      } else {
        classes += ' is-empty';
      }

      var tooltipText = MONTHS_SHORT[cellDate.getMonth()] + ' ' + dayNum + ', ' + cellDate.getFullYear();
      if (entry) tooltipText += ' — Energy ' + entry.energy + '/5';
      else if (isToday) tooltipText += ' — Today (no log yet)';
      else if (isFuture) tooltipText += ' — Future';
      else tooltipText += ' — No log';

      (function(cellKeyClosure, isClickableClosure) {
        var props = {
          class: classes,
          type: 'button',
          title: tooltipText
        };
        if (isClickableClosure) {
          props.onclick = function() { handleDayClick(cellKeyClosure); };
        } else {
          props.disabled = true;
        }
        grid.appendChild(el('button', props, String(dayNum)));
      })(cellKey, isClickable);
    });

    var dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    var labelsRow = el('div', { class: 'hb-tracker-heatmap-labels' });
    dayLabels.forEach(function(label) {
      labelsRow.appendChild(el('span', null, label));
    });

    var legendSwatches = el('div', { class: 'hb-tracker-heatmap-legend-swatches' }, [
      el('div', { class: 'hb-tracker-heatmap-legend-swatch', style: 'background:#F1EFE8' }),
      el('span', { class: 'hb-tracker-heatmap-legend-text' }, 'none'),
      el('div', { class: 'hb-tracker-heatmap-legend-swatch', style: 'background:#F2C2A8' }),
      el('div', { class: 'hb-tracker-heatmap-legend-swatch', style: 'background:#DC9A75' }),
      el('div', { class: 'hb-tracker-heatmap-legend-swatch', style: 'background:#C97B5C' }),
      el('div', { class: 'hb-tracker-heatmap-legend-swatch', style: 'background:#B86E51' }),
      el('span', { class: 'hb-tracker-heatmap-legend-text' }, 'high energy')
    ]);

    var legend = el('div', { class: 'hb-tracker-heatmap-legend' }, [
      el('span', { class: 'hb-tracker-heatmap-legend-label' }, 'Energy:'),
      legendSwatches
    ]);

    return el('div', { class: 'hb-tracker-heatmap-wrap' }, [
      renderCalendarNavigation(),
      labelsRow,
      grid,
      legend
    ]);
  }

  /* DAY CLICK HANDLER */

  function handleDayClick(dateKey) {
    if (dateKey === state.today) {
      state.selectedDayKey = null;
      state.viewMonthOffset = 0;
    } else {
      if (state.selectedDayKey === dateKey) {
        state.selectedDayKey = null;
      } else {
        state.selectedDayKey = dateKey;
      }
    }
    renderTracker();

    if (state.selectedDayKey && state.selectedDayKey !== state.today) {
      setTimeout(function() {
        var panel = rootEl.querySelector('.hb-tracker-selected-day');
        if (panel && panel.scrollIntoView) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  }

  /* SELECTED DAY PANEL */

  function renderSelectedDayPanel() {
    if (!state.selectedDayKey) return null;
    if (state.selectedDayKey === state.today) return null;

    var entry = state.entries[state.selectedDayKey];
    var dateStr = formatDateFromKey(state.selectedDayKey);

    var closeBtn = el('button', {
      class: 'hb-tracker-selected-day-close',
      type: 'button',
      title: 'Close panel (stay on this month)',
      'aria-label': 'Close past day view, stay on current month',
      onclick: function() {
        state.selectedDayKey = null;
        renderTracker();
      }
    }, '×');

    var header = el('div', { class: 'hb-tracker-selected-day-header' }, [
      el('div', null, [
        el('p', { class: 'hb-tracker-selected-day-eyebrow' }, 'Selected day'),
        el('h3', { class: 'hb-tracker-selected-day-date' }, dateStr)
      ]),
      closeBtn
    ]);

    var returnBtn = el('button', {
      class: 'hb-tracker-selected-day-return',
      type: 'button',
      'aria-label': 'Close panel and return to current month',
      onclick: function() {
        state.selectedDayKey = null;
        state.viewMonthOffset = 0;
        renderTracker();
      }
    }, '← Return to today');

    var content;

    if (!entry) {
      content = el('p', { class: 'hb-tracker-selected-day-empty' }, 'No log for this day.');
    } else {
      var rows = [];

      var energyEmoji = (HB_TRACKER_DATA.fields.energy.emoji[entry.energy - 1]) || '';
      var energyLabel = (HB_TRACKER_DATA.fields.energy.labels[entry.energy - 1]) || '';
      rows.push(el('div', { class: 'hb-tracker-selected-day-row' }, [
        el('span', { class: 'hb-tracker-selected-day-label' }, 'Energy'),
        el('span', { class: 'hb-tracker-selected-day-value is-mono' }, energyEmoji + ' ' + entry.energy + '/5 · ' + energyLabel)
      ]));

      if (entry.sleep != null) {
        rows.push(el('div', { class: 'hb-tracker-selected-day-row' }, [
          el('span', { class: 'hb-tracker-selected-day-label' }, 'Sleep'),
          el('span', { class: 'hb-tracker-selected-day-value is-mono' }, entry.sleep + 'h')
        ]));
      }

      if (entry.cycle_day != null) {
        rows.push(el('div', { class: 'hb-tracker-selected-day-row' }, [
          el('span', { class: 'hb-tracker-selected-day-label' }, 'Cycle day'),
          el('span', { class: 'hb-tracker-selected-day-value is-mono' }, 'Day ' + entry.cycle_day)
        ]));
      }

      if (entry.symptoms && entry.symptoms.length > 0) {
        var chipsEl = el('div', { class: 'hb-tracker-selected-day-chips' });
        entry.symptoms.forEach(function(symValue) {
          var symObj = HB_TRACKER_DATA.allSymptoms.filter(function(s) { return s.value === symValue; })[0];
          var label = symObj ? symObj.label : symValue;
          chipsEl.appendChild(el('span', { class: 'hb-tracker-selected-day-chip' }, label));
        });
        rows.push(el('div', { class: 'hb-tracker-selected-day-row' }, [
          el('span', { class: 'hb-tracker-selected-day-label' }, 'Symptoms'),
          chipsEl
        ]));
      } else {
        rows.push(el('div', { class: 'hb-tracker-selected-day-row' }, [
          el('span', { class: 'hb-tracker-selected-day-label' }, 'Symptoms'),
          el('span', { class: 'hb-tracker-selected-day-value' }, 'None logged')
        ]));
      }

      if (entry.notes && entry.notes.length > 0) {
        rows.push(el('div', { class: 'hb-tracker-selected-day-row is-vertical' }, [
          el('span', { class: 'hb-tracker-selected-day-label' }, 'Notes'),
          el('p', { class: 'hb-tracker-selected-day-notes' }, entry.notes)
        ]));
      }

      content = el('div', null, rows);
    }

    return el('div', { class: 'hb-tracker-selected-day' }, [header, content, returnBtn]);
  }

  /* JOURNEY PROGRESS */

  function renderJourneyProgress() {
    var totalLogs = Object.keys(state.entries).length;

    var milestones = [
      { day: 1,  label: 'Day 1',  desc: 'Get started' },
      { day: 3,  label: 'Day 3',  desc: 'First patterns appear' },
      { day: 7,  label: 'Day 7',  desc: 'Weekly insights' },
      { day: 14, label: 'Day 14', desc: 'Cycle pattern detection' },
      { day: 30, label: 'Day 30', desc: 'Full hormone roadmap' }
    ];

    var nextMilestone = null;
    for (var i = 0; i < milestones.length; i++) {
      if (totalLogs < milestones[i].day) {
        nextMilestone = milestones[i];
        break;
      }
    }

    var headerText = '';
    if (totalLogs === 0) {
      headerText = 'Why do this every day?';
    } else if (nextMilestone) {
      var diff = nextMilestone.day - totalLogs;
      headerText = diff + ' more day' + (diff === 1 ? '' : 's') + ' to ' + nextMilestone.desc.toLowerCase();
    } else {
      headerText = 'Your full picture is unlocked';
    }

    var stepEls = milestones.map(function(m) {
      var unlocked = totalLogs >= m.day;
      var active = nextMilestone && m.day === nextMilestone.day;

      var classes = 'hb-tracker-journey-item';
      if (unlocked) classes += ' is-unlocked';
      if (active) classes += ' is-active';

      return el('div', { class: classes }, [
        el('div', { class: 'hb-tracker-journey-dot' }, unlocked ? '✓' : ''),
        el('div', { class: 'hb-tracker-journey-text' }, [
          el('p', { class: 'hb-tracker-journey-label' }, m.label),
          el('p', { class: 'hb-tracker-journey-desc' }, m.desc)
        ])
      ]);
    });

    return el('div', { class: 'hb-tracker-journey' }, [
      el('p', { class: 'hb-tracker-journey-eyebrow' }, 'YOUR JOURNEY'),
      el('h3', { class: 'hb-tracker-journey-title' }, headerText),
      el('p', { class: 'hb-tracker-journey-explainer' }, "Each log adds evidence about how your hormones actually behave. Patterns emerge in 1–4 weeks. You'll see what triggers symptoms — and what doesn't."),
      el('div', { class: 'hb-tracker-journey-list' }, stepEls)
    ]);
  }

  /* FIELDS */

  function renderEnergyField() {
    var fieldDef = HB_TRACKER_DATA.fields.energy;
    var current = state.currentEntry.energy;

    var emojiRow = el('div', { class: 'hb-tracker-scale-emoji-row' });
    fieldDef.emoji.forEach(function(e) {
      emojiRow.appendChild(el('span', null, e));
    });

    var buttonsRow = el('div', { class: 'hb-tracker-scale-buttons' });
    for (var i = fieldDef.min; i <= fieldDef.max; i++) {
      (function(val) {
        var isSelected = current === val;
        buttonsRow.appendChild(el('button', {
          class: 'hb-tracker-scale-btn' + (isSelected ? ' is-selected' : ''),
          type: 'button',
          onclick: function() {
            state.currentEntry.energy = val;
            renderTracker();
          }
        }, String(val)));
      })(i);
    }

    var labelText = '';
    if (current != null && fieldDef.labels) {
      labelText = fieldDef.labels[current - fieldDef.min] || '';
    }

    return el('div', { class: 'hb-tracker-field' }, [
      el('p', { class: 'hb-tracker-field-label' }, fieldDef.label),
      el('div', { class: 'hb-tracker-scale' }, [
        emojiRow, buttonsRow,
        el('p', { class: 'hb-tracker-scale-label' }, labelText)
      ])
    ]);
  }

  function renderSleepField() {
    var fieldDef = HB_TRACKER_DATA.fields.sleep;
    var current = state.currentEntry.sleep != null ? state.currentEntry.sleep : fieldDef.defaultValue;
    if (state.currentEntry.sleep == null) state.currentEntry.sleep = current;

    var valueDisplay = el('div', { class: 'hb-tracker-slider-value' }, [
      String(current),
      el('span', { class: 'hb-tracker-slider-unit' }, fieldDef.unit)
    ]);

    var slider = el('input', {
      class: 'hb-tracker-slider-input',
      type: 'range',
      min: String(fieldDef.min),
      max: String(fieldDef.max),
      step: String(fieldDef.step),
      value: String(current),
      oninput: function(e) {
        var v = parseFloat(e.target.value);
        state.currentEntry.sleep = v;
        valueDisplay.childNodes[0].nodeValue = String(v);
      }
    });

    var labels = el('div', { class: 'hb-tracker-slider-labels' }, [
      el('span', null, String(fieldDef.min) + 'h'),
      el('span', null, String(fieldDef.max) + 'h')
    ]);

    return el('div', { class: 'hb-tracker-field' }, [
      el('p', { class: 'hb-tracker-field-label' }, fieldDef.label),
      el('div', { class: 'hb-tracker-slider' }, [valueDisplay, slider, labels])
    ]);
  }

  function renderCycleDayField() {
    if (!typeConfig.cycleVisible) return null;

    var fieldDef = HB_TRACKER_DATA.fields.cycle_day;
    var current = state.currentEntry.cycle_day;

    var input = el('input', {
      class: 'hb-tracker-number-input',
      type: 'number',
      min: String(fieldDef.min),
      max: String(fieldDef.max),
      value: current != null ? String(current) : '',
      placeholder: fieldDef.placeholder,
      oninput: function(e) {
        var v = e.target.value;
        if (v === '') {
          state.currentEntry.cycle_day = null;
        } else {
          var n = parseInt(v, 10);
          if (!isNaN(n) && n >= fieldDef.min && n <= fieldDef.max) {
            state.currentEntry.cycle_day = n;
          }
        }
      }
    });

    return el('div', { class: 'hb-tracker-field' }, [
      el('p', { class: 'hb-tracker-field-label is-optional' }, fieldDef.label),
      el('p', { class: 'hb-tracker-field-help' }, typeConfig.cyclePrompt),
      el('div', { class: 'hb-tracker-number-wrapper' }, [input])
    ]);
  }

  function renderSymptomsField() {
    var fieldDef = HB_TRACKER_DATA.fields.symptoms;
    var selected = state.currentEntry.symptoms || [];
    var emphasized = typeConfig.emphasizedSymptoms || [];
    var max = fieldDef.maxSelections || 5;

    var sortedSymptoms = HB_TRACKER_DATA.allSymptoms.slice().sort(function(a, b) {
      var ai = emphasized.indexOf(a.value);
      var bi = emphasized.indexOf(b.value);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.label.localeCompare(b.label);
    });

    var chipsRow = el('div', { class: 'hb-tracker-chips' });
    sortedSymptoms.forEach(function(opt) {
      var isSelected = selected.indexOf(opt.value) !== -1;
      var isEmphasized = emphasized.indexOf(opt.value) !== -1;
      var reachedMax = selected.length >= max && !isSelected;

      var classes = 'hb-tracker-chip';
      if (isEmphasized) classes += ' is-emphasized';
      if (isSelected) classes += ' is-selected';
      if (reachedMax) classes += ' is-disabled';

      var chip = el('button', {
        class: classes,
        type: 'button',
        onclick: function() {
          if (reachedMax) return;
          var current = (state.currentEntry.symptoms || []).slice();
          if (isSelected) {
            current = current.filter(function(v) { return v !== opt.value; });
          } else if (current.length < max) {
            current.push(opt.value);
          }
          state.currentEntry.symptoms = current;
          renderTracker();
        }
      }, opt.label);

      chipsRow.appendChild(chip);
    });

    var counter = el('p', {
      class: 'hb-tracker-chips-counter',
      html: 'Selected: <strong>' + selected.length + ' / ' + max + '</strong>'
    });

    return el('div', { class: 'hb-tracker-field' }, [
      el('p', { class: 'hb-tracker-field-label is-optional' }, fieldDef.label),
      el('p', { class: 'hb-tracker-field-help' }, fieldDef.helpText),
      chipsRow, counter
    ]);
  }

  function renderNotesField() {
    var fieldDef = HB_TRACKER_DATA.fields.notes;
    var current = state.currentEntry.notes || '';

    var counter = el('div', {
      class: 'hb-tracker-textarea-counter' + (current.length > fieldDef.maxLength ? ' is-over' : '')
    }, current.length + ' / ' + fieldDef.maxLength);

    var textarea = el('textarea', {
      class: 'hb-tracker-textarea',
      placeholder: fieldDef.placeholder,
      maxLength: fieldDef.maxLength,
      oninput: function(e) {
        var v = e.target.value;
        state.currentEntry.notes = v;
        counter.firstChild.nodeValue = v.length + ' / ' + fieldDef.maxLength;
        if (v.length > fieldDef.maxLength) counter.classList.add('is-over');
        else counter.classList.remove('is-over');
      }
    });
    textarea.value = current;

    return el('div', { class: 'hb-tracker-field' }, [
      el('p', { class: 'hb-tracker-field-label is-optional' }, fieldDef.label),
      el('div', { class: 'hb-tracker-textarea-wrapper' }, [textarea, counter])
    ]);
  }

  /* SAVE BUTTON */

  function renderSaveButton() {
    var existingEntry = state.entries[state.today];
    var isUpdate = !!existingEntry;
    var hasEnergy = state.currentEntry.energy != null;
    var canSave = hasEnergy;

    var btnLabel;
    if (state.saveJustSucceeded) btnLabel = 'Saved ✓';
    else if (isUpdate) btnLabel = "Update today's entry";
    else btnLabel = "Save today's entry";

    var btn = el('button', {
      class: 'hb-tracker-save-btn' + (state.saveJustSucceeded ? ' is-success' : ''),
      type: 'button',
      disabled: !canSave,
      onclick: function() {
        if (!canSave) return;
        save(isUpdate);
      }
    }, btnLabel);

    return el('div', { class: 'hb-tracker-save-row' }, [btn]);
  }

  /* SAVE FLOW */

  function save(isUpdate) {
    state.entries[state.today] = {
      energy: state.currentEntry.energy,
      sleep: state.currentEntry.sleep,
      cycle_day: state.currentEntry.cycle_day,
      symptoms: state.currentEntry.symptoms || [],
      notes: state.currentEntry.notes || '',
      timestamp: new Date().toISOString()
    };
    saveEntries();

    var milestone = null;
    if (!isUpdate) {
      milestone = maybeUpdateStreakOnNewLog();
      trackEvent('log_complete', {
        hormone_type: state.hormoneType,
        streak: state.streak.current
      });
    } else {
      trackEvent('log_update', { hormone_type: state.hormoneType });
    }

    if (milestone) trackEvent('streak_milestone', { days: milestone });

    state.saveJustSucceeded = true;
    renderTracker();

    setTimeout(function() {
      state.saveJustSucceeded = false;
      renderTracker();
    }, 2200);
  }

  /* MAIN TRACKER RENDER (v1.6.1 — compact bar at top + form-first in TODAY mode) */

  function renderTracker() {
    clearRoot();

    var hasLoggedToday = !!state.entries[state.today];
    var isViewingPastDay = state.selectedDayKey && state.selectedDayKey !== state.today;
    var isViewingPastMonth = state.viewMonthOffset !== 0 && !isViewingPastDay;

    var children = [];

    // Compact bar at top for returning users (always visible, all modes)
    if (state.hormoneType) {
      children.push(renderCompactBar());
    }

    children.push(renderHeader());

    if (isViewingPastDay) {
      children.push(renderPastDayHint());
      children.push(renderHeatmapCalendar());
      var selectedPanel = renderSelectedDayPanel();
      if (selectedPanel) children.push(selectedPanel);
    } else if (isViewingPastMonth) {
      children.push(renderPastMonthHint());
      children.push(renderHeatmapCalendar());
      children.push(renderJourneyProgress());
    } else {
      // TODAY MODE — FORM FIRST (v1.6.0)
      if (hasLoggedToday) {
        children.push(renderLoggedTodayBanner());
      }
      children.push(renderEnergyField());
      children.push(renderSleepField());
      var cycleField = renderCycleDayField();
      if (cycleField) children.push(cycleField);
      children.push(renderSymptomsField());
      children.push(renderNotesField());
      children.push(renderSaveButton());
      children.push(renderDivider());
      children.push(renderHistorySectionEyebrow());
      children.push(renderHeatmapCalendar());
      children.push(renderJourneyProgress());
    }

    rootEl.appendChild(el('div', { class: 'hb-tracker' }, children));
  }

  /* INIT */

  function init() {
    if (typeof window.HB_TRACKER_DATA === 'undefined') {
      console.error('HB Tracker: HB_TRACKER_DATA not loaded');
      return;
    }

    rootEl = document.getElementById(ROOT_ID);
    if (!rootEl) return;

    injectExtraStyles();
    injectReturningUserStyles();
    injectCollapseStyles();

    state.today = getTodayKey();
    state.viewMonthOffset = 0;
    loadEntries();
    loadStreak();
    loadQuizHormoneType();

    // Phase 1: Returning user mode
    if (state.hormoneType) {
      applyReturningUserMode();
    }

    // Phase 2: About/FAQ collapse — run after page settles
    if (document.readyState === 'complete') {
      applyAboutFAQCollapse();
    } else {
      window.addEventListener('load', function() {
        applyAboutFAQCollapse();
      });
    }

    if (!state.hormoneType) {
      renderNoQuizPrompt();
      return;
    }

    typeConfig = HB_TRACKER_DATA.typeConfigs[state.hormoneType];
    if (!typeConfig) {
      console.warn('HB Tracker: unknown hormone type', state.hormoneType);
      renderNoQuizPrompt();
      return;
    }

    buildCurrentEntryForToday();
    renderTracker();

    if (dateCheckTimer) clearInterval(dateCheckTimer);
    dateCheckTimer = setInterval(checkDateChange, DATE_CHECK_INTERVAL_MS);
  }

  /* EXPORT GLOBAL */

  window.HB_TRACKER = {
    version: '1.6.2',
    mount: init,
    getEntry: function(dateKey) { return state.entries[dateKey] || null; },
    getStreak: function() { return state.streak; },
    getAllEntries: function() { return state.entries; },
    // Exposed for testing
    _applyReturningUserMode: applyReturningUserMode,
    _applyAboutFAQCollapse: applyAboutFAQCollapse,
    _matchesCollapseHeading: matchesCollapseHeading,
    _getHormoneTypeDisplay: getHormoneTypeDisplay
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
