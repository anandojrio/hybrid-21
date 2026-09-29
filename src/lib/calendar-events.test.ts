import { PLANNED_SESSIONS } from '../data/training-plan'
import { deriveCalendarEvents } from './calendar-events'

describe('calendar event derivation', () => {
  const all = deriveCalendarEvents(PLANNED_SESSIONS)
  const byKey = (key: string) => all.find((e) => e.key === key)!

  it('creates one all-day event per session, merging either/or pairs', () => {
    const socCount = PLANNED_SESSIONS.filter((s) => s.type === 'soc').length
    expect(all).toHaveLength(PLANNED_SESSIONS.length - socCount)
    expect(new Set(all.map((e) => e.key)).size).toBe(all.length)
  })

  it('ends each event on the following date, across DST and month ends', () => {
    const byDate = (d: string) => all.find((e) => e.date === d)!
    expect(byDate('2026-10-25').endDate).toBe('2026-10-26')
    expect(byDate('2026-10-31').endDate).toBe('2026-11-01')
    for (const e of all) expect(e.endDate > e.date).toBe(true)
  })

  it('uses stable keys and the expected titles', () => {
    expect(byKey('w02-tue-run').summary).toBe('RUN · Easy 35 min')
    expect(byKey('w02-tue-mob').summary).toBe('MOB · Mobility + Core B')
    expect(byKey('w03-mon-leg').summary).toBe('LEG · Leg Strength')
    expect(byKey('w03-thu-push').summary).toBe('PUSH · Upper Body')
    expect(byKey('w03-fri-pull').summary).toBe('PULL · Upper Body')
    expect(byKey('w03-wed-ice').summary).toBe('ICE · Ice Hockey')
    expect(byKey('w02-thu-choice').summary).toBe('RUN/SOC · Recovery/Easy 25–30 min or Soccer')
    expect(byKey('w02-thu-choice').sessionIds).toEqual(['w02-thu-run', 'w02-thu-soc'])
    expect(byKey('w12-sat-race').summary).toBe('RACE · Half Marathon')
    expect(byKey('w12-sat-race').description).toContain('21.1 km')
    expect(byKey('w03-tue-run').description).toContain('Hybrid 21 · w03-tue-run')
  })

  it('skips past days when a start date is given', () => {
    const upcoming = deriveCalendarEvents(PLANNED_SESSIONS, { from: '2026-09-29' })
    expect(upcoming[0]).toMatchObject({ key: 'w02-tue-run', date: '2026-09-29' })
    expect(upcoming.every((e) => e.date >= '2026-09-29')).toBe(true)
    expect(upcoming).toHaveLength(97)
  })
})
