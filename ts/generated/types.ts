// AUTO-GENERATED from spec/types/* (object types). Do not edit; run `bun run codegen`.

/** MS screen-effect overlay request: effect name, misc folder, and sound, packed into one `name|folder|sound` wire slot. An all-empty value means no effect and encodes as `||`, as AO2 sends it; an empty slot from older senders decodes to it. */
export interface Effect {
  name: string;
  folder: string;
  sound: string;
}

/** Transition effects for an MC track change. */
export interface MusicEffects {
  fade_in: boolean;
  fade_out: boolean;
  sync_position: boolean;
}

/** Integer (x, y) screen-coordinate pair carried in MS offset / paired_offset slots. */
export interface Offset {
  x: number;
  y: number;
}
