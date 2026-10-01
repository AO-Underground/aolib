/**
 * Public entry point for aolib. Recommended import style is the namespace:
 *
 *   import * as aolib from "aolib-ts";
 *   const server = aolib.server(config);
 *   server.on.MS((p) => p.side === aolib.Side.def ...);
 *
 * This is the everyday surface: session factories, packet types, enums,
 * and the char.ini parser. Lower-level wire primitives (encode/decode,
 * codec registration, the raw dispatch registries) live under the
 * `aolib-ts/wire` subpath, reachable but out of the way.
 */

// Session: the main surface.

export {
  server,
  client,
  type SessionConfig,
  type ServerSession,
  type ClientSession,
} from "./session";

// Packet types, grouped under `aolib.packets` so the root namespace stays
// the common surface. `packets.<Header>ToServer` / `...ToClient` is the
// decoded shape; `...Init` is the send shape (default-bearing fields
// optional). You rarely name these directly: the session infers them
// (`server.on.MS((p) => ...)` gives `p: packets.MSToClient`).
export * as packets from "../generated/packets";

// Enums and shared types. Each enum is a string-literal union plus a value
// object of the same name, so `x: Side`, `Side.def`, and a bare `"def"`
// all work. Packet fields are typed as these.
export {
  AreaUpdateType,
  DeskModifier,
  EmoteModifier,
  Flip,
  ShoutModifier,
  Side,
  TextColor,
  isFullView,
  type AreaUpdateData,
  type Offset,
} from "./enums";

// Asset formats.

export {
  msToTicks,
  ticksToMs,
  parseCharIni,
  type CharIni,
  type CharIniOptions,
  type CharEmote,
} from "./charini";
