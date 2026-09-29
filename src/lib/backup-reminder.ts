export const BACKUP_REMINDER_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

/** A reminder is due when there is something to lose and no backup in the last 7 days. */
export function isBackupReminderDue(options: {
  hasLogs: boolean
  lastBackupAt?: string
  now?: Date
}): boolean {
  if (!options.hasLogs) return false
  if (!options.lastBackupAt) return true
  const last = Date.parse(options.lastBackupAt)
  if (Number.isNaN(last)) return true
  return (options.now ?? new Date()).getTime() - last >= BACKUP_REMINDER_DAYS * DAY_MS
}
