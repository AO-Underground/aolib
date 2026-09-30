// AUTO-GENERATED from aolib-meta/types/* (enums). Do not edit; run `bun run codegen`.

/** Discriminator for ARUP payloads: 0 = player counts (numbers), 1/2/3 = area metadata strings. */
export enum AreaUpdateType {
  player_count = "player_count",
  status = "status",
  case_manager = "case_manager",
  locked = "locked",
}

/** Desk visibility behavior. */
export enum DeskModifier {
  hidden = "hidden",
  shown = "shown",
  hide_during_preanim = "hide_during_preanim",
  show_during_preanim = "show_during_preanim",
  hide_and_center_during_preanim = "hide_and_center_during_preanim",
  show_during_preanim_then_center = "show_during_preanim_then_center",
}

/** Emote behavior selector. Spec values 3 and 4 are documented as unused. */
export enum EmoteModifier {
  no_preanim = "no_preanim",
  preanim = "preanim",
  preanim_and_objection = "preanim_and_objection",
  unused_3 = "unused_3",
  unused_4 = "unused_4",
  zoom = "zoom",
  objection_zoom = "objection_zoom",
}

/** Sprite mirroring. */
export enum Flip {
  none = "none",
  horizontal = "horizontal",
  vertical = "vertical",
  horizontal_and_vertical = "horizontal_and_vertical",
}

/** Shout / objection selector. */
export enum ShoutModifier {
  none = "none",
  hold_it = "hold_it",
  objection = "objection",
  take_that = "take_that",
  custom = "custom",
}

/** Character position. Wire values are the lowercase 3-letter codes. */
export enum Side {
  def = "def",
  pro = "pro",
  hld = "hld",
  hlp = "hlp",
  wit = "wit",
  jud = "jud",
  jur = "jur",
  sea = "sea",
}

/** Chat message text color. `blue` also disables the talking animation. */
export enum TextColor {
  white = "white",
  green = "green",
  red = "red",
  orange = "orange",
  blue = "blue",
  yellow = "yellow",
  pink = "pink",
  cyan = "cyan",
  grey = "grey",
  rainbow = "rainbow",
}
