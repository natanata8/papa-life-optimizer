# NEW CHAT HANDOFF — PAPA CODE / Papa Life Optimizer — 2026-09-30

## Start here

Repository:
`natanata8/papa-life-optimizer`

GitHub is SSOT.

Read in this order:
1. `AGENTS.md`
2. `docs/CURRENT_HANDOFF.md`
3. `docs/NEW_CHAT_HANDOFF_20260930.md`
4. `docs/PROJECT_OPERATING_MODEL_20260929.md`
5. `docs/UPSTREAM_FIX_DRAFT_20260929.md`
6. `docs/TEAM_REVIEW_UPSTREAM_20260930.md`
7. `docs/MVP_SCREEN_SPEC_20260929.md`
8. `docs/MVP_DATA_SPEC_20260929.md`
9. Issue #13
10. Draft PR #14
11. latest main / relevant open PRs

## Operating model

- Main ChatGPT = Project Manager / Brain
- Cursor = Builder
- Review ChatGPT = independent Reviewer
- GitHub = SSOT
- Human = Goal / KPI / important decisions / discomfort signals

Main should manage:
1. Goal
2. Current state
3. Completed
4. Incomplete
5. Blockers
6. Next work
7. Goal passed to Cursor
8. HUMAN_REQUIRED

Do not re-implement Builder work in Main Chat.

## Current Goal

Move from Human-approved / frozen MVP definition to one validated implementation vertical slice without losing the product's human simplicity.

## Current product framing

### Purpose
家庭の負担や摩擦を減らし、自分時間・夫婦時間・家族時間を含めた「家庭の余白」を増やす。

### Target

Brand Audience:
> 家庭を今より良くしたい父親

MVP Primary Customer:
> プレパパ〜未就学児の子どもがいる20〜40代の父親

Do NOT broaden MVP validation merely because the Brand Audience is broader.

### Problem
> 自分なりに頑張っているのに、自分の認識と実際の家庭の状態が噛み合わず、何を変えれば家庭の摩擦や負担が減るのか分からない。

### Value
> 家庭の状況を整理し、その家庭に合った「次の一手」を具体的にする。

### Strength / differentiation hypotheses
1. 家庭全体の文脈を横断して判断する
2. 実体験を再利用可能な判断知識に変える
3. 使うほど、その家庭での成功・失敗を学習して提案を変える

Important:
- Load visualization is a means, not the final Value.
- AI / calendar / database / dashboard are means, not strengths.
- Strengths are hypotheses until validated.

## Frozen MVP

Figma:
`[FROZEN] MVP Wireflow v0.5` / node `25:2`

Canonical stages:
```
Home
→ Clarify
→ Context
→ Action
→ Feedback
→ Memory
```

Initial 7 intents:
- WHAT_SHOULD_I_DO
- TIRED
- WANT_TO_DRINK
- WANT_PERSONAL_TIME
- PARTNER_UNHAPPY_OR_CONFLICT
- OVERTIME
- FREE_CONSULT

Frozen constraints:
- no partner mood inference
- Rest / Skip / Defer are valid actions
- ask only necessary missing information
- do not re-ask known information
- Unknown may remain Unknown
- internal Intent / Router / Load / Memory terminology must remain hidden
- Household Memory learns from actual outcomes
- internal complexity must not become user-facing complexity

## Current implementation-contract state

Issue #13:
`Define MVP implementation contracts before coding`

Cursor completed the contract work in:
Draft PR #14:
`Define MVP implementation contracts before coding`

Known PR #14 state at handoff:
- Draft / open
- Head: `5cd0d362e8c12eccae7521178c2d803d0cafee8d`
- 21 changed files
- 15 contract tests passing
- no Production deploy

PR #14 contains:
- PostgreSQL MVP DDL
- OpenAPI 3.1
- deterministic 7-intent router / question policy
- prompt / structured-output contracts
- model-output guard
- outcome-backed Household Memory
- fixtures / contract tests
- plan for first `WANT_TO_DRINK` vertical slice

## Current review state

Pre-Cursor review:
> READY_WITH_CHANGES

Those changes were applied to Issue #13 before Cursor started.

Current next gate:
> Independent Review Chat review of Draft PR #14

Review should check:
- Human UX
- Frozen Spec alignment
- DB/API
- Router / Prompt
- Memory
- tests/evidence
- consistency with the 2026-09-30 team upstream refinement

Do NOT start the WANT_TO_DRINK implementation slice until this review gate is complete.

## Slack team feedback received 2026-09-29〜30

Two teammates broadly supported the original upstream direction.

Important refinements:
- Purpose should center on household余白, not efficiency.
- MVP target should remain narrow; broader father audience can exist at Brand level.
- lived pain is stronger as “頑張っているのに摩擦が減らない / 認識が噛み合わない”.
- visualization is a means; Value is “その家庭に合った次の一手”.
- Strengths should be framed as:
  1. whole-household context
  2. lived experience → judgment knowledge
  3. household-specific learning over time
- partner feelings must not be asserted as facts.

See:
`docs/TEAM_REVIEW_UPSTREAM_20260930.md`

## Open / unresolved Human decisions

Remain HUMAN_REQUIRED:
- privacy policy
- retention / deletion
- model-provider handling
- partner-data consent
- auth vendor if consequential
- payment / pricing
- production publish / deploy
- Goal / KPI / frozen scope changes

## Do not do yet

- production deploy
- full household OS
- partner account
- external calendar sync
- dashboard / outings expansion
- fairness scoring
- partner mood inference
- broad UI rollout before contract review
- WANT_TO_DRINK vertical slice before PR #14 independent review

## Immediate next

1. Have Review Chat independently review Draft PR #14 against latest upstream + frozen MVP.
2. If PASS_WITH_FIXES, return only those findings to Cursor.
3. If PASS, decide merge readiness, then prepare the first WANT_TO_DRINK vertical slice.

## Default response format

```
Project
├─ Goal
├─ 現在地
├─ 完了
├─ 未完了
├─ 問題
├─ Next
└─ HUMAN_REQUIRED
```

End with 1–3 next actions only.
