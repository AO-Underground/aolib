#pragma once

#include <any>
#include <string>

#include "aolib/outgoing.hpp"

namespace aolib {

// Encode a typed packet to its wire form (throws Error/ValidationError).
std::string encode(const Outgoing& p, WireMode mode);

// Decode a frame in the client->server direction; unknown headers fall back
// to a raw Packet. Returns std::any holding a std::shared_ptr<Outgoing> (or
// a Packet for unknown headers).
std::any decode(const std::string& raw, WireMode mode);
std::any decode_to_server(const std::string& raw, WireMode mode);
std::any decode_to_client(const std::string& raw, WireMode mode);

// Re-encode a value returned by decode (a shared_ptr<Outgoing>, or a Packet).
std::string encode_decoded(const std::any& pkt, WireMode mode);

// Read a frame's header without fully decoding its body.
std::string read_header(const std::string& raw);

// Validate a typed packet against its spec schema (throws ValidationError).
void validate_packet(const Outgoing& p);

// Validate a JSON envelope value against a packet schema (internal; throws
// ValidationError). Exposed for the generated registry and custom packets.
void validate_json_value(const std::string& schema_path, const std::string& header,
                         const nlohmann::json& value);

// Decode a JSON frame into a default-constructed typed packet (throws).
void decode_json_into(Outgoing& p, const std::string& raw);

}  // namespace aolib
