package aolib

import (
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

// Encode serializes a typed packet struct to its wire form. JSON is the trivial
// case; FantaCode positional framing is handled opaquely behind this function,
// so callers work with named struct fields and never touch positional args.
//
//	raw, _ := aolib.Encode(&aolib.FL{Features: []string{"multi_pair"}}, aolib.WireFanta)
func Encode(p Outgoing, mode WireMode) ([]byte, error) {
	header, args := p.Header(), p.Args()
	switch mode {
	case WireJSON:
		if b := BuildJSON(header, args); b != nil {
			return b, nil
		}
		return nil, fmt.Errorf("aolib: JSON encode failed for %q", header)
	case WireFanta:
		return frameFanta(header, args), nil
	default:
		return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
}

// Decode parses a raw packet into its typed struct, dispatching on the header.
// The concrete return type depends on the packet header (e.g. *FL, *MSToClient,
// *HPToServer); unrecognised headers fall back to the generic *Packet.
//
//	v, _ := aolib.Decode([]byte("FL#multi_pair#%"), aolib.WireFanta)
//	fl := v.(*aolib.FL)
//	_ = fl.Features
func Decode(raw []byte, mode WireMode) (any, error) {
	_, p, err := decodeWire(raw, mode, c2sDecoders)
	return p, err
}

// parseFrame reads a raw wire packet into its header + positional body without
// typed decoding. JSON is normalised to the same positional body FantaCode
// uses, so the registry decoders run identically for both wire formats.
func parseFrame(raw []byte, mode WireMode) (string, []string, error) {
	var pkt *Packet
	var err error
	switch mode {
	case WireJSON:
		pkt, err = ParseJSON(string(raw))
	case WireFanta:
		// FantaCode frames end with a '%' terminator that NewPacket does not
		// consume (the server strips it at the connection layer). Drop it here
		// so Decode round-trips Encode's output.
		pkt, err = NewPacket(strings.TrimSuffix(string(raw), "%"))
	default:
		return "", nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
	if err != nil {
		return "", nil, err
	}
	return pkt.Header, pkt.Body, nil
}

// decodeWire parses raw and returns the packet header plus its typed struct by
// looking the header up in the supplied direction registry. Unknown headers
// fall back to the generic *Packet.
func decodeWire(raw []byte, mode WireMode, decoders map[string]decoder) (string, any, error) {
	header, body, err := parseFrame(raw, mode)
	if err != nil {
		return "", nil, err
	}
	dec, ok := decoders[header]
	if !ok {
		return header, &Packet{Header: header, Body: body}, nil
	}
	p, err := dec(body)
	return header, p, err
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


