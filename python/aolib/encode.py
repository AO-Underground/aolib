"""Encode: typed packet (dict) -> wire string."""

from __future__ import annotations

import json
from typing import Any, Dict, Literal, Optional

from .errors import AolibError
from .fanta import resolve_ref, to_fanta_args
from .validate import validate
from . import codecs  # noqa: F401  registers the ARUP/RT codecs

WireMode = Literal["fanta", "json"]


def header_of(schema: Dict[str, Any]) -> str:
    header = schema.get("properties", {}).get("$header", {}).get("const")
    if not isinstance(header, str):
        raise AolibError("encode: schema is missing a string `$header` const")
    return header


def frame_fanta(header: str, args: list) -> str:
    if not args:
        return f"{header}#%"
    return f"{header}#" + "#".join(args) + "#%"


def order_json(
    schema: Dict[str, Any],
    envelope: Dict[str, Any],
    extras: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """``$header``, then schema fields in schema order (nested objects too),
    then extras sorted by key."""
    out = _ordered(schema, envelope, schema.get("$id", ""))
    props = schema.get("properties", {})
    for key in sorted(extras or {}):
        if key in props or key.startswith("$"):
            raise AolibError(
                f"encode: $extras key '{key}' collides with a schema field or reserved name"
            )
        out[key] = extras[key]
    return out


def _ordered(raw_schema: Dict[str, Any], value: Any, base_id: str) -> Any:
    schema = resolve_ref(raw_schema, base_id)
    items = schema.get("items")
    if isinstance(value, list):
        return [_ordered(items, v, base_id) for v in value] if items else value
    if value is None or not isinstance(value, dict) or "properties" not in schema:
        return value
    out: Dict[str, Any] = {}
    for key, sub in schema.get("properties", {}).items():
        if key in value:
            out[key] = _ordered(sub, value[key], base_id)
    return out


def encode(schema: Dict[str, Any], packet: Dict[str, Any], mode: str) -> str:
    header = header_of(schema)
    extras = packet.get("$extras")
    fields = {k: v for k, v in packet.items() if k not in ("$header", "$extras")}
    envelope = {"$header": header, **fields}
    validate(schema, envelope)

    if mode == "json":
        return json.dumps(
            order_json(schema, envelope, extras), separators=(",", ":"), ensure_ascii=False
        )
    if mode == "fanta":
        return frame_fanta(header, to_fanta_args(schema, envelope))
    raise AolibError(f"aolib: unknown wire mode {mode!r}")
