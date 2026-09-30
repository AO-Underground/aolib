package aolib

// The packet registry: the single table that maps each wire header (per
// direction) to the function that turns a positional body into its typed
// struct. It replaces the hand-written switch statements that used to live in
// codec.go. A code generator (cmd/aolib-gen) regenerates it from aolib-meta's
// JSON Schemas so the schema stays the single source of truth.
//
// A header appears in both maps when it is bidirectional (ID, MC, FL, …): the
// direction of travel decides which decoder runs.

import "fmt"

// decoder turns a positional (FantaCode) body into its typed packet struct.
type decoder func(body []string) (any, error)

// c2sDecoders maps a client→server header to its decoder. A server-side
// session (remote client) reads inbound packets from this table.
var c2sDecoders = map[string]decoder{
	"FL":       func(b []string) (any, error) { return &FL{Features: b}, nil },
	"HI":       func(b []string) (any, error) { return ParseHI(b) },
	"ID":       func(b []string) (any, error) { return ParseIDServer(b) },
	"CC":       func(b []string) (any, error) { return ParseCC(b) },
	"MC":       func(b []string) (any, error) { return ParseMCFromClient(b) },
	"MS":       func(b []string) (any, error) { return ParseMSClient(b), nil },
	"HP":       func(b []string) (any, error) { return ParseHP(b) },
	"RT":       func(b []string) (any, error) { return ParseRT(b) },
	"TT":       func(b []string) (any, error) { return ParseTT(b) },
	"CT":       func(b []string) (any, error) { return ParseCTFromClient(b) },
	"PE":       func(b []string) (any, error) { return ParsePE(b) },
	"DE":       func(b []string) (any, error) { return ParseDE(b) },
	"EE":       func(b []string) (any, error) { return ParseEE(b) },
	"ZZ":       func(b []string) (any, error) { return ParseZZ(b) },
	"SETCASE":  func(b []string) (any, error) { return ParseSETCASE(b) },
	"CASEA":    func(b []string) (any, error) { return ParseCASEA(b) },
	"VS_FRAME": func(b []string) (any, error) { return ParseVSFrame(b) },
	"VS_SPEAK": func(b []string) (any, error) { return ParseVSSpeak(b) },
}

// s2cDecoders maps a server→client header to its decoder. A client-side
// session (remote server) reads inbound packets from this table.
var s2cDecoders = map[string]decoder{
	"ID":   func(b []string) (any, error) { return ParseIDClient(b) },
	"MC":   func(b []string) (any, error) { return ParseMCToClient(b) },
	"PV":   func(b []string) (any, error) { return ParsePV(b) },
	"BB":   func(b []string) (any, error) { return decodeBB(b) },
	"SM":   func(b []string) (any, error) { return &SM{Items: b}, nil },
	"DONE": func(b []string) (any, error) { return &DONE{}, nil },
	"FL":   func(b []string) (any, error) { return &FL{Features: b}, nil },
}

// decodeBB decodes the server→client BB body: BB#{message}#%.
func decodeBB(body []string) (any, error) {
	if len(body) < 1 {
		return nil, fmt.Errorf("BB: missing message")
	}
	return &BB{Message: body[0]}, nil
}
