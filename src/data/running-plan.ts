import type { IntensityGuide, IsoDate, RunPrescription, RunSegment } from '../domain/types'

const r = (min: number, max: number = min) => ({ min, max })
const pace = (fast: string, slow: string) => r(toSec(fast), toSec(slow))
function toSec(mss: string): number {
  const [m, s] = mss.split(':').map(Number)
  return (m ?? 0) * 60 + (s ?? 0)
}

export const INTENSITY_GUIDE: readonly IntensityGuide[] = [
  {
    intensity: 'recovery',
    label: 'Recovery',
    hr: r(125, 138),
    rpe: r(1, 2),
    talkTest: 'Completely effortless conversation',
    paceSecPerKm: pace('7:00', '7:30'),
  },
  {
    intensity: 'easy',
    label: 'Easy',
    hr: r(130, 145),
    rpe: r(2, 3),
    talkTest: 'Comfortable full sentences',
    paceSecPerKm: pace('6:45', '7:20'),
  },
  {
    intensity: 'steady',
    label: 'Steady',
    hr: r(146, 158),
    rpe: r(4, 5),
    talkTest: 'Short but controlled sentences',
    paceSecPerKm: pace('6:15', '6:35'),
  },
  {
    intensity: 'upperSteady',
    label: 'Upper-steady',
    hr: r(152, 164),
    rpe: r(5, 6),
    talkTest: 'Several words at a time',
    paceSecPerKm: pace('6:05', '6:25'),
  },
  {
    intensity: 'threshold',
    label: 'Controlled threshold',
    hr: r(164, 175),
    rpe: r(7),
    talkTest: 'Brief phrases',
    paceSecPerKm: pace('5:40', '5:58'),
  },
  {
    intensity: 'hmEffort',
    label: 'Provisional HM effort',
    hr: r(158, 170),
    rpe: r(6, 7),
    talkTest: 'Controlled but purposeful',
    paceSecPerKm: pace('5:50', '6:08'),
  },
]

export const INTENSITY_NOTICE =
  'These are provisional training targets, not laboratory-confirmed physiological zones. Duration is the primary target; heart rate, RPE and the talk test override pace when they disagree.'

export const RUN_COACHING_RULES: readonly string[] = [
  'Easy sessions should feel controlled enough for full-sentence conversation.',
  'On hills, heat, poor sleep, or accumulated fatigue, effort/HR wins over pace.',
  'Do not speed up in the final five minutes of an easy session just to improve the average.',
  'Walking for 30–60 seconds is allowed if HR rises unexpectedly or tissue discomfort develops.',
  'If knee pain exceeds 2/10, changes gait, is sharp, causes swelling/instability, or is worse next morning, reduce/stop and seek professional assessment when appropriate.',
  'Football replaces the prescribed optional Thursday run; it is never added on top.',
  'The app never rewrites the plan based on logged data.',
]

const EASY_HR = r(130, 145)
const RECOVERY_EASY_HR = r(125, 142)

const easy = (min: number, max: number = min): RunSegment => ({
  kind: 'continuous',
  intensity: 'easy',
  minutes: r(min, max),
})
const recovery = (min: number, max: number = min): RunSegment => ({
  kind: 'continuous',
  intensity: 'recovery',
  minutes: r(min, max),
})
const strides = (min: number, max: number, optional: boolean): RunSegment => ({
  kind: 'strides',
  reps: r(min, max),
  seconds: 15,
  optional,
})

export type RunSlot = 'tue' | 'thu' | 'sat'

export interface RunPlanEntry {
  week: number
  slot: RunSlot
  date: IsoDate
  title: string
  run: RunPrescription
  /** Thursday either/or with football. */
  orSoccer?: boolean
  /** Plan allows taking the day off instead. */
  offAllowed?: boolean
}

/** Exact 12-week running plan. Dates are local ISO dates. */
export const RUNNING_PLAN: readonly RunPlanEntry[] = [
  // Week 1 — Establish tolerance
  {
    week: 1,
    slot: 'tue',
    date: '2026-09-22',
    title: 'Easy 30 min',
    run: {
      prescription: '30 min easy; run-walk allowed',
      primaryIntensity: 'easy',
      segments: [easy(30)],
      conditionalNote: 'Run-walk allowed.',
    },
  },
  {
    week: 1,
    slot: 'thu',
    date: '2026-09-24',
    title: 'Recovery/Easy 20–25 min',
    orSoccer: true,
    run: {
      prescription: '20–25 min recovery/easy at 125–142 bpm, 7:00–7:25/km, or football',
      primaryIntensity: 'recovery',
      segments: [recovery(20, 25)],
      hr: RECOVERY_EASY_HR,
      paceSecPerKm: pace('7:00', '7:25'),
    },
  },
  {
    week: 1,
    slot: 'sat',
    date: '2026-09-26',
    title: 'Easy 40 min',
    run: {
      prescription: '40 min easy at 130–145 bpm, 6:50–7:20/km',
      primaryIntensity: 'easy',
      segments: [easy(40)],
      hr: EASY_HR,
      paceSecPerKm: pace('6:50', '7:20'),
    },
  },

  // Week 2 — Confirm knee/tissue response
  {
    week: 2,
    slot: 'tue',
    date: '2026-09-29',
    title: 'Easy 35 min',
    run: {
      prescription: '35 min easy at 130–145 bpm; optional 4 × 15 s relaxed strides',
      primaryIntensity: 'easy',
      segments: [easy(35), strides(4, 4, true)],
      hr: EASY_HR,
    },
  },
  {
    week: 2,
    slot: 'thu',
    date: '2026-10-01',
    title: 'Recovery/Easy 25–30 min',
    orSoccer: true,
    run: {
      prescription: '25–30 min recovery/easy at 125–142 bpm, or football',
      primaryIntensity: 'recovery',
      segments: [recovery(25, 30)],
      hr: RECOVERY_EASY_HR,
    },
  },
  {
    week: 2,
    slot: 'sat',
    date: '2026-10-03',
    title: 'Easy 50 min',
    run: {
      prescription: '50 min easy at 130–145 bpm, 6:45–7:15/km',
      primaryIntensity: 'easy',
      segments: [easy(50)],
      hr: EASY_HR,
      paceSecPerKm: pace('6:45', '7:15'),
    },
  },

  // Week 3 — Introduce moderate work
  {
    week: 3,
    slot: 'tue',
    date: '2026-10-06',
    title: '3 × 5 min Steady',
    run: {
      prescription:
        '10 min easy + 3 × 5 min steady at 146–158 bpm, 2 min easy between + 10 min easy',
      primaryIntensity: 'steady',
      segments: [
        easy(10),
        { kind: 'intervals', reps: 3, minutes: 5, intensity: 'steady', recoveryMinutes: 2 },
        easy(10),
      ],
      hr: r(146, 158),
    },
  },
  {
    week: 3,
    slot: 'thu',
    date: '2026-10-08',
    title: 'Easy 30 min',
    orSoccer: true,
    run: {
      prescription: '30 min easy at 130–145 bpm, or football',
      primaryIntensity: 'easy',
      segments: [easy(30)],
      hr: EASY_HR,
    },
  },
  {
    week: 3,
    slot: 'sat',
    date: '2026-10-10',
    title: 'Easy 60 min',
    run: {
      prescription: '60 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(60)],
      hr: EASY_HR,
    },
  },

  // Week 4 — Cutback
  {
    week: 4,
    slot: 'tue',
    date: '2026-10-13',
    title: 'Easy 35 min + strides',
    run: {
      prescription: '35 min easy + 4–6 × 15 s relaxed strides',
      primaryIntensity: 'easy',
      segments: [easy(35), strides(4, 6, false)],
    },
  },
  {
    week: 4,
    slot: 'thu',
    date: '2026-10-15',
    title: 'Recovery/Easy 25 min',
    offAllowed: true,
    run: {
      prescription: '25 min recovery/easy or off',
      primaryIntensity: 'recovery',
      segments: [recovery(25)],
    },
  },
  {
    week: 4,
    slot: 'sat',
    date: '2026-10-17',
    title: 'Easy 50 min',
    run: {
      prescription: '50 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(50)],
      hr: EASY_HR,
    },
  },

  // Week 5 — Extend controlled work
  {
    week: 5,
    slot: 'tue',
    date: '2026-10-20',
    title: '3 × 7 min Steady',
    run: {
      prescription:
        '10 min easy + 3 × 7 min steady at 146–158 bpm, 2 min easy between + 10 min easy',
      primaryIntensity: 'steady',
      segments: [
        easy(10),
        { kind: 'intervals', reps: 3, minutes: 7, intensity: 'steady', recoveryMinutes: 2 },
        easy(10),
      ],
      hr: r(146, 158),
    },
  },
  {
    week: 5,
    slot: 'thu',
    date: '2026-10-22',
    title: 'Easy 30–35 min',
    orSoccer: true,
    run: {
      prescription: '30–35 min easy, or football',
      primaryIntensity: 'easy',
      segments: [easy(30, 35)],
    },
  },
  {
    week: 5,
    slot: 'sat',
    date: '2026-10-24',
    title: 'Easy 70 min',
    run: {
      prescription: '70 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(70)],
      hr: EASY_HR,
    },
  },

  // Week 6 — Aerobic strength
  {
    week: 6,
    slot: 'tue',
    date: '2026-10-27',
    title: '2 × 10 min Upper-steady',
    run: {
      prescription:
        '10 min easy + 2 × 10 min upper-steady at 152–164 bpm, 3 min easy between + 10 min easy',
      primaryIntensity: 'upperSteady',
      segments: [
        easy(10),
        { kind: 'intervals', reps: 2, minutes: 10, intensity: 'upperSteady', recoveryMinutes: 3 },
        easy(10),
      ],
      hr: r(152, 164),
    },
  },
  {
    week: 6,
    slot: 'thu',
    date: '2026-10-29',
    title: 'Easy 35 min',
    orSoccer: true,
    run: {
      prescription: '35 min easy, or football',
      primaryIntensity: 'easy',
      segments: [easy(35)],
    },
  },
  {
    week: 6,
    slot: 'sat',
    date: '2026-10-31',
    title: 'Easy 80 min',
    run: {
      prescription: '80 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(80)],
      hr: EASY_HR,
    },
  },

  // Week 7 — Cutback
  {
    week: 7,
    slot: 'tue',
    date: '2026-11-03',
    title: 'Easy 40 min + strides',
    run: {
      prescription: '40 min easy + 4–6 × 15 s relaxed strides',
      primaryIntensity: 'easy',
      segments: [easy(40), strides(4, 6, false)],
    },
  },
  {
    week: 7,
    slot: 'thu',
    date: '2026-11-05',
    title: 'Recovery/Easy 25–30 min',
    offAllowed: true,
    run: {
      prescription: '25–30 min recovery/easy or off',
      primaryIntensity: 'recovery',
      segments: [recovery(25, 30)],
    },
  },
  {
    week: 7,
    slot: 'sat',
    date: '2026-11-07',
    title: 'Easy 65 min',
    run: {
      prescription: '65 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(65)],
      hr: EASY_HR,
    },
  },

  // Week 8 — Start race-specific block
  {
    week: 8,
    slot: 'tue',
    date: '2026-11-10',
    title: '3 × 8 min Threshold',
    run: {
      prescription:
        '12 min easy + 3 × 8 min controlled threshold at 164–175 bpm, 3 min easy between + 10 min easy',
      primaryIntensity: 'threshold',
      segments: [
        easy(12),
        { kind: 'intervals', reps: 3, minutes: 8, intensity: 'threshold', recoveryMinutes: 3 },
        easy(10),
      ],
      hr: r(164, 175),
    },
  },
  {
    week: 8,
    slot: 'thu',
    date: '2026-11-12',
    title: 'Easy 35 min',
    run: {
      prescription: '35 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(35)],
      hr: EASY_HR,
    },
  },
  {
    week: 8,
    slot: 'sat',
    date: '2026-11-14',
    title: 'Easy 90 min',
    run: {
      prescription: '90 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(90)],
      hr: EASY_HR,
    },
  },

  // Week 9 — Race-specific endurance
  {
    week: 9,
    slot: 'tue',
    date: '2026-11-17',
    title: '2 × 12 min HM effort',
    run: {
      prescription:
        '12 min easy + 2 × 12 min HM effort at 158–170 bpm, 4 min easy between + 10 min easy',
      primaryIntensity: 'hmEffort',
      segments: [
        easy(12),
        { kind: 'intervals', reps: 2, minutes: 12, intensity: 'hmEffort', recoveryMinutes: 4 },
        easy(10),
      ],
      hr: r(158, 170),
    },
  },
  {
    week: 9,
    slot: 'thu',
    date: '2026-11-19',
    title: 'Easy 35–40 min',
    orSoccer: true,
    run: {
      prescription: '35–40 min easy, or football',
      primaryIntensity: 'easy',
      segments: [easy(35, 40)],
    },
  },
  {
    week: 9,
    slot: 'sat',
    date: '2026-11-21',
    title: 'Easy 95 min',
    run: {
      prescription: '95 min easy; final 10 min steady only if fresh',
      primaryIntensity: 'easy',
      segments: [easy(95)],
      conditionalNote: 'Final 10 min steady only if fresh.',
    },
  },

  // Week 10 — Peak week
  {
    week: 10,
    slot: 'tue',
    date: '2026-11-24',
    title: '3 × 10 min HM effort',
    run: {
      prescription: '12 min easy + 3 × 10 min HM effort, 3 min easy between + 10 min easy',
      primaryIntensity: 'hmEffort',
      segments: [
        easy(12),
        { kind: 'intervals', reps: 3, minutes: 10, intensity: 'hmEffort', recoveryMinutes: 3 },
        easy(10),
      ],
    },
  },
  {
    week: 10,
    slot: 'thu',
    date: '2026-11-26',
    title: 'Easy 30–35 min',
    run: {
      prescription: '30–35 min easy',
      primaryIntensity: 'easy',
      segments: [easy(30, 35)],
    },
  },
  {
    week: 10,
    slot: 'sat',
    date: '2026-11-28',
    title: 'Easy 100–105 min',
    run: {
      prescription: '100–105 min easy at 130–145 bpm',
      primaryIntensity: 'easy',
      segments: [easy(100, 105)],
      hr: EASY_HR,
    },
  },

  // Week 11 — Reduce volume
  {
    week: 11,
    slot: 'tue',
    date: '2026-12-01',
    title: '2 × 8 min HM effort',
    run: {
      prescription: '10 min easy + 2 × 8 min HM effort, 3 min easy between + 10 min easy',
      primaryIntensity: 'hmEffort',
      segments: [
        easy(10),
        { kind: 'intervals', reps: 2, minutes: 8, intensity: 'hmEffort', recoveryMinutes: 3 },
        easy(10),
      ],
    },
  },
  {
    week: 11,
    slot: 'thu',
    date: '2026-12-03',
    title: 'Easy 25–30 min',
    run: {
      prescription: '25–30 min easy',
      primaryIntensity: 'easy',
      segments: [easy(25, 30)],
    },
  },
  {
    week: 11,
    slot: 'sat',
    date: '2026-12-05',
    title: 'Easy 65–70 min',
    run: {
      prescription: '65–70 min easy',
      primaryIntensity: 'easy',
      segments: [easy(65, 70)],
    },
  },

  // Week 12 — Taper and race
  {
    week: 12,
    slot: 'tue',
    date: '2026-12-08',
    title: 'Easy 30 min + strides',
    run: {
      prescription: '30 min easy + 4 × 15 s relaxed strides',
      primaryIntensity: 'easy',
      segments: [easy(30), strides(4, 4, false)],
    },
  },
  {
    week: 12,
    slot: 'thu',
    date: '2026-12-10',
    title: 'Very easy 20 min',
    offAllowed: true,
    run: {
      prescription: '20 min very easy or off',
      primaryIntensity: 'recovery',
      segments: [recovery(20)],
    },
  },
  {
    week: 12,
    slot: 'sat',
    date: '2026-12-12',
    title: 'Half Marathon',
    run: {
      prescription: 'Half-marathon',
      primaryIntensity: 'hmEffort',
      segments: [],
      distanceKm: 21.0975,
    },
  },
]

export function getIntensityGuide(intensity: IntensityGuide['intensity']): IntensityGuide {
  const guide = INTENSITY_GUIDE.find((g) => g.intensity === intensity)
  if (!guide) throw new Error(`Unknown intensity: ${intensity}`)
  return guide
}
