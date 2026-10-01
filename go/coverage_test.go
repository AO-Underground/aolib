package aolib

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
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

	server, client := reflect.TypeOf(&ServerSession{}), reflect.TypeOf(&ClientSession{})
	checkCoverage(t, "ServerSession.Send*", wantC2S, sessionMethods(server, "Send", wantC2S))
	checkCoverage(t, "ClientSession.On*", wantC2S, sessionMethods(client, "On", wantC2S))
	checkCoverage(t, "ClientSession.Send*", wantS2C, sessionMethods(client, "Send", wantS2C))
	checkCoverage(t, "ServerSession.On*", wantS2C, sessionMethods(server, "On", wantS2C))
}

// sessionMethods returns the headers in want that typ has a <prefix><Header> method for.
func sessionMethods(typ reflect.Type, prefix string, want map[string]struct{}) map[string]struct{} {
	out := map[string]struct{}{}
	for h := range want {
		if _, ok := typ.MethodByName(prefix + strings.ToUpper(h[:1]) + h[1:]); ok {
			out[h] = struct{}{}
		}
	}
	return out
}

// TestGeneratedFilesAreNamedGen keeps every "Code generated" file under the
// *_gen.go name that CI deletes and regenerates, so a file the generator stops
// writing fails CI instead of going stale.
func TestGeneratedFilesAreNamedGen(t *testing.T) {
	generated := regexp.MustCompile(`(?m)^// Code generated .* DO NOT EDIT\.$`)
	files, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range files {
		raw, err := os.ReadFile(f)
		if err != nil {
			t.Fatal(err)
		}
		if generated.Match(raw) && !strings.HasSuffix(f, "_gen.go") {
			t.Errorf("%s is marked generated but not named *_gen.go", f)
		}
	}
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

// TestConstructorsApplySchemaDefaults checks every New* constructor against the
// defaults in its schema, so a default the zero value misses can't slip through.
func TestConstructorsApplySchemaDefaults(t *testing.T) {
	dir := filepath.Join("..", "spec", "packets", "schemas")
	files, err := filepath.Glob(filepath.Join(dir, "*.schema.json"))
	if err != nil || len(files) == 0 {
		t.Skipf("spec not available at %s", dir)
	}
	for _, f := range files {
		raw, err := os.ReadFile(f)
		if err != nil {
			t.Fatal(err)
		}
		var s struct {
			Properties map[string]struct {
				Const   any `json:"const"`
				Default any `json:"default"`
			} `json:"properties"`
		}
		if err := json.Unmarshal(raw, &s); err != nil {
			t.Fatal(err)
		}
		name := strings.TrimSuffix(filepath.Base(f), ".schema.json")
		name = strings.ToUpper(name[:1]) + name[1:]
		newPacket, ok := packetConstructors[name]
		if !ok {
			t.Errorf("%s: no New%s constructor", name, name)
			continue
		}
		encoded, err := encodeJSON(newPacket())
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		var got map[string]any
		if err := json.Unmarshal(encoded, &got); err != nil {
			t.Fatal(err)
		}
		for key, p := range s.Properties {
			if p.Default == nil || p.Const != nil {
				continue
			}
			if !reflect.DeepEqual(got[key], p.Default) {
				t.Errorf("New%s().%s = %v, want schema default %v", name, key, got[key], p.Default)
			}
		}
	}
}
