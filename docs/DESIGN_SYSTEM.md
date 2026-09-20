# DESIGN_SYSTEM

状態: Visual Authority は承認済み。現行 `src/` の見た目は正本ではない。
銅アクセント、Noto Sans JP のみ、夜前提のトーンは捨てる。勝手にリデザインしない。

## 正本

見た目の正本は GitHub の [`docs/visual-authority/`](visual-authority/README.md) である。
画面ごとの状態と未着画像は [`docs/visual-authority/manifest.json`](visual-authority/manifest.json) を見る。

| ID | 画面 | 状態 | GitHub 参照 |
| --- | --- | --- | --- |
| TOP | TOP | Visual approved。canonical copy 復元済み | [visual-authority/TOP](visual-authority/TOP/README.md) |
| DRINK | 飲み会 | approved / frozen | [visual-authority/DRINK](visual-authority/DRINK/README.md) |
| SOFA | ソファ | approved / frozen | [visual-authority/SOFA](visual-authority/SOFA/README.md) |
| SLEEP_IN | 朝寝坊 | approved / frozen | [visual-authority/SLEEP_IN](visual-authority/SLEEP_IN/README.md) |
| GAME | ゲーム | approved / frozen | [visual-authority/GAME](visual-authority/GAME/README.md) |

正本の優先順位:

1. `docs/visual-authority/` の画面ファイル（画像が来たらそれを最優先）
2. 同ディレクトリの manifest と canonical copy
3. このドキュメント（VA を言葉に落としたもの）
4. 実装コード

`src/app/globals.css` と現行 TOP 骨格は、初期セットアップの仮実装である。トークンもレイアウトもここから逆輸入しない。
画像は未着。代替画像は作らない。仮 Visual を freeze 済み VA へ寄せる実装は、今は行わない。

## 確定しているシステム

- 地: warm off-white
- アクセント: olive
- 見出し: 日本語セリフ
- 本文: サンセリフ
- カード: 白
- 写真: 少量の生活写真。飾りではなく場面の温度を足すだけに留める

夜、子どもが寝たあと専用のトーンにはしない。朝寝坊は朝、飲み会は外出、ソファとゲームは家の時間であり、画面ごとに VA の光を守る。

## 禁止

次は Visual Authority に反する。実装してあっても正本にしない。

- 育児アプリのパステル
- ゲーミフィケーション（ポイント、バッジ連打、ランキング）
- SaaS ダッシュボード（カードグリッドの KPI、サイドバー、チャート）
- 銅アクセント（`#C46A2D` を含む）
- Noto Sans JP だけの組版
- クリーム寄りのカード面を「白カード」の代わりに使うこと
- ストック育児写真の量産
- `docs/visual-authority/` に無い生成画像を正本にすること

## トークン

正確な色・余白・写真トリミングは `docs/visual-authority/` の画面から取る。
画像未着の間は、下の役割定義だけを正とし、現行 CSS の値は使わない。

| 役割 | 正本 | 現行実装（誤り） |
| --- | --- | --- |
| background | warm off-white | `#F6EFE4` の紙色は正本ではない |
| accent | olive | `#C46A2D` の銅は正本ではない |
| card | 白 | `#FFFAF3` のクリームカードは正本ではない |
| headline | 日本語セリフ | Noto Sans JP のみは正本ではない |
| body | サンセリフ | 見出しまで Sans に揃えるのは正本ではない |
| photo | 少量の生活写真 | 写真なしのテキストカードを完成形にしない |

フォントの具体名は VA 画面と同一のものを使う。候補として Noto Serif JP / 源ノ明朝系（見出し）と Noto Sans JP / ヒラギノ角ゴ（本文）があるが、VA と食い違うなら VA を優先する。

## レイアウトと写真

- 余白は広め。情報密度で勝たない。
- カードは白。地の warm off-white と差をつけて浮かせる。
- 写真は各シナリオ 1 点程度を上限の目安にする。人物の表情より、杯、ソファ、朝の光、コントローラなど生活の断片を優先する。
- TOP は 4 シナリオへの入口。ダッシュボードにしない。

## コピー

- TOP の Visual は承認済み。canonical copy は [`TOP/canonical-copy.md`](visual-authority/TOP/canonical-copy.md) に復元した。
- 確定文は initial `main` の「育児中の父親が、自分の時間も大切にしながら家庭をうまく回すためのWebサービス」と 4 シナリオ名だけ。
- 「家庭を止めずに、自分の時間を取る」など、初期セットアップで新しく書いた文言は正本ではない。
- 父親を怠け者としない。パートナーを管理職にしない。
- 「最適化」「最大化」を見出しに多用しない。
- 日本語を正とする。サービス名の英語は `papa-life-optimizer` のみ残す。

## 実装への落とし方

今の PR では、仮 Visual を freeze 済み VA へ寄せない。
画像が `docs/visual-authority/` に入ってからの別タスクとする。

1. TOP の見た目は、VA 画像が来てから Visual approved に合わせる。
2. 4 シナリオ詳細は、各 freeze 済み VA を崩さずに組む。
3. 新しい画面が必要なら、既存 5 画面のトーンを継承する。新パレットは作らない。

## 変更ルール

次は `HUMAN_REQUIRED`。

- Frozen 画面の色、型、写真、トーンの変更
- `docs/visual-authority/` への freeze 済み画像追加
- 見出しを Sans に戻す、アクセントを銅やパステルに戻す
- 新しい Visual Authority の追加や差し替え
- TOP の canonical copy を、復元以外の理由で変えること

次は `AUTO-CONTINUE`。

- コントラスト不足など、VA を崩さないアクセシビリティ修正
- この文書と `docs/visual-authority/` の食い違いを、VA 側に合わせて直すこと
- 画像未着のまま、仮 Visual を VA へ寄せる実装はしない
