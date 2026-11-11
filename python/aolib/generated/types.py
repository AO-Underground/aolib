# AUTO-GENERATED from spec/. Do not edit; run `python scripts/codegen.py`.

from typing import Dict, List, TypedDict

class Effect(TypedDict):
    """MS screen-effect overlay request: effect name, misc folder, and sound, packed into one `name|folder|sound` wire slot. An all-empty value means no effect and encodes as `||`, as AO2 sends it; an empty slot from older senders decodes to it."""
    name: str
    folder: str
    sound: str

class MusicEffects(TypedDict):
    """Transition effects for an MC track change."""
    fade_in: bool
    fade_out: bool
    sync_position: bool

class Offset(TypedDict):
    """Integer (x, y) screen-coordinate pair carried in MS offset / paired_offset slots."""
    x: float
    y: float

