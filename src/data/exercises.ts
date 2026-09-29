import type { ExerciseDefinition } from '../domain/types'

/**
 * Canonical exercise definitions. Library copy (purpose, setup, cues, mistakes)
 * lives separately in the library feature data and is keyed by these IDs.
 */
export const EXERCISES = [
  // --- LEG -----------------------------------------------------------------
  {
    id: 'low-pogo-hops',
    name: 'Low pogo hops',
    category: 'plyometric',
    muscleFocus: 'Calves, ankle stiffness, elastic power',
    logKind: 'contacts',
    alternatives: [],
  },
  {
    id: 'back-squat',
    name: 'Back squat',
    category: 'lower-body',
    muscleFocus: 'Quads, glutes, adductors',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian deadlift',
    category: 'lower-body',
    muscleFocus: 'Hamstrings, glutes, posterior chain',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'reverse-lunge-or-bss',
    name: 'Reverse lunge or Bulgarian split squat',
    category: 'lower-body',
    muscleFocus: 'Quads, glutes, single-leg control',
    logKind: 'unilateral',
    alternatives: ['Reverse lunge', 'Bulgarian split squat'],
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated leg curl',
    category: 'lower-body',
    muscleFocus: 'Hamstrings (knee flexion)',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated calf raise',
    category: 'lower-body',
    muscleFocus: 'Soleus, plantar flexors',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'adductor-machine',
    name: 'Adductor machine',
    category: 'lower-body',
    muscleFocus: 'Adductors',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'side-plank',
    name: 'Side plank',
    category: 'core',
    muscleFocus: 'Obliques, lateral trunk control',
    logKind: 'timed',
    alternatives: ['Pallof press'],
  },

  // --- PUSH ----------------------------------------------------------------
  {
    id: 'barbell-bench-press',
    name: 'Barbell bench press',
    category: 'chest',
    muscleFocus: 'Chest, front delts, triceps',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'low-incline-db-press',
    name: 'Low-incline dumbbell press',
    category: 'chest',
    muscleFocus: 'Upper (clavicular) chest, front delts',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'smith-shoulder-press',
    name: 'Smith-machine shoulder press',
    category: 'shoulders',
    muscleFocus: 'Front delts, triceps',
    logKind: 'loaded',
    alternatives: ['Arnold press (block variation)'],
  },
  {
    id: 'pec-deck',
    name: 'Pec-deck machine',
    category: 'chest',
    muscleFocus: 'Chest (horizontal adduction)',
    logKind: 'loaded',
    alternatives: [],
  },
  {
    id: 'preacher-curl',
    name: 'Preacher curl',
    category: 'biceps',
    muscleFocus: 'Biceps',
    logKind: 'loaded',
    alternatives: ['Incline dumbbell curl', 'Bayesian cable curl'],
  },
  {
    id: 'db-hammer-curl',
    name: 'Dumbbell hammer curl',
    category: 'biceps',
    muscleFocus: 'Brachialis, brachioradialis',
    logKind: 'loaded',
    alternatives: ['Rope hammer curl', 'Neutral-grip cable curl'],
  },

  // --- PULL ----------------------------------------------------------------
  {
    id: 'pull-up',
    name: 'Pull-ups',
    category: 'back',
    muscleFocus: 'Lats, upper back, biceps',
    logKind: 'bodyweight-loadable',
    alternatives: ['Weighted pull-up', 'Chin-up', 'Neutral-grip pulldown'],
  },
  {
    id: 'chest-supported-row',
    name: 'Chest-supported row',
    category: 'back',
    muscleFocus: 'Upper back, lats, rear delts',
    logKind: 'loaded',
    alternatives: ['Incline dumbbell row', 'Seated cable row', 'Inverted row'],
  },
  {
    id: 'one-arm-cable-lat-row',
    name: 'One-arm cable lat row',
    category: 'back',
    muscleFocus: 'Lats (unilateral)',
    logKind: 'unilateral',
    alternatives: ['Half-kneeling pulldown', 'One-arm machine row', 'Straight-arm pulldown'],
  },
  {
    id: 'reverse-pec-deck',
    name: 'Reverse pec deck',
    category: 'shoulders',
    muscleFocus: 'Rear delts, upper back',
    logKind: 'loaded',
    alternatives: ['Cable reverse fly', 'Chest-supported rear-delt raise', 'Face pull'],
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable lateral raise',
    category: 'shoulders',
    muscleFocus: 'Middle delts',
    logKind: 'loaded',
    alternatives: ['Dumbbell lateral raise', 'Machine lateral raise'],
  },
  {
    id: 'overhead-cable-triceps-extension',
    name: 'Overhead cable triceps extension',
    category: 'triceps',
    muscleFocus: 'Triceps (long head, lengthened)',
    logKind: 'loaded',
    alternatives: ['Single-arm overhead cable extension', 'Overhead dumbbell extension'],
  },
  {
    id: 'cable-pushdown',
    name: 'Cable pushdown',
    category: 'triceps',
    muscleFocus: 'Triceps',
    logKind: 'loaded',
    alternatives: ['Cross-body extension', 'Machine dip', 'Close-grip push-up'],
  },
  {
    id: 'shrug',
    name: 'Dumbbell or machine shrug',
    category: 'back',
    muscleFocus: 'Upper trapezius',
    logKind: 'loaded',
    alternatives: ['Cable shrug', 'Trap-bar shrug'],
  },

  // --- Warm-up drills --------------------------------------------------------
  {
    id: 'easy-cycling',
    name: 'Easy cycling',
    category: 'warm-up',
    muscleFocus: 'General warm-up',
    alternatives: [],
  },
  {
    id: 'easy-rowing',
    name: 'Easy rowing',
    category: 'warm-up',
    muscleFocus: 'General warm-up, upper back',
    alternatives: ['Easy bike'],
  },
  {
    id: 'knee-to-wall-ankle-rocks',
    name: 'Knee-to-wall ankle rocks',
    category: 'mobility',
    muscleFocus: 'Ankle dorsiflexion',
    alternatives: [],
  },
  {
    id: 'hip-90-90-transitions',
    name: '90/90 hip transitions',
    category: 'mobility',
    muscleFocus: 'Hip internal/external rotation',
    alternatives: [],
  },
  {
    id: 'adductor-rock-backs',
    name: 'Adductor rock-backs',
    category: 'mobility',
    muscleFocus: 'Adductors, hips',
    alternatives: [],
  },
  {
    id: 'reverse-lunge-with-reach',
    name: 'Reverse lunge with reach',
    category: 'warm-up',
    muscleFocus: 'Hip flexors, glutes, trunk',
    alternatives: [],
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight squats',
    category: 'warm-up',
    muscleFocus: 'Squat pattern rehearsal',
    alternatives: [],
  },
  {
    id: 'thoracic-extensions',
    name: 'Thoracic extensions over a bench or roller',
    category: 'mobility',
    muscleFocus: 'Thoracic spine extension',
    alternatives: [],
  },
  {
    id: 'wall-slides',
    name: 'Wall slides',
    category: 'warm-up',
    muscleFocus: 'Scapular upward rotation, shoulders',
    alternatives: [],
  },
  {
    id: 'scapular-push-ups',
    name: 'Scapular push-ups',
    category: 'warm-up',
    muscleFocus: 'Serratus anterior, scapular control',
    alternatives: [],
  },
  {
    id: 'band-external-rotations',
    name: 'Light band external rotations',
    category: 'warm-up',
    muscleFocus: 'Rotator cuff',
    alternatives: [],
  },
  {
    id: 'cat-cow',
    name: 'Cat–cow',
    category: 'mobility',
    muscleFocus: 'Spinal flexion/extension',
    alternatives: ['Controlled thoracic flexion/extension'],
  },
  {
    id: 'side-lying-thoracic-rotations',
    name: 'Side-lying thoracic rotations',
    category: 'mobility',
    muscleFocus: 'Thoracic rotation',
    alternatives: [],
  },
  {
    id: 'scapular-pull-ups',
    name: 'Scapular pull-ups',
    category: 'warm-up',
    muscleFocus: 'Lower traps, scapular depression',
    alternatives: [],
  },
  {
    id: 'band-pull-aparts',
    name: 'Light band pull-aparts',
    category: 'warm-up',
    muscleFocus: 'Rear delts, mid traps',
    alternatives: [],
  },

  // --- Mobility & core -------------------------------------------------------
  {
    id: 'side-lying-open-books',
    name: 'Side-lying open books',
    category: 'mobility',
    muscleFocus: 'Thoracic rotation, chest opening',
    alternatives: [],
  },
  {
    id: 'kettlebell-halos',
    name: 'Kettlebell halos',
    category: 'mobility',
    muscleFocus: 'Shoulders, upper back, trunk control',
    alternatives: [],
  },
  {
    id: 'kb-dead-bug-pullover',
    name: 'Kettlebell dead bug pullover',
    category: 'core',
    muscleFocus: 'Deep abdominals, anti-extension',
    alternatives: [],
  },
  {
    id: 'plank-kb-pass-through',
    name: 'Plank kettlebell pass-through',
    category: 'core',
    muscleFocus: 'Anti-rotation, shoulder stability',
    alternatives: [],
  },
  {
    id: 'half-kneeling-kb-woodchopper',
    name: 'Half-kneeling kettlebell woodchopper',
    category: 'core',
    muscleFocus: 'Obliques, rotational control',
    alternatives: [],
  },
  {
    id: 'seated-controlled-twist',
    name: 'Seated controlled twist',
    category: 'core',
    muscleFocus: 'Obliques',
    alternatives: [],
  },
  {
    id: 'kb-around-the-world',
    name: 'Kettlebell around-the-world',
    category: 'core',
    muscleFocus: 'Trunk stability, grip',
    alternatives: [],
  },
  {
    id: 'suitcase-march',
    name: 'Suitcase march',
    category: 'core',
    muscleFocus: 'Lateral trunk, hip stability',
    alternatives: [],
  },
  {
    id: 'kb-oblique-drop',
    name: 'Kettlebell oblique drop',
    category: 'core',
    muscleFocus: 'Obliques (lateral flexion)',
    alternatives: [],
  },
  {
    id: 'controlled-lateral-rotation',
    name: 'Controlled lateral rotation',
    category: 'core',
    muscleFocus: 'Obliques, rotational control',
    alternatives: [],
    needsTechniqueConfirmation: true,
    caution: 'Keep the load light and avoid forced lumbar rotation.',
  },

  // --- Static stretching -----------------------------------------------------
  {
    id: 'half-kneeling-hip-flexor-stretch',
    name: 'Half-kneeling hip-flexor stretch',
    category: 'stretch',
    muscleFocus: 'Hip flexors',
    alternatives: [],
  },
  {
    id: 'straight-knee-calf-stretch',
    name: 'Straight-knee calf stretch',
    category: 'stretch',
    muscleFocus: 'Gastrocnemius',
    alternatives: [],
  },
  {
    id: 'bent-knee-soleus-stretch',
    name: 'Bent-knee soleus stretch',
    category: 'stretch',
    muscleFocus: 'Soleus',
    alternatives: [],
  },
  {
    id: 'adductor-rock-frog-stretch',
    name: 'Adductor rock/frog stretch',
    category: 'stretch',
    muscleFocus: 'Adductors',
    alternatives: [],
  },
  {
    id: 'supine-hamstring-stretch',
    name: 'Supine hamstring stretch',
    category: 'stretch',
    muscleFocus: 'Hamstrings',
    alternatives: [],
  },
  {
    id: 'figure-four-glute-stretch',
    name: 'Figure-four glute stretch',
    category: 'stretch',
    muscleFocus: 'Glutes, deep hip rotators',
    alternatives: [],
  },
  {
    id: 'kneeling-lat-stretch',
    name: 'Kneeling lat stretch on bench',
    category: 'stretch',
    muscleFocus: 'Lats',
    alternatives: [],
  },
  {
    id: 'doorway-pec-stretch',
    name: 'Doorway pectoral stretch',
    category: 'stretch',
    muscleFocus: 'Pecs, front shoulder',
    alternatives: [],
  },
] as const satisfies readonly ExerciseDefinition[]

export type ExerciseId = (typeof EXERCISES)[number]['id']

const byId = new Map<string, ExerciseDefinition>(EXERCISES.map((e) => [e.id, e]))

export function getExercise(id: string): ExerciseDefinition {
  const exercise = byId.get(id)
  if (!exercise) throw new Error(`Unknown exercise: ${id}`)
  return exercise
}

export function findExercise(id: string): ExerciseDefinition | undefined {
  return byId.get(id)
}
