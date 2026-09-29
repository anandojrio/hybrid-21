import { isBackupReminderDue } from './backup-reminder'
import { requestPersistentStorage } from './persistent-storage'

describe('backup reminder', () => {
  const now = new Date('2026-10-10T12:00:00.000Z')

  it('stays quiet when there is nothing to back up', () => {
    expect(isBackupReminderDue({ hasLogs: false, now })).toBe(false)
  })

  it('is due with logs and no backup, or after 7 days', () => {
    expect(isBackupReminderDue({ hasLogs: true, now })).toBe(true)
    expect(
      isBackupReminderDue({ hasLogs: true, lastBackupAt: '2026-10-04T12:00:00.000Z', now }),
    ).toBe(false)
    expect(
      isBackupReminderDue({ hasLogs: true, lastBackupAt: '2026-10-03T12:00:00.000Z', now }),
    ).toBe(true)
  })
})

describe('persistent storage request', () => {
  it('handles unsupported, granted and denied browsers without assuming success', async () => {
    expect(await requestPersistentStorage(undefined)).toBe('unsupported')
    const granted = { persisted: async () => false, persist: async () => true } as StorageManager
    const denied = { persisted: async () => false, persist: async () => false } as StorageManager
    const throws = {
      persisted: async () => false,
      persist: async () => {
        throw new Error('blocked')
      },
    } as unknown as StorageManager
    expect(await requestPersistentStorage(granted)).toBe('granted')
    expect(await requestPersistentStorage(denied)).toBe('denied')
    expect(await requestPersistentStorage(throws)).toBe('denied')
  })
})
