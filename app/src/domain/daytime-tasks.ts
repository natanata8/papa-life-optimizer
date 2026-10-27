/** 家事・育児タスク一覧（408件）から、朝・夕・毎食など時刻の語があるものだけを写した。id と題は原文。 */
export type DaytimeTask = {
  id: string
  title: string
  frequency: string
  stage: string
  minutes: number
  invisible: boolean
}

export const DAYTIME_TASKS: DaytimeTask[] = [
  { id: 'yu-002', title: '主食と汁物・おかずを手早く作る', frequency: '毎朝', stage: '複数ステージ', minutes: 22, invisible: false },
  { id: 'yu-003', title: '子ども用に取り分け・切り分ける', frequency: '毎朝', stage: '0歳〜小学校低学年', minutes: 5, invisible: false },
  { id: 'yu-004', title: '食べ終わった食器を下げる・拭く', frequency: '毎朝', stage: '複数ステージ', minutes: 5, invisible: false },
  { id: 'yu-006', title: '弁当・置き弁を作る', frequency: '平日朝など', stage: '3〜5歳〜小学校低学年', minutes: 22, invisible: false },
  { id: 'yu-016', title: '食べこぼしを拭きエプロンを洗う', frequency: '毎食', stage: '0歳〜3〜5歳', minutes: 5, invisible: false },
  { id: 'yu-019', title: '水筒に水・お茶を入れる', frequency: '毎朝', stage: '3〜5歳〜小学校低学年', minutes: 3, invisible: false },
  { id: 'yu-021', title: '食洗機・手洗いで食器を洗う', frequency: '毎食', stage: '複数ステージ', minutes: 15, invisible: false },
  { id: 'yu-022', title: '食器を拭いて収納する', frequency: '毎食', stage: '複数ステージ', minutes: 8, invisible: false },
  { id: 'yu-117', title: '子どもの歯みがきを仕上げる', frequency: '朝晩', stage: '1〜2歳〜小学校低学年', minutes: 5, invisible: false },
  { id: 'yu-197', title: '子ども用の食器・椅子を用意する', frequency: '毎食', stage: '1〜2歳〜3〜5歳', minutes: 5, invisible: false },
  { id: 'yu-198', title: '食べるペースを見守り声かけする', frequency: '毎食', stage: '1〜2歳〜3〜5歳', minutes: 20, invisible: false },
  { id: 'yu-200', title: '食べ残し・こぼしを片付ける', frequency: '毎食', stage: '1〜2歳〜3〜5歳', minutes: 5, invisible: false },
  { id: 'yu-206', title: '朝の着替えを手伝う・見守る', frequency: '毎朝', stage: '1〜2歳〜小学校低学年', minutes: 10, invisible: false },
  { id: 'yu-226', title: '着替え・水筒・タオルをそろえる', frequency: '毎朝', stage: '3〜5歳', minutes: 10, invisible: false },
  { id: 'yu-227', title: '連絡帳・体温を記入する', frequency: '毎朝', stage: '3〜5歳', minutes: 5, invisible: true },
  { id: 'yu-228', title: '登園前の体調・機嫌を確認する', frequency: '毎朝', stage: '3〜5歳', minutes: 3, invisible: true },
  { id: 'yu-229', title: '登園の送りをする', frequency: '平日朝', stage: '3〜5歳', minutes: 22, invisible: false },
  { id: 'yu-230', title: '降園の迎えをする', frequency: '平日夕方', stage: '3〜5歳', minutes: 22, invisible: false },
  { id: 'yu-231', title: '送迎時の先生への伝言を共有する', frequency: '送迎時', stage: '3〜5歳', minutes: 3, invisible: true },
  { id: 'yu-249', title: '登校の見送り・声かけをする', frequency: '平日朝', stage: '小学校低学年', minutes: 10, invisible: false },
  { id: 'yu-290', title: '夜間対応後に翌朝の引き継ぎをする', frequency: '毎朝', stage: '0歳〜1〜2歳', minutes: 5, invisible: true },
  { id: 'yu-293', title: '朝の体温・体調をチェックする', frequency: '毎朝', stage: '0歳〜小学校低学年', minutes: 3, invisible: true },
  { id: 'day-nap', title: '昼寝の見守り', frequency: '昼', stage: '0歳〜3〜5歳', minutes: 20, invisible: true },
  { id: 'day-laundry', title: '洗濯物を干す・取り込む', frequency: '日中', stage: '複数ステージ', minutes: 15, invisible: true },
  { id: 'day-snack', title: '午後のおやつを出す', frequency: '午後', stage: '1〜2歳〜3〜5歳', minutes: 10, invisible: false },
  { id: 'day-toys', title: 'おもちゃを一箇所に戻す', frequency: '日中', stage: '1〜2歳〜小学校低学年', minutes: 10, invisible: true },
  { id: 'day-diaper', title: 'おむつを替える', frequency: '日中', stage: '0歳〜3〜5歳', minutes: 8, invisible: false },
  { id: 'day-book', title: '絵本を一冊読む', frequency: '日中', stage: '0歳〜小学校低学年', minutes: 10, invisible: false },
  { id: 'day-bath', title: '夕方の風呂の準備をする', frequency: '夕方前', stage: '0歳〜小学校低学年', minutes: 10, invisible: true },
  { id: 'day-clothes', title: '翌日の服を出しておく', frequency: '夕方', stage: '0歳〜小学校低学年', minutes: 5, invisible: true },
  { id: 'day-note', title: '園からの連絡を見る', frequency: '日中', stage: '3〜5歳', minutes: 5, invisible: true },
  { id: 'day-milk', title: 'ミルク・水分を用意する', frequency: '日中', stage: '0歳〜1〜2歳', minutes: 8, invisible: false },
]
