import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { StorageProvider } from '@/app/storage-provider'
import { createRepositories, HybridDatabase, type Repositories } from '@/db'
import { openDatabase } from '@/db/database'

let counter = 0

/**
 * Renders the full app at `path` with the system date fixed to `now` and a fresh
 * IndexedDB (seed migration applied). `seed` can add logs before the first render.
 */
export function renderApp(
  path: string,
  now: Date,
  seed?: (repositories: Repositories) => Promise<void>,
) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  const init = async () => {
    const db = new HybridDatabase(`app-${Date.now()}-${counter++}`)
    await openDatabase(db, now)
    const repositories = createRepositories(db)
    await seed?.(repositories)
    return { repositories }
  }
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <StorageProvider init={init}>
      <RouterProvider router={router} />
    </StorageProvider>,
  )
  return router
}
