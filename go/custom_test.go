package aolib

import (
	"encoding/json"
	"testing"
)

// A caller-defined custom packet plus its codec, exercising the both-formats
// rule: the same typed value round-trips over FantaCode and JSON, and a session
// hands the decoded value to OnCustom regardless of wire mode.

type tt struct {
	Type  string
	Title string
}

func ttCodec() Codec {
	return Codec{
		EncodeFanta: func(p any) ([]string, error) {
			t := p.(*tt)
			return []string{EscapeFanta(t.Type), EscapeFanta(t.Title)}, nil
		},
		DecodeFanta: func(args []string) (any, error) {
			t := &tt{}
			if len(args) > 0 {
				t.Type = UnescapeFanta(args[0])
			}
			if len(args) > 1 {
				t.Title = UnescapeFanta(args[1])
			}
			return t, nil
		},
		EncodeJSON: func(p any) (string, error) {
			t := p.(*tt)
			b, err := json.Marshal(map[string]string{"type": t.Type, "title": t.Title})
			return string(b), err
		},
		DecodeJSON: func(raw string) (any, error) {
			var m struct {
				Type  string `json:"type"`
				Title string `json:"title"`
			}
			if err := json.Unmarshal([]byte(raw), &m); err != nil {
				return nil, err
			}
			return &tt{Type: m.Type, Title: m.Title}, nil
		},
	}
}

func TestRegisterCodecRejectsIncomplete(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Fatal("RegisterCodec must panic when a wire direction is missing")
		}
	}()
	RegisterCodec("XX", Codec{EncodeFanta: func(any) ([]string, error) { return nil, nil }})
}

func TestCustomCodecFantaFrame(t *testing.T) {
	RegisterCodec("TT", ttCodec())
	raw, err := encodeCustom("TT", &tt{Type: "0", Title: "Cross Examination"}, WireFanta)
	if err != nil {
		t.Fatal(err)
	}
	if string(raw) != "TT#0#Cross Examination#%" {
		t.Fatalf("fanta = %q", raw)
	}
	raw, _ = encodeCustom("TT", &tt{Type: "1", Title: "a#b"}, WireFanta)
	if string(raw) != "TT#1#a<num>b#%" {
		t.Fatalf("fanta escape = %q", raw)
	}
}

func TestCustomCodecSessionBothWires(t *testing.T) {
	RegisterCodec("TT", ttCodec())

	for _, jsonMode := range []bool{false, true} {
		var sent []byte
		var got *tt
		srv := NewClient(SessionConfig{Send: func(w []byte) { sent = w }})
		srv.SetJSONMode(jsonMode)
		if err := srv.OnCustom("TT", func(p any) { got = p.(*tt) }); err != nil {
			t.Fatal(err)
		}
		if err := srv.SendCustom("TT", &tt{Type: "0", Title: "X"}); err != nil {
			t.Fatal(err)
		}
		// Feed what was sent back into the same session's inbound path.
		srv.Receive(sent)
		if got == nil || got.Type != "0" || got.Title != "X" {
			t.Fatalf("jsonMode=%v: decoded %#v from %q", jsonMode, got, sent)
		}
	}
}
