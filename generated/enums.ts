// AUTO-GENERATED from aolib-meta/types/* (enums). Do not edit; run `bun run codegen`.

/** Discriminator for ARUP payloads: 0 = player counts (numbers), 1/2/3 = area metadata strings. */
export type AreaUpdateType = "player_count" | "status" | "case_manager" | "locked";
export const AreaUpdateType = {
  player_count: "player_count",
  status: "status",
  case_manager: "case_manager",
  locked: "locked",
} as const;

/** Desk visibility behavior. */
export type DeskModifier = "hidden" | "shown" | "hide_during_preanim" | "show_during_preanim" | "hide_and_center_during_preanim" | "show_during_preanim_then_center";
export const DeskModifier = {
  hidden: "hidden",
  shown: "shown",
  hide_during_preanim: "hide_during_preanim",
  show_during_preanim: "show_during_preanim",
  hide_and_center_during_preanim: "hide_and_center_during_preanim",
  show_during_preanim_then_center: "show_during_preanim_then_center",
} as const;

/** Emote behavior selector. Spec values 3 and 4 are documented as unused. */
export type EmoteModifier = "no_preanim" | "preanim" | "preanim_and_objection" | "unused_3" | "unused_4" | "zoom" | "objection_zoom";
export const EmoteModifier = {
  no_preanim: "no_preanim",
  preanim: "preanim",
  preanim_and_objection: "preanim_and_objection",
  unused_3: "unused_3",
  unused_4: "unused_4",
  zoom: "zoom",
  objection_zoom: "objection_zoom",
} as const;

/** Sprite mirroring. */
export type Flip = "none" | "horizontal" | "vertical" | "horizontal_and_vertical";
export const Flip = {
  none: "none",
  horizontal: "horizontal",
  vertical: "vertical",
  horizontal_and_vertical: "horizontal_and_vertical",
} as const;

/** Shout / objection selector. */
export type ShoutModifier = "none" | "hold_it" | "objection" | "take_that" | "custom";
export const ShoutModifier = {
  none: "none",
  hold_it: "hold_it",
  objection: "objection",
  take_that: "take_that",
  custom: "custom",
} as const;

/** Character position. Wire values are the lowercase 3-letter codes. */
export type Side = "def" | "pro" | "hld" | "hlp" | "wit" | "jud" | "jur" | "sea";
export const Side = {
  def: "def",
  pro: "pro",
  hld: "hld",
  hlp: "hlp",
  wit: "wit",
  jud: "jud",
  jur: "jur",
  sea: "sea",
} as const;

/** Chat message text color. `blue` also disables the talking animation. */
export type TextColor = "white" | "green" | "red" | "orange" | "blue" | "yellow" | "pink" | "cyan" | "grey" | "rainbow";
export const TextColor = {
  white: "white",
  green: "green",
  red: "red",
  orange: "orange",
  blue: "blue",
  yellow: "yellow",
  pink: "pink",
  cyan: "cyan",
  grey: "grey",
  rainbow: "rainbow",
} as const;
