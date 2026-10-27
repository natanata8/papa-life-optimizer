import { useEffect, useRef, useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Button, buttonVariants } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { dayName } from '@/domain/dates.ts'
import { lineShareUrl } from '@/domain/export.ts'
import { fieldOptions, lazyTitle } from '@/domain/profile.ts'
import { SCENES } from '@/domain/scenes.ts'
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

  return (
    <div className={`px-3.5 pt-3.5 ${dock ? 'pb-64' : 'pb-28'}`}>
      <DemoBar />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">予報士</h1>
        {data.chat.length > 0 ? (
          <Button size="sm" variant="ghost" onClick={store.newChat}>
            新しい相談
          </Button>
        ) : null}
      </div>
      {data.chat.length === 0 ? (
        <>
          <p className="mt-1 text-[13px] text-muted">家の時間の負荷を見て、次の一手と伝え方を出します。</p>
          {data.threads.length > 0 ? (
            <button type="button" className="mt-2 inline-flex min-h-11 items-center text-[13px] font-bold text-accent-deep" data-testid="open-history" onClick={() => store.setTab('review')}>
              これまでの相談
            </button>
          ) : null}
          <div className="mt-3">
            <SceneGrid testPrefix="scene-" onPick={(id) => store.beginScene(id, true)} />
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
      <div ref={endRef} />
      {store.flow ? <ThumbDock /> : <Composer />}
    </div>
  )
}

function Message({ message, latest = false }: { message: ChatMessage; latest?: boolean }) {
  const store = useStore()
  if (message.role === 'me') {
    return <p className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-accent px-3 py-2 text-sm leading-relaxed text-white">{message.text}</p>
  }
  if (message.role === 'bot') {
    const hotline = message.safety === 'stop'
    return (
      <div className={`max-w-[92%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm leading-relaxed shadow-sm ${hotline ? 'border border-[#e7c7c2]' : ''}`} data-testid={hotline ? 'safety-stop' : undefined}>
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
      <p className="mt-1">危険を感じる時は迷わず連絡してください。ここでは一手の提案はお休みします。</p>
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
    <p className="mb-2 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2 text-[13px] leading-relaxed" data-testid="care-card">
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
      className="mb-2 inline-flex min-h-11 items-center text-[13px] font-bold text-accent-deep"
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
      <ReadAloud text={`${message.answer.状況整理}${message.answer.声かけ例 ? `。${message.answer.声かけ例}` : ''}`} />
      {message.sample ? (
        <p className="mb-1 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-deep">サンプル回答</p>
      ) : null}
      <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm leading-relaxed shadow-sm">{message.answer.状況整理}</div>
      {message.answer.気づき ? <p className="mt-2 text-[13px] leading-relaxed text-muted">{message.answer.気づき}</p> : null}
      <p className="mt-3 text-xs font-bold text-accent">まずこれ</p>
      <div className="mt-1 rounded-xl border-l-4 border-accent bg-white px-3 py-2.5 shadow-sm">
        <p className="text-[16px] font-bold">{first.タイトル}</p>
        <p className="mt-1 text-xs text-muted">
          {suggestion ? `${dayName(suggestion.date, store.today)} ${suggestion.time}` : first.タイミング} {first.なぜ今}
        </p>
        <div className="mt-2">
          <AddButton suggestionId={firstId} />
        </div>
        <details className="mt-2">
          <summary className="py-2 text-xs text-muted">手順</summary>
          <ol className="mt-1 list-decimal pl-5 text-sm leading-relaxed">
            {first.タスク分解ステップ.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </details>
      </div>
      {message.answer.声かけ例 ? (
        <>
          <p className="mt-3 text-xs font-bold text-accent">声かけ例</p>
          <div className="mt-1 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5 text-sm leading-relaxed">
            「{message.answer.声かけ例}」
            <div className="mt-2 flex gap-1.5">
              <CopyButton text={message.answer.声かけ例} />
              <a className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'no-underline')} href={lineShareUrl(message.answer.声かけ例)} target="_blank" rel="noreferrer">
                💬 LINEで送る
              </a>
            </div>
            <p className="mt-1 text-xs text-muted">自分の言葉に少し直して送るのがおすすめです。</p>
          </div>
        </>
      ) : null}
      {rest.length > 0 ? (
        <details className="mt-3">
          <summary className="py-2 text-[13px] text-muted">ほかの一手 {rest.length}つ</summary>
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
            👀 {message.behind.why}（{message.behind.lines.length}件）
          </summary>
          <div className="mt-1 text-xs leading-relaxed text-inv-ink">
            {message.behind.lines.map((line) => (
              <p key={line}>・{line}</p>
            ))}
          </div>
        </details>
      ) : null}
      {message.used.length > 0 ? <p className="mt-3 text-left text-xs text-muted">使った家庭の情報：{message.used.join(' ／ ')}</p> : null}
      {message.sample ? <p className="mt-1 text-xs text-muted">サンプル回答です。OpenAI には送っていません。</p> : null}
    </div>
  )
}

function AddButton({ suggestionId }: { suggestionId: string }) {
  const store = useStore()
  const saved = store.data?.steps.some((step) => step.suggestionId === suggestionId)
  if (saved) return <Button size="sm" variant="good">✓ 入れました</Button>
  return (
    <Button size="sm" onClick={() => store.openSheet({ type: 'add', suggestionId })}>
      📅 カレンダーに入れる
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
    <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-[#eee] bg-white px-3 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
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

function Composer() {
  const store = useStore()
  const [text, setText] = useState('')
  return (
    <form
      className="fixed bottom-16 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 gap-1.5 border-t border-[#f0e8df] bg-paper px-3 py-2"
      onSubmit={(event) => {
        event.preventDefault()
        store.sendText(text)
        setText('')
      }}
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="ひとことでOK（例：土曜どうしよう）"
        className="min-w-0 flex-1 rounded-lg border border-[#ddd] bg-white px-2 py-2 text-[15px]"
      />
      <Button size="sm" type="submit">
        送る
      </Button>
    </form>
  )
}
