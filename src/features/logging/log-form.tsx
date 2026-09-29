import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useLogs } from '@/app/logs-store'
import type { SessionLogInput } from '@/db'
import { getChoiceGroup } from '@/data/training-plan'
import { canCompleteSession } from '@/domain/status'
import type { GymLog, MobilityLog, PlannedSession, RunLog } from '@/domain/types'
import { formatIsoDate } from '@/lib/dates'
import { GymLogForm } from './gym-log-form'
import { LogFormDrawer } from './log-form-drawer'
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

  const onSubmitLog = async (input: SessionLogInput) => {
    const group = session.choiceGroupId ? getChoiceGroup(session.choiceGroupId) : []
    const permission = canCompleteSession(session, logs, group)
    if (!permission.allowed) {
      setError(permission.reason)
      return
    }
    setSaving(true)
    setError(undefined)
    try {
      await saveLog(input)
      toast.success(editing ? 'Result updated' : 'Result saved')
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
      title={`${editing ? 'Edit' : 'Log'} ${session.title}`}
      description={`${session.type.toUpperCase()} · ${formatIsoDate(session.date, 'EEE, MMM d')} · Week ${session.week}`}
      dirty={dirty}
      saving={saving}
      onClose={onClose}
    >
      {form}
      {error ? (
        <p role="alert" className="text-danger mt-4 text-sm font-medium">
          {error}
        </p>
      ) : null}
    </LogFormDrawer>
  )
}
