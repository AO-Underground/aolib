# spec

Schemas for the Attorney Online wire protocol: the single source of truth
consumed by every `aolib-*` binding in this monorepo, so all bindings stay in
sync.

JSON Schema (draft-07) is the single source of truth. Each library has its
own codegen step that consumes these files and emits native types,
validators, and wire encoders/decoders.

## Layout

```
packets/
  schemas/<Name>.schema.json   one per AO packet
  CODECS.md                    wire forms for x-fanta-codec packets
  EFFECTS.md                   the MS `effect` (`name|folder|sound`) field
  EXAMPLES.md                  complete key packets in both wire forms
types/<Name>.schema.json       shared enums and object types, $ref'd from packets
assets/<Name>.schema.json      character asset-file formats (char.ini)
assets/EXAMPLES.md             char.ini files and their parsed objects
```

Each kind is a top-level directory with an intro `README.md`; packet schemas
sit one level down in `packets/schemas/`. Schema files use the `.schema.json`
suffix and their kind is determined by directory, not by filename.

`assets/` describes files the client fetches from `characters/<name>/`, not
wire packets: they carry no `$header` or `x-receiver`, are consumed by asset
parsers rather than the packet codegen, and their INI/text grammar (which JSON
Schema can't express) is documented in `assets/README.md`.

Each schema carries an absolute-path `$id` matching its location (e.g.
`/packets/schemas/MS.schema.json`, `/types/Side.schema.json`). Packets `$ref`
shared schemas by relative path (`../../types/Side.schema.json`), which resolves
both on the filesystem (for IDEs) and by URI resolution against the parent `$id`
(for validators).

## Codegen strategy

A codegen consumer (see `ts/scripts/codegen.ts` for the TS reference
implementation) walks the packet and shared (`types/`) schemas and emits, per
file:

- **packets/schemas/** produces one typed class/struct per packet. Declared fields carry
  the *decoded* shape (every field present, defaults filled);
  constructor/init carries the *input* shape (default-bearing fields
  optional, `const`-only padding slots omitted).
- **types/** produces, per file, either a named enum (schemas carrying an
  `enum`; both member names and values come from `enum`) or a shared
  struct/interface (object schemas like `Offset`), importable by packets that
  `$ref` it. The kind is read from the schema shape, not the filename.

Each packet schema declares its direction via `x-receiver` and its wire
header via the `$header` const. The codegen scans `packets/schemas/`, reads
those two fields, and builds the direction maps directly, with no sidecar
registry. Bidirectional packets (e.g. `MC`, `HP`) live as two schemas sharing
one header, named `<Header>ToServer` and `<Header>ToClient` after the receiving
side (`MCToServer`/`MCToClient`, `HPToServer`/`HPToClient`).

## Validation and wire format

Each library wires its JSON Schema validator (e.g. Ajv in TS) and a
fanta-format walker to the same schemas:

- **JSON envelope**: packet body is the schema as-is, with `$header`
  prepended. `const` slots (e.g. `PV._cid`) are included. Keys are written
  in order: `$header`, then the schema's properties in schema order (nested
  objects likewise), then any extras.
- **Extras (JSON only)**: keys a packet's schema does not define are not an
  error. A decoder collects them, with their JSON values, into a `$extras`
  map on the parsed packet; an encoder writes `$extras` back as top-level
  keys after the schema fields, sorted by key. An extras key that names a
  schema property or starts with `$` is an encode error. Extras are not
  validated and FantaCode never carries them: they are dropped on encode,
  and extra positional slots are ignored on decode.
- **Fanta wire**: `HEADER#field1#field2#...#%`, one positional slot per
  top-level property (skipping `$header`). The walker derives per-slot
  encoding from the property's JSON type:
  - `string`: escape `#`/`&`/`%`/`$` as `<num>`/`<and>`/`<percent>`/`<dollar>`
  - `number` / `integer`: `String(n)` / `Number(token)`
  - `boolean`: `"1"` / `"0"`
  - `object`: recurse, joining sub-tokens with `&` (or the
    `x-fanta-separator` value); see `x-fanta-separator` below. An object with
    `x-wire-bits` is instead one integer slot; see `x-wire-bits` below
  - `array`: greedy, trailing array consumes all remaining slots, one item
    per slot. An item that is itself an array takes one slot, its items
    joined by `&`
  - `const`: emitted as the const value; on decode the slot is consumed
    and the schema-fixed value is used regardless of the token
  - `$ref` to an enum with `x-wire-ints`: encode the parallel legacy integer
    (by the value's index in `enum`); decode maps the integer token back to the
    string. A plain enum with no `x-wire-ints` (e.g. `Side`) uses its base-type
    rule above (the string is sent verbatim)

Every connection starts in FantaCode, and each side switches its own outbound
format to JSON only on a signal: a client when it receives `decryptor` with
value `JSON` (and wants JSON), a server when it receives a frame from that
client starting with `{`. Inbound frames are decoded by their first byte in
either mode.

Validation (defaults, required-field checks, type coercion errors) is
delegated to the JSON Schema validator on both encode (pre-serialize) and
decode (post-parse), so the typed shape is identical on both ends.

## Custom extensions

These `x-*` keywords are project-specific. JSON Schema validators ignore
unknown keywords by default; the codegen and walker interpret them.

### `x-enum-description: string[]`

On an enum schema, optional. Codegen derives both member names and values from
`enum` itself; this array is a parallel, human-readable descriptor for each
value (docs, comments, display) and is not used for identifiers. Include it only
when the `enum` values are opaque codes worth labelling, e.g. `Side`:

```json
{
  "$id": "/types/Side.schema.json",
  "type": "string",
  "enum": ["def", "pro", "wit"],
  "x-enum-description": ["defense", "prosecution", "witness"]
}
```

### `x-fanta-codec: string`

On a packet schema. Bypasses the generic positional walker for that
packet: the library looks up a codec registered under this name and
delegates encode/decode to it. Used for packets whose wire form has
discriminator-driven payload shapes (e.g. `ARUP`). Per-codec wire forms
are specified in `packets/CODECS.md`.

A codec owns only the FantaCode form; the packet's JSON stays the schema's
envelope.

### `x-receiver: "client" | "server"`

On a packet schema. Names which side receives this packet on the wire
(server-receiver packets flow client->server, client-receiver packets
flow server->client). Combined with the packet's `$header` const, this
fully describes routing: codegen builds the c2s/s2c maps from it
directly. Symmetric bidirectional packets are split into two schemas
sharing a header (e.g. `HPToServer` with `x-receiver: "server"` and
`HPToClient` with `x-receiver: "client"`).

### `x-wire-ints: integer[]`

On a string enum. Makes the string values first-class (the JSON envelope carries
the string, e.g. `"desk_modifier": "shown"`) while keeping the legacy integer
wire encoding: this array is parallel to `enum` and gives each value's integer.
The fanta walker encodes the integer and decodes an incoming integer back to the
string, so real AO servers still see the numbers they expect. Enums without this
keyword (e.g. `Side`) are sent as their string value on both sides.

### `x-wire-bits: integer[]`

On an `object` schema whose properties are all booleans. Parallel to
`properties` (in order), giving each flag's bit. JSON carries the object; the
fanta slot carries the integer OR of the set bits. On decode, bits with no
property are ignored. Currently set on `MusicEffects` (MC `effects`).

### `x-fanta-separator: string`

On an `object`-typed schema. The object occupies a single fanta slot whose
sub-tokens are joined (encode) and split (decode) by this separator instead of
the default `&`. The separator must not be a chat metacharacter (`#`/`&`/`%`/`$`),
since those are escaped inside string sub-tokens. As a no-value sentinel, an
object whose sub-tokens are all empty encodes to an empty slot, and an empty slot
decodes back to the all-empty object. Scoped to objects carrying it; plain
`&`-objects (e.g. `Offset`) are unaffected. Currently set on `Effect`
(separator `|`), the MS `effect` field (see `packets/EFFECTS.md`).

Separately, an empty slot for any `object` field that declares a `default`
decodes to that default (AO2 servers send an empty MS `paired_offset` when
there is no pair), and a sub-token missing from the end of an object slot
decodes to that sub-property's `default` (legacy senders send an `Offset` as
`x` alone). Encoders still emit the full form.

### `x-fanta-unescape-amp: true`

On an `object`-typed schema. Encoders never emit the legacy `<and>`
escape (objects join sub-tokens with literal `&`). Setting this flag
makes decoders tolerate `<and>` in incoming tokens, useful for shared
object types whose wire slot historically used the chat-escape form on
the way in but no longer does on the way out. Currently set on
`Offset`.

### `x-fanta-suffix-of: string`

On a numeric field (`integer`/`number`, or a string enum carrying
`x-wire-ints`). Marks the field as a trailing `^`-joined suffix packed
onto the named sibling slot, so it consumes no wire slot of its own. On
encode the suffix is appended to the named slot only when the field's
value differs from its schema `default` and the named base slot differs
from its own `default` (an unpaired `paired_charid` of `-1` stays the
bare sentinel). On decode the named slot is split on `^`: the first token
is the base slot's value and a trailing token maps back to the field's
type; a missing or unknown suffix is the `default`. Currently set on MS
`paired_order` (an integer z-offset), suffixed onto `paired_charid` — the
`^` slot only round-trips `0`/`1`, so richer group ordering is JSON-only.

## Custom packets

A library caller can register a header this spec doesn't define. Given a
schema in the same format as `packets/schemas/` (it may `$ref` the shared
types), the packet gets everything a spec packet does: validation, defaults,
JSON in schema order with `$extras`, and FantaCode by the walker rules above.
Without a schema its JSON is the payload's own fields after `$header`, and it
has no FantaCode form, so it can only be sent to a JSON session. Either form
can be overridden by caller code for wire shapes these rules don't cover. A
spec header can't be registered; add fields to it with `$extras`.

## Reserved property names

- `$header`: every packet schema declares `$header` as a `const` string
  matching the wire header. The framing layer reads/writes it; validators
  enforce it; the typed shape on the consumer side may or may not expose
  it (TS strips it on decode).

## Formatting and validation

Keep all JSON files formatted with `./format.sh`. Run `./validate.sh` to check
the invariants above: JSON parses, `$ref`s resolve, each packet's `title`
matches its `$header`, `x-receiver` is set, every packet and non-const field
has a `description`, `enum`/`x-enum-description` lengths agree,
and every `x-fanta-codec` is documented in `packets/CODECS.md`.
