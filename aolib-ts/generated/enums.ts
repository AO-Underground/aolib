// AUTO-GENERATED from spec/types/* (enums). Do not edit; run `bun run codegen`.

/** Discriminator for ARUP payloads: 0 = player counts (numbers), 1/2/3 = area metadata strings. */
export type AreaUpdateType = "player_count" | "status" | "case_manager" | "locked";
export const AreaUpdateType = {
  player_count: "player_count",
  status: "status",
  case_manager: "case_manager",
  locked: "locked",
} as const;

/** Moderator authentication state (AUTH packet). */
export type AuthState = "logout" | "failed" | "success";
export const AuthState = {
  logout: "logout",
  failed: "failed",
  success: "success",
} as const;

/** Per-character availability in a CharsCheck list. */
export type CharAvailability = "free" | "taken";
export const CharAvailability = {
  free: "free",
  taken: "taken",
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

/** Judge-control visibility carried by the JD packet. */
export type JudgeState = "by_position" | "hidden" | "shown";
export const JudgeState = {
  by_position: "by_position",
  hidden: "hidden",
  shown: "shown",
} as const;

/** Which penalty (health) bar an HP packet updates. */
export type PenaltyBar = "defense" | "prosecution";
export const PenaltyBar = {
  defense: "defense",
  prosecution: "prosecution",
} as const;

/** PU packet field selector: which playerlist datum the packet updates. */
export type PlayerDataType = "ooc_name" | "char_name" | "showname" | "area_id";
export const PlayerDataType = {
  ooc_name: "ooc_name",
  char_name: "char_name",
  showname: "showname",
  area_id: "area_id",
} as const;

/** PR packet update type: add or remove a player from the playerlist. */
export type PlayerListUpdate = "add" | "remove";
export const PlayerListUpdate = {
  add: "add",
  remove: "remove",
} as const;

/** Judge-control overlay animation played by RT. */
export type RTAnimation = "witness_testimony" | "cross_examination" | "not_guilty" | "guilty" | "end_animation" | "custom";
export const RTAnimation = {
  witness_testimony: "witness_testimony",
  cross_examination: "cross_examination",
  not_guilty: "not_guilty",
  guilty: "guilty",
  end_animation: "end_animation",
  custom: "custom",
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

/** TI packet command: how to manipulate a timer. */
export type TimerCommand = "start" | "pause" | "show" | "hide";
export const TimerCommand = {
  start: "start",
  pause: "pause",
  show: "show",
  hide: "hide",
} as const;
