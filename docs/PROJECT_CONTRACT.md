# PROJECT_CONTRACT — Papa Life Optimizer

Status: CURRENT PROJECT EXECUTION CONTRACT
Global contract: `natanata8/ai-operating-system/AI_OPERATING_CONTRACT.md` v1.1.0

This file adds project-specific constraints. Product/business/writing source documents remain authoritative.

## Authority

Before substantial work, follow `AGENTS.md` and the canonical product/business/writing documents it names.

## HARD

### PLO-001 — Product focus
Do not silently turn the product into generic parenting advice, chore tracking, therapy, relationship diagnosis, or a generic AI chat product. Preserve the canonical Personal Event → Household Impact → Load Absorption mechanism unless Human changes it.

### PLO-002 — Non-judgment
Do not frame the father, partner, or family member as the villain. Do not use blame as the mechanism for behavior change.

### PLO-003 — No emotion/motive diagnosis
Do not assert a partner's feelings, motives, mental state, or hidden intention as fact. Treat them as uncertainty unless supplied as explicit household context.

### PLO-004 — Household-specific over generic advice
Where product output depends on household conditions, do not replace missing household context with confident generic parenting norms. Ask/collect only information necessary for the decision, or express bounded uncertainty.

### PLO-005 — Builder boundary
Implementation executors must not independently change Product, business model, approved UX direction, user-facing copy, or writing policy while implementing code/design.

### PLO-006 — Writing authority
Material user-facing prose must follow `docs/writing/` authority and its review process. A code implementation task does not grant copywriting authority.

### PLO-007 — Business-state integrity
Preserve DECIDED / HUMAN_HYPOTHESIS / VALIDATED / AI_PROPOSAL / UNKNOWN classifications. Do not promote AI-generated plausibility into a decided or validated fact.

### PLO-008 — Revenue/KPI prioritization
Use the latest canonical business-model/KPI documents before prioritizing monetization, acquisition, conversion, retention, or product-validation work. Do not create a parallel revenue strategy inside implementation artifacts.

## HUMAN GATE

In addition to global gates:
- core Customer/Pain/Offer/Price/KPI changes,
- expansion beyond the validated product loop,
- consequential family-context policy,
- privacy/data-retention/model-provider decisions,
- payment/production launch,
- major approved UX/design direction changes.
