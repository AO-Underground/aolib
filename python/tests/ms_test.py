from aolib.decode import decode
from aolib.encode import encode
from aolib.wire import c2s_schemas

MS = c2s_schemas["MS"]


def _ms(**overrides):
    packet = {
        "character": "Phoenix",
        "emote": "normal",
        "message": "Objection!",
        "side": "def",
        "char_id": 1,
    }
    packet.update(overrides)
    return packet


def test_paired_order_suffix() -> None:
    wire = encode(MS, _ms(paired_charid=4, paired_order=1), "fanta")
    assert "4^1" in wire.split("#")
    back = decode(MS, wire)
    assert back["paired_charid"] == 4
    assert back["paired_order"] == 1


def test_no_pair_is_bare() -> None:
    wire = encode(MS, _ms(paired_charid=-1, paired_order=0), "fanta")
    assert "-1" in wire.split("#") and not any("^" in t for t in wire.split("#"))
    back = decode(MS, wire)
    assert back["paired_charid"] == -1
    assert back["paired_order"] == 0
