import { DatabaseZap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StorageErrorScreenProps {
  message: string
  onRetry: () => void
}

/** Shown when IndexedDB cannot be opened (e.g. private browsing or blocked site data). */
export function StorageErrorScreen({ message, onRetry }: StorageErrorScreenProps) {
  return (
    <main
      role="alert"
      className="mx-auto flex min-h-dvh max-w-(--app-max-width) flex-col justify-center gap-5 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <span className="bg-charcoal text-mint flex size-14 items-center justify-center rounded-full">
        <DatabaseZap aria-hidden className="size-7" />
      </span>
      <h1 className="font-display text-3xl font-bold tracking-tight">Storage unavailable</h1>
      <p className="text-ink text-base">{message}</p>
      <ul className="text-ink-muted list-disc space-y-1 pl-5 text-base">
        <li>Private browsing can block local storage. Open the app in a normal tab.</li>
        <li>Check that website data is allowed for this site.</li>
        <li>Your training plan is built in and not affected.</li>
      </ul>
      <Button onClick={onRetry} className="self-start">
        Try again
      </Button>
    </main>
  )
}
