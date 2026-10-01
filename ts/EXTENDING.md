# Extending aolib-ts

Two ways to carry data the [spec](../spec/README.md) doesn't define: extra
fields on an existing packet, and custom packets with their own header.

## Extra fields on an existing packet

Every packet has an optional `$extras: Record<string, unknown>`. Put your
fields there to send them, and read them from the same object on receive:

```ts
client.send.MS({
  character: "Phoenix", emote: "normal", message: "Objection!", side: "def", char_id: 1,
  $extras: { blips: "male" },
});

server.on.MS((p) => {
  const blips = typeof p.$extras?.blips === "string" ? p.$extras.blips : undefined;
});
```

How they're handled:

- **JSON only.** On the wire they are top-level keys after the schema fields,
  sorted by key: `{"$header":"MS",…,"effect":{…},"blips":"male"}`. FantaCode
  drops them on encode and ignores extra trailing slots on decode, so a peer
  on FantaCode never sees them.
- **Decode** puts every key the schema doesn't define into `$extras`, with its
  JSON value. `$extras` is absent when there are none.
- **Encode** throws if an `$extras` key names a schema field or starts with `$`.
- **Not validated.** Check types yourself; another client may send `"1"`
  where you expect `true`.

## Custom packets

Register a header the spec doesn't have with `registerPacket`. Give it a schema
in the spec's packet format and it behaves like a spec packet:

```ts
import { registerPacket } from "aolib-ts";

registerPacket("TT", {
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      rows: { type: "array", items: { type: "array", items: { type: "string" } }, default: [] },
    },
    required: ["title"],
  },
});

client.sendCustom({ $header: "TT", title: "Cross-Examination", rows: [["a", "b"], ["c"]] });
server.onCustom<{ $header: "TT"; title: string; rows: string[][] }>("TT", (p) => p.title);
```

On the wire that is `TT#Cross-Examination#a&b#c#%`, or
`{"$header":"TT","title":"Cross-Examination","rows":[["a","b"],["c"]]}`.

How they're handled:

- **With a schema** the packet is validated, gets its defaults, is written in
  schema order with `$extras`, and has a FantaCode form by the
  [walker rules](../spec/README.md#validation-and-wire-format). The schema may
  `$ref` the spec's types, e.g. `"../../types/Side.schema.json"`.
- **Without a schema** (`registerPacket("TT")`) the JSON is the packet's own
  fields after `"$header"`, and the packet is JSON-only: `sendCustom` throws
  on a FantaCode session (check `jsonMode`), and FantaCode frames go to
  `onUnknownHeader`.
- **`fanta` and `json` override** a form for wire shapes the rules don't
  cover, e.g. a FantaCode slot with its own separator. A schema still
  validates the packet.
- **Spec headers throw.** Add fields to those with `$extras`.
- **The registry is global.** `onCustom` throws for a spec header.
