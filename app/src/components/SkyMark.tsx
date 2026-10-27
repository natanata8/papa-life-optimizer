import type { ForecastSky } from '@/domain/forecast.ts'

export function SkyMark({ sky, lifted = false, large = false }: { sky: ForecastSky; lifted?: boolean; large?: boolean }) {
  const dot = large ? 'h-4 w-4' : 'h-3 w-3'
  if (lifted) {
    return (
      <span className="inline-flex min-h-6 items-center rounded-full border border-muted px-1.5 text-[10px] font-bold text-muted" data-testid="sky-lifted">
        解除
      </span>
    )
  }
  if (sky === '注意報') {
    return <span className={`inline-block ${dot} rounded-full border-2 border-watch-ink bg-watch`} data-testid="sky-watch" aria-hidden="true" />
  }
  if (sky === '警報') {
    return <span className={`inline-block ${dot} rounded-full bg-alert`} data-testid="sky-alert" aria-hidden="true" />
  }
  if (sky === 'にわか雨') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="text-rain-ink">
        <ellipse cx="6" cy="6" rx="4" ry="2.4" fill="currentColor" />
        <path d="M9 9.2c.8.7.4 1.8-.6 1.8" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    )
  }
  if (sky === 'くもり') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="text-cloud-ink">
        <ellipse cx="7" cy="8" rx="4.5" ry="2.6" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="text-accent-deep">
      <circle cx="7" cy="7" r="2.2" fill="currentColor" />
      <path d="M7 1.5v1.6M7 10.9v1.6M1.5 7h1.6M10.9 7h1.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function LevelBadge({ sky, call, lifted }: { sky: ForecastSky; call: string; lifted: boolean }) {
  if (lifted) {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full border border-muted px-2 text-[12px] font-bold text-muted" data-testid="badge-lifted">
        解除
      </span>
    )
  }
  if (sky === '注意報') {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full border-2 border-watch-ink bg-watch px-2 text-[12px] font-bold text-watch-ink" data-testid="badge-watch">
        {call}
      </span>
    )
  }
  if (sky === '警報') {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full bg-alert px-2 text-[12px] font-bold text-alert-ink" data-testid="badge-alert">
        {call}
      </span>
    )
  }
  return null
}
