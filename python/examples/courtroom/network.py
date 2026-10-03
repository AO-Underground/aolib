"""In-memory network stand-in for the courtroom example."""

from __future__ import annotations

from typing import Callable, List, Optional


class Frame:
    """One packet on the in-memory network."""

    __slots__ = ("to_server", "conn", "wire")

    def __init__(self, to_server: bool, conn: int, wire: str) -> None:
        self.to_server = to_server
        self.conn = conn
        self.wire = wire


class Network:
    """Stands in for WebSocket connections: frames queue up and ``run``
    delivers them in order on the calling thread."""

    def __init__(self, on_frame: Optional[Callable[[Frame], None]] = None) -> None:
        self.frames: List[Frame] = []
        self.on_frame = on_frame
        self.queue: List[Callable[[], None]] = []
        self.conns = 0

    def connect(self, srv, json: bool, char: str):
        from .client import Client

        conn = self.conns
        self.conns += 1

        to_server = None
        cl = None

        def deliver_to_server(wire: str) -> None:
            to_server(wire)

        cl = Client(self.link(True, conn, deliver_to_server), json, char)

        def deliver_to_client(wire: str) -> None:
            cl.session.receive(wire)

        to_server = srv.accept(self.link(False, conn, deliver_to_client))
        return cl

    def link(self, to_server: bool, conn: int, deliver: Callable[[str], None]) -> Callable[[str], None]:
        def send(wire: str) -> None:
            frame = Frame(to_server, conn, wire)
            self.frames.append(frame)
            if self.on_frame is not None:
                self.on_frame(frame)
            self.queue.append(lambda: deliver(frame.wire))

        return send

    def run(self) -> None:
        while self.queue:
            next_fn = self.queue.pop(0)
            next_fn()
