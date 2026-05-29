/**
 * hb-tracker / v1 / quiz.js
 *
 * Hormone Type Quiz — UI rendering & flow logic
 *
 * Depends on:
 *   - window.HB_QUIZ_DATA  (questions.js)
 *   - window.HB_QUIZ_SCORE (scoring.js)
 *
 * Mounts into: #hb-quiz-root
 * Persists to: localStorage['hb_quiz_state']
 * Injects: Schema.org JSON-LD (WebApplication + FAQPage) into <head>
 * Tracks: GA4 events (quiz_start, quiz_complete, result_view)
 *
 * @version 1.3.0
 * @license MIT
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'hb_quiz_state';
  var PRIVACY_SEEN_KEY = 'hb_privacy_seen';
  var ROOT_ID = 'hb-quiz-root';

  var state = {
    screen: 'onboarding',
    currentIndex: 0,
    answers: {},
    result: null
  };

  var rootEl = null;

  /* STORAGE */

  function loadState() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        Object.keys(parsed).forEach(function(k) { state[k] = parsed[k]; });
      }
    } catch (e) { console.warn('HB Quiz: could not load state', e); }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('HB Quiz: could not save state', e); }
  }

  function hasSeenPrivacy() {
    try { return localStorage.getItem(PRIVACY_SEEN_KEY) === '1'; }
    catch (e) { return false; }
  }

  function markPrivacySeen() {
    try { localStorage.setItem(PRIVACY_SEEN_KEY, '1'); } catch (e) {}
  }

  function fullReset() {
    state.screen = 'onboarding';
    state.currentIndex = 0;
    state.answers = {};
    state.result = null;
    try { localStorage.removeItem(PRIVACY_SEEN_KEY); } catch (e) {}
    saveState();
  }

  function hasInProgressState() {
    if (state.result) return true;
    if (state.currentIndex > 0) return true;
    if (state.answers && Object.keys(state.answers).length > 0) return true;
    return false;
  }

  /* GA4 TRACKING */

  function trackEvent(eventName, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
      }
    } catch (e) {}
  }

  /* RESTART + WELCOME BACK STYLES (inline injection) */

  function injectRestartStyles() {
    if (document.getElementById('hb-quiz-restart-styles')) return;
    var style = document.createElement('style');
    style.id = 'hb-quiz-restart-styles';
    style.textContent = ''
      + '.hb-quiz-restart-row{display:flex;justify-content:flex-end;margin-bottom:4px}'
      + '.hb-quiz-restart-link{background:none;border:none;color:#8B928E;font-size:12px;cursor:pointer;padding:4px 0;text-decoration:underline;font-family:inherit;transition:color 150ms}'
      + '.hb-quiz-restart-link:hover{color:#1A2A4A}'
      + '.hb-quiz-welcome{display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 8px;gap:18px}'
      + '.hb-quiz-welcome-icon{width:56px;height:56px;border-radius:50%;background:#F4ECDD;display:flex;align-items:center;justify-content:center;color:#C97B5C;font-size:28px;line-height:1}'
      + '.hb-quiz-welcome-title{font-family:Newsreader,Georgia,serif;font-size:26px;font-weight:500;color:#1A2A4A;margin:0;letter-spacing:-0.01em}'
      + '.hb-quiz-welcome-subtitle{font-size:14px;color:#5F5E5A;margin:0;max-width:380px;line-height:1.55}'
      + '.hb-quiz-welcome-buttons{display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px;margin-top:8px}'
      + '.hb-quiz-welcome-primary{background:#C97B5C;color:#FFFFFF;border:none;border-radius:10px;padding:14px 24px;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:background-color 150ms}'
      + '.hb-quiz-welcome-primary:hover{background:#B86E51}'
      + '.hb-quiz-welcome-secondary{background:transparent;color:#5F5E5A;border:1px solid #E8E2D3;border-radius:10px;padding:13px 24px;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:all 150ms}'
      + '.hb-quiz-welcome-secondary:hover{color:#1A2A4A;border-color:#C9C2AE}';
    document.head.appendChild(style);
  }

  /* JSON-LD INJECTION (SEO) */

  function injectJsonLd() {
    if (document.querySelector('script[data-hb-jsonld]')) return;

    var webApp = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Hormone Type Quiz",
      "alternateName": "The Hormone Blueprint Quiz",
      "url": "https://testosteroneblueprintguide.com/hormone-quiz",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript enabled",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "description": "Free 12-question hormone type assessment using STRAW+10 clinical framework. Identifies one of 5 hormone types: Cycle Surfer, Estrogen Dominant, Progesterone Deficient, Perimenopause Transitioner, or Postmenopause Renewer.",
      "audience": { "@type": "Audience", "audienceType": "Women aged 18-65" },
      "publisher": { "@type": "Organization", "name": "The Hormone Blueprint", "url": "https://hormoneblueprintguide.com" },
      "inLanguage": "en"
    };

    var faqPage = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "What is a hormone type quiz?", "acceptedAnswer": { "@type": "Answer", "text": "A science-based questionnaire identifying your dominant hormonal profile based on age, cycle status, symptoms, and lifestyle. Uses the STRAW+10 framework for clinical grounding." } },
        { "@type": "Question", "name": "Is this hormone test free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free. No signup, no email required, no credit card. The Daily Tracker that follows is also free." } },
        { "@type": "Question", "name": "Is my data private?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. All answers and results are stored only in your browser local storage on your device. No backend server, no database of users. Data never reaches us." } },
        { "@type": "Question", "name": "Can this replace a doctor's diagnosis?", "acceptedAnswer": { "@type": "Answer", "text": "No. This is a self-assessment tool, not a medical diagnosis. Only a licensed healthcare provider can diagnose specific conditions like PCOS, perimenopause, or thyroid disorders." } },
        { "@type": "Question", "name": "What are the 5 hormone types?", "acceptedAnswer": { "@type": "Answer", "text": "Cycle Surfer (regular cycles), Estrogen Dominant (PMS, breast tenderness), Progesterone Deficient (anxiety, sleep issues), Perimenopause Transitioner (hot flashes, brain fog), and Postmenopause Renewer (post-menopausal stability)." } },
        { "@type": "Question", "name": "What is STRAW+10?", "acceptedAnswer": { "@type": "Answer", "text": "Stages of Reproductive Aging Workshop, 10-year update. Clinical framework by Harlow et al. 2012. Endorsed by NIH, ASRM, and the International Menopause Society. Defines seven stages of female reproductive lifespan." } }
      ]
    };

    [webApp, faqPage].forEach(function(schema) {
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-hb-jsonld', '1');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
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
        else if (k === 'disabled' || k === 'value' || k === 'type' || k === 'id') {
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

  /* RESTART LINK */

  function renderRestartLink() {
    return el('div', { class: 'hb-quiz-restart-row' }, [
      el('button', {
        class: 'hb-quiz-restart-link',
        type: 'button',
        onclick: function() {
          if (confirm('Start over? Your current answers will be cleared.')) {
            fullReset();
            render();
          }
        }
      }, ['↻ Start over'])
    ]);
  }

  /* WELCOME BACK SCREEN (NEW in v1.3.0) */

  function renderWelcomeBack() {
    clearRoot();

    var subtitle = '';
    var continueLabel = '';
    var resumeScreen = 'question';

    if (state.result) {
      // Quiz already finished — offer to view result again
      subtitle = 'Your hormone type result is ready to view again.';
      continueLabel = 'View my result →';
      resumeScreen = 'result';
    } else if (state.currentIndex > 0 || Object.keys(state.answers).length > 0) {
      // In the middle of the quiz
      var qNum = state.currentIndex + 1;
      var total = HB_QUIZ_DATA.meta.totalQuestions;
      subtitle = "You were on question " + qNum + " of " + total + ". Pick up where you left off, or start fresh.";
      continueLabel = 'Continue (question ' + qNum + ') →';
      resumeScreen = 'question';
    }

    var welcome = el('div', { class: 'hb-quiz-welcome' }, [
      el('div', { class: 'hb-quiz-welcome-icon' }, '👋'),
      el('h2', { class: 'hb-quiz-welcome-title' }, 'Welcome back'),
      el('p', { class: 'hb-quiz-welcome-subtitle' }, subtitle),
      el('div', { class: 'hb-quiz-welcome-buttons' }, [
        el('button', {
          class: 'hb-quiz-welcome-primary',
          type: 'button',
          onclick: function() {
            state.screen = resumeScreen;
            saveState();
            render();
          }
        }, continueLabel),
        el('button', {
          class: 'hb-quiz-welcome-secondary',
          type: 'button',
          onclick: function() {
            if (confirm('Start over? Your previous answers will be cleared.')) {
              fullReset();
              render();
            }
          }
        }, '↻ Start over')
      ])
    ]);

    rootEl.appendChild(el('div', { class: 'hb-quiz' }, [welcome]));
  }

  /* ONBOARDING */

  function renderOnboarding() {
    clearRoot();

    var lockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    var checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    var promises = [
      { title: 'Stays on your phone', desc: 'All your answers are saved only on this device — never uploaded to a server.' },
      { title: 'No servers, no cloud', desc: 'There is no backend. We don\'t have a database of users.' },
      { title: "Even we can't see it", desc: 'Your hormone data is yours alone. We have no way to access it.' }
    ];

    var promiseItems = promises.map(function(p) {
      return el('div', { class: 'hb-quiz-onboarding-item' }, [
        el('div', { class: 'hb-quiz-onboarding-check', html: checkIcon }),
        el('div', { class: 'hb-quiz-onboarding-item-text' }, [
          el('p', { class: 'hb-quiz-onboarding-item-title' }, p.title),
          el('p', { class: 'hb-quiz-onboarding-item-desc' }, p.desc)
        ])
      ]);
    });

    var onboarding = el('div', { class: 'hb-quiz-onboarding' }, [
      el('div', { class: 'hb-quiz-onboarding-icon', html: lockIcon }),
      el('h2', { class: 'hb-quiz-onboarding-title' }, 'Your privacy promise'),
      el('p', { class: 'hb-quiz-onboarding-subtitle' }, "Before we begin, here's what you need to know about your data:"),
      el('div', { class: 'hb-quiz-onboarding-list' }, promiseItems),
      el('button', {
        class: 'hb-quiz-onboarding-cta',
        type: 'button',
        onclick: function() {
          markPrivacySeen();
          trackEvent('quiz_start');
          state.screen = 'question';
          state.currentIndex = 0;
          saveState();
          render();
        }
      }, ["Got it, let's start →"])
    ]);

    rootEl.appendChild(el('div', { class: 'hb-quiz' }, [onboarding]));
  }

  /* QUESTION RENDERING */

  function renderQuestion() {
    clearRoot();
    var q = HB_QUIZ_DATA.questions[state.currentIndex];
    if (!q) { finish(); return; }

    var sectionData = HB_QUIZ_DATA.sections.filter(function(s) { return s.id === q.section; })[0];
    var total = HB_QUIZ_DATA.meta.totalQuestions;
    var progressPct = ((state.currentIndex + 1) / total) * 100;

    var progress = el('div', { class: 'hb-quiz-progress' }, [
      el('div', { class: 'hb-quiz-progress-header' }, [
        el('span', { class: 'hb-quiz-progress-section' }, sectionData ? sectionData.name : ''),
        el('span', { class: 'hb-quiz-progress-count' }, (state.currentIndex + 1) + ' of ' + total)
      ]),
      el('div', { class: 'hb-quiz-progress-track' }, [
        el('div', { class: 'hb-quiz-progress-fill', style: 'width:' + progressPct + '%' })
      ])
    ]);

    var questionEl = el('div', { class: 'hb-quiz-question' }, [
      el('h2', { class: 'hb-quiz-question-text' }, q.question),
      q.helpText ? el('p', { class: 'hb-quiz-help-text' }, q.helpText) : null,
      renderInput(q)
    ]);

    rootEl.appendChild(el('div', { class: 'hb-quiz' }, [
      renderRestartLink(),
      progress,
      questionEl,
      renderNav(q)
    ]));
  }

  function renderInput(q) {
    if (q.type === 'slider') return renderSlider(q);
    if (q.type === 'single_select') return renderSingleSelect(q);
    if (q.type === 'multi_select') return renderMultiSelect(q);
    if (q.type === 'scale') return renderScale(q);
    return el('p', null, 'Unsupported question type');
  }

  function renderSlider(q) {
    var currentValue = state.answers[q.id] != null ? state.answers[q.id] : q.defaultValue;
    if (state.answers[q.id] == null) {
      state.answers[q.id] = currentValue;
      saveState();
    }

    var valueDisplay = el('div', { class: 'hb-quiz-slider-value' }, [
      String(currentValue),
      el('span', { class: 'hb-quiz-slider-unit' }, q.unit || '')
    ]);

    var slider = el('input', {
      class: 'hb-quiz-slider-input',
      type: 'range',
      min: String(q.min),
      max: String(q.max),
      step: String(q.step || 1),
      value: String(currentValue),
      oninput: function(e) {
        var v = parseInt(e.target.value, 10);
        state.answers[q.id] = v;
        valueDisplay.childNodes[0].nodeValue = String(v);
        saveState();
      }
    });

    var labels = el('div', { class: 'hb-quiz-slider-labels' }, [
      el('span', null, String(q.min)),
      el('span', null, String(q.max))
    ]);

    return el('div', { class: 'hb-quiz-slider' }, [valueDisplay, slider, labels]);
  }

  function renderSingleSelect(q) {
    var wrapper = el('div', { class: 'hb-quiz-options' });
    q.options.forEach(function(opt) {
      var isSelected = state.answers[q.id] === opt.value;
      var button = el('button', {
        class: 'hb-quiz-option' + (isSelected ? ' is-selected' : ''),
        type: 'button',
        onclick: function() {
          state.answers[q.id] = opt.value;
          saveState();
          renderQuestion();
        }
      }, [
        el('span', { class: 'hb-quiz-option-radio' }),
        el('span', null, opt.label)
      ]);
      wrapper.appendChild(button);
    });
    return wrapper;
  }

  function renderMultiSelect(q) {
    var selected = state.answers[q.id] || [];
    var max = q.maxSelections || q.options.length;
    var exclusives = ['none', 'dont_know'];

    var wrapper = el('div');
    var chipsRow = el('div', { class: 'hb-quiz-chips' });

    function hasExclusive(arr) {
      return arr.some(function(v) { return exclusives.indexOf(v) !== -1; });
    }

    q.options.forEach(function(opt) {
      var isSelected = selected.indexOf(opt.value) !== -1;
      var isThisExclusive = exclusives.indexOf(opt.value) !== -1;
      var reachedMax = selected.length >= max && !isSelected;
      var blocked = !isSelected && (
        reachedMax ||
        (hasExclusive(selected) && !isThisExclusive) ||
        (isThisExclusive && selected.length > 0 && !hasExclusive(selected))
      );

      var chip = el('button', {
        class: 'hb-quiz-chip' + (isSelected ? ' is-selected' : '') + (blocked ? ' is-disabled' : ''),
        type: 'button',
        onclick: function() {
          if (blocked) return;
          var current = (state.answers[q.id] || []).slice();
          if (isSelected) {
            current = current.filter(function(v) { return v !== opt.value; });
          } else if (isThisExclusive) {
            current = [opt.value];
          } else {
            current = current.filter(function(v) { return exclusives.indexOf(v) === -1; });
            if (current.length < max) current.push(opt.value);
          }
          state.answers[q.id] = current;
          saveState();
          renderQuestion();
        }
      }, opt.label);

      chipsRow.appendChild(chip);
    });

    wrapper.appendChild(chipsRow);

    if (q.maxSelections) {
      wrapper.appendChild(el('p', {
        class: 'hb-quiz-chips-counter',
        html: 'Selected: <strong>' + selected.length + ' / ' + max + '</strong>'
      }));
    }

    return wrapper;
  }

  function renderScale(q) {
    var currentValue = state.answers[q.id];
    var wrapper = el('div', { class: 'hb-quiz-scale' });

    if (q.emoji && q.emoji.length) {
      var emojiRow = el('div', { class: 'hb-quiz-scale-emoji-row' });
      q.emoji.forEach(function(e) { emojiRow.appendChild(el('span', null, e)); });
      wrapper.appendChild(emojiRow);
    }

    var buttonsRow = el('div', { class: 'hb-quiz-scale-buttons' });
    for (var i = q.min; i <= q.max; i++) {
      (function(val) {
        var isSelected = currentValue === val;
        var btn = el('button', {
          class: 'hb-quiz-scale-btn' + (isSelected ? ' is-selected' : ''),
          type: 'button',
          onclick: function() {
            state.answers[q.id] = val;
            saveState();
            renderQuestion();
          }
        }, String(val));
        buttonsRow.appendChild(btn);
      })(i);
    }
    wrapper.appendChild(buttonsRow);

    var labelText = '';
    if (q.labels && q.labels.length && currentValue != null) {
      labelText = q.labels[currentValue - q.min] || '';
    }
    wrapper.appendChild(el('p', { class: 'hb-quiz-scale-label' }, labelText));

    return wrapper;
  }

  /* NAVIGATION */

  function isAnswered(q) {
    var a = state.answers[q.id];
    if (q.type === 'slider' || q.type === 'scale' || q.type === 'single_select') return a != null;
    if (q.type === 'multi_select') return Array.isArray(a) && a.length > 0;
    return false;
  }

  function renderNav(q) {
    var answered = isAnswered(q);
    var isLast = state.currentIndex === HB_QUIZ_DATA.meta.totalQuestions - 1;
    var atStart = state.currentIndex === 0;

    var backBtn = el('button', {
      class: 'hb-quiz-btn is-secondary' + (atStart ? ' is-disabled' : ''),
      type: 'button',
      disabled: atStart,
      onclick: function() {
        if (state.currentIndex > 0) {
          state.currentIndex--;
          saveState();
          render();
        }
      }
    }, ['← Back']);

    var nextBtn = el('button', {
      class: 'hb-quiz-btn is-primary' + (!answered ? ' is-disabled' : ''),
      type: 'button',
      disabled: !answered,
      onclick: function() {
        if (!isAnswered(q)) return;
        if (isLast) {
          finish();
        } else {
          state.currentIndex++;
          saveState();
          render();
        }
      }
    }, [isLast ? 'Get my result →' : 'Next →']);

    return el('div', { class: 'hb-quiz-nav' }, [backBtn, nextBtn]);
  }

  /* FINISH & RESULT */

  function finish() {
    var result = HB_QUIZ_SCORE.score(state.answers);
    state.result = result;
    state.screen = 'result';
    saveState();

    trackEvent('quiz_complete', {
      question_count: 12,
      intensity_score: result.intensityScore
    });
    trackEvent('result_view', {
      hormone_type: result.hormoneType,
      hormonal_age: result.hormonalAge,
      intensity_score: result.intensityScore
    });

    renderResult();
  }

  function renderResult() {
    clearRoot();
    if (!state.result) { rootEl.appendChild(el('p', null, 'Calculating...')); return; }

    var typeData = HB_QUIZ_DATA.hormoneTypes[state.result.hormoneType];
    if (!typeData) { rootEl.appendChild(el('p', null, 'Could not determine type.')); return; }

    var eyebrow = el('p', { style: 'color:#C97B5C;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin:0 0 16px 0;' }, 'Your hormone type');
    var emoji = el('div', { style: 'font-size:64px;line-height:1;margin-bottom:16px;' }, typeData.emoji);
    var name = el('h2', { style: 'font-family:Newsreader,Georgia,serif;font-size:36px;color:#1A2A4A;margin:0 0 8px 0;font-weight:500;letter-spacing:-0.01em;' }, typeData.name);
    var tagline = el('p', { style: 'color:' + typeData.accent + ';font-style:italic;font-size:16px;margin:0 0 24px 0;' }, typeData.tagline);
    var description = el('p', { style: 'color:#3A4555;font-size:15px;line-height:1.7;margin:0 0 32px 0;' }, typeData.description);

    var hormonalAgeBox = el('div', { style: 'background:#F4ECDD;border-radius:12px;padding:24px;margin-bottom:24px;' }, [
      el('p', { style: 'font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C97B5C;font-weight:600;margin:0 0 8px 0;' }, 'Your Hormonal Age'),
      el('div', { style: 'font-family:Newsreader,Georgia,serif;font-size:48px;color:#1A2A4A;font-weight:500;line-height:1;' }, String(state.result.hormonalAge)),
      el('p', { style: 'font-size:13px;color:#5F5E5A;margin:8px 0 0 0;' }, 'years (biological + lifestyle)')
    ]);

    var prioritiesEl = el('div', { style: 'margin-bottom:24px;' }, [
      el('h3', { style: 'font-family:Newsreader,Georgia,serif;font-size:20px;color:#1A2A4A;margin:0 0 12px 0;font-weight:500;' }, 'Your top 3 priorities'),
      el('ol', { style: 'margin:0;padding-left:20px;color:#3A4555;font-size:15px;line-height:1.7;' },
        typeData.topPriorities.map(function(p) {
          return el('li', { style: 'margin-bottom:8px;' }, p);
        })
      )
    ]);

    var bookCTA = el('div', { style: 'background:#1A2A4A;color:#FAF6EE;border-radius:12px;padding:24px;text-align:center;' }, [
      el('p', { style: 'font-size:13px;color:rgba(250,246,238,0.7);margin:0 0 8px 0;' }, 'Want the full framework?'),
      el('p', {
        style: 'font-family:Newsreader,Georgia,serif;font-size:18px;margin:0;line-height:1.4;',
        html: 'The Hormone Blueprint has a dedicated section for your type — <strong style="color:#C97B5C;">' + typeData.chapterRange + '</strong>'
      })
    ]);

    var retakeBtn = el('button', {
      class: 'hb-quiz-btn is-secondary',
      type: 'button',
      style: 'margin:24px auto 0;display:block;',
      onclick: function() {
        if (confirm('Start the quiz over? This will clear your current result.')) {
          fullReset();
          render();
        }
      }
    }, ['↻ Retake quiz']);

    rootEl.appendChild(el('div', { class: 'hb-quiz', style: 'text-align:center;' }, [
      eyebrow, emoji, name, tagline, description,
      hormonalAgeBox, prioritiesEl, bookCTA, retakeBtn
    ]));
  }

  /* MAIN RENDER & INIT */

  function render() {
    if (!rootEl) return;
    if (state.screen === 'welcome_back') renderWelcomeBack();
    else if (state.screen === 'onboarding') renderOnboarding();
    else if (state.screen === 'question') renderQuestion();
    else if (state.screen === 'result') renderResult();
  }

  function init() {
    if (typeof window.HB_QUIZ_DATA === 'undefined') {
      console.error('HB Quiz: HB_QUIZ_DATA not loaded — check questions.js loads before quiz.js');
      return;
    }
    if (typeof window.HB_QUIZ_SCORE === 'undefined') {
      console.error('HB Quiz: HB_QUIZ_SCORE not loaded — check scoring.js loads before quiz.js');
      return;
    }

    injectJsonLd();
    injectRestartStyles();

    rootEl = document.getElementById(ROOT_ID);
    if (!rootEl) {
      console.warn('HB Quiz: #' + ROOT_ID + ' not found on page');
      return;
    }

    loadState();

    // Decision logic for initial screen:
    // 1. If user has in-progress quiz state → show Welcome Back banner
    // 2. Else if user has already accepted privacy → go to questions
    // 3. Else → show onboarding (first-time visitor)
    if (hasInProgressState()) {
      state.screen = 'welcome_back';
    } else if (hasSeenPrivacy()) {
      state.screen = 'question';
    } else {
      state.screen = 'onboarding';
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
