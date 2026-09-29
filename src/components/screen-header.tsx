import { ChevronLeft, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

interface ScreenHeaderProps {
  title: string
  subtitle?: ReactNode
  /** Tab screens show the Settings button; pushed screens show Back. */
  variant?: 'tab' | 'pushed'
  className?: string
}

export function ScreenHeader({ title, subtitle, variant = 'tab', className }: ScreenHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  // 'default' means this screen was opened directly, so there is no in-app page to go back to.
  const canGoBack = location.key !== 'default'
  return (
    <header className={cn('flex items-start gap-2 pt-2', className)}>
      {variant === 'pushed' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          className="-ml-2"
          onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
        >
          <ChevronLeft className="size-6" />
        </Button>
      ) : null}
      <div className="min-w-0 flex-1">
        {subtitle ? <p className="text-ink-muted tabular text-sm font-medium">{subtitle}</p> : null}
        <h1 className="font-display truncate text-[34px] leading-tight font-bold tracking-tight">
          {title}
        </h1>
      </div>
      {variant === 'tab' ? (
        <Button variant="ghost" size="icon" asChild className="-mr-2">
          <Link to="/settings" aria-label="Settings">
            <Settings className="size-6" />
          </Link>
        </Button>
      ) : null}
    </header>
  )
}
