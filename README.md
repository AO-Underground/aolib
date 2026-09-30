# aolib-go

The Attorney Online 2 wire protocol in Go — the Go counterpart to
[`aolib-ts`](https://github.com/OmniTroid/aolib-ts), sharing the canonical
[`aolib-meta`](https://github.com/OmniTroid/aolib-meta) field names/types.

It decodes and encodes AO2 packets in both wire forms:

- **FantaCode** — the classic `#`-delimited positional format.
- **JSON** — the named-field format, validated against the vendored
  `aolib-meta` JSON Schemas (`LoadSchemas` enables MS validation).

## Overview

```go
import "github.com/SyntaxNyah/aolib-go"
```

- `aolib.NewPacket(raw)` / `Packet.String()` — FantaCode framing.
- `aolib.ParseJSON(raw)` / `aolib.BuildJSON(header, args)` /
  `aolib.BuildJSONPacket(packet)` — JSON wire.
- `aolib.MSPacket` — the in-character (`MS`) packet, with
  `ParseMSClient` / `ParseMSServer` / `ServerArgs` / `JSONExtra`.
- `aolib.AdditionalChar` / `aolib.PairOffset` — multi-pair partners carried in
  the JSON-only `additional_chars` list.
- `aolib.LoadSchemas()` — enable `ValidateMSRequest` / `ValidateMSBroadcast`.
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
header. The dispatch runs off a single registry (`c2sDecoders` / `s2cDecoders`)
— there is no giant `switch`. `Receive` never panics; failures route to
`SessionConfig` hooks (`OnMalformedFrame`, `OnUnknownHeader`, `OnDecodeError`,
`OnUnhandled`, `OnHandlerError`). Wire mode is per-session and inbound always
auto-detects JSON; `SetJSONMode` flips the outbound format.

```go
// Server side — one session per connected client.
client := aolib.NewClient(aolib.SessionConfig{ Send: func(wire []byte) { conn.Write(wire) } })

client.SendDecryptor(&aolib.Decryptor{}) // advertise JSON support

client.OnHI(func(_ *aolib.HI) {
    client.SendID(&aolib.IDClient{PlayerNumber: 1, Software: "my-server", Version: "1.0"})
    client.SendSM(&aolib.SM{Items: []string{"track1.mp3"}})
    client.SendDONE(&aolib.DONE{})
})

// Client side — one session representing the remote server.
server := aolib.NewServer(aolib.SessionConfig{ Send: func(wire []byte) { ws.Write(wire) } })
server.OnID(func(p *aolib.IDClient) { playerID = p.PlayerNumber })
server.SendHI(&aolib.HI{HDID: "abc123"})
```

The typed surface (`session_server.go` / `session_client.go`) and the
direction registry (`registry.go`) are regenerated from the `aolib-meta`
schemas by `cmd/aolib-gen`, so the schema stays the single source of truth.

## Example

```go
ms := &aolib.MSPacket{
    Character: "Phoenix", Emote: "normal", Message: "Objection!",
    Side: "def", CharID: "0",
    AdditionalChars: []aolib.AdditionalChar{
        {CharID: 5, Name: "Maya", Emote: "normal", Offset: aolib.PairOffset{X: 10, Y: 0}, Flip: 0},
    },
}
json := aolib.BuildJSONPacket(ms) // merges additional_chars for JSON clients
```

## License

AGPL-3.0 (extracted from the Athena codebase; revisit before publishing — the
rest of the `aolib` family is MIT).
