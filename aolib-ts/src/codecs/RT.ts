/**
 * RT fanta codec: one `animation` in JSON, `name#variant` on the wire.
 * Decoding rules: spec/packets/CODECS.md.
 */

import { registerCodec, escapeFanta, unescapeFanta } from "../fanta";

const TO_WIRE: Record<string, [string, string]> = {
  witness_testimony: ["testimony1", "0"],
  end_animation: ["testimony1", "1"],
  cross_examination: ["testimony2", "0"],
  not_guilty: ["judgeruling", "0"],
  guilty: ["judgeruling", "1"],
};

function variantOf(token: string | undefined): number {
  return token !== undefined && /^[+-]?\d+$/.test(token) ? Number(token) : 0;
}

registerCodec("RT", {
  encodeFanta(packet) {
    if (packet.animation === "custom") return [escapeFanta(typeof packet.name === "string" ? packet.name : "")];
    const wire = TO_WIRE[String(packet.animation)];
    if (!wire) throw new Error(`RT: unknown animation ${JSON.stringify(packet.animation)}`);
    return [...wire];
  },

  decodeFanta(args) {
    const name = args[0] ?? "";
    const variant = variantOf(args[1]);
    switch (name) {
      case "":
        throw new Error("RT: empty animation slot");
      case "testimony1":
        return { animation: variant === 1 ? "end_animation" : "witness_testimony" };
      case "testimony2":
        return { animation: "cross_examination" };
      case "judgeruling":
        if (variant === 0) return { animation: "not_guilty" };
        if (variant === 1) return { animation: "guilty" };
        throw new Error(`RT: unknown judgeruling variant ${JSON.stringify(args[1])}`);
      default:
        return { animation: "custom", name: unescapeFanta(name) };
    }
  },
});
