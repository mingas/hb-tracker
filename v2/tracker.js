/**
 * hb-tracker / v2 / tracker.js
 *
 * Daily Tracker — v1.9.1
 *   v1.9.1 — Scroll-position preserved across re-renders (no page jump on field clicks) + fresh SHA.
 *   v1.7.0 — Calendar alignment fix (visible bug user reported):
 *            Day-of-week labels (M T W T F S S) were rendered as <span>
 *            inside a CSS grid. Spans default to inline-block in grid items,
 *            sitting at justify-self:start (left edge of column), while
 *            calendar cells use display:flex;justify-content:center.
 *            Result: labels left-aligned, cells centered → columns
 *            did not line up vertically.
 *            Fix: .hb-tracker-heatmap-labels span gets display:block + width:100%
 *            so each label fills its grid cell and text-align:center properly
 *            centers the letter under each cell column.
 *   v1.6.9 — Emoji rendering fixes (font-family stack + robust lookup).
 *            (1) getHormoneTypeEmoji() — robust lookup with normalization
 *                fallback (matches getHormoneTypeDisplay pattern). Handles
 *                inputs like "Perimenopause Transitioner" -> "perimenopause_transitioner".
 *            (2) Emoji span gets explicit emoji font-family stack
 *                (Apple Color Emoji / Segoe UI Emoji / Noto Color Emoji)
 *                so emojis render across all OSes regardless of inherited font.
 *            (3) Console.log emits state.hormoneType + emoji codepoints
 *                for diagnostic visibility.
 *   v1.6.8 — Compact bar emoji + permanently strip FAQ borders.
 *            (1) Compact bar now shows hormone-type EMOJI before the label/type
 *                (\uD83C\uDF0A Cycle Surfer / \uD83D\uDD25 Estrogen Dominant / etc).
 *            (2) FAQ section: PERMANENTLY strips all border-top, border-bottom,
 *                box-shadow, and <hr> elements from the FAQ section regardless
 *                of collapse state — per user: "those lines are not needed".
 *            (3) The FAQ wrapper hiding from v1.6.7 still works for the empty
 *                wrappers, but borders are killed independently so they stay
 *                invisible whether collapsed or expanded.
 *   v1.6.7 — Combined fix: placeholder + FAQ wrappers + toggle + compact bar.
 *   v1.6.6 — Show more toggle fix + rollback common ancestor.
 *   v1.6.5 — REVERTED. Common ancestor strategy broke toggle.
 *   v1.6.4 — REVERTED. Had placeholder wrapper walking but no FAQ fix.
 *   v1.6.3 — Hide .hb-quiz-placeholder wrapper and FAQ item wrappers.
 *   v1.6.2 — Fix About/FAQ collapse for nested container structure.
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
  var STORAGE_KEY_ROTATION = 'hb_advice_rotation';
  var STORAGE_KEY_LAST_CARD = 'hb_last_log_card';
  var STORAGE_KEY_RECENT   = 'hb_advice_recent';
  var RECENT_MAX           = 12;
  var BOOK_URL             = '/hormone-blueprint';  // women's book page (The Hormone Blueprint)
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

  var HORMONE_TYPE_EMOJI = {
    'cycle_surfer':              '\uD83C\uDF0A',
    'estrogen_dominant':         '\uD83D\uDD25',
    'progesterone_deficient':    '\uD83C\uDF11',
    'perimenopause_transitioner':'\uD83C\uDF17',
    'postmenopause_renewer':     '\u2600\uFE0F'
  };

  var state = {
    today: '',
    entries: {},
    streak: { current: 0, best: 0, last_log_date: null },
    hormoneType: null,
    currentEntry: null,
    saveJustSucceeded: false,
    selectedDayKey: null,
    viewMonthOffset: 0,
    lastLogCard: null,
    adviceRotation: {},
    adviceRecent: []
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

  // Date math on a YYYY-MM-DD key (for streak recomputation across edited past days).
  function addDaysToKey(key, delta) {
    var p = key.split('-');
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    d.setDate(d.getDate() + delta);
    return dateKeyFromDate(d);
  }

  // Whole days from key a to key b (b - a). Positive if b is later.
  function daysBetweenKeys(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    var da = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]);
    var db = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }

  /* ====================================================================
     CYCLE PREDICTION ENGINE (#11)
     Builds a map: dateKey -> { period, predPeriod, fertile, ovulation }.
     - period:     a logged bleed day (entry.period === true)
     - predPeriod: a predicted future period day
     - fertile:    estimated fertile window (~6 days)
     - ovulation:  estimated ovulation day (~14 days before next period)
     Predictions appear only after >= 2 full cycles are logged (>= 3 period
     starts), so we never show guesses from too little data. Estimates only —
     never presented as contraception.
     ==================================================================== */
  function computeCycleMarkers(entries, todayKey) {
    var markers = {};
    if (!entries) return markers;

    // 1. Logged bleed days, sorted chronologically.
    var bleedDays = Object.keys(entries)
      .filter(function(k) { return entries[k] && entries[k].period === true; })
      .sort();
    if (!bleedDays.length) return markers;

    bleedDays.forEach(function(d) { markers[d] = { period: true }; });

    // 2. Group consecutive bleed days into period segments.
    var segments = [];
    bleedDays.forEach(function(d) {
      var last = segments[segments.length - 1];
      if (last && addDaysToKey(last.end, 1) === d) { last.end = d; }
      else segments.push({ start: d, end: d });
    });

    var starts = segments.map(function(s) { return s.start; });

    // 3. Cycle lengths between consecutive period starts.
    var lengths = [];
    for (var i = 1; i < starts.length; i++) {
      lengths.push(daysBetweenKeys(starts[i - 1], starts[i]));
    }
    // Need at least 2 cycle lengths (>= 3 logged period starts) to predict.
    if (lengths.length < 2) return markers;

    // 4. Average cycle length (recent up to 6), clamped to a sane range.
    var recent = lengths.slice(-6);
    var avg = Math.round(recent.reduce(function(a, b) { return a + b; }, 0) / recent.length);
    if (avg < 21) avg = 21;
    if (avg > 40) avg = 40;

    // Typical period length for predicted-period bars.
    var perLens = segments.map(function(s) { return daysBetweenKeys(s.start, s.end) + 1; });
    var perLen = Math.round(perLens.reduce(function(a, b) { return a + b; }, 0) / perLens.length);
    if (perLen < 2) perLen = 2;
    if (perLen > 8) perLen = 8;

    var lastStart = starts[starts.length - 1];

    function markOvulationAndFertile(periodStartKey) {
      var ovu = addDaysToKey(periodStartKey, -14);
      markers[ovu] = markers[ovu] || {};
      if (!markers[ovu].period) markers[ovu].ovulation = true;
      for (var fw = -5; fw <= 0; fw++) {
        var fk = addDaysToKey(ovu, fw);
        markers[fk] = markers[fk] || {};
        if (!markers[fk].period) markers[fk].fertile = true;
      }
    }

    // 5. Project forward ~3 cycles to cover the visible calendar range.
    for (var c = 1; c <= 3; c++) {
      var predStart = addDaysToKey(lastStart, avg * c);
      for (var p = 0; p < perLen; p++) {
        var pk = addDaysToKey(predStart, p);
        if (pk > todayKey && (!markers[pk] || !markers[pk].period)) {
          markers[pk] = markers[pk] || {};
          markers[pk].predPeriod = true;
        }
      }
      markOvulationAndFertile(predStart);
    }
    // Current cycle's fertile window / ovulation (between last logged start and next predicted).
    markOvulationAndFertile(addDaysToKey(lastStart, avg));

    return markers;
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

  function buildCurrentEntry(dayKey) {
    var existingEntry = state.entries[dayKey];
    if (existingEntry) {
      state.currentEntry = {
        energy: existingEntry.energy,
        sleep: existingEntry.sleep,
        cycle_day: existingEntry.cycle_day,
        period: existingEntry.period === true,
        symptoms: (existingEntry.symptoms || []).slice(),
        notes: existingEntry.notes || ''
      };
    } else {
      state.currentEntry = {
        energy: null, sleep: null, cycle_day: null, period: false, symptoms: [], notes: ''
      };
    }
  }

  function buildCurrentEntryForToday() {
    buildCurrentEntry(state.today);
  }

  // The day the form is currently editing: a selected past day, or today.
  function activeEditKey() {
    return (state.selectedDayKey && state.selectedDayKey !== state.today)
      ? state.selectedDayKey : state.today;
  }

  function checkDateChange() {
    var newToday = getTodayKey();
    if (newToday !== state.today) {
      state.today = newToday;
      state.selectedDayKey = null;
      state.saveJustSucceeded = false;
      state.viewMonthOffset = 0;
      state.lastLogCard = null;
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

  function loadRotation() {
    try { var r = localStorage.getItem(STORAGE_KEY_ROTATION); state.adviceRotation = r ? (JSON.parse(r) || {}) : {}; }
    catch (e) { state.adviceRotation = {}; }
  }

  function saveRotation() {
    try { localStorage.setItem(STORAGE_KEY_ROTATION, JSON.stringify(state.adviceRotation || {})); } catch (e) {}
  }

  function loadAdviceRecent() {
    try { var r = localStorage.getItem(STORAGE_KEY_RECENT); var a = r ? JSON.parse(r) : []; state.adviceRecent = Array.isArray(a) ? a : []; }
    catch (e) { state.adviceRecent = []; }
  }

  function saveAdviceRecent() {
    try { localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(state.adviceRecent || [])); } catch (e) {}
  }

  // Persist the advice card chosen for the most recent log, tied to its date,
  // so it survives a page reload and stays until the next day is logged.
  function saveLastLogCard() {
    try {
      if (state.lastLogCard) {
        localStorage.setItem(STORAGE_KEY_LAST_CARD, JSON.stringify({ date: state.today, picked: state.lastLogCard }));
      } else {
        localStorage.removeItem(STORAGE_KEY_LAST_CARD);
      }
    } catch (e) {}
  }

  function loadLastLogCard() {
    state.lastLogCard = null;
    try {
      var raw = localStorage.getItem(STORAGE_KEY_LAST_CARD);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      // Restore only if it belongs to today AND today actually has an entry.
      // Anything else (previous day, no entry) is stale — drop it.
      if (parsed && parsed.date === state.today && parsed.picked && state.entries[state.today]) {
        state.lastLogCard = parsed.picked;
      } else {
        try { localStorage.removeItem(STORAGE_KEY_LAST_CARD); } catch (e2) {}
      }
    } catch (e) { state.lastLogCard = null; }
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

  // Recompute streak from ALL entries. Used after editing/filling a past day,
  // where the simple incremental update can't know the new consecutive run.
  // current = consecutive logged days ending at today (or yesterday if today
  // isn't logged yet). best = longest run ever, never shrunk below stored best.
  function recomputeStreak() {
    var keys = Object.keys(state.entries);
    if (!keys.length) {
      state.streak.current = 0;
      state.streak.best = state.streak.best || 0;
      state.streak.last_log_date = null;
      saveStreak();
      return;
    }
    keys.sort(); // YYYY-MM-DD sorts chronologically
    // longest consecutive run anywhere
    var best = 0, run = 0, prev = null;
    keys.forEach(function(k) {
      if (prev !== null && addDaysToKey(prev, 1) === k) run += 1; else run = 1;
      if (run > best) best = run;
      prev = k;
    });
    // current run ending at today or yesterday
    var endKey = state.entries[state.today] ? state.today
               : (state.entries[getYesterdayKey()] ? getYesterdayKey() : null);
    var current = 0;
    if (endKey) {
      current = 1;
      var d = endKey;
      while (state.entries[addDaysToKey(d, -1)]) { current += 1; d = addDaysToKey(d, -1); }
    }
    state.streak.current = current;
    state.streak.best = Math.max(best, current, state.streak.best || 0);
    state.streak.last_log_date = keys[keys.length - 1];
    saveStreak();
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
      + 'body.hb-returning #hq-hero,'
      + 'body.hb-returning .hb-seo-section,'
      + 'body.hb-returning .hb-faq-section,'
      + 'body.hb-returning .hb-eyebrow,'
      + 'body.hb-returning .hb-quiz-title,'
      + 'body.hb-returning .hb-quiz-subtitle,'
      + 'body.hb-returning #hb-quiz-root,'
      + 'body.hb-returning .hb-quiz-placeholder,'
      + 'body.hb-returning .hb-quiz-placeholder-title,'
      + 'body.hb-returning .hb-quiz-placeholder-text{display:none !important}'
      // Compact bar (rendered inside tracker, at top)
      + '.hb-compact-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#F4ECDD;border:1px solid #EBE0CC;border-radius:12px;margin:0 0 20px 0;font-family:inherit;gap:14px;box-sizing:border-box}'
      + '.hb-compact-bar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0;overflow:hidden}'
      + '.hb-compact-bar-emoji{font-size:20px;line-height:1;flex-shrink:0;font-family:"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji","Twemoji Mozilla",system-ui,sans-serif;font-style:normal;font-weight:normal}'
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

  // Robust emoji lookup with normalization fallback. Tries exact key first,
  // then normalizes input (lowercase, spaces→underscores) to match snake_case keys.
  function getHormoneTypeEmoji(raw) {
    if (!raw) return '';
    if (HORMONE_TYPE_EMOJI[raw]) return HORMONE_TYPE_EMOJI[raw];
    // Try normalizing: "Perimenopause Transitioner" → "perimenopause_transitioner"
    var normalized = String(raw)
      .toLowerCase()
      .replace(/[-\s]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    if (HORMONE_TYPE_EMOJI[normalized]) return HORMONE_TYPE_EMOJI[normalized];
    return '';
  }

  function applyReturningUserMode(retries) {
    retries = retries || 0;
    if (!document.body || !document.body.classList) {
      if (retries < 20) setTimeout(function() { applyReturningUserMode(retries + 1); }, 50);
      return;
    }
    document.body.classList.add('hb-returning');

    // Walk up DOM from #hb-quiz-root to hide its section/container wrapper
    // (the white empty card with rounded corners) — restored from v1.6.4.
    // Stops at SECTION/MAIN/BODY boundaries. Skips tracker root wrapper.
    var quizRoot = document.getElementById('hb-quiz-root');
    if (!quizRoot) return;
    var current = quizRoot;
    for (var j = 0; j < 4; j++) {
      var parent = current.parentElement;
      if (!parent) break;
      var ptag = parent.tagName;
      if (ptag === 'BODY' || ptag === 'MAIN' || ptag === 'HTML') break;
      // Count parent's children that aren't tracker root or already-collapsed
      var visibleNonTracker = 0;
      for (var k = 0; k < parent.children.length; k++) {
        var ch = parent.children[k];
        if (ch.id === 'hb-tracker-root') continue;
        if (ch.contains && ch.contains(document.getElementById('hb-tracker-root'))) continue;
        if (!ch.classList.contains('hb-collapsed')) visibleNonTracker++;
      }
      // If parent's only non-tracker visible child is current, hide current and walk up
      if (visibleNonTracker <= 1) {
        current.classList.add('hb-collapsed');
        current = parent;
        // Stop walking after hiding inside a SECTION (don't hide section itself)
        if (ptag === 'SECTION') break;
      } else {
        // Parent has other visible content — hide just current
        current.classList.add('hb-collapsed');
        break;
      }
    }
  }

  function renderCompactBar() {
    var typeName = getHormoneTypeDisplay(state.hormoneType);
    var emojiChar = getHormoneTypeEmoji(state.hormoneType);
    var emojiSpan = el('span', { class: 'hb-compact-bar-emoji', 'aria-hidden': 'true' }, emojiChar);
    var labelSpan = el('span', { class: 'hb-compact-bar-label' }, 'Hormone Type');
    var typeSpan = el('span', { class: 'hb-compact-bar-type' }, typeName);
    var leftDiv = el('div', { class: 'hb-compact-bar-left' }, [emojiSpan, labelSpan, typeSpan]);
    var retakeBtn = el('button', {
      class: 'hb-compact-bar-retake',
      type: 'button',
      'aria-label': 'Retake the quiz, current result will be replaced',
      onclick: function() {
        var ok = typeof window.confirm === 'function'
          ? window.confirm('Retake the quiz? Your hormone type will be replaced. Your daily logs are SAFE (stored in this browser).')
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

  function injectSettingsStyles() {
    if (document.getElementById('hb-settings-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-settings-styles';
    style.textContent = ''
      + '.hb-tracker-settings{margin-top:32px;padding:24px;background:#FFFFFF;border:1px solid #E8E2D3;border-radius:12px}'
      + '.hb-tracker-settings-title{font-size:14px;font-weight:600;color:#1A2A4A;margin:0 0 4px 0;letter-spacing:0.3px}'
      + '.hb-tracker-settings-subtitle{font-size:12.5px;color:#5A5048;margin:0 0 16px 0}'
      + '.hb-tracker-settings-row{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}'
      + '.hb-tracker-settings-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;background:#F4ECDD;border:1px solid #E8E2D3;border-radius:8px;color:#1A2A4A;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:all 150ms;text-align:left;width:100%}'
      + '.hb-tracker-settings-btn:hover{background:#EFE6D0;border-color:#C9C2AE}'
      + '.hb-tracker-settings-btn:focus-visible{outline:2px solid #C97B5C;outline-offset:2px}'
      + '.hb-tracker-settings-btn.is-danger{background:#FFFFFF;border-color:#E8C5BC;color:#B23E1E}'
      + '.hb-tracker-settings-btn.is-danger:hover{background:#FBEDE8;border-color:#B23E1E}'
      + '.hb-tracker-settings-btn-icon{font-size:14px;flex-shrink:0}'
      + '.hb-tracker-settings-btn-label{flex:1;text-align:left}'
      + '.hb-tracker-settings-btn-hint{font-size:11.5px;color:#8B7E6E;font-weight:400;margin-top:2px}'
      + '.hb-tracker-settings-btn.is-danger .hb-tracker-settings-btn-hint{color:#A86A56}'
      + '.hb-tracker-settings-file-input{display:none}'
      + '@media (max-width:479px){.hb-tracker-settings{padding:20px 18px}.hb-tracker-settings-btn{padding:10px 14px;font-size:12.5px}}';
    document.head.appendChild(style);
  }

  function buildExportPayload() {
    var payload = {
      app: 'hb-tracker',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      hormoneType: state.hormoneType || null,
      entries: state.entries || {},
      streak: state.streak || { current: 0, best: 0, last_log_date: null }
    };
    try {
      var quizRaw = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (quizRaw) payload.quizState = JSON.parse(quizRaw);
    } catch (e) { /* quiz state optional */ }
    return payload;
  }

  function handleExportData() {
    try {
      var payload = buildExportPayload();
      var json = JSON.stringify(payload, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      var d = new Date();
      var pad = function(n) { return n < 10 ? '0' + n : String(n); };
      var dateStr = d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
      a.href = url;
      a.download = 'hb-tracker-backup-' + dateStr + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      trackEvent('data_export', { entries_count: Object.keys(payload.entries).length });
    } catch (e) {
      console.error('HB Tracker: export failed', e);
      if (typeof window.alert === 'function') {
        window.alert('Sorry, export failed. Please try again.');
      }
    }
  }

  function handleImportData(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var payload = JSON.parse(ev.target.result);

        // Validate schema
        if (!payload || payload.app !== 'hb-tracker') {
          throw new Error('This file does not look like an HB Tracker backup.');
        }
        if (!payload.entries || typeof payload.entries !== 'object' || Array.isArray(payload.entries)) {
          throw new Error('Backup file is missing valid entries.');
        }

        // Confirm overwrite
        var existingCount = Object.keys(state.entries || {}).length;
        var newCount = Object.keys(payload.entries).length;
        var msg = 'Import will REPLACE your current data.\n\n'
          + 'Current logs: ' + existingCount + '\n'
          + 'Import file: ' + newCount + ' logs from ' + (payload.exportedAt || 'unknown date').substring(0,10) + '\n\n'
          + 'Continue?';

        var ok = typeof window.confirm === 'function' ? window.confirm(msg) : true;
        if (!ok) return;

        // Write to localStorage
        try { localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(payload.entries)); } catch (e) {}
        if (payload.streak && typeof payload.streak === 'object') {
          try { localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(payload.streak)); } catch (e) {}
        }
        if (payload.quizState && typeof payload.quizState === 'object') {
          try { localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload.quizState)); } catch (e) {}
        }
        // Imported data replaces current logs — advice card, cooldown and rotation no longer apply.
        try { localStorage.removeItem(STORAGE_KEY_LAST_CARD); } catch (e) {}
        try { localStorage.removeItem(STORAGE_KEY_RECENT); } catch (e) {}
        try { localStorage.removeItem(STORAGE_KEY_ROTATION); } catch (e) {}

        trackEvent('data_import', { entries_count: newCount });
        location.reload();
      } catch (e) {
        console.error('HB Tracker: import failed', e);
        if (typeof window.alert === 'function') {
          window.alert('Import failed: ' + e.message);
        }
      }
    };
    reader.onerror = function() {
      if (typeof window.alert === 'function') window.alert('Could not read the file.');
    };
    reader.readAsText(file);
  }

  function injectDeleteModalStyles() {
    if (document.getElementById('hb-delete-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-delete-modal-styles';
    style.textContent = ''
      + '.hb-tracker-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(26,42,74,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:hbModalFadeIn 150ms ease-out}'
      + '.hb-tracker-modal{background:#FFFFFF;border-radius:16px;padding:32px 28px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:hbModalScaleIn 180ms ease-out;box-sizing:border-box}'
      + '.hb-tracker-modal-icon{font-size:36px;margin-bottom:8px;text-align:center;line-height:1}'
      + '.hb-tracker-modal-title{font-size:20px;font-weight:700;color:#1A2A4A;margin:0 0 18px 0;text-align:center}'
      + '.hb-tracker-modal-list{background:#F4ECDD;border-radius:10px;padding:14px 18px;margin-bottom:20px}'
      + '.hb-tracker-modal-text{font-size:13px;color:#1A2A4A;margin:0 0 8px 0;font-weight:500}'
      + '.hb-tracker-modal-ul{margin:0 0 10px 0;padding-left:18px;color:#5A5048;font-size:13px;line-height:1.6}'
      + '.hb-tracker-modal-ul li{margin-bottom:2px}'
      + '.hb-tracker-modal-warning{font-size:13px;color:#B23E1E;font-weight:600;margin:0}'
      + '.hb-tracker-modal-label{display:block;font-size:13px;color:#1A2A4A;margin-bottom:8px}'
      + '.hb-tracker-modal-label strong{color:#B23E1E;letter-spacing:0.5px}'
      + '.hb-tracker-modal-input{width:100%;padding:11px 14px;border:2px solid #E8E2D3;border-radius:8px;font-size:14px;font-family:inherit;color:#1A2A4A;background:#FFFFFF;box-sizing:border-box;outline:none;transition:border-color 150ms}'
      + '.hb-tracker-modal-input:focus{border-color:#C97B5C}'
      + '.hb-tracker-modal-actions{display:flex;gap:10px;margin-top:20px}'
      + '.hb-tracker-modal-cancel,.hb-tracker-modal-confirm{flex:1;padding:12px 14px;border-radius:8px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid;transition:all 150ms}'
      + '.hb-tracker-modal-cancel{background:#FFFFFF;border-color:#E8E2D3;color:#1A2A4A}'
      + '.hb-tracker-modal-cancel:hover{background:#F4ECDD}'
      + '.hb-tracker-modal-confirm{background:#E8C5BC;border-color:#E8C5BC;color:#FFFFFF;opacity:0.55;cursor:not-allowed}'
      + '.hb-tracker-modal-confirm.is-active{background:#B23E1E;border-color:#B23E1E;color:#FFFFFF;opacity:1;cursor:pointer}'
      + '.hb-tracker-modal-confirm.is-active:hover{background:#8E2E15;border-color:#8E2E15}'
      + '@keyframes hbModalFadeIn{from{opacity:0}to{opacity:1}}'
      + '@keyframes hbModalScaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}'
      + '@media (max-width:479px){.hb-tracker-modal{padding:24px 20px;border-radius:12px}.hb-tracker-modal-title{font-size:18px}.hb-tracker-modal-icon{font-size:32px}}';
    document.head.appendChild(style);
  }

  function showDeleteConfirmModal() {
    // Remove any existing modal first
    var existing = document.getElementById('hb-tracker-delete-modal');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var entryCount = Object.keys(state.entries || {}).length;
    var hasQuiz = !!state.hormoneType;
    var hasStreak = !!(state.streak && state.streak.best);

    var typeInput, confirmBtn, overlay;

    function closeModal() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function performDelete() {
      if (!typeInput || typeInput.value !== 'DELETE') return;
      try { localStorage.removeItem(STORAGE_KEY_ENTRIES); } catch (e) {}
      try { localStorage.removeItem(STORAGE_KEY_STREAK); } catch (e) {}
      try { localStorage.removeItem(QUIZ_STORAGE_KEY); } catch (e) {}
      try { localStorage.removeItem(STORAGE_KEY_LAST_CARD); } catch (e) {}
      try { localStorage.removeItem(STORAGE_KEY_RECENT); } catch (e) {}
      try { localStorage.removeItem(STORAGE_KEY_ROTATION); } catch (e) {}
      trackEvent('data_delete_all', { entries_count: entryCount });
      location.reload();
    }

    typeInput = el('input', {
      type: 'text',
      class: 'hb-tracker-modal-input',
      placeholder: 'Type DELETE here',
      autocomplete: 'off',
      spellcheck: 'false',
      'aria-label': 'Type DELETE to confirm',
      oninput: function(e) {
        var match = e.target.value === 'DELETE';
        if (match) {
          confirmBtn.removeAttribute('disabled');
          confirmBtn.className = 'hb-tracker-modal-confirm is-active';
        } else {
          confirmBtn.setAttribute('disabled', 'true');
          confirmBtn.className = 'hb-tracker-modal-confirm';
        }
      },
      onkeydown: function(e) {
        if (e.key === 'Enter' && typeInput.value === 'DELETE') performDelete();
        if (e.key === 'Escape') closeModal();
      }
    });

    confirmBtn = el('button', {
      type: 'button',
      class: 'hb-tracker-modal-confirm',
      disabled: 'true',
      onclick: performDelete
    }, 'Delete forever');

    var cancelBtn = el('button', {
      type: 'button',
      class: 'hb-tracker-modal-cancel',
      onclick: closeModal
    }, 'Cancel');

    var listItems = [];
    listItems.push(el('li', null, entryCount + ' daily ' + (entryCount === 1 ? 'log' : 'logs')));
    if (hasStreak) listItems.push(el('li', null, 'Your streak history'));
    if (hasQuiz) listItems.push(el('li', null, 'Your hormone type result'));

    var modal = el('div', { class: 'hb-tracker-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'hb-modal-title' }, [
      el('div', { class: 'hb-tracker-modal-icon' }, '\u26A0\uFE0F'),
      el('h3', { class: 'hb-tracker-modal-title', id: 'hb-modal-title' }, 'Delete all data?'),
      el('div', { class: 'hb-tracker-modal-list' }, [
        el('p', { class: 'hb-tracker-modal-text' }, 'This will permanently remove:'),
        el('ul', { class: 'hb-tracker-modal-ul' }, listItems),
        el('p', { class: 'hb-tracker-modal-warning' }, 'This cannot be undone.')
      ]),
      el('label', { class: 'hb-tracker-modal-label', for: 'hb-modal-input' }, [
        'Type ',
        el('strong', null, 'DELETE'),
        ' below to confirm:'
      ]),
      typeInput,
      el('div', { class: 'hb-tracker-modal-actions' }, [cancelBtn, confirmBtn])
    ]);

    overlay = el('div', {
      id: 'hb-tracker-delete-modal',
      class: 'hb-tracker-modal-overlay',
      onclick: function(e) { if (e.target === overlay) closeModal(); }
    }, [modal]);

    document.body.appendChild(overlay);

    // Focus input after a tick
    setTimeout(function() { try { typeInput.focus(); } catch (e) {} }, 50);
  }

  function handleDeleteAllData() {
    showDeleteConfirmModal();
  }

  function renderSettings() {
    var exportBtn = el('button', {
      class: 'hb-tracker-settings-btn',
      type: 'button',
      onclick: handleExportData
    }, [
      el('span', { class: 'hb-tracker-settings-btn-icon' }, '\u2B07'),
      el('span', { class: 'hb-tracker-settings-btn-label' }, [
        'Export backup',
        el('div', { class: 'hb-tracker-settings-btn-hint' }, 'Download a JSON file with all your data')
      ])
    ]);

    var fileInput = el('input', {
      type: 'file',
      accept: 'application/json,.json',
      class: 'hb-tracker-settings-file-input',
      id: 'hb-tracker-import-input',
      onchange: function(e) {
        var file = e.target && e.target.files && e.target.files[0];
        handleImportData(file);
        try { e.target.value = ''; } catch (err) {}
      }
    });

    var importBtn = el('button', {
      class: 'hb-tracker-settings-btn',
      type: 'button',
      onclick: function() {
        var inp = document.getElementById('hb-tracker-import-input');
        if (inp) inp.click();
      }
    }, [
      el('span', { class: 'hb-tracker-settings-btn-icon' }, '\u2B06'),
      el('span', { class: 'hb-tracker-settings-btn-label' }, [
        'Import backup',
        el('div', { class: 'hb-tracker-settings-btn-hint' }, 'Restore from a previously exported JSON file')
      ])
    ]);

    var deleteBtn = el('button', {
      class: 'hb-tracker-settings-btn is-danger',
      type: 'button',
      onclick: handleDeleteAllData
    }, [
      el('span', { class: 'hb-tracker-settings-btn-icon' }, '\u2716'),
      el('span', { class: 'hb-tracker-settings-btn-label' }, [
        'Delete all data',
        el('div', { class: 'hb-tracker-settings-btn-hint' }, 'Permanently wipe entries, streak, and quiz result')
      ])
    ]);

    return el('div', { class: 'hb-tracker-settings' }, [
      el('p', { class: 'hb-tracker-settings-title' }, 'Settings'),
      el('p', { class: 'hb-tracker-settings-subtitle' }, 'Back up, restore, or wipe your tracker data.'),
      el('div', { class: 'hb-tracker-settings-row' }, [exportBtn, importBtn, deleteBtn]),
      fileInput
    ]);
  }

    function injectPrivacyFooterStyles() {
    if (document.getElementById('hb-privacy-footer-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-privacy-footer-styles';
    style.textContent = ''
      + '.hb-tracker-privacy-footer{margin-top:40px;padding:20px 22px;background:#F4ECDD;border:1px solid #E8E2D3;border-radius:12px;font-size:13px;color:#5A5048;line-height:1.55;text-align:center}'
      + '.hb-tracker-privacy-footer-title{font-weight:600;color:#1A2A4A;margin:0 0 6px 0;font-size:13px}'
      + '.hb-tracker-privacy-footer-text{margin:0;font-size:12.5px}'
      + '@media (max-width:479px){.hb-tracker-privacy-footer{padding:16px 18px;margin-top:32px}.hb-tracker-privacy-footer-title{font-size:12.5px}.hb-tracker-privacy-footer-text{font-size:12px}}';
    document.head.appendChild(style);
  }

  function renderPrivacyFooter() {
    return el('div', { class: 'hb-tracker-privacy-footer' }, [
      el('p', { class: 'hb-tracker-privacy-footer-title' }, '\u{1F512} Your data lives in this browser only'),
      el('p', { class: 'hb-tracker-privacy-footer-text' }, "We never see your entries \u2014 they're stored locally on this device. Clearing your browser data (cookies, cache, site data) will permanently delete all daily logs and your streak.")
    ]);
  }

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

  // Helper: after hiding elements, walk up and hide empty parent wrappers
  // (those whose all element-children are now hb-collapsed or display:none)
  // Returns array of wrappers that were hidden — caller passes these to toggle so
  // Show more can re-show them along with their children.
  function hideEmptyParents(startEl, maxDepth) {
    maxDepth = maxDepth || 4;
    var parent = startEl.parentElement;
    var depth = 0;
    var hiddenWrappers = [];
    while (parent && depth < maxDepth) {
      // Don't climb past major section boundaries
      var tag = parent.tagName;
      if (tag === 'SECTION' || tag === 'ARTICLE' || tag === 'ASIDE' ||
          tag === 'MAIN' || tag === 'BODY' || tag === 'NAV' ||
          tag === 'HEADER' || tag === 'FOOTER') break;
      // Don't hide if it has sibling text content
      var hasVisibleChild = false;
      for (var i = 0; i < parent.children.length; i++) {
        var child = parent.children[i];
        if (child.classList.contains('hb-collapsed')) continue;
        hasVisibleChild = true;
        break;
      }
      if (hasVisibleChild) break;
      parent.classList.add('hb-collapsed');
      hiddenWrappers.push(parent);
      parent = parent.parentElement;
      depth++;
    }
    return hiddenWrappers;
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
    // allHidden = paragraphs + wrappers (everything toggle needs to manage)
    var allHidden = hidden.slice();
    hidden.forEach(function(p) { p.classList.add('hb-collapsed'); });
    // Hide empty parent wrappers and collect them
    hidden.forEach(function(p) {
      var wrappers = hideEmptyParents(p, 4);
      wrappers.forEach(function(w) { allHidden.push(w); });
    });
    if (heading.dataset) heading.dataset.hbCollapsed = '1';
    addCollapseToggle(paragraphs[0], allHidden, 'About');
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
    var allHidden = hidden.slice();
    hidden.forEach(function(el) { el.classList.add('hb-collapsed'); });
    // Hide empty parent wrappers and collect them so toggle can re-show
    hidden.forEach(function(el) {
      var wrappers = hideEmptyParents(el, 5);
      wrappers.forEach(function(w) { allHidden.push(w); });
    });

    // PERMANENTLY strip all borders and <hr> from FAQ section.
    // Per user request: those lines are not needed at all, even when expanded.
    // Find the FAQ section by walking up from the heading.
    var faqSection = heading;
    var depth = 0;
    while (faqSection && depth < 6) {
      var tag = faqSection.tagName;
      if (tag === 'SECTION' || tag === 'MAIN' || tag === 'BODY') break;
      faqSection = faqSection.parentElement;
      depth++;
    }
    if (faqSection) {
      var allInFAQ = faqSection.querySelectorAll('*');
      for (var f = 0; f < allInFAQ.length; f++) {
        var fel = allInFAQ[f];
        if (isInsideAppRoots(fel)) continue;
        if (fel.tagName === 'HR') {
          fel.style.setProperty('display', 'none', 'important');
        } else {
          fel.style.setProperty('border-top', '0', 'important');
          fel.style.setProperty('border-bottom', '0', 'important');
          fel.style.setProperty('box-shadow', 'none', 'important');
        }
      }
      // Also strip borders from FAQ section itself
      faqSection.style.setProperty('border-top', '0', 'important');
      faqSection.style.setProperty('border-bottom', '0', 'important');
    }

    if (heading.dataset) heading.dataset.hbCollapsed = '1';
    addCollapseToggle(items[1], allHidden, 'FAQ');
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
      + '.hb-tracker-heatmap-labels span{display:block;width:100%;font-size:10px;color:#8B928E;text-align:center;font-weight:600;letter-spacing:0.5px}'
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
      'Fill in or edit this day, then save. Tap ',
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
      '. Tap any day to fill it in or edit it, or ',
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

  /* #11 — cycle layer styles (mobile-responsive) */
  function injectCycleStyles() {
    if (document.getElementById('hb-cycle-styles')) return;
    var s = document.createElement('style');
    s.id = 'hb-cycle-styles';
    s.textContent = ''
      + '.hb-tracker-heatmap-cell{position:relative;overflow:hidden}'
      + '.hb-cyc-bar{position:absolute;left:3px;right:3px;bottom:3px;height:3px;border-radius:2px;pointer-events:none}'
      + '.hb-cyc-bar.is-period{background:#E23B4E}'
      + '.hb-cyc-bar.is-fertile{background:#4A90D9}'
      + '.hb-cyc-bar.is-pred{background:repeating-linear-gradient(90deg,#E23B4E 0 3px,transparent 3px 6px)}'
      + '.hb-cyc-ovu{position:absolute;top:3px;left:50%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:#8B5CF6;box-shadow:0 0 0 1.5px #FFFFFF;pointer-events:none}'
      // period toggle
      + '.hb-tracker-period-toggle{display:inline-flex;align-items:center;gap:9px;padding:11px 16px;border:1.5px solid #E8E2D3;border-radius:10px;background:#FFFFFF;font-family:inherit;font-size:14px;font-weight:500;color:#5F5E5A;cursor:pointer;transition:all 150ms}'
      + '.hb-tracker-period-toggle:hover{border-color:#C9C2AE}'
      + '.hb-tracker-period-toggle.is-on{border-color:#E23B4E;background:#FDEEF0;color:#A01F30}'
      + '.hb-tracker-period-dot{width:13px;height:13px;border-radius:50%;border:2px solid #C9C2AE;flex-shrink:0;box-sizing:border-box}'
      + '.hb-tracker-period-toggle.is-on .hb-tracker-period-dot{background:#E23B4E;border-color:#E23B4E}'
      // cycle legend
      + '.hb-cyc-legend{margin:12px 0 0;padding:11px 13px;background:#FCF8F0;border:1px solid #EADFC8;border-radius:10px}'
      + '.hb-cyc-legend-t{font-family:sans-serif;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#8B928E;margin:0 0 8px 0}'
      + '.hb-cyc-legend-items{display:flex;flex-wrap:wrap;gap:8px 16px}'
      + '.hb-cyc-li{display:flex;align-items:center;gap:6px;font-size:12px;color:#4A4038}'
      + '.hb-cyc-sw{width:18px;height:5px;border-radius:3px;display:inline-block;flex-shrink:0}'
      + '.hb-cyc-sw.is-period{background:#E23B4E}'
      + '.hb-cyc-sw.is-fertile{background:#4A90D9}'
      + '.hb-cyc-sw.is-pred{background:repeating-linear-gradient(90deg,#E23B4E 0 4px,transparent 4px 7px)}'
      + '.hb-cyc-sw-dot{width:11px;height:11px;border-radius:50%;background:#8B5CF6;box-shadow:0 0 0 1.5px #FFFFFF,0 0 0 2.5px #8B5CF6;display:inline-block;flex-shrink:0;margin:0 1px}'
      + '.hb-cyc-disclaimer{font-size:11px;color:#8B928E;margin:8px 0 0 0;line-height:1.4}'
      + '.hb-cyc-hint{margin:12px 0 0;padding:12px 14px;background:#FCF8F0;border:1px dashed #E0C9B0;border-radius:10px;display:flex;gap:10px;align-items:flex-start}'
      + '.hb-cyc-hint-icon{font-size:16px;line-height:1.3;flex-shrink:0}'
      + '.hb-cyc-hint-text{font-size:12.5px;color:#5F5E5A;line-height:1.5;margin:0}'
      + '.hb-cyc-hint-text strong{color:#1A2A4A}'
      + '@media (max-width:478px){.hb-cyc-hint{padding:11px 12px}.hb-cyc-hint-text{font-size:12px}}'
      // ---- mobile ----
      + '@media (max-width:478px){'
      +   '.hb-cyc-bar{height:2.5px;left:2px;right:2px;bottom:2px}'
      +   '.hb-cyc-ovu{width:5px;height:5px;top:2px}'
      +   '.hb-cyc-legend-items{gap:7px 12px}'
      +   '.hb-cyc-li{font-size:11px;gap:5px}'
      +   '.hb-cyc-sw{width:15px}'
      +   '.hb-tracker-period-toggle{font-size:13px;padding:10px 14px}'
      + '}';
    document.head.appendChild(s);
  }

  function renderCycleHint() {
    return el('div', { class: 'hb-cyc-hint' }, [
      el('span', { class: 'hb-cyc-hint-icon', 'aria-hidden': 'true' }, '\uD83D\uDD34'),
      el('p', { class: 'hb-cyc-hint-text' }, [
        el('strong', null, 'Track your cycle here. '),
        'On the days you bleed, switch on ',
        el('strong', null, '\u201CPeriod\u201D'),
        ' in your check-in above. After a couple of cycles, this calendar will mark your period, fertile window and ovulation \u2014 estimated from your dates, not a method of contraception.'
      ])
    ]);
  }

  function renderCycleLegend() {
    function li(sw, label) { return el('span', { class: 'hb-cyc-li' }, [sw, el('span', null, label)]); }
    var items = el('div', { class: 'hb-cyc-legend-items' }, [
      li(el('span', { class: 'hb-cyc-sw is-period' }), 'Period'),
      li(el('span', { class: 'hb-cyc-sw is-pred' }), 'Predicted period'),
      li(el('span', { class: 'hb-cyc-sw is-fertile' }), 'Fertile window'),
      li(el('span', { class: 'hb-cyc-sw-dot' }), 'Ovulation')
    ]);
    return el('div', { class: 'hb-cyc-legend' }, [
      el('p', { class: 'hb-cyc-legend-t' }, 'Cycle'),
      items,
      el('p', { class: 'hb-cyc-disclaimer' }, '\u2248 Estimated from your logged period dates \u2014 not a method of contraception.')
    ]);
  }

  function renderHeatmapCalendar() {
    var viewYM = getViewMonthYear();
    var gridCells = getCalendarGrid(viewYM);

    injectCycleStyles();
    var todayKey = state.today;
    var cycleOn = !!(typeConfig && typeConfig.cycleVisible);
    var cycleMarkers = cycleOn ? computeCycleMarkers(state.entries, todayKey) : {};
    var hasPeriodData = cycleOn && Object.keys(state.entries).some(function(k) {
      return state.entries[k] && state.entries[k].period === true;
    });
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
        var kids = [String(dayNum)];
        var m = cycleMarkers[cellKeyClosure];
        if (m) {
          if (m.ovulation) kids.push(el('span', { class: 'hb-cyc-ovu', 'aria-hidden': 'true' }));
          var barCls = m.period ? 'hb-cyc-bar is-period'
                     : (m.predPeriod ? 'hb-cyc-bar is-pred'
                     : (m.fertile ? 'hb-cyc-bar is-fertile' : null));
          if (barCls) kids.push(el('span', { class: barCls, 'aria-hidden': 'true' }));
        }
        grid.appendChild(el('button', props, kids));
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

    var heatmapChildren = [
      renderCalendarNavigation(),
      labelsRow,
      grid,
      legend
    ];
    if (hasPeriodData) heatmapChildren.push(renderCycleLegend());
    else if (cycleOn) heatmapChildren.push(renderCycleHint());

    return el('div', { class: 'hb-tracker-heatmap-wrap' }, heatmapChildren);
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
    state.saveJustSucceeded = false;
    buildCurrentEntry(activeEditKey());
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

  function injectInsightsStyles() {
    if (document.getElementById('hb-insights-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-insights-styles';
    style.textContent = ''
      + '.hb-tracker-insights{margin-top:28px}'
      + '.hb-tracker-insights-eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C97B5C;font-weight:600;margin:0 0 6px 0}'
      + '.hb-tracker-insights-title{font-family:Newsreader,Georgia,serif;font-size:22px;color:#1A2A4A;margin:0 0 4px 0;font-weight:500;letter-spacing:-0.01em}'
      + '.hb-tracker-insights-sub{font-size:13px;color:#5A5048;margin:0 0 16px 0;line-height:1.5}'
      + '.hb-tracker-insights-empty{padding:18px 20px;background:#F4ECDD;border-radius:10px;font-size:13px;color:#5A5048;line-height:1.6;text-align:center}'
      + '.hb-tracker-insights-list{display:flex;flex-direction:column;gap:12px;margin:0}'
      + '.hb-tracker-insight{padding:18px 20px;background:#FFFFFF;border:1px solid #E8E2D3;border-radius:12px;border-left:4px solid #C97B5C;transition:transform 150ms,box-shadow 150ms}'
      + '.hb-tracker-insight.is-positive{border-left-color:#5A8C5A;background:#F4F8F1}'
      + '.hb-tracker-insight.is-actionable{border-left-color:#C97B5C}'
      + '.hb-tracker-insight.is-info{border-left-color:#1A2A4A}'
      + '.hb-tracker-insight.is-caution{border-left-color:#C9A449;background:#FCF8EE}'
      + '.hb-tracker-insight-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:6px}'
      + '.hb-tracker-insight-icon{font-size:18px;flex-shrink:0;line-height:1.2}'
      + '.hb-tracker-insight-headline{font-weight:600;color:#1A2A4A;font-size:14.5px;line-height:1.35;margin:0;flex:1}'
      + '.hb-tracker-insight-body{font-size:13px;color:#3A4555;line-height:1.6;margin:0;padding-left:28px}'
      + '.hb-tracker-insights-cta{margin-top:16px;padding:14px 18px;background:#1A2A4A;color:#FFFFFF;border-radius:10px;text-align:center;font-size:13px;line-height:1.5}'
      + '.hb-tracker-insights-cta strong{color:#C97B5C}'
      + '@media (max-width:479px){.hb-tracker-insights-title{font-size:20px}.hb-tracker-insight{padding:16px 16px}.hb-tracker-insight-headline{font-size:14px}.hb-tracker-insight-body{font-size:12.5px;padding-left:0;margin-top:4px}}';
    document.head.appendChild(style);
  }

  function slugLabel(slot) {
    var s = String(slot || '').replace('/recommends/', '');
    if (s.indexOf('blood-test') === 0 || s === 'medichecks' || s === 'everlywell' ||
        s === 'forth' || s === 'thriva' || s === 'letsgetchecked') return 'At-home blood test';
    s = s.replace(/-/g, ' ').replace(/\bd3\b/i, 'D3').replace(/\bk2\b/i, 'K2');
    return s.replace(/\b\w/g, function(m) { return m.toUpperCase(); });
  }

  function renderRecommendChip(slot) {
    if (!slot) return null;
    return el('a', {
      class: 'hb-advice-chip',
      href: slot,
      target: '_blank',
      rel: 'sponsored nofollow noopener'
    }, slugLabel(slot) + ' \u2192');
  }

  function renderAdviceCard(picked) {
    if (!picked || !picked.card) return null;
    var c = picked.card;
    var sev = c.severity || 'info';
    var eyebrow = c.eyebrow || (picked.layer === 'safety'
      ? 'Worth a gentle check'
      : (sev === 'positive' ? 'Nice \u2014 here\u2019s why' : 'A note on today\u2019s log'));
    var kids = [
      el('p', { class: 'hb-advice-eyebrow' }, eyebrow),
      el('p', { class: 'hb-advice-headline' }, c.headline)
    ];
    // Body: long-form Daily Learn uses body:[paragraphs]; legacy cards use why (string)
    if (Array.isArray(c.body)) {
      c.body.forEach(function(p) { if (p) kids.push(el('p', { class: 'hb-advice-why' }, p)); });
    } else if (c.why) {
      kids.push(el('p', { class: 'hb-advice-why' }, c.why));
    }
    // Actions: legacy actions:[...]; Daily Learn uses a single action string
    var acts = (c.actions && c.actions.length) ? c.actions : (c.action ? [c.action] : null);
    if (acts) {
      var lis = acts.map(function(a) { return el('li', { class: 'hb-advice-action' }, a); });
      kids.push(el('ul', { class: 'hb-advice-actions' }, lis));
    }
    var chip = renderRecommendChip(c.productSlot);
    if (chip) kids.push(chip);
    // Book reference: turns each card into a contextual chapter recommendation (The Hormone Blueprint)
    if (c.bookRef) {
      kids.push(el('a', {
        class: 'hb-advice-book',
        href: BOOK_URL,
        rel: 'noopener'
      }, '\uD83D\uDCD6 In the book: ' + c.bookRef));
    }
    return el('div', { class: 'hb-advice-card is-' + sev }, kids);
  }

  function injectAdviceStyles() {
    if (document.getElementById('hb-advice-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-advice-styles';
    style.textContent =
        '.hb-advice-card{margin-top:16px;padding:18px 20px;background:#FCF8F0;border:1px solid #EADFC8;border-left:4px solid #C97B5C;border-radius:12px}'
      + '.hb-advice-card.is-positive{border-left-color:#7BA05B}'
      + '.hb-advice-card.is-actionable{border-left-color:#C97B5C}'
      + '.hb-advice-card.is-info{border-left-color:#1A2A4A}'
      + '.hb-advice-card.is-caution{border-left-color:#B5642F;background:#FBEFE6}'
      + '.hb-advice-eyebrow{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#C97B5C;font-weight:600;margin:0 0 6px 0}'
      + '.hb-advice-card.is-caution .hb-advice-eyebrow{color:#B5642F}'
      + '.hb-advice-headline{font-family:Newsreader,Georgia,serif;font-size:17px;color:#1A2A4A;margin:0 0 6px 0;font-weight:500;line-height:1.3}'
      + '.hb-advice-why{font-size:13.5px;color:#4A4038;margin:0;line-height:1.6}'
      + '.hb-advice-actions{margin:10px 0 0 0;padding:0 0 0 18px}'
      + '.hb-advice-action{font-size:13px;color:#4A4038;line-height:1.55;margin:2px 0}'
      + '.hb-advice-chip{display:inline-block;margin-top:12px;padding:7px 14px;background:#1A2A4A;color:#FFFFFF;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;letter-spacing:0.2px}'
      + '.hb-advice-chip:hover{background:#243a63}'
      + '.hb-advice-book{display:block;margin-top:12px;font-size:12px;color:#5F5E5A;text-decoration:none;line-height:1.4}'
      + '.hb-advice-book:hover{color:#1A2A4A}'
      + '.hb-tracker-insight-why{font-size:13px;color:#4A4038;line-height:1.6;margin:8px 0 0 0}'
      + '.hb-tracker-insight-action{font-size:13px;color:#1A2A4A;line-height:1.55;margin:6px 0 0 0;font-weight:500}'
      /* ---- tablet ---- */
      + '@media (max-width:767px){.hb-advice-card{padding:16px 18px}.hb-advice-headline{font-size:16px}}'
      /* ---- phone ---- */
      + '@media (max-width:478px){'
      +   '.hb-advice-card{padding:14px 15px;margin-top:14px}'
      +   '.hb-advice-headline{font-size:15px}'
      +   '.hb-advice-why{font-size:12.5px}'
      +   '.hb-advice-action,.hb-tracker-insight-why,.hb-tracker-insight-action{font-size:12.5px}'
      +   '.hb-advice-chip{font-size:12px;padding:8px 14px}'
      + '}';
    document.head.appendChild(style);
  }

  function renderInsights() {
    if (typeof window.HB_INSIGHTS === 'undefined' || typeof window.HB_INSIGHTS.detectPatterns !== 'function') {
      return null;
    }

    var totalLogs = Object.keys(state.entries || {}).length;
    // Header always visible from log 1; the body adapts to data availability
    var insights = [];
    try {
      insights = window.HB_INSIGHTS.detectPatterns(state.entries, state.hormoneType) || [];
    } catch (e) {
      console.warn('HB Insights: detectPatterns failed', e);
      insights = [];
    }

    var bodyEl;
    if (totalLogs < 7) {
      bodyEl = el('div', { class: 'hb-tracker-insights-empty' },
        'Pattern detection unlocks after 7 logs. You have ' + totalLogs + '/7 — keep going.');
    } else if (insights.length === 0) {
      bodyEl = el('div', { class: 'hb-tracker-insights-empty' },
        "No strong patterns yet — that's actually good news. Keep logging; patterns emerge as your data grows.");
    } else {
      var items = insights.map(function(ins) {
        var insChildren = [
          el('div', { class: 'hb-tracker-insight-head' }, [
            el('span', { class: 'hb-tracker-insight-icon' }, ins.icon || '\u{1F4CA}'),
            el('p', { class: 'hb-tracker-insight-headline' }, ins.headline)
          ]),
          el('p', { class: 'hb-tracker-insight-body' }, ins.body)
        ];
        if (ins.advice) {
          if (ins.advice.why)    insChildren.push(el('p', { class: 'hb-tracker-insight-why' }, ins.advice.why));
          if (ins.advice.action) insChildren.push(el('p', { class: 'hb-tracker-insight-action' }, ins.advice.action));
          var insChip = renderRecommendChip(ins.advice.productSlot);
          if (insChip) insChildren.push(insChip);
        }
        return el('div', { class: 'hb-tracker-insight is-' + (ins.severity || 'info') }, insChildren);
      });
      bodyEl = el('div', { class: 'hb-tracker-insights-list' }, items);
    }

    var children = [
      el('p', { class: 'hb-tracker-insights-eyebrow' }, 'What your data shows'),
      el('h3', { class: 'hb-tracker-insights-title' }, 'Your patterns'),
      el('p', { class: 'hb-tracker-insights-sub' }, totalLogs >= 7 && insights.length > 0
        ? 'Detected from your last ' + totalLogs + ' logs. The more you log, the sharper these get.'
        : 'Tracking reveals hormonal rhythms over time. Patterns deepen with each log.'),
      bodyEl
    ];

    if (totalLogs >= 14 && insights.length > 0) {
      children.push(el('div', { class: 'hb-tracker-insights-cta', html:
        'Want the full framework? <strong>The Hormone Blueprint</strong> covers each of these patterns in depth.'
      }));
    }

    return el('div', { class: 'hb-tracker-insights' }, children);
  }

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

  // #11 — Period toggle. Powers the cycle layer (predictions from bleed days).
  function renderPeriodField() {
    if (!typeConfig.cycleVisible) return null;
    var on = state.currentEntry.period === true;
    var btn = el('button', {
      class: 'hb-tracker-period-toggle' + (on ? ' is-on' : ''),
      type: 'button',
      'aria-pressed': on ? 'true' : 'false',
      onclick: function() { state.currentEntry.period = !on; renderTracker(); }
    }, [
      el('span', { class: 'hb-tracker-period-dot', 'aria-hidden': 'true' }),
      el('span', null, on ? 'On my period today' : 'Not on my period')
    ]);
    return el('div', { class: 'hb-tracker-field' }, [
      el('p', { class: 'hb-tracker-field-label is-optional' }, 'Period'),
      el('p', { class: 'hb-tracker-field-help' }, 'Tap on the days you bleed \u2014 this is what powers your cycle calendar below.'),
      btn
    ]);
  }

  function renderSymptomsField() {
    var fieldDef = HB_TRACKER_DATA.fields.symptoms;
    var selected = state.currentEntry.symptoms || [];
    var emphasized = typeConfig.emphasizedSymptoms || [];
    var relevant = typeConfig.relevantSymptoms;
    var max = fieldDef.maxSelections || 5;

    // Filter to type-relevant symptoms if defined; else show full pool.
    // Backward compat: typeConfigs without relevantSymptoms continue to show all.
    var symptomsPool = relevant
      ? HB_TRACKER_DATA.allSymptoms.filter(function(opt) {
          return relevant.indexOf(opt.value) !== -1;
        })
      : HB_TRACKER_DATA.allSymptoms;

    var sortedSymptoms = symptomsPool.slice().sort(function(a, b) {
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
    var target = activeEditKey();
    var isPast = target !== state.today;
    var existingEntry = state.entries[target];
    var isUpdate = !!existingEntry;
    var hasEnergy = state.currentEntry.energy != null;
    var canSave = hasEnergy;

    var btnLabel;
    if (state.saveJustSucceeded) btnLabel = 'Saved ✓';
    else if (isPast) btnLabel = isUpdate ? 'Update this day' : 'Save this day';
    else btnLabel = isUpdate ? "Update today's entry" : "Save today's entry";

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
    var target = activeEditKey();
    var isToday = (target === state.today);

    state.entries[target] = {
      energy: state.currentEntry.energy,
      sleep: state.currentEntry.sleep,
      cycle_day: state.currentEntry.cycle_day,
      period: state.currentEntry.period === true,
      symptoms: state.currentEntry.symptoms || [],
      notes: state.currentEntry.notes || '',
      timestamp: new Date().toISOString()
    };
    saveEntries();

    // Advice card only applies to TODAY's log. Editing a past day must not
    // change the advice shown for today.
    if (isToday) {
      // v2 advice layer: context-first (bad day -> teaching), else a Daily Learn
      // article (good/neutral day), with per-id rotation + anti-repeat cooldown.
      try {
        if (window.HB_ADVICE && typeof window.HB_ADVICE.pickCard === 'function') {
          state.lastLogCard = window.HB_ADVICE.pickCard(
            state.entries[state.today], state.entries, state.adviceRotation, state.adviceRecent, state.hormoneType
          );
          var picked = state.lastLogCard;
          if (picked && picked.key && picked.layer !== 'safety') {
            state.adviceRotation[picked.key] = (state.adviceRotation[picked.key] || 0) + 1;
            saveRotation();
          }
          if (picked && picked.layer === 'daily' && picked.key) {
            state.adviceRecent.push(picked.key);
            if (state.adviceRecent.length > RECENT_MAX) {
              state.adviceRecent = state.adviceRecent.slice(state.adviceRecent.length - RECENT_MAX);
            }
            saveAdviceRecent();
          }
        } else if (window.HB_ADVICE && typeof window.HB_ADVICE.pickPerLogCard === 'function') {
          state.lastLogCard = window.HB_ADVICE.pickPerLogCard(state.entries[state.today], state.entries, state.adviceRotation);
          if (state.lastLogCard && state.lastLogCard.layer === 'perLog' && state.lastLogCard.key) {
            state.adviceRotation[state.lastLogCard.key] = (state.adviceRotation[state.lastLogCard.key] || 0) + 1;
            saveRotation();
          }
        }
      } catch (e) { state.lastLogCard = null; }
      saveLastLogCard();
    }

    // Streak: recompute from all entries (correct after filling/editing past days).
    var prevCurrent = state.streak.current || 0;
    recomputeStreak();

    // Milestone toast only on a brand-new TODAY log that crosses a milestone.
    var milestone = null;
    if (isToday && !isUpdate) {
      var milestones = [1, 3, 7, 14, 30, 60, 90];
      if (milestones.indexOf(state.streak.current) !== -1 && state.streak.current !== prevCurrent) {
        milestone = state.streak.current;
      }
      trackEvent('log_complete', { hormone_type: state.hormoneType, streak: state.streak.current });
    } else if (isUpdate) {
      trackEvent('log_update', { hormone_type: state.hormoneType, past_day: !isToday });
    } else {
      trackEvent('log_past_day', { hormone_type: state.hormoneType });
    }

    if (milestone) trackEvent('streak_milestone', { days: milestone });

    state.saveJustSucceeded = true;
    renderTracker();

    setTimeout(function() {
      state.saveJustSucceeded = false;
      renderTracker();
    }, 2200);
  }

  /* PAST-DAY EDITOR (#9 — fill or edit any past day) */

  function exitPastDay(toToday) {
    state.selectedDayKey = null;
    if (toToday) state.viewMonthOffset = 0;
    state.saveJustSucceeded = false;
    buildCurrentEntry(state.today);
    renderTracker();
  }

  function renderDeleteDayLink(key) {
    return el('div', { class: 'hb-tracker-pastday-delete-row', style: 'text-align:center;margin-top:8px' }, [
      el('button', {
        class: 'hb-tracker-pastday-delete',
        type: 'button',
        style: 'background:none;border:none;color:#B23E1E;font-size:12px;text-decoration:underline;cursor:pointer;padding:6px 4px;font-family:inherit',
        onclick: function() {
          var ok = (typeof window.confirm === 'function')
            ? window.confirm('Delete this day\u2019s log? This can\u2019t be undone.')
            : true;
          if (!ok) return;
          delete state.entries[key];
          saveEntries();
          recomputeStreak();
          trackEvent('log_delete_day', { hormone_type: state.hormoneType });
          exitPastDay(false);
        }
      }, 'Delete this day\u2019s log')
    ]);
  }

  function renderPastDayEditor() {
    var key = state.selectedDayKey;
    var existing = state.entries[key];
    var dateStr = formatDateFromKey(key);

    var header = el('div', { class: 'hb-tracker-selected-day-header' }, [
      el('div', null, [
        el('p', { class: 'hb-tracker-selected-day-eyebrow' }, existing ? 'Editing this day' : 'Add this day'),
        el('h3', { class: 'hb-tracker-selected-day-date' }, dateStr)
      ]),
      el('button', {
        class: 'hb-tracker-selected-day-close',
        type: 'button',
        'aria-label': 'Close, stay on this month',
        title: 'Close (stay on this month)',
        onclick: function() {
          state.selectedDayKey = null;
          state.saveJustSucceeded = false;
          buildCurrentEntry(state.today);
          renderTracker();
        }
      }, '×')
    ]);

    var fields = [header, renderEnergyField(), renderSleepField()];
    var cycleField = renderCycleDayField();
    if (cycleField) fields.push(cycleField);
    var periodFieldPast = renderPeriodField();
    if (periodFieldPast) fields.push(periodFieldPast);
    fields.push(renderSymptomsField());
    fields.push(renderNotesField());
    fields.push(renderSaveButton());
    if (existing) fields.push(renderDeleteDayLink(key));
    fields.push(el('button', {
      class: 'hb-tracker-selected-day-return',
      type: 'button',
      'aria-label': 'Return to today',
      onclick: function() { exitPastDay(true); }
    }, '← Return to today'));

    return el('div', { class: 'hb-tracker-selected-day hb-tracker-pastday-editor' }, fields);
  }

  /* MAIN TRACKER RENDER (v1.6.1 — compact bar at top + form-first in TODAY mode) */

  function renderTracker() {
    // Preserve scroll position across re-renders so field clicks (energy,
    // symptoms, period toggle) don't jump the page — especially when editing
    // a past day, where the editor sits well down the page.
    var _scrollY = (typeof window !== 'undefined')
      ? (window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0)
      : 0;
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
      children.push(renderPastDayEditor());
    } else if (isViewingPastMonth) {
      children.push(renderPastMonthHint());
      children.push(renderHeatmapCalendar());
      var insightsEl = renderInsights();
      if (insightsEl) children.push(insightsEl);
      children.push(renderJourneyProgress());
    } else {
      // TODAY MODE — FORM FIRST (v1.6.0)
      if (hasLoggedToday) {
        children.push(renderLoggedTodayBanner());
        var adviceCardEl = renderAdviceCard(state.lastLogCard);
        if (adviceCardEl) children.push(adviceCardEl);
      }
      children.push(renderEnergyField());
      children.push(renderSleepField());
      var cycleField = renderCycleDayField();
      if (cycleField) children.push(cycleField);
      var periodFieldToday = renderPeriodField();
      if (periodFieldToday) children.push(periodFieldToday);
      children.push(renderSymptomsField());
      children.push(renderNotesField());
      children.push(renderSaveButton());
      children.push(renderDivider());
      children.push(renderHistorySectionEyebrow());
      children.push(renderHeatmapCalendar());
      var insightsEl = renderInsights();
      if (insightsEl) children.push(insightsEl);
      children.push(renderJourneyProgress());
    }

    children.push(renderSettings());
    children.push(renderPrivacyFooter());

    rootEl.appendChild(el('div', { class: 'hb-tracker' }, children));

    // Restore scroll so the page stays put after a field-change re-render.
    // (handleDayClick runs its own scrollIntoView in a later tick, so this
    // does not interfere with jumping to a selected past day.)
    if (_scrollY > 0 && typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo(0, _scrollY);
    }
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
    injectPrivacyFooterStyles();
    injectSettingsStyles();
    injectDeleteModalStyles();
    injectInsightsStyles();
    injectAdviceStyles();

    state.today = getTodayKey();
    state.viewMonthOffset = 0;
    loadEntries();
    loadStreak();
    loadRotation();
    loadAdviceRecent();
    loadLastLogCard();
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
    version: '1.7.5',
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
