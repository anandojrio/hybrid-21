import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Repositories } from '@/db'
import { renderApp } from '@/test/render-app'

const NOW = new Date(2026, 9, 2, 20)

afterEach(() => {
  vi.useRealTimers()
})

const seed = async (r: Repositories) => {
  await r.sessionLogs.save({
    sessionId: 'w02-tue-run',
    date: '2026-09-29',
    kind: 'run',
    status: 'completed',
    result: {
      distanceKm: 5.2,
      durationSec: 2110,
      avgPaceSecPerKm: 406,
      avgHr: 141,
      maxHr: 160,
      rpe: 3,
    },
  })
  await r.sessionLogs.save({
    sessionId: 'w02-wed-ice',
    date: '2026-09-30',
    kind: 'simple',
    status: 'completed',
  })
  await r.sessionLogs.save({
    sessionId: 'w02-fri-pull',
    date: '2026-10-02',
    kind: 'skip',
    status: 'skipped',
    reason: 'work',
  })
}

describe('History', () => {
  it('lists logs by week, newest first, with key result, status and RPE', async () => {
    renderApp('/history', NOW, seed)
    const week2 = await screen.findByRole('region', { name: /Week 2/ })
    const links = within(week2).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual([
      expect.stringContaining('Skipped · Work'),
      expect.stringContaining('Ice Hockey'),
      expect.stringContaining('5.20 km · 00:35:10 · 6:46/km · 141 bpm · RPE 3'),
    ])
    expect(screen.getByRole('region', { name: /Week 1/ })).toHaveTextContent('Easy 30 min')
  })

  it('filters by type and by status', async () => {
    renderApp('/history', NOW, seed)
    await screen.findByRole('region', { name: /Week 2/ })
    await userEvent.click(screen.getByRole('button', { name: 'Running' }))
    expect(screen.queryByText('Ice Hockey')).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/session')),
    ).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Skipped' }))
    expect(screen.getByText('Upper Body')).toBeInTheDocument()
    expect(screen.queryByText('Easy 35 min')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Soccer' }))
    expect(screen.getByText('Nothing matches this filter')).toBeInTheDocument()
  })

  it('deletes a result with confirmation; the planned session remains', async () => {
    const router = renderApp('/history', NOW, seed)
    await userEvent.click(await screen.findByRole('link', { name: /Easy 35 min/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/session/w02-tue-run'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete result' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete this result?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Planned')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Easy 35 min' })).toBeInTheDocument()
  })

  it('shows an empty state before anything besides the seed is logged', async () => {
    renderApp('/history?filter=gym', NOW)
    expect(await screen.findByText('Nothing matches this filter')).toBeInTheDocument()
  })
})

describe('Stats', () => {
  it('computes from real logs only and shows empty states otherwise', async () => {
    renderApp('/stats', NOW)
    expect(await screen.findByRole('group', { name: 'Longest run: 4.5 km' })).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Average session RPE: No RPE logged yet' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Log a long run to see this chart.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Strength' }))
    expect(await screen.findByText('No gym results yet')).toBeInTheDocument()
  })
})
