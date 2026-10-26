import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createConsult } from '@/ai/client.ts'
import type { ConsultRequest } from '@/ai/types.ts'
import { createRepository } from '@/data/index.ts'
import { behindFor, gomiAround } from '@/domain/behind.ts'
import { attachSeedChildren } from '@/domain/childEvents.ts'
import { addDays, mondayOf, resolveToday, todayInTokyo } from '@/domain/dates.ts'
import { INV_DEFS, SLOT_TIME, invisibleOn } from '@/domain/invisible.ts'
import { LAZY_WHY, SCENE_LAZY, isSet, kidsFromAges, lazyTitle, removeKid, usedLabels } from '@/domain/profile.ts'
import { placeTiming, sceneDateFor } from '@/domain/place.ts'
import { SCENES, sceneFromText } from '@/domain/scenes.ts'
import { HOTLINE_MESSAGE, isSafetyConcern } from '@/domain/safety.ts'
import type {
  AgeLabel,
  Behind,
  ChatMessage,
  ChildEvent,
  FamEvent,
  Mode,
  NiceEvent,
  Persisted,
  Profile,
  SceneId,
  Step,
  Suggestion,
  Tab,
  ToneAnswer,
} from '@/domain/types.ts'
import { uid } from '@/lib/utils.ts'

export const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false'

export type ObDraft = {
  step: number
  count: number
  ages: (AgeLabel | null)[]
  work: string | null
  offDad: string | null
  offPartner: string | null
  home: string | null
}

export type Flow = { scene: SceneId; answers: string[]; lazy: string | null }

export type Sheet =
  | { type: 'add'; suggestionId: string }
  | { type: 'invisible'; date: string; key: string }
  | { type: 'daily'; taskId: string }
  | { type: 'event'; id: string }
  | { type: 'addEvent' }
  | { type: 'addNice' }
  | { type: 'children'; editId?: string }
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
  filters: { ev: boolean; step: boolean; inv: boolean; child: boolean }
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
  newChat: () => void
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
  toggleFilter: (key: 'ev' | 'step' | 'inv' | 'child') => void
  patchProfile: (fn: (profile: Profile) => Profile) => void
  dismissLazy: () => void
  lockLazy: (key: string) => void
  setNotif: (value: boolean) => void
  deleteMemory: (id: string) => void
  clearHidden: () => void
  signIn: (email: string) => Promise<void>
  refreshAuth: () => void
  showToast: (text: string) => void
  ensureHomeSuggestion: (input: HomeSuggestion) => string
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
    placements?: { date: string; time: string }[]
    invisibleKey?: string | null
    taskId?: string | null
    source?: string
  },
): Persisted {
  const suggestions = { ...state.suggestions }
  const suggestionIds: string[] = []
  input.answer.一手.forEach((item, index) => {
    const placed = input.placements?.[index] ?? placeTiming(item.タイミング, input.today, input.sceneDate)
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
  const [ob, setObState] = useState<ObDraft>(initialOb)
  const [pending, setPending] = useState(false)
  const [cal, setCalState] = useState<'week' | 'day'>('week')
  const [weekStart, setWeekStart] = useState(mondayOf(today))
  const [day, setDay] = useState(today)
  const [filters, setFilters] = useState({ ev: true, step: true, inv: true, child: true })
  const [lazyLock, setLazyLock] = useState<string | null>(null)
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
    const handle = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(handle)
  }, [toast])

  const showToast = (text: string) => setToast(text)

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
    },
  ) => {
    setPending(true)
    try {
      const consultationId = uid()
      const request = buildRequest(snapshot, todayRef.current, scene, answers, entry, userText, extra?.taskHints ?? [], consultationId)
      const answer = await consult.client.consult(request)
      const behind = scene
        ? behindFor(scene, request.sceneDate, todayRef.current, snapshot.profile, snapshot.events, snapshot.hidden)
        : { why: '', lines: [] as string[] }
      const used = usedLabels(snapshot.profile, scene)
      const base = dataRef.current ?? snapshot
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
          placements: extra?.placements,
          invisibleKey: extra?.invisibleKey,
          taskId: extra?.taskId,
          source: extra?.source,
        }),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '相談を送れませんでした。'
      const base = dataRef.current ?? snapshot
      commit({ ...base, chat: [...base.chat, { id: uid(), role: 'bot', text: message }] })
    } finally {
      setPending(false)
    }
  }

  const value: StoreValue = {
    ready,
    authRequired,
    authMessage,
    demo: demoMode,
    sampleAi: consult.sample,
    realToday,
    today,
    mode,
    tab,
    data,
    flow,
    sheet,
    toast,
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
        setModeState('帰宅前')
        setObState(initialOb())
        setFlow(null)
        setSheet(null)
        setTab('home')
        setLazyLock(null)
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
      const labels = ob.ages.filter((age): age is AgeLabel => Boolean(age))
      const profile = {
        ...current.profile,
        kids: labels.length ? kidsFromAges(labels) : current.profile.kids,
        work: ob.work,
        offDad: ob.offDad,
        offPartner: ob.offPartner,
        home: ob.home,
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
      commit({ ...current, chat: fresh ? messages : [...current.chat, ...messages] })
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
      void runConsult(next, currentFlow.scene, answers, scene.title, option)
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
      if (isSafetyConcern(trimmed)) {
        commit({
          ...current,
          chat: [
            ...current.chat,
            { id: uid(), role: 'me', text: trimmed },
            { id: uid(), role: 'bot', text: HOTLINE_MESSAGE },
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
      if (!scene) {
        commit({
          ...current,
          chat: [
            ...current.chat,
            { id: uid(), role: 'me', text: trimmed },
            {
              id: uid(),
              role: 'bot',
              text: '受け取りました。サンプルでは決まった場面に答えます。近いものを選んでください。',
              scenes: true,
            },
          ],
        })
        setFlow(null)
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
      setFlow({ scene, answers: [], lazy })
    },
    newChat: () => {
      const current = dataRef.current
      if (!current) return
      commit({ ...current, chat: [] })
      setFlow(null)
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
            text: `この日は、予定 ${events}件・一手 ${steps}件・見えない仕事 ${invisible}件です。何が気になりますか？`,
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
      showToast('tONEが覚えました')
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
      if (value) showToast('通知をオンにしました')
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
