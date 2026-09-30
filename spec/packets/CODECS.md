# Custom packet codecs

Packets carrying `x-fanta-codec` bypass the generic positional walker (see the
root `README.md`); the generic per-type rules do not describe them, so each
codec's wire form is specified here. A library registers one codec per
`x-fanta-codec` name and the walker delegates to it.

A codec is the single authority for its header and must implement both wire
forms (FantaCode and JSON). The same registration is available to callers at
runtime for nonstandard headers the spec does not model: the library exposes it
(`registerCodec` in aolib-ts, `RegisterCodec` in aolib-go), the session routes a
custom header through the caller's codec in whichever wire mode is active, and
the both-forms rule applies equally, so a custom packet always has a FantaCode
form, not JSON alone. The codecs documented below are the ones the spec itself
defines.

## `ARUP`

Area status update, server to client. `update_type` selects which per-area field
the packet carries; `update_data` holds one value per area, in area-index order
(area 0 first).

```
ARUP#{update_type}#{area0}#{area1}#...#%
```

- `update_type` (`AreaUpdateType`): one slot, emitted first, as the legacy
  integer from the enum's `x-wire-ints` (JSON carries the string name; the wire
  carries the number). The value determines the per-area encoding below.
- `update_data`: one slot per area, immediately after `update_type` with no
  leading placeholder slot. The per-area encoding follows `update_type`:
  - `0` player_count: decimal integer per area.
  - `1` status: status string (e.g. `IDLE`, `LOOKING-FOR-PLAYERS`, `CASING`,
    `RECESS`, `RP`, `GAMING`).
  - `2` case_manager: manager name string, or `FREE` when unassigned.
  - `3` locked: lock-state string (`FREE`, `SPECTATABLE`, or `LOCKED`).

String slots use the same escaping as a generic `string` slot (`#`/`&`/`%`/`$`
become `<num>`/`<and>`/`<percent>`/`<dollar>`); integer slots are decimal. The
area count is implicit in the slot count; both ends must agree on it out of band.

Example: `ARUP#0#4#3#7#2#0#0#%` is six areas with 4, 3, 7, 2, 0, and 0 players.

This matches the tsuserver3 reference server, whose first token after the header
is the type, followed immediately by per-area values. Some published examples
show a leading empty slot for types 1-3 (`ARUP#1##IDLE#...`); the reference
server does not emit it, so decoders may tolerate it but encoders must not
produce it.
