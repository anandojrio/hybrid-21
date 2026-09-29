import { ComingSoon } from '@/components/coming-soon'
import { ScreenHeader } from '@/components/screen-header'

export default function SettingsScreen() {
  return (
    <>
      <ScreenHeader title="Settings" variant="pushed" />
      <ComingSoon
        phase={9}
        items={['Backup (JSON)', 'Restore from backup', 'Export CSV', 'App information']}
      />
    </>
  )
}
