import { backupFileName, createBackup, parseBackup, restoreBackup, serializeBackup } from './backup'
import { HybridDatabase, openDatabase } from './database'
import {
  DexieCheckInRepository,
  DexieSessionLogRepository,
} from './repositories/dexie-repositories'

let counter = 0
const freshDb = () => new HybridDatabase(`backup-${Date.now()}-${counter++}`)

async function populated() {
  const db = freshDb()
  await openDatabase(db, new Date('2026-09-29T10:00:00.000Z'))
  const logs = new DexieSessionLogRepository(db)
  await logs.save({
    sessionId: 'w02-wed-ice',
    date: '2026-09-30',
    kind: 'simple',
    status: 'completed',
  })
  await logs.save({
    sessionId: 'w02-thu-push',
    date: '2026-10-01',
    kind: 'gym',
    status: 'completed',
    note: 'Felt strong, "easy" bar speed',
    exercises: [
      {
        exerciseId: 'barbell-bench-press',
        kind: 'loaded',
        setsCompleted: 4,
        totalReps: 20,
        loadKg: 70,
      },
    ],
  })
  await new DexieCheckInRepository(db).save({
    sessionId: 'w01-tue-run',
    date: '2026-09-23',
    energy: 4,
  })
  return db
}

describe('JSON backup and restore', () => {
  it('round-trips every record into an empty database', async () => {
    const source = await populated()
    const text = serializeBackup(await createBackup(source, new Date('2026-10-02T07:00:00Z')))
    const parsed = parseBackup(text)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.summary).toMatchObject({
      sessionLogs: 3,
      checkIns: 1,
      firstDate: '2026-09-22',
      lastDate: '2026-10-01',
    })

    const target = freshDb()
    await target.open()
    const result = await restoreBackup(target, parsed.backup)
    expect(result).toEqual({ added: 4, updated: 0, unchanged: 0 })
    expect(await target.sessionLogs.orderBy('date').toArray()).toEqual(
      await source.sessionLogs.orderBy('date').toArray(),
    )
    expect(await target.checkIns.toArray()).toEqual(await source.checkIns.toArray())
  })

  it('never duplicates records when the same file is imported twice', async () => {
    const source = await populated()
    const parsed = parseBackup(serializeBackup(await createBackup(source)))
    if (!parsed.ok) throw new Error('backup invalid')
    const result = await restoreBackup(source, parsed.backup)
    expect(result).toEqual({ added: 0, updated: 0, unchanged: 4 })
    expect(await source.sessionLogs.count()).toBe(3)
  })

  it('keeps one log per session when device and backup disagree; newer wins', async () => {
    const db = await populated()
    const backup = await createBackup(db)
    const deviceLog = await db.sessionLogs.where('sessionId').equals('w02-wed-ice').first()
    backup.sessionLogs = backup.sessionLogs.map((l) =>
      l.sessionId === 'w02-wed-ice'
        ? { ...l, id: 'other-device-id', updatedAt: '2099-01-01T00:00:00.000Z' }
        : l,
    )
    const result = await restoreBackup(db, backup)
    expect(result.updated).toBe(1)
    const logs = await db.sessionLogs.where('sessionId').equals('w02-wed-ice').toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0]!.id).toBe('other-device-id')
    expect(logs[0]!.id).not.toBe(deviceLog!.id)
  })

  it('rejects invalid files with specific messages and writes nothing', async () => {
    expect(parseBackup('not json')).toEqual({ ok: false, errors: ['This file is not valid JSON.'] })
    expect(parseBackup(JSON.stringify({ format: 'other' }))).toEqual({
      ok: false,
      errors: ['This file is not a Hybrid 21 backup.'],
    })
    expect(parseBackup(JSON.stringify({ format: 'hybrid21-backup', version: 9 }))).toMatchObject({
      ok: false,
      errors: ['Unsupported backup version. This app reads version 1.'],
    })

    const valid = await createBackup(await populated())
    const negative = structuredClone(valid)
    const run = negative.sessionLogs.find((l) => l.kind === 'run')!
    if (run.kind === 'run') run.result.distanceKm = -1
    const bad = parseBackup(JSON.stringify(negative))
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(bad.errors[0]).toMatch(/^sessionLogs\.0\.result\.distanceKm:/)

    const unknown = structuredClone(valid)
    unknown.sessionLogs[0]!.sessionId = 'w99-mon-leg'
    expect(parseBackup(JSON.stringify(unknown))).toEqual({
      ok: false,
      errors: ['Unknown planned sessions: w99-mon-leg'],
    })

    const dupes = structuredClone(valid)
    dupes.sessionLogs.push({ ...dupes.sessionLogs[0]!, id: 'dupe' })
    expect(parseBackup(JSON.stringify(dupes))).toEqual({
      ok: false,
      errors: ['More than one log for: w01-tue-run'],
    })
  })

  it('names files with the local date', () => {
    expect(backupFileName(new Date(2026, 9, 25, 23, 30))).toBe('hybrid21-backup-2026-10-25.json')
  })
})
