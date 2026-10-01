# char.ini examples

Complete `char.ini` files and the `CharIni` object each parses to (see `README.md` for the grammar). Each also carries `sections`, the raw key/value map of every INI section, omitted here.

## Legacy banks

An existing 2D character using `[Emotions]`, `[SoundN]` and `[SoundT]`.

```ini
[Options]
name = Phoenix
showname = Wright
side = def
blips = male
chat = aa

[Emotions]
number = 3
1 = Normal#-#normal#0#1
2 = Thinking#-#thinking#0#1
3 = Desk slam#deskslam#handsondesk#1#0

[SoundN]
1 = 1
2 = 0
3 = sfx-deskslam

[SoundT]
3 = 7
```

```json
{
  "options": {
    "name": "Phoenix",
    "showname": "Wright",
    "side": "def",
    "model": "",
    "blips": "male",
    "chat": "aa",
    "category": null
  },
  "emotes": [
    {
      "key": "1",
      "name": "Normal",
      "anim": "normal",
      "preanim": null,
      "postanim": null,
      "camera": null,
      "modifier": "no_preanim",
      "deskmod": "shown",
      "sound": null,
      "sounddelayms": 0,
      "sounddelayticks": 0
    },
    {
      "key": "2",
      "name": "Thinking",
      "anim": "thinking",
      "preanim": null,
      "postanim": null,
      "camera": null,
      "modifier": "no_preanim",
      "deskmod": "shown",
      "sound": null,
      "sounddelayms": 0,
      "sounddelayticks": 0
    },
    {
      "key": "3",
      "name": "Desk slam",
      "anim": "handsondesk",
      "preanim": "deskslam",
      "postanim": null,
      "camera": null,
      "modifier": "preanim",
      "deskmod": "hidden",
      "sound": "sfx-deskslam",
      "sounddelayms": 280,
      "sounddelayticks": 7
    }
  ]
}
```

- Section and key names are case-insensitive (`[Options]`, `[SoundT]`).
- Each emote's `key` is its id; fields come from `desc#preanim#anim#modifier#deskmod`, with `-` meaning no preanim.
- `[SoundT] 3 = 7` is ticks: `sounddelayticks` is 7 and `sounddelayms` is derived as 280.
- `[SoundN]` values `1` and `0` are legacy "no sound" placeholders and parse to `sound: null`; an emote with no `[SoundT]` entry has a delay of 0.
- `modifier` and `deskmod` are wire integers on disk (`1`, `0`) and parse to enum names (`preanim`, `hidden`).
- Unset options take their defaults: `model` is empty (2D) and `category` is null.

## Emote blocks

The same character written with `[emote <name>]` blocks.

```ini
[options]
name = Phoenix
showname = Wright
side = def
blips = male
chat = aa

[emote normal]
anim = normal.webp

[emote deskslam]
name     = Desk slam
anim     = handsondesk.webp
preanim  = deskslam.webp
postanim = straighten.webp
sound    = sfx-deskslam.opus
sounddelayms = 500
modifier = preanim
deskmod  = hidden
```

```json
{
  "options": {
    "name": "Phoenix",
    "showname": "Wright",
    "side": "def",
    "model": "",
    "blips": "male",
    "chat": "aa",
    "category": null
  },
  "emotes": [
    {
      "key": "normal",
      "name": "normal",
      "anim": "normal.webp",
      "preanim": null,
      "postanim": null,
      "camera": null,
      "modifier": "no_preanim",
      "deskmod": "shown",
      "sound": null,
      "sounddelayms": 0,
      "sounddelayticks": 0
    },
    {
      "key": "deskslam",
      "name": "Desk slam",
      "anim": "handsondesk.webp",
      "preanim": "deskslam.webp",
      "postanim": "straighten.webp",
      "camera": null,
      "modifier": "preanim",
      "deskmod": "hidden",
      "sound": "sfx-deskslam.opus",
      "sounddelayms": 500,
      "sounddelayticks": 13
    }
  ]
}
```

- Each block is one emote, in file order; the block name is the `key`, and `name` defaults to it (`normal`).
- File references keep their extensions.
- `modifier = preanim` and `deskmod = hidden` are enum names (lowercase only) and stay names in the object.
- `sounddelayms = 500` is milliseconds: `sounddelayticks` is derived as 13 (rounded half up, plays at 520 ms).
- Omitted fields take their defaults: no `preanim`/`postanim`/`sound` is null, `modifier` is `no_preanim`, `deskmod` is `shown` (it would be `hidden` if `modifier` were `zoom` or `objection_zoom`).

## 3D character

A 3D character: `[options] model` names a `.pmx`, and animations are VMD stems.

```ini
[options]
name = Fenomeno3D
showname = Fenomeno
side = wit
model = fenomeno.pmx

[emote objection]
anim    = objection.vmd
preanim = point.vmd
camera  = objection_cam.vmd
sound   = objection.opus
sounddelayms = 480
modifier = preanim

[emote think]
anim = think_loop.vmd
```

```json
{
  "options": {
    "name": "Fenomeno3D",
    "showname": "Fenomeno",
    "side": "wit",
    "model": "fenomeno.pmx",
    "blips": "male",
    "chat": null,
    "category": null
  },
  "emotes": [
    {
      "key": "objection",
      "name": "objection",
      "anim": "objection.vmd",
      "preanim": "point.vmd",
      "postanim": null,
      "camera": "objection_cam.vmd",
      "modifier": "preanim",
      "deskmod": "shown",
      "sound": "objection.opus",
      "sounddelayms": 480,
      "sounddelayticks": 12
    },
    {
      "key": "think",
      "name": "think",
      "anim": "think_loop.vmd",
      "preanim": null,
      "postanim": null,
      "camera": null,
      "modifier": "no_preanim",
      "deskmod": "shown",
      "sound": null,
      "sounddelayms": 0,
      "sounddelayticks": 0
    }
  ]
}
```

- `model` makes the character 3D; `anim`/`preanim` are VMDs and `camera` frames the emote.
- `sounddelayms = 480` is an exact multiple of 40, so `sounddelayticks` is 12 with no rounding.
- Missing `blips` defaults to `male`, missing `chat` to null.
