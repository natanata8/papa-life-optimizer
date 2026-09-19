# CURRENT_HANDOFF

最終更新: 2026-09-19
正本: GitHub latest `main` / `docs/` / Issues / PRs
状態: 初期セットアップ完了。TOP 骨格まで実装済み。Frozen UX 未承認。

## いまどこまでできたか

- リポジトリは Next.js + TypeScript + Tailwind CSS で起動できる。
- TOP に初期 MVP の 4 シナリオ骨格を置いた。
  - 飲みに行きたい
  - ゲームしたい
  - ソファでゴロゴロしたい
  - 休日は朝寝坊したい
- 運用ドキュメントを新設した。エージェントは作業前にこのファイルと Vision / Scope / Design / Decisions を読む。
- Production deploy はしていない。する予定もない。

## 次にやるべきこと

1. 人が TOP 骨格と `docs/DESIGN_SYSTEM.md` を見て、Visual Authority にするか判断する。
2. 4 シナリオの詳細フロー（事前準備、パートナー調整、実行、復帰）を Issue 化する。
3. 一次ユーザー調査の対象と質問を決める。二次調査だけでは仕様を確定しない。
4. シナリオ詳細画面は、Visual Authority 承認後に最小実装する。

## 触ってよい範囲

- 起動不能、型エラー、テスト不足、ドキュメントの事実誤認の修正。
- 4 シナリオのデータ表現を保ったままの内部整理。
- Issue / PR 上で合意済みの小さな改善。

## 触ってはいけない範囲

- Frozen UX / Visual Authority として見える大幅な見た目変更。
- MVP シナリオの追加や差し替え。
- 認証、課金、本番デプロイ、外部 API 本接続。
- `main` 直 push。

## ブロッカー

なし。アプリはローカルで起動できる。

## HUMAN_REQUIRED

- TOP 骨格と Design System 草案を Visual Authority として承認するか。
- 一次ユーザー調査の実施可否と対象。
- 収益モデルと価格の確定。Slack の事業方針 / 収益化チャンネルは、この初期セットアップ時点では bot が読めなかった。
- Production deploy の解禁。現時点では禁止のまま。
