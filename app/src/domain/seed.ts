import { uid } from '@/lib/utils.ts'
import { addDays, mondayOf, todayInTokyo } from '@/domain/dates.ts'
import { emptyProfile } from '@/domain/profile.ts'
import type { Persisted } from '@/domain/types.ts'

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
  return { ...seed, events: [], steps: [] }
}
