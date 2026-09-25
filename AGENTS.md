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

For material UI/design changes, read `docs/design/DESIGN_CONTEXT.md` and consult `natanata8/design-intelligence` as a secondary design-quality authority. Project-specific canonical state, approved visual authority, active Issues, explicit Human decisions and HUMAN_REQUIRED boundaries always outrank shared design guidance.

## Project authority

- GitHub `natanata8/papa-life-optimizer` is the canonical development state for this project.
- Product goal: help fathers raising children protect personal time while keeping household operations practical and reducing avoidable household friction.
- Project-specific Goal / KPI / Scope / Human decisions override global defaults where more specific.
- Do not turn the product into a generic parenting, chore-tracking, or therapy product unless the project direction explicitly changes.

## Operating rule

Prefer practical, low-friction, reversible product experiments over broad feature expansion. Preserve important Human taste, family-context, production, payment, privacy, legal, or irreversible decisions as HUMAN_REQUIRED.

As the project grows, create and maintain a concise canonical handoff under `docs/CURRENT_HANDOFF.md` rather than relying on chat history.
