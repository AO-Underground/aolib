import json
from pathlib import Path

from aolib.decode import decode
from aolib.encode import encode
from aolib.wire import c2s_schemas, s2c_schemas

VECTORS_PATH = Path(__file__).resolve().parent.parent.parent / "conformance" / "vectors.json"


def _load_vectors():
    if not VECTORS_PATH.exists():
        return []
    return json.loads(VECTORS_PATH.read_text(encoding="utf-8"))


def test_conformance_vectors() -> None:
    vectors = _load_vectors()
    assert vectors, "no conformance vectors found"

    for v in vectors:
        header = v["header"]
        receiver = v["receiver"]
        fanta = v["fanta"]
        json_str = json.dumps(v["json"], separators=(",", ":"), ensure_ascii=False)
        schema = c2s_schemas[header] if receiver == "server" else s2c_schemas[header]

        from_json = decode(schema, json_str)
        from_fanta = decode(schema, fanta)
        assert from_json == from_fanta, (
            f"{v['id']}: wire forms decode to different packets\n"
            f"  json:  {from_json!r}\n  fanta: {from_fanta!r}"
        )

        assert encode(schema, from_fanta, "fanta") == fanta, f"{v['id']}: fanta mismatch"
        assert encode(schema, from_json, "json") == json_str, f"{v['id']}: json mismatch"
        # Cross-wire: both decodes yield the same packet.
        assert encode(schema, from_fanta, "json") == json_str, f"{v['id']}: cross-wire json"
        assert encode(schema, from_json, "fanta") == fanta, f"{v['id']}: cross-wire fanta"
