# PAPA CODE — MVP Data Specification v0.1

Status: DATA_SPEC_DRAFT  
Date: 2026-09-29  
Depends on: `docs/MVP_SCREEN_SPEC_20260929.md`

## 1. Design principle

Do not make the LLM the database.

Use:
- structured household data
- structured task/load data
- structured event/result data
- Household Memory
- LLM for conversation, interpretation, prioritization, and wording

## 2. Core entities

### Household
Represents one household.

Fields:
- household_id
- created_at
- updated_at
- timezone
- locale

### User
MVP payer/user is the father.

Fields:
- user_id
- household_id
- role
- age_range
- work_pattern
- usual_work_start
- usual_work_end
- usual_return_time
- current_fatigue_level
- preferred_tone

### HouseholdMember

Fields:
- member_id
- household_id
- relation
- age
- age_months_optional
- work_or_school_pattern
- relevant_constraints
- preferences

Do not infer sensitive or emotional states unless explicitly provided.

### HouseholdProfile

Fields:
- household_id
- weekday_routine
- weekend_routine
- childcare_arrangement
- usual_task_ownership
- wake_time
- child_bedtime
- daycare_school_constraints
- known_preferences
- known_no_go_conditions

## 3. Task / Load model

### HouseholdTask

Fields:
- task_id
- task_name
- category
- default_duration_minutes
- difficulty
- interruptibility
- timing_window
- age_constraints
- predecessor_task_ids
- successor_task_ids

### TaskLoadVector

Fields:
- task_id
- physical_load
- childcare_load
- cognitive_load
- time_constraint
- coordination_load
- recovery_load
- fatigue_effect
- risk_load
- personal_time_loss

Do not store emotional load as an objective numeric score.

### TaskInstance

Fields:
- task_instance_id
- household_id
- task_id
- date
- planned_owner
- actual_owner
- status
- started_at
- completed_at
- context_note

## 4. Intent model

### Consultation

Fields:
- consultation_id
- household_id
- user_id
- started_at
- source
- raw_user_input
- primary_intent
- secondary_intent_optional
- intent_confidence
- current_stage
- status

Initial Intent enum:
- WHAT_SHOULD_I_DO
- TIRED
- WANT_TO_DRINK
- WANT_PERSONAL_TIME
- PARTNER_UNHAPPY_OR_CONFLICT
- OVERTIME
- FREE_CONSULT

### ContextRequirement

Fields:
- consultation_id
- key
- value
- source
- confidence
- required
- freshness
- status

Source enum:
- USER_INPUT
- HOUSEHOLD_PROFILE
- SCHEDULE
- TASK_MODEL
- MEMORY
- DERIVED

Unknown is valid.

## 5. Schedule model

MVP does not require external calendar integration.

### ScheduleItem

Fields:
- schedule_item_id
- household_id
- owner_member_id
- start_at
- end_at
- item_type
- title
- flexibility
- source

MVP source may be:
- manually entered
- derived from consultation
- profile routine

## 6. Context output

### ContextSnapshot

Fields:
- consultation_id
- mode
- generated_at
- verified_facts
- unknowns
- relevant_tasks
- relevant_schedule_items
- load_changes
- capacity_state
- priority_state

Mode enum:
- HOUSEHOLD_IMPACT
- PRIORITY
- CAPACITY
- TIME_OPPORTUNITY
- SITUATION_SUMMARY
- ROUTED_CONTEXT

All claims about partner emotion must remain user-reported, not inferred.

## 7. Action model

### ActionProposal

Fields:
- action_proposal_id
- consultation_id
- action_type
- title
- description
- target_time_optional
- estimated_minutes_optional
- related_task_ids
- expected_load_reduction
- effort
- confidence
- reason
- status
- rank

Action type enum:
- DO_NOW
- PREPARE_AHEAD
- REST
- DEFER
- SKIP
- COMMUNICATE
- SUBSTITUTE
- RECOVER

Ranking:
1. impact reduction
2. effort
3. timing
4. confidence
5. household fit

UI normally shows only top 1–5.

## 8. Communication support

### CommunicationDraft

Fields:
- consultation_id
- purpose
- message
- includes_load_acknowledgement
- includes_preparation
- includes_alternative
- includes_recovery_optional

Rules:
- no manipulation
- no "how to avoid wife getting angry"
- no claim about what partner feels
- no permission framing

## 9. Feedback / outcome

### ConsultationOutcome

Fields:
- consultation_id
- intent_executed
- actions_executed
- household_load_outcome
- partner_response_user_reported_optional
- user_burden
- household_atmosphere_user_reported_optional
- reusable_next_time
- free_note_optional
- captured_at

## 10. Household Memory

### MemoryItem

Fields:
- memory_id
- household_id
- memory_type
- subject
- statement
- source_consultation_id
- confidence
- importance
- valid_from
- last_confirmed_at
- superseded_by_optional

Memory type enum:
- HOUSEHOLD_ATTRIBUTE
- ROUTINE
- TASK_OWNERSHIP
- PREFERENCE
- FATIGUE_PATTERN
- CONFLICT_PATTERN
- SUCCESS_PATTERN
- FAILURE_PATTERN
- SCHEDULE_PATTERN

High-value Memory is outcome-backed:
```
situation
→ proposal
→ actual action
→ result
→ learning
```

Raw conversation history is not sufficient by itself.

## 11. AI orchestration contract

```
User Input
→ Intent Router
→ Context Selector
→ Structured Retrieval
→ Missing-data Question
→ Context Snapshot
→ Action Ranking
→ Response Generation
→ Outcome Capture
→ Memory Update
```

### LLM responsibilities
- classify intent
- identify missing context
- summarize verified situation
- prioritize actions
- phrase recommendations
- generate communication draft
- propose memory candidates

### Deterministic / structured responsibilities
- household profile storage
- task/load master
- schedule storage
- action schema validation
- confidence/unknown handling
- memory persistence
- auditability

## 12. MVP minimum data required

To begin using:
- child count / age
- basic work pattern
- normal return time
- basic weekday routine
- usual responsibilities

Do not require the partner to configure the system.

## 13. Privacy-sensitive design rules

Before production, Human review is required for:
- privacy policy
- retention period
- deletion/export
- model-provider data handling
- partner-related data policy
- consent wording

Do not store inferred diagnosis, relationship quality, or partner mental state.

## 14. Post-MVP extensions

Not required for first MVP:
- external calendar sync
- push reminder engine
- monthly dashboard
- household余裕 score
- outing/local-data ingestion
- partner account
- cross-household learning/fine-tuning
