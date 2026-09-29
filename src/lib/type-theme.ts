import type { CSSProperties } from 'react'
import type { SessionType } from '../domain/types'

/**
 * CSS variables that re-tint everything inside an element in one session type's colors:
 * page and surfaces, section inks, primary buttons, sliders, switches and selections.
 * Used by session cards, the session detail screen and the logging drawers.
 */
export function typeTheme(type: SessionType): CSSProperties {
  const v = (name: string) => `var(--type-${type}${name})`
  return {
    '--page': v('-page'),
    '--surface': v('-surface'),
    '--surface-2': v('-surface-2'),
    '--separator': v('-separator'),
    '--ink-muted': v('-ink-muted'),
    '--primary': v(''),
    '--primary-foreground': v('-fg'),
    '--ring': v(''),
    '--theme-accent': v(''),
    '--theme-accent-fg': v('-fg'),
    '--theme-strong': v('-ink'),
    '--theme-strong-fg': '#ffffff',
    '--theme-ink': v('-ink'),
  } as CSSProperties
}
