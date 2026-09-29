import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** Toasts confirm non-critical success only; errors are shown inline next to their cause. */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    // Above the floating tab bar: never covers the header, and Undo is within thumb reach.
    position="bottom-center"
    offset={{ bottom: 'calc(var(--nav-height) + 28px + env(safe-area-inset-bottom))' }}
    mobileOffset={{ bottom: 'calc(var(--nav-height) + 28px + env(safe-area-inset-bottom))' }}
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-5" />,
      info: <InfoIcon className="size-5" />,
      warning: <TriangleAlertIcon className="size-5" />,
      error: <OctagonXIcon className="size-5" />,
      loading: <Loader2Icon className="size-5 animate-spin" />,
    }}
    style={
      {
        '--normal-bg': 'var(--charcoal)',
        '--normal-text': 'var(--ink-inverse)',
        '--normal-border': 'transparent',
        '--border-radius': 'var(--radius-group)',
      } as React.CSSProperties
    }
    {...props}
  />
)

export { Toaster }
