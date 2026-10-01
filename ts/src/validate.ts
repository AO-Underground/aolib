/**
 * Ajv-driven validation, driven directly by JSON Schema.
 *
 * `validate(schema, value)` mutates `value` in place, Ajv fills
 * defaults and strips additional properties when configured. The same
 * compiled validator is used by both encode (pre-serialize) and decode
 * (post-parse) so the typed packet shape is identical on both ends.
 *
 * Validators compile lazily on first use and cache via a WeakMap keyed
 * by the schema object.
 *
 * Errors throw with a single message listing each Ajv issue and its
 * instancePath, so session-layer hooks (onDecodeError, etc.) keep
 * working unchanged.
 */

import Ajv, { type ValidateFunction } from "ajv";
import type { JsonSchema } from "./types";
import { enumSchemas, typeSchemas } from "../generated/packets";
import { registerRefSchema } from "./fanta";

const ajv = new Ajv({
  useDefaults: true,
  removeAdditional: true,
  coerceTypes: false,
  // The packet's $header is a `const`; strict mode complains about
  // benign keywords (`$schema`, `title`, our `x-fanta-*` extensions).
  strict: false,
});

// Register shared enum + type schemas so packet `$ref`s resolve at
// both the validator (Ajv) and the wire walker (fanta). Each schema's
// `$id` is its absolute path (e.g. `/types/Foo.schema.json`); packet
// `$ref`s use relative paths (`../../types/Foo.schema.json`) which Ajv
// resolves against the parent packet's `$id`
// (`/packets/schemas/X.schema.json`) per RFC 3986, producing the shared
// schema's `$id` exactly.
for (const s of [...enumSchemas, ...typeSchemas] as JsonSchema[]) {
  ajv.addSchema(s);
  if (typeof s.$id === "string") registerRefSchema(s.$id, s);
}

const cache = new WeakMap<JsonSchema, ValidateFunction>();

/** Compile a caller's schema now, replacing any earlier schema with its `$id`. */
export function compileSchema(schema: JsonSchema): void {
  if (typeof schema.$id === "string") ajv.removeSchema(schema.$id);
  cache.set(schema, ajv.compile(schema));
}

function getValidator(schema: JsonSchema): ValidateFunction {
  let v = cache.get(schema);
  if (!v) {
    v = ajv.compile(schema);
    cache.set(schema, v);
  }
  return v;
}

/**
 * Validate `value` against the schema. Mutates the value: fills
 * defaults, removes additional properties. Throws on failure.
 *
 * The caller is responsible for `$header`: set it before calling so
 * Ajv's `const` check passes; strip after if you don't want it on
 * the typed result.
 */
export function validate(
  schema: JsonSchema,
  value: Record<string, unknown>,
): void {
  const v = getValidator(schema);
  if (!v(value)) {
    const errs = v.errors ?? [];
    const msg = errs
      .map((e) => `${e.instancePath || "/"} ${e.message ?? "invalid"}`)
      .join("; ");
    const header = typeof schema.title === "string" ? schema.title : "<packet>";
    throw new Error(`Validation failed for ${header}: ${msg}`);
  }
}
