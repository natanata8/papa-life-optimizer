export function isWorkplace(text: string): boolean {
  return /職場|上司|育休が取|育休取得|異動|会社で|会社と|会社への/.test(text)
}

export function isSickChild(text: string): boolean {
  return /子どもが熱|熱のとき|病児|熱が出/.test(text)
}

export const SICK_DAY = {
  scope: '会社のことは、ここでは決めなくていい。',
  note: '今夜の家の手順だけ先に置こう。',
  home: '熱の日は、家の段取りだけ先に置く。',
  title: '病児の日の家の段取り',
  why: '病院と、今夜の短い風呂だけ。',
  steps: ['受診の時間を決める', '今夜の風呂は短くする', '休みの連絡文を自分の言葉で書く'],
  line: '今日は病院に行く。夜の風呂は短く俺がやるね。',
} as const

export function memoryRows<T extends { date: string }>(memories: readonly T[], limit = 5): T[] {
  return [...memories].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, limit)
}
