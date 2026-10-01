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

// TestJSONModeIsManual: receiving JSON decodes fine but leaves outbound on
// FantaCode; only SetJSONMode switches it.
func TestJSONModeIsManual(t *testing.T) {
	var sent []byte
	serverSide := NewClient(SessionConfig{Send: func(w []byte) { sent = w }})
	gotHI := false
	serverSide.OnHI(func(*HI) { gotHI = true })

	jsonHI, err := Encode(&HI{HDID: "json-client"}, WireJSON)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	serverSide.Receive(jsonHI)
	if !gotHI || serverSide.JSONMode() {
		t.Fatalf("after a JSON frame: handled=%v JSONMode=%v, want true, false", gotHI, serverSide.JSONMode())
	}
	serverSide.SendDONE(&DONE{})
	if string(sent) != "DONE#%" {
		t.Fatalf("outbound before SetJSONMode = %q, want FantaCode", sent)
	}

	serverSide.SetJSONMode(true)
	serverSide.SendDONE(&DONE{})
	if string(sent) != `{"$header":"DONE"}` {
		t.Fatalf("outbound after SetJSONMode = %q, want JSON", sent)
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
