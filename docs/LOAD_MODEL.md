# LOAD_MODEL — Household Load Vector

## Purpose
Represent household impact as a vector, not one universal burden score.

The model exists to predict the consequences of a personal event and select a small number of high-leverage actions.

## Household Load Vector

### 1. Physical Load
Visible household work.
Examples:
- cooking
- dishes
- cleaning
- laundry
- preparation

### 2. Childcare Load
Direct care.
Examples:
- meals
- dressing
- bathing
- bedtime
- transport
- supervision
- play / engagement

### 3. Cognitive Load
Thinking work required to keep the household functioning.
Examples:
- remembering
- anticipating needs
- planning
- deciding
- arranging
- monitoring outcomes

### 4. Time Constraint
Not just hours of work, but periods when a person cannot freely use their time.
Examples:
- solo-childcare windows
- fixed pickup times
- bedtime windows
- waiting / supervision

### 5. Coordination Load
Work created by handoff and scheduling.
Examples:
- deciding who does what
- schedule changes
- communication
- handover
- contingency planning

### 6. Recovery Load
Debt that remains after the event.
Examples:
- dishes
- laundry
- next-morning preparation
- delayed chores
- unfinished childcare tasks

### 7. Sleep / Fatigue
Expected reduction in household capacity due to sleep or physical fatigue.
This is operational context, not medical diagnosis.

### 8. Risk Load
How fragile the plan is to disruption.
Examples:
- child illness
- late return
- missed nap
- bad weather
- no backup adult
- overloaded evening window

### 9. Personal-Time Loss
How much the event removes discretionary time from the partner or other caregiver.

## Emotional Load
Do NOT convert emotional load into a numeric score.

Allowed:
- user-provided context
- explicit partner preferences
- repeated coordination history
- factual event history

Disallowed:
- "partner anger score"
- "relationship stress score"
- inferred resentment
- inferred fairness judgment

Emotional context can influence wording and recommendations, but must not be presented as objective measurement.

## Time horizon
Default prediction horizon:
T-1 → Event → T+1

For a Sunday golf event, the model may inspect:
- previous evening preparation
- event morning
- absence period
- return period
- next morning recovery

The model may reason broadly internally, but the UI should normally show only the most relevant 3–5 actions.

## Internal event model
CONTEXT
→ BEFORE
→ ABSENCE / DURING
→ RECOVERY
→ RESTORE BUFFER

### CONTEXT
Known household state and routines.

### BEFORE
Work that can remove expected impact before the event.

### ABSENCE / DURING
Load that remains while the father is unavailable.

### RECOVERY
Tasks and fatigue that remain after the event.

### RESTORE BUFFER
Optional actions that rebuild household capacity after a high-load event.

Avoid transactional "3 hours borrowed = 3 hours returned" logic.

Use loose reciprocity:
> When one person takes more freedom now, restore household capacity elsewhere when useful.

Restoration can occur through:
- tasks
- childcare ownership
- next-morning coverage
- partner free time
- preparation

## Recommendation policy
Do not show the entire vector by default.

Rank actions by:
1. impact reduction
2. effort
3. timing
4. confidence
5. household fit

Then show the smallest useful set.

Typical output:
> 今回増えそうな負担は4つ。
> 先にこの3つを整えるとかなり軽くできます。

The product is preparation, not permission.
