package aolib

import "testing"

// TestExampleServerClient walks a minimal AO handshake through two Sessions —
// a server-side session (one connected client) and a client-side session (the
// server) — over an in-memory transport. It exercises the whole public
// surface: NewServer/NewClient, Send, Receive, and On (typed handlers).
func TestExampleServerClient(t *testing.T) {
	var server, client *Session

	server = NewServer(SessionOptions{
		Send: func(wire []byte) { client.Receive(wire) },
		OnUnhandled: func(header string, _ any) {
			t.Logf("server: unhandled %s", header)
		},
	})
	client = NewClient(SessionOptions{
		Send: func(wire []byte) { server.Receive(wire) },
		OnUnhandled: func(header string, _ any) {
			t.Logf("client: unhandled %s", header)
		},
	})

	// Client: handle what the server sends us.
	var playerID int
	var tracks []string
	done := false
	client.On("ID", func(p any) { playerID = p.(*IDClient).PlayerNumber })
	client.On("SM", func(p any) { tracks = p.(*SM).Items })
	client.On("DONE", func(p any) { done = true })

	// Server: answer the client's HI with the join handshake.
	server.On("HI", func(_ any) {
		server.Send(&IDClient{PlayerNumber: 7, Software: "example-server", Version: "1.0"})
		server.Send(&SM{Items: []string{"track1.mp3", "track2.mp3"}})
		server.Send(&DONE{})
	})

	client.Send(&HI{HDID: "abc123"})

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

// TestExampleAutoJSON shows the wire format being auto-detected: the client
// speaks JSON (after the server advertises decryptor#JSON), and the server's
// session flips to JSON outbound without the caller touching the wire format.
func TestExampleAutoJSON(t *testing.T) {
	var server, client *Session
	server = NewServer(SessionOptions{Send: func(w []byte) { client.Receive(w) }})
	client = NewClient(SessionOptions{Send: func(w []byte) { server.Receive(w) }})

	// Server advertises JSON support (sent as FantaCode).
	server.AdvertiseJSON()

	// Client opts into JSON and sends a JSON-encoded HI.
	jsonHI, err := Encode(&HI{HDID: "json-client"}, WireJSON)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	server.Receive(jsonHI)

	if !server.JSONMode() {
		t.Fatal("server should have auto-flipped to JSON after receiving a JSON packet")
	}
}
