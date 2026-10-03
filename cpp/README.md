# aolib-cpp

The Attorney Online 2 protocol in C++, the C++ counterpart to
[`aolib-ts`](../ts) and [`aolib-go`](../go), generated from the canonical
[`spec/`](../spec) schemas so the three libraries stay in lockstep.

It decodes and encodes AO2 packets in both wire forms:

- **FantaCode**: the classic `#`-delimited positional format. Enums carry their
  legacy integer (via `x-wire-ints`).
- **JSON**: the meta envelope: named fields plus a `$header` const. Enums are
  their string values (`"shown"`, `"def"`), `offset` is an `{x,y}` object.

aolib-cpp models only the canonical meta protocol. Nonstandard behavior (server
extensions, extra packets) is not baked in; servers layer it on themselves via
`RegisterPacket` / `SendCustom` / `OnCustom`.

## Building

Requires CMake 3.16+ and a C++17 compiler. Vendored dependencies live under
`third_party/` (nlohmann/json, pboettch/json-schema-validator, doctest).

```sh
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
ctest --test-dir build
```

The code generator is deterministic and guarded in CI:

```sh
cmake --build build --target aolib-gen
./build/aolib-gen -meta ../spec -out .
```

## Overview

```cpp
#include "aolib/aolib.hpp"

// Encode / decode / validate any typed packet.
auto fanta = aolib::encode(aolib::MSToClient{...}, aolib::WireMode::fanta);
std::any pkt = aolib::decode_to_client(fanta, aolib::WireMode::fanta);
aolib::validate_packet(pkt);

// Sessions are named for the remote party.
aolib::ServerSession server(cfg);   // client-side code: Send* ships C2S, On* handles S2C
aolib::ClientSession client(cfg);   // server-side code: Send* ships S2C, On* handles C2S

server.OnMS([](const aolib::MSToClient& m) { /* ... */ });
client.SendMS(aolib::MSToClient{...});
```

Every packet struct default-constructs to its spec defaults (like the Go
`New*` constructors): `aolib::MSToClient{}` pairs with character `-1`, reports
`paired_order` 0, and so on.

## Layout

```
aolib-gen/   code generator (reads ../spec, emits the typed surface)
include/aolib/   public headers (hand-written + generated)
src/         implementations (hand-written + generated)
tests/       conformance, coverage, encode/decode, session, char.ini
third_party/ vendored nlohmann/json, pboettch/json-schema-validator, doctest
```

Generated files (`*_gen.hpp` / `*_gen.cpp`) are committed and must equal a fresh
generation from `spec/` (guarded in CI).

## Extending

Extra fields on spec packets (`Extras`) and custom packets (`RegisterPacket`):
see [EXTENDING.md](EXTENDING.md).

## License

MIT, matching the rest of the `aolib` family. See [`../ts/LICENSE`](../ts/LICENSE).
