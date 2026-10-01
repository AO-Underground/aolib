/**
 * Custom packets: headers the spec doesn't define (spec/README.md, "Custom
 * packets"). With a schema they get the spec packets' JSON, FantaCode and
 * validation; without one they are JSON-only, the payload's own fields after
 * `$header`. `fanta` and `json` override either form.
 */

import { decode } from "./decode";
import { encode, type WireMode } from "./encode";
import { c2sSchemas, s2cSchemas } from "../generated/packets";
import { compileSchema, validate } from "./validate";
import type { JsonSchema } from "./types";

export interface FantaForm {
  /** The FantaCode fields between the header and `%`. */
  encode(packet: Record<string, unknown>): string[];
  decode(args: string[]): Record<string, unknown>;
}

export interface JsonForm {
  /** A JSON object; the library puts `$header` first. */
  encode(packet: Record<string, unknown>): string;
  decode(raw: string): Record<string, unknown>;
}

export interface PacketOptions {
  /** A schema in the spec's packet format; it may `$ref` the shared types. */
  schema?: JsonSchema;
  fanta?: FantaForm;
  json?: JsonForm;
}

interface CustomPacket extends PacketOptions {
  header: string;
}


const customPackets = new Map<string, CustomPacket>();

/** Register a header the spec doesn't define. Throws for a spec header. */
export function registerPacket(header: string, options: PacketOptions = {}): void {
  if (header in c2sSchemas || header in s2cSchemas) {
    throw new Error(`aolib: '${header}' is a spec packet; add fields to it with $extras`);
  }
  let schema = options.schema;
  if (schema) {
    const declared = schema.properties?.$header?.const;
    if (declared !== undefined && declared !== header) {
      throw new Error(`aolib: schema for '${header}' declares $header ${JSON.stringify(declared)}`);
    }
    schema = {
      $id: `/packets/schemas/${header}.schema.json`,
      title: header,
      ...schema,
      properties: { $header: { type: "string", const: header }, ...(schema.properties ?? {}) },
    };
    compileSchema(schema);
  }
  customPackets.set(header, { ...options, header, schema });
}

/** Encode a registered custom packet; throws if it has no form for `mode`. */
export function encodeCustom(packet: Record<string, unknown>, mode: WireMode): string {
  const header = String(packet.$header);
  const c = customPackets.get(header);
  if (!c) throw new Error(`aolib: '${header}' is not registered; call registerPacket first`);
  const { $header: _, ...fields } = packet;
  const form = mode === "json" ? c.json : c.fanta;
  if (!form) {
    if (c.schema) return encode(c.schema, fields, mode);
    if (mode === "fanta") {
      throw new Error(`aolib: '${header}' is JSON-only and this session is in FantaCode mode`);
    }
    const { $extras, ...own } = fields;
    return JSON.stringify({ $header: header, ...own, ...($extras as Record<string, unknown> | undefined) });
  }

  if (c.schema) validate(c.schema, { $header: header, ...fields });
  if (c.json && mode === "json") {
    const { $header: _h, ...rest } = JSON.parse(c.json.encode(fields)) as Record<string, unknown>;
    return JSON.stringify({ $header: header, ...rest });
  }
  const args = (form as FantaForm).encode(fields);
  return args.length === 0 ? `${header}#%` : `${header}#${args.join("#")}#%`;
}

/**
 * Decode a frame for a registered custom packet; undefined when the header
 * isn't registered or has no form for the frame's format.
 */
export function decodeCustom(header: string, wire: string): Record<string, unknown> | undefined {
  const c = customPackets.get(header);
  if (!c) return undefined;
  const json = wire.startsWith("{");
  let packet: Record<string, unknown>;
  if (json && c.json) {
    packet = { ...c.json.decode(wire), $header: header };
  } else if (!json && c.fanta) {
    const rest = wire.replace(/#?%$/, "").slice(header.length + 1);
    packet = { ...c.fanta.decode(rest === "" ? [] : rest.split("#")), $header: header };
  } else if (c.schema) {
    return decode(c.schema, wire);
  } else if (json) {
    return JSON.parse(wire) as Record<string, unknown>;
  } else {
    return undefined;
  }
  if (c.schema) validate(c.schema, packet);
  return packet;
}
