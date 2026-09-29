import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { initStorage, StorageError, type Repositories } from '@/db'
import { requestPersistentStorage } from '@/lib/persistent-storage'
import { LogsProvider } from './logs-store'
import { StorageErrorScreen } from './storage-error-screen'

const RepositoriesContext = createContext<Repositories | null>(null)

type State =
  | { status: 'loading' }
  | { status: 'ready'; repositories: Repositories }
  | { status: 'error'; message: string }

interface StorageProviderProps {
  children: ReactNode
  /** Injectable for tests; defaults to the IndexedDB-backed storage. */
  init?: () => Promise<{ repositories: Repositories }>
}

export function StorageProvider({ children, init = initStorage }: StorageProviderProps) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    init()
      .then(({ repositories }) => {
        if (cancelled) return
        setState({ status: 'ready', repositories })
        void requestPersistentStorage()
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          message:
            error instanceof StorageError
              ? error.message
              : 'Local storage could not be opened on this device.',
        })
      })
    return () => {
      cancelled = true
    }
  }, [init, attempt])

  if (state.status === 'loading') return null
  if (state.status === 'error') {
    return (
      <StorageErrorScreen
        message={state.message}
        onRetry={() => {
          setState({ status: 'loading' })
          setAttempt((n) => n + 1)
        }}
      />
    )
  }
  return (
    <RepositoriesContext.Provider value={state.repositories}>
      <LogsProvider repositories={state.repositories}>{children}</LogsProvider>
    </RepositoriesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRepositories(): Repositories {
  const repositories = useContext(RepositoriesContext)
  if (!repositories) throw new Error('useRepositories must be used inside StorageProvider')
  return repositories
}
