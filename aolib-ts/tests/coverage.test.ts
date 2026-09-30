/**
 * The dispatch registries must contain exactly the packets defined in spec/,
 * no more and no fewer, in the correct direction.
 *
 * Reads the schemas directly (not the generated code), so a codegen skip or
 * bug that silently drops a packet is caught here rather than reproduced and
 * hidden by the codegen-determinism check.
 */

import { describe, it, expect } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { c2sSchemas, s2cSchemas } from "../generated/packets";

const SPEC = join(import.meta.dir, "..", "..", "spec", "packets", "schemas");

function specSets(): { c2s: Set<string>; s2c: Set<string> } {
  const c2s = new Set<string>();
  const s2c = new Set<string>();
  for (const f of readdirSync(SPEC)) {
    if (!f.endsWith(".schema.json")) continue;
    const s = JSON.parse(readFileSync(join(SPEC, f), "utf8")) as {
      properties?: { $header?: { const?: string } };
      "x-receiver"?: string;
    };
    const header = s.properties?.$header?.const;
    if (!header) throw new Error(`${f}: missing $header const`);
    const receiver = s["x-receiver"];
    if (receiver === "server") c2s.add(header);
    else if (receiver === "client") s2c.add(header);
    else throw new Error(`${f}: x-receiver must be client|server, got ${String(receiver)}`);
  }
  return { c2s, s2c };
}

function diff(want: Set<string>, got: Set<string>): { missing: string[]; extra: string[] } {
  return {
    missing: [...want].filter((h) => !got.has(h)).sort(),
    extra: [...got].filter((h) => !want.has(h)).sort(),
  };
}

describe("dispatch covers spec", () => {
  const { c2s, s2c } = specSets();

  it("c2s registry matches the spec's server-receiver packets", () => {
    const d = diff(c2s, new Set(Object.keys(c2sSchemas)));
    expect({ missing: d.missing, extra: d.extra }).toEqual({ missing: [], extra: [] });
  });

  it("s2c registry matches the spec's client-receiver packets", () => {
    const d = diff(s2c, new Set(Object.keys(s2cSchemas)));
    expect({ missing: d.missing, extra: d.extra }).toEqual({ missing: [], extra: [] });
  });
});
