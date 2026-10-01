/**
 * Exhaustive: every registered packet round-trips on both wire formats.
 *
 * The per-packet shape tests (MS, ARUP, packets.ts) cover the interesting
 * cases in depth; this proves the remaining ~55 are not just present in the
 * registry but actually encode and decode. For each schema it builds a
 * minimal, required-only input, then asserts the two wire formats decode
 * identically and that re-encoding the decoded packet is stable.
 */

import { describe, it, expect } from "bun:test";
import {
  c2sSchemas,
  s2cSchemas,
  enumSchemas,
  typeSchemas,
} from "../generated/packets";
import { encode } from "../src/encode";
import { decode } from "../src/decode";
import type { JsonSchema } from "../src/types";

// Resolve `$ref` by basename (as codegen does) so a sample value can be
// picked for enum / shared-object fields.
const byBase = new Map<string, JsonSchema>();
for (const s of [...enumSchemas, ...typeSchemas] as JsonSchema[]) {
  if (typeof s.$id === "string") byBase.set(s.$id.replace(/^.*\//, ""), s);
}
const deref = (p: JsonSchema): JsonSchema =>
  typeof p.$ref === "string" ? (byBase.get(p.$ref.replace(/^.*\//, "")) ?? p) : p;

const jtype = (s: JsonSchema): string | undefined =>
  Array.isArray(s.type) ? s.type[0] : s.type;

function sample(prop: JsonSchema): unknown {
  const s = deref(prop);
  if (Array.isArray(s.enum)) return s.enum[0];
  switch (jtype(s)) {
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      const o: Record<string, unknown> = {};
      const req = new Set(s.required ?? []);
      for (const [k, sub] of Object.entries(s.properties ?? {})) {
        if (req.has(k)) o[k] = sample(sub);
      }
      return o;
    }
    default:
      return "x";
  }
}

// Only required, non-const fields: encode fills every default (and const
// padding like PV's `_cid`, which carries a default) via Ajv.
function minimalInput(schema: JsonSchema): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  const req = new Set(schema.required ?? []);
  for (const [k, sub] of Object.entries(schema.properties ?? {})) {
    if (k === "$header" || sub.const !== undefined) continue;
    if (req.has(k)) o[k] = sample(sub);
  }
  return o;
}

const dirs = [
  ["c2s", c2sSchemas],
  ["s2c", s2cSchemas],
] as const;

describe("every registered packet round-trips on both wires", () => {
  for (const [tag, map] of dirs) {
    for (const [header, schema] of Object.entries(
      map as unknown as Record<string, JsonSchema>,
    )) {
      it(`${tag} ${header}`, () => {
        const min = minimalInput(schema);
        const decF = decode(schema, encode(schema, min, "fanta"));
        const decJ = decode(schema, encode(schema, min, "json"));
        // Both wire formats decode to the same object.
        expect(decF).toEqual(decJ);
        // Re-encoding the decoded packet is stable on both.
        expect(decode(schema, encode(schema, decF, "fanta"))).toEqual(decF);
        expect(decode(schema, encode(schema, decJ, "json"))).toEqual(decJ);
      });
    }
  }
});
