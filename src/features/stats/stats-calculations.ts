import { getExercise } from '@/data/exercises'
import { getChoiceGroup, getSession, PLAN_WEEKS, PLANNED_SESSIONS } from '@/data/training-plan'
import { WORKOUT_TEMPLATES } from '@/data/workout-templates'
import { aggregatePace, runDurationRange, totalVolumeLoad } from '@/domain/calculations'
import { resolveChoiceGroup } from '@/domain/status'
import type {
  ExerciseResult,
  GymLog,
  IsoDate,
  MorningCheckIn,
  PlannedSession,
  Range,
  RunLog,
  SessionLog,
} from '@/domain/types'
import { compareIsoDates } from '@/lib/dates'

const RUN_TYPES = new Set(['run', 'long', 'race'])
const GYM_TYPES = new Set(['leg', 'push', 'pull'])
const isDone = (log: SessionLog | undefined) =>
  log?.status === 'completed' || log?.status === 'modified'

export interface RunEntry {
  session: PlannedSession
  log: RunLog
}

/** Logged runs (completed or modified) in date order. */
export function runEntries(logs: readonly SessionLog[]): RunEntry[] {
  return logs
    .filter((l): l is RunLog => l.kind === 'run' && isDone(l))
    .map((log) => ({ session: getSession(log.sessionId)!, log }))
    .filter((e) => e.session && RUN_TYPES.has(e.session.type))
    .sort((a, b) => compareIsoDates(a.log.date, b.log.date))
}

export interface WeekRunTotals {
  week: number
  start: IsoDate
  runs: number
  distanceKm: number
  durationSec: number
  /** total time / total distance, never a mean of paces. */
  paceSecPerKm: number | null
  zonesSec: [number, number, number, number, number]
  hasZones: boolean
}

export function weeklyRunTotals(logs: readonly SessionLog[]): WeekRunTotals[] {
  const entries = runEntries(logs)
  return PLAN_WEEKS.map((w) => {
    const inWeek = entries.filter((e) => e.session.week === w.week)
    const zones: [number, number, number, number, number] = [0, 0, 0, 0, 0]
    let hasZones = false
    for (const e of inWeek) {
      e.log.result.hrZonesSec?.forEach((sec, i) => {
        if (sec !== undefined) {
          zones[i] = (zones[i] ?? 0) + sec
          hasZones = true
        }
      })
    }
    const totals = inWeek.map((e) => ({
      distanceKm: e.log.result.distanceKm,
      durationSec: e.log.result.durationSec,
    }))
    return {
      week: w.week,
      start: w.start,
      runs: inWeek.length,
      distanceKm: totals.reduce((s, t) => s + t.distanceKm, 0),
      durationSec: totals.reduce((s, t) => s + t.durationSec, 0),
      paceSecPerKm: aggregatePace(totals),
      zonesSec: zones,
      hasZones,
    }
  })
}

export interface Compliance {
  done: number
  due: number
}

/** Past sessions are due; today's session only counts once it is logged. */
function isDue(session: PlannedSession, logs: readonly SessionLog[], today: IsoDate): boolean {
  const order = compareIsoDates(session.date, today)
  if (order < 0) return true
  if (order > 0) return false
  const ids = session.choiceGroupId
    ? getChoiceGroup(session.choiceGroupId).map((s) => s.id)
    : [session.id]
  return logs.some((l) => ids.includes(l.sessionId))
}

/**
 * Running compliance up to `today`. An either/or Thursday counts once and is satisfied by
 * soccer; a skipped run the plan marks "or off" counts as done.
 */
export function runCompliance(logs: readonly SessionLog[], today: IsoDate): Compliance {
  let done = 0
  let due = 0
  const groups = new Set<string>()
  for (const session of PLANNED_SESSIONS) {
    if (!RUN_TYPES.has(session.type) || !isDue(session, logs, today)) continue
    if (session.choiceGroupId) {
      if (groups.has(session.choiceGroupId)) continue
      groups.add(session.choiceGroupId)
      due += 1
      const state = resolveChoiceGroup(getChoiceGroup(session.choiceGroupId), logs)
      if (state.status === 'completed' || state.status === 'modified') done += 1
      continue
    }
    due += 1
    const log = logs.find((l) => l.sessionId === session.id)
    if (isDone(log) || (log?.status === 'skipped' && session.offAllowed)) done += 1
  }
  return { done, due }
}

/** Planned running slots in a week; an either/or Thursday counts once. */
export function plannedRunUnits(week: number): number {
  const units = new Set(
    PLANNED_SESSIONS.filter((s) => s.week === week && RUN_TYPES.has(s.type)).map(
      (s) => s.choiceGroupId ?? s.id,
    ),
  )
  return units.size
}

export function gymCompliance(logs: readonly SessionLog[], today: IsoDate): Compliance {
  const due = PLANNED_SESSIONS.filter((s) => GYM_TYPES.has(s.type) && isDue(s, logs, today))
  const done = due.filter((s) => isDone(logs.find((l) => l.sessionId === s.id))).length
  return { done, due: due.length }
}

export function longestRun(entries: readonly RunEntry[]): RunEntry | undefined {
  return entries.reduce<RunEntry | undefined>(
    (best, e) => (!best || e.log.result.distanceKm > best.log.result.distanceKm ? e : best),
    undefined,
  )
}

export function averageRpe(entries: readonly RunEntry[]): { value: number; count: number } | null {
  const values = entries.map((e) => e.log.result.rpe).filter((v): v is number => v !== undefined)
  if (!values.length) return null
  return { value: values.reduce((s, v) => s + v, 0) / values.length, count: values.length }
}

export interface KneePainPoint {
  date: IsoDate
  value: number
  label: 'during run' | 'after run' | 'next morning'
}

export function kneePainPoints(
  entries: readonly RunEntry[],
  checkIns: readonly MorningCheckIn[],
): KneePainPoint[] {
  const points: KneePainPoint[] = []
  for (const e of entries) {
    const r = e.log.result
    if (r.kneePainDuring !== undefined)
      points.push({ date: e.log.date, value: r.kneePainDuring, label: 'during run' })
    if (r.kneePainAfter !== undefined)
      points.push({ date: e.log.date, value: r.kneePainAfter, label: 'after run' })
  }
  for (const c of checkIns) {
    if (c.kneePainNextMorning !== undefined) {
      points.push({ date: c.date, value: c.kneePainNextMorning, label: 'next morning' })
    }
  }
  const order = { 'during run': 0, 'after run': 1, 'next morning': 2 }
  return points.sort((a, b) => compareIsoDates(a.date, b.date) || order[a.label] - order[b.label])
}

/** Coaching rule: knee pain above 2/10 means reduce or stop. */
export const KNEE_PAIN_LIMIT = 2

export interface LongRunProgression {
  latest?: { date: IsoDate; durationSec: number; distanceKm: number; planned: Range | null }
  next?: { date: IsoDate; planned: Range | null; title: string }
}

export function longRunProgression(
  logs: readonly SessionLog[],
  today: IsoDate,
): LongRunProgression {
  const longs = runEntries(logs).filter((e) => e.session.type === 'long')
  const latest = longs.at(-1)
  const next = PLANNED_SESSIONS.find(
    (s) =>
      (s.type === 'long' || s.type === 'race') &&
      compareIsoDates(s.date, today) >= 0 &&
      !logs.some((l) => l.sessionId === s.id),
  )
  return {
    latest: latest && {
      date: latest.log.date,
      durationSec: latest.log.result.durationSec,
      distanceKm: latest.log.result.distanceKm,
      planned: latest.session.run ? runDurationRange(latest.session.run) : null,
    },
    next: next && {
      date: next.date,
      title: next.title,
      planned: next.run ? runDurationRange(next.run) : null,
    },
  }
}

// ---------------------------------------------------------------------------
// Strength
// ---------------------------------------------------------------------------

export interface ExercisePoint {
  date: IsoDate
  sessionId: string
  result: ExerciseResult
}

const gymLogs = (logs: readonly SessionLog[]) =>
  logs
    .filter((l): l is GymLog => l.kind === 'gym' && isDone(l))
    .sort((a, b) => compareIsoDates(a.date, b.date))

export function exerciseSeries(logs: readonly SessionLog[], exerciseId: string): ExercisePoint[] {
  const points: ExercisePoint[] = []
  for (const log of gymLogs(logs)) {
    const result = log.exercises.find((e) => e.exerciseId === exerciseId)
    if (result) points.push({ date: log.date, sessionId: log.sessionId, result })
  }
  return points
}

const signed = (n: number, unit: string) =>
  `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n)}${unit}`

/** Change from the previous result, e.g. "+2.5 kg · −2 reps"; null when kinds differ. */
export function exerciseChange(latest: ExerciseResult, previous: ExerciseResult): string | null {
  if (latest.kind !== previous.kind) return null
  const parts: string[] = []
  switch (latest.kind) {
    case 'loaded':
    case 'unilateral': {
      const p = previous as typeof latest
      const repsNow = latest.kind === 'loaded' ? latest.totalReps : latest.repsPerSide
      const repsBefore =
        p.kind === 'loaded' ? p.totalReps : (p as { repsPerSide: number }).repsPerSide
      parts.push(signed(Math.round((latest.loadKg - p.loadKg) * 10) / 10, ' kg'))
      parts.push(signed(repsNow - repsBefore, latest.kind === 'loaded' ? ' reps' : ' reps/side'))
      break
    }
    case 'bodyweight-loadable': {
      const p = previous as typeof latest
      parts.push(signed(latest.totalReps - p.totalReps, ' reps'))
      const added = (latest.addedLoadKg ?? 0) - (p.addedLoadKg ?? 0)
      if (added !== 0) parts.push(signed(added, ' kg added'))
      break
    }
    case 'timed':
      parts.push(
        signed(latest.totalHoldSeconds - (previous as typeof latest).totalHoldSeconds, ' s'),
      )
      break
    case 'contacts':
      parts.push(
        signed(latest.totalContacts - (previous as typeof latest).totalContacts, ' contacts'),
      )
      break
  }
  return parts.join(' · ')
}

export interface ExerciseSummary {
  exerciseId: string
  name: string
  latest: ExercisePoint
  previous?: ExercisePoint
  change: string | null
}

/** Latest result and change for every logged gym exercise, in workout order. */
export function strengthSummary(logs: readonly SessionLog[]): ExerciseSummary[] {
  const order: string[] = []
  for (const t of WORKOUT_TEMPLATES) {
    if (t.kind !== 'gym') continue
    for (const e of t.exercises) if (!order.includes(e.exerciseId)) order.push(e.exerciseId)
  }
  const summaries: ExerciseSummary[] = []
  for (const exerciseId of order) {
    const series = exerciseSeries(logs, exerciseId)
    const latest = series.at(-1)
    if (!latest) continue
    const previous = series.at(-2)
    summaries.push({
      exerciseId,
      name: getExercise(exerciseId).name,
      latest,
      previous,
      change: previous ? exerciseChange(latest.result, previous.result) : null,
    })
  }
  return summaries
}

/** Weekly volume load (total reps × load kg for valid loaded exercises). */
export function weeklyVolume(logs: readonly SessionLog[]): { week: number; volumeKg: number }[] {
  const byWeek = new Map<number, number>()
  for (const log of gymLogs(logs)) {
    const week = getSession(log.sessionId)?.week
    if (week) byWeek.set(week, (byWeek.get(week) ?? 0) + totalVolumeLoad(log.exercises))
  }
  return PLAN_WEEKS.map((w) => ({ week: w.week, volumeKg: byWeek.get(w.week) ?? 0 }))
}
