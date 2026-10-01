/**
 * ARUP fanta codec.
 *
 * ARUP's `update_data` element type depends on the sibling
 * `update_type` field (player_count = number[], the rest string[]). The
 * generic JSON-Schema walker has no way to express that, so ARUP
 * registers a bespoke codec and the walker hands it the raw args.
 *
 * `update_type` is an `AreaUpdateType`: the packet carries the string
 * value (JSON envelope too), but the wire carries the legacy integer
 * from the enum's `x-wire-ints`. This codec maps between the two.
 *
 * Wire shape: `ARUP#<update_type_int>#<area_0>#<area_1>#…#%`.
 */

import { registerCodec, escapeFanta, unescapeFanta } from "../fanta";
import { AreaUpdateTypeEnumSchema as AreaUpdateTypeSchema } from "../../generated/schemas";

const VALUES = AreaUpdateTypeSchema.enum;
const WIRE_INTS = AreaUpdateTypeSchema["x-wire-ints"];
const PLAYER_COUNT_INT = WIRE_INTS[VALUES.indexOf("player_count")] ?? 0;

function toWireInt(value: unknown): number {
  const wire = WIRE_INTS[VALUES.indexOf(String(value))];
  if (wire === undefined) throw new Error(`ARUP: unknown update_type ${JSON.stringify(value)}`);
  return wire;
}

function fromWireInt(token: string): string {
  const value = VALUES[WIRE_INTS.indexOf(Number(token))];
  if (value === undefined) throw new Error(`ARUP: unknown update_type wire value ${JSON.stringify(token)}`);
  return value;
}

registerCodec("ARUP", {
  encodeFanta(packet) {
    const wireInt = toWireInt(packet.update_type);
    const data = (packet.update_data as unknown[] | undefined) ?? [];
    const slots = wireInt === PLAYER_COUNT_INT
      ? data.map((v) => String(v))
      : data.map((v) => escapeFanta(String(v)));
    return [String(wireInt), ...slots];
  },

  decodeFanta(args) {
    const token = args[0] ?? String(PLAYER_COUNT_INT);
    const update_type = fromWireInt(token);
    const rest = args.slice(1);
    const update_data: unknown[] =
      Number(token) === PLAYER_COUNT_INT
        ? rest.map((v) => {
          const n = Number(v);
          return Number.isFinite(n) ? n : 0;
        })
        : rest.map(unescapeFanta);
    return { update_type, update_data };
  },
});
