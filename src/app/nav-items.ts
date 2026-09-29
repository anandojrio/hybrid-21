import { BookOpen, CalendarDays, ChartNoAxesColumn, History, Sun } from 'lucide-react'
import type { BottomNavItem } from '@/components/bottom-nav/bottom-nav'

export const NAV_ITEMS: readonly BottomNavItem[] = [
  { key: 'today', label: 'Today', href: '/', icon: Sun },
  { key: 'plan', label: 'Plan', href: '/plan', icon: CalendarDays },
  { key: 'history', label: 'History', href: '/history', icon: History },
  { key: 'stats', label: 'Stats', href: '/stats', icon: ChartNoAxesColumn },
  { key: 'library', label: 'Library', href: '/library', icon: BookOpen },
]

/** Tab that owns a path; nested screens (e.g. /plan/…) belong to their tab. */
export function tabForPath(pathname: string): string | undefined {
  if (pathname === '/') return 'today'
  return NAV_ITEMS.find((item) => item.href !== '/' && pathname.startsWith(item.href))?.key
}
