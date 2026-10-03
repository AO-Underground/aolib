import pytest

from examples.courtroom.network import Network
from examples.courtroom.server import Server


def _header(wire: str) -> str:
    if wire.startswith("{"):
        h = wire[wire.index('"$header":"') + len('"$header":"') :]
        return h[: h.index('"')]
    return wire.split("#", 1)[0]


@pytest.mark.parametrize("json", [False, True], ids=["fanta", "json"])
def test_client_joins_and_hears_own_music(json: bool) -> None:
    srv = Server(["Phoenix", "Edgeworth"], ["Courtroom"], ["Music", "trial.opus"])
    net = Network()
    c = net.connect(srv, json, "Edgeworth")
    net.run()

    assert c.joined and c.char_id == 1, f"joined={c.joined} char={c.char_id}, want joined as char 1"

    c.play("trial.opus")
    net.run()

    assert len(c.heard) == 1
    assert c.heard[0]["name"] == "trial.opus"
    assert c.heard[0]["char_id"] == 1

    headers = []
    for i, frame in enumerate(net.frames):
        is_json = frame.wire.startswith("{")
        # The server's opening decryptor precedes negotiation, so it is always FantaCode.
        if (json and i > 0) != is_json:
            pytest.fail(f"frame {i} {frame.wire!r}: JSON={is_json}, want {json and i > 0}")
        direction = ">" if frame.to_server else "<"
        headers.append(direction + _header(frame.wire))

    want = "<decryptor >HI <ID >ID <PN <FL >askchaa <SI >RC <SC >RM <SM >RD <CharsCheck <DONE >CC <PV <CharsCheck >MC <MC"
    assert " ".join(headers) == want, f"handshake:\n got  {' '.join(headers)}\n want {want}"
