package aolib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/fs"
	"reflect"
	"sort"
	"strings"

	"github.com/santhosh-tekuri/jsonschema/v6"
)

// PacketOptions describes a custom packet: a header the spec doesn't define.
type PacketOptions[T any] struct {
	// Schema is a JSON Schema in the spec's packet format, and may $ref the
	// shared types. With it the packet gets the spec packets' validation,
	// defaults, JSON key order, Extras and FantaCode. Without it the packet's
	// JSON is T's own fields after "$header", and it is JSON-only unless Fanta
	// is set.
	Schema []byte
	// Fanta overrides the FantaCode form.
	Fanta *Fanta[T]
	// JSON overrides the JSON form.
	JSON *JSONForm[T]
}

// Fanta converts a custom packet to and from its FantaCode fields (between the
// header and the trailing "%").
type Fanta[T any] struct {
	Encode func(T) ([]string, error)
	Decode func(args []string) (T, error)
}

// JSONForm converts a custom packet to and from a JSON object; the library
// puts "$header" first.
type JSONForm[T any] struct {
	Encode func(T) ([]byte, error)
	Decode func(raw []byte) (T, error)
}

type customPacket struct {
	encode func(p any, mode WireMode) ([]byte, error)
	// decode reports ok=false when the packet has no form for the frame's format.
	decode func(raw []byte, isJSON bool) (p any, ok bool, err error)
}

var customPackets = map[string]customPacket{}

// RegisterPacket registers a custom packet whose payload is a T. It panics for
// a spec header (add fields to those with Extras) or an invalid schema.
func RegisterPacket[T any](header string, opts PacketOptions[T]) {
	if _, ok := c2sDecoders[header]; ok {
		panic(fmt.Sprintf("aolib: %q is a spec packet; add fields to it with Extras", header))
	}
	if _, ok := s2cDecoders[header]; ok {
		panic(fmt.Sprintf("aolib: %q is a spec packet; add fields to it with Extras", header))
	}
	r := &registration[T]{header: header, opts: opts}
	if opts.Schema != nil {
		if err := r.loadSchema(); err != nil {
			panic(fmt.Sprintf("aolib: schema for %q: %v", header, err))
		}
	}
	customPackets[header] = customPacket{encode: r.encode, decode: r.decode}
}

type registration[T any] struct {
	header   string
	opts     PacketOptions[T]
	schema   *node
	baseID   string
	compiled *jsonschema.Schema
}

func (r *registration[T]) loadSchema() error {
	v, err := parseOrdered(r.opts.Schema)
	if err != nil {
		return err
	}
	s, ok := v.(*node)
	if !ok {
		return fmt.Errorf("not a JSON object")
	}
	props := s.child("properties")
	if props == nil {
		props = &node{vals: map[string]any{}}
		s.keys = append(s.keys, "properties")
		s.vals["properties"] = props
	}
	if h := props.child("$header"); h != nil {
		if c, _ := h.vals["const"].(string); c != r.header {
			return fmt.Errorf("declares $header %q", c)
		}
	} else {
		props.keys = append([]string{"$header"}, props.keys...)
		props.vals["$header"] = &node{keys: []string{"type", "const"}, vals: map[string]any{"type": "string", "const": r.header}}
	}
	r.baseID = s.str("$id")
	if r.baseID == "" {
		r.baseID = "/packets/schemas/" + r.header + ".schema.json"
		s.keys = append(s.keys, "$id")
		s.vals["$id"] = r.baseID
	}
	r.schema = s
	r.compiled, err = compileWithSpec(r.baseID, toPlain(s))
	return err
}

// compileWithSpec compiles a schema alongside the spec's own, so its $refs resolve.
func compileWithSpec(id string, schema any) (*jsonschema.Schema, error) {
	c := jsonschema.NewCompiler()
	c.DefaultDraft(jsonschema.Draft7)
	err := fs.WalkDir(specFS, "spec", func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		raw, err := specFS.ReadFile(p)
		if err != nil {
			return err
		}
		doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
		if err != nil {
			return err
		}
		return c.AddResource(specBase+strings.TrimPrefix(p, "spec/"), doc)
	})
	if err != nil {
		return nil, err
	}
	raw, err := marshalJSON(schema)
	if err != nil {
		return nil, err
	}
	doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	url := specBase + strings.TrimPrefix(id, "/")
	if err := c.AddResource(url, doc); err != nil {
		return nil, err
	}
	return c.Compile(url)
}

func (r *registration[T]) validate(n *node) error {
	if r.compiled == nil {
		return nil
	}
	plain := toPlain(n).(map[string]any)
	plain["$header"] = r.header
	raw, err := marshalJSON(plain)
	if err != nil {
		return err
	}
	doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
	if err != nil {
		return err
	}
	if err := r.compiled.Validate(doc); err != nil {
		return &ValidationError{Header: r.header, Detail: validationDetail(err)}
	}
	return nil
}

func (r *registration[T]) payload(p any) (T, error) {
	switch v := p.(type) {
	case T:
		return v, nil
	case *T:
		if v != nil {
			return *v, nil
		}
	}
	var zero T
	return zero, fmt.Errorf("aolib: %q payload is %T, want %T", r.header, p, zero)
}

// toNode converts a payload to its fields, plus its Extras.
func (r *registration[T]) toNode(t T) (*node, map[string]any, error) {
	raw, err := marshalJSON(t)
	if err != nil {
		return nil, nil, err
	}
	v, err := parseOrdered(raw)
	if err != nil {
		return nil, nil, err
	}
	n, ok := v.(*node)
	if !ok {
		return nil, nil, fmt.Errorf("aolib: %q payload must encode to a JSON object, got %s", r.header, raw)
	}
	return n, getExtras(&t), nil
}

func (r *registration[T]) fromNode(n *node, extras map[string]any) (T, error) {
	var t T
	raw, err := marshalJSON(toPlain(n))
	if err != nil {
		return t, err
	}
	if err := json.Unmarshal(raw, &t); err != nil {
		return t, err
	}
	setExtras(&t, extras)
	return t, nil
}

func (r *registration[T]) encode(p any, mode WireMode) ([]byte, error) {
	t, err := r.payload(p)
	if err != nil {
		return nil, err
	}
	n, extras, err := r.toNode(t)
	if err != nil {
		return nil, err
	}
	if r.schema != nil {
		applySchemaDefaults(r.schema, n, r.baseID)
		if err := r.validate(n); err != nil {
			return nil, err
		}
	}
	switch mode {
	case WireFanta:
		switch {
		case r.opts.Fanta != nil:
			args, err := r.opts.Fanta.Encode(t)
			if err != nil {
				return nil, err
			}
			return frameFanta(r.header, args), nil
		case r.schema != nil:
			return frameFanta(r.header, schemaArgs(r.schema, n, r.baseID)), nil
		}
		return nil, fmt.Errorf("aolib: %q is JSON-only and this session is in FantaCode mode", r.header)
	case WireJSON:
		var body bytes.Buffer
		switch {
		case r.opts.JSON != nil:
			raw, err := r.opts.JSON.Encode(t)
			if err != nil {
				return nil, err
			}
			v, err := parseOrdered(raw)
			obj, ok := v.(*node)
			if err != nil || !ok {
				return nil, fmt.Errorf("aolib: %q JSON form must be an object, got %s", r.header, raw)
			}
			delete(obj.vals, "$header")
			if err := writeOrdered(&body, nil, obj, ""); err != nil {
				return nil, err
			}
		case r.schema != nil:
			if err := writeOrdered(&body, r.schema, n, r.baseID); err != nil {
				return nil, err
			}
		default:
			if err := writeOrdered(&body, nil, n, ""); err != nil {
				return nil, err
			}
		}
		return r.frameJSON(body.Bytes(), n, extras)
	}
	return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
}

// frameJSON puts "$header" before an encoded object and Extras after it.
func (r *registration[T]) frameJSON(obj []byte, fields *node, extras map[string]any) ([]byte, error) {
	h, _ := marshalJSON(r.header)
	var b bytes.Buffer
	b.WriteString(`{"$header":`)
	b.Write(h)
	if inner := bytes.TrimSpace(obj[1 : len(obj)-1]); len(inner) > 0 {
		b.WriteByte(',')
		b.Write(inner)
	}
	keys := make([]string, 0, len(extras))
	for k := range extras {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		if _, taken := fields.vals[k]; taken || strings.HasPrefix(k, "$") {
			return nil, fmt.Errorf("aolib: Extras key %q collides with a field or reserved name", k)
		}
		v, err := marshalJSON(extras[k])
		if err != nil {
			return nil, err
		}
		writeJSONMember(&b, k, v)
	}
	b.WriteByte('}')
	return b.Bytes(), nil
}

func (r *registration[T]) decode(raw []byte, isJSON bool) (any, bool, error) {
	if isJSON {
		if r.opts.JSON != nil {
			t, err := r.opts.JSON.Decode(raw)
			if err != nil {
				return nil, true, err
			}
			return t, true, r.validatePayload(t)
		}
		v, err := parseOrdered(raw)
		obj, ok := v.(*node)
		if err != nil || !ok {
			return nil, true, fmt.Errorf("aolib: %q frame is not a JSON object", r.header)
		}
		fields, extras := r.splitExtras(obj)
		if r.schema != nil {
			applySchemaDefaults(r.schema, fields, r.baseID)
			if err := r.validate(fields); err != nil {
				return nil, true, err
			}
		}
		t, err := r.fromNode(fields, extras)
		return t, true, err
	}
	pkt, err := NewPacket(strings.TrimSuffix(string(raw), "%"))
	if err != nil {
		return nil, true, err
	}
	switch {
	case r.opts.Fanta != nil:
		t, err := r.opts.Fanta.Decode(pkt.Body)
		if err != nil {
			return nil, true, err
		}
		return t, true, r.validatePayload(t)
	case r.schema != nil:
		n, err := schemaFromArgs(r.schema, pkt.Body, r.baseID)
		if err != nil {
			return nil, true, err
		}
		applySchemaDefaults(r.schema, n, r.baseID)
		if err := r.validate(n); err != nil {
			return nil, true, err
		}
		t, err := r.fromNode(n, nil)
		return t, true, err
	}
	return nil, false, nil
}

func (r *registration[T]) validatePayload(t T) error {
	if r.schema == nil {
		return nil
	}
	n, _, err := r.toNode(t)
	if err != nil {
		return err
	}
	return r.validate(n)
}

// splitExtras separates the keys the packet doesn't define: the schema's
// properties, or T's own JSON fields without a schema.
func (r *registration[T]) splitExtras(obj *node) (*node, map[string]any) {
	known := map[string]bool{}
	if r.schema != nil {
		for _, k := range r.schema.child("properties").keys {
			known[k] = true
		}
	} else {
		jsonFieldNames(reflect.TypeOf((*T)(nil)).Elem(), known)
	}
	fields := &node{vals: map[string]any{}}
	var extras map[string]any
	for _, k := range obj.keys {
		switch {
		case k == "$header" || k == "header":
		case known[k]:
			fields.keys = append(fields.keys, k)
			fields.vals[k] = obj.vals[k]
		default:
			if extras == nil {
				extras = map[string]any{}
			}
			extras[k] = plainJSON(obj.vals[k])
		}
	}
	return fields, extras
}

// plainJSON converts a parsed value to what json.Unmarshal into any gives,
// matching spec packets' Extras.
func plainJSON(v any) any {
	raw, err := marshalJSON(toPlain(v))
	if err != nil {
		return nil
	}
	var out any
	_ = json.Unmarshal(raw, &out)
	return out
}

// jsonFieldNames adds the JSON keys encoding/json uses for t's fields.
func jsonFieldNames(t reflect.Type, into map[string]bool) {
	if t.Kind() != reflect.Struct {
		return
	}
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		tag, _, _ := strings.Cut(f.Tag.Get("json"), ",")
		switch {
		case tag == "-" || (!f.IsExported() && !f.Anonymous):
		case f.Anonymous && tag == "" && f.Type.Kind() == reflect.Struct:
			jsonFieldNames(f.Type, into)
		case tag != "":
			into[tag] = true
		default:
			into[f.Name] = true
		}
	}
}

// getExtras and setExtras use an `Extras map[string]any` field on T, if any.
func getExtras[T any](t *T) map[string]any {
	if f := extrasField(t); f.IsValid() {
		m, _ := f.Interface().(map[string]any)
		return m
	}
	return nil
}

func setExtras[T any](t *T, extras map[string]any) {
	if f := extrasField(t); f.IsValid() && extras != nil {
		f.Set(reflect.ValueOf(extras))
	}
}

func extrasField[T any](t *T) reflect.Value {
	v := reflect.ValueOf(t).Elem()
	if v.Kind() != reflect.Struct {
		return reflect.Value{}
	}
	f := v.FieldByName("Extras")
	if !f.IsValid() || f.Type() != reflect.TypeOf(map[string]any(nil)) {
		return reflect.Value{}
	}
	return f
}

// encodeCustom frames a custom packet in the given wire mode.
func encodeCustom(header string, p any, mode WireMode) ([]byte, error) {
	c, ok := customPackets[header]
	if !ok {
		return nil, fmt.Errorf("aolib: header %q is not registered; call RegisterPacket first", header)
	}
	return c.encode(p, mode)
}

// EscapeFanta escapes the chat-format metacharacters (#, &, %, $) so a string
// field survives a FantaCode slot.
func EscapeFanta(s string) string { return escapeFanta(s) }

// UnescapeFanta inverts EscapeFanta.
func UnescapeFanta(s string) string { return unescapeFanta(s) }
