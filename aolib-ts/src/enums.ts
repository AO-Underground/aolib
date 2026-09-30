/**
 * Re-exports of codegenned enums + shared types, plus a couple of
 * non-schema helpers.
 *
 * The named enums (Side, DeskModifier, etc.) and shared object types
 * (Offset, etc.) come from spec/types/* via `../generated/enums`
 * and `../generated/types`.
 */

import { Side } from "../generated/enums";

export {
  AreaUpdateType,
  DeskModifier,
  EmoteModifier,
  Flip,
  ShoutModifier,
  Side,
  TextColor,
} from "../generated/enums";

export type { Offset } from "../generated/types";

/** ARUP payload: numbers for PLAYER_COUNT, strings for everything else. */
export type AreaUpdateData = number[] | string[];

/**
 * Convenience predicate, true for sides whose layout uses the
 * full-view pan-camera. The viewport layer consults this when
 * choosing between single-character and paired-character rendering.
 */
export const isFullView = (s: Side): boolean =>
  s === Side.def || s === Side.pro || s === Side.wit;
