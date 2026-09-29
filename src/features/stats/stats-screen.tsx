import { ComingSoon } from '@/components/coming-soon'
import { ScreenHeader } from '@/components/screen-header'

export default function StatsScreen() {
  return (
    <>
      <ScreenHeader title="Stats" />
      <ComingSoon phase={8} items={['Running KPIs and charts', 'Strength progress']} />
    </>
  )
}
