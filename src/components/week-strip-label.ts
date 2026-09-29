import type { IsoDate } from '@/domain/types'
import { formatIsoDate } from '@/lib/dates'
import { SESSION_TYPE_META, STATUS_LABEL } from '@/lib/session-types'
import type { WeekStripDay } from './week-strip'

export function dayAccessibleLabel(day: WeekStripDay, today: IsoDate): string {
  const parts = [formatIsoDate(day.date, 'EEEE, MMMM d')]
  if (day.date === today) parts.push('today')
  if (day.isRace) parts.push('race day')
  if (day.sessions.length === 0) parts.push('rest day')
  else {
    parts.push(
      day.sessions
        .map((s) => `${SESSION_TYPE_META[s.type].slug} ${STATUS_LABEL[s.status].toLowerCase()}`)
        .join(', '),
    )
  }
  return parts.join(': ')
}
