import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { BottomNav } from '@/components/bottom-nav/bottom-nav'
import { OfflineIndicator } from '@/components/offline-indicator'
import { Toaster } from '@/components/ui/sonner'
import { UpdatePrompt } from '@/components/update-prompt'
import { NAV_ITEMS, tabForPath } from './nav-items'

/**
 * Mobile shell: centered 480 px column, safe areas, animated screen transitions and the
 * notched bottom navigation. Screens without a tab (Settings) hide the navigation.
 */
export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()
  const activeTab = tabForPath(location.pathname)
  const tabIndex = NAV_ITEMS.findIndex((item) => item.key === activeTab)

  // Slide direction follows tab order; derived from the previous render's tab.
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

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-(--app-max-width) flex-col">
      <OfflineIndicator />
      <UpdatePrompt />
      <Toaster />
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col gap-6 px-4 pt-[max(12px,env(safe-area-inset-top))]"
          style={{
            paddingBottom: activeTab
              ? 'calc(var(--nav-height) + 24px + env(safe-area-inset-bottom))'
              : 'calc(24px + env(safe-area-inset-bottom))',
          }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>

      {activeTab ? (
        <div className="bg-page fixed inset-x-0 bottom-0 z-40 mx-auto max-w-(--app-max-width) px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
          <BottomNav
            items={NAV_ITEMS}
            activeKey={activeTab}
            onSelect={(_, href) => navigate(href)}
          />
        </div>
      ) : null}
    </div>
  )
}
