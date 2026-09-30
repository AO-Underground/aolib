/* Athena - A server for Attorney Online 2 written in Go
Copyright (C) 2022 MangosArentLiterature <mango@transmenace.dev>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

package aolib

// JSON encoding for AO2 packets.
//
// The classic wire format ("FantaCode") encodes a packet as a header followed
// by positional, '#'-separated fields and a trailing "#%". This file adds an
// alternative form where the same packets are encoded as JSON objects with
// named fields, matching the field names documented in
// docs/Development/network/Packet Reference.md and MS Packet Reference.md.
//
// The two directions have distinct schemas because several packets (MS, CT,
// MC, RT, HP, ZZ, CASEA, VS_*) carry a different field set depending on
// receiver. inboundSchemas maps headers used in client→server packets;
// outboundSchemas maps server→client packets.
//
// A field name of "_" is a sentinel meaning "skip in JSON; preserve a
// positional placeholder in the wire body". This is used for two AO2
// protocol relics — CC's leading "0" slot and PV's "CID" literal — which the
// existing FantaCode parsers/encoders expect at fixed slot positions but
// which carry no information.
//
// The schema lookup is intentionally one-way per direction: ParseJSON uses
// inboundSchemas only, BuildJSON uses outboundSchemas only. Decoupling the
// two means the asymmetric packets (MS in particular) don't need any
// runtime direction flag — the right schema is picked by which function
// the caller invokes.

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

// jsonSchema describes how a packet body maps to a JSON object.
//
// fields is the ordered list of named scalar slots (positional in the wire
// body). tailKey, when set, names a JSON array that holds every body entry
// past len(fields). tailItemKeys, when set, indicates each tail entry is a
// '&'-joined record whose sub-values map to these field names — so the JSON
// form is an array of objects rather than an array of strings (used by SC,
// LE, FA, FM, SM).
//
// splitOnStar is a one-off for SD, whose single wire field is a '*'-joined
// list. On encode the value is split into a JSON string array; on decode
// it's joined back into the single wire slot.
type jsonSchema struct {
	fields       []string
	tailKey      string
	tailItemKeys []string
	splitOnStar  bool
	// numericFields names the entries in `fields` whose JSON form must be a
	// JSON number (per the Packet Reference spec) rather than a string. The
	// wire body is always strings, so on encode we parse and re-emit as int.
	numericFields []string
	// booleanFields names the entries in `fields` whose JSON form must be a
	// JSON boolean. Wire encoding is "1"/"0" (or "true"/"false"); on encode
	// we coerce to a Go bool. Unrecognised values fall back to string.
	booleanFields []string
	// pairFields names the entries in `fields` that store an "{x}&{y}"
	// coordinate pair on the wire. On decode the JSON value may be an
	// object {x,y} (joined to "x&y"), a string (passed through), or a
	// scalar number (used as x with no y).
	pairFields []string
}

// fieldSkip is the placeholder used in `fields` to mean "this wire slot is a
// protocol relic — emit nothing in JSON, and tolerate any value on decode".
const fieldSkip = "_"

func (s jsonSchema) isNumeric(name string) bool {
	for _, n := range s.numericFields {
		if n == name {
			return true
		}
	}
	return false
}

func (s jsonSchema) isBoolean(name string) bool {
	for _, n := range s.booleanFields {
		if n == name {
			return true
		}
	}
	return false
}

func (s jsonSchema) isPair(name string) bool {
	for _, n := range s.pairFields {
		if n == name {
			return true
		}
	}
	return false
}

// inboundSchemas describes the client→server packet wire shape.
//
// Coverage matches the Packet Reference doc plus the Athena voice-chat
// extension (VS_FRAME, VS_SPEAK, VS_JOIN, VS_LEAVE). Zero-field packets
// (RC, RM, RD, askchaa, CH, VS_JOIN, VS_LEAVE) are listed explicitly so an
// unknown-header path is reserved for genuinely unrecognised packets.
var inboundSchemas = map[string]jsonSchema{
	"HI": {fields: []string{"hdid"}},
	"ID": {fields: []string{"software", "version"}},
	"FL": {tailKey: "features"},
	"CC": {fields: []string{fieldSkip, "char_id", "char_pw"}},
	"MS": {fields: []string{
		"desk_modifier", "preanim", "character", "emote", "message",
		"side", "sfx_name", "emote_modifier", "char_id", "sfx_delay",
		"shout_modifier", "evidence_id", "flip", "realization", "text_color",
		"showname", "paired_charid", "offset",
		"noninterrupting_preanim", "sfx_looping", "screenshake",
		"frames_shake", "frames_realization", "frames_sfx",
		"additive", "effect", "blips",
	}, pairFields: []string{"offset"}},
	"MC":       {fields: []string{"name", "char_id", "showname", "effects"}},
	"HP":       {fields: []string{"bar", "value"}},
	"RT":       {fields: []string{"animation", "variant"}},
	"CT":       {fields: []string{"name", "message"}},
	"PE":       {fields: []string{"name", "description", "image"}},
	"DE":       {fields: []string{"id"}},
	"EE":       {fields: []string{"id", "name", "description", "image"}},
	"ZZ":       {fields: []string{"reason"}},
	"SETCASE":  {fields: []string{"caselist", "cm", "def", "pro", "judge", "jury", "steno"}},
	"CASEA":    {fields: []string{"case_title", "need_def", "need_pro", "need_judge", "need_jury", "need_steno"}},
	"CH":       {fields: []string{"char_id"}},
	"VS_FRAME": {fields: []string{"data"}},
	"VS_SPEAK": {fields: []string{"on_off"}},
	"askchaa":  {},
	"RC":       {},
	"RM":       {},
	"RD":       {},
	"VS_JOIN":  {},
	"VS_LEAVE": {},
}

// outboundSchemas describes the server→client packet wire shape.
var outboundSchemas = map[string]jsonSchema{
	"decryptor":  {fields: []string{"value"}},
	"ID":         {fields: []string{"player_id", "software", "version"}, numericFields: []string{"player_id"}},
	"PN":         {fields: []string{"player_count", "max_players", "server_description"}, numericFields: []string{"player_count", "max_players"}},
	"FL":         {tailKey: "features"},
	"ASS":        {fields: []string{"asset_url"}},
	"SI":         {fields: []string{"char_count", "evi_count", "mus_count"}, numericFields: []string{"char_count", "evi_count", "mus_count"}},
	"SC":         {tailKey: "char_data", tailItemKeys: []string{"name", "desc", "evidence"}},
	"SM":         {tailKey: "music_list", tailItemKeys: []string{"name"}},
	"DONE":       {},
	"CHECK":      {},
	"BN":         {fields: []string{"background", "position"}},
	"ARUP":       {fields: []string{"update_type"}, tailKey: "update_data"},
	"CharsCheck": {tailKey: "taken"},
	"CT":         {fields: []string{"name", "message", "is_from_server"}, booleanFields: []string{"is_from_server"}},
	"PR":         {fields: []string{"id", "type"}},
	"PU":         {fields: []string{"id", "type", "data"}},
	"PV":         {fields: []string{"player_id", fieldSkip, "char_id"}},
	"MC":         {fields: []string{"name", "char_id", "showname", "looping", "channel", "effects"}},
	"KK":         {fields: []string{"reason"}},
	"KB":         {fields: []string{"reason"}},
	"BD":         {fields: []string{"reason"}},
	"BB":         {fields: []string{"message"}},
	"AUTH":       {fields: []string{"auth_state"}},
	"JD":         {fields: []string{"state"}},
	"LE":         {tailKey: "evidence", tailItemKeys: []string{"name", "description", "image"}},
	"MA":         {fields: []string{"id", "duration", "reason"}},
	"SP":         {fields: []string{"side"}},
	"SD":         {fields: []string{"sides"}, splitOnStar: true},
	"ST":         {fields: []string{"subtheme_name", "should_reload"}},
	"TI":         {fields: []string{"timer_id", "command", "time"}},
	"FA":         {tailKey: "areas", tailItemKeys: []string{"name"}},
	"FM":         {tailKey: "music_list", tailItemKeys: []string{"name"}},
	"CASEA":      {fields: []string{"case_title", "need_def", "need_pro", "need_judge", "need_jury", "need_steno"}},
	"HP":         {fields: []string{"bar", "value"}},
	"RT":         {fields: []string{"animation", "variant"}},
	"ZZ":         {fields: []string{"reason"}},
	// Field order matches MSPacket.ServerArgs (the positional wire body). The
	// numeric/boolean/pair classifications make BuildJSON emit the typed JSON
	// that MSBroadcast.schema.json requires ("no type nonsense"). "blips" is
	// intentionally absent: it is not part of the MSBroadcast schema, so it is
	// never emitted in JSON mode (FantaCode clients still receive it).
	"MS": {
		fields: []string{
			"desk_modifier", "preanim", "character", "emote", "message",
			"side", "sfx_name", "emote_modifier", "char_id", "sfx_delay",
			"shout_modifier", "evidence_id", "flip", "realization", "text_color",
			"showname", "paired_charid", "paired_name", "paired_emote",
			"offset", "paired_offset", "paired_flip",
			"noninterrupting_preanim", "sfx_looping", "screenshake",
			"frames_shake", "frames_realization", "frames_sfx",
			"additive", "effect",
		},
		numericFields: []string{
			"desk_modifier", "emote_modifier", "char_id", "sfx_delay",
			"shout_modifier", "evidence_id", "flip", "text_color",
			"paired_charid", "paired_flip",
		},
		booleanFields: []string{
			"realization", "noninterrupting_preanim", "sfx_looping",
			"screenshake", "additive",
		},
		pairFields: []string{"offset", "paired_offset"},
	},
	"VS_CAPS":  {fields: []string{"enabled", "ptt", "max_peers", "codec", "sample_rate", "frame_ms", "max_frame_bytes"}, booleanFields: []string{"enabled"}},
	"VS_PEERS": {fields: []string{"uids"}},
	"VS_JOIN":  {fields: []string{"uid"}},
	"VS_LEAVE": {fields: []string{"uid"}},
	"VS_AUDIO": {fields: []string{"from_uid", "b64_opus"}},
	"VS_SPEAK": {fields: []string{"uid", "on_off"}},
}

// ParseJSON decodes a JSON-encoded AO2 packet into the same positional
// Packet form produced by NewPacket. This means every existing ParseXxx
// handler (ParseHI, ParseMSClient, ParseCC, ...) keeps working unchanged —
// they don't know or care which wire format produced the body slice.
//
// Field semantics:
//   - "header" is the AO2 packet header; the entire schema lookup hinges on
//     it, so a missing/blank header is an error.
//   - Each scalar field in the schema is coerced to its string form
//     (numbers, booleans, and JSON strings all flatten into the body slot).
//   - For schemas with a tailKey, the named JSON array's entries are
//     appended to the body. When tailItemKeys is set each entry is expected
//     to be an object; its sub-values are joined with '&' to match the
//     FantaCode shape that SC/LE/FA/FM/SM already use internally.
//   - For SD's splitOnStar, the inbound "sides" value may be either a JSON
//     array (joined with '*') or a string (passed through as-is).
//   - Unknown headers are returned as a Packet with no body so the caller's
//     dispatch table can ignore them, mirroring NewPacket's behaviour for
//     unknown FantaCode headers.
func ParseJSON(raw string) (*Packet, error) {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal([]byte(raw), &obj); err != nil {
		return nil, fmt.Errorf("invalid JSON packet: %w", err)
	}
	hdrRaw, ok := obj["$header"]
	if !ok {
		hdrRaw, ok = obj["header"]
	}
	if !ok {
		return nil, fmt.Errorf("JSON packet missing \"$header\"")
	}
	var header string
	if err := json.Unmarshal(hdrRaw, &header); err != nil {
		return nil, fmt.Errorf("invalid JSON header: %w", err)
	}
	if strings.TrimSpace(header) == "" {
		return nil, fmt.Errorf("packet header cannot be empty")
	}

	// Enforce the MS request schema before flattening into the positional body.
	// An invalid in-character packet is rejected here (caller logs and drops) so
	// type nonsense never reaches the MS handler. Validation is a no-op until
	// the schemas are compiled at startup.
	if header == "MS" {
		if err := ValidateMSRequest([]byte(raw)); err != nil {
			return nil, fmt.Errorf("MS request schema validation failed: %w", err)
		}
	}

	schema, known := inboundSchemas[header]
	if !known {
		return &Packet{Header: header}, nil
	}

	body := make([]string, 0, len(schema.fields)+4)
	for _, name := range schema.fields {
		if name == fieldSkip {
			body = append(body, "")
			continue
		}
		if name == "sides" && schema.splitOnStar {
			body = append(body, decodeSidesField(obj[name]))
			continue
		}
		v, present := obj[name]
		if !present {
			body = append(body, "")
			continue
		}
		if schema.isPair(name) {
			body = append(body, decodePairField(v))
			continue
		}
		body = append(body, jsonValueToString(v))
	}

	if schema.tailKey != "" {
		if tail, ok := obj[schema.tailKey]; ok {
			var arr []json.RawMessage
			if err := json.Unmarshal(tail, &arr); err == nil {
				for _, item := range arr {
					if len(schema.tailItemKeys) > 0 {
						body = append(body, decodeTailObject(item, schema.tailItemKeys))
					} else {
						body = append(body, jsonValueToString(item))
					}
				}
			}
		}
	}

	return &Packet{Header: header, Body: body}, nil
}

// buildJSONObject maps a header + positional args to a JSON object using the
// outbound schema. Shared core of BuildJSON and BuildJSONPacket. Unknown
// headers fall through to a generic envelope ({"$header":..., "body":[...]})
// so experimental or extension packets are still deliverable rather than
// silently dropped.
func buildJSONObject(header string, args []string) map[string]any {
	schema, known := outboundSchemas[header]
	if !known {
		return map[string]any{"$header": header, "body": args}
	}

	obj := make(map[string]any, len(schema.fields)+2)
	obj["$header"] = header

	for i, name := range schema.fields {
		if name == fieldSkip || i >= len(args) {
			continue
		}
		val := args[i]
		if name == "sides" && schema.splitOnStar {
			obj[name] = splitNonEmpty(val, "*")
			continue
		}
		if schema.isPair(name) {
			// "x&y" → {"x":..,"y":..}. An empty/unparseable value is omitted so
			// the schema default applies rather than emitting a malformed pair.
			if p, ok := encodePairField(val); ok {
				obj[name] = p
			}
			continue
		}
		if schema.isNumeric(name) {
			if val == "" {
				continue // omit optional empty numeric → schema default applies
			}
			if n, err := strconv.Atoi(val); err == nil {
				obj[name] = n
				continue
			}
			// Non-empty but non-numeric: emit as-is so a validator surfaces it.
			obj[name] = val
			continue
		}
		if schema.isBoolean(name) {
			switch val {
			case "1", "true":
				obj[name] = true
			case "0", "false":
				obj[name] = false
			case "":
				// omit optional empty boolean → schema default applies
			default:
				obj[name] = val
			}
			continue
		}
		obj[name] = val
	}

	if schema.tailKey != "" {
		start := len(schema.fields)
		if start > len(args) {
			start = len(args)
		}
		tail := args[start:]
		if len(schema.tailItemKeys) > 0 {
			arr := make([]map[string]string, len(tail))
			for i, entry := range tail {
				arr[i] = splitTailObject(entry, schema.tailItemKeys)
			}
			obj[schema.tailKey] = arr
		} else {
			arr := make([]string, len(tail))
			copy(arr, tail)
			obj[schema.tailKey] = arr
		}
	}

	return obj
}

// BuildJSON encodes a header + positional args into JSON wire form. Returns
// nil if json.Marshal fails (impossible in practice — every value type used
// here is JSON-serialisable).
func BuildJSON(header string, args []string) []byte {
	buf, err := json.Marshal(buildJSONObject(header, args))
	if err != nil {
		return nil
	}
	return buf
}

// BuildJSONPacket encodes an Outgoing packet into JSON wire form, merging any
// JSON-only fields the packet exposes via JSONOutgoing (e.g. the MS
// additional_chars list) into the object produced from its classic Args().
// Returns nil on marshal failure.
func BuildJSONPacket(p Outgoing) []byte {
	obj := buildJSONObject(p.Header(), p.Args())
	if jp, ok := p.(JSONOutgoing); ok {
		for k, v := range jp.JSONExtra() {
			obj[k] = v
		}
	}
	buf, err := json.Marshal(obj)
	if err != nil {
		return nil
	}
	return buf
}

// jsonValueToString flattens any JSON scalar to the string form used in a
// positional wire body. Numbers and booleans are accepted on top of strings
// so JSON clients don't have to quote numeric fields like char_id or hp
// value — the existing FantaCode parsers expect a string and parse it
// themselves, so we just have to round-trip the digits.
func jsonValueToString(raw json.RawMessage) string {
	s := strings.TrimSpace(string(raw))
	if len(s) == 0 || s == "null" {
		return ""
	}
	if s[0] == '"' {
		var str string
		if err := json.Unmarshal(raw, &str); err == nil {
			return str
		}
	}
	if s == "true" {
		return "1"
	}
	if s == "false" {
		return "0"
	}
	return s
}

// decodeTailObject reads a JSON object representing one entry of an
// object-array tail (SC char_data, LE evidence, FA areas, ...) and joins
// the named sub-fields with '&' to match the FantaCode storage form. This
// keeps the rest of the codebase (which stores evidence as "n&d&i" etc.)
// blissfully unaware of the JSON path.
func decodeTailObject(item json.RawMessage, keys []string) string {
	var sub map[string]json.RawMessage
	if err := json.Unmarshal(item, &sub); err != nil {
		return jsonValueToString(item)
	}
	parts := make([]string, len(keys))
	for i, k := range keys {
		if v, ok := sub[k]; ok {
			parts[i] = jsonValueToString(v)
		}
	}
	return strings.Join(parts, "&")
}

// decodeSidesField handles SD's split-on-star quirk on decode: the JSON
// field may be either a string array (preferred) or a literal string. In
// either case we end up with the same '*'-joined wire form the existing
// SD handler expects.
func decodeSidesField(raw json.RawMessage) string {
	if len(raw) == 0 {
		return ""
	}
	if raw[0] == '[' {
		var arr []string
		if err := json.Unmarshal(raw, &arr); err == nil {
			return strings.Join(arr, "*")
		}
	}
	return jsonValueToString(raw)
}

// decodePairField handles MS's offset / paired_offset fields. The doc form
// is "{x}&{y}" — a string — but the JSON-side convention seen in practice
// is an object {"x":..,"y":..}. Accept both, plus a bare scalar (used as x
// with no y), and fold to the "x&y" string the FantaCode parsers expect.
func decodePairField(raw json.RawMessage) string {
	if len(raw) == 0 {
		return ""
	}
	if raw[0] == '{' {
		var pair struct {
			X json.RawMessage `json:"x"`
			Y json.RawMessage `json:"y"`
		}
		if err := json.Unmarshal(raw, &pair); err == nil {
			x := jsonValueToString(pair.X)
			y := jsonValueToString(pair.Y)
			if y == "" {
				return x
			}
			return x + "&" + y
		}
	}
	return jsonValueToString(raw)
}

// encodePairField inverts decodePairField for the outbound direction: it turns
// the internal "x&y" coordinate string into the {"x":n,"y":n} object the MS
// schema requires. ok is false when the value is empty or its x component is
// not an integer, signalling the caller to omit the field (the schema default
// then applies). A missing y component defaults to 0.
func encodePairField(s string) (map[string]int, bool) {
	if strings.TrimSpace(s) == "" {
		return nil, false
	}
	parts := strings.SplitN(s, "&", 2)
	x, err := strconv.Atoi(strings.TrimSpace(parts[0]))
	if err != nil {
		return nil, false
	}
	y := 0
	if len(parts) == 2 && strings.TrimSpace(parts[1]) != "" {
		yy, err := strconv.Atoi(strings.TrimSpace(parts[1]))
		if err != nil {
			return nil, false
		}
		y = yy
	}
	return map[string]int{"x": x, "y": y}, true
}

// splitTailObject inverts decodeTailObject for encode.
func splitTailObject(entry string, keys []string) map[string]string {
	parts := strings.Split(entry, "&")
	m := make(map[string]string, len(keys))
	for i, k := range keys {
		if i < len(parts) {
			m[k] = parts[i]
		} else {
			m[k] = ""
		}
	}
	return m
}

// splitNonEmpty splits s on sep but returns an empty slice (not [""]) when
// s itself is empty, so the JSON array for SD looks like [] rather than
// [""] when no sides are configured.
func splitNonEmpty(s, sep string) []string {
	if s == "" {
		return []string{}
	}
	return strings.Split(s, sep)
}
