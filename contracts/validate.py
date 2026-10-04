"""Subset JSON Schema validator used by the MVP contract tests.

Supported: $ref to #/$defs or #/components/schemas, type (including null
unions), required, properties, additionalProperties false, enum, const,
items, minItems, maxItems, minLength, maxLength, minimum, maximum, allOf,
oneOf, if/then/else.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def validate(instance, schema, defs=None):
    if defs is None:
        defs = schema.get("$defs") or schema.get("components", {}).get("schemas") or {}
        if "$defs" not in schema and "components" not in schema:
            # Allow passing a root schema object that already is the target, with
            # defs supplied separately by callers.
            pass
    errors = []
    _validate(instance, schema, defs or {}, "$", errors)
    return errors


def _resolve_ref(ref, defs):
    if ref.startswith("#/$defs/") or ref.startswith("#/components/schemas/"):
        name = ref.rsplit("/", 1)[-1]
        if name not in defs:
            return None, f"unresolved $ref {ref}"
        return defs[name], None
    return None, f"unsupported $ref {ref}"


def _validate(instance, schema, defs, path, errors):
    if "$ref" in schema:
        target, error = _resolve_ref(schema["$ref"], defs)
        if error:
            errors.append(f"{path}: {error}")
            return
        _validate(instance, target, defs, path, errors)
        return

    if "allOf" in schema:
        for index, subschema in enumerate(schema["allOf"]):
            _validate(instance, subschema, defs, f"{path}.allOf[{index}]", errors)

    if "oneOf" in schema:
        matches = 0
        for index, subschema in enumerate(schema["oneOf"]):
            sub_errors = []
            _validate(instance, subschema, defs, f"{path}.oneOf[{index}]", sub_errors)
            if not sub_errors:
                matches += 1
        if matches != 1:
            errors.append(f"{path}: expected exactly one oneOf match, got {matches}")

    if "if" in schema:
        if_errors = []
        _validate(instance, schema["if"], defs, path, if_errors)
        branch = schema.get("then") if not if_errors else schema.get("else")
        if branch is not None:
            _validate(instance, branch, defs, path, errors)

    if "const" in schema and instance != schema["const"]:
        errors.append(f"{path}: expected const {schema['const']!r}")

    if "enum" in schema and instance not in schema["enum"]:
        errors.append(f"{path}: {instance!r} not in enum")

    expected = schema.get("type")
    if expected is not None and not _type_ok(instance, expected):
        errors.append(f"{path}: expected {expected}, got {_type_name(instance)}")
        return

    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            errors.append(f"{path}: shorter than {schema['minLength']}")
        if "maxLength" in schema and len(instance) > schema["maxLength"]:
            errors.append(f"{path}: longer than {schema['maxLength']}")

    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            errors.append(f"{path}: below minimum")
        if "maximum" in schema and instance > schema["maximum"]:
            errors.append(f"{path}: above maximum")

    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            errors.append(f"{path}: fewer than {schema['minItems']} items")
        if "maxItems" in schema and len(instance) > schema["maxItems"]:
            errors.append(f"{path}: more than {schema['maxItems']} items")
        if "items" in schema:
            for index, item in enumerate(instance):
                _validate(item, schema["items"], defs, f"{path}[{index}]", errors)

    if isinstance(instance, dict) and (
        "properties" in schema or "required" in schema or "additionalProperties" in schema
    ):
        properties = schema.get("properties", {})
        required = schema.get("required", [])
        for key in required:
            if key not in instance:
                errors.append(f"{path}: missing {key}")
        additional = schema.get("additionalProperties", True)
        for key, value in instance.items():
            if key in properties:
                _validate(value, properties[key], defs, f"{path}.{key}", errors)
            elif additional is False:
                errors.append(f"{path}: additional property {key}")


def _type_ok(instance, expected):
    if isinstance(expected, list):
        return any(_type_ok(instance, item) for item in expected)
    if expected == "object":
        return isinstance(instance, dict)
    if expected == "array":
        return isinstance(instance, list)
    if expected == "string":
        return isinstance(instance, str)
    if expected == "integer":
        return isinstance(instance, int) and not isinstance(instance, bool)
    if expected == "number":
        return isinstance(instance, (int, float)) and not isinstance(instance, bool)
    if expected == "boolean":
        return isinstance(instance, bool)
    if expected == "null":
        return instance is None
    return False


def _type_name(instance):
    if instance is None:
        return "null"
    if isinstance(instance, bool):
        return "boolean"
    if isinstance(instance, int):
        return "integer"
    if isinstance(instance, float):
        return "number"
    if isinstance(instance, str):
        return "string"
    if isinstance(instance, list):
        return "array"
    if isinstance(instance, dict):
        return "object"
    return type(instance).__name__


def main(argv=None):
    root = Path(__file__).resolve().parent
    repo = root.parent
    if str(repo) not in sys.path:
        sys.path.insert(0, str(repo))
    schema = json.loads((root / "schemas" / "mvp.schema.json").read_text(encoding="utf-8"))
    openapi = json.loads((root / "openapi" / "mvp.openapi.json").read_text(encoding="utf-8"))
    openapi_defs = openapi["components"]["schemas"]
    from contracts.policy import consult

    consultations = json.loads((root / "fixtures" / "consultations.json").read_text(encoding="utf-8"))
    failures = []
    for case in consultations:
        result = consult(case["input"])
        schema_errors = validate(result, {"$ref": "#/$defs/ConsultationTurn", **schema})
        openapi_errors = validate(
            result, openapi_defs["ConsultationTurn"], defs=openapi_defs
        )
        if schema_errors:
            failures.append(f"{case['id']} schema: {schema_errors}")
        if openapi_errors:
            failures.append(f"{case['id']} openapi: {openapi_errors}")
    if failures:
        for item in failures:
            print(item, file=sys.stderr)
        return 1
    print(f"validated {len(consultations)} consultation turns against schema and OpenAPI")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
