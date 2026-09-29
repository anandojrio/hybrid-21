import { AnimatePresence, motion } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import type { SessionType } from '@/domain/types'
import { SESSION_TYPE_META } from '@/lib/session-types'
import { useReduceMotion } from './motion-preference'

interface Wipe {
  id: number
  color: string
  x: number
  y: number
  to: string
}

type OpenSession = (
  session: { id: string; type: SessionType },
  event?: MouseEvent<HTMLElement>,
  hash?: string,
) => void

const SessionTransitionContext = createContext<OpenSession | null>(null)

const GROW_S = 0.42
const FADE_S = 0.32

/**
 * Opening a session floods the screen from the tap point in that session's color, then
 * the detail screen appears underneath and the color fades into its matching hero.
 */
export function SessionTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const reduceMotion = useReduceMotion()
  const [wipe, setWipe] = useState<Wipe | null>(null)
  const [covered, setCovered] = useState(false)
  const navigatedFor = useRef<number | null>(null)

  const open = useCallback<OpenSession>(
    (session, event, hash = '') => {
      const to = `/session/${session.id}${hash}`
      if (reduceMotion) {
        navigate(to)
        return
      }
      const x = event && event.clientX ? event.clientX : window.innerWidth / 2
      const y = event && event.clientY ? event.clientY : window.innerHeight / 2
      setCovered(false)
      setWipe({ id: Date.now(), color: SESSION_TYPE_META[session.type].color, x, y, to })
    },
    [navigate, reduceMotion],
  )

  const radius = useMemo(() => Math.hypot(window.innerWidth, window.innerHeight) + 40, [])

  return (
    <SessionTransitionContext.Provider value={open}>
      {children}
      <AnimatePresence>
        {wipe && !covered ? (
          <motion.div
            key={wipe.id}
            aria-hidden
            className="pointer-events-auto fixed inset-0 z-[60]"
            style={{ backgroundColor: wipe.color }}
            initial={{ clipPath: `circle(0px at ${wipe.x}px ${wipe.y}px)` }}
            animate={{ clipPath: `circle(${radius}px at ${wipe.x}px ${wipe.y}px)` }}
            exit={{ opacity: 0, transition: { duration: FADE_S, ease: 'easeOut' } }}
            transition={{ duration: GROW_S, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={() => {
              // Fires again after the exit fade; navigate only once per wipe.
              if (navigatedFor.current === wipe.id) return
              navigatedFor.current = wipe.id
              navigate(wipe.to)
              // Let the detail screen mount under the color before it fades away.
              requestAnimationFrame(() => setCovered(true))
            }}
          />
        ) : null}
      </AnimatePresence>
    </SessionTransitionContext.Provider>
  )
}

/** Opens a session detail screen with the color transition. */
// eslint-disable-next-line react-refresh/only-export-components
export function useOpenSession(): OpenSession {
  const open = useContext(SessionTransitionContext)
  const navigate = useNavigate()
  return open ?? ((session, _event, hash = '') => navigate(`/session/${session.id}${hash}`))
}
