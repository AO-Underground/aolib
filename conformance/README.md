# Conformance vectors

Language-neutral interop vectors shared by every `aolib-*` binding. Each vector
pins one packet's canonical wire bytes in both formats:

```
{ "id", "header", "receiver", "fanta": "HEADER#...#%", "json": { "$header": ..., ... } }
```

Each binding has a test (`aolib-go/conformance_test.go`,
`aolib-ts/tests/conformance.test.ts`) that, per vector, decodes both wire forms,
asserts they yield the same packet, and re-encodes to each form checking it
matches the pinned bytes exactly. Because every binding validates against the
same vectors, passing them means the bindings emit and accept identical wire
data: they interoperate.

The vectors are the reviewed oracle, not a dump of one binding's output; keep
them spec-correct.

## Coverage

Every packet schema, in each direction, has at least one vector. Strings carry
`#`/`&`/`%`/`$` wherever a field allows them, so escaping is checked
everywhere.
