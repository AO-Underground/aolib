# Extending aolib-go

Two ways to carry data the [spec](../spec/README.md) doesn't define: extra
fields on an existing packet, and custom packets with their own header.

## Extra fields on an existing packet

Every packet struct has `Extras map[string]any`. Put your fields there to send
them, and read them from the same map on receive:

```go
client.SendMS(&aolib.MSToClient{
    Character: "Phoenix", Emote: "normal", Message: "Objection!", Side: aolib.SideDef, CharID: 1,
    Extras: map[string]any{"blips": "male"},
})

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

For a header the spec doesn't have, register a `Codec` that implements both
FantaCode and JSON, then use the session's custom channel:

```go
type Testimony struct {
    Title string `json:"title"`
}

aolib.RegisterCodec("TT", aolib.Codec{
    EncodeFanta: func(p any) ([]string, error) { return []string{aolib.EscapeFanta(p.(Testimony).Title)}, nil },
    DecodeFanta: func(args []string) (any, error) {
        if len(args) == 0 {
            return nil, fmt.Errorf("TT: missing title")
        }
        return Testimony{Title: aolib.UnescapeFanta(args[0])}, nil
    },
    EncodeJSON: func(p any) (string, error) { b, err := json.Marshal(p); return string(b), err },
    DecodeJSON: func(raw string) (any, error) { var t Testimony; err := json.Unmarshal([]byte(raw), &t); return t, err },
})

client.SendCustom("TT", Testimony{Title: "Cross-Examination"})
server.OnCustom("TT", func(p any) { _ = p.(Testimony).Title })
```

How they're handled:

- **Framing is the library's.** `DecodeFanta` gets the fields between the
  header and `%`; `EncodeFanta` returns them. On JSON the library adds
  `"$header"`. Escape string fields with `EscapeFanta`/`UnescapeFanta`.
- **Both formats are required.** `RegisterCodec` panics without all four
  functions, so the packet works whichever mode the session negotiated.
- **The registry is global** and a codec takes over its header on every
  session. Don't register a spec header: it replaces the generated packet and
  its typed `On*` handler. Use `Extras` to add fields to those.
- **One handler per header.** `OnCustom` errors if the header already has a
  typed or custom handler.
- **No validation.** The codec owns the packet's shape.
