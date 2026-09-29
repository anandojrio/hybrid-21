import { getExercise } from '@/data/exercises'
import { getIntensityGuide, INTENSITY_NOTICE, RUN_COACHING_RULES } from '@/data/running-plan'
import { getTemplate } from '@/data/workout-templates'
import {
  estimateTemplateMinutes,
  formatMinutesRange,
  formatPaceRange,
  runDurationRange,
} from '@/domain/calculations'
import type { PlannedSession, Range, RunSegment } from '@/domain/types'

export interface ContentItem {
  id: string
  label: string
  detail?: string
  exerciseId?: string
}

export interface ContentSection {
  id: string
  title: string
  items: ContentItem[]
  note?: string
}

const range = (r: Range, unit = '') => `${r.min === r.max ? r.min : `${r.min}–${r.max}`}${unit}`

function segmentLabel(segment: RunSegment): { label: string; detail?: string } {
  switch (segment.kind) {
    case 'continuous': {
      const guide = getIntensityGuide(segment.intensity)
      return { label: `${range(segment.minutes, ' min')} ${guide.label.toLowerCase()}` }
    }
    case 'intervals': {
      const guide = getIntensityGuide(segment.intensity)
      return {
        label: `${segment.reps} × ${segment.minutes} min ${guide.label.toLowerCase()}`,
        detail: `${segment.recoveryMinutes} min easy between`,
      }
    }
    case 'strides':
      return {
        label: `${range(segment.reps)} × ${segment.seconds} s relaxed strides`,
        detail: segment.optional ? 'Optional' : undefined,
      }
  }
}

/** Planned minutes as a range; `estimated` for gym/mobility sessions derived from sets and rest. */
export function sessionDurationRange(
  session: PlannedSession,
): { range: Range; estimated: boolean } | undefined {
  if (session.run) {
    const range = runDurationRange(session.run)
    return range ? { range, estimated: false } : undefined
  }
  if (session.templateId) {
    return { range: estimateTemplateMinutes(getTemplate(session.templateId)), estimated: true }
  }
  return undefined
}

/** Planned length for lists and headers; gym estimates are prefixed with ≈. */
export function sessionDurationLabel(session: PlannedSession): string | undefined {
  if (session.run) {
    const duration = runDurationRange(session.run)
    if (duration) return formatMinutesRange(duration)
    if (session.run.distanceKm) return `${session.run.distanceKm.toFixed(1)} km`
  }
  if (session.templateId)
    return `≈ ${formatMinutesRange(estimateTemplateMinutes(getTemplate(session.templateId)))}`
  return undefined
}

function runSections(session: PlannedSession): ContentSection[] {
  const run = session.run!
  const guide = getIntensityGuide(run.primaryIntensity)
  const hr = run.hr ?? guide.hr
  const pace = run.paceSecPerKm ?? guide.paceSecPerKm
  const planItems: ContentItem[] = run.distanceKm
    ? [{ id: 'race', label: `Half-marathon · ${run.distanceKm.toFixed(1)} km` }]
    : run.segments.map((segment, i) => ({ id: `seg-${i}`, ...segmentLabel(segment) }))

  const rules = RUN_COACHING_RULES.filter(
    (rule) => session.choiceGroupId || !rule.startsWith('Soccer replaces'),
  )
  return [
    {
      id: 'plan',
      title: session.type === 'race' ? 'Race' : 'Run plan',
      items: planItems,
      note: run.prescription,
    },
    {
      id: 'targets',
      title: 'Targets',
      items: [
        { id: 'hr', label: 'Heart rate', detail: `${hr.min}–${hr.max} bpm` },
        { id: 'pace', label: 'Pace guide', detail: formatPaceRange(pace) },
        { id: 'rpe', label: 'RPE', detail: range(guide.rpe) },
        { id: 'talk', label: 'Talk test', detail: guide.talkTest },
      ],
      note: INTENSITY_NOTICE,
    },
    {
      id: 'tactics',
      title: 'Tactics',
      items: rules.map((rule, i) => ({ id: `rule-${i}`, label: rule })),
    },
  ]
}

function gymSections(session: PlannedSession): ContentSection[] {
  const template = getTemplate(session.templateId!)
  const sections: ContentSection[] = [
    {
      id: 'warm-up',
      title: template.warmUpTitle,
      items: template.warmUp.map((w) => ({
        id: w.id,
        label: w.label,
        detail: w.dose,
        exerciseId: w.exerciseId,
      })),
      note: template.kind === 'gym' ? 'Warm-up sets are never logged.' : undefined,
    },
    {
      id: 'workout',
      title: template.kind === 'mobility' ? `Core ${session.coreSession ?? ''}`.trim() : 'Workout',
      items: template.exercises.map((e) => ({
        id: e.exerciseId,
        label: getExercise(e.exerciseId).name,
        detail: `${e.prescription} · rest ${e.rest}`,
        exerciseId: e.exerciseId,
      })),
    },
  ]
  if (template.cooldown.length) {
    sections.push({
      id: 'cooldown',
      title: template.cooldownTitle ?? 'Cooldown',
      items: template.cooldown.map((c) => ({
        id: c.id,
        label: c.label,
        detail: c.dose,
        exerciseId: c.exerciseId,
      })),
    })
  }
  if (template.techniqueNotes.length) {
    sections.push({
      id: 'technique',
      title: 'Technique notes',
      items: template.techniqueNotes.map((note, i) => ({ id: `tn-${i}`, label: note })),
    })
  }
  if (template.alternatives.length) {
    sections.push({
      id: 'alternatives',
      title: 'Alternatives',
      items: template.alternatives.map((alt, i) => ({ id: `alt-${i}`, label: alt })),
    })
  }
  for (const variant of template.variants) {
    sections.push({
      id: variant.id,
      title: variant.title,
      items: variant.items.map((item, i) => ({ id: `${variant.id}-${i}`, label: item })),
      note: variant.summary,
    })
  }
  return sections
}

/** Warm-up, main work/tactics and cooldown sections derived from the immutable plan. */
export function sessionSections(session: PlannedSession): ContentSection[] {
  if (session.run) return runSections(session)
  if (session.templateId) return gymSections(session)
  return []
}

/** ICE and SOC complete with one tap and have no data fields. */
export const isOneTap = (session: PlannedSession) =>
  session.type === 'ice' || session.type === 'soc'
