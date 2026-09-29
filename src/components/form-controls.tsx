import { Minus, Plus, X } from 'lucide-react'
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from 'cn'
import { Slider } from '@/components/ui/slider'
import { formatPaceDigits, formatTimeDigits } from '@/lib/input-format'

const inputClass =
  'h-12 w-full rounded-2xl border border-separator bg-white px-3 text-base text-ink tabular placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-theme aria-invalid:border-danger'

interface FieldProps {
  label: string
  unit?: string
  hint?: string
  error?: string
  children: (ids: { inputId: string; describedBy?: string }) => ReactNode
}

/** Label, input slot, optional unit/hint and an inline error tied to the input. */
export function Field({ label, unit, hint, error, children }: FieldProps) {
  const inputId = useId()
  const errorId = useId()
  const hintId = useId()
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-ink flex items-baseline justify-between text-[15px] font-medium"
      >
        <span>{label}</span>
        {unit ? (
          <span className="text-ink-muted text-sm font-normal">
            <span className="sr-only">, </span>
            {unit}
          </span>
        ) : null}
      </label>
      {children({ inputId, describedBy })}
      {hint ? (
        <p id={hintId} className="text-ink-muted text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputClass, className)} autoComplete="off" {...props} />
})

interface MaskedInputProps extends Omit<TextInputProps, 'onChange' | 'value'> {
  value: string
  onValueChange: (value: string) => void
}

/** hh:mm:ss typed on the numeric keypad; colons are inserted automatically. */
export const TimeInput = forwardRef<HTMLInputElement, MaskedInputProps>(function TimeInput(
  { value, onValueChange, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      inputMode="numeric"
      placeholder="hh:mm:ss"
      value={value}
      onChange={(e) => onValueChange(formatTimeDigits(e.target.value))}
      {...props}
    />
  )
})

/** m:ss pace typed on the numeric keypad. */
export const PaceInput = forwardRef<HTMLInputElement, MaskedInputProps>(function PaceInput(
  { value, onValueChange, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      inputMode="numeric"
      placeholder="m:ss"
      value={value}
      onChange={(e) => onValueChange(formatPaceDigits(e.target.value))}
      {...props}
    />
  )
})

interface StepperProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  inputMode?: 'numeric' | 'decimal'
  placeholder?: string
  describedBy?: string
  invalid?: boolean
}

/** Number field with − / + buttons sized for thumbs. Accepts 4,5 or 4.5. */
export function NumberStepper({
  id,
  value,
  onValueChange,
  min = 0,
  max = 999,
  step = 1,
  inputMode = 'numeric',
  placeholder,
  describedBy,
  invalid,
}: StepperProps) {
  const current = Number(value.replace(',', '.'))
  const bump = (delta: number) => {
    const base = Number.isFinite(current) && value !== '' ? current : 0
    const next = Math.min(max, Math.max(min, Math.round((base + delta) * 100) / 100))
    onValueChange(String(next))
  }
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => bump(-step)}
        className="bg-surface-2 text-ink flex size-12 shrink-0 items-center justify-center rounded-2xl active:scale-95"
      >
        <Minus aria-hidden className="size-5" />
      </button>
      <TextInput
        id={id}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={(e) => onValueChange(e.target.value.replace(/[^\d.,]/g, ''))}
        className="text-center"
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => bump(step)}
        className="bg-surface-2 text-ink flex size-12 shrink-0 items-center justify-center rounded-2xl active:scale-95"
      >
        <Plus aria-hidden className="size-5" />
      </button>
    </div>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  value: T | undefined
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}

/** Single-choice segmented control (radio group semantics). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-1.5">
      <span className="text-ink text-[15px] font-medium" aria-hidden>
        {label}
      </span>
      <div
        className="bg-surface-2 grid gap-1 rounded-2xl p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-11 rounded-xl px-2 text-[15px] font-medium transition-colors',
              value === option.value ? 'bg-theme-strong text-theme-strong-fg' : 'text-ink',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface ScaleSliderProps {
  label: string
  value: number | undefined
  min: number
  max: number
  onChange: (value: number | undefined) => void
  minLabel?: string
  maxLabel?: string
}

/** Optional 0–10 style slider: empty until touched, can be cleared again. */
export function ScaleSlider({
  label,
  value,
  min,
  max,
  onChange,
  minLabel,
  maxLabel,
}: ScaleSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-ink text-[15px] font-medium">{label}</span>
        <span className="flex items-center gap-1">
          <span
            className="font-display tabular min-w-8 text-right text-2xl font-semibold"
            aria-hidden
          >
            {value ?? '–'}
          </span>
          {value !== undefined ? (
            <button
              type="button"
              aria-label={`Clear ${label}`}
              onClick={() => onChange(undefined)}
              className="text-ink-muted flex size-11 items-center justify-center rounded-full"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : (
            <span className="text-ink-muted text-sm">Not set</span>
          )}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value ?? min]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
        className={value === undefined ? 'opacity-50' : undefined}
      />
      {minLabel || maxLabel ? (
        <div className="text-ink-muted flex justify-between text-xs">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
    </div>
  )
}

interface SwitchRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="bg-surface flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-2 text-left"
    >
      <span className="flex flex-1 flex-col">
        <span className="text-ink text-base font-medium">{label}</span>
        {description ? <span className="text-ink-muted text-sm">{description}</span> : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-theme' : 'bg-separator',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function Textarea(props: InputHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) {
  return (
    <textarea
      {...props}
      className="border-separator w-full resize-none rounded-2xl border bg-white px-3 py-2 text-base"
    />
  )
}
