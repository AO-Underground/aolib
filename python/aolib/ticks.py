"""[soundt] and MS sfx_delay are in ticks of this many milliseconds."""

from __future__ import annotations

TICK_MS = 40


def ms_to_ticks(ms: int) -> int:
    """Milliseconds to ticks, rounding half up."""
    return int(ms / TICK_MS + 0.5)


def ticks_to_ms(ticks: int) -> int:
    return ticks * TICK_MS
