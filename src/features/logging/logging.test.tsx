import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Repositories } from '@/db'
import type { GymLog } from '@/domain/types'
import { renderApp } from '@/test/render-app'

const TUE_SEP_29 = new Date(2026, 8, 29, 18, 0)
const WED_SEP_30 = new Date(2026, 8, 30, 7, 0)
const MON_OCT_5 = new Date(2026, 9, 5, 18, 0)
const FRI_OCT_9 = new Date(2026, 9, 9, 18, 0)

afterEach(() => {
  vi.useRealTimers()
})

async function openForm(cardName: string) {
  const card = await screen.findByRole('article', { name: cardName })
  await userEvent.click(within(card).getByRole('button', { name: 'Mark as complete' }))
  return { card, dialog: await screen.findByRole('dialog', { name: /^Log / }) }
}

describe('running form', () => {
  it('validates required Garmin fields inline and does not change status', async () => {
    renderApp('/', TUE_SEP_29)
    const { card, dialog } = await openForm('RUN Easy 35 min')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    expect(await within(dialog).findByText('Distance is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Time is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Avg Pace is required.')).toBeInTheDocument()
    expect(within(card).getByText('Planned')).toBeInTheDocument()
  })

  it('formats time and pace from digits, warns on pace mismatch, and saves', async () => {
    renderApp('/', TUE_SEP_29)
    const { card, dialog } = await openForm('RUN Easy 35 min')
    const d = within(dialog)
    await userEvent.type(d.getByLabelText(/Distance/), '5,2')
    await userEvent.type(d.getByLabelText(/^Time,/), '3510')
    expect(d.getByLabelText(/^Time,/)).toHaveValue('35:10')
    await userEvent.type(d.getByLabelText(/Avg Pace/), '615')
    expect(d.getByLabelText(/Avg Pace/)).toHaveValue('6:15')
    expect(await d.findByText(/Time ÷ distance gives 6:46\/km/)).toBeInTheDocument()
    await userEvent.type(d.getByLabelText(/Avg HR/), '141')
    await userEvent.type(d.getByLabelText(/Max HR/), '160')
    await userEvent.click(d.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /^Log / })).not.toBeInTheDocument(),
    )
    expect(await within(card).findByText('Completed')).toBeInTheDocument()
    await userEvent.click(within(card).getByRole('link', { name: 'View result' }))
    expect(await screen.findByText('5.20 km')).toBeInTheDocument()
    // The Garmin value is kept, not overwritten by the computed pace.
    expect(screen.getByText('6:15 /km')).toBeInTheDocument()
  })

  it('rejects Max HR below Avg HR', async () => {
    renderApp('/', TUE_SEP_29)
    const { dialog } = await openForm('RUN Easy 35 min')
    const d = within(dialog)
    await userEvent.type(d.getByLabelText(/Distance/), '5')
    await userEvent.type(d.getByLabelText(/^Time,/), '3500')
    await userEvent.type(d.getByLabelText(/Avg Pace/), '700')
    await userEvent.type(d.getByLabelText(/Avg HR/), '150')
    await userEvent.type(d.getByLabelText(/Max HR/), '140')
    await userEvent.click(d.getByRole('button', { name: 'Save' }))
    expect(await d.findByText('Max HR cannot be lower than Avg HR.')).toBeInTheDocument()
  })

  it('asks before discarding an unsaved draft', async () => {
    renderApp('/', TUE_SEP_29)
    const { card, dialog } = await openForm('RUN Easy 35 min')
    await userEvent.type(within(dialog).getByLabelText(/Distance/), '5')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    const confirm = await screen.findByRole('alertdialog', { name: 'Discard changes?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Keep editing' }))
    expect(within(dialog).getByLabelText(/Distance/)).toHaveValue('5')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /^Log / })).not.toBeInTheDocument(),
    )
    expect(within(card).getByText('Planned')).toBeInTheDocument()
  })
})

const previousLeg = async (r: Repositories) => {
  await r.sessionLogs.save({
    sessionId: 'w02-mon-leg',
    date: '2026-09-28',
    kind: 'gym',
    status: 'completed',
    exercises: [
      { exerciseId: 'back-squat', kind: 'loaded', setsCompleted: 3, totalReps: 15, loadKg: 80 },
      {
        exerciseId: 'reverse-lunge-or-bss',
        kind: 'unilateral',
        setsCompleted: 2,
        repsPerSide: 14,
        loadKg: 16,
      },
    ],
  })
}

describe('gym form', () => {
  it('prefills last results, shows Last time, and saves unchanged values as-is', async () => {
    renderApp('/', MON_OCT_5, previousLeg)
    const { card, dialog } = await openForm('LEG Leg Strength')
    const d = within(dialog)
    const squat = await d.findByRole('button', { name: 'Back squat: 3 sets · 15 reps · 80 kg' })
    expect(within(squat).getByText(/Last time: 3 sets · 15 reps · 80 kg/)).toBeInTheDocument()
    expect(
      d.getByRole('button', {
        name: 'Reverse lunge or Bulgarian split squat: 2 sets · 14 reps per side · 16 kg',
      }),
    ).toBeInTheDocument()
    expect(d.getByRole('button', { name: 'Low pogo hops: Tap to enter' })).toBeInTheDocument()
    // Missing planned exercises switch the session to modified unless turned off.
    expect(d.getByRole('switch', { name: /Performed differently/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    await userEvent.click(d.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /^Log / })).not.toBeInTheDocument(),
    )
    expect(await within(card).findByText('Modified')).toBeInTheDocument()
  })

  it('edits one exercise in its popover', async () => {
    renderApp('/', MON_OCT_5, previousLeg)
    const { dialog } = await openForm('LEG Leg Strength')
    await userEvent.click(await within(dialog).findByRole('button', { name: /^Back squat:/ }))
    const load = screen.getByLabelText(/^Load/)
    await userEvent.clear(load)
    await userEvent.type(load, '82,5')
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(
      await within(dialog).findByRole('button', { name: 'Back squat: 3 sets · 15 reps · 82.5 kg' }),
    ).toBeInTheDocument()
  })

  it('shows pull-ups as bodyweight with no added load', async () => {
    renderApp('/', FRI_OCT_9, async (r) => {
      await r.sessionLogs.save({
        sessionId: 'w02-fri-pull',
        date: '2026-10-02',
        kind: 'gym',
        status: 'completed',
        exercises: [
          { exerciseId: 'pull-up', kind: 'bodyweight-loadable', setsCompleted: 4, totalReps: 34 },
        ],
      })
    })
    const { dialog } = await openForm('PULL Upper Body')
    expect(
      await within(dialog).findByRole('button', {
        name: 'Pull-ups: 4 sets · 34 reps · bodyweight',
      }),
    ).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /^Log / })).not.toBeInTheDocument(),
    )
  })
})

describe('mobility form', () => {
  it('preselects the planned core session and saves not-as-prescribed as modified', async () => {
    renderApp('/', TUE_SEP_29)
    const { card, dialog } = await openForm('MOB Mobility + Core B')
    const d = within(dialog)
    expect(d.getByRole('radio', { name: 'Session B' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(d.getByRole('radio', { name: 'No' }))
    await userEvent.type(d.getByLabelText(/Duration/), '25')
    await userEvent.click(d.getByRole('button', { name: 'Save' }))
    expect(await within(card).findByText('Modified')).toBeInTheDocument()
  })
})

describe('morning check-in', () => {
  it('prompts the morning after a logged run and saves the check-in', async () => {
    const saveRun = async (r: Repositories) => {
      await r.sessionLogs.save({
        sessionId: 'w02-tue-run',
        date: '2026-09-29',
        kind: 'run',
        status: 'completed',
        result: { distanceKm: 5, durationSec: 2100, avgPaceSecPerKm: 420, avgHr: 140, maxHr: 155 },
      })
    }
    renderApp('/', WED_SEP_30, saveRun)
    const prompt = await screen.findByRole('region', { name: 'Morning check-in' })
    await userEvent.click(within(prompt).getByRole('button', { name: 'Check in' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Save check-in' }))
    expect(await screen.findByText('Fill in at least one check-in value.')).toBeInTheDocument()

    const energy = screen.getByRole('slider', { name: 'Energy' })
    energy.focus()
    fireEvent.keyDown(energy, { key: 'ArrowRight' })
    fireEvent.keyDown(energy, { key: 'ArrowRight' })
    await userEvent.click(screen.getByRole('button', { name: 'Save check-in' }))
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Morning check-in' })).not.toBeInTheDocument(),
    )
  })
})

describe('gym log shape', () => {
  it('stores only working-set results, never warm-ups', async () => {
    let saved: GymLog | undefined
    renderApp('/', MON_OCT_5, async (r) => {
      await previousLeg(r)
      const original = r.sessionLogs.save.bind(r.sessionLogs)
      r.sessionLogs.save = async (input) => {
        const log = await original(input)
        if (log.kind === 'gym' && log.sessionId === 'w03-mon-leg') saved = log
        return log
      }
    })
    const { dialog } = await openForm('LEG Leg Strength')
    await within(dialog).findByRole('button', { name: /^Back squat:/ })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saved).toBeDefined())
    expect(saved!.exercises.map((e) => e.exerciseId)).toEqual([
      'back-squat',
      'reverse-lunge-or-bss',
    ])
  })
})
