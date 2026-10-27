import { useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { useStore } from '@/app/store.tsx'
import { plusMinutes, routineById, rowAt, rowTitle, stepLabel, stepsFor, type RoutineId } from '@/domain/routines.ts'
import { returnInfo } from '@/domain/profile.ts'
import type { AgeLabel, TakenRoutine } from '@/domain/types.ts'

export function DoScreen() {
  const store = useStore()
  const data = store.data
  const [focus, setFocus] = useState(false)
  const [cursor, setCursor] = useState(0)
  if (!data) return null
  const ages = data.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
  const ensoku = data.childEvents.some((event) => event.title.includes('遠足'))
  const taken = data.taken?.[store.today] ?? []
  const back = returnInfo(data.profile.home)?.back ?? null

  return (
    <div className="px-3.5 pt-3.5 pb-28">
      <DemoBar title="今夜やること" />
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f0e8df] p-1">
        <button type="button" data-testid="do-list" className={`min-h-11 rounded-lg text-sm font-bold ${focus ? '' : 'bg-white'}`} onClick={() => setFocus(false)}>
          リスト
        </button>
        <button type="button" data-testid="do-focus" className={`min-h-11 rounded-lg text-sm font-bold ${focus ? 'bg-white' : ''}`} onClick={() => { setCursor(0); setFocus(true) }}>
          1つずつ
        </button>
      </div>
      {taken.length === 0 ? <p className="mt-4 text-sm leading-relaxed">今夜の流れから、引き受けるものを選べます。</p> : null}
      {focus ? <Focus taken={taken} ages={ages} ensoku={ensoku} cursor={cursor} setCursor={setCursor} back={back} /> : taken.map((item) => <ListBlock key={item.routineId} item={item} ages={ages} ensoku={ensoku} back={back} />)}
    </div>
  )
}

function ListBlock({ item, ages, ensoku, back }: { item: TakenRoutine; ages: AgeLabel[]; ensoku: boolean; back: string | null }) {
  const store = useStore()
  const id = item.routineId as RoutineId
  const steps = visibleSteps(item, ages, ensoku)
  const done = steps.filter((step) => item.checked.includes(step.id)).length
  const current = steps.find((step) => !item.checked.includes(step.id))?.id
  const at = item.at || rowAt(id, back)
  return (
    <section className="mt-4">
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-sand">
        <div className="h-full bg-margin" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">{rowTitle(id, ages, ensoku)}</h2>
        <p className="text-xs whitespace-nowrap text-muted">
          {at}〜 約{routineById(id).minutes}分
          <span className="ml-2 font-bold text-ink">{done}/{steps.length}</span>
        </p>
      </div>
      <div className="mt-2 space-y-2">
        {steps.map((step) => {
          const on = item.checked.includes(step.id)
          const here = step.id === current
          return (
            <button
              key={step.id}
              type="button"
              className={`flex min-h-11 w-full items-start gap-2 rounded-xl px-3 py-2 text-left ${here ? 'bg-margin-soft' : 'bg-white'}`}
              onClick={() => store.toggleCheck(store.today, id, step.id)}
            >
              <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? 'border-margin bg-margin text-white' : 'border-[#c8bfb4]'}`}>{on ? '✓' : ''}</span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${on ? 'text-muted line-through' : ''}`}>
                  {plusMinutes(at, step.offsetMin ?? 0)} {stepLabel(step, ages)}
                </span>
                <span className="block text-xs text-muted">約{step.minutes}分</span>
                {step.tip && !on ? <span className="mt-1 block rounded-lg bg-[#fff6e4] px-2 py-1 text-xs leading-relaxed text-watch-ink">{step.tip}</span> : null}
              </span>
            </button>
          )
        })}
      </div>
      {done === steps.length && steps.length > 0 ? <p className="mt-3 text-base font-bold">今夜はこれでOK</p> : null}
      <button type="button" className="mt-3 flex min-h-11 w-full items-center text-left text-sm font-bold" onClick={() => store.askForecast(`${rowTitle(id, ages, ensoku)}の手順について、一つ短く。`)}>
        この手順について相談 <span className="ml-auto">›</span>
      </button>
    </section>
  )
}

function Focus({
  taken,
  ages,
  ensoku,
  cursor,
  setCursor,
  back,
}: {
  taken: TakenRoutine[]
  ages: AgeLabel[]
  ensoku: boolean
  cursor: number
  setCursor: (next: number) => void
  back: string | null
}) {
  const store = useStore()
  const flat = taken.flatMap((item) => visibleSteps(item, ages, ensoku).map((step) => ({ item, step })))
  const index = Math.min(cursor, Math.max(flat.length - 1, 0))
  const current = flat[index]
  if (!current) return null
  const id = current.item.routineId as RoutineId
  const at = current.item.at || rowAt(id, back)
  const next = flat[index + 1]
  return (
    <article className="mt-4 rounded-[14px] bg-white px-4 py-5 text-center shadow-sm">
      <p className="text-sm font-bold text-margin">
        {rowTitle(id, ages, ensoku)} {index + 1}/{flat.length}
      </p>
      <h2 className="mt-2 text-[26px] leading-snug font-bold">{stepLabel(current.step, ages)}</h2>
      <p className="mt-1 text-sm text-muted">
        {plusMinutes(at, current.step.offsetMin ?? 0)} ・ 約{current.step.minutes}分
      </p>
      {current.step.tip ? <p className="mt-3 rounded-xl bg-[#fff6e4] px-3 py-2 text-left text-sm leading-relaxed text-watch-ink">{current.step.tip}</p> : null}
      <button
        type="button"
        data-testid="do-done"
        className="mt-4 inline-flex min-h-[72px] w-full items-center justify-center rounded-xl bg-margin text-lg font-bold text-white"
        onClick={() => {
          if (!current.item.checked.includes(current.step.id)) store.toggleCheck(store.today, id, current.step.id)
          setCursor(Math.min(index + 1, flat.length - 1))
        }}
      >
        できた
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" data-testid="do-back" className="min-h-11 rounded-xl bg-[#f3eee6] text-sm font-bold" onClick={() => setCursor(Math.max(index - 1, 0))}>
          ひとつ戻る
        </button>
        <button type="button" data-testid="do-skip" className="min-h-11 rounded-xl bg-[#f3eee6] text-sm font-bold" onClick={() => setCursor(Math.min(index + 1, flat.length - 1))}>
          とばす
        </button>
      </div>
      {next ? <p className="mt-3 text-xs text-muted">次：{stepLabel(next.step, ages)}（{next.step.minutes}分）</p> : <p className="mt-3 text-sm font-bold">今夜はこれでOK</p>}
    </article>
  )
}

function visibleSteps(item: TakenRoutine, ages: AgeLabel[], ensoku: boolean) {
  const id = item.routineId as RoutineId
  const steps = stepsFor(id, ages, ensoku)
  const picked = item.partial?.length ? steps.filter((step) => item.partial?.includes(step.id)) : steps
  const extra = (item.extra ?? []).map((step) => ({ ...step, offsetMin: 0 }))
  return [...picked, ...extra]
}
