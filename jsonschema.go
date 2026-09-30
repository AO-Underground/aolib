/* Athena - A server for Attorney Online 2 written in Go
Copyright (C) 2022 MangosArentLiterature <mango@transmenace.dev>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

package aolib

// JSON-schema enforcement for the MS (in-character) packet.
//
// The schemas live in the repository's top-level schemas/ folder (vendored
// from https://github.com/OmniTroid/aolib-schemas). MSRequest.schema.json
// describes the client→server MS object; MSBroadcast.schema.json describes the
// server→client form. They encode the AO2 "no type nonsense" contract: char_id
// is a number, realization is a boolean, offset is an {x,y} object, the side is
// a fixed enum, and so on.
//
// The schemas are compiled once at startup via CompileMSSchemas (the main
// package embeds the files and hands the bytes over). Until that happens the
// validators are nil and every Validate* call is a no-op, so unit tests and
// FantaCode-only paths that never compile the schemas are unaffected.

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/santhosh-tekuri/jsonschema/v5"
)

var (
	msRequestSchema   *jsonschema.Schema
	msBroadcastSchema *jsonschema.Schema
)

// compileSchema compiles a single JSON-schema document from its raw bytes.
func compileSchema(name string, data []byte) (*jsonschema.Schema, error) {
	c := jsonschema.NewCompiler()
	if err := c.AddResource(name, bytes.NewReader(data)); err != nil {
		return nil, err
	}
	return c.Compile(name)
}

// CompileMSSchemas compiles the MS request/broadcast schemas and installs them
// as the active validators for JSON-mode MS packets. Pass the raw bytes of
// schemas/MSRequest.schema.json and schemas/MSBroadcast.schema.json.
//
// It is safe to call more than once (the last successful call wins). If
// compilation fails the previous validators are left untouched.
func CompileMSSchemas(requestJSON, broadcastJSON []byte) error {
	req, err := compileSchema("MSRequest.schema.json", requestJSON)
	if err != nil {
		return fmt.Errorf("compiling MSRequest schema: %w", err)
	}
	bcast, err := compileSchema("MSBroadcast.schema.json", broadcastJSON)
	if err != nil {
		return fmt.Errorf("compiling MSBroadcast schema: %w", err)
	}
	msRequestSchema = req
	msBroadcastSchema = bcast
	return nil
}

// MSSchemasLoaded reports whether the MS validators are active.
func MSSchemasLoaded() bool {
	return msRequestSchema != nil && msBroadcastSchema != nil
}

// validateAgainst validates raw JSON bytes against a compiled schema. A nil
// schema disables validation (returns nil) so the server runs fine before the
// schemas are compiled.
func validateAgainst(sch *jsonschema.Schema, raw []byte) error {
	if sch == nil {
		return nil
	}
	var v interface{}
	if err := json.Unmarshal(raw, &v); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	return sch.Validate(v)
}

// ValidateMSRequest checks an inbound JSON-encoded MS packet against the
// MSRequest schema. Returns nil when validation passes or no schema is loaded.
func ValidateMSRequest(raw []byte) error {
	return validateAgainst(msRequestSchema, raw)
}

// ValidateMSBroadcast checks an outbound JSON-encoded MS packet against the
// MSBroadcast schema. Returns nil when validation passes or no schema is loaded.
func ValidateMSBroadcast(raw []byte) error {
	return validateAgainst(msBroadcastSchema, raw)
}
