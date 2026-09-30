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
// The concrete return type depends on the packet header (e.g. *FL, *MSPacket,
// *HPPacket); unrecognised headers fall back to the generic *Packet.
//
//	v, _ := aolib.Decode([]byte("FL#multi_pair#%"), aolib.WireFanta)
//	fl := v.(*aolib.FL)
//	_ = fl.Features
func Decode(raw []byte, mode WireMode) (any, error) {
	_, p, err := decodeWire(raw, mode, true)
	return p, err
}

// decodeWire parses raw and returns the packet header plus its typed struct,
// decoding bidirectionally-ambiguous headers (ID, MC, …) according to the
// session's side.
func decodeWire(raw []byte, mode WireMode, serverSide bool) (string, any, error) {
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
	var p any
	if serverSide {
		p, err = decodeBody(pkt.Header, pkt.Body)
	} else {
		p, err = decodeClientInbound(pkt.Header, pkt.Body)
	}
	return pkt.Header, p, err
}

// decodeClientInbound dispatches a server→client body (what a client receives).
func decodeClientInbound(header string, body []string) (any, error) {
	switch header {
	case "ID":
		return ParseIDClient(body)
	case "SM":
		return &SM{Items: body}, nil
	case "DONE":
		return &DONE{}, nil
	case "BB":
		if len(body) < 1 {
			return nil, fmt.Errorf("BB: missing message")
		}
		return &BB{Message: body[0]}, nil
	default:
		return &Packet{Header: header, Body: body}, nil
	}
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

// decodeBody dispatches a positional body to the matching typed struct.
func decodeBody(header string, body []string) (any, error) {
	switch header {
	case "FL":
		return &FL{Features: body}, nil
	case "MS":
		return ParseMSClient(body), nil
	case "HI":
		return ParseHI(body)
	case "ID":
		return ParseIDServer(body)
	case "CC":
		return ParseCC(body)
	case "MC":
		return ParseMCFromClient(body)
	case "HP":
		return ParseHP(body)
	case "RT":
		return ParseRT(body)
	case "TT":
		return ParseTT(body)
	case "CT":
		return ParseCTFromClient(body)
	case "PE":
		return ParsePE(body)
	case "DE":
		return ParseDE(body)
	case "EE":
		return ParseEE(body)
	case "ZZ":
		return ParseZZ(body)
	case "SETCASE":
		return ParseSETCASE(body)
	case "CASEA":
		return ParseCASEA(body)
	case "VS_FRAME":
		return ParseVSFrame(body)
	case "VS_SPEAK":
		return ParseVSSpeak(body)
	default:
		return &Packet{Header: header, Body: body}, nil
	}
}
