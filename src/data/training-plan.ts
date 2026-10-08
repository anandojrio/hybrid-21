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
  3: { focus: 'Recover from illness' },
  4: { focus: 'Rebuild after illness' },
  5: { focus: 'Introduce moderate work' },
  6: { focus: 'Extend controlled work' },
  7: { focus: 'Aerobic strength' },
  8: { focus: 'Cutback', cutback: true },
  9: { focus: 'Start race-specific block' },
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

/**
 * Hockey moved from Wednesday to Thursday on 2026-10-08 (week 3). Weeks 1–2 keep their
 * original layout so logged history still matches; from week 4 PUSH and the midweek run
 * are on Wednesday and hockey is on Thursday.
 */
const HOCKEY_THURSDAY_FROM_WEEK = 3
const WEDNESDAY_MIDWEEK_FROM_WEEK = 4

/** First week back after illness: lighter gym work. */
const REBUILD_WEEK = 4
const REBUILD_GYM_NOTE =
  'Back from illness: about 2/3 of the sets at RIR 3; no load increases this week.'

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
  const twoSetsAllowed = week <= REBUILD_WEEK || Boolean(planWeek.cutback || planWeek.taper)
  const gymNote = week === REBUILD_WEEK ? REBUILD_GYM_NOTE : undefined
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
    coachingNote: gymNote,
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

  const pushSession = (day: 'wed' | 'thu', order: number) =>
    push({
      id: `w${w}-${day}-push`,
      date: date(day === 'wed' ? 2 : 3),
      order,
      type: 'push',
      title: 'Upper Body',
      goal: 'Chest, biceps and front-shoulder strength; bench press is the main measurable lift.',
      templateId: 'push',
      coachingNote:
        gymNote ??
        (week === TOTAL_WEEKS
          ? 'Race week: use the lighter A-week contingency (bench 4 × 4–6, incline 2–3 sets, no shoulder press).'
          : undefined),
    })

  const iceSession = (day: 'wed' | 'thu', order = 1) =>
    push({
      id: `w${w}-${day}-ice`,
      date: date(day === 'wed' ? 2 : 3),
      order,
      type: 'ice',
      title: 'Ice Hockey',
      goal: 'Ice hockey session.',
      coachingNote:
        week === TOTAL_WEEKS && day === 'thu'
          ? 'Two days before the race: an easy skate or skip it.'
          : undefined,
    })

  // Midweek run (Thursday in weeks 1–2, Wednesday from week 4), optionally football.
  const midweekRun = (slot: 'wed' | 'thu', order: number) => {
    const entry = runEntry(week, slot)
    const choiceGroupId = entry.orSoccer ? `w${w}-${slot}-choice` : undefined
    push({
      id: `w${w}-${slot}-run`,
      date: entry.date,
      order,
      type: 'run',
      title: entry.title,
      goal: focus,
      run: entry.run,
      choiceGroupId,
      offAllowed: entry.offAllowed,
      coachingNote: runNote(entry),
    })
    if (entry.orSoccer) {
      push({
        id: `w${w}-${slot}-soc`,
        date: entry.date,
        order: order + 1,
        type: 'soc',
        title: 'Football',
        goal: 'Optional football instead of the midweek run.',
        choiceGroupId,
        coachingNote: 'Football replaces the easy run; it is never added on top.',
      })
    }
  }

  if (week >= WEDNESDAY_MIDWEEK_FROM_WEEK) {
    // Wednesday — PUSH plus easy RUN (or football); Thursday — ICE
    pushSession('wed', 1)
    midweekRun('wed', 2)
    iceSession('thu')
  } else if (week >= HOCKEY_THURSDAY_FROM_WEEK) {
    // Transition week: Wednesday hockey already played; Thursday Oct 8 keeps PUSH (done
    // in the gym before evening hockey) and drops its run.
    iceSession('wed')
    pushSession('thu', 1)
    iceSession('thu', 2)
  } else {
    // Wednesday — ICE; Thursday — PUSH plus easy RUN (or football)
    iceSession('wed')
    pushSession('thu', 1)
    midweekRun('thu', 2)
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
    coachingNote: gymNote,
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
 * Sessions as the UI lists them: an either/or midweek run shows as the run only, because
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
