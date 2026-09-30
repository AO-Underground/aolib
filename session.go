package aolib

import "fmt"

// SessionConfig configures a session. Send is the only required hook; the
// rest are observability callbacks that fire instead of panicking or
// returning errors from Receive. A nil hook is a no-op.
type SessionConfig struct {
	// Send delivers one encoded wire packet to the transport (required).
	Send func(wire []byte)

	// OnMalformedFrame fires when inbound bytes can't be read as a packet.
	OnMalformedFrame func(err error, wire []byte)
	// OnUnknownHeader fires when the header isn't in this session's inbound
	// registry (i.e. it doesn't travel in the direction this role receives).
	OnUnknownHeader func(header string, wire []byte)
	// OnDecodeError fires when a registered header fails to decode.
	OnDecodeError func(header string, err error, wire []byte)
	// OnUnhandled fires when a packet decoded fine but no handler was
	// registered for its header.
	OnUnhandled func(header string, packet any)
	// OnHandlerError fires when a registered handler panics.
	OnHandlerError func(header string, err error, packet any)
}

// role names the remote party a session represents, matching aolib-ts.
type role int

const (
	// roleServer: the session represents a remote *server* (client-side code).
	roleServer role = iota
	// roleClient: the session represents one remote *client* (server-side code).
	roleClient
)

// inboundDecoders returns the decode table for the direction this role
// receives from: a remote server sends us server→client packets; a remote
// client sends us client→server packets.
func (r role) inboundDecoders() map[string]decoder {
	if r == roleServer {
		return s2cDecoders
	}
	return c2sDecoders
}

// session is the shared core. ServerSession/ClientSession are thin typed
// wrappers over it; callers never touch this type directly.
type session struct {
	cfg      SessionConfig
	role     role
	jsonMode bool
	handlers map[string]func(any)
}

func newSession(cfg SessionConfig, r role) *session {
	return &session{cfg: cfg, role: r, handlers: make(map[string]func(any))}
}

// on registers an untyped handler for a header. The typed wrappers call it;
// the type assertion lives in the generated method so wrong-parameter types
// never compile.
func (s *session) on(header string, h func(any)) { s.handlers[header] = h }

// send encodes a typed packet using the session's current wire mode and hands
// it to the transport. A nil Send or an encode failure drops the packet.
func (s *session) send(p Outgoing) {
	mode := WireFanta
	if s.jsonMode {
		mode = WireJSON
	}
	raw, err := Encode(p, mode)
	if err != nil || s.cfg.Send == nil {
		return
	}
	s.cfg.Send(raw)
}

// receive feeds one inbound wire packet and never panics: every failure mode
// routes to exactly one SessionConfig hook.
func (s *session) receive(raw []byte) {
	mode := WireFanta
	if len(raw) > 0 && raw[0] == '{' {
		mode = WireJSON
		s.jsonMode = true
	}
	header, body, err := parseFrame(raw, mode)
	if err != nil {
		if s.cfg.OnMalformedFrame != nil {
			s.cfg.OnMalformedFrame(err, raw)
		}
		return
	}
	dec, ok := s.role.inboundDecoders()[header]
	if !ok {
		if s.cfg.OnUnknownHeader != nil {
			s.cfg.OnUnknownHeader(header, raw)
		}
		return
	}
	p, err := dec(body)
	if err != nil {
		if s.cfg.OnDecodeError != nil {
			s.cfg.OnDecodeError(header, err, raw)
		}
		return
	}
	s.dispatch(header, p)
}

// dispatch runs a typed handler (or the unhandled hook), recovering panics so
// a handler bug can't take the whole connection down.
func (s *session) dispatch(header string, p any) {
	h, ok := s.handlers[header]
	if !ok {
		if s.cfg.OnUnhandled != nil {
			s.cfg.OnUnhandled(header, p)
		}
		return
	}
	func() {
		defer func() {
			if r := recover(); r != nil {
				if s.cfg.OnHandlerError != nil {
					s.cfg.OnHandlerError(header, fmt.Errorf("handler panic: %v", r), p)
				}
			}
		}()
		h(p)
	}()
}

// setJSONMode toggles the outbound wire format: true = JSON, false = FantaCode.
// Inbound always auto-detects.
func (s *session) setJSONMode(enabled bool) { s.jsonMode = enabled }

// ServerSession represents a remote *server*. Client-side code uses it: Send
// ships client→server packets; On registers handlers for server→client ones.
type ServerSession struct{ s *session }

// ClientSession represents one remote *client*. Server-side code uses it: Send
// ships server→client packets; On registers handlers for client→server ones.
type ClientSession struct{ s *session }

// NewServer returns a session representing the remote server (client-side code).
func NewServer(cfg SessionConfig) *ServerSession { return &ServerSession{newSession(cfg, roleServer)} }

// NewClient returns a session representing one remote client (server-side code).
func NewClient(cfg SessionConfig) *ClientSession { return &ClientSession{newSession(cfg, roleClient)} }

// Receive feeds one inbound wire packet to a ServerSession. Never panics.
func (s *ServerSession) Receive(raw []byte) { s.s.receive(raw) }

// Receive feeds one inbound wire packet to a ClientSession. Never panics.
func (c *ClientSession) Receive(raw []byte) { c.s.receive(raw) }

// SetJSONMode toggles the outbound wire format for a ServerSession.
func (s *ServerSession) SetJSONMode(enabled bool) { s.s.setJSONMode(enabled) }

// SetJSONMode toggles the outbound wire format for a ClientSession.
func (c *ClientSession) SetJSONMode(enabled bool) { c.s.setJSONMode(enabled) }

// JSONMode reports the current outbound wire format for a ServerSession.
func (s *ServerSession) JSONMode() bool { return s.s.jsonMode }

// JSONMode reports the current outbound wire format for a ClientSession.
func (c *ClientSession) JSONMode() bool { return c.s.jsonMode }

