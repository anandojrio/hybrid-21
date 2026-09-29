import { ChevronLeft, MessageSquareQuote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { useLogs } from '@/app/logs-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ListGroup, ListRow } from '@/components/list-group'
import { StatusMarker } from '@/components/status-marker'
import { Button } from '@/components/ui/button'
import { getIntensityGuide } from '@/data/running-plan'
import { getSession } from '@/data/training-plan'
import { resolveChoiceGroup } from '@/domain/status'
import type { PlannedSession } from '@/domain/types'
import { getChoiceGroup } from '@/data/training-plan'
import { useToday } from '@/hooks/use-today'
import { formatIsoDate } from '@/lib/dates'
import { SESSION_TYPE_META } from '@/lib/session-types'
import { LogForm } from '@/features/logging/log-form'
import { CheckInSection } from '@/features/logging/morning-check-in'
import { resultRows } from './result-summary'
import { ChoiceActions, SessionActions } from './session-actions'
import { sessionDurationRange, sessionSections } from './session-content'
import { SectionBlock } from './session-sections'
import { useSessionState } from './use-session-state'
import { typeTheme } from '@/lib/type-theme'

/** Full session details on a screen themed in the session type color. */
export default function SessionDetailScreen() {
  const { sessionId } = useParams()
  const session = sessionId ? getSession(sessionId) : undefined
  if (!session) return <Navigate to="/plan" replace />
  return <SessionDetail key={session.id} session={session} />
}

function SessionDetail({ session }: { session: PlannedSession }) {
  const navigate = useNavigate()
  const location = useLocation()
  const today = useToday()
  const { logs } = useLogs()
  const state = useSessionState(session)
  const [formSession, setFormSession] = useState<PlannedSession | null>(null)
  const meta = SESSION_TYPE_META[session.type]
  const Icon = meta.icon

  const status = session.choiceGroupId
    ? resolveChoiceGroup(getChoiceGroup(session.choiceGroupId), logs).status
    : state.status
  const planned = sessionDurationRange(session)
  const bigNumber = planned
    ? planned.range.min === planned.range.max
      ? `${planned.range.min}`
      : `${planned.range.min}–${planned.range.max}`
    : session.run?.distanceKm
      ? session.run.distanceKm.toFixed(1)
      : undefined
  const bigUnit = planned ? `min${planned.estimated ? ' (est.)' : ''}` : 'km'
  const hr = session.run
    ? (session.run.hr ?? getIntensityGuide(session.run.primaryIntensity).hr)
    : undefined
  const canGoBack = location.key !== 'default'

  useEffect(() => {
    if (location.hash === '#result') {
      document.getElementById('result')?.scrollIntoView?.({ block: 'start' })
    }
  }, [location.hash])

  return (
    <div
      className="bg-page -mx-4 -mt-[max(12px,env(safe-area-inset-top))] -mb-[calc(24px+env(safe-area-inset-bottom))] flex min-h-dvh flex-col pb-[calc(24px+env(safe-area-inset-bottom))]"
      style={typeTheme(session.type)}
    >
      <section
        aria-labelledby="session-title"
        className="flex flex-col gap-4 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-8"
        style={{ backgroundColor: meta.color, color: meta.foreground }}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            className="-ml-2 text-current hover:bg-black/10"
            onClick={() => (canGoBack ? navigate(-1) : navigate('/plan'))}
          >
            <ChevronLeft className="size-6" />
          </Button>
          <StatusMarker status={status} tone="hero" />
        </div>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <Icon aria-hidden className="size-4" strokeWidth={2.25} />
            {meta.slug}
          </span>
          <span className="tabular">
            {formatIsoDate(session.date, 'EEE, MMM d')} · Week {session.week}
          </span>
        </div>
        <h1
          id="session-title"
          className="font-display text-[34px] leading-tight font-bold tracking-tight"
        >
          {session.title}
          {session.choiceGroupId && session.type === 'run' ? (
            <span className="block text-xl font-semibold opacity-85">or football</span>
          ) : null}
        </h1>
        <p className="text-[15px] opacity-90">{session.goal}</p>
        {bigNumber || hr ? (
          <div className="flex gap-8" aria-hidden>
            {bigNumber ? (
              <div>
                <div className="font-display tabular text-5xl leading-none font-semibold">
                  {bigNumber}
                </div>
                <div className="mt-1 text-sm opacity-85">{bigUnit}</div>
              </div>
            ) : null}
            {hr ? (
              <div>
                <div className="font-display tabular text-5xl leading-none font-semibold">
                  {hr.min}
                  <span className="text-2xl">–{hr.max}</span>
                </div>
                <div className="mt-1 text-sm opacity-85">bpm</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="bg-page -mt-5 flex flex-col gap-6 rounded-t-[28px] px-4 pt-6">
        <div className="flex flex-col gap-2">
          {session.choiceGroupId ? (
            <ChoiceActions
              choiceGroupId={session.choiceGroupId}
              today={today}
              onLog={setFormSession}
            />
          ) : (
            <SessionActions
              session={session}
              today={today}
              onLog={setFormSession}
              showViewResult={false}
            />
          )}
        </div>

        {state.log && state.log.kind !== 'skip' ? (
          <div id="result" className="scroll-mt-4">
            <ListGroup
              title="Result"
              footer={
                state.log.derivedFields?.length
                  ? '≈ marks values estimated from supplied data.'
                  : state.log.note
              }
            >
              {resultRows(state.log).map((row) => (
                <ListRow
                  key={row.label}
                  title={row.label}
                  trailing={`${row.derived ? '≈ ' : ''}${row.value}`}
                />
              ))}
            </ListGroup>
            {state.log.kind !== 'simple' ? (
              <div className="mt-3">
                <DeleteResult logId={state.log.id} sessionId={session.id} />
              </div>
            ) : null}
          </div>
        ) : null}

        {state.log?.kind === 'run' ? <CheckInSection session={session} /> : null}

        {session.coachingNote ? (
          <aside
            aria-label="Coaching note"
            className="bg-theme-strong text-theme-strong-fg flex gap-3 rounded-(--radius-group) p-4"
          >
            <MessageSquareQuote aria-hidden className="mt-0.5 size-5 shrink-0" />
            <p className="text-[15px] leading-snug">
              <span className="font-bold">Coach · </span>
              {session.coachingNote}
            </p>
          </aside>
        ) : null}

        {sessionSections(session).map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </div>

      {formSession ? <LogForm session={formSession} onClose={() => setFormSession(null)} /> : null}
    </div>
  )
}

function DeleteResult({ logId, sessionId }: { logId: string; sessionId: string }) {
  const { deleteLog, deleteCheckIn, checkIns } = useLogs()
  const [error, setError] = useState<string | undefined>()
  const checkIn = checkIns.find((c) => c.sessionId === sessionId)
  return (
    <>
      <ConfirmDialog
        trigger={
          <Button variant="destructive" className="w-full">
            Delete result
          </Button>
        }
        title="Delete this result?"
        description={`The logged values${checkIn ? ' and the morning check-in' : ''} are removed. The planned session stays and goes back to planned.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          try {
            await deleteLog(logId)
            if (checkIn) await deleteCheckIn(checkIn.id)
          } catch {
            setError('Could not delete. Try again.')
          }
        }}
      />
      {error ? (
        <p role="alert" className="text-danger mt-2 text-sm font-medium">
          {error}
        </p>
      ) : null}
    </>
  )
}
