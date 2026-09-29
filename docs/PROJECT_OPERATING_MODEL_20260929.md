# PAPA CODE — Project Operating Model

Status: HUMAN_DECIDED  
Date: 2026-09-29

## Roles

- ChatGPT Main = Project Manager / Brain
- Cursor = Builder / implementation executor
- Review ChatGPT = independent Reviewer
- GitHub = SSOT
- Human = Goal / KPI / consequential decisions / discomfort signals

## Main ChatGPT responsibilities

Maintain:
1. Project Goal
2. Current state
3. Completed
4. Incomplete
5. Blockers
6. Next work
7. Goal passed to Cursor
8. HUMAN_REQUIRED

Do not re-implement Cursor's work in Main Chat after Cursor reports completion.

## Cursor responsibilities

Before implementation:
- read GitHub current state, relevant Issues / PRs / docs / code
- choose technical implementation details based on repository reality

Instructions from Main should emphasize:
- what to achieve
- why it matters
- what to verify
- completion criteria
- prohibited changes
- HUMAN_REQUIRED conditions

Avoid unnecessary micromanagement of implementation details from Main.

## Review ChatGPT responsibilities

Independently review:
- user perspective
- UX
- design
- spec alignment
- goal alignment
- omissions
- whether the result is actually good, not merely technically correct

Minor issues return to Cursor.

## Human Gate

HUMAN_REQUIRED only for:
- Goal change
- KPI change
- material scope / architecture change that changes product intent
- irreversible changes
- privacy / legal / payment decisions
- final production publish / deploy
- explicit taste or discomfort decisions that cannot be resolved from canonical evidence

## Default loop

```
Main defines Goal
→ Cursor builds
→ Cursor records evidence in GitHub
→ Main summarizes result
→ Review Chat independently reviews when useful
→ Minor issues return to Cursor
→ Human Gate only for consequential decisions
```

## SSOT rule

Durable project state belongs in GitHub.
Chat history is not canonical.
