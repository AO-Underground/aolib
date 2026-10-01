/**
 * The custom-packet escape hatch: `registerCodec` + `sendCustom` / `onCustom`.
 *
 * A custom packet is handled by a registered codec (the same mechanism ARUP
 * uses, hot-definable by callers). The codec owns both wire forms, so the same
 * typed value round-trips over FantaCode and JSON, and `onCustom` receives the
 * codec's decoded value regardless of wire mode.
 */

import { describe, it, expect } from "bun:test";
import { server, client, type SessionConfig } from "../src/session";
import { registerCodec, escapeFanta, unescapeFanta } from "../src/wire";
import type { Packet, BB } from "../generated/packets";

function makeBuf(overrides: Partial<SessionConfig> = {}): {
  out: string[];
  config: SessionConfig;
} {
  const out: string[] = [];
  return {
    out,
    config: { send: (wire) => out.push(wire), ...overrides },
  };
}

// An inherited packet type: BB plus an extra field the schema doesn't model.
interface BBExt extends BB {
  urgent: boolean;
}

// A from-scratch custom packet, extending only the Packet base.
interface Ping extends Packet {
  $header: "PING";
  seq: number;
}

// Codecs for the headers these tests exercise. A custom codec owns both wire
// forms; for JSON the object round-trips through stringify/parse, and the
// FantaCode form is defined explicitly.
registerCodec("BB", {
  encodeFanta: (p) => [escapeFanta((p as { message?: string }).message ?? "")],
  decodeFanta: (args) => ({ $header: "BB", message: unescapeFanta(args[0] ?? "") }),
  encodeJson: (p) => JSON.stringify(p),
  decodeJson: (raw) => JSON.parse(raw) as Record<string, unknown>,
});
registerCodec("PING", {
  encodeFanta: (p) => [String((p as { seq?: number }).seq ?? 0)],
  decodeFanta: (args) => ({ $header: "PING", seq: Number(args[0] ?? 0) }),
  encodeJson: (p) => JSON.stringify(p),
  decodeJson: (raw) => JSON.parse(raw) as Record<string, unknown>,
});

describe("sendCustom", () => {
  it("encodes through the codec's JSON form in JSON mode", () => {
    const { out, config } = makeBuf();
    const s = server(config);
    s.setJsonMode(true);

    const msg: BBExt = { $header: "BB", message: "evacuate", urgent: true };
    s.sendCustom(msg);

    expect(out).toHaveLength(1);
    expect(JSON.parse(out[0]!)).toEqual({
      $header: "BB",
      message: "evacuate",
      urgent: true,
    });
  });

  it("encodes through the codec's FantaCode form in fanta mode", () => {
    const { out, config } = makeBuf();
    const s = server(config); // default mode is fanta
    s.sendCustom({ $header: "PING", seq: 7 });
    expect(out[0]).toBe("PING#7#%");
  });

  it("throws when no codec is registered for the header", () => {
    const { config } = makeBuf();
    const s = server(config);
    expect(() => { s.sendCustom({ $header: "NOPE", x: 1 }); }).toThrow(
      /needs a codec/,
    );
  });

  it("throws on a closed session", () => {
    const s = server(makeBuf().config);
    s.close();
    expect(() => { s.sendCustom({ $header: "PING", seq: 1 }); }).toThrow(
      /closed session/,
    );
  });

  it("throws when $header is missing or empty at runtime", () => {
    const s = server(makeBuf().config);
    const raw = s.sendCustom as unknown as (p: unknown) => void;
    expect(() => { raw({ seq: 1 }); }).toThrow(/non-empty string \$header/);
    expect(() => { raw({ $header: "" }); }).toThrow(/non-empty string \$header/);
  });
});

describe("onCustom", () => {
  it("decodes an inbound JSON frame through the codec, extras preserved", () => {
    const { config } = makeBuf();
    const s = server(config);

    let got: BBExt | undefined;
    s.onCustom<BBExt>("BB", (p) => { got = p; });
    s.receive(JSON.stringify({ $header: "BB", message: "evacuate", urgent: true }));

    expect(got).toEqual({ $header: "BB", message: "evacuate", urgent: true });
  });

  it("decodes an inbound fanta frame through the codec", () => {
    const { config } = makeBuf();
    const s = server(config);

    let seq = 0;
    s.onCustom<Ping>("PING", (p) => { seq = p.seq; });
    s.receive("PING#42#%");
    expect(seq).toBe(42);
  });

  it("does not fire for a header with no registered codec", () => {
    const unknown: string[] = [];
    const { config } = makeBuf({ onUnknownHeader: (h) => unknown.push(h) });
    const s = server(config);

    let fired = false;
    s.onCustom("NOPE", () => { fired = true; });
    s.receive("NOPE#hello#%");

    expect(fired).toBe(false);
    expect(unknown).toEqual(["NOPE"]);
  });

  it("wins over the typed path for a header it overrides", () => {
    const unhandled: string[] = [];
    const { config } = makeBuf({ onUnhandled: (h) => unhandled.push(h) });
    const s = server(config);

    let hit = false;
    s.onCustom("BB", () => { hit = true; });
    s.receive(JSON.stringify({ $header: "BB", message: "x" }));

    expect(hit).toBe(true);
    expect(unhandled).toEqual([]);
  });

  it("routes malformed JSON to onMalformedFrame (caught before dispatch)", () => {
    const errs: string[] = [];
    const { config } = makeBuf({ onMalformedFrame: (e) => errs.push(e.message) });
    const s = server(config);
    s.onCustom("BB", () => {});
    s.receive('{"$header":"BB", bad');
    expect(errs).toHaveLength(1);
  });

  it("routes a throwing handler to onHandlerError", () => {
    const errs: Error[] = [];
    const { config } = makeBuf({ onHandlerError: (_h, e) => errs.push(e) });
    const s = server(config);
    s.onCustom("BB", () => { throw new Error("boom"); });
    s.receive(JSON.stringify({ $header: "BB", message: "x" }));
    expect(errs).toHaveLength(1);
    expect(errs[0]!.message).toBe("boom");
  });
});

describe("on / onCustom collision", () => {
  it("throws when on.<X> is registered after onCustom('X')", () => {
    const s = server(makeBuf().config);
    s.onCustom("BB", () => {});
    expect(() => { s.on.BB(() => {}); }).toThrow(/onCustom\('BB'\)/);
  });

  it("throws when onCustom('X') is registered after on.<X>", () => {
    const s = server(makeBuf().config);
    s.on.BB(() => {});
    expect(() => { s.onCustom("BB", () => {}); }).toThrow(/onCustom\('BB'\)/);
  });
});

describe("custom channel loopback", () => {
  it("client.sendCustom reaches server.onCustom over both wires", () => {
    for (const jsonMode of [false, true]) {
      const srv = server({ send: () => {} });
      const cli = client({ send: (wire) => { srv.receive(wire); } });
      cli.setJsonMode(jsonMode);

      let got: Ping | undefined;
      srv.onCustom<Ping>("PING", (p) => { got = p; });
      cli.sendCustom({ $header: "PING", seq: 9 });

      expect(got?.seq).toBe(9);
    }
  });
});
