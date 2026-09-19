export const MVP_SCENARIO_TITLES = [
  "飲みに行きたい",
  "ゲームしたい",
  "ソファでゴロゴロしたい",
  "休日は朝寝坊したい",
] as const;

export type ScenarioId = "drink" | "game" | "sofa" | "sleep-in";
export type ScenarioStatus = "skeleton";

export type Scenario = {
  id: ScenarioId;
  title: (typeof MVP_SCENARIO_TITLES)[number];
  desire: string;
  familyPrep: string;
  duration: string;
  status: ScenarioStatus;
};

export const scenarios: Scenario[] = [
  {
    id: "drink",
    title: "飲みに行きたい",
    desire: "仕事終わりや週末に、短時間でも外で飲みたい。",
    familyPrep: "不在中のワンオペと、翌日朝の担当を先に埋める。",
    duration: "2〜3時間",
    status: "skeleton",
  },
  {
    id: "game",
    title: "ゲームしたい",
    desire: "子どもが寝たあと、まとまった時間で没頭したい。",
    familyPrep: "寝かしつけ後の割り込みと、夜の家事残を先に片づける。",
    duration: "60〜90分",
    status: "skeleton",
  },
  {
    id: "sofa",
    title: "ソファでゴロゴロしたい",
    desire: "何もしない回復時間を、予定として確保したい。",
    familyPrep: "「暇なら家事」に回収されない境界を先に決める。",
    duration: "30〜60分",
    status: "skeleton",
  },
  {
    id: "sleep-in",
    title: "休日は朝寝坊したい",
    desire: "休日の朝を、遅起きとして実行したい。",
    familyPrep: "早朝の子ども対応と朝食の担当を前夜に決める。",
    duration: "休日の朝 1 回",
    status: "skeleton",
  },
];
