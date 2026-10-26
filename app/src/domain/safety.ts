/**
 * STOP / CARE の定義。
 * supabase/functions/consult/index.ts と同じ正規表現を保つ（keep in sync）。
 */

export const STOP_PATTERN = /暴力|殴ら|殴る|殴っ|蹴ら|蹴っ|叩かれ|叩いてしま|手をあげ|手を上げ|脅さ|脅し|死にたい|消えたい|自殺|死のう|殺し/

export const SELF_HARM_PATTERN = /死にたい|消えたい|自殺|死のう/

export const CARE_PATTERN = /怖い|産後うつ|眠れない日が続|涙が止まらな|限界/

export type SafetyLevel = 'stop' | 'care'

export function safetyLevel(text: string): SafetyLevel | null {
  if (STOP_PATTERN.test(text)) return 'stop'
  if (CARE_PATTERN.test(text)) return 'care'
  return null
}

export function isSafetyConcern(text: string): boolean {
  return safetyLevel(text) === 'stop'
}

export function isSelfHarm(text: string): boolean {
  return SELF_HARM_PATTERN.test(text)
}

export const HOTLINE_MESSAGE =
  '話してくれてありがとうございます。あなたや家族の安全がいちばん大事です。危険を感じる時は迷わず110番、DV相談ナビ #8008、子どもの安全は児童相談所 189 に相談してください。ここでは一手の提案はお休みします。'

export const SELF_HARM_LINES = ['こころの健康相談統一ダイヤル 0570-064-556', 'よりそいホットライン 0120-279-338（24時間）']

export const CARE_CARD =
  'つらさが続く時は、専門の人にも話せます。こころの健康相談統一ダイヤル 0570-064-556 ／ よりそいホットライン 0120-279-338（24時間）。危険を感じたら 110。'
