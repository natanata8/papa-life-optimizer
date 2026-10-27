import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { AGES } from '@/domain/types.ts'
import { OFF_OPTIONS, RETURN_WINDOWS, WORK_OPTIONS, kidName, returnInfo } from '@/domain/profile.ts'
import { SceneGrid } from '@/components/SceneGrid.tsx'
import { useStore } from '@/app/store.tsx'

export function Onboarding() {
  const store = useStore()
  const { ob } = store
  const readyAges = ob.count > 0 && ob.ages.filter(Boolean).length === ob.count

  return (
    <div className="px-4 pt-4">
      <DemoBar />
      {ob.step >= 1 && ob.step <= 4 ? (
        <div className="mt-2 flex items-center gap-1.5">
          {[1, 2, 3, 4].map((step) => (
            <i key={step} className={`h-1.5 flex-1 rounded-full ${step <= ob.step ? 'bg-accent' : 'bg-[#eadfd3]'}`} />
          ))}
          <span className="text-xs text-muted">{ob.step}/4</span>
        </div>
      ) : null}

      {ob.step === 0 ? (
        <div className="pt-6">
          <h1 className="text-[28px] leading-tight font-bold">ハレゴト</h1>
          <p className="mt-3 text-[15px] leading-relaxed">パパの家のことを、晴れごとに</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">見えない家事・育児を、晴れた気持ちで回ることに</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            登録なし・メールアドレス不要・パートナーの登録も不要。
            <br />
            最初に4つだけタップで教えてください。
          </p>
          <Button size="lg" className="mt-5" data-testid="ob-start" onClick={() => store.setOb({ step: 1 })}>
            はじめる
          </Button>
          <button type="button" className="mx-auto mt-3 block min-h-11 px-3 py-2 text-[13px] text-muted" onClick={() => store.setOb({ step: 5 })}>
            あとで答える → 予報士に聞く
          </button>
        </div>
      ) : null}

      {ob.step === 1 ? (
        <div className="pt-4">
          <h2 className="text-lg font-bold">子どもは何人ですか？</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['1人', '2人', '3人', '4人以上'].map((label, index) => (
              <Chip
                key={label}
                on={ob.count === index + 1}
                data-testid={`count-${index + 1}`}
                onClick={() => store.setOb({ count: index + 1, ages: ob.ages.slice(0, index + 1) })}
              >
                {label}
              </Chip>
            ))}
          </div>
          {Array.from({ length: ob.count }, (_, index) => (
            <div key={index} className="mt-4">
              <p className="text-xs font-bold text-accent">{kidName(index, ob.count)}の年齢</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AGES.map((age) => (
                  <Chip
                    key={age.label}
                    on={ob.ages[index] === age.label}
                    data-age={`${index}:${age.label}`}
                    onClick={() => {
                      const ages = [...ob.ages]
                      ages[index] = age.label
                      store.setOb({ ages })
                    }}
                  >
                    {age.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
          <Button size="lg" className="mt-5" data-testid="ob-next" disabled={!readyAges} onClick={() => store.setOb({ step: 2 })}>
            次へ
          </Button>
          <Skip onClick={() => store.setOb({ step: 2 })} />
        </div>
      ) : null}

      {ob.step === 2 ? (
        <div className="pt-4">
          <h2 className="text-lg font-bold">働き方は？</h2>
          <div className="mt-3 space-y-2">
            {WORK_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={ob.work === option}
                onClick={() => {
                  store.setOb({ work: option, step: 3 })
                }}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          <Skip onClick={() => store.setOb({ step: 3 })} />
        </div>
      ) : null}

      {ob.step === 3 ? (
        <div className="pt-4">
          <h2 className="text-lg font-bold">休みの日は？</h2>
          <p className="mt-3 text-xs font-bold text-accent">自分</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {OFF_OPTIONS.map((option) => (
              <Chip key={option} on={ob.offDad === option} onClick={() => store.setOb({ offDad: option })}>
                {option}
              </Chip>
            ))}
          </div>
          <p className="mt-4 text-xs font-bold text-accent">パートナー</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {OFF_OPTIONS.map((option) => (
              <Chip key={option} on={ob.offPartner === option} onClick={() => store.setOb({ offPartner: option })}>
                {option}
              </Chip>
            ))}
          </div>
          <Button size="lg" className="mt-5" data-testid="ob-next" onClick={() => store.setOb({ step: 4 })}>
            次へ
          </Button>
          <Skip onClick={() => store.setOb({ step: 4 })} />
        </div>
      ) : null}

      {ob.step === 4 ? (
        <ReturnStep />
      ) : null}

      {ob.step === 6 ? <OptionalStep /> : null}

      {ob.step === 5 ? (
        <div className="pt-6">
          <h2 className="text-lg font-bold">ありがとうございます。いま、どれに近いですか？</h2>
          <div className="mt-3">
            <SceneGrid testPrefix="scene-" onPick={(id) => store.finishOb(id)} />
          </div>
          <button type="button" className="mx-auto mt-3 block text-[13px] text-muted" onClick={() => store.finishOb(null)}>
            今はない → 今日の画面へ
          </button>
          <p className="mt-4 text-center text-xs text-muted">園・ゴミの日・車などは、必要になった時に1つずつ聞きます</p>
        </div>
      ) : null}
    </div>
  )
}

function ReturnStep() {
  const store = useStore()
  const info = returnInfo(store.ob.home)
  return (
    <div className="pt-4">
      <h2 className="text-lg font-bold">平日、家に着くのはだいたい何時？</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        帰る前に「今日の段取り」を1つだけ届ける時刻に使います。曜日で違う人は、多い方でOK（あとで直せます）。
      </p>
      <div className="mt-3 space-y-2">
        {RETURN_WINDOWS.map((row) => (
          <OptionButton key={row.label} selected={store.ob.home === row.label} onClick={() => store.setOb({ home: row.label })}>
            {row.label}
          </OptionButton>
        ))}
      </div>
      {info ? (
        <p className="mt-3 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5 text-[13px] leading-relaxed">
          帰る前（<b>{info.notify}ごろ</b>）に、今日の画面に「帰る前の一手」を出します。
        </p>
      ) : store.ob.home ? (
        <p className="mt-3 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2.5 text-[13px] leading-relaxed">
          日によって違うので、自動では送りません。今日の画面にだけ出します。
        </p>
      ) : null}
      <Button size="lg" className="mt-4" data-testid="ob-next" disabled={!store.ob.home} onClick={() => store.setOb({ step: 6 })}>
        次へ
      </Button>
      <Skip onClick={() => store.setOb({ step: 6 })} />
    </div>
  )
}

const USUAL_OPTIONS = ['お風呂', '寝かしつけ', '夕食', '登園の送り', '降園の迎え']
const LEAVE_OPTIONS = [
  { label: '7時台', value: '7:30' },
  { label: '8時台', value: '8:30' },
  { label: '9時以降', value: '9:30' },
  { label: '日による', value: '日による' },
]

function OptionalStep() {
  const store = useStore()
  const { ob } = store
  return (
    <div className="pt-4" data-testid="ob-optional">
      <p className="text-xs font-bold text-muted">任意・答えなくても進めます</p>
      <h2 className="mt-1 text-lg font-bold">普段自分がやることは？</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {USUAL_OPTIONS.map((option) => (
          <Chip
            key={option}
            on={ob.usual.includes(option)}
            data-testid={`usual-${option}`}
            onClick={() => {
              const usual = ob.usual.includes(option) ? ob.usual.filter((item) => item !== option) : [...ob.usual, option]
              store.setOb({ usual })
            }}
          >
            {option}
          </Chip>
        ))}
      </div>
      <h2 className="mt-5 text-lg font-bold">家を出る時刻は？</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {LEAVE_OPTIONS.map((option) => (
          <Chip
            key={option.label}
            on={ob.leaveAt === option.value}
            data-testid={`leave-${option.label}`}
            onClick={() => store.setOb({ leaveAt: option.value })}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      <Button size="lg" className="mt-5" data-testid="ob-next" onClick={() => store.setOb({ step: 5 })}>
        次へ
      </Button>
      <Skip
        onClick={() => {
          store.setOb({ usual: [], leaveAt: null, step: 5 })
        }}
      />
    </div>
  )
}

function OptionButton({ selected, children, onClick }: { selected: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-3 text-left text-sm ${selected ? 'border-accent bg-accent-soft' : 'border-line bg-white'}`}
    >
      {children}
    </button>
  )
}

function Skip({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="mx-auto mt-3 block min-h-11 px-3 py-2 text-[13px] text-muted" data-testid="ob-skip" onClick={onClick}>
      スキップ
    </button>
  )
}
