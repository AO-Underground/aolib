/**
 * Encode: typed packet → wire string.
 *
 * Validation is delegated to Ajv via `validate(schema, ...)`: defaults
 * fill in, extras strip out, required-field misses throw. The library
 * itself only owns the two wire-format steps that Ajv can't express:
 *
 *   - JSON path: stringify the validated envelope.
 *   - Fanta path: walk the JSON Schema property order, emit positional
 *     tokens, frame with `HEADER#…#%`.
 */

import { toFantaArgs } from "./fanta";
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
  // Ajv expects `$header` to be present (const). `$header` first
  // preserves the canonical envelope key order.
  const envelope: Record<string, unknown> = { $header: header, ...(packet as Record<string, unknown>) };
  validate(schema, envelope);

  if (mode === "json") {
    return JSON.stringify(envelope);
  }
  return frameFanta(header, toFantaArgs(schema, envelope));
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
