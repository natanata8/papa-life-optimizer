# DESIGN_SYSTEM

状態: 見た目は未凍結。既存 Visual は現時点のデザイン仮説である。
`docs/visual-authority/` は historical reference / current hypothesis であり、実装を拘束する正本ではない。

## 正本になるものと、ならないもの

実装を拘束するのは UX / ブランド原則だけである。

拘束しない:

- TOP / DRINK / SOFA / SLEEP_IN / GAME の既存 Visual
- warm off-white / olive / セリフ + Sans / 白カード / lifestyle photography
- 現行 `src/` の銅ドラフト
- `docs/visual-authority/` の画面・トークン・未着画像

これらは仮説として残してよい。採用も棄却もできる。見た目の変更は `HUMAN_REQUIRED` にしない。

参照（拘束しない）:

- [`docs/visual-authority/README.md`](visual-authority/README.md)
- [`docs/visual-authority/manifest.json`](visual-authority/manifest.json)

## UX / ブランド原則

次は維持する。見た目を変えても、ここは崩さない。

- 父親を責めない。怠けや自己中の物語にしない。
- パートナーを敵にも管理職にもしない。
- 自分時間を悪にしない。隠すもの、許してもらう罪にしない。
- SaaS ダッシュボード化しない。KPI、サイドバー、チャート、管理画面の顔を本体にしない。
- 過度なゲーミフィケーションをしない。ポイント、ランキング、バッジ連打で家庭を競争にしない。

コピーのトーン:

- 短い。説明しすぎない。
- 「最適化」「最大化」を見出しに多用しない。
- 日本語を正とする。サービス名の英語は `papa-life-optimizer` のみ残す。

## 現時点のデザイン仮説

変更可能。正本ではない。

- 地: warm off-white
- アクセント: olive
- 見出し: 日本語セリフ
- 本文: サンセリフ
- カード: 白
- 写真: 少量の生活写真

TOP / 飲み会 / ソファ / 朝寝坊 / ゲームの既存案も、同じ扱いである。
夜専用トーンにも、銅ドラフトにも、固定しない。

## 画面

| ID | 画面 | 状態 |
| --- | --- | --- |
| TOP | TOP | デザイン仮説。copy は initial `main` の一文を復元済み |
| DRINK | 飲み会 | デザイン仮説 |
| SOFA | ソファ | デザイン仮説 |
| SLEEP_IN | 朝寝坊 | デザイン仮説 |
| GAME | ゲーム | デザイン仮説 |

## 実装への落とし方

- 現行 TOP 骨格は仮実装のままでよい。仮説 Visual へ無理に寄せない。
- 詳細画面を足すときも、仮説 Visual を freeze してから組む必要はない。
- 原則に反する見た目（責め、敵、罪悪、ダッシュボード、過度なゲーム化）は採用しない。
- 代替の freeze 画像を作って正本化しない。

## 変更ルール

次は `HUMAN_REQUIRED`。

- 上記の UX / ブランド原則を緩めること
- MVP シナリオの追加や差し替え
- Production deploy

次は `AUTO-CONTINUE`。

- デザイン仮説の色、型、写真、フォントの変更
- `docs/visual-authority/` を仮説として更新すること
- 原則を守った範囲での TOP / シナリオ見た目の試作
- コントラストなど、原則を崩さないアクセシビリティ修正
