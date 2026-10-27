export type FoldId =
  | 'bar'
  | 'badge'
  | 'question'
  | 'note'
  | 'margin'
  | 'accept'
  | 'cant'
  | 'why'
  | 'consult'
  | 'review'
  | 'tomorrow'
  | 'steps'
  | 'line'
  | 'send'
  | 'copy'
  | 'skip-send'
  | 'undo'
  | 'more'

export type FoldPhase = 'decide' | 'telling' | 'done' | 'passed' | 'quiet'

/** 中身が無いときは見出しを出さない。あるときは畳んだトグルの中に置く。 */
export function moreSection(entries: readonly string[]): { summary: 'ほかにできること'; entries: string[] } | null {
  const items = entries.map((entry) => entry.trim()).filter(Boolean)
  if (items.length === 0) return null
  return { summary: 'ほかにできること', entries: items }
}

/** 今日の1画面目に出すかたまり。下のナビは数えない。なぜを開く前。 */
export function todayFold(input: { phase: FoldPhase; morningReview: boolean; more?: boolean }): FoldId[] {
  const review: FoldId[] = input.morningReview ? ['review'] : []
  const more: FoldId[] = input.more === false ? [] : ['more']
  if (input.phase === 'quiet' || input.phase === 'passed') {
    return ['bar', 'badge', 'question', 'note', 'tomorrow', 'consult', ...review, ...more]
  }
  if (input.phase === 'done') {
    return ['bar', 'badge', 'question', 'margin', 'undo', 'tomorrow', ...review, ...more]
  }
  if (input.phase === 'telling') {
    return ['bar', 'steps', 'question', 'line', 'send', 'copy', 'skip-send', 'undo', 'consult', ...more]
  }
  return ['bar', 'badge', 'question', 'margin', 'accept', 'cant', 'why', 'consult', ...review, ...more]
}
