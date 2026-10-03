# aolib-python

The Attorney Online 2 protocol in Python, the Python counterpart to
[`aolib-ts`](../ts) and [`aolib-go`](../go), generated from the canonical
[`spec/`](../spec) schemas so the three libraries stay in lockstep.

It decodes and encodes AO2 packets in both wire forms:

- **FantaCode**: the classic `#`-delimited positional format. Enums carry their
  legacy integer (via `x-wire-ints`).
- **JSON**: the meta envelope: named fields plus a `$header` const. Enums are
  their string values (`"shown"`, `"def"`), `offset` is an `{x, y}` object.

aolib-python models only the canonical meta protocol. Nonstandard behavior
(server extensions, extra packets) is not baked in; servers layer it on
themselves via `register_packet` / `send_custom` / `on_custom`.

## Install

```sh
pip install -e ".[test]"
```

Requires Python 3.9+ and [`jsonschema`](https://pypi.org/project/jsonschema/).

## Overview

Packets are plain dicts (JSON-shaped). The generated `str, Enum` enums and
`TypedDict` aliases give the typed surface; `Side.def_` compares equal to the
string `"def"` (Python's `def` keyword needs the trailing underscore).

```python
import aolib

# Sessions are named for the remote party.
server = aolib.server(aolib.SessionConfig(send=lambda wire: sock.send(wire)))
client = aolib.client(aolib.SessionConfig(send=lambda wire: conn.send(wire)))

client.send.MS({"character": "Phoenix", "emote": "normal", "message": "Objection!",
                "side": "def", "char_id": 1})
server.on.MS(lambda p: print(p["message"]))
```

The low-level wire primitives live under `aolib.wire`:

```python
from aolib import wire

frame = wire.encode(wire.c2s_schemas["MS"], {...}, "fanta")
packet = wire.decode(wire.c2s_schemas["MS"], frame)
header = wire.read_header(frame)
```

Enums are `str, Enum`; shared object types (`Offset`, `Effect`, `MusicEffects`)
are `TypedDict` aliases. The packet `TypedDict`s and the `c2s`/`s2c` direction
maps live under `aolib.packets`.

## Sessions

The unit of work is a **session**: one logical connection with its own wire
mode, handler registrations, and state, named for the **remote** party:

- `aolib.server(config)` — for **client** code; represents the remote
  **server**. `send.<X>` ships client→server packets; `on.<X>` registers
  handlers for server→client packets.
- `aolib.client(config)` — for **server** code; represents one remote
  **client**. `send.<X>` ships server→client packets; `on.<X>` registers
  handlers for client→server packets.

The wire header is the attribute (`send.MS`, `on.CH`), exactly like `aolib-ts`.
Wrong-direction calls raise. Every packet is validated against its `spec/`
schema on encode and decode, failing with a `ValidationError`. `receive` never
raises; failures route to `SessionConfig` hooks (`on_malformed_frame`,
`on_unknown_header`, `on_decode_error`, `on_unhandled`, `on_handler_error`).
Inbound frames are decoded in either format. Outbound starts as FantaCode and
switches to JSON on its own: a `server()` session on `decryptor#JSON`, a
`client()` session on the first frame that starts with `{`. Set
`disable_auto_json` to leave it to `set_json_mode`.

```python
client = aolib.client(aolib.SessionConfig(send=lambda wire: conn.send(wire)))

client.send.decryptor({"value": "JSON"})  # advertise JSON support
client.on.HI(lambda _: client.send.ID({"player_id": 1, "software": "my-server", "version": "1.0"}))

server = aolib.server(aolib.SessionConfig(send=lambda wire: ws.send(wire)))
server.on.ID(lambda p: print(p["player_id"]))
```

## Extending

Extra fields on spec packets (`$extras`) and custom packets
(`register_packet`): see [EXTENDING.md](EXTENDING.md).

## Codegen

The enums, shared types, inlined schemas, and direction maps are regenerated
from the `spec` schemas (the single source of truth) by `scripts/codegen.py`:

```sh
python scripts/codegen.py
```

Generated files under `aolib/generated/` are committed and must equal a fresh
generation from `spec/` (guarded in CI).

## License

MIT, matching the rest of the `aolib` family. See [`ts/LICENSE`](../ts/LICENSE).
