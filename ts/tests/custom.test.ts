/**
 * Custom packets: `registerPacket` + `sendCustom` / `onCustom`. Byte-exact
 * schema behaviour is in conformance.test.ts (conformance/custom.json).
 */

import { describe, it, expect } from "bun:test";
import { server, client, type SessionConfig } from "../src/session";
import { registerPacket } from "../src/custom";
import { escapeFanta, unescapeFanta } from "../src/wire";
import type { JsonSchema } from "../src/types";

function makeBuf(overrides: Partial<SessionConfig> = {}): { out: string[]; config: SessionConfig } {
  const out: string[] = [];
  return { out, config: { send: (wire) => out.push(wire), onUnhandled: () => {}, ...overrides } };
}

const pingSchema: JsonSchema = {
  $id: "/packets/schemas/PING.schema.json",
  type: "object",
  properties: {
    seq: { type: "integer" },
    note: { type: "string", default: "" },
  },
  required: ["seq"],
  additionalProperties: false,
};
registerPacket("PING", { schema: pingSchema });

// Wire forms the walker can't produce: FantaCode packs both fields into one slot.
registerPacket("PAIR", {
  schema: { type: "object", properties: { a: { type: "string" }, b: { type: "string" } }, required: ["a", "b"] },
  fanta: {
    encode: (p) => [`${escapeFanta(String(p.a))}|${escapeFanta(String(p.b))}`],
    decode: (args) => {
      const [a = "", b = ""] = (args[0] ?? "").split("|");
      return { a: unescapeFanta(a), b: unescapeFanta(b) };
    },
  },
  json: {
    encode: (p) => JSON.stringify({ pair: [p.a, p.b] }),
    decode: (raw) => {
      const [a, b] = (JSON.parse(raw) as { pair: [string, string] }).pair;
      return { a, b };
    },
  },
});

describe("registerPacket", () => {
  it("rejects spec headers", () => {
    expect(() => {
      registerPacket("MS", { schema: pingSchema });
    }).toThrow(/spec packet.*\$extras/);
  });

  it("rejects a schema whose $header const disagrees", () => {
    const schema: JsonSchema = { type: "object", properties: { $header: { type: "string", const: "OTHER" } } };
    expect(() => {
      registerPacket("NOPE", { schema });
    }).toThrow(/declares \$header "OTHER"/);
  });
});

describe("schema-driven custom packets", () => {
  it("encode in schema order with defaults, in both formats", () => {
    const { out, config } = makeBuf();
    const c = client(config);
    c.sendCustom({ $header: "PING", seq: 7 });
    c.setJsonMode(true);
    c.sendCustom({ $header: "PING", seq: 7, $extras: { trace: "x" } });
    expect(out).toEqual(["PING#7##%", '{"$header":"PING","seq":7,"note":"","trace":"x"}']);
  });

  it("decode in both formats, keeping JSON extras", () => {
    const got: unknown[] = [];
    const s = server(makeBuf().config);
    s.onCustom("PING", (p) => { got.push(p); });
    s.receive("PING#7#hi#%");
    s.receive('{"$header":"PING","seq":8,"trace":"x"}');
    expect(got).toEqual([
      { $header: "PING", seq: 7, note: "hi" },
      { $header: "PING", seq: 8, note: "", $extras: { trace: "x" } },
    ]);
  });

  it("route invalid frames to onDecodeError", () => {
    const errors: string[] = [];
    const s = server(makeBuf({ onDecodeError: (h, e) => errors.push(`${h}: ${e.message}`) }).config);
    s.onCustom("PING", () => {});
    s.receive('{"$header":"PING","seq":"seven"}');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^PING: .*seq/);
  });

  it("reject invalid packets on send", () => {
    const c = client(makeBuf().config);
    expect(() => {
      c.sendCustom({ $header: "PING" });
    }).toThrow(/seq/);
  });
});

describe("schema-less custom packets", () => {
  registerPacket("ROWS");

  it("are JSON-only: the payload's own fields after $header", () => {
    const { out, config } = makeBuf();
    const c = client(config);
    expect(() => {
      c.sendCustom({ $header: "ROWS", rows: [["a"]] });
    }).toThrow(/JSON-only/);
    c.setJsonMode(true);
    c.sendCustom({ $header: "ROWS", rows: [["a", "b"], []], $extras: { t: 1 } });
    expect(out).toEqual(['{"$header":"ROWS","rows":[["a","b"],[]],"t":1}']);
  });

  it("decode JSON as-is and send FantaCode frames to onUnknownHeader", () => {
    const got: unknown[] = [];
    const unknown: string[] = [];
    const s = server(makeBuf({ onUnknownHeader: (h) => unknown.push(h) }).config);
    s.onCustom("ROWS", (p) => { got.push(p); });
    s.receive('{"$header":"ROWS","rows":[["a"]]}');
    s.receive("ROWS#a#%");
    expect(got).toEqual([{ $header: "ROWS", rows: [["a"]] }]);
    expect(unknown).toEqual(["ROWS"]);
  });
});

describe("overrides", () => {
  it("replace the wire form in each format, $header first", () => {
    const { out, config } = makeBuf();
    const c = client(config);
    c.sendCustom({ $header: "PAIR", a: "x#y", b: "z" });
    c.setJsonMode(true);
    c.sendCustom({ $header: "PAIR", a: "x#y", b: "z" });
    expect(out).toEqual(["PAIR#x<num>y|z#%", '{"$header":"PAIR","pair":["x#y","z"]}']);

    const got: unknown[] = [];
    const s = server(makeBuf().config);
    s.onCustom("PAIR", (p) => { got.push(p); });
    for (const w of out) s.receive(w);
    expect(got).toEqual([
      { $header: "PAIR", a: "x#y", b: "z" },
      { $header: "PAIR", a: "x#y", b: "z" },
    ]);
  });

  it("still validate against the schema", () => {
    const c = client(makeBuf().config);
    expect(() => {
      c.sendCustom({ $header: "PAIR", a: "only" });
    }).toThrow(/b/);
  });
});

describe("sendCustom / onCustom", () => {
  it("throws for an unregistered header, or on a closed session", () => {
    const c = client(makeBuf().config);
    expect(() => {
      c.sendCustom({ $header: "NOPE" });
    }).toThrow(/registerPacket/);
    c.close();
    expect(() => {
      c.sendCustom({ $header: "PING", seq: 1 });
    }).toThrow(/closed/);
  });

  it("sends unregistered headers to onUnknownHeader", () => {
    const unknown: string[] = [];
    const s = server(makeBuf({ onUnknownHeader: (h) => unknown.push(h) }).config);
    s.onCustom("NOPE", () => {});
    s.receive("NOPE#1#%");
    expect(unknown).toEqual(["NOPE"]);
  });

  it("routes a registered packet with no handler to onUnhandled", () => {
    const unhandled: string[] = [];
    const s = server(makeBuf({ onUnhandled: (h) => { unhandled.push(h); } }).config);
    s.receive("PING#1#%");
    expect(unhandled).toEqual(["PING"]);
  });

  it("routes a throwing handler to onHandlerError", () => {
    const errors: string[] = [];
    const s = server(makeBuf({ onHandlerError: (h) => errors.push(h) }).config);
    s.onCustom("PING", () => {
      throw new Error("boom");
    });
    s.receive("PING#1#%");
    expect(errors).toEqual(["PING"]);
  });

  it("onCustom rejects spec headers", () => {
    const s = server(makeBuf().config);
    expect(() => {
      s.onCustom("BB", () => {});
    }).toThrow(/spec packet.*on\.BB/);
  });

  it("exposes the outbound mode", () => {
    const c = client(makeBuf().config);
    expect(c.jsonMode).toBe(false);
    c.setJsonMode(true);
    expect(c.jsonMode).toBe(true);
  });
});
