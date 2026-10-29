import type { Persisted } from '@/domain/types.ts'

export type LoadResult =
  | { kind: 'ready'; state: Persisted }
  | { kind: 'auth'; message?: string }

export interface FamilyRepository {
  load(): Promise<LoadResult>
  save(state: Persisted): Promise<void>
  reset(): Promise<Persisted>
  signIn?(email: string): Promise<void>
}
