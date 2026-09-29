import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getVisibleSessionsForDate, RACE_DATE } from '@/data/training-plan'
import { addDays } from '@/lib/dates'
import { WeekStrip, type WeekStripDay } from './week-strip'

const days = (start: string): WeekStripDay[] =>
  Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    return {
      date,
      isRace: date === RACE_DATE,
      sessions: getVisibleSessionsForDate(date).map((s) => ({
        type: s.type,
        status: 'planned' as const,
      })),
    }
  })

describe('WeekStrip', () => {
  it('labels each day with its sessions and statuses for screen readers', () => {
    render(
      <WeekStrip
        title="Week 2"
        days={days('2026-09-28')}
        selectedDate="2026-09-29"
        today="2026-09-29"
        onSelectDate={() => undefined}
      />,
    )
    expect(
      screen.getByRole('button', {
        name: 'Tuesday, September 29: today: RUN planned, MOB planned',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', {
        name: 'Thursday, October 1: PUSH planned, RUN planned',
      }),
    ).toBeInTheDocument()
  })

  it('marks race day', () => {
    render(
      <WeekStrip
        title="Week 12"
        days={days('2026-12-07')}
        selectedDate="2026-12-07"
        today="2026-09-29"
        onSelectDate={() => undefined}
      />,
    )
    expect(
      screen.getByRole('button', { name: /Saturday, December 12: race day: RACE planned/ }),
    ).toBeInTheDocument()
  })

  it('selects days and navigates weeks', async () => {
    const onSelectDate = vi.fn()
    const onPrevWeek = vi.fn()
    const onNextWeek = vi.fn()
    const onToday = vi.fn()
    render(
      <WeekStrip
        title="Week 2"
        days={days('2026-09-28')}
        selectedDate="2026-09-29"
        today="2026-09-29"
        onSelectDate={onSelectDate}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onToday={onToday}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /^Friday, October 2/ }))
    expect(onSelectDate).toHaveBeenCalledWith('2026-10-02')
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    await userEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(onNextWeek).toHaveBeenCalledOnce()
    expect(onPrevWeek).toHaveBeenCalledOnce()
    expect(onToday).toHaveBeenCalledOnce()
  })
})
