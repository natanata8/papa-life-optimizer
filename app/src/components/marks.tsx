import type { ReactNode } from 'react'
import type { HouseLight } from '@/domain/house.ts'

type MarkProps = { size?: number; className?: string }

function LineIcon({ size = 24, className, children }: MarkProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" aria-hidden="true" className={className}>
      {children}
    </svg>
  )
}

/** 幾何の屋根と、その上の太陽。線だけ。 */
export function RoofMark({ size = 28, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 28" aria-hidden="true" className={className}>
      <circle cx="24" cy="6" r="3" fill="#e6a800" />
      <path d="M2 14 16 2l14 12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M6 14v12h20V14" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

const SUN_R = [0, 2.5, 3.5, 5] as const

export function HeroHome({
  windows,
  sun,
  className,
}: {
  windows: HouseLight['windows']
  sun: HouseLight['sun']
  className?: string
}) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" className={className} data-testid="hero-home" data-windows={windows} data-sun={sun}>
      {sun > 0 ? <circle cx="50" cy="10" r={SUN_R[sun]} fill="#e6a800" /> : null}
      <path d="M6 26 32 6l26 20" fill="none" stroke="#0052cc" strokeWidth="2.5" strokeLinejoin="miter" />
      <path d="M12 26v24h40V26" fill="none" stroke="#0052cc" strokeWidth="2.5" />
      <rect x="28" y="36" width="8" height="14" fill="#0052cc" />
      {[0, 1, 2].map((index) => (
        <rect key={index} x={16 + index * 12} y="30" width="8" height="6" fill={index < windows ? '#e6a800' : '#e5e7eb'} />
      ))}
    </svg>
  )
}

export function IconBath({ size, className }: MarkProps) {
  return (
    <LineIcon size={size} className={className}>
      <path d="M3 13h18v4a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-4z" />
      <path d="M7 13V10a2 2 0 0 1 2-2h1" />
    </LineIcon>
  )
}

export function IconBed({ size, className }: MarkProps) {
  return (
    <LineIcon size={size} className={className}>
      <path d="M3 18h18v3H3z" />
      <path d="M3 14h10v4H3z" />
      <circle cx="6" cy="10" r="2" />
    </LineIcon>
  )
}

export function IconDoor({ size, className }: MarkProps) {
  return (
    <LineIcon size={size} className={className}>
      <path d="M4 20h16" />
      <path d="M8 20V6h8v14" />
      <circle cx="14" cy="13" r="0.8" fill="currentColor" stroke="none" />
    </LineIcon>
  )
}

export function IconKitchen({ size, className }: MarkProps) {
  return (
    <LineIcon size={size} className={className}>
      <path d="M4 12h16v2a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-2z" />
      <path d="M12 6v4" />
    </LineIcon>
  )
}

export function IconWasher({ size, className }: MarkProps) {
  return (
    <LineIcon size={size} className={className}>
      <rect x="5" y="3" width="14" height="18" />
      <circle cx="12" cy="13" r="3" />
    </LineIcon>
  )
}

export function IconBowl({ size, className }: MarkProps) {
  return (
    <LineIcon size={size} className={className}>
      <path d="M4 10h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2z" />
    </LineIcon>
  )
}

export function TaskGlyph({ id, size = 22 }: { id: string; size?: number }) {
  if (id === 'bath') return <IconBath size={size} />
  if (id === 'bedtime') return <IconBed size={size} />
  if (id === 'tomorrow' || id === 'dropoff' || id === 'pickup') return <IconDoor size={size} />
  if (id === 'dinnerClean') return <IconKitchen size={size} />
  if (id === 'laundry') return <IconWasher size={size} />
  if (id === 'morning') return <IconBowl size={size} />
  return <RoofMark size={size} />
}

export function TaskTile({ id, large = false, done = false }: { id: string; large?: boolean; done?: boolean }) {
  return (
    <span
      className={
        large
          ? `inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${done ? 'bg-accent-soft text-accent' : 'bg-sand text-ink'}`
          : `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${done ? 'bg-accent-soft text-accent' : 'bg-sand text-ink'}`
      }
    >
      <TaskGlyph id={id} size={large ? 26 : 18} />
    </span>
  )
}
