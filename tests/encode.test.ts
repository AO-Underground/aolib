import { describe, it, expect } from "bun:test";
import { encode } from "../src/encode";
import { packetSchema } from "./util";

// Worked schemas, small enough to read, exercise every feature.

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

const VS_PEERS = packetSchema("VS_PEERS", {
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

// JSON mode

describe("encode: JSON mode", () => {
  it("emits canonical envelope with $header first", () => {
    expect(encode(MC, { name: "track", char_id: 5 }, "json")).toBe(
      '{"$header":"MC","name":"track","char_id":5,"showname":"","effects":0}',
    );
  });

  it("const-typed schema properties appear in the envelope (Ajv fills from default)", () => {
    expect(encode(CC, { char_id: 5 }, "json")).toBe(
      '{"$header":"CC","char_id":5,"_0":0,"_pw":""}',
    );
    expect(encode(PV, { player_id: 3, char_id: 7 }, "json")).toBe(
      '{"$header":"PV","player_id":3,"char_id":7,"_cid":"CID"}',
    );
  });

  it("optional fields with provided values keep them", () => {
    expect(
      encode(
        MC,
        { name: "track", char_id: 5, showname: "Phoenix", effects: 2 },
        "json",
      ),
    ).toBe(
      '{"$header":"MC","name":"track","char_id":5,"showname":"Phoenix","effects":2}',
    );
  });

  it("nested fields become real nested objects in JSON", () => {
    const FOO = packetSchema("FOO", {
      offset: {
        type: "object",
        properties: { x: { type: "number" }, y: { type: "number" } },
        required: ["x", "y"],
        additionalProperties: false,
      },
    });
    expect(encode(FOO, { offset: { x: 5, y: 3 } }, "json")).toBe(
      '{"$header":"FOO","offset":{"x":5,"y":3}}',
    );
  });

  it("array of nested becomes JSON array of objects", () => {
    expect(
      encode(
        VS_PEERS,
        {
          peers: [
            { uid: 1, name: "Alice" },
            { uid: 2, name: "Bob" },
          ],
        },
        "json",
      ),
    ).toBe(
      '{"$header":"VS_PEERS","peers":[{"uid":1,"name":"Alice"},{"uid":2,"name":"Bob"}]}',
    );
  });

  it("empty schema is just `{$header}`", () => {
    expect(encode(DONE, {}, "json")).toBe('{"$header":"DONE"}');
  });

  it("missing required field throws", () => {
    expect(() => encode(MC, { name: "x" }, "json")).toThrow(
      /must have required property 'char_id'/,
    );
  });
});

// Fanta mode

describe("encode: fanta mode", () => {
  it("emits canonical wire `HEADER#a#b#%`", () => {
    expect(encode(MC, { name: "track", char_id: 5 }, "fanta")).toBe(
      "MC#track#5##0#%",
    );
  });

  it("literals are emitted at their wire positions", () => {
    expect(encode(CC, { char_id: 5 }, "fanta")).toBe("CC#0#5##%");
    expect(encode(PV, { player_id: 3, char_id: 7 }, "fanta")).toBe(
      "PV#3#CID#7#%",
    );
  });

  it("optionals with defaults get filled before serialization", () => {
    // showname defaults to "", effects defaults to 0.
    expect(encode(MC, { name: "track", char_id: 5 }, "fanta")).toBe(
      "MC#track#5##0#%",
    );
  });

  it("empty schema is `HEADER#%`", () => {
    expect(encode(DONE, {}, "fanta")).toBe("DONE#%");
  });

  it("array expands to N positional slots, greedy at end of schema", () => {
    expect(encode(SM, { music_list: ["track1", "track2", "track3"] }, "fanta")).toBe(
      "SM#track1#track2#track3#%",
    );
  });

  it("empty array produces zero trailing args", () => {
    expect(encode(SM, { music_list: [] }, "fanta")).toBe("SM#%");
  });

  it("array of nested packs each element with `&` separator", () => {
    expect(
      encode(
        VS_PEERS,
        {
          peers: [
            { uid: 1, name: "Alice" },
            { uid: 2, name: "Bob" },
          ],
        },
        "fanta",
      ),
    ).toBe("VS_PEERS#1&Alice#2&Bob#%");
  });

  it("nested field packs into one positional slot", () => {
    const FOO = packetSchema("FOO", {
      offset: {
        type: "object",
        properties: { x: { type: "number" }, y: { type: "number" } },
        required: ["x", "y"],
        additionalProperties: false,
      },
    });
    expect(encode(FOO, { offset: { x: 5, y: 3 } }, "fanta")).toBe(
      "FOO#5&3#%",
    );
  });

  it("string with chat meta-chars is escaped", () => {
    expect(encode(MC, { name: "100% #1", char_id: 5 }, "fanta")).toBe(
      "MC#100<percent> <num>1#5##0#%",
    );
  });

  it("boolean values become 1 / 0 on the wire", () => {
    const ALERT = packetSchema("ALERT", { silent: { type: "boolean" } });
    expect(encode(ALERT, { silent: true }, "fanta")).toBe("ALERT#1#%");
    expect(encode(ALERT, { silent: false }, "fanta")).toBe("ALERT#0#%");
  });
});

