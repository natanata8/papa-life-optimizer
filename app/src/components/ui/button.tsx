import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md font-extrabold disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white active:bg-[#003d99]',
        ghost: 'bg-accent-soft text-accent',
        quiet: 'bg-sand text-muted',
        good: 'bg-margin text-white',
        meh: 'bg-sand text-ink',
        outline: 'border border-line bg-white text-ink',
      },
      size: {
        default: 'px-3.5 py-2.5 text-sm',
        sm: 'min-h-11 rounded-lg px-2.5 py-1.5 text-xs',
        lg: 'w-full py-3 text-[15px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
