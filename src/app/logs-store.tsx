import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { MorningCheckInInput, Repositories, SessionLogInput } from '@/db'
import type { MorningCheckIn, SessionLog } from '@/domain/types'

interface LogsContextValue {
  logs: SessionLog[]
  checkIns: MorningCheckIn[]
  loaded: boolean
  saveLog: (input: SessionLogInput) => Promise<SessionLog>
  deleteLog: (id: string) => Promise<void>
  saveCheckIn: (input: MorningCheckInInput) => Promise<MorningCheckIn>
  deleteCheckIn: (id: string) => Promise<void>
  /** Reloads from storage, e.g. after a restore. */
  reload: () => Promise<void>
}

const LogsContext = createContext<LogsContextValue | null>(null)

/**
 * In-memory view of the logs, loaded through the repositories. Every mutation goes to
 * storage first; the view updates only after the write succeeded.
 */
export function LogsProvider({
  repositories,
  children,
}: {
  repositories: Repositories
  children: ReactNode
}) {
  const [logs, setLogs] = useState<SessionLog[]>([])
  const [checkIns, setCheckIns] = useState<MorningCheckIn[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(
    () => Promise.all([repositories.sessionLogs.list(), repositories.checkIns.list()]),
    [repositories],
  )

  const reload = useCallback(async () => {
    const [nextLogs, nextCheckIns] = await load()
    setLogs(nextLogs)
    setCheckIns(nextCheckIns)
    setLoaded(true)
  }, [load])

  useEffect(() => {
    let cancelled = false
    load().then(([nextLogs, nextCheckIns]) => {
      if (cancelled) return
      setLogs(nextLogs)
      setCheckIns(nextCheckIns)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  const value = useMemo<LogsContextValue>(
    () => ({
      logs,
      checkIns,
      loaded,
      reload,
      saveLog: async (input) => {
        const saved = await repositories.sessionLogs.save(input)
        setLogs((current) => [...current.filter((l) => l.sessionId !== saved.sessionId), saved])
        return saved
      },
      deleteLog: async (id) => {
        await repositories.sessionLogs.delete(id)
        setLogs((current) => current.filter((l) => l.id !== id))
      },
      saveCheckIn: async (input) => {
        const saved = await repositories.checkIns.save(input)
        setCheckIns((current) => [...current.filter((c) => c.sessionId !== saved.sessionId), saved])
        return saved
      },
      deleteCheckIn: async (id) => {
        await repositories.checkIns.delete(id)
        setCheckIns((current) => current.filter((c) => c.id !== id))
      },
    }),
    [logs, checkIns, loaded, reload, repositories],
  )

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogs(): LogsContextValue {
  const value = useContext(LogsContext)
  if (!value) throw new Error('useLogs must be used inside LogsProvider')
  return value
}
