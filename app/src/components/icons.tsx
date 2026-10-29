import type { ReactNode } from 'react'
import type { MarkName } from '@/domain/taskIcon.ts'

export type IconName =
  | MarkName
  | 'today'
  | 'do'
  | 'consult'
  | 'plan'
  | 'house'
  | 'check'
  | 'copy'
  | 'line'
  | 'sent'
  | 'share'
  | 'send'
  | 'plus'
  | 'chevron'
  | 'clock'
  | 'warning'
  | 'alert'
  | 'sun'
  | 'cloud'
  | 'drink'
  | 'me'
  | 'thought'
  | 'talk'
  | 'child'
  | 'people'
  | 'outing'
  | 'cross'
  | 'car'
  | 'pin'
  | 'back'

const PATHS: Record<IconName, string[]> = {
  today: ['M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  do: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M7 12l3 3 7-7'],
  consult: ['M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z'],
  plan: ['M5 5h14a2 2 0 0 1 2 2v12H3V7a2 2 0 0 1 2-2z', 'M3 10h18', 'M8 3v4', 'M16 3v4'],
  house: ['M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0', 'M4 21c1-5 4-7 8-7s7 2 8 7'],
  bath: ['M5 11h14', 'M7 11V8.5A1.5 1.5 0 0 1 8.5 7H10', 'M5 11v3a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3', 'M9 6.5c.4-1.2 1.6-1.2 2 0'],
  bed: ['M3 17V11h18v6', 'M3 13.5h7.5A2.5 2.5 0 0 0 13 11H3', 'M3 17h18', 'M6 17v2', 'M18 17v2'],
  bag: ['M8 8h8l-.8 11H8.8L8 8z', 'M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8'],
  tidy: ['M7 16h10', 'M5.5 19.5h13', 'M8 12.5h8', 'M8.5 12.5c.3-2.2 6.7-2.2 7 0'],
  laundry: ['M8 6.5 12 9l4-2.5 2.5 3-1.5 1.5V19H7V11L5.5 9.5z', 'M12 9v3'],
  dropoff: ['M6.5 8.2a1.7 1.7 0 1 0 0.01 0', 'M6.5 11.2v3.2', 'M4.8 18h3.4', 'M12 13h7', 'M16 10l3 3-3 3'],
  pickup: ['M17 8.2a1.7 1.7 0 1 0 0.01 0', 'M17 11.2v3.2', 'M15.3 18h3.4', 'M4 13h8', 'M8 10 5 13 8 16'],
  morning: ['M12 14.5a4.2 4.2 0 1 0 0.01 0', 'M12 12.2V14l1.6 1.2', 'M8.2 5.2 6.6 3.6', 'M15.8 5.2 17.4 3.6', 'M9.5 19.5h5'],
  dinner: ['M6 10h12c0 3.2-2.6 5.5-6 5.5S6 13.2 6 10z', 'M8 10c.4-1.6 7.6-1.6 8 0', 'M9 7.4v-1.6', 'M12 6.8V5', 'M15 7.4v-1.6'],
  hidden: ['M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12z', 'M12 12.2a1.6 1.6 0 1 0 0.01 0', 'M5 5l14 14'],
  check: ['M5 12.5 9.5 17 19 7'],
  copy: ['M8 8h10v12H8z', 'M6 16H5V4h10v1'],
  line: ['M5 6h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3 2.5V14H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M18 10h2', 'M18 13l3-1.5'],
  sent: ['M12 4.5a7.5 7.5 0 1 0 0.01 0', 'M8.2 12.2 11 15l5-5.5'],
  share: ['M12 4v10', 'M8 7.5 12 3.5l4 4', 'M6 13v6h12v-6'],
  send: ['M4.5 11.5 20 4.5 13.5 20l-2.2-6.8z', 'M11.3 13.2 20 4.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  chevron: ['M9 6l6 6-6 6'],
  clock: ['M12 12.5a6.5 6.5 0 1 0 0.01 0', 'M12 9.2V12l2.2 1.6'],
  warning: ['M12 4.5 20 19H4z', 'M12 10v4', 'M12 16.2a.7.7 0 1 0 .01 0'],
  alert: ['M12 4.5 20 19H4z', 'M12 10v4', 'M12 16.2a.7.7 0 1 0 .01 0'],
  sun: ['M12 12.2a2.4 2.4 0 1 0 0.01 0', 'M12 6.5v1.6', 'M12 16.2v1.6', 'M6.5 12h1.6', 'M16 12h1.6', 'M8.2 8.2l1.1 1.1', 'M14.7 14.7l1.1 1.1', 'M15.8 8.2l-1.1 1.1', 'M9.3 14.7l-1.1 1.1'],
  cloud: ['M8 16.5h8.2a3.2 3.2 0 0 0 .4-6.4 4.2 4.2 0 0 0-8-1 3 3 0 0 0-.6 7.4z'],
  drink: ['M8 4h8l-1 7.5a3 3 0 0 1-6 0L8 4z', 'M9 19.5h6', 'M12 15v4.5'],
  me: ['M12 8.2a2.2 2.2 0 1 0 0.01 0', 'M7.5 18.5c.6-2.6 2.3-3.8 4.5-3.8s3.9 1.2 4.5 3.8'],
  thought: ['M8 15.5a3 3 0 0 1-.4-6 3.6 3.6 0 0 1 6.8-1.2 2.8 2.8 0 0 1 .2 5.6', 'M7 18.2a1 1 0 1 0 0.01 0', 'M5 20.2a.6.6 0 1 0 0.01 0'],
  talk: ['M4 6h10a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H7.5L5 15v-2H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M11 11h8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v2l-2.2-2H11a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z'],
  child: ['M12 7.5a1.8 1.8 0 1 0 0.01 0', 'M8.5 18c.4-2.4 1.7-3.5 3.5-3.5s3.1 1.1 3.5 3.5'],
  people: ['M8 8.2a1.7 1.7 0 1 0 0.01 0', 'M16 8.6a1.5 1.5 0 1 0 0.01 0', 'M4.8 18c.4-2.3 1.6-3.4 3.2-3.4s2.8 1.1 3.2 3.4', 'M13.2 18c.3-2 1.3-3 2.7-3s2.4 1 2.8 3'],
  outing: ['M3 17c2.2-4 3.8-4 6 0', 'M10 17c2-4.5 3.8-4.5 6 0', 'M3 17h18', 'M15 8.5 17 5l2 3.5'],
  cross: ['M12 6v12', 'M6 12h12', 'M12 12.2a6 6 0 1 0 0.01 0'],
  car: ['M4 14.5 6 9h12l2 5.5', 'M4 14.5h16V18H4z', 'M7.5 17.2a1 1 0 1 0 0.01 0', 'M16.5 17.2a1 1 0 1 0 0.01 0'],
  pin: ['M12 20s6-5.2 6-9a6 6 0 1 0-12 0c0 3.8 6 9 6 9z', 'M12 11.2a1.6 1.6 0 1 0 0.01 0'],
  back: ['M15 6 9 12l6 6'],
}

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function WeatherDot({ sky }: { sky: string }) {
  if (sky === '注意報') return <span className="inline-block h-4 w-4 rounded-full border-2 border-watch-ink bg-watch-tag" />
  if (sky === '警報') return <span className="inline-block h-4 w-4 rounded-full border-2 border-alert-ink bg-alert-line" />
  if (sky === '晴れ' || sky === 'くもり' || sky === 'にわか雨') {
    const tone = sky === '晴れ' ? 'text-accent-deep' : sky === 'にわか雨' ? 'text-rain-ink' : 'text-cloud-ink'
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={tone}>
        {sky === '晴れ' ? (
          <>
            <circle cx="8" cy="8" r="3.1" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M8 1.1v2M8 12.9v2M1.1 8h2M12.9 8h2M3.1 3.1l1.5 1.5M11.4 11.4l1.5 1.5M12.9 3.1l-1.5 1.5M4.6 11.4l-1.5 1.5" />
            </g>
          </>
        ) : (
          <>
            <circle cx="5" cy="11" r="4.6" fill="currentColor" />
            <circle cx="11" cy="11" r="4.6" fill="currentColor" />
            <circle cx="8" cy="6.2" r="4.4" fill="currentColor" />
          </>
        )}
      </svg>
    )
  }
  return <span className="inline-block h-4 w-4 rounded-full border-2 border-dashed border-muted" />
}

export function ProgressRing({ value, total, children }: { value: number; total: number; children?: ReactNode }) {
  const radius = 34
  const turn = 2 * Math.PI * radius
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  return (
    <div className="relative mx-auto h-24 w-24">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true" className="text-margin">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="4" />
        {ratio > 0 ? (
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${turn * ratio} ${turn}`}
            transform="rotate(-90 48 48)"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-accent-deep">{children}</div>
    </div>
  )
}

export function StepSketch() {
  return (
    <svg width="220" height="132" viewBox="0 0 220 132" fill="none" aria-hidden="true" className="mx-auto">
      <rect x="8" y="8" width="204" height="116" rx="16" fill="#fff" />
      <circle cx="110" cy="62" r="28" stroke="#047a35" strokeOpacity="0.2" strokeWidth="6" />
      <path d="M110 34a28 28 0 0 1 24 42" stroke="#047a35" strokeWidth="6" strokeLinecap="round" />
      <path d="M98 58h24M102 50h16l-2 16H104z" stroke="#1c2430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BubbleSketch() {
  return (
    <svg width="220" height="132" viewBox="0 0 220 132" fill="none" aria-hidden="true" className="mx-auto">
      <rect x="8" y="8" width="204" height="116" rx="16" fill="#dfe7ea" />
      <path d="M48 36h124a12 12 0 0 1 12 12v32a12 12 0 0 1-12 12H78l-16 14v-14H48a12 12 0 0 1-12-12V48a12 12 0 0 1 12-12z" fill="#d9fdd3" />
      <path d="M64 58h88M64 72h64" stroke="#1c2430" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
