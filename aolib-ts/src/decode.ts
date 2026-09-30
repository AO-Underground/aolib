/**
 * Decode: wire string → typed packet.
 *
 * Auto-detects format from the first byte (`{` ⇒ JSON envelope; anything
 * else ⇒ fanta positional), parses into a partial object, then hands
 * off to Ajv via `./validate` for validation + default-filling.
 *
 * The fanta parser only owns string→typed token conversion; range /
 * type validation comes from the JSON Schema via Ajv afterwards. JSON
 * mode is plain `JSON.parse` + Ajv.
 */

import { fromFantaArgs } from "./fanta";
import { validate } from "./validate";
import "./codecs";
import type { JsonSchema } from "./types";

export function decode(
  schema: JsonSchema,
  wire: string,
): Record<string, unknown> {
  return wire.startsWith("{") ? decodeJson(schema, wire) : decodeFanta(schema, wire);
}

/**
 * Read the header from a wire frame without fully decoding the body.
 * Used by the session dispatcher to look up which schema to pass to
 * `decode`. Throws on malformed input (caller routes via the
 * `onMalformedFrame` hook).
 */
export function readHeader(wire: string): string {
  if (wire.startsWith("{")) {
    const parsed = JSON.parse(wire) as { $header?: unknown };
    if (typeof parsed.$header !== "string") {
      throw new Error(`JSON envelope missing $header string`);
    }
    return parsed.$header;
  }
  const idx = wire.indexOf("#");
  return idx === -1 ? wire : wire.slice(0, idx);
}

function headerOf(schema: JsonSchema): string {
  const h = schema.properties?.$header?.const;
  if (typeof h !== "string") {
    throw new Error("decode: schema is missing a string `$header` const");
  }
  return h;
}

function decodeJson(
  schema: JsonSchema,
  wire: string,
): Record<string, unknown> {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(wire) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`Invalid JSON wire: ${(err as Error).message}`);
  }

  const expected = headerOf(schema);
  if (parsed.$header !== expected) {
    throw new Error(
      `Wire header mismatch: expected '${expected}', got '${String(parsed.$header)}'`,
    );
  }

  validate(schema, parsed);
  stripConsts(schema, parsed);
  return parsed;
}

/**
 * Drop properties whose value is fixed by `const` (e.g. `$header`,
 * PV's `_cid`). The class instance types exclude these, so the
 * runtime shape needs to match.
 */
function stripConsts(schema: JsonSchema, value: Record<string, unknown>): void {
  for (const [k, sub] of Object.entries(schema.properties ?? {})) {
    // Keep `$header`: it is the decoded packet's discriminant. Strip other
    // const padding (e.g. PV's `_cid`).
    if (k === "$header") continue;
    if ("const" in sub) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- stripping const-typed schema props by name
      delete value[k];
    }
  }
}

function decodeFanta(
  schema: JsonSchema,
  wire: string,
): Record<string, unknown> {
  // Peel terminator forms, accept canonical `HEADER#a#b#%`, plus the
  // legacy variants `HEADER#a#b#` and `HEADER#a#b`.
  let trimmed = wire;
  if (trimmed.endsWith("%")) trimmed = trimmed.slice(0, -1);
  if (trimmed.endsWith("#")) trimmed = trimmed.slice(0, -1);

  const all = trimmed.split("#");
  const expected = headerOf(schema);
  if (all[0] !== expected) {
    throw new Error(
      `Wire header mismatch: expected '${expected}', got '${String(all[0])}'`,
    );
  }
  const args = all.slice(1);

  const partial = fromFantaArgs(schema, args);

  partial.$header = expected;
  validate(schema, partial);
  stripConsts(schema, partial);
  return partial;
}
