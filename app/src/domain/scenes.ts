import type { SceneId } from '@/domain/types.ts'

export type SceneDef = {
  id: SceneId
  icon: string
  title: string
  short: string
  questions: { prompt: string; options: string[] }[]
}

export const SCENES: Record<SceneId, SceneDef> = {
  nomi: {
    id: 'nomi',
    icon: '🍻',
    title: '飲み会に誘われた',
    short: '飲み会',
    questions: [
      { prompt: 'いつですか？', options: ['今日', '明日', '木曜', '来週の金曜'] },
      { prompt: 'その時間、ふだん自分がやっていることは？', options: ['お風呂', '寝かしつけ', '特になし', 'わからない'] },
    ],
  },
  tired: {
    id: 'tired',
    icon: '🌧',
    title: '妻がしんどそう',
    short: '妻がしんどそう',
    questions: [{ prompt: 'いちばん気になるのは？', options: ['言葉がきつい', 'ため息が多い', '寝不足っぽい', 'よくわからない'] }],
  },
  week: {
    id: 'week',
    icon: '☀️',
    title: '週末どうしよう',
    short: '週末',
    questions: [{ prompt: 'どんな週末にしたいですか？', options: ['妻をひとりにしたい', '家族で出かけたい', '近場でゆっくり'] }],
  },
  me: {
    id: 'me',
    icon: '🎮',
    title: '自分の時間がほしい',
    short: '自分の時間',
    questions: [{ prompt: '何をしたいですか？', options: ['ゲーム', 'ジム・運動', 'ひとりでぼーっと', '趣味'] }],
  },
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
}

export const SCENE_LIST = Object.values(SCENES)

const ROUTES: { pattern: RegExp; scene: SceneId }[] = [
  { pattern: /残業|帰りが遅|遅くなり|遅くなる/, scene: 'late' },
  { pattern: /飲み|のみ|飲み会|送別|忘年/, scene: 'nomi' },
  { pattern: /しんど|機嫌|疲れ|怒|イライラ|ため息/, scene: 'tired' },
  { pattern: /週末|土曜|日曜|土日|休み|お出かけ|出かけ/, scene: 'week' },
  { pattern: /自分の時間|ゲーム|ゴルフ|趣味|ジム|ひとり/, scene: 'me' },
]

export function sceneFromText(text: string): SceneId | null {
  return ROUTES.find((route) => route.pattern.test(text))?.scene ?? null
}
