import { useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Icon, ProgressRing } from '@/components/icons.tsx'
import { NextHandCard } from '@/components/NextHand.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'
import { DayBand } from '@/screens/DayBand.tsx'
import { shouldShowDayMode } from '@/domain/dayMode.ts'
import { firstUnchecked, listLabel, nextHand, plusMinutes, rowAt, rowTitle, stepLabel, stepsFor, stepsInTime, tonightIds, type NextHand, type RoutineId } from '@/domain/routines.ts'
import { taskIcon } from '@/domain/taskIcon.ts'
import { returnInfo } from '@/domain/profile.ts'
import type { AgeLabel, TakenRoutine } from '@/domain/types.ts'

export function DoScreen() {
  const store = useStore()
  const data = store.data
  const [focus, setFocus] = useState(true)
  const [showList, setShowList] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [later, setLater] = useState<string | null>(null)
  const [band, setBand] = useState<'night' | 'day' | null>(null)
  if (!data) return null
  const ages = data.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
  const ensoku = data.childEvents.some((event) => event.title.includes('遠足'))
  const taken = data.taken?.[store.today] ?? []
  const back = returnInfo(data.profile.home)?.back ?? null
  const hand = nextHand({ order: tonightIds(store.mode), taken, ages, ensoku })
  const showHand = Boolean(hand && hand.id !== later)
  const dayOn = shouldShowDayMode(data.profile)
  const showDay = dayOn && (band ?? 'day') === 'day'

  return (
    <div className="px-3.5 pt-3.5 pb-28">
      <DemoBar title={showDay ? '昼の家のこと' : '今夜やること'} />
      {dayOn ? (
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-sand p-1" data-testid="do-band">
          <button type="button" data-testid="do-night" className={`min-h-11 rounded-lg text-sm font-bold ${showDay ? '' : 'bg-white'}`} onClick={() => { setBand('night'); setFocus(false) }}>
            今夜
          </button>
          <button type="button" data-testid="do-day" className={`min-h-11 rounded-lg text-sm font-bold ${showDay ? 'bg-white' : ''}`} onClick={() => setBand('day')}>
            昼
          </button>
        </div>
      ) : null}
      {showDay ? <DayBand ages={ages} /> : null}
      {showDay ? null : (
      <>
      {taken.length === 0 ? (
        <div className="hare-card mt-4 px-4 py-8 text-center">
          <Icon name="do" size={40} className="mx-auto text-accent" />
          <p className="mt-3 text-sm leading-relaxed">今日で引き受けると、ここに手順が出ます。</p>
        </div>
      ) : null}
      {focus && !showList ? (
        <Focus taken={taken} ages={ages} ensoku={ensoku} cursor={cursor} setCursor={setCursor} back={back} hand={showHand ? hand : null} onLater={() => hand && setLater(hand.id)} onOpen={() => setShowList(true)} />
      ) : (
        taken.map((item) => <ListBlock key={item.routineId} item={item} ages={ages} ensoku={ensoku} back={back} hand={showHand && hand?.from === item.routineId ? hand : null} onLater={() => hand && setLater(hand.id)} />)
      )}
      {taken.length > 0 ? (
        <button type="button" data-testid={showList ? 'do-focus' : 'do-list'} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-accent" onClick={() => {
          if (showList) {
            const flat = taken.flatMap((item) => visibleSteps(item, ages, ensoku).map((step) => step.id))
            setCursor(firstUnchecked(flat, taken.flatMap((item) => item.checked)))
          }
          setShowList((value) => !value)
          setFocus(true)
        }}>
          {showList ? '1つずつ見る' : 'リストで見る'}
        </button>
      ) : null}
      </>
      )}
    </div>
  )
}

function ListBlock({
  item,
  ages,
  ensoku,
  back,
  hand,
  onLater,
}: {
  item: TakenRoutine
  ages: AgeLabel[]
  ensoku: boolean
  back: string | null
  hand: NextHand | null
  onLater: () => void
}) {
  const store = useStore()
  const id = item.routineId as RoutineId
  const steps = visibleSteps(item, ages, ensoku)
  const done = steps.filter((step) => item.checked.includes(step.id)).length
  const current = steps.find((step) => !item.checked.includes(step.id))?.id
  const at = item.at || rowAt(id, back)
  const label = listLabel(steps, at)
  return (
    <section className="mt-4">
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
        <div className="h-full rounded-full bg-margin" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-base font-bold">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <Icon name={taskIcon(id)} size={22} />
          </span>
          <span className="min-w-0">
            <Phrase text={rowTitle(id, ages, ensoku)} />
          </span>
        </h2>
        <p className="text-xs whitespace-nowrap text-muted">
          {label.start}〜 約{label.minutes}分
          <span className="ml-2 font-bold text-ink">{done}/{steps.length}</span>
        </p>
      </div>
      <div className="mt-2 space-y-2">
        {steps.map((step, index) => {
          const on = item.checked.includes(step.id)
          const here = step.id === current
          return (
            <button
              key={step.id}
              type="button"
              className={`hare-card flex min-h-11 w-full items-start gap-2 px-3 py-2 text-left ${here ? 'bg-margin-soft' : ''}`}
              onClick={() => store.toggleCheck(store.today, id, step.id)}
            >
              <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${on ? 'border-margin bg-margin text-white' : 'border-line bg-white text-ink'}`}>
                {on ? <Icon name="check" size={16} /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${on ? 'text-muted line-through' : ''}`}>
                  <span className="whitespace-nowrap">{plusMinutes(at, step.offsetMin ?? 0)} </span>
                  <Phrase text={stepLabel(step, ages)} />
                </span>
                <span className="block text-xs text-muted">約{step.minutes}分</span>
                {step.tip && !on ? <span className="mt-1 block rounded-lg bg-watch px-2 py-1 text-xs leading-relaxed text-watch-ink">{step.tip}</span> : null}
              </span>
            </button>
          )
        })}
      </div>
      {done === steps.length && steps.length > 0 ? (
        <>
          <p className="mt-3 text-base font-bold">今夜はこれでOK</p>
          {hand ? <Hand hand={hand} back={back} onLater={onLater} onOpen={() => undefined} /> : null}
        </>
      ) : null}
      <button type="button" className="mt-3 flex min-h-11 w-full items-center gap-2 text-left text-sm font-bold" onClick={() => store.askForecast(`${rowTitle(id, ages, ensoku)}の手順について、一つ短く。`)}>
        <Icon name="consult" size={18} className="text-accent" />
        この手順について相談
        <Icon name="chevron" size={16} className="ml-auto text-muted" />
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
  hand,
  onLater,
  onOpen,
}: {
  taken: TakenRoutine[]
  ages: AgeLabel[]
  ensoku: boolean
  cursor: number
  setCursor: (next: number) => void
  back: string | null
  hand: NextHand | null
  onLater: () => void
  onOpen: () => void
}) {
  const store = useStore()
  const flat = taken.flatMap((item) => visibleSteps(item, ages, ensoku).map((step) => ({ item, step })))
  const doneCount = flat.filter((row) => row.item.checked.includes(row.step.id)).length
  const done = flat.length > 0 && doneCount === flat.length
  if (done) {
    return (
      <>
        <article className="hare-card mt-4 px-4 py-8 text-center" data-testid="do-finish">
          <ProgressRing value={flat.length} total={flat.length}>
            <Icon name="check" size={36} className="text-margin" />
          </ProgressRing>
          <h2 className="mt-3 text-[26px] font-bold">今夜はこれでOK</h2>
          <p className="mt-2 text-sm">引き受けた手順は、ここまでです。</p>
        </article>
        {hand ? <Hand hand={hand} back={back} onLater={onLater} onOpen={onOpen} /> : null}
      </>
    )
  }
  const index = Math.min(cursor, Math.max(flat.length - 1, 0))
  const current = flat[index]
  if (!current) return null
  const id = current.item.routineId as RoutineId
  const at = current.item.at || rowAt(id, back)
  const next = flat[index + 1]
  return (
    <article className="hare-card mt-4 px-4 py-5 text-center">
      <ProgressRing value={doneCount} total={flat.length}>
        <Icon name={taskIcon(id)} size={36} />
      </ProgressRing>
      <p className="mt-3 text-sm font-bold text-margin">
        {rowTitle(id, ages, ensoku)} {index + 1}/{flat.length}
      </p>
      <h2 className="mt-2 text-[26px] leading-snug font-bold">
        <Phrase text={stepLabel(current.step, ages)} />
      </h2>
      <p className="mt-1 text-sm text-muted">
        {plusMinutes(at, current.step.offsetMin ?? 0)} ・ 約{current.step.minutes}分
      </p>
      {current.step.tip ? <p className="mt-3 rounded-xl bg-watch px-3 py-2 text-left text-sm leading-relaxed text-watch-ink">{current.step.tip}</p> : null}
      <button
        type="button"
        data-testid="do-done"
        className="mt-4 inline-flex min-h-[72px] w-full items-center justify-center gap-1.5 rounded-xl bg-margin text-lg font-bold text-white"
        onClick={() => {
          if (!current.item.checked.includes(current.step.id)) store.toggleCheck(store.today, id, current.step.id)
          setCursor(index + 1)
        }}
      >
        <Icon name="check" size={20} />
        できた
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" data-testid="do-back" className="min-h-11 rounded-xl bg-sand text-ink text-sm font-bold disabled:opacity-40" disabled={index === 0} onClick={() => setCursor(Math.max(index - 1, 0))}>
          ひとつ戻る
        </button>
        <button type="button" data-testid="do-skip" className="min-h-11 rounded-xl bg-sand text-ink text-sm font-bold" onClick={() => setCursor(index + 1)}>
          とばす
        </button>
      </div>
      {next ? (
        <p className="mt-3 text-xs text-muted">
          次：<Phrase text={`${stepLabel(next.step, ages)}（${next.step.minutes}分）`} />
        </p>
      ) : (
        <p className="mt-3 text-sm font-bold">今夜はこれでOK</p>
      )}
    </article>
  )
}

function Hand({ hand, back, onLater, onOpen }: { hand: NextHand; back: string | null; onLater: () => void; onOpen: () => void }) {
  const store = useStore()
  return (
    <NextHandCard
      hand={hand}
      onLater={onLater}
      onGo={() => {
        if (hand.taken) {
          onOpen()
          store.setTab('do')
          return
        }
        store.takeRoutine(store.today, hand.id, rowAt(hand.id, back))
        onOpen()
      }}
      onConsult={() => store.askForecast('今夜の流れについて、次の手順を一つ。')}
    />
  )
}

function visibleSteps(item: TakenRoutine, ages: AgeLabel[], ensoku: boolean) {
  const id = item.routineId as RoutineId
  const steps = stepsFor(id, ages, ensoku)
  const picked = item.partial?.length ? steps.filter((step) => item.partial?.includes(step.id)) : steps
  const extra = (item.extra ?? []).map((step) => ({ ...step, offsetMin: step.offsetMin ?? 0 }))
  return stepsInTime([...picked, ...extra])
}
