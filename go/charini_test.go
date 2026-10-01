package aolib

import (
	"os"
	"path/filepath"
	"reflect"
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

func parseCharIniErr(t *testing.T, data, want string) {
	t.Helper()
	_, err := ParseCharIni(data)
	if err == nil || !strings.Contains(err.Error(), want) {
		t.Fatalf("ParseCharIni error = %v, want containing %q", err, want)
	}
}

func emoteKeys(es []CharEmote) []string {
	keys := []string{}
	for _, e := range es {
		keys = append(keys, e.Key)
	}
	return keys
}

func eq(t *testing.T, name string, got, want any) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("%s = %#v, want %#v", name, got, want)
	}
}

const legacyIni = `
[options]
name = Fenomeno3D
showname = Fenomeno
side = wit
gender = male
blips = male
chat = default

[emotions]
number = 2
1 = normal#-#idle#1
2 = deskslam#slam#normal#5#1

[soundn]
1 = 0
2 = objection

[soundt]
2 = 10
`

func TestCharIniLegacyRows(t *testing.T) {
	ini := mustParseCharIni(t, legacyIni)
	eq(t, "emote 0", ini.Emotes[0], CharEmote{Key: "1", Name: "normal", Anim: "idle", Modifier: EmoteModifierPreanim, Deskmod: DeskModifierShown})
	eq(t, "emote 1 deskmod", ini.Emotes[1].Deskmod, DeskModifierShown)
	eq(t, "emote 1 modifier", ini.Emotes[1].Modifier, EmoteModifierZoom)
	eq(t, "emote 1 sound", ini.Emotes[1].Sound, "objection")
	eq(t, "emote 1 delay", ini.Emotes[1].SoundDelayMs, 400)
	eq(t, "options", []string{ini.Options.Name, ini.Options.Showname, ini.Options.Side}, []string{"Fenomeno3D", "Fenomeno", "wit"})
}

func TestCharIniTuning(t *testing.T) {
	ini := mustParseCharIni(t, "[Options]\nName = Phoenix\nShowName = Phoenix Wright\n[Emotions]\nNumber = 1\n1 = point#-#point#5\n")
	eq(t, "case-insensitive", []any{ini.Options.Name, ini.Options.Showname, len(ini.Emotes)}, []any{"Phoenix", "Phoenix Wright", 1})

	ini = mustParseCharIni(t, "[options]\nname = Matt\nshowname = MATT\nside = WIT\n")
	eq(t, "value case", []string{ini.Options.Showname, ini.Options.Side}, []string{"MATT", "WIT"})

	ini = mustParseCharIni(t, "[options]\nname = Bare\n")
	eq(t, "defaults", []any{ini.Options.Showname, ini.Options.Side, ini.Options.Blips, ini.Options.Chat, ini.Options.Category}, []any{"", "wit", "male", (*string)(nil), (*string)(nil)})

	if c := mustParseCharIni(t, "[options]\nname = A\nchat =\n").Options.Chat; c == nil || *c != "" {
		t.Errorf("explicit empty chat = %v", c)
	}
	if c := mustParseCharIni(t, "[options]\nname = A\nchat = aa\n").Options.Chat; c == nil || *c != "aa" {
		t.Errorf("chat = %v", c)
	}

	ini = mustParseCharIni(t, "[options]\n; this is a comment\nname = Withcomment\n[emotions]\nnumber = 1\n1 = a#b#c#0\n")
	eq(t, "; comment", []string{ini.Options.Name, ini.Emotes[0].Anim}, []string{"Withcomment", "c"})

	ini = mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 3\n1 = one#-#one#0\n3 = three#-#three#0\n")
	eq(t, "skip missing ids", emoteKeys(ini.Emotes), []string{"1", "3"})

	ini = mustParseCharIni(t, "[options]\nname = T\n[shouts]\nholdit = Hold it!!\n")
	eq(t, "unmodeled section", ini.Sections["shouts"]["holdit"], "Hold it!!")

	eq(t, "options only", mustParseCharIni(t, "[options]\nname = T\n").Emotes, []CharEmote{})

	parseCharIniErr(t, "", "missing required [options]")
	parseCharIniErr(t, "[emotions]\nnumber = 0\n", "missing required [options]")
	parseCharIniErr(t, "[options]\nshowname = X\n", "missing the required `name`")
}

func TestCharIniRealWorldEdgeCases(t *testing.T) {
	first := func(data string) CharEmote { t.Helper(); return mustParseCharIni(t, data).Emotes[0] }

	eq(t, "4 fields", first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = normal#pre#normal#0\n").Deskmod, DeskModifierShown)
	e := first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = #-#void#0#\n")
	eq(t, "trailing empty deskmod", []any{e.Name, e.Anim, e.Deskmod}, []any{"", "void", DeskModifierHidden})

	ini := mustParseCharIni(t, "[options]\nname = Aether\n// chat = genshin\n")
	eq(t, "// comment", ini.Options.Chat, (*string)(nil))
	if _, ok := ini.Options.All["// chat"]; ok {
		t.Error("// line parsed as a key")
	}

	eq(t, "tab separator", mustParseCharIni(t, "[options]\nname\t = Matt\n").Options.Name, "Matt")
	eq(t, "gender fallback", mustParseCharIni(t, "[options]\nname = T\ngender = female\n").Options.Blips, "female")
	eq(t, "blips wins", mustParseCharIni(t, "[options]\nname = T\nblips = male\ngender = female\n").Options.Blips, "male")

	ini = mustParseCharIni(t, "[options]\nname=Abigail\nblips=Female\n")
	eq(t, "no spaces", []string{ini.Options.Name, ini.Options.Blips}, []string{"Abigail", "Female"})

	eq(t, "trailing whitespace", first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n[soundt]\n1 = 3 \n").SoundDelayMs, 120)

	ini = mustParseCharIni(t, "[options]\nname = T\n[time]\npre-smh = 0\npre-shout = 0\n[emotions]\nnumber = 1\n1 = a#-#a#0\n")
	eq(t, "[time]", []any{len(ini.Emotes), ini.Sections["time"]["pre-smh"]}, []any{1, "0"})

	eq(t, "spaces in name", first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = Book Worried Down#-#bWorriedDown#0#0\n").Name, "Book Worried Down")
	eq(t, "numeric name", first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = 1#-#1#0#1\n").Name, "1")

	ini = mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 2\n1 = a#-#a#0\n2 = b#-#b#0\n[soundn]\n1 = et-objection\n")
	eq(t, "sounds", []string{ini.Emotes[0].Sound, ini.Emotes[1].Sound}, []string{"et-objection", ""})

	ini = mustParseCharIni(t, "\uFEFF[options]\nname = Boom\n[emotions]\nnumber = 1\n1 = a#-#a#0\n")
	eq(t, "BOM", []any{ini.Options.Name, len(ini.Emotes)}, []any{"Boom", 1})

	eq(t, "beyond number", emoteKeys(mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n2 = b#-#b#0\n").Emotes), []string{"1"})
	eq(t, "non-numeric modifier", first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#x\n").Modifier, EmoteModifierNoPreanim)

	ini = mustParseCharIni(t, "[options]\r\nname = CRLF\r\n[emotions]\r\nnumber = 1\r\n1 = a#-#a#0\r\n")
	eq(t, "CRLF", []string{ini.Options.Name, ini.Emotes[0].Anim}, []string{"CRLF", "a"})

	ini = mustParseCharIni(t, "[options]\nname = Note\nwhy are you reading the ini lmao\nshowname = Note\n")
	eq(t, "stray text", []string{ini.Options.Name, ini.Options.Showname}, []string{"Note", "Note"})

	eq(t, "# header line", len(mustParseCharIni(t, "[options]\nname = T\n# Comment#Preanimation#Animation#Modifier\n[emotions]\nnumber = 1\n1 = a#-#a#0\n").Emotes), 1)
	parseCharIniErr(t, "+[Options]\nname = Broken\n[emotions]\nnumber = 1\n1 = a#-#a#0\n", "missing required [options]")

	ini = mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 1\n1 = first#-#first#0\n1 = second#-#second#0\n")
	eq(t, "duplicate id", []any{len(ini.Emotes), ini.Emotes[0].Anim}, []any{1, "second"})

	ini = mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 2\n1 = a#-#a#0\n2 = b#pre#b#1\n")
	eq(t, "preanim", []string{ini.Emotes[0].Key, ini.Emotes[0].Preanim, ini.Emotes[1].Key, ini.Emotes[1].Preanim}, []string{"1", "", "2", "pre"})

	eq(t, "model", mustParseCharIni(t, "[options]\nname = Bot\nmodel = model.pmx\n").Options.Model, "model.pmx")
}

const blockIni = `
[options]
name = Bot
model = model.pmx

[emotions]
number = 2
1 = objection
2 = think

[emote objection]
anim    = objection.vmd
preanim = point.vmd
postanim = bow.vmd
camera  = objection_cam.vmd
sound   = objection.opus
sounddelayms = 480
modifier = zoom
deskmod = shown

[emote think]
anim = think_loop.vmd
`

func TestCharIniBlocks(t *testing.T) {
	ini := mustParseCharIni(t, blockIni)
	eq(t, "objection", ini.Emotes[0], CharEmote{
		Key: "objection", Name: "objection", Anim: "objection.vmd", Preanim: "point.vmd", Postanim: "bow.vmd",
		Camera: "objection_cam.vmd", Modifier: EmoteModifierZoom, Deskmod: DeskModifierShown,
		Sound: "objection.opus", SoundDelayMs: 480, SoundDelayTicks: 12,
	})
	eq(t, "think", ini.Emotes[1], CharEmote{Key: "think", Name: "think", Anim: "think_loop.vmd", Modifier: EmoteModifierNoPreanim, Deskmod: DeskModifierShown})

	const head = "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n"
	first := func(data string) CharEmote { t.Helper(); return mustParseCharIni(t, data).Emotes[0] }

	e := first(head + "[emote obj]\nanim = obj.gif\nname = Objection!\n")
	eq(t, "name override", []string{e.Key, e.Name}, []string{"obj", "Objection!"})
	eq(t, "case-insensitive block", first("[options]\nname = T\n[Emotions]\nnumber = 1\n1 = Wave\n[Emote Wave]\nAnim = wave.gif\n").Anim, "wave.gif")
	eq(t, "blocks win", first("[options]\nname = T\n[emotions]\nnumber = 1\n1 = real\n[emote real]\nanim = real.gif\n").Anim, "real.gif")

	ini = mustParseCharIni(t, "[options]\nname = T\n[emote a]\nanim = a.gif\nmodifier = zoom\n[emote b]\nanim = b.gif\nmodifier = objection_zoom\n[emote c]\nanim = c.gif\nmodifier = preanim\n")
	eq(t, "named modifiers", []EmoteModifier{ini.Emotes[0].Modifier, ini.Emotes[1].Modifier, ini.Emotes[2].Modifier}, []EmoteModifier{EmoteModifierZoom, EmoteModifierObjectionZoom, EmoteModifierPreanim})
	ini = mustParseCharIni(t, "[options]\nname = T\n[emote a]\nanim = a.gif\ndeskmod = shown\n[emote b]\nanim = b.gif\ndeskmod = show_during_preanim\n")
	eq(t, "named deskmods", []DeskModifier{ini.Emotes[0].Deskmod, ini.Emotes[1].Deskmod}, []DeskModifier{DeskModifierShown, DeskModifierShowDuringPreanim})

	parseCharIniErr(t, head+"[emote obj]\nanim = obj.gif\nmodifier = 5\n", `modifier "5" must be one of: no_preanim, preanim,`)
	parseCharIniErr(t, head+"[emote obj]\nanim = obj.gif\ndeskmod = 0\n", `deskmod "0" must be one of`)
	parseCharIniErr(t, head+"[emote obj]\nanim = obj\n", "must include a file extension")
	for _, field := range []string{"preanim", "postanim", "camera", "sound"} {
		parseCharIniErr(t, head+"[emote obj]\nanim = obj.gif\n"+field+" = bare\n", field+` "bare" must include a file extension`)
	}

	eq(t, "minimal block", first("[options]\nname = T\n[emote objection]\nanim = objection.gif\n"),
		CharEmote{Key: "objection", Name: "objection", Anim: "objection.gif", Modifier: EmoteModifierNoPreanim, Deskmod: DeskModifierShown})
	eq(t, "postanim", first(head+"[emote obj]\nanim = obj.gif\npostanim = bow.gif\n").Postanim, "bow.gif")
	eq(t, "camera", first(head+"[emote obj]\nanim = obj.vmd\ncamera = obj_cam.vmd\n").Camera, "obj_cam.vmd")

	ini = mustParseCharIni(t, "[options]\nname = T\nmodel = model.pmx\n[emote jog]\nanim = run16.vmd\n[emote wave]\nanim = wave.vmd\n")
	eq(t, "file order", []string{ini.Emotes[0].Key, ini.Emotes[0].Anim, ini.Emotes[1].Key, ini.Emotes[1].Anim}, []string{"jog", "run16.vmd", "wave", "wave.vmd"})
	ini = mustParseCharIni(t, "[options]\nname = T\n[emotions]\nnumber = 1\n1 = wave\n[emote jog]\nanim = run16.vmd\n[emote wave]\nanim = wave.vmd\n")
	eq(t, "[emotions] ignored", emoteKeys(ini.Emotes), []string{"jog", "wave"})
}

func TestCharIniExampleFixtures(t *testing.T) {
	read := func(name string) *CharIni {
		t.Helper()
		raw, err := os.ReadFile(filepath.Join("..", "ts", "examples", "characters", name, "char.ini"))
		if err != nil {
			t.Skipf("fixture not available: %v", err)
		}
		return mustParseCharIni(t, string(raw))
	}

	ini := read("defender")
	eq(t, "defender options", []string{ini.Options.Showname, ini.Options.Model}, []string{"The Defense", ""})
	eq(t, "defender emotes", len(ini.Emotes), 3)
	eq(t, "defender point", ini.Emotes[1], CharEmote{
		Key: "2", Name: "Point", Anim: "point", Preanim: "point", Modifier: EmoteModifierZoom,
		Deskmod: ini.Emotes[1].Deskmod, Sound: "point", SoundDelayMs: 320, SoundDelayTicks: 8,
	})
	eq(t, "defender preanim", ini.Emotes[0].Preanim, "")

	ini = read("robot")
	eq(t, "robot model", ini.Options.Model, "robot.pmx")
	eq(t, "robot emotes", len(ini.Emotes), 2)
	eq(t, "robot objection", ini.Emotes[1], CharEmote{
		Key: "objection", Name: "objection", Anim: "objection.vmd", Preanim: "point.vmd", Postanim: "lower_arm.vmd",
		Camera: ini.Emotes[1].Camera, Modifier: EmoteModifierZoom, Deskmod: DeskModifierShown,
		Sound: "objection.opus", SoundDelayMs: 480, SoundDelayTicks: 12,
	})
}

func TestCharIniSoundDelayAndPlaceholders(t *testing.T) {
	e := mustParseCharIni(t, "[options]\nname = A\n[emote a]\nanim = a.gif\nsounddelayms = 500\n").Emotes[0]
	eq(t, "block delay", []int{e.SoundDelayMs, e.SoundDelayTicks}, []int{500, 13})
	e = mustParseCharIni(t, "[options]\nname = A\n[emotions]\nnumber = 1\n1 = a#-#a#0\n[soundt]\n1 = 7\n").Emotes[0]
	eq(t, "legacy delay", []int{e.SoundDelayMs, e.SoundDelayTicks}, []int{280, 7})

	ini := mustParseCharIni(t, "[options]\nname = A\n[emotions]\nnumber = 4\n1 = a#-#a#0\n2 = b#-#b#0\n3 = c#-#c#0\n4 = d#-#d#0\n[soundn]\n1 = 0\n2 = 1\n3 = -\n4 = sfx-x\n")
	var sounds []string
	for _, e := range ini.Emotes {
		sounds = append(sounds, e.Sound)
	}
	eq(t, "placeholders", sounds, []string{"", "", "", "sfx-x"})
}
