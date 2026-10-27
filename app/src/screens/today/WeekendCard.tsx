import { Icon } from '@/components/icons.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Phrase } from '@/components/Phrase.tsx'
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
    <section className="hare-card mt-4 p-3" data-testid="weekend-card">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <Icon name="outing" size={16} />
          </span>
          今週末の提案
        </h3>
        <span className="text-xs font-bold text-muted">週末</span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        {wide ? 'パートナーに出す案です。送る前に、自分の言葉へ直してください。' : '月〜水は1件だけ。木曜から中身を開きます。'}
      </p>
      <ul className="mt-2 space-y-2">
        {(wide ? ideas : ideas.slice(0, 1)).map((idea) => (
          <li key={idea.id} className="rounded-xl bg-paper px-3 py-2">
            <p className="text-[14px] font-bold">{idea.title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{idea.detail}</p>
            <p className="mt-1 text-[13px] leading-relaxed">
              <Phrase text={`「${idea.phrase}」`} />
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-1.5"
              data-testid={`outing-copy-${idea.id}`}
              onClick={() => {
                void copyText(idea.phrase).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
              }}
            >
              <Icon name="copy" size={14} />
              提案をコピー
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
