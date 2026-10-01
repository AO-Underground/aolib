package aolib

import (
	"errors"
	"testing"
)

func TestDecodeByDirection(t *testing.T) {
	ms := []byte("MS#1#-#Ini#normal#hi#wit#0#0#31#0#0#0#0#0#0##-1###0&0##0#0#0#0#-#-#-#0##%")
	if v, err := DecodeToClient(ms, WireFanta); err != nil {
		t.Fatalf("DecodeToClient: %v", err)
	} else if _, ok := v.(*MSToClient); !ok {
		t.Fatalf("DecodeToClient gave %T, want *MSToClient", v)
	}

	pv := []byte(`{"$header":"PV","player_id":0,"char_id":4}`)
	v, err := DecodeToClient(pv, WireJSON)
	if err != nil {
		t.Fatalf("DecodeToClient JSON: %v", err)
	}
	if p, ok := v.(*PV); !ok || p.CharID != 4 {
		t.Fatalf("DecodeToClient JSON gave %#v", v)
	}

	v, err = DecodeToServer([]byte("CC#0#4##%"), WireFanta)
	if err != nil {
		t.Fatalf("DecodeToServer: %v", err)
	}
	if p, ok := v.(*CC); !ok || p.CharID != 4 {
		t.Fatalf("DecodeToServer gave %#v", v)
	}
}

func TestReadHeader(t *testing.T) {
	for wire, want := range map[string]string{
		"MC#trial.opus#0#%":  "MC",
		"askchaa#%":          "askchaa",
		`{"$header":"DONE"}`: "DONE",
		`{"$header":"PV","player_id":0,"char_id":1}`: "PV",
	} {
		if got, err := ReadHeader([]byte(wire)); err != nil || got != want {
			t.Errorf("ReadHeader(%q) = %q, %v; want %q", wire, got, err, want)
		}
	}
	if _, err := ReadHeader([]byte(`{"char_id":1}`)); err == nil {
		t.Error("ReadHeader accepted JSON without $header")
	}
}

func TestValidate(t *testing.T) {
	if err := Validate(&MSToServer{Character: "Phoenix", Emote: "normal", Message: "hi", Side: SideDef}); err != nil {
		t.Fatalf("Validate(valid MS) = %v", err)
	}
	var verr *ValidationError
	if err := Validate(&ARUP{UpdateType: AreaUpdateType("3")}); !errors.As(err, &verr) {
		t.Fatalf("Validate(bad ARUP) = %v, want *ValidationError", err)
	}
}

func TestIsFullView(t *testing.T) {
	for s, want := range map[Side]bool{SideDef: true, SidePro: true, SideWit: true, SideJud: false} {
		if IsFullView(s) != want {
			t.Errorf("IsFullView(%q) = %v", s, !want)
		}
	}
}
