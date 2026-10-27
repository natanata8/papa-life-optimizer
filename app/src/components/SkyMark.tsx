import type { ForecastSky } from '@/domain/forecast.ts'

type Sky = ForecastSky | 'none'

export function SkyMark({
  sky,
  size = 26,
  lifted = false,
  label,
}: {
  sky: Sky
  size?: 26 | 28 | 44
  lifted?: boolean
  label?: string
}) {
  const name = lifted ? '解除' : sky === 'none' ? '予報なし' : sky
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label ?? name} className="shrink-0">
      {lifted ? <Cloud fill="#8aa0b8" /> : null}
      {!lifted && sky === '晴れ' ? <Sun /> : null}
      {!lifted && sky === 'くもり' ? <Cloud fill="#8aa0b8" /> : null}
      {!lifted && sky === 'にわか雨' ? (
        <>
          <Cloud fill="#8aa0b8" />
          <Rain />
        </>
      ) : null}
      {!lifted && sky === '注意報' ? (
        <>
          <Cloud fill="#8aa0b8" />
          <Triangle fill="#e6cf00" />
        </>
      ) : null}
      {!lifted && sky === '警報' ? (
        <>
          <Cloud fill="#8aa0b8" />
          <Triangle fill="#d7301b" />
        </>
      ) : null}
      {!lifted && sky === 'none' ? <circle cx="24" cy="24" r="10" fill="none" stroke="#a59c92" strokeWidth="2" strokeDasharray="3 3" /> : null}
    </svg>
  )
}

function Sun() {
  return (
    <>
      <circle cx="24" cy="24" r="8" fill="#e0a04a" />
      <g stroke="#e0a04a" strokeWidth="2.4" strokeLinecap="round">
        <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4" />
      </g>
    </>
  )
}

function Cloud({ fill }: { fill: string }) {
  return <path fill={fill} d="M16 32h18a8 8 0 0 0 1-16 10 10 0 0 0-19-2 7 7 0 0 0 0 18z" />
}

function Rain() {
  return (
    <g stroke="#1a4f78" strokeWidth="2.2" strokeLinecap="round">
      <path d="M18 36l-2 6M24 36v6M30 36l2 6" />
    </g>
  )
}

function Triangle({ fill }: { fill: string }) {
  return (
    <>
      <path fill={fill} d="M34 18l10 18H24z" />
      <path d="M34 26v5" stroke="#3d3200" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="33.5" r="1.1" fill="#3d3200" />
    </>
  )
}

export function LevelBadge({ sky, call, lifted }: { sky: ForecastSky; call: string; lifted: boolean }) {
  if (lifted) {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full bg-lift px-2 text-xs font-bold text-lift-ink" data-testid="badge-lifted">
        解除
      </span>
    )
  }
  if (sky === '注意報') {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full border-2 border-watch-line bg-watch-tag px-2 text-xs font-bold text-watch-ink" data-testid="badge-watch">
        {call}
      </span>
    )
  }
  if (sky === '警報') {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full border-2 border-alert-line bg-alert px-2 text-xs font-bold text-alert-ink" data-testid="badge-alert">
        {call}
      </span>
    )
  }
  return null
}
