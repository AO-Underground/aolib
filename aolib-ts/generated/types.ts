// AUTO-GENERATED from spec/types/* (object types). Do not edit; run `bun run codegen`.

/** MS screen-effect overlay request: effect name, misc folder, and sound, packed into one `name|folder|sound` wire slot. An all-empty value is the no-effect sentinel and encodes to an empty slot. */
export interface Effect {
  name: string;
  folder: string;
  sound: string;
}

/** Integer (x, y) screen-coordinate pair carried in MS offset / paired_offset slots. */
export interface Offset {
  x: number;
  y: number;
}
