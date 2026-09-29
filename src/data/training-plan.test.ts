import { runDurationRange } from '../domain/calculations'
import { dayOfWeek, isIsoDate } from '../lib/dates'
import { getExercise } from './exercises'
import { RUNNING_PLAN } from './running-plan'
import {
  PLAN_START,
  PLAN_WEEKS,
  PLANNED_SESSIONS,
  RACE_DATE,
  getChoiceGroup,
  getPlanWeek,
  getSessionsForDate,
} from './training-plan'
import { WORKOUT_TEMPLATES } from './workout-templates'

const byType = (type: string) => PLANNED_SESSIONS.filter((s) => s.type === type)
const dayTypes = (week: number) =>
  PLANNED_SESSIONS.filter((s) => s.week === week).map((s) => `${s.dayOfWeek}:${s.type}`)

describe('canonical training plan', () => {
  it('starts Monday 2026-09-21 and has 12 weeks', () => {
    expect(PLAN_START).toBe('2026-09-21')
    expect(dayOfWeek(PLAN_START)).toBe(1)
    expect(PLAN_WEEKS.map((w) => w.start)).toEqual([
      '2026-09-21',
      '2026-09-28',
      '2026-10-05',
      '2026-10-12',
      '2026-10-19',
      '2026-10-26',
      '2026-11-02',
      '2026-11-09',
      '2026-11-16',
      '2026-11-23',
      '2026-11-30',
      '2026-12-07',
    ])
    expect(PLAN_WEEKS.at(-1)?.end).toBe('2026-12-12')
  })

  it('has exactly one race, on Saturday 2026-12-12, and nothing after it', () => {
    expect(RACE_DATE).toBe('2026-12-12')
    const races = byType('race')
    expect(races).toHaveLength(1)
    expect(races[0]).toMatchObject({
      id: 'w12-sat-race',
      date: '2026-12-12',
      dayOfWeek: 6,
      week: 12,
    })
    expect(PLANNED_SESSIONS.every((s) => s.date <= RACE_DATE)).toBe(true)
  })

  it('uses valid date-only strings and matching weekdays for every session', () => {
    for (const s of PLANNED_SESSIONS) {
      expect(isIsoDate(s.date)).toBe(true)
      expect(dayOfWeek(s.date)).toBe(s.dayOfWeek)
      expect(getPlanWeek(s.date)?.week).toBe(s.week)
    }
  })

  it('has unique, stable, readable IDs', () => {
    const ids = PLANNED_SESSIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^w\d{2}-(mon|tue|wed|thu|fri|sat|sun)-[a-z]+$/)
  })

  it('follows the weekly base schedule', () => {
    expect(dayTypes(3)).toEqual([
      '1:leg',
      '2:run',
      '2:mob',
      '3:ice',
      '4:push',
      '4:run',
      '4:soc',
      '5:pull',
      '6:long',
      '7:ice',
    ])
    expect(dayTypes(12)).toEqual([
      '1:leg',
      '2:run',
      '2:mob',
      '3:ice',
      '4:push',
      '4:run',
      '5:pull',
      '6:race',
    ])
  })

  it('contains every run date from the running plan exactly', () => {
    const runDates = PLANNED_SESSIONS.filter((s) => s.run).map((s) => s.date)
    expect(runDates).toEqual(RUNNING_PLAN.map((r) => r.date))
    expect(runDates).toHaveLength(36)
    for (const entry of RUNNING_PLAN) {
      const expectedDay = { tue: 2, thu: 4, sat: 6 }[entry.slot]
      expect(dayOfWeek(entry.date), entry.date).toBe(expectedDay)
      expect(getPlanWeek(entry.date)?.week).toBe(entry.week)
    }
  })

  it('computes planned run durations from segments', () => {
    const duration = (id: string) =>
      runDurationRange(PLANNED_SESSIONS.find((s) => s.id === id)!.run!)
    expect(duration('w03-tue-run')).toEqual({ min: 39, max: 39 })
    expect(duration('w08-tue-run')).toEqual({ min: 52, max: 52 })
    expect(duration('w10-sat-long')).toEqual({ min: 100, max: 105 })
    expect(duration('w12-sat-race')).toBeNull()
  })

  it('makes Thursday run-or-soccer an either/or group only where prescribed', () => {
    const groups = [...new Set(PLANNED_SESSIONS.map((s) => s.choiceGroupId).filter(Boolean))]
    expect(groups).toEqual([
      'w01-thu-choice',
      'w02-thu-choice',
      'w03-thu-choice',
      'w05-thu-choice',
      'w06-thu-choice',
      'w09-thu-choice',
    ])
    for (const g of groups) {
      expect(getChoiceGroup(g!).map((s) => s.type)).toEqual(['run', 'soc'])
    }
    expect(byType('soc')).toHaveLength(6)
    expect(PLANNED_SESSIONS.filter((s) => s.offAllowed).map((s) => s.id)).toEqual([
      'w04-thu-run',
      'w07-thu-run',
      'w12-thu-run',
    ])
  })

  it('places PUSH before the Thursday run and MOB after the Tuesday run', () => {
    expect(getSessionsForDate('2026-10-01').map((s) => s.type)).toEqual(['push', 'run', 'soc'])
    expect(getSessionsForDate('2026-09-29').map((s) => s.type)).toEqual(['run', 'mob'])
  })

  it('alternates core A/B weekly with a light week 12', () => {
    const mob = byType('mob')
    expect(mob.map((s) => s.coreSession).join('')).toBe('ABABABABABAB')
    expect(mob.at(-1)?.lightMobility).toBe(true)
    expect(mob.filter((s) => s.twoSetsAllowed).map((s) => s.week)).toEqual([1, 2, 4, 7, 11, 12])
  })

  it('uses intro LEG volume in week 1 and adds pogo hops from week 3', () => {
    expect(byType('leg').map((s) => s.templateId)).toEqual([
      'leg-intro',
      'leg-base',
      ...Array<string>(10).fill('leg-full'),
    ])
    const ids = (id: string) =>
      WORKOUT_TEMPLATES.find((t) => t.id === id)!.exercises.map((e) => e.exerciseId)
    expect(ids('leg-intro')).not.toContain('low-pogo-hops')
    expect(ids('leg-base')).not.toContain('low-pogo-hops')
    expect(ids('leg-full')[0]).toBe('low-pogo-hops')
  })

  it('has ICE on Wednesdays and Sundays until race day', () => {
    const ice = byType('ice')
    expect(ice.every((s) => s.dayOfWeek === 3 || s.dayOfWeek === 7)).toBe(true)
    expect(ice).toHaveLength(23)
  })

  it('references only known exercises', () => {
    for (const t of WORKOUT_TEMPLATES) {
      for (const ex of t.exercises) expect(() => getExercise(ex.exerciseId)).not.toThrow()
      for (const item of [...t.warmUp, ...t.cooldown]) {
        if (item.exerciseId) expect(() => getExercise(item.exerciseId!)).not.toThrow()
      }
    }
  })

  it('returns null plan week outside the plan', () => {
    expect(getPlanWeek('2026-09-20')).toBeNull()
    expect(getPlanWeek('2026-12-13')).toBeNull()
    expect(getPlanWeek('2026-09-29')?.week).toBe(2)
  })
})
