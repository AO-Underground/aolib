# aolib

The Attorney Online 2 protocol: one authoritative definition, and several
implementations of it that are tested to agree on the wire.

`spec/` is the source of truth. It defines every packet as a JSON Schema
(draft-07) alongside the behavior and wire-format rules (the positional
FantaCode form, the JSON envelope, the `char.ini` asset grammar, and custom
codecs). The language bindings never hand-write packet types: each generates
them from `spec/`, so the schema is the one place the protocol changes.

## Layout

- `spec/` — the protocol itself: packet, type, and asset schemas plus the
  behavior docs. Start at `spec/README.md`.
- `aolib-go/` — Go implementation (`github.com/AO-Underground/aolib/aolib-go`),
  generated from `spec/`.
- `aolib-ts/` — TypeScript implementation, generated from `spec/`.
- `conformance/` — language-neutral interop vectors every binding must satisfy.

## Staying in sync

Two guards run in CI (`.github/workflows/ci.yml`) on every push:

- **codegen determinism**: each binding's committed generated code must equal a
  fresh generation from `spec/`, so an implementation cannot silently drift from
  the protocol.
- **conformance**: each binding decodes and re-encodes the shared `conformance/`
  vectors and must produce identical bytes, so the implementations actually
  interoperate rather than merely resembling each other.

A binding also proves its dispatch set matches `spec/` exactly, and each lib's
own suite covers its encode/decode.

## Adding an implementation

Generate types and codecs from `spec/`, wire up the same two guards, and make it
pass the `conformance/` vectors. Nonstandard, server-specific packets are not
part of the protocol here; a binding facilitates them through its own custom
codec facility rather than adding them to `spec/`.
