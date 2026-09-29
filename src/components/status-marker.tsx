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
  className?: string
}

/** Status is always icon + text (or icon + accessible label), never color alone. */
export function StatusMarker({ status, variant = 'pill', className }: StatusMarkerProps) {
  const Icon = STATUS_ICON[status]
  const colors = {
    backgroundColor: `var(--status-${status})`,
    color: `var(--status-${status}-fg)`,
  }

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
        status === 'planned' && 'ring-separator ring-1',
        className,
      )}
      style={colors}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      {STATUS_LABEL[status]}
    </span>
  )
}
