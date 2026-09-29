import { ChevronRight } from 'lucide-react'
import type React from 'react'
import type { ReactNode } from 'react'
import { cn } from 'cn'

interface ListGroupProps {
  title?: string
  footer?: ReactNode
  children: ReactNode
  className?: string
}

/** iOS-style grouped list: rows inside one rounded surface, separated by inset hairlines. */
export function ListGroup({ title, footer, children, className }: ListGroupProps) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      {title ? (
        <h2 className="text-theme-ink px-4 text-[13px] font-bold tracking-wide uppercase">
          {title}
        </h2>
      ) : null}
      <div className="divide-separator/80 bg-surface divide-y overflow-hidden rounded-(--radius-group) [&>*]:ml-0">
        {children}
      </div>
      {footer ? <div className="text-ink-muted px-4 text-sm">{footer}</div> : null}
    </section>
  )
}

interface ListRowProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  /** Renders a chevron and makes the row a button. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  className?: string
}

export function ListRow({ leading, title, subtitle, trailing, onClick, className }: ListRowProps) {
  const content = (
    <>
      {leading ? <span className="flex shrink-0 items-center">{leading}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="text-ink truncate text-base font-medium">{title}</span>
        {subtitle ? <span className="text-ink-muted truncate text-sm">{subtitle}</span> : null}
      </span>
      {trailing ? <span className="text-ink-muted tabular shrink-0">{trailing}</span> : null}
      {onClick ? <ChevronRight aria-hidden className="text-ink-muted size-5 shrink-0" /> : null}
    </>
  )
  const base = 'flex min-h-14 w-full items-center gap-3 px-4 py-2.5'
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, 'active:bg-surface-2 transition-colors', className)}
      >
        {content}
      </button>
    )
  }
  return <div className={cn(base, className)}>{content}</div>
}
