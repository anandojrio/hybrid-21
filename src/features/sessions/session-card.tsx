import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { SessionTypeBadge } from '@/components/session-type-badge'
import { StatusMarker } from '@/components/status-marker'
import { getChoiceGroup } from '@/data/training-plan'
import { useLogs } from '@/app/logs-store'
import { resolveChoiceGroup } from '@/domain/status'
import type { IsoDate, PlannedSession, SessionStatus } from '@/domain/types'
import { ChoiceActions, SessionActions } from './session-actions'
import { sessionDurationLabel, sessionSections } from './session-content'
import { SessionSectionsAccordion } from './session-sections'
import { useSessionState } from './use-session-state'
import { SESSION_TYPE_META } from '@/lib/session-types'
import { typeTheme } from '@/lib/type-theme'

interface CardProps {
  today: IsoDate
  onLog: (session: PlannedSession) => void
}

function CardShell({
  children,
  label,
  session,
}: {
  children: React.ReactNode
  label: string
  session: PlannedSession
}) {
  const meta = SESSION_TYPE_META[session.type]
  return (
    <article
      aria-label={label}
      style={typeTheme(session.type)}
      className="bg-surface flex flex-col gap-4 overflow-hidden rounded-(--radius-group) p-4 pt-0"
    >
      <div aria-hidden className="-mx-4 h-1.5" style={{ backgroundColor: meta.color }} />
      {children}
    </article>
  )
}

function CardHeader({
  session,
  subtitle,
  status,
}: {
  session: PlannedSession
  subtitle?: string
  status?: SessionStatus
}) {
  const state = useSessionState(session)
  const duration = sessionDurationLabel(session)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <SessionTypeBadge type={session.type} />
        <StatusMarker status={status ?? state.status} />
      </div>
      <Link
        to={`/session/${session.id}`}
        className="group flex items-start justify-between gap-2 rounded-xl"
      >
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-2xl leading-tight font-bold tracking-tight">
            {session.title}
          </span>
          {subtitle ? (
            <span className="text-theme-ink text-base font-semibold">{subtitle}</span>
          ) : null}
          <span className="text-ink-muted text-sm">
            {[duration, session.goal].filter(Boolean).join(' · ')}
          </span>
        </span>
        <ChevronRight aria-hidden className="text-ink-muted mt-1 size-5 shrink-0" />
      </Link>
    </div>
  )
}

/** Today card: header, collapsible content, coaching note and actions. */
export function SessionCard({ session, today, onLog }: CardProps & { session: PlannedSession }) {
  return (
    <CardShell session={session} label={`${SESSION_TYPE_META[session.type].slug} ${session.title}`}>
      <CardHeader session={session} />
      <SessionSectionsAccordion sections={sessionSections(session)} />
      {session.coachingNote ? (
        <p className="bg-surface-2 text-ink rounded-2xl px-3 py-2 text-sm">
          <span className="font-semibold">Coach: </span>
          {session.coachingNote}
        </p>
      ) : null}
      <SessionActions session={session} today={today} onLog={onLog} />
    </CardShell>
  )
}

/**
 * Thursday either/or: shown as the run, with football as an option inside its form.
 * The group status covers both, so football counts as the Thursday session.
 */
export function ChoiceCard({ choiceGroupId, today, onLog }: CardProps & { choiceGroupId: string }) {
  const group = getChoiceGroup(choiceGroupId)
  const run = group.find((s) => s.type === 'run') as PlannedSession
  const { logs } = useLogs()
  const groupStatus = resolveChoiceGroup(group, logs).status
  return (
    <CardShell session={run} label={`RUN ${run.title} or football`}>
      <CardHeader session={run} subtitle="or football" status={groupStatus} />
      <SessionSectionsAccordion sections={sessionSections(run)} />
      <ChoiceActions choiceGroupId={choiceGroupId} today={today} onLog={onLog} />
    </CardShell>
  )
}

/** Groups the sessions of a day into cards, merging either/or pairs. */
export function DayCards({
  sessions,
  today,
  onLog,
}: CardProps & { sessions: readonly PlannedSession[] }) {
  const seen = new Set<string>()
  return (
    <>
      {sessions.map((session) => {
        if (session.choiceGroupId) {
          if (seen.has(session.choiceGroupId)) return null
          seen.add(session.choiceGroupId)
          return (
            <ChoiceCard
              key={session.choiceGroupId}
              choiceGroupId={session.choiceGroupId}
              today={today}
              onLog={onLog}
            />
          )
        }
        return <SessionCard key={session.id} session={session} today={today} onLog={onLog} />
      })}
    </>
  )
}
