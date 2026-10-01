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
import { DeskModifierEnumSchema as DeskModifierSchema, EmoteModifierEnumSchema as EmoteModifierSchema } from "../generated/schemas";
import type { DeskModifier, EmoteModifier } from "../generated/enums";

// [soundt] and MS sfx_delay are in ticks of this many ms.
const TICK_MS = 40;

/** Milliseconds to ticks (e.g. for MS `sfx_delay`), rounding half up. */
export function msToTicks(ms: number): number {
  return Math.floor(ms / TICK_MS + 0.5);
}

export function ticksToMs(ticks: number): number {
  return ticks * TICK_MS;
}

function soundDelayFromMs(ms: number) {
  return { sounddelayms: ms, sounddelayticks: msToTicks(ms) };
}

function soundDelayFromTicks(ticks: number) {
  return { sounddelayms: ticksToMs(ticks), sounddelayticks: ticks };
}

interface WireEnum {
  enum: string[];
  "x-wire-ints": number[];
}

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
  /** Emote modifier. Default `no_preanim`. */
  modifier: EmoteModifier;
  /** Desk modifier. Default `shown`. */
  deskmod: DeskModifier;
  /** Sound effect: a legacy stem, or (in `[emote]` blocks) the full
   * filename with extension; null when none. */
  sound: string | null;
  /** Sound delay in milliseconds. Default 0 when the file omits it. */
  sounddelayms: number;
  /** Sound delay in 40 ms ticks, as MS `sfx_delay` carries it. */
  sounddelayticks: number;
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
  const v = value?.trim();
  return v !== undefined && /^[+-]?\d+$/.test(v) ? Number(v) : fallback;
}

/** `-`, empty, or absent means "no pre-animation"; else the base name. */
function normPreanim(value: string | undefined): string | null {
  return value === undefined || value === "" || value === "-" ? null : value;
}

/** Legacy row enum field: a lowercase name from `allowed`, or a wire integer; anything else is `fallback`. */
function parseEnum(value: string | undefined, allowed: readonly string[], schema: WireEnum, fallback: string): string {
  const v = value?.trim() ?? "";
  if (allowed.includes(v)) return v;
  const i = /^[+-]?\d+$/.test(v) ? schema["x-wire-ints"].indexOf(Number(v)) : -1;
  return i === -1 ? fallback : schema.enum[i] ?? fallback;
}

/**
 * Block enum field: require the named identifier, no bare magic numbers.
 * Absent/empty returns undefined (caller applies the default); a present
 * value must be a known enum name, else it throws.
 */
function requireEnumName(
  value: string | undefined,
  allowed: readonly string[],
  field: string,
  key: string,
): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (!allowed.includes(value)) {
    throw new Error(
      `char.ini emote "${key}": ${field} "${value}" must be one of: ${allowed.join(", ")}`,
    );
  }
  return value;
}

// The modifier names spec/assets/README.md allows, in blocks and legacy rows.
const BLOCK_MODIFIERS = EmoteModifierSchema.enum;

/** Deskmod of an emote that does not set one: hidden for the zoom modifiers, as AO2-Client does. */
function unsetDeskmod(modifier: EmoteModifier): DeskModifier {
  return modifier === "zoom" || modifier === "objection_zoom" ? "hidden" : "shown";
}

function normSound(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

/** Legacy [soundn] also uses `0`, `1` and `-` as "no sound". */
function normLegacySound(value: string | undefined): string | null {
  return value === "0" || value === "1" || value === "-" ? null : normSound(value);
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

/** Drop `;`/`//` comments at a line start or after whitespace (spec/assets/README.md). */
function stripComments(data: string): string {
  return data.replace(/(^|[ \t])(;|\/\/).*$/gm, "");
}

/**
 * Parse char.ini text into a typed {@link CharIni}.
 *
 * Requires an `[options]` section with a non-empty `name` and at least
 * one emote; throws otherwise. Other `[options]` keys default so the shape is stable.
 *
 * Also throws when a `[emote <name>]` block references an animation or
 * sound without a file extension, or gives `modifier`/`deskmod` as a
 * bare number (the block format requires real filenames and named
 * enums). The legacy stem encoding is otherwise read leniently.
 */
export function parseCharIni(data: string): CharIni {
  // Comments are stripped here: js-ini only knows line-leading ones. `nothrow`
  // skips stray lines (author notes, `#`-led headers) instead of throwing.
  const raw = parseIni(stripComments(data), {
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
  if (emotes.length === 0) {
    throw new Error("char.ini: no emotes; at least one [emote <name>] block or [emotions] row is required");
  }

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

    const modifier = (requireEnumName(block.modifier, BLOCK_MODIFIERS, "modifier", key) ?? "no_preanim") as EmoteModifier;
    emotes.push({
      key,
      name: block.name ?? key,
      anim,
      preanim,
      postanim,
      camera,
      modifier,
      deskmod: (requireEnumName(block.deskmod, DeskModifierSchema.enum, "deskmod", key) ?? unsetDeskmod(modifier)) as DeskModifier,
      sound,
      ...soundDelayFromMs(block.sounddelayms !== undefined ? toInt(block.sounddelayms, 0) : 0),
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
    const modifier = parseEnum(parts[3], BLOCK_MODIFIERS, EmoteModifierSchema, "no_preanim") as EmoteModifier;
    emotes.push({
      key: String(id),
      name: parts[0] ?? "",
      anim: parts[2] ?? "",
      preanim: normPreanim(parts[1]),
      postanim: null,
      camera: null,
      modifier,
      deskmod: (parts[4]?.trim() ? parseEnum(parts[4], DeskModifierSchema.enum, DeskModifierSchema, "shown") : unsetDeskmod(modifier)) as DeskModifier,
      sound: normLegacySound(soundN[String(id)]),
      ...soundDelayFromTicks(delay !== undefined ? toInt(delay, 0) : 0),
    });
  }
  return emotes;
}
