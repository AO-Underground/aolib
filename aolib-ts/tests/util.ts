/**
 * Test helpers, write small ad-hoc JSON Schemas without the
 * envelope boilerplate.
 *
 * Production schemas live in `schemas/` and are imported via
 * `generated/packets`; this helper exists only so wire-format
 * tests can construct one-off packet shapes inline.
 */

import type { JsonSchema } from "../src/types";

export function packetSchema(
  header: string,
  properties: Record<string, JsonSchema> = {},
  opts: { required?: string[]; codec?: string } = {},
): JsonSchema {
  const props: Record<string, JsonSchema> = {
    $header: { type: "string", const: header },
    ...properties,
  };
  const required = ["$header", ...(opts.required ?? requiredFromProps(properties))];
  const schema: JsonSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: header,
    type: "object",
    properties: props,
    required,
    additionalProperties: false,
  };
  if (opts.codec) schema["x-fanta-codec"] = opts.codec;
  return schema;
}

/** A property is required by default; pass `default` to make it optional. */
function requiredFromProps(properties: Record<string, JsonSchema>): string[] {
  return Object.entries(properties)
    .filter(([, v]) => v.default === undefined && v.const === undefined)
    .map(([k]) => k);
}
