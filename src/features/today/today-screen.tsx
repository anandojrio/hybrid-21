import { HardDriveDownload } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ListGroup, ListRow } from '@/components/list-group'
import { HeroChip, ScreenHeader } from '@/components/screen-header'
import { SessionTypeBadge } from '@/components/session-type-badge'
import {
  getPlanWeek,
  getSessionsForDate,
  getVisibleSessionsForDate,
  PLAN_START,
  RACE_DATE,
} from '@/data/training-plan'
import type { PlannedSession } from '@/domain/types'
import { useBackupStatus } from '@/hooks/use-backup-status'
import { useToday } from '@/hooks/use-today'
import { addDays, compareIsoDates, daysBetween, formatIsoDate } from '@/lib/dates'
import { LogForm } from '@/features/logging/log-form'
import { MorningCheckInPrompt } from '@/features/logging/morning-check-in'
import { DayCards } from '@/features/sessions/session-card'
import { sessionDurationLabel } from '@/features/sessions/session-content'

export default function TodayScreen() {
  const today = useToday()
  const navigate = useNavigate()
  const week = getPlanWeek(today)
  const sessions = getSessionsForDate(today)
  const tomorrow = addDays(today, 1)
  const tomorrowSessions = getVisibleSessionsForDate(tomorrow)
  const { reminderDue } = useBackupStatus()
  const [formSession, setFormSession] = useState<PlannedSession | null>(null)

  const beforePlan = compareIsoDates(today, PLAN_START) < 0
  const afterPlan = compareIsoDates(today, RACE_DATE) > 0
  const daysToRace = daysBetween(today, RACE_DATE)

  return (
    <>
      <ScreenHeader
        title="Today"
        subtitle={`${formatIsoDate(today, 'EEEE, MMMM d')}${week ? ` · Week ${week.week}` : ''}`}
      >
        {week ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-cool-white/85 min-w-0 flex-1 text-[15px]">
              <span className="text-cool-white font-semibold">Focus:</span> {week.focus}
            </p>
            {daysToRace > 0 ? <HeroChip>{daysToRace} days to race</HeroChip> : null}
          </div>
        ) : null}
      </ScreenHeader>

      <MorningCheckInPrompt today={today} />

      {reminderDue ? (
        <ListGroup>
          <ListRow
            leading={<HardDriveDownload aria-hidden className="text-theme-ink size-5" />}
            title="Back up your logs"
            subtitle="No backup in the last 7 days"
            onClick={() => navigate('/settings')}
          />
        </ListGroup>
      ) : null}

      {beforePlan ? (
        <ListGroup>
          <ListRow title="The plan starts Monday, September 21" />
        </ListGroup>
      ) : afterPlan ? (
        <ListGroup>
          <ListRow title="The plan is complete" subtitle="Race day was Saturday, December 12." />
        </ListGroup>
      ) : sessions.length === 0 ? (
        <ListGroup>
          <ListRow title="Rest day" subtitle="No planned sessions today." />
        </ListGroup>
      ) : (
        <DayCards sessions={sessions} today={today} onLog={setFormSession} />
      )}

      {tomorrowSessions.length ? (
        <ListGroup title={`Tomorrow · ${formatIsoDate(tomorrow, 'EEE, MMM d')}`}>
          {tomorrowSessions.map((session) => (
            <ListRow
              key={session.id}
              leading={<SessionTypeBadge type={session.type} size="sm" />}
              title={session.title}
              subtitle={
                session.choiceGroupId
                  ? `${sessionDurationLabel(session) ?? ''} · or football`
                  : sessionDurationLabel(session)
              }
              onClick={() => navigate(`/session/${session.id}`)}
            />
          ))}
        </ListGroup>
      ) : null}

      {formSession ? <LogForm session={formSession} onClose={() => setFormSession(null)} /> : null}
    </>
  )
}
