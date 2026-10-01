# aolib

Self-contained TypeScript library for the Attorney Online protocol.

Owns every packet schema, both wire formats (fantacode + JSON), the
encode/decode logic, and the typed dispatch surface. Clients see only
typed sender functions and typed receive handlers, never wire bytes,
positional slots, literals, or format flags.

The runtime dependencies are Ajv, used to validate every packet against
its JSON Schema on both encode and decode, and js-ini, the base for the
char.ini parser. The library is transport-agnostic: plug it into a
WebSocket (or anything that ships strings), it does the rest.

## Protocol reference

aolib tries to stay faithful to the official AO protocol documentation
at <https://github.com/AttorneyOnline/docs>. When a packet's behavior
on the wire is ambiguous in code, the docs there are the tiebreaker. If
behavior here ever drifts from what's documented upstream, it's a bug
in this library, not a deliberate fork.

That said, the docs occasionally lag the implementation in real-world
servers (and clients). Where field-level details diverge, the schema
file calls it out in a comment, e.g. CC's leading positional slot is
spec'd as a hardcoded `0` but webAO has historically sent the player
ID there. The library emits the spec value; the comment records the
historical drift.

## Requirements

The library ships as raw TypeScript and imports its JSON schemas
directly, so it runs under [bun](https://bun.sh) or any bundler that
resolves `.ts` and JSON imports. Plain Node cannot load it as-is.

```sh
bun add aolib-ts
```

## Usage

The library is used the same way on both sides of the wire. The unit
of work is a **session**, one logical connection with its own encoding
mode, its own handler registrations, and its own state. A session is
named for the **remote party**: a client constructs one `aolib.server`
representing the server it talks to; a server constructs one
`aolib.client` per accepted client.

The local role is inferred from the remote: in `server.send.MS(...)`
the server is the remote, so the local side (which is us, a client) is
the one sending. In `client.on.HI(...)` the client is the remote, so
the local side (the server) is the one receiving. Reads naturally at
the call site.

Two complete worked examples live in `examples/` and typecheck
end-to-end:

- [`examples/exampleClient.ts`](./examples/exampleClient.ts), browser
  client with one WebSocket, registering handlers for inbound server
  packets and sending packets back.
- [`examples/exampleServer.ts`](./examples/exampleServer.ts), Node
  server using `ws`, one session per accepted connection, with a
  broadcast helper.

The highlights:

- **Both sides use `session.on.X(handler)` and `session.send.X(packet)`
  with the same call shape.** Direction is what differs, not API.
- **The factory picks the typed namespace.** `aolib.server(...)` gives
  you `ServerSession.send.HI` (we send HI to the server) and
  `ServerSession.on.BB` (the server sends BB to us). `aolib.client(...)`
  gives the inverse. Wrong-direction calls don't compile.
- **Each session tracks its own encoding mode independently.** One
  client on JSON, another on fanta, connected to the same server,
  simultaneously, the library doesn't care.
- **Broadcast is one loop at the call site.** No library helper;
  fanning out depends on the caller's topology (area? room? all?) and
  the library has nothing to add.

## Public API

Import the namespace so call sites read `aolib.server`, `aolib.Side`, etc.,
and typing `aolib.` autocompletes the common surface:

```ts
import * as aolib from "aolib-ts";        // everyday surface
import * as wire from "aolib-ts/wire";    // only to bypass the session layer
```

The root (`aolib.`) is the common surface: `server`/`client`, the enums
(`Side`, `EmoteModifier`, ...), `parseCharIni`, and the session types.
Packet types are grouped under `aolib.packets.*` (you rarely name them; the
session infers them). Low-level encode/decode, codec registration, and the
header→schema registries live under `aolib-ts/wire`. Named imports
(`import { server } from "aolib-ts"`) work too and are equivalent.

```ts
// Session factories, named for the REMOTE party. Pick the one that
// matches who's on the other end; the typed surface follows.

// Construct a session representing the server you're connected to.
// Used by client-side code (one per process).
aolib.server(config: SessionConfig): ServerSession

// Construct a session representing one client connected to you.
// Used by server-side code (one per accepted connection).
aolib.client(config: SessionConfig): ClientSession

interface SessionConfig {
  // Required: how we ship outbound bytes for this session.
  send: (wire: string) => void;

  // Optional: observability hooks. Each defaults to a `console.warn`
  // / `console.error` summary of the event.
  onMalformedFrame?:  (err: Error, wire: string) => void;
  onUnknownHeader?:   (header: string, wire: string) => void;
  onDecodeError?:     (header: string, err: Error, wire: string) => void;
  onUnhandled?:       (header: string, packet: unknown) => void;
  onHandlerError?:    (header: string, err: Error, packet: unknown) => void;
}

// On every session:
session.receive(wire: string): void          // never throws; routes via hooks

session.send.<HEADER>(packet): void          // typed sender, role-aware
session.on.<HEADER>(handler): void           // typed receiver, role-aware

session.setJsonMode(enabled: boolean): void  // outbound: JSON vs fanta; inbound always auto-detects
session.close(): void                        // mark closed, detach handlers
```

Each session type exposes exactly the packets that direction sees:

- `ServerSession` (representing the server, used in client code):
  - `.send.<X>` where X is what a client sends: `HI`, `MS`, `MC`, `CC`,
    `CT`, ...
  - `.on.<X>` where X is what a server sends: `BB`, `PV`, `DONE`, `BN`,
    `ID`, `FL`, `SI`, ...

- `ClientSession` (representing one client, used in server code):
  - `.send.<X>` where X is what a server sends (same set as
    `ServerSession.on`).
  - `.on.<X>` where X is what a client sends (same set as
    `ServerSession.send`).

The mapping is derived from each schema's `x-receiver` annotation in
[`spec`](../spec/README.md), so adding a new packet
automatically lands it in the right namespace on the right session
type, no boilerplate to keep in sync. Symmetric bidirectional packets
(e.g. `MC`, `HP`) live as two schemas sharing one header, named after the
receiving side (`MCToServer`/`MCToClient`, `HPToServer`/`HPToClient`); the
session keys both by the bare header, so `server.send.MC({...})` takes
`MCToServer`'s input shape and `server.on.MC((p) => ...)` receives
`MCToClient`'s decoded shape.

Packets are plain typed objects (no classes, no `instanceof`). You rarely
name a packet type: the session infers it. Handlers get the decoded packet
typed for you; senders take the send shape (`...Init`, default-bearing
fields optional):

```ts
import * as aolib from "aolib-ts";

const server = aolib.server({ send: (w) => ws.send(w) });

server.on.MS((p) => {            // p is inferred as packets.MSToClient
  if (p.side === aolib.Side.def) { /* ... */ }   // or: p.side === "def"
});
server.send.HI({ hdid });        // arg checked against packets.HIInit
```

When you do need a packet type by name (e.g. a standalone handler), it
lives under `aolib.packets`:

```ts
function handleChatMessage(p: aolib.packets.MSToClient) { /* ... */ }
server.on.MS(handleChatMessage);
```

### char.ini

`parseCharIni(text)` reads a character's `char.ini` asset into a typed
`CharIni`. char.ini is INI-shaped, but its emote records are
`#`-delimited (`normal#-#idle#1`), which most INI libraries truncate by
treating `#` as an inline comment, so the base parse leaves `#` out of
the comment set, then a tuning pass folds the flat sections into
structure.

```ts
import * as aolib from "aolib-ts";

const char = aolib.parseCharIni(text);
char.options.showname;   // typed [options] block (values verbatim)
char.options.model;      // set => 3D character
char.emotes;             // normalized emote table, in button order
char.sections;           // every section, for blocks not modelled above
```

Two emote encodings normalize to one `CharEmote[]` (per the
[`CharIni` spec](./spec/assets/README.md)): the preferred
`[emote <name>]` blocks, and the legacy `#`-delimited
`[Emotions]`/`[SoundN]`/`[SoundT]` banks used when no block is present.
The parser prefers blocks and falls back to the banks.

Each `CharEmote` carries `{ id, key, name, anim, preanim, postanim,
modifier, deskmod, sound, sounddelayms }`, where `key` is the stable identity
(block name, or the stringified id for legacy), `preanim`/`postanim` are null
when the emote has none, and `postanim` (an exit animation) exists only in the
block format. Section and key *names* are matched case-insensitively
(authors mix `[Options]` and `[options]`); values are preserved as
written, so lowercase at the point of use if you build case-insensitive
asset URLs.

## Folder structure

```
ts/
├── README.md                  ← you are here
├── package.json
├── scripts/
│   └── codegen.ts             ← reads ../spec/, writes generated/
├── generated/                 ← committed; regenerate with `bun codegen`
│   ├── packets.ts             ← packet types + Init, c2s/s2c schema maps
│   ├── enums.ts               ← enum union+const from types/*.schema.json
│   └── types.ts               ← shared object types from types/*.schema.json
├── src/
│   ├── index.ts               ← public exports
│   ├── session.ts             ← server() / client() factories + dispatch
│   ├── encode.ts              ← envelope dispatch (JSON vs fanta)
│   ├── decode.ts              ← decode + readHeader + wire-format auto-detect
│   ├── fanta.ts               ← positional wire walker + escape rules + $ref resolver
│   ├── validate.ts            ← Ajv adapter sharing the same schemas
│   ├── enums.ts               ← runtime enum helpers
│   ├── types.ts               ← JsonSchema, Codec, WireMode
│   └── codecs/                ← bespoke codecs for x-fanta-codec packets (ARUP)
├── examples/
│   ├── exampleClient.ts
│   └── exampleServer.ts
└── tests/
```

`spec/` (at the repo root, `../spec/`) is the protocol source of truth,
shared across every language binding. Each library has its
own codegen step that consumes those schemas and emits native types,
validators, and wire encoders/decoders. See
[`spec/README.md`](../spec/README.md) for the schema layout
and custom `x-*` extensions in full.

## Anatomy of a packet definition (for library contributors)

Packets are JSON Schema (draft-07). A schema is the *only* source of
truth, the TS types, the Ajv validator, and the fanta walker all read
from it. Add a packet by dropping one file under
`spec/packets/schemas/` and running `bun codegen`.

A minimal packet:

```json
// spec/packets/schemas/MCToServer.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MCToServer.schema.json",
  "title": "MC",
  "type": "object",
  "properties": {
    "$header":  { "type": "string", "const": "MC" },
    "name":     { "type": "string" },
    "char_id":  { "type": "integer" },
    "showname": { "type": "string", "default": "" },
    "effects":  { "type": "integer", "default": 0 }
  },
  "required": ["$header", "name", "char_id"],
  "additionalProperties": false,
  "x-receiver": "server"
}
```

`$header` is the reserved property name for the wire header; the
framing layer reads and writes it and the validator pins it via
`const`. `x-receiver` names which side receives this packet on the
wire, `"server"` here means the packet flows client→server, so it
lands under `ServerSession.send.MC` (and `ClientSession.on.MC`).

The wire form is positional fanta or JSON envelope, picked
per-session:

```
fanta:  MC#track.opus#5#Phoenix#0#%
JSON:   {"$header":"MC","name":"track.opus","char_id":5,"showname":"Phoenix","effects":0}
```

Both shapes carry the same fields in the same order; the fanta walker
derives per-slot encoding from the property's JSON type (string =
escape; integer/number = stringify; boolean = `"1"`/`"0"`; nested
object = `&`-joined sub-tokens in one slot; trailing array = greedy
over the remaining slots).

Shared structures live under `enums/` and `types/` and are pulled in
with `$ref`:

```json
// spec/packets/schemas/MSToServer.schema.json, excerpt
"side":      { "$ref": "../../types/Side.schema.json" },
"offset":    { "$ref": "../../types/Offset.schema.json" }
```

Spec quirks that recur become custom extensions (see
[`spec/README.md`](../spec/README.md) for the full set):

- **`x-receiver: "client" | "server"`**, direction.
- **`x-wire-ints: integer[]`**, on a string enum, the parallel legacy
  integers used on the fanta wire (JSON carries the string). Enums
  without it (e.g. `Side`) are sent as their string on both wires.
- **`x-fanta-codec: "<name>"`**, bypass the generic walker for that
  packet; the library looks up a codec registered under the name
  (live in `src/codecs/`) and delegates encode/decode to it. Used for
  packets whose wire form is discriminator-driven, like `ARUP`.
- **`x-fanta-unescape-amp: true`**, on an object-typed schema, tell
  decoders to tolerate the legacy `<and>` escape in incoming tokens.

After editing schemas, run:

```sh
bun codegen      # regenerate generated/{packets,enums,types}.ts
bun test
bun run typecheck
bun run lint
```

## JSON Schema as documentation

The schemas under `spec/` *are* the documentation
export, they're standards-compliant JSON Schema (draft-07) and drop
straight into AsyncAPI (purpose-built for WebSocket protocols),
Stoplight, Redoc, or any other JSON Schema renderer. No build step
needed; point the renderer at the directory.

The same schemas drive runtime validation: `src/validate.ts` wires
Ajv to every loaded schema, with `useDefaults`, `removeAdditional`,
and `$ref` resolution against each schema's absolute-path `$id`.
Encode validates pre-serialize, decode validates post-parse, so the
typed shape is identical on both ends and defaults fill in
symmetrically.

## Design principles

1. **Schema is data, not a class.** A schema is a JSON file. The
   generated TS types, the Ajv validator, and the fanta walker all
   read the same source, they can't disagree.

2. **The client never sees wire concerns.** No positional slots, no
   literals, no escape characters, no fanta-vs-JSON flag in the typed
   surface. The library does the format work; the client works in
   typed objects.

3. **Wire-format weirdness lives in the schema.** A spec quirk that
   recurs across packets becomes a custom `x-*` extension that the
   walker and codegen interpret. Truly one-off weirdness uses
   `x-fanta-codec` with a bespoke codec under `src/codecs/`.

4. **JSON and fanta are peer wire formats.** The library has a
   per-session mode toggle but no preference. Adding a third wire
   format means a new encode/decode pair in `src/`, not a touch
   anywhere in the schemas.

5. **The library never touches transport, state, or modes.** It's pure
   `(schema, packet) ↔ string` plus a thin dispatch layer. The client
   wires it into whatever transport it has.

6. **Evolution is additive.** New packets, new wire formats, new
   directions, all extend rather than modify. Existing schemas and
   call sites are untouched.

## Guarantees

- **Wrong-direction calls fail loudly at both layers.** Registering a
  handler or calling a sender for a packet that doesn't belong on this
  session's role fails at compile time (the typed namespace doesn't
  expose the header) AND at runtime (the session throws with a clear
  message). The runtime guard exists for the case where TS is bypassed
  via `any` cast or the library is consumed from plain JavaScript.

  ```ts
  const server = aolib.server({ send: w => ws.send(w) });

  server.on.HI(() => {});
  //        ^^ TS error: HI is sent by clients, not received from server.
  //        At runtime, this also throws:
  //          aolib: cannot register on.HI on a ServerSession
  //          (HI is sent client → server; register it on a ClientSession instead)
  ```

  Symmetric on the sender side: `server.send.BB({...})` rejects at
  compile time and throws at runtime.

- **`receive(wire)` never throws.** All failure modes (malformed
  frames, unknown headers, decode errors, missing handlers, handlers
  throwing) route through the optional callbacks on `SessionConfig`.
  One inbound frame either runs a typed handler or invokes exactly one
  observability hook, never both, never neither.

- **Each session's encoding mode is independent.** A server with
  several connected clients can have some on fanta and some on JSON
  simultaneously. Outbound mode is per-session and starts at fanta;
  the application calls `session.setJsonMode(true)` when it sees the
  protocol's mode-switch signal (e.g. on receipt of `decryptor`). The
  library does not inspect packet contents to flip modes on its own.
  Inbound always auto-detects.

- **Schemas don't disagree with types.** The JSON Schema files under
  `spec/` are the source for both runtime walks and the
  generated TS types. There's no hand-written type that can drift;
  if a field set changes, `bun codegen` propagates the change to
  every consumer (sender, handler, encode, decode, validator) in one
  pass.

## What this library is not

- Not a client. It does not own a WebSocket, replay mode, DOM, character
  state, voice, or anything else. It owns packets and only packets.
- Not a general-purpose JSON Schema toolchain. The schemas carry
  AO-specific extensions (`x-fanta-codec`, `x-fanta-unescape-amp`,
  `x-receiver`) and validation is one fixed Ajv configuration tuned
  for the protocol, bring Zod or your own Ajv for non-AO work.
- Not async. `send` and `receive` are synchronous string operations.
  Transport (WebSocket etc.) is the client's concern.
