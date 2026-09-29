import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { StorageProvider } from '@/app/storage-provider'
import { createRepositories, HybridDatabase } from '@/db'
import { openDatabase } from '@/db/database'

let counter = 0

function renderAt(path: string, now: Date) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  const init = async () => {
    const db = new HybridDatabase(`phase6-${counter++}`)
    await openDatabase(db, now)
    return { repositories: createRepositories(db) }
  }
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <StorageProvider init={init}>
      <RouterProvider router={router} />
    </StorageProvider>,
  )
  return router
}

const TUE_SEP_29 = new Date(2026, 8, 29, 9, 0)
const WED_SEP_30 = new Date(2026, 8, 30, 9, 0)
const THU_OCT_1 = new Date(2026, 9, 1, 9, 0)

afterEach(() => {
  vi.useRealTimers()
})

describe('Today', () => {
  it('shows date, week, today’s sessions in order and a tomorrow preview', async () => {
    renderAt('/', TUE_SEP_29)
    expect(await screen.findByText('Tuesday, September 29 · Week 2')).toBeInTheDocument()
    const cards = await screen.findAllByRole('article')
    expect(cards.map((c) => c.getAttribute('aria-label'))).toEqual([
      'RUN Easy 35 min',
      'MOB Mobility + Core B',
    ])
    expect(screen.getByText(/Tomorrow · Wed, Sep 30/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Start workout/i })).not.toBeInTheDocument()
  })

  it('completes ICE with one tap, no form, and can undo', async () => {
    renderAt('/', WED_SEP_30)
    const card = await screen.findByRole('article', { name: 'ICE Ice Hockey' })
    await userEvent.click(within(card).getByRole('button', { name: 'Mark as complete' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await within(card).findByText('Completed')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(await within(card).findByText('Planned')).toBeInTheDocument()
  })

  it('logs soccer with one tap on the either/or card and marks the run replaced', async () => {
    renderAt('/', THU_OCT_1)
    const card = await screen.findByRole('article', {
      name: 'Either/or: Recovery/Easy 25–30 min or soccer',
    })
    await userEvent.click(within(card).getByRole('button', { name: 'Played soccer' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await within(card).findByText('Replaced by soccer today.')).toBeInTheDocument()
    expect(within(card).getByText('Completed')).toBeInTheDocument()
    expect(within(card).queryByRole('button', { name: 'Log run' })).not.toBeInTheDocument()
  })

  it('opens the logging form for a run instead of changing status', async () => {
    renderAt('/', TUE_SEP_29)
    const card = await screen.findByRole('article', { name: 'RUN Easy 35 min' })
    await userEvent.click(within(card).getByRole('button', { name: 'Mark as complete' }))
    expect(await screen.findByRole('dialog', { name: 'Log Easy 35 min' })).toBeInTheDocument()
    expect(within(card).getByText('Planned')).toBeInTheDocument()
  })

  it('skips with a required reason and can undo the skip', async () => {
    renderAt('/', TUE_SEP_29)
    const card = await screen.findByRole('article', { name: 'RUN Easy 35 min' })
    await userEvent.click(within(card).getByRole('button', { name: 'Skip workout' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Save skip' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a reason.')
    await userEvent.click(screen.getByRole('button', { name: 'Work' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save skip' }))
    expect(await within(card).findByText('Skipped · Work')).toBeInTheDocument()
    expect(within(card).getByText('Skipped')).toBeInTheDocument()

    await userEvent.click(within(card).getByRole('button', { name: 'Undo skip' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Undo skip' }))
    await waitFor(() => expect(within(card).getByText('Planned')).toBeInTheDocument())
  })
})

describe('Session detail', () => {
  it('shows no actions for future sessions', async () => {
    renderAt('/session/w03-mon-leg', TUE_SEP_29)
    expect(await screen.findByRole('heading', { name: 'Leg Strength' })).toBeInTheDocument()
    expect(screen.getByText('Planned for Mon, Oct 5')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as complete' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Skip workout' })).not.toBeInTheDocument()
  })

  it('shows the immutable prescription and the seeded Sep 22 result separately', async () => {
    renderAt('/session/w01-tue-run', TUE_SEP_29)
    expect(await screen.findByRole('heading', { name: 'Easy 30 min' })).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('4.50 km')).toBeInTheDocument()
    expect(screen.getByText('≈ 6:45 /km')).toBeInTheDocument()
    expect(screen.getByText('30 min easy; run-walk allowed')).toBeInTheDocument()
  })
})

describe('Plan', () => {
  it('navigates weeks and opens a day sheet leading to the session', async () => {
    const router = renderAt('/plan', TUE_SEP_29)
    expect(await screen.findByText('Week 2 · Sep 28 – Oct 4')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(await screen.findByText('Week 3 · Oct 5 – Oct 11')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /^Wednesday, October 7/ }))
    const sheet = await screen.findByRole('dialog', { name: 'Wednesday, October 7' })
    await userEvent.click(within(sheet).getByRole('button', { name: /Ice Hockey/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/session/w03-wed-ice'))

    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(await screen.findByText('Week 3 · Oct 5 – Oct 11')).toBeInTheDocument()
  })

  it('reflects logged status in the week strip', async () => {
    renderAt('/plan?day=2026-09-22', TUE_SEP_29)
    expect(
      await screen.findByRole('button', {
        name: /^Tuesday, September 22: RUN completed, MOB planned/,
      }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(await screen.findByText('Week 2 · Sep 28 – Oct 4')).toBeInTheDocument()
  })
})
