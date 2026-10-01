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

	// FL travels server->client in spec, so it decodes through the s2c
	// direction rather than the c2s-only top-level Decode.
	_, v, err := decodeFanta(raw, s2cDecoders)
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

func TestDecodeRTLenientForms(t *testing.T) {
	cases := []struct {
		wire string
		want RTToServer
	}{
		{"RT#testimony1#%", RTToServer{Animation: RTAnimationWitnessTestimony}},
		{"RT#testimony1#5#%", RTToServer{Animation: RTAnimationWitnessTestimony}},
		{"RT#testimony1#x#%", RTToServer{Animation: RTAnimationWitnessTestimony}},
		{"RT#testimony2#%", RTToServer{Animation: RTAnimationCrossExamination}},
		{"RT#judgeruling#%", RTToServer{Animation: RTAnimationNotGuilty}},
		{"RT#knock#3#%", RTToServer{Animation: RTAnimationCustom, Name: "knock"}},
		{"RT#a<and>b#%", RTToServer{Animation: RTAnimationCustom, Name: "a&b"}},
	}
	for _, c := range cases {
		v, err := Decode([]byte(c.wire), WireFanta)
		if err != nil {
			t.Fatalf("Decode(%q): %v", c.wire, err)
		}
		if got, ok := v.(*RTToServer); !ok || *got != c.want {
			t.Fatalf("Decode(%q) = %#v, want %#v", c.wire, v, c.want)
		}
	}
}

func TestDecodeRTRejectsInvalid(t *testing.T) {
	for _, wire := range []string{"RT#judgeruling#2#%", "RT##%", "RT#%"} {
		if _, err := Decode([]byte(wire), WireFanta); err == nil {
			t.Fatalf("Decode(%q) succeeded, want error", wire)
		}
	}
}

func TestParseARUPEdgeCases(t *testing.T) {
	p, err := ParseARUP(nil)
	if err != nil || p.UpdateType != AreaUpdateTypePlayerCount || p.UpdateData == nil || len(p.UpdateData) != 0 {
		t.Fatalf("ParseARUP(empty) = %#v, %v", p, err)
	}
	p, err = ParseARUP([]string{"0", "abc", "5"})
	if err != nil || p.UpdateData[0] != "0" || p.UpdateData[1] != "5" {
		t.Fatalf("ParseARUP(non-numeric count) = %#v, %v", p, err)
	}
	if _, err := ParseARUP([]string{"9", "x"}); err == nil {
		t.Fatal("ParseARUP(unknown update_type) succeeded, want error")
	}
}

func TestARUPJSONRejectsBadData(t *testing.T) {
	var p ARUP
	if err := p.UnmarshalJSON([]byte(`{"update_type":"bogus","update_data":[]}`)); err == nil {
		t.Fatal("unknown update_type accepted")
	}
	if err := p.UnmarshalJSON([]byte(`{"update_type":"status","update_data":[true]}`)); err == nil {
		t.Fatal("boolean update_data accepted")
	}
	if _, err := Encode(&ARUP{UpdateType: AreaUpdateTypePlayerCount, UpdateData: []string{"x"}}, WireJSON); err == nil {
		t.Fatal("non-integer player count encoded")
	}
}

func TestMusicEffectsIgnoresUnknownBits(t *testing.T) {
	got := musicEffectsFromWire("9")
	if got != (MusicEffects{FadeIn: true}) {
		t.Fatalf("musicEffectsFromWire(9) = %#v", got)
	}
	if w := musicEffectsToWire(got); w != "1" {
		t.Fatalf("musicEffectsToWire = %q, want \"1\"", w)
	}
}

func TestDecodeZZReasonlessForm(t *testing.T) {
	v, err := Decode([]byte("ZZ#%"), WireFanta)
	if err != nil {
		t.Fatalf("Decode: %v", err)
	}
	if got, ok := v.(*ZZToServer); !ok || *got != (ZZToServer{Reason: "", ReportedPlayerID: -1}) {
		t.Fatalf("Decode(ZZ#%%) = %#v", v)
	}
}

func TestDecodeShortMSAppliesDefaults(t *testing.T) {
	v, err := Decode([]byte("MS#1#-#Phoenix#normal#hi#def#1#0#3#0#0#0#0#0#0#%"), WireFanta)
	if err != nil {
		t.Fatalf("Decode: %v", err)
	}
	ms, ok := v.(*MSToServer)
	if !ok || ms.PairedCharID != -1 || ms.Showname != "" {
		t.Fatalf("Decode(short MS) = %#v", v)
	}
}
