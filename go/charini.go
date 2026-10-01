package aolib

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// CharIni is a parsed char.ini, shaped by spec/assets/CharIni.schema.json; the
// text grammar is spec/assets/README.md.
type CharIni struct {
	Options CharIniOptions `json:"options"`
	Emotes  []CharEmote    `json:"emotes"`
	// Sections holds every section, section and key names lowercased, values verbatim.
	Sections map[string]map[string]string `json:"sections"`
}

// CharIniOptions is the [options] section, lowercased keys. Specified keys hold
// their parsed values (side defaulted, blips resolved, scaling normalized,
// stretch "true" or "false"); a key whose value is null is absent. Other keys
// keep their raw value. The file's raw values are in CharIni.Sections.
type CharIniOptions map[string]string

func (o CharIniOptions) Name() string         { return o["name"] }
func (o CharIniOptions) Showname() string     { return o["showname"] }
func (o CharIniOptions) Side() string         { return o["side"] }
func (o CharIniOptions) Blips() string        { return o["blips"] }
func (o CharIniOptions) Model() string        { return o["model"] }
func (o CharIniOptions) Scaling() Scaling     { return Scaling(o["scaling"]) }
func (o CharIniOptions) Stretch() bool        { return o["stretch"] == "true" }
func (o CharIniOptions) Chat() *string        { return o.optional("chat") }
func (o CharIniOptions) Category() *string    { return o.optional("category") }
func (o CharIniOptions) Realization() *string { return o.optional("realization") }
func (o CharIniOptions) Shouts() *string      { return o.optional("shouts") }

func (o CharIniOptions) optional(key string) *string {
	if v, ok := o[key]; ok {
		return &v
	}
	return nil
}

// MarshalJSON emits the schema's shape: stretch as a boolean, absent optional keys as null.
func (o CharIniOptions) MarshalJSON() ([]byte, error) {
	m := map[string]any{}
	for k, v := range o {
		m[k] = v
	}
	m["stretch"] = o.Stretch()
	m["chat"], m["category"], m["realization"], m["shouts"] = o.Chat(), o.Category(), o.Realization(), o.Shouts()
	return json.Marshal(m)
}

// parseOptions fills the specified [options] keys with their parsed values.
func parseOptions(raw map[string]string) CharIniOptions {
	o := CharIniOptions{}
	for k, v := range raw {
		o[k] = v
	}
	o["showname"], o["model"] = raw["showname"], raw["model"]
	if _, ok := raw["side"]; !ok {
		o["side"] = "wit"
	}
	if _, ok := raw["blips"]; !ok {
		o["blips"] = "male"
		if v, ok := raw["gender"]; ok {
			o["blips"] = v
		}
	}
	switch raw["scaling"] {
	case "smooth":
		o["scaling"] = string(ScalingSmooth)
	case "pixel", "fast":
		o["scaling"] = string(ScalingPixel)
	default:
		o["scaling"] = string(ScalingAuto)
	}
	o["stretch"] = strconv.FormatBool(strings.HasPrefix(raw["stretch"], "true"))
	for _, k := range []string{"realization", "shouts"} {
		if raw[k] == "" {
			delete(o, k)
		}
	}
	return o
}

// Scaling is a char.ini sprite scaling filter.
type Scaling string

const (
	ScalingAuto   Scaling = "auto"
	ScalingSmooth Scaling = "smooth"
	ScalingPixel  Scaling = "pixel"
)

// CharEmote is one emote, from an [emote <name>] block or a legacy
// [emotions] row. Nil Preanim, Postanim, Camera and Sound mean none.
type CharEmote struct {
	Key             string        `json:"key"`
	Name            string        `json:"name"`
	Anim            string        `json:"anim"`
	Preanim         *string       `json:"preanim"`
	Postanim        *string       `json:"postanim"`
	Camera          *string       `json:"camera"`
	Modifier        EmoteModifier `json:"modifier"`
	Deskmod         DeskModifier  `json:"deskmod"`
	Sound           *string       `json:"sound"`
	SoundDelayMs    int           `json:"sounddelayms"`
	SoundDelayTicks int           `json:"sounddelayticks"`
	SoundLooping    bool          `json:"soundlooping"`
	// PreanimDurationMs caps how long the preanim plays; nil for no cap.
	PreanimDurationMs *int `json:"preanimdurationms"`
}

// The modifier/deskmod names the spec accepts in blocks and legacy rows.
var (
	blockEmoteModifiers = []EmoteModifier{EmoteModifierNoPreanim, EmoteModifierPreanim, EmoteModifierPreanimAndObjection, EmoteModifierUnused3, EmoteModifierUnused4, EmoteModifierZoom, EmoteModifierObjectionZoom}
	blockDeskModifiers  = []DeskModifier{DeskModifierHidden, DeskModifierShown, DeskModifierHideDuringPreanim, DeskModifierShowDuringPreanim, DeskModifierHideAndCenterDuringPreanim, DeskModifierShowDuringPreanimThenCenter}
)

// ParseCharIni parses char.ini text. It fails where the spec rejects a file:
// no [options] name, no emotes, or an [emote <name>] block whose file
// reference lacks an extension or whose modifier/deskmod is not an enum name.
func ParseCharIni(data string) (*CharIni, error) {
	sections, blocks := parseIni(data)

	opt, ok := sections["options"]
	if !ok {
		return nil, fmt.Errorf("char.ini: missing required [options] section")
	}
	if opt["name"] == "" {
		return nil, fmt.Errorf("char.ini: [options] is missing the required name")
	}
	o := parseOptions(opt)

	ini := &CharIni{Options: o, Sections: sections}
	if len(blocks) == 0 {
		ini.Emotes = legacyEmotes(sections)
	}
	for _, key := range blocks {
		e, err := blockEmote(key, sections["emote "+strings.ToLower(key)])
		if err != nil {
			return nil, err
		}
		ini.Emotes = append(ini.Emotes, e)
	}
	if len(ini.Emotes) == 0 {
		return nil, fmt.Errorf("char.ini: no emotes; at least one [emote <name>] block or [emotions] row is required")
	}
	return ini, nil
}

// parseIni reads [section] headers and key = value lines. Comments start with
// `;` or `//` at the start of a line or after whitespace; `#` is never a
// comment because it delimits legacy emote fields. Other lines are skipped.
func parseIni(data string) (sections map[string]map[string]string, blocks []string) {
	sections = map[string]map[string]string{}
	var cur map[string]string
	for _, line := range strings.Split(strings.TrimPrefix(data, "\uFEFF"), "\n") {
		line = strings.TrimSpace(stripComment(line))
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			name := strings.TrimSpace(line[1 : len(line)-1])
			lower := strings.ToLower(name)
			if sections[lower] == nil {
				sections[lower] = map[string]string{}
				if strings.HasPrefix(lower, "emote ") {
					blocks = append(blocks, strings.TrimSpace(name[len("emote "):]))
				}
			}
			cur = sections[lower]
			continue
		}
		if k, v, ok := strings.Cut(line, "="); ok && cur != nil {
			cur[strings.ToLower(strings.TrimSpace(k))] = strings.TrimSpace(v)
		}
	}
	return sections, blocks
}

var commentStart = regexp.MustCompile(`(^|\s)(;|//)`)

func stripComment(line string) string {
	if loc := commentStart.FindStringIndex(line); loc != nil {
		return line[:loc[0]]
	}
	return line
}

func blockEmote(key string, block map[string]string) (CharEmote, error) {
	e := CharEmote{
		Key:      key,
		Name:     key,
		Anim:     block["anim"],
		Preanim:  noneUnlessSet(block["preanim"], true),
		Postanim: noneUnlessSet(block["postanim"], true),
		Camera:   noneUnlessSet(block["camera"], true),
		Sound:    noneUnlessSet(block["sound"], false),
		Modifier: EmoteModifierNoPreanim,
		Deskmod:  DeskModifierShown,
	}
	if v, ok := block["name"]; ok {
		e.Name = v
	}
	files := []struct {
		field string
		v     *string
	}{{"anim", &e.Anim}, {"preanim", e.Preanim}, {"postanim", e.Postanim}, {"camera", e.Camera}, {"sound", e.Sound}}
	for _, f := range files {
		if f.v != nil && !hasExtension.MatchString(*f.v) {
			return e, fmt.Errorf("char.ini [emote %s]: %s %q must include a file extension", key, f.field, *f.v)
		}
	}
	var err error
	if e.Modifier, err = blockEnum(block["modifier"], blockEmoteModifiers, "modifier", key, e.Modifier); err != nil {
		return e, err
	}
	if e.Deskmod, err = blockEnum(block["deskmod"], blockDeskModifiers, "deskmod", key, unsetDeskmod(e.Modifier)); err != nil {
		return e, err
	}
	e.SoundDelayMs = intOr(block["sounddelayms"], 0)
	e.SoundDelayTicks = MsToTicks(e.SoundDelayMs)
	e.SoundLooping = block["soundlooping"] == "true"
	e.PreanimDurationMs = positiveMs(block["preanimdurationms"])
	return e, nil
}

func legacyEmotes(sections map[string]map[string]string) []CharEmote {
	rows, soundN, soundT, soundL := sections["emotions"], sections["soundn"], sections["soundt"], sections["soundl"]
	var emotes []CharEmote
	for id := 1; id <= intOr(rows["number"], 0); id++ {
		key := strconv.Itoa(id)
		row, ok := rows[key]
		if !ok {
			continue
		}
		f := strings.Split(row, "#")
		field := func(i int) string {
			if i < len(f) {
				return f[i]
			}
			return ""
		}
		e := CharEmote{
			Key:      key,
			Name:     field(0),
			Preanim:  noneUnlessSet(field(1), true),
			Anim:     field(2),
			Modifier: legacyEnum(field(3), blockEmoteModifiers, emoteModifierFromWire, EmoteModifierNoPreanim),
			Deskmod:  DeskModifierShown,
		}
		if strings.TrimSpace(field(4)) == "" {
			e.Deskmod = unsetDeskmod(e.Modifier)
		} else {
			e.Deskmod = legacyEnum(field(4), blockDeskModifiers, deskModifierFromWire, DeskModifierShown)
		}
		if s := soundN[key]; s != "0" && s != "1" && s != "-" {
			e.Sound = noneUnlessSet(s, false)
		}
		e.SoundDelayTicks = intOr(soundT[key], 0)
		e.SoundDelayMs = TicksToMs(e.SoundDelayTicks)
		e.SoundLooping = strings.TrimSpace(soundL[key]) == "1"
		if e.Preanim != nil {
			e.PreanimDurationMs = positiveMs(sections["time"][strings.ToLower(*e.Preanim)])
		}
		emotes = append(emotes, e)
	}
	return emotes
}

// unsetDeskmod is the deskmod of an emote that does not set one: hidden for the
// zoom modifiers, as AO2-Client does, else shown.
func unsetDeskmod(m EmoteModifier) DeskModifier {
	if m == EmoteModifierZoom || m == EmoteModifierObjectionZoom {
		return DeskModifierHidden
	}
	return DeskModifierShown
}

// noneUnlessSet maps an empty value (or `-`, when dash is true) to nil.
func noneUnlessSet(v string, dash bool) *string {
	if v == "" || (dash && v == "-") {
		return nil
	}
	return &v
}

var hasExtension = regexp.MustCompile(`\.[^.\s/\\]+$`)

func blockEnum[E ~string](v string, allowed []E, field, key string, def E) (E, error) {
	if v == "" {
		return def, nil
	}
	names := make([]string, len(allowed))
	for i, e := range allowed {
		if v == string(e) {
			return e, nil
		}
		names[i] = string(e)
	}
	return def, fmt.Errorf("char.ini [emote %s]: %s %q must be one of: %s", key, field, v, strings.Join(names, ", "))
}

// legacyEnum reads a legacy row field: a lowercase name from allowed, or a
// wire integer; anything else is fallback.
func legacyEnum[E ~string](v string, allowed []E, fromWire map[int]E, fallback E) E {
	v = strings.TrimSpace(v)
	for _, e := range allowed {
		if v == string(e) {
			return e
		}
	}
	if n, err := strconv.Atoi(v); err == nil {
		if e, ok := fromWire[n]; ok {
			return e
		}
	}
	return fallback
}

// positiveMs reads a duration cap: a positive integer, else nil.
func positiveMs(v string) *int {
	if n := intOr(v, 0); n > 0 {
		return &n
	}
	return nil
}

func intOr(v string, fallback int) int {
	n, err := strconv.Atoi(strings.TrimSpace(v))
	if err != nil {
		return fallback
	}
	return n
}
