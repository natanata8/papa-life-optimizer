<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# papa-life-optimizer Agent Rules

育児中の父親が、家庭を止めずに自分の時間を取るための Web サービス。
エージェントはコードを書く前に、必ずこのファイルと正本ドキュメントを読む。

## 作業前に必ず読む

コード変更、ドキュメント更新、調査、レビューの前に、次をこの順で読む。

1. `docs/CURRENT_HANDOFF.md`
2. `docs/PRODUCT_VISION.md`
3. `docs/MVP_SCOPE.md`
4. `docs/DESIGN_SYSTEM.md`
5. `docs/DECISIONS.md`

追加で必要なときだけ読む。

- ユーザー仮説: `docs/USER_RESEARCH.md`
- 市場・競合: `docs/MARKET_RESEARCH.md`
- 収益仮説: `docs/MONETIZATION.md`
- 起動手順: `README.md`

読んでいない状態で実装や方針変更を始めない。

## 正本

以下だけを正本とする。Slack の会話、ローカルメモ、エージェントの推測は正本ではない。

1. GitHub の latest `main`
2. `docs/` 配下のドキュメント
3. GitHub Issues
4. GitHub Pull Requests

矛盾がある場合の優先順位は `main` > マージ済み docs > オープン Issue / PR の合意、とする。
Slack は作業依頼と進捗の場所であり、仕様の正本ではない。Slack の内容を仕様にするときは Issue か docs に落としてから進める。

## 運用ルール

- `main` への直接 push は禁止。必ず branch を切り、PR で進める。
- Production deploy は禁止。プレビューやローカル確認までに留める。
- Frozen UX / Visual Authority を勝手に変更しない。変更が必要なら `HUMAN_REQUIRED` にする。
- `HUMAN_REQUIRED` 以外は `AUTO-CONTINUE`。判断できる実装・文書化・テスト・PR 作成は止めずに進める。
- 技術構成は Next.js + TypeScript + Tailwind CSS。スタック変更は `HUMAN_REQUIRED`。
- 初期 MVP の対象シナリオは次の 4 つのみ。勝手に増やさない。
  - 飲みに行きたい
  - ゲームしたい
  - ソファでゴロゴロしたい
  - 休日は朝寝坊したい

## HUMAN_REQUIRED / AUTO-CONTINUE

`HUMAN_REQUIRED` にするもの:

- Freeze 済み Visual Authority の変更、差し替え、または新しい凍結宣言
- プロダクト方針、MVP 範囲、収益化、価格の確定
- Production deploy
- `main` 直 push、force push、本番秘密情報の追加
- 一次ユーザー調査の実施方針や、調査結果を仕様として確定すること
- 法務・プライバシー・課金の最終判断

それ以外は `AUTO-CONTINUE`。不明点は仮定を `docs/DECISIONS.md` か PR に書き、作業を止めない。仮定がプロダクト方針に触れる場合だけ `HUMAN_REQUIRED` として残す。

## Frozen UX / Visual Authority

- Visual Authority は承認済み。正本は TOP / drink / sofa / sleep-in / game の既存画面である。
- 朝寝坊 / 飲み会 / ソファ / ゲームは approved / frozen。TOP は Visual approved、canonical copy は復元前提。
- システムは warm off-white、olive accent、日本語セリフ見出し、Sans 本文、白カード、少量の生活写真。
- 銅アクセント、Noto Sans JP のみ、育児アプリのパステル、ゲーミフィケーション、SaaS ダッシュボードは正本ではない。
- 現行 `src/` の見た目は仮実装。VA に寄せるのは可。Freeze 済み画面を新案で上書きするのは `HUMAN_REQUIRED`。
- 色、型、写真、トーンを変える必要があれば、理由を PR に書き、`HUMAN_REQUIRED` を残す。

## Git

- ブランチ名は作業内容が分かるものにする。
- コミットは日本語または英語で、何をなぜ変えたかが分かること。
- PR 本文には目的、変更点、確認方法、`HUMAN_REQUIRED` を書く。
- レビュー前に `npm test` と `npm run lint` と `npm run build` を通す。

## 完了報告

作業完了時は次を報告する。

- changed files
- tests
- branch
- commit
- PR
- blockers
- HUMAN_REQUIRED
