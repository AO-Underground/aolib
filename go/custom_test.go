package aolib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

type xcPacket struct {
	Title  string     `json:"title"`
	Count  int        `json:"count"`
	Open   bool       `json:"open"`
	Mod    string     `json:"mod"`
	Side   string     `json:"side"`
	Offset Offset     `json:"offset"`
	Rows   [][]string `json:"rows"`
}

// TestCustomConformance pins schema-driven custom packets to the same bytes
// as aolib-ts (conformance/custom.json).
func TestCustomConformance(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join("..", "conformance", "custom.json"))
	if err != nil {
		t.Skipf("fixture not available: %v", err)
	}
	var fixture struct {
		Schema  json.RawMessage `json:"schema"`
		Vectors []struct {
			ID    string          `json:"id"`
			Fanta string          `json:"fanta"`
			JSON  json.RawMessage `json:"json"`
		} `json:"vectors"`
	}
	if err := json.Unmarshal(raw, &fixture); err != nil {
		t.Fatal(err)
	}
	RegisterPacket[xcPacket]("XC", PacketOptions[xcPacket]{Schema: fixture.Schema})
	c := customPackets["XC"]
	for _, v := range fixture.Vectors {
		t.Run(v.ID, func(t *testing.T) {
			var want bytes.Buffer
			if err := json.Compact(&want, v.JSON); err != nil {
				t.Fatal(err)
			}
			fromJSON, _, err := c.decode(want.Bytes(), true)
			if err != nil {
				t.Fatalf("decode json: %v", err)
			}
			fromFanta, _, err := c.decode([]byte(v.Fanta), false)
			if err != nil {
				t.Fatalf("decode fanta: %v", err)
			}
			if !reflect.DeepEqual(fromJSON, fromFanta) {
				t.Fatalf("formats disagree:\n json:  %#v\n fanta: %#v", fromJSON, fromFanta)
			}
			if got, err := c.encode(fromJSON, WireFanta); err != nil || string(got) != v.Fanta {
				t.Errorf("fanta = %s, %v\n want  %s", got, err, v.Fanta)
			}
			if got, err := c.encode(fromJSON, WireJSON); err != nil || string(got) != want.String() {
				t.Errorf("json = %s, %v\n want %s", got, err, want.String())
			}
		})
	}
}

type ping struct {
	Seq    int            `json:"seq"`
	Note   string         `json:"note,omitempty"`
	Extras map[string]any `json:"-"`
}

type rows struct {
	Rows [][]string `json:"rows"`
}

type pair struct{ A, B string }

func init() {
	RegisterPacket[ping]("PING", PacketOptions[ping]{Schema: []byte(`{
		"type": "object",
		"properties": {"seq": {"type": "integer"}, "note": {"type": "string", "default": ""}},
		"required": ["seq"],
		"additionalProperties": false
	}`)})
	RegisterPacket[rows]("ROWS", PacketOptions[rows]{})
	RegisterPacket[pair]("PAIR", PacketOptions[pair]{
		Schema: []byte(`{"type": "object", "properties": {"A": {"type": "string"}, "B": {"type": "string"}}, "required": ["A", "B"]}`),
		Fanta: &Fanta[pair]{
			Encode: func(p pair) ([]string, error) { return []string{EscapeFanta(p.A) + "|" + EscapeFanta(p.B)}, nil },
			Decode: func(args []string) (pair, error) {
				a, b, _ := strings.Cut(strings.Join(args, "#"), "|")
				return pair{UnescapeFanta(a), UnescapeFanta(b)}, nil
			},
		},
		JSON: &JSONForm[pair]{
			Encode: func(p pair) ([]byte, error) { return json.Marshal(map[string]any{"pair": []string{p.A, p.B}}) },
			Decode: func(raw []byte) (pair, error) {
				var v struct{ Pair [2]string }
				err := json.Unmarshal(raw, &v)
				return pair{v.Pair[0], v.Pair[1]}, err
			},
		},
	})
}

func customLink(t *testing.T) (*ClientSession, *ServerSession, *[]string, *[]any, *[]string) {
	t.Helper()
	var sent []string
	var got []any
	var problems []string
	srv := NewServer(SessionConfig{
		OnDecodeError:   func(h string, err error, _ []byte) { problems = append(problems, "decode "+h+": "+err.Error()) },
		OnUnknownHeader: func(h string, _ []byte) { problems = append(problems, "unknown "+h) },
	})
	cl := NewClient(SessionConfig{Send: func(w []byte) { sent = append(sent, string(w)); srv.Receive(w) }})
	for _, h := range []string{"PING", "ROWS", "PAIR"} {
		if err := srv.OnCustom(h, func(p any) { got = append(got, p) }); err != nil {
			t.Fatal(err)
		}
	}
	return cl, srv, &sent, &got, &problems
}

func TestCustomSchemaPacket(t *testing.T) {
	cl, _, sent, got, problems := customLink(t)
	for _, js := range []bool{false, true} {
		cl.SetJSONMode(js)
		if err := cl.SendCustom("PING", ping{Seq: 7, Extras: map[string]any{"trace": "x"}}); err != nil {
			t.Fatal(err)
		}
	}
	wantSent := []string{"PING#7##%", `{"$header":"PING","seq":7,"note":"","trace":"x"}`}
	wantGot := []any{ping{Seq: 7}, ping{Seq: 7, Extras: map[string]any{"trace": "x"}}}
	if !reflect.DeepEqual(*sent, wantSent) || !reflect.DeepEqual(*got, wantGot) || len(*problems) > 0 {
		t.Fatalf("sent %q\n got %#v\n problems %q", *sent, *got, *problems)
	}

	if err := cl.SendCustom("PING", "not a ping"); err == nil {
		t.Error("wrong payload type accepted")
	}
}

func TestCustomSchemaValidation(t *testing.T) {
	_, srv, _, _, problems := customLink(t)
	srv.Receive([]byte(`{"$header":"PING","seq":"seven"}`))
	srv.Receive([]byte("PING#x#%"))
	if len(*problems) != 2 || !strings.HasPrefix((*problems)[0], "decode PING") || !strings.HasPrefix((*problems)[1], "decode PING") {
		t.Fatalf("problems = %q", *problems)
	}
}

func TestCustomJSONOnlyPacket(t *testing.T) {
	cl, srv, sent, got, problems := customLink(t)
	if err := cl.SendCustom("ROWS", rows{Rows: [][]string{{"a"}}}); err == nil || !strings.Contains(err.Error(), "JSON-only") {
		t.Fatalf("FantaCode send: %v, want JSON-only error", err)
	}
	cl.SetJSONMode(true)
	if err := cl.SendCustom("ROWS", rows{Rows: [][]string{{"a", "b"}, {}}}); err != nil {
		t.Fatal(err)
	}
	srv.Receive([]byte("ROWS#a#%"))
	if fmt.Sprint(*sent) != `[{"$header":"ROWS","rows":[["a","b"],[]]}]` {
		t.Errorf("sent %q", *sent)
	}
	if !reflect.DeepEqual(*got, []any{rows{Rows: [][]string{{"a", "b"}, {}}}}) || !reflect.DeepEqual(*problems, []string{"unknown ROWS"}) {
		t.Errorf("got %#v, problems %q", *got, *problems)
	}
}

func TestCustomOverrides(t *testing.T) {
	cl, _, sent, got, problems := customLink(t)
	for _, js := range []bool{false, true} {
		cl.SetJSONMode(js)
		if err := cl.SendCustom("PAIR", pair{A: "x#y", B: "z"}); err != nil {
			t.Fatal(err)
		}
	}
	want := []string{"PAIR#x<num>y|z#%", `{"$header":"PAIR","pair":["x#y","z"]}`}
	if !reflect.DeepEqual(*sent, want) || !reflect.DeepEqual(*got, []any{pair{"x#y", "z"}, pair{"x#y", "z"}}) || len(*problems) > 0 {
		t.Fatalf("sent %q, got %#v, problems %q", *sent, *got, *problems)
	}
}

func TestRegisterPacketRejectsSpecHeaders(t *testing.T) {
	defer func() {
		if r := recover(); r == nil || !strings.Contains(fmt.Sprint(r), "Extras") {
			t.Fatalf("panic = %v, want spec-header panic", r)
		}
	}()
	RegisterPacket[ping]("MS", PacketOptions[ping]{})
}

func TestSendCustomUnregistered(t *testing.T) {
	cl := NewClient(SessionConfig{Send: func([]byte) {}})
	if err := cl.SendCustom("NOPE", ping{}); err == nil || !strings.Contains(err.Error(), "RegisterPacket") {
		t.Fatalf("err = %v", err)
	}
}

type note struct {
	Text   string         `json:"text,omitempty"`
	Count  int            `json:",omitempty"`
	Skip   string         `json:"-"`
	Extras map[string]any `json:"-"`
}

func TestCustomSchemalessFieldsAndExtras(t *testing.T) {
	RegisterPacket("NT", PacketOptions[note]{})
	var got []any
	srv := NewServer(SessionConfig{})
	if err := srv.OnCustom("NT", func(p any) { got = append(got, p) }); err != nil {
		t.Fatal(err)
	}
	srv.Receive([]byte(`{"$header":"NT","text":"hello","Count":2,"Skip":"x","other":1}`))
	want := []any{note{Text: "hello", Count: 2, Extras: map[string]any{"Skip": "x", "other": float64(1)}}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v\nwant %#v", got, want)
	}
}

func TestCustomUnhandled(t *testing.T) {
	var unhandled []string
	srv := NewServer(SessionConfig{OnUnhandled: func(h string, _ any) { unhandled = append(unhandled, h) }})
	srv.Receive([]byte("PING#1#%"))
	if !reflect.DeepEqual(unhandled, []string{"PING"}) {
		t.Fatalf("unhandled = %q", unhandled)
	}
}

func TestOnCustomRejectsSpecHeaders(t *testing.T) {
	if err := NewServer(SessionConfig{}).OnCustom("BB", func(any) {}); err == nil || !strings.Contains(err.Error(), "spec packet") {
		t.Fatalf("err = %v", err)
	}
}
