import { z } from 'zod'
import { parseDecimal, parseDuration, parsePace } from './calculations'
import { SKIP_REASONS, TALK_TEST_VALUES, type RunResult } from './types'

// ---------------------------------------------------------------------------
// Field helpers. Form inputs arrive as strings; blank optional fields become undefined.
// ---------------------------------------------------------------------------

interface NumberRule {
  min: number
  max: number
  integer?: boolean
  /** Maximum number of decimals allowed. */
  decimals?: number
}

function numberField(label: string, rule: NumberRule, required: boolean) {
  return z
    .string()
    .trim()
    .transform((value, ctx): number | undefined => {
      if (value === '') {
        if (required) ctx.addIssue({ code: 'custom', message: `${label} is required.` })
        return undefined
      }
      const n = parseDecimal(value)
      if (n === null) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a number.` })
        return z.NEVER
      }
      if (rule.integer && !Number.isInteger(n)) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a whole number.` })
        return z.NEVER
      }
      if (rule.decimals !== undefined) {
        const decimals = value.replace(',', '.').split('.')[1]?.length ?? 0
        if (decimals > rule.decimals) {
          ctx.addIssue({
            code: 'custom',
            message: `${label} allows at most ${rule.decimals} decimal${rule.decimals === 1 ? '' : 's'}.`,
          })
          return z.NEVER
        }
      }
      if (n < rule.min || n > rule.max) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} must be between ${rule.min} and ${rule.max}.`,
        })
        return z.NEVER
      }
      return n
    })
}

const requiredNumber = (label: string, rule: NumberRule) =>
  numberField(label, rule, true).pipe(z.number())
const optionalNumber = (label: string, rule: NumberRule) => numberField(label, rule, false)

function durationField(label: string, required: boolean, maxSec: number) {
  return z
    .string()
    .trim()
    .transform((value, ctx): number | undefined => {
      if (value === '') {
        if (required) ctx.addIssue({ code: 'custom', message: `${label} is required.` })
        return undefined
      }
      const sec = parseDuration(value)
      if (sec === null) {
        ctx.addIssue({ code: 'custom', message: `${label} must use hh:mm:ss.` })
        return z.NEVER
      }
      if (sec > maxSec) {
        ctx.addIssue({ code: 'custom', message: `${label} looks too long.` })
        return z.NEVER
      }
      return sec
    })
}

const SIX_HOURS = 6 * 3600

const scale = (min: number, max: number) => z.number().int().min(min).max(max).optional()

// ---------------------------------------------------------------------------
// Running log form
// ---------------------------------------------------------------------------

export const runFormSchema = z
  .object({
    distanceKm: requiredNumber('Distance', { min: 0.1, max: 60, decimals: 2 }),
    duration: durationField('Time', true, SIX_HOURS).pipe(z.number().positive('Time is required.')),
    avgPace: z
      .string()
      .trim()
      .min(1, 'Avg Pace is required.')
      .transform((value, ctx) => {
        const sec = parsePace(value)
        if (sec === null) {
          ctx.addIssue({ code: 'custom', message: 'Avg Pace must use m:ss, e.g. 6:45.' })
          return z.NEVER
        }
        if (sec < 150 || sec > 1200) {
          ctx.addIssue({ code: 'custom', message: 'Avg Pace must be between 2:30 and 20:00.' })
          return z.NEVER
        }
        return sec
      }),
    avgHr: requiredNumber('Avg HR', { min: 40, max: 230, integer: true }),
    maxHr: requiredNumber('Max HR', { min: 40, max: 240, integer: true }),

    zone1: durationField('Zone 1', false, SIX_HOURS),
    zone2: durationField('Zone 2', false, SIX_HOURS),
    zone3: durationField('Zone 3', false, SIX_HOURS),
    zone4: durationField('Zone 4', false, SIX_HOURS),
    zone5: durationField('Zone 5', false, SIX_HOURS),
    aerobicTe: optionalNumber('Aerobic Training Effect', { min: 0, max: 5, decimals: 1 }),
    anaerobicTe: optionalNumber('Anaerobic Training Effect', { min: 0, max: 5, decimals: 1 }),
    avgPowerW: optionalNumber('Avg Power', { min: 0, max: 1000, integer: true }),
    totalAscentM: optionalNumber('Total Ascent', { min: 0, max: 5000, integer: true }),
    avgCadenceSpm: optionalNumber('Avg Run Cadence', { min: 60, max: 260, integer: true }),

    rpe: scale(1, 10),
    talkTest: z.enum(TALK_TEST_VALUES).optional(),
    kneePainDuring: scale(0, 10),
    kneePainAfter: scale(0, 10),
    note: z.string().trim().max(2000).optional(),
    modified: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.maxHr < v.avgHr) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxHr'],
        message: 'Max HR cannot be lower than Avg HR.',
      })
    }
  })

export type RunFormInput = z.input<typeof runFormSchema>
export type RunFormOutput = z.output<typeof runFormSchema>

export function toRunResult(form: RunFormOutput): RunResult {
  const zones = [form.zone1, form.zone2, form.zone3, form.zone4, form.zone5] as const
  const result: RunResult = {
    distanceKm: form.distanceKm,
    durationSec: form.duration,
    avgPaceSecPerKm: form.avgPace,
    avgHr: form.avgHr,
    maxHr: form.maxHr,
  }
  if (zones.some((z) => z !== undefined)) result.hrZonesSec = [...zones]
  const optional = {
    aerobicTe: form.aerobicTe,
    anaerobicTe: form.anaerobicTe,
    avgPowerW: form.avgPowerW,
    totalAscentM: form.totalAscentM,
    avgCadenceSpm: form.avgCadenceSpm,
    rpe: form.rpe,
    talkTest: form.talkTest,
    kneePainDuring: form.kneePainDuring,
    kneePainAfter: form.kneePainAfter,
  }
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) Object.assign(result, { [key]: value })
  }
  return result
}

// ---------------------------------------------------------------------------
// Morning check-in
// ---------------------------------------------------------------------------

export const morningCheckInSchema = z
  .object({
    kneePainNextMorning: scale(0, 10),
    soreness: scale(0, 10),
    energy: scale(1, 5),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Fill in at least one check-in value.',
  })

// ---------------------------------------------------------------------------
// Skip and mobility
// ---------------------------------------------------------------------------

export const skipFormSchema = z.object({
  reason: z.enum(SKIP_REASONS, { message: 'Choose a reason.' }),
  note: z.string().trim().max(2000).optional(),
})

export const mobilityFormSchema = z.object({
  coreSession: z.enum(['A', 'B']),
  asPrescribed: z.boolean(),
  durationMin: optionalNumber('Duration', { min: 1, max: 240, integer: true }),
  note: z.string().trim().max(2000).optional(),
})

// ---------------------------------------------------------------------------
// Exercise results (shared by the gym form and backup validation)
// ---------------------------------------------------------------------------

const sets = z.number().int().min(0).max(20)
const reps = z.number().int().min(0).max(1000)
const kg = z.number().min(0).max(500)

export const exerciseResultSchema = z.discriminatedUnion('kind', [
  z.object({
    exerciseId: z.string(),
    kind: z.literal('loaded'),
    setsCompleted: sets,
    totalReps: reps,
    loadKg: kg,
  }),
  z.object({
    exerciseId: z.string(),
    kind: z.literal('unilateral'),
    setsCompleted: sets,
    repsPerSide: reps,
    loadKg: kg,
  }),
  z.object({
    exerciseId: z.string(),
    kind: z.literal('timed'),
    setsCompleted: sets,
    totalHoldSeconds: z.number().int().min(0).max(3600),
  }),
  z.object({
    exerciseId: z.string(),
    kind: z.literal('bodyweight-loadable'),
    setsCompleted: sets,
    totalReps: reps,
    addedLoadKg: kg.optional(),
  }),
  z.object({
    exerciseId: z.string(),
    kind: z.literal('contacts'),
    setsCompleted: sets,
    totalContacts: reps,
  }),
])
