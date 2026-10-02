# Packets

Wire-packet schemas for the Attorney Online protocol, one `.schema.json` per
packet under `schemas/`. Each declares its direction (`x-receiver`) and wire
header (`$header` const). The fanta wire format, defaults, and validation are
described in the root `README.md`.

Packets whose wire form has discriminator-driven payloads set `x-fanta-codec`
and are specified in `CODECS.md`.

## Coded numeric fields

Fields whose legacy integer is a code, not a quantity, are modeled as string
enums (in `../types/`) with `x-wire-ints`, so JSON carries the name and the
FantaCode wire keeps the integer: `JD.state` (JudgeState), `AUTH.auth_state`
(AuthState), `HP.bar` (PenaltyBar), `PR.type` (PlayerListUpdate), `PU.type`
(PlayerDataType), `TI.command` (TimerCommand), `MC.channel` (MusicChannel),
and `CharsCheck.taken[]` (CharAvailability).

## Pair order

`MS.paired_order` is the paired character's z-offset relative to the speaker:
`0` renders behind (the default), `1` in front. On the FantaCode wire it packs
onto the `paired_charid` slot as a `^`-joined suffix — `4^1` means "pair with
character 4, in front" — and is omitted when `0` (the bare `4`), because
`<id>^0` is redundant and strict parsers reject it. The `^` slot only
round-trips `0`/`1`, so richer group ordering is JSON-only. The suffix packing
is declared by the `x-fanta-suffix-of` keyword (see the root `README.md`).

