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
        body:["When sleep has been short, the instinct is to claw it back with a lie-in. But your body doesn't fill the tank evenly across the night \u2014 the deepest, most restorative sleep is concentrated in the first half.",
          "That means going to bed thirty minutes earlier usually does more for you than sleeping later in the morning. Tonight, protect the front end of the night rather than chasing the back end of it."],
        actions:["Aim for a slightly earlier bedtime, not a later morning"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-sleep-2', severity:'actionable', headline:"Tired but wired? Here's the faster reset",
        body:["Even a single short night raises cortisol and drops your next-day insulin sensitivity \u2014 which is exactly that foggy, snacky, slightly on-edge feeling you're carrying today. It's physiology, not weakness.",
          "The quickest way to steady it isn't another coffee, which only borrows from later. It's morning light: ten minutes of daylight early on resets the rhythm that the bad night knocked sideways."],
        actions:["10 minutes of daylight within an hour of waking"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-sleep-3', severity:'info', headline:"Continuity matters as much as hours",
        body:["If you technically got 'enough' hours but still feel unrested, you're not imagining it. Seven hours that are broken perform far worse than seven that are continuous, because deep and dream sleep need uninterrupted cycles to do their work.",
          "So protecting against the wake-ups can matter more than adding total time. A cool, dark room and no screens in the last hour aren't fussy extras \u2014 they're how you keep the cycles intact."],
        actions:["Cool, dark room; no screens the last hour"], bookRef:'Ch 15', productSlot:'/recommends/magnesium', source:'book' },
      { id:'log-sleep-4', severity:'info', headline:"The most powerful sleep lever is free",
        body:["With sleep struggles it's tempting to reach for a supplement or a gadget. But the single change with the strongest evidence behind it costs nothing and isn't exciting: going to bed and waking at roughly the same time, within about half an hour, seven days a week.",
          "Your body clock craves that regularity more than any one perfect night. Wildly different timings and a long weekend lie-in leave it guessing \u2014 which is part of why Sunday nights so often sleep badly."],
        actions:["Pick a wake time and hold it, even on weekends"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-sleep-5', severity:'info', headline:"If it's been weeks, there's a real fix",
        body:["If sleep has stayed broken for weeks despite getting the basics right, that's worth taking seriously rather than just enduring \u2014 and it doesn't mean the answer is a stronger pill.",
          "The first-line treatment for persistent insomnia is actually a structured programme called CBT for insomnia (CBT-I), which outperforms sleep medication over the long term and is available digitally. It treats the cause, not just tonight."],
        actions:["Look into a CBT-I programme if this has lasted weeks"], bookRef:'Ch 15', productSlot:null, source:'book' }
    ],

    'energy_crashes': [
      { id:'log-energy-1', severity:'actionable', headline:"Your afternoon wall often starts in the morning",
        body:["That 3 p.m. collapse \u2014 heavy, foggy, reaching for sugar \u2014 usually isn't really about the afternoon. It's frequently set up hours earlier, at breakfast.",
          "Coffee on an empty stomach, standing in for an actual breakfast, spikes cortisol and blood sugar and then lets them crash later. What you do at 8 a.m. quietly decides how 3 p.m. feels. Protein with your first meal changes the whole curve."],
        actions:["Eat protein with breakfast before (or with) coffee"], bookRef:'Ch 13 / Ch 8', productSlot:null, source:'book' },
      { id:'log-energy-2', severity:'info', headline:"Energy follows your cycle \u2014 it's information",
        body:["If your energy has dropped, it's worth checking where you are in your cycle before assuming you're doing something wrong. A dip in the luteal phase or during your period is expected, not a failing.",
          "As progesterone rises and then hormones fall toward your period, your body naturally turns more inward and asks for rest. Read low-energy days as a signal to ease off, not a quota you missed."],
        actions:["Note where you are in your cycle when energy drops"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-energy-3', severity:'actionable', headline:"Protein is the fix most women under-eat",
        body:["When energy is patchy, the missing piece is often more basic than it seems: protein. Most women past their mid-thirties eat less than they need, and it's running quietly low.",
          "Protein is the raw material for the hormones and brain chemicals that drive steady energy and mood \u2014 and it keeps blood sugar level so you avoid the spike-and-crash. Aiming for a solid amount at each meal does more for steady energy than any quick fix."],
        actions:["Aim for 25-35 g protein per meal"], bookRef:'Ch 13 — Protein', productSlot:null, source:'book' },
      { id:'log-energy-4', severity:'info', headline:"Fatigue that sleep won't fix has common, fixable causes",
        body:["There's a difference between ordinary tiredness and a bone-deep fatigue that a good night's sleep doesn't touch. If that's what you're carrying, it's worth looking underneath rather than just pushing through.",
          "Two of the most common culprits are low iron (specifically low ferritin) and an underactive thyroid \u2014 both easily missed on a standard check, both very treatable. Persistent, unrefreshing fatigue is a reason to ask for the right tests, not to assume it's just life."],
        actions:["If this keeps recurring, ask for ferritin + a full thyroid panel"], bookRef:'Ch 8 / Ch 19 \u00b7 B4', productSlot:'/recommends/blood-test-uk', source:'book' },
      { id:'log-energy-5', severity:'info', headline:"Energy is built overnight, not bought in cups",
        body:["When the afternoon crashes, the reflex is another coffee. But caffeine doesn't create energy \u2014 it borrows it from later in the day, and the debt comes due.",
          "The levers that actually build energy are less immediate but real: the night before, and protein at breakfast. A third coffee papers over the gap; a consistent wake time and a proper first meal close it."],
        actions:["Anchor a consistent wake time","Protein with breakfast, not just caffeine"], bookRef:'Ch 15 / Ch 13', productSlot:null, source:'book' }
    ],

    'hot_flashes': [
      { id:'log-hot-1', severity:'info', headline:"This is thermostat turbulence, not something you did",
        body:["A hot flush can feel like your body has betrayed you out of nowhere \u2014 a wave of heat, a flushed face, sometimes a racing heart. The first thing worth knowing is that it isn't caused by anything you did or failed to do.",
          "Swinging estrogen destabilises the brain's temperature control, so it misreads normal warmth as overheating and dumps heat. Up to eighty percent of midlife women experience this; it's a recognised medical symptom, not a personal quirk \u2014 which means it's also something that can be addressed."],
        actions:["Note triggers: alcohol, caffeine and warm rooms often amplify them"], bookRef:'Ch 11', productSlot:null, source:'book' },
      { id:'log-hot-2', severity:'actionable', headline:"Two everyday triggers worth testing",
        body:["Not every hot flush has an obvious trigger, but two of the most common are also two of the easiest to adjust: alcohol and evening caffeine. Both reliably worsen flushes and the night sweats that fragment sleep.",
          "Because the effect is fairly direct, cutting back is one of the few self-directed levers with a quick, noticeable payoff. You don't have to guess in the abstract \u2014 a few evenings without the usual drink will tell you how much it's contributing."],
        actions:["Try a few evenings without alcohol and see if nights ease"], bookRef:'Ch 11 / Ch 13', productSlot:null, source:'book' },
      { id:'log-hot-3', severity:'info', headline:"If they're disrupting your life, there's effective help",
        body:["There's a quiet message many women absorb that hot flushes are simply to be endured until they pass. If they're genuinely disrupting your sleep, work or wellbeing, that's worth pushing back on.",
          "Hormone therapy is the most effective treatment for hot flushes and night sweats by a wide margin, and non-hormonal options exist too for women who can't or prefer not to use it. 'Wait it out' is a choice, not the only option \u2014 and a clinician who offers nothing isn't current."],
        actions:["The B5 Doctor's Questions card helps you raise it well"], bookRef:'Ch 12 \u00b7 B5', productSlot:null, source:'book' },
      { id:'log-hot-4', severity:'info', headline:"Phytoestrogens: small but real",
        body:["If you're avoiding hormones and looking for gentler help, plant compounds called phytoestrogens \u2014 found in soy and other foods \u2014 are worth knowing about, with realistic expectations.",
          "The evidence for them with hot flushes is modest: real, but smaller than hormone therapy, and it varies a lot between women. Think of them as a reasonable, low-risk thing to try rather than a cure \u2014 and give any approach a few weeks before judging it."],
        actions:["Worth a try if you're avoiding hormones; keep expectations modest"], bookRef:'Ch 17 — Menopause Support', productSlot:null, source:'book' },
      { id:'log-hot-5', severity:'actionable', headline:"Cool the room, not just yourself",
        body:["Night sweats do their worst damage not through the heat itself but through the broken sleep that follows \u2014 and the warmer the bedroom, the more often a flush actually pulls you fully awake.",
          "So the highest-value fix is environmental: a genuinely cool room, around 17 to 19 degrees, and breathable layers you can shed without surfacing completely. You can't always stop the flush, but you can stop it from wrecking the whole night."],
        actions:["Keep the bedroom cool and dark","Layers you can shed without waking fully"], bookRef:'Ch 15 / Ch 11', productSlot:null, source:'book' }
    ],

    'mood_swings': [
      { id:'log-mood-1', severity:'info', headline:"Mood tracks the cycle for a reason",
        body:["If the same life feels manageable one week and almost unbearable the next \u2014 with nothing actually changing around you \u2014 you're not being irrational or 'too much'. Your brain chemistry is genuinely shifting underneath you.",
          "Estrogen and progesterone act directly on serotonin, dopamine and the calming GABA system. As they rise and fall across your cycle, your baseline mood moves with them. The swing isn't a flaw in your character; it's hormonal weather, and it's readable once you start noticing the pattern."],
        actions:["Note your cycle day when mood drops — the pattern is the insight"], bookRef:'Ch 7', productSlot:null, source:'book' },
      { id:'log-mood-2', severity:'actionable', headline:"Steady blood sugar steadies mood",
        body:["On a low-mood or irritable day, one of the most overlooked levers isn't emotional at all \u2014 it's blood sugar. The spikes and crashes from carb-heavy, protein-light meals amplify irritability and low mood, especially in the luteal phase.",
          "Anchoring each meal with protein and fibre flattens those swings, which takes the sharp edges off the dips. Not skipping meals matters just as much \u2014 an empty tank makes everything feel harder than it is."],
        actions:["Protein + fibre before carbs; don't skip meals"], bookRef:'Ch 13 / Ch 7', productSlot:null, source:'book' },
      { id:'log-mood-3', severity:'info', headline:"The last few days aren't the time for big talks",
        body:["In the final days before your period, your nervous system is genuinely more reactive \u2014 things land harder, patience runs shorter, and a situation can feel more dire than it actually is.",
          "Knowing this gives you a quiet superpower: you can choose to postpone the hard conversation or big decision rather than trusting a temporarily distorted read of it. The issue will still be there in a few days, and you'll see it more clearly."],
        actions:["Where you can, push confrontations past day 1 of your period"], bookRef:'Ch 2 — Luteal Phase', productSlot:null, source:'book' },
      { id:'log-mood-4', severity:'info', headline:"Low mood that's constant points elsewhere",
        body:["There's a useful distinction here. Mood that swings with your cycle \u2014 better some weeks, worse others \u2014 is hormonal weather, and it's expected.",
          "But mood that's flat or low most days, regardless of where you are in your cycle, is a different signal. That pattern more often points to something like low iron, an underactive thyroid, or a low mood worth proper support \u2014 and it deserves a real conversation, not just riding it out."],
        actions:["If it's constant rather than cyclical, ask about ferritin and thyroid"], bookRef:'Ch 8 / Ch 7', productSlot:null, source:'book' },
      { id:'log-mood-5', severity:'actionable', headline:"Morning light steadies the whole day's mood",
        body:["One of the most underrated mood tools costs nothing and takes ten minutes: getting daylight on your face early in the day.",
          "Morning light sets the serotonin-melatonin rhythm that underpins both mood and sleep. Catching some before you reach for screens helps anchor a steadier mood through the day \u2014 small, free, and surprisingly effective when done consistently."],
        actions:["10 minutes of morning daylight, ideally before screens"], bookRef:'Ch 15 / Ch 16', productSlot:null, source:'book' }
    ],

    'anxiety': [
      { id:'log-anx-1', severity:'actionable', headline:"The fastest off-switch is the exhale",
        body:["When anxiety rises, trying to think your way calm rarely works fast \u2014 the feeling is in your body, not just your thoughts. The quickest way in is through your breath, specifically the out-breath.",
          "A long, slow exhale directly engages the vagus nerve, the brake on your nervous system, and lowers your heart rate within seconds. That's why breathing out for twice as long as you breathe in settles a wave of anxiety faster than almost anything you can tell yourself."],
        actions:["Breathe in for 4, out for 8, for two minutes"], bookRef:'Ch 16 — The Vagus Nerve', productSlot:null, source:'book' },
      { id:'log-anx-2', severity:'info', headline:"New anxiety can be hormonal, not a personal failing",
        body:["If anxiety has shown up for the first time, or got noticeably worse, in your late thirties or forties \u2014 and it doesn't quite match what's happening in your life \u2014 it's worth knowing this isn't a flaw in you or a sign you can't cope.",
          "Progesterone is a calming hormone, and as it falls in the luteal phase and through perimenopause, it takes one of your built-in calming signals with it. Anxiety that arrives 'for no reason', often premenstrually, frequently has a hormonal driver. Naming that is the first step to treating it as something to support, not something you're getting wrong."],
        actions:["Note whether it clusters at a point in your cycle"], bookRef:'Ch 7 / Ch 11', productSlot:null, source:'book' },
      { id:'log-anx-3', severity:'info', headline:"Calm is built in small, repeated doses",
        body:["When you're anxious, the instinct is to wait for a free hour to properly relax. But the nervous system doesn't learn calm from the occasional long session \u2014 it learns from small, frequent signals that it's safe to come down.",
          "Two minutes of slow breathing, twice a day, shifts your baseline more than one big effort once in a while. You're not trying to fix the anxiety in one go; you're gently teaching your body a new default, a little at a time."],
        actions:["Two minutes, twice a day \u2014 a 30-second cold splash on the face also resets fast"], bookRef:'Ch 16', productSlot:null, source:'book' },
      { id:'log-anx-4', severity:'info', headline:"If you try a supplement, keep it simple",
        body:["The shelves are full of 'stress support' and 'calm' blends, and most of them are the same trap: a long list of ingredients, each at a dose too small to do much. The label looks impressive; the effect rarely is.",
          "If you want to try something, a single ingredient at a properly studied dose is the better bet. Ashwagandha has reasonable evidence for anxiety and stress \u2014 one ingredient, given a fair trial of a few weeks, beats a proprietary blend of many."],
        actions:["One ingredient at the studied dose beats a proprietary blend"], bookRef:'Ch 17', productSlot:'/recommends/ashwagandha', source:'book' },
      { id:'log-anx-5', severity:'info', headline:"Sometimes it's the coffee, not the worry",
        body:["Before assuming a wave of anxiety is about your circumstances, it's worth ruling out something simpler: caffeine. It raises heart rate and cortisol, and for sensitive people that physical buzz \u2014 racing heart, jittery edge \u2014 reads to the brain as anxiety.",
          "This gets stronger premenstrually, when your tolerance for caffeine drops along with progesterone. So the same coffee that felt fine two weeks ago can tip you into feeling wired and on edge now. The feeling can be chemical, not circumstantial \u2014 and that's good news, because it's easy to test."],
        actions:["Try caffeine earlier and lighter for a week and notice the difference"], bookRef:'Ch 13 / Ch 16', productSlot:null, source:'book' }
    ],

    'cravings': [
      { id:'log-crav-1', severity:'info', headline:"Tonight's cravings often started with last night's sleep",
        body:["When you're fighting an unrelenting pull toward sugar, it's worth asking how you slept \u2014 because a short night quietly rewires your appetite the next day.",
          "Too little sleep raises ghrelin, the hunger hormone, and lowers leptin, the fullness one, so you feel hungrier and less satisfied. The craving may not be about food at all; it can be a sleep signal wearing a snack costume. Protecting tonight's sleep eases tomorrow's cravings."],
        actions:["Protect tonight's sleep to ease tomorrow's cravings"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-crav-2', severity:'info', headline:"Pre-period cravings are partly real biology",
        body:["In the week before your period, the urge toward carbs and chocolate can feel relentless \u2014 and then comes the self-blame about willpower. Let that go: it isn't a discipline failure.",
          "Your body's energy needs rise slightly in the luteal phase while serotonin dips, which genuinely nudges you toward carbohydrates. It's expected, and it passes. Working with it \u2014 adding protein and slower carbs rather than white-knuckling \u2014 beats fighting it."],
        actions:["Add protein and complex carbs rather than fighting it"], bookRef:'Ch 2 — Luteal', productSlot:null, source:'book' },
      { id:'log-crav-3', severity:'actionable', headline:"The order you eat your plate matters",
        body:["A craving often isn't really about the last thing you ate \u2014 it's about how fast your blood sugar rose and then crashed, which then demands more sugar to climb back out.",
          "There's a simple lever: eat protein and vegetables before the carbohydrates. The same meal, in that order, blunts the spike-and-crash that sets up the next craving. A short walk afterward helps even more."],
        actions:["Protein + veg first, starch last","A short walk after eating"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-crav-4', severity:'info', headline:"Thirst and low protein both fake hunger",
        body:["Not every craving is hunger. Mild dehydration and a protein-light breakfast both tend to surface hours later as a vague pull toward something sweet \u2014 the body's signals get crossed.",
          "So before giving in or grimly resisting, it's worth a quick test: have a glass of water and some protein, then revisit the craving in twenty minutes. Often it has quietly faded, because the real need was water or protein in disguise."],
        actions:["Water plus protein first, then revisit the craving in 20 minutes"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-crav-5', severity:'info', headline:"Restriction by day is cravings by night",
        body:["If your evenings are a battle with the cupboards, the cause is often earlier in the day than it feels. Under-eating across the day reliably drives evening cravings \u2014 the body collects the deficit after dark.",
          "It's the quiet fix most diets skip: eating enough at your actual meals so the evening isn't trying to make up a shortfall. Often the answer to night-time cravings isn't more willpower \u2014 it's more food earlier."],
        actions:["Eat enough at meals so the evening isn't making up a shortfall"], bookRef:'Ch 13', productSlot:null, source:'book' }
    ],

    'brain_fog': [
      { id:'log-fog-1', severity:'info', headline:"The fog is real, measurable, and usually temporary",
        body:["Losing words mid-sentence, walking into a room and forgetting why, a mind that feels wrapped in cotton wool \u2014 brain fog is genuinely frightening, mostly because it's so easy to read as the start of something permanent.",
          "In perimenopause it usually isn't. Fluctuating estrogen disrupts the brain's cognitive networks, so the fog tracks the hormonal turbulence rather than signalling decline \u2014 and for most women it lifts as hormones settle. It's your brain reacting to changing chemistry, not failing."],
        actions:["Track it so you can see it comes and goes"], bookRef:'Ch 11', productSlot:null, source:'book' },
      { id:'log-fog-2', severity:'actionable', headline:"Fog often rides in on a poor night",
        body:["If today feels especially foggy, last night is a good first suspect. Overnight, the brain runs a cleaning cycle that flushes the metabolic waste built up during the day \u2014 and that clearance depends on deep sleep.",
          "A broken or short night leaves some of that residue behind, and you feel it the next day as thicker fog. It's another reason continuous sleep matters: it's not just rest, it's the brain tidying itself."],
        actions:["Prioritise continuous sleep tonight"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-fog-3', severity:'info', headline:"If fog comes with cold and fatigue, check your thyroid",
        body:["Brain fog rarely travels alone, and the company it keeps is a clue. When it clusters with deep fatigue, feeling cold, dry skin and weight changes, an underactive thyroid is worth ruling out.",
          "The catch is that a basic test often checks only TSH, which can look 'normal' while the fuller picture tells a different story. If this cluster fits you, it's reasonable to ask for free T3, free T4 and antibodies \u2014 not just the single number."],
        actions:["Ask for Free T3, Free T4 and antibodies, not just TSH"], bookRef:'Ch 8 / Ch 19', productSlot:'/recommends/blood-test-uk', source:'book' },
      { id:'log-fog-4', severity:'info', headline:"Fog that tracks your cycle is weather, not decline",
        body:["If your sharpest and foggiest days seem to follow a monthly rhythm, that's information worth having. In the days before a period, falling estrogen and progesterone can blunt focus and word recall.",
          "When the fog clearly tracks your cycle, it's hormonal weather passing through rather than a permanent change. Noting your cycle day when it hits turns a frightening mystery into a predictable, temporary phase."],
        actions:["Note your cycle day when fog hits to see the pattern"], bookRef:'Ch 2 / Ch 11', productSlot:null, source:'book' },
      { id:'log-fog-5', severity:'actionable', headline:"Blood sugar swings cloud thinking directly",
        body:["Some of what feels like hormonal fog is actually your blood sugar. A sharp glucose spike and the crash that follows impair concentration directly \u2014 that heavy, can't-think feeling an hour or two after a carb-heavy meal.",
          "The fix is the same small lever that helps so much else: protein and fibre before the carbs, and skipping sugary drinks on an empty stomach. Flatten the curve and the afternoon fog often lifts with it."],
        actions:["Protein and fibre first","Skip sugary drinks on an empty stomach"], bookRef:'Ch 13', productSlot:null, source:'book' }
    ],

    'breast_tenderness': [
      { id:'log-breast-1', severity:'info', headline:"Usually it's the luteal phase talking",
        body:["Breast tenderness in the days before your period is, for most women, a normal hormonal shift \u2014 fullness and soreness that arrive on schedule and ease once bleeding starts.",
          "What's different, and worth not just tracking but checking, is tenderness that's persistent, one-sided, or comes with a new distinct lump. Cyclical and both-sided tends to be hormonal; the other pattern is one to take to a doctor."],
        actions:["Note if it's cyclical (eases when your period starts)"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-breast-2', severity:'info', headline:"Caffeine and alcohol can amplify it",
        body:["If premenstrual breast tenderness is bothering you, two everyday things may be quietly making it worse: caffeine and alcohol. For some women both intensify the soreness, partly by adding to the estrogen load.",
          "The useful part is how easy it is to test. Ease off in the week before your period and notice whether the tenderness softens \u2014 your own response will tell you more than any general rule."],
        actions:["Try less caffeine/alcohol in the week before your period"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-breast-3', severity:'info', headline:"Cyclical fullness is water and estrogen, not a problem",
        body:["The fullness and tenderness that build before a period come from rising estrogen and fluid shifts, and they ease once bleeding begins. That on-and-off, both-sided pattern is reassuring \u2014 it's your cycle doing what it does.",
          "The story worth a closer look is the opposite of cyclical: tenderness or a lump that's persistent, one-sided, or doesn't come and go with your period. Knowing your normal is exactly what lets that stand out."],
        actions:["Track whether it eases when your period begins"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-breast-4', severity:'actionable', headline:"Two levers that ease the ache",
        body:["Beyond easing caffeine and alcohol, there are a couple of gentle levers for premenstrual breast tenderness, which is driven largely by fluid retention in the luteal week.",
          "Magnesium in the evening helps some women, and going easy on very salty foods in the days before your period reduces the fluid that makes breasts feel full and sore. Small adjustments, but they target the actual mechanism."],
        actions:["Magnesium in the evening","Go easy on salt in the week before your period"], bookRef:'Ch 17', productSlot:'/recommends/magnesium', source:'book' }
    ],

    'bloating': [
      { id:'log-bloat-1', severity:'info', headline:"Pre-period bloating is water and slowed digestion",
        body:["If you feel puffy and heavy in the days before your period, it isn't something you ate wrong \u2014 it's predictable hormonal physiology.",
          "Progesterone slows the gut and shifts how your body holds fluid in the luteal phase, so bloating that arrives on schedule is expected. Knowing it's cyclical takes the alarm out of it: it builds before your period and eases once bleeding starts."],
        actions:["Note if it tracks your cycle"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-bloat-2', severity:'actionable', headline:"Fibre and fluid, not less food",
        body:["The instinct when bloated is often to eat less \u2014 but the more effective move is usually the opposite of restriction. Constipation directly recirculates estrogen and worsens bloating, so keeping things moving matters.",
          "Daily, comfortable bowel movements \u2014 driven by enough fibre and water \u2014 are part of how your body clears hormones, not just a comfort issue. Building toward 30 grams of fibre and steady hydration does more than any 'debloat' product."],
        actions:["Build toward 30 g fibre and 1.5-2 L water a day"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-bloat-3', severity:'info', headline:"Bloating can be the gut, not the hormones",
        body:["The first useful question with bloating is whether it tracks your cycle. If it reliably comes before your period and goes after, it's hormonal and expected.",
          "If it's near-constant regardless of where you are in your cycle, the usual drivers are different \u2014 eating fast, fizzy drinks, or specific trigger foods \u2014 and persistent, unexplained bloating earns a closer look rather than just riding it out."],
        actions:["Notice whether it's cyclical or near-constant"], bookRef:'Ch 2 / Ch 13', productSlot:null, source:'book' },
      { id:'log-bloat-4', severity:'actionable', headline:"Walking moves more than your legs",
        body:["When you're uncomfortably bloated, the most effective remedy is also one of the simplest, and it isn't a tea or a supplement \u2014 it's movement.",
          "A short walk after eating speeds digestion along and helps clear the gas and fullness behind the bloat, more reliably than anything marketed as a 'debloat' fix. Ten minutes after your biggest meal is enough to notice."],
        actions:["A 10-minute walk after your biggest meal"], bookRef:'Ch 14 / Ch 13', productSlot:null, source:'book' }
    ],

    'headaches': [
      { id:'log-head-1', severity:'info', headline:"Headaches that track your period have a hormonal trigger",
        body:["If your worst headaches seem to cluster at the same point each month, that timing isn't coincidence \u2014 it's a clue. Migraines and headaches that land around your period are linked to the sharp pre-period fall in estrogen.",
          "Spotting the pattern is the first real step to managing them, because a predictable trigger can be planned for. Logging your headache days against your cycle turns a random-feeling affliction into something you can see coming."],
        actions:["Log headache days against your cycle day"], bookRef:'Ch 4 / Ch 2', productSlot:null, source:'book' },
      { id:'log-head-2', severity:'actionable', headline:"The boring triggers are usually the real ones",
        body:["Before assuming a headache is hormonal or something more, it's worth ruling out the unglamorous suspects \u2014 because they cause far more headaches than most women realise.",
          "Dehydration, a skipped meal, a poor night's sleep, a drink the evening before: any of these can be the whole story, and all are cheaper and gentler to fix than reaching straight for painkillers. Cover the basics first, then look further if it persists."],
        actions:["Water, regular meals, steady sleep before reaching for pills"], bookRef:'Ch 13 / Ch 15', productSlot:null, source:'book' },
      { id:'log-head-3', severity:'info', headline:"The estrogen-drop migraine has a window you can pre-empt",
        body:["Migraine that reliably lands just before your period is tied to the steep fall in estrogen at that point in your cycle. Once you know your window, you stop being ambushed by it.",
          "That foreknowledge is useful: in the days before the vulnerable point, you can be more protective \u2014 steady hydration, magnesium, regular meals, guarded sleep \u2014 rather than reacting once the migraine has already arrived."],
        actions:["Track headache days against cycle day to find your window"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-head-4', severity:'actionable', headline:"Magnesium has real evidence for migraine",
        body:["Among the supplements marketed for headaches, most are hopeful guesses \u2014 but magnesium is one of the few with decent evidence behind it. Taken regularly, it reduces migraine frequency for many people.",
          "It's also low-risk and inexpensive, which makes it a reasonable thing to try properly. The key word is consistent: it works as a daily preventive over weeks, not as something you grab once the headache has started."],
        actions:["A consistent evening magnesium is worth a fair trial"], bookRef:'Ch 17', productSlot:'/recommends/magnesium', source:'book' }
    ],

    'joint_pain': [
      { id:'log-joint-1', severity:'info', headline:"Estrogen quietly protected your joints",
        body:["New aches in the small joints of your hands and feet, with no injury to explain them, are easy to file under 'getting older' and forget. But they're a common, under-recognised part of the perimenopausal picture.",
          "Estrogen has anti-inflammatory effects and helps keep joint tissues supple; as it withdraws and swings, that protection lifts and aches can surface. If these turned up alongside other midlife changes, hormones are very likely part of the story \u2014 which points at what helps."],
        actions:["Note if it appeared alongside other midlife changes"], bookRef:'Ch 11 — The Body Layer', productSlot:null, source:'book' },
      { id:'log-joint-2', severity:'actionable', headline:"Movement and omega-3 both genuinely help",
        body:["When joints ache, the instinct is to rest them \u2014 but gentle, regular movement is what keeps them mobile and comfortable, and it beats waiting the stiffness out.",
          "Alongside it, omega-3 fats are genuinely anti-inflammatory, with real evidence behind them for joint comfort in midlife. The combination \u2014 daily movement plus oily fish or a tested fish oil \u2014 targets both the stiffness and the inflammation underneath it."],
        actions:["Daily walking + mobility work","Oily fish 2-3x a week, or a tested fish oil"], bookRef:'Ch 14 / Ch 13', productSlot:'/recommends/omega-3', source:'book' },
      { id:'log-joint-3', severity:'info', headline:"Stiffness that eases as you move is the typical pattern",
        body:["A reassuring thing to know: the common perimenopausal joint pattern is stiffness that's worst first thing and loosens as you start moving, rather than pain that worsens with use.",
          "That's estrogen's effect on inflammation showing up overnight and easing once you're up and about. So the better response is usually gentle movement first thing \u2014 not waiting in stillness for it to pass, which tends to let it set."],
        actions:["Gentle movement first thing rather than waiting it out"], bookRef:'Ch 11 / Ch 14', productSlot:null, source:'book' },
      { id:'log-joint-4', severity:'info', headline:"Strength protects the joints it loads",
        body:["It feels counterintuitive when joints already ache, but loading them through resistance training \u2014 built up gradually \u2014 tends to ease midlife aches rather than worsen them.",
          "Strong muscle and connective tissue around a joint support and stabilise it, which takes pressure off. The key is starting light and building slowly; done that way, two sessions a week is one of the better things you can do for achy midlife joints."],
        actions:["Add two light strength sessions a week, building slowly"], bookRef:'Ch 14', productSlot:null, source:'book' }
    ],

    'dryness': [
      { id:'log-dry-1', severity:'actionable', headline:"A simple, badly underused fix",
        body:["Vaginal dryness and discomfort are common, often suffered in silence, and assumed to be just part of getting older. They come from falling local estrogen in those tissues \u2014 and that's exactly why they're treatable.",
          "Low-dose vaginal estrogen, delivered right where it's needed, is barely absorbed into the rest of the body, safe for most women, and one of the most underprescribed treatments in women's medicine. The biggest barrier is usually that no one mentioned it was an option."],
        actions:["Worth asking your clinician about specifically"], bookRef:'Ch 12', productSlot:null, source:'book' },
      { id:'log-dry-2', severity:'info', headline:"It can also be breastfeeding or the pill",
        body:["Dryness isn't only a menopause thing. The same low-estrogen state from breastfeeding, or from some forms of contraception, produces exactly the same symptom \u2014 sometimes in women who'd never expect it yet.",
          "Knowing the cause is hormonal, not a sign something is wrong with you or your relationship, takes some of the worry out of it. And in every case it's treatable. Noticing what else changed around when it started often points straight to the trigger."],
        actions:["Note what else changed around when it started"], bookRef:'Ch 9 / Ch 18', productSlot:null, source:'book' },
      { id:'log-dry-3', severity:'info', headline:"Unlike hot flushes, this one tends not to pass on its own",
        body:["Many menopausal symptoms ease with time \u2014 but vaginal dryness is the exception. Without treatment it usually doesn't resolve after menopause and tends to slowly progress instead.",
          "That's the key reason not to just endure it or wait it out. Raising low-dose vaginal estrogen with a clinician sooner rather than later treats the cause early, before the tissue changes become more entrenched."],
        actions:["Raise it with your clinician sooner rather than later"], bookRef:'Ch 12 / Ch 20', productSlot:null, source:'book' },
      { id:'log-dry-4', severity:'info', headline:"Lubricant eases the moment; estrogen fixes the tissue",
        body:["It helps to know these do two different jobs. Moisturisers and lubricants relieve discomfort in the moment and are genuinely useful for comfort and intimacy.",
          "Vaginal estrogen does something different \u2014 it actually restores the tissue itself over time, addressing the cause rather than the symptom. Many women sensibly use both: a lubricant for now, and vaginal estrogen for the underlying change."],
        actions:["A moisturiser for comfort now; ask about vaginal estrogen for the cause"], bookRef:'Ch 12', productSlot:null, source:'book' }
    ],

    'low_libido': [
      { id:'log-lib-1', severity:'info', headline:"Libido has several hormonal inputs, not just mood",
        body:["When desire fades, the explanations women reach for are usually about themselves or their relationship. But low libido isn't only psychological \u2014 there's real hormonal machinery underneath it.",
          "Testosterone, which women produce too, fuels desire and declines through midlife \u2014 and it goes almost entirely unmentioned in standard appointments. If low desire is genuinely bothering you, testosterone is a valid thing to raise, not a strange request."],
        actions:["If it's a real concern, testosterone is a valid thing to ask about"], bookRef:'Ch 1 / Ch 12', productSlot:null, source:'book' },
      { id:'log-lib-2', severity:'info', headline:"Sleep and stress sit underneath desire",
        body:["Sometimes the issue isn't in the bedroom at all \u2014 it's upstream. Chronic stress and poor sleep suppress libido directly, because a depleted, on-guard body sensibly deprioritises sex.",
          "That's actually hopeful: it means desire often returns not by trying to force it, but by addressing the load underneath. Protecting your sleep and easing your stress frequently does more for libido than anything aimed at libido itself."],
        actions:["Protecting sleep and stress often does more than you'd expect"], bookRef:'Ch 16 / Ch 15', productSlot:null, source:'book' },
      { id:'log-lib-3', severity:'info', headline:"For many women, desire follows \u2014 it doesn't lead",
        body:["A lot of women quietly worry because they don't feel a spontaneous urge the way they once did. But research suggests that for many women, arousal builds after engagement begins rather than appearing out of nowhere first.",
          "That reframes things: waiting to 'feel like it' before starting can be the wrong model. Feeling safe, unhurried and connected often matters more than a spontaneous spark \u2014 and desire can warm up once you've begun."],
        actions:["Lower the bar for starting; desire can warm up afterwards"], bookRef:'Ch 12', productSlot:null, source:'book' },
      { id:'log-lib-4', severity:'info', headline:"Some medications quietly dampen libido",
        body:["If your desire dropped noticeably around the time you started a new medication, that timing is worth taking seriously. SSRIs, certain contraceptives and a few other drugs can lower libido as a side effect.",
          "This isn't a reason to stop anything on your own \u2014 but it is a fair thing to raise with whoever prescribed it. Alternatives or adjustments often exist, and it shouldn't simply be accepted as the price you pay in silence."],
        actions:["If it changed with a new medication, mention it to your prescriber"], bookRef:'Ch 18 / Ch 12', productSlot:null, source:'book' }
    ],

    'weight_gain': [
      { id:'log-weight-1', severity:'info', headline:"Midsection change is often insulin, not calories",
        body:["If weight has started gathering around your middle without much change in how you eat, that's not a discipline failure \u2014 it's a hormonal shift, and treating it as a willpower problem usually makes it worse.",
          "As estrogen falls, fat redistributes centrally and insulin sensitivity drops, so the body holds weight differently on the same intake. The effective response isn't deeper restriction; it's protein, fibre and strength training, which work with the new terms rather than against them."],
        actions:["Focus on protein, fibre and strength training over restriction"], bookRef:'Ch 11 / Ch 13', productSlot:null, source:'book' },
      { id:'log-weight-2', severity:'info', headline:"Muscle is your metabolic ally",
        body:["When the scale won't budge, the instinct is to eat even less \u2014 but the more powerful lever in midlife is building muscle, not cutting more food.",
          "Muscle is the body's largest store for blood sugar, so building it directly improves insulin sensitivity and lifts what you burn at rest. That's why two strength sessions a week, with enough protein to actually use them, reshapes midlife metabolism more than cardio or restriction ever will."],
        actions:["Two strength sessions a week, enough protein to use them"], bookRef:'Ch 14', productSlot:null, source:'book' },
      { id:'log-weight-3', severity:'info', headline:"Sleep loss tilts the scales",
        body:["One overlooked driver of midlife weight has nothing to do with food at all: sleep. Short nights raise hunger hormones and worsen insulin resistance, nudging weight upward regardless of willpower.",
          "It means the most effective 'diet' change is sometimes just an earlier bedtime. Treating sleep as a metabolic lever \u2014 not merely rest \u2014 quietly supports everything else you're doing with food and movement."],
        actions:["Treat sleep as a metabolic lever, not just rest"], bookRef:'Ch 15 / Ch 13', productSlot:null, source:'book' },
      { id:'log-weight-4', severity:'info', headline:"Build the metabolism, don't just cut the food",
        body:["There's a real difference between cardio and strength here. Cardio burns calories in the moment; muscle raises what you burn at rest and soaks up blood sugar around the clock.",
          "So strength training reshapes midlife metabolism more durably than cutting food further \u2014 which tends to cost you the very muscle that protects your metabolism. Two strength sessions plus enough protein beats deeper restriction, every time."],
        actions:["Two strength sessions plus enough protein beats deeper restriction"], bookRef:'Ch 14', productSlot:null, source:'book' }
    ],

    'acne': [
      { id:'log-acne-1', severity:'info', headline:"Jawline breakouts have a hormonal signature",
        body:["Acne that sits along your jaw and chin behaves differently from teenage spots, and it's worth recognising the pattern rather than only attacking the surface.",
          "When it clusters with irregular cycles or unwanted hair, it can point to higher androgens \u2014 the hormonal picture behind conditions like PCOS. That changes the approach: alongside skincare, steadying the hormonal drivers (blood sugar, stress) often does more. Zinc is one nutrient with a role in skin regulation worth knowing about."],
        actions:["Note if it clusters with cycle changes or other symptoms"], bookRef:'Ch 6 — PCOS', productSlot:'/recommends/zinc', source:'book' },
      { id:'log-acne-2', severity:'info', headline:"Blood sugar quietly feeds skin inflammation",
        body:["One of the less obvious skin levers is on your plate. High insulin, driven by blood-sugar spikes, nudges the ovaries toward producing more testosterone \u2014 which in turn drives breakouts.",
          "So steadying blood sugar can quietly improve your skin alongside your energy and mood. Protein and fibre before carbohydrates, and fewer sugary drinks, isn't a skincare routine \u2014 but for hormonal acne it often works upstream of one."],
        actions:["Protein + fibre first; fewer sugary drinks"], bookRef:'Ch 13 / Ch 6', productSlot:null, source:'book' },
      { id:'log-acne-3', severity:'info', headline:"Stress shows up on your skin too",
        body:["If your breakouts seem to flare during your hardest weeks, that's not your imagination. Cortisol raises oil production and inflammation, so stress and skin are genuinely linked.",
          "It means calming the nervous system is a real skin lever \u2014 slower and less direct than a cream, but it addresses a driver creams can't reach. Noticing whether breakouts track your most stressful stretches is the first clue."],
        actions:["Note whether breakouts track your most stressful weeks"], bookRef:'Ch 16 / Ch 6', productSlot:null, source:'book' },
      { id:'log-acne-4', severity:'info', headline:"Coming off the pill can flare skin for a while",
        body:["If your skin broke out after stopping hormonal contraception, knowing the timeline can save a lot of panic. The pill suppresses androgen-driven breakouts; coming off can unmask them for several months before things settle.",
          "That window is temporary for most women. Understanding it prevents over-treating in frustration \u2014 the better approach is gentle, consistent skin support while your own hormones re-establish their rhythm."],
        actions:["If it followed stopping the pill, give it months and support skin gently"], bookRef:'Ch 18 / Ch 6', productSlot:null, source:'book' }
    ],

    'hair_thinning': [
      { id:'log-hair-1', severity:'info', headline:"Hair often points to iron or thyroid first",
        body:["More hair in the brush, a thinner ponytail, a widening part \u2014 it's distressing, and the cause often isn't your shampoo. Two of the most common, and most treatable, drivers hide in your bloodwork.",
          "Low iron (specifically low ferritin) and thyroid issues both show up in the hair, and both are routinely missed on a standard check. Before assuming it's 'just hormones', it's worth asking for the right tests \u2014 the fix can be straightforward once the cause is named."],
        actions:["Ask for ferritin (aim above ~70 for hair) and a thyroid panel"], bookRef:'Ch 8 / Ch 19', productSlot:'/recommends/blood-test-uk', source:'book' },
      { id:'log-hair-2', severity:'info', headline:"Postpartum shedding runs on its own clock",
        body:["If you've recently had a baby and your hair is coming out in handfuls, this is a recognised hormonal event, not a sign something is wrong. It typically peaks around three to four months after birth.",
          "For most women it recovers on its own as hormones rebalance \u2014 knowing the timeline saves a lot of worry. If it's still shedding heavily past a year, or comes with fatigue and feeling cold, that's the point to check thyroid and iron."],
        actions:["If it persists past a year or comes with fatigue, check thyroid"], bookRef:'Ch 9', productSlot:null, source:'book' },
      { id:'log-hair-3', severity:'info', headline:"Crash diets show up later, in the hairbrush",
        body:["Hair has a delayed reaction to a stressed system. A sudden drop in calories or protein can trigger noticeable shedding a few months later \u2014 long enough that it's easy to miss the connection.",
          "The reassuring part is that diet-driven shedding usually recovers once you're eating enough again, especially enough protein, consistently. It's another reminder that under-eating tends to cost more than it gives."],
        actions:["Enough protein and calories; diet-driven shedding usually recovers"], bookRef:'Ch 13', productSlot:null, source:'book' },
      { id:'log-hair-4', severity:'info', headline:"Midlife thinning has a recognisable pattern",
        body:["In midlife, falling estrogen alongside relatively higher androgens can thin hair specifically at the crown and along the part-line. It's common, and it's not something you simply have to accept in silence.",
          "If that's the pattern you're seeing, it's worth a conversation with a clinician rather than just enduring it \u2014 there are options, and ruling out the treatable causes (iron, thyroid) comes first."],
        actions:["If it's the crown or part-line in midlife, it's worth a clinician chat"], bookRef:'Ch 11 / Ch 12', productSlot:null, source:'book' }
    ],

    'irregular_cycles': [
      { id:'log-irreg-1', severity:'info', headline:"An irregular cycle is information, not a fault",
        body:["A cycle that shifts by more than a week, or leaves long gaps, is your body signalling something \u2014 not a moral failing, and not something you can simply 'relax' away.",
          "The common drivers are perimenopause, thyroid changes, or PCOS, and they're all things a doctor can investigate. The most useful thing you can do is track the length and the gaps: that record is exactly the data a clinician needs to see the pattern."],
        actions:["Track length and gaps — it's the data a doctor needs"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-irreg-2', severity:'info', headline:"PCOS often hides behind irregular cycles",
        body:["When irregular cycles travel with jawline acne, weight settling centrally, or unwanted hair, that combination is a classic PCOS pattern \u2014 and it's one of the most under-diagnosed conditions in women's health.",
          "Underneath it usually sits insulin resistance driving higher androgens, which is actually hopeful: it's very responsive to the right support \u2014 steady blood sugar, strength training, sleep. If this cluster fits you, it's worth a proper assessment; inositol is one supplement with good evidence for PCOS to ask about."],
        actions:["If this cluster fits, ask a doctor about PCOS — and about inositol"], bookRef:'Ch 6', productSlot:null, source:'book' },
      { id:'log-irreg-3', severity:'info', headline:"Stress and under-fuelling can pause your cycle",
        body:["The body pauses what it can't afford. Under heavy stress, hard training, or simply eating too little, it can suppress ovulation \u2014 lengthening cycles, or skipping them altogether.",
          "It's a protective response, not a malfunction, and it often reverses with the obvious-but-overlooked fix: more rest and more food. If your training is hard and your intake is low, adding fuel and recovery usually does more than any cycle 'hack'."],
        actions:["If training is hard and food is low, add fuel and recovery first"], bookRef:'Ch 16 / Ch 4', productSlot:null, source:'book' },
      { id:'log-irreg-4', severity:'info', headline:"Lengthening cycles can be an early peri signal",
        body:["In your late thirties and forties, cycles that start shifting \u2014 often shorter for a while, then longer and occasionally skipped \u2014 are frequently the opening sign of perimenopause, well before anything more obvious.",
          "Any single odd cycle means little; it's the trend over several months that tells the story. Tracking the direction is what turns scattered confusion into a recognisable pattern you can take to a doctor."],
        actions:["Track cycle length over several months to see the direction"], bookRef:'Ch 11 / Ch 2', productSlot:null, source:'book' }
    ],

    'ovulation_cramps': [
      { id:'log-ovul-1', severity:'info', headline:"That mid-cycle twinge has a name",
        body:["A brief, one-sided ache around the middle of your cycle has a name \u2014 mittelschmerz \u2014 and it's simply ovulation making itself felt.",
          "Far from being a problem, it's a sign your cycle is doing its central job, and it's a genuinely useful marker of your fertile window. Noticing it helps you map your own cycle from the inside, rather than relying on a textbook average."],
        actions:["Note it: it helps you map your own cycle"], bookRef:'Ch 2 — Ovulatory', productSlot:null, source:'book' },
      { id:'log-ovul-2', severity:'info', headline:"It marks your fertile window",
        body:["That mid-cycle twinge lands right around ovulation \u2014 the few days in your cycle when conception is actually possible.",
          "Whether you're trying to conceive or trying to avoid it, learning to recognise this natural signal is quietly empowering. Logged alongside your cycle day over a couple of months, it helps you map your own fertile window more accurately than any app's prediction."],
        actions:["Note it alongside cycle day to map your own window"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-ovul-3', severity:'info', headline:"A little mid-cycle spotting can be normal",
        body:["Light spotting around ovulation, often alongside the twinge, reflects the natural estrogen shift at that point in your cycle, and is usually completely harmless.",
          "The distinction worth holding: light, occasional, mid-cycle spotting tends to be fine, while heavy or frequent bleeding between periods is a different thing that deserves checking. Knowing your own normal is what lets you tell them apart."],
        actions:["Light mid-cycle spotting is usually fine; heavy bleeding is not"], bookRef:'Ch 2 / Ch 4', productSlot:null, source:'book' },
      { id:'log-ovul-4', severity:'info', headline:"One-sided and brief is expected; severe is not",
        body:["Ovulation pain typically alternates sides from month to month, and is mild and short-lived \u2014 a passing twinge rather than something that stops your day.",
          "That's the reassuring, normal pattern. Pain that's severe, or one-sided and lasting, is a different matter and deserves a check rather than just being logged. The intensity and duration are your guide."],
        actions:["Brief and mild is normal; severe or persistent, see a doctor"], bookRef:'Ch 4', productSlot:null, source:'book' }
    ],

    'night_sweats': [
      { id:'log-nsweat-1', severity:'info', headline:"Night sweats are hot flushes that strike while you sleep",
        body:["Waking drenched, throwing the covers off then pulling them back \u2014 night sweats are the same brain-thermostat glitch as daytime hot flushes, just timed for the worst possible moment. As estrogen swings, the brain misreads normal warmth as overheating and dumps heat.",
          "The real damage isn't the heat \u2014 it's the broken sleep, which then amplifies mood, anxiety and fog the next day. That's exactly why they're worth addressing rather than enduring."],
        actions:["Keep the bedroom genuinely cool (17-19C) and use breathable layers you can shed"], bookRef:'Perimenopause / Vasomotor Symptoms', productSlot:null, source:'book' },
      { id:'log-nsweat-2', severity:'actionable', headline:"Two evening habits make them worse",
        body:["If night sweats are breaking your sleep, two everyday things reliably worsen them: alcohol and a warm bedroom. Both are easy to adjust, and the payoff shows up the same night.",
          "An evening drink in particular tends to trigger more sweats and lighter sleep \u2014 a quick experiment of a few alcohol-free evenings will usually tell you how much it's contributing."],
        actions:["Try a few evenings without alcohol and drop the room temperature"], bookRef:'Sleep / Why Sleep Breaks Down in Perimenopause', productSlot:null, source:'book' },
      { id:'log-nsweat-3', severity:'info', headline:"If they're wrecking your sleep, there's effective help",
        body:["Frequent night sweats aren't something you simply have to wait out. They're one of the symptoms that responds most reliably to treatment, so persistent ones are worth a real conversation, not endurance.",
          "Hormone therapy is the most effective option for moderate-to-severe night sweats, and non-hormonal options exist too. A clinician who offers nothing isn't up to date."],
        actions:["If they're frequent, raise them specifically with a doctor"], bookRef:'Menopause and HRT', productSlot:null, source:'book' }
    ],

    'nausea': [
      { id:'log-nausea-1', severity:'info', headline:"Cyclical nausea often tracks your hormones",
        body:["Waves of queasiness that seem to come and go with your cycle \u2014 often around your period or mid-cycle \u2014 aren't random. Shifting estrogen and the prostaglandins released around menstruation can both unsettle the stomach.",
          "Knowing it's hormonal and timed takes some of the worry out of it: it's a passing phase of the cycle, not a sign something is wrong with your gut."],
        actions:["Note where it falls in your cycle \u2014 the timing is the clue"], bookRef:'Cycle / The Luteal Phase', productSlot:null, source:'book' },
      { id:'log-nausea-2', severity:'actionable', headline:"Steady blood sugar settles a queasy stomach",
        body:["Nausea is often worse on an empty stomach or after blood-sugar swings, which is why it can hit hardest mid-morning or when you've skipped a meal.",
          "Small, regular meals with some protein \u2014 rather than going long stretches without eating \u2014 keep blood sugar steady and tend to ease the queasiness. Ginger (tea or a sweet) has decent evidence for calming nausea too."],
        actions:["Eat small and regular; try ginger tea when it hits"], bookRef:'Food / Blood Sugar', productSlot:null, source:'book' },
      { id:'log-nausea-3', severity:'caution',
        eyebrow:'Worth a gentle check',
        headline:"Persistent or severe nausea deserves a look",
        body:["Mild, cyclical nausea that passes is usually just hormonal. But nausea that's severe, constant, or doesn't track your cycle is a different matter and shouldn't simply be logged and ignored.",
          "If it's frequent, intense, or comes with other new symptoms, it's worth a doctor's conversation to rule out other causes \u2014 not a reason to panic, just a reason to ask."],
        actions:["If it's severe, constant, or not cycle-linked, see a doctor"], bookRef:'Cycle / When to See a Doctor', productSlot:null, source:'book' }
    ],

    'cramps': [
      { id:'log-cramps-1', severity:'info', headline:"Period cramps have a chemical driver \u2014 and a lever",
        body:["Menstrual cramps come largely from prostaglandins \u2014 compounds that make the womb contract to shed its lining. Higher levels mean stronger cramps, which is why some cycles hurt more than others.",
          "That's useful, because anti-inflammatory approaches work on exactly that pathway. Heat, gentle movement and an anti-inflammatory pattern of eating all genuinely help, rather than just masking the pain."],
        actions:["Heat on the lower belly and a short walk often ease cramps faster than lying still"], bookRef:'Cycle / The Period', productSlot:null, source:'book' },
      { id:'log-cramps-2', severity:'actionable', headline:"Magnesium and movement, not just painkillers",
        body:["When cramps hit, the reflex is straight to painkillers \u2014 and they have their place. But two gentler levers help many women, especially used ahead of time rather than once the pain peaks.",
          "Magnesium taken regularly can reduce cramp intensity over cycles, and light movement increases blood flow and eases the spasm. Neither replaces medical care for severe pain, but both work with the cause."],
        actions:["Consider magnesium across the month; move gently when cramps start"], bookRef:'Supplements / The Core Few', productSlot:'/recommends/magnesium', source:'book' },
      { id:'log-cramps-3', severity:'caution',
        eyebrow:'Worth a gentle check',
        headline:"Cramps that control your month aren't just 'bad luck'",
        body:["Some cramping is normal. But pain that regularly keeps you off work or out of life, that painkillers barely touch, or that has worsened over time, sits in a different category \u2014 and 'periods are just painful' has left too many women undiagnosed for years.",
          "Severe, life-disrupting cramps can signal conditions like endometriosis. If that's your pattern, track it and take the record to a doctor; ask directly whether it should be investigated."],
        actions:["If cramps regularly disrupt your life, track them and ask a doctor about endometriosis"], bookRef:'Cycle / When Pain Isn\u2019t Normal', productSlot:null, source:'book' }
    ],

    'heart_palpitations': [
      { id:'log-palp-1', severity:'info', headline:"Common in perimenopause \u2014 and still worth a mention",
        body:["A fluttering, skipping or pounding heart can be genuinely frightening, and in midlife it usually turns out to be benign \u2014 linked to the estrogen shifts of perimenopause rather than a heart problem.",
          "But 'common' doesn't mean 'ignore'. It's entirely reasonable to have palpitations checked once, both for peace of mind and to rule out other causes. Mentioning them at an appointment puts them on record without turning them into a crisis."],
        actions:["Mention them at your next appointment so they're on record"], bookRef:'Ch 11', productSlot:null, source:'book' },
      { id:'log-palp-2', severity:'info', headline:"Caffeine, alcohol and low sleep amplify them",
        body:["Before worrying, it's worth noticing what tends to precede them. In midlife, palpitations are often nudged along by stimulants, alcohol and short nights, layered on top of the underlying estrogen shifts.",
          "That makes a low-risk first experiment obvious: see whether they follow your coffee, your wine, or a poor night's sleep. Trimming the most likely trigger is a gentler starting point than alarm."],
        actions:["Notice whether they follow coffee, wine or poor sleep"], bookRef:'Ch 11 / Ch 13', productSlot:null, source:'book' },
      { id:'log-palp-3', severity:'info', headline:"Your breath can settle a racing heart",
        body:["When benign palpitations strike, there's something you can do in the moment: a slow, long exhale activates the vagus nerve, the body's brake, and can ease the racing.",
          "It does double duty, too \u2014 if the breathing calms things quickly, that also gently tells you anxiety is part of the picture, which points toward what helps. Breathe in for four, out for eight, and let your body come down."],
        actions:["Try a long exhale (in for 4, out for 8) when they start"], bookRef:'Ch 16', productSlot:null, source:'book' },
      { id:'log-palp-4', severity:'info', headline:"An overactive thyroid can speed the heart",
        body:["Most palpitations are harmless, but the company they keep can occasionally point elsewhere. When they come with heat intolerance, unexplained weight loss, or a persistently wired feeling, an overactive thyroid is worth ruling out.",
          "If that particular cluster fits you, it's a reason to ask for a thyroid check rather than simply tracking the palpitations \u2014 it's a clear, treatable cause that's easy to confirm with a blood test."],
        actions:["If they come with heat intolerance or weight loss, ask for a thyroid panel"], bookRef:'Ch 8', productSlot:null, source:'book' }
    ],

    /* metric-condition cards (not symptom-keyed) */
    '_lowSleep': [
      { id:'log-lowsleep-1', severity:'actionable', headline:"One short night, one clear move",
        body:["A single night under about six hours measurably raises cortisol and dulls your focus the next day \u2014 so if today feels foggy and frayed, last night is likely why. You're not imagining it.",
          "You can't undo the lost sleep, but you can steady the day: morning daylight resets your body clock faster than caffeine does. Then protect tonight rather than chasing a long lie-in, which tends to knock the rhythm sideways again."],
        actions:["10 minutes of daylight within an hour of waking","Protect tonight rather than chasing a lie-in"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-lowsleep-2', severity:'info', headline:"One bad night isn't the trend",
        body:["A single short night raises next-day cravings and cortisol, but it doesn't define your week or your health \u2014 the body is resilient to the occasional rough night.",
          "The real trap is over-correcting: a chaotic catch-up, a huge lie-in, an extra-late night to 'reset', all of which wreck tonight too. Keep today as normal as you can, and protect your usual bedtime tonight."],
        actions:["Keep today normal; protect tonight's usual bedtime"], bookRef:'Ch 15', productSlot:null, source:'book' },
      { id:'log-lowsleep-3', severity:'actionable', headline:"Caffeine after a bad night backfires",
        body:["The instinct after poor sleep is to lean hard on coffee \u2014 but that's exactly how one bad night becomes several. Caffeine to power through usually pushes tonight later, building a cycle.",
          "Keeping caffeine early and light protects the recovery night that actually fixes things. The coffee borrows from the very sleep you most need to repay."],
        actions:["Caffeine early and light today; no late-afternoon cups"], bookRef:'Ch 15 / Ch 13', productSlot:null, source:'book' },
      { id:'log-lowsleep-4', severity:'info', headline:"Naps have rules",
        body:["A nap can genuinely help after a short night \u2014 but only the right kind. A brief early-afternoon nap, under about thirty minutes, restores alertness without stealing from tonight.",
          "Go long or late, though, and it does the opposite: you wake groggy and find it harder to fall asleep that evening, deepening the problem. Short and early is the rule."],
        actions:["If you nap, keep it short and before mid-afternoon"], bookRef:'Ch 15', productSlot:null, source:'book' }
    ],
    '_lowEnergy': [
      { id:'log-lowen-1', severity:'info', headline:"Low days are data, not failure",
        body:["A flat, low-energy day isn't a verdict on you \u2014 energy naturally dips with your cycle, a poor night, or a stressful stretch. Today is one dot, not the whole graph.",
          "That's exactly why logging matters: the pattern across days tells you something a single reading can't. Keep marking the low days without judgement, and let the trend, not today, be what you read."],
        actions:["Keep logging; the trend matters more than today"], bookRef:'Ch 21', productSlot:null, source:'book' },
      { id:'log-lowen-2', severity:'actionable', headline:"On a flat day, move gently \u2014 don't grind",
        body:["When the tank is low, a punishing workout can dig the dip deeper, because your body reads it as one more stressor. The skill isn't pushing through; it's matching effort to what you've actually got.",
          "On a low day, a short walk in daylight restores more than a hard session takes \u2014 it lifts mood and energy without adding to the load. Gentle movement is the win today; the hard work keeps for a stronger day."],
        actions:["Choose a 10-20 minute walk over a hard session today"], bookRef:'Ch 14', productSlot:null, source:'book' },
      { id:'log-lowen-3', severity:'info', headline:"Flat energy often tracks the luteal phase",
        body:["Before judging a low-energy day, glance at where you are in your cycle. A dip in the week before your period is expected as progesterone falls \u2014 it's biology, not a failing.",
          "Knowing that lets you plan lighter days for that stretch rather than forcing through and feeling like you've fallen short. Working with the dip beats fighting it every time."],
        actions:["Check your cycle day before judging the day"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-lowen-4', severity:'info', headline:"Under-eating quietly reads as fatigue",
        body:["Sometimes 'tired' is really 'under-fuelled'. Skipping meals or simply eating too little leaves energy flat by the afternoon, and it's easy to reach for caffeine or rest instead of the actual fix.",
          "Before assuming you need more sleep or more coffee, check whether you've genuinely eaten enough today \u2014 especially protein, earlier in the day. For a lot of low-energy afternoons, food is the missing piece."],
        actions:["Check you've actually eaten enough, particularly protein"], bookRef:'Ch 13', productSlot:null, source:'book' }
    ],
    '_goodDay': [
      { id:'log-good-1', severity:'positive', headline:"A good day isn't random",
        body:["Steady energy and a clear head today probably aren't luck \u2014 they usually mean your sleep, food, movement and cycle phase quietly lined up.",
          "That's worth noticing, because it's how you learn to make more of them. A quick glance back at last night's sleep and where you are in your cycle turns a good day from a happy accident into useful information about what your body responds to."],
        actions:["Glance back at last night's sleep and where you are in your cycle"], bookRef:'Ch 21', productSlot:null, source:'book' },
      { id:'log-good-2', severity:'positive', headline:"You may be riding the follicular wave",
        body:["If energy and focus feel high, rising estrogen in the follicular phase \u2014 the week or two after your period \u2014 may be carrying you. It's the stretch when most women feel most themselves.",
          "Knowing that lets you spend it well: this is the natural week to take on the ambitious, demanding things and to train a little harder, while the hormonal tide is working with you rather than against you."],
        actions:["Front-load demanding work and harder workouts this week"], bookRef:'Ch 2', productSlot:null, source:'book' },
      { id:'log-good-3', severity:'positive', headline:"Worth banking what worked",
        body:["Good days tend to follow a recipe \u2014 a decent night's sleep, enough food, the right cycle phase \u2014 even when it feels like they just happened to you.",
          "Jotting down what preceded today (sleep, food, movement, cycle day) turns a lucky day into something you can deliberately recreate. Over time, those notes become your own personal manual for feeling good."],
        actions:["Jot what preceded today: sleep, food, movement, cycle day"], bookRef:'Ch 21', productSlot:null, source:'book' },
      { id:'log-good-4', severity:'positive', headline:"This is the day to build a habit",
        body:["Motivation rides higher when you feel good \u2014 and that lift is a resource worth spending wisely rather than just enjoying.",
          "Use today's energy on the thing your future self will thank you for: a workout, a few meals prepped, a walk booked in. Habits started on good days are the ones that carry you through the harder ones later."],
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
      { why:"A dip that lands on the same day each week is almost always about routine, not hormones. A heavier workday, a standing late night, weekend recovery, or a regular evening drink \u2014 something fixed in your week is leaving its mark. The good news is that fixed things are exactly the kind you can adjust.",
        action:"Look at what's fixed on that day, sleep, alcohol, workload, and adjust one thing.", bookRef:'Ch 16 / Ch 15', productSlot:null, source:'book' },
      { why:"Weekly dips tend to be behavioural rather than hormonal \u2014 Sunday-night dread, a hard gym day, or Friday drinks echoing into Saturday. Once you can name the recurring cause, it stops feeling like your body randomly letting you down and starts looking like a habit you can tweak.",
        action:"Pick the one fixed thing on that day and tweak it before assuming it's your body.", bookRef:'Ch 16', productSlot:null, source:'book' },
      { why:"Your body quietly keeps the score of your week. A low day that keeps recurring usually points to a recurring habit behind it \u2014 late nights, skipped meals, or a draining commitment that lands at the same point each time. Spotting the repeat is what lets you interrupt it.",
        action:"Protect sleep and meals specifically around that day.", bookRef:'Ch 16 / Ch 15', productSlot:null, source:'book' }
    ],
    'cycle_phase': [
      { why:"A symptom that clusters in one phase isn't random \u2014 it's your hormones running on schedule. In the luteal phase especially, the fall in progesterone in the final days predicts the shifts in mood, sleep and cravings you're seeing. Once you can see it coming, it stops ambushing you.",
        action:"Plan for it: protect sleep, ease caffeine and alcohol, and lower workout intensity in that phase.", bookRef:'Ch 2 - The Four Phases', productSlot:'/recommends/magnesium', source:'book' },
      { why:"Symptoms that cluster in one phase quietly turn a 'bad week' into a predictable, plannable one \u2014 and naming the phase is honestly half the relief. Knowing it's the luteal dip, not you falling apart, changes how you treat yourself through it.",
        action:"Pre-empt it: lighter plans, better sleep, less alcohol in that phase.", bookRef:'Ch 2', productSlot:null, source:'book' },
      { why:"Most cyclical symptoms peak in the luteal phase as progesterone falls, which is why the same handful of supports \u2014 sleep, magnesium, steady blood sugar \u2014 tend to help across the board rather than needing a different fix for each symptom. One routine covers a lot.",
        action:"Build a simple luteal-week routine you repeat each cycle.", bookRef:'Ch 2 / Ch 17', productSlot:'/recommends/magnesium', source:'book' }
    ],
    'sleep_energy': [
      { why:"Your data is showing what the science predicts: short sleep raises cortisol and lowers next-day insulin sensitivity, and in women this shows up fast. Sleep is the lever that quietly decides whether all your other efforts \u2014 food, movement, stress \u2014 actually work. It's the foundation the rest is built on.",
        action:"Consistent bed and wake times plus morning daylight are the highest-evidence levers; magnesium glycinate in the evening helps some.", bookRef:'Ch 15', productSlot:'/recommends/magnesium', source:'book' },
      { why:"Sleep sits upstream of almost everything \u2014 your mood, cravings, focus and energy all run downstream of last night. That's why it's the highest-leverage place to start: fixing it tends to lift several other things at once, while patching them individually rarely sticks if sleep is still short.",
        action:"Fix the bedtime before adding anything else.", bookRef:'Ch 15', productSlot:null, source:'book' },
      { why:"Your pattern suggests broken sleep is blunting your energy more than short-but-solid sleep would. Continuity \u2014 unbroken cycles of deep and dream sleep \u2014 is the real lever here, not just total hours in bed. Protecting against the wake-ups can matter more than going to bed earlier.",
        action:"Cool, dark room and a screen-free last hour to protect continuity.", bookRef:'Ch 15', productSlot:'/recommends/magnesium', source:'book' }
    ],
    'trend_improving': [
      { why:"A rising trend is real evidence that something you changed is working \u2014 and the body rewards consistency far more than intensity. The most useful thing you can do now is figure out what shifted, so it becomes something you can deliberately repeat rather than a happy accident.",
        action:"Note what shifted recently in sleep, food or movement, and keep it going.", bookRef:'Ch 21', productSlot:null, source:'book' },
      { why:"Improvement tends to compound quietly, a little at a time. The temptation when you see it is to pile on five new things at once \u2014 but the smarter move is to keep doing the one that's clearly working and let it keep building.",
        action:"Resist piling on, protect the current routine.", bookRef:'Ch 21', productSlot:null, source:'book' },
      { why:"An upward trend is proof your inputs are landing. It's worth remembering the body responds over weeks, not in dramatic single days \u2014 so this steady climb matters more than any one great or off day. Find the change that mattered most and guard it.",
        action:"Identify the one change that mattered most and guard it.", bookRef:'Ch 21', productSlot:null, source:'book' }
    ],
    'trend_declining': [
      { why:"A dip across a week almost always traces to something upstream \u2014 sleep slipping, stress climbing, or a change in routine \u2014 rather than anything random or wrong with you. That's reassuring, because upstream causes are findable, and usually fixable, once you go looking.",
        action:"Check the basics first: sleep continuity, evening alcohol, and stress load over the last week.", bookRef:'Ch 21 / Ch 16', productSlot:null, source:'book' },
      { why:"A downtrend is information, not failure. It usually follows a busy or disrupted stretch \u2014 your body's way of asking for the basics back rather than a sign you've lost progress. Treat it as a nudge to return to foundations, not a verdict.",
        action:"Return to foundations: sleep, a meal rhythm, and a daily walk.", bookRef:'Ch 21', productSlot:null, source:'book' },
      { why:"Dips rarely come from nowhere. The most useful move is to look one step upstream, at what changed in the days before the slide started \u2014 that's almost always where the real cause is hiding, not in the low days themselves.",
        action:"Audit last week's sleep and stress before changing anything big.", bookRef:'Ch 16', productSlot:null, source:'book' }
    ],
    'symptom_frequency': [
      { why:"A symptom showing up on most days is worth understanding rather than just enduring \u2014 at that frequency, it's usually mapping to one of the specific hormonal patterns your type is prone to, not random bad luck. Naming the driver is what turns 'just how I am' into something you can actually act on.",
        action:"Your hormone-type chapter in The Hormone Blueprint covers this directly; if it persists, it's worth a doctor's conversation.", bookRef:'Ch 4', productSlot:null, source:'book' },
      { why:"A symptom that turns up most days has crossed the line from background noise into a real signal. At that point it's worth finding the driver rather than quietly absorbing it indefinitely \u2014 and the timing of when it's worst is often the biggest clue.",
        action:"Track when it's worst, that timing is what a doctor can actually use.", bookRef:'Ch 4 / Ch 5', productSlot:null, source:'book' },
      { why:"Frequent symptoms are the body repeating itself until you listen. Most of them map to a known hormonal pattern with real, specific levers behind it \u2014 which means a persistent symptom is usually a solvable puzzle, not a permanent fixture.",
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
          bookRef:'Sleep', productSlot:'/recommends/magnesium', source:'book+web' },
        { id:'dl-sleep-first-half', category:'sleep', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Going to bed late costs you more than waking early does",
          body:[
            "We tend to treat all hours of sleep as equal \u2014 as if seven hours is seven hours, whenever you get them. Your brain doesn\u2019t see it that way. The most physically restorative sleep is loaded into the first half of the night, which means the hours you skip by going to bed late are the most valuable ones you own.",
            "In that early deep sleep, growth hormone surges to repair skin, muscle and bone, and the brain runs its overnight cleaning cycle, flushing out the by-products that build up during the day. Push your bedtime back by two hours and you don\u2019t just lose two hours \u2014 you lose a disproportionate share of the deepest, most repairing sleep.",
            "This is also why \u201CI\u2019ll catch up at the weekend\u201D never quite works. You can recover some lost sleep, but the precise architecture \u2014 deep sleep early, dream sleep later \u2014 is hard to replay on demand."
          ],
          action:"One thing to try: move your bedtime fifteen minutes earlier this week, not your wake time. The front end of the night is where the repair happens.",
          bookRef:'Sleep', productSlot:null, source:'book' },
        { id:'dl-sleep-consistency', category:'sleep', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The most powerful sleep change is also the most boring one",
          body:[
            "Sleep advice usually arrives as a long list \u2014 blackout blinds, magnesium, no screens, cooler room, the right pillow. Some of it helps. But the single intervention with the strongest evidence behind it isn\u2019t a product at all, and it\u2019s almost dull: going to bed and waking up at roughly the same time, seven days a week.",
            "Your body runs on a clock, and that clock craves regularity more than it craves any one perfect night. Wildly different bedtimes and a wall-the-way-to-noon lie-in at weekends leave the clock guessing, which is part of why Sunday nights so often sleep badly.",
            "The second most powerful lever pairs with the first: daylight on your face within an hour of waking. Morning light is the strongest signal your brain has for setting the whole 24-hour rhythm \u2014 and it\u2019s free."
          ],
          action:"One thing to try: pick a wake-up time you can keep every day, including weekends, within about half an hour \u2014 and get outside, even briefly, soon after. Boring, and it works.",
          bookRef:'Sleep', productSlot:null, source:'book' },
        { id:'dl-sleep-caffeine', category:'sleep', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your afternoon coffee is still working at bedtime",
          body:[
            "A 3 p.m. coffee feels harmless \u2014 you\u2019ll be wide awake for hours, and surely it\u2019ll have worn off by bed. The catch is how slowly caffeine actually leaves: roughly half of it is still in your system five to six hours later, and a meaningful amount lingers well into the night.",
            "Even when it doesn\u2019t stop you falling asleep, that residue can quietly flatten the deep, restorative stages \u2014 so you sleep, but wake less rested. And as you move through your late thirties and forties, many women find they simply tolerate caffeine less well than they used to.",
            "You don\u2019t have to give it up. You mostly have to move it earlier, so the curve has fallen by the time you\u2019re trying to wind down."
          ],
          action:"One thing to try: make your last caffeine an early-afternoon cut-off \u2014 around 2 p.m. for many people \u2014 and see whether your sleep feels deeper within a week.",
          bookRef:'Sleep / What Actually Works', productSlot:null, source:'book' },
        { id:'dl-sleep-continuous', category:'sleep', severity:'positive',
          eyebrow:'Something to sit with today',
          headline:"You don\u2019t need eight perfect hours",
          body:[
            "The number \u201Ceight hours\u201D has become a stick women beat themselves with \u2014 lying awake doing anxious maths about how little is left, which of course makes sleep harder still. It\u2019s worth loosening the grip on that single figure.",
            "What your body actually prizes is continuous sleep at least as much as total hours. Seven solid, unbroken hours often does more for you than eight that are fragmented. Chasing a perfect number can matter less than protecting the quality of the sleep you do get.",
            "And one bad night is not a catastrophe. The body is resilient; it\u2019s the long-term pattern that shapes your hormones, not any single night. Releasing the pressure can, paradoxically, be part of sleeping better."
          ],
          action:"One thing to let go of tonight: the perfect-eight-hours scorecard. Aim for unbroken and good-enough, and don\u2019t let one rough night become a worry that ruins the next.",
          bookRef:'Sleep / What Happens During the Stages', productSlot:null, source:'book' }
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
          bookRef:'Food / The Four Foundations', productSlot:null, source:'book' },
        { id:'dl-nutrition-caffeine-luteal', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why your coffee hits differently before your period",
          body:[
            "Some weeks your usual coffee is a friendly lift; other weeks the same cup leaves you jittery, anxious, and wide awake at night. If that swing seems to track your cycle, it isn\u2019t your imagination \u2014 it\u2019s the luteal phase changing how caffeine lands.",
            "In the back half of your cycle, as progesterone falls, your buffer against stimulation thins and your nervous system runs a little more reactive. The same caffeine that felt fine in your follicular week can now tip you into anxiety and disrupted sleep \u2014 the very things that already worsen premenstrually.",
            "So it isn\u2019t that you suddenly can\u2019t handle coffee. It\u2019s that the dose your body tolerates comfortably shifts across the month, and the pre-period stretch is when it\u2019s lowest."
          ],
          action:"One thing to try: in your pre-period week, ease back on caffeine \u2014 a smaller cup, or an earlier cut-off. Notice whether the premenstrual anxiety and poor sleep soften.",
          bookRef:'Food / What to Drink, What to Limit', productSlot:null, source:'book' },
        { id:'dl-nutrition-iron', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"If you\u2019re wiped out and your periods are heavy, check your iron",
          body:[
            "Bone-deep fatigue, breathlessness on the stairs, a foggy head, hair shedding, feeling cold \u2014 it\u2019s easy to pin all of this on stress or hormones. But there\u2019s a common, very fixable cause that often hides underneath, especially for women with heavy periods: low iron.",
            "Every heavy period is a real loss of iron, and over months it can quietly drain your stores. Crucially, you can be iron-deficient \u2014 with low ferritin, the storage form \u2014 well before you\u2019re technically anaemic, and feel terrible the whole time. A standard \u201Cnormal\u201D blood count can miss it if ferritin isn\u2019t checked.",
            "This matters because the fix can be genuinely transformative, and because chasing the wrong cause leaves you stuck. Iron is also something to be deliberate about rather than guess at \u2014 too much is a problem too, so it\u2019s worth testing rather than self-supplementing blindly."
          ],
          action:"One thing to do if heavy periods and deep fatigue go together: ask your doctor to check your ferritin specifically, not just a basic blood count. It\u2019s a common miss with a real fix.",
          bookRef:'Cycle / Heavy Bleeding', productSlot:null, source:'book' },
        { id:'dl-nutrition-hydration', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Dehydration quietly mimics symptoms you\u2019re chasing",
          body:[
            "Before assuming a foggy, headachy, low-energy afternoon is hormonal or some deeper problem, it\u2019s worth ruling out the most boring possibility: you might simply be under-hydrated. It\u2019s unglamorous, easy to dismiss, and genuinely common.",
            "Mild dehydration can produce fatigue, headaches, poor concentration and irritability \u2014 a near-perfect overlap with the very symptoms women spend a lot of energy trying to explain. Coffee and tea, leaned on through a busy day, are mild diuretics, which can tip the balance further.",
            "This isn\u2019t about forcing litres or chasing a trendy number. It\u2019s about noticing whether \u201Ctired and foggy by mid-afternoon\u201D eases with a glass of water before you reach for a more complicated explanation."
          ],
          action:"One thing to test this week: when the afternoon slump hits, drink a glass of water first and wait ten minutes. Sometimes the simplest fix has been hiding under the complicated ones.",
          bookRef:'Food / What to Drink, What to Limit', productSlot:null, source:'book' },
        { id:'dl-nutrition-fasting', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why intermittent fasting can backfire for women",
          body:[
            "Intermittent fasting is everywhere, usually sold as a simple fix for weight and metabolism. What rarely gets mentioned is that most of the enthusiastic advice is built on studies in men \u2014 and women\u2019s bodies respond to going without food quite differently.",
            "Women are more sensitive to signals of energy scarcity. A long fast can read to your body as a stressor, nudging cortisol up and, especially in the second half of the cycle, suppressing progesterone and disturbing ovulation, sleep and mood. In perimenopause, when estrogen no longer buffers stress as well, that backfire effect tends to be stronger \u2014 the very symptoms you\u2019re trying to fix can get worse.",
            "This isn\u2019t a blanket no. It\u2019s a \u201Cwomen need a gentler version.\u201D A modest overnight fast (say 12 hours) is fine for most; the long, aggressive fasts, and especially fasting hard in your pre-period week, are where it tends to go wrong."
          ],
          action:"One thing to keep in mind: if you fast, keep it gentle (around a 12-hour overnight window), eat enough in your eating window, and ease off in your pre-period week. Feeling worse is a signal, not a discipline problem.",
          bookRef:'Food / Energy Availability', productSlot:null, source:'book+web' },
        { id:'dl-nutrition-gut-mood', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your gut has more to do with your mood than you\u2019d think",
          body:[
            "We talk about mood as if it lives entirely in the head, but a surprising amount of the chemistry involved is made further down \u2014 in the gut. The majority of your serotonin, the calm-and-contentment messenger, is produced in the digestive tract, and the bacteria living there are deeply involved.",
            "When the gut\u2019s bacterial balance is off \u2014 from stress, poor sleep, low fibre, heavy alcohol \u2014 it can ripple upward into low mood, anxiety and brain fog, as well as bloating and irregular digestion. The gut and brain are in constant two-way conversation, which is why \u201Cgut feelings\u201D aren\u2019t just a figure of speech.",
            "The practical upshot is encouraging: the same things that support estrogen clearance also feed a healthier gut \u2014 fibre, fermented foods, less alcohol \u2014 so tending your gut quietly supports your mood at the same time."
          ],
          action:"One thing to add: a small daily source of fermented food \u2014 live yogurt, kefir, sauerkraut, kimchi \u2014 alongside your fibre. You\u2019re feeding the bacteria that help make you feel steady.",
          bookRef:'Food / Fibre & Estrogen Clearance', productSlot:null, source:'book' },
        { id:'dl-nutrition-anti-inflammatory', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The eating pattern that helps almost every hormone issue",
          body:[
            "Faced with PMS, endometriosis pain, PCOS, perimenopausal symptoms \u2014 it can feel like each needs its own special diet. In reality, beneath most of them sits a shared theme: chronic low-grade inflammation. And one broad eating pattern helps across all of them.",
            "It\u2019s nothing exotic \u2014 essentially the traditional Mediterranean way of eating: plenty of vegetables and fruit, oily fish, olive oil, nuts, beans and whole grains, with far less ultra-processed food. This pattern lowers inflammation and supports steadier blood sugar, which is why it shows up again and again in the research on women\u2019s hormonal conditions.",
            "You don\u2019t need to adopt a label or overhaul everything overnight. Nudging your plates in this direction \u2014 more plants and good fats, less ultra-processed \u2014 quietly helps several problems at once."
          ],
          action:"One thing to try: build one more meal this week around vegetables, a good fat (olive oil, oily fish) and some protein. Direction toward anti-inflammatory eating, not perfection.",
          bookRef:'Food / The Anti-Inflammatory Pattern', productSlot:null, source:'book' },
        { id:'dl-nutrition-soy', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Is soy bad for your hormones? The honest answer",
          body:[
            "Soy has spent years on a list of foods women are quietly warned to fear \u2014 the worry being that, because it contains plant compounds called phytoestrogens, it must act like estrogen in the body and stir up trouble. It\u2019s one of the more persistent food myths in women\u2019s health.",
            "The reality is gentler. Phytoestrogens are weak, plant-derived compounds that are not the same as your own estrogen and are far less potent. For most women, moderate amounts of whole soy foods \u2014 edamame, tofu, tempeh, soy milk \u2014 are safe, and the broader evidence leans toward neutral-to-helpful, including for mild menopausal symptoms in some women.",
            "As with most things, form and amount matter more than the headline: whole soy foods in normal amounts are a world away from heavily processed soy isolates eaten in excess. If you tolerate it, it\u2019s a perfectly good protein source."
          ],
          action:"One thing to let go of: the blanket fear of soy. Whole soy foods \u2014 edamame, tofu, tempeh \u2014 in normal amounts are fine for most women, and a useful protein option if you enjoy them.",
          bookRef:'Food / Phytoestrogens', productSlot:null, source:'book+web' }
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
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-self-trust', category:'mindset', severity:'positive',
          eyebrow:'Something to sit with today',
          headline:"Self-trust is a practice, not a personality you\u2019re born with",
          body:[
            "It\u2019s easy to assume some women are just naturally confident about their bodies \u2014 that they came pre-loaded with the certainty to push back, ask again, refuse to be brushed off. Mostly, they didn\u2019t. Self-trust isn\u2019t a trait you either have or lack. It\u2019s a skill, and it\u2019s built one small choice at a time.",
            "It strengthens every time you honour what your body is telling you instead of overriding it: resting when you\u2019re genuinely depleted instead of pushing through, eating when you\u2019re hungry, noticing that a particular food leaves you flat, mentioning the symptom even though you suspect you\u2019ll be told it\u2019s nothing.",
            "None of these are dramatic. That\u2019s the point. The quiet, repeated act of taking your own experience seriously is what compounds \u2014 until one day you realise you no longer talk yourself out of what you can plainly feel."
          ],
          action:"One small act today: notice one thing your body is telling you \u2014 tired, hungry, tense, off \u2014 and respond to it instead of overriding it. That\u2019s the practice.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-tell-the-next-woman', category:'mindset', severity:'positive',
          eyebrow:'Something to sit with today',
          headline:"The silence around this can end with you",
          body:[
            "Think about what it would have meant to understand your own cycle at twenty instead of forty \u2014 or to walk into perimenopause knowing what was coming, rather than quietly fearing you were losing your mind. Most of us were never told. The information simply wasn\u2019t passed down.",
            "You can\u2019t change what you weren\u2019t told. But you can be the one who tells the next woman \u2014 a daughter, a younger colleague, a friend who\u2019s started saying the same confused things you once did \u2014 so that she doesn\u2019t spend years dismissed and bewildered the way so many before her did.",
            "There is something quietly powerful in that. The knowledge you\u2019re building for yourself, day by day, doesn\u2019t have to stop with you."
          ],
          action:"One thing to consider: the next time a woman near you describes something that sounds familiar, share what you\u2019ve learned. Recognition from one person can change someone\u2019s whole year.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-not-controlling', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"Understanding your body isn\u2019t the same as controlling it",
          body:[
            "It\u2019s tempting, once you start learning how your hormones work, to expect that knowledge to translate into control \u2014 that if you just track carefully enough and do everything right, your body will fall into line. It won\u2019t, not entirely, and holding that expectation can turn a helpful practice into another source of pressure.",
            "Some days will be harder for reasons you can\u2019t fully trace. A phase, a poor night, a stretch of stress, or simply being human. Tracking is here to reveal patterns and help you respond with more kindness and better timing \u2014 not to grade your performance.",
            "The aim is a working relationship with your body, not authority over it. You\u2019re learning its language so you can cooperate with it, not so you can force it to behave."
          ],
          action:"One thing to release today: the idea that a hard day means you did something wrong. Note it, be gentle with it, and let the pattern \u2014 not the single day \u2014 be the teacher.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-comparison', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"You\u2019re comparing your insides to everyone else\u2019s outsides",
          body:[
            "It\u2019s a strange feature of modern life that you can feel exhausted, foggy and stretched thin while scrolling past a steady stream of women who appear to be thriving \u2014 glowing, organised, energetic. The quiet conclusion is that something must be wrong with you specifically.",
            "But you\u2019re comparing the full, unedited experience of your own body \u2014 the bad nights, the mood dips, the days you can barely think \u2014 against other people\u2019s carefully chosen highlights. Almost no one posts the 3 a.m. waking or the irritable luteal week. The comparison is rigged from the start.",
            "Naming that can take some of its sting out. Most women you envy are managing their own invisible version of exactly what you\u2019re managing. You\u2019re not behind; you\u2019re just seeing the edited version of everyone else."
          ],
          action:"One thing to try: next time a feed leaves you feeling behind, remind yourself you\u2019re seeing someone\u2019s highlight reel, not their full day. Then put the phone down for a bit.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-mental-load', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"The invisible work that never clocks off",
          body:[
            "Beyond the visible tasks sits a quieter kind of work: remembering the appointments, anticipating what everyone will need, holding the running list of the household in your head. It rarely gets named, it doesn\u2019t show up on any rota \u2014 and it is genuinely tiring in a way that\u2019s easy to dismiss.",
            "This mental load is a real, low-grade stressor. Your nervous system doesn\u2019t distinguish between a heavy physical day and a mind that never gets to put the list down. Carried for years, it\u2019s part of the background activation that keeps cortisol quietly elevated.",
            "Recognising it is the first step, because what has no name can\u2019t be shared or eased. The load being invisible doesn\u2019t make it weightless \u2014 and it doesn\u2019t have to be carried alone."
          ],
          action:"One thing to try: pick one piece of the mental load to genuinely hand over \u2014 not the task, the responsibility for remembering it. Naming it out loud is where sharing it begins.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-libido', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"A faded libido isn\u2019t a character flaw \u2014 or a verdict on your relationship",
          body:[
            "When desire quietly fades, the explanations women reach for are rarely kind: something\u2019s wrong with me, with us, with how I feel about my partner. That self-blame adds a second layer of pain on top of the first, and it\u2019s usually misplaced.",
            "Libido is genuinely multi-layered. Falling estrogen and testosterone play a direct part, but so do poor sleep, chronic stress, exhaustion, pain or dryness with intimacy, and simply never having a moment when your nervous system feels safe and unhurried. Desire is one of the first things to switch off when the body is depleted \u2014 by design.",
            "Which means it\u2019s often recoverable, and not by trying to force it. Addressing the underlying load \u2014 sleep, stress, comfort, and where relevant the hormonal side \u2014 tends to do more than willpower ever could."
          ],
          action:"One thing to reframe: low desire is usually a signal about your overall load, not a flaw in you or your relationship. Tend the load \u2014 and raise dryness or hormonal causes with a doctor, because both are treatable.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-body-image', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"Your body is changing its terms, not failing you",
          body:[
            "It\u2019s a particular kind of grief when the body you knew how to live in starts behaving differently \u2014 a shape that shifts, a stamina that wavers, a reflection that surprises you. The instinct is to read it as decline, or as something you\u2019ve let happen.",
            "But a body moving through hormonal change isn\u2019t broken or neglected; it\u2019s renegotiating its terms. The same effort gives different results now, and the goalposts have genuinely moved. Holding your body to the standards of your twenties is a fight you can\u2019t win and didn\u2019t sign up for.",
            "There\u2019s more room for ease here than it first seems. A body you treat as an ally to support \u2014 fed, moved, rested, spoken to kindly \u2014 tends to give back more than one you treat as a project to fix or a problem to punish."
          ],
          action:"One thing to try today: speak to your body the way you\u2019d speak to a friend going through the same change. Support, not punishment, is also the more effective strategy.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-being-heard', category:'mindset', severity:'info',
          eyebrow:'Something to learn today',
          headline:"How to be taken seriously when you describe what you feel",
          body:[
            "Walking out of an appointment feeling unheard is one of the most common and demoralising experiences in women\u2019s health. Often it isn\u2019t that nothing is wrong \u2014 it\u2019s that vague, apologetic descriptions are easy to wave away in a rushed ten minutes.",
            "A little preparation shifts the odds. Bringing specifics \u2014 how long, how often, how much it\u2019s affecting your work, sleep or relationships \u2014 turns \u201CI\u2019ve been tired\u201D into something a clinician has to engage with. A short symptom log, and naming your top one or two concerns up front, does a surprising amount of work.",
            "And if you\u2019re still dismissed, that\u2019s information about the clinician, not a verdict on your symptoms. Asking one more question, or seeking another opinion, isn\u2019t being difficult \u2014 it\u2019s what informed people do."
          ],
          action:"One thing to do before your next appointment: write your top two concerns and a few specifics \u2014 duration, frequency, impact \u2014 and lead with them. Specific is harder to dismiss than vague.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-mindset-rest', category:'mindset', severity:'positive',
          eyebrow:'Something to sit with today',
          headline:"Rest is doing something \u2014 it just doesn\u2019t look like it",
          body:[
            "Most of us absorbed the idea that worth is measured in output, and that rest has to be earned by first finishing everything. Since the list is never finished, rest gets endlessly deferred \u2014 and the body pays for it in elevated stress chemistry that quietly worsens nearly every hormonal symptom.",
            "But rest isn\u2019t the absence of productivity; it\u2019s the part where your body actually repairs and rebalances. Deep sleep is when tissue is repaired. Downtime is when your nervous system shifts out of the stress state and lets cortisol fall. The recovery is the work \u2014 it just doesn\u2019t show up on a to-do list.",
            "Reframing rest as legitimate, even necessary, is one of the more quietly radical things you can do for your hormones \u2014 especially in a stage of life where stress amplifies everything."
          ],
          action:"One thing to try today: take a small rest you haven\u2019t \u201Cearned\u201D \u2014 ten minutes, no task, no guilt. Treat it as part of the work your body is doing, because it is.",
          bookRef:null, productSlot:null, source:'book' }
      ],
      stress: [
        { id:'dl-stress-tired-wired', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"\u201CTired but wired\u201D is a pattern, not a personality",
          body:[
            "Exhausted on waking, foggy by mid-afternoon, then suddenly alert at 11 p.m. when you finally want to sleep. If that\u2019s your daily shape, it isn\u2019t a quirk of your temperament \u2014 it\u2019s a recognisable cortisol pattern, and it has a mechanism.",
            "Cortisol is meant to follow a clean daily curve: high in the morning to lift you out of bed, tapering down through the day, low at night so you can sleep. Under months of low-grade stress that curve flattens and shifts \u2014 the morning peak goes missing, and the evening level stays stubbornly up. The result is the exact \u201Ctired but wired\u201D feeling so many women describe.",
            "The reassuring part: this is a rhythm problem, not damage. The same things that lower the background load \u2014 protected sleep, gentler mornings, less late-night stimulation \u2014 help the curve settle back toward where it belongs."
          ],
          action:"One thing to try: give the last hour before bed to winding down rather than catching up \u2014 dim lights, no inbox, nothing that spikes you. You\u2019re helping the evening cortisol fall.",
          bookRef:'Stress / The Adrenals & Cortisol', productSlot:'/recommends/ashwagandha', source:'book+web' },
        { id:'dl-stress-progesterone-first', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why stress reaches your hormones through progesterone first",
          body:[
            "When life gets relentlessly stressful, many women notice their PMS gets worse, their sleep frays, and anxiety creeps up \u2014 and assume those are separate problems. They\u2019re often the same problem, arriving through one shared doorway: progesterone.",
            "Progesterone and cortisol are built from a shared raw material. Under sustained stress, the body prioritises making cortisol, and progesterone \u2014 your calming, sleep-supporting hormone \u2014 tends to lose out, especially in the second half of the cycle. Lower progesterone means more anxiety, lighter sleep, and sharper PMS.",
            "This is why \u201Cjust manage your stress\u201D isn\u2019t a throwaway line for women. Stress isn\u2019t only in your head; it has a direct, traceable route into the hormones that shape how the rest of your month feels."
          ],
          action:"One thing to notice: if your worst hormonal weeks line up with your most stressful ones, that\u2019s not a coincidence \u2014 it\u2019s a lever. Protecting the stressful weeks protects the hormones too.",
          bookRef:'Stress / How Chronic Stress Hijacks Female Hormones', productSlot:null, source:'book' },
        { id:'dl-stress-background', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The stress you don\u2019t notice is the kind doing the damage",
          body:[
            "We picture stress as a crisis \u2014 a deadline, an argument, an emergency. But your body handles those just fine; it spikes, deals with it, and recovers. The kind that quietly wears women down is the opposite: low, constant, and barely noticed.",
            "The open inbox, the background worry about ageing parents, the scheduling that never quite resolves, the news on your phone at 11 p.m. None of it is life-threatening, so none of it triggers obvious alarm. But it keeps the stress system mildly switched on for years, never fully letting the body drop into its rest-and-repair mode.",
            "Naming it matters, because you can\u2019t soften a pressure you haven\u2019t noticed. The goal isn\u2019t a stress-free life \u2014 it\u2019s a nervous system that gets to switch off completely, at least sometimes, every day."
          ],
          action:"One thing to try today: build in one genuine off-switch \u2014 ten minutes with no screen, no task, no input. Not a reward for finishing everything; a deliberate full stop.",
          bookRef:null, productSlot:null, source:'book' },
        { id:'dl-stress-predator', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your body can\u2019t tell a deadline from a predator",
          body:[
            "The stress response is ancient and beautifully designed \u2014 for a sprint away from danger. Heart rate up, blood sugar mobilised, digestion and repair paused, all in seconds. It\u2019s built to fire briefly and then switch off, handing back to the calm \u201Crest and digest\u201D state where most of life is meant to be lived.",
            "The trouble is that your body runs the identical programme whether you\u2019re facing an actual threat or simply a full inbox and a difficult message. It can\u2019t tell the difference. So in modern life the alarm fires many times a day and rarely gets the all-clear.",
            "Which means the most useful skill isn\u2019t avoiding stress \u2014 it\u2019s actively signalling safety to your body so it can stand down. Slow breathing, a walk, a warm shower, unhurried time with people you trust: these are how you tell the system the sprint is over."
          ],
          action:"One thing to try: a single round of slow breathing \u2014 in for four, out for six, for a couple of minutes. A longer out-breath is one of the fastest ways to tell your body it\u2019s safe.",
          bookRef:'Stress / The Two Nervous-System States', productSlot:null, source:'book' },
        { id:'dl-stress-not-luxury', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Managing stress isn\u2019t self-indulgent \u2014 it\u2019s hormonal infrastructure",
          body:[
            "Of all the hormone advice women are given, stress management is the one most easily filed under \u201Cnice if I had the time.\u201D It tends to be the first thing dropped when life gets full. That ranking is exactly backwards.",
            "Cortisol sits upstream of almost everything else. When it\u2019s chronically high it suppresses thyroid function, knocks progesterone down, worsens insulin sensitivity, and amplifies just about every perimenopausal symptom on the list. Get cortisol into a better rhythm and a surprising number of other things ease at once.",
            "So the calm walk, the protected sleep, the boundary you set \u2014 these aren\u2019t indulgences you earn after the real work. For your hormones, they are the real work."
          ],
          action:"One thing to reframe today: treat one small recovery habit as non-negotiable, the way you would a medication \u2014 not as something you\u2019ll get to if there\u2019s time left over. Magnesium in the evening can support the same wind-down.",
          bookRef:'Stress / Why It Amplifies Everything', productSlot:'/recommends/magnesium', source:'book' },
        { id:'dl-stress-boundaries', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"A boundary is a physiological act, not just a personality trait",
          body:[
            "Saying no, declining the extra thing, leaving the message until tomorrow \u2014 these get framed as matters of confidence or character. But for your nervous system, a boundary is something more concrete: it\u2019s a way of lowering the actual demand your body is responding to.",
            "Your stress response reacts to perceived load \u2014 the sheer volume of things asking for you at once. Every commitment you decline is one fewer signal telling your body to stay switched on. In that sense, protecting your time isn\u2019t self-indulgence; it\u2019s directly lowering the cortisol cost of your week.",
            "This reframe can make boundaries feel less like selfishness and more like maintenance. You\u2019re not letting people down \u2014 you\u2019re keeping the system that runs everything else from running hot."
          ],
          action:"One thing to try this week: decline one optional thing without over-explaining. Notice that the world holds, and your body gets a little of its capacity back.",
          bookRef:'Stress / Regulating the Response', productSlot:null, source:'book' },
        { id:'dl-stress-nature', category:'stress', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"Ten minutes outside does measurable work",
          body:[
            "When you\u2019re stretched thin, \u201Cgo outside\u201D can sound almost insultingly simple. But time outdoors is one of the most reliable, lowest-effort ways to nudge your stress physiology in the right direction \u2014 and it costs nothing.",
            "Daylight helps set the body clock that governs sleep and cortisol rhythm, gentle movement burns off some of the stress chemistry, and there\u2019s good evidence that time in green space lowers stress markers and lifts mood beyond what the walking alone explains. It\u2019s a surprising amount of return for ten minutes.",
            "It doesn\u2019t need to be a hike or a project. A short walk around the block, a coffee taken outside, a few minutes of sky \u2014 done most days, it adds up to real regulation."
          ],
          action:"One thing to try today: ten minutes outside, ideally earlier in the day. Not as an item to achieve \u2014 as a small, deliberate reset for your nervous system.",
          bookRef:'Stress / Regulating the Response', productSlot:null, source:'book' }
      ],
      cycle: [
        { id:'dl-cycle-vital-sign', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Your cycle is a monthly health report \u2014 read it",
          body:[
            "Most of us were raised to see a period as something to manage and otherwise ignore. But in 2015 the main body of women\u2019s health doctors formally called the menstrual cycle a vital sign \u2014 as clinically meaningful as your blood pressure or heart rate. That framing still stands, and almost no one acts on it.",
            "The reason is simple: changes in your cycle\u2019s length, flow or regularity are often the earliest visible sign of something shifting \u2014 thyroid issues, PCOS, perimenopause, stress, under-eating. A cycle that suddenly changes is rarely \u201Cjust one of those things.\u201D It\u2019s information arriving early, while there\u2019s still room to respond.",
            "Whether or not you ever want children, the cycle is the most reliable monthly readout your body gives you. Tracking it isn\u2019t about fertility \u2014 it\u2019s about noticing your own baseline so you can spot when it moves."
          ],
          action:"One thing to start: note the basics each cycle \u2014 first day, length, how the flow and your mood felt. A few months of this turns vague worry into a clear pattern.",
          bookRef:'Cycle / The Cycle Is a Vital Sign', productSlot:null, source:'book' },
        { id:'dl-cycle-two-halves', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why you can feel like two different people in one month",
          body:[
            "If some weeks you feel sharp, social and unstoppable, and others you feel like a quieter, more fragile stranger in the same body \u2014 you\u2019re not imagining it, and you\u2019re not inconsistent. You\u2019re cycling, and the two halves of your cycle have genuinely different hormonal weather.",
            "In the first half, the follicular phase, estrogen climbs. It lifts mood, sharpens the mind, and steadies energy \u2014 which is why most women feel most themselves in the second week. After ovulation comes the luteal phase, when progesterone takes over: calming at first, then dropping sharply in the final days before your period, which is when mood, sleep and patience often dip.",
            "Seeing this rhythm changes how you read yourself. The \u201Coff\u201D week usually isn\u2019t a personal failing \u2014 it\u2019s a predictable phase, and predictable things can be planned for."
          ],
          action:"One thing to try: next time you feel unexpectedly flat or irritable, check where you are in your cycle before you blame yourself. The timing is often the whole explanation.",
          bookRef:'Cycle / The Two Halves', productSlot:null, source:'book' },
        { id:'dl-cycle-follicular', category:'cycle', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"There\u2019s a week built for taking on the hard things",
          body:[
            "In the week or so after your period ends, rising estrogen tends to bring steadier energy, clearer thinking, deeper sleep, and more social confidence. For most women this follicular stretch is the easiest week of the month \u2014 and it\u2019s quietly useful to know that in advance.",
            "Because if this is when your brain and body are most willing, it\u2019s the natural time to front-load the demanding things: the big presentation, the hard conversation you\u2019ve been putting off, the tougher workouts, the project that needs real focus. You\u2019re working with the hormonal tide instead of against it.",
            "None of this is rigid \u2014 life rarely lines up neatly with a calendar. But even loosely aiming your hardest tasks at your strongest week can make them feel meaningfully less heavy."
          ],
          action:"One thing to try this cycle: when energy lifts after your period, deliberately schedule one demanding thing into that window rather than dreading it on a low week.",
          bookRef:'Cycle / The Four Phases', productSlot:null, source:'book' },
        { id:'dl-cycle-luteal', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The week to plan for, not fight your way through",
          body:[
            "The luteal phase \u2014 the stretch between ovulation and your period \u2014 is where the trouble tends to gather: lower patience, lighter sleep, cravings, a shorter fuse. The usual response is to grit through it and feel bad about \u201Cslipping.\u201D There\u2019s a kinder, more effective option: plan for it.",
            "As progesterone falls in these days, your tolerance for the usual stressors drops with it. Caffeine hits harder, alcohol disrupts sleep more, blood sugar swings feel worse, and a packed schedule lands heavier. None of that is weakness \u2014 it\u2019s a lower threshold, on schedule.",
            "Knowing it\u2019s coming lets you soften the inputs in advance: steadier meals, a little less caffeine and alcohol, gentler workouts, fewer optional commitments. The same week feels very different when you stop fighting it."
          ],
          action:"One thing to try: in your pre-period week, ease off caffeine and alcohol, protect your sleep, and consider magnesium in the evening. You\u2019re lowering the load before the threshold drops.",
          bookRef:'Cycle / The Luteal Phase', productSlot:'/recommends/magnesium', source:'book' },
        { id:'dl-cycle-not-day-14', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Ovulation isn\u2019t always day 14 \u2014 and that matters",
          body:[
            "Generations of women learned the textbook version: ovulation on day 14, a tidy 28-day cycle. It\u2019s a neat diagram, and for many women it\u2019s simply not true. Newer research shows the first half of the cycle varies widely \u2014 sometimes ten days, sometimes thirty \u2014 while the second half is steadier.",
            "This matters for real life. If you assume day 14 but actually ovulate later, your fertile window is in a different place than the app predicted, and your pre-period symptoms will land on different dates than the calendar suggests. The \u201Caverage\u201D can be quite far from your own.",
            "The takeaway isn\u2019t to memorise new numbers \u2014 it\u2019s to trust your own pattern over the textbook. Your body keeps a more accurate calendar than any generic average."
          ],
          action:"One thing to track: rather than counting to 14, watch for your own ovulation signs over a couple of cycles. Your real timing is more useful than the textbook\u2019s.",
          bookRef:'Cycle / The Two Halves', productSlot:null, source:'book+web' },
        { id:'dl-cycle-your-normal', category:'cycle', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"Tracking reveals your normal \u2014 so you can spot when it changes",
          body:[
            "There\u2019s no single \u201Cnormal\u201D cycle. Healthy cycles range widely in length, flow and how they feel \u2014 so a number from a textbook tells you far less than a few months of your own data does. The real value of tracking isn\u2019t hitting an average; it\u2019s learning your average.",
            "Once you know your own baseline \u2014 how long your cycle usually runs, how your mood and energy move through it, what your flow is normally like \u2014 you gain a quiet early-warning system. A clear change from your normal is one of the first signs that something \u2014 thyroid, stress, perimenopause \u2014 may be shifting.",
            "That\u2019s the whole point of logging day after day. Not to chase a perfect pattern, but to build a personal reference so that when something changes, you notice it early and clearly."
          ],
          action:"One thing to keep doing: log consistently, even on unremarkable days. The boring entries are what build the baseline that makes a real change easy to spot.",
          bookRef:'Cycle / The Cycle Is a Vital Sign', productSlot:null, source:'book' },
        { id:'dl-cycle-post-pill', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"What to expect when you come off the pill",
          body:[
            "The pill works by switching off your natural cycle and supplying steady synthetic hormones instead. So coming off it isn\u2019t simply flicking a switch back on \u2014 your own hormonal rhythm has to wake up and find its feet again, and that can take a few months.",
            "In that window it\u2019s common to see irregular or absent periods for a while, a return of symptoms the pill was masking (acne, PMS, heavier or more painful bleeds), and a stretch where things feel unpredictable. None of this means something is broken; it\u2019s your system re-establishing its own pattern.",
            "It also matters because the pill can hide conditions \u2014 PCOS, endometriosis, irregular cycles \u2014 that re-emerge once it\u2019s stopped. What surfaces afterward is useful information about your underlying hormonal health, not a new problem the pill caused."
          ],
          action:"One thing to do if you\u2019ve recently stopped: start tracking, and give your cycle a few months to settle. If periods haven\u2019t returned after about three months, that\u2019s worth a doctor\u2019s conversation.",
          bookRef:'Cycle / Contraception & Your Cycle', productSlot:null, source:'book' },
        { id:'dl-cycle-fibroids', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Fibroids are common, estrogen-driven, and not a one-way street",
          body:[
            "Fibroids \u2014 benign growths in or on the womb \u2014 are remarkably common, affecting a large share of women by midlife, yet many have never had them explained. They\u2019re not cancer, and many cause no trouble at all, but when they do, heavy or prolonged bleeding and pelvic pressure are the usual signs.",
            "They\u2019re sensitive to estrogen, which is partly why they tend to grow through the higher-estrogen years and often shrink after menopause. The same eating pattern that supports estrogen clearance \u2014 higher fibre, plenty of fruit and vegetables, less alcohol, less red meat \u2014 is associated with lower fibroid risk and may help slow growth.",
            "What\u2019s worth knowing most is that symptomatic fibroids have a far wider menu of options than women are often told. Medication, non-surgical procedures, and uterus-preserving surgery all exist \u2014 a hysterectomy should rarely be the first thing offered."
          ],
          action:"One thing to do if heavy bleeding or pressure is affecting you: raise fibroids specifically with a doctor and ask about the full range of options \u2014 not just surgery. Support estrogen clearance with fibre meanwhile.",
          bookRef:'Conditions / Fibroids', productSlot:null, source:'book' },
        { id:'dl-cycle-pcos', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"PCOS is common, often missed, and very responsive to the right support",
          body:[
            "Polycystic ovary syndrome is one of the most common hormonal conditions in women, and one of the most under- and misdiagnosed. The classic picture is irregular or absent periods alongside signs of higher androgens \u2014 jawline acne, unwanted hair, weight that settles centrally \u2014 though it doesn\u2019t look identical in everyone.",
            "Underneath it, for most women, sits insulin resistance: the body\u2019s cells respond poorly to insulin, which drives the hormonal cascade. That\u2019s actually hopeful, because insulin sensitivity is one of the most responsive things to everyday change \u2014 steady blood sugar, protein and fibre, strength training, and good sleep all push in the right direction.",
            "If this pattern sounds familiar, it\u2019s worth a proper assessment rather than self-diagnosis \u2014 but knowing the link to insulin reframes it from a mysterious diagnosis into something with clear, daily levers."
          ],
          action:"One thing to do if irregular cycles come with acne, central weight or unwanted hair: ask a doctor about PCOS, and meanwhile work on blood-sugar stability \u2014 protein and fibre at meals, strength training, steady sleep.",
          bookRef:'Conditions / PCOS', productSlot:null, source:'book' }
      ],
      menopause: [
        { id:'dl-meno-progesterone-first', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Perimenopause often begins years before your periods change",
          body:[
            "Most women expect perimenopause to announce itself with hot flushes and irregular periods in their fifties. So when sleep starts fraying, anxiety creeps in, and PMS worsens in the late thirties or early forties \u2014 with periods still regular \u2014 it rarely gets connected to the transition at all.",
            "But progesterone, the calming, sleep-supporting hormone, tends to fall earlier and more steeply than estrogen \u2014 sometimes years before anything obvious changes. Losing it first explains a great deal: the new 3 a.m. waking, the anxiety that seems to come from nowhere, the sharper premenstrual weeks.",
            "Knowing this reframes the whole experience. You may not be \u201Ctoo young\u201D for this, and you\u2019re almost certainly not losing your mind. You may simply be at the quiet beginning of a transition no one warned you starts this early."
          ],
          action:"One thing to consider: if sleep, mood and PMS have shifted in your late thirties or forties with periods still regular, perimenopause is worth putting on the list \u2014 not dismissing because you\u2019re \u201Ctoo young.\u201D",
          bookRef:'Perimenopause / What Is Happening Hormonally', productSlot:null, source:'book' },
        { id:'dl-meno-turbulence', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Perimenopause isn\u2019t a slow decline \u2014 it\u2019s turbulence",
          body:[
            "The common picture of perimenopause is a gentle downward slope \u2014 hormones quietly fading until they\u2019re gone. The reality is far less orderly, and understanding that explains why some weeks feel fine and others feel like the floor moved.",
            "Estrogen doesn\u2019t decline smoothly. It swings \u2014 sometimes surging higher than anything you knew in your twenties, then crashing to almost nothing. Those swings drive the hot flushes, the migraines, the abrupt mood crashes and the new anxiety. It\u2019s not a fade; it\u2019s weather.",
            "This is genuinely reassuring news. If your experience is erratic and unpredictable, that doesn\u2019t mean something is going wrong \u2014 erratic is what this stage actually looks like. And turbulence, unlike decline, eventually settles."
          ],
          action:"One thing to hold onto: on a sudden bad day, remember it\u2019s likely a swing, not a new baseline. Naming it as turbulence takes some of its power away.",
          bookRef:'Perimenopause / What Is Happening Hormonally', productSlot:null, source:'book' },
        { id:'dl-meno-hrt-fear', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The fear around HRT is older than the current evidence",
          body:[
            "If you\u2019ve been left with a vague sense that hormone therapy is dangerous, that impression most likely traces back to one early reading of a single study in 2002 \u2014 a reading that frightened a generation of doctors and patients away from it. Twenty years of better evidence have since changed the picture substantially.",
            "Modern hormone therapy is also not what your mother may have been warned off. Today\u2019s typical approach \u2014 estrogen through the skin rather than as a pill, paired with body-identical progesterone \u2014 carries a more favourable risk profile than the older formulations the scare was built on. Current guidelines support it for most healthy, symptomatic women under 60 who are within ten years of menopause.",
            "None of this means HRT is right for everyone, and it\u2019s a genuine decision to make with a clinician. But it deserves to be made on today\u2019s evidence \u2014 not on a fear inherited from two decades ago."
          ],
          action:"One thing to do if symptoms are affecting your life: go into the conversation informed. Ask specifically about transdermal estrogen and body-identical progesterone, and what the real risks are for someone with your history.",
          bookRef:'Menopause and HRT', productSlot:null, source:'book+web' },
        { id:'dl-meno-nothing-can-be-done', category:'menopause', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"If you\u2019ve been told to just wait it out",
          body:[
            "\u201CThere\u2019s nothing to be done \u2014 it\u2019s your age.\u201D It\u2019s one of the most common things women hear, and one of the least accurate. Being told to endure it is not the same as there being nothing that helps.",
            "There is, in fact, a wide menu. Hormone therapy is the most effective option for moderate-to-severe symptoms. For women who can\u2019t or prefer not to use it, low-dose SSRIs and SNRIs, gabapentin for night sweats, and cognitive behavioural therapy all have real evidence \u2014 and a newer medication aimed specifically at hot flushes was approved in 2023. Alongside any of these, the foundations \u2014 sleep, protein, movement, lowered alcohol, stress \u2014 do meaningful work.",
            "The honest summary is this: a clinician who tells you nothing can be done is not up to date with what the evidence supports. That\u2019s a reason to seek a second opinion, not to give up."
          ],
          action:"One thing to remember: \u201Cnothing can be done\u201D is usually a sign to find someone more current, not a verdict on your options. You are allowed to ask again, elsewhere.",
          bookRef:'Menopause and HRT', productSlot:null, source:'book+web' },
        { id:'dl-meno-testosterone', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Women have testosterone too \u2014 and it quietly fades",
          body:[
            "Testosterone is filed in most minds as a male hormone, so its role in women\u2019s health goes almost entirely unmentioned. Yet women produce it throughout life, and it contributes to libido, energy, mood, motivation and muscle \u2014 and it declines slowly across the decades, well before and through menopause.",
            "When it dips, the effects are easy to misattribute: a flattened sex drive, a loss of get-up-and-go, a sense of motivation gone quiet. Because almost no one connects these to testosterone, women often assume it\u2019s just them, or just age.",
            "It\u2019s worth knowing simply so the dots can be joined. For some women, particularly where low libido is distressing, testosterone is something that can be discussed and, in the right setting, addressed \u2014 another reason a well-informed appointment matters."
          ],
          action:"One thing to keep in mind: if libido and drive have dropped in a way that bothers you, testosterone is part of the female picture too \u2014 and a reasonable thing to raise with a knowledgeable clinician.",
          bookRef:'Postmenopause / The New Steady State', productSlot:null, source:'book' },
        { id:'dl-meno-central-weight', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Midlife weight settling around the middle isn\u2019t a willpower failure",
          body:[
            "Many women reach their forties and find that weight, which once spread fairly evenly, now gathers around the middle \u2014 often without much change in how they eat. The usual response is self-blame and harder dieting, which frequently makes things worse.",
            "The shift is largely hormonal. As estrogen falls, the body tends to redistribute fat toward the abdomen, and falling muscle plus less stable blood sugar tilt the metabolism in the same direction. It\u2019s a change in the terms, not a sudden collapse of your discipline.",
            "Which is why eating even less often backfires here \u2014 it costs you the very muscle that protects your metabolism. The more effective levers are protein, strength training, steady blood sugar and sleep, not deeper restriction."
          ],
          action:"One thing to reframe: if your shape has changed despite steady habits, reach for protein and strength rather than a stricter diet. You\u2019re working with the hormonal shift, not punishing yourself for it.",
          bookRef:'Perimenopause / The Symptoms No One Connects', productSlot:null, source:'book' },
        { id:'dl-meno-window', category:'menopause', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"These years are the highest-impact window you\u2019ll get",
          body:[
            "It\u2019s easy to treat perimenopause as something to survive until the symptoms pass. But there\u2019s a more useful way to see it: the years around menopause are the single highest-leverage window you have for protecting your next few decades.",
            "Estrogen quietly guarded your bones, heart and brain for most of your life. As it withdraws, that protection fades \u2014 but the risk that follows is largely modifiable, and what you build now compounds. The strength training, the protein, the sleep, the blood-pressure and cholesterol awareness done in this decade pay off for thirty years. There\u2019s even evidence that this window matters for hormone therapy decisions too.",
            "That reframe turns a stretch that can feel like loss into something more empowering: not the end of your strong years, but the most important time to invest in them."
          ],
          action:"One thing to start now rather than later: one long-game habit \u2014 strength training, or simply knowing your blood pressure and cholesterol. This is the window where it counts most.",
          bookRef:'Postmenopause / The Long Game', productSlot:null, source:'book' },
        { id:'dl-meno-reframe', category:'menopause', severity:'positive',
          eyebrow:'Something to sit with today',
          headline:"Perimenopause is a recalibration, not a decline",
          body:[
            "The cultural story about this stage is relentlessly negative \u2014 a winding down, a fading, a list of things that go wrong. It\u2019s no wonder so many women approach it with dread. But that story is incomplete, and the dread itself can make the experience harder.",
            "Biologically, this is a transition to a new steady state, not a slide into decline. The turbulent years do end. Many women describe what comes after as one of the most stable, clear and self-assured periods of their lives \u2014 freed from cycles, often freed from the urge to please, more sure of what they want.",
            "None of this dismisses the genuine difficulty of the symptoms. It just refuses the idea that the whole chapter is loss. Walked into informed and supported, it can be a recalibration toward something steadier \u2014 not the beginning of the end."
          ],
          action:"One thing to hold onto on a hard day: the turbulence is a phase, not your new permanent self. Informed and supported, what comes next can be genuinely steadier.",
          bookRef:'Postmenopause / The New Steady State', productSlot:null, source:'book' }
      ],
      movement: [
        { id:'dl-move-cardio-not-enough', category:'movement', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The exercise that worked at 25 isn\u2019t enough now",
          body:[
            "A whole generation of women were taught that the best thing they could do for their bodies was cardio \u2014 run, cycle, swim, anything that burned calories for long enough. Many followed it faithfully and still arrived in midlife with thinning bones, shrinking muscle and stubborn fatigue, wondering what they\u2019d done wrong.",
            "They\u2019d done nothing wrong; the advice was just incomplete. Cardio is genuinely good for your heart, mood and metabolism. But it doesn\u2019t build the two things that matter most as estrogen falls: muscle and bone. For those, you have to ask your muscles to work against real resistance.",
            "This isn\u2019t about the gym, or looking a certain way. It\u2019s about loading your body enough that it keeps the strength and bone density that protect your independence for the next thirty years."
          ],
          action:"One thing to add this week: two short sessions of something that challenges your muscles \u2014 bodyweight, bands, or weights. Creatine is one of the best-studied, low-cost ways to support strength as you start.",
          bookRef:'Movement / Why Cardio Is Not Enough', productSlot:'/recommends/creatine', source:'book' },
        { id:'dl-move-muscle-bank', category:'movement', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"Strength now is a deposit you can\u2019t make later",
          body:[
            "Muscle and bone are easy to take for granted while you have them. But both start declining gradually from around your late thirties, and falling estrogen removes some of the protection you used to get for free. The strength you build \u2014 or don\u2019t \u2014 in this decade quietly sets the floor for the next several.",
            "It helps to think of it as a deposit. Every session that loads your muscles and bones adds a little to an account you\u2019ll draw on in your sixties, seventies and beyond \u2014 the account that decides whether you can carry the shopping, get up off the floor easily, and stay steady on your feet.",
            "The encouraging part is how little it takes to start. You don\u2019t need to become an athlete. Consistent, modest resistance work, repeated over years, compounds into something genuinely protective."
          ],
          action:"One thing to reframe: a strength session isn\u2019t about today\u2019s appearance \u2014 it\u2019s a small deposit toward staying strong and independent later. Two short sessions a week is a real start.",
          bookRef:'Movement / Why Cardio Is Not Enough', productSlot:null, source:'book' },
        { id:'dl-move-after-meal-walk', category:'movement', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The ten-minute walk that quietly steadies your blood sugar",
          body:[
            "Not all movement has to be a workout to matter. One of the most useful things you can do for your hormones takes about ten minutes and needs no kit at all: a gentle walk after you eat.",
            "When you move soon after a meal, your muscles pull glucose out of your blood to use as fuel \u2014 which blunts the spike and the crash that would otherwise follow. Steadier blood sugar across the day means fewer energy dips, fewer cravings, and less of the insulin strain that worsens weight and PCOS over time.",
            "It\u2019s small, unglamorous, and easy to dismiss \u2014 which is exactly why it\u2019s worth naming. Done most days, after your biggest meal, it adds up to a meaningful metabolic habit for almost no effort."
          ],
          action:"One thing to try: take a ten-minute walk after your largest meal today \u2014 even around the block. Notice whether the usual afternoon slump is gentler.",
          bookRef:'Food / Insulin Sensitivity', productSlot:null, source:'book' },
        { id:'dl-move-neat', category:'movement', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The movement that doesn\u2019t feel like exercise still counts",
          body:[
            "If you only count movement that happens in workout clothes, you\u2019re missing most of it. The walking, standing, stair-climbing and general fidgeting of an ordinary day adds up to a surprisingly large share of what your body does \u2014 and it matters as much as the structured sessions.",
            "This everyday activity keeps blood sugar steadier, supports a healthier metabolism, and quietly offsets the long, still hours that modern life builds in. A brisk daily life can outperform a single gym session bolted onto an otherwise sedentary day.",
            "The freeing part is that none of it requires motivation or kit. Taking the stairs, parking further away, pacing on a call, walking to talk to a colleague instead of messaging \u2014 small choices, repeated, become a real foundation."
          ],
          action:"One thing to add today: one extra pocket of movement you wouldn\u2019t normally bother with \u2014 the stairs, a longer route, a walk during a call. It counts more than you think.",
          bookRef:'Movement / Everyday Activity', productSlot:null, source:'book' },
        { id:'dl-move-recovery', category:'movement', severity:'info',
          eyebrow:'Something to learn today',
          headline:"You can\u2019t out-train poor recovery",
          body:[
            "There\u2019s a quiet belief that more is always better with exercise \u2014 that if you\u2019re tired or stalled, the answer is to push harder. For women navigating shifting hormones, that instinct can backfire, because the gains from training don\u2019t happen during the workout. They happen during recovery.",
            "When sessions are relentless and sleep and rest are short, the body reads it as one more stressor, nudging cortisol up rather than fitness. The result is the frustrating pattern of training hard and feeling worse \u2014 more tired, more wired, no progress.",
            "Recovery isn\u2019t the absence of training; it\u2019s the part where the training actually works. Rest days, sleep, and easier weeks aren\u2019t slacking \u2014 they\u2019re where strength is built."
          ],
          action:"One thing to honour this week: a genuine rest day, and sleep around your harder sessions. If you\u2019re training and still flat, recovery is usually the missing piece, not effort.",
          bookRef:'Movement / Recovery', productSlot:null, source:'book' },
        { id:'dl-move-repeatable', category:'movement', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"The best workout is the one you\u2019ll actually repeat",
          body:[
            "It\u2019s easy to be talked into elaborate programmes \u2014 six days a week, complicated splits, an hour at a time \u2014 and then quietly abandon the whole thing by week three when life gets in the way. The perfect plan you don\u2019t follow does nothing.",
            "What changes a body over years isn\u2019t intensity; it\u2019s consistency. Two short, manageable strength sessions a week, done for months, beat an ambitious routine kept for a fortnight. The win is in the repeating, not the heroics.",
            "So the most useful question isn\u2019t \u201CWhat\u2019s the optimal workout?\u201D It\u2019s \u201CWhat will I genuinely still be doing in three months?\u201D Start there, start small, and let consistency compound."
          ],
          action:"One thing to choose: a movement habit modest enough that you\u2019re almost certain to keep it \u2014 two short sessions a week is plenty to start. You can always build once it\u2019s sticking.",
          bookRef:'Movement / Why Cardio Is Not Enough', productSlot:null, source:'book' },
        { id:'dl-move-pelvic-floor', category:'movement', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The muscles no one tells you to train",
          body:[
            "There\u2019s a set of muscles that quietly support your bladder, bowel and core, and almost no one is taught to look after them until something goes wrong: the pelvic floor. Leaking a little when you sneeze, laugh or run is incredibly common \u2014 and very commonly treated as just an inevitable part of having had babies or getting older.",
            "It isn\u2019t inevitable, and it isn\u2019t something you have to live with quietly. Pregnancy, childbirth and falling estrogen all affect these muscles and the tissues around them, but they respond to training just like any other muscle. The catch is that \u201Cjust do your kegels\u201D is often wrong \u2014 some women need to strengthen, others to learn to release, and getting it backwards doesn\u2019t help.",
            "This is exactly why it\u2019s worth treating as a real, trainable thing rather than a source of quiet embarrassment. A women\u2019s-health physiotherapist can tell you which direction you actually need."
          ],
          action:"One thing to know: leaking with sneezing or exercise is common but not something you have to accept. A women\u2019s-health physio can assess what your pelvic floor actually needs \u2014 it\u2019s trainable.",
          bookRef:'Movement / The Pelvic Floor', productSlot:null, source:'book' }
      ],
      supplements: [
        { id:'dl-supp-foundations-first', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Supplements work on the edges \u2014 foundations do the heavy lifting",
          body:[
            "It\u2019s tempting to hope a bottle will fix what feels off, and the wellness aisle is happy to encourage that. The honest truth is less exciting and more freeing: supplements support the edges of hormonal health. The core work is done by sleep, food, movement and lowered stress.",
            "That ordering matters because it saves you money and disappointment. A supplement laid on top of poor sleep and too little protein is working against the current. The same supplement, once the foundations are roughly in place, can give a real, if modest, nudge.",
            "It\u2019s also worth knowing that several popular options \u2014 evening primrose oil and a few well-marketed herbs among them \u2014 don\u2019t have strong evidence behind the claims made for them. Form and evidence matter as much as the name on the label."
          ],
          action:"One thing to ask before buying anything: are my foundations \u2014 sleep, protein, movement, stress \u2014 roughly in place first? Supplements reward that order; they don\u2019t replace it.",
          bookRef:'Supplements / What Actually Helps', productSlot:null, source:'book+web' },
        { id:'dl-supp-magnesium', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"If you only learn about one supplement, make it magnesium",
          body:[
            "Magnesium does an unusual amount of quiet work in the body \u2014 it\u2019s involved in hundreds of processes, including the ones governing sleep, nervous-system calm, and the overnight cortisol pulse. It\u2019s also one of the nutrients women most commonly fall short on, and stress, alcohol and some medications drain it further.",
            "That combination is why it shows up again and again for the perimenopausal symptom cluster: lighter sleep, anxiety, PMS, cramps and migraines. It\u2019s not a cure for any of them, but the breadth of its role makes it one of the more justified additions \u2014 and it\u2019s cheap and very safe.",
            "Form matters more than most people realise. The glycinate form is gentle on the stomach and easy to absorb, and the evening is the natural time to take it, when its calming effect lines up with winding down."
          ],
          action:"One thing to consider: magnesium glycinate in the evening, in the commonly used 200\u2013400 mg range, alongside magnesium-rich foods. Give it a few weeks and judge by your sleep and your pre-period week.",
          bookRef:'Supplements / The Core Few', productSlot:'/recommends/magnesium', source:'book+web' },
        { id:'dl-supp-vitd-omega', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Two quietly important ones: vitamin D and omega-3",
          body:[
            "Beyond magnesium, two more earn their place for most women \u2014 not because they\u2019re dramatic, but because they fill gaps that widen with age. Vitamin D deficiency is extremely common, and as estrogen falls and bone turnover speeds up, keeping it topped up becomes genuinely important for bones, mood and immunity.",
            "The honest catch with vitamin D is that \u201Cjust take some\u201D is guesswork \u2014 the right amount depends on your starting level, which is worth testing. Pairing D3 with K2 helps steer calcium into your bones rather than your arteries.",
            "Omega-3 fats \u2014 the EPA and DHA found in oily fish \u2014 are the other. They\u2019re anti-inflammatory, support mood and the brain through the foggier stretches of perimenopause, and most women simply don\u2019t eat enough oily fish to get a useful dose from food alone."
          ],
          action:"One thing to do: aim for oily fish a couple of times a week, and consider testing your vitamin D rather than guessing. If you supplement D, choose a D3 with K2.",
          bookRef:'Supplements / The Core Few', productSlot:'/recommends/vitamin-d3-k2', source:'book+web' },
        { id:'dl-supp-creatine', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Creatine isn\u2019t just for bodybuilders \u2014 or just for men",
          body:[
            "Creatine has an image problem. Decades of association with gym bros and bulking has left most women assuming it\u2019s irrelevant to them, or that it\u2019ll make them puffy and big. Neither is true, and the research on women has caught up impressively in the last few years.",
            "It\u2019s simply a compound your muscles \u2014 and your brain \u2014 use for quick energy, and your own levels appear to dip as estrogen falls. Supplementing supports muscle strength and recovery (especially alongside resistance training), bone, and increasingly there\u2019s evidence for brain energy, mood and mental fatigue, which matter through perimenopause. It won\u2019t make you bulky, and at sensible doses it rarely causes bloating.",
            "The honest caveats: it works with strength training, not instead of it, and some of the brain claims are still early. But for a cheap, exceptionally well-studied, safe supplement, the case for women is genuinely strong."
          ],
          action:"One thing to consider: 3\u20135 grams a day of creatine monohydrate, taken consistently (timing doesn\u2019t much matter), paired with a couple of strength sessions a week. Skip the old \u201Cloading\u201D phase.",
          bookRef:'Supplements / The Core Few', productSlot:'/recommends/creatine', source:'book+web' },
        { id:'dl-supp-ashwagandha', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The herb with real evidence for stress and sleep",
          body:[
            "The supplement aisle is full of bold promises, most of them thin. Ashwagandha is one of the few with reasonable evidence behind a specific, useful claim: it can lower cortisol and improve sleep quality, particularly in people running on chronic stress.",
            "That makes it a sensible thing to consider for the \u201Ctired but wired\u201D pattern \u2014 the flattened morning, the wired evening, the 3 a.m. alertness \u2014 where calming the stress response is exactly the goal. Studies tend to show benefits to sleep onset and quality over several weeks of consistent use.",
            "It\u2019s worth being honest about what it isn\u2019t: it\u2019s often marketed for hot flushes, where the evidence doesn\u2019t really support it. Treat it as stress-and-sleep support, give it a fair trial, and judge by whether your sleep and your stress resilience actually improve."
          ],
          action:"One thing to try if stress and sleep are the issue: a quality ashwagandha for a few weeks, with a clear stop date. Keep it if your sleep and calm improve; drop it if they don\u2019t.",
          bookRef:'Supplements / What Actually Helps', productSlot:'/recommends/ashwagandha', source:'book+web' },
        { id:'dl-supp-quality', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"With supplements, the label matters more than the headline",
          body:[
            "It\u2019s easy to buy a supplement on the strength of a confident claim and never think about what\u2019s actually in the bottle. But supplements are loosely regulated, and two products with the same name on the front can differ enormously in form, dose and purity.",
            "Two habits protect you. First, favour products that are third-party tested, so an independent lab has confirmed the contents match the label. Second, pay attention to form \u2014 magnesium glycinate behaves very differently from cheap magnesium oxide, for instance \u2014 because the right form is often what separates \u201Cworks\u201D from \u201Cdid nothing.\u201D",
            "It also helps to know what to skip. Several heavily marketed options \u2014 evening primrose oil and a few popular herbs among them \u2014 don\u2019t have strong evidence behind the claims made for them. Spending less on those leaves more for the few that earn their place."
          ],
          action:"One thing to do before your next purchase: check for third-party testing and the specific form, and give anything new a fair trial with a stop date rather than taking it forever on faith.",
          bookRef:'Supplements / What Actually Helps', productSlot:null, source:'book+web' },
        { id:'dl-supp-b12', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The deficiency that masquerades as \u201Cjust tired\u201D",
          body:[
            "Bone-deep fatigue, brain fog, low mood, tingling in the hands or feet, even a sore tongue \u2014 these get pinned on stress or hormones, but they\u2019re also the classic signs of low vitamin B12, a deficiency that\u2019s easy to miss and easy to fix.",
            "It\u2019s especially common in women who eat little or no meat, who are over forty, or who take certain stomach-acid or diabetes medications that reduce absorption. Because the symptoms overlap so neatly with hormonal fatigue, B12 often goes unchecked while everything else gets blamed.",
            "It\u2019s worth knowing precisely because it\u2019s so treatable \u2014 a simple blood test confirms it, and correcting it can lift a fatigue that no amount of sleep was touching."
          ],
          action:"One thing to consider if you\u2019re plant-based, over forty, or on acid-reducing medication: ask for a B12 check, and supplement if you\u2019re low. It\u2019s a common, fixable cause of fatigue.",
          bookRef:'Supplements / The Core Few', productSlot:'/recommends/vitamin-b12', source:'book' },
        { id:'dl-supp-zinc', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"A small mineral with an outsized role in women\u2019s hormones",
          body:[
            "Zinc rarely makes the headlines, but it quietly underpins a lot: it supports ovulation and progesterone production, helps regulate the skin (which is why low zinc shows up as hormonal acne for some women), and is involved in immune function and wound healing.",
            "It\u2019s also a mineral many women run low on, particularly those eating little red meat or shellfish, and stress depletes it further. Low zinc can show up as more breakouts, slower healing, frequent colds, and a niggling sense of being run down.",
            "As with most supplements, food comes first \u2014 meat, shellfish, seeds and legumes are good sources \u2014 and supplementing is best kept modest, since very high doses can throw off copper balance over time."
          ],
          action:"One thing to try: get zinc-rich foods in regularly (pumpkin seeds, shellfish, meat, legumes). If you supplement for skin or immunity, keep the dose modest rather than mega.",
          bookRef:'Supplements / What Actually Helps', productSlot:'/recommends/zinc', source:'book' }
      ],
      body: [
        { id:'dl-body-joints', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The new aches and stiffness might be hormonal, not just age",
          body:[
            "Waking up stiff, joints that ache for no clear reason, a shoulder or hip that\u2019s suddenly cranky \u2014 it\u2019s easy to write these off as \u201Cgetting older\u201D and leave it there. But if they\u2019ve arrived alongside other midlife changes, hormones are very likely part of the story.",
            "Estrogen is quietly anti-inflammatory, and it helps maintain the collagen in your joints, tendons and ligaments. As it falls and swings through perimenopause, inflammation rises and those tissues lose some support \u2014 which is why a striking majority of women report new joint and muscle pain in this stretch, often with nothing \u201Cwrong\u201D on a scan. There\u2019s even a name for the cluster now: the musculoskeletal syndrome of menopause.",
            "Naming it matters, because \u201Cjust ageing\u201D invites resignation, while \u201Chormonal and largely manageable\u201D points at what helps: movement, strength, and not accepting persistent pain as simply your lot."
          ],
          action:"One thing to try: keep moving the achy joints rather than resting them entirely \u2014 gentle strength and mobility work is the most consistently effective response. Persistent or severe pain is still worth a doctor\u2019s look.",
          bookRef:'Postmenopause / Muscle & Joints', productSlot:'/recommends/omega-3', source:'book+web' },
        { id:'dl-body-skin', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why your skin seemed to change almost overnight",
          body:[
            "Many women hit a point in midlife where the mirror seems to shift quickly \u2014 skin drier, thinner, less bouncy, fine lines arriving faster than the calendar alone would explain. It can feel oddly sudden, and a little disorienting.",
            "There\u2019s a real mechanism behind it. Estrogen drives the fibroblasts that make collagen, the protein that keeps skin firm and hydrated. As estrogen falls around menopause, collagen production drops sharply \u2014 women can lose a large share of skin collagen in the first few years after menopause, then more gradually after. The change isn\u2019t in your head, and it isn\u2019t neglect.",
            "Understanding the cause makes the response less frantic. The basics genuinely help: sun protection, not smoking, enough protein, and resistance training (which supports collagen more broadly) \u2014 and, for some women, this is part of the wider hormone-therapy conversation."
          ],
          action:"One thing to prioritise: daily sun protection and enough protein \u2014 the two least glamorous, most reliable supports for skin as collagen production slows.",
          bookRef:'Postmenopause / Skin & Collagen', productSlot:null, source:'book+web' },
        { id:'dl-body-hair', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Hair changes in midlife: what\u2019s hormonal, and what helps",
          body:[
            "Finding more hair in the brush, a thinner ponytail, a part that\u2019s widened \u2014 it\u2019s one of the more quietly distressing midlife changes, and one women often feel they can\u2019t mention. It\u2019s also extremely common, and not simply vanity to care about.",
            "Shifting estrogen and the changing balance with androgens can alter the hair growth cycle, leaving hair finer and shedding more. But hair is also a sensitive barometer of other things that are common in this stage \u2014 low iron, thyroid changes, stress, and under-eating can all show up first in your hair.",
            "That\u2019s why hair thinning is worth investigating rather than just mourning: some of the most treatable causes hide behind it. The fix is often less about shampoo and more about what\u2019s happening underneath."
          ],
          action:"One thing to do if hair is thinning noticeably: ask your doctor to check iron (ferritin) and thyroid before assuming it\u2019s \u201Cjust hormones.\u201D Those causes are common and treatable.",
          bookRef:'Perimenopause / The Symptoms No One Connects', productSlot:null, source:'book' },
        { id:'dl-body-hot-flashes', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Hot flushes: what actually helps in the moment",
          body:[
            "A hot flush can arrive from nowhere \u2014 a wave of heat, a flush in the face and chest, sometimes a thumping heart \u2014 and the feeling of having no control over your own body is part of what makes them so unsettling.",
            "They come from estrogen\u2019s effect on the brain\u2019s thermostat: as estrogen swings and falls, that thermostat becomes oversensitive and misreads normal warmth as overheating, triggering the body to dump heat. Knowing it\u2019s a thermostat glitch, not a sign something is wrong, takes some of the fear out of them.",
            "Practical levers genuinely help: layered clothing you can shed, a cooler room and bedroom, noticing your triggers (often alcohol, caffeine, spicy food, stress), and slow breathing when one starts. For frequent or disruptive flushes, hormone therapy is the most effective treatment, and there are non-hormonal options too."
          ],
          action:"One thing to try: track what tends to precede your flushes for a week \u2014 alcohol, caffeine, heat, stress \u2014 and ease the most common one. If they\u2019re disrupting life, they\u2019re worth a medical conversation, not endurance.",
          bookRef:'Perimenopause / Vasomotor Symptoms', productSlot:null, source:'book+web' },
        { id:'dl-body-night-sweats', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"When night sweats are the thing wrecking your sleep",
          body:[
            "Waking drenched, throwing the covers off then pulling them back, sleep broken several times a night \u2014 night sweats are hot flushes that strike while you sleep, and they\u2019re one of the most exhausting parts of the transition precisely because they attack rest itself.",
            "The same oversensitive brain thermostat is behind them, and the broken sleep then amplifies everything else: mood, anxiety, brain fog, and next-day fatigue all worsen when the night is fragmented. It becomes a loop, which is why they\u2019re worth addressing rather than enduring.",
            "Some of the most effective help is unglamorous environmental work \u2014 a genuinely cool bedroom, breathable bedding and nightwear, less alcohol in the evening. Where night sweats are frequent and severe, they\u2019re also one of the symptoms hormone therapy improves most reliably."
          ],
          action:"One thing to try tonight: drop the bedroom temperature, switch to breathable layers you can shed, and skip the evening drink. If night sweats keep breaking your sleep, raise them specifically with a doctor.",
          bookRef:'Sleep / Why Sleep Breaks Down in Perimenopause', productSlot:null, source:'book' },
        { id:'dl-body-migraine', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Headaches that track your cycle have a hormonal trigger",
          body:[
            "If your worst headaches or migraines seem to cluster at the same point each month \u2014 often just before your period \u2014 that timing isn\u2019t random. For many women, the trigger is hormonal, and recognising the pattern is the first step to getting ahead of it.",
            "Migraine can be set off by the sharp drop in estrogen that happens in the late luteal phase, just before bleeding begins. That\u2019s why these \u201Cmenstrual migraines\u201D land so predictably, and why they can worsen during perimenopause when estrogen swings become more extreme.",
            "Seeing the link changes the approach from reactive to preventive: if you know roughly when the vulnerable window falls, you can be more protective of sleep, hydration, blood sugar and stress around it \u2014 and have a clearer conversation with a doctor about targeted options."
          ],
          action:"One thing to do: note where your headaches fall across a couple of cycles. If they cluster pre-period, that\u2019s a hormonal pattern worth managing proactively and raising with a clinician.",
          bookRef:'Cycle / The Luteal Phase', productSlot:null, source:'book+web' },
        { id:'dl-body-thyroid-normal', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"When your thyroid labs are \u201Cnormal\u201D but you\u2019re not",
          body:[
            "Exhausted, cold, foggy, gaining weight, hair thinning \u2014 you suspect your thyroid, you get tested, and you\u2019re told it\u2019s normal. The relief is real, but so is the confusion when you still feel exactly the same. This is one of the most common dead ends women hit.",
            "A few things explain it. Standard testing often checks only one marker (TSH) and a wide \u201Cnormal\u201D range, which can miss the fuller picture \u2014 free T4 and T3, reverse T3, and thyroid antibodies tell more of the story. Chronic stress also suppresses the conversion of thyroid hormone into its active form, so you can feel hypothyroid at the cellular level while the basic blood test looks fine.",
            "None of this means you should diagnose yourself. It means \u201Cyour TSH is normal\u201D isn\u2019t always the end of the conversation \u2014 and you\u2019re allowed to ask for a fuller panel."
          ],
          action:"One thing to ask for if symptoms persist despite a \u201Cnormal\u201D result: a fuller thyroid panel \u2014 free T4, free T3, antibodies \u2014 plus ferritin and vitamin D, which both affect how the thyroid works.",
          bookRef:'Thyroid / The Full Picture', productSlot:null, source:'book' },
        { id:'dl-body-sleep-apnea', category:'body', severity:'caution',
          eyebrow:'Worth a gentle check',
          headline:"In women, sleep apnea often hides behind other symptoms",
          body:[
            "Sleep apnea \u2014 where breathing repeatedly pauses in the night \u2014 is usually pictured as a loud-snoring man. That image is exactly why it gets missed in women, whose symptoms often look completely different and get blamed on hormones or stress instead.",
            "In women it more often shows up as daytime fatigue, low mood, morning headaches, brain fog, or unexplained weight gain \u2014 without the dramatic snoring. And the risk rises around menopause, as the hormonal changes affect the airway and breathing during sleep. Many women carry it for years, treating the downstream symptoms while the cause goes unnamed.",
            "This is worth knowing because it\u2019s very treatable once identified \u2014 and because no amount of sleep hygiene fixes a breathing problem. If exhaustion persists despite genuinely good sleep habits, this belongs on the list."
          ],
          action:"One thing to do if you\u2019re sleeping \u201Cenough\u201D but still wrecked, especially with morning headaches: mention sleep apnea to your doctor and ask whether a sleep assessment is warranted.",
          bookRef:'Sleep / Why Sleep Breaks Down in Perimenopause', productSlot:null, source:'book+web' },
        { id:'dl-body-period-pain', category:'body', severity:'caution',
          eyebrow:'Worth a gentle check',
          headline:"Period pain that stops your life isn\u2019t something to just endure",
          body:[
            "Some cramping is a normal part of menstruation. But pain that regularly keeps you off work or out of life, that painkillers barely touch, or that has crept worse over the years, is in a different category \u2014 and \u201Cperiods are just painful\u201D has left far too many women undiagnosed for years.",
            "Severe, life-disrupting period pain can be a sign of conditions like endometriosis, where tissue similar to the womb lining grows elsewhere and drives inflammation and pain. On average women wait years for a diagnosis, partly because the pain gets normalised \u2014 by them and sometimes by clinicians.",
            "Naming the threshold helps. Pain you can manage with the odd painkiller and a hot water bottle is one thing; pain that controls your month is a reason to push for answers, not to grit your teeth through."
          ],
          action:"One thing to do if pain regularly disrupts your life: track it (when, how severe, what it stops you doing) and take that record to a doctor. Ask directly whether endometriosis should be considered.",
          bookRef:'Cycle / When Pain Isn\u2019t Normal', productSlot:null, source:'book' },
        { id:'dl-body-breast', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Knowing your breasts\u2019 normal is the point of checking",
          body:[
            "Breasts change across the month \u2014 often fuller, lumpier or more tender in the luteal phase before your period, then settling once bleeding starts. That cyclical pattern is normal, and it\u2019s exactly why \u201Cknowing your normal\u201D matters more than hunting for a single perfect technique.",
            "Hormonal shifts of perimenopause can change the texture too, sometimes making breasts feel more lumpy or sore in new ways. The aim of getting familiar with how yours usually feel isn\u2019t anxiety \u2014 it\u2019s so that a genuine change stands out clearly against your own baseline.",
            "A change worth getting checked promptly includes a new distinct lump that doesn\u2019t come and go with your cycle, skin or nipple changes, or one-sided discharge. Most such changes turn out to be benign \u2014 but they\u2019re for a clinician to assess, not you to second-guess."
          ],
          action:"One thing to build: a loose habit of noticing how your breasts normally feel across your cycle. A new lump that doesn\u2019t change with your period, or skin/nipple changes, is worth getting checked promptly.",
          bookRef:'Body / Breast Awareness', productSlot:null, source:'book' },
        { id:'dl-body-frozen-shoulder', category:'body', severity:'info',
          eyebrow:'Something to learn today',
          headline:"A stiff, painful shoulder in midlife isn\u2019t always an injury",
          body:[
            "It can arrive without any obvious cause: a shoulder that grows stiff and painful, hard to lift or rotate, sometimes badly enough to disturb sleep. Many women assume they must have hurt it somehow \u2014 but frozen shoulder, as it\u2019s known, is increasingly recognised as linked to the menopause transition.",
            "It mainly affects women between about 40 and 60, and the timing isn\u2019t coincidence. Estrogen helps keep the tissues around joints supple and manages inflammation; as it falls and fluctuates, the lining of the shoulder joint can thicken and stiffen. It\u2019s part of the same broader picture as the aches and reduced flexibility many women notice in this decade.",
            "Knowing the link matters because it changes the conversation \u2014 from \u201Cwhat did I do to it?\u201D to recognising it as part of a hormonal shift, which opens up the right kinds of help."
          ],
          action:"One thing to do if a shoulder stiffens up without clear cause in midlife: don\u2019t just wait it out \u2014 see a physio or doctor, and mention you\u2019re perimenopausal, as the link is now well recognised.",
          bookRef:'Postmenopause / Muscle & Joints', productSlot:null, source:'book+web' },
        { id:'dl-body-postmeno-bleeding', category:'body', severity:'caution',
          eyebrow:'Worth a prompt check',
          headline:"Any bleeding after menopause needs checking \u2014 always",
          body:[
            "This one is short, simple and important. Once you are postmenopausal \u2014 a full twelve months past your last period \u2014 any vaginal bleeding at all, even light spotting, should be checked by a doctor promptly. Not eventually. Promptly.",
            "The reassuring part: most causes turn out to be benign \u2014 often thinning of the vaginal or womb lining from low estrogen, which is very treatable. So this isn\u2019t a reason to panic.",
            "But postmenopausal bleeding is the one symptom that should never simply be watched and waited on, because it\u2019s also how more serious problems can first announce themselves \u2014 and they\u2019re highly treatable when caught early. Getting it checked is how you rule things out, not a sign that something is wrong."
          ],
          action:"One thing to act on, not file away: if you bleed at all after a full year without periods, book a doctor\u2019s appointment promptly. Usually benign \u2014 but always worth ruling out without delay.",
          bookRef:'Postmenopause / When to See a Doctor', productSlot:null, source:'book' }
      ]
    },
    byType: {
      'cycle-surfer': [
        { id:'dl-cs-train-with-cycle', category:'cycle', severity:'positive',
          eyebrow:'Something to learn today',
          headline:"Train with your cycle, not against it",
          body:[
            "If your workouts feel effortless some weeks and impossible others \u2014 same effort, wildly different result \u2014 your cycle is part of the explanation, and you can use it rather than fight it.",
            "In the follicular phase, as estrogen rises after your period, strength and recovery tend to be at their best; it\u2019s the natural window to push intensity, lift heavier, or chase a personal best. In the luteal phase, with progesterone higher and energy lower, steadier movement \u2014 walking, mobility, lighter sessions \u2014 often feels better and recovers faster.",
            "This isn\u2019t about training less. It\u2019s about matching effort to the hormonal tide so the hard sessions land when your body is most able to absorb them, and the gentle ones land when it needs them."
          ],
          action:"One thing to try: aim your most demanding workouts at the week or two after your period, and let the pre-period stretch be steadier. Same effort, better return.",
          bookRef:'Cycle / The Four Phases', productSlot:null, source:'book' },
        { id:'dl-cs-ovulation-literacy', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Learning to spot your own ovulation is a quiet superpower",
          body:[
            "Most of us were taught the mechanics of periods and almost nothing about ovulation \u2014 the single most important event of the cycle, and the one that actually divides your month in two. Learning to notice it changes how well you understand your own body.",
            "Around your fertile window, cervical mucus usually becomes clearer and more stretchy \u2014 the body\u2019s own signal that ovulation is near. Some women also track waking temperature, which nudges up after ovulation. These signs are more accurate for you than any app prediction built on a textbook average.",
            "Knowing roughly when you ovulate tells you when your fertile days are, when to expect your period, and when your pre-period symptoms will land. It\u2019s body literacy that serves you whether you\u2019re trying to conceive, avoiding it, or simply understanding yourself."
          ],
          action:"One thing to start noticing: changes in cervical mucus across a cycle. Over a month or two, your own ovulation pattern becomes surprisingly clear.",
          bookRef:'Cycle / The Two Halves', productSlot:null, source:'book' },
        { id:'dl-cs-period-week', category:'cycle', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"Your period week is a feature, not a flaw",
          body:[
            "When bleeding starts, estrogen and progesterone are both at their lowest, and many women feel quieter, more inward, more tired. The usual instinct is to override it and carry on at full speed \u2014 and then feel bad for flagging.",
            "But this inward pull isn\u2019t a malfunction. It\u2019s a low-hormone phase doing exactly what it does, and it has its own uses: it tends to be a good week for reflecting, planning, and listening to your own thoughts rather than performing. It\u2019s the worst week to schedule a confrontation or a punishing trip, and a fine week to go gently.",
            "Treating these days as a built-in pause rather than a weakness changes the whole experience. Rest where you can, lean on iron-rich foods, and let yourself work with the phase instead of against it."
          ],
          action:"One thing to try: in your period week, protect a little quiet and skip one optional commitment if you can. Magnesium can ease cramps if they\u2019re part of your pattern.",
          bookRef:'Cycle / The Four Phases', productSlot:'/recommends/magnesium', source:'book' },
        { id:'dl-cs-luteal-arc', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"PMS isn\u2019t just the last two days",
          body:[
            "We tend to think of PMS as something that switches on the day before bleeding. In reality the luteal phase \u2014 the whole back half of your cycle after ovulation \u2014 is an arc, and the shift in how you feel often begins earlier than you\u2019d expect.",
            "Progesterone rises after ovulation and then falls in the final days, and it\u2019s that falling slope that drives the mood dip, the cravings, the lighter sleep and the shorter fuse. Once you see it as a gradual arc rather than a sudden switch, the timing of your \u201Coff\u201D days stops feeling random.",
            "This matters because the arc is plannable. If you know roughly when your luteal phase begins, you can soften the back half in advance rather than being blindsided by it each month."
          ],
          action:"One thing to try: mark the rough start of your luteal phase this cycle, and lighten the load through it \u2014 rather than waiting for the last two days to feel it.",
          bookRef:'Cycle / The Luteal Phase', productSlot:null, source:'book' }
      ],
      'estrogen-dominant': [
        { id:'dl-ed-daily-clearance', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Make clearing estrogen a daily habit, not a project",
          body:[
            "When estrogen runs high relative to progesterone, the goal isn\u2019t to dramatically slash estrogen \u2014 it\u2019s to help your body clear the excess efficiently, every day. The good news is that the levers are ordinary food and ordinary habits.",
            "Fibre is the foundation: most women get half of what supports hormone clearance, so building toward 30 grams or so makes a real difference. Cruciferous vegetables a few times a week steer estrogen down its healthier breakdown path, fermented foods support the gut bacteria that handle clearance, and \u2014 unglamorous but true \u2014 daily, comfortable bowel movements are part of how estrogen actually leaves.",
            "None of this is a cleanse or a protocol. It\u2019s a handful of repeatable defaults that, kept up most days, quietly ease the heavy periods, tenderness and mood swings that estrogen excess tends to drive."
          ],
          action:"One thing to add daily: fibre at every meal and a cruciferous vegetable a few times this week. You\u2019re supporting the exit route, not chasing a quick fix.",
          bookRef:'Food / Fibre & Estrogen Clearance', productSlot:null, source:'book' },
        { id:'dl-ed-heavy-periods', category:'cycle', severity:'caution',
          eyebrow:'Worth a gentle check',
          headline:"Heavy or painful periods are information, not just bad luck",
          body:[
            "Many women assume that very heavy or very painful periods are simply their lot \u2014 something to endure quietly with painkillers and dark clothes. Sometimes they\u2019re manageable. But genuinely heavy bleeding is also a signal worth taking seriously, not just tolerating.",
            "A practical marker: soaking through a pad or tampon every hour for several hours in a row, or passing clots larger than a coin, counts as heavy menstrual bleeding. It\u2019s common with estrogen dominance, and it matters partly because it\u2019s a frequent, overlooked cause of iron deficiency \u2014 which then drives its own fatigue.",
            "This isn\u2019t a reason to panic; it\u2019s a reason to mention it plainly to a doctor rather than minimising it. There are real options, and \u201Cthat\u2019s just how my periods are\u201D shouldn\u2019t be the end of the conversation."
          ],
          action:"One thing to do: if your bleeding regularly hits those markers, raise it specifically with a doctor and ask about checking your iron. Heavy isn\u2019t something you simply have to live with.",
          bookRef:'Cycle / Heavy Bleeding', productSlot:null, source:'book' },
        { id:'dl-ed-alcohol-harder', category:'nutrition', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Why alcohol lands harder when estrogen is already high",
          body:[
            "Alcohol affects every woman\u2019s hormones, but if your pattern leans estrogen-dominant, it\u2019s working against you on two fronts at once \u2014 which is worth knowing before the next glass.",
            "First, alcohol nudges estrogen levels up directly. Second, it leans on your liver, which is one of the organs responsible for clearing estrogen out. So at the very moment you have a bit too much estrogen, alcohol both adds more and slows the exit. It\u2019s a small input with an outsized effect on the symptoms you\u2019re already managing.",
            "This isn\u2019t a verdict of total abstinence. It\u2019s a clearer-eyed look at the trade: for an estrogen-dominant pattern, cutting back is one of the more directly useful changes available."
          ],
          action:"One thing to try: notice whether your tender, heavy, or moody weeks track with the weeks you drink more. For this pattern, less alcohol pays back quickly.",
          bookRef:'Food / What to Drink, What to Limit', productSlot:null, source:'book' },
        { id:'dl-ed-balance-not-just-lower', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"It\u2019s not only about lowering estrogen \u2014 it\u2019s the balance",
          body:[
            "Estrogen dominance is really a ratio: estrogen high relative to progesterone. That framing matters, because it means part of the answer isn\u2019t just clearing estrogen \u2014 it\u2019s protecting the progesterone side of the scale.",
            "Progesterone is made mainly after ovulation, and it\u2019s the first thing to suffer under chronic stress, since your body prioritises cortisol from the shared raw material. So the same stress that frays your sleep can quietly tilt the estrogen-progesterone balance further in the wrong direction.",
            "Which means stress regulation, decent sleep, and supporting healthy ovulation aren\u2019t separate from the estrogen story \u2014 they\u2019re the other half of it. Anti-inflammatory omega-3 fats support the same calmer, more balanced backdrop."
          ],
          action:"One thing to remember: protecting your calm and your sleep protects progesterone \u2014 which is half of fixing an estrogen-dominant pattern. Oily fish or an omega-3 supplement supports the anti-inflammatory side.",
          bookRef:'Stress / How Chronic Stress Hijacks Female Hormones', productSlot:'/recommends/omega-3', source:'book' }
      ],
      'progesterone-deficient': [
        { id:'dl-pd-luteal-protocol', category:'cycle', severity:'info',
          eyebrow:'Something to learn today',
          headline:"A simple protocol for the week progesterone runs low",
          body:[
            "When progesterone is on the low side, the back half of your cycle \u2014 and your sleep within it \u2014 takes the hit. Rather than white-knuckling through it each month, it helps to have a small, repeatable plan for that week.",
            "Three things do most of the work. Protect sleep deliberately, since this is the phase it frays. Keep blood sugar steady with protein and fibre at each meal, because the swings hit harder now. And ease the inputs that progesterone would normally buffer \u2014 caffeine and alcohol \u2014 which both feel sharper in this stretch.",
            "Magnesium is the one addition that consistently earns its place here, supporting sleep, mood and cramps across the luteal week. None of it is dramatic; the point is to have a default routine you repeat rather than reinventing it in the moment."
          ],
          action:"One thing to set up: a fixed luteal-week routine \u2014 protected sleep, steady meals, less caffeine and alcohol, and magnesium in the evening. Repeat it each cycle.",
          bookRef:'Cycle / The Luteal Phase', productSlot:'/recommends/magnesium', source:'book' },
        { id:'dl-pd-stress-steals', category:'stress', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Stress steals from progesterone first",
          body:[
            "If your progesterone already runs low, stress isn\u2019t just unpleasant \u2014 it\u2019s pouring water on exactly the wrong fire. The two systems are linked at the source, and the link explains a pattern many women feel but can\u2019t name.",
            "Progesterone and cortisol are built from a shared raw material. Under sustained stress, the body prioritises cortisol, and progesterone tends to lose out \u2014 which deepens the very deficiency you\u2019re working with. It\u2019s why a stressful stretch so reliably brings worse sleep, more anxiety, and sharper PMS for this pattern.",
            "So stress regulation isn\u2019t a side project here. For a progesterone-deficient pattern, protecting your calm is one of the most direct ways to protect the hormone itself."
          ],
          action:"One thing to prioritise: treat genuine downtime as part of your hormone plan, not a luxury. For this pattern, lowering stress directly protects progesterone.",
          bookRef:'Stress / How Chronic Stress Hijacks Female Hormones', productSlot:null, source:'book' },
        { id:'dl-pd-good-sleeper-gone', category:'sleep', severity:'info',
          eyebrow:'Something to learn today',
          headline:"When the good sleeper you used to be quietly disappears",
          body:[
            "Some women carry a lifelong identity as a good sleeper \u2014 head on the pillow, gone in minutes \u2014 and then, seemingly out of nowhere, it stops working. Lighter sleep, more waking, less of the deep rest that used to come free. It can feel disorienting, even a little like a loss of self.",
            "Progesterone is a large part of the story. It\u2019s mildly sedating and calms the brain through the GABA system, so when it runs low \u2014 in the luteal phase, or more persistently \u2014 sleep naturally becomes lighter and more easily broken. The good sleeper didn\u2019t fail; the hormonal support changed.",
            "Naming the cause helps, because it points at what actually moves the needle: supporting that calming system rather than just trying harder to sleep."
          ],
          action:"One thing to try: build a genuine wind-down before bed and keep your wake time steady. You\u2019re supporting the calming system that lighter progesterone no longer props up on its own.",
          bookRef:'Sleep / The Sleep-Hormone Two-Way Street', productSlot:null, source:'book' },
        { id:'dl-pd-name-the-absence', category:'mindset', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"What the calming hormone\u2019s absence actually feels like",
          body:[
            "Progesterone rarely gets named in everyday life, so when it runs low the effects get blamed on everything else \u2014 your personality, your stress levels, your supposed inability to cope. New irritability, a low hum of anxiety, a shorter fuse, sleep that won\u2019t hold.",
            "But progesterone is, in plain terms, the body\u2019s built-in calm. When there isn\u2019t enough of it, that internal buffer thins, and the same life genuinely feels harder to absorb. It isn\u2019t that you\u2019ve become a more anxious person; it\u2019s that you\u2019ve lost some of the chemistry that used to take the edge off.",
            "That reframe matters. It moves the problem from \u201Csomething is wrong with me\u201D to \u201Csomething is low, and low things can be supported.\u201D"
          ],
          action:"One thing to carry: if anxiety or irritability arrived without an obvious cause, consider that it may be hormonal, not a flaw in you. That shift alone can lower the self-blame.",
          bookRef:null, productSlot:null, source:'book' }
      ],
      'perimenopause-transitioner': [
        { id:'dl-pt-four-priorities', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The four things that matter most in perimenopause",
          body:[
            "Perimenopause can feel like a hundred small things going wrong at once, which makes it hard to know where to start. It helps to know that a short list does most of the heavy lifting \u2014 and you already have it.",
            "Protein rises in importance, since muscle needs defending now more than ever. Sleep stops being something you can be casual about. Stress management moves from optional to essential, because cortisol amplifies almost every other symptom on the list. And alcohol, particularly in the evening, is worth a harder look, given how much it worsens sleep and hot flushes.",
            "None of these is new advice. What\u2019s new is the stakes: in this decade, getting these four roughly right doesn\u2019t just feel better day to day \u2014 it shapes the long-term health of your bones, heart and brain."
          ],
          action:"One thing to choose today: pick whichever of the four \u2014 protein, sleep, stress, alcohol \u2014 is most obviously slipping, and nudge that one this week. Start where the gap is biggest.",
          bookRef:'Perimenopause / Managing the Transition', productSlot:null, source:'book' },
        { id:'dl-pt-hrt-conversation', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"How to walk into the HRT conversation prepared",
          body:[
            "If your symptoms are affecting your life, hormone therapy is worth a real conversation \u2014 and going in informed changes how that conversation goes. The fear many women carry traces back to one early reading of a 2002 study whose participants were, on average, more than a decade past menopause and using older formulations.",
            "The modern picture is different. Starting hormone therapy within about ten years of menopause appears to carry a favourable balance of benefit and risk for healthy women \u2014 the so-called timing hypothesis. Today\u2019s typical approach uses estrogen through the skin, which avoids the clot risk of the old oral route, paired with body-identical progesterone.",
            "You don\u2019t need to become an expert. You need enough to ask clear questions and not be waved away with \u201Cyou\u2019re too young\u201D or \u201Cjust wait it out.\u201D"
          ],
          action:"One thing to bring to the appointment: ask specifically about transdermal estrogen and body-identical progesterone, and what the real risks are for someone with your history. Informed questions get better answers.",
          bookRef:'Menopause and HRT', productSlot:null, source:'book+web' },
        { id:'dl-pt-brain-fog', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Brain fog in perimenopause isn\u2019t the start of decline",
          body:[
            "One of the most frightening parts of perimenopause is the quiet fear behind the fog: that this is the beginning of losing your mind, your competence, your edge \u2014 and that it\u2019s permanent. That fear deserves a direct answer, because it shapes how the whole experience feels.",
            "Here is the answer: estrogen is deeply involved in how your brain uses energy and forms memory, and as it swings through perimenopause, your thinking swings with it. The fog is your brain adjusting to a moving hormonal supply \u2014 not your brain breaking. For most women it lifts as hormones settle after menopause, and studies that follow women through the transition bear that out.",
            "Holding that distinction matters on a foggy day. You are not watching an early decline; you are weathering a hormonal phase, and phases pass."
          ],
          action:"One thing that helps the brain through this: the same foundations \u2014 sleep, movement, steady blood sugar \u2014 plus omega-3 fats, which support mood and cognition through the foggier stretches.",
          bookRef:'Perimenopause / The Symptoms No One Connects', productSlot:'/recommends/omega-3', source:'book+web' },
        { id:'dl-pt-symptom-map', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Knowing what comes early and what comes late",
          body:[
            "Part of what makes perimenopause so disorienting is not knowing where you are in it. Symptoms arrive in a rough order, and simply having the map makes the experience far less frightening.",
            "Earlier on \u2014 often from the late thirties or early forties \u2014 the quieter signs tend to come first: cycles varying by more than a week, worsening PMS, waking at 3 or 4 a.m., new anxiety, the beginnings of brain fog. The louder, more recognisable symptoms \u2014 hot flushes, night sweats, longer gaps between periods, vaginal dryness \u2014 usually belong to the later stretch.",
            "Most women move through these in roughly this order, though everyone\u2019s timing differs. The point isn\u2019t to predict yourself precisely; it\u2019s to recognise that there\u2019s a pattern, and you\u2019re somewhere on it \u2014 not lost."
          ],
          action:"One thing to do: locate yourself loosely on the early-to-late arc. Knowing roughly where you are turns a frightening mystery into a stage you can prepare for.",
          bookRef:'Perimenopause / Early vs Late', productSlot:null, source:'book' }
      ],
      'postmenopause-renewer': [
        { id:'dl-pm-protein-strength', category:'movement', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Protein and strength are the foundation of this decade",
          body:[
            "After menopause, with estrogen low and steady, the daily symptom storm usually settles \u2014 and the work quietly shifts to the long game. At the centre of it is muscle, which falls faster now without estrogen\u2019s protection, a process called sarcopenia.",
            "Muscle is far more than strength or shape. It\u2019s the body\u2019s largest site for managing blood sugar, a major contributor to bone strength through the load it places on the skeleton, and increasingly linked to brain health through the signals it sends during exercise. Protecting it supports bone, heart and brain at the same time.",
            "Two things defend it: enough protein across the day, and resistance training a couple of times a week. This is the single highest-return investment available in the postmenopausal decades, and it\u2019s never too late to begin."
          ],
          action:"One thing to build: protein at every meal plus two short strength sessions a week. Creatine is one of the best-studied, low-cost ways to support strength and recovery as you start.",
          bookRef:'Movement / Why Cardio Is Not Enough', productSlot:'/recommends/creatine', source:'book' },
        { id:'dl-pm-bone-silent', category:'supplements', severity:'info',
          eyebrow:'Something to learn today',
          headline:"Bone loss is silent \u2014 until it isn\u2019t",
          body:[
            "Bone is living tissue, constantly rebuilt, and estrogen is one of its key protectors. When estrogen falls around menopause, that protection lifts and bone loss speeds up sharply \u2014 women can lose 10 to 20 percent of bone density in the years right around the transition.",
            "It\u2019s called a silent disease because it gives no warning at all until a bone actually breaks \u2014 often a wrist or, more seriously, a hip. That silence is exactly why it\u2019s worth acting before there\u2019s any symptom to react to.",
            "The protectors are reassuringly within reach. Resistance training is the most powerful non-medical stimulus \u2014 bone strengthens in response to load, and nothing else replicates it. Adequate protein and calcium supply the materials, and vitamin D lets calcium be absorbed."
          ],
          action:"One thing to secure: load your bones with resistance work, and make sure the building blocks are there \u2014 protein, calcium, and a vitamin D3 with K2 so calcium goes to bone.",
          bookRef:'Postmenopause / Bones', productSlot:'/recommends/vitamin-d3-k2', source:'book' },
        { id:'dl-pm-heart-underestimated', category:'menopause', severity:'info',
          eyebrow:'Something to learn today',
          headline:"The risk women fear least is the one most likely",
          body:[
            "Most women fear breast cancer above all. Yet the leading cause of death in women is heart disease \u2014 by a wide margin, more than all cancers combined. That gap between what we fear and what is statistically most likely is one of the costliest blind spots in women\u2019s health.",
            "Through the reproductive years, estrogen helps keep blood vessels flexible and cholesterol favourable, which is part of why women are relatively protected from heart disease until midlife. After menopause that protection fades: cholesterol patterns shift, blood pressure often climbs, and risk rises to meet and eventually exceed men\u2019s.",
            "This isn\u2019t cause for alarm \u2014 it\u2019s cause for attention. Heart risk after menopause is largely modifiable, and much of what protects it is already familiar: movement, the right foods, not smoking, managing blood pressure, and strength that supports metabolic health."
          ],
          action:"One thing to put on your radar: ask about your blood pressure and cholesterol at your next check-up. After menopause, the heart deserves the attention we usually give elsewhere.",
          bookRef:'Postmenopause / The Heart', productSlot:null, source:'book' },
        { id:'dl-pm-genitourinary', category:'menopause', severity:'info',
          eyebrow:'Something to sit with today',
          headline:"The change no one warns you about \u2014 and it\u2019s treatable",
          body:[
            "There\u2019s a set of postmenopausal changes that almost no one mentions, so women often suffer them in silence, assuming they\u2019re just part of getting older: vaginal dryness, discomfort with intimacy, and more frequent or urgent trips to the bathroom or urinary infections.",
            "These tissues are rich in estrogen receptors, so as estrogen falls they become thinner and drier. It\u2019s extremely common, it tends to persist rather than pass, and \u2014 crucially \u2014 it is very treatable. This is not something you simply have to accept.",
            "Local estrogen, delivered right where it\u2019s needed, is highly effective and works differently from whole-body hormone therapy. The biggest barrier is usually not the treatment \u2014 it\u2019s that no one told women it was worth raising."
          ],
          action:"One thing to do if this is you: raise it plainly with a doctor and ask specifically about local (vaginal) estrogen. It\u2019s common, it\u2019s treatable, and you don\u2019t have to live with it.",
          bookRef:'Postmenopause / Vaginal & Urinary Health', productSlot:null, source:'book' }
      ]
    }
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
