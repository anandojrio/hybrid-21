import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Slot } from 'radix-ui'

/** Every size keeps a touch target of at least 44 × 44 px. */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-[background-color,transform,box-shadow] duration-(--dur-fast) outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        inverse: 'bg-charcoal text-ink-inverse hover:bg-charcoal/90',
        mint: 'bg-mint text-type-mob-fg hover:bg-mint/90',
        outline: 'border-separator bg-surface text-ink hover:bg-surface-2',
        secondary: 'bg-surface-2 text-ink hover:bg-separator/60',
        ghost: 'text-ink hover:bg-surface-2',
        destructive: 'bg-danger/10 text-danger hover:bg-danger/15',
        link: 'text-ocean underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 gap-2 px-5 text-base',
        sm: 'h-11 gap-1.5 px-4 text-[15px]',
        lg: 'h-14 gap-2 px-6 text-lg',
        icon: 'size-11 rounded-full',
        'icon-lg': 'size-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
