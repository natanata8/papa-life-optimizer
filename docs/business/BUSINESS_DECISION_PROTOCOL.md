# BUSINESS_DECISION_PROTOCOL — Papa Life Optimizer

## Purpose

Prevent AI from turning plausible ideas into apparent business decisions.

Business design and prose generation are separate activities.
First decide what is true, assumed, unknown, or merely proposed.
Only then polish the wording.

## Canonical business structure

All business-model work should map to these eight areas:

1. Customer / Payer
2. Pain / Desire
3. Offer
4. Price
5. Acquisition
6. Revenue Funnel
7. Business Goal
8. North Star KPI

## Required status labels

Every material business statement must use one of:

- `DECIDED` — explicitly decided by Human.
- `HUMAN_HYPOTHESIS` — Human-origin hypothesis, not yet validated.
- `VALIDATED` — supported by actual interviews, behavioral data, experiments, sales, or equivalent evidence.
- `AI_PROPOSAL` — proposed by AI and not accepted as a decision.
- `UNKNOWN` — unresolved or insufficiently known.

AI must never promote its own inference, common practice, benchmark, or plausible number to `DECIDED` or `VALIDATED`.

## Decision workflow

1. Read current canonical product docs and business assumptions.
2. Extract existing facts and statements without polishing them.
3. Classify each material statement with a status label.
4. Surface contradictions and missing decisions.
5. For unresolved decisions, provide 2–4 options with:
   - difference
   - upside
   - downside / risk
   - what evidence would decide between them
6. Human decides only the consequential business choice.
7. Update canonical docs and assumptions.
8. Only after the decision state is stable, produce polished business or user-facing prose.

Do not ask Human to do research, comparison, documentation, or validation design that AI can perform.

## Anti-patterns

Do not:
- fill unknowns merely to make a plan look complete
- invent target ages, prices, channels, conversion rates, or benchmarks as facts
- turn a broad list of possible channels into a claimed acquisition strategy
- create a named KPI merely because it sounds strategic
- use polished prose to hide uncertainty
- collapse a hypothesis into a requirement without evidence
- overwrite an existing canonical KPI without explicitly reconciling it

## KPI rule

The canonical product North Star currently remains `Balanced Freedom Event Rate` in `docs/PRODUCT_CONCEPT.md`.

For the current validation phase, prioritize directly measurable repeat-use evidence before inventing additional branded KPI names.

Preferred validation metric:
> 30-day second-use rate: the percentage of users who use the product for a second real-life event within 30 days of first use.

Related measures may include:
- first optimization completion
- recommendation execution
- second use
- 30-day retention
- willingness to pay / paid conversion when pricing is tested

A metric becomes canonical only after Human explicitly decides it.

## Writing boundary

Do not optimize business thinking for presentation quality.

Once the business state is ready to be communicated, apply:
- `docs/writing/STYLE_GUIDE.md`
- `docs/writing/VOICE.md`
- `docs/writing/AI_TELLS.md`
- `docs/writing/GOOD_EXAMPLES.md`
- `docs/writing/BAD_EXAMPLES.md`
- `docs/writing/REVIEW_RUBRIC.md`

## Human-required boundary

HUMAN_REQUIRED:
- Goal / KPI changes
- target-customer choice when alternatives materially change the product
- scope trade-offs
- pricing commitment
- monetization commitment
- irreversible brand positioning
- production / payment / legal / privacy decisions

AUTO-CONTINUE:
- research
- comparison
- assumption extraction
- contradiction finding
- experiment design
- interview-guide drafting
- evidence collection
- documentation updates
- classification of already-known information
