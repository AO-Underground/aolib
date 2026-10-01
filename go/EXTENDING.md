# Extending aolib-go

Two ways to carry data the [spec](../spec/README.md) doesn't define: extra
fields on an existing packet, and custom packets with their own header.

## Extra fields on an existing packet

Every packet struct has `Extras map[string]any`. Put your fields there to send
them, and read them from the same map on receive:

```go
ms := aolib.NewMSToClient()
ms.Character, ms.Emote, ms.Message, ms.Side, ms.CharID = "Phoenix", "normal", "Objection!", aolib.SideDef, 1
ms.Extras = map[string]any{"blips": "male"}
client.SendMS(ms)

server.OnMS(func(p *aolib.MSToClient) {
    blips, _ := p.Extras["blips"].(string)
    _ = blips
})
```

How they're handled:

- **JSON only.** On the wire they are top-level keys after the schema fields,
  sorted by key: `{"$header":"MS",…,"effect":{…},"blips":"male"}`. FantaCode
  drops them on encode and ignores extra trailing slots on decode, so a peer
  on FantaCode never sees them.
- **Decode** puts every key the schema doesn't define into `Extras`, with its
  JSON value (`string`, `float64`, `bool`, `[]any`, `map[string]any` or `nil`).
  `Extras` is nil when there are none.
- **Encode** fails if an `Extras` key names a schema field or starts with `$`.
- **Not validated.** Check types yourself; another client may send `"1"`
  where you expect `true`.

## Custom packets

Register a header the spec doesn't have with `RegisterPacket`. Give it a schema
in the spec's packet format and it behaves like a spec packet:

```go
type Testimony struct {
    Title string     `json:"title"`
    Rows  [][]string `json:"rows"`
}

aolib.RegisterPacket("TT", aolib.PacketOptions[Testimony]{Schema: []byte(`{
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "rows": {"type": "array", "items": {"type": "array", "items": {"type": "string"}}, "default": []}
    },
    "required": ["title"]
}`)})

client.SendCustom("TT", Testimony{Title: "Cross-Examination", Rows: [][]string{{"a", "b"}, {"c"}}})
server.OnCustom("TT", func(p any) { _ = p.(Testimony).Title })
```

On the wire that is `TT#Cross-Examination#a&b#c#%`, or
`{"$header":"TT","title":"Cross-Examination","rows":[["a","b"],["c"]]}`.

How they're handled:

- **With a schema** the packet is validated, gets its defaults, is written in
  schema order with `Extras` (if `T` has an `Extras map[string]any` field),
  and has a FantaCode form by the
  [walker rules](../spec/README.md#validation-and-wire-format). The schema may
  `$ref` the spec's types, e.g. `"../../types/Side.schema.json"`. Defaults
  only fill fields missing from `T`'s JSON, so mark those `omitempty`.
- **Without a schema** (`PacketOptions[T]{}`) the JSON is `T`'s own fields
  after `"$header"`, and the packet is JSON-only: `SendCustom` errors on a
  FantaCode session (check `JSONMode()`), and FantaCode frames go to
  `OnUnknownHeader`.
- **`Fanta` and `JSON` override** a form for wire shapes the rules don't
  cover, e.g. a FantaCode slot with its own separator. A schema still
  validates the packet.
- **Spec headers panic.** Add fields to those with `Extras`.
- **The registry is global**: register packets at startup, before sessions
  receive, as it isn't safe to change concurrently. `OnCustom` errors for a
  spec header.
