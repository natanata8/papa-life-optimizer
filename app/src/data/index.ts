import { createLocalRepository } from '@/data/local.ts'
import type { FamilyRepository } from '@/data/repository.ts'
import { createSupabaseRepository } from '@/data/supabase.ts'

export function usingSupabase(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return import.meta.env.VITE_DATA !== 'local' && Boolean(url && key)
}

export function createRepository(): FamilyRepository {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key && import.meta.env.VITE_DATA !== 'local') return createSupabaseRepository(url, key)
  return createLocalRepository()
}

export type { FamilyRepository, LoadResult } from '@/data/repository.ts'
