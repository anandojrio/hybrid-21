import { ComingSoon } from '@/components/coming-soon'
import { ScreenHeader } from '@/components/screen-header'

export default function PlanScreen() {
  return (
    <>
      <ScreenHeader title="Plan" subtitle="Sep 21 – Dec 12 · 12 weeks" />
      <ComingSoon
        phase={6}
        items={['Week strip with swipe', 'Day bottom sheet', 'Session details']}
      />
    </>
  )
}
