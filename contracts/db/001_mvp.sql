-- PAPA CODE MVP persistence contract
-- Dialect: PostgreSQL 15+
-- Apply to a development database only. This file is not a production migration.
--
-- Absent on purpose: numeric emotion columns, mood scores, fairness scores,
-- external calendar sync, and partner login.

CREATE TABLE households (
  household_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  timezone text NOT NULL DEFAULT 'Asia/Tokyo',
  locale text NOT NULL DEFAULT 'ja-JP'
);

CREATE TABLE users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (household_id),
  role text NOT NULL DEFAULT 'FATHER' CHECK (role IN ('FATHER')),
  age_range text,
  work_pattern text,
  usual_work_start time,
  usual_work_end time,
  usual_return_time time,
  current_fatigue_level smallint CHECK (
    current_fatigue_level IS NULL OR current_fatigue_level BETWEEN 0 AND 3
  ),
  preferred_tone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE household_members (
  member_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (household_id),
  relation text NOT NULL CHECK (relation IN ('PARTNER', 'CHILD', 'OTHER')),
  age smallint,
  age_months smallint,
  work_or_school_pattern text,
  relevant_constraints text,
  preferences text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE household_profiles (
  household_id uuid PRIMARY KEY REFERENCES households (household_id),
  weekday_routine text,
  weekend_routine text,
  childcare_arrangement text,
  usual_task_ownership text,
  wake_time time,
  child_bedtime time,
  daycare_school_constraints text,
  known_preferences text,
  known_no_go_conditions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE household_tasks (
  task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name text NOT NULL,
  category text NOT NULL,
  default_duration_minutes integer,
  difficulty smallint CHECK (difficulty IS NULL OR difficulty BETWEEN 0 AND 3),
  interruptibility text,
  timing_window text,
  age_constraints text,
  predecessor_task_ids uuid[] NOT NULL DEFAULT '{}',
  successor_task_ids uuid[] NOT NULL DEFAULT '{}'
);

CREATE TABLE task_load_vectors (
  task_id uuid PRIMARY KEY REFERENCES household_tasks (task_id),
  physical_load smallint CHECK (physical_load IS NULL OR physical_load BETWEEN 0 AND 3),
  childcare_load smallint CHECK (childcare_load IS NULL OR childcare_load BETWEEN 0 AND 3),
  cognitive_load smallint CHECK (cognitive_load IS NULL OR cognitive_load BETWEEN 0 AND 3),
  time_constraint smallint CHECK (time_constraint IS NULL OR time_constraint BETWEEN 0 AND 3),
  coordination_load smallint CHECK (coordination_load IS NULL OR coordination_load BETWEEN 0 AND 3),
  recovery_load smallint CHECK (recovery_load IS NULL OR recovery_load BETWEEN 0 AND 3),
  fatigue_effect smallint CHECK (fatigue_effect IS NULL OR fatigue_effect BETWEEN 0 AND 3),
  risk_load smallint CHECK (risk_load IS NULL OR risk_load BETWEEN 0 AND 3),
  personal_time_loss smallint CHECK (personal_time_loss IS NULL OR personal_time_loss BETWEEN 0 AND 3)
);

CREATE TABLE task_instances (
  task_instance_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (household_id),
  task_id uuid NOT NULL REFERENCES household_tasks (task_id),
  occurs_on date NOT NULL,
  planned_owner uuid REFERENCES household_members (member_id),
  actual_owner uuid REFERENCES household_members (member_id),
  status text NOT NULL CHECK (status IN ('PLANNED', 'DONE', 'SKIPPED', 'DEFERRED')),
  started_at timestamptz,
  completed_at timestamptz,
  context_note text
);

CREATE TABLE consultations (
  consultation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (household_id),
  user_id uuid NOT NULL REFERENCES users (user_id),
  started_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('HOME_CHOICE', 'FREE_TEXT')),
  entry_choice text,
  raw_user_input text,
  primary_intent text CHECK (
    primary_intent IS NULL OR primary_intent IN (
      'WHAT_SHOULD_I_DO',
      'TIRED',
      'WANT_TO_DRINK',
      'WANT_PERSONAL_TIME',
      'PARTNER_UNHAPPY_OR_CONFLICT',
      'OVERTIME',
      'FREE_CONSULT'
    )
  ),
  secondary_intent text CHECK (
    secondary_intent IS NULL OR secondary_intent IN (
      'WHAT_SHOULD_I_DO',
      'TIRED',
      'WANT_TO_DRINK',
      'WANT_PERSONAL_TIME',
      'PARTNER_UNHAPPY_OR_CONFLICT',
      'OVERTIME',
      'FREE_CONSULT'
    )
  ),
  intent_confidence numeric(3, 2) CHECK (
    intent_confidence IS NULL OR (intent_confidence >= 0 AND intent_confidence <= 1)
  ),
  current_stage text NOT NULL CHECK (
    current_stage IN ('HOME', 'CLARIFY', 'CONTEXT', 'ACTION', 'FEEDBACK', 'MEMORY')
  ),
  status text NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED'))
);

CREATE TABLE consultation_turns (
  turn_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations (consultation_id),
  stage text NOT NULL CHECK (
    stage IN ('HOME', 'CLARIFY', 'CONTEXT', 'ACTION', 'FEEDBACK', 'MEMORY')
  ),
  role text NOT NULL CHECK (role IN ('USER', 'SYSTEM')),
  raw_text text,
  structured_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE context_requirements (
  context_requirement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations (consultation_id),
  key text NOT NULL,
  value_json jsonb,
  source text CHECK (
    source IS NULL OR source IN (
      'USER_INPUT',
      'HOUSEHOLD_PROFILE',
      'SCHEDULE',
      'TASK_MODEL',
      'MEMORY',
      'DERIVED'
    )
  ),
  confidence numeric(3, 2),
  required boolean NOT NULL,
  freshness text,
  status text NOT NULL CHECK (status IN ('KNOWN', 'UNKNOWN', 'NOT_REQUIRED')),
  CHECK (
    key NOT IN (
      'partner_feeling',
      'partner_mood',
      'who_is_right',
      'fairness',
      'fairness_score',
      'anger_score',
      'relationship_quality',
      'emotional_load'
    )
    OR (status = 'UNKNOWN' AND value_json IS NULL)
  )
);

CREATE TABLE schedule_items (
  schedule_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (household_id),
  owner_member_id uuid REFERENCES household_members (member_id),
  start_at timestamptz,
  end_at timestamptz,
  item_type text NOT NULL,
  title text NOT NULL,
  flexibility text,
  source text NOT NULL CHECK (source IN ('MANUAL', 'CONSULTATION', 'PROFILE_ROUTINE'))
);

CREATE TABLE context_snapshots (
  consultation_id uuid PRIMARY KEY REFERENCES consultations (consultation_id),
  mode text CHECK (
    mode IS NULL OR mode IN (
      'HOUSEHOLD_IMPACT',
      'PRIORITY',
      'CAPACITY',
      'TIME_OPPORTUNITY',
      'SITUATION_SUMMARY',
      'ROUTED_CONTEXT'
    )
  ),
  generated_at timestamptz NOT NULL DEFAULT now(),
  verified_facts jsonb NOT NULL DEFAULT '[]',
  unknowns jsonb NOT NULL DEFAULT '[]',
  relevant_tasks jsonb NOT NULL DEFAULT '[]',
  relevant_schedule_items jsonb NOT NULL DEFAULT '[]',
  load_changes jsonb NOT NULL DEFAULT '[]',
  capacity_state text,
  priority_state text
);

CREATE TABLE action_proposals (
  action_proposal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations (consultation_id),
  action_type text NOT NULL CHECK (
    action_type IN (
      'DO_NOW',
      'PREPARE_AHEAD',
      'REST',
      'DEFER',
      'SKIP',
      'COMMUNICATE',
      'SUBSTITUTE',
      'RECOVER'
    )
  ),
  title text NOT NULL,
  description text NOT NULL,
  target_time timestamptz,
  estimated_minutes integer,
  related_task_ids uuid[] NOT NULL DEFAULT '{}',
  expected_load_reduction jsonb NOT NULL DEFAULT '[]',
  effort text CHECK (effort IS NULL OR effort IN ('LOW', 'MEDIUM', 'HIGH')),
  confidence numeric(3, 2),
  reason text,
  status text NOT NULL CHECK (status IN ('PROPOSED', 'ACCEPTED', 'REJECTED', 'DONE')),
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 5)
);

CREATE TABLE communication_drafts (
  consultation_id uuid PRIMARY KEY REFERENCES consultations (consultation_id),
  purpose text NOT NULL,
  message text NOT NULL,
  includes_load_acknowledgement boolean NOT NULL,
  includes_preparation boolean NOT NULL,
  includes_alternative boolean NOT NULL,
  includes_recovery boolean NOT NULL
);

CREATE TABLE consultation_outcomes (
  consultation_id uuid PRIMARY KEY REFERENCES consultations (consultation_id),
  intent_executed boolean,
  actions_executed jsonb NOT NULL DEFAULT '[]',
  household_load_outcome text NOT NULL CHECK (
    household_load_outcome IN ('LIGHTER', 'SAME', 'HEAVIER', 'UNKNOWN')
  ),
  partner_response_user_reported text,
  user_burden text,
  household_atmosphere_user_reported text,
  reusable_next_time boolean,
  free_note text,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memory_items (
  memory_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households (household_id),
  memory_type text NOT NULL CHECK (
    memory_type IN (
      'HOUSEHOLD_ATTRIBUTE',
      'ROUTINE',
      'TASK_OWNERSHIP',
      'PREFERENCE',
      'FATIGUE_PATTERN',
      'CONFLICT_PATTERN',
      'SUCCESS_PATTERN',
      'FAILURE_PATTERN',
      'SCHEDULE_PATTERN'
    )
  ),
  subject text NOT NULL,
  statement text NOT NULL,
  source_consultation_id uuid REFERENCES consultations (consultation_id),
  outcome_backed boolean NOT NULL,
  confidence text NOT NULL,
  importance integer NOT NULL CHECK (importance BETWEEN 1 AND 5),
  valid_from timestamptz NOT NULL DEFAULT now(),
  last_confirmed_at timestamptz NOT NULL DEFAULT now(),
  superseded_by uuid REFERENCES memory_items (memory_id),
  CHECK (
    memory_type NOT IN ('SUCCESS_PATTERN', 'FAILURE_PATTERN', 'CONFLICT_PATTERN')
    OR (outcome_backed AND source_consultation_id IS NOT NULL)
  )
);

CREATE TABLE memory_rejections (
  memory_rejection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES memory_items (memory_id),
  consultation_id uuid REFERENCES consultations (consultation_id),
  rejected_at timestamptz NOT NULL DEFAULT now(),
  reason text
);

CREATE INDEX consultations_household_started_idx
  ON consultations (household_id, started_at DESC);

CREATE INDEX memory_items_household_idx
  ON memory_items (household_id, memory_type);
