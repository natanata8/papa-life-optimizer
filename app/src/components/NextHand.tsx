import { Phrase } from '@/components/Phrase.tsx'
import type { NextHand } from '@/domain/routines.ts'

export function NextHandCard({
  hand,
  onGo,
  onLater,
  onConsult,
}: {
  hand: NextHand
  onGo: () => void
  onLater: () => void
  onConsult?: () => void
}) {
  return (
    <article className="hare-card mt-3 px-3 py-3 text-left" data-testid="next-hand">
      <p className="text-base font-bold">
        <Phrase text="次はこれだけ" />
      </p>
      <p className="mt-1 text-sm text-muted">
        <Phrase text="聞かなくて大丈夫。" />
      </p>
      <p className="mt-2 text-sm font-bold">
        <Phrase text={hand.label} />
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" data-testid="next-hand-go" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent-deep text-sm font-bold text-white" onClick={onGo}>
          {hand.taken ? '手順を開く' : '引き受ける'}
        </button>
        <button type="button" data-testid="next-hand-later" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sand px-3 text-sm font-bold text-ink" onClick={onLater}>
          あとで
        </button>
      </div>
      {onConsult ? (
        <button type="button" data-testid="next-hand-consult" className="mt-1 inline-flex min-h-11 items-center text-sm font-bold text-accent-deep" onClick={onConsult}>
          迷ったら相談
        </button>
      ) : null}
    </article>
  )
}
