// Command example-server demonstrates aolib used from a server: one aolib.Client
// session per connected client. It mirrors aolib-ts's examples/exampleServer.ts.
package main

import (
	"fmt"

	aolib "github.com/AO-Underground/aolib/go/v2"
)

func main() {
	// One session per accepted connection; this demo shows a single one.
	client := aolib.NewClient(aolib.SessionConfig{
		Send: func(wire []byte) { fmt.Printf("<- %s\n", wire) },
		OnUnhandled: func(header string, packet any) {
			fmt.Printf("[aolib] no handler for %s from client: %#v\n", header, packet)
		},
	})

	// Advertise JSON capability (the FantaCrypt-era "decryptor" relic).
	client.SendDecryptor(&aolib.Decryptor{})

	// Handlers — what the server does with packets FROM this client.
	client.OnHI(func(_ *aolib.HI) {
		client.SendID(&aolib.IDToClient{PlayerID: 1, Software: "example-server", Version: "1.0"})
		client.SendSM(&aolib.SM{MusicList: []aolib.SMMusicListItem{{Name: "track1.mp3"}, {Name: "track2.mp3"}}})
		client.SendDONE(&aolib.DONE{})
	})
	client.OnCC(func(p *aolib.CC) {
		client.SendPV(&aolib.PV{PlayerID: 1, CharID: p.CharID})
	})
}
