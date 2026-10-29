import type { Profile } from '@/domain/types.ts'

export type OutingSourceKind = 'mock' | 'web' | 'x' | 'influencer'

export type OutingSpot = {
  id: string
  title: string
  summary: string
  area: '近場' | '遠出'
  rainOk: boolean
  weekend: boolean
  parking: string
  toilet: string
  food: string
  eventNote: string
  pack: string[]
  phrase: string
  source: OutingSourceKind
  sourceUrl: string | null
  fetchedAt: string | null
}

const SPOTS: OutingSpot[] = [
  {
    id: 'park',
    title: '近所の公園',
    summary: '午前だけ出て、12時には帰ります。',
    area: '近場',
    rainOk: false,
    weekend: true,
    parking: '駐車場は少ないです。車なら早めに着くか、歩ける距離で。',
    toilet: '園内にトイレがあることが多いです。おむつ替え台は無い公園もあります。道中は駅かコンビニを1つ決めておくと安心です。',
    food: '持参か、帰り道に近場。公園内の飲食は場所によります。',
    eventNote: '決まったイベントはありません。混むのは10時前後です。',
    pack: ['レジャーシート', '帽子', '飲み物'],
    phrase: '土曜の午前、近所の公園に行ってくる。12時には帰る。午前は家でゆっくりしてて。',
    source: 'mock',
    sourceUrl: null,
    fetchedAt: null,
  },
  {
    id: 'lunch',
    title: '近場で昼まで',
    summary: '移動は短く、午後は家にいます。',
    area: '近場',
    rainOk: true,
    weekend: true,
    parking: '店による。駅の近くならコインパーキングを先に1つ。',
    toilet: '食事の店のトイレ。おむつ替えはできない店が多いので、前後の商業施設を見ておきます。',
    food: '昼ごはんがこのお出かけの本体です。待ち時間が短い店を先に。',
    eventNote: '週末の11時半は混みます。',
    pack: ['お手ふき', '着替え1組'],
    phrase: '土曜、近場で昼ごはんどう？移動は短めにして、午後は家にいる。',
    source: 'mock',
    sourceUrl: null,
    fetchedAt: null,
  },
  {
    id: 'library',
    title: '図書館',
    summary: '1時間で帰ります。夜の園の準備は自分がやります。',
    area: '近場',
    rainOk: true,
    weekend: true,
    parking: '駅前にコインパーキング。徒歩でも行けます。',
    toilet: '館内のトイレ。おむつ替え台は1階にある館が多いです。',
    food: '館内は飲食できないことが多いです。前後で済ませます。',
    eventNote: 'おはなし会がある週があります。日時は館の案内で確認します。ここにはまだ入れていません。',
    pack: ['絵本を返す袋'],
    phrase: '日曜の午後、図書館に行ってくる。夜の園の準備は俺がやる。',
    source: 'mock',
    sourceUrl: null,
    fetchedAt: null,
  },
  {
    id: 'indoor',
    title: '雨の日の室内遊び場',
    summary: '屋根の下で1時間半。午後は家です。',
    area: '近場',
    rainOk: true,
    weekend: true,
    parking: '施設の駐車場。週末は満車のことがあります。',
    toilet: '館内にトイレとおむつ替え台があります。',
    food: '軽食コーナーがある施設が多いです。持参できるかは場所のルールを見てから。',
    eventNote: '平日と週末で混み方が違います。特別な催しは、今はモックに入れていません。',
    pack: ['室内靴', '飲み物'],
    phrase: '雨なら室内の遊び場にしよう。1時間半で帰る。午後は家にいる。',
    source: 'mock',
    sourceUrl: null,
    fetchedAt: null,
  },
  {
    id: 'bigpark',
    title: '車で30分の公園',
    summary: '午前に出て、昼前に帰ります。',
    area: '遠出',
    rainOk: false,
    weekend: true,
    parking: '広い駐車場があります。9時台の方が空いています。',
    toilet: '園内のトイレ。おむつ替え台は管理棟にあることが多いです。道中はサービスエリアかコンビニを1つ。',
    food: '持参の弁当か、帰りに近場。売店は混みます。',
    eventNote: '季節の花や遊具の入れ替えがあります。開催日はまだ取っていません。',
    pack: ['レジャーシート', '帽子', '着替え'],
    phrase: '土曜の午前、車で30分の公園に行ってくる。昼前には帰る。',
    source: 'mock',
    sourceUrl: null,
    fetchedAt: null,
  },
]

export function outingSpots(profile: Profile): OutingSpot[] {
  return SPOTS.filter((spot) => spot.id !== 'bigpark' || profile.car !== 'ない').map((spot) => ({
    ...spot,
    phrase: phraseFor(spot, profile),
  }))
}

export function packFor(spot: OutingSpot, profile: Profile): string[] {
  const extra: string[] = []
  const ages = profile.kids.map((kid) => kid.age).filter((age): age is number => age !== null && age >= 0)
  if (ages.some((age) => age < 1)) extra.push('抱っこ紐', 'おむつ', 'おしりふき')
  else if (ages.some((age) => age <= 2)) extra.push('おむつ', 'おしりふき', '着替え')
  if (ages.some((age) => age >= 3 && age <= 5)) extra.push('水筒', '帽子')
  if (ages.some((age) => age >= 6)) extra.push('水筒')
  return [...new Set([...spot.pack, ...extra])]
}

function phraseFor(spot: OutingSpot, profile: Profile): string {
  const kids = profile.kids.length > 1 ? '子どもたち' : '子ども'
  if (spot.id === 'park') {
    return `土曜の午前、${kids}と近所の公園に行ってくる。12時には帰る。午前は家でゆっくりしてて。`
  }
  if (spot.id === 'library') {
    return `日曜の午後、${kids}と図書館に行ってくる。夜の園の準備は俺がやる。`
  }
  return spot.phrase
}

export type OutingIdea = { id: string; title: string; detail: string; phrase: string }

export function weekendIdeas(profile: Profile): OutingIdea[] {
  return outingSpots(profile)
    .filter((spot) => spot.weekend)
    .slice(0, 3)
    .map((spot) => ({ id: spot.id, title: spot.title, detail: spot.summary, phrase: spot.phrase }))
}
