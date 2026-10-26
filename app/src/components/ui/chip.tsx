import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'

export function Chip({
  on,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[13px]',
        on ? 'border-accent bg-accent text-white' : 'border-line bg-white text-ink',
        className,
      )}
      {...props}
    />
  )
}
