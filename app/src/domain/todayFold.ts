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

/** 今日の1画面目に出すかたまり。下のナビは数えない。なぜを開く前。 */
export function todayFold(input: { phase: FoldPhase; morningReview: boolean }): FoldId[] {
  const review: FoldId[] = input.morningReview ? ['review'] : []
  if (input.phase === 'quiet' || input.phase === 'passed') {
    return ['bar', 'badge', 'question', 'note', 'tomorrow', 'consult', ...review, 'more']
  }
  if (input.phase === 'done') {
    return ['bar', 'badge', 'question', 'margin', 'undo', 'tomorrow', ...review, 'more']
  }
  if (input.phase === 'telling') {
    return ['bar', 'steps', 'question', 'line', 'send', 'copy', 'skip-send', 'undo', 'consult', 'more']
  }
  return ['bar', 'badge', 'question', 'margin', 'accept', 'cant', 'why', 'consult', ...review, 'more']
}
