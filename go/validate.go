package aolib

import (
	"bytes"
	"embed"
	"fmt"
	"io/fs"
	"strings"
	"sync"

	"github.com/santhosh-tekuri/jsonschema/v6"
)

//go:embed spec
var specFS embed.FS

// ValidationError reports a packet that does not satisfy its spec schema.
type ValidationError struct {
	Header string
	Detail string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("aolib: invalid %s packet: %s", e.Header, e.Detail)
}

// Schema $ids are absolute paths ("/packets/schemas/MS.schema.json"), so
// resources live at the root of this base for their $refs to resolve.
const specBase = "file:///"

var (
	compileOnce sync.Once
	compiler    *jsonschema.Compiler
	compileErr  error
	compiled    sync.Map // schemaPath -> *jsonschema.Schema
)

func loadSpec() {
	compiler = jsonschema.NewCompiler()
	compiler.DefaultDraft(jsonschema.Draft7)
	compileErr = fs.WalkDir(specFS, "spec", func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		raw, err := specFS.ReadFile(path)
		if err != nil {
			return err
		}
		doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
		if err != nil {
			return fmt.Errorf("%s: %w", path, err)
		}
		return compiler.AddResource(specBase+strings.TrimPrefix(path, "spec/"), doc)
	})
}

func schemaFor(path string) (*jsonschema.Schema, error) {
	if s, ok := compiled.Load(path); ok {
		return s.(*jsonschema.Schema), nil
	}
	compileOnce.Do(loadSpec)
	if compileErr != nil {
		return nil, compileErr
	}
	s, err := compiler.Compile(specBase + path)
	if err != nil {
		return nil, err
	}
	compiled.Store(path, s)
	return s, nil
}

type specPacket interface {
	Outgoing
	schemaPath() string
}

// validateJSON checks a JSON envelope against p's schema. Packets without a
// schema (custom codecs, the generic *Packet) pass.
func validateJSON(p any, raw []byte) error {
	sp, ok := p.(specPacket)
	if !ok {
		return nil
	}
	sch, err := schemaFor(sp.schemaPath())
	if err != nil {
		return err
	}
	doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(raw))
	if err != nil {
		return &ValidationError{Header: sp.Header(), Detail: err.Error()}
	}
	if obj, ok := doc.(map[string]any); ok {
		if h, legacy := obj["header"]; legacy {
			if _, has := obj["$header"]; !has {
				obj["$header"] = h
				delete(obj, "header")
			}
		}
	}
	if err := sch.Validate(doc); err != nil {
		return &ValidationError{Header: sp.Header(), Detail: validationDetail(err)}
	}
	return nil
}

// validatePacket checks a typed packet by validating its JSON envelope.
func validatePacket(p any) error {
	sp, ok := p.(specPacket)
	if !ok {
		return nil
	}
	raw, err := encodeJSON(sp)
	if err != nil {
		return err
	}
	return validateJSON(sp, raw)
}

// validated wraps a generated Parse* result with schema validation.
func validated[T any](p *T, err error) (any, error) {
	if err != nil {
		return nil, err
	}
	if err := validatePacket(p); err != nil {
		return nil, err
	}
	return p, nil
}

// validationDetail flattens the validator's tree into "at '/x': reason" lines,
// dropping its header line that names the internal schema URL.
func validationDetail(err error) string {
	lines := strings.Split(err.Error(), "\n")
	var out []string
	for _, l := range lines[1:] {
		if l = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(l), "-")); l != "" {
			out = append(out, l)
		}
	}
	if len(out) == 0 {
		return err.Error()
	}
	return strings.Join(out, "; ")
}
