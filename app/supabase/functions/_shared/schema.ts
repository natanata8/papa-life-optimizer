export const TONE_ANSWER_SCHEMA = {
  name: 'tone_answer',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['状況整理', '気づき', '一手', '声かけ例', '明日やること', 'questions', 'safety_flag'],
    properties: {
      状況整理: { type: 'string', maxLength: 120, description: '120字以内、2〜3文。家庭に残る仕事。気持ちは可能性' },
      気づき: { type: 'string', maxLength: 60, description: '60字以内の1文。無ければ空文字' },
      一手: {
        type: 'array',
        minItems: 1,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['タイトル', 'なぜ今', '種類', 'タイミング', 'タスク分解ステップ'],
          properties: {
            タイトル: { type: 'string', maxLength: 20 },
            なぜ今: { type: 'string', maxLength: 40 },
            種類: {
              type: 'string',
              enum: ['今やる', '先にやる', '後回し', 'やらない', '休む', '事前に伝える', '置き換える', '後でフォロー'],
            },
            タイミング: { type: 'string', maxLength: 8 },
            タスク分解ステップ: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', maxLength: 24 } },
          },
        },
      },
      声かけ例: { type: 'string', maxLength: 80 },
      明日やること: { type: 'string', maxLength: 24 },
      questions: { type: 'array', maxItems: 2, items: { type: 'string', maxLength: 30 } },
      safety_flag: { type: 'boolean' },
    },
  },
} as const
