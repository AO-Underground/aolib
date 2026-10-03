"""Raw AO2 network packet framing.

AO2 network packets are a non-empty header followed by a ``#``-separated list
of parameters, ending with a ``%``. The trailing ``%`` terminator is owned by
the framing layer, not :class:`Packet` itself.
"""

from __future__ import annotations

from typing import List

from .errors import AolibError


class Packet:
    """A raw AO2 packet: a header and a list of ``#``-separated body fields."""

    __slots__ = ("header", "body")

    def __init__(self, header: str, body: List[str]) -> None:
        self.header = header
        self.body = body

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, Packet)
            and self.header == other.header
            and self.body == other.body
        )

    def __repr__(self) -> str:
        return f"Packet(header={self.header!r}, body={self.body!r})"


def new_packet(data: str) -> Packet:
    """Parse a wire frame body (without the trailing ``%``) into a Packet.

    Splits the header off at the first ``#``; the remaining ``#``-separated
    fields become the body, with the empty trailing entry produced by the
    final delimiter removed.
    """
    idx = data.find("#")
    if idx < 0:
        header, rest = data, ""
    else:
        header, rest = data[:idx], data[idx + 1 :]
    if not header.strip():
        raise AolibError("packet header cannot be empty")

    body: List[str] = []
    if rest:
        parts = rest.split("#")
        if len(parts) > 1 and parts[-1] == "":
            parts = parts[:-1]
        body = parts
    return Packet(header, body)


def packet_to_string(p: Packet) -> str:
    """Render a Packet as ``HEADER#a#b#%``."""
    out = p.header
    for s in p.body:
        out += "#" + s
    return out + "#%"
