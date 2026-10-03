import pytest

from aolib import AolibError, SessionConfig, client, server


def _make():
    sent = []
    return SessionConfig(send=sent.append), sent


def test_server_session_sends_c2s_receives_s2c() -> None:
    cfg, sent = _make()
    s = server(cfg)
    s.send.HI({"hdid": "abc123"})
    assert sent[-1] == "HI#abc123#%"

    received = []
    s.on.ID(lambda p: received.append(p))
    s.receive("ID#7#srv#1.0#%")
    assert received[0]["player_id"] == 7
    assert received[0]["software"] == "srv"


def test_client_session_sends_s2c_receives_c2s() -> None:
    cfg, sent = _make()
    c = client(cfg)
    c.send.ID({"player_id": 7, "software": "srv", "version": "1.0"})
    assert sent[-1] == "ID#7#srv#1.0#%"

    received = []
    c.on.HI(lambda p: received.append(p))
    c.receive("HI#abc123#%")
    assert received[0]["hdid"] == "abc123"


def test_wrong_direction_raises() -> None:
    cfg, _ = _make()
    s = server(cfg)
    with pytest.raises(AolibError):
        s.send.ID({"player_id": 1, "software": "srv", "version": "1.0"})
    with pytest.raises(AolibError):
        s.on.HI(lambda p: None)


def test_server_auto_json_on_decryptor() -> None:
    cfg, sent = _make()
    s = server(cfg)
    s.receive("decryptor#JSON#%")
    assert s.json_mode
    s.send.HI({"hdid": "abc123"})
    assert sent[-1].startswith("{")


def test_client_auto_json_on_brace() -> None:
    cfg, sent = _make()
    c = client(cfg)
    c.receive('{"$header":"ID","player_id":7,"software":"srv","version":"1.0"}')
    assert c.json_mode


def test_unknown_header_hook() -> None:
    unknown = []
    cfg = SessionConfig(send=lambda w: None, on_unknown_header=lambda h, w: unknown.append(h))
    s = server(cfg)
    s.receive("NOPE#1#%")
    assert unknown == ["NOPE"]


def test_malformed_frame_hook() -> None:
    errors = []
    cfg = SessionConfig(send=lambda w: None, on_malformed_frame=lambda e, w: errors.append(e))
    s = server(cfg)
    s.receive('{"$header": 5}')
    assert errors
