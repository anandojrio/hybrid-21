import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { BottomNav } from '@/components/bottom-nav/bottom-nav'
import { OfflineIndicator } from '@/components/offline-indicator'
import { Toaster } from '@/components/ui/sonner'
import { UpdatePrompt } from '@/components/update-prompt'
import { NAV_ITEMS, tabForPath } from './nav-items'
import { MotionPreferenceProvider, useReduceMotion } from './motion-preference'
import { preloadScreens } from './routes'
import { SessionTransitionProvider } from './session-transition'

/**
 * Mobile shell: centered 480 px column, safe areas, animated screen transitions and the
 * floating bottom navigation. Screens without a tab (Settings) hide the navigation.
 */
const EASE = [0.22, 1, 0.36, 1] as const

const screenVariants = {
  enter: (direction: number) =>
    direction ? { opacity: 0, x: direction * 56 } : { opacity: 0, y: 18, scale: 0.985 },
  center: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.34, ease: EASE } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -40,
    transition: { duration: 0.2, ease: EASE },
  }),
}

/** Follows iPhone Reduce Motion unless the owner turns animations always on (Settings). */
export function AppShell() {
  return (
    <MotionPreferenceProvider>
      <Shell />
    </MotionPreferenceProvider>
  )
}

function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()
  const activeTab = tabForPath(location.pathname)
  const tabIndex = NAV_ITEMS.findIndex((item) => item.key === activeTab)
  const reduceMotion = useReduceMotion()

  // Tab switches slide in tab order; other screens rise in. Derived from the previous tab.
  const [tabState, setTabState] = useState({ index: tabIndex, direction: 0 })
  if (tabState.index !== tabIndex) {
    const direction =
      tabIndex === -1 || tabState.index === -1 ? 0 : Math.sign(tabIndex - tabState.index)
    setTabState({ index: tabIndex, direction })
  }
  const direction = tabState.direction

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const id = setTimeout(preloadScreens, 400)
    return () => clearTimeout(id)
  }, [])

  return (
    <SessionTransitionProvider>
      <div className="relative mx-auto flex min-h-dvh max-w-(--app-max-width) flex-col">
        <OfflineIndicator />
        <UpdatePrompt />
        <Toaster />
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.main
            key={location.pathname}
            custom={direction}
            variants={screenVariants}
            initial={reduceMotion ? false : 'enter'}
            animate="center"
            exit={reduceMotion ? undefined : 'exit'}
            className="flex flex-1 flex-col gap-6 px-4 pt-[max(12px,env(safe-area-inset-top))]"
            style={{
              paddingBottom: activeTab
                ? 'calc(var(--nav-height) + 56px + env(safe-area-inset-bottom))'
                : 'calc(24px + env(safe-area-inset-bottom))',
            }}
          >
            {outlet}
          </motion.main>
        </AnimatePresence>

        {activeTab ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-(--app-max-width) px-4 pt-10 pb-[max(12px,env(safe-area-inset-bottom))]">
            {/* Content fades into the page above the floating bar instead of being cut off. */}
            <div
              aria-hidden
              className="from-page via-page/85 absolute inset-0 bg-gradient-to-t from-45% to-transparent"
            />
            <BottomNav
              className="pointer-events-auto drop-shadow-[0_6px_16px_rgba(39,43,58,0.28)]"
              items={NAV_ITEMS}
              activeKey={activeTab}
              onSelect={(_, href) => navigate(href)}
            />
          </div>
        ) : null}
      </div>
    </SessionTransitionProvider>
  )
}
