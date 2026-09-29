/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SESSION_TYPES } from '../domain/types'

const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

/** Resolves `--name` to a hex color, following `var(--other)` references. */
function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(tokensCss)
  if (!match) throw new Error(`Missing token --${name}`)
  const value = match[1]!.trim()
  const ref = /^var\(--([\w-]+)\)$/.exec(value)
  return ref ? token(ref[1]!) : value
}

function luminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const AA = 4.5

describe('design tokens meet WCAG AA contrast', () => {
  it.each(SESSION_TYPES)('%s badge text on its type color', (type) => {
    expect(contrast(token(`type-${type}-fg`), token(`type-${type}`))).toBeGreaterThanOrEqual(AA)
  })

  it.each(['page', 'surface', 'surface-2'])('ink and muted ink on %s', (bg) => {
    expect(contrast(token('ink'), token(bg))).toBeGreaterThanOrEqual(AA)
    expect(contrast(token('ink-muted'), token(bg))).toBeGreaterThanOrEqual(AA)
  })

  it.each(['completed', 'modified', 'skipped'])('%s status text', (status) => {
    expect(
      contrast(token(`status-${status}-fg`), token(`status-${status}`)),
    ).toBeGreaterThanOrEqual(AA)
  })

  it('primary button, inverse text and links', () => {
    expect(contrast(token('primary-foreground'), token('primary'))).toBeGreaterThanOrEqual(AA)
    expect(contrast(token('ink-inverse'), token('charcoal'))).toBeGreaterThanOrEqual(AA)
    expect(contrast(token('ocean'), token('page'))).toBeGreaterThanOrEqual(AA)
    expect(contrast(token('danger'), token('surface'))).toBeGreaterThanOrEqual(AA)
  })
})
