# DECISIONS

新しい方針は、Slack ではなくこのファイルと Issue / PR に残す。
日付は作業日。撤回する場合は打ち消し線ではなく、新しい Decision で上書きする。

## D-001 正本は GitHub latest main / docs / Issues / PRs

日付: 2026-09-19
状態: 採用

Slack は依頼と進捗の場所であり、仕様の正本ではない。
矛盾時は latest `main` を優先する。

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
状態: 採用

`docs/DESIGN_SYSTEM.md` と TOP 骨格は草案。凍結宣言も大幅な見た目変更もしない。
承認は `HUMAN_REQUIRED`。

## D-007 HUMAN_REQUIRED 以外は AUTO-CONTINUE

日付: 2026-09-19
状態: 採用

方針・凍結・本番・一次調査の確定以外は、仮定を書いて進める。

## D-008 エージェントは作業前に 5 文書を読む

日付: 2026-09-19
状態: 採用

必読は `CURRENT_HANDOFF` / `PRODUCT_VISION` / `MVP_SCOPE` / `DESIGN_SYSTEM` / `DECISIONS`。
`AGENTS.md` に固定する。

## D-009 今回の実装範囲は起動と TOP 骨格まで

日付: 2026-09-19
状態: 採用

シナリオ詳細、保存、認証、課金は入れない。
詳細画面は Visual Authority 承認後。

## D-010 調査と収益の docs は二次情報の草案とする

日付: 2026-09-19
状態: 採用

一次調査前に仕様へ昇格しない。Slack の他チャンネルは未読のため、そこの方針は未反映。
