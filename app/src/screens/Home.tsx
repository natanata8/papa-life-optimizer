import type { ReactNode } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore } from '@/app/store.tsx'
import { addDays, dayName, DOW_CHARS, formatMd } from '@/domain/dates.ts'
import { beforeLeaving, invisibleOn, SLOT_TIME, type InvItem } from '@/domain/invisible.ts'
import { noticeFor } from '@/domain/notify.ts'
import {
  FIELDS,
  LAZY_WHY,
  PRIVACY_LABEL,
  fieldOptions,
  lazyTitle,
  nextLazyKey,
  returnInfo,
  setChoice,
  setSchool,
  setShop,
  toggleGomi,
} from '@/domain/profile.ts'
import { DAY_ORDER } from '@/domain/dates.ts'
import { SCENE_LIST } from '@/domain/scenes.ts'
import { MODE_META, type FamEvent, type Profile, type School, type Step } from '@/domain/types.ts'
import { lineShareUrl } from '@/domain/export.ts'
import { addMinutes } from '@/domain/dates.ts'
import { ChildToday } from '@/screens/today/ChildToday.tsx'
import { MessageComposer } from '@/screens/today/MessageComposer.tsx'
import { NiceEvents } from '@/screens/today/NiceEvents.tsx'
import { WeekendCard } from '@/screens/today/WeekendCard.tsx'

const TASK_IDS: Record<InvItem['def'], string> = {
  gomi: 'yu-092',
  enweek: 'yu-234',
  shop: 'yu-069',
  diaper: 'yu-077',
  vaccine: 'yu-400',
  fee: 'yu-323',
  med: 'yu-311',
  shoes: 'yu-388',
  wifetime: 'yu-357',
  ensoku2: 'yu-266',
  ensoku1: 'yu-225',
  nomi: 'yu-113',
  kisei: 'yu-394',
  kisei2: 'yu-391',
}

type CardModel = {
  key: string
  anchor?: string
  kicker: string
  title: string
  meta?: string
  line?: string
  tone?: 'inv'
  actions?: ReactNode
}

export function Home() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const meta = MODE_META[store.mode]
  const info = returnInfo(data.profile.home)
  const clock = store.mode === '帰宅前' && info ? info.open : meta.time
  const where = store.mode === '帰宅前' && info ? `${meta.where}（帰宅の目安 ${info.back}）` : meta.where
  const pending = data.steps
    .filter((step) => step.date < store.today && !step.status)
    .sort((a, b) => b.date.localeCompare(a.date))
  const todaySteps = data.steps.filter((step) => step.date === store.today)
  const todayInvisible = invisibleOn(store.today, data.profile, data.events, data.hidden, store.today)
  const notice = noticeFor(store.mode, store.today, data.profile, data.events, data.steps, data.hidden)
  const cards = buildCards(store.mode, {
    pending,
    todaySteps,
    todayInvisible,
    events: data.events,
    today: store.today,
    profile: data.profile,
    hidden: data.hidden,
  }).slice(0, 3)
  const line = cards.find((card) => card.line)?.line

  return (
    <div className="px-3.5 pt-3.5 pb-72">
      <DemoBar />
      <Notice notice={notice} />
      <p className="mt-1 text-xs text-muted">
        {formatMd(store.today)} {clock}・{where}
        <b className="mt-0.5 block text-[19px] leading-snug font-bold text-ink">
          {meta.hi}
          {meta.sub}
        </b>
      </p>
      <h2 className="mt-3 text-sm font-bold" data-testid="today-tasks">
        やること
      </h2>
      <div className="mt-2 space-y-2">
        {cards.map((card) => (
          <article
            key={card.key}
            id={card.anchor}
            className={`rounded-[14px] p-3 shadow-sm ${card.tone === 'inv' ? 'border-[1.5px] border-dashed border-inv-line bg-inv' : 'bg-white'}`}
          >
            <p className={`text-[11px] font-bold ${card.tone === 'inv' ? 'text-inv-ink' : 'text-accent'}`}>{card.kicker}</p>
            <p className="mt-0.5 text-[15px] leading-snug font-bold whitespace-pre-line">{card.title}</p>
            {card.meta ? <p className="mt-1 text-xs leading-relaxed text-muted">{card.meta}</p> : null}
            {card.actions ? <div className="mt-2 flex flex-wrap gap-1.5">{card.actions}</div> : null}
          </article>
        ))}
      </div>
      {line ? (
        <p className="mt-2 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5 text-[13px] leading-relaxed">送る文の例：「{line}」</p>
      ) : null}
      {cards.length === 0 ? <p className="mt-2 text-[13px] text-muted">今日の一手はまだありません。</p> : null}
      <ChildToday />
      <h2 className="mt-5 text-sm font-bold">あったらいいこと</h2>
      <NiceEvents />
      <MessageComposer />
      <WeekendCard />
      <LazyQuestion />
      {store.sheet ? null : (
      <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-paper via-paper to-transparent px-3 pt-3 pb-2">
        <p className="mb-1 text-[11px] text-muted">すぐ相談（片手で・タップだけ）</p>
        <div className="grid grid-cols-2 gap-1.5" data-testid="quick-list">
          {SCENE_LIST.map((scene) => (
            <button
              key={scene.id}
              type="button"
              data-testid={`quick-${scene.id}`}
              className="rounded-[14px] bg-accent px-2 py-2 text-left text-[12px] leading-snug font-bold text-white"
              onClick={() => store.beginScene(scene.id, true)}
            >
              <span className="mr-1">{scene.icon}</span>
              {scene.title}
            </button>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}

function buildCards(
  mode: keyof typeof MODE_META,
  input: {
    pending: Step[]
    todaySteps: Step[]
    todayInvisible: InvItem[]
    events: FamEvent[]
    today: string
    profile: Profile
    hidden: Record<string, true>
  },
): CardModel[] {
  const review = input.pending[0]
  const stepsCard: CardModel | null = input.todaySteps.length
    ? {
        key: 'steps',
        kicker: '今日の一手',
        title: input.todaySteps.map((step) => `${step.time ? `${step.time} ` : ''}${step.title}`).join('\n'),
        actions: <CalendarButton />,
      }
    : null
  const reviewCard: CardModel | null = review
    ? {
        key: 'review',
        anchor: 'review',
        kicker: `${dayName(review.date, input.today)}の一手、どうでした？`,
        title: review.title,
        actions: <ReviewButtons stepId={review.id} />,
      }
    : null

  if (mode === '朝') {
    const upcoming = input.events.filter((event) => event.date === input.today || event.date === addDays(input.today, 1))
    return compact([
      reviewCard,
      upcoming.length
        ? {
            key: 'plan',
            kicker: '今日・明日の予定',
            title: upcoming.map((event) => `${dayName(event.date, input.today)} ${event.time} ${event.title}`).join('\n'),
            meta: '前後の段取りはカレンダーの 👀 に出ています',
            actions: <WeekButton />,
          }
        : null,
      stepsCard,
    ])
  }

  if (mode === '昼') {
    return compact([
      {
        key: 'invite',
        kicker: '誘われた？',
        title: '返事をする前に、30秒で整理しましょう',
        meta: '行く・行かないより、抜ける時間に何が誰に移るかを先に',
        actions: <SceneButton scene="nomi" label="🍻 飲み会に誘われた" />,
      },
      stepsCard,
      reviewCard,
    ])
  }

  if (mode === '帰宅前') {
    const plan = beforeLeaving(input.todayInvisible)
    const info = returnInfo(input.profile.home)
    return compact([
      {
        key: 'before',
        anchor: 'before',
        kicker: '🏃 帰宅前にできる一手',
        title: plan.title,
        meta: plan.item?.rel ?? '家に着いてから、一番手が足りない時間です',
        line: plan.line,
        actions: (
          <BeforeActions title={plan.title} line={plan.line} item={plan.item} time={info ? addMinutes(info.back, -15) : '19:30'} />
        ),
      },
      stepsCard ?? reviewCard,
    ])
  }

  if (mode === '夜') {
    const night = input.todayInvisible.find((item) => item.slot === '夜')
    const tomorrow = input.events.find((event) => event.date === addDays(input.today, 1))
    return compact([
      night
        ? {
            key: 'night',
            tone: 'inv',
            kicker: '👀 今夜の見えない仕事',
            title: night.title,
            meta: night.rel,
            actions: <InvisibleActions item={night} />,
          }
        : null,
      tomorrow
        ? {
            key: 'tomorrow',
            kicker: '明日の予定',
            title: `🗓 ${tomorrow.title}${tomorrow.time ? ` ${tomorrow.time}` : ''}`,
            actions:
              tomorrow.kind === 'nomikai' ? (
                <SceneButton scene="nomi" label="💬 明日の飲み会、どう伝える？" />
              ) : (
                <EventButton id={tomorrow.id} />
              ),
          }
        : null,
      {
        key: 'tired',
        kicker: '今日はどうだった？',
        title: 'しんどそうだったら、明日の朝の一手を1つ決めておきましょう',
        actions: <SceneButton scene="tired" label="🌧 妻がしんどそう" ghost />,
      },
    ])
  }

  const saturday = addDays(input.today, 1)
  const sunday = addDays(input.today, 2)
  const weekendEvents = input.events.filter((event) => event.date === saturday || event.date === sunday)
  const weekendInvisible = [input.today, saturday, sunday].flatMap((date) =>
    invisibleOn(date, input.profile, input.events, input.hidden, input.today),
  )
  return compact([
    {
      key: 'weekend',
      kicker: '☀️ 週末どうする？',
      title: 'ひとりでいられる時間をどこに置くか、先に決めると楽です',
      meta: weekendEvents.map((event) => `${dayName(event.date, input.today)}：${event.title}`).join(' / '),
      actions: <SceneButton scene="week" label="週末の一手を決める" />,
    },
    weekendInvisible.length
      ? {
          key: 'behind',
          tone: 'inv',
          kicker: '👀 週末の裏側',
          title: weekendInvisible
            .slice(0, 3)
            .map((item) => `${dayName(item.date, input.today)}：${item.title}`)
            .join('\n'),
          meta: weekendInvisible.length > 3 ? `ほか${weekendInvisible.length - 3}件` : undefined,
          actions: <WeekButton />,
        }
      : null,
    reviewCard,
  ])
}

function compact(cards: (CardModel | null)[]): CardModel[] {
  return cards.filter((card): card is CardModel => Boolean(card))
}

function Notice({ notice }: { notice: ReturnType<typeof noticeFor> }) {
  const store = useStore()
  if (notice.kind === 'off') return <p className="mb-2 text-center text-[11px] text-faint">🔕 {notice.text}</p>
  return (
    <button
      type="button"
      className="mb-2 flex w-full gap-2.5 rounded-2xl border border-[#eee] bg-white p-2.5 text-left shadow-md"
      onClick={() => {
        if (notice.target === 'review') store.setTab('review')
        if (notice.target === 'before') document.getElementById('before')?.scrollIntoView({ block: 'center' })
        if (notice.target === 'calendar') {
          store.setCal('day', store.today)
          store.setTab('cal')
        }
        if (notice.target === 'weekend') store.beginScene('week', true)
      }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-extrabold text-white">t</span>
      <span className="text-[13px] leading-snug">
        <span className="block text-[10.5px] text-muted">tONE（仮）・{notice.time} 〈通知の見え方〉</span>
        {notice.body}
      </span>
    </button>
  )
}

function CalendarButton() {
  const store = useStore()
  return (
    <Button size="sm" variant="ghost" onClick={() => { store.setCal('day', store.today); store.setTab('cal') }}>
      📅 カレンダーで見る
    </Button>
  )
}

function WeekButton() {
  const store = useStore()
  return (
    <Button size="sm" variant="ghost" onClick={() => { store.setCal('week'); store.setTab('cal') }}>
      📅 カレンダーで見る
    </Button>
  )
}

function SceneButton({ scene, label, ghost }: { scene: 'nomi' | 'tired' | 'week' | 'me'; label: string; ghost?: boolean }) {
  const store = useStore()
  return (
    <Button size="sm" variant={ghost ? 'ghost' : 'default'} onClick={() => store.beginScene(scene, true)}>
      {label}
    </Button>
  )
}

function EventButton({ id }: { id: string }) {
  const store = useStore()
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        store.openSheet({ type: 'event', id })
        store.setTab('cal')
      }}
    >
      前後の段取り
    </Button>
  )
}

function ReviewButtons({ stepId }: { stepId: string }) {
  const store = useStore()
  return (
    <div className="flex w-full gap-2">
      <Button className="flex-1" variant="good" onClick={() => store.setReview(stepId, 'good')}>
        😊 うまくいった
      </Button>
      <Button className="flex-1" variant="meh" onClick={() => store.setReview(stepId, 'meh')}>
        😐 微妙
      </Button>
      <Button size="sm" variant="ghost" onClick={() => store.setTab('review')}>
        一覧
      </Button>
    </div>
  )
}

function BeforeActions({ title, line, item, time }: { title: string; line: string; item: InvItem | null; time: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const saved = data.steps.some((step) => step.title === title && step.date === store.today)
  return (
    <>
      {saved ? (
        <Button size="sm" variant="good">✓ 一手にしました</Button>
      ) : (
        <Button
          size="sm"
          onClick={() => {
            const id = store.ensureHomeSuggestion({
              title,
              date: store.today,
              time,
              why: '帰宅前の一手',
              taskId: item ? TASK_IDS[item.def] : null,
              invisibleKey: item ? `${item.date}:${item.key}` : null,
              breakdown: [],
            })
            store.openSheet({ type: 'add', suggestionId: id })
          }}
        >
          📅 一手にする
        </Button>
      )}
      <a className="inline-flex items-center rounded-lg bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-accent-deep" href={lineShareUrl(line)} target="_blank" rel="noreferrer">
        💬 LINEで送る
      </a>
    </>
  )
}

function InvisibleActions({ item }: { item: InvItem }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const saved = data.steps.some((step) => step.invisibleKey === `${item.date}:${item.key}`)
  return (
    <>
      {saved ? (
        <Button size="sm" variant="good">✓ 一手にしました</Button>
      ) : (
        <Button
          size="sm"
          onClick={() => {
            const id = store.ensureHomeSuggestion({
              title: item.title,
              date: item.date,
              time: SLOT_TIME[item.slot],
              why: item.rel,
              taskId: TASK_IDS[item.def],
              invisibleKey: `${item.date}:${item.key}`,
              breakdown: [],
            })
            store.openSheet({ type: 'add', suggestionId: id })
          }}
        >
          📅 一手にする
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => store.openSheet({ type: 'invisible', date: item.date, key: item.key })}>
        くわしく
      </Button>
    </>
  )
}

function LazyQuestion() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const key = nextLazyKey(data.profile, store.mode, store.lazyLock, Boolean(data.dismiss[store.today]))
  if (!key) return null
  const field = FIELDS.find((item) => item.key === key)
  return (
    <section className="mt-4 rounded-[14px] border border-[#dde9dd] bg-lazy p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-lazy-ink">ひとつだけ教えてください</p>
        <button type="button" className="text-[13px] text-muted" onClick={store.dismissLazy}>
          あとで
        </button>
      </div>
      <p className="mt-1 text-sm">{lazyTitle(data.profile, key)}</p>
      <p className="text-xs text-muted">
        {LAZY_WHY[key] ?? ''} {field ? PRIVACY_LABEL[field.privacy] : ''}
      </p>
      <div className="mt-2">
        <LazyControls fieldKey={key} />
      </div>
    </section>
  )
}

function LazyControls({ fieldKey }: { fieldKey: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  if (fieldKey === 'kids') {
    return (
      <Button size="sm" variant="ghost" onClick={() => store.setTab('profile')}>
        うちの画面で入れる →
      </Button>
    )
  }
  if (fieldKey === 'school') {
    const index = data.profile.kids.findIndex((kid) => !kid.school)
    if (index < 0) return null
    return (
      <div className="flex flex-wrap gap-1.5">
        {fieldOptions('school').map((option) => (
          <Chip key={option} onClick={() => store.patchProfile((profile) => setSchool(profile, index, option as School))}>
            {option}
          </Chip>
        ))}
      </div>
    )
  }
  if (fieldKey === 'gomi') {
    return (
      <div>
        <div className="flex flex-wrap gap-1">
          {DAY_ORDER.map((dow) => (
            <Chip
              key={dow}
              on={data.profile.gomi.可燃.includes(dow)}
              onClick={() => {
                store.lockLazy('gomi')
                store.patchProfile((profile) => toggleGomi(profile, '可燃', dow))
              }}
            >
              {DOW_CHARS[dow]}
            </Chip>
          ))}
        </div>
        {data.profile.gomi.可燃.length > 0 ? (
          <Button size="sm" className="mt-2" onClick={store.dismissLazy}>
            これでOK（ほかのゴミはあとで）
          </Button>
        ) : null}
      </div>
    )
  }
  if (fieldKey === 'shop') {
    return (
      <div className="flex flex-wrap gap-1">
        {DAY_ORDER.map((dow) => (
          <Chip key={dow} on={data.profile.shop === dow} onClick={() => store.patchProfile((profile) => setShop(profile, dow))}>
            {DOW_CHARS[dow]}
          </Chip>
        ))}
      </div>
    )
  }
  const choiceKeys = ['home', 'car', 'area', 'pstate', 'work'] as const
  if (!choiceKeys.includes(fieldKey as (typeof choiceKeys)[number])) return null
  const key = fieldKey as (typeof choiceKeys)[number]
  return (
    <div className="flex flex-wrap gap-1.5">
      {fieldOptions(fieldKey).map((option) => (
        <Chip key={option} on={data.profile[key] === option} onClick={() => store.patchProfile((profile) => setChoice(profile, key, option))}>
          {option}
        </Chip>
      ))}
    </div>
  )
}
