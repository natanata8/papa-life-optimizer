# Visual Authority

GitHub 上の見た目の正本。Slack や現行 `src/` の仮実装は正本ではない。

参照先は常にこのディレクトリである。

- マニフェスト: [`manifest.json`](manifest.json)
- 画面: `TOP` / `DRINK` / `SOFA` / `SLEEP_IN` / `GAME`

## 状態

| ID | 画面 | Visual | 画像 | コピー |
| --- | --- | --- | --- | --- |
| TOP | TOP | approved | 未着 `HUMAN_REQUIRED` | 復元済み（initial `main` の確定文のみ） |
| DRINK | 飲み会 | approved / frozen | 未着 `HUMAN_REQUIRED` | タイトルのみ確定 |
| SOFA | ソファ | approved / frozen | 未着 `HUMAN_REQUIRED` | タイトルのみ確定 |
| SLEEP_IN | 朝寝坊 | approved / frozen | 未着 `HUMAN_REQUIRED` | タイトルのみ確定 |
| GAME | ゲーム | approved / frozen | 未着 `HUMAN_REQUIRED` | タイトルのみ確定 |

画像がまだ取れない。代替画像は置かない。
各画面ディレクトリに freeze 済み画面を追加する作業は `HUMAN_REQUIRED`。

## 確定システム

- warm off-white
- olive accent
- 日本語セリフ見出し + Sans 本文
- 白カード
- 少量の生活写真
- 育児アプリのパステル / ゲーミフィケーション / SaaS ダッシュボードは禁止

## やってはいけないこと

- ここに無い画像を生成して正本にすること
- 現行 TOP の銅ドラフトをこのディレクトリへ逆輸入すること
- 画像未着のまま、仮 Visual を freeze 済み VA へ寄せる実装をすること
- TOP に新しいキャッチコピーを足すこと
