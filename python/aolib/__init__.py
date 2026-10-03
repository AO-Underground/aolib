"""aolib-python: the Attorney Online 2 protocol in Python.

A 1:1 port of aolib-ts / aolib-go, generated from the canonical spec/
schemas. Packets are plain dicts (JSON-shaped), with generated ``TypedDict``
aliases and ``str, Enum`` enums for the typed surface.

The everyday surface: session factories, packet types, enums, and the
char.ini parser. Lower-level wire primitives (encode/decode/validate, the
fanta walker, the dispatch registries) live under the ``aolib.wire`` subpath,
reachable but out of the way.
"""

from __future__ import annotations

# Session: the main surface.
from .session import server, client, SessionConfig, ServerSession, ClientSession

# Custom packets: headers the spec doesn't define (EXTENDING.md).
from .custom import register_packet, PacketOptions, FantaForm, JsonForm

# Asset formats.
from .charini import parse_char_ini, ms_to_ticks, ticks_to_ms

# Raw framing + fanta escape helpers.
from .aopacket import Packet, new_packet, packet_to_string
from .fanta import escape_fanta, unescape_fanta

# Enums and shared types. Each enum is a `str, Enum`, so `Side.def_` == "def".
from .enums import is_full_view
from .generated.enums import *  # noqa: F401,F403
from .generated.types import *  # noqa: F401,F403

# Packet types and direction maps, grouped under `packets`.
from .generated import packets

# Low-level wire access, reachable via `aolib.wire`.
from . import wire

# Errors.
from .errors import AolibError, ValidationError

__version__ = "2.6.1"

__all__ = [
    "server",
    "client",
    "SessionConfig",
    "ServerSession",
    "ClientSession",
    "register_packet",
    "PacketOptions",
    "FantaForm",
    "JsonForm",
    "parse_char_ini",
    "ms_to_ticks",
    "ticks_to_ms",
    "Packet",
    "new_packet",
    "packet_to_string",
    "escape_fanta",
    "unescape_fanta",
    "is_full_view",
    "packets",
    "wire",
    "AolibError",
    "ValidationError",
    "__version__",
]

