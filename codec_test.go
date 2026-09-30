package aolib

import (
	"strings"
	"testing"
)

func TestEncodeDecodeFLRoundTripFanta(t *testing.T) {
	fl := FL{Features: []string{"multi_pair", "y_offset"}}
	raw, err := Encode(&fl, WireFanta)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	if string(raw) != "FL#multi_pair#y_offset#%" {
		t.Fatalf("Encode(Fanta) = %q", raw)
	}

	v, err := Decode(raw, WireFanta)
	if err != nil {
		t.Fatalf("Decode: %v", err)
	}
	got, ok := v.(*FL)
	if !ok {
		t.Fatalf("Decode type = %T, want *FL", v)
	}
	if len(got.Features) != 2 || got.Features[0] != "multi_pair" {
		t.Fatalf("Decode features = %#v", got.Features)
	}
}

func TestEncodeFLJSON(t *testing.T) {
	fl := FL{Features: []string{"multi_pair"}}
	raw, err := Encode(&fl, WireJSON)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	// The JSON form carries the named features array.
	if !strings.Contains(string(raw), `"features"`) || !strings.Contains(string(raw), "multi_pair") {
		t.Fatalf("Encode(JSON) = %s", raw)
	}
}

func TestDecodeUnknownHeaderFallsBackToPacket(t *testing.T) {
	v, err := Decode([]byte("NOPE#1#%"), WireFanta)
	if err != nil {
		t.Fatalf("Decode: %v", err)
	}
	pkt, ok := v.(*Packet)
	if !ok || pkt.Header != "NOPE" {
		t.Fatalf("Decode unknown = %#v", v)
	}
}
