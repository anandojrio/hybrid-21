import { cn } from 'cn'
import type { SessionType } from '@/domain/types'
import { SESSION_TYPE_META } from '@/lib/session-types'

interface SessionTypeBadgeProps {
  type: SessionType
  size?: 'sm' | 'md'
  className?: string
}

/** Slug + icon on the session type color. Color is never the only signal. */
export function SessionTypeBadge({ type, size = 'md', className }: SessionTypeBadgeProps) {
  const meta = SESSION_TYPE_META[type]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold tracking-wide',
        size === 'sm' ? 'h-6 px-2 text-[11px]' : 'h-7 px-2.5 text-xs',
        className,
      )}
      style={{ backgroundColor: meta.color, color: meta.foreground }}
      title={meta.label}
    >
      <Icon aria-hidden className={size === 'sm' ? 'size-3.5' : 'size-4'} strokeWidth={2.25} />
      {meta.slug}
    </span>
  )
}

interface SessionTypeIconProps {
  type: SessionType
  size?: number
  className?: string
  /** Adds a ring in the given color so overlapping icons stay separated. */
  ringColor?: string
}

/** Round icon chip in the session type color, for compact places like the week strip. */
export function SessionTypeIcon({ type, size = 24, className, ringColor }: SessionTypeIconProps) {
  const meta = SESSION_TYPE_META[type]
  const Icon = meta.icon
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: meta.color,
        color: meta.foreground,
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
      }}
    >
      <Icon style={{ width: size * 0.58, height: size * 0.58 }} strokeWidth={2.25} />
    </span>
  )
}
