# PAPA CODE — MVP Screen Specification v0.1

Status: FROZEN_WIREFLOW / SCREEN_SPEC_DRAFT  
Date: 2026-09-29  
Figma authority: `[FROZEN] MVP Wireflow v0.5` / node `25:2`

## 1. Canonical MVP stages

The MVP is defined as six common stages, not six visually fixed screens.

```
Home
→ Clarify
→ Context
→ Action
→ Feedback
→ Memory
```

The UI may vary by Intent, but each stage must preserve its role.

## 2. Stage 01 — Home

### Goal
Let the father start from how he feels, what is wrong, or what he wants to do without requiring a well-formed prompt.

### MVP entry choices
- 何をしたらいいか分からない
- 疲れた
- 飲みに行きたい
- 自分の時間がほしい
- 妻が不機嫌 / また怒られた
- 残業になりそう
- 自由に相談する

### Inputs
- selected_intent_candidate
- optional free_text

### Outputs
- intent_candidate
- start_context

### UX rules
- Do not start with a long blank chat box only.
- Allow free text.
- No guilt / permission framing.
- Natural standard Japanese.
- No mascot dependence.

## 3. Stage 02 — Clarify

### Goal
Ask only for missing information required for the selected Intent.

### Inputs
- intent_candidate
- Household Profile
- Schedule
- Household Memory
- current user input

### Outputs
- resolved_intent
- required_context completeness
- unanswered fields

### UX rules
- Never ask for data already known with sufficient confidence.
- Default 1–4 follow-up questions.
- If data is unknown, allow Unknown rather than fabricating.
- Free text may produce Primary Intent + Secondary Intent.

## 4. Stage 03 — Context

### Goal
Organize only the context needed to decide the next action.

This stage changes by Intent.

### Context modes

#### Household Impact
Used for:
- 飲みに行きたい
- 残業になりそう

Show:
- work/tasks that move to another caregiver
- time windows
- preparation / recovery load

#### Priority
Used for:
- 何をしたらいいか分からない

Show:
- what to do now
- what can wait
- what can be skipped

#### Capacity
Used for:
- 疲れた

Show:
- remaining household load
- user's current capacity
- minimum viable household actions

#### Time Opportunity
Used for:
- 自分の時間がほしい

Show:
- low-conflict time candidates
- household tasks colliding with that time
- preparation needed

#### Situation Summary
Used for:
- 妻が不機嫌 / また怒られた

Show:
- verified facts
- recent schedule/load changes
- tasks that shifted
- explicit statements from partner if user provided them

Forbidden:
- inferred anger level
- inferred resentment
- deciding who is right

#### Routed Context
Used for:
- 自由に相談

Intent Router chooses the relevant Context mode.

## 5. Stage 04 — Action

### Goal
Return the smallest useful set of concrete next actions.

### Allowed action types
- 今やる
- 先回りしてやる
- 休む
- 後回し
- やらない
- 伝える
- 代替する
- 回復する

### Output rule
Prefer 1–5 high-impact actions.
Do not dump the full household task model.

### Intent examples
- 飲みに行きたい → 事前準備 + 伝え方 + 必要なら翌日回復
- 疲れた → 最低限 + 休む + 延期
- 妻が不機嫌 / また怒られた → 今できる対応 + 確認の仕方
- 何をすればいいか分からない → 今やる / 後回し / やらない
- 自分の時間がほしい → 確保時間 + 事前調整
- 残業になりそう → 早期共有 + 代替 + 帰宅後/翌日回復

## 6. Stage 05 — Feedback

### Goal
Capture only the result data needed to improve future recommendations.

### Inputs
- event/action execution status
- household outcome
- optional partner response
- optional short note

### MVP questions
- 実行できた？
- 提案したことはどこまでできた？
- 家庭の負担はどうだった？
- 次回もこの提案を使いたい？

### UX rules
- 2–4 taps by default.
- No long survey.
- Partner response is optional and user-reported only.

## 7. Stage 06 — Memory

### Goal
Store reusable household-specific learning, not merely raw chat history.

### Display
- what worked last time
- what did not work
- what to reuse next time

### Example
> 平日の飲み会前は「夕食準備」が特に有効でした。

### UX rules
- User benefit first.
- Avoid technical AI-learning language in the main UI.
- Always allow the user to reject a previous pattern for the current situation.

## 8. Required MVP states

### Intent Router
For free-text consultation.
Output:
- Primary Intent
- optional Secondary Intent
- confidence

### Situation Summary
For conflict/problem situations.
Must separate verified facts from assumptions.

### No-action / Rest
"休む", "今日はやらない", and "延期" are valid Actions.

### Confidence / Unknown
If information is insufficient:
- do not infer
- mark unknown
- ask only when required

## 9. Navigation / IA

MVP primary flow:
```
Home
→ active consultation flow
→ Feedback
→ Memory
```

Supporting areas:
- Household Profile
- History / Memory

Post-MVP candidates:
- Calendar
- Reminder
- Dashboard
- Household余裕 visualization
- Outing proposal

## 10. Freeze constraints

The following require a new Human Gate to change:
- six-stage structure
- seven initial Intent targets
- no partner mood inference
- No-action / Rest as valid action
- minimal follow-up question policy
- Household Memory feedback loop
