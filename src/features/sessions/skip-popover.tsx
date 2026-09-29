import { useId, useState } from 'react'
import { cn } from 'cn'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/animate-ui/components/radix/popover'
import { Button } from '@/components/ui/button'
import { skipFormSchema } from '@/domain/schemas'
import { SKIP_REASONS, type SkipReason } from '@/domain/types'
import { SKIP_REASON_LABEL } from './result-summary'

interface SkipPopoverProps {
  onSkip: (reason: SkipReason, note?: string) => Promise<void>
  label?: string
}

/** Skip flow: reason (required) and optional note. Skipping never deletes the planned session. */
export function SkipPopover({ onSkip, label = 'Skip workout' }: SkipPopoverProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<SkipReason | undefined>()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const noteId = useId()
  const errorId = useId()

  const reset = () => {
    setReason(undefined)
    setNote('')
    setError(undefined)
  }

  const save = async () => {
    const parsed = skipFormSchema.safeParse({ reason, note: note.trim() || undefined })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Choose a reason.')
      return
    }
    setSaving(true)
    try {
      await onSkip(parsed.data.reason, parsed.data.note)
      setOpen(false)
      reset()
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="flex flex-col gap-3">
        <fieldset aria-describedby={error ? errorId : undefined} className="flex flex-col gap-2">
          <legend className="mb-1 text-base font-semibold">Why are you skipping?</legend>
          <div className="grid grid-cols-2 gap-2">
            {SKIP_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                onClick={() => {
                  setReason(r)
                  setError(undefined)
                }}
                className={cn(
                  'h-11 rounded-2xl px-3 text-[15px] font-medium transition-colors',
                  reason === r ? 'bg-theme-strong text-theme-strong-fg' : 'bg-surface-2 text-ink',
                )}
              >
                {SKIP_REASON_LABEL[r]}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor={noteId} className="text-ink-muted text-sm font-medium">
          Note (optional)
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={2000}
          className="border-separator w-full resize-none rounded-2xl border bg-white px-3 py-2 text-base"
        />
        {error ? (
          <p id={errorId} role="alert" className="text-danger text-sm font-medium">
            {error}
          </p>
        ) : null}
        <Button onClick={save} disabled={saving}>
          Save skip
        </Button>
      </PopoverContent>
    </Popover>
  )
}
