# CURRENT_HANDOFF — Papa Life Optimizer

## Latest Main Chat handoff — 2026-09-30

Canonical restart document:
`docs/NEW_CHAT_HANDOFF_20260930.md`

Latest team upstream review:
`docs/TEAM_REVIEW_UPSTREAM_20260930.md`

Current execution gate:
> Draft PR #14 independent Review Chat review before first WANT_TO_DRINK vertical slice.

Issue #17 reconciliation and independent review packet:
`docs/ISSUE17_PR14_REVIEW_DELTA_20261003.md`

Current review verdict:
> READY_WITH_CHANGES — return the bounded contract findings to Cursor before any new vertical slice.

Follow-up at PR #14 head `aa8f26877cf2f2572026b89c3336f22106a5e6ed` confirmed four remaining contract edge cases; use the packet's follow-up section for the exact repair task and regression tests.


## Pre-Cursor review gate — Issue #13

Before Cursor starts Issue #13, use:
`docs/PRE_CURSOR_REVIEW_ISSUE13_20260929.md`

Expected independent Review outcome:
- READY
- READY_WITH_CHANGES
- NOT_READY

Cursor should not start Issue #13 until this review is complete.

## Review Chat handoff

Canonical reviewer handoff:
`docs/REVIEW_CHAT_HANDOFF_20260929.md`

Use this when starting a separate independent Review Chat.

## Project operating model — 2026-09-29

Canonical:
`docs/PROJECT_OPERATING_MODEL_20260929.md`

Roles:
- Main ChatGPT = Project Manager / Brain
- Cursor = Builder
- Review ChatGPT = independent Reviewer
- GitHub = SSOT
- Human = Goal / KPI / consequential decisions / discomfort signals

Current execution rule:
> Main does not re-implement Builder work. Cursor owns technical implementation choices after reading GitHub state. Review Chat independently checks quality and product fit.

## Current Human-approved MVP definition — 2026-09-29

Upstream definition:
`docs/UPSTREAM_FIX_DRAFT_20260929.md`

Wireflow authority:
Figma `[FROZEN] MVP Wireflow v0.5` / node `25:2`

Screen specification:
`docs/MVP_SCREEN_SPEC_20260929.md`

Data specification:
`docs/MVP_DATA_SPEC_20260929.md`

Status:
> MVP_WIREFLOW_FROZEN / SCREEN_AND_DATA_SPEC_IN_PROGRESS

Human Gate approved the MVP wireflow on 2026-09-29.

Canonical MVP stages:
`Home → Clarify → Context → Action → Feedback → Memory`

Important:
- The six items are common stages, not six rigid visual screens.
- Context and Action vary by Intent.
- Initial seven Intents are fixed for MVP.
- No partner mood inference.
- Rest / skip / defer are valid actions.
- Unknown must not be filled by unsupported inference.
- Household Memory must learn from actual outcome, not only chat history.

Status: REQUIREMENTS_BEFORE_FINAL_DESIGN

Repository:
`natanata8/papa-life-optimizer`

Latest dedicated handoff:
`docs/NEW_CHAT_HANDOFF_20260930.md`

## Current product thesis

> Personal Event → Household Impact → Load Absorption

Brand:
> 自分の時間も、家族の余裕も。

Product explanation:
> やりたい予定から、家庭の負担を先回りして整える。

Brand principle:
> 責めない。止めない。先回りする。

Primary user:
> 育児中で、自分の時間も取りたいが、その結果の家庭負担を一方的にパートナーへ外部化したくない父親。

## Current process decision

Framer / Figma exploration has been useful, but final design work is paused.

Reason:
Site concept, MVP requirements, information architecture, screen inventory and free/paid boundaries are not yet sufficiently finalized.

Current Figma must be treated as:
> Design Spike / Reference Flow

not final Visual Authority.

## Product boundaries

Do not drift into:
- chore tracker
- generic parenting app
- therapy app
- fairness score
- partner mood inference
- strict 50:50 accounting
- wife-management / 妻攻略
- full household OS before validating the event optimizer

AI may predict operational consequences and suggest actions.
AI must not decide fairness, relationship quality, who is right, or whether the user deserves permission.

## MVP hypothesis

Initial scenarios:
1. 飲み会
2. 休日朝寝坊
3. ゴルフ

Core loop:
Event
→ Context
→ Household Impact Preview
→ 3–5 actions
→ Event
→ Recovery
→ Learn

## Visual exploration state

Framer:
https://framer.com/projects/Papa-Life-Optimizer-Visual-Exploration--45jodTjnbayF1b6sVyq3-4y0Me

Exploration:
- A Life Operations
- B Editorial Decision Assistant
- C Desire-first Personal Utility
- /synthesis
- /synthesis-v2

Current strongest reference:
`/synthesis-v2`

Flow:
> Desire → Household Impact → Advisor → 3 Actions → Plan B → Restore

Framer remains exploration only.

## Figma reference state

File:
`Papa Life Optimizer — Final Synthesis v1`

File key:
`qbTwjl2xa1EW5hLuhcCyXT`

URL:
https://www.figma.com/design/qbTwjl2xa1EW5hLuhcCyXT

Contains:
- Desktop 1440 reference flow
- Mobile 390 reference flow

Status:
> Design Spike / Reference Flow only. NOT final Visual Authority.

## Business decision-state protocol

Canonical business-decision docs:
- `docs/business/BUSINESS_DECISION_PROTOCOL.md`
- `docs/business/BUSINESS_MODEL_STATUS.md`
- `docs/business/ASSUMPTIONS.md`

Current rule:
- AI must not complete unknown business decisions just to make the strategy look polished.
- Business statements must be tracked as `DECIDED`, `HUMAN_HYPOTHESIS`, `VALIDATED`, `AI_PROPOSAL`, or `UNKNOWN`.
- Current product North Star `Balanced Freedom Event Rate` remains canonical.
- For near-term validation, also track the simpler behavioral metric `30-day second-use rate` without treating it as a replacement North Star unless Human explicitly decides so.
- Initial customer pain, willingness to pay, pricing, and channel choices remain hypotheses / unknowns until validated.

## Immediate next

Proceed with:
`Issue #13 — Define MVP implementation contracts before coding`

Pre-Cursor Review result:
> READY_WITH_CHANGES

Changes applied before Cursor start:
- Human UX acceptance criteria added to Issue #13
- internal complexity must not become user-facing complexity
- no heavy upfront profile requirement
- unnecessary / repeated questions prohibited
- internal Intent / Router / Load / Memory terminology must remain hidden
- clear next action must be prioritized over long AI explanation
- contract tests must verify UX behavior, not only schema/routing correctness

Next execution:
1. Cursor implements Issue #13
2. Cursor records contracts, fixtures, tests, and evidence in GitHub
3. Main Chat summarizes the result without re-implementing
4. Review Chat independently reviews the completed contracts
5. Minor findings return to Cursor
6. Human Gate only for consequential decisions

## Read next

1. `AGENTS.md`
2. `docs/NEW_CHAT_HANDOFF_20260925.md`
3. `docs/PRODUCT_CONCEPT.md`
4. `docs/LOAD_MODEL.md`
5. `docs/UX_LOOP.md`
6. `docs/design/DESIGN_CONTEXT.md`
7. `docs/design/FRAMER_PROJECT.md`
8. Issue #6
9. latest main / open Issues / PRs

## HUMAN_REQUIRED

- requirements / scope approval
- final Visual Authority approval
- pricing / payment
- privacy / legal
- publish / production

## Do not do yet

- production deploy
- full household OS expansion
- partner account requirement
- calendar integration
- fairness scoring
- partner mood inference
- final design-system build
- broad app-screen rollout


## Dot Project Operator — 2026-10-03

Canonical operator contract:
`docs/DOT_OPERATOR.md`

Startup prompt:
`docs/DOT_START_PROMPT.md`

Role:
> Dot = always-on Project Operator

Dot may AUTO-CONTINUE reversible low-risk work inside approved scope, including GitHub/Slack state reconciliation, handoff maintenance, Builder task preparation, non-production QA/evidence, and SNS Acquisition Lane preparation.

Dot must not silently finalize or change:
- Purpose / Customer / Problem / Value
- KPI
- MVP scope
- service name / brand
- pricing / payment
- privacy / legal
- production release

Current operator priority:
1. reconcile latest team upstream discussion with GitHub canonical docs
2. gap-review existing MVP / PR #14 against the new upstream
3. preserve reusable implementation work
4. run Product Lane and SNS Acquisition Lane in parallel
