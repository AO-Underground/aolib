"""Run an aolib server and two clients, one speaking JSON and one FantaCode,
over an in-memory network. Both join, and each plays a track that the server
plays for everyone.

    python -m examples.courtroom.main
"""

from __future__ import annotations

from .client import Client
from .network import Network
from .server import Server


def main() -> None:
    srv = Server(["Phoenix", "Edgeworth"], ["Courtroom"], ["Music", "trial.opus", "objection.opus"])
    net = Network(on_frame=lambda f: print(f"[conn {f.conn}] {'->' if f.to_server else '<-'} {f.wire.rstrip('%')}"))

    phoenix = net.connect(srv, True, "Phoenix")
    edgeworth = net.connect(srv, False, "Edgeworth")
    net.run()

    phoenix.play("trial.opus")
    edgeworth.play("objection.opus")
    net.run()

    for c in (phoenix, edgeworth):
        heard = ", ".join(f"{m['name']} (char {m['char_id']})" for m in c.heard)
        print(f"player {c.player_id} joined={c.joined} char={c.char_id} heard: {heard}")


if __name__ == "__main__":
    main()
