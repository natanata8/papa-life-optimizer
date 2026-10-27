import { demoMode, demoOnly } from '@/domain/demo.ts'
import { createEmpty, createPublicDemo, createSeed } from '@/domain/seed.ts'
import { todayInTokyo } from '@/domain/dates.ts'
import type { Persisted } from '@/domain/types.ts'
import type { FamilyRepository, LoadResult } from '@/data/repository.ts'

const KEY = 'tone-app:v1'

function read(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Persisted
    if (parsed?.version !== 1 || !parsed.profile) return null
    return {
      ...parsed,
      niceEvents: parsed.niceEvents ?? [],
      childEvents: parsed.childEvents ?? [],
      threads: parsed.threads ?? [],
      lifted: parsed.lifted ?? [],
      accept: parsed.accept ?? {},
      profile: {
        ...parsed.profile,
        usual: parsed.profile.usual ?? [],
        leaveAt: parsed.profile.leaveAt ?? null,
        kids: (parsed.profile.kids ?? []).map((kid) => ({
          ...kid,
          schoolName: kid.schoolName ?? '',
          birthday: kid.birthday ?? null,
        })),
      },
    }
  } catch {
    return null
  }
}

export function createLocalRepository(): FamilyRepository {
  return {
    async load(): Promise<LoadResult> {
      const existing = read()
      if (demoOnly) {
        if (existing?.onboarded && existing.profile.kids.length > 0) return { kind: 'ready', state: existing }
        const state = createPublicDemo(todayInTokyo())
        localStorage.setItem(KEY, JSON.stringify(state))
        return { kind: 'ready', state }
      }
      if (existing) return { kind: 'ready', state: existing }
      const state = demoMode ? createSeed(todayInTokyo()) : createEmpty(todayInTokyo())
      localStorage.setItem(KEY, JSON.stringify(state))
      return { kind: 'ready', state }
    },
    async save(state: Persisted) {
      localStorage.setItem(KEY, JSON.stringify(state))
    },
    async reset() {
      const state = demoOnly ? createPublicDemo(todayInTokyo()) : demoMode ? createSeed(todayInTokyo()) : createEmpty(todayInTokyo())
      localStorage.setItem(KEY, JSON.stringify(state))
      localStorage.removeItem('tone-app:mode')
      if (demoMode) localStorage.removeItem('tone-app:own-home')
      return state
    },
  }
}
