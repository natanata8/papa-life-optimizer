import { useEffect, useRef, useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Icon } from '@/components/icons.tsx'
import { IconBed, IconDoor, RoofMark, SpotFamily } from '@/components/marks.tsx'
import { Button, buttonVariants } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { consultTelop } from '@/domain/glance.ts'
import { slotClock } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { chipIcon } from '@/domain/taskIcon.ts'
import { dayName } from '@/domain/dates.ts'
import { lineShareUrl } from '@/domain/export.ts'
import { fieldOptions, lazyTitle } from '@/domain/profile.ts'
import { SCENES } from '@/domain/scenes.ts'
import { Phrase } from '@/components/Phrase.tsx'
import { SceneGrid } from '@/components/SceneGrid.tsx'
import type { ChatMessage } from '@/domain/types.ts'
import { CARE_CARD, SELF_HARM_LINES } from '@/domain/safety.ts'
import { cn, copyText } from '@/lib/utils.ts'

export function Consult() {
  const store = useStore()
  const data = store.data
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const card = document.querySelector('[data-testid="latest-answer"]')
    if (card) card.scrollIntoView({ block: 'start' })
    else endRef.current?.scrollIntoView({ block: 'end' })
  }, [data?.chat.length, store.flow, store.pending])
  if (!data) return null
  const dock = Boolean(store.flow)
  const cast = forecastFor(data, store.today)
  const peak = cast.slots.find((slot) => slot.id === cast.peak) ?? null
  const telop = consultTelop(peak ? slotClock(peak) : null, cast.quiet)

  return (
    <div className={`relative bg-paper px-3.5 pt-3.5 ${dock ? 'pb-64' : 'pb-56'}`}>
      <DemoBar title="相談" />
      <p className="flex items-start gap-2 rounded-2xl bg-ink px-3.5 py-3 text-sm font-extrabold text-white" data-testid="consult-telop">
        <span aria-hidden="true" className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
        <span className="min-w-0">
          <Phrase text={telop} />
        </span>
      </p>
      {data.chat.length > 0 ? (
        <div className="relative mt-3 flex justify-end">
          <Button size="sm" variant="ghost" onClick={store.newChat}>
            <Icon name="plus" size={14} />
            新しい相談
          </Button>
        </div>
      ) : (
        <h1 className="relative mt-3 text-sm font-extrabold text-muted">よくある場面</h1>
      )}
      {data.chat.length === 0 ? (
        <>
          <div className="relative mt-3 space-y-3">
            <SceneRow testId="scene-late" label="残業で遅くなる" onClick={() => store.beginScene('late', true)} />
            <SceneRow testId="scene-sick" label="子どもが熱のとき" onClick={() => store.sendText('子どもが熱のとき')} />
            <SceneRow testId="scene-work" label="職場で育休が取りにくい" onClick={() => store.sendText('職場で育休が取りにくい')} />
            <SceneRow testId="scene-bed" label="寝かしつけが長引いたら？" onClick={() => store.sendText('寝かしつけが長引いたら？')} />
            <details>
              <summary data-testid="consult-more" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted">
                ほかの場面
                <Icon name="chevron" size={18} className="rotate-90" />
              </summary>
              <div className="mt-2 space-y-2">
                <SceneGrid testPrefix="more-" onPick={(id) => store.beginScene(id, true)} />
              </div>
            </details>
          </div>
        </>
      ) : (
        <div className="mt-2 space-y-2">
          {data.chat.map((message, index) => (
            <Message key={message.id} message={message} latest={index === data.chat.length - 1} />
          ))}
          {store.pending ? <Thinking /> : null}
        </div>
      )}
      <div className="pointer-events-none mt-8 flex items-end justify-center gap-4 text-accent opacity-20" aria-hidden="true">
        <SpotFamily className="h-12 w-16" />
        <RoofMark size={40} />
      </div>
      <div ref={endRef} />
      {store.flow ? <ThumbDock /> : <Composer />}
    </div>
  )
}

function SceneMark({ testId }: { testId: string }) {
  if (testId.endsWith('bed')) return <IconBed size={24} />
  if (testId.endsWith('work')) return <RoofMark size={22} />
  if (testId.endsWith('sick')) return <IconBed size={24} />
  return <IconDoor size={24} />
}

function SceneRow({ testId, label, onClick }: { testId: string; label: string; onClick: () => void }) {
  return (
    <button type="button" data-testid={testId} className="hare-card flex min-h-14 w-full items-center gap-3 px-3 text-left text-[15px] font-bold" onClick={onClick}>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <SceneMark testId={testId} />
      </span>
      {label}
    </button>
  )
}

function Message({ message, latest = false }: { message: ChatMessage; latest?: boolean }) {
  const store = useStore()
  if (message.role === 'context') {
    return (
      <div className="rounded-xl bg-white px-3 py-2" data-testid="consult-context">
        <p className="text-xs font-bold text-muted">この内容で相談します（タップで外せます）</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {message.chips.map((chip) => (
            <button key={chip} type="button" className="inline-flex min-h-11 items-center gap-1 rounded-full bg-sand px-3 text-xs font-bold" onClick={() => store.removeChip(message.id, chip)}>
              <Icon name={chipIcon(chip)} size={14} />
              {chip}
            </button>
          ))}
        </div>
      </div>
    )
  }
  if (message.role === 'me') {
    return <p className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-accent px-3 py-2 text-sm leading-relaxed text-white">{message.text}</p>
  }
  if (message.role === 'bot') {
    const hotline = message.safety === 'stop'
    return (
      <div className={`max-w-[92%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm leading-relaxed shadow-sm ${hotline ? 'border border-line' : ''}`} data-testid={hotline ? 'safety-stop' : undefined}>
        {hotline ? <Hotline selfHarm={message.selfHarm} /> : message.text}
        {message.scenes ? (
          <div className="mt-2">
            <SceneGrid testPrefix="scene-" onPick={(id) => store.beginScene(id)} />
          </div>
        ) : null}
        {message.retry ? (
          <Button size="sm" className="mt-2" data-testid="consult-retry" onClick={() => store.retryConsult(message.retry!)}>
            もう一度送る
          </Button>
        ) : null}
      </div>
    )
  }
  return <AnswerCard message={message} latest={latest} />
}

function Hotline({ selfHarm = false }: { selfHarm?: boolean }) {
  return (
    <div data-testid="hotline-card">
      <p className="font-bold">あなたや家族の安全がいちばん大事です。</p>
      <p className="mt-1">危険を感じる時は迷わず連絡してください。ここでは提案はお休みします。</p>
      <ul className="mt-2 space-y-1 text-[13px]">
        <li>警察 110</li>
        <li>DV相談ナビ #8008</li>
        <li>児童相談所 189</li>
        {selfHarm ? SELF_HARM_LINES.map((line) => <li key={line}>{line}</li>) : null}
      </ul>
    </div>
  )
}

function CareCard() {
  return (
    <p className="mb-2 rounded-xl border border-line bg-sand px-3 py-2 text-[13px] leading-relaxed" data-testid="care-card">
      {CARE_CARD}
    </p>
  )
}

function Thinking() {
  return (
    <p className="flex min-h-11 items-center gap-2 text-[13px] text-muted" data-testid="consult-thinking">
      <span className="thinking-cloud inline-block text-rain-ink" aria-hidden="true">
        <svg width="28" height="16" viewBox="0 0 28 16" fill="currentColor">
          <ellipse cx="10" cy="10" rx="8" ry="5" />
          <ellipse cx="18" cy="8" rx="7" ry="5" />
        </svg>
      </span>
      整理しています
    </p>
  )
}

function LastGood() {
  const store = useStore()
  const good = store.data?.steps.filter((step) => step.status === 'good').sort((a, b) => b.date.localeCompare(a.date))[0]
  if (!good) return null
  return (
    <p className="mb-2 text-[13px] leading-relaxed text-muted" data-testid="last-good">
      前回うまくいったこと：{good.title}
    </p>
  )
}

function ReadAloud({ text }: { text: string }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])
  if (!ready || !text.trim()) return null
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center text-[13px] font-bold text-accent-deep"
      data-testid="read-aloud"
      onClick={() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      }}
    >
      読み上げ
    </button>
  )
}

function AnswerCard({ message, latest }: { message: Extract<ChatMessage, { role: 'answer' }>; latest: boolean }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  if (message.answer.safety_flag) return <Hotline selfHarm={message.selfHarm} />
  const [first, ...rest] = message.answer.一手
  const firstId = message.suggestionIds[0]
  if (!first || !firstId) return null
  const suggestion = data.suggestions[firstId]
  return (
    <div data-testid={latest ? 'latest-answer' : undefined}>
      {message.care ? <CareCard /> : null}
      <LastGood />
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ReadAloud text={`${message.answer.状況整理}${message.answer.声かけ例 ? `。${message.answer.声かけ例}` : ''}`} />
        {message.sample ? (
          <p className="inline-flex min-h-11 items-center rounded-full bg-accent-soft px-3 text-xs font-bold text-margin">サンプル回答</p>
        ) : null}
      </div>
      <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm leading-relaxed shadow-sm">{message.answer.状況整理}</div>
      {message.answer.気づき ? <p className="mt-2 text-[13px] leading-relaxed text-muted">{message.answer.気づき}</p> : null}
      <p className="mt-3 text-xs font-bold text-accent">まずこれ</p>
      <div className="mt-1 rounded-xl border-l-4 border-accent bg-white px-3 py-2.5 shadow-sm">
        <p className="text-[16px] font-bold">{first.タイトル}</p>
        <p className="mt-1 text-xs text-muted">
          {first.タイトル === '近い場面を選ぶ'
            ? first.なぜ今
            : `${suggestion ? `${dayName(suggestion.date, store.today)} ${suggestion.time}` : first.タイミング} ${first.なぜ今}`}
        </p>
        {first.タイトル === '近い場面を選ぶ' ? null : (
          <div className="mt-2">
            <AddButton suggestionId={firstId} />
          </div>
        )}
        {first.タイトル === '近い場面を選ぶ' ? (
          <div className="mt-2 flex flex-col gap-2">
            {first.タスク分解ステップ.map((step) => (
              <button
                key={step}
                type="button"
                data-testid="scene-choice"
                className="inline-flex min-h-11 items-center rounded-xl bg-sand px-3 text-left text-sm font-bold"
                onClick={() => store.sendText(step)}
              >
                {step}
              </button>
            ))}
          </div>
        ) : first.タスク分解ステップ.length > 0 ? (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
            {first.タスク分解ステップ.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
        {first.タスク分解ステップ.length > 0 && first.タイトル !== '近い場面を選ぶ' ? (
          <button
            type="button"
            data-testid="add-to-routine"
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-sand text-ink text-sm font-bold"
            onClick={() => {
              const blob = `${first.タイトル}${first.タスク分解ステップ.join('')}`
              const routine = /風呂|湯船|保湿/.test(blob) ? 'bath' : /抱っこ|部屋を暗く|布団に置く/.test(blob) ? 'bedtime' : 'tomorrow'
              store.addExtraSteps(store.today, routine, first.タスク分解ステップ)
            }}
          >
            <Icon name="plus" size={16} />
            {/風呂|湯船|保湿/.test(`${first.タイトル}${first.タスク分解ステップ.join('')}`)
              ? 'お風呂の手順に追加'
              : /抱っこ|部屋を暗く|布団に置く/.test(`${first.タイトル}${first.タスク分解ステップ.join('')}`)
                ? '寝かしつけの手順に追加'
                : 'やることの手順に追加'}
          </button>
        ) : null}
      </div>
      {message.answer.声かけ例 ? (
        <>
          <p className="mt-3 text-xs font-bold text-accent">声かけ例</p>
          <div className="mt-1 rounded-xl border border-line bg-sand px-3 py-2.5 text-sm leading-relaxed">
            「{message.answer.声かけ例}」
            <div className="mt-2 flex gap-1.5">
              <CopyButton text={message.answer.声かけ例} />
              <a className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'no-underline')} href={lineShareUrl(message.answer.声かけ例)} target="_blank" rel="noreferrer">
                <Icon name="line" size={14} />
                LINEで送る
              </a>
            </div>
            <p className="mt-1 text-xs text-muted">自分の言葉に少し直して送るのがおすすめです。</p>
          </div>
        </>
      ) : null}
      {rest.length > 0 ? (
        <details className="mt-3">
          <summary className="py-2 text-[13px] text-muted">ほかの案 {rest.length}つ</summary>
          <div className="mt-2 space-y-2">
            {rest.map((item, index) => {
              const id = message.suggestionIds[index + 1]
              const placed = id ? data.suggestions[id] : undefined
              return (
                <div key={item.タイトル} className="rounded-xl border-l-4 border-accent bg-white px-3 py-2 shadow-sm">
                  <p className="text-sm font-bold">{item.タイトル}</p>
                  <p className="mt-1 text-xs text-muted">
                    {placed ? `${dayName(placed.date, store.today)} ${placed.time}` : item.タイミング} {item.なぜ今}
                  </p>
                  {id ? (
                    <div className="mt-2">
                      <AddButton suggestionId={id} />
                    </div>
                  ) : null}
                </div>
              )
            })}
            {message.answer.明日やること ? <p className="text-xs text-muted">明日やること：{message.answer.明日やること}</p> : null}
          </div>
        </details>
      ) : null}
      {message.behind.lines.length > 0 ? (
        <details className="mt-3 rounded-xl border-[1.5px] border-dashed border-inv-line bg-inv px-3 py-2">
          <summary className="py-2 text-[13px] font-bold text-inv-ink">
            見えない家事：{message.behind.why}（{message.behind.lines.length}件）
          </summary>
          <div className="mt-1 text-xs leading-relaxed text-inv-ink">
            {message.behind.lines.map((line) => (
              <p key={line}>・{line}</p>
            ))}
          </div>
        </details>
      ) : null}
      {message.used.length > 0 ? <p className="mt-3 text-left text-xs text-muted">使った家庭の情報：{message.used.join(' ／ ')}</p> : null}
      {message.answer.questions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.answer.questions.map((question) => (
            <button key={question} type="button" className="inline-flex min-h-11 items-center rounded-full bg-white px-3 text-sm font-bold" onClick={() => store.sendText(question)}>
              {question}
            </button>
          ))}
        </div>
      ) : null}
      {message.sample ? <p className="mt-1 text-xs text-muted">サンプル回答です。OpenAI には送っていません。</p> : null}
    </div>
  )
}

function AddButton({ suggestionId }: { suggestionId: string }) {
  const store = useStore()
  const saved = store.data?.steps.some((step) => step.suggestionId === suggestionId)
  if (saved) {
    return (
      <Button size="sm" variant="good">
        <Icon name="check" size={14} />
        入れました
      </Button>
    )
  }
  return (
    <Button size="sm" onClick={() => store.openSheet({ type: 'add', suggestionId })}>
      <Icon name="plan" size={14} />
      カレンダーに入れる
    </Button>
  )
}

function CopyButton({ text }: { text: string }) {
  const store = useStore()
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        void copyText(text).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
      }}
    >
      <Icon name="copy" size={14} />
      コピー
    </Button>
  )
}

function ThumbDock() {
  const store = useStore()
  const data = store.data
  const flow = store.flow
  if (!data || !flow) return null
  const prompt = flow.lazy ? lazyTitle(data.profile, flow.lazy) : SCENES[flow.scene].questions[flow.answers.length]?.prompt
  const options = flow.lazy ? fieldOptions(flow.lazy) : (SCENES[flow.scene].questions[flow.answers.length]?.options ?? [])
  if (!prompt) return null
  return (
    <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-white px-3 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      <p className="mb-1.5 text-xs text-muted">{prompt}（タップで答える）</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button key={option} type="button" className="rounded-xl border border-line bg-white px-2 py-3 text-sm font-bold" onClick={() => store.answerFlow(option)}>
            {option}
          </button>
        ))}
      </div>
      {flow.lazy ? (
        <button type="button" className="mt-2 text-[13px] text-muted" onClick={store.skipLazy}>
          答えずに進む
        </button>
      ) : null}
    </div>
  )
}

const QUICK = ['職場で育休が取りにくい', '下の子が湯船を嫌がったら？', '帰りが遅れそう']

function Composer() {
  const store = useStore()
  const [text, setText] = useState('')
  return (
    <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-paper px-3 py-2">
      <div className="mb-2 flex gap-2 overflow-x-auto">
        {QUICK.map((chip) => (
          <button key={chip} type="button" data-testid={chip.startsWith('職場') ? 'consult-chip-work' : undefined} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold" onClick={() => store.sendText(chip)}>
            <Icon name={chipIcon(chip)} size={14} />
            {chip}
          </button>
        ))}
      </div>
      <form
        className="flex gap-1.5"
        onSubmit={(event) => {
          event.preventDefault()
          store.sendText(text)
          setText('')
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="ひとことでOK"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-2 py-2 text-[15px]"
        />
        <Button size="sm" type="submit">
          <Icon name="send" size={14} />
          送る
        </Button>
      </form>
    </div>
  )
}
