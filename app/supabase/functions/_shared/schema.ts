export const TONE_ANSWER_SCHEMA = {
  name: 'tone_answer',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['状況整理', '気づき', '一手', '声かけ例', '明日やること', 'questions', 'safety_flag'],
    properties: {
      状況整理: { type: 'string', description: '2〜3文。家庭に何が残っているか。気持ちは可能性として書く' },
      気づき: { type: 'string', description: '本人が見えていない構造を1文。無ければ空文字' },
      一手: {
        type: 'array',
        minItems: 1,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['タイトル', 'なぜ今', '種類', 'タイミング', 'タスク分解ステップ'],
          properties: {
            タイトル: { type: 'string' },
            なぜ今: { type: 'string' },
            種類: {
              type: 'string',
              enum: ['今やる', '先にやる', '後回し', 'やらない', '休む', '事前に伝える', '置き換える', '後でフォロー'],
            },
            タイミング: { type: 'string' },
            タスク分解ステップ: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string' } },
          },
        },
      },
      声かけ例: { type: 'string' },
      明日やること: { type: 'string' },
      questions: { type: 'array', maxItems: 2, items: { type: 'string' } },
      safety_flag: { type: 'boolean' },
    },
  },
} as const
