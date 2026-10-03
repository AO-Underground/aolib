"""Decode: wire string -> typed packet (dict)."""

from __future__ import annotations

import json
from typing import Any, Dict

from .errors import AolibError
from .fanta import from_fanta_args
from .validate import validate
from . import codecs  # noqa: F401  registers the ARUP/RT codecs


def header_of(schema: Dict[str, Any]) -> str:
    header = schema.get("properties", {}).get("$header", {}).get("const")
    if not isinstance(header, str):
        raise AolibError("decode: schema is missing a string `$header` const")
    return header


def read_header(wire: str) -> str:
    """Read a frame's header without fully decoding the body."""
    if wire.startswith("{"):
        parsed = json.loads(wire)
        header = parsed.get("$header")
        if not isinstance(header, str):
            raise AolibError("JSON envelope missing $header string")
        return header
    idx = wire.find("#")
    return wire if idx == -1 else wire[:idx]


def decode(schema: Dict[str, Any], wire: str) -> Dict[str, Any]:
    return _decode_json(schema, wire) if wire.startswith("{") else _decode_fanta(schema, wire)


def _decode_json(schema: Dict[str, Any], wire: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(wire)
    except json.JSONDecodeError as exc:
        raise AolibError(f"Invalid JSON wire: {exc.msg}")

    expected = header_of(schema)
    if parsed.get("$header") != expected:
        raise AolibError(
            f"Wire header mismatch: expected {expected!r}, got {str(parsed.get('$header'))!r}"
        )

    props = schema.get("properties", {})
    fields: Dict[str, Any] = {}
    extras: Dict[str, Any] = {}
    for key, value in parsed.items():
        (fields if key in props else extras)[key] = value
    validate(schema, fields)
    strip_consts(schema, fields)
    if extras:
        fields["$extras"] = extras
    return fields


def strip_consts(schema: Dict[str, Any], value: Dict[str, Any]) -> None:
    """Drop properties fixed by ``const`` (except ``$header``, the packet's
    discriminant) so the decoded shape matches the typed surface."""
    for key, sub in schema.get("properties", {}).items():
        if key == "$header":
            continue
        if "const" in sub:
            value.pop(key, None)


def _decode_fanta(schema: Dict[str, Any], wire: str) -> Dict[str, Any]:
    # Peel terminator forms: canonical `HEADER#a#b#%`, plus legacy
    # `HEADER#a#b#` and `HEADER#a#b`.
    trimmed = wire
    if trimmed.endswith("%"):
        trimmed = trimmed[:-1]
    if trimmed.endswith("#"):
        trimmed = trimmed[:-1]

    all_parts = trimmed.split("#")
    expected = header_of(schema)
    if all_parts[0] != expected:
        raise AolibError(
            f"Wire header mismatch: expected {expected!r}, got {all_parts[0]!r}"
        )
    args = all_parts[1:]

    partial = from_fanta_args(schema, args)
    partial["$header"] = expected
    validate(schema, partial)
    strip_consts(schema, partial)
    return partial
