import { createSeed } from '@/domain/seed.ts'
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
    return { ...parsed, niceEvents: parsed.niceEvents ?? [] }
  } catch {
    return null
  }
}

export function createLocalRepository(): FamilyRepository {
  return {
    async load(): Promise<LoadResult> {
      const existing = read()
      if (existing) return { kind: 'ready', state: existing }
      const state = createSeed(todayInTokyo())
      localStorage.setItem(KEY, JSON.stringify(state))
      return { kind: 'ready', state }
    },
    async save(state: Persisted) {
      localStorage.setItem(KEY, JSON.stringify(state))
    },
    async reset() {
      const state = createSeed(todayInTokyo())
      localStorage.setItem(KEY, JSON.stringify(state))
      localStorage.removeItem('tone-app:mode')
      return state
    },
  }
}
