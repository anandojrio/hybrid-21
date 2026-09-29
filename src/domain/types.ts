/** ISO calendar date without time or zone: `YYYY-MM-DD`. */
export type IsoDate = string

/** ISO timestamp with zone, used only for audit fields such as `createdAt`. */
export type IsoDateTime = string

export interface Range {
  min: number
  max: number
}

export const SESSION_TYPES = [
  'leg',
  'run',
  'long',
  'ice',
  'push',
  'pull',
  'mob',
  'soc',
  'race',
] as const
export type SessionType = (typeof SESSION_TYPES)[number]

export const SESSION_STATUSES = ['planned', 'completed', 'modified', 'skipped'] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]
export type LoggedStatus = Exclude<SessionStatus, 'planned'>

/** 1 = Monday … 7 = Sunday. */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7

// ---------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------

export const INTENSITIES = [
  'recovery',
  'easy',
  'steady',
  'upperSteady',
  'threshold',
  'hmEffort',
] as const
export type Intensity = (typeof INTENSITIES)[number]

export interface IntensityGuide {
  intensity: Intensity
  label: string
  hr: Range
  rpe: Range
  talkTest: string
  /** Pace guide in seconds per km; `min` is the faster bound. */
  paceSecPerKm: Range
}

export type RunSegment =
  | { kind: 'continuous'; intensity: Intensity; minutes: Range }
  | {
      kind: 'intervals'
      reps: number
      minutes: number
      intensity: Intensity
      recoveryMinutes: number
    }
  | { kind: 'strides'; reps: Range; seconds: number; optional: boolean }

export interface RunPrescription {
  /** Exact prescription text from the plan. */
  prescription: string
  primaryIntensity: Intensity
  segments: readonly RunSegment[]
  /** Explicit HR target when the plan states one; otherwise use the intensity guide. */
  hr?: Range
  /** Explicit pace guide (sec/km) when the plan states one. */
  paceSecPerKm?: Range
  /** Race distance, only for the race. */
  distanceKm?: number
  /** Extra conditional instruction, e.g. "final 10 min steady only if fresh". */
  conditionalNote?: string
}

// ---------------------------------------------------------------------------
// Exercises and workout templates
// ---------------------------------------------------------------------------

/** How an exercise is logged. Drives the gym logging form. */
export type ExerciseLogKind =
  | 'loaded' // sets, total reps, load kg
  | 'unilateral' // sets, reps per side, load kg
  | 'timed' // sets, total hold seconds, no load
  | 'bodyweight-loadable' // sets, total reps, optional added load (blank = bodyweight)
  | 'contacts' // sets, total contacts, no load

export type ExerciseCategory =
  | 'lower-body'
  | 'plyometric'
  | 'chest'
  | 'shoulders'
  | 'back'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'warm-up'
  | 'mobility'
  | 'stretch'

export interface ExerciseDefinition {
  id: string
  name: string
  category: ExerciseCategory
  muscleFocus: string
  /** Present only for exercises logged in gym sessions. */
  logKind?: ExerciseLogKind
  alternatives: readonly string[]
  /** Label that the technique still needs confirmation before it is treated as definitive. */
  needsTechniqueConfirmation?: boolean
  caution?: string
  /** Future local WebP/AVIF asset; not rendered in MVP. */
  imagePath?: string
}

export interface PrescribedExercise {
  exerciseId: string
  order: number
  /** Human prescription exactly as written, e.g. "3 × 4–6 at RIR 2–3". */
  prescription: string
  sets: Range
  reps?: Range
  holdSeconds?: Range
  perSide?: boolean
  eachDirection?: boolean
  rir?: Range
  rest: string
  restSeconds: Range
  focus?: string
  optional?: boolean
}

export interface WarmUpItem {
  id: string
  exerciseId?: string
  label: string
  dose: string
}

export interface CoachingVariant {
  id: string
  title: string
  summary: string
  items: readonly string[]
}

export type TemplateKind = 'gym' | 'mobility'

export interface WorkoutTemplate {
  id: string
  kind: TemplateKind
  type: Extract<SessionType, 'leg' | 'push' | 'pull' | 'mob'>
  title: string
  goal: string
  warmUpTitle: string
  warmUp: readonly WarmUpItem[]
  exercises: readonly PrescribedExercise[]
  cooldownTitle?: string
  cooldown: readonly WarmUpItem[]
  techniqueNotes: readonly string[]
  alternatives: readonly string[]
  /** Read-only coaching alternatives; never applied automatically. */
  variants: readonly CoachingVariant[]
  coachingNote?: string
}

// ---------------------------------------------------------------------------
// Planned sessions (immutable)
// ---------------------------------------------------------------------------

export type CoreSession = 'A' | 'B'

export interface PlannedSession {
  /** Stable, human-readable ID, e.g. `w02-tue-run`. Never derived from array indices. */
  id: string
  date: IsoDate
  week: number
  dayOfWeek: DayOfWeek
  /** Chronological order within the day. */
  order: number
  type: SessionType
  title: string
  goal: string
  coachingNote?: string
  /** Gym or mobility template. */
  templateId?: string
  run?: RunPrescription
  /** Sessions sharing this ID are an either/or choice; completing one satisfies the group. */
  choiceGroupId?: string
  /** Plan explicitly allows taking the day off instead. */
  offAllowed?: boolean
  coreSession?: CoreSession
  /** Week 12: light mobility, 1–2 easy sets only. */
  lightMobility?: boolean
  /** Weeks where two sets per exercise are acceptable. */
  twoSetsAllowed?: boolean
}

export interface PlanWeek {
  week: number
  start: IsoDate
  end: IsoDate
  focus: string
  cutback?: boolean
  taper?: boolean
}

// ---------------------------------------------------------------------------
// Logs (mutable)
// ---------------------------------------------------------------------------

export const SKIP_REASONS = ['fatigue', 'work', 'pain', 'illness', 'schedule', 'other'] as const
export type SkipReason = (typeof SKIP_REASONS)[number]

export const TALK_TEST_VALUES = ['full-sentences', 'short-sentences', 'few-words'] as const
export type TalkTest = (typeof TALK_TEST_VALUES)[number]

export type ExerciseResult =
  | { exerciseId: string; kind: 'loaded'; setsCompleted: number; totalReps: number; loadKg: number }
  | {
      exerciseId: string
      kind: 'unilateral'
      setsCompleted: number
      repsPerSide: number
      loadKg: number
    }
  | { exerciseId: string; kind: 'timed'; setsCompleted: number; totalHoldSeconds: number }
  | {
      exerciseId: string
      kind: 'bodyweight-loadable'
      setsCompleted: number
      totalReps: number
      /** Undefined means bodyweight. */
      addedLoadKg?: number
    }
  | { exerciseId: string; kind: 'contacts'; setsCompleted: number; totalContacts: number }

export interface RunResult {
  distanceKm: number
  durationSec: number
  /** Garmin Avg Pace as entered; never overwritten by the computed value. */
  avgPaceSecPerKm: number
  avgHr: number
  maxHr: number
  /** Time in HR zones 1–5 in seconds; missing zones are undefined. */
  hrZonesSec?: [
    number | undefined,
    number | undefined,
    number | undefined,
    number | undefined,
    number | undefined,
  ]
  aerobicTe?: number
  anaerobicTe?: number
  avgPowerW?: number
  totalAscentM?: number
  avgCadenceSpm?: number
  rpe?: number
  talkTest?: TalkTest
  kneePainDuring?: number
  kneePainAfter?: number
}

interface LogBase {
  id: string
  sessionId: string
  date: IsoDate
  status: LoggedStatus
  note?: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
  /** Set by versioned seed migrations; lets the UI label seeded data. */
  seedVersion?: number
  /** Field names whose values were derived rather than entered. */
  derivedFields?: string[]
}

export interface SkipLog extends LogBase {
  kind: 'skip'
  status: 'skipped'
  reason: SkipReason
}

/** ICE and SOC: one tap, no data fields. */
export interface SimpleLog extends LogBase {
  kind: 'simple'
  status: 'completed'
}

export interface GymLog extends LogBase {
  kind: 'gym'
  status: 'completed' | 'modified'
  exercises: ExerciseResult[]
}

export interface RunLog extends LogBase {
  kind: 'run'
  status: 'completed' | 'modified'
  result: RunResult
}

export interface MobilityLog extends LogBase {
  kind: 'mobility'
  status: 'completed' | 'modified'
  coreSession: CoreSession
  asPrescribed: boolean
  durationMin?: number
}

export type SessionLog = SkipLog | SimpleLog | GymLog | RunLog | MobilityLog

export interface MorningCheckIn {
  id: string
  /** The run session this check-in follows. */
  sessionId: string
  date: IsoDate
  kneePainNextMorning?: number
  soreness?: number
  energy?: number
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}
