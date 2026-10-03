#pragma once

#include <functional>
#include <optional>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

#include "aolib/outgoing.hpp"

namespace aolib {

// FantaCode form override for a custom packet.
struct FantaForm {
    std::function<std::vector<std::string>(const nlohmann::json&)> encode;
    std::function<nlohmann::json(const std::vector<std::string>&)> decode;
};

// JSON form override for a custom packet.
struct JsonForm {
    std::function<std::string(const nlohmann::json&)> encode;
    std::function<nlohmann::json(const std::string&)> decode;
};

// Options for a header the spec does not define.
struct PacketOptions {
    nlohmann::ordered_json schema;  // null when JSON-only
    FantaForm fanta;
    JsonForm json;
};

// Register a header the spec does not define. Throws for a spec header.
void register_packet(const std::string& header, const PacketOptions& options = {});

// Encode a registered custom packet. Throws if it has no form for `mode`.
std::string encode_custom(const std::string& header, const nlohmann::json& payload, WireMode mode);

// Decode a frame for a registered custom packet; nullopt when unregistered.
std::optional<nlohmann::json> decode_custom(const std::string& header, const std::string& wire);

}  // namespace aolib
