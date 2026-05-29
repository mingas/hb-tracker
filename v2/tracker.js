/**
 * hb-tracker / v2 / tracker.js
 *
 * Daily Tracker — UI rendering + state + localStorage logic
 *
 * Depends on:
 *   - window.HB_TRACKER_DATA (tracker-data.js)
 *   - localStorage hb_quiz_state (read-only, for hormoneType)
 *
 * Mounts into: #hb-tracker-root (gracefully skips if absent)
 * Persists to: localStorage[hb_tracker_entries], localStorage[hb_tracker_streak]
 * Tracks: GA4 events (log_complete, log_update, streak_milestone)
 *
 * @version 1.0.0
 * @license MIT
 */

(function() {
  'use strict';

  var STORAGE_KEY_ENTRIES = 'hb_tracker_entries';
  var STORAGE_KEY_STREAK  = 'hb_tracker_streak';
  var QUIZ_STORAGE_KEY    = 'hb_quiz_state';
  var ROOT_ID             = 'hb-tracker-root';

  var state = {
    today: '',
    entries: {},
    streak: { current: 0, best: 0, last_log_date: null },
    hormoneType: null,
    currentEntry: null,
    saveJustSucceeded: false
  };

  var rootEl = null;
  var typeConfig = null;

  /* ============================================================
     DATE HELPERS (LOCAL timezone — NOT UTC)
     ============================================================ */

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function dateKeyForOffsetDays(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function getTodayKey()     { return dateKeyForOffsetDays(0); }
  function getYesterdayKey() { return dateKeyForOffsetDays(-1); }

  function getFormattedDate() {
    var d = new Date();
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
  }

  /* ============================================================
     STORAGE (incognito-safe with try/catch)
     ============================================================ */

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

  /* ============================================================
     GA4 TRACKING
     ============================================================ */

  function trackEvent(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    } catch (e) {}
  }

  /* ============================================================
     STREAK LOGIC
     ============================================================ */

  function maybeUpdateStreakOnNewLog() {
    var today = state.today;
    var yesterday = getYesterdayKey();

    if (state.streak.last_log_date === today) {
      return null; // Already counted today
    }

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

  /* ============================================================
     DOM HELPER
     ============================================================ */

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

  /* ============================================================
     NO-QUIZ PROMPT
     ============================================================ */

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

  /* ============================================================
     CHECK ICON SVG
     ============================================================ */

  var CHECK_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ============================================================
     HEADER (date + welcome + streak)
     ============================================================ */

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

  /* ============================================================
     ALREADY LOGGED TODAY BANNER
     ============================================================ */

  function renderLoggedTodayBanner() {
    var title = state.saveJustSucceeded ? 'Logged for today ✓' : "You've already logged today";
    var desc = state.saveJustSucceeded
      ? 'Your entry is saved. Come back tomorrow to keep the streak.'
      : 'Your entry below shows what you logged. You can update it any time today.';
    return el('div', { class: 'hb-tracker-logged-today' }, [
      el('div', { class: 'hb-tracker-logged-icon', html: CHECK_ICON_SVG }),
      el('div', { class: 'hb-tracker-logged-text' }, [
        el('p', { class: 'hb-tracker-logged-title' }, title),
        el('p', { class: 'hb-tracker-logged-desc' }, desc)
      ])
    ]);
  }

  /* ============================================================
     FIELD: ENERGY SCALE
     ============================================================ */

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
        emojiRow,
        buttonsRow,
        el('p', { class: 'hb-tracker-scale-label' }, labelText)
      ])
    ]);
  }

  /* ============================================================
     FIELD: SLEEP SLIDER
     ============================================================ */

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

  /* ============================================================
     FIELD: CYCLE DAY (hidden for postmenopause)
     ============================================================ */

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

  /* ============================================================
     FIELD: SYMPTOMS CHIPS (emphasized first per type)
     ============================================================ */

  function renderSymptomsField() {
    var fieldDef = HB_TRACKER_DATA.fields.symptoms;
    var selected = state.currentEntry.symptoms || [];
    var emphasized = typeConfig.emphasizedSymptoms || [];
    var max = fieldDef.maxSelections || 5;

    // Sort: emphasized first (in their defined order), then rest alphabetically
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
      chipsRow,
      counter
    ]);
  }

  /* ============================================================
     FIELD: NOTES TEXTAREA WITH CHAR COUNTER
     ============================================================ */

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

  /* ============================================================
     SAVE BUTTON
     ============================================================ */

  function renderSaveButton() {
    var existingEntry = state.entries[state.today];
    var isUpdate = !!existingEntry;
    var hasEnergy = state.currentEntry.energy != null;
    var canSave = hasEnergy;

    var btnLabel;
    if (state.saveJustSucceeded) btnLabel = 'Saved ✓';
    else if (isUpdate) btnLabel = 'Update today\'s entry';
    else btnLabel = 'Save today\'s entry';

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

  /* ============================================================
     SAVE FLOW
     ============================================================ */

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

    if (milestone) {
      trackEvent('streak_milestone', { days: milestone });
    }

    state.saveJustSucceeded = true;
    renderTracker();

    setTimeout(function() {
      state.saveJustSucceeded = false;
      renderTracker();
    }, 2200);
  }

  /* ============================================================
     MAIN TRACKER RENDER
     ============================================================ */

  function renderTracker() {
    clearRoot();

    var hasLoggedToday = !!state.entries[state.today];

    var children = [renderHeader()];

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

    rootEl.appendChild(el('div', { class: 'hb-tracker' }, children));
  }

  /* ============================================================
     INIT
     ============================================================ */

  function init() {
    if (typeof window.HB_TRACKER_DATA === 'undefined') {
      console.error('HB Tracker: HB_TRACKER_DATA not loaded — check tracker-data.js loads before tracker.js');
      return;
    }

    rootEl = document.getElementById(ROOT_ID);
    if (!rootEl) {
      // Mount point not on this page — graceful skip
      return;
    }

    state.today = getTodayKey();
    loadEntries();
    loadStreak();
    loadQuizHormoneType();

    // No quiz result → prompt user to take quiz first
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

    // Initialize currentEntry from today's saved entry (if exists) or blank
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
        energy: null,
        sleep: null,
        cycle_day: null,
        symptoms: [],
        notes: ''
      };
    }

    renderTracker();
  }

  /* ============================================================
     EXPORT GLOBAL (for debugging + future integrations)
     ============================================================ */

  window.HB_TRACKER = {
    version: '1.0.0',
    mount: init,
    getEntry: function(dateKey) { return state.entries[dateKey] || null; },
    getStreak: function() { return state.streak; },
    getAllEntries: function() { return state.entries; }
  };

  /* ============================================================
     AUTO-INIT
     ============================================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
