import type { ExerciseResult, Range, RunPrescription, WorkoutTemplate } from './types'

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/** Parses a user-entered decimal, accepting both `4.5` and `4,5` (iOS decimal keypads). */
export function parseDecimal(input: string): number | null {
  const normalized = input.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null
  return Number(normalized)
}

export function formatKg(kg: number): string {
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1).replace(/\.0$/, '')} kg`
}

// ---------------------------------------------------------------------------
// Durations (hh:mm:ss)
// ---------------------------------------------------------------------------

/**
 * Parses `hh:mm:ss`, `h:mm:ss` or `mm:ss` into seconds. Returns null for invalid input.
 * Minutes and seconds after the leading field must be below 60.
 */
export function parseDuration(input: string): number | null {
  const parts = input.trim().split(':')
  if (parts.length < 2 || parts.length > 3) return null
  if (!parts.every((p) => /^\d+$/.test(p))) return null
  const nums = parts.map(Number)
  const [a, b, c] = nums as [number, number, number | undefined]
  if (parts.length === 2) {
    if (b >= 60 || parts[1]!.length !== 2) return null
    return a * 60 + b
  }
  if (b >= 60 || c! >= 60 || parts[1]!.length !== 2 || parts[2]!.length !== 2) return null
  return a * 3600 + b * 60 + c!
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':')
}

/** Compact human duration, e.g. `1 h 35 min` or `45 min`. */
export function formatMinutes(minutes: number): string {
  const m = Math.round(minutes)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}

export function formatMinutesRange(range: Range): string {
  if (range.min === range.max) return formatMinutes(range.min)
  if (range.max < 60) return `${range.min}–${range.max} min`
  return `${formatMinutes(range.min)} – ${formatMinutes(range.max)}`
}

// ---------------------------------------------------------------------------
// Pace (min/km)
// ---------------------------------------------------------------------------

/** Parses `m:ss` pace into seconds per km. */
export function parsePace(input: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.trim())
  if (!match) return null
  const minutes = Number(match[1])
  const seconds = Number(match[2])
  if (seconds >= 60) return null
  const total = minutes * 60 + seconds
  return total > 0 ? total : null
}

export function formatPace(secPerKm: number): string {
  const rounded = Math.round(secPerKm)
  const m = Math.floor(rounded / 60)
  const s = rounded % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPaceRange(range: Range): string {
  return `${formatPace(range.min)}–${formatPace(range.max)}/km`
}

export function paceFromDistanceAndTime(distanceKm: number, durationSec: number): number | null {
  if (!(distanceKm > 0) || !(durationSec > 0)) return null
  return durationSec / distanceKm
}

/** Difference (s/km) above which entered Garmin pace is flagged as inconsistent. */
export const PACE_MISMATCH_TOLERANCE_SEC = 10

export interface PaceCheck {
  computedSecPerKm: number
  differenceSec: number
  material: boolean
}

/** Non-blocking consistency check between entered Garmin Avg Pace and time/distance. */
export function checkPace(
  enteredSecPerKm: number,
  distanceKm: number,
  durationSec: number,
  toleranceSec = PACE_MISMATCH_TOLERANCE_SEC,
): PaceCheck | null {
  const computed = paceFromDistanceAndTime(distanceKm, durationSec)
  if (computed === null) return null
  const differenceSec = Math.abs(computed - enteredSecPerKm)
  return { computedSecPerKm: computed, differenceSec, material: differenceSec > toleranceSec }
}

/** Aggregated pace = total time / total distance; never the mean of individual paces. */
export function aggregatePace(
  runs: readonly { distanceKm: number; durationSec: number }[],
): number | null {
  const distance = runs.reduce((sum, r) => sum + r.distanceKm, 0)
  const time = runs.reduce((sum, r) => sum + r.durationSec, 0)
  return paceFromDistanceAndTime(distance, time)
}

// ---------------------------------------------------------------------------
// Planned run duration
// ---------------------------------------------------------------------------

/** Planned duration in minutes derived from segments; null when not duration-based (race). */
export function runDurationRange(run: RunPrescription): Range | null {
  let min = 0
  let max = 0
  for (const segment of run.segments) {
    if (segment.kind === 'continuous') {
      min += segment.minutes.min
      max += segment.minutes.max
    } else if (segment.kind === 'intervals') {
      const total = segment.reps * segment.minutes + (segment.reps - 1) * segment.recoveryMinutes
      min += total
      max += total
    }
  }
  return max > 0 ? { min, max } : null
}

// ---------------------------------------------------------------------------
// Gym
// ---------------------------------------------------------------------------

/**
 * Volume load = total reps × load kg (sets are not multiplied again).
 * Only valid for standard loaded exercises; other kinds return null.
 */
export function volumeLoad(result: ExerciseResult): number | null {
  if (result.kind !== 'loaded') return null
  if (result.totalReps <= 0 || result.loadKg <= 0) return null
  return result.totalReps * result.loadKg
}

export function totalVolumeLoad(results: readonly ExerciseResult[]): number {
  return results.reduce((sum, r) => sum + (volumeLoad(r) ?? 0), 0)
}

const setsLabel = (n: number) => `${n} ${n === 1 ? 'set' : 'sets'}`

/** Display string such as `4 sets · 34 reps · bodyweight`. */
export function formatExerciseResult(result: ExerciseResult): string {
  switch (result.kind) {
    case 'loaded':
      return `${setsLabel(result.setsCompleted)} · ${result.totalReps} reps · ${formatKg(result.loadKg)}`
    case 'unilateral':
      return `${setsLabel(result.setsCompleted)} · ${result.repsPerSide} reps per side · ${formatKg(result.loadKg)}`
    case 'timed':
      return `${setsLabel(result.setsCompleted)} · ${result.totalHoldSeconds} s total hold`
    case 'bodyweight-loadable':
      return `${setsLabel(result.setsCompleted)} · ${result.totalReps} reps · ${
        result.addedLoadKg ? `bodyweight + ${formatKg(result.addedLoadKg)}` : 'bodyweight'
      }`
    case 'contacts':
      return `${setsLabel(result.setsCompleted)} · ${result.totalContacts} contacts`
  }
}

/** Assumed working time per set (seconds) for session duration estimates. */
const WORK_SECONDS_PER_SET: Range = { min: 30, max: 50 }
const WARM_UP_MINUTES: Range = { min: 10, max: 15 }

/**
 * Estimated session length in minutes, rounded to 5 min. Derived from planned sets and
 * rest periods; optional exercises only count toward the upper bound.
 */
export function estimateTemplateMinutes(template: WorkoutTemplate): Range {
  let minSec = WARM_UP_MINUTES.min * 60
  let maxSec = WARM_UP_MINUTES.max * 60
  for (const ex of template.exercises) {
    const sideFactor = ex.perSide ? 2 : 1
    if (!ex.optional) {
      minSec += ex.sets.min * (WORK_SECONDS_PER_SET.min * sideFactor + ex.restSeconds.min)
    }
    maxSec += ex.sets.max * (WORK_SECONDS_PER_SET.max * sideFactor + ex.restSeconds.max)
  }
  // Static stretching block after mobility sessions.
  if (template.cooldown.length) {
    minSec += 8 * 60
    maxSec += 12 * 60
  }
  const round5 = (sec: number) => Math.max(5, Math.round(sec / 60 / 5) * 5)
  return { min: round5(minSec), max: round5(maxSec) }
}
