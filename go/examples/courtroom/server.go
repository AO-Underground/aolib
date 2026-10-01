package main

import aolib "github.com/AO-Underground/aolib/go/v2"

// Server is a one-area AO server: it runs the join handshake, hands out
// characters, and plays every MC request to everyone connected.
type Server struct {
	chars   []string
	areas   []string
	music   []string
	clients []*aolib.ClientSession
	taken   map[int]*aolib.ClientSession
}

func NewServer(chars, areas, music []string) *Server {
	return &Server{chars: chars, areas: areas, music: music, taken: map[int]*aolib.ClientSession{}}
}

// Accept handles a new connection: send delivers one frame to that client, and
// the returned function takes each frame the client sends.
func (s *Server) Accept(send func([]byte)) func([]byte) {
	c := aolib.NewClient(aolib.SessionConfig{Send: send})
	playerID := len(s.clients)
	s.clients = append(s.clients, c)

	c.OnHI(func(*aolib.HI) {
		c.SendID(&aolib.IDToClient{PlayerID: playerID, Software: "courtroom-example", Version: "1.0"})
	})
	c.OnID(func(*aolib.IDToServer) {
		c.SendPN(&aolib.PN{PlayerCount: len(s.clients), MaxPlayers: 100, ServerDescription: "aolib example"})
		c.SendFL(&aolib.FL{Features: []string{"yellowtext", "y_offset", "looping_sfx", "effects"}})
	})
	c.OnAskchaa(func(*aolib.Askchaa) {
		c.SendSI(&aolib.SI{CharCount: len(s.chars), MusCount: len(s.areas) + len(s.music)})
	})
	c.OnRC(func(*aolib.RC) {
		sc := &aolib.SC{}
		for _, name := range s.chars {
			sc.CharData = append(sc.CharData, aolib.SCCharDataItem{Name: name})
		}
		c.SendSC(sc)
	})
	c.OnRM(func(*aolib.RM) {
		sm := &aolib.SM{}
		for _, name := range append(append([]string(nil), s.areas...), s.music...) {
			sm.MusicList = append(sm.MusicList, aolib.SMMusicListItem{Name: name})
		}
		c.SendSM(sm)
	})
	c.OnRD(func(*aolib.RD) {
		c.SendCharsCheck(s.charsCheck())
		c.SendDONE(&aolib.DONE{})
	})
	c.OnCC(func(p *aolib.CC) {
		if p.CharID < 0 || p.CharID >= len(s.chars) || s.taken[p.CharID] != nil {
			return
		}
		s.taken[p.CharID] = c
		c.SendPV(&aolib.PV{PlayerID: playerID, CharID: p.CharID})
		for _, peer := range s.clients {
			peer.SendCharsCheck(s.charsCheck())
		}
	})
	c.OnMC(func(p *aolib.MCToServer) {
		for _, peer := range s.clients {
			peer.SendMC(&aolib.MCToClient{Name: p.Name, CharID: p.CharID, Showname: p.Showname, Effects: p.Effects})
		}
	})

	c.SendDecryptor(&aolib.Decryptor{Value: "JSON"})
	return func(wire []byte) {
		// A client opts into JSON by sending JSON.
		if len(wire) > 0 && wire[0] == '{' {
			c.SetJSONMode(true)
		}
		c.Receive(wire)
	}
}

func (s *Server) charsCheck() *aolib.CharsCheck {
	cc := &aolib.CharsCheck{}
	for id := range s.chars {
		state := aolib.CharAvailabilityFree
		if s.taken[id] != nil {
			state = aolib.CharAvailabilityTaken
		}
		cc.Taken = append(cc.Taken, state)
	}
	return cc
}
