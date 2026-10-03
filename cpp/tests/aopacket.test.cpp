#include "doctest/doctest.h"
#include "aolib/aolib.hpp"

TEST_CASE("new_packet splits header and body") {
    aolib::Packet p = aolib::new_packet("MS#a#b#c");
    CHECK(p.header == "MS");
    CHECK(p.body == std::vector<std::string>{"a", "b", "c"});
}

TEST_CASE("new_packet handles empty body and trailing #") {
    aolib::Packet p = aolib::new_packet("RC");
    CHECK(p.header == "RC");
    CHECK(p.body.empty());

    p = aolib::new_packet("HI#abc#");
    CHECK(p.header == "HI");
    CHECK(p.body == std::vector<std::string>{"abc"});
}

TEST_CASE("packet_to_string frames with trailing #%") {
    aolib::Packet p;
    p.header = "MS";
    p.body = {"a", "b"};
    CHECK(aolib::packet_to_string(p) == "MS#a#b#%");
}

TEST_CASE("new_packet rejects an empty header") {
    CHECK_THROWS_AS(aolib::new_packet(""), aolib::Error);
    CHECK_THROWS_AS(aolib::new_packet("  "), aolib::Error);
}
