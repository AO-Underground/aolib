package aolib

import "math"

// TickMs is the length of one tick, the unit of MS SfxDelay and char.ini [soundt].
const TickMs = 40

// MsToTicks converts milliseconds to ticks, rounding half up.
func MsToTicks(ms int) int {
	return int(math.Floor(float64(ms)/TickMs + 0.5))
}

// TicksToMs converts ticks to milliseconds.
func TicksToMs(ticks int) int {
	return ticks * TickMs
}
