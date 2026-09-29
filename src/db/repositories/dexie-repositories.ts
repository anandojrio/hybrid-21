import type { MorningCheckIn, SessionLog } from '../../domain/types'
import { createBackup, restoreBackup, type Backup, type RestoreResult } from '../backup'
import type { HybridDatabase } from '../database'
import type {
  BackupRepository,
  CheckInRepository,
  MorningCheckInInput,
  PreviousExerciseResult,
  SessionLogInput,
  SessionLogRepository,
  SettingsRepository,
} from './types'

type Clock = () => Date
const systemClock: Clock = () => new Date()

export function newId(): string {
  return crypto.randomUUID()
}

const byNewest = (a: SessionLog, b: SessionLog) =>
  a.date === b.date ? (a.updatedAt < b.updatedAt ? 1 : -1) : a.date < b.date ? 1 : -1

export class DexieSessionLogRepository implements SessionLogRepository {
  private readonly db: HybridDatabase
  private readonly clock: Clock

  constructor(db: HybridDatabase, clock: Clock = systemClock) {
    this.db = db
    this.clock = clock
  }

  list(): Promise<SessionLog[]> {
    return this.db.sessionLogs.orderBy('date').toArray()
  }

  getBySession(sessionId: string): Promise<SessionLog | undefined> {
    return this.db.sessionLogs.where('sessionId').equals(sessionId).first()
  }

  save(input: SessionLogInput): Promise<SessionLog> {
    return this.db.transaction('rw', this.db.sessionLogs, async () => {
      const existing = await this.getBySession(input.sessionId)
      const now = this.clock().toISOString()
      const log = {
        ...input,
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      } as SessionLog
      await this.db.sessionLogs.put(log)
      return log
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.sessionLogs.delete(id)
  }

  async latestExerciseResult(
    exerciseId: string,
    options: { excludeSessionId?: string; beforeDate?: string } = {},
  ): Promise<PreviousExerciseResult | undefined> {
    const gymLogs = await this.db.sessionLogs.where('kind').equals('gym').toArray()
    gymLogs.sort(byNewest)
    for (const log of gymLogs) {
      if (log.kind !== 'gym') continue
      if (log.sessionId === options.excludeSessionId) continue
      if (options.beforeDate && log.date >= options.beforeDate) continue
      const result = log.exercises.find((e) => e.exerciseId === exerciseId)
      if (result) return { date: log.date, sessionId: log.sessionId, result }
    }
    return undefined
  }
}

export class DexieCheckInRepository implements CheckInRepository {
  private readonly db: HybridDatabase
  private readonly clock: Clock

  constructor(db: HybridDatabase, clock: Clock = systemClock) {
    this.db = db
    this.clock = clock
  }

  list(): Promise<MorningCheckIn[]> {
    return this.db.checkIns.orderBy('date').toArray()
  }

  getBySession(sessionId: string): Promise<MorningCheckIn | undefined> {
    return this.db.checkIns.where('sessionId').equals(sessionId).first()
  }

  save(input: MorningCheckInInput): Promise<MorningCheckIn> {
    return this.db.transaction('rw', this.db.checkIns, async () => {
      const existing = await this.getBySession(input.sessionId)
      const now = this.clock().toISOString()
      const record: MorningCheckIn = {
        ...input,
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
      await this.db.checkIns.put(record)
      return record
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.checkIns.delete(id)
  }
}

const LAST_BACKUP_KEY = 'lastBackupAt'

export class DexieSettingsRepository implements SettingsRepository {
  private readonly db: HybridDatabase

  constructor(db: HybridDatabase) {
    this.db = db
  }

  async getLastBackupAt(): Promise<string | undefined> {
    const entry = await this.db.meta.get(LAST_BACKUP_KEY)
    return typeof entry?.value === 'string' ? entry.value : undefined
  }

  async setLastBackupAt(at: string): Promise<void> {
    await this.db.meta.put({ key: LAST_BACKUP_KEY, value: at })
  }
}

export class DexieBackupRepository implements BackupRepository {
  private readonly db: HybridDatabase

  constructor(db: HybridDatabase) {
    this.db = db
  }

  create(now?: Date): Promise<Backup> {
    return createBackup(this.db, now)
  }

  restore(backup: Backup): Promise<RestoreResult> {
    return restoreBackup(this.db, backup)
  }
}
