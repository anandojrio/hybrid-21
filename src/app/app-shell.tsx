import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { BottomNav } from '@/components/bottom-nav/bottom-nav'
import { OfflineIndicator } from '@/components/offline-indicator'
import { Toaster } from '@/components/ui/sonner'
import { UpdatePrompt } from '@/components/update-prompt'
import { NAV_ITEMS, tabForPath } from './nav-items'
import { preloadScreens } from './routes'

/**
 * Mobile shell: centered 480 px column, safe areas, animated screen transitions and the
 * notched bottom navigation. Screens without a tab (Settings) hide the navigation.
 */
export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()
  const activeTab = tabForPath(location.pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const id = setTimeout(preloadScreens, 400)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-(--app-max-width) flex-col">
      <OfflineIndicator />
      <UpdatePrompt />
      <Toaster />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.main
          key={location.pathname}
          // Soft crossfade with a small rise; the old screen fades out quickly underneath.
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
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
  )
}
