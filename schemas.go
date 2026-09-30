package aolib

import _ "embed"

// The MS schemas are vendored from OmniTroid/aolib-meta and embedded here so
// JSON-mode MS validation works out of the box without the caller shipping
// schema files separately.

//go:embed schemas/MSRequest.schema.json
var msRequestSchemaJSON string

//go:embed schemas/MSBroadcast.schema.json
var msBroadcastSchemaJSON string

// LoadSchemas compiles the embedded MS request/broadcast schemas and installs
// them as the active validators for JSON-mode MS packets. Call it once at
// startup to enable ValidateMSRequest and ValidateMSBroadcast; until then both
// validators are no-ops.
func LoadSchemas() error {
	return CompileMSSchemas([]byte(msRequestSchemaJSON), []byte(msBroadcastSchemaJSON))
}
