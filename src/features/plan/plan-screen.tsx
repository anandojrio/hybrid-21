import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useLogs } from '@/app/logs-store'
import { ListGroup, ListRow } from '@/components/list-group'
import { ScreenHeader } from '@/components/screen-header'
import { SessionTypeBadge } from '@/components/session-type-badge'
import { StatusMarker } from '@/components/status-marker'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { WeekStrip, type WeekStripDay } from '@/components/week-strip'
import {
  getPlanWeek,
  getSessionsForDate,
  PLAN_END,
  PLAN_START,
  RACE_DATE,
} from '@/data/training-plan'
import { INTENSITY_GUIDE, INTENSITY_NOTICE } from '@/data/running-plan'
import { formatPaceRange } from '@/domain/calculations'
import type { IsoDate } from '@/domain/types'
import { useToday } from '@/hooks/use-today'
import { addDays, compareIsoDates, formatIsoDate, isIsoDate, startOfIsoWeek } from '@/lib/dates'
import { sessionDurationLabel } from '@/features/sessions/session-content'
import { dayStatus, sessionStateFor } from '@/features/sessions/use-session-state'

const FIRST_WEEK = startOfIsoWeek(PLAN_START)
const LAST_WEEK = startOfIsoWeek(PLAN_END)

const clampToPlan = (date: IsoDate) =>
  compareIsoDates(date, PLAN_START) < 0
    ? PLAN_START
    : compareIsoDates(date, PLAN_END) > 0
      ? PLAN_END
      : date

export default function PlanScreen() {
  const today = useToday()
  const navigate = useNavigate()
  const { logs } = useLogs()
  const [params, setParams] = useSearchParams()
  const [direction, setDirection] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const dayParam = params.get('day')
  const selectedDate = dayParam && isIsoDate(dayParam) ? clampToPlan(dayParam) : clampToPlan(today)
  const weekStart = startOfIsoWeek(selectedDate)

  const days: WeekStripDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    const sessions = getSessionsForDate(date)
    return {
      date,
      isRace: date === RACE_DATE,
      status: dayStatus(sessions, logs),
      sessions: sessions.map((s) => ({
        type: s.type,
        status: sessionStateFor(s, logs).status,
      })),
    }
  })

  const selectDay = (date: IsoDate, replace = true) => setParams({ day: date }, { replace })
  const moveWeek = (delta: number) => {
    const next = addDays(weekStart, delta * 7)
    if (compareIsoDates(next, FIRST_WEEK) < 0 || compareIsoDates(next, LAST_WEEK) > 0) return
    setDirection(delta)
    selectDay(clampToPlan(addDays(selectedDate, delta * 7)))
  }

  const week = getPlanWeek(weekStart) ?? getPlanWeek(selectedDate)
  const title = `${week ? `Week ${week.week} · ` : ''}${formatIsoDate(weekStart, 'MMM d')} – ${formatIsoDate(addDays(weekStart, 6), 'MMM d')}`
  const selectedSessions = getSessionsForDate(selectedDate)

  return (
    <>
      <ScreenHeader title="Plan" subtitle="Sep 21 – Dec 12 · race Sat, Dec 12" />

      <WeekStrip
        title={title}
        days={days}
        selectedDate={selectedDate}
        today={today}
        direction={direction}
        onSelectDate={(date) => {
          selectDay(date)
          setDrawerOpen(true)
        }}
        onPrevWeek={compareIsoDates(weekStart, FIRST_WEEK) > 0 ? () => moveWeek(-1) : undefined}
        onNextWeek={compareIsoDates(weekStart, LAST_WEEK) < 0 ? () => moveWeek(1) : undefined}
        onToday={() => {
          const target = clampToPlan(today)
          setDirection(Math.sign(compareIsoDates(startOfIsoWeek(target), weekStart)))
          selectDay(target)
        }}
      />

      {week ? (
        <ListGroup title="This week">
          <ListRow
            title={week.focus}
            subtitle={
              week.cutback ? 'Cutback week' : week.taper ? 'Taper' : `Week ${week.week} of 12`
            }
          />
        </ListGroup>
      ) : null}

      <ListGroup title="Intensity guide" footer={INTENSITY_NOTICE}>
        {INTENSITY_GUIDE.map((g) => (
          <ListRow
            key={g.intensity}
            title={g.label}
            subtitle={`${g.hr.min}–${g.hr.max} bpm · RPE ${g.rpe.min === g.rpe.max ? g.rpe.min : `${g.rpe.min}–${g.rpe.max}`} · ${g.talkTest}`}
            trailing={formatPaceRange(g.paceSecPerKm)}
          />
        ))}
      </ListGroup>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-page mx-auto max-w-(--app-max-width)">
          <DrawerHeader>
            <DrawerTitle className="font-display text-2xl">
              {formatIsoDate(selectedDate, 'EEEE, MMMM d')}
            </DrawerTitle>
            <DrawerDescription>
              {selectedDate === RACE_DATE ? 'Race day · ' : ''}
              {title}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))]">
            <ListGroup>
              {selectedSessions.length === 0 ? (
                <ListRow title="Rest day" subtitle="No planned sessions" />
              ) : (
                selectedSessions.map((session) => {
                  const state = sessionStateFor(session, logs)
                  return (
                    <ListRow
                      key={session.id}
                      leading={<SessionTypeBadge type={session.type} size="sm" />}
                      title={session.title}
                      subtitle={
                        state.replacedBy
                          ? 'Replaced by its alternative'
                          : session.choiceGroupId
                            ? 'Either/or: do one, never both'
                            : sessionDurationLabel(session)
                      }
                      trailing={<StatusMarker status={state.status} variant="dot" />}
                      onClick={() => {
                        setDrawerOpen(false)
                        navigate(`/session/${session.id}`)
                      }}
                    />
                  )
                })
              )}
            </ListGroup>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
