/**
 * The `aolib-ts/wire` subpath: the buried-but-reachable low-level surface.
 * Guards that the barrel re-exports resolve and actually work.
 */

import { describe, it, expect } from "bun:test";
import * as wire from "../src/wire";

describe("aolib-ts/wire subpath", () => {
  it("exposes the wire primitive functions", () => {
    const w = wire as unknown as Record<string, unknown>;
    for (const fn of [
      "encode",
      "decode",
      "readHeader",
      "validate",
      "toFantaArgs",
      "fromFantaArgs",
      "escapeFanta",
      "unescapeFanta",
      "registerCodec",
    ]) {
      expect(typeof w[fn]).toBe("function");
    }
  });

  it("exposes the header->schema registries and encodes/decodes through them", () => {
    expect(typeof wire.c2sSchemas.HI).toBe("object");
    const frame = wire.encode(wire.c2sSchemas.HI, { hdid: "abc" }, "fanta");
    expect(frame).toBe("HI#abc#%");
    expect(wire.decode(wire.c2sSchemas.HI, frame)).toEqual({ $header: "HI", hdid: "abc" });
    expect(wire.readHeader(frame)).toBe("HI");
  });
});
