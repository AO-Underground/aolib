// Command aolib-gen regenerates typed Go packets + enums from the canonical
// aolib spec/ schemas, mirroring aolib-ts's codegen.
//
//	go run ./cmd/aolib-gen -meta ../spec -out .
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// ojson is an order-preserving JSON value; the FantaCode wire order is the
// source-file property order.
type ojson struct {
	kind   byte // 'o' object, 'a' array, 's' scalar
	keys   []string
	vals   map[string]*ojson
	arr    []*ojson
	scalar any
}

func parseJSON(raw []byte) (*ojson, error) {
	return parseOJSON(json.NewDecoder(bytes.NewReader(raw)))
}

func parseOJSON(dec *json.Decoder) (*ojson, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}
	if d, ok := tok.(json.Delim); ok {
		switch d {
		case '{':
			o := &ojson{kind: 'o', vals: map[string]*ojson{}}
			for dec.More() {
				kt, _ := dec.Token()
				v, err := parseOJSON(dec)
				if err != nil {
					return nil, err
				}
				o.keys = append(o.keys, kt.(string))
				o.vals[kt.(string)] = v
			}
			dec.Token()
			return o, nil
		case '[':
			o := &ojson{kind: 'a'}
			for dec.More() {
				v, err := parseOJSON(dec)
				if err != nil {
					return nil, err
				}
				o.arr = append(o.arr, v)
			}
			dec.Token()
			return o, nil
		}
		return nil, fmt.Errorf("unexpected delimiter %v", d)
	}
	return &ojson{kind: 's', scalar: tok}, nil
}

func (o *ojson) str(key string) string {
	if o.kind == 'o' {
		if v, ok := o.vals[key]; ok && v.kind == 's' {
			if s, ok := v.scalar.(string); ok {
				return s
			}
		}
	}
	return ""
}

func (o *ojson) has(key string) bool { return o.kind == 'o' && o.vals[key] != nil }

func (o *ojson) strSlice(key string) []string {
	if o.kind != 'o' {
		return nil
	}
	v, ok := o.vals[key]
	if !ok || v.kind != 'a' {
		return nil
	}
	var out []string
	for _, e := range v.arr {
		if e.kind == 's' {
			if s, ok := e.scalar.(string); ok {
				out = append(out, s)
			}
		}
	}
	return out
}

func (o *ojson) intSlice(key string) []int {
	if o.kind != 'o' {
		return nil
	}
	v, ok := o.vals[key]
	if !ok || v.kind != 'a' {
		return nil
	}
	var out []int
	for _, e := range v.arr {
		if e.kind == 's' {
			if n, ok := e.scalar.(float64); ok {
				out = append(out, int(n))
			}
		}
	}
	return out
}

// Schema is the codegen's view of one schema.
type Schema struct {
	Name              string
	Header            string
	XReceiver         string
	XFantaCodec       string
	Description       string
	Enum              []string
	XWireInts         []int
	Properties        []Prop
	Required          map[string]bool
	Items             *Schema
	IsObject          bool
	XFantaUnescapeAmp bool
	Ref               string
	TypeStr           string
	Const             string
}

type Prop struct {
	Name   string
	Schema *Schema
}

func schemaFromJSON(name string, o *ojson) *Schema {
	s := &Schema{Name: name, Required: map[string]bool{}}
	s.Description = o.str("description")
	s.XReceiver = o.str("x-receiver")
	s.XFantaCodec = o.str("x-fanta-codec")
	s.Ref = o.str("$ref")
	s.Const = o.str("const")
	s.Enum = o.strSlice("enum")
	s.XWireInts = o.intSlice("x-wire-ints")
	s.XFantaUnescapeAmp = o.has("x-fanta-unescape-amp")
	s.TypeStr = o.str("type")
	if s.TypeStr == "object" {
		s.IsObject = true
	}
	if props, ok := o.vals["properties"]; ok && props.kind == 'o' {
		for _, k := range props.keys {
			sub := props.vals[k]
			if k == "$header" {
				s.Header = sub.str("const")
				continue
			}
			s.Properties = append(s.Properties, Prop{Name: k, Schema: schemaFromJSON("", sub)})
		}
	}
	if items, ok := o.vals["items"]; ok {
		s.Items = schemaFromJSON("", items)
	}
	if req, ok := o.vals["required"]; ok && req.kind == 'a' {
		for _, e := range req.arr {
			if e.kind == 's' {
				if v, ok := e.scalar.(string); ok {
					s.Required[v] = true
				}
			}
		}
	}
	return s
}

func main() {
	metaDir := flag.String("meta", "../spec", "spec checkout root")
	outDir := flag.String("out", ".", "output directory")
	flag.Parse()

	enums, types, err := loadTypes(*metaDir)
	if err != nil {
		fatal(err)
	}
	packets, err := loadPackets(*metaDir)
	if err != nil {
		fatal(err)
	}
	enumNames := map[string]*Schema{}
	for _, e := range enums {
		enumNames[e.Name] = e
	}
	typeNames := map[string]*Schema{}
	for _, t := range types {
		typeNames[t.Name] = t
	}

	write(filepath.Join(*outDir, "enums_gen.go"), emitEnums(enums))
	write(filepath.Join(*outDir, "types_gen.go"), emitTypes(types))
	write(filepath.Join(*outDir, "packets_gen.go"), emitPackets(packets, enumNames, typeNames))
	write(filepath.Join(*outDir, "registry_gen.go"), emitRegistry(packets))
}

func fatal(err error) {
	fmt.Fprintln(os.Stderr, "aolib-gen:", err)
	os.Exit(1)
}

func write(path, content string) {
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		fatal(err)
	}
	fmt.Println("wrote", path)
}

func loadTypes(meta string) (enums, types []*Schema, err error) {
	dir := filepath.Join(meta, "types")
	names, err := fileNames(dir)
	if err != nil {
		return nil, nil, err
	}
	for _, n := range names {
		o, err := parseJSON(readFile(filepath.Join(dir, n)))
		if err != nil {
			return nil, nil, fmt.Errorf("%s: %w", n, err)
		}
		s := schemaFromJSON(capitalize(strings.TrimSuffix(n, ".schema.json")), o)
		if len(s.Enum) > 0 {
			enums = append(enums, s)
		} else {
			types = append(types, s)
		}
	}
	sort.Slice(enums, func(i, j int) bool { return enums[i].Name < enums[j].Name })
	sort.Slice(types, func(i, j int) bool { return types[i].Name < types[j].Name })
	return enums, types, nil
}

// skipPackets lists schemas the codegen must not emit. Empty: every packet,
// including MS, is generated straight from spec. Nonstandard behavior
// (Nyathena blips, multi-pair, Athena-only packets) is not modeled here;
// servers layer it on via the session's SendCustom/OnCustom facility.
var skipPackets = map[string]bool{}

func loadPackets(meta string) ([]*Schema, error) {
	dir := filepath.Join(meta, "packets", "schemas")
	names, err := fileNames(dir)
	if err != nil {
		return nil, err
	}
	var out []*Schema
	for _, n := range names {
		base := strings.TrimSuffix(n, ".schema.json")
		if skipPackets[base] {
			continue
		}
		o, err := parseJSON(readFile(filepath.Join(dir, n)))
		if err != nil {
			return nil, fmt.Errorf("%s: %w", n, err)
		}
		out = append(out, schemaFromJSON(capitalize(base), o))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func fileNames(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var out []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".schema.json") {
			out = append(out, e.Name())
		}
	}
	return out, nil
}

func readFile(p string) []byte {
	b, err := os.ReadFile(p)
	if err != nil {
		fatal(err)
	}
	return b
}

// pascalCase maps a schema field name (snake_case or camelCase) to Go
// PascalCase, capitalising the id/uid suffixes and a few known acronyms.
func pascalCase(s string) string {
	// Normalise camelCase to snake_case (insert _ before each upper rune).
	var norm strings.Builder
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			norm.WriteByte('_')
		}
		norm.WriteRune(r)
	}
	parts := strings.Split(norm.String(), "_")
	var b strings.Builder
	for _, p := range parts {
		p = strings.ToLower(p)
		if p == "" {
			continue
		}
		switch p {
		case "id":
			b.WriteString("ID")
		case "uid":
			b.WriteString("UID")
		case "hdid":
			b.WriteString("HDID")
		case "ipid":
			b.WriteString("IPID")
		case "charid":
			b.WriteString("CharID")
		default:
			if strings.HasSuffix(p, "id") && len(p) > 2 {
				b.WriteString(strings.ToUpper(p[:1]) + p[1:len(p)-2] + "ID")
			} else if strings.HasSuffix(p, "uid") && len(p) > 3 {
				b.WriteString(strings.ToUpper(p[:1]) + p[1:len(p)-3] + "UID")
			} else {
				b.WriteString(strings.ToUpper(p[:1]) + p[1:])
			}
		}
	}
	return b.String()
}

func lowerFirst(s string) string {
	if s == "" {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}

// capitalize uppercases the first rune, mapping "decryptor" -> "Decryptor".
func capitalize(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func refName(ref string) string {
	base := ref
	if i := strings.LastIndex(base, "/"); i >= 0 {
		base = base[i+1:]
	}
	return strings.TrimSuffix(base, ".schema.json")
}

// fieldType returns the Go type of a property, resolving $ref to enum/object
// type names.
func fieldType(p *Prop, enumNames, typeNames map[string]*Schema) string {
	s := p.Schema
	if s.Ref != "" {
		n := refName(s.Ref)
		if enumNames[n] != nil {
			return n
		}
		if typeNames[n] != nil {
			return n
		}
	}
	switch s.TypeStr {
	case "number", "integer":
		return "int"
	case "boolean":
		return "bool"
	case "array":
		if s.Items != nil && s.Items.Ref != "" && enumNames != nil && enumNames[refName(s.Items.Ref)] != nil {
			return "[]" + refName(s.Items.Ref)
		}
		if s.Items != nil && (s.Items.TypeStr == "number" || s.Items.TypeStr == "integer") {
			return "[]int"
		}
		return "[]string"
	default:
		return "string"
	}
}

// enumArrayOf returns the enum schema an array property's items $ref, if any.
func enumArrayOf(p *Prop, enumNames map[string]*Schema) *Schema {
	s := p.Schema
	if s.TypeStr == "array" && s.Items != nil && s.Items.Ref != "" && enumNames != nil {
		return enumNames[refName(s.Items.Ref)]
	}
	return nil
}

// enumFor returns the enum schema a property $refs, if any.
func enumFor(p *Prop, enumNames map[string]*Schema) (*Schema, bool) {
	if p.Schema.Ref == "" {
		return nil, false
	}
	e := enumNames[refName(p.Schema.Ref)]
	return e, e != nil
}

// typeFor returns the object-type schema a property $refs, if any.
func typeFor(p *Prop, typeNames map[string]*Schema) (*Schema, bool) {
	if p.Schema.Ref == "" {
		return nil, false
	}
	t := typeNames[refName(p.Schema.Ref)]
	return t, t != nil
}

// encodeExpr returns the Go expression that encodes a property to one wire
// token. Arrays and const slots are handled by the caller, not here.
func encodeExpr(p *Prop, enumNames, typeNames map[string]*Schema) string {
	f := "p." + pascalCase(p.Name)
	if e, ok := enumFor(p, enumNames); ok {
		if len(e.XWireInts) > 0 {
			return fmt.Sprintf("itoa(%sToWire[%s])", lowerFirst(e.Name), f)
		}
		return "string(" + f + ")"
	}
	if t, ok := typeFor(p, typeNames); ok {
		return fmt.Sprintf("%sToWire(%s)", lowerFirst(t.Name), f)
	}
	switch p.Schema.TypeStr {
	case "number", "integer":
		return "itoa(" + f + ")"
	case "boolean":
		return "boolToWire(" + f + ")"
	default:
		return "escapeFanta(" + f + ")"
	}
}

// decodeStmt returns the Go statement assigning a property from the current
// wire token (read via the local `get(cursor)` closure).
func decodeStmt(p *Prop, enumNames, typeNames map[string]*Schema) string {
	f := "p." + pascalCase(p.Name)
	tok := "get(cursor)"
	if e, ok := enumFor(p, enumNames); ok {
		if len(e.XWireInts) > 0 {
			return fmt.Sprintf("%s = %sFromWire[atoiOrZero(%s)]", f, lowerFirst(e.Name), tok)
		}
		return fmt.Sprintf("%s = %s(%s)", f, e.Name, tok)
	}
	if t, ok := typeFor(p, typeNames); ok {
		return fmt.Sprintf("%s = %sFromWire(%s)", f, lowerFirst(t.Name), tok)
	}
	switch p.Schema.TypeStr {
	case "number", "integer":
		return fmt.Sprintf("%s = atoiOrZero(%s)", f, tok)
	case "boolean":
		return fmt.Sprintf("%s = wireToBool(%s)", f, tok)
	default:
		return fmt.Sprintf("%s = unescapeFanta(%s)", f, tok)
	}
}

// isObjectArray reports whether a property is an array whose items are objects
// (e.g. SC char_data, SM music_list), which need a struct-typed slice rather
// than []string.
func isObjectArray(s *Schema) bool {
	return s.TypeStr == "array" && s.Items != nil && s.Items.IsObject && len(s.Items.Properties) > 0
}

// itemTypeName is the generated struct name for an object-array's element,
// e.g. (SC, char_data) -> SCCharDataItem.
func itemTypeName(pkt, field string) string { return pkt + pascalCase(field) + "Item" }

func subfieldType(s *Schema) string {
	switch s.TypeStr {
	case "number", "integer":
		return "int"
	case "boolean":
		return "bool"
	default:
		return "string"
	}
}

func subfieldEncode(expr string, s *Schema) string {
	switch s.TypeStr {
	case "number", "integer":
		return "itoa(" + expr + ")"
	case "boolean":
		return "boolToWire(" + expr + ")"
	default:
		return "escapeFanta(" + expr + ")"
	}
}

func subfieldDecode(expr string, s *Schema) string {
	switch s.TypeStr {
	case "number", "integer":
		return "atoiOrZero(" + expr + ")"
	case "boolean":
		return "wireToBool(" + expr + ")"
	default:
		return "unescapeFanta(" + expr + ")"
	}
}

// emitItemStruct writes the element struct for an object-array plus its
// wireFields (encode one object slot) and parse helper (decode one object
// slot). Subfields are joined/split on "&", the generic object wire form.
func emitItemStruct(b *strings.Builder, name string, item *Schema) {
	fmt.Fprintf(b, "type %s struct {\n", name)
	for _, sp := range item.Properties {
		fmt.Fprintf(b, "\t%s %s `json:%q`\n", pascalCase(sp.Name), subfieldType(sp.Schema), sp.Name)
	}
	b.WriteString("}\n\n")

	var encs []string
	for _, sp := range item.Properties {
		encs = append(encs, subfieldEncode("it."+pascalCase(sp.Name), sp.Schema))
	}
	fmt.Fprintf(b, "func (it %s) wireFields() string {\n\treturn joinAmp([]string{%s})\n}\n\n", name, strings.Join(encs, ", "))

	fmt.Fprintf(b, "func parse%s(s string) %s {\n\tparts := splitAmp(s, %d)\n\tvar it %s\n", name, name, len(item.Properties), name)
	for i, sp := range item.Properties {
		fmt.Fprintf(b, "\tif len(parts) > %d {\n\t\tit.%s = %s\n\t}\n", i, pascalCase(sp.Name), subfieldDecode(fmt.Sprintf("parts[%d]", i), sp.Schema))
	}
	b.WriteString("\treturn it\n}\n\n")
}

func emitPackets(packets []*Schema, enumNames, typeNames map[string]*Schema) string {
	var b strings.Builder
	b.WriteString("// Code generated by cmd/aolib-gen from spec. DO NOT EDIT.\n\n")
	b.WriteString("package aolib\n\n")
	for _, s := range packets {
		// Element structs for any object-array fields, emitted before the packet.
		for _, p := range s.Properties {
			if isObjectArray(p.Schema) {
				emitItemStruct(&b, itemTypeName(s.Name, p.Name), p.Schema.Items)
			}
		}
		b.WriteString("// " + s.Name + " is " + strings.TrimSpace(s.Description) + "\n")
		fmt.Fprintf(&b, "type %s struct {\n", s.Name)
		for _, p := range s.Properties {
			if p.Schema.Const != "" {
				continue
			}
			ft := fieldType(&p, enumNames, typeNames)
			if isObjectArray(p.Schema) {
				ft = "[]" + itemTypeName(s.Name, p.Name)
			}
			fmt.Fprintf(&b, "\t%s %s `json:%q`\n", pascalCase(p.Name), ft, p.Name)
		}
		b.WriteString("}\n\n")
		fmt.Fprintf(&b, "func (p *%s) Header() string { return %q }\n\n", s.Name, s.Header)
		var consts []string
		for _, p := range s.Properties {
			if p.Schema.Const != "" {
				consts = append(consts, fmt.Sprintf("%q: %q", p.Name, p.Schema.Const))
			}
		}
		if len(consts) > 0 {
			fmt.Fprintf(&b, "func (p *%s) jsonConsts() map[string]string {\n\treturn map[string]string{%s}\n}\n\n", s.Name, strings.Join(consts, ", "))
		}
		// x-fanta-codec packets hand-write Args and Parse in codecs.go.
		if s.XFantaCodec != "" {
			continue
		}
		fmt.Fprintf(&b, "func (p *%s) Args() []string {\n\tvar args []string\n", s.Name)
		for _, p := range s.Properties {
			if p.Schema.Const != "" {
				fmt.Fprintf(&b, "\targs = append(args, %q)\n", p.Schema.Const)
				continue
			}
			if p.Schema.TypeStr == "array" {
				switch {
				case isObjectArray(p.Schema):
					fmt.Fprintf(&b, "\tfor _, it := range p.%s {\n\t\targs = append(args, it.wireFields())\n\t}\n", pascalCase(p.Name))
				case enumArrayOf(&p, enumNames) != nil:
					e := enumArrayOf(&p, enumNames)
					if len(e.XWireInts) > 0 {
						fmt.Fprintf(&b, "\tfor _, v := range p.%s {\n\t\targs = append(args, itoa(%sToWire[v]))\n\t}\n", pascalCase(p.Name), lowerFirst(e.Name))
					} else {
						fmt.Fprintf(&b, "\tfor _, v := range p.%s {\n\t\targs = append(args, string(v))\n\t}\n", pascalCase(p.Name))
					}
				case p.Schema.Items != nil && (p.Schema.Items.TypeStr == "number" || p.Schema.Items.TypeStr == "integer"):
					fmt.Fprintf(&b, "\targs = append(args, intsToStrs(p.%s)...)\n", pascalCase(p.Name))
				default:
					fmt.Fprintf(&b, "\targs = append(args, p.%s...)\n", pascalCase(p.Name))
				}
				continue
			}
			fmt.Fprintf(&b, "\targs = append(args, %s)\n", encodeExpr(&p, enumNames, typeNames))
		}
		b.WriteString("\treturn args\n}\n\n")
		needsGet := false
		for _, p := range s.Properties {
			if p.Schema.Const == "" && p.Schema.TypeStr != "array" {
				needsGet = true
				break
			}
		}
		fmt.Fprintf(&b, "func Parse%s(body []string) (*%s, error) {\n", s.Name, s.Name)
		fmt.Fprintf(&b, "\tp := &%s{}\n", s.Name)
		if needsGet {
			b.WriteString("\tget := func(i int) string { if i < len(body) { return body[i] }; return \"\" }\n")
		}
		if len(s.Properties) > 0 {
			b.WriteString("\tcursor := 0\n")
		}
		for _, p := range s.Properties {
			if p.Schema.Const != "" {
				b.WriteString("\tcursor++ // const slot\n")
				continue
			}
			if p.Schema.TypeStr == "array" {
				if isObjectArray(p.Schema) {
					item := itemTypeName(s.Name, p.Name)
					fmt.Fprintf(&b, "\tfor _, slot := range body[cursor:] {\n\t\tp.%s = append(p.%s, parse%s(slot))\n\t}\n", pascalCase(p.Name), pascalCase(p.Name), item)
					b.WriteString("\tcursor = len(body)\n")
					continue
				}
				if e := enumArrayOf(&p, enumNames); e != nil {
					fld := pascalCase(p.Name)
					if len(e.XWireInts) > 0 {
						fmt.Fprintf(&b, "\tfor _, slot := range body[cursor:] {\n\t\tp.%s = append(p.%s, %sFromWire[atoiOrZero(slot)])\n\t}\n", fld, fld, lowerFirst(e.Name))
					} else {
						fmt.Fprintf(&b, "\tfor _, slot := range body[cursor:] {\n\t\tp.%s = append(p.%s, %s(unescapeFanta(slot)))\n\t}\n", fld, fld, e.Name)
					}
					b.WriteString("\tcursor = len(body)\n")
					continue
				}
				fmt.Fprintf(&b, "\tp.%s = ", pascalCase(p.Name))
				if p.Schema.Items != nil && (p.Schema.Items.TypeStr == "number" || p.Schema.Items.TypeStr == "integer") {
					b.WriteString("strsToInts(body[cursor:])\n")
				} else {
					b.WriteString("body[cursor:]\n")
				}
				b.WriteString("\tcursor = len(body)\n")
				continue
			}
			fmt.Fprintf(&b, "\t%s\n\tcursor++\n", decodeStmt(&p, enumNames, typeNames))
		}
		b.WriteString("\treturn p, nil\n}\n\n")
	}
	return b.String()
}

func emitRegistry(packets []*Schema) string {
	var c2s, s2c []*Schema
	for _, s := range packets {
		switch s.XReceiver {
		case "server":
			c2s = append(c2s, s)
		case "client":
			s2c = append(s2c, s)
		}
	}
	var b strings.Builder
	b.WriteString("// Code generated by cmd/aolib-gen from spec. DO NOT EDIT.\n\n")
	b.WriteString("package aolib\n\n")
	b.WriteString("// decoder turns a positional body into its typed packet struct.\n")
	b.WriteString("type decoder func(body []string) (any, error)\n\n")
	b.WriteString("var c2sDecoders = map[string]decoder{\n")
	for _, s := range c2s {
		fmt.Fprintf(&b, "\t%q: func(b []string) (any, error) { return Parse%s(b) },\n", s.Header, s.Name)
	}
	b.WriteString("}\n\n")
	b.WriteString("var s2cDecoders = map[string]decoder{\n")
	for _, s := range s2c {
		fmt.Fprintf(&b, "\t%q: func(b []string) (any, error) { return Parse%s(b) },\n", s.Header, s.Name)
	}
	b.WriteString("}\n\n")
	b.WriteString("// c2sJSON / s2cJSON decode the JSON wire form straight into the typed\n")
	b.WriteString("// struct, so enum fields keep their meta string values and Offset stays\n")
	b.WriteString("// an {x,y} object. Keyed by direction like the FantaCode decoders.\n")
	b.WriteString("var c2sJSON = map[string]jsonDecoder{\n")
	for _, s := range c2s {
		fmt.Fprintf(&b, "\t%q: jsonDecoderFor[%s],\n", s.Header, s.Name)
	}
	b.WriteString("}\n\n")
	b.WriteString("var s2cJSON = map[string]jsonDecoder{\n")
	for _, s := range s2c {
		fmt.Fprintf(&b, "\t%q: jsonDecoderFor[%s],\n", s.Header, s.Name)
	}
	b.WriteString("}\n")
	return b.String()
}

func emitEnums(enums []*Schema) string {
	var b strings.Builder
	b.WriteString("// Code generated by cmd/aolib-gen from spec. DO NOT EDIT.\n\n")
	b.WriteString("package aolib\n\n")
	for _, e := range enums {
		b.WriteString("// " + e.Name + " is " + strings.TrimSpace(e.Description) + "\n")
		fmt.Fprintf(&b, "type %s string\n\nconst (\n", e.Name)
		for _, v := range e.Enum {
			fmt.Fprintf(&b, "\t%s%s %s = %q\n", e.Name, pascalCase(v), e.Name, v)
		}
		b.WriteString(")\n\n")
		if len(e.XWireInts) > 0 {
			fmt.Fprintf(&b, "var %sToWire = map[%s]int{\n", lowerFirst(e.Name), e.Name)
			for i, v := range e.Enum {
				if i < len(e.XWireInts) {
					fmt.Fprintf(&b, "\t%s%s: %d,\n", e.Name, pascalCase(v), e.XWireInts[i])
				}
			}
			b.WriteString("}\n\n")
			fmt.Fprintf(&b, "var %sFromWire = map[int]%s{\n", lowerFirst(e.Name), e.Name)
			for i, v := range e.Enum {
				if i < len(e.XWireInts) {
					fmt.Fprintf(&b, "\t%d: %s%s,\n", e.XWireInts[i], e.Name, pascalCase(v))
				}
			}
			b.WriteString("}\n\n")
		}
	}
	return b.String()
}

func emitTypes(types []*Schema) string {
	var b strings.Builder
	b.WriteString("// Code generated by cmd/aolib-gen from spec. DO NOT EDIT.\n\n")
	b.WriteString("package aolib\n\n")
	for _, t := range types {
		b.WriteString("// " + t.Name + " is " + strings.TrimSpace(t.Description) + "\n")
		fmt.Fprintf(&b, "type %s struct {\n", t.Name)
		for _, p := range t.Properties {
			ft := fieldType(&p, nil, nil)
			fmt.Fprintf(&b, "\t%s %s `json:%q`\n", pascalCase(p.Name), ft, p.Name)
		}
		b.WriteString("}\n\n")
	}
	return b.String()
}
