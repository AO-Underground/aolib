/**
 * Public entry point for aolib.
 *
 * Layers, top-down:
 *   - session: `server(config)` / `client(config)`, the role-typed
 *     dispatch surface. Most callers only need these.
 *   - generated packet shapes and schema registries: the typed
 *     classes (e.g. `MCToServer`, `MSToClient`) for handler
 *     signatures, and `c2sSchemas` / `s2cSchemas` mapping headers
 *     to JSON Schema for the dispatcher.
 *   - encode / decode / validate / fanta: the wire-format primitives
 *     the session layer drives. Exposed for callers that bypass the
 *     session abstraction.
 */

// Session: the main public surface.

export {
  server,
  client,
  type SessionConfig,
  type ServerSession,
  type ClientSession,
} from "./session";

import { server, client } from "./session";

/** Convenience namespace so both `import { server, client }` and `import { aolib }` styles work. */
export const aolib = { server, client };

// Generated packet shapes + registries.

export {
  c2sSchemas,
  s2cSchemas,
  c2sClasses,
  s2cClasses,
  type C2SInputs,
  type S2CInputs,
  type C2SOutputs,
  type S2COutputs,
} from "../generated/packets";

// Packet classes, `aolib.MSToClient` is both the class (for
// `instanceof`) and the type (for handler signatures). Bidirectional
// packets are split into `<Header>ToServer` / `<Header>ToClient`.
export {
  ARUP, ASS, AUTH, BB, BD, BN, CC, CH, CHECK, CharsCheck, CI,
  DE, DONE, EE, EI, EM, FA, FL, FM, HI, JD,
  KB, KK, LE, MA, PE, PN, PR, PU, PV, RC, RD, RM, RMC,
  SC, SI, SM, SP, TI, VS_AUDIO, VS_CAPS, VS_FRAME, VS_PEERS,
  askchaa, decryptor,
  IDToServer, IDToClient,
  HPToServer, HPToClient,
  RTToServer, RTToClient,
  ZZToServer, ZZToClient,
  MCToServer, MCToClient,
  MSToServer, MSToClient,
  CTToServer, CTToClient,
  VS_JOINToServer, VS_JOINToClient,
  VS_LEAVEToServer, VS_LEAVEToClient,
  VS_SPEAKToServer, VS_SPEAKToClient,
} from "../generated/packets";

// Wire-format primitives.

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
export type { JsonSchema, FantaCodec } from "./types";

// Asset formats.

export {
  parseCharIni,
  type CharIni,
  type CharIniOptions,
  type CharEmote,
} from "./charini";
