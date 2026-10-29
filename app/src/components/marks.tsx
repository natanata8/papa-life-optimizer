import type { ReactNode } from 'react'
import type { HouseLight } from '@/domain/house.ts'

type MarkProps = { size?: number; className?: string }

/** 屋根の三角と、その上の丸い太陽。ヘッダーと共有の印。 */
export function RoofMark({ size = 28, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="8" r="4.2" fill="#e6a800" />
      <path d="M4 26 16 12l12 14Z" fill="currentColor" />
    </svg>
  )
}

function RoomIcon({ size = 32, className, children }: MarkProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      {children}
    </svg>
  )
}

export function IconBath({ size, className }: MarkProps) {
  return (
    <RoomIcon size={size} className={className}>
      <rect x="6" y="22" width="36" height="14" rx="7" fill="currentColor" opacity="0.18" />
      <path d="M10 22h28v8a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8v-8z" fill="currentColor" />
      <path d="M14 22v-3a4 4 0 0 1 4-4h2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="34" cy="16" r="2.2" fill="currentColor" opacity="0.55" />
    </RoomIcon>
  )
}

export function IconBed({ size, className }: MarkProps) {
  return (
    <RoomIcon size={size} className={className}>
      <path d="M8 30h32v4a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4z" fill="currentColor" />
      <path d="M8 22h20a6 6 0 0 1 6 6v2H8v-8z" fill="currentColor" opacity="0.35" />
      <circle cx="16" cy="18" r="4" fill="currentColor" opacity="0.55" />
    </RoomIcon>
  )
}

export function IconDoor({ size, className }: MarkProps) {
  return (
    <RoomIcon size={size} className={className}>
      <path d="M8 40h32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="16" y="10" width="16" height="30" rx="2" fill="currentColor" />
      <circle cx="28" cy="26" r="1.6" fill="#fff" />
    </RoomIcon>
  )
}

export function IconKitchen({ size, className }: MarkProps) {
  return (
    <RoomIcon size={size} className={className}>
      <path d="M10 22h28v4a10 10 0 0 1-10 10H20A10 10 0 0 1 10 26v-4z" fill="currentColor" />
      <path d="M16 22c1-6 15-6 16 0" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M24 12v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </RoomIcon>
  )
}

export function IconWasher({ size, className }: MarkProps) {
  return (
    <RoomIcon size={size} className={className}>
      <rect x="10" y="8" width="28" height="32" rx="4" fill="currentColor" opacity="0.2" />
      <rect x="13" y="11" width="22" height="26" rx="3" fill="currentColor" />
      <circle cx="24" cy="26" r="6" fill="#fff" opacity="0.85" />
    </RoomIcon>
  )
}

export function IconBowl({ size, className }: MarkProps) {
  return (
    <RoomIcon size={size} className={className}>
      <path d="M8 20h32v3a12 12 0 0 1-12 12H20A12 12 0 0 1 8 23v-3z" fill="currentColor" />
      <path d="M16 20c.6-5 15.4-5 16 0" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </RoomIcon>
  )
}

const SUN_R = [0, 6, 8, 11] as const

export function HeroHome({
  windows,
  sun,
  className,
}: {
  windows: HouseLight['windows']
  sun: HouseLight['sun']
  className?: string
}) {
  const glow = (index: number) => index < windows
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true" className={className} data-testid="hero-home" data-windows={windows} data-sun={sun}>
      <g className="house-light" opacity={sun === 0 ? 0 : 1}>
        <circle cx="80" cy="16" r={SUN_R[sun]} fill="#e6a800" />
      </g>
      <path d="M22 52 80 18l58 34v4H22z" fill="#047a35" />
      <rect x="34" y="54" width="92" height="46" rx="2" fill="#f7f8f7" stroke="#047a35" strokeWidth="2.5" />
      {[0, 1, 2].map((index) => {
        const x = 46 + index * 26
        return (
          <g key={index}>
            <rect x={x} y="64" width="16" height="14" rx="1.5" fill="#d7e0da" />
            <rect className="house-light" x={x} y="64" width="16" height="14" rx="1.5" fill="#fff6d0" opacity={glow(index) ? 1 : 0} />
          </g>
        )
      })}
      <rect x="72" y="78" width="16" height="22" rx="1" fill="#047a35" opacity="0.35" />
    </svg>
  )
}

export function SpotFamily({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" aria-hidden="true" className={className}>
      <circle cx="22" cy="14" r="7" fill="currentColor" />
      <path d="M10 42c2-12 6-18 12-18s10 6 12 18" fill="currentColor" />
      <circle cx="44" cy="20" r="5" fill="currentColor" opacity="0.75" />
      <path d="M36 42c1-8 4-12 8-12s7 4 8 12" fill="currentColor" opacity="0.75" />
    </svg>
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

export function TaskTile({ id, large = false }: { id: string; large?: boolean }) {
  return (
    <span
      className={
        large
          ? 'inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-accent-soft text-accent'
          : 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent'
      }
    >
      <TaskGlyph id={id} size={large ? 32 : 22} />
    </span>
  )
}
