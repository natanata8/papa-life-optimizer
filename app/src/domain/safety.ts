/** v5 モックと同じ語。Edge Function 側のコピーと揃える。 */
const SAFETY_PATTERN = /暴力|殴|叩か|蹴|怖い|脅/

export function isSafetyConcern(text: string): boolean {
  return SAFETY_PATTERN.test(text)
}

export const HOTLINE_MESSAGE =
  '話してくれてありがとうございます。あなたや家族の安全がいちばん大事です。危険を感じる時は迷わず110番、DV相談ナビ #8008、子どもの安全は児童相談所 189 に相談してください。ここでは一手の提案はお休みします。'
