import { MotionConfig, useReducedMotion } from 'motion/react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/** `system` follows iPhone Reduce Motion; `always` plays animations regardless. */
export type MotionPreference = 'system' | 'always'

const STORAGE_KEY = 'hybrid21.motion'

function readPreference(): MotionPreference {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'always' ? 'always' : 'system'
  } catch {
    return 'system'
  }
}

interface MotionPreferenceValue {
  preference: MotionPreference
  setPreference: (next: MotionPreference) => void
  /** True when animations should be skipped. */
  reduceMotion: boolean
}

const MotionPreferenceContext = createContext<MotionPreferenceValue | null>(null)

/**
 * App-wide animation setting. A per-device convenience, so it lives in localStorage and
 * falls back to following the system when storage is unavailable.
 */
export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setState] = useState<MotionPreference>(readPreference)
  const systemReduced = useReducedMotion() ?? false

  const setPreference = useCallback((next: MotionPreference) => {
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
  }, [])

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      reduceMotion: preference === 'system' && systemReduced,
    }),
    [preference, setPreference, systemReduced],
  )

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={preference === 'always' ? 'never' : 'user'}>
        {children}
      </MotionConfig>
    </MotionPreferenceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMotionPreference(): MotionPreferenceValue {
  const value = useContext(MotionPreferenceContext)
  return value ?? { preference: 'system', setPreference: () => undefined, reduceMotion: false }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReduceMotion(): boolean {
  return useMotionPreference().reduceMotion
}
