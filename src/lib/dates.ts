import { addDays as addDaysFns, differenceInCalendarDays, format, getISODay, parse } from 'date-fns'
import type { DayOfWeek, IsoDate } from '../domain/types'

const ISO_DATE = 'yyyy-MM-dd'
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Date-only helpers. All values are local calendar dates; nothing goes through UTC,
 * so a session can never shift by a day across time zones or DST changes.
 */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false
  const parsed = parse(value, ISO_DATE, new Date(2000, 0, 1))
  return !Number.isNaN(parsed.getTime()) && format(parsed, ISO_DATE) === value
}

export function toLocalDate(iso: IsoDate): Date {
  if (!isIsoDate(iso)) throw new Error(`Invalid ISO date: ${iso}`)
  return parse(iso, ISO_DATE, new Date(2000, 0, 1))
}

export function toIsoDate(date: Date): IsoDate {
  return format(date, ISO_DATE)
}

export function todayIso(now: Date = new Date()): IsoDate {
  return toIsoDate(now)
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return toIsoDate(addDaysFns(toLocalDate(iso), days))
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return differenceInCalendarDays(toLocalDate(to), toLocalDate(from))
}

export function dayOfWeek(iso: IsoDate): DayOfWeek {
  return getISODay(toLocalDate(iso)) as DayOfWeek
}

/** Monday of the week containing `iso`. */
export function startOfIsoWeek(iso: IsoDate): IsoDate {
  return addDays(iso, 1 - dayOfWeek(iso))
}

export function compareIsoDates(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function formatIsoDate(iso: IsoDate, pattern: string): string {
  return format(toLocalDate(iso), pattern)
}
