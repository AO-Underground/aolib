package aolib

import (
	"encoding/json"
	"fmt"
	"strings"
)

// WireMode selects the wire encoding used by Encode/Decode.
type WireMode int

const (
	// WireFanta is the classic '#'-delimited positional format.
	WireFanta WireMode = iota
	// WireJSON is the named-field JSON object format.
	WireJSON
)

// Encode serializes a typed packet struct to its wire form.
//
//	raw, _ := aolib.Encode(&aolib.FL{Features: []string{"multi_pair"}}, aolib.WireFanta)
func Encode(p Outgoing, mode WireMode) ([]byte, error) {
	if d, ok := p.(interface{ withDefaults() Outgoing }); ok {
		p = d.withDefaults()
	}
	switch mode {
	case WireJSON:
		raw, err := encodeJSON(p)
		if err != nil {
			return nil, err
		}
		if err := validateJSON(p, raw); err != nil {
			return nil, err
		}
		return raw, nil
	case WireFanta:
		if err := validatePacket(p); err != nil {
			return nil, err
		}
		return frameFanta(p.Header(), p.Args()), nil
	default:
		return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
}

// Decode is DecodeToServer, kept for compatibility.
func Decode(raw []byte, mode WireMode) (any, error) { return DecodeToServer(raw, mode) }

// DecodeToServer parses a client→server packet into its typed struct (e.g.
// *MSToServer); unrecognised headers fall back to the generic *Packet.
//
//	v, _ := aolib.DecodeToServer([]byte("FL#multi_pair#%"), aolib.WireFanta)
func DecodeToServer(raw []byte, mode WireMode) (any, error) {
	return decodeDirection(raw, mode, c2sDecoders, c2sJSON)
}

// DecodeToClient parses a server→client packet into its typed struct (e.g.
// *MSToClient); unrecognised headers fall back to the generic *Packet.
func DecodeToClient(raw []byte, mode WireMode) (any, error) {
	return decodeDirection(raw, mode, s2cDecoders, s2cJSON)
}

func decodeDirection(raw []byte, mode WireMode, fanta map[string]decoder, js map[string]jsonDecoder) (any, error) {
	switch mode {
	case WireJSON:
		_, p, err := decodeJSON(raw, js)
		return p, err
	case WireFanta:
		_, p, err := decodeFanta(raw, fanta)
		return p, err
	default:
		return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
}

// ReadHeader returns a frame's header without decoding its body, in either
// wire format.
func ReadHeader(raw []byte) (string, error) {
	if len(raw) > 0 && raw[0] == '{' {
		return jsonHeader(raw)
	}
	pkt, err := NewPacket(strings.TrimSuffix(string(raw), "%"))
	if err != nil {
		return "", err
	}
	return pkt.Header, nil
}

// Validate reports whether Encode would accept p: it fills p's defaults and
// checks the result against its spec schema, failing with a *ValidationError.
func Validate(p Outgoing) error {
	if d, ok := p.(interface{ withDefaults() Outgoing }); ok {
		p = d.withDefaults()
	}
	return validatePacket(p)
}

// decodeFanta reads a FantaCode frame and decodes it via the supplied direction
// registry. Unknown headers fall back to the generic *Packet.
func decodeFanta(raw []byte, decoders map[string]decoder) (string, any, error) {
	// FantaCode frames end with a '%' terminator that NewPacket does not
	// consume (the connection layer strips it). Drop it so Decode round-trips
	// Encode's output.
	pkt, err := NewPacket(strings.TrimSuffix(string(raw), "%"))
	if err != nil {
		return "", nil, err
	}
	dec, ok := decoders[pkt.Header]
	if !ok {
		return pkt.Header, &Packet{Header: pkt.Header, Body: pkt.Body}, nil
	}
	p, err := dec(pkt.Body)
	return pkt.Header, p, err
}

// decodeJSON reads a JSON frame and unmarshals it into the typed struct the
// direction registry names. Unknown headers fall back to the generic *Packet.
func decodeJSON(raw []byte, decoders map[string]jsonDecoder) (string, any, error) {
	header, err := jsonHeader(raw)
	if err != nil {
		return "", nil, err
	}
	dec, ok := decoders[header]
	if !ok {
		return header, &Packet{Header: header}, nil
	}
	p, err := dec(raw)
	return header, p, err
}

// encodeJSON marshals a typed packet to the meta JSON envelope: the struct's
// named fields plus a "$header" const and any const slots the schema requires.
// Enum fields are Go string types, so they serialise to their meta string
// values (e.g. "shown", "def") and Offset stays an {x,y} object.
func encodeJSON(p Outgoing) ([]byte, error) {
	obj, err := toObject(p)
	if err != nil {
		return nil, fmt.Errorf("aolib: JSON encode failed for %q: %w", p.Header(), err)
	}
	h, _ := json.Marshal(p.Header())
	obj["$header"] = h
	if c, ok := p.(interface{ jsonConsts() map[string]string }); ok {
		for k, v := range c.jsonConsts() {
			obj[k], _ = json.Marshal(v)
		}
	}
	return json.Marshal(obj)
}

// toObject marshals v and re-reads it as a field map, so a "$header" key can be
// injected without the struct needing a dedicated field.
func toObject(v any) (map[string]json.RawMessage, error) {
	raw, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	obj := map[string]json.RawMessage{}
	if len(raw) > 0 && raw[0] == '{' {
		if err := json.Unmarshal(raw, &obj); err != nil {
			return nil, err
		}
	}
	return obj, nil
}

// jsonHeader reads the packet header from a JSON frame, accepting both the
// canonical "$header" and the legacy "header" key.
func jsonHeader(raw []byte) (string, error) {
	var probe map[string]json.RawMessage
	if err := json.Unmarshal(raw, &probe); err != nil {
		return "", fmt.Errorf("invalid JSON packet: %w", err)
	}
	h, ok := probe["$header"]
	if !ok {
		h, ok = probe["header"]
	}
	if !ok {
		return "", fmt.Errorf("JSON packet missing \"$header\"")
	}
	var header string
	if err := json.Unmarshal(h, &header); err != nil {
		return "", fmt.Errorf("invalid JSON header: %w", err)
	}
	if strings.TrimSpace(header) == "" {
		return "", fmt.Errorf("packet header cannot be empty")
	}
	return header, nil
}

// jsonDecoder unmarshals a JSON frame into its typed packet struct.
type jsonDecoder func(raw []byte) (any, error)

// jsonDecoderFor is the generic body behind every registry entry: allocate a
// fresh T with its schema defaults, unmarshal the frame over it, and validate
// the frame against the schema. The "$header" key has no struct field.
func jsonDecoderFor[T any](raw []byte) (any, error) {
	p := new(T)
	if d, ok := any(p).(interface{ applyDefaults() }); ok {
		d.applyDefaults()
	}
	if err := json.Unmarshal(raw, p); err != nil {
		return nil, err
	}
	raw, err := withJSONConsts(p, raw)
	if err != nil {
		return nil, err
	}
	if err := validateJSON(p, raw); err != nil {
		return nil, err
	}
	return p, nil
}

// withJSONConsts adds any const slot (e.g. PV's "_cid") the frame omits, so
// validation fills it like any other default instead of rejecting the frame.
func withJSONConsts(p any, raw []byte) ([]byte, error) {
	c, ok := p.(interface{ jsonConsts() map[string]string })
	if !ok {
		return raw, nil
	}
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(raw, &obj); err != nil {
		return nil, err
	}
	for k, v := range c.jsonConsts() {
		if _, ok := obj[k]; !ok {
			obj[k], _ = json.Marshal(v)
		}
	}
	return json.Marshal(obj)
}

// frameFanta frames header + positional args into HEADER#a#b#...#%.
func frameFanta(header string, args []string) []byte {
	var b strings.Builder
	b.Grow(len(header) + 2)
	b.WriteString(header)
	for _, a := range args {
		b.WriteByte('#')
		b.WriteString(a)
	}
	b.WriteString("#%")
	return []byte(b.String())
}
