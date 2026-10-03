#include "doctest/doctest.h"

#include <string>
#include <vector>

#include "aolib/aolib.hpp"

TEST_CASE("session send ships fanta then JSON") {
    std::vector<std::string> sent;
    auto cfg = aolib::SessionConfig{};
    cfg.send = [&](const std::string& w) { sent.push_back(w); };

    aolib::ClientSession client(cfg);
    aolib::MSToClient ms;
    ms.character = "Phoenix";
    ms.emote = "normal";
    ms.message = "Objection!";
    ms.side = aolib::Side::def;
    ms.char_id = 1;
    client.SendMS(ms);
    client.set_json_mode(true);
    client.SendMS(ms);
    REQUIRE(sent.size() == 2);
    CHECK(sent[0].rfind("MS#", 0) == 0);
    CHECK(sent[1].rfind("{\"$header\":\"MS\"", 0) == 0);
}

TEST_CASE("session receive routes a typed handler") {
    bool got_ms = false;
    auto cfg = aolib::SessionConfig{};
    cfg.send = [&](const std::string&) {};
    aolib::ServerSession server(cfg);
    server.OnMS([&](const aolib::MSToClient& m) {
        got_ms = true;
        CHECK(m.character == "Phoenix");
    });

    aolib::MSToClient ms;
    ms.character = "Phoenix";
    ms.emote = "normal";
    ms.message = "Objection!";
    ms.side = aolib::Side::def;
    ms.char_id = 1;
    server.receive(aolib::encode(ms, aolib::WireMode::fanta));
    CHECK(got_ms);
}

TEST_CASE("session receive never throws on unknown header") {
    bool unknown = false;
    auto cfg = aolib::SessionConfig{};
    cfg.send = [&](const std::string&) {};
    cfg.on_unknown_header = [&](const std::string& h, const std::string&) { unknown = (h == "NOPE"); };
    aolib::ServerSession server(cfg);
    CHECK_NOTHROW(server.receive("NOPE#x#%"));
    CHECK(unknown);
}

