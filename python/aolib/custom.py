"""Custom packets: headers the spec doesn't define.

With a schema they get the spec packets' JSON, FantaCode and validation;
without one they are JSON-only. ``fanta`` and ``json`` override either form.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from .decode import decode
from .encode import encode, frame_fanta
from .errors import AolibError
from .generated.packets import c2s_schemas, s2c_schemas
from .validate import compile_schema, validate


@dataclass
class FantaForm:
    """The FantaCode fields between the header and ``%``."""

    encode: Callable[[Dict[str, Any]], List[str]]
    decode: Callable[[List[str]], Dict[str, Any]]


@dataclass
class JsonForm:
    """A JSON object; the library puts ``$header`` first."""

    encode: Callable[[Dict[str, Any]], str]
    decode: Callable[[str], Dict[str, Any]]


@dataclass
class PacketOptions:
    schema: Optional[Dict[str, Any]] = None
    fanta: Optional[FantaForm] = None
    json: Optional[JsonForm] = None


@dataclass
class _CustomPacket:
    header: str
    options: PacketOptions
    schema: Optional[Dict[str, Any]] = None


_custom_packets: Dict[str, _CustomPacket] = {}
_TRAILING = re.compile(r"#?%$")


def register_packet(header: str, options: Optional[PacketOptions] = None) -> None:
    """Register a header the spec doesn't define. Throws for a spec header."""
    options = options or PacketOptions()
    if header in c2s_schemas or header in s2c_schemas:
        raise AolibError(f"aolib: '{header}' is a spec packet; add fields to it with $extras")

    schema = options.schema
    if schema is not None:
        declared = schema.get("properties", {}).get("$header", {}).get("const")
        if declared is not None and declared != header:
            raise AolibError(f"aolib: schema for '{header}' declares $header {declared!r}")
        schema = {
            "$id": f"/packets/schemas/{header}.schema.json",
            "title": header,
            **schema,
            "properties": {"$header": {"type": "string", "const": header}, **(schema.get("properties") or {})},
        }
        compile_schema(schema)

    _custom_packets[header] = _CustomPacket(header, options, schema)


def encode_custom(header: str, payload: Dict[str, Any], mode: str) -> str:
    """Encode a registered custom packet; throws if it has no form for ``mode``."""
    c = _custom_packets.get(header)
    if c is None:
        raise AolibError(f"aolib: '{header}' is not registered; call register_packet first")

    form = c.options.json if mode == "json" else c.options.fanta
    if form is None:
        if c.schema is not None:
            return encode(c.schema, payload, mode)
        if mode == "fanta":
            raise AolibError(f"aolib: '{header}' is JSON-only and this session is in FantaCode mode")
        extras = payload.get("$extras")
        own = {k: v for k, v in payload.items() if k != "$extras"}
        return json.dumps(
            {"$header": header, **own, **(extras or {})}, separators=(",", ":"), ensure_ascii=False
        )

    if c.schema is not None:
        validate(c.schema, {"$header": header, **payload})

    if mode == "json" and c.options.json is not None:
        rest = json.loads(c.options.json.encode(payload))
        rest.pop("$header", None)
        return json.dumps({"$header": header, **rest}, separators=(",", ":"), ensure_ascii=False)

    args = c.options.fanta.encode(payload)
    return frame_fanta(header, args)


def decode_custom(header: str, wire: str) -> Optional[Dict[str, Any]]:
    """Decode a frame for a registered custom packet; None when unregistered
    or it has no form for the frame's format."""
    c = _custom_packets.get(header)
    if c is None:
        return None
    is_json = wire.startswith("{")

    if is_json and c.options.json is not None:
        packet = {**c.options.json.decode(wire), "$header": header}
    elif not is_json and c.options.fanta is not None:
        rest = _TRAILING.sub("", wire)[len(header) + 1 :]
        packet = {**c.options.fanta.decode([] if rest == "" else rest.split("#")), "$header": header}
    elif c.schema is not None:
        return decode(c.schema, wire)
    elif is_json:
        return json.loads(wire)
    else:
        return None

    if c.schema is not None:
        validate(c.schema, packet)
    return packet
