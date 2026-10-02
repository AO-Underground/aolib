package aolib

import (
	"strings"
	"testing"
)

// Pair order is the optional "^<order>" suffix packed onto paired_charid. The
// default 0 keeps the bare id; 1 emits "^1"; an unpaired -1 is never suffixed.

func TestMSPairOrderFrontPacksCaretSuffix(t *testing.T) {
	p := NewMSToServer()
	p.Character = "Phoenix"
	p.Emote = "normal"
	p.Message = "Take that!"
	p.Side = "def"
	p.CharID = 12
	p.PairedCharID = 4
	p.PairedOrder = 1

	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	if !strings.Contains(string(raw), "4^1") {
		t.Fatalf("fanta %q missing pair-order suffix 4^1", raw)
	}
	if strings.Contains(string(raw), "4^0") {
		t.Fatalf("fanta %q unexpectedly carries explicit front suffix 4^0", raw)
	}
}

func TestMSPairOrderDefaultIsBareID(t *testing.T) {
	p := NewMSToServer()
	p.Character = "Phoenix"
	p.Emote = "normal"
	p.Message = "Take that!"
	p.Side = "def"
	p.CharID = 12
	p.PairedCharID = 4 // PairedOrder left at default 0

	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	if strings.Contains(string(raw), "^") {
		t.Fatalf("fanta %q should not carry a ^ suffix for the default order", raw)
	}
	if !strings.Contains(string(raw), "#4#") {
		t.Fatalf("fanta %q missing bare paired id 4", raw)
	}
}

func TestMSPairOrderUnpairedNeverSuffixed(t *testing.T) {
	p := NewMSToServer()
	p.Character = "Phoenix"
	p.Emote = "normal"
	p.Message = "Take that!"
	p.Side = "def"
	p.CharID = 12
	p.PairedCharID = -1
	p.PairedOrder = 1 // meaningless when unpaired; must stay bare

	raw, err := Encode(p, WireFanta)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	if strings.Contains(string(raw), "^") {
		t.Fatalf("fanta %q should not suffix an unpaired -1", raw)
	}
}

func TestMSPairOrderDecodesCaretSuffix(t *testing.T) {
	v, err := DecodeToServer([]byte("MS#1##Phoenix#normal#Take that!#def##0#12#0#0#0#0#0#0##4^1#0&0#0#0#0####0##%"), WireFanta)
	if err != nil {
		t.Fatalf("decode front: %v", err)
	}
	p := v.(*MSToServer)
	if p.PairedCharID != 4 || p.PairedOrder != 1 {
		t.Fatalf("paired_charid=%d paired_order=%d, want 4/1", p.PairedCharID, p.PairedOrder)
	}

	v2, err := DecodeToServer([]byte("MS#1##Phoenix#normal#Take that!#def##0#12#0#0#0#0#0#0##4#0&0#0#0#0####0##%"), WireFanta)
	if err != nil {
		t.Fatalf("decode default: %v", err)
	}
	p2 := v2.(*MSToServer)
	if p2.PairedCharID != 4 || p2.PairedOrder != 0 {
		t.Fatalf("paired_charid=%d paired_order=%d, want 4/0", p2.PairedCharID, p2.PairedOrder)
	}
}
