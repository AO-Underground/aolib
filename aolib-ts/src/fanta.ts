/**
 * Fanta wire-format walker, driven by JSON Schema.
 *
 * One positional slot per top-level property (skipping `$header`,
 * the framing layer carries it). Per-property semantics come from
 * the JSON Schema:
 *
 *   "string"          escape-fanta on encode, unescape+unicode on decode
 *   "number"/"integer" String(n) on encode, Number(token) on decode
 *   "boolean"         "1"/"0" on encode, token === "1" on decode
 *   "object"          recurse, join sub-tokens with `&`, or with the
 *                     `x-fanta-separator` value when set (`|` for MS
 *                     effect; an all-empty object collapses to an empty
 *                     slot). Optional `x-fanta-unescape-amp: true`
 *                     tolerates the legacy `<and>` form on decode (offset
 *                     slot in MS). Encoders never emit `<and>`.
 *   "array"           greedy, consumes all remaining slots
 *   const             emitted as the const value; on decode the slot
 *                     is consumed but the schema-fixed value is used
 *
 * Custom packets register a codec via `x-fanta-codec` at the schema
 * level (ARUP). The codec gets the raw args array and returns the
 * partial packet (and vice versa).
 *
 * Validation, default-filling, and required-checking are Ajv's job
 * (see `./validate`). This walker only converts between the typed
 * value and its positional-token form.
 */

import type { JsonSchema, Codec } from "./types";

// Chat-escape helpers, public so ARUP-style custom codecs can reuse.

export function escapeFanta(s: string): string {
  return s
    .replaceAll("#", "<num>")
    .replaceAll("&", "<and>")
    .replaceAll("%", "<percent>")
    .replaceAll("$", "<dollar>");
}

export function unescapeFanta(s: string): string {
  return s
    .replaceAll("<num>", "#")
    .replaceAll("<and>", "&")
    .replaceAll("<percent>", "%")
    .replaceAll("<dollar>", "$");
}

export function unescapeUnicode(s: string): string {
  return s.replace(/\\u([\d\w]{1,})/gi, (_m: string, g: string) =>
    String.fromCharCode(parseInt(g, 16)),
  );
}

// Custom codec registry.

const codecs = new Map<string, Codec>();

export function registerCodec(name: string, codec: Codec): void {
  codecs.set(name, codec);
}

/**
 * Look up a registered codec by name (a packet's `x-fanta-codec`, or, for a
 * caller-registered custom header, the header itself). Returns undefined when
 * none is registered. Used by the session custom channel to encode/decode a
 * custom header's FantaCode form.
 */
export function lookupCodec(name: string): Codec | undefined {
  return codecs.get(name);
}

function getCodec(name: string): Codec {
  const c = codecs.get(name);
  if (!c) throw new Error(`fanta: no codec registered as '${name}'`);
  return c;
}

// $ref registry, mirrors Ajv's schema registry so the walker can look
// through `$ref` to find the underlying type / enum. Schemas are keyed
// by their `$id` (e.g. `/types/Foo.schema.json`).

const refSchemas = new Map<string, JsonSchema>();

export function registerRefSchema(id: string, schema: JsonSchema): void {
  refSchemas.set(id, schema);
}

/**
 * RFC 3986 §5.2-style path resolution. Schemas use absolute-path `$id`s
 * (e.g. `/packets/schemas/MS.schema.json`); refs are relative paths
 * (`../../types/Foo.schema.json`). Resolution gives back another absolute
 * path matching the target's `$id`.
 */
function resolvePath(ref: string, base: string): string {
  if (!base) return ref;
  if (ref.startsWith("/")) return ref;
  const baseDir = base.slice(0, base.lastIndexOf("/") + 1);
  const parts: string[] = [];
  for (const seg of (baseDir + ref).split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== "." && seg !== "") parts.push(seg);
  }
  return (base.startsWith("/") ? "/" : "") + parts.join("/");
}

/**
 * Resolve a `$ref` against the registry. Sibling keywords on the
 * referring property (e.g. `default`) win over the referenced schema.
 */
function resolveRef(s: JsonSchema, baseId: string): JsonSchema {
  if (!s.$ref) return s;
  const target = refSchemas.get(resolvePath(s.$ref, baseId));
  if (!target) return s;
  return { ...target, ...s };
}

// Per-property token codecs.

function jsonType(s: JsonSchema): string | undefined {
  if (typeof s.type === "string") return s.type;
  if (Array.isArray(s.type)) return s.type[0];
  return undefined;
}

/** The parallel legacy integer array for a string enum, or undefined. */
function wireInts(s: JsonSchema): number[] | undefined {
  const w = s["x-wire-ints"];
  return Array.isArray(w) ? (w as number[]) : undefined;
}

/**
 * Encode an `x-wire-ints` enum value to its legacy integer token, or
 * undefined when the schema is not such an enum.
 */
function wireIntOf(schema: JsonSchema, value: unknown): string | undefined {
  const w = wireInts(schema);
  if (!w || !Array.isArray(schema.enum)) return undefined;
  const idx = schema.enum.indexOf(value);
  if (idx === -1 || w[idx] === undefined) {
    throw new Error(
      `fanta: value ${JSON.stringify(value)} is not a member of the enum ${schema.$id ?? ""}`,
    );
  }
  return String(w[idx]);
}

/**
 * Decode a legacy integer token back to its `x-wire-ints` enum string,
 * or undefined when the schema is not such an enum.
 */
function enumFromWireInt(schema: JsonSchema, token: string, name: string): unknown {
  const w = wireInts(schema);
  if (!w || !Array.isArray(schema.enum)) return undefined;
  const idx = w.indexOf(Number(token));
  if (idx === -1) {
    throw new Error(
      `Invalid enum wire value for field '${name}': ${JSON.stringify(token)}`,
    );
  }
  return schema.enum[idx];
}

function encodeToken(rawSchema: JsonSchema, value: unknown, baseId: string): string {
  const schema = resolveRef(rawSchema, baseId);
  // `const` properties (literal padding like PV's _cid) emit the const
  // value regardless of what's in the packet, Ajv guarantees they
  // match.
  if (schema.const !== undefined) return encodeScalar(typeof schema.const, schema.const);

  // String enum with `x-wire-ints`: JSON carries the string, the wire
  // carries the parallel legacy integer.
  const wire = wireIntOf(schema, value);
  if (wire !== undefined) return wire;

  const t = jsonType(schema);
  if (t === "object") {
    const sep = typeof schema["x-fanta-separator"] === "string" ? schema["x-fanta-separator"] : "&";
    const parts: string[] = [];
    const props = schema.properties ?? {};
    const obj = (value ?? {}) as Record<string, unknown>;
    for (const [k, sub] of Object.entries(props)) {
      parts.push(encodeToken(sub, obj[k], baseId));
    }
    // An object with a custom separator uses an all-empty value as the
    // "absent" sentinel: it collapses to an empty slot (MS effect = no effect).
    if (schema["x-fanta-separator"] && parts.every((p) => p === "")) return "";
    return parts.join(sep);
  }
  return encodeScalar(t, value);
}

function encodeScalar(t: string | undefined, value: unknown): string {
  switch (t) {
    case "string":  return escapeFanta((value ?? "") as string);
    case "boolean": return value ? "1" : "0";
    case "integer":
    case "number":  return String(value);
    default:        return String(value);
  }
}

function decodeToken(rawSchema: JsonSchema, token: string, name: string, baseId: string): unknown {
  const schema = resolveRef(rawSchema, baseId);
  // `const`, fanta wire delivers the const value at this slot; the
  // schema's const is the source of truth (Ajv would reject anything
  // else anyway).
  if (schema.const !== undefined) return schema.const;

  // String enum with `x-wire-ints`: the wire integer maps back to the
  // enum's string value.
  const enumValue = enumFromWireInt(schema, token, name);
  if (enumValue !== undefined) return enumValue;

  const t = jsonType(schema);
  if (t === "object") {
    const sep = typeof schema["x-fanta-separator"] === "string" ? schema["x-fanta-separator"] : "&";
    const raw = schema["x-fanta-unescape-amp"] ? token.replaceAll("<and>", "&") : token;
    const parts = raw.split(sep);
    const result: Record<string, unknown> = {};
    let i = 0;
    for (const [k, sub] of Object.entries(schema.properties ?? {})) {
      result[k] = decodeToken(sub, parts[i++] ?? "", `${name}.${k}`, baseId);
    }
    return result;
  }
  return decodeScalar(t, token, name);
}

function decodeScalar(t: string | undefined, token: string, name: string): unknown {
  switch (t) {
    case "string":
      return unescapeUnicode(unescapeFanta(token));
    case "boolean":
      if (token !== "0" && token !== "1") {
        throw new Error(`Invalid boolean for field '${name}': expected "0" or "1", got ${JSON.stringify(token)}`);
      }
      return token === "1";
    case "integer":
    case "number": {
      if (token === "") throw new Error(`Invalid number for field '${name}': empty token`);
      const n = Number(token);
      if (Number.isNaN(n)) throw new Error(`Invalid number for field '${name}': ${JSON.stringify(token)}`);
      return n;
    }
    default:
      return token;
  }
}

// Args-list walker (top-level).

/**
 * Walk a packet schema and emit the ordered positional args list.
 * `packet` arrives Ajv-validated; this just serializes.
 */
export function toFantaArgs(
  schema: JsonSchema,
  packet: Record<string, unknown>,
): string[] {
  if (schema["x-fanta-codec"]) {
    return getCodec(schema["x-fanta-codec"]).encodeFanta(packet);
  }

  const baseId = typeof schema.$id === "string" ? schema.$id : "";
  const args: string[] = [];
  const props = schema.properties ?? {};
  for (const [name, sub] of Object.entries(props)) {
    if (name === "$header") continue;

    // Trailing array: greedy, fan out into one slot per element.
    if (jsonType(sub) === "array") {
      const items = (packet[name] as unknown[] | undefined) ?? [];
      const elem = sub.items ?? {};
      for (const item of items) args.push(encodeToken(elem, item, baseId));
      continue;
    }

    args.push(encodeToken(sub, packet[name], baseId));
  }
  return args;
}

/**
 * Walk a packet schema and parse the ordered positional args list into
 * a partial packet. Ajv runs over the result afterwards.
 */
export function fromFantaArgs(
  schema: JsonSchema,
  args: string[],
): Record<string, unknown> {
  if (schema["x-fanta-codec"]) {
    return getCodec(schema["x-fanta-codec"]).decodeFanta(args);
  }

  const baseId = typeof schema.$id === "string" ? schema.$id : "";
  const result: Record<string, unknown> = {};
  const props = schema.properties ?? {};
  let cursor = 0;

  for (const [name, sub] of Object.entries(props)) {
    if (name === "$header") continue;

    if (jsonType(sub) === "array") {
      const elem = sub.items ?? {};
      result[name] = args
        .slice(cursor)
        .map((token, i) => decodeToken(elem, token, `${name}[${i}]`, baseId));
      cursor = args.length;
      continue;
    }

    const token = args[cursor++];
    if (token === undefined) continue; // Ajv fills the default
    result[name] = decodeToken(sub, token, name, baseId);
  }

  return result;
}
