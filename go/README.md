# aolib-go

The Attorney Online 2 wire protocol in Go, the Go counterpart to
[`aolib-ts`](https://github.com/AO-Underground/aolib/tree/main/ts), generated from the
canonical [`spec/`](../spec) schemas so the
two libraries stay in lockstep.

It decodes and encodes AO2 packets in both wire forms:

- **FantaCode**: the classic `#`-delimited positional format. Enums carry their
  legacy integer (via `x-wire-ints`).
- **JSON**: the meta envelope: named fields plus a `$header` const. Enums are
  their string values (`"shown"`, `"def"`), `offset` is an `{x,y}` object.

aolib-go models only the canonical meta protocol. Nonstandard behavior (server
extensions, extra packets) is not baked in; servers layer it on themselves via
`SendCustom` / `OnCustom`.

## Overview

```go
import aolib "github.com/AO-Underground/aolib/go/v2"
```

- `aolib.Encode(pkt, aolib.WireFanta|aolib.WireJSON)`, and
  `aolib.DecodeToServer(raw, mode)` / `aolib.DecodeToClient(raw, mode)` by
  direction: wire encode/decode of any typed packet. `aolib.ReadHeader(raw)`
  reads just the header; `aolib.Validate(pkt)` checks a packet against its schema.
- `Extras map[string]any` on every packet struct: JSON keys the schema doesn't
  define ([EXTENDING.md](EXTENDING.md)).
- `aolib.ParseCharIni(text)`: char.ini parser per [`spec/assets`](../spec/assets/README.md).
- `aolib.NewPacket(raw)` / `Packet.String()`: raw FantaCode framing.
- `aolib.MSToServer` / `aolib.MSToClient`: the in-character (`MS`) packet, split
  by direction, with `ParseMSToServer` / `ParseMSToClient` / `Args`.
- `aolib.NewServer` / `aolib.NewClient`: the typed session surface (below).
- `aolib.NewMSToServer()` and a `New*` for every packet: the packet with the
  spec's defaults. Start from these rather than a struct literal: a literal
  leaves every field at Go's zero value, so `MS` would ask to pair with
  character 0 instead of `-1` (no pair), and `ZZ` would report player 0.

## Sessions

The unit of work is a **session**: one logical connection with its own wire
mode, handler registrations, and state. A session is named for the **remote**
party, exactly like `aolib-ts`:

- `aolib.NewServer(cfg)` returns a `*ServerSession`, used by **client** code,
  representing the remote **server**. `Send*` ships client→server packets;
  `On*` registers handlers for server→client packets.
- `aolib.NewClient(cfg)` returns a `*ClientSession`, used by **server** code,
  representing one remote **client**. `Send*` ships server→client packets;
  `On*` registers handlers for client→server packets.

Headers are **types, not strings**: every packet has a typed `SendX` / `OnX`
method, so wrong-direction calls don't compile and IDEs autocomplete the
header. Dispatch runs off a single registry (`c2sDecoders` / `s2cDecoders` for
FantaCode, `c2sJSON` / `s2cJSON` for JSON); there is no giant `switch`.
Every packet is validated against its `spec/` schema on decode and encode,
failing with a `*ValidationError`. `Receive` never panics; failures route to
`SessionConfig` hooks (`OnMalformedFrame`, `OnUnknownHeader`, `OnDecodeError`,
`OnEncodeError`, `OnUnhandled`, `OnHandlerError`). Inbound frames are decoded
in either format. Outbound starts as FantaCode and switches to JSON on its own:
a `ServerSession` on `decryptor#JSON`, a `ClientSession` on the first frame
that starts with `{`. Set `SessionConfig.DisableAutoJSON` to leave it to
`SetJSONMode`.

```go
// Server side: one session per connected client.
client := aolib.NewClient(aolib.SessionConfig{Send: func(wire []byte) { conn.Write(wire) }})

client.SendDecryptor(&aolib.Decryptor{Value: "JSON"}) // advertise JSON support

client.OnHI(func(_ *aolib.HI) {
    client.SendID(&aolib.IDToClient{PlayerID: 1, Software: "my-server", Version: "1.0"})
    client.SendSM(&aolib.SM{MusicList: []aolib.SMMusicListItem{{Name: "track1.mp3"}}})
    client.SendDONE(&aolib.DONE{})
})

// Client side: one session representing the remote server.
server := aolib.NewServer(aolib.SessionConfig{Send: func(wire []byte) { ws.Write(wire) }})
server.OnID(func(p *aolib.IDToClient) { playerID = p.PlayerID })
server.SendHI(&aolib.HI{HDID: "abc123"})
```

[`examples/courtroom`](examples/courtroom) runs the full AO2 join handshake
between a server and a JSON and a FantaCode client over an in-memory network:

```sh
go run ./examples/courtroom
```

The typed surface (`session_server_gen.go` / `session_client_gen.go`) and the direction
registries (`registry_gen.go`) are regenerated from the `spec` schemas by
`cmd/aolib-gen`, so the schema stays the single source of truth:

```
go run ./cmd/aolib-gen -meta ../spec -out .
```

## Extending

Extra fields on spec packets (`Extras`) and custom packets (`RegisterPacket`):
see [EXTENDING.md](EXTENDING.md).

## License

MIT, matching the rest of the `aolib` family. See
[`ts/LICENSE`](../ts/LICENSE).
