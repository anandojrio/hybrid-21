import { useEffect, useState } from 'react'
import type { IsoDate } from '@/domain/types'
import { todayIso } from '@/lib/dates'

/** Local calendar date that rolls over at midnight and when the app returns to the foreground. */
export function useToday(): IsoDate {
  const [today, setToday] = useState(todayIso)
  useEffect(() => {
    const refresh = () => setToday(todayIso())
    const interval = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return today
}
