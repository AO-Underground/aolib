#include "doctest/doctest.h"

#include <fstream>
#include <sstream>
#include <string>

#include <nlohmann/json.hpp>

#include "aolib/aolib.hpp"

namespace {

std::string read_file(const std::string& path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) return "";
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

nlohmann::ordered_json load_vectors() {
    for (const char* p : {"../../conformance/vectors.json", "../conformance/vectors.json", "conformance/vectors.json"}) {
        std::string raw = read_file(p);
        if (!raw.empty()) return nlohmann::ordered_json::parse(raw);
    }
    return nlohmann::ordered_json::array();
}

}  // namespace

TEST_CASE("conformance vectors decode and re-encode byte-identically") {
    nlohmann::ordered_json vectors = load_vectors();
    REQUIRE(!vectors.empty());

    for (const auto& v : vectors) {
        std::string header = v["header"].get<std::string>();
        std::string receiver = v["receiver"].get<std::string>();
        std::string fanta = v["fanta"].get<std::string>();
        std::string json = v["json"].dump();  // ordered_json preserves the spec's key order
        CAPTURE(header);

        auto decode = [&](const std::string& raw, aolib::WireMode m) {
            return receiver == "server" ? aolib::decode_to_server(raw, m) : aolib::decode_to_client(raw, m);
        };

        std::any from_fanta = decode(fanta, aolib::WireMode::fanta);
        std::any from_json = decode(json, aolib::WireMode::json);

        CHECK(aolib::encode_decoded(from_fanta, aolib::WireMode::fanta) == fanta);
        CHECK(aolib::encode_decoded(from_json, aolib::WireMode::json) == json);
        // Cross-wire: both decodes yield the same packet.
        CHECK(aolib::encode_decoded(from_fanta, aolib::WireMode::json) == json);
        CHECK(aolib::encode_decoded(from_json, aolib::WireMode::fanta) == fanta);
    }
}
