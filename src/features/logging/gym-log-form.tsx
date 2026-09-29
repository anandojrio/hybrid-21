import { useEffect, useState } from 'react'
import { cn } from 'cn'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/animate-ui/components/radix/popover'
import { Field, NumberStepper, SwitchRow, Textarea } from '@/components/form-controls'
import { Button } from '@/components/ui/button'
import { useRepositories } from '@/app/storage-provider'
import type { PreviousExerciseResult } from '@/db'
import { getExercise } from '@/data/exercises'
import { getTemplate } from '@/data/workout-templates'
import type { GymLog } from '@/domain/types'
import { formatIsoDate } from '@/lib/dates'
import {
  AMOUNT_LABEL,
  buildDrafts,
  draftSummary,
  hasLoad,
  lastTimeText,
  parseDraft,
  type DraftValues,
  type ExerciseDraft,
} from './gym-drafts'
import { LOG_FORM_ID } from './log-form-drawer'
import type { LogFormProps } from './log-form-types'

export function GymLogForm({ session, log, onSubmitLog, onDirtyChange }: LogFormProps<GymLog>) {
  const repositories = useRepositories()
  const template = getTemplate(session.templateId!)
  const [drafts, setDrafts] = useState<ExerciseDraft[] | null>(null)
  const [note, setNote] = useState(log?.note ?? '')
  const [modified, setModified] = useState<boolean | undefined>(
    log ? log.status === 'modified' : undefined,
  )
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    Promise.all(
      template.exercises.map(async (e) => {
        const prev = await repositories.sessionLogs.latestExerciseResult(e.exerciseId, {
          excludeSessionId: session.id,
        })
        return [e.exerciseId, prev] as const
      }),
    ).then((entries) => {
      if (cancelled) return
      const previous = new Map(
        entries.filter((e): e is readonly [string, PreviousExerciseResult] => !!e[1]),
      )
      setDrafts(buildDrafts(template.exercises, previous, log))
    })
    return () => {
      cancelled = true
    }
  }, [repositories, template, session.id, log])

  const update = (exerciseId: string, patch: Partial<ExerciseDraft>) => {
    setDrafts(
      (current) =>
        current?.map((d) => (d.exerciseId === exerciseId ? { ...d, ...patch } : d)) ?? null,
    )
    onDirtyChange(true)
  }

  if (!drafts) return <p className="text-ink-muted">Loading previous results…</p>

  const missingRequired = drafts.some((d) => !d.optional && !d.included)
  const effectiveModified = modified ?? missingRequired

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(undefined)
    const included = drafts.filter((d) => d.included)
    if (included.length === 0) {
      setError('Enter at least one exercise, or use Skip workout instead.')
      return
    }
    const results = []
    for (const draft of included) {
      const parsed = parseDraft(draft)
      if (!parsed.ok) {
        setError(`${getExercise(draft.exerciseId).name}: ${parsed.error}`)
        return
      }
      results.push(parsed.result)
    }
    await onSubmitLog({
      sessionId: session.id,
      date: session.date,
      kind: 'gym',
      status: effectiveModified ? 'modified' : 'completed',
      exercises: results,
      note: note.trim() || undefined,
    })
  }

  return (
    <form id={LOG_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-6">
      <p className="text-ink-muted text-sm">
        Working sets only; warm-up sets are never logged. Exercises start with your last result. Tap
        one to change it.
      </p>
      <ul className="divide-separator/80 bg-surface divide-y overflow-hidden rounded-(--radius-group)">
        {drafts.map((draft) => (
          <li key={draft.exerciseId}>
            <ExerciseRow draft={draft} onChange={(patch) => update(draft.exerciseId, patch)} />
          </li>
        ))}
      </ul>

      <Field label="Notes">
        {({ inputId }) => (
          <Textarea
            id={inputId}
            rows={3}
            maxLength={2000}
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              onDirtyChange(true)
            }}
          />
        )}
      </Field>

      <SwitchRow
        label="Performed differently"
        description={
          missingRequired && modified === undefined
            ? 'On because some planned exercises are not entered.'
            : 'Marks the session as modified instead of completed.'
        }
        checked={effectiveModified}
        onChange={(checked) => {
          setModified(checked)
          onDirtyChange(true)
        }}
      />

      {error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function ExerciseRow({
  draft,
  onChange,
}: {
  draft: ExerciseDraft
  onChange: (patch: Partial<ExerciseDraft>) => void
}) {
  const exercise = getExercise(draft.exerciseId)
  const [values, setValues] = useState<DraftValues>(draft.values)
  const [error, setError] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const amount = AMOUNT_LABEL[draft.kind]
  const set = (key: keyof DraftValues) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }))

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setValues(draft.values)
          setError(undefined)
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${exercise.name}: ${draftSummary(draft)}`}
          className="active:bg-surface-2 flex min-h-16 w-full flex-col items-start gap-0.5 px-4 py-3 text-left"
        >
          <span className="flex w-full items-baseline justify-between gap-2">
            <span className="text-ink text-base font-medium">
              {exercise.name}
              {draft.optional ? <span className="text-ink-muted text-sm"> · optional</span> : null}
            </span>
          </span>
          <span className="text-ink-muted text-sm">{draft.prescription}</span>
          <span
            className={cn(
              'tabular text-sm font-semibold',
              draft.included ? 'text-theme-ink' : 'text-ink-muted',
            )}
          >
            {draftSummary(draft)}
          </span>
          <span className="text-ink-muted text-xs">
            {lastTimeText(draft.previous)}
            {draft.previous ? ` · ${formatIsoDate(draft.previous.date, 'MMM d')}` : ''}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="flex flex-col gap-3">
        <div>
          <p className="text-base font-semibold">{exercise.name}</p>
          <p className="text-ink-muted text-sm">{draft.prescription}</p>
          <p className="text-ink text-sm font-medium">{lastTimeText(draft.previous)}</p>
        </div>
        <Field label="Sets completed">
          {({ inputId }) => (
            <NumberStepper id={inputId} value={values.sets} onValueChange={set('sets')} max={20} />
          )}
        </Field>
        <Field label={amount.label} unit={amount.unit}>
          {({ inputId }) => (
            <NumberStepper
              id={inputId}
              value={values.amount}
              onValueChange={set('amount')}
              max={draft.kind === 'timed' ? 3600 : 1000}
              step={draft.kind === 'timed' ? 5 : 1}
            />
          )}
        </Field>
        {hasLoad(draft.kind) ? (
          <Field
            label={draft.kind === 'bodyweight-loadable' ? 'Added load' : 'Load'}
            unit="kg"
            hint={draft.kind === 'bodyweight-loadable' ? 'Leave blank for bodyweight.' : undefined}
          >
            {({ inputId, describedBy }) => (
              <NumberStepper
                id={inputId}
                value={values.load}
                onValueChange={set('load')}
                step={2.5}
                max={500}
                inputMode="decimal"
                placeholder={draft.kind === 'bodyweight-loadable' ? 'Bodyweight' : undefined}
                describedBy={describedBy}
              />
            )}
          </Field>
        ) : null}
        {error ? (
          <p role="alert" className="text-danger text-sm font-medium">
            {error}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onChange({ included: false })
              setOpen(false)
            }}
          >
            Not done
          </Button>
          <Button
            onClick={() => {
              const parsed = parseDraft({ ...draft, values })
              if (!parsed.ok) {
                setError(parsed.error)
                return
              }
              onChange({ values, included: true })
              setOpen(false)
            }}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
