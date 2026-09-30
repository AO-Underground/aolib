package aolib

import (
	"strings"
	"testing"
)

// VS_PEERS carries a single trailing array (uids). The fanta walker emits one
// slot per element and nothing else, so the element count equals the slot
// count. In particular an empty list is the canonical VS_PEERS#% (zero slots),
// not VS_PEERS##% (which is a one-element list). VS_PEERS is server->client, so
// it decodes through the s2c registries.

func TestVSPeersFantaEncoding(t *testing.T) {
	cases := []struct {
		name string
		uids []int
		wire string
	}{
		{"empty", []int{}, "VS_PEERS#%"},
		{"one", []int{7}, "VS_PEERS#7#%"},
		{"many", []int{1, 2, 3}, "VS_PEERS#1#2#3#%"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Encode(&VS_PEERS{Uids: c.uids}, WireFanta)
			if err != nil {
				t.Fatalf("Encode: %v", err)
			}
			if string(got) != c.wire {
				t.Fatalf("Encode = %q, want %q", got, c.wire)
			}
			_, v, err := decodeFanta(got, s2cDecoders)
			if err != nil {
				t.Fatalf("decode: %v", err)
			}
			back := v.(*VS_PEERS)
			if len(back.Uids) != len(c.uids) {
				t.Fatalf("round-trip uids = %v, want %v", back.Uids, c.uids)
			}
			for i := range c.uids {
				if back.Uids[i] != c.uids[i] {
					t.Fatalf("round-trip uids = %v, want %v", back.Uids, c.uids)
				}
			}
		})
	}
}

// The non-canonical VS_PEERS##% form is a one-element list, not empty: a lone
// empty slot decodes to a single (zero) uid. This guards the distinction that
// makes VS_PEERS#% the correct empty-list encoding.
func TestVSPeersDoubleHashIsNotEmpty(t *testing.T) {
	_, v, err := decodeFanta([]byte("VS_PEERS##%"), s2cDecoders)
	if err != nil {
		t.Fatalf("decode: %v", err)
	}
	back := v.(*VS_PEERS)
	if len(back.Uids) != 1 {
		t.Fatalf("VS_PEERS##%% decoded to %v uids, want 1 (a lone empty slot is one element, not an empty list)", back.Uids)
	}
}

func TestVSPeersJSONEncoding(t *testing.T) {
	got, err := Encode(&VS_PEERS{Uids: []int{}}, WireJSON)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	s := string(got)
	if !strings.Contains(s, `"$header":"VS_PEERS"`) || !strings.Contains(s, `"uids":[]`) {
		t.Fatalf("JSON = %s, want $header + empty uids array", s)
	}
}
