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

For a header the spec doesn't have, register a codec that implements both
FantaCode and JSON, then use the session's custom channel:

```ts
import { registerCodec, escapeFanta, unescapeFanta } from "aolib-ts/wire";

registerCodec("TT", {
  encodeFanta: (p) => [escapeFanta(String(p.title))],
  decodeFanta: (args) => {
    if (args.length === 0) throw new Error("TT: missing title");
    return { title: unescapeFanta(args[0] ?? "") };
  },
  encodeJson: (p) => JSON.stringify({ title: p.title }),
  decodeJson: (raw) => ({ title: (JSON.parse(raw) as { title: string }).title }),
});

client.sendCustom({ $header: "TT", title: "Cross-Examination" });
server.onCustom<{ $header: "TT"; title: string }>("TT", (p) => p.title);
```

How they're handled:

- **Framing is the library's.** `decodeFanta` gets the fields between the
  header and `%`; `encodeFanta` returns them. On JSON the library adds
  `"$header"`. Escape string fields with `escapeFanta`/`unescapeFanta`.
- **Both formats are needed.** `sendCustom` throws for a header without a
  codec, and a frame in a format the codec can't decode never reaches
  `onCustom`.
- **The registry is global** and shared by every session. Don't register a
  spec header: its custom handler would replace the typed one. Use `$extras`
  to add fields to those.
- **One handler per header.** `onCustom` throws if the header already has an
  `on.<X>` handler, and the reverse.
- **No validation.** The codec owns the packet's shape.
