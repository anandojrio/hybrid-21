import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { PlannedSession } from '@/domain/types'

/** Temporary stand-in until the logging forms land in phase 7. Nothing is saved. */
export function PendingLogForm({
  session,
  open,
  onOpenChange,
}: {
  session: PlannedSession
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-page mx-auto max-w-(--app-max-width)">
        <DrawerHeader>
          <DrawerTitle className="font-display text-2xl">Log {session.title}</DrawerTitle>
          <DrawerDescription>
            The logging form arrives in phase 7. The session stays planned until a result is saved.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))]">
          <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
