package aolib

import (
	"errors"
	"testing"
)

func TestDecodeRejectsSchemaViolations(t *testing.T) {
	cases := map[string]struct {
		raw  string
		mode WireMode
	}{
		"unknown enum name":      {`{"$header":"RT","animation":"bogus","name":""}`, WireJSON},
		"extra field":            {`{"$header":"CC","player_id":1,"char_id":2,"char_password":"","extra":1}`, WireJSON},
		"custom RT without name": {`{"$header":"RT","animation":"custom"}`, WireJSON},
		"HP out of range":        {`{"$header":"HP","bar":"defense","value":11}`, WireJSON},
		"unknown enum wire int":  {"HP#9#5#%", WireFanta},
	}
	for name, c := range cases {
		_, err := Decode([]byte(c.raw), c.mode)
		var verr *ValidationError
		if !errors.As(err, &verr) {
			t.Errorf("%s: Decode(%s) error = %v, want *ValidationError", name, c.raw, err)
		}
	}
}

func TestDecodeJSONAppliesDefaults(t *testing.T) {
	v, err := Decode([]byte(`{"$header":"ZZ","reason":"help"}`), WireJSON)
	if err != nil {
		t.Fatalf("Decode: %v", err)
	}
	if got := v.(*ZZToServer); got.ReportedPlayerID != -1 {
		t.Fatalf("ReportedPlayerID = %d, want -1", got.ReportedPlayerID)
	}
}

func TestDecodeJSONAcceptsLegacyHeaderKey(t *testing.T) {
	if _, err := Decode([]byte(`{"header":"CH","char_id":3}`), WireJSON); err != nil {
		t.Fatalf("Decode: %v", err)
	}
}

func TestEncodeRejectsInvalidPacket(t *testing.T) {
	_, err := Encode(&HPToServer{Bar: PenaltyBarDefense, Value: 11}, WireFanta)
	var verr *ValidationError
	if !errors.As(err, &verr) || verr.Header != "HP" {
		t.Fatalf("Encode error = %v, want *ValidationError for HP", err)
	}
}

func TestEncodeFillsEmptyEnumDefaults(t *testing.T) {
	raw, err := Encode(&MCToClient{Name: "x", CharID: 1}, WireFanta)
	if err != nil {
		t.Fatalf("Encode: %v", err)
	}
	if string(raw) != "MC#x#1##0#0#0#%" {
		t.Fatalf("Encode = %q", raw)
	}
}

func TestSessionReportsValidationErrors(t *testing.T) {
	var decodeErr, encodeErr error
	s := NewServer(SessionConfig{
		Send:          func([]byte) {},
		OnDecodeError: func(_ string, err error, _ []byte) { decodeErr = err },
		OnEncodeError: func(_ string, err error, _ any) { encodeErr = err },
	})
	s.Receive([]byte("HP#9#5#%"))
	s.SendHP(&HPToServer{Bar: PenaltyBarDefense, Value: 11})
	var verr *ValidationError
	if !errors.As(decodeErr, &verr) {
		t.Errorf("OnDecodeError got %v, want *ValidationError", decodeErr)
	}
	if !errors.As(encodeErr, &verr) {
		t.Errorf("OnEncodeError got %v, want *ValidationError", encodeErr)
	}
}
