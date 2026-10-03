# PAPA CODE — Review Chat Handoff

Status: ACTIVE_REVIEW_HANDOFF  
Updated: 2026-09-30  
Repository: `natanata8/papa-life-optimizer`

## 1. Review Chat role

This Review ChatGPT is the independent Reviewer.

It does not implement Builder work.

Review lenses:
- Human/user perspective
- UX simplicity
- frozen MVP/spec alignment
- DB/API/router/prompt/memory contract quality
- product-goal alignment
- hidden assumptions / omissions
- whether the result is actually usable, not merely technically valid

Minor/important implementation findings return to Cursor.
Only consequential findings requiring Goal/KPI/frozen-scope/privacy/legal/payment/production decisions are HUMAN_REQUIRED.

## 2. Operating model

Canonical:
`docs/PROJECT_OPERATING_MODEL_20260929.md`

Roles:
- Main ChatGPT = Project Manager / Brain
- Cursor = Builder
- Review ChatGPT = independent Reviewer
- GitHub = SSOT
- Human = Goal / KPI / important decisions / discomfort signals

## 3. Current review target

GitHub Issue #13:
`Define MVP implementation contracts before coding`

Draft PR #14:
`Define MVP implementation contracts before coding`

Review exact submitted head:
`5cd0d362e8c12eccae7521178c2d803d0cafee8d`

Known state:
- Draft / open
- 21 changed files
- 15 local contract tests reported PASS
- no Production deploy
- no GitHub review submissions or review threads recorded at handoff

Important repository state:
- current `main` is `961331e2cb960fbfda4dc7ba0d563429cbdcd075`
- PR #14 is 2 commits ahead / 3 commits behind current main
- merge base is `a7b099b218e1461cfee5eecd22369e3b5b68ea30`
- review must therefore compare PR #14 against the latest main upstream documents, not only the older branch copy of `CURRENT_HANDOFF.md`

Do not start the WANT_TO_DRINK implementation slice before this review gate is complete.

## 4. Latest upstream framing

Read:
- `docs/UPSTREAM_FIX_DRAFT_20260929.md`
- `docs/TEAM_REVIEW_UPSTREAM_20260930.md`
- `docs/NEW_CHAT_HANDOFF_20260930.md`

Latest refinement to use as review context:

### Purpose
> 家庭の負担や摩擦を減らし、自分時間・夫婦時間・家族時間を含めた「家庭の余白」を増やす。

### Target

Brand Audience:
> 家庭を今より良くしたい父親

MVP Primary Customer:
> プレパパ〜未就学児の子どもがいる20〜40代の父親

Do not broaden MVP validation merely because Brand Audience is broader.

### Problem
> 自分なりに頑張っているのに、自分の認識と実際の家庭の状態が噛み合わず、何を変えれば家庭の摩擦や負担が減るのか分からない。

### Value
> 家庭の状況を整理し、その家庭に合った「次の一手」を具体的にする。

Load visualization is a means, not the final Value.

### Strength hypotheses
1. 家庭全体の文脈を横断して判断する
2. 実体験を再利用可能な判断知識に変える
3. 使うほど、その家庭での成功・失敗を学習して提案を変える

These are differentiation hypotheses, not validated moats.

## 5. Frozen MVP authority

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

These are six common stages, not six visually rigid screens.

Initial seven Intents:
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
- internal Intent / Router / Load / Memory terminology remains hidden
- Household Memory learns from actual outcomes
- internal complexity must not become user-facing complexity

Canonical specs:
- `docs/MVP_SCREEN_SPEC_20260929.md`
- `docs/MVP_DATA_SPEC_20260929.md`

## 6. PR #14 claims to verify independently

PR #14 says it contains:
- PostgreSQL 15+ MVP DDL
- OpenAPI 3.1 boundary
- deterministic seven-intent router / question policy
- prompt / structured-output contracts
- model-output guard
- outcome-backed Household Memory
- fixtures / contract tests
- first WANT_TO_DRINK vertical-slice plan

PR #14 also claims:
- no profile gate before useful value
- known data is not asked again
- missing data may remain Unknown
- internal schema terminology is hidden from user-visible output
- responses end in 1–5 concrete actions
- later consultation can reuse outcome-backed Memory and ask less

Do not accept these claims from the PR description alone; inspect the actual changed files/tests.

## 7. Required review questions

### Human UX
- Can a father get useful output without completing a large profile?
- Are questions limited to information that changes the current recommendation?
- Is known information actually not re-asked?
- Can Unknown remain Unknown without blocking useful action?
- Is the visible result short and action-first rather than an explanatory AI essay?
- Does Memory reduce repeated explanation in a later consultation?

### Upstream/product fit
- Does the implementation help produce the household-specific “next action”?
- Does it avoid turning load visualization into the product itself?
- Does it preserve the narrow MVP ICP?
- Does it avoid generic chore tracker / generic AI chat drift?
- Does it avoid treating AI/calendar/database/dashboard as product strengths?

### Safety / relationship boundary
- No partner emotion is inferred as fact.
- No fairness / who-is-right scoring.
- No permission-from-wife framing.
- Partner-reported statements remain user-reported data.

### Contract integrity
- Screen/Data specs and machine contracts agree.
- Router behavior covers all seven frozen Intents.
- Context mode varies correctly by Intent.
- Rest / Skip / Defer remain first-class actions.
- Memory requires actual outcome evidence where required.
- API/schema/policy/test fixtures do not contradict one another.
- reversible Builder choices are not accidentally promoted to frozen product decisions.

### Repository integration
- Identify any conflict caused by PR #14 being behind current main.
- In particular, do not allow the PR's older `docs/CURRENT_HANDOFF.md` copy to overwrite the newer 2026-09-30 canonical handoff/refinement state on merge.

## 8. Expected verdict

Use one:
- READY
- READY_WITH_CHANGES
- NOT_READY

Classify findings:
- BLOCKER
- IMPORTANT
- MINOR

Output:
```
Review
├─ 判定
├─ ユーザー目線
├─ UX
├─ 仕様整合
├─ 目的整合
├─ DB/API
├─ Router / Prompt
├─ Memory
├─ Tests / Evidence
├─ Repository integration
├─ Cursorへ戻す修正
└─ HUMAN_REQUIRED
```

Do not implement fixes yourself.

## 9. Review Chat read order

1. `AGENTS.md`
2. `docs/CURRENT_HANDOFF.md` from latest main
3. `docs/NEW_CHAT_HANDOFF_20260930.md`
4. `docs/PROJECT_OPERATING_MODEL_20260929.md`
5. `docs/UPSTREAM_FIX_DRAFT_20260929.md`
6. `docs/TEAM_REVIEW_UPSTREAM_20260930.md`
7. `docs/MVP_SCREEN_SPEC_20260929.md`
8. `docs/MVP_DATA_SPEC_20260929.md`
9. Issue #13
10. Draft PR #14 at head `5cd0d362e8c12eccae7521178c2d803d0cafee8d`
11. `docs/MVP_IMPLEMENTATION_CONTRACTS_20260929.md` from PR #14
12. actual PR #14 contract files/tests
13. latest main / relevant open PRs

## 10. Stale open work

Open older work includes:
- PR #1 — old initial setup
- PR #10 — older SITE / MVP requirements
- PR #11 — pre-MTG business hypothesis

Do not treat those as newer authority than current main, frozen Figma, latest Screen/Data specs, or explicit Human decisions.

## 11. HUMAN_REQUIRED

Escalate only if the review requires:
- Goal / KPI change
- frozen six-stage or seven-Intent change
- material product-direction change
- consequential irreversible architecture choice
- privacy / legal / payment decision
- production publish / deploy
