import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '@/app/storage-provider'
import { useLogs } from '@/app/logs-store'
import { isBackupReminderDue } from '@/lib/backup-reminder'

/** Last backup time and whether the 7-day reminder is due. */
export function useBackupStatus() {
  const { settings } = useRepositories()
  const { logs, checkIns, loaded } = useLogs()
  const [lastBackupAt, setLastBackupAt] = useState<string | undefined>()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    void settings.getLastBackupAt().then((at) => {
      if (cancelled) return
      setLastBackupAt(at)
      setChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [settings])

  const markBackedUp = useCallback(
    async (at: string) => {
      await settings.setLastBackupAt(at)
      setLastBackupAt(at)
    },
    [settings],
  )

  const reminderDue =
    loaded &&
    checked &&
    isBackupReminderDue({ hasLogs: logs.length + checkIns.length > 0, lastBackupAt })

  return { lastBackupAt, reminderDue, markBackedUp }
}
