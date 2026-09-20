# DECISIONS

新しい方針は、Slack ではなくこのファイルと Issue / PR に残す。
日付は作業日。撤回する場合は打ち消し線ではなく、新しい Decision で上書きする。

## D-001 正本は GitHub latest main / docs / Issues / PRs

日付: 2026-09-19
状態: 採用

Slack は依頼と進捗の場所であり、仕様の正本ではない。
矛盾時は latest `main` を優先する。
見た目の既存案は正本ではない。拘束するのは UX / ブランド原則である（D-015）。

## D-002 main 直 push 禁止、branch と PR で進める

日付: 2026-09-19
状態: 採用

初期セットアップも `main` には直接載せない。

## D-003 Production deploy 禁止

日付: 2026-09-19
状態: 採用

ローカル起動とプレビュー確認まで。公開本番は `HUMAN_REQUIRED`。

## D-004 技術構成は Next.js + TypeScript + Tailwind CSS

日付: 2026-09-19
状態: 採用

初期実装は App Router、TypeScript、Tailwind CSS v4。
スタック変更は `HUMAN_REQUIRED`。

## D-005 初期 MVP は 4 シナリオに限定する

日付: 2026-09-19
状態: 採用

対象は「飲みに行きたい」「ゲームしたい」「ソファでゴロゴロしたい」「休日は朝寝坊したい」のみ。
追加は `HUMAN_REQUIRED`。

## D-006 Frozen UX / Visual Authority は未承認

日付: 2026-09-19
状態: 撤回（D-011 で上書き）

初期セットアップ時の誤り。銅アクセント草案を正本候補にしてしまった。

## D-007 HUMAN_REQUIRED 以外は AUTO-CONTINUE

日付: 2026-09-19
状態: 採用

方針・原則の緩和・本番・一次調査の確定以外は、仮定を書いて進める。
見た目の仮説変更は `AUTO-CONTINUE`。

## D-008 エージェントは作業前に 5 文書を読む

日付: 2026-09-19
状態: 採用

必読は `CURRENT_HANDOFF` / `PRODUCT_VISION` / `MVP_SCOPE` / `DESIGN_SYSTEM` / `DECISIONS`。
`AGENTS.md` に固定する。

## D-009 今回の実装範囲は起動と TOP 骨格まで

日付: 2026-09-19
状態: 採用（一部更新）

シナリオ詳細、保存、認証、課金は入れない。
詳細画面の見た目は仮説でよい。原則だけ守る。

## D-010 調査と収益の docs は二次情報の草案とする

日付: 2026-09-19
状態: 採用（D-013 で収益候補を補足）

一次調査前に仕様へ昇格しない。

## D-011 Visual Authority は承認済み。銅ドラフトは正本ではない

日付: 2026-09-19
状態: 撤回（D-015 で上書き）

既存 Visual を freeze 正本にしてしまった。デザイン仮説に戻す。

## D-012 将来拡張は FAMILY / PARTNER / SELF。MVP は広げない

日付: 2026-09-19
状態: 採用

初期 MVP は「自分時間 × 家庭運営」の現行 4 シナリオのみ。
将来の検証枠として FAMILY / PARTNER / SELF（自己改善を含む）を残す。
今は画面もシナリオも増やさない。

## D-013 収益の将来候補は残し、今は実装しない

日付: 2026-09-19
状態: 採用

将来候補: affiliate / SNS・メディア / B2B 福利厚生 / タイアップ。
価格も実装も今はしない。候補を消して個人課金だけにもしない。

## D-014 Visual Authority の GitHub 正本は docs/visual-authority/

日付: 2026-09-20
状態: 撤回（D-015 で上書き）

`docs/visual-authority/` を実装拘束の正本にしてしまった。historical reference / current hypothesis に戻す。

## D-015 既存 Visual はデザイン仮説。原則だけ拘束する

日付: 2026-09-20
状態: 採用（D-011 / D-014 を上書き）

TOP / DRINK / SOFA / SLEEP_IN / GAME の既存 Visual は freeze 済み正本ではない。
warm off-white / olive / セリフ + Sans / 白カード / lifestyle photography も変更可能。
`docs/visual-authority/` は残すが、実装を拘束しない。

維持する原則:

- 父親を責めない
- パートナーを敵にしない
- 自分時間を悪にしない
- SaaS ダッシュボード化しない
- 過度なゲーミフィケーションをしない

原則を緩めることだけ `HUMAN_REQUIRED`。見た目の仮説変更は `AUTO-CONTINUE`。
