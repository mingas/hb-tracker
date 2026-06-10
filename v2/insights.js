/**
 * hb-tracker / v2 / insights.js
 *
 * Pattern Detection Engine — 5 algorithms per Master Plan Sprint 2.
 *
 * Detects:
 *   1. Day-of-week energy patterns ("Energy lowest on Mondays")
 *   2. Cycle phase symptom patterns ("Mood swings cluster in luteal phase")
 *   3. Sleep → Energy correlation ("Low sleep → 35% lower same-day energy")
 *   4. Recent trend changes ("Energy improved 28% last week")
 *   5. Symptom frequency ("Mood swings on 70% of days this month")
 *
 * Each algorithm:
 *   - Requires minimum entry count (3/7/10/14 days)
 *   - Returns null if not enough data or no signal
 *   - Returns insight object: { id, icon, headline, body, actionable, severity }
 *
 * No AI, no API. Pure rule-based JavaScript.
 *
 * @version 1.0.0
 * @license MIT
 */

(function() {
  'use strict';

  var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  /* HELPERS */

  function parseEntries(entries) {
    // Convert { 'YYYY-MM-DD': {...} } map to sorted array with date metadata
    if (!entries || typeof entries !== 'object') return [];
    var keys = Object.keys(entries).sort(); // YYYY-MM-DD sorts chronologically
    return keys.map(function(key) {
      var e = entries[key] || {};
      var d = new Date(key + 'T00:00:00');
      return {
        key: key,
        date: d,
        dayOfWeek: d.getDay(), // 0=Sunday, 6=Saturday
        energy: typeof e.energy === 'number' ? e.energy : null,
        sleep: typeof e.sleep === 'number' ? e.sleep : null,
        cycleDay: typeof e.cycle_day === 'number' && e.cycle_day > 0 ? e.cycle_day : null,
        symptoms: Array.isArray(e.symptoms) ? e.symptoms : []
      };
    });
  }

  function mean(arr) {
    if (!arr || !arr.length) return 0;
    var sum = 0;
    for (var i = 0; i < arr.length; i++) sum += arr[i];
    return sum / arr.length;
  }

  function pct(value, base) {
    if (!base) return 0;
    return Math.round((value / base) * 100);
  }

  function pctChange(newVal, oldVal) {
    if (!oldVal) return 0;
    return Math.round(((newVal - oldVal) / oldVal) * 100);
  }

  /* SYMPTOM DISPLAY MAP — keep in sync with tracker-data.js allSymptoms */
  var SYMPTOM_LABELS = {
    'mood_swings': 'Mood swings',
    'energy_crashes': 'Energy crashes',
    'cravings': 'Cravings',
    'breast_tenderness': 'Breast tenderness',
    'acne': 'Acne',
    'anxiety': 'Anxiety',
    'low_libido': 'Low libido',
    'sleep_issues': 'Sleep issues',
    'hot_flashes': 'Hot flashes',
    'brain_fog': 'Brain fog',
    'weight_gain': 'Weight gain',
    'hair_thinning': 'Hair thinning',
    'joint_pain': 'Joint pain',
    'heart_palpitations': 'Heart palpitations',
    'dryness': 'Dryness',
    'bloating': 'Bloating',
    'headaches': 'Headaches',
    'irregular_cycles': 'Irregular cycles',
    'ovulation_cramps': 'Ovulation cramps'
  };

  function symptomLabel(key) {
    return SYMPTOM_LABELS[key] || key.replace(/_/g, ' ');
  }

  /* CYCLE PHASE CLASSIFICATION (28-day standard reference) */
  function cyclePhase(day) {
    if (day == null) return null;
    if (day >= 1 && day <= 5) return 'menstrual';
    if (day >= 6 && day <= 13) return 'follicular';
    if (day >= 14 && day <= 16) return 'ovulation';
    if (day >= 17 && day <= 28) return 'luteal';
    return null;
  }

  var PHASE_LABEL = {
    'menstrual': 'menstrual phase (days 1-5)',
    'follicular': 'follicular phase (days 6-13)',
    'ovulation': 'ovulation window (days 14-16)',
    'luteal': 'luteal phase (days 17-28)'
  };

  /* =========================================================
     ALGORITHM 1: Day-of-week energy patterns
     Min: 14 entries spanning at least 2 weeks
     Triggers: one weekday's mean energy ≥30% below all-week mean
     ========================================================= */
  function detectDayOfWeekPattern(parsed) {
    var withEnergy = parsed.filter(function(p) { return p.energy != null; });
    if (withEnergy.length < 14) return null;

    var byDay = [[],[],[],[],[],[],[]];
    withEnergy.forEach(function(p) { byDay[p.dayOfWeek].push(p.energy); });

    // Need at least 2 entries per day to be meaningful
    var dayMeans = [];
    var allValues = [];
    for (var i = 0; i < 7; i++) {
      if (byDay[i].length >= 2) {
        dayMeans[i] = mean(byDay[i]);
        for (var j = 0; j < byDay[i].length; j++) allValues.push(byDay[i][j]);
      } else {
        dayMeans[i] = null;
      }
    }

    var validDays = dayMeans.filter(function(v) { return v != null; });
    if (validDays.length < 4) return null;

    var overallMean = mean(allValues);
    if (overallMean < 1) return null;

    // Find lowest day
    var minDay = -1, minVal = 99;
    for (var k = 0; k < 7; k++) {
      if (dayMeans[k] != null && dayMeans[k] < minVal) {
        minVal = dayMeans[k];
        minDay = k;
      }
    }
    if (minDay === -1) return null;

    var diffPct = Math.round(((overallMean - minVal) / overallMean) * 100);
    if (diffPct < 25) return null; // Not strong enough

    return {
      id: 'day_of_week',
      icon: '\u{1F4C5}', // 📅
      headline: 'Your energy is lowest on ' + DAY_NAMES[minDay] + 's',
      body: 'Average energy on ' + DAY_NAMES[minDay] + 's: ' + minVal.toFixed(1) + '/5 — about ' + diffPct + '% below your typical day (' + overallMean.toFixed(1) + '/5). This may signal a weekly rhythm worth examining.',
      severity: 'info'
    };
  }

  /* =========================================================
     ALGORITHM 2: Cycle phase patterns
     Min: 14 entries with cycle_day, covering at least 2 phases
     Triggers: a symptom appears in ≥60% of days within one phase
     ========================================================= */
  function detectCyclePhasePattern(parsed) {
    var withCycle = parsed.filter(function(p) { return p.cycleDay != null && p.cycleDay >= 1 && p.cycleDay <= 35; });
    if (withCycle.length < 14) return null;

    // Group entries by phase
    var byPhase = { menstrual: [], follicular: [], ovulation: [], luteal: [] };
    withCycle.forEach(function(p) {
      var phase = cyclePhase(p.cycleDay);
      if (phase) byPhase[phase].push(p);
    });

    // Find phases with at least 4 entries
    var phaseKeys = Object.keys(byPhase).filter(function(k) { return byPhase[k].length >= 4; });
    if (phaseKeys.length < 1) return null;

    var bestInsight = null;
    var bestScore = 0;

    phaseKeys.forEach(function(phase) {
      var phaseEntries = byPhase[phase];
      var symptomCounts = {};
      phaseEntries.forEach(function(p) {
        p.symptoms.forEach(function(s) {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        });
      });

      Object.keys(symptomCounts).forEach(function(sym) {
        var count = symptomCounts[sym];
        var pctInPhase = pct(count, phaseEntries.length);
        if (pctInPhase >= 60 && count >= 3) {
          var score = pctInPhase * count; // Prefer high % AND high count
          if (score > bestScore) {
            bestScore = score;
            bestInsight = {
              id: 'cycle_phase',
              icon: '\u{1F319}', // 🌙
              headline: symptomLabel(sym) + ' cluster in your ' + phase + ' phase',
              body: 'You logged ' + symptomLabel(sym).toLowerCase() + ' on ' + count + ' of ' + phaseEntries.length + ' ' + phase + '-phase days (' + pctInPhase + '%). This is a typical hormonal rhythm during your ' + PHASE_LABEL[phase] + '.',
              severity: 'info'
            };
          }
        }
      });
    });

    return bestInsight;
  }

  /* =========================================================
     ALGORITHM 3: Sleep → Energy correlation
     Min: 10 entries with both sleep and energy
     Triggers: low-sleep nights (<6.5h) have ≥25% lower same-day energy
     ========================================================= */
  function detectSleepEnergyCorrelation(parsed) {
    var both = parsed.filter(function(p) { return p.sleep != null && p.energy != null; });
    if (both.length < 10) return null;

    var lowSleep = []; // <6.5h
    var goodSleep = []; // >=7h
    both.forEach(function(p) {
      if (p.sleep < 6.5) lowSleep.push(p.energy);
      else if (p.sleep >= 7) goodSleep.push(p.energy);
    });

    if (lowSleep.length < 3 || goodSleep.length < 3) return null;

    var lowMean = mean(lowSleep);
    var goodMean = mean(goodSleep);

    var diffPct = Math.round(((goodMean - lowMean) / goodMean) * 100);
    if (diffPct < 20) return null;

    return {
      id: 'sleep_energy',
      icon: '\u{1F634}', // 😴
      headline: 'Short sleep nights leave you drained',
      body: 'On nights under 6.5h sleep (' + lowSleep.length + ' logs), your energy averages ' + lowMean.toFixed(1) + '/5. On 7+ hour nights (' + goodSleep.length + ' logs), it averages ' + goodMean.toFixed(1) + '/5 — about ' + diffPct + '% higher. Protecting sleep is a high-leverage move.',
      severity: 'actionable'
    };
  }

  /* =========================================================
     ALGORITHM 4: Recent trend changes
     Min: 14 entries spanning recent 2 weeks
     Triggers: mean energy of last 7 days vs prior 7 days differs ≥20%
     ========================================================= */
  function detectRecentTrend(parsed) {
    var withEnergy = parsed.filter(function(p) { return p.energy != null; });
    if (withEnergy.length < 14) return null;

    // Take last 14 entries, split into recent 7 vs prior 7
    var recent = withEnergy.slice(-7);
    var prior = withEnergy.slice(-14, -7);
    if (recent.length < 5 || prior.length < 5) return null;

    var recentMean = mean(recent.map(function(p) { return p.energy; }));
    var priorMean = mean(prior.map(function(p) { return p.energy; }));

    var changePct = pctChange(recentMean, priorMean);
    if (Math.abs(changePct) < 20) return null;

    if (changePct > 0) {
      return {
        id: 'trend_improving',
        icon: '\u{1F4C8}', // 📈
        headline: 'Your energy is improving',
        body: 'Your last 7 logs averaged ' + recentMean.toFixed(1) + '/5 vs ' + priorMean.toFixed(1) + '/5 the 7 before that — about ' + changePct + '% higher. Whatever you changed is working; keep it going.',
        severity: 'positive'
      };
    } else {
      return {
        id: 'trend_declining',
        icon: '\u{1F4C9}', // 📉
        headline: 'Your energy has dipped recently',
        body: 'Your last 7 logs averaged ' + recentMean.toFixed(1) + '/5 vs ' + priorMean.toFixed(1) + '/5 the 7 before that — about ' + Math.abs(changePct) + '% lower. Worth checking what changed in sleep, stress, or routine.',
        severity: 'caution'
      };
    }
  }

  /* =========================================================
     ALGORITHM 5: Symptom frequency
     Min: 7 entries
     Triggers: a symptom appears in ≥50% of days
     ========================================================= */
  function detectSymptomFrequency(parsed) {
    if (parsed.length < 7) return null;

    var counts = {};
    parsed.forEach(function(p) {
      p.symptoms.forEach(function(s) { counts[s] = (counts[s] || 0) + 1; });
    });

    var topSym = null;
    var topPct = 0;
    var topCount = 0;
    Object.keys(counts).forEach(function(sym) {
      var p = pct(counts[sym], parsed.length);
      if (p >= 50 && p > topPct) {
        topPct = p;
        topSym = sym;
        topCount = counts[sym];
      }
    });

    if (!topSym) return null;

    return {
      id: 'symptom_frequency',
      icon: '\u{1F50D}', // 🔍
      headline: symptomLabel(topSym) + ' is your most frequent symptom',
      body: 'You logged ' + symptomLabel(topSym).toLowerCase() + ' on ' + topCount + ' of ' + parsed.length + ' days (' + topPct + '%). This deserves a closer look in The Hormone Blueprint — your hormone-type chapter covers it directly.',
      severity: 'actionable'
    };
  }

  /* =========================================================
     MAIN DETECTOR
     Returns up to 3 most relevant insights, ranked by severity
     ========================================================= */
  function detectPatterns(entries, hormoneType) {
    var parsed = parseEntries(entries);
    if (parsed.length < 3) return [];

    var insights = [
      detectDayOfWeekPattern(parsed),
      detectCyclePhasePattern(parsed),
      detectSleepEnergyCorrelation(parsed),
      detectRecentTrend(parsed),
      detectSymptomFrequency(parsed)
    ].filter(function(i) { return i != null; });

    // Rank by severity: positive/actionable first, then info, then caution
    var rank = { positive: 1, actionable: 2, info: 3, caution: 4 };
    insights.sort(function(a, b) { return (rank[a.severity] || 9) - (rank[b.severity] || 9); });

    var top = insights.slice(0, 3); // Cap at 3 insights to avoid overwhelming
    // v2 advice layer: attach why/action/product to each pattern (defensive, no-op if HB_ADVICE absent)
    if (window.HB_ADVICE && typeof window.HB_ADVICE.enrichInsight === 'function') {
      for (var t = 0; t < top.length; t++) { try { window.HB_ADVICE.enrichInsight(top[t], parsed.length); } catch (e) {} }
    }
    return top;
  }

  /* Public API */
  window.HB_INSIGHTS = {
    version: '1.0.0',
    detectPatterns: detectPatterns,
    // Expose helpers for testing
    _parseEntries: parseEntries,
    _cyclePhase: cyclePhase,
    _symptomLabel: symptomLabel
  };

})();
