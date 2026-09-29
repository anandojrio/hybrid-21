import { ComingSoon } from '@/components/coming-soon'
import { ScreenHeader } from '@/components/screen-header'
import { getPlanWeek } from '@/data/training-plan'
import { formatIsoDate, todayIso } from '@/lib/dates'

export default function TodayScreen() {
  const today = todayIso()
  const week = getPlanWeek(today)
  return (
    <>
      <ScreenHeader
        title="Today"
        subtitle={`${formatIsoDate(today, 'EEEE, MMMM d')}${week ? ` · Week ${week.week}` : ''}`}
      />
      <ComingSoon
        phase={6}
        items={["Today's sessions", 'Mark as complete / Skip workout', 'Tomorrow preview']}
      />
    </>
  )
}
