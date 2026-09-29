import { HybridDatabase, openDatabase } from './database'
import {
  DexieBackupRepository,
  DexieCheckInRepository,
  DexieSessionLogRepository,
  DexieSettingsRepository,
} from './repositories/dexie-repositories'
import type {
  BackupRepository,
  CheckInRepository,
  SessionLogRepository,
  SettingsRepository,
} from './repositories/types'

export interface Repositories {
  sessionLogs: SessionLogRepository
  checkIns: CheckInRepository
  settings: SettingsRepository
  backup: BackupRepository
}

export function createRepositories(db: HybridDatabase): Repositories {
  return {
    sessionLogs: new DexieSessionLogRepository(db),
    checkIns: new DexieCheckInRepository(db),
    settings: new DexieSettingsRepository(db),
    backup: new DexieBackupRepository(db),
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
export { backupFileName, parseBackup, serializeBackup } from './backup'
export type { Backup, BackupSummary, RestoreResult } from './backup'
export { buildGymCsv, buildSessionsCsv, csvFileNames } from './export-csv'
