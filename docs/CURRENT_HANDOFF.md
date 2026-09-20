# CURRENT_HANDOFF

最終更新: 2026-09-20
正本: GitHub latest `main` / `docs/` / Issues / PRs
状態: 初期セットアップの基盤は入った。Visual Authority の GitHub 参照枠は用意済み。画像は未着。仮 Visual はまだ寄せていない。

## いまどこまでできたか

- リポジトリは Next.js + TypeScript + Tailwind CSS で起動できる。
- TOP に初期 MVP の 4 シナリオ骨格を置いた。見た目は仮実装のまま。
- TOP canonical copy は initial `main` の確定文に戻した。新しいキャッチは足していない。
- 見た目の正本参照は [`docs/visual-authority/`](visual-authority/README.md) に統一した。
- Production deploy はしていない。する予定もない。

## Visual Authority

正本は GitHub の `docs/visual-authority/`。Slack や現行 CSS は正本ではない。

| ID | 状態 | 画像 |
| --- | --- | --- |
| TOP | Visual approved。copy 復元済み | 未着 `HUMAN_REQUIRED` |
| DRINK / SOFA / SLEEP_IN / GAME | approved / frozen | 未着 `HUMAN_REQUIRED` |

システムは warm off-white、olive accent、日本語セリフ見出し、Sans 本文、白カード、少量の生活写真。
育児アプリのパステル、ゲーミフィケーション、SaaS ダッシュボードは使わない。
代替画像は作らない。仮 Visual を freeze 済み VA へ寄せる実装は、今は行わない。

## 次にやるべきこと

1. freeze 済み VA 画像を `docs/visual-authority/` の各画面ディレクトリへ入れる。`HUMAN_REQUIRED`。
2. 画像が入ってから、現行 TOP の仮 Visual を VA へ寄せる。今はその実装をしない。
3. 4 シナリオ詳細は、freeze 済み VA を崩さずに組む。シナリオは増やさない。
4. 一次ユーザー調査の対象と質問を決める。
5. FAMILY / PARTNER / SELF と affiliate / SNS / B2B / タイアップは、候補として残し、今は実装しない。

## 触ってよい範囲

- 起動不能、型エラー、テスト不足、ドキュメントの事実誤認の修正。
- 4 シナリオのデータ表現を保ったままの内部整理。
- Issue / PR 上で合意済みの小さな改善。

## 触ってはいけない範囲

- Freeze 済み VA（朝寝坊 / 飲み会 / ソファ / ゲーム）の色・型・写真・トーン変更。
- 代替画像の生成。
- 画像未着のまま、仮 Visual を VA へ寄せる実装。
- TOP への新しいキャッチコピー追加。
- MVP シナリオの追加や差し替え。
- 認証、課金、affiliate、SNS 投稿機能、B2B 画面、本番デプロイ。
- `main` 直 push。

## ブロッカー

なし。アプリはローカルで起動できる。
VA 画像がリポジトリに無いので、見た目の実装寄せは止めている。

## HUMAN_REQUIRED

- `docs/visual-authority/` への freeze 済み画像追加（TOP / DRINK / SOFA / SLEEP_IN / GAME）
- 一次ユーザー調査の実施可否と対象。
- 収益モデルと価格の確定。将来候補の採用判断。
- Production deploy の解禁。現時点では禁止のまま。
- Freeze 済み Visual Authority を変える必要が出たとき。
