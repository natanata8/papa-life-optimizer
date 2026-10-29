import { Phrase } from '@/components/Phrase.tsx'
import { RoofMark } from '@/components/marks.tsx'
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
  return (
    <div className="relative px-4 pt-10 pb-28">
      <div aria-hidden="true" className="sky sky-clear" />
      <RoofMark size={36} className="text-accent" />
      <h1 className="mt-3 text-[25px] leading-snug font-extrabold">帰る前に、今夜の一つを決める</h1>
      <p className="mt-3 text-sm leading-relaxed">
        <Phrase text="黄色の注意は、備えておけば大丈夫の合図です。余白は、引き受けた家の仕事の分数（目安）です。" />
      </p>
      <button type="button" data-testid="welcome-sample" className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-md bg-accent text-base font-extrabold text-white active:bg-[#003d99]" onClick={() => store.markWelcome('sample')}>
        サンプルの家族で試す
      </button>
      <button type="button" data-testid="welcome-own" className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-bold text-accent" onClick={() => store.markWelcome('own')}>
        自分の家族で始める
      </button>
      <details className="mt-4">
        <summary data-testid="welcome-next" className="inline-flex min-h-11 items-center text-sm font-bold text-muted">案内を読む</summary>
        <div className="mt-2 space-y-3">
          {PAGES.map((item) => (
            <p key={item.title} className="text-sm leading-relaxed">
              <span className="font-bold">{item.title}。</span>
              {item.body}
            </p>
          ))}
        </div>
      </details>
    </div>
  )
}

