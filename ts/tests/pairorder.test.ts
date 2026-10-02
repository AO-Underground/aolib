import { describe, it, expect } from "bun:test";
import { encode } from "../src/encode";
import { decode } from "../src/decode";
import {
  type MSToServer as MSToServerType,
  MSToServerSchema as MSToServer,
} from "../generated/packets";
import { Side } from "../src/enums";

// Pair order: the optional "^<order>" suffix packed onto paired_charid. The
// default 0 keeps the bare id; 1 emits "^1"; an unpaired -1 is never suffixed.

describe("MS pair order (paired_order ^ suffix)", () => {
  const minimal = {
    character: "Phoenix",
    emote: "normal",
    message: "Take that!",
    side: Side.def,
    char_id: 12,
    paired_charid: 4,
  };

  it("1 packs a ^1 suffix onto paired_charid", () => {
    const w = encode(MSToServer, { ...minimal, paired_order: 1 }, "fanta");
    expect(w.split("#")[17]).toBe("4^1");
    const d = decode(MSToServer, w) as unknown as MSToServerType;
    expect(d.paired_charid).toBe(4);
    expect(d.paired_order).toBe(1);
  });

  it("default 0 keeps the bare id", () => {
    const w = encode(MSToServer, minimal, "fanta");
    expect(w.split("#")[17]).toBe("4");
    const d = decode(MSToServer, w) as unknown as MSToServerType;
    expect(d.paired_charid).toBe(4);
    expect(d.paired_order).toBe(0);
  });

  it("an unpaired -1 is never suffixed", () => {
    const w = encode(
      MSToServer,
      { ...minimal, paired_charid: -1, paired_order: 1 },
      "fanta",
    );
    expect(w.split("#")[17]).toBe("-1");
  });
});
