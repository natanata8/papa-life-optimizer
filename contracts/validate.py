"""Subset JSON Schema validator used by the MVP contract tests.

Supported: $ref to #/$defs, type (including null unions), required,
properties, additionalProperties false, enum, const, items, minItems,
maxItems, minLength, maxLength, minimum, maximum, allOf, if/then/else.
"""

from __future__ import annotations


def validate(instance, schema, defs=None):
    if defs is None:
        defs = schema.get("$defs", {})
    errors = []
    _validate(instance, schema, defs, "$", errors)
    return errors


def _validate(instance, schema, defs, path, errors):
    if "$ref" in schema:
        name = schema["$ref"].rsplit("/", 1)[-1]
        if name not in defs:
            errors.append(f"{path}: unresolved $ref {schema['$ref']}")
            return
        _validate(instance, defs[name], defs, path, errors)
        return

    if "allOf" in schema:
        for index, subschema in enumerate(schema["allOf"]):
            _validate(instance, subschema, defs, f"{path}.allOf[{index}]", errors)

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
