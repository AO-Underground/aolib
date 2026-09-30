/**
 * Runtime types for the JSON-Schema-driven walker and validator.
 *
 * The packet schemas themselves are generated from `aolib-meta/` into
 * `../generated/packets.ts`, alongside the typed interfaces. This file
 * just declares the loose structural shapes the walker reads.
 */

/**
 * The subset of JSON Schema keywords the fanta walker understands,
 * plus the project's `x-fanta-*` extensions. Permissive on purpose,
 * Ajv is the validator.
 */
export interface JsonSchema {
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
  $id?: string;
  $ref?: string;

  // Extension keywords.
  /**
   * On nested objects: decode-only. Tolerate the legacy `<and>` escape
   * form (replace `<and>` → `&` before splitting on `&`). Encoders
   * never emit `<and>`.
   */
  "x-fanta-unescape-amp"?: boolean;
  /** On a packet root: replace the whole walker with a registered codec. */
  "x-fanta-codec"?: string;
  /** Direction metadata, used by the registry; not read at runtime. */
  "x-fanta-direction"?: "c2s" | "s2c" | "both";

  [key: string]: unknown;
}

/**
 * Bypass codec for packets whose wire shape can't be expressed by the
 * generic walker (e.g. ARUP, whose array element type depends on a
 * sibling field's value). Registered via `registerCodec(name, codec)`
 * in `./fanta`.
 */
export interface FantaCodec {
  encode(packet: Record<string, unknown>): string[];
  decode(args: string[]): Record<string, unknown>;
}
