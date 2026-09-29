import type { PreviousExerciseResult } from '@/db'
import { getExercise } from '@/data/exercises'
import { formatExerciseResult, parseDecimal } from '@/domain/calculations'
import { exerciseResultSchema } from '@/domain/schemas'
import type { ExerciseLogKind, ExerciseResult, GymLog, PrescribedExercise } from '@/domain/types'

export interface DraftValues {
  sets: string
  /** Total reps, reps per side, hold seconds or contacts depending on kind. */
  amount: string
  /** Load kg, or added load kg for pull-ups (blank = bodyweight). */
  load: string
}

export interface ExerciseDraft {
  exerciseId: string
  kind: ExerciseLogKind
  optional: boolean
  prescription: string
  included: boolean
  values: DraftValues
  previous?: PreviousExerciseResult
}

export const AMOUNT_LABEL: Record<ExerciseLogKind, { label: string; unit?: string }> = {
  loaded: { label: 'Total reps', unit: 'all working sets' },
  unilateral: { label: 'Reps per side', unit: 'all working sets' },
  timed: { label: 'Total hold time', unit: 'seconds' },
  'bodyweight-loadable': { label: 'Total reps', unit: 'all working sets' },
  contacts: { label: 'Total contacts', unit: 'all working sets' },
}

export const hasLoad = (kind: ExerciseLogKind) =>
  kind === 'loaded' || kind === 'unilateral' || kind === 'bodyweight-loadable'

export function valuesFromResult(result: ExerciseResult | undefined): DraftValues {
  if (!result) return { sets: '', amount: '', load: '' }
  const sets = String(result.setsCompleted)
  switch (result.kind) {
    case 'loaded':
      return { sets, amount: String(result.totalReps), load: String(result.loadKg) }
    case 'unilateral':
      return { sets, amount: String(result.repsPerSide), load: String(result.loadKg) }
    case 'timed':
      return { sets, amount: String(result.totalHoldSeconds), load: '' }
    case 'bodyweight-loadable':
      return {
        sets,
        amount: String(result.totalReps),
        load: result.addedLoadKg ? String(result.addedLoadKg) : '',
      }
    case 'contacts':
      return { sets, amount: String(result.totalContacts), load: '' }
  }
}

/**
 * Initial drafts: an edited log keeps its own values; otherwise every exercise with a
 * previous result is prefilled with it and saved as-is unless changed (owner decision).
 */
export function buildDrafts(
  exercises: readonly PrescribedExercise[],
  previous: Map<string, PreviousExerciseResult>,
  log?: GymLog,
): ExerciseDraft[] {
  return exercises.map((e) => {
    const kind = getExercise(e.exerciseId).logKind ?? 'loaded'
    const prev = previous.get(e.exerciseId)
    const logged = log?.exercises.find((r) => r.exerciseId === e.exerciseId)
    const source = log ? logged : prev?.result
    return {
      exerciseId: e.exerciseId,
      kind,
      optional: !!e.optional,
      prescription: e.prescription,
      included: !!source,
      values: valuesFromResult(source),
      previous: prev,
    }
  })
}

function whole(value: string): number | null {
  const n = parseDecimal(value)
  return n !== null && Number.isInteger(n) ? n : null
}

export type DraftParse = { ok: true; result: ExerciseResult } | { ok: false; error: string }

export function parseDraft(
  draft: Pick<ExerciseDraft, 'exerciseId' | 'kind' | 'values'>,
): DraftParse {
  const { values, kind, exerciseId } = draft
  const sets = whole(values.sets)
  const amount = whole(values.amount)
  if (sets === null || sets < 1) return { ok: false, error: 'Enter sets completed (whole number).' }
  if (amount === null)
    return { ok: false, error: `Enter ${AMOUNT_LABEL[kind].label.toLowerCase()} (whole number).` }
  const load = values.load.trim() === '' ? undefined : parseDecimal(values.load)
  if (values.load.trim() !== '' && load === null)
    return { ok: false, error: 'Load must be a number.' }
  if (kind !== 'bodyweight-loadable' && hasLoad(kind) && load === undefined) {
    return { ok: false, error: 'Enter the load in kg.' }
  }

  const candidate =
    kind === 'loaded'
      ? { exerciseId, kind, setsCompleted: sets, totalReps: amount, loadKg: load }
      : kind === 'unilateral'
        ? { exerciseId, kind, setsCompleted: sets, repsPerSide: amount, loadKg: load }
        : kind === 'timed'
          ? { exerciseId, kind, setsCompleted: sets, totalHoldSeconds: amount }
          : kind === 'contacts'
            ? { exerciseId, kind, setsCompleted: sets, totalContacts: amount }
            : {
                exerciseId,
                kind,
                setsCompleted: sets,
                totalReps: amount,
                ...(load ? { addedLoadKg: load } : {}),
              }
  const parsed = exerciseResultSchema.safeParse(candidate)
  if (!parsed.success)
    return { ok: false, error: 'Check the values: they are outside the allowed range.' }
  return { ok: true, result: parsed.data as ExerciseResult }
}

export function draftSummary(draft: ExerciseDraft): string {
  if (!draft.included) return draft.previous ? 'Not done' : 'Tap to enter'
  const parsed = parseDraft(draft)
  return parsed.ok ? formatExerciseResult(parsed.result) : 'Incomplete'
}

export const lastTimeText = (prev: PreviousExerciseResult | undefined) =>
  prev ? `Last time: ${formatExerciseResult(prev.result)}` : 'No previous result'
