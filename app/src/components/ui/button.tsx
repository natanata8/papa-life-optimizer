import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white',
        ghost: 'bg-accent-soft text-accent-deep',
        quiet: 'bg-[#eee] text-[#666]',
        good: 'bg-good text-good-ink',
        meh: 'bg-meh text-[#6b625a]',
        outline: 'border border-line bg-white text-ink',
      },
      size: {
        default: 'px-3.5 py-2.5 text-sm',
        sm: 'rounded-lg px-2.5 py-1.5 text-xs',
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
