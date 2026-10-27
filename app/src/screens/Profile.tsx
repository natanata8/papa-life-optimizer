import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore } from '@/app/store.tsx'
import { usingSupabase } from '@/data/index.ts'
import { demoOnly } from '@/domain/demo.ts'
import { DAY_ORDER, DOW_CHARS, formatMd } from '@/domain/dates.ts'
import {
  FIELDS,
  PRIVACY_LABEL,
  addKid,
  fieldOptions,
  setChoice,
  setKidAge,
  setSchool,
  setShop,
  toggleGomi,
  toggleMulti,
  isSet,
} from '@/domain/profile.ts'
import { AGES, GOMI_KINDS, type GomiKind, type School } from '@/domain/types.ts'

const GROUPS = ['家族', '子ども', 'くらし', '頼れる先', 'パートナー']

function iosSafariHint(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua)
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return ios && safari && !standalone
}

function DataHandling() {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold">データの扱い</h2>
      <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-muted">
        {demoOnly ? (
          <>
            <p>保存場所：このブラウザの中だけ。ログインはありません。</p>
            <p>相談の答えはサンプルです。書いた文は外に送りません。</p>
            <p>お便りの写真は、サンプルの予定を出すだけで、アップロードしません。</p>
          </>
        ) : (
          <>
            <p>保存場所：{usingSupabase() ? 'ログインした家族のデータ（Supabase）' : 'このブラウザの中だけ'}</p>
            <p>相談するときAIに送るもの：子どもの年齢と呼び名、働き方、帰宅時間、予定、相談の文。本名ではなく呼び名（例：上の子）での登録がおすすめです。</p>
            <p>お便りの画像：読み取りのためだけにAIへ送り、保存しません。</p>
          </>
        )}
        <p>消し方：下の「この端末のデータを消す」で全部消えます。</p>
      </div>
    </section>
  )
}

export function Profile() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const hiddenCount = Object.keys(data.hidden).length

  return (
    <div className="px-3.5 pt-3.5 pb-28" data-testid="profile">
      <DemoBar />
      <h1 className="text-lg font-bold">うち</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        相談の答えと、カレンダーの 👀 に使います。わかるところだけでOK。{data.profile.partner}さんの登録は要りません。
      </p>
      {(['gomi', 'school', 'shop'] as const).some((key) => !isSet(data.profile, key)) ? (
        <p className="mt-2 rounded-xl bg-white px-3 py-2 text-[13px] leading-relaxed">
          ゴミの日・園・学校・買い物の曜日を入れると、裏で回っている仕事がもっと見えます。
        </p>
      ) : null}
      {GROUPS.map((group) => (
        <section key={group}>
          <h2 className="mt-4 text-sm font-bold">{group}</h2>
          <div className="mt-2 space-y-3">
            {FIELDS.filter((field) => field.group === group).map((field) => (
              <div key={field.key} className="rounded-[14px] bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold">{field.title}</p>
                  <span className="shrink-0 text-xs text-muted">{PRIVACY_LABEL[field.privacy]}</span>
                </div>
                <div className="mt-2">
                  <FieldBody fieldKey={field.key} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <h2 className="mt-4 text-sm font-bold">カレンダーの 👀 見えない仕事</h2>
      <div className="mt-2 flex items-center justify-between rounded-[14px] bg-white px-3 py-2.5">
        <span className="text-sm">表示する</span>
        <Chip on={data.profile.showInv} onClick={() => store.patchProfile((profile) => ({ ...profile, showInv: !profile.showInv }))}>
          {data.profile.showInv ? 'オン' : 'オフ'}
        </Chip>
      </div>
      {hiddenCount > 0 ? (
        <Button size="sm" variant="ghost" className="mt-2" onClick={store.clearHidden}>
          非表示にしたもの（{hiddenCount}件）を戻す
        </Button>
      ) : null}

      <h2 className="mt-4 text-sm font-bold">通知</h2>
      <div className="mt-2 flex items-center justify-between rounded-[14px] bg-white px-3 py-2.5">
        <span className="text-sm">{data.profile.notif === null ? 'まだ聞いていません' : data.profile.notif ? 'オン' : 'オフ'}</span>
        <div className="flex gap-1.5">
          <Chip on={data.profile.notif === true} onClick={() => store.setNotif(true)}>
            オン
          </Chip>
          <Chip on={data.profile.notif === false} onClick={() => store.setNotif(false)}>
            オフ
          </Chip>
        </div>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">スマホへの通知は準備中です。今日の画面の見本だけ出します。</p>

      <h2 className="mt-4 text-sm font-bold">ハレゴトが覚えていること</h2>
      {data.memories.length === 0 ? (
        <p className="mt-2 text-[13px] text-muted">まだありません。</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.memories.map((memory) => (
            <div key={memory.id} className="flex items-start justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[13px]">
              <p>
                <span className="text-muted">{formatMd(memory.date)}</span>
                <br />
                {memory.text}
              </p>
              <button type="button" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-xs text-muted" onClick={() => store.deleteMemory(memory.id)}>
                消す
              </button>
            </div>
          ))}
        </div>
      )}

      <DataHandling />
      {iosSafariHint() ? (
        <p className="mt-4 text-[13px] leading-relaxed text-muted">ホーム画面に追加すると、アプリのように開けます（共有ボタン →「ホーム画面に追加」）。</p>
      ) : null}
      <Button className="mt-6" size="lg" variant="quiet" data-testid="profile-reset" onClick={() => store.openSheet({ type: 'reset' })}>
        この端末のデータを消す
      </Button>
    </div>
  )
}

function FieldBody({ fieldKey }: { fieldKey: string }) {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const profile = data.profile

  if (fieldKey === 'kids') {
    return (
      <div className="space-y-3">
        {profile.kids.length === 0 ? <p className="text-[13px] text-muted">まだ入っていません。</p> : null}
        {profile.kids.map((kid, index) => (
          <div key={kid.id} className="rounded-xl bg-paper p-2">
            <div className="flex items-center gap-2">
              <input
                className="w-24 rounded-lg border border-line bg-white px-2 py-1 text-sm"
                value={kid.name}
                aria-label={`${kid.name}の呼び名`}
                onChange={(event) =>
                  store.patchProfile((current) => ({
                    ...current,
                    kids: current.kids.map((item, kidIndex) => (kidIndex === index ? { ...item, name: event.target.value } : item)),
                  }))
                }
              />
              <button type="button" className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center text-xs text-muted" onClick={() => store.dropKid(index)}>
                外す
              </button>
            </div>
            <label className="mt-2 block text-[12px] text-muted">
              誕生日（任意）
              <input
                className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1 text-sm"
                type="date"
                value={kid.birthday ?? ''}
                onChange={(event) =>
                  store.patchProfile((current) => ({
                    ...current,
                    kids: current.kids.map((item, kidIndex) =>
                      kidIndex === index ? { ...item, birthday: event.target.value || null } : item,
                    ),
                  }))
                }
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-1">
              {AGES.map((age) => (
                <Chip
                  key={age.label}
                  className="px-2 py-1 text-[12px]"
                  on={kid.ageLabel === age.label}
                  onClick={() => store.patchProfile((current) => setKidAge(current, index, age.label))}
                >
                  {age.label}
                </Chip>
              ))}
            </div>
          </div>
        ))}
        <Button size="sm" variant="ghost" onClick={() => store.patchProfile(addKid)}>
          ＋ 子どもを追加
        </Button>
      </div>
    )
  }

  if (fieldKey === 'school') {
    if (profile.kids.length === 0) return <p className="text-[13px] text-muted">先に子どもを入れてください。</p>
    return (
      <div className="space-y-2">
        {profile.kids.map((kid, index) => (
          <div key={kid.id}>
            <p className="text-xs text-muted">{kid.name}</p>
            <input
              className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1 text-sm"
              placeholder="園・学校の名前（任意）"
              aria-label={`${kid.name}の園・学校`}
              value={kid.schoolName}
              onChange={(event) =>
                store.patchProfile((current) => ({
                  ...current,
                  kids: current.kids.map((item, kidIndex) => (kidIndex === index ? { ...item, schoolName: event.target.value } : item)),
                }))
              }
            />
            <div className="mt-1 flex flex-wrap gap-1">
              {fieldOptions('school').map((option) => (
                <Chip
                  key={option}
                  on={kid.school === option}
                  onClick={() => store.patchProfile((current) => setSchool(current, index, option as School))}
                >
                  {option}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (fieldKey === 'gomi') {
    return (
      <div className="space-y-2">
        {GOMI_KINDS.map((kind) => (
          <div key={kind}>
            <p className="text-xs font-bold">{kind}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {DAY_ORDER.map((dow) => (
                <Chip
                  key={dow}
                  data-testid={`gomi-${kind}-${dow}`}
                  on={profile.gomi[kind].includes(dow)}
                  onClick={() => store.patchProfile((current) => toggleGomi(current, kind as GomiKind, dow))}
                >
                  {DOW_CHARS[dow]}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (fieldKey === 'shop') {
    return (
      <div className="flex flex-wrap gap-1">
        {DAY_ORDER.map((dow) => (
          <Chip key={dow} data-testid={`shop-${dow}`} on={profile.shop === dow} onClick={() => store.patchProfile((current) => setShop(current, dow))}>
            {DOW_CHARS[dow]}
          </Chip>
        ))}
      </div>
    )
  }

  if (fieldKey === 'support' || fieldKey === 'outsource') {
    const key = fieldKey
    return (
      <div className="flex flex-wrap gap-1.5">
        {fieldOptions(key).map((option) => (
          <Chip key={option} on={profile[key].includes(option)} onClick={() => store.patchProfile((current) => toggleMulti(current, key, option))}>
            {option}
          </Chip>
        ))}
      </div>
    )
  }

  const choiceKeys = ['work', 'offDad', 'offPartner', 'home', 'car', 'area', 'allergy', 'pstate', 'lesson', 'partner'] as const
  if (choiceKeys.includes(fieldKey as (typeof choiceKeys)[number])) {
    const key = fieldKey as (typeof choiceKeys)[number]
    return (
      <div className="flex flex-wrap gap-1.5">
        {fieldOptions(key).map((option) => (
          <Chip key={option} on={profile[key] === option} onClick={() => store.patchProfile((current) => setChoice(current, key, option))}>
            {option}
          </Chip>
        ))}
      </div>
    )
  }

  return null
}
