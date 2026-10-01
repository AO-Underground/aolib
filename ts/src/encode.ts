/**
 * Encode: typed packet → wire string.
 *
 * Validation is delegated to Ajv via `validate(schema, ...)`: defaults
 * fill in, required-field misses throw. `$extras` bypasses validation and is
 * JSON-only. The library
 * itself only owns the two wire-format steps that Ajv can't express:
 *
 *   - JSON path: stringify the validated envelope.
 *   - Fanta path: walk the JSON Schema property order, emit positional
 *     tokens, frame with `HEADER#…#%`.
 */

import { resolveRef, toFantaArgs } from "./fanta";
import { validate } from "./validate";
import "./codecs";
import type { JsonSchema } from "./types";

export type WireMode = "fanta" | "json";

export function encode(
  schema: JsonSchema,
  packet: object,
  mode: WireMode,
): string {
  const header = headerOf(schema);
  const { $extras, ...fields } = packet as Record<string, unknown>;
  const envelope: Record<string, unknown> = { $header: header, ...fields };
  validate(schema, envelope);

  if (mode === "json") {
    return JSON.stringify(orderJson(schema, envelope, $extras as Record<string, unknown> | undefined));
  }
  return frameFanta(header, toFantaArgs(schema, envelope));
}

/** `$header`, then schema fields in schema order (nested objects too), then extras sorted by key. */
function orderJson(
  schema: JsonSchema,
  envelope: Record<string, unknown>,
  extras: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const props = schema.properties ?? {};
  const baseId = typeof schema.$id === "string" ? schema.$id : "";
  const out = ordered(schema, envelope, baseId) as Record<string, unknown>;
  const sorted = Object.entries(extras ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [key, value] of sorted) {
    if (key in props || key.startsWith("$")) {
      throw new Error(`encode: $extras key '${key}' collides with a schema field or reserved name`);
    }
    out[key] = value;
  }
  return out;
}

function ordered(rawSchema: JsonSchema, value: unknown, baseId: string): unknown {
  const schema = resolveRef(rawSchema, baseId);
  const items = schema.items;
  if (Array.isArray(value)) return items ? value.map((v) => ordered(items, v, baseId)) : value;
  if (value === null || typeof value !== "object" || !schema.properties) return value;
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, sub] of Object.entries(schema.properties)) {
    if (key in obj) out[key] = ordered(sub, obj[key], baseId);
  }
  return out;
}

function headerOf(schema: JsonSchema): string {
  const h = schema.properties?.$header?.const;
  if (typeof h !== "string") {
    throw new Error("encode: schema is missing a string `$header` const");
  }
  return h;
}

/**
 * `HEADER#a#b#%` for non-empty args, `HEADER#%` for zero args.
 * Spec-canonical, the trailing `%` is the wire terminator.
 */
function frameFanta(header: string, args: string[]): string {
  if (args.length === 0) return `${header}#%`;
  return `${header}#${args.join("#")}#%`;
}
