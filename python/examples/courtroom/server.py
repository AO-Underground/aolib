"""A one-area AO server: runs the join handshake, hands out characters, and
plays every MC request to everyone connected."""

from __future__ import annotations

import aolib


class Server:
    def __init__(self, chars, areas, music) -> None:
        self.chars = chars
        self.areas = areas
        self.music = music
        self.clients = []
        self.taken = {}

    def accept(self, send):
        """Handle a new connection. ``send`` delivers one frame to that client;
        the returned function takes each frame the client sends."""
        c = aolib.client(aolib.SessionConfig(send=send))
        player_id = len(self.clients)
        self.clients.append(c)

        def on_hi(_):
            c.send.ID({"player_id": player_id, "software": "courtroom-example", "version": "1.0"})

        def on_id(_):
            c.send.PN({"player_count": len(self.clients), "max_players": 100, "server_description": "aolib example"})
            c.send.FL({"features": ["yellowtext", "y_offset", "looping_sfx", "effects"]})

        def on_askchaa(_):
            c.send.SI({"char_count": len(self.chars), "evi_count": 0, "mus_count": len(self.areas) + len(self.music)})

        def on_rc(_):
            c.send.SC({"char_data": [{"name": name} for name in self.chars]})

        def on_rm(_):
            c.send.SM({"music_list": [{"name": name} for name in (self.areas + self.music)]})

        def on_rd(_):
            c.send.CharsCheck(self._chars_check())
            c.send.DONE({})

        def on_cc(p):
            if p["char_id"] < 0 or p["char_id"] >= len(self.chars) or p["char_id"] in self.taken:
                return
            self.taken[p["char_id"]] = c
            c.send.PV({"player_id": player_id, "char_id": p["char_id"]})
            for peer in self.clients:
                peer.send.CharsCheck(self._chars_check())

        def on_mc(p):
            for peer in self.clients:
                peer.send.MC({"name": p["name"], "char_id": p["char_id"], "showname": p["showname"], "effects": p["effects"]})

        c.on.HI(on_hi)
        c.on.ID(on_id)
        c.on.askchaa(on_askchaa)
        c.on.RC(on_rc)
        c.on.RM(on_rm)
        c.on.RD(on_rd)
        c.on.CC(on_cc)
        c.on.MC(on_mc)

        # Advertise JSON; the session switches when the client answers in JSON.
        c.send.decryptor({"value": "JSON"})
        return c.receive

    def _chars_check(self):
        return {"taken": ["taken" if id_ in self.taken else "free" for id_ in range(len(self.chars))]}
