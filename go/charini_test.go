package aolib

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"strings"
	"testing"
)

func mustParseCharIni(t *testing.T, data string) *CharIni {
	t.Helper()
	ini, err := ParseCharIni(data)
	if err != nil {
		t.Fatalf("ParseCharIni: %v", err)
	}
	return ini
}

func str(s string) *string { return &s }

// opts is the minimal valid [options] section.
const opts = "[options]\nname = T\n"

// readSpecAsset reads a file from the repo's spec/assets, skipping outside the monorepo.
func readSpecAsset(t *testing.T, name string) string {
	t.Helper()
	raw, err := os.ReadFile(filepath.Join("..", "spec", "assets", name))
	if err != nil {
		t.Skipf("spec not available: %v", err)
	}
	return string(raw)
}

// TestCharIniSpecExamples parses each char.ini in spec/assets/EXAMPLES.md and
// checks it against the object the spec gives for it, and against the schema.
func TestCharIniSpecExamples(t *testing.T) {
	doc := readSpecAsset(t, "EXAMPLES.md")
	inis := regexp.MustCompile("(?s)```ini\n(.*?)```").FindAllStringSubmatch(doc, -1)
	objs := regexp.MustCompile("(?s)```json\n(.*?)```").FindAllStringSubmatch(doc, -1)
	if len(inis) == 0 || len(inis) != len(objs) {
		t.Fatalf("EXAMPLES.md has %d ini and %d json blocks", len(inis), len(objs))
	}
	schema, err := schemaFor("assets/CharIni.schema.json")
	if err != nil {
		t.Fatal(err)
	}
	for i := range inis {
		raw, err := json.Marshal(mustParseCharIni(t, inis[i][1]))
		if err != nil {
			t.Fatal(err)
		}
		var got, want map[string]any
		if err := json.Unmarshal(raw, &got); err != nil {
			t.Fatal(err)
		}
		if err := schema.Validate(got); err != nil {
			t.Errorf("example %d does not match CharIni.schema.json: %v", i, err)
		}
		delete(got, "sections") // EXAMPLES.md omits it
		if err := json.Unmarshal([]byte(objs[i][1]), &want); err != nil {
			t.Fatal(err)
		}
		if !reflect.DeepEqual(got, want) {
			g, _ := json.MarshalIndent(got, "", "  ")
			t.Errorf("example %d:\ngot  %s\nwant %s", i, g, objs[i][1])
		}
	}
}

// The README's block example, inline `;` comments included.
func TestCharIniReadmeBlockExample(t *testing.T) {
	doc := readSpecAsset(t, "README.md")
	m := regexp.MustCompile("(?s)```ini\n(\\[options\\].*?)```").FindStringSubmatch(doc)
	if m == nil {
		t.Fatal("README.md has no [options] ini example")
	}
	ini := mustParseCharIni(t, m[1])
	if ini.Options.Model != "model.pmx" || len(ini.Emotes) != 2 {
		t.Fatalf("model %q, %d emotes", ini.Options.Model, len(ini.Emotes))
	}
	want := CharEmote{
		Key: "objection", Name: "objection", Anim: "objection.gif", Preanim: str("point.gif"), Postanim: str("bow.gif"),
		Camera: str("objection_cam.vmd"), Modifier: EmoteModifierZoom, Deskmod: DeskModifierShown,
		Sound: str("objection.opus"), SoundDelayMs: 480, SoundDelayTicks: 12,
	}
	if !reflect.DeepEqual(ini.Emotes[0], want) {
		t.Errorf("objection = %+v", ini.Emotes[0])
	}
}

func TestCharIniBlocks(t *testing.T) {
	ini := mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n[emote jog]\nanim = run.vmd\n[Emote Wave]\nAnim = wave.vmd\n[emote jog]\nsound = step.opus\n")
	var keys []string
	for _, e := range ini.Emotes {
		keys = append(keys, e.Key)
	}
	if strings.Join(keys, ",") != "jog,Wave" {
		t.Errorf("blocks must be the whole emote list in file order, [emotions] unread: got %v", keys)
	}
	if ini.Emotes[1].Anim != "wave.vmd" || ini.Emotes[0].Sound == nil || *ini.Emotes[0].Sound != "step.opus" {
		t.Errorf("case-insensitive names / repeated section: %+v", ini.Emotes)
	}

	e := mustParseCharIni(t, opts+"[emote a]\nanim = a.gif\nname = Wave!\nmodifier = objection_zoom\ndeskmod = hidden\npreanim = -\n").Emotes[0]
	if e.Name != "Wave!" || e.Modifier != EmoteModifierObjectionZoom || e.Deskmod != DeskModifierHidden || e.Preanim != nil {
		t.Errorf("name override, enum names, `-` preanim: %+v", e)
	}

	for _, tc := range []struct{ body, want string }{
		{"anim = a", `anim "a" must include a file extension`},
		{"anim =", `anim "" must include a file extension`},
		{"anim = a.gif\npreanim = p", `preanim "p" must include`},
		{"anim = a.gif\npostanim = p", `postanim "p" must include`},
		{"anim = a.vmd\ncamera = c", `camera "c" must include`},
		{"anim = a.gif\nsound = s", `sound "s" must include`},
		{"anim = a.gif\nmodifier = 5", `modifier "5" must be one of: no_preanim, preanim, preanim_and_objection, unused_3, unused_4, zoom, objection_zoom`},
		{"anim = a.gif\nmodifier = UNUSED_4", `modifier "UNUSED_4" must be one of`},
		{"anim = a.gif\ndeskmod = 1", `deskmod "1" must be one of`},
		{"anim = a.gif\nmodifier = ZOOM", `modifier "ZOOM" must be one of`},
		{"anim = a.gif\ndeskmod = Hidden", `deskmod "Hidden" must be one of`},
	} {
		if _, err := ParseCharIni(opts + "[emote a]\n" + tc.body + "\n"); err == nil || !strings.Contains(err.Error(), tc.want) {
			t.Errorf("%q: error %v, want %q", tc.body, err, tc.want)
		}
	}
}

func TestCharIniLegacy(t *testing.T) {
	ini := mustParseCharIni(t, opts+`[emotions]
number = 9
1 = a#-#a#5#2
2 = b#pre#b#9#7
3 = c##c#zoom#show_during_preanim
4 = d#-#d#1
6 = f#-#f#1# 
7 = g#-#g#ZOOM#Shown
8 = h#-#h#unused_3#3
9 = i#-#i# preanim #shown
10 = beyond#-#j#0
[soundn]
1 = 0
2 = 1
3 = -
4 = sfx-x
[soundt]
4 = 7
`)
	want := []struct {
		key      string
		preanim  *string
		modifier EmoteModifier
		deskmod  DeskModifier
		sound    *string
		ticks    int
	}{
		{"1", nil, EmoteModifierZoom, DeskModifierHideDuringPreanim, nil, 0},
		{"2", str("pre"), EmoteModifierNoPreanim, DeskModifierShown, nil, 0},
		{"3", nil, EmoteModifierZoom, DeskModifierShowDuringPreanim, nil, 0},
		{"4", nil, EmoteModifierPreanim, DeskModifierShown, str("sfx-x"), 7},
		{"6", nil, EmoteModifierPreanim, DeskModifierShown, nil, 0},
		{"7", nil, EmoteModifierNoPreanim, DeskModifierShown, nil, 0},
		{"8", nil, EmoteModifierUnused3, DeskModifierShowDuringPreanim, nil, 0},
		{"9", nil, EmoteModifierPreanim, DeskModifierShown, nil, 0},
	}
	if len(ini.Emotes) != len(want) {
		t.Fatalf("%d emotes, want %d (missing ids skipped, rows past number ignored)", len(ini.Emotes), len(want))
	}
	for i, w := range want {
		e := ini.Emotes[i]
		got := []any{e.Key, e.Preanim, e.Modifier, e.Deskmod, e.Sound, e.SoundDelayTicks, e.SoundDelayMs}
		exp := []any{w.key, w.preanim, w.modifier, w.deskmod, w.sound, w.ticks, w.ticks * 40}
		if !reflect.DeepEqual(got, exp) {
			t.Errorf("emote %d = %v, want %v", i, got, exp)
		}
	}
}

func TestCharIniTextGrammar(t *testing.T) {
	ini := mustParseCharIni(t, "\uFEFF[Options]\r\nName\t= Phoenix ; inline\r\n// showname = hidden\r\n; side = pro\r\nchat =\r\ngender = female\r\nshouts = custom\r\nstray author note\r\nurl = http://example.com/x\r\n[Emotions]\r\nnumber = 1\r\n1 = Desk slam#-#slam#0#1 // why\r\n")
	o := ini.Options
	if o.Name != "Phoenix" || o.Showname != "" || o.Side != "wit" || o.Blips != "female" || o.Model != "" {
		t.Errorf("options = %+v", o)
	}
	if o.Chat == nil || *o.Chat != "" || o.Category != nil {
		t.Errorf("explicit empty chat must be \"\", absent category nil: %v %v", o.Chat, o.Category)
	}
	if o.Extra["shouts"] != "custom" || o.Extra["url"] != "http://example.com/x" {
		t.Errorf("extra options = %v", o.Extra)
	}
	if e := ini.Emotes[0]; e.Name != "Desk slam" || e.Anim != "slam" || e.Deskmod != DeskModifierShown {
		t.Errorf("`#` is never a comment: %+v", e)
	}
	if ini.Sections["options"]["name"] != "Phoenix" || ini.Sections["emotions"]["1"] != "Desk slam#-#slam#0#1" {
		t.Errorf("sections = %v", ini.Sections)
	}

	ini = mustParseCharIni(t, "[options]\nname = Bare\n[emote a]\nanim = a.gif\n")
	if o := ini.Options; o.Showname != "" || o.Side != "wit" || o.Blips != "male" || o.Chat != nil || o.Model != "" {
		t.Errorf("option defaults: %+v", o)
	}
}

func TestCharIniRequired(t *testing.T) {
	for _, tc := range []struct{ ini, want string }{
		{"", "missing required [options]"},
		{"[emote a]\nanim = a.gif\n", "missing required [options]"},
		{"+[Options]\nname = A\n[emote a]\nanim = a.gif\n", "missing required [options]"},
		{"[options]\nshowname = A\n[emote a]\nanim = a.gif\n", "missing the required name"},
		{"[options]\nname =\n[emote a]\nanim = a.gif\n", "missing the required name"},
		{"[options]\nname = A\n", "no emotes"},
		{"[options]\nname = A\n[emotions]\nnumber = 0\n", "no emotes"},
		{"[options]\nname = A\n[emotions]\nnumber = 2\n3 = c#-#c#0\n", "no emotes"},
	} {
		if _, err := ParseCharIni(tc.ini); err == nil || !strings.Contains(err.Error(), tc.want) {
			t.Errorf("%q: error %v, want %q", tc.ini, err, tc.want)
		}
	}
}

func TestCharIniSoundDelayRounding(t *testing.T) {
	for ms, ticks := range map[int]int{0: 0, 19: 0, 20: 1, 480: 12, 500: 13} {
		e := mustParseCharIni(t, opts+"[emote a]\nanim = a.gif\nsounddelayms = "+itoa(ms)+"\n").Emotes[0]
		if e.SoundDelayMs != ms || e.SoundDelayTicks != ticks {
			t.Errorf("sounddelayms %d -> %d ticks, want %d", ms, e.SoundDelayTicks, ticks)
		}
	}
}

func TestCharIniLegacyEnumForms(t *testing.T) {
	ini := mustParseCharIni(t, opts+"[emotions]\nnumber = 5\n"+
		"1 = a#-#a#zoom#show_during_preanim\n"+
		"2 = b#-#b#ZOOM#Shown\n"+
		"3 = c#-#c#unused_3#3\n"+
		"4 = d#-#d#5x#1\n"+
		"5 = e#-#e# preanim #shown\n")
	want := [][2]string{
		{"zoom", "show_during_preanim"},
		{"no_preanim", "shown"},
		{"unused_3", "show_during_preanim"},
		{"no_preanim", "shown"},
		{"preanim", "shown"},
	}
	for i, w := range want {
		if got := [2]string{string(ini.Emotes[i].Modifier), string(ini.Emotes[i].Deskmod)}; got != w {
			t.Errorf("row %d = %v, want %v", i+1, got, w)
		}
	}
}

func TestCharIniUnsetDeskmod(t *testing.T) {
	ini := mustParseCharIni(t, opts+"[emotions]\nnumber = 7\n"+
		"1 = a#-#a#0#\n"+
		"2 = b#-#b#5# \n"+
		"3 = c#-#c#6\n"+
		"4 = d#-#d#zoom#1\n"+
		"5 = e#-#e#5#1s\n"+
		"6 = f#-#f#0#7\n"+
		"7 = g#-#g#1\n")
	want := []DeskModifier{DeskModifierShown, DeskModifierHidden, DeskModifierHidden, DeskModifierShown, DeskModifierShown, DeskModifierShown, DeskModifierShown}
	for i, w := range want {
		if got := ini.Emotes[i].Deskmod; got != w {
			t.Errorf("legacy row %d deskmod = %s, want %s", i+1, got, w)
		}
	}

	ini = mustParseCharIni(t, opts+"[emote a]\nanim = a.gif\nmodifier = zoom\n[emote b]\nanim = b.gif\nmodifier = zoom\ndeskmod = shown\n")
	if a, b := ini.Emotes[0].Deskmod, ini.Emotes[1].Deskmod; a != DeskModifierHidden || b != DeskModifierShown {
		t.Errorf("block deskmods = %s, %s; want hidden, shown", a, b)
	}
}

func TestCharIniLegacyModifiers(t *testing.T) {
	ini := mustParseCharIni(t, opts+"[emotions]\nnumber = 2\n1 = a#-#a#3\n2 = b#-#b#4\n[emote c]\nanim = c.gif\nmodifier = unused_4\n")
	if m := ini.Emotes[0].Modifier; m != EmoteModifierUnused4 {
		t.Errorf("block unused_4 = %s", m)
	}
	ini = mustParseCharIni(t, opts+"[emotions]\nnumber = 2\n1 = a#-#a#3\n2 = b#-#b#unused_4\n")
	if a, b := ini.Emotes[0].Modifier, ini.Emotes[1].Modifier; a != EmoteModifierUnused3 || b != EmoteModifierUnused4 {
		t.Errorf("legacy 3, unused_4 = %s, %s", a, b)
	}
	ms := &MSToServer{Character: "A", Emote: "a", Message: "m", Side: SideWit, EmoteModifier: ini.Emotes[1].Modifier}
	raw, err := Encode(ms, WireFanta)
	if err != nil || !strings.HasPrefix(string(raw), "MS#1##A#a#m#wit##4#") {
		t.Errorf("unused_4 on the wire = %s, %v; want wire 4", raw, err)
	}
}
