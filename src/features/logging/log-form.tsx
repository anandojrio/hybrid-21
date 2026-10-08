import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useLogs } from '@/app/logs-store'
import type { SessionLogInput } from '@/db'
import { getChoiceGroup } from '@/data/training-plan'
import { canCompleteSession } from '@/domain/status'
import type { GymLog, MobilityLog, PlannedSession, RunLog } from '@/domain/types'
import { formatIsoDate } from '@/lib/dates'
import { SwitchRow } from '@/components/form-controls'
import { GymLogForm } from './gym-log-form'
import { LOG_FORM_ID, LogFormDrawer } from './log-form-drawer'
import { MobilityLogForm } from './mobility-log-form'
import { RunLogForm } from './run-log-form'

interface LogFormProps {
  session: PlannedSession
  onClose: () => void
}

/**
 * Opens the right form for the session type. The status changes only after a successful
 * save; editing replaces the session's single log and keeps its createdAt.
 */
export function LogForm({ session, onClose }: LogFormProps) {
  const { logs, saveLog } = useLogs()
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const existing = logs.find((l) => l.sessionId === session.id)
  const editing = existing && existing.kind !== 'skip' && existing.kind !== 'simple'

  const onDirtyChange = useCallback((value: boolean) => setDirty(value), [])

  // Midweek either/or: the run form can record football instead (never both).
  const football =
    session.choiceGroupId && !editing
      ? getChoiceGroup(session.choiceGroupId).find((s) => s.type === 'soc')
      : undefined
  const [playedFootball, setPlayedFootball] = useState(false)

  const onSubmitLog = async (input: SessionLogInput) => {
    const target = input.sessionId === session.id ? session : (football ?? session)
    const group = target.choiceGroupId ? getChoiceGroup(target.choiceGroupId) : []
    const permission = canCompleteSession(target, logs, group)
    if (!permission.allowed) {
      setError(permission.reason)
      return
    }
    setSaving(true)
    setError(undefined)
    try {
      await saveLog(input)
      toast.success(
        input.kind === 'simple' ? 'Football logged' : editing ? 'Result updated' : 'Result saved',
      )
      onClose()
    } catch {
      setError('Could not save to this device. Your entries are still here; try again.')
    } finally {
      setSaving(false)
    }
  }

  const common = { session, onSubmitLog, onDirtyChange }
  let form
  if (session.run) {
    form = (
      <RunLogForm {...common} log={existing?.kind === 'run' ? (existing as RunLog) : undefined} />
    )
  } else if (session.type === 'mob') {
    form = (
      <MobilityLogForm
        {...common}
        log={existing?.kind === 'mobility' ? (existing as MobilityLog) : undefined}
      />
    )
  } else if (session.templateId) {
    form = (
      <GymLogForm {...common} log={existing?.kind === 'gym' ? (existing as GymLog) : undefined} />
    )
  } else {
    return null
  }

  return (
    <LogFormDrawer
      open
      type={session.type}
      title={`${editing ? 'Edit' : 'Log'} ${session.title}`}
      description={`${formatIsoDate(session.date, 'EEE, MMM d')} · Week ${session.week}`}
      dirty={dirty}
      saving={saving}
      onClose={onClose}
    >
      {football ? (
        <div className="mb-6">
          <SwitchRow
            label="Replaced with football"
            description="Football replaces this run; there is nothing else to enter."
            checked={playedFootball}
            onChange={(checked) => {
              setPlayedFootball(checked)
              setDirty(checked)
            }}
          />
        </div>
      ) : null}
      {playedFootball && football ? (
        <form
          id={LOG_FORM_ID}
          onSubmit={(e) => {
            e.preventDefault()
            void onSubmitLog({
              sessionId: football.id,
              date: football.date,
              kind: 'simple',
              status: 'completed',
            })
          }}
        />
      ) : (
        form
      )}
      {error ? (
        <p role="alert" className="text-danger mt-4 text-sm font-medium">
          {error}
        </p>
      ) : null}
    </LogFormDrawer>
  )
}
