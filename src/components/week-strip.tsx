import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { useReduceMotion } from '@/app/motion-preference'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import type { IsoDate, SessionStatus, SessionType } from '@/domain/types'
import { formatIsoDate } from '@/lib/dates'
import { SessionTypeIcon } from './session-type-badge'
import { dayAccessibleLabel } from './week-strip-label'
import { StatusMarker } from './status-marker'

export interface WeekStripSession {
  type: SessionType
  status: SessionStatus
}

export interface WeekStripDay {
  date: IsoDate
  sessions: readonly WeekStripSession[]
  /** Day-level marker; omit when nothing is logged yet. */
  status?: Exclude<SessionStatus, 'planned'>
  isRace?: boolean
}

interface WeekStripProps {
  title: string
  days: readonly WeekStripDay[]
  selectedDate: IsoDate
  today: IsoDate
  onSelectDate: (date: IsoDate) => void
  onPrevWeek?: () => void
  onNextWeek?: () => void
  onToday?: () => void
  /** +1 when moving forward, -1 backward; drives the slide direction. */
  direction?: number
  className?: string
}

const SWIPE_DISTANCE = 60
const MAX_ICONS = 3

export function WeekStrip({
  title,
  days,
  selectedDate,
  today,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  direction = 0,
  className,
}: WeekStripProps) {
  const reduceMotion = useReduceMotion()
  const weekKey = days[0]?.date ?? 'empty'

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_DISTANCE) onNextWeek?.()
    else if (info.offset.x >= SWIPE_DISTANCE) onPrevWeek?.()
  }

  return (
    <section className={cn('flex flex-col gap-3', className)} aria-label="Week">
      <div className="flex items-center gap-1">
        <h2 className="text-ink tabular flex-1 truncate text-base font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous week"
          onClick={onPrevWeek}
          disabled={!onPrevWeek}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next week"
          onClick={onNextWeek}
          disabled={!onNextWeek}
        >
          <ChevronRight />
        </Button>
        {onToday ? (
          <Button variant="secondary" size="sm" onClick={onToday}>
            Today
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.ol
            key={weekKey}
            custom={direction}
            // Slides a full week, like scrolling; reduced motion keeps only a short fade.
            initial={reduceMotion ? { opacity: 0 } : { x: `${direction * 100}%`, opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: `${direction * -100}%`, opacity: 0.4 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            drag={onPrevWeek || onNextWeek ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            className="grid touch-pan-y grid-cols-7 gap-1.5"
          >
            {days.map((day) => (
              <DayPill
                key={day.date}
                day={day}
                selected={day.date === selectedDate}
                isToday={day.date === today}
                label={dayAccessibleLabel(day, today)}
                onSelect={() => onSelectDate(day.date)}
              />
            ))}
          </motion.ol>
        </AnimatePresence>
      </div>
    </section>
  )
}

interface DayPillProps {
  day: WeekStripDay
  selected: boolean
  isToday: boolean
  label: string
  onSelect: () => void
}

function DayPill({ day, selected, isToday, label, onSelect }: DayPillProps) {
  const shown = day.sessions.slice(0, MAX_ICONS)
  const ringColor = selected ? 'var(--ocean)' : 'var(--surface)'
  return (
    <li className="flex min-w-0 flex-col items-center gap-1.5">
      <span aria-hidden className="text-ink-muted text-xs font-semibold">
        {formatIsoDate(day.date, 'EEEEE')}
      </span>
      <button
        type="button"
        onClick={onSelect}
        aria-label={label}
        aria-pressed={selected}
        className={cn(
          'relative flex h-24 w-full min-w-11 flex-col items-center justify-between rounded-full px-0.5 pt-3 pb-2 transition-colors duration-(--dur-fast)',
          selected ? 'bg-ocean text-white' : 'bg-surface text-ink active:bg-surface-2',
          isToday && !selected && 'ring-charcoal ring-2 ring-inset',
          day.isRace && !selected && 'ring-type-race ring-2 ring-inset',
        )}
      >
        <span className="tabular text-lg leading-none font-semibold" aria-hidden>
          {formatIsoDate(day.date, 'd')}
        </span>

        <span className="flex items-center justify-center" aria-hidden>
          {day.isRace ? (
            <span
              className="inline-flex size-6 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--type-race)', color: 'var(--type-race-fg)' }}
            >
              <Flag className="size-3.5" strokeWidth={2.5} />
            </span>
          ) : (
            shown.map((session, i) => (
              <SessionTypeIcon
                key={`${session.type}-${i}`}
                type={session.type}
                size={20}
                ringColor={ringColor}
                className={i > 0 ? '-ml-1.5' : undefined}
              />
            ))
          )}
        </span>

        <span className="flex h-4 items-center" aria-hidden>
          {day.status ? <StatusMarker status={day.status} variant="dot" /> : null}
        </span>
      </button>
    </li>
  )
}
