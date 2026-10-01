package aolib

import (
	"strings"
	"testing"
)

// effectSlot returns the effect positional slot (the last one before the "%"
// terminator) of an encoded MS fanta frame.
func effectSlot(t *testing.T, raw []byte) string {
	t.Helper()
	parts := strings.Split(string(raw), "#")
	if len(parts) < 2 {
		t.Fatalf("malformed frame %q", raw)
	}
	return parts[len(parts)-2]
}

func TestEffectPacksAsPipeSlot(t *testing.T) {
	p := &MSToClient{
		Character: "Phoenix", Emote: "normal", Message: "hi", Side: "pro", CharID: 1,
		Effect: Effect{Name: "realization", Folder: "custom", Sound: "realize.wav"},
	}
	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	if got := effectSlot(t, raw); got != "realization|custom|realize.wav" {
		t.Fatalf("effect slot = %q", got)
	}
}

func TestEffectEmptyCollapsesToEmptySlot(t *testing.T) {
	p := &MSToClient{Character: "Phoenix", Emote: "normal", Message: "hi", Side: "pro", CharID: 1}
	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	if got := effectSlot(t, raw); got != "" {
		t.Fatalf("empty effect slot = %q, want empty", got)
	}
}

func TestEffectRoundTripFanta(t *testing.T) {
	eff := Effect{Name: "realization", Folder: "custom", Sound: "realize.wav"}
	p := &MSToClient{Character: "Phoenix", Emote: "normal", Message: "hi", Side: "pro", CharID: 1, Effect: eff}
	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	_, v, err := decodeFanta(raw, s2cDecoders)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got := v.(*MSToClient).Effect; got != eff {
		t.Fatalf("round-trip effect = %#v, want %#v", got, eff)
	}
}

func TestEffectLegacyNameOnlyDecodesPositionally(t *testing.T) {
	got := effectFromWire("realization")
	want := Effect{Name: "realization"}
	if got != want {
		t.Fatalf("effectFromWire(name-only) = %#v, want %#v", got, want)
	}
}

func TestEffectChatMetaSurvivesFanta(t *testing.T) {
	eff := Effect{Name: "tag #1", Folder: "a & b", Sound: "100%.wav"}
	p := &MSToClient{Character: "Phoenix", Emote: "normal", Message: "hi", Side: "pro", CharID: 1, Effect: eff}
	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	_, v, err := decodeFanta(raw, s2cDecoders)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got := v.(*MSToClient).Effect; got != eff {
		t.Fatalf("round-trip effect = %#v, want %#v", got, eff)
	}
}
