/**
 * Dumps the Google Calendar event list derived from the canonical plan.
 * Claude reads the output and writes the events through the Google Calendar connector.
 *
 *   npm run calendar:events -- --from 2026-09-29
 */
import { writeFileSync } from 'node:fs'
import { PLANNED_SESSIONS } from '../src/data/training-plan'
import { deriveCalendarEvents } from '../src/lib/calendar-events'
import { isIsoDate, todayIso } from '../src/lib/dates'

/** Google Calendar event colorIds, closest match to each session type color. */
const GOOGLE_COLOR_ID: Record<string, string> = {
  leg: '6', // Tangerine
  run: '9', // Blueberry
  long: '1', // Lavender
  race: '11', // Tomato
  ice: '7', // Peacock
  push: '4', // Flamingo
  pull: '3', // Grape
  mob: '2', // Sage
  soc: '5', // Banana
  'run/soc': '9',
}

const fromArg = process.argv.indexOf('--from')
const from = fromArg > -1 ? process.argv[fromArg + 1] : todayIso()
if (!from || !isIsoDate(from)) throw new Error(`Invalid --from date: ${from}`)

const events = deriveCalendarEvents(PLANNED_SESSIONS, { from }).map((e) => ({
  ...e,
  colorId: GOOGLE_COLOR_ID[e.slug] ?? '8',
}))

const out = 'calendar/events-plan.json'
writeFileSync(out, JSON.stringify({ from, count: events.length, events }, null, 2) + '\n')
console.log(`${events.length} events from ${from} → ${out}`)
