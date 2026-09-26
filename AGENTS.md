# Papa Life Optimizer executor instructions

## Global AI Operating System

Canonical global protocol: `natanata8/ai-operating-system`  
Pinned protocol version: `1.0.1`

Apply the global protocol for shared decision quality, research, handoff, AUTO-CONTINUE, and HUMAN_REQUIRED defaults.

Precedence:
1. explicit current Human instruction and authority boundaries;
2. this repository's project-specific canonical rules, decisions, specs, and active Issue;
3. global AI Operating System v1.0.1;
4. chat history and inferred preferences.

Project-specific rules in this repository override the global protocol where they are more specific.

### Protocol read cadence

Do not re-fetch the global protocol on every reply. Read or refresh it when:
- starting or resuming substantial project work in a new chat/session;
- the pinned global version changes;
- making a consequential decision when the rules are not already loaded or may be stale;
- project Goal/KPI/Scope, HUMAN_REQUIRED boundaries, or canonical handoff changes;
- handing work to another executor or migrating to a new chat.

During a continuous session, apply the already-loaded rules. Re-check current GitHub/runtime state separately whenever the answer depends on facts that may have changed.

If an executor cannot read the private global repository, do not block solely for that reason. Local fallback:
- optimize for explicit Goal / KPI rather than agreement with the proposed method;
- challenge assumptions and check for simpler, higher-value alternatives;
- verify consequential/current facts with external evidence where practical;
- use primary data plus real-user/community evidence when relevant, without treating anecdotes as facts;
- explore cross-domain or experimental ideas when useful, but do not prefer novelty over expected value;
- prefer reversible experiments under uncertainty;
- keep durable state in GitHub and avoid using Human as an AI-to-AI transport layer.

## Design Intelligence

For any material UI/design generation, Figma proposal or revision, implementation of an approved design, meaningful interaction/motion change, or visual QA, reading `docs/design/DESIGN_CONTEXT.md` is mandatory.

The agent must consult relevant files in `natanata8/design-intelligence`, record the applied shared principles and local overrides, run the shared Design Review + AI-slop check, perform motion review when applicable, capture visual evidence, and record the reviewed Design Intelligence commit SHA in the material design Issue/PR.

Project-specific canonical state, approved Figma/visual authority, active Issues, explicit Human decisions and HUMAN_REQUIRED boundaries always outrank shared design guidance.

## Project authority

- GitHub `natanata8/papa-life-optimizer` is the canonical development state for this project.
- Product goal: start from a father's desired personal event, predict the hidden household impact it creates, and reduce/absorb that impact so personal time and household buffer can coexist.
- Project-specific Goal / KPI / Scope / Human decisions override global defaults where more specific.
- Do not turn the product into a generic parenting, chore-tracking, or therapy product unless the project direction explicitly changes.

## Canonical product documents

Before substantial product, UX, design, Framer or implementation work, read:
- `docs/PRODUCT_CONCEPT.md`
- `docs/LOAD_MODEL.md`
- `docs/UX_LOOP.md`
- `docs/CURRENT_HANDOFF.md`
- `docs/design/DESIGN_CONTEXT.md`

Core product mechanism:
`Personal Event → Household Impact → Load Absorption`

Brand principle:
`責めない。止めない。先回りする。`

Do not expand into a full household OS until the Personal Event → Household Impact loop is validated.

## Business decision protocol

Before substantial business-model, monetization, positioning, KPI, acquisition, or validation work, read:
- `docs/business/BUSINESS_DECISION_PROTOCOL.md`
- `docs/business/BUSINESS_MODEL_STATUS.md`
- `docs/business/ASSUMPTIONS.md`

Required rule:
- distinguish `DECIDED`, `HUMAN_HYPOTHESIS`, `VALIDATED`, `AI_PROPOSAL`, and `UNKNOWN`
- never turn plausible AI output into an apparent Human decision
- do not fill unknowns merely to make the plan look complete
- present unresolved consequential decisions as bounded options with trade-offs and validation evidence
- Human decides Goal / KPI / consequential business choices; research, comparison, validation design, classification, and documentation should AUTO-CONTINUE
- separate business reasoning from polished writing; apply writing rules only after decision state is clear

## Writing policy

Before creating or materially revising user-facing prose, read all files under `docs/writing/`: `STYLE_GUIDE.md`, `VOICE.md`, `AI_TELLS.md`, `GOOD_EXAMPLES.md`, `BAD_EXAMPLES.md`, and `REVIEW_RUBRIC.md`. Preserve the product's non-judgment and no-emotion-diagnosis boundaries. Run Vale on changed Markdown. Do not use AI-detector scores as a quality or release gate.

## Operating rule

Prefer practical, low-friction, reversible product experiments over broad feature expansion. Preserve important Human taste, family-context, production, payment, privacy, legal, or irreversible decisions as HUMAN_REQUIRED.

As the project grows, create and maintain a concise canonical handoff under `docs/CURRENT_HANDOFF.md` rather than relying on chat history.
