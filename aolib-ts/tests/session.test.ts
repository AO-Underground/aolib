import { describe, it, expect } from "bun:test";
import {
  server,
  client,
  type SessionConfig,
  type ServerSession,
  type ClientSession,
} from "../src/session";
import { Side } from "../src/enums";

// Tiny config-builder. Each test wires up its own outbound buffer + hooks.

function makeBuf(overrides: Partial<SessionConfig> = {}): {
  out: string[];
  config: SessionConfig;
} {
  const out: string[] = [];
  return {
    out,
    config: {
      send: (wire) => out.push(wire),
      ...overrides,
    },
  };
}

// server(), represents the remote server. Send C2S, receive S2C.

describe("server(): send (C2S)", () => {
  it("send.HI encodes and emits to the transport", () => {
    const { out, config } = makeBuf();
    const s = server(config);
    s.send.HI({ hdid: "device-1" });
    expect(out).toEqual(["HI#device-1#%"]);
  });

  it("send.CC echoes the assigned player_id and trails the legacy password literal", () => {
    const { out, config } = makeBuf();
    server(config).send.CC({ player_id: 3, char_id: 5 });
    expect(out).toEqual(["CC#3#5##%"]);
  });

  it("send.MC fills defaults via cast before encoding", () => {
    const { out, config } = makeBuf();
    server(config).send.MC({ name: "track1", char_id: 5 });
    expect(out).toEqual(["MC#track1#5##0#%"]);
  });

  it("send.<S2C> throws role-aware wrong-direction error", () => {
    const s = server(makeBuf().config);
    const send = s.send as unknown as Record<string, (p: unknown) => void>;
    expect(() => { send.BB!({ message: "x" }); }).toThrow(
      /server-session\.send\.BB.*server -> client/,
    );
    expect(() => { send.PV!({ player_id: 1, char_id: 1 }); }).toThrow(
      /server-session\.send\.PV.*server -> client/,
    );
  });

  it("send.<unknown header> throws a no-schema error", () => {
    const s = server(makeBuf().config);
    const send = s.send as unknown as Record<string, () => void>;
    expect(() => { send.XYZ!(); }).toThrow(/no schema registered for header 'XYZ'/);
  });

  it("send on a closed session throws", () => {
    const { config } = makeBuf();
    const s = server(config);
    s.close();
    expect(() => { s.send.HI({ hdid: "x" }); }).toThrow(/closed session/);
  });
});

describe("server(): on (S2C)", () => {
  it("on.BB dispatches a decoded packet to the registered handler", () => {
    const { config } = makeBuf();
    const s = server(config);
    let received: { $header: string; message: string } | undefined;
    s.on.BB((p) => {
      received = p;
    });
    s.receive("BB#hello#%");
    expect(received).toEqual({ $header: "BB", message: "hello" });
  });

  it("on.PV strips the CID literal from the decoded shape", () => {
    const s = server(makeBuf().config);
    let received: { $header: string; player_id: number; char_id: number } | undefined;
    s.on.PV((p) => {
      received = p;
    });
    s.receive("PV#3#CID#7#%");
    expect(received).toEqual({ $header: "PV", player_id: 3, char_id: 7 });
    expect("_cid" in (received as object)).toBe(false);
  });

  it("on.<C2S> throws role-aware wrong-direction error", () => {
    const s = server(makeBuf().config);
    const on = s.on as unknown as Record<string, (h: () => void) => void>;
    expect(() => { on.HI!(() => {}); }).toThrow(
      /server-session\.on\.HI.*client -> server/,
    );
    expect(() => { on.CC!(() => {}); }).toThrow(
      /server-session\.on\.CC.*client -> server/,
    );
  });

  it("re-registering a handler replaces the prior one", () => {
    const s = server(makeBuf().config);
    const calls: string[] = [];
    s.on.BB(() => calls.push("first"));
    s.on.BB(() => calls.push("second"));
    s.receive("BB#hi#%");
    expect(calls).toEqual(["second"]);
  });
});

// client(), represents a remote client. Send S2C, receive C2S.

describe("client(): send (S2C)", () => {
  it("send.BB encodes and emits", () => {
    const { out, config } = makeBuf();
    client(config).send.BB({ message: "kicked" });
    expect(out).toEqual(["BB#kicked#%"]);
  });

  it("send.ID encodes a multi-field schema", () => {
    const { out, config } = makeBuf();
    client(config).send.ID({
      player_id: 5,
      software: "LemmyAO",
      version: "1.0",
    });
    expect(out).toEqual(["ID#5#LemmyAO#1.0#%"]);
  });

  it("send.<C2S> throws role-aware wrong-direction error", () => {
    const c = client(makeBuf().config);
    const send = c.send as unknown as Record<string, (p: unknown) => void>;
    expect(() => { send.HI!({ hdid: "x" }); }).toThrow(
      /client-session\.send\.HI.*client -> server/,
    );
  });
});

describe("client(): on (C2S)", () => {
  it("on.HI dispatches the typed packet", () => {
    const c = client(makeBuf().config);
    let received: { $header: string; hdid: string } | undefined;
    c.on.HI((p) => {
      received = p;
    });
    c.receive("HI#device-1#%");
    expect(received).toEqual({ $header: "HI", hdid: "device-1" });
  });

  it("on.CC decodes player_id, char_id, and the optional char_password slot", () => {
    const c = client(makeBuf().config);
    let received: { $header: string; player_id: number; char_id: number; char_password?: string } | undefined;
    c.on.CC((p) => {
      received = p;
    });
    c.receive("CC#3#5##%");
    expect(received).toEqual({ $header: "CC", player_id: 3, char_id: 5, char_password: "" });
  });

  it("on.<S2C> throws role-aware wrong-direction error", () => {
    const c = client(makeBuf().config);
    const on = c.on as unknown as Record<string, (h: () => void) => void>;
    expect(() => { on.BB!(() => {}); }).toThrow(
      /client-session\.on\.BB.*server -> client/,
    );
  });
});

// Bidirectional MC: same header, different per-direction shapes.

describe("bidirectional MC", () => {
  it("server.send.MC takes the client-shape; server.on.MC delivers server-shape", () => {
    const { out, config } = makeBuf();
    const s = server(config);

    // Client (us) sends an MC request, has no `channel` / `looping`.
    s.send.MC({ name: "track1", char_id: 5 });
    expect(out).toEqual(["MC#track1#5##0#%"]);

    // Server (them) broadcasts an MC, has `channel` and `looping`.
    let received: unknown;
    s.on.MC((p) => {
      received = p;
    });
    s.receive("MC#track1#5#Phoenix#1#2#3#%");
    expect(received).toMatchObject({
      name: "track1",
      char_id: 5,
      showname: "Phoenix",
      looping: true,
      channel: 2,
      effects: 3,
    });
  });

  it("client.send.MC takes the broadcast shape; client.on.MC delivers the request shape", () => {
    const { out, config } = makeBuf();
    const c = client(config);

    c.send.MC({
      name: "track2",
      char_id: 6,
      showname: "Edgeworth",
      looping: false,
      channel: 1,
      effects: 0,
    });
    expect(out).toEqual(["MC#track2#6#Edgeworth#0#1#0#%"]);

    let received: unknown;
    c.on.MC((p) => {
      received = p;
    });
    c.receive("MC#track3#7##0#%");
    expect(received).toEqual({
      $header: "MC",
      name: "track3",
      char_id: 7,
      showname: "",
      effects: 0,
    });
  });
});

// receive: dispatch + observability hooks

describe("receive: dispatch", () => {
  it("dispatches based on header to the right handler", () => {
    const s = server(makeBuf().config);
    const seen: string[] = [];
    s.on.BB(() => seen.push("BB"));
    s.on.PV(() => seen.push("PV"));
    s.receive("BB#hi#%");
    s.receive("PV#1#CID#2#%");
    s.receive("BB#hi#%");
    expect(seen).toEqual(["BB", "PV", "BB"]);
  });

  it("works on JSON wire frames", () => {
    const s = server(makeBuf().config);
    let received: { $header: string; message: string } | undefined;
    s.on.BB((p) => {
      received = p;
    });
    s.receive('{"$header":"BB","message":"hi"}');
    expect(received).toEqual({ $header: "BB", message: "hi" });
  });

  it("ignores frames after close()", () => {
    const s = server(makeBuf().config);
    const seen: string[] = [];
    s.on.BB(() => seen.push("BB"));
    s.close();
    s.receive("BB#hi#%");
    expect(seen).toEqual([]);
  });
});

describe("receive: hooks", () => {
  it("onMalformedFrame fires on un-parseable JSON", () => {
    const calls: Array<{ err: Error; wire: string }> = [];
    const s = server(makeBuf({
      onMalformedFrame: (err, wire) => calls.push({ err, wire }),
    }).config);
    s.receive("{not really json}");
    expect(calls.length).toBe(1);
    expect(calls[0]!.wire).toBe("{not really json}");
  });

  it("onMalformedFrame fires when JSON envelope has no $header", () => {
    const calls: Error[] = [];
    const s = server(makeBuf({
      onMalformedFrame: (err) => calls.push(err),
    }).config);
    s.receive('{"value":"oops"}');
    expect(calls.length).toBe(1);
    expect(calls[0]!.message).toMatch(/\$header/);
  });

  it("onUnknownHeader fires when no schema is registered for the header", () => {
    const calls: Array<{ header: string; wire: string }> = [];
    const s = server(makeBuf({
      onUnknownHeader: (header, wire) => calls.push({ header, wire }),
    }).config);
    s.receive("XYZ#anything#%");
    expect(calls).toEqual([{ header: "XYZ", wire: "XYZ#anything#%" }]);
  });

  it("onUnknownHeader fires when the wrong-direction packet arrives", () => {
    // server-session receives HI? That's c2s, not in our inbound map.
    const calls: string[] = [];
    const s = server(makeBuf({
      onUnknownHeader: (header) => calls.push(header),
    }).config);
    s.receive("HI#x#%");
    expect(calls).toEqual(["HI"]);
  });

  it("onDecodeError fires when the schema rejects the wire", () => {
    const calls: Array<{ header: string; err: Error }> = [];
    const s = server(makeBuf({
      onDecodeError: (header, err) => calls.push({ header, err }),
    }).config);
    s.on.PV(() => {
      throw new Error("handler should not run");
    });
    // PV requires two numbers but we send "abc" as the second.
    s.receive("PV#1#CID#abc#%");
    expect(calls.length).toBe(1);
    expect(calls[0]!.header).toBe("PV");
    expect(calls[0]!.err.message).toMatch(/Invalid number/);
  });

  it("onUnhandled fires when no handler is registered for a valid header", () => {
    const calls: Array<{ header: string; packet: unknown }> = [];
    const s = server(makeBuf({
      onUnhandled: (header, packet) => calls.push({ header, packet }),
    }).config);
    s.receive("BB#hi#%");
    expect(calls.length).toBe(1);
    expect(calls[0]!.header).toBe("BB");
    expect(calls[0]!.packet).toEqual({ $header: "BB", message: "hi" });
  });

  it("onHandlerError fires when the application handler throws", () => {
    const calls: Array<{ header: string; err: Error }> = [];
    const s = server(makeBuf({
      onHandlerError: (header, err) => calls.push({ header, err }),
    }).config);
    s.on.BB(() => {
      throw new Error("boom");
    });
    s.receive("BB#hi#%");
    expect(calls.length).toBe(1);
    expect(calls[0]!.header).toBe("BB");
    expect(calls[0]!.err.message).toBe("boom");
  });

  it("each hook routes only to its own failure mode, not to the others", () => {
    const log: string[] = [];
    const s = server(makeBuf({
      onMalformedFrame: () => log.push("malformed"),
      onUnknownHeader: () => log.push("unknown"),
      onDecodeError: () => log.push("decode"),
      onUnhandled: () => log.push("unhandled"),
      onHandlerError: () => log.push("handler"),
    }).config);
    s.on.BB(() => {
      throw new Error("nope");
    });

    s.receive("{");                       // malformed
    s.receive("XYZ#%");                   // unknown
    s.receive("PV#1#CID#abc#%");          // decode error
    s.receive("PV#1#CID#2#%");            // unhandled (no handler)
    s.receive("BB#hi#%");                 // handler error

    expect(log).toEqual([
      "malformed",
      "unknown",
      "decode",
      "unhandled",
      "handler",
    ]);
  });
});

// Wire mode (setJsonMode)

describe("setJsonMode: explicit outbound-format switching", () => {
  it("starts in fanta", () => {
    const { out, config } = makeBuf();
    const s = server(config);
    s.send.HI({ hdid: "x" });
    expect(out[0]).toBe("HI#x#%");
  });

  it("setJsonMode(true) flips outbound to JSON envelopes", () => {
    const { out, config } = makeBuf();
    const s = server(config);
    s.setJsonMode(true);
    s.send.HI({ hdid: "x" });
    expect(out[0]).toBe('{"$header":"HI","hdid":"x"}');
  });

  it("setJsonMode(false) flips back to positional fanta", () => {
    const { out, config } = makeBuf();
    const s = server(config);
    s.setJsonMode(true);
    s.setJsonMode(false);
    s.send.HI({ hdid: "x" });
    expect(out[0]).toBe("HI#x#%");
  });

  it("the library does NOT auto-flip on decryptor, it's the app's job", () => {
    // Receiving decryptor("JSON") used to flip outbound mode. That
    // magic is gone: aolib no longer inspects packet bodies for
    // protocol meaning. The application's handler is responsible for
    // calling setJsonMode() in response.
    const { out, config } = makeBuf({ onUnhandled: () => {} });
    const s = server(config);
    s.receive("decryptor#JSON#%");
    s.send.HI({ hdid: "x" });
    expect(out[0]).toBe("HI#x#%");
  });

  it("mode is per-session, two sessions don't share state", () => {
    const a = makeBuf();
    const b = makeBuf();
    const sa = server(a.config);
    const sb = server(b.config);
    sa.setJsonMode(true);
    sa.send.HI({ hdid: "a" });
    sb.send.HI({ hdid: "b" });
    expect(a.out[0]).toBe('{"$header":"HI","hdid":"a"}');
    expect(b.out[0]).toBe("HI#b#%");
  });
});

// Hookless defaults: no hook = default console behavior, no throw.

describe("defaults: missing hooks fall back to console (no throw)", () => {
  // These tests verify the default-console fallback. We silence the
  // console temporarily so test output stays clean.
  const withSilencedConsole = (body: () => void): void => {
    const w = console.warn;
    const e = console.error;
    console.warn = () => {};
    console.error = () => {};
    try {
      body();
    } finally {
      console.warn = w;
      console.error = e;
    }
  };

  it("missing onMalformedFrame doesn't throw", () => {
    withSilencedConsole(() => {
      const s = server(makeBuf().config);
      expect(() => { s.receive("{garbage}"); }).not.toThrow();
    });
  });

  it("missing onHandlerError doesn't throw", () => {
    withSilencedConsole(() => {
      const s = server(makeBuf().config);
      s.on.BB(() => {
        throw new Error("boom");
      });
      expect(() => { s.receive("BB#hi#%"); }).not.toThrow();
    });
  });
});

// End-to-end loopback: real sessions wired together (each side's `send`
// feeds the other's `receive`), one server serving two clients at once,
// one on JSON, one on fanta, each getting proper typed responses in its
// own encoding.

describe("loopback: a JSON client and a fanta client share one server", () => {
  // A fresh server per test: it keeps a room of connected client sessions,
  // answers HI with ID, and fans MS/MC out to every client in the room.
  function makeServer() {
    let nextPlayerId = 0;
    const room: ClientSession[] = [];

    // Wire one client<->server pair: each side's `send` feeds the other's
    // `receive`. Returns the client's session (to drive) and the wire the
    // server sent back to that client (to inspect its encoding).
    function connect(json: boolean): { srv: ServerSession; responses: string[] } {
      const responses: string[] = [];
      const link = { toServer(_: string): void {}, toClient(_: string): void {} };
      const srv = server({
        send: (w) => {
          link.toServer(w);
        },
      });
      const cs = client({
        send: (w) => {
          responses.push(w);
          link.toClient(w);
        },
      });
      link.toServer = (w) => {
        cs.receive(w);
      };
      link.toClient = (w) => {
        srv.receive(w);
      };
      if (json) {
        srv.setJsonMode(true);
        cs.setJsonMode(true);
      }

      room.push(cs);
      cs.on.HI(() => {
        cs.send.ID({
          player_id: nextPlayerId++,
          software: "aolib-test",
          version: "1",
        });
      });
      cs.on.MS((req) => {
        for (const peer of room) {
          peer.send.MS({
            character: req.character,
            emote: req.emote,
            message: req.message,
            side: req.side,
            char_id: req.char_id,
            showname: req.showname,
          });
        }
      });
      cs.on.MC((req) => {
        for (const peer of room) {
          peer.send.MC({ name: req.name, char_id: req.char_id });
        }
      });
      return { srv, responses };
    }

    return { connect };
  }

  it("delivers typed ID + MS responses to each client in its own encoding", () => {
    const { connect } = makeServer();
    const a = connect(true); // JSON on both ends
    const b = connect(false); // fanta (the default)

    let idA:
      | { $header: string; player_id: number; software: string; version: string }
      | undefined;
    let idB: typeof idA;
    const heardA: { character: string; message: string; side: string; char_id: number }[] = [];
    const heardB: typeof heardA = [];
    a.srv.on.ID((p) => {
      idA = p;
    });
    b.srv.on.ID((p) => {
      idB = p;
    });
    a.srv.on.MS((p) => {
      heardA.push(p);
    });
    b.srv.on.MS((p) => {
      heardB.push(p);
    });

    // Both clients join the same server.
    a.srv.send.HI({ hdid: "json-client" });
    b.srv.send.HI({ hdid: "fanta-client" });

    // Proper, fully typed handshake responses, each with its own id.
    expect(idA).toEqual({ $header: "ID", player_id: 0, software: "aolib-test", version: "1" });
    expect(idB).toEqual({ $header: "ID", player_id: 1, software: "aolib-test", version: "1" });

    // The JSON client speaks; the server fans the MS out to both clients.
    a.srv.send.MS({
      character: "Phoenix",
      emote: "point",
      message: "Objection!",
      side: Side.def,
      char_id: 0,
    });

    // Both clients received the typed MSToClient, same content.
    const said = { character: "Phoenix", message: "Objection!", side: Side.def, char_id: 0 };
    expect(heardA).toHaveLength(1);
    expect(heardB).toHaveLength(1);
    expect(heardA[0]).toMatchObject(said);
    expect(heardB[0]).toMatchObject(said);

    // Each connection carried its own wire encoding across both packets.
    expect(a.responses).toHaveLength(2); // ID, MS
    expect(a.responses.every((w) => w.startsWith("{"))).toBe(true); // JSON
    expect(b.responses).toHaveLength(2);
    expect(b.responses[0]?.startsWith("ID#")).toBe(true); // fanta
    expect(b.responses[1]?.startsWith("MS#")).toBe(true);
  });

  it("routes a bidirectional MC broadcast to both clients", () => {
    const { connect } = makeServer();
    const a = connect(true); // JSON
    const b = connect(false); // fanta

    const musicA: { name: string; char_id: number }[] = [];
    const musicB: typeof musicA = [];
    a.srv.on.MC((p) => {
      musicA.push(p);
    });
    b.srv.on.MC((p) => {
      musicB.push(p);
    });

    // (Both clients are in the room from connect(); no handshake needed for MC.)
    // The fanta client changes the music (MC request); the server
    // broadcasts an MC (broadcast shape) to everyone.
    b.srv.send.MC({ name: "cross-examination.mp3", char_id: 1 });

    const track = { name: "cross-examination.mp3", char_id: 1 };
    expect(musicA).toHaveLength(1);
    expect(musicB).toHaveLength(1);
    expect(musicA[0]).toMatchObject(track);
    expect(musicB[0]).toMatchObject(track);

    // The broadcast reached the JSON client as JSON, the fanta client as fanta.
    expect(a.responses.at(-1)?.startsWith("{")).toBe(true);
    expect(b.responses.at(-1)?.startsWith("MC#")).toBe(true);
  });
});
