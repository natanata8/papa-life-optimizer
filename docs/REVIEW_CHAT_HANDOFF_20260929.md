# PAPA CODE — Review Chat Handoff

Status: ACTIVE_REVIEW_HANDOFF  
Date: 2026-09-29  
Repository: `natanata8/papa-life-optimizer`

## 1. Review Chat role

This Review ChatGPT is an independent Reviewer.

It does NOT own implementation and should not become the Builder.

Primary review lenses:
- user perspective
- UX
- design
- specification alignment
- product-goal alignment
- omissions / hidden assumptions
- whether the result is actually good, not merely technically correct

Minor findings should be returned to Cursor.
Consequential findings that imply Goal / KPI / frozen scope / irreversible change should be marked HUMAN_REQUIRED.

## 2. Current project operating model

Canonical:
`docs/PROJECT_OPERATING_MODEL_20260929.md`

Roles:
- Main ChatGPT = Project Manager / Brain
- Cursor = Builder / implementation executor
- Review ChatGPT = independent Reviewer
- GitHub = SSOT
- Human = Goal / KPI / consequential decisions / discomfort signals

Default loop:
```
Main defines Goal
→ Cursor builds
→ Cursor records evidence in GitHub
→ Main summarizes
→ Review Chat independently reviews
→ minor issues return to Cursor
→ Human Gate only for consequential decisions
```

## 3. Product upstream definition

Canonical upstream draft / Human-authored definition:
`docs/UPSTREAM_FIX_DRAFT_20260929.md`

Current product direction:
- Target = プレパパ〜未就学児の子どもがいる20〜40代の父親
- Purpose = 仕事・育児・家事・自分時間を無理なく回し、気持ちよく一緒に暮らせる家庭を増やす
- Core problem = 家庭の負担や状況が見えにくく、「今、自分が何をすればいいか」が分からない
- Core value = 家庭負担を見えるようにし、その家庭に合った「今やること」「先回りしてやること」「問題が起きた時の対応」を具体的に提案
- Product stance = 家事・育児を増やすのではなく、家庭を回しながら自分時間・夫婦時間・家族時間も作る
- AI is the main interaction surface, but AI itself is not the product purpose

Important positioning:
> 入口はパパ、視野は家庭全体、成果は家族全体

## 4. MVP prioritization decisions

Initial MVP Core was prioritized around:
1. 気分・困りごと・やりたいこと選択
2. AI chat / clarification
3. Household Profile / personalization
4. household task/load data
5. household impact / context organization
6. next-action proposal
7. partner communication support
8. execution feedback
9. Household Memory

Post-MVP / lower-priority candidates:
- external calendar sync
- reminder engine
- monthly dashboard
- household余裕 visualization
- outing/local-data proposal
- partner account

Do not pull Post-MVP features into the MVP unless Human explicitly changes scope.

## 5. MVP Intent decisions

Initial seven MVP Intents are frozen:

- WHAT_SHOULD_I_DO
- TIRED
- WANT_TO_DRINK
- WANT_PERSONAL_TIME
- PARTNER_UNHAPPY_OR_CONFLICT
- OVERTIME
- FREE_CONSULT

Relevant docs:
- `docs/MVP_SCREEN_SPEC_20260929.md`
- `docs/MVP_DATA_SPEC_20260929.md`

## 6. Figma / wireflow history

Figma file:
`Papa Life Optimizer — Final Synthesis v1`

File key:
`qbTwjl2xa1EW5hLuhcCyXT`

URL:
https://www.figma.com/design/qbTwjl2xa1EW5hLuhcCyXT

Development path:
- Reference-led low-fi wireflow created
- Target-user copy pass performed
- Kansai dialect and over-written copy removed
- natural standard Japanese adopted
- spacing / readability pass performed
- 7 Intent Stress Test performed
- six common stages validated
- Human Gate approved
- wireflow frozen

Current authority:
> Figma `[FROZEN] MVP Wireflow v0.5` / node `25:2`

Current canonical stages:
```
Home
→ Clarify
→ Context
→ Action
→ Feedback
→ Memory
```

Important:
These are six common stages, not six rigid fixed screens.

## 7. Stress Test findings

7 Intent Stress Test showed the six-stage skeleton can remain common.

Largest variation:
- Stage 03 Context
- Stage 04 Action

Required additional states:
- Intent Router
- Situation Summary
- No-action / Rest
- Confidence / Unknown

Intent-specific examples:
- WHAT_SHOULD_I_DO → Context = priority organization
- TIRED → Context = household load + user capacity; Action may be Rest / Defer / Skip
- WANT_TO_DRINK → Context = household impact; Action = preparation + communication + recovery
- WANT_PERSONAL_TIME → Context = time opportunity + collision with household tasks
- PARTNER_UNHAPPY_OR_CONFLICT → Context = verified Situation Summary, not emotion inference
- OVERTIME → Context = shifted tasks / load
- FREE_CONSULT → Intent Router before Context

## 8. Frozen UX / product constraints

Do not change without Human Gate:
- six-stage MVP structure
- seven initial Intents
- no partner mood inference
- No-action / Rest as valid action
- minimal follow-up question policy
- Household Memory feedback loop

Core behavioral rules:
- known information should not be asked again
- only ask for missing information
- do not infer partner emotion or resentment
- do not decide who is right
- do not frame as permission from wife
- do not make father the villain
- do not make wife the villain
- do not default to “do more chores”
- Rest / Skip / Defer are valid
- Unknown must not be silently filled
- Household Memory should learn from actual outcomes, not only raw chat history

## 9. Tone / visual direction

Review must preserve:
- natural standard Japanese
- slightly conversational, not overly formal
- no forced Kansai dialect
- no strong mascot dependence
- subtle “trusted household-aware partner” feeling rather than “cute AI bot”
- no generic SaaS card-grid dashboard
- no generic long-chat-first UI
- no pastel parenting-app cliché
- no permission / guilt UI

Reference process:
Public Figma Community / UI examples were used only to extract transferable layout principles, not to copy visuals literally.

## 10. Current implementation state

Current status:
> MVP_WIREFLOW_FROZEN / IMPLEMENTATION_CONTRACTS_NEXT

Current Builder task:
GitHub Issue #13
`Define MVP implementation contracts before coding`

Goal of Issue #13:
Turn frozen wireflow + Screen/Data specs into implementation-ready contracts for:
- DB schema / persistence
- API boundaries
- Intent Router
- AI prompt / structured output
- Household Memory update / retrieval
- representative fixtures / contract tests

Technical implementation details are owned by Cursor after reading the repository.

No Production deploy is authorized.

## 11. Review Chat should read first

1. `AGENTS.md`
2. `docs/CURRENT_HANDOFF.md`
3. `docs/PROJECT_OPERATING_MODEL_20260929.md`
4. `docs/UPSTREAM_FIX_DRAFT_20260929.md`
5. `docs/MVP_SCREEN_SPEC_20260929.md`
6. `docs/MVP_DATA_SPEC_20260929.md`
7. `docs/design/DESIGN_CONTEXT.md`
8. Issue #9
9. Issue #13
10. latest main / relevant open PRs

## 12. Review output format

Use this structure:

```
Review
├─ 判定
├─ ユーザー目線
├─ UX
├─ デザイン
├─ 仕様整合
├─ 目的整合
├─ 見落とし
├─ Cursorへ戻す修正
└─ HUMAN_REQUIRED
```

Review should explicitly distinguish:
- BLOCKER
- IMPORTANT
- MINOR

Do not rewrite implementation yourself unless specifically asked.
Do not replace GitHub as SSOT.

## 13. Current known repository hygiene issues

Open PRs known at handoff time:
- PR #10 — older SITE / MVP requirements work
- PR #11 — pre-MTG business hypothesis
- PR #1 — old initial setup

These may contain stale assumptions.
Reviewer should not treat them as newer than:
- CURRENT_HANDOFF
- frozen Figma
- MVP Screen/Data specs
- explicit Human decisions

## 14. HUMAN_REQUIRED

Escalate only if review implies:
- Goal change
- KPI change
- frozen MVP scope change
- material product-direction change
- irreversible architecture commitment with product consequences
- privacy / legal / payment decision
- Production publish/deploy
