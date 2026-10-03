"""Low-level wire access, for callers that bypass the session layer.

Re-exports the encode/decode/validate primitives plus the direction maps and
the fanta walker helpers, mirroring aolib-ts's ``wire`` subpath.
"""

from __future__ import annotations

from .encode import encode, WireMode
from .decode import decode, read_header
from .validate import validate
from .fanta import (
    escape_fanta,
    unescape_fanta,
    to_fanta_args,
    from_fanta_args,
    register_codec,
    lookup_codec,
    register_ref_schema,
    resolve_ref,
)
from .generated.packets import c2s_schemas, s2c_schemas, Packet

__all__ = [
    "encode",
    "WireMode",
    "decode",
    "read_header",
    "validate",
    "escape_fanta",
    "unescape_fanta",
    "to_fanta_args",
    "from_fanta_args",
    "register_codec",
    "lookup_codec",
    "register_ref_schema",
    "resolve_ref",
    "c2s_schemas",
    "s2c_schemas",
    "Packet",
]
