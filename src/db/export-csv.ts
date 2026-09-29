import { getExercise } from '../data/exercises'
import { getSession } from '../data/training-plan'
import { formatDuration, formatPace, volumeLoad } from '../domain/calculations'
import type { MorningCheckIn, SessionLog } from '../domain/types'
import { toCsv, type CsvValue } from '../lib/csv'
import { toIsoDate } from '../lib/dates'

export const SESSIONS_CSV_HEADERS = [
  'date',
  'week',
  'session_id',
  'type',
  'title',
  'status',
  'skip_reason',
  'distance_km',
  'time',
  'avg_pace_min_km',
  'avg_hr',
  'max_hr',
  'zone1',
  'zone2',
  'zone3',
  'zone4',
  'zone5',
  'aerobic_te',
  'anaerobic_te',
  'avg_power_w',
  'total_ascent_m',
  'avg_cadence_spm',
  'rpe',
  'talk_test',
  'knee_pain_during',
  'knee_pain_after',
  'knee_pain_next_morning',
  'soreness',
  'energy',
  'mobility_core',
  'mobility_as_prescribed',
  'mobility_duration_min',
  'gym_exercises_logged',
  'gym_volume_kg',
  'derived_fields',
  'note',
  'created_at',
  'updated_at',
] as const

export const GYM_CSV_HEADERS = [
  'date',
  'week',
  'session_id',
  'type',
  'status',
  'exercise_id',
  'exercise',
  'log_kind',
  'sets',
  'total_reps',
  'reps_per_side',
  'load_kg',
  'added_load_kg',
  'total_hold_s',
  'total_contacts',
  'volume_kg',
] as const

const dur = (sec: number | undefined) => (sec === undefined ? undefined : formatDuration(sec))

/** One row per logged session. */
export function buildSessionsCsv(
  logs: readonly SessionLog[],
  checkIns: readonly MorningCheckIn[],
): string {
  const checkInBySession = new Map(checkIns.map((c) => [c.sessionId, c]))
  const rows = [...logs]
    .sort((a, b) =>
      a.date === b.date ? a.sessionId.localeCompare(b.sessionId) : a.date < b.date ? -1 : 1,
    )
    .map((log): CsvValue[] => {
      const session = getSession(log.sessionId)
      const run = log.kind === 'run' ? log.result : undefined
      const checkIn = checkInBySession.get(log.sessionId)
      const zones = run?.hrZonesSec ?? []
      const row: Record<(typeof SESSIONS_CSV_HEADERS)[number], CsvValue> = {
        date: log.date,
        week: session?.week,
        session_id: log.sessionId,
        type: session?.type,
        title: session?.title,
        status: log.status,
        skip_reason: log.kind === 'skip' ? log.reason : undefined,
        distance_km: run?.distanceKm,
        time: dur(run?.durationSec),
        avg_pace_min_km: run ? formatPace(run.avgPaceSecPerKm) : undefined,
        avg_hr: run?.avgHr,
        max_hr: run?.maxHr,
        zone1: dur(zones[0]),
        zone2: dur(zones[1]),
        zone3: dur(zones[2]),
        zone4: dur(zones[3]),
        zone5: dur(zones[4]),
        aerobic_te: run?.aerobicTe,
        anaerobic_te: run?.anaerobicTe,
        avg_power_w: run?.avgPowerW,
        total_ascent_m: run?.totalAscentM,
        avg_cadence_spm: run?.avgCadenceSpm,
        rpe: run?.rpe,
        talk_test: run?.talkTest,
        knee_pain_during: run?.kneePainDuring,
        knee_pain_after: run?.kneePainAfter,
        knee_pain_next_morning: checkIn?.kneePainNextMorning,
        soreness: checkIn?.soreness,
        energy: checkIn?.energy,
        mobility_core: log.kind === 'mobility' ? log.coreSession : undefined,
        mobility_as_prescribed:
          log.kind === 'mobility' ? (log.asPrescribed ? 'yes' : 'no') : undefined,
        mobility_duration_min: log.kind === 'mobility' ? log.durationMin : undefined,
        gym_exercises_logged: log.kind === 'gym' ? log.exercises.length : undefined,
        gym_volume_kg:
          log.kind === 'gym'
            ? log.exercises.reduce((sum, e) => sum + (volumeLoad(e) ?? 0), 0)
            : undefined,
        derived_fields: log.derivedFields?.join(' '),
        note: log.note,
        created_at: log.createdAt,
        updated_at: log.updatedAt,
      }
      return SESSIONS_CSV_HEADERS.map((h) => row[h])
    })
  return toCsv(SESSIONS_CSV_HEADERS, rows)
}

/** One row per logged exercise result. Warm-up sets are never logged, so never exported. */
export function buildGymCsv(logs: readonly SessionLog[]): string {
  const rows: CsvValue[][] = []
  for (const log of [...logs].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))) {
    if (log.kind !== 'gym') continue
    const session = getSession(log.sessionId)
    for (const e of log.exercises) {
      const row: Record<(typeof GYM_CSV_HEADERS)[number], CsvValue> = {
        date: log.date,
        week: session?.week,
        session_id: log.sessionId,
        type: session?.type,
        status: log.status,
        exercise_id: e.exerciseId,
        exercise: getExercise(e.exerciseId).name,
        log_kind: e.kind,
        sets: e.setsCompleted,
        total_reps:
          e.kind === 'loaded' || e.kind === 'bodyweight-loadable' ? e.totalReps : undefined,
        reps_per_side: e.kind === 'unilateral' ? e.repsPerSide : undefined,
        load_kg: e.kind === 'loaded' || e.kind === 'unilateral' ? e.loadKg : undefined,
        added_load_kg: e.kind === 'bodyweight-loadable' ? e.addedLoadKg : undefined,
        total_hold_s: e.kind === 'timed' ? e.totalHoldSeconds : undefined,
        total_contacts: e.kind === 'contacts' ? e.totalContacts : undefined,
        volume_kg: volumeLoad(e) ?? undefined,
      }
      rows.push(GYM_CSV_HEADERS.map((h) => row[h]))
    }
  }
  return toCsv(GYM_CSV_HEADERS, rows)
}

export function csvFileNames(now: Date = new Date()) {
  const date = toIsoDate(now)
  return { sessions: `hybrid21-sessions-${date}.csv`, gym: `hybrid21-gym-exercises-${date}.csv` }
}
