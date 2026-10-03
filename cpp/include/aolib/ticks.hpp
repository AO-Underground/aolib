#pragma once

namespace aolib {

// [soundt] and MS sfx_delay are in ticks of this many milliseconds.
inline constexpr int kTickMs = 40;

// Milliseconds to ticks (e.g. for MS sfx_delay), rounding half up.
inline int ms_to_ticks(int ms) { return static_cast<int>(ms / kTickMs + (ms % kTickMs >= kTickMs / 2 ? 1 : 0)); }

inline int ticks_to_ms(int ticks) { return ticks * kTickMs; }

}  // namespace aolib
