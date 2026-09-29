import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from 'cn'
import { useReduceMotion } from '@/app/motion-preference'

export interface BottomNavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: readonly BottomNavItem[]
  activeKey: string
  onSelect: (key: string, href: string) => void
  className?: string
}

const SPRING = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 } as const

/**
 * Icon-only bottom navigation on a Charcoal bar. The active tab sits on a Mint tile that
 * slides to the tapped icon with a spring; the icon pops slightly as it lands. Labels stay
 * available to assistive technology through aria-label and aria-current.
 */
export function BottomNav({ items, activeKey, onSelect, className }: BottomNavProps) {
  const reduceMotion = useReduceMotion()
  return (
    <nav aria-label="Main" className={cn('relative', className)}>
      <ul className="bg-charcoal flex h-16 items-center rounded-[26px] px-2">
        {items.map((item) => {
          const active = item.key === activeKey
          const Icon = item.icon
          return (
            <li key={item.key} className="flex h-full flex-1 items-center justify-center">
              <a
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onSelect(item.key, item.href)
                }}
                className={cn(
                  'focus-visible:outline-mint relative flex h-12 w-14 items-center justify-center rounded-2xl transition-colors duration-200',
                  active ? 'text-charcoal' : 'text-ink-inverse/65 hover:text-ink-inverse',
                )}
              >
                {active ? (
                  <motion.span
                    aria-hidden
                    layoutId="bottom-nav-active"
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                    className="bg-mint absolute inset-0 rounded-2xl"
                  />
                ) : null}
                <motion.span
                  key={active ? 'active' : 'idle'}
                  initial={reduceMotion || !active ? false : { scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { ...SPRING, delay: 0.05 }}
                  className="relative flex"
                >
                  <Icon aria-hidden className="size-6" strokeWidth={active ? 2.4 : 2} />
                </motion.span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
