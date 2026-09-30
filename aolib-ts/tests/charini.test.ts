import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { parseCharIni } from "../src/charini";

// The AO-specific quirk: emote values are `#`-delimited, so the parser
// must not treat `#` as an inline comment.

describe("parseCharIni: emote records survive the `#` delimiter", () => {
  const ini = `
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
`;

  it("keeps every `#`-delimited field", () => {
    const { emotes } = parseCharIni(ini);
    expect(emotes).toHaveLength(2);
    expect(emotes[0]).toEqual({
      key: "1",
      name: "normal",
      preanim: null,
      postanim: null,
      camera: null,
      anim: "idle",
      modifier: 1,
      deskmod: 1,
      sound: "0",
      sounddelayms: 0,
    });
  });

  it("reads the optional 5th field as deskmod", () => {
    const { emotes } = parseCharIni(ini);
    expect(emotes[1]?.deskmod).toBe(1);
    expect(emotes[1]?.modifier).toBe(5);
  });

  it("zips [SoundN]/[SoundT] onto the matching emote id", () => {
    const { emotes } = parseCharIni(ini);
    expect(emotes[1]?.sound).toBe("objection");
    expect(emotes[1]?.sounddelayms).toBe(600); // 10 ticks * 60ms
  });

  it("exposes typed options", () => {
    const { options } = parseCharIni(ini);
    expect(options.name).toBe("Fenomeno3D");
    expect(options.showname).toBe("Fenomeno");
    expect(options.side).toBe("wit");
  });
});

// Tuning: case-insensitive sections/keys, defaults, comments.

describe("parseCharIni: tuning", () => {
  it("matches sections and keys case-insensitively", () => {
    const { options, emotes } = parseCharIni(`
[Options]
Name = Phoenix
ShowName = Phoenix Wright

[Emotions]
Number = 1
1 = point#-#point#5
`);
    expect(options.name).toBe("Phoenix");
    expect(options.showname).toBe("Phoenix Wright");
    expect(emotes).toHaveLength(1);
  });

  it("preserves value case (only names are lowercased)", () => {
    const { options } = parseCharIni(`
[options]
name = Matt
showname = MATT
side = WIT
`);
    expect(options.showname).toBe("MATT");
    expect(options.side).toBe("WIT");
  });

  it("applies option defaults when keys are absent", () => {
    const { options } = parseCharIni(`
[options]
name = Bare
`);
    expect(options.showname).toBe("");
    expect(options.side).toBe("wit");
    expect(options.blips).toBe("male");
    expect(options.chat).toBeNull();
    expect(options.category).toBeNull();
  });

  it("defaults chat to null when absent, but keeps an explicit empty chat", () => {
    expect(parseCharIni("[options]\nname = A\n").options.chat).toBeNull();
    expect(parseCharIni("[options]\nname = A\nchat =\n").options.chat).toBe("");
    expect(parseCharIni("[options]\nname = A\nchat = aa\n").options.chat).toBe(
      "aa",
    );
  });

  it("ignores `;` comments but never `#`", () => {
    const { options, emotes } = parseCharIni(`
[options]
; this is a comment
name = Withcomment

[emotions]
number = 1
1 = a#b#c#0
`);
    expect(options.name).toBe("Withcomment");
    expect(emotes[0]?.anim).toBe("c");
  });

  it("skips emote ids that have no definition", () => {
    const { emotes } = parseCharIni(`[options]
name = T

[emotions]
number = 3
1 = one#-#one#0
3 = three#-#three#0
`);
    expect(emotes.map((e) => e.key)).toEqual(["1", "3"]);
  });

  it("keeps unmodeled sections in `sections`", () => {
    const { sections } = parseCharIni(`[options]
name = T

[shouts]
holdit = Hold it!!
`);
    expect(sections.shouts?.holdit).toBe("Hold it!!");
  });

  it("parses an options-only file to empty emotes", () => {
    const { emotes } = parseCharIni("[options]\nname = T\n");
    expect(emotes).toEqual([]);
  });

  it("throws when the [options] section is missing", () => {
    expect(() => parseCharIni("")).toThrow(/missing required \[options\]/);
    expect(() => parseCharIni("[emotions]\nnumber = 0\n")).toThrow(
      /missing required \[options\]/,
    );
  });

  it("throws when [options] has no name", () => {
    expect(() => parseCharIni("[options]\nshowname = X\n")).toThrow(
      /missing the required `name`/,
    );
  });
});

// Edge cases drawn from real char.ini files on public bases (empty emote
// names, `//` comments, tab separators, named [Time] keys, etc.).

describe("parseCharIni: real-world edge cases", () => {
  it("defaults deskmod to 1 when the emote has only 4 fields", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = normal#pre#normal#0\n",
    );
    expect(emotes[0]?.deskmod).toBe(1);
  });

  it("reads a trailing empty deskmod field as 0", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = #-#void#0#\n",
    );
    expect(emotes[0]).toMatchObject({ name: "", anim: "void", deskmod: 0 });
  });

  it("ignores `//` line comments (used to disable an option)", () => {
    const { options } = parseCharIni(
      "[options]\nname = Aether\n// chat = genshin\n",
    );
    expect(options.chat).toBeNull();
    expect(Object.keys(options)).not.toContain("// chat");
  });

  it("parses tab-separated `key<tab>= value`", () => {
    const { options } = parseCharIni("[options]\nname\t = Matt\n");
    expect(options.name).toBe("Matt");
  });

  it("falls back to the obsolete `gender` key for blips", () => {
    // No blips: gender supplies it.
    expect(
      parseCharIni("[options]\nname = T\ngender = female\n").options.blips,
    ).toBe("female");
    // blips wins when both are present.
    expect(
      parseCharIni("[options]\nname = T\nblips = male\ngender = female\n")
        .options.blips,
    ).toBe("male");
  });

  it("parses `key=value` with no surrounding spaces", () => {
    const { options } = parseCharIni("[options]\nname=Abigail\nblips=Female\n");
    expect(options.name).toBe("Abigail");
    expect(options.blips).toBe("Female");
  });

  it("trims trailing whitespace from values", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n[soundt]\n1 = 3 \n",
    );
    expect(emotes[0]?.sounddelayms).toBe(180); // 3 ticks * 60ms
  });

  it("keeps named [Time] keys in sections, not emotes", () => {
    const { emotes, sections } = parseCharIni(
      "[options]\nname = T\n[time]\npre-smh = 0\npre-shout = 0\n[emotions]\nnumber = 1\n1 = a#-#a#0\n",
    );
    expect(emotes).toHaveLength(1);
    expect(sections.time?.["pre-smh"]).toBe("0");
  });

  it("preserves emote names containing spaces", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = Book Worried Down#-#bWorriedDown#0#0\n",
    );
    expect(emotes[0]?.name).toBe("Book Worried Down");
  });

  it("keeps a numeric emote name as a string", () => {
    const { emotes } = parseCharIni("[options]\nname = T\n[emotions]\nnumber = 1\n1 = 1#-#1#0#1\n");
    expect(emotes[0]?.name).toBe("1");
  });

  it("keeps a named sound and nulls a missing one", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 2\n1 = a#-#a#0\n2 = b#-#b#0\n[soundn]\n1 = et-objection\n",
    );
    expect(emotes[0]?.sound).toBe("et-objection");
    expect(emotes[1]?.sound).toBeNull();
  });

  it("strips a UTF-8 BOM before the first section", () => {
    const { options, emotes } = parseCharIni(
      "﻿[options]\nname = Boom\n[emotions]\nnumber = 1\n1 = a#-#a#0\n",
    );
    expect(options.name).toBe("Boom");
    expect(emotes).toHaveLength(1);
  });

  it("ignores emote lines beyond the declared number", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n2 = b#-#b#0\n",
    );
    expect(emotes.map((e) => e.key)).toEqual(["1"]);
  });

  it("defaults a non-numeric modifier to 0", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#x\n",
    );
    expect(emotes[0]?.modifier).toBe(0);
  });

  it("handles CRLF line endings", () => {
    const { options, emotes } = parseCharIni(
      "[options]\r\nname = CRLF\r\n[emotions]\r\nnumber = 1\r\n1 = a#-#a#0\r\n",
    );
    expect(options.name).toBe("CRLF");
    expect(emotes[0]?.anim).toBe("a");
  });

  it("tolerates stray free-text lines without throwing", () => {
    // Real files contain author notes on their own line.
    const { options } = parseCharIni(
      "[options]\nname = Note\nwhy are you reading the ini lmao\nshowname = Note\n",
    );
    expect(options.name).toBe("Note");
    expect(options.showname).toBe("Note");
  });

  it("tolerates `#`-led header lines mid-file", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n# Comment#Preanimation#Animation#Modifier\n[emotions]\nnumber = 1\n1 = a#-#a#0\n",
    );
    expect(emotes).toHaveLength(1);
  });

  it("throws on a malformed [options] header (no valid options section)", () => {
    // e.g. `+[Options]` or `Options]` seen in the wild parse as a different
    // section name, so the required [options] is effectively missing.
    expect(() =>
      parseCharIni("+[Options]\nname = Broken\n[emotions]\nnumber = 1\n1 = a#-#a#0\n"),
    ).toThrow(/missing required \[options\]/);
  });

  it("keeps the last of duplicate emote ids", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = first#-#first#0\n1 = second#-#second#0\n",
    );
    expect(emotes).toHaveLength(1);
    expect(emotes[0]?.anim).toBe("second");
  });

  it("normalizes a legacy `-` preanim to null and keys by id", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 2\n1 = a#-#a#0\n2 = b#pre#b#1\n",
    );
    expect(emotes[0]).toMatchObject({ key: "1", preanim: null });
    expect(emotes[1]).toMatchObject({ key: "2", preanim: "pre" });
  });

  it("reads the [options] model key (3D marker)", () => {
    const { options } = parseCharIni("[options]\nname = Bot\nmodel = model.pmx\n");
    expect(options.model).toBe("model.pmx");
  });
});

// Extended spec: `[emote <name>]` blocks (preferred over legacy banks).

describe("parseCharIni: [emote <name>] blocks", () => {
  const ini = `
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
`;

  it("resolves emotes from their blocks in button order", () => {
    const { emotes } = parseCharIni(ini);
    expect(emotes).toHaveLength(2);
    expect(emotes[0]).toEqual({
      key: "objection",
      name: "objection",
      anim: "objection.vmd",
      preanim: "point.vmd",
      postanim: "bow.vmd",
      camera: "objection_cam.vmd",
      modifier: 5,
      deskmod: 1,
      sound: "objection.opus",
      sounddelayms: 480,
    });
  });

  it("defaults name to the block key and applies field defaults", () => {
    const { emotes } = parseCharIni(ini);
    expect(emotes[1]).toEqual({
      key: "think",
      name: "think",
      anim: "think_loop.vmd",
      preanim: null,
      postanim: null,
      camera: null,
      modifier: 0,
      deskmod: 1,
      sound: null,
      sounddelayms: 0,
    });
  });

  it("lets `name =` override the display label", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.gif\nname = Objection!\n",
    );
    expect(emotes[0]?.key).toBe("obj");
    expect(emotes[0]?.name).toBe("Objection!");
  });

  it("matches block sections case-insensitively", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[Emotions]\nnumber = 1\n1 = Wave\n[Emote Wave]\nAnim = wave.gif\n",
    );
    expect(emotes[0]?.anim).toBe("wave.gif");
  });

  it("ignores legacy #-records once any block exists", () => {
    // A file mixing the two: blocks win, so the `#` value is treated as a
    // block name (no such block), not split into legacy fields.
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = real\n[emote real]\nanim = real.gif\n",
    );
    expect(emotes[0]?.anim).toBe("real.gif");
  });

  it("accepts a named EmoteModifier in the block `modifier` field", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 3\n1 = a\n2 = b\n3 = c\n" +
        "[emote a]\nanim = a.gif\nmodifier = zoom\n" +
        "[emote b]\nanim = b.gif\nmodifier = objection_zoom\n" +
        "[emote c]\nanim = c.gif\nmodifier = preanim\n",
    );
    expect(emotes[0]?.modifier).toBe(5);
    expect(emotes[1]?.modifier).toBe(6);
    expect(emotes[2]?.modifier).toBe(1);
  });

  it("rejects a bare number for a block `modifier`", () => {
    expect(() =>
      parseCharIni("[options]\nname = T\n[emotions]\nnumber = 1\n1 = a\n[emote a]\nanim = a.gif\nmodifier = 5\n"),
    ).toThrow(/modifier "5" must be one of/);
  });

  it("rejects a bare number for a block `deskmod`", () => {
    expect(() =>
      parseCharIni("[options]\nname = T\n[emotions]\nnumber = 1\n1 = a\n[emote a]\nanim = a.gif\ndeskmod = 0\n"),
    ).toThrow(/deskmod "0" must be one of/);
  });

  it("accepts a named DeskModifier in the block `deskmod` field", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 2\n1 = a\n2 = b\n" +
        "[emote a]\nanim = a.gif\ndeskmod = shown\n" +
        "[emote b]\nanim = b.gif\ndeskmod = show_during_preanim\n",
    );
    expect(emotes[0]?.deskmod).toBe(1);
    expect(emotes[1]?.deskmod).toBe(3);
  });

  it("rejects a block `anim` without a file extension", () => {
    expect(() =>
      parseCharIni("[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj\n"),
    ).toThrow(/must include a file extension/);
  });

  it("rejects a block `preanim` without a file extension", () => {
    expect(() =>
      parseCharIni(
        "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.gif\npreanim = point\n",
      ),
    ).toThrow(/preanim .* must include a file extension/);
  });

  it("rejects a block `sound` without a file extension", () => {
    expect(() =>
      parseCharIni(
        "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.gif\nsound = boom\n",
      ),
    ).toThrow(/sound .* must include a file extension/);
  });

  it("parses a minimal block: only anim, everything else defaulted", () => {
    // No [emotions]; the sole required field is `anim` (with extension).
    const { emotes } = parseCharIni("[options]\nname = T\n[emote objection]\nanim = objection.gif\n");
    expect(emotes).toHaveLength(1);
    expect(emotes[0]).toEqual({
      key: "objection",
      name: "objection", // defaults to the block name
      anim: "objection.gif",
      preanim: null,
      postanim: null,
      camera: null,
      modifier: 0, // no_preanim
      deskmod: 1, // shown
      sound: null,
      sounddelayms: 0,
    });
  });

  it("still allows an absent preanim/postanim/sound in a block", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.gif\n",
    );
    expect(emotes[0]).toMatchObject({
      preanim: null,
      postanim: null,
      sound: null,
    });
  });

  it("reads a block `postanim` (exit animation)", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.gif\npostanim = bow.gif\n",
    );
    expect(emotes[0]?.postanim).toBe("bow.gif");
  });

  it("rejects a block `postanim` without a file extension", () => {
    expect(() =>
      parseCharIni(
        "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.gif\npostanim = bow\n",
      ),
    ).toThrow(/postanim .* must include a file extension/);
  });

  it("leaves postanim null for legacy emotes", () => {
    const { emotes } = parseCharIni("[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n");
    expect(emotes[0]?.postanim).toBeNull();
  });

  it("reads a block `camera` (camera-motion VMD)", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.vmd\ncamera = obj_cam.vmd\n",
    );
    expect(emotes[0]?.camera).toBe("obj_cam.vmd");
  });

  it("rejects a block `camera` without a file extension", () => {
    expect(() =>
      parseCharIni(
        "[options]\nname = T\n[emotions]\nnumber = 1\n1 = obj\n[emote obj]\nanim = obj.vmd\ncamera = obj_cam\n",
      ),
    ).toThrow(/camera .* must include a file extension/);
  });

  it("leaves camera null for legacy emotes", () => {
    const { emotes } = parseCharIni("[options]\nname = T\n[emotions]\nnumber = 1\n1 = a#-#a#0\n");
    expect(emotes[0]?.camera).toBeNull();
  });

  it("uses every block in file order when `[emotions]` is absent", () => {
    const { emotes } = parseCharIni(
      "[options]\nname = T\nmodel = model.pmx\n" +
        "[emote jog]\nanim = run16.vmd\n" +
        "[emote wave]\nanim = wave.vmd\n",
    );
    expect(emotes.map((e) => ({ key: e.key, anim: e.anim }))).toEqual([
      { key: "jog", anim: "run16.vmd" },
      { key: "wave", anim: "wave.vmd" },
    ]);
  });

  it("ignores `[emotions]` completely once any block exists", () => {
    const { emotes } = parseCharIni(
      // `[emotions]` lists only `wave`, but blocks win: both emotes, in
      // file order (jog then wave), and the section is not consulted.
      "[options]\nname = T\n[emotions]\nnumber = 1\n1 = wave\n" +
        "[emote jog]\nanim = run16.vmd\n" +
        "[emote wave]\nanim = wave.vmd\n",
    );
    expect(emotes.map((e) => e.key)).toEqual(["jog", "wave"]);
  });
});

// The committed example characters in examples/characters/, parsed from
// disk (a real on-disk regression, not an inline string).

describe("parseCharIni: example fixtures", () => {
  const read = (name: string) =>
    parseCharIni(
      readFileSync(`${import.meta.dir}/../examples/characters/${name}/char.ini`, "utf8"),
    );

  it("parses the legacy 2D example (defender)", () => {
    const { options, emotes } = read("defender");
    expect(options.showname).toBe("The Defense");
    expect(options.model).toBe("");
    expect(emotes).toHaveLength(3);
    expect(emotes[1]).toMatchObject({
      key: "2",
      name: "Point",
      anim: "point",
      preanim: "point",
      modifier: 5,
      sound: "point",
      sounddelayms: 480, // 8 ticks * 60ms
    });
    expect(emotes[0]?.preanim).toBeNull();
  });

  it("parses the block-encoded 3D example (robot)", () => {
    const { options, emotes } = read("robot");
    expect(options.model).toBe("robot.pmx");
    expect(emotes).toHaveLength(2);
    expect(emotes[1]).toMatchObject({
      key: "objection",
      name: "objection",
      anim: "objection.vmd",
      preanim: "point.vmd",
      postanim: "lower_arm.vmd",
      modifier: 5,
      deskmod: 1,
      sound: "objection.opus",
      sounddelayms: 480,
    });
  });
});
