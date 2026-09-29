import { getExercise } from '@/data/exercises'
import {
  formatDuration,
  formatExerciseResult,
  formatPace,
  totalVolumeLoad,
} from '@/domain/calculations'
import type { SessionLog, SkipReason, TalkTest } from '@/domain/types'

export const SKIP_REASON_LABEL: Record<SkipReason, string> = {
  fatigue: 'Fatigue',
  work: 'Work',
  pain: 'Pain',
  illness: 'Illness',
  schedule: 'Schedule',
  other: 'Other',
}

export const TALK_TEST_LABEL: Record<TalkTest, string> = {
  'full-sentences': 'Full sentences',
  'short-sentences': 'Short sentences',
  'few-words': 'Few words',
}

/** One-line key result for cards and lists. */
export function keyResult(log: SessionLog): string {
  switch (log.kind) {
    case 'run': {
      const r = log.result
      return `${r.distanceKm.toFixed(2)} km · ${formatDuration(r.durationSec)} · ${formatPace(r.avgPaceSecPerKm)}/km · ${r.avgHr} bpm`
    }
    case 'gym': {
      const volume = totalVolumeLoad(log.exercises)
      const count = `${log.exercises.length} exercise${log.exercises.length === 1 ? '' : 's'}`
      return volume > 0
        ? `${count} · ${Math.round(volume).toLocaleString('en-US')} kg volume`
        : count
    }
    case 'mobility':
      return [
        `Core ${log.coreSession}`,
        log.asPrescribed ? 'as prescribed' : 'not as prescribed',
        log.durationMin ? `${log.durationMin} min` : undefined,
      ]
        .filter(Boolean)
        .join(' · ')
    case 'skip':
      return `Skipped · ${SKIP_REASON_LABEL[log.reason]}`
    case 'simple':
      return 'Completed'
  }
}

export interface ResultRow {
  label: string
  value: string
  derived?: boolean
}

/** Detailed rows for the "Result" section. Missing optional metrics are simply omitted. */
export function resultRows(log: SessionLog): ResultRow[] {
  const derived = new Set(log.derivedFields ?? [])
  switch (log.kind) {
    case 'run': {
      const r = log.result
      const rows: ResultRow[] = [
        { label: 'Distance', value: `${r.distanceKm.toFixed(2)} km` },
        { label: 'Time', value: formatDuration(r.durationSec) },
        {
          label: 'Avg Pace',
          value: `${formatPace(r.avgPaceSecPerKm)} /km`,
          derived: derived.has('avgPaceSecPerKm'),
        },
        { label: 'Avg HR', value: `${r.avgHr} bpm` },
        { label: 'Max HR', value: `${r.maxHr} bpm` },
      ]
      r.hrZonesSec?.forEach((sec, i) => {
        if (sec !== undefined) rows.push({ label: `HR Zone ${i + 1}`, value: formatDuration(sec) })
      })
      const optional: [string, number | undefined, string][] = [
        ['Aerobic TE', r.aerobicTe, ''],
        ['Anaerobic TE', r.anaerobicTe, ''],
        ['Avg Power', r.avgPowerW, ' W'],
        ['Total Ascent', r.totalAscentM, ' m'],
        ['Avg Run Cadence', r.avgCadenceSpm, ' spm'],
        ['Session RPE', r.rpe, ' / 10'],
        ['Knee pain during', r.kneePainDuring, ' / 10'],
        ['Knee pain after', r.kneePainAfter, ' / 10'],
      ]
      for (const [label, value, unit] of optional) {
        if (value !== undefined) rows.push({ label, value: `${value}${unit}` })
      }
      if (r.talkTest) rows.push({ label: 'Talk test', value: TALK_TEST_LABEL[r.talkTest] })
      return rows
    }
    case 'gym':
      return log.exercises.map((e) => ({
        label: getExercise(e.exerciseId).name,
        value: formatExerciseResult(e),
      }))
    case 'mobility':
      return [
        { label: 'Session', value: `Core ${log.coreSession}` },
        { label: 'As prescribed', value: log.asPrescribed ? 'Yes' : 'No' },
        ...(log.durationMin ? [{ label: 'Duration', value: `${log.durationMin} min` }] : []),
      ]
    case 'skip':
      return [{ label: 'Reason', value: SKIP_REASON_LABEL[log.reason] }]
    case 'simple':
      return [{ label: 'Status', value: 'Completed' }]
  }
}
