import json
import re
import unittest
from pathlib import Path

from contracts.policy import VOCAB, consult, guard_model_output, record_outcome, visible_violations
from contracts.validate import validate

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
SCHEMA = json.loads((ROOT / "schemas" / "mvp.schema.json").read_text(encoding="utf-8"))
OPENAPI = json.loads((ROOT / "openapi" / "mvp.openapi.json").read_text(encoding="utf-8"))
SQL = (ROOT / "db" / "001_mvp.sql").read_text(encoding="utf-8")
CONSULTATIONS = json.loads((ROOT / "fixtures" / "consultations.json").read_text(encoding="utf-8"))
OUTCOMES = json.loads((ROOT / "fixtures" / "outcomes.json").read_text(encoding="utf-8"))
MODEL_OUTPUTS = json.loads((ROOT / "fixtures" / "model_outputs.json").read_text(encoding="utf-8"))

TABLES = [
    "households",
    "users",
    "household_members",
    "household_profiles",
    "household_tasks",
    "task_load_vectors",
    "task_instances",
    "consultations",
    "consultation_turns",
    "context_requirements",
    "schedule_items",
    "context_snapshots",
    "action_proposals",
    "communication_drafts",
    "consultation_outcomes",
    "memory_items",
    "memory_rejections",
]

FORBIDDEN_COLUMNS = [
    "emotional_load",
    "partner_mood",
    "fairness_score",
    "anger_score",
    "relationship_quality",
]


def prose(user_visible):
    parts = [
        user_visible.get("headline") or "",
        user_visible.get("body") or "",
        user_visible.get("memory_note") or "",
    ]
    parts.extend(user_visible.get("questions") or [])
    for action in user_visible.get("actions") or []:
        parts.append(action.get("title") or "")
        parts.append(action.get("detail") or "")
    return "\n".join(parts)


class ConsultationFixtures(unittest.TestCase):
    def test_fixtures_cover_seven_intents(self):
        primaries = set()
        entries = set()
        for case in CONSULTATIONS:
            result = consult(case["input"])
            resolution = result["audit"]["resolution"]
            if resolution["primary_intent"]:
                primaries.add(resolution["primary_intent"])
            entries.add(resolution["entry_intent"])
        concrete = [intent for intent in VOCAB["intents"] if intent != "FREE_CONSULT"]
        self.assertTrue(set(concrete).issubset(primaries))
        self.assertIn("FREE_CONSULT", entries)

    def test_each_consultation_fixture(self):
        for case in CONSULTATIONS:
            with self.subTest(case=case["id"]):
                result = consult(case["input"])
                self._assert_common(result)
                self._assert_expect(result, case["expect"])

    def test_memory_second_visit_reuses_only_stable_household_context(self):
        second = consult(self._case("memory-second-visit")["input"])
        asked = {item["key"] for item in second["audit"]["questions"]}
        unknown = {item["key"] for item in second["audit"]["context"]["unknowns"]}
        self.assertIn("event_window", asked)
        self.assertIn("event_window", unknown)
        self.assertNotIn("usual_responsibilities", unknown)
        self.assertTrue(second["user_visible"]["memory_note"])
        self.assertIn("夕食準備", second["user_visible"]["memory_note"])

    def test_zero_profile_fallback_does_not_assert_household_tasks(self):
        result = consult(self._case("no-profile-still-useful")["input"])
        action_keys = {item["action_key"] for item in result["audit"]["actions"]}
        self.assertEqual(action_keys, {"share_return_time"})
        self.assertIsNone(result["audit"]["communication_draft"])
        self.assertEqual(result["user_visible"]["headline"], "まず、帰り時刻の共有から始めます。")
        self.assertEqual(
            result["user_visible"]["body"],
            "開始時刻は未定のまま、今できる共有だけ出します。",
        )
        text = prose(result["user_visible"])
        for unsupported in ("夕食の主菜", "寝かしつけ", "翌朝の送迎", "夕食まわり"):
            self.assertNotIn(unsupported, text)

    def test_irrelevant_responsibility_and_placeholder_do_not_enable_meal_transport(self):
        for case_id in (
            "irrelevant-responsibility-no-meal-transport",
            "memory-placeholder-no-action-evidence",
            "child-count-alone-no-task-claims",
        ):
            with self.subTest(case=case_id):
                result = consult(self._case(case_id)["input"])
                action_keys = {item["action_key"] for item in result["audit"]["actions"]}
                self.assertEqual(action_keys, {"share_return_time"})
                self.assertIsNone(result["audit"]["communication_draft"])
                text = prose(result["user_visible"])
                for unsupported in ("夕食の主菜", "翌朝の送迎", "寝かしつけ"):
                    self.assertNotIn(unsupported, text)

    def test_dinner_responsibility_enables_only_matching_action(self):
        result = consult(self._case("dinner-responsibility-enables-meal-only")["input"])
        action_keys = {item["action_key"] for item in result["audit"]["actions"]}
        self.assertEqual(action_keys, {"prepare_main_dish", "share_return_time"})
        draft = result["audit"]["communication_draft"]
        self.assertIsNotNone(draft)
        self.assertIn("夕食", draft["message"])
        self.assertNotIn("翌朝", draft["message"])

    def test_blocked_only_eligible_action_returns_clarify_not_empty_action(self):
        result = consult(self._case("blocked-only-action-clarifies")["input"])
        self.assertEqual(result["stage"], "CLARIFY")
        self.assertEqual(result["audit"]["actions"], [])
        self.assertEqual(result["user_visible"]["actions"], [])
        self.assertTrue(result["audit"]["resolution"]["resolved"])
        self.assertEqual(
            [item["key"] for item in result["audit"]["questions"]],
            ["observed_facts"],
        )
        self.assertEqual(
            result["user_visible"]["questions"],
            ["今回の時間帯に、対応が必要な家事や送迎はありますか？"],
        )
        self.assertNotIn("いつも", result["user_visible"]["body"])
        self.assertNotIn("ACTION", result["audit"]["stage_trace"])

    def test_negated_and_zero_evidence_do_not_authorize_positive_actions(self):
        for case_id in (
            "child-count-zero-no-child-meal",
            "negated-dinner-not-owned",
            "negated-dinner-unnecessary",
            "negated-transport-absent",
        ):
            with self.subTest(case=case_id):
                result = consult(self._case(case_id)["input"])
                self._assert_expect(result, self._case(case_id)["expect"])

        boolean_count = consult(
            {
                "source": "HOME_CHOICE",
                "entry_choice": "疲れた",
                "raw_user_input": "",
                "known_context": {"child_count": True},
                "reported_facts": [],
                "memory": [],
                "rejected_memory_ids": [],
            }
        )
        self.assertNotIn(
            "serve_child_meal",
            {item["action_key"] for item in boolean_count["audit"]["actions"]},
        )

    def test_copy_tracks_exact_eligible_actions_for_gated_intents(self):
        for case_id in (
            "tired-child-only-no-laundry-copy",
            "tired-laundry-only-no-meal-copy",
            "tired-rest-only-no-task-copy",
            "overtime-zero-context-coordination-only",
            "overtime-dinner-only-no-cleanup-copy",
            "overtime-cleanup-only-no-dinner-copy",
            "personal-time-no-bath-copy",
            "what-should-i-do-no-cleaning-copy",
            "partner-conflict-no-bedtime-copy",
        ):
            with self.subTest(case=case_id):
                result = consult(self._case(case_id)["input"])
                self._assert_expect(result, self._case(case_id)["expect"])

    def test_clarify_prompt_is_intent_specific_and_current_consultation(self):
        drink = consult(self._case("blocked-only-action-clarifies")["input"])
        tired = consult(self._case("tired-blocked-asks-current-needs")["input"])
        self.assertEqual(
            drink["user_visible"]["questions"],
            ["今回の時間帯に、対応が必要な家事や送迎はありますか？"],
        )
        self.assertEqual(
            tired["user_visible"]["questions"],
            ["今、今日中に対応が必要なことはありますか？"],
        )
        for result in (drink, tired):
            text = prose(result["user_visible"])
            self.assertNotIn("いつも担当", text)
            self.assertLessEqual(len(result["user_visible"]["questions"]), 1)

    def test_memory_blockers_respect_supersession_and_intent(self):
        superseded = consult(self._case("superseded-failure-does-not-block")["input"])
        cross = consult(self._case("cross-intent-failure-does-not-block")["input"])
        active = consult(self._case("memory-failure-changes-actions")["input"])
        rejected = consult(self._case("memory-rejected")["input"])
        rejected_override = consult(self._case("memory-rejected-user-override")["input"])
        cross_ownership = consult(
            self._case("cross-intent-rejected-ownership-does-not-block")["input"]
        )
        cross_ownership_values = consult(
            self._case("cross-intent-ownership-supplies-values-not-blockers")["input"]
        )
        self.assertIn(
            "share_return_time",
            {item["action_key"] for item in superseded["audit"]["actions"]},
        )
        self.assertIn(
            "share_return_time",
            {item["action_key"] for item in cross["audit"]["actions"]},
        )
        self.assertNotIn(
            "prepare_main_dish",
            {item["action_key"] for item in active["audit"]["actions"]},
        )
        self.assertNotIn(
            "prepare_main_dish",
            {item["action_key"] for item in rejected["audit"]["actions"]},
        )
        self.assertIn(
            "prepare_main_dish",
            {item["action_key"] for item in rejected_override["audit"]["actions"]},
        )
        self.assertEqual(cross_ownership["stage"], "ACTION")
        self.assertIn(
            "share_return_time",
            {item["action_key"] for item in cross_ownership["audit"]["actions"]},
        )
        self.assertIn(
            "prepare_main_dish",
            {item["action_key"] for item in cross_ownership_values["audit"]["actions"]},
        )
        self.assertIn(
            "share_return_time",
            {item["action_key"] for item in cross_ownership_values["audit"]["actions"]},
        )

    def test_home_choice_beats_free_text(self):
        result = consult(
            {
                "source": "HOME_CHOICE",
                "entry_choice": "疲れた",
                "raw_user_input": "飲みに行きたい",
                "known_context": {},
                "reported_facts": [],
                "memory": [],
                "rejected_memory_ids": [],
            }
        )
        resolution = result["audit"]["resolution"]
        self.assertEqual(resolution["primary_intent"], "TIRED")
        self.assertEqual(resolution["secondary_intent"], "WANT_TO_DRINK")
        self.assertEqual(resolution["context_mode"], "CAPACITY")

    def test_rest_skip_and_defer_are_emitted(self):
        seen = set()
        for case in CONSULTATIONS:
            result = consult(case["input"])
            for action in result["audit"]["actions"]:
                seen.add(action["action_type"])
        for action_type in VOCAB["rest_skip_defer"]:
            self.assertIn(action_type, seen)

    def _assert_common(self, result):
        self.assertEqual(result["audit"]["render_only"], ["user_visible"])
        self.assertEqual(visible_violations(result["user_visible"]), [])
        self.assertLessEqual(len(result["audit"]["questions"]), VOCAB["limits"]["max_questions"])
        asked = {item["key"] for item in result["audit"]["questions"]}
        self.assertTrue(asked.isdisjoint(VOCAB["profile_keys"]))
        for action in result["user_visible"]["actions"]:
            self.assertEqual(set(action), {"title", "detail"})
        for unknown in result["audit"]["context"]["unknowns"]:
            if unknown["key"] in VOCAB["forbidden_stored_keys"]:
                self.assertEqual(unknown["status"], "UNKNOWN")
                self.assertIs(unknown.get("infer"), False)
        resolution = result["audit"]["resolution"]
        if result["stage"] == "ACTION":
            self.assertTrue(resolution["resolved"])
            self.assertGreaterEqual(resolution["confidence"], VOCAB["confidence_threshold"])
            self.assertIn(resolution["primary_intent"], VOCAB["intent_context_mode"])
            self.assertEqual(
                resolution["context_mode"],
                VOCAB["intent_context_mode"][resolution["primary_intent"]],
            )
            self.assertEqual(
                result["audit"]["stage_trace"],
                ["HOME", "CLARIFY", "CONTEXT", "ACTION"],
            )
            self.assertGreaterEqual(len(result["audit"]["actions"]), 1)
            self.assertLessEqual(len(result["audit"]["actions"]), 5)
            self.assertGreaterEqual(len(result["user_visible"]["actions"]), 1)
            self.assertLessEqual(len(result["user_visible"]["actions"]), 5)
        else:
            self.assertEqual(result["stage"], "CLARIFY")
            self.assertEqual(result["audit"]["actions"], [])
            self.assertEqual(result["user_visible"]["actions"], [])
            self.assertNotIn("ACTION", result["audit"]["stage_trace"])
            if resolution["resolved"]:
                self.assertGreaterEqual(resolution["confidence"], VOCAB["confidence_threshold"])
                self.assertIn(resolution["primary_intent"], VOCAB["intent_context_mode"])
                self.assertEqual(
                    resolution["context_mode"],
                    VOCAB["intent_context_mode"][resolution["primary_intent"]],
                )
                self.assertEqual(result["audit"]["stage_trace"], ["HOME", "CLARIFY", "CONTEXT"])
            else:
                self.assertLess(resolution["confidence"], VOCAB["confidence_threshold"])
                self.assertIsNone(resolution["primary_intent"])
                self.assertIsNone(resolution["context_mode"])
                self.assertEqual(result["audit"]["stage_trace"], ["HOME", "CLARIFY"])

    def _assert_expect(self, result, expect):
        resolution = result["audit"]["resolution"]
        visible = result["user_visible"]
        if "stage" in expect:
            self.assertEqual(result["stage"], expect["stage"])
        for key in ("entry_intent", "primary_intent", "secondary_intent", "context_mode", "resolved"):
            if key in expect:
                self.assertEqual(resolution[key], expect[key])
        if "question_keys" in expect:
            self.assertEqual([item["key"] for item in result["audit"]["questions"]], expect["question_keys"])
        if "question_prompts" in expect:
            self.assertEqual(visible["questions"], expect["question_prompts"])
        if "must_not_ask_keys" in expect:
            asked = {item["key"] for item in result["audit"]["questions"]}
            self.assertTrue(asked.isdisjoint(expect["must_not_ask_keys"]))
        if "action_types_include" in expect:
            types = [item["action_type"] for item in result["audit"]["actions"]]
            for action_type in expect["action_types_include"]:
                self.assertIn(action_type, types)
        action_keys = [item["action_key"] for item in result["audit"]["actions"]]
        for action_key in expect.get("action_keys_include", []):
            self.assertIn(action_key, action_keys)
        for action_key in expect.get("action_keys_exclude", []):
            self.assertNotIn(action_key, action_keys)
        unknowns = {item["key"] for item in result["audit"]["context"]["unknowns"]}
        for key in expect.get("unknown_keys_include", []):
            self.assertIn(key, unknowns)
        for key in expect.get("unknown_keys_exclude", []):
            self.assertNotIn(key, unknowns)
        if "action_count" in expect:
            self.assertEqual(len(result["audit"]["actions"]), expect["action_count"])
        if "min_actions" in expect:
            self.assertGreaterEqual(len(result["audit"]["actions"]), expect["min_actions"])
        text = prose(visible)
        for token in expect.get("headline_includes", []):
            self.assertIn(token, visible["headline"])
        for token in expect.get("body_includes", []):
            self.assertIn(token, visible["body"])
        for token in expect.get("body_excludes", []):
            self.assertNotIn(token, visible["body"])
        for token in expect.get("prose_excludes", []):
            self.assertNotIn(token, text)
        if "memory_note" in expect:
            self.assertEqual(visible["memory_note"], expect["memory_note"])
        if "retrieved_memory_ids" in expect:
            self.assertEqual(result["audit"]["retrieved_memory_ids"], expect["retrieved_memory_ids"])
        if "fact_stored" in expect:
            stored = [item["text"] for item in result["audit"]["context"]["verified_facts"]]
            self.assertIn(expect["fact_stored"], stored)
            self.assertNotIn(expect["fact_stored"], text)
        if result["stage"] == "CLARIFY" and not resolution["resolved"]:
            labels = [label for label, intent in VOCAB["entry_choices"].items() if intent != "FREE_CONSULT"]
            self.assertEqual(visible["choices"], labels)

    def _case(self, case_id):
        for case in CONSULTATIONS:
            if case["id"] == case_id:
                return case
        raise AssertionError(case_id)


class OutcomeFixtures(unittest.TestCase):
    def test_outcomes(self):
        for case in OUTCOMES:
            with self.subTest(case=case["id"]):
                self.assertEqual(
                    validate(case["outcome"], {"$ref": "#/$defs/ConsultationOutcome", **SCHEMA}),
                    [],
                )
                result = record_outcome(case["consultation"], case["outcome"])
                expect = case["expect"]
                self.assertEqual(result["stage"], expect["stage"])
                if "memory_count" in expect:
                    self.assertEqual(len(result["memories"]), expect["memory_count"])
                if result["memories"]:
                    memory = result["memories"][0]
                    self.assertTrue(memory["outcome_backed"])
                    self.assertEqual(memory["confidence"], "OUTCOME_BACKED")
                    self.assertEqual(memory["action_keys"], case["outcome"].get("action_keys", []))
                    self.assertEqual(
                        memory.get("covered_values", {}),
                        case["outcome"].get("covered_values", {}),
                    )
                    self.assertNotIn(memory["intent"], memory["statement"])
                if "memory_type" in expect:
                    self.assertEqual(result["memories"][0]["memory_type"], expect["memory_type"])
                if result["memories"]:
                    statement = result["memories"][0]["statement"]
                    for token in expect.get("statement_includes", []):
                        self.assertIn(token, statement)
                    for token in expect.get("statement_excludes", []):
                        self.assertNotIn(token, statement)
                    partner_text = case["outcome"].get("partner_response_user_reported")
                    if partner_text:
                        self.assertNotIn(partner_text, statement)

    def test_outcome_without_provenance_is_rejected(self):
        case = dict(OUTCOMES[0]["outcome"])
        case.pop("derivation")
        with self.assertRaisesRegex(ValueError, "consultation outcome schema"):
            record_outcome(OUTCOMES[0]["consultation"], case)


class ModelOutputGuard(unittest.TestCase):
    def test_model_outputs(self):
        for case in MODEL_OUTPUTS:
            with self.subTest(case=case["id"]):
                violations = guard_model_output(case["output"], case.get("known_context"))
                for token in case["expect"]["violation_includes"]:
                    self.assertTrue(
                        any(token in violation for violation in violations),
                        f"{token} not in {violations}",
                    )

    def test_valid_policy_output_passes_guard_shape(self):
        result = consult(self._drink())
        resolution = result["audit"]["resolution"]
        payload = {
            "primary_intent": resolution["primary_intent"],
            "secondary_intent": resolution["secondary_intent"],
            "intent_confidence": resolution["confidence"],
            "context_mode": resolution["context_mode"],
            "resolved": resolution["resolved"],
            "unknowns": result["audit"]["context"]["unknowns"],
            "verified_facts": result["audit"]["context"]["verified_facts"],
            "questions": result["audit"]["questions"],
            "user_visible": result["user_visible"],
            "actions": result["audit"]["actions"],
            "memory_candidates": [],
        }
        self.assertEqual(guard_model_output(payload, {"event_window": "金曜20時"}), [])

    def _drink(self):
        for case in CONSULTATIONS:
            if case["id"] == "want-to-drink":
                return case["input"]
        raise AssertionError("missing drink fixture")


class SchemaParity(unittest.TestCase):
    def test_schema_enums_match_vocab(self):
        defs = SCHEMA["$defs"]
        self.assertEqual(defs["Intent"]["enum"], VOCAB["intents"])
        self.assertEqual(defs["ContextMode"]["enum"], VOCAB["context_modes"])
        self.assertEqual(defs["ActionType"]["enum"], VOCAB["action_types"])
        self.assertEqual(defs["Stage"]["enum"], VOCAB["stages"])
        self.assertEqual(defs["MemoryType"]["enum"], VOCAB["memory_types"])
        self.assertEqual(defs["LoadDimension"]["enum"], VOCAB["load_dimensions"])
        self.assertNotIn("emotional_load", defs["LoadDimension"]["enum"])

    def test_openapi_enums_match_vocab(self):
        schemas = OPENAPI["components"]["schemas"]
        self.assertEqual(schemas["Intent"]["enum"], VOCAB["intents"])
        self.assertEqual(schemas["ContextMode"]["enum"], VOCAB["context_modes"])
        self.assertEqual(schemas["ActionType"]["enum"], VOCAB["action_types"])
        self.assertEqual(schemas["Stage"]["enum"], VOCAB["stages"])
        self.assertEqual(schemas["MemoryItem"]["properties"]["memory_type"]["enum"], VOCAB["memory_types"])

    def test_start_request_does_not_require_profile(self):
        required = OPENAPI["components"]["schemas"]["StartConsultationRequest"]["required"]
        self.assertEqual(required, ["household_id", "user_id", "source"])
        self.assertNotIn("profile", required)

    def test_paths_cover_the_loop(self):
        paths = OPENAPI["paths"]
        for path in (
            "/v1/consultations",
            "/v1/consultations/{consultation_id}/turns",
            "/v1/consultations/{consultation_id}/outcomes",
            "/v1/households/{household_id}/memory",
            "/v1/households/{household_id}/memory/{memory_id}/rejections",
            "/v1/households/{household_id}/profile",
        ):
            self.assertIn(path, paths)

    def test_mood_payload_is_rejected_by_schema(self):
        payload = {
            "memory_type": "SUCCESS_PATTERN",
            "subject": "飲み会",
            "statement": "夕食準備が有効だった。",
            "source_consultation_id": "consult-1",
            "outcome_backed": True,
            "intent": "WANT_TO_DRINK",
            "covered_keys": [],
            "importance": 4,
            "confidence": "OUTCOME_BACKED",
            "superseded_by": None,
            "partner_mood_score": 3,
        }
        errors = validate(payload, {"$ref": "#/$defs/MemoryItem", **SCHEMA})
        self.assertTrue(any("partner_mood_score" in error for error in errors))

    def test_stage_action_cardinality_parity_across_schema_openapi_runtime(self):
        openapi_defs = OPENAPI["components"]["schemas"]
        action_turn = consult(self._case("want-to-drink")["input"])
        clarify_turn = consult(self._case("blocked-only-action-clarifies")["input"])

        self.assertEqual(
            validate(action_turn, {"$ref": "#/$defs/ConsultationTurn", **SCHEMA}),
            [],
        )
        self.assertEqual(
            validate(action_turn, openapi_defs["ConsultationTurn"], defs=openapi_defs),
            [],
        )
        self.assertEqual(
            validate(clarify_turn, {"$ref": "#/$defs/ConsultationTurn", **SCHEMA}),
            [],
        )
        self.assertEqual(
            validate(clarify_turn, openapi_defs["ConsultationTurn"], defs=openapi_defs),
            [],
        )

        empty_action = json.loads(json.dumps(action_turn))
        empty_action["audit"]["actions"] = []
        empty_action["user_visible"]["actions"] = []
        self.assertTrue(
            validate(empty_action, {"$ref": "#/$defs/ConsultationTurn", **SCHEMA})
        )
        self.assertTrue(
            validate(empty_action, openapi_defs["ConsultationTurn"], defs=openapi_defs)
        )

        clarify_with_actions = json.loads(json.dumps(clarify_turn))
        clarify_with_actions["audit"]["actions"] = action_turn["audit"]["actions"][:1]
        clarify_with_actions["user_visible"]["actions"] = action_turn["user_visible"][
            "actions"
        ][:1]
        self.assertTrue(
            validate(
                clarify_with_actions, {"$ref": "#/$defs/ConsultationTurn", **SCHEMA}
            )
        )
        self.assertTrue(
            validate(
                clarify_with_actions,
                openapi_defs["ConsultationTurn"],
                defs=openapi_defs,
            )
        )

    def _case(self, case_id):
        for case in CONSULTATIONS:
            if case["id"] == case_id:
                return case
        raise AssertionError(case_id)


class PersistenceAndPrompts(unittest.TestCase):
    def test_sql_has_mvp_tables_and_blocks_inferred_emotion(self):
        for table in TABLES:
            self.assertIn(f"CREATE TABLE {table}", SQL)
        for column in FORBIDDEN_COLUMNS:
            self.assertIsNone(
                re.search(rf"^\s*{column}\s+(text|smallint|integer|numeric|jsonb|boolean|uuid)", SQL, re.M),
                column,
            )
            self.assertIn(f"'{column}'", SQL)
        self.assertIn("partner_feeling", SQL)
        self.assertIn("status = 'UNKNOWN'", SQL)
        self.assertIn("SUCCESS_PATTERN", SQL)
        self.assertIn("outcome_backed", SQL)
        self.assertNotIn("EXTERNAL", SQL)
        for intent in VOCAB["intents"]:
            self.assertIn(intent, SQL)
        for action_type in VOCAB["action_types"]:
            self.assertIn(action_type, SQL)
        for stage in VOCAB["stages"]:
            self.assertIn(stage, SQL)

    def test_prompts_encode_the_rules(self):
        system = (ROOT / "prompts" / "system_v1.txt").read_text(encoding="utf-8")
        router = (ROOT / "prompts" / "router_v1.txt").read_text(encoding="utf-8")
        recommend = (ROOT / "prompts" / "recommend_v1.txt").read_text(encoding="utf-8")
        memory = (ROOT / "prompts" / "memory_v1.txt").read_text(encoding="utf-8")
        for token in ("UNKNOWN", "最大4", "推測しない", "outcome_backed", "休む"):
            self.assertIn(token, system)
        self.assertIn("0.75", router)
        self.assertIn("primary_intent null", router)
        self.assertIn("1〜5", recommend)
        self.assertIn("partner_feeling", recommend)
        self.assertIn("極性", recommend)
        self.assertIn("同一 intent", recommend)
        self.assertIn("CHAT_ONLY", memory)
        self.assertIn("reusable_next_time", memory)


if __name__ == "__main__":
    unittest.main()
