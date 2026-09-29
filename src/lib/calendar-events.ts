import { getExercise } from '../data/exercises'
import { getIntensityGuide } from '../data/running-plan'
import { getTemplate } from '../data/workout-templates'
import { formatMinutesRange, formatPaceRange, runDurationRange } from '../domain/calculations'
import type { IsoDate, PlannedSession } from '../domain/types'
import { addDays, compareIsoDates } from './dates'

/**
 * Google Calendar sync is performed by Claude through the Calendar connector, not by the app.
 * This module only derives the event list from the canonical plan so both stay identical.
 */
export interface CalendarEventSpec {
  /** Stable key: session ID, or the choice-group ID for an either/or pair. */
  key: string
  sessionIds: string[]
  /** Slug(s) shown in the title, e.g. `run` or `run/soc`. */
  slug: string
  date: IsoDate
  /** Exclusive end date of the all-day event (the following day). */
  endDate: IsoDate
  summary: string
  description: string
}

const upper = (s: string) => s.toUpperCase()

function runLines(session: PlannedSession): string[] {
  const run = session.run
  if (!run) return []
  const lines = [run.prescription]
  const duration = runDurationRange(run)
  if (duration) lines.push(`Target duration: ${formatMinutesRange(duration)}`)
  const guide = getIntensityGuide(run.primaryIntensity)
  const hr = run.hr ?? guide.hr
  lines.push(
    `HR ${hr.min}–${hr.max} bpm · pace guide ${formatPaceRange(run.paceSecPerKm ?? guide.paceSecPerKm)}`,
  )
  if (run.distanceKm) lines.push(`Distance: ${run.distanceKm.toFixed(1)} km`)
  return lines
}

function templateLines(session: PlannedSession): string[] {
  if (!session.templateId) return []
  const template = getTemplate(session.templateId)
  const list = template.exercises.map(
    (ex) => `• ${getExercise(ex.exerciseId).name}: ${ex.prescription}`,
  )
  return template.kind === 'mobility'
    ? ['Dynamic mobility → core → static stretching', ...list]
    : ['Warm-up first (not logged)', ...list]
}

function sessionDescription(session: PlannedSession): string[] {
  const lines = [session.goal, ...runLines(session), ...templateLines(session)]
  if (session.coachingNote) lines.push(session.coachingNote)
  return lines
}

function footer(ids: string[]): string {
  return `Hybrid 21 · ${ids.join(', ')}`
}

export function deriveCalendarEvents(
  sessions: readonly PlannedSession[],
  options: { from?: IsoDate } = {},
): CalendarEventSpec[] {
  const events: CalendarEventSpec[] = []
  const handledGroups = new Set<string>()

  for (const session of sessions) {
    if (options.from && compareIsoDates(session.date, options.from) < 0) continue

    if (session.choiceGroupId) {
      if (handledGroups.has(session.choiceGroupId)) continue
      handledGroups.add(session.choiceGroupId)
      const members = sessions.filter((s) => s.choiceGroupId === session.choiceGroupId)
      const run = members.find((m) => m.type === 'run')
      const others = members.filter((m) => m !== run)
      const ids = members.map((m) => m.id)
      events.push({
        key: session.choiceGroupId,
        sessionIds: ids,
        slug: members.map((m) => m.type).join('/'),
        date: session.date,
        endDate: addDays(session.date, 1),
        summary: `${members.map((m) => upper(m.type)).join('/')} · ${run?.title ?? session.title} or ${others.map((o) => o.title).join(' or ')}`,
        description: [
          'Either/or: do one, never both.',
          ...(run ? sessionDescription(run) : []),
          footer(ids),
        ].join('\n'),
      })
      continue
    }

    events.push({
      key: session.id,
      sessionIds: [session.id],
      slug: session.type,
      date: session.date,
      endDate: addDays(session.date, 1),
      summary: `${upper(session.type)} · ${session.title}`,
      description: [...sessionDescription(session), footer([session.id])].join('\n'),
    })
  }
  return events
}
