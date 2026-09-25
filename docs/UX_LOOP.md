# UX_LOOP — Event Optimization

## Core UX Loop

Upcoming Event
→ Impact Preview
→ Optimize
→ Event
→ Recovery
→ Learn

The product should be useful when a user has something they want to do. It is not a daily chore-tracking habit.

## 1. Event
Start from desire, not duty.

Examples:
- 飲みに行きたい
- 土曜は朝寝坊したい
- ゴルフに行きたい
- 残業したい
- 一人で出かけたい

Preferred first interaction:
> 何したい？

Free text is allowed:
> 土曜13時から友達と遊びたい

## 2. Impact Preview
Translate one personal event into household consequences.

Example:
> 土曜13時から飲み会ですね。
> 今回増えそうな負担は4つあります。

Do not guilt the user.

Forbidden:
- 本当に行きますか？
- 妻への負担が増えます
- 公平ではありません

Preferred:
> 行ける形に整えます。

## 3. Optimize
Show only the highest-leverage actions.

Typical:
1. 昼食まで担当
2. 風呂の準備
3. 翌朝は子ども担当

Limit MVP recommendations to 3–5 actions.

Each action should be:
- concrete
- time-bound where useful
- understandable without a household-management vocabulary
- directly related to predicted load

## 4. Event
The user executes the desired event.

The system should not behave as a permission gate.
The product supports preparation, not authorization.

## 5. Recovery
If there is remaining debt, show recovery actions.

Examples:
- 帰宅後に洗濯を回す
- 翌朝の送迎を引き受ける
- 朝食を準備する

Recovery should not become punishment.

## 6. Learn
After the event, capture minimal feedback.

Examples:
- 予定は実行できた？
- 提案した3つのうち何をやった？
- 次回もこの提案は必要？

Learn household patterns so that the fifth use is clearly more useful than the first.

## MVP interaction cost
Start with one event sentence.

Ask only 1–4 follow-up questions when needed.

One-time profile may include:
- child count / age
- work pattern
- weekday / weekend routine
- usual responsibilities
- wake / sleep times
- daycare / school constraints

Do not ask the partner to configure the product for the father.

## Primary UX principles

### Desire First
Start from:
> 何をしたい？

Not:
> 家族のために何をしますか？

### Consequence Visibility
Make consequences visible without moralizing.

### Preparation, not Permission
Do not ask whether the user deserves to go.

### Small Next Actions
Prefer 3 concrete actions over a dense household dashboard.

### Household Buffer
The UI should help create breathing room, not fully schedule every minute.

### Loose Reciprocity
Support partner free time and recovery without turning the household into a points economy.

### Progressive Disclosure
Internally predict broadly; externally show only what is needed now.

## Anti-patterns
- daily chore dashboard
- fairness scores
- partner mood scores
- household contribution percentages
- guilt copy
- gamification
- streaks
- "good dad" badges
- dense task-management surfaces
- long therapeutic chat as the default
