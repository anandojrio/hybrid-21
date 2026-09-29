import { ComingSoon } from '@/components/coming-soon'
import { ScreenHeader } from '@/components/screen-header'

export default function HistoryScreen() {
  return (
    <>
      <ScreenHeader title="History" />
      <ComingSoon phase={8} items={['Filters', 'Logged sessions', 'Edit or delete results']} />
    </>
  )
}
