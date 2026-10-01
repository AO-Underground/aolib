package aolib

import "testing"

// AO2 servers send an empty paired_offset when there is no pair.
func TestMSToClientEmptyOffsetDecodesToDefault(t *testing.T) {
	raw := []byte("MS#1#-#angel starr#normal#a#wit#0#0#33#0#0#0#0#0#0##-1###0<and>0##0#0#0#0#-#-#-#0##%")
	_, v, err := decodeFanta(raw, s2cDecoders)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	p := v.(*MSToClient)
	if p.Offset != (Offset{}) || p.PairedOffset != (Offset{}) {
		t.Fatalf("offset = %#v, paired_offset = %#v, want zero", p.Offset, p.PairedOffset)
	}
	if p.Message != "a" {
		t.Fatalf("message = %q", p.Message)
	}
}

// Legacy senders without the y_offset feature send only x.
func TestMSToClientOffsetWithoutYDecodesToZeroY(t *testing.T) {
	raw := []byte("MS#1#-#Ini#ini-normal#dfadfs#wit#0#0#31#0#0#0#0#0#0#Häschen#-1#0#0#0<and>0#0#0#0#0#0#-#-#-#0##%")
	_, v, err := decodeFanta(raw, s2cDecoders)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	p := v.(*MSToClient)
	if p.Offset != (Offset{}) || p.PairedOffset != (Offset{}) || p.Showname != "Häschen" {
		t.Fatalf("got offset %#v, paired_offset %#v, showname %q", p.Offset, p.PairedOffset, p.Showname)
	}
	v, err = Decode([]byte("MS#1#-#Ini#normal#hi#wit#0#0#31#0#0#0#0#0#0##-1#25#0#0#0#-#-#-#0##%"), WireFanta)
	if err != nil {
		t.Fatalf("decode MSToServer: %v", err)
	}
	if got := v.(*MSToServer).Offset; got != (Offset{X: 25}) {
		t.Fatalf("MSToServer offset = %#v, want {25 0}", got)
	}
}
