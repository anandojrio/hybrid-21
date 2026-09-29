import { deriveSessionStatus } from '../domain/status'
import type { GymLog } from '../domain/types'
import { HybridDatabase, openDatabase, StorageError } from './database'
import { SEP_22_RUN_ID } from './migrations/seeds'
import {
  DexieCheckInRepository,
  DexieSessionLogRepository,
  DexieSettingsRepository,
} from './repositories/dexie-repositories'
import type { SessionLogInput } from './repositories/types'

let counter = 0
const freshDb = () => new HybridDatabase(`test-${Date.now()}-${counter++}`)

function steppingClock(start = Date.parse('2026-10-05T18:00:00.000Z')) {
  let t = start
  return () => new Date((t += 60_000))
}

type GymInput = Extract<SessionLogInput, { kind: 'gym' }>

const legLog = (sessionId: string, date: string, loadKg: number): GymInput => ({
  sessionId,
  date,
  kind: 'gym',
  status: 'completed',
  exercises: [
    { exerciseId: 'back-squat', kind: 'loaded', setsCompleted: 3, totalReps: 15, loadKg },
    { exerciseId: 'side-plank', kind: 'timed', setsCompleted: 2, totalHoldSeconds: 120 },
  ],
})

describe('database open and seed migration', () => {
  it('seeds the supplied Sep 22 run once, marking the approximate pace as derived', async () => {
    const db = freshDb()
    await openDatabase(db)
    const logs = await db.sessionLogs.toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      id: SEP_22_RUN_ID,
      sessionId: 'w01-tue-run',
      date: '2026-09-22',
      status: 'completed',
      seedVersion: 1,
      derivedFields: ['avgPaceSecPerKm'],
      result: {
        distanceKm: 4.5,
        durationSec: 1822,
        avgPaceSecPerKm: 405,
        avgHr: 142,
        maxHr: 174,
        avgPowerW: 296,
        hrZonesSec: [28, 1223, 549, 22, 0],
      },
    })
    // Values that were not supplied are not invented.
    const run = logs[0]!.kind === 'run' ? logs[0]!.result : undefined
    expect(run?.rpe).toBeUndefined()
    expect(run?.talkTest).toBeUndefined()

    await openDatabase(db)
    expect(await db.sessionLogs.count()).toBe(1)
  })

  it('does not bring the seed back after the owner deletes it', async () => {
    const db = freshDb()
    await openDatabase(db)
    await new DexieSessionLogRepository(db).delete(SEP_22_RUN_ID)
    db.close()
    await openDatabase(db)
    expect(await db.sessionLogs.count()).toBe(0)
  })

  it('reports IndexedDB failure as a StorageError', async () => {
    class BrokenDb extends HybridDatabase {
      override open(): never {
        throw new Error('IndexedDB blocked')
      }
    }
    await expect(openDatabase(new BrokenDb('broken'))).rejects.toBeInstanceOf(StorageError)
  })
})

describe('session log repository', () => {
  it('creates, edits and deletes the single log of a session', async () => {
    const db = freshDb()
    await db.open()
    const repo = new DexieSessionLogRepository(db, steppingClock())

    const created = await repo.save(legLog('w03-mon-leg', '2026-10-05', 80))
    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBe(created.updatedAt)

    const edited = await repo.save({
      ...legLog('w03-mon-leg', '2026-10-05', 82.5),
      status: 'modified',
    })
    expect(edited.id).toBe(created.id)
    expect(edited.createdAt).toBe(created.createdAt)
    expect(edited.updatedAt > created.updatedAt).toBe(true)
    expect(await db.sessionLogs.count()).toBe(1)
    expect(deriveSessionStatus('w03-mon-leg', await repo.list())).toBe('modified')

    await repo.delete(created.id)
    expect(await repo.getBySession('w03-mon-leg')).toBeUndefined()
    expect(deriveSessionStatus('w03-mon-leg', await repo.list())).toBe('planned')
  })

  it('finds the previous result for an exercise, excluding the session being logged', async () => {
    const db = freshDb()
    await db.open()
    const repo = new DexieSessionLogRepository(db, steppingClock())
    await repo.save(legLog('w03-mon-leg', '2026-10-05', 80))
    await repo.save(legLog('w04-mon-leg', '2026-10-12', 82.5))

    const latest = await repo.latestExerciseResult('back-squat')
    expect(latest).toMatchObject({ date: '2026-10-12', result: { loadKg: 82.5 } })

    const whileLoggingWeek4 = await repo.latestExerciseResult('back-squat', {
      excludeSessionId: 'w04-mon-leg',
    })
    expect(whileLoggingWeek4).toMatchObject({ date: '2026-10-05', result: { loadKg: 80 } })

    expect(await repo.latestExerciseResult('pull-up')).toBeUndefined()
    const saved = (await repo.getBySession('w04-mon-leg')) as GymLog
    expect(saved.exercises).toHaveLength(2)
  })
})

describe('check-in and settings repositories', () => {
  it('keeps one morning check-in per run and preserves createdAt on edit', async () => {
    const db = freshDb()
    await db.open()
    const repo = new DexieCheckInRepository(db, steppingClock())
    const first = await repo.save({ sessionId: 'w02-tue-run', date: '2026-09-30', energy: 4 })
    const edited = await repo.save({
      sessionId: 'w02-tue-run',
      date: '2026-09-30',
      energy: 3,
      kneePainNextMorning: 1,
    })
    expect(edited).toMatchObject({ id: first.id, createdAt: first.createdAt, energy: 3 })
    expect(await db.checkIns.count()).toBe(1)
  })

  it('stores the last backup time', async () => {
    const db = freshDb()
    await db.open()
    const settings = new DexieSettingsRepository(db)
    expect(await settings.getLastBackupAt()).toBeUndefined()
    await settings.setLastBackupAt('2026-10-01T08:00:00.000Z')
    expect(await settings.getLastBackupAt()).toBe('2026-10-01T08:00:00.000Z')
  })
})
