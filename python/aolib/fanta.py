"""Fanta wire-format walker, driven by JSON Schema.

One positional slot per top-level property (skipping ``$header``, which the
framing layer carries). Per-property semantics come from the JSON Schema:

  ``"string"``           escape-fanta on encode, unescape-fanta on decode
  ``"number"/"integer"`` str(n) on encode, number on decode
  ``"boolean"``          ``"1"``/``"0"`` on encode, ``token == "1"`` on decode
  ``"object"``           recurse, join sub-tokens with ``&`` (or the
                         ``x-fanta-separator`` value, ``|`` for MS effect; an
                         all-empty object collapses to an empty slot). Optional
                         ``x-fanta-unescape-amp: true`` tolerates the legacy
                         ``<and>`` form on decode. With ``x-wire-bits``, one
                         integer slot of OR'd flags.
  ``"array"``            greedy, consumes all remaining slots
  ``const``              emitted as the const value; on decode the slot is
                         consumed but the schema-fixed value is used

Custom packets register a codec via ``x-fanta-codec`` at the schema level
(ARUP, RT). The codec gets the raw args and returns the partial packet (and
vice versa). Validation, default-filling, and required-checking are the
validator's job; this walker only converts between the typed value and its
positional-token form.
"""

from __future__ import annotations

import copy
import re
from typing import Any, Dict, List, Optional, Protocol, Tuple

from .errors import AolibError


# --- Chat-escape helpers, public so custom codecs can reuse. ---

def escape_fanta(s: str) -> str:
    return (
        s.replace("#", "<num>")
        .replace("&", "<and>")
        .replace("%", "<percent>")
        .replace("$", "<dollar>")
    )


def unescape_fanta(s: str) -> str:
    return (
        s.replace("<num>", "#")
        .replace("<and>", "&")
        .replace("<percent>", "%")
        .replace("<dollar>", "$")
    )


# --- Custom codec registry. ---

class Codec(Protocol):
    def encode_fanta(self, packet: Dict[str, Any]) -> List[str]: ...

    def decode_fanta(self, args: List[str]) -> Dict[str, Any]: ...


_codecs: Dict[str, Codec] = {}


def register_codec(name: str, codec: Codec) -> None:
    _codecs[name] = codec


def lookup_codec(name: str) -> Optional[Codec]:
    return _codecs.get(name)


def _get_codec(name: str) -> Codec:
    codec = _codecs.get(name)
    if codec is None:
        raise AolibError(f"fanta: no codec registered as '{name}'")
    return codec


# --- $ref registry, mirrors the validator's registry so the walker can look
# through ``$ref`` to find the underlying type/enum. Schemas are keyed by
# their ``$id`` (e.g. ``/types/Side.schema.json``).

_ref_schemas: Dict[str, Dict[str, Any]] = {}


def register_ref_schema(id: str, schema: Dict[str, Any]) -> None:
    _ref_schemas[id] = schema


def resolve_path(ref: str, base: str) -> str:
    """RFC 3986 §5.2-style path resolution for the absolute-path ``$id``s."""
    if not base:
        return ref
    if ref.startswith("/"):
        return ref
    base_dir = base[: base.rfind("/") + 1]
    parts: List[str] = []
    for seg in (base_dir + ref).split("/"):
        if seg == "..":
            if parts:
                parts.pop()
        elif seg not in (".", ""):
            parts.append(seg)
    return ("/" if base.startswith("/") else "") + "/".join(parts)


def resolve_ref(s: Dict[str, Any], base_id: str) -> Dict[str, Any]:
    """Resolve a ``$ref`` against the registry. Sibling keywords on the
    referring property (e.g. ``default``) win over the referenced schema."""
    ref = s.get("$ref")
    if not ref:
        return s
    target = _ref_schemas.get(resolve_path(ref, base_id))
    if target is None:
        return s
    return {**target, **s}


# --- Schema keyword helpers. ---

def json_type(s: Dict[str, Any]) -> Optional[str]:
    t = s.get("type")
    if isinstance(t, str):
        return t
    if isinstance(t, list) and t:
        return t[0]
    return None


def _wire_ints(s: Dict[str, Any]) -> Optional[List[int]]:
    w = s.get("x-wire-ints")
    return w if isinstance(w, list) else None


def _wire_bits(s: Dict[str, Any]) -> Optional[List[int]]:
    w = s.get("x-wire-bits")
    return w if isinstance(w, list) else None


def _wire_int_of(schema: Dict[str, Any], value: Any) -> Optional[str]:
    w = _wire_ints(schema)
    if not w or not isinstance(schema.get("enum"), list):
        return None
    enum = schema["enum"]
    try:
        idx = enum.index(value)
    except ValueError:
        idx = -1
    if idx == -1 or idx >= len(w):
        raise AolibError(
            f"fanta: value {value!r} is not a member of the enum {schema.get('$id', '')}"
        )
    return str(w[idx])


def _enum_from_wire_int(schema: Dict[str, Any], token: str, name: str) -> Any:
    w = _wire_ints(schema)
    if not w or not isinstance(schema.get("enum"), list):
        return None
    try:
        n = int(token)
    except ValueError:
        n = -1
    try:
        idx = w.index(n)
    except ValueError:
        idx = -1
    if idx == -1:
        raise AolibError(f"Invalid enum wire value for field '{name}': {token!r}")
    return schema["enum"][idx]


def _suffix_of(props: Dict[str, Any], base: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    for name, sub in props.items():
        if sub.get("x-fanta-suffix-of") == base:
            return (name, sub)
    return None


def _suffix_wire_of(schema: Dict[str, Any], value: Any) -> str:
    w = _wire_int_of(schema, value)
    return w if w is not None else str(value)


# --- Per-property token codecs. ---

_INT_RE = re.compile(r"-?\d+")


def _number(token: str) -> Any:
    """Parse a wire number token: int when integral, else float."""
    if _INT_RE.fullmatch(token):
        return int(token)
    return float(token)


def _js_type(value: Any) -> str:
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, str):
        return "string"
    if isinstance(value, (int, float)):
        return "number"
    return "string"


def _encode_scalar(t: Optional[str], value: Any) -> str:
    if t == "string":
        return escape_fanta("" if value is None else value)
    if t == "boolean":
        return "1" if value else "0"
    return str(value)


def _decode_scalar(t: Optional[str], token: str, name: str) -> Any:
    if t == "string":
        return unescape_fanta(token)
    if t == "boolean":
        if token not in ("0", "1"):
            raise AolibError(
                f'Invalid boolean for field \'{name}\': expected "0" or "1", got {token!r}'
            )
        return token == "1"
    if t in ("integer", "number"):
        if token == "":
            raise AolibError(f"Invalid number for field '{name}': empty token")
        try:
            return _number(token)
        except ValueError:
            raise AolibError(f"Invalid number for field '{name}': {token!r}")
    return token


def encode_token(raw_schema: Dict[str, Any], value: Any, base_id: str) -> str:
    schema = resolve_ref(raw_schema, base_id)
    if "const" in schema:
        return _encode_scalar(_js_type(schema["const"]), schema["const"])

    w = _wire_int_of(schema, value)
    if w is not None:
        return w

    t = json_type(schema)
    if t == "array":
        items = schema.get("items", {})
        vals = value if value is not None else []
        return "&".join(encode_token(items, v, base_id) for v in vals)

    bits = _wire_bits(schema)
    if bits:
        obj = value if value is not None else {}
        n = 0
        for i, k in enumerate(schema.get("properties", {})):
            if obj.get(k) is True:
                n |= bits[i] if i < len(bits) else 0
        return str(n)

    if t == "object":
        sep = schema.get("x-fanta-separator", "&")
        if not isinstance(sep, str):
            sep = "&"
        obj = value if value is not None else {}
        parts = [
            encode_token(sub, obj.get(k), base_id)
            for k, sub in schema.get("properties", {}).items()
        ]
        if schema.get("x-fanta-separator") and all(p == "" for p in parts):
            return ""
        return sep.join(parts)

    return _encode_scalar(t, value)


def decode_token(raw_schema: Dict[str, Any], token: str, name: str, base_id: str) -> Any:
    schema = resolve_ref(raw_schema, base_id)
    if "const" in schema:
        return schema["const"]

    enum_value = _enum_from_wire_int(schema, token, name)
    if enum_value is not None:
        return enum_value

    t = json_type(schema)
    if t == "array":
        items = schema.get("items", {})
        if token == "":
            return []
        return [
            decode_token(items, v, f"{name}[{i}]", base_id)
            for i, v in enumerate(token.split("&"))
        ]

    bits = _wire_bits(schema)
    if bits:
        if not re.fullmatch(r"\d+", token):
            raise AolibError(f"Invalid bitfield for field '{name}': {token!r}")
        n = int(token)
        result: Dict[str, bool] = {}
        for i, k in enumerate(schema.get("properties", {})):
            result[k] = (n & (bits[i] if i < len(bits) else 0)) != 0
        return result

    if t == "object":
        if token == "" and "default" in schema:
            return copy.deepcopy(schema["default"])
        sep = schema.get("x-fanta-separator", "&")
        if not isinstance(sep, str):
            sep = "&"
        raw = token.replace("<and>", "&") if schema.get("x-fanta-unescape-amp") else token
        parts = raw.split(sep)
        result = {}
        for i, (k, sub) in enumerate(schema.get("properties", {}).items()):
            part = parts[i] if i < len(parts) else None
            default = resolve_ref(sub, base_id).get("default")
            if part is None and default is not None:
                result[k] = copy.deepcopy(default)
            else:
                result[k] = decode_token(sub, part if part is not None else "", f"{name}.{k}", base_id)
        return result

    return _decode_scalar(t, token, name)


# --- Args-list walker (top-level). ---

def to_fanta_args(schema: Dict[str, Any], packet: Dict[str, Any]) -> List[str]:
    if schema.get("x-fanta-codec"):
        return _get_codec(schema["x-fanta-codec"]).encode_fanta(packet)

    base_id = schema.get("$id", "")
    args: List[str] = []
    props = schema.get("properties", {})
    for name, sub in props.items():
        if name == "$header":
            continue
        if sub.get("x-fanta-suffix-of"):
            continue

        if json_type(sub) == "array":
            items = packet.get(name) or []
            elem = sub.get("items", {})
            for item in items:
                args.append(encode_token(elem, item, base_id))
            continue

        entry = _suffix_of(props, name)
        if entry is not None:
            sfx_name, sfx_sub = entry
            sfx_resolved = resolve_ref(sfx_sub, base_id)
            base = encode_token(sub, packet.get(name), base_id)
            base_default = resolve_ref(sub, base_id).get("default")
            if packet.get(name) != base_default and packet.get(sfx_name) != sfx_resolved.get("default"):
                args.append(f"{base}^{_suffix_wire_of(sfx_resolved, packet.get(sfx_name))}")
            else:
                args.append(base)
            continue

        args.append(encode_token(sub, packet.get(name), base_id))
    return args


def from_fanta_args(schema: Dict[str, Any], args: List[str]) -> Dict[str, Any]:
    if schema.get("x-fanta-codec"):
        return _get_codec(schema["x-fanta-codec"]).decode_fanta(args)

    base_id = schema.get("$id", "")
    result: Dict[str, Any] = {}
    props = schema.get("properties", {})
    cursor = 0
    for name, sub in props.items():
        if name == "$header":
            continue
        if sub.get("x-fanta-suffix-of"):
            continue

        if json_type(sub) == "array":
            elem = sub.get("items", {})
            result[name] = [
                decode_token(elem, token, f"{name}[{i}]", base_id)
                for i, token in enumerate(args[cursor:])
            ]
            cursor = len(args)
            continue

        if cursor >= len(args):
            token = None
        else:
            token = args[cursor]
            cursor += 1
        if token is None:
            continue

        entry = _suffix_of(props, name)
        if entry is not None:
            sfx_name, sfx_sub = entry
            i = token.find("^")
            if i >= 0:
                result[name] = decode_token(sub, token[:i], name, base_id)
                result[sfx_name] = decode_token(sfx_sub, token[i + 1 :], sfx_name, base_id)
            else:
                result[name] = decode_token(sub, token, name, base_id)
            continue

        result[name] = decode_token(sub, token, name, base_id)
    return result

