import type { PrescribedExercise, WarmUpItem, WorkoutTemplate } from '../domain/types'

const r = (min: number, max: number = min) => ({ min, max })

// ---------------------------------------------------------------------------
// Warm-ups
// ---------------------------------------------------------------------------

const LEG_WARM_UP: WarmUpItem[] = [
  { id: 'leg-wu-1', exerciseId: 'easy-cycling', label: 'Easy cycling', dose: '3–4 min' },
  {
    id: 'leg-wu-2',
    exerciseId: 'knee-to-wall-ankle-rocks',
    label: 'Knee-to-wall ankle rocks',
    dose: '8/side',
  },
  {
    id: 'leg-wu-3',
    exerciseId: 'hip-90-90-transitions',
    label: '90/90 hip transitions',
    dose: '6/side',
  },
  {
    id: 'leg-wu-4',
    exerciseId: 'adductor-rock-backs',
    label: 'Adductor rock-backs',
    dose: '8/side',
  },
  {
    id: 'leg-wu-5',
    exerciseId: 'reverse-lunge-with-reach',
    label: 'Reverse lunge with reach',
    dose: '5/side',
  },
  { id: 'leg-wu-6', exerciseId: 'bodyweight-squat', label: 'Bodyweight squats', dose: '8' },
  {
    id: 'leg-wu-7',
    exerciseId: 'low-pogo-hops',
    label: 'Low pogo hops',
    dose: 'From Week 3 they are part of the workout',
  },
  {
    id: 'leg-wu-8',
    exerciseId: 'back-squat',
    label: 'Back-squat ramp',
    dose: 'Empty bar × 8–10; ~40–50% of work weight × 5; 60–70% × 3; 75–85% × 1–2',
  },
]

const PUSH_WARM_UP: WarmUpItem[] = [
  { id: 'push-wu-1', label: 'Easy rower or bike', dose: '3 min' },
  {
    id: 'push-wu-2',
    exerciseId: 'thoracic-extensions',
    label: 'Thoracic extensions over a bench or roller',
    dose: '6',
  },
  { id: 'push-wu-3', exerciseId: 'wall-slides', label: 'Wall slides', dose: '8' },
  { id: 'push-wu-4', exerciseId: 'scapular-push-ups', label: 'Scapular push-ups', dose: '8' },
  {
    id: 'push-wu-5',
    exerciseId: 'band-external-rotations',
    label: 'Light band external rotations',
    dose: '10/side',
  },
  {
    id: 'push-wu-6',
    exerciseId: 'barbell-bench-press',
    label: 'Progressive warm-up sets for barbell bench press',
    dose: 'As needed',
  },
]

const PULL_WARM_UP: WarmUpItem[] = [
  { id: 'pull-wu-1', exerciseId: 'easy-rowing', label: 'Easy rowing', dose: '3 min' },
  {
    id: 'pull-wu-2',
    exerciseId: 'cat-cow',
    label: 'Cat–cow or controlled thoracic flexion/extension',
    dose: '6',
  },
  {
    id: 'pull-wu-3',
    exerciseId: 'side-lying-thoracic-rotations',
    label: 'Side-lying thoracic rotations',
    dose: '5/side',
  },
  { id: 'pull-wu-4', exerciseId: 'scapular-pull-ups', label: 'Scapular pull-ups', dose: '6–8' },
  {
    id: 'pull-wu-5',
    exerciseId: 'band-pull-aparts',
    label: 'Light band pull-aparts',
    dose: '10–12',
  },
  {
    id: 'pull-wu-6',
    exerciseId: 'pull-up',
    label: 'Easy pull-up or pulldown preparation set',
    dose: '1 set',
  },
]

const MOBILITY_DYNAMIC: WarmUpItem[] = [
  { id: 'mob-dyn-1', exerciseId: 'cat-cow', label: 'Cat–cow', dose: '6 slow reps' },
  {
    id: 'mob-dyn-2',
    exerciseId: 'hip-90-90-transitions',
    label: '90/90 hip transitions',
    dose: '6/side',
  },
  {
    id: 'mob-dyn-3',
    exerciseId: 'adductor-rock-backs',
    label: 'Adductor rock-backs',
    dose: '8/side',
  },
  {
    id: 'mob-dyn-4',
    exerciseId: 'knee-to-wall-ankle-rocks',
    label: 'Knee-to-wall ankle rocks',
    dose: '8–10/side',
  },
  {
    id: 'mob-dyn-5',
    exerciseId: 'side-lying-open-books',
    label: 'Side-lying open books',
    dose: '6/side',
  },
  {
    id: 'mob-dyn-6',
    exerciseId: 'kettlebell-halos',
    label: 'Kettlebell halos',
    dose: '2 × 5–6 each direction, light and controlled',
  },
]

const MOBILITY_STRETCHES: WarmUpItem[] = [
  {
    id: 'mob-str-1',
    exerciseId: 'half-kneeling-hip-flexor-stretch',
    label: 'Half-kneeling hip-flexor stretch',
    dose: '2 × 30–45 s/side',
  },
  {
    id: 'mob-str-2',
    exerciseId: 'straight-knee-calf-stretch',
    label: 'Straight-knee calf stretch',
    dose: '1 × 45 s/side',
  },
  {
    id: 'mob-str-3',
    exerciseId: 'bent-knee-soleus-stretch',
    label: 'Bent-knee soleus stretch',
    dose: '1 × 45 s/side',
  },
  {
    id: 'mob-str-4',
    exerciseId: 'adductor-rock-frog-stretch',
    label: 'Adductor rock/frog stretch',
    dose: '2 × 30–45 s',
  },
  {
    id: 'mob-str-5',
    exerciseId: 'supine-hamstring-stretch',
    label: 'Supine hamstring stretch',
    dose: '1 × 45 s/side',
  },
  {
    id: 'mob-str-6',
    exerciseId: 'figure-four-glute-stretch',
    label: 'Figure-four glute stretch',
    dose: '1 × 45 s/side',
  },
  {
    id: 'mob-str-7',
    exerciseId: 'kneeling-lat-stretch',
    label: 'Kneeling lat stretch on bench',
    dose: '1 × 45 s',
  },
  {
    id: 'mob-str-8',
    exerciseId: 'doorway-pec-stretch',
    label: 'Doorway pectoral stretch',
    dose: '1 × 30–45 s/side',
  },
]

// ---------------------------------------------------------------------------
// LEG
// ---------------------------------------------------------------------------

const POGO: PrescribedExercise = {
  exerciseId: 'low-pogo-hops',
  order: 1,
  prescription: '2 × 10',
  sets: r(2),
  reps: r(10),
  rest: '60–90 s',
  restSeconds: r(60, 90),
  focus: 'Small elastic/power exposure',
}

const LEG_STANDARD: PrescribedExercise[] = [
  {
    exerciseId: 'back-squat',
    order: 2,
    prescription: '3 × 4–6 at RIR 2–3',
    sets: r(3),
    reps: r(4, 6),
    rir: r(2, 3),
    rest: '2.5–4 min',
    restSeconds: r(150, 240),
    focus: 'Bilateral lower-body strength',
  },
  {
    exerciseId: 'romanian-deadlift',
    order: 3,
    prescription: '3 × 6–8 at RIR 2',
    sets: r(3),
    reps: r(6, 8),
    rir: r(2),
    rest: '2–3 min',
    restSeconds: r(120, 180),
    focus: 'Hip hinge/posterior chain',
  },
  {
    exerciseId: 'reverse-lunge-or-bss',
    order: 4,
    prescription: '2 × 6–8 per leg at RIR 2',
    sets: r(2),
    reps: r(6, 8),
    perSide: true,
    rir: r(2),
    rest: '90–150 s',
    restSeconds: r(90, 150),
    focus: 'Unilateral strength/control',
  },
  {
    exerciseId: 'seated-leg-curl',
    order: 5,
    prescription: '2 × 8–12 at RIR 1–2',
    sets: r(2),
    reps: r(8, 12),
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Knee-flexion hamstring strength',
  },
  {
    exerciseId: 'seated-calf-raise',
    order: 6,
    prescription: '3 × 8–12 at RIR 1–2',
    sets: r(3),
    reps: r(8, 12),
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Soleus/plantar-flexor capacity',
  },
  {
    exerciseId: 'adductor-machine',
    order: 7,
    prescription: '2 × 10–15 at RIR 2',
    sets: r(2),
    reps: r(10, 15),
    rir: r(2),
    rest: '60–90 s',
    restSeconds: r(60, 90),
    focus: 'Direct adductor dose',
  },
  {
    exerciseId: 'side-plank',
    order: 8,
    prescription: '2 × 25–40 s/side',
    sets: r(2),
    holdSeconds: r(25, 40),
    perSide: true,
    rest: '60 s',
    restSeconds: r(60),
    focus: 'Trunk control; Pallof press is an alternative',
  },
]

/** Week 1 reduced introductory volume. Side plank is not reduced by the plan. */
const LEG_INTRO: PrescribedExercise[] = [
  {
    exerciseId: 'back-squat',
    order: 2,
    prescription: '2 × 5 at RIR 3',
    sets: r(2),
    reps: r(5),
    rir: r(3),
    rest: '2.5–4 min',
    restSeconds: r(150, 240),
    focus: 'Bilateral lower-body strength',
  },
  {
    exerciseId: 'romanian-deadlift',
    order: 3,
    prescription: '2 × 6 at RIR 3',
    sets: r(2),
    reps: r(6),
    rir: r(3),
    rest: '2–3 min',
    restSeconds: r(120, 180),
    focus: 'Hip hinge/posterior chain',
  },
  {
    exerciseId: 'reverse-lunge-or-bss',
    order: 4,
    prescription: '2 × 6 per leg at RIR 3',
    sets: r(2),
    reps: r(6),
    perSide: true,
    rir: r(3),
    rest: '90–150 s',
    restSeconds: r(90, 150),
    focus: 'Unilateral strength/control',
  },
  {
    exerciseId: 'seated-leg-curl',
    order: 5,
    prescription: '2 × 10',
    sets: r(2),
    reps: r(10),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Knee-flexion hamstring strength',
  },
  {
    exerciseId: 'seated-calf-raise',
    order: 6,
    prescription: '2 × 10',
    sets: r(2),
    reps: r(10),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Soleus/plantar-flexor capacity',
  },
  {
    exerciseId: 'adductor-machine',
    order: 7,
    prescription: '1–2 × 12',
    sets: r(1, 2),
    reps: r(12),
    rest: '60–90 s',
    restSeconds: r(60, 90),
    focus: 'Direct adductor dose',
  },
  LEG_STANDARD[6]!,
]

const LEG_COMMON = {
  kind: 'gym',
  type: 'leg',
  title: 'Leg Strength',
  goal: 'Lower-body strength: squat, hinge, single-leg work, hamstrings, calves and adductors.',
  warmUpTitle: 'Warm-up',
  warmUp: LEG_WARM_UP,
  cooldown: [],
  alternatives: ['Side plank → Pallof press', 'Reverse lunge ↔ Bulgarian split squat'],
  variants: [],
  coachingNote: 'Warm-up sets are never logged. Log working sets only.',
} as const

// ---------------------------------------------------------------------------
// PUSH
// ---------------------------------------------------------------------------

const PUSH_EXERCISES: PrescribedExercise[] = [
  {
    exerciseId: 'barbell-bench-press',
    order: 1,
    prescription: '4 × 4–6 at RIR 2',
    sets: r(4),
    reps: r(4, 6),
    rir: r(2),
    rest: '2.5–4 min',
    restSeconds: r(150, 240),
    focus: 'Main measurable press',
  },
  {
    exerciseId: 'low-incline-db-press',
    order: 2,
    prescription: '3 × 8–12 at RIR 1–2 (20–30° incline)',
    sets: r(3),
    reps: r(8, 12),
    rir: r(1, 2),
    rest: '2–3 min',
    restSeconds: r(120, 180),
    focus: 'Clavicular chest emphasis',
  },
  {
    exerciseId: 'smith-shoulder-press',
    order: 3,
    prescription: '2 × 8–12 at RIR 1–2',
    sets: r(2),
    reps: r(8, 12),
    rir: r(1, 2),
    rest: '2 min',
    restSeconds: r(120),
    focus: 'Front deltoid/overhead strength',
  },
  {
    exerciseId: 'pec-deck',
    order: 4,
    prescription: '2 × 10–15 at RIR 1–2',
    sets: r(2),
    reps: r(10, 15),
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Chest isolation',
  },
  {
    exerciseId: 'preacher-curl',
    order: 5,
    prescription: '3 × 8–12 at RIR 1–2',
    sets: r(3),
    reps: r(8, 12),
    rir: r(1, 2),
    rest: '90–120 s',
    restSeconds: r(90, 120),
    focus: 'Stable supinated curl',
  },
  {
    exerciseId: 'db-hammer-curl',
    order: 6,
    prescription: '2–3 × 10–15 at RIR 1–2',
    sets: r(2, 3),
    reps: r(10, 15),
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Brachialis/brachioradialis',
  },
]

// ---------------------------------------------------------------------------
// PULL
// ---------------------------------------------------------------------------

const PULL_EXERCISES: PrescribedExercise[] = [
  {
    exerciseId: 'pull-up',
    order: 1,
    prescription: '4 × 6–10 at RIR 1–2',
    sets: r(4),
    reps: r(6, 10),
    rir: r(1, 2),
    rest: '2.5–3.5 min',
    restSeconds: r(150, 210),
    focus: 'Vertical pulling strength/lats',
  },
  {
    exerciseId: 'chest-supported-row',
    order: 2,
    prescription: '3 × 6–10 at RIR 1–2',
    sets: r(3),
    reps: r(6, 10),
    rir: r(1, 2),
    rest: '2–3 min',
    restSeconds: r(120, 180),
    focus: 'Horizontal pulling/upper back',
  },
  {
    exerciseId: 'one-arm-cable-lat-row',
    order: 3,
    prescription: '2 × 10–15 per side at RIR 1–2',
    sets: r(2),
    reps: r(10, 15),
    perSide: true,
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Unilateral lat work',
  },
  {
    exerciseId: 'reverse-pec-deck',
    order: 4,
    prescription: '3 × 12–20 at RIR 1–2',
    sets: r(3),
    reps: r(12, 20),
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Posterior deltoid/upper back',
  },
  {
    exerciseId: 'cable-lateral-raise',
    order: 5,
    prescription: '2–3 × 12–20 at RIR 1–2',
    sets: r(2, 3),
    reps: r(12, 20),
    rir: r(1, 2),
    rest: '60–90 s',
    restSeconds: r(60, 90),
    focus: 'Middle deltoid',
  },
  {
    exerciseId: 'overhead-cable-triceps-extension',
    order: 6,
    prescription: '3 × 8–12 at RIR 1–2',
    sets: r(3),
    reps: r(8, 12),
    rir: r(1, 2),
    rest: '90–120 s',
    restSeconds: r(90, 120),
    focus: 'Lengthened triceps/long head',
  },
  {
    exerciseId: 'cable-pushdown',
    order: 7,
    prescription: '2 × 10–15 at RIR 1–2',
    sets: r(2),
    reps: r(10, 15),
    rir: r(1, 2),
    rest: '75–120 s',
    restSeconds: r(75, 120),
    focus: 'Additional triceps work',
  },
  {
    exerciseId: 'shrug',
    order: 8,
    prescription: 'Optional 2 × 8–15 at RIR 1–2',
    sets: r(2),
    reps: r(8, 15),
    rir: r(1, 2),
    rest: '90–120 s',
    restSeconds: r(90, 120),
    focus: 'Upper trapezius',
    optional: true,
  },
]

// ---------------------------------------------------------------------------
// Mobility & core
// ---------------------------------------------------------------------------

const CORE_A: PrescribedExercise[] = [
  {
    exerciseId: 'kb-dead-bug-pullover',
    order: 1,
    prescription: '3 × 6–8',
    sets: r(3),
    reps: r(6, 8),
    rest: '60–75 s',
    restSeconds: r(60, 75),
  },
  {
    exerciseId: 'plank-kb-pass-through',
    order: 2,
    prescription: '3 × 6–8 each direction',
    sets: r(3),
    reps: r(6, 8),
    eachDirection: true,
    rest: '60–90 s',
    restSeconds: r(60, 90),
  },
  {
    exerciseId: 'half-kneeling-kb-woodchopper',
    order: 3,
    prescription: '3 × 8–10/side',
    sets: r(3),
    reps: r(8, 10),
    perSide: true,
    rest: '60–90 s',
    restSeconds: r(60, 90),
  },
  {
    exerciseId: 'seated-controlled-twist',
    order: 4,
    prescription: '2 × 8–10/side',
    sets: r(2),
    reps: r(8, 10),
    perSide: true,
    rest: '60 s',
    restSeconds: r(60),
  },
]

const CORE_B: PrescribedExercise[] = [
  {
    exerciseId: 'kb-around-the-world',
    order: 1,
    prescription: '3 × 8–12 each direction',
    sets: r(3),
    reps: r(8, 12),
    eachDirection: true,
    rest: '60 s',
    restSeconds: r(60),
  },
  {
    exerciseId: 'suitcase-march',
    order: 2,
    prescription: '3 × 30–45 s/side',
    sets: r(3),
    holdSeconds: r(30, 45),
    perSide: true,
    rest: '60–90 s',
    restSeconds: r(60, 90),
  },
  {
    exerciseId: 'kb-oblique-drop',
    order: 3,
    prescription: '2–3 × 8–12/side',
    sets: r(2, 3),
    reps: r(8, 12),
    perSide: true,
    rest: '60–75 s',
    restSeconds: r(60, 75),
  },
  {
    exerciseId: 'controlled-lateral-rotation',
    order: 4,
    prescription: '2–3 × 8/side',
    sets: r(2, 3),
    reps: r(8),
    perSide: true,
    rest: '60–75 s',
    restSeconds: r(60, 75),
    focus: 'Technique needs final confirmation. Keep load light; avoid forced lumbar rotation.',
  },
]

const MOB_COMMON = {
  kind: 'mobility',
  type: 'mob',
  goal: 'Hip, ankle and thoracic mobility, kettlebell core work, then static stretching.',
  warmUpTitle: 'Dynamic mobility',
  warmUp: MOBILITY_DYNAMIC,
  cooldownTitle: 'Static stretching',
  cooldown: MOBILITY_STRETCHES,
  alternatives: [],
  variants: [],
  coachingNote: 'Best done later in the day, after the Tuesday run.',
} as const

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const WORKOUT_TEMPLATES = [
  {
    ...LEG_COMMON,
    id: 'leg-intro',
    exercises: LEG_INTRO,
    techniqueNotes: ['Week 1 introductory volume. No pogo hops yet.'],
  },
  {
    ...LEG_COMMON,
    id: 'leg-base',
    exercises: LEG_STANDARD,
    techniqueNotes: ['Pogo hops start in Week 3.'],
  },
  {
    ...LEG_COMMON,
    id: 'leg-full',
    exercises: [POGO, ...LEG_STANDARD],
    techniqueNotes: ['Low pogo hops come first while fresh: small, quick, quiet contacts.'],
  },
  {
    id: 'push',
    kind: 'gym',
    type: 'push',
    title: 'Upper Body',
    goal: 'Chest, biceps and front-shoulder strength; bench press is the main measurable lift.',
    warmUpTitle: 'Warm-up',
    warmUp: PUSH_WARM_UP,
    exercises: PUSH_EXERCISES,
    cooldown: [],
    techniqueNotes: [
      'Bench uses double progression: build from 4 reps toward 4 × 6, then add the smallest practical load.',
      'Incline should stay around 20–30°, not excessively steep.',
      'Pec deck: back supported, small fixed elbow bend, handles around mid/lower chest, finish with controlled horizontal adduction without rolling shoulders forward.',
      'Default to Smith shoulder press; Arnold press is an alternative block variation.',
      'Do not add front raises, dips, extra flies, or shrugs to this session.',
    ],
    alternatives: [
      'Preacher curl ↔ incline dumbbell curl ↔ Bayesian cable curl',
      'Dumbbell hammer curl ↔ rope hammer curl ↔ neutral-grip cable curl',
      'Change biceps alternatives in blocks of 4–6 weeks, not randomly every week.',
    ],
    variants: [
      {
        id: 'push-fatigue-a',
        title: 'Fatigue contingency · A week',
        summary: 'Contingency only, not the default plan.',
        items: ['Bench 4 × 4–6', 'Incline DB 2–3 × 8–12', 'Omit shoulder press'],
      },
      {
        id: 'push-fatigue-b',
        title: 'Fatigue contingency · B week',
        summary: 'Contingency only, not the default plan.',
        items: ['Bench 4 × 6–8 lighter', 'Omit incline', 'Shoulder press 3 × 8–12'],
      },
    ],
    coachingNote: 'Warm-up sets are never logged. Log working sets only.',
  },
  {
    id: 'pull',
    kind: 'gym',
    type: 'pull',
    title: 'Upper Body',
    goal: 'Back, triceps and rear/lateral shoulder strength; pull-ups are the main measurable lift.',
    warmUpTitle: 'Warm-up',
    warmUp: PULL_WARM_UP,
    exercises: PULL_EXERCISES,
    cooldown: [],
    techniqueNotes: [
      'Pull-ups: record all four set totals.',
      'Once 4 × 10 is completed cleanly at RIR 1–2, add about 2.5 kg and return to 4 × 6–8.',
      'If later sets drop below six clean reps, assisted reps may finish the range.',
    ],
    alternatives: [
      'Pull-up: weighted pull-up, chin-up, neutral-grip pulldown',
      'Chest-supported row: incline dumbbell row, seated cable row, inverted row',
      'One-arm cable lat row: half-kneeling pulldown, one-arm machine row, straight-arm pulldown',
      'Reverse pec deck: cable reverse fly, chest-supported rear-delt raise, face pull',
      'Cable lateral raise: dumbbell or machine lateral raise',
      'Overhead extension: single-arm overhead cable or overhead dumbbell extension',
      'Pushdown: cross-body extension, machine dip, close-grip push-up',
      'Shrug: cable or trap-bar shrug',
    ],
    // High-fatigue and race-week variants: content pending from the owner.
    variants: [],
    coachingNote: 'Warm-up sets are never logged. Log working sets only.',
  },
  { ...MOB_COMMON, id: 'mob-a', title: 'Mobility + Core A', exercises: CORE_A, techniqueNotes: [] },
  {
    ...MOB_COMMON,
    id: 'mob-b',
    title: 'Mobility + Core B',
    exercises: CORE_B,
    techniqueNotes: [
      'Controlled lateral rotation requires final technique confirmation. Keep load light and avoid forced lumbar rotation.',
    ],
  },
] as const satisfies readonly WorkoutTemplate[]

export type TemplateId = (typeof WORKOUT_TEMPLATES)[number]['id']

const byId = new Map<string, WorkoutTemplate>(WORKOUT_TEMPLATES.map((t) => [t.id, t]))

export function getTemplate(id: string): WorkoutTemplate {
  const template = byId.get(id)
  if (!template) throw new Error(`Unknown workout template: ${id}`)
  return template
}
