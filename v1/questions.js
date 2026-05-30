/**
 * hb-tracker / v1 / questions.js
 *
 * Hormone Type Quiz — Questions & Hormone Types Data
 *
 * Clinical foundation:
 *   - STRAW+10 (Harlow et al., 2012)
 *   - Rotterdam criteria (2003)
 *   - Vermeulen formula (1999)
 *
 * Chapter references aligned with The Hormone Blueprint book
 * (M. Procenko & M. Videika), 22 chapters across 5 parts.
 *
 * Pure data file — no UI, no scoring.
 * Exports global: window.HB_QUIZ_DATA
 *
 * @version 1.1.0
 * @license MIT
 */

window.HB_QUIZ_DATA = {

  meta: {
    version: '1.1.0',
    clinicalFramework: ['STRAW+10', 'Rotterdam', 'Vermeulen'],
    totalQuestions: 12,
    totalSections: 3,
    estimatedDuration: '3 minutes',
    lastUpdated: '2026-05-29-v2'
  },

  hormoneTypes: {
    'cycle-surfer': {
      id: 'cycle-surfer',
      name: 'Cycle Surfer',
      emoji: '🌊',
      accent: '#0A6A8C',
      tagline: 'Your cycle is your ally',
      description: 'You have a regular cycle with balanced hormones. Your body responds predictably to lifestyle changes — you can use your cycle as a guide.',
      chapterRange: 'Chapters 2, 13–17',
      topPriorities: ['Optimise your cycle phases', 'Build hormone-supporting habits', 'Track patterns for prevention']
    },
    'estrogen-dominant': {
      id: 'estrogen-dominant',
      name: 'Estrogen Dominant',
      emoji: '🔥',
      accent: '#C97B5C',
      tagline: 'Too much oestrogen, not enough progesterone',
      description: 'Your estrogen is high relative to progesterone. This drives PMS symptoms, breast tenderness, cravings, and water retention before your period.',
      chapterRange: 'Chapters 4, 6, 13, 17',
      topPriorities: ['Support oestrogen metabolism', 'Improve gut health', 'Reduce xenoestrogen exposure']
    },
    'progesterone-deficient': {
      id: 'progesterone-deficient',
      name: 'Progesterone Deficient',
      emoji: '🌑',
      accent: '#5A3A6E',
      tagline: 'Low calm hormone, high anxiety',
      description: 'Your progesterone is low, which means anxiety, sleep issues, and irregular cycles. Progesterone is the calming counterbalance to estrogen — when it drops, everything feels harder.',
      chapterRange: 'Chapters 4, 7–8, 15–16',
      topPriorities: ['Lower cortisol naturally', 'Support luteal phase', 'Rebuild sleep architecture']
    },
    'perimenopause-transitioner': {
      id: 'perimenopause-transitioner',
      name: 'Perimenopause Transitioner',
      emoji: '🌗',
      accent: '#1A2A4A',
      tagline: 'Hormones in transition',
      description: 'Your body is in transition between reproductive years and menopause. Hormones are fluctuating wildly. This phase typically lasts 4–10 years and is often the most symptomatic.',
      chapterRange: 'Chapters 11–12, 16, 19',
      topPriorities: ['Manage hot flashes', 'Protect sleep quality', 'Stabilise mood']
    },
    'postmenopause-renewer': {
      id: 'postmenopause-renewer',
      name: 'Postmenopause Renewer',
      emoji: '☀️',
      accent: '#C49C5C',
      tagline: 'A new stable hormonal baseline',
      description: "You're past menopause (no period for 12+ months). Your body is settling into a new hormonal baseline. The focus now: bone, heart, brain, and metabolic health.",
      chapterRange: 'Chapters 12, 14, 20',
      topPriorities: ['Build bone density', 'Support heart health', 'Maintain cognitive function']
    }
  },

  sections: [
    { id: 'A', index: 0, name: 'Life Stage', purpose: 'STRAW+10 staging', questionCount: 4 },
    { id: 'B', index: 1, name: 'Symptoms',   purpose: 'Hormone profile',  questionCount: 4 },
    { id: 'C', index: 2, name: 'Lifestyle',  purpose: 'Modifiers',        questionCount: 4 }
  ],

  questions: [
    {
      id: 'q1_age',
      section: 'A',
      index: 0,
      type: 'slider',
      question: 'How old are you?',
      helpText: 'Your age helps us identify your likely menopause stage',
      min: 18,
      max: 65,
      defaultValue: 35,
      step: 1,
      unit: 'years'
    },
    {
      id: 'q2_last_period',
      section: 'A',
      index: 1,
      type: 'single_select',
      question: 'When was your last period?',
      options: [
        { value: 'within_7_days', label: 'Within the last 7 days' },
        { value: '8_30_days',     label: '8–30 days ago' },
        { value: '1_3_months',    label: '1–3 months ago' },
        { value: '3_12_months',   label: '3–12 months ago' },
        { value: 'over_1_year',   label: 'More than 1 year ago' }
      ]
    },
    {
      id: 'q3_cycle_change',
      section: 'A',
      index: 2,
      type: 'single_select',
      question: 'How has your cycle changed in the last 2 years?',
      options: [
        { value: 'stayed_regular',  label: 'Stayed regular' },
        { value: 'sometimes_skip',  label: 'Sometimes I skip a month' },
        { value: 'getting_shorter', label: 'Cycles are getting shorter' },
        { value: 'getting_longer',  label: 'Cycles are getting longer / unpredictable' },
        { value: 'cant_tell',       label: "I can't tell" }
      ]
    },
    {
      id: 'q4_fertility',
      section: 'A',
      index: 3,
      type: 'single_select',
      question: 'Could you become pregnant naturally?',
      options: [
        { value: 'yes',          label: 'Yes, definitely' },
        { value: 'probably_not', label: 'Probably not' },
        { value: 'not_sure',     label: 'Not sure' },
        { value: 'not_relevant', label: 'Not relevant to me' }
      ]
    },
    {
      id: 'q5_top_symptoms',
      section: 'B',
      index: 4,
      type: 'multi_select',
      question: 'What are your TOP 3 symptoms right now?',
      helpText: 'Pick up to 3',
      maxSelections: 3,
      options: [
        { value: 'hot_flashes',       label: 'Hot flashes' },
        { value: 'brain_fog',         label: 'Brain fog' },
        { value: 'mood_swings',       label: 'Mood swings' },
        { value: 'energy_crashes',    label: 'Energy crashes' },
        { value: 'weight_gain',       label: 'Weight gain' },
        { value: 'acne',              label: 'Acne' },
        { value: 'hair_thinning',     label: 'Hair thinning' },
        { value: 'sleep_issues',      label: 'Sleep issues' },
        { value: 'anxiety',           label: 'Anxiety' },
        { value: 'low_libido',        label: 'Low libido' },
        { value: 'cravings',          label: 'Cravings' },
        { value: 'breast_tenderness', label: 'Breast tenderness' },
        { value: 'none',              label: 'None of these' }
      ]
    },
    {
      id: 'q6_symptom_timing',
      section: 'B',
      index: 5,
      type: 'single_select',
      question: 'When are your symptoms worst?',
      options: [
        { value: 'before_period', label: 'Right before my period' },
        { value: 'mid_cycle',     label: 'Around ovulation (mid-cycle)' },
        { value: 'random',        label: 'It seems random' },
        { value: 'all_the_time',  label: 'All the time' },
        { value: 'no_cycle',      label: "I don't have a regular cycle" }
      ]
    },
    {
      id: 'q7_post_period',
      section: 'B',
      index: 6,
      type: 'single_select',
      question: 'How do you feel right after your period (if you still have one)?',
      options: [
        { value: 'much_better',    label: 'Much better' },
        { value: 'worse',          label: 'Worse than before' },
        { value: 'same',           label: 'About the same' },
        { value: 'not_applicable', label: 'Not applicable' }
      ]
    },
    {
      id: 'q8_family_history',
      section: 'B',
      index: 7,
      type: 'multi_select',
      question: 'Any family history of these?',
      helpText: 'Pick all that apply',
      maxSelections: 5,
      options: [
        { value: 'early_menopause', label: 'Mom went through early menopause' },
        { value: 'pcos',            label: 'PCOS in family' },
        { value: 'thyroid',         label: 'Thyroid issues in family' },
        { value: 'none',            label: 'None of the above' },
        { value: 'dont_know',       label: "I don't know" }
      ]
    },
    {
      id: 'q9_stress',
      section: 'C',
      index: 8,
      type: 'scale',
      question: 'Your stress level in the last 6 months?',
      min: 1,
      max: 5,
      defaultValue: 3,
      labels: ['Very calm', 'Calm', 'Moderate', 'High', 'Very high'],
      emoji: ['😌', '🙂', '😐', '😟', '😰']
    },
    {
      id: 'q10_alcohol',
      section: 'C',
      index: 9,
      type: 'single_select',
      question: 'How much alcohol per week?',
      options: [
        { value: 'none',   label: 'None / very rarely' },
        { value: '1_3',    label: '1–3 drinks' },
        { value: '4_7',    label: '4–7 drinks' },
        { value: '8_plus', label: '8+ drinks' }
      ]
    },
    {
      id: 'q11_sleep',
      section: 'C',
      index: 10,
      type: 'single_select',
      question: 'How is your sleep quality lately?',
      options: [
        { value: 'great',    label: 'Great — I wake up rested' },
        { value: 'decent',   label: 'Decent — could be better' },
        { value: 'poor',     label: "Poor — I'm often tired" },
        { value: 'terrible', label: 'Terrible — I rarely sleep well' }
      ]
    },
    {
      id: 'q12_exercise',
      section: 'C',
      index: 11,
      type: 'single_select',
      question: 'How often do you exercise per week?',
      options: [
        { value: '5_plus', label: '5+ times' },
        { value: '2_4',    label: '2–4 times' },
        { value: '1_2',    label: '1–2 times' },
        { value: 'rarely', label: 'Rarely / never' }
      ]
    }
  ]
};
