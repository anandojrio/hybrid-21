import { useState } from 'react'
import { Field, Segmented, TextInput, Textarea } from '@/components/form-controls'
import { mobilityFormSchema } from '@/domain/schemas'
import type { CoreSession, MobilityLog } from '@/domain/types'
import { LOG_FORM_ID } from './log-form-drawer'
import type { LogFormProps } from './log-form-types'

export function MobilityLogForm({
  session,
  log,
  onSubmitLog,
  onDirtyChange,
}: LogFormProps<MobilityLog>) {
  const [coreSession, setCoreSession] = useState<CoreSession>(
    log?.coreSession ?? session.coreSession ?? 'A',
  )
  const [asPrescribed, setAsPrescribed] = useState<'yes' | 'no'>(
    log && !log.asPrescribed ? 'no' : 'yes',
  )
  const [duration, setDuration] = useState(log?.durationMin ? String(log.durationMin) : '')
  const [note, setNote] = useState(log?.note ?? '')
  const [error, setError] = useState<string | undefined>()

  const touch =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      onDirtyChange(true)
    }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = mobilityFormSchema.safeParse({
      coreSession,
      asPrescribed: asPrescribed === 'yes',
      durationMin: duration,
      note: note.trim() || undefined,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    setError(undefined)
    await onSubmitLog({
      sessionId: session.id,
      date: session.date,
      kind: 'mobility',
      status: parsed.data.asPrescribed ? 'completed' : 'modified',
      coreSession: parsed.data.coreSession,
      asPrescribed: parsed.data.asPrescribed,
      durationMin: parsed.data.durationMin,
      note: parsed.data.note,
    })
  }

  return (
    <form id={LOG_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Segmented
        label="Core session"
        value={coreSession}
        onChange={touch(setCoreSession)}
        options={[
          { value: 'A', label: 'Session A' },
          { value: 'B', label: 'Session B' },
        ]}
      />
      <Segmented
        label="Completed as prescribed"
        value={asPrescribed}
        onChange={touch(setAsPrescribed)}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
      />
      <Field label="Duration" unit="minutes · optional" error={error}>
        {({ inputId, describedBy }) => (
          <TextInput
            id={inputId}
            inputMode="numeric"
            value={duration}
            aria-describedby={describedBy}
            aria-invalid={!!error || undefined}
            onChange={(e) => touch(setDuration)(e.target.value.replace(/\D/g, ''))}
          />
        )}
      </Field>
      <Field label="Notes">
        {({ inputId }) => (
          <Textarea
            id={inputId}
            rows={3}
            maxLength={2000}
            value={note}
            onChange={(e) => touch(setNote)(e.target.value)}
          />
        )}
      </Field>
    </form>
  )
}
