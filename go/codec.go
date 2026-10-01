package aolib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sort"
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
		return appendExtras(p, raw)
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

// encodeJSON marshals a typed packet to the JSON envelope: "$header", then the
// schema's fields in schema order, const slots included. Enum fields are Go
// string types, so they serialise to their meta string values (e.g. "shown").
func encodeJSON(p Outgoing) ([]byte, error) {
	obj, err := toObject(p)
	if err != nil {
		return nil, fmt.Errorf("aolib: JSON encode failed for %q: %w", p.Header(), err)
	}
	if c, ok := p.(interface{ jsonConsts() map[string]string }); ok {
		for k, v := range c.jsonConsts() {
			obj[k], _ = marshalJSON(v)
		}
	}
	h, _ := marshalJSON(p.Header())
	var b bytes.Buffer
	b.WriteString(`{"$header":`)
	b.Write(h)
	var order []string
	if o, ok := p.(interface{ jsonOrder() []string }); ok {
		order = o.jsonOrder()
	}
	for _, k := range order {
		if v, ok := obj[k]; ok {
			writeJSONMember(&b, k, v)
			delete(obj, k)
		}
	}
	for _, k := range sortedKeys(obj) {
		writeJSONMember(&b, k, obj[k])
	}
	b.WriteByte('}')
	return b.Bytes(), nil
}

// appendExtras adds a packet's Extras as top-level keys, sorted, after the
// schema fields. They are JSON-only and unvalidated.
func appendExtras(p Outgoing, raw []byte) ([]byte, error) {
	e, ok := p.(interface{ extras() *map[string]any })
	if !ok || len(*e.extras()) == 0 {
		return raw, nil
	}
	schema := map[string]bool{}
	if o, ok := p.(interface{ jsonOrder() []string }); ok {
		for _, k := range o.jsonOrder() {
			schema[k] = true
		}
	}
	extras := *e.extras()
	b := bytes.NewBuffer(raw[:len(raw)-1])
	for _, k := range sortedKeys(extras) {
		if schema[k] || strings.HasPrefix(k, "$") {
			return nil, fmt.Errorf("aolib: Extras key %q collides with a schema field or reserved name", k)
		}
		v, err := marshalJSON(extras[k])
		if err != nil {
			return nil, fmt.Errorf("aolib: Extras key %q: %w", k, err)
		}
		writeJSONMember(b, k, v)
	}
	b.WriteByte('}')
	return b.Bytes(), nil
}

// marshalJSON is json.Marshal without HTML escaping, so `&`, `<` and `>` go
// out literally, as in aolib-ts.
func marshalJSON(v any) ([]byte, error) {
	var b bytes.Buffer
	enc := json.NewEncoder(&b)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(b.Bytes(), []byte("\n")), nil
}

func writeJSONMember(b *bytes.Buffer, k string, v []byte) {
	key, _ := marshalJSON(k)
	b.WriteByte(',')
	b.Write(key)
	b.WriteByte(':')
	b.Write(v)
}

func sortedKeys[V any](m map[string]V) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

// toObject marshals v and re-reads it as a field map, so a "$header" key can be
// injected without the struct needing a dedicated field.
func toObject(v any) (map[string]json.RawMessage, error) {
	raw, err := marshalJSON(v)
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
	raw, extras, err := splitExtras(p, raw)
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(raw, p); err != nil {
		return nil, err
	}
	if raw, err = withJSONConsts(p, raw); err != nil {
		return nil, err
	}
	if err := validateJSON(p, raw); err != nil {
		return nil, err
	}
	if e, ok := any(p).(interface{ extras() *map[string]any }); ok && len(extras) > 0 {
		*e.extras() = extras
	}
	return p, nil
}

// splitExtras moves the keys p's schema does not define out of a JSON frame.
func splitExtras(p any, raw []byte) ([]byte, map[string]any, error) {
	o, ok := p.(interface{ jsonOrder() []string })
	if !ok {
		return raw, nil, nil
	}
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(raw, &obj); err != nil {
		return nil, nil, err
	}
	known := map[string]bool{"$header": true, "header": true}
	for _, k := range o.jsonOrder() {
		known[k] = true
	}
	var extras map[string]any
	for k, v := range obj {
		if known[k] {
			continue
		}
		var val any
		if err := json.Unmarshal(v, &val); err != nil {
			return nil, nil, err
		}
		if extras == nil {
			extras = map[string]any{}
		}
		extras[k] = val
		delete(obj, k)
	}
	if extras == nil {
		return raw, nil, nil
	}
	raw, err := json.Marshal(obj)
	return raw, extras, err
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
