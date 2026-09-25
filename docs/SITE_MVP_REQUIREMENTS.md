# SITE_MVP_REQUIREMENTS — Papa Life Optimizer

Status: PROPOSED / HUMAN_APPROVAL_REQUIRED  
Phase: REQUIREMENTS_BEFORE_FINAL_DESIGN  
Issue: #9

## 0. Requirement decision

Papa Life Optimizer should launch as a focused **event optimizer**, not as a household-management suite.

The product must prove one thing first:

> When a father has something he wants to do, the service can predict the household impact created by that event and turn it into a small, credible preparation/recovery plan that makes the event easier to execute without simply transferring hidden work to the partner.

This preserves the strongest existing thesis while narrowing the MVP around one repeatable job.

---

## 1. Product Thesis

Canonical thesis:

> Personal Event → Household Impact → Load Absorption

User-facing promise:

> やりたい予定から、家庭の負担を先回りして整える。

Brand:

> 自分の時間も、家族の余裕も。

Brand principle:

> 責めない。止めない。先回りする。

### What the product is

A decision-and-preparation utility used around personal events.

It starts with desire, predicts operational consequences, and gives the smallest useful set of actions before and after the event.

### What the product is not

It is not a permission system, fairness judge, chore tracker, relationship counselor, family calendar, or full household OS.

---

## 2. Primary User

### Primary user

A father raising children who:
- wants personal time, hobbies, social time, work time, or rest;
- already experiences negotiation or hidden household impact around those events;
- does not want every event to require a long household coordination discussion;
- does not want to be lectured, scored, or treated as irresponsible;
- is willing to take a few concrete actions if the service explains what matters.

### Initial buyer

Father.

### Secondary beneficiary

Partner / spouse.

The MVP must create partner-side benefit **without requiring a partner account, partner approval flow, or routine partner data entry**.

### Initial user boundary

Prioritize households with at least one child and two active caregivers/partners where personal events meaningfully alter childcare or household operations.

Single-parent households, complex multi-household custody, and professional caregiver arrangements are valid future cases but are not the primary validation cohort.

---

## 3. MVP Scope

The MVP must support a complete event optimization loop:

1. enter desired event;
2. ask only necessary context;
3. predict the event-created household impact;
4. show 3–5 high-leverage actions;
5. let the user mark what they will do;
6. support a small Plan B when conditions change;
7. capture post-event outcome and recommendation usefulness;
8. reuse learned household facts on the next event.

### MVP capabilities

Required:
- free-text or scenario-assisted event entry;
- 1–4 contextual follow-up questions;
- lightweight household profile;
- household impact explanation;
- action plan with timing/purpose;
- optional recovery action;
- minimal Plan B;
- post-event feedback;
- event history sufficient for learning;
- remembered household facts and prior answers when account-based;
- safety/uncertainty handling when information is insufficient.

Not required:
- calendar sync;
- partner account;
- shared task assignment;
- daily chore dashboard;
- messaging between partners;
- points/streaks;
- fairness or contribution scoring;
- exact free-time ledger;
- full weekly planner;
- proactive notification engine;
- full AI chat;
- broad content/media product;
- production subscription/payment implementation.

---

## 4. Three Core Scenarios

The launch validation set remains:

### A. 飲み会

Why it belongs:
- evening absence;
- childcare/meal/bath/bedtime concentration;
- possible late return;
- next-morning recovery risk.

The service should prove it can see both the absence window and the next-day consequence.

### B. 休日朝寝坊

Why it belongs:
- not an “absence” event;
- tests whether the model understands personal rest;
- creates a concentrated morning childcare/household load;
- useful counterexample to a simple calendar-absence model.

The service should prove it can optimize a desire that occurs inside the home.

### C. ゴルフ

Why it belongs:
- early departure;
- long half/full-day absence;
- preparation and transport constraints;
- return fatigue;
- strong need for contingency/Plan B.

The service should prove it can handle multi-phase impact.

### Validation rationale

These three scenarios intentionally span:
- evening absence;
- morning personal time at home;
- long daytime absence.

Do not add more launch scenarios until these three produce repeatably useful plans.

---

## 5. Main User Flow

Canonical MVP flow:

> Desire / Event Entry  
> → Clarifying Context  
> → Household Impact Preview  
> → Recommended Plan  
> → Commit / Adjust  
> → Event  
> → Recovery / Restore  
> → Learn

### Detailed flow

#### Step 1 — Desire / Event Entry
Prompt:
> 何したい？

Input examples:
- 土曜18時から飲みに行きたい
- 日曜は9時まで寝たい
- 来週の日曜、7時から15時までゴルフ

The service must accept natural language.

#### Step 2 — Clarifying Context
Ask only questions that materially affect the recommendation.

Examples:
- 子どもの人数 / 年齢
- その時間帯の通常ルーティン
- パートナーの予定
- 帰宅見込み
- 翌朝の固定予定

Maximum target: 1–4 questions per event after profile reuse.

#### Step 3 — Household Impact Preview
Explain:
- what changes because of this event;
- which windows become constrained;
- where recovery debt may remain.

Do not expose all vector dimensions.
Do not moralize.

#### Step 4 — Recommended Plan
Show 3–5 actions maximum.

Each action should include:
- what to do;
- when;
- why it matters;
- estimated effort only when useful.

The plan must feel smaller than the problem.

#### Step 5 — Commit / Adjust
User can:
- accept;
- remove;
- replace;
- say “これは普段やらない”;
- provide one corrective fact.

The AI should regenerate only what changed.

#### Step 6 — Event
No approval gate.
No “are you sure?”

#### Step 7 — Recovery / Restore
Show only if needed.
Recovery is not punishment.

#### Step 8 — Learn
Minimal feedback:
- 予定は実行できたか;
- 何を実行したか;
- 提案は役立ったか;
- 次回に覚えておくべき correction.

---

## 6. Required Screens / Information Architecture

The MVP should remain small.

### Public / acquisition
1. **Landing**
   - explain category difference;
   - lead with real desire-first examples;
   - start an event directly.

2. **How it works / trust**
   - explain Event → Impact → Actions;
   - explain AI boundaries and privacy concept at a high level.

### Core product
3. **Event Entry**
   - natural-language desire entry;
   - optional quick-start scenario chips for the three launch cases.

4. **Context Questions**
   - progressive, one/few questions at a time;
   - prefill remembered facts.

5. **Impact + Plan Result**
   - desired event remains visually primary;
   - impact is neutral;
   - 3–5 actions are dominant;
   - Plan B shown only when useful.

6. **Plan Detail / Adjust**
   - edit assumptions;
   - replace an action;
   - record household-specific exception.

7. **Post-event Check-in**
   - completion;
   - action execution;
   - usefulness;
   - correction.

### Account / memory
8. **Household Profile**
   - child count/ages;
   - fixed routines;
   - recurring constraints;
   - default responsibilities only where needed for better prediction.

9. **History**
   - recent optimized events;
   - reusable event;
   - learned facts;
   - no fairness ledger.

10. **Account / Settings**
   - account;
   - memory controls;
   - data/privacy entry points;
   - paid status later.

### MVP navigation principle

Do not expose a dashboard of household operations.

Primary product CTA everywhere:
> 何したい？

---

## 7. Per-screen Inputs / Outputs

### Landing
Input: CTA / example selection.  
Output: event-entry start.

### Event Entry
Input: natural-language event.  
Output: normalized event hypothesis + missing context.

### Context Questions
Input: 1–4 answers.  
Output: event context sufficient for prediction.

### Impact + Plan Result
Input: event + context + household memory.  
Output:
- event summary;
- 2–5 relevant household impacts;
- 3–5 recommended actions;
- confidence/uncertainty only where materially useful;
- Plan B if a major fragility exists.

### Plan Adjust
Input: correction / action preference.  
Output: revised small plan.

### Check-in
Input: event outcome + action execution + usefulness.  
Output: learning update.

### Household Profile
Input: durable household facts.  
Output: reusable context.

### History
Input: select previous event.  
Output: outcome + learned plan + reuse option.

---

## 8. Onboarding Requirements

Do not front-load a long household questionnaire.

### First-use onboarding

Required:
- account can be deferred until after first value moment when feasible;
- ask only enough to generate the first credible plan;
- explain that the service learns household patterns over time.

### One-time profile fields

Candidates:
- children count;
- child ages / broad stage;
- usual work pattern;
- daycare/school constraints;
- default wake/sleep windows;
- recurring weekend constraints;
- a small set of usual responsibilities.

Do not ask:
- relationship satisfaction;
- anger/resentment rating;
- “who does more”;
- contribution percentages;
- partner personality typing.

---

## 9. Household Profile Requirements

The profile exists only to improve event impact prediction.

Store facts such as:
- child age/stage;
- fixed pickup/drop-off;
- common bedtime flow;
- usual meal responsibility;
- recurring partner commitments;
- no-go assumptions;
- event-specific corrections learned from history.

The profile must support:
- edit;
- forget/remove;
- explicit correction;
- clear distinction between user-provided fact and AI inference.

Privacy/legal implementation details remain HUMAN_REQUIRED.

---

## 10. Event-entry UX

Primary entry is natural language.

Required behavior:
- accept incomplete desire statements;
- infer likely event type;
- confirm only ambiguous operational details;
- avoid form-heavy scheduling UI;
- never lead with household chores.

Quick-start scenario options may exist, but they must not make the product feel limited to three templates.

Good:
> 土曜の夜、飲みに行きたい。

Bad:
> 家事分担を最適化するイベントを選択してください。

---

## 11. Result / Action UX

The result page must answer, in order:

1. **What you want to do**
2. **What this changes at home**
3. **What to do now**
4. **What to do if conditions change**
5. **What remains after the event, if anything**

### Action rule

Show the smallest useful set, normally three actions.

Rank internally by:
1. predicted impact reduction;
2. fit to household;
3. effort;
4. timing;
5. confidence.

Avoid:
- giant checklist;
- generic “help more” advice;
- exact reciprocity;
- moral framing.

---

## 12. Free / Paid Boundary

### Free must prove the core value

Free should include:
- event entry;
- the three launch scenarios and equivalent free text;
- contextual questions;
- household impact preview;
- 3–5 actionable recommendations;
- basic Plan B / recovery;
- minimal post-event feedback;
- limited recent history.

If the core Event → Impact → Action loop is paywalled, validation becomes impossible and the product will look like a generic subscription gate.

### Paid hypothesis

Paid value should be **better personalization and less repeated explanation**, not “access to AI.”

Candidate paid capabilities:
- persistent household memory beyond a basic profile;
- deeper event history;
- repeat-event learning;
- richer household-specific adjustments;
- reusable custom household rules;
- personalized weekly/event forecasting after validation;
- higher-detail AI consultation around exceptional cases.

### Not decided yet

- price;
- trial design;
- exact usage limits;
- billing cadence;
- payment implementation.

These remain HUMAN_REQUIRED.

---

## 13. AI Responsibilities

### AI should

- parse a natural-language desired event;
- identify missing operational facts;
- predict likely household consequences;
- reason across BEFORE / DURING / RECOVERY;
- rank actions by expected impact reduction;
- explain recommendations briefly;
- create a Plan B when a clear operational fragility exists;
- remember user-confirmed household facts when allowed;
- learn from post-event corrections;
- state uncertainty when household facts are insufficient.

### AI must not

- authorize or reject the event;
- infer partner anger, resentment, love, or relationship health;
- decide what is fair;
- rank either partner morally;
- produce a fairness score;
- diagnose mental/medical conditions;
- tell the user they “deserve” or do not deserve personal time;
- fabricate household facts;
- silently turn inferred facts into permanent profile facts.

### Deterministic / product-owned logic

The product should own:
- screen flow;
- allowed output structure;
- 3–5 action cap;
- required safety boundaries;
- profile schema;
- history schema;
- feedback capture;
- memory permissions.

AI fills bounded reasoning slots inside this structure.

---

## 14. Non-goals

MVP non-goals:
- full household OS;
- family calendar replacement;
- task manager replacement;
- daily chore tracking;
- partner task assignment;
- partner approval;
- couples therapy;
- parenting education library;
- fairness/accounting engine;
- free-time debt ledger;
- mood detection;
- surveillance;
- gamification;
- streaks / badges;
- broad community/social features;
- employer/B2B features;
- calendar sync;
- proactive weekly optimization;
- production payment stack.

---

## 15. Validation KPI

### Primary validation question

> Does using Papa Life Optimizer make desired personal events easier to execute while reducing unresolved household impact?

### North-star candidate

**Balanced Freedom Event Rate**

For MVP, do not pretend it can be measured perfectly. Use observable proxies.

### Required MVP metrics

1. **Plan generation completion**
   - % of event starts that reach a plan.

2. **Action adoption**
   - % of generated plans where at least one recommended action is accepted/committed.

3. **Action execution**
   - % of committed actions reported completed.

4. **Desired event completion**
   - % of optimized desired events actually carried out.

5. **Perceived usefulness**
   - “この提案は役に立ったか” simple rating.

6. **Household-side usefulness**
   - optional partner/user-reported signal where available;
   - must not require partner participation for core use.

7. **Repeat event optimization**
   - user returns with another desired event within a defined period.

8. **Learning lift**
   - repeat users report that later recommendations fit the household better than first-use recommendations.

### Initial success criteria for validation

Before expanding scope, seek evidence that:
- users can reach a useful plan with low input burden;
- recommendations are concrete enough to execute;
- repeat use occurs across real desired events;
- users perceive later plans as more household-specific;
- partner-side burden is not reported as worsening due to product use.

Exact numerical launch gates should be set after baseline usage exists, not invented before data.

---

## 16. MVP vs Post-MVP

### MVP
- desire-first event entry;
- three validation scenarios + free text;
- minimal context questions;
- impact preview;
- 3–5 actions;
- Plan B/recovery where relevant;
- lightweight profile;
- recent history;
- post-event learning.

### Post-MVP only after validation
- calendar integration;
- proactive event detection;
- partner account;
- collaborative household planning;
- weekly prediction;
- richer AI conversation;
- deeper personalization;
- paid memory tiers;
- B2B;
- household OS expansion.

---

## 17. Design gate

Framer exploration remains complete/on hold.

Current Figma remains:
> Design Spike / Reference Flow

Figma must not become implementation-facing Visual Authority until Human approves:
- the requirements in this document;
- the MVP screen inventory;
- free/paid direction;
- scope boundaries.

After approval, design work should use this document as the primary requirements input.

---

## 18. HUMAN_REQUIRED

Human approval is required for:
- canonical requirements / scope freeze;
- any change to the three-scenario validation set;
- free/paid commercial boundary when it affects product access;
- pricing/payment;
- privacy/legal;
- final Visual Authority;
- publish/production.

Everything else may continue within these boundaries.
