import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore } from '@/app/store.tsx'
import { extractSchedule } from '@/ai/extract.ts'
import { childName, matchChildId, splitItems, upcomingChildEvents, type ExtractCandidate } from '@/domain/childEvents.ts'
import { dayName } from '@/domain/dates.ts'
import { CHILD_CATEGORIES, type ChildCategory, type ChildEvent, type ChildEventSource } from '@/domain/types.ts'
import { downscaleToJpeg } from '@/lib/image.ts'
import { uid } from '@/lib/utils.ts'

type Draft = {
  key: string
  selected: boolean
  childId: string
  title: string
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  category: ChildCategory
  items: string
  deadline: boolean
  notes: string
  confidence: number
}

type View =
  | { kind: 'list' }
  | { kind: 'image' }
  | { kind: 'form'; id?: string }
  | { kind: 'preview'; file: File; url: string }
  | { kind: 'confirm'; rows: Draft[]; sample: boolean }

const field = 'mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink'

export function ChildSheet({ editId, image = false }: { editId?: string; image?: boolean }) {
  const store = useStore()
  const [view, setView] = useState<View>(editId ? { kind: 'form', id: editId } : image ? { kind: 'image' } : { kind: 'list' })
  const [busy, setBusy] = useState(false)

  const pick = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      store.showToast('画像を選んでください')
      return
    }
    setView({ kind: 'preview', file, url: URL.createObjectURL(file) })
  }

  const read = async (file: File) => {
    const data = store.data
    if (!data || busy) return
    setBusy(true)
    try {
      const jpeg = await downscaleToJpeg(file)
      const result = await extractSchedule({
        jpegBase64: jpeg,
        today: store.today,
        children: data.profile.kids.map((kid) => ({ id: kid.id, name: kid.name })),
      })
      setView({
        kind: 'confirm',
        sample: result.sample,
        rows: result.candidates.map((candidate) => toDraft(candidate, data.profile.kids)),
      })
    } catch (error) {
      store.showToast(error instanceof Error ? error.message : 'この画像は読み取れませんでした')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-accent">子どもの予定</p>
        <button type="button" className="text-xs text-muted" data-testid="child-close" onClick={store.closeSheet}>
          閉じる
        </button>
      </div>
      {view.kind === 'list' ? <List onAdd={() => setView({ kind: 'form' })} onEdit={(id) => setView({ kind: 'form', id })} onPick={pick} /> : null}
      {view.kind === 'image' ? <ImageCapture onPick={pick} onBack={() => setView({ kind: 'list' })} /> : null}
      {view.kind === 'form' ? <EventForm key={view.id ?? 'new'} id={view.id} onBack={() => setView({ kind: 'list' })} /> : null}
      {view.kind === 'preview' ? (
        <Preview file={view.file} url={view.url} busy={busy} onBack={() => setView({ kind: 'list' })} onRead={() => void read(view.file)} />
      ) : null}
      {view.kind === 'confirm' ? (
        <Confirm
          rows={view.rows}
          sample={view.sample}
          onChange={(rows) => setView({ kind: 'confirm', rows, sample: view.sample })}
          onBack={() => setView({ kind: 'list' })}
        />
      ) : null}
    </div>
  )
}

function ImageCapture({ onPick, onBack }: { onPick: (file: File | undefined) => void; onBack: () => void }) {
  return (
    <div data-testid="child-image-mode">
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        読み取りのため、画像を外部のAI（OpenAI）に送ります。このアプリには画像を保存しません。お子さんの顔や名前が写らないように撮るのがおすすめです。予定は確認してから入ります。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-accent-soft px-3 text-xs font-bold text-accent-deep">
          画像を選ぶ
          <input
            className="hidden"
            data-testid="child-image"
            type="file"
            accept="image/*"
            onChange={(event) => {
              onPick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-accent-soft px-3 text-xs font-bold text-accent-deep">
          写真を撮る
          <input
            className="hidden"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => {
              onPick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
      </div>
      <button type="button" className="mt-3 min-h-11 text-[13px] text-muted" onClick={onBack}>
        一覧へ
      </button>
    </div>
  )
}

function List({ onAdd, onEdit, onPick }: { onAdd: () => void; onEdit: (id: string) => void; onPick: (file: File | undefined) => void }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const rows = upcomingChildEvents(data.childEvents, store.today, 30)
  return (
    <div data-testid="child-list">
      <p className="mt-1 text-[13px] leading-relaxed text-muted">お便り、行事予定、予約票、LINEの画面を読み取れます。入れる前に中身を確認します。</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" onClick={onAdd}>
          手で入れる
        </Button>
        <label className="inline-flex cursor-pointer items-center rounded-lg bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-accent-deep">
          画像を選ぶ
          <input
            className="hidden"
            data-testid="child-image"
            type="file"
            accept="image/*"
            onChange={(event) => {
              onPick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
        <label className="inline-flex cursor-pointer items-center rounded-lg bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-accent-deep">
          写真を撮る
          <input
            className="hidden"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => {
              onPick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
      </div>
      {data.profile.kids.length === 0 ? <p className="mt-2 text-[13px] text-muted">先に、うちの画面で子どもを入れてください。</p> : null}
      {rows.length === 0 ? <p className="mt-3 text-[13px] text-muted">これからの予定はまだありません。</p> : null}
      <div className="mt-3 space-y-2">
        {rows.map((event) => {
          const name = childName(data.profile.kids, event.childId)
          return (
            <button
              key={event.id}
              type="button"
              className="w-full rounded-xl bg-white px-3 py-2.5 text-left"
              onClick={() => onEdit(event.id)}
            >
              <p className="text-xs text-muted">
                {dayName(event.date, store.today)} {event.allDay || !event.startTime ? '終日' : event.startTime}
                {name ? ` · ${name}` : ''} · {event.category}
                {event.deadline ? ' · 期限' : ''}
              </p>
              <p className="text-sm font-bold">{event.title}</p>
              {event.items.length > 0 ? <p className="text-[12px] text-muted">持ち物: {event.items.join('、')}</p> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Preview({ file, url, busy, onBack, onRead }: { file: File; url: string; busy: boolean; onBack: () => void; onRead: () => void }) {
  return (
    <div data-testid="child-preview">
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        読み取りのため、画像を外部のAI（OpenAI）に送ります。このアプリには画像を保存しません。お子さんの顔や名前が写らないように撮るのがおすすめです。予定は確認してから入ります。
      </p>
      <img src={url} alt={file.name} className="mt-2 max-h-48 w-full rounded-xl object-contain bg-white" />
      <div className="mt-3 flex gap-2">
        <Button data-testid="child-read" disabled={busy} onClick={onRead}>
          {busy ? '読み取っています…' : '読み取る'}
        </Button>
        <Button variant="quiet" onClick={onBack}>
          戻る
        </Button>
      </div>
    </div>
  )
}

function Confirm({
  rows,
  sample,
  onChange,
  onBack,
}: {
  rows: Draft[]
  sample: boolean
  onChange: (rows: Draft[]) => void
  onBack: () => void
}) {
  const store = useStore()
  const kids = store.data?.profile.kids ?? []
  const patch = (key: string, next: Partial<Draft>) => onChange(rows.map((row) => (row.key === key ? { ...row, ...next } : row)))
  const save = () => {
    const events: Omit<ChildEvent, 'id'>[] = rows
      .filter((row) => row.selected && row.title.trim() && row.date)
      .map((row) => ({
        childId: row.childId,
        title: row.title.trim(),
        date: row.date,
        startTime: row.allDay ? '' : row.startTime,
        endTime: row.allDay ? '' : row.endTime,
        allDay: row.allDay,
        category: row.category,
        items: splitItems(row.items),
        deadline: row.deadline,
        notes: row.notes.trim(),
        source: 'image' as const,
      }))
    if (events.length === 0) {
      store.showToast('入れる予定を1件選んでください')
      return
    }
    store.addChildEvents(events)
    store.closeSheet()
  }
  return (
    <div data-testid="child-confirm">
      {sample ? <p className="mt-1 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-deep">サンプル読み取り</p> : null}
      <p className="mt-1 text-[13px] leading-relaxed text-muted">候補です。使うものだけ残して、子どもと中身を直してから入れてください。</p>
      {rows.length === 0 ? <p className="mt-2 text-[13px] text-muted">読み取れた予定がありませんでした。</p> : null}
      <div className="mt-2 space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="rounded-xl bg-white px-3 py-2.5">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={row.selected} onChange={(event) => patch(row.key, { selected: event.target.checked })} />
              入れる
              <span className="ml-auto text-xs font-normal text-muted">確信度 {Math.round(row.confidence * 100)}%</span>
            </label>
            <input className={field} value={row.title} aria-label="予定の名前" onChange={(event) => patch(row.key, { title: event.target.value })} />
            <div className="mt-2 flex gap-2">
              <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="date" value={row.date} onChange={(event) => patch(row.key, { date: event.target.value })} />
              <select
                className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                value={row.childId}
                aria-label="子ども"
                onChange={(event) => patch(row.key, { childId: event.target.value })}
              >
                <option value="">子ども未設定</option>
                {kids.map((kid) => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {CHILD_CATEGORIES.map((category) => (
                <Chip key={category} className="px-2 py-1 text-[12px]" on={row.category === category} onClick={() => patch(row.key, { category })}>
                  {category}
                </Chip>
              ))}
            </div>
            <label className="mt-2 flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={row.allDay} onChange={(event) => patch(row.key, { allDay: event.target.checked })} />
              終日
            </label>
            {row.allDay ? null : (
              <div className="mt-1 flex gap-2">
                <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="time" value={row.startTime} onChange={(event) => patch(row.key, { startTime: event.target.value })} />
                <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="time" value={row.endTime} onChange={(event) => patch(row.key, { endTime: event.target.value })} />
              </div>
            )}
            <label className="mt-2 block text-[12px] text-muted">
              持ち物
              <input className={field} value={row.items} placeholder="お弁当、水筒" onChange={(event) => patch(row.key, { items: event.target.value })} />
            </label>
            <label className="mt-2 flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={row.deadline} onChange={(event) => patch(row.key, { deadline: event.target.checked })} />
              提出・支払いの期限
            </label>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button data-testid="child-save" onClick={save}>
          選んだものを入れる
        </Button>
        <Button variant="quiet" onClick={onBack}>
          入れない
        </Button>
      </div>
    </div>
  )
}

function EventForm({ id, onBack }: { id?: string; onBack: () => void }) {
  const store = useStore()
  const data = store.data
  const existing = data?.childEvents.find((event) => event.id === id)
  const [childId, setChildId] = useState(existing?.childId ?? data?.profile.kids[0]?.id ?? '')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [date, setDate] = useState(existing?.date ?? store.today)
  const [allDay, setAllDay] = useState(existing?.allDay ?? false)
  const [startTime, setStartTime] = useState(existing?.startTime ?? '')
  const [endTime, setEndTime] = useState(existing?.endTime ?? '')
  const [category, setCategory] = useState<ChildCategory>(existing?.category ?? '行事')
  const [items, setItems] = useState(existing?.items.join('、') ?? '')
  const [deadline, setDeadline] = useState(existing?.deadline ?? false)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  if (!data) return null
  const save = () => {
    if (!title.trim() || !date) {
      store.showToast('名前と日付を入れてください')
      return
    }
    const source: ChildEventSource = existing?.source ?? 'manual'
    store.upsertChildEvent({
      id: existing?.id ?? uid(),
      childId,
      title,
      date,
      startTime,
      endTime,
      allDay,
      category,
      items: splitItems(items),
      deadline,
      notes,
      source,
    })
    onBack()
  }
  return (
    <div data-testid="child-form">
      <p className="mt-1 text-[15px] font-bold">{existing ? '予定を直す' : '予定を入れる'}</p>
      {data.profile.kids.length === 0 ? <p className="mt-2 text-[13px] text-muted">先に、うちの画面で子どもを入れてください。予定だけ先に入れることもできます。</p> : null}
      <label className="mt-2 block text-[12px] text-muted">
        子ども
        <select className={field} value={childId} onChange={(event) => setChildId(event.target.value)}>
          <option value="">未設定</option>
          {data.profile.kids.map((kid) => (
            <option key={kid.id} value={kid.id}>
              {kid.name}
              {kid.schoolName ? `（${kid.schoolName}）` : ''}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-2 block text-[12px] text-muted">
        名前
        <input className={field} data-testid="child-title" value={title} placeholder="遠足、健診、連絡帳" onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="mt-2 block text-[12px] text-muted">
        日付
        <input className={field} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        {CHILD_CATEGORIES.map((item) => (
          <Chip key={item} className="px-2 py-1 text-[12px]" on={category === item} onClick={() => setCategory(item)}>
            {item}
          </Chip>
        ))}
      </div>
      <label className="mt-2 flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />
        終日
      </label>
      {allDay ? null : (
        <div className="mt-1 flex gap-2">
          <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="time" value={startTime} aria-label="開始" onChange={(event) => setStartTime(event.target.value)} />
          <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="time" value={endTime} aria-label="終了" onChange={(event) => setEndTime(event.target.value)} />
        </div>
      )}
      <label className="mt-2 block text-[12px] text-muted">
        持ち物
        <input className={field} value={items} placeholder="お弁当、水筒" onChange={(event) => setItems(event.target.value)} />
      </label>
      <label className="mt-2 flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={deadline} onChange={(event) => setDeadline(event.target.checked)} />
        提出・支払いの期限
      </label>
      <label className="mt-2 block text-[12px] text-muted">
        メモ
        <input className={field} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      <div className="mt-3 flex gap-2">
        <Button data-testid="child-form-save" onClick={save}>
          保存
        </Button>
        <Button variant="quiet" onClick={onBack}>
          戻る
        </Button>
        {existing ? (
          <Button
            variant="quiet"
            onClick={() => {
              store.deleteChildEvent(existing.id)
              onBack()
            }}
          >
            消す
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function toDraft(candidate: ExtractCandidate, kids: { id: string; name: string }[]): Draft {
  return {
    key: uid(),
    selected: candidate.confidence >= 0.5,
    childId: matchChildId(candidate.childGuess, kids),
    title: candidate.title,
    date: candidate.date,
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    allDay: candidate.allDay,
    category: candidate.category,
    items: candidate.items.join('、'),
    deadline: candidate.deadline,
    notes: candidate.notes,
    confidence: candidate.confidence,
  }
}
