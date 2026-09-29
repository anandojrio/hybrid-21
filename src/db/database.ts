import Dexie, { type EntityTable } from 'dexie'
import type { MorningCheckIn, SessionLog } from '../domain/types'
import { applySeeds } from './migrations/seeds'

export interface MetaEntry {
  key: string
  value: unknown
}

export const DB_NAME = 'hybrid21'

/** IndexedDB schema. Add a new `version()` for every schema change; never edit old ones. */
export class HybridDatabase extends Dexie {
  sessionLogs!: EntityTable<SessionLog, 'id'>
  checkIns!: EntityTable<MorningCheckIn, 'id'>
  meta!: EntityTable<MetaEntry, 'key'>

  constructor(name: string = DB_NAME) {
    super(name)
    this.version(1).stores({
      // One log per planned session: `&sessionId` is unique.
      sessionLogs: 'id, &sessionId, date, kind, status',
      checkIns: 'id, &sessionId, date',
      meta: 'key',
    })
  }
}

export class StorageError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'StorageError'
  }
}

/** Opens the database and applies pending versioned seeds. Throws StorageError on failure. */
export async function openDatabase(db: HybridDatabase, now: Date = new Date()): Promise<void> {
  try {
    await db.open()
    await applySeeds(db, now)
  } catch (error) {
    throw new StorageError(
      'Local storage is unavailable. Your data cannot be saved on this device right now.',
      error,
    )
  }
}
