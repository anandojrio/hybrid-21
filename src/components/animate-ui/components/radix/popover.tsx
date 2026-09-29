import {
  Popover as PopoverPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverClose as PopoverClosePrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PopoverTriggerProps as PopoverTriggerPrimitiveProps,
  type PopoverContentProps as PopoverContentPrimitiveProps,
  type PopoverCloseProps as PopoverClosePrimitiveProps,
} from '@/components/animate-ui/primitives/radix/popover'
import { cn } from '@/lib/utils'

type PopoverProps = PopoverPrimitiveProps

function Popover(props: PopoverProps) {
  return <PopoverPrimitive {...props} />
}

type PopoverTriggerProps = PopoverTriggerPrimitiveProps

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverTriggerPrimitive {...props} />
}

type PopoverContentProps = PopoverContentPrimitiveProps

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPortalPrimitive>
      <PopoverContentPrimitive
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'border-separator bg-surface text-ink z-50 w-[min(20rem,calc(100vw-32px))] origin-(--radix-popover-content-transform-origin) rounded-(--radius-group) border p-4 shadow-xl outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPortalPrimitive>
  )
}

type PopoverCloseProps = PopoverClosePrimitiveProps

function PopoverClose(props: PopoverCloseProps) {
  return <PopoverClosePrimitive {...props} />
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverCloseProps,
}
