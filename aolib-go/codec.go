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
	switch mode {
	case WireJSON:
		return encodeJSON(p)
	case WireFanta:
		return frameFanta(p.Header(), p.Args()), nil
	default:
		return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
}

// Decode parses a raw packet into its typed struct, dispatching on the header.
// The concrete return type depends on the header (e.g. *FL, *MSToClient);
// unrecognised headers fall back to the generic *Packet. Client→server
// decoders are used; session code decodes by role.
//
//	v, _ := aolib.Decode([]byte("FL#multi_pair#%"), aolib.WireFanta)
func Decode(raw []byte, mode WireMode) (any, error) {
	switch mode {
	case WireJSON:
		_, p, err := decodeJSON(raw, c2sJSON)
		return p, err
	case WireFanta:
		_, p, err := decodeFanta(raw, c2sDecoders)
		return p, err
	default:
		return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
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
// named fields plus a "$header" const. Enum fields are Go string types, so they
// serialise to their meta string values (e.g. "shown", "def") and Offset stays
// an {x,y} object.
func encodeJSON(p Outgoing) ([]byte, error) {
	obj, err := toObject(p)
	if err != nil {
		return nil, fmt.Errorf("aolib: JSON encode failed for %q: %w", p.Header(), err)
	}
	h, _ := json.Marshal(p.Header())
	obj["$header"] = h
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
// fresh T and unmarshal the frame into it. The "$header" key has no struct
// field and is ignored.
func jsonDecoderFor[T any](raw []byte) (any, error) {
	p := new(T)
	if err := json.Unmarshal(raw, p); err != nil {
		return nil, err
	}
	return p, nil
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
