import { useState, type ReactNode } from 'react'
import type { SessionType } from '@/domain/types'
import { SESSION_TYPE_META } from '@/lib/session-types'
import { typeTheme } from '@/lib/type-theme'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export const LOG_FORM_ID = 'session-log-form'

interface LogFormDrawerProps {
  /** Themes the sheet in the session type's colors. */
  type: SessionType
  title: string
  description: string
  open: boolean
  dirty: boolean
  saving: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Full-height sheet for logging. Closing with unsaved changes asks for confirmation;
 * the Save button submits the form inside by id.
 */
export function LogFormDrawer({
  type,
  title,
  description,
  open,
  dirty,
  saving,
  onClose,
  children,
}: LogFormDrawerProps) {
  const [confirming, setConfirming] = useState(false)
  const meta = SESSION_TYPE_META[type]
  const Icon = meta.icon

  const requestClose = () => {
    if (dirty) setConfirming(true)
    else onClose()
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose()
        }}
        repositionInputs={false}
      >
        <DrawerContent
          className="bg-page mx-auto h-[calc(100dvh-env(safe-area-inset-top)-12px)] max-h-none max-w-(--app-max-width) rounded-t-[28px] border-none"
          style={typeTheme(type)}
        >
          <DrawerHeader
            className="mx-4 mt-3 mb-2 flex-row items-start justify-between gap-2 rounded-3xl p-4"
            style={{ backgroundColor: meta.color, color: meta.foreground }}
          >
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide">
                <Icon aria-hidden className="size-4" strokeWidth={2.25} />
                {meta.slug}
              </p>
              <DrawerTitle className="font-display text-2xl leading-tight font-bold text-current">
                {title}
              </DrawerTitle>
              <DrawerDescription className="text-current opacity-85">
                {description}
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="-mr-2 text-current hover:bg-black/10"
              onClick={requestClose}
            >
              Cancel
            </Button>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6" data-vaul-no-drag>
            {children}
          </div>
          <div className="border-separator bg-page border-t px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <Button type="submit" form={LOG_FORM_ID} className="w-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="bg-surface rounded-(--radius-group)">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing has been saved. The session stays as it was.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-2xl">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger hover:bg-danger/90 h-11 rounded-2xl text-white"
              onClick={() => {
                setConfirming(false)
                onClose()
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
