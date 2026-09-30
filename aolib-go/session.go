package aolib

import (
	"encoding/json"
	"fmt"
	"strings"
)

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

// inboundJSON is inboundDecoders' JSON counterpart: the struct decoders for the
// direction this role receives from.
func (r role) inboundJSON() map[string]jsonDecoder {
	if r == roleServer {
		return s2cJSON
	}
	return c2sJSON
}

// session is the shared core. ServerSession/ClientSession are thin typed
// wrappers over it; callers never touch this type directly.
type session struct {
	cfg      SessionConfig
	role     role
	jsonMode bool
	handlers map[string]func(any)
	// customHandlers receive raw JSON objects for headers with no meta schema,
	// registered via OnCustom. They take precedence over the typed path and
	// fire on JSON frames only.
	customHandlers map[string]func(map[string]any)
}

func newSession(cfg SessionConfig, r role) *session {
	return &session{
		cfg:            cfg,
		role:           r,
		handlers:       make(map[string]func(any)),
		customHandlers: make(map[string]func(map[string]any)),
	}
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
	if len(raw) > 0 && raw[0] == '{' {
		s.jsonMode = true
		s.receiveJSON(raw)
		return
	}
	s.receiveFanta(raw)
}

func (s *session) receiveFanta(raw []byte) {
	pkt, err := NewPacket(strings.TrimSuffix(string(raw), "%"))
	if err != nil {
		if s.cfg.OnMalformedFrame != nil {
			s.cfg.OnMalformedFrame(err, raw)
		}
		return
	}
	dec, ok := s.role.inboundDecoders()[pkt.Header]
	if !ok {
		if s.cfg.OnUnknownHeader != nil {
			s.cfg.OnUnknownHeader(pkt.Header, raw)
		}
		return
	}
	p, err := dec(pkt.Body)
	if err != nil {
		if s.cfg.OnDecodeError != nil {
			s.cfg.OnDecodeError(pkt.Header, err, raw)
		}
		return
	}
	s.dispatch(pkt.Header, p)
}

func (s *session) receiveJSON(raw []byte) {
	header, err := jsonHeader(raw)
	if err != nil {
		if s.cfg.OnMalformedFrame != nil {
			s.cfg.OnMalformedFrame(err, raw)
		}
		return
	}
	// Custom handlers win over the typed path and reach headers with no meta
	// schema.
	if h, ok := s.customHandlers[header]; ok {
		var obj map[string]any
		if err := json.Unmarshal(raw, &obj); err != nil {
			if s.cfg.OnMalformedFrame != nil {
				s.cfg.OnMalformedFrame(err, raw)
			}
			return
		}
		s.dispatchCustom(header, obj, h)
		return
	}
	dec, ok := s.role.inboundJSON()[header]
	if !ok {
		if s.cfg.OnUnknownHeader != nil {
			s.cfg.OnUnknownHeader(header, raw)
		}
		return
	}
	p, err := dec(raw)
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

// dispatchCustom runs a custom JSON handler, recovering panics like dispatch.
func (s *session) dispatchCustom(header string, obj map[string]any, h func(map[string]any)) {
	defer func() {
		if r := recover(); r != nil {
			if s.cfg.OnHandlerError != nil {
				s.cfg.OnHandlerError(header, fmt.Errorf("handler panic: %v", r), obj)
			}
		}
	}()
	h(obj)
}

// sendCustom ships a nonstandard packet as JSON, bypassing the meta schema
// layer. aolib does not model such packets; servers that need them build the
// object themselves. A "$header" is injected from header (overriding any the
// payload carries). JSON only — there is no positional form for a packet aolib
// has no schema for.
func (s *session) sendCustom(header string, payload any) error {
	if strings.TrimSpace(header) == "" {
		return fmt.Errorf("aolib: SendCustom requires a non-empty $header")
	}
	obj, err := toObject(payload)
	if err != nil {
		return fmt.Errorf("aolib: SendCustom payload not a JSON object: %w", err)
	}
	h, _ := json.Marshal(header)
	obj["$header"] = h
	buf, err := json.Marshal(obj)
	if err != nil {
		return err
	}
	if s.cfg.Send != nil {
		s.cfg.Send(buf)
	}
	return nil
}

// onCustom registers a handler for a nonstandard JSON header. It errors on a
// collision with a typed handler or another custom handler for the same header.
func (s *session) onCustom(header string, h func(map[string]any)) error {
	if strings.TrimSpace(header) == "" {
		return fmt.Errorf("aolib: OnCustom requires a non-empty header")
	}
	if _, ok := s.handlers[header]; ok {
		return fmt.Errorf("aolib: header %q already has a typed handler", header)
	}
	if _, ok := s.customHandlers[header]; ok {
		return fmt.Errorf("aolib: header %q already has a custom handler", header)
	}
	s.customHandlers[header] = h
	return nil
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

// SendCustom ships a nonstandard packet (one aolib has no meta schema for) as
// JSON, with header injected as "$header". Use it for server-specific
// extensions; aolib only facilitates them.
func (s *ServerSession) SendCustom(header string, payload any) error {
	return s.s.sendCustom(header, payload)
}

// OnCustom registers a handler for a nonstandard JSON header. Errors on a
// collision with a typed or existing custom handler.
func (s *ServerSession) OnCustom(header string, h func(map[string]any)) error {
	return s.s.onCustom(header, h)
}

// SendCustom ships a nonstandard packet (one aolib has no meta schema for) as
// JSON, with header injected as "$header". Use it for server-specific
// extensions; aolib only facilitates them.
func (c *ClientSession) SendCustom(header string, payload any) error {
	return c.s.sendCustom(header, payload)
}

// OnCustom registers a handler for a nonstandard JSON header. Errors on a
// collision with a typed or existing custom handler.
func (c *ClientSession) OnCustom(header string, h func(map[string]any)) error {
	return c.s.onCustom(header, h)
}
