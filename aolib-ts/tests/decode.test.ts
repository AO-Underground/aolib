import { describe, it, expect } from "bun:test";
import { decode } from "../src/decode";
import { encode } from "../src/encode";
import { packetSchema } from "./util";

// Worked schemas, same as encode.test.ts so round-trip tests work.

const MC = packetSchema("MC", {
  name: { type: "string" },
  char_id: { type: "number" },
  showname: { type: "string", default: "" },
  effects: { type: "number", default: 0 },
});

const CC = packetSchema("CC", {
  _0: { type: "number", const: 0, default: 0 },
  char_id: { type: "number" },
  _pw: { type: "string", const: "", default: "" },
});

const PV = packetSchema("PV", {
  player_id: { type: "number" },
  _cid: { type: "string", const: "CID", default: "CID" },
  char_id: { type: "number" },
});

const DONE = packetSchema("DONE");

const SM = packetSchema("SM", {
  music_list: { type: "array", items: { type: "string" } },
});

const XT = packetSchema("XT", {
  peers: {
    type: "array",
    items: {
      type: "object",
      properties: {
        uid: { type: "number" },
        name: { type: "string" },
      },
      required: ["uid", "name"],
      additionalProperties: false,
    },
  },
});

// Auto-detect

describe("decode: format auto-detect", () => {
  it("`{` prefix routes to JSON path", () => {
    expect(decode(MC, '{"$header":"MC","name":"x","char_id":5}')).toEqual({ $header: "MC",
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("non-`{` prefix routes to fanta path", () => {
    expect(decode(MC, "MC#x#5##0#%")).toEqual({ $header: "MC",
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });
});

// JSON decode

describe("decode: JSON mode", () => {
  it("decodes scalars and fills defaults from cast", () => {
    expect(decode(MC, '{"$header":"MC","name":"x","char_id":5}')).toEqual({ $header: "MC",
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("respects provided optional values", () => {
    expect(
      decode(
        MC,
        '{"$header":"MC","name":"x","char_id":5,"showname":"P","effects":2}',
      ),
    ).toEqual({ $header: "MC", name: "x", char_id: 5, showname: "P", effects: 2 });
  });

  it("literals are stripped from the result", () => {
    const out = decode(CC, '{"$header":"CC","char_id":5}');
    expect(out).toEqual({ $header: "CC", char_id: 5 });
    expect("_0" in out).toBe(false);
    expect("_pw" in out).toBe(false);
  });

  it("nested objects round-trip through JSON path", () => {
    const FOO = packetSchema("FOO", {
      offset: {
        type: "object",
        properties: { x: { type: "number" }, y: { type: "number" } },
        required: ["x", "y"],
        additionalProperties: false,
      },
    });
    expect(decode(FOO, '{"$header":"FOO","offset":{"x":5,"y":3}}')).toEqual({ $header: "FOO",
      offset: { x: 5, y: 3 },
    });
  });

  it("array of nested decodes element-by-element", () => {
    expect(
      decode(
        XT,
        '{"$header":"XT","peers":[{"uid":1,"name":"Alice"},{"uid":2,"name":"Bob"}]}',
      ),
    ).toEqual({ $header: "XT",
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    });
  });

  it("type mismatch throws with field path", () => {
    expect(() =>
      decode(MC, '{"$header":"MC","name":"x","char_id":"not-a-number"}'),
    ).toThrow(/char_id must be number/);
  });

  it("missing required field throws", () => {
    expect(() => decode(MC, '{"$header":"MC","name":"x"}')).toThrow(
      /must have required property 'char_id'/,
    );
  });

  it("header mismatch throws", () => {
    expect(() =>
      decode(MC, '{"$header":"BB","message":"hi"}'),
    ).toThrow(/Wire header mismatch: expected 'MC', got 'BB'/);
  });

  it("malformed JSON throws with a helpful prefix", () => {
    expect(() => decode(MC, "{not really json}")).toThrow(/Invalid JSON wire/);
  });

  it("extra keys in the JSON envelope are silently dropped", () => {
    const out = decode(
      MC,
      '{"$header":"MC","name":"x","char_id":5,"extra":"junk"}',
    );
    expect(out).toEqual({ $header: "MC", name: "x", char_id: 5, showname: "", effects: 0 });
    expect("extra" in out).toBe(false);
  });
});

// Fanta decode

describe("decode: fanta mode", () => {
  it("decodes canonical `HEADER#a#b#%`", () => {
    expect(decode(MC, "MC#x#5#showname#0#%")).toEqual({ $header: "MC",
      name: "x",
      char_id: 5,
      showname: "showname",
      effects: 0,
    });
  });

  it("accepts trailing `#` without `%`", () => {
    expect(decode(MC, "MC#x#5##0#")).toEqual({ $header: "MC",
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("accepts no terminator at all", () => {
    expect(decode(MC, "MC#x#5##0")).toEqual({ $header: "MC",
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("literals are consumed but stripped", () => {
    expect(decode(CC, "CC#0#5##%")).toEqual({ $header: "CC", char_id: 5 });
  });

  it("decodes PV's CID literal between scalars", () => {
    expect(decode(PV, "PV#3#CID#7#%")).toEqual({ $header: "PV",
      player_id: 3,
      char_id: 7,
    });
  });

  it("forgiving on non-conforming literal values", () => {
    // Server sent non-zero at CC's literal slot; we ignore it.
    expect(decode(CC, "CC#9#5#anything#%")).toEqual({ $header: "CC", char_id: 5 });
  });

  it("array consumes all remaining slots", () => {
    expect(decode(SM, "SM#a#b#c#%")).toEqual({ $header: "SM",
      music_list: ["a", "b", "c"],
    });
  });

  it("array of nested decodes element-by-element", () => {
    expect(decode(XT, "XT#1&Alice#2&Bob#%")).toEqual({ $header: "XT",
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    });
  });

  it("empty schema decodes to `{}`", () => {
    expect(decode(DONE, "DONE#%")).toEqual({ $header: "DONE",});
  });

  it("strings are unescaped through fromFanta", () => {
    expect(decode(MC, "MC#100<percent> <num>1#5##0#%")).toEqual({ $header: "MC",
      name: "100% #1",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("missing required field on the wire throws", () => {
    expect(() => decode(MC, "MC#%")).toThrow(/must have required property 'name'/);
  });

  it("header mismatch throws", () => {
    expect(() => decode(MC, "BB#anything#%")).toThrow(
      /Wire header mismatch: expected 'MC', got 'BB'/,
    );
  });

  it("invalid number token throws with field name", () => {
    expect(() => decode(MC, "MC#x#abc##0#%")).toThrow(
      /Invalid number for field 'char_id'/,
    );
  });
});

// Round-trip

describe("encode → decode round-trip", () => {
  it("MC round-trips in JSON mode", () => {
    const v = { name: "track", char_id: 5, showname: "Phoenix", effects: 2 };
    expect(decode(MC, encode(MC, v, "json"))).toEqual({ $header: "MC", ...v });
  });

  it("MC round-trips in fanta mode", () => {
    const v = { name: "track", char_id: 5, showname: "Phoenix", effects: 2 };
    expect(decode(MC, encode(MC, v, "fanta"))).toEqual({ $header: "MC", ...v });
  });

  it("CC strips literals consistently in both modes", () => {
    const v = { char_id: 5 };
    expect(decode(CC, encode(CC, v, "json"))).toEqual({ $header: "CC", ...v });
    expect(decode(CC, encode(CC, v, "fanta"))).toEqual({ $header: "CC", ...v });
  });

  it("PV strips CID literal in both modes", () => {
    const v = { player_id: 3, char_id: 7 };
    expect(decode(PV, encode(PV, v, "json"))).toEqual({ $header: "PV", ...v });
    expect(decode(PV, encode(PV, v, "fanta"))).toEqual({ $header: "PV", ...v });
  });

  it("XT (array of nested) round-trips", () => {
    const v = {
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    };
    expect(decode(XT, encode(XT, v, "json"))).toEqual({ $header: "XT", ...v });
    expect(decode(XT, encode(XT, v, "fanta"))).toEqual({ $header: "XT", ...v });
  });

  it("SM (array of scalars) round-trips even when empty", () => {
    const empty: { music_list: string[] } = { music_list: [] };
    expect(decode(SM, encode(SM, empty, "json"))).toEqual({ $header: "SM", ...empty });
    expect(decode(SM, encode(SM, empty, "fanta"))).toEqual({ $header: "SM", ...empty });
  });

  it("DONE (empty schema) round-trips", () => {
    expect(decode(DONE, encode(DONE, {}, "json"))).toEqual({ $header: "DONE",});
    expect(decode(DONE, encode(DONE, {}, "fanta"))).toEqual({ $header: "DONE",});
  });

  it("chat meta-chars survive fanta round-trip", () => {
    const v = { name: "100% sure #1 & $5", char_id: 5 };
    const decoded = decode(MC, encode(MC, v, "fanta"));
    expect(decoded.name).toBe("100% sure #1 & $5");
  });
});
