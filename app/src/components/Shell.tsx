import { useEffect, useState, type ReactNode } from 'react'
import { CalendarDays, House, MapPin, MessageCircle, UserRound } from 'lucide-react'
import { useStore } from '@/app/store.tsx'
import { Onboarding } from '@/screens/Onboarding.tsx'
import { Home } from '@/screens/Home.tsx'
import { Consult } from '@/screens/Consult.tsx'
import { Calendar } from '@/screens/Calendar.tsx'
import { Outings } from '@/screens/Outings.tsx'
import { Profile } from '@/screens/Profile.tsx'
import { Review } from '@/screens/Review.tsx'
import { Sheets } from '@/screens/Sheets.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { Tab } from '@/domain/types.ts'

const NAV: { tab: Tab; label: string; icon: typeof House }[] = [
  { tab: 'home', label: '今日', icon: House },
  { tab: 'out', label: 'お出かけ', icon: MapPin },
  { tab: 'consult', label: '相談', icon: MessageCircle },
  { tab: 'cal', label: 'カレンダー', icon: CalendarDays },
  { tab: 'profile', label: 'うち', icon: UserRound },
]

export function Shell() {
  const store = useStore()
  if (!store.ready) {
    return (
      <Frame>
        <p className="px-6 pt-16 text-sm text-muted">読み込んでいます…</p>
      </Frame>
    )
  }
  if (store.authRequired) return <AuthScreen />
  if (!store.data?.onboarded) {
    return (
      <Frame>
        <Onboarding />
      </Frame>
    )
  }
  const tab = store.tab
  return (
    <Frame>
      {tab === 'home' || tab === 'review' ? tab === 'review' ? <Review /> : <Home /> : null}
      {tab === 'out' ? <Outings /> : null}
      {tab === 'consult' ? <Consult /> : null}
      {tab === 'cal' ? <Calendar /> : null}
      {tab === 'profile' ? <Profile /> : null}
      <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = item.tab === 'home' ? tab === 'home' || tab === 'review' : tab === item.tab
          return (
            <button
              key={item.tab}
              type="button"
              data-testid={`nav-${item.tab}`}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${active ? 'text-accent-deep' : 'text-muted'}`}
              onClick={() => store.setTab(item.tab)}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <Sheets />
      <Toast />
    </Frame>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-sand">
      <div className="relative mx-auto min-h-dvh max-w-[430px] bg-paper">{children}</div>
    </div>
  )
}

function Toast() {
  const store = useStore()
  if (!store.toast) return null
  return (
    <p className="fixed bottom-20 left-1/2 z-50 max-w-[360px] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-center text-[13px] text-white shadow-lg">
      {store.toast}
    </p>
  )
}

function AuthScreen() {
  const store = useStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('code') || window.location.hash.includes('access_token')) store.refreshAuth()
    // マジックリンクの着地は1回だけ見る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Frame>
      <div className="px-5 pt-16">
        <h1 className="text-2xl font-bold">ハレゴト</h1>
        <p className="mt-3 text-sm leading-relaxed">
          この環境は Supabase に保存します。メールのリンクで入れます。パートナーの登録は要りません。
        </p>
        {store.authMessage ? <p className="mt-2 text-sm text-accent-deep">{store.authMessage}</p> : null}
        <label className="mt-4 block text-xs text-muted" htmlFor="email">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button
          className="mt-3"
          size="lg"
          disabled={!email.includes('@') || sent}
          onClick={() => {
            setSent(true)
            void store.signIn(email).catch(() => setSent(false))
          }}
        >
          ログイン用のメールを送る
        </Button>
        {sent ? <p className="mt-2 text-sm text-muted">メールを開いて、リンクをタップしてください。</p> : null}
      </div>
    </Frame>
  )
}
