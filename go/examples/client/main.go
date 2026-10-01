// Command example-client demonstrates aolib used from a client: one
// aolib.Server session representing the remote server. It mirrors aolib-ts's
// examples/exampleClient.ts. Read top-to-bottom — it is documentation that
// also compiles.
package main

import (
	"fmt"

	aolib "github.com/AO-Underground/aolib/go"
)

func main() {
	var playerID int

	// One session, representing the server we're talking to.
	server := aolib.NewServer(aolib.SessionConfig{
		// In a real client this is the WebSocket send.
		Send: func(wire []byte) { fmt.Printf("-> %s\n", wire) },
		OnUnhandled: func(header string, packet any) {
			fmt.Printf("[aolib] no handler for %s: %#v\n", header, packet)
		},
	})

	// Handlers for packets the SERVER sends us — typed, IDE-autocompleted.
	server.OnID(func(p *aolib.IDToClient) { playerID = p.PlayerID })
	server.OnMC(func(p *aolib.MCToClient) { fmt.Printf("play %q\n", p.Name) })
	server.OnBB(func(p *aolib.BB) { fmt.Printf("popup: %s\n", p.Message) })
	server.OnSM(func(p *aolib.SM) { fmt.Printf("music list: %v\n", p.MusicList) })
	server.OnDONE(func(_ *aolib.DONE) { fmt.Println("handshake done") })

	// Send packets TO the server. The compiler enforces the C2S shape.
	server.SendHI(&aolib.HI{HDID: "stub-hwid"})
	server.SendCC(&aolib.CC{CharID: 0})

	_ = playerID
}
