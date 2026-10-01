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
(PlayerDataType), `TI.command` (TimerCommand), and `CharsCheck.taken[]`
(CharAvailability).

Deliberately left as numbers for now:

- `MC.channel` is a `0-3` channel index with only loose conventions, not a
  fixed named set.
- `ZZ.target` exists in the schema but not in the reference docs (which show
  `ZZ` as `reason` only); the divergence should be reconciled before deciding
  its shape.
