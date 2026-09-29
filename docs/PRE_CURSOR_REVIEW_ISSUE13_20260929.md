# PAPA CODE — Pre-Cursor Review Packet for Issue #13

Status: READY_FOR_INDEPENDENT_REVIEW  
Date: 2026-09-29  
Repository: `natanata8/papa-life-optimizer`

## Review purpose

Before Cursor starts Issue #13, independently review whether the current project direction and the proposed next task are correct.

This is NOT an implementation review.

The Reviewer should answer:

1. Is the current upstream definition coherent for the stated target user?
2. Is the frozen MVP wireflow a reasonable basis for implementation?
3. Is the MVP scope still focused enough?
4. Is Issue #13 the right next task?
5. Is anything important missing before Cursor starts implementation-contract work?
6. Is anything currently included that should be removed or deferred?
7. Are there contradictions between the latest canonical docs and older repository artifacts?

## Read first

1. `AGENTS.md`
2. `docs/CURRENT_HANDOFF.md`
3. `docs/REVIEW_CHAT_HANDOFF_20260929.md`
4. `docs/PROJECT_OPERATING_MODEL_20260929.md`
5. `docs/UPSTREAM_FIX_DRAFT_20260929.md`
6. `docs/MVP_SCREEN_SPEC_20260929.md`
7. `docs/MVP_DATA_SPEC_20260929.md`
8. Issue #9
9. Issue #13
10. relevant open PRs (#1, #10, #11)
11. Figma `[FROZEN] MVP Wireflow v0.5` / node `25:2`

## Current product definition to review

### Target
プレパパ〜未就学児の子どもがいる20〜40代の父親。

### Purpose
仕事・育児・家事・自分時間を無理なく回し、気持ちよく一緒に暮らせる家庭を増やす。

### Core problem
家庭の負担や状況が見えにくく、「今、自分が何をすればいいか」が分からない。

### Core value
家庭の負担を見えるようにし、その家庭に合った:
- 今やること
- 先回りしてやること
- 問題が起きた時の対応

を具体的に提案する。

### Product stance
- father is the entry point
- household-wide view
- family-wide outcome
- do not default to “do more chores”
- preserve self-time / couple-time / family-time
- AI is the interaction surface, not the product purpose

## Current frozen MVP structure

```
Home
→ Clarify
→ Context
→ Action
→ Feedback
→ Memory
```

These are common stages, not rigid fixed screens.

Initial 7 MVP Intents:
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
- minimal follow-up questions
- unknown must not be silently inferred
- Household Memory learns from actual outcomes
- no external calendar integration in MVP
- no full household OS expansion

## Current proposed next task — Issue #13

Issue #13 proposes that Cursor define implementation-ready contracts for:

- DB schema / persistence
- API boundaries and request/response contracts
- 7 Intent Router contract
- AI prompt / structured output contract
- Household Memory update / retrieval contract
- representative fixtures / contract tests
- first vertical-slice implementation plan

Cursor is allowed to decide technical implementation details after reading the repository.

Cursor is NOT allowed to:
- change frozen stages
- change frozen Intent scope
- add partner mood/fairness scoring
- expand to Post-MVP features
- publish/deploy production
- rewrite product strategy to fit implementation

## Specific review questions

### A. Product coherence
- Does Purpose → Customer → Problem → Value → Solution connect cleanly?
- Does the MVP solve a meaningful father-specific problem?
- Is “father-first” useful without becoming wife-management?
- Is “Household Memory” a real differentiator or overbuilt too early?

### B. MVP scope
- Are 7 Intents too broad for first MVP?
- Should any Intent be removed from first build?
- Is the six-stage model too abstract or appropriately flexible?
- Are calendar/dashboard/outings correctly deferred?

### C. UX / user reality
- Would a tired working father actually use this flow?
- Are the Clarify questions likely to become too much work?
- Does Context create useful insight or simply explain obvious household tasks?
- Does Action feel practical rather than moralizing?
- Does Feedback feel lightweight enough?
- Is Memory valuable enough to motivate second use?

### D. Implementation readiness
- Are Screen Spec and Data Spec sufficient to begin implementation contracts?
- Is Issue #13 sequenced correctly before UI implementation?
- Are DB/API/Router/Prompt/Memory contracts too much to define in one task?
- Should Issue #13 be split before Cursor begins?

### E. Repository consistency
- Identify stale assumptions in PR #1 / #10 / #11 or older docs.
- Identify contradictions with latest Human-approved state.
- Do not treat older open PRs as more authoritative than current canonical docs.

## Required review outcome

The Reviewer must give one of:

- READY — Issue #13 can go to Cursor as written
- READY_WITH_CHANGES — Cursor can start after specified small edits to Issue #13
- NOT_READY — a product/spec issue must be resolved first

Do not give a vague “looks good”.

## Review format

```
Review
├─ 判定
├─ Product coherence
├─ MVP scope
├─ User / UX
├─ Implementation readiness
├─ Repository consistency
├─ Issue #13 修正案
├─ Cursorへ渡してよい条件
└─ HUMAN_REQUIRED
```

Classify findings as:
- BLOCKER
- IMPORTANT
- MINOR

## HUMAN_REQUIRED

Escalate only if review implies:
- Goal change
- KPI change
- frozen MVP scope change
- major product-direction change
- irreversible architecture commitment with product consequences
- privacy / legal / payment
- production publish/deploy
