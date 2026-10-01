package main

import (
	"strings"
	"testing"
)

func TestClientJoinsAndHearsOwnMusic(t *testing.T) {
	for _, tc := range []struct {
		name string
		json bool
	}{{"fanta", false}, {"json", true}} {
		t.Run(tc.name, func(t *testing.T) {
			srv := NewServer([]string{"Phoenix", "Edgeworth"}, []string{"Courtroom"}, []string{"Music", "trial.opus"})
			net := &Network{}
			c := net.Connect(srv, tc.json, "Edgeworth")
			net.Run()

			if !c.Joined || c.CharID != 1 {
				t.Fatalf("joined=%v char=%d, want joined as char 1", c.Joined, c.CharID)
			}

			c.Play("trial.opus")
			net.Run()

			if len(c.Heard) != 1 || c.Heard[0].Name != "trial.opus" || c.Heard[0].CharID != 1 {
				t.Fatalf("heard %+v, want trial.opus from char 1", c.Heard)
			}

			var headers []string
			for i, f := range net.Frames {
				isJSON := strings.HasPrefix(f.Wire, "{")
				// The server's opening decryptor precedes negotiation, so it is always FantaCode.
				if want := tc.json && i > 0; isJSON != want {
					t.Errorf("frame %d %q: JSON=%v, want %v", i, f.Wire, isJSON, want)
				}
				dir := "<"
				if f.ToServer {
					dir = ">"
				}
				headers = append(headers, dir+header(f.Wire))
			}
			want := "<decryptor >HI <ID >ID <PN <FL >askchaa <SI >RC <SC >RM <SM >RD <CharsCheck <DONE >CC <PV <CharsCheck >MC <MC"
			if got := strings.Join(headers, " "); got != want {
				t.Errorf("handshake:\n got  %s\n want %s", got, want)
			}
		})
	}
}

func header(wire string) string {
	if strings.HasPrefix(wire, "{") {
		h := wire[strings.Index(wire, `"$header":"`)+len(`"$header":"`):]
		return h[:strings.Index(h, `"`)]
	}
	return strings.SplitN(wire, "#", 2)[0]
}
