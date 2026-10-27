import { useEffect, useState } from 'react'
import { useStore } from '@/app/store.tsx'
import { lineShareUrl } from '@/domain/export.ts'
import { returnInfo } from '@/domain/profile.ts'
import { rowTitle, shareLine, stepLabel, stepsFor, type RoutineId } from '@/domain/routines.ts'
import type { AgeLabel, Pronoun } from '@/domain/types.ts'
import { copyText } from '@/lib/utils.ts'

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
  const titles = (data?.taken?.[store.today] ?? []).map((item) => rowTitle(item.routineId as RoutineId, ages, ensoku))
  const generated = shareLine({ titles, pronoun: data?.profile.pronoun ?? '俺', back })
  const [text, setText] = useState(store.shareDraft || generated)
  const [dirty, setDirty] = useState(Boolean(store.shareDraft))
  const [link, setLink] = useState(true)
  const [ask, setAsk] = useState(false)
  useEffect(() => {
    if (!dirty) setText(store.shareDraft || generated)
  }, [generated, dirty, store.shareDraft])
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      if (sessionStorage.getItem('tone-app:await-share') !== '1') return
      sessionStorage.removeItem('tone-app:await-share')
      setAsk(true)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  if (!data) return null
  const body = link ? `${text}\n進み具合は、この画面で見られます。` : text
  return (
    <div className="px-3.5 pt-3.5 pb-28">
      <div className="flex min-h-11 items-center">
        <button type="button" className="min-h-11 min-w-11 text-sm font-bold" onClick={store.closePanel}>
          戻る
        </button>
        <h1 className="flex-1 text-center text-base font-bold">{data.profile.partner || '家族'}に共有</h1>
        <span className="w-11" />
      </div>
      <h2 className="mt-3 text-[25px] leading-snug font-bold">引き受けることを伝えよう</h2>
      <label className="mt-3 block text-xs text-muted" htmlFor="share-line">
        送る文（編集できます）
      </label>
      <textarea
        id="share-line"
        data-testid="share-line"
        className="mt-1 w-full rounded-xl bg-[#f7f1e8] px-3 py-2 text-sm leading-relaxed"
        rows={4}
        value={text}
        onChange={(event) => {
          setDirty(true)
          setText(event.target.value)
        }}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {PRONOUNS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold ${data.profile.pronoun === item.id ? 'bg-accent-deep text-white' : 'bg-white'}`}
            onClick={() => {
              store.patchProfile((profile) => ({ ...profile, pronoun: item.id }))
              setDirty(false)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={link} onChange={(event) => setLink(event.target.checked)} />
        やることの進み具合も見られるようにする
      </label>
      {link ? (
        <button type="button" data-testid="open-preview" className="mt-1 text-sm font-bold text-margin" onClick={store.openPreview}>
          相手にはこう見えます
        </button>
      ) : null}
      <a
        data-testid="share-send"
        className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#06c755] text-base font-bold text-white no-underline"
        href={lineShareUrl(body)}
        onClick={() => sessionStorage.setItem('tone-app:await-share', '1')}
      >
        LINEで送る
      </a>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="share-copy"
          className="min-h-11 rounded-xl bg-[#f3eee6] text-sm font-bold"
          onClick={() => {
            void copyText(body).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
          }}
        >
          コピー
        </button>
        <button type="button" data-testid="share-later" className="min-h-11 rounded-xl bg-[#f3eee6] text-sm font-bold" onClick={store.closePanel}>
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
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-margin text-base font-bold text-white"
              onClick={() => {
                store.markShared(store.today)
                setAsk(false)
                store.closePanel()
                store.showToast('共有しました')
              }}
            >
              送った
            </button>
            <button type="button" data-testid="sent-later" className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold" onClick={() => setAsk(false)}>
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
      <h1 className="mt-2 text-[25px] leading-snug font-bold">今夜、パパが引き受けていること</h1>
      <p className="mt-1 text-xs text-muted">{new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })} 更新</p>
      {taken.map((item) => {
        const id = item.routineId as RoutineId
        const steps = item.partial?.length ? stepsFor(id, ages, ensoku).filter((step) => item.partial?.includes(step.id)) : stepsFor(id, ages, ensoku)
        const withExtra = [...steps.map((step) => ({ ...step, title: stepLabel(step, ages) })), ...(item.extra ?? [])]
        const done = withExtra.filter((step) => item.checked.includes(step.id)).length
        return (
          <section key={item.routineId} className="mt-3 rounded-[14px] bg-white p-3 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-bold">{rowTitle(id, ages, ensoku)}</h2>
              <p className="text-xs whitespace-nowrap text-margin">{withExtra.length}つの手順のうち{done}つ完了</p>
            </div>
            <ul className="mt-2 space-y-2">
              {withExtra.map((step) => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${item.checked.includes(step.id) ? 'border-margin bg-margin text-xs text-white' : 'border-[#c8bfb4]'}`}>{item.checked.includes(step.id) ? '✓' : ''}</span>
                  {step.title}
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
