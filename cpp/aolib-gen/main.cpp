// aolib-gen: reads the canonical spec/ and emits the typed C++ surface:
// enums_gen.hpp, types_gen.hpp, packets_gen.hpp/.cpp, registry_gen.hpp/.cpp,
// session_{client,server}_gen.hpp, and schemas_gen.hpp/.cpp.
//
// Run from cpp/:
//   aolib-gen -meta ../spec -out .
//
// This mirrors go/cmd/aolib-gen: the schemas stay the single source of truth.

#include <nlohmann/json.hpp>

#include <algorithm>
#include <cctype>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace fs = std::filesystem;
using ordered_json = nlohmann::ordered_json;

namespace {

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

std::string read_file(const fs::path& p) {
    std::ifstream in(p, std::ios::binary);
    if (!in) throw std::runtime_error("cannot read " + p.string());
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

void write_file(const fs::path& p, const std::string& content) {
    std::ofstream out(p, std::ios::binary);
    if (!out) throw std::runtime_error("cannot write " + p.string());
    out << content;
    std::cout << "wrote " << p.string() << "\n";
}

std::string capitalize_first(const std::string& s) {
    if (s.empty()) return s;
    std::string r = s;
    r[0] = static_cast<char>(std::toupper(static_cast<unsigned char>(r[0])));
    return r;
}

// "char_data" -> "CharData".
std::string pascal_case(const std::string& s) {
    std::string out;
    bool up = true;
    for (char c : s) {
        if (c == '_') { up = true; continue; }
        out += up ? static_cast<char>(std::toupper(static_cast<unsigned char>(c))) : c;
        up = false;
    }
    return out;
}

// "DeskModifier" -> "desk_modifier".
std::string snake_case(const std::string& s) {
    std::string out;
    for (std::size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (std::isupper(static_cast<unsigned char>(c))) {
            if (i != 0 && !out.empty() && out.back() != '_') out += '_';
            out += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        } else {
            out += c;
        }
    }
    return out;
}

std::string json_type(const ordered_json& s) {
    if (s.contains("type")) {
        if (s["type"].is_string()) return s["type"].get<std::string>();
        if (s["type"].is_array() && !s["type"].empty() && s["type"][0].is_string()) {
            return s["type"][0].get<std::string>();
        }
    }
    return "";
}

std::string ref_basename(const ordered_json& s) {
    std::string ref = s.value("$ref", "");
    if (ref.empty()) return "";
    std::size_t pos = ref.find_last_of('/');
    std::string base = pos == std::string::npos ? ref : ref.substr(pos + 1);
    const std::string suffix = ".schema.json";
    if (base.size() > suffix.size() &&
        base.compare(base.size() - suffix.size(), suffix.size(), suffix) == 0) {
        base.resize(base.size() - suffix.size());
    }
    return base;
}

std::string cpp_string_literal(const std::string& s) {
    std::string out = "\"";
    for (char c : s) {
        switch (c) {
            case '\\': out += "\\\\"; break;
            case '"': out += "\\\""; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default: out += c; break;
        }
    }
    out += "\"";
    return out;
}

// ---------------------------------------------------------------------------
// Schema model
// ---------------------------------------------------------------------------

struct EnumInfo {
    std::string name;
    std::vector<std::string> values;
    std::vector<int> wire_ints;
    std::string description;
};

struct TypeInfo {
    std::string name;
    ordered_json schema;
    std::string description;
    std::vector<int> wire_bits;
};

struct PropInfo {
    std::string key;
    ordered_json schema;
};

struct PacketInfo {
    std::string name;
    std::string header;
    std::string x_receiver;
    std::string x_fanta_codec;
    std::string description;
    std::vector<PropInfo> props;  // ordered, excluding $header
};

struct Model {
    std::map<std::string, EnumInfo> enums;   // keyed by "Name.schema.json"
    std::map<std::string, TypeInfo> types;   // keyed by "Name.schema.json"
    std::vector<PacketInfo> packets;         // sorted by name
};

bool has_default(const ordered_json& s) { return s.contains("default"); }
bool has_const(const ordered_json& s) { return s.contains("const"); }

std::vector<std::string> list_schema_files(const fs::path& dir) {
    std::vector<std::string> names;
    if (!fs::exists(dir)) return names;
    const std::string suffix = ".schema.json";
    for (const auto& e : fs::directory_iterator(dir)) {
        if (!e.is_regular_file()) continue;
        std::string fname = e.path().filename().string();
        if (fname.size() > suffix.size() &&
            fname.compare(fname.size() - suffix.size(), suffix.size(), suffix) == 0) {
            names.push_back(fname.substr(0, fname.size() - suffix.size()));
        }
    }
    std::sort(names.begin(), names.end());
    return names;
}

Model load_model(const fs::path& meta) {
    Model m;

    fs::path types_dir = meta / "types";
    for (const auto& name : list_schema_files(types_dir)) {
        ordered_json s = ordered_json::parse(read_file(types_dir / (name + ".schema.json")));
        std::string desc = s.value("description", "");
        if (s.contains("enum") && s["enum"].is_array()) {
            EnumInfo e;
            e.name = name;
            for (const auto& v : s["enum"]) e.values.push_back(v.get<std::string>());
            if (s.contains("x-wire-ints") && s["x-wire-ints"].is_array()) {
                for (const auto& v : s["x-wire-ints"]) e.wire_ints.push_back(v.get<int>());
            }
            e.description = desc;
            m.enums[name + ".schema.json"] = e;
        } else {
            TypeInfo t;
            t.name = name;
            t.schema = s;
            t.description = desc;
            if (s.contains("x-wire-bits") && s["x-wire-bits"].is_array()) {
                for (const auto& v : s["x-wire-bits"]) t.wire_bits.push_back(v.get<int>());
            }
            m.types[name + ".schema.json"] = t;
        }
    }

    fs::path pkts = meta / "packets" / "schemas";
    for (const auto& name : list_schema_files(pkts)) {
        ordered_json s = ordered_json::parse(read_file(pkts / (name + ".schema.json")));
        PacketInfo p;
        p.name = name;
        p.x_receiver = s.value("x-receiver", "");
        p.x_fanta_codec = s.value("x-fanta-codec", "");
        p.description = s.value("description", "");
        if (s.contains("properties") && s["properties"].is_object()) {
            for (auto it = s["properties"].begin(); it != s["properties"].end(); ++it) {
                if (it.key() == "$header") {
                    if (it.value().contains("const")) p.header = it.value()["const"].get<std::string>();
                    continue;
                }
                p.props.push_back(PropInfo{it.key(), it.value()});
            }
        }
        m.packets.push_back(p);
    }
    std::sort(m.packets.begin(), m.packets.end(),
              [](const PacketInfo& a, const PacketInfo& b) { return a.name < b.name; });
    return m;
}

// ---------------------------------------------------------------------------
// Type resolution
// ---------------------------------------------------------------------------

const EnumInfo* enum_for(const ordered_json& s, const Model& m) {
    std::string key = ref_basename(s) + ".schema.json";
    auto it = m.enums.find(key);
    return it == m.enums.end() ? nullptr : &it->second;
}

const TypeInfo* type_for(const ordered_json& s, const Model& m) {
    std::string key = ref_basename(s) + ".schema.json";
    auto it = m.types.find(key);
    return it == m.types.end() ? nullptr : &it->second;
}

std::string scalar_type(const ordered_json& s) {
    std::string t = json_type(s);
    if (t == "number" || t == "integer") return "int";
    if (t == "boolean") return "bool";
    return "std::string";
}

std::string field_type(const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) return e->name;
        if (const TypeInfo* t = type_for(s, m)) return t->name;
        return "std::string";
    }
    return scalar_type(s);
}

std::string scalar_encode(const std::string& expr, const ordered_json& s) {
    std::string t = json_type(s);
    if (t == "number" || t == "integer") return "std::to_string(" + expr + ")";
    if (t == "boolean") return "bool_to_wire(" + expr + ")";
    return "escape_fanta(" + expr + ")";
}

std::string scalar_decode(const std::string& expr, const std::string& name, const ordered_json& s) {
    std::string t = json_type(s);
    if (t == "number" || t == "integer") return "parse_wire_int(" + expr + ", " + cpp_string_literal(name) + ")";
    if (t == "boolean") return "parse_wire_bool(" + expr + ", " + cpp_string_literal(name) + ")";
    return "unescape_fanta(" + expr + ")";
}

std::string scalar_default_init(const ordered_json& s) {
    std::string t = json_type(s);
    if (t == "number" || t == "integer") {
        int dv = 0;
        if (s.contains("default") && s["default"].is_number()) dv = s["default"].get<int>();
        return "{" + std::to_string(dv) + "}";
    }
    if (t == "boolean") {
        bool dv = false;
        if (s.contains("default") && s["default"].is_boolean()) dv = s["default"].get<bool>();
        return dv ? "{true}" : "{false}";
    }
    return "{}";
}

// ---------------------------------------------------------------------------
// Naming / item-struct helpers
// ---------------------------------------------------------------------------

bool is_object_array(const ordered_json& s) {
    return json_type(s) == "array" && s.contains("items") && json_type(s["items"]) == "object";
}

bool is_inline_object(const ordered_json& s) { return json_type(s) == "object"; }

std::string item_struct_name(const std::string& pkt, const std::string& field) {
    return pkt + pascal_case(field) + "Item";
}

std::string inline_object_name(const std::string& pkt, const std::string& field) {
    return pkt + pascal_case(field);
}

std::string field_cpp_type(const ordered_json& s, const Model& m, const std::string& pkt, const std::string& field) {
    if (json_type(s) == "array") {
        if (!s.contains("items")) return "std::vector<std::string>";
        const ordered_json& it = s["items"];
        if (it.contains("type") && it["type"].is_array()) return "std::vector<std::string>";  // mixed (ARUP)
        if (json_type(it) == "object") return "std::vector<" + item_struct_name(pkt, field) + ">";
        if (it.contains("$ref")) {
            if (const EnumInfo* e = enum_for(it, m)) return "std::vector<" + e->name + ">";
            if (const TypeInfo* t = type_for(it, m)) return "std::vector<" + t->name + ">";
            return "std::vector<std::string>";
        }
        std::string itt = json_type(it);
        if (itt == "number" || itt == "integer") return "std::vector<int>";
        if (itt == "boolean") return "std::vector<bool>";
        return "std::vector<std::string>";
    }
    if (is_inline_object(s)) return inline_object_name(pkt, field);
    return field_type(s, m);
}

std::string member_init(const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) {
            std::string dv = e->values.empty() ? "" : e->values[0];
            if (s.contains("default") && s["default"].is_string()) dv = s["default"].get<std::string>();
            return "{" + e->name + "::" + dv + "}";
        }
        return "{}";
    }
    if (json_type(s) == "array") return "{}";
    return scalar_default_init(s);
}

std::string default_expr(const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) {
            std::string dv = e->values.empty() ? "" : e->values[0];
            if (s.contains("default") && s["default"].is_string()) dv = s["default"].get<std::string>();
            return e->name + "::" + dv;
        }
        return "{}";
    }
    std::string t = json_type(s);
    if (t == "number" || t == "integer") {
        int dv = 0;
        if (s.contains("default") && s["default"].is_number()) dv = s["default"].get<int>();
        return std::to_string(dv);
    }
    if (t == "boolean") {
        bool dv = false;
        if (s.contains("default") && s["default"].is_boolean()) dv = s["default"].get<bool>();
        return dv ? "true" : "false";
    }
    return "{}";
}

const PropInfo* suffix_for(const std::vector<PropInfo>& props, const std::string& base) {
    for (const auto& p : props) {
        if (p.schema.value("x-fanta-suffix-of", "") == base) return &p;
    }
    return nullptr;
}

// ---------------------------------------------------------------------------
// Wire / JSON expression builders
// ---------------------------------------------------------------------------

std::string wenc(const std::string& expr, const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) {
            std::string sn = snake_case(e->name);
            if (!e->wire_ints.empty()) return "std::to_string(" + sn + "_to_wire(" + expr + "))";
            return sn + "_to_string(" + expr + ")";
        }
        if (const TypeInfo* t = type_for(s, m)) return snake_case(t->name) + "_to_wire(" + expr + ")";
        return "escape_fanta(" + expr + ")";
    }
    return scalar_encode(expr, s);
}

std::string wdec(const std::string& expr, const std::string& name, const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) {
            std::string sn = snake_case(e->name);
            if (!e->wire_ints.empty()) return sn + "_from_wire(parse_wire_int(" + expr + ", " + cpp_string_literal(name) + "))";
            return sn + "_from_string(" + expr + ")";
        }
        if (const TypeInfo* t = type_for(s, m)) return snake_case(t->name) + "_from_wire(" + expr + ")";
        return "unescape_fanta(" + expr + ")";
    }
    return scalar_decode(expr, name, s);
}

std::string jenc(const std::string& expr, const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) return snake_case(e->name) + "_to_string(" + expr + ")";
        if (const TypeInfo* t = type_for(s, m)) return expr + ".to_json_object()";
        return expr;
    }
    if (json_type(s) == "object") return expr + ".to_json_object()";
    return expr;
}

std::string jdec(const std::string& expr, const ordered_json& s, const Model& m) {
    if (s.contains("$ref")) {
        if (const EnumInfo* e = enum_for(s, m)) return snake_case(e->name) + "_from_string(" + expr + ".get<std::string>())";
        if (const TypeInfo* t = type_for(s, m)) return t->name + "::from_json_object(" + expr + ")";
        return expr + ".get<std::string>()";
    }
    return expr + ".get<" + scalar_type(s) + ">()";
}

// ---------------------------------------------------------------------------
// enums_gen.hpp
// ---------------------------------------------------------------------------

std::string emit_enums(const Model& m) {
    std::string out;
    out += "// AUTO-GENERATED from spec/types/* (enums). Do not edit; run aolib-gen.\n";
    out += "#pragma once\n\n#include <string>\n\n#include \"aolib/error.hpp\"\n\nnamespace aolib {\n\n";
    std::vector<const EnumInfo*> enums;
    for (const auto& [k, v] : m.enums) enums.push_back(&v);
    std::sort(enums.begin(), enums.end(),
              [](const EnumInfo* a, const EnumInfo* b) { return a->name < b->name; });

    for (const EnumInfo* e : enums) {
        std::string sn = snake_case(e->name);
        out += "enum class " + e->name + " {\n";
        for (const auto& v : e->values) out += "    " + v + ",\n";
        out += "};\n\n";

        out += "inline const char* " + sn + "_to_string(" + e->name + " v) {\n    switch (v) {\n";
        for (const auto& v : e->values) out += "        case " + e->name + "::" + v + ": return " + cpp_string_literal(v) + ";\n";
        out += "    }\n    return \"\";\n}\n\n";

        out += "inline " + e->name + " " + sn + "_from_string(const std::string& s) {\n";
        for (const auto& v : e->values) out += "    if (s == " + cpp_string_literal(v) + ") return " + e->name + "::" + v + ";\n";
        out += "    throw Error(\"aolib: unknown " + e->name + " value '\" + s + \"'\");\n}\n\n";

        if (!e->wire_ints.empty()) {
            out += "inline int " + sn + "_to_wire(" + e->name + " v) {\n    switch (v) {\n";
            for (std::size_t i = 0; i < e->values.size() && i < e->wire_ints.size(); ++i)
                out += "        case " + e->name + "::" + e->values[i] + ": return " + std::to_string(e->wire_ints[i]) + ";\n";
            out += "    }\n    return 0;\n}\n\n";

            out += "inline " + e->name + " " + sn + "_from_wire(int n) {\n    switch (n) {\n";
            for (std::size_t i = 0; i < e->values.size() && i < e->wire_ints.size(); ++i)
                out += "        case " + std::to_string(e->wire_ints[i]) + ": return " + e->name + "::" + e->values[i] + ";\n";
            out += "    }\n    throw Error(\"aolib: unknown " + e->name + " wire value \" + std::to_string(n));\n}\n\n";
        }
    }

    out += "}  // namespace aolib\n";
    return out;
}

// ---------------------------------------------------------------------------
// types_gen.hpp (shared object types)
// ---------------------------------------------------------------------------

std::string emit_types(const Model& m) {
    std::string out;
    out += "// AUTO-GENERATED from spec/types/* (object types). Do not edit; run aolib-gen.\n";
    out += "#pragma once\n\n#include <string>\n\n#include <nlohmann/json.hpp>\n\n#include \"aolib/fanta.hpp\"\n\nnamespace aolib {\n\n";
    std::vector<const TypeInfo*> types;
    for (const auto& [k, v] : m.types) types.push_back(&v);
    std::sort(types.begin(), types.end(),
              [](const TypeInfo* a, const TypeInfo* b) { return a->name < b->name; });

    for (const TypeInfo* t : types) {
        std::string sn = snake_case(t->name);
        std::vector<std::pair<std::string, ordered_json>> props;
        if (t->schema.contains("properties") && t->schema["properties"].is_object()) {
            for (auto it = t->schema["properties"].begin(); it != t->schema["properties"].end(); ++it)
                props.emplace_back(it.key(), it.value());
        }

        out += "struct " + t->name + " {\n";
        for (const auto& [key, sub] : props) out += "    " + scalar_type(sub) + " " + key + scalar_default_init(sub) + ";\n";
        out += "\n    nlohmann::ordered_json to_json_object() const;\n";
        out += "    static " + t->name + " from_json_object(const nlohmann::ordered_json& j);\n";
        out += "};\n\n";

        out += "inline nlohmann::ordered_json " + t->name + "::to_json_object() const {\n    nlohmann::ordered_json j;\n";
        for (const auto& [key, sub] : props) out += "    j[" + cpp_string_literal(key) + "] = " + key + ";\n";
        out += "    return j;\n}\n\n";

        out += "inline " + t->name + " " + t->name + "::from_json_object(const nlohmann::ordered_json& j) {\n    " + t->name + " o;\n";
        for (const auto& [key, sub] : props) out += "    if (j.contains(" + cpp_string_literal(key) + ")) o." + key + " = j[" + cpp_string_literal(key) + "].get<" + scalar_type(sub) + ">();\n";
        out += "    return o;\n}\n\n";

        if (!t->wire_bits.empty()) {
            out += "inline std::string " + sn + "_to_wire(const " + t->name + "& v) {\n    int n = 0;\n";
            for (std::size_t i = 0; i < props.size(); ++i) out += "    if (v." + props[i].first + ") n |= " + std::to_string(t->wire_bits[i]) + ";\n";
            out += "    return std::to_string(n);\n}\n\n";
            out += "inline " + t->name + " " + sn + "_from_wire(const std::string& s) {\n    int n = parse_wire_int(s, " + cpp_string_literal(sn) + ");\n    " + t->name + " v;\n";
            for (std::size_t i = 0; i < props.size(); ++i) out += "    v." + props[i].first + " = (n & " + std::to_string(t->wire_bits[i]) + ") != 0;\n";
            out += "    return v;\n}\n\n";
        } else {
            std::string sep = t->schema.value("x-fanta-separator", "&");
            bool unescape_amp = t->schema.value("x-fanta-unescape-amp", false);

            out += "inline std::string " + sn + "_to_wire(const " + t->name + "& v) {\n";
            if (sep == "|") {
                out += "    if (";
                bool first = true;
                for (const auto& [key, sub] : props) {
                    if (json_type(sub) != "string") continue;
                    if (!first) out += " && ";
                    out += "v." + key + ".empty()";
                    first = false;
                }
                out += ") return \"\";\n";
            }
            std::string join;
            for (std::size_t i = 0; i < props.size(); ++i) {
                if (i) { join += " + "; join += cpp_string_literal(std::string(1, sep[0])); join += " + "; }
                join += scalar_encode("v." + props[i].first, props[i].second);
            }
            out += "    return " + join + ";\n}\n\n";

            out += "inline " + t->name + " " + sn + "_from_wire(const std::string& s) {\n";
            if (sep == "|") out += "    if (s.empty()) return " + t->name + "{};\n";
            out += "    std::string t = s;\n";
            if (unescape_amp) {
                out += "    std::size_t pos = 0;\n    while ((pos = t.find(\"<and>\", pos)) != std::string::npos) { t.replace(pos, 5, \"&\"); pos += 1; }\n";
            }
            out += "    auto parts = split_on(t, '" + sep + "', " + std::to_string(props.size()) + ");\n";
            out += "    " + t->name + " o;\n";
            for (std::size_t i = 0; i < props.size(); ++i)
                out += "    if (parts.size() > " + std::to_string(i) + ") o." + props[i].first + " = " + scalar_decode("parts[" + std::to_string(i) + "]", t->name + "." + props[i].first, props[i].second) + ";\n";
            out += "    return o;\n}\n\n";
        }
    }

    out += "}  // namespace aolib\n";
    return out;
}

// ---------------------------------------------------------------------------
// packets_gen.hpp + packets_gen.cpp
// ---------------------------------------------------------------------------

void emit_args_field(std::string& out, const PacketInfo& p, const PropInfo& prop, const Model& m) {
    const std::string& key = prop.key;
    const ordered_json& s = prop.schema;
    if (has_const(s)) { out += "    args.push_back(" + cpp_string_literal(s["const"].get<std::string>()) + ");\n"; return; }
    if (s.value("x-fanta-suffix-of", "") != "") return;
    if (json_type(s) == "array") {
        const ordered_json& it = s["items"];
        if (json_type(it) == "object") out += "    for (const auto& v : " + key + ") args.push_back(v.wire_fields());\n";
        else out += "    for (const auto& v : " + key + ") args.push_back(" + wenc("v", it, m) + ");\n";
        return;
    }
    if (is_inline_object(s)) { out += "    args.push_back(" + key + ".wire_fields());\n"; return; }
    if (const PropInfo* sfx = suffix_for(p.props, key)) {
        out += "    auto tok = " + wenc(key, s, m) + ";\n";
        out += "    if (" + key + " != " + default_expr(s, m) + " && " + sfx->key + " != " + default_expr(sfx->schema, m) + ") tok += \"^\" + " + wenc(sfx->key, sfx->schema, m) + ";\n";
        out += "    args.push_back(tok);\n";
        return;
    }
    out += "    args.push_back(" + wenc(key, s, m) + ");\n";
}

void emit_parse_field(std::string& out, const PacketInfo& p, const PropInfo& prop, const Model& m) {
    const std::string& key = prop.key;
    const ordered_json& s = prop.schema;
    if (has_const(s)) { out += "    cursor++;\n"; return; }
    if (s.value("x-fanta-suffix-of", "") != "") return;
    if (json_type(s) == "array") {
        const ordered_json& it = s["items"];
        if (json_type(it) == "object") out += "    for (std::size_t i = cursor; i < body.size(); ++i) p." + key + ".push_back(" + item_struct_name(p.name, key) + "::parse_item(body[i]));\n";
        else out += "    for (std::size_t i = cursor; i < body.size(); ++i) p." + key + ".push_back(" + wdec("body[i]", key + "[i]", it, m) + ");\n";
        out += "    cursor = body.size();\n";
        return;
    }
    if (is_inline_object(s)) {
        out += "    if (cursor < body.size()) p." + key + " = " + inline_object_name(p.name, key) + "::parse_item(body[cursor]);\n    cursor++;\n";
        return;
    }
    if (const PropInfo* sfx = suffix_for(p.props, key)) {
        out += "    if (cursor < body.size()) {\n";
        out += "        auto parts = split_caret(body[cursor]);\n";
        out += "        p." + key + " = " + wdec("parts.first", key, s, m) + ";\n";
        out += "        if (parts.second.empty()) { p." + sfx->key + " = " + default_expr(sfx->schema, m) + "; } else { p." + sfx->key + " = " + wdec("parts.second", sfx->key, sfx->schema, m) + "; }\n";
        out += "    }\n    cursor++;\n";
        return;
    }
    if (type_for(s, m) != nullptr) {
        std::string sn = snake_case(type_for(s, m)->name);
        out += "    if (cursor < body.size() && !body[cursor].empty()) p." + key + " = " + sn + "_from_wire(body[cursor]);\n    cursor++;\n";
        return;
    }
    out += "    if (cursor < body.size()) p." + key + " = " + wdec("body[cursor]", key, s, m) + ";\n    cursor++;\n";
}

void emit_tojson_field(std::string& out, const PropInfo& prop, const Model& m) {
    const std::string& key = prop.key;
    const ordered_json& s = prop.schema;
    if (has_const(s)) return;
    if (json_type(s) == "array") {
        const ordered_json& it = s["items"];
        out += "    {\n        nlohmann::ordered_json a = nlohmann::ordered_json::array();\n";
        out += "        for (const auto& v : " + key + ") a.push_back(" + jenc("v", it, m) + ");\n";
        out += "        j[" + cpp_string_literal(key) + "] = a;\n    }\n";
        return;
    }
    out += "    j[" + cpp_string_literal(key) + "] = " + jenc(key, s, m) + ";\n";
}

void emit_fromjson_field(std::string& out, const PacketInfo& p, const PropInfo& prop, const Model& m) {
    const std::string& key = prop.key;
    const ordered_json& s = prop.schema;
    if (has_const(s)) return;
    if (json_type(s) == "array") {
        const ordered_json& it = s["items"];
        if (json_type(it) == "object") {
            std::string iname = item_struct_name(p.name, key);
            out += "    if (j.contains(" + cpp_string_literal(key) + ")) { " + key + ".clear(); for (const auto& v : j[" + cpp_string_literal(key) + "]) " + key + ".push_back(" + iname + "::from_json_object(v)); }\n";
        } else if (it.contains("$ref") && enum_for(it, m)) {
            std::string sn = snake_case(enum_for(it, m)->name);
            out += "    if (j.contains(" + cpp_string_literal(key) + ")) { " + key + ".clear(); for (const auto& v : j[" + cpp_string_literal(key) + "]) " + key + ".push_back(" + sn + "_from_string(v.get<std::string>())); }\n";
        } else if (it.contains("$ref") && type_for(it, m)) {
            out += "    if (j.contains(" + cpp_string_literal(key) + ")) { " + key + ".clear(); for (const auto& v : j[" + cpp_string_literal(key) + "]) " + key + ".push_back(" + type_for(it, m)->name + "::from_json_object(v)); }\n";
        } else {
            out += "    if (j.contains(" + cpp_string_literal(key) + ")) " + key + " = j[" + cpp_string_literal(key) + "].get<std::vector<" + scalar_type(it) + ">>();\n";
        }
        return;
    }
    if (is_inline_object(s)) {
        out += "    if (j.contains(" + cpp_string_literal(key) + ")) " + key + " = " + inline_object_name(p.name, key) + "::from_json_object(j[" + cpp_string_literal(key) + "]);\n";
        return;
    }
    out += "    if (j.contains(" + cpp_string_literal(key) + ")) " + key + " = " + jdec("j[" + cpp_string_literal(key) + "]", s, m) + ";\n";
}

std::string emit_packets_header(const Model& m) {
    std::string out;
    out += "// AUTO-GENERATED from spec/packets/schemas. Do not edit; run aolib-gen.\n";
    out += "#pragma once\n\n#include <map>\n#include <string>\n#include <vector>\n\n#include <nlohmann/json.hpp>\n\n#include \"aolib/outgoing.hpp\"\n#include \"aolib/enums_gen.hpp\"\n#include \"aolib/types_gen.hpp\"\n\nnamespace aolib {\n\n";

    for (const auto& p : m.packets) {
        for (const auto& prop : p.props) {
            bool obj_array = is_object_array(prop.schema);
            bool inline_obj = !obj_array && is_inline_object(prop.schema);
            if (!obj_array && !inline_obj) continue;
            std::string iname = obj_array ? item_struct_name(p.name, prop.key) : inline_object_name(p.name, prop.key);
            const ordered_json& items = obj_array ? prop.schema["items"] : prop.schema;
            std::vector<std::pair<std::string, ordered_json>> sub;
            for (auto it = items["properties"].begin(); it != items["properties"].end(); ++it)
                sub.emplace_back(it.key(), it.value());

            out += "struct " + iname + " {\n";
            for (const auto& [k, ss] : sub) out += "    " + scalar_type(ss) + " " + k + scalar_default_init(ss) + ";\n";
            out += "\n    std::string wire_fields() const;\n";
            out += "    static " + iname + " parse_item(const std::string& s);\n";
            out += "    nlohmann::ordered_json to_json_object() const;\n";
            out += "    static " + iname + " from_json_object(const nlohmann::ordered_json& j);\n";
            out += "};\n\n";
        }
    }

    for (const auto& p : m.packets) {
        out += "struct " + p.name + " : Outgoing {\n";
        for (const auto& prop : p.props) {
            if (has_const(prop.schema)) continue;
            out += "    " + field_cpp_type(prop.schema, m, p.name, prop.key) + " " + prop.key + member_init(prop.schema, m) + ";\n";
        }
        out += "    nlohmann::json extras;\n\n";
        out += "    std::string header() const override { return " + cpp_string_literal(p.header) + "; }\n";
        out += "    std::string schema_path() const override { return " + cpp_string_literal("/packets/schemas/" + p.name + ".schema.json") + "; }\n";
        out += "    nlohmann::json* extras_ptr() override { return &extras; }\n";
        out += "    const nlohmann::json* extras_ptr() const override { return &extras; }\n\n";
        out += "    std::vector<std::string> json_order() const override;\n";
        out += "    std::map<std::string, std::string> json_consts() const override;\n";
        out += "    std::vector<std::string> args() const override;\n";
        out += "    static " + p.name + " parse(const std::vector<std::string>& body);\n";
        out += "    nlohmann::ordered_json to_json_object() const override;\n";
        out += "    void from_json_object(const nlohmann::ordered_json& fields) override;\n";
        out += "};\n\n";
    }

    out += "}  // namespace aolib\n";
    return out;
}

std::string emit_packets_cpp(const Model& m) {
    std::string out;
    out += "// AUTO-GENERATED from spec/packets/schemas. Do not edit; run aolib-gen.\n";
    out += "#include \"aolib/packets_gen.hpp\"\n\n#include \"aolib/fanta.hpp\"\n\nnamespace aolib {\n\n";

    // Item struct methods.
    for (const auto& p : m.packets) {
        for (const auto& prop : p.props) {
            bool obj_array = is_object_array(prop.schema);
            bool inline_obj = !obj_array && is_inline_object(prop.schema);
            if (!obj_array && !inline_obj) continue;
            std::string iname = obj_array ? item_struct_name(p.name, prop.key) : inline_object_name(p.name, prop.key);
            const ordered_json& items = obj_array ? prop.schema["items"] : prop.schema;
            std::vector<std::pair<std::string, ordered_json>> sub;
            for (auto it = items["properties"].begin(); it != items["properties"].end(); ++it)
                sub.emplace_back(it.key(), it.value());

            out += "std::string " + iname + "::wire_fields() const {\n    return join_amp({";
            for (std::size_t i = 0; i < sub.size(); ++i) { if (i) out += ", "; out += scalar_encode(sub[i].first, sub[i].second); }
            out += "});\n}\n\n";

            out += iname + " " + iname + "::parse_item(const std::string& s) {\n    auto parts = split_amp(s, " + std::to_string(sub.size()) + ");\n    " + iname + " it;\n";
            for (std::size_t i = 0; i < sub.size(); ++i)
                out += "    if (parts.size() > " + std::to_string(i) + ") it." + sub[i].first + " = " + scalar_decode("parts[" + std::to_string(i) + "]", iname + "." + sub[i].first, sub[i].second) + ";\n";
            out += "    return it;\n}\n\n";

            out += "nlohmann::ordered_json " + iname + "::to_json_object() const {\n    nlohmann::ordered_json j;\n";
            for (const auto& [k, ss] : sub) out += "    j[" + cpp_string_literal(k) + "] = " + k + ";\n";
            out += "    return j;\n}\n\n";

            out += iname + " " + iname + "::from_json_object(const nlohmann::ordered_json& j) {\n    " + iname + " o;\n";
            for (const auto& [k, ss] : sub) out += "    if (j.contains(" + cpp_string_literal(k) + ")) o." + k + " = j[" + cpp_string_literal(k) + "].get<" + scalar_type(ss) + ">();\n";
            out += "    return o;\n}\n\n";
        }
    }

    for (const auto& p : m.packets) {
        // json_order
        out += "std::vector<std::string> " + p.name + "::json_order() const {\n    return {";
        for (std::size_t i = 0; i < p.props.size(); ++i) { if (i) out += ", "; out += cpp_string_literal(p.props[i].key); }
        out += "};\n}\n\n";

        // json_consts
        std::vector<const PropInfo*> consts;
        for (const auto& prop : p.props) if (has_const(prop.schema)) consts.push_back(&prop);
        out += "std::map<std::string, std::string> " + p.name + "::json_consts() const {\n";
        if (consts.empty()) {
            out += "    return {};\n}\n\n";
        } else {
            out += "    return {";
            for (std::size_t i = 0; i < consts.size(); ++i) { if (i) out += ", "; out += "{" + cpp_string_literal(consts[i]->key) + ", " + cpp_string_literal(consts[i]->schema["const"].get<std::string>()) + "}"; }
            out += "};\n}\n\n";
        }

        // args
        if (p.x_fanta_codec.empty()) {
            out += "std::vector<std::string> " + p.name + "::args() const {\n    std::vector<std::string> args;\n";
            for (const auto& prop : p.props) emit_args_field(out, p, prop, m);
            out += "    return args;\n}\n\n";
        }

        // parse
        if (p.x_fanta_codec.empty()) {
            out += p.name + " " + p.name + "::parse(const std::vector<std::string>& body) {\n    " + p.name + " p;\n    std::size_t cursor = 0;\n";
            for (const auto& prop : p.props) emit_parse_field(out, p, prop, m);
            out += "    return p;\n}\n\n";
        }

        // to_json_object
        if (p.name != "ARUP") {
            out += "nlohmann::ordered_json " + p.name + "::to_json_object() const {\n    nlohmann::ordered_json j;\n";
            for (const auto& prop : p.props) emit_tojson_field(out, prop, m);
            out += "    return j;\n}\n\n";
        }

        // from_json_object
        if (p.name != "ARUP") {
            out += "void " + p.name + "::from_json_object(const nlohmann::ordered_json& j) {\n";
            for (const auto& prop : p.props) emit_fromjson_field(out, p, prop, m);
            out += "}\n\n";
        }
    }

    out += "}  // namespace aolib\n";
    return out;
}

// ---------------------------------------------------------------------------
// registry_gen.hpp / registry_gen.cpp
// ---------------------------------------------------------------------------

std::string emit_registry_header() {
    std::string out;
    out += "// AUTO-GENERATED from spec. Do not edit; run aolib-gen.\n";
    out += "#pragma once\n\n#include <any>\n#include <functional>\n#include <map>\n#include <memory>\n#include <string>\n#include <vector>\n\nnamespace aolib {\n\n";
    out += "using FantaDecoder = std::function<std::any(const std::vector<std::string>&)>;\n";
    out += "using JsonDecoder = std::function<std::any(const std::string&)>;\n";
    out += "using PacketConstructor = std::function<std::any()>;\n\n";
    out += "extern const std::map<std::string, FantaDecoder> c2s_decoders;\n";
    out += "extern const std::map<std::string, FantaDecoder> s2c_decoders;\n";
    out += "extern const std::map<std::string, JsonDecoder> c2s_json;\n";
    out += "extern const std::map<std::string, JsonDecoder> s2c_json;\n";
    out += "extern const std::map<std::string, PacketConstructor> packet_constructors;\n\n";
    out += "}  // namespace aolib\n";
    return out;
}

std::string emit_registry_cpp(const Model& m) {
    std::string out;
    out += "// AUTO-GENERATED from spec. Do not edit; run aolib-gen.\n";
    out += "#include \"aolib/registry_gen.hpp\"\n\n#include \"aolib/packets_gen.hpp\"\n#include \"aolib/wire.hpp\"\n\nnamespace aolib {\n\n";

    std::vector<const PacketInfo*> c2s, s2c;
    for (const auto& p : m.packets) {
        if (p.x_receiver == "server") c2s.push_back(&p);
        else s2c.push_back(&p);
    }

    out += "const std::map<std::string, FantaDecoder> c2s_decoders = {\n";
    for (const auto* p : c2s)
        out += "    {" + cpp_string_literal(p->header) + ", [](const std::vector<std::string>& b) { auto p = " + p->name + "::parse(b); validate_packet(p); return std::any{std::shared_ptr<Outgoing>(std::make_shared<" + p->name + ">(std::move(p)))}; }},\n";
    out += "};\n\n";

    out += "const std::map<std::string, FantaDecoder> s2c_decoders = {\n";
    for (const auto* p : s2c)
        out += "    {" + cpp_string_literal(p->header) + ", [](const std::vector<std::string>& b) { auto p = " + p->name + "::parse(b); validate_packet(p); return std::any{std::shared_ptr<Outgoing>(std::make_shared<" + p->name + ">(std::move(p)))}; }},\n";
    out += "};\n\n";

    out += "const std::map<std::string, JsonDecoder> c2s_json = {\n";
    for (const auto* p : c2s)
        out += "    {" + cpp_string_literal(p->header) + ", [](const std::string& raw) { " + p->name + " p; decode_json_into(p, raw); return std::any{std::shared_ptr<Outgoing>(std::make_shared<" + p->name + ">(std::move(p)))}; }},\n";
    out += "};\n\n";

    out += "const std::map<std::string, JsonDecoder> s2c_json = {\n";
    for (const auto* p : s2c)
        out += "    {" + cpp_string_literal(p->header) + ", [](const std::string& raw) { " + p->name + " p; decode_json_into(p, raw); return std::any{std::shared_ptr<Outgoing>(std::make_shared<" + p->name + ">(std::move(p)))}; }},\n";
    out += "};\n\n";

    out += "const std::map<std::string, PacketConstructor> packet_constructors = {\n";
    for (const auto& p : m.packets)
        out += "    {" + cpp_string_literal(p.name) + ", []() { return std::any{std::shared_ptr<Outgoing>(std::make_shared<" + p.name + ">())}; }},\n";
    out += "};\n\n";

    out += "}  // namespace aolib\n";
    return out;
}

// ---------------------------------------------------------------------------
// session_{server,client}_gen.hpp
// ---------------------------------------------------------------------------

std::string emit_session_gen(const Model& m, const std::string& remote) {
    std::vector<const PacketInfo*> packets;
    for (const auto& p : m.packets) packets.push_back(&p);
    std::sort(packets.begin(), packets.end(), [](const PacketInfo* a, const PacketInfo* b) {
        if (a->header != b->header) return a->header < b->header;
        return a->name < b->name;
    });

    std::string out;
    out += "    // AUTO-GENERATED from spec. Do not edit; run aolib-gen.\n";
    for (const auto* p : packets) {
        std::string method = capitalize_first(p->header);
        if (p->x_receiver == remote) {
            out += "    void Send" + method + "(const " + p->name + "& p) { core()->send(p); }\n";
        } else {
            out += "    void On" + method + "(std::function<void(const " + p->name + "&)> h) { core()->on(" + cpp_string_literal(p->header) + ", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<" + p->name + ">(sp)); }); }\n";
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// schemas_gen.hpp / schemas_gen.cpp (inlined spec for validation)
// ---------------------------------------------------------------------------

std::string emit_schemas_header() {
    std::string out;
    out += "// AUTO-GENERATED from spec. Do not edit; run aolib-gen.\n";
    out += "#pragma once\n\n#include <map>\n#include <string>\n\n#include <nlohmann/json.hpp>\n\nnamespace aolib {\n\n// Every spec schema (packets + types) keyed by its $id.\nconst std::map<std::string, nlohmann::ordered_json>& spec_schemas();\n\n}  // namespace aolib\n";
    return out;
}

std::string emit_schemas_cpp(const Model&, const fs::path& meta) {
    std::string out;
    out += "// AUTO-GENERATED from spec. Do not edit; run aolib-gen.\n";
    out += "#include \"aolib/schemas_gen.hpp\"\n\n#include <nlohmann/json.hpp>\n\nnamespace aolib {\n\nconst std::map<std::string, nlohmann::ordered_json>& spec_schemas() {\n    static const std::map<std::string, nlohmann::ordered_json> schemas = {\n";

    auto emit_one = [&](const fs::path& file, const std::string& id) {
        std::string raw = read_file(file);
        out += "        {" + cpp_string_literal(id) + ", nlohmann::ordered_json::parse(R\"AOLIB(" + raw + ")AOLIB\")},\n";
    };

    fs::path types_dir = meta / "types";
    for (const auto& name : list_schema_files(types_dir)) {
        ordered_json s = ordered_json::parse(read_file(types_dir / (name + ".schema.json")));
        emit_one(types_dir / (name + ".schema.json"), s.value("$id", "/types/" + name + ".schema.json"));
    }
    fs::path pkts = meta / "packets" / "schemas";
    for (const auto& name : list_schema_files(pkts)) {
        ordered_json s = ordered_json::parse(read_file(pkts / (name + ".schema.json")));
        emit_one(pkts / (name + ".schema.json"), s.value("$id", "/packets/schemas/" + name + ".schema.json"));
    }

    out += "    };\n    return schemas;\n}\n\n}  // namespace aolib\n";
    return out;
}

}  // namespace

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main(int argc, char** argv) {
    try {
        std::string meta_dir = "../spec";
        std::string out_dir = ".";
        for (int i = 1; i < argc; ++i) {
            std::string a = argv[i];
            if (a == "-meta" && i + 1 < argc) meta_dir = argv[++i];
            else if (a == "-out" && i + 1 < argc) out_dir = argv[++i];
            else { std::cerr << "usage: aolib-gen -meta <spec dir> -out <dir>\n"; return 1; }
        }

        Model m = load_model(meta_dir);
        fs::path out = out_dir;
        fs::path inc = out / "include" / "aolib";
        fs::path src = out / "src";
        fs::create_directories(inc);
        fs::create_directories(src);

        write_file(inc / "enums_gen.hpp", emit_enums(m));
        write_file(inc / "types_gen.hpp", emit_types(m));
        write_file(inc / "packets_gen.hpp", emit_packets_header(m));
        write_file(src / "packets_gen.cpp", emit_packets_cpp(m));
        write_file(inc / "registry_gen.hpp", emit_registry_header());
        write_file(src / "registry_gen.cpp", emit_registry_cpp(m));
        write_file(inc / "session_server_gen.hpp", emit_session_gen(m, "server"));
        write_file(inc / "session_client_gen.hpp", emit_session_gen(m, "client"));
        write_file(inc / "schemas_gen.hpp", emit_schemas_header());
        write_file(src / "schemas_gen.cpp", emit_schemas_cpp(m, meta_dir));
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "aolib-gen: " << e.what() << "\n";
        return 1;
    }
}










