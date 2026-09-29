import { Sunrise } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/animate-ui/components/radix/popover'
import { ScaleSlider } from '@/components/form-controls'
import { ListGroup, ListRow } from '@/components/list-group'
import { Button } from '@/components/ui/button'
import { useLogs } from '@/app/logs-store'
import { getSessionsForDate } from '@/data/training-plan'
import { morningCheckInSchema } from '@/domain/schemas'
import type { IsoDate, MorningCheckIn, PlannedSession } from '@/domain/types'
import { addDays, formatIsoDate } from '@/lib/dates'

interface CheckInPopoverProps {
  session: PlannedSession
  checkIn?: MorningCheckIn
  triggerLabel: string
  triggerVariant?: 'default' | 'outline' | 'mint'
}

/** Next-morning check-in for a run: knee pain, soreness and energy. Editable later. */
export function CheckInPopover({
  session,
  checkIn,
  triggerLabel,
  triggerVariant = 'mint',
}: CheckInPopoverProps) {
  const { saveCheckIn } = useLogs()
  const [open, setOpen] = useState(false)
  const [knee, setKnee] = useState(checkIn?.kneePainNextMorning)
  const [soreness, setSoreness] = useState(checkIn?.soreness)
  const [energy, setEnergy] = useState(checkIn?.energy)
  const [error, setError] = useState<string | undefined>()

  const save = async () => {
    const parsed = morningCheckInSchema.safeParse({ kneePainNextMorning: knee, soreness, energy })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    try {
      await saveCheckIn({ sessionId: session.id, date: addDays(session.date, 1), ...parsed.data })
      toast.success('Check-in saved')
      setOpen(false)
    } catch {
      setError('Could not save to this device. Try again.')
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setKnee(checkIn?.kneePainNextMorning)
          setSoreness(checkIn?.soreness)
          setEnergy(checkIn?.energy)
          setError(undefined)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant={triggerVariant} className="w-full">
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="flex flex-col gap-4">
        <p className="text-base font-semibold">Morning after {session.title.toLowerCase()}</p>
        <ScaleSlider
          label="Knee pain next morning"
          min={0}
          max={10}
          value={knee}
          onChange={setKnee}
          minLabel="0 · none"
          maxLabel="10 · worst"
        />
        <ScaleSlider
          label="General soreness"
          min={0}
          max={10}
          value={soreness}
          onChange={setSoreness}
          minLabel="0 · none"
          maxLabel="10 · very sore"
        />
        <ScaleSlider
          label="Energy"
          min={1}
          max={5}
          value={energy}
          onChange={setEnergy}
          minLabel="1 · drained"
          maxLabel="5 · great"
        />
        {error ? (
          <p role="alert" className="text-danger text-sm font-medium">
            {error}
          </p>
        ) : null}
        <Button onClick={() => void save()}>Save check-in</Button>
      </PopoverContent>
    </Popover>
  )
}

const RUN_TYPES = new Set(['run', 'long', 'race'])

/** Today prompt for yesterday's logged run that has no check-in yet. */
export function MorningCheckInPrompt({ today }: { today: IsoDate }) {
  const { logs, checkIns } = useLogs()
  const yesterday = addDays(today, -1)
  const pending = getSessionsForDate(yesterday).filter((s) => {
    if (!RUN_TYPES.has(s.type)) return false
    const log = logs.find((l) => l.sessionId === s.id)
    return log?.kind === 'run' && !checkIns.some((c) => c.sessionId === s.id)
  })
  if (pending.length === 0) return null
  return (
    <>
      {pending.map((session) => (
        <section
          key={session.id}
          aria-label="Morning check-in"
          className="bg-charcoal text-ink-inverse flex flex-col gap-3 rounded-(--radius-group) p-4"
        >
          <div className="flex items-center gap-2">
            <Sunrise aria-hidden className="text-mint size-5" />
            <h2 className="text-base font-semibold">Morning check-in for yesterday&apos;s run</h2>
          </div>
          <p className="text-sm opacity-85">
            {session.title} · {formatIsoDate(session.date, 'EEE, MMM d')}. How do the knee, legs and
            energy feel this morning?
          </p>
          <CheckInPopover session={session} triggerLabel="Check in" />
        </section>
      ))}
    </>
  )
}

/** Check-in block on the run's detail screen: values or a prompt, editable any time. */
export function CheckInSection({ session }: { session: PlannedSession }) {
  const { checkIns } = useLogs()
  const checkIn = checkIns.find((c) => c.sessionId === session.id)
  return (
    <ListGroup
      title="Morning check-in"
      footer={
        <CheckInPopover
          session={session}
          checkIn={checkIn}
          triggerLabel={checkIn ? 'Edit check-in' : 'Add check-in'}
          triggerVariant="outline"
        />
      }
    >
      {checkIn ? (
        <>
          <ListRow
            title="Knee pain next morning"
            trailing={
              checkIn.kneePainNextMorning !== undefined
                ? `${checkIn.kneePainNextMorning} / 10`
                : '–'
            }
          />
          <ListRow
            title="General soreness"
            trailing={checkIn.soreness !== undefined ? `${checkIn.soreness} / 10` : '–'}
          />
          <ListRow
            title="Energy"
            trailing={checkIn.energy !== undefined ? `${checkIn.energy} / 5` : '–'}
          />
        </>
      ) : (
        <ListRow title="Not filled in yet" subtitle="Best done the morning after the run." />
      )}
    </ListGroup>
  )
}
