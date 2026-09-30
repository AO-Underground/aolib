package aolib

// ServerSession is the client-side view: it represents the remote server.
// Send ships client→server packets; On registers handlers for server→client
// packets. Each method is typed, so wrong-direction calls don't compile and
// the IDE autocompletes the header. (Generated from aolib-meta schemas by
// cmd/aolib-gen; regenerate rather than hand-editing.)

// SendHI announces the client's hardware ID (HDID).
func (s *ServerSession) SendHI(p *HI) { s.s.send(p) }

// SendCC selects a character.
func (s *ServerSession) SendCC(p *CC) { s.s.send(p) }

// SendMC requests a music or area change.
func (s *ServerSession) SendMC(p *MCFromClient) { s.s.send(p) }

// OnID handles the server's ID handshake (player slot assignment).
func (s *ServerSession) OnID(h func(*IDClient)) { s.s.on("ID", func(p any) { h(p.(*IDClient)) }) }

// OnMC handles a server music/area change announcement.
func (s *ServerSession) OnMC(h func(*MCToClient)) { s.s.on("MC", func(p any) { h(p.(*MCToClient)) }) }

// OnBB handles a server popup (bulletin).
func (s *ServerSession) OnBB(h func(*BB)) { s.s.on("BB", func(p any) { h(p.(*BB)) }) }

// OnSM handles the server's music+area list.
func (s *ServerSession) OnSM(h func(*SM)) { s.s.on("SM", func(p any) { h(p.(*SM)) }) }

// OnDONE handles the end-of-join signal.
func (s *ServerSession) OnDONE(h func(*DONE)) { s.s.on("DONE", func(p any) { h(p.(*DONE)) }) }

// OnPV handles a forced character choice.
func (s *ServerSession) OnPV(h func(*PV)) { s.s.on("PV", func(p any) { h(p.(*PV)) }) }

// OnFL handles a server feature list.
func (s *ServerSession) OnFL(h func(*FL)) { s.s.on("FL", func(p any) { h(p.(*FL)) }) }

// OnDecryptor handles the JSON capability advertisement.
func (s *ServerSession) OnDecryptor(h func(*Decryptor)) {
	s.s.on("decryptor", func(p any) { h(p.(*Decryptor)) })
}
