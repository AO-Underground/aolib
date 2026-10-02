package aolib

// Fanta wire-format helpers, used by the generated Args()/Parse* methods and
// the hand-written MS packet. Mirrors aolib-ts's fanta walker:
//
//   - strings escape #/&/%/$ as <num>/<and>/<percent>/<dollar>
//   - enums with x-wire-ints map to their legacy integer
//   - objects (Offset) join sub-tokens with &; Effect joins with | (and an
//     all-empty Effect collapses to an empty slot)
//   - booleans are "1"/"0"

import (
	"strconv"
	"strings"
)

// escapeFanta escapes the chat-format metacharacters on encode.
func escapeFanta(s string) string {
	s = strings.ReplaceAll(s, "#", "<num>")
	s = strings.ReplaceAll(s, "&", "<and>")
	s = strings.ReplaceAll(s, "%", "<percent>")
	s = strings.ReplaceAll(s, "$", "<dollar>")
	return s
}

// unescapeFanta inverts escapeFanta on decode.
func unescapeFanta(s string) string {
	s = strings.ReplaceAll(s, "<num>", "#")
	s = strings.ReplaceAll(s, "<and>", "&")
	s = strings.ReplaceAll(s, "<percent>", "%")
	s = strings.ReplaceAll(s, "<dollar>", "$")
	return s
}

// itoa is a short alias for strconv.Itoa.
func itoa(n int) string { return strconv.Itoa(n) }

// atoiOrZero parses a base-10 integer, returning 0 on empty/malformed input.
func atoiOrZero(s string) int {
	if s == "" {
		return 0
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return n
}

// getStr returns body[i] or "" if i is out of range.
func getStr(body []string, i int) string {
	if i < len(body) {
		return body[i]
	}
	return ""
}

// boolToWire encodes a boolean as "1"/"0".
func boolToWire(b bool) string {
	if b {
		return "1"
	}
	return "0"
}

// wireToBool decodes a "1"/"0" token to a boolean.
func wireToBool(s string) bool { return s == "1" }

// offsetToWire encodes an Offset as "x&y".
func offsetToWire(o Offset) string { return itoa(o.X) + "&" + itoa(o.Y) }

// offsetFromWire decodes "x&y" (tolerating the legacy <and> escape) into an
// Offset.
func offsetFromWire(s string) Offset {
	s = strings.ReplaceAll(s, "<and>", "&")
	parts := strings.SplitN(s, "&", 2)
	o := Offset{X: atoiOrZero(parts[0])}
	if len(parts) == 2 {
		o.Y = atoiOrZero(parts[1])
	}
	return o
}

// effectToWire packs an Effect into one `name|folder|sound` slot. An all-empty
// Effect is the no-effect sentinel and collapses to an empty slot. See
// spec/packets/EFFECTS.md.
func effectToWire(e Effect) string {
	if e.Name == "" && e.Folder == "" && e.Sound == "" {
		return ""
	}
	return escapeFanta(e.Name) + "|" + escapeFanta(e.Folder) + "|" + escapeFanta(e.Sound)
}

// effectFromWire splits a `name|folder|sound` slot into an Effect, tolerating
// the legacy 1- and 2-part forms positionally. An empty slot is the no-effect
// sentinel.
func effectFromWire(s string) Effect {
	if s == "" {
		return Effect{}
	}
	parts := strings.SplitN(s, "|", 3)
	e := Effect{Name: unescapeFanta(parts[0])}
	if len(parts) > 1 {
		e.Folder = unescapeFanta(parts[1])
	}
	if len(parts) > 2 {
		e.Sound = unescapeFanta(parts[2])
	}
	return e
}

// joinAmp joins an object item's already-encoded subfields with "&", the
// generic wire form for an object slot.
func joinAmp(parts []string) string { return strings.Join(parts, "&") }

// splitAmp splits an object slot into at most n subfields on "&". Escaped
// ampersands survive as "<and>" and are not separators.
func splitAmp(s string, n int) []string { return strings.SplitN(s, "&", n) }

// splitCaret splits a slot carrying an optional "^order" suffix (e.g. a pair
// target) into its base token and suffix token. The suffix is "" when absent.
func splitCaret(s string) (base, suffix string) {
	if i := strings.IndexByte(s, '^'); i >= 0 {
		return s[:i], s[i+1:]
	}
	return s, ""
}

// intsToStrs maps an int slice to its decimal string form.
func intsToStrs(ns []int) []string {
	out := make([]string, len(ns))
	for i, n := range ns {
		out[i] = itoa(n)
	}
	return out
}

// strsToInts maps a string slice to ints (lenient).
func strsToInts(ss []string) []int {
	out := make([]int, len(ss))
	for i, s := range ss {
		out[i] = atoiOrZero(s)
	}
	return out
}
