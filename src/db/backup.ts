import { z } from 'zod'
import { getSession } from '../data/training-plan'
import { morningCheckInRecordSchema, sessionLogSchema } from '../domain/schemas'
import type { MorningCheckIn, SessionLog } from '../domain/types'
import { toIsoDate } from '../lib/dates'
import type { HybridDatabase } from './database'

export const BACKUP_FORMAT = 'hybrid21-backup'
export const BACKUP_VERSION = 1

export const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string(),
  sessionLogs: z.array(sessionLogSchema),
  checkIns: z.array(morningCheckInRecordSchema),
})

export type Backup = z.infer<typeof backupSchema>

export async function createBackup(db: HybridDatabase, now: Date = new Date()): Promise<Backup> {
  const [sessionLogs, checkIns] = await Promise.all([
    db.sessionLogs.orderBy('date').toArray(),
    db.checkIns.orderBy('date').toArray(),
  ])
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    sessionLogs,
    checkIns,
  }
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2)
}

export function backupFileName(now: Date = new Date()): string {
  return `hybrid21-backup-${toIsoDate(now)}.json`
}

export interface BackupSummary {
  sessionLogs: number
  checkIns: number
  exportedAt: string
  firstDate?: string
  lastDate?: string
}

export type ParsedBackup =
  { ok: true; backup: Backup; summary: BackupSummary } | { ok: false; errors: string[] }

const MAX_REPORTED_ERRORS = 5

/** Validates a backup file before anything is written. Errors are specific and human-readable. */
export function parseBackup(text: string): ParsedBackup {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['This file is not valid JSON.'] }
  }

  if (typeof json === 'object' && json !== null && 'format' in json) {
    if ((json as { format: unknown }).format !== BACKUP_FORMAT) {
      return { ok: false, errors: ['This file is not a Hybrid 21 backup.'] }
    }
    if ((json as { version?: unknown }).version !== BACKUP_VERSION) {
      return {
        ok: false,
        errors: [`Unsupported backup version. This app reads version ${BACKUP_VERSION}.`],
      }
    }
  }

  const parsed = backupSchema.safeParse(json)
  if (!parsed.success) {
    const errors = parsed.error.issues
      .slice(0, MAX_REPORTED_ERRORS)
      .map((issue) => `${issue.path.join('.') || 'file'}: ${issue.message}`)
    return { ok: false, errors }
  }

  const backup = parsed.data
  const unknownSessions = [...backup.sessionLogs, ...backup.checkIns]
    .map((r) => r.sessionId)
    .filter((id) => !getSession(id))
  if (unknownSessions.length) {
    return {
      ok: false,
      errors: [`Unknown planned sessions: ${[...new Set(unknownSessions)].slice(0, 5).join(', ')}`],
    }
  }
  const duplicateSessions = findDuplicates(backup.sessionLogs.map((l) => l.sessionId))
  if (duplicateSessions.length) {
    return {
      ok: false,
      errors: [`More than one log for: ${duplicateSessions.slice(0, 5).join(', ')}`],
    }
  }

  const dates = backup.sessionLogs.map((l) => l.date).sort()
  return {
    ok: true,
    backup,
    summary: {
      sessionLogs: backup.sessionLogs.length,
      checkIns: backup.checkIns.length,
      exportedAt: backup.exportedAt,
      firstDate: dates[0],
      lastDate: dates.at(-1),
    },
  }
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const v of values) (seen.has(v) ? dupes : seen).add(v)
  return [...dupes]
}

export interface RestoreResult {
  added: number
  updated: number
  unchanged: number
}

/**
 * Merges a validated backup into the database. Records are matched by stable ID and by
 * planned session, so importing the same file twice never duplicates anything. When the
 * device and the backup both hold a log for the same session, the newer `updatedAt` wins.
 */
export async function restoreBackup(db: HybridDatabase, backup: Backup): Promise<RestoreResult> {
  const result: RestoreResult = { added: 0, updated: 0, unchanged: 0 }
  await db.transaction('rw', db.sessionLogs, db.checkIns, async () => {
    for (const incoming of backup.sessionLogs) {
      await mergeRecord<SessionLog>(db.sessionLogs, incoming as SessionLog, result)
    }
    for (const incoming of backup.checkIns) {
      await mergeRecord<MorningCheckIn>(db.checkIns, incoming as MorningCheckIn, result)
    }
  })
  return result
}

interface MergeTable<T extends { id: string; sessionId: string; updatedAt: string }> {
  get(id: string): Promise<T | undefined>
  where(index: 'sessionId'): { equals(value: string): { first(): Promise<T | undefined> } }
  put(record: T): Promise<unknown>
  delete(id: string): Promise<void>
}

async function mergeRecord<T extends { id: string; sessionId: string; updatedAt: string }>(
  table: unknown,
  incoming: T,
  result: RestoreResult,
): Promise<void> {
  const t = table as MergeTable<T>
  const current =
    (await t.get(incoming.id)) ?? (await t.where('sessionId').equals(incoming.sessionId).first())
  if (!current) {
    await t.put(incoming)
    result.added += 1
    return
  }
  if (
    stableStringify(current) === stableStringify(incoming) ||
    current.updatedAt > incoming.updatedAt
  ) {
    result.unchanged += 1
    return
  }
  if (current.id !== incoming.id) await t.delete(current.id)
  await t.put(incoming)
  result.updated += 1
}

/** JSON with sorted keys and without undefined values, so equal records compare equal. */
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )
}
