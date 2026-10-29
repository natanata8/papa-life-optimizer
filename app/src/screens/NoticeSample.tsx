import { useState } from 'react'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'
import { gymNotice } from '@/domain/dayMode.ts'

export function NoticeSample() {
  const store = useStore()
  const data = store.data
  const [open, setOpen] = useState(false)
  if (!data) return null
  const save = () => {
    const kid = data.profile.kids[0]
    if (!kid) {
      store.showToast('先に、うちの画面で子どもを入れてください')
      return
    }
    const exists = data.childEvents.some((event) => event.items.includes('体操着') || event.title.includes('体操着'))
    if (!exists) store.addChildEvents([gymNotice(store.today, kid.id)])
    setOpen(false)
    store.setTab('home')
  }
  return (
    <div className="mt-3">
      <button type="button" data-testid="notice-sample" className="inline-flex min-h-11 items-center text-sm font-bold text-accent-deep" onClick={() => setOpen(true)}>
        お便りサンプルを入れる
      </button>
      {open ? (
        <div className="hare-card mt-2 p-3" data-testid="notice-confirm">
          <p className="text-xs font-bold text-accent-deep">サンプル読み取り</p>
          <p className="mt-1 text-sm font-bold">
            <Phrase text="体操着持参" />
          </p>
          <p className="mt-1 text-xs text-muted">画像は送りません。見本の一行だけ入ります。</p>
          <button type="button" data-testid="notice-save" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent-deep text-sm font-bold text-white" onClick={save}>
            今日の一行にする
          </button>
        </div>
      ) : null}
    </div>
  )
}
