package aolib

import (
	"encoding/json"
	"testing"
)

func TestBuildJSONPacketAdditionalChars(t *testing.T) {
	ms := &MSPacket{
		DeskMod: "1", PreAnim: "", Character: "Phoenix", Emote: "normal",
		Message: "hi", Side: "def", CharID: "0",
		AdditionalChars: []AdditionalChar{
			{CharID: 5, Name: "Maya", Emote: "normal", Offset: PairOffset{X: 10, Y: -5}, Flip: 1},
			{CharID: 8, Name: "Edgeworth", Emote: "desk", Offset: PairOffset{X: -12, Y: 0}, Flip: 0},
		},
	}

	buf := BuildJSONPacket(ms)
	if buf == nil {
		t.Fatal("BuildJSONPacket returned nil")
	}

	var obj map[string]any
	if err := json.Unmarshal(buf, &obj); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if obj["$header"] != "MS" {
		t.Fatalf("$header = %v, want MS", obj["$header"])
	}

	chars, ok := obj["additional_chars"].([]any)
	if !ok || len(chars) != 2 {
		t.Fatalf("additional_chars = %#v, want 2 entries", obj["additional_chars"])
	}

	first := chars[0].(map[string]any)
	if first["charid"] != float64(5) || first["name"] != "Maya" || first["emote"] != "normal" {
		t.Fatalf("first additional char = %#v", first)
	}
	off := first["offset"].(map[string]any)
	if off["x"] != float64(10) || off["y"] != float64(-5) {
		t.Fatalf("first offset = %#v, want {x:10, y:-5}", off)
	}
	if first["flip"] != float64(1) {
		t.Fatalf("first flip = %v, want 1", first["flip"])
	}

	if second := chars[1].(map[string]any); second["charid"] != float64(8) {
		t.Fatalf("second additional char = %#v", second)
	}
}

func TestBuildJSONPacketOmitsAdditionalCharsWhenEmpty(t *testing.T) {
	ms := &MSPacket{DeskMod: "1", Character: "Phoenix", Emote: "normal", Message: "hi", Side: "def", CharID: "0"}

	buf := BuildJSONPacket(ms)
	var obj map[string]any
	if err := json.Unmarshal(buf, &obj); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if _, exists := obj["additional_chars"]; exists {
		t.Fatal("additional_chars must be omitted when there are no extra partners")
	}
}
