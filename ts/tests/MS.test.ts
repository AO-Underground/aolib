import { describe, it, expect } from "bun:test";
import { encode } from "../src/encode";
import { decode } from "../src/decode";
import { server, client } from "../src/session";
import {
  type MSToServer as MSToServerType,
  type MSToClient as MSToClientType,
  type MSToServerInit,
  type MSToClientInit,
  MSToServerSchema as MSToServer,
  MSToClientSchema as MSToClient,
} from "../generated/packets";
import {
  Side,
  DeskModifier,
  EmoteModifier,
  ShoutModifier,
  Flip,
  TextColor,
  isFullView,
  type Offset,
} from "../src/enums";


// Enums round-trip on every wire format.

describe("MS: enum values round-trip", () => {
  const minimal = {
    character: "Phoenix",
    emote: "normal",
    message: "Objection!",
    side: Side.def,
    char_id: 1,
  };

  it("DeskModifier maps to its underlying integer on the wire", () => {
    const fanta = encode(
      MSToServer,
      { ...minimal, desk_modifier: DeskModifier.hide_during_preanim },
      "fanta",
    );
    // Slot 0 (after `MS#`) holds the desk_modifier value, `2`.
    expect(fanta.startsWith("MS#2#")).toBe(true);
    const decoded = decode(MSToServer, fanta) as unknown as MSToServerType;
    expect(decoded.desk_modifier).toBe(DeskModifier.hide_during_preanim);
  });

  it("EmoteModifier round-trips for every enum value", () => {
    for (const v of [
      EmoteModifier.no_preanim,
      EmoteModifier.preanim,
      EmoteModifier.preanim_and_objection,
      EmoteModifier.zoom,
      EmoteModifier.objection_zoom,
    ]) {
      const w = encode(MSToServer, { ...minimal, emote_modifier: v }, "fanta");
      expect((decode(MSToServer, w) as unknown as MSToServerType).emote_modifier).toBe(v);
    }
  });

  it("ShoutModifier round-trips for every enum value", () => {
    for (const v of [
      ShoutModifier.none,
      ShoutModifier.hold_it,
      ShoutModifier.objection,
      ShoutModifier.take_that,
      ShoutModifier.custom,
    ]) {
      const w = encode(MSToServer, { ...minimal, shout_modifier: v }, "fanta");
      expect((decode(MSToServer, w) as unknown as MSToServerType).shout_modifier).toBe(v);
    }
  });

  it("Flip round-trips", () => {
    for (const v of [Flip.none, Flip.horizontal, Flip.vertical, Flip.horizontal_and_vertical]) {
      const w = encode(MSToServer, { ...minimal, flip: v }, "fanta");
      expect((decode(MSToServer, w) as unknown as MSToServerType).flip).toBe(v);
    }
  });

  it("TextColor round-trips for every enum value", () => {
    for (const v of [
      TextColor.white, TextColor.green, TextColor.red, TextColor.orange,
      TextColor.blue, TextColor.yellow, TextColor.pink, TextColor.cyan,
      TextColor.grey, TextColor.rainbow,
    ]) {
      const w = encode(MSToServer, { ...minimal, text_color: v }, "fanta");
      expect((decode(MSToServer, w) as unknown as MSToServerType).text_color).toBe(v);
    }
  });

  it("Side carries the 3-letter wire value", () => {
    for (const v of [
      Side.def, Side.pro, Side.hld,
      Side.hlp, Side.wit, Side.jud, Side.jur,
      Side.sea,
    ]) {
      const w = encode(MSToServer, { ...minimal, side: v }, "fanta");
      // Slot 5 (after `MS#`) holds side.
      expect(w.split("#")[6]).toBe(v);
      expect((decode(MSToServer, w) as unknown as MSToServerType).side).toBe(v);
    }
  });

  it("accepts bare string literals for enum fields at a typed send", () => {
    // The enums are unions, so a plain "wit"/"zoom"/"shown" type-checks
    // without importing the enum. This test compiling is the assertion;
    // it also confirms the wire encoding matches the enum-member path.
    const out: string[] = [];
    const c = client({ send: (w) => out.push(w) }); // send.MS => MSToClientInit
    c.send.MS({
      character: "Phoenix",
      emote: "normal",
      message: "hi",
      side: "wit",
      char_id: 0,
      emote_modifier: "zoom",
      desk_modifier: "shown",
      text_color: "red",
      flip: "none",
    });
    expect(decode(MSToClient, out[0] ?? "")).toMatchObject({ $header: "MS",
      side: "wit",
      emote_modifier: "zoom",
      desk_modifier: "shown",
      text_color: "red",
      flip: "none",
    });
  });
});

// Optional defaults, caller can omit nearly everything.

describe("MS: minimal-input encoding fills every default", () => {
  it("MSToServer with only required fields produces a valid 27-token wire", () => {
    const wire = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "Hello",
        side: Side.wit,
        char_id: 5,
      },
      "fanta",
    );
    // Header + 26 fields = 27 tokens, then `%` terminator.
    const parts = wire.split("#");
    expect(parts[0]).toBe("MS");
    expect(parts.length).toBe(28); // 27 + the trailing "%"
    expect(parts[parts.length - 1]).toBe("%");
  });

  it("decode of that minimal wire fills all defaults", () => {
    const wire = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "Hello",
        side: Side.wit,
        char_id: 5,
      },
      "fanta",
    );
    const decoded = decode(MSToServer, wire) as unknown as MSToServerType;
    expect(decoded).toMatchObject({ $header: "MS",
      desk_modifier: DeskModifier.shown,
      preanim: "",
      character: "Phoenix",
      emote: "normal",
      message: "Hello",
      side: Side.wit,
      sfx_name: "",
      emote_modifier: EmoteModifier.no_preanim,
      char_id: 5,
      sfx_delay: 0,
      shout_modifier: ShoutModifier.none,
      evidence_id: 0,
      flip: Flip.none,
      realization: false,
      text_color: TextColor.white,
      showname: "",
      paired_charid: -1,
      offset: { x: 0, y: 0 },
      noninterrupting_preanim: false,
      sfx_looping: false,
      screenshake: false,
      frames_shake: "",
      frames_realization: "",
      frames_sfx: "",
      additive: false,
      effect: { name: "", folder: "", sound: "" },
    });
  });
});

// Offset: `x&y` with `<and>` escape on fanta, `{x, y}` native on JSON.

describe("MS: offset codec", () => {
  it("offset packs as `x&y` on the fanta wire (modern, no `<and>` escape)", () => {
    const wire = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "hi",
        side: Side.wit,
        char_id: 0,
        offset: { x: 50, y: -20 },
      },
      "fanta",
    );
    // Slot 18 holds offset (HEAD has 17 fields, offset is field 18,
    // which is at index 18 in the `#`-split array after the header).
    const parts = wire.split("#");
    expect(parts[18]).toBe("50&-20");
  });

  it("decode tolerates the legacy `<and>` escape form", () => {
    // Older peers (or our own pre-modernisation output) escape the `&`
    // separator to `<and>`. The decoder strips it before splitting.
    const parts = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "hi",
        side: Side.wit,
        char_id: 0,
        offset: { x: 50, y: -20 },
      },
      "fanta",
    ).split("#");
    parts[18] = "50<and>-20"; // legacy form
    const decoded = decode(MSToServer, parts.join("#")) as unknown as MSToServerType;
    expect(decoded.offset).toEqual({ x: 50, y: -20 });
  });

  it("offset decodes from the modern wire form", () => {
    const wire = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "hi",
        side: Side.wit,
        char_id: 0,
        offset: { x: 50, y: -20 },
      },
      "fanta",
    );
    const decoded = decode(MSToServer, wire) as unknown as MSToServerType;
    expect(decoded.offset).toEqual({ x: 50, y: -20 });
  });

  it("offset is a native object on JSON (no escape dance)", () => {
    const json = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "hi",
        side: Side.wit,
        char_id: 0,
        offset: { x: 50, y: -20 },
      },
      "json",
    );
    expect(JSON.parse(json).offset).toEqual({ x: 50, y: -20 });
    const decoded = decode(MSToServer, json) as unknown as MSToServerType;
    expect(decoded.offset).toEqual({ x: 50, y: -20 });
  });

  it("an empty offset slot decodes to the default", () => {
    // AO2 servers send an empty paired_offset when there is no pair.
    const wire = "MS#1#-#angel starr#normal#a#wit#0#0#33#0#0#0#0#0#0##-1###0<and>0##0#0#0#0#-#-#-#0##%";
    const decoded = decode(MSToClient, wire) as unknown as MSToClientType;
    expect(decoded.offset).toEqual({ x: 0, y: 0 });
    expect(decoded.paired_offset).toEqual({ x: 0, y: 0 });
    expect(decoded.message).toBe("a");
  });

});

// Effect: `name|folder|sound` on fanta, `{name, folder, sound}` native on JSON.

describe("MS: effect codec", () => {
  const base = {
    character: "Phoenix",
    emote: "normal",
    message: "hi",
    side: Side.wit,
    char_id: 0,
  } as const;

  function effectSlot(wire: string): string {
    // effect is the last positional slot, just before the "%" terminator.
    const parts = wire.split("#");
    return parts[parts.length - 2] ?? "";
  }

  it("packs as `name|folder|sound` on the fanta wire", () => {
    const wire = encode(
      MSToClient,
      { ...base, effect: { name: "realization", folder: "custom", sound: "realize.wav" } },
      "fanta",
    );
    expect(effectSlot(wire)).toBe("realization|custom|realize.wav");
  });

  it("an all-empty effect collapses to an empty slot", () => {
    const wire = encode(MSToClient, { ...base, effect: { name: "", folder: "", sound: "" } }, "fanta");
    expect(effectSlot(wire)).toBe("");
  });

  it("round-trips a full effect through the fanta wire", () => {
    const eff = { name: "realization", folder: "custom", sound: "realize.wav" };
    const wire = encode(MSToClient, { ...base, effect: eff }, "fanta");
    const decoded = decode(MSToClient, wire) as unknown as MSToClientType;
    expect(decoded.effect).toEqual(eff);
  });

  it("an empty slot decodes back to the all-empty effect", () => {
    const wire = encode(MSToClient, { ...base }, "fanta");
    const decoded = decode(MSToClient, wire) as unknown as MSToClientType;
    expect(decoded.effect).toEqual({ name: "", folder: "", sound: "" });
  });

  it("legacy name-only form decodes positionally", () => {
    const wire = encode(MSToClient, { ...base }, "fanta").split("#");
    wire[wire.length - 2] = "realization"; // 1-part legacy
    const decoded = decode(MSToClient, wire.join("#")) as unknown as MSToClientType;
    expect(decoded.effect).toEqual({ name: "realization", folder: "", sound: "" });
  });

  it("is a native object on JSON (no `|` packing)", () => {
    const eff = { name: "realization", folder: "custom", sound: "realize.wav" };
    const json = encode(MSToClient, { ...base, effect: eff }, "json");
    expect(JSON.parse(json).effect).toEqual(eff);
    const decoded = decode(MSToClient, json) as unknown as MSToClientType;
    expect(decoded.effect).toEqual(eff);
  });

  it("chat-meta in effect parts survives the fanta round-trip", () => {
    const eff = { name: "tag #1", folder: "a & b", sound: "100%.wav" };
    const wire = encode(MSToClient, { ...base, effect: eff }, "fanta");
    const decoded = decode(MSToClient, wire) as unknown as MSToClientType;
    expect(decoded.effect).toEqual(eff);
  });
});

// Asymmetric shapes: MSToServer (26 fields) vs MSToClient (30 fields).

describe("MS: request vs broadcast shape divergence", () => {
  it("MSToServer wire has exactly 26 positional slots after the header", () => {
    const wire = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "hi",
        side: Side.wit,
        char_id: 1,
      },
      "fanta",
    );
    // header + 26 fields + terminator = 28 elements when split by `#`.
    expect(wire.split("#").length).toBe(28);
  });

  it("MSToClient wire has exactly 30 positional slots after the header", () => {
    const wire = encode(
      MSToClient,
      {
        character: "Phoenix",
        emote: "normal",
        message: "hi",
        side: Side.wit,
        char_id: 1,
      },
      "fanta",
    );
    expect(wire.split("#").length).toBe(32);
  });

  it("MSToClient carries paired_name / paired_emote / paired_offset / paired_flip", () => {
    const wire = encode(
      MSToClient,
      {
        character: "Phoenix",
        emote: "normal",
        message: "I am paired",
        side: Side.wit,
        char_id: 1,
        paired_name: "Edgeworth",
        paired_emote: "smirk",
        paired_offset: { x: 100, y: 0 },
        paired_flip: Flip.horizontal,
      },
      "fanta",
    );
    const decoded = decode(MSToClient, wire) as unknown as MSToClientType;
    expect(decoded.paired_name).toBe("Edgeworth");
    expect(decoded.paired_emote).toBe("smirk");
    expect(decoded.paired_offset).toEqual({ x: 100, y: 0 });
    expect(decoded.paired_flip).toBe(Flip.horizontal);
  });

  it("missing required field on the wire throws (cast guards the boundary)", () => {
    // Sending MS without `char_id` should be rejected, the typed API
    // requires character, message, side, char_id at minimum.
    expect(() =>
      decode(MSToClient, "MS#1#preanim#Phoenix##Hello#wit#%"),
    ).toThrow(/must have required property 'char_id'/);
  });
});

// Chat-escape passes through every string field.

describe("MS: chat-meta in user fields round-trips", () => {
  it("message field with #, &, %, $ survives", () => {
    const p = {
      character: "Phoenix",
      emote: "normal",
      message: "100% sure & #1 takes $5",
      side: Side.wit,
      char_id: 1,
    };
    const wire = encode(MSToServer, p, "fanta");
    const decoded = decode(MSToServer, wire) as unknown as MSToServerType;
    expect(decoded.message).toBe("100% sure & #1 takes $5");
  });

  it("showname with meta-chars", () => {
    const p = {
      character: "Phoenix",
      emote: "normal",
      message: "hi",
      side: Side.wit,
      char_id: 1,
      showname: "Wright & Co.",
    };
    const decoded = decode(
      MSToServer,
      encode(MSToServer, p, "fanta"),
    ) as unknown as MSToServerType;
    expect(decoded.showname).toBe("Wright & Co.");
  });
});

// JSON round-trips

describe("MS: JSON envelope round-trip", () => {
  it("MSToClient: all fields preserved", () => {
    const p: MSToClientInit = {
      desk_modifier: DeskModifier.shown,
      preanim: "phoenix-confident",
      character: "Phoenix",
      emote: "normal",
      message: "Objection!",
      side: Side.def,
      sfx_name: "objection.opus",
      emote_modifier: EmoteModifier.preanim_and_objection,
      char_id: 5,
      sfx_delay: 0,
      shout_modifier: ShoutModifier.objection,
      evidence_id: 3,
      flip: Flip.none,
      realization: false,
      text_color: TextColor.red,
      showname: "Phoenix Wright",
      paired_charid: -1,
      paired_name: "",
      paired_emote: "",
      offset: { x: 0, y: 0 },
      paired_offset: { x: 0, y: 0 },
      paired_flip: Flip.none,
      noninterrupting_preanim: false,
      sfx_looping: false,
      screenshake: false,
      frames_shake: "",
      frames_realization: "",
      frames_sfx: "",
      additive: false,
      effect: { name: "", folder: "", sound: "" },
    };
    const json = encode(MSToClient, p, "json");
    const decoded = decode(MSToClient, json) as unknown as MSToClientType;
    expect(decoded).toEqual({ $header: "MS", ...p } as unknown as MSToClientType);
  });

  it("enums survive a JSON round-trip with the correct typed value", () => {
    const p: MSToServerInit = {
      character: "Phoenix",
      emote: "normal",
      message: "Objection!",
      side: Side.pro,
      char_id: 7,
      shout_modifier: ShoutModifier.hold_it,
      text_color: TextColor.blue,
    };
    const json = encode(MSToServer, p, "json");
    const decoded = decode(MSToServer, json) as unknown as MSToServerType;
    expect(decoded.side).toBe(Side.pro);
    expect(decoded.shout_modifier).toBe(ShoutModifier.hold_it);
    expect(decoded.text_color).toBe(TextColor.blue);
  });

  it("string-first: JSON carries enum strings; the legacy ints live only on fanta", () => {
    const p: MSToServerInit = {
      character: "Phoenix",
      emote: "normal",
      message: "Hello",
      side: Side.wit, // plain enum, no x-wire-ints
      char_id: 1,
      desk_modifier: DeskModifier.shown, // wire int 1
      emote_modifier: EmoteModifier.zoom, // wire int 5
      shout_modifier: ShoutModifier.objection, // wire int 2
      flip: Flip.horizontal, // wire int 1
      text_color: TextColor.red, // wire int 2
    };

    // JSON envelope: every enum field is its string value, no magic numbers.
    const obj = JSON.parse(encode(MSToServer, p, "json")) as Record<string, unknown>;
    expect(obj.side).toBe("wit");
    expect(obj.desk_modifier).toBe("shown");
    expect(obj.emote_modifier).toBe("zoom");
    expect(obj.shout_modifier).toBe("objection");
    expect(obj.flip).toBe("horizontal");
    expect(obj.text_color).toBe("red");
    for (const k of [
      "side",
      "desk_modifier",
      "emote_modifier",
      "shout_modifier",
      "flip",
      "text_color",
    ]) {
      expect(typeof obj[k]).toBe("string");
    }

    // Fanta wire: x-wire-ints enums serialize as the legacy integers (the
    // string names never appear); Side, having no x-wire-ints, stays a string.
    const fanta = encode(MSToServer, p, "fanta");
    for (const name of ["shown", "zoom", "objection", "horizontal", "red"]) {
      expect(fanta).not.toContain(name);
    }
    expect(fanta).toContain("wit");

    // Both wires decode back to the same string enum values.
    const want = {
      side: "wit",
      desk_modifier: "shown",
      emote_modifier: "zoom",
      shout_modifier: "objection",
      flip: "horizontal",
      text_color: "red",
    };
    expect(decode(MSToServer, fanta)).toMatchObject({ $header: "MS", ...want });
    expect(decode(MSToServer, encode(MSToServer, p, "json"))).toMatchObject({ $header: "MS", ...want });
  });
});

// Session integration.

describe("MS: session integration", () => {
  it("server.send.MS uses MSToServer (no paired_name)", () => {
    const out: string[] = [];
    const s = server({ send: (w) => out.push(w) });
    s.send.MS({
      character: "Phoenix",
      emote: "normal",
      message: "hi",
      side: Side.wit,
      char_id: 1,
    });
    expect(out.length).toBe(1);
    // 26-field wire shape.
    expect(out[0]!.split("#").length).toBe(28);
  });

  it("server.on.MS receives MSToClient shape (has paired_name)", () => {
    const s = server({ send: () => {} });
    let received: MSToClientType | undefined;
    s.on.MS((p) => {
      received = p;
    });
    // A 30-field broadcast.
    const wire = encode(
      MSToClient,
      {
        character: "Edgeworth",
        emote: "normal",
        message: "I object",
        side: Side.pro,
        char_id: 2,
        paired_name: "Phoenix",
        paired_emote: "stunned",
      },
      "fanta",
    );
    s.receive(wire);
    expect(received).toBeDefined();
    expect(received!.character).toBe("Edgeworth");
    expect(received!.paired_name).toBe("Phoenix");
    expect(received!.paired_emote).toBe("stunned");
  });

  it("client.send.MS uses MSToClient (has paired_*)", () => {
    const out: string[] = [];
    const c = client({ send: (w) => out.push(w) });
    c.send.MS({
      character: "Phoenix",
      emote: "normal",
      message: "broadcast",
      side: Side.wit,
      char_id: 1,
      paired_name: "Edgeworth",
      paired_offset: { x: 50, y: 0 },
    });
    expect(out.length).toBe(1);
    expect(out[0]!.split("#").length).toBe(32);
  });

  it("client.on.MS receives MSToServer shape (no paired_name field present)", () => {
    const c = client({ send: () => {} });
    let received: MSToServerType | undefined;
    c.on.MS((p) => {
      received = p;
    });
    const wire = encode(
      MSToServer,
      {
        character: "Phoenix",
        emote: "normal",
        message: "from client",
        side: Side.def,
        char_id: 5,
      },
      "fanta",
    );
    c.receive(wire);
    expect(received).toBeDefined();
    expect(received!.character).toBe("Phoenix");
    expect("paired_name" in (received as object)).toBe(false);
  });
});

// isFullView helper.

describe("MS: isFullView()", () => {
  it("is true for DEFENSE, PROSECUTION, WITNESS", () => {
    expect(isFullView(Side.def)).toBe(true);
    expect(isFullView(Side.pro)).toBe(true);
    expect(isFullView(Side.wit)).toBe(true);
  });

  it("is false for everything else", () => {
    expect(isFullView(Side.jud)).toBe(false);
    expect(isFullView(Side.jur)).toBe(false);
    expect(isFullView(Side.sea)).toBe(false);
    expect(isFullView(Side.hld)).toBe(false);
    expect(isFullView(Side.hlp)).toBe(false);
  });
});

// Type-level sanity (compiles only, no runtime effect).

describe("MS: type derivation", () => {
  it("In<MSToServer>.side is Side; Out<MSToServer>.side is Side", () => {
    // The point of this test is the TypeScript types; if it
    // compiles, we're good. Runtime is trivial.
    const sideIn: MSToServerType["side"] = Side.wit;
    const offIn: MSToServerType["offset"] | undefined = undefined;
    const off: Offset = { x: 1, y: 2 };
    expect(sideIn).toBe(Side.wit);
    expect(offIn).toBeUndefined();
    expect(off).toEqual({ x: 1, y: 2 });
  });
});
