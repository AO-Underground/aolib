package aolib

// ClientSession is the server-side view: it represents one remote client.
// Send ships server→client packets; On registers handlers for client→server
// packets. Each method is typed, so wrong-direction calls don't compile and
// the IDE autocompletes the header. (Generated from aolib-meta schemas by
// cmd/aolib-gen; regenerate rather than hand-editing.)

// SendID answers the join handshake with a player slot.
func (c *ClientSession) SendID(p *IDClient) { c.s.send(p) }

// SendMC announces a music or area change.
func (c *ClientSession) SendMC(p *MCToClient) { c.s.send(p) }

// SendBB shows a popup (bulletin).
func (c *ClientSession) SendBB(p *BB) { c.s.send(p) }

// SendSM sends the music+area list.
func (c *ClientSession) SendSM(p *SM) { c.s.send(p) }

// SendDONE ends the join handshake.
func (c *ClientSession) SendDONE(p *DONE) { c.s.send(p) }

// SendPV forces a character choice.
func (c *ClientSession) SendPV(p *PV) { c.s.send(p) }

// SendFL advertises supported features.
func (c *ClientSession) SendFL(p *FL) { c.s.send(p) }

// SendDecryptor advertises JSON capability (the FantaCrypt-era "decryptor"
// relic reused as a capability signal).
func (c *ClientSession) SendDecryptor(p *Decryptor) { c.s.send(p) }

// OnHI handles a client hardware-ID announcement.
func (c *ClientSession) OnHI(h func(*HI)) { c.s.on("HI", func(p any) { h(p.(*HI)) }) }

// OnCC handles a client character pick.
func (c *ClientSession) OnCC(h func(*CC)) { c.s.on("CC", func(p any) { h(p.(*CC)) }) }

// OnMC handles a client music/area change request.
func (c *ClientSession) OnMC(h func(*MCFromClient)) { c.s.on("MC", func(p any) { h(p.(*MCFromClient)) }) }

// OnMS handles an in-character message.
func (c *ClientSession) OnMS(h func(*MSPacket)) { c.s.on("MS", func(p any) { h(p.(*MSPacket)) }) }
