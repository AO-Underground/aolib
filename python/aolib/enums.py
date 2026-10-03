"""Re-exports of generated enums + shared types, plus non-schema helpers."""

from __future__ import annotations

from typing import List, Union

from .generated.enums import Side
from .generated.enums import *  # noqa: F401,F403
from .generated.types import *  # noqa: F401,F403

# ARUP payload: numbers for player_count, strings for everything else.
AreaUpdateData = Union[List[int], List[str]]


def is_full_view(s: str) -> bool:
    """True for sides whose layout uses the full-view pan-camera (def/pro/wit).

    ``s`` may be a ``Side`` member or a plain string; ``Side.def_`` compares
    equal to the string ``"def"`` (Python's ``def`` keyword needs the ``_``).
    """
    return s in (Side.def_, Side.pro, Side.wit)
