import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createConsult } from '@/ai/client.ts'
import type { ConsultRequest } from '@/ai/types.ts'
import { createRepository } from '@/data/index.ts'
import { demoMode, demoOnly } from '@/domain/demo.ts'
import { behindFor, gomiAround } from '@/domain/behind.ts'
import { attachSeedChildren } from '@/domain/childEvents.ts'
import { addDays, mondayOf, resolveToday, todayInTokyo } from '@/domain/dates.ts'
import { INV_DEFS, SLOT_TIME, invisibleOn } from '@/domain/invisible.ts'
import { LAZY_WHY, SCENE_LAZY, isSet, kidsFromAges, lazyTitle, removeKid, returnInfo, usedLabels } from '@/domain/profile.ts'
import { partnerDay } from '@/domain/partnerDay.ts'
import { extraOffsets, placedTime, rowAt, stepsFor, usedFromChips, withoutPassed, type RoutineId } from '@/domain/routines.ts'
import { createEmpty, createPublicDemo } from '@/domain/seed.ts'
import { placeTiming, sceneDateFor } from '@/domain/place.ts'
import { SCENES, sceneFromText } from '@/domain/scenes.ts'
import { HOTLINE_MESSAGE, isSelfHarm, safetyLevel } from '@/domain/safety.ts'
import type {
  AgeLabel,
  Behind,
  ChatMessage,
  ChildEvent,
  ConsultRetry,
  FamEvent,
  Mode,
  NiceEvent,
  Persisted,
  Profile,
  SceneId,
  Step,
  Suggestion,
  Tab,
  TakenRoutine,
  ToneAnswer,
} from '@/domain/types.ts'
import { logUsage } from '@/data/usage.ts'
import { uid } from '@/lib/utils.ts'

export type ObDraft = {
  step: number
  count: number
  ages: (AgeLabel | null)[]
  work: string | null
  offDad: string | null
  offPartner: string | null
  home: string | null
  usual: string[]
  leaveAt: string | null
}

export type Flow = { scene: SceneId; answers: string[]; lazy: string | null; care?: boolean }

export type Sheet =
  | { type: 'add'; suggestionId: string }
  | { type: 'invisible'; date: string; key: string }
  | { type: 'wife'; date: string; blockId: string }
  | { type: 'daily'; taskId: string }
  | { type: 'event'; id: string }
  | { type: 'addEvent' }
  | { type: 'addNice' }
  | { type: 'children'; editId?: string; image?: boolean }
  | { type: 'quick' }
  | { type: 'forecast'; slotId: string; date?: string }
  | { type: 'cant'; date: string; slotId: string }
  | { type: 'step'; id: string }
  | { type: 'reason'; stepId: string; status: 'good' | 'meh' }
  | { type: 'notif' }
  | { type: 'reset' }

export type HomeSuggestion = {
  title: string
  date: string
  time: string
  why: string
  taskId: string | null
  invisibleKey: string | null
  breakdown: string[]
}

type StoreValue = {
  ready: boolean
  authRequired: boolean
  authMessage?: string
  demo: boolean
  ownHome: boolean
  sampleAi: boolean
  realToday: string
  today: string
  mode: Mode
  tab: Tab
  data: Persisted | null
  flow: Flow | null
  sheet: Sheet | null
  toast: string | null
  ob: ObDraft
  pending: boolean
  cal: 'week' | 'day'
  weekStart: string
  day: string
  filters: { ev: boolean; step: boolean; inv: boolean; child: boolean; wife: boolean }
  lazyLock: string | null
  setMode: (mode: Mode) => void
  reset: () => void
  setTab: (tab: Tab) => void
  setOb: (patch: Partial<ObDraft>) => void
  finishOb: (scene: SceneId | null) => void
  beginScene: (scene: SceneId, fresh?: boolean) => void
  answerFlow: (option: string) => void
  skipLazy: () => void
  sendText: (text: string) => void
  askForecast: (text: string, chips?: string[]) => void
  retryConsult: (retry: ConsultRetry) => void
  startOwnHome: () => void
  newChat: () => void
  openThread: (id: string) => void
  liftSlot: (date: string, slotId: string) => void
  dropLift: (date: string, slotId: string) => void
  beginAccept: (date: string, slotId: string, line?: string, small?: boolean) => void
  finishAccept: (date: string, slotId: string) => void
  passAccept: (date: string, slotId: string) => void
  deferAccept: (date: string, slotId: string) => void
  clearAccept: (date: string, slotId: string) => void
  openSheet: (sheet: Sheet) => void
  closeSheet: () => void
  saveSuggestion: (id: string, date: string, time: string) => void
  adoptInvisible: (date: string, key: string) => void
  adoptDaily: (taskId: string) => void
  askInvisible: (date: string, key: string) => void
  askDay: (date: string) => void
  hideInvisible: (date: string, key: string) => void
  setNote: (taskId: string, note: string) => void
  setReview: (stepId: string, status: 'good' | 'meh') => void
  setReason: (stepId: string, reason: string) => void
  deleteStep: (id: string) => void
  deleteEvent: (id: string) => void
  addEvent: (event: Omit<FamEvent, 'id'>) => void
  addNice: (event: Omit<NiceEvent, 'id'>) => void
  removeNice: (id: string) => void
  upsertChildEvent: (event: ChildEvent) => void
  addChildEvents: (events: Omit<ChildEvent, 'id'>[]) => void
  deleteChildEvent: (id: string) => void
  dropKid: (index: number) => void
  setCal: (cal: 'week' | 'day', day?: string) => void
  shiftWeek: (delta: number) => void
  shiftDay: (delta: number) => void
  toggleFilter: (key: 'ev' | 'step' | 'inv' | 'child' | 'wife') => void
  patchProfile: (fn: (profile: Profile) => Profile) => void
  dismissLazy: () => void
  lockLazy: (key: string) => void
  setNotif: (value: boolean) => void
  deleteMemory: (id: string) => void
  clearHidden: () => void
  signIn: (email: string) => Promise<void>
  refreshAuth: () => void
  showToast: (text: string, undo?: () => void) => void
  dismissToast: () => void
  toastUndo: (() => void) | null
  panel: 'share' | 'preview' | null
  shareDraft: string | null
  shareHeading: string | null
  needsSetup: boolean
  finishSetup: (ages: AgeLabel[], home: string | null) => void
  openShare: (draft?: string, heading?: string) => void
  openPreview: () => void
  closePanel: () => void
  takeRoutine: (date: string, routineId: string, at: string, partial?: string[]) => void
  dropRoutine: (date: string, routineId: string) => void
  restoreTaken: (date: string, item: TakenRoutine) => void
  toggleCheck: (date: string, routineId: string, stepId: string) => void
  markShared: (date: string) => void
  addExtraSteps: (date: string, routineId: string, titles: string[]) => void
  removeChip: (messageId: string, chip: string) => void
  markWelcome: (mode: 'sample' | 'own') => void
  ensureHomeSuggestion: (input: HomeSuggestion) => string
}

function archiveChat(current: Persisted, today: string): Persisted {
  const threads = current.threads ?? []
  if (current.chat.length === 0) return { ...current, threads }
  const first = current.chat.find((message) => message.role === 'me')
  const title = first && first.role === 'me' ? first.text.slice(0, 40) : '相談'
  const spoken = current.chat.find((message) => message.role === 'answer')
  const preview = spoken && spoken.role === 'answer' ? spoken.answer.状況整理 : title
  return {
    ...current,
    threads: [{ id: uid(), at: today, title, preview: preview.slice(0, 80), messages: current.chat }, ...threads].slice(0, 20),
  }
}

const StoreContext = createContext<StoreValue | null>(null)

const initialOb = (): ObDraft => ({
  step: 0,
  count: 0,
  ages: [],
  work: null,
  offDad: null,
  offPartner: null,
  home: null,
  usual: [],
  leaveAt: null,
})

function readMode(): Mode {
  const raw = localStorage.getItem('tone-app:mode')
  if (raw === '朝' || raw === '昼' || raw === '帰宅前' || raw === '夜' || raw === '金曜夜') return raw
  return '帰宅前'
}

function modeFromClock(now = new Date()): Mode {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? ''
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '12')
  if (weekday.startsWith('Fri') && hour >= 18) return '金曜夜'
  if (hour < 11) return '朝'
  if (hour < 16) return '昼'
  if (hour < 20) return '帰宅前'
  return '夜'
}

function applyLazyChoice(profile: Profile, key: string, option: string): Profile {
  if (key === 'support') return { ...profile, support: [option] }
  if (key === 'home' || key === 'car' || key === 'area' || key === 'pstate') {
    return { ...profile, [key]: option }
  }
  return profile
}

function latestChips(chat: ChatMessage[]): string[] | undefined {
  for (let index = chat.length - 1; index >= 0; index -= 1) {
    const message = chat[index]
    if (message.role === 'context') return message.chips
  }
  return undefined
}

function attachAnswer(
  state: Persisted,
  input: {
    answer: ToneAnswer
    today: string
    sceneDate: string
    sceneTitle: string
    entry: string
    behind: Behind
    used: string[]
    consultationId: string
    sample: boolean
    care?: boolean
    selfHarm?: boolean
    placements?: { date: string; time: string }[]
    bathTime?: string
    invisibleKey?: string | null
    taskId?: string | null
    source?: string
  },
): Persisted {
  const suggestions = { ...state.suggestions }
  const suggestionIds: string[] = []
  input.answer.一手.forEach((item, index) => {
    const timing = placedTime(item.タイミング, null) ?? item.タイミング
    const placed = input.placements?.[index] ?? placeTiming(item.タイミング === 'お風呂' && input.bathTime ? input.bathTime : timing, input.today, input.sceneDate)
    const id = uid()
    suggestionIds.push(id)
    suggestions[id] = {
      id,
      title: item.タイトル,
      date: placed.date,
      time: placed.time,
      why: item.なぜ今,
      scene: input.sceneTitle,
      source: input.source ?? '相談',
      taskId: index === 0 ? (input.taskId ?? null) : null,
      invisibleKey: index === 0 ? (input.invisibleKey ?? null) : null,
      breakdown: item.タスク分解ステップ,
      kind: item.種類,
    }
  })
  const message: ChatMessage = {
    id: uid(),
    role: 'answer',
    answer: input.answer,
    suggestionIds,
    behind: input.behind,
    used: input.used,
    sample: input.sample,
    care: input.care,
    selfHarm: input.selfHarm,
  }
  return {
    ...state,
    suggestions,
    chat: [...state.chat, message].slice(-60),
    consultations: [
      ...state.consultations,
      {
        id: input.consultationId,
        createdAt: new Date().toISOString(),
        scene: input.sceneTitle,
        entry: input.entry,
        safety: input.answer.safety_flag,
        answer: input.answer,
      },
    ].slice(-40),
  }
}

function buildRequest(
  state: Persisted,
  today: string,
  scene: SceneId | null,
  answers: string[],
  entry: string,
  userText: string,
  taskHints: ConsultRequest['taskHints'],
  consultationId: string,
): ConsultRequest {
  const sceneDate = scene ? sceneDateFor(scene, answers, today) : today
  return {
    consultationId,
    entry,
    scene,
    answers,
    userText,
    today,
    sceneDate,
    family: {
      kidsLabel: state.profile.kids.map((kid) => kid.ageLabel ?? '').filter(Boolean).join('・'),
      kidsCount: state.profile.kids.length,
      work: state.profile.work,
      home: state.profile.home,
      partner: state.profile.partner || '妻',
      car: state.profile.car,
      offPartner: state.profile.offPartner,
      support: state.profile.support,
      pstate: state.profile.pstate,
    },
    scheduleText: [
      state.events.map((event) => `${event.date} ${event.time} ${event.title}`).join(' / '),
      state.childEvents
        .filter((event) => event.date >= today && event.date <= addDays(today, 14))
        .map((event) => {
          const name = state.profile.kids.find((kid) => kid.id === event.childId)?.name ?? ''
          const items = event.items.length ? ` 持ち物:${event.items.join('・')}` : ''
          const due = event.deadline ? ' 期限' : ''
          return `${event.date} ${event.allDay ? '' : event.startTime} ${name} ${event.title}${items}${due}`
        })
        .join(' / '),
    ]
      .filter(Boolean)
      .join(' / '),
    partnerEstimate: [...new Set([today, sceneDate])].map((date) => {
      const day = partnerDay(date, state.profile, state.events, state.childEvents, state.hidden, today)
      return {
        date,
        estimate: true as const,
        blocks: day.blocks.map((block) => ({ time: block.time, title: block.title, line: block.line })),
      }
    }),
    todayText: today,
    memory: state.memories.map((memory) => memory.text),
    events: state.events.map((event) => ({
      date: event.date,
      time: event.time,
      title: event.title,
      kind: event.kind,
    })),
    childEvents: state.childEvents
      .filter((event) => event.date >= today && event.date <= addDays(today, 14))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 12)
      .map((event) => ({
        date: event.date,
        time: event.allDay ? '' : event.startTime,
        title: event.title,
        child: state.profile.kids.find((kid) => kid.id === event.childId)?.name ?? '',
        category: event.category,
        items: event.items,
        deadline: event.deadline,
      })),
    taskHints,
    flags: {
      ensokuNextDay:
        scene === 'nomi' &&
        (state.events.some((event) => event.kind === 'ensoku' && event.date === addDays(sceneDate, 1)) ||
          state.childEvents.some((event) => event.date === addDays(sceneDate, 1) && event.title.includes('遠足'))),
      gomiAround: scene === 'nomi' ? gomiAround(sceneDate, state.profile, state.events, state.hidden, today) : false,
    },
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => createRepository(), [])
  const consult = useMemo(() => createConsult(), [])
  const realToday = useMemo(() => todayInTokyo(), [])
  const [data, setData] = useState<Persisted | null>(null)
  const [authRequired, setAuthRequired] = useState(false)
  const [authMessage, setAuthMessage] = useState<string>()
  const [ready, setReady] = useState(false)
  const [mode, setModeState] = useState<Mode>(demoMode ? readMode() : modeFromClock())
  const today = resolveToday(mode, realToday)
  const [tab, setTab] = useState<Tab>('home')
  const [flow, setFlow] = useState<Flow | null>(null)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastUndo, setToastUndo] = useState<(() => void) | null>(null)
  const [panel, setPanel] = useState<'share' | 'preview' | null>(null)
  const [shareDraft, setShareDraft] = useState<string | null>(null)
  const [shareHeading, setShareHeading] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(() => localStorage.getItem('tone-app:needs-setup') === '1')
  const [ob, setObState] = useState<ObDraft>(initialOb)
  const [pending, setPending] = useState(false)
  const [cal, setCalState] = useState<'week' | 'day'>('week')
  const [weekStart, setWeekStart] = useState(mondayOf(today))
  const [day, setDay] = useState(today)
  const [filters, setFilters] = useState({ ev: true, step: true, inv: true, child: true, wife: true })
  const [lazyLock, setLazyLock] = useState<string | null>(null)
  const [ownHome, setOwnHome] = useState(() => (demoOnly ? false : localStorage.getItem('tone-app:own-home') === '1'))
  const hydrated = useRef(false)
  const dataRef = useRef<Persisted | null>(null)
  const flowRef = useRef<Flow | null>(null)
  const todayRef = useRef(today)
  dataRef.current = data
  flowRef.current = flow
  todayRef.current = today

  const commit = (next: Persisted) => {
    dataRef.current = next
    setData(next)
  }

  useEffect(() => {
    let cancelled = false
    void repo.load().then((result) => {
      if (cancelled) return
      if (result.kind === 'auth') {
        setAuthRequired(true)
        setAuthMessage(result.message)
        setReady(true)
        return
      }
      hydrated.current = true
      commit(result.state)
      if (localStorage.getItem('tone-app:await-share') === '1') setPanel('share')
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [repo])

  useEffect(() => {
    if (!data || !hydrated.current) return
    const handle = window.setTimeout(() => {
      void repo.save(data).catch((error: unknown) => {
        setToast(error instanceof Error ? error.message : '保存できませんでした')
      })
    }, 250)
    return () => window.clearTimeout(handle)
  }, [data, repo])

  useEffect(() => {
    if (!toast) return
    const handle = window.setTimeout(() => {
      setToast(null)
      setToastUndo(null)
    }, 3000)
    return () => window.clearTimeout(handle)
  }, [toast, toastUndo])

  const showToast = (text: string, undo?: () => void) => {
    setToast(text)
    setToastUndo(() => undo ?? null)
  }
  const dismissToast = () => {
    setToast(null)
    setToastUndo(null)
  }

  const maybeAskNotif = (snapshot: Persisted) => {
    if (snapshot.profile.notif === null) setSheet({ type: 'notif' })
  }

  const runConsult = async (
    snapshot: Persisted,
    scene: SceneId | null,
    answers: string[],
    entry: string,
    userText: string,
    extra?: {
      placements?: { date: string; time: string }[]
      taskHints?: ConsultRequest['taskHints']
      invisibleKey?: string | null
      taskId?: string | null
      source?: string
      sceneTitle?: string
      care?: boolean
      chips?: string[]
    },
  ) => {
    setPending(true)
    logUsage('consult_started')
    try {
      const consultationId = uid()
      const request = buildRequest(snapshot, todayRef.current, scene, answers, entry, userText, extra?.taskHints ?? [], consultationId)
      const answer = await consult.client.consult(request)
      const behind = scene
        ? behindFor(scene, request.sceneDate, todayRef.current, snapshot.profile, snapshot.events, snapshot.hidden)
        : { why: '', lines: [] as string[] }
      const chips = extra?.chips ?? latestChips(snapshot.chat)
      const used = usedFromChips(usedLabels(snapshot.profile, scene), chips)
      const base = dataRef.current ?? snapshot
      const bathTime = rowAt('bath', returnInfo(snapshot.profile.home)?.back ?? null)
      commit(
        attachAnswer(base, {
          answer,
          today: todayRef.current,
          sceneDate: request.sceneDate,
          sceneTitle: extra?.sceneTitle ?? (scene ? SCENES[scene].title : '見えない仕事'),
          entry,
          behind,
          used,
          consultationId,
          sample: consult.sample,
          care: extra?.care,
          selfHarm: isSelfHarm(`${entry}\n${userText}\n${answers.join('\n')}`),
          placements: extra?.placements,
          bathTime,
          invisibleKey: extra?.invisibleKey,
          taskId: extra?.taskId,
          source: extra?.source,
        }),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '相談を送れませんでした。'
      const base = dataRef.current ?? snapshot
      const retry: ConsultRetry = {
        scene,
        answers,
        entry,
        userText,
        sceneTitle: extra?.sceneTitle,
        care: extra?.care,
      }
      commit({ ...base, chat: [...base.chat, { id: uid(), role: 'bot', text: message, retry }] })
    } finally {
      setPending(false)
    }
  }

  const value: StoreValue = {
    ready,
    authRequired,
    authMessage,
    demo: demoMode,
    ownHome,
    sampleAi: consult.sample,
    realToday,
    today,
    mode,
    tab,
    data,
    flow,
    sheet,
    toast,
    toastUndo,
    dismissToast,
    panel,
    shareDraft,
    shareHeading,
    needsSetup,
    finishSetup: (ages, home) => {
      const current = dataRef.current
      if (!current) return
      localStorage.removeItem('tone-app:needs-setup')
      setNeedsSetup(false)
      commit({
        ...current,
        profile: { ...current.profile, kids: ages.length ? kidsFromAges(ages) : [], home },
      })
      setTab('home')
    },
    ob,
    pending,
    cal,
    weekStart,
    day,
    filters,
    lazyLock,
    setMode: (next) => {
      if (!demoMode) return
      localStorage.setItem('tone-app:mode', next)
      const viewed = resolveToday(next, realToday)
      setModeState(next)
      setDay(viewed)
      setWeekStart(mondayOf(viewed))
      setFlow(null)
      if (dataRef.current?.onboarded) setTab('home')
    },
    reset: () => {
      void repo.reset().then((next) => {
        hydrated.current = true
        commit(next)
        localStorage.removeItem('tone-app:mode')
        localStorage.removeItem('tone-app:own-home')
        setModeState('帰宅前')
        setObState(initialOb())
        setFlow(null)
        setSheet(null)
        setTab('home')
        setLazyLock(null)
        setOwnHome(localStorage.getItem('tone-app:own-home') === '1')
        setDay(realToday)
        setWeekStart(mondayOf(realToday))
        setCalState('week')
      })
    },
    setTab,
    setOb: (patch) => setObState((current) => ({ ...current, ...patch })),
    finishOb: (scene) => {
      const current = dataRef.current
      if (!current) return
      localStorage.setItem('tone-app:forecast-intro', '1')
      const labels = ob.ages.filter((age): age is AgeLabel => Boolean(age))
      const profile = {
        ...current.profile,
        kids: labels.length ? kidsFromAges(labels) : current.profile.kids,
        work: ob.work,
        offDad: ob.offDad,
        offPartner: ob.offPartner,
        home: ob.home,
        usual: ob.usual,
        leaveAt: ob.leaveAt,
      }
      if (!scene) {
        commit({
          ...current,
          profile,
          childEvents: attachSeedChildren(current.childEvents, profile.kids),
          onboarded: true,
        })
        setTab('home')
        setFlow(null)
        return
      }
      const lazy = SCENE_LAZY[scene].find((key) => !isSet(profile, key)) ?? null
      const prompt = lazy
        ? `${lazyTitle(profile, lazy)}（はじめてなので1つだけ。${LAZY_WHY[lazy] ?? ''}）`
        : SCENES[scene].questions[0].prompt
      commit({
        ...current,
        profile,
        childEvents: attachSeedChildren(current.childEvents, profile.kids),
        onboarded: true,
        chat: [
          { id: uid(), role: 'me', text: SCENES[scene].title },
          { id: uid(), role: 'bot', text: prompt },
        ],
      })
      setFlow({ scene, answers: [], lazy })
      setTab('consult')
    },
    beginScene: (scene, fresh = false) => {
      const current = dataRef.current
      if (!current) return
      const lazy = SCENE_LAZY[scene].find((key) => !isSet(current.profile, key)) ?? null
      const prompt = lazy
        ? `${lazyTitle(current.profile, lazy)}（はじめてなので1つだけ。${LAZY_WHY[lazy] ?? ''}）`
        : SCENES[scene].questions[0].prompt
      const messages: ChatMessage[] = [
        { id: uid(), role: 'me', text: SCENES[scene].title },
        { id: uid(), role: 'bot', text: prompt },
      ]
      const base = fresh ? archiveChat(current, todayRef.current) : current
      commit({ ...base, chat: fresh ? messages : [...base.chat, ...messages] })
      setFlow({ scene, answers: [], lazy })
      setTab('consult')
    },
    answerFlow: (option) => {
      const current = dataRef.current
      const currentFlow = flowRef.current
      if (!current || !currentFlow || pending) return
      if (currentFlow.lazy) {
        const key = currentFlow.lazy
        const profile = applyLazyChoice(current.profile, key, option)
        const prompt = SCENES[currentFlow.scene].questions[0].prompt
        commit({
          ...current,
          profile,
          chat: [
            ...current.chat,
            { id: uid(), role: 'me', text: option },
            { id: uid(), role: 'bot', text: `覚えました（うちの画面で直せます）。${prompt}` },
          ],
        })
        setFlow({ ...currentFlow, lazy: null })
        return
      }
      const answers = [...currentFlow.answers, option]
      const scene = SCENES[currentFlow.scene]
      if (answers.length < scene.questions.length) {
        commit({
          ...current,
          chat: [
            ...current.chat,
            { id: uid(), role: 'me', text: option },
            { id: uid(), role: 'bot', text: scene.questions[answers.length].prompt },
          ],
        })
        setFlow({ ...currentFlow, answers })
        return
      }
      const next = { ...current, chat: [...current.chat, { id: uid(), role: 'me' as const, text: option }] }
      commit(next)
      setFlow(null)
      void runConsult(next, currentFlow.scene, answers, scene.title, option, { care: currentFlow.care })
    },
    skipLazy: () => {
      const current = dataRef.current
      const currentFlow = flowRef.current
      if (!current || !currentFlow?.lazy) return
      const prompt = SCENES[currentFlow.scene].questions[0].prompt
      commit({ ...current, chat: [...current.chat, { id: uid(), role: 'bot', text: prompt }] })
      setFlow({ ...currentFlow, lazy: null })
    },
    sendText: (text) => {
      const trimmed = text.trim()
      const current = dataRef.current
      if (!trimmed || !current || pending) return
      const level = safetyLevel(trimmed)
      if (level === 'stop') {
        commit({
          ...current,
          chat: [
            ...current.chat,
            { id: uid(), role: 'me', text: trimmed },
            { id: uid(), role: 'bot', text: HOTLINE_MESSAGE, safety: 'stop', selfHarm: isSelfHarm(trimmed) },
          ],
          consultations: [
            ...current.consultations,
            { id: uid(), createdAt: new Date().toISOString(), scene: '', entry: trimmed, safety: true, answer: null },
          ].slice(-40),
        })
        setFlow(null)
        return
      }
      const scene = sceneFromText(trimmed)
      const care = level === 'care'
      if (!scene) {
        if (!demoOnly && consult.sample && !care) {
          commit({
            ...current,
            chat: [
              ...current.chat,
              { id: uid(), role: 'me', text: trimmed },
              {
                id: uid(),
                role: 'bot',
                text: 'サンプルでは決まった場面だけに答えます。本番では、そのまま相談できます。近いものを選んでください。',
                scenes: true,
              },
            ],
          })
          setFlow(null)
          return
        }
        const next = { ...current, chat: [...current.chat, { id: uid(), role: 'me' as const, text: trimmed }] }
        commit(next)
        setFlow(null)
        void runConsult(next, null, [], trimmed, trimmed, { sceneTitle: '相談', care })
        return
      }
      const lazy = SCENE_LAZY[scene].find((key) => !isSet(current.profile, key)) ?? null
      const prompt = lazy
        ? `${lazyTitle(current.profile, lazy)}（はじめてなので1つだけ。${LAZY_WHY[lazy] ?? ''}）`
        : `「${SCENES[scene].title}」の相談ですね。${SCENES[scene].questions[0].prompt}`
      commit({
        ...current,
        chat: [
          ...current.chat,
          { id: uid(), role: 'me', text: trimmed },
          { id: uid(), role: 'bot', text: prompt },
        ],
      })
      setFlow({ scene, answers: [], lazy, care })
    },
    askForecast: (text, chips) => {
      const trimmed = text.trim()
      const current = dataRef.current
      if (!trimmed || !current || pending) return
      if (safetyLevel(trimmed) === 'stop') {
        commit({
          ...current,
          chat: [
            ...current.chat,
            { id: uid(), role: 'bot', text: HOTLINE_MESSAGE, safety: 'stop', selfHarm: isSelfHarm(trimmed) },
          ],
        })
        setSheet(null)
        setTab('consult')
        setFlow(null)
        return
      }
      const context = chips?.length ? [{ id: uid(), role: 'context' as const, chips }] : []
      const next = { ...current, chat: [...current.chat, ...context] }
      commit(next)
      setSheet(null)
      setPanel(null)
      setTab('consult')
      setFlow(null)
      logUsage('umbrella_tapped')
      void runConsult(next, null, [], trimmed, trimmed, { sceneTitle: '今夜の流れ', chips })
    },
    retryConsult: (retry) => {
      const current = dataRef.current
      if (!current || pending) return
      void runConsult(current, retry.scene, retry.answers, retry.entry, retry.userText, {
        sceneTitle: retry.sceneTitle,
        care: retry.care,
      })
    },
    startOwnHome: () => {
      const empty = createEmpty(todayInTokyo())
      localStorage.setItem('tone-app:own-home', '1')
      setOwnHome(true)
      commit({
        ...empty,
        onboarded: true,
        seenWelcome: true,
        profile: { ...empty.profile, partner: '', kids: [], home: null, work: null, offDad: null, offPartner: null, pronoun: '俺' },
      })
      setObState(initialOb())
      setFlow(null)
      setSheet(null)
      setPanel(null)
      localStorage.setItem('tone-app:needs-setup', '1')
      setNeedsSetup(true)
      setTab('home')
      setLazyLock(null)
    },
    newChat: () => {
      const current = dataRef.current
      if (!current) return
      const next = archiveChat(current, todayRef.current)
      commit({ ...next, chat: [] })
      setFlow(null)
    },
    liftSlot: (date, slotId) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      const lifted = current.lifted ?? []
      if (lifted.includes(key)) return
      commit({ ...current, lifted: [...lifted, key] })
    },
    dropLift: (date, slotId) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      commit({ ...current, lifted: (current.lifted ?? []).filter((item) => item !== key) })
    },
    beginAccept: (date, slotId, line, small) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      const lifted = current.lifted ?? []
      commit({
        ...current,
        lifted: small || lifted.includes(key) ? lifted : [...lifted, key],
        accept: { ...(current.accept ?? {}), [key]: { phase: 'telling', line, small: Boolean(small) } },
      })
    },
    finishAccept: (date, slotId) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      const prev = current.accept?.[key]
      if (!prev) return
      commit({ ...current, accept: { ...current.accept, [key]: { ...prev, phase: 'done' } } })
    },
    passAccept: (date, slotId) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      commit({ ...current, accept: { ...(current.accept ?? {}), [key]: { phase: 'passed' } } })
    },
    deferAccept: (date, slotId) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      commit({ ...current, accept: { ...(current.accept ?? {}), [key]: { phase: 'later' } } })
    },
    clearAccept: (date, slotId) => {
      const current = dataRef.current
      if (!current) return
      const key = `${date}|${slotId}`
      const accept = { ...(current.accept ?? {}) }
      delete accept[key]
      commit({ ...current, lifted: (current.lifted ?? []).filter((item) => item !== key), accept })
    },
    openShare: (draft, heading) => {
      setShareDraft(draft ?? null)
      setShareHeading(heading ?? null)
      setPanel('share')
    },
    openPreview: () => setPanel('preview'),
    closePanel: () => {
      setPanel(null)
      setShareDraft(null)
      setShareHeading(null)
    },
    takeRoutine: (date, routineId, at, partial) => {
      const current = dataRef.current
      if (!current) return
      const list = current.taken?.[date] ?? []
      const next = list.filter((item) => item.routineId !== routineId)
      next.push({ routineId, at, checked: [], partial })
      commit({ ...current, accept: withoutPassed(current.accept ?? {}, date), taken: { ...(current.taken ?? {}), [date]: next } })
    },
    dropRoutine: (date, routineId) => {
      const current = dataRef.current
      if (!current) return
      const list = (current.taken?.[date] ?? []).filter((item) => item.routineId !== routineId)
      commit({ ...current, taken: { ...(current.taken ?? {}), [date]: list } })
    },
    restoreTaken: (date, item) => {
      const current = dataRef.current
      if (!current) return
      const list = (current.taken?.[date] ?? []).filter((row) => row.routineId !== item.routineId)
      commit({ ...current, taken: { ...(current.taken ?? {}), [date]: [...list, item] } })
    },
    toggleCheck: (date, routineId, stepId) => {
      const current = dataRef.current
      if (!current) return
      const list = (current.taken?.[date] ?? []).map((item) => {
        if (item.routineId !== routineId) return item
        const checked = item.checked.includes(stepId) ? item.checked.filter((id) => id !== stepId) : [...item.checked, stepId]
        return { ...item, checked }
      })
      commit({ ...current, taken: { ...(current.taken ?? {}), [date]: list } })
    },
    markShared: (date) => {
      const current = dataRef.current
      if (!current) return
      const stamp = new Date().toISOString()
      const list = (current.taken?.[date] ?? []).map((item) => ({ ...item, sharedAt: stamp }))
      commit({ ...current, taken: { ...(current.taken ?? {}), [date]: list } })
    },
    addExtraSteps: (date, routineId, titles) => {
      const current = dataRef.current
      if (!current) return
      const names = titles.filter(Boolean)
      if (names.length === 0) return
      const ages = current.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
      const ensoku = current.childEvents.some((event) => event.title.includes('遠足'))
      const list = [...(current.taken?.[date] ?? [])]
      const index = list.findIndex((item) => item.routineId === routineId)
      const item = index >= 0 ? list[index] : undefined
      const base = stepsFor(routineId as RoutineId, ages, ensoku)
      const picked = item?.partial?.length ? base.filter((step) => item.partial?.includes(step.id)) : base
      const placed = [...picked, ...(item?.extra ?? [])]
      const offsets = extraOffsets(placed, names.length)
      const extra = names.map((title, stepIndex) => ({ id: uid(), title, minutes: 3, offsetMin: offsets[stepIndex] }))
      if (!item) list.push({ routineId, at: '', checked: [], extra })
      else list[index] = { ...item, extra: [...(item.extra ?? []), ...extra] }
      commit({ ...current, taken: { ...(current.taken ?? {}), [date]: list } })
      showToast('手順に追加しました')
      setTab('do')
    },
    removeChip: (messageId, chip) => {
      const current = dataRef.current
      if (!current) return
      const chat = current.chat.map((message) => {
        if (message.role !== 'context' || message.id !== messageId) return message
        return { ...message, chips: message.chips.filter((item) => item !== chip) }
      })
      commit({ ...current, chat })
    },
    markWelcome: (mode) => {
      if (mode === 'own') {
        const empty = createEmpty(todayRef.current)
        localStorage.setItem('tone-app:own-home', '1')
        setOwnHome(true)
        commit({
          ...empty,
          onboarded: true,
          seenWelcome: true,
          profile: { ...empty.profile, partner: '', kids: [], home: null, work: null, offDad: null, offPartner: null, pronoun: '俺' },
        })
        localStorage.setItem('tone-app:needs-setup', '1')
        setNeedsSetup(true)
        setTab('home')
        return
      }
      const next = createPublicDemo(todayRef.current)
      localStorage.removeItem('tone-app:own-home')
      localStorage.removeItem('tone-app:needs-setup')
      setNeedsSetup(false)
      setOwnHome(false)
      commit({ ...next, seenWelcome: true, onboarded: true })
      setTab('home')
    },
    openThread: (id) => {
      const current = dataRef.current
      if (!current) return
      const thread = current.threads.find((item) => item.id === id)
      if (!thread) return
      const next = archiveChat(current, todayRef.current)
      commit({
        ...next,
        chat: thread.messages,
        threads: next.threads.filter((item) => item.id !== id),
      })
      setFlow(null)
      setTab('consult')
    },
    openSheet: setSheet,
    closeSheet: () => setSheet(null),
    saveSuggestion: (id, date, time) => {
      const current = dataRef.current
      if (!current) return
      const suggestion = current.suggestions[id]
      if (!suggestion) return
      if (current.steps.some((step) => step.suggestionId === id)) {
        showToast('すでに入っています')
        setSheet(null)
        return
      }
      const step: Step = {
        id: uid(),
        suggestionId: id,
        date: date || suggestion.date,
        time,
        title: suggestion.title,
        why: suggestion.why,
        scene: suggestion.scene,
        source: suggestion.source,
        status: null,
        reason: '',
        taskId: suggestion.taskId,
        invisibleKey: suggestion.invisibleKey,
        breakdown: suggestion.breakdown,
        kind: suggestion.kind,
      }
      const next = { ...current, steps: [...current.steps, step] }
      commit(next)
      setSheet(null)
      showToast('一手をカレンダーに入れました')
      maybeAskNotif(next)
    },
    adoptInvisible: (date, key) => {
      const current = dataRef.current
      if (!current) return
      const item = invisibleOn(date, current.profile, current.events, current.hidden, todayRef.current).find((row) => row.key === key)
      if (!item) return
      const invisibleKey = `${date}:${key}`
      if (current.steps.some((step) => step.invisibleKey === invisibleKey)) {
        showToast('すでに一手にしています')
        return
      }
      const def = INV_DEFS[item.def]
      const step: Step = {
        id: uid(),
        suggestionId: null,
        date,
        time: SLOT_TIME[item.slot],
        title: item.title,
        why: item.rel,
        scene: '見えない仕事',
        source: 'カレンダー',
        status: null,
        reason: '',
        taskId: def.taskId,
        invisibleKey,
        breakdown: def.steps,
        kind: '今やる',
      }
      const next = { ...current, steps: [...current.steps, step] }
      commit(next)
      setSheet(null)
      showToast('一手をカレンダーに入れました')
      maybeAskNotif(next)
    },
    adoptDaily: (taskId) => {
      const current = dataRef.current
      if (!current) return
      const dailyTitle = extraDailyTitle(taskId)
      const date = addDays(todayRef.current, 1)
      const step: Step = {
        id: uid(),
        suggestionId: null,
        date,
        time: '07:30',
        title: dailyTitle,
        why: '毎日の見えない仕事を、明日の朝だけ自分がやる',
        scene: '見えない仕事',
        source: 'カレンダー',
        status: null,
        reason: '',
        taskId,
        invisibleKey: null,
        breakdown: [],
        kind: '今やる',
      }
      const next = { ...current, steps: [...current.steps, step] }
      commit(next)
      setSheet(null)
      showToast('明日の朝の一手に入れました')
      maybeAskNotif(next)
    },
    askInvisible: (date, key) => {
      const current = dataRef.current
      if (!current) return
      const item = invisibleOn(date, current.profile, current.events, current.hidden, todayRef.current).find((row) => row.key === key)
      if (!item) return
      const def = INV_DEFS[item.def]
      const next = {
        ...current,
        chat: [...current.chat, { id: uid(), role: 'me' as const, text: `「${item.title}」って、どうやればいい？` }],
      }
      commit(next)
      setFlow(null)
      setSheet(null)
      setTab('consult')
      void runConsult(next, null, [], 'invisible', item.title, {
        placements: [{ date: item.date, time: SLOT_TIME[item.slot] }],
        taskHints: [{ id: def.taskId, title: item.title, why: def.why, steps: def.steps }],
        invisibleKey: `${date}:${key}`,
        taskId: def.taskId,
        source: '相談',
        sceneTitle: '見えない仕事',
      })
    },
    askDay: (date) => {
      const current = dataRef.current
      if (!current) return
      const events = current.events.filter((event) => event.date === date).length
      const steps = current.steps.filter((step) => step.date === date).length
      const invisible = invisibleOn(date, current.profile, current.events, current.hidden, todayRef.current).length
      commit({
        ...current,
        chat: [
          ...current.chat,
          { id: uid(), role: 'me', text: `${date}のこと、相談したい` },
          {
            id: uid(),
            role: 'bot',
            text: `この日は、予定 ${events}件・引き受けたこと ${steps}件・見えない家事 ${invisible}件です。何が気になりますか？`,
            scenes: true,
          },
        ],
      })
      setFlow(null)
      setTab('consult')
      setSheet(null)
    },
    hideInvisible: (date, key) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, hidden: { ...current.hidden, [`${date}:${key}`]: true } })
      setSheet(null)
      showToast('この日は表示しません（うちの画面から戻せます）')
    },
    setNote: (taskId, note) => {
      const current = dataRef.current
      if (!current) return
      const notes = { ...current.notes }
      if (notes[taskId] === note) delete notes[taskId]
      else notes[taskId] = note
      commit({ ...current, notes })
    },
    setReview: (stepId, status) => {
      const current = dataRef.current
      if (!current) return
      logUsage('review_done')
      commit({
        ...current,
        steps: current.steps.map((step) => (step.id === stepId ? { ...step, status, reason: '' } : step)),
      })
      setSheet({ type: 'reason', stepId, status })
    },
    setReason: (stepId, reason) => {
      const current = dataRef.current
      if (!current) return
      const step = current.steps.find((item) => item.id === stepId)
      if (!step?.status) {
        setSheet(null)
        return
      }
      const text =
        step.status === 'good'
          ? `「${step.title}」はうまくいった${reason ? `（${reason}）` : ''}→ 似た場面でまた提案する`
          : `「${step.title}」は微妙だった${reason ? `（${reason}）` : ''}→ 次は別のやり方を出す`
      commit({
        ...current,
        steps: current.steps.map((item) => (item.id === stepId ? { ...item, reason } : item)),
        memories: [{ id: uid(), date: todayRef.current, text }, ...current.memories].slice(0, 30),
      })
      setSheet(null)
      showToast('ハレゴトが覚えました')
    },
    deleteStep: (id) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, steps: current.steps.filter((step) => step.id !== id) })
      setSheet(null)
    },
    deleteEvent: (id) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, events: current.events.filter((event) => event.id !== id) })
      setSheet(null)
    },
    addEvent: (event) => {
      const current = dataRef.current
      if (!current || !event.title.trim()) return
      commit({ ...current, events: [...current.events, { ...event, id: uid(), title: event.title.trim() }] })
      setSheet(null)
      showToast('予定を入れました')
    },
    addNice: (event) => {
      const current = dataRef.current
      if (!current || !event.title.trim() || !event.date) return
      commit({
        ...current,
        niceEvents: [...current.niceEvents, { ...event, id: uid(), title: event.title.trim(), note: event.note.trim() }],
      })
      setSheet(null)
      showToast('入れました')
    },
    removeNice: (id) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, niceEvents: current.niceEvents.filter((event) => event.id !== id) })
    },
    upsertChildEvent: (event) => {
      const current = dataRef.current
      if (!current || !event.title.trim() || !event.date) return
      const next: ChildEvent = {
        ...event,
        title: event.title.trim(),
        notes: event.notes.trim(),
        items: event.items.map((item) => item.trim()).filter(Boolean),
        startTime: event.allDay ? '' : event.startTime,
        endTime: event.allDay ? '' : event.endTime,
      }
      const exists = current.childEvents.some((item) => item.id === next.id)
      commit({
        ...current,
        childEvents: exists ? current.childEvents.map((item) => (item.id === next.id ? next : item)) : [...current.childEvents, next],
      })
      showToast(exists ? '保存しました' : '入れました')
    },
    addChildEvents: (events) => {
      const current = dataRef.current
      if (!current) return
      const rows: ChildEvent[] = events
        .filter((event) => event.title.trim() && event.date)
        .map((event) => ({
          ...event,
          id: uid(),
          title: event.title.trim(),
          notes: event.notes.trim(),
          items: event.items.map((item) => item.trim()).filter(Boolean),
          startTime: event.allDay ? '' : event.startTime,
          endTime: event.allDay ? '' : event.endTime,
        }))
      if (rows.length === 0) return
      commit({ ...current, childEvents: [...current.childEvents, ...rows] })
      showToast(`${rows.length}件入れました`)
    },
    deleteChildEvent: (id) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, childEvents: current.childEvents.filter((event) => event.id !== id) })
      showToast('消しました')
    },
    dropKid: (index) => {
      const current = dataRef.current
      if (!current) return
      const id = current.profile.kids[index]?.id
      commit({
        ...current,
        profile: removeKid(current.profile, index),
        childEvents: id ? current.childEvents.filter((event) => event.childId !== id) : current.childEvents,
      })
    },
    setCal: (next, nextDay) => {
      setCalState(next)
      if (nextDay) setDay(nextDay)
    },
    shiftWeek: (delta) => setWeekStart((current) => addDays(current, delta * 7)),
    shiftDay: (delta) => setDay((current) => addDays(current, delta)),
    toggleFilter: (key) => setFilters((current) => ({ ...current, [key]: !current[key] })),
    patchProfile: (fn) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, profile: fn(current.profile) })
    },
    dismissLazy: () => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, dismiss: { ...current.dismiss, [todayRef.current]: true } })
      setLazyLock(null)
    },
    lockLazy: (key) => setLazyLock(key),
    setNotif: (value) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, profile: { ...current.profile, notif: value } })
      setSheet(null)
      if (value) showToast('朝の画面に出すようにしました。スマホへの通知は準備中です')
      else showToast('朝の画面には出さないようにしました')
    },
    deleteMemory: (id) => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, memories: current.memories.filter((memory) => memory.id !== id) })
    },
    clearHidden: () => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, hidden: {} })
      showToast('非表示を戻しました')
    },
    signIn: async (email) => {
      if (!repo.signIn) return
      await repo.signIn(email)
      showToast('メールを送りました')
    },
    refreshAuth: () => {
      setReady(false)
      setAuthRequired(false)
      void repo.load().then((result) => {
        if (result.kind === 'auth') {
          setAuthRequired(true)
          setAuthMessage(result.message)
          setReady(true)
          return
        }
        hydrated.current = true
        commit(result.state)
        setReady(true)
      })
    },
    showToast,
    ensureHomeSuggestion: (input) => {
      const current = dataRef.current
      if (!current) return ''
      const existing = Object.values(current.suggestions).find(
        (item) => item.title === input.title && item.date === input.date && item.source === 'ホーム',
      )
      if (existing) return existing.id
      const id = uid()
      const suggestion: Suggestion = {
        id,
        title: input.title,
        date: input.date,
        time: input.time,
        why: input.why,
        scene: '今日のあなたへ',
        source: 'ホーム',
        taskId: input.taskId,
        invisibleKey: input.invisibleKey,
        breakdown: input.breakdown,
        kind: '今やる',
      }
      commit({ ...current, suggestions: { ...current.suggestions, [id]: suggestion } })
      return id
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

function extraDailyTitle(taskId: string): string {
  const known: Record<string, string> = {
    'yu-233': '園からのお知らせを確認する',
    'yu-227': '連絡帳・体温を記入する',
    'yu-293': '朝の体温・体調をチェックする',
    'yu-001': '前夜に朝食の献立を決める',
    'yu-017': 'おやつの時間と量を決める',
    'yu-294': '食欲・排泄・睡眠の変化を観察する',
    'yu-353': '1日の出来事を共有する',
  }
  return known[taskId] ?? '毎日の見えない仕事を1つやる'
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('StoreProvider の外で useStore は使えません')
  return value
}
