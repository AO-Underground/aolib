/**
 * Runtime types for the JSON-Schema-driven walker and validator.
 *
 * The packet schemas themselves are generated from `spec/` into
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
  /**
   * On a nested object: join/split its sub-tokens with this separator
   * instead of the default `&` (`|` for MS effect). An all-empty object
   * collapses to an empty slot on encode, and an empty slot decodes back
   * to it.
   */
  "x-fanta-separator"?: string;
  /** On a boolean-flag object: each property's bit, in property order; the slot is their OR. */
  "x-wire-bits"?: number[];
  /** On a packet root: replace the whole walker with a registered codec. */
  "x-fanta-codec"?: string;

  [key: string]: unknown;
}

/**
 * Bypass codec for packets whose wire shape can't be expressed by the
 * generic walker (e.g. ARUP, whose array element type depends on a
 * sibling field's value). Registered via `registerCodec(name, codec)`
 * in `./fanta`.
 */
export interface Codec {
  /** Encode the packet to FantaCode positional args (no header, no trailing %). */
  encodeFanta(packet: Record<string, unknown>): string[];
  /** Decode FantaCode positional args back to the packet object. */
  decodeFanta(args: string[]): Record<string, unknown>;
}
