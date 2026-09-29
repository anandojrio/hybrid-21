import { addDays, compareIsoDates, dayOfWeek, daysBetween } from '../lib/dates'
import type { IsoDate, PlannedSession, PlanWeek } from '../domain/types'
import { RUNNING_PLAN, type RunPlanEntry, type RunSlot } from './running-plan'

export const PLAN_START: IsoDate = '2026-09-21'
export const RACE_DATE: IsoDate = '2026-12-12'
export const PLAN_END: IsoDate = RACE_DATE
export const TOTAL_WEEKS = 12

const WEEK_FOCUS: Record<number, Pick<PlanWeek, 'focus' | 'cutback' | 'taper'>> = {
  1: { focus: 'Establish tolerance' },
  2: { focus: 'Confirm knee/tissue response' },
  3: { focus: 'Introduce moderate work' },
  4: { focus: 'Cutback', cutback: true },
  5: { focus: 'Extend controlled work' },
  6: { focus: 'Aerobic strength' },
  7: { focus: 'Cutback', cutback: true },
  8: { focus: 'Start race-specific block' },
  9: { focus: 'Race-specific endurance' },
  10: { focus: 'Peak week' },
  11: { focus: 'Reduce volume', taper: true },
  12: { focus: 'Taper and race', taper: true },
}

export const PLAN_WEEKS: readonly PlanWeek[] = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
  const week = i + 1
  const start = addDays(PLAN_START, i * 7)
  const naturalEnd = addDays(start, 6)
  const focus = WEEK_FOCUS[week]
  if (!focus) throw new Error(`Missing focus for week ${week}`)
  return {
    week,
    start,
    end: compareIsoDates(naturalEnd, PLAN_END) > 0 ? PLAN_END : naturalEnd,
    ...focus,
  }
})

const pad = (week: number) => String(week).padStart(2, '0')

function runEntry(week: number, slot: RunSlot): RunPlanEntry {
  const entry = RUNNING_PLAN.find((e) => e.week === week && e.slot === slot)
  if (!entry) throw new Error(`Missing run for week ${week} ${slot}`)
  return entry
}

function legTemplate(week: number): string {
  if (week === 1) return 'leg-intro'
  if (week === 2) return 'leg-base'
  return 'leg-full'
}

function runNote(entry: RunPlanEntry): string | undefined {
  const notes: string[] = []
  if (entry.run.conditionalNote) notes.push(entry.run.conditionalNote)
  if (entry.offAllowed) notes.push('Taking the day off instead is part of the plan.')
  if (entry.orSoccer) notes.push('Football replaces this run; it is never added on top.')
  return notes.length ? notes.join(' ') : undefined
}

function buildWeek(planWeek: PlanWeek): PlannedSession[] {
  const { week, start, focus } = planWeek
  const w = pad(week)
  const date = (offset: number) => addDays(start, offset)
  const twoSetsAllowed = week <= 2 || Boolean(planWeek.cutback || planWeek.taper)
  const sessions: PlannedSession[] = []

  const push = (s: Omit<PlannedSession, 'week' | 'dayOfWeek'>) =>
    sessions.push({ ...s, week, dayOfWeek: dayOfWeek(s.date) })

  // Monday — LEG
  push({
    id: `w${w}-mon-leg`,
    date: date(0),
    order: 1,
    type: 'leg',
    title: 'Leg Strength',
    goal: 'Lower-body strength: squat, hinge, single-leg work, hamstrings, calves and adductors.',
    templateId: legTemplate(week),
  })

  // Tuesday — RUN, then MOB later in the day
  const tue = runEntry(week, 'tue')
  push({
    id: `w${w}-tue-run`,
    date: tue.date,
    order: 1,
    type: 'run',
    title: tue.title,
    goal: focus,
    run: tue.run,
    coachingNote: runNote(tue),
  })
  const core = week % 2 === 1 ? 'A' : 'B'
  const light = week === 12
  push({
    id: `w${w}-tue-mob`,
    date: date(1),
    order: 2,
    type: 'mob',
    title: light ? `Mobility + Core ${core} (light)` : `Mobility + Core ${core}`,
    goal: 'Hip, ankle and thoracic mobility, kettlebell core work, then static stretching.',
    templateId: core === 'A' ? 'mob-a' : 'mob-b',
    coreSession: core,
    lightMobility: light || undefined,
    twoSetsAllowed: twoSetsAllowed || undefined,
    coachingNote: light
      ? 'Race week: light mobility and 1–2 easy sets only.'
      : twoSetsAllowed
        ? 'Two sets per exercise are fine this week.'
        : undefined,
  })

  // Wednesday — ICE
  push({
    id: `w${w}-wed-ice`,
    date: date(2),
    order: 1,
    type: 'ice',
    title: 'Ice Hockey',
    goal: 'Ice hockey session.',
  })

  // Thursday — PUSH plus easy RUN (or SOC where prescribed)
  push({
    id: `w${w}-thu-push`,
    date: date(3),
    order: 1,
    type: 'push',
    title: 'Upper Body',
    goal: 'Chest, biceps and front-shoulder strength; bench press is the main measurable lift.',
    templateId: 'push',
  })
  const thu = runEntry(week, 'thu')
  const choiceGroupId = thu.orSoccer ? `w${w}-thu-choice` : undefined
  push({
    id: `w${w}-thu-run`,
    date: thu.date,
    order: 2,
    type: 'run',
    title: thu.title,
    goal: focus,
    run: thu.run,
    choiceGroupId,
    offAllowed: thu.offAllowed,
    coachingNote: runNote(thu),
  })
  if (thu.orSoccer) {
    push({
      id: `w${w}-thu-soc`,
      date: thu.date,
      order: 3,
      type: 'soc',
      title: 'Football',
      goal: 'Optional football instead of the Thursday run.',
      choiceGroupId,
      coachingNote: 'Football replaces the easy run; it is never added on top.',
    })
  }

  // Friday — PULL
  push({
    id: `w${w}-fri-pull`,
    date: date(4),
    order: 1,
    type: 'pull',
    title: 'Upper Body',
    goal: 'Back, triceps and rear/lateral shoulder strength; pull-ups are the main measurable lift.',
    templateId: 'pull',
  })

  // Saturday — LONG, or RACE on race day
  const sat = runEntry(week, 'sat')
  const isRace = sat.date === RACE_DATE
  push({
    id: isRace ? `w${w}-sat-race` : `w${w}-sat-long`,
    date: sat.date,
    order: 1,
    type: isRace ? 'race' : 'long',
    title: sat.title,
    goal: isRace ? 'Race the half-marathon at controlled HM effort.' : focus,
    run: sat.run,
    coachingNote: runNote(sat),
  })

  // Sunday — ICE (the plan ends on race day)
  const sunday = date(6)
  if (compareIsoDates(sunday, PLAN_END) <= 0) {
    push({
      id: `w${w}-sun-ice`,
      date: sunday,
      order: 1,
      type: 'ice',
      title: 'Ice Hockey',
      goal: 'Ice hockey session.',
    })
  }

  return sessions
}

function sortSessions(a: PlannedSession, b: PlannedSession): number {
  return compareIsoDates(a.date, b.date) || a.order - b.order
}

/** The canonical, immutable plan. UI and calendar sync both derive from this list. */
export const PLANNED_SESSIONS: readonly PlannedSession[] =
  PLAN_WEEKS.flatMap(buildWeek).sort(sortSessions)

const byId = new Map(PLANNED_SESSIONS.map((s) => [s.id, s]))

export function getSession(id: string): PlannedSession | undefined {
  return byId.get(id)
}

export function getSessionsForDate(date: IsoDate): PlannedSession[] {
  return PLANNED_SESSIONS.filter((s) => s.date === date)
}

/**
 * Sessions as the UI lists them: an either/or Thursday shows as its run only, because
 * football is chosen inside the run's form.
 */
export function getVisibleSessionsForDate(date: IsoDate): PlannedSession[] {
  return getSessionsForDate(date).filter((s) => !(s.type === 'soc' && s.choiceGroupId))
}

export function getSessionsBetween(from: IsoDate, to: IsoDate): PlannedSession[] {
  return PLANNED_SESSIONS.filter(
    (s) => compareIsoDates(s.date, from) >= 0 && compareIsoDates(s.date, to) <= 0,
  )
}

export function getChoiceGroup(choiceGroupId: string): PlannedSession[] {
  return PLANNED_SESSIONS.filter((s) => s.choiceGroupId === choiceGroupId)
}

/** Plan week (1–12) containing the date, or null outside the plan. */
export function getPlanWeek(date: IsoDate): PlanWeek | null {
  const offset = daysBetween(PLAN_START, date)
  if (offset < 0 || compareIsoDates(date, PLAN_END) > 0) return null
  return PLAN_WEEKS[Math.floor(offset / 7)] ?? null
}
