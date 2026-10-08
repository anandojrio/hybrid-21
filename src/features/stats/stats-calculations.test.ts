import type { MorningCheckIn, SessionLog } from '@/domain/types'
import { formatPace } from '@/domain/calculations'
import {
  averageRpe,
  exerciseChange,
  gymCompliance,
  kneePainPoints,
  longestRun,
  plannedRunUnits,
  runCompliance,
  runEntries,
  strengthSummary,
  weeklyRunTotals,
  weeklyVolume,
} from './stats-calculations'

const stamps = { createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' }

const run = (sessionId: string, date: string, km: number, sec: number, extra = {}): SessionLog => ({
  id: sessionId,
  sessionId,
  date,
  kind: 'run',
  status: 'completed',
  result: {
    distanceKm: km,
    durationSec: sec,
    avgPaceSecPerKm: Math.round(sec / km),
    avgHr: 140,
    maxHr: 160,
    ...extra,
  },
  ...stamps,
})

const logs: SessionLog[] = [
  run('w01-tue-run', '2026-09-22', 4.5, 1822, { rpe: 3, kneePainAfter: 1 }),
  run('w01-sat-long', '2026-09-26', 6, 2400, { rpe: 4, hrZonesSec: [60, 1800, 540, 0, 0] }),
  {
    id: 's',
    sessionId: 'w01-thu-soc',
    date: '2026-09-24',
    kind: 'simple',
    status: 'completed',
    ...stamps,
  },
]

describe('running stats', () => {
  it('totals each plan week and aggregates pace from time over distance', () => {
    const w1 = weeklyRunTotals(logs)[0]!
    expect(w1).toMatchObject({
      week: 1,
      runs: 2,
      distanceKm: 10.5,
      durationSec: 4222,
      hasZones: true,
    })
    expect(formatPace(w1.paceSecPerKm!)).toBe('6:42')
    expect(w1.zonesSec).toEqual([60, 1800, 540, 0, 0])
    expect(weeklyRunTotals(logs)[1]).toMatchObject({ runs: 0, distanceKm: 0, paceSecPerKm: null })
  })

  it('counts compliance with the either/or Thursday once and satisfied by soccer', () => {
    // Up to Sunday of week 1: Tue run, Thu run-or-soccer, Sat long.
    expect(runCompliance(logs, '2026-09-27')).toEqual({ done: 3, due: 3 })
    expect(runCompliance([], '2026-09-27')).toEqual({ done: 0, due: 3 })
  })

  it('does not count today as missed until it is logged', () => {
    expect(runCompliance([], '2026-09-22')).toEqual({ done: 0, due: 0 })
    expect(runCompliance(logs, '2026-09-22')).toEqual({ done: 1, due: 1 })
  })

  it('treats a skipped "or off" run as compliant', () => {
    const offSkip: SessionLog = {
      id: 'o',
      sessionId: 'w08-wed-run',
      date: '2026-11-11',
      kind: 'skip',
      status: 'skipped',
      reason: 'fatigue',
      ...stamps,
    }
    const { done } = runCompliance([offSkip], '2026-11-11')
    expect(done).toBe(1)
  })

  it('finds the longest run, average RPE and planned run slots', () => {
    const entries = runEntries(logs)
    expect(longestRun(entries)?.log.result.distanceKm).toBe(6)
    expect(averageRpe(entries)).toEqual({ value: 3.5, count: 2 })
    expect(averageRpe([])).toBeNull()
    expect(plannedRunUnits(2)).toBe(3)
    expect(plannedRunUnits(12)).toBe(3)
  })

  it('orders knee pain by date: during, after, then next morning', () => {
    const checkIns: MorningCheckIn[] = [
      { id: 'c', sessionId: 'w01-tue-run', date: '2026-09-23', kneePainNextMorning: 3, ...stamps },
    ]
    const points = kneePainPoints(runEntries(logs), checkIns)
    expect(points.map((p) => `${p.date} ${p.label} ${p.value}`)).toEqual([
      '2026-09-22 after run 1',
      '2026-09-23 next morning 3',
    ])
  })
})

describe('strength stats', () => {
  const gym = (
    sessionId: string,
    date: string,
    squatKg: number,
    reps: number,
    pullReps: number,
  ): SessionLog => ({
    id: sessionId,
    sessionId,
    date,
    kind: 'gym',
    status: 'completed',
    exercises: [
      {
        exerciseId: 'back-squat',
        kind: 'loaded',
        setsCompleted: 3,
        totalReps: reps,
        loadKg: squatKg,
      },
      { exerciseId: 'pull-up', kind: 'bodyweight-loadable', setsCompleted: 4, totalReps: pullReps },
    ],
    ...stamps,
  })
  const gymLogs = [
    gym('w02-mon-leg', '2026-09-28', 80, 15, 30),
    gym('w03-mon-leg', '2026-10-05', 82.5, 13, 34),
  ]

  it('reports the latest result and the change from the previous one', () => {
    const summary = strengthSummary(gymLogs)
    const squat = summary.find((s) => s.exerciseId === 'back-squat')!
    expect(squat.change).toBe('+2.5 kg · −2 reps')
    const pull = summary.find((s) => s.exerciseId === 'pull-up')!
    expect(pull.change).toBe('+4 reps')
    expect(summary[0]!.exerciseId).toBe('back-squat')
  })

  it('describes unchanged and first results', () => {
    expect(
      exerciseChange(
        { exerciseId: 'x', kind: 'timed', setsCompleted: 2, totalHoldSeconds: 60 },
        { exerciseId: 'x', kind: 'timed', setsCompleted: 2, totalHoldSeconds: 60 },
      ),
    ).toBe('±0 s')
  })

  it('sums weekly volume load and gym compliance', () => {
    const volume = weeklyVolume(gymLogs)
    expect(volume[1]).toEqual({ week: 2, volumeKg: 1200 })
    expect(volume[2]).toEqual({ week: 3, volumeKg: 1072.5 })
    expect(gymCompliance(gymLogs, '2026-10-05')).toEqual({ done: 2, due: 7 })
  })
})
