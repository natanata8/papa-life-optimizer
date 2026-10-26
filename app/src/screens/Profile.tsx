import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Chip } from '@/components/ui/chip.tsx'
import { useStore } from '@/app/store.tsx'
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
} from '@/domain/profile.ts'
import { AGES, GOMI_KINDS, type GomiKind, type School } from '@/domain/types.ts'

const GROUPS = ['家族', '子ども', 'くらし', '頼れる先', 'パートナー']

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
      {GROUPS.map((group) => (
        <section key={group}>
          <h2 className="mt-4 text-sm font-bold">{group}</h2>
          <div className="mt-2 space-y-3">
            {FIELDS.filter((field) => field.group === group).map((field) => (
              <div key={field.key} className="rounded-[14px] bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold">{field.title}</p>
                  <span className="shrink-0 text-[11px] text-muted">{PRIVACY_LABEL[field.privacy]}</span>
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
      <p className="mt-1 text-[11px] leading-relaxed text-faint">この叩き台では通知の見え方だけです。端末への送信はしません。</p>

      <h2 className="mt-4 text-sm font-bold">tONEが覚えていること</h2>
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
              <button type="button" className="shrink-0 text-xs text-muted" onClick={() => store.deleteMemory(memory.id)}>
                消す
              </button>
            </div>
          ))}
        </div>
      )}

      <Button className="mt-6" size="lg" variant="quiet" data-testid="profile-reset" onClick={() => store.openSheet({ type: 'reset' })}>
        この端末のデータを消す
      </Button>
      <p className="mt-2 text-[11px] leading-relaxed text-faint">
        初期状態ではこのブラウザだけに保存します。Supabase に切り替えると、ログインした家族の行に保存します。
      </p>
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
              <button type="button" className="ml-auto text-xs text-muted" onClick={() => store.dropKid(index)}>
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
