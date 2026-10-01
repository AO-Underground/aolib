package aolib

import (
	"encoding/json"
	"fmt"
)

// Codec fully defines one packet header's wire form in BOTH formats. It is the
// same idea as a meta packet's x-fanta-codec (e.g. ARUP), only registered at
// runtime by a caller for a custom (non-meta) header. aolib models only
// canonical aolib-meta; a server that speaks a nonstandard header registers a
// Codec for it.
//
// The rule: a codec MUST implement both FantaCode and JSON. There is no
// JSON-only or fanta-only custom packet. Each function maps the raw wire
// payload for one format to or from the caller's typed packet value.
//
// The library owns framing. On FantaCode it strips the header and the trailing
// "%" and hands the codec the positional fields, then re-wraps HEADER#a#b#%. On
// JSON it guarantees the "$header" key; the codec sees and produces the object
// text. EscapeFanta / UnescapeFanta are exposed for codecs whose string fields
// may contain the chat metacharacters.
type Codec struct {
	// EncodeFanta returns the FantaCode positional fields (no header, no
	// trailing "%") for a typed packet.
	EncodeFanta func(p any) ([]string, error)
	// DecodeFanta turns FantaCode positional fields into a typed packet.
	DecodeFanta func(args []string) (any, error)
	// EncodeJSON returns the JSON object text for a typed packet; the library
	// injects "$header" if the codec omits it.
	EncodeJSON func(p any) (string, error)
	// DecodeJSON turns the JSON object text (including "$header") into a typed
	// packet.
	DecodeJSON func(raw string) (any, error)
}

var codecs = map[string]Codec{}

// RegisterCodec registers (or overrides) the codec for a header. It panics if
// any of the four wire directions is missing, enforcing the both-formats rule.
func RegisterCodec(header string, c Codec) {
	if c.EncodeFanta == nil || c.DecodeFanta == nil || c.EncodeJSON == nil || c.DecodeJSON == nil {
		panic(fmt.Sprintf("aolib: codec for %q must implement both FantaCode and JSON (all four functions)", header))
	}
	codecs[header] = c
}

// encodeCustom serializes a typed custom packet through its registered codec in
// the given wire mode, applying framing.
func encodeCustom(header string, p any, mode WireMode) ([]byte, error) {
	c, ok := codecs[header]
	if !ok {
		return nil, fmt.Errorf("aolib: no codec registered for header %q", header)
	}
	switch mode {
	case WireFanta:
		args, err := c.EncodeFanta(p)
		if err != nil {
			return nil, err
		}
		return frameFanta(header, args), nil
	case WireJSON:
		raw, err := c.EncodeJSON(p)
		if err != nil {
			return nil, err
		}
		return ensureHeader([]byte(raw), header)
	default:
		return nil, fmt.Errorf("aolib: unknown wire mode %d", mode)
	}
}

// ensureHeader guarantees the JSON object carries a matching "$header" key.
func ensureHeader(raw []byte, header string) ([]byte, error) {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(raw, &obj); err != nil {
		return nil, fmt.Errorf("aolib: codec JSON for %q is not an object: %w", header, err)
	}
	h, _ := json.Marshal(header)
	obj["$header"] = h
	return json.Marshal(obj)
}

// EscapeFanta escapes the chat-format metacharacters (#, &, %, $) so a string
// field survives a FantaCode slot. Exposed for custom codecs.
func EscapeFanta(s string) string { return escapeFanta(s) }

// UnescapeFanta inverts EscapeFanta. Exposed for custom codecs.
func UnescapeFanta(s string) string { return unescapeFanta(s) }
