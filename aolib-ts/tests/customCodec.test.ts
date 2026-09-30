/**
 * A caller-defined custom codec exercising the both-formats rule and fanta
 * escaping: the same object round-trips over FantaCode and JSON through a
 * session, and onCustom receives it regardless of wire mode.
 */

import { describe, it, expect } from "bun:test";
import { server } from "../src/session";
import { registerCodec, escapeFanta, unescapeFanta } from "../src/wire";

// TT#{type}#{title}#%
registerCodec("TT", {
  encodeFanta: (p) => {
    const t = p as { type?: string; title?: string };
    return [escapeFanta(t.type ?? ""), escapeFanta(t.title ?? "")];
  },
  decodeFanta: (args) => ({
    $header: "TT",
    type: unescapeFanta(args[0] ?? ""),
    title: unescapeFanta(args[1] ?? ""),
  }),
  encodeJson: (p) => JSON.stringify(p),
  decodeJson: (raw) => JSON.parse(raw) as Record<string, unknown>,
});

describe("custom codec over both wires", () => {
  for (const jsonMode of [false, true]) {
    it(`round-trips TT in ${jsonMode ? "json" : "fanta"} mode`, () => {
      const wires: string[] = [];
      const s = server({ send: (w) => wires.push(w) });
      s.setJsonMode(jsonMode);

      let got: Record<string, unknown> | undefined;
      s.onCustom("TT", (p) => { got = p; });

      s.sendCustom({ $header: "TT", type: "0", title: "Cross Examination" });
      expect(wires).toHaveLength(1);
      if (!jsonMode) {
        expect(wires[0]).toBe("TT#0#Cross Examination#%");
      }

      s.receive(wires[0]!);
      expect(got).toBeDefined();
      expect(got!.type).toBe("0");
      expect(got!.title).toBe("Cross Examination");
      expect(got!.$header).toBe("TT");
    });
  }

  it("escapes metacharacters on the fanta wire", () => {
    const wires: string[] = [];
    const s = server({ send: (w) => wires.push(w) });
    s.sendCustom({ $header: "TT", type: "1", title: "a#b" });
    expect(wires[0]).toBe("TT#1#a<num>b#%");
  });
});
