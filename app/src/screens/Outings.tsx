import { useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore } from '@/app/store.tsx'
import { outingSpots, packFor, type OutingSpot } from '@/domain/outings.ts'
import { copyText } from '@/lib/utils.ts'

type FilterId = 'weekend' | 'rain' | 'near'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'weekend', label: '今週末' },
  { id: 'rain', label: '雨の日' },
  { id: 'near', label: '近場' },
]

export function Outings() {
  const store = useStore()
  const data = store.data
  const [filters, setFilters] = useState<Record<FilterId, boolean>>({ weekend: true, rain: false, near: false })
  const [openId, setOpenId] = useState<string | null>(null)
  if (!data) return null
  const spots = outingSpots(data.profile).filter((spot) => {
    if (filters.weekend && !spot.weekend) return false
    if (filters.rain && !spot.rainOk) return false
    if (filters.near && spot.area !== '近場') return false
    return true
  })
  const open = spots.find((spot) => spot.id === openId) ?? outingSpots(data.profile).find((spot) => spot.id === openId) ?? null

  return (
    <div className="px-3.5 pt-3.5 pb-28" data-testid="outing-list">
      <DemoBar />
      <h1 className="text-lg font-bold">お出かけ</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">パートナーに出す案です。送る前に、自分の言葉へ直してください。</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <Chip
            key={filter.id}
            data-testid={`outing-filter-${filter.id}`}
            on={filters[filter.id]}
            onClick={() => setFilters((current) => ({ ...current, [filter.id]: !current[filter.id] }))}
          >
            {filter.label}
          </Chip>
        ))}
      </div>
      {open ? <OutingDetail spot={open} onBack={() => setOpenId(null)} /> : null}
      {!open ? (
        <ul className="mt-3 space-y-2">
          {spots.length === 0 ? <li className="text-[13px] text-muted">この条件の案は、今はありません。</li> : null}
          {spots.map((spot) => (
            <li key={spot.id}>
              <button
                type="button"
                data-testid={`outing-${spot.id}`}
                className="w-full rounded-[14px] bg-white px-3 py-3 text-left shadow-sm"
                onClick={() => setOpenId(spot.id)}
              >
                <p className="text-[15px] font-bold">{spot.title}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {spot.area}
                  {spot.rainOk ? ' ・ 雨でも' : ''}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed">{spot.summary}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-muted">いまの中身はサンプルです。あとから web / X / 人の投稿を、出典つきで足せます。</p>
    </div>
  )
}

function OutingDetail({ spot, onBack }: { spot: OutingSpot; onBack: () => void }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const pack = packFor(spot, data.profile)
  return (
    <article className="mt-3 rounded-[14px] bg-white p-3 shadow-sm" data-testid="outing-detail">
      <button type="button" className="text-[12px] font-bold text-accent-deep" onClick={onBack}>
        一覧へ
      </button>
      <h2 className="mt-1 text-[17px] font-bold">{spot.title}</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{spot.summary}</p>
      <Field label="駐車場" text={spot.parking} />
      <Field label="道中のトイレ・おむつ替え" text={spot.toilet} />
      <Field label="ごはん" text={spot.food} />
      <Field label="イベント情報" text={spot.eventNote} />
      <div className="mt-3">
        <p className="text-[12px] font-bold text-muted">持ち物</p>
        <p className="mt-1 text-[13px] leading-relaxed">{pack.join('、')}</p>
        <p className="mt-0.5 text-xs text-muted">子どもの年齢で足しています。</p>
      </div>
      <p className="mt-3 text-[12px] font-bold text-accent">提案の文</p>
      <p className="mt-1 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5 text-sm leading-relaxed">「{spot.phrase}」</p>
      <Button
        className="mt-2"
        size="sm"
        data-testid="outing-copy"
        onClick={() => {
          void copyText(spot.phrase).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
        }}
      >
        提案をコピー
      </Button>
      <p className="mt-2 text-xs text-muted">出典: {spot.source === 'mock' ? 'サンプル' : spot.source}{spot.fetchedAt ? ` ・ ${spot.fetchedAt}` : ''}</p>
    </article>
  )
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3">
      <p className="text-[12px] font-bold text-muted">{label}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed">{text}</p>
    </div>
  )
}
