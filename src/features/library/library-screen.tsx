import { ComingSoon } from '@/components/coming-soon'
import { ScreenHeader } from '@/components/screen-header'

export default function LibraryScreen() {
  return (
    <>
      <ScreenHeader title="Library" />
      <ComingSoon phase={8} items={['Search and filters', 'Exercise technique and alternatives']} />
    </>
  )
}
