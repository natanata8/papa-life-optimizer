# DESIGN_SYSTEM

状態: Visual Authority は承認済み。現行 `src/` の見た目は正本ではない。
銅アクセント、Noto Sans JP のみ、夜前提のトーンは捨てる。勝手にリデザインしない。

## 正本

見た目の正本は、ここで確定した Visual Authority 画面である。

| 画面 | 状態 | 扱い |
| --- | --- | --- |
| TOP | Visual approved | 正本。canonical copy は復元前提。今の実装コピーを正にしない |
| drink / 飲み会 | Visual Authority approved / frozen | 実質 Freeze。色・型・写真の扱いを変えない |
| sofa / ソファ | Visual Authority approved / frozen | 実質 Freeze |
| sleep-in / 朝寝坊 | Visual Authority approved / frozen | 実質 Freeze |
| game / ゲーム | Visual Authority approved / frozen | 実質 Freeze |

正本の優先順位:

1. 上記 5 画面の既存 Visual Authority
2. このドキュメント（VA を言葉に落としたもの）
3. 実装コード

`src/app/globals.css` と現行 TOP 骨格は、初期セットアップの仮実装である。トークンもレイアウトもここから逆輸入しない。

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

## トークン

正確な色・余白・写真トリミングは Visual Authority 画面から取る。
下は役割の定義であり、現行 CSS の値ではない。

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

- TOP の Visual は承認済み。ただし canonical copy は復元前提。
- 今の実装文言（「家庭を止めずに、自分の時間を取る」など）を完成コピーとして固定しない。
- 父親を怠け者としない。パートナーを管理職にしない。
- 「最適化」「最大化」を見出しに多用しない。
- 日本語を正とする。サービス名の英語は `papa-life-optimizer` のみ残す。

## 実装への落とし方

次の実装は VA に合わせる。今の銅 / Sans のみ骨格を「完成」として伸ばさない。

1. TOP を Visual approved に合わせ、canonical copy を戻す。
2. 4 シナリオ詳細は、各 freeze 済み VA を崩さずに組む。
3. 新しい画面が必要なら、既存 5 画面のトーンを継承する。新パレットは作らない。

## 変更ルール

次は `HUMAN_REQUIRED`。

- Frozen 画面の色、型、写真、トーンの変更
- 見出しを Sans に戻す、アクセントを銅やパステルに戻す
- 新しい Visual Authority の追加や差し替え
- TOP の canonical copy を、復元以外の理由で変えること

次は `AUTO-CONTINUE`。

- 実装を VA に寄せる（現行の誤ったトークンを捨てる）
- コントラスト不足など、VA を崩さないアクセシビリティ修正
- この文書と VA の食い違いを、VA 側に合わせて直すこと
