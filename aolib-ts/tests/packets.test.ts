/**
 * Cross-packet smoke tests. The schema-level encode/decode/cast tests
 * already cover the wire-format primitives exhaustively; what this
 * file proves is that every registered schema is well-formed enough
 * to:
 *
 *   - round-trip a representative packet on both wire formats
 *   - be reachable via session.send.X / session.on.X for the right
 *     direction
 *
 * Plus a registry snapshot so additions / removals are visible in
 * diffs.
 */

import { describe, it, expect } from "bun:test";
import { encode } from "../src/encode";
import { decode } from "../src/decode";
import { c2sSchemas, s2cSchemas } from "../generated/packets";
import { server, client } from "../src/session";

// Registry snapshot, catches accidental removals on PR diffs.

describe("registry shape", () => {
  it("c2sSchemas covers the expected headers", () => {
    expect(Object.keys(c2sSchemas).sort()).toEqual(
      [
        "CC", "CH", "CT", "DE", "EE", "HI", "HP",
        "ID", "MA", "MC", "MS", "PE", "RC", "RD", "RM", "RT", "ZZ", "askchaa",
      ].sort(),
    );
  });

  it("s2cSchemas covers the expected headers", () => {
    expect(Object.keys(s2cSchemas).sort()).toEqual(
      [
        "ARUP", "ASS", "AUTH", "BB", "BD", "BN", "CHECK", "CI", "CT",
        "CharsCheck", "DONE", "EI", "EM", "FA", "FL", "FM", "HP",
        "ID", "JD", "KB", "KK", "LE", "MC", "MS", "PN", "PR", "PU",
        "PV", "RMC", "RT", "SC", "SI", "SM", "SP", "TI",
        "ZZ", "decryptor",
      ].sort(),
    );
  });

  it("every schema's $header matches its registry key", () => {
    // Bidirectional packets (MC, CT, HP, RT, ZZ) intentionally
    // share a header across the two maps but may have different
    // shapes; what we verify here is just that the schema's own
    // $header field matches the key it was registered under.
    for (const [key, schema] of Object.entries(c2sSchemas)) {
      expect((schema.properties as { $header: { const: string } }).$header.const).toBe(key);
    }
    for (const [key, schema] of Object.entries(s2cSchemas)) {
      expect((schema.properties as { $header: { const: string } }).$header.const).toBe(key);
    }
  });
});

// Round-trips for the new shapes (one representative per shape kind).

describe("round-trips: scalar-only packets", () => {
  it("HP", () => {
    const p = { bar: "defense", value: 8 };
    expect(decode(c2sSchemas.HP, encode(c2sSchemas.HP, p, "fanta"))).toEqual({ $header: "HP", ...p });
    expect(decode(c2sSchemas.HP, encode(c2sSchemas.HP, p, "json"))).toEqual({ $header: "HP", ...p });
  });

  it("MA (mod action)", () => {
    const p = { player_id: 1, duration_minutes: 60, reason: "spam" };
    expect(decode(c2sSchemas.MA, encode(c2sSchemas.MA, p, "fanta"))).toEqual({ $header: "MA", ...p });
    expect(decode(c2sSchemas.MA, encode(c2sSchemas.MA, p, "json"))).toEqual({ $header: "MA", ...p });
  });

  it("TI", () => {
    const p = { timer_id: 1, command: "show", time: 60_000 };
    expect(decode(s2cSchemas.TI, encode(s2cSchemas.TI, p, "fanta"))).toEqual({ $header: "TI", ...p });
    expect(decode(s2cSchemas.TI, encode(s2cSchemas.TI, p, "json"))).toEqual({ $header: "TI", ...p });
  });
});

describe("round-trips: optional-with-default packets", () => {
  it("BN fills empty position when absent", () => {
    const out = decode(s2cSchemas.BN, encode(s2cSchemas.BN, { background: "court" }, "fanta"));
    expect(out).toEqual({ $header: "BN", background: "court", position: "" });
  });

  it("RT decodes lenient wire forms", () => {
    const cases: [string, string, string][] = [
      ["RT#testimony1#%", "witness_testimony", ""],
      ["RT#testimony1#5#%", "witness_testimony", ""],
      ["RT#testimony1#x#%", "witness_testimony", ""],
      ["RT#testimony2#%", "cross_examination", ""],
      ["RT#judgeruling#%", "not_guilty", ""],
      ["RT#knock#3#%", "custom", "knock"],
      ["RT#a<and>b#%", "custom", "a&b"],
    ];
    for (const [wire, animation, name] of cases) {
      expect(decode(c2sSchemas.RT, wire)).toEqual({ $header: "RT", animation, name });
    }
  });

  it("RT rejects invalid wire forms", () => {
    for (const wire of ["RT#judgeruling#2#%", "RT##%", "RT#%"]) {
      expect(() => decode(c2sSchemas.RT, wire)).toThrow();
    }
  });

  it("RT rejects custom without a name and a name on a fixed animation", () => {
    expect(() => encode(c2sSchemas.RT, { animation: "custom" }, "fanta")).toThrow();
    expect(() => encode(c2sSchemas.RT, { animation: "guilty", name: "x" }, "fanta")).toThrow();
  });

  it("MC effects bitfield ignores unknown bits and rejects non-integers", () => {
    expect(decode(c2sSchemas.MC, "MC#x#1##9#%")).toMatchObject({
      effects: { fade_in: true, fade_out: false, sync_position: false },
    });
    expect(() => decode(c2sSchemas.MC, "MC#x#1##abc#%")).toThrow();
  });

  it("ZZ fills target=-1 when absent", () => {
    const out = decode(c2sSchemas.ZZ, encode(c2sSchemas.ZZ, { reason: "racism" }, "fanta"));
    expect(out).toEqual({ $header: "ZZ", reason: "racism", target: -1 });
  });

  it("PN preserves all fields when provided", () => {
    const p = { player_count: 5, max_players: 100, server_description: "A test server" };
    expect(decode(s2cSchemas.PN, encode(s2cSchemas.PN, p, "fanta"))).toEqual({ $header: "PN", ...p });
  });
});

describe("round-trips: array packets", () => {
  it("FL (array of strings)", () => {
    const p = { features: ["yellowtext", "cccc_ic_support", "flipping"] };
    expect(decode(s2cSchemas.FL, encode(s2cSchemas.FL, p, "fanta"))).toEqual({ $header: "FL", ...p });
    expect(decode(s2cSchemas.FL, encode(s2cSchemas.FL, p, "json"))).toEqual({ $header: "FL", ...p });
  });

  it("FA empty array", () => {
    const p: { areas: string[] } = { areas: [] };
    expect(decode(s2cSchemas.FA, encode(s2cSchemas.FA, p, "fanta"))).toEqual({ $header: "FA", ...p });
  });
});

describe("round-trips: nested packets", () => {
  it("EI (single nested)", () => {
    const p = {
      id: 3,
      details: {
        name: "Pistol",
        description: "The murder weapon",
        type: "weapon",
        image: "pistol.png",
      },
    };
    expect(decode(s2cSchemas.EI, encode(s2cSchemas.EI, p, "fanta"))).toEqual({ $header: "EI", ...p });
    expect(decode(s2cSchemas.EI, encode(s2cSchemas.EI, p, "json"))).toEqual({ $header: "EI", ...p });
  });

  it("LE (array of nested)", () => {
    const p = {
      evidence: [
        { name: "Pistol", description: "weapon", image: "pistol.png" },
        { name: "Letter", description: "evidence", image: "letter.png" },
      ],
    };
    expect(decode(s2cSchemas.LE, encode(s2cSchemas.LE, p, "fanta"))).toEqual({ $header: "LE", ...p });
    expect(decode(s2cSchemas.LE, encode(s2cSchemas.LE, p, "json"))).toEqual({ $header: "LE", ...p });
  });

  it("CI (incremental char info with (idx, data) pairs)", () => {
    const p = {
      batchIndex: 0,
      entries: [
        { index: 0, data: "Phoenix" },
        { index: 1, data: "Edgeworth" },
      ],
    };
    expect(decode(s2cSchemas.CI, encode(s2cSchemas.CI, p, "fanta"))).toEqual({ $header: "CI", ...p });
    expect(decode(s2cSchemas.CI, encode(s2cSchemas.CI, p, "json"))).toEqual({ $header: "CI", ...p });
  });
});

describe("round-trips: empty packets", () => {
  it("askchaa (c2s empty)", () => {
    expect(decode(c2sSchemas.askchaa, encode(c2sSchemas.askchaa, {}, "fanta"))).toEqual({ $header: "askchaa",});
    expect(decode(c2sSchemas.askchaa, encode(c2sSchemas.askchaa, {}, "json"))).toEqual({ $header: "askchaa",});
  });

  it("CHECK (s2c empty)", () => {
    expect(decode(s2cSchemas.CHECK, encode(s2cSchemas.CHECK, {}, "fanta"))).toEqual({ $header: "CHECK",});
  });
});

// Session-level: every direction is callable.

describe("session integration: new packets are reachable", () => {
  it("server.send.<C2S> works for the new c2s packets", () => {
    const out: string[] = [];
    const s = server({ send: (w) => out.push(w) });
    s.send.RC({});
    s.send.MA({ player_id: 1, duration_minutes: 60, reason: "spam" });
    expect(out).toEqual([
      "RC#%",
      "MA#1#60#spam#%",
    ]);
  });

  it("server.on.<S2C> dispatches for the new s2c packets", () => {
    const s = server({ send: () => {} });
    const seen: Record<string, unknown> = {};
    s.on.BN((p) => { seen.BN = p; });
    s.on.SI((p) => { seen.SI = p; });
    s.on.FL((p) => { seen.FL = p; });
    s.receive("BN#court##%");
    s.receive("SI#10#5#20#%");
    s.receive("FL#a#b#%");
    expect(seen.BN).toEqual({ $header: "BN", background: "court", position: "" });
    expect(seen.SI).toEqual({ $header: "SI", char_count: 10, evi_count: 5, mus_count: 20 });
    expect(seen.FL).toEqual({ $header: "FL", features: ["a", "b"] });
  });

  it("client.send.<S2C> works for the new s2c packets", () => {
    const out: string[] = [];
    const c = client({ send: (w) => out.push(w) });
    c.send.BN({ background: "court", position: "wit" });
    c.send.FL({ features: ["a", "b"] });
    expect(out).toEqual([
      "BN#court#wit#%",
      "FL#a#b#%",
    ]);
  });
});

// Bidirectional packets: same header, different shapes.

describe("bidirectional packets", () => {
  it("CT: c2s has no is_from_server, s2c does", () => {
    const out: string[] = [];
    const c = client({ send: (w) => out.push(w) });
    c.send.CT({ name: "Server", message: "hi", is_from_server: true });
    expect(out).toEqual(["CT#Server#hi#1#%"]);

    const s = server({ send: () => {} });
    let received: unknown;
    s.on.CT((p) => { received = p; });
    s.receive("CT#Server#hi#1#%");
    expect(received).toEqual({ $header: "CT", name: "Server", message: "hi", is_from_server: true });

    // The c2s shape has no is_from_server field at all
    out.length = 0;
    const c2 = server({ send: (w) => out.push(w) });
    c2.send.CT({ name: "Phoenix", message: "objection" });
    expect(out).toEqual(["CT#Phoenix#objection#%"]);
  });

  it("HP: symmetric, same schema works in both directions", () => {
    const fromS: string[] = [];
    const fromC: string[] = [];
    server({ send: (w) => fromS.push(w) }).send.HP({ bar: "defense", value: 8 });
    client({ send: (w) => fromC.push(w) }).send.HP({ bar: "prosecution", value: 5 });
    expect(fromS).toEqual(["HP#1#8#%"]);
    expect(fromC).toEqual(["HP#2#5#%"]);
  });
});

// Chat-meta escaping survives through the registry.

describe("chat-meta escaping is applied uniformly", () => {
  it("BB reason with # and & round-trips on fanta", () => {
    const p = { message: "Don't use #1 & $5 in chat" };
    const out = decode(s2cSchemas.BB, encode(s2cSchemas.BB, p, "fanta"));
    expect(out).toEqual({ $header: "BB", ...p });
  });

  it("CT message with chat-meta survives on fanta", () => {
    const p = { name: "Phoenix", message: "100% sure & #1!" };
    const out = decode(c2sSchemas.CT, encode(c2sSchemas.CT, p, "fanta"));
    expect(out).toEqual({ $header: "CT", ...p });
  });
});
