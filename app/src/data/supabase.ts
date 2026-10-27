import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { todayInTokyo } from '@/domain/dates.ts'
import { emptyProfile } from '@/domain/profile.ts'
import { createEmpty } from '@/domain/seed.ts'
import { isUuid } from '@/domain/childEvents.ts'
import type { ChatMessage, ChildEvent, FamEvent, GomiKind, Kid, NiceEvent, Persisted, Profile, Step, Suggestion, ToneAnswer } from '@/domain/types.ts'
import { GOMI_KINDS } from '@/domain/types.ts'
import type { FamilyRepository, LoadResult } from '@/data/repository.ts'

type ClientState = {
  chat?: ChatMessage[]
  suggestions?: Record<string, Suggestion>
  dismiss?: Record<string, true>
  threads?: Persisted['threads']
  usual?: string[]
  leaveAt?: string | null
  lifted?: string[]
  accept?: Persisted['accept']
}

type FamilyRow = {
  partner_label: string | null
  work_style: string | null
  off_self: string | null
  off_partner: string | null
  return_window: string | null
  car: string | null
  area: string | null
  allergy: string | null
  partner_state: string | null
  lesson: string | null
  shop_dow: number | null
  show_invisible: boolean
  notifications_enabled: boolean | null
  onboarded: boolean
  client_state: ClientState | null
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export function createSupabaseRepository(url: string, anonKey: string): FamilyRepository {
  const client = createClient(url, anonKey)
  let familyId: string | null = null
  let userId: string | null = null

  return {
    async load(): Promise<LoadResult> {
      const { data: sessionData, error: sessionError } = await client.auth.getSession()
      fail(sessionError)
      const user = sessionData.session?.user
      if (!user) return { kind: 'auth' }
      userId = user.id
      const { data: member, error: memberError } = await client
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      fail(memberError)
      const found = member as { family_id: string } | null
      if (!found?.family_id) {
        return { kind: 'auth', message: '家族データがまだありません。新規ユーザー用の trigger を確認してください。' }
      }
      familyId = found.family_id
      return { kind: 'ready', state: await readFamily(client, familyId) }
    },
    async save(state: Persisted) {
      if (!familyId) return
      await writeFamily(client, familyId, userId, state, false)
    },
    async reset() {
      const state = createEmpty(todayInTokyo())
      if (familyId) await writeFamily(client, familyId, userId, state, true)
      return state
    },
    async signIn(email: string) {
      const redirect = `${window.location.origin}${window.location.pathname}`
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      })
      fail(error)
    },
  }
}

async function readFamily(client: SupabaseClient, familyId: string): Promise<Persisted> {
  const today = todayInTokyo()
  const base = createEmpty(today)
  const { data: familyData, error: familyError } = await client.from('families').select('*').eq('id', familyId).single()
  fail(familyError)
  const family = familyData as FamilyRow
  const [children, gomi, multi, events, niceEvents, childEvents, steps, memories, notes, hidden, consultations] = await Promise.all([
    list(client, 'children', familyId),
    list(client, 'gomi_days', familyId),
    list(client, 'family_multi', familyId),
    list(client, 'events', familyId),
    list(client, 'nice_events', familyId),
    list(client, 'child_events', familyId),
    list(client, 'steps', familyId),
    list(client, 'memories', familyId),
    list(client, 'task_notes', familyId),
    list(client, 'hidden_items', familyId),
    list(client, 'consultations', familyId),
  ])

  const profile: Profile = {
    ...emptyProfile(),
    partner: family.partner_label || '妻',
    work: family.work_style,
    offDad: family.off_self,
    offPartner: family.off_partner,
    home: family.return_window,
    car: family.car,
    area: family.area,
    allergy: family.allergy,
    pstate: family.partner_state,
    lesson: family.lesson,
    shop: family.shop_dow,
    showInv: family.show_invisible,
    notif: family.notifications_enabled,
    usual: (family.client_state?.usual ?? []).filter((item) => typeof item === 'string'),
    leaveAt: family.client_state?.leaveAt ?? null,
    kids: (children as KidRow[])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((row) => ({
        id: row.id,
        name: row.label,
        ageLabel: row.age_label as Kid['ageLabel'],
        age: row.age_years,
        school: row.school as Kid['school'],
        schoolName: row.school_name ?? '',
        birthday: row.birthday ? String(row.birthday).slice(0, 10) : null,
      })),
    gomi: { 可燃: [], プラ: [], 資源: [] },
    support: [],
    outsource: [],
  }
  for (const row of gomi as { kind: GomiKind; dow: number }[]) {
    if (profile.gomi[row.kind]) profile.gomi[row.kind].push(row.dow)
  }
  for (const row of multi as { kind: 'support' | 'outsource'; value: string }[]) {
    if (row.kind === 'support') profile.support.push(row.value)
    if (row.kind === 'outsource') profile.outsource.push(row.value)
  }

  const blob = family.client_state ?? {}
  return {
    ...base,
    onboarded: family.onboarded,
    profile,
    events: (events as EventRow[]).map((row) => ({
      id: row.id,
      date: row.event_date,
      time: row.event_time ?? '',
      title: row.title,
      who: row.who_label,
      kind: row.kind,
    })),
    childEvents: (childEvents as ChildEventRow[]).map((row) => ({
      id: row.id,
      childId: row.child_id ?? '',
      title: row.title,
      date: row.event_date.slice(0, 10),
      startTime: row.start_time ?? '',
      endTime: row.end_time ?? '',
      allDay: row.all_day,
      category: row.category,
      items: row.items ?? [],
      deadline: row.deadline,
      notes: row.notes ?? '',
      source: row.source,
    })),
    niceEvents: (niceEvents as NiceRow[]).map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      date: row.event_date.slice(0, 10),
      recurrence: row.recurrence,
      note: row.note ?? '',
    })),
    steps: (steps as StepRow[]).map(stepFromRow),
    memories: (memories as { id: string; memo_date: string; body: string }[]).map((row) => ({
      id: row.id,
      date: row.memo_date,
      text: row.body,
    })),
    notes: Object.fromEntries((notes as { task_id: string; note: string }[]).map((row) => [row.task_id, row.note])),
    hidden: Object.fromEntries((hidden as { item_key: string }[]).map((row) => [row.item_key, true as const])),
    chat: blob.chat ?? [],
    suggestions: blob.suggestions ?? {},
    dismiss: blob.dismiss ?? {},
    consultations: (consultations as ConsultationRow[]).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      scene: row.scene ?? '',
      entry: row.entry ?? '',
      safety: row.safety_flag,
      answer: row.answer,
    })),
    threads: blob.threads ?? [],
    lifted: blob.lifted ?? [],
    accept: blob.accept ?? {},
  }
}

async function list(client: SupabaseClient, table: string, familyId: string) {
  const { data, error } = await client.from(table).select('*').eq('family_id', familyId)
  fail(error)
  return (data ?? []) as unknown[]
}

async function writeFamily(
  client: SupabaseClient,
  familyId: string,
  userId: string | null,
  state: Persisted,
  replaceConsultations: boolean,
) {
  const blob: ClientState = {
    chat: state.chat,
    suggestions: state.suggestions,
    dismiss: state.dismiss,
    threads: state.threads,
    usual: state.profile.usual,
    leaveAt: state.profile.leaveAt,
    lifted: state.lifted,
    accept: state.accept,
  }
  const { error: familyError } = await client
    .from('families')
    .update({
      partner_label: state.profile.partner,
      work_style: state.profile.work,
      off_self: state.profile.offDad,
      off_partner: state.profile.offPartner,
      return_window: state.profile.home,
      car: state.profile.car,
      area: state.profile.area,
      allergy: state.profile.allergy,
      partner_state: state.profile.pstate,
      lesson: state.profile.lesson,
      shop_dow: state.profile.shop,
      show_invisible: state.profile.showInv,
      notifications_enabled: state.profile.notif,
      onboarded: state.onboarded,
      client_state: blob,
      updated_at: new Date().toISOString(),
    })
    .eq('id', familyId)
  fail(familyError)

  await replace(client, 'children', familyId, state.profile.kids.map((kid, index) => ({
    id: kid.id,
    family_id: familyId,
    sort_order: index,
    label: kid.name,
    age_label: kid.ageLabel,
    age_years: kid.age,
    school: kid.school,
    school_name: kid.schoolName,
    birthday: kid.birthday,
  })))
  await replace(
    client,
    'gomi_days',
    familyId,
    GOMI_KINDS.flatMap((kind) => state.profile.gomi[kind].map((dow) => ({ family_id: familyId, kind, dow }))),
  )
  await replace(client, 'family_multi', familyId, [
    ...state.profile.support.map((value) => ({ family_id: familyId, kind: 'support', value })),
    ...state.profile.outsource.map((value) => ({ family_id: familyId, kind: 'outsource', value })),
  ])
  await replace(client, 'nice_events', familyId, state.niceEvents.map((event) => ({
    id: event.id,
    family_id: familyId,
    kind: event.kind,
    title: event.title,
    event_date: event.date,
    recurrence: event.recurrence,
    note: event.note,
  })))
  const kidIds = new Set(state.profile.kids.map((kid) => kid.id))
  await replace(client, 'child_events', familyId, state.childEvents
    .filter((event) => !event.childId || kidIds.has(event.childId) || !isUuid(event.childId))
    .map((event) => ({
      id: event.id,
      family_id: familyId,
      child_id: isUuid(event.childId) ? event.childId : null,
      title: event.title,
      event_date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      all_day: event.allDay,
      category: event.category,
      items: event.items,
      deadline: event.deadline,
      notes: event.notes,
      source: event.source,
    })))
  await replace(client, 'events', familyId, state.events.map((event) => ({
    id: event.id,
    family_id: familyId,
    event_date: event.date,
    event_time: event.time,
    title: event.title,
    who_label: event.who,
    kind: event.kind,
  })))
  await replace(client, 'reviews', familyId, [])
  await replace(client, 'steps', familyId, state.steps.map((step) => ({
    id: step.id,
    family_id: familyId,
    step_date: step.date,
    step_time: step.time,
    title: step.title,
    why: step.why,
    scene: step.scene,
    source: step.source,
    status: step.status,
    reason: step.reason,
    suggestion_id: step.suggestionId,
    task_id: step.taskId,
    invisible_key: step.invisibleKey,
    breakdown: step.breakdown,
    kind: step.kind,
  })))
  await replace(
    client,
    'reviews',
    familyId,
    state.steps
      .filter((step) => step.status)
      .map((step) => ({
        family_id: familyId,
        step_id: step.id,
        outcome: step.status,
        reason: step.reason,
      })),
  )
  await replace(client, 'memories', familyId, state.memories.map((memory) => ({
    id: memory.id,
    family_id: familyId,
    memo_date: memory.date,
    body: memory.text,
  })))
  await replace(
    client,
    'task_notes',
    familyId,
    Object.entries(state.notes).map(([taskId, note]) => ({ family_id: familyId, task_id: taskId, note })),
  )
  await replace(
    client,
    'hidden_items',
    familyId,
    Object.keys(state.hidden).map((itemKey) => ({ family_id: familyId, item_key: itemKey })),
  )

  if (replaceConsultations) {
    const { error } = await client.from('consultations').delete().eq('family_id', familyId)
    fail(error)
  }
  if (state.consultations.length > 0) {
    const { error } = await client.from('consultations').upsert(
      state.consultations.map((row) => ({
        id: row.id,
        family_id: familyId,
        user_id: userId,
        scene: row.scene,
        entry: row.entry,
        safety_flag: row.safety,
        answer: row.answer,
        created_at: row.createdAt,
      })),
      { onConflict: 'id' },
    )
    fail(error)
  }
}

async function replace(client: SupabaseClient, table: string, familyId: string, rows: object[]) {
  const { error: deleteError } = await client.from(table).delete().eq('family_id', familyId)
  fail(deleteError)
  if (rows.length === 0) return
  const { error } = await client.from(table).insert(rows)
  fail(error)
}

type KidRow = {
  id: string
  sort_order: number
  label: string
  age_label: string | null
  age_years: number | null
  school: string | null
  school_name: string | null
  birthday: string | null
}
type ChildEventRow = {
  id: string
  child_id: string | null
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  all_day: boolean
  category: ChildEvent['category']
  items: string[] | null
  deadline: boolean
  notes: string | null
  source: ChildEvent['source']
}
type EventRow = { id: string; event_date: string; event_time: string | null; title: string; who_label: string; kind: FamEvent['kind'] }
type NiceRow = {
  id: string
  kind: NiceEvent['kind']
  title: string
  event_date: string
  recurrence: NiceEvent['recurrence']
  note: string | null
}
type StepRow = {
  id: string
  step_date: string
  step_time: string | null
  title: string
  why: string | null
  scene: string | null
  source: string | null
  status: Step['status']
  reason: string | null
  suggestion_id: string | null
  task_id: string | null
  invisible_key: string | null
  breakdown: string[] | null
  kind: string | null
}
type ConsultationRow = {
  id: string
  created_at: string
  scene: string | null
  entry: string | null
  safety_flag: boolean
  answer: ToneAnswer | null
}

function stepFromRow(row: StepRow): Step {
  return {
    id: row.id,
    suggestionId: row.suggestion_id,
    date: row.step_date,
    time: row.step_time ?? '',
    title: row.title,
    why: row.why ?? '',
    scene: row.scene ?? '',
    source: row.source ?? '',
    status: row.status,
    reason: row.reason ?? '',
    taskId: row.task_id,
    invisibleKey: row.invisible_key,
    breakdown: row.breakdown ?? [],
    kind: row.kind ?? '',
  }
}
