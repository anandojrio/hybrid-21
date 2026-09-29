import type { LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import { splitNumber } from '@/lib/number-format'

const TONES = {
  surface: 'bg-surface text-ink',
  charcoal: 'bg-charcoal text-ink-inverse',
  ocean: 'bg-ocean text-white',
  mint: 'bg-mint text-type-mob-fg',
} as const

interface KpiTileProps {
  label: string
  /** Numbers get the big/small split; strings (e.g. a pace "6:45") are shown as-is. */
  value: number | string | null
  decimals?: number
  unit?: string
  icon?: LucideIcon
  tone?: keyof typeof TONES
  /** Shown instead of a value when there is no data yet. Never fabricate a number. */
  emptyText?: string
  className?: string
}

export function KpiTile({
  label,
  value,
  decimals = 0,
  unit,
  icon: Icon,
  tone = 'surface',
  emptyText = 'No data yet',
  className,
}: KpiTileProps) {
  const parts =
    typeof value === 'number' ? splitNumber(value, decimals) : { whole: value, fraction: '' }
  const accessibleValue =
    value === null ? emptyText : `${parts.whole}${parts.fraction}${unit ? ` ${unit}` : ''}`

  return (
    <div
      className={cn(
        'relative flex min-h-32 flex-col justify-between gap-3 rounded-3xl p-4',
        TONES[tone],
        className,
      )}
      role="group"
      aria-label={`${label}: ${accessibleValue}`}
    >
      <div className="flex items-start justify-between gap-2" aria-hidden>
        <span className="text-sm leading-tight font-medium opacity-90">{label}</span>
        {Icon ? <Icon className="size-5 shrink-0 opacity-90" strokeWidth={2} /> : null}
      </div>
      {value === null ? (
        <span className="text-sm opacity-80" aria-hidden>
          {emptyText}
        </span>
      ) : (
        <span className="font-display tabular flex items-baseline" aria-hidden>
          <span className="text-4xl leading-none font-semibold tracking-tight">{parts.whole}</span>
          {parts.fraction ? (
            <span className="text-xl leading-none font-semibold">{parts.fraction}</span>
          ) : null}
          {unit ? <span className="ml-1 text-base font-medium opacity-80">{unit}</span> : null}
        </span>
      )}
    </div>
  )
}
