import { notchBarPath } from './notch-path'

const base = {
  width: 358,
  height: 64,
  cornerRadius: 22,
  notchRadius: 28,
  shoulder: 10,
  depth: 28,
}

describe('notchBarPath', () => {
  it('returns nothing before the bar is measured', () => {
    expect(notchBarPath({ ...base, width: 0, center: 0 })).toBe('')
  })

  it('dips to the notch depth at the requested center', () => {
    const d = notchBarPath({ ...base, center: 179 })
    expect(d.startsWith('M 22 0')).toBe(true)
    expect(d).toContain('179 28')
    expect(d.endsWith('Z')).toBe(true)
  })

  it('keeps the notch clear of the rounded corners at the edges', () => {
    const first = notchBarPath({ ...base, center: 10 })
    const last = notchBarPath({ ...base, center: 350 })
    // Center is clamped to cornerRadius + 0.6 × notchRadius (38.8) from each edge.
    expect(first).toContain(' 38.8 28')
    expect(last).toContain(' 319.2 28')
  })
})
