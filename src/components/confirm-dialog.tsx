import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  trigger: ReactNode
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
  destructive?: boolean
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-surface rounded-(--radius-group)">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 rounded-2xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              destructive
                ? 'bg-danger hover:bg-danger/90 h-11 rounded-2xl text-white'
                : 'h-11 rounded-2xl'
            }
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
