import json
from pathlib import Path

from aolib.validate import apply_defaults
from aolib.wire import c2s_schemas, s2c_schemas

SPEC_DIR = Path(__file__).resolve().parent.parent.parent / "spec" / "packets" / "schemas"


def test_dispatch_covers_spec() -> None:
    want_c2s = set()
    want_s2c = set()
    for path in SPEC_DIR.glob("*.json"):
        schema = json.loads(path.read_text(encoding="utf-8"))
        header = schema["properties"]["$header"]["const"]
        receiver = schema["x-receiver"]
        (want_c2s if receiver == "server" else want_s2c).add(header)

    assert set(c2s_schemas) == want_c2s
    assert set(s2c_schemas) == want_s2c


def test_defaults_apply() -> None:
    for path in SPEC_DIR.glob("*.json"):
        schema = json.loads(path.read_text(encoding="utf-8"))
        value = {}
        apply_defaults(schema, value)
        for key, sub in schema.get("properties", {}).items():
            if key == "$header" or "default" not in sub:
                continue
            assert key in value, f"{path.name}: default for {key!r} not applied"
            assert value[key] == sub["default"], f"{path.name}: {key!r}"
