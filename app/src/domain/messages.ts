export type FatigueId = 'genki' | 'little' | 'done'

export type PartKind = 'arrive' | 'fatigue' | 'tasks' | 'ask' | 'takeover' | 'note'

export type TemplatePart = {
  id: string
  label: string
  defaultOn: boolean
  kind: PartKind
  line?: string
}

export type MessageTemplate = {
  id: string
  title: string
  parts: TemplatePart[]
}

export const FATIGUE_OPTIONS: { id: FatigueId; label: string; line: string }[] = [
  { id: 'genki', label: '元気', line: '今日はわりと元気。' },
  { id: 'little', label: 'ちょっと疲れ', line: 'ちょっと疲れてる。' },
  { id: 'done', label: 'クタクタ', line: 'かなりクタクタ。' },
]

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'home',
    title: '帰宅の連絡',
    parts: [
      { id: 'arrive', label: '到着時刻', defaultOn: true, kind: 'arrive' },
      { id: 'fatigue', label: '疲労度', defaultOn: true, kind: 'fatigue' },
      { id: 'tasks', label: '帰ってからやること', defaultOn: true, kind: 'tasks' },
      { id: 'ask', label: '帰りに何かいる？', defaultOn: true, kind: 'ask', line: '帰りに何かいる？' },
    ],
  },
  {
    id: 'late',
    title: '遅くなる連絡',
    parts: [
      { id: 'arrive', label: '着く時刻', defaultOn: true, kind: 'arrive' },
      { id: 'fatigue', label: '疲労度', defaultOn: false, kind: 'fatigue' },
      { id: 'tasks', label: '今夜お願いすること', defaultOn: true, kind: 'tasks' },
      { id: 'takeover', label: '帰ってから引き取る', defaultOn: true, kind: 'takeover', line: '帰ってから、残ったことは俺がやる。' },
    ],
  },
  {
    id: 'shop',
    title: '買い物確認',
    parts: [
      { id: 'arrive', label: '今から帰る', defaultOn: true, kind: 'arrive' },
      { id: 'note', label: '買うもの', defaultOn: true, kind: 'note' },
      { id: 'ask', label: 'ほかにいる？', defaultOn: true, kind: 'ask', line: 'ほかにいるものある？' },
    ],
  },
]

export function renderMessage(
  template: MessageTemplate,
  input: { on: Record<string, boolean>; time: string; fatigue: FatigueId; tasks: string[]; note: string },
): string {
  const lines: string[] = []
  for (const part of template.parts) {
    if (!input.on[part.id]) continue
    if (part.kind === 'arrive') {
      if (template.id === 'late') {
        lines.push(input.time ? `残業で遅くなる。${input.time}ごろ着く予定。` : '残業で遅くなる。着く時刻は分かったら送る。')
      } else if (template.id === 'shop') {
        lines.push(input.time ? `今から帰る。${input.time}ごろ着く。帰りに寄れる。` : '今から帰る。帰りに寄れる。')
      } else {
        lines.push(input.time ? `今から帰る。${input.time}ごろ着く予定。` : '今から帰る。')
      }
    }
    if (part.kind === 'fatigue') {
      lines.push(FATIGUE_OPTIONS.find((item) => item.id === input.fatigue)?.line ?? '')
    }
    if (part.kind === 'tasks' && input.tasks.length > 0) {
      const label = template.id === 'late' ? '今夜お願いしたいこと' : '帰ってからやること'
      lines.push(`${label}: ${input.tasks.join('、')}`)
    }
    if (part.kind === 'note' && input.note.trim()) {
      lines.push(`買うもの: ${input.note.trim()}`)
    }
    if ((part.kind === 'ask' || part.kind === 'takeover') && part.line) lines.push(part.line)
  }
  return lines.filter(Boolean).join('\n')
}
