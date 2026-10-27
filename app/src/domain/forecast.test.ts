import assert from 'node:assert/strict'
import test from 'node:test'
import { forecast, type ForecastInput } from './forecast.ts'

const banned = /妻|雷|機嫌|家は雨|家族は|気分/

function base(patch: Partial<ForecastInput> = {}): ForecastInput {
  return {
    today: '2026-10-26',
    returnAt: '17:30',
    dadHome: false,
    kidCount: 2,
    events: [],
    childEvents: [],
    lane: [],
    overtime: false,
    steps: [],
    ...patch,
  }
}

test('早い帰宅で予定が無い日は、晴れの一行', () => {
  const result = forecast(base())
  assert.equal(result.quiet, true)
  assert.equal(result.line, '今日は晴れ。特にやることなし')
  assert.equal(result.slots.every((slot) => slot.sky === '晴れ'), true)
  assert.equal(result.estimate, true)
})

test('遅い帰宅と子どもがいれば、夕方だけにわか雨で傘が付く', () => {
  const result = forecast(base({ returnAt: '19:30' }))
  const busy = result.slots.filter((slot) => slot.sky !== '晴れ')
  assert.equal(busy.length, 1)
  assert.equal(busy[0].id, '夕方')
  assert.equal(busy[0].sky, 'にわか雨')
  assert.equal(busy[0].range, '18–20時')
  assert.match(busy[0].reason, /お風呂と寝かしつけが重なる/)
  assert.equal(busy[0].umbrella, '19時までに帰れたら晴れ間に')
  assert.match(busy[0].prompt, /オウチ予報/)
})

test('オンボーディングだけの遅い帰宅も、同じ夕方の予報', () => {
  const result = forecast(base({ returnAt: '19:30', events: [], childEvents: [], lane: [], steps: [] }))
  assert.equal(result.quiet, false)
  assert.equal(result.slots.filter((slot) => slot.sky !== '晴れ').length, 1)
})

test('忙しい枠は2つまで。残りは晴れ', () => {
  const result = forecast(
    base({
      returnAt: '19:30',
      overtime: true,
      events: [{ date: '2026-10-26', time: '12:00', title: '歯医者' }],
      childEvents: [
        { date: '2026-10-26', startTime: '10:00', allDay: false, title: '避難訓練', items: [] },
        { date: '2026-10-27', startTime: '', allDay: true, title: '遠足', items: ['お弁当'] },
      ],
    }),
  )
  const busy = result.slots.filter((slot) => slot.sky !== '晴れ')
  assert.ok(busy.length <= 2)
  assert.ok(busy.length >= 1)
  assert.equal(result.slots.length, 4)
})

test('明日の遠足の持ち物は夜のもよう', () => {
  const result = forecast(
    base({
      childEvents: [{ date: '2026-10-27', startTime: '', allDay: true, title: '遠足', items: ['お弁当', '水筒'] }],
    }),
  )
  const night = result.slots.find((slot) => slot.id === '夜')
  assert.equal(night?.sky, 'もよう')
  assert.match(night?.reason ?? '', /遠足の持ち物/)
  assert.match(night?.umbrella ?? '', /お弁当/)
})

test('迎えの推定は負荷の理由で、人の天気にはしない', () => {
  const result = forecast(base({ returnAt: '19:30', lane: [{ time: '16:30', title: '降園の迎え' }] }))
  const text = JSON.stringify(result)
  assert.equal(banned.test(text), false)
  const evening = result.slots.find((slot) => slot.id === '夕方')
  assert.match(evening?.reason ?? '', /お風呂|降園/)
})

test('晴れにした枠は、うまくいった一手の数', () => {
  const result = forecast(
    base({
      steps: [
        { date: '2026-10-25', time: '21:00', title: '風呂', status: 'good' },
        { date: '2026-10-25', time: '18:00', title: '買い物', status: 'meh' },
        { date: '2026-10-24', time: '21:00', title: '寝かしつけ', status: 'good' },
      ],
    }),
  )
  assert.equal(result.cleared, 2)
})

test('明日の飲み会は、夜の負荷と傘になる', () => {
  const result = forecast(base({ events: [{ date: '2026-10-27', time: '19:00', title: '会社の飲み会', kind: 'nomikai' }] }))
  const night = result.slots.find((slot) => slot.id === '夜')
  assert.equal(night?.sky, 'にわか雨')
  assert.match(night?.reason ?? '', /明日の夜は家を空ける/)
  assert.equal(banned.test(JSON.stringify(result)), false)
})

test('育休で家にいる日は、遅い帰宅の雨を足さない', () => {
  const result = forecast(base({ returnAt: '19:30', dadHome: true }))
  assert.equal(result.quiet, true)
})
