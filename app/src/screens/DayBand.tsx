import { useState } from 'react'
import { Icon } from '@/components/icons.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { dayPacks, type DayPack } from '@/domain/dayMode.ts'
import { firstUnchecked } from '@/domain/routines.ts'

const KEY = 'tone-app:day-checks'

function readChecks(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function DayBand({ ages }: { ages: readonly string[] }) {
  const packs = dayPacks(ages)
  const [checked, setChecked] = useState<string[]>(readChecks)
  const [focus, setFocus] = useState(false)
  const [cursor, setCursor] = useState(0)
  const toggle = (id: string) => {
    setChecked((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }
  const flat = packs.flatMap((pack) => pack.steps.map((step) => ({ pack, step })))
  return (
    <div data-testid="day-band">
      <h2 className="mt-4 text-[22px] font-bold">
        <Phrase text="昼の家のこと" />
      </h2>
      <p className="mt-1 text-sm text-muted">
        <Phrase text="帰宅まえでも、線で進める。" />
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-sand p-1">
        <button type="button" data-testid="day-list" className={`min-h-11 rounded-lg text-sm font-bold ${focus ? '' : 'bg-white'}`} onClick={() => setFocus(false)}>
          リスト
        </button>
        <button
          type="button"
          data-testid="day-focus"
          className={`min-h-11 rounded-lg text-sm font-bold ${focus ? 'bg-white' : ''}`}
          onClick={() => {
            setCursor(firstUnchecked(flat.map((row) => row.step.id), checked))
            setFocus(true)
          }}
        >
          1つずつ
        </button>
      </div>
      {focus ? (
        <DayFocus flat={flat} cursor={cursor} setCursor={setCursor} checked={checked} toggle={toggle} />
      ) : (
        packs.map((pack) => <PackCard key={pack.id} pack={pack} checked={checked} toggle={toggle} />)
      )}
    </div>
  )
}

function PackCard({ pack, checked, toggle }: { pack: DayPack; checked: string[]; toggle: (id: string) => void }) {
  return (
    <section className="mt-4" data-testid={`day-pack-${pack.id}`}>
      <h3 className="text-base font-bold">
        <Phrase text={pack.title} />
      </h3>
      <div className="mt-2 space-y-2">
        {pack.steps.map((step, index) => {
          const on = checked.includes(step.id)
          return (
            <button key={step.id} type="button" className="hare-card flex min-h-11 w-full items-start gap-2 px-3 py-2 text-left" onClick={() => toggle(step.id)}>
              <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${on ? 'border-margin bg-margin text-white' : 'border-[#c8bfb4] bg-white'}`}>
                {on ? <Icon name="check" size={16} /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${on ? 'text-muted line-through' : ''}`}>
                  <Phrase text={step.title} />
                </span>
                <span className="block text-xs text-muted">約{step.minutes}分</span>
                {step.tip && !on ? <span className="mt-1 block rounded-lg bg-[#fff6e4] px-2 py-1 text-xs leading-relaxed text-watch-ink">{step.tip}</span> : null}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function DayFocus({
  flat,
  cursor,
  setCursor,
  checked,
  toggle,
}: {
  flat: { pack: DayPack; step: DayPack['steps'][number] }[]
  cursor: number
  setCursor: (next: number) => void
  checked: string[]
  toggle: (id: string) => void
}) {
  const done = flat.length > 0 && flat.every((row) => checked.includes(row.step.id))
  if (done || cursor >= flat.length) {
    return (
      <article className="hare-card mt-4 px-4 py-8 text-center" data-testid="day-finish">
        <h2 className="text-[22px] font-bold">昼はここまで</h2>
        <p className="mt-2 text-sm">引き受けた手順は、ここまでです。</p>
      </article>
    )
  }
  const current = flat[Math.min(cursor, flat.length - 1)]
  if (!current) return null
  return (
    <article className="hare-card mt-4 px-4 py-5 text-center">
      <p className="text-sm font-bold text-margin">
        <Phrase text={current.pack.title} /> {cursor + 1}/{flat.length}
      </p>
      <h2 className="mt-2 text-[22px] leading-snug font-bold">
        <Phrase text={current.step.title} />
      </h2>
      <p className="mt-1 text-sm text-muted">約{current.step.minutes}分</p>
      {current.step.tip ? <p className="mt-3 rounded-xl bg-[#fff6e4] px-3 py-2 text-left text-sm leading-relaxed text-watch-ink">{current.step.tip}</p> : null}
      <button
        type="button"
        data-testid="day-done"
        className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-margin text-base font-bold text-white"
        onClick={() => {
          if (!checked.includes(current.step.id)) toggle(current.step.id)
          setCursor(cursor + 1)
        }}
      >
        <Icon name="check" size={18} />
        できた
      </button>
      <button type="button" data-testid="day-skip" className="mt-2 min-h-11 w-full rounded-xl bg-[#f3eee6] text-sm font-bold" onClick={() => setCursor(cursor + 1)}>
        とばす
      </button>
    </article>
  )
}
