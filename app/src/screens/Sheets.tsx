import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore, type Sheet } from '@/app/store.tsx'
import { forecastFor } from '@/domain/forecastView.ts'
import { SceneGrid } from '@/components/SceneGrid.tsx'
import { ChildSheet } from '@/screens/children/ChildSheet.tsx'
import { dayName } from '@/domain/dates.ts'
import { downloadIcs, googleCalendarUrl, lineShareUrl } from '@/domain/export.ts'
import { DAILY_TASKS, INV_DEFS, invisibleOn, taskSnippet } from '@/domain/invisible.ts'
import { partnerDay } from '@/domain/partnerDay.ts'
import { NICE_KINDS, NOTE_OPTIONS, REASONS, type EventKind, type NiceKind, type NiceRecurrence } from '@/domain/types.ts'
import { nicePlaceholder } from '@/domain/nice.ts'
import { copyText } from '@/lib/utils.ts'

export function Sheets() {
  const store = useStore()
  if (!store.sheet || !store.data) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={(event) => event.target === event.currentTarget && store.closeSheet()}>
      <div className="tone-sheet max-h-[88dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-paper px-4 pt-4 pb-6 shadow-xl">
        <SheetBody sheet={store.sheet} />
      </div>
    </div>
  )
}

function SheetBody({ sheet }: { sheet: Sheet }) {
  if (sheet.type === 'add') return <AddSheet id={sheet.suggestionId} />
  if (sheet.type === 'invisible') return <InvisibleSheet date={sheet.date} itemKey={sheet.key} />
  if (sheet.type === 'wife') return <WifeSheet date={sheet.date} blockId={sheet.blockId} />
  if (sheet.type === 'daily') return <DailySheet taskId={sheet.taskId} />
  if (sheet.type === 'event') return <EventSheet id={sheet.id} />
  if (sheet.type === 'addEvent') return <AddEventSheet />
  if (sheet.type === 'addNice') return <AddNiceSheet />
  if (sheet.type === 'children') return <ChildSheet editId={sheet.editId} image={sheet.image} />
  if (sheet.type === 'quick') return <QuickSheet />
  if (sheet.type === 'forecast') return <ForecastSheet slotId={sheet.slotId} date={sheet.date} />
  if (sheet.type === 'step') return <StepSheet id={sheet.id} />
  if (sheet.type === 'reason') return <ReasonSheet stepId={sheet.stepId} status={sheet.status} />
  if (sheet.type === 'notif') return <NotifSheet />
  return <ResetSheet />
}

function AddSheet({ id }: { id: string }) {
  const store = useStore()
  const suggestion = store.data?.suggestions[id]
  const [date, setDate] = useState(suggestion?.date ?? store.today)
  const [time, setTime] = useState(suggestion?.time ?? '')
  if (!suggestion) return <p className="text-sm">この一手は見つかりませんでした。</p>
  const line = `${dayName(date, store.today)} ${time} ${suggestion.title}`
  const saveAnd = (after?: () => void) => {
    store.saveSuggestion(id, date, time)
    after?.()
  }
  return (
    <div data-testid="sheet-add">
      <p className="text-xs font-bold text-accent">カレンダーに入れる</p>
      <p className="mt-1 text-[15px] font-bold">{suggestion.title}</p>
      <p className="text-xs text-muted">
        {dayName(suggestion.date, store.today)} {suggestion.time}
      </p>
      <div className="mt-2 flex gap-2">
        <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
      </div>
      <Option
        icon="📅"
        title="ハレゴトのカレンダーに入れる"
        note="翌日に「どうだった？」と聞きます"
        onClick={() => saveAnd()}
      />
      <Option
        icon="🗓"
        title="Googleカレンダーにも入れる"
        note="Googleの追加画面が開きます（自分で保存）"
        href={googleCalendarUrl(suggestion.title, date, time, suggestion.why)}
        onClick={() => saveAnd()}
      />
      <Option
        icon="🌲"
        title="TimeTree / iPhoneカレンダー用（.ics）"
        note="ファイルを保存して、アプリに読み込みます"
        onClick={() =>
          saveAnd(() => {
            downloadIcs(suggestion.title, date, time)
            store.showToast('.ics を保存しました')
          })
        }
      />
      <Option icon="💬" title="LINEで自分あて・パートナーあてに送る" note="送る相手はLINEで選びます" href={lineShareUrl(line)} onClick={() => saveAnd()} />
      <Button className="mt-2" size="lg" variant="quiet" onClick={store.closeSheet}>
        やめる
      </Button>
      <p className="mt-2 text-xs leading-relaxed text-muted">外部への連携はリンクを開くだけです。自動では送りません。</p>
    </div>
  )
}

function Option({
  icon,
  title,
  note,
  onClick,
  href,
}: {
  icon: string
  title: string
  note: string
  onClick: () => void
  href?: string
}) {
  const className = 'mt-2 flex w-full items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-left'
  const body = (
    <>
      <span className="text-xl">{icon}</span>
      <span>
        <b className="block text-sm">{title}</b>
        <span className="text-[12px] text-muted">{note}</span>
      </span>
    </>
  )
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer" onClick={onClick}>
        {body}
      </a>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  )
}

function WifeSheet({ date, blockId }: { date: string; blockId: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const block = partnerDay(date, data.profile, data.events, data.childEvents, data.hidden, store.today).blocks.find((item) => item.id === blockId)
  if (!block) return <p className="text-sm">この推定は、今は出ていません。</p>
  return (
    <div data-testid="sheet-wife">
      <span className="inline-block rounded-full bg-[#f3f0ea] px-2 py-0.5 text-xs font-bold text-muted">推定</span>
      <p className="mt-1 text-[17px] font-bold">{block.line}</p>
      <p className="text-xs text-muted">
        {dayName(date, store.today)} {block.time}
        {block.minutes ? ` ｜ 目安 約${block.minutes}分` : ''}
      </p>
      <p className="mt-3 text-sm leading-relaxed">{block.detail}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">登録された予定ではありません。編集も、チェックもできません。</p>
      <h2 className="mt-3 text-sm font-bold">ありがとう、の一例</h2>
      <p className="mt-1 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5 text-sm leading-relaxed">「{block.thanks}」</p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          data-testid="wife-thanks"
          onClick={() => {
            void copyText(block.thanks).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
          }}
        >
          コピー
        </Button>
        <Button size="sm" variant="ghost" data-testid="wife-close" onClick={store.closeSheet}>
          閉じる
        </Button>
      </div>
    </div>
  )
}

function InvisibleSheet({ date, itemKey }: { date: string; itemKey: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const item = invisibleOn(date, data.profile, data.events, data.hidden, store.today).find((row) => row.key === itemKey)
  if (!item) return <p className="text-sm">この日には表示していません。</p>
  const def = INV_DEFS[item.def]
  const snippet = taskSnippet(def.taskId)
  const adopted = data.steps.some((step) => step.invisibleKey === `${date}:${itemKey}`)
  const note = data.notes[def.taskId] ?? ''
  return (
    <div data-testid="sheet-invisible">
      <span className="inline-block rounded-full bg-inv px-2 py-0.5 text-xs font-bold text-inv-ink">👀 見えない仕事</span>
      <p className="mt-1 text-[17px] font-bold">{item.title}</p>
      <p className="text-xs text-muted">
        {dayName(date, store.today)}・{item.slot} ｜ {item.rel} ｜ 目安 約{def.minutes}分
      </p>
      <h2 className="mt-3 text-sm font-bold">なぜ大事？</h2>
      <p className="mt-1 text-sm leading-relaxed">{def.why}</p>
      <h2 className="mt-3 text-sm font-bold">やること</h2>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
        {def.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h2 className="mt-3 text-sm font-bold">
        いつもは誰がやっている？
        <span className="ml-1 text-xs font-normal text-muted">自分用のメモ・相手には見えません・任意</span>
      </h2>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {NOTE_OPTIONS.map((option) => (
          <Chip key={option} on={note === option} onClick={() => store.setNote(def.taskId, option)}>
            {option}
          </Chip>
        ))}
      </div>
      {adopted ? (
        <Button className="mt-3" size="lg" variant="good">
          ✓ 一手にしました
        </Button>
      ) : (
        <Button className="mt-3" size="lg" data-testid="adopt-invisible" onClick={() => store.adoptInvisible(date, itemKey)}>
          これやる → 一手に追加
        </Button>
      )}
      <Button className="mt-2" size="lg" variant="ghost" onClick={() => store.askInvisible(date, itemKey)}>
        💬 AIに聞く（やり方・伝え方）
      </Button>
      <div className="mt-3 flex justify-between text-xs text-muted">
        <button type="button" onClick={() => store.hideInvisible(date, itemKey)}>
          この日は表示しない
        </button>
        <button type="button" onClick={store.closeSheet}>
          閉じる
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        もとのデータ：家事・育児タスク一覧 {def.taskId}
        {snippet ? `「${snippet.title}」（${snippet.category}・${snippet.frequency}・一覧では「${snippet.visibility}」）` : ''}
        。手順と「なぜ大事」は叩き台の例文です。
      </p>
    </div>
  )
}

function DailySheet({ taskId }: { taskId: string }) {
  const store = useStore()
  const task = DAILY_TASKS.find((item) => item.id === taskId)
  if (!task) return null
  return (
    <div data-testid="sheet-daily">
      <span className="inline-block rounded-full bg-inv px-2 py-0.5 text-xs font-bold text-inv-ink">👀 毎日まわっている見えない仕事</span>
      <p className="mt-1 text-[17px] font-bold">{task.title}</p>
      <p className="text-xs text-muted">
        {task.frequency}・約{task.minutes}分・{task.category}
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        毎日の小さな確認は、やっている人以外からは見えません。全部を代わる必要はありません。1つだけ、自分の担当にできるものがないか見てみてください。
      </p>
      <Button className="mt-3" size="lg" onClick={() => store.adoptDaily(taskId)}>
        明日の朝、これを自分がやる → 一手に追加
      </Button>
      <Button className="mt-2" size="lg" variant="quiet" onClick={store.closeSheet}>
        閉じる
      </Button>
      <p className="mt-2 text-xs text-muted">もとのデータ：家事・育児タスク一覧 {taskId}</p>
    </div>
  )
}

function EventSheet({ id }: { id: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const event = data.events.find((item) => item.id === id)
  if (!event) return null
  const related = [-3, -2, -1, 0, 1, 2].flatMap((offset) => {
    const date = shift(event.date, offset)
    return invisibleOn(date, data.profile, data.events, data.hidden, store.today).filter((item) => item.eventId === event.id)
  })
  return (
    <div>
      <span className="inline-block rounded-full bg-event px-2 py-0.5 text-xs font-bold text-event-ink">家族の予定</span>
      <p className="mt-1 text-[17px] font-bold">{event.title}</p>
      <p className="text-xs text-muted">
        {dayName(event.date, store.today)} {event.time || '終日'}・{event.who}
      </p>
      <h2 className="mt-3 text-sm font-bold">この予定の前後で、裏で動くこと</h2>
      {related.length === 0 ? (
        <p className="mt-1 text-sm text-muted">今のところ、ありません</p>
      ) : (
        <div className="mt-1 space-y-1">
          {related.map((item) => (
            <button
              key={`${item.date}:${item.key}`}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg bg-inv px-2 py-1.5 text-left text-[13px] text-inv-ink"
              onClick={() => store.openSheet({ type: 'invisible', date: item.date, key: item.key })}
            >
              <span>👀</span>
              <span className="text-xs">{dayName(item.date, store.today)}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      )}
      <Button
        className="mt-3"
        size="lg"
        variant="ghost"
        onClick={() => {
          store.closeSheet()
          if (event.kind === 'nomikai') store.beginScene('nomi', true)
          else store.askDay(event.date)
        }}
      >
        💬 この予定についてAIに相談
      </Button>
      <div className="mt-3 flex justify-between text-xs text-muted">
        <button type="button" onClick={() => store.deleteEvent(id)}>
          予定を消す
        </button>
        <button type="button" onClick={store.closeSheet}>
          閉じる
        </button>
      </div>
    </div>
  )
}

function AddNiceSheet() {
  const store = useStore()
  const [kind, setKind] = useState<NiceKind>('美容院')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(store.today)
  const [recurrence, setRecurrence] = useState<NiceRecurrence | null>(null)
  const [note, setNote] = useState('')
  const options: { id: NiceRecurrence | null; label: string }[] = [
    { id: null, label: '一度だけ' },
    { id: 'yearly', label: '毎年' },
    { id: 'monthly', label: '毎月' },
    { id: 'weekly', label: '毎週' },
  ]
  return (
    <div data-testid="sheet-add-nice">
      <p className="text-sm font-bold">気づいておきたい日</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {NICE_KINDS.map((item) => (
          <Chip key={item} on={kind === item} onClick={() => setKind(item)}>
            {item}
          </Chip>
        ))}
      </div>
      <input
        className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
        placeholder={nicePlaceholder(kind)}
        value={title}
        data-testid="nice-title"
        onChange={(event) => setTitle(event.target.value)}
      />
      <input className="mt-2 rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((item) => (
          <Chip key={item.label} on={recurrence === item.id} onClick={() => setRecurrence(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      <input
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
        placeholder="メモ（任意）"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <Button
        className="mt-3"
        size="lg"
        onClick={() => {
          if (!title.trim() || !date) {
            store.showToast('名前と日付を入れてください')
            return
          }
          store.addNice({ kind, title, date, recurrence, note })
        }}
      >
        入れる
      </Button>
      <Button className="mt-2" size="lg" variant="quiet" onClick={store.closeSheet}>
        やめる
      </Button>
    </div>
  )
}

function AddEventSheet() {
  const store = useStore()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(store.cal === 'day' ? store.day : store.today)
  const [time, setTime] = useState('')
  const [kind, setKind] = useState<EventKind>('other')
  const [who, setWho] = useState('家族')
  const partner = store.data?.profile.partner ?? '妻'
  return (
    <div data-testid="sheet-add-event">
      <p className="text-sm font-bold">家族の予定を入れる</p>
      <input
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
        placeholder="例：保育園 遠足"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <input className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
      </div>
      <p className="mt-2 text-xs text-muted">種類（前後の見えない仕事が自動で出ます）</p>
      <select className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm" value={kind} onChange={(event) => setKind(event.target.value as EventKind)}>
        <option value="other">その他</option>
        <option value="ensoku">園・学校の行事（お弁当あり）</option>
        <option value="nomikai">自分の飲み会・外出</option>
        <option value="kisei">実家・帰省</option>
      </select>
      <p className="mt-2 text-xs text-muted">誰の予定</p>
      <select className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm" value={who} onChange={(event) => setWho(event.target.value)}>
        <option>家族</option>
        <option>自分</option>
        <option>{partner}</option>
        <option>子ども</option>
      </select>
      <Button
        className="mt-3"
        size="lg"
        onClick={() => {
          if (!title.trim()) {
            store.showToast('予定の名前を入れてください')
            return
          }
          store.addEvent({ title, date, time, kind, who })
        }}
      >
        入れる
      </Button>
      <Button className="mt-2" size="lg" variant="quiet" onClick={store.closeSheet}>
        やめる
      </Button>
      <p className="mt-2 text-xs text-muted">この叩き台では手入力だけです。</p>
    </div>
  )
}

function StepSheet({ id }: { id: string }) {
  const store = useStore()
  const step = store.data?.steps.find((item) => item.id === id)
  if (!step) return null
  return (
    <div>
      <span className="inline-block rounded-full bg-step px-2 py-0.5 text-xs font-bold text-step-ink">自分の一手</span>
      <p className="mt-1 text-[17px] font-bold">{step.title}</p>
      <p className="text-xs text-muted">
        {dayName(step.date, store.today)} {step.time}・{step.source}
        {step.scene ? `（${step.scene}）` : ''}
      </p>
      {step.breakdown.length > 0 ? (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {step.breakdown.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      ) : null}
      {step.status ? (
        <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm">
          結果：{step.status === 'good' ? '😊 うまくいった' : '😐 微妙'}
          {step.reason ? `（${step.reason}）` : ''}
        </p>
      ) : step.date <= store.today ? (
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" variant="good" onClick={() => store.setReview(step.id, 'good')}>
            😊 うまくいった
          </Button>
          <Button className="flex-1" variant="meh" onClick={() => store.setReview(step.id, 'meh')}>
            😐 微妙
          </Button>
        </div>
      ) : null}
      <div className="mt-3 flex justify-between text-xs text-muted">
        <button type="button" onClick={() => store.deleteStep(id)}>
          この一手を消す
        </button>
        <button type="button" onClick={store.closeSheet}>
          閉じる
        </button>
      </div>
    </div>
  )
}

function ReasonSheet({ stepId, status }: { stepId: string; status: 'good' | 'meh' }) {
  const store = useStore()
  return (
    <div data-testid="sheet-reason" className="text-center">
      <p className="text-3xl">{status === 'good' ? '😊' : '😐'}</p>
      <p className="mt-1 font-bold">記録しました</p>
      <p className="text-sm text-muted">よければ、ひとつだけ（なくてもOK）</p>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {REASONS[status].map((reason) => (
          <Chip key={reason} onClick={() => store.setReason(stepId, reason)}>
            {reason}
          </Chip>
        ))}
      </div>
      <Button className="mt-3" size="lg" variant="quiet" onClick={() => store.setReason(stepId, '')}>
        スキップ
      </Button>
    </div>
  )
}

function NotifSheet() {
  const store = useStore()
  return (
    <div data-testid="sheet-notif" className="text-center">
      <p className="text-3xl">🔔</p>
      <p className="mt-1 text-base font-bold">明日の朝、「どうだった？」を今日の画面の一番上に出しますね</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">スマホへの通知は準備中です。</p>
      <Button className="mt-3" size="lg" onClick={() => store.setNotif(true)}>
        お願い
      </Button>
      <Button className="mt-2" size="lg" variant="quiet" onClick={() => store.setNotif(false)}>
        出さなくていい
      </Button>
    </div>
  )
}

function ResetSheet() {
  const store = useStore()
  return (
    <div data-testid="sheet-reset">
      <p className="text-base font-bold">この端末のデータを消しますか？</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {store.demo ? 'サンプルの家族に戻します。相談の記録と、入れた一手も消えます。' : '空の状態に戻します。'}
      </p>
      <Button className="mt-3" size="lg" data-testid="confirm-reset" onClick={store.reset}>
        消して最初から
      </Button>
      <Button className="mt-2" size="lg" variant="quiet" onClick={store.closeSheet}>
        やめる
      </Button>
    </div>
  )
}

function ForecastSheet({ slotId, date }: { slotId: string; date?: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const day = date ?? store.today
  const cast = forecastFor(data, day, store.today)
  const slot = cast.slots.find((item) => item.id === slotId)
  if (!cast.known || !slot) return null
  const alert = slot.sky === '注意報' || slot.sky === '警報' || slot.lifted
  return (
    <div data-testid="forecast-sheet">
      <p className="text-xs font-bold text-muted">オウチ予報・予報</p>
      <p className="mt-1 text-base font-bold">
        {slot.lifted ? '解除' : slot.call || `${slot.range} ${slot.sky}`}
      </p>
      {slot.note ? <p className="mt-1 text-[13px] leading-relaxed">備えておけば大丈夫</p> : null}
      {slot.reason ? (
        <p className="mt-2 text-[14px] leading-relaxed" data-testid="forecast-why">
          なぜ {slot.reason}
        </p>
      ) : (
        <p className="mt-2 text-[14px] leading-relaxed">この時間は晴れ。特に重ねるものは見えていません。</p>
      )}
      <p className="mt-2 text-[13px] leading-relaxed text-muted">人の気持ちではなく、この時間に家の仕事が重なっている、という見立てです。</p>
      {slot.umbrella ? (
        <Button className="mt-3 min-h-11" size="lg" data-testid="forecast-sheet-ask" onClick={() => store.askForecast(slot.prompt)}>
          傘 {slot.umbrella}
        </Button>
      ) : null}
      {alert ? (
        <Button className="mt-2 min-h-11" size="lg" variant="ghost" data-testid="forecast-sheet-consult" onClick={() => store.askForecast(slot.prompt)}>
          予報士に相談
        </Button>
      ) : null}
      {alert && !slot.lifted ? (
        <Button className="mt-2 min-h-11" size="lg" variant="quiet" data-testid="forecast-sheet-lift" onClick={() => store.liftSlot(day, slot.id)}>
          解除
        </Button>
      ) : null}
      <Button className="mt-2" size="lg" variant="quiet" onClick={store.closeSheet}>
        閉じる
      </Button>
    </div>
  )
}

function QuickSheet() {
  const store = useStore()
  return (
    <div data-testid="sheet-quick">
      <p className="text-base font-bold">すぐ相談（タップだけ）</p>
      <div className="mt-3">
        <SceneGrid
          testPrefix="quick-"
          onPick={(id) => {
            store.closeSheet()
            store.beginScene(id, true)
          }}
        />
      </div>
    </div>
  )
}

function shift(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}
