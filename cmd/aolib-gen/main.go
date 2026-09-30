// Command aolib-gen regenerates the typed session surface (the per-header
// OnX/SendX methods) from the aolib-meta JSON Schemas, so the schema stays the
// single source of truth and the typed API can never drift from it.
//
// Direction comes from the packet filename convention in aolib-schemas:
//
//	*Request.schema.json   -> client -> server (c2s)
//	*Broadcast.schema.json -> server -> client (s2c)
//	*Client.schema.json    -> server -> client (s2c; the client is the receiver)
//	*Server.schema.json    -> client -> server (c2s; the server is the receiver)
//
// plus a small fallback table for the bare headers whose direction isn't in
// the filename (HI, CC, BB, SM, DONE, PV, FL, …). The canonical aolib-meta
// carries this explicitly as an `x-receiver` field; until the vendored schemas
// grow that field, the fallback table stands in for it.
//
// Run from the repo root:
//
//	go run ./cmd/aolib-gen -schemas ../aolib-schemas/schemas/packets
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type packetMeta struct {
	header   string
	c2s      bool
	s2c      bool
	goType   string
	hasSend  bool
	hasParse bool
}

func main() {
	schemasDir := flag.String("schemas", "../aolib-schemas/schemas/packets", "packet schema directory")
	flag.Parse()
	meta, err := loadMeta(*schemasDir)
	if err != nil {
		fmt.Fprintln(os.Stderr, "aolib-gen:", err)
		os.Exit(1)
	}
	fmt.Print(emit(meta))
}

// directionFallback maps a bare header (no Request/Broadcast/Client/Server
// suffix) to its directions. Stands in for aolib-meta's x-receiver field.
var directionFallback = map[string]struct{ c2s, s2c bool }{
	"HI":        {c2s: true},
	"CC":        {c2s: true},
	"FL":        {c2s: true, s2c: true},
	"BB":        {s2c: true},
	"SM":        {s2c: true},
	"DONE":      {s2c: true},
	"PV":        {s2c: true},
	"decryptor": {s2c: true},
}

// goTypeRename fixes the few schemas whose Go struct name differs from the
// schema basename (the codec keeps the server-side FromClient/ToClient naming).
var goTypeRename = map[string]string{
	"MCRequest":   "MCFromClient",
	"MCBroadcast": "MCToClient",
	"CTRequest":   "CTFromClient",
	"CTBroadcast": "CTToClient",
	"decryptor":   "Decryptor",
}

func loadMeta(dir string) ([]packetMeta, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var out []packetMeta
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".schema.json") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			return nil, err
		}
		var schema struct {
			Properties map[string]struct {
				Const string `json:"const"`
			} `json:"properties"`
		}
		if err := json.Unmarshal(raw, &schema); err != nil {
			return nil, fmt.Errorf("%s: %w", e.Name(), err)
		}
		hdr := schema.Properties["$header"].Const
		if hdr == "" {
			continue
		}
		name := strings.TrimSuffix(e.Name(), ".schema.json")
		goType := name
		if r, ok := goTypeRename[name]; ok {
			goType = r
		}
		c2s, s2c := directionFor(name, hdr)
		out = append(out, packetMeta{
			header:   hdr,
			c2s:      c2s,
			s2c:      s2c,
			goType:   goType,
			hasSend:  implementsOutgoing(goType),
			hasParse: hasParseFunc(goType),
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].header < out[j].header })
	return out, nil
}

func directionFor(name, hdr string) (c2s, s2c bool) {
	switch {
	case strings.HasSuffix(name, "Request"):
		return true, false
	case strings.HasSuffix(name, "Broadcast"):
		return false, true
	case strings.HasSuffix(name, "Client"):
		return false, true
	case strings.HasSuffix(name, "Server"):
		return true, false
	}
	if d, ok := directionFallback[hdr]; ok {
		return d.c2s, d.s2c
	}
	return false, false
}

// implementsOutgoing reports whether the Go struct implements Outgoing
// (Header + Args) and so can be Sent. Kept in sync with types.go; a full port
// derives it from the schema properties order (the FantaCode positional walk).
func implementsOutgoing(goType string) bool {
	switch goType {
	case "HI", "IDServer", "IDClient", "CC", "MCFromClient", "MCToClient",
		"SM", "DONE", "BB", "PV", "FL", "Decryptor", "CTFromClient", "CTToClient":
		return true
	}
	return false
}

// hasParseFunc reports whether a Parse<goType>([]string) (any, error) exists
// for decoding the inbound body.
func hasParseFunc(goType string) bool {
	switch goType {
	case "HI", "IDServer", "IDClient", "CC", "MCFromClient", "MCToClient", "PV",
		"HP", "RT", "TT", "CTFromClient", "PE", "DE", "EE", "ZZ", "SETCASE",
		"CASEA", "VSFrame", "VSSpeak":
		return true
	}
	return false
}

// knownTypes is the set of Go packet structs that currently exist in types.go
// AND are wired into the typed session surface. A full port generates these
// structs from the schema properties (the FantaCode positional walk), at which
// point this allowlist disappears and every schema contributes a typed method.
var knownTypes = map[string]bool{
	"HI": true, "IDServer": true, "IDClient": true, "CC": true,
	"MCFromClient": true, "MCToClient": true, "BB": true, "SM": true,
	"DONE": true, "PV": true, "FL": true, "Decryptor": true,
}

func capitalize(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func emit(meta []packetMeta) string {
	// Group by header so bidirectional packets (ID, MC, CT, FL) share one
	// method name with a per-direction parameter type — the same header-as-type
	// trick aolib-ts gets from its SendMap/OnMap mapped types.
	type dirTypes struct{ c2s, s2c string }
	byHeader := map[string]dirTypes{}
	for _, p := range meta {
		d := byHeader[p.header]
		if p.c2s {
			d.c2s = p.goType
		}
		if p.s2c {
			d.s2c = p.goType
		}
		byHeader[p.header] = d
	}
	headers := make([]string, 0, len(byHeader))
	for h, d := range byHeader {
		if knownTypes[d.c2s] || knownTypes[d.s2c] {
			headers = append(headers, h)
		}
	}
	sort.Strings(headers)

	var b strings.Builder
	b.WriteString("// Code generated by cmd/aolib-gen. DO NOT EDIT.\n\n")
	b.WriteString("// Typed On*/Send* methods keyed by wire header as a TYPE, so wrong-direction\n")
	b.WriteString("// calls don't compile and IDEs autocomplete the header.\n\n")

	b.WriteString("// ServerSession is the client-side view (remote server): send C2S, on S2C.\n")
	for _, h := range headers {
		d := byHeader[h]
		if d.c2s != "" && knownTypes[d.c2s] && implementsOutgoing(d.c2s) {
			fmt.Fprintf(&b, "func (s *ServerSession) Send%s(p *%s) { s.s.send(p) }\n", capitalize(h), d.c2s)
		}
		if d.s2c != "" && knownTypes[d.s2c] {
			fmt.Fprintf(&b, "func (s *ServerSession) On%s(h func(*%s)) { s.s.on(%q, func(p any) { h(p.(*%s)) }) }\n",
				capitalize(h), d.s2c, h, d.s2c)
		}
	}
	b.WriteString("\n// ClientSession is the server-side view (remote client): send S2C, on C2S.\n")
	for _, h := range headers {
		d := byHeader[h]
		if d.s2c != "" && knownTypes[d.s2c] && implementsOutgoing(d.s2c) {
			fmt.Fprintf(&b, "func (c *ClientSession) Send%s(p *%s) { c.s.send(p) }\n", capitalize(h), d.s2c)
		}
		if d.c2s != "" && knownTypes[d.c2s] {
			fmt.Fprintf(&b, "func (c *ClientSession) On%s(h func(*%s)) { c.s.on(%q, func(p any) { h(p.(*%s)) }) }\n",
				capitalize(h), d.c2s, h, d.c2s)
		}
	}
	return b.String()
}
