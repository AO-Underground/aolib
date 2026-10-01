/**
 * Interop conformance: this binding against the shared vectors in
 * conformance/vectors.json (generated and reviewed as the canonical oracle).
 *
 * Per vector: decode both wire forms, assert they yield the same packet, then
 * re-encode to each form and assert it matches the pinned bytes exactly. Every
 * binding runs the same vectors, so passing means aolib-ts and aolib-go emit
 * and accept identical wire data — they interoperate.
 */

import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { encode } from "../src/encode";
import { decode } from "../src/decode";
import { c2sSchemas, s2cSchemas } from "../generated/packets";
import type { JsonSchema } from "../src/types";

interface Vector {
  id: string;
  header: string;
  receiver: "server" | "client";
  fanta: string;
  json: Record<string, unknown>;
}

const c2s = c2sSchemas as unknown as Record<string, JsonSchema>;
const s2c = s2cSchemas as unknown as Record<string, JsonSchema>;

const vectors = JSON.parse(
  readFileSync(join(import.meta.dir, "..", "..", "conformance", "vectors.json"), "utf8"),
) as Vector[];

describe("conformance vectors (interop with aolib-go)", () => {
  it("has vectors", () => {
    expect(vectors.length).toBeGreaterThan(0);
  });

  for (const v of vectors) {
    it(v.id, () => {
      const schema = (v.receiver === "server" ? c2s : s2c)[v.header];
      if (!schema) throw new Error(`no schema for ${v.header}`);

      const fromJson = decode(schema, JSON.stringify(v.json));
      const fromFanta = decode(schema, v.fanta);
      expect(fromFanta).toEqual(fromJson);

      expect(encode(schema, fromJson, "fanta")).toBe(v.fanta);
      expect(JSON.parse(encode(schema, fromJson, "json"))).toEqual(v.json);
    });
  }
});
