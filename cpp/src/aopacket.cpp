#include "aolib/aopacket.hpp"
#include "aolib/error.hpp"

#include <cctype>

namespace aolib {

Packet new_packet(const std::string& data) {
    std::size_t idx = data.find('#');
    Packet p;
    if (idx == std::string::npos) {
        p.header = data;
    } else {
        p.header = data.substr(0, idx);
        std::string rest = data.substr(idx + 1);
        if (!rest.empty()) {
            std::size_t start = 0;
            while (true) {
                std::size_t pos = rest.find('#', start);
                if (pos == std::string::npos) {
                    p.body.push_back(rest.substr(start));
                    break;
                }
                p.body.push_back(rest.substr(start, pos - start));
                start = pos + 1;
            }
            // Drop the empty trailing entry produced by a final '#' delimiter.
            if (p.body.size() > 1 && p.body.back().empty()) p.body.pop_back();
        }
    }
    // Header must be non-empty (mirrors Go's NewPacket).
    bool empty = true;
    for (char c : p.header) {
        if (!std::isspace(static_cast<unsigned char>(c))) { empty = false; break; }
    }
    if (empty) throw Error("packet header cannot be empty");
    return p;
}

std::string packet_to_string(const Packet& p) {
    std::string out = p.header;
    for (const auto& s : p.body) {
        out += '#';
        out += s;
    }
    out += "#%";
    return out;
}

}  // namespace aolib
