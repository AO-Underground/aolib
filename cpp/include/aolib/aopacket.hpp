#pragma once

#include <string>
#include <vector>

namespace aolib {

// A raw AO2 network packet: a non-empty header followed by '#'-separated
// body fields (the trailing '%' terminator is owned by the framing layer).
struct Packet {
    std::string header;
    std::vector<std::string> body;
};

// Parse a wire frame body (without the trailing '%') into a Packet.
// Throws Error on an empty header.
Packet new_packet(const std::string& data);

// Render a Packet as "HEADER#a#b#%".
std::string packet_to_string(const Packet& p);

}  // namespace aolib
