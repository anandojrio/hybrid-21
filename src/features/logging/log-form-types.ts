import type { SessionLogInput } from '@/db'
import type { PlannedSession, SessionLog } from '@/domain/types'

export interface LogFormProps<L extends SessionLog = SessionLog> {
  session: PlannedSession
  /** Existing log when editing; its values prefill the form. */
  log?: L
  onSubmitLog: (input: SessionLogInput) => Promise<void>
  onDirtyChange: (dirty: boolean) => void
}
