import pytest

from aolib import AolibError, PacketOptions, SessionConfig, client, register_packet, server
from aolib.custom import decode_custom, encode_custom

SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "rows": {"type": "array", "items": {"type": "array", "items": {"type": "string"}}, "default": []},
    },
    "required": ["title"],
}


def test_custom_with_schema_fanta_and_json() -> None:
    register_packet("TT", PacketOptions(schema=SCHEMA))

    fanta = encode_custom("TT", {"title": "Cross-Examination", "rows": [["a", "b"]]}, "fanta")
    assert fanta == "TT#Cross-Examination#a&b#%"

    js = encode_custom("TT", {"title": "Cross-Examination", "rows": [["a", "b"]]}, "json")
    assert js == '{"$header":"TT","title":"Cross-Examination","rows":[["a","b"]]}'

    assert decode_custom("TT", fanta)["title"] == "Cross-Examination"
    assert decode_custom("TT", fanta)["rows"] == [["a", "b"]]


def test_custom_round_trips_via_session() -> None:
    register_packet("TT", PacketOptions(schema=SCHEMA))
    sent = []
    received = []
    s = server(SessionConfig(send=sent.append))
    s.on_custom("TT", lambda p: received.append(p))

    s.send_custom("TT", {"title": "Witness"})
    assert sent[0] == "TT#Witness#%"
    s.receive(sent[0])
    assert received[0]["title"] == "Witness"


def test_spec_header_rejected() -> None:
    with pytest.raises(AolibError):
        register_packet("MS", PacketOptions(schema=SCHEMA))


def test_unregistered_header_errors() -> None:
    with pytest.raises(AolibError):
        encode_custom("NOPE", {}, "fanta")

