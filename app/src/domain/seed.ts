import { uid } from '@/lib/utils.ts'
import { addDays, mondayOf, todayInTokyo } from '@/domain/dates.ts'
import { emptyProfile } from '@/domain/profile.ts'
import type { ChildEvent, Persisted } from '@/domain/types.ts'

export function createSeed(today = todayInTokyo()): Persisted {
  const sunday = addDays(mondayOf(today), 6)
  const kiseiDate = sunday > addDays(today, 3) ? sunday : addDays(today, 5)
  return {
    version: 1,
    onboarded: false,
    profile: emptyProfile(),
    events: [
      {
        id: uid(),
        date: addDays(today, 1),
        time: '19:00',
        title: '会社の飲み会',
        who: '自分',
        kind: 'nomikai',
      },
      {
        id: uid(),
        date: addDays(today, 2),
        time: '',
        title: '上の子 遠足（お弁当の日）',
        who: '子ども',
        kind: 'ensoku',
      },
      {
        id: uid(),
        date: kiseiDate,
        time: '12:00',
        title: '妻の実家でランチ',
        who: '家族',
        kind: 'kisei',
      },
    ],
    niceEvents: [
      {
        id: uid(),
        kind: '美容院',
        title: '妻のカット',
        date: today,
        recurrence: null,
        note: '',
      },
      {
        id: uid(),
        kind: 'ネイル',
        title: 'ネイル',
        date: addDays(today, 1),
        recurrence: null,
        note: '',
      },
      {
        id: uid(),
        kind: '記念日',
        title: '結婚記念日',
        date: addDays(today, 5),
        recurrence: 'yearly',
        note: '',
      },
    ],
    childEvents: seedChildEvents(today),
    steps: [
      {
        id: uid(),
        suggestionId: null,
        date: addDays(today, -1),
        time: '20:30',
        title: '寝かしつけを代わって、30分ひとり時間をつくる',
        why: '疲れている夜は、話すより手を動かす方が伝わります',
        scene: '妻がしんどそう',
        source: '相談',
        status: null,
        reason: '',
        taskId: null,
        invisibleKey: null,
        breakdown: [],
        kind: '今やる',
      },
      {
        id: uid(),
        suggestionId: null,
        date: today,
        time: '21:00',
        title: 'お風呂を自分がやる',
        why: '帰宅後に、手が足りない時間を1つ引き取る',
        scene: '今日',
        source: 'ホーム',
        status: null,
        reason: '',
        taskId: null,
        invisibleKey: null,
        breakdown: [],
        kind: '今やる',
      },
    ],
    memories: [],
    notes: {},
    hidden: {},
    chat: [],
    suggestions: {},
    dismiss: {},
    consultations: [],
  }
}

export function createEmpty(today = todayInTokyo()): Persisted {
  const seed = createSeed(today)
  return { ...seed, events: [], steps: [], niceEvents: [], childEvents: [] }
}

function seedChildEvents(today: string): ChildEvent[] {
  return [
    {
      id: uid(),
      childId: 'seed:0',
      title: '避難訓練',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      category: '行事',
      items: [],
      deadline: false,
      notes: '',
      source: 'manual',
    },
    {
      id: uid(),
      childId: 'seed:0',
      title: '遠足',
      date: addDays(today, 1),
      startTime: '',
      endTime: '',
      allDay: true,
      category: '行事',
      items: ['お弁当', '水筒', 'レジャーシート'],
      deadline: false,
      notes: '',
      source: 'manual',
    },
    {
      id: uid(),
      childId: 'seed:1',
      title: '1歳健診',
      date: addDays(today, 4),
      startTime: '10:30',
      endTime: '',
      allDay: false,
      category: '通院・健診',
      items: ['母子手帳'],
      deadline: false,
      notes: '',
      source: 'manual',
    },
  ]
}
