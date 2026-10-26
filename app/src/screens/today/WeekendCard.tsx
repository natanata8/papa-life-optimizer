import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { dowIndex } from '@/domain/dates.ts'
import { weekendIdeas } from '@/domain/outings.ts'
import { copyText } from '@/lib/utils.ts'

export function WeekendCard() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const ideas = weekendIdeas(data.profile).slice(0, 3)
  const dow = dowIndex(store.today)
  const wide = dow === 0 || dow >= 4

  return (
    <section className="mt-4 rounded-[14px] bg-white p-3 shadow-sm" data-testid="weekend-card">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">今週末の提案</h3>
        <button type="button" className="text-[12px] font-bold text-accent-deep" data-testid="weekend-more" onClick={() => store.setTab('out')}>
          お出かけで見る
        </button>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        {wide ? 'パートナーに出す案です。送る前に、自分の言葉へ直してください。' : '月〜水は1件だけ。木曜から中身を開きます。'}
      </p>
      <ul className="mt-2 space-y-2">
        {(wide ? ideas : ideas.slice(0, 1)).map((idea) => (
          <li key={idea.id} className="rounded-xl bg-paper px-3 py-2">
            <p className="text-[14px] font-bold">{idea.title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{idea.detail}</p>
            <p className="mt-1 text-[13px] leading-relaxed">「{idea.phrase}」</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-1.5"
              data-testid={`outing-copy-${idea.id}`}
              onClick={() => {
                void copyText(idea.phrase).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
              }}
            >
              提案をコピー
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
