import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BACKUP_FORMAT, BACKUP_VERSION } from '@/db/backup'
import { renderApp } from '@/test/render-app'

const NOW = new Date(2026, 9, 2, 20)

const saved: File[] = []
vi.mock('@/lib/save-files', () => ({
  saveFiles: async (files: { name: string; type: string; content: string }[]) => {
    saved.push(...files.map((f) => new File([f.content], f.name, { type: f.type })))
    return true
  },
}))

afterEach(() => {
  saved.length = 0
  vi.useRealTimers()
})

const backupFile = (sessionLogs: unknown[]) =>
  new File(
    [
      JSON.stringify({
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: '2026-10-01T10:00:00.000Z',
        sessionLogs,
        checkIns: [],
      }),
    ],
    'backup.json',
    { type: 'application/json' },
  )

const iceLog = {
  id: 'log-ice',
  sessionId: 'w02-wed-ice',
  date: '2026-09-30',
  kind: 'simple',
  status: 'completed',
  createdAt: '2026-09-30T20:00:00.000Z',
  updatedAt: '2026-09-30T20:00:00.000Z',
}

describe('Settings', () => {
  it('exports a JSON backup, records the time and clears the reminder on Today', async () => {
    renderApp('/settings', NOW)
    expect(await screen.findByText('Never')).toBeInTheDocument()
    expect(await screen.findByRole('note')).toHaveTextContent('No backup in the last 7 days')

    await userEvent.click(screen.getByRole('button', { name: /Export backup \(JSON\)/ }))
    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0]!.name).toBe('hybrid21-backup-2026-10-02.json')
    const json = JSON.parse(await saved[0]!.text()) as { format: string; sessionLogs: unknown[] }
    expect(json.format).toBe(BACKUP_FORMAT)
    expect(json.sessionLogs).toHaveLength(1)
    expect(await screen.findByText('Oct 2, 2026 · 20:00')).toBeInTheDocument()
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('exports two CSV files', async () => {
    renderApp('/settings', NOW)
    await userEvent.click(await screen.findByRole('button', { name: /Export logs as CSV/ }))
    await waitFor(() =>
      expect(saved.map((f) => f.name)).toEqual([
        'hybrid21-sessions-2026-10-02.csv',
        'hybrid21-gym-exercises-2026-10-02.csv',
      ]),
    )
  })

  it('restores a valid backup after confirmation, and imports it only once', async () => {
    renderApp('/settings', NOW)
    const input = await screen.findByLabelText('Backup file')
    fireEvent.change(input, { target: { files: [backupFile([iceLog])] } })
    const dialog = await screen.findByRole('alertdialog', { name: 'Restore this backup?' })
    expect(dialog).toHaveTextContent('1 session and 0 check-ins')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Restore' }))
    expect(await screen.findByRole('status')).toHaveTextContent('1 added, 0 updated')

    fireEvent.change(input, { target: { files: [backupFile([iceLog])] } })
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Restore' }),
    )
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('0 added, 0 updated, 1 already'),
    )
  })

  it('shows specific errors for an invalid file and writes nothing', async () => {
    renderApp('/settings', NOW)
    const input = await screen.findByLabelText('Backup file')
    fireEvent.change(input, {
      target: { files: [new File(['{"format":"other"}'], 'x.json')] },
    })
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('This file is not a Hybrid 21 backup.')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('reminds about backups on Today and links to Settings', async () => {
    const router = renderApp('/', NOW)
    await userEvent.click(await screen.findByRole('button', { name: /Back up your logs/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/settings'))
  })
})
