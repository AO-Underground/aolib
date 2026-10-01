# Asset formats

Schemas here describe **character asset files** (fetched by the client from
`characters/<name>/`), not wire packets. They carry no `$header` or
`x-receiver`. JSON Schema describes the *parsed* shape; the on-disk text
grammar that JSON Schema can't express (char.ini is INI, not JSON) is
specified below.

- `CharIni`: parsed `char.ini`. Worked examples in [EXAMPLES.md](./EXAMPLES.md).

A char.ini MUST have an `[options]` section with a non-empty `name`, and at
least one emote (one `[emote <name>]` block, or one legacy `[emotions]` row);
a parser rejects a file missing any of these.

Comments start with `;` or `//` and run to the end of the line, either at the
start of a line or after whitespace, so `model = model.pmx ; 3D` reads as
`model.pmx`. A marker not preceded by whitespace is part of the value
(`url = http://example.com`). `#` is never a comment: it delimits legacy emote
fields.

A character is **3D** when `[options] model` names a `.pmx`, otherwise **2D**.
The emote table normalizes to one shape either way; `anim` is a sprite stem
for 2D and a base VMD stem for 3D.

## char.ini emote conventions

Historically `(a)`/`(b)` idle/talk sprites were never stored in char.ini: the
client derives `(a)<anim>` / `(b)<anim>` from the emote's `anim` at runtime. 3D
has no `(a)`/`(b)` split (idle and talking share one mouth-free base VMD; the
mouth is morph-driven), so the file format is unchanged by mode; only the
client's interpretation of `anim` differs.

Two emote encodings are supported. A parser MUST prefer blocks and fall back to
the legacy banks, emitting the same normalized `Emote[]` for both.

### `[emote <name>]` blocks (preferred)

Each `[emote <name>]` section is an emote; the emote list is exactly those
blocks, in the order they appear in the file:

```ini
[options]
name = Fenomeno3D        ; required
model = model.pmx        ; present => 3D character

[emote objection]
anim      = objection.gif ; animation file, extension REQUIRED (.gif/.webp/.png 2D, .vmd 3D)
preanim   = point.gif     ; animation file with extension, or omit / `-` for none
postanim  = bow.gif       ; exit animation with extension, or omit / `-` for none
camera    = objection_cam.vmd ; 3D: camera-motion VMD framing this emote, or omit / `-`
sound     = objection.opus ; optional; file with extension (.opus/.wav/.ogg)
sounddelayms = 480        ; optional, milliseconds
modifier  = zoom          ; EmoteModifier NAME (not a number); 3D ignores it (use the emote's camera VMD)
deskmod   = shown         ; optional; DeskModifier NAME (not a number)

[emote think]
anim = think_loop.gif
```

The **block name** (`objection`, `think`) is the emote's `key`: the stable
identity the button keys off. The presence of **any** `[emote <name>]` block
switches the file to this encoding and **invalidates `[emotions]` completely**:
it is not read at all, so it cannot select, reorder, number, or exclude blocks.
A legacy `[emotions]`/`[soundn]`/`[soundt]` triple left in the file alongside
blocks is dead weight and ignored. (A file with no blocks falls back to the
legacy banks below, where `[emotions]` *is* the emote list.)

Only `anim` is required in a block (`key` is the block name); every other field
has a default, so the parsed `Emote` is a complete shape either way. Block field
names are the lowercased `Emote` field names: `name` (display label; defaults to
the block name), `anim`, `preanim` (`-`/absent → null), `postanim` (`-`/absent →
null), `camera` (`-`/absent → null), `sound` (absent → null), `sounddelayms`
(milliseconds; absent → 0), `deskmod` (absent → `shown`, or `hidden` when
`modifier` is `zoom` or `objection_zoom`), and `modifier`
(absent → `no_preanim`). The normalized emote list is in button order, so there is no id.
Unlike the legacy stems, a block's file references **must carry the file
extension**, no extension guessing:
`anim`/`preanim`/`postanim` (`.gif`/`.webp`/`.png` for 2D, `.vmd` for 3D),
`camera` (a `.vmd` with a camera track, 3D only), and `sound`
(`.opus`/`.wav`/`.ogg`). `modifier` and `deskmod` must each be the matching
enum NAME, in lowercase: `ZOOM` and a bare number are rejected, so the meaning is never
a magic value. EmoteModifier for `modifier` (`no_preanim`, `preanim`,
`preanim_and_objection`, `unused_3`, `unused_4`, `zoom`, `objection_zoom`) and
DeskModifier for
`deskmod` (`hidden`, `shown`, `hide_during_preanim`, `show_during_preanim`,
`hide_and_center_during_preanim`, `show_during_preanim_then_center`). (The
legacy `#` banks also accept the wire integer; see below.)

`postanim` is an exit animation, the mirror of `preanim`. The preanim phase is
gated: it runs only when preanim is enabled **for that message**: the sender's
"Preanim" toggle, carried on the wire as the MS emote modifier. When it is off,
**neither** the leaving emote's `postanim` **nor** the entering emote's
`preanim` plays: the entering emote goes straight to its loop and the previous
emote is left instantly. When it is on, the client plays the **leaving** emote's
`postanim` first, then the **entering** emote's `preanim`, then the entering
emote's loop (`anim`); either file may be absent and is simply skipped.

The gate follows the effective emote modifier: preanim runs for the
preanim-playing values (`preanim`, `preanim_and_objection`, `objection_zoom`)
and not for `no_preanim` or `zoom`. An emote's own `modifier` field is that
message's default, so an emote authored with a preanim-playing `modifier` turns
the toggle on by default (the box appears pre-checked).

**Same-character continuation overrides the gate.** When the same character is
already on screen (showing its idle loop, not making a fresh entrance) and
switches emotes, and the leaving emote has a `postanim` and the entering emote
has a `preanim`, the client plays the transition (`postanim` → `preanim` →
loop) regardless of the message's preanim toggle. This keeps an authored
`postanim`/`preanim` pair chaining smoothly on a same-character emote change
even when the sender did not check the box; it does not apply across a character
change or when only one of the two animations exists. `postanim` exists only in
blocks; legacy characters have none. See [SEQUENCING.md](./SEQUENCING.md) for the
full phase model, override conditions, and worked examples.

This encoding is valid for 2D and 3D. New characters (and tools) should emit it.

### Legacy banks (fallback)

Existing characters encode emotes as `#`-delimited records across parallel
sections indexed by the same id:

```ini
[emotions]
number = 2
1 = normal#-#normal#1
2 = point#point#point#5

[soundn]
1 = 0
2 = shocked

[soundt]
2 = 8
```

`N = desc#preanim#anim#modifier#deskmod`, zipped with `[soundn]` (sound) and
`[soundt]` (sound delay, in ticks; see below) by id. `[soundn]` values `0`, `1`
and `-` mean no sound. `modifier` and `deskmod` are each either the wire
integer or one of the names the block form allows, in lowercase only (`5` and
`zoom` are the same modifier). Any other `modifier`, including `ZOOM`, is
`no_preanim`. An empty or absent `deskmod` is `shown`, or `hidden` when
`modifier` is `zoom` or `objection_zoom` (as AO2-Client does); any other
`deskmod` is `shown`. When
no `[emote <name>]` blocks are present a parser reads these banks. Normalized `key` is the
stringified id.

### Sound delay

A parsed `Emote` carries the delay in both units: `sounddelayms` (milliseconds)
and `sounddelayticks` (40 ms ticks, the unit of MS `sfx_delay`). One is read from
the file and the other derived from it:

- Blocks give `sounddelayms`; `sounddelayticks = round(sounddelayms / 40)`,
  rounding half up (500 ms is 13 ticks, which plays at 520 ms).
- Legacy `[soundt]` gives ticks; `sounddelayms = sounddelayticks × 40`.
