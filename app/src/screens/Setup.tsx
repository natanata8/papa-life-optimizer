import { useState } from 'react'
import { useStore } from '@/app/store.tsx'
import { RETURN_WINDOWS } from '@/domain/profile.ts'
import { AGES } from '@/domain/types.ts'
import type { AgeLabel } from '@/domain/types.ts'

export function Setup() {
  const store = useStore()
  const [ages, setAges] = useState<AgeLabel[]>([])
  const [home, setHome] = useState<string | null>(null)
  const toggle = (age: AgeLabel) => {
    setAges((current) => (current.includes(age) ? current.filter((item) => item !== age) : [...current, age]))
  }
  return (
    <div className="px-4 pt-8 pb-28" data-testid="setup">
      <h1 className="text-[25px] leading-snug font-bold">子どもの年齢と、帰宅時刻</h1>
      <p className="mt-2 text-sm leading-relaxed">この2つだけで始められます。ほかの項目は、うちでいつでも足せます。</p>
      <h2 className="mt-5 text-sm font-bold">子どもの年齢</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {AGES.map((age) => (
          <button
            key={age.label}
            type="button"
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold ${ages.includes(age.label) ? 'bg-accent-deep text-white' : 'bg-white'}`}
            onClick={() => toggle(age.label)}
          >
            {age.label}
          </button>
        ))}
      </div>
      <h2 className="mt-5 text-sm font-bold">帰宅時刻の目安</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {RETURN_WINDOWS.map((row) => (
          <button
            key={row.label}
            type="button"
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold ${home === row.label ? 'bg-accent-deep text-white' : 'bg-white'}`}
            onClick={() => setHome(row.label)}
          >
            {row.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        data-testid="setup-start"
        className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent-deep text-base font-bold text-white"
        onClick={() => store.finishSetup(ages, home)}
      >
        この内容ではじめる
      </button>
      <button type="button" className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold" onClick={() => store.finishSetup([], null)}>
        あとで入力する
      </button>
    </div>
  )
}
