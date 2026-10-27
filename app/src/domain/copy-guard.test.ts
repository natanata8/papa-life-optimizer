import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const weather = /晴れ|くもり|曇|にわか|もよう|雷|注意報|警報|☔|☀|☁|⛅|🌧|⛈|🌦|🌩|🌈/

const files = [
  new URL('./scenes.ts', import.meta.url),
  new URL('./partnerDay.ts', import.meta.url),
  new URL('./seed.ts', import.meta.url),
  new URL('../screens/Home.tsx', import.meta.url),
  new URL('../screens/Calendar.tsx', import.meta.url),
]

test('妻のそばに天気の言葉も絵文字も置かない', () => {
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const line of source.split('\n')) {
      if (!line.includes('妻')) continue
      assert.equal(weather.test(line), false, `${file.pathname}: ${line.trim()}`)
    }
  }
})

test('注意報と警報の名前は家の仕事', () => {
  const source = readFileSync(new URL('./forecast.ts', import.meta.url), 'utf8')
  const names = source.match(/'[^'\n]*(?:注意報|警報)[^'\n]*'/g) ?? []
  assert.ok(names.length >= 4)
  for (const name of names) assert.equal(/妻|嫁|イライラ|家庭内|機嫌/.test(name), false, name)
})

test('妻がしんどそうの場面アイコンは天気にしない', () => {
  const source = readFileSync(new URL('./scenes.ts', import.meta.url), 'utf8')
  const start = source.indexOf("id: 'tired'")
  const end = source.indexOf("id: 'clash'")
  const block = source.slice(start, end)
  assert.equal(weather.test(block), false, block)
})
