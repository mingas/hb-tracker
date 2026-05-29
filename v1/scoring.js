/**
 * hb-tracker / v1 / scoring.js
 *
 * Hormone Type Quiz — Scoring Logic
 *
 * Input:  answers object (keys = question id, values = answer)
 * Output: { hormoneType, hormonalAge, intensityScore, scores }
 *
 * Pure function — no UI, no DOM, no side effects.
 * Exports global: window.HB_QUIZ_SCORE
 *
 * Clinical foundation:
 *   - STRAW+10 staging (Q1-Q4 → menopause stage)
 *   - Rotterdam-inspired PCOS detection (Q5+Q8)
 *   - Symptom clustering (Q5-Q7 → hormone profile)
 *   - Lifestyle modifiers (Q9-Q12 → intensity)
 *
 * Changelog:
 *   v1.1.0 — clinical gates: ED requires estrogen symptoms;
 *            Peri & Postmeno require age >= 35 (STRAW+10).
 *   v1.0.0 — initial.
 *
 * @version 1.1.0
 * @license MIT
 */

(function() {
  'use strict';

  /* ============================================================
     MAIN SCORING FUNCTION
     ============================================================ */

  function score(answers) {
    const safe = answers || {};

    // Step 1 — calculate per-type scores
    const scores = {
      'cycle-surfer': scoreCycleSurfer(safe),
      'estrogen-dominant': scoreEstrogenDominant(safe),
      'progesterone-deficient': scoreProgesteroneDeficient(safe),
      'perimenopause-transitioner': scorePerimenopauseTransitioner(safe),
      'postmenopause-renewer': scorePostmenopauseRenewer(safe)
    };

    // Step 2 — pick highest-scoring type
    const hormoneType = pickHighest(scores);

    // Step 3 — calculate Hormonal Age
    const hormonalAge = calculateHormonalAge(safe);

    // Step 4 — calculate symptom intensity (1-5 scale)
    const intensityScore = calculateIntensity(safe);

    return {
      hormoneType: hormoneType,
      hormonalAge: hormonalAge,
      intensityScore: intensityScore,
      scores: scores
    };
  }

  /* ============================================================
     TYPE 1: CYCLE SURFER
     Default for regular cycles, balanced hormones, no major symptoms
     ============================================================ */

  function scoreCycleSurfer(a) {
    let score = 0;

    // Age 18-39 with regular periods
    if (a.q1_age && a.q1_age < 40) score += 2;

    // Recent period (within 30 days)
    if (a.q2_last_period === 'within_7_days' || a.q2_last_period === '8_30_days') score += 3;

    // Cycle stayed regular
    if (a.q3_cycle_change === 'stayed_regular') score += 4;

    // Can become pregnant
    if (a.q4_fertility === 'yes') score += 2;

    // No severe symptom clustering
    const symptoms = a.q5_top_symptoms || [];
    if (symptoms.length <= 1) score += 2;

    // Feels better after period
    if (a.q7_post_period === 'much_better') score += 2;

    // Symptoms tied to before-period only (mild PMS)
    if (a.q6_symptom_timing === 'before_period') score += 1;

    return score;
  }

  /* ============================================================
     TYPE 2: ESTROGEN DOMINANT
     PMS symptoms, breast tenderness, cravings — relative excess
     
     CLINICAL GATE (v1.1.0): requires at least one estrogen-pattern
     symptom. Timing/cycle bonuses alone cannot trigger this type —
     otherwise users with random symptoms could be misclassified.
     ============================================================ */

  function scoreEstrogenDominant(a) {
    const symptoms = a.q5_top_symptoms || [];

    // GATE: must have at least one estrogen-pattern symptom
    const estrogenSymptoms = ['breast_tenderness', 'cravings', 'mood_swings', 'weight_gain', 'acne'];
    const hasEstrogenSymptom = symptoms.some(function(s) {
      return estrogenSymptoms.indexOf(s) !== -1;
    });
    if (!hasEstrogenSymptom) return 0;

    let score = 0;

    // Classic estrogen dominance symptoms
    if (symptoms.indexOf('breast_tenderness') !== -1) score += 4;
    if (symptoms.indexOf('cravings') !== -1) score += 3;
    if (symptoms.indexOf('mood_swings') !== -1) score += 2;
    if (symptoms.indexOf('weight_gain') !== -1) score += 2;
    if (symptoms.indexOf('acne') !== -1) score += 1;

    // Symptoms peak BEFORE period — classic PMS pattern
    if (a.q6_symptom_timing === 'before_period') score += 4;

    // Feels MUCH BETTER after period (estrogen drops post-menstruation)
    if (a.q7_post_period === 'much_better') score += 3;

    // Still has cycles (estrogen dominance presupposes cycling)
    if (a.q2_last_period === 'within_7_days' || a.q2_last_period === '8_30_days') score += 2;

    // Age range — typical 25-45
    if (a.q1_age && a.q1_age >= 25 && a.q1_age <= 45) score += 1;

    return score;
  }

  /* ============================================================
     TYPE 3: PROGESTERONE DEFICIENT
     Anxiety, sleep issues, irregular cycles, "low calm hormone"
     ============================================================ */

  function scoreProgesteroneDeficient(a) {
    let score = 0;

    const symptoms = a.q5_top_symptoms || [];

    // Classic low-progesterone symptoms
    if (symptoms.indexOf('anxiety') !== -1) score += 4;
    if (symptoms.indexOf('sleep_issues') !== -1) score += 3;
    if (symptoms.indexOf('mood_swings') !== -1) score += 2;
    if (symptoms.indexOf('low_libido') !== -1) score += 1;

    // Irregular cycles (progesterone insufficiency → ovulation issues)
    if (a.q3_cycle_change === 'sometimes_skip' || a.q3_cycle_change === 'getting_longer') score += 3;

    // High stress (cortisol steals progesterone precursors)
    if (a.q9_stress && a.q9_stress >= 4) score += 3;

    // Poor sleep correlation
    if (a.q11_sleep === 'poor' || a.q11_sleep === 'terrible') score += 2;

    // Family thyroid history (often co-occurs)
    const family = a.q8_family_history || [];
    if (family.indexOf('thyroid') !== -1) score += 1;

    // Symptoms get worse — random or all the time
    if (a.q6_symptom_timing === 'random' || a.q6_symptom_timing === 'all_the_time') score += 2;

    return score;
  }

  /* ============================================================
     TYPE 4: PERIMENOPAUSE TRANSITIONER
     Hot flashes starting, hormones fluctuating wildly, age 38-52
     
     CLINICAL GATE (v1.1.0): requires age >= 35. STRAW+10 staging
     does not apply below this age. Younger women with similar
     symptoms are more likely PCOS, thyroid, or POI.
     ============================================================ */

  function scorePerimenopauseTransitioner(a) {
    // GATE: clinical perimenopause begins at ~35+
    if (!a.q1_age || a.q1_age < 35) return 0;

    let score = 0;
    const symptoms = a.q5_top_symptoms || [];

    // Hot flashes is THE perimenopause marker
    if (symptoms.indexOf('hot_flashes') !== -1) score += 5;
    if (symptoms.indexOf('brain_fog') !== -1) score += 3;
    if (symptoms.indexOf('mood_swings') !== -1) score += 2;
    if (symptoms.indexOf('sleep_issues') !== -1) score += 2;
    if (symptoms.indexOf('hair_thinning') !== -1) score += 1;
    if (symptoms.indexOf('weight_gain') !== -1) score += 1;
    if (symptoms.indexOf('low_libido') !== -1) score += 1;

    // Age 38-55 typical perimenopause window
    if (a.q1_age >= 38 && a.q1_age <= 55) score += 3;

    // Cycle changes (STRAW+10 staging)
    if (a.q3_cycle_change === 'getting_shorter' || a.q3_cycle_change === 'getting_longer') score += 3;
    if (a.q3_cycle_change === 'sometimes_skip') score += 2;

    // Period 1-12 months ago (perimenopause window)
    if (a.q2_last_period === '1_3_months' || a.q2_last_period === '3_12_months') score += 4;

    // Family history of early menopause
    const family = a.q8_family_history || [];
    if (family.indexOf('early_menopause') !== -1) score += 2;

    // Cannot become pregnant easily
    if (a.q4_fertility === 'probably_not' || a.q4_fertility === 'not_sure') score += 1;

    return score;
  }

  /* ============================================================
     TYPE 5: POSTMENOPAUSE RENEWER
     No period 12+ months, new hormonal baseline
     
     CLINICAL GATE (v1.1.0): requires age >= 35. Amenorrhea under
     this age has different causes (POI, hypothalamic, eating
     disorders, PCOS) — not standard postmenopause.
     ============================================================ */

  function scorePostmenopauseRenewer(a) {
    // GATE: postmenopause is clinically rare before 35
    if (!a.q1_age || a.q1_age < 35) return 0;

    let score = 0;

    // No period for more than 1 year — definitive marker
    if (a.q2_last_period === 'over_1_year') score += 10;

    // Age 50+ typical
    if (a.q1_age >= 50) score += 3;
    if (a.q1_age >= 55) score += 2;

    // Cannot become pregnant
    if (a.q4_fertility === 'no' || a.q4_fertility === 'not_relevant') score += 2;
    if (a.q4_fertility === 'probably_not') score += 1;

    // Period question N/A
    if (a.q7_post_period === 'not_applicable') score += 2;

    // No regular cycle
    if (a.q6_symptom_timing === 'no_cycle') score += 2;

    return score;
  }

  /* ============================================================
     PICK HIGHEST-SCORING TYPE
     With tie-breaking logic
     ============================================================ */

  function pickHighest(scores) {
    let maxScore = -Infinity;
    let winner = 'cycle-surfer'; // safe default

    // Tie-breaker priority (most specific → least specific)
    const priority = [
      'postmenopause-renewer',
      'perimenopause-transitioner',
      'estrogen-dominant',
      'progesterone-deficient',
      'cycle-surfer'
    ];

    for (const type of priority) {
      if (scores[type] > maxScore) {
        maxScore = scores[type];
        winner = type;
      }
    }

    return winner;
  }

  /* ============================================================
     HORMONAL AGE CALCULATION
     Same concept as Andropause Calculator (men) — a number that
     combines biological age + lifestyle damage + symptom severity
     ============================================================ */

  function calculateHormonalAge(a) {
    let hormonalAge = a.q1_age || 35;

    // Lifestyle PENALTIES (add years)
    if (a.q9_stress === 5) hormonalAge += 4;
    else if (a.q9_stress === 4) hormonalAge += 2;

    if (a.q10_alcohol === '8_plus') hormonalAge += 4;
    else if (a.q10_alcohol === '4_7') hormonalAge += 2;

    if (a.q11_sleep === 'terrible') hormonalAge += 4;
    else if (a.q11_sleep === 'poor') hormonalAge += 2;

    if (a.q12_exercise === 'rarely') hormonalAge += 3;
    else if (a.q12_exercise === '1_2') hormonalAge += 1;

    // Lifestyle BONUSES (subtract years)
    if (a.q9_stress === 1) hormonalAge -= 2;
    else if (a.q9_stress === 2) hormonalAge -= 1;

    if (a.q11_sleep === 'great') hormonalAge -= 2;

    if (a.q12_exercise === '5_plus') hormonalAge -= 2;
    else if (a.q12_exercise === '2_4') hormonalAge -= 1;

    if (a.q10_alcohol === 'none') hormonalAge -= 1;

    // Severe symptom load adds years
    const symptoms = a.q5_top_symptoms || [];
    if (symptoms.length >= 3) hormonalAge += 1;

    // Cap at reasonable range
    if (hormonalAge < 18) hormonalAge = 18;
    if (hormonalAge > 80) hormonalAge = 80;

    return Math.round(hormonalAge);
  }

  /* ============================================================
     SYMPTOM INTENSITY (1-5 scale)
     Used by Daily Tracker to prioritise which symptoms to track
     ============================================================ */

  function calculateIntensity(a) {
    let intensity = 1;

    // Number of symptoms reported
    const symptoms = a.q5_top_symptoms || [];
    intensity += Math.min(symptoms.length, 3);

    // Stress level adds intensity
    if (a.q9_stress === 5) intensity += 1;

    // Poor sleep adds intensity
    if (a.q11_sleep === 'terrible') intensity += 1;

    // Symptoms all the time = highest intensity
    if (a.q6_symptom_timing === 'all_the_time') intensity += 1;

    // Cap at 1-5
    if (intensity < 1) intensity = 1;
    if (intensity > 5) intensity = 5;

    return intensity;
  }

  /* ============================================================
     EXPORT GLOBAL
     ============================================================ */

  window.HB_QUIZ_SCORE = {
    version: '1.1.0',
    score: score,

    // Exposed for debugging / testing
    _internal: {
      scoreCycleSurfer: scoreCycleSurfer,
      scoreEstrogenDominant: scoreEstrogenDominant,
      scoreProgesteroneDeficient: scoreProgesteroneDeficient,
      scorePerimenopauseTransitioner: scorePerimenopauseTransitioner,
      scorePostmenopauseRenewer: scorePostmenopauseRenewer,
      calculateHormonalAge: calculateHormonalAge,
      calculateIntensity: calculateIntensity
    }
  };

})();
