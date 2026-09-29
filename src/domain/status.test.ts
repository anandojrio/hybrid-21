import { getChoiceGroup, getSession } from '../data/training-plan'
import {
  canCompleteSession,
  deriveSessionStatus,
  resolveChoiceGroup,
  resolveSessionState,
} from './status'
import type { SessionLog } from './types'

const t = (m: number) => `2026-10-01T10:${String(m).padStart(2, '0')}:00.000Z`

const simple = (sessionId: string, updatedAt = t(0)): SessionLog => ({
  id: `log-${sessionId}-${updatedAt}`,
  sessionId,
  date: '2026-10-01',
  kind: 'simple',
  status: 'completed',
  createdAt: updatedAt,
  updatedAt,
})

const skip = (sessionId: string, updatedAt = t(0)): SessionLog => ({
  id: `skip-${sessionId}-${updatedAt}`,
  sessionId,
  date: '2026-10-01',
  kind: 'skip',
  status: 'skipped',
  reason: 'work',
  createdAt: updatedAt,
  updatedAt,
})

describe('session status derivation', () => {
  it('is planned without logs and reverts to planned when the log is deleted', () => {
    expect(deriveSessionStatus('w02-wed-ice', [simple('w02-wed-ice')])).toBe('completed')
    expect(deriveSessionStatus('w02-wed-ice', [])).toBe('planned')
  })

  it('uses the most recently updated log', () => {
    const logs = [simple('w02-wed-ice', t(1)), skip('w02-wed-ice', t(5))]
    expect(deriveSessionStatus('w02-wed-ice', logs)).toBe('skipped')
  })
})

describe('Thursday either/or', () => {
  const run = getSession('w02-thu-run')!
  const soc = getSession('w02-thu-soc')!
  const group = getChoiceGroup('w02-thu-choice')

  it('completing soccer satisfies the group and marks the run as replaced', () => {
    const logs = [simple(soc.id)]
    expect(resolveChoiceGroup(group, logs)).toEqual({
      status: 'completed',
      chosenSessionId: soc.id,
    })
    expect(resolveSessionState(run, logs, group)).toEqual({ status: 'planned', replacedBy: soc.id })
    expect(resolveSessionState(soc, logs, group).status).toBe('completed')
  })

  it('does not allow completing both options', () => {
    const logs = [simple(soc.id)]
    expect(canCompleteSession(run, logs, group).allowed).toBe(false)
    expect(canCompleteSession(soc, logs, group).allowed).toBe(true)
    expect(canCompleteSession(run, [], group).allowed).toBe(true)
  })

  it('treats the group as skipped only when nothing was completed', () => {
    expect(resolveChoiceGroup(group, [skip(run.id)]).status).toBe('skipped')
    expect(resolveChoiceGroup(group, [skip(run.id), simple(soc.id)]).status).toBe('completed')
    expect(resolveChoiceGroup(group, []).status).toBe('planned')
  })

  it('does not apply to sessions outside a choice group', () => {
    const push = getSession('w02-thu-push')!
    expect(canCompleteSession(push, [simple(soc.id)], []).allowed).toBe(true)
  })
})
