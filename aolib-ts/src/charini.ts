/**
 * char.ini parser.
 *
 * char.ini is the per-character asset manifest every AO client reads:
 * `[options]` metadata plus a bank of emotes with their animations and
 * sounds. It is INI-shaped but with one AO-specific quirk that rules
 * out most INI libraries: emote values are `#`-delimited records
 * (`normal#-#idle#1`), and the common `ini` package treats an unescaped
 * `#` as an inline comment, truncating every emote to its first field.
 *
 * So the base parse uses `js-ini` with `#` left out of the comment set,
 * then a tuning pass folds the flat sections into a typed `CharIni`.
 *
 * Two emote encodings are normalized to one `CharEmote[]` (per the spec
 * in spec `schemas/assets`):
 *
 *   - `[emote <name>]` blocks (preferred): each `[emote <blockname>]`
 *     section carries `anim` / `preanim` / `postanim` / `camera` / `sound` /
 *     `modifier` / `deskmod` fields. Every block is an emote, in file order;
 *     any block present invalidates `[emotions]` entirely (it is not read).
 *     In blocks `modifier`/`deskmod` must be a named enum identifier
 *     (e.g. `zoom`), never a bare number.
 *   - Legacy banks (fallback, used when no `[emote ...]` block exists):
 *     `[emotions] N = desc#preanim#anim#modifier#deskmod`, zipped with
 *     `[soundn]` and `[soundt]` by id.
 *
 * The normalized `key` is the block name (blocks) or the stringified id
 * (legacy); it is the identity the animation files key off. Section and key
 * *names* are lowercased for lookup; values are preserved verbatim, so
 * lowercase at the point of use if you build case-insensitive asset URLs.
 */

import { parse as parseIni } from "js-ini";
import EmoteModifierSchema from "../../spec/types/EmoteModifier.schema.json";
import DeskModifierSchema from "../../spec/types/DeskModifier.schema.json";

// One AO tick in milliseconds: the message text update interval that
// drives sound/preanim timing (LemmyAO's `UPDATE_INTERVAL`). Legacy
// `[soundt]` is expressed in ticks; `sounddelayms` is normalized to ms.
const TICK_MS = 60;

/**
 * Case-insensitive enum-name -> legacy integer map, so a char.ini field
 * can write `modifier = zoom` (or `deskmod = shown`) and resolve to the
 * numeric emote/desk modifier. The enums are string-first with their
 * integers in `x-wire-ints` (see spec); char.ini keeps the number.
 */
function nameMap(schema: { enum: string[]; "x-wire-ints": number[] }): Record<string, number> {
  const m: Record<string, number> = {};
  schema.enum.forEach((name, i) => {
    m[name] = schema["x-wire-ints"][i] ?? 0;
  });
  return m;
}
const MODIFIER_NAMES = nameMap(EmoteModifierSchema);
const DESKMOD_NAMES = nameMap(DeskModifierSchema);

/**
 * One normalized emote, from a block or a legacy bank row. Emotes are a sorted
 * list (button order), so position is the array index, there is no id. Only
 * `key` and `anim` come from the file without a default.
 */
export interface CharEmote {
  /** Stable identity: block name, or the stringified id for legacy. */
  key: string;
  /** Display label shown on the emote button. */
  name: string;
  /** Animation: a legacy stem, or (in `[emote]` blocks) the full
   * filename with extension. */
  anim: string;
  /** Pre-animation (same form as `anim`), or null when none (`-`). */
  preanim: string | null;
  /** Exit animation played when leaving this emote, before the next
   * emote's preanim (block format only; null otherwise). */
  postanim: string | null;
  /** Camera-motion file (a VMD carrying a camera track) that frames this
   * emote, or null when it uses the default camera (block format only). */
  camera: string | null;
  /** AO emote modifier (0 = none, 1 = play preanim, 5/6 = zoom). Default 0. */
  modifier: number;
  /** Desk modifier. Default 1 (shown) when the file omits it. */
  deskmod: number;
  /** Sound effect: a legacy stem, or (in `[emote]` blocks) the full
   * filename with extension; null when none. */
  sound: string | null;
  /** Sound delay in milliseconds. Default 0 when the file omits it. */
  sounddelayms: number;
}

/** `[options]` block. Common keys are typed; the rest stay on the index. */
export interface CharIniOptions {
  name: string;
  showname: string;
  /** Court position; defaults to `wit` (witness) when absent. */
  side: string;
  /** Blip (typing sound) set; defaults to `male` when absent. Falls back
   * to the obsolete `gender` key when the file has no `blips`. */
  blips: string;
  /** Chat/blip category; null when the file has no `chat` key. */
  chat: string | null;
  /** Emote/preanim category; null when the file has no `category` key. */
  category: string | null;
  /** PMX model file for a 3D character; empty for 2D. */
  model: string;
  [key: string]: string | null;
}

export interface CharIni {
  options: CharIniOptions;
  emotes: CharEmote[];
  /** Every section, lowercased names, values verbatim. Fallback for
   * blocks this parser does not model (shouts, [Time], frame effects). */
  sections: Record<string, Record<string, string>>;
}

function toInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

/** `-`, empty, or absent means "no pre-animation"; else the base name. */
function normPreanim(value: string | undefined): string | null {
  return value === undefined || value === "" || value === "-" ? null : value;
}

/** Legacy positional enum field: a bare number or a named identifier. */
function parseEnum(
  value: string | undefined,
  names: Record<string, number>,
): number {
  if (value === undefined || value === "") return 0;
  return names[value] ?? toInt(value, 0);
}

/**
 * Block enum field: require the named identifier, no bare magic numbers.
 * Absent/empty returns undefined (caller applies the default); a present
 * value must be a known enum name, else it throws.
 */
function requireEnumName(
  value: string | undefined,
  names: Record<string, number>,
  field: string,
  key: string,
): number | undefined {
  if (value === undefined || value === "") return undefined;
  const named = names[value];
  if (named === undefined) {
    throw new Error(
      `char.ini emote "${key}": ${field} "${value}" must be one of: ${Object.keys(names).join(", ")}`,
    );
  }
  return named;
}

/** Empty or absent sound means "no sound"; `0` is kept verbatim. */
function normSound(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

/**
 * Enforce the block-format rule that file references carry an extension.
 * Legacy stems are exempt; only `[emote <name>]` blocks call this.
 */
function requireExtension(value: string, field: string, key: string): void {
  if (!/\.[^.\s]+$/.test(value)) {
    throw new Error(
      `char.ini emote "${key}": ${field} "${value}" must include a file extension`,
    );
  }
}

/**
 * Parse char.ini text into a typed {@link CharIni}.
 *
 * Requires an `[options]` section with a non-empty `name`; throws
 * otherwise. Other `[options]` keys default so the shape is stable.
 *
 * Also throws when a `[emote <name>]` block references an animation or
 * sound without a file extension, or gives `modifier`/`deskmod` as a
 * bare number (the block format requires real filenames and named
 * enums). The legacy stem encoding is otherwise read leniently.
 */
export function parseCharIni(data: string): CharIni {
  // `;` is the canonical INI comment; `//` shows up in real char.ini
  // files where authors disable a line. js-ini only strips line-leading
  // comments, so neither can corrupt the `#`-delimited emote values.
  //
  // `nothrow` skips lines that are neither section, comment, nor
  // key=value instead of throwing. Real char.ini files are littered with
  // stray author notes ("made by ...") and `#`-led header lines, and a
  // parser for them must degrade rather than crash.
  const raw = parseIni(data, {
    comment: [";", "//"],
    autoTyping: false,
    nothrow: true,
  });

  // Fold to lowercase section/key names with string values. `js-ini`
  // types values as a union (string | number | boolean | object); with
  // autoTyping off char.ini yields only scalars, so keep those and drop
  // anything structural.
  const sections: Record<string, Record<string, string>> = {};
  const blockOrder: string[] = [];
  for (const [section, body] of Object.entries(raw)) {
    if (typeof body !== "object" || Array.isArray(body)) continue;
    const lower: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "object") continue;
      lower[key.toLowerCase()] = String(value);
    }
    const name = section.toLowerCase();
    sections[name] = lower;
    // Record `[emote <name>]` block names in file order; blocks are the
    // emote list when any exists (see readBlockEmotes).
    if (name.startsWith("emote ")) blockOrder.push(section.slice(6));
  }

  // `[options]` and a non-empty `name` are mandatory: a char.ini without
  // them is malformed (a nameless or option-less character).
  const opt = sections.options;
  if (!opt) {
    throw new Error("char.ini: missing required [options] section");
  }
  if (!opt.name) {
    throw new Error("char.ini: [options] is missing the required `name` key");
  }
  const options: CharIniOptions = {
    name: "",
    showname: "",
    side: "wit",
    model: "",
    ...opt,
    // `blips` falls back to the obsolete `gender` key, then to `male`.
    blips: opt.blips ?? opt.gender ?? "male",
    // Absent `chat`/`category` are "unset" (null), distinct from an
    // explicit empty `chat =` / `category =`.
    chat: opt.chat ?? null,
    category: opt.category ?? null,
  };

  const emotionSection = sections.emotions ?? {};
  const count = toInt(emotionSection.number, 0);

  // Any `[emote <name>]` block switches to the block encoding and
  // invalidates `[emotions]` entirely; otherwise read the legacy banks.
  const emotes =
    blockOrder.length > 0
      ? readBlockEmotes(sections, blockOrder)
      : readLegacyEmotes(emotionSection, sections, count);

  return { options, emotes, sections };
}

/**
 * `[emote <name>]` encoding: every `[emote <blockname>]` section is an emote,
 * in the order the blocks appear in the file. The presence of any block
 * invalidates `[emotions]` completely, it is never consulted here, so it
 * cannot select, reorder, or exclude blocks.
 */
function readBlockEmotes(
  sections: Record<string, Record<string, string>>,
  blockOrder: string[],
): CharEmote[] {
  const emotes: CharEmote[] = [];
  for (const key of blockOrder) {
    const block = sections[`emote ${key.toLowerCase()}`] ?? {};

    // The block format requires real filenames, reject bare stems.
    const anim = block.anim ?? "";
    requireExtension(anim, "anim", key);
    const preanim = normPreanim(block.preanim);
    if (preanim !== null) requireExtension(preanim, "preanim", key);
    const postanim = normPreanim(block.postanim);
    if (postanim !== null) requireExtension(postanim, "postanim", key);
    const camera = normPreanim(block.camera);
    if (camera !== null) requireExtension(camera, "camera", key);
    const sound = normSound(block.sound);
    if (sound !== null) requireExtension(sound, "sound", key);

    emotes.push({
      key,
      name: block.name ?? key,
      anim,
      preanim,
      postanim,
      camera,
      // Blocks require named enum identifiers, no bare magic numbers.
      modifier: requireEnumName(block.modifier, MODIFIER_NAMES, "modifier", key) ?? 0,
      deskmod: requireEnumName(block.deskmod, DESKMOD_NAMES, "deskmod", key) ?? 1,
      sound,
      sounddelayms:
        block.sounddelayms !== undefined ? toInt(block.sounddelayms, 0) : 0,
    });
  }
  return emotes;
}

/** Legacy encoding: `desc#preanim#anim#modifier#deskmod` + [soundn]/[soundt]. */
function readLegacyEmotes(
  emotionSection: Record<string, string>,
  sections: Record<string, Record<string, string>>,
  count: number,
): CharEmote[] {
  const soundN = sections.soundn ?? {};
  const soundT = sections.soundt ?? {};

  const emotes: CharEmote[] = [];
  for (let id = 1; id <= count; id++) {
    const def = emotionSection[String(id)];
    if (def === undefined) continue;

    const parts = def.split("#");
    const delay = soundT[String(id)];
    emotes.push({
      key: String(id),
      name: parts[0] ?? "",
      anim: parts[2] ?? "",
      preanim: normPreanim(parts[1]),
      postanim: null,
      camera: null,
      modifier: parseEnum(parts[3], MODIFIER_NAMES),
      deskmod: parts.length > 4 ? parseEnum(parts[4], DESKMOD_NAMES) : 1,
      sound: normSound(soundN[String(id)]),
      // [soundt] is in ticks; normalize to milliseconds.
      sounddelayms: delay !== undefined ? toInt(delay, 0) * TICK_MS : 0,
    });
  }
  return emotes;
}
