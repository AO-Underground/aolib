import pytest

from aolib.aopacket import Packet, new_packet, packet_to_string
from aolib.errors import AolibError
from aolib.fanta import escape_fanta, unescape_fanta
from aolib.ticks import ms_to_ticks, ticks_to_ms


def test_escape_round_trip() -> None:
    s = "Take that! #1 & $x 100%"
    assert unescape_fanta(escape_fanta(s)) == s
    assert escape_fanta("#&%$") == "<num><and><percent><dollar>"


def test_ticks() -> None:
    assert ms_to_ticks(20) == 1  # rounds half up
    assert ms_to_ticks(19) == 0
    assert ticks_to_ms(3) == 120


def test_new_packet() -> None:
    p = new_packet("HI#abc123#")
    assert p == Packet("HI", ["abc123"])
    assert packet_to_string(p) == "HI#abc123#%"


def test_new_packet_empty_header() -> None:
    with pytest.raises(AolibError):
        new_packet("")
