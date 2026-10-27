/**
 * 引き受けたときに家へ戻る分数。
 * 目安・要調整。画面では必ず「（目安）」と書く。
 */
export const FREED_MIN = {
  bath: 30,
  party: 30,
  prep: 15,
  child: 15,
  pickup: 20,
  overtime: 30,
  event: 20,
  leave: 15,
} as const

export type UmbrellaKind = keyof typeof FREED_MIN

/** 週の上の合計。点数に見えたら false。デモでは出す。 */
export const SHOW_WEEKLY_MARGIN = true

export function acceptNoun(kind: UmbrellaKind): string {
  if (kind === 'bath' || kind === 'party') return 'お風呂'
  if (kind === 'prep') return '持ち物'
  if (kind === 'pickup') return '迎え'
  if (kind === 'overtime') return '残業の切り上げ'
  if (kind === 'leave') return '送り'
  if (kind === 'child') return 'その予定'
  return '段取り'
}

export function marginLine(noun: string, freedMin: number): string {
  return `${noun}を引き受ければ、家に${freedMin}分の余白（目安）`
}

export function marginAfter(noun: string, freedMin: number): string {
  return `${noun}は自分の担当に。家に${freedMin}分の余白（目安）`
}

export function weekActionLine(noun: string, freedMin: number): string {
  return `余白づくり：${noun}を引き受ければ、家に${freedMin}分の余白（目安）`
}

export function weekSummaryLine(count: number, total: number): string {
  return `${count}つ引き受ければ、家に今週の余白 +${total}分（目安）`
}

export function sendLine(noun: string): string {
  return `今から帰るね。${noun}は任せて。残りも帰ってからやるよ`
}

const BREAK_AFTER = new Set(['、', '。', '：', '・', ' ', '）', '」'])
const SOFT_BREAK = new Set(['は', 'と'])

/** 画面ではこの区切りのあいだでだけ折る。家に…（目安）は一塊。 */
export function phraseChunks(text: string): string[] {
  const at = text.indexOf('家に')
  const head = at >= 0 ? text.slice(0, at) : text
  const tail = at >= 0 ? text.slice(at) : ''
  const chunks: string[] = []
  let buf = ''
  for (const ch of head) {
    if ((ch === '（' || ch === '「') && buf) {
      chunks.push(buf)
      buf = ''
    }
    buf += ch
    if (BREAK_AFTER.has(ch) || (SOFT_BREAK.has(ch) && buf.length >= 6)) {
      chunks.push(buf)
      buf = ''
    }
  }
  if (buf) chunks.push(buf)
  if (tail) chunks.push(tail)
  return chunks.filter((chunk) => chunk.length > 0)
}
