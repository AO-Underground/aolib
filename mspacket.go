package aolib

// The in-character ("MS") packet, hand-written because it carries Nyathena
// extensions that canonical aolib-meta does not model: the multi-pair
// `additional_chars` list (JSON-only), the 2.10.2+ `blips` slot, the "&name"
// custom-objection sub-value on shout_modifier, and the "pid^order" pair-order
// suffix on paired_charid. The field names and enum types otherwise match
// aolib-meta's `MSToServer`/`MSToClient` schemas (string enums, ints, bools,
// and the Offset object type).

import "strings"

// AdditionalChar is one on-screen partner beyond the standard pair, carried in
// the JSON-only `additional_chars` list.
type AdditionalChar struct {
	CharID int    `json:"charid"`
	Name   string `json:"name"`
	Emote  string `json:"emote"`
	Offset Offset `json:"offset"`
	Flip   int    `json:"flip"`
}

// MSToServer is the client -> server in-character packet (26 canonical fields
// plus the blips extension).
type MSToServer struct {
	DeskModifier          DeskModifier  `json:"desk_modifier"`
	Preanim               string        `json:"preanim"`
	Character             string        `json:"character"`
	Emote                 string        `json:"emote"`
	Message               string        `json:"message"`
	Side                  Side          `json:"side"`
	SfxName               string        `json:"sfx_name"`
	EmoteModifier         EmoteModifier `json:"emote_modifier"`
	CharID                int           `json:"char_id"`
	SfxDelay              int           `json:"sfx_delay"`
	ShoutModifier         ShoutModifier `json:"shout_modifier"`
	ShoutName             string        `json:"-"`
	EvidenceID            int           `json:"evidence_id"`
	Flip                  Flip          `json:"flip"`
	Realization           bool          `json:"realization"`
	TextColor             TextColor     `json:"text_color"`
	Showname              string        `json:"showname"`
	PairedCharID          string        `json:"paired_charid"` // may carry "pid^order"
	Offset                Offset        `json:"offset"`
	NoninterruptingPreanim bool          `json:"noninterrupting_preanim"`
	SfxLooping            bool          `json:"sfx_looping"`
	Screenshake           bool          `json:"screenshake"`
	FramesShake           string        `json:"frames_shake"`
	FramesRealization     string        `json:"frames_realization"`
	FramesSfx             string        `json:"frames_sfx"`
	Additive              bool          `json:"additive"`
	Effect                string        `json:"effect"`
	Blips                 string        `json:"-"`
}

// MSToClient is the server -> client in-character packet (30 canonical fields,
// the paired partner fields, plus the blips and JSON-only additional_chars
// extensions).
type MSToClient struct {
	DeskModifier          DeskModifier  `json:"desk_modifier"`
	Preanim               string        `json:"preanim"`
	Character             string        `json:"character"`
	Emote                 string        `json:"emote"`
	Message               string        `json:"message"`
	Side                  Side          `json:"side"`
	SfxName               string        `json:"sfx_name"`
	EmoteModifier         EmoteModifier `json:"emote_modifier"`
	CharID                int           `json:"char_id"`
	SfxDelay              int           `json:"sfx_delay"`
	ShoutModifier         ShoutModifier `json:"shout_modifier"`
	ShoutName             string        `json:"-"`
	EvidenceID            int           `json:"evidence_id"`
	Flip                  Flip          `json:"flip"`
	Realization           bool          `json:"realization"`
	TextColor             TextColor     `json:"text_color"`
	Showname              string        `json:"showname"`
	PairedCharID          string        `json:"paired_charid"`
	PairedName            string        `json:"paired_name"`
	PairedEmote           string        `json:"paired_emote"`
	Offset                Offset        `json:"offset"`
	PairedOffset          Offset        `json:"paired_offset"`
	PairedFlip            Flip          `json:"paired_flip"`
	NoninterruptingPreanim bool          `json:"noninterrupting_preanim"`
	SfxLooping            bool          `json:"sfx_looping"`
	Screenshake           bool          `json:"screenshake"`
	FramesShake           string        `json:"frames_shake"`
	FramesRealization     string        `json:"frames_realization"`
	FramesSfx             string        `json:"frames_sfx"`
	Additive              bool          `json:"additive"`
	Effect                string        `json:"effect"`
	Blips                 string        `json:"-"`

	// AdditionalChars holds the multi-pair partners beyond the standard pair
	// (JSON wire only). Emitted solely via JSONExtra()["additional_chars"].
	AdditionalChars []AdditionalChar
}

// Header returns the AO2 header "MS".
func (ms *MSToServer) Header() string { return "MS" }

// Header returns the AO2 header "MS".
func (ms *MSToClient) Header() string { return "MS" }

// Shout returns the typed shout/objection modifier.
func (ms *MSToServer) Shout() ShoutModifier { return ms.ShoutModifier }

// Shout returns the typed shout/objection modifier.
func (ms *MSToClient) Shout() ShoutModifier { return ms.ShoutModifier }

// parseDeskModifier parses the desk_modifier wire token, mapping the legacy
// "chat" alias to the shown value.
func parseDeskModifier(s string) DeskModifier {
	if s == "chat" {
		return DeskModifierShown
	}
	return deskModifierFromWire[atoiOrZero(s)]
}

// parseShout splits a shout_modifier wire token ("4&name") into the typed enum
// and the optional custom name.
func parseShout(raw string) (ShoutModifier, string) {
	if n, name, ok := strings.Cut(raw, "&"); ok {
		return shoutModifierFromWire[atoiOrZero(n)], name
	}
	return shoutModifierFromWire[atoiOrZero(raw)], ""
}

// shoutWire encodes a shout modifier, appending "&name" for custom shouts.
func shoutWire(m ShoutModifier, name string) string {
	s := itoa(shoutModifierToWire[m])
	if m == ShoutModifierCustom && name != "" {
		s += "&" + name
	}
	return s
}

// Args returns the client -> server MS body (26 fields + optional blips).
func (ms *MSToServer) Args() []string {
	var args []string
	args = append(args, itoa(deskModifierToWire[ms.DeskModifier]))
	args = append(args, escapeFanta(ms.Preanim))
	args = append(args, escapeFanta(ms.Character))
	args = append(args, escapeFanta(ms.Emote))
	args = append(args, escapeFanta(ms.Message))
	args = append(args, string(ms.Side))
	args = append(args, escapeFanta(ms.SfxName))
	args = append(args, itoa(emoteModifierToWire[ms.EmoteModifier]))
	args = append(args, itoa(ms.CharID))
	args = append(args, itoa(ms.SfxDelay))
	args = append(args, shoutWire(ms.ShoutModifier, ms.ShoutName))
	args = append(args, itoa(ms.EvidenceID))
	args = append(args, itoa(flipToWire[ms.Flip]))
	args = append(args, boolToWire(ms.Realization))
	args = append(args, itoa(textColorToWire[ms.TextColor]))
	args = append(args, escapeFanta(ms.Showname))
	args = append(args, escapeFanta(ms.PairedCharID))
	args = append(args, offsetToWire(ms.Offset))
	args = append(args, boolToWire(ms.NoninterruptingPreanim))
	args = append(args, boolToWire(ms.SfxLooping))
	args = append(args, boolToWire(ms.Screenshake))
	args = append(args, escapeFanta(ms.FramesShake))
	args = append(args, escapeFanta(ms.FramesRealization))
	args = append(args, escapeFanta(ms.FramesSfx))
	args = append(args, boolToWire(ms.Additive))
	args = append(args, escapeFanta(ms.Effect))
	if ms.Blips != "" {
		args = append(args, escapeFanta(ms.Blips))
	}
	return args
}

// ParseMSToServer decodes a client -> server MS body.
func ParseMSToServer(body []string) (*MSToServer, error) {
	ms := &MSToServer{}
	get := func(i int) string {
		if i < len(body) {
			return body[i]
		}
		return ""
	}
	c := 0
	ms.DeskModifier = parseDeskModifier(get(c))
	c++
	ms.Preanim = unescapeFanta(get(c))
	c++
	ms.Character = unescapeFanta(get(c))
	c++
	ms.Emote = unescapeFanta(get(c))
	c++
	ms.Message = unescapeFanta(get(c))
	c++
	ms.Side = Side(get(c))
	c++
	ms.SfxName = unescapeFanta(get(c))
	c++
	ms.EmoteModifier = emoteModifierFromWire[atoiOrZero(get(c))]
	c++
	ms.CharID = atoiOrZero(get(c))
	c++
	ms.SfxDelay = atoiOrZero(get(c))
	c++
	ms.ShoutModifier, ms.ShoutName = parseShout(get(c))
	c++
	ms.EvidenceID = atoiOrZero(get(c))
	c++
	ms.Flip = flipFromWire[atoiOrZero(get(c))]
	c++
	ms.Realization = wireToBool(get(c))
	c++
	ms.TextColor = textColorFromWire[atoiOrZero(get(c))]
	c++
	ms.Showname = unescapeFanta(get(c))
	c++
	ms.PairedCharID = unescapeFanta(get(c))
	c++
	ms.Offset = offsetFromWire(get(c))
	c++
	ms.NoninterruptingPreanim = wireToBool(get(c))
	c++
	ms.SfxLooping = wireToBool(get(c))
	c++
	ms.Screenshake = wireToBool(get(c))
	c++
	ms.FramesShake = unescapeFanta(get(c))
	c++
	ms.FramesRealization = unescapeFanta(get(c))
	c++
	ms.FramesSfx = unescapeFanta(get(c))
	c++
	ms.Additive = wireToBool(get(c))
	c++
	ms.Effect = unescapeFanta(get(c))
	c++
	ms.Blips = unescapeFanta(get(c))
	return ms, nil
}

// ToClient converts the client -> server form into the server -> client form by
// copying the shared fields.
func (ms *MSToServer) ToClient() *MSToClient {
	return &MSToClient{
		DeskModifier:          ms.DeskModifier,
		Preanim:               ms.Preanim,
		Character:             ms.Character,
		Emote:                 ms.Emote,
		Message:               ms.Message,
		Side:                  ms.Side,
		SfxName:               ms.SfxName,
		EmoteModifier:         ms.EmoteModifier,
		CharID:                ms.CharID,
		SfxDelay:              ms.SfxDelay,
		ShoutModifier:         ms.ShoutModifier,
		ShoutName:             ms.ShoutName,
		EvidenceID:            ms.EvidenceID,
		Flip:                  ms.Flip,
		Realization:           ms.Realization,
		TextColor:             ms.TextColor,
		Showname:              ms.Showname,
		PairedCharID:          ms.PairedCharID,
		Offset:                ms.Offset,
		NoninterruptingPreanim: ms.NoninterruptingPreanim,
		SfxLooping:            ms.SfxLooping,
		Screenshake:           ms.Screenshake,
		FramesShake:           ms.FramesShake,
		FramesRealization:     ms.FramesRealization,
		FramesSfx:             ms.FramesSfx,
		Additive:              ms.Additive,
		Effect:                ms.Effect,
		Blips:                 ms.Blips,
	}
}

// Args returns the server -> client MS body (30 fields + optional blips).
func (ms *MSToClient) Args() []string {
	var args []string
	args = append(args, itoa(deskModifierToWire[ms.DeskModifier]))
	args = append(args, escapeFanta(ms.Preanim))
	args = append(args, escapeFanta(ms.Character))
	args = append(args, escapeFanta(ms.Emote))
	args = append(args, escapeFanta(ms.Message))
	args = append(args, string(ms.Side))
	args = append(args, escapeFanta(ms.SfxName))
	args = append(args, itoa(emoteModifierToWire[ms.EmoteModifier]))
	args = append(args, itoa(ms.CharID))
	args = append(args, itoa(ms.SfxDelay))
	args = append(args, shoutWire(ms.ShoutModifier, ms.ShoutName))
	args = append(args, itoa(ms.EvidenceID))
	args = append(args, itoa(flipToWire[ms.Flip]))
	args = append(args, boolToWire(ms.Realization))
	args = append(args, itoa(textColorToWire[ms.TextColor]))
	args = append(args, escapeFanta(ms.Showname))
	args = append(args, escapeFanta(ms.PairedCharID))
	args = append(args, escapeFanta(ms.PairedName))
	args = append(args, escapeFanta(ms.PairedEmote))
	args = append(args, offsetToWire(ms.Offset))
	args = append(args, offsetToWire(ms.PairedOffset))
	args = append(args, itoa(flipToWire[ms.PairedFlip]))
	args = append(args, boolToWire(ms.NoninterruptingPreanim))
	args = append(args, boolToWire(ms.SfxLooping))
	args = append(args, boolToWire(ms.Screenshake))
	args = append(args, escapeFanta(ms.FramesShake))
	args = append(args, escapeFanta(ms.FramesRealization))
	args = append(args, escapeFanta(ms.FramesSfx))
	args = append(args, boolToWire(ms.Additive))
	args = append(args, escapeFanta(ms.Effect))
	if ms.Blips != "" {
		args = append(args, escapeFanta(ms.Blips))
	}
	return args
}

// ParseMSToClient decodes a server -> client MS body.
func ParseMSToClient(body []string) (*MSToClient, error) {
	ms := &MSToClient{}
	get := func(i int) string {
		if i < len(body) {
			return body[i]
		}
		return ""
	}
	c := 0
	ms.DeskModifier = parseDeskModifier(get(c))
	c++
	ms.Preanim = unescapeFanta(get(c))
	c++
	ms.Character = unescapeFanta(get(c))
	c++
	ms.Emote = unescapeFanta(get(c))
	c++
	ms.Message = unescapeFanta(get(c))
	c++
	ms.Side = Side(get(c))
	c++
	ms.SfxName = unescapeFanta(get(c))
	c++
	ms.EmoteModifier = emoteModifierFromWire[atoiOrZero(get(c))]
	c++
	ms.CharID = atoiOrZero(get(c))
	c++
	ms.SfxDelay = atoiOrZero(get(c))
	c++
	ms.ShoutModifier, ms.ShoutName = parseShout(get(c))
	c++
	ms.EvidenceID = atoiOrZero(get(c))
	c++
	ms.Flip = flipFromWire[atoiOrZero(get(c))]
	c++
	ms.Realization = wireToBool(get(c))
	c++
	ms.TextColor = textColorFromWire[atoiOrZero(get(c))]
	c++
	ms.Showname = unescapeFanta(get(c))
	c++
	ms.PairedCharID = unescapeFanta(get(c))
	c++
	ms.PairedName = unescapeFanta(get(c))
	c++
	ms.PairedEmote = unescapeFanta(get(c))
	c++
	ms.Offset = offsetFromWire(get(c))
	c++
	ms.PairedOffset = offsetFromWire(get(c))
	c++
	ms.PairedFlip = flipFromWire[atoiOrZero(get(c))]
	c++
	ms.NoninterruptingPreanim = wireToBool(get(c))
	c++
	ms.SfxLooping = wireToBool(get(c))
	c++
	ms.Screenshake = wireToBool(get(c))
	c++
	ms.FramesShake = unescapeFanta(get(c))
	c++
	ms.FramesRealization = unescapeFanta(get(c))
	c++
	ms.FramesSfx = unescapeFanta(get(c))
	c++
	ms.Additive = wireToBool(get(c))
	c++
	ms.Effect = unescapeFanta(get(c))
	c++
	ms.Blips = unescapeFanta(get(c))
	return ms, nil
}

// ParseMSToClientString splits a server-format MS body joined by '#'.
func ParseMSToClientString(s string) *MSToClient {
	if s == "" {
		return &MSToClient{}
	}
	ms, _ := ParseMSToClient(strings.Split(s, "#"))
	return ms
}

// JSONExtra returns the JSON-only MS fields: the multi-pair "additional_chars"
// list, or nil when there are no extra partners.
func (ms *MSToClient) JSONExtra() map[string]any {
	if len(ms.AdditionalChars) == 0 {
		return nil
	}
	return map[string]any{"additional_chars": ms.AdditionalChars}
}

// ServerString joins Args with '#'.
func (ms *MSToClient) ServerString() string {
	return strings.Join(ms.Args(), "#")
}

// SetTextColorInServerString rewrites the TextColor field of a wire-format MS
// body without forcing callers to know its slot index.
func SetTextColorInServerString(s, color string) string {
	ms := ParseMSToClientString(s)
	ms.TextColor = textColorFromWire[atoiOrZero(color)]
	return ms.ServerString()
}
