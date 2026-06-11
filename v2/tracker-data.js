/**
 * hb-tracker / v2 / tracker-data.js
 *
 * Daily Tracker — per-hormone-type configurations and field definitions
 *
 * Each hormone type has:
 *   - welcomeMessage (personalized check-in greeting)
 *   - emphasizedSymptoms (top 4 symptoms relevant for this type)
 *   - cycleVisible (whether to show "cycle day" field)
 *
 * Pure data file — no UI, no logic.
 * Exports global: window.HB_TRACKER_DATA
 *
 * @version 1.0.0
 * @license MIT
 */

window.HB_TRACKER_DATA = {

  meta: {
    version: '1.0.0',
    entriesKey: 'hb_tracker_entries',
    streakKey: 'hb_tracker_streak',
    lastUpdated: '2026-05-29'
  },

  // Universal symptom pool — same 12 symptoms as Quiz Q5
  allSymptoms: [
    { value: 'hot_flashes',       label: 'Hot flashes' },
    { value: 'brain_fog',         label: 'Brain fog' },
    { value: 'mood_swings',       label: 'Mood swings' },
    { value: 'energy_crashes',    label: 'Energy crashes' },
    { value: 'fatigue',           label: 'Fatigue' },
    { value: 'weight_gain',       label: 'Weight gain' },
    { value: 'acne',              label: 'Acne' },
    { value: 'hair_thinning',     label: 'Hair thinning' },
    { value: 'sleep_issues',      label: 'Sleep issues' },
    { value: 'anxiety',           label: 'Anxiety' },
    { value: 'low_libido',        label: 'Low libido' },
    { value: 'cravings',          label: 'Cravings' },
    { value: 'hunger',            label: 'Hunger' },
    { value: 'breast_tenderness', label: 'Breast sensitivity' },
    { value: 'dryness',           label: 'Dryness' },
    { value: 'bloating',          label: 'Bloating' },
    { value: 'headaches',         label: 'Headaches' },
    { value: 'ovulation_cramps',  label: 'Ovulation pain' },
    { value: 'spotting',          label: 'Spotting' },
    { value: 'night_sweats',      label: 'Night sweats' },
    { value: 'nausea',            label: 'Nausea' },
    { value: 'cramps',            label: 'Cramps' },
    { value: 'joint_pain',        label: 'Joint pain' },
    { value: 'irregular_cycles',  label: 'Irregular cycles' },
    { value: 'heart_palpitations',label: 'Heart palpitations' }
  ],

  // Per-hormone-type configurations
  typeConfigs: {
    'cycle-surfer': {
      welcomeMessage: "Let's check in with your cycle today.",
      emphasizedSymptoms: ['mood_swings', 'energy_crashes', 'cravings', 'breast_tenderness'],
      relevantSymptoms: ['mood_swings', 'energy_crashes', 'fatigue', 'cravings', 'hunger', 'breast_tenderness', 'cramps', 'ovulation_cramps', 'spotting', 'bloating', 'nausea', 'headaches', 'acne', 'anxiety', 'sleep_issues', 'low_libido', 'irregular_cycles'],
      cycleVisible: true,
      cyclePrompt: 'Cycle day (day 1 = first day of period)'
    },
    'estrogen-dominant': {
      welcomeMessage: 'How are you feeling today?',
      emphasizedSymptoms: ['breast_tenderness', 'cravings', 'mood_swings', 'bloating'],
      relevantSymptoms: ['breast_tenderness', 'cravings', 'hunger', 'mood_swings', 'bloating', 'cramps', 'headaches', 'nausea', 'acne', 'anxiety', 'spotting', 'sleep_issues', 'energy_crashes', 'fatigue', 'ovulation_cramps', 'irregular_cycles'],
      cycleVisible: true,
      cyclePrompt: 'Cycle day (day 1 = first day of period)'
    },
    'progesterone-deficient': {
      welcomeMessage: "Let's see where you are today.",
      emphasizedSymptoms: ['anxiety', 'sleep_issues', 'mood_swings', 'energy_crashes'],
      relevantSymptoms: ['anxiety', 'sleep_issues', 'mood_swings', 'energy_crashes', 'fatigue', 'cramps', 'breast_tenderness', 'headaches', 'low_libido', 'spotting', 'night_sweats', 'bloating', 'cravings', 'brain_fog', 'irregular_cycles'],
      cycleVisible: true,
      cyclePrompt: 'Cycle day (leave blank if irregular)'
    },
    'perimenopause-transitioner': {
      welcomeMessage: "Today's transition check-in.",
      emphasizedSymptoms: ['hot_flashes', 'brain_fog', 'mood_swings', 'sleep_issues'],
      relevantSymptoms: ['hot_flashes', 'night_sweats', 'brain_fog', 'mood_swings', 'sleep_issues', 'anxiety', 'fatigue', 'headaches', 'low_libido', 'spotting', 'energy_crashes', 'cramps', 'nausea', 'irregular_cycles', 'joint_pain', 'heart_palpitations'],
      cycleVisible: true,
      cyclePrompt: 'Cycle day (leave blank if cycles are irregular)'
    },
    'postmenopause-renewer': {
      welcomeMessage: "Today's check-in.",
      emphasizedSymptoms: ['dryness', 'hot_flashes', 'fatigue', 'brain_fog'],
      relevantSymptoms: ['dryness', 'hot_flashes', 'fatigue', 'night_sweats', 'brain_fog', 'sleep_issues', 'low_libido', 'anxiety', 'headaches', 'energy_crashes', 'mood_swings', 'joint_pain', 'heart_palpitations'],
      cycleVisible: false,
      cyclePrompt: ''
    }
  },

  // Field definitions — universal across all hormone types
  fields: {
    energy: {
      id: 'energy',
      label: 'Energy today',
      type: 'scale',
      min: 1,
      max: 5,
      labels: ['Very low', 'Low', 'OK', 'Good', 'Great'],
      emoji: ['😩', '😕', '😐', '🙂', '😄'],
      required: true
    },
    sleep: {
      id: 'sleep',
      label: 'Hours of sleep last night',
      type: 'slider',
      min: 0,
      max: 12,
      step: 0.5,
      defaultValue: 7.5,
      unit: 'hours',
      required: true
    },
    cycle_day: {
      id: 'cycle_day',
      label: 'Cycle day',
      type: 'number',
      min: 1,
      max: 60,
      placeholder: 'e.g. 12',
      required: false
    },
    symptoms: {
      id: 'symptoms',
      label: 'Any symptoms today?',
      type: 'multi_select_chips',
      maxSelections: 5,
      helpText: 'Pick up to 5 — your top symptoms appear first',
      required: false
    },
    notes: {
      id: 'notes',
      label: 'Notes (optional)',
      type: 'textarea',
      maxLength: 280,
      placeholder: 'Anything else worth tracking?',
      required: false
    }
  },

  // Streak milestone copy (used for Day 1, 3, 7, 14, 30, 60, 90 messaging)
  streakMilestones: {
    1:  { title: 'Day 1',         message: 'You started. That matters.' },
    3:  { title: 'Day 3 streak',  message: "You're building the habit." },
    7:  { title: 'Week 1',        message: 'Patterns will start to emerge.' },
    14: { title: 'Day 14',        message: "Two weeks of data. You're doing this." },
    30: { title: 'Day 30',        message: 'Pattern detection unlocked.' },
    60: { title: 'Day 60',        message: "You've built a real practice." },
    90: { title: 'Day 90',        message: 'Three months. Real change happens here.' }
  }
};
