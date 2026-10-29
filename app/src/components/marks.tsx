type MarkProps = { size?: number; className?: string }

export function HareMark({ size = 28, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="7" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M16 3v3.2M16 25.8V29M3 16h3.2M25.8 16H29M6.4 6.4l2.3 2.3M23.3 23.3l2.3 2.3M6.4 25.6l2.3-2.3M23.3 8.7l2.3-2.3" />
      </g>
    </svg>
  )
}

export function IconBath({ size = 32, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect x="6" y="22" width="36" height="14" rx="7" fill="currentColor" opacity="0.18" />
      <path d="M10 22h28v8a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8v-8z" fill="currentColor" />
      <path d="M14 22v-3a4 4 0 0 1 4-4h2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="34" cy="16" r="2.2" fill="currentColor" opacity="0.55" />
      <circle cx="38" cy="12" r="1.6" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export function IconBed({ size = 32, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path d="M8 30h32v4a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4z" fill="currentColor" />
      <path d="M8 22h20a6 6 0 0 1 6 6v2H8v-8z" fill="currentColor" opacity="0.35" />
      <circle cx="16" cy="18" r="4" fill="currentColor" opacity="0.55" />
      <path d="M30 14c2-3 6-3 8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function IconBag({ size = 32, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect x="10" y="16" width="28" height="22" rx="4" fill="currentColor" />
      <path d="M18 16v-2a6 6 0 0 1 12 0v2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="20" y="24" width="8" height="6" rx="1.5" fill="#fff" opacity="0.85" />
    </svg>
  )
}

export function HeroHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" aria-hidden="true" className={className}>
      <circle cx="162" cy="28" r="14" fill="#e6a800" />
      <g stroke="#e6a800" strokeWidth="3" strokeLinecap="round">
        <path d="M162 6v6M162 44v6M140 28h6M178 28h6M146 12l4 4M174 40l4 4M146 44l4-4M174 12l4-4" />
      </g>
      <path d="M40 78V48l32-22 32 22v30H40z" fill="#047a35" opacity="0.18" />
      <path d="M40 48l32-22 32 22" fill="none" stroke="#047a35" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M48 78V52h48v26" fill="#e8fbef" />
      <rect x="62" y="58" width="14" height="20" rx="2" fill="#047a35" />
      <rect x="82" y="58" width="10" height="10" rx="1.5" fill="#a8e6c0" />
      <circle cx="128" cy="58" r="5" fill="#111111" />
      <path d="M120 78c1-8 4-12 8-12s7 4 8 12" fill="#111111" />
      <circle cx="142" cy="64" r="3.5" fill="#555555" />
      <path d="M137 78c1-6 3-9 5-9s4 3 5 9" fill="#555555" />
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
  if (id === 'tomorrow') return <IconBag size={size} />
  return <HareMark size={size} />
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
