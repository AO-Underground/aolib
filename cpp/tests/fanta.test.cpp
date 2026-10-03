#include "doctest/doctest.h"
#include "aolib/aolib.hpp"

using aolib::escape_fanta;
using aolib::unescape_fanta;

TEST_CASE("escape_fanta escapes chat metacharacters") {
    CHECK(escape_fanta("#&%$") == "<num><and><percent><dollar>");
    CHECK(escape_fanta("Objection! &%$") == "Objection! <and><percent><dollar>");
}

TEST_CASE("unescape_fanta inverts escape_fanta") {
    const std::string s = "a#b&c%d$e";
    CHECK(unescape_fanta(escape_fanta(s)) == s);
}

TEST_CASE("escape/unescape round-trips") {
    for (const std::string& s : {"", "plain", "a#b", "a&b", "a%b", "a$b", "#&%$#&%$"}) {
        CHECK(unescape_fanta(escape_fanta(s)) == s);
    }
}

TEST_CASE("split_amp splits at most n fields, honoring <and> escapes") {
    CHECK(aolib::split_amp("a&b&c", 3) == std::vector<std::string>{"a", "b", "c"});
    CHECK(aolib::split_amp("a&b&c", 2) == std::vector<std::string>{"a", "b&c"});
    CHECK(aolib::split_amp("a<and>b", 2) == std::vector<std::string>{"a<and>b"});
}

TEST_CASE("split_caret splits a ^suffix slot") {
    CHECK(aolib::split_caret("4^1") == std::make_pair(std::string("4"), std::string("1")));
    CHECK(aolib::split_caret("-1") == std::make_pair(std::string("-1"), std::string("")));
}
