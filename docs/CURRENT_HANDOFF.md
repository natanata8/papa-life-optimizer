# CURRENT_HANDOFF

最終更新: 2026-09-19
正本: GitHub latest `main` / `docs/` / Issues / PRs
状態: 初期セットアップの基盤は入った。Visual Authority は承認済み。現行実装の見た目は正本ではない。

## いまどこまでできたか

- リポジトリは Next.js + TypeScript + Tailwind CSS で起動できる。
- TOP に初期 MVP の 4 シナリオ骨格を置いた。これは仮実装であり、Visual Authority ではない。
- 運用ドキュメントを新設した。Visual 正本、FAMILY / PARTNER / SELF、将来の収益候補を同期済み。
- Production deploy はしていない。する予定もない。

## Visual Authority

承認済み。現行 CSS の銅アクセントと Sans のみは誤り。

| 画面 | 状態 |
| --- | --- |
| TOP | Visual approved。canonical copy は復元前提 |
| 朝寝坊 / 飲み会 / ソファ / ゲーム | Visual Authority approved / frozen |

システムは warm off-white、olive accent、日本語セリフ見出し、Sans 本文、白カード、少量の生活写真。
育児アプリのパステル、ゲーミフィケーション、SaaS ダッシュボードは使わない。

## 次にやるべきこと

1. 実装を Visual Authority に寄せる。TOP は承認済み Visual に合わせ、canonical copy を戻す。
2. 4 シナリオ詳細は、freeze 済み VA を崩さずに組む。シナリオは増やさない。
3. 一次ユーザー調査の対象と質問を決める。二次調査だけでは仕様を確定しない。
4. FAMILY / PARTNER / SELF と affiliate / SNS / B2B / タイアップは、候補として残し、今は実装しない。

## 触ってよい範囲

- 起動不能、型エラー、テスト不足、ドキュメントの事実誤認の修正。
- 現行の誤った見た目を、承認済み Visual Authority へ寄せること。
- 4 シナリオのデータ表現を保ったままの内部整理。
- Issue / PR 上で合意済みの小さな改善。

## 触ってはいけない範囲

- Freeze 済み VA（朝寝坊 / 飲み会 / ソファ / ゲーム）の色・型・写真・トーン変更。
- TOP の Visual approved を、仮実装や新案で上書きすること。
- MVP シナリオの追加や差し替え。
- 認証、課金、affiliate、SNS 投稿機能、B2B 画面、本番デプロイ。
- `main` 直 push。

## ブロッカー

なし。アプリはローカルで起動できる。
Visual Authority の実画面ファイルは、このリポジトリ外の確定物を正とする。実装前にそれを見てから組む。

## HUMAN_REQUIRED

- TOP の canonical copy 復元（文言の確定）。
- 一次ユーザー調査の実施可否と対象。
- 収益モデルと価格の確定。将来候補の採用判断。
- Production deploy の解禁。現時点では禁止のまま。
- Freeze 済み Visual Authority を変える必要が出たとき。
