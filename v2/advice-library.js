/**
 * hb-tracker / v2 / advice-library.js
 *
 * Advice Content Library — the single source of truth for all educational
 * and advisory micro-content shown in the Hormone Type Quiz + Daily Tracker.
 *
 * Design principles (voice "C" — warm but smart):
 *   - Each card teaches ONE non-obvious thing. Never restate the obvious
 *     ("sleep more", "eat better"). Validate -> explain WHY -> one action.
 *   - Mirror, not nag: GOOD days are explained too, not only problems.
 *   - ~30-45 words. Plain-language science, never dumbed down.
 *   - No shame, no fear (weight, bleeding, mood). No "girl/queen/babe".
 *   - Book + product references appear SPARINGLY and only where earned,
 *     never on safety cards. Max 1 product per screen.
 *
 * Grounding: every card is grounded in "The Hormone Blueprint"
 *   (M. Procenko & M. Videika). bookRef cites the chapter the claim comes
 *   from. Where the book is thin, content is checked against reputable
 *   public sources (NHS / NICE / Mayo Clinic / Menopause Society / ACOG).
 *
 * Not medical advice. Educational self-assessment only.
 *
 * Field shape per card:
 *   id        unique string
 *   severity  'positive' | 'info' | 'actionable' | 'caution'
 *   headline  short hook (<= ~8 words)
 *   why       1-2 sentences: the mechanism / the non-obvious insight
 *   actions   array of 1-3 short, concrete steps (may be empty)
 *   bookRef   chapter / bonus-card reference (display is selective)
 *   productSlot  '/recommends/<slug>' or null  (NEVER on safety cards)
 *   source    'book' | short citation
 *
 * Exports global: window.HB_ADVICE
 *
 * @version 1.1.0
 * @license MIT
 */

window.HB_ADVICE = {

  meta: {
    version: '1.1.0',
    lastUpdated: '2026-06-01',
    sourceNote: 'Based on The Hormone Blueprint, checked against NHS, NICE, Mayo Clinic, The Menopause Society and ACOG guidance.',
    disclaimer: 'Educational only — not a medical diagnosis. For personal medical advice, see a qualified clinician.',
    // crisis resources, surfaced by safety cards only
    crisis: { uk: 'Samaritans 116 123', us: '988 Suicide & Crisis Lifeline' }
  },

  /* =========================================================
     LAYER 1 — QUIZ-RESULT CARDS
     Shown immediately after the 12-question quiz. No tracker
     data required. Personalized to hormone TYPE. This is where
     "useful from the first second" lives.
     ========================================================= */
  resultCards: {

    'cycle-surfer': [
      { id:'cs-rhythm', severity:'info',
        headline:"You have a working rhythm — use it",
        why:"Your cycle runs in four phases, and each one changes what your body is best at. Most women fight the same way all month; you can ride the tide instead.",
        actions:["Note which phase you're in when you log","Plan demanding work for the week after your period"],
        bookRef:'Ch 2 — The Four Phases', productSlot:null, source:'book' },
      { id:'cs-follicular', severity:'positive',
        headline:"Your strongest week is hiding in plain sight",
        why:"In the week after your period, estrogen climbs — energy, mood and focus tend to peak, and workouts feel easier. It's the best window for hard things.",
        actions:["Schedule the big meeting or project then","Train a little harder while the tide is with you"],
        bookRef:'Ch 2 — The Four Phases', productSlot:null, source:'book' },
      { id:'cs-luteal', severity:'info',
        headline:"The dip before your period is real, not weakness",
        why:"In the last 5-7 days before bleeding, progesterone falls and the world feels louder — mood, sleep and cravings shift. Knowing it's hormonal changes how you treat yourself.",
        actions:["Protect sleep and ease off caffeine and alcohol then","Lower workout intensity rather than pushing through"],
        bookRef:'Ch 2 — The Four Phases', productSlot:'/recommends/magnesium', source:'book' },
      { id:'cs-baseline', severity:'info',
        headline:"A regular cycle is a vital sign",
        why:"A predictable cycle is one of the clearest signals your hormonal system is working. Tracking it now gives you a personal baseline — so you'll notice early if anything shifts.",
        actions:["Log a few days each week to build your baseline"],
        bookRef:'Ch 2 — The Cycle Is a Vital Sign', productSlot:null, source:'book' }
    ],

    'estrogen-dominant': [
      { id:'ed-clearance', severity:'actionable',
        headline:"Estrogen isn't just made — it's cleared",
        why:"After the liver processes estrogen, the gut clears it. When that's sluggish, estrogen recirculates and PMS, bloating and breast tenderness get worse. Fibre is the lever most women miss.",
        actions:["Aim toward 30 g fibre a day","Add cruciferous veg (broccoli, cauliflower) a few times a week"],
        bookRef:'Ch 13 — Fibre & Estrogen Clearance', productSlot:null, source:'book' },
      { id:'ed-alcohol', severity:'info',
        headline:"Alcohol quietly raises the load",
        why:"Alcohol both raises estrogen and burdens the liver that has to clear it — which is part of why PMS, breast tenderness and poor sleep often track your drinking more than you'd expect.",
        actions:["Notice how the week after a few drinks feels vs a dry week"],
        bookRef:'Ch 13 — What to Drink', productSlot:null, source:'book' },
      { id:'ed-bloodsugar', severity:'actionable',
        headline:"Steady blood sugar steadies the swings",
        why:"Blood-sugar spikes amplify the hormonal turbulence behind cravings and mood dips. Eating protein and fibre before carbs flattens the spike — a small order change with an outsized effect.",
        actions:["Protein + veg first, bread/rice/pasta second","A 10-minute walk after meals when you can"],
        bookRef:'Ch 13 — The Blood Sugar Foundation', productSlot:null, source:'book' },
      { id:'ed-pms', severity:'info',
        headline:"Two nutrients with real PMS evidence",
        why:"For the breast tenderness, cravings and mood of the luteal phase, calcium and vitamin B6 have the strongest supplement evidence — unglamorous, but actually studied.",
        actions:["Calcium-rich foods daily","Magnesium in the evening for sleep and tension"],
        bookRef:'Ch 17 — Targeted Supplements', productSlot:'/recommends/magnesium', source:'book' }
    ],

    'progesterone-deficient': [
      { id:'pd-sleep', severity:'actionable',
        headline:"Low progesterone shows up first in sleep",
        why:"Progesterone calms the brain through GABA and is mildly sedating. When it runs low — luteal phase, post-pill, or perimenopause — sleep gets lighter and anxiety creeps in before anything else changes.",
        actions:["Protect a consistent bedtime, especially the back half of your cycle","Magnesium glycinate in the evening helps some women"],
        bookRef:'Ch 15 — The Sleep-Hormone Street', productSlot:'/recommends/magnesium', source:'book' },
      { id:'pd-anxiety', severity:'info',
        headline:"New anxiety can be hormonal, not character",
        why:"When progesterone drops, its calming metabolite drops with it — so anxiety that arrives 'for no reason', often premenstrually, frequently has a hormonal driver rather than a personal one.",
        actions:["Note whether anxiety clusters at the same point each cycle","Long slow exhales (in 4, out 8) settle the nervous system fast"],
        bookRef:'Ch 7 — Where Hormones Meet the Mind', productSlot:null, source:'book' },
      { id:'pd-stress', severity:'actionable',
        headline:"Chronic stress steals from progesterone",
        why:"Under sustained stress the body prioritises cortisol, and progesterone tends to fall — which is why high-stress months make PMS, sleep and anxiety markedly worse.",
        actions:["A 2-minute breathing practice, twice daily, beats one long session","Protect one unbroken block of sleep"],
        bookRef:'Ch 16 — How Stress Hijacks Hormones', productSlot:null, source:'book' },
      { id:'pd-track', severity:'info',
        headline:"Your pattern is the most useful test",
        why:"There's rarely a single blood test that captures this. Tracking when symptoms hit across your cycle builds the picture a one-off test can't — and the language for a useful doctor's visit.",
        actions:["Log sleep, mood and energy through a full cycle"],
        bookRef:'Ch 19 — Why Timing Matters', productSlot:null, source:'book' }
    ],

    'perimenopause-transitioner': [
      { id:'peri-name', severity:'info',
        headline:"Naming it is the first real step",
        why:"Perimenopause can start in the late thirties and last years — progesterone falls first, then estrogen swings. The sleep, mood and brain-fog changes are turbulence, not you doing something wrong.",
        actions:["Track the pattern — it's the clinical picture, since no single blood test confirms perimenopause"],
        bookRef:'Ch 11 — What Perimenopause Is', productSlot:null, source:'book' },
      { id:'peri-sleep', severity:'actionable',
        headline:"Your sleep didn't break by accident",
        why:"Progesterone — the calming, sleep-supporting hormone — falls earlier and more steeply than estrogen. That 3 a.m. wake-up is one of the earliest signals, often years before periods change.",
        actions:["Protect the first half of the night, where deep sleep lives","Less alcohol in the evening; morning daylight to reset the rhythm"],
        bookRef:'Ch 11 / Ch 15', productSlot:'/recommends/magnesium', source:'book' },
      { id:'peri-fog', severity:'info',
        headline:"Brain fog is estrogen, and it lifts",
        why:"Fluctuating estrogen pulls support from the brain's cognitive networks — the lost words and missed names are real and measurable, not early dementia, and most women regain their baseline as hormones settle.",
        actions:["Track it so you can see it's cyclical, not constant"],
        bookRef:'Ch 11 — The Cognitive Layer', productSlot:null, source:'book' },
      { id:'peri-strength', severity:'actionable',
        headline:"This is the decade strength pays off most",
        why:"As estrogen withdraws, it stops protecting muscle and bone. Two to three resistance sessions a week become the single highest-return thing you can do for the next thirty years.",
        actions:["Lift heavy enough that the last two reps are genuinely hard","Protein around 1.2-1.6 g per kg of body weight"],
        bookRef:'Ch 14 — Why Strength Matters', productSlot:'/recommends/creatine', source:'book' },
      { id:'peri-options', severity:'info',
        headline:"You have more options than you may have been told",
        why:"If symptoms are heavy, modern hormone therapy is the most effective treatment for most healthy women within ten years of menopause — the fear left over from 2002 is not the current evidence.",
        actions:["The B5 Doctor's Questions card helps you have an informed conversation"],
        bookRef:'Ch 12 — Menopause & HRT · B5', productSlot:null, source:'book' }
    ],

    'postmenopause-renewer': [
      { id:'post-longgame', severity:'info',
        headline:"The symptoms ease — the long game begins",
        why:"After menopause the hot flushes usually settle, but low estrogen quietly reshapes bone, heart and brain risk. The good news: these are largely modifiable, and now is the highest-impact window.",
        actions:["Build one foundation at a time — start with strength and walking"],
        bookRef:'Ch 20 — The Long Game', productSlot:null, source:'book' },
      { id:'post-bone', severity:'actionable',
        headline:"Bone responds to load — nothing else does it",
        why:"Around menopause women can lose 10-20% of bone density. Resistance training is the only movement that meaningfully rebuilds it, with protein, calcium and vitamin D as the materials.",
        actions:["Strength train 2-3x a week, plus weight-bearing walking","Adequate protein and calcium daily"],
        bookRef:'Ch 20 — Bones · Ch 14', productSlot:'/recommends/vitamin-d3-k2', source:'book' },
      { id:'post-heart', severity:'info',
        headline:"The risk women underestimate most",
        why:"Heart disease, not cancer, is the leading cause of death in women — and the protection estrogen gave fades after menopause. Movement, a Mediterranean pattern and knowing your numbers move the needle.",
        actions:["Know your blood pressure, cholesterol and HbA1c","Daily walking plus strength training"],
        bookRef:'Ch 20 — The Heart', productSlot:null, source:'book' },
      { id:'post-vaginal', severity:'actionable',
        headline:"Dryness has a simple, underused fix",
        why:"Vaginal dryness and discomfort come from low local estrogen. Low-dose vaginal estrogen is safe for most women, barely absorbed into the body, and one of the most underprescribed treatments in women's medicine.",
        actions:["It's worth asking your clinician about specifically — separately from any other HRT"],
        bookRef:'Ch 12 — Vaginal Estrogen', productSlot:null, source:'book' }
    ]
  },

  /* =========================================================
     LAYER 2 — PER-LOG CONTEXTUAL CARDS
     Shown right after a daily log. A small reward every day —
     not gated behind 7/14/30. Keyed by symptom value, plus a
     few metric conditions (_lowSleep, _lowEnergy, _goodDay).
     3-5 variants each for rotation so it never feels repetitive.
     ========================================================= */
  perLog: {

    'sleep_issues': [
      { id:'log-sleep-1', severity:'actionable', headline:"Front-load your sleep tonight",
        why:"The deepest, most restorative sleep concentrates in the first half of the night — so going to bed 30 minutes earlier usually beats sleeping in. Your body fills the tank from the front.",
        actions:["Aim for a slightly earlier bedtime, not a later morning"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-sleep-2', severity:'actionable', headline:"Tired but wired?",
        why:"Even one short night raises cortisol and lowers next-day insulin sensitivity — that foggy, snacky, on-edge feeling. The fastest reset isn't more coffee, it's morning light.",
        actions:["10 minutes of daylight within an hour of waking"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-sleep-3', severity:'info', headline:"Continuity matters as much as hours",
        why:"\"Seven hours but broken\" performs far worse than seven continuous, because deep and REM sleep need uninterrupted cycles. Protecting against wake-ups can matter more than adding time.",
        actions:["Cool, dark room; no screens the last hour"], bookRef:'Ch 15', productSlot:'/recommends/magnesium', source:'book' },
      { id:'log-sleep-4', severity:'info', headline:"The most powerful lever is free",
        why:"Consistent bed and wake times — within about 30 minutes, seven days a week — does more for long-term sleep than almost any supplement or gadget.",
        actions:["Pick a wake time and hold it, even on weekends"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-sleep-5', severity:'info', headline:"If it's been weeks, there's a real fix",
        why:"For sleep that stays broken despite the basics, the first-line treatment isn't a stronger pill — it's CBT for insomnia (CBT-I), which outperforms medication long-term and is available digitally.",
        actions:["Look into a CBT-I programme if this has lasted weeks"], bookRef:'Ch 15', productSlot:null, source:'book' }
    ],

    'energy_crashes': [
      { id:'log-energy-1', severity:'actionable', headline:"Afternoon wall? Check the morning",
        why:"Caffeine on an empty stomach in place of breakfast spikes cortisol and blood sugar, setting up the afternoon crash hours later. What you do at 8 a.m. often decides 3 p.m.",
        actions:["Eat protein with breakfast before (or with) coffee"], bookRef:'Ch 13 / Ch 8', productSlot:null, source:'book' },
      { id:'log-energy-2', severity:'info', headline:"Energy follows your cycle",
        why:"A dip in the luteal phase or during your period is expected — progesterone and low hormones make you more inward. It's information, not a failing.",
        actions:["Note where you are in your cycle when energy drops"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-energy-3', severity:'actionable', headline:"Protein is the under-eaten fix",
        why:"Most women over 35 eat less protein than they need, and it's the raw material for the hormones and neurotransmitters that drive steady energy and mood.",
        actions:["Aim for 25-35 g protein per meal"], bookRef:'Ch 13 — Protein', productSlot:null, source:'book' },
      { id:'log-energy-4', severity:'info', headline:"Persistent fatigue can be iron or thyroid",
        why:"Fatigue that sleep doesn't fix is one of the most common signs of low iron (ferritin) or an under-active thyroid — both easily missed on a standard check, both very treatable.",
        actions:["If this keeps recurring, ask for ferritin + a full thyroid panel"], bookRef:'Ch 8 / Ch 19 · B4', productSlot:'/recommends/blood-test-uk', source:'book' },
      { id:'log-energy-5', severity:'info', headline:"Energy is built overnight, not bought in cups",
        why:"Caffeine borrows energy from later in the day; it doesn't create it. If afternoons crash, the levers are the night before and protein at breakfast, not a third coffee.",
        actions:["Anchor a consistent wake time","Protein with breakfast, not just caffeine"], bookRef:'Ch 15 / Ch 13', productSlot:null, source:'book' }
    ],

    'hot_flashes': [
      { id:'log-hot-1', severity:'info', headline:"This is thermostat turbulence",
        why:"Hot flushes come from swinging estrogen destabilising the brain's temperature control — not from anything you did. Up to 80% of midlife women get them, and they're a recognised medical symptom.",
        actions:["Note triggers: alcohol, caffeine and warm rooms often amplify them"], bookRef:'Ch 11', productSlot:null, source:'book' },
      { id:'log-hot-2', severity:'actionable', headline:"Two everyday triggers worth testing",
        why:"Alcohol and evening caffeine reliably worsen hot flushes and the night sweats that fragment sleep — cutting back is one of the few self-directed levers with a quick, noticeable payoff.",
        actions:["Try a few evenings without alcohol and see if nights ease"], bookRef:'Ch 11 / Ch 13', productSlot:null, source:'book' },
      { id:'log-hot-3', severity:'info', headline:"If they're disrupting life, there's effective help",
        why:"Hormone therapy is the most effective treatment for hot flushes and night sweats by a wide margin; non-hormonal options exist too. \"Wait it out\" is not the only option.",
        actions:["The B5 Doctor's Questions card helps you raise it well"], bookRef:'Ch 12 · B5', productSlot:null, source:'book' },
      { id:'log-hot-4', severity:'info', headline:"Phytoestrogens: small but real",
        why:"Soy isoflavones and other phytoestrogens have modest evidence for hot flushes — real but smaller than HRT, and varying between women. A reasonable, low-risk addition, not a cure.",
        actions:["Worth a try if you're avoiding hormones; keep expectations modest"], bookRef:'Ch 17 — Menopause Support', productSlot:null, source:'book' },
      { id:'log-hot-5', severity:'actionable', headline:"Cool the room before bed, not just yourself",
        why:"Night sweats fragment sleep most when the bedroom is warm. A cooler room (around 17-19C) and breathable layers reduce how often a flush actually wakes you.",
        actions:["Keep the bedroom cool and dark","Layers you can shed without waking fully"], bookRef:'Ch 15 / Ch 11', productSlot:null, source:'book' }
    ],

    'mood_swings': [
      { id:'log-mood-1', severity:'info', headline:"Mood tracks the cycle for a reason",
        why:"Estrogen and progesterone act directly on serotonin, dopamine and the calming GABA system — so the same life can feel manageable one week and unbearable the next, with no change in circumstances.",
        actions:["Note your cycle day when mood drops — the pattern is the insight"], bookRef:'Ch 7', productSlot:null, source:'book' },
      { id:'log-mood-2', severity:'actionable', headline:"Steady blood sugar steadies mood",
        why:"Blood-sugar swings amplify irritability and low mood, especially in the luteal phase. Protein and fibre at each meal flatten the spikes that make the dips sharper.",
        actions:["Protein + fibre before carbs; don't skip meals"], bookRef:'Ch 13 / Ch 7', productSlot:null, source:'book' },
      { id:'log-mood-3', severity:'info', headline:"The last 3 days aren't the time for big talks",
        why:"In the final days before a period the nervous system is genuinely more reactive. Knowing this lets you postpone hard conversations rather than trust a distorted read of them.",
        actions:["Where you can, push confrontations past day 1 of your period"], bookRef:'Ch 2 — Luteal Phase', productSlot:null, source:'book' },
      { id:'log-mood-4', severity:'info', headline:"Constant low mood points elsewhere",
        why:"Mood that swings with your cycle is hormonal weather. Mood that's flat most days, regardless of cycle, more often points to low iron, thyroid, or something worth a proper conversation.",
        actions:["If it's constant rather than cyclical, ask about ferritin and thyroid"], bookRef:'Ch 8 / Ch 7', productSlot:null, source:'book' },
      { id:'log-mood-5', severity:'actionable', headline:"Morning light steadies the day's mood",
        why:"Early daylight sets the serotonin-melatonin rhythm that underpins both mood and sleep. Ten minutes outside in the morning is one of the most underrated, free mood tools.",
        actions:["10 minutes of morning daylight, ideally before screens"], bookRef:'Ch 15 / Ch 16', productSlot:null, source:'book' }
    ],

    'anxiety': [
      { id:'log-anx-1', severity:'actionable', headline:"The fastest off-switch is the exhale",
        why:"A long exhale directly engages the vagus nerve and lowers heart rate within seconds — which is why breathing out for twice as long as you breathe in calms anxiety faster than trying to think your way calm.",
        actions:["Breathe in for 4, out for 8, for two minutes"], bookRef:'Ch 16 — The Vagus Nerve', productSlot:null, source:'book' },
      { id:'log-anx-2', severity:'info', headline:"New anxiety can be hormonal",
        why:"Falling progesterone (luteal phase, perimenopause) removes a calming brain signal — so first-time or worsening anxiety in your late 30s/40s often has a hormonal driver, not a personal failing.",
        actions:["Note whether it clusters at a point in your cycle"], bookRef:'Ch 7 / Ch 11', productSlot:null, source:'book' },
      { id:'log-anx-3', severity:'info', headline:"Frequency beats duration",
        why:"Two minutes of slow breathing twice a day changes your baseline more than a single long session. The nervous system learns calm through small, repeated signals that it's safe to come down.",
        actions:["A 30-second cold splash on the face also resets fast"], bookRef:'Ch 16', productSlot:null, source:'book' },
      { id:'log-anx-4', severity:'info', headline:"A single adaptogen, properly dosed",
        why:"Most \"stress support\" blends contain too little of too many things. If you try one, ashwagandha at a studied dose has reasonable evidence for anxiety — a single ingredient, not a blend.",
        actions:["One ingredient at the studied dose beats a proprietary blend"], bookRef:'Ch 17', productSlot:'/recommends/ashwagandha', source:'book' },
      { id:'log-anx-5', severity:'info', headline:"Caffeine can masquerade as anxiety",
        why:"Caffeine raises heart rate and cortisol; for sensitive people that physical buzz reads as anxiety, especially premenstrually when tolerance drops. The feeling can be chemical, not circumstantial.",
        actions:["Try caffeine earlier and lighter for a week and notice the difference"], bookRef:'Ch 13 / Ch 16', productSlot:null, source:'book' }
    ],

    'cravings': [
      { id:'log-crav-1', severity:'info', headline:"Cravings can come from last night's sleep",
        why:"Short sleep raises ghrelin (hunger) and lowers leptin (fullness), driving next-day sugar cravings and overeating. The craving may be a sleep signal wearing a snack costume.",
        actions:["Protect tonight's sleep to ease tomorrow's cravings"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-crav-2', severity:'info', headline:"Luteal cravings are partly real biology",
        why:"In the week before your period the body's energy needs rise slightly and serotonin dips, nudging you toward carbs. It's not a willpower failure — it's expected, and it passes.",
        actions:["Add protein and complex carbs rather than fighting it"], bookRef:'Ch 2 — Luteal', productSlot:null, source:'book' },
      { id:'log-crav-3', severity:'actionable', headline:"The order of your plate matters",
        why:"Eating protein and vegetables before carbohydrates blunts the blood-sugar spike-and-crash that drives the next craving. Same food, different order, fewer cravings.",
        actions:["Protein + veg first, starch last","A short walk after eating"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-crav-4', severity:'info', headline:"Thirst and low protein both fake hunger",
        why:"Mild dehydration and a low-protein breakfast both register as cravings hours later. Often the 'sugar craving' is really an unmet water or protein need wearing a disguise.",
        actions:["Water plus protein first, then revisit the craving in 20 minutes"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-crav-5', severity:'info', headline:"Restriction today is cravings tonight",
        why:"Under-eating earlier in the day reliably drives evening cravings; the body collects the deficit after dark. Eating enough at meals is the quiet fix most diets skip.",
        actions:["Eat enough at meals so the evening isn't making up a shortfall"], bookRef:'Ch 13', productSlot:null, source:'book' }
    ],

    'brain_fog': [
      { id:'log-fog-1', severity:'info', headline:"Fog is real, measurable, and usually temporary",
        why:"In perimenopause, fluctuating estrogen disrupts the brain's cognitive networks — losing words and walking into rooms is estrogen withdrawal, not early decline, and it typically lifts as hormones settle.",
        actions:["Track it so you can see it comes and goes"], bookRef:'Ch 11', productSlot:null, source:'book' },
      { id:'log-fog-2', severity:'actionable', headline:"Fog often rides in on poor sleep",
        why:"Overnight, the brain's glymphatic system clears the day's metabolic waste — and that clearance depends on deep sleep. Broken nights leave the fog thicker the next day.",
        actions:["Prioritise continuous sleep tonight"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-fog-3', severity:'info', headline:"If fog comes with cold and fatigue, check thyroid",
        why:"Brain fog clustered with fatigue, feeling cold, dry skin and weight changes can point to an under-active thyroid — easily missed when only TSH is tested.",
        actions:["Ask for Free T3, Free T4 and antibodies, not just TSH"], bookRef:'Ch 8 / Ch 19', productSlot:'/recommends/blood-test-uk', source:'book' },
      { id:'log-fog-4', severity:'info', headline:"Fog often rides on the luteal dip",
        why:"In the days before a period, falling estrogen and progesterone can blunt focus and word recall. If fog tracks your cycle, it's hormonal weather passing through, not decline.",
        actions:["Note your cycle day when fog hits to see the pattern"], bookRef:'Ch 2 / Ch 11', productSlot:null, source:'book' },
      { id:'log-fog-5', severity:'actionable', headline:"Blood sugar swings cloud thinking",
        why:"Sharp glucose spikes and the crash that follows impair concentration directly. Eating protein and fibre before carbs flattens the curve that fogs the afternoon.",
        actions:["Protein and fibre first","Skip sugary drinks on an empty stomach"], bookRef:'Ch 13', productSlot:null, source:'book' }
    ],

    'breast_tenderness': [
      { id:'log-breast-1', severity:'info', headline:"Usually the luteal phase talking",
        why:"Breast tenderness in the days before a period is a normal hormonal shift. When it's persistent or one-sided with a new lump, that's different — see the safety note rather than tracking it.",
        actions:["Note if it's cyclical (eases when your period starts)"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-breast-2', severity:'info', headline:"Caffeine and alcohol can amplify it",
        why:"Both can worsen premenstrual breast tenderness for some women, partly via estrogen load. Easy to test by easing off in the luteal week and noticing the difference.",
        actions:["Try less caffeine/alcohol in the week before your period"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-breast-3', severity:'info', headline:"Usually water and estrogen, not a problem",
        why:"Cyclical breast fullness comes from estrogen and fluid shifts before a period and eases once bleeding starts. Persistent, one-sided, or a new lump is the different story worth checking.",
        actions:["Track whether it eases when your period begins"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-breast-4', severity:'actionable', headline:"Two levers that ease the ache",
        why:"Premenstrual breast tenderness responds for some women to magnesium and to easing very salty foods in the luteal week, both of which calm the fluid retention behind it.",
        actions:["Magnesium in the evening","Go easy on salt in the week before your period"], bookRef:'Ch 17', productSlot:'/recommends/magnesium', source:'book' }
    ],

    'bloating': [
      { id:'log-bloat-1', severity:'info', headline:"Luteal bloating is water and slowed digestion",
        why:"Progesterone slows the gut and shifts fluid balance before a period — so bloating that arrives on schedule is expected hormonal physiology, not something you ate wrong.",
        actions:["Note if it tracks your cycle"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-bloat-2', severity:'actionable', headline:"Fibre and fluid, not less food",
        why:"Constipation directly recirculates estrogen and worsens bloating. Daily, easy bowel movements — driven by fibre and water — are part of how the body clears hormones.",
        actions:["Build toward 30 g fibre and 1.5-2 L water a day"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-bloat-3', severity:'info', headline:"Bloating can be the gut, not the hormones",
        why:"If bloating doesn't track your cycle, the usual drivers are eating fast, fizzy drinks, or specific trigger foods. Cycle-linked bloating is hormonal; constant bloating earns a closer look.",
        actions:["Notice whether it's cyclical or near-constant"], bookRef:'Ch 2 / Ch 13', productSlot:null, source:'book' },
      { id:'log-bloat-4', severity:'actionable', headline:"Walking moves more than your legs",
        why:"A short walk after eating speeds digestion and clears the gas and fullness that drive bloating, more reliably than any 'debloat' tea or supplement.",
        actions:["A 10-minute walk after your biggest meal"], bookRef:'Ch 14 / Ch 13', productSlot:null, source:'book' }
    ],

    'headaches': [
      { id:'log-head-1', severity:'info', headline:"Hormonal headaches track estrogen drops",
        why:"Migraines and headaches that cluster around your period are linked to the pre-period fall in estrogen. Spotting the timing is the first step to managing them.",
        actions:["Log headache days against your cycle day"], bookRef:'Ch 4 / Ch 2', productSlot:null, source:'book' },
      { id:'log-head-2', severity:'actionable', headline:"The boring triggers are usually the real ones",
        why:"Dehydration, skipped meals, poor sleep and alcohol drive far more headaches than most women realise — cheaper to fix than to medicate.",
        actions:["Water, regular meals, steady sleep before reaching for pills"], bookRef:'Ch 13 / Ch 15', productSlot:null, source:'book' },
      { id:'log-head-3', severity:'info', headline:"Estrogen-drop migraines have a window",
        why:"Migraine that lands just before your period is tied to the sharp fall in estrogen. Knowing that window lets you pre-empt with hydration, magnesium and steady meals.",
        actions:["Track headache days against cycle day to find your window"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-head-4', severity:'actionable', headline:"Magnesium has real migraine evidence",
        why:"Taken regularly, magnesium reduces migraine frequency for many people and is low-risk, one of the few supplements with decent evidence behind it for headaches.",
        actions:["A consistent evening magnesium is worth a fair trial"], bookRef:'Ch 17', productSlot:'/recommends/magnesium', source:'book' }
    ],

    'joint_pain': [
      { id:'log-joint-1', severity:'info', headline:"Estrogen quietly protected your joints",
        why:"New aches in the small joints of hands and feet, without injury, are a common and under-recognised perimenopausal symptom — estrogen has anti-inflammatory effects, and its withdrawal can show up here.",
        actions:["Note if it appeared alongside other midlife changes"], bookRef:'Ch 11 — The Body Layer', productSlot:null, source:'book' },
      { id:'log-joint-2', severity:'actionable', headline:"Movement and omega-3 both help",
        why:"Gentle, regular movement keeps joints mobile, and omega-3s are genuinely anti-inflammatory — a combination with real evidence behind it for midlife joint comfort.",
        actions:["Daily walking + mobility work","Oily fish 2-3x a week, or a tested fish oil"], bookRef:'Ch 14 / Ch 13', productSlot:'/recommends/omega-3', source:'book' },
      { id:'log-joint-3', severity:'info', headline:"Stiffness that eases with movement is typical",
        why:"Estrogen helps regulate inflammation; as it withdraws, joints can feel stiff first thing and loosen as you move. Stiffness that improves with movement is the common, reassuring pattern.",
        actions:["Gentle movement first thing rather than waiting it out"], bookRef:'Ch 11 / Ch 14', productSlot:null, source:'book' },
      { id:'log-joint-4', severity:'info', headline:"Strength protects the joints it loads",
        why:"Counterintuitively, loading joints through resistance training strengthens the muscle and tissue around them, easing midlife aches rather than worsening them when built gradually.",
        actions:["Add two light strength sessions a week, building slowly"], bookRef:'Ch 14', productSlot:null, source:'book' }
    ],

    'dryness': [
      { id:'log-dry-1', severity:'actionable', headline:"A simple, underused fix",
        why:"Vaginal dryness comes from low local estrogen. Low-dose vaginal estrogen is barely absorbed into the body, safe for most women, and one of the most underprescribed treatments in women's medicine.",
        actions:["Worth asking your clinician about specifically"], bookRef:'Ch 12', productSlot:null, source:'book' },
      { id:'log-dry-2', severity:'info', headline:"It can also be breastfeeding or the pill",
        why:"Low estrogen from breastfeeding or some contraception causes the same dryness — it's hormonal, not a sign anything is wrong with you, and it's treatable.",
        actions:["Note what else changed around when it started"], bookRef:'Ch 9 / Ch 18', productSlot:null, source:'book' },
      { id:'log-dry-3', severity:'info', headline:"It tends to progress without local estrogen",
        why:"Unlike hot flushes, vaginal dryness usually doesn't resolve on its own after menopause and slowly progresses. That's why low-dose vaginal estrogen is worth raising early rather than enduring.",
        actions:["Raise it with your clinician sooner rather than later"], bookRef:'Ch 12 / Ch 20', productSlot:null, source:'book' },
      { id:'log-dry-4', severity:'info', headline:"Lubricant eases symptoms; estrogen fixes tissue",
        why:"Moisturisers and lubricants ease discomfort in the moment; vaginal estrogen actually restores the tissue itself. Many women use both, for different jobs.",
        actions:["A moisturiser for comfort now; ask about vaginal estrogen for the cause"], bookRef:'Ch 12', productSlot:null, source:'book' }
    ],

    'low_libido': [
      { id:'log-lib-1', severity:'info', headline:"Libido has several hormonal inputs",
        why:"Testosterone — which women make too — fuels libido and declines through midlife, often unmentioned in standard appointments. Low desire isn't only psychological.",
        actions:["If it's a real concern, testosterone is a valid thing to ask about"], bookRef:'Ch 1 / Ch 12', productSlot:null, source:'book' },
      { id:'log-lib-2', severity:'info', headline:"Sleep and stress sit underneath desire",
        why:"Chronic stress and poor sleep suppress libido directly — the body deprioritises sex when it doesn't feel rested or safe. Sometimes the fix is upstream of the bedroom.",
        actions:["Protecting sleep and stress often does more than you'd expect"], bookRef:'Ch 16 / Ch 15', productSlot:null, source:'book' },
      { id:'log-lib-3', severity:'info', headline:"For many women, desire follows, it doesn't lead",
        why:"Arousal often builds after engagement begins rather than appearing first. Waiting to 'feel like it' can be the wrong model; context and feeling safe matter more than a spontaneous urge.",
        actions:["Lower the bar for starting; desire can warm up afterwards"], bookRef:'Ch 12', productSlot:null, source:'book' },
      { id:'log-lib-4', severity:'info', headline:"Some medications quietly dampen libido",
        why:"SSRIs, certain contraceptives and a few other medications can lower desire. If the timing lines up with starting one, it's a fair thing to raise; alternatives often exist.",
        actions:["If it changed with a new medication, mention it to your prescriber"], bookRef:'Ch 18 / Ch 12', productSlot:null, source:'book' }
    ],

    'weight_gain': [
      { id:'log-weight-1', severity:'info', headline:"Midsection change is often insulin, not calories",
        why:"As estrogen falls and insulin sensitivity drops, fat tends to settle centrally even when eating hasn't changed. It's a hormonal shift to work with, not a discipline failure.",
        actions:["Focus on protein, fibre and strength training over restriction"], bookRef:'Ch 11 / Ch 13', productSlot:null, source:'book' },
      { id:'log-weight-2', severity:'info', headline:"Muscle is your metabolic ally",
        why:"Muscle is the body's largest store for blood sugar, so building it improves insulin sensitivity — which is why strength training reshapes midlife metabolism more than cardio does.",
        actions:["Two strength sessions a week, enough protein to use them"], bookRef:'Ch 14', productSlot:null, source:'book' },
      { id:'log-weight-3', severity:'info', headline:"Sleep loss tilts the scales",
        why:"Short sleep raises hunger hormones and worsens insulin resistance, nudging weight up independent of willpower. Sometimes the most effective diet change is simply an earlier bedtime.",
        actions:["Treat sleep as a metabolic lever, not just rest"], bookRef:'Ch 15 / Ch 13', productSlot:null, source:'book' },
      { id:'log-weight-4', severity:'info', headline:"Muscle is the metabolism you can build",
        why:"Cardio burns calories now; muscle raises what you burn at rest and soaks up blood sugar. Strength training reshapes midlife metabolism more durably than cutting more food.",
        actions:["Two strength sessions plus enough protein beats deeper restriction"], bookRef:'Ch 14', productSlot:null, source:'book' }
    ],

    'acne': [
      { id:'log-acne-1', severity:'info', headline:"Jawline acne has a hormonal signature",
        why:"Breakouts along the jaw and chin, especially with irregular cycles or unwanted hair, can point to higher androgens — a pattern worth recognising rather than only treating the skin.",
        actions:["Note if it clusters with cycle changes or other symptoms"], bookRef:'Ch 6 — PCOS', productSlot:'/recommends/zinc', source:'book' },
      { id:'log-acne-2', severity:'info', headline:"Blood sugar feeds skin inflammation",
        why:"High insulin nudges the ovaries toward more testosterone, which drives breakouts — so steadying blood sugar can quietly improve skin alongside everything else.",
        actions:["Protein + fibre first; fewer sugary drinks"], bookRef:'Ch 13 / Ch 6', productSlot:null, source:'book' },
      { id:'log-acne-3', severity:'info', headline:"Stress feeds the skin too",
        why:"Cortisol raises oil production and inflammation, which is why breakouts often cluster in stressful stretches. Calming the nervous system is a real, if slower, skin lever.",
        actions:["Note whether breakouts track your most stressful weeks"], bookRef:'Ch 16 / Ch 6', productSlot:null, source:'book' },
      { id:'log-acne-4', severity:'info', headline:"Coming off the pill can flare skin briefly",
        why:"Stopping hormonal contraception can unmask androgen-driven breakouts for several months before settling. Knowing the timeline prevents panic and over-treating.",
        actions:["If it followed stopping the pill, give it months and support skin gently"], bookRef:'Ch 18 / Ch 6', productSlot:null, source:'book' }
    ],

    'hair_thinning': [
      { id:'log-hair-1', severity:'info', headline:"Hair often points to iron or thyroid",
        why:"Thinning at the temples or part, or more hair in the shower, is commonly tied to low ferritin or thyroid issues — both routinely missed, both treatable once found.",
        actions:["Ask for ferritin (aim above ~70 for hair) and a thyroid panel"], bookRef:'Ch 8 / Ch 19', productSlot:'/recommends/blood-test-uk', source:'book' },
      { id:'log-hair-2', severity:'info', headline:"Postpartum shedding has its own clock",
        why:"Hair shedding that peaks around 3-4 months after birth is a recognised hormonal event and usually recovers — knowing the timeline saves a lot of worry.",
        actions:["If it persists past a year or comes with fatigue, check thyroid"], bookRef:'Ch 9', productSlot:null, source:'book' },
      { id:'log-hair-3', severity:'info', headline:"Crash diets show up in the hairbrush",
        why:"Sudden calorie or protein restriction can trigger shedding a few months later, the hair's delayed reaction to a stressed system. The fix is eating enough, especially protein, consistently.",
        actions:["Enough protein and calories; diet-driven shedding usually recovers"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-hair-4', severity:'info', headline:"Midlife thinning has a pattern",
        why:"Falling estrogen and relatively higher androgens can thin hair at the crown and part-line in midlife. It's common, and there are options worth discussing rather than just enduring.",
        actions:["If it's the crown or part-line in midlife, it's worth a clinician chat"], bookRef:'Ch 11 / Ch 12', productSlot:null, source:'book' }
    ],

    'irregular_cycles': [
      { id:'log-irreg-1', severity:'info', headline:"An irregular cycle is information",
        why:"Cycle length shifting by more than a week, or long gaps, is your body signalling something — often perimenopause, thyroid, or PCOS. Not a moral failing, and not something to just \"relax\" away.",
        actions:["Track length and gaps — it's the data a doctor needs"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-irreg-2', severity:'info', headline:"PCOS often hides behind irregular cycles",
        why:"Irregular cycles with jawline acne, central weight or unwanted hair is a classic PCOS pattern — driven by insulin and androgens, and very responsive to the right support.",
        actions:["If this cluster fits, inositol has good evidence for PCOS"], bookRef:'Ch 6', productSlot:'/recommends/inositol', source:'book' },
      { id:'log-irreg-3', severity:'info', headline:"Stress and under-fuelling can pause cycles",
        why:"High stress, heavy training, or eating too little can suppress ovulation and lengthen or skip cycles. More rest and more food often bring them back; the body pauses what it can't afford.",
        actions:["If training is hard and food is low, add fuel and recovery first"], bookRef:'Ch 16 / Ch 4', productSlot:null, source:'book' },
      { id:'log-irreg-4', severity:'info', headline:"Lengthening cycles can be an early peri signal",
        why:"In the late thirties and forties, cycles that shift, often shorter then longer and skipped, frequently mark the start of perimenopause. The trend over months is the real signal.",
        actions:["Track cycle length over several months to see the direction"], bookRef:'Ch 11 / Ch 2', productSlot:null, source:'book' }
    ],

    'ovulation_cramps': [
      { id:'log-ovul-1', severity:'info', headline:"That mid-cycle twinge has a name",
        why:"A brief one-sided ache around mid-cycle is mittelschmerz — ovulation. Far from a problem, it's a sign your cycle is doing its central job, and a useful marker of your fertile window.",
        actions:["Note it: it helps you map your own cycle"], bookRef:'Ch 2 — Ovulatory', productSlot:null, source:'book' },
      { id:'log-ovul-2', severity:'info', headline:"It marks your fertile window",
        why:"That mid-cycle twinge lands around ovulation, the few days when conception is possible. Whether you're avoiding or trying, it's a useful natural signal to recognise.",
        actions:["Note it alongside cycle day to map your own window"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-ovul-3', severity:'info', headline:"A little mid-cycle spotting can be normal",
        why:"Light spotting around ovulation, alongside the twinge, reflects the estrogen shift and is usually harmless. Heavy or frequent bleeding between periods is a different thing worth checking.",
        actions:["Light mid-cycle spotting is usually fine; heavy bleeding is not"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-ovul-4', severity:'info', headline:"One-sided and brief is expected; severe is not",
        why:"The ache typically alternates sides month to month and is mild and short-lived. Severe or lasting one-sided pain deserves a check rather than just tracking.",
        actions:["Brief and mild is normal; severe or persistent, see a doctor"], bookRef:'Ch 4', productSlot:null, source:'book' }
    ],

    'heart_palpitations': [
      { id:'log-palp-1', severity:'info', headline:"Common in perimenopause — and worth a mention",
        why:"Palpitations that feel alarming usually check out as normal in midlife, linked to estrogen shifts. Common doesn't mean ignore: it's reasonable to have them looked at once for peace of mind.",
        actions:["Mention them at your next appointment so they're on record"], bookRef:'Ch 11', productSlot:null, source:'book' },
      { id:'log-palp-2', severity:'info', headline:"Caffeine, alcohol and low sleep amplify them",
        why:"Palpitations in midlife are often nudged by stimulants, alcohol and short nights on top of estrogen shifts. Trimming those is a low-risk first experiment before worrying.",
        actions:["Notice whether they follow coffee, wine or poor sleep"], bookRef:'Ch 11 / Ch 13', productSlot:null, source:'book' },
      { id:'log-palp-3', severity:'info', headline:"The breath can settle a racing heart",
        why:"A slow, long exhale activates the vagus nerve and can ease benign palpitations in the moment, and it quietly tells you whether anxiety is part of the picture.",
        actions:["Try a long exhale (in for 4, out for 8) when they start"], bookRef:'Ch 16', productSlot:null, source:'book' },
      { id:'log-palp-4', severity:'info', headline:"An overactive thyroid can speed the heart",
        why:"Palpitations with heat intolerance, weight loss or feeling wired can point to an overactive thyroid. If that cluster fits, it's worth a thyroid check rather than tracking alone.",
        actions:["If they come with heat intolerance or weight loss, ask for a thyroid panel"], bookRef:'Ch 8', productSlot:null, source:'book' }
    ],

    /* metric-condition cards (not symptom-keyed) */
    '_lowSleep': [
      { id:'log-lowsleep-1', severity:'actionable', headline:"One short night, one clear move",
        why:"A single night under ~6 hours measurably raises cortisol and dulls focus the next day. You can't undo it, but morning daylight resets the clock faster than caffeine.",
        actions:["10 minutes of daylight within an hour of waking","Protect tonight rather than chasing a lie-in"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-lowsleep-2', severity:'info', headline:"One bad night isn't the trend",
        why:"A single short night raises next-day cravings and cortisol, but it doesn't define your week. The trap is chasing it with a chaotic catch-up that wrecks tonight too.",
        actions:["Keep today normal; protect tonight's usual bedtime"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-lowsleep-3', severity:'actionable', headline:"Caffeine after a bad night backfires",
        why:"Leaning on caffeine to power through short sleep usually pushes tonight later, building the cycle. Light caffeine before noon protects the recovery night that actually fixes it.",
        actions:["Caffeine early and light today; no late-afternoon cups"], bookRef:'Ch 15 / Ch 13', productSlot:null, source:'book' },
      { id:'log-lowsleep-4', severity:'info', headline:"Naps have rules",
        why:"A short early-afternoon nap (under about 30 minutes) can restore alertness without stealing tonight's sleep. Long or late naps do the opposite and deepen the problem.",
        actions:["If you nap, keep it short and before mid-afternoon"], bookRef:'Ch 15', productSlot:null, source:'book' }
    ],
    '_lowEnergy': [
      { id:'log-lowen-1', severity:'info', headline:"Low days are data, not failure",
        why:"Energy naturally dips with your cycle, poor sleep, or a stressful stretch. One low reading isn't a verdict — it's a dot. The pattern across days is what actually tells you something.",
        actions:["Keep logging; the trend matters more than today"], bookRef:'Ch 21', productSlot:null, source:'book' },
      { id:'log-lowen-2', severity:'actionable', headline:"On a flat day, move gently, don't grind",
        why:"When energy is low, a short walk in daylight restores more than a punishing workout, which can deepen the dip. Matching effort to the tank is the skill, not pushing through.",
        actions:["Choose a 10-20 minute walk over a hard session today"], bookRef:'Ch 14', productSlot:null, source:'book' },
      { id:'log-lowen-3', severity:'info', headline:"Flat energy can track the luteal phase",
        why:"A dip in the week before your period is expected as progesterone falls. Planning lighter days for that stretch works far better than forcing through and feeling like you failed.",
        actions:["Check your cycle day before judging the day"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-lowen-4', severity:'info', headline:"Under-eating reads as fatigue",
        why:"Skipping meals or simply eating too little leaves energy flat by afternoon. Sometimes the fix isn't rest or caffeine, it's more food, especially protein, earlier in the day.",
        actions:["Check you've actually eaten enough, particularly protein"], bookRef:'Ch 13', productSlot:null, source:'book' }
    ],
    '_goodDay': [
      { id:'log-good-1', severity:'positive', headline:"A good day isn't random",
        why:"Steady energy and clear mood usually mean your sleep, food, movement and cycle phase lined up. Noticing what preceded a good day is how you learn to make more of them.",
        actions:["Glance back at last night's sleep and where you are in your cycle"], bookRef:'Ch 21', productSlot:null, source:'book' },
      { id:'log-good-2', severity:'positive', headline:"Riding the follicular wave",
        why:"If energy and focus feel high, rising estrogen in the follicular phase may be with you. This is the week to take on the hard, ambitious things while the tide helps.",
        actions:["Front-load demanding work and harder workouts this week"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-good-3', severity:'positive', headline:"Worth banking what worked",
        why:"Good days usually follow a good night, enough food, and the right cycle phase lining up. Noting the combination turns a lucky day into a recipe you can repeat.",
        actions:["Jot what preceded today: sleep, food, movement, cycle day"], bookRef:'Ch 21', productSlot:null, source:'book' },
      { id:'log-good-4', severity:'positive', headline:"This is the day to build a habit",
        why:"Motivation rides higher on good days. Use the lift to do the thing your future self will thank you for, a workout, a meal prepped, a walk already booked in.",
        actions:["Spend today's energy on one habit you want to keep"], bookRef:'Ch 21 / Ch 14', productSlot:null, source:'book' }
    ]
  },

  /* =========================================================
     LAYER 3 — PATTERN ENRICHMENT
     Attached to insights.js engine output, keyed by insight.id.
     The engine supplies the stats ("logged X on N of M days");
     this supplies the "why + what to do + where to read more".
     ========================================================= */
  patternAdvice: {
    'day_of_week': [
      { why:"A weekly energy dip usually tracks routine, not hormones, a heavier workday, a standing late night, weekend recovery, or a regular evening drink.",
        action:"Look at what's fixed on that day, sleep, alcohol, workload, and adjust one thing.", bookRef:'Ch 16 / Ch 15', productSlot:null, source:'book' },
      { why:"Weekly dips are usually behavioural, not hormonal, Sunday-night dread, a hard gym day, or Friday drinks echoing into Saturday.",
        action:"Pick the one fixed thing on that day and tweak it before assuming it's your body.", bookRef:'Ch 16', productSlot:null, source:'book' },
      { why:"Your body keeps the score of your week. A recurring low day often points to a recurring habit, late nights, skipped meals, or a draining commitment.",
        action:"Protect sleep and meals specifically around that day.", bookRef:'Ch 16 / Ch 15', productSlot:null, source:'book' }
    ],
    'cycle_phase': [
      { why:"A symptom clustering in one phase is your hormones running on schedule. In the luteal phase especially, progesterone's fall predicts mood, sleep and craving shifts in the final days.",
        action:"Plan for it: protect sleep, ease caffeine and alcohol, and lower workout intensity in that phase.", bookRef:'Ch 2 - The Four Phases', productSlot:'/recommends/magnesium', source:'book' },
      { why:"Symptoms that cluster in one phase turn a 'bad week' into a predictable, plannable one. Naming the phase is half the relief.",
        action:"Pre-empt it: lighter plans, better sleep, less alcohol in that phase.", bookRef:'Ch 2', productSlot:null, source:'book' },
      { why:"Most cyclical symptoms peak in the luteal phase as progesterone falls. The same support, sleep, magnesium, steady blood sugar, helps across the board.",
        action:"Build a simple luteal-week routine you repeat each cycle.", bookRef:'Ch 2 / Ch 17', productSlot:'/recommends/magnesium', source:'book' }
    ],
    'sleep_energy': [
      { why:"Short sleep raises cortisol and lowers next-day insulin sensitivity, and in women this shows up fast. Sleep is the lever that decides whether the others work.",
        action:"Consistent bed and wake times plus morning daylight are the highest-evidence levers; magnesium glycinate in the evening helps some.", bookRef:'Ch 15', productSlot:'/recommends/magnesium', source:'book' },
      { why:"Sleep sits upstream of almost everything, mood, cravings, focus and energy all run downstream of last night. It's the highest-leverage place to start.",
        action:"Fix the bedtime before adding anything else.", bookRef:'Ch 15', productSlot:null, source:'book' },
      { why:"Broken sleep blunts next-day energy more than short-but-solid sleep. Continuity is the lever, not just hours in bed.",
        action:"Cool, dark room and a screen-free last hour to protect continuity.", bookRef:'Ch 15', productSlot:'/recommends/magnesium', source:'book' }
    ],
    'trend_improving': [
      { why:"A rising trend means something you changed is working, and the body rewards consistency, not intensity. Naming what changed makes it repeatable.",
        action:"Note what shifted recently in sleep, food or movement, and keep it going.", bookRef:'Ch 21', productSlot:null, source:'book' },
      { why:"Improvement compounds quietly. The temptation now is to add five new things; the smarter move is to keep doing the one that's working.",
        action:"Resist piling on, protect the current routine.", bookRef:'Ch 21', productSlot:null, source:'book' },
      { why:"An upward trend is proof your inputs are working. The body responds over weeks, not in dramatic single days.",
        action:"Identify the one change that mattered most and guard it.", bookRef:'Ch 21', productSlot:null, source:'book' }
    ],
    'trend_declining': [
      { why:"A dip across a week usually traces to something upstream, sleep slipping, stress climbing, or a routine change, rather than anything random.",
        action:"Check the basics first: sleep continuity, evening alcohol, and stress load over the last week.", bookRef:'Ch 21 / Ch 16', productSlot:null, source:'book' },
      { why:"A downtrend is information, not failure. It usually follows a busy or disrupted stretch, with the body asking for the basics back.",
        action:"Return to foundations: sleep, a meal rhythm, and a daily walk.", bookRef:'Ch 21', productSlot:null, source:'book' },
      { why:"Dips rarely come from nowhere. Look one step upstream, at what changed in the days before the slide.",
        action:"Audit last week's sleep and stress before changing anything big.", bookRef:'Ch 16', productSlot:null, source:'book' }
    ],
    'symptom_frequency': [
      { why:"A symptom on most days is worth understanding rather than just enduring, it usually maps to one of the hormonal patterns your type is prone to.",
        action:"Your hormone-type chapter in The Hormone Blueprint covers this directly; if it persists, it's worth a doctor's conversation.", bookRef:'Ch 4', productSlot:null, source:'book' },
      { why:"A symptom that shows up most days has crossed from noise into signal. It's worth finding the driver rather than absorbing it indefinitely.",
        action:"Track when it's worst, that timing is what a doctor can actually use.", bookRef:'Ch 4 / Ch 5', productSlot:null, source:'book' },
      { why:"Frequent symptoms are the body repeating itself until you listen. Most map to a known hormonal pattern with real, specific levers.",
        action:"Read your hormone-type chapter for the likely driver and the next step.", bookRef:'Ch 4', productSlot:null, source:'book' }
    ]
  },


  /* =========================================================
     LAYER 4 — SAFETY CARDS
     Surfaced by conditions (not single logs). Supportive,
     non-alarmist, never carry a product. These guide toward
     care without frightening. Red-flag list from Ch 4 / Ch 6.
     ========================================================= */
  safety: {
    'irregular_cycles_persistent': {
      id:'safe-cycle', severity:'caution',
      headline:"Worth a calm conversation with your GP",
      why:"Cycles that stay irregular for three months or more can have a treatable cause — thyroid, PCOS, or perimenopause. This is information to act on, not a reason to worry.",
      actions:["Ask for a thyroid panel and ferritin","The B5 Doctor's Questions card lists exactly what to request"],
      bookRef:'Ch 19 · B4 · B5', productSlot:null, source:'book' },
    'heart_palpitations_persistent': {
      id:'safe-palp', severity:'caution',
      headline:"Have these checked once, for peace of mind",
      why:"Palpitations are often benign in midlife, but anything new and persistent deserves a single proper look — so you know what you're dealing with rather than wondering.",
      actions:["Mention frequency and timing to your doctor","Seek urgent care if they come with chest pain, breathlessness or fainting"],
      bookRef:'Ch 4', productSlot:null, source:'book' },
    'low_energy_persistent': {
      id:'safe-fatigue', severity:'caution',
      headline:"Fatigue that won't lift deserves a workup",
      why:"Energy that stays low for weeks despite decent sleep is one of the most common signs of low iron or thyroid issues — both missed on a standard check, both very treatable.",
      actions:["Ask specifically for ferritin and a full thyroid panel (Free T3, Free T4, antibodies)"],
      bookRef:'Ch 8 / Ch 19 · B4', productSlot:null, source:'book' },
    'general_redflags': {
      id:'safe-redflag', severity:'caution',
      headline:"A few things are worth raising sooner",
      why:"Most hormonal symptoms can be tracked over time. A small group shouldn't wait — they're signals to get looked at, not tracked.",
      actions:["See a doctor promptly for: bleeding after sex or after menopause; soaking a pad/tampon hourly; severe new pelvic pain; a new breast lump; or a racing heart at rest"],
      bookRef:'Ch 4 — When to Act Faster', productSlot:null, source:'book' }
  },

  /* =========================================================
     ONBOARDING — the "progress contract" shown on the quiz
     result screen. Hooks the user with a dated, specific promise.
     ========================================================= */
  onboarding: {
    contract: {
      headline:"You have a snapshot. Now build the moving picture.",
      body:"One quiz captures a single moment. But your hormones move in rhythms — and the rhythm is where the real answers are. Log a few things each evening (about 20 seconds), and here's what opens up:",
      bullets:[
        "Day 3 — your first pattern",
        "Day 7 — your weekly rhythm",
        "Day 14 — three deeper insights, matched to your body",
        "Day 30 — your personal monthly report"
      ],
      note:"Most women hit their first \"oh, THAT'S why\" moment around day 5.",
      cta:"Start today"
    }
  },

  /* =========================================================
     MILESTONES — streak-day copy (voice C). Keys match
     tracker-data.js streakMilestones days.
     ========================================================= */
  milestones: {
    1:  { headline:"You started — that's the hardest part", body:"One log won't show a pattern yet, but it begins your baseline. Come back tomorrow and the picture starts to form." },
    3:  { headline:"Your first pattern is forming", body:"Three days in. Keep going — a few more logs and the tracker can start connecting your sleep, energy and symptoms." },
    7:  { headline:"A week of you, on the record", body:"Enough data for your first weekly rhythm. Notice which days run high and low — that's your own signal, not a generic chart." },
    14: { headline:"Your cycle picture is taking shape", body:"Two weeks lets deeper patterns surface — how sleep drives energy, how symptoms cluster by phase. This is where it gets genuinely useful." },
    30: { headline:"Your monthly report is ready", body:"A full month of data tells a story a single test can't. You've learned real things about your own body — and the wider picture is in The Hormone Blueprint." },
    60: { headline:"This is a practice now", body:"Two months in, you can compare month to month and see what's actually changing. Consistency, not intensity, is what got you here." },
    90: { headline:"Three months — where real change lives", body:"Hormonal change works on the scale of months. You've given yourself the one thing most advice skips: time and your own data." }
  }
};

/* =============================================================
   RUNTIME HELPERS (pure, ES5, dependency-free)
   Logic lives here so the working files (tracker.js / quiz.js /
   insights.js) only need tiny surgical calls. All helpers are
   defensive: missing data never throws.
   ============================================================= */
(function(A) {
  'use strict';

  A.normalizeType = function(raw) {
    return String(raw || '').toLowerCase().replace(/_/g, '-').trim();
  };

  A.getResultCards = function(type) {
    var key = A.normalizeType(type);
    return (A.resultCards && A.resultCards[key]) ? A.resultCards[key].slice() : [];
  };

  // patternAdvice[id] is an array of variants; pick one by seed (defensive: also handles a plain object)
  A.getPatternAdvice = function(insightId, seed) {
    var arr = A.patternAdvice && A.patternAdvice[insightId];
    if (!arr) return null;
    if (!Array.isArray(arr)) return arr;
    if (!arr.length) return null;
    var i = (typeof seed === 'number' && seed >= 0) ? (Math.floor(seed) % arr.length) : 0;
    return arr[i];
  };
  A.enrichInsight = function(insight, seed) {
    if (insight && insight.id) {
      var adv = A.getPatternAdvice(insight.id, seed);
      if (adv) insight.advice = adv;
    }
    return insight;
  };

  A.getContract  = function() { return A.onboarding ? A.onboarding.contract : null; };
  A.getMilestone = function(day) { return (A.milestones && A.milestones[day]) ? A.milestones[day] : null; };

  function toArray(entries) {
    var arr = [];
    if (!entries) return arr;
    var keys = Object.keys(entries);
    for (var i = 0; i < keys.length; i++) { if (entries[keys[i]]) arr.push(entries[keys[i]]); }
    return arr;
  }
  function countSymptom(arr, sym) {
    var n = 0;
    for (var i = 0; i < arr.length; i++) { if ((arr[i].symptoms || []).indexOf(sym) !== -1) n++; }
    return n;
  }

  A.detectSafety = function(entries) {
    var arr = toArray(entries);
    if (arr.length < 4) return null;
    if (countSymptom(arr, 'irregular_cycles') >= 3) {
      return { card: A.safety.irregular_cycles_persistent, layer: 'safety', key: 'irregular_cycles_persistent' };
    }
    if (countSymptom(arr, 'heart_palpitations') >= 3) {
      return { card: A.safety.heart_palpitations_persistent, layer: 'safety', key: 'heart_palpitations_persistent' };
    }
    var recent = arr.slice(-7), low = 0;
    for (var i = 0; i < recent.length; i++) { if (recent[i].energy != null && recent[i].energy <= 2) low++; }
    if (recent.length >= 7 && low >= 5) {
      return { card: A.safety.low_energy_persistent, layer: 'safety', key: 'low_energy_persistent' };
    }
    return null;
  };

  /* LAYER 2 picker with PER-KEY rotation.
     rotation = a map { key: timesShown }. Each key cycles through all its
     variants before repeating; among logged symptoms the least-seen is chosen,
     so variety is maximised. Safety always wins. Returns { card, layer, key }
     or null. The caller increments rotation[key] for perLog picks. */
  A.pickPerLogCard = function(entry, entries, rotation) {
    rotation = (rotation && typeof rotation === 'object') ? rotation : {};
    function count(k) { return rotation[k] || 0; }
    function variantOf(k) { var v = A.perLog[k]; return { card: v[count(k) % v.length], layer: 'perLog', key: k }; }
    entry = entry || {};

    var safe = A.detectSafety(entries);
    if (safe) return safe;

    var P = A.perLog || {};
    var syms = entry.symptoms || [];

    var candidates = [];
    for (var i = 0; i < syms.length; i++) { if (P[syms[i]] && P[syms[i]].length) candidates.push(syms[i]); }
    if (candidates.length) {
      var best = candidates[0], bestC = count(candidates[0]);
      for (var j = 1; j < candidates.length; j++) { var c = count(candidates[j]); if (c < bestC) { bestC = c; best = candidates[j]; } }
      return variantOf(best);
    }

    // metric conditions, in relevance priority, with variant rotation.
    // Context-only: "bad day" signals get a teaching card here.
    // Good days (energy>=4) and neutral days return null and are handled by
    // pickCard, which mixes a _goodDay reflection with a Daily Learn article.
    if (entry.sleep  != null && entry.sleep  < 6  && P._lowSleep)  return variantOf('_lowSleep');
    if (entry.energy != null && entry.energy <= 2 && P._lowEnergy) return variantOf('_lowEnergy');
    return null;
  };

  /* =========================================================
     DAILY LEARN — long-form mini-articles shown on neutral/good
     days when no "bad day" context card applies. Mixed pool:
     a common pool by topic + optional per-hormone-type pool.
     Card shape: { id, category, severity, eyebrow, headline,
       body:[paragraphs], action, bookRef, productSlot, source }
     ========================================================= */
  A.dailyLearn = {
    common: {
      sleep: [
        { id:'dl-sleep-3am', category:'sleep', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The 3 a.m. wake-up has a name \u2014 and it isn\u2019t \u201Canxiety\u201D",
          body:[
            "You fall asleep without much trouble. Then, somewhere between 2 and 4 in the morning, you\u2019re wide awake \u2014 heart a little fast, mind suddenly loud, and no obvious reason for any of it. You lie there doing the maths on how much sleep is left. If this is your pattern, you are not imagining it, and it is not a character flaw.",
            "Progesterone is your body\u2019s calming hormone. It works partly by boosting GABA, the brain chemical that acts like a brake on a busy nervous system. In the second half of your cycle, and steadily through your late thirties and forties, progesterone starts to thin out \u2014 and that brake gets lighter. At the same time, cortisol naturally begins to climb in the small hours to prepare you for morning. With less progesterone to soften it, that gentle rise can land like an alarm instead of a whisper.",
            "There\u2019s often a second trigger underneath it: blood sugar. If dinner was early or light on carbohydrate, your glucose can dip overnight, and your body answers by releasing cortisol to push it back up \u2014 the same surge that snaps you awake with a thudding heart."
          ],
          action:"One thing to try tonight: a small protein-and-fat snack before bed \u2014 a spoonful of nut butter, a few nuts, or a couple of tablespoons of full-fat Greek yogurt \u2014 is often enough to steady overnight glucose. Pair it with a consistent wake-up time, and for many women a little magnesium in the evening.",
          bookRef:'Sleep', productSlot:'/recommends/magnesium', source:'book+web' }
      ],
      nutrition: [
        { id:'dl-nutrition-breakfast', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your 3 p.m. crash probably started at breakfast",
          body:[
            "That mid-afternoon wall \u2014 the heavy eyelids, the reach for something sweet, the \u201Cwhy am I suddenly useless\u201D feeling around 3 p.m. \u2014 usually isn\u2019t about the afternoon at all. It often traces straight back to your first meal of the day.",
            "A breakfast built mostly on quick carbohydrates \u2014 toast, cereal, a pastry, fruit on its own \u2014 sends blood sugar up fast and then drops it just as fast. That drop is the crash. It\u2019s also the craving: your body asks for more sugar to climb back out of the dip, and the cycle repeats by mid-afternoon.",
            "Protein changes the shape of that curve. It slows how quickly glucose enters your blood, keeps you genuinely full for longer, and \u2014 this matters more every year past your mid-thirties \u2014 it defends the muscle that falling estrogen no longer protects for you. Most women eat far too little of it in the morning: a dab of yogurt, a single egg, or nothing at all."
          ],
          action:"One thing to try tomorrow: aim for roughly 25\u201330 grams of protein at your first meal. That\u2019s two or three eggs, a full cup of Greek yogurt with seeds, or a protein shake if mornings are rushed. Notice how 3 p.m. feels by the end of the week.",
          bookRef:'Food / The Four Foundations', productSlot:null, source:'book+web' },
        { id:'dl-nutrition-fibre', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your gut helps decide how much estrogen stays in you",
          body:[
            "Almost no one is told this: your gut is one of the main places your body manages estrogen. Once your liver has packaged up old estrogen to be removed, it travels to the gut to leave the body for good. That last step matters more than most women ever hear.",
            "If your gut is sluggish or the bacterial balance is off, some of that packaged estrogen gets unwrapped and sent back into circulation instead of out. There\u2019s even a name for the community of gut bacteria that handles this \u2014 the estrobolome. When it\u2019s not working well, recirculating estrogen can feed heavier periods, worse PMS, and the estrogen-progesterone tug-of-war of perimenopause.",
            "The single biggest lever here is unglamorous: fibre. Most women eat 12\u201315 grams a day; the amount that actually supports hormone clearance is closer to 30\u201335. Fermented foods help too, and daily, comfortable bowel movements are part of how you clear hormones \u2014 not a side issue."
          ],
          action:"One thing to try this week: add one genuinely high-fibre food to each meal \u2014 a spoon of ground flaxseed in breakfast, beans or lentils at lunch, an extra vegetable at dinner. Small, repeated, cumulative.",
          bookRef:'Food / Fibre & Estrogen Clearance', productSlot:null, source:'book' },
        { id:'dl-nutrition-fats', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why cutting fat too hard can quietly stall your hormones",
          body:[
            "A whole generation of women learned that fat was the enemy \u2014 low-fat yogurt, skimmed everything, dressing on the side. It was framed as the responsible choice. What was almost never mentioned is the hormonal bill that comes with eating too little fat for too long.",
            "Your sex hormones are literally built from cholesterol and fat. They are the raw material. When dietary fat drops too low, the body has less of what it needs to make and balance those hormones \u2014 and the effects show up as flatter mood, lower libido, and a sense that your body has gone quiet.",
            "This isn\u2019t licence to drown everything in oil. It\u2019s permission to stop fearing the right fats: olive oil, oily fish, nuts, seeds, avocado, eggs. The omega-3 fats in particular are anti-inflammatory and support the same pathways that ease PMS and perimenopausal symptoms."
          ],
          action:"One thing to try: add a real source of healthy fat to one meal today \u2014 half an avocado, a handful of walnuts, a drizzle of olive oil, or a portion of salmon. Fat is not the thing to be afraid of.",
          bookRef:'Food / The Right Fats', productSlot:'/recommends/omega-3', source:'book' },
        { id:'dl-nutrition-alcohol', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"What that evening glass of wine does after you fall asleep",
          body:[
            "A drink in the evening genuinely can feel like it takes the edge off. The catch is what happens in the hours after you\u2019ve fallen asleep. Alcohol is sedating at first, then fragments the second half of the night and strips out the restorative REM sleep \u2014 the exact part already under pressure if you\u2019re waking at 3 a.m.",
            "There\u2019s a hormonal layer too. Alcohol nudges estrogen up and leans on the same liver that\u2019s meant to be clearing it, so it lingers longer. And the calm it offers is borrowed: many women notice more anxiety \u2014 the \u201Changxiety\u201D \u2014 in the day or two that follow, as brain chemistry rebounds.",
            "None of this is about a lifetime of abstinence or guilt. It\u2019s about seeing alcohol clearly: not as a sleep aid or a wind-down tool, but as something that, past your late thirties, your body processes more slowly and feels more sharply than it used to."
          ],
          action:"One thing to notice: pick two evenings this week without a drink and pay attention to how you sleep and how the next morning feels. Let your own pattern tell you, rather than the habit.",
          bookRef:'Food / What to Drink, What to Limit', productSlot:null, source:'book+web' },
        { id:'dl-nutrition-cravings', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your pre-period cravings aren\u2019t a willpower problem",
          body:[
            "In the week or so before your period, the pull toward chocolate, carbs and salt can feel relentless \u2014 and then comes the familiar self-blame about discipline. It isn\u2019t a discipline failure. It\u2019s biology behaving exactly as it\u2019s built to.",
            "As progesterone falls in the late luteal phase, blood sugar gets a little less stable and serotonin dips. Your brain reaches for the fastest known route back to steady and calm: sugar and quick carbs. The craving is a real signal, not a moral test.",
            "Which is good news, because signals can be answered intelligently. Steadier blood sugar across the day blunts the spikes that drive the cravings, and magnesium is one of the most consistently helpful nutrients for the cluster of luteal symptoms \u2014 cravings, mood, sleep and cramps included."
          ],
          action:"One thing to try this cycle: in your pre-period week, anchor each meal with protein and fibre, and consider a little magnesium in the evening. You\u2019re working with the craving\u2019s cause, not fighting its symptom.",
          bookRef:'Cycle / The Luteal Phase', productSlot:'/recommends/magnesium', source:'book' },
        { id:'dl-nutrition-undereating', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Sometimes eating too little is the thing keeping you stuck",
          body:[
            "It runs against everything the diet culture taught us, but it\u2019s worth saying plainly: under-eating, for months or years, can quietly work against your hormones rather than for them. The body reads a sustained shortage of food as a threat, and it responds by turning things down to conserve.",
            "Chronic restriction nudges cortisol up and can slow the conversion of your thyroid hormone into its active form \u2014 so your metabolism dials back even when the lab numbers look \u201Cnormal.\u201D At the same time, too little protein and energy makes it hard to hold onto the muscle that keeps you strong and steady.",
            "The picture that tends to follow is familiar: tired, cold, flat mood, stalled progress, and a body that won\u2019t budge no matter how little you eat. Eating enough \u2014 enough protein, enough real food \u2014 is sometimes the change that finally lets things move again."
          ],
          action:"One thing to ask yourself honestly: are you actually eating enough to support the life you\u2019re living? For many women the fix isn\u2019t eating less \u2014 it\u2019s eating enough, with enough protein.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-nutrition-cruciferous', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The vegetable family that helps your body clear estrogen",
          body:[
            "Broccoli, cauliflower, Brussels sprouts, kale and cabbage tend to get filed under \u201Ceat your greens.\u201D But this particular family \u2014 the cruciferous vegetables \u2014 earns a special mention in women\u2019s hormone health for a specific reason.",
            "They contain a compound the body turns into indole-3-carbinol, and then into something called DIM, which gently steers estrogen down its healthier breakdown pathways. In plain terms: they help your body process and clear estrogen the way it\u2019s meant to, which matters for PMS, for heavier or painful periods, and for the estrogen swings of perimenopause.",
            "You don\u2019t need to force down piles of plain steamed broccoli. Roasted with olive oil, shredded into a slaw, blitzed into a soup \u2014 the form barely matters. What matters is showing up a few times a week."
          ],
          action:"One thing to try: get a cruciferous vegetable onto your plate three times this week. Roast a tray of broccoli or sprouts in olive oil \u2014 easy, and it keeps for a couple of days.",
          bookRef:'Food / Fibre & Estrogen Clearance', productSlot:null, source:'book' },
        { id:'dl-nutrition-protein-muscle', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The muscle you can\u2019t see is the one that matters most now",
          body:[
            "Protein gets talked about for weight and for fullness, but the deeper reason it matters from your late thirties onward is quieter and more important: muscle. From around this age, women start losing muscle slowly each year, and falling estrogen stops protecting it the way it once did.",
            "Muscle isn\u2019t about looking a certain way. It\u2019s the tissue that keeps your blood sugar steady, your metabolism awake, your bones loaded and strong, and your future self able to carry shopping and get up off the floor with ease. It is, genuinely, a retirement fund for your body.",
            "Defending it takes more protein than the old guidelines suggested \u2014 most women in this stage do better aiming for protein across the day rather than one token amount at dinner. Paired with a little resistance training, it\u2019s one of the highest-return things you can do for the next thirty years."
          ],
          action:"One thing to try: spread your protein across all three meals rather than loading it at dinner \u2014 aim for a palm-sized portion at each. Creatine is also one of the best-studied, low-cost ways to support strength as you build the habit.",
          bookRef:'Movement / Why Cardio Is Not Enough', productSlot:'/recommends/creatine', source:'book+web' },
        { id:'dl-nutrition-direction', category:'nutrition', severity:'positive',
          eyebrow:'Something to sit with today',
          headline:"You don\u2019t need a perfect diet. You need a direction.",
          body:[
            "If reading about food and hormones leaves you feeling like there\u2019s yet another set of rules to fail at \u2014 pause. The all-or-nothing approach is exactly what burns women out and gets abandoned by week two.",
            "Here\u2019s the more honest truth from the evidence: the women who do best aren\u2019t the ones with flawless diets. They\u2019re the ones who get a handful of foundations roughly right, most of the time \u2014 steady blood sugar, enough protein, the right fats, enough fibre \u2014 and who handle alcohol and caffeine thoughtfully rather than perfectly.",
            "Doing the helpful things about eighty percent of the time, for years, quietly outperforms any strict protocol followed perfectly for a fortnight and then dropped. Direction beats perfection. Consistency beats intensity."
          ],
          action:"One thing to let go of today: the idea that it has to be perfect to count. Pick one foundation \u2014 protein, fibre, fats, or blood sugar \u2014 and just nudge it in the right direction this week.",
          bookRef:'Food / The Four Foundations', productSlot:null, source:'book' }
      ],
      mindset: [
        { id:'dl-mindset-dismissed', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"If you\u2019ve ever been told it was \u201Cnothing\u201D",
          body:[
            "You knew something had shifted. You felt it in your body \u2014 your sleep, your energy, your moods, something. You said it out loud to someone whose job was to listen, and you were told it was normal, or stress, or your age, or in your head. And somewhere in the drive home, you started to wonder if maybe you were making it up.",
            "That particular loneliness \u2014 knowing something is wrong and being told it isn\u2019t \u2014 is real, and it is common. Being dismissed is not the same thing as being fine. A great many women spend years quietly talking themselves out of what their own body is plainly telling them.",
            "The antidote isn\u2019t louder confidence or assuming the worst about every symptom. It\u2019s something steadier, and you can practise it: noticing what you feel, taking it seriously, looking for good information, and asking the second question when the first answer doesn\u2019t fit. It\u2019s often quiet \u2014 choosing rest over pushing through, deciding a symptom is worth mentioning even though you suspect you\u2019ll be brushed off."
          ],
          action:"One thing to carry with you: the next time an answer doesn\u2019t fit what you\u2019re living in, don\u2019t swallow it. Write the symptom down, ask one more question, or find someone who will actually listen. The women who do this, consistently, tend to catch things earlier.",
          bookRef:null, productSlot:null, source:'book' }
      ]
    },
    byType: {}
  };

  // Flatten the Daily Learn pool for a given hormone type (common + per-type).
  function dailyPool(hormoneType) {
    var pool = [];
    var c = A.dailyLearn.common || {};
    Object.keys(c).forEach(function(cat) { (c[cat] || []).forEach(function(card) { pool.push(card); }); });
    var bt = (A.dailyLearn.byType || {})[hormoneType] || [];
    bt.forEach(function(card) { pool.push(card); });
    return pool;
  }

  /* Pick a Daily Learn card with anti-repetition.
     rotation = { id: timesShown }; recent = [ids] cooldown (newest last).
     Rule: never repeat anything in the cooldown window until the pool is
     exhausted; among eligible, choose the least-shown (ties random) so the
     whole library is seen before any repeat. Returns { card, layer:'daily', key }. */
  A.pickDailyCard = function(hormoneType, rotation, recent) {
    rotation = (rotation && typeof rotation === 'object') ? rotation : {};
    recent = Array.isArray(recent) ? recent : [];
    var pool = dailyPool(hormoneType);
    if (!pool.length) return null;
    var eligible = pool.filter(function(card) { return recent.indexOf(card.id) === -1; });
    if (!eligible.length) eligible = pool; // pool smaller than cooldown window — relax
    var best = eligible[0], bestC = rotation[best.id] || 0;
    for (var i = 1; i < eligible.length; i++) {
      var c = rotation[eligible[i].id] || 0;
      if (c < bestC || (c === bestC && Math.random() < 0.5)) { bestC = c; best = eligible[i]; }
    }
    return { card: best, layer: 'daily', key: best.id };
  };

  /* Top-level picker. Priority:
       1. safety (always)
       2. bad-day context (symptom / low sleep / low energy) -> teaching card
       3. good day (energy>=4): ~50/50 a _goodDay reflection OR a Daily Learn article
       4. neutral day: Daily Learn article
     rotation = { id: count }; recent = [ids] (daily cooldown). */
  A.pickCard = function(entry, entries, rotation, recent, hormoneType) {
    rotation = (rotation && typeof rotation === 'object') ? rotation : {};
    entry = entry || {};
    var ctx = A.pickPerLogCard(entry, entries, rotation);
    if (ctx) return ctx;
    var good = entry.energy != null && entry.energy >= 4;
    if (good && A.perLog && A.perLog._goodDay && A.perLog._goodDay.length && Math.random() < 0.5) {
      var v = A.perLog._goodDay, n = rotation['_goodDay'] || 0;
      return { card: v[n % v.length], layer: 'perLog', key: '_goodDay' };
    }
    return A.pickDailyCard(hormoneType, rotation, recent);
  };

})(window.HB_ADVICE);
