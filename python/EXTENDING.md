# Extending aolib-python

Two ways to carry data the [spec](../spec/README.md) does not define: extra
fields on an existing packet, and custom packets with their own header.

## Extra fields on an existing packet

Every packet is a dict; put your fields under the `$extras` key to send them,
and read them from the same key on receive:

```python
client.send.MS({
    "character": "Phoenix",
    "emote": "normal",
    "message": "Objection!",
    "side": "def",
    "char_id": 1,
    "$extras": {"blips": "male"},
})

server.on.MS(lambda m: print(m["$extras"].get("blips")))
```

How they are handled:

- **JSON only.** On the wire they are top-level keys after the schema fields,
  sorted by key. FantaCode drops them on encode and ignores extra trailing
  slots on decode.
- **Decode** puts every key the schema does not define into `$extras`; the key
  is absent when there are none.
- **Encode** raises if a `$extras` key names a schema field or starts with `$`.
- **Not validated.** Check types yourself.

## Custom packets

Register a header the spec does not have with `register_packet`. Give it a
schema in the spec's packet format and it behaves like a spec packet:

```python
import aolib

aolib.register_packet("TT", aolib.PacketOptions(schema={
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "rows": {"type": "array", "items": {"type": "array", "items": {"type": "string"}}, "default": []},
    },
    "required": ["title"],
}))

client.send_custom("TT", {"title": "Cross-Examination", "rows": [["a", "b"]]})
server.on_custom("TT", lambda p: print(p["title"]))
```

On the wire that is `TT#Cross-Examination#a&b#%`, or
`{"$header":"TT","title":"Cross-Examination","rows":[["a","b"]]}`.

- **With a schema** the packet is validated, gets its defaults, is written in
  schema order, and has a FantaCode form by the walker rules. The schema may
  `$ref` the spec's types, e.g. `"../../types/Side.schema.json"`.
- **Without a schema** the packet is JSON-only: `send_custom` raises on a
  FantaCode session (check `json_mode`), and FantaCode frames go to
  `on_unknown_header`.
- **`fanta` and `json` override** a form for wire shapes the rules do not
  cover (see `FantaForm` / `JsonForm`).
- **Spec headers raise.** Add fields to those with `$extras`.
- **The registry is global.** Register at startup, before sessions receive.
