package main

// Frame is one packet on the in-memory network.
type Frame struct {
	ToServer bool
	Conn     int
	Wire     string
}

// Network stands in for WebSocket connections: frames queue up and Run
// delivers them in order on the calling goroutine.
type Network struct {
	Frames  []Frame
	OnFrame func(Frame)
	queue   []func()
	conns   int
}

// Connect opens a connection from a new client to srv.
func (n *Network) Connect(srv *Server, json bool, char string) *Client {
	conn := n.conns
	n.conns++
	var toServer func([]byte)
	var cl *Client
	cl = NewClient(n.link(true, conn, func(w []byte) { toServer(w) }), json, char)
	toServer = srv.Accept(n.link(false, conn, func(w []byte) { cl.Session.Receive(w) }))
	return cl
}

func (n *Network) link(toServer bool, conn int, deliver func([]byte)) func([]byte) {
	return func(wire []byte) {
		f := Frame{ToServer: toServer, Conn: conn, Wire: string(wire)}
		n.Frames = append(n.Frames, f)
		if n.OnFrame != nil {
			n.OnFrame(f)
		}
		n.queue = append(n.queue, func() { deliver([]byte(f.Wire)) })
	}
}

// Run delivers queued frames, including any sent in response, until none remain.
func (n *Network) Run() {
	for len(n.queue) > 0 {
		next := n.queue[0]
		n.queue = n.queue[1:]
		next()
	}
}
