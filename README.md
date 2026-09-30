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
