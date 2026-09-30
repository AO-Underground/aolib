# Types

Shared schemas `$ref`'d by packets so a value's shape or meaning lives in one
place. Two flavors, told apart by schema shape rather than filename:

- **Named enums** (`type: string`/`integer` with an `enum`): codegen emits one
  enum, using the parallel `x-enum-names` for the member names.
- **Object types** (`type: object`, e.g. `Offset`): codegen emits one
  struct/interface, imported wherever referenced.

See the root `README.md` for the full codegen and wire-format rules.
