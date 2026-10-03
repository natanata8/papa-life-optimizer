# Issue #17 — Upstream / PR #14 Independent Review Delta

- Status: `READY_WITH_CHANGES`
- Review date: 2026-10-03
- Review target: PR #14 at `5cd0d362e8c12eccae7521178c2d803d0cafee8d`
- Current main: `f151e101a6a4db683369724251c6b70ea19f914d`

## Current objective

Reconcile the October 1–2 Slack upstream with current GitHub authority and the frozen MVP, then identify the minimum PR #14 corrections required before Cursor starts a new vertical slice.

This review does not change Product, Customer, KPI, MVP scope, naming, privacy policy, pricing, or production state.

## Evidence reviewed

GitHub:

- `AGENTS.md`, `docs/PROJECT_CONTRACT.md`, `docs/DOT_OPERATOR.md`, and `docs/CURRENT_HANDOFF.md`
- `docs/PRODUCT_CONCEPT.md`, `docs/LOAD_MODEL.md`, and `docs/UX_LOOP.md`
- `docs/MVP_SCREEN_SPEC_20260929.md` and `docs/MVP_DATA_SPEC_20260929.md`
- `docs/UPSTREAM_FIX_DRAFT_20260929.md`, `docs/TEAM_REVIEW_UPSTREAM_20260930.md`, and `docs/NEW_CHAT_HANDOFF_20260930.md`
- Issue #13, Issue #17, and PR #14 source, fixtures, tests, workflows, and review state
- global `natanata8/ai-operating-system` v1.3.0

Slack:

- October 1 integrated upstream HTML, Slack file `F0C5N7LB6Q3`: [source thread](https://web-f7o5957.slack.com/archives/C0C40EMES5U/p1790815079439369)
- October 2 narrow drink-use-case discussion: [source thread](https://web-f7o5957.slack.com/archives/C0C40EMES5U/p1790857259109479)
- October 2 differentiation discussion: [source thread](https://web-f7o5957.slack.com/archives/C0C40EMES5U/p1790900272351349)
- naming discussion: [source thread](https://web-f7o5957.slack.com/archives/C0C2KBDP24F/p1791008079184369)

The Slack evidence was reconciled from message text and the attached HTML. Image attachments were not visually reviewed, so they are not used as decision evidence here.

## Decision-state reconciliation

### Human-approved upstream to preserve

The October 1 proposal defines:

- Purpose: reduce uneven household burden and friction and create room for work, parenting, housework, and personal time.
- Brand audience: fathers who positively want to improve household life.
- Initial target: fathers in their 20s–40s, from expecting a child through the preschool years, who participate in housework/childcare yet still experience friction.
- Value flow: understand the situation, identify missing context, present choices, make the household-specific next action concrete, and reuse outcomes.
- Safety boundary: do not assert unknown partner feelings or decide fairness.
- Action vocabulary: rest, skip, defer, communicate, substitute, and recover remain valid.

Yabe explicitly accepted Purpose, Target, and Value on October 2. No separate evidence was found that every teammate explicitly finalized all three, so this is recorded as Human-approved upstream rather than unanimous team validation.

### Hypotheses, not validated strengths

These remain differentiation hypotheses:

1. household-wide contextual guidance with low input,
2. lived experience converted into reusable decision knowledge,
3. recommendations that become more household-specific from accumulated outcomes.

Do not describe these as validated moats or proven product outcomes.

### Still unresolved / HUMAN_REQUIRED

- final service name: `トトボット`, `パパトモ`, and `YOHACU` are candidates only
- whether the drink scenario becomes the final MVP scope; the Slack discussion supports a narrow validation case, not a final scope decision
- whether `Balanced Freedom Event Rate` remains the only North Star or how the older repeated-use KPI relates to it
- privacy, retention/deletion, model-provider handling, partner-data consent, auth, pricing/payment, and production release

## GitHub delta

Current `docs/PRODUCT_CONCEPT.md` is narrower and event-first: it centers the Personal Event → Household Impact → Load Absorption mechanism and the initial drink / sleep-in / golf scenarios. The October upstream broadens the approved framing toward household situation understanding and household-specific next actions.

This does not automatically replace the frozen six stages, seven Intents, event-first validation path, or PR #14. It does require canonical product/business documents to be updated through the Human authority path before implementation treats the broader framing as final product scope.

`docs/business/BUSINESS_MODEL_STATUS.md` previously treated the segment as unresolved; the October Human-approved initial target is newer evidence and should be reconciled there by the PM/Product owner. No pricing or willingness-to-pay conclusion follows from that approval.

## PR #14 reusable work

Preserve these parts unless a focused fix proves otherwise:

- six stages and seven Intents
- deterministic routing and structured model-output guard
- minimal-question / known-data / Unknown handling rules
- non-judgment, no partner-mood inference, and no fairness scoring
- Rest / Skip / Defer plus communication, substitution, and recovery actions
- OpenAPI and PostgreSQL reference contracts
- outcome-backed memory, memory rejection, fixtures, and deterministic fallback architecture
- the narrow `WANT_TO_DRINK` path as a reversible validation slice, subject to the fixes below and without promoting it to final MVP scope

## Independent review findings

### IMPORTANT — transient event data is incorrectly reused as Household Memory

`memory-second-visit` marks `event_window` as a covered memory key. `consult()` then treats that key as known even though the new consultation did not provide its own date/time. The second visit asks fewer questions only because a prior event's transient time is reused as if it described the current event.

Evidence:

- `contracts/fixtures/consultations.json`: `memory-second-visit` has no current `event_window` but its memory declares `covered_keys: ["event_window"]`.
- `contracts/policy.py`: retrieved `covered_keys` are inserted into the current `known` map.
- `contracts/tests/test_mvp_contracts.py`: the repeat-use test rewards the reduced question count without verifying that current-event information remains current.

Required change:

- separate reusable household facts/preferences from consultation-specific fields;
- never satisfy `event_window`, `expected_delay`, or `desired_window` from an older event outcome alone;
- keep the current-event question when its value is missing;
- demonstrate reduced repeated explanation using a genuinely reusable household fact or preference.

### IMPORTANT — failed and rejected suggestions are not prevented from recurring

Failure memory is retrieved, but `build_recommendation()` always emits the same static template actions and only renders a note for `SUCCESS_PATTERN`. A rejected memory ID only removes that memory from retrieval; it does not remove or downgrade the associated action. Therefore the current contract does not meet the upstream expectation that prior failure changes the next recommendation.

Evidence:

- `contracts/policy.py`: `retrieve_memory()` can return `FAILURE_PATTERN`, while `build_recommendation()` does not use retrieved failure/rejection evidence when selecting actions.
- `contracts/policy.py`: `_memory_note()` considers only `SUCCESS_PATTERN`.
- `contracts/fixtures/consultations.json`: `memory-rejected` verifies only that the note disappears and the event-time question returns; it does not assert that the rejected action is avoided.

Required change:

- define an explicit action identity or pattern key;
- filter, downgrade, or replace actions backed by current failure/rejection evidence;
- add fixtures proving that a failed or rejected action is not silently proposed unchanged;
- keep the user able to override an old pattern for the current situation.

### IMPORTANT — deterministic fallback presents household-specific claims without household evidence

The fallback templates emit fixed tasks such as meal preparation, bedtime, laundry, and next-morning transport even when the profile and current household context are empty. That conflicts with `PLO-004` and the approved Value when the output is presented as household-specific rather than as a bounded example.

Required change:

- make fallback actions conditional on known household context, or clearly mark a bounded generic option and request only the missing information that would change it;
- add negative fixtures showing that absent child, routine, task-ownership, or transport evidence does not create confident household facts;
- keep first-use value without adding a blocking profile gate.

### MINOR — the outcome provenance used by policy is absent from machine contracts

`record_outcome()` relies on `derivation == "CHAT_ONLY"` to prevent memory writes. `ConsultationOutcome` in both the JSON Schema and OpenAPI does not define `derivation`; the JSON Schema also rejects additional properties. Fixtures use `derivation`, but do not validate the outcome input against the schema before policy execution.

Required change:

- define provenance in one authoritative machine contract or derive it deterministically from the endpoint/server path;
- validate outcome fixtures before `record_outcome()`;
- prove that chat-only input cannot reach an outcome-backed memory write.

### MINOR — PR integration status was stale, not blocked

The earlier `mergeable=false` report is no longer current. On 2026-10-03 GitHub reports PR #14 as mergeable, open, and draft. A local `git merge-tree --write-tree origin/main 5cd0d362...` completed without conflicts.

PR #14 remains 2 commits ahead and 9 commits behind `main`, so Cursor must reconcile the branch before merge and preserve the newer `CURRENT_HANDOFF`, Project Contract, Dot Operator, and upstream-review documents.

## Verification evidence

- `python3 -m unittest contracts.tests.test_mvp_contracts` — 15 tests passed locally at exact PR head
- `python3 contracts/validate.py` — exited successfully at exact PR head
- GitHub Actions run `36537906438` (`Contract tests`) — success
- GitHub Actions run `36537906396` (`Writing lint`) — success
- PR #14 review submissions — none
- PR #14 review threads — none
- synthetic merge of current `main` and PR head — clean

Passing checks confirm the implemented assertions; they do not cover the three IMPORTANT behaviors above.

## Exact next Cursor task

Use Cursor Pro as Builder. Do not start a broader feature or UI slice.

1. Rebase or merge current `main` into `cursor/mvp-implementation-contracts-e684`, preserving all newer authority and handoff files.
2. Fix the three IMPORTANT findings with the smallest contract, fixture, and test changes.
3. Resolve the outcome-provenance machine-contract mismatch.
4. Re-run contract tests and writing lint.
5. Return the exact diff and evidence for independent re-review.

Acceptance:

- current-event time is never inherited from an older event merely to reduce questions;
- stable household memory reduces genuinely repeated explanation;
- failed/rejected suggestions change the next action set or ranking;
- zero-profile fallback does not assert unsupported household facts;
- chat-only records cannot create outcome-backed memory;
- current `main` authority is preserved;
- no new feature, production deploy, pricing, naming, privacy, or scope decision.

## Issue #17 Exit / next gate

This packet completes the safe reconciliation and independent-review preparation slice for Issue #17. PR #14 is `READY_WITH_CHANGES`, not ready to merge, and the first Builder vertical slice remains gated on a focused Cursor fix plus independent re-review.

No Human decision is needed to make the listed contract fixes. The unresolved items above remain explicitly HUMAN_REQUIRED.
