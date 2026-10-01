package main

import aolib "github.com/AO-Underground/aolib/go/v2"

// Client follows AO2-Client's join sequence: decryptor, HI, ID, askchaa, RC,
// RM, RD, then picks its character once the server sends DONE.
type Client struct {
	Session  *aolib.ServerSession
	PlayerID int
	CharID   int
	Joined   bool
	Heard    []*aolib.MCToClient

	want  string
	chars []string
}

// NewClient returns a client that will join as character want; send delivers
// one frame to the server.
func NewClient(send func([]byte), json bool, want string) *Client {
	c := &Client{want: want, CharID: -1}
	// A FantaCode-only client opts out of JSON negotiation.
	s := aolib.NewServer(aolib.SessionConfig{Send: send, DisableAutoJSON: !json})
	c.Session = s

	s.OnDecryptor(func(*aolib.Decryptor) { s.SendHI(&aolib.HI{HDID: "example-hdid"}) })
	s.OnID(func(p *aolib.IDToClient) {
		c.PlayerID = p.PlayerID
		s.SendID(&aolib.IDToServer{Software: "AO2", Version: "2.11.0"})
	})
	s.OnPN(func(*aolib.PN) { s.SendAskchaa(&aolib.Askchaa{}) })
	s.OnSI(func(*aolib.SI) { s.SendRC(&aolib.RC{}) })
	s.OnSC(func(p *aolib.SC) {
		c.chars = c.chars[:0]
		for _, ch := range p.CharData {
			c.chars = append(c.chars, ch.Name)
		}
		s.SendRM(&aolib.RM{})
	})
	s.OnSM(func(*aolib.SM) { s.SendRD(&aolib.RD{}) })
	s.OnDONE(func(*aolib.DONE) {
		for id, name := range c.chars {
			if name == c.want {
				s.SendCC(&aolib.CC{PlayerID: c.PlayerID, CharID: id})
				return
			}
		}
	})
	s.OnPV(func(p *aolib.PV) {
		c.CharID = p.CharID
		c.Joined = true
	})
	s.OnMC(func(p *aolib.MCToClient) { c.Heard = append(c.Heard, p) })
	return c
}

// Play asks the server to play a track.
func (c *Client) Play(track string) {
	c.Session.SendMC(&aolib.MCToServer{Name: track, CharID: c.CharID})
}
