#!/usr/bin/env python3
"""Codegen: reads ../spec and emits aolib/generated/*.

Inputs:
  - spec/packets/schemas/<Name>.schema.json, one per packet
  - spec/types/<Name>.schema.json, shared enums and object types

Outputs:
  - generated/enums.py    str-Enum classes
  - generated/types.py    TypedDict aliases for shared object types
  - generated/schemas.py  every schema inlined as a Python dict
  - generated/packets.py  c2s/s2c direction maps + packet TypedDicts

Run via `python scripts/codegen.py`; the output is committed.
"""

from __future__ import annotations

import json
import keyword
from pathlib import Path
from pprint import pformat
from typing import Dict, List

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
META = ROOT.parent / "spec"
PACKETS_DIR = META / "packets" / "schemas"
TYPES_DIR = META / "types"
OUT = ROOT / "aolib" / "generated"

HEADER = "# AUTO-GENERATED from spec/. Do not edit; run `python scripts/codegen.py`.\n\n"


def load_json(path: Path) -> Dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def basename(filename: str) -> str:
    return filename[: -len(".schema.json")]


def list_files(directory: Path) -> List[str]:
    return sorted(p.name for p in directory.glob("*.json"))


def ref_name(ref: str) -> str:
    return basename(ref.rsplit("/", 1)[-1])


def member_name(value: str) -> str:
    return value + "_" if keyword.iskeyword(value) else value


def field_type(schema: Dict, enum_names, type_names) -> str:
    ref = schema.get("$ref")
    if ref:
        name = ref_name(ref)
        if name in enum_names or name in type_names:
            return name
    t = schema.get("type")
    if isinstance(t, list):
        return "Any"
    if t == "string":
        return "str"
    if t == "boolean":
        return "bool"
    if t == "integer":
        return "int"
    if t == "number":
        return "float"
    if t == "array":
        return f"List[{field_type(schema.get('items', {}), enum_names, type_names)}]"
    if t == "object":
        return "Dict[str, Any]"
    return "Any"


def load_types():
    enums: Dict[str, Dict] = {}
    types: Dict[str, Dict] = {}
    for filename in list_files(TYPES_DIR):
        name = basename(filename)
        schema = load_json(TYPES_DIR / filename)
        if "enum" in schema:
            enums[name] = schema
        else:
            types[name] = schema
    return enums, types


def load_packets() -> Dict[str, Dict]:
    return {
        basename(filename): load_json(PACKETS_DIR / filename)
        for filename in list_files(PACKETS_DIR)
    }


def emit_enums(enums: Dict[str, Dict]) -> str:
    lines = [HEADER, "from enum import Enum\n", "\n"]
    for name in sorted(enums):
        schema = enums[name]
        desc = schema.get("description", "").strip()
        lines.append(f"class {name}(str, Enum):\n")
        lines.append(f'    """{desc}"""\n')
        for value in schema.get("enum", []):
            lines.append(f"    {member_name(value)} = {value!r}\n")
        lines.append("\n")
    return "".join(lines)


def emit_types(types: Dict[str, Dict], enum_names, type_names) -> str:
    lines = [HEADER, "from typing import Dict, List, TypedDict\n", "\n"]
    for name in sorted(types):
        schema = types[name]
        desc = schema.get("description", "").strip()
        lines.append(f"class {name}(TypedDict):\n")
        lines.append(f'    """{desc}"""\n')
        for pname, psub in schema.get("properties", {}).items():
            lines.append(f"    {pname}: {field_type(psub, enum_names, type_names)}\n")
        lines.append("\n")
    return "".join(lines)


def emit_schemas(enums: Dict[str, Dict], types: Dict[str, Dict], packets: Dict[str, Dict]) -> str:
    lines = [HEADER]
    for name in sorted(enums):
        lines.append(f"{name}EnumSchema = {pformat(enums[name], sort_dicts=False)}\n\n")
    for name in sorted(types):
        lines.append(f"{name}TypeSchema = {pformat(types[name], sort_dicts=False)}\n\n")
    for name in sorted(packets):
        lines.append(f"{name}Schema = {pformat(packets[name], sort_dicts=False)}\n\n")
    return "".join(lines)


def emit_packets(packets: Dict[str, Dict], enums: Dict[str, Dict], types: Dict[str, Dict]) -> str:
    enum_names = set(enums)
    type_names = set(types)

    c2s: Dict[str, str] = {}
    s2c: Dict[str, str] = {}
    for name in sorted(packets):
        schema = packets[name]
        header = schema["properties"]["$header"]["const"]
        if schema.get("x-receiver") == "server":
            c2s[header] = name
        else:
            s2c[header] = name

    lines = [HEADER, "from typing import Any, Dict, List, TypedDict\n", "\n"]
    lines.append("from .enums import " + ", ".join(sorted(enum_names)) + "\n")
    lines.append("from .types import " + ", ".join(sorted(type_names)) + "\n")
    schema_names = sorted(
        [f"{n}EnumSchema" for n in enums]
        + [f"{n}TypeSchema" for n in types]
        + [f"{n}Schema" for n in packets]
    )
    lines.append("from .schemas import " + ", ".join(schema_names) + "\n")
    lines.append("\n\n")

    lines.append(
        'Packet = TypedDict("Packet", {"$header": str, "$extras": Dict[str, Any]}, total=False)\n\n'
    )
    lines.append("enum_schemas = [" + ", ".join(f"{n}EnumSchema" for n in sorted(enums)) + "]\n")
    lines.append("type_schemas = [" + ", ".join(f"{n}TypeSchema" for n in sorted(types)) + "]\n\n")

    lines.append("c2s_schemas: Dict[str, Dict[str, Any]] = {\n")
    for header in sorted(c2s):
        lines.append(f'    {header!r}: {c2s[header]}Schema,\n')
    lines.append("}\n\n")

    lines.append("s2c_schemas: Dict[str, Dict[str, Any]] = {\n")
    for header in sorted(s2c):
        lines.append(f'    {header!r}: {s2c[header]}Schema,\n')
    lines.append("}\n\n")

    for name in sorted(packets):
        schema = packets[name]
        desc = schema.get("description", "").strip()
        lines.append(f"class {name}(Packet, total=False):\n")
        lines.append(f'    """{desc}"""\n')
        for pname, psub in schema.get("properties", {}).items():
            if pname == "$header" or "const" in psub:
                continue
            lines.append(f"    {pname}: {field_type(psub, enum_names, type_names)}\n")
        lines.append("\n")

    return "".join(lines)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    enums, types = load_types()
    packets = load_packets()
    enum_names = set(enums)
    type_names = set(types)

    (OUT / "__init__.py").write_text("", encoding="utf-8")
    (OUT / "enums.py").write_text(emit_enums(enums), encoding="utf-8")
    (OUT / "types.py").write_text(emit_types(types, enum_names, type_names), encoding="utf-8")
    (OUT / "schemas.py").write_text(emit_schemas(enums, types, packets), encoding="utf-8")
    (OUT / "packets.py").write_text(emit_packets(packets, enums, types), encoding="utf-8")
    print(
        f"Wrote {OUT} ({len(enums)} enums, {len(types)} types, {len(packets)} packets)"
    )


if __name__ == "__main__":
    main()

