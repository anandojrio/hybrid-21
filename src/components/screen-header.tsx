import { ChevronLeft, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { cn } from 'cn'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'

interface ScreenHeaderProps {
  title: string
  /** Small line above the title, in Mint. */
  subtitle?: ReactNode
  /** Tab screens show the Settings button; pushed screens show Back. */
  variant?: 'tab' | 'pushed'
  /** Shows the emblem above the eyebrow (Today only). */
  brand?: boolean
  /** Extra content inside the hero, below the title (e.g. focus line, chips). */
  children?: ReactNode
  className?: string
}

/**
 * Brand hero for every screen that is not about one session: Charcoal block reaching under
 * the status bar, Mint eyebrow, Cool White title and Ocean accents passed as children.
 */
export function ScreenHeader({
  title,
  subtitle,
  variant = 'tab',
  brand = false,
  children,
  className,
}: ScreenHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  // 'default' means this screen was opened directly, so there is no in-app page to go back to.
  const canGoBack = location.key !== 'default'
  return (
    <header
      className={cn(
        'bg-charcoal text-cool-white -mx-4 -mt-[max(12px,env(safe-area-inset-top))] flex flex-col gap-3 rounded-b-[28px] px-4 pt-[calc(max(12px,env(safe-area-inset-top))+8px)] pb-6',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {variant === 'pushed' ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            className="text-cool-white -ml-2 hover:bg-white/10"
            onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
          >
            <ChevronLeft className="size-6" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          {brand ? <BrandLogo variant="mark" decorative className="mb-3 h-9" /> : null}
          {subtitle ? <p className="text-mint tabular text-sm font-semibold">{subtitle}</p> : null}
          <h1 className="font-display truncate text-[34px] leading-tight font-bold tracking-tight">
            {title}
          </h1>
        </div>
        {variant === 'tab' ? (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-cool-white -mr-2 hover:bg-white/10"
          >
            <Link to="/settings" aria-label="Settings">
              <Settings className="size-6" />
            </Link>
          </Button>
        ) : null}
      </div>
      {children}
    </header>
  )
}

/** Ocean chip for the brand hero, e.g. "74 days to race". */
export function HeroChip({ children }: { children: ReactNode }) {
  return (
    <span className="bg-ocean tabular inline-flex h-8 items-center rounded-full px-3 text-sm font-semibold text-white">
      {children}
    </span>
  )
}
