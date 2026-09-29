import { HybridDatabase, openDatabase } from './database'
import {
  DexieCheckInRepository,
  DexieSessionLogRepository,
  DexieSettingsRepository,
} from './repositories/dexie-repositories'
import type {
  CheckInRepository,
  SessionLogRepository,
  SettingsRepository,
} from './repositories/types'

export interface Repositories {
  sessionLogs: SessionLogRepository
  checkIns: CheckInRepository
  settings: SettingsRepository
}

export function createRepositories(db: HybridDatabase): Repositories {
  return {
    sessionLogs: new DexieSessionLogRepository(db),
    checkIns: new DexieCheckInRepository(db),
    settings: new DexieSettingsRepository(db),
  }
}

let appDb: HybridDatabase | undefined

/** App-wide database; opened once at startup (seeds applied, errors surfaced as StorageError). */
export async function initStorage(): Promise<{ db: HybridDatabase; repositories: Repositories }> {
  appDb ??= new HybridDatabase()
  await openDatabase(appDb)
  return { db: appDb, repositories: createRepositories(appDb) }
}

export { HybridDatabase, StorageError } from './database'
export type * from './repositories/types'
