package aolib

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

// TestDispatchCoversSpec asserts the dispatch registries contain exactly the
// packets defined in spec/, no more and no fewer, in the correct direction.
//
// It reads the schemas directly rather than the generated code, so a codegen
// skip or bug that silently drops a packet is caught here instead of being
// reproduced (and hidden) by the codegen-determinism check.
func TestDispatchCoversSpec(t *testing.T) {
	dir := filepath.Join("..", "spec", "packets", "schemas")
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Skipf("spec not available at %s (standalone checkout): %v", dir, err)
	}

	wantC2S := map[string]struct{}{}
	wantS2C := map[string]struct{}{}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".schema.json") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			t.Fatal(err)
		}
		var s struct {
			Properties struct {
				Header struct {
					Const string `json:"const"`
				} `json:"$header"`
			} `json:"properties"`
			XReceiver string `json:"x-receiver"`
		}
		if err := json.Unmarshal(raw, &s); err != nil {
			t.Fatalf("%s: %v", e.Name(), err)
		}
		h := s.Properties.Header.Const
		if h == "" {
			t.Errorf("%s: missing $header const", e.Name())
			continue
		}
		switch s.XReceiver {
		case "server":
			wantC2S[h] = struct{}{}
		case "client":
			wantS2C[h] = struct{}{}
		default:
			t.Errorf("%s: x-receiver must be client|server, got %q", e.Name(), s.XReceiver)
		}
	}

	checkCoverage(t, "c2s FantaCode", wantC2S, regKeys(c2sDecoders))
	checkCoverage(t, "s2c FantaCode", wantS2C, regKeys(s2cDecoders))
	checkCoverage(t, "c2s JSON", wantC2S, regKeys(c2sJSON))
	checkCoverage(t, "s2c JSON", wantS2C, regKeys(s2cJSON))
}

func regKeys[V any](m map[string]V) map[string]struct{} {
	out := make(map[string]struct{}, len(m))
	for k := range m {
		out[k] = struct{}{}
	}
	return out
}

func checkCoverage(t *testing.T, name string, want, got map[string]struct{}) {
	t.Helper()
	var missing, extra []string
	for h := range want {
		if _, ok := got[h]; !ok {
			missing = append(missing, h)
		}
	}
	for h := range got {
		if _, ok := want[h]; !ok {
			extra = append(extra, h)
		}
	}
	sort.Strings(missing)
	sort.Strings(extra)
	if len(missing) > 0 {
		t.Errorf("%s: in spec but not dispatched: %v", name, missing)
	}
	if len(extra) > 0 {
		t.Errorf("%s: dispatched but not in spec: %v", name, extra)
	}
}
