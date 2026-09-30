# Packets

Wire-packet schemas for the Attorney Online protocol, one `.schema.json` per
packet under `schemas/`. Each declares its direction (`x-receiver`) and wire
header (`$header` const). The fanta wire format, defaults, and validation are
described in the root `README.md`.

Packets whose wire form has discriminator-driven payloads set `x-fanta-codec`
and are specified in `CODECS.md`.
