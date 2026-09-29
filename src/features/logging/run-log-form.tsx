import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  Field,
  PaceInput,
  ScaleSlider,
  Segmented,
  SwitchRow,
  TextInput,
  Textarea,
  TimeInput,
} from '@/components/form-controls'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  checkPace,
  formatPace,
  parseDecimal,
  parseDuration,
  parsePace,
} from '@/domain/calculations'
import { runFormSchema, toRunResult, type RunFormInput, type RunFormOutput } from '@/domain/schemas'
import { TALK_TEST_VALUES, type RunLog } from '@/domain/types'
import { numberToInput, secondsToTimeInput } from '@/lib/input-format'
import { TALK_TEST_LABEL } from '@/features/sessions/result-summary'
import { LOG_FORM_ID } from './log-form-drawer'
import type { LogFormProps } from './log-form-types'

function defaults(log: RunLog | undefined): RunFormInput {
  const r = log?.result
  const zones = r?.hrZonesSec ?? []
  return {
    distanceKm: numberToInput(r?.distanceKm),
    duration: secondsToTimeInput(r?.durationSec),
    avgPace: r ? formatPace(r.avgPaceSecPerKm) : '',
    avgHr: numberToInput(r?.avgHr),
    maxHr: numberToInput(r?.maxHr),
    zone1: secondsToTimeInput(zones[0]),
    zone2: secondsToTimeInput(zones[1]),
    zone3: secondsToTimeInput(zones[2]),
    zone4: secondsToTimeInput(zones[3]),
    zone5: secondsToTimeInput(zones[4]),
    aerobicTe: numberToInput(r?.aerobicTe),
    anaerobicTe: numberToInput(r?.anaerobicTe),
    avgPowerW: numberToInput(r?.avgPowerW),
    totalAscentM: numberToInput(r?.totalAscentM),
    avgCadenceSpm: numberToInput(r?.avgCadenceSpm),
    rpe: r?.rpe,
    talkTest: r?.talkTest,
    kneePainDuring: r?.kneePainDuring,
    kneePainAfter: r?.kneePainAfter,
    note: log?.note ?? '',
    modified: log?.status === 'modified',
  }
}

const OPTIONAL_NUMBERS = [
  { name: 'aerobicTe', label: 'Aerobic Training Effect', unit: '0.0–5.0', mode: 'decimal' },
  { name: 'anaerobicTe', label: 'Anaerobic Training Effect', unit: '0.0–5.0', mode: 'decimal' },
  { name: 'avgPowerW', label: 'Avg Power', unit: 'W', mode: 'numeric' },
  { name: 'totalAscentM', label: 'Total Ascent', unit: 'm', mode: 'numeric' },
  { name: 'avgCadenceSpm', label: 'Avg Run Cadence', unit: 'spm', mode: 'numeric' },
] as const

const ZONES = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5'] as const

export function RunLogForm({ session, log, onSubmitLog, onDirtyChange }: LogFormProps<RunLog>) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<RunFormInput, unknown, RunFormOutput>({
    resolver: zodResolver(runFormSchema),
    defaultValues: defaults(log),
    mode: 'onTouched',
  })

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])

  const [distance, duration, avgPace] = useWatch({
    control,
    name: ['distanceKm', 'duration', 'avgPace'],
  })
  const km = parseDecimal(distance ?? '')
  const sec = parseDuration(duration ?? '')
  const pace = parsePace(avgPace ?? '')
  const paceCheck = km && sec && pace ? checkPace(pace, km, sec) : null

  const submit = handleSubmit(async (data) => {
    const result = toRunResult(data)
    const keepDerived =
      log?.derivedFields?.includes('avgPaceSecPerKm') &&
      log.result.avgPaceSecPerKm === result.avgPaceSecPerKm
    await onSubmitLog({
      sessionId: session.id,
      date: session.date,
      kind: 'run',
      status: data.modified ? 'modified' : 'completed',
      result,
      note: data.note || undefined,
      seedVersion: log?.seedVersion,
      derivedFields: keepDerived ? ['avgPaceSecPerKm'] : undefined,
    })
  })

  const err = (name: keyof RunFormInput) => errors[name]?.message

  return (
    <form id={LOG_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-6">
      <section aria-labelledby="run-overview" className="flex flex-col gap-4">
        <h3
          id="run-overview"
          className="text-theme-ink text-[13px] font-bold tracking-wide uppercase"
        >
          Overview · required
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance" unit="km" error={err('distanceKm')}>
            {({ inputId, describedBy }) => (
              <TextInput
                id={inputId}
                inputMode="decimal"
                placeholder="4.50"
                aria-describedby={describedBy}
                aria-invalid={!!errors.distanceKm || undefined}
                {...register('distanceKm')}
              />
            )}
          </Field>
          <Field label="Time" unit="hh:mm:ss" error={err('duration')}>
            {({ inputId, describedBy }) => (
              <Controller
                control={control}
                name="duration"
                render={({ field }) => (
                  <TimeInput
                    id={inputId}
                    ref={field.ref}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors.duration || undefined}
                  />
                )}
              />
            )}
          </Field>
          <Field label="Avg Pace" unit="min/km" error={err('avgPace')}>
            {({ inputId, describedBy }) => (
              <Controller
                control={control}
                name="avgPace"
                render={({ field }) => (
                  <PaceInput
                    id={inputId}
                    ref={field.ref}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors.avgPace || undefined}
                  />
                )}
              />
            )}
          </Field>
          <Field label="Avg HR" unit="bpm" error={err('avgHr')}>
            {({ inputId, describedBy }) => (
              <TextInput
                id={inputId}
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={!!errors.avgHr || undefined}
                {...register('avgHr')}
              />
            )}
          </Field>
          <Field label="Max HR" unit="bpm" error={err('maxHr')}>
            {({ inputId, describedBy }) => (
              <TextInput
                id={inputId}
                inputMode="numeric"
                aria-describedby={describedBy}
                aria-invalid={!!errors.maxHr || undefined}
                {...register('maxHr')}
              />
            )}
          </Field>
        </div>
        {paceCheck?.material ? (
          <p
            role="status"
            className="flex gap-2 rounded-2xl bg-(--status-modified) px-3 py-2 text-sm text-(--status-modified-fg)"
          >
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              Time ÷ distance gives {formatPace(paceCheck.computedSecPerKm)}/km, but Avg Pace is{' '}
              {avgPace}/km. Check both. The Garmin value is saved as entered.
            </span>
          </p>
        ) : null}
      </section>

      <Accordion type="multiple" className="bg-surface rounded-(--radius-group) px-4">
        <AccordionItem value="zones" className="border-separator">
          <AccordionTrigger className="min-h-12 items-center text-base font-semibold hover:no-underline">
            Time in HR zones · optional
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-2 gap-3 pb-4">
            {ZONES.map((zone, i) => (
              <Field
                key={zone}
                label={`Time in HR Zone ${i + 1}`}
                unit="hh:mm:ss"
                error={err(zone)}
              >
                {({ inputId, describedBy }) => (
                  <Controller
                    control={control}
                    name={zone}
                    render={({ field }) => (
                      <TimeInput
                        id={inputId}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-describedby={describedBy}
                      />
                    )}
                  />
                )}
              </Field>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="garmin" className="border-separator">
          <AccordionTrigger className="min-h-12 items-center text-base font-semibold hover:no-underline">
            More Garmin metrics · optional
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-2 gap-3 pb-4">
            {OPTIONAL_NUMBERS.map(({ name, label, unit, mode }) => (
              <Field key={name} label={label} unit={unit} error={err(name)}>
                {({ inputId, describedBy }) => (
                  <TextInput
                    id={inputId}
                    inputMode={mode}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors[name] || undefined}
                    {...register(name)}
                  />
                )}
              </Field>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        aria-labelledby="run-feel"
        className="bg-surface flex flex-col gap-5 rounded-(--radius-group) p-4"
      >
        <h3 id="run-feel" className="text-theme-ink text-[13px] font-bold tracking-wide uppercase">
          How it felt
        </h3>
        <Controller
          control={control}
          name="rpe"
          render={({ field }) => (
            <ScaleSlider
              label="Session RPE"
              min={1}
              max={10}
              value={field.value}
              onChange={field.onChange}
              minLabel="1 · very easy"
              maxLabel="10 · max"
            />
          )}
        />
        <Controller
          control={control}
          name="talkTest"
          render={({ field }) => (
            <Segmented
              label="Talk test"
              value={field.value}
              onChange={field.onChange}
              options={TALK_TEST_VALUES.map((v) => ({ value: v, label: TALK_TEST_LABEL[v] }))}
            />
          )}
        />
        <Controller
          control={control}
          name="kneePainDuring"
          render={({ field }) => (
            <ScaleSlider
              label="Knee pain during run"
              min={0}
              max={10}
              value={field.value}
              onChange={field.onChange}
              minLabel="0 · none"
              maxLabel="10 · worst"
            />
          )}
        />
        <Controller
          control={control}
          name="kneePainAfter"
          render={({ field }) => (
            <ScaleSlider
              label="Knee pain after run"
              min={0}
              max={10}
              value={field.value}
              onChange={field.onChange}
              minLabel="0 · none"
              maxLabel="10 · worst"
            />
          )}
        />
      </section>

      <Field label="Notes">
        {({ inputId }) => <Textarea id={inputId} rows={3} maxLength={2000} {...register('note')} />}
      </Field>

      <Controller
        control={control}
        name="modified"
        render={({ field }) => (
          <SwitchRow
            label="Performed differently"
            description="Marks the session as modified instead of completed."
            checked={!!field.value}
            onChange={field.onChange}
          />
        )}
      />
    </form>
  )
}
