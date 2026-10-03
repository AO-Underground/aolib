"""Session: the role-typed, dispatch-driving surface.

Two factories:

  ``server(config)`` — for client-side code; the session represents the
    remote *server*. ``send.<X>`` ships C2S packets; ``on.<X>`` registers
    handlers for S2C packets.
  ``client(config)`` — for server-side code; the session represents one
    remote *client*. ``send.<X>`` ships S2C packets; ``on.<X>`` registers
    handlers for C2S packets.

Sessions are named for the *remote* party so ``client.send.MC`` reads as "send
MC to the client". The wire header is the attribute (``send.MS``, ``on.CH``),
matching aolib-ts. Wire mode is per-session and starts at fanta; by default the
session negotiates JSON itself (``server()`` on ``decryptor#JSON``, ``client()``
on the first ``{`` frame). Set ``disable_auto_json`` to leave it to
``set_json_mode``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional

from .custom import decode_custom, encode_custom
from .decode import decode, read_header
from .encode import encode
from .errors import AolibError
from .generated.packets import c2s_schemas, s2c_schemas


@dataclass
class SessionConfig:
    send: Callable[[str], None]
    disable_auto_json: bool = False
    on_malformed_frame: Optional[Callable[[Exception, str], None]] = None
    on_unknown_header: Optional[Callable[[str, str], None]] = None
    on_decode_error: Optional[Callable[[str, Exception, str], None]] = None
    on_unhandled: Optional[Callable[[str, Any], None]] = None
    on_handler_error: Optional[Callable[[str, Exception, Any], None]] = None


class _Session:
    def __init__(self, cfg, inbound, outbound, is_server):
        self.cfg = cfg
        self.inbound = inbound
        self.outbound = outbound
        self.is_server = is_server
        self.json_mode_enabled = False
        self.closed = False
        self.handlers: Dict[str, Callable[[Any], None]] = {}
        self.custom_handlers: Dict[str, Callable[[Any], None]] = {}

    def _send(self, header, packet):
        schema = self.outbound.get(header)
        if schema is None:
            raise AolibError(_wrong_direction_send(self.is_server, header))
        mode = "json" if self.json_mode_enabled else "fanta"
        wire = encode(schema, packet, mode)
        if self.cfg.send is not None:
            self.cfg.send(wire)

    def _on(self, header, handler):
        if header not in self.inbound:
            raise AolibError(_wrong_direction_on(self.is_server, header))
        self.handlers[header] = handler

    def send_custom(self, header, payload):
        if not header.strip():
            raise AolibError("aolib: send_custom requires a non-empty header")
        mode = "json" if self.json_mode_enabled else "fanta"
        wire = encode_custom(header, payload, mode)
        if self.cfg.send is not None:
            self.cfg.send(wire)

    def on_custom(self, header, handler):
        if not header.strip():
            raise AolibError("aolib: on_custom requires a non-empty header")
        if header in c2s_schemas or header in s2c_schemas:
            raise AolibError(f"aolib: '{header}' is a spec packet; use its on method")
        self.custom_handlers[header] = handler

    def receive(self, wire):
        if self.closed:
            return
        if wire.startswith("{") and not self.is_server and not self.cfg.disable_auto_json:
            self.json_mode_enabled = True

        try:
            header = read_header(wire)
        except Exception as exc:  # noqa: BLE001 - routed to the hook
            self._fire(self.cfg.on_malformed_frame, exc, wire)
            return

        try:
            custom = decode_custom(header, wire)
        except Exception as exc:  # noqa: BLE001
            self._fire(self.cfg.on_decode_error, header, exc, wire)
            return
        if custom is not None:
            self._dispatch(header, custom, custom=True)
            return

        schema = self.inbound.get(header)
        if schema is None:
            self._fire(self.cfg.on_unknown_header, header, wire)
            return
        try:
            packet = decode(schema, wire)
        except Exception as exc:  # noqa: BLE001
            self._fire(self.cfg.on_decode_error, header, exc, wire)
            return
        self._dispatch(header, packet, custom=False)

    def _dispatch(self, header, packet, custom):
        if (
            not custom
            and self.is_server
            and not self.cfg.disable_auto_json
            and header == "decryptor"
            and packet.get("value") == "JSON"
        ):
            self.json_mode_enabled = True

        handlers = self.custom_handlers if custom else self.handlers
        handler = handlers.get(header)
        if handler is None:
            self._fire(self.cfg.on_unhandled, header, packet)
            return
        try:
            handler(packet)
        except Exception as exc:  # noqa: BLE001
            self._fire(self.cfg.on_handler_error, header, exc, packet)

    @staticmethod
    def _fire(hook, *args):
        if hook is not None:
            hook(*args)

    def close(self):
        self.closed = True

    def set_json_mode(self, enabled):
        self.json_mode_enabled = enabled


def _wrong_direction_send(is_server, header):
    if is_server:
        return (
            f"aolib: server-session.send.{header}, '{header}' is server -> client. "
            "On a server session (representing the remote server), you can only send "
            "client -> server packets. Use client(config).send or server.on."
        )
    return (
        f"aolib: client-session.send.{header}, '{header}' is client -> server. "
        "On a client session (representing a remote client), you can only send "
        "server -> client packets. Use server(config).send or client.on."
    )


def _wrong_direction_on(is_server, header):
    if is_server:
        return (
            f"aolib: server-session.on.{header}, '{header}' is client -> server. "
            "On a server session you can only register handlers for server -> client "
            "packets. Use client(config).on instead."
        )
    return (
        f"aolib: client-session.on.{header}, '{header}' is server -> client. "
        "On a client session you can only register handlers for client -> server "
        "packets. Use server(config).on instead."
    )


class _SendProxy:
    def __init__(self, session):
        self._session = session

    def __getattr__(self, header):
        def send(packet):
            self._session._send(header, packet)

        return send


class _OnProxy:
    def __init__(self, session):
        self._session = session

    def __getattr__(self, header):
        def on(handler):
            self._session._on(header, handler)

        return on


class ServerSession:
    """A session representing the remote *server* (client-side code)."""

    def __init__(self, core):
        self._core = core
        self.send = _SendProxy(core)
        self.on = _OnProxy(core)

    def receive(self, wire):
        self._core.receive(wire)

    def close(self):
        self._core.close()

    def set_json_mode(self, enabled):
        self._core.set_json_mode(enabled)

    @property
    def json_mode(self):
        return self._core.json_mode_enabled

    def send_custom(self, header, payload):
        self._core.send_custom(header, payload)

    def on_custom(self, header, handler):
        self._core.on_custom(header, handler)


class ClientSession:
    """A session representing one remote *client* (server-side code)."""

    def __init__(self, core):
        self._core = core
        self.send = _SendProxy(core)
        self.on = _OnProxy(core)

    def receive(self, wire):
        self._core.receive(wire)

    def close(self):
        self._core.close()

    def set_json_mode(self, enabled):
        self._core.set_json_mode(enabled)

    @property
    def json_mode(self):
        return self._core.json_mode_enabled

    def send_custom(self, header, payload):
        self._core.send_custom(header, payload)

    def on_custom(self, header, handler):
        self._core.on_custom(header, handler)


def server(config):
    return ServerSession(_Session(config, inbound=s2c_schemas, outbound=c2s_schemas, is_server=True))


def client(config):
    return ClientSession(_Session(config, inbound=c2s_schemas, outbound=s2c_schemas, is_server=False))

