/**
 * Low-level wire access, for callers that bypass the session layer:
 * encode/decode frames directly, register a custom codec, or read the
 * header-keyed schema registries. Most consumers never need this.
 *
 *   import * as wire from "aolib-ts/wire";
 *   const frame = wire.encode(schema, packet, "fanta");
 */

export { encode, type WireMode } from "./encode";
export { decode, readHeader } from "./decode";
export { validate } from "./validate";
export {
  fromFantaArgs,
  toFantaArgs,
  escapeFanta,
  unescapeFanta,
  unescapeUnicode,
  registerCodec,
} from "./fanta";
export type { JsonSchema, Codec } from "./types";

// Header-keyed schema maps for the dispatcher, and the direction shape
// maps, for routing outside a session.
export {
  c2sSchemas,
  s2cSchemas,
  type C2SInputs,
  type S2CInputs,
  type C2SOutputs,
  type S2COutputs,
} from "../generated/packets";
