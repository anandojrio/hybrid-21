import primaryUrl from '@/assets/logo-primary.svg'
import submarkUrl from '@/assets/logo-submark.svg'
import { cn } from 'cn'

interface BrandLogoProps {
  /** `primary` is the emblem with the HYBRID wordmark (for dark surfaces); `mark` is the emblem alone. */
  variant?: 'primary' | 'mark'
  /** Decorative logos are hidden from assistive technology. */
  decorative?: boolean
  className?: string
}

export function BrandLogo({ variant = 'primary', decorative = false, className }: BrandLogoProps) {
  return (
    <img
      src={variant === 'primary' ? primaryUrl : submarkUrl}
      alt={decorative ? '' : 'Hybrid'}
      aria-hidden={decorative || undefined}
      draggable={false}
      className={cn('block select-none', className)}
    />
  )
}
