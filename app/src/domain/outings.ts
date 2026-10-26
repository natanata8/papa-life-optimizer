import type { Profile } from '@/domain/types.ts'

export type OutingIdea = {
  id: string
  title: string
  detail: string
  phrase: string
}

export function weekendIdeas(profile: Profile): OutingIdea[] {
  const partner = profile.partner || '妻'
  const kids = profile.kids.length > 1 ? '子どもたち' : '子ども'
  const walk = profile.car === 'ない'
  return [
    {
      id: 'park',
      title: `土曜の午前、${kids}と公園`,
      detail: walk ? '歩いていける範囲。午前だけ外に出て、12時には帰ります。' : '午前だけ。12時には帰ります。',
      phrase: `土曜の午前、${kids}連れて公園行ってくるわ。${partner}は家でゆっくりしてて。12時には帰る。`,
    },
    {
      id: 'lunch',
      title: '土曜は近場で昼まで',
      detail: walk ? '駅の近くで、移動は短めにします。' : '移動は30分以内。昼のあと戻ります。',
      phrase: '土曜、近場で昼ごはんどう？移動は短めにして、午後は家にいる。',
    },
    {
      id: 'library',
      title: '日曜の午後、図書館',
      detail: '1時間で帰る。夜の園の準備は自分がやります。',
      phrase: `日曜の午後、${kids}連れて図書館行ってくる。夜の園の準備は俺がやるわ。`,
    },
  ]
}
