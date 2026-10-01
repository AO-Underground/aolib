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
