import { CalendarClock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { getChoiceGroup } from '@/data/training-plan'
import type { IsoDate, PlannedSession } from '@/domain/types'
import { compareIsoDates, formatIsoDate } from '@/lib/dates'
import { keyResult } from './result-summary'
import { isOneTap } from './session-content'
import { SkipPopover } from './skip-popover'
import { useSessionMutations } from './use-session-mutations'
import { useSessionState } from './use-session-state'

interface SessionActionsProps {
  session: PlannedSession
  today: IsoDate
  /** Opens the logging form (run, gym, mobility). */
  onLog: (session: PlannedSession) => void
  /** Hide "View result" when already on the detail screen. */
  showViewResult?: boolean
}

export function FutureNotice({ date }: { date: IsoDate }) {
  return (
    <p className="text-ink-muted flex items-center gap-2 text-sm font-medium">
      <CalendarClock aria-hidden className="size-4" />
      Planned for {formatIsoDate(date, 'EEE, MMM d')}
    </p>
  )
}

export function SessionActions({
  session,
  today,
  onLog,
  showViewResult = true,
}: SessionActionsProps) {
  const state = useSessionState(session)
  const { completeSimple, skip, removeLog } = useSessionMutations()
  const [error, setError] = useState<string | undefined>()

  const run = async (action: () => Promise<unknown>) => {
    setError(undefined)
    try {
      await action()
    } catch {
      setError('Could not save to this device. Try again.')
    }
  }

  if (compareIsoDates(session.date, today) > 0) return <FutureNotice date={session.date} />

  if (state.replacedBy) {
    return (
      <p className="text-ink-muted text-sm font-medium">
        Replaced by {state.replacedByTitle?.toLowerCase()} today.
      </p>
    )
  }

  const log = state.log
  let body
  if (!log) {
    body = (
      <>
        <Button
          className="w-full"
          onClick={() =>
            void run(async () => (isOneTap(session) ? completeSimple(session) : onLog(session)))
          }
        >
          Mark as complete
        </Button>
        <SkipPopover onSkip={(reason, note) => run(() => skip(session, reason, note))} />
      </>
    )
  } else if (log.kind === 'skip') {
    body = (
      <>
        <p className="text-ink-muted text-sm">
          {keyResult(log)}
          {log.note ? ` · ${log.note}` : ''}
        </p>
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="w-full">
              Undo skip
            </Button>
          }
          title="Undo skip?"
          description="The session goes back to planned. The planned session itself is never deleted."
          confirmLabel="Undo skip"
          onConfirm={() => run(() => removeLog(log.id))}
        />
      </>
    )
  } else if (log.kind === 'simple') {
    body = (
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="w-full">
            Remove completion
          </Button>
        }
        title="Remove completion?"
        description="The session goes back to planned."
        confirmLabel="Remove"
        onConfirm={() => run(() => removeLog(log.id))}
      />
    )
  } else {
    body = (
      <div className="grid grid-cols-2 gap-2">
        {showViewResult ? (
          <Button variant="inverse" asChild>
            <Link to={`/session/${session.id}#result`}>View result</Link>
          </Button>
        ) : null}
        <Button
          variant="mint"
          className={showViewResult ? undefined : 'col-span-2'}
          onClick={() => onLog(session)}
        >
          Edit result
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {body}
      {error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Midweek either/or: "Mark as complete" opens the run form, which can record football
 * instead. Skipping records the skip on the run and covers the whole group.
 */
export function ChoiceActions({
  choiceGroupId,
  today,
  onLog,
}: {
  choiceGroupId: string
  today: IsoDate
  onLog: (session: PlannedSession) => void
}) {
  const group = getChoiceGroup(choiceGroupId)
  const run = group.find((s) => s.type === 'run') as PlannedSession
  const football = group.find((s) => s.type === 'soc') as PlannedSession
  const footballState = useSessionState(football)
  const { removeLog } = useSessionMutations()
  const [error, setError] = useState<string | undefined>()

  if (compareIsoDates(run.date, today) > 0) return <FutureNotice date={run.date} />

  const footballLog = footballState.log
  if (!footballLog) return <SessionActions session={run} today={today} onLog={onLog} />

  return (
    <div className="flex flex-col gap-2">
      <p className="text-ink-muted text-sm font-medium">Replaced with football.</p>
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="w-full">
            Remove football
          </Button>
        }
        title="Remove football?"
        description="The run goes back to planned."
        confirmLabel="Remove"
        onConfirm={async () => {
          setError(undefined)
          try {
            await removeLog(footballLog.id)
          } catch {
            setError('Could not save to this device. Try again.')
          }
        }}
      />
      {error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}
