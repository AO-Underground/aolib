#include "aolib/wire.hpp"

#include <algorithm>
#include <map>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include <nlohmann/json-schema.hpp>

#include "aolib/aopacket.hpp"
#include "aolib/error.hpp"
#include "aolib/registry_gen.hpp"
#include "aolib/schemas_gen.hpp"

using nlohmann::json_uri;
using nlohmann::json_schema::json_validator;
using nlohmann::json_schema::schema_loader;
using nlohmann::ordered_json;

namespace aolib {

namespace {

ordered_json parse_json_wire(const std::string& raw) {
    try {
        return ordered_json::parse(raw);
    } catch (const std::exception& e) {
        throw Error(std::string("Invalid JSON wire: ") + e.what());
    }
}

std::string json_header(const ordered_json& obj) {
    if (obj.contains("$header") && obj["$header"].is_string()) return obj["$header"].get<std::string>();
    if (obj.contains("header") && obj["header"].is_string()) return obj["header"].get<std::string>();
    throw Error("JSON envelope missing $header string");
}

std::string frame_fanta(const std::string& header, const std::vector<std::string>& args) {
    std::string out = header;
    for (const auto& a : args) { out += '#'; out += a; }
    out += "#%";
    return out;
}

ordered_json build_envelope(const Outgoing& p) {
    ordered_json out;
    out["$header"] = p.header();
    ordered_json fields = p.to_json_object();
    auto consts = p.json_consts();
    for (const auto& k : p.json_order()) {
        auto cit = consts.find(k);
        if (cit != consts.end()) out[k] = cit->second;
        else if (fields.contains(k)) out[k] = fields[k];
    }
    return out;
}

void append_extras(const Outgoing& p, ordered_json& out) {
    const nlohmann::json* e = p.extras_ptr();
    if (!e || e->is_null() || e->empty()) return;
    auto order = p.json_order();
    auto consts = p.json_consts();
    for (const auto& [k, v] : e->items()) {
        bool schema_key = consts.count(k) != 0 ||
                          std::find(order.begin(), order.end(), k) != order.end();
        if (schema_key || (!k.empty() && k[0] == '$')) {
            throw Error("encode: Extras key '" + k + "' collides with a schema field or reserved name");
        }
        out[k] = v;
    }
}

}  // namespace

std::string encode(const Outgoing& p, WireMode mode) {
    if (mode == WireMode::fanta) {
        validate_packet(p);
        return frame_fanta(p.header(), p.args());
    }
    ordered_json envelope = build_envelope(p);
    validate_json_value(p.schema_path(), p.header(), nlohmann::json(envelope));
    append_extras(p, envelope);
    return envelope.dump();
}

std::string read_header(const std::string& raw) {
    if (!raw.empty() && raw[0] == '{') {
        return json_header(parse_json_wire(raw));
    }
    std::size_t idx = raw.find('#');
    return idx == std::string::npos ? raw : raw.substr(0, idx);
}

namespace {

std::any decode_fanta(const std::string& raw, const std::map<std::string, FantaDecoder>& decoders) {
    std::string trimmed = raw;
    if (!trimmed.empty() && trimmed.back() == '%') trimmed.pop_back();
    Packet pkt = new_packet(trimmed);
    auto it = decoders.find(pkt.header);
    if (it == decoders.end()) return std::any{pkt};
    return it->second(pkt.body);
}

std::any decode_json(const std::string& raw, const std::map<std::string, JsonDecoder>& decoders) {
    ordered_json obj = parse_json_wire(raw);
    std::string header = json_header(obj);
    auto it = decoders.find(header);
    if (it == decoders.end()) return std::any{Packet{header, {}}};
    return it->second(raw);
}

}  // namespace

std::any decode_to_server(const std::string& raw, WireMode mode) {
    return mode == WireMode::json ? decode_json(raw, c2s_json) : decode_fanta(raw, c2s_decoders);
}

std::any decode_to_client(const std::string& raw, WireMode mode) {
    return mode == WireMode::json ? decode_json(raw, s2c_json) : decode_fanta(raw, s2c_decoders);
}

std::any decode(const std::string& raw, WireMode mode) { return decode_to_server(raw, mode); }

std::string encode_decoded(const std::any& pkt, WireMode mode) {
    if (pkt.type() == typeid(Packet)) {
        return packet_to_string(std::any_cast<Packet>(pkt));
    }
    auto sp = std::any_cast<std::shared_ptr<Outgoing>>(pkt);
    return encode(*sp, mode);
}

namespace {

// Normalize a URI path: resolve "." and ".." segments.
std::string normalize_path(const std::string& path) {
    std::vector<std::string> parts;
    std::stringstream ss(path);
    std::string seg;
    while (std::getline(ss, seg, '/')) {
        if (seg == "..") { if (!parts.empty()) parts.pop_back(); }
        else if (seg != "." && !seg.empty()) parts.push_back(seg);
    }
    std::string out = "/";
    for (std::size_t i = 0; i < parts.size(); ++i) { if (i) out += "/"; out += parts[i]; }
    return out;
}

// Loader that resolves the spec's absolute-path $ids (/packets/..., /types/...)
// against the inlined schemas.
json_validator make_validator(const std::string& schema_path) {
    const auto& schemas = spec_schemas();
    schema_loader loader = [&schemas](const json_uri& id, nlohmann::json& value) {
        std::string key = normalize_path(id.path());
        auto it = schemas.find(key);
        if (it == schemas.end()) {
            std::string loc = normalize_path(id.location());
            auto pos = loc.find("://");
            if (pos != std::string::npos) loc = loc.substr(pos + 3);
            if (!loc.empty() && loc[0] != '/') {
                auto slash = loc.find('/');
                loc = slash == std::string::npos ? ("/" + loc) : loc.substr(slash);
            }
            it = schemas.find(loc);
        }
        if (it == schemas.end()) {
            throw std::runtime_error("aolib: unknown schema ref '" + id.location() + "'");
        }
        value = nlohmann::json(it->second);
    };
    json_validator v(loader, nullptr, nullptr);
    auto root = schemas.find(schema_path);
    if (root == schemas.end()) throw std::runtime_error("aolib: unknown schema " + schema_path);
    v.set_root_schema(nlohmann::json(root->second));
    return v;
}

const json_validator& get_validator(const std::string& schema_path) {
    static std::map<std::string, std::unique_ptr<json_validator>> cache;
    auto it = cache.find(schema_path);
    if (it == cache.end()) {
        it = cache.emplace(schema_path, std::make_unique<json_validator>(make_validator(schema_path))).first;
    }
    return *it->second;
}

}  // namespace

void validate_json_value(const std::string& schema_path, const std::string& header,
                         const nlohmann::json& value) {
    try {
        get_validator(schema_path).validate(value);
    } catch (const std::exception& e) {
        throw ValidationError(header, e.what());
    }
}

void validate_packet(const Outgoing& p) {
    ordered_json envelope = build_envelope(p);
    validate_json_value(p.schema_path(), p.header(), nlohmann::json(envelope));
}

void decode_json_into(Outgoing& p, const std::string& raw) {
    ordered_json obj = parse_json_wire(raw);
    std::string header = json_header(obj);
    if (header != p.header()) {
        throw Error("Wire header mismatch: expected '" + p.header() + "', got '" + header + "'");
    }

    auto order = p.json_order();
    auto consts = p.json_consts();
    ordered_json fields;
    nlohmann::json extras = nlohmann::json::object();
    for (auto it = obj.begin(); it != obj.end(); ++it) {
        const std::string& k = it.key();
        if (k == "$header" || k == "header") continue;
        if (std::find(order.begin(), order.end(), k) != order.end() || consts.count(k)) {
            fields[k] = it.value();
        } else {
            extras[k] = nlohmann::json(it.value());
        }
    }

    for (const auto& [k, v] : consts) {
        if (!fields.contains(k)) fields[k] = v;
    }

    ordered_json envelope;
    envelope["$header"] = p.header();
    for (const auto& k : order) {
        if (consts.count(k)) envelope[k] = consts.at(k);
        else if (fields.contains(k)) envelope[k] = fields[k];
    }
    validate_json_value(p.schema_path(), p.header(), nlohmann::json(envelope));

    p.from_json_object(fields);
    if (!extras.empty()) *p.extras_ptr() = extras;
}

}  // namespace aolib

