#include "doctest/doctest.h"

#include <filesystem>
#include <fstream>
#include <map>
#include <set>
#include <string>

#include <nlohmann/json.hpp>

#include "aolib/aolib.hpp"
#include "aolib/registry_gen.hpp"

namespace fs = std::filesystem;

namespace {

std::set<std::string> reg_keys(const std::map<std::string, aolib::FantaDecoder>& m) {
    std::set<std::string> out;
    for (const auto& [k, v] : m) out.insert(k);
    return out;
}

std::set<std::string> json_keys(const std::map<std::string, aolib::JsonDecoder>& m) {
    std::set<std::string> out;
    for (const auto& [k, v] : m) out.insert(k);
    return out;
}

}  // namespace

TEST_CASE("dispatch registries cover the spec exactly") {
    std::set<std::string> want_c2s, want_s2c;
    for (const char* dir : {"../../spec/packets/schemas", "../spec/packets/schemas", "spec/packets/schemas"}) {
        if (fs::exists(dir)) {
            for (const auto& e : fs::directory_iterator(dir)) {
                if (e.path().extension() != ".json") continue;
                std::ifstream in(e.path());
                nlohmann::json s;
                in >> s;
                std::string h = s["properties"]["$header"]["const"];
                std::string r = s.value("x-receiver", "");
                if (r == "server") want_c2s.insert(h);
                else if (r == "client") want_s2c.insert(h);
            }
            break;
        }
    }
    REQUIRE(!want_c2s.empty());

    CHECK(reg_keys(aolib::c2s_decoders) == want_c2s);
    CHECK(reg_keys(aolib::s2c_decoders) == want_s2c);
    CHECK(json_keys(aolib::c2s_json) == want_c2s);
    CHECK(json_keys(aolib::s2c_json) == want_s2c);
}

TEST_CASE("every New packet constructor is registered") {
    // packet_constructors is keyed by schema name (e.g. MSToClient).
    CHECK(aolib::packet_constructors.count("MSToClient") == 1);
    CHECK(aolib::packet_constructors.count("HI") == 1);
    CHECK(aolib::packet_constructors.count("ARUP") == 1);
}
