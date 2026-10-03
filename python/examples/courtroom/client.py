"""Follows AO2-Client's join sequence: decryptor, HI, ID, askchaa, RC, RM, RD,
then picks its character once the server sends DONE."""

from __future__ import annotations

import aolib


class Client:
    def __init__(self, send, json: bool, want: str) -> None:
        self.session = aolib.server(aolib.SessionConfig(send=send, disable_auto_json=not json))
        self.player_id = -1
        self.char_id = -1
        self.joined = False
        self.heard = []
        self.want = want
        self.chars = []

        s = self.session
        s.on.decryptor(lambda _: s.send.HI({"hdid": "example-hdid"}))
        s.on.ID(self._on_id)
        s.on.PN(lambda _: s.send.askchaa({}))
        s.on.SI(lambda _: s.send.RC({}))
        s.on.SC(self._on_sc)
        s.on.SM(lambda _: s.send.RD({}))
        s.on.DONE(self._on_done)
        s.on.PV(self._on_pv)
        s.on.MC(lambda p: self.heard.append(p))

    def _on_id(self, p) -> None:
        self.player_id = p["player_id"]
        self.session.send.ID({"software": "AO2", "version": "2.11.0"})

    def _on_sc(self, p) -> None:
        self.chars = [ch["name"] for ch in p["char_data"]]
        self.session.send.RM({})

    def _on_done(self, _) -> None:
        for id_, name in enumerate(self.chars):
            if name == self.want:
                self.session.send.CC({"player_id": self.player_id, "char_id": id_})
                return

    def _on_pv(self, p) -> None:
        self.char_id = p["char_id"]
        self.joined = True

    def play(self, track: str) -> None:
        self.session.send.MC({"name": track, "char_id": self.char_id})
