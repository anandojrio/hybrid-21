import { addDays, dayOfWeek, daysBetween, isIsoDate, startOfIsoWeek, todayIso } from './dates'

describe('date-only helpers', () => {
  it('runs tests in a DST-observing zone', () => {
    // Europe/Belgrade: CEST (UTC+2) in September, CET (UTC+1) in December.
    expect(new Date(2026, 8, 21).getTimezoneOffset()).toBe(-120)
    expect(new Date(2026, 11, 12).getTimezoneOffset()).toBe(-60)
  })

  it('validates ISO dates strictly', () => {
    expect(isIsoDate('2026-09-21')).toBe(true)
    expect(isIsoDate('2026-02-30')).toBe(false)
    expect(isIsoDate('2026-9-21')).toBe(false)
    expect(isIsoDate('2026-09-21T00:00:00Z')).toBe(false)
  })

  it('adds calendar days across the October DST change without shifting', () => {
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25')
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
    expect(addDays('2026-10-19', 7)).toBe('2026-10-26')
    expect(daysBetween('2026-09-21', '2026-12-12')).toBe(82)
  })

  it('crosses month and year boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('derives ISO weekday and week start', () => {
    expect(dayOfWeek('2026-09-21')).toBe(1)
    expect(dayOfWeek('2026-12-12')).toBe(6)
    expect(startOfIsoWeek('2026-10-25')).toBe('2026-10-19')
  })

  it('uses the local calendar date for today, even just before midnight', () => {
    expect(todayIso(new Date(2026, 9, 25, 23, 59))).toBe('2026-10-25')
    expect(todayIso(new Date(2026, 9, 26, 0, 1))).toBe('2026-10-26')
  })
})
