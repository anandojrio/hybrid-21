import { useLogs } from '@/app/logs-store'
import { getChoiceGroup, getSession } from '@/data/training-plan'
import { resolveSessionState, type SessionState } from '@/domain/status'
import type { PlannedSession, SessionLog, SessionStatus } from '@/domain/types'

export function sessionStateFor(
  session: PlannedSession,
  logs: readonly SessionLog[],
): SessionState {
  const group = session.choiceGroupId ? getChoiceGroup(session.choiceGroupId) : []
  return resolveSessionState(session, logs, group)
}

export function useSessionState(
  session: PlannedSession,
): SessionState & { replacedByTitle?: string } {
  const { logs } = useLogs()
  const state = sessionStateFor(session, logs)
  return {
    ...state,
    replacedByTitle: state.replacedBy ? getSession(state.replacedBy)?.title : undefined,
  }
}

/**
 * Day marker for the week strip: shown once every session of the day is resolved
 * (logged, or replaced by its either/or alternative).
 */
export function dayStatus(
  sessions: readonly PlannedSession[],
  logs: readonly SessionLog[],
): Exclude<SessionStatus, 'planned'> | undefined {
  if (sessions.length === 0) return undefined
  const states = sessions.map((s) => sessionStateFor(s, logs))
  if (states.some((s) => s.status === 'planned' && !s.replacedBy)) return undefined
  const logged = states.filter((s) => s.status !== 'planned').map((s) => s.status)
  if (logged.includes('modified')) return 'modified'
  if (logged.every((s) => s === 'skipped')) return 'skipped'
  return 'completed'
}
