# PAPA CODE — Team Review / Upstream Refinement 2026-09-30

Status: HUMAN_DISCUSSION / REFINEMENT_CANDIDATE  
Source: Slack #01-構想-原体験, 2026-09-29〜2026-09-30

## Purpose of this note

Record the team feedback received after the 2026-09-29 upstream FIX draft without silently replacing the Human-authored canonical draft.

Canonical original:
`docs/UPSTREAM_FIX_DRAFT_20260929.md`

This document is a refinement candidate for the next Human review.

## Team feedback summary

### 1. Purpose

Team consensus is broadly aligned with the original direction.

The product is not primarily about household-task efficiency.
The higher-level purpose is to increase household margin /余白, including:

- father's own time
- couple time
- family time
- time for both partners to rest

Refinement candidate:

> 家庭の負担や摩擦を減らし、自分時間・夫婦時間・家族時間を含めた「家庭の余白」を増やす。

This is the Purpose, not the immediate product Value.

### 2. Customer / Target

Do not broaden the MVP customer.

Recommended two-layer framing:

#### Brand Audience
> 家庭を今より良くしたい父親

#### Primary Customer / MVP ICP
> プレパパ〜未就学児の子どもがいる20〜40代の父親

More specifically:
- works while participating in housework / childcare
- feels he is already doing a meaningful amount
- still experiences friction / mismatch at home
- wants the household to work better
- also wants personal time without one-sided sacrifice

Reason for the broader Brand Audience:
- defines the long-term brand boundary
- allows future expansion to older children / different household stages

Reason NOT to broaden the MVP ICP:
- pain becomes vague
- messaging weakens
- validation becomes noisy
- required feature surface expands

Principle:
> ブランドは広く、MVP Customerは狭く。

### 3. Problem

Team feedback suggests the prior wording:
> 「今、自分が何をすればいいか」が分からない

is true but not the strongest lived pain.

Refinement candidate:

> 自分なりに頑張っているのに、自分の認識と実際の家庭の状態が噛み合わず、何を変えれば家庭の摩擦や負担が減るのか分からない。

Important:
The problem is NOT simply “the father is not doing enough.”

Problem chain:

```
家庭の状態を自分だけでは正しく整理しにくい
→ 何が問題か分からない
→ 何を変えるべきか分からない
→ 今まで通りやる / 問題後に対応
→ また摩擦が起こる
```

### 4. Value

“負担を可視化する” is a means, not the final Value.

Recommended Value:

> 家庭の状況を整理し、その家庭に合った「次の一手」を具体的にする。

Value flow:

```
状況理解
→ 見えていない部分の整理
→ 選択肢・判断材料の提示
→ 具体的な次の一手
→ 実行結果の蓄積
→ 次回提案へ反映
```

Purpose and Value should remain distinct:

```
Purpose
家庭の余白を増やす

Value
その家庭に合った「次の一手」が分かるようにする
```

### 5. Strength / Differentiation

Do not define features such as AI chat, calendar, dashboard, or database themselves as strengths.
They are implementation means.

Current differentiation hypothesis can be organized into three strengths.

#### Strength 1 — 家庭全体の文脈で判断する

Cross-reference:
- housework / childcare
- child age / characteristics
- father's work / fatigue / schedule
- partner / family schedule where explicitly known
- personal time
- previous outcomes

Then determine:
> この家庭なら、今これをやるのがよさそう

This goes beyond task tracking.

#### Strength 2 — 実体験を再利用可能な判断知識に変える

The founding members' lived experience is not automatically a moat.

Potential strength exists only if transformed:

```
実体験
→ 成功 / 失敗
→ パターン / 仮説
→ 判断基準
→ 実ユーザーで検証
→ 改善
```

Treat this as a differentiation hypothesis, not yet a validated competitive advantage.

#### Strength 3 — 使うほど「その家庭専用」になる

Household Memory should create a user-visible benefit:

- less repeated explanation
- remembers what worked
- avoids repeating failed suggestions
- changes recommendations based on actual prior results

The strength is not “AI has memory.”
The strength is:

> 一般論ではなく、その家庭で実際にうまくいった / いかなかった結果を蓄積し、次回の提案を変えられる。

Again, this is currently a differentiation hypothesis to validate.

### 6. Empathy / partner inference boundary

Team feedback supported showing alternative perspectives, but the existing frozen constraint remains:

> Partner mood / emotion must not be inferred as fact.

Allowed:
- “こういう運用上の可能性もある”
- “ここが見えていない可能性がある”
- “この負担が移っている可能性がある”

Not allowed:
- “妻は怒っている”
- “妻はこう感じているはず”
- deciding who is right

The system may organize operational possibilities and missing context without diagnosing emotion.

## Recommended upstream summary

```
Purpose
家庭の負担や摩擦を減らし、
自分時間・夫婦時間・家族時間を含めた「家庭の余白」を増やす。

Customer
MVP:
プレパパ〜未就学児の子どもがいる20〜40代の父親。

Brand Audience:
家庭を今より良くしたい父親。

Problem
自分なりに頑張っているのに、
自分の認識と実際の家庭の状態が噛み合わず、
何を変えれば家庭の摩擦や負担が減るのか分からない。

Value
家庭の状況を整理し、
その家庭に合った「次の一手」を具体的にする。

Strength
1. 家庭全体の文脈を横断して判断する
2. 実体験を再利用できる判断知識に変える
3. 使うほど、その家庭での成功・失敗を学習して提案を変える
```

## Relationship to frozen MVP

This refinement does NOT automatically change:
- frozen six-stage wireflow
- seven MVP intents
- Screen Spec / Data Spec
- no partner mood inference
- Rest / Skip / Defer
- Household Memory loop

Before merging PR #14 or starting the first vertical slice, Review Chat should verify whether any implementation contract materially conflicts with this refined upstream framing.
