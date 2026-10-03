# Issue #19 — Three-account strategy, automation and measurement

Status: **AI_PROPOSAL / DESIGN ONLY**. No accounts, credentials, publisher, storage service, paid plan or scheduled automation has been configured.

## Three total accounts

Issue #19 fixes three founders and one account per person. This proposal uses **A: X; B: Instagram; C: Instagram**. It does not multiply the accounts across platforms. The Human team may prefer all three on Instagram for a cleaner platform comparison; that trades simpler comparison for slower text iteration. Choose the platform mix and founder assignment before creating accounts.

Founder names and personalities are not inferred. Each founder should choose a role they can genuinely sustain. No synthetic biography, credential, parenting experience or personal story is allowed.

| Role | One-line promise draft | Target and tone | Pillars | Unique work | Shared work |
|---|---|---|---|---|---|
| A: household coordination | 予定の前後を、短く具体的に整える。 | Fathers with an upcoming personal/work plan; calm, concise, practical. | Timing; uncertainty; handoff; actual outcome. | Original event examples, short wording alternatives, decisions with missing context. | Source register, brand QA, generic template structure, measurement schema. |
| B: father-led time | 子どもとの時間を、準備から帰宅後まで。 | Fathers planning a block of care/play; approachable, concrete, modest. | Before leaving; bounded activity; handoff; return/reset. | Anonymous time-window demonstrations and father-led preparation. | Research facts and QA rules, never another founder's personal identity. |
| C: practical completion | 次の予定までに、家の一仕事を終える。 | Fathers wanting an immediately usable preparation; matter-of-fact, hands-on. | Inventory; meal decisions; remaining steps; cleanup/reuse. | Tested adult-hand demos and complete-task checklists. | Source/provenance format and reusable empty layouts. |

The three audiences overlap. Differentiation is the job each post helps with, not a fictitious demographic split. B and C must keep an explicit before/after-plan link to avoid turning the project into a general parenting or cooking publisher.

### Posting mix and CTAs

- A backlog: text plus occasional attached blank cards. Start with text only to minimize asset work.
- B backlog: carousels, simple images and short scripts. Use diagrams, props or adult hands; no real child imagery or household-identifying background.
- C backlog: practical carousels and hand demonstrations. No copied recipes; ingredient, appliance, storage, cleaning and craft-safety details need verification and testing if later included.
- Save/revisit CTA: only when the post is actually reusable.
- Discussion CTA: one concrete optional question, such as which stage is hard. Do not ask for a child's name, age/date of birth, location, school or a partner's private story.
- Product CTA: disabled until an approved, working destination accurately describes current product status. A concept cannot say “the app remembers your household” as an available fact.
- No auto-DM keyword funnel in Phase 1. A public example of that mechanism is not approval to operate it.

### Cross-posting rules

Share source facts, metadata, QA and production tools. Each founder owns a different scenario, opening, example and intended action. Do not publish identical or lightly paraphrased posts across founder accounts, coordinate likes/reposts, or manufacture conversation. Same theme is allowed only when it serves a genuinely distinct task. Credit permitted references; do not reproduce creator artwork, scripts, captions, recipes or likenesses.

If one creator idea seems useful for multiple roles, give it one publishing owner first. The other roles can test an independent question later. Repurposing between platforms is a later decision, not three extra accounts.

[X automation rules](https://help.x.com/en/rules-and-policies/x-automation?lang=browser) prohibit duplicative automated use cases and substantially similar posts across managed accounts. [X authenticity rules](https://help.x.com/en/rules-and-policies/authenticity) also restrict coordinated amplification. Distinct roles are a compliance prerequisite, not a guarantee of approval.

## Bounded first experiment

AI_PROPOSAL: four weeks after the Human launch gate, two reviewed posts per account per week, eight per account total. This is an initial learning batch, not an approved schedule or a minimum posting obligation.

For each account, choose four topic situations and make two original hook variants. Keep format, approximate publication window and CTA as comparable as feasible. Rotate the order. Do not publish variants so close that they become near-duplicates; differences must be substantive and useful.

Measure within-account patterns first. A on X and B/C on Instagram confound audience, creator, format and platform; their totals cannot identify a causal winner. Do not infer success from a single unusually popular post.

Before launch: confirm founder fit, review capacity, realistic frequency and working links. If review becomes burdensome, reduce volume before reducing the Human Gate. The 90 ideas are a reusable backlog; they are not a commitment to publish all of them.

## Current platform constraints checked October 3, 2026

### Instagram

Meta's [official API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) describes publishing for Professional accounts, with different Instagram Login and Facebook Login setups. The Facebook Login route requires a linked Page and does not access consumer accounts. Instagram Login uses its own business scopes. Stories eligibility differs from other media. Use the chosen route's actual current permissions, account type and app-review requirements; do not combine scope names from both routes.

Publication uses media/container preparation followed by publishing. Inspect processing state before submission. Confirm supported media formats, current quotas and insight fields with the selected API version before implementation. The collection supports insights and management of the owner's presence; it does not grant arbitrary competitor private analytics.

Direct Meta documentation failed through the web retrieval tool in this pass. The official Meta collection was readable. No exact numeric publishing quota is asserted here, and no permissions were requested.

### X

[Current pricing](https://docs.x.com/x-api/getting-started/pricing) is pay-per-use. On the checked page, Post read was $0.005/resource, ordinary Post create $0.015/request and Post create with URL $0.200/request. Recheck at implementation; no credits or payment approval exists.

Illustration, not a budget: 100 post reads would be $0.50 in that single read category. Eight ordinary writes would be $0.12; eight URL-bearing writes $1.60. These exclude user lookups, media/actions, metric refreshes, provider charges and any other charges. Paid access requires Human approval, even if small.

[X metrics documentation](https://docs.x.com/x-api/fundamentals/metrics) separates public and user-context metrics. URL/profile clicks require owner-context access. Non-public, organic and promoted metrics are limited to posts created within 30 days. Capture approved first-party snapshots promptly; keep exact field names and distinguish impressions from unique reach. Do not extrapolate unavailable private metrics.

### TikTok

[Direct Post guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines?enter_method=left_navigation) exclude a utility restricted to your own team's accounts. Unaudited clients have private-viewing restrictions and require a compliant audit for broader publication. Do not assume a three-person internal publisher qualifies.

The [upload flow](https://developers.tiktok.com/docs/en/content-posting-api-get-started-upload-content) can hand editing/posting back to the creator, with the relevant approved scope and consent. It is not unattended publishing. Evaluate a compliant existing tool or manual export later; no tool purchase is proposed.

[TikTok's Research API FAQ](https://developers.tiktok.com/docs/en/research-api-faq) says creators, advertisers and commercial users are not eligible for those Research Tools. Do not make that API the pilot's competitor-research dependency.

## Shared automation design

One pipeline with three voice configurations; no three separate stacks.

1. **Source collection** — approved public sources or authorized owned-account exports. Store canonical URL, publication date, observed date, language, access method, read depth, rights/use notes, and explicit unavailable fields. Deduplicate by platform ID. Public browser reads are a small research method, not a production scraping architecture.
2. **Classification** — topic, event relation, context needed, phase (before/during/after), format, language, sponsored/pinned/repost flag and evidence status. Exclude irrelevant, medical, legal, child-identifying and diagnosis-led material.
3. **Draft generation** — propose an original concept from a pattern. Separate cited facts from proposed actions; never turn a source anecdote into a founder experience. Assign one account owner.
4. **Brand QA** — hard checks plus contextual review. No blame, permission framing, partner-emotion inference, guilt, moral/fairness score, wife-management framing, fabricated experience, unsupported effect or live-capability claim.
5. **Assets/scripts** — generate only from approved copy and rights-cleared material. Use anonymous mock data and adult props. Check every panel, alt text, subtitle and audio claim. Image generation does not prove the copy is correct.
6. **Human review** — every post in Phase 1, including low-risk ones. Show exact account/platform, final text, assets, source links, risk flags, link destination and proposed time. Relationship-sensitive items get explicit attention. Approvals attach to the exact content hash and destination.
7. **Schedule/publish** — absent by default. Only authorized, Human-approved final content can enter the queue. Any edit to text, media, URL, account or material timing invalidates approval. Recheck API capability and link destination. Maintain a global and per-account pause switch.
8. **Metrics** — read owned-account metrics under approved access. Log exact field, denominator, collection time and completeness. Missing is not zero.
9. **Weekly learning** — a short evidence table proposes the next topics and potential MVP tests. It never silently changes Product/KPI/scope or promotes a hypothesis to VALIDATED.

### Proposed records and states

Content record: content_id; account_role; platform; topic; event_phase; hook_family; format; hypothesis_id; source_ids; claim_status; risk_flags; draft_version; asset_version; content_hash; reviewer; review_decision; approved_destination; planned_time; publication_id; publication_url; publication_state; metric_snapshots.

States: DRAFT → QA_BLOCKED or READY_FOR_REVIEW → REJECTED or APPROVED → QUEUED → PUBLISHING → PUBLISHED/FAILED/UNKNOWN_RESULT. An unknown publish result must be reconciled by platform ID/status before retrying. Never blindly retry and create duplicates.

No tokens in GitHub, source records or prompts. Production credential storage, model provider, retention and access are Human gates. This is a schema proposal, not authorization to create persistent access.

### Privacy boundary

The repository is public. Store only original drafts, public creator references, coarse aggregate counts and methodological notes. No raw DMs, comment bodies, partner records, child identifiers, user-level click trails, persistent engagement identities or private analytics exports in this repository.

Phase 1 learning can use de-identified theme counts manually reviewed before documentation. Consent, retention, source storage, deletion, third-party model use and pseudonymous repeat-engagement tracking must be decided before ingesting personal responses. Until then, repeat engagement is unavailable or platform-aggregate only. Do not transform publicly visible child details into a dataset.

### Failure handling

- Source inaccessible: record unavailable and continue other authorized sources; no access bypass.
- Fact or safety claim unsupported: block draft, not soften into vague certainty.
- Reviewer rejects: revise; never self-approve.
- Approval stale after edit: return to review.
- OAuth scope/account mismatch: stop publisher; do not request broader access automatically.
- Rate limit: respect retry-after/backoff and approved spend cap.
- Timeout after submit: reconcile result before any retry.
- Broken CTA, wrong destination or ambiguous account: block publishing.
- Harmful or privacy-sensitive reply: route to Human; no automatic diagnosis, advice or public response.

## Measurement plan

Canonical North Star remains Balanced Freedom Event Rate. 30-day second real-event use remains the existing validation hypothesis. SNS metrics are diagnostic inputs, not replacements.

| Measure | Definition / source | Important limitation |
|---|---|---|
| Saves/bookmarks | Owned-platform field divided by that platform's stated exposure denominator when available. | IG saves and X bookmarks differ; never combine blindly. |
| Shares/reposts | Preserve platform-specific fields and distinguish private sharing from public reposts. | Competitor private shares unavailable. |
| Quality comments | Human-coded concrete situation, useful question, reported attempt or contextual correction. Report count and denominator. | Humor, generic praise and argument are separate; volume is not usefulness. |
| DMs | Count voluntarily supplied relevant themes after approved privacy handling. | Not authorization to collect or publish private stories. |
| Repeat engagement | Aggregate/platform-supported repeat signal, or approved pseudonymous measure later. | No identity tracking in current design implementation. |
| Profile visits | Owned account/post field, with exact level and reporting window. | Account-period visits cannot be attributed to a post without evidence. |
| Link clicks | Owner analytics or approved landing-page events; unique/non-unique explicitly marked. | Do not equate click with qualified user or consent. |
| Follows | Post-attributed where supported; otherwise account net change over time. | Net change does not identify individual-post causality. |
| Qualified interest | Voluntary selection of a real upcoming household-related situation, using an approved minimal path. | Do not collect family details in public comments. |
| Product behavior | First real-event completion and later second use within 30 days, once a real instrumented product exists. | Unavailable now; social reactions cannot stand in for it. |
| Effort and safety | Review minutes, revision rate, source failures, blocked drafts, complaints and privacy incidents. | Operational measures, not a new canonical business KPI. |

Collect proposed snapshots at approximately 24 hours and seven days after each approved post; retain the actual timestamps. This is a design, not a scheduled automation. Compare similar post ages and separate sponsored, pinned and reposted material. Never backfill missing first-day values from current totals.

For rates, expose numerator and denominator. If denominator is unavailable or zero, report unavailable, not a calculated zero. Use medians and ranges within an account when enough observations exist; avoid decimal precision on tiny samples.

### Weekly learning record

For each topic: published count, actual exposure fields, saves/shares/comments/clicks with availability, quality-comment themes, review effort, safety issues, alternative explanations, next action and evidence state. A top post triggers a replication hypothesis, not a scale decision.

MVP feedback: link A to A-002/event entry and clarification; B to real care windows/handoff context; C to before/after completion and recovery. Potential A-003/second-use insight requires actual product use. Name proposed scenario changes as AI_PROPOSAL and return them to Product Lane; do not broaden MVP because a recipe or family video is popular.

## Builder handoff, after review

No implementation starts from this document automatically. The following are bounded candidate tasks for Cursor, preserving the user's think/spec versus implementation split:

1. Offline content manifest and validator. Accepts three account configs and synthetic inputs; rejects missing provenance, unavailable-to-zero coercion, duplicate IDs and public personal data. No network or publisher.
2. Review queue contract. Every Phase 1 item requires explicit approval of exact hash/account/destination; edits invalidate it. Tests include cross-account mistakes and rejected drafts.
3. Dry-run publisher adapter. No credentials or real posts; tests pending/failed/unknown results and duplicate suppression.
4. Metrics importer from approved de-identified fixture exports. Preserves raw field names, timestamps, missing values and account-level versus post-level differences.
5. Human-gated integration assessment. Confirm selected platform/API version, current quotas, scope, costs and data handling before any credentials, real publishing or private-data ingestion.

Exit evidence for a later build: fixtures and tests for all gates, no real external writes, and independent review against Issue #19. No main-branch write, merge or production action is authorized by this handoff.
