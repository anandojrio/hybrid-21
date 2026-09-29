import { Circle, CircleCheck, CircleSlash, PencilLine, type LucideIcon } from 'lucide-react'
import { cn } from 'cn'
import type { SessionStatus } from '@/domain/types'
import { STATUS_LABEL } from '@/lib/session-types'

const STATUS_ICON: Record<SessionStatus, LucideIcon> = {
  planned: Circle,
  completed: CircleCheck,
  modified: PencilLine,
  skipped: CircleSlash,
}

interface StatusMarkerProps {
  status: SessionStatus
  /** `pill` shows icon + text; `dot` shows only the icon with a screen-reader label. */
  variant?: 'pill' | 'dot'
  /**
   * `hero` sits on a session-colored hero: a translucent pill in the hero's own text color,
   * so it stays readable on every type color.
   */
  tone?: 'default' | 'hero'
  className?: string
}

/** Status is always icon + text (or icon + accessible label), never color alone. */
export function StatusMarker({
  status,
  variant = 'pill',
  tone = 'default',
  className,
}: StatusMarkerProps) {
  const Icon = STATUS_ICON[status]
  const colors =
    tone === 'hero'
      ? {
          backgroundColor: 'color-mix(in srgb, currentColor 16%, transparent)',
          boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, currentColor 45%, transparent)',
        }
      : { backgroundColor: `var(--status-${status})`, color: `var(--status-${status}-fg)` }

  if (variant === 'dot') {
    return (
      <span
        className={cn('inline-flex size-4 items-center justify-center rounded-full', className)}
        style={colors}
      >
        <Icon aria-hidden className="size-3" strokeWidth={2.5} />
        <span className="sr-only">{STATUS_LABEL[status]}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold',
        status === 'planned' && tone === 'default' && 'ring-separator ring-1',
        className,
      )}
      style={colors}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      {STATUS_LABEL[status]}
    </span>
  )
}
