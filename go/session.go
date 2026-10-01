package aolib

import (
	"fmt"
	"strings"
)

// SessionConfig configures a session. Send is the only required hook; the
// rest are observability callbacks that fire instead of panicking or
// returning errors from Receive. A nil hook is a no-op.
type SessionConfig struct {
	// Send delivers one encoded wire packet to the transport (required).
	Send func(wire []byte)

	// DisableAutoJSON turns off automatic JSON negotiation. By default a
	// ServerSession switches outbound to JSON on decryptor#JSON, and a
	// ClientSession on the first frame that starts with '{'.
	DisableAutoJSON bool

	// OnMalformedFrame fires when inbound bytes can't be read as a packet.
	OnMalformedFrame func(err error, wire []byte)
	// OnUnknownHeader fires when the header isn't in this session's inbound
	// registry (i.e. it doesn't travel in the direction this role receives).
	OnUnknownHeader func(header string, wire []byte)
	// OnDecodeError fires when a registered header fails to decode or fails
	// schema validation (err is then a *ValidationError).
	OnDecodeError func(header string, err error, wire []byte)
	// OnEncodeError fires when an outgoing packet cannot be encoded, e.g. it
	// fails schema validation; the packet is not sent.
	OnEncodeError func(header string, err error, packet any)
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
	// customHandlers receive the typed value produced by a header's registered
	// Codec (see RegisterCodec), for headers with no meta schema. Registered via
	// OnCustom; they fire on both wire formats.
	customHandlers map[string]func(any)
}

func newSession(cfg SessionConfig, r role) *session {
	return &session{
		cfg:            cfg,
		role:           r,
		handlers:       make(map[string]func(any)),
		customHandlers: make(map[string]func(any)),
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
	if err != nil {
		if s.cfg.OnEncodeError != nil {
			s.cfg.OnEncodeError(p.Header(), err, p)
		}
		return
	}
	if s.cfg.Send == nil {
		return
	}
	s.cfg.Send(raw)
}

// receive feeds one inbound wire packet and never panics: every failure mode
// routes to exactly one SessionConfig hook.
func (s *session) receive(raw []byte) {
	if len(raw) > 0 && raw[0] == '{' {
		if s.role == roleClient && !s.cfg.DisableAutoJSON {
			s.jsonMode = true
		}
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
	// A registered codec owns its header in both wire formats and wins over the
	// generated registry.
	if c, ok := codecs[pkt.Header]; ok {
		p, derr := c.DecodeFanta(pkt.Body)
		if derr != nil {
			if s.cfg.OnDecodeError != nil {
				s.cfg.OnDecodeError(pkt.Header, derr, raw)
			}
			return
		}
		s.dispatchCustom(pkt.Header, p)
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
	// A registered codec owns its header in both wire formats and wins over the
	// generated registry.
	if c, ok := codecs[header]; ok {
		p, derr := c.DecodeJSON(string(raw))
		if derr != nil {
			if s.cfg.OnDecodeError != nil {
				s.cfg.OnDecodeError(header, derr, raw)
			}
			return
		}
		s.dispatchCustom(header, p)
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
	if d, ok := p.(*Decryptor); ok && d.Value == "JSON" && s.role == roleServer && !s.cfg.DisableAutoJSON {
		s.jsonMode = true
	}
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

// dispatchCustom hands the codec-decoded value to the registered custom
// handler (or the unhandled hook), recovering panics like dispatch.
func (s *session) dispatchCustom(header string, p any) {
	h, ok := s.customHandlers[header]
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

// sendCustom ships a nonstandard packet through its registered Codec, in the
// session's current wire mode. The header must have a codec (RegisterCodec);
// aolib itself models only canonical aolib-meta.
func (s *session) sendCustom(header string, payload any) error {
	if strings.TrimSpace(header) == "" {
		return fmt.Errorf("aolib: SendCustom requires a non-empty header")
	}
	mode := WireFanta
	if s.jsonMode {
		mode = WireJSON
	}
	raw, err := encodeCustom(header, payload, mode)
	if err != nil {
		return err
	}
	if s.cfg.Send != nil {
		s.cfg.Send(raw)
	}
	return nil
}

// onCustom registers a handler for a custom header. The header's Codec
// (RegisterCodec) decodes the frame first; the handler receives that typed
// value. Errors on a collision with a typed handler or another custom handler.
func (s *session) onCustom(header string, h func(any)) error {
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
// Outbound starts as FantaCode; inbound always auto-detects.
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

// SendCustom ships a nonstandard packet through its registered Codec
// (RegisterCodec), in the session's current wire mode. Use it for
// server-specific extensions; aolib only facilitates them.
func (s *ServerSession) SendCustom(header string, payload any) error {
	return s.s.sendCustom(header, payload)
}

// OnCustom registers a handler for a custom header; the header's Codec decodes
// the frame and the handler receives the typed value. Errors on a collision
// with a typed or existing custom handler.
func (s *ServerSession) OnCustom(header string, h func(any)) error {
	return s.s.onCustom(header, h)
}

// SendCustom ships a nonstandard packet through its registered Codec
// (RegisterCodec), in the session's current wire mode. Use it for
// server-specific extensions; aolib only facilitates them.
func (c *ClientSession) SendCustom(header string, payload any) error {
	return c.s.sendCustom(header, payload)
}

// OnCustom registers a handler for a custom header; the header's Codec decodes
// the frame and the handler receives the typed value. Errors on a collision
// with a typed or existing custom handler.
func (c *ClientSession) OnCustom(header string, h func(any)) error {
	return c.s.onCustom(header, h)
}
