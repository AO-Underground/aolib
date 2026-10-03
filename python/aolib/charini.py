"""char.ini parser (spec/assets/README.md).

char.ini is INI-shaped but ``#`` is never a comment (it delimits legacy emote
fields), so the base parse keeps ``#`` out of the comment set and a tuning pass
folds the flat sections into a typed result. Two emote encodings normalize to
one ``emotes`` list: ``[emote <name>]`` blocks (preferred), else the legacy
``[emotions]``/``[soundn]``/``[soundt]`` banks.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from .errors import AolibError
from .generated.schemas import DeskModifierEnumSchema, EmoteModifierEnumSchema
from .ticks import ms_to_ticks, ticks_to_ms

TICK_MS = 40

_COMMENT = re.compile(r"(^|[ \t])(;|//).*$", re.MULTILINE)
_INT = re.compile(r"[+-]?\d+")
_EXT = re.compile(r"\.[^.\s]+$")

_BLOCK_MODIFIERS = EmoteModifierEnumSchema["enum"]
_DESK_MODIFIERS = DeskModifierEnumSchema["enum"]


def _strip_comments(text: str) -> str:
    return _COMMENT.sub("", text)


def _parse_ini(text: str):
    sections: Dict[str, Dict[str, str]] = {}
    block_order: List[str] = []
    current: Optional[str] = None
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("[") and line.endswith("]"):
            original = line[1:-1].strip()
            current = original.lower()
            sections.setdefault(current, {})
            if current.startswith("emote "):
                block_order.append(original[6:])
            continue
        if current is None or "=" not in line:
            continue
        key, _, value = line.partition("=")
        sections[current][key.strip().lower()] = value.strip()
    return sections, block_order


def _to_int(value: Optional[str], fallback: int) -> int:
    if value is None:
        return fallback
    v = value.strip()
    return int(v) if _INT.fullmatch(v) else fallback


def _norm_preanim(value: Optional[str]) -> Optional[str]:
    return None if value is None or value == "" or value == "-" else value


def _norm_sound(value: Optional[str]) -> Optional[str]:
    return None if value is None or value == "" else value


def _norm_legacy_sound(value: Optional[str]) -> Optional[str]:
    return None if value in ("0", "1", "-") else _norm_sound(value)


def _unset_deskmod(modifier: str) -> str:
    return "hidden" if modifier in ("zoom", "objection_zoom") else "shown"


def _positive_ms(value: Optional[str]) -> Optional[int]:
    n = _to_int(value, 0)
    return n if n > 0 else None


def _parse_enum(value: Optional[str], allowed: List[str], schema: Dict[str, Any], fallback: str) -> str:
    v = value.strip() if value is not None else ""
    if v in allowed:
        return v
    wire_ints = schema.get("x-wire-ints", [])
    if _INT.fullmatch(v) and int(v) in wire_ints:
        return schema["enum"][wire_ints.index(int(v))]
    return fallback


def _require_enum_name(value: Optional[str], allowed: List[str], field: str, key: str) -> Optional[str]:
    if value is None or value == "":
        return None
    if value not in allowed:
        raise AolibError(f'char.ini emote "{key}": {field} "{value}" must be one of: {", ".join(allowed)}')
    return value


def _require_extension(value: str, field: str, key: str) -> None:
    if not _EXT.search(value):
        raise AolibError(f'char.ini emote "{key}": {field} "{value}" must include a file extension')


def _scaling(value: Optional[str]) -> str:
    if value == "smooth":
        return "smooth"
    if value in ("pixel", "fast"):
        return "pixel"
    return "auto"


def _read_block_emotes(sections: Dict[str, Dict[str, str]], block_order: List[str]) -> List[Dict[str, Any]]:
    emotes: List[Dict[str, Any]] = []
    for key in block_order:
        block = sections.get(f"emote {key.lower()}", {})
        anim = block.get("anim", "")
        _require_extension(anim, "anim", key)
        preanim = _norm_preanim(block.get("preanim"))
        if preanim is not None:
            _require_extension(preanim, "preanim", key)
        postanim = _norm_preanim(block.get("postanim"))
        if postanim is not None:
            _require_extension(postanim, "postanim", key)
        camera = _norm_preanim(block.get("camera"))
        if camera is not None:
            _require_extension(camera, "camera", key)
        sound = _norm_sound(block.get("sound"))
        if sound is not None:
            _require_extension(sound, "sound", key)
        modifier = _require_enum_name(block.get("modifier"), _BLOCK_MODIFIERS, "modifier", key) or "no_preanim"
        deskmod = _require_enum_name(block.get("deskmod"), _DESK_MODIFIERS, "deskmod", key) or _unset_deskmod(modifier)
        delay_ms = _to_int(block.get("sounddelayms"), 0)
        emotes.append(
            {
                "key": key,
                "name": block.get("name", key),
                "anim": anim,
                "preanim": preanim,
                "postanim": postanim,
                "camera": camera,
                "modifier": modifier,
                "deskmod": deskmod,
                "sound": sound,
                "sounddelayms": delay_ms,
                "sounddelayticks": ms_to_ticks(delay_ms),
                "soundlooping": block.get("soundlooping") == "true",
                "preanimdurationms": _positive_ms(block.get("preanimdurationms")),
            }
        )
    return emotes


def _read_legacy_emotes(
    emotion_section: Dict[str, str], sections: Dict[str, Dict[str, str]], count: int
) -> List[Dict[str, Any]]:
    sound_n = sections.get("soundn", {})
    sound_t = sections.get("soundt", {})
    sound_l = sections.get("soundl", {})
    time = sections.get("time", {})

    emotes: List[Dict[str, Any]] = []
    for id_ in range(1, count + 1):
        def_row = emotion_section.get(str(id_))
        if def_row is None:
            continue
        parts = def_row.split("#")
        field = lambda i: parts[i] if i < len(parts) else ""

        preanim = _norm_preanim(field(1))
        modifier = _parse_enum(field(3), _BLOCK_MODIFIERS, EmoteModifierEnumSchema, "no_preanim")
        deskmod = (
            _parse_enum(field(4).strip() or "", _DESK_MODIFIERS, DeskModifierEnumSchema, "shown")
            if field(4).strip()
            else _unset_deskmod(modifier)
        )
        delay_ticks = _to_int(sound_t.get(str(id_)), 0)
        emotes.append(
            {
                "key": str(id_),
                "name": field(0),
                "anim": field(2),
                "preanim": preanim,
                "postanim": None,
                "camera": None,
                "modifier": modifier,
                "deskmod": deskmod,
                "sound": _norm_legacy_sound(sound_n.get(str(id_))),
                "sounddelayms": ticks_to_ms(delay_ticks),
                "sounddelayticks": delay_ticks,
                "soundlooping": (sound_l.get(str(id_)) or "").strip() == "1",
                "preanimdurationms": None if preanim is None else _positive_ms(time.get(preanim.lower())),
            }
        )
    return emotes


def parse_char_ini(data: str) -> Dict[str, Any]:
    """Parse char.ini text into ``{options, emotes, sections}``.

    Requires an ``[options]`` section with a non-empty ``name`` and at least
    one emote; throws otherwise.
    """
    sections, block_order = _parse_ini(_strip_comments(data))

    opt = sections.get("options")
    if opt is None:
        raise AolibError("char.ini: missing required [options] section")
    if not opt.get("name"):
        raise AolibError("char.ini: [options] is missing the required `name` key")

    options: Dict[str, Any] = dict(opt)
    options["showname"] = opt.get("showname", "")
    options["model"] = opt.get("model", "")
    options["side"] = opt.get("side", "wit")
    options["blips"] = opt.get("blips") or opt.get("gender") or "male"
    options["chat"] = opt.get("chat")
    options["category"] = opt.get("category")
    options["scaling"] = _scaling(opt.get("scaling"))
    options["stretch"] = (opt.get("stretch") or "").startswith("true")
    options["realization"] = opt.get("realization") or None
    options["shouts"] = opt.get("shouts") or None

    emotion_section = sections.get("emotions", {})
    count = _to_int(emotion_section.get("number"), 0)
    emotes = (
        _read_block_emotes(sections, block_order)
        if block_order
        else _read_legacy_emotes(emotion_section, sections, count)
    )
    if not emotes:
        raise AolibError("char.ini: no emotes; at least one [emote <name>] block or [emotions] row is required")

    return {"options": options, "emotes": emotes, "sections": sections}

