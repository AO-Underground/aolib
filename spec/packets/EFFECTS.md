# MS `effect`: the `name|folder|sound` field

The `MS` packet's `effect` field (AO2 ≥ 2.8) carries a screen-effect overlay
request. In the JSON envelope it is the `Effect` object
(`types/Effect.schema.json`):

```json
{ "name": "realization", "folder": "custom", "sound": "realize.wav" }
```

## Wire format

The field splits on `|`. Only the first three parts are meaningful; any further
parts are ignored.

| parts | form | meaning |
|---|---|---|
| 1 | `name` | `folder` falls back to the sender's `char.ini [Options] effects` |
| 2 | `name\|sound` | legacy; `folder` still falls back |
| 3 | `name\|folder\|sound` | AO2 ≥ 2.8 |

A sender emits the 3-part form `name|folder|sound`, or an empty string for "no
effect".

## `name` (the effect)

| value | behaviour |
|---|---|
| `""` | no effect; does **not** clear a running overlay |
| `-` / `none` | explicit clear |
| `realization` | white flash; plays the speaker's realization sound (`char.ini [Options] realization`, else the theme's `realization`) |
| `flash` / `realizationflash` | white flash (legacy) |
| `screenshake` | screenshake (decaying sinusoid) |
| anything else | named overlay art, resolved from the theme's `effects.ini`; an unresolvable name clears the overlay |

## `folder`

The overlay art's misc folder. Empty → fall back to the sender's `char.ini
[Options] effects` folder. Only meaningful for the named-overlay case.

## `sound`

The effect sound file to play. The sentinels `""`, `0`, `-`, and `none` mean
"no sound".
