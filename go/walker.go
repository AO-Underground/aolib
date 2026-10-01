package aolib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/fs"
	"math"
	"path"
	"strconv"
	"strings"
	"sync"
)

// The runtime form of the spec's FantaCode walker rules, for custom packets
// registered with a schema. Spec packets use generated code instead.

// node is a parsed JSON value that keeps object key order.
type node struct {
	keys []string
	vals map[string]any
}

func (n *node) get(k string) any {
	if n == nil {
		return nil
	}
	return n.vals[k]
}

func (n *node) str(k string) string { s, _ := n.get(k).(string); return s }

func (n *node) child(k string) *node { c, _ := n.get(k).(*node); return c }

func parseOrdered(raw []byte) (any, error) {
	dec := json.NewDecoder(bytes.NewReader(raw))
	dec.UseNumber()
	return parseValue(dec)
}

func parseValue(dec *json.Decoder) (any, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch t := tok.(type) {
	case json.Delim:
		switch t {
		case '{':
			n := &node{vals: map[string]any{}}
			for dec.More() {
				kt, err := dec.Token()
				if err != nil {
					return nil, err
				}
				k := kt.(string)
				v, err := parseValue(dec)
				if err != nil {
					return nil, err
				}
				if _, dup := n.vals[k]; !dup {
					n.keys = append(n.keys, k)
				}
				n.vals[k] = v
			}
			_, err := dec.Token()
			return n, err
		case '[':
			var arr []any
			for dec.More() {
				v, err := parseValue(dec)
				if err != nil {
					return nil, err
				}
				arr = append(arr, v)
			}
			_, err := dec.Token()
			if arr == nil {
				arr = []any{}
			}
			return arr, err
		}
		return nil, fmt.Errorf("unexpected %v", t)
	default:
		return t, nil
	}
}

// refSchemas holds the spec's shared types by $id, for $ref resolution.
var (
	refSchemasOnce sync.Once
	refSchemas     map[string]*node
)

func loadRefSchemas() {
	refSchemas = map[string]*node{}
	_ = fs.WalkDir(specFS, "spec/types", func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		raw, err := specFS.ReadFile(p)
		if err != nil {
			return err
		}
		v, err := parseOrdered(raw)
		if n, ok := v.(*node); err == nil && ok {
			refSchemas[n.str("$id")] = n
		}
		return nil
	})
}

// resolve follows a $ref relative to baseID; sibling keywords win.
func resolve(s *node, baseID string) *node {
	ref := s.str("$ref")
	if ref == "" {
		return s
	}
	refSchemasOnce.Do(loadRefSchemas)
	target := refSchemas[path.Join(path.Dir(baseID), ref)]
	if target == nil {
		return s
	}
	merged := &node{keys: append([]string(nil), target.keys...), vals: map[string]any{}}
	for k, v := range target.vals {
		merged.vals[k] = v
	}
	for _, k := range s.keys {
		if _, ok := merged.vals[k]; !ok {
			merged.keys = append(merged.keys, k)
		}
		merged.vals[k] = s.vals[k]
	}
	return merged
}

func schemaType(s *node) string {
	switch t := s.get("type").(type) {
	case string:
		return t
	case []any:
		if len(t) > 0 {
			v, _ := t[0].(string)
			return v
		}
	}
	return ""
}

func numbers(v any) []float64 {
	arr, _ := v.([]any)
	out := make([]float64, 0, len(arr))
	for _, x := range arr {
		f, _ := toFloat(x)
		out = append(out, f)
	}
	return out
}

func toFloat(v any) (float64, bool) {
	switch n := v.(type) {
	case json.Number:
		f, err := n.Float64()
		return f, err == nil
	case float64:
		return n, true
	}
	return 0, false
}

func formatNumber(v any) string {
	switch n := v.(type) {
	case json.Number:
		return n.String()
	case float64:
		if n == math.Trunc(n) && math.Abs(n) < 1e15 {
			return strconv.FormatInt(int64(n), 10)
		}
		return strconv.FormatFloat(n, 'g', -1, 64)
	}
	return fmt.Sprint(v)
}

func encodeSlot(raw *node, v any, baseID string) string {
	s := resolve(raw, baseID)
	if c, ok := s.vals["const"]; ok {
		return encodeScalarSlot(schemaType(s), c)
	}
	if enum, ok := s.get("enum").([]any); ok && s.get("x-wire-ints") != nil {
		ints := numbers(s.get("x-wire-ints"))
		for i, e := range enum {
			if e == v && i < len(ints) {
				return formatNumber(ints[i])
			}
		}
	}
	switch schemaType(s) {
	case "array":
		arr, _ := v.([]any)
		parts := make([]string, len(arr))
		for i, item := range arr {
			parts[i] = encodeSlot(s.child("items"), item, baseID)
		}
		return strings.Join(parts, "&")
	case "object":
		obj, _ := v.(*node)
		props := s.child("properties")
		if bits := s.get("x-wire-bits"); bits != nil {
			b, n := numbers(bits), 0
			for i, k := range props.keys {
				if obj.get(k) == true && i < len(b) {
					n |= int(b[i])
				}
			}
			return strconv.Itoa(n)
		}
		sep := s.str("x-fanta-separator")
		custom := sep != ""
		if !custom {
			sep = "&"
		}
		var parts []string
		allEmpty := true
		for _, k := range props.keys {
			p := encodeSlot(props.child(k), obj.get(k), baseID)
			allEmpty = allEmpty && p == ""
			parts = append(parts, p)
		}
		if custom && allEmpty {
			return ""
		}
		return strings.Join(parts, sep)
	}
	return encodeScalarSlot(schemaType(s), v)
}

func encodeScalarSlot(t string, v any) string {
	switch t {
	case "string":
		s, _ := v.(string)
		return escapeFanta(s)
	case "boolean":
		if v == true {
			return "1"
		}
		return "0"
	case "integer", "number":
		return formatNumber(v)
	}
	return fmt.Sprint(v)
}

func decodeSlot(raw *node, token, name, baseID string) (any, error) {
	s := resolve(raw, baseID)
	if c, ok := s.vals["const"]; ok {
		return c, nil
	}
	if enum, ok := s.get("enum").([]any); ok && s.get("x-wire-ints") != nil {
		ints := numbers(s.get("x-wire-ints"))
		f, err := strconv.ParseFloat(token, 64)
		for i, w := range ints {
			if err == nil && w == f && i < len(enum) {
				return enum[i], nil
			}
		}
		return nil, fmt.Errorf("invalid enum wire value for field %q: %q", name, token)
	}
	switch schemaType(s) {
	case "array":
		out := []any{}
		if token == "" {
			return out, nil
		}
		for i, part := range strings.Split(token, "&") {
			v, err := decodeSlot(s.child("items"), part, fmt.Sprintf("%s[%d]", name, i), baseID)
			if err != nil {
				return nil, err
			}
			out = append(out, v)
		}
		return out, nil
	case "object":
		props := s.child("properties")
		obj := &node{vals: map[string]any{}}
		if bits := s.get("x-wire-bits"); bits != nil {
			n, err := strconv.Atoi(token)
			if err != nil || n < 0 {
				return nil, fmt.Errorf("invalid bitfield for field %q: %q", name, token)
			}
			b := numbers(bits)
			for i, k := range props.keys {
				obj.keys = append(obj.keys, k)
				obj.vals[k] = i < len(b) && n&int(b[i]) != 0
			}
			return obj, nil
		}
		if d, ok := s.vals["default"]; ok && token == "" {
			return d, nil
		}
		sep := s.str("x-fanta-separator")
		if sep == "" {
			sep = "&"
		}
		if s.get("x-fanta-unescape-amp") == true {
			token = strings.ReplaceAll(token, "<and>", "&")
		}
		parts := strings.Split(token, sep)
		for i, k := range props.keys {
			sub := props.child(k)
			if i >= len(parts) {
				if d, ok := resolve(sub, baseID).vals["default"]; ok {
					obj.keys = append(obj.keys, k)
					obj.vals[k] = d
					continue
				}
			}
			part := ""
			if i < len(parts) {
				part = parts[i]
			}
			v, err := decodeSlot(sub, part, name+"."+k, baseID)
			if err != nil {
				return nil, err
			}
			obj.keys = append(obj.keys, k)
			obj.vals[k] = v
		}
		return obj, nil
	case "string":
		return unescapeFanta(token), nil
	case "boolean":
		if token != "0" && token != "1" {
			return nil, fmt.Errorf("invalid boolean for field %q: %q", name, token)
		}
		return token == "1", nil
	case "integer", "number":
		if _, err := strconv.ParseFloat(token, 64); err != nil {
			return nil, fmt.Errorf("invalid number for field %q: %q", name, token)
		}
		return json.Number(token), nil
	}
	return token, nil
}

// schemaArgs encodes a packet's FantaCode fields.
func schemaArgs(schema *node, packet *node, baseID string) []string {
	props := schema.child("properties")
	var args []string
	for _, k := range props.keys {
		if k == "$header" {
			continue
		}
		sub := props.child(k)
		if schemaType(resolve(sub, baseID)) == "array" {
			arr, _ := packet.get(k).([]any)
			for _, item := range arr {
				args = append(args, encodeSlot(resolve(sub, baseID).child("items"), item, baseID))
			}
			continue
		}
		args = append(args, encodeSlot(sub, packet.get(k), baseID))
	}
	return args
}

// schemaFromArgs decodes FantaCode fields; missing trailing fields are left
// out for applySchemaDefaults.
func schemaFromArgs(schema *node, args []string, baseID string) (*node, error) {
	props := schema.child("properties")
	out := &node{vals: map[string]any{}}
	cursor := 0
	for _, k := range props.keys {
		if k == "$header" {
			continue
		}
		sub := props.child(k)
		rs := resolve(sub, baseID)
		if schemaType(rs) == "array" {
			items := []any{}
			for i, tok := range args[min(cursor, len(args)):] {
				v, err := decodeSlot(rs.child("items"), tok, fmt.Sprintf("%s[%d]", k, i), baseID)
				if err != nil {
					return nil, err
				}
				items = append(items, v)
			}
			cursor = len(args)
			out.keys = append(out.keys, k)
			out.vals[k] = items
			continue
		}
		if cursor >= len(args) {
			continue
		}
		v, err := decodeSlot(sub, args[cursor], k, baseID)
		cursor++
		if err != nil {
			return nil, err
		}
		out.keys = append(out.keys, k)
		out.vals[k] = v
	}
	return out, nil
}

// applySchemaDefaults fills missing properties from their schema defaults,
// recursing into objects that are present.
func applySchemaDefaults(schema *node, v *node, baseID string) {
	props := resolve(schema, baseID).child("properties")
	if props == nil || v == nil {
		return
	}
	for _, k := range props.keys {
		sub := resolve(props.child(k), baseID)
		cur, ok := v.vals[k]
		if !ok {
			d, has := sub.vals["default"]
			if !has {
				continue
			}
			cur = d
			v.keys = append(v.keys, k)
			v.vals[k] = d
		}
		if obj, ok := cur.(*node); ok {
			applySchemaDefaults(sub, obj, baseID)
		}
	}
}

// writeOrdered writes v as JSON with object keys in schema order.
func writeOrdered(b *bytes.Buffer, schema *node, v any, baseID string) error {
	s := resolve(schema, baseID)
	switch t := v.(type) {
	case *node:
		props := s.child("properties")
		b.WriteByte('{')
		first := true
		var keys []string
		if props != nil {
			for _, k := range props.keys {
				if _, ok := t.vals[k]; ok {
					keys = append(keys, k)
				}
			}
		} else {
			keys = t.keys
		}
		for _, k := range keys {
			if !first {
				b.WriteByte(',')
			}
			first = false
			kb, _ := marshalJSON(k)
			b.Write(kb)
			b.WriteByte(':')
			if err := writeOrdered(b, props.child(k), t.vals[k], baseID); err != nil {
				return err
			}
		}
		b.WriteByte('}')
	case []any:
		b.WriteByte('[')
		for i, item := range t {
			if i > 0 {
				b.WriteByte(',')
			}
			if err := writeOrdered(b, s.child("items"), item, baseID); err != nil {
				return err
			}
		}
		b.WriteByte(']')
	default:
		raw, err := marshalJSON(t)
		if err != nil {
			return err
		}
		b.Write(raw)
	}
	return nil
}

// toPlain converts a node tree to map[string]any for encoding/json.
func toPlain(v any) any {
	switch t := v.(type) {
	case *node:
		m := make(map[string]any, len(t.keys))
		for _, k := range t.keys {
			m[k] = toPlain(t.vals[k])
		}
		return m
	case []any:
		out := make([]any, len(t))
		for i, x := range t {
			out[i] = toPlain(x)
		}
		return out
	}
	return v
}
