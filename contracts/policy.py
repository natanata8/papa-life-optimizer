"""Deterministic MVP policy for routing, questions, actions, and memory.

The LLM may propose copy and classifications. This module is the contract
gate: home choices win, low confidence does not invent an intent, known facts
are not re-asked, Unknown stays empty, and Household Memory is written only
from an actual outcome.
"""

from __future__ import annotations

import json
from pathlib import Path

from contracts.validate import validate

ROOT = Path(__file__).resolve().parent
VOCAB = json.loads((ROOT / "vocab.json").read_text(encoding="utf-8"))
TEMPLATES = json.loads((ROOT / "templates" / "recommendations.json").read_text(encoding="utf-8"))
SCHEMA = json.loads((ROOT / "schemas" / "mvp.schema.json").read_text(encoding="utf-8"))

THRESHOLD = VOCAB["confidence_threshold"]
LIMITS = VOCAB["limits"]
DESIRE = set(VOCAB["desire_intents"])
PROFILE_KEYS = set(VOCAB["profile_keys"])
REUSABLE_MEMORY_KEYS = PROFILE_KEYS
FORBIDDEN_STORED = set(VOCAB["forbidden_stored_keys"])
LOAD_LABELS = VOCAB["load_outcome_labels"]
EVIDENCE_PREDICATES = VOCAB["evidence_predicates"]
CROSS_INTENT_MEMORY_TYPES = set(VOCAB["cross_intent_memory_types"])


class ContractError(ValueError):
    pass


def consult(payload):
    """Return one consultation turn from structured input. No model call."""
    known = _known_map(payload)
    resolution = route(payload)
    retrieved = []
    if resolution["resolved"]:
        retrieved = retrieve_memory(
            payload.get("memory") or [],
            resolution["primary_intent"],
            payload.get("rejected_memory_ids") or [],
        )
        for item in retrieved:
            _apply_stable_memory_values(known, item)
    if payload.get("reported_facts"):
        known["observed_facts"] = payload["reported_facts"]

    questions = plan_questions(resolution, known)
    facts = [
        {"text": text, "source": "USER_INPUT"}
        for text in (payload.get("reported_facts") or [])
    ]
    unknowns = collect_unknowns(resolution, known)
    _reject_inferred_forbidden(unknowns, facts)

    if not resolution["resolved"]:
        stage = "CLARIFY"
        actions = []
        draft = None
        context = {
            "mode": None,
            "verified_facts": facts,
            "unknowns": unknowns,
            "relevant_tasks": [],
            "load_changes": [],
            "capacity_state": None,
            "priority_state": None,
        }
        trace = ["HOME", "CLARIFY"]
        user_visible = {
            "headline": "状況がまだ足りません。",
            "body": "近いものを一つ選ぶと、今日の行動を出せます。",
            "questions": [questions[0]["prompt"]],
            "choices": list(questions[0]["choices"]),
            "actions": [],
            "memory_note": None,
        }
    else:
        blocked_action_keys = _blocked_action_keys(
            payload.get("memory") or [],
            resolution["primary_intent"],
            payload.get("rejected_memory_ids") or [],
            payload.get("override_action_keys") or [],
        )
        built = build_recommendation(
            resolution["primary_intent"], known, facts, retrieved, blocked_action_keys
        )
        actions = built["actions"]
        draft = built["communication_draft"]
        if not actions:
            stage = "CLARIFY"
            evidence_question = dict(VOCAB["missing_evidence_question"])
            questions = [evidence_question]
            draft = None
            context = {
                "mode": resolution["context_mode"],
                "verified_facts": facts,
                "unknowns": unknowns,
                "relevant_tasks": [],
                "load_changes": [],
                "capacity_state": "LOW" if resolution["primary_intent"] == "TIRED" else None,
                "priority_state": (
                    "NOW_THEN_LATER" if resolution["primary_intent"] == "WHAT_SHOULD_I_DO" else None
                ),
            }
            trace = ["HOME", "CLARIFY", "CONTEXT"]
            user_visible = {
                "headline": "行動を出すには、家庭の担当情報が必要です。",
                "body": "いつも担当していることを一つ教えてください。",
                "questions": [evidence_question["prompt"]],
                "choices": [],
                "actions": [],
                "memory_note": _memory_note(retrieved),
            }
        else:
            stage = "ACTION"
            context = {
                "mode": resolution["context_mode"],
                "verified_facts": facts,
                "unknowns": unknowns,
                "relevant_tasks": [],
                "load_changes": _load_names(actions),
                "capacity_state": "LOW" if resolution["primary_intent"] == "TIRED" else None,
                "priority_state": (
                    "NOW_THEN_LATER" if resolution["primary_intent"] == "WHAT_SHOULD_I_DO" else None
                ),
            }
            trace = ["HOME", "CLARIFY", "CONTEXT", "ACTION"]
            user_visible = built["user_visible"]
            user_visible["questions"] = [item["prompt"] for item in questions]
            user_visible["choices"] = []

    _enforce_visible_limits(user_visible)
    _enforce_stage_action_invariant(stage, actions, user_visible)
    if draft is not None:
        draft_errors = validate(draft, {"$ref": "#/$defs/CommunicationDraft", **SCHEMA})
        if draft_errors:
            raise ContractError("communication draft schema: " + "; ".join(draft_errors))
        if _contains_forbidden(draft["message"]):
            raise ContractError("communication draft contains forbidden language")
    violations = visible_violations(user_visible)
    if violations:
        raise ContractError("user_visible failed contract: " + "; ".join(violations))

    response = {
        "stage": stage,
        "user_visible": user_visible,
        "audit": {
            "resolution": resolution,
            "context": context,
            "questions": questions,
            "actions": actions,
            "communication_draft": draft,
            "retrieved_memory_ids": [item["memory_id"] for item in retrieved],
            "stage_trace": trace,
            "render_only": ["user_visible"],
        },
    }
    errors = validate(response, {"$ref": "#/$defs/ConsultationTurn", **SCHEMA})
    if errors:
        raise ContractError("response schema: " + "; ".join(errors))
    return response


def route(payload):
    source = payload.get("source")
    raw = payload.get("raw_user_input") or ""
    if source == "HOME_CHOICE":
        choice = payload.get("entry_choice")
        if choice not in VOCAB["entry_choices"]:
            raise ContractError(f"unknown entry choice: {choice}")
        entry = VOCAB["entry_choices"][choice]
        if entry == "FREE_CONSULT":
            resolved = _resolve_free_text(raw)
            resolved["entry_intent"] = "FREE_CONSULT"
            return resolved
        matches = _match_intents(raw)
        secondary = next((intent for intent in matches if intent != entry), None)
        confidence = 0.85 if secondary else 1.0
        return {
            "entry_intent": entry,
            "primary_intent": entry,
            "secondary_intent": secondary,
            "context_mode": VOCAB["intent_context_mode"][entry],
            "confidence": confidence,
            "resolved": confidence >= THRESHOLD,
        }
    if source == "FREE_TEXT":
        resolved = _resolve_free_text(raw)
        resolved["entry_intent"] = "FREE_CONSULT"
        return resolved
    raise ContractError(f"unknown source: {source}")


def plan_questions(resolution, known):
    if not resolution["resolved"]:
        labels = [
            label
            for label, intent in VOCAB["entry_choices"].items()
            if intent != "FREE_CONSULT"
        ]
        question = dict(VOCAB["unresolved_question"])
        question["choices"] = labels
        return [question]

    questions = []
    for item in VOCAB["askable"]:
        if item["intent"] != resolution["primary_intent"]:
            continue
        key = item["key"]
        if key in PROFILE_KEYS:
            continue
        if _present(known.get(key)):
            continue
        questions.append({"key": key, "prompt": item["prompt"]})
        if len(questions) >= LIMITS["max_questions"]:
            break
    return questions


def collect_unknowns(resolution, known):
    unknowns = []
    seen = set()

    def add(key, required):
        if key in seen or _present(known.get(key)):
            return
        seen.add(key)
        item = {"key": key, "status": "UNKNOWN", "required": required}
        if key in FORBIDDEN_STORED:
            item["infer"] = False
        unknowns.append(item)

    if not resolution["resolved"]:
        add("intent", True)
        return unknowns

    for item in VOCAB["askable"]:
        if item["intent"] == resolution["primary_intent"]:
            add(item["key"], True)
    for key in VOCAB["profile_keys"]:
        add(key, False)
    if resolution["primary_intent"] == "PARTNER_UNHAPPY_OR_CONFLICT":
        add("partner_feeling", False)
        add("who_is_right", False)
    return unknowns


def retrieve_memory(memories, intent, rejected_ids):
    selected = [
        item
        for item in memories
        if _memory_eligible(item, intent, rejected_ids, include_rejected=False)
    ]
    selected.sort(
        key=lambda item: (int(item.get("importance") or 0), item.get("last_confirmed_at") or ""),
        reverse=True,
    )
    return selected[: LIMITS["memory_retrieval_limit"]]


def record_outcome(consultation, outcome):
    """Create memory only from an executed outcome chain."""
    input_errors = validate(outcome, {"$ref": "#/$defs/ConsultationOutcome", **SCHEMA})
    if input_errors:
        raise ContractError("consultation outcome schema: " + "; ".join(input_errors))
    if outcome.get("derivation") == "CHAT_ONLY":
        memories = []
    else:
        memories = _memory_from_outcome(consultation, outcome)
    stage = "MEMORY" if memories else "FEEDBACK"
    trace = ["FEEDBACK", "MEMORY"] if memories else ["FEEDBACK"]
    result = {"stage": stage, "stage_trace": trace, "memories": memories}
    errors = validate(result, {"$ref": "#/$defs/OutcomeResult", **SCHEMA})
    if errors:
        raise ContractError("outcome schema: " + "; ".join(errors))
    return result


def guard_model_output(payload, known_context=None):
    """Return contract violations for one model structured output."""
    errors = validate(payload, {"$ref": "#/$defs/AiStructuredOutput", **SCHEMA})
    if errors:
        return errors

    known = known_context or {}
    violations = list(visible_violations(payload["user_visible"]))

    if payload["resolved"] and payload["intent_confidence"] < THRESHOLD:
        violations.append("resolved below confidence threshold")
    if payload["resolved"] and payload["primary_intent"] in (None, "FREE_CONSULT"):
        violations.append("resolved intent must be a concrete intent")
    if not payload["resolved"] and payload["primary_intent"] is not None:
        violations.append("unresolved output must not invent a primary intent")
    if not payload["resolved"] and payload["context_mode"] is not None:
        violations.append("unresolved output must not invent a context mode")
    if payload["resolved"]:
        expected_mode = VOCAB["intent_context_mode"][payload["primary_intent"]]
        if payload["context_mode"] != expected_mode:
            violations.append("context mode does not match primary intent")

    if len(payload["questions"]) > LIMITS["max_questions"]:
        violations.append("too many questions")
    for question in payload["questions"]:
        key = question["key"]
        if key in PROFILE_KEYS and _present(known.get(key)):
            violations.append(f"reasked profile key {key}")
        if key in PROFILE_KEYS:
            violations.append(f"asked profile key {key}")
        if _present(known.get(key)):
            violations.append(f"reasked known key {key}")

    action_count = len(payload["actions"])
    if payload["resolved"] and not (
        LIMITS["min_actions_when_resolved"] <= action_count <= LIMITS["max_actions"]
    ):
        violations.append("resolved output needs 1 to 5 actions")
    if not payload["resolved"] and action_count != 0:
        violations.append("unresolved output must not invent actions")

    for fact in payload["verified_facts"]:
        if fact["source"] != "USER_INPUT":
            violations.append("verified fact is not user reported")
        if _contains_forbidden(fact["text"]):
            violations.append("verified fact asserts unsupported mood or score")

    for candidate in payload["memory_candidates"]:
        if not candidate["outcome_backed"]:
            violations.append("memory candidate is not outcome backed")
        if candidate["memory_type"] in VOCAB["outcome_required_memory_types"] and not candidate["outcome_backed"]:
            violations.append("pattern memory requires an outcome")

    if any(item["key"] in FORBIDDEN_STORED and item["status"] != "UNKNOWN" for item in payload["unknowns"]):
        violations.append("forbidden key was filled")
    return violations


def visible_violations(user_visible):
    violations = []
    prose_parts = [
        user_visible.get("headline") or "",
        user_visible.get("body") or "",
        user_visible.get("memory_note") or "",
    ]
    prose_parts.extend(user_visible.get("questions") or [])
    for action in user_visible.get("actions") or []:
        prose_parts.append(action.get("title") or "")
        prose_parts.append(action.get("detail") or "")
    prose = "\n".join(prose_parts)
    for token in VOCAB["forbidden_user_visible_substrings"]:
        if token in prose:
            violations.append(f"forbidden visible term {token}")
    if _visible_length(user_visible) > LIMITS["user_visible_max_chars"]:
        violations.append("user visible text is too long")
    return violations


def build_recommendation(intent, known, facts, retrieved, blocked_action_keys=None):
    template = TEMPLATES[intent]
    blocked = set(blocked_action_keys or [])
    actions = []
    for source in template["actions"]:
        if source["action_key"] in blocked:
            continue
        required_evidence = source.get("requires_evidence_any") or []
        if required_evidence and not _has_evidence_any(known, required_evidence):
            continue
        actions.append(
            {
                "action_key": source["action_key"],
                "action_type": source["action_type"],
                "title": source["title"],
                "description": source["description"],
                "rank": len(actions) + 1,
                "effort": source["effort"],
                "reason": source["reason"],
                "expected_load_reduction": list(source["expected_load_reduction"]),
                "status": "PROPOSED",
            }
        )
    action_keys = {item["action_key"] for item in actions}
    headline, body = _visible_copy(intent, template, known, facts, action_keys)
    memory_note = _memory_note(retrieved)
    user_visible = {
        "headline": headline,
        "body": body,
        "questions": [],
        "choices": [],
        "actions": [{"title": item["title"], "detail": item["description"]} for item in actions],
        "memory_note": memory_note,
    }
    draft = template.get("communication_draft")
    draft_required = template.get("communication_draft_requires_evidence_all") or []
    if draft_required and not _has_evidence_all(known, draft_required):
        draft = None
    return {
        "actions": actions,
        "user_visible": user_visible,
        "communication_draft": draft,
    }


def _resolve_free_text(raw):
    matches = _match_intents(raw)
    if not matches:
        return {
            "entry_intent": "FREE_CONSULT",
            "primary_intent": None,
            "secondary_intent": None,
            "context_mode": None,
            "confidence": 0.0,
            "resolved": False,
        }
    indexes = _earliest_indexes(raw)
    primary, secondary = _desire_first(matches, indexes)
    confidence = 0.9 if secondary is None else 0.8
    if primary in DESIRE and secondary is not None:
        confidence = 0.85
    resolved = confidence >= THRESHOLD
    return {
        "entry_intent": "FREE_CONSULT",
        "primary_intent": primary if resolved else None,
        "secondary_intent": secondary if resolved else None,
        "context_mode": VOCAB["intent_context_mode"][primary] if resolved else None,
        "confidence": confidence if resolved else 0.0,
        "resolved": resolved,
    }


def _match_intents(raw):
    found = []
    for pattern in VOCAB["free_text_patterns"]:
        if any(phrase in raw for phrase in pattern["phrases"]):
            found.append(pattern["intent"])
    return found


def _earliest_indexes(raw):
    indexes = {}
    for pattern in VOCAB["free_text_patterns"]:
        positions = [raw.find(phrase) for phrase in pattern["phrases"] if phrase in raw]
        if positions:
            indexes[pattern["intent"]] = min(positions)
    return indexes


def _desire_first(matches, indexes):
    if len(matches) == 1:
        return matches[0], None
    desires = [intent for intent in matches if intent in DESIRE]
    if desires:
        primary = min(desires, key=lambda intent: indexes[intent])
        rest = [intent for intent in matches if intent != primary]
        secondary = min(rest, key=lambda intent: indexes[intent])
        return primary, secondary
    ordered = sorted(matches, key=lambda intent: indexes[intent])
    return ordered[0], ordered[1]


def _memory_from_outcome(consultation, outcome):
    required = ("actions_executed", "household_load_outcome", "reusable_next_time")
    if any(key not in outcome for key in required):
        raise ContractError("outcome is missing the situation-action-result chain")
    reusable = outcome["reusable_next_time"]
    if reusable is None:
        return []
    intent = consultation["primary_intent"]
    label = VOCAB["intent_labels"][intent]
    load = LOAD_LABELS[outcome["household_load_outcome"]]
    executed = outcome.get("actions_executed") or []
    action_keys = list(outcome.get("action_keys") or [])
    if reusable is True:
        if not executed:
            return []
        statement = f"{label}の前は「{executed[0]}」が有効で、負担は{load}。"
        memory_type = "SUCCESS_PATTERN"
    else:
        if executed:
            statement = f"{label}で「{executed[0]}」は次回そのまま使わない。負担は{load}。"
        else:
            statement = f"{label}の前回提案は次回そのまま使わない。負担は{load}。"
        memory_type = "FAILURE_PATTERN"
    if _contains_forbidden(statement):
        raise ContractError("memory statement failed the visible-language contract")
    covered_keys = [
        key for key in (outcome.get("covered_keys") or []) if key in REUSABLE_MEMORY_KEYS
    ]
    covered_values = {}
    for key, value in (outcome.get("covered_values") or {}).items():
        if key in covered_keys and _authorizing_value(value):
            covered_values[key] = value
    memory = {
        "memory_type": memory_type,
        "subject": label,
        "statement": statement,
        "source_consultation_id": consultation["consultation_id"],
        "outcome_backed": True,
        "intent": intent,
        "covered_keys": covered_keys,
        "action_keys": action_keys,
        "importance": 4 if reusable is True else 3,
        "confidence": "OUTCOME_BACKED",
        "superseded_by": None,
    }
    if covered_values:
        memory["covered_values"] = covered_values
    return [memory]


def _memory_note(retrieved):
    for item in retrieved:
        if item.get("memory_type") == "SUCCESS_PATTERN" and item.get("statement"):
            note = item["statement"]
            if len(note) <= LIMITS["memory_note_max"]:
                return note
    return None


def _blocked_action_keys(memories, intent, rejected_ids, override_action_keys):
    overrides = set(override_action_keys or [])
    valid_keys = _intent_action_keys(intent)
    blocked = set()
    for item in memories:
        if not _memory_eligible(item, intent, rejected_ids, include_rejected=True):
            continue
        is_rejected = item.get("memory_id") in set(rejected_ids or [])
        is_failure = item.get("memory_type") == "FAILURE_PATTERN"
        if is_rejected or is_failure:
            blocked.update(item.get("action_keys") or [])
    return (blocked & valid_keys) - overrides


def _memory_eligible(item, intent, rejected_ids, include_rejected):
    rejected = set(rejected_ids or [])
    if not include_rejected and item.get("memory_id") in rejected:
        return False
    if item.get("superseded_by"):
        return False
    if not item.get("outcome_backed"):
        return False
    memory_intent = item.get("intent")
    memory_type = item.get("memory_type")
    if memory_intent and memory_intent != intent and memory_type not in CROSS_INTENT_MEMORY_TYPES:
        return False
    return True


def _intent_action_keys(intent):
    return {item["action_key"] for item in TEMPLATES[intent]["actions"]}


def _apply_stable_memory_values(known, item):
    values = item.get("covered_values") or {}
    for key in item.get("covered_keys") or []:
        if key not in REUSABLE_MEMORY_KEYS or _present(known.get(key)):
            continue
        value = values.get(key)
        if _authorizing_value(value):
            known[key] = value


def _missing_askable(intent, known):
    for item in VOCAB["askable"]:
        if item["intent"] == intent and not _present(known.get(item["key"])):
            return True
    return False


def _known_map(payload):
    known = {}
    for key, value in (payload.get("known_context") or {}).items():
        if _present(value):
            known[key] = value
    return known


def _present(value):
    if value is None:
        return False
    if value == "":
        return False
    if value == []:
        return False
    if value == {}:
        return False
    return True


def _is_provenance_placeholder(value):
    return isinstance(value, dict) and "from_memory" in value and not any(
        key != "from_memory" and _present(part) for key, part in value.items()
    )


def _authorizing_value(value):
    return _present(value) and not _is_provenance_placeholder(value)


def _evidence_text(value):
    if not _authorizing_value(value):
        return ""
    if isinstance(value, list):
        parts = [_evidence_text(item) for item in value]
        return " ".join(part for part in parts if part)
    if isinstance(value, dict):
        parts = []
        for key, part in value.items():
            if key == "from_memory":
                continue
            text = _evidence_text(part)
            if text:
                parts.append(text)
        return " ".join(parts)
    return str(value)


def _predicate_matches(known, predicate_id):
    predicate = EVIDENCE_PREDICATES[predicate_id]
    fields = predicate["fields"]
    if predicate.get("any_value"):
        return any(_authorizing_value(known.get(field)) for field in fields)
    tokens = predicate.get("tokens") or []
    for field in fields:
        text = _evidence_text(known.get(field))
        if text and any(token in text for token in tokens):
            return True
    return False


def _has_evidence_any(known, predicate_ids):
    return any(_predicate_matches(known, predicate_id) for predicate_id in predicate_ids)


def _has_evidence_all(known, predicate_ids):
    return all(_predicate_matches(known, predicate_id) for predicate_id in predicate_ids)


def _visible_copy(intent, template, known, facts, action_keys):
    if intent == "WANT_TO_DRINK":
        return _drink_visible_copy(template, known, action_keys)

    body = template["body"]
    if intent == "PARTNER_UNHAPPY_OR_CONFLICT" and facts:
        fact = facts[0]["text"]
        rendered = template["body_with_fact"].replace("{fact}", fact)
        if len(rendered) <= LIMITS["body_max"] and not _contains_forbidden(fact):
            body = rendered
    elif _missing_askable(intent, known) and template.get("body_when_unknown"):
        body = template["body_when_unknown"]
    elif _coordination_only(intent, action_keys) and template.get("body_without_household_context"):
        body = template["body_without_household_context"]
    return template["headline"], body


def _drink_visible_copy(template, known, action_keys):
    has_dinner = "prepare_main_dish" in action_keys
    has_transport = "take_morning_transport" in action_keys
    if not has_dinner and not has_transport:
        headline = template["headline_coordination_only"]
        if _missing_askable("WANT_TO_DRINK", known):
            body = template["body_when_unknown"]
        else:
            body = template["body_coordination_only"]
        return headline, body

    headline = template["headline"] if has_dinner else template["headline_coordination_only"]
    if has_dinner and has_transport:
        body = template["body"]
    elif has_dinner:
        body = "増えるのは夕食の準備です。"
    else:
        body = "増えるのは翌朝の準備です。"
    if _missing_askable("WANT_TO_DRINK", known) and not has_dinner and not has_transport:
        body = template["body_when_unknown"]
    return headline, body


def _coordination_only(intent, action_keys):
    gated = {
        source["action_key"]
        for source in TEMPLATES[intent]["actions"]
        if source.get("requires_evidence_any")
    }
    return not (action_keys & gated)


def _load_names(actions):
    names = []
    for action in actions:
        for name in action["expected_load_reduction"]:
            if name not in names:
                names.append(name)
    return names


def _reject_inferred_forbidden(unknowns, facts):
    for item in unknowns:
        if item["key"] in FORBIDDEN_STORED and item["status"] != "UNKNOWN":
            raise ContractError("forbidden key was inferred")
    for fact in facts:
        if fact["source"] != "USER_INPUT":
            raise ContractError("fact was not user reported")


def _enforce_stage_action_invariant(stage, actions, user_visible):
    audit_count = len(actions)
    visible_count = len(user_visible.get("actions") or [])
    if stage == "ACTION":
        if not (
            LIMITS["min_actions_when_resolved"] <= audit_count <= LIMITS["max_actions"]
        ):
            raise ContractError("ACTION requires 1 to 5 audit actions")
        if not (
            LIMITS["min_actions_when_resolved"] <= visible_count <= LIMITS["max_actions"]
        ):
            raise ContractError("ACTION requires 1 to 5 visible actions")
    elif stage == "CLARIFY":
        if audit_count != 0:
            raise ContractError("CLARIFY requires zero audit actions")
        if visible_count != 0:
            raise ContractError("CLARIFY requires zero visible actions")


def _enforce_visible_limits(user_visible):
    limits = {
        "headline": LIMITS["headline_max"],
        "body": LIMITS["body_max"],
    }
    for key, limit in limits.items():
        if len(user_visible[key]) > limit:
            raise ContractError(f"{key} exceeds {limit}")
    if user_visible["memory_note"] and len(user_visible["memory_note"]) > LIMITS["memory_note_max"]:
        raise ContractError("memory_note exceeds limit")
    for question in user_visible["questions"]:
        if len(question) > LIMITS["question_max"]:
            raise ContractError("question exceeds limit")
    for action in user_visible["actions"]:
        if len(action["title"]) > LIMITS["action_title_max"]:
            raise ContractError("action title exceeds limit")
        if len(action["detail"]) > LIMITS["action_detail_max"]:
            raise ContractError("action detail exceeds limit")
    count = len(user_visible["actions"])
    if count > LIMITS["max_actions"]:
        raise ContractError("too many actions")


def _visible_length(user_visible):
    parts = [user_visible.get("headline") or "", user_visible.get("body") or "", user_visible.get("memory_note") or ""]
    parts.extend(user_visible.get("questions") or [])
    parts.extend(user_visible.get("choices") or [])
    for action in user_visible.get("actions") or []:
        parts.append(action.get("title") or "")
        parts.append(action.get("detail") or "")
    return sum(len(part) for part in parts)


def _contains_forbidden(text):
    return any(token in text for token in VOCAB["forbidden_user_visible_substrings"])
