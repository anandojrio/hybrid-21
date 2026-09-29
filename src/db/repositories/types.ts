import type {
  ExerciseResult,
  IsoDate,
  IsoDateTime,
  MorningCheckIn,
  SessionLog,
} from '../../domain/types'

/** A log as the UI submits it; the repository assigns id and timestamps. */
export type SessionLogInput = SessionLog extends infer L
  ? L extends SessionLog
    ? Omit<L, 'id' | 'createdAt' | 'updatedAt'>
    : never
  : never

export type MorningCheckInInput = Omit<MorningCheckIn, 'id' | 'createdAt' | 'updatedAt'>

export interface PreviousExerciseResult {
  date: IsoDate
  sessionId: string
  result: ExerciseResult
}

/**
 * Storage contract for session logs. Feature UI depends only on these interfaces,
 * so a cloud implementation can replace Dexie later.
 */
export interface SessionLogRepository {
  list(): Promise<SessionLog[]>
  getBySession(sessionId: string): Promise<SessionLog | undefined>
  /**
   * Creates or replaces the single log for `input.sessionId`. Editing keeps the original
   * `id` and `createdAt` and refreshes `updatedAt`.
   */
  save(input: SessionLogInput): Promise<SessionLog>
  /** Deleting a log reverts the planned session to `planned`. */
  delete(id: string): Promise<void>
  /** Latest logged result for an exercise, optionally excluding one session (the one being logged). */
  latestExerciseResult(
    exerciseId: string,
    options?: { excludeSessionId?: string; beforeDate?: IsoDate },
  ): Promise<PreviousExerciseResult | undefined>
}

export interface CheckInRepository {
  list(): Promise<MorningCheckIn[]>
  getBySession(sessionId: string): Promise<MorningCheckIn | undefined>
  save(input: MorningCheckInInput): Promise<MorningCheckIn>
  delete(id: string): Promise<void>
}

export interface SettingsRepository {
  getLastBackupAt(): Promise<IsoDateTime | undefined>
  setLastBackupAt(at: IsoDateTime): Promise<void>
}
