package aolib

// SessionOptions configures a Session.
type SessionOptions struct {
	// Send delivers one encoded wire packet to the transport (required).
	Send func(wire []byte)
	// OnUnhandled is called for inbound packets with no registered handler
	// (optional). Loud by default is better: dropping is easy to miss.
	OnUnhandled func(header string, packet any)
}

// Session is one remote peer. From a server's perspective it represents one
// connected client (NewServer); from a client's perspective it represents the
// server (NewClient). It owns that peer's wire mode (FantaCode vs JSON) and
// dispatches inbound packets to typed handlers.
//
// The wire format is opaque to the caller: Receive auto-detects FantaCode vs
// JSON, and Send encodes using the session's current mode. Named struct fields
// are the only API — positional FantaCode framing never leaks out.
type Session struct {
	opts       SessionOptions
	serverSide bool // true = server's view (receives client→server packets)
	jsonMode   bool
	handlers   map[string]func(any)
}

func newSession(opts SessionOptions, serverSide bool) *Session {
	return &Session{opts: opts, serverSide: serverSide, handlers: make(map[string]func(any))}
}

// NewServer creates a server-side session (one connected client).
func NewServer(opts SessionOptions) *Session { return newSession(opts, true) }

// NewClient creates a client-side session (the server we're talking to).
func NewClient(opts SessionOptions) *Session { return newSession(opts, false) }

// JSONMode reports whether this session has flipped to JSON outbound.
func (s *Session) JSONMode() bool { return s.jsonMode }

// AdvertiseJSON sends decryptor#JSON. When the peer echoes back a JSON packet,
// Receive flips this session to JSON outbound — matching AO's per-connection
// negotiation, so one server can serve FantaCode and JSON clients at once.
func (s *Session) AdvertiseJSON() { s.Send(&Decryptor{}) }

// On registers a handler for a packet header. Handlers receive the typed struct
// decoded for that header (e.g. *IDServer for "ID"). Use OnTyped for a
// compile-time-checked parameter type.
func (s *Session) On(header string, h func(any)) { s.handlers[header] = h }

// OnTyped registers a typed handler for a packet header. The handler parameter
// type must match the decoded struct for that header.
func OnTyped[T any](s *Session, header string, h func(T)) {
	s.On(header, func(p any) { h(p.(T)) })
}

// Send encodes a typed packet using the session's current wire mode and hands
// it to the transport. Non-blocking: a nil Send or an encode failure drops.
func (s *Session) Send(p Outgoing) {
	mode := WireFanta
	if s.jsonMode {
		mode = WireJSON
	}
	raw, err := Encode(p, mode)
	if err != nil || s.opts.Send == nil {
		return
	}
	s.opts.Send(raw)
}

// Receive feeds one inbound wire packet: auto-detects the wire format, flips
// JSON mode when the peer sends JSON, decodes to the typed struct, and
// dispatches to the registered handler (or OnUnhandled). Never panics.
func (s *Session) Receive(raw []byte) {
	mode := WireFanta
	if len(raw) > 0 && raw[0] == '{' {
		mode = WireJSON
		s.jsonMode = true
	}
	header, packet, err := decodeWire(raw, mode, s.serverSide)
	if err != nil {
		return
	}
	if h, ok := s.handlers[header]; ok {
		h(packet)
		return
	}
	if s.opts.OnUnhandled != nil {
		s.opts.OnUnhandled(header, packet)
	}
}
