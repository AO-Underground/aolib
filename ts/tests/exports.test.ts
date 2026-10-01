import { describe, it, expect } from "bun:test";
import * as aolib from "../src/index";

// The public entry point must re-export the enums and shared types that
// packet fields are typed as (e.g. MSToClient.side: Side); otherwise a
// consumer cannot construct or narrow packets. Guards a past regression
// where these were reachable internally but not from the package root.

describe("public API: enum + type exports", () => {
  it("re-exports every enum and its members are the string values", () => {
    // Widen to string via the annotation (members type as their enum, so
    // a direct toBe("...") mistypes).
    const members: Record<string, string> = {
      side: aolib.Side.wit,
      emote: aolib.EmoteModifier.zoom,
      desk: aolib.DeskModifier.shown,
      shout: aolib.ShoutModifier.objection,
      flip: aolib.Flip.horizontal,
      color: aolib.TextColor.red,
      area: aolib.AreaUpdateType.status,
    };
    expect(members).toEqual({
      side: "wit",
      emote: "zoom",
      desk: "shown",
      shout: "objection",
      flip: "horizontal",
      color: "red",
      area: "status",
    });
  });

  it("re-exports the helpers and runtime surface", () => {
    expect(aolib.isFullView(aolib.Side.wit)).toBe(true);
    expect(aolib.isFullView(aolib.Side.jud)).toBe(false);
    expect(typeof aolib.parseCharIni).toBe("function");
    expect(typeof aolib.server).toBe("function");
    expect(typeof aolib.client).toBe("function");
  });

  it("types a packet through aolib.packets (compile-time only)", () => {
    // Packet types live under `aolib.packets`; this just has to typecheck.
    const p: aolib.packets.MSToClient = {
      character: "P", emote: "n", message: "hi", side: aolib.Side.def, char_id: 0,
    } as aolib.packets.MSToClient;
    expect(p.side).toBe("def");
  });
});

describe("public API: every generated enum is exported", () => {
  it("re-exports the enums added after the original list", () => {
    expect([aolib.TimerCommand.show, aolib.RTAnimation.guilty, aolib.MusicChannel.ambience, aolib.PenaltyBar.prosecution]).toEqual([
      "show",
      "guilty",
      "ambience",
      "prosecution",
    ]);
  });
});
