# Extending aolib-cpp

Two ways to carry data the [spec](../spec/README.md) does not define: extra
fields on an existing packet, and custom packets with their own header.

## Extra fields on an existing packet

Every packet struct has an `extras` member (`nlohmann::json`, null when empty).
Put your fields there to send them, and read them from the same object on
receive:

```cpp
aolib::MSToClient ms;
ms.character = "Phoenix";
ms.emote = "normal";
ms.message = "Objection!";
ms.side = aolib::Side::def;
ms.char_id = 1;
ms.extras = {{"blips", "male"}};
client.SendMS(ms);

server.OnMS([](const aolib::MSToClient& m) {
    if (m.extras.contains("blips")) { /* ... */ }
});
```

How they are handled:

- **JSON only.** On the wire they are top-level keys after the schema fields,
  sorted by key: `{"$header":"MS",…,"effect":{…},"blips":"male"}`. FantaCode
  drops them on encode and ignores extra trailing slots on decode.
- **Decode** puts every key the schema does not define into `extras`, with its
  JSON value. `extras` is null when there are none.
- **Encode** throws if an `extras` key names a schema field or starts with `$`.
- **Not validated.** Check types yourself.

## Custom packets

Register a header the spec does not have with `RegisterPacket`. Give it a schema
in the spec's packet format and it behaves like a spec packet:

```cpp
aolib::PacketOptions opts;
opts.schema = nlohmann::ordered_json::parse(R"({
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "rows": {"type": "array", "items": {"type": "array", "items": {"type": "string"}}, "default": []}
    },
    "required": ["title"]
})");
aolib::register_packet("TT", opts);

client.send_custom("TT", {{"title", "Cross-Examination"}, {"rows", {"a", "b"}}});
server.on_custom("TT", [](std::any p) { /* ... */ });
```

On the wire that is `TT#Cross-Examination#a&b#%`, or
`{"$header":"TT","title":"Cross-Examination","rows":[["a","b"]]}`.

- **With a schema** the packet is validated, gets its defaults, is written in
  schema order, and has a FantaCode form by the walker rules. The schema may
  `$ref` the spec's types, e.g. `"../../types/Side.schema.json"`.
- **Without a schema** the packet is JSON-only: `SendCustom` throws on a
  FantaCode session (check `jsonMode()`), and FantaCode frames go to
  `onUnknownHeader`.
- **`fanta` and `json` override** a form for wire shapes the rules do not
  cover.
- **Spec headers throw.** Add fields to those with `extras`.
- **The registry is global.** Register at startup, before sessions receive.
