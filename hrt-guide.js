/* The Hormone Blueprint — "Is HRT Right for You to Consider?" 
   An educational tool that prepares a woman for a conversation with her doctor about HRT.
   It never diagnoses and never tells anyone to start or stop treatment.
   Clinical basis: NICE NG23 (Menopause, updated 2024), British Menopause Society.
   Self-contained: builds its own DOM, styles and logic. Mounts into #hb-hrt-guide. */
(function () {
  'use strict';

  var MOUNT_ID = 'hb-hrt-guide';

  // ---- clinical content model -------------------------------------------------
  var STAGE_Q = {
    key: 'stage',
    section: 'About you',
    title: 'Where are you in the menopause transition?',
    help: 'HRT is used for symptoms of the menopause transition. This helps place you on that map — it changes what is worth discussing.',
    options: [
      { v: 'regular', label: 'Periods still regular' },
      { v: 'changing', label: 'Periods have changed (closer, further apart, heavier or lighter)' },
      { v: 'stopped_recent', label: 'Periods stopped less than 12 months ago' },
      { v: 'stopped_year', label: 'No period for 12 months or more' },
      { v: 'no_uterus', label: 'I have had my womb removed (hysterectomy)' },
      { v: 'unsure', label: 'I\u2019m not sure' }
    ]
  };
  var AGE_Q = {
    key: 'age',
    section: 'About you',
    title: 'Which age band are you in?',
    help: 'Age matters: before 45, the balance of benefits and risks is different and HRT is often actively recommended.',
    options: [
      { v: 'u40', label: 'Under 40' },
      { v: '40_45', label: '40 to 45' },
      { v: '46_55', label: '46 to 55' },
      { v: 'o55', label: 'Over 55' }
    ]
  };

  // Symptoms HRT is recognised to help (NICE NG23). Scored 0–3.
  var SYMPTOMS = [
    { key: 's_vaso', label: 'Hot flushes and night sweats', note: 'The symptoms HRT helps most — it is the recognised first-line treatment for these.' },
    { key: 's_sleep', label: 'Disrupted sleep', note: 'Often improves when night sweats settle.' },
    { key: 's_mood', label: 'Mood changes, anxiety or irritability', note: 'Low mood arising in perimenopause can respond to HRT.' },
    { key: 's_uro', label: 'Vaginal dryness or discomfort during sex', note: 'Important: this alone can often be treated with local vaginal oestrogen, without whole-body HRT.' },
    { key: 's_phys', label: 'Joint aches, brain fog or fatigue', note: 'Common in the transition and frequently reported to improve.' }
  ];
  var SEV = [
    { v: 0, label: 'None' },
    { v: 1, label: 'Mild' },
    { v: 2, label: 'Moderate' },
    { v: 3, label: 'Severe' }
  ];

  // "Discuss first" factors — framed as things to raise, never as disqualifiers.
  var FLAGS = [
    { key: 'f_breast', label: 'A personal history of breast cancer', discuss: 'A history of breast cancer makes the HRT conversation more specialised — it is one for a specialist rather than a quick decision, and there are non-hormonal options for symptoms too.' },
    { key: 'f_clot', label: 'A history of blood clots (DVT/PE) or stroke', discuss: 'This does not rule HRT out. Oestrogen through the skin (patch or gel) carries a lower clot risk than tablets, so it is worth asking specifically about transdermal HRT.' },
    { key: 'f_bleed', label: 'Unexplained vaginal bleeding', discuss: 'This one is different: unexplained bleeding should be checked by a doctor before starting HRT, and promptly, whatever you decide about HRT.', urgent: true },
    { key: 'f_liver', label: 'Liver disease', discuss: 'Worth flagging, as it can influence which form of HRT is suitable.' },
    { key: 'f_migraine', label: 'Migraine with aura', discuss: 'Not a barrier to HRT — but transdermal oestrogen (patch or gel) is usually preferred, so mention it.' },
    { key: 'f_none', label: 'None of these apply', exclusive: true }
  ];

  // ---- fonts (warm-editorial: Fraunces display serif + Inter body) ------------
  var FONT_LINK = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500&family=Inter:wght@400;500;600;700&display=swap';

  // ---- styling ----------------------------------------------------------------
  var A = '#' + MOUNT_ID;
  var CSS = ''
    // tokens: warm-editorial. plum ramp around #a24a5f, cream canvas, terracotta secondary, aubergine ink
    + A + '{--hb-ink:#3a2530;--hb-muted:#7d6b73;--hb-line:#e5dacb;--hb-line-soft:#efe6da;'
    + '--hb-cream:#fbf6ef;--hb-oat:#efe6da;--hb-card:#ffffff;'
    + '--hb-plum:#a24a5f;--hb-plum-soft:#f4e8eb;--hb-plum-deep:#7e3a4a;--hb-plum-ink:#5a2733;'
    + '--hb-terra:#c4694a;--hb-terra-soft:#f7ece4;--hb-sage:#8b9b7e;'
    + '--hb-serif:"Fraunces",Georgia,"Times New Roman",serif;'
    + '--hb-sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;'
    + '--hb-radius:18px;'
    + 'font-family:var(--hb-sans);color:var(--hb-ink);line-height:1.6;max-width:660px;margin:0 auto;'
    + '-webkit-font-smoothing:antialiased;text-align:left;font-size:17px;}'
    + A + ' *{box-sizing:border-box;}'
    + A + ' ::selection{background:var(--hb-plum-soft);}'
    // canvas + card
    + A + ' .hb-stage{background:var(--hb-cream);border-radius:24px;padding:10px;}'
    + A + ' .hb-card{background:var(--hb-card);border:1px solid var(--hb-line);border-radius:var(--hb-radius);'
    + 'box-shadow:0 1px 2px rgba(58,37,48,.03),0 12px 34px rgba(58,37,48,.05);padding:34px 32px;'
    + 'animation:hbFade .32s ease;}'
    + '@keyframes hbFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}'
    + A + ' .hb-note-top{font-size:14px;line-height:1.55;color:var(--hb-plum-ink);background:var(--hb-plum-soft);'
    + 'border-radius:14px;padding:15px 17px;margin-bottom:26px;display:flex;gap:11px;align-items:flex-start;}'
    + A + ' .hb-note-top svg{flex:0 0 18px;margin-top:1px;}'
    // progress
    + A + ' .hb-progress{height:5px;background:var(--hb-oat);border-radius:99px;overflow:hidden;margin-bottom:8px;}'
    + A + ' .hb-progress > i{display:block;height:100%;background:linear-gradient(90deg,var(--hb-plum),var(--hb-terra));border-radius:99px;transition:width .4s cubic-bezier(.4,0,.2,1);}'
    + A + ' .hb-step-label{font-family:var(--hb-sans);font-size:11.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--hb-muted);font-weight:600;margin-bottom:24px;}'
    // question typography — Fraunces
    + A + ' h2.hb-q{font-family:var(--hb-serif);font-size:27px;line-height:1.18;margin:0 0 10px;font-weight:500;letter-spacing:-.015em;font-optical-sizing:auto;}'
    + A + ' .hb-help{font-size:15px;line-height:1.55;color:var(--hb-muted);margin:0 0 24px;max-width:52ch;}'
    // options
    + A + ' .hb-opts{display:flex;flex-direction:column;gap:11px;}'
    + A + ' .hb-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;border:1.5px solid var(--hb-line);background:var(--hb-cream);'
    + 'border-radius:13px;padding:16px 17px;font-size:16px;font-family:var(--hb-sans);color:var(--hb-ink);cursor:pointer;'
    + 'transition:border-color .16s,background .16s,box-shadow .16s,transform .05s;}'
    + A + ' .hb-opt:hover{border-color:var(--hb-plum);background:#fff;box-shadow:0 4px 14px rgba(162,74,95,.07);}'
    + A + ' .hb-opt:active{transform:translateY(1px);}'
    + A + ' .hb-opt[aria-pressed="true"]{border-color:var(--hb-plum);background:var(--hb-plum-soft);box-shadow:0 4px 14px rgba(162,74,95,.09);}'
    + A + ' .hb-opt .hb-tick{flex:0 0 22px;height:22px;border-radius:7px;border:1.5px solid var(--hb-line);display:flex;align-items:center;justify-content:center;transition:all .16s;}'
    + A + ' .hb-opt[aria-pressed="true"] .hb-tick{background:var(--hb-plum);border-color:var(--hb-plum);}'
    + A + ' .hb-opt[aria-pressed="true"] .hb-tick svg{display:block;}'
    + A + ' .hb-opt .hb-tick svg{display:none;width:13px;height:13px;}'
    // symptom rows
    + A + ' .hb-sym{border:1px solid var(--hb-line);border-radius:14px;padding:18px;margin-bottom:13px;background:var(--hb-cream);}'
    + A + ' .hb-sym .hb-sym-l{font-size:16px;font-weight:600;margin-bottom:3px;}'
    + A + ' .hb-sym .hb-sym-n{font-size:13.5px;line-height:1.5;color:var(--hb-muted);margin-bottom:14px;}'
    + A + ' .hb-scale{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}'
    + A + ' .hb-scale button{border:1.5px solid var(--hb-line);background:#fff;border-radius:10px;padding:11px 4px;font-size:13px;font-family:var(--hb-sans);color:var(--hb-muted);cursor:pointer;transition:all .14s;}'
    + A + ' .hb-scale button:hover{border-color:var(--hb-plum);color:var(--hb-plum-ink);}'
    + A + ' .hb-scale button[aria-pressed="true"]{background:var(--hb-plum);border-color:var(--hb-plum);color:#fff;font-weight:600;}'
    // nav + buttons
    + A + ' .hb-nav{display:flex;justify-content:space-between;align-items:center;margin-top:28px;gap:12px;}'
    + A + ' .hb-btn{border:none;border-radius:99px;padding:14px 30px;font-size:15.5px;font-weight:600;font-family:var(--hb-sans);cursor:pointer;transition:background .16s,box-shadow .16s,opacity .16s;}'
    + A + ' .hb-btn-primary{background:var(--hb-plum);color:#fff;box-shadow:0 4px 14px rgba(162,74,95,.22);}'
    + A + ' .hb-btn-primary:hover{background:var(--hb-plum-deep);box-shadow:0 6px 18px rgba(162,74,95,.28);}'
    + A + ' .hb-btn-primary:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}'
    + A + ' .hb-btn-ghost{background:transparent;color:var(--hb-muted);border:none;padding:14px 8px;font-size:14.5px;font-family:var(--hb-sans);cursor:pointer;transition:color .15s;}'
    + A + ' .hb-btn-ghost:hover{color:var(--hb-plum);}'
    // ---- result: consultation document -------------------------------------
    + A + ' .hb-doc{background:var(--hb-card);border:1px solid var(--hb-line);border-radius:var(--hb-radius);'
    + 'box-shadow:0 1px 2px rgba(58,37,48,.03),0 14px 40px rgba(58,37,48,.07);overflow:hidden;animation:hbFade .4s ease;}'
    + A + ' .hb-doc-head{background:linear-gradient(160deg,#fbf3f0,var(--hb-plum-soft));border-bottom:1px solid var(--hb-line);padding:30px 32px 26px;position:relative;}'
    + A + ' .hb-doc-mark{font-family:var(--hb-serif);font-size:13px;font-weight:600;letter-spacing:.02em;color:var(--hb-plum);margin-bottom:14px;display:flex;align-items:center;gap:8px;}'
    + A + ' .hb-doc-mark:before{content:"";width:20px;height:1.5px;background:var(--hb-plum);display:inline-block;}'
    + A + ' .hb-doc-title{font-family:var(--hb-serif);font-size:28px;line-height:1.15;font-weight:500;letter-spacing:-.02em;margin:0 0 6px;color:var(--hb-plum-ink);}'
    + A + ' .hb-doc-date{font-size:13px;color:var(--hb-muted);}'
    + A + ' .hb-doc-body{padding:28px 32px 32px;}'
    + A + ' .hb-reassure{font-family:var(--hb-serif);font-style:italic;font-size:19px;line-height:1.4;color:var(--hb-plum-ink);margin:0 0 24px;padding-left:16px;border-left:2px solid var(--hb-terra);}'
    + A + ' .hb-lead{font-size:16px;line-height:1.6;color:var(--hb-ink);margin:0 0 26px;}'
    + A + ' .hb-block{border:1px solid var(--hb-line);border-radius:14px;padding:22px;margin-bottom:16px;}'
    + A + ' .hb-block h3{font-family:var(--hb-sans);font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin:0 0 14px;color:var(--hb-plum);display:flex;align-items:center;gap:8px;}'
    + A + ' .hb-block.is-flag{background:var(--hb-terra-soft);border-color:#ecd9c9;}'
    + A + ' .hb-block.is-flag h3{color:var(--hb-terra);}'
    + A + ' .hb-block.is-urgent{background:#fbeeec;border-color:#ecccc5;}'
    + A + ' .hb-block.is-urgent h3{color:#b0402c;}'
    + A + ' .hb-block.is-note{background:var(--hb-cream);}'
    + A + ' .hb-block.is-note h3{color:var(--hb-sage);}'
    + A + ' .hb-block > p{font-size:15px;line-height:1.6;margin:0;}'
    + A + ' ul.hb-list{margin:0;padding:0;list-style:none;}'
    + A + ' ul.hb-list li{position:relative;padding-left:24px;margin-bottom:13px;font-size:15px;line-height:1.55;}'
    + A + ' ul.hb-list li:last-child{margin-bottom:0;}'
    + A + ' ul.hb-list li:before{content:"";position:absolute;left:3px;top:8px;width:6px;height:6px;border-radius:99px;background:var(--hb-plum);}'
    + A + ' .hb-block.is-flag ul.hb-list li:before{background:var(--hb-terra);}'
    + A + ' .hb-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:2px;}'
    + A + ' .hb-links a{font-size:14.5px;color:var(--hb-plum);text-decoration:none;border:1px solid var(--hb-line);border-radius:99px;padding:10px 16px;transition:all .14s;font-weight:500;}'
    + A + ' .hb-links a:hover{border-color:var(--hb-plum);background:var(--hb-plum-soft);}'
    + A + ' .hb-disclaimer{font-size:12.5px;line-height:1.55;color:var(--hb-muted);background:var(--hb-cream);border-radius:12px;padding:15px 16px;margin-top:8px;display:flex;gap:10px;align-items:flex-start;}'
    + A + ' .hb-disclaimer svg{flex:0 0 15px;margin-top:1px;}'
    + A + ' .hb-restart{text-align:center;margin-top:20px;}'
    + A + ' .hb-restart button{background:none;border:none;color:var(--hb-muted);text-decoration:underline;text-underline-offset:2px;cursor:pointer;font-size:13.5px;font-family:var(--hb-sans);}'
    + A + ' .hb-restart button:hover{color:var(--hb-plum);}'
    // responsive
    + '@media(max-width:520px){' + A + '{font-size:16px;}' + A + ' .hb-card{padding:26px 20px;}'
    + A + ' h2.hb-q{font-size:23px;}' + A + ' .hb-doc-head{padding:24px 20px 22px;}' + A + ' .hb-doc-body{padding:22px 20px 26px;}'
    + A + ' .hb-doc-title{font-size:24px;}' + A + ' .hb-scale{grid-template-columns:repeat(2,1fr);}}';

  // ---- state ------------------------------------------------------------------
  var state = { stage: null, age: null, sym: {}, flags: {} };
  var stepIndex = 0;
  // steps: 0 stage, 1 age, 2 symptoms, 3 flags, 4 result
  var TOTAL_INPUT_STEPS = 4;

  var root;
  var tickSVG = '<svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2 5 8.6 9.6 3.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var lockSVG = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3.5" y="7.5" width="11" height="7.5" rx="2" stroke="#a24a5f" stroke-width="1.4"/><path d="M6 7.5V5.5a3 3 0 0 1 6 0v2" stroke="#a24a5f" stroke-width="1.4"/></svg>';
  var infoSVG = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#7d6b73" stroke-width="1.2"/><path d="M8 7.2v3.6M8 5.2v.2" stroke="#7d6b73" stroke-width="1.4" stroke-linecap="round"/></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function progressPct() {
    return Math.round((stepIndex / TOTAL_INPUT_STEPS) * 100);
  }

  function shell(sectionLabel) {
    root.innerHTML = '';
    var stage = el('div', 'hb-stage');
    var card = el('div', 'hb-card');
    if (stepIndex === 0) {
      card.appendChild(el('div', 'hb-note-top', lockSVG +
        '<span>A private, evidence-based tool to help you prepare for a conversation with your doctor about HRT. ' +
        'It does not diagnose, and it never tells you to start or stop treatment. Nothing you enter is stored.</span>'));
    }
    // Progress bar introduced from step 2 (research: hiding it on step 1 lifts completion)
    if (stepIndex > 0 && stepIndex < TOTAL_INPUT_STEPS) {
      var bar = el('div', 'hb-progress'); var fill = el('i'); fill.style.width = progressPct() + '%'; bar.appendChild(fill);
      card.appendChild(bar);
      card.appendChild(el('div', 'hb-step-label', sectionLabel + ' \u00b7 Step ' + (stepIndex + 1) + ' of ' + TOTAL_INPUT_STEPS));
    } else if (stepIndex === 0) {
      card.appendChild(el('div', 'hb-step-label', sectionLabel));
    }
    stage.appendChild(card);
    root.appendChild(stage);
    return card;
  }

  function singleSelect(card, q, current, onPick) {
    card.appendChild(el('h2', 'hb-q', q.title));
    if (q.help) card.appendChild(el('p', 'hb-help', q.help));
    var wrap = el('div', 'hb-opts');
    q.options.forEach(function (o) {
      var b = el('button', 'hb-opt');
      b.type = 'button';
      b.setAttribute('aria-pressed', current === o.v ? 'true' : 'false');
      b.appendChild(el('span', 'hb-tick', tickSVG));
      b.appendChild(el('span', null, o.label));
      b.addEventListener('click', function () { onPick(o.v); });
      wrap.appendChild(b);
    });
    card.appendChild(wrap);
  }

  function render() {
    if (stepIndex === 0) {
      var c = shell(STAGE_Q.section);
      singleSelect(c, STAGE_Q, state.stage, function (v) { state.stage = v; stepIndex = 1; render(); });
    } else if (stepIndex === 1) {
      var c1 = shell(AGE_Q.section);
      singleSelect(c1, AGE_Q, state.age, function (v) { state.age = v; stepIndex = 2; render(); });
      navBack(c1, function () { stepIndex = 0; render(); });
    } else if (stepIndex === 2) {
      renderSymptoms();
    } else if (stepIndex === 3) {
      renderFlags();
    } else {
      renderResult();
    }
    if (root.scrollIntoView) { try { root.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
  }

  function renderSymptoms() {
    var c = shell('Your symptoms');
    c.appendChild(el('h2', 'hb-q', 'How much are these affecting you?'));
    c.appendChild(el('p', 'hb-help', 'These are the symptoms HRT is recognised to help. There are no wrong answers — leave any at "None" if they don\u2019t apply.'));
    SYMPTOMS.forEach(function (s) {
      var box = el('div', 'hb-sym');
      box.appendChild(el('div', 'hb-sym-l', s.label));
      box.appendChild(el('div', 'hb-sym-n', s.note));
      var scale = el('div', 'hb-scale');
      SEV.forEach(function (sv) {
        var b = el('button', null, sv.label); b.type = 'button';
        var cur = (s.key in state.sym) ? state.sym[s.key] : 0;
        b.setAttribute('aria-pressed', cur === sv.v ? 'true' : 'false');
        b.addEventListener('click', function () {
          state.sym[s.key] = sv.v;
          [].forEach.call(scale.children, function (ch, i) { ch.setAttribute('aria-pressed', SEV[i].v === sv.v ? 'true' : 'false'); });
        });
        scale.appendChild(b);
      });
      box.appendChild(scale);
      c.appendChild(box);
    });
    var nav = el('div', 'hb-nav');
    var back = el('button', 'hb-btn-ghost', '\u2190 Back'); back.type = 'button';
    back.addEventListener('click', function () { stepIndex = 1; render(); });
    var next = el('button', 'hb-btn hb-btn-primary', 'Continue'); next.type = 'button';
    next.addEventListener('click', function () { SYMPTOMS.forEach(function (s) { if (!(s.key in state.sym)) state.sym[s.key] = 0; }); stepIndex = 3; render(); });
    nav.appendChild(back); nav.appendChild(next);
    c.appendChild(nav);
  }

  function renderFlags() {
    var c = shell('Things to discuss first');
    c.appendChild(el('h2', 'hb-q', 'Do any of these apply to you?'));
    c.appendChild(el('p', 'hb-help', 'These are not reasons you \u201ccan\u2019t\u201d have HRT. They are things worth raising, because they may change the type your doctor recommends. Select any that apply.'));
    var wrap = el('div', 'hb-opts');
    FLAGS.forEach(function (f) {
      var b = el('button', 'hb-opt'); b.type = 'button';
      b.setAttribute('aria-pressed', state.flags[f.key] ? 'true' : 'false');
      b.appendChild(el('span', 'hb-tick', tickSVG));
      b.appendChild(el('span', null, f.label));
      b.addEventListener('click', function () {
        if (f.exclusive) {
          var turnOn = !state.flags[f.key];
          state.flags = {}; if (turnOn) state.flags[f.key] = true;
        } else {
          state.flags[f.key] = !state.flags[f.key];
          if (state.flags[f.key]) delete state.flags.f_none;
        }
        [].forEach.call(wrap.children, function (ch, i) { ch.setAttribute('aria-pressed', state.flags[FLAGS[i].key] ? 'true' : 'false'); });
      });
      wrap.appendChild(b);
    });
    c.appendChild(wrap);
    var nav = el('div', 'hb-nav');
    var back = el('button', 'hb-btn-ghost', '\u2190 Back'); back.type = 'button';
    back.addEventListener('click', function () { stepIndex = 2; render(); });
    var next = el('button', 'hb-btn hb-btn-primary', 'See my conversation guide'); next.type = 'button';
    next.addEventListener('click', function () { stepIndex = 4; render(); });
    nav.appendChild(back); nav.appendChild(next);
    c.appendChild(nav);
  }

  // ---- result logic -----------------------------------------------------------
  function symTotal() { var t = 0; SYMPTOMS.forEach(function (s) { t += (state.sym[s.key] || 0); }); return t; }
  function vasoScore() { return state.sym.s_vaso || 0; }
  function onlyUro() {
    // urogenital present but everything else negligible
    var uro = state.sym.s_uro || 0, other = 0;
    SYMPTOMS.forEach(function (s) { if (s.key !== 's_uro') other += (state.sym[s.key] || 0); });
    return uro >= 2 && other <= 1;
  }
  function isEarly() { return state.age === 'u40' || state.age === '40_45'; }

  function buildResult() {
    var total = symTotal(), vaso = vasoScore();
    var r = { eyebrow: 'Your HRT conversation guide', flagsActive: [], ask: [], urgent: null, early: false };

    // headline + lead
    if (isEarly() && (state.stage === 'stopped_year' || state.stage === 'stopped_recent' || state.stage === 'changing')) {
      r.early = true;
      r.head = 'This is a conversation worth having sooner rather than later';
      r.lead = 'Menopause symptoms before the age of 45 are treated differently. When the body reaches menopause early, replacing those hormones is often actively recommended, and the usual risk figures do not apply in the same way. This is worth raising with your GP without delay.';
    } else if (total >= 8 || vaso >= 2) {
      r.head = 'Your symptoms line up well with what HRT is designed to help';
      r.lead = 'Based on what you have told us, your symptoms are consistent with the menopause transition, and several of them — particularly hot flushes and night sweats — are ones for which HRT is the recognised first-line treatment. That makes an informed conversation with your GP a very reasonable next step.';
    } else if (total >= 3) {
      r.head = 'There is a worthwhile conversation to be had';
      r.lead = 'Your symptoms are in the milder-to-moderate range. HRT is one option, and so are non-hormonal approaches. The value of a GP conversation here is working out what is bothering you most and what is proportionate to it.';
    } else {
      r.head = 'Your symptoms are currently mild';
      r.lead = 'From what you have told us, symptoms are light at the moment. There may be no need for treatment yet — but knowing what to look for, and coming back to this if things change, puts you in control.';
    }

    // personalised asks
    if (vaso >= 2) r.ask.push('Say clearly that hot flushes and night sweats are affecting you — these are the symptoms HRT helps most, and the ones that make you a strong candidate for the conversation.');
    if (onlyUro()) r.ask.push('Your main symptom is vaginal dryness or discomfort. Ask specifically about local vaginal oestrogen — a low-dose treatment applied directly, which often resolves this without whole-body HRT.');
    else if ((state.sym.s_uro || 0) >= 2) r.ask.push('Mention the vaginal dryness or discomfort separately — it can be treated with local vaginal oestrogen alongside, or instead of, systemic HRT.');
    if ((state.sym.s_sleep || 0) >= 2 || (state.sym.s_mood || 0) >= 2) r.ask.push('Describe how sleep and mood are affected, and over how long — this helps your GP judge whether they are part of the hormonal picture or worth looking at separately.');
    if (state.stage === 'no_uterus') r.ask.push('Mention that you have had a hysterectomy — if you have no womb, oestrogen-only HRT is usually appropriate, which simplifies the choice.');
    r.ask.push('Ask what the options are for you specifically, including the type (patch, gel or tablet) and why one might suit you better than another.');
    r.ask.push('Ask what a typical review looks like — HRT is usually reviewed at three months and then yearly.');

    // flags
    FLAGS.forEach(function (f) {
      if (f.exclusive) return;
      if (state.flags[f.key]) {
        if (f.urgent) r.urgent = f.discuss;
        else r.flagsActive.push({ label: f.label, discuss: f.discuss });
      }
    });

    return r;
  }

  function reassuranceLine() {
    // Fraunces-italic micro-moment, personalised to what the user said is hardest.
    var hardest = null, max = -1;
    var labels = { s_vaso: 'hot flushes and night sweats', s_sleep: 'sleep', s_mood: 'mood and anxiety', s_uro: 'intimacy and dryness', s_phys: 'aches and brain fog' };
    ['s_vaso', 's_sleep', 's_mood', 's_uro', 's_phys'].forEach(function (k) {
      if ((state.sym[k] || 0) > max) { max = state.sym[k] || 0; hardest = k; }
    });
    if (max >= 2 && hardest) return 'You told us ' + labels[hardest] + ' are hardest right now \u2014 so let\u2019s make sure that\u2019s the first thing you raise.';
    return 'You don\u2019t have to have all the answers before you walk in \u2014 this is simply what to bring.';
  }

  function fmtDate() {
    try {
      var d = new Date();
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function renderResult() {
    var r = buildResult();
    root.innerHTML = '';
    var stage = el('div', 'hb-stage');
    var doc = el('div', 'hb-doc');

    // letterhead
    var head = el('div', 'hb-doc-head');
    head.appendChild(el('div', 'hb-doc-mark', 'The Hormone Blueprint'));
    head.appendChild(el('div', 'hb-doc-title', 'Your HRT Conversation Guide'));
    var dt = fmtDate();
    head.appendChild(el('div', 'hb-doc-date', 'Prepared for you' + (dt ? ' \u00b7 ' + dt : '')));
    doc.appendChild(head);

    var body = el('div', 'hb-doc-body');

    // reassurance micro-moment (serif italic)
    body.appendChild(el('p', 'hb-reassure', reassuranceLine()));

    // headline + lead
    body.appendChild(el('h2', 'hb-res-h', r.head));
    body.appendChild(el('p', 'hb-lead', r.lead));

    // urgent first, if present
    if (r.urgent) {
      var u = el('div', 'hb-block is-urgent');
      u.appendChild(el('h3', null, 'Please get this checked promptly'));
      u.appendChild(el('p', null, r.urgent));
      body.appendChild(u);
    }

    // what to ask
    var ask = el('div', 'hb-block');
    ask.appendChild(el('h3', null, 'What to raise with your GP'));
    var ul = el('ul', 'hb-list');
    r.ask.forEach(function (a) { ul.appendChild(el('li', null, a)); });
    ask.appendChild(ul);
    body.appendChild(ask);

    // flags to mention
    if (r.flagsActive.length) {
      var fb = el('div', 'hb-block is-flag');
      fb.appendChild(el('h3', null, 'Worth mentioning \u2014 not barriers'));
      var ul2 = el('ul', 'hb-list');
      r.flagsActive.forEach(function (f) { ul2.appendChild(el('li', null, '<strong>' + f.label + '.</strong> ' + f.discuss)); });
      fb.appendChild(ul2);
      body.appendChild(fb);
    }

    // balanced note
    var note = el('div', 'hb-block is-note');
    note.appendChild(el('h3', null, 'One thing worth knowing'));
    note.appendChild(el('p', null, 'Many women avoid HRT because of headlines from twenty years ago. Current guidance (NICE) is clear that, overall, taking HRT is unlikely to increase or decrease your life expectancy \u2014 and that the decision should be an informed one, made with you, not for you.'));
    body.appendChild(note);

    // links
    var links = el('div', 'hb-block');
    links.appendChild(el('h3', null, 'Read next'));
    var la = el('div', 'hb-links');
    la.innerHTML =
      '<a href="/womens-articles/truth-about-hrt-research">The truth about HRT</a>' +
      '<a href="/perimenopause-blood-test">Which blood tests help</a>' +
      '<a href="/hormone-quiz">Take the Hormone Quiz</a>';
    links.appendChild(la);
    body.appendChild(links);

    // disclaimer
    body.appendChild(el('div', 'hb-disclaimer', infoSVG +
      '<span>This tool is educational and is not medical advice or a diagnosis. It cannot see your full history. ' +
      'Any decision about starting, changing or stopping HRT should be made with a qualified clinician. ' +
      'Based on NICE guideline NG23 (Menopause: identification and management).</span>'));

    var rs = el('div', 'hb-restart');
    var rb = el('button', null, 'Start again'); rb.type = 'button';
    rb.addEventListener('click', function () { state = { stage: null, age: null, sym: {}, flags: {} }; stepIndex = 0; render(); });
    rs.appendChild(rb);
    body.appendChild(rs);

    doc.appendChild(body);
    stage.appendChild(doc);
    root.appendChild(stage);
  }

  function navBack(card, fn) {
    var nav = el('div', 'hb-nav');
    var back = el('button', 'hb-btn-ghost', '\u2190 Back'); back.type = 'button';
    back.addEventListener('click', fn);
    nav.appendChild(back);
    nav.appendChild(el('span'));
    card.appendChild(nav);
  }

  // ---- mount ------------------------------------------------------------------
  function mount() {
    root = document.getElementById(MOUNT_ID);
    if (!root) return;
    if (!document.getElementById('hb-hrt-fonts')) {
      var pre1 = el('link'); pre1.rel = 'preconnect'; pre1.href = 'https://fonts.googleapis.com';
      var pre2 = el('link'); pre2.rel = 'preconnect'; pre2.href = 'https://fonts.gstatic.com'; pre2.crossOrigin = 'anonymous';
      var fl = el('link'); fl.id = 'hb-hrt-fonts'; fl.rel = 'stylesheet'; fl.href = FONT_LINK;
      document.head.appendChild(pre1); document.head.appendChild(pre2); document.head.appendChild(fl);
    }
    if (!document.getElementById('hb-hrt-style')) {
      var st = el('style'); st.id = 'hb-hrt-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  // expose for the loader if it calls widgets by key
  if (typeof window !== 'undefined') {
    window.hbHrtGuide = { mount: mount, _state: function () { return state; }, _build: buildResult };
  }
})();
