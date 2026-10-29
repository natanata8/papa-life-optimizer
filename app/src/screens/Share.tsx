import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons.tsx'
import { HeroHome, RoofMark } from '@/components/marks.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { houseLight, takenHomeLine } from '@/domain/house.ts'
import { takenMargin } from '@/domain/glance.ts'
import { useStore } from '@/app/store.tsx'
import { lineShareUrl } from '@/domain/export.ts'
import { formatMd } from '@/domain/dates.ts'
import { returnInfo } from '@/domain/profile.ts'
import { completionBound, rowTitle, shareLine, stepLabel, stepsFor, stepsInTime, swapPronoun, type RoutineId } from '@/domain/routines.ts'
import { taskIcon } from '@/domain/taskIcon.ts'
import type { AgeLabel, Mode, Pronoun } from '@/domain/types.ts'
import { copyText } from '@/lib/utils.ts'

function demoStamp(today: string, mode: Mode, home: string | null): string {
  const info = returnInfo(home)
  const time = mode === '帰宅前' ? info?.open ?? info?.back ?? '' : info?.back ?? ''
  return `${formatMd(today)} ${time}`.trim()
}

const PRONOUNS: { id: Pronoun; label: string }[] = [
  { id: '俺', label: '俺' },
  { id: '僕', label: '僕' },
  { id: '自分', label: '自分' },
  { id: '', label: '名前なし' },
]

export function ShareScreen() {
  const store = useStore()
  const data = store.data
  const ages = data?.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age)) ?? []
  const ensoku = Boolean(data?.childEvents.some((event) => event.title.includes('遠足')))
  const back = data ? returnInfo(data.profile.home)?.back ?? null : null
  const takenNow = data?.taken?.[store.today] ?? []
  const titles = takenNow.map((item) => rowTitle(item.routineId as RoutineId, ages, ensoku))
  const generated = shareLine({
    titles,
    pronoun: data?.profile.pronoun ?? '俺',
    back,
    bound: completionBound(takenNow.map((item) => item.routineId)),
  })
  const [text, setText] = useState(store.shareDraft || generated)
  const [dirty, setDirty] = useState(Boolean(store.shareDraft))
  const [ask, setAsk] = useState(() => localStorage.getItem('tone-app:await-share') === '1')
  useEffect(() => {
    if (!dirty) setText(store.shareDraft || generated)
  }, [generated, dirty, store.shareDraft])
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      if (localStorage.getItem('tone-app:await-share') === '1') setAsk(true)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  if (!data) return null
  const body = text
  const heading = store.shareHeading || '引き受けることを伝えよう'
  return (
    <div className="px-3.5 pt-3.5 pb-28">
      <div className="flex min-h-11 items-center">
        <button type="button" className="min-h-11 min-w-11 text-sm font-bold" onClick={store.closePanel}>
          戻る
        </button>
        <h1 className="flex flex-1 items-center justify-center gap-1.5 text-center text-base font-bold">
          <RoofMark size={22} className="text-accent" />
          {data.profile.partner || '家族'}に共有
        </h1>
        <span className="w-11" />
      </div>
      <h2 className="mt-3 text-[25px] leading-snug font-bold">{heading}</h2>
      <section className="hare-card mt-3 flex items-center gap-3 p-3" data-testid="share-home">
        <HeroHome {...houseLight({ tasks: takenNow.length, minutes: takenMargin(takenNow, ages, ensoku).minutes })} className="h-[72px] w-[104px] shrink-0" />
        <p className="min-w-0 text-sm font-extrabold" data-testid="share-home-line">
          <Phrase text={takenHomeLine(takenNow.map((item) => item.routineId))} />
        </p>
      </section>
      <label className="mt-3 block text-xs text-muted" htmlFor="share-line">
        送る文（編集できます）
      </label>
      <div className="mt-1 rounded-2xl bg-[#dfe7ea] px-3 py-3">
        <textarea
          id="share-line"
          data-testid="share-line"
          className="block w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm leading-relaxed outline-none"
          rows={4}
          value={text}
          onChange={(event) => {
            setDirty(true)
            setText(event.target.value)
          }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRONOUNS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-bold ${data.profile.pronoun === item.id ? 'bg-accent-deep text-white' : 'bg-white'}`}
            onClick={() => {
              const from = data.profile.pronoun
              const to = item.id
              store.patchProfile((profile) => ({ ...profile, pronoun: to }))
              if (!dirty || from === to) return
              const swapped = swapPronoun(text, from, to)
              if (swapped !== null) setText(swapped)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button type="button" data-testid="open-preview" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-margin" onClick={store.openPreview}>
        相手にはこう見えます
      </button>
      <a
        data-testid="share-send"
        className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-md border-2 border-accent bg-white text-base font-extrabold text-accent no-underline active:bg-accent-soft"
        href={lineShareUrl(body)}
        onClick={() => localStorage.setItem('tone-app:await-share', '1')}
      >
        <Icon name="line" size={18} />
        LINEで送る
      </a>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="share-copy"
          className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-sand text-ink text-sm font-bold"
          onClick={() => {
            void copyText(body).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
          }}
        >
          <Icon name="copy" size={16} />
          コピー
        </button>
        <button type="button" data-testid="share-later" className="min-h-11 rounded-xl bg-sand text-ink text-sm font-bold" onClick={store.closePanel}>
          あとで
        </button>
      </div>
      {ask ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" data-testid="sent-sheet">
          <div className="w-full max-w-[430px] rounded-t-3xl bg-paper px-4 pt-4 pb-6">
            <h2 className="text-lg font-bold">送れましたか？</h2>
            <p className="mt-1 text-sm leading-relaxed">「送った」を押すと共有済みになります。コピーしただけでは完了になりません。</p>
            <button
              type="button"
              data-testid="sent-yes"
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-margin text-base font-bold text-white"
              onClick={() => {
                localStorage.removeItem('tone-app:await-share')
                store.markShared(store.today)
                setAsk(false)
                store.closePanel()
                store.showToast('共有しました')
              }}
            >
              <Icon name="sent" size={18} />
              送った
            </button>
            <button type="button" data-testid="sent-later" className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold" onClick={() => {
                localStorage.removeItem('tone-app:await-share')
                setAsk(false)
              }}>
              まだ（あとで送る）
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function PartnerPreview() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const ages = data.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
  const ensoku = data.childEvents.some((event) => event.title.includes('遠足'))
  const taken = data.taken?.[store.today] ?? []
  return (
    <div className="px-3.5 pt-3.5 pb-28" data-testid="partner-preview">
      <p className="text-center text-xs font-bold text-muted">相手にはこう見えます</p>
      <button type="button" className="mt-2 min-h-11 text-sm font-bold" onClick={() => store.openShare()}>
        戻る
      </button>
      <h1 className="mt-2 text-[25px] leading-snug font-bold">
        <Phrase text="今夜、パパが引き受けていること" />
      </h1>
      <p className="mt-1 text-xs text-muted">{demoStamp(store.today, store.mode, data.profile.home)} 更新</p>
      {taken.map((item) => {
        const id = item.routineId as RoutineId
        const steps = item.partial?.length ? stepsFor(id, ages, ensoku).filter((step) => item.partial?.includes(step.id)) : stepsFor(id, ages, ensoku)
        const withExtra = stepsInTime([...steps.map((step) => ({ ...step, title: stepLabel(step, ages) })), ...(item.extra ?? []).map((step) => ({ ...step, offsetMin: step.offsetMin ?? 0 }))])
        const done = withExtra.filter((step) => item.checked.includes(step.id)).length
        return (
          <section key={item.routineId} className="hare-card mt-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                  <Icon name={taskIcon(id)} size={16} />
                </span>
                {rowTitle(id, ages, ensoku)}
              </h2>
              <p className="text-xs whitespace-nowrap text-margin">{withExtra.length}つの手順のうち{done}つ完了</p>
            </div>
            <ul className="mt-2 space-y-2">
              {withExtra.map((step) => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${item.checked.includes(step.id) ? 'border-margin bg-margin text-white' : 'border-line'}`}>{item.checked.includes(step.id) ? <Icon name="check" size={12} /> : ''}</span>
                  <Phrase text={step.title} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <p className="mt-4 text-center text-xs leading-relaxed text-muted">アプリもログインも要りません。チェックはパパだけができます。</p>
    </div>
  )
}
