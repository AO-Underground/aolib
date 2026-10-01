package aolib

import (
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// CharEmote is one emote, normalized from an [emote <name>] block or a legacy
// [emotions] row. Empty Preanim, Postanim, Camera and Sound mean none.
type CharEmote struct {
	// Key is the block name, or the legacy row id as a string.
	Key             string        `json:"key"`
	Name            string        `json:"name"`
	Anim            string        `json:"anim"`
	Preanim         string        `json:"preanim"`
	Postanim        string        `json:"postanim"`
	Camera          string        `json:"camera"`
	Modifier        EmoteModifier `json:"modifier"`
	Deskmod         DeskModifier  `json:"deskmod"`
	Sound           string        `json:"sound"`
	SoundDelayMs    int           `json:"sounddelayms"`
	SoundDelayTicks int           `json:"sounddelayticks"`
}

// CharIniOptions is the [options] section. Chat and Category are nil when the
// key is absent, distinct from an explicit empty value.
type CharIniOptions struct {
	Name     string  `json:"name"`
	Showname string  `json:"showname"`
	Side     string  `json:"side"`
	Blips    string  `json:"blips"`
	Chat     *string `json:"chat"`
	Category *string `json:"category"`
	Model    string  `json:"model"`
	// All holds every [options] key, lowercased, values verbatim.
	All map[string]string `json:"-"`
}

// CharIni is a parsed char.ini. Section and key names are lowercased; values
// are kept verbatim.
type CharIni struct {
	Options  CharIniOptions               `json:"options"`
	Emotes   []CharEmote                  `json:"emotes"`
	Sections map[string]map[string]string `json:"sections"`
}

// ParseCharIni parses char.ini text. It fails when [options] or its name is
// missing, and when an [emote <name>] block names a file without an extension
// or gives modifier/deskmod as a number. Legacy rows are read leniently.
func ParseCharIni(data string) (*CharIni, error) {
	sections, blockOrder := parseIni(data)

	opt, ok := sections["options"]
	if !ok {
		return nil, fmt.Errorf("char.ini: missing required [options] section")
	}
	if opt["name"] == "" {
		return nil, fmt.Errorf("char.ini: [options] is missing the required `name` key")
	}
	options := CharIniOptions{
		Name:     opt["name"],
		Showname: opt["showname"],
		Side:     "wit",
		Blips:    "male",
		Model:    opt["model"],
		All:      opt,
	}
	if v, ok := opt["side"]; ok {
		options.Side = v
	}
	if v, ok := opt["blips"]; ok {
		options.Blips = v
	} else if v, ok := opt["gender"]; ok {
		options.Blips = v
	}
	if v, ok := opt["chat"]; ok {
		options.Chat = &v
	}
	if v, ok := opt["category"]; ok {
		options.Category = &v
	}

	var emotes []CharEmote
	var err error
	if len(blockOrder) > 0 {
		emotes, err = readBlockEmotes(sections, blockOrder)
	} else {
		emotes = readLegacyEmotes(sections)
	}
	if err != nil {
		return nil, err
	}
	if emotes == nil {
		emotes = []CharEmote{}
	}
	return &CharIni{Options: options, Emotes: emotes, Sections: sections}, nil
}

// parseIni reads sections and key=value lines, skipping comments (`;`, `//`)
// and any other line. `#` is never a comment: emote rows are #-delimited.
func parseIni(data string) (map[string]map[string]string, []string) {
	sections := map[string]map[string]string{}
	var blockOrder []string
	var cur map[string]string
	for _, line := range strings.Split(strings.TrimPrefix(data, "\uFEFF"), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "//") {
			continue
		}
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			name := line[1 : len(line)-1]
			lower := strings.ToLower(name)
			if _, ok := sections[lower]; !ok {
				sections[lower] = map[string]string{}
				if strings.HasPrefix(lower, "emote ") {
					blockOrder = append(blockOrder, name[len("emote "):])
				}
			}
			cur = sections[lower]
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok || cur == nil {
			continue
		}
		cur[strings.ToLower(strings.TrimSpace(k))] = strings.TrimSpace(v)
	}
	return sections, blockOrder
}

func readBlockEmotes(sections map[string]map[string]string, blockOrder []string) ([]CharEmote, error) {
	var emotes []CharEmote
	for _, key := range blockOrder {
		block := sections["emote "+strings.ToLower(key)]
		e := CharEmote{
			Key:      key,
			Name:     key,
			Anim:     block["anim"],
			Preanim:  noneIfDash(block["preanim"]),
			Postanim: noneIfDash(block["postanim"]),
			Camera:   noneIfDash(block["camera"]),
			Sound:    block["sound"],
			Modifier: EmoteModifierNoPreanim,
			Deskmod:  DeskModifierShown,
		}
		if v, ok := block["name"]; ok {
			e.Name = v
		}
		if err := requireExtension(e.Anim, "anim", key); err != nil {
			return nil, err
		}
		for field, v := range map[string]string{"preanim": e.Preanim, "postanim": e.Postanim, "camera": e.Camera, "sound": e.Sound} {
			if v != "" {
				if err := requireExtension(v, field, key); err != nil {
					return nil, err
				}
			}
		}
		var err error
		if e.Modifier, err = requireEnumName(block["modifier"], emoteModifierToWire, "modifier", key, e.Modifier); err != nil {
			return nil, err
		}
		if e.Deskmod, err = requireEnumName(block["deskmod"], deskModifierToWire, "deskmod", key, e.Deskmod); err != nil {
			return nil, err
		}
		e.SoundDelayMs = leadingInt(block["sounddelayms"], 0)
		e.SoundDelayTicks = MsToTicks(e.SoundDelayMs)
		emotes = append(emotes, e)
	}
	return emotes, nil
}

func readLegacyEmotes(sections map[string]map[string]string) []CharEmote {
	rows := sections["emotions"]
	soundN, soundT := sections["soundn"], sections["soundt"]
	var emotes []CharEmote
	for id := 1; id <= leadingInt(rows["number"], 0); id++ {
		key := strconv.Itoa(id)
		def, ok := rows[key]
		if !ok {
			continue
		}
		parts := strings.Split(def, "#")
		part := func(i int) string {
			if i < len(parts) {
				return parts[i]
			}
			return ""
		}
		e := CharEmote{
			Key:      key,
			Name:     part(0),
			Anim:     part(2),
			Preanim:  noneIfDash(part(1)),
			Modifier: legacyEnum(part(3), emoteModifierToWire, emoteModifierFromWire),
			Deskmod:  DeskModifierShown,
			Sound:    soundN[key],
		}
		if len(parts) > 4 {
			e.Deskmod = legacyEnum(part(4), deskModifierToWire, deskModifierFromWire)
		}
		if e.Sound == "0" || e.Sound == "1" || e.Sound == "-" {
			e.Sound = ""
		}
		e.SoundDelayTicks = leadingInt(soundT[key], 0)
		e.SoundDelayMs = TicksToMs(e.SoundDelayTicks)
		emotes = append(emotes, e)
	}
	return emotes
}

func noneIfDash(v string) string {
	if v == "-" {
		return ""
	}
	return v
}

var hasExtension = regexp.MustCompile(`\.[^.\s]+$`)

func requireExtension(v, field, key string) error {
	if !hasExtension.MatchString(v) {
		return fmt.Errorf("char.ini emote %q: %s %q must include a file extension", key, field, v)
	}
	return nil
}

// requireEnumName accepts a block enum only by name; empty keeps def.
func requireEnumName[E ~string](v string, toWire map[E]int, field, key string, def E) (E, error) {
	if v == "" {
		return def, nil
	}
	if _, ok := toWire[E(strings.ToLower(v))]; ok {
		return E(strings.ToLower(v)), nil
	}
	return def, fmt.Errorf("char.ini emote %q: %s %q must be one of: %s", key, field, v, strings.Join(enumNames(toWire), ", "))
}

// legacyEnum reads a legacy row field as a name or wire integer; anything else
// is the wire-0 value.
func legacyEnum[E ~string](v string, toWire map[E]int, fromWire map[int]E) E {
	if _, ok := toWire[E(strings.ToLower(v))]; ok {
		return E(strings.ToLower(v))
	}
	if e, ok := fromWire[leadingInt(v, 0)]; ok {
		return e
	}
	return fromWire[0]
}

func enumNames[E ~string](toWire map[E]int) []string {
	names := make([]string, 0, len(toWire))
	for e := range toWire {
		names = append(names, string(e))
	}
	sort.Slice(names, func(i, j int) bool { return toWire[E(names[i])] < toWire[E(names[j])] })
	return names
}

var leadingIntRe = regexp.MustCompile(`^[+-]?\d+`)

// leadingInt parses a leading integer like JavaScript's parseInt, else fallback.
func leadingInt(v string, fallback int) int {
	n, err := strconv.Atoi(leadingIntRe.FindString(strings.TrimSpace(v)))
	if err != nil {
		return fallback
	}
	return n
}
