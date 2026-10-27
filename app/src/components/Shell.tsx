import { useEffect, useState, type ReactNode } from 'react'
import { CalendarDays, House, ListChecks, MessageCircle, UserRound } from 'lucide-react'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'
import { demoOnly } from '@/domain/demo.ts'
import { openRoutineCount } from '@/domain/routines.ts'
import type { AgeLabel } from '@/domain/types.ts'
import { Setup } from '@/screens/Setup.tsx'
import { Onboarding } from '@/screens/Onboarding.tsx'
import { Welcome } from '@/screens/Welcome.tsx'
import { Home } from '@/screens/Home.tsx'
import { DoScreen } from '@/screens/Do.tsx'
import { ShareScreen, PartnerPreview } from '@/screens/Share.tsx'
import { Consult } from '@/screens/Consult.tsx'
import { Calendar } from '@/screens/Calendar.tsx'
import { Profile } from '@/screens/Profile.tsx'
import { Review } from '@/screens/Review.tsx'
import { Sheets } from '@/screens/Sheets.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { Tab } from '@/domain/types.ts'

const NAV: { tab: Tab; label: string; icon: typeof House }[] = [
  { tab: 'home', label: '今日', icon: House },
  { tab: 'do', label: 'やる', icon: ListChecks },
  { tab: 'consult', label: '相談', icon: MessageCircle },
  { tab: 'cal', label: '予定', icon: CalendarDays },
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
  if (store.authRequired && !demoOnly) return <AuthScreen />
  if (!store.data) {
    return (
      <Frame>
        <p className="px-6 pt-16 text-sm text-muted">読み込んでいます…</p>
      </Frame>
    )
  }
  if (!store.data.seenWelcome) {
    return (
      <Frame>
        <Welcome />
      </Frame>
    )
  }
  if (!store.data.onboarded) {
    return (
      <Frame>
        <Onboarding />
      </Frame>
    )
  }
  const tab = store.tab
  const ages = store.data.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
  const ensoku = store.data.childEvents.some((event) => event.title.includes('遠足'))
  const takenCount = openRoutineCount(store.data.taken?.[store.today] ?? [], ages, ensoku)
  return (
    <Frame>
      {store.panel === 'preview' ? <PartnerPreview /> : store.panel === 'share' ? <ShareScreen /> : null}
      {store.panel ? null : store.needsSetup && tab === 'home' ? <Setup /> : tab === 'home' || tab === 'review' ? tab === 'review' ? <Review /> : <Home /> : null}
      {store.panel ? null : tab === 'do' ? <DoScreen /> : null}
      {store.panel ? null : tab === 'consult' ? <Consult /> : null}
      {store.panel ? null : tab === 'cal' ? <Calendar /> : null}
      {store.panel ? null : tab === 'profile' ? <Profile /> : null}
      <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = !store.panel && (item.tab === 'home' ? tab === 'home' || tab === 'review' : tab === item.tab)
          return (
            <button
              key={item.tab}
              type="button"
              data-testid={`nav-${item.tab}`}
              className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs font-bold ${active ? 'text-accent-deep' : 'text-muted'}`}
              onClick={() => {
                store.closePanel()
                store.setTab(item.tab)
              }}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {item.tab === 'do' && takenCount > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-margin px-1 text-[12px] leading-none font-bold text-white">{takenCount}</span>
                ) : null}
              </span>
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
      <div className="relative mx-auto min-h-dvh max-w-[430px] overflow-x-hidden bg-paper">{children}</div>
    </div>
  )
}

function Toast() {
  const store = useStore()
  if (!store.toast) return null
  return (
    <div className="fixed top-3 left-1/2 z-[60] flex w-[min(360px,calc(100%-24px))] -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-4 py-2 text-[13px] text-white shadow-lg" data-testid="toast">
      <p className="min-w-0 flex-1"><Phrase text={store.toast} /></p>
      {store.toastUndo ? (
        <button type="button" data-testid="toast-undo" className="inline-flex min-h-11 items-center font-bold whitespace-nowrap" onClick={() => { store.toastUndo?.(); store.dismissToast() }}>
          元に戻す
        </button>
      ) : null}
    </div>
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
