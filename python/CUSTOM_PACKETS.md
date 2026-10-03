# Custom packets — extending the wire without touching the spec

aolib-python gives you a **supported way to add your own packet** (a new
`$header`) or your own fields **without forking the spec** and **without
corrupting the wire for everyone else**. This doc is the "how do I do whatever
I want" guide; [EXTENDING.md](EXTENDING.md) covers the API surface itself.

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
and header identity. When you go through the custom-packet registry, the
library does that for you, so your extension can't step on the spec.

Two flavours matter for "anything you want":

1. **JSON-only** — the safest. Your payload rides the JSON envelope as its own
   `$header` object. FantaCode peers never see it.
2. **Schema-driven** (or hand-written `fanta`/`json` forms) — gives you a
   FantaCode form too. Use this only when you *need* FantaCode.

---

## 1. Add fields to an existing packet (the quick path)

If your data belongs on a packet that already exists, put it in `$extras`. It's
JSON-only and cannot corrupt the wire.

```python
client.send.MS({
    "character": "Phoenix", "emote": "normal", "message": "Objection!",
    "side": "def", "char_id": 1,
    "$extras": {"blips": "male"},
})

server.on.MS(lambda p: print(p["$extras"].get("blips")))
```

JSON-only; dropped on FantaCode; not type-checked. Details in
[EXTENDING.md](EXTENDING.md).

---

## 2. Register a custom packet (a brand-new header)

Call `register_packet(header, options)`. Three ways to describe the wire shape:

### 2a. With a JSON Schema (the "just like a spec packet" option)

You get validation, defaults, schema key order, `$extras`, **and** a correct
FantaCode form derived by the walker — no hand-escaping.

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

client.send_custom("TT", {"title": "Cross-Examination", "rows": [["a", "b"], ["c"]]})
server.on_custom("TT", lambda p: print(p["title"]))
```

Wire: `TT#Cross-Examination#a&b#c#%` or
`{"$header":"TT","title":"Cross-Examination","rows":[["a","b"],["c"]]}`.

The schema may `$ref` shared spec types (`"../../types/Side.schema.json"`).

### 2b. JSON-only (the "can't break the wire" option)

Register a header with **no schema and no `fanta` form**. Its JSON is simply the
payload's own fields after `$header`; it has **no FantaCode form**.

```python
aolib.register_packet("GP")  # JSON-only

if client.json_mode:
    client.send_custom("GP", {"group_id": "100", "members": [...]})
```

This is the workhorse for "do anything you want": a brand-new, self-describing
message with zero risk to FantaCode peers, because FantaCode frames for an
unregistered header go to `on_unknown_header` and are ignored.

### 2c. `fanta` / `json` overrides (the "exotic shape" option)

For a wire shape the walker rules don't cover, override a form directly.

```python
aolib.register_packet("MY", aolib.PacketOptions(
    fanta=aolib.FantaForm(
        encode=lambda p: [p["a"], p["b"]],
        decode=lambda args: {"a": args[0], "b": args[1]},
    ),
    json=aolib.JsonForm(
        encode=lambda p: json.dumps(p),
        decode=lambda raw: json.loads(raw),
    ),
))
```

> ⚠️ Hand-written `fanta` forms are the one place you can hurt the wire: escape
> `#` `&` `%` `$` yourself (or use `escape_fanta`) and emit the exact slot count
> the other side expects. Prefer 2a/2b unless you really need it.

---

## 3. Sending and receiving

| | aolib-python |
|---|---|
| send | `session.send_custom(header, payload)` |
| receive | `session.on_custom(header, lambda p: …)` |

`on_custom` fires for *your* registered header only. Spec headers don't go
through the custom channel — use `send.MS` / `on.MC` etc. for those.

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

- **Header**: `GP`, JSON-only (2b).
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

```python
import aolib

aolib.register_packet("GP")  # JSON-only

# server side
def send_roster(roster, members):
    for m in members:
        if m.json_mode and m.supports_feature("grouppair"):
            m.send_custom("GP", roster)

# client side
server.on_custom("GP", lambda p: render(p["members"]))
```

The spec is untouched; a vanilla peer that never advertised `"grouppair"` never
sees a `GP` frame.

---

## 6. Rules and gotchas

- **Spec headers are reserved.** `register_packet` raises for a header the spec
  already defines. Add fields to those with `$extras` instead.
- **The registry is global and not thread-safe.** Register at startup, before
  any session receives traffic.
- **JSON-only means JSON-only.** A JSON-only custom packet can't be sent over
  FantaCode — `send_custom` raises; guard with `json_mode` (or capability
  negotiation) first.
- **Extras are unvalidated.** The library collects unknown JSON keys for you but
  does not type-check them.
- **FantaCode is the fragile half.** Prefer schema-driven (2a) or JSON-only (2b);
  only hand-write a `fanta` form (2c) when you must, and escape every
  metacharacter.

## Further reading

- [EXTENDING.md](EXTENDING.md) — Python specifics (`$extras`, `fanta`/`json`).
- [spec/README.md](../spec/README.md) — the wire format, validation, and FantaCode walker rules.

