"""ARUP fanta codec.

ARUP's ``update_data`` element type depends on the sibling ``update_type``
field (``player_count`` = numbers, the rest strings), which the generic walker
cannot express. ``update_type`` carries its string value in JSON but the legacy
integer from ``x-wire-ints`` on the wire.
"""

from __future__ import annotations

from typing import Any, Dict, List

from ..errors import AolibError
from ..fanta import escape_fanta, register_codec, unescape_fanta
from ..generated.schemas import AreaUpdateTypeEnumSchema

VALUES = AreaUpdateTypeEnumSchema["enum"]
WIRE_INTS = AreaUpdateTypeEnumSchema["x-wire-ints"]
PLAYER_COUNT_INT = WIRE_INTS[VALUES.index("player_count")]


def _to_wire_int(value: Any) -> int:
    try:
        idx = VALUES.index(str(value))
    except ValueError:
        raise AolibError(f"ARUP: unknown update_type {value!r}")
    return WIRE_INTS[idx]


def _from_wire_int(token: str) -> str:
    try:
        idx = WIRE_INTS.index(int(token))
    except (ValueError, TypeError):
        raise AolibError(f"ARUP: unknown update_type wire value {token!r}")
    return VALUES[idx]


def _number_or_zero(token: str) -> Any:
    try:
        n = int(token)
    except ValueError:
        try:
            n = float(token)
        except ValueError:
            return 0
    return n


class _ARUPCodec:
    def encode_fanta(self, packet: Dict[str, Any]) -> List[str]:
        wire_int = _to_wire_int(packet.get("update_type"))
        data = packet.get("update_data") or []
        if wire_int == PLAYER_COUNT_INT:
            slots = [str(v) for v in data]
        else:
            slots = [escape_fanta(str(v)) for v in data]
        return [str(wire_int), *slots]

    def decode_fanta(self, args: List[str]) -> Dict[str, Any]:
        token = args[0] if args else str(PLAYER_COUNT_INT)
        update_type = _from_wire_int(token)
        rest = args[1:]
        if int(token) == PLAYER_COUNT_INT:
            update_data = [_number_or_zero(v) for v in rest]
        else:
            update_data = [unescape_fanta(v) for v in rest]
        return {"update_type": update_type, "update_data": update_data}


register_codec("ARUP", _ARUPCodec())
