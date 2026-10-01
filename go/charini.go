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

// CharIniOptions is the [options] section. Chat and Category are nil when the
// key is absent, distinct from an explicit empty value.
type CharIniOptions struct {
	Name     string
	Showname string
	Side     string
	Blips    string
	Chat     *string
	Category *string
	Model    string
	// Extra holds the remaining [options] keys, lowercased.
	Extra map[string]string
}

// MarshalJSON emits the schema's shape: typed keys plus Extra inline.
func (o CharIniOptions) MarshalJSON() ([]byte, error) {
	m := map[string]any{}
	for k, v := range o.Extra {
		m[k] = v
	}
	m["name"], m["showname"], m["side"], m["blips"] = o.Name, o.Showname, o.Side, o.Blips
	m["chat"], m["category"], m["model"] = o.Chat, o.Category, o.Model
	return json.Marshal(m)
}

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
	o := CharIniOptions{Name: opt["name"], Showname: opt["showname"], Side: "wit", Blips: "male", Model: opt["model"], Extra: map[string]string{}}
	if v, ok := opt["side"]; ok {
		o.Side = v
	}
	if v, ok := opt["blips"]; ok {
		o.Blips = v
	} else if v, ok := opt["gender"]; ok {
		o.Blips = v
	}
	if v, ok := opt["chat"]; ok {
		o.Chat = &v
	}
	if v, ok := opt["category"]; ok {
		o.Category = &v
	}
	for k, v := range opt {
		switch k {
		case "name", "showname", "side", "blips", "chat", "category", "model":
		default:
			o.Extra[k] = v
		}
	}

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
	return e, nil
}

func legacyEmotes(sections map[string]map[string]string) []CharEmote {
	rows, soundN, soundT := sections["emotions"], sections["soundn"], sections["soundt"]
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

func intOr(v string, fallback int) int {
	n, err := strconv.Atoi(strings.TrimSpace(v))
	if err != nil {
		return fallback
	}
	return n
}
