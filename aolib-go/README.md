# aolib-go

The Attorney Online 2 wire protocol in Go — the Go counterpart to
[`aolib-ts`](https://github.com/OmniTroid/aolib-ts), generated from the
canonical [`aolib-meta`](https://github.com/OmniTroid/aolib-meta) schemas so the
two libraries stay in lockstep.

It decodes and encodes AO2 packets in both wire forms:

- **FantaCode** — the classic `#`-delimited positional format. Enums carry their
  legacy integer (via `x-wire-ints`).
- **JSON** — the meta envelope: named fields plus a `$header` const. Enums are
  their string values (`"shown"`, `"def"`), `offset` is an `{x,y}` object.

aolib-go models only the canonical meta protocol. Nonstandard behavior (server
extensions, extra packets) is not baked in; servers layer it on themselves via
`SendCustom` / `OnCustom`.

## Overview

```go
import "github.com/SyntaxNyah/aolib-go"
```

- `aolib.Encode(pkt, aolib.WireFanta|aolib.WireJSON)` / `aolib.Decode(raw, mode)`
  — wire encode/decode of any typed packet.
- `aolib.NewPacket(raw)` / `Packet.String()` — raw FantaCode framing.
- `aolib.MSToServer` / `aolib.MSToClient` — the in-character (`MS`) packet, split
  by direction, with `ParseMSToServer` / `ParseMSToClient` / `Args`.
- `aolib.NewServer` / `aolib.NewClient` — the typed session surface (below).

## Sessions

The unit of work is a **session** — one logical connection with its own wire
mode, handler registrations, and state. A session is named for the **remote**
party, exactly like `aolib-ts`:

- `aolib.NewServer(cfg)` returns a `*ServerSession` — used by **client** code,
  representing the remote **server**. `Send*` ships client→server packets;
  `On*` registers handlers for server→client packets.
- `aolib.NewClient(cfg)` returns a `*ClientSession` — used by **server** code,
  representing one remote **client**. `Send*` ships server→client packets;
  `On*` registers handlers for client→server packets.

Headers are **types, not strings**: every packet has a typed `SendX` / `OnX`
method, so wrong-direction calls don't compile and IDEs autocomplete the
header. Dispatch runs off a single registry (`c2sDecoders` / `s2cDecoders` for
FantaCode, `c2sJSON` / `s2cJSON` for JSON) — there is no giant `switch`.
`Receive` never panics; failures route to `SessionConfig` hooks
(`OnMalformedFrame`, `OnUnknownHeader`, `OnDecodeError`, `OnUnhandled`,
`OnHandlerError`). Wire mode is per-session and inbound always auto-detects
JSON; `SetJSONMode` flips the outbound format.

```go
// Server side — one session per connected client.
client := aolib.NewClient(aolib.SessionConfig{Send: func(wire []byte) { conn.Write(wire) }})

client.SendDecryptor(&aolib.Decryptor{}) // advertise JSON support

client.OnHI(func(_ *aolib.HI) {
    client.SendID(&aolib.IDToClient{PlayerID: 1, Software: "my-server", Version: "1.0"})
    client.SendSM(&aolib.SM{MusicList: []string{"track1.mp3"}})
    client.SendDONE(&aolib.DONE{})
})

// Client side — one session representing the remote server.
server := aolib.NewServer(aolib.SessionConfig{Send: func(wire []byte) { ws.Write(wire) }})
server.OnID(func(p *aolib.IDToClient) { playerID = p.PlayerID })
server.SendHI(&aolib.HI{HDID: "abc123"})
```

The typed surface (`session_server.go` / `session_client.go`) and the direction
registries (`registry_gen.go`) are regenerated from the `aolib-meta` schemas by
`cmd/aolib-gen`, so the schema stays the single source of truth:

```
go run ./cmd/aolib-gen -meta ../aolib-meta -out .
```

## Custom packets

A server that speaks packets outside the canonical set (or extra fields on a
canonical one) builds them itself and ships them through the session's custom
channel. It is JSON only — there is no positional form for a packet aolib has
no schema for.

```go
client.SendCustom("TT", map[string]any{"type": "0", "title": "Cross-Examination"})

server.OnCustom("TT", func(pkt map[string]any) {
    title, _ := pkt["title"].(string)
    _ = title
})
```

## License

AGPL-3.0 (extracted from the Athena codebase; revisit before publishing — the
rest of the `aolib` family is MIT).
