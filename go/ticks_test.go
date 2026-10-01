package aolib

import "testing"

func TestMsToTicks(t *testing.T) {
	for ms, want := range map[int]int{0: 0, 19: 0, 20: 1, 480: 12, 500: 13, 519: 13} {
		if got := MsToTicks(ms); got != want {
			t.Errorf("MsToTicks(%d) = %d, want %d", ms, got, want)
		}
	}
	if got := TicksToMs(8); got != 320 {
		t.Errorf("TicksToMs(8) = %d, want 320", got)
	}
}
