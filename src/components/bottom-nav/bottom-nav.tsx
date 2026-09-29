import type { LucideIcon } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useRef } from 'react'
import { cn } from 'cn'
import { useElementWidth } from '@/hooks/use-element-width'
import { clampNotchCenter, notchBarPath } from './notch-path'

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

const BAR_HEIGHT = 64
const CORNER = 22
const NOTCH_RADIUS = 28
const SHOULDER = 10
const NOTCH_DEPTH = 28
/** Inner horizontal padding so the first and last notches stay off the rounded corners. */
const INSET = 16
const BUBBLE = 48
/** How far the active bubble rises above the bar's top edge. */
const BUBBLE_LIFT = 12

/**
 * Icon-only bottom navigation. The active tab rises into a notch cut into the bar
 * (reference: docs/design-references/screens-colors-kpi-nav.jpg). Labels stay available
 * to assistive technology through aria-label and aria-current.
 */
export function BottomNav({ items, activeKey, onSelect, className }: BottomNavProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(barRef)
  const reduceMotion = useReducedMotion()

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.key === activeKey),
  )
  const slot = items.length ? Math.max(0, width - INSET * 2) / items.length : 0
  const target = clampNotchCenter(
    INSET + slot * activeIndex + slot / 2,
    width,
    CORNER,
    NOTCH_RADIUS,
  )

  const center = useSpring(target, { stiffness: 380, damping: 34, mass: 0.9 })
  const barWidth = useMotionValue(width)
  useEffect(() => {
    const resized = barWidth.get() !== width
    barWidth.set(width)
    // Jump instead of animating on first measure, resize, or reduced motion.
    if (reduceMotion || resized) center.jump(target)
    else center.set(target)
  }, [center, barWidth, target, width, reduceMotion])

  const path = useTransform([center, barWidth], ([cx, w]: number[]) =>
    notchBarPath({
      width: w ?? 0,
      height: BAR_HEIGHT,
      cornerRadius: CORNER,
      center: cx ?? 0,
      notchRadius: NOTCH_RADIUS,
      shoulder: SHOULDER,
      depth: NOTCH_DEPTH,
    }),
  )
  const bubbleX = useTransform(center, (cx) => cx - BUBBLE / 2)
  const ActiveIcon = items[activeIndex]?.icon

  return (
    <nav
      aria-label="Main"
      className={cn('relative', className)}
      style={{ paddingTop: BUBBLE_LIFT }}
    >
      <div ref={barRef} className="relative" style={{ height: BAR_HEIGHT }}>
        {width > 0 ? (
          <svg
            aria-hidden
            className="absolute inset-0 overflow-visible"
            width={width}
            height={BAR_HEIGHT}
            viewBox={`0 0 ${width} ${BAR_HEIGHT}`}
          >
            <motion.path d={path} fill="var(--charcoal)" />
          </svg>
        ) : (
          <div aria-hidden className="bg-charcoal absolute inset-0 rounded-3xl" />
        )}

        {width > 0 && ActiveIcon ? (
          <motion.div
            aria-hidden
            className="bg-mint text-charcoal pointer-events-none absolute flex items-center justify-center rounded-full"
            style={{ width: BUBBLE, height: BUBBLE, top: -BUBBLE_LIFT, left: 0, x: bubbleX }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={activeKey}
                initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                <ActiveIcon className="size-6" strokeWidth={2.25} />
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ) : null}

        <ul className="relative flex h-full" style={{ paddingInline: INSET }}>
          {items.map((item) => {
            const active = item.key === activeKey
            const Icon = item.icon
            return (
              <li key={item.key} className="flex flex-1">
                <a
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    onSelect(item.key, item.href)
                  }}
                  className={cn(
                    'text-ink-inverse/70 hover:text-ink-inverse focus-visible:outline-mint flex min-h-11 flex-1 items-center justify-center rounded-2xl transition-colors',
                    active && 'text-transparent hover:text-transparent',
                  )}
                >
                  <Icon aria-hidden className="size-6" strokeWidth={2} />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
