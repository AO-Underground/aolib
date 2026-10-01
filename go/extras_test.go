package aolib

import (
	"reflect"
	"testing"
)

func TestJSONKeyOrderAndExtras(t *testing.T) {
	raw, err := Encode(&PV{PlayerID: 3, CharID: 7, Extras: map[string]any{"zeta": 1, "alpha": map[string]any{"a": true}}}, WireJSON)
	if err != nil {
		t.Fatal(err)
	}
	want := `{"$header":"PV","player_id":3,"_cid":"CID","char_id":7,"alpha":{"a":true},"zeta":1}`
	if string(raw) != want {
		t.Fatalf("JSON = %s\nwant   %s", raw, want)
	}

	if raw, err = Encode(&PV{PlayerID: 3, CharID: 7, Extras: map[string]any{"blips": "male"}}, WireFanta); err != nil || string(raw) != "PV#3#CID#7#%" {
		t.Fatalf("FantaCode = %s, %v; want extras dropped", raw, err)
	}

	for _, bad := range []string{"char_id", "$x"} {
		if _, err := Encode(&PV{Extras: map[string]any{bad: 1}}, WireJSON); err == nil {
			t.Errorf("Extras key %q accepted, want collision error", bad)
		}
	}
}

func TestJSONDecodeKeepsExtras(t *testing.T) {
	v, err := DecodeToClient([]byte(`{"$header":"PV","player_id":0,"char_id":1,"extra":"junk","n":{"a":1}}`), WireJSON)
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]any{"extra": "junk", "n": map[string]any{"a": float64(1)}}
	if got := v.(*PV).Extras; !reflect.DeepEqual(got, want) {
		t.Fatalf("Extras = %#v, want %#v", got, want)
	}

	v, err = DecodeToClient([]byte(`{"$header":"PV","player_id":0,"char_id":1}`), WireJSON)
	if err != nil || v.(*PV).Extras != nil {
		t.Fatalf("no extras: %#v, %v", v, err)
	}
	if v, err = DecodeToClient([]byte("PV#0#CID#1#extra#%"), WireFanta); err != nil || v.(*PV).Extras != nil {
		t.Fatalf("FantaCode never produces Extras: %#v, %v", v, err)
	}
}
