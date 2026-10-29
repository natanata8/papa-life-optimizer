import { useState } from 'react'
import { BubbleSketch, Icon, StepSketch } from '@/components/icons.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'

const PAGES = [
  {
    title: '帰る前に、今夜の流れが見える',
    body: '家のことが重なる時間を、天気のマークでお知らせします。黄色＝注意報は「備えておけば大丈夫」の合図です。',
  },
  {
    title: '考えずに、ただやるだけ',
    body: '引き受けた家の仕事の分数が、余白（目安）です。リストでも、1つずつでも進められます。',
  },
  {
    title: '引き受けたことが、そのまま伝わる',
    body: '何を、いつ、誰がやるかを書いた文を送れます。コピーしただけでは完了になりません。',
  },
]

export function Welcome() {
  const store = useStore()
  const [page, setPage] = useState(0)
  const last = page >= PAGES.length
  return (
    <div className="relative px-4 pt-6 pb-28">
      <div aria-hidden="true" className="sky sky-clear" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted">{last ? 'どちらで見ますか' : `${page + 1} / ${PAGES.length}`}</span>
        {last ? null : (
          <button type="button" className="min-h-11 text-sm font-bold text-accent-deep" onClick={() => setPage(PAGES.length)}>
            スキップ
          </button>
        )}
      </div>
      {last ? (
        <div>
          <h1 className="mt-6 text-[25px] leading-snug font-bold">まずは、どちらで見ますか？</h1>
          <button type="button" data-testid="welcome-sample" className="hare-card mt-4 w-full border-2 border-accent-deep px-3 py-3 text-left" onClick={() => store.markWelcome('sample')}>
            <span className="flex items-center gap-2 text-base font-bold">
              <Icon name="people" size={18} className="text-accent" />
              サンプルの家族で試す
            </span>
            <span className="mt-1 block text-sm leading-relaxed">4歳と1歳、共働き、帰宅19:30の家族です。あとから自分の家族に切り替えられます。</span>
          </button>
          <button type="button" data-testid="welcome-own" className="hare-card mt-2 w-full px-3 py-3 text-left" onClick={() => store.markWelcome('own')}>
            <span className="flex items-center gap-2 text-base font-bold">
              <Icon name="house" size={18} className="text-accent" />
              自分の家族で始める
            </span>
            <span className="mt-1 block text-sm leading-relaxed">子どもの年齢と帰宅時刻だけでOK。入力はこの端末の中だけに保存します。</span>
          </button>
          <p className="mt-4 text-sm leading-relaxed">
            <Phrase text="「余白」＝家のことが減って、家族に生まれる時間のこと。分数はすべて目安です。" />
          </p>
        </div>
      ) : (
        <div>
          <Picture page={page} />
          <h1 className="mt-6 text-[25px] leading-snug font-bold">
            <Phrase text={PAGES[page].title} />
          </h1>
          <p className="mt-2 text-sm leading-relaxed">
            <Phrase text={PAGES[page].body} />
          </p>
          <button type="button" data-testid="welcome-next" className="fixed bottom-6 left-1/2 inline-flex min-h-[52px] w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center justify-center gap-1.5 rounded-xl bg-accent-deep text-base font-bold text-white" onClick={() => setPage(page + 1)}>
            次へ
            <Icon name="chevron" size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

const SAMPLE_ROWS = [
  { at: '19:40', title: 'お風呂', hot: false },
  { at: '20:30', title: '寝かしつけ', hot: true },
  { at: '21:00', title: '明日の持ち物', hot: true },
]

function Picture({ page }: { page: number }) {
  if (page === 0) return <SampleFlow />
  return (
    <div className="mt-4">
      <div aria-hidden="true">{page === 1 ? <StepSketch /> : <BubbleSketch />}</div>
      <p className="mt-2 text-center text-xs font-bold text-muted">見本（押せません）</p>
    </div>
  )
}

function SampleFlow() {
  return (
    <div className="hare-card mt-4 p-3">
      <p className="text-xs font-bold text-muted">見本（押せません）</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-watch-ink">
        <Icon name="cloud" size={16} className="text-cloud-ink" />
        <span className="rounded-full bg-watch-tag px-1.5 py-0.5">注意報</span>
        <span className="whitespace-nowrap">20〜22時</span>
      </p>
      <div className="mt-2 space-y-1.5">
        {SAMPLE_ROWS.map((row) => (
          <div key={row.at} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold ${row.hot ? 'border-l-4 border-watch-line bg-watch/60' : ''}`}>
            <span className="w-12 shrink-0 whitespace-nowrap">{row.at}</span>
            <Phrase text={row.title} />
          </div>
        ))}
      </div>
    </div>
  )
}
