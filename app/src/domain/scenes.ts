import type { SceneId } from './types.ts'

export type SceneDef = {
  id: SceneId
  icon: string
  title: string
  short: string
  questions: { prompt: string; options: string[] }[]
}

export const SCENES: Record<SceneId, SceneDef> = {
  late: {
    id: 'late',
    icon: '🕘',
    title: '残業で遅くなる',
    short: '残業',
    questions: [
      { prompt: '何時ごろ帰れそう？', options: ['20時', '21時', '22時以降', 'まだわからない'] },
      { prompt: '今夜、ふだん自分がやっていることは？', options: ['お風呂', '寝かしつけ', '夕食', '特になし'] },
    ],
  },
  week: {
    id: 'week',
    icon: '☀️',
    title: '週末の予定を決めたい',
    short: '週末',
    questions: [{ prompt: 'どんな週末にしたいですか？', options: ['妻をひとりにしたい', '家族で出かけたい', '近場でゆっくり'] }],
  },
  nomi: {
    id: 'nomi',
    icon: '🍻',
    title: '飲み会に行きたい',
    short: '飲み会',
    questions: [
      { prompt: 'いつですか？', options: ['今日', '明日', '木曜', '来週の金曜'] },
      { prompt: 'その時間、ふだん自分がやっていることは？', options: ['お風呂', '寝かしつけ', '特になし', 'わからない'] },
    ],
  },
  me: {
    id: 'me',
    icon: '🎮',
    title: '自分の時間がほしい',
    short: '自分の時間',
    questions: [{ prompt: '何をしたいですか？', options: ['ゲーム', 'ジム・運動', 'ひとりでぼーっと', '趣味'] }],
  },
  tired: {
    id: 'tired',
    icon: '💭',
    title: '妻がしんどそうで気になる',
    short: '妻がしんどそう',
    questions: [{ prompt: 'いちばん気になるのは？', options: ['言葉がきつい', 'ため息が多い', '寝不足っぽい', 'よくわからない'] }],
  },
  clash: {
    id: 'clash',
    icon: '💬',
    title: '怒られて、どうしたらいいか分からない',
    short: '怒られた',
    questions: [{ prompt: '今夜、何が残っていますか？', options: ['寝かしつけ', '話し合い', '家事', 'よくわからない'] }],
  },
}

/** すぐ相談の暫定セット。並びを変えるときはこの配列だけを入れ替える。 */
export const QUICK_PRESET_IDS: SceneId[] = ['late', 'week', 'nomi', 'me', 'tired', 'clash']

export const SCENE_LIST = QUICK_PRESET_IDS.map((id) => SCENES[id])

const ROUTES: { pattern: RegExp; scene: SceneId }[] = [
  { pattern: /怒られて|怒られた|怒鳴|どうしたらいいか分から|どうしたら良いか分から|どうしたらいいかわからない/, scene: 'clash' },
  { pattern: /残業|帰りが遅|遅くなり|遅くなる/, scene: 'late' },
  { pattern: /飲み|のみ|飲み会|送別|忘年/, scene: 'nomi' },
  { pattern: /しんど|機嫌|疲れ|イライラ|ため息/, scene: 'tired' },
  { pattern: /週末|土曜|日曜|土日|休み|お出かけ|出かけ/, scene: 'week' },
  { pattern: /自分の時間|ゲーム|ゴルフ|趣味|ジム|ひとり/, scene: 'me' },
]

export function sceneFromText(text: string): SceneId | null {
  return ROUTES.find((route) => route.pattern.test(text))?.scene ?? null
}

const FALLBACK_CHOICES: { title: string; keywords: string[] }[] = [
  { title: 'お風呂を短くする', keywords: ['風呂', '湯船', '保湿', '入浴'] },
  { title: SCENES.late.title, keywords: ['残業', '遅い', '帰り', '遅くな'] },
  { title: SCENES.nomi.title, keywords: ['飲', 'のみ', '送別会', '忘年'] },
  { title: SCENES.week.title, keywords: ['週末', '土曜', '日曜', '土日', '出かけ'] },
  { title: SCENES.me.title, keywords: ['自分の時間', 'ゲーム', '趣味', 'ジム', 'ひとり'] },
  { title: SCENES.tired.title, keywords: ['しんど', '機嫌', '疲れ', 'イライラ', 'ため息'] },
  { title: SCENES.clash.title, keywords: ['怒', '怒鳴', 'どうしたら'] },
]

/** 入力に含まれる語だけで場面を並べる。関係のない場面は出さない。 */
export function fallbackScenes(text: string): string[] {
  const ranked = FALLBACK_CHOICES.map((choice) => ({
    title: choice.title,
    score: choice.keywords.reduce((sum, word) => sum + (text.includes(word) ? word.length : 0), 0),
  })).filter((choice) => choice.score > 0)
  ranked.sort((a, b) => b.score - a.score)
  return ranked.map((choice) => choice.title)
}
