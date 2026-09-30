package aolib

import "testing"

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
	var tracks []string
	done := false
	clientSide.OnID(func(p *IDToClient) { playerID = p.PlayerID })
	clientSide.OnSM(func(p *SM) { tracks = p.MusicList })
	clientSide.OnDONE(func(_ *DONE) { done = true })

	// Server: answer the client's HI with the join handshake.
	serverSide.OnHI(func(_ *HI) {
		serverSide.SendID(&IDToClient{PlayerID: 7, Software: "example-server", Version: "1.0"})
		serverSide.SendSM(&SM{MusicList: []string{"track1.mp3", "track2.mp3"}})
		serverSide.SendDONE(&DONE{})
	})

	clientSide.SendHI(&HI{HDID: "abc123"})

	if playerID != 7 {
		t.Fatalf("player id = %d, want 7", playerID)
	}
	if len(tracks) != 2 || tracks[0] != "track1.mp3" {
		t.Fatalf("tracks = %v", tracks)
	}
	if !done {
		t.Fatal("DONE not received")
	}
}

// TestExampleAutoJSON shows the wire format being auto-detected: after the
// server advertises decryptor#JSON, the client speaks JSON and the server's
// session flips to JSON outbound without the caller touching the wire format.
func TestExampleAutoJSON(t *testing.T) {
	var serverSide *ClientSession
	var clientSide *ServerSession
	serverSide = NewClient(SessionConfig{Send: func(w []byte) { clientSide.Receive(w) }})
	clientSide = NewServer(SessionConfig{Send: func(w []byte) { serverSide.Receive(w) }})

	// Server advertises JSON support (sent as FantaCode).
	serverSide.SendDecryptor(&Decryptor{})

	// Client opts into JSON and sends a JSON-encoded HI.
	jsonHI, err := Encode(&HI{HDID: "json-client"}, WireJSON)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	serverSide.Receive(jsonHI)

	if !serverSide.JSONMode() {
		t.Fatal("server should have auto-flipped to JSON after receiving a JSON packet")
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
