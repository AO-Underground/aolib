// Command courtroom runs an aolib server and two clients, one speaking JSON
// and one FantaCode, over an in-memory network. Both join, and each plays a
// track that the server plays for everyone.
package main

import (
	"fmt"
	"strings"
)

func main() {
	srv := NewServer([]string{"Phoenix", "Edgeworth"}, []string{"Courtroom"}, []string{"Music", "trial.opus", "objection.opus"})
	net := &Network{OnFrame: func(f Frame) {
		dir := "<-"
		if f.ToServer {
			dir = "->"
		}
		fmt.Printf("[conn %d] %s %s\n", f.Conn, dir, strings.TrimSuffix(f.Wire, "%"))
	}}

	phoenix := net.Connect(srv, true, "Phoenix")
	edgeworth := net.Connect(srv, false, "Edgeworth")
	net.Run()

	phoenix.Play("trial.opus")
	edgeworth.Play("objection.opus")
	net.Run()

	for _, c := range []*Client{phoenix, edgeworth} {
		fmt.Printf("player %d joined=%v char=%d heard:", c.PlayerID, c.Joined, c.CharID)
		for _, mc := range c.Heard {
			fmt.Printf(" %s (char %d)", mc.Name, mc.CharID)
		}
		fmt.Println()
	}
}
