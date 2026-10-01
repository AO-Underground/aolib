# MS `effect`: the `name|folder|sound` field

The `MS` packet's `effect` field (AO2 ≥ 2.8) carries a screen-effect overlay
request. In the JSON envelope it is the `Effect` object
(`types/Effect.schema.json`):

```json
{ "name": "realization", "folder": "custom", "sound": "realize.wav" }
```

On the fanta wire it packs into one `|`-separated slot `name|folder|sound`. The
object type carries `x-fanta-join: "|"` (see the root `README.md`), so the walker
joins/splits on `|` rather than the default `&`; `|` is not a Fanta
metacharacter, so the parts need no escaping. The all-empty object
(`{ "name": "", "folder": "", "sound": "" }`) is the no-effect sentinel: it
encodes to an empty slot, and an empty slot decodes back to it.

This documents the wire convention AsyncAO implements.

## Wire format

The slot splits on `|`. Only the first three parts are meaningful; any further
parts are ignored. Decoders accept the legacy short forms; encoders always emit
the 3-part form (or an empty slot for no effect).

| parts | form | meaning |
|---|---|---|
| 1 | `name` | `folder` falls back to the sender's `char.ini [Options] effects` |
| 2 | `name\|sound` | legacy; `folder` still falls back |
| 3 | `name\|folder\|sound` | AO2 ≥ 2.8 |

## `name` (the effect)

| value | behaviour |
|---|---|
| `""` | no effect; does **not** clear a running overlay |
| `-` / `none` | explicit clear |
| `realization` | white flash; its sound resolves via `get_custom_realization` (the speaker's `char.ini [Options] realization`, else the theme's `realization`) |
| `flash` / `realizationflash` | white flash (legacy) |
| `screenshake` | screenshake (decaying sinusoid) |
| anything else | named overlay art, resolved from the theme's `effects.ini`; an unresolvable name clears the overlay |

## `folder`

The overlay art's misc folder. Empty → fall back to the sender's `char.ini
[Options] effects` folder. Only meaningful for the named-overlay case.

## `sound`

The effect sound file to play. The sentinels `""`, `0`, `-`, and `none` mean
"no sound".
