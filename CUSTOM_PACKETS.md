# Custom packets — extending the wire without touching the spec

aolib gives you a **supported way to add your own packet** (a new `$header`) or
your own fields **without forking the spec** and **without corrupting the wire
for everyone else**. This doc is the "how do I do whatever I want" guide. It
crosses both bindings ([Go](go/EXTENDING.md) and
[TypeScript](ts/EXTENDING.md)) and explains *why* each option is safe, so you
can pick the one that matches your feature.

---

## The mental model

The AO wire has two encodings, and they are **not equally forgiving**:

| | JSON envelope | FantaCode |
|---|---|---|
| Shape | `{"$header":"MS",…,"emote":"normal"}` — self-describing keys | `MS#0#…#%` — positional slots, `#`-separated |
| Unknown data | tolerated: unknown keys are collected / ignored | not tolerated: an extra slot shifts every field after it |
| Escape rules | none | `#` `&` `%` `$` must be escaped |

**The one rule that keeps the wire intact:** never hand-roll a positional
FantaCode frame, and never rename a spec header. aolib owns framing, escaping,
and header identity. When you go through the custom-packet registry, the library
does that for you, so your extension can't step on the spec.

A **custom packet** is a header the spec doesn't define, registered at runtime
and handled through the library's own encode/decode paths. Two flavours matter
for "anything you want":

1. **JSON-only** — the safest. Your payload rides the JSON envelope as its own
   `$header` object. FantaCode peers never see it, so there is zero chance of
   corrupting a positional frame.
2. **Schema-driven** (or hand-written `fanta`/`json` forms) — gives you a
   FantaCode form too, for peers that only speak Fanta. Use this only when you
   *need* FantaCode, because positional wire is the part that's easy to break.

---

## 1. Add fields to an existing packet (the quick path)

If your data belongs on a packet that already exists, don't register a new
header — put it in `Extras` / `$extras`. It's JSON-only and cannot corrupt the
wire.

```go
// Go — MSToClient has an `Extras map[string]any` field.
ms := aolib.NewMSToClient()
ms.Character, ms.Emote, ms.Message, ms.Side, ms.CharID = "Phoenix", "normal", "Objection!", aolib.SideDef, 1
ms.Extras = map[string]any{"blips": "male"}
client.SendMS(ms)

server.OnMS(func(p *aolib.MSToClient) {
    blips, _ := p.Extras["blips"].(string)
})
```

```ts
// TypeScript — every packet has an optional `$extras`.
client.send.MS({
  character: "Phoenix", emote: "normal", message: "Objection!", side: "def", char_id: 1,
  $extras: { blips: "male" },
});
server.on.MS((p) => { const b = p.$extras?.blips; });
```

JSON-only; dropped on FantaCode; not type-checked. Details in
[go/EXTENDING.md](go/EXTENDING.md) / [ts/EXTENDING.md](ts/EXTENDING.md).

---

## 2. Register a custom packet (a brand-new header)

When you need a packet the spec doesn't model — a whole new message type — call
`RegisterPacket` / `registerPacket`. You have **three ways** to describe its
wire shape, ordered from "most built-in" to "most manual":

### 2a. With a JSON Schema (the "just like a spec packet" option)

Give the packet a schema in the spec's own format. You get validation,
defaults, schema key order, `Extras`/`$extras`, **and** a correct FantaCode form
derived by the walker — no hand-escaping.

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
server.onCustom("TT", (p) => p.title);
```

Wire: `TT#Cross-Examination#a&b#c#%` or
`{"$header":"TT","title":"Cross-Examination","rows":[["a","b"],["c"]]}`.

The schema may `$ref` shared spec types (`"../../types/Side.schema.json"`), so
you reuse the exact enum/object definitions the spec packets use.

### 2b. JSON-only (the "can't break the wire" option)

Register a header with **no schema and no `fanta` form**. Its JSON is simply the
payload type's own fields after `$header`, and it has **no FantaCode form** —
send it only to JSON peers.

```go
// Go — PacketOptions[T]{} leaves Schema/Fanta/JSON nil.
type GPPacket struct {
    GroupID string     `json:"group_id"`
    Members []GPMember `json:"members"`
}
aolib.RegisterPacket("GP", aolib.PacketOptions[GPPacket]{})

// SendCustom errors on a FantaCode session; gate on JSONMode() first.
if client.JSONMode() {
    _ = client.SendCustom("GP", GPPacket{GroupID: "100", Members: …})
}
```

```ts
// TypeScript — registerPacket with no options = JSON-only.
registerPacket("GP");
client.sendCustom({ $header: "GP", group_id: "100", members: [ … ] });
```

This is the workhorse for "do anything you want": a brand-new, self-describing
message with zero risk to FantaCode peers, because FantaCode frames for an
unregistered header go to `OnUnknownHeader` and are simply ignored.

### 2c. `fanta` / `json` overrides (the "exotic shape" option)

For a wire shape the walker rules don't cover — e.g. a FantaCode slot that uses
its own separator, or a JSON shape that isn't 1:1 with the struct — override one
form directly. A schema still validates the packet if you provide one.

```go
aolib.RegisterPacket("MY", aolib.PacketOptions[My]{
    Fanta: &aolib.Fanta[My]{
        Encode: func(m My) ([]string, error) { return []string{m.A, m.B}, nil },
        Decode: func(args []string) (My, error) { return My{A: args[0], B: args[1]}, nil },
    },
    JSON: &aolib.JSONForm[My]{
        Encode: func(m My) ([]byte, error) { return json.Marshal(m), nil },
        Decode: func(raw []byte) (My, error) { var v My; return v, json.Unmarshal(raw, &v) },
    },
})
```

```ts
import { registerPacket } from "aolib-ts";
registerPacket("MY", {
  fanta: { encode: (p) => [p.a, p.b], decode: (a) => ({ a: a[0], b: a[1] }) },
  json: { encode: (p) => JSON.stringify(p), decode: (raw) => JSON.parse(raw) },
});
```

> ⚠️ Hand-written `fanta` forms are the one place you can hurt the wire: you
> must escape `#` `&` `%` `$` yourself (or use the walker's escape helpers) and
> emit the exact slot count the other side expects. Prefer 2a/2b unless you
> really need it.

---

## 3. Sending and receiving

| | Go | TypeScript |
|---|---|---|
| send | `session.SendCustom(header, payload)` | `session.sendCustom({ $header, … })` |
| receive | `session.OnCustom(header, func(p any) { … })` | `session.onCustom(header, (p) => …)` |

`OnCustom`/`onCustom` fires for *your* registered header only. Spec headers
don't go through the custom channel — use `OnMS`/`on.MS` etc. for those.

---

## 4. Capability negotiation (don't send it to peers that can't take it)

A custom packet is meaningless to a peer that doesn't know your header. Gate it
with the **`FL` feature flags** both sides already exchange:

1. The server advertises your feature name in its server→client `FL`
   (`"grouppair"` in the example below).
2. The client advertises it back in a client→server `FL`.
3. Each side only emits/reads your custom packet when the other side advertised
   it.

This keeps your extension invisible to vanilla peers — they never receive a
frame they can't parse.

---

## 5. Worked example — group pairing (`GP`)

A real extension end-to-end. The feature: a `/grouppair` group roster that
renders N characters, ordered, without touching the spec.

- **Header**: `GP`, JSON-only (2b). The roster is an ordered list that *includes
  the speaker*, so list position is the z-order — ordering lives in one place.
- **Capability**: `FL` feature `"grouppair"`, bidirectional.
- **Wire** (server→client, sent on every change as an idempotent snapshot):

```json
{
  "$header": "GP",
  "group_id": "100",
  "members": [
    { "uid": 100, "char_id": 0, "name": "Phoenix", "emote": "normal",
      "offset": { "x": 0, "y": 0 }, "flip": "none", "order": 0 },
    { "uid": 101, "char_id": 1, "name": "Maya", "emote": "normal",
      "offset": { "x": 0, "y": 0 }, "flip": "horizontal", "order": 1 }
  ]
}
```

```go
// Go (server side)
type GPMember struct {
    UID    int          `json:"uid"`
    CharID int          `json:"char_id"`
    Name   string       `json:"name"`
    Emote  string       `json:"emote"`
    Offset aolib.Offset `json:"offset"`
    Flip   aolib.Flip   `json:"flip"`
    Order  int          `json:"order"`
}
type GP struct {
    GroupID string     `json:"group_id"`
    Members []GPMember `json:"members"`
}

func init() {
    aolib.RegisterPacket("GP", aolib.PacketOptions[GP]{}) // JSON-only
}

// send to members that advertised "grouppair" and are JSON-mode
func sendRoster(g *GP, members []*Client) {
    for _, m := range members {
        if m.JSONMode() && m.SupportsFeature("grouppair") {
            _ = m.SendCustom("GP", *g)
        }
    }
}
```

```ts
// TypeScript (client side)
import { registerPacket } from "aolib-ts";
registerPacket("GP"); // JSON-only

server.onCustom("GP", (p) => {
  const members = p.members as { order: number }[];
  // render members in order: members[0] front-most
});
```

The spec is untouched; a vanilla peer that never advertised `"grouppair"` never
sees a `GP` frame.

---

## 6. Rules and gotchas

- **Spec headers are reserved.** `RegisterPacket`/`registerPacket` panics (or
  throws) for a header the spec already defines. Add fields to those with
  `Extras`/`$extras` instead.
- **The registry is global and not concurrency-safe.** Register at startup,
  before any session receives traffic.
- **JSON-only means JSON-only.** A JSON-only custom packet can't be sent over
  FantaCode — `SendCustom`/`sendCustom` errors/throws; guard with
  `JSONMode()`/`jsonMode` (or capability negotiation) first.
- **Extras are unvalidated.** The library collects unknown JSON keys for you but
  does not type-check them; another peer may send `"1"` where you expect `true`.
- **FantaCode is the fragile half.** Prefer schema-driven (2a) or JSON-only (2b);
  only hand-write a `fanta` form (2c) when you must, and escape every
  metacharacter.

## Further reading

- [go/EXTENDING.md](go/EXTENDING.md) — Go specifics (both-wire details, `Extras`).
- [ts/EXTENDING.md](ts/EXTENDING.md) — TypeScript specifics (`$extras`, `fanta`/`json`).
- [spec/README.md](spec/README.md) — the wire format, validation, and FantaCode walker rules.
