# CURRENT_HANDOFF

最終更新: 2026-09-20
正本: GitHub latest `main` / `docs/` / Issues / PRs
状態: 初期セットアップの基盤は入った。既存 Visual は freeze 正本ではなく、現時点のデザイン仮説。

## いまどこまでできたか

- リポジトリは Next.js + TypeScript + Tailwind CSS で起動できる。
- TOP に初期 MVP の 4 シナリオ骨格を置いた。見た目は仮実装のまま。
- TOP の一文は initial `main` の確定文に戻した。新しいキャッチは足していない。
- `docs/visual-authority/` は historical reference / current hypothesis として残している。実装を拘束しない。
- Production deploy はしていない。する予定もない。

## Visual の扱い

TOP / DRINK / SOFA / SLEEP_IN / GAME の既存 Visual は、現時点のデザイン仮説である。
warm off-white / olive / セリフ + Sans / 白カード / lifestyle photography も変更可能。

拘束するのは原則だけ。

- 父親を責めない
- パートナーを敵にしない
- 自分時間を悪にしない
- SaaS ダッシュボード化しない
- 過度なゲーミフィケーションをしない

## 次にやるべきこと

1. 4 シナリオの詳細フローを、原則を守って試作する。見た目は仮説のまま変えてよい。
2. 一次ユーザー調査の対象と質問を決める。
3. FAMILY / PARTNER / SELF と affiliate / SNS / B2B / タイアップは、候補として残し、今は実装しない。

## 触ってよい範囲

- 起動不能、型エラー、テスト不足、ドキュメントの事実誤認の修正。
- デザイン仮説の更新。色、型、写真、フォントを含む。
- 4 シナリオのデータ表現を保ったままの内部整理。
- Issue / PR 上で合意済みの小さな改善。

## 触ってはいけない範囲

- UX / ブランド原則を破る見た目やコピー。
- MVP シナリオの追加や差し替え。
- 認証、課金、affiliate、SNS 投稿機能、B2B 画面、本番デプロイ。
- `main` 直 push。

## ブロッカー

なし。アプリはローカルで起動できる。

## HUMAN_REQUIRED

- UX / ブランド原則を緩める判断。
- 一次ユーザー調査の実施可否と対象。
- 収益モデルと価格の確定。将来候補の採用判断。
- Production deploy の解禁。現時点では禁止のまま。
