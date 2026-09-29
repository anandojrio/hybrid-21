import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { createRepositories, HybridDatabase, StorageError } from '@/db'
import { routes } from './routes'
import { StorageProvider } from './storage-provider'

let counter = 0
const workingStorage = async () => {
  const db = new HybridDatabase(`shell-${counter++}`)
  await db.open()
  return { repositories: createRepositories(db) }
}

function renderApp(path = '/', init = workingStorage) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <StorageProvider init={init}>
      <RouterProvider router={router} />
    </StorageProvider>,
  )
  return router
}

describe('app shell', () => {
  it('opens on Today with five icon-only tabs', async () => {
    renderApp()
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.querySelectorAll('a')).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page')
  })

  it('navigates between tabs', async () => {
    const router = renderApp()
    await userEvent.click(await screen.findByRole('link', { name: 'Plan' }))
    expect(await screen.findByRole('heading', { name: 'Plan' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/plan')
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page')
  })

  it('opens Settings from the header without the tab bar and goes back', async () => {
    const router = renderApp('/library')
    await userEvent.click(await screen.findByRole('link', { name: 'Settings' }))
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'Library' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/library')
  })

  it('sends unknown paths to Today', async () => {
    renderApp('/nope')
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument()
  })

  it('shows the offline indicator only while offline', async () => {
    renderApp()
    await screen.findByRole('heading', { name: 'Today' })
    expect(screen.queryByText(/Offline/)).not.toBeInTheDocument()
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    act(() => window.dispatchEvent(new Event('offline')))
    expect(
      await screen.findByText(/Offline · everything is saved on this device/),
    ).toBeInTheDocument()
    onLine.mockReturnValue(true)
    act(() => window.dispatchEvent(new Event('online')))
    onLine.mockRestore()
  })
})

describe('storage failure', () => {
  it('explains the problem and retries', async () => {
    let fail = true
    const init = vi.fn(async () => {
      if (fail) throw new StorageError('Local storage is unavailable.')
      return workingStorage()
    })
    renderApp('/', init)
    expect(await screen.findByRole('heading', { name: 'Storage unavailable' })).toBeInTheDocument()
    expect(screen.getByText('Local storage is unavailable.')).toBeInTheDocument()
    fail = false
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(init).toHaveBeenCalledTimes(2)
  })
})
