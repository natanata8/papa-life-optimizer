# DESIGN_CONTEXT — Papa Life Optimizer

## Purpose
Use shared Design Intelligence to improve product clarity and interaction quality while preserving the product's adult lifestyle focus and low-friction operating model.

## Authority order
1. Current product Goal / KPI / explicit Human decisions
2. Project-specific product and family-context requirements
3. Existing validated product behavior
4. Project-specific visual decisions and any approved Figma/spec
5. Shared Design Intelligence: https://github.com/natanata8/design-intelligence
6. External references / trends

## Shared entrypoints
- `principles/CORE.md`
- `anti-patterns/AI_SLOP.md`
- `patterns/PROGRESSIVE_DISCLOSURE.md`
- `patterns/COMMAND_CENTER.md` where applicable
- `motion/PRINCIPLES.md`
- `patterns/MOTION_ROLES.md`
- `evaluation/DESIGN_REVIEW.md`

## Project-specific rules
- Keep the product practical, adult and low-friction.
- Do not drift into a generic parenting app, chore tracker or therapy product.
- Preserve the user's personal-time goal while making household consequences and trade-offs understandable.
- Prefer clear recommendations and small next actions over dense dashboards.
- Use cards only for meaningful independent objects/actions, not as default page structure.
- Avoid cute/childlike decorative treatment unless explicitly approved.
- Motion must clarify state/feedback and must not slow routine use.

## Required workflow
1. Identify the concrete user problem.
2. Read current project requirements / active Issue.
3. Read relevant shared Design Intelligence.
4. Check existing design authority/Figma if present.
5. Propose the smallest coherent UX change.
6. Implement with realistic content and mobile-first checks.
7. Capture visual evidence.
8. Run shared Design Review + AI-slop check.
9. Keep privacy/payment/legal/production gates under local HUMAN_REQUIRED rules.

## Reproducibility
Record the reviewed Design Intelligence commit SHA in material design PR evidence.


## Mandatory design-generation gate

For any material UI/design generation, Figma proposal/revision, layout/component hierarchy change, meaningful styling change, interaction/motion change, implementation of an approved design, or visual QA:

1. Read this file before generating or changing UI.
2. Read current product requirements, active Issue/PR and any approved project-specific design authority.
3. Inspect the current implementation and approved Figma/spec when available.
4. Read relevant shared Design Intelligence files.
5. Record applied shared principles and Papa Life-specific overrides.
6. Run shared `evaluation/DESIGN_REVIEW.md` and `anti-patterns/AI_SLOP.md` before implementation handoff.
7. If motion is present, run the shared motion checks.
8. Capture realistic mobile/desktop visual evidence after implementation.
9. Re-run design review after implementation.
10. Record reviewed Design Intelligence commit SHA: `b647dadff2aea2e360496eef30714770e4f286fe` or newer reviewed SHA in Issue/PR evidence.

A material design change is not complete without this evidence.


## Visual exploration / Framer

When the task is a new visual direction, a major redesign, or the Human explicitly judges the current design as generic/weak, do not converge on one average concept.

Required:
1. Read shared `visual-exploration/WORKFLOW.md`.
2. Explore at least 3 meaningfully different directions before selection, unless the project already has a locked visual authority that makes broad exploration inappropriate.
3. Use relevant shared art-direction files such as `art-direction/EDITORIAL.md`, `PHOTOGRAPHY_LED.md`, `BOLD_TYPOGRAPHY.md`, `ASYMMETRIC_COMPOSITION.md`, `PREMIUM_MINIMAL.md`, or `GRAPHIC_HEAVY.md`.
4. When Framer is used, follow `visual-exploration/FRAMER_LAB.md`. Framer is exploration evidence, not final visual authority.
5. Compare directions using `visual-exploration/SELECTION_CRITERIA.md` and record why the selected direction won.
6. Formalize the selected direction in the project's Figma / approved visual authority before implementation, unless the project explicitly defines another visual SSOT.

Do not use Framer simply because it is available; use it when broader visual exploration is valuable.
