import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookOpen, CalendarDays, ChartNoAxesColumn, History, Sun } from 'lucide-react'
import { BottomNav } from './bottom-nav'

const items = [
  { key: 'today', label: 'Today', href: '/', icon: Sun },
  { key: 'plan', label: 'Plan', href: '/plan', icon: CalendarDays },
  { key: 'history', label: 'History', href: '/history', icon: History },
  { key: 'stats', label: 'Stats', href: '/stats', icon: ChartNoAxesColumn },
  { key: 'library', label: 'Library', href: '/library', icon: BookOpen },
]

describe('BottomNav', () => {
  it('shows five icon-only destinations with accessible names', () => {
    render(<BottomNav items={items} activeKey="plan" onSelect={() => undefined} />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const links = screen.getAllByRole('link')
    expect(nav).toBeInTheDocument()
    expect(links.map((l) => l.getAttribute('aria-label'))).toEqual([
      'Today',
      'Plan',
      'History',
      'Stats',
      'Library',
    ])
    expect(links.every((l) => l.textContent === '')).toBe(true)
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current')
  })

  it('reports the selected destination', async () => {
    const onSelect = vi.fn()
    render(<BottomNav items={items} activeKey="today" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('link', { name: 'Stats' }))
    expect(onSelect).toHaveBeenCalledWith('stats', '/stats')
  })
})
