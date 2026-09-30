/**
 * Codegen: reads aolib-meta/ and emits generated/packets.ts + generated/enums.ts.
 *
 * Inputs:
 *   - aolib-meta/packets/schemas/<Name>.schema.json, one per packet
 *   - aolib-meta/types/<Name>.schema.json, shared enums and object types.
 *     A schema carrying an `enum` is a string-first enum (member names and
 *     values both come from `enum`; legacy integer wire encoding, if any,
 *     lives in `x-wire-ints` and is applied by the fanta walker). Anything
 *     else is a shared object type. Packets `$ref` these as
 *     `../../types/<Name>.schema.json`.
 *
 * Direction maps (c2s/s2c) are derived from each packet's `x-receiver`
 * + `$header` const, no sidecar registry.
 *
 * Outputs:
 *   - generated/enums.ts, one `export enum` per file under enums/
 *   - generated/packets.ts, one class per packet, plus direction maps
 *
 * For each .schema.json this produces a TypeScript class:
 *   - declared properties (`!: T`) carry the *decoded* shape, every
 *     visible field present
 *   - the constructor's parameter type carries the *input* shape,
 *     default-bearing fields optional, const-only slots omitted
 *   - the constructor body assigns visible fields with `??` defaults
 *
 * Properties whose schema is a `$ref` to an enum file render as the
 * named TS enum type, imported from `./enums`. Ajv resolves the same
 * `$ref` at validate-time via schemas added through `validate.ts`.
 *
 * Run via `bun run codegen`. Output is committed.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPTS_DIR, "..");
const META_ROOT = join(ROOT, "aolib-meta");
const PACKETS_DIR = join(META_ROOT, "packets/schemas");
// Enums and shared object types share the `types/` directory; a schema
// is an enum when it carries an `enum`, otherwise an object type.
const TYPES_DIR = join(META_ROOT, "types");
const OUT_PACKETS = join(ROOT, "generated/packets.ts");
const OUT_ENUMS = join(ROOT, "generated/enums.ts");
const OUT_TYPES = join(ROOT, "generated/types.ts");

// Read input

interface JsonSchema {
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  default?: unknown;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  title?: string;
  additionalProperties?: boolean;
  $schema?: string;
  $ref?: string;
  "x-fanta-escape"?: boolean;
  "x-fanta-codec"?: string;
  "x-wire-ints"?: number[];
  "x-receiver"?: "client" | "server";
  [k: string]: unknown;
}

interface PacketMeta {
  name: string;             // schema basename (e.g. "MCToServer")
  header: string;           // wire header (e.g. "MC")
  receiver: "client" | "server";
}

interface EnumDef {
  name: string;            // TS enum name, also file basename
  filename: string;        // e.g. "Side.schema.json"
  values: unknown[];       // schema enum values (also the member names)
  description?: string;
}

interface TypeDef {
  name: string;            // TS interface name, also file basename
  filename: string;        // e.g. "Offset.schema.json"
  schema: JsonSchema;      // the raw schema, used to render the body
  description?: string;
}

function loadJson(path: string): JsonSchema {
  return JSON.parse(readFileSync(path, "utf8")) as JsonSchema;
}

function loadPacketMeta(): PacketMeta[] {
  const out: PacketMeta[] = [];
  for (const name of listPacketNames()) {
    const schema = loadJson(join(PACKETS_DIR, `${name}.schema.json`));
    const header = schema.properties?.$header?.const;
    const receiver = schema["x-receiver"];
    if (typeof header !== "string") {
      throw new Error(`Packet ${name}: $header.const is missing or not a string`);
    }
    if (receiver !== "client" && receiver !== "server") {
      throw new Error(`Packet ${name}: x-receiver must be "client" or "server"`);
    }
    out.push({ name, header, receiver });
  }
  return out;
}

function listSchemaFiles(dir: string): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith(".schema.json"));
  } catch {
    return [];
  }
}

function listPacketNames(): string[] {
  return listSchemaFiles(PACKETS_DIR).map((f) => f.replace(/\.schema\.json$/, ""));
}

/**
 * Read `types/`, splitting each schema into an enum (carries `enum`,
 * member names and values both come from it) or a shared object type.
 */
function loadTypesAndEnums(): {
  enums: Map<string, EnumDef>;
  types: Map<string, TypeDef>;
} {
  const enums = new Map<string, EnumDef>();
  const types = new Map<string, TypeDef>();
  for (const filename of listSchemaFiles(TYPES_DIR)) {
    const schema = loadJson(join(TYPES_DIR, filename));
    const name = filename.replace(/\.schema\.json$/, "");
    const description =
      typeof schema.description === "string" ? schema.description : undefined;
    if (Array.isArray(schema.enum)) {
      enums.set(filename, { name, filename, values: schema.enum, description });
    } else {
      types.set(filename, { name, filename, schema, description });
    }
  }
  return { enums, types };
}

// JSON Schema → TS type rendering

interface RenderCtx {
  enums: Map<string, EnumDef>;
  types: Map<string, TypeDef>;
  enumImports: Set<string>; // populated with enum names referenced
  typeImports: Set<string>; // populated with type names referenced
}

function renderType(s: JsonSchema, indent: number, ctx: RenderCtx): string {
  if (s.$ref) {
    // Packet `$ref`s are relative paths (`../../types/Foo.schema.json`);
    // the enum/type maps are keyed by basename.
    const key = s.$ref.replace(/^.*\//, "");
    const enumDef = ctx.enums.get(key);
    if (enumDef) {
      ctx.enumImports.add(enumDef.name);
      return enumDef.name;
    }
    const typeDef = ctx.types.get(key);
    if (typeDef) {
      ctx.typeImports.add(typeDef.name);
      return typeDef.name;
    }
    return "unknown";
  }
  if (s.const !== undefined) return JSON.stringify(s.const);
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(" | ");

  const t = s.type;
  if (Array.isArray(t)) return t.map((tt) => primitive(tt)).join(" | ");
  if (t === "object") return renderObjectType(s, indent, ctx);
  if (t === "array") {
    const inner = s.items ? renderType(s.items, indent, ctx) : "unknown";
    return inner.includes(" ") && !inner.startsWith("{")
      ? `(${inner})[]`
      : `${inner}[]`;
  }
  if (typeof t === "string") return primitive(t);
  return "unknown";
}

function primitive(t: string): string {
  switch (t) {
    case "string":  return "string";
    case "integer":
    case "number":  return "number";
    case "boolean": return "boolean";
    case "null":    return "null";
    case "object":  return "Record<string, unknown>";
    case "array":   return "unknown[]";
    default:        return "unknown";
  }
}

function renderObjectType(s: JsonSchema, indent: number, ctx: RenderCtx): string {
  if (!s.properties) return "Record<string, unknown>";
  const required = new Set(s.required ?? []);
  const pad = "  ".repeat(indent + 1);
  const closing = "  ".repeat(indent);
  const lines: string[] = [];
  for (const [key, sub] of Object.entries(s.properties)) {
    const optional = !required.has(key);
    lines.push(`${pad}${quoteKey(key)}${optional ? "?" : ""}: ${renderType(sub, indent + 1, ctx)};`);
  }
  return `{\n${lines.join("\n")}\n${closing}}`;
}

function quoteKey(k: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
}

// Class emission

interface PropInfo {
  key: string;
  type: string;
  hasDefault: boolean;
  defaultLiteral?: string;
  hasConst: boolean;
  constLiteral?: string;
  required: boolean;
}

/** If `sub` is a `$ref` to a (string-first) enum, its TS enum name. */
function enumRefName(sub: JsonSchema, ctx: RenderCtx): string | undefined {
  if (!sub.$ref) return undefined;
  return ctx.enums.get(sub.$ref.replace(/^.*\//, ""))?.name;
}

function classifyProperties(schema: JsonSchema, ctx: RenderCtx): PropInfo[] {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  return Object.entries(props).map(([key, sub]) => {
    // An enum default is the string value, which is also the member name;
    // emit it as the enum member so it types as the enum, not a raw string.
    const enumName = enumRefName(sub, ctx);
    const defaultLiteral =
      sub.default === undefined
        ? undefined
        : enumName
          ? `${enumName}.${sub.default as string}`
          : JSON.stringify(sub.default);
    return {
      key,
      type: renderType(sub, 1, ctx),
      hasDefault: sub.default !== undefined,
      defaultLiteral,
      hasConst: sub.const !== undefined,
      constLiteral: sub.const !== undefined ? JSON.stringify(sub.const) : undefined,
      required: required.has(key),
    };
  });
}

/**
 * Two interfaces per packet. `<Name>` is the decoded shape: every visible
 * field plus the `$header` literal, so it `extends Packet` and the decoded
 * union is discriminable (`switch (p.$header)`). `<Name>Init` is the send
 * shape (default-bearing or non-required fields optional), with `$header`
 * omitted (the framing layer adds it). Other const padding (PV's `_cid`)
 * appears on neither. Packets are plain data; no class, no constructor.
 */
function emitPacketTypes(name: string, schema: JsonSchema, ctx: RenderCtx): string {
  const props = classifyProperties(schema, ctx);
  // Decoded keeps `$header` (the discriminant); drops other const padding.
  const decoded = props
    .filter((p) => !p.hasConst || p.key === "$header")
    .map((p) => `  ${quoteKey(p.key)}: ${p.type};`);
  // Init drops all const fields (including `$header`).
  const init = props
    .filter((p) => !p.hasConst)
    .map((p) => {
      const optional = p.hasDefault || !p.required;
      return `  ${quoteKey(p.key)}${optional ? "?" : ""}: ${p.type};`;
    });

  return (
    `export interface ${name} extends Packet {\n${decoded.join("\n")}\n}\n\n` +
    `export interface ${name}Init {\n${init.join("\n")}\n}\n`
  );
}

// Enum file emission

function emitTypesFile(types: Map<string, TypeDef>): string {
  const parts: string[] = [
    "// AUTO-GENERATED from aolib-meta/types/* (object types). Do not edit; run `bun run codegen`.\n",
  ];
  const sorted = [...types.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const t of sorted) {
    if (t.description) parts.push(`/** ${t.description} */`);
    // Render as `interface Name { ... }`. Use a minimal ctx; nested
    // refs to other types/enums round-trip through the same lookup.
    const body = renderObjectType(t.schema, 0, {
      enums: new Map(),
      types,
      enumImports: new Set(),
      typeImports: new Set(),
    });
    parts.push(`export interface ${t.name} ${body}\n`);
  }
  return parts.join("\n");
}

function emitEnumsFile(enums: Map<string, EnumDef>): string {
  const parts: string[] = [
    "// AUTO-GENERATED from aolib-meta/types/* (enums). Do not edit; run `bun run codegen`.\n",
  ];
  // Sort by name for deterministic output.
  const sorted = [...enums.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const e of sorted) {
    if (e.description) parts.push(`/** ${e.description} */`);
    // String-first enums as a union type plus a value object sharing the
    // name, so `x: Side` and `Side.wit` both work and a bare `"wit"` is
    // assignable. Legacy integer wire encoding lives in the schema's
    // `x-wire-ints` and is applied by the fanta walker, not here.
    parts.push(
      `export type ${e.name} = ${e.values.map((v) => JSON.stringify(v)).join(" | ")};`,
    );
    parts.push(`export const ${e.name} = {`);
    for (const v of e.values) parts.push(`  ${String(v)}: ${JSON.stringify(v)},`);
    parts.push("} as const;\n");
  }
  return parts.join("\n");
}

// Direction maps

function emitDirectionMaps(packets: PacketMeta[]): string {
  // x-receiver names the *receiver*; c2s = packets the server receives.
  const c2s = packets.filter((p) => p.receiver === "server");
  const s2c = packets.filter((p) => p.receiver === "client");

  const schemaLine = (p: PacketMeta) => `  ${quoteKey(p.header)}: ${p.name}Schema,`;
  const inputLine  = (p: PacketMeta) => `  ${quoteKey(p.header)}: ${p.name}Init;`;
  const outputLine = (p: PacketMeta) => `  ${quoteKey(p.header)}: ${p.name};`;

  return `
export const c2sSchemas = {
${c2s.map(schemaLine).join("\n")}
} as const;

export const s2cSchemas = {
${s2c.map(schemaLine).join("\n")}
} as const;

export type C2SInputs = {
${c2s.map(inputLine).join("\n")}
};

export type S2CInputs = {
${s2c.map(inputLine).join("\n")}
};

export type C2SOutputs = {
${c2s.map(outputLine).join("\n")}
};

export type S2COutputs = {
${s2c.map(outputLine).join("\n")}
};

/** Discriminated union of decoded packets, narrow on \`$header\`. */
export type AnyC2S = C2SOutputs[keyof C2SOutputs];
export type AnyS2C = S2COutputs[keyof S2COutputs];
export type AnyPacket = AnyC2S | AnyS2C;
`;
}

// Main

function main(): void {
  const { enums, types } = loadTypesAndEnums();
  const packets = [...listPacketNames()].sort();
  const meta = loadPacketMeta().sort((a, b) => a.header.localeCompare(b.header));

  // Enums + types files are straightforward, no per-packet context.
  writeFileSync(OUT_ENUMS, emitEnumsFile(enums));
  writeFileSync(OUT_TYPES, emitTypesFile(types));

  // Packets file, render with a shared context so enum + type
  // imports accumulate as we walk each packet.
  const ctx: RenderCtx = {
    enums,
    types,
    enumImports: new Set(),
    typeImports: new Set(),
  };
  const packetBlocks: string[] = [];
  for (const name of packets) {
    const schema = loadJson(join(PACKETS_DIR, `${name}.schema.json`));
    packetBlocks.push(emitPacketTypes(name, schema, ctx));
  }

  const enumImports = ctx.enumImports.size === 0
    ? ""
    : `import { ${[...ctx.enumImports].sort().join(", ")} } from "./enums";\n`;
  const typeImports = ctx.typeImports.size === 0
    ? ""
    : `import { ${[...ctx.typeImports].sort().join(", ")} } from "./types";\n`;

  const parts: string[] = [
    "// AUTO-GENERATED from aolib-meta/. Do not edit; run `bun run codegen`.\n",
    "/* eslint-disable */\n",
    enumImports + typeImports,
  ];

  // Enum + type schemas, imported as runtime values so validate.ts
  // can register them with Ajv for $ref resolution. Both live in types/.
  const enumNames = [...enums.values()].map((e) => e.name).sort();
  const typeNames = [...types.values()].map((t) => t.name).sort();
  for (const name of enumNames) {
    parts.push(`import ${name}EnumSchema from "../aolib-meta/types/${name}.schema.json";\n`);
  }
  for (const name of typeNames) {
    parts.push(`import ${name}TypeSchema from "../aolib-meta/types/${name}.schema.json";\n`);
  }
  parts.push("");

  for (const name of packets) {
    parts.push(`import ${name}Schema from "../aolib-meta/packets/schemas/${name}.schema.json";\n`);
  }
  parts.push("");

  for (const name of packets) {
    parts.push(`export { default as ${name}Schema } from "../aolib-meta/packets/schemas/${name}.schema.json";\n`);
  }
  parts.push("");

  parts.push(
    `export const enumSchemas = [${enumNames.map((n) => `${n}EnumSchema`).join(", ")}];\n`,
  );
  parts.push(
    `export const typeSchemas = [${typeNames.map((n) => `${n}TypeSchema`).join(", ")}];\n`,
  );
  parts.push("");

  // Shared base: every decoded packet carries its wire header as a literal
  // discriminant, so `AnyPacket` narrows on `$header`.
  parts.push("export interface Packet {\n  $header: string;\n}\n");

  for (const block of packetBlocks) {
    parts.push(block);
    parts.push("");
  }

  parts.push(emitDirectionMaps(meta));

  writeFileSync(OUT_PACKETS, parts.join("\n"));
  console.log(
    `Wrote ${OUT_ENUMS} (${enums.size} enums), ` +
      `${OUT_PACKETS} (${packets.length} packets)`,
  );
}

main();
