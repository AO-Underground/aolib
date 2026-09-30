/**
 * The raw JSON escape hatch: `sendCustom` / `onCustom`.
 *
 * Covers the promise made to consumers, define a type that extends a
 * generated packet (or the `Packet` base), populate it, send it, and
 * receive it typed on the other end, all bypassing the schema layer.
 */

import { describe, it, expect } from "bun:test";
import { server, client, type SessionConfig } from "../src/session";
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

describe("sendCustom", () => {
  it("sends a typed inherited-packet variable as JSON verbatim", () => {
    const { out, config } = makeBuf();
    const s = server(config);

    const msg: BBExt = { $header: "BB", message: "evacuate", urgent: true };
    s.sendCustom(msg);

    expect(out).toHaveLength(1);
    expect(JSON.parse(out[0]!)).toEqual({
      $header: "BB",
      message: "evacuate",
      urgent: true,
    });
  });

  it("accepts an inline literal with extra fields", () => {
    const { out, config } = makeBuf();
    server(config).sendCustom({ $header: "PING", seq: 7, note: "hi" });
    expect(JSON.parse(out[0]!)).toEqual({ $header: "PING", seq: 7, note: "hi" });
  });

  it("always emits JSON even while the session is in fanta mode", () => {
    const { out, config } = makeBuf();
    const s = server(config);
    // default mode is fanta; sendCustom must ignore it.
    s.sendCustom({ $header: "PING", seq: 1 });
    expect(out[0]!.startsWith("{")).toBe(true);
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
  it("dispatches an inbound JSON frame with extra fields preserved, typed", () => {
    const { config } = makeBuf();
    const s = server(config);

    let got: BBExt | undefined;
    s.onCustom<BBExt>("BB", (p) => { got = p; });
    s.receive(JSON.stringify({ $header: "BB", message: "evacuate", urgent: true }));

    expect(got).toEqual({ $header: "BB", message: "evacuate", urgent: true });
  });

  it("fires for a header no schema models", () => {
    const { config } = makeBuf();
    const s = server(config);

    let seq = 0;
    s.onCustom<Ping>("PING", (p) => { seq = p.seq; });
    s.receive(JSON.stringify({ $header: "PING", seq: 42 }));
    expect(seq).toBe(42);
  });

  it("does not fire for a fanta frame of the same header", () => {
    const unhandled: string[] = [];
    const { config } = makeBuf({ onUnhandled: (h) => unhandled.push(h) });
    const s = server(config);

    let fired = false;
    s.onCustom("BB", () => { fired = true; });
    s.receive("BB#hello#%"); // fanta, routes to the typed path

    expect(fired).toBe(false);
    expect(unhandled).toEqual(["BB"]);
  });

  it("wins over a would-be typed handler for JSON frames", () => {
    // Registering on.BB after onCustom('BB') is a collision (below); here we
    // only register onCustom and confirm the JSON frame reaches it, not the
    // typed decode + onUnhandled path.
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
  it("client.sendCustom reaches server.onCustom, extras intact", () => {
    // Wire a client session's output straight into a server session's input.
    const srv = server({ send: () => {} });
    const cli = client({ send: (wire) => { srv.receive(wire); } });

    let got: BBExt | undefined;
    srv.onCustom<BBExt>("BB", (p) => { got = p; });

    const msg: BBExt = { $header: "BB", message: "sync", urgent: false };
    cli.sendCustom(msg);

    expect(got).toEqual({ $header: "BB", message: "sync", urgent: false });
  });
});
