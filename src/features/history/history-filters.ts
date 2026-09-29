import type { PlannedSession, SessionLog } from '@/domain/types'

export const HISTORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'gym', label: 'Gym' },
  { id: 'ice', label: 'Ice' },
  { id: 'football', label: 'Football' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'completed', label: 'Completed' },
  { id: 'modified', label: 'Modified' },
  { id: 'skipped', label: 'Skipped' },
] as const

export type HistoryFilter = (typeof HISTORY_FILTERS)[number]['id']

export const isHistoryFilter = (value: string | null): value is HistoryFilter =>
  HISTORY_FILTERS.some((f) => f.id === value)

export function matchesFilter(
  log: SessionLog,
  session: PlannedSession,
  filter: HistoryFilter,
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'running':
      return session.type === 'run' || session.type === 'long' || session.type === 'race'
    case 'gym':
      return session.type === 'leg' || session.type === 'push' || session.type === 'pull'
    case 'ice':
      return session.type === 'ice'
    case 'football':
      return session.type === 'soc'
    case 'mobility':
      return session.type === 'mob'
    case 'completed':
    case 'modified':
    case 'skipped':
      return log.status === filter
  }
}
