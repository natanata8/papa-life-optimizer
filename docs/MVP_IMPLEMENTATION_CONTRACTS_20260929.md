# PAPA CODE — MVP Implementation Contracts

Status: CONTRACTS_DEFINED_PENDING_REVIEW  
Date: 2026-09-29  
Issue: `#13`  
Depends on: `docs/MVP_SCREEN_SPEC_20260929.md`, `docs/MVP_DATA_SPEC_20260929.md`

The repository had no application runtime. These contracts are the first executable layer. Later server code should call `contracts/policy.py` rather than restating the rules.

Run the checks with:

```
python3 -m unittest contracts.tests.test_mvp_contracts
```

## Where the contracts live

| Contract | Path |
| --- | --- |
| Shared enums, limits, askable keys | `contracts/vocab.json` |
| Router, question, action, memory policy | `contracts/policy.py` |
| JSON Schema for turns, outcomes, model output | `contracts/schemas/mvp.schema.json` |
| PostgreSQL 15+ persistence | `contracts/db/001_mvp.sql` |
| HTTP boundary | `contracts/openapi/mvp.openapi.json` |
| Prompt rules | `contracts/prompts/` |
| Deterministic recommendation copy | `contracts/templates/recommendations.json` |
| Fixtures | `contracts/fixtures/` |

## Frozen behavior these contracts keep

Stages stay `Home → Clarify → Context → Action → Feedback → Memory`. They are states, not six fixed screens. A resolved turn records `HOME, CLARIFY, CONTEXT, ACTION` in `audit.stage_trace` and returns the short context plus 1–5 actions together.

The seven intents stay:

- `WHAT_SHOULD_I_DO` → `PRIORITY`
- `TIRED` → `CAPACITY`
- `WANT_TO_DRINK` → `HOUSEHOLD_IMPACT`
- `WANT_PERSONAL_TIME` → `TIME_OPPORTUNITY`
- `PARTNER_UNHAPPY_OR_CONFLICT` → `SITUATION_SUMMARY`
- `OVERTIME` → `HOUSEHOLD_IMPACT`
- `FREE_CONSULT` → a concrete mode only after the router resolves

`REST`, `DEFER`, and `SKIP` are stored action types and are emitted for tired and priority consultations.

`partner_feeling`, `who_is_right`, `fairness`, and `emotional_load` cannot be stored as known values. The SQL check forces those keys to `UNKNOWN` with a null value. The policy sets `infer: false`.

Household Memory of type `SUCCESS_PATTERN`, `FAILURE_PATTERN`, or `CONFLICT_PATTERN` requires `outcome_backed` and a source consultation. A chat-only record is ignored on retrieval and produces no new memory.

MVP schedule sources are `MANUAL`, `CONSULTATION`, and `PROFILE_ROUTINE`. There is no external calendar source.

## Builder choices

These are reversible implementation choices. They do not change the frozen stages or the seven intents.

1. PostgreSQL 15+ is the reference DDL. Contract tests parse that SQL. They do not need a live database. Hosting vendor is undecided.
2. The HTTP shape is the OpenAPI file. Clients render `user_visible` only. `audit` is for the server and the contract tests.
3. Home-choice routing is deterministic. Free text uses the phrase list in `vocab.json`. A model may propose a classification, and `guard_model_output` rejects it when it breaks the rules.
4. Confidence below `0.75` does not resolve an intent. Unresolved free text returns one question and the six concrete entry labels. It does not emit `ROUTED_CONTEXT` as if a mode had been chosen. `ROUTED_CONTEXT` remains in the enum for an in-progress snapshot, and the final unresolved mode is null.
5. When free text matches both a desire (`WANT_TO_DRINK`, `WANT_PERSONAL_TIME`, `TIRED`) and another intent, the desire is primary. A tapped home choice stays primary even if the sentence also matches something else.
6. Load vector cells are nullable `smallint` 0–3. Null means unknown. The numbers stay in `audit` and in `task_load_vectors`. They are not copied into `user_visible`.
7. `users.role` is `FATHER` only. Partner and child rows live in `household_members` and have no login.
8. Visible length limits are in `vocab.json`: at most 4 questions, 1–5 actions, and 420 characters across the visible card.

## Profile fields

`docs/MVP_DATA_SPEC_20260929.md` section 12 lists child age, work pattern, return time, weekday routine, and usual responsibilities as data that makes a recommendation more specific.

Issue #13 requires a useful answer before a large profile exists. This contract follows that rule:

- `POST /v1/consultations` does not require a profile.
- Profile keys are never questions.
- Missing profile keys stay `UNKNOWN` with `required: false`.
- The action list is still returned for a resolved intent.

Askable keys are only the ones that change the current recommendation: `event_window`, `expected_delay`, `desired_window`, and `observed_facts`. A missing askable key adds one short question and still leaves the actions in place.

## AI output

`contracts/prompts/system_v1.txt`, `router_v1.txt`, `recommend_v1.txt`, and `memory_v1.txt` are the wording rules. The model must return `AiStructuredOutput` from the JSON Schema. `guard_model_output` then checks:

- confidence and the resolved flag agree
- an unresolved turn does not invent an intent or a context mode
- questions do not repeat known or profile keys
- visible copy does not contain internal names, fairness language, or partner-mood claims
- resolved turns contain 1–5 actions
- memory candidates are outcome-backed

On a guard failure the future server retries the model once, then falls back to `consult()` for that intent. The user does not see the raw model payload.

## Memory

Retrieval keeps at most five items that are outcome-backed, not superseded, and not rejected. A success pattern applies only to the same intent, unless its type is in `cross_intent_memory_types`. `covered_keys` count as known, so the next consultation does not ask them again. The visible `memory_note` is the stored sentence, with no schema vocabulary.

`record_outcome` writes memory only when `derivation` is not `CHAT_ONLY` and `reusable_next_time` is true or false. A null reuse answer stores feedback and no memory. Partner response text, when the user typed it, stays on the outcome row and is not copied into the memory sentence.

`POST /v1/households/{household_id}/memory/{memory_id}/rejections` drops that pattern for the current consultation.

## First vertical slice

Slice: one household, one `WANT_TO_DRINK` consultation, then feedback and a second consultation.

Build in this order:

1. Apply `contracts/db/001_mvp.sql` to a development database. Do not point it at production.
2. Keep `contracts/policy.py` as the gate in the server process. Do not re-encode the router in the UI.
3. Implement `startConsultation`, `continueConsultation`, `recordOutcome`, `listMemory`, and `rejectMemory` from the OpenAPI file. Profile `PATCH` may exist and must not block step 3.
4. Adapt a model behind `guard_model_output`. One repair retry, then the deterministic template for the resolved intent.
5. Persist the turn, the context requirements, the action rows, the outcome, and any memory row.

Acceptance for this slice is the current fixture set, in particular `want-to-drink`, `no-profile-still-useful`, `memory-second-visit`, `memory-rejected`, `outcome-success`, and `outcome-chat-only`.

Still outside this slice: visual design, calendar sync, reminders, dashboard, outings, partner accounts, auth-vendor selection, and production deploy. The other six intents already have fixtures and templates. Their UI follows after the drink path passes.

## HUMAN_REQUIRED

Not decided here:

- privacy policy, retention, deletion, export, model-provider data handling, and partner-data consent
- auth vendor and payment
- production publish or deploy

A blocking profile form, a change to the six stages, or a change to the seven intents would be a new Human decision. The `0.75` threshold and the PostgreSQL reference DDL are builder choices and can be revised without a goal change.

## Prohibited items confirmed untouched

Frozen stages and intent names are unchanged. No partner mood score, fairness score, calendar sync, dashboard, outing flow, partner account, or production deploy is included.
