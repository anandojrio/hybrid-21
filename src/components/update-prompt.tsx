import { RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Unobtrusive "Update available" pill; the new version activates only when tapped. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <AnimatePresence>
      {needRefresh ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+8px)] z-50 flex justify-center px-4"
        >
          <div className="bg-charcoal text-ink-inverse flex items-center gap-1 rounded-full py-1 pr-1 pl-4 text-sm font-medium shadow-md">
            Update available
            <button
              type="button"
              onClick={() => void updateServiceWorker(true)}
              className="bg-mint text-charcoal inline-flex h-11 items-center gap-1.5 rounded-full px-4 font-semibold"
            >
              <RefreshCw aria-hidden className="size-4" />
              Reload
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="h-11 rounded-full px-3 opacity-80"
            >
              Later
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
