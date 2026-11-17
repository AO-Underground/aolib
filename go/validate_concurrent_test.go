package aolib

import (
	"io/fs"
	"os"
	"os/exec"
	"strings"
	"sync"
	"testing"
)

// TestSchemaForConcurrent compiles the packet schemas from many goroutines at
// once. schemaFor shares one jsonschema.Compiler across every session, and
// Compiler.Compile mutates that compiler's caches; without serialization this
// reproduces the concurrent map read/write fatal seen when two AO sessions
// receive their first JSON packets at the same time.
//
// The work runs in a child process so the schema cache starts cold: all tests
// in a package share one process, and earlier tests may have compiled schemas.
func TestSchemaForConcurrent(t *testing.T) {
	if os.Getenv("AOLIB_SCHEMA_RACE_CHILD") != "1" {
		cmd := exec.Command(os.Args[0], "-test.run=^TestSchemaForConcurrent$", "-test.v")
		cmd.Env = append(os.Environ(), "AOLIB_SCHEMA_RACE_CHILD=1")
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("concurrent schema compile child failed: %v\n%s", err, out)
		}
		return
	}

	var paths []string
	err := fs.WalkDir(specFS, "spec/packets/schemas", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && strings.HasSuffix(path, ".schema.json") {
			paths = append(paths, strings.TrimPrefix(path, "spec/"))
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(paths) == 0 {
		t.Fatal("no packet schemas found")
	}

	const workers = 4
	start := make(chan struct{})
	var wg sync.WaitGroup
	errs := make(chan error, len(paths)*workers)
	for _, path := range paths {
		for i := 0; i < workers; i++ {
			wg.Add(1)
			go func(path string) {
				defer wg.Done()
				<-start
				if _, err := schemaFor(path); err != nil {
					errs <- err
				}
			}(path)
		}
	}
	close(start)
	wg.Wait()
	close(errs)
	for err := range errs {
		t.Error(err)
	}
}
