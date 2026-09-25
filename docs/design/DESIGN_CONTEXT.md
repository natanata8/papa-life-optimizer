# DESIGN_CONTEXT — Papa Life Optimizer V2

## Product thesis
Papa Life Optimizer starts from a father's personal desire and helps make that event workable by predicting and reducing the hidden household impact around it.

Core line:
> やりたい予定から、家庭の負担を先回りして整える。

Brand line:
> 自分の時間も、家族の余裕も。

Brand principle:
> 責めない。止めない。先回りする。

## Authority order
1. Current Goal / KPI / explicit Human decisions
2. `docs/PRODUCT_CONCEPT.md`
3. `docs/LOAD_MODEL.md`
4. `docs/UX_LOOP.md`
5. active Issue / validated product behavior / approved visual authority
6. Shared Design Intelligence: `natanata8/design-intelligence`
7. external references / trends

Project-specific product rules outrank shared visual guidance.

## Primary design job
Make the product feel like an adult personal utility for fathers—not a parenting app, chore tracker, therapy product or household dashboard.

The user should feel:
- "I can say what I actually want."
- "This understands what happens at home."
- "It gives me a few useful actions."
- "It is helping me go, not judging whether I should."

## Brand personality
Required:
- intelligent
- adult
- practical
- calm
- slightly playful

Quality:
- premium without luxury theatre
- mature without corporate stiffness

Avoid:
- preachy
- cute
- maternal
- macho
- therapeutic
- judgmental
- gamified
- corporate productivity SaaS

## Core UX principles

### 1. Desire First
The visual hierarchy should begin with the desired event.

Examples:
- 飲みに行きたい。
- 休日くらい、朝寝坊したい。
- 土曜はゴルフに行きたい。

Do not visually start from chores.

### 2. Consequence Visibility
Show household impact clearly but neutrally.

Use:
- sequence
- timeline
- grouped consequence
- before / absence / recovery structure

Avoid red-warning treatment unless there is an actual operational risk.

### 3. Preparation, not Permission
The UI must never look like a moral approval flow.

Avoid:
- confirmation dialogs asking whether the user should go
- guilt meters
- "fair / unfair" labels
- partner mood prediction

### 4. Small Next Actions
Do not turn the vector model into a dashboard.

Internally the model may be detailed.
Externally the user usually gets 3–5 actions.

### 5. Household Buffer
Create visual room for recovery and contingency.
Do not represent every minute as optimized.

### 6. Partner value without partner burden
Do not make the partner responsible for setup, scoring or approving.

## Visual system guidance
Prefer:
- calm but confident typography
- warm neutral surfaces
- strong hierarchy
- purposeful density
- editorial sequencing when useful
- asymmetric composition when it supports meaning
- restrained accent color
- realistic adult-life imagery only when it adds evidence

Avoid:
- generic SaaS cards
- parenting-app pastel language
- family stock-photo clichés
- cute child illustrations
- repetitive dashboard widgets
- excessive rounded rectangles
- gradients as identity
- glassmorphism
- gamified progress rings
- "wife mood" visualizations

Cards are allowed only for meaningful independent objects or actions.

## Motion
Use motion for:
- state change
- task completion feedback
- transition between impact and preparation
- spatial continuity

Avoid:
- repeated fade-up
- decorative motion
- dopamine mechanics
- motion that delays task completion

## Mandatory design-generation workflow
For material UI / Figma / Framer / implementation:
1. Read this file.
2. Read `PRODUCT_CONCEPT.md`, `LOAD_MODEL.md`, `UX_LOOP.md`.
3. Read active Issue/PR and current implementation.
4. Read relevant shared Design Intelligence.
5. Record shared principles + project overrides.
6. Run Design Review + AI-slop review.
7. If motion exists, run motion review.
8. Capture realistic desktop/mobile evidence.
9. Verify the result still satisfies Desire First / Preparation-not-Permission.
10. Record reviewed Design Intelligence SHA.

## Framer
Framer is the Visual Exploration Lab, not final visual authority.

For a major direction:
- create at least 3 materially different directions
- use real scenario content
- do not create three color variants
- compare with the project goal and product principles
- formalize the selected/synthesized direction in Figma before implementation

Required initial exploration:
A. Life Operations
B. Editorial Decision Assistant
C. Desire-first Personal Utility

See `docs/design/FRAMER_SKILL_SPEC.md`.

## Final visual authority
Framer exploration does not become production truth automatically.

Flow:
GitHub product SSOT
→ Framer exploration
→ comparison / synthesis
→ Figma approved visual authority
→ implementation
→ Visual QA
