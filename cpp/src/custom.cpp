#include "aolib/custom.hpp"

#include <algorithm>
#include <map>
#include <sstream>
#include <string>
#include <vector>

#include <nlohmann/json-schema.hpp>

#include "aolib/error.hpp"
#include "aolib/fanta.hpp"
#include "aolib/registry_gen.hpp"
#include "aolib/schemas_gen.hpp"

using nlohmann::json_uri;
using nlohmann::json_schema::json_validator;
using nlohmann::json_schema::schema_loader;

namespace aolib {

namespace {

struct CustomPacket {
    std::string header;
    nlohmann::ordered_json schema;  // null when JSON-only
    FantaForm fanta;
    JsonForm json;
};

std::map<std::string, CustomPacket>& registry() {
    static std::map<std::string, CustomPacket> r;
    return r;
}

bool is_spec_header(const std::string& h) {
    return c2s_decoders.count(h) != 0 || s2c_decoders.count(h) != 0;
}

std::string json_type(const nlohmann::ordered_json& s) {
    if (s.contains("type")) {
        if (s["type"].is_string()) return s["type"].get<std::string>();
        if (s["type"].is_array() && !s["type"].empty() && s["type"][0].is_string()) return s["type"][0].get<std::string>();
    }
    return "";
}

std::string resolve_path(const std::string& ref, const std::string& base) {
    if (base.empty()) return ref;
    if (!ref.empty() && ref[0] == '/') return ref;
    std::string combined = base.substr(0, base.find_last_of('/') + 1) + ref;
    std::vector<std::string> parts;
    std::stringstream ss(combined);
    std::string seg;
    while (std::getline(ss, seg, '/')) {
        if (seg == "..") { if (!parts.empty()) parts.pop_back(); }
        else if (seg != "." && !seg.empty()) parts.push_back(seg);
    }
    std::string out = "/";
    for (std::size_t i = 0; i < parts.size(); ++i) { if (i) out += "/"; out += parts[i]; }
    return out;
}

nlohmann::ordered_json resolve_ref(const nlohmann::ordered_json& s, const std::string& base) {
    if (!s.contains("$ref")) return s;
    std::string resolved = resolve_path(s["$ref"].get<std::string>(), base);
    auto it = spec_schemas().find(resolved);
    if (it != spec_schemas().end()) {
        nlohmann::ordered_json merged = it->second;
        for (auto& [k, v] : s.items()) if (k != "$ref") merged[k] = v;
        return merged;
    }
    return s;
}

std::string encode_token(const nlohmann::ordered_json& raw, const nlohmann::json& v, const std::string& base) {
    nlohmann::ordered_json s = resolve_ref(raw, base);
    if (s.contains("const")) return s["const"].is_string() ? s["const"].get<std::string>() : s["const"].dump();
    if (s.contains("enum") && s.contains("x-wire-ints")) {
        for (std::size_t i = 0; i < s["enum"].size(); ++i) {
            if (s["enum"][i].get<std::string>() == v.get<std::string>()) return std::to_string(s["x-wire-ints"][i].get<int>());
        }
        throw Error("fanta: value is not a member of the enum");
    }
    std::string t = json_type(s);
    if (t == "string") return escape_fanta(v.is_string() ? v.get<std::string>() : v.dump());
    if (t == "number" || t == "integer") return std::to_string(v.get<int>());
    if (t == "boolean") return bool_to_wire(v.get<bool>());
    if (t == "object") {
        if (s.contains("x-wire-bits")) {
            int n = 0;
            std::size_t i = 0;
            for (auto& [k, sub] : s["properties"].items()) {
                if (v.contains(k) && v[k].get<bool>()) n |= s["x-wire-bits"][i].get<int>();
                ++i;
            }
            return std::to_string(n);
        }
        std::string sep = s.value("x-fanta-separator", "&");
        std::string out;
        bool first = true;
        for (auto& [k, sub] : s["properties"].items()) {
            if (!first) out += sep;
            first = false;
            out += encode_token(sub, v.contains(k) ? v[k] : nlohmann::json(nullptr), base);
        }
        if (sep == "|" && out.find_first_not_of('|') == std::string::npos) return "";
        return out;
    }
    return v.dump();
}

nlohmann::json decode_token(const nlohmann::ordered_json& raw, const std::string& tok, const std::string& base) {
    nlohmann::ordered_json s = resolve_ref(raw, base);
    if (s.contains("const")) return s["const"];
    if (s.contains("enum") && s.contains("x-wire-ints")) {
        int n = parse_wire_int(tok, "enum");
        for (std::size_t i = 0; i < s["x-wire-ints"].size(); ++i) {
            if (s["x-wire-ints"][i].get<int>() == n) return s["enum"][i];
        }
        throw Error("Invalid enum wire value: " + tok);
    }
    std::string t = json_type(s);
    if (t == "string") return unescape_fanta(tok);
    if (t == "number" || t == "integer") return parse_wire_int(tok, "number");
    if (t == "boolean") return parse_wire_bool(tok, "boolean");
    if (t == "object") {
        if (s.contains("x-wire-bits")) {
            int n = parse_wire_int(tok, "bitfield");
            nlohmann::ordered_json obj = nlohmann::ordered_json::object();
            std::size_t i = 0;
            for (auto& [k, sub] : s["properties"].items()) {
                obj[k] = (n & s["x-wire-bits"][i].get<int>()) != 0;
                ++i;
            }
            return obj;
        }
        if (tok.empty() && s.contains("default")) return s["default"];
        std::string sep = s.value("x-fanta-separator", "&");
        std::string t2 = tok;
        if (s.value("x-fanta-unescape-amp", false)) {
            std::size_t pos = 0;
            while ((pos = t2.find("<and>", pos)) != std::string::npos) { t2.replace(pos, 5, "&"); pos += 1; }
        }
        auto parts = split_on(t2, sep[0], static_cast<int>(s["properties"].size()));
        nlohmann::ordered_json obj = nlohmann::ordered_json::object();
        std::size_t i = 0;
        for (auto& [k, sub] : s["properties"].items()) {
            if (i < parts.size()) obj[k] = decode_token(sub, parts[i], base);
            else if (sub.contains("default")) obj[k] = sub["default"];
            ++i;
        }
        return obj;
    }
    return tok;
}

}  // namespace

namespace {

std::vector<std::string> to_fanta_args(const nlohmann::ordered_json& schema, const nlohmann::json& packet) {
    std::string base = schema.value("$id", "");
    std::vector<std::string> args;
    for (auto& [k, sub] : schema["properties"].items()) {
        if (k == "$header") continue;
        if (sub.value("x-fanta-suffix-of", "") != "") continue;
        if (json_type(sub) == "array") {
            for (const auto& item : packet.value(k, nlohmann::json::array())) {
                args.push_back(encode_token(sub["items"], item, base));
            }
            continue;
        }
        args.push_back(encode_token(sub, packet.value(k, nlohmann::json(nullptr)), base));
    }
    return args;
}

nlohmann::json from_fanta_args(const nlohmann::ordered_json& schema, const std::vector<std::string>& args) {
    std::string base = schema.value("$id", "");
    nlohmann::ordered_json result = nlohmann::ordered_json::object();
    std::size_t cursor = 0;
    for (auto& [k, sub] : schema["properties"].items()) {
        if (k == "$header") continue;
        if (sub.value("x-fanta-suffix-of", "") != "") continue;
        if (json_type(sub) == "array") {
            nlohmann::ordered_json arr = nlohmann::ordered_json::array();
            for (std::size_t i = cursor; i < args.size(); ++i) arr.push_back(decode_token(sub["items"], args[i], base));
            result[k] = arr;
            cursor = args.size();
            continue;
        }
        if (cursor < args.size()) result[k] = decode_token(sub, args[cursor], base);
        ++cursor;
    }
    return result;
}

void apply_defaults(const nlohmann::ordered_json& schema, nlohmann::ordered_json& obj, const std::string& base) {
    if (!schema.contains("properties")) return;
    for (auto& [k, sub] : schema["properties"].items()) {
        if (k == "$header") continue;
        nlohmann::ordered_json rs = resolve_ref(sub, base);
        if (!obj.contains(k) && rs.contains("default")) obj[k] = rs["default"];
    }
}

nlohmann::ordered_json order_json(const nlohmann::ordered_json& schema, const nlohmann::json& obj, const std::string& base) {
    nlohmann::ordered_json out = nlohmann::ordered_json::object();
    if (schema.contains("properties")) {
        for (auto& [k, sub] : schema["properties"].items()) {
            if (k == "$header") continue;
            if (obj.contains(k)) out[k] = obj[k];
        }
    }
    return out;
}

void validate_custom(const nlohmann::ordered_json& schema, const std::string& header, const nlohmann::json& value) {
    schema_loader loader = [&](const json_uri& id, nlohmann::json& v) {
        std::string key = id.path();
        auto sit = spec_schemas().find(key);
        if (sit == spec_schemas().end()) {
            std::string loc = id.location();
            auto pos = loc.find("://");
            if (pos != std::string::npos) loc = loc.substr(pos + 3);
            if (!loc.empty() && loc[0] != '/') { auto slash = loc.find('/'); loc = slash == std::string::npos ? ("/" + loc) : loc.substr(slash); }
            sit = spec_schemas().find(loc);
        }
        if (sit != spec_schemas().end()) { v = nlohmann::json(sit->second); return; }
        if (key == schema.value("$id", "") || id.location() == schema.value("$id", "")) { v = nlohmann::json(schema); return; }
        throw std::runtime_error("aolib: unknown schema ref '" + id.location() + "'");
    };
    json_validator val(loader, nullptr, nullptr);
    val.set_root_schema(nlohmann::json(schema));
    try {
        val.validate(value);
    } catch (const std::exception& e) {
        throw ValidationError(header, e.what());
    }
}

}  // namespace

void register_packet(const std::string& header, const PacketOptions& options) {
    if (is_spec_header(header)) {
        throw Error("aolib: '" + header + "' is a spec packet; add fields to it with $extras");
    }
    CustomPacket cp;
    cp.header = header;
    cp.fanta = options.fanta;
    cp.json = options.json;
    if (!options.schema.is_null()) {
        nlohmann::ordered_json schema = options.schema;
        std::string declared;
        if (schema.contains("properties") && schema["properties"].contains("$header") &&
            schema["properties"]["$header"].contains("const")) {
            declared = schema["properties"]["$header"]["const"].get<std::string>();
        }
        if (!declared.empty() && declared != header) {
            throw Error("aolib: schema for '" + header + "' declares $header " + declared);
        }
        schema["$id"] = "/packets/schemas/" + header + ".schema.json";
        schema["title"] = header;
        if (!schema.contains("properties")) schema["properties"] = nlohmann::ordered_json::object();
        schema["properties"]["$header"] = nlohmann::ordered_json{{"type", "string"}, {"const", header}};
        cp.schema = schema;
    }
    registry()[header] = cp;
}

std::string encode_custom(const std::string& header, const nlohmann::json& payload, WireMode mode) {
    auto it = registry().find(header);
    if (it == registry().end()) throw Error("aolib: '" + header + "' is not registered; call registerPacket first");
    const CustomPacket& c = it->second;

    if (mode == WireMode::json && c.json.encode) {
        return "{\"$header\":\"" + header + "\"," + c.json.encode(payload).substr(1);
    }
    if (mode == WireMode::fanta && c.fanta.encode) {
        auto args = c.fanta.encode(payload);
        std::string out = header;
        for (const auto& a : args) { out += '#'; out += a; }
        out += "#%";
        return out;
    }
    if (!c.schema.is_null()) {
        std::string base = "/packets/schemas/" + header + ".schema.json";
        nlohmann::ordered_json full = payload;
        full["$header"] = header;
        apply_defaults(c.schema, full, base);
        if (mode == WireMode::fanta) {
            auto args = to_fanta_args(c.schema, full);
            std::string out = header;
            for (const auto& a : args) { out += '#'; out += a; }
            out += "#%";
            return out;
        }
        validate_custom(c.schema, header, nlohmann::json(full));
        nlohmann::ordered_json obj = nlohmann::ordered_json::object();
        obj["$header"] = header;
        for (auto& [k, v] : order_json(c.schema, full, base).items()) obj[k] = v;
        return obj.dump();
    }
    if (mode == WireMode::fanta) {
        throw Error("aolib: '" + header + "' is JSON-only and this session is in FantaCode mode");
    }
    nlohmann::ordered_json out = nlohmann::ordered_json::object();
    out["$header"] = header;
    for (auto& [k, v] : payload.items()) out[k] = v;
    return out.dump();
}

std::optional<nlohmann::json> decode_custom(const std::string& header, const std::string& wire) {
    auto it = registry().find(header);
    if (it == registry().end()) return std::nullopt;
    const CustomPacket& c = it->second;
    bool is_json = !wire.empty() && wire[0] == '{';

    if (is_json && c.json.decode) return c.json.decode(wire);
    if (!is_json && c.fanta.decode) {
        std::string trimmed = wire;
        if (!trimmed.empty() && trimmed.back() == '%') trimmed.pop_back();
        std::string rest = trimmed.substr(header.size());
        if (!rest.empty() && rest[0] == '#') rest = rest.substr(1);
        std::vector<std::string> args;
        std::stringstream ss(rest);
        std::string seg;
        while (std::getline(ss, seg, '#')) args.push_back(seg);
        return c.fanta.decode(args);
    }
    if (!c.schema.is_null()) {
        std::string base = "/packets/schemas/" + header + ".schema.json";
        nlohmann::ordered_json full;
        if (is_json) {
            full = nlohmann::ordered_json::parse(wire);
        } else {
            std::string trimmed = wire;
            if (!trimmed.empty() && trimmed.back() == '%') trimmed.pop_back();
            std::string rest = trimmed.substr(header.size());
            if (!rest.empty() && rest[0] == '#') rest = rest.substr(1);
            std::vector<std::string> args;
            std::stringstream ss(rest);
            std::string seg;
            while (std::getline(ss, seg, '#')) args.push_back(seg);
            full = from_fanta_args(c.schema, args);
            full["$header"] = header;
        }
        apply_defaults(c.schema, full, base);
        validate_custom(c.schema, header, nlohmann::json(full));
        return full;
    }
    if (is_json) return nlohmann::ordered_json::parse(wire);
    return std::nullopt;
}

}  // namespace aolib

