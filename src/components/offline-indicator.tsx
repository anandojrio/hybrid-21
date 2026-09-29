import { CloudOff } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useOnlineStatus } from '@/hooks/use-online-status'

/** Appears only while offline. Everything keeps working; this is informational. */
export function OfflineIndicator() {
  const online = useOnlineStatus()
  return (
    <AnimatePresence>
      {online ? null : (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+8px)] z-50 flex justify-center"
        >
          <span className="bg-charcoal text-ink-inverse inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-md">
            <CloudOff aria-hidden className="size-4" />
            Offline · everything is saved on this device
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
