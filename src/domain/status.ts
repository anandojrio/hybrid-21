import type { PlannedSession, SessionLog, SessionStatus } from './types'

export interface SessionState {
  status: SessionStatus
  log?: SessionLog
  /** Set when another option of the same either/or group was completed instead. */
  replacedBy?: string
}

function latestLog(sessionId: string, logs: readonly SessionLog[]): SessionLog | undefined {
  let latest: SessionLog | undefined
  for (const log of logs) {
    if (log.sessionId !== sessionId) continue
    if (!latest || log.updatedAt > latest.updatedAt) latest = log
  }
  return latest
}

const isDone = (log: SessionLog | undefined) =>
  log?.status === 'completed' || log?.status === 'modified'

/** Status comes only from logs; with no log (or after a log is deleted) the session is planned. */
export function deriveSessionStatus(sessionId: string, logs: readonly SessionLog[]): SessionStatus {
  return latestLog(sessionId, logs)?.status ?? 'planned'
}

/**
 * Resolves a session's state, including either/or groups: when one option is completed,
 * the other options stay `planned` in data but are marked as replaced.
 */
export function resolveSessionState(
  session: PlannedSession,
  logs: readonly SessionLog[],
  groupMembers: readonly PlannedSession[] = [],
): SessionState {
  const log = latestLog(session.id, logs)
  if (log) return { status: log.status, log }
  if (session.choiceGroupId) {
    const chosen = groupMembers.find((m) => m.id !== session.id && isDone(latestLog(m.id, logs)))
    if (chosen) return { status: 'planned', replacedBy: chosen.id }
  }
  return { status: 'planned' }
}

export interface ChoiceGroupState {
  status: SessionStatus
  chosenSessionId?: string
}

/** A group counts once: done if any option is done, skipped if skipped with nothing done. */
export function resolveChoiceGroup(
  members: readonly PlannedSession[],
  logs: readonly SessionLog[],
): ChoiceGroupState {
  let skipped = false
  for (const member of members) {
    const log = latestLog(member.id, logs)
    if (isDone(log)) return { status: log!.status, chosenSessionId: member.id }
    if (log?.status === 'skipped') skipped = true
  }
  return { status: skipped ? 'skipped' : 'planned' }
}

export type LogPermission = { allowed: true } | { allowed: false; reason: string }

/**
 * Completing a session is blocked when another option of its either/or group is already
 * completed: soccer replaces the run and is never added on top.
 */
export function canCompleteSession(
  session: PlannedSession,
  logs: readonly SessionLog[],
  groupMembers: readonly PlannedSession[],
): LogPermission {
  if (!session.choiceGroupId) return { allowed: true }
  const other = groupMembers.find((m) => m.id !== session.id && isDone(latestLog(m.id, logs)))
  if (!other) return { allowed: true }
  return {
    allowed: false,
    reason: `${other.title} is already logged for this day. It replaces this session; delete that result first to switch.`,
  }
}
