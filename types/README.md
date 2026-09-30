# Types

Shared schemas `$ref`'d by packets so a value's shape or meaning lives in one
place. Two flavors, told apart by schema shape rather than filename:

- **Named enums** (`type: string` with an `enum`): codegen emits one enum whose
  member names and values both come from `enum`; an optional `x-enum-description`
  gives a human-readable label per value.
- **Object types** (`type: object`, e.g. `Offset`): codegen emits one
  struct/interface, imported wherever referenced.

See the root `README.md` for the full codegen and wire-format rules.
