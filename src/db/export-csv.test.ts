import type { MorningCheckIn, SessionLog } from '../domain/types'
import { buildGymCsv, buildSessionsCsv, GYM_CSV_HEADERS, SESSIONS_CSV_HEADERS } from './export-csv'

const stamps = { createdAt: '2026-10-01T18:00:00.000Z', updatedAt: '2026-10-01T18:00:00.000Z' }

const logs: SessionLog[] = [
  {
    id: 'a',
    sessionId: 'w01-tue-run',
    date: '2026-09-22',
    kind: 'run',
    status: 'completed',
    derivedFields: ['avgPaceSecPerKm'],
    result: {
      distanceKm: 4.5,
      durationSec: 1822,
      avgPaceSecPerKm: 405,
      avgHr: 142,
      maxHr: 174,
      hrZonesSec: [28, 1223, 549, 22, 0],
      rpe: 3,
    },
    ...stamps,
  },
  {
    id: 'b',
    sessionId: 'w02-thu-push',
    date: '2026-10-01',
    kind: 'gym',
    status: 'modified',
    note: 'Bench felt heavy, "grindy"\nskipped pec deck',
    exercises: [
      {
        exerciseId: 'barbell-bench-press',
        kind: 'loaded',
        setsCompleted: 4,
        totalReps: 20,
        loadKg: 70,
      },
      { exerciseId: 'preacher-curl', kind: 'loaded', setsCompleted: 3, totalReps: 30, loadKg: 20 },
    ],
    ...stamps,
  },
  {
    id: 'c',
    sessionId: 'w02-fri-pull',
    date: '2026-10-02',
    kind: 'skip',
    status: 'skipped',
    reason: 'work',
    ...stamps,
  },
]

const checkIns: MorningCheckIn[] = [
  {
    id: 'k',
    sessionId: 'w01-tue-run',
    date: '2026-09-23',
    kneePainNextMorning: 1,
    energy: 4,
    ...stamps,
  },
]

const parse = (csv: string) =>
  csv
    .replace(/^\uFEFF/, '')
    .trimEnd()
    .split('\r\n')

describe('CSV export', () => {
  it('writes a BOM, CRLF lines and one row per logged session', () => {
    const csv = buildSessionsCsv(logs, checkIns)
    expect(csv.startsWith('\uFEFF')).toBe(true)
    const lines = parse(csv)
    expect(lines[0]).toBe(SESSIONS_CSV_HEADERS.join(','))
    // header + 3 logs; the quoted LF inside the note does not split a CRLF row
    expect(lines).toHaveLength(1 + 3)
  })

  it('formats run values like Garmin and joins the morning check-in', () => {
    const header = SESSIONS_CSV_HEADERS as readonly string[]
    const row = parse(buildSessionsCsv(logs, checkIns))[1]!.split(',')
    const col = (name: string) => row[header.indexOf(name)]
    expect(col('date')).toBe('2026-09-22')
    expect(col('week')).toBe('1')
    expect(col('type')).toBe('run')
    expect(col('time')).toBe('00:30:22')
    expect(col('avg_pace_min_km')).toBe('6:45')
    expect(col('zone2')).toBe('00:20:23')
    expect(col('knee_pain_next_morning')).toBe('1')
    expect(col('energy')).toBe('4')
    expect(col('derived_fields')).toBe('avgPaceSecPerKm')
  })

  it('escapes quotes, commas and newlines', () => {
    expect(buildSessionsCsv(logs, [])).toContain('"Bench felt heavy, ""grindy""\nskipped pec deck"')
  })

  it('writes one row per gym exercise with valid volume only', () => {
    const lines = parse(buildGymCsv(logs))
    expect(lines[0]).toBe(GYM_CSV_HEADERS.join(','))
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe(
      '2026-10-01,2,w02-thu-push,push,modified,barbell-bench-press,Barbell bench press,loaded,4,20,,70,,,,1400',
    )
  })
})
