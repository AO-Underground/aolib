"""RT fanta codec: one ``animation`` in JSON, ``name#variant`` on the wire."""

from __future__ import annotations

import re
from typing import Any, Dict, List

from ..errors import AolibError
from ..fanta import escape_fanta, register_codec, unescape_fanta

TO_WIRE = {
    "witness_testimony": ("testimony1", "0"),
    "end_animation": ("testimony1", "1"),
    "cross_examination": ("testimony2", "0"),
    "not_guilty": ("judgeruling", "0"),
    "guilty": ("judgeruling", "1"),
}

_INT_RE = re.compile(r"[+-]?\d+")


def _variant_of(token: Any) -> int:
    if token is not None and _INT_RE.fullmatch(token):
        return int(token)
    return 0


class _RTCodec:
    def encode_fanta(self, packet: Dict[str, Any]) -> List[str]:
        animation = str(packet.get("animation", ""))
        if animation == "custom":
            name = packet.get("name")
            return [escape_fanta(name if isinstance(name, str) else "")]
        wire = TO_WIRE.get(animation)
        if wire is None:
            raise AolibError(f"RT: unknown animation {animation!r}")
        return list(wire)

    def decode_fanta(self, args: List[str]) -> Dict[str, Any]:
        name = args[0] if args else ""
        variant = _variant_of(args[1] if len(args) > 1 else None)
        if name == "":
            raise AolibError("RT: empty animation slot")
        if name == "testimony1":
            return {"animation": "end_animation" if variant == 1 else "witness_testimony"}
        if name == "testimony2":
            return {"animation": "cross_examination"}
        if name == "judgeruling":
            if variant == 0:
                return {"animation": "not_guilty"}
            if variant == 1:
                return {"animation": "guilty"}
            raise AolibError(f"RT: unknown judgeruling variant {args[1]!r}")
        return {"animation": "custom", "name": unescape_fanta(name)}


register_codec("RT", _RTCodec())
