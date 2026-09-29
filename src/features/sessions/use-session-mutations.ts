import { toast } from 'sonner'
import { useLogs } from '@/app/logs-store'
import type { PlannedSession, SkipReason } from '@/domain/types'
import { SESSION_TYPE_META } from '@/lib/session-types'

export function useSessionMutations() {
  const { saveLog, deleteLog } = useLogs()

  return {
    /** ICE and SOC: saved immediately with no form, with a short undo window. */
    completeSimple: async (session: PlannedSession) => {
      const saved = await saveLog({
        sessionId: session.id,
        date: session.date,
        kind: 'simple',
        status: 'completed',
      })
      toast.success(`${SESSION_TYPE_META[session.type].label} marked complete`, {
        duration: 6000,
        action: {
          label: 'Undo',
          onClick: () => void deleteLog(saved.id),
        },
      })
      return saved
    },

    skip: async (session: PlannedSession, reason: SkipReason, note?: string) => {
      await saveLog({
        sessionId: session.id,
        date: session.date,
        kind: 'skip',
        status: 'skipped',
        reason,
        note,
      })
    },

    removeLog: (id: string) => deleteLog(id),
  }
}
