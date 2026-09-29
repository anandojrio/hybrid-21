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
 * Thursday either/or: one card, "Log run" or one-tap "Played soccer".
 * Skipping records the skip on the run and covers the whole group.
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
  const [run, soc] = getChoiceGroup(choiceGroupId) as [PlannedSession, PlannedSession]
  const runState = useSessionState(run)
  const socState = useSessionState(soc)
  const { completeSimple, skip } = useSessionMutations()
  const [error, setError] = useState<string | undefined>()

  if (compareIsoDates(run.date, today) > 0) return <FutureNotice date={run.date} />
  if (runState.log || socState.log) {
    return (
      <div className="flex flex-col gap-3">
        <SessionActions session={run} today={today} onLog={onLog} />
        <SessionActions session={soc} today={today} onLog={onLog} />
      </div>
    )
  }

  const attempt = async (action: () => Promise<unknown>) => {
    setError(undefined)
    try {
      await action()
    } catch {
      setError('Could not save to this device. Try again.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onLog(run)}>Log run</Button>
        <Button variant="mint" onClick={() => void attempt(() => completeSimple(soc))}>
          Played soccer
        </Button>
      </div>
      <SkipPopover onSkip={(reason, note) => attempt(() => skip(run, reason, note))} />
      {error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}
