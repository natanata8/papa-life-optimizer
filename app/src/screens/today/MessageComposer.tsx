import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore } from '@/app/store.tsx'
import { FATIGUE_OPTIONS, MESSAGE_TEMPLATES, renderMessage, type FatigueId } from '@/domain/messages.ts'
import { returnInfo } from '@/domain/profile.ts'
import { copyText } from '@/lib/utils.ts'

export function MessageComposer() {
  const store = useStore()
  const data = store.data
  const [templateId, setTemplateId] = useState(MESSAGE_TEMPLATES[0].id)
  const template = MESSAGE_TEMPLATES.find((item) => item.id === templateId) ?? MESSAGE_TEMPLATES[0]
  const prefilled = returnInfo(data?.profile.home ?? null)?.back ?? ''
  const [time, setTime] = useState(prefilled)
  const [fatigue, setFatigue] = useState<FatigueId>('little')
  const [note, setNote] = useState('')
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(template.parts.map((part) => [part.id, part.defaultOn])))
  const todayTasks = data?.steps.filter((step) => step.date === store.today).map((step) => step.title) ?? []
  const [picked, setPicked] = useState<string[]>(todayTasks)

  const preview = useMemo(
    () => renderMessage(template, { on, time, fatigue, tasks: picked, note }),
    [template, on, time, fatigue, picked, note],
  )
  if (!data) return null

  const chooseTemplate = (id: string) => {
    const next = MESSAGE_TEMPLATES.find((item) => item.id === id) ?? MESSAGE_TEMPLATES[0]
    setTemplateId(next.id)
    setOn(Object.fromEntries(next.parts.map((part) => [part.id, part.defaultOn])))
    setPicked(todayTasks)
  }

  const showTime = template.parts.some((part) => part.kind === 'arrive' && on[part.id])
  const showFatigue = template.parts.some((part) => part.kind === 'fatigue' && on[part.id])
  const showTasks = template.parts.some((part) => part.kind === 'tasks' && on[part.id])
  const showNote = template.parts.some((part) => part.kind === 'note' && on[part.id])

  return (
    <section className="mt-4" data-testid="today-message">
      <h3 className="text-sm font-bold">送るメッセージ</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">部品を選ぶと、LINEに貼れる文になります。</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {MESSAGE_TEMPLATES.map((item) => (
          <Chip key={item.id} data-testid={`template-${item.id}`} on={item.id === template.id} onClick={() => chooseTemplate(item.id)}>
            {item.title}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {template.parts.map((part) => (
          <Chip
            key={part.id}
            on={Boolean(on[part.id])}
            onClick={() => setOn((current) => ({ ...current, [part.id]: !current[part.id] }))}
          >
            {part.label}
          </Chip>
        ))}
      </div>
      {showTime ? (
        <label className="mt-3 block text-[12px] text-muted">
          到着時刻
          <input
            className="mt-1 block rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
            type="time"
            value={time}
            data-testid="arrive-time"
            onChange={(event) => setTime(event.target.value)}
          />
        </label>
      ) : null}
      {showFatigue ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FATIGUE_OPTIONS.map((item) => (
            <Chip key={item.id} on={fatigue === item.id} onClick={() => setFatigue(item.id)}>
              {item.label}
            </Chip>
          ))}
        </div>
      ) : null}
      {showTasks ? (
        <div className="mt-3">
          <p className="text-[12px] text-muted">今日の一手</p>
          {todayTasks.length === 0 ? (
            <p className="mt-1 text-[13px] text-muted">今日の一手はまだありません。</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {todayTasks.map((title) => (
                <Chip
                  key={title}
                  on={picked.includes(title)}
                  onClick={() => setPicked((current) => (current.includes(title) ? current.filter((item) => item !== title) : [...current, title]))}
                >
                  {title}
                </Chip>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {showNote ? (
        <label className="mt-3 block text-[12px] text-muted">
          買うもの
          <input
            className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink"
            value={note}
            placeholder="おむつ、牛乳"
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
      ) : null}
      <div className="mt-3 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5" data-testid="message-preview">
        <p className="text-[13px] leading-relaxed whitespace-pre-line">{preview || '入れる部品を選んでください。'}</p>
      </div>
      <Button
        className="mt-2"
        size="sm"
        data-testid="message-copy"
        disabled={!preview}
        onClick={() => {
          void copyText(preview).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
        }}
      >
        コピー
      </Button>
    </section>
  )
}
