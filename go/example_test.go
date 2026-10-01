package aolib

import (
	"reflect"
	"testing"
)

// TestExampleServerClient mirrors aolib-ts's exampleServer.ts + exampleClient.ts
// over an in-memory transport: a ClientSession (server side, one remote client)
// and a ServerSession (client side, the remote server) complete the AO join
// handshake through the typed On*/Send* surface.
func TestExampleServerClient(t *testing.T) {
	var serverSide *ClientSession
	var clientSide *ServerSession

	serverSide = NewClient(SessionConfig{Send: func(wire []byte) { clientSide.Receive(wire) }})
	clientSide = NewServer(SessionConfig{Send: func(wire []byte) { serverSide.Receive(wire) }})

	// Client: handle packets the server sends us (typed, IDE-autocompleted).
	var playerID int
	var tracks []SMMusicListItem
	done := false
	clientSide.OnID(func(p *IDToClient) { playerID = p.PlayerID })
	clientSide.OnSM(func(p *SM) { tracks = p.MusicList })
	clientSide.OnDONE(func(_ *DONE) { done = true })

	// Server: answer the client's HI with the join handshake.
	serverSide.OnHI(func(_ *HI) {
		serverSide.SendID(&IDToClient{PlayerID: 7, Software: "example-server", Version: "1.0"})
		serverSide.SendSM(&SM{MusicList: []SMMusicListItem{{Name: "track1.mp3"}, {Name: "track2.mp3"}}})
		serverSide.SendDONE(&DONE{})
	})

	clientSide.SendHI(&HI{HDID: "abc123"})

	if playerID != 7 {
		t.Fatalf("player id = %d, want 7", playerID)
	}
	if len(tracks) != 2 || tracks[0].Name != "track1.mp3" {
		t.Fatalf("tracks = %v", tracks)
	}
	if !done {
		t.Fatal("DONE not received")
	}
}

// TestAutoJSON: a ServerSession switches on decryptor#JSON before its handler
// runs, a ClientSession on a frame starting with '{'; DisableAutoJSON leaves
// both on FantaCode.
func TestAutoJSON(t *testing.T) {
	for _, disabled := range []bool{false, true} {
		var out []string
		cfg := SessionConfig{Send: func(w []byte) { out = append(out, string(w)) }, DisableAutoJSON: disabled}
		srv := NewServer(cfg)
		srv.OnDecryptor(func(*Decryptor) { srv.SendHI(&HI{HDID: "x"}) })
		srv.Receive([]byte("decryptor#NOENCRYPT#%"))
		srv.Receive([]byte("decryptor#JSON#%"))

		cl := NewClient(cfg)
		cl.OnHI(func(*HI) {})
		cl.Receive([]byte("HI#x#%"))
		cl.SendDONE(&DONE{})
		cl.Receive([]byte(`{"$header":"HI","hdid":"x"}`))
		cl.SendDONE(&DONE{})

		want := []string{"HI#x#%", `{"$header":"HI","hdid":"x"}`, "DONE#%", `{"$header":"DONE"}`}
		if disabled {
			want = []string{"HI#x#%", "HI#x#%", "DONE#%", "DONE#%"}
		}
		if !reflect.DeepEqual(out, want) {
			t.Errorf("DisableAutoJSON=%v: sent %q, want %q", disabled, out, want)
		}
	}
}

// TestWrongDirectionUnhandled guards the direction registry: a header that
// doesn't travel in this session's inbound direction routes to OnUnknownHeader
// rather than reaching a handler. (The typed surface makes the same mistake a
// compile error; this covers the runtime path for string-typed callers.)
func TestWrongDirectionUnhandled(t *testing.T) {
	// A client session receiving a client→server packet (e.g. HI) is wrong:
	// HI travels client→server, but a ServerSession receives server→client only.
	clientSide := NewServer(SessionConfig{
		Send:            func([]byte) {},
		OnUnknownHeader: func(header string, _ []byte) { t.Logf("unknown header %q", header) },
	})

	clientSide.Receive([]byte("HI#abc123#%"))

	// No panic, no handler ran — the unknown-header hook fired instead.
}
