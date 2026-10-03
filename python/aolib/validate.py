"""JSON-Schema-driven validation.

Mirrors aolib-ts's Ajv setup (``useDefaults``, ``removeAdditional``) by filling
defaults itself and then checking with the ``jsonschema`` library. The shared
enum/type schemas are registered so packet ``$ref``s resolve, and the same
registry feeds the fanta walker's ``$ref`` resolution.
"""

from __future__ import annotations

import copy
from typing import Any, Dict, List

from jsonschema import Draft7Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT7

from .errors import ValidationError
from .fanta import register_ref_schema, resolve_ref
from .generated.packets import enum_schemas, type_schemas

# Register shared enum + type schemas so packet $refs resolve at both the
# validator and the walker. Each $id is an absolute path (e.g. /types/Side...).
_resources: List = []
for _schema in enum_schemas + type_schemas:
    _id = _schema.get("$id")
    if _id:
        register_ref_schema(_id, _schema)
        _resources.append((_id, Resource.from_contents(_schema, default_specification=DRAFT7)))
_registry = Registry().with_resources(_resources)

_validators: Dict[int, Draft7Validator] = {}


def _validator(schema: Dict[str, Any]) -> Draft7Validator:
    key = id(schema)
    v = _validators.get(key)
    if v is None:
        v = Draft7Validator(schema, registry=_registry)
        _validators[key] = v
    return v


def compile_schema(schema: Dict[str, Any]) -> None:
    """Eagerly check a caller's schema (e.g. a custom packet) is well-formed."""
    Draft7Validator.check_schema(schema)


def apply_defaults(schema: Dict[str, Any], value: Dict[str, Any], base_id: str = "") -> None:
    """Fill ``default`` values for missing properties, recursively."""
    schema = resolve_ref(schema, base_id)
    new_base = schema.get("$id", base_id)
    props = schema.get("properties")
    if not props:
        return
    for key, sub in props.items():
        if key not in value:
            if "default" in sub:
                value[key] = copy.deepcopy(sub["default"])
            continue
        resolved = resolve_ref(sub, new_base)
        if resolved.get("type") == "object" and isinstance(value[key], dict):
            apply_defaults(resolved, value[key], new_base)


def validate(schema: Dict[str, Any], value: Dict[str, Any]) -> None:
    """Validate ``value`` against ``schema``, filling defaults in place.

    Throws :class:`ValidationError` on failure.
    """
    apply_defaults(schema, value)
    errors = list(_validator(schema).iter_errors(value))
    if errors:
        detail = "; ".join(f"{e.json_path} {e.message}" for e in errors)
        header = schema.get("title", "<packet>")
        raise ValidationError(header, detail)
