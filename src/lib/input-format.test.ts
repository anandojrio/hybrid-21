import { formatPaceDigits, formatTimeDigits, secondsToTimeInput } from './input-format'

describe('masked inputs', () => {
  it('builds hh:mm:ss from typed digits', () => {
    expect(formatTimeDigits('3')).toBe('3')
    expect(formatTimeDigits('302')).toBe('3:02')
    expect(formatTimeDigits('3022')).toBe('30:22')
    expect(formatTimeDigits('13022')).toBe('1:30:22')
    expect(formatTimeDigits('003022')).toBe('00:30:22')
    expect(formatTimeDigits('30:2')).toBe('3:02')
  })

  it('builds m:ss pace', () => {
    expect(formatPaceDigits('645')).toBe('6:45')
    expect(formatPaceDigits('1005')).toBe('10:05')
  })

  it('prefills times from seconds', () => {
    expect(secondsToTimeInput(1822)).toBe('30:22')
    expect(secondsToTimeInput(3900)).toBe('1:05:00')
    expect(secondsToTimeInput(undefined)).toBe('')
  })
})
