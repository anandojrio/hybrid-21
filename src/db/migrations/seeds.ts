import type { RunLog } from '../../domain/types'
import type { HybridDatabase } from '../database'

const SEED_VERSION_KEY = 'seedVersion'

interface Seed {
  version: number
  description: string
  apply: (db: HybridDatabase, nowIso: string) => Promise<void>
}

/**
 * Seed v1: the Sep 22 run supplied by the owner. Avg pace was given as "approximately 6:45"
 * and is marked as derived. RPE, talk test and knee pain were not supplied, so they stay empty.
 */
export const SEP_22_RUN_ID = 'seed-v1-w01-tue-run'

function sep22Run(nowIso: string): RunLog {
  return {
    id: SEP_22_RUN_ID,
    sessionId: 'w01-tue-run',
    date: '2026-09-22',
    kind: 'run',
    status: 'completed',
    result: {
      distanceKm: 4.5,
      durationSec: 30 * 60 + 22,
      avgPaceSecPerKm: 6 * 60 + 45,
      avgHr: 142,
      maxHr: 174,
      avgPowerW: 296,
      hrZonesSec: [28, 20 * 60 + 23, 9 * 60 + 9, 22, 0],
    },
    seedVersion: 1,
    derivedFields: ['avgPaceSecPerKm'],
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

const SEEDS: Seed[] = [
  {
    version: 1,
    description: 'Sep 22 completed run',
    apply: async (db, nowIso) => {
      const existing = await db.sessionLogs.where('sessionId').equals('w01-tue-run').first()
      if (!existing) await db.sessionLogs.add(sep22Run(nowIso))
    },
  },
]

export const LATEST_SEED_VERSION = Math.max(...SEEDS.map((s) => s.version))

/**
 * Applies each seed once. The applied version is recorded, so deleting seeded data later
 * does not bring it back.
 */
export async function applySeeds(db: HybridDatabase, now: Date): Promise<void> {
  await db.transaction('rw', db.sessionLogs, db.meta, async () => {
    const entry = await db.meta.get(SEED_VERSION_KEY)
    const applied = typeof entry?.value === 'number' ? entry.value : 0
    for (const seed of SEEDS) {
      if (seed.version > applied) await seed.apply(db, now.toISOString())
    }
    if (LATEST_SEED_VERSION > applied) {
      await db.meta.put({ key: SEED_VERSION_KEY, value: LATEST_SEED_VERSION })
    }
  })
}
