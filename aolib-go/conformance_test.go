package aolib

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

type conformanceVector struct {
	ID       string          `json:"id"`
	Header   string          `json:"header"`
	Receiver string          `json:"receiver"`
	Fanta    string          `json:"fanta"`
	JSON     json.RawMessage `json:"json"`
}

// TestConformanceVectors checks this binding against the shared interop vectors
// in conformance/vectors.json. Per vector: decode both wire forms, assert they
// produce the same packet, then re-encode to each form and assert it matches
// the pinned bytes exactly. Every binding runs the same vectors, so passing
// means the bindings emit and accept identical wire data (they interoperate).
func TestConformanceVectors(t *testing.T) {
	path := filepath.Join("..", "conformance", "vectors.json")
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Skipf("conformance vectors unavailable at %s (standalone checkout): %v", path, err)
	}
	var vectors []conformanceVector
	if err := json.Unmarshal(raw, &vectors); err != nil {
		t.Fatalf("parse vectors: %v", err)
	}
	if len(vectors) == 0 {
		t.Fatal("no conformance vectors found")
	}

	for _, v := range vectors {
		t.Run(v.ID, func(t *testing.T) {
			fantaReg, jsonReg := s2cDecoders, s2cJSON
			if v.Receiver == "server" {
				fantaReg, jsonReg = c2sDecoders, c2sJSON
			}

			_, fromJSON, err := decodeJSON(v.JSON, jsonReg)
			if err != nil {
				t.Fatalf("decode json: %v", err)
			}
			_, fromFanta, err := decodeFanta([]byte(v.Fanta), fantaReg)
			if err != nil {
				t.Fatalf("decode fanta: %v", err)
			}
			if !reflect.DeepEqual(fromJSON, fromFanta) {
				t.Fatalf("wire forms decode to different packets:\n  json:  %#v\n  fanta: %#v", fromJSON, fromFanta)
			}

			out, ok := fromJSON.(Outgoing)
			if !ok {
				t.Fatalf("decoded %T is not Outgoing", fromJSON)
			}
			gotFanta, err := Encode(out, WireFanta)
			if err != nil {
				t.Fatalf("encode fanta: %v", err)
			}
			if string(gotFanta) != v.Fanta {
				t.Fatalf("fanta mismatch:\n  got:  %q\n  want: %q", gotFanta, v.Fanta)
			}
			gotJSON, err := Encode(out, WireJSON)
			if err != nil {
				t.Fatalf("encode json: %v", err)
			}
			assertJSONEqual(t, gotJSON, v.JSON)
		})
	}
}

func assertJSONEqual(t *testing.T, got, want []byte) {
	t.Helper()
	var g, w any
	if err := json.Unmarshal(got, &g); err != nil {
		t.Fatalf("got is not JSON: %v (%s)", err, got)
	}
	if err := json.Unmarshal(want, &w); err != nil {
		t.Fatalf("want is not JSON: %v", err)
	}
	if !reflect.DeepEqual(g, w) {
		t.Fatalf("json mismatch:\n  got:  %s\n  want: %s", got, want)
	}
}
